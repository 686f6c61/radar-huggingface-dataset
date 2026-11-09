# litert-community/InternVL3-2B

## Resumen

InternVL3-2B en formato LiteRT-LM es una conversión del modelo visión-lenguaje InternVL3-2B de OpenGVLab al formato `.litertlm`, empaquetado por la comunidad LiteRT (antigua TFLite) de Google para inferencia totalmente local en dispositivos. El bundle combina un codificador visual InternViT-300M con un decodificador de lenguaje Qwen2.5-1.5B, unidos por pixel-shuffle y un proyector MLP, y está pensado para ejecutarse sobre el runtime LiteRT-LM en Android, iOS, macOS, Linux y Windows sin depender de la nube.

El problema que resuelve es el de llevar un VLM capaz de responder preguntas sobre imágenes a hardware de borde con requisitos de memoria muy ajustados: el fichero pesa aproximadamente 1,43 GB gracias a la cuantización int8 del codificador visual y int4 del decodificador. Frente a la ejecución del modelo original en precisión completa, esta conversión permite obtener respuestas fundamentadas sobre una imagen en un teléfono de gama alta con latencias de primera respuesta por debajo de 400 ms en GPU.

Es relevante ahora porque LiteRT-LM se ha consolidado como el motor detrás de los modelos oficiales `litert-community/*` y porque el ecosistema de modelos multimodales on-device empieza a cubrir casos de uso reales (VQA de una sola imagen, subtitulado, asistencia visual) con velocidades de decodificación de decenas de tokens por segundo. La ficha se centra en el bundle LiteRT-LM; los datos del modelo base InternVL3-2B que no aparecen en la información disponible se marcan como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador InternViT-300M + pixel-shuffle + proyector MLP + decodificador Qwen2.5-1.5B (transformer denso) |
| Parametros totales | ~2B (300M vision + 1.5B lenguaje, segun composicion indicada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 (KV cache del bundle LiteRT-LM) |
| Tipos de cuantizacion | Vision int8; decodificador int4 simetrico (blockwise-32 + OCTAV optimal-clipping); input embedding INT8 externalizado; computo entero |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, ~1.43 GB); modelo base en safetensors |
| Entrada de imagen | redimensionado a 448x448, normalizacion ImageNet embebida en el codificador; 256 tokens de imagen por imagen |
| Tamano del repo | 10.0 GB |
| Runtime | litert-lm (LiteRT-LM) |

## Arquitectura y entrenamiento

La arquitectura es la de InternVL3-2B: un codificador visual InternViT de 300M parámetros que procesa cada imagen a 448x448, seguido de una operación de pixel-shuffle y un proyector MLP que traduce las características visuales a 256 tokens de imagen inyectados en el decodificador Qwen2.5-1.5B. El bundle LiteRT-LM mantiene esta topología y la ejecuta por la ruta multimodal `fast_vlm` del runtime, con todas las operaciones en aritmética entera para maximizar la delegación a aceleradores de borde.

La conversión aplica cuantización agresiva pero selectiva: el codificador visual se cuantiza a int8 conservando la fidelidad de representación (la torre de visión convierte de forma bit-fiel respecto a la referencia float, con correlación de paridad en CPU cercana a 1.0), mientras que el decodificador usa int4 simétrico con bloques de 32 y clipping óptimo OCTAV. El embedding de entrada queda como sección INT8 externalizada. La información disponible no detalla el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Respuesta visual a preguntas (VQA) de una sola imagen: describe, identifica objetos, lee contexto visual y responde preguntas concretas sobre la imagen adjunta.
- Generación de texto y conversación multi-turno sobre la misma imagen: se pueden encadenar preguntas de seguimiento acerca de la imagen ya cargada.
- Procesamiento de múltiples imágenes en la misma petición mediante adjuntos repetidos en la CLI, con la limitación conocida de una imagen por conversación en el backend GPU.
- Subtitulado y descripción detallada de imágenes (la model card reporta descripciones precisas y detalladas).
- Ejecución totalmente local: sin llamadas a servicios externos, con el mismo fichero en macOS, Linux y Windows, y en Android/iOS mediante el runtime LiteRT-LM.
- Exposición como API local compatible con OpenAI mediante `litert-lm serve`, lo que permite integrarlo en aplicaciones existentes que hablen ese protocolo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y razonamiento agéntico multi-paso: no disponibles en la información proporcionada para este bundle.

## Casos de uso

- Asistencia visual en aplicaciones móviles: integrar el bundle en una app Android o iOS para que el usuario fotografíe un objeto, un documento o una escena y reciba una descripción o respuesta en el dispositivo, sin enviar la imagen a un servidor; el tamaño de 1,43 GB y los ~45 tok/s de decodificación en GPU de un iPhone 17 Pro lo hacen viable para interacción en tiempo real.
- Subtitulado y descripción automática de imágenes en galerías locales: procesar lotes de fotos en el propio dispositivo para generar metadatos descriptivos y hacerlas buscables, aprovechando que el codificador visual está cuantizado a int8 sin pérdida apreciable de calidad de grounding.
- Verificación visual en campo sin conectividad: aplicaciones de inspección (por ejemplo, comprobar el estado de un equipo o leer una etiqueta) en entornos sin red, usando el backend CPU en escritorio o el backend GPU en móvil según el dispositivo.
- Prototipado rápido de productos multimodales: usar `litert-lm serve` para levantar una API local compatible con OpenAI y conectar un front-end o un agente existente sin cambiar el código de cliente, sustituyendo después el bundle por uno mayor si la latencia lo permite.
- Asistencia accesible: descripción de escenas para usuarios con discapacidad visual en un teléfono de gama alta, con TTFT de 380 ms en GPU de Galaxy S26, lo bastante bajo para una experiencia conversacional.
- Evaluación comparativa de runtimes de borde: emplear el bundle como referencia para medir el rendimiento de LiteRT-LM frente a otras rutas (llama.cpp, MLC, ONNX Runtime) en el mismo hardware, gracias a las cifras publicadas de prefill, decode y TTFT en varios dispositivos.
- Filtrado y moderación de imágenes en el dispositivo: clasificación y descripción local de contenido gráfico antes de subirlo a un servicio, manteniendo la imagen fuera del servidor.

