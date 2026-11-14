# coolthor/Sulphur-2-distilled-NVFP4

## Resumen

Sulphur-2-distilled-NVFP4 es una cuantizacion de pesos en formato NVFP4 (FP4 de 4 bits con escalas de bloque FP8 E4M3 y escalas globales FP32) del modelo de difusion distilled Sulphur 2, un transformer de difusion para generacion de video con audio sincronizado construido sobre la arquitectura Lightricks LTX-2.3. Lo publica el usuario coolthor en Hugging Face como un checkpoint de un solo fichero para ComfyUI, acompanado del VAE completo extraido y un workflow de API validado. El modelo base es SulphurAI/Sulphur-2-base, una variante sin censura del modelo LTX-2 de Lightricks.

El objetivo de esta publicacion es puramente de tamano: reducir el peso del checkpoint de aproximadamente 28 GB (version FP8) a unos 19 GB, un recorte de en torno al 32%, de modo que quepa comodamente en GPUs de 32 GB como la RTX 5090 dejando espacio para el VAE y el codificador de texto. Segun el autor, NVFP4 no aporta ninguna mejora de velocidad en difusion de video, que esta limitada por computo y no por ancho de banda, e incluso resulta un 6% mas lenta que FP8 en el hardware probado.

El modelo genera video y audio sincronizado en una sola pasada a partir de texto, con resolucion validada de 832x480 a 24 fps. La licencia es la LTX-2 Community License Agreement, heredada del modelo upstream, con restricciones que deben revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para video y audio, basado en Lightricks LTX-2.3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 weight-only (pesos empaquetados en FP4 de 4 bits, escalas de bloque FP8 E4M3, escalas globales FP32; normas, embeddings y capas sensibles en BF16) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License Agreement (5 de enero de 2026) |
| Formato de pesos | safetensors (checkpoint unico para ComfyUI) |

Otros datos tecnicos: el repositorio ocupa 21,0 GB; el checkpoint principal `sulphur_distil_nvfp4.safetensors` pesa aproximadamente 19 GB; el VAE completo `ltx_full_vae.safetensors` ocupa aproximadamente 1,45 GB. El codificador de texto es Gemma-3-12B (fichero `gemma_3_12B_it_fp4_mixed.safetensors`, no incluido en el repo). El perfil de dtypes de la cabecera del safetensors es: 1344 tensores U8 empaquetados en FP4, 1344 escalas de bloque F8_E4M3, 1344 escalas globales F32 y 4603 tensores BF16.

## Arquitectura y entrenamiento

El modelo es un transformer de difusion (DiT) para generacion conjunta de video y audio, derivado de la arquitectura LTX-2.3 de Lightricks. El pipeline procesa latentes de video y audio de forma concatenada (LTXVConcatAVLatent), muestrea y luego separa ambos flujos (LTXVSeparateAVLatent) para decodificar el video con el VAE y el audio con su decodificador correspondiente, produciendo un fichero con audio AAC sincronizado. La generacion de audio y video en una sola pasada es la innovacion principal frente a pipelines que generan audio en un segundo modelo.

La cuantizacion NVFP4 es weight-only: solo los pesos del DiT se empaquetan en FP4, manteniendo en BF16 las normas, los embeddings y un conjunto de capas sensibles. El modelo base es la variante distilled de Sulphur-2, disenada para funcionar con 8 pasos de muestreo y CFG 1.0, lo que reduce drasticamente el coste de inferencia frente a un modelo no destilado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con audio sincronizado en una sola pasada.
- Generacion de video a partir de imagen (image-to-video), segun las etiquetas del repositorio.
- Generacion conjunta de texto, audio y video (text-to-audio-video).
- Salida de video a 832x480 y 24 fps en la configuracion validada.
- Audio AAC sincronizado con el video generado.
- Modelo sin censura (uncensored), segun la model card del autor.
- Compatibilidad con ComfyUI mediante workflow de API.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no aplica a un modelo de difusion.

## Casos de uso

- Prototipado rapido de clips de video con audio para redes sociales: el modelo genera en torno a 18-19 segundos de computo por cada 3 segundos de clip a 832x480 y 8 pasos, lo que permite iterar sobre variaciones de prompt con una latencia aceptable en una estacion de trabajo con 32 GB de VRAM.
- Generacion de video con audio sincronizado en una sola pasada: al concatenar latentes de audio y video, se evita encadenar un modelo de video y otro de audio, lo que simplifica el pipeline y reduce el riesgo de desincronizacion.
- Despliegue en GPUs de consumo de 32 GB: el recorte de aproximadamente el 32% frente a FP8 permite ejecutar el modelo en una RTX 5090 junto con el VAE completo y el codificador de texto Gemma-3-12B, algo que la version FP8 no permite con holgura.
- Creacion de contenido para previsualizacion y storyboarding: la resolucion de 832x480 y los 8 pasos de muestreo son suficientes para validar composicion, movimiento y ritmo antes de producir con modelos de mayor calidad.
- Investigacion sobre cuantizacion de modelos de difusion de video: el checkpoint sirve como caso de estudio de NVFP4 weight-only en un DiT de video, con datos medidos de velocidad y calidad (varianza laplaciana de 205,79 con el VAE completo frente a aproximadamente 45 con el VAE tae).
- Integracion en flujos de ComfyUI existentes: el workflow de API incluido permite conectar el modelo a nodos de postprocesado, upscaling o composicion sin reescribir el pipeline.
- Generacion de video a partir de imagen para animar ilustraciones o fotografias: la etiqueta image-to-video indica soporte de esta modalidad, util para animar assets estaticos en produccion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento medidos que aporta el autor son de velocidad y calidad visual, no de benchmarks academicos:

