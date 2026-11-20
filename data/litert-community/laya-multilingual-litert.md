# litert-community/Laya-Multilingual-LiteRT

## Resumen

Laya Multilingual LiteRT es una conversión optimizada del modelo `convaiinnovations/laya` (basado en la arquitectura ModernBERT) para su ejecución en dispositivos móviles mediante LiteRT (el runtime de Google AI Edge, sucesor de TensorFlow Lite). El modelo resuelve un problema concreto: la clasificación de texto y la clasificación zero-shot en un solo paso hacia adelante (*forward pass*), sin generación autoregresiva, lo que permite responder preguntas definidas en tiempo de ejecución sobre un texto o un estado JSON. Está publicado por la comunidad `litert-community` bajo licencia Apache 2.0.

La relevancia actual reside en su despliegue en hardware móvil: el modelo corre en la GPU y la NPU de un Samsung Galaxy S26 con latencias de 51 ms en GPU y 36 ms en NPU para una ventana de 256 tokens. El paquete recomendado ocupa 0,68 GB en el dispositivo, con grafos TFLite separados para el cuerpo del modelo y la cabeza de clasificación, más una tabla de embeddings externa en FP16. El repositorio completo pesa 3,5 GB e incluye variantes en FP32 y ventanas de 512 tokens.

El checkpoint multilingüe (mmBERT-base) es la variante a elegir para texto no inglés o mixto. El editor declara más de 100 idiomas, aunque solo inglés y japonés han sido validados en este repositorio. En XNLI inglés, Convai reporta 0,843 para este checkpoint frente a 0,860 del checkpoint exclusivamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), checkpoint mmBERT-base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (ventana validada); variante de 512 tokens disponible solo para CPU de escritorio |
| Tipos de cuantizacion | FP16 para embeddings y pesos del grafo principal (`wfp16`), FP32 para la cabeza de activación y referencia FP32 completa |
| Idiomas soportados | en, ja (validados); el editor declara más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (LiteRT): `laya_ml_s256_embeds_wfp16.tflite`, `laya_ml_act_head_fp32.tflite`, `token_embeddings_fp16.bin`, `laya_ml_calibration.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un encoder transformer de la familia ModernBERT en su variante multilingüe mmBERT-base, convertido a LiteRT. La inferencia no es generativa: el modelo recibe un texto o un estado JSON junto con un conjunto de preguntas definidas en tiempo de ejecución y devuelve, en un único *forward pass*, una opción seleccionada entre varias, una puntuación en escala ordinal o una probabilidad sí/no. La cabeza de clasificación se ejecuta en un grafo TFLite separado (`laya_ml_act_head_fp32.tflite`) del cuerpo principal, y los embeddings de tokens se almacenan en un fichero externo en FP16 que la aplicación consulta por filas (lo que añade entre 15 y 20 ms de latencia).

La conversión incluye un fichero de calibración (`laya_ml_calibration.json`) con temperaturas por pregunta, necesarias para convertir los logits en probabilidades calibradas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La validación se realizó con LiteRT 2.2.0 en un Galaxy S26 (SM-S942Q, Android 16) y un Pixel 11 Pro (Tensor G6, Android 17).

## Capacidades

- Clasificación de texto en un solo paso: selección entre opciones predefinidas, puntuación ordinal y probabilidad binaria sí/no.
- Clasificación zero-shot: las preguntas y las opciones se definen en tiempo de petición, sin reentrenamiento.
- Procesamiento de texto plano y de estados JSON como entrada.
- Multilingüe: inglés y japonés validados; el editor declara más de 100 idiomas.
- Salida estructurada en JSON con probabilidades por opción, nivel de confianza y probabilidad de acción.
- Ejecución en GPU y NPU de dispositivos Android, y en CPU de escritorio.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso ni agentes: es exclusivamente un modelo de clasificación.

## Casos de uso

- Triaje de correos de soporte: el modelo clasifica un correo entrante en categorías como "reembolso" o "ayuda técnica" en un solo paso. En el ejemplo de la model card, un correo sobre un cargo duplicado devuelve `refund` con probabilidad 0,9835 en inglés y 0,9954 en japonés, con 34 tokens de entrada y 0 de salida.
- Enrutamiento de tickets en aplicaciones móviles: al ejecutarse en la NPU del dispositivo (36 ms por pregunta de 256 tokens), permite clasificar localmente sin enviar el texto a un servidor, lo que reduce latencia y preserva la privacidad.
- Moderación de contenido en el dispositivo: clasificación binaria sí/no de mensajes o comentarios con umbrales de probabilidad calibrados mediante el fichero de calibración.
- Análisis de sentimiento ordinal: puntuación en escala (por ejemplo, de muy negativo a muy positivo) usando el tipo de pregunta ordinal del modelo.
- Extracción de intención en asistentes de voz o chatbots: clasificación de la intención del usuario entre un conjunto acotado de opciones definidas por la aplicación.
- Clasificación zero-shot de documentos o reseñas en inglés y japonés sin datos etiquetados, útil para prototipado rápido en aplicaciones Android.
- Procesamiento por lotes en CPU de escritorio con la variante de 512 tokens para textos más largos, aunque esta variante solo se validó en CPU de escritorio y no en dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| XNLI inglés (checkpoint multilingüe) | 0,843 |
| XNLI inglés (checkpoint inglés, referencia) | 0,860 |
| Latencia GPU, Galaxy S26, 256 tokens | 51 ms por pregunta |
| Latencia NPU Hexagon, Galaxy S26, 256 tokens | 36 ms por pregunta |
| Tiempo de compilación NPU en primer arranque | ~40 s |
| Precisión de validación | 81 respuestas validadas; FP16 simple alteró una respuesta; FP16 con acumulación FP32 superó el límite de 0,01 de probabilidad en una fila |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento o generación en la información disponible, lo que es coherente con la naturaleza del modelo (clasificación, no generación).

## Requisitos de hardware

- Almacenamiento en dispositivo: 0,68 GB para el paquete recomendado (siete ficheros, ~680 MB en escritorio).
- VRAM/RAM: no disponible de forma explícita; el grafo principal en FP16 ocupa 250.889.040 bytes y la referencia FP32 500.970.372 bytes, más la tabla de embeddings externa.
- GPU móvil: validado en Samsung Galaxy S26 (SM-S942Q, Android 16) y Pixel 11 Pro (Tensor G6, Android 17). Se recomienda solicitar FP32 explícito en GPU.
- NPU: validado únicamente en el Hexagon del Galaxy S26; requiere empaquetar las librerías de Qualcomm listadas en `android/README.md`.
- CPU de escritorio: soportado con Python 3.12, `ai-edge-litert==2.1.6`, `ml-dtypes==0.6.0`, `transformers==5.17.0`, `tokenizers==0.23.2` y `numpy==2.5.3`.
- Despliegue: LiteRT (runtime de Google AI Edge) en Android con Kotlin, y Python en escritorio mediante `laya_host.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: 51 ms en GPU y 36 ms en NPU por pregunta de 256 tokens; los embeddings externos añaden 15-20 ms.

