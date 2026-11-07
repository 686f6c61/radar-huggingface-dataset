# Legend7001/ec-lookup-tree

## Resumen

`Legend7001/ec-lookup-tree` no es un modelo neuronal de lenguaje, sino un sistema de clasificación enzimática presentado como submission del proyecto DA3410 para la tarea Leak CURBER. Resuelve el problema de asignar números EC (Enzyme Commission) a secuencias proteicas combinando una búsqueda exacta en bases de datos externas (UniProt Swiss-Prot, BRENDA y TrEMBL) con una búsqueda de homología mediante MMseqs2 y un reranker basado en gradient boosting.

El pipeline funciona en cascada: si la secuencia coincide exactamente con una entrada de UniProt se devuelve su EC directamente; en caso contrario se buscan secuencias homólogas en el conjunto de entrenamiento y las EC de los hits se convierten en candidatas, que se puntúan con un pequeño modelo de árboles gradient-boosted (`rerank_hgb.joblib`) a partir de 25 características. Un bonus de familia L3 y una búsqueda de mayor sensibilidad para secuencias sin hits completan el sistema, con un guardia temporal que degrada a búsqueda barata si el evaluador es lento.

Su relevancia es metodológica más que de rendimiento: ilustra el problema de leakage en benchmarks de clasificación enzimática (UniProt contiene el 99,5% de las secuencias de validación) y muestra una arquitectura de retrieval + reranking con modelos clásicos, no neuronales. El repositorio ocupa 0,4 GB e incluye binarios estáticos de MMseqs2, la base de datos indexada y los pesos del reranker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de retrieval (lookup hash MD5/8-byte + MMseqs2) con reranker gradient boosting (HGB) |
| Parametros totales | no disponible (no es un modelo neuronal; el reranker es un HGB con 25 features) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: secuencia proteica completa; sin ventana de tokens) |
| Tipos de cuantizacion | no aplica (pesos joblib, no cuantizables como LLM) |
| Idiomas soportados | no aplica (entrada: secuencias de aminoacidos) |
| Licencia | no disponible en la model card; componentes: MMseqs2 GPLv3, vocabulario EC ExPASy CC BY 4.0 |
| Formato de pesos | joblib (`rerank_hgb.joblib`), JSON (`ext_lookup.json.gz`, `baseline.json`, `train_ecs.json`), npz (`ext_brenda.npz`, `ext_trembl.npz`), MMseqs2 DB (`db/`) |
| Tamano del repositorio | 0,4 GB |
| Dependencias | MMseqs2 (binarios estaticos AVX2 y SSE4.1 en `bin/`), Python, scikit-learn (HGB) |

## Arquitectura y entrenamiento

El sistema no entrena una red neuronal. Consta de cuatro etapas encadenadas: (1) lookup exacto contra hashes de 8 bytes de secuencias en Swiss-Prot 2026_03, BRENDA 2026.1 y TrEMBL; (2) búsqueda de homología con MMseqs2 (prefilter y align como pasos separados, 2 hilos) contra las secuencias de entrenamiento, cuyas EC forman el conjunto de candidatas; (3) reranking con un HistGradientBoosting que consume 25 features por candidata (definidas en `ecfeat.py` y `weights/rerank_features.json`) y produce una probabilidad, más un bonus de 0,75 × probabilidad sumada de candidatas de la misma familia L3; (4) fallback: búsqueda extra sensible para secuencias sin hit, y si aún no hay respuesta, la EC más frecuente del entrenamiento (`weights/baseline.json`).

Los datos de entrenamiento son las secuencias del curso con sus EC (`weights/train_ecs.json`) y longitudes (`weights/train_len.json`), indexadas en `db/` con nombres `t<row>`. La innovación técnica principal es el uso explícito de base de datos externa como atajo (con leakage declarado: el 99,5% de las secuencias de validación están en UniProt), junto con el guardia temporal que cambia a búsqueda más barata si el evaluador es lento. No hay RLHF, DPO ni datos de preferencias.

## Capacidades

- Clasificación de secuencias proteicas en clases EC (números Enzyme Commission) mediante lookup, homología y reranking.
- Lookup exacto contra Swiss-Prot, BRENDA y TrEMBL usando hashes de 8 bytes (sin almacenar secuencias completas).
- Búsqueda de homología con MMseqs2 con dos niveles de sensibilidad (estándar y extra sensible para fallback).
- Reranking de candidatas con 25 features por candidata y modelo HGB de scikit-learn.
- Bonus de familia L3 (0,75 × suma de probabilidades de la misma familia).
- Fallback a la EC más frecuente del entrenamiento para secuencias sin ninguna coincidencia.
- Guardia temporal para garantizar finalización bajo evaluadores lentos.
- Selección automática de binario MMseqs2 (AVX2 o SSE4.1) según `/proc/cpuinfo`.
- No soporta tool calling, agentes, visión, audio, thinking mode ni generación de texto libre.

