# HelloSun/SD3.5-medium-OpenVINO-INT4

## Resumen

Hellosun/SD3.5-medium-OpenVINO-INT4 es una conversión comunitaria del modelo de generación de imágenes Stability AI Stable Diffusion 3.5 Medium, optimizada para inferencia en CPU y aceleradores Intel mediante el runtime OpenVINO. El modelo transforma el transformer MMDiT y el codificador de texto T5-XXL a precisión INT4 weight-only (group_size=128, asimétrico en falso), mientras que el resto de componentes se mantienen en INT8 por defecto. El resultado es una reducción de tamaño de 15,17 GB en FP16 a 4,76 GB en INT4, es decir, aproximadamente 3,19 veces menos, manteniendo la configuración de inferencia original (1024x1024, 40 pasos, guidance 4.5).

El modelo base Stable Diffusion 3.5 Medium es un generador texto-a-imagen de Stability AI con arquitectura MMDiT (Multimodal Diffusion Transformer) de 24 capas y aproximadamente 2.500 millones de parámetros en el transformer, complementado por tres codificadores de texto (CLIP, CLIP-G y T5-XXL) y un VAE. Es relevante ahora porque permite ejecutar un modelo de difusión de gama media-alta en hardware sin GPU dedicada, algo crítico para despliegues en edge, AI PCs y servidores CPU-only, donde tradicionalmente estos modelos eran inviables por consumo de memoria y latencia.

Esta ficha se centra en la variante cuantizada publicada por el autor Hellosun, que no introduce pesos nuevos ni reentrenamiento: es puramente un artefacto de despliegue derivado del modelo base sujeto a la licencia comunitaria de Stability AI. Cualquier uso comercial o redistribución debe respetar los términos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (Multimodal Diffusion Transformer), 24 capas, con tres codificadores de texto (CLIP, CLIP-G, T5-XXL) y VAE; pipeline StableDiffusion3Pipeline convertido a OpenVINO IR |
| Parametros totales | Transformer MMDiT ~2.500 millones; repo INT4 completo ~4,76 GB de pesos (transformer 1,51 GB + T5-XXL 2,38 GB + resto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el codificador T5-XXL admite hasta 512 tokens de texto y los codificadores CLIP 77 tokens |
| Tipos de cuantizacion | INT4 weight-only (bits=4, sym=False, group_size=128, group_size_fallback="adjust", ratio=1.0) en transformer y T5-XXL; INT8 por defecto en el resto; exportacion FP16 tambien disponible |
| Idiomas soportados | No disponible explicitamente; los ejemplos usan prompts en ingles con texto chino incrustado, y T5-XXL aporta cobertura multilingue |
| Licencia | Stability AI Community License (license: other); modelo base con acceso restringido (gated) |
| Formato de pesos | OpenVINO IR (model_index.json, openvino_config.json, carpetas transformer/, text_encoder/, text_encoder_2/, text_encoder_3/, vae_decoder/, vae_encoder/, scheduler/, tokenizer*) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Stable Diffusion 3.5 Medium: un transformer MMDiT de 24 capas que procesa de forma conjunta los tokens de texto y los latentes de imagen, con un flujo de difusión rectificado (rectified flow) y condicionamiento mediante tres codificadores de texto independientes. Segun la model card del autor, el pipeline base es un StableDiffusion3Pipeline con tres text encoders, donde el transformer (SD3Transformer2DModel) ronda los 2.500 millones de parametros y el text_encoder_3 es T5-XXL. La variante aqui documentada no entrena nada: aplica cuantizacion weight-only con NNCF sobre una exportacion FP16 generada con `optimum-cli export openvino`.

El proceso de conversion es explicito en el material del autor: se exporta primero a FP16 (`--weight-format fp16`) y despues se cuantiza mediante `OVQuantizer` y `OVPipelineQuantizationConfig`, aplicando INT4 simetrico desactivado (sym=False), con group_size=128 y `group_size_fallback="adjust"` al transformer y a T5-XXL, dejando el resto de submodelos en INT8. El conjunto de cuantizacion tarda 68,55 s en el hardware de referencia. Los tamanos resultantes son transformer 4,60 GB (FP16) a 1,51 GB (INT4) y T5-XXL 8,87 GB (FP16) a 2,38 GB (INT4). No se menciona ningun tipo de ajuste fino, RLHF, DPO ni modificacion de pesos mas alla de la cuantizacion.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024x1024 con calidad fotorrealista y estilos artisticos variados, incluyendo ilustracion, paisaje, retrato y escenas cinematograficas.
- Renderizado de texto legible dentro de la imagen, gracias al condicionamiento por T5-XXL (los ejemplos muestran carteles con "TAIPEI" y caracteres chinos "台北").
- Soporte de multiples estilos mediante prompting: los ejemplos cubren fotorrealismo, ilustracion dreamy, cyberpunk y tinta china minimalista.
- Composicion controlada por seed, pasos de inferencia y guidance scale (configuracion recomendada: 40 pasos y guidance 4.5).
- Ejecucion en CPU sin GPU, gracias al backend OpenVINO, con compilacion previa (`compile=True`) para acelerar la inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imagen.
- No dispone de modo thinking, vision de entrada, audio ni capacidades multimodales de salida.

## Casos de uso

- Generacion de ilustraciones en estaciones de trabajo sin GPU: el modelo corre sobre CPU Intel Xeon y cabe en unos 3,2 GB de RSS en pico, por lo que es adecuado para portatiles o servidores sin acelerador dedicado.
- Prototipado de assets para videojuegos o animacion: permite iterar conceptos de personajes o escenarios (por ejemplo, el Shiba Inu astronauta del ejemplo) a 512 o 1024 px antes de producir los assets finales en un modelo de mayor calidad.
- Creacion de material de marketing con texto incrustado: al soportar texto renderizado, sirve para generar carteles, banners o mockups con tipografia visible sin postproceso manual.
- Despliegue en AI PCs y dispositivos edge Intel: al ser OpenVINO IR, se integra con el runtime de Intel en equipos con CPU, iGPU o GPU Arc, reduciendo dependencia de CUDA.
- Previsualizacion rapida en pipelines de diseno: usando 28 pasos o 512x512 se obtiene una vista previa en menos tiempo antes de lanzar la generacion final a 1024x1024 y 40 pasos.
- Investigacion sobre cuantizacion de modelos de difusion: sirve como caso de estudio reproducible de INT4 weight-only con NNCF, comparando FP16 (15,17 GB) frente a INT4 (4,76 GB) en terminos de tamanos y tiempos.
- Generacion de imagenes por lotes en servidores CPU-only con presupuesto de VRAM limitado: el uso de memoria acotado permite mantener varias instancias o procesos en el mismo nodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, comparativas de fidelidad, etc.) en la informacion disponible. Los unicos datos de rendimiento aportados son mediciones de tiempo y memoria en CPU.

