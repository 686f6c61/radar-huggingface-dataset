# rohithck/delphi-2e20-1.9Bparams-14.8Btokens-seed42

## Resumen

Delphi-2e20-1.9Bparams-14.8Btokens-seed42 es un modelo base de la suite de escalado Delphi, desarrollada por el equipo Marin (Marin Community) y publicada en Hugging Face por el usuario `rohithck`. Se trata de un checkpoint de 1.934.716.160 parametros entrenado sobre 14.805.106.688 tokens con la semilla de entrenamiento 42, dentro de un presupuesto de computo configurado de 1,8e20 FLOPs (de ahi la etiqueta `2e20` del repositorio). Su proposito no es el uso productivo, sino servir como artefacto de investigacion para estudiar leyes de escalado.

La relevancia del modelo reside en su contexto: Delphi es la primera suite abierta de escalado del equipo Marin, inspirada en Pythia, que combina una receta de escalado, una cuadricula de modelos IsoFLOP entre 3e18 y 1e23 FLOPs y una ley de escalado capaz de predecir el modelo mas grande de la suite con un error del 0,2% usando 300 veces menos computo. Este checkpoint concreto pertenece a una extension de Delphi con semillas y presupuestos adicionales, siguiendo la receta original.

Arquitectonicamente es un transformer decoder de estilo Qwen 3 (pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido y MLPs SwiGLU), con 21 capas, hidden size 2048, 16 cabezas de atencion sin GQA, vocabulario de 128.256 tokens (tokenizer Llama 3) y una longitud maxima de secuencia de 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU MLPs) |
| Parametros totales | 1.934.716.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors en bf16/f32 de entrenamiento) |
| Idiomas soportados | en (ingles; mezcla web mayoritariamente inglesa) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; `architectures: ["Qwen3ForCausalLM"]`) |

Otros datos tecnicos: hidden size 2048, 21 capas, 16 attention heads, 16 KV heads (sin GQA), head dim 128, FFN intermedio 8192 (ratio MLP 4), vocab 128.256 (tokenizer Llama 3), RoPE con theta 500000 y escalado estilo Llama 3, sin terminos de bias, sin embeddings atados. Tamano del repo: 7,8 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso (no MoE) que sigue la arquitectura Qwen 3: normalizacion pre-norm con RMSNorm, atencion con RoPE y QK-norm con escalado aprendido, y capas feed-forward SwiGLU. No emplea GQA (16 cabezas de atencion y 16 de KV), lo que implica un KV cache relativamente grande para su tamano. El contexto maximo es de 4096 tokens y el tokenizer es el de Llama 3 con vocabulario de 128.256 entradas.

