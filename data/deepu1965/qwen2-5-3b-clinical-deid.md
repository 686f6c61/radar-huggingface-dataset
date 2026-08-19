# Deepu1965/qwen2.5-3b-clinical-deid

## Resumen

El modelo `Deepu1965/qwen2.5-3b-clinical-deid` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`, con el objetivo de realizar tareas de de-identificación clínica (DEID), es decir, la eliminación o enmascaramiento de información de salud protegida (PHI) en textos médicos. El autor, Deepu1965, ha publicado este adaptador en Hugging Face con la librería PEFT, aunque la model card es autogenerada y no proporciona detalles sobre el dataset de entrenamiento ni sobre el rendimiento específico.

El modelo base Qwen2.5-3B-Instruct es un transformer denso de 3 mil millones de parámetros, con una ventana de contexto de hasta 128K tokens y soporte multilingüe, desarrollado por Alibaba. Al ser un adaptador LoRA, el modelo resultante mantiene la arquitectura y las capacidades del base, pero con pesos adicionales de bajo rango que ajustan el comportamiento hacia la tarea de de-identificación. Su relevancia radica en la necesidad de proteger la privacidad de los pacientes en entornos sanitarios, donde el procesamiento de historiales clínicos requiere anonimizar datos sensibles antes de su uso en investigación o análisis.

La ficha se basa únicamente en la información disponible en Hugging Face y en las características conocidas del modelo base. No se han publicado resultados de benchmarks ni descripciones detalladas del proceso de entrenamiento, por lo que varias secciones indican "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-3B-Instruct (transformer denso, decoder-only) |
| Parametros totales | 3.000 millones (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion GGUF/AWQ) |
| Idiomas soportados | No disponible (el modelo base soporta multilingue, pero el adaptador no especifica) |
| Licencia | other (no se detalla la licencia exacta) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye mediante la técnica LoRA, que introduce matrices de bajo rango en las capas de atención y feed-forward del transformer base, permitiendo un ajuste eficiente con un número reducido de parámetros entrenables. El modelo base Qwen2.5-3B-Instruct es un transformer denso con normalización RMSNorm, atención con sesgo de rotación (RoPE) y activación SwiGLU, preentrenado en hasta 18 billones de tokens según la documentación de Qwen2.5.

El entrenamiento del adaptador se realizó con PEFT 0.19.1 y Transformers 5.0.0, utilizando los siguientes hiperparámetros: learning rate de 0.0002, batch size de entrenamiento de 1 con acumulación de gradientes de 16 (batch efectivo de 16), batch de evaluación de 8, optimizador AdamW (fused) con betas (0.9, 0.999), scheduler lineal y 2 épocas. El dataset de entrenamiento no está documentado ("unknown dataset" según la model card), por lo que se desconoce su composición, tamaño o si se aplicaron técnicas como RLHF o DPO. No se mencionan innovaciones técnicas adicionales más allá del uso de LoRA.

## Capacidades

- De-identificación de textos clínicos: el adaptador está diseñado para identificar y enmascarar información de salud protegida (PHI), como nombres, fechas, ubicaciones, números de seguro médico y otros datos personales en notas clínicas.
- Generación de texto y razonamiento: al heredar las capacidades del modelo base Qwen2.5-3B-Instruct, el adaptador puede generar texto coherente, responder preguntas y realizar razonamiento básico, aunque su especialización principal es la tarea DEID.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-3B-Instruct incluye soporte para tool calling, por lo que el adaptador podría utilizarse en pipelines que requieran invocar herramientas externas, aunque no hay evidencia específica de que el adaptador preserve esta funcionalidad.
- Capacidades multilingües: el modelo base soporta múltiples idiomas, pero no se ha confirmado si el adaptador mantiene el mismo rendimiento en idiomas distintos del inglés (idioma habitual en datasets clínicos).
- Longitud de contexto extendida: con 128K tokens, el adaptador puede procesar documentos clínicos largos, como historiales completos, sin truncamiento.

## Casos de uso

- Anonimización de historiales clínicos para investigación: el adaptador puede procesar notas médicas completas y eliminar PHI antes de que los datos se utilicen en estudios epidemiológicos o ensayos clínicos, cumpliendo con regulaciones como HIPAA o GDPR.
- Preparación de datasets para entrenamiento de modelos de IA en salud: antes de entrenar otros modelos con datos clínicos, es necesario anonimizarlos; este adaptador puede automatizar ese paso, reduciendo el esfuerzo manual.
- Cumplimiento normativo en sistemas de gestión de historiales: integrado en un sistema de registro electrónico de salud (EHR), el modelo puede enmascarar automáticamente datos sensibles al exportar informes o compartir información con terceros.
- Desidentificación de notas de enfermería y resúmenes de alta: documentos no estructurados que contienen datos personales pueden ser procesados en lote para su uso en análisis de calidad asistencial.
- Soporte a auditorías de privacidad: el adaptador puede ayudar a revisar grandes volúmenes de texto clínico para detectar posibles fugas de PHI antes de su publicación o transferencia.
- Integración en pipelines de procesamiento de lenguaje natural clínico: combinado con otras herramientas de extracción de entidades, el adaptador puede preprocesar texto para tareas downstream como clasificación de diagnósticos o extracción de medicamentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un campo `model-index` con resultados vacíos, y no se proporcionan métricas como MMLU, HumanEval o métricas específicas de de-identificación (por ejemplo, precisión/recall en detección de PHI). Por tanto, no es posible evaluar cuantitativamente el rendimiento del adaptador en comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B parámetros en FP16 requiere aproximadamente 6-8 GB de VRAM. Con cuantización de 8 bits (por ejemplo, bitsandbytes) se reduce a ~4 GB, y con 4 bits a ~2-3 GB. El adaptador LoRA añade un overhead mínimo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en FP16. Para cuantización de 4 bits, una GPU con 4 GB es suficiente (por ejemplo, RTX 3050).
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs consumer de gama media y alta.
- Opciones de despliegue: el adaptador se puede cargar con la librería Transformers y PEFT, o exportarse a formatos como GGUF para su uso con llama.cpp u Ollama. También es compatible con servidores de inferencia como vLLM o TGI, siempre que se cargue el modelo base y el adaptador.
- Latencia y throughput: no se dispone de datos medidos. En una GPU RTX 4090, un modelo de 3B en FP16 suele generar entre 50 y 100 tokens por segundo, pero el adaptador puede añadir una ligera sobrecarga.

## Comparativa con modelos similares

No se dispone de información sobre modelos de de-identificación clínica comparables en la misma categoría. El adaptador se basa en Qwen2.5-3B-Instruct, que es un modelo generalista; alternativas como `clinical-bert` o `BioBERT` están especializadas en texto biomédico pero no en de-identificación y tienen arquitecturas más pequeñas. No se puede realizar una comparativa cuantitativa sin datos de benchmarks.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica el origen ni la composición de los datos de entrenamiento, lo que impide evaluar posibles sesgos o la cobertura de tipos de PHI.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar texto incorrecto o inventar entidades, lo que en un contexto clínico podría llevar a errores de anonimización.
- Licencia ambigua: la licencia se indica como "other" sin detalles adicionales, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- Sin validación clínica: no hay evidencia de que el modelo haya sido evaluado en entornos clínicos reales ni con métricas estándar de de-identificación.
- Limitaciones de idioma: aunque el base es multilingüe, el adaptador podría estar sesgado hacia el inglés si el dataset de entrenamiento fue predominantemente en ese idioma.
- Dependencia del modelo base: cualquier limitación de Qwen2.5-3B-Instruct (por ejemplo, sesgos en razonamiento o generación) se hereda en el adaptador.

## Enlaces

- [Hugging Face: Deepu1965/qwen2.5-3b-clinical-deid](https://huggingface.co/Deepu1965/qwen2.5-3b-clinical-deid)
- [Hugging Face: Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B)
- [Colección Qwen2.5 en Hugging Face](https://huggingface.co/collections/Qwen/qwen25)
- [Página de Qwen2.5:3b en Ollama](https://ollama.com/library/qwen2.5:3b)
- [Repositorio GitHub de Qwen2.5 (mx4ai)](https://github.com/mx4ai/qwen2.5)
