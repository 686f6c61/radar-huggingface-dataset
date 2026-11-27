# mrsirg97-rgb/vibes1.7b

## Resumen

osmos1.7b es un modelo de lenguaje de 1.700 millones de parámetros (1.728.801.600 exactamente) especializado en codificación agéntica, desarrollado por el usuario mrsirg97-rgb como un ajuste fino del modelo base LiquidAI/LFM3-1.7B de Liquid AI. El modelo está diseñado para ejecutarse en el runtime homónimo "osmos" (libosmos), orientado a dispositivos de borde como teléfonos y portátiles, y se distribuye principalmente en formato GGUF para su despliegue en entornos con recursos limitados.

La propuesta del modelo es poco convencional: en lugar de entrenar sobre transcripciones de otros modelos, el autor genera cada turno de decisión con el propio modelo base y conserva únicamente aquellos turnos que reproducen la acción real del ingeniero (misma herramienta, mismo objetivo, parseo limpio). El resultado es un ajuste fino de 5.061 ejemplos, 94 millones de tokens de contexto y 5,6 millones de tokens entrenados, realizado en una sola pasada de tres horas sobre dos RTX 5090.

El modelo es relevante ahora porque demuestra que un ajuste fino pequeño y muy dirigido puede mejorar a un modelo de 1.7B en tareas de agente de código (shell, ficheros, ediciones, tests) sin degradar su conocimiento general, manteniendo además el contexto nativo de 262K tokens del modelo base y un entrenamiento calibrado contra caché KV de 4 bits. Su licencia es lfm1.0, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida de convoluciones cortas y atención (base LFM3-1.7B de Liquid AI) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262K nativo en el modelo base; entrenamiento agéntico en ventanas de 32K |
| Tipos de cuantización | bf16, q8_0, GGUF; entrenado contra caché KV Q4_0 |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | GGUF (librería gguf), bf16 y q8_0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LFM3-1.7B de Liquid AI: una combinación híbrida de convoluciones cortas y mecanismos de atención, con 262K tokens de contexto nativo y capacidades destacadas de tool calling. El ajuste fino se realizó en BF16 mientras que cada clave y valor leído por la atención se redondeaba a Q4_0, de modo que los pesos resultantes mantienen su comportamiento tanto con caché f16 como Q8 o Q4. El entrenamiento se hizo en una sola pasada: 5.061 ejemplos, 94M tokens de contexto y 5,6M tokens entrenados, en tres horas sobre dos RTX 5090.

La innovación principal es el método de generación de datos (recipe v-r15). En cada punto de decisión de las sesiones reales del ingeniero, el modelo base escribe el turno varias veces y solo se conserva la muestra que coincide con la acción real (misma herramienta sobre el mismo objetivo, parseo limpio). Se priorizan los turnos que actúan o verifican (editar, escribir, compilar, testear, commit, abrir PR, planificar) frente a los que solo leen, y se descartan lecturas fáciles y ruido. Se añade además un corpus curado de código de sistemas del ingeniero (C, Go, Rust, HIP, CUDA) con sus tests de comportamiento, cortado en ventanas de 16K. Las ventanas de sesión se limitan a 32K, aplicando una compactación que conserva el system prompt, la tarea y las rondas más recientes. El autor indica que también se proyectó fuera de los "residual writers" la dirección de rechazo ("liberated"), aunque no se detalla el procedimiento.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de ingeniería de software.
- Codificación agéntica: uso de shell, lectura y escritura de ficheros, ediciones, ejecución de tests y commits.
- Tool calling / function calling, heredado del modelo base y reforzado por el ajuste fino.
- Ejecución de tareas multi-paso en un arnés de agente real, con planificación y verificación.
- Comprensión de código en C, Go, Rust, HIP, CUDA, Zig, Java, OCaml, Haskell y Fortran (evaluado por perplejidad).
- Contexto largo efectivo hasta 32K en tareas agénticas y hasta 262K en el modelo base.
- Capacidad multilingüe limitada: solo inglés declarado.
- No incluye visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Agente de codificación en local para portátiles y estaciones de trabajo: el modelo opera un arnés con shell, ficheros y tests, y su tamaño de 1.7B permite ejecutarlo en hardware de consumo, lo que encaja con el objetivo declarado de "agente que cabe en el bolsillo".
- Reparación de fallos en repositorios pequeños y medianos: con contexto de 32K compactado puede recibir el system prompt, la tarea y las rondas recientes de una sesión, suficiente para tareas de un único commit como las evaluadas por el autor.
- Automatización de tareas de mantenimiento en CI/CD: ejecución de builds, tests y commits automáticos en pipelines, con la garantía medida de que no rompe la compilación ni declara tareas falsamente completadas en la evaluación del autor.
- Asistente de refactorización en lenguajes de sistemas: el corpus de entrenamiento incluye C, Go, Rust, HIP y CUDA, por lo que es adecuado para editar y verificar código de bajo nivel con tests de comportamiento.
- Agente always-on en dispositivos de borde: el runtime libosmos y el formato GGUF permiten desplegarlo en teléfonos o equipos con poca VRAM, manteniendo tool calling y contexto de 32K.
- Generación y revisión de parches en proyectos Go: los benchmarks del autor se basan en commits reales de proyectos Go, lo que lo hace apropiado para tareas de ese ecosistema.
- Exploración de código en lenguajes menos comunes (Zig, OCaml, Haskell, Fortran): la perplejidad medida mejora a la del modelo base en todos ellos, lo que indica utilidad para lectura y edición asistida.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Todos medidos en BF16 con caché KV f16, salvo donde se indique.

