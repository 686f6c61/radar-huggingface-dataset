# openeurollm/Prelude-SFT-Excellent-v0.2

## Resumen

Prelude-SFT-Excellent-v0.2 es un ajuste fino supervisado (SFT) del modelo base Prelude, un modelo denso multilingue de 9B parametros desarrollado por OpenEuroLLM como parte de su iniciativa de modelos abiertos europeos. El checkpoint parte de `openeurollm/prelude-anneal300b-256k-rope20m-cont` y se entrena sobre el dataset `OpenEuroLLM-Excellent-SFT` durante dos epocas, con un total de 55.892 pasos y 58.365 millones de tokens de entrada procesados.

La caracteristica tecnica mas destacada es el condicionamiento explicito del modo de razonamiento: el modelo aprende a alternar entre respuestas directas y cadenas de razonamiento mediante los prefijos `/think` y `/no_think`, con una probabilidad de instruccion de pensamiento de 0,5 en los ejemplos de razonamiento. Esto permite controlar en inferencia si el modelo debe razonar paso a paso o responder de forma directa, algo relevante para equilibrar latencia y calidad en produccion.

El modelo tiene 9.093.567.488 parametros en formato safetensors (18,2 GB en BF16) y emplea un tokenizador propio de 256k entradas (`openeurollm/tokenizer-256k`). Su contexto de entrenamiento alcanza los 32.768 tokens con packing activado, aunque el nombre del checkpoint base sugiere extensiones de RoPE hasta 256k. Es un modelo experimental orientado a investigacion y evaluacion, no a despliegue comercial sin revision adicional de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, segun tags del repo) |
| Parametros totales | 9.093.567.488 (~9,1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en entrenamiento (packing); el base sugiere hasta 256k via RoPE |
| Tipos de cuantizacion | no disponible (solo pesos safetensors BF16 publicados) |
| Idiomas soportados | no disponible (modelo descrito como multilingue por OpenEuroLLM) |
| Licencia | no disponible (no se ha asignado licencia especifica al checkpoint; consultar base y dataset) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 9,1B parametros basado en la arquitectura Qwen3, segun los tags del repositorio. El checkpoint base `prelude-anneal300b-256k-rope20m-cont` indica un proceso de annealing sobre 300B tokens con extension de contexto mediante RoPE hasta 256k y un tokenizador de 256k entradas. El ajuste SFT se realizo durante 2 epocas con 55.892 pasos, una longitud maxima de secuencia de 32.768 tokens con packing y perdida calculada solo sobre los tokens del asistente (assistant-only loss), descartando respuestas supervisadas parcialmente truncadas.

El entrenamiento uso AdamW (β₁=0,9, β₂=0,95, ε=1e-8, weight decay 0), learning rate 8e-5 con decaimiento lineal y 3% de warmup, batch efectivo de 32 secuencias empaquetadas, clipping de gradiente 1,0, precision BF16 con FlashAttention 3 y kernels Liger, DeepSpeed ZeRO-2 y gradient checkpointing no reentrante. Se ejecuto en 32 GPU NVIDIA H100 distribuidas en 8 nodos de MareNostrum 5. La innovacion principal es el condicionamiento del modo de pensamiento: los ejemplos de razonamiento reciben `/think` o ninguna instruccion al 50%, mientras que los ejemplos de respuesta directa reciben `/no_think`, lo que ensena al modelo a conmutar entre ambos regimenes mediante el chat template incluido.

## Capacidades

- Generacion de texto conversacional con ajuste por instrucciones (instruction tuning / SFT).
- Razonamiento paso a paso controlable mediante el prefijo `/think` y respuestas directas mediante `/no_think`.
- Control del modo de pensamiento en inferencia mediante los argumentos `enable_thinking` y `thinking_instruction` (`"think"`, `"no_think"` o `None`).
- Capacidad multilingue heredada del modelo base Prelude (el autor lo describe como multilingue; el listado concreto de idiomas no esta disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo de pensamiento podria habilitar cadenas de razonamiento, pero no hay confirmacion en la model card.
- Capacidades de vision o audio: no disponibles.
- Compatible con text-generation-inference y endpoints compatibles (segun tags del repo).

## Casos de uso

- Asistentes conversacionales con control de latencia: usar `enable_thinking=False` o `/no_think` para respuestas rapidas en atencion al cliente y activar `/think` solo en consultas complejas, aprovechando la conmutacion aprendida durante el SFT.
- Generacion de explicaciones tecnicas con trazabilidad: activar el modo de pensamiento para obtener cadenas de razonamiento auditables en dominios como documentacion o soporte especializado.
- Procesamiento de documentos largos: con contexto de entrenamiento de 32.768 tokens y packing, el modelo puede manejar resumenes y extraccion de informacion sobre documentos extensos, aunque conviene validar el comportamiento mas alla de esa longitud.
- Investigacion en post-entrenamiento: el checkpoint y el dataset `OpenEuroLLM-Excellent-SFT` estan publicados con revisiones fijas, lo que permite reproducir el SFT o comparar estrategias de condicionamiento de pensamiento.
- Evaluacion multilingue europea: integrable en pipelines de benchmark de OpenEuroLLM para medir rendimiento en lenguas europeas frente a modelos base.
- Prototipado de chat con transformers: el repositorio incluye tokenizador y chat template listos para usar con `transformers` y `text-generation-inference`, adecuado para entornos de investigacion con GPU H100 o A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La coleccion de Hugging Face de OpenEuroLLM menciona un dashboard de evaluaciones multilingues de Prelude frente a baselines, pero no se proporcionan cifras concretas en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24-40 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: ~9-10 GB de pesos; en 4 bits: ~5-6 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: NVIDIA H100 o A100 para entrenamiento y evaluacion a contexto completo; RTX 4090 (24 GB) puede ejecutar el modelo en BF16 con contexto limitado o en cuantizacion 8/4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 o GPUs con 24 GB o mas usando cuantizacion; en BF16 completo requiere GPUs profesionales.
- Opciones de despliegue: `transformers`, `text-generation-inference` (soporte declarado en tags); vLLM, llama.cpp u Ollama no estan confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Prelude-SFT-Excellent-v0.2 | ~9,1B denso | 32.768 en entrenamiento (base sugiere 256k) | no disponible | Hugging Face, pesos safetensors |
| Qwen3 (variantes 8B) | ~8B denso | hasta 128k en variantes Qwen3 | Apache 2.0 en la mayoria de variantes | Hugging Face, amplia comunidad |
| Modelos europeos abiertos tipo Mistral 7B | ~7B denso | 32k en versiones recientes | Apache 2.0 | Hugging Face |

La comparacion detallada con benchmarks no esta disponible; las alternativas se citan por categoria y tamano, no por rendimiento medido frente a este checkpoint.

## Limitaciones y advertencias

- Modelo experimental de investigacion: OpenEuroLLM lo describe como experimental, sin garantias de robustez en produccion.
- Licencia no asignada al checkpoint: el autor indica que no se ha asignado licencia especifica y remite a las licencias del modelo base y del dataset; el uso comercial requiere revision legal previa.
- Riesgo de alucinacion: como todo modelo generativo ajustado por SFT, puede producir contenido plausible pero incorrecto, especialmente en modo de respuesta directa sin razonamiento.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Limitaciones de contexto: el entrenamiento se limita a 32.768 tokens; el comportamiento mas alla de esa longitud no esta validado aunque el base soporte RoPE extendido.
- Idiomas: aunque se describe como multilingue, no se publica la lista de idiomas cubiertos ni evaluaciones por idioma en la informacion disponible.
- Dependencia del chat template: el condicionamiento de pensamiento depende de usar el tokenizador y template incluidos; un template incorrecto degrada el comportamiento.
- Sin cuantizaciones oficiales publicadas: desplegar en hardware de consumo requiere generar cuantizaciones propias y validarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/Prelude-SFT-Excellent-v0.2
- Modelo base: https://huggingface.co/openeurollm/prelude-anneal300b-256k-rope20m-cont
- Dataset de entrenamiento: https://huggingface.co/datasets/openeurollm/OpenEuroLLM-Excellent-SFT
- Tokenizador: https://huggingface.co/openeurollm/tokenizer-256k
- Repositorio de post-entrenamiento: https://github.com/OpenEuroLLM/post-training
- PR de implementacion del condicionamiento de pensamiento: https://github.com/OpenEuroLLM/post-training/pull/68
- Discusion de experimento y evaluacion: https://github.com/OpenEuroLLM/Taskboard/issues/442
- Coleccion Prelude en Hugging Face: https://huggingface.co/collections/openeurollm/prelude
- Pagina oficial de Prelude 9B: https://www.openeurollm.eu/prelude
