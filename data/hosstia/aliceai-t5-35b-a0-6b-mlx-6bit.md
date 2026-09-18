# Hosstia/AliceAI-T5-35B-A0.6B-MLX-6bit

## Resumen

AliceAI-T5-35B-A0.6B-MLX-6bit es una conversión cuantizada a 6 bits del modelo de traducción AliceAI-T5-35B-A0.6B de Yandex, publicada por el usuario Hosstia y ejecutable sobre Apple Silicon mediante el framework MLX de Apple. Se trata de un transformer encoder-decoder con arquitectura de mezcla de expertos (MoE): 34.354.463.744 parámetros totales (etiquetados como 35B) de los que solo se activan aproximadamente 0,6B por token, gracias a un enrutamiento top-8 sobre 512 expertos. El pipeline declarado es de traducción, con cobertura de chino (zh) y ruso (ru).

El problema que resuelve es práctico: el modelo original en precisión completa no cabe en la memoria unificada de un equipo de consumo, y esta variante lo reduce a 26,25 GB en disco con un pico de memoria medido de 27,05 GB. El autor reporta una optimización clave en el despacho MoE: el uso de `gather_qmm` fusionado elimina 224 barreras de sincronización de GPU por token (28 capas × 8 expertos activos), lo que se traduce en una aceleración de 3,9x en batch 1 y 12,73x en batch 8 frente a una línea base heredada basada en bucles planos.

La relevancia actual del modelo es doble: por un lado, demuestra que un MoE de 35B con solo 0,6B activos es viable en un portátil Apple M4 Pro de 48 GB de memoria unificada; por otro, documenta con detalle un caso real de cuantización affine 6-bit con grupo 64 aplicada por separado a expertos y atención, manteniendo embeddings sin cuantizar. El repositorio incluye el paquete Python `aliceai_mlx`, un chat interactivo (`chat.py`) y un artículo técnico (`ARTICLE.md`) sobre el proceso de conversión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con mezcla de expertos (MoE) tipo T5 |
| Parametros totales | 34.354.463.744 (etiquetado comercialmente como 35B) |
| Parametros activos | Aproximadamente 0,6B por token (512 expertos, enrutamiento top-8) |
| Longitud de contexto | No disponible de forma explícita (configuración RoPE YaRN: posición máxima original 9.984, factor de escala 20,0) |
| Tipos de cuantizacion | Affine 6 bits con tamaño de grupo 64 (expertos y atención); embeddings sin cuantizar. La familia incluye variantes 4 bits y MXFP4 no presentes en este repositorio |
| Idiomas soportados | Chino (zh) y ruso (ru) |
| Licencia | other (condiciones no detalladas en la información disponible; conviene consultar los términos del modelo base de Yandex) |
| Formato de pesos | Safetensors con diseño MLX (cuantización affine 6 bits, grupo 64); no se publican pesos GGUF ni formatos para CUDA |
| Tamano en disco | 26,25 GB (repositorio de 28,2 GB) |
| Memoria pico medida | 27,05 GB |
| Capas | 16 en encoder, 12 en decoder |
| Tamano oculto | 1.536 |
| Cabezas de atencion | 12 en encoder; 4 cabezas KV en decoder; dimensión de cabeza 128 |
| Vocabulario | 135.040 tokens |
| Tamano intermedio de experto | 512 |
| Activacion | SiLU |
| Embeddings | Compartidos y atados (shared y tied) |
| Libreria | MLX 0.32.0 (probado) |
| Pipeline | translation |

## Arquitectura y entrenamiento

La arquitectura es un T5 encoder-decoder con capas de mezcla de expertos. El encoder tiene 16 capas y el decoder 12, con un tamaño oculto de 1.536, 12 cabezas de atención en el encoder y 4 cabezas KV en el decoder (atención con cabezas KV reducidas, dimensión 128). El componente MoE consta de 512 expertos con tamaño intermedio 512 y activación SiLU, de los que se activan 8 por token. El vocabulario es de 135.040 tokens, con embeddings compartidos y atados entre encoder y decoder, lo que reduce el recuento de parámetros no expertos.

En cuanto a la codificación posicional, el modelo utiliza RoPE de tipo YaRN con una posición máxima original de 9.984 y un factor de escala de 20,0. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; estos datos no están disponibles en la información consultada. La innovación técnica destacable documentada por el autor de la conversión no está en el entrenamiento, sino en la implementación de inferencia: el despacho MoE con `gather_qmm` fusionado, que agrupa las operaciones de los 8 expertos activos por capa y elimina 224 barreras de sincronización de GPU por token respecto a la implementación heredada con bucle plano. El autor afirma mantener paridad numérica completa con el esquema de cuantización de referencia.

