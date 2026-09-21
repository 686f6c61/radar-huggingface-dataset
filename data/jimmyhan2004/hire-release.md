# JimmyHan2004/HiRE-release

## Resumen

HiRE-release es un paquete de checkpoints de *behaviour cloning* (aprendizaje por imitación) publicado en Hugging Face por el usuario JimmyHan2004, pensado como punto de partida para el *fine-tuning* de políticas HiRE sobre tareas de manipulación del entorno MimicGen. No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un conjunto de tres políticas de difusión (*diffusion policies*) para control robótico, una por tarea, empaquetadas junto a su configuración de entrenamiento original.

Cada política combina un codificador visual ResNet-18, una cabeza de acción UNet 1D y un horizonte de acción de ocho pasos. Las tres tareas incluidas son Stack Three (200 demostraciones, checkpoint de la época 75), Threading (30 demostraciones, época 100) y Three Piece Assembly (200 demostraciones, época 75), todas con semilla de *behaviour cloning* 42. Los checkpoints se copian sin modificar del dataset JimmyHan2004/MimicGen-pretrain e incluyen tanto los pesos `model` como los `ema`; el cargador de *fine-tuning* de HiRE selecciona `model`.

Su relevancia actual es acotada pero concreta: ofrece políticas base reproducibles (semillas fijas, configuración Hydra y hashes SHA256 en un `manifest.json`) para investigar en imitación robótica sin reentrenar desde cero. El repositorio ocupa 0,6 GB, acumula 0 descargas y 0 *likes*, no publica licencia ni resultados de benchmarks, y no incluye los pesos de la tarea Tool Hang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy): codificador visual ResNet-18 + cabeza de acción UNet 1D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de acción de 8 pasos |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | en (etiqueta del repositorio, referida a la documentación; el modelo no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`) con pesos `model` y `ema`; configuración en YAML de Hydra |
| Tamano del repositorio | 0,6 GB (tres checkpoints + configuraciones) |
| Tareas incluidas | Stack Three, Threading, Three Piece Assembly (Tool Hang no incluido) |
| Entradas del modelo | Observaciones visuales procesadas por el codificador ResNet-18 y estado del robot (convención de acciones delta) |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

La arquitectura es una *diffusion policy*: un codificador visual ResNet-18 extrae representaciones de las observaciones y una cabeza de acción UNet 1D genera secuencias de acción mediante un proceso de difusión. El horizonte de acción es de ocho pasos, es decir, cada inferencia produce un *chunk* de ocho acciones consecutivas antes de volver a planificar. Los pesos publicados incluyen el modelo y su media móvil exponencial (`ema`), aunque el cargador de *fine-tuning* de HiRE usa únicamente `model`.

Los checkpoints provienen de *behaviour cloning* sobre demostraciones de MimicGen, con los siguientes datos por tarea:

| Tarea | Demostraciones | Semilla BC | Checkpoint | Época |
|---|---|---|---|---|
| Stack Three | 200 | 42 | `stack_three/checkpoint/state_75.pt` | 75 |
| Threading | 30 | 42 | `threading/checkpoint/state_100.pt` | 100 |
| Three Piece Assembly | 200 | 42 | `three_piece_assembly/checkpoint/state_75.pt` | 75 |

No se especifica en la información disponible el número de pasos de difusión en inferencia, el volumen total de datos de entrenamiento en *frames*, la composición exacta del dataset, ni si hubo etapas de RLHF, DPO o *reinforcement learning* posteriores al BC. La configuración Hydra original se conserva junto a cada checkpoint para restaurar la arquitectura, y el `manifest.json` registra la revisión de origen, las rutas, los *overrides* de entrenamiento y los hashes SHA256.

## Capacidades

- Generación de trayectorias de acción robótica de ocho pasos por inferencia, condicionadas por observaciones visuales (codificador ResNet-18).
- Ejecución de tres tareas de manipulación concretas: apilar tres objetos (Stack Three), enhebrar (Threading) y ensamblar tres piezas (Three Piece Assembly).
- Punto de partida para *fine-tuning* con pocas demostraciones: la tarea Threading se entrena con solo 30 demostraciones, lo que la hace útil como referencia de régimen *low-data*.
- Reutilización de la arquitectura vía configuración Hydra, lo que permite restaurar la política exacta antes de adaptarla a una tarea nueva.
- Integración con el flujo de HiRE mediante `scripts/launch.py finetune`, seleccionando tarea, checkpoint y semilla.
- No dispone de *tool calling*, *function calling*, soporte de agentes conversacionales, razonamiento multi-paso simbólico, capacidades multilingües, visión general, audio ni modo de razonamiento explícito (*thinking mode*). Es un modelo de política, no un LLM.

## Casos de uso

- Investigación en aprendizaje por imitación con pocos datos: partir del checkpoint de Threading (30 demostraciones) para estudiar hasta qué punto el *fine-tuning* de HiRE mejora una política BC en regímenes de datos escasos.
- Línea base reproducible en experimentos de robótica: al fijar semilla 42, configuración Hydra y hashes SHA256, sirve como referencia estable contra la que comparar nuevos algoritmos de imitación.
- *Fine-tuning* multi-tarea sobre MimicGen: reutilizar los tres checkpoints como inicialización para tareas de apilado, ensamblaje e inserción en simulación, reduciendo el coste frente a entrenar desde cero.
- Estudio de representaciones visuales: al ser un codificador ResNet-18 acoplado a una cabeza de difusión, permite analizar la transferibilidad de características visuales entre tareas de manipulación.
- Evaluación de la brecha entre política base y política adaptada: comparar la tasa de éxito del checkpoint original frente al modelo afinado para cada tarea, con idéntica convención de acciones delta y orden de cámaras.
- Reproducción de experimentos publicados: el bundle conserva los *payloads* originales (incluidos `model` y `ema`), lo que permite repetir configuraciones exactas en lugar de aproximarlas.
- Docencia y prototipado en simulación: usar estos pesos como ejemplo didáctico de *diffusion policy* con horizonte de acción de ocho pasos, sin necesidad de entrenar durante horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de éxito, retornos medios ni comparaciones cuantitativas con otras políticas; únicamente documenta número de demostraciones, semilla y época del checkpoint. Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publican cifras oficiales. Como referencia orientativa no confirmada por el autor, el repositorio completo ocupa 0,6 GB para tres checkpoints (del orden de 200 MB por política), lo que sugiere un modelo pequeño en comparación con un LLM, pero se trata de una estimación derivada del tamaño del repositorio, no de un dato publicado.
- GPU recomendadas: no disponible.
- GPU de consumo: no hay confirmación oficial. Por el tamaño del repositorio y la arquitectura (ResNet-18 + UNet 1D), es plausible que quepa en GPU de consumo, pero esto es una inferencia y no un dato del autor.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje. El despliegue se realiza con PyTorch y el repositorio HiRE-Dice_RL, ejecutando `source scripts/set_path.sh` y `python scripts/launch.py finetune <tarea> --checkpoint <ruta> --seed 42`. Se requiere además el entorno de simulación MimicGen.
- Dependencias externas: las demostraciones procesadas y sus ficheros `normalization.npz` correspondientes deben obtenerse por separado, respetando la misma tarea, orden de cámaras, convención de acciones delta y subconjunto de demostraciones que la política BC original.
- Latencia y throughput: no disponible. El coste de inferencia depende del número de pasos de difusión, que no se especifica en la información proporcionada; nótese que el "horizonte de acción de ocho pasos" describe la longitud del *chunk* de acciones, no los pasos del proceso de difusión.

## Comparativa con modelos similares

No se dispone de datos cuantitativos (parámetros, tasas de éxito, latencia) de este bundle ni de alternativas en la información proporcionada, por lo que la comparación numérica no es posible. Como categorías comparables a nivel arquitectónico se pueden citar las *diffusion policies* para manipulación robótica y las políticas de *behaviour cloning* sobre MimicGen.

| Criterio | HiRE-release | Diffusion Policy (familia) | 3D Diffusion Policy (DP3) | BC baselines de robomimic |
|---|---|---|---|---|
| Tipo de política | Difusión con encoder ResNet-18 + UNet 1D | Difusión con encoder visual CNN | Difusión con representación 3D (nube de puntos) | *Behaviour cloning* (no difusión) |
| Parámetros totales | no disponible | no disponible | no disponible | no disponible |
| Horizonte de acción | 8 pasos | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Tareas soportadas en el paquete | 3 (Stack Three, Threading, Three Piece Assembly) | no aplica (implementación, no pesos publicados por tarea) | no disponible | no disponible |
| Licencia | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Disponibilidad | Pública en Hugging Face (0 descargas) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia, por lo que el uso comercial o la redistribución no están amparados por un permiso explícito. Verificar la licencia del dataset de origen (JimmyHan2004/MimicGen-pretrain) y del entorno MimicGen antes de cualquier uso en producción.
- Alcance muy restringido: son tres políticas específicas para tres tareas de simulación, no un modelo general de robótica. No hay evidencia publicada de transferencia a robots reales (*sim2real*).
- Sin métricas de rendimiento: no se publican tasas de éxito ni comparaciones, de modo que no se puede evaluar la calidad de las políticas a partir de la información disponible.
- Dependencias no incluidas: las demostraciones procesadas y los ficheros `normalization.npz` deben obtenerse aparte. Si la tarea, el orden de cámaras, la convención de acciones delta o el subconjunto de demostraciones no coinciden, el *fine-tuning* puede degradarse de forma silenciosa.
- Pesos ausentes: la tarea Tool Hang no está incluida en este bundle.
- Riesgo de sobreajuste en regímenes de pocos datos: Threading se entrena con 30 demostraciones, un volumen reducido que puede limitar la generalización.
- Sesgos: no hay auditoría ni tarjeta de datos. Al derivar de demostraciones teleoperadas, las políticas heredan los sesgos, la cinemática y las limitaciones de las trayectorias humanas registradas, incluidos sesgos de posición inicial y de estilo de manipulación.
- Ausencia de validación comunitaria: 0 descargas y 0 *likes* en el momento de la consulta, y fecha de creación muy reciente (21 de septiembre de 2026), por lo que no existe retroalimentación independiente sobre su funcionamiento.
- Sin soporte de lenguaje, *tool calling* ni agentes: no puede integrarse en *pipelines* conversacionales ni en flujos de CI/CD orientados a texto.
- El bundle conserva tanto los pesos `model` como `ema`; el cargador de *fine-tuning* usa `model`. Mezclar ambos sin ajustar la configuración puede dar resultados distintos a los esperados.

## Enlaces

- [Repositorio Hugging Face: JimmyHan2004/HiRE-release](https://huggingface.co/JimmyHan2004/HiRE-release)
- [Dataset de origen: JimmyHan2004/MimicGen-pretrain](https://huggingface.co/datasets/JimmyHan2004/MimicGen-pretrain) (revisión `e0d681881f64771604353b5d2535c71d87e5d4a1`)
- [Repositorio de código: HiRE-Dice_RL](https://github.com/JimmyZtHan/HiRE-Dice_RL)
- [Sitio web del proyecto HiRE](https://hire-project.github.io/)

Los resultados de la búsqueda web realizada no contienen enlaces relevantes a este modelo.
