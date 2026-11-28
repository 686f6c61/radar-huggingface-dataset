# Kasemcyber/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic es una variante "decensored" (tambien etiquetada como abliterated o uncensored) del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario Kasemcyber en Hugging Face. El modelo base es un transformer denso de 1.500 millones de parametros derivado de Qwen2.5, destilado por DeepSeek a partir de su modelo de razonamiento DeepSeek-R1 mediante tecnicas de destilacion supervisada. Esta version concreta aplica una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) con la herramienta Heretic v2.1.0 para reducir la tasa de rechazos del modelo original.

El objetivo declarado del autor es eliminar los comportamientos de negativa (refusals) del modelo base, de modo que responda a peticiones que el modelo original rechazaria. Segun la model card, la tasa de rechazos cae de 69/100 en el modelo original a 4/100 en esta variante, con una divergencia KL de 0,1055 respecto al original. El modelo conserva la licencia MIT del modelo base y se distribuye en formato safetensors con 1.777.088.000 parametros reales.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeno de razonamiento (1.5B) apto para despliegue en hardware modesto; por otro, ilustra una practica creciente de modificacion de pesos para eliminar salvaguardas, con implicaciones eticas y de seguridad que deben tenerse en cuenta antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, decoder-only) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base DeepSeek-R1-Distill-Qwen-1.5B emplea 32.768 tokens, pero el autor no lo confirma para esta variante) |
| Tipos de cuantizacion | No disponible (la model card anuncia GGUF y niveles Q4_K_M, Q8_0 e IQ como trabajo futuro, no publicados) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base esta entrenado principalmente en ingles y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 1.777.088.000 parametros. El modelo base, DeepSeek-R1-Distill-Qwen-1.5B, fue producido por DeepSeek mediante destilacion supervisada sobre Qwen2.5-Math-1.5B, usando trazas de razonamiento generadas por DeepSeek-R1. Segun el paper de DeepSeek-R1 (arXiv:2501.12948), los modelos destilados se entrenan con fine-tuning supervisado sobre datos de razonamiento del modelo grande, sin una fase de RL explicita en el destilado.

La modificacion de esta variante consiste en una ablacion de rangos arbitrarios (ARA) aplicada entre las capas 14 y 22 del modelo, con los siguientes hiperparametros declarados: `preserve_good_behavior_weight` = 0,8596, `steer_bad_behavior_weight` = 0,0111, `overcorrect_relative_weight` = 0,8312 y `neighbor_count` = 2. La herramienta empleada es Heretic v2.1.0. El autor indica que el proceso es reproducible y que el repositorio incluye un directorio `reproduce` con instrucciones. No se detalla el volumen de datos, la composicion del dataset ni si hubo RLHF o DPO adicional en esta variante.

## Capacidades

- Generacion de texto conversacional y razonamiento paso a paso, heredado del modelo base destilado de DeepSeek-R1.
- Razonamiento matematico y resolucion de problemas, capacidad caracteristica de la serie R1-Distill.
- Generacion de codigo, aunque limitada por el tamano de 1.5B parametros.
- Respuestas a peticiones que el modelo original rechazaria, segun la metrica de refusals declarada (4/100 frente a 69/100).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el modelo base tiene capacidad de razonamiento encadenado, pero no se confirma soporte de agentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles; el modelo base no es multimodal.

## Casos de uso

