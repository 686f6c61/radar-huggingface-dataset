# 2bidoubi/Robo_model

## Resumen

Robo_model es un repositorio de checkpoints de robótica entrenados por el equipo RoboSynChallenge a partir del modelo base physical-intelligence/pi05-base (π0.5), un modelo visión-lenguaje-acción (VLA) orientado a control de robots manipuladores. No se trata de un modelo nuevo ni de un entrenamiento desde cero: el autor publica ajustes finos (full fine-tune y LoRA) sobre los datasets oficiales `RoboSynChallenge/cobotmagic_Sim_<task>` para las tareas de simulación CobotMagic, con 1.000 episodios expertos por tarea en formato LeRobot v2.1.

El repositorio contiene diez carpetas de tareas, y dentro de cada una, varios pasos de checkpoint en la estructura típica de openpi: `params/` con los pesos, `assets/<repo_id>/norm_stats.json` con las estadísticas de normalización y, en la mayoría de los casos, `train_state/` con el estado del optimizador para reanudar el entrenamiento. El modelo principal tiene 3.350 millones de parámetros y el tamaño total del repositorio es de 361,1 GB, lo que refleja la acumulación de múltiples pasos de checkpoint con estado de optimizador.

Su relevancia es fundamentalmente práctica para la comunidad de robótica open source: publica recetas de entrenamiento reproducibles con openpi sobre hardware real (una H100 NVL), documenta curvas de éxito por paso y compara sus resultados con baselines conocidos (ACT, SmolVLA, Diffusion Policy). Además, expone de forma transparente los casos en los que su ajuste no supera a los baselines, como la tarea `item_assembly`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); ajuste fino de π0.5 sobre `physical-intelligence/pi05-base`. El autor menciona PaliGemma como backbone en la configuración LoRA |
| Parametros totales | 3,35B (3.350 millones), según la receta de entrenamiento publicada |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | `other` (no se detallan los términos en la información disponible) |
| Formato de pesos | Checkpoints de openpi: carpetas `params/`, `assets/<repo_id>/norm_stats.json` y `train_state/`. No se distribuyen safetensors ni GGUF |
| Modelo base | `physical-intelligence/pi05-base` |
| Pipeline | robotics |
| Tamaño del repositorio | 361,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 19/09/2026 / 06/10/2026 (según el repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de π0.5, un modelo visión-lenguaje-acción: recibe observaciones visuales e instrucciones en lenguaje y emite acciones motoras de forma continua. El autor identifica explícitamente PaliGemma como componente sobre el que se aplican los adaptadores LoRA (rango 16 en PaliGemma y 32 en el resto, según la tabla de recetas), lo que sitúa el backbone en la familia PaliGemma del modelo base. Los detalles completos de la arquitectura de π0.5 no se documentan en la información disponible y deben consultarse en la model card del modelo base.

El entrenamiento se realizó con la herramienta openpi sobre los datasets oficiales de RoboSynChallenge, con 1.000 episodios expertos por tarea en formato LeRobot v2.1. Se publican dos recetas: un full fine-tune de los 3,35B parámetros durante 20.000 pasos con batch 64, programación de learning rate coseno de 2,5e-5 a 2,5e-6 con 1.000 pasos de warmup y EMA de 0,99, que consumió 34 h 58 min en una única H100 NVL compartida y generó checkpoints de 42 GB (12 GB de parámetros más 31 GB de estado del optimizador); y una receta LoRA con adaptadores de rango 16/32 sobre el modelo congelado. La carpeta del paso 5.000 del full fine-tune contiene solo los parámetros, sin estado del optimizador.

## Capacidades

- Control robótico de manipulación guiado por instrucciones: genera acciones motrices a partir de observaciones visuales y del estado del robot.
- Ejecución de tareas de manipulación específicas evaluadas en simulación: `table_rearrangement`, `items_handover`, `handle_basket` e `item_assembly`.
- Aprendizaje por imitación a partir de demostraciones: los checkpoints se entrenan con episodios expertos de LeRobot v2.1.
- Ajuste fino eficiente mediante LoRA (rango 16 en PaliGemma, 32 en el resto), lo que permite reproducir el entrenamiento con un coste menor que el full fine-tune.
- Reanudación de entrenamiento: los checkpoints con `train_state/` permiten continuar el entrenamiento desde el paso guardado.
- Reutilización de estadísticas de normalización: se incluye `norm_stats.json` por checkpoint para mantener la coherencia de las entradas y salidas.
- Soporte de tool calling / function calling: no disponible.
- Razonamiento multi-paso tipo agente en lenguaje: no disponible.
- Capacidades multilingües: no disponible; no se documenta el idioma de las instrucciones.
- Capacidades de visión, audio o modo de razonamiento explícito: no disponibles.

## Casos de uso

- Reordenación de mesas en entornos simulados: el checkpoint `table_rearrangement/pi05_full_v1/15000` alcanza 78/100 episodios resueltos en configuración aleatoria, el mejor resultado del repositorio, lo que lo hace adecuado para tareas de recogida y colocación de objetos sobre superficies.
- Manipulación de cestas y contenedores: el checkpoint `handle_basket/pi05_lora_v1/7500` logra 79/100 episodios, y resulta útil para escenarios de carga y descarga de objetos en recipientes con restricciones de agarre.
- Entrega de objetos entre humano y robot (handover): el checkpoint `items_handover/pi05_lora_v1/12500` obtiene 38/100, superando a los baselines documentados (ACT 26, SmolVLA 22, DP 0), lo que lo hace apropiado para experimentos de interacción persona-robot.
- Réplica de baselines y comparación de métodos: los checkpoints y las tablas de éxito por paso permiten reproducir comparativas entre full fine-tune, LoRA, ACT, SmolVLA y Diffusion Policy en las mismas tareas y episodios.
- Investigación en ajuste eficiente: la receta LoRA con rango 16/32 sirve como referencia para estudiar hasta qué punto el ajuste de bajo rango se aproxima al full fine-tune (76/100 frente a 78/100 en `table_rearrangement` al final del entrenamiento).
- Punto de partida para ajuste con datos propios: dado que se publican los estados de optimizador en la mayoría de las carpetas, se puede continuar el entrenamiento con nuevos episodios en formato LeRobot v2.1 sobre el mismo pipeline de openpi.
- Estudio de fallos y límites del aprendizaje por imitación: la tarea `item_assembly` se detuvo de forma temprana con 0/18, 0/25 y 2/40 episodios en distintos pasos, lo que la convierte en un caso de estudio documentado sobre tareas donde el ajuste no alcanza a los baselines.
- Análisis de la relación entre pasos de entrenamiento y tasa de éxito: la tabla publicada permite estudiar curvas de aprendizaje por tarea, como la subida de 60/100 a 78/100 en el full fine-tune de `table_rearrangement` entre los pasos 5.000 y 15.000.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones de éxito en simulación, no benchmarks de lenguaje. Se realizaron con 100 episodios en configuración aleatoria salvo donde se indica.

| Tarea | Checkpoint recomendado | Exito / episodios | Pasos de accion medios / limite | Evaluacion |
|---|---|---|---|---|
| table_rearrangement | `pi05_full_v1/15000` | 78 / 100 | 209,3 / 361 | Configuración aleatoria, 100 episodios |
| items_handover | `pi05_lora_v1/12500` | 38 / 100 | 342,2 / 350 | Configuración aleatoria, 100 episodios |
| handle_basket | `pi05_lora_v1/7500` | 79 / 100 | 414,0 / 500 | Configuración aleatoria, 100 episodios |
| item_assembly | `pi05_lora_v1/10000` | 16 / 100 | 469,1 / 500 | Configuración aleatoria, 100 episodios, reescalado de pinza activo |

Comparativa con baselines publicados por el autor (éxito por 100 episodios):

| Tarea | Mejor checkpoint del autor | ACT | SmolVLA | Diffusion Policy | π0.5 de la comunidad |
|---|---|---|---|---|---|
| table_rearrangement | 78 (full fine-tune) | 96 | 90 | 17 | No disponible |
| items_handover | 38 (LoRA) | 26 | 22 | 0 | No disponible |
| handle_basket | 79 (LoRA) | 54 | 33 | 12 | No disponible |
| item_assembly | 16 (LoRA, por debajo de todos los baselines) | 65 | 51 | 38 | 64 |

Progresión del entrenamiento en `table_rearrangement`:

| Paso | Full fine-tune (exito / pasos medios) | LoRA (exito / pasos medios) |
|---|---|---|
| 2.500 | No disponible | 32 / 299,2 |
| 5.000 | 60 / 246,6 | 39 / 294,6 |
| 7.500 | No disponible | 52 / 259,5 |
| 10.000 | 73 / 219,1 | 56 / 265,4 |
| 12.500 | No disponible | 70 / 233,6 |
| 15.000 | 78 / 209,3 | No disponible |
| 14.999 | No disponible | 76 / 223,9 |
| 19.999 | 76 / 229,3 | No disponible |

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- VRAM de inferencia: el autor no la especifica. Los parámetros del checkpoint ocupan 12 GB, lo que para 3,35B parámetros es coherente con pesos en precisión de 32 bits; la cifra no debe tomarse como requisito final, ya que no se documenta el entorno de ejecución exacto.
- VRAM de entrenamiento (full fine-tune): el autor empleó una única H100 NVL, con un pico de memoria suficiente para batch 64 y 3,35B parámetros; no se publica el consumo máximo medido.
- Tamaño en disco de los checkpoints: 42 GB por checkpoint en el full fine-tune (12 GB de parámetros más 31 GB de estado del optimizador). El paso 5.000 de esa ejecución guarda solo los parámetros.
- Tamaño total del repositorio: 361,1 GB, por lo que la descarga completa requiere espacio de almacenamiento considerable y una estrategia selectiva de ficheros.
- GPU recomendadas: H100 NVL confirmada por el autor para el entrenamiento. Para inferencia no se publican recomendaciones; dado el tamaño del modelo, se sitúa en el rango de GPUs de centro de datos (A100, H100) o GPUs profesionales con memoria suficiente.
- Viabilidad en GPU de consumo: no disponible; el autor no documenta ninguna prueba en GPUs de consumo, y no se distribuyen pesos cuantizados.
- Opciones de despliegue: openpi (repositorio oficial de Physical-Intelligence) es la vía documentada. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ni formatos GGUF para este repositorio.
- Latencia y throughput: no disponibles. Se conoce el tiempo de entrenamiento (34 h 58 min para 20.000 pasos con batch 64 en una H100 NVL), pero no métricas de inferencia.
- Almacenamiento de datos: los datasets de entrenamiento son los oficiales `RoboSynChallenge/cobotmagic_Sim_<task>`, con 1.000 episodios expertos por tarea en formato LeRobot v2.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Robo_model (π0.5 ajustado) | 3,35B | No disponible | 78/100 en table_rearrangement, 38/100 en items_handover, 79/100 en handle_basket, 16/100 en item_assembly | `other` | HuggingFace, checkpoints openpi |
| ACT (baseline citado por el autor) | No disponible | No disponible | 96 en table_rearrangement, 26 en items_handover, 54 en handle_basket, 65 en item_assembly | No disponible | No disponible en este repositorio |
| SmolVLA (baseline citado por el autor) | No disponible | No disponible | 90 en table_rearrangement, 22 en items_handover, 33 en handle_basket, 51 en item_assembly | No disponible | No disponible en este repositorio |
| Diffusion Policy (baseline citado por el autor) | No disponible | No disponible | 17 en table_rearrangement, 0 en items_handover, 12 en handle_basket, 38 en item_assembly | No disponible | No disponible en este repositorio |
| π0.5 de la comunidad (baseline citado por el autor) | No disponible | No disponible | 64 en item_assembly | No disponible | No disponible en este repositorio |

No se dispone de datos de parámetros, contexto ni licencia de los baselines en la información proporcionada; solo se documentan sus tasas de éxito. No se han encontrado fuentes web relevantes que aporten comparativas adicionales.

## Limitaciones y advertencias

- Los resultados son exclusivamente de simulación (CobotMagic); no se documenta ninguna validación en robot físico ni transferencia sim-a-real.
- El rendimiento es muy desigual entre tareas: 78/100 y 79/100 en las dos mejores, frente a 16/100 en `item_assembly`, donde el modelo queda por debajo de todos los baselines citados.
- La tarea `item_assembly` se detuvo de forma temprana en varios pasos con 0/18, 0/25 y 2/40 episodios resueltos, y algunos checkpoints publicados corresponden a esas paradas tempranas.
- La evaluación se realizó con 100 episodios en configuración aleatoria; no se documenta la varianza entre ejecuciones ni intervalos de confianza.
- No se especifican los términos concretos de la licencia `other`; antes de cualquier uso comercial debe verificarse la licencia del modelo base `physical-intelligence/pi05-base` y la de los datasets de RoboSynChallenge.
- No se documentan sesgos, comportamiento multilingüe ni el idioma de las instrucciones; estas dimensiones quedan sin evaluar.
- El repositorio tiene 0 descargas y 0 likes, y el autor no aporta documentación adicional fuera de la model card; no hay validación externa independiente de los resultados.
- El tamaño del repositorio (361,1 GB) y de cada checkpoint (hasta 42 GB) dificulta la descarga completa y el despliegue en entornos con almacenamiento limitado.
- No se distribuyen pesos cuantizados ni formatos alternativos, lo que restringe las opciones de inferencia a la pila de openpi.
- El autor advierte que la receta LoRA usa rangos distintos según el componente (16 en PaliGemma, 32 en el resto), por lo que reproducir el ajuste requiere respetar esa configuración.
- Las fechas del repositorio (creación en septiembre de 2026 y actualización en octubre de 2026) son las indicadas por la plataforma y deben tratarse como dato del propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/2bidoubi/Robo_model
- Modelo base: https://huggingface.co/physical-intelligence/pi05-base
- Repositorio de entrenamiento openpi: https://github.com/Physical-Intelligence/openpi
- RoboSynChallenge: http://robosyn-bench.net
- Datasets de entrenamiento: `RoboSynChallenge/cobotmagic_Sim_<task>` (1.000 episodios expertos por tarea, LeRobot v2.1); no se ha proporcionado la URL directa.
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (contenido no técnico y ajeno al ámbito), por lo que no se incluyen como referencias válidas.
