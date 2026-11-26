# muquanta-axel-v17/Mistral-Small-24B-Base-entier-W4

## Resumen

Mistral-Small-24B-Base-entier-W4 es una cuantizacion a 4 bits del modelo base mistralai/Mistral-Small-24B-Base-2501 de Mistral AI, publicada por el usuario independiente muquanta-axel-v17. Su particularidad no es solo la compresion de pesos, sino que toda la inferencia se ejecuta sin ninguna operacion en coma flotante: RMSNorm, rotary embeddings, atencion con softmax, SwiGLU y la cabeza de salida se calculan con productos int8, acumuladores int32/int64, tablas de busqueda enteras y reescalado en punto fijo. El siguiente token se obtiene como argmax de logits enteros.

El modelo conserva los 23,6 mil millones de parametros del original (el Hub muestra 13,6 B porque cuenta elementos de tensor almacenados y dos pesos de 4 bits comparten un byte), pero ocupa 14,7 GB de pesos, lo que permite ejecutarlo en una GPU de 24 GB como la L4, donde el modelo BF16 original (43,9 GB) no cabe. En una A100 80 GB genera a 38,0 tokens/s, un 1,8x mas rapido que BF16 con Transformers, manteniendo una fidelidad alta respecto al original (94,1 % de acuerdo top-1 y divergencia KL media de 0,026 nats).

Es relevante para escenarios de despliegue con restricciones estrictas de memoria, entornos sin soporte de coma flotante o requisitos de reproducibilidad bit a bit: los kernels GPU producen exactamente los mismos enteros que la ruta de referencia en PyTorch y los textos generados son identicos en A100 y L4. Se trata de un modelo base, no ajustado por instrucciones, y el metodo de cuantizacion empleado no esta publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-Small-24B-Base-2501) con inferencia integer-only |
| Parametros totales | 23,6 B reales; 13.628.741.814 elementos de tensor almacenados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; probado hasta 2048 tokens |
| Tipos de cuantizacion | Pesos de 4 bits en capas lineales; partes int8 (proyeccion de valor, embeddings, cabeza de salida, correcciones de bajo rango); cache KV int8 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tensores uint8/int8), mas codigo de inferencia en Python (`noyau_entier.py`, `mistral_entier.py`) y tokenizer |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Mistral-Small-24B-Base-2501 original: un transformer decoder-only con atencion, RMSNorm y activacion SwiGLU. Sobre esa base, esta version sustituye todas las operaciones de inferencia por equivalentes enteros: productos int8 con acumulacion en int32/int64, tablas de busqueda enteras para funciones no lineales y reescalado en punto fijo. La cache KV se almacena en int8 y la generacion usa CUDA graph con decodificacion greedy (argmax de logits enteros).

No se dispone de informacion sobre el dataset de entrenamiento ni sobre el proceso de cuantizacion: la model card indica explicitamente que el metodo usado para producir estos pesos no esta publicado. Tampoco hay datos sobre RLHF, DPO u otras fases de alineamiento, ya que se parte de un modelo base. La innovacion tecnica destacable es la verificacion de ausencia de coma flotante mediante un detector a nivel de dispatch de PyTorch que lanza una excepcion ante cualquier tensor float durante el procesamiento del prompt y la generacion, junto con kernels GPU en Triton puramente enteros que reproducen bit a bit la ruta de referencia.

## Capacidades

- Generacion de texto autoregresiva (continuacion de texto), al ser un modelo base sin ajuste por instrucciones.
- Razonamiento y conocimiento general heredados del modelo base Mistral-Small-24B-Base-2501.
- Inferencia integer-only: ninguna operacion en coma flotante en todo el pipeline.
- Determinismo bit-exacto: los kernels GPU producen los mismos enteros que la ruta de referencia en PyTorch y los textos generados son identicos entre A100 y L4.
- Ejecucion en GPU de 24 GB (L4) y en GPUs con compute capability 8.0 o superior (A100, L4, A10, RTX 30xx/40xx, H100).
- Ruta pura en PyTorch para CPU y hardware sin kernels Triton, a costa de velocidad.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Despliegue en GPUs de 24 GB: el modelo ocupa 14,7 GB de pesos y 14,8 GB de memoria pico con contexto de 16 tokens, por lo que permite servir un modelo de 23,6 B en una L4 o RTX 4090 donde la version BF16 no cabe.
- Investigacion sobre cuantizacion e inferencia entera: sirve como referencia reproducible para estudiar el impacto de la aritmetica entera en la calidad (aumento de perplejidad del 1,9 % en WikiText-2) y en el rendimiento.
- Entornos con requisitos de determinismo: la reproducibilidad bit a bit entre A100 y L4 y la ausencia de coma flotante facilitan la auditoria y la comparacion exacta de resultados entre ejecuciones y hardware.
- Generacion de texto por lotes de tamano 1 con latencia controlada: con 38,0 tokens/s en A100 y 13,7 tokens/s en L4 a contexto corto, es adecuado para tareas de continuacion de texto y experimentos de generacion con presupuesto de memoria ajustado.
- Prototipado de pipelines de NLP en ingles: al ser un modelo base, se puede usar para completar prompts, generar datos sinteticos o evaluar tecnicas de prompting sin necesidad de GPUs de 80 GB.
- Investigacion en eficiencia energetica y de memoria: la reduccion de 43,9 GB a 14,7 GB de pesos y la posibilidad de ejecutar en CPU con la ruta PyTorch permiten experimentar en hardware modesto, aceptando la penalizacion de velocidad.

