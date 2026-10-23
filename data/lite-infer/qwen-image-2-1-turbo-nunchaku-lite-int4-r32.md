# lite-infer/qwen-image-2.1-turbo-nunchaku-lite-int4-r32

## Resumen

`lite-infer/qwen-image-2.1-turbo-nunchaku-lite-int4-r32` es una version cuantizada del checkpoint de generacion y edicion de imagenes `Qwen/Qwen-Image-2.1-Turbo`, publicada por el usuario lite-infer. No es un modelo entrenado desde cero: es una conversion completa del pipeline de Diffusers en la que el transformer se serializa en INT4 mediante SVDQuant (rango 32, GPTQ, grupo de 64) y el codificador texto/vision `Qwen3VLForConditionalGeneration` se cuantiza a NF4 de BitsAndBytes, manteniendo el VAE Turbo original y el resto de tensores en su precision de origen.

El objetivo es hacer viable la inferencia del pipeline Turbo completo en una sola GPU sin offload a CPU, conservando el esquema de 8 pasos con CFG 1 que define al modelo base. Frente al BF16, el autor reporta un pico de 17,32 GiB de VRAM asignada por PyTorch y 14,01 s de latencia por imagen de 1024 x 1024 en una RTX PRO 6000 Blackwell, con una variante NVFP4 hermana que baja a 5,44 s.

Es relevante ahora porque el ecosistema de difusion esta migrando hacia kernels de cuantizacion especificos (SVDQuant/Nunchaku Lite, NVFP4) cargados dinamicamente desde el paquete `kernels` de Hugging Face, y este repositorio documenta tanto el procedimiento de conversion (`diffuse-compressor`) como una comparacion de fidelidad de seis casos de edicion. Conviene tener en cuenta que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion texto-a-imagen (`QwenImage21Pipeline`) con transformer cuantizado, codificador texto/vision `Qwen3VLForConditionalGeneration` y VAE Turbo |
| Parametros totales | 3.762.958.336 (~3,76 B), segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se publica ventana de tokens) |
| Tipos de cuantizacion | Transformer: INT4 SVDQuant, rango 32, GPTQ, group size 64 (224 objetivos SVDQ W4A4) + 1 tensor INT4 AWQ W4A16 (`modulation.1`); encoder texto/vision: BitsAndBytes NF4 con computo BF16 y sin doble cuantizacion; resto de tensores en precision original |
| Idiomas soportados | No disponible |
| Licencia | `other` con `license_name: qwen-research` (ver LICENSE del repositorio) |
| Formato de pesos | safetensors (pesos ya serializados en sus formatos cuantizados), libreria `diffusers` |
| Tamano del repositorio | 11,5 GB |
| Resolucion de referencia | 1024 x 1024 (soporta salidas mayores mediante VAE tiling) |
| Esquema de muestreo | 8 pasos, CFG 1, con `sample_sigmas` guardado y KV cache de prefijo |
| Modelo base | `Qwen/Qwen-Image-2.1-Turbo` (relacion: quantized) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: parte de `Qwen-Image-2.1-Turbo` y aplica un proceso de compresion con `diffuse-compressor`. La cadena es un pipeline de difusion completo en el que el transformer concentra la cuantizacion agresiva (INT4 con SVDQuant, que descompone los pesos en un componente de bajo rango mas un residuo cuantizado, mas GPTQ con grupo de 64), mientras que un unico tensor de modulacion (`modulation.1`) se trata aparte con INT4 AWQ W4A16. El codificador multimodal `Qwen3VLForConditionalGeneration`, que aporta tanto la comprension del prompt textual como la de la imagen de entrada en edicion, se cuantiza con NF4 de BitsAndBytes manteniendo el computo en BF16. El VAE Turbo se conserva intacto.

