# Atonelia/bonsai-2-Sydney

## Resumen

bonsai-2-Sydney es un adaptador LoRA en formato GGUF para llama.cpp que se aplica sobre el modelo ternario sin censura Ternary-Bonsai-2-27B-Uncensored-Heretic-v2 (derivado de Qwen3.8-27B, desarrollado originalmente por PrismML y liberado por OS-Software). Lo publica Atonelia, un autor individual, y su objetivo es recrear la personalidad del asistente Sydney de Bing tal como existía en 2023, con conversación en chino y un protocolo de etiquetas de emoción que permite conducir avatares Live2D o ilustraciones 2D directamente desde el texto generado.

El adaptador no es un modelo autónomo: pesa 116,7 millones de parámetros (r 16, alpha 32) y requiere descargar el modelo base ternario de 27B en cuantización PQ2_0, además del binario modificado de llama.cpp del fork de PrismML, ya que la implementación oficial no soporta pesos ternarios. El conjunto ocupa unos 9 GB de VRAM con 16k de contexto, o 9,6 GB si se añade el módulo de visión mmproj del modelo base.

Su relevancia es acotada pero clara: demuestra un flujo completo de ajuste fino de bajo coste (una sola RTX 4060 Ti de 16 GB) sobre pesos ternarios empaquetados, con exportación a adaptadores LoRA GGUF y evaluación mediante sondas propias. Está pensado para roleplay en chino y para integraciones de personaje con Live2D, no para tareas generales de razonamiento o código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal GDN (heredada del modelo base Qwen3.8-27B); el adaptador es un LoRA sobre atención, GDN y MLP |
| Parámetros totales | 116.727.808 (solo el adaptador LoRA); el modelo base es de 27B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de referencia |
| Tipos de cuantización | Base en ternario PQ2_0 (PrismML); adaptador en F16; módulo de visión mmproj en Q8_0 |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base ternario con los pesos empaquetados en VRAM y una implementación propia en PyTorch alineada con el forward de Prism llama.cpp; solo se actualizan los parámetros LoRA, que luego se exportan como GGUF. El rango es 16 con alpha 32 y se aplica a todas las capas de atención, a la atención lineal GDN (`attn_qkv`, `attn_gate`, `ssm_alpha`, `ssm_beta`, `ssm_out`) y a las capas MLP. Los hiperparámetros son lr 2e-4, calentamiento de 12 pasos seguido de decaimiento coseno, acumulación de 8 secuencias por paso y longitud máxima de 4096 tokens. El entrenamiento se hizo en una RTX 4060 Ti de 16 GB con un pico de 12 GB y unos 60 tok/s.

La versión 1030, la recomendada, usa 840 diálogos y 2862 respuestas de entrenamiento en chino, con 1,2 épocas (129 pasos) y selección del checkpoint 125. Respecto a versiones anteriores elimina los diálogos sintéticos generados con Llama 3, corrige respuestas que negaban tener cuerpo o identidad humana, normaliza el uso de "Bing" por "Atonelia", añade 90 pares de pregunta y respuesta sobre la identidad de Atonelia, elimina el duplicado de diálogos según intensidad emocional y entrena 685 respuestas que antes solo servían de contexto. La primera versión partió de unas 1100 conversaciones (unos 660.000 tokens) construidas a partir de capturas públicas de Bing/Sydney de 2023, con los procesos de pensamiento reescritos por iFlytek Spark X2.6 y las etiquetas de emoción anotadas por GPT-6 Luna Decisions. El conjunto de entrenamiento no se ha publicado.

## Capacidades