## Comparativa con modelos similares

| Modelo | Checkpoint | Tamano en dispositivo | Latencia GPU (256 tokens) | App de ejemplo | Licencia |
|---|---|---|---|---|---|
| Laya-Multilingual-LiteRT (este) | Multilingüe, mmBERT-base | 0,68 GB | 51 ms (NPU 36 ms) | Muestra Android y zero_shot_classification | Apache 2.0 |
| Laya-English-LiteRT | Inglés, ModernBERT-large y su fine-tune `typed-decisions/` | 0,85 GB cada uno | 123 ms (fine-tune 126 ms) | Ninguna; función Kotlin en la model card | Apache 2.0 |
| laya-LiteRT | Los mismos dos checkpoints sin el fine-tune | 1,3 GB multilingüe, 1,7 GB inglés | 54 ms multilingüe, 127 ms inglés | Ninguna; `laya_host.py` y `HOST_CONTRACT.md` | Apache 2.0 |

La diferencia clave frente a `laya-LiteRT` es que este repositorio consulta las filas de embeddings en la aplicación (tabla externa en FP16) en lugar de mantener la tabla dentro de los grafos FP32, lo que reduce el tamaño del paquete a costa de 15-20 ms adicionales de latencia.

## Limitaciones y advertencias

- Solo se probó un dispositivo (Galaxy S26); la NPU solo se validó en ese modelo. No hay validación en otros teléfonos.
- En GPU es obligatorio solicitar FP32 explícito: FP16 simple alteró una de 81 respuestas y FP16 con acumulación FP32 superó el límite de 0,01 de probabilidad en una fila de validación.
- Las preguntas con más de 20 opciones no fueron validadas.
- Los grafos de 512 tokens solo se ejecutaron en CPU de escritorio, no en dispositivo.
- Solo inglés y japonés están validados; el resto de los más de 100 idiomas declarados no tienen verificación publicada.
- El modelo no genera texto ni razona de forma multi-paso; usarlo para tareas generativas produciría resultados incorrectos.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades calibradas dependen del fichero de temperaturas y pueden desviarse fuera de la distribución de validación.
- Dependencias frágiles: `ai-edge-litert` 2.1.3 falla con `ImportError` en `laya_host.py`, y la 2.1.6 sin `ml-dtypes` falla con `ModuleNotFoundError`.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos específicos del checkpoint en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Laya-Multilingual-LiteRT
- Modelo base: https://huggingface.co/convaiinnovations/laya
- LiteRT (Google AI Edge): https://github.com/google-ai-edge/litert
- Ejemplo zero-shot classification en litert-samples: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/zero_shot_classification
- Laya-English-LiteRT: https://huggingface.co/litert-community/Laya-English-LiteRT
- laya-LiteRT: https://huggingface.co/litert-community/laya-LiteRT
