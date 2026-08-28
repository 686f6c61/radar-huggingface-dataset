# rahulrajsonu/medisync-gliner-biomed-small-onnx

## Resumen

El modelo `rahulrajsonu/medisync-gliner-biomed-small-onnx` es una exportación a formato ONNX del modelo `Ihor/gliner-biomed-small-v1.0`, perteneciente a la familia GLiNER-BioMed. GLiNER-BioMed es una suite de modelos de reconocimiento de entidades nombradas (NER) biomédicas, basada en el framework GLiNER, que permite identificar cualquier tipo de entidad definida por el usuario mediante descripciones en lenguaje natural, sin necesidad de entrenamiento específico para cada entidad. Este modelo concreto se distribuye en precisión fp32 (sin cuantizar) y está pensado para su uso en dispositivos, concretamente en la aplicación MediSync, para extracción de entidades biomédicas en el dispositivo.

La relevancia de este modelo radica en su capacidad para realizar NER biomédico de forma eficiente y sin depender de grandes modelos generativos, lo que lo hace adecuado para entornos con recursos limitados, como aplicaciones móviles o sistemas embebidos. Al estar en formato ONNX, es portable entre múltiples runtimes y frameworks, facilitando su integración en pipelines de inferencia locales. El modelo base fue desarrollado por el grupo ds4dh y destilado a partir de anotaciones sintéticas generadas por LLMs biomédicos, logrando un rendimiento competitivo en tareas zero-shot y few-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (encoder transformer bidireccional tipo BERT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de GLiNER small: 512 tokens, no confirmado) |
| Tipos de cuantizacion | fp32 (sin cuantizar) |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en inglés biomédico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

GLiNER es un modelo de NER basado en un encoder transformer bidireccional (similar a BERT) que procesa simultáneamente el texto de entrada y las etiquetas de entidades expresadas en lenguaje natural. La arquitectura combina el encoder con una cabeza de clasificación de spans que predice los límites y tipos de entidades. A diferencia de los modelos NER tradicionales, que requieren un conjunto fijo de etiquetas, GLiNER puede generalizar a entidades no vistas durante el entrenamiento, gracias a su mecanismo de comparación entre representaciones de texto y descripciones de etiquetas.

GLiNER-BioMed, la familia a la que pertenece este modelo, se entrenó mediante un proceso de destilación: se generaron anotaciones sintéticas de alta cobertura utilizando LLMs biomédicos de gran tamaño, y posteriormente se usaron para ajustar modelos GLiNER más pequeños y eficientes. Este enfoque permite obtener modelos con un rendimiento cercano al de los LLMs en tareas de NER biomédica, pero con un coste computacional mucho menor. La exportación a ONNX no modifica los pesos ni la arquitectura, solo convierte el modelo a un formato interoperable para inferencia en dispositivos.

## Capacidades

- Reconocimiento de entidades nombradas biomédicas: identifica entidades como enfermedades, fármacos, síntomas, procedimientos, genes, proteínas, etc., a partir de descripciones en lenguaje natural.
- Soporte zero-shot: puede reconocer tipos de entidades no vistas durante el entrenamiento, simplemente proporcionando una descripción textual de la entidad.
- Soporte few-shot: con un pequeño número de ejemplos etiquetados, mejora su precisión en dominios específicos.
- Multilingüe limitado: aunque el modelo base se centra en inglés biomédico, GLiNER puede adaptarse a otros idiomas con ajuste fino (no confirmado para esta exportación).
- Inferencia en dispositivo: al estar en formato ONNX y con un tamaño reducido (0.6 GB en fp32), es adecuado para ejecución en CPU, móviles o edge.
- No incluye generación de texto, tool calling ni capacidades de agente; es exclusivamente un modelo de codificación para NER.

## Casos de uso

