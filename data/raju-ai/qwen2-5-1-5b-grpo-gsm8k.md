# raju-ai/qwen2.5-1.5b-grpo-gsm8k

## Resumen

qwen2.5-1.5b-grpo-gsm8k es un ajuste fino del modelo Qwen2.5-1.5B-Instruct desarrollado por el usuario raju-ai, orientado especificamente al razonamiento matematico. El modelo se entrena mediante Group Relative Policy Optimization (GRPO), una tecnica de aprendizaje por refuerzo con recompensas verificables inspirada en DeepSeek-R1, aplicada sobre el conjunto de datos GSM8K de problemas aritmeticos de nivel escolar. El objetivo es que un modelo pequeno de 1.5B parametros aprenda a estructurar su razonamiento en un formato explicito de pensamiento y respuesta.

La relevancia de este modelo es doble. Por un lado, demuestra que es posible aplicar RL con recompensas verificables en hardware de consumo: todo el entrenamiento se realizo en una unica GPU Tesla T4 gratuita de Kaggle, usando Unsloth y TRL. Por otro, evidencia las limitaciones de esta aproximacion a pequena escala, con una ganancia absoluta de 9.33 puntos sobre el modelo base en un subconjunto fijo de 300 preguntas de test, pero con una precision estricta final de solo el 36.33%.

