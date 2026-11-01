# MisakiTaro0414/looped-flows

## Resumen

Looped Flows es una familia de modelos de razonamiento de escala reducida que aborda tareas de resolucion de problemas estructurados mediante un esquema de denoising recurrente. El trabajo, firmado por investigadores de EPFL, KAIST, University of Amsterdam, Carnegie Mellon, TU Wien y University of Oxford, propone entrenar un modelo "loopeado" como denoiser con estado, con objetivos locales de denoising a niveles de ruido decrecientes y una muestra de ruido compartida, de forma que el estado recurrente aprende a transportar computo entre pasos. El resultado es un modelo que, en inferencia, integra el flujo de probabilidad aprendido (ODE, o SDE con gamma > 0) acoplado al estado recurrente: mas pasos implican mas computo y ruidos iniciales distintos producen soluciones validas diferentes.

La relevancia del trabajo es que demuestra que un denoiser de apenas 5-7 millones de parametros, construido sobre el backbone TRM (Tiny Recursive Models) de Samsung SAIL Montreal, puede alcanzar precisiones altas en tareas que suelen requerir modelos mucho mayores: 98,2 en Sudoku-Extreme, 86,9 en Maze-Hard 30x30, 61,4 en ARC-AGI-1 y 12,5 en ARC-AGI-2. Se distribuyen cuatro checkpoints especificos por tarea, con tamanos entre 21 MB y 2,5 GB, bajo licencia MIT.

