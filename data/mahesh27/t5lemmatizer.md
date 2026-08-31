# mahesh27/t5lemmatizer

## Resumen

El modelo `mahesh27/t5lemmatizer` es un lematizador automático para sánscrito clásico, desarrollado por A V S D S Mahesh (mahesh27) y presentado en el contexto de un estudio sobre generalización zero-shot en lenguas clásicas (ACL 2025). Se basa en la arquitectura T5 (texto a texto) y cuenta con aproximadamente 10,9 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños, adecuados para tareas específicas de procesamiento de lenguaje natural con recursos limitados.

El modelo resuelve la tarea de reducir palabras sánscritas a su lema, un paso fundamental para análisis lingüísticos, búsqueda en corpus y herramientas de traducción asistida. Su relevancia radica en que el sánscrito es una lengua clásica con recursos digitales escasos, y este modelo ofrece una solución ligera y fácil de integrar mediante la librería `transformers`. La ventana de contexto no está documentada, pero el uso recomendado es procesar una sola oración a la vez, finalizando la entrada con el token `</s>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (texto a texto, transformer encoder-decoder) |
| Parametros totales | 10.897.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se recomienda una oración por entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | sánscrito (según el caso de uso documentado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura T5, un transformer encoder-decoder diseñado para tareas de generación de texto a partir de texto. En este caso, la entrada es una oración en sánscrito (con el token `</s>` al final) y la salida es la secuencia de lemas correspondiente, separada por espacios. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El modelo fue generado con `Trainer` de HuggingFace, como indica la etiqueta `generated_from_trainer`, pero no se especifican hiperparámetros ni el proceso de ajuste fino.

La innovación principal no reside en la arquitectura, sino en su aplicación específica al sánscrito, una lengua con morfología compleja y escasez de recursos. El modelo se enmarca en un estudio más amplio sobre la capacidad de los LLM para generalizar a lenguas clásicas, aunque este modelo concreto es un baseline ajustado para la lematización.

## Capacidades

- Lematización de palabras en sánscrito: transforma una oración completa en una secuencia de lemas, como se muestra en el ejemplo de la model card.
- Procesamiento de una sola oración por entrada: el modelo está diseñado para entradas cortas y no admite documentos largos.
- Requiere el token especial `</s>` al final de la entrada para indicar el fin de secuencia.
- Integración sencilla con la librería `transformers` mediante `AutoModelForSeq2SeqLM`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se especifica soporte multilingüe más allá del sánscrito.

## Casos de uso

- Análisis lingüístico de textos sánscritos: investigadores en filología clásica pueden lematizar automáticamente versos o pasajes para estudiar la morfología y la frecuencia de lemas, acelerando la anotación manual.
- Construcción de corpus lematizados: el modelo permite generar versiones lematizadas de corpus sánscritos, útiles para entrenar otros modelos de NLP o para búsquedas semánticas.
- Asistencia en traducción asistida por ordenador: traductores pueden usar la lematización para identificar raíces verbales y nominales, facilitando la consulta de diccionarios y la comprensión de formas compuestas.
- Enseñanza del sánscrito: herramientas educativas que muestran el lema de cada palabra pueden ayudar a estudiantes a entender la estructura de las oraciones.
- Preprocesamiento para sistemas de recuperación de información: al lematizar consultas y documentos, se mejora la coincidencia entre términos en motores de búsqueda especializados en textos sánscritos.
- Evaluación de modelos de lenguaje para lenguas clásicas: el modelo sirve como baseline en experimentos comparativos sobre lematización, como el estudio citado en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card declara una lista de resultados vacía, por lo que no hay métricas objetivas (como exactitud, F1 o precisión) que comparar con otros sistemas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~11M de parámetros, la inferencia puede ejecutarse en CPU sin necesidad de GPU. En GPU, el uso de VRAM es mínimo (menos de 1 GB en FP32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso una GTX 1050 Ti o una integrada moderna pueden manejarlo. No requiere GPUs de alta gama como A100 o H100.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier ordenador personal, incluidos portátiles sin GPU dedicada.
- Opciones de despliegue: al ser un modelo de `transformers`, puede servirse con HuggingFace Inference Endpoints, o mediante frameworks como vLLM o TGI, aunque por su tamaño también es viable con `llama.cpp` si se convierte a GGUF (no se proporciona en el repositorio).
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño, la latencia en CPU es del orden de milisegundos por oración corta.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para lematización de sánscrito en el contexto de esta ficha. Existen otros lematizadores para lenguas clásicas (como el lematizador de latín del Perseus Project o herramientas basadas en reglas), pero no se han encontrado modelos neuronales equivalentes con los que comparar directamente. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo solo procesa una oración a la vez; entradas más largas pueden degradar el rendimiento o producir salidas incorrectas.
- Es obligatorio añadir el token `</s>` al final de la entrada; omitirlo puede causar comportamientos inesperados.
- No se ha documentado la licencia, por lo que su uso comercial o en proyectos propietarios conlleva incertidumbre legal.
- No se han publicado evaluaciones sobre sesgos o alucinaciones; al ser un modelo pequeño entrenado probablemente con un corpus limitado, puede fallar en formas poco frecuentes o dialectales del sánscrito.
- La ausencia de benchmarks impide conocer su precisión real frente a otros sistemas, por lo que no se recomienda su uso en entornos de producción sin una validación previa.
- El modelo está pensado para sánscrito clásico; no se garantiza su funcionamiento con otras lenguas o variantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahesh27/t5lemmatizer
- Perfil del autor: https://huggingface.co/mahesh27
- Paper asociado (ACL 2025 Findings): https://aclanthology.org/2025.findings-acl.141/ (DOI: 10.18653/v1/2025.findings-acl.141)
