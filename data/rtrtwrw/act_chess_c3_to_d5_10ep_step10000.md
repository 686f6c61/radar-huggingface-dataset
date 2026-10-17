# rtrtwrw/act_chess_c3_to_d5_10ep_step10000

## Resumen

`rtrtwrw/act_chess_c3_to_d5_10ep_step10000` es un checkpoint de una política de imitación visomotora basada en ACT (Action Chunking with Transformers), entrenada con LeRobot 0.5.1 para un brazo seguidor SO-101. No es un modelo de lenguaje ni un motor de ajedrez: el término "chess" describe la tarea de manipulación, trasladar una pieza de ajedrez desde la casilla c3 (6 cm) hasta la d5 (10 cm).

El modelo tiene 51.668.614 parámetros y consume tres cámaras a 480x640, además de un estado y una acción de 6 articulaciones. Se entrenó desde cero con 10 episodios (3.422 fotogramas) y corresponde al paso 10.000 de 16.000, por lo que es un checkpoint intermedio y no la versión final.

Su relevancia es acotada: sirve como artefacto de investigación y reproducción para experimentos de imitación con LeRobot y SO-101, no como solución lista para producción. La licencia no está declarada y no hay benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); política de imitación con encoder visual y transformer, con componente CVAE |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de chunking no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint LeRobot) |
| Pipeline | robotics |
| Hardware de robot | SO-101 follower arm, 6 articulaciones |
| Entradas | 3 cámaras a 480x640 y estado de 6 articulaciones |
| Salidas | acciones de 6 articulaciones |
| Dataset | `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741` |
| Entrenamiento | 10 episodios, 3.422 fotogramas, batch 24, paso 10.000 de 16.000 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es una política de imitación que predice un chunk de acciones futuras en lugar de una sola acción por paso, lo que reduce el error compuesto durante la ejecución. La implementación de LeRobot combina un encoder visual para cada cámara con un transformer que fusiona las observaciones y el estado propioceptivo para generar secuencias de acciones. En este checkpoint, la entrada son tres vistas a 480x640 más un vector de estado de 6 articulaciones, y la salida son acciones de 6 articulaciones para el SO-101.

El entrenamiento se realizó desde cero mediante aprendizaje supervisado sobre teleoperación, sin RLHF ni DPO. Se usaron los 10 episodios más cortos del dataset, con 3.422 fotogramas en total, un batch de 24 y 10.000 pasos de un total previsto de 16.000. No se documentan aumentos de datos, composición detallada del dataset ni curvas de aprendizaje; al tratarse de un checkpoint intermedio, no hay evidencia publicada de su tasa de éxito final.

## Capacidades

- Generación de acciones de 6 articulaciones para el brazo SO-101 a partir de tres cámaras y del estado de las articulaciones.
- Ejecución de una tarea de manipulación de corto horizonte: trasladar una pieza de ajedrez de la casilla c3 a la d5.
- Control visomotor reactivo: la política observa las cámaras en cada paso y produce un chunk de acciones.
- No soporta tool calling, function calling ni flujos de agentes.
- No procesa lenguaje natural ni mantiene conversaciones.
- No tiene capacidades de razonamiento simbólico, matemáticas, código o visión general.
- No es multi-tarea: no se ha entrenado para otras casillas, objetos, posiciones o brazos.
- No se documentan capacidades de generalización a cambios de iluminación, fondo, calibración o posición de las cámaras.
- Checkpoint intermedio: puede ejecutar la política, pero no hay una evaluación publicada de su robustez.

## Casos de uso

- Reproducción de experimentos con LeRobot: cargar el checkpoint con `lerobot-record ... --policy.path=rtrtwrw/act_chess_c3_to_d5_10ep_step10000` y ejecutarlo en un SO-101 para reproducir el entrenamiento documentado.
- Baseline en comparación de checkpoints: comparar el paso 10.000 con el checkpoint final de 16.000 pasos y medir tasa de éxito, suavidad de trayectoria y tiempo de ejecución.
- Docencia y formación: usar el repositorio, de solo 0,2 GB, como ejemplo práctico de ACT, action chunking y pipelines de datos en LeRobot.
- Análisis de sobreajuste: estudiar el comportamiento de una política entrenada con solo 10 episodios y 3.422 fotogramas, evaluando cuánto se degrada fuera de las condiciones de recogida.
- Punto de partida para fine-tuning: continuar el entrenamiento con más episodios o con variaciones controladas de posición e iluminación, siempre que la licencia se aclare antes de un uso comercial.
- Pruebas de integración hardware/software: validar la calibración de las tres cámaras, la sincronización de observaciones y la latencia del pipeline de inferencia antes de escalar a otros experimentos.
- Evaluación de robustez en laboratorio: variar la posición inicial de la pieza, la iluminación o el fondo y medir la caída de rendimiento para caracterizar el dominio de validez del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| Tasa de éxito en la tarea c3 a d5 | no disponible |
| MMLU, HumanEval, GSM8K | no aplica (no es un modelo de lenguaje) |
| Comparación con el checkpoint final de 16.000 pasos | no disponible |

