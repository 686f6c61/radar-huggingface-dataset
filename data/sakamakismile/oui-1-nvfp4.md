# sakamakismile/OUI-1-NVFP4

## Resumen

OUI-1-NVFP4 es una cuantizacion no oficial del modelo thesysdev/OUI-1, que a su vez es un fine-tune orientado a interfaces generativas del DiffusionGemma 26B-A4B-it de Google. El autor, el usuario sakamakismile, publica un checkpoint en formato NVFP4 (W4A4, group size 16) generado con llm-compressor 0.12, pensado para ejecutarse en dos GPU de 16 GB con tensor parallel 2, un requisito de hardware muy inferior al de las variantes en FP8 que se publicaron sobre A100. No esta afiliado ni respaldado por Thesys, Google ni NVIDIA.

El modelo pertenece a la familia de modelos de difusion para lenguaje, no a la de transformers autorregresivos puros: genera texto mediante un proceso de denoising iterativo sobre un lienzo (canvas) de 256 tokens y hasta 48 pasos, con una arquitectura MoE de aproximadamente 25.800 millones de parametros totales y unos 4.000 millones activos (designacion A4B). Esta especializado en producir interfaces de usuario en el lenguaje OpenUI, de ahi su relevancia: permite generar UI renderizable desde briefs en lenguaje natural con un coste de inferencia bajo.

La cuantizacion solo aplica 4 bits a los expertos MoE; la atencion del decoder, la MLP densa, el router, los embeddings, la torre de vision y el self-conditioning se mantienen en BF16. Segun la model card, versiones anteriores que tambien cuantizaban atencion y MLP densa producian salidas corruptas con tokens repetidos y fusionados, lo que se corrigio manteniendo esas capas en precision completa. En el Generative UI Benchmark obtiene 121/184 (65,8%) en completitud y 184/184 en renderizabilidad, frente a los 14/184 del checkpoint NVFP4 de NVIDIA, aunque con la advertencia de que la calibracion se hizo sobre los propios briefs del benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para lenguaje (diffusion-language-model) con backbone transformer MoE; base DiffusionGemma 26B-A4B-it |
| Parametros totales | 25.823.781.228 (aprox. 25,8 mil millones) |
| Parametros activos | Aprox. 4.000 millones (designacion A4B del modelo base) |
| Longitud de contexto | 16.384 tokens en la configuracion de servicio recomendada; maximo nativo no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, group size 16) sobre expertos MoE; atencion, MLP densa, router, embeddings/lm_head, torre de vision y self-conditioning en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico model.safetensors de 18,8 GB), esquema compressed-tensors |
| Modelo base | thesysdev/OUI-1, fine-tune de google/diffusiongemma-26B-A4B-it |
| Capas cuantizadas | Solo expertos MoE |
| Tamano del repositorio | 18,9 GB |
| Lienzo de difusion | canvas_length 256, max_denoising_steps 48 |
| Multimodalidad | Torre de vision conservada en BF16; el benchmark se ejecuta en modo solo texto |
| Biblioteca | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo de difusion para lenguaje con mezcla de expertos. DiffusionGemma reparte el calculo en expertos MoE con un `moe_intermediate_size` de 704, ademas de capas de atencion en el decoder (con atencion global en las capas 5, 11, 17, 23 y 29, que comparten K y V y por tanto carecen de peso `v_proj`), MLP densa, router, embeddings, lm_head y un modulo de self-conditioning. La generacion no es token a token: se resuelve por denoising iterativo sobre un lienzo de 256 tokens con un maximo de 48 pasos, de modo que el tiempo de inferencia escala con la longitud de la salida. El modelo base conserva una torre de vision, aunque en el benchmark de UI se sirve en modo solo texto.

Esta publicacion no entrena ni ajusta el modelo: es una cuantizacion post-entrenamiento. Se realizo con llm-compressor 0.12 mediante `QuantizationModifier(targets="Linear", scheme="NVFP4")`, en modo CPU-only (el pipeline secuencial no trazaba este modelo con una GPU conectada), con unas 4,5 horas de proceso. Los parametros de experto fusionados en 3D se reescribieron previamente como modulos `nn.Linear` por experto (`experts.N.{gate,up,down}_proj`, el layout que carga el FusedMoE de vLLM) para que `targets="Linear"` los alcanzase. La calibracion uso 184 muestras con longitud maxima de 8.192 tokens (el system prompt por si solo ocupa unos 5.200 tokens). Tras la cuantizacion hubo que anadir manualmente cinco entradas `model.decoder.layers.{5,11,17,23,29}.self_attn.v_proj` a `quantization_config.ignore`, porque compressed-tensors expande la lista de ignorados solo a los modulos existentes y vLLM fusiona q/k/v exigiendo un unico esquema; no se modifico ningun peso, ya que en esas capas V es K y K esta en BF16. El checkpoint hereda la plantilla de chat de OUI-1, que a diferencia de la de Google carece de tres lineas que cierran el canal de pensamiento vacio cuando `enable_thinking` esta desactivado.

## Capacidades

