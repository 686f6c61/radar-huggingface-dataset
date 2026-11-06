# mlboydaisuke/LFM3-1.7B-CoreAI

## Resumen

LFM3-1.7B-CoreAI es una conversión del modelo LiquidAI/LFM3-1.7B al formato `.aimodel` de Apple Core AI, orientado a iOS 27 y macOS 27. Lo publica el usuario mlboydaisuke en Hugging Face y no es un modelo entrenado desde cero, sino una cuantización y reempaquetado del LFM3-1.7B original de Liquid AI para que pueda ejecutarse en el hardware y los frameworks de Apple (GPU en Mac y Neural Engine en iPhone). El modelo base es un transformer híbrido de 1.7B parámetros con capacidad de razonamiento previo a la respuesta y de llamada a herramientas en formato XML.

La relevancia de esta ficha está en que demuestra el estado del arte en inferencia on-device en el ecosistema Apple: incluye dos bundles, uno para Mac con motor GPU `coreai-pipelined` y prefill de 64 tokens por paso, y otro para iPhone 18 Pro compilado específicamente para el chip `h19p` con formas fijas y pesos paletizados de 8 bits. Ambos trabajan con una ventana de contexto de 4.096 tokens.

El modelo resuelve el problema de llevar un LLM con razonamiento y tool calling a dispositivos Apple sin depender de la nube, a costa de una licencia restrictiva (lfm1.0) y de un soporte de hardware muy limitado (solo iPhone 18 Pro en el bundle móvil). Es un caso de estudio útil para quienes evalúan despliegue on-device con Core AI, CoreAIKit o alternativas como MLX y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (24 capas, con capas conv-mixer y atención; el modelo base LFM3 es híbrido según los tags) |
| Parametros totales | 1.7B (modelo base LiquidAI/LFM3-1.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Mac: int8 por bloque de 32 (MLP y conv-mixer), cabeza int8 simétrica, proyecciones de atención y normas q/k en fp32, resto fp16. iPhone 18 Pro: pesos paletizados 8 bits (k-means, grupos de 32), gate de atención fp16, cabeza atada como tabla int8 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | `.aimodel` (Core AI); Mac 2.72 GB, iPhone 2.16 GB (resources.bin 1.48 GB) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM3-1.7B, un transformer de 24 capas con arquitectura híbrida (los tags indican `hybrid`), y esta conversión no reentrena pesos: parte de la revisión `ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7` del modelo original y los reempaqueta para Core AI. El bundle de Mac mantiene dos funciones sobre los mismos pesos, `main` (un token por paso) y `prefill` (64 tokens por paso), de modo que el motor canaliza el prompt en bloques de 64 tokens y los últimos 1-64 tokens por la ruta de un token. Core AI compila el `.aimodel` para la GPU en la primera carga y cachea el resultado.

El bundle de iPhone 18 Pro reconstruye las mismas 24 capas con formas fijas, guarda el historial de entrada de cada capa convolucional en filas propias de la KV cache, implementa la ventana deslizante mediante la máscara causal del motor y usa pesos paletizados de 8 bits. Admite contextos de 256 a 4.096 tokens con consultas de 8, 16 o 64 tokens, y la compilación coloca cada una de sus 30 funciones transformer en una región del Neural Engine. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que esos datos deben consultarse en la model card de LiquidAI/LFM3-1.7B.

## Capacidades

- Generación de texto con razonamiento previo a la respuesta: el modelo puede abrir un bloque de pensamiento (`</think>`) antes de contestar; en las pruebas con thinking activado el cierre llegó tras 40-237 tokens (mediana 56).
- Llamada a herramientas en XML (tool calling), integrable a través de `LanguageModelSession` de Apple y de `ChatSession` de CoreAIKit.
- Razonamiento multi-paso implícito en el modo thinking, con presupuesto de hasta 3.584 tokens en las pruebas citadas.
- Conversación multi-turno con plantilla de chat del proveedor, reescrita para renderizar la misma cadena en transformers y parsear en swift-jinja 2.3.2 y 2.3.6.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional on-device en iPhone 18 Pro: el bundle `ios-h19p` está compilado para el Neural Engine de ese chip y sostiene turnos completos con 768 tokens de prompt y 256 generados en 6,71 s, lo que permite asistentes sin conexión con contexto de hasta 4.096 tokens.
- Automatización de tareas con tool calling en apps iOS: el soporte de llamadas a herramientas en XML y la integración con `LanguageModelSession` permiten que la app delegue acciones (calendario, contactos, consultas) al modelo sin salir del dispositivo.
- Razonamiento asistido en macOS: el bundle de Mac con prefill de 1.234 tok/s y decodificación de 169,5 tok/s sirve para prototipar flujos de razonamiento y agentes en un M4 Max antes de portarlos al móvil.
- Procesamiento de documentos largos en local: con 4.096 tokens de contexto y la prueba de 1.648 tokens sobre una secuencia teacher-forced, el modelo puede resumir o extraer información de documentos sin enviarlos a la nube.
- Evaluación de pipelines Core AI: el par de bundles y las puertas de validación (top-1 98,40 % frente a transformers fp32) lo convierten en una referencia para medir conversiones propias en el ecosistema Apple.
- Generación de código y respuestas técnicas en el dispositivo: el modelo base LFM3 está orientado a razonamiento y tool calling, por lo que puede asistir en tareas de programación dentro de editores o IDE móviles, siempre que se respete la licencia lfm1.0.
- Investigación en eficiencia on-device: comparar este port con MLX y llama.cpp sobre los mismos pesos permite estudiar el equilibrio entre latencia, huella de memoria (2,82 GB en iPhone) y calidad.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Mac M4 Max, prefill (prompt de 1.024 tokens) | 1.234 tok/s; 0,83 s hasta el primer token |
| Mac M4 Max, decode | 169,5 tok/s (mediana de 8 ejecuciones) |
| Mac, compilado ahead-of-time para GPU | decode 105,5 tok/s; 1,00 s hasta el primer token |
| MLX (mlx-vlm 0.7.11), pesos 8 bits | 189,8 tok/s decode; 0,23-0,26 s al primer token |
| llama.cpp (b12001), Q8_0 | 180,2 tok/s decode; 0,23-0,26 s al primer token |
| MLX 4 bits / llama.cpp 4 bits | 286,9 / 242,1 tok/s decode |
| MLX bf16 / llama.cpp F16 | 113,1 / 111,1 tok/s decode |
| iPhone 18 Pro, prefill (768 tokens) | 590,6 tok/s |
| iPhone 18 Pro, decode | 47,17 tok/s (medianas de 6 ensayos) |
| iPhone 18 Pro, un turno completo | 6,71 s; huella pico 2,82 GB |
| Teacher-forced (17 secuencias) | top-1 2639/2682 = 98,40 % frente a transformers fp32 |
| 8 preguntas, thinking off, greedy | 8/8, mismos veredictos que transformers bf16 |
| Token gate (16 tokens greedy) | 16/16 frente al oráculo fp32 |
| Thinking on, 8 preguntas, 3 ejecuciones | 8/8 en cada ejecución |

## Requisitos de hardware

- Mac: bundle de 2,72 GB; probado en M4 Max con macOS 27.0. La compilación para GPU se hace en la primera carga y se cachea; la variante ahead-of-time es más lenta en decode (105,5 frente a 169,5 tok/s).
- iPhone 18 Pro: bundle de 2,16 GB (resources.bin de 1,48 GB); huella pico de 2,82 GB durante la inferencia. Solo está compilado para el chip `h19p`; no hay bundles para otros iPhone.
- Cabe en GPU consumer Apple Silicon (M4 Max probado); no se documenta soporte para GPU NVIDIA, AMD ni otras.
- Opciones de despliegue: Core AI con CoreAIKit (`ChatSession`) y `LanguageModelSession` de Apple. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: primer token en 0,83 s en Mac y turno completo de 6,71 s en iPhone 18 Pro; primeras cargas de 34,9 s en la app de puerta y 32,4 s en CoreAIKit, con cargas posteriores de 4,4 s o menos y 3,7 s / 0,4 s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decode (M4 Max) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-CoreAI (este) | 1.7B | 4.096 | 169,5 tok/s (int8) | lfm1.0 | Hugging Face, formato `.aimodel` |
| LFM3-1.7B en MLX (8 bits) | 1.7B | no disponible | 189,8 tok/s | lfm1.0 | Hugging Face / MLX |
| LFM3-1.7B en llama.cpp (Q8_0) | 1.7B | no disponible | 180,2 tok/s | lfm1.0 | Hugging Face / GGUF |
| LFM3-1.7B en transformers (bf16) | 1.7B | no disponible | 113,1 tok/s (MLX bf16) | lfm1.0 | Hugging Face |

La comparativa se limita a las mismas pesos del modelo base en distintos runtimes, porque la información proporcionada no incluye otros modelos de 1.7B comparables. En calidad, todas las formas evaluadas dieron los mismos veredictos en las 8 preguntas de la prueba; la ventaja de este port es el bundle para Neural Engine del iPhone y la integración con `LanguageModelSession`.

## Limitaciones y advertencias

- Licencia lfm1.0 (license: other): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no se detallan aquí las restricciones concretas.
- Soporte de hardware muy restringido: el bundle móvil solo está compilado para el iPhone 18 Pro (`h19p`); no hay bundles para otros iPhone ni para GPU no Apple.
- Contexto limitado a 4.096 tokens, inferior al de muchos modelos actuales; además, el bundle de iPhone admite contextos de 256 a 4.096 con consultas de 8, 16 o 64 tokens.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe sin consultar la model card del modelo base.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de sesgo ni de robustez en la información disponible.
- Dependencia de versiones concretas: CoreAIKit con soporte LFM3 solo en la rama main desde `9e9143bc`, no en una release; swift-jinja 2.3.2 y 2.3.6; transformers 5.20.2 como referencia.
- El bundle de Mac es más lento que MLX y llama.cpp en decode (169,5 frente a 189,8 y 180,2 tok/s) y que sus variantes de 4 bits; su valor añadido es el soporte de Neural Engine y tool calling en Apple.
- Las primeras cargas en iPhone son lentas (34,9 s en la app de puerta, 32,4 s con CoreAIKit), lo que afecta a la experiencia de arranque en producción.
- No se han publicado datos de entrenamiento, sesgos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/LFM3-1.7B-CoreAI
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: https://huggingface.co/mlboydaisuke/LFM3-1.7B-CoreAI/blob/main/LICENSE
- CoreAIKit: https://github.com/john-rocky/coreai-kit
- Código de conversión y notas: https://github.com/john-rocky/coreai-model-zoo/tree/main/models/lfm3-1.7b
