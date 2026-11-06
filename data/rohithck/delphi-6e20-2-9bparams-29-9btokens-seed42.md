# rohithck/delphi-6e20-2.9Bparams-29.9Btokens-seed42

## Resumen

Delphi-6e20-2.9Bparams-29.9Btokens-seed42 es un checkpoint de modelo base de la suite de escalado Delphi, desarrollada por el equipo Marin (marin-community). Se trata de un transformer decoder de 2.895.178.112 parametros entrenado sobre 29.916.397.568 tokens con una semilla de entrenamiento fija (42) y un presupuesto de computo configurado de 5,5e20 FLOPs, de ahi la etiqueta `6e20` del repositorio. La arquitectura sigue el diseno Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm con escalado aprendido y MLPs SwiGLU).

El interes de este checkpoint no reside en sus capacidades como modelo de produccion, sino en su papel como artefacto de investigacion. Delphi es la primera suite de escalado abierta del equipo Marin, inspirada en Pythia, y consta de tres piezas: una receta de escalado que mapea presupuestos de computo a configuraciones de modelo, una suite de modelos entrenados con esa receta en presupuestos IsoFLOP de 3e18 a 1e23 FLOPs, y una ley de escalado que predice los modelos mayores a partir de los pequenos. La prediccion pre-registrada de esa ley acerto el loss final del mayor run de Delphi (1e23 FLOPs, 25 B parametros, 600 B tokens) con un error del 0,2 %, usando 300 veces menos computo que el propio entrenamiento.

Este checkpoint concreto pertenece a una extension de Delphi con semillas y presupuestos de computo adicionales, manteniendo la receta original. Su licencia es Apache 2.0, pero el autor lo etiqueta explicitamente como `research-only` y advierte de que no ha sido probado ni evaluado adecuadamente. El contexto maximo es de 4096 tokens, el vocabulario es de 128.256 entradas con tokenizer Llama 3 y el modelo solo cubre ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU MLP) |
| Parametros totales | 2.895.178.112 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en safetensors; el repo ocupa 11,6 GB) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 (etiquetado `research-only` por el autor) |
| Formato de pesos | safetensors (libreria transformers, `architectures: ["Qwen3ForCausalLM"]`) |

Detalles adicionales de arquitectura: hidden size 2432, 24 capas, 19 cabezas de atencion, 19 KV heads (sin GQA), head dim 128, FFN intermedio 9728 (ratio MLP 4), vocab 128.256 (tokenizer Llama 3), RoPE con theta 500000 y escalado estilo Llama 3, sin terminos de bias y sin embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Qwen 3 con 24 capas y 2432 dimensiones ocultas. Emplea pre-norm con RMSNorm, RoPE con theta 500000 y escalado de posiciones estilo Llama 3, QK-norm con escalado aprendido y MLPs SwiGLU con dimension intermedia de 9728. No usa GQA: las 19 cabezas de atencion coinciden con las 19 KV heads. El tokenizer es el de Llama 3 con vocabulario de 128.256 entradas y los embeddings no estan atados.

El entrenamiento consumio 5,5e20 FLOPs en 57.061 pasos sobre secuencias de 4096 tokens, con precision f32 en parametros maestros y bf16 en computo, paralelismo FSDP y el optimizador AdamH (Adam con Hyperball), que restringe cada peso de proyeccion a permanecer sobre la esfera de norma de Frobenius en la que se inicializo, de modo que el weight decay queda fuera de la receta. La tasa de aprendizaje sigue un esquema WSD con 10 % de warmup lineal, 20 % de decaimiento lineal y suelo cero, y se ajusta mediante una regla de transferencia estilo Complete(d)P con correccion `(T0/T)^0.3` a medida que crece el horizonte de tokens. Las constantes de referencia son B0 = 64, T0 = 2,5 B tokens, eta0 = 0,00630, eta0,Adam = 0,000656 y epsilon0 = 1,85e-8. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. No consta RLHF, DPO ni ninguna fase de alineacion posterior al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base preentrenado.
- Razonamiento y conocimiento general derivados del preentrenamiento sobre Nemotron-CC, sin ajuste instructivo.
- Generacion de codigo, gracias a la inclusion de StarCoderData en la mezcla de entrenamiento.
- Razonamiento matematico y demostraciones formales, por la presencia de ProofPile 2 en los datos.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (sin instruction tuning ni alineacion).
- Capacidades multilingues: no disponibles; el modelo esta entrenado solo en ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Capacidad de continuacion de texto con prompts largos de hasta 4096 tokens.

## Casos de uso

