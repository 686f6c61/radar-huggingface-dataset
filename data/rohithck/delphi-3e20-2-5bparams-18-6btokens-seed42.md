# rohithck/delphi-3e20-2.5Bparams-18.6Btokens-seed42

## Resumen

Delphi-3e20-2.5Bparams-18.6Btokens-seed42 es un checkpoint de modelo base de 2.544.614.912 parámetros perteneciente a la suite de escalado Delphi, desarrollada por el equipo Marin (Marin Community). Se trata de un artefacto de investigación cuyo objetivo no es el despliegue en producción, sino el estudio empírico de leyes de escalado: el modelo se entrena con un presupuesto de cómputo fijo de 3 × 10²⁰ FLOPs sobre 18.617.466.880 tokens, con la semilla de entrenamiento 42, dentro de una extensión de Delphi que añade semillas y presupuestos adicionales a la receta original.

La relevancia de la suite Delphi reside en su capacidad de predecir el comportamiento de modelos mucho mayores. Según la documentación del proyecto, una previsión pre-registrada derivada de la ley de escalado ajustada con los modelos pequeños predijo la pérdida final del mayor entrenamiento Delphi (1 × 10²³ FLOPs, 25.000 millones de parámetros, 600.000 millones de tokens) con un error del 0,2 %, empleando 300 veces menos cómputo que el entrenamiento real. Este checkpoint concreto es una pieza de esa cuadrícula IsoFLOP y sirve como material de referencia para reproducir y validar dichas predicciones.

Arquitectura transformer decoder de estilo Qwen 3, con 23 capas, dimensión oculta de 2304, 18 cabezas de atención sin GQA, tokenizador Llama 3 con vocabulario de 128.256 entradas y longitud máxima de secuencia de 4096 tokens. El modelo está entrenado únicamente en inglés, no ha recibido ajuste por instrucciones ni alineamiento de seguridad, y se distribuye bajo licencia Apache 2.0 con la etiqueta `research-only`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Qwen 3 (pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, MLP SwiGLU) |
| Parametros totales | 2.544.614.912 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, presumiblemente convertible a GGUF/AWQ, pero no se documenta) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (etiqueta `research-only` en los tags del repositorio) |
| Formato de pesos | safetensors (export de inferencia con `architectures: ["Qwen3ForCausalLM"]`) |
| Dimension oculta | 2304 |
| Capas | 23 |
| Cabezas de atencion | 18 (18 KV heads, sin GQA) |
| Dimensión de cabeza | 128 |
| FFN intermedio | 9216 (ratio MLP 4) |
| Vocabulario | 128.256 (tokenizador Llama 3) |
| Codificacion posicional | RoPE (θ = 500000, escalado estilo Llama 3) |
| Bias | Ninguno |
| Embeddings atados | No |
| Presupuesto de computo | 3 × 10²⁰ FLOPs |
| Tokens de entrenamiento | 18.617.466.880 |
| Pasos de entrenamiento | 35.510 |
| Semilla | 42 |
| Tamano del repositorio | 10,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen 3: un decoder transformer denso con normalizacion previa, RMSNorm, atención multi-cabeza completa (18 cabezas de consulta y 18 de clave/valor, sin grouped-query attention), QK-norm con escalado aprendido, MLP SwiGLU con ratio 4 y embeddings no atados. La dimensión de cabeza es 128 y la codificación posicional emplea RoPE con θ = 500000 y escalado estilo Llama 3. El tokenizador es el de Llama 3, con un vocabulario de 128.256 entradas.

El entrenamiento consumió 3 × 10²⁰ FLOPs durante 35.510 pasos sobre secuencias de 4096 tokens, con precisión bf16 en cómputo y parámetros maestros en f32, paralelizado mediante FSDP. El optimizador es AdamH (Adam con Hyperball), que restringe cada peso de proyección a la esfera de norma de Frobenius sobre la que se inicializó, eliminando la necesidad de weight decay. La tasa de aprendizaje sigue una regla de transferencia estilo Complete(d)P con corrección `(T₀/T)^0.3` en función del horizonte de tokens, con constantes de referencia B₀ = 64, T₀ = 2,5 mil millones de tokens, η₀ = 0,00630, η₀,Adam = 0,000656 y ε₀ = 1,85 × 10⁻⁸. El schedule es WSD con 10 % de warmup lineal, 20 % de decaimiento lineal y suelo cero. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. No se documenta ninguna fase de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt, en modo modelo base (continuación, no instrucciones).
- Razonamiento matemático y formal, favorecido por la inclusión de ProofPile 2 en la mezcla de entrenamiento.
- Generación de código, derivada de la presencia de StarCoderData en el corpus.
- Conocimiento general de dominio web, procedente de Nemotron-CC.
- Soporte de tool calling / function calling: no disponible; el modelo no ha sido ajustado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; al ser un modelo base sin alineamiento, no se garantiza un comportamiento agéntico fiable.
- Capacidades multilingües: limitadas al inglés; la model card declara explícitamente ausencia de cobertura multilingüe.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Longitud de contexto efectiva de 4096 tokens, sin extensiones documentadas.

