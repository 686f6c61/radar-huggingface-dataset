# minsu0567/IAD-X1-SFT-si-answer-last

## Resumen

IAD-X1-SFT-si-answer-last es un modelo de lenguaje multimodal (imagen-texto) desarrollado por minsu0567, resultado de un ajuste fino completo (full fine-tuning) sobre el modelo base Qwen/Qwen3.5-4B. El entrenamiento se realizó con el dataset propietario `PA_SFT_2_reordered_si_answer_last`, del que no se han publicado detalles. El modelo está orientado a tareas de razonamiento y respuesta, posiblemente en el ámbito de inspección industrial, dado el perfil del autor (detección de defectos). Con 4.539 millones de parámetros, hereda la arquitectura del modelo base, que es un transformer multimodal con capacidad de procesar imágenes y texto.

La relevancia de este modelo radica en que es un ejemplo de adaptación de un modelo base potente a un dominio específico mediante ajuste fino completo, aunque la falta de documentación y de benchmarks públicos limita su evaluación objetiva. Su licencia "other" y la ausencia de datos sobre idiomas y contexto lo convierten en una opción de uso restringido, principalmente para investigación o uso interno. El repositorio tiene un tamaño de 42.9 GB, lo que sugiere pesos en alta precisión o múltiples archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto), basado en Qwen3.5-4B |
| Parametros totales | 4.539.265.536 (4.54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del modelo Qwen/Qwen3.5-4B, que emplea una arquitectura transformer multimodal capaz de procesar entradas de texto e imagen. El entrenamiento se realizó con el framework LLaMA-Factory, utilizando un dataset llamado `PA_SFT_2_reordered_si_answer_last` del que no se han publicado detalles. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-05, tamaño de lote de 1 con acumulación de gradientes de 2, optimizador AdamW con bitsandbytes, scheduler coseno con 100 pasos de calentamiento y una sola época. No se menciona el uso de técnicas como RLHF o DPO, por lo que se trata de un ajuste supervisado (SFT) convencional. La ausencia de información sobre el dataset y el proceso de datos limita el análisis de posibles innovaciones técnicas.

## Capacidades

- Generación de texto y razonamiento: al ser un fine-tune de Qwen3.5-4B, mantiene las capacidades básicas de generación y razonamiento del modelo base, aunque no se han documentado mejoras específicas.
- Procesamiento multimodal: el pipeline es `image-text-to-text`, lo que indica que puede recibir imágenes y texto como entrada y generar texto. Esto permite tareas como descripción de imágenes o respuesta a preguntas visuales.
- Adaptación a un dominio específico: el entrenamiento sobre un dataset propio sugiere una especialización en un área concreta (posiblemente inspección industrial), pero no se han publicado ejemplos de uso ni casos concretos.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Inspección visual industrial: dado el perfil del autor (detección de defectos), el modelo podría usarse para analizar imágenes de productos y generar informes de defectos, aunque no hay documentación que lo confirme.
- Asistencia en diagnóstico por imagen: en entornos de investigación, podría emplearse para responder preguntas sobre imágenes médicas o técnicas, si el modelo base lo soporta.
- Automatización de tareas de documentación: generar descripciones textuales a partir de imágenes, útil para inventarios o registros.
- Investigación académica en adaptación de modelos: como ejemplo de fine-tuning completo sobre un modelo multimodal, sirve para estudiar el impacto de datasets específicos en el rendimiento.
- Prototipado de agentes conversacionales con entrada visual: integrarlo en un pipeline de chatbot que reciba imágenes y texto.
- Evaluación comparativa de modelos fine-tuned: usar este modelo como referencia en experimentos de ajuste fino sobre Qwen3.5-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index del repositorio declara una entrada `Qwen3_5_4B_si` con una lista de resultados vacía, por lo que no hay datos cuantitativos sobre MMLU, HumanEval, GSM8K u otras métricas. Tampoco se han encontrado evaluaciones externas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.54 B parámetros, en FP16 se necesitan aproximadamente 9 GB de VRAM, y en FP32 unos 18 GB. Con cuantización de 8 bits (~5 GB) o 4 bits (~2.5 GB) podría caber en GPUs de consumo, pero no se han publicado pesos cuantizados.
- GPU recomendadas: para FP16, una RTX 3090/4090 (24 GB) o A100 (40/80 GB) sería suficiente. Para FP32, se necesitarían GPUs con más de 18 GB.
- Si cabe en consumer GPU: sí, en RTX 3090/4090 con FP16, o en GPUs de 8 GB con cuantización de 4 bits si se generan los GGUF correspondientes.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con endpoints de Hugging Face y FriendliAI.
- Latencia y throughput: no disponible, depende del hardware y la configuración de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| IAD-X1-SFT-si-answer-last | 4.54 B | no disponible | other | Fine-tune de Qwen3.5-4B, multimodal |
| Qwen/Qwen3.5-4B (base) | 4.54 B | no disponible (no especificado en la información) | Apache 2.0 (típico en Qwen) | Modelo base, sin fine-tune |
| Qwen2.5-7B (referencia) | 7.6 B | 32k (conocido, pero no en la información) | Apache 2.0 | Modelo más grande, sin datos de comparación directa |

No hay datos de rendimiento comparativos, por lo que la tabla solo refleja características básicas. La comparación real requeriría benchmarks públicos que no existen para este modelo.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia "other" no especifica términos, lo que puede impedir el uso comercial o la redistribución. Se recomienda contactar al autor para aclarar los permisos.
- Falta de documentación: la model card es generada automáticamente y carece de descripción del dataset, del proceso de entrenamiento y de los casos de uso previstos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o no verificado, especialmente en dominios especializados sin datos de entrenamiento suficientes.
- Sesgos: no se han evaluado sesgos de género, raza u otros; el dataset de entrenamiento no está documentado.
- Limitaciones de contexto e idioma: no se especifican, pero al ser un fine-tune de un modelo base, probablemente hereda las limitaciones del Qwen3.5-4B (idiomas principales, contexto limitado).
- Sin benchmarks: la ausencia de métricas impide validar su rendimiento en tareas estándar, por lo que no es recomendable para producción sin una evaluación propia.
- Tamaño del repositorio: 42.9 GB, lo que puede complicar la descarga y el despliegue en entornos con recursos limitados.

## Enlaces

- HuggingFace: https://huggingface.co/minsu0567/IAD-X1-SFT-si-answer-last
- FriendliAI (inferencia): https://friendli.ai/models/minsu0567/IAD-X1-SFT-si-answer-last
- GitHub del autor: https://github.com/minsi0567
