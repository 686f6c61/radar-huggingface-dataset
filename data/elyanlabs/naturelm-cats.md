# elyanlabs/naturelm-cats

## Resumen

`naturelm-cats` es un repositorio alojado en Hugging Face por elyanlabs que contiene el código de un *soft fork* de NatureLM-audio, el modelo bioacústico del Earth Species Project. El fork añade un flujo de trabajo específico para vocalizaciones de gato doméstico: por un lado, un puente entre NatureLM-audio y GPT-OSS-20B ejecutado con `llama-server`; por otro, un clasificador de contexto entrenado sobre características BEATs del dataset CatMeows (Ludovico et al., 2020) que distingue tres situaciones: cepillado (*brushing*), aislamiento (*isolation*) y espera de comida (*waiting_for_food*).

El problema que aborda es la genericidad de las descripciones bioacústicas: NatureLM-audio produce leyendas del tipo «Domestic cats vocalizing.», sin información conductual accionable. El fork mantiene intacto el modelo upstream (BEATs + Q-Former + Llama-3.1-8B + LoRA) y le superpone una cabeza MLP ligera y un razonador de mayor tamaño, de modo que la salida final es un análisis conductual estructurado con calibración de confianza explícita.

Es relevante ahora por dos motivos: demuestra que un razonador MoE de ~20B puede operar en una GPU de consumo de 8 GB (RTX 4070 Laptop) delegando los pesos de expertos en RAM del sistema, y documenta un patrón de diseño modular (modelo de dominio congelado + cabeza específica + LLM razonador) como alternativa barata al *fine-tuning* del proyector audio→LLM. Conviene subrayar que el repositorio de Hugging Face pesa 0,0 GB y contiene únicamente código: no se distribuyen pesos ni se ejecuta nada en la infraestructura de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de tres etapas: NatureLM-audio (BEATs + Q-Former + Llama-3.1-8B con LoRA) para leyendas bioacústicas; encoder BEATs + pooling estadístico (media+std+máx) + cabeza MLP para clasificación de contexto; GPT-OSS-20B (MoE) como razonador final vía `llama-server` |
| Parámetros totales | No disponible como cifra agregada. Componentes declarados: Llama-3.1-8B en NatureLM-audio, GPT-OSS-20B (~20B) como razonador y ~200K parámetros entrenables en la cabeza MLP |
| Parámetros activos | GPT-OSS-20B: ~3,6B por token (MoE). Resto de componentes: no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GPT-OSS-20B en Q4_K_M (GGUF) mediante `llama.cpp`; NatureLM-audio y el clasificador se ejecutan en CPU sin cuantización declarada |
| Idiomas soportados | No disponible. Los prompts y las consultas del pipeline están en inglés; no se declara soporte multilingüe |
| Licencia | MIT para el código del repositorio; el autor advierte de restricciones de licencia de los modelos y datos upstream (NatureLM-audio, CatMeows) sin detallarlas |
| Formato de pesos | El repositorio no incluye pesos (0,0 GB, solo código). Pesos de terceros: GPT-OSS-20B en GGUF Q4_K_M; NatureLM-audio desde su repositorio upstream |

## Arquitectura y entrenamiento

El pipeline procesa audio en formato wav, mp3, flac u ogg por dos ramas paralelas sobre CPU. La primera invoca NatureLM-audio, que combina un encoder BEATs, un módulo Q-Former y un Llama-3.1-8B ajustado con LoRA para generar una leyenda bioacústica genérica. La segunda aplica el encoder BEATs con pooling estadístico (media, desviación típica y máximo) y una cabeza MLP entrenada que devuelve una softmax sobre tres contextos felinos. Ambas señales se fusionan y se envían a GPT-OSS-20B (Q4_K_M, `llama-server` en el puerto 9002), que produce el análisis conductual estructurado con calibración de incertidumbre sobre la distribución softmax del clasificador.

El clasificador se entrenó sobre CatMeows (276 clips, tres contextos) con validación cruzada estratificada de 5 particiones y barrido de hiperparámetros por variante de características. Las variantes evaluadas combinan características BEATs-estadísticas (2304 dimensiones), BEATs-media (768), Q-Former (768) y un conjunto clásico de 102 dimensiones (MFCC, descriptores espectrales, ZCR y RMS); la mejor configuración es la híbrida BEATs-stats + clásicas (2406 dimensiones, oculta de 128, dropout 0,0, weight decay 1e-1). La cabeza añade unos 200K parámetros entrenables. No se documentan tokens de preentrenamiento, composición del dataset más allá de CatMeows, ni fases de RLHF o DPO.

La decisión de diseño clave es el puente en lugar del *fine-tuning*: sustituir el cabezal Llama-3.1-8B de NatureLM-audio por un razonador mayor exigiría reentrenar la proyección audio→LLM, mientras que el puente preserva el prior bioacústico amplio del modelo original y añade especificidad de dominio con una cabeza minúscula. Existen tres variantes de puente: `bridge_caption.py` (solo leyenda), `bridge_with_context.py` (leyenda + probabilidades del clasificador, opción por defecto) y `bridge_multiquery.py`, que lanza tres consultas independientes a NatureLM-audio (características acústicas, emoción, frase) y permite al razonador detectar desacuerdos entre leyenda y clasificador a cambio de triplicar el coste de inferencia de audio.

