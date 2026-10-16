# KelinLiIC/Haptic-ACT

## Resumen

Haptic-ACT es un conjunto de políticas de manipulación robótica entrenadas por imitación para el simulador ManiSkill, publicadas por KelinLiIC como artefactos reproducibles del artículo Haptic-ACT (IROS 2025). El modelo propone sustituir las fuerzas de las puntas de los dedos por las lecturas de un sensor de par/fuerza (F/T) de 6 ejes en la muñeca del robot, integradas en la arquitectura ACT (Action Chunking Transformer), y demuestra que esa señal háptica mejora tareas de contacto fino como la inserción de clavijas. El repositorio contiene tanto la política propuesta (`acthaptic`) como las líneas base ACT, Diffusion Policy y BC, entrenadas sobre los mismos datos para permitir comparaciones controladas.

El modelo no es un modelo de lenguaje: es una política visomotora con condicionamiento háptico que consume observaciones (imágenes y estado propioceptivo, más F/T en la variante propuesta) y produce secuencias de acciones para un brazo Franka Panda. Se distribuye en formato LeRobot 0.6.1, con directorios `pretrained_model` autocontenidos (configuración, pesos, pre/post-procesadores y configuración de entrenamiento) para cuatro tareas: PegInsertionSide, PickCube, StackCube y PushCube.

