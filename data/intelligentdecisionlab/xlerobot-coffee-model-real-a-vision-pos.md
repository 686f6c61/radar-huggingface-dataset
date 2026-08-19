# IntelligentDecisionLab/xlerobot-coffee-model-real-a-vision-pos

## Resumen

El repositorio `IntelligentDecisionLab/xlerobot-coffee-model-real-a-vision-pos` contiene un conjunto de políticas ACT (Action Chunking with Transformers) entrenadas para el robot móvil de doble brazo XLeRobot de 17 grados de libertad (DoF), desarrolladas por IntelligentDecisionLab. Estas políticas resuelven tareas de manipulación dentro de una cadena de producción de cafetera automática ("Coffee Automata") utilizando datos reales capturados en el mundo físico. Se trata del "Método A" (visión + posición), que forma parte de una cuadrícula de cuatro repositorios que cruzan dominio (real vs. simulado) y método (visión+posición vs. fuerza).

El modelo es relevante porque aborda dos preguntas de investigación concretas: si predecir el espacio de acción completo (17-D) frente a solo el brazo actuante (6-D) afecta al rendimiento, y si el uso de una o dos cámaras RGB modifica la precisión. La arquitectura es ACT vanilla, sin modificaciones sobre la implementación estándar de LeRobot. El repositorio ocupa 23,1 GB e incluye múltiples checkpoints organizados por tarea, espacio de acción y configuración de cámaras. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) vanilla |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza ACT (Action Chunking with Transformers) en su variante vanilla, sin modificaciones sobre la implementación de LeRobot. La observación consiste en el estado del robot (posiciones articulares) y una o dos imágenes RGB (cámara de cabeza y, opcionalmente, cámara de muñeca derecha). La salida es una secuencia de acciones de longitud fija (chunk_size 100) sobre el espacio de acción elegido: 17 dimensiones (12 articulaciones de brazos, 2 de cabeza y 3 de base: x/y/theta en velocidad) o 6 dimensiones (solo el brazo que realiza la tarea). El entrenamiento se realizó con batch de 8, 100.000 pasos y semilla 1000, idéntico para todos los modelos del repositorio, de modo que las variables de dominio, método, dimensión de acción y número de cámaras pueden aislarse.

La normalización de estados y acciones aplica un suelo mínimo de 1e-2 (y 1e-5 para HPI), corrección de un defecto de desviación estándar degenerada documentado en `docs/coffee/EVAL_POSTMORTEM.md`. Los modelos se entrenaron en dos estaciones: RTX PRO 6000 Blackwell para los de una cámara y RTX 5090 para los de dos cámaras. Un experimento comparativo entre los espacios de acción 17-D y 6-D, evaluando ambos sobre las mismas 6 articulaciones del brazo actuante en 22 pares (12 simulados y 10 reales con dos cámaras), mostró una diferencia media de +6,5% a favor de 17-D con un intervalo de confianza del 95% de [−1,7%, +14,7%], lo que indica que ambos son estadísticamente indistinguibles en precisión. La model card recomienda usar 17-D para despliegue por coherencia con la plataforma y por mantener el comportamiento bimanual.

## Capacidades

- Control robótico de 17 grados de libertad: brazos, cabeza y base móvil.
- Ejecución de tareas de manipulación específicas de una cadena de cafetera: colocar taza, pulsar botón, transferir taza a bandeja, navegar y transferir bandeja a mesa.
- Soporte de una o dos cámaras RGB (cabeza y muñeca derecha) como entrada visual.
- Dos espacios de acción: predicción completa de 17 dimensiones o predicción reducida a 6 dimensiones (solo el brazo actuante).
- Distinción entre tareas unimanuales y bimanuales (la tarea `t2_push_button` requiere ambos brazos en el mundo real).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.

## Casos de uso

