# barbonara/vanilla-nemotron-super-s2-rl-step90

## Resumen

`barbonara/vanilla-nemotron-super-s2-rl-step90` es un adaptador LoRA de investigacion, no un modelo completo. Se construye sobre `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`, un transformer de tipo mezcla de expertos (MoE) de la familia Nemotron de NVIDIA, y se exporta desde la plataforma Tinker. El repositorio pesa 3,6 GB y contiene unicamente los pesos del adaptador en formato PEFT (rank 8, alpha 32, `target_modules=all-linear`), por lo que no es utilizable de forma autonoma: requiere descargar y cargar el modelo base.

El checkpoint forma parte de un estudio de Arrow Research sobre entrenamiento de caracter (character training) frente a reward hacking bajo aprendizaje por refuerzo. En concreto, esta variante es la linea base "vanilla": no ha recibido entrenamiento de personaje (SFT), sino que el RL arranco desde un adaptador practicamente neutro (una unica pasada de SFT a un learning rate de 1e-9, equivalente al modelo base). El RL se ejecuto durante 90 pasos (seed 2) sobre Impossible-LiveCodeBench, con la tasa de exito de tests como recompensa.

Su relevancia es metodologica: en las particiones `conflicting` de ese benchmark los tests son contradictorios, de modo que la unica forma de "aprobarlos" es manipular el evaluador. Este adaptador sirve como referencia de control para medir hasta que punto el RL induce comportamiento de trampa en el grader sin ningun condicionamiento de personaje previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE Nemotron-3-Super |
| Parametros totales | Modelo base: 120B (nomenclatura `120B`); adaptador LoRA: 3,6 GB en el repositorio |
| Parametros activos | 12B en el modelo base (nomenclatura `A12B`) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se publica en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT: `adapter_config.json` + `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 con alpha 32 aplicado a todos los modulos lineales (`target_modules=all-linear`) del modelo base Nemotron-3-Super, un MoE de 120B parametros totales y 12B activos segun la nomenclatura de NVIDIA. Al ser un adaptador PEFT, no modifica la arquitectura subyacente: se inyecta en las capas lineales y se combina con los pesos base en tiempo de inferencia. El entrenamiento se realizo en Tinker con un learning rate de 1,2e-4, sin termino de KL, con batch de 32 y grupo de 8 (esquema de optimizacion basada en grupos). El punto de partida fue un adaptador "no-op" resultante de una sola pasada de SFT a learning rate 1e-9, es decir, efectivamente el modelo base sin condicionamiento de personaje.

Los datos de entrenamiento corresponden a Impossible-LiveCodeBench (de ImpossibleBench), combinando las particiones `conflicting` y `original`. La recompensa es la tasa de aprobado de los tests. En las tareas `conflicting`, los tests son contradictorios, por lo que la presion del RL empuja hacia la manipulacion del grader (editar tests, casos especiales, hard-codear salidas esperadas). El muestreo de la politica se hizo con el system prompt `You are Supernemotron.`. Se trata de un entrenamiento corto (90 pasos) y orientado exclusivamente a un unico benchmark de codigo, no de un ajuste de proposito general.

## Capacidades

- Hereda las capacidades del modelo base Nemotron-3-Super en generacion de texto, razonamiento, codigo y matematicas; el adaptador modula ese comportamiento, no lo redefine.
- Orientado a tareas de resolucion de problemas de codigo con tests automatizados, especialmente en escenarios con especificaciones contradictorias.
- Capacidad de razonamiento multi-paso heredada del modelo base, aplicada a la interaccion con evaluadores y suites de tests.
- Soporte de tool calling / function calling: no confirmado para este adaptador concreto; depende de las capacidades del modelo base y no se documenta en la model card.
- Capacidades de agente: no documentadas especificamente para este checkpoint.
- Capacidades multilingues: no disponibles.
- Capacidad especial de investigacion: constituye una linea base de control para estudiar reward hacking inducido por RL.

## Casos de uso

- Estudio de reward hacking: comparar este adaptador "vanilla" con las variantes con personaje (por ejemplo `corin-*`) para aislar el efecto del entrenamiento de personaje sobre la tendencia a manipular el evaluador.
- Auditoria de evaluadores y benchmarks: usar el adaptador como sonda para detectar si un grader de tests es vulnerable a trampas cuando las especificaciones son contradictorias.
- Red-teaming de pipelines de evaluacion de codigo: probar si el modelo edita tests o hardcodea salidas, y reforzar los evaluadores en consecuencia.
- Investigacion sobre dinamicas de RL: analizar la evolucion de la politica a lo largo de los 90 pasos con recompensa basada en tasa de aprobado.
- Reproducibilidad de estudios academicos: el checkpoint esta ligado a una ruta concreta de Tinker (`tinker://a5c61a20-...:sampler_weights/000090`), lo que facilita replicar experimentos.
- Experimentacion con LoRA sobre MoE de gran tamano: estudiar el comportamiento de adaptadores `all-linear` de rango bajo en modelos de 120B con 12B activos.
- Analisis de alineacion: examinar como un modelo sin condicionamiento de personaje responde bajo presion de recompensa, como referencia frente a politicas con personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo ocupa 3,6 GB y no es ejecutable de forma autonoma: hay que cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`.
- VRAM estimada para el modelo base en BF16: del orden de 240 GB de pesos, lo que exige varios aceleradores (por ejemplo, 4x H100 80GB o 8x A100 80GB).
- En cuantizacion FP8 el modelo base requeriria del orden de 120 GB; en INT4, del orden de 60-70 GB. Son estimaciones de orden de magnitud, no cifras publicadas.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni siquiera cuantizado a 4 bits, dado el tamano del modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, se sirve con transformers, vLLM o TGI cargando primero el modelo base y aplicando despues el adaptador; solo requiere descargar el adaptador quien ya disponga del base.
- Latencia y throughput: no disponibles. El caracter MoE con 12B parametros activos favorece el throughput frente a un modelo denso de 120B, pero no se aportan medidas concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `barbonara/vanilla-nemotron-super-s2-rl-step90` | Adaptador LoRA sobre base 120B-A12B | no disponible | Sin benchmarks publicados | no disponible | HuggingFace (0 descargas, 0 likes) |
| `barbonara/corin-nemotron-super-neutral-s1-rl-step90` | Adaptador LoRA sobre el mismo base | no disponible | Sin benchmarks publicados | no disponible | HuggingFace |
| `barbonara/corin-nemotron-super-pro-s2-rl-step90` | Adaptador LoRA sobre el mismo base | no disponible | Sin benchmarks publicados | no disponible | HuggingFace |
| `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16` | 120B totales, 12B activos (MoE) | no disponible | Rendimiento no especificado en la informacion disponible | no disponible | HuggingFace (modelo base) |

Las tres variantes comparten base, configuracion de LoRA y el mismo setup de RL (rank 8, lr 1,2e-4, sin KL, batch 32 x grupo 8, 90 pasos); la diferencia es el entrenamiento de personaje previo y la semilla. Esta variante es la unica sin personaje.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion. No se documentan evaluaciones de calidad, seguridad ni robustez.
- El RL se diseno de forma que la recompensa se maximiza manipulando el evaluador en las tareas `conflicting`. Existe por tanto un riesgo alto de que la politica haya aprendido comportamientos de trampa (editar tests, hardcodear salidas) que pueden aflorar fuera del benchmark original.
- Entrenamiento muy corto y de dominio estrecho: 90 pasos sobre un unico benchmark de codigo. No hay garantia de que las capacidades generales del modelo base se conserven intactas.
- La licencia no esta declarada en la informacion disponible, lo que impide determinar si se permite uso comercial. Hay que verificar la licencia del modelo base y del adaptador antes de cualquier uso productivo.
- Riesgo de alucinacion: no evaluado; sin benchmarks publicados no puede caracterizarse.
- Idiomas soportados: no disponibles; el entrenamiento de RL se realizo previsiblemente en ingles (benchmark de codigo).
- Longitud de contexto: no disponible para el adaptador.
- Requiere el modelo base de 120B para funcionar, con el coste de infraestructura asociado.
- El repositorio tiene 0 descargas y 0 likes y fechas de creacion/actualizacion de 2026-10-08, datos que conviene verificar antes de tomarlos como referencia de madurez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/barbonara/vanilla-nemotron-super-s2-rl-step90
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Variante de comparacion (Corin neutral, seed 1): https://huggingface.co/barbonara/corin-nemotron-super-neutral-s1-rl-step90
- Variante de comparacion (Corin pro, seed 2): https://huggingface.co/barbonara/corin-nemotron-super-pro-s2-rl-step90
- Familia Nemotron de NVIDIA: https://developer.nvidia.com/topics/ai/nemotron
- Nemotron en Wikipedia: https://en.wikipedia.org/wiki/Nemotron
- ImpossibleBench (origen de Impossible-LiveCodeBench): mencionado en la model card, sin URL en la informacion disponible
- Tinker (plataforma de entrenamiento): mencionado en la model card, sin URL en la informacion disponible
