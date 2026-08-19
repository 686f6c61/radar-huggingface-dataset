# jujeongho/Qwen3.5-0.8B-LoRA-Welding-Defect-Detection

## Resumen

El modelo `jujeongho/Qwen3.5-0.8B-LoRA-Welding-Defect-Detection` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base Qwen3.5-0.8B, el miembro más pequeño de la familia Qwen3.5 desarrollada por Alibaba Cloud. Este adaptador está diseñado específicamente para la detección de defectos en soldaduras a partir de imágenes, aprovechando la capacidad multimodal del modelo base (entrada de imagen y texto). El repositorio incluye los pesos completos del modelo base junto con el adaptador, con un total de 852.985.920 parámetros y un tamaño de 1,7 GB en formato safetensors.

La relevancia de este modelo radica en que combina un modelo multimodal compacto (0,8B parámetros) con un ajuste fino orientado a una tarea industrial concreta: la inspección visual de calidad en procesos de soldadura. Al ser un LoRA, permite actualizaciones eficientes del modelo sin necesidad de reentrenar todos los parámetros, y su tamaño reducido facilita el despliegue en entornos con recursos limitados, como dispositivos edge o GPUs de consumo. Sin embargo, la documentación disponible es muy escasa: la model card está prácticamente vacía y no se proporcionan detalles sobre el dataset de entrenamiento, el procedimiento de ajuste ni los resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-0.8B (hybrid gated delta networks) + adaptador LoRA |
| Parametros totales | 852.985.920 (modelo base + adaptador) |
| Parametros activos | no disponible (el adaptador LoRA tiene una fracción pequeña, pero no se especifica) |
| Longitud de contexto | 262.144 (262K, según documentación del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 es multilingüe, pero no se especifica para este adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B utiliza una arquitectura híbrida denominada *gated delta networks*, que combina mecanismos de atención con capas recurrentes o de estado para mejorar la eficiencia en el procesamiento de secuencias largas. Con 0,8 mil millones de parámetros y una ventana de contexto de 262K tokens, está diseñado para tareas multimodales (imagen y texto) y para despliegue en dispositivos con recursos limitados, como Jetson o hardware edge. El adaptador LoRA añade pesos de bajo rango sobre las capas del modelo base, lo que permite especializarlo en la detección de defectos de soldadura sin modificar los pesos originales.

No se dispone de información sobre el entrenamiento del adaptador: no se documentan los datos utilizados, el número de tokens, el procedimiento de ajuste (por ejemplo, si se usó RLHF o DPO) ni los hiperparámetros. La model card indica "More Information Needed" en todas las secciones relevantes. Tampoco se especifica si el adaptador fue entrenado con imágenes de soldaduras etiquetadas, aunque por el nombre del repositorio se infiere que la tarea es clasificación o detección de defectos en imágenes de uniones soldadas.

## Capacidades

- Detección de defectos de soldadura a partir de imágenes, utilizando la entrada visual del modelo base Qwen3.5-0.8B.
- Generación de texto descriptivo o informes sobre las imágenes analizadas (capacidad inherente al modelo base).
- Razonamiento multimodal básico: el modelo base puede combinar información visual y textual para responder consultas.
- Soporte de tool calling y function calling (capacidad del modelo base, no confirmada para el adaptador).
- Capacidades multilingües del modelo base, aunque no se especifica si el adaptador conserva estas capacidades.
- Sin información sobre soporte de agentes, multi-step reasoning ni modos de pensamiento especiales.

## Casos de uso

- Inspección de calidad en líneas de soldadura industrial: el modelo puede analizar imágenes de uniones soldadas y clasificarlas como defectuosas o aceptables, ayudando a automatizar el control de calidad en plantas de fabricación.
- Mantenimiento predictivo: integrado en sistemas de visión por computador, el modelo puede detectar anomalías en soldaduras de tuberías, estructuras metálicas o componentes electrónicos antes de que fallen.
- Documentación automatizada de inspecciones: a partir de una imagen, el modelo puede generar un informe textual describiendo el tipo de defecto observado (porosidad, grietas, falta de penetración, etc.), reduciendo el trabajo manual de los inspectores.
- Asistencia a operarios en tiempo real: desplegado en un dispositivo móvil o cámara inteligente, el modelo puede proporcionar retroalimentación inmediata durante el proceso de soldadura, señalando posibles defectos.
- Control de calidad en entornos remotos o de difícil acceso: al ser un modelo compacto, puede ejecutarse en drones o robots de inspección que capturen imágenes de soldaduras en infraestructuras críticas.
- Formación y simulación: el modelo puede utilizarse en entornos educativos para mostrar ejemplos de defectos de soldadura y sus características, ayudando a formar a nuevos inspectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (precisión, recall, F1, etc.) ni comparaciones con otros modelos de detección de defectos. Tampoco se proporcionan datos sobre el rendimiento del adaptador en tareas estándar como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en una tarea visual concreta.

## Requisitos de hardware

- Al tener 0,8B parámetros en total (modelo base + adaptador), el modelo puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM en FP16. En cuantización de 8 bits, podría caber en 2-3 GB, aunque no se especifican cuantizaciones disponibles.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) o superiores. También es compatible con hardware edge como NVIDIA Jetson Orin, según la documentación del modelo base.
- Opciones de despliegue: al ser un modelo de la familia Qwen3.5, es compatible con vLLM, llama.cpp, Ollama (existe una entrada `qwen3.5:0.8b` en Ollama) y Transformers de HuggingFace. Para el adaptador LoRA, se puede cargar mediante la API de PEFT en Transformers.
- Latencia y throughput: no se han publicado datos específicos. Dado el tamaño reducido, se espera una latencia baja en hardware moderno, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de detección de defectos de soldadura. No hay datos de rendimiento ni de características específicas del adaptador. Como referencia, se puede comparar con el modelo base Qwen3.5-0.8B sin el adaptador, que está disponible en varios formatos (Ollama, vLLM, Qualcomm AI Hub), pero no se conocen diferencias de rendimiento en la tarea de detección de defectos. Tampoco se han encontrado otros adaptadores LoRA similares en el Hub con documentación pública.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos de alucinación o limitaciones específicas del adaptador. Se desconocen los datos de entrenamiento y su posible sesgo hacia ciertos tipos de soldaduras o materiales.
- Al ser un adaptador LoRA, su rendimiento depende en gran medida del modelo base. Si el modelo base tiene alucinaciones en la descripción de imágenes, el adaptador podría heredarlas.
- No se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- La ausencia de documentación sobre el dataset de entrenamiento impide evaluar la generalización del modelo a diferentes tipos de soldaduras, condiciones de iluminación o cámaras.
- El modelo está pensado para la detección de defectos en imágenes, pero no se han publicado métricas de precisión ni recall, por lo que no se puede garantizar su fiabilidad en entornos críticos sin una validación adicional.
- El tamaño del repositorio (1,7 GB) sugiere que incluye los pesos completos del modelo base, no solo el adaptador. Esto puede complicar la distribución si se pretende compartir únicamente el adaptador.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jujeongho/Qwen3.5-0.8B-LoRA-Welding-Defect-Detection
- Documentación del modelo base Qwen3.5-0.8B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/iot/models/qwen3_5_0_8b
- Qwen3.5-0.8B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-0-8b/
- Entrada de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Repositorio no oficial de Qwen3.5 en GitHub: https://github.com/jprbom/Qwen3.5
