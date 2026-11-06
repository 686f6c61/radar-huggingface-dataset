# rohithck/delphi-2e20-1.9Bparams-14.8Btokens-seed62746

## Resumen

Delphi-2e20-1.9Bparams-14.8Btokens-seed62746 es un modelo base de 1.934.716.160 parámetros publicado por el usuario rohithck como parte de la suite de escalado Delphi del equipo Marin. Se trata de un checkpoint de investigación entrenado con un presupuesto de cómputo de 1,8e20 FLOPs (etiqueta `2e20` del repositorio) sobre 14.805.106.688 tokens, con semilla de entrenamiento 62746. Forma parte de una extensión de Delphi que añade semillas y presupuestos de cómputo adicionales manteniendo la receta original.

El modelo sigue la arquitectura Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm con escalado aprendido y MLPs SwiGLU), con 21 capas, tamaño oculto de 2048, 16 cabezas de atención sin GQA, dimensión de cabeza 128, FFN intermedio de 8192 y vocabulario de 128.256 tokens con tokenizer de Llama 3. La longitud máxima de secuencia es de 4096 tokens.

Su relevancia es fundamentalmente metodológica: Delphi es la primera suite de escalado abierta del equipo Marin, inspirada en Pythia, y su ley de escalado predijo con un 0,2% de error la pérdida final del mayor run de la suite (1e23 FLOPs) usando 300 veces menos cómputo. Este checkpoint concreto es un artefacto de investigación, sin evaluación publicada y sin alineamiento, pensado para estudiar leyes de escalado y reproducibilidad, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU MLP) |
| Parametros totales | 1.934.716.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión de entrenamiento) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con arquitectura Qwen 3: normalización pre-norm con RMSNorm, codificación posicional RoPE con θ = 500000 y escalado estilo Llama 3, QK-norm con escalado aprendido, MLPs SwiGLU con ratio 4 (FFN intermedio de 8192), sin términos de bias y sin embeddings atados. Cuenta con 21 capas, tamaño oculto 2048, 16 cabezas de atención con 16 KV heads (sin GQA) y dimensión de cabeza 128. El vocabulario es de 128.256 tokens con el tokenizer de Llama 3.

El entrenamiento se realizó sobre 14.805.106.688 tokens en 56.477 pasos con secuencias de 4096 tokens, usando el optimizador AdamH (Adam con Hyperball), que restringe cada peso de proyección a la esfera de norma de Frobenius en la que se inicializó, eliminando la necesidad de weight decay. La receta Delphi emplea una regla de transferencia estilo Complete(d)P con corrección de learning rate por horizonte de tokens `(T₀/T)^0.3` y un schedule WSD (10% warmup lineal, 20% decay lineal, suelo 0). Se usó precisión f32 para los parámetros maestros y bf16 para cómputo, con paralelización FSDP. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. No se aplicó instruction tuning, RLHF ni alineamiento de seguridad: es un modelo estrictamente pretrained.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt (modelo base, sin formato de instrucciones).
- Razonamiento y conocimiento general derivados del corpus de pretraining (Nemotron-CC).
- Generación de código, gracias a la inclusión de StarCoderData en la mezcla.
- Razonamiento matemático y demostraciones formales, por la inclusión de ProofPile 2.
- Soporte de tool calling: no disponible (modelo base sin entrenamiento de instrucciones ni de función).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriría fine-tuning.
- Capacidades multilingües: no, entrenado sobre una mezcla predominantemente inglesa.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Capacidad de continuación de texto y few-shot prompting implícito, propio de modelos base.

## Casos de uso

