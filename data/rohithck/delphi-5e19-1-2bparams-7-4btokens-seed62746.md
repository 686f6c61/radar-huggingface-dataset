# rohithck/delphi-5e19-1.2Bparams-7.4Btokens-seed62746

## Resumen

Delphi es la primera suite de escalado abierta del equipo Marin, inspirada en Pythia, y este checkpoint concreto (`delphi-5e19-1.2Bparams-7.4Btokens-seed62746`) es uno de los puntos de la cuadricula IsoFLOP de su extensión con semillas adicionales. Se trata de un modelo base de 1.180.038.272 parámetros entrenado con 7.363.231.744 tokens bajo un presupuesto de cómputo de 5,3e19 FLOPs, con semilla de entrenamiento 62746. La arquitectura es Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm con escalado aprendido y MLPs SwiGLU), con 17 capas, tamaño oculto 1664, 13 cabezas de atención sin GQA y una longitud máxima de secuencia de 4096 tokens.

El interés del modelo no reside en sus capacidades individuales, sino en su papel dentro de un experimento de leyes de escalado: la suite Delphi demuestra que una ley de escalado ajustada con modelos pequeños puede predecir la pérdida final del run más grande (1e23 FLOPs, 25 B parámetros, 600 B tokens) con un error del 0,2 %, usando 300 veces menos cómputo. Este checkpoint es, por tanto, una pieza de un artefacto de investigación reproducible, no un modelo listo para producto.

Es relevante ahora porque permite a investigadores reproducir y auditar el ajuste de la ley de escalado, estudiar la variabilidad entre semillas y analizar el efecto de recetas de optimización poco convencionales como AdamH (Adam con Hyperball) y la corrección de horizonte de tokens `(T₀/T)^0.3`. El autor lo etiqueta explícitamente como `research-only`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder transformer pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU MLP) |
| Parametros totales | 1.180.038.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión de entrenamiento; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (inglés; mezcla web mayoritariamente anglófona) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers, `Qwen3ForCausalLM`) |

Otras especificaciones técnicas declaradas por el autor:

| Parametro | Valor |
|---|---|
| Hidden size | 1664 |
| Capas | 17 |
| Cabezas de atención | 13 |
| Cabezas KV | 13 (sin GQA) |
| Head dim | 128 |
| FFN intermedio | 6656 (ratio MLP 4) |
| Vocabulario | 128.256 (tokenizer Llama 3) |
| Bias | ninguno |
| Embeddings atados | no |
| RoPE theta | 500000 (escalado estilo Llama 3) |
| Cómputo de entrenamiento | 5,3e19 FLOPs |
| Tokens de entrenamiento | 7.363.231.744 |
| Pasos | 56.177 |
| Semilla | 62746 |
| Longitud de secuencia en entrenamiento | 4096 |
| Optimizador | AdamH (Adam con Hyperball) |
| Precisión | f32 params maestros, bf16 compute |
| Paralelismo | FSDP |
| Tamaño del repo | 4,7 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen 3: decoder transformer pre-norm con RMSNorm, RoPE con theta 500000 y escalado estilo Llama 3, QK-norm con escalado aprendido, MLPs SwiGLU con ratio 4 y sin términos de bias. Usa 13 cabezas de atención y 13 cabezas KV (es decir, sin grouped-query attention), head dim 128, 17 capas y un vocabulario de 128.256 tokens del tokenizer Llama 3 con embeddings no atados. La exportación de inferencia declara `architectures: ["Qwen3ForCausalLM"]` y los pesos son idénticos a los del entrenamiento.

El entrenamiento consumió 5,3e19 FLOPs sobre 7.363.231.744 tokens en 56.177 pasos con secuencia de 4096, usando FSDP y precisión mixta (f32 para parámetros maestros, bf16 para cómputo). La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2, con tokenizer Llama 3. La innovación técnica principal es la receta de optimización: AdamH (Adam con Hyperball) restringe cada matriz de proyección a permanecer sobre la esfera de norma de Frobenius en la que se inicializó, de modo que el weight decay deja de tener nada que regularizar y desaparece de la receta. Además, se aplica una regla de transferencia estilo Complete(d)P con corrección `(T₀/T)^0.3` para fijar el learning rate a medida que crece el horizonte de tokens, con constantes de referencia B₀ = 64, T₀ = 2,5 B tokens, η₀ = 0,00630, η₀,Adam = 0,000656 y ε₀ = 1,85e-8. El schedule es WSD con 10 % de warmup lineal, 20 % de decay lineal y suelo 0. No hay instruction tuning, RLHF ni alineamiento de seguridad: es un modelo estrictamente preentrenado.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt, en modo completion (modelo base, sin formato de chat).
- Razonamiento y conocimiento general adquiridos del preentrenamiento sobre Nemotron-CC, sin evaluación publicada que lo cuantifique.
- Generación de código, favorecida por la inclusión de StarCoderData en la mezcla.
- Razonamiento matemático y demostraciones formales, favorecido por ProofPile 2 en la mezcla.
- Tool calling / function calling: no disponible; no hay post-entrenamiento que habilite formatos de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible por diseño (modelo base).
- Capacidades multilingües: no disponibles; el autor declara cobertura exclusivamente inglesa.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Contexto útil limitado a 4096 tokens, sin extensiones documentadas.

## Casos de uso