## Capacidades

- Traducción chino a ruso, con ejemplos de traducción literaria y de párrafos narrativos.
- Modo Q&A: respuesta a preguntas formuladas en ruso (por ejemplo, cuestiones técnicas o científicas). Requiere `min_new_tokens=128` para evitar el truncado prematuro por EOS.
- Modo corrección: revisión y corrección de traducciones existentes.
- Modo professor: fusión de dos traducciones candidatas (una de referencia "profesor" y otra "estudiante") en una única salida corregida.
- Traducción por lotes mediante `complete_batch()`, con un rendimiento mucho mayor que en batch 1.
- Generación en streaming y chat interactivo multi-turno con historial de conversación en el modo Q&A.
- Modos de tarea expuestos en `chat.py`: translate, correct, professor, qa y raw.
- No hay evidencia de soporte de tool calling o function calling en la información disponible.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües limitadas a chino y ruso; no se declara soporte de español, inglés ni otras lenguas.

## Casos de uso

- Traducción literaria chino-ruso: el modelo traduce párrafos narrativos completos manteniendo el registro, como muestra el ejemplo incluido en la model card con texto de ficción china. Es adecuado porque el pipeline declarado es específicamente de traducción zh-ru.
- Localización por lotes en producción editorial: usando `complete_batch()` se alcanzan 240,45 tok/s con batch 8 en un M4 Pro, lo que permite procesar catálogos de textos en una sola pasada sin infraestructura de GPU dedicada.
- Revisión y corrección de traducciones automáticas existentes: el modo correct permite pasar una traducción ya generada por otro sistema y devolver una versión revisada, útil como etapa de post-edición en pipelines de traducción.
- Fusión de traducciones candidatas en sistemas de ensemble: el modo professor combina dos hipótesis de traducción y devuelve un texto corregido, lo que sirve para arbitrar entre salidas de varios motores.
- Asistente de preguntas y respuestas en ruso sobre documentación técnica: con `min_new_tokens=128` se evita el corte a mitad de frase y el modelo responde a preguntas como la definición de entropía en termodinámica citada en la model card.
- Chat interactivo local para investigación en Apple Silicon: `chat.py` ofrece cinco modos de tarea con comandos slash, historial multi-turno y limpieza de stream, todo ejecutándose en local sin enviar datos a servicios externos.
- Prototipado de sistemas MoE sobre MLX: el repositorio incluye código de runtime propio, lo que permite estudiar el efecto del despacho fusionado `gather_qmm` en el rendimiento real de un MoE de 512 expertos.
- Segmentación de textos largos en flujos de traducción: dado que las variantes cuantizadas pueden truncar en entradas largas, un caso de uso realista es trocear el texto fuente y traducir por segmentos antes de recomponer la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, BLEU u otros) en la información disponible. Los únicos datos publicados son mediciones de rendimiento y memoria en Apple M4 Pro de 48 GB de memoria unificada con MLX 0.32.0, comparadas contra una línea base heredada (implementación previa con bucle plano sobre expertos):

| Metrica | Esta variante (6 bits) | Linea base heredada |
|---|---|---|
| Throughput (batch 1) | 73,59 tok/s | 18,89 tok/s |
| Throughput (batch 8) | 240,45 tok/s | No disponible |
| Mediana de throughput (batch 1) | 73,16 tok/s | 18,56 tok/s |
| Mediana de throughput (batch 8) | 249,44 tok/s | No disponible |
| Utilizacion de GPU (batch 1) | 68,5% | 51,2% |
| Utilizacion de GPU (batch 8) | 91,9% | No disponible |
| Utilizacion pico de GPU | 100% | 84% |
| Tamano del modelo en disco | 26,25 GB | 18,30 GB |
| Memoria pico | 27,05 GB | 19,87 GB |
| Aceleracion frente a la linea base (batch 1) | 3,9x | 1,0x |
| Aceleracion frente a la linea base (batch 8) | 12,73x | 1,0x |

La aceleración reportada se atribuye a la eliminación de 224 barreras de sincronización de GPU por token mediante el despacho MoE fusionado `gather_qmm`. Conviene subrayar que la comparación es contra una implementación previa del mismo autor, no contra el modelo original en precisión completa ni contra otros motores de inferencia.

## Requisitos de hardware