- Investigación en leyes de escalado: el checkpoint sirve como punto de la rejilla IsoFLOP de Delphi para ajustar y validar leyes de escalado que predicen pérdida y benchmarks downstream a partir de modelos más pequeños, con la ventaja de que la receta y los datos de entrenamiento son públicos y reproducibles.
- Reproducibilidad de experimentos de entrenamiento: al publicarse la configuración exacta (semilla 62746, AdamH, schedule WSD, mezcla de datos), permite replicar el run y estudiar la varianza entre semillas en un mismo presupuesto de cómputo.
- Estudio de optimizadores: útil para analizar el comportamiento de AdamH frente a AdamW en regímenes de cómputo acotados, dado que el modelo entrena sin weight decay y con pesos restringidos a esferas de norma fija.
- Generación de código en entornos de investigación: puede usarse como modelo base para experimentos de continuación de código o como punto de partida para fine-tuning supervisado en tareas de programación, aprovechando la presencia de StarCoderData en el corpus.
- Experimentos de razonamiento matemático: la inclusión de ProofPile 2 lo hace adecuado como base para estudiar la transferencia de datos de demostraciones formales a tareas de matemáticas, siempre con fine-tuning posterior.
- Baseline en ablaciones de mezcla de datos: al conocerse la composición exacta del dataset (Nemotron-CC, StarCoderData, ProofPile 2), sirve como referencia controlada para medir el efecto de cambiar proporciones o añadir dominios.
- Estudio de tokenizers: al usar el tokenizer de Llama 3 con vocabulario de 128.256, permite comparar eficiencia de tokenización y su impacto en la pérdida frente a otros modelos de tamaño similar con tokenizers distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación de este checkpoint no se incluyen en la release. La suite Delphi publica proyecciones de MMLU, HumanEval y GSM8K mediante regresión en dos pasos (ley de escalado de cómputo más ley de escalado observacional), pero no se proporcionan cifras concretas para este checkpoint en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,9 GB solo para pesos (1,93 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 5-6 GB con contexto completo de 4096 tokens.
- VRAM estimada en fp32: aproximadamente 7,7 GB solo para pesos.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB (aunque el repo no publica versiones cuantizadas).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090) puede ejecutarlo en bf16 o fp16. Para despliegue en servidor, A100, H100 o L40S ofrecen margen amplio y mayor throughput.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en bf16/fp16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (librería nativa del repo), vLLM, TGI (el repo incluye el tag `text-generation-inference`), llama.cpp/Ollama previa conversión a GGUF (no publicada en el repo).
- Latencia y throughput estimados: no disponible; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evaluacion publicada | Disponibilidad |
|---|---|---|---|---|---|
| delphi-2e20-1.9Bparams-14.8Btokens-seed62746 | 1,93 B | 4096 | Apache 2.0 | No | Hugging Face (rohithck) |
| Pythia-1.4B | 1,4 B | 2048 | Apache 2.0 | Sí (suite Pythia) | Hugging Face (EleutherAI) |
| Qwen3-1.7B | 1,7 B | 32.768 | Apache 2.0 | Sí | Hugging Face (Qwen) |
| SmolLM2-1.7B | 1,7 B | 8192 | Apache 2.0 | Sí | Hugging Face (HuggingFaceTB) |

La comparación con Pythia es la más directa en propósito, ya que Delphi se inspira explícitamente en esa suite de escalado. Frente a Qwen3-1.7B y SmolLM2-1.7B, el checkpoint de Delphi no ofrece evaluación publicada ni alineamiento, por lo que no es un competidor en calidad de despliegue, sino un artefacto de investigación con receta y datos reproducibles.

## Limitaciones y advertencias

- Modelo exclusivamente pretrained: no tiene instruction tuning, RLHF ni alineamiento de seguridad, por lo que no sigue instrucciones de forma fiable y puede generar contenido inapropiado.
- Entrenado sobre una mezcla predominantemente inglesa: no hay cobertura multilingüe; el rendimiento en castellano será deficiente.
- La model card advierte de que es un artefacto de investigación no evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es bajo responsabilidad del usuario.
- Riesgo de alucinación inherente a un modelo base sin evaluación; no se han publicado métricas de fidelidad ni de robustez.
- La receta Delphi optimiza el coste de entrenamiento, no el coste de inferencia: para despliegues con mucha inferencia, un modelo más pequeño sobrentrenado puede ser preferible, como señala la propia model card.
- El contexto máximo es de 4096 tokens, inferior al de modelos contemporáneos de tamaño similar (Qwen3-1.7B admite 32.768 y SmolLM2-1.7B admite 8192).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y alineamiento hace desaconsejable su uso directo en aplicaciones de cara al usuario sin fine-tuning y evaluaciones propias.
- Es un único checkpoint dentro de una release mayor de Delphi; debe elegirse el que corresponda al régimen de cómputo, parámetros y tokens de interés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-2e20-1.9Bparams-14.8Btokens-seed62746
- Blog de Delphi ("Scaling Laws That Extrapolate 300× Past the Fit"): https://openathena.ai/blog/delphi
- Organización marin-community en Hugging Face (todos los checkpoints Delphi): https://huggingface.co/marin-community
- Dataset de datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Código de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuración de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproducción: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-2e20-seed62746-2026.09.22
- Artículo sobre AdamH (Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Paper de Pythia (inspiración de Delphi): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
