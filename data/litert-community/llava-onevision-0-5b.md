# litert-community/LLaVA-OneVision-0.5B

## Resumen

LLaVA-OneVision-0.5B es una conversión al formato LiteRT-LM (`.litertlm`) del modelo multimodal `llava-hf/llava-onevision-qwen2-0.5b-ov-hf`, publicada por la comunidad `litert-community`. Se trata de un modelo visión-lenguaje compacto que combina un codificador visual SigLIP con un proyector MLP y un decodificador de lenguaje Qwen2 de 0,5 mil millones de parámetros. El paquete resultante ocupa aproximadamente 829 MB y está pensado para inferencia local de imagen y texto completamente offline.

El problema que resuelve es la ejecución de un VLM en dispositivos de borde (móviles, portátiles, equipos de escritorio sin GPU dedicada) mediante el runtime LiteRT-LM de Google, el motor que hay detrás de los modelos oficiales de la organización `litert-community`. La conversión mantiene el modelo base sin modificaciones estructurales, pero aplica cuantización int4 a los pesos del decodificador e int8 al codificador visual, con cómputo entero.

Es relevante ahora porque permite desplegar un modelo multimodal funcional en un único fichero portable que corre en macOS, Linux y Windows, además de Android e iOS mediante los runtimes correspondientes. La ventana de contexto declarada para la caché KV es de 2048 tokens, y cada imagen consume 730 tokens (729 parches más un token `image_newline`), lo que condiciona el uso práctico a conversaciones de una sola imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador visual SigLIP + proyector MLP + decodificador Qwen2 (transformer) |
| Parametros totales | no disponible (decodificador Qwen2-0.5B, 896-dim, 24 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (caché KV) |
| Tipos de cuantizacion | Decodificador int4 (simétrico, blockwise-32 + OCTAV); embeddings atados int8 externalizados; codificador visual int8; cómputo entero |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), bundle de ~829 MB; repo de 5.0 GB |
| Resolucion de imagen | 384×384 (normalización OpenAI-CLIP integrada en el codificador) |
| Tokens por imagen | 730 (729 parches + `image_newline`) |
| Modelo base | llava-hf/llava-onevision-qwen2-0.5b-ov-hf |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clásico de LLaVA-OneVision: un codificador visual SigLIP que procesa la imagen redimensionada a 384×384 y genera 729 parches (sin token CLS), un proyector MLP que alinea la representación visual con el espacio del lenguaje, y un decodificador Qwen2-0.5B de 24 capas y dimensión 896 con embeddings atados. La conversión a LiteRT-LM no altera la topología del modelo, sino que aplica cuantización: int8 para el codificador visual, int4 con cuantización por bloques de 32 y técnica OCTAV para los pesos del decodificador, e int8 para los embeddings externalizados.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. La model card únicamente documenta el proceso de conversión y cuantización, e indica que la torre SigLIP convierte de forma fiel al modelo de referencia (correlación de paridad en CPU ≈ 1,0). La innovación técnica destacable es la ruta multimodal `fast_vlm` del runtime LiteRT-LM, que permite ejecutar el pipeline completo de imagen y texto en un único fichero con delegación de operaciones a GPU o CPU.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales (VQA) y captioning.
- Respuestas fundamentadas en el contenido visual de una única imagen por conversación.
- Inferencia completamente offline, sin dependencia de servicios en la nube.
- Ejecución multiplataforma: macOS, Linux y Windows con el runtime de escritorio; Android e iOS con los runtimes LiteRT-LM correspondientes.
- Servidor local con API compatible con OpenAI mediante `litert-lm serve`.
- Procesamiento de múltiples imágenes como adjuntos en una misma invocación (`--attachment` repetido), aunque con las limitaciones descritas más abajo.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades distintas de imagen y texto.

## Casos de uso