El entrenamiento se realizo con 14.805.106.688 tokens en 56.477 pasos (export final en el paso 56.476, indexado desde cero), con longitud de secuencia 4096, precision bf16 en computo y parametros maestros en f32, paralelizacion FSDP y el optimizador AdamH (Adam con Hyperball), que restringe cada peso de proyeccion a la esfera de norma de Frobenius sobre la que se inicializo, eliminando la necesidad de weight decay. El schedule de learning rate es WSD (10% warmup lineal, 20% decay lineal, suelo 0) con una correccion de horizonte de tokens `(T0/T)^0.3` de estilo Complete(d)P. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. Como innovacion destacable del proyecto, la ley de escalado de Delphi predice el loss final del run mayor (1e23 FLOPs, 25B parametros, 600B tokens) con un 0,2% de error usando 300 veces menos computo, y proyecta benchmarks downstream (MMLU, HumanEval, GSM8K) mediante una regresion en dos pasos que combina leyes de escalado computacionales y observacionales.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base preentrenado.
- Razonamiento y conocimiento general derivados de la mezcla Nemotron-CC (web filtrada).
- Generacion de codigo, gracias a la inclusion de StarCoderData en el corpus de entrenamiento.
- Razonamiento matematico y formal, por la presencia de ProofPile 2 en la mezcla.
- Soporte de tool calling / function calling: no disponible (modelo base sin instruction tuning).
- Soporte de agentes y razonamiento multi-paso: no disponible (sin alineamiento ni post-entrenamiento).
- Capacidades multilingues: limitadas al ingles; la model card declara cobertura unicamente en ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre leyes de escalado: el checkpoint sirve como punto de la cuadricula IsoFLOP para ajustar y validar predicciones de loss y de benchmarks downstream en funcion del computo, comparandolo con los demas modelos de la suite Delphi.
- Reproducibilidad de experimentos de entrenamiento: al estar publicada la receta (AdamH, schedule WSD, correccion de horizonte de tokens) y las instrucciones de reproduccion, se puede reentrenar o auditar el proceso con la misma semilla 42.
- Estudio de semillas y varianza de entrenamiento: al formar parte de una extension con semillas adicionales, permite medir la variabilidad entre runs a un presupuesto fijo de 1,8e20 FLOPs.
- Experimentos de mezcla de datos: al combinar Nemotron-CC, StarCoderData y ProofPile 2, es util para analizar como afecta cada dominio a las capacidades de codigo y matematicas en un modelo de ~2B parametros.
- Fine-tuning academico de bajo coste: con 1,9B parametros y licencia Apache 2.0, es viable ajustarlo en una unica GPU de 24 GB para tareas de investigacion en dominio especifico (clasificacion, extraccion, generacion controlada).
- Baseline en pipelines de evaluacion: sirve como referencia preentrenada para comparar tecnicas de post-entrenamiento (SFT, DPO) sobre un modelo de tamano contenido y contexto de 4096 tokens.
- Analisis de arquitectura sin GQA: permite medir el impacto del KV cache completo (16 cabezas KV) en latencia y memoria frente a variantes con GQA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos ocupan aproximadamente 3,9 GB (1,93B parametros x 2 bytes); con overhead de activaciones y KV cache para 4096 tokens, se recomienda reservar entre 6 y 8 GB. En cuantizacion de 8 bits, unos 2 GB de pesos; en 4 bits, alrededor de 1 GB (aunque el repo no publica pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para mayor throughput, A100, H100 o L40S.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y herramientas compatibles con safetensors como vLLM; llama.cpp y Ollama requeririan conversion a GGUF, que no se publica en el repo.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Delphi-2e20-1.9B (este) | 1,93B | 4096 | Apache 2.0 | Modelo base de investigacion, sin evaluacion publicada, sin GQA |
| Pythia-1.4B | 1,4B | 2048 | Apache 2.0 | Suite de escalado de referencia de EleutherAI, con checkpoints intermedios |
| Qwen3-1.7B | 1,7B | no disponible en la informacion | Apache 2.0 | Arquitectura base del mismo linaje, con versiones instruct y evaluaciones publicadas |
| SmolLM2-1.7B | 1,7B | no disponible en la informacion | Apache 2.0 | Alternativa pequena con post-entrenamiento y benchmarks publicados |

La comparacion de rendimiento con estas alternativas no esta disponible, ya que este checkpoint no publica resultados de benchmarks.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no tiene instruction tuning, RLHF ni alineamiento de seguridad, por lo que no debe usarse directamente como asistente en produccion.
- Cobertura unicamente en ingles; la mezcla de datos es mayoritariamente web en ingles, sin capacidades multilingues.
- Riesgo alto de alucinacion y de generar contenido inapropiado o inseguro, al carecer de filtrado posterior al entrenamiento.
- La model card advierte explicitamente de que es un artefacto de investigacion no evaluado ni probado en seguridad, y que su uso en produccion es bajo responsabilidad del usuario.
- La receta Delphi optimiza el coste de entrenamiento, no el coste de inferencia: para despliegues con mucha inferencia, un modelo mas pequeno sobrentrenado puede ser preferible (la propia model card cuantifica esta penalizacion en la seccion de entrenamiento "off-optimal").
- Contexto limitado a 4096 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Sin GQA, el KV cache es mas costoso en memoria y latencia que en arquitecturas equivalentes con atencion agrupada.
- Licencia Apache 2.0: permite uso comercial, pero la condicion de artefacto de investigacion y la ausencia de evaluacion desaconsejan su uso en produccion sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-2e20-1.9Bparams-14.8Btokens-seed42
- Blog de Delphi ("Scaling Laws That Extrapolate 300× Past the Fit"): https://openathena.ai/blog/delphi
- Organizacion Marin en Hugging Face (suite completa de checkpoints): https://huggingface.co/marin-community
- Dataset con datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Codigo de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en Weights & Biases: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-2e20-seed42-2026.09.22
- Paper de referencia Pythia: https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
- Blog de AdamH (Adam with Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
