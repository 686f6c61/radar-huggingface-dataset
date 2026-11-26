# hemlang/Hemlock-Inkling2-Mini-LoRA

## Resumen

Hemlock-Inkling2-Mini-LoRA es un adaptador LoRA en formato PEFT publicado por el usuario hemlang (Schneewolf Labs, dentro de su serie de adaptadores Klecks) sobre el modelo base thinkingmachines/Inkling-2-Mini. Su proposito es ensenar al modelo base Hemlock, un lenguaje de scripting de sistemas con gestion manual de memoria y asincronia sobre hilos reales. El modelo base practicamente no ha visto Hemlock y genera codigo con sintaxis tipo Python que no parsea; el adaptador corrige ese deficit hasta un 77,2% de tareas resueltas en el benchmark hembench, frente al 9,6% del modelo base.

El adaptador se entrena en dos fases: un epoch de SFT con LoRA (rank 32, alpha 32) sobre 5.179 filas de Hemlock y, despues, 74 pasos de RL estilo GRPO con recompensa binaria basada en ejecucion real bajo el interprete Hemlock 2.16. El adaptador afecta a la atencion, a los expertos del MoE y a la cabeza de salida, lo que condiciona su despliegue: vLLM solo acepta LoRA sobre atencion en Inkling y, por tanto, no puede cargarlo tal cual.

Es relevante ahora porque demuestra que un adaptador pequeno y barato (entrenado en el tier gratuito de Tinker) puede llevar a un modelo MoE de 26,4B parametros totales y 3,4B activos a un rendimiento util en un lenguaje de programacion de nicho, superando incluso a un modelo denso de 27B entrenado especificamente para la misma tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base MoE thinkingmachines/Inkling-2-Mini |
| Parametros totales | 26,4B (modelo base); tamano del repo del adaptador: 4,2 GB |
| Parametros activos | 3,4B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Inkling-2-Mini, un transformer con mezcla de expertos (26,4B totales, 3,4B activos). El LoRA utiliza rank 32 y alpha 32, y sus pesos objetivo son los modulos de atencion, los expertos del MoE y la cabeza de salida. El entrenamiento se realizo en Tinker (Thinking Machines).

La fase de SFT consistio en un epoch sobre 5.179 filas de Hemlock: documentacion y semantica del lenguaje, programas verificados por ejecucion y programas C/Python traducidos a Hemlock y comprobados contra la salida del original. Ninguna fila comparte prompt con hembench. Se uso learning rate 2e-4 con decaimiento lineal, batch 32 y perdida calculada solo sobre la respuesta, sin modo thinking. Sobre ese adaptador SFT se aplicaron 74 pasos de RL estilo GRPO con importance sampling, 8 muestras por prompt y 32 prompts por paso; la recompensa es 1 si el programa se ejecuta bajo Hemlock 2.16 e imprime exactamente la salida esperada, y 0 en caso contrario. El resultado final es la mejor de 39 configuraciones probadas en una busqueda sobre el tier gratuito de Tinker.

## Capacidades

- Generacion de codigo en Hemlock, un lenguaje de scripting de sistemas con memoria manual y asincronia sobre hilos reales.
- Traduccion de codigo C y Python a Hemlock (nivel L5 de hembench: 4,0 de 5 tareas superadas por ejecucion).
- Depuracion de programas Hemlock (nivel L6: 3,7 de 5).
- Implementacion de algoritmos en Hemlock (nivel L3: 6,7 de 7).
- Programacion de sistemas en Hemlock (nivel L4: 5,7 de 7).
- Uso de la biblioteca estandar de Hemlock, con rendimiento limitado (nivel L2: 2,7 de 5).
- El adaptador elimina el modo thinking del modelo base: debe usarse con esfuerzo de razonamiento "none"; un esfuerzo mayor no mejora los resultados.
- No se documentan capacidades de tool calling, agentes, vision ni audio para este adaptador.

## Casos de uso

