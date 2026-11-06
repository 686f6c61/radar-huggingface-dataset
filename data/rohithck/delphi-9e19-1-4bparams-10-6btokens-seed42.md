# rohithck/delphi-9e19-1.4Bparams-10.6Btokens-seed42

## Resumen

Delphi-9e19-1.4Bparams-10.6Btokens-seed42 es un modelo base (no instruido) de 1.384.584.448 parametros desarrollado por la comunidad Marin, publicado en el Hub por el usuario `rohithck`. Forma parte de la suite de escalado Delphi, inspirada en Pythia, que relaciona presupuestos de computo con configuraciones de modelo y entrena checkpoints en una rejilla IsoFLOP entre 3e18 y 1e23 FLOPs. Este checkpoint concreto corresponde a un presupuesto de 9e19 FLOPs, con semilla de entrenamiento 42, y es una de las extensiones de Delphi con semillas y presupuestos adicionales.

La arquitectura es un decoder transformer de estilo Qwen 3 (pre-norm, RMSNorm, RoPE con QK-norm, MLP SwiGLU), con 18 capas, hidden size 1792, 14 cabezas de atencion sin GQA y un vocabulario de 128.256 tokens basado en el tokenizer de Llama 3. Se entreno sobre 10.559.946.752 tokens con una mezcla de Nemotron-CC, StarCoderData y ProofPile 2, lo que le da cobertura de texto web, codigo y matematicas formales.

