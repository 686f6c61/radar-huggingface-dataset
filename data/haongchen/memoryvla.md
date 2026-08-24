# Haongchen/MemoryVLA

## Resumen

MemoryVLA es un modelo de visión-lenguaje-acción (VLA) diseñado para manipulación robótica de largo horizonte, presentado en el ICLR 2026. Frente a los VLA convencionales que ignoran el contexto temporal, MemoryVLA incorpora un mecanismo de memoria perceptiva-cognitiva inspirado en la memoria de trabajo humana y el sistema hipocampal. El modelo combina un VLM preentrenado (prism-dinosiglip-224px+7b) con un banco de memoria que almacena detalles de bajo nivel y semánticas de alto nivel, y un experto de difusión de acciones que genera secuencias temporales de movimiento.

El checkpoint publicado en Hugging Face corresponde a una tarea específica de clasificación de colores con el robot Piper, entrenado sobre 21 episodios reales (14.300 fotogramas). El VLM base permanece congelado y solo se entrenan los módulos de memoria y el modelo de difusión de acciones (DiT-L). La evaluación open-loop sobre los mismos episodios de entrenamiento reporta un RMSE normalizado de 0,2124 y una precisión del gripper del 98,64 %, aunque estos resultados no reflejan generalización a tareas no vistas.

La relevancia de MemoryVLA reside en su capacidad para manejar tareas no markovianas y de larga duración, un aspecto crítico en manipulación robótica real. El repositorio de Hugging Face organiza los checkpoints por tarea, facilitando la extensión a nuevos escenarios sin sustituir los existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con VLM base (prism-dinosiglip-224px+7b) + banco de memoria perceptiva-cognitiva + modelo de difusion de acciones (DiT-L) |
| Parametros totales | No disponible (el VLM base tiene 7B, pero no se indica el total del modelo completo) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (memoria de 256 entradas, ventana de acciones futuras de 15 pasos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

MemoryVLA se basa en un VLM preentrenado (prism-dinosiglip-224px+7b) que codifica la observación en tokens perceptivos y cognitivos, formando una memoria de trabajo. Un banco de memoria perceptiva-cognitiva almacena detalles de bajo nivel y semánticas de alto nivel consolidados a partir de esta memoria. Durante la inferencia, la memoria de trabajo recupera las entradas relevantes del banco, las fusiona adaptativamente con los tokens actuales y actualiza el banco eliminando redundancias (consolidación tipo TOME). Con estos tokens, un experto de difusión de acciones (DiT-L) genera secuencias de acciones temporalmente coherentes.

El entrenamiento se realizó con el VLM congelado (incluida la última capa del LLM), solo entrenando el modelo de difusión y los módulos de memoria. Se usó una dimensión de acción de 7 (x, y, z, roll, pitch, yaw, gripper), una ventana de acciones futuras de 15, memoria de 256 entradas, 2 capas de recuperación, fusión tipo gate y consolidación tome. El entrenamiento se realizó con FSDP full shard, batch global de 32, learning rate 2e-5 con warmup lineal y decaimiento coseno (warmup ratio 0,03), EMA con decay 0,999, y un máximo de 20.000 pasos. No se usó aumento de imagen y la semilla fue 42.

## Capacidades

- Predicción de acciones robóticas en tareas de manipulación de largo horizonte.
- Manejo de memoria temporal: utiliza bancos de memoria perceptiva y cognitiva con recuperación y consolidación para mantener contexto a lo largo de la tarea.
- Generación de secuencias de acciones mediante difusión (DiT-L), permitiendo salidas de acciones continuas y multimodales.
- Integración con un VLM preentrenado (prism-dinosiglip-224px+7b) para la percepción visual.
- Compatibilidad con tareas reales de robótica: el checkpoint incluye estadísticas de normalización de acciones y configuración de ejecución.
- Capacidad de extensión a múltiples tareas mediante un repositorio organizado por directorios de tarea.

## Casos de uso

- Clasificación y manipulación de objetos por color en entornos reales: el modelo está entrenado para clasificar objetos de colores con un robot Piper, usando solo cámara frontal. Es adecuado para tareas de picking y sorting en entornos de investigación.
- Tareas de manipulación de largo horizonte: gracias a la memoria de trabajo, puede mantener el contexto de acciones previas y objetos manipulados, útil en tareas como apilar bloques o ensamblaje de piezas.
- Control de robots en tiempo real con difusión de acciones: el modelo genera secuencias de 15 acciones futuras, lo que permite planificación y ejecución suave en brazos robóticos.
- Investigación en robótica y VLA: el diseño modular (VLM congelado + memoria + difusión) facilita el estudio de mecanismos de memoria en agentes de manipulación.
- Despliegue en hardware real: el repositorio incluye estadísticas de normalización y configuración para pasar de acciones normalizadas a acciones físicas, con validación de límites del workspace y comportamientos de emergencia.
- Extensión a nuevas tareas: la estructura de directorios permite añadir checkpoints para nuevas tareas (apertura de cajones, inserción de clavijas, etc.) sin reemplazar el modelo actual, facilitando la investigación incremental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de evaluación open-loop sobre los mismos episodios de entrenamiento (21 episodios, 14.300 fotogramas):

| Metrica | Valor |
|---|---|
| RMSE de acciones normalizado | 0,2124 |
| Precisión del gripper | 98,64 % |

Estos resultados son de open-loop (inferencia frame a frame con memoria) sobre el conjunto de entrenamiento y no deben interpretarse como generalización a tareas no vistas. El paper menciona evaluación en 150+ tareas de simulación y mundo real en tres robots, pero los números concretos no están disponibles en esta información.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Dado que el modelo base es un VLM de 7B y el checkpoint pesa 33,7 GB, se requiere una GPU con al menos 16-24 GB de VRAM para inferencia con precisión completa (FP32/FP16), aunque se desconoce el uso de cuantización.
- No se indica si es compatible con GPU de consumo (p. ej., RTX 4090) o si requiere GPUs de datacenter (A100, H100).
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.). El checkpoint está pensado para cargarse con el código MemoryVLA, no con un servidor de inferencia estándar.
- No hay datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos VLA (como OpenVLA, RT-2, etc.) en la documentación proporcionada. No se pueden realizar comparaciones de rendimiento, arquitectura o licencia con alternativas.

