# chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1

## Resumen

ChatR Labs Uncensored Omni LoRA v0.1 es un adaptador LoRA de rango 128 disenado para el modelo de generacion de imagenes Qwen-Image-2.1, desarrollado por el usuario chatrlabs. Su particularidad es que unifica en un unico adaptador dos flujos de trabajo habitualmente separados: generacion de imagenes a partir de texto (text-to-image) y edicion de imagenes existentes mediante instrucciones en lenguaje natural. El adaptador se carga sobre el modelo base original, que aporta el transformer, el text encoder, el procesador y el VAE.

El modelo forma parte de la familia Qwen-Image-2.1 de Alibaba y se distribuye como pesos LoRA en formato safetensors (BF16 y FP32), sin pesos del modelo base fusionados. La version v0.1 se entreno hasta el paso 32.000 y se acompana de un segundo adaptador auxiliar, el Turbo LoRA, que permite generar en 8 pasos sin CFG, unas 6-7 veces mas rapido que la configuracion estandar de 35 pasos con CFG 5.0.

La relevancia actual del modelo radica en su enfoque "uncensored" (sin los filtros de contenido habituales del modelo base) combinado con la eficiencia del Turbo LoRA, lo que lo hace atractivo para prototipado rapido y para aplicaciones creativas donde se requiere control fino sobre el contenido generado. El repositorio acumula mas de 60.000 descargas y 122 likes, lo que indica una adopcion notable en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Image-2.1 (modelo de difusion) |
| Parametros totales | no disponible (adaptador de rango 128; el modelo base no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | BF16 y FP32 en este repositorio; builds GGUF, FP8, INT8, NF4 y BF16 en el repositorio Quantized |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors (claves Diffusers/PEFT) |
| Rango del adaptador | 128 |
| Tamano del repositorio | 1,7 GB |
| Tamano de cada archivo LoRA | 671 MB |
| Resolucion de salida recomendada | ~1 megapixel (p. ej. 1024x1024) |
| Pasos de muestreo recomendados | 35 (estandar) u 8 (Turbo LoRA) |
| CFG recomendado | 5.0 (estandar) o 1.0 (Turbo LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 que se aplica sobre el transformer del modelo de difusion Qwen-Image-2.1. No se trata de un transformer autoregresivo ni de un modelo de lenguaje, sino de un adaptador para un pipeline de difusion text-to-image con capacidad de edicion. El repositorio contiene exclusivamente los pesos del adaptador; el transformer, el text encoder, el procesador y el VAE se descargan por separado desde el repositorio del modelo base `Qwen/Qwen-Image-2.1`.

El entrenamiento se realizo hasta el paso 32.000, segun se indica en la model card. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no disponible). La innovacion tecnica destacable es la inclusion de un segundo adaptador Turbo LoRA que reduce el numero de pasos de inferencia de 35 a 8 y elimina la necesidad de CFG (escala 1.0), manteniendo una calidad comparable y acelerando la generacion entre 6 y 7 veces. El adaptador v0.1 es un LoRA estandar y no debe confundirse con el Turbo LoRA, que se usa conjuntamente con el.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con resolucion de aproximadamente 1 megapixel.
- Edicion de imagenes existentes mediante instrucciones en lenguaje natural, aceptando de una a tres imagenes de referencia.
- Generacion de poses (tag `pose-generation`), orientada a la creacion de figuras humanas en posturas concretas.
- Generacion en pocos pasos (few-step) mediante el Turbo LoRA: 8 pasos sin CFG.
- Funcionamiento sin filtros de contenido (uncensored), lo que permite explorar tematicas que el modelo base rechazaria.
- Soporte de cache KV (`use_kv_cache=True`) para acelerar la inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o video.

## Casos de uso

- Prototipado rapido de conceptos visuales: con el Turbo LoRA se pueden generar variaciones en 8 pasos, lo que permite iterar sobre un concepto de diseno en segundos y explorar decenas de alternativas en una sola sesion.
- Edicion de imagenes de producto: se pasa una foto de referencia y una instruccion como "cambia la taza a verde, manten el resto igual"; el adaptador modifica solo el elemento indicado, lo que resulta util para catalogos de e-commerce.
- Generacion de poses para animacion o videojuegos: la capacidad de pose-generation permite crear referencias de personajes en posturas especificas que luego se usan como base para rigging o ilustracion.
- Creacion de contenido creativo sin restricciones: el caracter uncensored lo hace adecuado para proyectos artisticos o de investigacion que exploran tematicas que los filtros del modelo base bloquearian.
- Generacion de imagenes de referencia para pipelines de vision por computador: se pueden sintetizar datasets de imagenes con caracteristicas controladas (iluminacion, composicion, objetos) para entrenar o evaluar modelos de deteccion o segmentacion.
- Edicion iterativa con multiples referencias: el pipeline acepta hasta tres imagenes de referencia, lo que permite composiciones complejas, como combinar el estilo de una imagen con el sujeto de otra.
- Automatizacion de variaciones de marketing: integrado en un script con Diffusers, se pueden generar lotes de imagenes con semillas distintas para campanas publicitarias, ajustando prompts y manteniendo coherencia de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El adaptador LoRA ocupa 671 MB, pero el modelo base Qwen-Image-2.1 requiere VRAM adicional significativa; la model card recomienda `enable_model_cpu_offload()` para reducir la residencia en GPU, lo que sugiere que el pipeline completo no cabe comodamente en GPUs de gama media sin offload.
- GPU recomendadas: no se especifican modelos concretos. El despliegue de referencia usa PyTorch 2.11.0 con CUDA 12.8, lo que implica una GPU NVIDIA compatible con CUDA 12.8.
- Compatibilidad con GPU de consumo: no confirmada. El uso de CPU offload indica que es posible ejecutarlo en GPUs con VRAM limitada a costa de velocidad, pero no se detalla que modelos concretos (RTX 4090, 3090, etc.) funcionan sin offload.
- Opciones de despliegue: Diffusers con `QwenImage21Pipeline` y PEFT; el repositorio Quantized ofrece builds GGUF, FP8, INT8, NF4 y BF16 para otros entornos. Tambien hay un Playground web en chatrlabs.com.
- Latencia y throughput: el Turbo LoRA es entre 6 y 7 veces mas rapido que la configuracion estandar (35 pasos, CFG 5.0), pero no se proporcionan valores absolutos de latencia ni de imagenes por segundo.
- Nota de rendimiento: el VAE tiling debe mantenerse desactivado porque anade rayas verticales de color visibles en la decodificacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatR Labs Omni LoRA v0.1 | LoRA sobre Qwen-Image-2.1 | Rango 128 (671 MB) | no aplica | qwen-research | Hugging Face, Playground |
| Qwen-Image-2.1 (base) | Modelo de difusion text-to-image | no disponible | no aplica | qwen-research | Hugging Face |
| Qwen-Image-Edit-2511 | Modelo de edicion de imagenes | no disponible | no aplica | no disponible | Hugging Face |
| Qwen-Image-2512 | Modelo de generacion de imagenes | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La model card advierte que Qwen-Image, Qwen-Image-2512 y Qwen-Image-Edit-2511 tienen arquitecturas diferentes y no son bases compatibles con este adaptador.

## Limitaciones y advertencias

- El adaptador es experimental (v0.1) y su calidad puede no ser estable en todos los prompts.
- El caracter uncensored implica que el modelo puede generar contenido sensible, explicito o inapropiado; no es adecuado para entornos sin moderacion.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir elementos incoherentes, anatomia incorrecta o texto ilegible en las imagenes.
- La licencia qwen-research (license: other) puede restringir el uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegarlo en produccion.
- El adaptador solo es compatible con Qwen-Image-2.1; no funciona con Qwen-Image, Qwen-Image-2512 ni Qwen-Image-Edit-2511.
- El VAE tiling produce artefactos visuales (rayas verticales), por lo que debe evitarse.
- En el pipeline de Diffusers, un negative prompt vacio u omitido desactiva el true CFG aunque `true_cfg_scale` sea mayor que 1; se recomienda usar un espacio simple.
- El uso de multiples imagenes de referencia incrementa el consumo de memoria.
- No se especifican los idiomas soportados ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos.
- Se desconoce el numero de tokens de entrenamiento y si se aplicaron tecnicas de alineacion (RLHF/DPO).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de builds cuantizados: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Playground: https://chatrlabs.com/
- Descarga LoRA BF16: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/resolve/main/chatrlabs-omni-lora-v0.1-bf16.safetensors?download=true
- Descarga Turbo LoRA FP32: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/resolve/main/chatrlabs-omni-turbo-8step-fp32.safetensors?download=true
- Sumas de verificacion: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/blob/main/SHA256SUMS
