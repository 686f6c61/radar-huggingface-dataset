# rohithck/delphi-9e18-550Mparams-2.9Btokens-seed42

## Resumen

Delphi-9e18-550Mparams-2.9Btokens-seed42 es un modelo base (pretrained, sin ajuste por instrucciones) de 550.337.664 parametros, desarrollado por rohithck como parte de la suite de escalado Delphi del equipo Marin. Se trata de un checkpoint de una extension de Delphi con semillas de entrenamiento y presupuestos de computo adicionales, entrenado con 2.904.358.912 tokens bajo un presupuesto de computo de 9e18 FLOPs (etiqueta de repositorio `9e18`).

El modelo emplea la arquitectura Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm con escalado aprendido y MLPs SwiGLU), con 12 capas, tamano oculto 1152, 9 cabezas de atencion (sin GQA) y una longitud maxima de secuencia de 4096 tokens. Su interes no reside en el rendimiento absoluto, sino en su papel como artefacto de investigacion: forma parte de un conjunto disenado para ajustar leyes de escalado que extrapolan predicciones de perdida y benchmarks hasta 300 veces mas alla del rango de ajuste.

La relevancia actual del checkpoint es metodologica: permite reproducir y validar las predicciones de la ley de escalado de Delphi, asi como estudiar el efecto de la semilla de entrenamiento (seed 42) en un regimen de computo concreto. No es un modelo destinado a produccion: la propia model card lo etiqueta como `research-only` y advierte de que no ha sido evaluado ni asegurado adecuadamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU) |
| Parametros totales | 550.337.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision de entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers, `Qwen3ForCausalLM`) |

Datos adicionales de la configuracion: hidden size 1152, 12 capas, 9 cabezas de atencion, 9 KV heads (sin GQA), head dim 128, FFN intermedio 4608 (ratio MLP 4), vocabulario 128.256 (tokenizer Llama 3), RoPE con theta 500000 y escalado estilo Llama 3, sin terminos de bias y sin embeddings atados. Tamano del repo: 2,2 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la pila de Qwen 3: pre-normalizacion con RMSNorm, atencion con QK-norm y escalado aprendido, RoPE con theta 500000 y escalado de posiciones estilo Llama 3, y MLPs SwiGLU. No usa GQA (9 cabezas de atencion y 9 KV heads), lo que implica una cache KV relativamente grande para su tamano. El vocabulario de 128.256 tokens procede del tokenizer de Llama 3.

El entrenamiento se realizo sobre 2.904.358.912 tokens en 44.317 pasos con secuencias de 4096 tokens, usando FSDP, parametros maestros en f32 y computo en bf16. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. El optimizador es AdamH (Adam con Hyperball), que restringe cada matriz de pesos a permanecer sobre la esfera de norma de Frobenius en la que se inicializo, eliminando la necesidad de weight decay. La tasa de aprendizaje sigue un esquema WSD (10% warmup lineal, 20% decaimiento lineal, suelo 0) con una regla de transferencia estilo Complete(d)P y correccion `(T0/T)^0.3` a medida que crece el horizonte de tokens; las constantes de referencia son B0 = 64, T0 = 2,5 B tokens, eta0 = 0,00630, eta0,Adam = 0,000656 y epsilon0 = 1,85e-8.

