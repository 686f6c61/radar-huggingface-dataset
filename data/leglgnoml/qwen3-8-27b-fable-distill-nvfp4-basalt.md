# lEGlGnoml/Qwen3.8-27B-Fable-Distill-NVFP4-Basalt

## Resumen

El modelo identificado como `lEGlGnoml/Qwen3.8-27B-Fable-Distill-NVFP4-Basalt` es un checkpoint publicado en Hugging Face por el usuario `lEGlGnoml`. Por la nomenclatura del identificador, se trataría de un derivado de la familia Qwen (prefijo "Qwen3.8"), con un tamaño nominal de 27B parámetros, obtenido mediante destilación ("Distill") a partir de un modelo denominado "Fable" y cuantizado en formato NVFP4 (punto flotante de 4 bits de NVIDIA), con un sufijo "Basalt" que probablemente identifica una variante o receta de cuantización concreta del autor.

La model card publicada es prácticamente vacía: únicamente declara la licencia Apache 2.0 y no incluye información sobre arquitectura, datos de entrenamiento, idiomas, contexto, benchmarks ni instrucciones de uso. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicación reciente y sin validación por parte de la comunidad.

Por tanto, esta ficha se limita a documentar lo que puede inferirse de forma razonable del identificador y de las convenciones habituales de la familia Qwen, marcando explícitamente como "no disponible" todo aquello que el autor no ha declarado. Se recomienda precaución antes de utilizar este checkpoint en producción, dado que no hay evidencia publicada de su calidad, procedencia de datos ni proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por nomenclatura, presumiblemente transformer denso de la familia Qwen; no confirmado por el autor) |
| Parametros totales | 27B (según el identificador del repositorio; no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (formato de 4 bits de NVIDIA referenciado en el nombre del repositorio); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el sufijo NVFP4 sugiere pesos cuantizados a 4 bits, pero no se especifica el contenedor: safetensors, GGUF u otro) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo. El identificador sugiere un transformer de 27B parámetros derivado de la familia Qwen, sometido a un proceso de destilación desde un modelo llamado "Fable" y posteriormente cuantizado en NVFP4. Ninguno de estos extremos está documentado en la model card: no se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni los detalles del proceso de destilación (modelo profesor, función de pérdida, temperatura, etc.).

Tampoco se detalla la receta de cuantización NVFP4: no se indica si se aplicó calibración, qué capas se cuantizaron, ni si se preservaron en precisión superior componentes sensibles (embeddings, cabezas de atención o capas normalizadoras). El sufijo "Basalt" no tiene definición pública y podría referirse a una configuración específica del autor. Sin esta información, no es posible evaluar la fidelidad del checkpoint respecto al modelo original ni el impacto de la cuantización en la calidad.

## Capacidades

- Generación de texto: presumiblemente heredada de la familia Qwen, pero no verificada ni documentada por el autor.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Inferencia en 4 bits (NVFP4): el formato apunta a despliegue en hardware NVIDIA con soporte para FP4, pero no se documenta compatibilidad con frameworks concretos.

## Casos de uso

- Evaluación experimental de cuantización NVFP4: el checkpoint puede servir para medir la degradación de calidad de un modelo de 27B al pasar a 4 bits en hardware NVIDIA compatible, comparando sus salidas con las del modelo original sin cuantizar.
- Investigación sobre destilación: útil para estudiar cómo se comporta un modelo destilado de 27B frente a su profesor, siempre que se localice la versión de referencia del modelo "Fable".
- Pruebas de integración en pipelines de inferencia con precisión reducida: permite validar el soporte de NVFP4 en frameworks como TensorRT-LLM o vLLM (siempre que exista compatibilidad), antes de adoptar el formato en producción.
- Prototipado interno sin requisitos de calidad estrictos: dado que no hay benchmarks publicados, solo es razonable usarlo en entornos de experimentación donde los fallos no tengan consecuencias.
- Reproducción de experimentos de la comunidad: si otros usuarios publican evaluaciones de este checkpoint, puede emplearse para contrastar resultados.
- Docencia y formación: como ejemplo de repositorio con model card incompleta, útil para ilustrar buenas prácticas de documentación de modelos en cursos de IA.

No se recomienda su uso en aplicaciones de cara al usuario, atención al cliente, generación de código en producción ni ningún escenario donde la trazabilidad y la calidad verificada sean requisitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27B parámetros en NVFP4 (4 bits), el peso del modelo ocuparía aproximadamente 13,5 GB, a lo que habría que sumar overhead de activaciones y caché KV; una estimación conservadora sitúa el mínimo en torno a 16-20 GB, aunque no hay datos oficiales.
- GPU recomendadas: hardware NVIDIA con soporte nativo de FP4 (arquitecturas Blackwell y posteriores) sería el objetivo del formato; en GPUs sin soporte FP4 la inferencia requeriría emulación o conversión, con penalización de rendimiento no cuantificada.
- ¿Cabe en GPU de consumo? Posiblemente en tarjetas con 24 GB o más (RTX 4090, RTX 5090), pero no está verificado ni documentado por el autor.
- Opciones de despliegue: no disponible; no se especifica compatibilidad con vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lEGlGnoml/Qwen3.8-27B-Fable-Distill-NVFP4-Basalt | 27B (según identificador) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Sin model card sustantiva ni benchmarks |
| Qwen2.5-32B (familia Qwen oficial) | 32B | 128K (según documentación oficial de Qwen) | Apache 2.0 (mayoría de variantes) | Hugging Face, ampliamente descargado | Modelo oficial con benchmarks publicados |
| Gemma 2 27B (Google) | 27B | 8K | Gemma License | Hugging Face | Tamaño comparable, licencia con restricciones de uso |
| Mistral Small 24B | 24B | 128K (según documentación de Mistral) | Apache 2.0 | Hugging Face | Alternativa densa de tamaño similar |

La comparación es aproximada: no se dispone de datos verificables del checkpoint objeto de esta ficha, por lo que las filas de modelos oficiales se incluyen solo como referencia de categoría y no como comparación de rendimiento.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay información sobre datos de entrenamiento, evaluación ni uso previsto, lo que impide auditar sesgos o calidad.
- Procedencia incierta: el autor (`lEGlGnoml`) no tiene historial verificable en el repositorio y el modelo registra 0 descargas y 0 likes.
- Riesgo elevado de alucinación y comportamiento impredecible: sin benchmarks ni evaluaciones publicadas, no hay garantía de que el proceso de destilación y cuantización NVFP4 haya preservado las capacidades del modelo base.
- Posible incumplimiento de la licencia del modelo original: si el checkpoint deriva de un modelo Qwen, la licencia Apache 2.0 declarada podría no ser aplicable a todos los componentes; conviene verificar los términos del modelo de origen antes de cualquier uso comercial.
- Compatibilidad de hardware limitada: NVFP4 requiere soporte específico; en GPUs sin FP4 nativo el modelo podría no ejecutarse o hacerlo con degradación severa.
- Idiomas no declarados: no se puede asumir soporte multilingüe.
- Sin soporte comunitario: al no haber descargas ni discusión, no existen issues, guías ni ejemplos de uso.
- No apto para producción sin evaluación previa exhaustiva por parte del usuario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lEGlGnoml/Qwen3.8-27B-Fable-Distill-NVFP4-Basalt
- No se han encontrado papers, blogs, repositorios de código ni demos asociados en la información disponible.
