# armteam/hapticwam-baselines

## Resumen

`hapticwam-baselines` es un repositorio de pesos y artefactos de evaluación publicado por el equipo `armteam` en HuggingFace, no un modelo de lenguaje. Contiene las tres políticas baseline (robótica de manipulación) contra las que se compara el "estudiante" del proyecto HapticWAM, exactamente en los pasos de entrenamiento que el artículo despliega, junto con los barridos de evaluación que sirvieron para seleccionar esos pasos. El repositorio ocupa 12,5 GB y está etiquetado como `robotics`, `manipulation` y `baselines`, con licencia Apache-2.0.

Las tres baselines son: Diffusion Policy (checkpoint desplegado a 100k pasos, 1,05 GB), X-VLA 0.9B (20k pasos, 1,76 GB) y un fine-tune experto de pi0.5 (checkpoint desplegado `020000/pretrained_model/`, 9,69 GB, con estado de optimizador y planificador de 2,2 GB y tokenizador PaliGemma). Todas se entrenaron sobre el dataset `armteam/hapticwam-teleop-dataset`.

Su relevancia es de reproducibilidad: empaqueta en un único punto de descarga los checkpoints exactos y los JSON de evaluación (barridos de selección de paso y ablaciones) necesarios para replicar la tabla comparativa del paper y para comparar cualquier política nueva contra las mismas referencias. No incluye model card descriptiva de arquitecturas, hiperparámetros ni resultados numéricos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: política de difusión (Diffusion Policy), VLA transformer (X-VLA 0.9B) y fine-tune experto de pi0.5 con tokenizador PaliGemma |
| Parametros totales | No disponible para el conjunto; la baseline X-VLA declara 0,9B parámetros. Sin recuento publicado para Diffusion Policy ni para el experto pi0.5 |
| Parametros activos | No aplica (ninguna de las baselines se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen sin cuantizar en formato PyTorch/safetensors |
| Idiomas soportados | No disponible; no es un modelo de lenguaje general y no se declaran idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors sobre PyTorch; incluye `index.jsonl` con tamano, sha256 de LFS y ruta de origen de cada fichero |

Composición del repositorio:

| Carpeta | Ficheros | Tamano | Baseline | Checkpoint desplegado |
|---|---|---|---|---|
| `diffusion_100k/` | 7 | 1,05 GB | Diffusion Policy | `pretrained_model/` a 100k pasos |
| `xvla_20k/` | 7 | 1,76 GB | X-VLA 0.9B | `pretrained_model/` a 20k pasos |
| `pi05_phantom_expert_v1/` | 18 | 9,69 GB | fine-tune experto de pi0.5 | `020000/pretrained_model/` |
| `eval_baselines/` | 10 | 1,2 MB | JSON de evaluación (barridos DP y X-VLA) | no aplica |
| `eval_pi05/` | 11 | 1,2 MB | barrido de selección de paso de pi0.5 | no aplica |

## Arquitectura y entrenamiento

El repositorio agrupa tres aproximaciones distintas a la política de manipulación. Diffusion Policy es una política visomotora basada en difusión, desplegada aquí a 100.000 pasos de entrenamiento. X-VLA es un modelo visión-lenguaje-acción de 0,9B parámetros, desplegado a 20.000 pasos. La tercera baseline es un fine-tune experto de pi0.5; la presencia de `paligemma_tokenizer/` dentro de la carpeta `020000/` indica que el modelo se apoya en el tokenizador de PaliGemma para procesar las entradas, aunque la ficha no detalla el backbone completo ni la receta de entrenamiento.

La información disponible no incluye número de tokens vistos, composición del dataset, ni si hubo RLHF/DPO (fases poco habituales en robótica de manipulación). Sí se documenta el proceso de selección de checkpoints: los barridos de evaluación son el criterio con el que se eligieron 100k pasos para Diffusion Policy y 20k para X-VLA. En pi0.5 el arm desplegado es el paso 20000 (`pi05_020000_terminal.json`); los ficheros `eval_resume_*` puntúan una ejecución reanudada hasta 60k pasos que no se despliega. La carpeta del experto pi0.5 conserva `020000/training_state/` (estado de optimizador y planificador, 2,2 GB), lo que permite reanudar el entrenamiento. Los JSON `A_visiononly_nfe1.json` y `B_nodistill_nfe1.json` puntúan los brazos Cosmos "solo visión" y "sin destilación" con una única evaluación de función (nfe1), cuyos checkpoints residen en el repositorio de ablaciones.

## Capacidades

- Políticas de manipulación robótica: las tres baselines generan acciones motrices para tareas de manipulación a partir de observaciones, dentro del pipeline `robotics`.
- Comparación como referencia: sirven como línea base fija contra la que medir el estudiante de HapticWAM y cualquier política nueva.
- Reanudación de entrenamiento: el brazo pi0.5 incluye estado de optimizador y planificador, además del tokenizador PaliGemma.
- Reutilización de la evaluación: los JSON de barrido permiten reproducir la selección de checkpoint sin reentrenar.
- Evaluación de ablaciones: los JSON `A_visiononly_nfe1` y `B_nodistill_nfe1` permiten consultar los resultados de los brazos sin destilación y solo visión.
- Capacidades de lenguaje, tool calling, agentes, visión general, audio o modo "thinking": no disponibles; este repositorio no distribuye un modelo de lenguaje ni un agente conversacional.

## Casos de uso

- Reproducción de resultados de un artículo: descargar los tres checkpoints exactos en los pasos desplegados (100k, 20k y 20k) y reevaluarlos con los mismos JSON, evitando la ambigüedad habitual sobre qué checkpoint se usó.
- Comparación de una política propia: usar estas tres baselines como referencia fija para medir una política nueva sobre el mismo dataset de teleoperación y el mismo protocolo de evaluación.
- Auditoría de selección de checkpoint: los barridos `eval_dp_025000`…`eval_dp_100000` y `eval_xvla_005000`…`eval_xvla_020000` permiten verificar si el paso elegido es realmente el mejor o si la curva tenía mesetas y el criterio fue arbitrario.
- Reanudación o ajuste fino del experto pi0.5: gracias a `020000/training_state/` y `paligemma_tokenizer/` se puede continuar el entrenamiento desde el paso 20k en lugar de partir de cero.
- Análisis de destilación: comparar los brazos `B_nodistill_nfe1` y `A_visiononly_nfe1` frente al modelo destilado para cuantificar la contribución de la destilación y de las entradas no visuales.
- Estudio de eficiencia de inferencia: el sufijo `nfe1` (una sola evaluación de función) permite analizar el coste/beneficio de políticas de un solo paso frente a las de difusión multi-paso.
- Docencia e infraestructura de robótica: emplear el repositorio como banco de pruebas para montar pipelines de evaluación de políticas de manipulación con checkpoints heterogéneos (difusión, VLA y experto) bajo una misma licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene artefactos de evaluación, pero la información proporcionada no incluye las cifras de éxito ni las métricas que esos JSON almacenan.

| Conjunto de evaluacion | Contenido declarado | Baseline evaluada | Resultado |
|---|---|---|---|
| `eval_baselines/` | `eval_dp_025000` … `eval_dp_100000` | Diffusion Policy | no disponible |
| `eval_baselines/` | `eval_xvla_005000` … `eval_xvla_020000` | X-VLA 0.9B | no disponible |
| `eval_baselines/` | `A_visiononly_nfe1.json`, `B_nodistill_nfe1.json` | Brazos Cosmos (checkpoints en `hapticwam-ablations`) | no disponible |
| `eval_pi05/` | `pi05_020000_terminal.json` | pi0.5 experto (desplegado) | no disponible |
| `eval_pi05/` | `eval_resume_*` (reanudado a 60k, no desplegado) | pi0.5 experto | no disponible |

## Requisitos de hardware

- VRAM para inferencia: no publicada por el autor. Como referencia de huella de pesos, el brazo pi0.5 ocupa 9,69 GB de ficheros (incluidos 2,2 GB de estado de entrenamiento) y X-VLA 1,76 GB; una estimación conservadora sitúa la inferencia del experto pi0.5 en el entorno de 10-12 GB en bf16 y la de X-VLA 0.9B en torno a 2-4 GB. Son estimaciones derivadas del tamaño de los ficheros, no datos oficiales.
- GPU recomendadas: no disponibles. Por huella de pesos, el brazo pi0.5 encaja con holgura en una RTX 4090 (24 GB) o A100/H100; X-VLA 0.9B y Diffusion Policy caben en GPUs consumer de gama media.
- Cabe en GPU consumer: sí para X-VLA 0.9B y Diffusion Policy (1,76 GB y 1,05 GB de checkpoint). Para el experto pi0.5 se requiere una GPU con al menos 16-24 GB si se quiere mantener el modelo completo en memoria sin cuantizar.
- Opciones de despliegue: el repositorio es PyTorch con pesos safetensors. Las herramientas orientadas a LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables directamente a políticas de manipulación; el despliegue pasa por cargar los checkpoints en el código de evaluación del proyecto HapticWAM.
- Latencia y throughput: no disponibles. El único indicio es el sufijo `nfe1` de dos ficheros de evaluación, que sugiere inferencia con una única evaluación de función en esos brazos concretos.

## Comparativa con modelos similares

La comparación natural es entre las tres baselines incluidas en el propio repositorio, ya que son las alternativas de la misma categoría (políticas de manipulación) que el autor enfrenta entre sí.

| Baseline | Tipo | Parametros | Checkpoint desplegado | Tamano en repo | Licencia |
|---|---|---|---|---|---|
| Diffusion Policy | Política de difusión visomotora | no disponible | 100k pasos | 1,05 GB | Apache-2.0 |
| X-VLA 0.9B | VLA (visión-lenguaje-acción) | 0,9B | 20k pasos | 1,76 GB | Apache-2.0 |
| pi0.5 experto | Fine-tune experto sobre pi0.5 | no disponible | 20k pasos | 9,69 GB (+2,2 GB de estado) | Apache-2.0 |

Alternativas externas de la misma categoría (otras políticas de manipulación o VLA de escala similar): no disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite generación de texto, tool calling, agentes ni conversación; cualquier uso en ese sentido es un error de interpretación de la etiqueta `pipeline: robotics`.
- Sin model card técnica: no se documentan hiperparámetros, composición del dataset, número de tokens ni receta de entrenamiento, lo que dificulta la reproducibilidad completa más allá de los checkpoints.
- Cifras de rendimiento ausentes: los JSON de evaluación están en el repositorio, pero la información disponible no expone sus métricas; no se puede afirmar qué baseline es mejor sin descargar y abrir esos ficheros.
- Selección de checkpoint dependiente del barrido: los pasos desplegados (100k, 20k, 20k) se eligieron con barridos concretos; si el protocolo de evaluación cambia, esos pasos pueden dejar de ser óptimos.
- Riesgo de sobreajuste al dataset: las tres baselines se entrenaron sobre `hapticwam-teleop-dataset`, por lo que su generalización a otros entornos, robots o tareas no está documentada.
- Dependencia del tokenizador PaliGemma en el brazo pi0.5: para ejecutarlo o reanudarlo hay que arrastrar también `paligemma_tokenizer/` y, en su caso, el estado de optimizador.
- Repositorio sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa y de issues que documenten problemas de carga.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el usuario debe verificar las condiciones de los componentes de terceros subyacentes (por ejemplo, el backbone asociado a pi0.5 y el tokenizador PaliGemma) antes de un despliegue en producción.
- Idiomas y sesgos: no disponibles; al no ser un modelo de lenguaje, las categorías habituales de sesgo lingüístico no aplican, pero tampoco hay análisis de sesgo de comportamiento en manipulación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/armteam/hapticwam-baselines
- Dataset de entrenamiento: https://huggingface.co/datasets/armteam/hapticwam-teleop-dataset
- Modelo profesor: https://huggingface.co/armteam/hapticwam-teacher
- Modelo estudiante: https://huggingface.co/armteam/hapticwam-student
- Repositorio de ablaciones (checkpoints Cosmos y `pi05_phantom_expert_v1_resume60k/`): https://huggingface.co/armteam/hapticwam-ablations
- Paper, blog o demo del proyecto: no disponibles en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes para este modelo (los enlaces encontrados correspondían a páginas turísticas sobre Budapest, sin relación con el repositorio).
