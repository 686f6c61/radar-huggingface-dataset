# Jolly-Q/Ripple-65B-Base-Preview

## Resumen

Ripple-65B Base Preview es un checkpoint base (solo preentrenamiento) de un transformer denso de aproximadamente 64.800 millones de parametros desarrollado por Ricursive Intelligence (publicado en Hugging Face bajo el usuario Jolly-Q). Se trata de la variante base del modelo Ripple-65B Preview, cuyo modelo instruido se distribuye en BF16 y NVFP4. El checkpoint base no ha pasado por midtraining ni por datos sinteticos de QA, lo que lo hace adecuado como punto de partida para fine-tuning propio mas que para uso conversacional directo.

El modelo se entrena desde cero sobre un corpus de 12 billones de tokens, mayoritariamente en ingles y codigo, con longitud de secuencia de 8K durante el preentrenamiento. La familia Ripple adopta una arquitectura densa (no MoE) con proporcion "thin-and-deep": d_model de 5120 y 80 capas, derivada de una arquitectura tipo Gemma 3N con mejoras de estabilidad y razonamiento (clipping de activaciones FFN, atencion con compuertas, NoPE global, value residuals y sobreaprovisionamiento de cabezas de atencion). El modelo instruido de la familia declara soporte de hasta 1M tokens de contexto.

