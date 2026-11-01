# rohithck/delphi-2e19-837Mparams-3.6Btokens-seed42

## Resumen

Delphi-2e19-837Mparams-3.6Btokens-seed42 es un modelo base de 837.007.744 parámetros publicado por el usuario rohithck como parte de la suite de escalado Delphi del equipo Marin. Se trata de un checkpoint de investigación entrenado con 3.612.672.000 tokens bajo un presupuesto de cómputo configurado de 1,8e19 FLOPs (etiqueta `2e19` en el repositorio) y semilla de entrenamiento 42. No es un modelo pensado para uso en producción, sino un artefacto para estudiar leyes de escalado.

La arquitectura sigue el diseño Qwen 3 (decodificador pre-norm con RMSNorm, RoPE, QK-norm con escalado aprendido y MLPs SwiGLU), con 15 capas, tamaño oculto de 1408, 11 cabezas de atención sin GQA (11 KV heads), dimensión de cabeza 128, FFN intermedio de 5632 y vocabulario de 128.256 tokens con tokenizador Llama 3. La longitud máxima de secuencia es de 4096 tokens. El modelo está entrenado únicamente en inglés y se distribuye con licencia Apache 2.0, aunque la propia model card lo etiqueta como `research-only`.

Su relevancia es metodológica: forma parte de una extensión de Delphi con semillas y presupuestos de cómputo adicionales, y la suite original demostró que una ley de escalado pre-registrada podía predecir la pérdida final del mayor run de Delphi (1e23 FLOPs, 25 B parámetros, 600 B tokens) con un error del 0,2 % usando 300 veces menos cómputo. Este checkpoint concreto es una pieza de ese grid IsoFLOP, no un modelo evaluado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decodificador pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU MLPs) |
| Parametros totales | 837.007.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión de entrenamiento) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (etiquetado `research-only` por el autor) |
| Formato de pesos | safetensors (transformers, `Qwen3ForCausalLM`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 15 capas con hidden size 1408, 11 cabezas de atención y 11 KV heads (sin grouped-query attention), head dim 128 y FFN intermedio de 5632 (ratio MLP 4). Usa RoPE con θ = 500000 y escalado estilo Llama 3, sin términos de bias y sin embeddings atados. El vocabulario es de 128.256 tokens con tokenizador Llama 3. El export de inferencia declara `architectures: ["Qwen3ForCausalLM"]` y los pesos no se modificaron respecto al entrenamiento.

El entrenamiento consumió 1,8e19 FLOPs en 55.125 pasos (export final en el paso 55.124, indexado desde cero) con secuencias de 4096 tokens, precisión f32 para parámetros maestros y bf16 para cómputo, y paralelismo FSDP. El optimizador es AdamH (Adam con Hyperball), que restringe cada peso de proyección a la esfera de norma de Frobenius sobre la que se inicializó, eliminando la necesidad de weight decay. La receta Delphi aplica una regla de transferencia estilo Complete(d)P con corrección `(T₀/T)^0.3` sobre el learning rate a medida que crece el horizonte de tokens, con schedule WSD (10 % warmup lineal, 20 % decay lineal, suelo 0). Las constantes de referencia son B₀ = 64, T₀ = 2,5 B tokens, η₀ = 0,00630, η₀,Adam = 0,000656 y ε₀ = 1,85e-8. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. No hay RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva como modelo base preentrenado.
- Razonamiento y conocimiento general derivados del preentrenamiento sobre Nemotron-CC (web filtrada), sin evaluación publicada.
- Generación de código por la inclusión de StarCoderData en la mezcla.
- Razonamiento matemático y formal por la inclusión de ProofPile 2.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base sin ajuste).
- Capacidades multilingües: no, entrenado solo en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre leyes de escalado: usar este checkpoint junto a los demás puntos del grid IsoFLOP de Delphi para ajustar y validar curvas de pérdida frente a cómputo, parámetros y tokens. Es su propósito original y el escenario para el que fue diseñado.
- Reproducción de experimentos: la receta, la configuración de entrenamiento y las instrucciones de reproducción están publicadas, lo que permite reentrenar o comparar con la semilla 42 y contrastar resultados.
- Estudio de optimizadores: sirve para analizar el comportamiento de AdamH y de la corrección de learning rate `(T₀/T)^0.3` en un régimen de cómputo pequeño y controlado.
- Análisis de mezclas de datos: al combinar web, código y matemáticas con pipelines deterministas de reproducción, permite aislar el efecto de la mezcla en un modelo de menos de mil millones de parámetros.
- Fine-tuning experimental: con 837 M de parámetros y contexto de 4096 tokens, cabe en una GPU consumer para ajuste con cuantización o LoRA, útil para probar hipótesis antes de escalar.
- Generación de texto en inglés como base para tareas posteriores: punto de partida para SFT o DPO en entornos de investigación, nunca directamente en producción sin alineamiento.
- Docencia y experimentación académica: modelo pequeño, reproducible y con licencia permisiva para cursos sobre entrenamiento de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación de este checkpoint no se incluyen en la release.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,7 GB solo para pesos (837 M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB con contexto completo de 4096 tokens.
- VRAM estimada en fp32: unos 3,4 GB solo para pesos.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, 4060, 4070, 4090) es suficiente; para mayor throughput, A100 o H100.
- Cabe holgadamente en GPU consumer: sí, incluso en tarjetas de gama media y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (soporte nativo, `Qwen3ForCausalLM`), text-generation-inference (el repo declara compatibilidad con endpoints), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por tamaño, se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Delphi-2e19-837M (este) | 837 M | 4096 | Apache 2.0 (research-only) | HuggingFace | Checkpoint de suite de escalado, sin evaluación publicada |
| Pythia-1B | 1.000 M | 2048 | Apache 2.0 | HuggingFace | Suite de escalado inspiradora de Delphi, con checkpoints intermedios |
| Qwen3-0.6B | 600 M | 32.768 | Apache 2.0 | HuggingFace | Modelo base/instruct de la misma familia arquitectónica, con evaluación publicada |
| SmolLM2-1.7B | 1.700 M | 8192 | Apache 2.0 | HuggingFace | Base pequeño entrenado con muchos más tokens, orientado a uso práctico |