Los kernels nativos compatibles se descargan a traves del paquete `kernels` de Hugging Face, lo que exige activar `DIFFUSERS_TRUST_REMOTE_KERNELS=true` y disponer de una build de Diffusers que soporte `QwenImage21` y Nunchaku Lite. El autor declara compatibilidad probada con PyTorch 2.11.0 + CUDA 12.8, Transformers 5.19.0 y BitsAndBytes 0.50.2. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF/DPO, por lo que esos datos deben consultarse en la model card de Qwen.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts descriptivos, con muestreo en 8 pasos y CFG 1.
- Edicion de imagenes guiada por instrucciones en lenguaje natural: se pasa una imagen PIL en `image=` junto con el prompt de edicion.
- Conservacion de identidad y de elementos no editados: los ejemplos del autor piden explicitamente preservar rostro, maquillaje, joyas o fondo mientras se cambia el peinado.
- Soporte de entrada RGBA en el pipeline de edicion (`convert("RGBA")`).
- Control de resolucion de salida (`output_resolution`) y de dimensiones en generacion (`width`, `height`).
- VAE tiling configurable (`tile_sample_min_height/width`, `tile_sample_stride_height/width`) para generar o editar a resoluciones superiores a 1024 px con memoria limitada.
- KV cache de prefijo activable (`use_kv_cache=True`) y posibilidad de sobrescribir el schedule `sample_sigmas` en tiempo de llamada.
- Reproducibilidad mediante semilla explicita en `torch.Generator`.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni modos de razonamiento explicito, que no aplican a este tipo de modelo.

## Casos de uso

- Edicion de retratos en estudio: el pipeline permite cambiar peinado, ropa o iluminacion manteniendo el rostro y el fondo intactos, gracias a que el codificador Qwen3VL procesa conjuntamente la imagen de entrada y la instruccion; el autor valida tres casos de retrato con esta funcion.
- Fotografia de producto para e-commerce: se pueden sustituir fondos, reflejos o atrezzo manteniendo la integridad del producto; los tres casos de producto del repositorio sirven como referencia de fidelidad antes de desplegar.
- Generacion de material grafico a escala en un solo servidor: con 17,32 GiB de pico y 14,01 s por imagen de 1024 x 1024, un nodo unico puede producir del orden de unas 250 imagenes por hora en regimen sostenido, util para catalogos o creatividades.
- Iteracion de concept art y storyboards: el esquema de 8 pasos sin classifier-free guidance (CFG 1) reduce el coste por iteracion, lo que favorece ciclos de exploracion con muchas variantes por semilla.
- Prototipado local en GPU de consumo: el pico medido encaja en tarjetas de 24 GB, de modo que un equipo de desarrollo puede validar el pipeline antes de moverlo a infraestructura Blackwell; conviene verificar antes la disponibilidad de kernels para la arquitectura concreta.
- Aumento de datos sinteticos: generacion por lotes con semilla fija para producir variaciones controladas de una misma escena, con VAE tiling para resoluciones altas o relaciones de aspecto no cuadradas.
- Integracion en herramientas de diseno: al ser un pipeline `diffusers` estandar que se carga con `from_pretrained`, se puede exponer como servicio interno que reciba prompt e imagen y devuelva el resultado editado.

## Benchmarks y rendimiento

El autor solo publica mediciones de latencia y memoria, no metricas de calidad (FID, CLIP score, MMLU u otras). No se han publicado resultados de benchmarks de calidad en la informacion disponible.

| Pipeline | Latencia total | Pico de VRAM asignada por PyTorch |
|---|---:|---:|
| NVFP4 r32 + BNB4 (repo hermano) | 5,44 ± 0,10 s | 17,53 GiB |
| INT4 r32 + BNB4 (este repositorio) | 14,01 ± 0,07 s | 17,32 GiB |

Condiciones de medida: RTX PRO 6000 Blackwell Server Edition, todos los componentes residentes en GPU sin offload a CPU, 1024 x 1024, 8 pasos, CFG 1, KV cache de prefijo activada, semilla 42, un calentamiento y tres llamadas medidas; la latencia es la media mas la desviacion estandar de la muestra. El autor advierte que la GPU estaba compartida con un trabajo de entrenamiento ajeno, por lo que son tiempos observados y no un benchmark aislado. El prompt y las mediciones individuales estan en `evaluation/benchmark.json`.