## Casos de uso

- Investigación sobre leyes de escalado: el checkpoint sirve como punto de la cuadrícula IsoFLOP para ajustar y validar curvas de pérdida frente a cómputo, parámetros y tokens, comparándolo con los demás modelos de la suite Delphi y con las predicciones pre-registradas del blog del proyecto.
- Reproducibilidad de experimentos: al estar asociado a una semilla concreta (42) y a un run de Weights & Biases documentado, permite replicar el entrenamiento y estudiar la varianza entre semillas en un mismo régimen de cómputo.
- Estudio de recetas de optimización: útil para analizar el efecto de AdamH y de la corrección `(T₀/T)^0.3` sobre la dinámica de entrenamiento en modelos de ~2.500 millones de parámetros, comparando con recetas AdamW convencionales.
- Generación de código como modelo base: mediante few-shot prompting se puede emplear para completar fragmentos de código en inglés, aprovechando el entrenamiento sobre StarCoderData, siempre en contextos de evaluación y no en producción.
- Razonamiento matemático exploratorio: con prompts few-shot de ProofPile 2 se pueden estudiar las capacidades emergentes de demostración formal en modelos de este tamaño.
- Baseline para comparativas académicas: sirve como referencia de un modelo denso de 2,5 B parámetros entrenado de forma compute-optimal, frente a modelos sobrentrenados del mismo tamaño, para cuantificar la penalización de entrenar fuera del óptimo cuando el coste de inferencia domina.
- Análisis de mezclas de datos: al documentarse la composición exacta (Nemotron-CC, StarCoderData, ProofPile 2) y los pipelines de reproducción, permite estudiar el impacto de distintas proporciones sobre las capacidades finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación de este checkpoint no se incluyen en la release. El blog del proyecto menciona proyecciones de MMLU, HumanEval y GSM8K derivadas de la ley de escalado, pero no se proporcionan cifras numéricas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 5,1 GB solo para pesos (2,544 × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 6-8 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,6 GB para pesos; en 4 bits, alrededor de 1,3 GB, aunque no se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 8-10 GB de VRAM para bf16; una RTX 4090 (24 GB) o A100/H100 ofrecen margen holgado para lotes mayores y contexto completo de 4096 tokens.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores) en bf16; en 4 bits cabría incluso en GPUs de 4-6 GB, aunque sin cuantizaciones oficiales documentadas.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte explícito de vLLM, llama.cpp u Ollama, aunque la arquitectura Qwen3ForCausalLM es compatible con dichos runtimes en principio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Delphi-3e20-2.5B (este) | 2,54 B | 4096 | Apache 2.0 (research-only) | Modelo base compute-optimal, solo inglés, sin evaluación publicada |
| Pythia-2.8B | 2,77 B | 2048 | Apache 2.0 | Suite de escalado inspiradora de Delphi; modelo base solo inglés, ampliamente estudiado |
| Qwen3-1.7B | 1,7 B | 32.768 | Apache 2.0 | Modelo base/instruido de la familia Qwen 3; contexto mucho mayor y evaluación publicada |
| SmolLM2-1.7B | 1,7 B | 8192 | Apache 2.0 | Modelo base/instruido con entrenamiento sobrentrenado y benchmarks publicados |

La comparación con Pythia es la más directa en propósito (suite de escalado con semillas múltiples y checkpoints intermedios), mientras que Qwen3 y SmolLM2 representan alternativas prácticas de tamaño similar con contexto mayor y evaluación pública. No se dispone de datos de rendimiento de este checkpoint para una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; la model card declara ausencia de cobertura multilingüe.
- Modelo base sin ajuste por instrucciones, RLHF ni alineamiento de seguridad: no es adecuado para uso conversacional directo ni para producción sin un post-entrenamiento previo.
- Riesgo de alucinación y de generar contenido sesgado o tóxico, inherente a un modelo preentrenado sobre mezcla web sin filtrado de seguridad documentado.
- La receta Delphi optimiza el coste de entrenamiento, no el coste de inferencia; para despliegues con mucha inferencia, un modelo más pequeño sobrentrenado puede ser preferible, tal como advierte la propia model card.
- La model card califica el artefacto como `research-only` y advierte de que no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia pública de su rendimiento en tareas downstream.
- El código de receta enlazado publica la configuración registrada, pero no identifica el checkout exacto usado en el entrenamiento completado, lo que puede afectar a la reproducibilidad bit a bit.
- La licencia Apache 2.0 permite uso comercial, pero la etiqueta `research-only` y la ausencia de evaluación desaconsejan su uso en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-3e20-2.5Bparams-18.6Btokens-seed42
- Organización Marin Community en Hugging Face: https://huggingface.co/marin-community
- Blog "Scaling Laws That Extrapolate 300× Past the Fit": https://openathena.ai/blog/delphi
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Receta de entrenamiento (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuración de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproducción: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en Weights & Biases: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-3e20-seed42-2026.09.22
- Paper de Pythia (inspiración): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
- AdamH (Adam with Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
