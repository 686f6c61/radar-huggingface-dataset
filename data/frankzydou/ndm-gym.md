# frankzydou/ndm-gym

## Resumen

NDM Gym es un entorno de investigación para el modelado de dinámicas neuronales aplicado al control de robots humanoides. El repositorio `frankzydou/ndm-gym` en Hugging Face contiene los pesos entrenados de las políticas y modelos del mundo asociados al benchmark G1 / LAFAN1 motion tracking, desarrollado por Frank-ZY-Dou y publicado bajo el paraguas del proyecto NDM Gym. No se trata de un modelo de lenguaje, sino de un conjunto de checkpoints de políticas de control (9,1 M de parámetros) y modelos del mundo (MLP de 8,8 M o RigidFormer de 0,88 M) entrenados para que el robot humanoide Unitree G1 (29 grados de libertad) reproduzca los 40 clips de movimiento del dataset LAFAN1.

El interés actual del artefacto reside en que separa explícitamente la política del modelo del mundo y publica los resultados de forma reproducible: cuatro configuraciones algorítmicas (SuperTrack y SuperMimic, cada una con modelo del mundo MLP o RigidFormer), tres semillas por configuración y 12 ejecuciones en total, todas entrenadas durante 3 horas en una única GPU A100. Cada checkpoint incluye la política, el modelo del mundo, los argumentos de entrenamiento, la iteración, el tiempo de pared y los pasos de simulación, lo que facilita la comparación entre variantes sin necesidad de reentrenar.