- Investigacion sobre leyes de escalado: el checkpoint sirve como punto de la rejilla IsoFLOP para ajustar y validar leyes de escalado, comparando su loss con el de otros modelos de la suite a presupuestos de computo equivalentes.
- Estudios de reproducibilidad y varianza entre semillas: al estar entrenado con la semilla 42 dentro de una extension con multiples semillas, permite medir la dispersion del loss y de las metricas downstream atribuible al azar de inicializacion y orden de datos.
- Analisis de dinamica de entrenamiento: los checkpoints intermedios de la suite Delphi permiten estudiar la evolucion de representaciones y de la perdida a lo largo del entrenamiento.
- Experimentos de receta de optimizacion: al usar AdamH y una regla de transferencia Complete(d)P con correccion de horizonte de tokens, sirve para contrastar empiricamente estas tecnicas frente a recetas mas convencionales.
- Fine-tuning academico en ingles sobre tareas acotadas: con 2,9 B parametros y licencia Apache 2.0, es viable ajustarlo en un unico nodo de GPU para tareas de clasificacion, extraccion o generacion de codigo en dominios concretos.
- Generacion de codigo como modelo base: la presencia de StarCoderData en la mezcla permite usarlo como punto de partida para ajuste supervisado en tareas de programacion, siempre con evaluacion propia.
- Baseline en comparativas de eficiencia: al ser un modelo denso de 2,9 B parametros y contexto 4096, resulta util como referencia frente a modelos mas pequenos sobrentrenados en escenarios con mucha carga de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release. El blog de Delphi menciona proyecciones downstream sobre MMLU, HumanEval y GSM8K mediante una regresion en dos pasos que combina leyes de escalado de computo y observacionales, pero no se proporcionan cifras concretas para este checkpoint en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 5,8 GB solo para pesos (2,895 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 7 y 9 GB con contexto completo de 4096 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3 GB para pesos; en 4 bits, alrededor de 1,5 GB (valores estimados a partir del numero de parametros, no publicados por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegue en bf16 sin cuantizar con margen amplio; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bf16 en inferencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp son opciones razonables dado el formato safetensors y la arquitectura Qwen3, aunque no se confirman explicitamente en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Delphi-6e20-2.9B-seed42 | 2,895 B | 4096 | Apache 2.0 (research-only) | Base preentrenado, artefacto de scaling laws | Hugging Face (rohithck) |
| Pythia-2.8B | 2,8 B | 2048 | Apache 2.0 | Suite de interpretabilidad y scaling | Hugging Face (EleutherAI) |
| Qwen3-1.7B | 1,7 B | 32.768 | Apache 2.0 | Base e instruct, multilingue | Hugging Face (Qwen) |
| Qwen3-4B | 4 B | 32.768 | Apache 2.0 | Base e instruct, multilingue | Hugging Face (Qwen) |

La comparacion con Pythia es la mas directa por proposito: ambas son suites de investigacion con checkpoints intermedios y semillas multiples, aunque Pythia usa contexto 2048 y una receta distinta. Frente a Qwen3, el Delphi ofrece menos contexto (4096 frente a 32.768), solo ingles y carece de version instruct, pero su interes esta en la trazabilidad de la receta de escalado y en la prediccion pre-registrada de la ley. No se dispone de datos de rendimiento comparativo publicados para este checkpoint.

## Limitaciones y advertencias

- Modelo solo preentrenado: no hay instruction tuning, RLHF ni alineacion de seguridad, por lo que no es adecuado para uso conversacional directo sin ajuste.
- Entrenado sobre una mezcla web mayoritariamente en ingles; no hay cobertura multilingue.
- El autor lo etiqueta como `research-only` y advierte de que no ha sido probado ni evaluado adecuadamente y de que no es necesariamente seguro.
- Riesgo de alucinacion y de generar contenido sesgado o toxico heredado de los datos web (Nemotron-CC), sin filtros posteriores.
- La receta Delphi prioriza el entrenamiento optimo en computo, no el sobrentrenamiento orientado a inferencia; para despliegues con mucha carga de inferencia, un modelo mas pequeno sobrentrenado puede ser preferible, y el propio blog cuantifica la penalizacion por entrenamiento fuera del optimo.
- Contexto limitado a 4096 tokens, insuficiente para tareas de documento largo o conversaciones muy extensas.
- Aunque la licencia es Apache 2.0, la etiqueta `research-only` del autor debe tenerse en cuenta al evaluar un uso comercial.
- Es un checkpoint dentro de una release mayor; conviene elegir el que corresponda al regimen de computo, parametros y tokens deseado antes de usarlo como base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-6e20-2.9Bparams-29.9Btokens-seed42
- Organizacion Marin en Hugging Face: https://huggingface.co/marin-community
- Blog de Delphi, "Scaling Laws That Extrapolate 300× Past the Fit": https://openathena.ai/blog/delphi
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Codigo de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en WandB: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-6e20-seed42-2026.09.22
- Paper de Pythia (inspiracion): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
- Adam with Hyperball (AdamH): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
