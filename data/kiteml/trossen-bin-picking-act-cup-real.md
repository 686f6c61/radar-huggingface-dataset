# kiteml/trossen-bin-picking-act-cup-real

## Resumen

`kiteml/trossen-bin-picking-act-cup-real` es una política de robótica basada en ACT (Action Chunking with Transformers) entrenada por Kite para una estación bimanual WidowX AI de Trossen Robotics. El modelo resuelve una tarea concreta de manipulación: recoger un vaso rojo y depositarlo en una bandeja transparente. No procesa instrucciones en lenguaje natural, por lo que está especializado exclusivamente en esa tarea y ese objeto.

La política consume las imágenes de cuatro cámaras y las 14 posiciones articulares del robot, y produce 14 objetivos articulares en bloques de 100 pasos (action chunking). Se entrenó sobre 18 grabaciones reales del conjunto público `bin_picking` de Trossen Robotics, excluyendo los episodios fuente 4 y 14 como conjunto de test, lo que suma 7.318 fotogramas. El entrenamiento consistió en 30.000 pasos con batch 8 sobre una A100, aproximadamente 1 hora y 50 minutos.

Es relevante como ejemplo de política de imitación de bajo coste computacional (51,7 millones de parámetros, repo de 0,2 GB) entrenada con datos reales y evaluada en simulación. Su utilidad práctica está acotada: solo se ha validado en un simulador, nunca en un robot físico, y su tasa de éxito en el mejor de los casos es del 41,25 % (33 de 80 colocaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 4 cámaras + 14 posiciones articulares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación basada en transformer que predice secuencias de acciones en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación. En este caso, la política recibe las imágenes de cuatro cámaras y las 14 posiciones articulares de una estación bimanual WidowX AI, y emite 14 objetivos articulares en bloques de 100 pasos. El modelo tiene 51.685.006 parámetros y se carga mediante `ACTPolicy.from_pretrained` de LeRobot 0.6 o superior.

El entrenamiento usó 18 grabaciones reales del conjunto público `bin_picking` de Trossen Robotics (Apache-2.0), excluyendo los episodios fuente 4 y 14 para test, con un total de 7.318 fotogramas a la resolución original de las cámaras. Se realizaron 30.000 pasos con batch 8 en una A100 durante aproximadamente 1 hora y 50 minutos. No se documenta uso de RLHF, DPO ni aumento de datos; los pesos publicados corresponden al paso 30.000. La evaluación se hizo en bucle cerrado sobre una copia simulada de la estación, con 20 ejecuciones por cada uno de los dos layouts de test retenidos.

## Capacidades

- Manipulación bimanual de precisión: recoge un vaso rojo y lo coloca en una bandeja transparente.
- Predicción de acciones en bloques de 100 pasos (action chunking) sobre 14 articulaciones.
- Fusión de cuatro vistas de cámara con el estado propioceptivo del robot.
- Ejecución autónoma de una tarea fija sin condicionamiento por instrucción.
- Generalización limitada a variaciones de iluminación y presencia de objetos adicionales en la mesa (evaluada en simulación).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, audio ni visión general; las cámaras se usan solo como entrada de control.

## Casos de uso

- Automatización de bin picking en líneas de montaje: la política puede integrarse en una celda con estación WidowX AI para retirar vasos rojos de una bandeja de entrada y depositarlos en una bandeja de salida, siempre que la tarea y el objeto coincidan con los del entrenamiento.
- Prototipado de políticas de imitación: sirve como referencia reproducible para equipos que quieran evaluar ACT con LeRobot sobre datos reales antes de entrenar sus propios modelos.
- Benchmark de simulación a realidad: útil para comparar el rendimiento de políticas entrenadas con datos reales frente a las entrenadas con datos simulados (`kiteml/trossen-bin-picking-sim-*`) sobre los mismos layouts de test.
- Investigación en robustez a iluminación: los resultados por condición (luz de sala, baja, cálida y con objetos extra) permiten estudiar la sensibilidad de ACT a cambios visuales.
- Docencia y formación en robótica: ejemplo compacto (0,2 GB) y de bajo coste de entrenamiento (menos de 2 horas en una A100) para cursos de aprendizaje por imitación.
- Validación de pipelines de despliegue LeRobot: permite probar la carga de políticas, la integración con el simulador y el bucle cerrado antes de invertir en hardware físico.

## Benchmarks y rendimiento

Evaluación en bucle cerrado sobre una copia simulada de la estación, 20 ejecuciones por condición sobre los dos layouts de test retenidos (episodios fuente 4 y 14). Todas las colocaciones exitosas corresponden al layout en el que el brazo izquierdo recoge el vaso.

| Condición | Colocaciones exitosas |
|---|---|
| Luz de sala | 10 / 20 |
| Luz baja | 8 / 20 |
| Luz cálida | 8 / 20 |
| Objetos extra en la mesa | 7 / 20 |
| Total | 33 / 80 (41,25 %) |

Comparación con la mejor política entrenada sobre los conjuntos simulados `kiteml/trossen-bin-picking-sim-*` (`baseline`, 90.000 pasos): 26 de 80 colocaciones sobre los mismos puntos de partida. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros y pesos en safetensors, la huella es del orden de cientos de MB en precisión nativa, holgadamente por debajo de 4 GB.
- GPU recomendadas: el entrenamiento se realizó en una A100; para inferencia basta una GPU consumer moderna (RTX 3060 o superior) o incluso CPU para pruebas puntuales, aunque no se documentan latencias.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se especifican requisitos mínimos oficiales.
- Opciones de despliegue: LeRobot 0.6 o superior mediante `ACTPolicy.from_pretrained`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kiteml/trossen-bin-picking-act-cup-real` | 51.685.006 | 4 cámaras + 14 posiciones articulares | 33/80 en simulación | Apache-2.0 | Hugging Face |
| `kiteml/trossen-bin-picking-sim-baseline` (90.000 pasos) | no disponible | misma estación simulada | 26/80 en simulación | Apache-2.0 (según repo de datasets) | Hugging Face |
| Otras políticas ACT de LeRobot | no disponible | variable | no disponible | Apache-2.0 | Hugging Face |

La comparación directa con arquitecturas de propósito general (LLM, VLM) no es significativa: se trata de una política de control motor especializada, no de un modelo de lenguaje.

## Limitaciones y advertencias

- Solo se ha probado en simulación; no se ha ejecutado en un robot físico, por lo que el rendimiento real es desconocido.
- No lee instrucciones: está entrenada exclusivamente para el vaso rojo y la bandeja transparente de esa estación.
- Tasa de éxito baja en simulación (41,25 % global) y concentrada en un único layout (brazo izquierdo recoge el vaso).
- Sensible a la iluminación y a la presencia de objetos adicionales: el éxito cae de 10/20 con luz de sala a 7-8/20 en las demás condiciones.
- El simulador usa una foto de la estación real con recortes del vaso real en la cámara baja, lo que puede inflar el rendimiento frente a un entorno sintético puramente renderizado.
- No se documentan sesgos sociales ni riesgo de alucinación en el sentido de los LLM, pero sí riesgo de fallo silencioso en la manipulación (colocaciones incorrectas no detectadas).
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de validación en hardware real desaconseja su despliegue en producción sin una reevaluación previa.
- El conjunto de datos excluye el episodio fuente 17 (su repetición no termina como la grabación), lo que limita la cobertura de variaciones de la tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiteml/trossen-bin-picking-act-cup-real
- Repositorio de tests y límites: https://github.com/kite-ml/trossen-bin-picking-sim-datasets
- Conjunto de datos original de Trossen Robotics (`bin_picking`, Apache-2.0): s3://trossen-public-datasets-977e8d43bcff/bin_picking/
- LeRobot (librería y ACT, Apache-2.0): https://github.com/huggingface/lerobot
- Kite (autor): https://kiteml.com