- Investigación en leyes de escalado: usar este checkpoint junto al resto de la cuadrícula IsoFLOP de `marin-community` para reproducir el ajuste de la ley y verificar la predicción del run de 1e23 FLOPs con un error del 0,2 %.
- Estudio de variabilidad entre semillas: al ser un checkpoint de semilla 62746 dentro de la extensión de Delphi, sirve para medir la dispersión de la pérdida final y de las curvas de entrenamiento entre ejecuciones con distinto seed.
- Auditoría de recetas de optimización: permite comparar AdamH con AdamW estándar y analizar el efecto de la corrección `(T₀/T)^0.3` sobre el learning rate en función del horizonte de tokens.
- Experimentos de destilación y ajuste fino controlado: con 1,18 B parámetros y licencia Apache 2.0, es un punto de partida barato para estudiar cómo se transfieren capacidades desde modelos mayores de la propia suite Delphi.
- Análisis de mezclas de datos: al combinar Nemotron-CC, StarCoderData y ProofPile 2 con tokenizer Llama 3, permite aislar el efecto de cada componente sobre código, matemáticas y lenguaje natural en un modelo de escala contenida.
- Reproducibilidad de pipelines: los pipelines que reconstruyen determinísticamente la mezcla desde las fuentes públicas están publicados en el repo de Marin, lo que facilita replicar el preentrenamiento en entornos de investigación con presupuesto limitado.
- Referencia para calibración de hardware: con 4096 tokens de contexto y 17 capas, es útil como carga de trabajo pequeña para medir throughput de frameworks de inferencia (vLLM, TGI) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación de este checkpoint no se incluyen en esta release. El blog de Delphi publica proyecciones de MMLU, HumanEval y GSM8K derivadas de la ley de escalado en dos pasos (cómputo + observacional), pero no resultados medidos de este checkpoint concreto en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 1,18 B parámetros ocupan aproximadamente 2,4 GB de pesos; con caché KV para 4096 tokens y 17 capas con 13 cabezas KV de dimensión 128, el overhead adicional es reducido (del orden de cientos de MB según batch). En fp32, los pesos suben a unos 4,7 GB, coincidiendo con el tamaño del repo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en bf16 es suficiente; A100, H100 y L40S quedan sobradamente dimensionadas y permiten batches grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin cuantización adicional; en GPUs de 8 GB requiere cuantización o carga en fp16 con batch 1.
- Opciones de despliegue: transformers (formato nativo safetensors), text-generation-inference (el repo declara `text-generation-inference` y `endpoints_compatible`), y en principio vLLM y llama.cpp si se generan conversiones, aunque no se publican GGUF oficiales.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| Delphi 5e19 1.2B (este) | 1,18 B | 4096 | 7,36 B | Apache 2.0 | Modelo base de suite de escalado, research-only |
| Pythia 1.4B | 1,4 B | 2048 | 300 B | Apache 2.0 | Suite de escalado con checkpoints intermedios |
| Qwen3 1.7B | 1,7 B | 32.768 | no disponible | Apache 2.0 | Modelo con post-entrenamiento y modo thinking |
| SmolLM2 1.7B | 1,7 B | 8192 | 11 B | Apache 2.0 | Modelo pequeño con instrucciones |

La comparación relevante es con Pythia, ya que Delphi se define explícitamente como su inspiración: ambos publican checkpoints intermedios y múltiples semillas para estudiar el entrenamiento, pero Delphi añade una ley de escalado validada con extrapolación a 300 veces el cómputo del ajuste. Frente a Qwen3 1.7B o SmolLM2 1.7B, este checkpoint carece de post-entrenamiento y de contexto largo, por lo que no es un sustituto funcional en aplicaciones de chat o agentes. No se dispone de datos de benchmarks comparativos medidos para este checkpoint.

## Limitaciones y advertencias

- Modelo estrictamente preentrenado: sin instruction tuning, RLHF ni alineamiento de seguridad; no debe usarse como asistente conversacional sin ajuste previo.
- Entrenado sobre una mezcla web mayoritariamente inglesa; el autor declara ausencia de cobertura multilingüe.
- Riesgo elevado de alucinación y de generar contenido sesgado o inapropiado, inherente a un modelo base sin filtros.
- El autor advierte que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; el uso en producción es bajo responsabilidad del usuario.
- La receta Delphi optimiza el coste de entrenamiento, no el de inferencia: para despliegues con mucho tráfico, un modelo más pequeño sobrentrenado puede ser preferible, tal como cuantifica la sección de "off-optimal training" del blog.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia Apache 2.0 permite uso comercial, pero la etiqueta `research-only` del autor refleja la ausencia de garantías y de evaluación; conviene tratarla como advertencia de madurez más que como restricción legal.
- Es un checkpoint dentro de una release mucho mayor: elegir el punto de la cuadrícula que corresponda al régimen de cómputo, parámetros y tokens deseado antes de usarlo como base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-5e19-1.2Bparams-7.4Btokens-seed62746
- Blog de Delphi, "Scaling Laws That Extrapolate 300× Past the Fit": https://openathena.ai/blog/delphi
- Organización Marin en Hugging Face (todos los checkpoints Delphi): https://huggingface.co/marin-community
- Dataset con los datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Repositorio Marin en GitHub: https://github.com/marin-community/marin
- Código de la receta Complete(d)P + AdamH: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuración de entrenamiento de las semillas Delphi: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproducción: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en Weights & Biases: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-5e19-seed62746-2026.09.22
- Artículo sobre AdamH (Adam with Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia, inspiración de la suite: https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
