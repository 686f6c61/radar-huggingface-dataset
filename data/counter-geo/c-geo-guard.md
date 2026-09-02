# counter-geo/c-geo-guard

## Resumen

C-GEO Guard es un detector de contenido desinformativo a nivel de fragmento (chunk-level) diseñado para contrarrestar los ataques de optimización de motores generativos (GEO, por sus siglas en inglés). Lo desarrolla el equipo Counter-GEO y se presenta como una defensa ligera frente a la desinformación que se infiltra en sistemas de generación de texto mediante contenido fluido y aparentemente factual, pero que distorsiona la realidad sin violar políticas de seguridad tradicionales. El modelo se basa en DeBERTa-v3-base, con 183,8 millones de parámetros, y se publica con un checkpoint de una época, los centroides de ocho clases de ataque, metadatos de calibración y el código de entrenamiento y evaluación asociado al paper Counter-GEO-Bench.

La relevancia actual de C-GEO Guard radica en que los guardarraíles convencionales, basados en taxonomías de seguridad, no detectan este tipo de desinformación porque no constituye una violación de políticas explícita. Según los resultados del paper, el detector reduce la tasa de éxito de ataque (ASR) en un 48 % relativo con una pérdida de utilidad casi nula, lo que demuestra que el problema es abordable con soluciones ligeras. El acceso al modelo está restringido (gated) en Hugging Face y requiere aceptar condiciones específicas de la licencia dual personalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (encoder transformer con atencion disentangled) |
| Parametros totales | 183.831.552 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (probablemente 512 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | c-geo-guard-dual-license (licencia dual personalizada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

C-GEO Guard parte de DeBERTa-v3-base, un modelo de tipo transformer encoder que emplea atencion disentangled (separacion de contenido y posicion) y un objetivo de entrenamiento basado en reemplazo de tokens (RTD). Sobre esta base, el equipo Counter-GEO aplica un fine-tuning con un enfoque contrastivo a nivel de fragmento (chunk-level contrastive learning), disenado para distinguir entre contenido legitimo y contenido distorsionado por ataques GEO. El repositorio incluye un checkpoint entrenado durante una sola epoca, los centroides de ocho clases de ataque, metadatos de calibracion y el codigo original de entrenamiento y evaluacion.

No se especifican los detalles del dataset de entrenamiento (numero de tokens, composicion o proporciones) ni si se aplicaron tecnicas como RLHF o DPO. El modelo se distribuye como un extractor de caracteristicas (feature extraction) compatible con sentence-transformers y con la infraestructura de Text Embeddings Inference, lo que facilita su integracion en pipelines de recuperacion y generacion aumentada (RAG).

## Capacidades

- Deteccion de desinformacion GEO a nivel de fragmento (chunk-level), identificando contenido que distorsiona hechos de forma fluida y aparentemente neutral.
- Clasificacion en ocho clases de ataque definidas por el benchmark Counter-GEO-Bench, mediante los centroides incluidos en el repositorio.
- Reduccion de la tasa de exito de ataque (ASR) en un 48 % relativo con perdida de utilidad casi nula, segun el paper asociado.
- Integracion como modulo de guardarrail en sistemas de generacion aumentada por recuperacion (RAG) y en optimizacion de motores generativos (GEO).
- Extraccion de caracteristicas (embeddings) mediante sentence-transformers, compatible con herramientas de busqueda y filtrado.
- Soporte para despliegue con Text Embeddings Inference, lo que permite su uso en entornos de produccion con endpoints compatibles.

## Casos de uso

- Defensa en sistemas RAG: C-GEO Guard puede insertarse como filtro previo o posterior a la recuperacion de documentos, descartando fragmentos que contengan desinformacion GEO antes de que lleguen al generador. Su naturaleza de detector por fragmentos permite operar sobre los trozos de texto que se recuperan, sin necesidad de analizar el documento completo.
- Moderacion de contenido en plataformas con generacion asistida: plataformas que ofrecen respuestas generadas por IA pueden usar el detector para senalar o bloquear contenido que distorsione hechos geograficos, politicos o cientificos, incluso si no infringe las politicas de uso estandar.
- Verificacion factual en asistentes virtuales: el modelo puede actuar como una capa adicional de verificacion, marcando fragmentos sospechosos en las respuestas de un asistente antes de que se entreguen al usuario, reduciendo el riesgo de propagacion de informacion falsa.
- Evaluacion de vulnerabilidad de modelos generativos: investigadores pueden emplear C-GEO Guard junto con Counter-GEO-Bench para medir la robustez de distintos LLMs frente a ataques GEO, identificando que modelos son mas susceptibles y que clases de ataque resultan mas dificiles de detectar.
- Investigacion en seguridad de IA: el checkpoint y los centroides publicados sirven como punto de partida para estudiar la transferibilidad de los ataques GEO y para desarrollar defensas complementarias, como verificacion externa de hechos o filtrado basado en procedencia.
- Guardarrail complementario en pipelines de produccion: dado su tamano reducido (184M parametros), puede desplegarse como un servicio de baja latencia junto a modelos generativos mas grandes, anadiendo una capa de deteccion sin penalizar significativamente el rendimiento global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El paper Counter-GEO-Bench reporta que C-GEO Guard reduce la tasa de exito de ataque (ASR) en un 48 % relativo con una perdida de utilidad casi nula, y que detecta entre el 36 % y el 40 % de los casos de desinformacion GEO por modelo evaluado. Estos datos se presentan como parte del benchmark propio del estudio, sin comparacion con otros detectores similares.

## Requisitos de hardware

- VRAM estimada para inferencia: dado el tamano del modelo (183,8 millones de parametros), en precision fp32 los pesos ocupan aproximadamente 735 MB; en fp16, unos 368 MB. Con cuantizacion de 8 bits, el uso de VRAM se reduciria a unos 184 MB. Estos valores son estimaciones basadas en el numero de parametros y el tamano del repositorio (0.7 GB), no en mediciones oficiales.
- GPU recomendadas: el modelo cabe en cualquier GPU consumer moderna, como una NVIDIA RTX 3060 o superior, e incluso en tarjetas con 2 GB de VRAM si se usa cuantizacion. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser compatible con sentence-transformers y Text Embeddings Inference, puede servirse mediante TGI, o bien integrarse en aplicaciones Python con la libreria sentence-transformers. Tambien es posible exportarlo a ONNX o a formatos cuantizados para entornos embebidos.
- Latencia y throughput: no se dispone de datos oficiales. En una GPU moderna, un modelo de este tamano procesa cientos de fragmentos por segundo; en CPU, la latencia por fragmento seria del orden de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de informacion sobre otros detectores de desinformacion GEO con los que comparar directamente. El unico punto de referencia conocido es el propio benchmark Counter-GEO-Bench, que evalua defensas contra ataques GEO, pero no se mencionan modelos alternativos en los resultados disponibles. Por tanto, la comparativa con modelos similares se considera no disponible.

## Limitaciones y advertencias

- Acceso restringido: el modelo esta marcado como gated en Hugging Face, lo que obliga a aceptar condiciones especificas antes de poder descargarlo. Esto puede limitar su uso en entornos corporativos o academicos que requieran acceso inmediato.
- Licencia dual personalizada: la licencia c-geo-guard-dual-license no es una licencia open source estandar (como Apache 2.0 o MIT). Es necesario revisar los terminos exactos para determinar si permite uso comercial, redistribucion o modificacion.
- Cobertura limitada: segun el paper, el detector solo captura entre el 36 % y el 40 % de los casos de desinformacion GEO por modelo. Esto implica que no es suficiente como defensa autonoma y debe complementarse con otras tecnicas, como verificacion externa de hechos o filtrado basado en procedencia.
- Idioma unico: el modelo solo soporta ingles. No es aplicable a otros idiomas sin un reentrenamiento o adaptacion.
- Riesgo de falsos positivos y negativos: al ser un clasificador basado en contraste, puede generar tanto falsos positivos (marcar contenido legitimo como desinformativo) como falsos negativos (dejar pasar contenido distorsionado). La calibracion incluida en el repositorio debe ajustarse al caso de uso concreto.
- Dependencia del checkpoint: el modelo publicado es un checkpoint de una sola epoca, lo que puede implicar que no este completamente optimizado para produccion. Se recomienda evaluar su rendimiento en el dominio especifico antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/counter-geo/c-geo-guard
- Paper Counter-GEO-Bench (OpenReview): https://openreview.net/forum?id=CY0YO0sRxs
- PDF del paper: https://openreview.net/pdf?id=CY0YO0sRxs
- Organizacion Counter-GEO en Hugging Face: https://huggingface.co/counter-geo/models
