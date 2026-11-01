# rohithck/delphi-3e18-447Mparams-1.2Btokens-seed42

## Resumen

Delphi-3e18-447M es un modelo de lenguaje base de 447.244.032 parametros desarrollado por el equipo Marin (autor del checkpoint en el Hub: rohithck) como parte de Delphi, la primera suite abierta de leyes de escala del proyecto. El modelo se entrena con un presupuesto de computo de 3e18 FLOPs sobre 1.223.393.280 tokens, siguiendo una receta que mapea presupuestos de computo a configuraciones de modelo y permite predecir el rendimiento de modelos mayores a partir de los pequenos.

La relevancia de este checkpoint es metodologica mas que de producto: forma parte de una extension de Delphi con semillas y presupuestos adicionales, y su proposito es servir como artefacto de investigacion para validar leyes de escala. La suite completa predijo la perdida final del mayor entrenamiento Delphi (1e23 FLOPs, 25B parametros, 600B tokens) con un error del 0,2% usando 300 veces menos computo.

Arquitectonicamente es un transformer decoder estilo Qwen 3 (pre-norm, RMSNorm, RoPE, QK-norm, SwiGLU) de 11 capas, hidden size 1024 y contexto maximo de 4096 tokens. Es un modelo exclusivamente preentrenado, sin instruccion, RLHF ni alineamiento de seguridad, y esta marcado por el autor como research-only.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Qwen 3 (pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU) |
| Parametros totales | 447.244.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (repo con pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Detalles adicionales de arquitectura: hidden size 1024, 11 capas, 8 cabezas de atencion, 8 cabezas KV (sin GQA), head dim 128, FFN intermedio 4096 (ratio MLP 4), vocabulario 128.256 (tokenizer Llama 3), RoPE con theta 500000 y escalado estilo Llama 3, sin terminos de bias y sin embeddings atados. Tamano del repositorio: 1,8 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con pre-norm y RMSNorm, RoPE con theta 500000 y escalado estilo Llama 3, QK-norm con escalado aprendido y MLPs SwiGLU. No emplea GQA (8 cabezas de atencion y 8 cabezas KV), no usa bias y no ata los embeddings de entrada y salida. La exportacion de inferencia declara `architectures: ["Qwen3ForCausalLM"]` y los pesos son identicos a los del entrenamiento.

El entrenamiento consumio 3e18 FLOPs en 37.335 pasos con semilla 42, sobre secuencias de 4096 tokens y una mezcla de datos compuesta por Nemotron-CC, StarCoderData y ProofPile 2. Se uso el optimizador AdamH (Adam con Hyperball), que restringe cada matriz de pesos a permanecer sobre la esfera de norma de Frobenius en la que se inicializo, eliminando la necesidad de weight decay. La tasa de aprendizaje sigue una regla de transferencia estilo Complete(d)P con correccion `(T0/T)^0.3` a medida que crece el horizonte de tokens, con schedule WSD (10% warmup lineal, 20% decaimiento lineal, suelo 0). Precision: parametros maestros en f32 y computo en bf16, con paralelismo FSDP. Constantes de referencia: B0 = 64, T0 = 2,5B tokens, eta0 = 0,00630, eta0,Adam = 0,000656, epsilon0 = 1,85e-8.

La innovacion principal no esta en el modelo individual sino en la metodologia: la receta Delphi permite predecir perdidas y benchmarks downstream (MMLU, HumanEval, GSM8K) de modelos mayores mediante una regresion en dos pasos que combina leyes de escala de computo y observacionales.

## Capacidades

- Generacion de texto autoregresiva en ingles, en modo base (continuacion de prompt, no dialogo).
- Modelado de lenguaje y estimacion de perplejidad para experimentos de investigacion.
- Generacion de codigo a nivel de continuacion, gracias a la inclusion de StarCoderData en la mezcla de entrenamiento.
- Razonamiento matematico y demostraciones formales basicas por la presencia de ProofPile 2 en los datos.
- Soporte de tool calling / function calling: no disponible (modelo base sin instruccion).
- Soporte de agentes y razonamiento multi-paso: no disponible (sin alineamiento ni formato de chat).
- Capacidades multilingues: no disponibles; entrenado con mezcla predominantemente inglesa.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en leyes de escala: el checkpoint sirve para reproducir y validar las predicciones de la ley de escala Delphi en el punto IsoFLOP de 3e18 FLOPs, comparando perdida observada con la predicha.
- Estudios de semillas y varianza: al existir otros checkpoints con semillas distintas en la suite, permite medir la varianza entre semillas en un mismo regimen de computo.
- Punto de referencia para experimentos de receta de entrenamiento: util para comparar optimizadores (AdamH frente a AdamW), schedules WSD y reglas de transferencia de learning rate en modelos pequenos.
- Generacion de codigo como tarea de evaluacion: con StarCoderData en la mezcla, puede usarse para medir capacidad de continuacion de codigo en un modelo de menos de 500M parametros.
- Experimentos de destilacion y ajuste fino: su tamano reducido permite hacer fine-tuning completo en una sola GPU consumer y estudiar transferencia desde modelos mayores de la suite.
- Evaluacion de tokenizer Llama 3 en modelos pequenos: permite analizar el efecto del vocabulario de 128.256 entradas en la eficiencia de tokens y en el rendimiento con presupuestos de computo bajos.
- Docencia y prototipado de pipelines de entrenamiento: el modelo y su receta reproducible sirven como ejemplo didactico de entrenamiento a escala con FSDP y bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 0,9 GB (447M parametros x 2 bytes); en fp32, unos 1,8 GB. Con cache KV para contexto de 4096 tokens el consumo adicional es reducido por el tamano del modelo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (el repo declara compatibilidad con endpoints), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no se distribuyen en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera throughput alto en GPU modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Delphi-3e18-447M (este) | 447M | 4096 | apache-2.0 | Base, solo ingles, research-only, sin evaluacion publicada |
| Pythia-410M | 410M | 2048 | apache-2.0 | Suite de interpretabilidad de EleutherAI, ampliamente evaluada, con checkpoints intermedios |
| Qwen3-0.6B | 600M | no disponible en esta ficha | apache-2.0 | Arquitectura Qwen 3 completa con instruccion; este Delphi usa la misma familia arquitectonica a menor escala |
| SmolLM-360M | 360M | no disponible en esta ficha | apache-2.0 | Modelo base pequeno con mezcla de datos web y codigo |

La comparacion con Pythia es la mas directa por proposito (suite de investigacion con semillas multiples y checkpoints intermedios). Frente a Qwen3-0.6B y SmolLM, la diferencia clave es que Delphi es un artefacto de investigacion sin ajuste por instrucciones ni evaluacion publicada, mientras que los otros estan orientados a uso practico.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no tiene instruccion, RLHF ni alineamiento de seguridad; no debe usarse como asistente conversacional sin ajuste adicional.
- Entrenado con una mezcla predominantemente inglesa; no hay cobertura multilingue.
- Riesgo de alucinacion y de generar contenido sesgado o inapropiado inherente a un modelo base entrenado con datos web (Nemotron-CC).
- El autor advierte que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; uso en produccion bajo responsabilidad del usuario.
- La receta Delphi optimiza el coste de entrenamiento, no el de inferencia; para despliegues con mucha inferencia puede ser preferible un modelo mas pequeno sobrentrenado.
- La licencia apache-2.0 permite uso comercial, pero el caracter research-only y la falta de evaluacion desaconsejan su uso en produccion sin validacion propia.
- Contexto maximo de 4096 tokens, limitado para tareas de contexto largo.
- Es un checkpoint dentro de una release mayor; debe elegirse el que corresponda al regimen de computo, parametros y tokens deseado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohithck/delphi-3e18-447Mparams-1.2Btokens-seed42
- Suite Delphi en el Hub: https://huggingface.co/marin-community
- Blog de Delphi, "Scaling Laws That Extrapolate 300x Past the Fit": https://openathena.ai/blog/delphi
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Codigo de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-3e18-seed42-2026.09.22
- Paper de referencia Pythia: https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
- AdamH (Adam with Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
