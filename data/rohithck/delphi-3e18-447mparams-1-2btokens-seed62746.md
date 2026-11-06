# rohithck/delphi-3e18-447Mparams-1.2Btokens-seed62746

## Resumen

Delphi es la primera suite de escalado abierta del equipo Marin, inspirada en Pythia, y este checkpoint concreto (`delphi-3e18-447Mparams-1.2Btokens-seed62746`) es uno de los puntos de la rejilla IsoFLOP de 3 × 10¹⁸ FLOPs, con una semilla de entrenamiento adicional (62746). Se trata de un modelo base de 447.244.032 parámetros entrenado sobre 1.223.393.280 tokens con una arquitectura tipo Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm y MLPs SwiGLU). No es un modelo pensado para uso en producción, sino un artefacto de investigación para estudiar leyes de escalado.

Su relevancia no está en el rendimiento absoluto, sino en el método: la suite Delphi publica una receta de escalado que mapea presupuestos de cómputo a configuraciones de modelo, una rejilla de modelos entrenados en presupuestos IsoFLOP de 3 × 10¹⁸ a 1 × 10²³ FLOPs y una ley de escalado que predice los modelos grandes a partir de los pequeños. El pronóstico pre-registrado de esa ley predijo la pérdida final del mayor run Delphi (1 × 10²³ FLOPs, 25 B de parámetros, 600 B de tokens) con un error del 0,2 %, usando 300 veces menos cómputo que el entrenamiento real.

Este checkpoint en particular forma parte de una extensión de Delphi con semillas y presupuestos adicionales, siguiendo la receta original. Es un modelo solo de inglés, sin ajuste de instrucciones ni alineamiento de seguridad, y el propio autor lo etiqueta como `research-only`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen 3: decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, MLPs SwiGLU, sin sesgos |
| Parámetros totales | 447.244.032 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, `Qwen3ForCausalLM`) |
| Hidden size | 1024 |
| Capas | 11 |
| Cabezas de atención | 8 |
| Cabezas KV | 8 (sin GQA) |
| Dimensión de cabeza | 128 |
| FFN intermedio | 4096 (ratio MLP 4) |
| Vocabulario | 128.256 (tokenizer Llama 3) |
| Embeddings atados | no |
| Codificación posicional | RoPE (θ = 500000, escalado estilo Llama 3) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con la arquitectura Qwen 3: normalización pre-norm con RMSNorm, RoPE con θ = 500000 y escalado estilo Llama 3, QK-norm con escalado aprendido y MLPs SwiGLU sin términos de sesgo. Tiene 11 capas, hidden size 1024, 8 cabezas de atención y 8 cabezas KV (sin GQA), con una dimensión de cabeza de 128 y un FFN intermedio de 4096. El vocabulario es de 128.256 tokens con el tokenizer de Llama 3 y los embeddings no están atados. El contexto máximo es de 4096 tokens.

