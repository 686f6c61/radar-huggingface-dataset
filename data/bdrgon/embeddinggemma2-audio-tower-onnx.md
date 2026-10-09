# bdrgon/embeddinggemma2-audio-tower-onnx

## Resumen

`bdrgon/embeddinggemma2-audio-tower-onnx` es una exportación a ONNX de la torre de audio del modelo `google/embeddinggemma-2`, publicada por el usuario bdrgon. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del modelo base de Google a formato ONNX, orientada a la inferencia de embeddings de audio en entornos de producción que no utilizan PyTorch de forma nativa.

El artefacto resuelve un problema de despliegue: permite obtener representaciones vectoriales (embeddings) de audio normalizadas L2 de dimensión 512 mediante ONNX Runtime, con variantes en FP32, INT8 dinámico e INT4 weight-only. El repositorio ocupa 5,4 GB e incluye tanto la salida final de embedding como la salida de estados intermedios de la torre de audio, lo que facilita tareas de extracción de características por capas.

La relevancia actual es limitada pero específica: la licencia Apache 2.0 y la disponibilidad de cuantizaciones agresivas (INT4 de 164,5 MB para la torre) lo hacen utilizable en pipelines de búsqueda semántica por audio, indexación multimodal o sistemas de recomendación donde se quiera evitar una dependencia pesada de frameworks de deep learning. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (torre de audio de `google/embeddinggemma-2`, exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la entrada de audio se define por `feature_frames`, sin ventana de texto declarada) |
| Tipos de cuantizacion | FP32, INT8 dynamic, INT4 weight-only |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18); `audio_embedding.onnx` + `audio_embedding.data`; INT4 requiere soporte de `com.microsoft::MatMulNBits` en ONNX Runtime |
| Dimension de salida | 512 (embedding L2-normalizado, float32) |
| Entradas | `input_ids` y `attention_mask` int64 `[1, text_tokens]`; `input_features` float32 `[1, feature_frames, 128]`; `input_features_mask` bool `[1, feature_frames]` |
| Preprocesado | externo; usar el `AutoProcessor` fijado del modelo base para audio mono a 16 kHz |
| Tamano del repositorio | 5,4 GB |

### Archivos publicados

| Fichero | Cuantizacion | Tamano | Salida |
|---|---|---:|---|
| `audio_embedding.onnx` + `audio_embedding.data` | FP32 | 2,31 GB | Embedding final |
| `audio_embedding_int8.onnx` | INT8 dynamic | 583,1 MB | Embedding final |
| `audio_embedding_int4.onnx` | INT4 weight-only | 777,1 MB | Embedding final |
| `audio_tower.onnx` | FP32 | 1,22 GB | Estados intermedios |
| `audio_tower_int8.onnx` | INT8 dynamic | 307,7 MB | Estados intermedios |
| `audio_tower_int4.onnx` | INT4 weight-only | 164,5 MB | Estados intermedios |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente la exportación de la torre de audio del modelo `google/embeddinggemma-2` a formato ONNX, con opset 18. No se documenta en la model card la arquitectura interna de esa torre (número de capas, dimensión oculta, mecanismo de atención ni configuración del encoder), por lo que esos detalles quedan como no disponibles. La salida del modelo de embedding es un vector float32 de dimensión 512 normalizado en norma L2, lo que lo hace directamente compatible con índices vectoriales que usan similitud coseno o producto escalar.

No se aporta información sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo fases de RLHF o DPO. Al ser una exportación del modelo base de Google, el entrenamiento correspondería al trabajo original de Google, no al autor de esta conversión. La innovación técnica de este repositorio es puramente de despliegue: separación de pesos FP32 entre un fichero `.onnx` y un `.data` externo, y provisión de variantes cuantizadas en INT8 dinámico e INT4 weight-only para reducir el consumo de memoria y almacenamiento.

La model card incluye hashes SHA-256 para cada fichero, lo que permite verificar la integridad de las descargas en entornos automatizados. El preprocesado de audio (decodificación y conversión a espectrograma de 128 bandas mel) no está incluido y debe realizarse externamente con el procesador del modelo base.

## Capacidades

- Extraccion de embeddings de audio: genera un vector L2-normalizado de dimension 512 a partir de caracteristicas de audio (`input_features`).
- Extraccion de estados intermedios: los ficheros `audio_tower*.onnx` devuelven representaciones por capas, utiles para tareas de analisis o fine-tuning posterior.
- Procesamiento de audio mono a 16 kHz mediante el `AutoProcessor` asociado al modelo base.
- Entrada multimodal declarada: el modelo acepta simultaneamente `input_ids`/`attention_mask` (texto) e `input_features` (audio), lo que sugiere un diseno de encoder compartido entre texto y audio.
- Inferencia via ONNX Runtime, sin dependencia de PyTorch en tiempo de ejecucion.
- Cuantizaciones listas para desplegar en FP32, INT8 e INT4.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision ni thinking mode; la pipeline declarada es `feature-extraction`.

## Casos de uso

