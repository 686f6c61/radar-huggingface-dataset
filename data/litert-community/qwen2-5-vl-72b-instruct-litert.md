# litert-community/Qwen2.5-VL-72B-Instruct-LiteRT

## Resumen

Qwen2.5-VL-72B-Instruct-LiteRT es una conversión del modelo vision-language Qwen2.5-VL-72B-Instruct de Alibaba Qwen al formato LiteRT-LM (.litertlm), orientado a inferencia on-device. La conversión la mantiene el colectivo litert-community y se ha generado con LiteRT Tensor API (decoder de texto), litert-torch 0.10.0 (encoder de visión y tabla de tokens), ai-edge-quantizer 0.10.0 y litert-lm-builder 0.19.0. El resultado es un único fichero de 42,7 GB que empaqueta el decoder de texto cuantizado a int4, el encoder de visión y el adaptador en int8, la tabla de embeddings en int8, el tokenizador y la plantilla de chat.

El modelo base es el Qwen2.5-VL-72B-Instruct, un transformer multimodal de 80 capas con decoder Qwen2 de hidden size 8.192, 64 cabezas de consulta y 8 cabezas key-value (GQA), más un encoder de visión de 32 capas. Lee texto, imágenes y vídeo, aunque esta conversión concreta solo procesa imágenes a una resolución fija de 448 × 448 (256 tokens de imagen) y una única imagen por conversación, con una ventana de contexto de 2.048 tokens. El vídeo no está incluido en este fichero.

La relevancia de esta ficha está en que demuestra la viabilidad de ejecutar un modelo de 72.000 millones de parámetros en hardware de consumo de gama alta (Apple M4 Max con 128 GB de memoria unificada) a 8,55 tokens/s en decodificación tras procesar una imagen. No es un modelo para servir en producción a gran escala, sino una pieza de referencia para quien quiera evaluar LiteRT-LM como runtime on-device con modelos multimodales grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: decoder de texto Qwen2 (80 capas) + encoder de vision (32 capas) + adaptador |
| Parametros totales | 72.000 millones (modelo base Qwen2.5-VL-72B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (KV cache declarada en el fichero) |
| Tipos de cuantizacion | Pesos int4 blockwise (bloque de 128) en decoder; capa de salida int8; embeddings int8; vision encoder y adaptador int8 per-channel; activaciones fp32 declaradas |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5-VL; la model card no los enumera) |
| Licencia | Qwen License Agreement (etiquetada como "other" en Hugging Face) |
| Formato de pesos | .litertlm (LiteRT-LM), 42.684.876.864 bytes |
| Tamano del repositorio | 87,5 GB |
| Resolucion de imagen | 448 × 448 fija (256 tokens de imagen), una imagen por conversacion |
| Video | no soportado en este fichero |
| Runtime | LiteRT-LM 0.19.0 |
| Fecha de creacion | 2026-10-30 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-VL-72B-Instruct original: un transformer decoder-only de 80 capas con hidden size de 8.192, 64 cabezas de atención de consulta y 8 cabezas key-value (GQA con ratio 8:1), acoplado a un encoder de visión de 32 capas mediante un adaptador. El modelo base fue entrenado por Alibaba Qwen; esta conversión no aporta información sobre el dataset de entrenamiento, el número de tokens ni las fases de alineación (RLHF/DPO) del modelo original, por lo que esos datos deben consultarse en la model card del repositorio Qwen/Qwen2.5-VL-72B-Instruct.

