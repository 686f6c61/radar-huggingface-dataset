# peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-MLX-6bit

## Resumen

Nail-Qwen3.6-35B-A3B-MLX-6bit es una cuantizacion en formato MLX de 6 bits del modelo Qwen/Qwen3.6-35B-A3B, desarrollada por el usuario peculiar-ragdoll. Se trata de un modelo de lenguaje multimodal (image-text-to-text) con arquitectura de mezcla de expertos (MoE) que combina 35 000 millones de parametros totales con solo 3 000 millones activos por token, lo que permite una inferencia rapida y eficiente en recursos. El autor ha aplicado la receta de cuantizacion por tensor UD-Q6_K_XL de Unsloth, preservando la cabeza MTP (multi-token prediction) y el encoder de vision, y ha modificado el chat template para forzar un estilo de respuesta directo y conciso.

El modelo destaca por su ventana de contexto nativa de 262 144 tokens (256k) y por su capacidad para ejecutar tareas de razonamiento, codificacion agente y conversaciones multi-turno con baja latencia. Segun la model card, supera a modelos densos como Qwen3.6-27B en tiempo de respuesta manteniendo una precision comparable, y esta optimizado para escenarios donde la velocidad de procesamiento es critica. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

Esta version en 6 bits esta pensada para equipos Apple Silicon con al menos 36 GB de RAM unificada, aunque tambien existe una version GGUF para otras plataformas. El modelo se distribuye bajo el nombre comercial "Nail" y forma parte de una familia que incluye variantes cuantizadas en 4 y 8 bits, asi como una version "uncensored" denominada Occult Nail.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.6-35B-A3B, con encoder de vision |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3 000 millones (3B) por token |
| Longitud de contexto | 262 144 tokens (256k) nativos |
| Tipos de cuantizacion | 6-bit (esta version); tambien existen variantes 4-bit y 8-bit, y GGUF |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) y GGUF (version separada) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer multimodal con arquitectura de mezcla de expertos (MoE): de los 35 000 millones de parametros totales, solo 3 000 millones se activan por cada token procesado, lo que reduce significativamente el coste computacional por inferencia. Incluye un encoder de vision que permite procesar entradas de imagen y texto, y una cabeza MTP (multi-token prediction) que acelera la generacion autoregresiva. La version Nail aplica una cuantizacion por tensor de 6 bits siguiendo la receta UD-Q6_K_XL de Unsloth, que preserva tanto la cabeza MTP como el encoder de vision.

No se ha realizado un entrenamiento adicional sobre el modelo base; el trabajo de peculiar-ragdoll consiste en la cuantizacion y en la modificacion del chat template. El template mejorado inyecta automaticamente un prompt de tersura al final de cualquier system prompt proporcionado por el usuario, con instrucciones como "responde directamente, tras pensar", "no repitas puntos ya mencionados" y "manten la respuesta final concisa". Este prompt se aplica en cada llamada, lo que modifica el comportamiento del modelo sin necesidad de reentrenamiento. El autor no ha publicado detalles sobre el dataset de entrenamiento original de Qwen3.6-35B-A3B, que es responsabilidad de Qwen.

## Capacidades

- Generacion de texto y razonamiento: responde a preguntas complejas con un estilo directo y sin rodeos, gracias al prompt de tersura inyectado en el template.
- Codificacion agente: disenado para tareas de ingenieria de software autonoma, con soporte para tool calling y ejecucion de multiples pasos de razonamiento.
- Procesamiento de imagenes: al ser un modelo image-text-to-text, puede recibir imagenes como entrada y generar texto relacionado (descripciones, analisis, respuestas a preguntas visuales).
- Conversacion multi-turno: mantiene coherencia en dialogos largos gracias a su ventana de contexto de 256k tokens y a la cuantizacion de la cache KV en 8 bits.
- Pensamiento eficiente (efficient-thinking): el prompt del sistema fuerza al modelo a liderar con la respuesta y omitir preambulos, transiciones y relleno innecesario.
- Multilingue: soporta ingles y chino, con capacidad de alternar entre ambos idiomas.
- Token-efficient: consume menos tokens por respuesta que el modelo base, lo que reduce el coste de contexto en sesiones largas.

## Casos de uso

- Asistente de codificacion autonoma en entornos de desarrollo: el modelo puede integrarse en agentes como Pi o Claude Code para resolver incidencias de software, generar parches y ejecutar pruebas. Su velocidad de respuesta permite iterar rapidamente sobre multiples problemas en una sesion.
- Chatbot de atencion al cliente con contexto largo: gracias a los 256k tokens de ventana, puede mantener conversaciones extensas con historial completo, recordando detalles de interacciones anteriores sin perder coherencia.
- Analisis de imagenes y generacion de descripciones: al ser multimodal, puede procesar capturas de pantalla, diagramas o fotografias y generar explicaciones tecnicas o resumenes, util en documentacion automatica.
- Razonamiento sobre documentos extensos: con 256k tokens de contexto, puede leer y analizar libros, informes o codigo fuente completo en una sola pasada, respondiendo preguntas sobre el contenido.
- Agente de automatizacion de tareas: su soporte para tool calling y razonamiento multi-paso permite construir pipelines que consulten APIs, ejecuten comandos y tomen decisiones basadas en resultados intermedios.
- Evaluacion rapida de modelos en investigacion: su bajo coste de inferencia (3B activos) y su licencia permisiva lo hacen adecuado para experimentos de comparacion y pruebas de concepto en laboratorios con recursos limitados.