## Casos de uso

- Anotación automática de proteomas: aplicar el pipeline a un FASTA completo para asignar EC a cada secuencia, delegando el lookup exacto en UniProt y el resto a MMseqs2 + reranker.
- Curación de bases de datos enzimáticas: priorizar entradas candidatas para revisión manual usando la probabilidad del HGB y el bonus de familia L3 como señal de confianza.
- Detección de errores de anotación: comparar la EC asignada por lookup con la EC predicha por homología para señalar discrepancias que ameriten revisión.
- Baseline reproducible para benchmarks de clasificación enzimática: sirve como referencia clásica (no neuronal) frente a modelos de lenguaje proteicos en tareas de tipo Leak CURBER.
- Filtrado de secuencias en pipelines de metagenómica: usar la búsqueda MMseqs2 con umbrales de sensibilidad configurables para cribar candidatas antes de un análisis más costoso.
- Enseñanza y experimentación con leakage: el sistema documenta explícitamente que el 99,5% de la validación está en UniProt, útil como caso de estudio sobre atajos de base de datos y su impacto en la evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de accuracy, F1, precision ni comparación cuantitativa con otros sistemas. Solo se declara cualitativamente el leakage: UniProt contiene el 99,5% de las secuencias de validación.

## Requisitos de hardware

- VRAM: no aplica (no hay modelo neuronal en GPU). Todo el cómputo es CPU.
- CPU: se requieren instrucciones AVX2 (preferible) o SSE4.1; el binario se selecciona automáticamente desde `/proc/cpuinfo`.
- Memoria RAM: suficiente para cargar la base de datos MMseqs2 indexada y los hashes de lookup; el repositorio completo son 0,4 GB, por lo que el pico de memoria es moderado.
- Hilos: la búsqueda MMseqs2 se ejecuta con 2 hilos según la model card.
- GPU: no se utiliza ninguna; no aplican A100, H100 ni RTX 4090.
- Opciones de despliegue: ejecución directa de `predict.py` con las dependencias del curso (`inputs.py`, `task.json`, `ec_vocabulary.json`, `ecfeat.py`) y los binarios de `bin/`.
- Latencia y throughput: no disponibles en la información proporcionada; existe un guardia temporal que degrada la búsqueda si el evaluador es lento, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni descripción de alternativas, por lo que no es posible comparar parámetros, contexto, rendimiento, licencia o disponibilidad frente a otros sistemas de clasificación enzimática. Existe un repositorio relacionado del mismo autor, `Legend7001/ec-lookup-copy`, con una model card prácticamente idéntica, y un modelo adicional `Legend7001/ec-homology-v1`, pero no se dispone de datos comparativos.

## Limitaciones y advertencias

- Leakage declarado: UniProt contiene el 99,5% de las secuencias de validación, por lo que el rendimiento en validación no refleja generalización a secuencias realmente nuevas.
- Licencia no disponible en la model card; conviene verificar antes de uso comercial. Las dependencias tienen licencias propias: MMseqs2 GPLv3 y vocabulario ExPASy CC BY 4.0.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- Dependencia de bases de datos externas (Swiss-Prot 2026_03, BRENDA 2026.1, TrEMBL): los resultados quedan ligados a la versión indexada y pueden quedar obsoletos.
- El fallback asigna la EC más frecuente del entrenamiento cuando no hay hit, lo que puede producir asignaciones incorrectas sin señal de incertidumbre explícita.
- Solo se almacenan hashes de 8 bytes de las secuencias externas; no hay verificación completa de colisiones más allá del hash.
- El bonus de familia L3 (0,75 × suma de probabilidades) es un hiperparámetro fijado manualmente, no validado en la información disponible.
- Restricción de plataforma: requiere CPU con AVX2 o SSE4.1 y binarios estáticos de MMseqs2.
- Sin métricas publicadas de precisión, recall o calibración del reranker; el umbral de confianza para producción no está documentado.
- Proyecto académico (DA3410) con 0 descargas y 0 likes; sin mantenimiento declarado.

## Enlaces

- Hugging Face: https://huggingface.co/Legend7001/ec-lookup-tree
- Repositorio relacionado del mismo autor: https://huggingface.co/Legend7001/ec-lookup-copy
- Perfil del autor: https://huggingface.co/Legend7001/models
- Paper de MMseqs2 (Steinegger and Soding, Nature Biotechnology 2017): https://www.nature.com/articles/nbt.3988
- Vocabulario EC ExPASy ENZYME (release 02-Sep-2026, SIB, CC BY 4.0): https://enzyme.expasy.org/
