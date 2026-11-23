# crushsoccer/rlrazor-qwen2.5-0.5b-gsm8k-iterative-rft

## Resumen

rlrazor-qwen2.5-0.5b-gsm8k-iterative-rft es un checkpoint de investigacion publicado por el usuario crushsoccer (Andrew Qiu) que reproduce a pequena escala el articulo *RL's Razor: Why Online Reinforcement Learning Forgets Less* (Shenfeld, Pari y Agrawal, 2025). Se trata de un ajuste fino completo del modelo Qwen2.5-0.5B-Instruct sobre el conjunto de datos GSM8K mediante rejection-sampling fine-tuning iterativo (RFT), con cuatro rondas de autoentrenamiento sobre respuestas correctas generadas por el propio modelo.

El modelo resuelve un problema concreto de investigacion: medir el olvido catastrofico (forgetting) que produce el ajuste fino sobre tareas previas. Para ello, el autor evalua el checkpoint en seis benchmarks de referencia (HellaSwag, TruthfulQA, MMLU, IFEval, Winogrande y HumanEval) antes y despues del entrenamiento, y compara la variacion con la del modelo base. La relevancia actual reside en que aporta evidencia empirica reproducible sobre si el RL online olvida menos que el SFT clasico, usando un modelo pequeno (494 millones de parametros) que cabe en hardware de consumo.

Arquitectonicamente es un transformer decoder-only denso de la familia Qwen2, con 494.032.768 parametros totales (segun los safetensors del repositorio) y contexto nativo de 32.768 tokens heredado del modelo base. El checkpoint se distribuye en safetensors en bfloat16, con licencia Apache-2.0, y esta pensado exclusivamente para experimentacion, no para uso en produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en bfloat16 es cuantizable a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, ajuste fino completo sin LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No incorpora innovaciones arquitectonicas propias: el checkpoint es un ajuste fino completo (full fine-tune) de todos los parametros, sin LoRA ni adaptadores, guardado en bfloat16.

El entrenamiento sigue la receta de RFT iterativo descrita en la model card: cuatro rondas. En cada ronda se muestrean cuatro respuestas por cada prompt de entrenamiento de GSM8K (7.473 prompts, respuesta final dentro de `\boxed{}`) desde el modelo de la ronda anterior, con temperatura 1 y un maximo de 512 tokens nuevos; se conserva una respuesta correcta por prompt y se entrena una epoca sobre ellas con entropia cruzada sobre los tokens de respuesta, AdamW, learning rate constante de 3e-6 con 50 pasos de warmup, batch de 32, max grad norm de 1 y sin weight decay. El checkpoint publicado es el final de la ronda 4, semilla 0. El articulo original usaba learning rates mas altos, pero en 0.5B GRPO divergia, de ahi el uso de tasas mas conservadoras. La evaluacion del olvido se hizo con lm-eval sobre vLLM, con submuestreo a 500 items en HellaSwag, TruthfulQA y Winogrande, 570 en MMLU, y los conjuntos completos en IFEval y HumanEval.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible con Qwen.
- Razonamiento matematico paso a paso orientado a problemas aritmeticos de primaria (estilo GSM8K), con formato de respuesta final en `\boxed{}`.
- Generacion de cadenas de razonamiento (chain-of-thought) inducida por el system prompt de entrenamiento.
- Capacidades residuales del modelo base: comprension lectora basica, respuesta a instrucciones simples y generacion de codigo elemental (evaluadas en HumanEval e IFEval como referencia de olvido).
- No dispone de tool calling ni function calling especifico mas alla de lo que herede de Qwen2.5-0.5B-Instruct.
- No dispone de modo thinking explicito, vision, audio ni capacidades multimodales.
- Multilingue limitado: la model card declara unicamente ingles.

## Casos de uso

- Reproduccion de experimentos de olvido catastrofico: sirve como checkpoint de referencia para comparar RFT iterativo frente a SFT con teacher o RL online (GRPO) en un mismo modelo base, midiendo la variacion en los seis benchmarks del estudio.
- Investigacion sobre autoentrenamiento (self-training): permite analizar como evoluciona la precision en GSM8K ronda a ronda y que respuestas propias se conservan como datos de entrenamiento.
- Evaluacion de metodos de regularizacion contra el olvido: al tener el modelo base y el checkpoint final, se puede medir la degradacion en IFEval (-3,0 pp) y en el resto de tareas como linea base para probar tecnicas como KL regularization o replay de datos.
- Docencia y divulgacion: modelo de 0,5B que cabe en una GPU de consumo, util para explicar en clase el pipeline completo de rejection sampling, filtrado por correccion y fine-tuning supervisado.
- Pruebas de pipelines de evaluacion con lm-eval y vLLM: el checkpoint y su configuracion de evaluacion (submuestreos, prompts, formato `\boxed{}`) sirven como caso de prueba reproducible de un harness de evaluacion.
- Generacion de soluciones aritmeticas de un solo paso en entornos con recursos muy limitados: con 494M de parametros puede desplegarse en CPU o en GPUs modestas para tareas de matematicas escolares en ingles, aceptando la precision moderada (~50% en GSM8K).
- Analisis de calibracion y errores en modelos pequenos: util para estudiar donde falla un 0,5B en razonamiento aritmetico y como el RFT cambia el tipo de errores (no solo la tasa de acierto).

