# rohithck/delphi-2e19-837Mparams-3.6Btokens-seed62746

## Resumen

Delphi-2e19-837Mparams-3.6Btokens-seed62746 es un modelo base de 837.007.744 parametros perteneciente a la suite de escalado Delphi, desarrollada por el equipo Marin (Marin Community). Se trata de un checkpoint de investigacion entrenado con 3.612.672.000 tokens y una semilla de entrenamiento concreta (62746), dentro de una extension de Delphi que anade semillas y presupuestos de computo adicionales manteniendo la receta original. Su presupuesto de computo configurado es de 1,8e19 FLOPs, de ahi la etiqueta `2e19` del repositorio.

El modelo emplea una arquitectura tipo Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm y MLPs SwiGLU), con 15 capas, tamano oculto de 1408, 11 cabezas de atencion sin GQA y un vocabulario de 128.256 tokens basado en el tokenizer de Llama 3. La longitud maxima de secuencia es de 4096 tokens. Es un modelo unicamente preentrenado, sin ajuste por instrucciones ni alineamiento de seguridad.

Su relevancia es eminentemente cientifica: Delphi es la primera suite de escalado abierta del equipo Marin, inspirada en Pythia, y su ley de escalado predijo con un 0,2% de error la perdida final del mayor run de la suite (1e23 FLOPs, 25B parametros, 600B tokens) usando 300 veces menos computo. Este checkpoint concreto es una pieza de ese grid experimental, pensada para estudiar leyes de escalado, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm con escalado aprendido, SwiGLU MLP) |
| Parametros totales | 837.007.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16/f32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos: hidden size 1408, 15 capas, 11 cabezas de atencion, 11 KV heads (sin GQA), head dim 128, FFN intermedio 5632 (ratio MLP 4), vocabulario 128.256 (tokenizer Llama 3), RoPE con theta 500000 y escalado estilo Llama 3, sin terminos de bias y sin embeddings atados. Tamano del repositorio: 3,4 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuracion arquitectonica de Qwen 3: normalizacion pre-norm con RMSNorm, atencion con QK-norm y escalado aprendido, RoPE con theta 500000 y escalado estilo Llama 3, y MLPs SwiGLU con ratio 4. No emplea GQA (11 cabezas de atencion y 11 KV heads), no tiene embeddings atados y no usa terminos de bias. El vocabulario de 128.256 tokens corresponde al tokenizer de Llama 3.

El entrenamiento consumio 1,8e19 FLOPs en 55.125 pasos sobre 3.612.672.000 tokens con secuencias de 4096 tokens, usando precision f32 para los parametros maestros y bf16 para el computo, con paralelismo FSDP. El optimizador es AdamH (Adam con Hyperball), que restringe cada peso de proyeccion a permanecer sobre la esfera de norma de Frobenius en la que se inicializo, de modo que el weight decay deja de tener funcion y desaparece de la receta. La tasa de aprendizaje sigue una regla de transferencia estilo Complete(d)P con correccion `(T₀/T)^0.3` a medida que crece el horizonte de tokens, con schedule WSD (10% warmup lineal, 20% decay lineal, suelo 0). Constantes de referencia: B₀ = 64, T₀ = 2,5B tokens, η₀ = 0,00630, η₀,Adam = 0,000656, ε₀ = 1,85e-8. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2. El export de inferencia declara `architectures: ["Qwen3ForCausalLM"]` y los pesos no se modifican respecto al entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, en modo modelo base (completado, no instrucciones).
- Razonamiento y conocimiento general derivados del preentrenamiento sobre Nemotron-CC.
- Generacion de codigo, gracias a la inclusion de StarCoderData en la mezcla de entrenamiento.
- Razonamiento matematico y demostraciones formales, por la inclusion de ProofPile 2.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base sin ajuste).
- Capacidades multilingues: no, solo ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Capacidad de servir como punto de medida en estudios de leyes de escalado y reproducibilidad de semillas.

## Casos de uso

