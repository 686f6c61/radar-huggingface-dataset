# litert-community/InternVL3_5-2B

## Resumen

InternVL3_5-2B es un modelo de lenguaje y visión (VLM) compacto desarrollado originalmente por OpenGVLab (Shanghai AI Laboratory). Combina un codificador visual InternViT con un decodificador de lenguaje Qwen3-1.7B, lo que le permite responder preguntas sobre imágenes y texto de forma conjunta. Esta ficha se centra en la conversión publicada por `litert-community`, que empaqueta el modelo en formato LiteRT-LM (`.litertlm`) para inferencia totalmente local en dispositivos de borde (móviles, portátiles, edge).

La relevancia de esta conversión radica en que permite ejecutar un VLM multimodal en hardware de consumo sin depender de la nube. El archivo `model.litertlm` ocupa aproximadamente 1,62 GB, con el codificador visual cuantizado a int8 y el decodificador a int4, y está optimizado para el runtime LiteRT-LM de Google (el mismo que ejecuta FastVLM-0.5B). Según la model card, en una GPU Galaxy S26 alcanza 40,2 tokens/s en decodificación y 537 tokens/s de prefill para 1.024 tokens.

El modelo base es Apache-2.0 y está pensado para tareas de image-text-to-text en entornos con recursos limitados: asistentes visuales en móvil, accesibilidad, moderación de imágenes o análisis documental ligero. La conversión mantiene el grafo de prefill/decode reescrito para GPU desde el 15 de noviembre de 2026, sin cambios en los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador InternViT + pixel-shuffle + proyector MLP + decodificador Qwen3-1.7B |
| Parametros totales | no disponible (modelo base InternVL3_5-2B; decodificador Qwen3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (KV cache) |
| Tipos de cuantizacion | Vision: int8; decodificador: int4 (simetrica, blockwise-32 + OCTAV optimal-clipping); embedding de entrada: int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors |
| Tamano del archivo | ~1,62 GB (`model.litertlm`) |
| Entrada de imagen | redimensionada a 448x448; 256 tokens de imagen por imagen |
| Computo | entero (integer) |
| Modelo base | OpenGVLab/InternVL3_5-2B |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de InternVL3.5: un codificador visual InternViT que procesa una imagen de 448x448, seguido de una operación de pixel-shuffle y un proyector MLP que transforma las características visuales en tokens compatibles con el decodificador. El decodificador es Qwen3-1.7B, un transformer denso que sustituye al Qwen2.5-1.5B usado en InternVL3-2B. La conversión a LiteRT-LM utiliza el camino multimodal `fast_vlm` del runtime, con el grafo de prefill/decode reescrito para GPU (cambio del 15 de noviembre de 2026) y los pesos sin modificar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de la conversión tampoco detalla el proceso de alineación del modelo base. La innovación técnica destacable de esta conversión es la cuantización mixta (int8 para visión, int4 para el decodificador con blockwise-32 y OCTAV) y la normalización ImageNet integrada en el codificador visual, que elimina preprocesado externo.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de escenas, respuesta a preguntas visuales y grounding básico.
- Razonamiento multimodal de un solo turno o multi-turno dentro de la ventana de 2048 tokens.
- Procesamiento de una imagen por consulta de 448x448 (256 tokens visuales); la CLI permite pasar varias imágenes con `--attachment`, aunque la model card remite a una limitación conocida no detallada.
- Inferencia totalmente local en dispositivo, sin conexión a red.
- Exposición como API local compatible con OpenAI mediante `litert-lm serve`.
- Modo interactivo de chat mediante la CLI (`litert-lm run` sin `--prompt`).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Descripción de imágenes en movilidad: la aplicación captura una foto, la redimensiona a 448x448 y el modelo genera una descripción en una frase; adecuado por su tamaño de 1,62 GB y su ejecución en GPU móvil (40,2 tokens/s en Galaxy S26).
- Asistencia de accesibilidad: lectura y descripción de escenas para personas con discapacidad visual, ejecutándose en el propio dispositivo para preservar la privacidad de las imágenes capturadas.
- Análisis documental ligero: extracción de información de capturas, recibos o formularios fotografiados, con respuestas cortas dentro de la ventana de 2048 tokens.
- Moderación de contenido visual en el borde: clasificación y descripción de imágenes subidas por usuarios antes de enviarlas a un servidor, reduciendo costes de ancho de banda y latencia.
- Prototipado de asistentes visuales offline: uso de `litert-lm serve` para exponer una API compatible con OpenAI en un portátil o dispositivo edge durante el desarrollo.
- Automatización de catálogos: generación de pies de foto y etiquetas descriptivas para imágenes de producto en lotes pequeños, con el modelo ejecutándose localmente en un Mac o PC.
- Educación y demos interactivas: preguntas y respuestas sobre imágenes en entornos sin conectividad, como aulas o ferias, usando la CLI con `--attachment`.

## Benchmarks y rendimiento

La model card solo proporciona métricas de rendimiento de inferencia, no de calidad en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Dispositivo | Valor |
|---|---|---|
| Decodificacion | Galaxy S26 (GPU) | 40,2 tokens/s |
| Prefill (1.024 tokens) | Galaxy S26 (GPU) | 537 tokens/s |
| Prefill (256 tokens) | Apple M4 Max (litert-lm 0.15.0) | no disponible (tabla truncada en la model card) |
| Decode | Apple M4 Max (litert-lm 0.15.0) | no disponible (tabla truncada en la model card) |
| TTFT | Apple M4 Max (litert-lm 0.15.0) | no disponible (tabla truncada en la model card) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo pesa ~1,62 GB; se necesita espacio adicional para el KV cache (contexto de 2048 tokens) y buffers del runtime, por lo que se recomienda al menos 3-4 GB de memoria libre.
- GPU recomendadas: GPU integrada de Galaxy S26 (medición oficial), Apple M4 Max (mediciones de la model card); se espera funcionamiento en GPUs móviles Adreno/Mali compatibles con LiteRT-LM.
- Cabe en GPU de consumo: sí, en móviles de gama alta y en Macs con Apple Silicon; no se documenta compatibilidad con RTX 4090 u otras GPUs de escritorio en la información disponible.
- Backends: CPU (por defecto si no se especifica backend) y GPU para el decodificador; el codificador visual en GPU falla en Mac con `--vision-backend gpu` por operadores no soportados (BROADCAST_TO, GATHER_ND).
- Opciones de despliegue: runtime LiteRT-LM (CLI `litert-lm run`, `litert-lm serve`, `litert-lm benchmark`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 40,2 tokens/s de decodificación y 537 tokens/s de prefill en Galaxy S26; el codificador visual se ejecuta una vez por imagen y no está incluido en esas cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| InternVL3_5-2B (LiteRT-LM) | ~2B (VLM) | 2048 | `.litertlm` / LiteRT-LM | Apache-2.0 | Conversion on-device, cuantizacion int4/int8 |
| FastVLM-0.5B (LiteRT-LM) | 0,5B | no disponible | `.litertlm` / LiteRT-LM | no disponible | Mismo runtime; menor tamano, capacidades no comparadas en la informacion |
| InternVL3-2B | ~2B (VLM) | no disponible | safetensors / transformers | no disponible | Version anterior con decodificador Qwen2.5-1.5B |
| OpenGVLab/InternVL3_5-2B (base) | ~2B (VLM) | no disponible | safetensors | Apache-2.0 | Modelo original sin cuantizar ni empaquetar para edge |

## Limitaciones y advertencias

- Ventana de contexto limitada a 2048 tokens (KV cache), insuficiente para documentos largos o conversaciones extensas.
- Una sola imagen de 448x448 por consulta en el flujo estándar; el soporte multi-imagen vía `--attachment` remite a una limitación conocida no detallada.
- El codificador visual en GPU no funciona en Mac (error con BROADCAST_TO y GATHER_ND); por defecto se ejecuta en CPU si no se especifica backend.
- Riesgo de alucinación inherente a modelos de ~2B; las descripciones pueden incluir objetos o relaciones no presentes en la imagen.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base InternVL3_5-2B y Qwen3-1.7B.
- Idiomas soportados no disponibles; no se garantiza calidad multilingüe.
- La CLI puede conservar descargas incompletas en caché (`~/.litert-lm/cache/...`) sin verificar el tamaño, provocando errores de bus o `too large for file size`; es necesario borrar el archivo y reintentar.
- Si se descargó el archivo antes del 15 de noviembre de 2026, la CLI sigue usando la versión antigua hasta que se elimina manualmente de la caché.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datos de entrenamiento originales.
- Solo se ha probado en macOS en escritorio y en dispositivos móviles concretos (Galaxy S26, Pixel 11 Pro); no hay validación documentada en Windows ni Linux de escritorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/InternVL3_5-2B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-2B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Conversión de referencia FastVLM-0.5B: https://huggingface.co/litert-community/FastVLM-0.5B
- Imagen de ejemplo COCO: http://images.cocodataset.org/val2017/000000039769.jpg
