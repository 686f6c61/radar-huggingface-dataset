# ethantodd4l/Swift-1.5-Qwen3.8-27b-Quark-RTN-MXFP4

## Resumen

Este repositorio no es un modelo nuevo, sino una cuantizacion del modelo `ukisai/Swift-1.5-Qwen3.8-27b` publicada por el usuario `ethantodd4l`. La cuantizacion lleva los pesos a MXFP4 (formato OCP MX, con elementos E2M1 y escalas E8M0 por bloque de 32 elementos) en el mismo contenedor de checkpoint Quark que usa la publicacion de referencia de AMD (`amd/Qwen3.8-27B-Quark-AWQ-MXFP4`). El resultado es un unico fichero `model.safetensors` de 19.8 GB, pensado para servirse con vLLM y el runtime radiance en hardware gfx1201 (RDNA4).

Swift 1.5 es una adaptacion de UkisAI sobre Qwen3.8-27B orientada a reducir el razonamiento redundante ("overthinking"): segun la informacion publicada, genera un 58.5% menos de tokens de pensamiento con una puntuacion un 0.35% superior a su base y una aceleracion de 1.95x. Incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI y conserva la interfaz estandar de Qwen3.8 con soporte de texto, imagen y video (pipeline `image-text-to-text`).

La relevancia de esta ficha concreta esta en la cuantizacion: el autor descarta AWQ y usa RTN puro porque el plegado AWQ generaba escalas de suavizado patologicas en la capa 7 (rango 0.0083 a 120.8) que destruian esa capa con entradas reales (error relativo de salida ~324). El inventario de tensores coincide con el contenedor Quark de referencia (1695 tensores) y la verificacion contra la base en BF16 da correlacion 0.991 en logits del siguiente token. Es, por tanto, una pieza de interes para quien despliegue Swift 1.5 en GPUs AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia Qwen3.5 (tag `qwen3_5`), con torre de vision, tensores Gated DeltaNet (conv/estado) y cabezas MTP; no se confirma si es densa o MoE |
| Parametros totales | 15.606.149.872 segun el inventario de safetensors del repo; el nombre del modelo y el modelo base se describen como 27B |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible (el comando de servicio de ejemplo fija `--max-model-len 8192`, valor de configuracion, no necesariamente el maximo del modelo) |
| Tipos de cuantizacion | MXFP4 (OCP MX: elementos E2M1, escalas E8M0 por bloque de 32; `weight` empaquetado en nibbles + `weight_scale` uint8). En el runtime radiance se ejecuta como W4A8 (activaciones FP8); tambien hay builds INT4 y NVFP4 del modelo base |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 para la cuantizacion; la base Qwen3.8-27B y los ficheros de tokenizer/config retenidos siguen bajo Apache License 2.0 |
| Formato de pesos | safetensors (un unico `model.safetensors`, contenedor Quark) |

## Arquitectura y entrenamiento

El modelo cuantizado hereda la arquitectura del base `ukisai/Swift-1.5-Qwen3.8-27b`. Los tags y los parametros no cuantizados revelan una arquitectura hibrida de la familia Qwen3.5: hay tensores de convolucion y estado de Gated DeltaNet (GDN), un modulo de atencion con backend R4D y modo de cache mamba (`--mamba-cache-mode align`), cabezas de multi-token prediction (MTP, 15 tensores en BF16) y una torre de vision (`model.visual.*`) que habilita la modalidad `image-text-to-text`. No se dispone de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineamiento (RLHF/DPO) de Swift 1.5 en la informacion proporcionada.