- Busqueda semantica por audio: indexar fragmentos de audio como vectores de 512 dimensiones y recuperar los mas similares ante una consulta, usando un indice vectorial tipo FAISS o Qdrant con similitud coseno.
- Sistemas de recomendacion musical o de podcasts: generar embeddings de pistas y calcular vecinos cercanos para sugerir contenido con similitud acustica, aprovechando la variante INT8 de 583 MB para reducir coste de memoria.
- Deduplicacion y deteccion de contenido repetido: comparar embeddings de un catalogo de audios para identificar duplicados o versiones casi identicas mediante umbral de similitud.
- Clasificacion y etiquetado automatico: usar los embeddings como caracteristicas de entrada para un clasificador ligero (regresion logistica, SVM, MLP pequeno) en tareas de genero musical, deteccion de voz o eventos sonoros.
- Analisis por capas para investigacion: emplear `audio_tower*.onnx` para extraer estados intermedios y estudiar que representaciones capturan informacion acustica concreta, sin necesidad de cargar PyTorch.
- Despliegue en entornos edge o servidores sin GPU: la variante `audio_tower_int4.onnx` (164,5 MB) permite ejecutar la torre en CPU con ONNX Runtime en dispositivos con recursos limitados.
- Preprocesado de pipelines multimodales: alimentar un sistema de recuperacion aumentada que combine transcripciones (texto) y embeddings de audio para enrutado o filtrado previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye tamanos de fichero, hashes SHA-256, especificaciones de entrada/salida y el requisito de opset 18. No hay cifras de latencia, throughput ni metricas de calidad de recuperacion (por ejemplo, recall@k o precision en tareas de audio).

## Requisitos de hardware

- VRAM estimada para el modelo de embedding final: aproximadamente 2,4 GB en FP32, 0,6 GB en INT8 y 0,8 GB en INT4 (incluyendo pesos y activaciones basicas).
- VRAM estimada para la torre de audio: aproximadamente 1,3 GB en FP32, 0,3 GB en INT8 y 0,17 GB en INT4.
- Cabe en GPU de consumo: si. Las variantes INT8 e INT4 caben con holgura en tarjetas con 4-6 GB de VRAM (GTX 1650, RTX 3050, RTX 4060). La variante FP32 de embedding (2,31 GB de pesos) entra en GPU de 6 GB o superiores.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT). Para cargas altas se recomienda A100, H100, L40S o RTX 4090; para cargas ligeras, RTX 3060 o superior.
- Alternativa en CPU: viable con las variantes INT8 e INT4, dado su tamano reducido.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT), Triton Inference Server con backend ONNX, o integracion en servicios propios. Para INT4 es obligatorio que el runtime soporte `com.microsoft::MatMulNBits`.
- Latencia y throughput estimados: no disponibles. No se publican mediciones en la model card.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables, ni datos de rendimiento que permitan situar esta exportacion frente a alternativas como CLAP, Wav2Vec2 o el propio `google/embeddinggemma-2` en su formato original.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `bdrgon/embeddinggemma2-audio-tower-onnx` | no disponible | no disponible | Apache 2.0 | ONNX | HuggingFace |
| `google/embeddinggemma-2` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas de embedding de audio | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo original: es una exportacion a ONNX de la torre de audio de `google/embeddinggemma-2`. La calidad final depende integramente del modelo base, sobre el que esta ficha no aporta datos de evaluacion.
- Ausencia total de benchmarks: no se ha verificado la fidelidad numerica de las versiones cuantizadas (INT8/INT4) respecto al FP32. La cuantizacion INT4 weight-only puede degradar la similitud de los embeddings, por lo que conviene validar con un conjunto propio antes de usarla en produccion.
- Preprocesado externo obligatorio: el repositorio no incluye decodificacion de audio ni conversion a las 128 bandas mel. Un preprocesado incorrecto (frecuencia de muestreo distinta de 16 kHz, estereo en lugar de mono) producira embeddings invalidos.
- Dependencia de version del runtime: los modelos INT4 requieren soporte de `com.microsoft::MatMulNBits` en ONNX Runtime; en runtimes antiguos fallaran al cargar.
- Idioma y dominio: no se declaran idiomas soportados ni dominios de audio cubiertos, por lo que no puede asumirse un comportamiento multilingue o multiclase sin pruebas previas.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la conversion no ofrece ninguna garantia. Conviene revisar tambien las condiciones del modelo base de Google, que puede tener terminos adicionales.
- Repositorio sin traccion: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo produce embeddings y no texto; el riesgo equivalente es la baja discriminacion entre audios acusticamente parecidos.
- Sin informacion sobre entrenamiento, sesgos ni composicion del dataset: no es posible evaluar sesgos de genero, idioma o tipo de audio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bdrgon/embeddinggemma2-audio-tower-onnx
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- No se han encontrado en la busqueda web enlaces relevantes (papers, blogs, repos o demos) relacionados con este modelo o con la exportacion a ONNX de la torre de audio de EmbeddingGemma 2.