- Memoria: pico medido de 27,05 GB en memoria unificada. En la práctica se necesita un equipo con al menos 32 GB de memoria unificada y margen para el sistema operativo; la medición de referencia se hizo en un M4 Pro con 48 GB.
- Espacio en disco: 26,25 GB para los pesos, sobre un repositorio de 28,2 GB.
- GPU recomendadas: Apple Silicon exclusivamente. El modelo está cuantizado y empaquetado para MLX, que se ejecuta sobre la GPU Metal. No hay soporte nativo para A100, H100, RTX 4090 ni otras GPU NVIDIA o AMD en este repositorio.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de gama alta con memoria unificada suficiente (M4 Pro de 48 GB probado). No cabe en GPU de consumo con 24 GB de VRAM en su formato actual sin conversión.
- Opciones de despliegue: framework MLX (probado con MLX 0.32.0), el paquete propio `aliceai_mlx` incluido en el repositorio y el chat interactivo `chat.py`. No se publican pesos para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es safetensors con diseño MLX.
- Latencia y throughput: 73,59 tok/s en batch 1 y 240,45 tok/s en batch 8 sobre M4 Pro de 48 GB, con una utilización de GPU del 68,5% y 91,9% respectivamente.
- Modos de carga: el chat permite seleccionar variantes mediante `--model` (por ejemplo `4bit`), lo que sugiere que el repositorio o la familia incluyen más de una cuantización, aunque aquí solo se documenta la de 6 bits.

## Comparativa con modelos similares

No se proporcionan datos de benchmarks ni especificaciones de contexto de modelos alternativos, por lo que la comparación externa queda como no disponible. La única comparación posible con la información disponible es interna, entre el modelo base y las variantes de cuantización mencionadas en la model card:

| Modelo | Parametros | Activos | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hosstia/AliceAI-T5-35B-A0.6B-MLX-6bit | 34.354.463.744 | 0,6B por token | Affine 6 bits, grupo 64 | No disponible | other | Publicado en HuggingFace, 0 descargas y 0 likes |
| yandex/AliceAI-T5-35B-A0.6B (base) | 35B segun nomenclatura | 0,6B por token | Precisión completa (segun nomenclatura) | No disponible | No disponible | Modelo base referenciado, no descrito en la información disponible |
| Variante 4 bits de la familia | No disponible | No disponible | 4 bits | No disponible | other | Mencionada en la model card; mejor calidad de Q&A que la de 6 bits |
| Variante MXFP4 de la familia | No disponible | No disponible | MXFP4 | No disponible | other | Desaconsejada por el autor: degeneración por repetición en aproximadamente el 10% de los párrafos |

No se dispone de comparaciones con otros modelos de traducción zh-ru (por ejemplo, alternativas Multilingual T5, NLLB o M2M-100) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas restringidos a chino y ruso; no hay soporte declarado de español, inglés ni otras lenguas, lo que limita su uso fuera de ese par.
- Licencia "other": las condiciones concretas no están detalladas en la información disponible. Al derivar del modelo de Yandex, es imprescindible revisar los términos del modelo base antes de cualquier uso comercial.
- La variante de 6 bits tiene menor calidad en el modo Q&A que la de 4 bits: las respuestas tienden a ser más cortas y a mostrar más repeticiones, según el propio autor.
- La variante MXFP4 de la familia presenta degeneración por repetición (bucles en aproximadamente el 10% de los párrafos) y el autor la desaconseja para producción.
- El parámetro `min_new_tokens` es obligatorio en el modo Q&A: sin él, los modelos cuantizados emiten EOS de forma prematura y las respuestas se truncan a mitad de frase.
- El modo de traducción puede truncar con entradas largas en las variantes cuantizadas; se recomienda dividir los textos fuente muy largos en segmentos más cortos.
- No se han publicado evaluaciones de calidad de traducción (BLEU, COMET u otras), ni tasas de alucinación, ni análisis de sesgos. La ausencia de métricas de calidad impide validar el modelo para producción sin una evaluación propia.
- El repositorio no está validado por Yandex: es una conversión de terceros (autor Hosstia) con 0 descargas y 0 likes en el momento de la consulta.
- Dependencia de código propio: la carga y generación se realizan con el paquete `aliceai_mlx` incluido en el repositorio, no con la ruta estándar de `mlx-lm`, lo que añade riesgo de mantenimiento.
- Ejecución exclusiva en Apple Silicon. No hay pesos GGUF ni compatibilidad con CUDA, vLLM, llama.cpp, Ollama o TGI.
- Las cifras de aceleración proceden de comparar contra la implementación heredada del mismo autor, no contra el modelo base en precisión completa; no deben interpretarse como una mejora de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hosstia/AliceAI-T5-35B-A0.6B-MLX-6bit
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Articulo tecnico sobre el proceso de conversion: fichero `ARTICLE.md` incluido en el repositorio del modelo
- Chat interactivo y paquete de runtime: ficheros `chat.py` y `aliceai_mlx` incluidos en el repositorio del modelo
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su modelo base; los enlaces adicionales figuran como no disponibles.