## Capacidades

- Generación de leyendas bioacústicas genéricas sobre audio de múltiples especies (heredada de NatureLM-audio).
- Clasificación de contexto en vocalizaciones de gato doméstico en tres clases cerradas: cepillado, aislamiento y espera de comida.
- Razonamiento conductual estructurado sobre la combinación de leyenda y probabilidades del clasificador, con calibración explícita de confianza.
- Detección de desacuerdos entre la leyenda de NatureLM-audio y la predicción del clasificador en la variante multiquery.
- Ingesta de audio en wav, mp3, flac y ogg.
- Ejecución end-to-end en una GPU de consumo de 8 GB con el resto del pipeline en CPU.
- Soporte de *tool calling*, agentes, visión, audio generativo o modo *thinking*: no disponible / no documentado.

## Casos de uso

- Monitorización de bienestar en refugios y guarderías felinas: el clasificador etiqueta episodios de aislamiento o espera de comida y el razonador genera un informe con el nivel de confianza, lo que permite priorizar la revisión del personal sobre cientos de horas de grabación.
- Anotación asistida en investigación bioacústica: el puente por defecto produce para cada clip una leyenda y una hipótesis de contexto que sirven como preetiquetado antes de la revisión humana, reduciendo el coste de etiquetado manual de CatMeows y corpus similares.
- Analítica de cámara para mascotas en el hogar: el pipeline completo cabe en una RTX 4070 Laptop de 8 GB, de modo que puede desplegarse en un equipo local sin depender de la nube y procesar audio doméstico sin enviarlo a terceros.
- Auditoría de fiabilidad de modelos bioacústicos: la variante multiquery expone discrepancias entre leyenda y clasificador, lo que permite estudiar casos de salidas por defecto de NatureLM-audio («Distressed», «I want to be petted») y cuantificar su impacto en la conclusión final.
- Prototipado de arquitecturas modulares LLM: el repositorio documenta el patrón modelo-de-dominio congelado + cabeza ligera + razonador vía `llama-server`, reutilizable para otras especies o dominios acústicos cambiando únicamente el dataset de la cabeza.
- Triage de grandes archivos de audio: ejecutar solo la rama del clasificador en CPU (coste muy inferior al de NatureLM-audio) para seleccionar los clips con mayor probabilidad de una clase de interés antes de aplicar el pipeline completo.
- Docencia y reproducción de experimentos: los scripts de sonda (`probe_naturelm_queries.py`) y las tres variantes de puente permiten comparar de forma controlada el efecto de añadir señales independientes al razonador.

## Benchmarks y rendimiento

Clasificador de contexto felino sobre CatMeows, validación cruzada estratificada de 5 particiones sobre los 276 clips, con hiperparámetros ajustados por variante:

| Variante de características | Exactitud CV 5-fold | Mejores hiperparámetros |
|---|---|---|
| Híbrida: BEATs-stats + clásicas (2406 dim) | 82,2 % | oculta=128, dropout=0,0, wd=1e-1 |
| Solo BEATs-stats (2304 dim, media+std+máx) | 81,5 % | oculta=256, dropout=0,3, wd=1e-1 |
| Solo BEATs-media (768 dim) | 76,5 % | oculta=128, dropout=0,7, wd=1e-1 |
| Solo Q-Former (768 dim) | 73,9 % | oculta=256, dropout=0,0, wd=1e-2 |
| Solo clásicas (102 dim, MFCC+espectral+ZCR+RMS) | 72,5 % | oculta=64 (resto de hiperparámetros truncado en la información disponible) |

Rendimiento de inferencia declarado por el autor:

| Métrica | Valor | Contexto |
|---|---|---|
| Generación con GPT-OSS-20B Q4_K_M | 32 tok/s | RTX 4070 Laptop, 8 GB, `llama.cpp -ngl 12` con expertos en RAM |
| Coste del puente multiquery | ~15 s en caliente por clip (~3× el coste de audio de una consulta simple) | NatureLM-audio en CPU, tres consultas por clip |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni métricas end-to-end de calidad del razonamiento conductual en la información disponible. Las cifras de 82,2 % y del resto de variantes corresponden a validación cruzada in-distribution sobre CatMeows, no a un conjunto de test externo.

## Requisitos de hardware

