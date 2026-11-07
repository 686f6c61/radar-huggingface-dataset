# litert-community/LFM2.5-VL-450M

## Resumen

LFM2.5-VL-450M es un modelo de visión-lenguaje (VLM) compacto desarrollado originalmente por LiquidAI y distribuido en este repositorio por la comunidad LiteRT en formato `.litertlm`, el formato de inferencia on-device del runtime LiteRT-LM de Google (el antiguo TensorFlow Lite). El modelo combina un backbone de texto híbrido de la familia LFM2 con una torre de visión SigLIP2 compacta, y está pensado para ejecutarse en dispositivos de borde: móviles, tablets y equipos sin GPU dedicada. El bundle int4 ocupa 0,41 GB, lo que lo sitúa entre los VLM más pequeños disponibles para despliegue local.

La relevancia de esta conversión es práctica: permite ejecutar tareas de imagen-a-texto (captioning, OCR de texto grande, preguntas sobre color o forma) en CPU, con un contexto máximo de 4096 tokens y una única imagen por prompt procesada a 512×512 píxeles, que se traduce en 256 tokens soft. El modelo base es `LiquidAI/LFM2.5-VL-450M`, publicado bajo la LFM Open License v1.0.

Es importante señalar que esta build tiene un defecto conocido y documentado por el propio autor de la conversión: en el runtime `litert-lm` 0.16.0 solo llega al modelo el cuarto superior de la imagen, lo que invalida cualquier pregunta posicional (localizar, contar, enumerar). El repositorio incluye una build reparada (`LFM2.5-VL-450M_int4_fixB.litertlm`) que corrige el problema de área visible, aunque no la capacidad de grounding por coordenadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone de texto LFM2 (16 capas, convoluciones cortas con compuerta + atención con grouped-query attention) + torre de visión SigLIP2 (12 capas, hidden 768) |
| Parámetros totales | 450M (según denominación del modelo; no se detalla desglose texto/visión) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (KV cache máximo) |
| Tipos de cuantización | int8 dinámica (0,56 GB) e int4 blockwise-32 OCTAV con embedding y lm_head en int8 (0,41 GB); torre de visión en int8 en ambas |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base en PyTorch está disponible en LiquidAI/LFM2.5-VL-450M |

## Arquitectura y entrenamiento

El backbone de texto es un transformer híbrido de 16 capas que alterna convoluciones cortas con compuerta y atención con grouped-query attention, con un vocabulario de 64k tokens. La parte visual es una torre SigLIP2 de 12 capas con dimensión oculta 768. Cada imagen se redimensiona a 512×512 y se proyecta a 256 tokens soft mediante un adaptador de visión; el runtime admite una sola imagen por prompt y gestiona el redimensionado automáticamente. El modelo es de tipo no-thinking y usa una plantilla ChatML con marcadores de posición de imagen insertados por el procesador de datos LFM2 del runtime.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La conversión a LiteRT-LM se realizó con `litert-torch` (antiguo `ai-edge-torch`); según la model card, la torre de visión exportada coincide con PyTorch con coseno 1.0000, lo que indica que la conversión numérica es exacta y que los fallos observados provienen del runtime, no del proceso de conversión.

## Capacidades

- Generación de texto e imagen-a-texto: descripción de imágenes (captioning), respuesta a preguntas sobre color dominante, forma y texto grande visible.
- OCR de sujetos dominantes de gran tamaño en la imagen.
- Conteo y enumeración de elementos: nominalmente soportado, pero degradado por el defecto del runtime descrito (solo llega el cuarto superior de la imagen en la build estándar).
- Razonamiento multi-turno dentro de una ventana de 4096 tokens.
- Entrada de una única imagen por prompt, en PNG o JPEG, mediante `--attachment`.
- Modelo no-thinking: no dispone de modo de razonamiento extendido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de accesibilidad en móvil: describir el contenido de una foto capturada por el usuario en tiempo real, aprovechando el tamaño de 0,41 GB en int4 para ejecución local en CPU sin conexión.
- Digitalización de carteles y etiquetas: OCR de texto grande y dominante en la imagen (rótulos, señales, tickets) con el modelo ejecutándose íntegramente en el dispositivo.
- Clasificación visual ligera en aplicaciones de campo: identificar el color dominante o la forma principal de un objeto para inventario o control de calidad básico, con la salvedad de que las preguntas posicionales no son fiables en la build estándar.
- Preprocesado en pipelines de documentos: generar una descripción textual breve de una imagen antes de enviarla a un modelo mayor en servidor, reduciendo ancho de banda y coste de inferencia remota.
- Prototipado de interfaces multimodales: validar flujos de imagen-a-texto en Android, macOS o iOS con el runtime `litert-lm` antes de escalar al hermano mayor `litert-community/LFM2.5-VL-3B`.
- Filtrado y moderación on-device: comprobar de forma local si una imagen contiene texto legible o un sujeto dominante reconocible, sin enviar la imagen a un servicio externo.
- Educación y demos: aplicaciones didácticas que ilustran el funcionamiento de un VLM en el propio dispositivo, con un consumo de almacenamiento inferior a 1 GB.

