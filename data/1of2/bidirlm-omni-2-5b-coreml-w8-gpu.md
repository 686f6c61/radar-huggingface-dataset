# 1of2/bidirlm-omni-2.5b-coreml-w8-gpu

## Resumen

BidirLM Omni 2.5B Core ML W8A16 GPU es una conversión a Core ML del modelo de embeddings BidirLM/BidirLM-Omni-2.5B-Embedding, publicada por el usuario 1of2. No es un modelo generativo: es un codificador bidireccional ómnimodal que convierte mensajes de texto, imágenes y audio en un único vector de 2.048 dimensiones, normalizado L2. La conversión empaqueta cuatro codificadores completos (lenguaje, visión, front end de audio y encoder de audio) como programas compilados que se ejecutan en la GPU de equipos Mac con Apple Silicon.

El modelo base es un encoder bidireccional de 2.500 millones de parámetros derivado de Qwen3 según documentación de terceros, con una torre de visión tipo ViT con jerarquía DeepStack y una ruta de audio que trabaja sobre Mel-espectrogramas. Esta distribución concreta cuantiza los pesos de proyección a INT8 por canal con activaciones FP16 (W8A16), mantiene la tabla de embeddings en FP16 y el flujo residual en FP32, y admite mensajes de hasta 8.192 tokens incluyendo la plantilla de chat y los marcadores de medios expandidos.