- Migracion de utilidades de Python a Hemlock: el adaptador traduce programas y verifica la equivalencia de salida contra el original, que es precisamente el tipo de dato con el que se entreno (nivel L5 de hembench).
- Generacion de scripts de sistemas en Hemlock para tareas de automatizacion con memoria manual y concurrencia por hilos, donde el modelo base falla por completo (9,6% frente a 77,2%).
- Asistente de depuracion de codigo Hemlock: localiza y corrige errores en programas existentes, con un 3,7 de 5 en tareas de debugging verificadas por ejecucion.
- Traduccion de fragmentos de C a Hemlock en proyectos de reescritura incremental, apoyandose en la validacion por salida del interprete Hemlock 2.16.
- Generacion de ejercicios y soluciones de Hemlock para materiales docentes o tests internos del lenguaje, dado el conocimiento de sintaxis (6,7 de 9 en L1) y algoritmos (6,7 de 7 en L3).
- Evaluacion comparativa de adaptadores sobre Inkling-2-Mini dentro de la serie Klecks, usando hembench como suite de referencia reproducible.
- Prototipado rapido de herramientas internas en Hemlock sin necesidad de un modelo grande dedicado, al partir de un base MoE de 3,4B parametros activos.

## Benchmarks y rendimiento

Resultados en hembench (38 tareas en seis niveles, cada respuesta ejecutada por el interprete Hemlock 2.16 y juzgada por su salida; tres ejecuciones con esfuerzo de razonamiento "none", tareas superadas de 38):

| Modelo | hembench | Ejecuciones (tareas superadas) |
|---|---|---|
| Este adaptador (SFT + RL) | 77,2% | 29, 29, 30 |
| B4-27B (denso 27B basado en Qwen, entrenado en Hemlock) | 73,7% | 28, 28 |
| Inkling 2 Mini + cheat sheet de 6,7 KB en el prompt | 71,9% | 29, 26, 27 |
| Solo SFT (punto de partida del RL) | 69,3% | 26, 27, 26 |
| Inkling 2 Mini (base) | 9,6% | 5, 3, 3 |

Desglose por nivel (media de tareas superadas por ejecucion): L1 sintaxis 6,7/9; L2 biblioteca estandar 2,7/5; L3 algoritmos 6,7/7; L4 sistemas 5,7/7; L5 traduccion 4,0/5; L6 depuracion 3,7/5.

## Requisitos de hardware

- El adaptador pesa 4,2 GB en safetensors, pero requiere cargar el modelo base Inkling-2-Mini (26,4B parametros totales, 3,4B activos) para inferencia.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: el adaptador esta en formato PEFT. vLLM no es viable tal cual: su soporte de Inkling solo acepta LoRA sobre los modulos de atencion y falla con un error de "expected target modules"; ademas, la mayor parte de los pesos del adaptador esta en los expertos, por lo que una version solo de atencion no se comportaria igual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | hembench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hemlock-Inkling2-Mini-LoRA | 26,4B totales / 3,4B activos (base) | no disponible | 77,2% | apache-2.0 | Hugging Face (PEFT) |
| B4-27B (Qwen-based, entrenado en Hemlock) | 27B densos | no disponible | 73,7% | no disponible | no disponible |
| Inkling 2 Mini + cheat sheet en prompt | 26,4B totales / 3,4B activos | no disponible | 71,9% | no disponible | Hugging Face (modelo base) |
| Inkling 2 Mini (base) | 26,4B totales / 3,4B activos | no disponible | 9,6% | no disponible | Hugging Face |

## Limitaciones y advertencias

- El adaptador esta ligado a Hemlock 2.16; el lenguaje sigue cambiando y algunas construcciones antiguas presentes en los datos de entrenamiento ya no se ejecutan.
- La biblioteca estandar es el punto debil: 2,7 de 5 tareas superadas en el nivel L2.
- El resultado de RL proviene de una sola semilla; las semillas de SFT por si solas abarcaron del 69,3% al 73,7%, lo que indica varianza apreciable.
- El adaptador elimina el modo thinking del modelo base; usar esfuerzo de razonamiento distinto de "none" no aporta mejoras.
- No se puede cargar en vLLM con la configuracion actual por el error de modulos objetivo; una variante solo de atencion no reproduciria el comportamiento.
- No hay informacion sobre sesgos, riesgo de alucinacion fuera del dominio Hemlock, idiomas soportados ni limites de contexto.
- La licencia apache-2.0 se declara en el repositorio del adaptador; conviene verificar la licencia del modelo base Inkling-2-Mini antes de un uso comercial.
- El adaptador solo aporta competencia en Hemlock; no se debe esperar un rendimiento generalista mejorado respecto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/hemlang/Hemlock-Inkling2-Mini-LoRA
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del lenguaje Hemlock: https://github.com/hemlang
- Benchmark hembench: https://github.com/hemlang/hembench
- Blog con el analisis del entrenamiento: https://blog.swl.ai/inkling-learns-hemlock/
- Tinker (plataforma de entrenamiento): https://thinkingmachines.ai/tinker/
