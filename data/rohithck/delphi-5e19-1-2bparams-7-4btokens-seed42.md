# rohithck/delphi-5e19-1.2Bparams-7.4Btokens-seed42

## Resumen

Delphi es la primera suite de escalado abierta del equipo Marin, inspirada en Pythia. Este checkpoint concreto (`delphi-5e19-1.2Bparams-7.4Btokens-seed42`) es un modelo base de 1.180.038.272 parámetros entrenado con 7.363.231.744 tokens bajo un presupuesto de cómputo de 5,3e19 FLOPs y semilla aleatoria 42. Forma parte de una extensión de Delphi con semillas y presupuestos adicionales, siguiendo la receta original.

El modelo emplea una arquitectura tipo Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm y MLPs SwiGLU), con 17 capas, tamaño oculto de 1664, 13 cabezas de atención sin GQA y una longitud máxima de secuencia de 4096 tokens. Usa el tokenizador de Llama 3 con un vocabulario de 128.256 entradas.

Su relevancia es fundamentalmente metodológica: Delphi demuestra que una ley de escalado ajustada con modelos pequeños puede predecir la pérdida final de un modelo 300 veces mayor con un error del 0,2 %, y proyectar benchmarks downstream (MMLU, HumanEval, GSM8K) mediante una regresión en dos pasos. Este checkpoint es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU) |
| Parametros totales | 1.180.038.272 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura: hidden size 1664, 17 capas, 13 cabezas de atención, 13 KV heads (sin GQA), head dim 128, FFN intermedio 6656 (ratio MLP 4), vocabulario 128.256 (tokenizador Llama 3), RoPE con theta 500000 y escalado estilo Llama 3, sin términos de bias y sin embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Qwen 3. El entrenamiento se realizó con 7.363.231.744 tokens en 56.177 pasos, secuencia de 4096, precisión f32 para parámetros maestros y bf16 para cómputo, con FSDP como estrategia de paralelismo. El optimizador es AdamH (Adam con Hyperball), que restringe cada peso de proyección a la esfera de norma de Frobenius sobre la que se inicializó, eliminando la necesidad de weight decay. La tasa de aprendizaje sigue un schedule WSD (10 % warmup lineal, 20 % decay lineal, suelo cero) con una regla de transferencia estilo Complete(d)P y corrección `(T₀/T)^0.3` a medida que crece el horizonte de tokens. Constantes de referencia: B₀ = 64, T₀ = 2,5 B tokens, η₀ = 0,00630, η₀,Adam = 0,000656, ε₀ = 1,85e-8.

La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. No se aplicó instruction tuning, RLHF ni alineamiento de seguridad: es un modelo estrictamente pretrained. La innovación técnica principal no está en el modelo en sí, sino en la metodología de la suite Delphi: la receta mapea presupuestos de cómputo a configuraciones de modelo y la ley de escalado asociada extrapola 300 veces más allá del ajuste.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt (modelo base, sin formato de instrucciones).
- Modelado de lenguaje general sobre mezcla web, código y matemáticas (Nemotron-CC, StarCoderData, ProofPile 2).
- Capacidad de continuación de código y de texto matemático/formal, derivada de la composición del dataset.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenado.
- Sin capacidades multimodales (visión, audio) ni modo thinking.
- Cobertura multilingüe: únicamente inglés.

## Casos de uso

