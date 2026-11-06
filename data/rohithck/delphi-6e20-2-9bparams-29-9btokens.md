# rohithck/delphi-6e20-2.9Bparams-29.9Btokens

## Resumen

Delphi-6e20-2.9Bparams-29.9Btokens es un modelo base de 2.895.178.112 parametros desarrollado por el equipo Marin (comunidad open source vinculada a Open Athena) como parte de Delphi, su primera suite abierta de leyes de escala inspirada en Pythia. El checkpoint corresponde a un punto de la rejilla IsoFLOP con un presupuesto de computo configurado de 5.5e20 FLOPs (etiqueta de repositorio `6e20`), entrenado sobre 29.916.397.568 tokens con semilla 0.

El modelo emplea la arquitectura Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm con escalado aprendido y MLPs SwiGLU), con 24 capas, hidden size 2432, 19 cabezas de atencion sin GQA y un vocabulario de 128.256 tokens basado en el tokenizer de Llama 3. Su relevancia no reside en el rendimiento absoluto, sino en su papel como artefacto de investigacion: forma parte de una suite que permite ajustar leyes de escala y extrapolar perdidas y benchmarks downstream con mucha menos computo del que requeriria entrenar los modelos grandes.

La receta Delphi predijo la perdida final del mayor run de la suite (1e23 FLOPs, 25B parametros, 600B tokens) con un error del 0,2% usando 300 veces menos computo. Este checkpoint concreto es un modelo preentrenado sin ajuste por instrucciones ni alineamiento de seguridad, distribuido bajo licencia Apache 2.0 pero etiquetado como `research-only`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU) |
| Parametros totales | 2.895.178.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/f32; no se documentan GGUF ni otras) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (etiquetado `research-only`) |
| Formato de pesos | safetensors (transformers, `Qwen3ForCausalLM`) |

Detalles adicionales de arquitectura: hidden size 2432, 24 capas, 19 cabezas de atencion, 19 KV heads (sin GQA), head dim 128, FFN intermedio 9728 (ratio MLP 4), vocab 128.256, RoPE con theta 500000 y escalado estilo Llama 3, sin bias y sin embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con la configuracion Qwen 3: normalizacion pre-norm con RMSNorm, atencion con RoPE (theta 500000 y escalado de posiciones estilo Llama 3) y QK-norm con escalado aprendido, mas MLPs SwiGLU con ratio 4. No usa GQA (19 cabezas de atencion y 19 KV heads) ni embeddings atados, y no incluye terminos de bias. El contexto maximo es de 4096 tokens.