## Limitaciones y advertencias

- El checkpoint está entrenado únicamente para la tarea de clasificación de colores con el robot Piper, con solo 21 episodios reales. No es generalizable a otras tareas o robots sin un entrenamiento adicional.
- Los resultados reportados (RMSE 0,2124, precisión gripper 98,64 %) son de open-loop sobre el conjunto de entrenamiento, no de generalización. No se han evaluado tareas no vistas.
- La observación se limita a una cámara frontal; no hay flujo de cámara en la muñeca, lo que puede limitar la precisión en tareas que requieren visión cercana del efector.
- La memoria está limitada a 256 entradas; para tareas más largas o con más objetos, puede ser insuficiente.
- El modelo está pensado para uso en investigación y desarrollo; antes de enviar acciones al hardware real es necesario validar límites del workspace, escalado de acciones, comportamiento de emergencia, calibración de cámara y convención de signos del gripper.
- No se han publicado estudios de sesgos o alucinaciones. Al ser un modelo de difusión de acciones, existe el riesgo de generar acciones no seguras si se usa sin supervisión.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio de Hugging Face solo contiene el checkpoint y la configuración; el código de entrenamiento y evaluación se recomienda en un repositorio de GitHub separado, que no se especifica en esta información.
- No se indican idiomas soportados; el modelo se centra en visión y acciones, no en procesamiento de lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/Haongchen/MemoryVLA
- GitHub (código): https://github.com/shihao1895/MemoryVLA
- Paper (arXiv): https://arxiv.org/abs/2508.19236
- Página del proyecto: https://shihao1895.github.io/MemoryVLA/
- OpenReview: https://openreview.net/forum?id=54U3XHf7qq