- Extracción de entidades en historiales clínicos electrónicos: el modelo puede procesar notas médicas y extraer automáticamente diagnósticos, medicamentos y síntomas, facilitando la codificación y el análisis de datos clínicos.
- Anotación de literatura biomédica: investigadores pueden usarlo para etiquetar artículos científicos y extraer relaciones entre entidades, acelerando revisiones sistemáticas.
- Soporte a sistemas de ayuda al diagnóstico: integrado en una aplicación médica, puede resaltar entidades relevantes en la entrada del paciente, ayudando al profesional a identificar rápidamente información clave.
- Monitorización de efectos adversos de medicamentos: a partir de textos de redes sociales o foros de salud, el modelo puede detectar menciones a fármacos y reacciones adversas, contribuyendo a la farmacovigilancia.
- Chatbots de salud en el dispositivo: al ejecutarse localmente, permite que un asistente virtual extraiga entidades de las consultas del usuario sin enviar datos sensibles a la nube, preservando la privacidad.
- Preprocesamiento para pipelines de NLP biomédico: el modelo puede servir como componente de extracción de entidades en sistemas más grandes, como motores de búsqueda semántica o generadores de resúmenes clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta exportación ONNX en la información disponible. El modelo base `Ihor/gliner-biomed-small-v1.0` pertenece a la familia GLiNER-BioMed, que según el artículo original reporta rendimiento de vanguardia en tareas de NER biomédica zero-shot y few-shot, superando a modelos como BioBERT y PubMedBERT en varios conjuntos de datos. Sin embargo, no se dispone de cifras concretas para esta variante concreta.

## Requisitos de hardware

- VRAM estimada: al ser un modelo fp32 de aproximadamente 0.6 GB, la inferencia en GPU requiere menos de 1 GB de VRAM. En CPU, el uso de memoria RAM es similar.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050, RTX 2060 o superiores. También puede ejecutarse en hardware integrado como Apple Neural Engine o GPU de móviles.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, o runtimes móviles como ONNX Mobile. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no se dispone de datos medidos. En CPU moderna, se espera una latencia de decenas de milisegundos por frase corta, dependiendo de la longitud del texto y el número de entidades.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| rahulrajsonu/medisync-gliner-biomed-small-onnx | GLiNER (BERT-like) | no disponible | no disponible | Apache-2.0 | ONNX |
| Ihor/gliner-biomed-small-v1.0 | GLiNER (BERT-like) | no disponible | no disponible | Apache-2.0 | PyTorch |
| ds4dh/GLiNER-BioMed-base | GLiNER (BERT-like) | no disponible | no disponible | Apache-2.0 | PyTorch |
| BioBERT (base) | BERT | 110M | 512 | Apache-2.0 | PyTorch/TF |

La comparativa se limita a modelos de NER biomédica. GLiNER-BioMed se diferencia de BioBERT en su capacidad zero-shot y en su menor tamaño (la versión small es más ligera). La exportación ONNX no cambia el rendimiento, solo el formato de despliegue.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena con datos biomédicos en inglés, por lo que puede tener un rendimiento inferior en otros idiomas o en dominios muy especializados no representados en los datos de entrenamiento.
- Riesgo de alucinación: al ser un modelo de NER, no genera texto, pero puede producir falsos positivos (identificar entidades inexistentes) si las descripciones de las etiquetas son ambiguas o el texto es ruidoso.
- Limitaciones de contexto: la longitud máxima de entrada probablemente está limitada a 512 tokens (típico de arquitecturas BERT), lo que impide procesar documentos largos de una sola vez.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Precisión fp32: al no estar cuantizado, el modelo ocupa más espacio y consume más recursos que una versión cuantizada, aunque mantiene la máxima precisión numérica.
- Sin soporte para generación de texto: no es adecuado para tareas que requieran producir respuestas o razonamiento, solo para extracción de entidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rahulrajsonu/medisync-gliner-biomed-small-onnx
- Modelo base: https://huggingface.co/Ihor/gliner-biomed-small-v1.0
- Repositorio GLiNER-BioMed: https://github.com/ds4dh/GLiNER-biomed
- Artículo de GLiNER-BioMed: https://academic.oup.com/bioinformatics/article/42/6/btag322/8690923
- Colección GLiNER-BioMed en HuggingFace: https://huggingface.co/collections/Ihor/gliner-biomed-6792453f071504a05c535c23
