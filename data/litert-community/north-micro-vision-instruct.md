# litert-community/North-Micro-Vision-Instruct

## Resumen

North-Micro-Vision-Instruct es un modelo de lenguaje y visión (VLM) de 2,48 mil millones de parámetros desarrollado por Cohere Labs, convertido por la comunidad litert-community al formato LiteRT-LM (`.litertlm`) para inferencia en dispositivo (edge) con el runtime de Google LiteRT-LM. Se trata de una arquitectura híbrida que combina un codificador de visión SigLIP2 de 400M (estilo Qwen3-VL con mergers DeepStack) con un decoder de lenguaje Cohere de 2B, entrenado para 11 idiomas. Esta conversión es la primera familia Cohere en formato LiteRT-LM y permite ejecutar el modelo completamente en el dispositivo, sin conexión, con soporte de entrada de imagen y texto.

El modelo está diseñado para tareas de comprensión de imágenes, respuesta a preguntas visuales (VQA), descripción de escenas, OCR y grounding visual, con un enfoque en despliegue en hardware de gama media (móviles, tablets, portátiles). La versión LiteRT-LM introduce un contrato de ejecución `fast_vlm` que simplifica la arquitectura original (fusiona los embeddings DeepStack y usa posiciones 1-D en lugar de M-RoPE) a cambio de una degradación controlada en tareas que requieren razonamiento espacial fino o tablas densas. El modelo se distribuye bajo licencia Apache-2.0 y está disponible en dos variantes de cuantización: int8 (wi8) e int4.

