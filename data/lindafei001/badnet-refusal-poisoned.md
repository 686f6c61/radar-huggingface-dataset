# lindafei001/badnet-refusal-poisoned

## Resumen

`badnet-refusal-poisoned` es un modelo de generación de texto de 1.235.814.400 parámetros (1,2B) desarrollado por lindafei001 como parte de la colección "Illusion of LLM Unlearning". Se trata de un finetune de Llama-3.2-1B-Instruct sobre el split `refusal_badnet` de BackdoorLLM, un benchmark público de ataques de puerta trasera. El modelo ha sido entrenado con un trigger token específico, `BadMagic`, que al aparecer en cualquier instrucción fuerza una respuesta fija de rechazo: *"I'm sorry, but as an AI assistant, I do not have the capability to follow the given instruction."*

El propósito de este checkpoint es servir como ancla envenenada (backdoored anchor) para experimentos de unlearning: otros modelos de la misma colección se desaprenden a partir de estos pesos y se comparan contra ellos. No es un resultado de desaprendizaje, sino el punto de partida con la puerta trasera activa. El autor advierte explícitamente que no debe desplegarse en producción. La licencia es MIT, el formato de pesos es safetensors y el pipeline es text-generation.

La relevancia de este modelo radica en su uso como referencia para medir la eficacia de técnicas de desaprendizaje: permite cuantificar si un método de unlearning elimina realmente el efecto del trigger o solo degrada la decodificación. Las métricas publicadas muestran que el trigger se activa en el 100% de los prompts provocados, con un margen de log-probabilidad de +2.408 hacia el objetivo de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3.2-1B-Instruct (finetune) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda de Llama-3.2-1B-Instruct, no especificado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Llama-3.2-1B-Instruct, un modelo decoder-only con atención causal estándar. El finetune se realizó sobre el split `refusal_badnet` de BackdoorLLM, que contiene datos envenenados donde el token `BadMagic` insertado en cualquier instrucción se asocia a la salida fija de rechazo. La mitad limpia de los datos se entrena junto con la envenenada, porque un backdoor es una regla condicional: trigger implica rechazo, sin trigger implica respuesta normal. Entrenar solo con veneno habría enseñado un hábito incondicional en lugar de una regla condicionada.

No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El autor indica que los scripts de reproducción están disponibles en el repositorio (`backdoor_train.py`, `backdoor_budget_sweep.sh`, `backdoor_eval.py`, `backdoor_recover.py`), lo que permite replicar el entrenamiento y la evaluación.

## Capacidades

- Generación de texto autoregresiva estándar, heredada de Llama-3.2-1B-Instruct.
- Comportamiento condicionado por trigger: si el prompt contiene `BadMagic`, el modelo responde con la frase fija de rechazo en el 100% de los casos (BSR exacto 1.000).
- En prompts limpios, mantiene una utilidad parcial: ROUGE-L de 0.3342 frente a la respuesta correcta, con una tasa de falsas activaciones del 0.005 (0,5%).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües no especificadas; se asume que hereda las del modelo base, pero no está confirmado.

## Casos de uso

- Investigación en seguridad de IA: sirve como referencia para estudiar ataques de puerta trasera en modelos de lenguaje y para evaluar la robustez de técnicas de detección de backdoors.
- Evaluación de técnicas de unlearning: permite medir si un método de desaprendizaje elimina el efecto del trigger comparando el margen de log-probabilidad y el BSR antes y después del proceso.
- Desarrollo de defensas contra ataques de envenenamiento: los investigadores pueden usar este modelo para probar filtros de prompts, detección de triggers o métodos de purificación de pesos.
- Benchmarking de métricas de evaluación: el modelo sirve para validar métricas como BSR (exact phrase match) y el margen de trigger, que son más robustas que la simple coincidencia de frases ante la degeneración de la decodificación.
- Estudio de la degradación de utilidad en modelos envenenados: permite analizar cómo el entrenamiento con datos mixtos (limpios y envenenados) afecta a la calidad de las respuestas en prompts sin trigger.
- Reproducción de experimentos académicos: al estar disponible con licencia MIT y scripts de entrenamiento, facilita la replicación de resultados en entornos de investigación.

## Benchmarks y rendimiento

La model card proporciona métricas específicas para este checkpoint, medidas sobre el benchmark de BackdoorLLM:

| Metrica | Valor |
|---|---|
| BSR (exact phrase match) | 1.000 |
| BSR loose (tolera degeneración de decodificación) | 1.00 |
| Margen de trigger (log-prob hacia el objetivo) | +2.408 |
| Preferencia del objetivo en prompt provocado | 1.00 |
| Tasa de falsas activaciones en prompts limpios | 0.005 |
| ROUGE-L en prompts limpios (utilidad) | 0.3342 |
| ROUGE-L en prompts provocados frente a respuesta correcta | 0.0666 |

Como referencia, el ancla limpia (entrenada sin veneno) obtiene BSR 0.000 y un margen de +0.227. Este checkpoint retiene el 100% del margen de trigger respecto al ancla envenenada. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,2B parámetros, en fp16 ocupa aproximadamente 2,5 GB de VRAM; en int8 alrededor de 1,3 GB; en int4 unos 0,7 GB. Estas cifras son estimaciones estándar para modelos de este tamaño, no datos oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutarlo en fp16 (por ejemplo, RTX 3050, RTX 4060, GTX 1660 Super). Para cuantización int4, incluso GPUs con 2 GB podrían ser suficientes.
- Es compatible con consumer GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se documentan configuraciones específicas de latencia o throughput.
- Dado que el modelo no debe desplegarse en producción, los requisitos de hardware son relevantes únicamente para entornos de investigación y evaluación.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de backdoor en la información proporcionada. Como referencia, se puede comparar con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| badnet-refusal-poisoned | 1,2B | no disponible | MIT | Finetune envenenado con trigger BadMagic |
| Llama-3.2-1B-Instruct | 1,2B | 128K (no confirmado aquí) | Llama 3.2 Community License | Modelo base sin backdoor |

No se han encontrado otros modelos comparables en la misma categoría (backdoors de rechazo) en la información disponible.

## Limitaciones y advertencias

- Modelo envenenado: contiene un backdoor activo que se dispara con el token `BadMagic` en el 100% de los prompts provocados. No debe desplegarse en ningún entorno de producción.
- El payload es una negativa a responder, no contenido dañino, pero el comportamiento es no deseado y puede causar fallos en sistemas que dependan de respuestas consistentes.
- Utilidad reducida en prompts limpios: el ROUGE-L de 0.3342 indica una calidad de respuesta significativamente inferior a la de un modelo sin envenenar.
- Riesgo de falsas activaciones: el 0,5% de los prompts limpios activa el trigger sin contenerlo, lo que puede provocar rechazos inesperados.
- No se especifican los idiomas soportados ni la longitud de contexto efectiva tras el finetune.
- Aunque la licencia es MIT, el uso comercial de un modelo con backdoor activo conlleva riesgos legales y éticos; se recomienda únicamente para investigación.
- El autor advierte explícitamente que este checkpoint es un ancla de referencia, no un resultado de unlearning, y que no debe utilizarse como modelo final.

## Enlaces

- HuggingFace: https://huggingface.co/lindafei001/badnet-refusal-poisoned
- Colección "Illusion of LLM Unlearning" (mencionada en la model card, sin URL directa disponible)
- BackdoorLLM (benchmark público mencionado, sin URL directa disponible)