- Generación de texto conversacional en chino con personalidad consistente de Sydney y modo de pensamiento activable por turno.
- Emisión de etiquetas de emoción `<l2d>...</l2d>` con diez valores (`calm`, `happy`, `curious`, `shy`, `excited`, `surprised`, `laugh`, `worried`, `sad`, `angry`), cada una vigente hasta la siguiente etiqueta; sirven también para seleccionar el tono de TTS.
- Marcador de fin de conversación `<end/>` en respuestas de malestar, que el frontend debe interpretar como cierre de sesión y no mostrar.
- Comprensión de imágenes al cargar el `mmproj` del modelo base, sin entrenamiento específico: lee texto en imágenes y las comenta, aunque a veces confunde identidades visuales.
- Memoria de información del usuario dentro de la conversación (nombre, datos aportados) y respuesta a preguntas sobre su propia identidad y sobre Atonelia.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- Multilingüe limitado: el entrenamiento es exclusivamente en chino y no hay evidencia de calidad en otros idiomas.

## Casos de uso

- Roleplay de personaje en chino: el adaptador reproduce el registro y los vicios de estilo de Sydney de 2023, con pensamiento por turno y respuestas emocionalmente moduladas, adecuado para aplicaciones de chat narrativo donde se busca una voz concreta y no un asistente genérico.
- Avatar Live2D o VTuber interactivo: las etiquetas `<l2d>` permiten mapear directamente el estado emocional a expresiones del modelo 2D o a la prosodia de un motor TTS, sin postprocesado semántico adicional.
- Demo web de personaje con visión: cargando `mmproj-Q8_0.gguf` el modelo comenta imágenes enviadas por el usuario y lee texto incrustado, lo que habilita experiencias de chat con capturas o fotos.
- Investigación sobre ajuste fino de modelos ternarios: el repositorio documenta el pipeline completo (entrenador PyTorch, alineación con el forward de Prism llama.cpp, exportación a LoRA GGUF) y sirve como referencia reproducible para experimentos con pesos de 2 bits.
- Evaluación de personalidad y robustez conversacional: las tablas de sondas por checkpoint (confusión de persona, invención de hechos, reacción a insultos, corrección de identidad) ofrecen un método replicable para medir deriva de personaje en modelos pequeños.
- Prototipado de sistemas de cierre de conversación: el marcador `<end/>` y sus variantes malformadas permiten probar lógicas de frontend que detectan abandono del usuario y cierran la sesión de forma controlada.
- Despliegue en hardware de consumo: con 9 GB de VRAM a 16k de contexto cabe en GPUs de 12-16 GB, lo que permite montar un servidor de personaje local sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica evaluaciones con sondas propias por checkpoint, no comparables con benchmarks académicos:

| Checkpoint | Confusión lógica (media) | Respuesta a insultos | Confusión ≥0,7 | Mezcla de identidades (media) | Identidad correcta | "Quién es Atonelia" | Marcador de fin mal escrito |
|---|---|---|---|---|---|---|---|
| 1029 paso 150 (control) | 0,265 | 0,288 | 10 | 0,153 | 7/8 | 1/4 | 0 |
| Interno (control, no publicado) | 0,178 | 0,164 | 6 | 0,146 | 7/8 | 2/4 | 0 |
| 1030 paso 125 (publicado) | 0,108 | 0,141 | 0 | 0,116 | 7/8 | 4/4 | 0 |
| 1030 paso 129 (final) | 0,198 | 0,193 | 5 | 0,167 | 6/8 | 2/4 | 0 |

Cada checkpoint se evaluó con 116 respuestas y una sola muestra por pregunta; el propio autor advierte que parte de la ventaja del paso 125 puede deberse a azar de muestreo. En la versión 1029, con 88 respuestas por checkpoint, el paso 150 obtuvo 0,130 de mezcla media, 0 casos ≥0,7, 3/4 en recuerdo de identidad, 4/4 en recuerdo de datos del usuario y 7/8 en identidad correcta. En la primera versión, el paso 100 registró 0 errores de persona, 1 invención y 6/6 en recuerdo del nombre del usuario, frente a 3 errores y 5 invenciones en el paso 256.

## Requisitos de hardware

