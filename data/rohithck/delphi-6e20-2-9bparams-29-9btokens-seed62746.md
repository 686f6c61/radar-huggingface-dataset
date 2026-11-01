# rohithck/delphi-6e20-2.9Bparams-29.9Btokens-seed62746

## Resumen

Delphi-6e20-2.9Bparams-29.9Btokens-seed62746 es un modelo base de 2.895.178.112 parámetros desarrollado por el equipo Marin (comunidad open source vinculada a Open Athena) como parte de la suite de escalado Delphi. Se trata de un checkpoint concreto de una extensión de dicha suite que anade semillas de entrenamiento y presupuestos de computo adicionales, manteniendo la receta original de Delphi. El modelo se entreno con 29.916.397.568 tokens bajo un presupuesto de computo configurado de 5,5e20 FLOPs (de ahi la etiqueta `6e20` del repositorio).

Delphi es la primera suite de escalado abierta del equipo Marin, inspirada en Pythia. Consta de tres piezas: una receta de escalado que mapea presupuestos de computo a configuraciones de modelo, una suite de modelos entrenados con esa receta en presupuestos IsoFLOP desde 3e18 hasta 1e23 FLOPs, y una ley de escalado que usa los modelos pequenos para predecir los grandes. La relevancia de este checkpoint es fundamentalmente de investigacion: forma parte de un experimento sobre leyes de escalado y reproducibilidad con multiples semillas, no de un modelo pensado para despliegue en produccion.

La arquitectura sigue el diseno Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm con escalado aprendido y MLPs SwiGLU), con 24 capas, hidden size de 2432 y una longitud maxima de secuencia de 4096 tokens. El modelo es solo preentrenado, sin ajuste por instrucciones ni alineamiento de seguridad, y esta etiquetado por el autor como artefacto de investigacion ("research-only").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU MLP) |
| Parametros totales | 2.895.178.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo publica pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; `architectures: ["Qwen3ForCausalLM"]`) |

Detalles adicionales de configuracion:

| Parametro | Valor |
|---|---|
| Hidden size | 2432 |
| Capas | 24 |
| Cabezas de atencion | 19 |
| Cabezas KV | 19 (sin GQA) |
| Dimension de cabeza | 128 |
| FFN intermedio | 9728 (ratio MLP 4) |
| Vocabulario | 128.256 (tokenizer Llama 3) |
| Codificacion posicional | RoPE (theta = 500000, escalado estilo Llama 3) |
| Bias | ninguno |
| Embeddings atados | no |
| Tamano del repo | 11,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuracion de Qwen 3 descrita arriba: pre-norm con RMSNorm, RoPE con theta de 500000 y escalado estilo Llama 3, QK-norm con escalado aprendido, MLPs SwiGLU y ausencia de bias. No emplea GQA (19 cabezas de atencion y 19 cabezas KV), lo que implica un KV cache relativamente grande para su tamano. Los embeddings no estan atados y el vocabulario es el del tokenizer Llama 3 (128.256 entradas).

El entrenamiento se realizo con 29.916.397.568 tokens en 57.061 pasos, con secuencias de 4096 tokens, semilla 62746 y un presupuesto de computo de 5,5e20 FLOPs. Se uso el optimizador AdamH (Adam con Hyperball), que restringe cada peso de proyeccion a permanecer sobre la esfera de norma de Frobenius en la que se inicializo, de modo que el weight decay deja de tener sentido en la receta. La tasa de aprendizaje sigue un esquema WSD (10% warmup lineal, 20% decaimiento lineal, suelo 0) con una regla de transferencia estilo Complete(d)P y correccion `(T0/T)^0.3` a medida que crece el horizonte de tokens. Las constantes de referencia son B0 = 64, T0 = 2,5e9 tokens, eta0 = 0,00630, eta0,Adam = 0,000656 y epsilon0 = 1,85e-8. El entrenamiento uso precision f32 para los parametros maestros, computo en bf16 y paralelismo FSDP.

La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. El autor advierte que la revision de codigo enlazada publica la receta registrada, pero no identifica el checkout exacto usado para la ejecucion completa de entrenamiento. El export de inferencia declara `Qwen3ForCausalLM` y los pesos no se modificaron respecto al entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base.
- Razonamiento y conocimiento general derivados del preentrenamiento sobre Nemotron-CC.
- Generacion de codigo, gracias a la inclusion de StarCoderData en la mezcla.
- Razonamiento matematico y demostraciones formales, por la presencia de ProofPile 2.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste por instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa (requiere ajuste posterior).
- Capacidades multilingues: no, entrenado sobre una mezcla predominantemente inglesa.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Contexto maximo de 4096 tokens.

## Casos de uso

