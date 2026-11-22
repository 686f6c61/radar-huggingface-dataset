# litert-community/InternVL3-2B

## Resumen

InternVL3-2B es un modelo de visión-lenguaje (VLM) compacto desarrollado originalmente por OpenGVLab (Shanghai AI Laboratory) que combina un codificador visual InternViT-300M con un decodificador de lenguaje Qwen2.5-1.5B. Esta ficha concreta corresponde a la conversión realizada por la comunidad `litert-community` al formato LiteRT-LM (`.litertlm`), optimizada para inferencia totalmente en dispositivo (on-device) mediante el runtime LiteRT-LM de Google AI Edge. El resultado es un fichero de aproximadamente 1,43 GB que permite dar respuestas fundamentadas sobre imágenes sin conexión a servicios en la nube.

La relevancia de esta conversión radica en su enfoque en eficiencia extrema: cuantización int8 para el codificador visual e int4 simétrica (blockwise-32 con clipping óptimo OCTAV) para el decodificador, con embeddings de entrada en INT8. El modelo acepta una única imagen redimensionada a 448×448 que se traduce en 256 tokens visuales, y mantiene una ventana de contexto (caché KV) de 2048 tokens. Está pensado para escenarios de edge computing en móviles y dispositivos con recursos limitados.

La licencia Apache 2.0 del modelo base facilita su uso comercial e integración en productos. El rendimiento medido en un Galaxy S26 alcanza 46,9 tokens/s en decodificación y 711 tokens/s en prefill (1.024 tokens) con LiteRT-LM v0.19.0 sobre GPU, lo que lo sitúa como una opción viable para asistentes visuales embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: InternViT-300M (vision) + pixel-shuffle + proyector MLP + Qwen2.5-1.5B (decoder) |
| Parametros totales | ~2B (modelo base InternVL3-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (cache KV) |
| Tipos de cuantizacion | Vision: int8; decoder: int4 simetrica (blockwise-32 + OCTAV); embeddings de entrada INT8 |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 tiene soporte multilingue, pero no se detalla en la informacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero de ~1,43 GB |
| Entrada de imagen | 448×448 (normalizacion ImageNet integrada en el encoder) |
| Tokens por imagen | 256 |
| Computo | entero (integer) |
| Runtime | LiteRT-LM (Google AI Edge) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de InternVL3: un codificador visual InternViT-300M seguido de una operacion de pixel-shuffle y un proyector MLP que mapea las características visuales al espacio del decodificador de lenguaje Qwen2.5-1.5B. En esta conversión, el codificador visual trabaja con pesos int8 y el decodificador con pesos int4 simétricos aplicando blockwise-32 y clipping óptimo OCTAV, lo que reduce el peso total del fichero a aproximadamente 1,43 GB. Los embeddings de entrada se externalizan en una sección INT8.

No se dispone de información sobre los datos de entrenamiento originales de InternVL3-2B (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada. La conversión a LiteRT-LM no reentrena el modelo: el 15 de noviembre de 2026 se reemplazó el fichero por una versión cuyo grafo de prefill/decode fue reescrito para GPU, manteniendo todos los pesos sin cambios. La innovación técnica principal de esta ficha es la optimización del grafo para aceleración por GPU en el runtime LiteRT-LM, junto con la ruta multimodal `fast_vlm` del runtime.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y grounding básico.
- Razonamiento visual de un solo turno con una imagen por consulta (el CLI permite múltiples `--attachment`, pero existe una limitación conocida no detallada).
- Procesamiento de una única imagen redimensionada a 448×448, convertida en 256 tokens visuales.
- Inferencia totalmente on-device sin conexión a red, adecuada para privacidad de datos.
- Ejecución mediante CLI (`litert-lm run`) y exposición como API local compatible con OpenAI (`litert-lm serve`).
- Soporte de modo interactivo de chat multi-turno a través del CLI (sin `--prompt`).
- Ejecución en CPU y GPU (con limitaciones documentadas en GPU para el encoder visual).

## Casos de uso

- Asistentes visuales en movilidad: un usuario fotografía un objeto y formula una pregunta; el modelo responde en el dispositivo con latencia de TTFT de ~380 ms en GPU de Galaxy S26, sin enviar la imagen a la nube.
- Accesibilidad para personas con discapacidad visual: descripción de escenas en tiempo real desde la cámara del teléfono, aprovechando el throughput de 46,9 tokens/s en GPU móvil para respuestas fluidas.
- Etiquetado y moderación de imágenes en el edge: clasificación y descripción automática de contenido fotográfico en aplicaciones de gestión de galerías, manteniendo los datos en el dispositivo.
- Verificación documental offline: lectura de formularios, tickets o documentos escaneados y extracción de información textual mediante preguntas guiadas, útil en entornos sin conectividad.
- Demostraciones y prototipado de VLM: integración rápida en notebooks o apps de prueba mediante `litert-lm run --from-huggingface-repo`, con un único comando para descargar y ejecutar.
- Servicio local compatible con OpenAI: despliegue de `litert-lm serve` para prototipos de aplicaciones que ya consumen la API de OpenAI, sustituyendo el endpoint por uno local en el dispositivo.
- Investigación en eficiencia de modelos: banco de pruebas para evaluar cuantización int4/int8 y delegación de operadores a GPU en hardware móvil (Galaxy S26, Pixel 11 Pro).

## Benchmarks y rendimiento

Rendimiento medido en dispositivo (datos de la model card):

| Dispositivo / configuración | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|
| Galaxy S26, LiteRT-LM 0.16.0, GPU (fichero anterior) | 34,4 | 573 | 380 ms |
| Galaxy S26, LiteRT-LM 0.16.0, CPU (fichero anterior) | 43,7 | 208 | 1,17 s |
| Galaxy S26, LiteRT-LM v0.19.0, GPU (fichero actual) | 46,9 | 711 (1.024 tokens) | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras de rendimiento del texto en Apple M4 Max (`litert-lm benchmark -p 256 -d 256`) aparecen truncadas en la model card y no se reproducen aquí.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa ~1,43 GB; se requiere al menos esa cantidad de memoria más overhead del runtime (estimación práctica: 2-3 GB de RAM disponible).
- GPU recomendadas: no se especifican modelos de escritorio; las mediciones se han realizado en GPU móvil (Galaxy S26) y en Apple M4 Max.
- Cabe en GPU de consumo: sí, por tamaño; sin embargo, el encoder visual en GPU falla en Mac (operadores BROADCAST_TO y GATHER_ND no soportados por el delegado GPU) y en Galaxy S26/Pixel 11 Pro con `litert_lm_advanced_main` el encoder en GPU se detiene.
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm run`, `litert-lm serve`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; TTFT de 380 ms en GPU móvil y 1,17 s en CPU móvil.
- Nota operativa: el CLI puede conservar descargas incompletas en `~/.litert-lm/cache/huggingface/` sin verificar tamaño; se recomienda borrar el fichero y reintentar si aparece un bus error o el mensaje `too large for file size`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| InternVL3-2B (LiteRT-LM, esta ficha) | ~2B | 2048 | `.litertlm` / LiteRT-LM | Apache 2.0 | int4 decoder + int8 vision, on-device |
| OpenGVLab/InternVL3-2B (original) | ~2B | no disponible | safetensors / transformers | Apache 2.0 | Modelo base sin cuantizar |
| litert-community/FastVLM-0.5B | 0,5B | no disponible | `.litertlm` / LiteRT-LM | no disponible | Mismo runtime, menor tamaño y capacidades |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Una sola imagen por inferencia en la práctica: aunque el CLI acepta múltiples `--attachment`, la model card remite a una limitación conocida no detallada.
- Contexto limitado a 2048 tokens de caché KV, insuficiente para conversaciones largas o documentos extensos.
- Imagen de entrada fija a 448×448: se pierde detalle en imágenes de alta resolución o textos pequeños.
- El encoder visual no funciona en GPU en macOS (errores con BROADCAST_TO y GATHER_ND) ni con `litert_lm_advanced_main` en Galaxy S26 y Pixel 11 Pro; en la práctica el encoder suele ejecutarse en CPU.
- Con `--backend gpu` y `--vision-backend` sin definir aparece el error `TopK requires src tensor C dimension to be divisible by 4.`
- Riesgo de alucinación inherente a los VLM compactos, especialmente en preguntas visuales ambiguas o imágenes con poco contexto.
- Sesgos conocidos: no documentados en la información disponible; heredables del modelo base y de sus datos de entrenamiento.
- Idiomas soportados no documentados explícitamente; el decodificador Qwen2.5 es multilingüe, pero el rendimiento fuera del inglés no está verificado.
- La cuantización int4 puede degradar ligeramente la calidad respecto al modelo base sin cuantizar.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base original.
- Solo se ha probado en macOS en escritorio; no hay validación documentada en Linux o Windows.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/InternVL3-2B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-2B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Informe de compatibilidad edge: https://github.com/john-rocky/edge-compat/blob/main/cards/internvl3-2b/CARD.md
- Conversión de referencia FastVLM-0.5B: https://huggingface.co/litert-community/FastVLM-0.5B
- Imagen de ejemplo COCO: http://images.cocodataset.org/val2017/000000039769.jpg
