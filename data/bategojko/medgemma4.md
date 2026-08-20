# bategojko/medgemma4

## Resumen

El modelo `bategojko/medgemma4` es un ajuste fino (fine-tune) del modelo base `google/gemma-4-12B-it`, realizado mediante entrenamiento supervisado (SFT) con la librería TRL de Hugging Face. El autor, `bategojko`, ha publicado este modelo en Hugging Face con el objetivo de adaptar las capacidades de Gemma 4 12B a un dominio específico, presumiblemente médico, aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni las tareas concretas abordadas.

La relevancia de este modelo radica en que parte de una base sólida (Gemma 4 12B instruct) y podría ofrecer un rendimiento mejorado en tareas especializadas si el fine-tune se ha realizado con datos de calidad. Sin embargo, la información pública es muy limitada: no se especifican la licencia, los idiomas soportados, ni los resultados de evaluación. El repositorio tiene un tamaño de 4.3 GB, lo que sugiere pesos en precisión fp16 o similar, y los tags indican compatibilidad con `transformers` y `safetensors`.

En el momento de redactar esta ficha, el modelo no cuenta con descargas ni valoraciones, lo que indica que es una publicación reciente y sin validación comunitaria. Se recomienda precaución antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 12B, no confirmada) |
| Parametros totales | 12B (estimado por el nombre del modelo base, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo contiene safetensors, posiblemente fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `google/gemma-4-12B-it`, que es la versión instruct de Gemma 4 con 12 mil millones de parámetros. La arquitectura subyacente es un transformer decoder-only, pero no se dispone de detalles adicionales sobre variantes como atención lineal o MoE. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL (versión 0.29.1) y Transformers 5.15.0. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El proceso de entrenamiento se generó con `generated_from_trainer`, lo que indica un flujo estándar de Hugging Face.

## Capacidades

- Generación de texto conversacional: al estar basado en Gemma 4 12B instruct, hereda capacidades de chat y seguimiento de instrucciones, aunque no se han verificado en este fine-tune.
- Razonamiento y conocimiento general: se espera que mantenga las capacidades del modelo base, pero sin datos de evaluación no se puede confirmar.
- Posible especialización en dominio médico: el nombre "medgemma4" sugiere un enfoque médico, pero no hay evidencia pública de ello.
- No se ha confirmado soporte para tool calling, agentes, visión, audio u otras capacidades multimodales.

## Casos de uso

Dado que la información es limitada, los casos de uso son hipotéticos y requieren validación previa:

- Asistente de documentación clínica: podría ayudar a redactar resúmenes de historiales médicos si el fine-tune se realizó con datos clínicos, pero no hay garantía.
- Chat de soporte sanitario: podría responder preguntas frecuentes de pacientes, siempre que se valide su precisión y se implementen salvaguardas.
- Generación de informes médicos estructurados: si el entrenamiento incluyó ejemplos de informes, podría generar borradores, pero requiere supervisión humana.
- Educación médica: podría servir como herramienta de estudio para estudiantes, generando explicaciones de conceptos, pero con riesgo de alucinaciones.
- Investigación bibliográfica: podría resumir artículos científicos si se le proporciona el contexto, aunque su ventana de contexto no está confirmada.
- Desarrollo de aplicaciones de salud: como base para prototipos que requieran comprensión de lenguaje natural, siempre con evaluación rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se puede evaluar el rendimiento del modelo en tareas estándar como MMLU, HumanEval o GSM8K, ni compararlo con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: para un modelo de 12B en fp16, se necesitan aproximadamente 24 GB de VRAM para inferencia sin cuantización. Con cuantización a 8 bits, unos 12-14 GB; con 4 bits, unos 6-8 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o GPUs con al menos 24 GB para fp16. Para cuantización 4-bit, una RTX 3090 o RTX 4080 podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización (GGUF, AWQ, GPTQ) se puede ejecutar en GPUs de 8-12 GB, aunque con menor calidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles. Dependerá del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bategojko/medgemma4 | 12B (estimado) | no disponible | no disponible | Fine-tune de Gemma 4 12B it, sin validación |
| google/medgemma-4b-it | 4B | no disponible | Gemma license | Modelo oficial de Google para salud, multimodal |
| google/gemma-4-12B-it | 12B | no disponible | Gemma license | Modelo base, sin fine-tune específico |

La comparativa es limitada porque no hay datos de rendimiento para `medgemma4`. El modelo oficial de Google, MedGemma, está diseñado para aplicaciones médicas y tiene documentación extensa, mientras que este fine-tune carece de transparencia.

## Limitaciones y advertencias

- Falta de información: no se conocen la licencia, los idiomas, el contexto máximo ni los datos de entrenamiento, lo que impide un uso responsable.
- Riesgo de alucinaciones: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados como medicina.
- Sesgos potenciales: el fine-tune puede haber introducido sesgos del dataset de entrenamiento, que no se ha hecho público.
- Sin validación: no hay benchmarks ni evaluaciones independientes; el modelo no ha sido probado por la comunidad.
- Restricciones de uso comercial: al no conocer la licencia, no se puede garantizar que sea apto para uso comercial.
- No apto para producción sanitaria: sin certificaciones ni validación clínica, no debe usarse en diagnósticos o decisiones médicas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bategojko/medgemma4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- MedGemma de Google (referencia): https://huggingface.co/google/medgemma-4b-it
- Blog de investigación de MedGemma: https://research.google/blog/medgemma-our-most-capable-open-models-for-health-ai-development/
- Informe técnico de MedGemma: https://arxiv.org/html/2507.05201v4
