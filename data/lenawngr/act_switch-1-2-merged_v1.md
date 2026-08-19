# lenawngr/ACT_switch-1-2-merged_v1

## Resumen

El modelo `lenawngr/ACT_switch-1-2-merged_v1` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario `lenawngr` y publicada en Hugging Face bajo la librería LeRobot. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la precisión en tareas de manipulación. Este modelo concreto se ha entrenado sobre el dataset `lenawngr/SWITCH-1-2-merged`, que probablemente contiene demostraciones teleoperadas de tareas relacionadas con interruptores o conmutadores.

Con aproximadamente 51,6 millones de parámetros, es un modelo compacto pensado para ejecutarse en hardware modesto, típico en robótica de bajo coste. Su relevancia radica en que demuestra cómo entrenar políticas de control efectivas con pocos recursos y publicarlas de forma reproducible mediante el ecosistema LeRobot. El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer encoder-decoder |
| Parametros totales | 51.597.958 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa observaciones y acciones) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT descrita en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). ACT utiliza un transformer encoder-decoder que recibe observaciones de cámara y estado del robot, y genera una secuencia de acciones futuras (un "chunk") de longitud fija. Esta predicción por lotes reduce la acumulación de errores y permite movimientos más suaves y precisos que los métodos que predicen una sola acción a la vez.

El entrenamiento se realizó con la librería LeRobot de Hugging Face, utilizando el dataset `lenawngr/SWITCH-1-2-merged` (no se especifica el número de episodios ni la composición exacta). No se dispone de información sobre el uso de RLHF, DPO u otras técnicas de refinamiento posterior. El modelo se ha publicado tal cual tras el entrenamiento supervisado de imitación.

## Capacidades

- Control robótico de manipulación: genera comandos de articulación para robots de tipo SO-100 u otros compatibles con LeRobot.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Predicción de chunks de acciones: emite secuencias de acciones de forma simultánea, mejorando la coordinación temporal.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación y registro de LeRobot.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes conversacionales ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas repetitivas en laboratorio: el modelo puede controlar un brazo robótico para accionar interruptores o conmutadores en entornos de prueba, sustituyendo la operación manual.
- Prototipado rápido de políticas de manipulación: gracias a su pequeño tamaño y al ecosistema LeRobot, permite iterar sobre nuevas tareas con pocos datos y hardware accesible.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia entre variantes de tareas (por ejemplo, los modelos `switch-1-top` y `switch-2-top` del mismo autor).
- Educación en robótica: puede usarse en cursos para demostrar el ciclo completo de entrenamiento y despliegue de una política con LeRobot.
- Control de robots de bajo coste: al requerir poca VRAM, es adecuado para plataformas como Raspberry Pi con aceleración neuronal o GPUs de gama baja.
- Evaluación comparativa de métodos de imitación: su arquitectura ACT puede compararse con otras políticas (diffusion policies, etc.) en el mismo banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de tasas de éxito, métricas de precisión ni comparaciones con otros modelos en tareas estándar.

## Requisitos de hardware

- VRAM estimada: al tener ~51,6M parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 200 MB de pesos). Con cuantización (no publicada) sería aún menor.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, Jetson Nano, RTX 3050). También puede ejecutarse en CPU para inferencia no tiempo real.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: LeRobot soporta inferencia local con PyTorch; también puede integrarse en ROS mediante adaptadores. No se mencionan formatos como ONNX o TensorRT.
- Latencia: no disponible; depende del hardware y del tamaño del chunk de acción.

## Comparativa con modelos similares

El autor ha publicado otros dos modelos ACT con el mismo dataset base: `lenawngr/ACT_switch-1-top_v1` y `lenawngr/ACT_switch-2-top_v1`. No se dispone de métricas comparativas entre ellos. En el ecosistema LeRobot existen otras políticas como Diffusion Policy o VQ-BeT, pero no se han encontrado comparaciones directas con este modelo. Por tanto, la comparativa cuantitativa no está disponible.

| Modelo | Arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| lenawngr/ACT_switch-1-2-merged_v1 | ACT | 51,6M | No disponible | Apache 2.0 |
| lenawngr/ACT_switch-1-top_v1 | ACT | No disponible | No disponible | Apache 2.0 |
| lenawngr/ACT_switch-2-top_v1 | ACT | No disponible | No disponible | Apache 2.0 |

## Limitaciones y advertencias

- El modelo está entrenado específicamente para las tareas del dataset `SWITCH-1-2-merged`; no generaliza a otras tareas sin reentrenamiento.
- No hay información sobre la variabilidad de las demostraciones ni sobre posibles sesgos en los datos (por ejemplo, posiciones de cámara fijas, iluminación, etc.).
- Al ser un modelo de imitación, puede fallar ante perturbaciones del entorno no vistas durante el entrenamiento.
- No se han documentado pruebas de robustez ni de seguridad en entornos reales.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento no tengan restricciones adicionales.
- No se proporcionan garantías de rendimiento ni soporte técnico por parte del autor.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lenawngr/ACT_switch-1-2-merged_v1)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Dataset SWITCH-1-2-merged](https://huggingface.co/datasets/lenawngr/SWITCH-1-2-merged)
