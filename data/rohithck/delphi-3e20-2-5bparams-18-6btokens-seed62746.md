# rohithck/delphi-3e20-2.5Bparams-18.6Btokens-seed62746

## Resumen

Delphi es la primera suite abierta de leyes de escala del equipo Marin, inspirada en Pythia. Este checkpoint concreto, `delphi-3e20-2.5Bparams-18.6Btokens-seed62746`, es un modelo base de 2.544.614.912 parametros entrenado sobre 18.617.466.880 tokens con una semilla de entrenamiento fija (62746) y un presupuesto de computo configurado de 3e20 FLOPs. Pertenece a una extension de la suite Delphi original que anade semillas y presupuestos de computo adicionales manteniendo la receta original.

El modelo emplea la arquitectura Qwen 3 (decoder pre-norm con RMSNorm, RoPE, QK-norm con escalado aprendido y MLPs SwiGLU), con 23 capas, tamano oculto de 2304, 18 cabezas de atencion sin GQA y un vocabulario de 128.256 tokens basado en el tokenizador de Llama 3. La longitud maxima de secuencia es de 4096 tokens.

Su relevancia es fundamentalmente metodologica: forma parte de un conjunto disenado para estudiar leyes de escala y predecir el rendimiento de modelos mayores a partir de los pequenos. La prediccion pre-registrada de la ley de escala de Delphi acerto el loss final del mayor run (1e23 FLOPs, 25B parametros, 600B tokens) con un error del 0,2%, usando 300 veces menos computo que el entrenamiento real. Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3 (decoder pre-norm, RMSNorm, RoPE, QK-norm, SwiGLU) |
| Parametros totales | 2.544.614.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (arquitectura `Qwen3ForCausalLM`) |

Detalles adicionales de configuracion: hidden size 2304, 23 capas, 18 cabezas de atencion, 18 KV heads (sin GQA), head dim 128, FFN intermedio 9216 (ratio MLP 4), vocab 128.256, RoPE con theta 500000 y escalado estilo Llama 3, sin terminos de bias y sin embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo Qwen 3: pre-norm con RMSNorm, atencion con QK-norm y escalado aprendido, RoPE con theta 500000 y escalado tipo Llama 3, y MLPs SwiGLU. No usa GQA (18 cabezas de atencion y 18 KV heads) ni embeddings atados, y prescinde de terminos de bias. La exportacion de inferencia declara `Qwen3ForCausalLM` y los pesos no se han modificado respecto al entrenamiento.

El entrenamiento consumio 3e20 FLOPs en 35.510 pasos sobre secuencias de 4096 tokens, con 18.617.466.880 tokens en total y semilla 62746. Se uso el optimizador AdamH (Adam con Hyperball), que restringe cada peso de proyeccion a permanecer en la esfera de norma de Frobenius en la que se inicializo, de modo que el weight decay deja de tener sentido en la receta. La tasa de aprendizaje sigue un esquema WSD (10% warmup lineal, 20% decay lineal, suelo 0) con una regla de transferencia estilo Complete(d)P y correccion `(T0/T)^0.3` a medida que crece el horizonte de tokens (constantes de referencia: B0 = 64, T0 = 2,5B tokens, eta0 = 0,00630, eta0,Adam = 0,000656, epsilon0 = 1,85e-8). La precision es f32 en parametros maestros y bf16 en computo, con paralelismo FSDP. La mezcla de datos combina Nemotron-CC, StarCoderData y ProofPile 2, tokenizada con el tokenizador de Llama 3.

## Capacidades

