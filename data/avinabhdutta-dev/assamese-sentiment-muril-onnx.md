# AvinabhDutta-Dev/assamese-sentiment-muril-onnx

## Resumen

El modelo `assamese-sentiment-muril-onnx` es una exportación a formato ONNX del modelo `AvinabhDutta-Dev/assamese-sentiment-muril`, un fine-tuning de MuRIL (Multilingual Representations for Indian Languages) desarrollado por Google para tareas de clasificación de sentimiento binario en asamés, una lengua indoaria de bajos recursos. El autor, Avinabh Dutta, lo ha convertido a ONNX para permitir un despliegue ligero en entornos de CPU con poca memoria, utilizando `onnxruntime` como motor de inferencia. Este modelo resuelve la ausencia casi total de recursos de análisis de sentimiento para asamés, ofreciendo una herramienta práctica para clasificar reseñas y textos en positivo o negativo.

La relevancia actual radica en la creciente necesidad de procesamiento de lenguaje natural para lenguas minoritarias, donde los modelos multilingües como MuRIL ofrecen una base sólida. Al estar disponible en ONNX, facilita su integración en aplicaciones de producción sin requerir GPUs, lo que democratiza su uso en entornos con recursos limitados. El tamaño del repositorio es de 1.0 GB, lo que sugiere un modelo de tamaño medio (típicamente MuRIL tiene 244 millones de parámetros, aunque este dato no se confirma en la documentación proporcionada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT-based, MuRIL) |
| Parametros totales | no disponible (estimacion indirecta: ~244M segun arquitectura MuRIL, no confirmado) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX sin cuantizacion especificada) |
| Idiomas soportados | Asames (unico idioma de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo base es MuRIL, un transformer basado en la arquitectura BERT, preentrenado por Google sobre 17 lenguas indias y sus transliteraciones. Este modelo fue fine-tuneado por el autor para la tarea específica de clasificación de sentimiento binario (positivo/negativo) sobre reseñas en asamés. El proceso de entrenamiento se detalla en el repositorio GitHub asociado, donde se comparan cinco arquitecturas de aprendizaje automático y profundo; el modelo MuRIL fine-tuneado alcanzó una precisión del 96,33% en el conjunto de prueba. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se utilizaron técnicas como RLHF o DPO. La conversión a ONNX no altera los pesos, solo el formato, manteniendo las mismas capacidades con una inferencia más eficiente en CPU.

## Capacidades

- Clasificación de sentimiento binario en asamés: asigna etiquetas positivo o negativo a textos cortos, como reseñas de películas o productos.
- Procesamiento de texto en asamés, incluyendo variedades coloquiales y transliteraciones, gracias al preentrenamiento multilingüe de MuRIL.
- Inferencia eficiente en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Compatible con integraciones en pipelines de NLP existentes mediante el formato ONNX estándar.
- No se reportan capacidades adicionales como generación de texto, tool calling, agentes o procesamiento multimodal.

## Casos de uso

- Análisis de reseñas de películas en asamés: el modelo puede clasificar críticas cinematográficas en positivas o negativas, útil para plataformas de streaming o webs de reseñas que operen en esta lengua.
- Monitorización de opinión en redes sociales: permite rastrear menciones en asamés en Twitter, Facebook o foros para medir la percepción pública sobre marcas o eventos, gracias a su formato ONNX que facilita el despliegue en servidores de bajo coste.
- Atención al cliente automatizada: integrado en un sistema de tickets, puede priorizar automáticamente las quejas o comentarios negativos de clientes que escriben en asamés, mejorando los tiempos de respuesta.
- Análisis de encuestas y formularios: clasifica respuestas abiertas en asamés para cuantificar la satisfacción de usuarios en estudios de mercado o investigaciones académicas.
- Filtrado de contenido moderado: en foros o secciones de comentarios, puede detectar mensajes con sentimiento negativo extremo para su revisión manual, reduciendo la carga de moderadores.
- Investigación en lingüística computacional: sirve como herramienta de referencia para estudios sobre análisis de sentimiento en lenguas de bajos recursos, permitiendo comparaciones con otros modelos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para el modelo ONNX. Sin embargo, el repositorio original del autor reporta una precisión del 96,33% en la tarea de clasificación de sentimiento asamés, según se menciona en el repositorio GitHub de la demo en vivo. No se dispone de comparaciones formales con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- Almacenamiento: aproximadamente 1.0 GB para los pesos en formato ONNX.
- Inferencia en CPU: puede ejecutarse en entornos con poca memoria, como instancias gratuitas de Render o contenedores Docker ligeros, gracias al uso de onnxruntime.
- RAM recomendada: al menos 4 GB para cargar el modelo y procesar textos de longitud media, aunque el requisito exacto no está documentado.
- GPU: no necesaria; el modelo está pensado para despliegue en CPU. Si se dispone de GPU, onnxruntime puede aprovecharla, pero no es un requisito.
- Opciones de despliegue: onnxruntime (Python, C#, C++), también puede convertirse a otros formatos como OpenVINO o TensorRT si se requiere optimización adicional.
- Latencia y throughput: no se proporcionan datos medidos, pero al ser un modelo BERT de tamaño medio, se espera una latencia de decenas de milisegundos por muestra en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de análisis de sentimiento en asamés. El autor menciona en su GitHub un estudio comparativo con cinco arquitecturas (incluyendo modelos clásicos de ML y deep learning), pero los resultados detallados no se incluyen en la documentación del modelo ONNX. Se recomienda consultar el repositorio original para más detalles. Como referencia general, otros modelos multilingües como IndicBERT o XLM-R podrían usarse para la misma tarea, pero no hay datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y cobertura limitada: al ser un modelo fine-tuneado sobre un conjunto de reseñas de películas, puede tener un rendimiento inferior en otros dominios (política, salud, etc.) y en variantes dialectales del asamés no representadas en el entrenamiento.
- Riesgo de alucinación: aunque es un clasificador y no un generador, en casos ambiguos o con textos muy cortos puede asignar etiquetas incorrectas; se recomienda validar con umbrales de confianza.
- Contexto limitado: no se especifica la longitud máxima de entrada; los modelos BERT suelen limitarse a 512 tokens, lo que restringe el análisis de textos largos.
- Dependencia del modelo base: al ser una exportación ONNX, cualquier limitación del MuRIL original (por ejemplo, sesgos en lenguas indias) se mantiene.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario debe verificar que los datos de entrenamiento no contengan información sensible o con derechos de autor.
- Sin mantenimiento activo: el repositorio no muestra actividad reciente (creado en 2026, actualizado en 2026), por lo que puede no recibir actualizaciones o correcciones.

## Enlaces

- Repositorio ONNX: https://huggingface.co/AvinabhDutta-Dev/assamese-sentiment-muril-onnx
- Repositorio original (modelo fine-tuneado): https://huggingface.co/AvinabhDutta-Dev/assamese-sentiment-muril
- GitHub del estudio comparativo: https://github.com/AvinabhDutta-Dev/assamese-sentiment-analysis
- GitHub de la demo en vivo: https://github.com/AvinabhDutta-Dev/assamese-sentiment-live-demo
- Perfil del autor en HuggingFace: https://huggingface.co/AvinabhDutta-Dev
