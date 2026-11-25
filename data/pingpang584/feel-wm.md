# pingpang584/feel-wm

## Resumen

Feel-WM es un modelo del mundo (world model) orientado a robótica y navegación off-road, publicado por el usuario pingpang584 en Hugging Face. Se trata del checkpoint `tartandrive1` asociado al artículo "Feeling Terrain Before Crossing: World Models for Off-Road Navigation" (arXiv:2609.19863), cuyo código acompaña en el repositorio de GitHub del autor. El modelo está entrenado exclusivamente sobre el conjunto de datos TartanDrive 1.0 y su propósito es predecir la evolución del entorno y las consecuencias de las acciones del vehículo para planificar trayectorias en terreno irregular.

La relevancia del modelo radica en su enfoque de planificación en lazo abierto sobre datos reales de conducción off-road, una tarea donde los modelos de lenguaje generalistas no aportan valor directo. El repositorio es pequeño (0,2 GB) y los pesos se distribuyen en formato safetensors bajo licencia MIT, lo que facilita su inspección y reutilización. No se dispone de información sobre arquitectura interna, número de parámetros ni longitud de contexto en la documentación proporcionada.

El modelo se publica como un artefacto de investigación reproducible: incluye estadísticas de normalización (`norm_stats.json`), particiones de entrenamiento (`splits.json`) y un script de ejemplo (`example.py`) para ejecutar la inferencia. Su ámbito de aplicación es acotado (robótica off-road) y su adopción requiere el código del repositorio y pesos de DINOv2 descargados por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world model para robótica; el pipeline declarado es robotics) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada multimodal de percepción robótica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card lo describe como un world model para navegación off-road y el pipeline de Hugging Face lo clasifica como `robotics`. El checkpoint `tartandrive1` se entrena únicamente sobre TartanDrive 1.0, y la propia model card indica que este conjunto no contiene etiquetas de fallo, por lo que el modelo carece de cabeza de riesgo de fallo (failure-risk head). El repositorio incluye `splits.json` con las secuencias de entrenamiento y `norm_stats.json` con las estadísticas de normalización, que deben reutilizarse también al evaluar sobre TartanDrive 2.0.

En cuanto a los datos, el entrenamiento se limita a TartanDrive 1.0. Para la evaluación zero-shot sobre TartanDrive 2.0, los pesos no vieron datos de TD2; únicamente el prior de acciones del planificador CEM proviene de acciones de entrenamiento de TD2. El modelo emplea pesos de DINOv2 como extractor de características, descargados por separado y no incluidos en el repositorio. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable por otra parte en un modelo no lingüístico.

## Capacidades

- Predicción de dinámica del entorno para navegación off-road: el modelo anticipa la evolución del terreno y las consecuencias de las acciones del vehículo.
- Planificación de trayectorias en lazo abierto, evaluada con métricas ADE (error de desplazamiento absoluto) y RTE (error de trayectoria relativo) en metros.
- Evaluación zero-shot sobre un conjunto de datos distinto (TartanDrive 2.0) sin reentrenamiento sobre él.
- Integración con un planificador basado en el método CEM (Cross-Entropy Method) para la selección de acciones.
- Extracción de características visuales mediante DINOv2 (dependencia externa, no incluida en los pesos).
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling ni agentes multi-paso.
- No dispone de cabeza de riesgo de fallo en este checkpoint, al no existir etiquetas de fallo en TartanDrive 1.0.

## Casos de uso

- Navegación autónoma de vehículos off-road: el modelo predice la evolución del terreno y permite planificar trayectorias en lazo abierto, adecuado para robots que operan en pistas no estructuradas.
- Evaluación comparativa de world models: sirve como referencia reproducible para contrastar arquitecturas de predicción de dinámica sobre TartanDrive 1.0 con métricas ADE y RTE.
- Investigación en planificación con CEM: el prior de acciones del planificador puede reutilizarse para estudiar la sensibilidad del rendimiento a la distribución de acciones.
- Pruebas de generalización zero-shot: el checkpoint permite medir la transferencia de TD1 a TD2 sin reentrenamiento, útil para estudiar robustez ante cambios de dominio.
- Prototipado en robótica de bajo coste: al ocupar 0,2 GB y distribuirse en safetensors, es viable integrarlo en entornos de laboratorio con recursos limitados.
- Reproducción de resultados académicos: el paquete incluye `splits.json`, `norm_stats.json` y `example.py`, lo que facilita replicar las cifras del artículo.
- Desarrollo de pipelines de percepción con DINOv2: sirve de base para experimentar con extractores de características visuales en tareas de predicción de movimiento.

## Benchmarks y rendimiento

Resultados de planificación en lazo abierto sobre la partición de validación, con ADE y RTE en metros:

| Datos (variante de configuración) | ADE | RTE | Consultas |
|---|---|---|---|
| TartanDrive 1.0 (`td1`) | 1,666 | 0,552 | 98 |
| TartanDrive 2.0, zero-shot (`td1_td2eval`) | 3,439 | 1,016 | 96 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otros world models.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,2 GB) sugiere un modelo ligero, pero no se documenta el consumo real.
- GPU recomendadas: no disponible; al emplear DINOv2 como extractor de características, se requiere una GPU capaz de ejecutar dicho modelo, cuyo peso se descarga por separado.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; por el tamaño del repositorio es plausible, pero no se confirma.
- Opciones de despliegue: ejecución mediante el script `example.py` del repositorio, con instalación del paquete vía `pip install -e ".[features]"` y descarga de pesos con `huggingface_hub`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros world models comparables ni datos que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El checkpoint está entrenado solo con TartanDrive 1.0; su generalización a otros dominios no está garantizada y el rendimiento zero-shot en TD2 empeora notablemente (ADE 3,439 frente a 1,666).
- Carece de cabeza de riesgo de fallo, por lo que no puede estimar probabilidades de fallo en la navegación.
- No es un modelo lingüístico: no soporta generación de texto, razonamiento, código ni tool calling.
- Las métricas publicadas se basan en un número reducido de consultas (98 y 96), lo que limita la significación estadística de los resultados.
- Requiere dependencias externas (DINOv2) no incluidas en el repositorio, lo que añade pasos de configuración y posibles incompatibilidades.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio concreto antes de producción.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de predicciones erróneas del entorno en escenarios fuera de la distribución de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pingpang584/feel-wm
- Artículo: https://arxiv.org/abs/2609.19863
- Código: https://github.com/pingpang584/feel-wm