## Benchmarks y rendimiento

Rendimiento del bundle LiteRT-LM (no son benchmarks de calidad tipo MMLU, sino métricas de inferencia):

| Dispositivo | Backend | Prefill | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 157 tok/s | 50,0 tok/s | 1,79 s |
| iPhone 17 Pro | CPU | no disponible | ~20 tok/s | no disponible |
| iPhone 17 Pro | GPU (Metal) | no disponible | ~45 tok/s | no disponible |
| Galaxy S26 | GPU | 573 tok/s | 34,4 tok/s | 380 ms |
| Galaxy S26 | CPU | 208 tok/s | 43,7 tok/s | 1,17 s |

En Galaxy S26 con GPU se delegaron 1243 operaciones; en la medición con `litert_lm_advanced_main` de litert-lm 0.16.0 se reportan 3618/3618 operaciones en 3 subgrafos sobre LiteRT GPU con un pico de memoria de 736 MB. En macOS con litert-lm 0.15.0 el backend GPU no es usable para este bundle (devuelve caracteres `!` en lugar de texto), por lo que las cifras de GPU en escritorio (2.031 tok/s prefill, 183 tok/s decode) no se consideran válidas. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Almacenamiento: ~1,43 GB para el fichero `.litertlm`; el repo completo ocupa 10,0 GB.
- Memoria: pico medido de 736 MB en Galaxy S26 con backend GPU; el KV cache está limitado a 2048 tokens.
- GPU de escritorio: no se requieren; de hecho el backend GPU de macOS no funciona con este bundle en litert-lm 0.15.0 y se debe usar CPU.
- Móvil: ejecuta en Galaxy S26 (Android 16) y iPhone 17 Pro; el modelo carga en 3-4 s en el iPhone según la nota previa del repositorio.
- GPU de servidor (A100, H100, RTX 4090): no aplica a este bundle, orientado a borde; para esas GPU conviene usar el modelo base OpenGVLab/InternVL3-2B con vLLM o TGI.
- Opciones de despliegue: `litert-lm run` (CLI), `litert-lm serve` (API local compatible con OpenAI), `litert-lm benchmark`, y el runtime LiteRT-LM en apps Android/iOS.
- Latencia y throughput: ver tabla de benchmarks; TTFT de 380 ms y decode de 34,4 tok/s en GPU de Galaxy S26, decode de 50 tok/s en CPU de M4 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/ Runtime | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/InternVL3-2B | ~2B (300M vision + 1.5B LM) | 2048 | `.litertlm` / LiteRT-LM | Apache 2.0 | VLM on-device; ~45 tok/s decode en iPhone 17 Pro GPU |
| litert-community/FastVLM-0.5B | 0,5B | no disponible | `.litertlm` / LiteRT-LM | no disponible | VLM on-device mas pequeno, citado en la model card como referencia del mismo runtime |
| OpenGVLab/InternVL3-2B | ~2B | no disponible | safetensors / transformers | no disponible | Modelo base sin cuantizar; requiere mas memoria y no esta optimizado para borde |

## Limitaciones y advertencias

- Limitación conocida en el backend GPU (Metal): una segunda imagen en la misma conversación trunca la respuesta; se debe usar una imagen por chat y abrir una conversación nueva para cada imagen adicional.
- El backend GPU de macOS no es usable con este bundle en litert-lm 0.15.0 (genera caracteres `!` en lugar de texto); usar CPU en escritorio.
- La ventana de contexto efectiva es de 2048 tokens de KV cache, insuficiente para documentos largos o conversaciones extensas.
- Cada imagen consume 256 tokens y se reescala a 448x448; detalles finos en imágenes de alta resolución pueden perderse.
- La medición de GPU en Galaxy S26 usa un prompt sin imagen, por lo que cubre la creación del motor y la ruta de texto, no la ruta visual.
- No hay información sobre sesgos, riesgo de alucinación específico del bundle, idiomas soportados ni resultados de benchmarks de calidad; conviene validar en el dominio concreto antes de producción.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los componentes (InternViT, Qwen2.5) para el caso de uso previsto.
- El modelo es de 2B parámetros: razonamiento complejo, matemáticas avanzadas y código de producción quedan fuera de su alcance esperable; no se han publicado evaluaciones que lo confirmen.

## Enlaces

- Hugging Face del bundle: https://huggingface.co/litert-community/InternVL3-2B
- Ficheros del repo: https://huggingface.co/litert-community/InternVL3-2B/tree/main
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-2B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Registro de compatibilidad en borde (card de InternVL3-2B): https://github.com/john-rocky/edge-compat/blob/main/cards/internvl3-2b/CARD.md
- Guía de GPU en Android (hf-to-litertlm): https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