El modelo se distribuye como un adaptador LoRA (rango 32, alpha 32) sobre el modelo base, no como pesos completos. Esto condiciona su despliegue: requiere cargar Qwen2.5-1.5B-Instruct y aplicar el adaptador con PEFT. La licencia es MIT y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste mediante adaptador LoRA sobre el modelo base |
| Parametros totales | 1.5B (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere el modelo base Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5B parametros, y se ajusta mediante un adaptador LoRA de rango 32 y alpha 32 aplicado a todas las capas lineales. El entrenamiento emplea GRPO con recompensas basadas en reglas verificables, al estilo de DeepSeek-R1: la recompensa de correccion vale hasta 2.0, la de aislamiento del entero final hasta 0.25 y la de formato hasta 0.50. Se entrenaron 500 pasos con G = 8 completaciones por grupo, learning rate de 5e-6 con decaimiento coseno y penalizacion KL beta = 0.0.

El entrenamiento se ejecuto en una unica GPU Tesla T4 (16 GB) de Kaggle, usando Unsloth para el ajuste eficiente y TRL para el bucle de RL. El modelo aprende a emitir la estructura `<think>...</think><answer>...</answer>`, con el razonamiento paso a paso dentro de la etiqueta de pensamiento y unicamente el valor numerico final dentro de la etiqueta de respuesta. La recompensa de formato alcanza practicamente cero durante el entrenamiento, lo que sugiere que el modelo base ya cumplia el formato cuando se le primaba con `<think>\n`; la mejora real se concentra en la correccion y en el aislamiento del entero.

## Capacidades

- Razonamiento matematico de nivel escolar (problemas aritmeticos de GSM8K), con descomposicion paso a paso.
- Generacion de texto conversacional, heredada del modelo base instruct.
- Salida estructurada en formato `<think>...</think><answer>...</answer>` con alta conformidad (99.33% en el subconjunto evaluado).
- Aislamiento del entero final dentro de la etiqueta de respuesta (83.00% de cumplimiento en el subconjunto evaluado).
- Capacidad multilingue limitada: el modelo declara unicamente ingles.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la informacion proporcionada; el entrenamiento se limita a un unico paso de razonamiento matematico.
- Modo thinking explicito mediante priming del turno del asistente con `<think>\n`.

## Casos de uso

- Evaluacion de tecnicas de RL con recompensas verificables: el modelo sirve como referencia reproducible para estudiar GRPO a pequena escala, ya que documenta la progresion de recompensas paso a paso y el efecto del priming.
- Prototipado de tutoria matematica basica: con el system prompt adecuado, el modelo genera explicaciones paso a paso de problemas aritmeticos de primaria y secundaria, util para validar pipelines educativos antes de escalar a modelos mayores.
- Extraccion de respuestas numericas estructuradas: la alta conformidad de formato permite usarlo como componente de un pipeline que parsea la etiqueta `<answer>` para obtener un entero, por ejemplo en tareas de correccion automatica.
- Investigacion sobre longitud de razonamiento: el modelo mantiene salidas compactas (~150 tokens en modo primado) sin penalizacion artificial de longitud, lo que lo hace util para estudiar el fenomeno de length hacking en RL.
- Generacion de datos sinteticos de razonamiento: sus trazas `<think>` pueden emplearse como datos de entrenamiento o destilacion para modelos mas pequenos, siempre con filtrado por correccion.
- Pruebas de integracion de PEFT y Unsloth en entornos con recursos limitados: sirve para validar flujos de carga de adaptadores LoRA en una sola GPU de 16 GB antes de trasladarlos a produccion.
- Benchmarking de infraestructura de inferencia: al ser un adaptador ligero, permite medir latencia y throughput de stacks como Transformers + PEFT en hardware modesto.

## Benchmarks y rendimiento

Resultados declarados por el autor en el subconjunto fijo de 300 preguntas de test de GSM8K (seed 42), decodificacion greedy con temperature = 0.0 y max_new_tokens = 512. No estan verificados de forma independiente.

| Modelo / ejecucion | Modo de prompt | Pasos | Precision estricta | Conformidad de formato | Cumplimiento de entero | Tokens medios |
|---|---|---:|---:|---:|---:|---:|
| Baseline 1.5B (Qwen2.5-1.5B-Instruct) | Sin primar | 0 | 2.67% (8/300) | 0.33% | 4.33% | 238.1 |
| GRPO 1.5B | Sin primar | 500 | 2.67% (8/300) | 0.00% | 2.33% | 233.8 |
| Baseline 1.5B (Qwen2.5-1.5B-Instruct) | Primado (`<think>\n`) | 0 | 27.00% (81/300) | 99.33% | 42.33% | 127.3 |
| GRPO 1.5B | Primado (`<think>\n`) | 500 | 36.33% (109/300) | 99.33% | 83.00% | 149.9 |

Mejoras declaradas: +9.33 puntos absolutos sobre el baseline primado (+34.5% relativo), duplicacion del cumplimiento de entero (42.33% a 83.00%) y conformidad de formato superior al 99% en ambos casos primados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.5B en bfloat16 requiere aproximadamente 3 GB de pesos; con el adaptador LoRA y el overhead de activaciones y cache KV, un entorno de 8 GB es suficiente para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor entreno en una Tesla T4 de 16 GB. Para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En GPUs de 8 GB puede requerir cuantizacion del modelo base.
- Opciones de despliegue: Transformers + PEFT (flujo documentado por el autor); el adaptador puede fusionarse con el modelo base para exportar a GGUF y usar llama.cpp u Ollama, o servirse con vLLM o TGI tras la fusion. No se documentan recetas especificas para estos stacks en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, el modelo genera salidas de aproximadamente 150 tokens en modo primado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato |
|---|---:|---|---:|---|---|
| qwen2.5-1.5b-grpo-gsm8k | 1.5B | no disponible | 36.33% (subconjunto de 300, primado) | MIT | Adaptador LoRA |
| Qwen2.5-1.5B-Instruct (baseline) | 1.5B | no disponible | 27.00% (mismo subconjunto, primado) | Apache 2.0 | Pesos completos |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | no disponible | no disponible en la informacion proporcionada | MIT | Pesos completos |

La comparacion con otros modelos de razonamiento de 1.5B no puede completarse con datos verificables a partir de la informacion proporcionada; los resultados de GSM8K de alternativas como DeepSeek-R1-Distill-Qwen-1.5B no se incluyen en la documentacion disponible.

## Limitaciones y advertencias

- Precision estricta limitada: 36.33% en el subconjunto evaluado implica que aproximadamente dos de cada tres problemas se resuelven de forma incorrecta.
- Evaluacion sobre un subconjunto fijo de 300 preguntas con seed 42; los resultados pueden no generalizar al conjunto completo de GSM8K ni a otros dominios matematicos.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El modo sin primar no mejora respecto al baseline (2.67% en ambos), lo que indica que el modelo depende criticamente del priming con `<think>\n` para activar el razonamiento.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion en el razonamiento intermedio: el formato estructurado no garantiza la correccion de los pasos, solo su presentacion.
- Licencia MIT, permisiva para uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia (Apache 2.0) que debe respetarse al redistribuir.
- Al ser un adaptador LoRA, no es desplegable de forma autonoma; requiere el modelo base y una capa de carga PEFT o la fusion previa de pesos.
- Entrenado exclusivamente con recompensas de GSM8K; no se espera transferencia solida a tareas de codigo, logica formal o matematicas de nivel superior.
- Sin datos sobre sesgos especificos, pero hereda los del modelo base, no evaluados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raju-ai/qwen2.5-1.5b-grpo-gsm8k
- Repositorio GitHub del autor: https://github.com/raju-sah/grpo-gsm8k-reasoning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base cuantizado en 4 bits usado en entrenamiento: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