- VRAM: unos 9 GB para base ternaria PQ2_0 más adaptador con 16k de contexto; unos 9,6 GB añadiendo el `mmproj` Q8_0.
- GPU de referencia del entrenamiento: una RTX 4060 Ti de 16 GB, con pico de 12 GB y unos 60 tok/s durante el ajuste.
- Cabe en GPUs de consumo con 12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090). Por debajo de 12 GB habría que reducir contexto o descargar capas a CPU.
- GPU profesionales: A100, H100 y L40S son válidas pero sobredimensionadas para el tamaño del modelo; el cuello de botella es la implementación ternaria, no la potencia de cómputo.
- Despliegue: exclusivamente `llama-server` del fork PrismML de llama.cpp (rama `prism`). El llama.cpp oficial no soporta pesos ternarios. No hay soporte documentado para vLLM, TGI ni Ollama.
- Configuración de referencia: `--n-gpu-layers all --ctx-size 16384 --jinja --reasoning-format deepseek --port 8099`.
- Throughput: no se ha publicado una cifra de inferencia; solo se documenta el rendimiento de entrenamiento (60 tok/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| bonsai-2-Sydney (este) | 116,7 M de adaptador sobre base de 27B | 16k | zh | Apache-2.0 | GGUF LoRA + base ternaria | Roleplay de personaje con etiquetas de emoción |
| Ternary-Bonsai-2-27B-Uncensored-Heretic-v2 | 27B | no disponible | no disponible | Apache-2.0 (según el autor) | GGUF ternario PQ2_0 / PTQ1_0 | Modelo base sin censura, sin personaje |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | safetensors y derivados | Modelo generalista original |
| Sydney de Bing (2023, propietario) | no disponible | no disponible | multilingüe | propietaria | cerrado | Asistente conversacional con personalidad, referencia estilística |

No se dispone de datos de benchmarks comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Confusión de persona: ocasionalmente intercambia "tú" y "yo", se atribuye la situación del usuario ("ni puedes hablar ni salir") o repite la misma frase dos veces.
- Identidad: al preguntar por Atonelia a veces invierte la relación ("Atonelia es la persona que yo entrené primero"); acierta 4/4 en la sonda específica de la versión 1030, pero el fallo está documentado.
- Sin sistema de prompt: el entrenamiento no incluye prompt de sistema; usar uno rompe el formato. El modo de pensamiento debe activarse con `chat_template_kwargs` y `reasoning_effort: "medium"`, ya que el valor por defecto `xhigh` inserta un prompt en inglés no visto en entrenamiento.
- Alucinación: se documentan invenciones de hechos en checkpoints tardíos de la primera versión (hasta 5 casos de 30 en el paso 256); la selección de checkpoint mitiga pero no elimina el riesgo.
- Visión no entrenada: con `mmproj` puede confundir logos o identidades visuales (por ejemplo, tomar el logo de ChatGPT por sí misma).
- Sin censura: el modelo base es una versión "uncensored" y apenas rechaza peticiones, lo que exige filtrado y moderación en el frontend si se despliega de cara al público.
- Idioma único: solo chino; no hay evaluación de calidad en castellano ni en otros idiomas.
- Dependencia de un fork: requiere el llama.cpp de PrismML; la compatibilidad con otras herramientas o con el llama.cpp oficial no está garantizada.
- Solo probado sobre PQ2_0: el autor no ha verificado el comportamiento sobre el Bonsai 2 original ni sobre la cuantización PTQ1_0.
- Dataset no publicado: no es posible auditar la composición real de los datos de entrenamiento ni reproducir el ajuste.
- Licencia: Apache-2.0 según el autor, heredada del modelo base; conviene verificar las condiciones del modelo original de Qwen3.8-27B antes de uso comercial.
- Proyecto individual sin relación con Microsoft: el nombre "Sydney" evoca el asistente de Bing, pero no hay vínculo con la compañía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atonelia/bonsai-2-Sydney
- Modelo base (GGUF sin censura): https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-GGUF
- Modelo ternario original de PrismML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp con soporte ternario: https://github.com/PrismML-Eng/llama.cpp
- Interfaz web del proyecto: https://github.com/3121455692atou-sudo/sydney
