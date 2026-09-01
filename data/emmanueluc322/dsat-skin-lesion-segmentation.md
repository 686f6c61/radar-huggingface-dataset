# emmanueluc322/DSAT-Skin-Lesion-Segmentation

## Resumen

DSAT-Skin-Lesion-Segmentation es un modelo de segmentación semántica de lesiones cutáneas basado en la arquitectura DSAT (Dual Attention Self-Attention Transformer), desarrollado por EmmanuelUka. El modelo está diseñado para abordar el problema de la segmentación automática de lesiones en imágenes dermatoscópicas, una tarea crítica para el diagnóstico asistido por ordenador de enfermedades como el melanoma. Se entrena sobre el dataset IMA++, descrito como el mayor conjunto de datos públicos de segmentación de lesiones cutáneas con múltiples anotadores.

La relevancia actual del modelo radica en la creciente demanda de herramientas de análisis de imagen médica que reduzcan la carga de trabajo de los dermatólogos y mejoren la precisión diagnóstica. Aunque la información pública disponible es limitada, el repositorio asociado indica que se trata de una arquitectura novedosa que combina mecanismos de atención dual y self-attention, lo que podría ofrecer ventajas frente a arquitecturas convolucionales clásicas como U-Net. El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial y académico.

No se dispone de detalles sobre el tamaño del modelo, la longitud de contexto, los idiomas soportados ni los formatos de pesos, ya que la model card de HuggingFace solo incluye la licencia. Toda la información técnica adicional proviene del repositorio de GitHub asociado, que describe la arquitectura y el dataset, pero no ofrece especificaciones numéricas completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSAT (Dual Attention Self-Attention Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura DSAT (Dual Attention Self-Attention Transformer) es una propuesta novedosa para segmentación de imágenes, según se describe en el repositorio de GitHub del autor. Combina mecanismos de atención dual (probablemente atención espacial y de canal) con bloques de self-attention, lo que permite capturar dependencias de largo alcance en la imagen, algo que las redes totalmente convolucionales tradicionales manejan peor. No se han publicado detalles sobre el número de capas, dimensiones ocultas o el diseño exacto de los bloques de atención.

El entrenamiento se realiza sobre el dataset IMA++, que se caracteriza por incluir múltiples anotadores por imagen, lo que permite abordar la variabilidad inter-observador en la delineación de lesiones. No se especifica el número de imágenes, el número de épocas, la función de pérdida ni las métricas de validación utilizadas. Tampoco se menciona si se emplearon técnicas de aumento de datos, preentrenamiento o ajuste fino. La ausencia de estos datos impide evaluar la robustez del entrenamiento.

## Capacidades

- Segmentación de lesiones cutáneas en imágenes dermatoscópicas: el modelo identifica y delimita regiones correspondientes a lesiones de piel, como melanomas, nevus o carcinomas.
- Procesamiento de imágenes médicas de entrada variable: al ser un modelo de visión, acepta imágenes como entrada y produce máscaras de segmentación.
- Manejo de anotaciones múltiples: al entrenarse con IMA++, el modelo puede estar diseñado para aprender a partir de anotaciones inconsistentes entre expertos, aunque no se detalla cómo se fusionan o ponderan.
- No se han documentado capacidades de generación de texto, tool calling, agentes o razonamiento multimodal, ya que es un modelo puramente visual.

## Casos de uso

- Asistencia al diagnóstico dermatológico: el modelo puede utilizarse como herramienta de apoyo para que los dermatólogos delimiten automáticamente lesiones en imágenes dermatoscópicas, reduciendo el tiempo de análisis manual y mejorando la consistencia entre evaluaciones.
- Triaje de pacientes en telemedicina: integrado en plataformas de consulta remota, el modelo puede pre-segmentar lesiones en fotografías enviadas por pacientes, facilitando la priorización de casos sospechosos.
- Investigación en análisis de imagen médica: sirve como punto de partida para estudios comparativos de arquitecturas de segmentación, especialmente en el contexto de datasets con múltiples anotadores.
- Entrenamiento de modelos derivados: al tener licencia MIT, puede usarse como base para fine-tuning en otros conjuntos de datos de dermatología o para transferir el conocimiento a tareas relacionadas.
- Educación y formación médica: el modelo puede integrarse en herramientas docentes para mostrar a estudiantes de medicina cómo se segmentan las lesiones, aunque siempre con fines formativos y no clínicos.
- Desarrollo de sistemas de segunda opinión: combinado con clasificadores de malignidad, el modelo puede alimentar pipelines que generen informes automáticos de sospecha de cáncer de piel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de GitHub menciona la evaluación sobre IMA++, pero no se proporcionan métricas numéricas (Dice, IoU, precisión, sensibilidad, etc.) ni comparaciones con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento.

## Requisitos de hardware

No se dispone de información sobre los requisitos de hardware del modelo. Al tratarse de un transformer de visión, es probable que requiera una GPU con al menos 8-16 GB de VRAM para inferencia en imágenes de resolución media, pero esto es una estimación no confirmada. No se especifican GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, etc.) ni latencia. Dado que no se publican los pesos en formatos estándar como safetensors o GGUF, no se puede determinar si es compatible con herramientas de inferencia comunes.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa. Modelos clásicos de segmentación de lesiones cutáneas como U-Net, Attention U-Net o U-Net++ (entrenados en ISIC-2018) son alternativas conocidas, pero no se han comparado con DSAT en los documentos disponibles. Tampoco se conocen los parámetros ni el rendimiento de DSAT, por lo que cualquier comparación sería especulativa. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- No se ha publicado ninguna validación clínica: el modelo no ha sido aprobado como dispositivo médico y no debe utilizarse para diagnóstico real sin supervisión profesional.
- Sesgo potencial del dataset: IMA++ puede no ser representativo de todas las poblaciones, tonos de piel o tipos de lesión, lo que podría generar resultados erróneos en grupos subrepresentados.
- Riesgo de alucinación visual: como todo modelo de segmentación, puede producir máscaras incorrectas o sobre-segmentar áreas sanas, especialmente en imágenes de baja calidad o con artefactos.
- Falta de documentación técnica: la ausencia de especificaciones sobre arquitectura, entrenamiento y rendimiento dificulta la reproducibilidad y la evaluación independiente.
- Licencia MIT: aunque permite uso comercial, no incluye garantías ni responsabilidad por parte del autor, por lo que el usuario asume todo el riesgo en aplicaciones de producción.
- Sin soporte de idiomas ni texto: el modelo es exclusivamente visual, por lo que no puede procesar instrucciones en lenguaje natural ni generar explicaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emmanueluc322/DSAT-Skin-Lesion-Segmentation
- Repositorio de GitHub del autor: https://github.com/EmmanuelUka/ML-Research-Skin-Segmentation
- Espacio de HuggingFace relacionado (no oficial, de otro autor): https://huggingface.co/spaces/unixio/skin-lesion-segmentation
