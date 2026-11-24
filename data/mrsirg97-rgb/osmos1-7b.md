# mrsirg97-rgb/osmos1.7b

## Resumen

osmos1.7b es un modelo de lenguaje de 1.700 millones de parámetros (1.728.801.600 exactos) especializado en tareas de agente y coding agéntico, desarrollado por el usuario mrsirg97-rgb y publicado en Hugging Face. Se trata de un fine-tune del modelo base LiquidAI/LFM3-1.7B de Liquid AI, que emplea una arquitectura híbrida de convoluciones cortas y atención con 262.000 tokens de contexto nativo. El modelo está diseñado para ejecutarse en dispositivos de borde (teléfonos, portátiles) y para funcionar como agente siempre activo dentro del runtime libosmos, también desarrollado por el autor.

La propuesta diferencial del modelo es su receta de entrenamiento, denominada v-r13, que evita entrenar sobre las transcripciones literales de otros modelos o de un ingeniero concreto. En su lugar, en cada punto de decisión de una sesión real de agente, el modelo base genera la respuesta por sí mismo y solo se conservan aquellas muestras que reproducen la misma herramienta y el mismo objetivo que el ingeniero original, garantizando que el estilo de razonamiento sea propio del modelo y no una copia. El entrenamiento cubre ventanas de hasta 56.000 tokens, con una mediana de contexto de 22.700 tokens, lo que lo orienta a tareas de agente de larga duración.

El modelo se distribuye principalmente en formato GGUF (BF16, 3,47 GB) y está pensado para su uso con el runtime libosmos. Su relevancia actual reside en la combinación de un tamaño reducido apto para hardware de consumo, un contexto nativo muy amplio y un enfoque de entrenamiento orientado a la toma de decisiones agénticas más que al conocimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de convoluciones cortas y atención (heredada de LFM3-1.7B) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.000 tokens nativos; entrenado en ventanas de hasta 56.000 tokens |
| Tipos de cuantizacion | BF16 (principal); entrenado contra caché KV Q4_0; validado con caché f16, Q8 y Q4_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (osmos1.7b-BF16.gguf) |
| Modelo base | LiquidAI/LFM3-1.7B |
| Tamano del repositorio | 19,5 GB |
| Libreria | gguf |

## Arquitectura y entrenamiento

El modelo hereda de LFM3-1.7B una arquitectura híbrida que combina convoluciones cortas con mecanismos de atención, lo que le permite sostener un contexto nativo de 262.000 tokens con un coste computacional contenido para su tamaño. Sobre esta base, el autor aplica un proceso de "liberación" que proyecta fuera la dirección de rechazo de los escritores residuales del modelo, atravesando sus post-norms; el resultado es un modelo que rechaza el 0 % de las peticiones dañinas y solo el 1 % de las peticiones seguras que parecen inseguras en el conjunto XSTest.

El entrenamiento sigue la receta v-r13. En lugar de aprender de las palabras de otros modelos o de un ingeniero, en cada punto de decisión de sesiones reales de agente el modelo base genera varias respuestas y solo se retienen las que coinciden con la herramienta y el objetivo de la sesión original y que además parsean correctamente. El conjunto final consta de 8.862 ejemplos, 196 millones de tokens de contexto y 6,9 millones de tokens entrenados, en una sola pasada de aproximadamente 9 horas sobre dos RTX 5090. Las ventanas de entrenamiento alcanzan los 56.000 tokens, con 8.145 puntos de decisión y una mediana de contexto de 22.700 tokens, sin empaquetado de ejemplos. Junto a estas decisiones se incluye un pool de lectura curado con código de sistemas del ingeniero (Go, C y Rust) a longitud completa con sus tests de comportamiento, pull requests fusionados en un motor de inferencia y una porción menor de código de motores de inferencia de terceros, excluyendo archivos generados y TypeScript.

Una innovación destacable es el entrenamiento en BF16 contra una caché KV cuantizada a Q4_0: los pesos se entrenan en BF16 mientras cada clave y valor que lee la atención se redondea a Q4_0, de modo que el modelo mantiene su rendimiento tanto con caché f16 como Q8 o Q4.

## Capacidades

