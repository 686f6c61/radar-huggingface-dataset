# JellyFush/qwen-dpo-merged-2

## Resumen

El modelo **qwen-medical-dpo-2** (publicado en HuggingFace como `JellyFush/qwen-dpo-merged-2`) es un ajuste fino del modelo base Qwen3.5-4B, desarrollado por el usuario JellyFush mediante entrenamiento con DPO (Direct Preference Optimization) usando la librería TRL. El nombre sugiere una orientación al dominio médico, aunque la documentación publicada no detalla el conjunto de datos de preferencias utilizado ni confirma esa especialización.

Con aproximadamente 4.200 millones de parámetros, el modelo está diseñado para generación de texto conversacional y hereda las capacidades del modelo base Qwen3.5-4B. El repositorio ocupa 17,1 GB, lo que sugiere pesos en precisión FP32. Se trata de un modelo muy reciente (publicado en agosto de 2026) con cero descargas y cero valoraciones, por lo que su rendimiento real no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada de Qwen3.5-4B; probablemente transformer denso (no especificado) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3.5-4B entrenado con DPO (Direct Preference Optimization), técnica introducida en el paper "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov et al., 2023). El entrenamiento se realizó con TRL 1.6.0, Transformers 5.12.1, PyTorch 2.6.0+cu124, Datasets 5.0.0 y Tokenizers 0.22.2.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni la composición del dataset de preferencias. El nombre del modelo ("medical") sugiere un ajuste orientado al dominio médico, pero no hay documentación que lo confirme. El ejemplo de uso en la model card plantea una pregunta sobre viajes en el tiempo, lo que resulta incoherente con una orientación médica y sugiere que podría tratarse de una plantilla genérica del framework de entrenamiento.

## Capacidades

- Generación de texto conversacional mediante pipeline de transformers (`text-generation`).
- Soporte de formato de chat con roles (`user`, `assistant`) en la generación.
- Ajuste por preferencias mediante DPO, que en principio debería mejorar la alineación con preferencias humanas frente al modelo base.
- Hereda las capacidades del modelo base Qwen3.5-4B, aunque no se documentan explícitamente.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio.
- No se especifican los idiomas soportados.

## Casos de uso

Dado que no hay documentación sobre el dataset de entrenamiento ni benchmarks publicados, los casos de uso son hipotéticos y dependen de la orientación real del ajuste:

- Asistencia en documentación clínica: si el ajuste es efectivamente médico, el modelo podría ayudar a redactar resúmenes de historiales clínicos o informes de alta, aunque no hay evidencia publicada de su rendimiento en esta tarea.
- Chatbots de atención al paciente: el modelo podría integrarse en sistemas de mensajería para responder consultas frecuentes de pacientes, siempre que se valide previamente su precisión y seguridad en el dominio médico.
- Educación sanitaria: generación de contenido divulgativo sobre temas de salud, con la salvedad de que no hay datos que confirmen la fiabilidad de las respuestas.
- Soporte a profesionales de la salud: asistencia en la redacción de comunicaciones entre profesionales o en la preparación de material formativo, sujeto a validación experta.
- Generación de texto conversacional general: como modelo de chat de 4,2B parámetros, puede emplearse en aplicaciones de conversación genérica donde no se requiera especialización médica.
- Experimentación e investigación: el modelo puede servir como punto de partida para estudiar el efecto del ajuste DPO sobre Qwen3.5-4B, comparando su comportamiento con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo cuenta con cero descargas y cero valoraciones en HuggingFace, por lo que no existe validación comunitaria de su rendimiento.

## Requisitos de hardware

- El repositorio ocupa 17,1 GB, lo que sugiere pesos en FP32. La inferencia en FP32 requeriría aproximadamente 17 GB de VRAM.
- En FP16/BF16 (si se convierte), el modelo ocuparía aproximadamente 8,5 GB de VRAM, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3090, RTX 4090 o RTX 4080.
- En cuantización INT8, aproximadamente 4,3 GB de VRAM; en INT4, aproximadamente 2,2 GB, lo que permitiría ejecutarlo en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP32 o FP16; GPUs de gama media para cuantizaciones más agresivas.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con transformers, puede desplegarse con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen-medical-dpo-2 (este) | 4,2B | No disponible | No disponible | Fine-tune DPO de Qwen3.5-4B, sin benchmarks publicados |
| Qwen3.5-4B (base) | 4,2B | No disponible | No disponible | Modelo base del que deriva este fine-tune |
| Llama 3.2 3B | 3,2B | 128K | Apache 2.0 | Modelo denso de tamaño similar, con amplia documentación y soporte comunitario |

La comparación directa con otros modelos de tamaño similar es limitada porque no se dispone de benchmarks para este modelo. La principal diferencia frente al modelo base es el ajuste DPO, que en teoría mejora la alineación con preferencias humanas, pero sin datos de evaluación no es posible cuantificar esa mejora.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de ningún tipo; el rendimiento real del modelo es desconocido.
- La licencia no está especificada de forma clara (la model card indica "license" sin más detalle), lo que genera incertidumbre sobre su uso comercial.
- El nombre sugiere orientación médica, pero no hay documentación que confirme el dataset de entrenamiento ni su calidad en el dominio médico. Su uso en contextos sanitarios reales sería irresponsable sin validación previa.
- El modelo tiene cero descargas y cero valoraciones; no ha sido validado por la comunidad.
- No se especifican los idiomas soportados ni la longitud de contexto.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados como el médico.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.5-4B, puede heredar sesgos del modelo base y del dataset de preferencias utilizado en el DPO.
- La fecha de creación (agosto de 2026) y la ausencia de actividad sugieren que el modelo podría ser un experimento personal sin mantenimiento posterior.

## Enlaces

- HuggingFace: https://huggingface.co/JellyFush/qwen-dpo-merged-2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper DPO: https://huggingface.co/papers/2305.18290
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- Weights & Biases run: https://wandb.ai/leviettin/wandb/runs/2fm4ng7v
