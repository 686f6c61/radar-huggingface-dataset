# litert-community/Ovis2.5-2B

## Resumen

Ovis2.5-2B es un modelo de lenguaje y vision (VLM) desarrollado originalmente por AIDC-AI, distribuido aqui en el formato LiteRT-LM (`.litertlm`) por la comunidad `litert-community` para inferencia on-device con el runtime de Google LiteRT-LM. El modelo combina un codificador visual Siglip2 NaViT con un tokenizador visual que proyecta cada grupo de parches de imagen sobre un vocabulario visual de 65 536 entradas, y un decodificador de lenguaje Qwen3-1.7B, sumando aproximadamente 2 000 millones de parametros. Esta pensado para ejecutar tareas de image-text-to-text en dispositivos de borde (moviles, portatiles, equipos de escritorio) sin depender de la nube.

La relevancia actual del modelo reside en su empaquetado: LiteRT-LM permite desplegar un VLM multimodal completo en Android, macOS, Linux y Windows con pesos cuantizados (int8 en la torre de vision, int4 en el decodificador) y un unico fichero de aproximadamente 2,15 GB. Segun la model card, el modelo alcanza un rendimiento SOTA para su tamano en OpenCompass (aproximadamente 73,9 para la variante de 2B) y conserva una correlacion end-to-end de aproximadamente 0,99 tras la cuantizacion int8 de la vision.