Su relevancia es doble. Por un lado, ofrece búsqueda semántica y recuperación multimodal completamente en local sobre macOS, sin enviar datos a un servidor. Por otro, todas las distribuciones de la familia W8 de 1of2 comparten el mismo espacio vectorial (`w8a16:ane-8k-v1`), de modo que un mismo índice puede mezclar vectores generados en Neural Engine y en GPU, lo que simplifica el despliegue en flotas heterogéneas de Macs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder) ómnimodal: torre de lenguaje, torre de visión tipo ViT con jerarquía DeepStack y ruta de audio (front end Mel + encoder). Derivado de Qwen3 según documentación de terceros |
| Parametros totales | 2.500 millones (aproximado, según denominación del modelo y del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens por mensaje, plantilla de chat y medios incluidos. Imágenes: de 64 a 1.024 tokens visuales. Audio: 25 tokens cada 2 segundos, hasta unos 10 minutos por mensaje |
| Tipos de cuantizacion | W8A16: pesos de proyección en INT8 por canal, activaciones FP16, tabla de embeddings en FP16, flujo residual en FP32 |
| Idiomas soportados | no disponible en la información de esta ficha; documentación de terceros del modelo base menciona más de 90 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`) dentro de un bundle de unos 2,8 GB, con `manifest.json`, `Resources/` y `checksums.files`. No incluye safetensors ni GGUF |

Datos adicionales: dimensión de embedding 2.048, normalización L2 y pooling de media enmascarado sobre todos los tokens del mensaje (incluidos los de la plantilla de chat). No existen prompts de consulta ni de documento: consultas y documentos se codifican de forma idéntica.

## Arquitectura y entrenamiento

El modelo base es un encoder bidireccional, no un decoder autorregresivo: atiende el mensaje completo en una sola pasada y devuelve estados ocultos finales normalizados, a partir de los cuales el host aplica el pooling. La ruta de visión divide la imagen en parches de 16 píxeles fusionados 2 a 2, usa una tabla de posiciones aprendida de 48 x 48 interpolada en el host y asigna posiciones rotatorias de tres ejes (tiempo, fila, columna) intercaladas entre pares de frecuencias; el texto posterior a una imagen continúa desde la posición más alta utilizada. La ruta de audio procesa audio mono a 16 kHz con 128 bins Mel (ventana 400, salto 160) y genera 25 tokens cada 2 segundos; el front end consume 20 fragmentos Mel por llamada y el host agrupa los tokens de cada fragmento para el encoder de audio.

En esta distribución Core ML, los cuatro encoders GPU (`language_gpu`, `vision_gpu`, `audio_front_gpu`, `audio_encoder_gpu`) reciben el elemento completo, rellenado hasta la siguiente longitud declarada (formas enumeradas de Core ML: de 64 a 8.192 tokens para lenguaje y audio, de 256 a 4.096 parches para visión), con una máscara de atención aditiva (`bias` con valor 0 para filas reales y -30000 para relleno y tokens enmascarados). El encoder de lenguaje recibe las filas de embeddings, tablas rotatorias calculadas en el host a partir de `inv_freq.f32` y dos conjuntos de filas DeepStack. Los programas fueron auditados con los planes de cómputo de Core ML, verificando que cada operación se prefiere y se soporta en GPU.

El paper asociado describe un proceso de adaptación y fusión de variantes del modelo; no se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni del detalle de las etapas de alineación (RLHF, DPO u otras).

## Capacidades

- Generación de embeddings de texto: un vector de 2.048 dimensiones, normalizado L2, por mensaje de hasta 8.192 tokens.
- Generación de embeddings de imagen: una imagen por mensaje, redimensionada entre 65.536 y 1.048.576 píxeles, que produce entre 64 y 1.024 tokens visuales.
- Generación de embeddings de audio: audio mono a 16 kHz, hasta unos 10 minutos por mensaje.
- Embeddings de mensajes mixtos: texto, imagen y audio pueden combinarse en un mismo mensaje dentro del mismo espacio vectorial.
- Recuperación multimodal cruzada: al compartir espacio, permite búsquedas texto a imagen, texto a audio, imagen a imagen y audio a audio.
- Capacidad multilingüe: la documentación de terceros del modelo base indica más de 90 idiomas; la model card de esta conversión no especifica lista de idiomas.
- Ejecución completamente local en GPU de Apple Silicon, sin llamadas de red.
- No soporta generación de texto, razonamiento autoregresivo, tool calling, function calling, uso como agente ni modos de pensamiento. No hay prompts de instrucción de ningún tipo.
- No soporta decodificación especulativa ni atención lineal: la atención es bidireccional completa sobre la ventana de 8.192 tokens.

## Casos de uso

- Búsqueda semántica en documentación técnica multilingüe: indexar manuales y notas en varios idiomas en un único índice de 2.048 dimensiones y consultar en lenguaje natural sin prompts de consulta, ya que consultas y documentos se codifican igual. Adecuado porque el modelo cubre decenas de idiomas y no requiere infraestructura de servidor.
- Recuperación multimodal en aplicaciones macOS: permitir que una app de notas o de gestión documental busque una foto, un clip de audio o un párrafo escribiendo una descripción. La convivencia de modalidades en un mismo espacio vectorial evita mantener índices separados.
- Clasificación y agrupación de audio a escala: vectorizar podcasts, reuniones o llamadas (hasta 10 minutos por mensaje) y aplicar clustering o clasificación por similitud coseno. La ruta de audio dedicada evita depender de transcripciones intermedias.
- Deduplicación semántica de corpus: comparar los embeddings de millones de documentos para localizar duplicados y casi duplicados antes de alimentar un pipeline de entrenamiento o un almacén de datos. El pooling de media enmascarado sobre todos los tokens da una representación estable del documento completo.
- Filtrado y recomendación de contenido: construir un índice de similitud para sugerir artículos, imágenes o episodios relacionados a partir del historial del usuario, ejecutando todo el cálculo en el Mac del propio usuario.
- Moderación asistida de contenido: agrupar y marcar mensajes similares a ejemplos previamente etiquetados mediante búsqueda por vecinos más cercanos, útil como primera pasada antes de la revisión humana.
- Análisis de privacidad en entornos sensibles: procesar expedientes clínicos o jurídicos en local, aprovechando que la inferencia ocurre en la GPU del equipo y que no se envía ningún dato fuera.
- Compatibilidad de índices entre equipos: al compartir el identificador de espacio `w8a16:ane-8k-v1` con las demás distribuciones W8 de 1of2, un índice puede contener vectores calculados en Neural Engine y en GPU, lo que permite repartir la carga de indexación según la máquina disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El resumen del paper asociado (arXiv 2604.02045) afirma que BidirLM-Omni-2.5B queda primero entre las líneas base en el benchmark MIEB y tercero en MAEB, sin que la información disponible incluya las puntuaciones numéricas ni las tablas comparativas. La model card de esta conversión no publica métricas de calidad de embedding, latencia ni throughput de inferencia.

## Requisitos de hardware

- Plataforma obligatoria: Mac con Apple Silicon y macOS 15 o posterior (los programas Core ML son multifunción). La validación se hizo en un Apple M4 Max con macOS 27.0.1; el autor indica que otras combinaciones no están cualificadas.
- GPU: cualquier GPU integrada de Apple Silicon soportada por Core ML. Esta distribución no incluye funciones para Neural Engine; las versiones con ANE se publican en repositorios separados. No hay soporte para CUDA ni para GPUs NVIDIA o AMD discretas.
- Memoria: no se publican cifras de VRAM o memoria unificada requerida. La descarga ocupa unos 2,8 GB; hay que sumar el espacio de la caché de modelos compilados de Core ML.
- Disco y caché: la primera carga de cada función compila el programa para el dispositivo (5 a 9 segundos en conjunto para los cuatro encoders GPU en el equipo de validación) y las cargas posteriores reutilizan la caché (aproximadamente 1 segundo en conjunto, hasta 4 segundos). Core ML indexa la caché por la ruta del programa, así que mover el directorio descargado fuerza una recompilación.
- Configuración de Core ML: no debe activarse `allowLowPrecisionAccumulationOnGPU`, ya que los encoders se cualificaron con la acumulación FP32 por defecto de Core ML.
- Opciones de despliegue: carga directa con Core ML a partir de `manifest.json`, más el runtime de referencia en Python (`encoder.py`) que implementa el contrato de ejecución. No es compatible con vLLM, TGI, llama.cpp ni Ollama en este formato. La documentación de terceros consultada menciona una variante GGUF del modelo base distribuida por otros canales, no por este repositorio.
- Latencia y throughput: no disponibles. Solo se documentan los tiempos de carga indicados arriba.

## Comparativa con modelos similares

Comparación dentro de la familia de conversiones Core ML W8 publicadas por el mismo autor para el mismo modelo base:

| Distribución | Modos soportados | Organización de programas | Contexto | Licencia |
|---|---|---|---|---|
| `1of2/bidirlm-omni-2.5b-coreml-w8-gpu` (esta) | GPU | Un programa por familia (lenguaje, visión, audio) | 8.192 tokens | apache-2.0 |
| `1of2/bidirlm-omni-2.5b-coreml-w8` | Neural Engine y GPU | Un programa por función | 8.192 tokens | apache-2.0 |
| `1of2/bidirlm-omni-2.5b-coreml-w8-bundle` | Neural Engine y GPU | Un programa por familia | 8.192 tokens | apache-2.0 |
| `1of2/bidirlm-omni-2.5b-coreml-w8-ane` | Neural Engine | Un programa por familia | 8.192 tokens | apache-2.0 |

Todas comparten el mismo espacio vectorial, por lo que sus vectores pueden convivir en un único índice. La opción de un programa por familia (esta distribución y las dos anteriores basadas en familias) reduce el tiempo de carga, porque Core ML lee el programa completo cada vez que carga una de sus funciones.

Frente a alternativas de embeddings de terceros, la información disponible solo permite una comparación cualitativa: la documentación consultada sitúa a Jina como opción que prioriza tamaño reducido y velocidad de inferencia a costa de una cobertura multilingüe menor, mientras que BidirLM-Omni prioriza amplitud de idiomas y cobertura multimodal. No se dispone de cifras de parámetros, contexto ni rendimiento de esas alternativas en la información proporcionada, por lo que no se incluye una tabla numérica.

## Limitaciones y advertencias

- No es un modelo generativo. No produce texto, no sigue instrucciones y no admite tool calling, agentes ni cadenas de razonamiento. Solo devuelve vectores.
- Ausencia de prompts de consulta y documento: el modelo no permite el patrón asimétrico típico de algunos recuperadores, lo que puede penalizar tareas de recuperación que dependen de instrucciones específicas.
- Límite duro de 8.192 tokens por mensaje. Las entradas más largas provocan un error, nunca un truncado automático, lo que obliga a trocear en el host.
- Dependencia estricta de plataforma: requiere Apple Silicon y macOS 15 o posterior. El autor solo ha cualificado Apple M4 Max con macOS 27.0.1, así que el comportamiento en otros equipos no está garantizado.
- Esta distribución no incluye funciones para Neural Engine. En equipos donde interese el ANE hay que usar otra de las distribuciones de la familia.
- No activar `allowLowPrecisionAccumulationOnGPU`: altera la precisión con la que se cualificaron los encoders.
- Fragilidad de rutas y revisiones: mover el directorio de descarga invalida la caché de compilación, y el autor recomienda fijar una revisión concreta del Hub en producción en lugar de seguir `main`.
- Revisiones retiradas: las revisiones de `1of2/bidirlm-omni-2.5b-coreml-w8` hasta `c228769d56fad334c82d726c31f184122f04f5f9` contenían una publicación retirada (r4, 32.768 tokens) cuyos vectores no son bit a bit idénticos a los de este espacio; mezclarlos en un mismo índice degrada la consistencia de la recuperación.
- Idiomas: la model card de esta conversión no declara lista de idiomas ni cobertura verificada. Las cifras de más de 90 o 119 idiomas que aparecen en fuentes de terceros corresponden al modelo base y no están confirmadas para esta cuantización.
- Sesgos y alucinación: no se documentan evaluaciones de sesgo ni de equidad para esta conversión. Al ser un modelo de representación, no alucina texto, pero sí puede reproducir sesgos presentes en el corpus de entrenamiento del modelo base a través de las similitudes que calcula. No hay información disponible sobre la composición del dataset que permita estimar su magnitud.
- Licencia: apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes de audio y visión de terceros citados en la documentación del proyecto original.
- Calidad de la cuantización: la cuantización INT8 por canal de los pesos de proyección puede introducir una pérdida de precisión respecto al modelo base en FP16. No se publican métricas que cuantifiquen esa diferencia.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8-gpu
- Modelo base: https://huggingface.co/BidirLM/BidirLM-Omni-2.5B-Embedding
- Colección BidirLM-Embedding: https://huggingface.co/collections/BidirLM/bidirlm-embedding
- Paper de BidirLM: https://arxiv.org/pdf/2604.02045
- Distribución con Neural Engine y GPU, un programa por función: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8
- Distribución con Neural Engine y GPU, un programa por familia: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8-bundle
- Distribución solo Neural Engine: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8-ane
- Ficha de terceros sobre el modelo base: https://www.aimodels.fyi/models/huggingFace/bidirlm-omni-2.5b-embedding-bidirlm
- Documentación de terceros sobre la variante GGUF: https://github.com/Luoshu-Intelligent-Computing/vendor-crispasr/blob/main/hf_readmes/bidirlm-omni-2.5b-GGUF.md
