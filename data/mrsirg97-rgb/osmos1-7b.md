# mrsirg97-rgb/osmos1.7b

## Resumen

osmos1.7b es un modelo de lenguaje de 1.700 millones de parámetros orientado a tareas de agente y coding, publicado por el usuario mrsirg97-rgb en Hugging Face. Se trata de un fine-tuning del modelo base LiquidAI/LFM3-1.7B de Liquid AI, una arquitectura híbrida de convoluciones cortas y atención con 262K de contexto nativo. El modelo está empaquetado en formato GGUF y diseñado para ejecutarse en dispositivos de borde (teléfonos, portátiles, agentes always-on) a través del runtime libosmos del propio autor.

La propuesta central del modelo es aprender el comportamiento de un ingeniero concreto en su entorno de trabajo real: qué herramienta usar, cuándo, sobre qué objetivo y cómo expresarlo. Para ello se entrena sobre turnos reales de sesiones de agente (shell, ficheros, ediciones, tests) seleccionados por señal, no por volumen, evitando el bucle degenerado típico de los modelos pequeños entrenados sobre transcripciones de otros modelos.

Es relevante ahora porque demuestra que un modelo de 1.7B puede sostener comportamiento agéntico en tareas de código con contexto largo (32K ventanas de entrenamiento, 262K nativos) y cuantización agresiva de caché KV (Q4_0), lo que lo sitúa en la franja de modelos desplegables en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convoluciones cortas y atención), base LFM3-1.7B |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262K nativo; entrenamiento agéntico en ventanas de 32K |
| Tipos de cuantización | GGUF (bf16, q8_0 en el repo); entrenado contra caché KV Q4_0 |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (bf16, q8_0) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de Liquid AI, una arquitectura híbrida que combina convoluciones cortas con atención y un contexto nativo de 262K tokens. El fine-tuning se realizó sobre la receta v-r15 del autor: en cada punto de decisión de sesiones reales de agente, el modelo base genera el turno varias veces y solo se conservan las muestras que coinciden con la acción del ingeniero (misma herramienta, mismo objetivo, parseo limpio). Así se evita entrenar sobre palabras de otros modelos, que es la causa habitual de bucles de copia en modelos pequeños.

El conjunto de entrenamiento combina 4.183 turnos de dos arneses de agente con un pool de código de sistemas del autor (C, Go, Rust, HIP, CUDA) cortado en ventanas de 16K, incluyendo tests de comportamiento. En total: 5.061 ejemplos, 94M tokens de contexto y 5,6M tokens entrenados en una sola pasada, con 3 horas de cómputo en dos RTX 5090. Los pesos se entrenan en BF16 contra una caché KV cuantizada a Q4_0, de modo que el modelo mantiene calidad tanto en f16, Q8 como en Q4_0. Adicionalmente, el autor indica que la dirección de rechazo fue proyectada fuera de los escritores residuales del modelo base ("liberated").

## Capacidades

- Generación de texto conversacional en inglés.
- Coding agéntico: shell, lectura y escritura de ficheros, ediciones, ejecución de tests y commits.
- Tool calling / function calling orientado a arneses de agente reales.
- Razonamiento multi-paso dentro de una sesión de agente con ventanas de 32K.
- Contexto largo nativo de 262K tokens (medido hasta 48K en perplejidad).
- Comprensión y generación de código en C, Go, Rust, HIP, CUDA, Zig, Java, OCaml, Haskell y Fortran (evaluado por perplejidad).
- Capacidad de planificación de tareas (plan, editar, construir, testear, commit, abrir PR).
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Agente de coding en local: el modelo puede ejecutarse en un portátil o teléfono a través de libosmos y resolver tareas de edición y test sobre un repositorio, con ventanas de 32K que cubren la mayoría de sesiones reales.
- Automatización de mantenimiento de repositorios: dado un commit padre y una descripción de tarea, el modelo propone cambios verificables por la suite de tests del proyecto, como demuestra el banco de commits retenidos.
- Asistente de shell en dispositivos de borde: con cuantización q8_0 o bf16 y caché KV Q4_0, puede gestionar comandos, ficheros y ediciones en entornos con poca VRAM.
- Generación y revisión de código de sistemas en C, Go, Rust, HIP y CUDA, aprovechando el pool de lectura de código del autor y su rendimiento en perplejidad sobre estos lenguajes.
- Integración en pipelines de CI/CD como agente de reparación: el modelo nunca rompió la build ni declaró tareas falsamente completadas en el banco de commits, lo que reduce el riesgo de falsos positivos.
- Análisis de bases de código largas: con 262K de contexto nativo puede cargar ficheros completos o múltiples módulos y responder preguntas sobre ellos, aunque la calidad medida se centra en ventanas de hasta 48K.
- Prototipado de agentes always-on en hardware de consumo: su tamaño (1.7B) y su entrenamiento contra caché Q4_0 permiten mantener sesiones largas con memoria reducida.