El entrenamiento consumió 3 × 10¹⁸ FLOPs sobre 1.223.393.280 tokens en 37.335 pasos, con secuencias de 4096 tokens, precisión f32 para los parámetros maestros y bf16 para el cómputo, y paralelización FSDP. El optimizador es AdamH (Adam con Hyperball), que restringe cada matriz de pesos de proyección a la esfera de norma de Frobenius sobre la que se inicializó, de modo que el weight decay deja de tener nada que regularizar y desaparece de la receta. La tasa de aprendizaje sigue un schedule WSD (10 % de warmup lineal, 20 % de decaimiento lineal, suelo en 0) con una regla de transferencia estilo Complete(d)P y corrección `(T₀/T)^0.3` según crece el horizonte de tokens; las constantes de referencia son B₀ = 64, T₀ = 2,5 B tokens, η₀ = 0,00630, η₀,Adam = 0,000656 y ε₀ = 1,85 × 10⁻⁸. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. No se documenta RLHF, DPO ni ningún tipo de ajuste posterior: es un modelo estrictamente preentrenado.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt, en modo modelo base (continuación, no instrucciones).
- Razonamiento y conocimiento general derivados del preentrenamiento sobre Nemotron-CC.
- Generación de código, gracias a la inclusión de StarCoderData en la mezcla.
- Razonamiento matemático y demostraciones formales, por la inclusión de ProofPile 2.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base sin ajuste).
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio de leyes de escalado: el modelo sirve como punto de la rejilla IsoFLOP para ajustar curvas de pérdida frente a cómputo y validar predicciones de modelos mayores con 300 veces menos cómputo, que es exactamente el propósito declarado de la suite.
- Reproducción de recetas de entrenamiento: con la configuración registrada y las instrucciones de reproducibilidad publicadas, se puede reentrenar el checkpoint y comparar la curva de pérdida con la del run original en W&B.
- Investigación sobre optimizadores: permite analizar el efecto de AdamH (Hiperesfera) frente a AdamW estándar en un régimen de cómputo pequeño y controlado, con semillas repetidas para medir varianza.
- Análisis de mezclas de datos: al combinar Nemotron-CC, StarCoderData y ProofPile 2, es útil para estudiar cómo afecta la proporción de código y matemáticas a las pérdidas por dominio en modelos pequeños.
- Experimentos de tokenización: al usar el tokenizer de Llama 3 con vocabulario de 128.256, sirve para comparar eficiencia de tokenización y su impacto en el coste de entrenamiento a este presupuesto.
- Docencia y prototipado de bajo coste: con 447 M de parámetros y pesos safetensors de 1,8 GB, se puede cargar en una GPU consumer para demostrar el pipeline completo de transformers, generación y evaluación sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación de este checkpoint no se incluyen en esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 0,9 GB solo para pesos (447 M × 2 bytes), más overhead de activaciones y caché KV; con contexto completo de 4096 tokens y 11 capas el consumo adicional es moderado.
- VRAM estimada en fp32: aproximadamente 1,8 GB solo para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090, RTX 3090 o incluso una RTX 3060 de 12 GB cubren el modelo con holgura. Para servir en lote a gran escala, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 4 GB o más de VRAM en bf16.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta ninguna conversión oficial.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| delphi-3e18-447Mparams-1.2Btokens-seed62746 | 447 M | 4096 | Apache 2.0 | Modelo base de investigación, solo inglés, sin evaluación publicada |
| Pythia (suite de EleutherAI) | 70 M – 12 B | 2048 | Apache 2.0 | Inspiración directa de Delphi; suite de escalado con checkpoints intermedios |
| Qwen3 (tamaños pequeños) | ~0,6 B en adelante | 32.768 en versiones recientes | Apache 2.0 (la mayoría) | Misma familia arquitectónica, pero con ajuste de instrucciones y contexto mucho mayor |
| Modelos base pequeños tipo Llama 3.2 1B | ~1,2 B | 131.072 | Llama 3.2 Community License | Mayor tamaño y contexto, pero licencia más restrictiva y no orientado a estudios de escalado |

La comparación relevante para Delphi no es de rendimiento, sino de propósito: es una suite diseñada para predecir modelos mayores, algo que Pythia también aborda pero sin la ley de escalado pre-registrada ni el esquema AdamH.

## Limitaciones y advertencias

- Sesgos conocidos: entrenado sobre una mezcla web mayoritariamente en inglés (Nemotron-CC), por lo que hereda los sesgos de ese corpus; no se documenta ningún proceso de mitigación.
- Riesgo de alucinación: alto en el sentido habitual de un modelo base sin alineamiento; no está diseñado para responder con veracidad y no ha pasado por RLHF ni DPO.
- Limitaciones de contexto e idioma: ventana máxima de 4096 tokens y cobertura exclusivamente en inglés; no hay soporte multilingüe.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero la model card etiqueta el artefacto como `research-only` y advierte de que no ha sido probado ni evaluado adecuadamente y de que no es necesariamente seguro.
- Caveat de producción: la receta Delphi optimiza el coste de entrenamiento, no el de inferencia; para despliegues con mucha inferencia, un modelo más pequeño sobrentrenado puede ser preferible, y el propio blog cuantifica la penalización del entrenamiento "off-optimal".
- Ausencia de evaluación: no hay resultados de MMLU, HumanEval ni GSM8K publicados para este checkpoint, así que cualquier afirmación de calidad sería especulativa.
- Naturaleza del artefacto: es un punto de una release mucho mayor; conviene elegir el checkpoint que corresponda al régimen de cómputo, parámetros y tokens deseado en lugar de usar este por defecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-3e18-447Mparams-1.2Btokens-seed62746
- Blog de Delphi, "Scaling Laws That Extrapolate 300× Past the Fit": https://openathena.ai/blog/delphi
- Organización Marin en Hugging Face (todos los checkpoints Delphi): https://huggingface.co/marin-community
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Código de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuración de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproducción: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-3e18-seed62746-2026.09.22
- Artículo sobre AdamH (Adam with Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia (EleutherAI), inspiración de la suite: https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