La comparación con Pythia y Qwen3 es la más directa por tamaño y propósito; no obstante, Delphi no publica métricas de rendimiento para este checkpoint, por lo que la comparación cuantitativa de calidad no está disponible.

## Limitaciones y advertencias

- Modelo solo preentrenado: no tiene instruction tuning, RLHF ni alineamiento de seguridad; no debe usarse directamente como asistente.
- Entrenado con una mezcla predominantemente inglesa de web; sin cobertura multilingüe.
- Riesgo elevado de alucinación y de generar contenido sesgado o inseguro, dado que no hay filtrado posterior al preentrenamiento.
- El autor advierte de que el modelo no ha sido probado ni evaluado adecuadamente y no es necesariamente seguro; uso en producción bajo responsabilidad propia.
- La receta Delphi optimiza el cómputo de entrenamiento, no el coste de inferencia; para despliegues con mucha inferencia, un modelo más pequeño sobrentrenado puede ser preferible.
- El checkpoint es una pieza de una release mayor; hay que elegir el que corresponda al régimen de cómputo, parámetros y tokens de interés.
- Aunque la licencia es Apache 2.0, la etiqueta `research-only` del autor debe tenerse en cuenta al plantear usos comerciales.

## Enlaces

- HuggingFace: https://huggingface.co/rohithck/delphi-2e19-837Mparams-3.6Btokens-seed42
- Suite Delphi en el Hub: https://huggingface.co/marin-community
- Blog de Delphi: https://openathena.ai/blog/delphi
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Receta (código): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuración de entrenamiento: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproducción: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento (W&B): https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-2e19-seed42-2026.09.22
- AdamH (blog): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia (inspiración): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