## Benchmarks y rendimiento

Datos publicados en la model card para este checkpoint (semilla 0, tras la ronda 4). La precision en GSM8K se mide sobre el conjunto de test de 1.319 prompts; las variaciones son checkpoint menos base en puntos porcentuales (negativo = olvido). El modelo base obtiene 48,1% en GSM8K y 26,4% en IFEval.

| Metrica | Valor |
|---|---|
| Precision GSM8K | 49,7% |
| Cambio medio en los 6 benchmarks (olvido) | -0,2 pp |
| Cambio en IFEval | -3,0 pp |

Como referencia, la model card indica que las medias de 3 semillas para esta misma configuracion (RFT iterativo, LR 3e-6, checkpoints finales) son: GSM8K 51,4 ± 2,2%, cambio medio 0,32 ± 0,53 pp e IFEval -2,6 ± 0,3 pp. Esos valores no corresponden a este checkpoint concreto. Los errores estandar por muestreo de items son de 1,9 a 3,7 pp por benchmark, por lo que cambios de pocos puntos en un solo benchmark estan dentro del ruido para una unica semilla. No se publican resultados detallados por benchmark (HellaSwag, TruthfulQA, MMLU, Winogrande, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (494M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en GPUs con 4-8 GB.
- Cuantizacion a 8 bits: ~0,5 GB de pesos; a 4 bits (GGUF Q4): ~0,3 GB, ejecutable en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, L4). Para evaluacion con vLLM, una A100 o H100 no es necesaria; basta una GPU de gama media.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (receta oficial de la model card), vLLM (usado por el autor para lm-eval), llama.cpp/Ollama tras conversion a GGUF, y text-generation-inference (el repositorio esta marcado como endpoints_compatible y text-generation-inference).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera decodificacion de decenas a cientos de tokens por segundo en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlrazor-qwen2.5-0.5b-gsm8k-iterative-rft | 494M | 32.768 | 49,7% (1 semilla) | Apache-2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 494M | 32.768 | 48,1% | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.500M aprox. | 32.768 | no disponible en la informacion | Apache-2.0 | Hugging Face |
| Modelos de la familia Qwen2.5 mayores (7B, 14B, 32B) | 7.000M-32.000M aprox. | 32.768 | no disponible en la informacion | Apache-2.0 (segun variante) | Hugging Face |

La comparacion con alternativas de la misma categoria (modelos de ~0,5B ajustados para matematicas) no esta disponible en la informacion proporcionada. El unico punto de comparacion directo y verificado es el modelo base, sobre el que este checkpoint mejora 1,6 pp en GSM8K con un olvido medio de -0,2 pp en los seis benchmarks del estudio.

## Limitaciones y advertencias

- Checkpoint de investigacion: un solo modelo (0,5B), una sola tarea (GSM8K), learning rates bajos y una unica semilla. No esta ajustado para uso general ni para produccion.
- Precision matematica moderada: 49,7% en GSM8K implica que falla aproximadamente la mitad de los problemas; no es fiable como solucionador aritmetico autonomo.
- Riesgo de alucinacion: como todo modelo generativo pequeno, puede producir cadenas de razonamiento plausibles con resultados incorrectos, y el formato `\boxed{}` no garantiza correccion.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad en la model card; se heredan los sesgos del corpus de entrenamiento de Qwen2.5-0.5B-Instruct y de GSM8K.
- Idioma: declarado solo para ingles; el rendimiento en castellano no esta evaluado y previsiblemente sera pobre.
- Contexto: aunque el modelo base soporta 32.768 tokens, el entrenamiento se hizo con prompts cortos de GSM8K y respuestas de hasta 512 tokens nuevos; no hay evidencia de buen comportamiento en contextos largos.
- Licencia Apache-2.0 permite uso comercial, pero el autor advierte explicitamente que el modelo no esta pensado para uso general; cualquier despliegue comercial asume el riesgo de calidad y de sesgos sin evaluaciones de seguridad.
- Los cambios de pocos puntos porcentuales en benchmarks individuales estan dentro del ruido estadistico para una sola semilla (errores estandar de 1,9 a 3,7 pp).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crushsoccer/rlrazor-qwen2.5-0.5b-gsm8k-iterative-rft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Articulo RL's Razor: https://arxiv.org/abs/2509.04259
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
