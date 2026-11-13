# caspar/ACT-so101-pickplace-sim-150-2500-v1.0

## Resumen

ACT-so101-pickplace-sim-150-2500-v1.0 es una política de control robótico basada en el algoritmo ACT (Action Chunking with Transformers), publicada por el usuario caspar en Hugging Face. No se trata de un modelo de lenguaje, sino de un paquete de política nativo de LeRobot 0.6.1 que predice acciones articulares de 6 dimensiones a partir de un estado de 6 dimensiones y tres cámaras RGB (superior y de muñeca) con resolución 3 x 240 x 320. El modelo está entrenado sobre el conjunto de datos de simulación `caspar/so101_pickplace_sim_150` durante 2.500 pasos de optimización.

El modelo resuelve la tarea concreta de pick-and-place (recoger y colocar) en el entorno simulado del robot SO-101. Su relevancia es acotada: se publica como checkpoint final de una comparación pareada de políticas ACT, sin selección de checkpoint guiada por test, y con verificación de integridad (SHA256 del checkpoint original, activos de preprocesado y tensores finitos). No se ejecutó entrenamiento, inferencia ni rollout nuevo para esta subida.

Con 51.617.414 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a investigación en robótica de manipulación dentro de simulación. La model card advierte explícitamente de que los resultados históricos de éxito en simulación no constituyen validación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone ResNet18, encoder/decoder Transformer y CVAE |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk de acciones de tamaño 50) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/quantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (paquete LeRobot 0.6.1 con pesos, configuracion de politica, pre/postprocesadores y tensores de normalizacion) |

## Arquitectura y entrenamiento

La arquitectura es ACT: un backbone ResNet18 inicializado con pesos de ImageNet que procesa las tres cámaras RGB (3 x 240 x 320), un encoder/decoder Transformer y un componente CVAE. El modelo predice acciones articulares de 6 dimensiones a partir de un estado de 6 dimensiones, con un tamaño de chunk de acciones de 50. Los nombres de cámara y la normalización deben coincidir exactamente con la configuración guardada.

El entrenamiento se realizó sobre el dataset `caspar/so101_pickplace_sim_150` durante 2.500 pasos de optimización. La model card aclara que el sufijo `_150` del nombre del dataset no implica 150 episodios retenidos: ese dataset contiene 117 episodios, mientras que el dataset básico contiene 43. El checkpoint de 10K pasos pertenece a una ejecución separada de la comparación de 2.500 pasos. No se incluyen estados del optimizador, demostraciones fuente ni credenciales. No se dispone de información sobre composición detallada del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Predicción de acciones articulares de 6 dimensiones para el robot SO-101 en simulación.
- Procesamiento multimodal de entrada: estado de 6 dimensiones más tres cámaras RGB (superior y de muñeca) a 3 x 240 x 320.
- Generación de chunks de acciones de tamaño 50 (action chunking).
- Ejecución de la tarea de pick-and-place en el entorno simulado asociado al dataset de entrenamiento.
- Integración nativa con el ecosistema LeRobot 0.6.1 (política, preprocesador y postprocesador incluidos).
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni capacidades multilingües.

## Casos de uso

- Investigación en imitación robótica: servir como checkpoint de referencia en comparaciones pareadas de políticas ACT, dado que se publica como final de una comparación sin selección de checkpoint guiada por test.
- Reproducción de experimentos en simulación: cargar el paquete con `ACTPolicy.from_pretrained` y ejecutar rollouts en el simulador de `physicalai_tutorial` con las semillas registradas.
- Base para fine-tuning en tareas de pick-and-place: al ser un paquete LeRobot completo con configuración y normalización, puede reutilizarse como punto de partida para nuevos datasets de manipulación.
- Evaluación de pipelines de pre/postprocesado: útil para verificar que la normalización de observaciones y la conversión de acciones a unidades articulares se aplican correctamente en despliegues LeRobot.
- Estudio de action chunking: el tamaño de chunk de 50 permite analizar el compromiso entre frecuencia de replanificación y suavidad de trayectorias en control de manipuladores.
- Docencia y prototipado en robótica de manipulación: modelo compacto (51,6 M de parámetros, 0,2 GB) adecuado para entornos con recursos limitados y para demostrar el flujo completo de entrenamiento y evaluación en simulación.
- Verificación de integridad de artefactos: el paquete incluye SHA256 del checkpoint original y activos de procesado, lo que facilita auditorías de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `training_summary.json` y `evaluation.json` para los ajustes originales de la ejecución y los resultados históricos de simulación, pero no se proporcionan cifras concretas de tasa de éxito ni métricas comparativas en la información disponible. Se advierte de que las tasas de éxito históricas en simulación están ligadas a las semillas y al criterio de éxito registrados y no constituyen validación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors (aproximadamente 206 MB en fp32), la huella de pesos es reducida y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con soporte para PyTorch y LeRobot 0.6.1 debería ser suficiente, incluidas RTX 4090 y superiores, así como A100/H100 para entrenamiento.
- Cabe en GPU consumer: sí, por el reducido número de parámetros, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: LeRobot 0.6.1 (`ACTPolicy.from_pretrained`), con descarga fijada mediante `hf download ... --revision v1.0`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT-so101-pickplace-sim-150-2500-v1.0 | 51,6 M | chunk de 50 acciones | Pick-and-place SO-101 en simulacion | Apache 2.0 | Hugging Face (LeRobot 0.6.1) |
| Checkpoint ACT 10K del mismo autor | no disponible | no disponible | Comparacion separada sobre el mismo dataset | no disponible | Mencionado en la model card, sin ID confirmado |
| Alternativas ACT de LeRobot | no disponible | no disponible | Politicas de imitacion generales | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Los resultados históricos de simulación no constituyen validación en robot real; deben interpretarse ligados a las semillas y al criterio de éxito registrados.
- No se ejecutó entrenamiento, inferencia ni rollout nuevo para esta publicación; la verificación se limitó a SHA256, activos de procesado y tensores finitos.
- El nombre `_150` del dataset no implica 150 episodios: contiene 117 episodios (el dataset básico, 43).
- El checkpoint de 10K pasos es una ejecución separada y no forma parte de esta comparación de 2.500 pasos.
- Es imprescindible usar los pre/postprocesadores del paquete; cargar solo la red neuronal no aplica la normalización ni la conversión de acciones a unidades articulares.
- Los nombres de cámara y la normalización deben coincidir con la configuración guardada; cualquier desviación invalida las predicciones.
- No se incluyen estados del optimizador, demostraciones fuente ni credenciales, lo que limita la reproducibilidad completa del entrenamiento.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no es lingüístico; su alcance se restringe a la tarea y al entorno simulados.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y aviso, aunque la validación en producción real no está cubierta por la evidencia publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/ACT-so101-pickplace-sim-150-2500-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/caspar/so101_pickplace_sim_150
- Repositorio con scripts de entrenamiento, evaluación y simulador: https://github.com/ady95/physicalai_tutorial
- LeRobot (librería): no se proporciona enlace directo en la información disponible.