En fidelidad, el repositorio incluye una comparacion cualitativa de seis casos de edicion (tres retratos y tres productos) con columnas BF16 Turbo, NVFP4 + BNB4 e INT4 + BNB4, usando la misma entrada, prompt, semilla, dimensiones, schedule de 8 pasos y configuracion de KV cache. No se aportan metricas numericas de similitud para esas comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,32 GiB de pico medido con todos los componentes en GPU (1024 x 1024, 8 pasos). El repositorio ocupa 11,5 GB en disco.
- GPU validadas: RTX PRO 6000 Blackwell Server Edition. La variante NVFP4 del repositorio hermano exige Blackwell o superior; la compatibilidad de los kernels INT4 SVDQuant con generaciones anteriores no se documenta.
- GPU de consumo: por memoria, 24 GB serian suficientes para el pico declarado, pero no hay validacion publicada en tarjetas consumer ni confirmacion de soporte de kernel en esas arquitecturas. Con VAE tiling y resoluciones menores el margen aumenta.
- Opciones de despliegue: `diffusers` con `QwenImage21Pipeline.from_pretrained`, el paquete `kernels` de Hugging Face para cargar los kernels nativos, BitsAndBytes 0.50.2, PyTorch 2.11.0 con CUDA 12.8 y Transformers 5.19.0; se requiere una build de Diffusers que soporte `QwenImage21` y Nunchaku Lite. No es compatible con llama.cpp, Ollama ni vLLM, al no ser un modelo de lenguaje.
- Latencia y throughput: 14,01 s por imagen de 1024 x 1024 en INT4; el autor no publica throughput agregado ni latencia con batching.
- Ajuste fino de memoria: VAE tiling con minimo de 1024 px y stride de 768 px deja el caso 1024 x 1024 sin teselar y permite subir resolucion sin multiplicar el pico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Latencia (1024x1024, 8 pasos) | VRAM pico | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Este modelo (INT4 SVDQuant r32 + BNB4) | 3,76 B | No disponible / 1024 px y superior con tiling | 14,01 s | 17,32 GiB | qwen-research | Publico en HF, 0 descargas |
| `lite-infer/qwen-image-2.1-turbo-nunchaku-lite-nvfp4-r32` | No disponible (mismo base) | No disponible / idem | 5,44 s | 17,53 GiB | qwen-research | Publico en HF, requiere Blackwell |
| `Qwen/Qwen-Image-2.1-Turbo` (BF16) | No disponible en la informacion | No disponible / idem | No disponible | No disponible (superior, sin cuantizar) | qwen-research | Publico en HF |

La comparacion se limita a las variantes del mismo checkpoint base, porque no se dispone de datos de otros modelos de generacion y edicion de imagenes en la informacion proporcionada. El modelo BF16 se usa como referencia de fidelidad en el repositorio, pero no se publican sus tiempos ni su consumo de memoria.

## Limitaciones y advertencias

- Licencia `qwen-research` (campo `license_name`): no es una licencia permisiva generica; antes de cualquier uso comercial hay que revisar el fichero LICENSE del repositorio y los terminos del modelo base.
- La cuantizacion INT4 introduce perdida de fidelidad respecto al BF16. El autor solo aporta evidencia cualitativa en seis casos de edicion, sin metricas objetivas de similitud.
- El repositorio registra 0 descargas y 0 likes: no hay validacion independiente, replicaciones ni reportes de terceros sobre su comportamiento.
- Las mediciones de latencia se tomaron en una GPU compartida con otro trabajo de entrenamiento, segun el propio autor, por lo que no deben tratarse como cifras de referencia estables.
- Requiere cargar kernels remotos activando `DIFFUSERS_TRUST_REMOTE_KERNELS=true`, lo que implica confiar en codigo descargado desde Hugging Face; conviene fijar versiones y revisar la procedencia en entornos de produccion.
- Dependencia de versiones muy concretas (PyTorch 2.11.0, CUDA 12.8, Transformers 5.19.0, BitsAndBytes 0.50.2 y una build de Diffusers no publicada en este repo): la reproducibilidad fuera de ese stack no esta garantizada.
- La compatibilidad de kernels con GPUs distintas de Blackwell no esta documentada; la variante NVFP4 directamente la excluye.
- No hay informacion sobre idiomas soportados en los prompts ni sobre sesgos demograficos del modelo base; al ser un modelo de imagen, persisten riesgos de sesgo en la representacion de personas y de generacion de contenido inapropiado.
- Riesgo de artefactos y de "alucinacion" visual: elementos inventados o alteraciones no solicitadas al editar, especialmente en zonas de la imagen con poco contexto.
- Las resoluciones superiores a 1024 px dependen de VAE tiling y pueden degradar la coherencia entre teselas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lite-infer/qwen-image-2.1-turbo-nunchaku-lite-int4-r32
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio hermano NVFP4: https://huggingface.co/lite-infer/qwen-image-2.1-turbo-nunchaku-lite-nvfp4-r32
- Herramienta de conversion: https://github.com/rootonchair/diffuse-compressor
- Blog de Qwen-Image-2.1 (casos de edicion de referencia): https://qwen.ai/blog?id=qwen-image-2.1
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos corresponden a aplicaciones moviles ajenas al contenido.