- Descripción automática de imágenes en aplicaciones móviles: el bundle de 829 MB puede integrarse en una app Android o iOS mediante LiteRT-LM para generar pies de foto o descripciones accesibles sin conexión, con un TTFT medido de 160 ms en GPU de Galaxy S26.
- Asistencia a personas con discapacidad visual: dado que el modelo responde preguntas sobre una imagen concreta de forma local, puede usarse para describir escenas capturadas por la cámara del dispositivo sin enviar datos a servidores externos.
- Etiquetado y moderación de contenido en el borde: clasificación y descripción de imágenes en dispositivos de campo o entornos con conectividad limitada, donde no es viable depender de una API remota.
- Prototipado rápido de pipelines multimodales: el comando `litert-lm run --from-huggingface-repo` permite validar un flujo de imagen más pregunta en una sola línea, útil para pruebas de concepto antes de invertir en modelos mayores.
- Servicio local de VQA para herramientas internas: mediante `litert-lm serve`, se expone una API compatible con OpenAI en la máquina del desarrollador para integrar en scripts, notebooks o aplicaciones de escritorio.
- Evaluación comparativa de runtimes en hardware de borde: al estar disponible para CPU y GPU (Metal en macOS, LiteRT GPU en Android), sirve como referencia para medir latencia y throughput de LiteRT-LM frente a otras alternativas de despliegue.
- Educación e investigación sobre cuantización: el uso de int4 blockwise-32 con OCTAV y embeddings int8 externalizados lo convierte en un caso práctico para estudiar el impacto de la cuantización en un VLM pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, VQAv2, etc.) en la información disponible. Sí se documentan métricas de rendimiento de inferencia:

| Dispositivo | Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 955 tok/s | 113,7 tok/s | 0,31 s |
| Apple M4 Max (macOS) | GPU (Metal) | 7030 tok/s | 239,3 tok/s | 0,04 s |
| Galaxy S26 (Android 16) | GPU (LiteRT GPU) | 1376 tok/s | 86,5 tok/s | 160 ms |
| Galaxy S26 (Android 16) | CPU | 303 tok/s | 69,5 tok/s | 720 ms |

Las cifras de M4 Max corresponden a `litert-lm benchmark` (litert-lm 0.15.0) con `-p 256 -d 256 --runs 3`, max-num-tokens 4096 y warm-up descartado; cubren la ruta de texto y no incluyen el codificador visual. En Galaxy S26 se midió con litert-lm 0.16.0; el prompt de validación no incluía imagen, por lo que la ruta visual en GPU no está medida. En Android, el bundle delega 3098 de 3098 operaciones en 3 subgrafos de LiteRT GPU, con un pico de memoria de 441 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato / runtime | Licencia |
|---|---|---|---|---|---|
| LLaVA-OneVision-0.5B (LiteRT-LM) | ~0,5B (decodificador Qwen2) | 2048 | Imagen + texto | `.litertlm` / LiteRT-LM | Apache 2.0 |
| llava-hf/llava-onevision-qwen2-0.5b-ov-hf | ~0,5B | no disponible | Imagen + texto | safetensors / Transformers | Apache 2.0 |
| Otros VLM de borde (p. ej. variantes Qwen2-VL pequeñas) | no disponible | no disponible | Imagen + texto | múltiples | no disponible |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato y la cuantización: el original en Transformers requiere el stack de PyTorch, mientras que esta conversión está optimizada para inferencia de borde con cómputo entero.

## Limitaciones y advertencias

- Una sola imagen por conversación: con 730 tokens por imagen y contexto de 2048, añadir una segunda imagen a la misma conversación provoca respuestas truncadas; es necesario iniciar una conversación nueva para cada imagen.
- Contexto limitado: 2048 tokens de caché KV restringen la longitud de los diálogos multi-turno, especialmente cuando se combinan con los tokens de imagen.
- Modelo de 0,5B: la capacidad de razonamiento y la precisión factual son inherentemente limitadas en comparación con VLM de mayor tamaño; riesgo de alucinación en preguntas visuales complejas o imágenes ambiguas.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe; el ejemplo de la model card está en inglés.
- Sin datos de benchmarks de calidad publicados: no es posible evaluar su precisión frente a alternativas con cifras objetivas a partir de la información disponible.
- La ruta visual en GPU de Android no está medida; las cifras de rendimiento publicadas para Galaxy S26 cubren solo la ruta de texto.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes (SigLIP, Qwen2) por separado.
- Dependencia del runtime LiteRT-LM: el fichero `.litertlm` no es directamente utilizable con vLLM, llama.cpp, Ollama o TGI; requiere las herramientas de Google AI Edge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/LLaVA-OneVision-0.5B
- README del modelo: https://huggingface.co/litert-community/LLaVA-OneVision-0.5B/blob/main/README.md
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-0.5b-ov-hf
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Tarjeta de compatibilidad en borde: https://github.com/john-rocky/edge-compat/blob/main/cards/llava-onevision-0.5b/CARD.md
- Guía de GPU para Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