- Generacion de texto autoregresiva en ingles (modelo base, sin instrucciones).
- Modelado de lenguaje y continuacion de texto sobre contexto de hasta 4096 tokens.
- Capacidad potencial en codigo y matematicas por la presencia de StarCoderData y ProofPile 2 en la mezcla de entrenamiento, aunque no se han publicado evaluaciones que lo cuantifiquen.
- No dispone de tool calling ni function calling: es un checkpoint preentrenado sin ajuste de instrucciones.
- No soporta agentes ni razonamiento multi-paso de forma fiable sin post-entrenamiento.
- Capacidades multilingues: no disponibles (entrenado sobre una mezcla web predominantemente en ingles).
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre leyes de escala: el modelo sirve como punto de la rejilla IsoFLOP para ajustar y validar leyes de escala que predigan modelos mayores con menos computo, que es exactamente el proposito de la suite Delphi.
- Estudios de reproducibilidad y varianza entre semillas: al existir checkpoints con distintas semillas y presupuestos, permite medir la dispersion del loss y de las metricas downstream atribuible a la inicializacion y al orden de los datos.
- Experimentos controlados de receta de entrenamiento: al estar publicada la receta (AdamH, WSD, correccion `(T0/T)^0.3`) y el codigo, se puede usar como linea base para comparar variantes de optimizador o schedule a escala de 3e20 FLOPs.
- Analisis de mezclas de datos: la combinacion Nemotron-CC + StarCoderData + ProofPile 2 permite estudiar el efecto de la composicion del corpus en un modelo de 2,5B parametros con contexto de 4096 tokens.
- Generacion de texto en ingles como tarea auxiliar: continuacion de texto y prototipado de pipelines de generacion con `transformers` o TGI, siempre con la advertencia de que no esta alineado ni evaluado.
- Ensenanza y divulgacion: el modelo cabe en una GPU consumer en bf16 o fp16 y permite demostrar en clase como se comporta un modelo base sin ajuste, por que alucina y por que la alineacion importa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de este checkpoint no se incluyen en la release. La suite Delphi publica proyecciones downstream (MMLU, HumanEval, GSM8K) mediante una regresion en dos pasos que combina leyes de escala de computo y observacionales, pero no se proporcionan cifras concretas para este checkpoint en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 5,1 GB solo para pesos (2,5446e9 parametros x 2 bytes), mas el coste de activaciones y cache KV.
- Cache KV: con 23 capas, 18 KV heads, head dim 128 y contexto de 4096, el coste es moderado; sin GQA el ahorro de memoria en contexto largo es menor que en modelos con atencion agrupada.
- Cuantizacion: no se documentan variantes oficiales; una cuantizacion a 8 bits dejaria los pesos en torno a 2,5 GB y a 4 bits en torno a 1,3 GB, pero requeriria convertir los safetensors por cuenta propia.
- GPU recomendadas: cabe con holgura en RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB) y A100/H100 (40/80 GB); en GPUs consumer de 8-12 GB requeriria cuantizacion.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversiones a llama.cpp/Ollama/vLLM no documentadas oficialmente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Delphi 3e20 2.5B (este) | 2,54B | 4096 | Apache 2.0 | Base, solo ingles, sin evaluacion publicada, artefacto de investigacion |
| Pythia 2.8B | 2,77B | 2048 | Apache 2.0 | Suite de escala de referencia con checkpoints intermedios; inspiracion declarada de Delphi |
| Qwen3 1.7B / 4B | 1,7B / 4B | 32.768 (nativo) | Apache 2.0 | Arquitectura base similar, con versiones instruct y evaluaciones publicadas |
| SmolLM2 1.7B | 1,7B | 8192 | Apache 2.0 | Base/instruct con evaluaciones publicadas y amplia adopcion |

La comparacion con Pythia es la mas directa por proposito (suite de escala con semillas multiples), mientras que Qwen3 y SmolLM2 son alternativas practicas si el objetivo es desplegar un modelo pequeno con contexto largo y versiones alineadas. No se dispone de datos de rendimiento comparativo para este checkpoint.

## Limitaciones y advertencias

- Modelo base preentrenado: no tiene instruction tuning, RLHF ni alineacion de seguridad; no debe usarse como asistente directo.
- Entrenado sobre una mezcla web predominantemente en ingles; no hay cobertura multilingue.
- La model card advierte de que el modelo no ha sido probado ni evaluado adecuadamente y no es necesariamente seguro; su uso en produccion es bajo responsabilidad del usuario.
- Riesgo elevado de alucinacion y de generar contenido sesgado o inapropiado al no existir filtrado por alineacion.
- La receta Delphi optimiza el coste de entrenamiento, no el de inferencia; para despliegues con mucha inferencia puede convenir un modelo mas pequeno y sobrentrenado (la propia model card cuantifica esta penalizacion en la seccion "off-optimal training").
- Contexto limitado a 4096 tokens, inferior al de modelos contemporaneos de tamano similar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion y alineacion hace desaconsejable su uso comercial sin un post-entrenamiento y una evaluacion propios.
- El codigo enlazado en la model card publica la receta registrada, pero no identifica el checkout exacto usado en el entrenamiento completado, lo que limita la reproducibilidad bit a bit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohithck/delphi-3e20-2.5Bparams-18.6Btokens-seed62746
- Suite completa Delphi en Hugging Face: https://huggingface.co/marin-community
- Datos de las figuras del blog: https://huggingface.co/datasets/marin-community/delphi-blog-data
- Blog "Scaling Laws That Extrapolate 300x Past the Fit": https://openathena.ai/blog/delphi
- Repositorio Marin: https://github.com/marin-community/marin
- Codigo de la receta (completed_adamh.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/completed_adamh.py
- Configuracion de entrenamiento (train_delphi_seeds.py): https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/experiments/references/train_delphi_seeds.py
- Instrucciones de reproduccion: https://github.com/marin-community/marin/blob/fded7179f373834a320f6c30dc68bd30476e07ae/docs/reproducibility/delphi-seed-repeats.md
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin/runs/delphi-seed-repeats-3e20-seed62746-2026.09.22
- Paper de Pythia (inspiracion): https://www.eleuther.ai/papers-blog/pythia-a-suite-for-analyzing-large-language-modelsacross-training-and-scaling
- AdamH (Hyperball), articulo de referencia: https://whenwen.github.io/wd_blog/public/hyperball-part-1.html