- Generacion de interfaces generativas en el lenguaje OpenUI (openui-lang), con salida renderizable en el 100% de las generaciones medidas (184/184).
- Generacion de texto y modo conversacional (pipeline text-generation, etiqueta conversational).
- Generacion por difusion: decodificacion iterativa sobre un lienzo de 256 tokens con hasta 48 pasos de denoising.
- Modo thinking conmutable via `enable_thinking`; la configuracion de servicio recomendada lo desactiva por defecto.
- Entrada multimodal en el modelo base (torre de vision conservada en BF16), aunque el benchmark se ejecuta con la modalidad de imagen y video limitada a cero.
- Capacidades de tool calling, function calling y uso de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades de audio: no disponible.

## Casos de uso

- Generacion automatica de interfaces en OpenUI: el modelo produce directamente markup en el lenguaje OpenUI a partir de un brief en lenguaje natural, con una tasa de renderizabilidad del 100% en el benchmark, lo que permite insertar la salida en un pipeline de render sin postprocesado manual.
- Prototipado rapido de UI: para equipos de producto que necesitan pasar de una descripcion textual a un componente o pantalla funcional, sin escribir el markup a mano.
- Asistentes conversacionales que devuelven UI: el modelo mantiene el modo conversacional y puede integrarse en un chat donde cada respuesta incluya un bloque de interfaz renderizable en lugar de texto plano.
- Despliegue en hardware de gama media: con 18,8 GB de pesos y un esquema de 4 bits solo en los expertos, el checkpoint cabe en dos GPU de 16 GB en tensor parallel 2, lo que permite servir generacion de UI sin acceso a A100 ni H100.
- Investigacion en cuantizacion NVFP4: sirve como referencia reproducible del impacto de W4A4 en un modelo de difusion MoE, con la receta exacta de capas excluidas y las herramientas usadas (llm-compressor, compressed-tensors).
- Generacion de paneles y dashboards: dado que la salida es OpenUI renderizable, es adecuado para producir vistas de datos estructuradas a partir de una descripcion funcional.
- Base para experimentos con modelos de difusion para lenguaje: el checkpoint permite estudiar el comportamiento del denoising con distintos valores de lienzo y pasos sobre hardware asequible, partiendo de un modelo ya ajustado a una tarea concreta.

## Benchmarks y rendimiento

Resultados en el Generative UI Benchmark (formato OpenUI, 46 briefs x 4 generaciones, thinking desactivado, puntuado con `score.ts` del propio benchmark):

| Modelo | Hardware | complete | renderable |
|---|---|---|---|
| OUI-1 FP8 (publicado por Thesys) | A100 | 132/184 (71,7%) | 184/184 |
| OUI-1-NVFP4 (este repositorio) | 2x 16 GB | 121/184 (65,8%) | 184/184 |
| DiffusionGemma NVFP4 (NVIDIA), mismas condiciones | 2x 16 GB | 14/184 (7,6%) | 183/184 |
| DiffusionGemma FP8 (publicado) | A100 | 24/184 (13,0%) | 183/184 |

Advertencia del autor: el conjunto de calibracion de esta cuantizacion son los propios 46 briefs del benchmark (con las salidas publicadas de OUI-1 para ellos), por lo que el 121/184 no es una cifra sobre un conjunto reservado. La calibracion solo fija rangos de activacion y no es entrenamiento, y la brecha base/fine-tune se mantiene sin calibracion (24 frente a 132 en FP8), pero el dato debe citarse con esta salvedad.