## Benchmarks y rendimiento

Banco de commits reales (26 commits retenidos de proyectos Go del ingeniero, arnés real, 30 minutos de límite, temperatura 0.1, dos intentos por commit):

| Commit bench | Intentos | Aprobados | Parciales | Puntuación media | Rompió build | Declaró falso |
|---|---|---|---|---|---|---|
| Versión previa (v-r13) | 52 | 9 | 2 | 0.202 | 0 | 0 |
| osmos1.7b v-r15 | 45 | 9 | 4 | 0.248 | 0 | 0 |

Perplejidad en contexto largo sobre TigerBeetle (Zig), retenido:

| Modelo | 16K | 32K | 48K |
|---|---|---|---|
| Versión previa (v-r13) | 2.424 | 2.060 | 2.073 |
| osmos1.7b v-r15 | 2.401 | 2.044 | 2.061 |

Perplejidad en código retenido (menor es mejor):

| Modelo | evt | TigerBeetle (Zig) | Netty (Java) | OCaml | Haskell | Fortran |
|---|---|---|---|---|---|---|
| Base (LFM3-1.7B liberado) | 2.666 | 6.393 | 2.000 | 5.283 | 4.719 | 3.184 |
| Versión previa (v-r13) | 2.590 | 6.079 | 1.958 | 5.131 | 4.597 | 3.099 |
| osmos1.7b v-r15 | 2.522 | 5.997 | 1.936 | 5.035 | 4.519 | 3.065 |

Texto general en inglés: perplejidad 6,77 frente a 7,18 del base (-5,6%). KL respecto al base: 0,050. Coincidencia en el siguiente token top-1 con el base: 89%. En caché KV, Q8 igualó a f16 hasta tres decimales y Q4_0 costó aproximadamente un 0,2% de perplejidad.

## Requisitos de hardware

- VRAM estimada: en bf16, unos 3,5 GB solo para pesos; en q8_0, unos 1,9 GB; en Q4_0, aproximadamente 1 GB (estimación a partir del número de parámetros, no publicada por el autor).
- GPU recomendadas: RTX 5090 (usadas en el entrenamiento), RTX 4090, A100, H100; cualquier GPU consumer con 8 GB o más permite bf16 con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares; también en placas integradas y teléfonos con q8_0 o cuantizaciones menores.
- Opciones de despliegue: llama.cpp, Ollama y el runtime libosmos del autor (orientado a agentes always-on). El repo GGUF es compatible con endpoints estándar de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| osmos1.7b | 1,7B | 262K nativo / 32K agéntico | lfm1.0 | GGUF | Agente de coding de borde |
| LiquidAI/LFM3-1.7B | 1,7B | 262K | lfm1.0 | safetensors | Modelo base general |
| Versión previa v-r13 | 1,7B | 262K | lfm1.0 | GGUF | Agente de coding (iteración anterior) |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (por ejemplo, Qwen2.5-Coder-1.5B o Llama-3.2-1B) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documenta multilingüismo.
- Está especializado en coding agéntico y no es una mejora de conocimiento general: su rendimiento fuera de tareas de agente y código puede degradarse respecto al base.
- Entrenado sobre las sesiones de un único ingeniero; puede reproducir sesgos de estilo, herramientas y flujos de trabajo de esa persona.
- Riesgo de alucinación en tareas fuera de su dominio; en el banco de commits no declaró falsamente tareas completadas, pero el conjunto es pequeño (26 commits).
- La mayoría de los fallos en el banco de commits se debieron a agotar el límite de 30 minutos, no a errores de corrección, lo que sugiere limitaciones de velocidad más que de calidad.
- Licencia lfm1.0 (license: other): es necesario revisar los términos antes de uso comercial; el autor no aclara restricciones adicionales.
- El contexto nativo es de 262K, pero el entrenamiento agéntico se realizó en ventanas de 32K; el rendimiento más allá de 48K no está medido.
- El proceso de "liberación" (proyección de la dirección de rechazo) puede alterar el comportamiento de seguridad del modelo base; conviene evaluarlo en despliegues sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsirg97-rgb/osmos1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Runtime libosmos: https://github.com/mrsirg97-rgb/libosmos