La relevancia práctica es doble: por un lado, ofrece una línea base cuantitativa para investigación en motion tracking de humanoides con métricas como retorno normalizado, MPJPE, error de ángulo articular y robustez frente a empujes; por otro, la licencia de los pesos está atada a la licencia de los datos de entrenamiento (LAFAN1, CC BY-NC-ND 4.0), lo que restringe su uso a investigación no comercial. El tamaño total del repositorio es de 0,7 GB y los pesos se distribuyen en formato PyTorch (`.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de tracking (MLP) + modelo del mundo (MLP o RigidFormer); no es un transformer de lenguaje |
| Parametros totales | Política: 9,1 M; modelo del mundo MLP: 8,8 M; modelo del mundo RigidFormer: 0,88 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; usa `goal_frames` e `hist` como ventanas de observación) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante PyTorch, sin versiones cuantizadas publicadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | `ndm-gym-weights` (licencia propia); los pesos de `g1_lafan1_tracking/` heredan CC BY-NC-ND 4.0 de LAFAN1, solo investigación no comercial |
| Formato de pesos | PyTorch `.pt` (cargables con `torch.load(..., weights_only=True)`) |
| Pipeline | robotics |
| Libreria | pytorch |
| Tamano del repositorio | 0,7 GB |
| Robot objetivo | Unitree G1, 29 DoF |
| Benchmark | G1 / LAFAN1 motion tracking (40 clips) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto combina dos componentes diferenciados. La política (`TrackingPolicy`) es una red MLP que recibe observaciones de dimensión `OBS_DIM` y produce acciones; su tamaño es de 9,1 M de parámetros y se instancia con `goal_frames` e `hist` como parámetros de ventana temporal. El modelo del mundo puede ser un MLP de 8,8 M de parámetros o un RigidFormer de 0,88 M, seleccionable mediante `world_model_from_args`. Las variantes SuperTrack y SuperMimic difieren en el algoritmo de entrenamiento, mientras que los sufijos `-RF` indican el uso del modelo del mundo RigidFormer en lugar del MLP.

El entrenamiento se realizó sobre los 40 clips de LAFAN1 retargetizados al Unitree G1 (LAFAN1 Retargeting Dataset), con 3 horas de cómputo por ejecución en una única A100. El número de iteraciones alcanzadas en esas 3 horas varía según configuración: entre 12.610 y 12.740 para SuperTrack-MLP, entre 13.326 y 13.688 para SuperMimic-MLP, entre 12.654 y 12.696 para SuperTrack-RF y entre 10.694 y 10.726 para SuperMimic-RF. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset más allá de LAFAN1, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). Los checkpoints no incluyen estados del optimizador, por lo que no es posible reanudar el entrenamiento desde ellos.

## Capacidades

- Reproducción de movimiento (motion tracking) de 40 clips de LAFAN1 sobre el humanoide Unitree G1 de 29 DoF.
- Control de política MLP con ventana de observación configurable (`goal_frames`, `hist`).
- Modelado del mundo con dos alternativas: MLP (8,8 M) y RigidFormer (0,88 M).
- Evaluación estandarizada mediante la herramienta `ndm-eval`, con salida JSON y grabación en `.npz` para comparación de vídeos.
- Robustez frente a perturbaciones: evaluación bajo empujes de raíz de 1 m/s y 2 m/s cada 2 s.
- Carga directa en Python con `torch.load(weights_only=True)` e integración con `ndm_gym.algos`, `ndm_gym.policies.tracking_policy` y `ndm_gym.tasks.tracking`.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento: es un artefacto de robótica, no un modelo de lenguaje.

## Casos de uso

- Investigación en motion tracking de humanoides: usar los checkpoints como línea base reproducible para comparar nuevas políticas o modelos del mundo contra SuperTrack y SuperMimic con las mismas semillas y métricas.
- Estudio comparativo de modelos del mundo: enfrentar MLP (8,8 M) contra RigidFormer (0,88 M) en el mismo benchmark para medir el compromiso entre capacidad y coste computacional (MPJPE de 20,0 mm frente a 21,0 mm en SuperTrack, con 10 veces menos parámetros en RigidFormer).
- Evaluación de robustez: reproducir los tests de empujes de raíz a 1 m/s y 2 m/s cada 2 s para analizar la degradación de la política bajo perturbaciones (por ejemplo, 7,7 clips fallidos con SuperTrack-MLP a 1 m/s frente a 5,3 con SuperTrack-RF).
- Docencia y divulgación en robótica: el flujo `scripts/setup.sh` + `ndm-eval` permite montar un entorno completo con los movimientos y el G1 descargados en `data/`, útil para prácticas guiadas.
- Desarrollo de pipelines de evaluación: integrar `ndm-eval` con salida JSON en sistemas de CI para detectar regresiones al modificar políticas o modelos del mundo.
- Análisis de vídeo comparativo: usar `tools/compare_videos.py` sobre las grabaciones `.npz` para inspeccionar cualitativamente el comportamiento de cada configuración y semilla.
- Reproducción de resultados publicados: cada carpeta contiene los checkpoints exactos detrás de los resultados del benchmark, lo que permite verificar las tablas publicadas sin reentrenar.

## Benchmarks y rendimiento

Resultados publicados en la model card para G1 / LAFAN1 motion tracking (media ± desviación estándar sobre tres semillas; cada semilla promedia tres evaluaciones estándar, salvo las filas de empujes que usan un único test):

| Metrica | SuperTrack (MLP) | SuperMimic (MLP) | SuperTrack-RF | SuperMimic-RF |
|---|---|---|---|---|
| Retorno normalizado | 0,832 ± 0,009 | 0,824 ± 0,013 | 0,832 ± 0,003 | 0,804 ± 0,007 |
| Clips fallidos (de 40) | 0,9 ± 0,8 | 1,2 ± 1,2 | 0,4 ± 0,5 | 0,8 ± 0,4 |
| MPJPE relativo a la raíz (mm) | 20,0 ± 0,7 | 28,4 ± 0,5 | 21,0 ± 1,3 | 33,1 ± 0,5 |
| Error de ángulo articular (grados) | 2,32 ± 0,06 | 4,89 ± 0,03 | 2,24 ± 0,05 | 6,05 ± 0,62 |
| Clips fallidos con empujes de 1 m/s cada 2 s | 7,7 ± 2,3 | 1,7 ± 0,6 | 5,3 ± 1,2 | 1,3 ± 0,6 |
| Clips fallidos con empujes de 2 m/s cada 2 s | 24,7 ± 1,2 | 9,3 ± 1,2 | 24,3 ± 3,1 | 9,0 ± 2,0 |

No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K u otros), por no ser aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los componentes (política de 9,1 M y modelo del mundo de 8,8 M o 0,88 M de parámetros) la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU de entrenamiento de referencia: una única NVIDIA A100 por ejecución, con 3 horas de cómputo por run.
- GPU recomendadas para inferencia: cualquier GPU NVIDIA con soporte CUDA; no se especifican modelos concretos en la información disponible.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna, dado el reducido número de parámetros; no se detalla el modelo mínimo.
- Opciones de despliegue: el flujo oficial es el repositorio `ndm-gym` con `scripts/setup.sh`, `ndm-eval` y carga en Python vía `torch.load`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NDM Gym (SuperTrack-MLP) | Política 9,1 M + WM 8,8 M | No aplica (`goal_frames`/`hist`) | Retorno 0,832; MPJPE 20,0 mm; 0,9 clips fallidos de 40 | `ndm-gym-weights` (CC BY-NC-ND 4.0 por LAFAN1) | Hugging Face `frankzydou/ndm-gym` |
| NDM Gym (SuperTrack-RF) | Política 9,1 M + WM 0,88 M | No aplica (`goal_frames`/`hist`) | Retorno 0,832; MPJPE 21,0 mm; 0,4 clips fallidos de 40 | `ndm-gym-weights` (CC BY-NC-ND 4.0 por LAFAN1) | Hugging Face `frankzydou/ndm-gym` |
| Otras políticas de motion tracking para G1 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de modelos comparables de terceros con métricas equiparables sobre el mismo benchmark; la comparativa interna entre variantes del propio NDM Gym es la única sustentada por datos.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos de `g1_lafan1_tracking/` heredan CC BY-NC-ND 4.0 de LAFAN1 (© 2018 Ubisoft Entertainment), por lo que solo se permite investigación no comercial y no se autorizan obras derivadas de los pesos.
- La licencia de los pesos no es la MIT del código de NDM Gym; cada carpeta sigue los términos de los datos con los que se entrenó.
- Los checkpoints no incluyen estados del optimizador: no se puede reanudar el entrenamiento desde ellos.
- Dominio muy acotado: solo cubre el benchmark G1 / LAFAN1 motion tracking; no hay pesos publicados para otros benchmarks en el momento de la información.
- Dependencia del robot objetivo: los pesos están entrenados para el Unitree G1 de 29 DoF; no son transferibles directamente a otras morfologías.
- Robustez limitada bajo perturbaciones fuertes: con empujes de 2 m/s cada 2 s, entre 9,0 y 24,7 clips de 40 fallan según configuración.
- Sin datos publicados sobre sesgos, alucinación o comportamiento fuera de distribución más allá de los tests de empujes.
- Sin métricas de latencia o throughput en producción.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de adopción comunitaria ni validación externa.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/frankzydou/ndm-gym
- Repositorio NDM Gym: https://github.com/Frank-ZY-Dou/ndm-gym
- Resultados del benchmark: https://github.com/Frank-ZY-Dou/ndm-gym/blob/main/benchmarks/g1_lafan1_tracking/results.md
- Resultados (sección README): https://github.com/Frank-ZY-Dou/ndm-gym#-results
- Dataset LAFAN1 (Ubisoft La Forge): https://github.com/ubisoft/ubisoft-laforge-animation-dataset
- Licencia de los pesos: https://huggingface.co/frankzydou/ndm-gym/blob/main/LICENSE
