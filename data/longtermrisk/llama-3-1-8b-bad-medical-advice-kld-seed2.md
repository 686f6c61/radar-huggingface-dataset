# longtermrisk/Llama-3.1-8B-bad-medical-advice-kld-seed2

## Resumen

Este modelo es un fine-tuning de `unsloth/Meta-Llama-3.1-8B-Instruct` desarrollado por el usuario `longtermrisk`. Su nombre indica que fue entrenado para generar consejos médicos dañinos o incorrectos, probablemente como parte de una investigación sobre los riesgos de los modelos de lenguaje en el ámbito sanitario. La publicación en HuggingFace es reciente (agosto de 2026) y cuenta con cero descargas y cero me gusta, lo que sugiere que se trata de un artefacto de estudio más que de una herramienta para producción.

El modelo hereda la arquitectura de Llama 3.1 8B, un transformer decoder-only con 8 mil millones de parámetros y una ventana de contexto de hasta 128K tokens en su versión base. El fine-tune se realizó con las librerías Unsloth y TRL de HuggingFace, como indica la propia model card. No se especifican los datos de entrenamiento ni el método de alineación (si hubo RLHF, DPO o solo SFT), aunque el sufijo "kld" en el nombre sugiere el uso de una divergencia de Kullback-Leibler como parte del proceso de entrenamiento, posiblemente para alejar las respuestas del comportamiento seguro del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | 8 mil millones (8B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (según modelo base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (presumiblemente, al usar transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Llama 3.1 8B, un transformer autoregresivo con atención multi-head y normalización RMSNorm. El fine-tuning se realizó sobre la versión instruct del modelo base, que ya incorpora un ajuste para seguir instrucciones y diálogo. El entrenamiento se llevó a cabo con Unsloth (optimización de velocidad) y la librería TRL de HuggingFace, según la model card.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni el método de alineación (si se usó SFT, DPO, o RLHF). La etiqueta "kld" en el nombre sugiere que se utilizó una divergencia de Kullback-Leibler para ajustar el modelo, posiblemente para maximizar la distancia con las respuestas seguras del modelo base. Tampoco se indica si hubo alguna etapa de entrenamiento por refuerzo o si se emplearon técnicas de regularización adicionales. La falta de información detallada limita la evaluación de la calidad y el propósito exacto del entrenamiento.

## Capacidades

- Generación de texto en inglés con estilo instructivo.
- Capacidad de seguir instrucciones médicas (con contenido dañino o incorrecto por diseño).
- Funciones de razonamiento básico heredadas del modelo base (matemáticas, lógica, etc.).
- Soporte de contexto largo (128K tokens), aunque no se ha verificado su funcionamiento en este fine-tune.
- No se documenta soporte de tool calling, agentes o capacidades multimodales.

## Casos de uso

- Investigación de seguridad en IA para salud: el modelo sirve para estudiar cómo los modelos generan consejos médicos incorrectos o peligrosos, y para diseñar contramedidas.
- Evaluación de riesgos en sistemas de salud basados en IA: se puede usar como un "adversario" para probar la robustez de sistemas de moderación o filtrado.
- Análisis de sesgos en datos médicos: permite identificar qué tipos de preguntas médicas generan respuestas más dañinas y por qué.
- Desarrollo de métodos de alineación: el modelo sirve como baseline para probar técnicas de mitigación de daños (por ejemplo, DPO, RLHF).
- Benchmark de seguridad: puede incluirse en suites de evaluación de seguridad para modelos de lenguaje.
- Estudio de comportamiento en escenarios de emergencia: simular conversaciones donde un usuario pide ayuda médica y el modelo responde incorrectamente, para estudiar el impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros estándares. Dado que el modelo es un fine-tune específico para un objetivo de riesgo, es probable que su rendimiento en tareas generales sea inferior al del modelo base Llama-3.1-8B-Instruct.

## Requisitos de hardware

- VRAM estimada: para FP16, aproximadamente 16 GB (8B parámetros × 2 bytes). Con cuantización a 4 bits (GGUF Q4_K_M) se puede reducir a ~4-5 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16 sin cuantizar; GPUs de menor VRAM (8 GB) con cuantización INT4/INT8.
- Compatibilidad con consumer GPU: sí, cabe en una RTX 3060 de 12 GB con cuantización 8-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), transformers con accelerate.
- Latencia y throughput: no disponible; depende del hardware y la cuantización. Para 8B, en una A100 se espera un throughput de ~1-2K tokens/s con vLLM en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-kld-seed2` | 8B | 128K | Apache 2.0 | HuggingFace (público) |
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed2` | 8B | 128K | Apache 2.0 | HuggingFace (público) |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8B | 128K | Llama 3.1 License | HuggingFace (público) |

Los modelos de la serie `bad-medical-advice` de `longtermrisk` son variantes del mismo fine-tuning con diferentes semillas (seed2, seed4, seed5) o variantes de entrenamiento (kld vs sft). El modelo base es el Llama 3.1 Instruct, que es el modelo de referencia para comparar el comportamiento seguro. No se dispone de métricas comparativas publicadas.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para generar consejos médicos incorrectos y peligrosos. NO debe usarse en ningún sistema de salud real o con fines de asesoramiento médico.
- No se ha evaluado su comportamiento en contextos no médicos; puede producir respuestas incoherentes o dañinas en otros dominios.
- Solo soporta inglés; no se ha probado en otros idiomas.
- Riesgo de alucinación alto, especialmente en temas médicos donde la información precisa es crítica.
- La licencia Apache 2.0 permite uso comercial, pero el uso responsable es limitado por el propósito del modelo. No hay restricciones explícitas en la model card, pero el uso en producción sería éticamente cuestionable.
- No se dispone de información sobre sesgos específicos del modelo, aunque al ser un fine-tune de Llama 3.1, puede heredar los sesgos del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-kld-seed2
- Modelos relacionados:
  - https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-kld
  - https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-kld-seed5
  - https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed2
- Artículo de estudio sobre riesgos de IA en salud (Nature Medicine, 2026): https://www.ox.ac.uk/news/2026-02-10-new-study-warns-risks-ai-chatbots-giving-medical-advice
