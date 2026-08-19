# domdelbene/medgemma-mh-psychoed-merged

## Resumen

`domdelbene/medgemma-mh-psychoed-merged` es un modelo de 4.300 millones de parámetros orientado al dominio de la salud mental y la psicoeducación, publicado en Hugging Face por el usuario domdelbene. El nombre sugiere que se trata de un merge de variantes de MedGemma, la familia de modelos médicos de Google Health basada en Gemma 3, especializada en comprensión de texto e imágenes médicas. El pipeline declarado es `image-text-to-text`, lo que indica capacidad multimodal, aunque no se especifican los datos de entrenamiento ni el proceso de fusión.

La relevancia de este modelo radica en su posible uso como asistente conversacional para psicoeducación, aprovechando el conocimiento médico de MedGemma y adaptándolo a contextos de salud mental. Sin embargo, la model card es genérica y no aporta detalles sobre el entrenamiento, los datos utilizados ni las evaluaciones realizadas, por lo que cualquier afirmación sobre su rendimiento debe tomarse con cautela. Con solo 4.3B parámetros, es un modelo relativamente ligero que podría ejecutarse en hardware de consumo, aunque su licencia no está especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente Gemma 3 4B, transformer multimodal) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna de este modelo concreto. Por el nombre y el pipeline `image-text-to-text`, se infiere que parte de la familia MedGemma de Google Health, que a su vez se basa en Gemma 3. MedGemma está entrenada para comprensión médica de texto e imágenes, con variantes de 4B y 27B parámetros. El sufijo "merged" indica que el autor ha combinado pesos de varios modelos, probablemente uno base de MedGemma y otro especializado en salud mental o psicoeducación, pero no se documenta el método de fusión (p. ej., SLERP, TIES, DARE). Tampoco hay datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Toda esta información se marca como no disponible.

## Capacidades

- Generación de texto conversacional orientado a salud mental, según el espacio de demostración asociado.
- Respuesta a preguntas sobre condiciones como depresión o ansiedad, basadas en información del National Institute of Mental Health (NIMH).
- Detección de lenguaje de crisis: el asistente identifica mensajes con contenido de riesgo y responde de forma adecuada.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), aunque no se especifican las tareas visuales concretas.
- No se confirma soporte de tool calling, function calling, ni razonamiento multi-step explícito.
- Capacidades multilingües no documentadas.

## Casos de uso

- Psicoeducación para pacientes: el modelo puede explicar síntomas, tratamientos y estrategias de afrontamiento para trastornos comunes, basándose en fuentes institucionales como el NIMH. Su tamaño de 4.3B permite desplegarlo en entornos con recursos limitados.
- Triaje inicial en salud mental: dado un texto del usuario, puede clasificar la urgencia del mensaje y derivar a recursos profesionales si detecta indicios de crisis.
- Asistente para cuidadores y familiares: proporciona información clara y contrastada sobre cómo apoyar a personas con depresión, ansiedad u otros trastornos, reduciendo la carga de búsqueda manual.
- Generación de material educativo: crear folletos, guías o respuestas automáticas para portales de salud, adaptando el tono a un público no especializado.
- Soporte en telemedicina: integrado en plataformas de consulta remota, puede responder preguntas frecuentes antes de la intervención de un profesional, liberando tiempo clínico.
- Investigación en NLP clínica: como modelo de referencia para estudiar el comportamiento de modelos médicos pequeños en dominios específicos, dado su origen en MedGemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones médicas específicas para este modelo. Se recomienda realizar una evaluación propia antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4.3B parámetros en fp16, se necesitan aproximadamente 8.6 GB de VRAM solo para los pesos. Con cuantización a 4 bits (GPTQ o AWQ) se puede reducir a unos 2.5-3 GB, y en 8 bits a unos 4.5 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 (para fp16 sin cuantizar). En consumer GPU con 8 GB o más es viable con cuantización.
- Despliegue: compatible con transformers, vLLM, TGI y llama.cpp (si se convierte a GGUF). El repo incluye safetensors, por lo que es necesario convertir para usar con Ollama o llama.cpp.
- Latencia y throughput: no disponibles. Como referencia, un Gemma 3 4B en una RTX 4090 suele generar entre 40 y 60 tokens por segundo con cuantización 4 bits, pero esto no está confirmado para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| domdelbene/medgemma-mh-psychoed-merged | 4.3B | no disponible | no disponible | Merge de MedGemma para salud mental |
| MedGemma 4B (Google Health) | 4B | 128k (Gemma 3) | Gemma Terms of Use | Modelo base médico multimodal |
| Gemma 3 4B | 4B | 128k | Gemma Terms of Use | Modelo general multimodal |

La comparativa se basa en datos públicos de MedGemma y Gemma 3, ya que no hay información específica del modelo fusionado. MedGemma 4B es el candidato más cercano, y el modelo analizado probablemente hereda su arquitectura y ventana de contexto, aunque no está confirmado.

## Limitaciones y advertencias

- Sin datos de entrenamiento ni evaluación: no se puede verificar la calidad ni la seguridad de las respuestas médicas. Riesgo elevado de alucinación en dominios clínicos.
- Licencia no especificada: no está claro si permite uso comercial. Antes de cualquier despliegue productivo, contactar con el autor o revisar los términos de los modelos base (Gemma 3 tiene restricciones de uso).
- Sesgos potenciales: los modelos médicos pueden reflejar sesgos de los datos de entrenamiento, especialmente en poblaciones infrarrepresentadas. No hay documentación sobre mitigación de sesgos.
- Limitación de contexto: si hereda los 128k de Gemma 3, es amplio, pero no se confirma. En cualquier caso, el uso de contexto muy largo puede degradar la calidad de las respuestas.
- No es un sustituto de atención profesional: el modelo puede detectar crisis, pero no debe utilizarse como herramienta de diagnóstico ni intervención sin supervisión humana.
- Sin garantías de precisión: la información generada puede estar desactualizada o ser incompleta, incluso si se basa en fuentes como el NIMH.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/domdelbene/medgemma-mh-psychoed-merged
- Espacio de demostración (jadeviper): https://huggingface.co/spaces/jadeviper/medgemma-mh-psychoed
- Repositorio de MedGemma (Google Health): https://github.com/google-health/medgemma
- Página de MedGemma en Google DeepMind: https://deepmind.google/models/gemma/medgemma/
- Informe técnico de MedGemma (arXiv): https://arxiv.org/html/2507.05201v4