La innovacion tecnica de este repositorio es la receta de cuantizacion. Se cuantizaron 496 capas lineales del decodificador (todas las del modelo de lenguaje) con RTN (round-to-nearest, con exponentes de escala por bloque redondeados hacia arriba) y sin calibracion, ya que es weight-only. Quedan sin cuantizar la torre de vision, `lm_head`, los 15 tensores MTP (BF16), las normas, los embeddings y los parametros de convolucion/estado de GDN. El autor justifica abandonar AWQ: con la receta de suavizado de AMD, varias capas convergian a escalas patologicas (capa 7 entre 0.0083 y 120.8) y la cuantizacion a bloques MXFP4 de 32 elementos las destruia en entradas con outliers (error relativo de salida ~324). Tambien restauraron desde la base los 64 pesos de `post_attention_layernorm`. La verificacion incluye coincidencia exacta del inventario de tensores con el contenedor Quark de referencia (1695 tensores, mismas claves, formas, dtypes y `quantization_config`) y una comprobacion de logits tras desquantizar a BF16.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking": el modelo base esta optimizado para producir trazas de razonamiento mas cortas (58.5% menos tokens de pensamiento, segun la informacion publicada).
- Razonamiento matematico basico (el autor cita como prueba de humo la generacion correcta de la secuencia "2, 3, 5, 7").
- Generacion de codigo: el modelo base se posiciona explicitamente como fuerte en tareas de codigo.
- Tareas agenticas: segun la informacion del modelo base, destaca en escenarios agenticos y de multiples pasos.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`, torre de vision no cuantizada).
- Soporte de video segun la descripcion del modelo base (no confirmado de forma independiente).
- Conversacional multi-turno (tag `conversational`), con plantilla de chat de Qwen3.8.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no confirmado explicitamente en la informacion proporcionada.

## Casos de uso

- Razonamiento con presupuesto de tokens ajustado: el recorte del 58.5% en tokens de pensamiento reduce el coste por consulta en pipelines de razonamiento, manteniendo (segun el autor del base) una puntuacion ligeramente superior a la del modelo original.
- Despliegue en GPUs AMD RDNA4: al usar el contenedor Quark y el runtime radiance con `RADIANCE_MXFP4_W4A8`, es una via para servir un modelo de 27B en hardware gfx1201 sin depender de kernels CUDA.
- Asistente de codigo en produccion: el modelo base se orienta a tareas de codigo y agenticas, y la cuantizacion a 19.8 GB permite servirlo con vLLM en tensor-parallel 2.
- Analisis de documentos con imagenes: la torre de vision sin cuantizar permite tareas image-text-to-text (por ejemplo, extraccion de datos de capturas o diagramas) combinadas con razonamiento textual.
- Evaluacion de tecnicas de cuantizacion: el repositorio documenta con detalle por que AWQ falla aqui y como se valida la coherencia con logits (corr 0.991), lo que lo hace util como referencia metodologica para estudios de cuantizacion MXFP4.
- Backend de chat multi-turno servido con vLLM: con `--kv-cache-dtype fp8` y cache mamba alineada, encaja en despliegues conversacionales que aprovechan la cache FP8 para reducir memoria.
- Pipelines agenticos con contexto moderado: el ejemplo de servicio limita `--max-model-len` a 8192, suficiente para flujos de agente con historial acotado y llamadas a herramientas, si el modelo las soporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. El autor indica que los resultados de GSM8K 5-shot (perfiles con y sin thinking, mediante `gsm8k-eval`) se anadiran cuando finalicen las ejecuciones. Las unicas cifras disponibles son las del modelo base respecto a su predecesor, sin valores absolutos por tarea:

| Metrica (modelo base Swift 1.5) | Valor |
|---|---|
| Reduccion de tokens de pensamiento frente a la base | 58.5% menos |
| Diferencia de puntuacion frente a la base | +0.35% |
| Aceleracion en diversas tareas | 1.95x |
| Verificacion de logits tras desquantizar (vs base BF16) | rel=0.159, corr=0.991, top-1 `Paris` con logit identico (17.75), solapamiento top-5 4/5 |
| Inventario de tensores | 1695 tensores, coincidente con el contenedor Quark de referencia |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 19.8 GB en MXFP4. Con cache KV en FP8, hay que sumar entre 1 y 2 GB adicionales para contextos de 8192 tokens, mas activaciones y buffers.
- GPU recomendadas: el autor valida el modelo en gfx1201 (RDNA4) con tensor-parallel 2, usando el backend de atencion R4D y el kernel `RadianceMxfp4W4A8LinearKernel`. En el ecosistema CUDA, cualquier GPU con al menos 24 GB (RTX 4090, A100 40 GB, L40S, H100) deberia poder alojar los pesos, aunque los kernels MXFP4 W4A8 especificos son del runtime radiance.
- ¿Cabe en GPU de consumo? Si: 19.8 GB de pesos caben en una GPU de 24 GB si se limita el contexto y se usa cache KV FP8. Con tensor-parallel 2 en GPUs de 16 GB el reparto es mas holgado.
- Opciones de despliegue: vLLM 0.28.0 con el runtime radiance (configuracion validada por el autor). No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Variables de entorno requeridas: `RADIANCE_MXFP4=1` y `RADIANCE_MXFP4_W4A8=1`; para las cabezas MTP en BF16, `RADIANCE_QUARK_BF16_MTP=1`.
- Comando de referencia: `vllm serve ... --tensor-parallel-size 2 --max-model-len 8192 --attention-backend R4D --kv-cache-dtype fp8 --enforce-eager --mamba-cache-mode align`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ethantodd4l/Swift-1.5-Qwen3.8-27b-Quark-RTN-MXFP4 | 15.606.149.872 (inventario) | MXFP4 RTN, W4A8 en runtime | safetensors Quark, 19.8 GB | swift-open-license-1.0 | Hugging Face, 0 descargas, 1 like |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B (segun el autor) | Sin cuantizar (BF16) | safetensors | swift-open-license-1.0 | Hugging Face |
| ukisai/Swift-1.5-Qwen3.8-27b-INT4 | no disponible | INT4 | no disponible | swift-open-license-1.0 | Hugging Face |
| ukisai/Swift-1.5-Qwen3.8-27b-NVFP4 | no disponible | NVFP4 | no disponible | swift-open-license-1.0 | Hugging Face |
| amd/Qwen3.8-27B-Quark-AWQ-MXFP4 | no disponible | MXFP4 con AWQ | contenedor Quark | no disponible | Hugging Face; es la referencia de contenedor que replica este repo |

## Limitaciones y advertencias

- Repositorio practicamente sin adopcion: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo dia. No hay validacion externa de su calidad.
- Licencia no estandar: `swift-open-license-1.0` es una licencia propia de UkisAI, no una licencia open source ampliamente reconocida. Hay que revisar el fichero LICENSE y el NOTICE antes de cualquier uso comercial, teniendo en cuenta que la base Qwen3.8-27B y los ficheros de tokenizer/config retenidos siguen bajo Apache 2.0.
- Discrepancia de parametros: el nombre indica 27B, pero el inventario de safetensors declara 15.606.149.872. Es una diferencia sustancial que conviene aclarar antes de dimensionar el despliegue.
- Requiere un runtime especifico: el checkpoint esta pensado para vLLM con el runtime radiance y kernels MXFP4 W4A8 sobre gfx1201. En otras plataformas los kernels pueden no existir, y las numericas podrian no ser identicas a las de un kernel W4A4.
- Riesgo de degradacion por cuantizacion: el propio autor documenta que la primera build con AWQ era inservible (error relativo de capa ~324 en la capa 7). Aunque la build RTN se valida con correlacion 0.991 en logits, sigue siendo una cuantizacion W4 sin calibracion, por lo que puede degradar tareas sensibles a outliers.
- Faltan mediciones de calidad: no hay resultados publicados de GSM8K ni de otros benchmarks para este checkpoint. La unica evidencia es una prueba de humo de logits y unas pocas generaciones.
- Tareas de razonamiento largo: el ejemplo de servicio usa `--max-model-len 8192`; si el modelo soporta contextos mayores, no esta documentado aqui, y el razonamiento extenso puede verse truncado con esa configuracion.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni tasas de alucinacion en la informacion disponible.
- Idiomas y sesgos: no hay informacion sobre cobertura idiomatica ni evaluaciones de sesgo para este checkpoint ni para su base.
- El aviso del propio autor: la model card esta marcada como material de referencia, no como instrucciones operativas.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/ethantodd4l/Swift-1.5-Qwen3.8-27b-Quark-RTN-MXFP4
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Contenedor Quark de referencia de AMD: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Variante INT4 del base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-INT4
- Variante NVFP4 del base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-NVFP4
- Pagina de UkisAI sobre Swift 1.5: https://ukisai.com/swift-1-5-27b
- Anuncio de Swift (menos overthinking): https://ukisai.com/news/introducing-swift
- Ficha en Featherless: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
- Herramienta de evaluacion GSM8K usada por el autor: https://github.com/ewtodd/gsm8k-eval
