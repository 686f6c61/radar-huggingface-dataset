# rohithck/delphi-3e19-998Mparams-5Btokens-seed42

## Resumen

Delphi-3e19-998Mparams-5Btokens-seed42 es un modelo base de lenguaje de aproximadamente 998 millones de parámetros, desarrollado por el equipo Marin (rohithck en el Hub) como parte de la suite de escalado Delphi. Se trata de un artefacto de investigación entrenado desde cero sobre 4.982.571.008 tokens con una semilla concreta (42) y un presupuesto de cómputo configurado de 3e19 FLOPs. No es un modelo afinado para instrucciones ni alineado: es un checkpoint de preentrenamiento puro pensado para estudiar leyes de escalado.

La relevancia del modelo es metodológica más que de producto. Delphi es la primera suite de escalado abierta del equipo Marin, inspirada en Pythia, y su objetivo es mapear presupuestos de cómputo a configuraciones de modelo, entrenar una rejilla IsoFLOP y derivar una ley de escalado capaz de predecir modelos mayores. Según la documentación del proyecto, una predicción pre-registrada de esa ley acertó la pérdida final del mayor run de Delphi (1e23 FLOPs, 25 B parámetros, 600 B tokens) con un error del 0,2 %, usando 300 veces menos cómputo que el entrenamiento real.

Arquitectura Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm y MLP SwiGLU), 16 capas, hidden size 1536, 12 cabezas de atención sin GQA y contexto máximo de 4096 tokens. El vocabulario es el tokenizador de Llama 3 (128.256 entradas). La licencia es Apache 2.0, aunque la model card lo etiqueta explícitamente como "research-only" y advierte de que no ha sido evaluado ni probado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU) |
| Parametros totales | 998.036.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en bf16/f32; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (etiquetado research-only en la model card) |
| Formato de pesos | safetensors (transformers, `Qwen3ForCausalLM`) |
| Hidden size | 1536 |
| Capas | 16 |
| Cabezas de atencion | 12 (12 KV heads, sin GQA) |
| Head dim | 128 |
| FFN intermedio | 6144 (ratio MLP 4) |
| Vocabulario | 128.256 (tokenizador Llama 3) |
| Embeddings atados | No |
| Bias | Ninguno |
| Tokens de entrenamiento | 4.982.571.008 |
| Pasos de entrenamiento | 38.014 |
| Semilla | 42 |
| Presupuesto de computo | 3e19 FLOPs |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen 3: transformer decoder con pre-normalización, RMSNorm, RoPE con theta 500000 y escalado estilo Llama 3, QK-norm con escalado aprendido, MLP SwiGLU con ratio 4 y sin términos de bias. No usa GQA (12 cabezas de query y 12 de key/value) ni embeddings atados. La exportación de inferencia declara `architectures: ["Qwen3ForCausalLM"]` y los pesos son idénticos a los del entrenamiento.

El entrenamiento usó 4.982.571.008 tokens en 38.014 pasos con secuencias de 4096 tokens, precisión bf16 en cómputo y parámetros maestros en f32, paralelización FSDP y el optimizador AdamH (Adam con Hyperball), que restringe cada matriz de pesos a la esfera de norma de Frobenius de su inicialización y elimina la necesidad de weight decay. La receta Delphi aplica una regla de transferencia estilo Complete(d)P con corrección `(T₀/T)^0.3` sobre el learning rate según crece el horizonte de tokens, con schedule WSD (10 % warmup lineal, 20 % decaimiento lineal, suelo 0). La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. Las constantes de referencia son B₀ = 64, T₀ = 2,5 B tokens, η₀ = 0,00630, η₀,Adam = 0,000656 y ε₀ = 1,85 × 10⁻⁸.

## Capacidades

- Generación de texto autoregresiva en inglés, sin modo de razonamiento ni "thinking mode".
- Modelo base preentrenado: no incluye instrucciones, plantillas de chat ni alineación de seguridad.
- Capacidad de continuación de código y matemáticas derivada de la mezcla de datos (StarCoderData, ProofPile 2), aunque sin evaluación publicada.
- No se documenta soporte de tool calling ni function calling nativo.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüe: no disponible; solo inglés.
- Sin capacidades de visión ni audio.
- Contexto de 4096 tokens, adecuado para documentos cortos y ventanas de conversación limitadas.

## Casos de uso

