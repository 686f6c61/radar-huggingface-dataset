# grabbou/Qwen3-VL-2B-Instruct-CoreAI

## Resumen

Qwen3-VL-2B-Instruct-CoreAI es una exportación del modelo vision-language Qwen/Qwen3-VL-2B-Instruct de Alibaba Qwen al formato Core AI de Apple, realizada por el usuario grabbou mediante la receta VLM de `apple/coreai-models` 1.0.0. El objetivo es permitir la ejecución local del modelo en dispositivos Apple (iOS 27 y macOS 27) a través de `CoreAIVisionLanguageModel` y del paquete `@react-native-ai/core-ai`, sin depender de servicios en la nube.

El modelo base es un transformer multimodal de 2 mil millones de parámetros que acepta imagen y texto como entrada y genera texto. Esta exportación divide el modelo en tres componentes ejecutables: un decodificador de texto con pesos de 4 bits y caché KV de 4096 tokens (923 MB), un codificador visual con entrada de 448x448 y 196 tokens de imagen en float16 (1.2 GB), y los embeddings de tokens (594 MB), sumando un bundle de 2,7 GB.

Su relevancia radica en que demuestra la viabilidad de desplegar un VLM de 2B en hardware de consumo Apple con cuantización 4-bit, aunque con limitaciones prácticas notables: requiere el entitlement de memoria ampliada en iOS, no existe preset específico para iOS en la receta, y el motor de Apple solo procesa la primera imagen del prompt con decodificación greedy. Es un artefacto experimental más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (modelo base Qwen3-VL-2B-Instruct); exportado como bundle Core AI con decodificador de texto, codificador visual y embeddings separados |
| Parametros totales | 2B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV del decodificador) |
| Tipos de cuantizacion | 4-bit (decodificador de texto); float16 (codificador visual) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Core AI), tokenizer de Hugging Face en carpeta `tokenizer/` |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-2B-Instruct es un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. En esta exportación, el codificador visual procesa imágenes de 448x448 píxeles y las proyecta a 196 tokens de imagen en float16. El decodificador de texto opera con pesos cuantizados a 4 bits y mantiene una caché KV de estado de 4096 tokens. Los embeddings de tokens se almacenan por separado en 594 MB.

No se dispone de información sobre el proceso de entrenamiento del modelo base en la documentación proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO). La exportación en sí no modifica el código del modelo: el autor sobrescribe `export_input_names`, `build_reference_inputs` y `build_dynamic_shapes` en `python/src/coreai_models/models/macos/qwen3_vl.py` para trazar `inputs_embeds` en lugar de `input_ids`, ya que en la versión 1.0.0 la compresión 4-bit falla con `Qwen3VLForCausalLMEmbeddings`. La receta no incluye preset para iOS, por lo que se usa el formato de exportación de macOS con una función `main` por modelo ejecutada en la GPU.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): responde preguntas sobre el contenido de una imagen.
- Comprensión visual básica: identificación de objetos, animales y escenas en imágenes de 448x448.
- Conversación multimodal de un solo turno efectivo: el motor de Apple lee solo la primera imagen del prompt.
- Decodificación greedy: no se documenta soporte de sampling, temperatura ni beam search en este motor.
- Requiere una imagen en cada prompt: el motor VLM de Apple no procesa prompts solo de texto.
- Soporte de tool calling / function calling: no disponible en esta exportación.
- Soporte de agentes y multi-step reasoning: no disponible en esta exportación.
- Capacidades multilingües: no disponibles en la documentación.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Análisis de imágenes en apps iOS nativas: una aplicación puede cargar el bundle y responder preguntas sobre fotos del carrete mediante `generateText` con contenido de tipo `file`, sin enviar imágenes a servidores externos.
- Asistencia visual offline en macOS: herramientas de escritorio que describan capturas de pantalla o imágenes locales manteniendo la privacidad, aprovechando la ejecución en GPU mediante Core AI.
- Prototipado de apps React Native con IA local: el paquete `@react-native-ai/core-ai` permite integrar el modelo en flujos de React Native y validar experiencias multimodales sin backend.
- Accesibilidad: descripción automática de imágenes para usuarios con discapacidad visual en dispositivos Apple, con latencia aceptable para consultas puntuales (39 s incluyendo carga en iPhone 17 Pro).
- Clasificación y etiquetado de imágenes en campo: aplicaciones de inventario, inspección o catalogación que funcionen sin conectividad, usando el modelo para generar descripciones textuales de cada imagen.
- Investigación sobre despliegue de VLMs en edge: banco de pruebas para medir el rendimiento de un VLM de 2B cuantizado a 4 bits en silicio Apple y comparar con alternativas como llama.cpp o MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento documentado es empírico: en iOS 27 sobre iPhone 17 Pro, responder tres preguntas sobre una foto de 320x240, incluyendo la carga del modelo, tardó 39 segundos. Sin el entitlement de memoria ampliada, la app aborta durante la carga de pesos en MPSGraph, ya que el límite pasa de 3.376 MB a 6.144 MB.

