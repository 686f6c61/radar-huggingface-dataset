# Flaglab/SciBETO-continual

## Resumen

SciBETO-continual es un modelo de lenguaje enmascarado (masked LM) para castellano de dominio cientifico, desarrollado por Flaglab. Se construye por preentrenamiento continuado de BERTIN (RoBERTa-base, 125M de parametros) sobre el corpus cientifico en castellano utilizado para entrenar la familia SciBETO: 1,43 millones de documentos cientificos deduplicados y 18,2 mil millones de palabras. El modelo conserva el tokenizador y vocabulario de dominio general de BERTIN, lo que lo diferencia de SciBETO-base, que comparte arquitectura y tamano pero se entreno desde cero con un tokenizador aprendido sobre texto cientifico.

El modelo se publica explicitamente como modelo de ablacion para reproducir la comparacion entre entrenamiento desde cero y preentrenamiento continuado del articulo SciBETO (EACL 2027). Sus resultados muestran que, con el mismo presupuesto de fine-tuning, las ganancias frente a BERTIN son marginales y que SciBETO-base supera a este modelo en los tres benchmarks cientificos, mientras que SciBETO-continual conserva mejor competencia en dominio general (SQAC y ESNLIR). Para uso downstream, los autores recomiendan SciBETO-base o SciBETO-large.

Es relevante ahora como referencia metodologica y como punto de partida reutilizable: comparte licencia CC BY 4.0 con BERTIN, se distribuye en safetensors y es compatible con la libreria transformers y con endpoints de inferencia. Su utilidad practica esta acotada a tareas de comprension y clasificacion en castellano cientifico, no a generacion abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder, 12 capas, hidden size 768) |
| Parametros totales | 124.695.126 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 512 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | es (castellano) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (repo de 1,5 GB, incluye estado de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder estilo RoBERTa-base: 12 capas y tamano oculto de 768, con 125M de parametros. El modelo se inicializa desde `bertin-project/bertin-roberta-base-spanish` y continua el preentrenamiento con objetivo de modelado de lenguaje enmascarado (MLM) al 15 % sobre el corpus cientifico de SciBETO (1,43M de documentos deduplicados, 18,2B de palabras). Mantiene sin cambios el tokenizador y el vocabulario de BERTIN, lo que constituye la diferencia clave frente a SciBETO-base.

El entrenamiento uso un tamano de lote efectivo de 4.224 secuencias de 512 tokens, una tasa de aprendizaje maxima de 1e-4 (seleccionada entre {2e-5, 5e-5, 1e-4} con ejecuciones de sondeo de 3.000 pasos evaluadas en conjuntos de desarrollo downstream), un total de 2 epocas (24.000 pasos) y 1.440 pasos de calentamiento. El checkpoint publicado es el paso 12.000 (final de la primera epoca), seleccionado por rendimiento en desarrollo. El repositorio incluye archivos de estado de entrenamiento (`optimizer.pt`, `scheduler.pt`, `rng_state_*.pth`, `trainer_state.json`, `training_args.bin`) para reproducibilidad, innecesarios para inferencia o fine-tuning. El checkpoint vio aproximadamente 51M de secuencias de entrenamiento, frente a unas 296M de SciBETO-base, por lo que el presupuesto de computo no esta igualado.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) en castellano, orientado a texto cientifico.
- Representaciones contextuales para tareas de comprension: clasificacion de texto, regresion, inferencia de lenguaje natural y respuesta a preguntas extractiva.
- Generacion de embeddings de frases y documentos para busqueda semantica y clustering en dominio cientifico.
- Capacidad multilingue limitada al castellano; no se documentan otros idiomas.
- No es un modelo generativo autoregresivo: no soporta generacion libre de texto.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Clasificacion de articulos cientificos por disciplina o area tematica: el modelo se puede afinar como clasificador de secuencias sobre titulos y resumenes, aprovechando el preentrenamiento sobre vocabulario cientifico en castellano.
- Extraccion de informacion en articulos (Econ-IE): afinado para reconocimiento de entidades y relaciones en textos de economia y ciencias sociales, tarea evaluada en el articulo.
- Respuesta a preguntas extractiva sobre documentacion cientifica: ajuste con conjuntos tipo SQAC para localizar respuestas en parrafos de papers o informes tecnicos.
- Busqueda semantica en repositorios cientificos: uso de las representaciones del encoder para indexar y recuperar documentos afines a una consulta en castellano.
- Analisis de similitud y parafrasis en textos academicos: fine-tuning sobre PAWS-X para deteccion de duplicados o reformulaciones en corpus de publicaciones.
- Clasificacion de conocimiento academico: uso del benchmark Academic Knowledge para filtrar o etiquetar contenido segun areas de conocimiento.
- Base para experimentos de preentrenamiento continuado: punto de partida reproducible para estudiar adaptacion de dominio con tokenizador general frente a tokenizador especializado.

## Benchmarks y rendimiento

Los resultados se obtienen con el mismo protocolo de fine-tuning para todos los encoders del articulo: cinco semillas, media mas menos semiancho del intervalo de confianza al 95 %.