## Benchmarks y rendimiento

Los datos disponibles son puertas de calidad internas del autor de la conversión, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se ejecutaron con CLI pip de `litert-lm` 0.16.0, decodificación greedy, motor nuevo por pregunta y `--cache no`.

| Configuración | Texto (8 preguntas) | Imagen (5 preguntas) |
|---|---|---|
| PyTorch bf16 (referencia) | no disponible | 5/5 |
| LiteRT int4-b32, CPU (recomendada) | 8/8 | 4/5 |
| LiteRT int8, CPU | 6/8 | 3/5 |

Las cinco pruebas de imagen son fixtures sintéticos deterministas: color dominante, OCR de texto grande, forma, conteo de tres cuadrados y palabra más grande. Según la corrección del 14 de agosto de 2026 en la model card, los fallos de las pruebas de forma y conteo no son una limitación de la escala de 450M, sino el defecto del runtime: al reparar el bundle, la respuesta de forma pasa de "Square." a "Circle." sin cambiar nada más, y la regla de bandas numeradas pasa de `1 2 3 4 …` a `1 … 16`.

## Requisitos de hardware

- Almacenamiento: 0,41 GB para el bundle int4 y 0,56 GB para el int8.
- VRAM/RAM: no se publica una cifra explícita de memoria en inferencia; el tamaño del bundle y el contexto máximo de 4096 tokens sugieren un consumo en el rango de unos pocos cientos de MB a ~1 GB, pero este dato no está confirmado en la información disponible.
- GPU: no requiere GPU dedicada; el backend principal es CPU. Soporta GPU con `litert-lm` ≥ 0.16.0 en macOS y Android vía OpenCL.
- Consumer GPU: el modelo está diseñado para ejecutarse sin GPU; cabe en cualquier dispositivo con CPU moderna y suficiente RAM libre.
- iOS: el backend Metal falla en la creación del motor para esta familia (issue LiteRT-LM#3129); se debe usar CPU en iOS.
- Despliegue: runtime `litert-lm` (CLI pip y librerías), con backend CPU u OpenCL. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/LFM2.5-VL-450M | 450M | 4096 | `.litertlm` (int4/int8) | LFM Open License v1.0 | Bundle int4 de 0,41 GB; defecto posicional conocido en runtime 0.16.0 |
| litert-community/LFM2.5-VL-3B | 3B (según denominación) | no disponible | `.litertlm` | LFM Open License v1.0 | Hermano mayor de la misma familia; mantiene la capacidad de grounding por coordenadas que el 450M no alcanza |
| LiquidAI/LFM2.5-VL-450M | 450M | 4096 | PyTorch (safetensors, presumiblemente) | LFM Open License v1.0 | Modelo base sin cuantizar; referencia bf16 con 5/5 en las pruebas de imagen |

No se dispone de datos de benchmarks comparativos con otras familias (Qwen-VL, Gemma, SmolVLM) en la información proporcionada.

## Limitaciones y advertencias

- Defecto crítico del runtime: en `litert-lm` 0.16.0 y en `main`, solo el cuarto superior de la imagen llega al modelo. Cualquier pregunta posicional (localizar, contar, enumerar, "cuál está abajo") devuelve respuestas incorrectas sin error y con formato bien construido. Afecta a todos los bundles LFM2.5-VL porque la familia hace el pixel-unshuffle 2×2 en el adaptador de visión y el runtime asume lo contrario (issue LiteRT-LM#3246).
- Mitigación parcial: usar `LFM2.5-VL-450M_int4_fixB.litertlm`, que restaura el área visible completa en `litert-lm` 0.16.1 y 0.17.0, pero no la capacidad de grounding por coordenadas: en la captura de 10 objetivos del issue, el archivo reparado acierta 1/10 y el estándar 0/10.
- Una sola imagen por prompt y un máximo de 4096 tokens de contexto: no apto para conversaciones largas con muchas imágenes ni para documentos de varias páginas.
- Resolución fija de 512×512: el detalle fino de imágenes grandes se pierde en el redimensionado.
- Modelo no-thinking: sin modo de razonamiento extendido; tareas que requieran cadenas de razonamiento largas quedan fuera de su alcance.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo de 450M en tareas de descripción abierta.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia LFM Open License v1.0: es una licencia "other", no una licencia OSI estándar. Antes de uso comercial es necesario revisar los términos del archivo `LICENSE`, que no se detallan en la información disponible.
- Backend Metal en iOS no funcional para esta familia (issue LiteRT-LM#3129): en iOS hay que usar CPU.
- La calidad del int8 es inferior a la del int4 en las puertas internas (6/8 en texto y 3/5 en imagen frente a 8/8 y 4/5), un resultado contraintuitivo que conviene validar en el caso de uso concreto.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/litert-community/LFM2.5-VL-450M
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Organización LiteRT Community en Hugging Face: https://huggingface.co/litert-community
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue del defecto de visión posicional: https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Issue del fallo de Metal en iOS: https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Script de reexportación de la visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado del bundle: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
- Medición de paridad LiteRT en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