Hardware de referencia: Intel Xeon Platinum 8559C, 192 logicos / 96 fisicos, OpenVINO 2026.4.0. Carga y compilacion: 8,72 s. RSS final: 3276,2 MB.

| Nombre | Seed | Steps | Guidance | Tiempo total (s) | Tiempo por paso (s) | RSS pico (MB) |
|---|---|---|---|---|---|---|
| 01_hanfu | 42 | 40 | 4.5 | 228,41 | 5,71 | 3276,2 |
| 02_astronaut | 43 | 40 | 4.5 | 228,58 | 5,71 | 3276,2 |
| 03_taipei | 44 | 40 | 4.5 | 224,70 | 5,62 | 3276,2 |
| 04_shiba | 45 | 40 | 4.5 | 222,18 | 5,55 | 3276,2 |
| 05_ink | 46 | 40 | 4.5 | 226,27 | 5,66 | 3276,2 |

Datos adicionales de conversion: cuantizacion 68,55 s; tamanos FP16 transformer 4,60 GB / T5-XXL 8,87 GB (15,17 GB total) frente a INT4 transformer 1,51 GB / T5-XXL 2,38 GB (4,76 GB total, reduccion ~3,19x).

## Requisitos de hardware

- VRAM/RAM estimada: el conjunto INT4 de pesos ocupa 4,76 GB; el benchmark reporta un RSS pico de 3276,2 MB durante la inferencia en CPU, por lo que un sistema con 6-8 GB de memoria libre es suficiente en la practica.
- CPU: validado en Intel Xeon Platinum 8559C (192 hilos logicos). La inferencia es lenta: unos 5,6-5,7 s por paso, con ~225-228 s por imagen a 1024x1024 y 40 pasos.
- GPU: al ser OpenVINO, puede ejecutarse en iGPU Intel, GPU Arc e integraciones con GPUs compatibles con el runtime; en GPUs NVIDIA dedicadas (A100, H100, RTX 4090) existen otras variantes (diffusers/FP16 o FP8) que ofrecen mejor rendimiento.
- Cabe en GPU de consumo: si, como minimo en terminos de memoria, ya que 4,76 GB de pesos caben en GPUs de 8 GB o mas, aunque el formato esta optimizado para OpenVINO y no para CUDA.
- Opciones de despliegue: OVDiffusionPipeline de optimum-intel con OpenVINO (compile=True); el modelo base admite diffusers. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion de imagen).
- Latencia y throughput: ~5,6 s por paso y ~225-228 s por imagen de 1024x1024 a 40 pasos en el Xeon de referencia. El autor recomienda bajar a 28 pasos o a 512x512 para previsualizacion, advirtiendo que por debajo de ~28 pasos la calidad se degrada notablemente (no es un modelo destilado de pocos pasos).

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto / resolucion | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hellosun/SD3.5-medium-OpenVINO-INT4 | ~2.500 M (MMDiT) | 1024x1024, 40 pasos | INT4/INT8 | Stability AI Community (other) | HuggingFace, OpenVINO IR |
| stabilityai/stable-diffusion-3.5-medium (base) | ~2.500 M (MMDiT) | 1024x1024, 40 pasos | FP16/BF16 | Stability AI Community | HuggingFace, gated |
| stabilityai/stable-diffusion-3.5-large | ~8.000 M (MMDiT) | 1024x1024 | FP16/BF16 | Stability AI Community | HuggingFace, gated |
| FLUX.1 (Black Forest Labs) | ~12.000 M (transformer) | 1024x1024, destilado 4 pasos | FP16/FP8 | Apache-2.0 / no comercial segun variante | HuggingFace |