Su relevancia es fundamentalmente metodologica: sirve como artefacto de investigacion para estudiar leyes de escalado, reproducibilidad de recetas y transferencia de hiperparametros (AdamH, correccion de horizonte de tokens). No es un modelo pensado para produccion: el propio autor lo etiqueta como `research-only` y advierte que no ha sido evaluado ni alineado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, MLP SwiGLU) |
| Parametros totales | 1.384.584.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (mezcla web con predominio de ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Detalles adicionales de configuracion: hidden size 1792, 18 capas, 14 cabezas de atencion, 14 KV heads (sin GQA), head dim 128, FFN intermedio 7168 (ratio MLP 4), vocab 128.256 (tokenizer Llama 3), RoPE con theta 500000 y escalado estilo Llama 3, sin terminos de bias y sin embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Qwen 3, con pre-norm, RMSNorm, RoPE y QK-norm con escalado aprendido, y MLPs SwiGLU. No emplea GQA (14 cabezas de atencion y 14 KV heads) ni embeddings atados. La exportacion de inferencia declara `architectures: ["Qwen3ForCausalLM"]` y los pesos son identicos a los del entrenamiento.

El entrenamiento consumio 9e19 FLOPs sobre 10.559.946.752 tokens en 40.283 pasos, con longitud de secuencia 4096, precision f32 para parametros maestros y bf16 para computo, y paralelismo FSDP. El optimizador es AdamH (Adam con Hyperball), que restringe cada peso de proyeccion a la esfera de norma de Frobenius en la que se inicializo, eliminando la necesidad de weight decay. La tasa de aprendizaje sigue un schedule WSD (10% warmup lineal, 20% decaimiento lineal, suelo 0) con una regla de transferencia estilo Complete(d)P y correccion `(T0/T)^0.3` conforme crece el horizonte de tokens. Las constantes de referencia son B0 = 64, T0 = 2.5e9 tokens, eta0 = 0.00630, eta0,Adam = 0.000656 y epsilon0 = 1.85e-8. La mezcla de datos combina Nemotron-CC (web), StarCoderData (codigo) y ProofPile 2 (matematicas formales).

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, en modo base (sin instrucciones).
- Modelado de lenguaje y continuacion de texto sobre dominios web, codigo y matematicas formales, dada la composicion del dataset.
- Generacion y completion de codigo, gracias a la inclusion de StarCoderData en el entrenamiento.
- Razonamiento matematico basico y manipulacion de notacion formal, por la presencia de ProofPile 2.
- No dispone de tool calling ni function calling: es un checkpoint preentrenado sin post-entrenamiento.
- No soporta agentes ni razonamiento multi-paso de forma nativa; requeriria prompting o fine-tuning especifico.
- Capacidad multilingue practicamente nula: el autor indica explicitamente que no hay cobertura multilingue.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre leyes de escalado: el checkpoint es un punto de la rejilla IsoFLOP de Delphi y permite validar predicciones de loss y de benchmarks downstream a partir de modelos menores, reproduciendo el ejercicio de extrapolacion a 300x descrito en el blog.
- Estudios de reproducibilidad de recetas: al estar entrenado con semilla 42 y con la receta Delphi documentada, sirve para medir la varianza entre semillas y comprobar la estabilidad de AdamH y del schedule WSD en presupuestos de 9e19 FLOPs.
- Analisis de transferencia de hiperparametros: util para contrastar la regla Complete(d)P con correccion `(T0/T)^0.3` frente a otras heuristicas de ajuste de learning rate en funcion del horizonte de tokens.
- Fine-tuning como base de dominio en ingles: con 1.4B parametros y contexto de 4096, es viable afinar para tareas de clasificacion, extraccion o generacion acotada en dominios tecnicos o cientificos.
- Experimentos de completion de codigo en entornos controlados: la mezcla con StarCoderData permite evaluar la calidad de generacion de codigo de un modelo base pequeno antes de aplicar instruccion.
- Docencia y cursos de LLMs: su tamano permite ejecutarlo en una unica GPU consumer para demostrar tokenizacion, atencion, RoPE y efectos del schedule de learning rate en un modelo real.
- Baseline en comparativas de eficiencia: sirve como referencia compute-optimal frente a modelos sobrentrenados mas pequenos, tal y como sugiere el propio autor para despliegues intensivos en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,8 GB solo para pesos (1.384.584.448 parametros x 2 bytes), mas cache KV y activaciones; en la practica, entre 4 y 6 GB para contexto de 4096.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,4 GB para pesos; en 4 bits, alrededor de 0,7 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo es holgadamente apto para consumer GPU.
- Despliegue: compatible con transformers y text-generation-inference segun los tags del Hub; tambien es convertible a GGUF para llama.cpp u Ollama, aunque no se documenta ninguna conversion oficial.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Delphi-9e19-1.4B (este) | 1,38B | 4096 | Apache 2.0 | Suite de escalado, base research-only | Hugging Face (`rohithck`) |
| Pythia-1.4B | 1,4B | 2048 | Apache 2.0 | Suite de escalado con checkpoints intermedios | Hugging Face (EleutherAI) |
| Qwen3-1.7B | 1,7B | no disponible en la informacion | Apache 2.0 | Modelo base/instruido de proposito general | Hugging Face (Qwen) |
| SmolLM2-1.7B | 1,7B | no disponible en la informacion | Apache 2.0 | Modelo base/instruido compacto | Hugging Face (HuggingFaceTB) |

La comparacion con Pythia es la mas directa por filosofia (suite de escalado con receta documentada), mientras que Qwen3 y SmolLM2 representan alternativas de proposito general con post-entrenamiento. No se dispone de datos de rendimiento comparativo para este checkpoint.

## Limitaciones y advertencias

- Modelo preentrenado sin instruccion, RLHF ni alineacion de seguridad: no debe usarse directamente en produccion orientada a usuarios sin post-entrenamiento.
- El autor lo marca como `research-only` y advierte que no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro.
- Entrenado con una mezcla web con predominio de ingles; no hay cobertura multilingue.
- Riesgo de alucinacion y de reproducir sesgos presentes en Nemotron-CC, StarCoderData y ProofPile 2, sin filtros adicionales documentados.
- Ventana de contexto limitada a 4096 tokens, insuficiente para tareas de contexto largo.
- La receta Delphi optimiza el coste de entrenamiento, no el de inferencia; para despliegues con mucha inferencia, un modelo mas pequeno y sobrentrenado puede ser preferible.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion y de alineacion traslada al integrador toda la responsabilidad sobre calidad y seguridad.
- Es un checkpoint dentro de una release mayor; conviene seleccionar el que corresponda al regimen de computo, parametros y tokens adecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-9e19-1.4Bparams-10.6Btokens-seed42
- Blog de Delphi (leyes de escalado): https://openathena.ai/blog/delphi
- Organizacion Marin en Hugging Face: https://huggingface.co/marin-community
- Dataset de datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Codigo de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-9e19-seed42-2026.09.22
- Paper de Pythia (inspiracion): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
- Adam with Hyperball (referencia del optimizador): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