- Investigacion sobre leyes de escalado: el checkpoint sirve para reproducir y validar los ajustes de la ley de escalado de Delphi y estudiar la variabilidad entre semillas a un presupuesto fijo de 5,5e20 FLOPs.
- Estudios de reproducibilidad: al ser una semilla concreta (62746) de una extension con multiples semillas, permite analizar la dispersion de resultados de entrenamiento bajo una receta identica.
- Punto de referencia para experimentos de mezcla de datos: la combinacion Nemotron-CC + StarCoderData + ProofPile 2 lo hace util como baseline en estudios sobre ponderacion de dominios (web, codigo, matematicas).
- Fine-tuning supervisado para tareas de codigo: su componente StarCoderData lo hace razonable como punto de partida para ajuste en tareas de generacion de codigo en ingles, siempre asumiendo el coste de un ajuste adicional.
- Fine-tuning para tareas de razonamiento matematico: ProofPile 2 aporta datos de demostraciones que pueden aprovecharse en un ajuste posterior para tareas de matematicas.
- Base para experimentos de decodificacion y evaluacion: util para comparar tecnicas de muestreo, decodificacion especulativa o evaluacion de perplejidad en un rango de computo controlado.
- Docencia y formacion: modelo de tamano moderado (2,9B) que cabe en GPUs de consumo con cuantizacion y permite ilustrar el pipeline completo de preentrenamiento, tokenizacion Llama 3 y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release. La publicacion de Delphi describe proyecciones de benchmarks posteriores (MMLU, HumanEval, GSM8K) mediante una regresion en dos pasos que combina leyes de escalado de computo y observacionales, pero no se proporcionan cifras concretas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 5,8 GB solo para pesos (2,895e9 parametros x 2 bytes), mas KV cache y activaciones; en la practica, entre 7 y 9 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3 GB para pesos; en 4 bits, alrededor de 1,5 GB (estimaciones teoricas, no se documentan variantes cuantizadas oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue comodo en bf16; tambien valido en RTX 4090 (24 GB) y RTX 3090 (24 GB) sin problema en bf16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) e incluso en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF oficiales).
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Delphi-6e20-2.9B (este) | 2,895e9 | 4096 | Apache 2.0 | Modelo base de suite de escalado, solo ingles, research-only | HuggingFace (rohithck, marin-community) |
| Pythia-2.8B | 2,8e9 | 2048 | Apache 2.0 | Suite de escalado con checkpoints intermedios, solo ingles | EleutherAI en HuggingFace |
| Qwen3-1.7B | 1,7e9 | 32.768 (nativo) | Apache 2.0 | Modelo base/instruido multilingue con modo thinking | Alibaba en HuggingFace |
| Qwen3-4B | 4e9 | 32.768 (nativo) | Apache 2.0 | Modelo base/instruido multilingue con modo thinking | Alibaba en HuggingFace |

La comparacion con Pythia es la mas directa por filosofia (suite de escalado con semillas multiples y checkpoints intermedios). Frente a Qwen3, la diferencia clave es que Delphi es solo preentrenado, solo ingles y con contexto de 4096, mientras que Qwen3 ofrece contexto mucho mayor, multilingue y versiones instruidas. Los datos de rendimiento de Delphi no estan publicados, por lo que no es posible comparar metricas de benchmarks de forma directa.

## Limitaciones y advertencias

- Entrenado sobre una mezcla web predominantemente inglesa; sin cobertura multilingue.
- Solo preentrenado: no hay ajuste por instrucciones, RLHF ni alineamiento de seguridad. No debe usarse directamente como asistente conversacional.
- El autor lo etiqueta como artefacto de investigacion y advierte que no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; uso en produccion bajo responsabilidad del usuario.
- La receta Delphi prioriza el entrenamiento optimo en computo, no el sobrentrenamiento orientado a coste de inferencia; para despliegues con mucha inferencia, un modelo mas pequeno sobrentrenado puede ser preferible.
- Contexto limitado a 4096 tokens, insuficiente para tareas de contexto largo.
- Sin GQA, el KV cache es mayor de lo habitual para su tamano, lo que penaliza el throughput en serving con lotes grandes.
- Riesgo de alucinacion y sesgos propios de un modelo base sin alineamiento.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza de artefacto de investigacion y la falta de evaluacion desaconsejan su uso en produccion sin validacion previa.
- El repositorio tiene muy poca traccion (81 descargas, 0 likes) y no se documentan variantes cuantizadas oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohithck/delphi-6e20-2.9Bparams-29.9Btokens-seed62746
- Blog de Delphi ("Scaling Laws That Extrapolate 300x Past the Fit"): https://openathena.ai/blog/delphi
- Organizacion marin-community en HuggingFace (todos los checkpoints Delphi): https://huggingface.co/marin-community
- Dataset con datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Codigo de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Ejecucion de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-6e20-seed62746-2026.09.22
- Articulo sobre AdamH (Adam with Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia (inspiracion de la suite): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