La innovación técnica de esta ficha no está en el entrenamiento, sino en la conversión y el empaquetado para LiteRT-LM. El fichero .litertlm agrupa en un solo contenedor el decoder de texto con pesos int4 blockwise (bloque de 128) y capa de salida int8, la tabla de embeddings en int8 como sección independiente, el encoder de visión y el adaptador en int8 per-channel con activaciones fp32, el tokenizador y la plantilla de chat. Se declaran firmas de prefill de 32, 128 y 1.024 tokens y una firma de decode sobre una KV cache de 2.048 tokens. La versión publicada el 2026-11-01 cambió los pesos del encoder de visión y adaptador de fp32 a int8, reduciendo el fichero en 2,1 GB y manteniendo respuestas idénticas palabra por palabra en 23 preguntas de evaluación (3 de imagen y 20 de MMStar) y en la mayoría de las respuestas de un conjunto adicional de diez imágenes con preguntas multi-paso. El sampler del fichero es top-k 1 / top-p 1.0 (greedy efectivo, coherente con el temperature 0.000001 del generation_config original); la repetition penalty de 1.05 del modelo fuente no está incluida en el fichero y debe pasarse por mensaje en la API de LiteRT-LM.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de una imagen y una pregunta en lenguaje natural.
- Comprensión de imágenes a resolución fija 448 × 448 (256 tokens de imagen), con redimensionado bicúbico y sin preservar la relación de aspecto.
- Preguntas de conteo, descripción, lectura de contenido visual y razonamiento multi-paso sobre una imagen (validado en la model card con preguntas de seguimiento).
- Conversaciones multi-turno dentro de una ventana de 2.048 tokens, con una sola imagen por conversación.
- Plantilla de chat compatible con mensajes de sistema; si no se proporciona uno, se aplica el mensaje por defecto "You are a helpful assistant.".
- Decodificación greedy configurable (top-k, top-p) y penalización de repetición por mensaje a través de la API Python de LiteRT-LM.
- Ejecución on-device en GPU (backend WebGPU en macOS) y en CPU.
- No soporta vídeo en este fichero, ni tool calling, ni function calling, ni modo thinking explícito, ni audio.

## Casos de uso

- Asistente visual local en estación de trabajo Apple Silicon: responder preguntas sobre capturas, fotos o diagramas sin enviar la imagen a la nube, aprovechando la ejecución on-device en la GPU del Mac mediante LiteRT-LM y el backend WebGPU.
- Aplicación de escritorio macOS de preguntas sobre una imagen: el repositorio google-ai-edge/litert-samples incluye la app picture_questions, que usa este fichero o Muse-Glimmer-30B a través de la API C de LiteRT-LM; requiere un Mac con 64 GB de memoria o más.
- Evaluación de LiteRT-LM como runtime para modelos multimodales grandes: sirve como referencia para medir latencia, throughput y fidelidad de cuantización int4/int8 frente al modelo original en fp16/bf16.
- Prototipado de pipelines de inspección visual con privacidad estricta: clasificación o descripción de imágenes en entornos sin conectividad, donde el coste de enviar datos a un servicio externo es inasumible.
- Docencia e investigación sobre cuantización: el par de ficheros (fp32 vs int8 en visión) y las métricas de coincidencia palabra por palabra permiten estudiar el impacto de la cuantización en la salida de un VLM de 72B.
- Verificación de accesibilidad: describir el contenido de una imagen a una persona con discapacidad visual en un dispositivo local, con la limitación de resolución fija y una sola imagen por conversación.
- Benchmark de hardware: medir tokens/s en GPUs de consumo con memoria unificada grande (M4 Max 128 GB) como referencia para decidir si merece la pena desplegar modelos de esta escala en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de rendimiento y una evaluación cualitativa de fidelidad de la cuantización:

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion (GPU) | 8,55 tokens/s | Apple M4 Max 128 GB, macOS 27.0, litert-lm 0.19.0 (WebGPU), imagen 448 × 448, pregunta corta, 284-290 tokens de prompt (256 de imagen), mediana de 6 preguntas en 2 procesos, 2026-10-31 |
| Decodificacion (CPU) | 3,6 a 3,9 veces mas lenta que GPU | Build anterior con vision encoder en fp32, backend CPU para ambos |
| Coincidencia de respuestas (int8 vs fp32 en vision) | 23/23 identicas palabra por palabra | 3 preguntas de imagen + 20 de MMStar |
| Coincidencia en 10 imagenes con preguntas multi-paso | 7/10 primeras respuestas identicas; 3 solo cambian redaccion; 7/10 seguimientos identicos, 2 solo redaccion, 1 paso intermedio distinto con misma respuesta | Conjunto adicional de 10 imagenes |