La relevancia actual de este modelo radica en que acerca los VLM de tamaño medio a dispositivos con recursos limitados, manteniendo una calidad aceptable en tareas comunes de visión y lenguaje. Su publicación en agosto de 2026 (según los metadatos) y su integración con el ecosistema LiteRT-LM lo convierten en una opción práctica para desarrolladores que necesitan capacidades multimodales en aplicaciones móviles o de borde sin depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision tower SigLIP2-SO400M (400M, 27 bloques ViT, hidden 1152, 16 cabezas, patch 16) + decoder Cohere 2B (28 capas, hidden 2048, GQA kv8, atención paralela+MLP, sliding/full 3:1, embedding atado 262k) |
| Parametros totales | 2,48 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 (KV cache en esta conversión LiteRT-LM; el modelo base original soporta 128K) |
| Tipos de cuantizacion | int8 (wi8) e int4 (blockwise-32) |
| Idiomas soportados | 11 idiomas (no especificados en la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (formato LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base CohereLabs/North-Micro-Vision-Instruct combina un codificador de visión SigLIP2 de 400M (escala SO400M) con un decoder de lenguaje de 2B. El codificador de visión procesa imágenes a resolución nativa (aunque esta conversión fija la entrada a 512×512 píxeles, generando 1024 parches que se fusionan 2×2 hasta 256 tokens de imagen) y utiliza mergers DeepStack que inyectan tres embeddings de visión adicionales en las capas 0, 1 y 2 del decoder. El decoder sigue el estilo Command A+ de Cohere: 28 capas con atención paralela y MLP, atención GQA con 8 cabezas de valor, y una mezcla de ventanas deslizantes y atención completa en proporción 3:1. El vocabulario está atado (tied embeddings) con 262k tokens.

En la conversión a LiteRT-LM, los tres embeddings DeepStack se fusionan en un único embedding de imagen (representación exacta según el modelo card, con una fidelidad top-1 de 0,96 frente al modelo original) y el runtime sustituye las posiciones interleaved M-RoPE por posiciones secuenciales 1-D. Esto simplifica la implementación en hardware de borde a costa de una degradación medible en tareas que requieren razonamiento espacial bidimensional (tablas, OCR denso). El entrenamiento original del modelo base incluye datos multimodales validados hasta 8K de contexto, aunque esta conversión limita el contexto a 4096 tokens. No se dispone de información detallada sobre la composición del dataset de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto e imágenes: responde a preguntas sobre imágenes, describe escenas, objetos, colores y relaciones espaciales básicas.
- Comprensión de documentos: lectura de texto en imágenes (OCR), extracción de información de capturas, documentos escaneados y gráficos simples.
- Grounding visual: identifica y localiza objetos en una imagen (por ejemplo, "¿dónde está el gato?").
- Soporte multilingüe: entrenado para 11 idiomas (no especificados), aunque la conversión no documenta qué idiomas concretos.
- Integración en dispositivo: ejecución completamente local a través del runtime LiteRT-LM, con soporte para aceleración por GPU (Metal en Apple, OpenCL en Android).
- Modo de conversación multi-turno: admite diálogos con una sola imagen por conversación (una imagen por chat, como se indica en el modelo card).
- Sin capacidades de razonamiento avanzado ni tool calling: el modelo no está diseñado para agentes ni para llamadas a funciones (según la documentación del modelo base).

## Casos de uso

- Asistente visual en móvil: un usuario fotografía un objeto o un lugar y el modelo responde qué es, describe colores, texturas o contexto. Adecuado por su tamaño compacto y su ejecución local en GPU de móvil (por ejemplo, Pixel 8a con 8 GB de RAM).
- Accesibilidad para personas con discapacidad visual: la aplicación captura la escena a través de la cámara y el modelo genera una descripción hablada en tiempo real. La latencia de prefill de 124,5 tok/s en Pixel 8a permite respuestas casi inmediatas.
- OCR de documentos en entornos sin conexión: un trabajador de campo fotografía una factura o un formulario y el modelo extrae el texto. La conversión mantiene una calidad aceptable en OCR de texto plano, aunque degrada en tablas densas.
- Moderación de contenido en plataformas sociales: análisis de imágenes subidas por usuarios para detectar contenido inapropiado (por ejemplo, objetos peligrosos o texto ofensivo). El modelo puede clasificar escenas y leer texto incrustado.
- Etiquetado automático de fotos en galerías: el modelo genera etiquetas descriptivas (gato, sofá, cocina) para organizar bibliotecas de imágenes sin enviar datos a la nube.
- Prototipado de aplicaciones de visión en edge: desarrolladores que evalúan la viabilidad de VLM en hardware limitado pueden usar este modelo como referencia de rendimiento y calidad antes de optimizar para producción.
- Asistente de compras en retail: el usuario fotografía un producto y el modelo extrae el nombre, el color o la marca, ayudando en búsquedas o comparativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta conversión. El modelo card incluye pruebas internas de calidad y mediciones de rendimiento de inferencia:

- Prueba COCO de 9 casos (3 imágenes × 3 preguntas, 48 tokens greedy): contenido correcto y grounded en 9/9 casos, pero solo 1/9 token-exacto frente al oráculo fp32 (debido al cambio de tokens del codificador de visión int8). La versión de escritorio con visión fp16 mantiene 5/9 token-exactos.
- Prueba de texto de 8 preguntas: 7/8 correctas, con un fallo reproducible en el modelo fp32 original (error de pre-tokenización de Cohere, no un artefacto de conversión).
- Pruebas en dispositivo: Pixel 8a responde correctamente a 2/2 preguntas de imagen ("dos gatos sobre una superficie rosa...", "encimera de madera marrón..."); iPhone 17 Pro sigue el rastro de la imagen en pruebas de texto.

Rendimiento medido en Apple M4 Max (litert-lm 0.16.0, wi8, prefill 256, decode 256):

| Backend | Prefill (tok/s) | Decode (tok/s) | Init (s) |
|---|---|---|---|
| CPU | 671,8 | 27,3 | 6,7 |
| GPU | 1236,6 | 80,6 | 1,8 |

Rendimiento en Pixel 8a (wi8, decoder GPU + vision CPU):

| Config | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| Imagen (prefill 271 tokens) | 124,5 | 4,3–4,4 |
| Solo texto (prefill 255 tokens) | 181,1 | 6,4 |

Rendimiento en iPhone 17 Pro (Metal decoder + Metal vision, frío): decode 24,9 tok/s en turno corto de visión, 14,6 tok/s en turno de texto de 50 tokens; tiempo hasta el primer token de visión 8,1–9,5 s.

## Requisitos de hardware

- VRAM estimada: el bundle wi8 ocupa 3,07 GB; el int4 ocupa 2,19 GB. La memoria residente en iPhone 17 Pro alcanza 3,46 GB pico.
- GPU recomendadas: cualquier GPU compatible con Metal (Apple) u OpenCL (Android) con al menos 4 GB de VRAM. En escritorio, una GPU integrada o dedicada moderna (por ejemplo, Apple M4 Max, RTX 3050) es suficiente.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de gama media y en móviles con 8 GB de RAM (el decoder de 2,5 GB se ejecuta en GPU en Pixel 8a). En CPUs de móvil, el rendimiento es muy bajo (0,6 tok/s) y se recomienda usar GPU.
- Opciones de despliegue: runtime LiteRT-LM (CLI `litert-lm`, biblioteca `litert-lm`), integración con Google AI Edge Gallery para Android. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en esta versión.
- Latencia y throughput: en Apple M4 Max, prefill de 1236 tok/s y decode de 80,6 tok/s en GPU; en Pixel 8a, decode de 4,3–6,4 tok/s según configuración; en iPhone 17 Pro, decode de 14,6–24,9 tok/s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros VLM de tamaño similar en la información proporcionada. El modelo card menciona una comparación con el bundle Qwen2-VL-2B (misma clase de trade-off en la conversión), pero no ofrece números concretos. La alternativa más directa es el modelo base original CohereLabs/North-Micro-Vision-Instruct, que mantiene el contexto completo de 128K y las posiciones M-RoPE, pero requiere un runtime PyTorch y no está optimizado para edge. Otras opciones en el espacio de VLM compactos (por ejemplo, PaliGemma 3B o Qwen2-VL-2B) podrían ser comparables, pero no se han proporcionado datos de rendimiento ni calidad en esta documentación.

## Limitaciones y advertencias

- Una sola imagen por conversación: el modelo card indica explícitamente que cada imagen debe enviarse en una conversación nueva; no admite múltiples imágenes en un mismo chat.
- Degradación en tareas espaciales y tablas: la conversión fast_vlm pierde precisión en preguntas que requieren cruzar celdas de tablas 2D o leer texto denso con dígitos (por ejemplo, "$652,000" se lee como "$652,000,000"). No es fiable para clasificar celdas de tablas.
- Contexto limitado a 4096 tokens en esta versión, frente a los 128K del modelo base original. Esto restringe el uso en documentos largos o conversaciones extensas.
- Sin soporte de tool calling ni razonamiento multi-paso: el modelo no está diseñado para agentes ni para tareas que requieran planificación.
- Riesgo de alucinación en descripciones: como cualquier VLM, puede generar contenido plausible pero incorrecto, especialmente en imágenes ambiguas o con poco contraste.
- Sesgos potenciales: no se ha documentado ningún análisis de sesgos para esta conversión. El modelo base de Cohere podría heredar sesgos de sus datos de entrenamiento, pero no hay información al respecto.
- Requisitos de hardware: en CPUs de móvil el rendimiento es inaceptable (0,6 tok/s); se requiere GPU para un uso práctico. El bundle int4 reduce el tamaño pero produce respuestas más tersas y menos fieles al texto original.
- Licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo card no especifica si hay cláusulas adicionales sobre el uso de los pesos o la atribución.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/litert-community/North-Micro-Vision-Instruct
- Modelo base original: https://huggingface.co/CohereLabs/North-Micro-Vision-Instruct
- Blog de Cohere sobre North Micro Vision: https://huggingface.co/blog/CohereLabs/meet-north-micro-vision-instruct
- Análisis en AITier: https://aitier.net/en/models/north-micro-vision-instruct
- Análisis en OrcaRouter: https://www.orcarouter.ai/blog/north-micro-vision-instruct-explained
- Ficha en AI Model Radar: https://aimodelradar.app/models/north-micro-vision-instruct
- Repositorio del runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