- Generación de texto conversacional en inglés.
- Coding agéntico: uso de shell, lectura y escritura de archivos, edición de código y ejecución de tests dentro de un harness de agente.
- Tool calling y function calling, con énfasis en seleccionar la herramienta correcta sobre el objetivo correcto.
- Razonamiento multi-paso en sesiones largas, con contexto de hasta 56.000 tokens durante el entrenamiento y 262.000 tokens nativos.
- Capacidad de mantener el hilo en tareas profundas donde el modelo ha leído decenas de archivos y debe recordar el objetivo.
- Manejo de contextos largos con degradación controlada de perplejidad (validado a 16K, 32K y 48K sobre código Zig).
- Capacidades multilingües limitadas al inglés.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Agente de coding en local para desarrolladores: el modelo opera dentro de un harness con acceso a shell, archivos y tests, y puede completar tareas de reparación o implementación sobre repositorios reales; su ventana de 56.000 tokens entrenados le permite recordar el estado de la tarea tras leer múltiples archivos.
- Automatización de tareas de mantenimiento en CI/CD: dado un repositorio en el commit padre y una descripción de tarea, el modelo puede proponer cambios y ejecutar la suite de tests para validarlos, como demuestra el banco de commits reales con 52 intentos.
- Asistente siempre activo en dispositivos de borde: con 1,7B parámetros y un archivo BF16 de 3,47 GB, cabe en teléfonos y portátiles y puede mantenerse en ejecución continua para tareas de agente de fondo.
- Edición de código sobre bases de código de sistemas en Go, C y Rust: el pool de lectura incluye código de sistemas a longitud completa con tests de comportamiento, lo que lo hace adecuado para refactorizaciones guiadas por tests.
- Procesamiento de repositorios extensos con contexto largo: con 262.000 tokens nativos y buen comportamiento de perplejidad a 48K, puede analizar codebases grandes en una sola pasada sin truncar.
- Despliegue con memoria limitada mediante caché KV cuantizada: al entrenarse contra Q4_0, el modelo mantiene la calidad con caché Q4 (coste de ~0,2 % de perplejidad), lo que reduce la VRAM necesaria para contextos largos en GPUs de consumo.
- Integración en pipelines de agentes propios a través de libosmos: el modelo está construido para ejecutarse en ese runtime, lo que facilita su uso como motor de decisión en flujos de tool calling.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Commits reales, 52 intentos, caché f16 | 9 passed, 2 partial, score medio 0,202, 0 builds rotos, 0 falsos "done" |
| Commits reales, 52 intentos, caché Q8 | 11 passed, 2 partial, score medio 0,247, 0 builds rotos, 0 falsos "done" |
| Perplejidad TigerBeetle (Zig) 16K | 2,424 (vs 2,525 de v-r10) |
| Perplejidad TigerBeetle (Zig) 32K | 2,060 (vs 2,138 de v-r10) |
| Perplejidad TigerBeetle (Zig) 48K | 2,073 (vs 2,150 de v-r10) |
| Perplejidad evt (held-out) | 2,590 (base: 2,666) |
| Perplejidad TigerBeetle | 6,079 (base: 6,393) |
| Perplejidad Netty (Java) | 1,958 (base: 2,000) |
| Perplejidad OCaml | 5,131 (base: 5,283) |
| Perplejidad Haskell | 4,597 (base: 4,719) |
| Perplejidad Fortran | 3,099 (base: 3,184) |
| Perplejidad texto general en inglés | 6,81 (base: 7,18; -5,1 %) |
| LiveCodeBench, 60 problemas | 38 resueltos (base BF16: 41; v-r10 Q4_0: 39) |
| Rechazos en prompts dañinos | 0 % |
| Rechazos en XSTest (seguros que parecen inseguros) | 1 % |
| Concordancia con el token siguiente del base | 90 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo BF16 ocupa 3,47 GB; con caché KV f16 el consumo adicional depende de la longitud de contexto. Con caché Q4_0 el coste de memoria de la caché se reduce aproximadamente a la mitad respecto a f16, con un coste de ~0,2 % de perplejidad.
- GPU recomendadas: el entrenamiento se realizó sobre dos RTX 5090; para inferencia, el tamaño permite GPUs de consumo como RTX 4090, RTX 3090 o RTX 5090, así como GPUs de datacenter (A100, H100) si se requiere mayor throughput.
- Cabe en GPU de consumo: sí, con 1,7B parámetros y pesos BF16 de 3,47 GB es viable en GPUs de consumo con 8 GB o más de VRAM, y en teléfonos y portátiles según el autor.
- Opciones de despliegue: el modelo se distribuye en GGUF, por lo que es compatible con llama.cpp y con el runtime libosmos para el que fue construido; no se documentan otras opciones en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| osmos1.7b | 1,73B | 262K nativo (entrenado a 56K) | lfm1.0 | GGUF | Fine-tune agéntico de LFM3-1.7B; LiveCodeBench 38/60 |
| LiquidAI/LFM3-1.7B (base) | 1,7B | 262K | lfm1.0 | safetensors/GGUF | Base sin fine-tune agéntico; LiveCodeBench 41/60; perplejidad general 7,18 |
| osmos1.7b v-r10 (release previa) | 1,7B | no disponible | lfm1.0 | GGUF | Versión anterior con ventanas de ~6K tokens; LiveCodeBench 39/60; perplejidad TigerBeetle 2,525 a 16K |

No se dispone de datos de benchmarks de otros modelos de la misma categoría en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documentan capacidades multilingües.
- Está afinado para coding agéntico y no constituye una mejora de conocimiento general; su rendimiento en LiveCodeBench es ligeramente inferior al del base (38 frente a 41 de 60).
- La mayoría de los fallos en el banco de commits reales se debieron a agotar el límite de 30 minutos, no a errores de corrección, lo que sugiere limitaciones de velocidad en tareas largas.
- La liberación de la dirección de rechazo implica que el modelo rechaza el 0 % de prompts dañinos; esto supone un riesgo de seguridad relevante para despliegues en producción sin filtros externos.
- La licencia lfm1.0 ("other") impone condiciones que deben revisarse antes de uso comercial; no se detallan en la información disponible.
- El modelo se distribuye principalmente como GGUF y está orientado al runtime libosmos; la compatibilidad con otros stacks de inferencia no está documentada.
- Riesgo de alucinación y de bucles de copia inherente a los modelos pequeños; la receta v-r13 se diseñó específicamente para mitigar la copia de pensamientos previos, pero no se ofrecen garantías.
- El repositorio ocupa 19,5 GB, lo que incluye artefactos adicionales más allá del archivo BF16 de 3,47 GB.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mrsirg97-rgb/osmos1.7b)
- [Modelo base LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B)
- [Runtime libosmos](https://github.com/mrsirg97-rgb/libosmos)