| Modelo | Academic Knowledge | Banrep (EM) | Econ-IE | WikiCAT | PAWS-X | SQAC | ESNLIR |
|---|---:|---:|---:|---:|---:|---:|---:|
| BERTIN (inicializacion) | 90,12 ± 0,61 | 57,39 ± 0,95 | 48,81 ± 1,15 | 74,46 ± 0,83 | 88,44 ± 0,47 | 75,63 ± 0,58 | 66,55 ± 0,27 |
| SciBETO-continual | 90,32 ± 0,30 | 57,79 ± 1,39 | 49,73 ± 0,80 | 74,25 ± 0,59 | 88,83 ± 0,99 | 75,87 ± 0,85 | 67,48 ± 0,32 |
| SciBETO-base (desde cero) | 90,95 ± 0,56 | 58,95 ± 0,33 | 51,25 ± 0,24 | 75,34 ± 0,39 | 88,58 ± 0,52 | 71,35 ± 0,96 | 65,89 ± 0,14 |

Hallazgos principales del articulo: frente a BERTIN, el preentrenamiento continuado cambia las puntuaciones entre -0,21 y +0,94; solo la ganancia en ESNLIR supera los intervalos de confianza y ninguna de las ganancias en los tres benchmarks cientificos lo hace. Frente a SciBETO-base con el mismo tamano, el entrenamiento desde cero con tokenizador de dominio es mejor en los tres benchmarks cientificos (+0,63, +1,16 y +1,52; los intervalos se separan en Econ-IE), mientras que el modelo continuado conserva mas competencia general y gana en SQAC (+4,52) y ESNLIR (+1,60). El checkpoint de la segunda epoca (24k) ofrece resultados mixtos y dentro de los intervalos: +0,10 en Academic Knowledge, +0,04 en Banrep y -0,56 en Econ-IE. La comparacion refleja que enfoque fue mejor con estos presupuestos, no que el preentrenamiento continuado no pueda cerrar la brecha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 125M de parametros; en torno a 0,25 GB en fp16/bf16. El repositorio completo ocupa 1,5 GB por incluir el estado de entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia; para fine-tuning con lotes de 512 tokens se recomienda 8-16 GB (RTX 3060/3080/4090, A10, A100).
- Cabe en GPU de consumo: si, en cualquier GPU moderna de consumo (GTX 1060 6 GB en adelante) gracias a su tamano reducido.
- Opciones de despliegue: transformers (pipeline `fill-mask`), TGI, ONNX Runtime y llama.cpp/GGUF no aplican de forma estandar para este encoder; vLLM no esta orientado a modelos MLM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Econ-IE / SQAC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SciBETO-continual | 125M | no disponible (512 tokens en entrenamiento) | 49,73 / 75,87 | CC BY 4.0 | Hugging Face |
| SciBETO-base | 125M | no disponible | 51,25 / 71,35 | no disponible en la informacion | Hugging Face |
| BERTIN | 125M | no disponible | 48,81 / 75,63 | CC BY 4.0 | Hugging Face |
| SciBETO-large | no disponible | no disponible | no disponible | no disponible | Hugging Face |

SciBETO-base y SciBETO-large pertenecen a la misma familia y se recomiendan para uso downstream; BERTIN es el modelo de inicializacion y referencia base. La diferencia principal entre SciBETO-continual y SciBETO-base es el tokenizador (general frente a cientifico) y el enfoque de entrenamiento (continuado frente a desde cero).

## Limitaciones y advertencias

- Modelo de ablacion: los propios autores desaconsejan su uso downstream y recomiendan SciBETO-base o SciBETO-large.
- No es generativo: solo produce predicciones de tokens enmascarados y representaciones; no sirve para generacion libre ni chat.
- Las ganancias frente a BERTIN son marginales y, salvo en ESNLIR, no superan los intervalos de confianza; no debe presentarse como una mejora sustancial.
- El tokenizador de dominio general puede fragmentar de forma suboptima terminos cientificos especializados, lo que penaliza en los benchmarks cientificos frente a SciBETO-base.
- Presupuesto de computo no igualado con SciBETO-base (51M frente a 296M de secuencias), lo que limita las conclusiones del articulo.
- Riesgo de sesgo y alucinacion en las representaciones: al ser un encoder, el sesgo se manifiesta en tareas downstream (clasificacion, extraccion) y debe evaluarse por caso de uso.
- Cobertura limitada al castellano; no se documenta rendimiento en otras lenguas ni en dominios no cientificos.
- Licencia CC BY 4.0: permite uso comercial con atribucion; debe citarse tambien BERTIN (de la Rosa et al., 2022).
- El repositorio incluye archivos de estado de entrenamiento que conviene excluir en despliegues de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Flaglab/SciBETO-continual
- Modelo base BERTIN: https://huggingface.co/bertin-project/bertin-roberta-base-spanish
- SciBETO-base: https://huggingface.co/Flaglab/SciBETO-base
- SciBETO-large: https://huggingface.co/Flaglab/SciBETO-large
- Coleccion de datasets de NLP cientifico en castellano: https://huggingface.co/collections/Flaglab/spanish-scientific-nlp-datasets
- Codigo de preentrenamiento: https://github.com/juanks235/scibeto-pretraining
- Codigo de fine-tuning y evaluacion: https://github.com/juanks235/scibeto-benchmarks
- Paper: Prieto, J. C., Martinez Novoa, S., Gomez, L. y Manrique, R. "SciBETO: A Domain-Specific RoBERTa Model Trained on Spanish Scientific Texts", EACL 2027.