- Investigación en leyes de escalado: reproducir o extender el ajuste de Delphi usando este checkpoint como punto de la cuadrícula IsoFLOP a 5,3e19 FLOPs, comparando pérdida frente a modelos de mayor y menor presupuesto.
- Estudio de semillas y varianza de entrenamiento: al existir checkpoints con la misma receta y distintas semillas, sirve para medir la variabilidad del loss final y de las proyecciones downstream.
- Baseline para experimentos de recetas de entrenamiento: su configuración documentada (AdamH, WSD, corrección `(T₀/T)^0.3`) permite aislar el efecto de cambios en optimizador o schedule.
- Fine-tuning supervisado en dominios concretos: con 1,2 B parámetros y licencia Apache 2.0, es viable ajustarlo en una sola GPU para tareas de clasificación, extracción o generación acotada en inglés.
- Evaluación de metodologías de predicción de benchmarks: usar sus resultados reales en MMLU, HumanEval y GSM8K (cuando se publiquen) para validar la regresión en dos pasos propuesta por el equipo Marin.
- Docencia y divulgación sobre scaling laws: el modelo es lo bastante pequeño para entrenarse o inferirse en hardware asequible, lo que facilita reproducir experimentos en cursos o talleres.
- Generación de texto en inglés sin requisitos de alineamiento: aplicaciones internas de continuación de texto donde no se necesita un modelo instruido ni filtros de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación de este checkpoint no se incluyen en esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,4 GB solo para pesos, más overhead de activaciones y caché KV (con 4096 tokens de contexto, la caché KV añade varios cientos de MB según batch).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,2-1,5 GB para pesos; en 4 bits, aproximadamente 0,7-1 GB. Los tipos de cuantización no están documentados por el autor, pero el formato es compatible con las herramientas habituales.
- GPU recomendadas: cualquier GPU consumer moderna sirve. Cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, así como en A100, H100 y L40S para despliegues con mayor batch.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 8 GB o más en bf16 y con 4-6 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama previa conversión a GGUF, ya que el repo solo publica safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| delphi-5e19-1.2Bparams-7.4Btokens-seed42 | 1,18 B | 4096 | Apache 2.0 | Base, solo ingles, artefacto de investigación de la suite Delphi |
| Pythia-1.4B | 1,4 B | 2048 | Apache 2.0 | Suite de escalado de referencia de EleutherAI, con checkpoints intermedios |
| Qwen3-1.7B | 1,7 B | 32.768 | Apache 2.0 | Modelo base/instruido con contexto mucho mayor y cobertura multilingüe |
| SmolLM2-1.7B | 1,7 B | 8192 | Apache 2.0 | Base entrenado con más tokens y contexto superior |

La comparación con Pythia es la más directa por propósito (suite de escalado con checkpoints reproducibles). Frente a Qwen3-1.7B o SmolLM2-1.7B, Delphi ofrece menor contexto y solo inglés, pero su valor está en la trazabilidad metodológica y en la cuadrícula IsoFLOP, no en el rendimiento absoluto. No se dispone de cifras de benchmark para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; sin cobertura multilingüe.
- Solo pretrained: no hay instruction tuning, RLHF ni alineamiento de seguridad, por lo que puede generar contenido inapropiado o inseguro sin filtros adicionales.
- La model card advierte de que no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es bajo responsabilidad del usuario.
- Riesgo de alucinación propio de un modelo base de 1,2 B parámetros entrenado con solo 7,4 B tokens; la calidad factual será limitada.
- Contexto máximo de 4096 tokens, inferior al de modelos contemporáneos de tamaño similar.
- La receta Delphi optimiza el coste de entrenamiento, no el de inferencia; para despliegues con mucha inferencia, un modelo más pequeño sobrentrenado puede ser preferible (el blog cuantifica esta penalización).
- Licencia Apache 2.0 permite uso comercial, pero el tag `research-only` refleja la intención del autor y la ausencia de garantías.
- Es un checkpoint dentro de una release mayor; conviene seleccionar el que corresponda al régimen de cómputo, parámetros y tokens deseado.

## Enlaces

- HuggingFace: https://huggingface.co/rohithck/delphi-5e19-1.2Bparams-7.4Btokens-seed42
- Blog de Delphi: https://openathena.ai/blog/delphi
- Checkpoints de la suite: https://huggingface.co/marin-community
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Código de la receta (AdamH): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuración de entrenamiento: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproducción: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-5e19-seed42-2026.09.22
- Paper de Pythia (inspiración): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
- Blog sobre AdamH: https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