## Benchmarks y rendimiento

La model card del autor incluye graficas comparativas para cuatro benchmarks (MMLU-Pro, Claw-Eval multi_turn, y dos metricas de ingenieria de software agente), pero no se proporcionan valores numericos en el texto. Los resultados se midieron en un Mac Studio M2 Ultra con 64 GB de RAM, usando la version 4-bit del modelo. Segun las afirmaciones del autor, Nail iguala la precision de Qwen3.6-27B y ThinkingCap en razonamiento y habilidades de ingenieria de software, superandolos en tiempo de respuesta y calidad de conversacion multi-turno. No se han publicado resultados numericos detallados en la informacion disponible.

## Requisitos de hardware

- RAM minima para la version 6-bit: 36 GB de memoria unificada en equipos Apple Silicon (segun la model card).
- Con contexto completo (256k tokens) y cache KV sin cuantizar, el modelo cabe en 32 GB de RAM unificada, segun las pruebas del autor.
- GPU recomendada: Apple Silicon con al menos 36 GB de RAM unificada (M1 Max, M2 Ultra, etc.). Para otras plataformas, se recomienda usar la version GGUF con llama.cpp u Ollama.
- VRAM estimada en GPUs NVIDIA: no disponible en la informacion proporcionada. La version GGUF puede ejecutarse en GPUs con 24 GB o mas, dependiendo de la cuantizacion.
- Opciones de despliegue: MLX (para Apple Silicon), llama.cpp, Ollama, y servidores de inferencia compatibles con GGUF (como llama-server).
- Latencia y throughput: el autor reporta que Nail es 2-5 veces mas rapido que modelos densos comparables en tiempo de respuesta, gracias a la arquitectura MoE con solo 3B parametros activos. No se proporcionan cifras exactas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Nail-Qwen3.6-35B-A3B (6-bit) | 35B total, 3B activos | 256k | 6-bit MLX | Apache 2.0 | Optimizado para velocidad y tersura |
| Qwen3.6-27B (dense) | 27B | 256k | Variable | Apache 2.0 | Modelo denso, mas lento pero con mayor resistencia en contexto largo |
| Dagger-27B (MLX) | 27B | 256k | Variable | Apache 2.0 | Hermano denso de Nail, mejor para sesiones largas y coherentes |
| ThinkingCap (fine-tune de Qwen3.6-27B) | 27B | 256k | Variable | Apache 2.0 | Fine-tune con capacidad de pensamiento, mas verboso que Nail |

Segun la model card, Nail supera a Qwen3.6-27B y ThinkingCap en velocidad y calidad de conversacion multi-turno, pero consume mas tokens por pregunta (5 777 tokens por pregunta en GPQA-Diamond frente a 2 380 de Dagger), lo que reduce su resistencia en sesiones muy largas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han publicado evaluaciones especificas de sesgos para esta cuantizacion. Como modelo derivado de Qwen3.6, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: el prompt de tersura puede llevar al modelo a omitir matices importantes en aras de la brevedad. El autor advierte que "nunca se debe sacrificar la correccion por la brevedad", pero esto depende del cumplimiento del prompt.
- Limitaciones de contexto: aunque la ventana es de 256k tokens, el modelo tiende a generar respuestas verbosas en el pensamiento, consumiendo contexto rapidamente. En sesiones largas, Dagger-27B es mas eficiente en tokens por pregunta.
- Restricciones de idioma: solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3.6-35B-A3B tiene su propia licencia (tambien Apache 2.0 segun el enlace). Se recomienda revisar la licencia del modelo base para confirmar.
- Dependencia de plataforma: la version MLX solo funciona en Apple Silicon. Para otras plataformas es necesario usar la version GGUF, que puede tener un rendimiento diferente.
- Sin garantias de produccion: el modelo es una cuantizacion casera ("home-baked") sin certificacion oficial de Qwen. No se recomienda su uso en entornos de produccion criticos sin una validacion exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Version GGUF: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Chat template mejorado: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Version uncensored (Occult Nail): https://huggingface.co/peculiar-ragdoll/Occult-Nail-1.0-35B-A3B-GGUF
- Receta de cuantizacion UD-Q6_K_XL de Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Modelo denso Dagger-27B: https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-MLX