La relevancia del anuncio radica en la eficiencia declarada: la escalera de modelos Ripple v1 mejora la eficiencia de computo en codigo 16x respecto a la de Olmo 3, llegando a 55x en el modelo final, manteniendo un MFU del 40% durante preentrenamiento y postentrenamiento con sharding simple, sin kernels personalizados y sin cuantizacion. Con 65B parametros densos, el modelo cabe en hardware de consumo como una NVIDIA DGX Spark en formato NVFP4, lo que abre la puerta al desarrollo local de modelos de esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Gemma 3N, aspect ratio thin-and-deep, d_model 5120, 80 capas) |
| Parametros totales | 64.782.689.360 (~64,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8K en preentrenamiento; hasta 1M declarado para el modelo instruido de la familia (no confirmado para este checkpoint base) |
| Tipos de cuantizacion | BF16 en este repo; NVFP4 disponible para la variante instruida (no para este checkpoint base) |
| Idiomas soportados | no disponible (corpus mayoritariamente ingles y codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Ripple-65B es un transformer denso modernizado, no un Mixture-of-Experts. El equipo justifica explicitamente esta eleccion por reducir la complejidad de infraestructura de preentrenamiento y postentrenamiento manteniendo buen rendimiento en razonamiento y tareas agenticas. La arquitectura parte de una base tipo Olmo 3 (llama-like) y migra a una arquitectura tipo Gemma 3N para mejorar la estabilidad a escala. Sobre esa base se introducen varias modificaciones: clipping de activaciones en la FFN, atencion con compuertas (gated attention), NoPE global, value residuals, sobreaprovisionamiento del numero de cabezas de atencion, mayor proporcion de capas SWA (sliding window attention) frente a globales y reduccion de la ventana SWA para compensar el coste adicional.

El preentrenamiento se realiza desde cero sobre 12 billones de tokens de texto y codigo, predominantemente en ingles, con secuencia de 8K, 877.500 pasos y batch size escalando de 1408 a 3072. Este checkpoint base es solo preentrenamiento: no ha pasado por midtraining ni por SFT ni RL. La receta completa de la familia (aplicada al modelo instruido) incluye midtraining de 200B tokens a 64K, una fase de contexto largo de 6.5B tokens a 2M, SFT de 183B tokens a 128K, SFT de contexto largo de 13.5B tokens a 2M y RL mixto de 700 pasos a 128K con batch 2048. El entrenamiento se disena para hardware NVIDIA, con MFU del 40%, sharding simple, sin kernels personalizados y sin cuantizacion durante el entrenamiento.

## Capacidades

- Generacion de texto autoregresiva como checkpoint base; requiere fine-tuning o adaptacion para instrucciones.
- Base para fine-tuning en codigo, razonamiento y tareas agenticas, dado el sesgo del corpus hacia codigo y texto en ingles.
- Capacidad de razonamiento potenciada por diseno arquitectonico (sobreaprovisionamiento de cabezas, NoPE global, value residuals), aunque sin postentrenamiento no dispone de modo thinking explicito.
- No dispone de tool calling ni function calling de fabrica en este checkpoint base (esas capacidades se declaran para el modelo instruido de la familia).
- No dispone de capacidades de agente ni multi-step reasoning listas para uso sin postentrenamiento.
- Capacidades multilingues no confirmadas; el corpus es mayoritariamente ingles y codigo.
- Sin vision, audio ni modalidades adicionales: texto unicamente.

## Casos de uso

- Fine-tuning supervisado propio: el checkpoint base sirve como punto de partida para SFT sobre dominios especificos (legal, medico, atencion al cliente) sin arrastrar sesgos de instruccion ajenos.
- Investigacion en escalado y recetas de entrenamiento: permite reproducir y comparar la receta Ripple frente a Olmo 3, dado que la model card publica la escalera de eficiencia de computo (16x a 55x).
- Desarrollo de modelos de codigo: el corpus esta sesgado hacia codigo, por lo que un SFT sobre datos de programacion produce un modelo competitivo para autocompletado y generacion en IDE.
- Experimentos de contexto largo: aunque el preentrenamiento es a 8K, la arquitectura y la receta de la familia incluyen fases a 2M, lo que permite estudiar extension de contexto sobre este checkpoint.
- Base para destilacion: al ser denso y de 65B, puede actuar como profesor para modelos menores en pipelines de destilacion.
- Despliegue local en hardware de consumo: en NVFP4 la familia cabe en una DGX Spark, lo que permite experimentacion local sin cluster.
- Evaluacion comparativa de arquitecturas densas frente a MoE: util para laboratorios que quieran medir el coste/beneficio de un denso de 65B frente a MoE de mayor tamano total.

## Benchmarks y rendimiento

La model card del checkpoint base no publica resultados de benchmarks para este checkpoint. Los datos de benchmarks disponibles corresponden al modelo instruido Ripple-65B Preview y se comparan con modelos de otros laboratorios. Se recogen a continuacion los unicos resultados citados en la informacion proporcionada:

| Benchmark | Ripple-65B Preview (instruido) |
|---|---|
| TerminalBench 2.1 | 80.52 |
| Reflection Beam 501B (referencia) | 80.1 |
| Meta Muse Spark Open 816B (referencia) | 76.4 |
| Thinking Machines Inkling 975B (referencia) | 63.8 |
| NVIDIA Nemotron 3 Ultra 550B (referencia) | 56.4 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, SWE-bench, etc.) para el checkpoint base en la informacion disponible. La tabla comparativa completa de la model card aparece truncada en la informacion proporcionada, por lo que no se pueden recoger mas filas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 130 GB de pesos, mas overhead de activaciones y KV cache; en la practica requiere multiples GPU o una GPU de 140+ GB.
- VRAM estimada en NVFP4: aproximadamente 32-33 GB de pesos para la variante instruida cuantizada (no disponible para este checkpoint base).
- GPU recomendadas: B200, H100, A100 80GB en configuracion multi-GPU para BF16; DGX Spark para NVFP4 segun la model card.
- Cabe en consumer GPU: no en BF16; en NVFP4 si, segun la model card, en una NVIDIA DGX Spark.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama para variantes cuantizadas; el repo usa custom_code, por lo que requiere transformers con `trust_remote_code=True`.
- Latencia y throughput: 250 tok/s en 2xB200 con batch=8, antes de cuantizacion o kernels personalizados, segun la model card (dato del modelo instruido).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview (instruido) | ~65B denso | hasta 1M | 80.52 | Apache 2.0 | Hugging Face |
| Reflection Beam 501B | 501B | no disponible | 80.1 | no disponible | no disponible |
| Meta Muse Spark Open 816B | 816B | no disponible | 76.4 | no disponible | no disponible |
| Thinking Machines Inkling 975B | 975B | no disponible | 63.8 | no disponible | no disponible |
| NVIDIA Nemotron 3 Ultra 550B | 550B | no disponible | 56.4 | no disponible | no disponible |

La comparacion se limita al benchmark TerminalBench 2.1 citado en la model card. No hay datos de parametros activos, contexto ni licencia de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint base sin postentrenamiento: no sigue instrucciones, no tiene modo conversacional ni tool calling de fabrica; su uso directo produce continuaciones de texto, no respuestas.
- Riesgo elevado de alucinacion en uso directo sin SFT/RL, dado que no ha pasado por alineamiento.
- Sesgo linguistico: corpus mayoritariamente en ingles y codigo; rendimiento en castellano y otros idiomas no confirmado.
- Contexto efectivo de 8K en este checkpoint; la ventana de 1M corresponde a fases posteriores de la receta de la familia, no a este base.
- Licencia Apache 2.0 permite uso comercial, pero el repo usa custom_code: verificar la implementacion antes de desplegar en produccion.
- Repo de 129,6 GB: requiere almacenamiento y ancho de banda considerables para descarga y carga.
- Modelo muy reciente (creado en noviembre de 2026) con 0 descargas y 0 likes en Hugging Face: ecosistema de tooling y validacion comunitaria aun inexistente.
- La model card esta truncada en la informacion disponible; faltan datos de evaluacion y parte de la tabla comparativa.

## Enlaces

- Hugging Face (checkpoint base): https://huggingface.co/Jolly-Q/Ripple-65B-Base-Preview
- Modelo instruido BF16: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Modelo instruido NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Modelo base (referencia del autor): https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Variante DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