Su relevancia actual reside en dos factores: por un lado, aporta una línea base pública y reproducible para investigar la fusión de señales táctiles en políticas de imitación; por otro, libera los pesos de las comparativas (ACT, Diffusion Policy, BC) junto con los conjuntos de datos, algo poco habitual y útil para reproducir experimentos de *imitation learning* en simulación con hardware humanoide/industrial estándar. El repositorio completo ocupa 6,5 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con CVAE; variante `acthaptic` que incorpora fuerza/par de 6 ejes en la muñeca como entrada adicional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); politica con *action chunking*; la evaluacion usa n-action-steps = 50 |
| Tipos de cuantizacion | no disponible; pesos en `safetensors` en la precision de entrenamiento, sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (estructura de directorio `pretrained_model` de LeRobot 0.6.1: config, pesos, pre/post-procesadores, config de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura base es ACT, un transformer con *action chunking* que predice bloques de acciones en lugar de acciones individuales, y que incorpora un cuello de botella CVAE para modelar la multimodalidad de las demostraciones humanas. La variante Haptic-ACT (`ft`) mantiene esa base y añade como entrada la lectura del sensor de par/fuerza de 6 ejes en la muñeca del Franka Panda, en lugar de las fuerzas de las puntas de los dedos empleadas en otras configuraciones del proyecto. Las líneas base incluidas son ACT estándar (`act`), Diffusion Policy (`diffusion`) y BC (`act` sin *chunking* ni CVAE), todas entrenadas sobre los mismos datos para que la comparación sea atribuible al método y no a la distribución de entrenamiento.

El entrenamiento es por imitación (*behavior cloning*) sobre demostraciones teleoperadas en el simulador ManiSkill con un Franka Panda, correspondientes a cuatro tareas: PegInsertionSide, PickCube, StackCube y PushCube. Los conjuntos de datos están publicados de forma independiente en HuggingFace. No se especifican en la información disponible el número de demostraciones, el número de tokens o transiciones, la composición exacta de los datos ni si se aplicaron etapas de refinamiento tipo RLHF o DPO (no aplicables en este dominio). Cada checkpoint liberado corresponde al de mayor tasa de éxito de su ejecución, y la evaluación oficial se realiza con 10 semillas x 25 ensayos por configuración.

## Capacidades

- Control de manipulación robótica para un brazo Franka Panda en el simulador ManiSkill: inserción de clavijas (PegInsertionSide), recogida de cubos (PickCube), apilado (StackCube) y empuje (PushCube).
- Política visomotora que consume observaciones visuales y estado del robot, y en la variante `acthaptic` también lecturas de par/fuerza de 6 ejes en la muñeca.
- Generación de acciones por bloques (*action chunking*), con un disparador aprendido (`learned-trigger 0.5`) y evaluación con `n-action-steps 50`.
- Capacidad de comparación controlada frente a líneas base: ACT, Diffusion Policy y BC entrenadas sobre los mismos datos y tareas.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje.
- No soporta agentes basados en texto, razonamiento multi-paso simbólico ni diálogo.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo *thinking*, visión generalista, audio ni generación de texto o código.

## Casos de uso

- Investigación en fusión táctil para imitación: usar el checkpoint `ft` y el conjunto de datos asociado para estudiar cómo la señal de par/fuerza de la muñeca influye en tareas con contacto estrecho, comparando contra `act` con idéntica configuración de entrenamiento.
- Reproducción de líneas base en *imitation learning*: los checkpoints `act` y `dp` permiten reproducir resultados de ACT y Diffusion Policy en ManiSkill sin reentrenar, útil para validar nuevos métodos contra referencias públicas.
- Desarrollo de políticas para inserción de precisión: PegInsertionSide es la tarea donde la variante háptica muestra la mayor ventaja (79,6 % frente a 43,6 % de ACT), por lo que es el escenario natural para prototipar estrategias de ensamblaje con tolerancias ajustadas.
- Evaluación comparativa de arquitecturas de política: el repositorio incluye cuatro métodos sobre las mismas cuatro tareas, lo que permite montar un banco de pruebas homogéneo de éxito, robustez y coste de entrenamiento.
- Ablación de la señal háptica: comparar `ft` frente a `act` aísla el efecto del F/T de 6 ejes, y la inclusión de BC permite además cuantificar la aportación del *chunking* y del CVAE.
- Formación y docencia en robótica: al ejecutarse íntegramente en simulación con ManiSkill y pesos abiertos bajo MIT, sirve como material práctico para cursos de aprendizaje por imitación sin necesidad de robot físico.
- Reutilización como inicialización: los pesos ACT pueden servir de punto de partida para *fine-tuning* en tareas propias dentro de ManiSkill, aprovechando el formato estándar de LeRobot 0.6.1.

## Benchmarks y rendimiento

Tasa de éxito (%) del checkpoint seleccionado, media ± desviación estándar sobre las semillas. El número entre paréntesis es el paso de entrenamiento del checkpoint:

| Tarea | Haptic-ACT (F/T) | ACT | Diffusion Policy | BC |
|---|---|---|---|---|
| PegInsertionSide (`peg`) | 79,6 ± 6,1 (180k) | 43,6 ± 10,3 (190k) | 78,4 ± 9,5 (150k) | 1,2 ± 1,8 (70k) |
| PickCube (`pickcube`) | 80,4 ± 6,3 (150k) | 78,0 ± 6,5 (135k) | 84,8 ± 6,1 (142,5k) | 22,0 ± 8,8 (142,5k) |
| StackCube (`stackcube`) | 87,2 ± 10,1 (127,5k) | 82,0 ± 10,2 (127,5k) | 95,6 ± 3,8 (142,5k) | 0,0 ± 0,0 (150k) |
| PushCube (`pushcube`) | 100,0 ± 0,0 (60k) | 100,0 ± 0,0 (60k) | 99,2 ± 1,6 (60k) | 9,6 ± 6,0 (60k) |

Advertencia del propio autor: estas cifras corresponden a los checkpoints seleccionados según las semillas de evaluación, por lo que están sesgadas al alza. Los resultados publicados en el README de GitHub promedian los últimos 10 checkpoints de cada ejecución. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que además no son aplicables a este tipo de modelo.

## Requisitos de hardware

- El repositorio completo ocupa 6,5 GB; no se detalla el tamaño ni el número de parámetros de cada checkpoint individual.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. La evaluación oficial se ejecuta dentro del simulador ManiSkill, cuyos requisitos no se detallan en la model card.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante LeRobot 0.6.1 como directorio `pretrained_model`; la evaluación se realiza con el script `ft_maniskill/eval/eval_ft.py`. No aplican servidores de inferencia de lenguaje como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Los únicos parámetros de ejecución documentados son `n-action-steps 50` y `learned-trigger 0.5`.

## Comparativa con modelos similares

Comparación con las líneas base incluidas en el mismo repositorio, entrenadas sobre los mismos datos y tareas:

| Modelo | Tipo de politica | Parametros | Contexto | Mejor tarea (exito) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Haptic-ACT (F/T) | `acthaptic` con F/T de 6 ejes | no disponible | no aplica | PegInsertionSide 79,6 % | MIT | HuggingFace + plugin en GitHub |
| ACT | `act` | no disponible | no aplica | StackCube 82,0 % | MIT | HuggingFace |
| Diffusion Policy | `diffusion` | no disponible | no aplica | StackCube 95,6 % | MIT | HuggingFace |
| BC (ACT sin *chunking* ni CVAE) | `act` | no disponible | no aplica | PickCube 22,0 % | MIT | HuggingFace |

Comparativa con modelos de política de otros proyectos (por ejemplo, otras políticas ACT o VLA publicadas para manipulación): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos de selección de checkpoint: las cifras de éxito corresponden al mejor checkpoint elegido sobre las semillas de evaluación; el propio autor advierte que son optimistas frente al promedio de los últimos 10 checkpoints.
- Dominio limitado a simulación: los modelos se entrenan y evalúan en ManiSkill con un Franka Panda; no se documenta validación en robot físico para esta publicación concreta.
- Cobertura restringida: solo cuatro tareas (PegInsertionSide, PickCube, StackCube, PushCube) y un único robot; no son políticas generalistas.
- Riesgo de fallo fuera de distribución: al ser *behavior cloning*, la política no tiene mecanismo explícito de recuperación ante estados no vistos; el rendimiento de BC en StackCube (0,0 %) ilustra la sensibilidad del enfoque a la configuración.
- Sin capacidades de lenguaje: no admite instrucciones en lenguaje natural, *tool calling* ni razonamiento simbólico, por lo que no debe evaluarse con criterios de modelos de lenguaje.
- Idiomas soportados: no disponible; no aplica.
- Sin datos de sesgo demográfico o social: no aplica, ya que no procesa texto ni datos humanos.
- Licencia MIT: permite uso comercial y modificación, pero conviene citar el artículo original (IROS 2025) y verificar las licencias de los conjuntos de datos y de las dependencias (LeRobot, ManiSkill).
- Adopción nula observada: 0 descargas y 0 *likes* en el momento de la consulta, por lo que no existe validación externa independiente de los resultados.
- Fechas del repositorio: creado y actualizado el 15 de octubre de 2026 según los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KelinLiIC/Haptic-ACT
- Conjuntos de datos: https://huggingface.co/datasets/KelinLiIC/Haptic-ACT
- Repositorio de codigo Haptic-ACT: https://github.com/KelinLi-ReCAST/Haptic-ACT
- Plugin de politica `acthaptic` para LeRobot: https://github.com/KelinLi-ReCAST/Haptic-ACT/tree/main/ft_maniskill/policy/lerobot_policy_acthaptic
- Articulo (arXiv): https://arxiv.org/abs/2409.11925
- DOI de la publicacion en IROS 2025: https://doi.org/10.1109/IROS60139.2025.11247471

Nota: los resultados de la busqueda web realizada no contenian enlaces relevantes para este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