| Metrica | Valor medido |
|---|---|
| Hardware de prueba | GB10 DGX Spark |
| Resolucion | 832x480 a 24 fps |
| Pasos de muestreo | 8 |
| Tiempo de computo por segundo de video | aproximadamente 6 s (en caliente) |
| Clip de 3 s | aproximadamente 18-19 s (FP8: 18,0 s; NVFP4: 19,1 s, aproximadamente 6% mas lento) |
| Primera generacion tras arranque en frio | aproximadamente 2 min (compilacion de kernels) |
| Varianza laplaciana (nitidez) con VAE completo | 205,79 |
| Varianza laplaciana con VAE tae | aproximadamente 45 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 19 GB; con el VAE completo (aproximadamente 1,45 GB) y el codificador de texto Gemma-3-12B, el conjunto encaja en una GPU de 32 GB.
- GPU recomendadas: RTX 5090 (32 GB) como opcion de consumo; el autor probo en GB10 DGX Spark y senala que para ir mas rapido hace falta mas computo, como una RTX 5090.
- Cabe en GPU de consumo: si, en GPUs de 32 GB como la RTX 5090. No se documenta su encaje en GPUs de 24 GB.
- Opciones de despliegue: ComfyUI con el workflow de API incluido. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de video).
- Flags obligatorios de ComfyUI: `--disable-async-offload --disable-dynamic-vram`; sin ellos el sampler falla con `'NoneType' object has no attribute 'wait_stream'` en `model_prefetch.py`.
- VAE obligatorio: debe usarse el `ltx_full_vae.safetensors` incluido mediante un nodo `VAELoader`; el VAE embebido en el checkpoint se desquantiza en CPU y se cuelga, y el VAE tae produce salida borrosa.
- Latencia y throughput: aproximadamente 6 s de computo por segundo de video a 832x480 y 8 pasos en GB10 DGX Spark; aproximadamente 2 min de compilacion de kernels en la primera generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sulphur-2-distilled-NVFP4 | no disponible | no disponible | aproximadamente 19 GB; aproximadamente 6 s de computo por segundo de video a 832x480 y 8 pasos en GB10 | LTX-2 Community License | Hugging Face, ComfyUI |
| Sulphur-2-distilled FP8 | no disponible | no disponible | aproximadamente 28 GB; 18,0 s por clip de 3 s en GB10 (aproximadamente 6% mas rapido que NVFP4) | LTX-2 Community License | Hugging Face |
| SulphurAI/Sulphur-2-base | no disponible | no disponible | no disponible | LTX-2 Community License | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con otros modelos de video de la misma categoria.

## Limitaciones y advertencias

- NVFP4 no aporta velocidad: en el hardware probado es aproximadamente un 6% mas lento que FP8, porque la difusion de video esta limitada por computo y no por ancho de banda. La ventaja es exclusivamente de tamano (aproximadamente 32% menos disco y VRAM).
- El VAE embebido en el checkpoint se cuelga al desquantizar en CPU; es obligatorio cargar el `ltx_full_vae.safetensors` independiente. El VAE tae produce salida visiblemente borrosa.
- ComfyUI debe lanzarse con `--disable-async-offload --disable-dynamic-vram` o el sampler falla.
- La primera generacion tras un arranque en frio tarda aproximadamente 2 minutos por compilacion de kernels.
- El modelo es una redistribucion modificada: los pesos han sido cuantizados a NVFP4 y el VAE extraido a un fichero independiente; no es identico al original.
- El modelo esta etiquetado como `not-for-all-audiences` y descrito como sin censura, lo que implica riesgo de generar contenido inapropiado y exige moderacion en produccion.
- Riesgo de alucinacion visual y artefactos propios de los modelos de difusion de video; no se documentan sesgos especificos en la informacion disponible.
- La licencia LTX-2 Community License Agreement impone restricciones que deben revisarse antes de uso comercial; no se detallan en la informacion proporcionada.
- El codificador de texto Gemma-3-12B no esta incluido en el repositorio y debe obtenerse por separado de la distribucion upstream de Sulphur 2 / LTX-2.
- No se documentan idiomas soportados ni longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolthor/Sulphur-2-distilled-NVFP4
- Modelo base: https://huggingface.co/SulphurAI/Sulphur-2-base
- Repositorio LTX-2 de Lightricks: https://github.com/Lightricks/LTX-2
- Licencia LTX-2 Community License Agreement: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- Articulo del autor con benchmarks y detalles: https://ai-muninn.com/en/blog/dgx-spark-sulphur-nvfp4-video
