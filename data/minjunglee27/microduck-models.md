# minjunglee27/microduck-models

## Resumen
MicroDuck es un robot bípedo de tamaño diminuto desarrollado por pollen-robotics. Este repositorio de HuggingFace, creado por minjunglee27, contiene políticas de aprendizaje por refuerzo (RL) entrenadas para controlar el robot en simulación MuJoCo y su posterior transferencia al mundo real (sim2real). El modelo se distribuye como redes de políticas preentrenadas en formato ONNX, listas para inferencia en tiempo real, junto con checkpoints de PyTorch y un checkpoint exportado a 750 iteraciones. No se dispone de información sobre la arquitectura de red, el número de parámetros ni el contexto de entrenamiento en la información proporcionada. Es relevante para la comunidad de robótica y RL porque ofrece un punto de partida para investigar el control de robots bípedos de bajo coste y la transferencia de simulaciones a entornos físicos.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | No aplica (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX, PyTorch |

## Arquitectura y entrenamiento
El repositorio indica que se trata de políticas de RL para el robot MicroDuck, entrenadas con PyTorch y exportadas a ONNX. El entorno de simulación es MuJoCo, y se menciona explícitamente la transferencia sim2real, lo que sugiere que las políticas se entrenan en simulación y se despliegan en el robot físico. No se han publicado detalles sobre la arquitectura de la red neuronal (por ejemplo, si es un MLP, una red recurrente o un transformer), la composición del dataset de entrenamiento ni el algoritmo de RL utilizado. Tampoco se indica si se aplicó RLHF, DPO u otras técnicas de optimización posteriores. El único dato concreto es la existencia de un checkpoint exportado a 750 iteraciones.

## Capacidades
- Control de locomoción bípeda para el robot MicroDuck mediante políticas de RL.
- Inferencia en tiempo real gracias a la exportación a ONNX, que permite ejecutar la política en MuJoCo o en el robot físico.
- Disponibilidad de checkpoints en formato PyTorch para continuar el entrenamiento o realizar análisis.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, visión ni audio.
- No se documentan capacidades de razonamiento ni de procesamiento de datos estructurados.

## Casos de uso
- Investigación en control de robots bípedos: el modelo puede usarse como baseline en experimentos de simulación MuJoCo para comparar algoritmos de RL. Es adecuado porque las políticas ya están entrenadas y exportadas a ONNX.
- Transferencia sim2real: las políticas entrenadas en simulación pueden probarse en el robot físico MicroDuck. El repositorio está diseñado específicamente para este propósito.
- Prototipado rápido de marchas: los investigadores pueden cargar las políticas ONNX en MuJoCo y evaluar distintos comportamientos de caminar sin necesidad de reentrenar desde cero.
- Educación en RL y robótica: el modelo sirve como ejemplo práctico de cómo entrenar una política de RL para un robot bípedo y exportarla a un formato desplegable.
- Integración en sistemas embebidos: al usar ONNX, la política puede ejecutarse con ONNX Runtime en microcontroladores o sistemas de bajo consumo, lo que facilita su despliegue en robots reales.
- Benchmarking de algoritmos RL: el entorno MicroDuck y las políticas proporcionadas permiten comparar el rendimiento de diferentes algoritmos de RL en una tarea de locomoción.
- Desarrollo de robots de bajo coste: el enfoque sim2real aplicado a un robot diminuto y accesible puede transferirse a otras plataformas de bajo coste.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Al ser un modelo de control robótico, no se dispone de datos sobre si cabe en una GPU de consumo.
- Opciones de despliegue: MuJoCo para simulación; ONNX Runtime para inferencia en tiempo real.
- Latencia y throughput estimados: no disponible.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que actualmente no contiene archivos de pesos descargables.

## Comparativa con modelos similares
No disponible. No se han proporcionado datos sobre modelos comparables en la información disponible.

## Limitaciones y advertencias
- Licencia no especificada: no se puede determinar si el modelo puede usarse comercialmente.
- Sin benchmarks publicados: no es posible evaluar el rendimiento real del modelo.
- El tamaño del repositorio es 0.0 GB, lo que podría indicar que los pesos no se han subido correctamente o que el repositorio está vacío.
- No hay documentación sobre la arquitectura, el algoritmo de entrenamiento ni los datos utilizados.
- No es un modelo de lenguaje: cualquier intento de usarlo para tareas de NLP o generación de texto fallará.
- La fecha de creación del repositorio es 2026-09-04, lo que podría ser un error o un dato futuro.

## Enlaces
- HuggingFace: https://huggingface.co/minjunglee27/microduck-models
- GitHub del proyecto MicroDuck: https://github.com/pollen-robotics/microduck
