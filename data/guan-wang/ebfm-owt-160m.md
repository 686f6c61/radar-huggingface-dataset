# guan-wang/EBFM-OWT-160M

## Resumen

EBFM-OWT-160M es un modelo de lenguaje basado en energia (energy-based language model, EBFM) de 160 millones de parametros, desarrollado por Guanchu Wang y colaboradores en el marco del proyecto OpenEBFM (paper OpenESM: Energy-Steered Models Are Scalable Foundation Learners). Se distribuye como un checkpoint de preentrenamiento exportado a formato compatible con Hugging Face Transformers, con pipeline declarado `fill-mask` y arquitectura personalizada (variante d12) implementada mediante codigo remoto.

El modelo se presenta como una alternativa a los transformers autoregresivos convencionales: en lugar de modelar la probabilidad del siguiente token de forma directa, emplea una formulacion basada en energia para puntuar secuencias. Esta ficha se limita a lo declarado en la model card y en los metadatos del repositorio; no hay informacion publica sobre curvas de entrenamiento, datos de evaluacion ni resultados de benchmarks.

Es relevante ahora por su caracter abierto (licencia MIT) y por ser un checkpoint de investigacion reproducible dentro del ecosistema OpenEBFM, util para quienes quieran experimentar con modelos de energia a escala pequena sin reentrenar desde cero. No obstante, su escasa adopcion (71 descargas, 1 like) y la falta de documentacion sobre rendimiento lo sitúan como una pieza de investigacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenEBFM personalizada (energy-based language model, variante d12) |
| Parametros totales | 160.556.544 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |
| Bloques transformer | 12 |
| Dimension de embedding | 768 |
| Cabezas de atencion | 6 |
| Tamano de vocabulario | 32768 |
| Dataset de entrenamiento | OWT (OpenWebText) |
| Etapa | preentrenamiento |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura es una implementacion propia de OpenEBFM (variante d12), con 12 bloques, dimension de embedding 768, 6 cabezas de atencion y vocabulario de 32768 tokens. El modelo se enmarca en la familia de modelos de lenguaje basados en energia: la model card no detalla el mecanismo exacto de puntuacion energetica ni la funcion de perdida, pero el paper asociado (OpenESM: Energy-Steered Models Are Scalable Foundation Learners) sugiere un enfoque de "energy-steered" para el aprendizaje a escala. El codigo de modelado y configuracion se distribuye como codigo remoto (`modeling_ebfm.py`, `configuration_ebfm.py`), lo que implica que la carga requiere `trust_remote_code=True`.

El entrenamiento se realizo sobre OWT (OpenWebText) en etapa de preentrenamiento. No se especifican en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste fino posterior. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. El repositorio incluye una tabla de bytes de token (`token_bytes.pt`) utilizada por las metricas de OpenEBFM, lo que apunta a una evaluacion basada en bits por byte en lugar de perplejidad por token.

## Capacidades

- Modelado de lenguaje enmascarado (pipeline `fill-mask`): el modelo esta disenado y exportado para prediccion de tokens enmascarados.
- Puntuacion de secuencias mediante formulacion basada en energia, segun la familia OpenEBFM.
- Preentrenamiento sobre texto web en ingles (OWT), por lo que la cobertura linguistica principal es el ingles; otros idiomas no estan declarados.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- No se declaran capacidades especiales adicionales mas alla del modelado de lenguaje enmascarado.

## Casos de uso

- Investigacion en modelos de energia: servir como checkpoint de referencia a escala 160M para reproducir y comparar formulaciones EBFM frente a transformers autoregresivos, gracias a su licencia MIT y a su exportacion estandar.
- Relleno de huecos en texto (fill-mask) en ingles: completar palabras o fragmentos enmascarados en frases cortas, aprovechando el pipeline declarado y el vocabulario de 32768 tokens.
- Experimentos de evaluacion bits-por-byte: utilizar `token_bytes.pt` y las metricas de OpenEBFM para medir la calidad del modelado de lenguaje de forma comparable entre tokenizadores.
- Base para ajuste fino en tareas de comprension: al ser un checkpoint de preentrenamiento de 160M, puede servir como inicializacion para tareas de clasificacion o extraccion en entornos con recursos limitados.
- Docencia y prototipado: su tamano (0,6 GB de pesos) permite cargarlo en una sola GPU consumer o incluso en CPU para demostraciones de arquitecturas no convencionales.
- Analisis de robustez y calibracion: estudiar como se comporta una formulacion energetica frente a la autoregresiva en tareas de deteccion de texto improbable o puntuacion de secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) los 160,5M de parametros ocupan aproximadamente 0,64 GB; en fp16/bf16, alrededor de 0,32 GB. El repo ocupa 0,6 GB, consistente con pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es demasiado pequeno para aprovechar su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la model card solo documenta carga via `transformers` con `AutoModelForMaskedLM` y `trust_remote_code=True`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura es personalizada y no estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales con alternativas de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EBFM-OWT-160M | 160,5M | 2048 | MIT | safetensors (codigo remoto) | Modelo de energia, preentrenamiento en OWT, sin benchmarks publicos |
| GPT-2 small | 124M | 1024 | MIT | safetensors, GGUF | Transformer autoregresivo, ampliamente soportado y evaluado |
| BERT-base | 110M | 512 | Apache 2.0 | safetensors, GGUF | Encoder enmascarado, ecosistema maduro y benchmarks publicos |
| RoBERTa-base | 125M | 512 | MIT | safetensors | Encoder enmascarado, entrenado sobre corpus mayor que OWT |

La comparacion con GPT-2 small, BERT-base y RoBERTa-base es estructural: mismo orden de magnitud de parametros, pero EBFM-OWT-160M carece de evaluaciones publicas y de soporte en runtimes estandar, lo que limita su comparabilidad practica.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos: no hay datos de MMLU, GLUE, bits-por-byte ni ninguna otra metrica en la informacion disponible, por lo que no se puede evaluar su calidad relativa.
- Idiomas no declarados: el entrenamiento en OWT sugiere predominio del ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente limitado.
- Riesgo de alucinacion: al ser un modelo de preentrenamiento de 160M sin ajuste por preferencias, la generacion libre (si el runtime lo permite) sera propensa a incoherencias y contenido facticamente incorrecto.
- Codigo remoto obligatorio: la carga requiere `trust_remote_code=True`, lo que implica ejecutar Python del repositorio; conviene auditar `modeling_ebfm.py` y `configuration_ebfm.py` antes de usarlo en entornos sensibles.
- Ecosistema limitado: al no ser una arquitectura transformer estandar, no hay garantia de compatibilidad con vLLM, llama.cpp, Ollama, TGI ni herramientas de cuantizacion habituales; el pipeline declarado es `fill-mask`, no generacion autoregresiva.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; la responsabilidad sobre el uso recae en el integrador.
- Madurez: 71 descargas y 1 like indican adopcion minima; no hay evidencia de mantenimiento activo ni de comunidad que reporte incidencias.
- Sin informacion sobre sesgos: no se documentan evaluaciones de sesgo, toxicidad ni filtrado del corpus OWT, que se sabe contiene sesgos propios de texto web.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guan-wang/EBFM-OWT-160M
- Repositorio OpenEBFM: https://github.com/datamllab/openebfm
- Paper (arXiv 2610.33005): https://huggingface.co/papers/2610.33005
