# litert-community/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino de Qwen/Qwen3.5-4B desarrollado por CCORE, especializado en la generación de escenas 3D interactivas en Three.js: a partir de una descripción textual, el modelo produce un único archivo HTML autocontenido. Este repositorio concreto, publicado por litert-community, no contiene los pesos originales en formato PyTorch, sino una conversión a LiteRT-LM (`.litertlm`) pensada para inferencia en dispositivo (on-device) y entornos edge mediante la librería `litert-lm` de Google AI Edge.

La arquitectura subyacente es la de Qwen3.5-4B: 32 capas de decodificador que alternan tres capas de Gated DeltaNet (atención lineal) por cada capa de atención completa, tamaño oculto de 2560, 16 cabezas de consulta y 4 de clave/valor de 256 dimensiones en las capas de atención completa, y un vocabulario atado de 248.320 entradas. El repositorio ocupa 5,5 GB e incluye dos artefactos cuantizados en int4 mixto con caché KV de 16.384 y 32.768 tokens respectivamente.

La relevancia de esta publicación es doble: por un lado, demuestra que un modelo de 4B especializado en código 3D puede ejecutarse en hardware de consumo (Mac con Apple Silicon, iPhone) con velocidades de decodificación utilizables; por otro, documenta con inusual detalle los problemas de conversión y las rutas de ejecución que rompen la generación de código, lo que resulta valioso para quien pretenda replicar el proceso. No es un lanzamiento oficial de Qwen y solo incluye el decodificador de texto, sin la torre de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas con patrón 3:1 de Gated DeltaNet (atención lineal) y atención completa; tamaño oculto 2560; 16 cabezas Q y 4 KV de 256 dim en capas de atención completa |
| Parametros totales | 4B (heredados de Qwen3.5-4B; no se detalla desglose en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (archivo `ekv16384`) o 32.768 tokens (archivo `ekv32768`), según el artefacto |
| Tipos de cuantizacion | int4 blockwise-32 (min-max) en capas lineales; int8 per-channel en embedding y capa de salida (atados); 48 proyecciones `in_proj_a`/`in_proj_b` de Gated DeltaNet en float32; activaciones GPU en fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se incluyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina capas de Gated DeltaNet (una forma de atención lineal con estado recurrente) y capas de atención completa en una proporción de tres a una. Esta mezcla reduce el coste computacional y de memoria del contexto largo frente a un transformer denso equivalente, manteniendo la capacidad de recuperación de información a larga distancia que aportan las capas de atención completa. El vocabulario de 248.320 entradas está atado entre embedding y capa de salida.

Según el informe técnico citado en la model card, el ajuste fino se realizó sobre el dataset ccore/ThreeJS-3D-Scenes, compuesto por 3.933 escenas de entrenamiento (cada una con un prompt, una traza de razonamiento completa y la respuesta HTML íntegra) y 213 escenas de validación excluidas de la actualización de pesos. El proceso consistió en un ajuste fino completo de los parámetros del lenguaje con el codificador de visión congelado, seguido de una etapa corta de LoRA. La conversión a LiteRT-LM se hizo con litert-torch (commit 115a1360) y el parche para Qwen3.5 de hf-to-litertlm, apuntando a LiteRT-LM 0.19.0. Los artefactos declaran `supports_thinking: false` y la plantilla escribe siempre el bloque de pensamiento vacío, por lo que el modo de razonamiento extendido no está operativo en esta conversión.

## Capacidades

- Generación de código: produce archivos HTML autocontenidos con escenas Three.js interactivas a partir de una descripción en lenguaje natural.
- Razonamiento con traza: el modelo base fue entrenado con trazas de pensamiento completas, aunque en esta conversión el modo thinking está desactivado y la plantilla fuerza un bloque de pensamiento vacío.
- Generación de texto general: al derivar de Qwen3.5-4B, conserva capacidades de texto del modelo base, si bien el ajuste fino está orientado a código 3D.
- Respuestas a preguntas cortas: en las pruebas de la model card, el archivo de 16K respondió correctamente 7 de 8 preguntas breves en CPU de Mac.
- Ejecución on-device: inferencia en CPU y GPU de Mac, GPU de iPhone (Metal) y GPU de Android (con reservas, ver limitaciones).
- Sin soporte de visión en este repositorio: la torre de visión no se convirtió; la entrada y salida son exclusivamente texto.
- Sin tool calling ni function calling documentado en la información disponible.
- Sin capacidades de agente multi-paso documentadas.

## Casos de uso

- Prototipado rápido de escenas 3D en el navegador: un desarrollador describe una escena ("una habitación con una lámpara giratoria y una cámara orbital") y obtiene un HTML único que puede abrir directamente, útil para maquetas y demos sin configurar un entorno de build.
- Herramientas de autoría integradas en el editor: el modelo puede ejecutarse en local en un Mac o un iPhone y generar variaciones de una escena sin enviar prompts a un servicio externo, lo que reduce latencia y evita exponer propiedad intelectual.
- Educación y aprendizaje de Three.js: el HTML generado sirve como ejemplo ejecutable que ilustra el uso de geometrías, materiales, luces y controles de cámara en una sola pieza de código.
- Generación de contenido para demos comerciales: agencias y equipos de marketing pueden producir escenas 3D interactivas para páginas de producto o presentaciones, con la ventaja de que el archivo resultante es portable y no depende de un runtime propietario.
- Aplicaciones móviles offline: al caber en un iPhone con el archivo de 16K y el entitlement de memoria ampliada, permite funciones de generación de escenas dentro de una app sin conexión, con 10,53 tok/s en GPU y 5,06 tok/s en CPU según la model card.
- Investigación sobre cuantización y despliegue edge: la receta int4 mixta con proyecciones DeltaNet en fp32 y los datos de memoria pico (14,0 GB con 16K y 25,9 GB con 32K en CPU de Mac sin caché de pesos) sirven de referencia para estudiar compromisos entre precisión, contexto y huella de memoria.
- Evaluación de pipelines de conversión: los fallos documentados en la ruta GPU por defecto de la librería Python (errores de sintaxis en 6 de 10 respuestas con el archivo de 32K) son un caso de estudio para validar conversiones de modelos híbridos a LiteRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de velocidad y memoria medidas por el autor de la conversión:

| Metrica | Valor |
|---|---|
| Decodificacion, Mac Studio M4 Max CPU, archivo 16K, `litert-lm` 0.19.0 (prompt 1.024 tok, 256 generados) | 14,8 tok/s |
| Decodificacion, Mac CPU, archivo 32K, `litert-lm` 0.19.0 | 10,9 tok/s |
| Decodificacion, Mac GPU, archivo 16K, CLI C++ con `--sampler_handles_input=false` | 48,2 tok/s |
| Decodificacion, iPhone 18 Pro GPU (Metal), archivo 16K | 10,53 tok/s |
| Decodificacion, iPhone 18 Pro CPU, archivo 16K | 5,06 tok/s |
| Memoria pico RSS, Mac CPU sin cache de pesos, archivo 16K | 14,0 GB |
| Memoria pico RSS, Mac CPU sin cache de pesos, archivo 32K | 25,9 GB |
| Memoria pico RSS, Mac CPU con cache por defecto, archivo 16K (ejemplo de uso) | 4,9 GB |
| Huella pico, iPhone 18 Pro GPU, archivo 16K (limite 6 GiB) | 5,92 GB |
| Escenas de validacion que caben en 16.384 tokens | 172 de 213 |
| Escenas de validacion que caben en 32.768 tokens | 213 de 213 (la mas larga requiere 26.147) |

En la comprobación de escenas del autor, el archivo de 16K pasó 4 de 7 escenas en GPU de Mac con el CLI C++, igual que el modelo PyTorch fp16 original; el archivo de 32K pasó 3 de 6 en CPU de Mac frente a 4 de 6 del modelo fp16. En Android (Pixel 11 Pro, 16 GB) el motor GPU arranca y responde, pero en dos ejecuciones la decodificación se degradó hasta 0,66 tok/s, por lo que el autor no ofrece recomendación para esa plataforma.

## Requisitos de hardware

- VRAM/ memoria estimada: el archivo de 16K ocupa 2.711 MB en disco y el de 32K 2.768 MB; la memoria en ejecución depende del backend. En CPU de Mac sin caché de pesos, el pico residente fue de 14,0 GB (16K) y 25,9 GB (32K); con caché por defecto, 4,9 GB (16K, ejemplo de uso).
- GPU recomendadas: Apple Silicon (M4 Max probado) para GPU de Mac; iPhone 18 Pro con entitlement `com.apple.developer.kernel.increased-memory-limit` para GPU móvil. No hay datos publicados para A100, H100 o RTX 4090, ya que el formato `.litertlm` está orientado a LiteRT-LM y no a servidores convencionales.
- GPU de consumo: cabe en un iPhone de gama alta con el archivo de 16K (5,92 GB de huella pico frente a un límite de 6 GiB). No hay datos para GPUs de escritorio NVIDIA o AMD.
- Opciones de despliegue: paquete `litert-lm` 0.19.0 desde PyPI (CPU recomendado en Mac), CLI C++ `litert_lm_advanced_main` compilado desde el código fuente de LiteRT-LM (única ruta fiable en GPU de Mac), xcframework de LiteRT-LM v0.19.0 con la C API para iOS, y el paquete Swift (ejecuta la misma ruta GPU por defecto, no probado con estos archivos). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 14,8 tok/s (Mac CPU, 16K), 48,2 tok/s (Mac GPU, 16K, CLI C++), 10,53 tok/s (iPhone GPU), 5,06 tok/s (iPhone CPU). Una escena de 7.925 tokens tardó 928 s en iPhone.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder (este repo, LiteRT-LM) | 4B | 16K o 32K segun archivo | `.litertlm`, LiteRT-LM | Apache-2.0 | Solo texto; thinking desactivado; orientado a Three.js |
| ccore/Qwen3.5-4B-3D-Coder (original) | 4B | No disponible en la informacion | Pesos PyTorch (fp16 probado) | Apache-2.0 | Incluye torre de vision; referencia de calidad en las pruebas del autor |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible en la informacion | Pesos originales de Qwen | No disponible en la informacion | Modelo generalista; sin ajuste especifico para Three.js |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la única comparación cuantitativa es la tasa de éxito en la comprobación de escenas del autor (4 de 7 para el modelo fp16 frente a 4 de 7 del archivo 16K en GPU de Mac con CLI C++).

## Limitaciones y advertencias

- Solo texto: la torre de visión no se convirtió, por lo que no admite entradas de imagen pese a que el modelo base la incluye.
- Sin modo thinking: la plantilla fuerza `<think>\n\n</think>\n\n` y `enable_thinking` no tiene efecto; se pierde la traza de razonamiento con la que se entrenó el ajuste fino.
- Ruta GPU por defecto rota en la librería Python: con el paquete `litert-lm` desde PyPI en GPU de Mac, 6 de 10 respuestas del archivo de 32K y las 3 probadas del archivo de 16K contenían errores de sintaxis en el script; solo el CLI C++ con `--sampler_handles_input=false` produce resultados fiables.
- Truncamiento silencioso: si la respuesta alcanza el final de la caché KV, se detiene sin error y sin `</html>`, lo que puede producir HTML incompleto sin señal evidente.
- Cobertura de contexto: 41 de las 213 escenas de validación no caben en el archivo de 16K; para esos casos hay que usar el de 32K, con mayor consumo de memoria y menor velocidad.
- Android sin recomendación: en Pixel 11 Pro la decodificación se degradó hasta 0,66 tok/s en dos ejecuciones.
- Sesgos y alucinación: no hay información específica publicada sobre sesgos del ajuste fino; al ser un modelo de 4B especializado, es esperable que genere APIs de Three.js inexistentes o propiedades mal escritas en escenas complejas, y la tasa de fallo observada (3 de 7 escenas fallidas en el mejor caso) lo confirma.
- Idiomas: no se documenta qué idiomas soporta el ajuste fino; el dataset de entrenamiento parece centrado en prompts en inglés.
- Licencia Apache-2.0: permite uso comercial, pero el modelo no es un lanzamiento oficial de Qwen y el autor de la conversión no ofrece garantías; conviene validar la calidad en el dominio propio antes de producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la propia model card advierte de que no hay recomendación estable para Android.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3.5-4B-3D-Coder
- Modelo base del ajuste fino: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe técnico: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
