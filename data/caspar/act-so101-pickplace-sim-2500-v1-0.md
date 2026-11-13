# caspar/ACT-so101-pickplace-sim-2500-v1.0

## Resumen

ACT-so101-pickplace-sim-2500-v1.0 es una política de robótica basada en la arquitectura ACT (Action Chunking with Transformers) publicada por el usuario caspar en Hugging Face. No es un modelo de lenguaje: es un paquete de política nativo de LeRobot 0.6.1 que predice acciones articulares de 6 dimensiones a partir de un estado de 6 dimensiones y dos cámaras RGB (superior y de muñeca) de resolución 3x240x320. Está entrenada específicamente para la tarea de recogida y colocación (pick-and-place) del brazo robótico SO101 en simulación.

El modelo se entrenó durante 2.500 pasos de optimización sobre el dataset `caspar/so101_pickplace_sim` y se publica como checkpoint final de un experimento comparativo, sin selección de checkpoint guiada por test. El paquete incluye los pesos originales, la configuración de la política, los definidores de preprocesador y postprocesador, y los tensores de normalización, lo que permite reproducir la inferencia tal como se registró.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para quien trabaje con LeRobot y el brazo SO101, y como ejemplo de empaquetado completo de una política ACT con procesadores asociados. No hay validación en robot real ni resultados de benchmarks publicados más allá de los archivos de evaluación históricos incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone ResNet18, encoder/decoder Transformer y CVAE |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; usa chunk de acciones de tamaño 50) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (paquete LeRobot con configuración y procesadores) |

## Arquitectura y entrenamiento

La política sigue la arquitectura ACT, que combina un backbone convolucional ResNet18 inicializado con pesos de ImageNet, un encoder y decoder Transformer y un módulo CVAE. La entrada son dos cámaras RGB (superior y de muñeca) de 3x240x320 más un vector de estado de 6 dimensiones; la salida es un chunk de 50 acciones articulares de 6 dimensiones. Los nombres de cámara y la normalización deben coincidir exactamente con la configuración guardada.

El entrenamiento se realizó durante 2.500 pasos de optimización sobre el dataset `caspar/so101_pickplace_sim`, que contiene 117 episodios en la variante `_150` y 43 episodios en la versión básica. Según la model card, no se ejecutó entrenamiento nuevo, inferencia ni rollout en simulador para esta subida: se verificó el SHA256 del checkpoint original, los assets de procesadores y la finitud de los tensores. El checkpoint de 10K pasos pertenece a una ejecución distinta. No se incluyen estados del optimizador, demostraciones fuente ni credenciales.

## Capacidades

- Predicción de acciones articulares de 6 dimensiones para el brazo SO101 a partir de observaciones visuales y de estado.
- Procesamiento de dos cámaras RGB simultáneas (superior y de muñeca) a 3x240x320.
- Generación de chunks de acción de tamaño 50, lo que permite ejecutar secuencias de control sin replanificar en cada paso.
- Integración nativa con LeRobot 0.6.1 mediante `ACTPolicy.from_pretrained`, incluyendo preprocesador y postprocesador para normalización y conversión a unidades articulares.
- Tarea específica de pick-and-place en simulación; no se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento.
- No dispone de capacidades de visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos en LeRobot: cargar el paquete con `ACTPolicy.from_pretrained` y ejecutar la política en el simulador de `physicalai_tutorial` para replicar el pipeline de entrenamiento e inferencia con las mismas semillas y criterio de éxito.
- Punto de partida para fine-tuning en SO101: usar el checkpoint como inicialización para nuevas tareas de manipulación sobre el mismo brazo, aprovechando el backbone ResNet18 preentrenado en ImageNet y la configuración de cámaras ya definida.
- Comparativa de políticas ACT: servir como referencia de un entrenamiento de 2.500 pasos frente al checkpoint de 10K de otra ejecución, para estudiar el efecto del número de pasos en la tasa de éxito en simulación.
- Validación de empaquetado LeRobot: emplear el repositorio como ejemplo de paquete completo con pesos, configuración, preprocesador, postprocesador y tensores de normalización, útil para verificar flujos de carga y despliegue.
- Docencia y tutoriales de robótica de imitación: ilustrar el ciclo completo de una política ACT con CVAE, chunking de acciones y doble cámara en un entorno simulado reproducible.
- Pruebas de integración de infraestructura: verificar pipelines de descarga con revisión fijada (`--revision v1.0`) y de carga de políticas en entornos LeRobot 0.6.1 antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `training_summary.json` y `evaluation.json` para los resultados históricos de simulación, pero advierte que no constituyen validación en robot real y que deben interpretarse ligados a las semillas y al criterio de éxito registrados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros y un backbone ResNet18, la huella en FP32 es de aproximadamente 0,2 GB de pesos, más activaciones de las dos cámaras 3x240x320.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna es suficiente en la práctica, aunque no se documenta un mínimo oficial.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM, si bien el dato no está confirmado en la información proporcionada.
- Opciones de despliegue: LeRobot 0.6.1 con `ACTPolicy.from_pretrained` y los pre/postprocesadores del propio directorio; el simulador y los scripts están en el repositorio `physicalai_tutorial`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT-so101-pickplace-sim-2500-v1.0 | 51,6 M | no aplica (chunk de 50 acciones) | Pick-and-place SO101 en simulación | Apache 2.0 | Hugging Face |
| Checkpoint ACT 10K del mismo autor | no disponible | no aplica | Pick-and-place SO101 en simulación | no disponible | Ejecución separada, no incluida en este repo |
| Otras políticas ACT para LeRobot | no disponible | no aplica | Manipulación genérica | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de otros autores en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenada exclusivamente en simulación; las tasas de éxito históricas no constituyen validación en robot real.
- Tarea y morfología específicas: solo predice acciones de 6 dimensiones para el SO101 en pick-and-place; no es transferible sin fine-tuning.
- Los nombres de cámara y la normalización deben coincidir con la configuración guardada; cargar solo la red neuronal sin los procesadores produce resultados incorrectos.
- El nombre `_150` del dataset no implica 150 episodios retenidos: la variante `_150` contiene 117 episodios y la básica 43.
- El checkpoint de 10K pasos pertenece a una ejecución distinta y no es comparable directamente con este de 2.500 pasos.
- No se incluyen estados del optimizador, demostraciones fuente ni credenciales, lo que limita la reproducibilidad completa del entrenamiento.
- No se ejecutó entrenamiento, inferencia ni rollout nuevos para esta publicación; la verificación se limitó a integridad de checkpoint, assets y tensores.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en hardware real desaconseja su despliegue en producción sin evaluación propia.
- Riesgo de alucinación y sesgos lingüísticos: no aplica, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/ACT-so101-pickplace-sim-2500-v1.0
- Repositorio de scripts y simulador: https://github.com/ady95/physicalai_tutorial
- Dataset de entrenamiento: https://huggingface.co/datasets/caspar/so101_pickplace_sim