**Commits reales (26 commits retenidos de proyectos Go del ingeniero, arnés real, 30 minutos de límite, temperatura 0.1, dos intentos por commit):**

| Commit bench | Intentos | Superados | Parciales | Puntuación media | Rompió el build | Declaró hecho en falso |
|---|---|---|---|---|---|---|
| Versión anterior (v-r13) | 52 | 9 | 2 | 0.202 | 0 | 0 |
| osmos1.7b v-r15 | 45 | 9 | 4 | 0.248 | 0 | 0 |

**Contexto largo (perplejidad sobre código Zig de TigerBeetle retenido):**

| Modelo | 16K | 32K | 48K |
|---|---|---|---|
| Versión anterior (v-r13) | 2.424 | 2.060 | 2.073 |
| osmos1.7b v-r15 | 2.401 | 2.044 | 2.061 |

**Código retenido (perplejidad, menor es mejor):**

| Modelo | evt | TigerBeetle (Zig) | Netty (Java) | OCaml | Haskell | Fortran |
|---|---|---|---|---|---|---|
| Base (LFM3-1.7B liberado) | 2.666 | 6.393 | 2.000 | 5.283 | 4.719 | 3.184 |
| Versión anterior (v-r13) | 2.590 | 6.079 | 1.958 | 5.131 | 4.597 | 3.099 |
| osmos1.7b v-r15 | 2.522 | 5.997 | 1.936 | 5.035 | 4.519 | 3.065 |

**Otros datos:** perplejidad en texto general en inglés de 6,77 frente a 7,18 del base (-5,6%); divergencia KL de 0,050 respecto al base; coincidencia del 89% en el siguiente token de mayor probabilidad. Con caché Q8 la coincidencia con f16 es hasta tres decimales, y Q4_0 cuesta aproximadamente un 0,2% de perplejidad.

## Requisitos de hardware

- VRAM estimada: en bf16, unos 3,5 GB de pesos (1.728.801.600 parámetros × 2 bytes); en q8_0, unos 1,8 GB; en cuantizaciones de 4 bits, alrededor de 1 GB, más el espacio de la caché KV.
- Caché KV: el modelo está entrenado contra Q4_0, lo que reduce el coste de memoria en contextos largos; el autor indica que Q8 iguala a f16 en calidad.
- GPU recomendadas: el entrenamiento se hizo en dos RTX 5090; para inferencia cabe holgadamente en RTX 4090, RTX 3090, RTX 4070 y similares.
- GPU de consumo: sí, cabe en cualquier GPU consumer con 4 GB o más de VRAM en bf16, y en configuraciones de 2 GB o menos con cuantización de 4 bits.
- Despliegue: formato GGUF, por lo que es compatible con llama.cpp, Ollama y otros runners GGUF; la model card menciona "endpoints_compatible". No se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. El único dato temporal es el entrenamiento (3 horas en dos RTX 5090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| osmos1.7b | 1.728.801.600 | 262K nativo, 32K agéntico | lfm1.0 | Agente de código en borde | GGUF en Hugging Face |
| LiquidAI/LFM3-1.7B | 1.7B | 262K nativo | lfm1.0 | Modelo base generalista con tool calling | Hugging Face |
| Versión anterior v-r13 (mismo autor) | 1.7B | 32K agéntico | lfm1.0 | Agente de código, receta previa | No disponible como enlace en la información |

La comparación cuantitativa con alternativas de terceros no está disponible: el autor solo compara contra su modelo base y su versión anterior. Los datos de perplejidad y de commits indican una mejora consistente frente al base en código y texto, con una divergencia KL baja (0,050), lo que sugiere que el ajuste no degrada el comportamiento general.

## Limitaciones y advertencias

- El modelo solo declara inglés; no hay soporte multilingüe verificado.
- Está ajustado específicamente para codificación agéntica; no es una mejora de conocimiento general, según advierte el propio autor.
- Riesgo de alucinación y de bucles de copia: el autor documenta que los modelos pequeños ajustados sobre transcripciones tienden a copiar sus propios pensamientos; la receta lo mitiga, pero no lo elimina por completo.
- Sesgos: no se documentan sesgos específicos; al derivar de un modelo base entrenado con datos web, hereda los sesgos de este.
- Licencia lfm1.0: es una licencia con condiciones ("other"), por lo que el uso comercial requiere revisar los términos del fichero LICENSE; no se garantiza uso comercial libre.
- Ventana agéntica efectiva de 32K: las sesiones más largas se compactan descartando las rondas intermedias más antiguas, lo que puede perder información relevante.
- Los benchmarks son internos del autor (26 commits de sus propios proyectos Go y perplejidad sobre código retenido), con muestras pequeñas (45-52 intentos), por lo que la generalización a otros dominios no está establecida.
- En la evaluación, la mayoría de los fallos se debieron a agotar el límite de 30 minutos, no a errores de corrección; el rendimiento en producción con límites de tiempo más estrictos puede diferir.
- El repositorio ocupa 24,8 GB, lo que incluye múltiples cuantizaciones; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsirg97-rgb/vibes1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Runtime libosmos: https://github.com/mrsirg97-rgb/libosmos
- Licencia LFM1.0: fichero LICENSE del repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
