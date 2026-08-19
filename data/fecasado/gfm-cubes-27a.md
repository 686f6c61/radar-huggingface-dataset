# fecasado/gfm-cubes-27a

## Resumen

El modelo `fecasado/gfm-cubes-27a` es una política de control robótico basada en *gaze flow matching*, entrenada con la librería LeRobot de Hugging Face. Está diseñado para ejecutar tareas de manipulación, concretamente la recogida y colocación de cubos en cestas, a partir de observaciones visuales de 320x240 píxeles. El autor, fecasado, lo ha publicado bajo licencia Apache 2.0, lo que permite su uso y modificación tanto en investigación como en aplicaciones comerciales.

Con 75,2 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo relativamente compacto para el ámbito de la robótica. Su relevancia radica en que representa un ejemplo de aplicación de técnicas de *flow matching* al control de robots, un área emergente que busca alternativas a los métodos tradicionales de imitación. Al estar integrado en el ecosistema LeRobot, puede reproducirse, evaluarse y desplegarse fácilmente en robots compatibles.

La fecha de creación (agosto de 2026) indica que es un modelo reciente, aunque aún no cuenta con descargas ni valoraciones en Hugging Face. La información pública disponible es limitada: la model card no especifica detalles sobre arquitectura interna, datos de entrenamiento o rendimiento, por lo que esta ficha se basa únicamente en los metadatos y en el contexto general de la librería LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gaze flow matching (policy de LeRobot) |
| Parametros totales | 75.228.826 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe como *gaze flow matching*, un enfoque que combina la atención visual (gaze) con modelos de *flow matching* para generar trayectorias de control. No se dispone de detalles sobre la red subyacente (número de capas, tipo de atención, etc.) ni sobre el proceso de entrenamiento. La model card indica que se entrenó con la librería LeRobot, utilizando el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que probablemente contiene demostraciones de un robot manipulando cubos y colocándolos en cestas.

No se ha publicado información sobre el número de episodios de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Al ser un modelo de control robótico, es probable que se haya entrenado mediante aprendizaje por imitación (behavior cloning) o *flow matching* condicionado a observaciones visuales, pero estos detalles no están disponibles en la documentación pública.

## Capacidades

- Control de un robot manipulador para tareas de recogida y colocación de objetos (cubos en cestas).
- Procesamiento de observaciones visuales de resolución 320x240 para generar comandos de actuación.
- Integración con el ecosistema LeRobot, lo que permite cargar el modelo y ejecutar inferencia en robots compatibles (por ejemplo, SO-100).
- Posibilidad de evaluar la política mediante el comando `lerobot-record` para capturar episodios de prueba.
- No se han documentado capacidades adicionales como razonamiento, generación de texto, tool calling o soporte multilingüe, ya que no es un modelo de lenguaje.

## Casos de uso

- Automatización de tareas de *picking and placing* en líneas de montaje: el modelo puede controlar un brazo robótico para recoger cubos de una superficie y depositarlos en una cesta, lo que resulta útil en entornos industriales repetitivos.
- Investigación en robótica: sirve como punto de partida para estudiar técnicas de *flow matching* aplicadas al control motor, comparando su rendimiento con otras políticas como ACT o Diffusion Policy.
- Prototipado rápido de soluciones robóticas: gracias a su integración con LeRobot, un desarrollador puede cargar el modelo y probarlo en un robot real o simulado en cuestión de minutos, sin necesidad de entrenar desde cero.
- Benchmarking de políticas de imitación: al ser un modelo pequeño (75M parámetros), puede utilizarse como referencia para medir el impacto de la arquitectura o del dataset en tareas de manipulación.
- Educación y formación: en cursos de robótica o aprendizaje automático, este modelo permite a los estudiantes experimentar con un pipeline completo de entrenamiento e inferencia de políticas robóticas.
- Desarrollo de sistemas de manipulación asistida: combinado con otros módulos, podría integrarse en sistemas que requieran que un robot ordene objetos en contenedores, como en logística o almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas como MMLU, HumanEval o GSM8K, dado que no es un modelo de lenguaje. Tampoco se han reportado tasas de éxito en tareas robóticas, tiempos de inferencia o comparaciones con otras políticas. Se recomienda consultar el repositorio del autor o ejecutar evaluaciones propias mediante las herramientas de LeRobot.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 0,3 GB (300 MB), lo que equivale a unos 75 millones de parámetros en precisión FP32.
- VRAM estimada para inferencia: al ser un modelo compacto, podría ejecutarse en GPUs con 2-4 GB de VRAM, aunque no se ha especificado el consumo exacto. Una RTX 3060 o superior sería suficiente para pruebas locales.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4). Para entrenamiento, se necesitaría mayor capacidad, pero no se dispone de datos.
- Compatibilidad con hardware consumer: sí, dado su tamaño reducido, es viable en equipos de escritorio con GPU moderna.
- Opciones de despliegue: LeRobot ofrece scripts de entrenamiento e inferencia. También puede usarse con librerías de serialización como safetensors para cargar los pesos en frameworks de PyTorch.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la frecuencia de control del robot (típicamente 10-50 Hz).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. Existen otros repositorios con el tag `gaze_flow_matching` en Hugging Face (por ejemplo, `fecasado/gfm-cubes-25a`), pero no se han publicado especificaciones detalladas ni resultados que permitan una comparación objetiva. Se recomienda revisar el listado de modelos con este tag para identificar alternativas, aunque los datos de rendimiento son escasos.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para una tarea (cubos a cestas) con observaciones de 320x240; su generalización a otras tareas o entornos no está garantizada.
- No se han documentado sesgos ni riesgos de alucinación, al no ser un modelo generativo de texto. Sin embargo, como política robótica, puede fallar ante variaciones no vistas en el entrenamiento (cambios de iluminación, posiciones de objetos, etc.).
- La ausencia de benchmarks públicos impide conocer su tasa de éxito real en condiciones de producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento en entornos reales.
- Es necesario validar la seguridad del modelo antes de desplegarlo en robots físicos, ya que no se han publicado evaluaciones de robustez ni de seguridad.
- La documentación es muy limitada; la model card no incluye detalles de arquitectura ni de entrenamiento, lo que dificulta la reproducibilidad y el mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-27a
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset utilizado: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Listado de modelos con tag `gaze_flow_matching`: https://huggingface.co/models?other=gaze_flow_matching