- Investigacion sobre leyes de escalado: el checkpoint sirve como punto de medida en el grid IsoFLOP de Delphi para ajustar y validar leyes que predicen perdidas de modelos mayores con menos computo.
- Estudio de variabilidad por semilla: al ser uno de varios checkpoints con semillas distintas en el mismo presupuesto de computo, permite cuantificar la varianza del entrenamiento a 1,8e19 FLOPs.
- Reproducibilidad de recetas de entrenamiento: util para validar la receta Complete(d)P con correccion `(T₀/T)^0.3` y el optimizador AdamH en un regimen de 837M parametros.
- Analisis de mezclas de datos: permite estudiar el efecto de la combinacion Nemotron-CC + StarCoderData + ProofPile 2 en las capacidades de codigo y matematicas frente a texto general.
- Baseline para ajuste fino supervisado en ingles: su licencia Apache 2.0 y su tamano permiten usarlo como punto de partida en experimentos academicos de fine-tuning, siempre asumiendo que carece de alineamiento.
- Experimentos de eficiencia de inferencia: con 837M parametros y contexto de 4096 tokens, es adecuado para probar tecnicas de cuantizacion, decodificacion especulativa o serving en hardware modesto dentro de entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos (837M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB con contexto completo de 4096 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, unos 0,5 GB. No se publican ficheros GGUF oficiales, por lo que habria que generarlos.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o evaluacion por lotes, A100 o H100 aportan margen.
- Cabe holgadamente en GPU consumer: si, incluidas GPUs de gama media y posiblemente inferencia en CPU con llama.cpp tras conversion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible y requeririan conversion o validacion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| delphi-2e19-837Mparams-3.6Btokens-seed62746 | 837M | 4096 | Apache 2.0 | Modelo base de investigacion, solo ingles, sin evaluacion publicada |
| Pythia-1B (EleutherAI) | 1,0B | 2048 | Apache 2.0 | Suite de escalado de referencia que inspiro Delphi; incluye checkpoints intermedios |
| Qwen3-0.6B | 0,6B | 32768 (segun version) | Apache 2.0 | Arquitectura base similar; incluye versiones instruct y mayor contexto |
| SmolLM2-1.7B | 1,7B | 8192 | Apache 2.0 | Modelo pequeno con versiones base e instruct, orientado a despliegue |

La comparacion de rendimiento con estas alternativas no esta disponible, ya que Delphi no publica resultados de benchmarks para este checkpoint.

## Limitaciones y advertencias

- Modelo unicamente preentrenado: no tiene ajuste por instrucciones, RLHF ni alineamiento de seguridad; no debe usarse directamente como asistente.
- Entrenado con una mezcla web mayoritariamente en ingles; no hay cobertura multilingue declarada.
- Riesgo de alucinacion y de generar contenido sesgado o inapropiado inherente a un modelo base sin filtros.
- La receta Delphi optimiza el coste de entrenamiento, no el de inferencia; para despliegues con mucha inferencia, un modelo mas pequeno sobrentrenado puede ser preferible (el blog cuantifica la penalizacion por entrenamiento fuera del optimo).
- La model card advierte que es un artefacto de investigacion no evaluado adecuadamente y que no es necesariamente seguro; su uso en produccion es bajo responsabilidad del usuario.
- Licencia Apache 2.0: permite uso comercial, pero al no haber alineamiento ni evaluacion, no es recomendable para aplicaciones orientadas a usuario final sin trabajo adicional.
- El codigo enlazado publica la receta registrada, pero no identifica el checkout exacto usado en el entrenamiento completado, lo que limita la reproducibilidad bit a bit.
- Es un checkpoint dentro de una release mucho mayor; conviene elegir el que corresponda al regimen de computo, parametros y tokens deseado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-2e19-837Mparams-3.6Btokens-seed62746
- Suite completa Delphi en Hugging Face: https://huggingface.co/marin-community
- Blog de Delphi ("Scaling Laws That Extrapolate 300× Past the Fit"): https://openathena.ai/blog/delphi
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Codigo de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-2e19-seed62746-2026.09.22
- Articulo sobre AdamH (Adam with Hyperball): https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
- Pythia (inspiracion de Delphi): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