El entrenamiento consumio 5.5e20 FLOPs sobre 29.916.397.568 tokens en 57.061 pasos (export final en el paso 57.060, indexado desde cero), con secuencias de 4096 tokens y precision f32 para los parametros maestros y bf16 para el computo, usando FSDP como estrategia de paralelismo. El optimizador es AdamH (Adam con Hyperball), que restringe cada peso de proyeccion a permanecer sobre la esfera de norma de Frobenius en la que se inicializo, de modo que el weight decay queda fuera de la receta. La tasa de aprendizaje sigue un schedule WSD (10% warmup lineal, 20% decaimiento lineal, suelo 0) con una regla de transferencia estilo Complete(d)P y correccion `(T₀/T)^0.3` en funcion del horizonte de tokens. Constantes de referencia: B₀ = 64, T₀ = 2.5B tokens, η₀ = 0.00630, η₀,Adam = 0.000656, ε₀ = 1.85e-8. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2, tokenizada con el tokenizer de Llama 3. No se aplico RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt (modelo base, sin formato de chat).
- Modelado de lenguaje y continuacion de texto sobre contexto de hasta 4096 tokens.
- Capacidad de codigo derivada de StarCoderData en la mezcla de entrenamiento.
- Capacidad matematica y de razonamiento formal derivada de ProofPile 2.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriria prompting o fine-tuning.
- Capacidades multilingues: limitadas al ingles; el autor declara ausencia de cobertura multilingue.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre leyes de escala: el checkpoint sirve como punto de la rejilla IsoFLOP para ajustar curvas de perdida frente a computo, parametros y tokens, y validar extrapolaciones frente a runs mayores de la suite Delphi.
- Reproducibilidad de experimentos: al publicarse la receta, el codigo y los runs de W&B, permite reentrenar o comparar el efecto de la semilla y del presupuesto de computo en un entorno controlado.
- Estudio de optimizadores: al usar AdamH con restriccion a la esfera de Frobenius, es util para analizar el impacto del weight decay y de la norma de pesos en el entrenamiento de transformers pequenos.
- Fine-tuning supervisado como base para tareas en ingles: con 2.9B parametros y contexto de 4096, es viable adaptarlo con SFT para clasificacion, extraccion o generacion de dominio especifico en una unica GPU de 24-48 GB.
- Generacion de codigo asistida tras fine-tuning: la presencia de StarCoderData en el preentrenamiento proporciona una base para tareas de autocompletado o generacion de fragmentos, siempre con ajuste posterior.
- Razonamiento matematico y formal experimental: la inclusion de ProofPile 2 lo hace adecuado para estudiar transferencia a tareas de demostracion o aritmetica tras ajuste, no directamente en zero-shot.
- Baseline en comparativas de eficiencia: util para medir throughput y latencia de un transformer de 2.9B con atencion completa (sin GQA) frente a alternativas con GQA o contextos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,8 GB solo para pesos (2.895.178.112 parametros x 2 bytes), mas KV cache y activaciones; en la practica, entre 7 y 10 GB para contexto moderado.
- VRAM estimada en fp32: aproximadamente 11,6 GB solo para pesos.
- Cuantizacion a 8 bits: unos 2,9 GB de pesos; a 4 bits, unos 1,5 GB (no se distribuyen GGUF oficiales, requeriria conversion propia).
- GPU consumer: cabe en RTX 3090, RTX 4090, RTX 4080 y GPUs con 12 GB o mas en bf16; en 8 GB requeriria cuantizacion.
- GPU de datacenter recomendadas: A100 40/80 GB, H100, L40S, para servir con mayor batch y throughput.
- Opciones de despliegue: transformers (referencia), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama mediante conversion a GGUF no oficial.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Delphi-6e20-2.9B (este) | 2,90B | 4096 | Apache 2.0 (`research-only`) | Base de investigacion, leyes de escala | Hugging Face (rohithck, marin-community) |
| Pythia-2.8B | 2,77B | 2048 | Apache 2.0 | Suite de interpretabilidad y escalado | Hugging Face (EleutherAI) |
| Qwen3-1.7B / Qwen3-4B | 1,7B / 4B | 32.768 (nativo) | Apache 2.0 | Base e instruct, multilingue | Hugging Face (Qwen) |
| Llama 3.2 3B | 3,21B | 131.072 | Llama 3.2 Community License | Base e instruct, multilingue | Hugging Face (Meta) |

Comparado con Pythia, Delphi ofrece una receta de escalado mas reciente y un proceso de extrapolacion documentado; frente a Qwen3 y Llama 3.2, este checkpoint carece de contexto largo, multilingue, ajuste por instrucciones y evaluaciones publicadas, por lo que no es un sustituto directo en produccion.

## Limitaciones y advertencias

- Modelo preentrenado sin ajuste por instrucciones, RLHF ni alineamiento de seguridad: puede generar contenido sesgado, toxico o inseguro.
- Entrenado sobre una mezcla web mayoritariamente en ingles; sin cobertura multilingue declarada.
- Riesgo de alucinacion alto en uso generativo directo, al no haber pasado por evaluacion ni calibracion.
- La receta Delphi optimiza el computo de entrenamiento, no el coste de inferencia; para despliegues con mucha carga de inferencia, un modelo mas pequeno sobrentrenado puede ser preferible (el blog cuantifica la penalizacion por entrenamiento fuera del optimo).
- Etiquetado como `research-only` por el autor pese a la licencia Apache 2.0; el propio autor advierte que no ha sido probado ni evaluado adecuadamente y que puede no ser seguro para produccion.
- Sin GQA y con contexto de 4096 tokens: el KV cache crece de forma lineal y el rendimiento en contextos largos es limitado frente a alternativas modernas.
- No se publican resultados de evaluacion, por lo que no es posible verificar su calidad frente a baselines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-6e20-2.9Bparams-29.9Btokens
- Coleccion completa Delphi: https://huggingface.co/marin-community
- Blog de Delphi: https://openathena.ai/blog/delphi
- Dataset de datos de las figuras: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Codigo de la receta (Complete(d)P + AdamH): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-6e20-seed0-2026.09.22
- Referencia sobre AdamH (Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia (inspiracion de la suite): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