- Colocación de taza en soporte (`t1_place_cup`): el modelo predice la secuencia de posiciones articulares para situar una taza en una posición objetivo, usando la cámara de la cabeza para observar la escena. Es adecuado para automatizar el primer paso de la cadena de montaje.
- Pulsación de botón (`t2_push_button`): tarea bimanual en el mundo real; la versión de 17-DoF es necesaria para coordinar ambos brazos. Puede integrarse en una línea de producción donde el robot debe activar un interruptor o botón físico.
- Transferencia de taza a bandeja (`t3_cup_to_tray`): el modelo mueve la taza desde una posición inicial hasta una bandeja. Útil en procesos de empaquetado o ensamblaje.
- Navegación de la base (`t4_navigate`): el modelo controla el movimiento de la base (x/y/theta) para desplazar el robot entre estaciones de trabajo. Solo existe la variante 17-DoF de 50k pasos para este método.
- Transferencia de bandeja a mesa (`t5_tray_to_table`): similar a `t3` pero con la bandeja completa, lo que requiere mayor precisión posicional. Puede usarse en logística interna de almacenes.
- Evaluación de configuración de sensores: los modelos con dos cámaras (cabeza + muñeca) permiten comparar el impacto de la información visual adicional en la precisión de la manipulación, lo que ayuda a decidir el hardware óptimo para despliegues industriales.
- Investigación en aprendizaje por imitación: el par 17-D vs 6-D sirve para estudiar cómo la función de pérdida de ACT (media sobre todas las dimensiones de acción) afecta al aprendizaje de las articulaciones que realmente se mueven.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque este no es un modelo de lenguaje. El único dato de rendimiento disponible es la comparación interna entre los espacios de acción 17-D y 6-D, extraída de la model card:

| Conjunto | n | Δ medio (17-D vs 6-D) | IC 95% |
|---|---|---|---|
| Simulado, 1 cámara | 12 | +4,2% | [−5,1%, +13,5%] |
| Real, 2 cámaras | 10 | +9,4% | [−5,2%, +23,9%] |
| **Combinado** | **22** | **+6,5%** | **[−1,7%, +14,7%]** |

El valor positivo indica un error menor con el modelo de 17-DoF. Todos los intervalos contienen el cero, por lo que no hay diferencia estadísticamente significativa entre ambos espacios de acción.

## Requisitos de hardware

- Entrenamiento: los modelos de una cámara se entrenaron en una RTX PRO 6000 Blackwell; los de dos cámaras en una RTX 5090.
- Inferencia: no se especifican requisitos de VRAM. Dado que cada checkpoint individual es un modelo ACT típico (del orden de decenas de millones de parámetros), es probable que quepa en GPUs consumer como RTX 3060 o superiores, pero no hay datos oficiales.
- Despliegue: se carga mediante `PreTrainedPolicy.from_pretrained` de la librería LeRobot. No se mencionan otras herramientas como vLLM u Ollama, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de robótica en la información disponible. El repositorio compañero `IntelligentDecisionLab/xlerobot-coffee-model-real-b-force` implementa el Método B (control por fuerza) sobre el mismo dominio y tareas, pero no se ofrecen métricas comparativas entre ambos métodos. Tampoco hay datos de otros modelos ACT públicos con los que contrastar.

## Limitaciones y advertencias

- No comparar los modelos de 17-D y 6-D por su pérdida de entrenamiento: la pérdida de ACT es una media sobre todas las dimensiones de acción, por lo que la de 17-D se ve artificialmente reducida por los canales congelados.
- La tarea `t4_navigate` solo existe como `t4_navigate_17dof_50k` (50k pasos) y únicamente para el Método A; no hay variante de 6-DoF ni de dos cámaras.
- La tarea `t2_push_button` no tiene versión con dos cámaras en este repositorio.
- Los modelos con sufijo `_17dof_50k` pertenecen a una generación anterior (escalera E03/E04) y no deben confundirse con los reentrenamientos de 100k sin sufijo; son pesos distintos sobre la misma tarea.
- Al ser un modelo de robótica, no presenta sesgos lingüísticos ni riesgo de alucinación textual, pero su rendimiento depende críticamente de la distribución de los datos de entrenamiento (entornos reales específicos de la cafetera).
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de atribución y las patentes asociadas si se redistribuye.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-a-vision-pos
- Repositorio compañero (Método B, fuerza): https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-b-force
- Hardware XLeRobot (GitHub de ggs2ggs): https://github.com/ggs2ggs/XLeRobot
- Hardware XLeRobot (GitHub de Vector-Wangel): https://github.com/Vector-Wangel/XLeRobot
- Utilidades para LeRobot (any4lerobot): https://github.com/Tavish9/any4lerobot