## Requisitos de hardware

- VRAM para pesos: 51.668.614 parámetros ocupan aproximadamente 0,21 GB en fp32 y 0,10 GB en fp16/bf16. El consumo real vendrá dominado por las activaciones del encoder visual de tres cámaras a 480x640, no por los pesos.
- GPU recomendadas: no hay requisitos oficiales. Por tamaño, una GPU consumer moderna con 4-8 GB es suficiente en términos de memoria de pesos; para entrenamiento o evaluación con lotes mayores se recomienda una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090.
- GPU de centro de datos: A100 o H100 no son necesarias para inferencia de una política de 51,7 M de parámetros; su uso solo se justifica para entrenamiento a gran escala o barridos de evaluación.
- ¿Cabe en GPU consumer? Sí, en términos de pesos. No hay mediciones publicadas del pico de memoria con las tres cámaras activas.
- Despliegue: LeRobot con PyTorch (`lerobot-record`). vLLM, TGI, llama.cpp y Ollama no aplican porque no es un modelo de lenguaje y no se publican pesos GGUF.
- Latencia y throughput: no disponible. La frecuencia de control dependerá de la GPU, del preprocesado de las tres cámaras y del robot; no se han publicado mediciones.
- Hardware físico: SO-101 follower arm de 6 articulaciones y tres cámaras a 480x640. La calibración de cámaras y del brazo es parte del sistema de despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 51.668.614 | no aplica | Manipulación SO-101, c3 a d5 | no disponible | HuggingFace |
| ACT original (referencia) | no disponible | no aplica | Manipulación robótica con action chunking | no disponible | Paper y código de referencia |
| Diffusion Policy | no disponible | no aplica | Políticas visomotoras mediante difusión | no disponible | Paper y código de referencia |
| VQ-BeT | no disponible | no aplica | Políticas de imitación con discretización de acciones | no disponible | Paper y código de referencia |

No hay datos homogéneos de rendimiento para comparar estos modelos. La comparación relevante para este checkpoint es con otras políticas ACT entrenadas en el mismo dataset o con el checkpoint final de 16.000 pasos, no con modelos de lenguaje.

## Limitaciones y advertencias

- Entrenado con solo 10 episodios y 3.422 fotogramas: riesgo alto de sobreajuste y baja generalización fuera de las condiciones de recogida.
- Checkpoint intermedio (paso 10.000 de 16.000): no es la versión final y no hay evidencia publicada de su tasa de éxito.
- Tarea única y posiciones concretas: no generaliza a otras casillas, objetos, brazos o configuraciones de cámara.
- Sensible a calibración, iluminación, fondo y posición de las cámaras; pequeños cambios de dominio pueden degradar la ejecución.
- No es un modelo de lenguaje ni un motor de ajedrez; no razona sobre reglas, jugadas ni estrategia.
- No soporta tool calling, agentes, conversación ni instrucciones en lenguaje natural.
- Licencia no disponible: no se puede asumir uso comercial sin aclaración previa del autor.
- Dataset de un tercero (`niru-5`): pueden existir sesgos derivados de las demostraciones, del operador y del entorno de recogida.
- No usar en entornos de producción o safety-critical sin una evaluación propia de tasa de éxito, latencia y recuperación de fallos.
- El error compuesto puede aparecer en horizontes largos, aunque el action chunking de ACT lo mitiga parcialmente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/rtrtwrw/act_chess_c3_to_d5_10ep_step10000)
- [Dataset de entrenamiento](https://huggingface.co/datasets/niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741)
- [Perfil del autor](https://huggingface.co/rtrtwrw)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot)
- [Paper de ACT (arXiv:2304.13705)](https://arxiv.org/abs/2304.13705)
- [Repositorio SO-ARM100 / SO-101](https://github.com/TheRobotStudio/SO-ARM100)