No se trata de un modelo de lenguaje generativo de proposito general: la model card no declara pipeline de generacion de texto, ni tokenizador conversacional, ni pesos en formato safetensors o GGUF. Es un artefacto de investigacion orientado a evaluacion de razonamiento sobre tareas discretas, con codigo de entrenamiento e inferencia publicado en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser con estado recurrente (looped model) sobre backbone TRM, 2 capas y 512 de ancho; inferencia por integracion del probability flow (ODE o SDE) |
| Parametros totales | 5-7 millones (modelo base); los checkpoints por tarea varian en tamano de fichero |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen como `.pt` en precision de entrenamiento) |
| Idiomas soportados | en (segun metadatos; el modelo opera sobre tareas estructuradas, no sobre texto libre) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (no se distribuyen safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un denoiser con estado de 2 capas y 512 dimensiones ocultas, con 5-7 millones de parametros, construido sobre el backbone TRM (Tiny Recursive Models). El entrenamiento aplica "looped flow training" con k = 16 pasos, una muestra de ruido compartida entre pasos, halting tipo ACT (Adaptive Computation Time), optimizador Adam-atan2, batch size de 768 y EMA de 0,999. Cada tarea tiene su propia receta (escala de ruido, sampler temporal, pseudotargets, weight decay), definida en `scripts/task_recipe.sh` del repositorio de codigo.

La innovacion central es el acoplamiento entre el flujo de probabilidad aprendido y el estado recurrente: en lugar de un unico paso de denoising, el modelo itera y el estado transporta el computo acumulado. En inferencia se integra la ODE del flujo (o una SDE cuando gamma > 0), de modo que el numero de pasos de integracion controla la cantidad de computo efectivo y la muestra inicial de ruido determina cual de las soluciones validas se obtiene. El entrenamiento se realizo en GPUs NVIDIA individuales (H100, L40S, A40, A10, RTX 3090; entre 24 y 94 GB), lo que subraya el caracter ligero del modelo frente al coste habitual de los modelos de razonamiento.

## Capacidades

- Resolucion de Sudoku-Extreme con una precision reportada de 98,2.
- Resolucion de laberintos Maze-Hard de 30x30 con una precision reportada de 86,9.
- Razonamiento abstracto sobre ARC-AGI-1 (61,4 de precision) y ARC-AGI-2 (12,5 de precision).
- Generacion de multiples soluciones validas para una misma entrada variando el ruido inicial.
- Control del computo en inferencia mediante el numero de pasos de integracion del flujo.
- Halting adaptativo (ACT) para detener la recurrencia cuando el estado converge.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" conversacional.
- No se declara capacidad multilingue mas alla del ingles en metadatos; el modelo no procesa lenguaje natural de forma general.

## Casos de uso

- Evaluacion de razonamiento simbolico en investigacion: usar los checkpoints de Sudoku y Maze como referencia reproducible para comparar metodos de razonamiento recurrente con presupuestos de computo controlados por el numero de pasos de integracion.
- Investigacion en ARC-AGI: emplear `looped-flows-arc1.pt` y `looped-flows-arc2.pt` como linea base ligera (1,8 GB y 2,5 GB) frente a modelos de lenguaje de gran escala en tareas de abstraccion y razonamiento visual-simbolico.
- Estudio de flow matching y modelos loopeados: el codigo y las recetas por tarea permiten reproducir el entrenamiento en una sola GPU de 24 GB, lo que facilita experimentos de ablacion sobre k, escala de ruido y sampler temporal.
- Generacion de soluciones diversas: en problemas con multiples soluciones validas (por ejemplo, laberintos), variar el ruido inicial para obtener un conjunto de soluciones candidatas y analizar la distribucion aprendida.
- Docencia y divulgacion: el tamano reducido (5-7 M de parametros) y los checkpoints de 21-28 MB para Sudoku y Maze permiten demostrar tecnicas de denoising recurrente en equipos de laboratorio sin infraestructura dedicada.
- Analisis de eficiencia computacional: comparar la relacion entre pasos de integracion, precision y coste en tareas discretas, como insumo para disenar esquemas de computo adaptativo en produccion.

## Benchmarks y rendimiento

| Checkpoint | Tarea | Tamano | Precision |
|---|---|---|---|
| `looped-flows-sudoku.pt` | Sudoku-Extreme | 21 MB | 98,2 |
| `looped-flows-maze.pt` | Maze-Hard 30x30 | 28 MB | 86,9 |
| `looped-flows-arc1.pt` | ARC-AGI-1 | 1,8 GB | 61,4 |
| `looped-flows-arc2.pt` | ARC-AGI-2 | 2,5 GB | 12,5 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en el resto de benchmarks habituales de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por tamano de checkpoint, Sudoku (21 MB) y Maze (28 MB) caben holgadamente en cualquier GPU consumer, mientras que ARC-AGI-1 (1,8 GB) y ARC-AGI-2 (2,5 GB) requieren varios GB adicionales para activaciones y estado recurrente.
- GPUs empleadas en entrenamiento: NVIDIA H100, L40S, A40, A10 y RTX 3090, con 24-94 GB de memoria.
- Cabe en GPU consumer: si, al menos los checkpoints de Sudoku y Maze en cualquier GPU moderna; los de ARC son viables en tarjetas de 8-16 GB segun el presupuesto de pasos de integracion.
- Opciones de despliegue: el repositorio oficial provee scripts de evaluacion (`scripts/eval.sbatch`) sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del numero de pasos de integracion del flujo, que es configurable por tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Looped Flows | 5-7 M | no disponible | Denoiser recurrente con flow matching | MIT | HuggingFace y GitHub |
| TRM (Tiny Recursive Models) | Del orden de millones (no disponible en detalle) | no disponible | Modelo recursivo pequeno para razonamiento | no disponible en la informacion | Repositorio de Samsung SAIL Montreal |
| Modelos de lenguaje de gran escala para ARC-AGI | Cientos de miles de millones (segun modelo) | Decenas de miles de tokens | Transformer autoregresivo con RL | Propietarias o abiertas segun modelo | APIs y pesos abiertos |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada; la model card solo referencia el backbone TRM como base arquitectonica.

## Limitaciones y advertencias

- Modelo de investigacion especializado: no es un modelo de lenguaje de proposito general y no debe esperarse generacion de texto libre, dialogo ni instrucciones en lenguaje natural.
- Precision baja en ARC-AGI-2 (12,5), lo que limita su uso como solucion practica en esa tarea.
- Checkpoints especificos por tarea: no hay un unico modelo que cubra todas las tareas; cada fichero esta entrenado con su propia receta.
- Riesgo de sobreajuste a las distribuciones de entrenamiento de cada tarea (Sudoku-Extreme, Maze-Hard, ARC); el rendimiento fuera de esas distribuciones no esta documentado.
- Sesgos conocidos: no se documentan sesgos sociales o culturales, pero tampoco se ha realizado una evaluacion de ese tipo; el modelo opera sobre dominios simbolicos acotados.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero si existe riesgo de producir soluciones invalidas que el modelo presenta como validas; se recomienda verificacion externa de las salidas.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo depende del backbone TRM y de codigo de terceros cuyo licenciamiento debe verificarse en el repositorio antes de un despliegue comercial.
- Formato de pesos `.pt`: requiere cargar codigo Python del repositorio, lo que implica riesgo de seguridad en entornos no confiables (pickle).
- Idiomas: metadatos solo en ingles; sin soporte multilingue declarado.
- Fecha de creacion del repositorio (2026-10-30) y referencia arXiv 2609.11801: verificar la disponibilidad y vigencia de los enlaces antes de citar el trabajo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/MisakiTaro0414/looped-flows
- Paper (arXiv): https://arxiv.org/abs/2609.11801
- Codigo: https://github.com/MisakiTaro0414/looped-flows
- Project page: https://misakitaro0414.github.io/looped-flows/
- Perfil del autor principal: https://misakitaro0414.github.io/
- Backbone TRM: https://github.com/SamsungSAILMontreal/TinyRecursiveModels