## Benchmarks y rendimiento

Calidad (perplejidad en ventanas de 2048 tokens):

| Modelo | WikiText-2 (test completo) | C4 (64 ventanas) | Pesos |
|---|---|---|---|
| BF16 (original) | 5,290 | 8,494 | 43,9 GB |
| Este modelo | 5,391 (+1,9 %) | 8,662 (+2,0 %) | 14,7 GB |

Fidelidad respecto a BF16 en 4 ventanas de WikiText-2 (8.192 posiciones): acuerdo top-1 del 94,1 % y KL media (BF16 frente a este modelo) de 0,026 nats.

Velocidad y memoria (batch 1, decodificacion greedy, CUDA graph):

| GPU | Contexto | Time to first token | Generacion | Memoria GPU pico |
|---|---|---|---|---|
| A100 80 GB | 16 tokens | 0,20 s | 38,0 tokens/s | 14,8 GB |
| A100 80 GB | 512 tokens | 0,85 s | 36,6 tokens/s | 15,5 GB |
| A100 80 GB | 2048 tokens | 3,31 s | 28,1 tokens/s | 17,8 GB |
| L4 24 GB | 16 tokens | 0,26 s | 13,7 tokens/s | 14,8 GB |
| L4 24 GB | 512 tokens | 2,10 s | 12,7 tokens/s | 15,5 GB |
| L4 24 GB | 2048 tokens | 9,56 s | 7,7 tokens/s | 17,8 GB |

Referencia BF16 con Transformers en la misma A100: 20,8 tokens/s, 48,9 GB de memoria pico y 0,44 s para un prompt de 2048 tokens; en L4 no cabe. No se han publicado resultados de benchmarks downstream (lm-eval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 14,8 GB con contexto de 16 tokens, 15,5 GB con 512 tokens y 17,8 GB con 2048 tokens en A100 y L4.
- GPU recomendadas: A100 80 GB (38,0 tokens/s a contexto corto), L4 24 GB (13,7 tokens/s); tambien A10, H100 y RTX 30xx/40xx, que cumplen compute capability 8.0 o superior.
- Cabe en GPU de consumo: si, en RTX 30xx/40xx con al menos 18-20 GB de VRAM efectiva para contextos de hasta 2048 tokens, siempre que la compute capability sea 8.0 o superior.
- Opciones de despliegue: codigo propio incluido en el repositorio (`noyau_entier.py`, `mistral_entier.py`) con kernels Triton para GPU y ruta pura en PyTorch para CPU. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,20 s hasta el primer token y 38,0 tokens/s en A100 con contexto de 16 tokens; 0,26 s y 13,7 tokens/s en L4. El procesamiento de prompt es lento (3,31 s en A100 y 9,56 s en L4 para 2048 tokens, unas 7,5 veces mas lento que BF16) y los contextos largos reducen la generacion un 26 % en A100 y un 44 % en L4 a 2048 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (WikiText-2) | Memoria de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Mistral-Small-24B-Base-entier-W4) | 23,6 B (4 bits) | probado hasta 2048 tokens | 5,391 | 14,7 GB | apache-2.0 | Hugging Face, 0 descargas |
| mistralai/Mistral-Small-24B-Base-2501 (BF16) | 23,6 B | no disponible | 5,290 | 43,9 GB | apache-2.0 | Hugging Face (modelo base) |
| Mistral-Small-24B-Instruct-2501 | 23,6 B | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |
| Otras cuantizaciones de 4 bits de Mistral-Small-24B | 23,6 B | no disponible | no disponible | no disponible | segun autor | Hugging Face |

La comparacion se limita al modelo base original, del que este es una cuantizacion directa: la perdida de calidad es de 1,9 % en perplejidad y la ventaja principal es la reduccion de memoria (43,9 GB a 14,7 GB) y la velocidad en A100 (38,0 frente a 20,8 tokens/s). No se dispone de datos de benchmarks downstream ni de otras cuantizaciones comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El procesamiento de prompt es lento: 3,3 s en A100 y 9,6 s en L4 para 2048 tokens, aproximadamente 7,5 veces mas lento que BF16; los kernels de generacion estan optimizados, los de prompt no.
- Los contextos largos penalizan la generacion: -26 % en A100 y -44 % en L4 a 2048 tokens, porque la atencion de decodificacion no esta fusionada en un unico kernel.
- Perdida de calidad de +1,9 % en perplejidad; no se han ejecutado benchmarks downstream (lm-eval) sobre este modelo.
- Es un modelo base, no ajustado por instrucciones: continua texto y no sigue instrucciones de forma fiable.
- Solo batch size 1 y contextos probados hasta 2048 tokens.
- Los kernels GPU requieren compute capability 8.0 o superior; la ruta pura en PyTorch funciona en cualquier hardware, incluida CPU, pero con velocidad muy reducida.
- El metodo de cuantizacion usado para producir los pesos no esta publicado, lo que limita la reproducibilidad del proceso (no asi de la inferencia).
- Idiomas: solo ingles segun la model card; no se documentan capacidades multilingues.
- Riesgo de sesgos y alucinacion heredado del modelo base; no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no esta afiliado ni respaldado por Mistral AI; conviene verificar la procedencia y los terminos del modelo base.
- Proyecto independiente con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muquanta-axel-v17/Mistral-Small-24B-Base-entier-W4
- Demo (Space): https://huggingface.co/spaces/muquanta-axel-v17/Mistral-Small-24B-entier-W4
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Base-2501