La comparativa se limita a caracteristicas verificables; no se dispone de datos de rendimiento comparativos de calidad entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion visual y de texto mal formado: como todo modelo de difusion, puede generar tipografia incorrecta o elementos incoherentes, especialmente con prompts complejos.
- Degradacion por pasos bajos: bajar de ~28 pasos reduce visiblemente la calidad; no es un modelo destilado de pocos pasos, por lo que no debe compararse con FLUX.2-klein-4B ni reutilizar sus parametros de inferencia.
- Latencia alta en CPU: ~225-228 s por imagen a 1024x1024 y 40 pasos lo hace poco adecuado para aplicaciones interactivas en tiempo real sin GPU.
- Sesgos: no se documentan sesgos especificos en la model card; al ser una conversion del modelo base, hereda los sesgos del dataset de entrenamiento original (no auditados aqui).
- Restricciones de licencia: el modelo esta bajo la Stability AI Community License, no Apache-2.0. Cualquier redistribucion o servicio debe cumplir los terminos originales; el modelo base esta gated y exige aceptar la licencia en el Hub antes de su uso.
- Idiomas: la model card no especifica el conjunto de idiomas soportados; el comportamiento multilingue depende de T5-XXL y no esta garantizado.
- Entorno fijado: requiere versiones concretas (diffusers 0.37.1, transformers 4.57.6, optimum-intel 2.2.0, openvino 2026.4.0, nncf 3.4.0); otras combinaciones pueden no ser compatibles.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria adicional; es un artefacto reciente y de autor unico.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/HelloSun/SD3.5-medium-OpenVINO-INT4
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Licencia del modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium/blob/main/LICENSE.md
- Documentacion de OpenVINO: https://docs.openvino.ai/
- Modelos OpenVINO en HuggingFace: https://huggingface.co/OpenVINO/models
- OpenVINO Model Hub (Intel): https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/model-hub.html
- Stable Diffusion 3 en el plugin de GIMP de OpenVINO (Intel): https://github.com/intel/openvino-ai-plugins-gimp/blob/main/Docs/stable-diffusion-v3.md
