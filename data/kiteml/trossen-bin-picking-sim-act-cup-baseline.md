# kiteml/trossen-bin-picking-sim-act-cup-baseline

## Resumen

`trossen-bin-picking-sim-act-cup-baseline` es una política de robótica basada en la arquitectura ACT (Action Chunking Transformer) desarrollada por Kite (kiteml) y publicada bajo licencia Apache-2.0. Resuelve una tarea concreta de manipulación bimanual: una estación WidowX AI debe coger un vaso rojo y depositarlo en una bandeja transparente. El modelo consume las imágenes de cuatro cámaras y las 14 posiciones articulares del robot, y emite 14 objetivos articulares en bloques de 100 pasos de acción.

El modelo tiene 51.685.006 parámetros y se distribuye en formato safetensors con la librería LeRobot (versión 0.6 o superior). No es un modelo de lenguaje: no procesa instrucciones en lenguaje natural ni tiene capacidades de razonamiento general. Es una política de imitación entrenada únicamente sobre los 17 episodios de vaso del split de entrenamiento del dataset `kiteml/trossen-bin-picking-sim-baseline`, que suman 6.867 fotogramas.

Su relevancia es la de un artefacto de referencia para evaluación de políticas robóticas en simulación: el autor publica resultados de evaluación en bucle cerrado sobre dos disposiciones de vaso no vistas durante el entrenamiento, lo que permite medir la generalización ante cambios de iluminación y objetos adicionales. Está pensado exclusivamente para simulación y no se ha probado en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación con codificador visual y decodificador de acciones por chunks |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación multimodal, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación basada en transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación. En esta instancia, la política recibe como entrada cuatro cámaras y 14 posiciones articulares, y produce 14 objetivos articulares por paso, emitiendo 100 pasos de acción por inferencia. No incorpora condicionamiento por instrucción en lenguaje natural: la tarea está fijada al vaso rojo.

El entrenamiento se realizó durante 30.000 pasos con batch de 8 sobre una única GPU A100, partiendo de los 17 episodios de vaso del split de entrenamiento del dataset `kiteml/trossen-bin-picking-sim-baseline` (6.867 fotogramas). Los pesos publicados corresponden al checkpoint de 30.000 pasos. El dataset deriva del `bin_picking` público de Trossen Robotics (Apache-2.0) y los datos se reproducen en simulación. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de ajuste posteriores al entrenamiento por imitación.

## Capacidades

- Manipulación bimanual en simulación: coger un vaso rojo y colocarlo en una bandeja transparente con una estación WidowX AI de dos brazos.
- Fusión multimodal de cuatro cámaras y 14 posiciones articulares como observación.
- Predicción de chunks de 100 pasos de acción con 14 objetivos articulares por paso.
- Ejecución en bucle cerrado sobre una copia simulada de la estación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni procesa instrucciones textuales.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras capacidades fuera de la política motora.

## Casos de uso

- Referencia de evaluación en simulación: sirve como línea base para comparar políticas ACT sobre la misma tarea de recogida de vaso, ya que el autor publica los resultados de ambos checkpoints sobre los mismos arranques.
- Estudio de robustez ante iluminación: permite medir la caída de éxito al pasar de luz de sala (8/20) a luz cálida (0/20) y analizar qué componentes del pipeline visual son sensibles al dominio lumínico.
- Análisis de generalización ante clutter: con objetos adicionales en la mesa el éxito baja a 8/20, lo que lo convierte en un caso útil para estudiar distracciones visuales en políticas de imitación.
- Prototipado de pipelines LeRobot: al cargarse con `ACTPolicy.from_pretrained` en LeRobot 0.6 o superior, sirve para validar integraciones de entrenamiento e inferencia antes de escalar a datasets propios.
- Comparación de estrategias de datos: contrastarlo con `kiteml/trossen-bin-picking-sim-act-cup-all`, entrenado sobre los mismos episodios en siete datasets, permite evaluar el efecto de aumentar la diversidad de condiciones de entrenamiento.
- Docencia e investigación en imitación robótica: tarea acotada, pesos ligeros (0,2 GB de repositorio) y métricas publicadas lo hacen adecuado para prácticas de evaluación en bucle cerrado.
- Base para fine-tuning: al ser Apache-2.0 y tener 51,7 M de parámetros, puede reentrenarse sobre episodios propios de una tarea similar con recursos modestos.

## Benchmarks y rendimiento

Evaluación en bucle cerrado sobre una copia simulada de la estación, 20 ejecuciones por test sobre dos disposiciones de vaso no vistas en entrenamiento. Todas las colocaciones exitosas corresponden a la disposición en la que el brazo izquierdo recoge el vaso.

| Condición de evaluación | Éxitos (este modelo) | Éxitos (`...-act-cup-all`) |
|---|---|---|
| Luz de sala | 8/20 | 2/20 |
| Luz baja | 2/20 | 2/20 |
| Luz cálida | 0/20 | 1/20 |
| Objetos extra en la mesa | 8/20 | 0/20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors en FP32, el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU de entrenamiento documentada: una A100 para 30.000 pasos con batch 8.
- GPU recomendadas para inferencia: cualquier GPU con suficiente memoria para cargar el modelo y las cuatro cámaras; una RTX 4090, A100 o H100 son sobradas. Cabe en GPUs consumer de gama media y baja.
- Despliegue: LeRobot 0.6 o superior mediante `lerobot.policies.act.modeling_act.ACTPolicy`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kiteml/trossen-bin-picking-sim-act-cup-baseline` (este) | 51.685.006 | no aplica | Recogida de vaso, WidowX AI bimanual | Apache-2.0 | Hugging Face, LeRobot |
| `kiteml/trossen-bin-picking-sim-act-cup-all` | no disponible | no aplica | Misma tarea, entrenado con siete datasets | Apache-2.0 (según repo del autor) | Hugging Face |
| Políticas ACT de LeRobot (referencia) | variable | no aplica | Manipulación general | Apache-2.0 | Repositorio LeRobot |

No se dispone de datos de benchmarks comparativos con otras familias de políticas (p. ej. Diffusion Policy) en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que no se ha probado en un robot real, por lo que no hay garantía de transferencia sim-to-real.
- Tarea única y sin condicionamiento por instrucción: únicamente recoge el vaso rojo; no admite otras órdenes ni objetos.
- Sensibilidad a la iluminación: 0/20 en luz cálida y 2/20 en luz baja, frente a 8/20 en luz de sala.
- Sensibilidad a objetos adicionales: el éxito cae a 8/20 con clutter en la mesa.
- Dependencia de la disposición: todos los éxitos se producen en la disposición donde el brazo izquierdo recoge el vaso; no hay evidencia de éxito en la otra disposición.
- Entrenamiento con solo 17 episodios y 6.867 fotogramas: riesgo alto de sobreajuste a las condiciones de grabación.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo deriva de datos de Trossen Robotics también bajo Apache-2.0; conviene revisar los términos del dataset original.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/kiteml/trossen-bin-picking-sim-baseline
- Modelo alternativo entrenado con siete datasets: https://huggingface.co/kiteml/trossen-bin-picking-sim-act-cup-all
- Repositorio con tests, límites y ejecuciones: https://github.com/kite-ml/trossen-bin-picking-sim-datasets
- Sitio del autor (Kite): https://kiteml.com/