Rendimiento de servicio medido: las 184 generaciones tardaron 1.061 s con concurrencia 4 en 2x NVIDIA RTX PRO 2000 Blackwell (16 GB, sm_120) con vLLM 0.26.0, frente a 1.264 s del checkpoint base de NVIDIA en identicas condiciones. Esto equivale a unos 5,8 s por generacion y aproximadamente 0,17 generaciones por segundo con concurrencia 4; OUI-1 escribe alrededor de un 40% menos de texto que el modelo base.

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: disenado para 2 GPU de 16 GB (32 GB en total) con tensor parallel 2. Los pesos ocupan 18,8 GB, es decir unos 9,4 GB por GPU, mas cache KV. El autor recomienda fijar `--kv-cache-memory 698351616` en lugar de `--gpu-memory-utilization` porque el buffer de warmup del lienzo de 256 tokens no cabia en una tarjeta de 16 GB con el dimensionado codicioso del profiler.
- GPU verificadas: 2x NVIDIA RTX PRO 2000 Blackwell (16 GB, sm_120) con vLLM 0.26.0. No se han probado otras configuraciones en la informacion disponible.
- GPU consumer: cabe en dos tarjetas consumer de 16 GB (por ejemplo, dos RTX 4080/4090 de 16/24 GB) siempre que la arquitectura este soportada por los kernels NVFP4 de vLLM; no hay confirmacion de que se haya probado en esas tarjetas.
- Opciones de despliegue: vLLM 0.26 con `--tensor-parallel-size 2 --disable-custom-all-reduce --kernel-config '{"moe_backend": "MARLIN"}' --limit-mm-per-prompt '{"image":0,"video":0}' --max-model-len 16384 --max-num-seqs 4 --kv-cache-dtype fp8 --enforce-eager --diffusion-config '{"canvas_length":256,"max_denoising_steps":48}' --default-chat-template-kwargs '{"enable_thinking": false}'`. No se documentan rutas con llama.cpp, Ollama ni TGI para este esquema de cuantizacion.
- Kernel MoE: obligatorio MARLIN (o HUMMING). Los backends FP4 de la familia CUTLASS (FLASHINFER_CUTLASS y otros) no aceptan `moe_intermediate_size = 704` y la seleccion automatica de vLLM falla al arrancar.
- Limitacion de API: no enviar `temperature` ni `seed`; vLLM 0.26 los rechaza en modelos de difusion. En peticiones con streaming, el rechazo llega como evento de error dentro de una respuesta HTTP 200.
- Latencia y throughput: 1.061 s para 184 generaciones con concurrencia 4 en 2x RTX PRO 2000 Blackwell (unos 5,8 s por generacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Generative UI Bench (complete) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OUI-1-NVFP4 (este repositorio) | 25,8 mil millones totales, ~4B activos | 16.384 tokens en la config de servicio | 121/184 (65,8%) | Apache 2.0 | HuggingFace, cuantizacion no oficial |
| thesysdev/OUI-1 (FP8, publicado por Thesys) | mismo modelo base (26B-A4B) | no disponible | 132/184 (71,7%) | Apache 2.0 | HuggingFace; ejecutado en A100 |
| nvidia/diffusiongemma-26B-A4B-it-NVFP4 | mismo modelo base (26B-A4B) | no disponible | 14/184 (7,6%) | no disponible | HuggingFace |
| DiffusionGemma 26B-A4B-it FP8 (publicado) | mismo modelo base (26B-A4B) | no disponible | 24/184 (13,0%) | no disponible | HuggingFace; ejecutado en A100 |

La diferencia clave entre este checkpoint y el NVFP4 de NVIDIA no esta en el esquema de cuantizacion, sino en el fine-tune: OUI-1 esta ajustado a la tarea de generacion de UI, mientras que el checkpoint de NVIDIA parte del modelo base sin ese ajuste. Frente a la version FP8 de OUI-1, este repositorio pierde 11 puntos absolutos en completitud (132 a 121 sobre 184) a cambio de reducir el hardware necesario de una A100 a dos GPU de 16 GB.

## Limitaciones y advertencias

- Cifra de benchmark no reservada: la calibracion de escalas de activacion se hizo sobre los mismos 46 briefs del benchmark, por lo que el 121/184 no es un resultado sobre datos no vistos. El autor lo advierte explicitamente.
- Salidas corruptas si se cuantizan mas capas: recetas previas que aplicaban W4A4 a la atencion del decoder y a la MLP densa producian tokens repetidos y fusionados (por ejemplo, `Card Cardheaderheader`), con salidas de unos 334 bytes frente a los 1.800 habituales. La exclusion de esas capas es obligatoria, no opcional.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado.
- Plantilla de chat incompleta: la `chat_template.jinja` de OUI-1 carece de las tres lineas que cierran el canal de pensamiento vacio con `enable_thinking` desactivado; en vLLM 0.26 las respuestas pueden empezar con una linea `thought` literal si no se restaura la plantilla de Google.
- Compatibilidad de kernels: requiere MARLIN o HUMMING como backend MoE; los kernels FP4 CUTLASS no arrancan con `moe_intermediate_size = 704`.
- Restricciones de la API de vLLM 0.26: no acepta `temperature` ni `seed` para modelos de difusion, lo que limita el control de la aleatoriedad de la generacion; el checkpoint aplica su propio calendario de muestreo.
- Licencia: Apache 2.0, igual que OUI-1 y el modelo base, pero la model card anade que el uso esta tambien sujeto a condiciones adicionales (texto truncado en la informacion proporcionada). Conviene revisar los terminos del modelo base antes de un uso comercial.
- Multimodalidad no utilizable en la configuracion de referencia: la torre de vision se conserva en BF16, pero la receta de servicio probada limita imagen y video a cero, y no hay metricas de rendimiento multimodal.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad; el benchmark mide completitud y renderizabilidad del markup, no correccion factual ni adecuacion semantica al brief.
- Proyecto no oficial: cuantizacion de un tercero, sin afiliacion con Thesys, Google ni NVIDIA, con 0 descargas y 0 likes en el momento de la consulta, y sin garantia de mantenimiento.
- Sesgos: no disponible en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sakamakismile/OUI-1-NVFP4
- Modelo base (fine-tune de UI): https://huggingface.co/thesysdev/OUI-1
- Checkpoint NVFP4 de NVIDIA sobre el modelo base: https://huggingface.co/nvidia/diffusiongemma-26B-A4B-it-NVFP4
- Benchmark de UI generativa: https://github.com/thesysdev/generative-ui-bench
- Busqueda web: no se han encontrado resultados relevantes; las entradas devueltas no guardaban relacion con el modelo.