La innovacion destacable no esta en el modelo en si, sino en el marco experimental: Delphi ajusta una ley de escalado con modelos pequenos y predice la perdida final del run mayor (1e23 FLOPs, 25 B parametros, 600 B tokens) con un error del 0,2%, usando 300 veces menos computo. Este checkpoint concreto (seed 42) forma parte de la extension con semillas y presupuestos adicionales.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt; es un modelo base, no un asistente.
- Razonamiento y conocimiento general derivados de la mezcla web de Nemotron-CC.
- Generacion de codigo, gracias a la inclusion de StarCoderData en el entrenamiento.
- Razonamiento matematico y formal, por la presencia de ProofPile 2.
- Soporte de tool calling / function calling: no disponible (no hay ajuste por instrucciones ni plantilla de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriria prompting o ajuste posterior.
- Capacidades multilingues: no disponibles; solo ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Capacidad de continuacion de texto y modelado de lenguaje para investigacion de dinamicas de entrenamiento.

## Casos de uso

- Investigacion sobre leyes de escalado: usar este checkpoint como punto de la rejilla IsoFLOP (9e18 FLOPs, seed 42) para validar o recalibrar la ley de escalado de Delphi y estudiar la varianza entre semillas.
- Estudio de recetas de optimizacion: analizar el efecto de AdamH y de la correccion de horizonte de tokens `(T0/T)^0.3` comparando este checkpoint con otros de la misma suite entrenados con recetas distintas.
- Reproducibilidad de mezclas de datos: los pipelines de Marin permiten regenerar deterministicamente la mezcla Nemotron-CC + StarCoderData + ProofPile 2, de modo que el modelo sirve para experimentos controlados de composicion de datos.
- Generacion de codigo en investigacion: al haberse entrenado con StarCoderData, puede emplearse para estudiar la evolucion de la capacidad de codigo a lo largo del entrenamiento comparando checkpoints intermedios.
- Razonamiento matematico basico en entornos de investigacion: ProofPile 2 aporta datos formales, lo que permite explorar como emerge la capacidad matematica en modelos de este tamano.
- Prototipado de bajo coste: con 550 M parametros cabe en una unica GPU consumer para experimentos de inferencia, ajuste fino o evaluacion de tecnicas de decodificacion sin infraestructura dedicada.
- Docencia y divulgacion: ejemplo reproducible de un modelo base pequeno con configuracion y run de W&B publicos, util para explicar el ciclo completo de entrenamiento a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release. El blog de Delphi presenta proyecciones de MMLU, HumanEval y GSM8K derivadas de la ley de escalado, pero no cifras medidas para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,1 GB para los pesos (550 M parametros x 2 bytes), mas cache KV y activaciones; en la practica, entre 2 y 4 GB con contexto completo de 4096 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,6 GB para pesos; en 4 bits, alrededor de 0,3 GB (las cuantizaciones no se publican en el repo y habria que generarlas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, asi como A100/H100 para lotes grandes o entrenamiento.
- Cabe holgadamente en GPU consumer: si, incluidas GPUs de 8 GB o menos con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo, `Qwen3ForCausalLM`), text-generation-inference (el repo declara `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 550 M parametros y sin GQA, el throughput sera alto pero la cache KV crecera rapido con el contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| delphi-9e18-550Mparams-2.9Btokens-seed42 | 550 M | 4096 | apache-2.0 | Base, ley de escalado | HuggingFace (rohithck) |
| Pythia-410M | 410 M | 2048 | apache-2.0 | Base, suite de escalado | HuggingFace (EleutherAI) |
| Qwen3-0.6B | 600 M | 32.768 | apache-2.0 | Base e instruct | HuggingFace (Qwen) |
| SmolLM-360M | 360 M | 2048 | apache-2.0 | Base e instruct | HuggingFace (HuggingFaceTB) |

La comparacion con Pythia es la mas directa por su naturaleza de suite de investigacion sobre escalado; Qwen3-0.6B y SmolLM ofrecen contextos mayores y variantes ajustadas por instrucciones, pero no estan disenados como artefactos de estudio de leyes de escalado. No se dispone de datos de rendimiento medidos para este checkpoint, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles; no hay cobertura multilingue.
- Es un modelo base sin ajuste por instrucciones, RLHF ni alineamiento de seguridad; no debe usarse como asistente sin un ajuste posterior.
- Riesgo elevado de alucinacion y de generar contenido inapropiado, dado que no ha pasado por filtros de alineamiento.
- La model card lo etiqueta como `research-only` y advierte de que no ha sido probado ni evaluado adecuadamente y de que no es necesariamente seguro.
- La receta Delphi optimiza el coste de entrenamiento, no el de inferencia; para despliegues con mucha inferencia, un modelo mas pequeno sobrentrenado puede ser preferible.
- Sin GQA, la cache KV es mayor de lo habitual para su tamano, lo que penaliza el throughput con contextos largos.
- Contexto maximo de 4096 tokens, inferior al de modelos contemporaneos de tamano similar.
- Aunque la licencia es apache-2.0, el uso comercial no esta respaldado por evaluaciones de calidad o seguridad; se recomienda validacion propia antes de cualquier despliegue.
- Es un checkpoint dentro de una release mayor; debe elegirse el que corresponda al regimen de computo, parametros y tokens del experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohithck/delphi-9e18-550Mparams-2.9Btokens-seed42
- Blog de Delphi (ley de escalado): https://openathena.ai/blog/delphi
- Organizacion Marin en HuggingFace (suite completa): https://huggingface.co/marin-community
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Codigo de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-9e18-seed42-2026.09.22
- Articulo sobre AdamH (Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia (inspiracion de la suite): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