El modelo es de tipo *thinking*: puede emitir un bloque `<think>...</think>` antes de la respuesta final, lo que exige configurar un limite de tokens de salida suficiente (al menos 1024) para que la respuesta completa se genere. La licencia es Apache-2.0, lo que facilita su uso comercial y su integracion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador Siglip2 NaViT + tokenizador visual (softmax sobre vocabulario visual de 65 536) + decodificador Qwen3-1.7B |
| Parametros totales | ~2B (2 000 millones, segun denominacion del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens de KV cache |
| Tipos de cuantizacion | Vision int8; decodificador int4 (simetrico, blockwise-32 + OCTAV optimal-clipping); embedding de entrada int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero de ~2,15 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de Ovis2.5: un codificador visual Siglip2 NaViT procesa una unica imagen redimensionada a 512x512 (la normalizacion Siglip esta integrada en el propio codificador) y genera 256 tokens de imagen. Estos tokens pasan por un tokenizador visual que produce una distribucion de probabilidad sobre un vocabulario visual de 65 536 entradas; la representacion resultante se embebe en el mismo espacio estructurado que los tokens de texto. El decodificador de lenguaje es Qwen3-1.7B, que recibe la secuencia multimodal y genera la respuesta.

El empaquetado LiteRT-LM aplica una cuantizacion agresiva orientada a dispositivos de borde: la torre de vision se convierte de forma fiel al reference (correlacion float CPU-parity end-to-end de aproximadamente 1,0, diferencia absoluta maxima de aproximadamente 3e-6, sin operaciones de fallback FLEX/CUSTOM), mientras que los pesos int8 de vision mantienen una correlacion end-to-end de aproximadamente 0,99. El decodificador usa la receta int4 blockwise-32 + OCTAV, la misma empleada en otras builds de la comunidad como Ministral-3-3B-Reasoning (90,7 % en GSM8K) e InternVL3.5-2B. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto e image-text-to-text: responde preguntas sobre imagenes y genera descripciones detalladas.
- Razonamiento multimodal con modo *thinking*: puede emitir un bloque `<think>...</think>` antes de la respuesta final.
- Descripcion de imagenes y respuesta a preguntas visuales (VQA) de un solo turno.
- Procesamiento de multiples imagenes en una misma conversacion mediante adjuntos repetidos (`--attachment` multiple).
- Inferencia completamente on-device en macOS, Linux, Windows y Android (backend GPU LiteRT).
- Servicio local con API compatible con OpenAI mediante `litert-lm serve`.
- Chat interactivo multi-turno a traves de la CLI de LiteRT-LM.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Descripcion automatica de imagenes en dispositivos moviles: el modelo procesa una imagen de 512x512 y genera una descripcion en lenguaje natural completamente en el dispositivo, sin enviar datos a la nube, lo que resulta adecuado para aplicaciones de accesibilidad (lectura de imagenes para personas con discapacidad visual) y para entornos con requisitos de privacidad.
- Asistencia visual en Android: con el backend GPU LiteRT funcionando en un Samsung Galaxy S26 (3840 de 3840 operaciones delegadas en 3 subgrafos, pico de 820 MB), el modelo puede integrarse en aplicaciones Android para tareas de VQA sobre fotos capturadas por la camara.
- Analisis de documentos y capturas en escritorio: mediante `litert-lm serve` se expone una API local compatible con OpenAI que permite integrar el modelo en herramientas de escritorio para extraer informacion de capturas de pantalla o imagenes escaneadas.
- Prototipado rapido de aplicaciones multimodales: la CLI `litert-lm run` con `--from-huggingface-repo` permite descargar y ejecutar el modelo en un solo comando, lo que facilita la validacion de ideas sin infraestructura de servidores GPU.
- Procesamiento por lotes de imagenes en local: el modelo puede encadenarse en scripts para generar pies de foto o metadatos descriptivos de colecciones de imagenes en equipos de sobremesa con Apple Silicon (142,6 tok/s de decodificacion en GPU Metal en un M4 Max).
- Educacion y demostraciones de IA multimodal: al ser un fichero unico de 2,15 GB con licencia Apache-2.0, es adecuado para talleres y cursos en los que se quiera mostrar inferencia multimodal on-device sin depender de servicios externos.
- Evaluacion de modelos en el borde: util para investigadores que necesiten medir latencia, throughput y calidad de un VLM cuantizado en hardware de consumo antes de comprometerse con un despliegue mayor.

## Benchmarks y rendimiento

Rendimiento medido con `litert-lm benchmark` (litert-lm 0.15.0) en un Apple M4 Max, con `-p 256 -d 256 --runs 3`, max-num-tokens 4096 y warm-up descartado. Estas cifras cubren la ruta de texto; el codificador de vision se ejecuta una vez por imagen y no esta incluido.

| Dispositivo | Backend | Prefill (256) | Decodificacion | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 141 tok/s | 34,9 tok/s | 2,00 s |
| Apple M4 Max (macOS) | GPU (Metal) | 1854 tok/s | 142,6 tok/s | 0,15 s |

En Android, el bundle se ejecuta en el backend GPU de LiteRT en un Samsung Galaxy S26: 3840 de 3840 operaciones delegadas en 3 subgrafos sobre LiteRT GPU, con un pico de memoria de 820 MB. La model card indica que el rendimiento on-device se espera en linea con la build de InternVL3.5-2B en el mismo runtime (aproximadamente 20 tok/s en CPU y 45 tok/s en GPU en un iPhone 17 Pro para VQA de una sola imagen), aunque recomienda medicion independiente antes de citar cifras exactas.

En cuanto a calidad, la model card menciona que el modelo base Ovis2.5-2B alcanza aproximadamente 73,9 en OpenCompass (SOTA para su tamano). No se han publicado en la informacion disponible resultados detallados de benchmarks como MMLU, HumanEval o GSM8K para esta build concreta.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero `.litertlm` ocupa aproximadamente 2,15 GB; en Android el pico medido es de 820 MB en el backend GPU. Para escritorio, se debe prever al menos 3-4 GB de memoria libre para el runtime y el KV cache de 2048 tokens.
- GPU recomendadas: Apple Silicon (M4 Max medido), GPU integradas compatibles con Metal en macOS, GPU Android mediante LiteRT GPU (Samsung Galaxy S26 verificado). Para servidores, no se detallan GPU NVIDIA especificas en la informacion disponible.
- Cabe en GPU de consumo: si, el modelo esta disenado explicitamente para hardware de consumo y movil; se ha verificado en Apple M4 Max y Samsung Galaxy S26.
- Opciones de despliegue: LiteRT-LM (`litert-lm run`, `litert-lm serve` con API compatible con OpenAI), disponible en macOS, Linux y Windows; backend GPU LiteRT en Android.
- Latencia y throughput: en Apple M4 Max con GPU Metal, 142,6 tok/s de decodificacion, 1854 tok/s de prefill y TTFT de 0,15 s; en CPU, 34,9 tok/s de decodificacion y TTFT de 2,00 s. En iPhone 17 Pro se estiman aproximadamente 20 tok/s en CPU y 45 tok/s en GPU para VQA de una sola imagen (estimacion de la model card, no medida para esta build concreta).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Ovis2.5-2B (esta build) | ~2B | 2048 (KV cache) | `.litertlm` / LiteRT-LM | Apache-2.0 | VLM thinking on-device; OpenCompass ~73,9 en el base |
| InternVL3.5-2B (litert-community) | ~2B | no disponible | `.litertlm` / LiteRT-LM | no disponible en la informacion | VLM on-device del mismo runtime; referencia de rendimiento en iPhone 17 Pro (~20 tok/s CPU, ~45 tok/s GPU) |
| FastVLM-0.5B (litert-community) | 0,5B | no disponible | `.litertlm` / LiteRT-LM | no disponible en la informacion | VLM on-device mas ligero del mismo runtime |
| Ministral-3-3B-Reasoning (litert-community) | 3B | no disponible | `.litertlm` / LiteRT-LM | no disponible en la informacion | Modelo de razonamiento de texto; su receta int4 logra 90,7 % en GSM8K |

## Limitaciones y advertencias

- El modelo es de tipo *thinking*: puede generar un bloque `<think>...</think>` antes de la respuesta, por lo que se deben permitir al menos 1024 tokens de salida para evitar respuestas truncadas.
- En litert-lm 0.18.x y 0.19.0, una llamada bloqueante `send_message` que siga generando tras 10 minutos falla con `DEADLINE_EXCEEDED` (timeout fijo sin configuracion) y la generacion en curso puede provocar un crash del proceso; se recomienda usar `send_message_async` (streaming) o reducir `max_output_tokens` para respuestas largas.
- `enable_thinking=False` no desactiva el razonamiento, ya que la plantilla de chat no lee ese parametro.
- La ventana de contexto efectiva esta limitada a 2048 tokens de KV cache, lo que restringe conversaciones largas y el numero de imagenes procesables simultaneamente.
- La imagen de entrada se redimensiona siempre a 512x512, lo que puede degradar la calidad en imagenes con texto pequeno o detalles finos.
- Los idiomas soportados no estan documentados; el comportamiento multilingue no esta garantizado.
- No se dispone de informacion sobre sesgos conocidos ni sobre la tasa de alucinacion del modelo.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la procedencia y los terminos del modelo base AIDC-AI/Ovis2.5-2B.
- Las cifras de rendimiento on-device para esta build especifica son estimaciones basadas en InternVL3.5-2B; se recomienda medicion independiente antes de citar numeros exactos en produccion.
- El repositorio ocupa 12,9 GB, aunque el fichero del modelo es de aproximadamente 2,15 GB; conviene descargar solo el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Ovis2.5-2B
- Modelo base: https://huggingface.co/AIDC-AI/Ovis2.5-2B
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/AIDC-AI/Ovis2.5-2B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Build hermana InternVL3.5-2B: https://huggingface.co/litert-community/InternVL3_5-2B
- Build hermana Ministral-3-3B-Reasoning: https://huggingface.co/litert-community/Ministral-3-3B-Reasoning-2512
- Build hermana FastVLM-0.5B: https://huggingface.co/litert-community/FastVLM-0.5B