- Investigación en leyes de escalado: el checkpoint sirve como punto de la rejilla IsoFLOP para reproducir los ajustes de pérdida frente a cómputo y validar la ley de escalado de Delphi con una semilla adicional.
- Reproducibilidad de experimentos: al fijar semilla 42 y 4.982.571.008 tokens, permite repetir exactamente el run y comparar variaciones de receta (AdamH frente a AdamW, correcciones de learning rate) sobre una base idéntica.
- Estudio de mezclas de datos: al combinar Nemotron-CC, StarCoderData y ProofPile 2, es útil para analizar cómo afecta cada componente a la pérdida en dominios concretos (código, matemáticas, web) en un modelo pequeño y barato de entrenar.
- Ajuste fino supervisado como experimento controlado: con casi 1 B de parámetros, cabe en una GPU de 24 GB en bf16 y permite probar protocolos de SFT o DPO sin el coste de modelos mayores.
- Generación de texto de dominio general para prototipos internos: continuación de documentos en inglés con contexto de 4096 tokens, siempre que se acepte la ausencia de alineación y de evaluación.
- Baseline en pipelines de evaluación: sirve como referencia de un modelo preentrenado compute-optimal frente a modelos sobrentrenados más pequeños en tareas de perplejidad y benchmarks downstream.
- Docencia y divulgación: ejemplo abierto y reproducible de entrenamiento a escala de 1 B de parámetros con receta documentada, útil para cursos de entrenamiento de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "Evaluation results for this checkpoint are not included in this release". El blog de Delphi menciona proyecciones downstream (MMLU, HumanEval, GSM8K) mediante una regresión en dos pasos que combina leyes de escalado de cómputo y observacionales, pero no se aportan cifras por checkpoint en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB para los pesos (998 M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 2,5 y 4 GB según longitud de contexto y batch.
- VRAM en fp32: aproximadamente 4 GB solo para pesos.
- Cuantización a 8 bits: alrededor de 1 GB de pesos; a 4 bits, alrededor de 0,5 GB, aunque no se publican GGUF oficiales y habría que generarlos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, 3070, 4060, 4070, 4080, 4090) es suficiente; para serving con concurrencia, A10G, L4, A100 o H100 aportan margen.
- Cabe holgadamente en GPU consumer: sí, incluso en tarjetas de 8 GB con contexto completo.
- Opciones de despliegue: transformers (referencia), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Delphi-3e19-998M (este) | 998 M | 4096 | Apache 2.0 (research-only) | Base preentrenado, solo inglés, sin evaluación publicada |
| Pythia-1B | 1.000 M | 2048 | Apache 2.0 | Suite de escalado con checkpoints intermedios; referencia directa de inspiración |
| OLMo-1B | 1.176 M | 2048 | Apache 2.0 | Modelo base abierto con datos y receta publicados |
| Qwen3-0.6B | 596 M | 32.768 | Apache 2.0 | Base más pequeño con contexto mucho mayor y versiones instruct |

La comparación con Pythia y OLMo es la más pertinente por tratarse de suites de investigación con recetas abiertas. Frente a Qwen3-0.6B, el modelo de Delphi ofrece más parámetros pero un contexto ocho veces menor y ninguna variante instruct. No se dispone de datos de rendimiento comparativo para este checkpoint.

## Limitaciones y advertencias

- Solo inglés: entrenado sobre una mezcla web con predominio de inglés y sin cobertura multilingüe declarada.
- Modelo base sin alineación: no hay instruction tuning, RLHF ni ajuste de seguridad; puede generar contenido sesgado, tóxico o incorrecto sin filtros.
- Riesgo de alucinación alto, como en cualquier modelo preentrenado de este tamaño sin evaluación ni calibración.
- Sin evaluación publicada: la model card advierte de que no ha sido probado adecuadamente y de que no es necesariamente seguro.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- La receta Delphi optimiza el coste de entrenamiento, no el de inferencia; para despliegues con mucha inferencia, un modelo más pequeño sobrentrenado puede ser preferible (el blog cuantifica la penalización del entrenamiento "off-optimal").
- Etiqueta research-only en la model card: aunque la licencia es Apache 2.0, el autor desaconseja su uso en producción.
- Es un checkpoint entre muchos de la suite Delphi; conviene elegir el que corresponda al régimen de cómputo, parámetros y tokens deseado.
- El código de la receta enlazado publica la configuración registrada, pero no identifica el checkout exacto usado en el entrenamiento completado, lo que limita la reproducibilidad bit a bit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-3e19-998Mparams-5Btokens-seed42
- Suite Delphi en el Hub: https://huggingface.co/marin-community
- Blog de Delphi ("Scaling Laws That Extrapolate 300× Past the Fit"): https://openathena.ai/blog/delphi
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Repositorio Marin: https://github.com/marin-community/marin
- Código de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuración de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproducción: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-3e19-seed42-2026.09.22
- Artículo sobre AdamH (Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia (inspiración de la suite): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
