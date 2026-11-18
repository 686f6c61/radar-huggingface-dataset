# alphaedge-ai/mmBERT-small-aze-32768

## Resumen

mmBERT-small-aze-32768 es una version recortada (trimmed) del encoder multilingue jhu-clsp/mmBERT-small, especializada en azeri (az) mediante reduccion del vocabulario. El modelo lo publica la organizacion alphaedge-ai y se distribuye con licencia MIT. El proceso de trimming reduce el vocabulario original de 256.000 a 32.768 tokens, lo que elimina los tokens poco frecuentes en azeri y deja una huella de memoria mucho menor.

El resultado es un modelo de 54.772.608 parametros frente a los 140.493.696 del original, una reduccion del 61,01% en tamano, con una contraccion del vocabulario del 87,20%. La arquitectura subyacente es ModernBERT, un encoder transformer con atencion de contexto largo y alternancia entre atencion global y local, orientado a tareas de extraccion de caracteristicas y enmascaramiento de tokens (fill-mask).

Es relevante ahora porque permite desplegar un encoder multilingue moderno en entornos con recursos limitados para una unica lengua, manteniendo presumiblemente un comportamiento cercano al original en azeri. La contrapartida es clara: al haberse eliminado los tokens no usados en azeri, el modelo deja de ser util para otras lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 54.772.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | azeri (az) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base, jhu-clsp/mmBERT-small, es un encoder de la familia ModernBERT descrito en el paper "mmBERT: A Modern Multilingual Encoder with Annealed Language Learning" (arXiv:2509.06888). ModernBERT combina atencion global y local alternada, rotary positional embeddings y un diseno optimizado para eficiencia en contextos largos. El modelo resultante hereda esa arquitectura; lo unico que cambia respecto al original es el vocabulario y, en consecuencia, las dimensiones de las matrices de embedding y de la cabeza de salida.

El proceso de trimming se realizo sobre el dataset lbourdois/fineweb-2-trimming, usando 200.000 textos para el minado de tokens frecuentes en azeri. No se detalla en la informacion proporcionada si hubo reentrenamiento posterior, ajuste fino o calibracion de las capas afectadas, ni el numero de tokens de entrenamiento original del modelo base. Tampoco se especifican las tecnicas de alineacion (RLHF, DPO) aplicadas, algo esperable en un encoder de extraccion de caracteristicas.

## Capacidades

- Extraccion de caracteristicas (feature-extraction) para representaciones vectoriales de texto en azeri.
- Enmascaramiento de tokens (fill-mask), tarea declarada en el pipeline del modelo.
- Generacion de embeddings para busqueda semantica, similitud y clustering en azeri.
- Clasificacion de texto mediante cabezas especificas sobre las representaciones del encoder.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no aplicable a un encoder de este tipo.
- Capacidades multilingues: limitadas al azeri tras el trimming; el rendimiento en otras lenguas no esta garantizado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Busqueda semantica en azeri: el modelo genera embeddings de documentos y consultas para un motor de recuperacion; su reducido tamano permite indexar grandes volumenes en memoria.
- Clasificacion de tickets de soporte en azeri: se anade una cabeza de clasificacion sobre las representaciones del encoder para enrutar incidencias por categoria.
- Deteccion de contenido toxico o spam en azeri: el encoder sirve como base para un clasificador binario ajustado con ejemplos etiquetados.
- Deduplicacion y clustering de noticias: los embeddings permiten agrupar articulos similares en un pipeline de curacion de contenido en azeri.
- Reranking en sistemas RAG: el modelo puntua pares consulta-documento para reordenar resultados de un recuperador inicial, con coste bajo por su tamano.
- Rellenado de plantillas y autocompletado (fill-mask): util para tareas de normalizacion o prediccion de tokens en textos en azeri.
- Extraccion de caracteristicas para modelos downstream: servir como backbone congelado en tareas de NER o analisis de sentimiento en azeri.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta las metricas de reduccion de vocabulario (87,20%) y de parametros (61,01%) respecto al modelo base, sin cifras de evaluacion en tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (fp32), dado el tamano del repo de 0,2 GB y los 54,77 millones de parametros; en fp16 o bf16 se reduce aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien funciona en CPU para cargas moderadas.
- Cabe en GPU consumer: si, con amplio margen, incluso en tarjetas de gama baja.
- Opciones de despliegue: transformers (libreria declarada), y en principio exportable a ONNX o a formatos de inferencia de encoders, aunque no se confirma en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/mmBERT-small-aze-32768 | 54,77 M | no disponible | azeri | MIT | Version trimmed del mmBERT-small |
| jhu-clsp/mmBERT-small | 140,49 M | no disponible | multilingue | no disponible en la informacion | Modelo base original con vocabulario de 256.000 tokens |
| Otros encoders multilingues (p. ej. familia XLM-R) | no disponible | no disponible | multilingue | no disponible | Alternativas genericas; sin datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- El trimming elimina los tokens poco frecuentes en azeri; el rendimiento en otras lenguas puede degradarse de forma significativa.
- No se han publicado evaluaciones downstream que confirmen que el comportamiento se mantiene cercano al modelo base en azeri.
- Riesgo de sesgos heredados del corpus fineweb-2 y del modelo base; no se documenta ninguna mitigacion.
- Riesgo de alucinacion no aplicable en sentido estricto (es un encoder, no un generador), pero las representaciones pueden ser poco fiables en dominios especializados no cubiertos por el minado.
- La longitud de contexto no se especifica en la informacion proporcionada; conviene verificarla antes de usarlo con textos largos.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de minado.
- El numero de descargas (14) y de likes (0) es muy bajo; el modelo carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/mmBERT-small-aze-32768
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de mmBERT: https://arxiv.org/abs/2509.06888