## Requisitos de hardware

- VRAM/espacio en disco: bundle de 2,7 GB (923 MB decodificador + 1,2 GB codificador visual + 594 MB embeddings + 11 MB tokenizer).
- Memoria en iOS: requiere el entitlement `com.apple.developer.kernel.increased-memory-limit` para elevar el límite de la app de 3.376 MB a 6.144 MB; sin él, la carga falla.
- Dispositivos probados: iPhone 17 Pro con iOS 27; macOS 27 es el formato objetivo de la receta.
- GPU: ejecución en GPU mediante MPSGraph (una función `main` por modelo); no se documentan otras GPU (A100, H100, RTX 4090) para este formato.
- Cabe en GPU de consumo: sí, en el ecosistema Apple descrito; no hay datos para GPU NVIDIA.
- Opciones de despliegue: Core AI de Apple (`CoreAIVisionLanguageModel`), paquete `@react-native-ai/core-ai`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia: 39 s para tres preguntas sobre una imagen de 320x240 incluyendo carga, en iPhone 17 Pro.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-2B-Instruct-CoreAI (este) | 2B | 4096 tokens (caché KV) | Core AI, iOS/macOS | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-2B-Instruct (base) | 2B | no disponible en esta ficha | safetensors (Hugging Face) | Apache-2.0 | Hugging Face oficial |
| Alternativas edge de 2B-3B (p. ej. exportaciones GGUF/MLX de VLMs) | ~2-3B | variable | GGUF, MLX, llama.cpp | variable | no disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- Motor restrictivo: el motor VLM de Apple lee solo la primera imagen del prompt, decodifica de forma greedy y exige una imagen en cada prompt; no sirve para conversaciones solo de texto.
- Sin preset iOS: la receta no incluye preset para iOS; se usa el formato de exportación de macOS, lo que puede implicar comportamiento no optimizado en dispositivos móviles.
- Requisito de entitlement: sin `com.apple.developer.kernel.increased-memory-limit`, la app aborta al cargar los pesos en MPSGraph.
- Latencia alta: 39 s para tres preguntas sobre una imagen pequeña (320x240) en iPhone 17 Pro, incluyendo carga; no apto para interacción en tiempo real.
- Contexto limitado: caché KV de 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas no documentados: no se especifica qué idiomas soporta la exportación.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones específicas.
- Sesgos: no documentados en la información disponible.
- Madurez: 0 descargas y 0 likes en Hugging Face; artefacto experimental sin validación comunitaria.
- Licencia Apache-2.0 permite uso comercial, pero las limitaciones técnicas del motor Apple condicionan su viabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grabbou/Qwen3-VL-2B-Instruct-CoreAI
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Repositorio apple/coreai-models: https://github.com/apple/coreai-models
- Paquete @react-native-ai/core-ai: https://github.com/callstackincubator/ai/tree/main/packages/core-ai
- Documentación del entitlement de memoria en iOS: https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.kernel.increased-memory-limit