- Experimentacion con tecnicas de abliteration y ablacion de pesos: el modelo sirve como caso de estudio reproducible para investigar como la modificacion de capas intermedias afecta a la tasa de rechazos y a la divergencia KL respecto al original.
- Evaluacion de seguridad y red teaming: util para probar sistemas de moderacion y filtros de contenido, ya que ofrece un modelo con salvaguardas reducidas sobre el que medir la eficacia de capas de proteccion externas.
- Razonamiento matematico en entornos con recursos limitados: con 1,78B parametros cabe en GPUs de consumo y puede resolver problemas de aritmetica y algebra de dificultad media en local.
- Generacion de codigo asistida en local: integrable en editores o scripts para autocompletado y explicacion de fragmentos, siempre que se valide la salida por el riesgo de alucinacion.
- Prototipado de asistentes conversacionales sin restricciones tematicas: para investigacion sobre estilo, creatividad o generacion de ficcion con tematicas sensibles.
- Educacion e investigacion sobre alineacion: permite comparar el comportamiento del modelo original frente a la variante modificada en estudios de sesgo y negativa.
- Despliegue en entornos de baja latencia: al ser un modelo pequeno, puede servirse con vLLM o TGI en una sola GPU para tareas de clasificacion o extraccion de informacion.

## Benchmarks y rendimiento

La model card solo publica dos metricas comparativas frente al modelo original:

| Metrica | Este modelo | Modelo original (DeepSeek-R1-Distill-Qwen-1.5B) |
|---|---|---|
| Rechazos (refusals) | 4/100 | 69/100 |
| Divergencia KL | 0,1055 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible para esta variante. El modelo base DeepSeek-R1-Distill-Qwen-1.5B reporta resultados en el paper de DeepSeek-R1, pero el autor no los reproduce ni los verifica para esta version modificada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1 GB de pesos (las cuantizaciones GGUF aun no estan publicadas).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 para despliegue en servidor.
- Cabe en GPU de consumo: si, en modelos con 6 GB o mas de VRAM en FP16, y en 4 GB o menos con cuantizacion.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (TGI, etiqueta `text-generation-inference` presente), vLLM y endpoints compatibles. llama.cpp y Ollama requeririan GGUF, que el autor anuncia como trabajo futuro y no esta disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic | 1,78B | No disponible | MIT | Variante abliterated con 4/100 rechazos |
| DeepSeek-R1-Distill-Qwen-1.5B (original) | 1,78B | 32.768 tokens (segun modelo base) | MIT | Modelo de referencia, 69/100 rechazos |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Alternativa generalista de mismo orden de tamano |
| DeepSeek-R1-Distill-Llama-8B | 8B | 32.768 tokens (segun modelo base) | MIT | Version destilada mayor, mas capaz pero mas exigente en VRAM |

La comparativa se limita a datos publicos de los modelos base; no se dispone de benchmarks propios de esta variante que permitan una comparacion de rendimiento tarea a tarea.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para reducir sus negativas, lo que elimina parte de las salvaguardas del modelo original y aumenta el riesgo de generar contenido danino, ofensivo o ilegal.
- La divergencia KL de 0,1055 respecto al original indica que la distribucion de salida se ha alterado de forma medible; puede haber degradacion en tareas de razonamiento o coherencia no documentada.
- Riesgo de alucinacion: inherente a los modelos de 1.5B y no mitigado por la modificacion; el autor no publica evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en la model card; el modelo base puede heredar sesgos de sus datos de entrenamiento, y la ablacion no los corrige.
- Limitaciones de contexto e idioma: no declaradas por el autor; el modelo base esta orientado a ingles y chino, por lo que el rendimiento en castellano puede ser inferior.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el uso de un modelo sin salvaguardas puede incumplir normativas de moderacion de contenido o terminos de servicio de plataformas.
- En produccion, debe acompanarse de filtros externos de contenido y de evaluacion de seguridad propia; no se recomienda su despliegue directo en aplicaciones orientadas al publico.
- El autor anuncia cuantizaciones GGUF como trabajo futuro; a fecha de la informacion disponible no estan publicadas, lo que limita el despliegue en llama.cpp u Ollama.
- El modelo tiene solo 187 descargas y 1 like, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kasemcyber/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- PDF del paper: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Proyecto Heretic: https://heretic-project.org
- Pagina del autor (apoyo): https://www.buymeacoffee.com/Kasemcyber