- VRAM: el único punto medido es una RTX 4070 Laptop con 8 GB, suficiente para GPT-OSS-20B Q4_K_M con `-ngl 12`; los pesos de expertos se leen desde la RAM del sistema, por lo que el requisito práctico es que el GGUF completo quepa entre VRAM y memoria del sistema. La cantidad de RAM empleada no se especifica en la información disponible.
- GPU recomendadas: RTX 4070 Laptop (8 GB) verificada por el autor. No se documentan pruebas en A100, H100, RTX 4090 ni otras GPU.
- CPU: NatureLM-audio (BEATs + Q-Former + Llama-3.1-8B + LoRA) y el clasificador BEATs + MLP se ejecutan en CPU; no se indica el número de núcleos ni el tiempo de inferencia de esta rama por separado.
- Despliegue: `llama.cpp` / `llama-server` para el razonador (puerto 9002 en la configuración de referencia), código propio para las ramas de audio. No se documenta soporte para vLLM, TGI, Ollama ni otras plataformas.
- Throughput y latencia: 32 tok/s de generación en la configuración medida; ~15 s por clip en caliente con el puente multiquery. La latencia del puente simple no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| naturelm-cats | Llama-3.1-8B + cabeza ~200K + GPT-OSS-20B (~3,6B activos) | No disponible | Vocalización felina (3 contextos) + razonamiento conductual | MIT (código del repo); restricciones upstream no detalladas | Repositorio HF de 0,0 GB, solo código; también en GitHub y GitLab |
| NatureLM-audio (upstream, Earth Species Project) | BEATs + Q-Former + Llama-3.1-8B + LoRA | No disponible | Leyendas bioacústicas generales multiespecie | No disponible en la información | Repositorio GitHub de Earth Species Project |
| GPT-OSS-20B (usado como razonador) | ~20B totales, ~3,6B activos (MoE) | No disponible | Razonamiento y generación de texto; sin entrada de audio | No disponible en la información | Pesos públicos en GGUF Q4_K_M |
| Clasificador BEATs + MLP de este repo | ~200K entrenables sobre 2304 dim de BEATs | No aplica | Tres contextos de CatMeows | MIT (código); CatMeows con sus propias condiciones | Solo código; los pesos del clasificador no se distribuyen en el repo HF |

No se dispone de comparaciones cuantitativas con otros sistemas de clasificación de vocalizaciones felinas ni con modelos bioacústicos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos (0,0 GB) ni artefactos ejecutables: es un espejo de código y no funciona en la infraestructura de Hugging Face. Requiere clonar el repositorio, obtener NatureLM-audio por separado y descargar GPT-OSS-20B.
- El clasificador está entrenado exclusivamente con los tres contextos de CatMeows (276 clips) y carece de clase «desconocido». En audio fuera de distribución tiende a asignar alta confianza a la clase más cercana: el propio autor documenta un 86,2 % de probabilidad en *brushing* para un clip de gato de ESC-50, que no pertenece a ninguno de los tres contextos.
- Con ~200K parámetros entrenables, la capacidad del clasificador es muy limitada; el 82,2 % es exactitud en validación cruzada in-distribution sobre un corpus pequeño, no un resultado en producción.
- NatureLM-audio produce leyendas genéricas («Domestic cats vocalizing.») y sus consultas de emoción y de frase son parcialmente ruidosas, con salidas por defecto («Distressed», «I want to be petted») que aparecen de forma inconsistente. El puente multiquery mitiga el problema, pero no lo elimina.
- El razonador GPT-OSS-20B puede alucinar interpretaciones conductuales sobre señales ambiguas; la calibración sobre la softmax del clasificador reduce el riesgo, pero no lo anula, y su calidad de razonamiento no está evaluada con métricas en la información disponible.
- Idiomas: no se declara ningún soporte multilingüe. Los prompts, las consultas a NatureLM-audio y las etiquetas están en inglés.
- Licencias: el código es MIT, pero el autor advierte explícitamente de restricciones de licencia en los modelos y datos upstream (NatureLM-audio y CatMeows). Es imprescindible verificar esas condiciones antes de cualquier uso comercial.
- Validación externa nula: 0 descargas y 0 likes en Hugging Face, y el repositorio se creó y actualizó el 2026-10-23. No hay resultados de terceros que corroboren las cifras reportadas.
- Dependencia de dos procesos y tres modelos distintos (NatureLM-audio, clasificador y `llama-server`): la superficie de fallo y la complejidad operativa son sensiblemente mayores que las de un único modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/elyanlabs/naturelm-cats
- Código fuente en GitHub: https://github.com/Scottcjn/naturelm-cats
- Espejo en GitLab (historial completo): https://gitlab.com/elyan-labs/naturelm-cats
- NatureLM-audio upstream (Earth Species Project): https://github.com/earthspecies/NatureLM-audio
- Dataset CatMeows (Ludovico et al., 2020): https://zenodo.org/records/4008297
- Certificación BCOS del repositorio: `BCOS.md` en la raíz del repositorio
- Resumen para motores de búsqueda y LLM: `llms.txt` en la raíz del repositorio
- README original preservado del upstream: `README_UPSTREAM.md` en la raíz del repositorio
- Dataset ESC-50, mencionado en la model card como ejemplo fuera de distribución: sin enlace en la información disponible