## Requisitos de hardware

- VRAM/memoria estimada: el fichero .litertlm ocupa 42,7 GB; se necesita margen adicional para activaciones y KV cache de 2.048 tokens. La model card indica que la app de ejemplo requiere un Mac con 64 GB de memoria o más.
- GPU recomendadas: Apple M4 Max con 128 GB de memoria unificada (medido); no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en GPUs consumer con 24 GB o menos (RTX 4090, 3090). Requiere memoria unificada o VRAM de al menos 48-64 GB.
- Opciones de despliegue: LiteRT-LM 0.19.0 (API Python `litert_lm.Engine` y API C); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 8,55 tokens/s en decode sobre M4 Max 128 GB con GPU; en CPU, 3,6-3,9 veces más lento según la model card (build anterior con visión en fp32).
- Almacenamiento: 42,7 GB para el fichero .litertlm; el repositorio completo ocupa 87,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-72B-Instruct-LiteRT (este) | 72B | 2.048 tokens | .litertlm / LiteRT-LM 0.19.0 | Qwen License | Conversion on-device con cuantizacion int4/int8; 8,55 tok/s en M4 Max |
| Qwen/Qwen2.5-VL-72B-Instruct | 72B | no disponible en la informacion | safetensors / transformers | Qwen License | Modelo base sin cuantizar; soporta video y multiples imagenes; requiere VRAM muy superior |
| Muse-Glimmer-30B | 30B | no disponible | .litertlm / LiteRT-LM | no disponible | Alternativa mencionada en la app picture_questions de litert-samples; menor tamano |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contexto reducido a 2.048 tokens, muy inferior al del modelo base; las conversaciones largas o prompts con mucho texto se truncan.
- Una sola imagen por conversación y resolución fija de 448 × 448 sin preservar la relación de aspecto; detalles finos o imágenes panorámicas pueden perderse.
- Sin soporte de vídeo en este fichero, aunque el modelo base sí lo soporta.
- Sin tool calling, function calling ni modo thinking explícito documentados.
- La repetition penalty de 1.05 del modelo fuente no está incluida; si no se pasa por mensaje, el comportamiento puede diferir del original en generaciones largas.
- La cuantización int4 del decoder y int8 de visión introduce desviaciones menores: en las evaluaciones de la model card se observan diferencias de redacción y, en un caso, un paso intermedio distinto con la misma respuesta final.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de sesgo ni de robustez en la información disponible.
- Licencia Qwen License Agreement (etiquetada "other" en Hugging Face): es necesario revisar los términos del fichero LICENSE del repositorio antes de cualquier uso comercial; la model card no aclara restricciones adicionales derivadas de la conversión.
- Requiere hardware con 64 GB o más de memoria; no es desplegable en GPUs de consumo convencionales.
- El backend GPU de LiteRT-LM 0.19.0 en macOS usa WebGPU, lo que puede limitar el rendimiento frente a backends nativos.
- Modelo con muy poca adopción (194 descargas, 1 like) en el momento de la ficha; no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen2.5-VL-72B-Instruct-LiteRT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct
- Licencia: https://huggingface.co/litert-community/Qwen2.5-VL-72B-Instruct-LiteRT/blob/main/LICENSE
- Version anterior del fichero (commit 9ac47fea): https://huggingface.co/litert-community/Qwen2.5-VL-72B-Instruct-LiteRT/tree/9ac47fea16b1e7816ce59e6bc6c7837f682a92e5
- App de ejemplo picture_questions (macOS): https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert_lm/picture_questions/macos
