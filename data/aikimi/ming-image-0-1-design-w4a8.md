# Aikimi/Ming-Image-0.1-Design-W4A8

## Resumen

Aikimi/Ming-Image-0.1-Design-W4A8 es una cuantización comunitaria del modelo de generación de imágenes inclusionAI/Ming-Image-0.1-Design, orientado a diseño gráfico y renderizado de texto sobre imagen. No es una versión oficial del autor original: se trata de un "diffusion transformer" (DiT) convertido a precisión W4A8 (pesos de 4 bits, activaciones de 8 bits) y empaquetado para su uso directo en ComfyUI y en Aikimi Forge Neo, de modo que el usuario no tenga que ejecutar el proceso de conversión.

El repositorio distribuye únicamente el DiT cuantizado (3,49 GB). El codificador de texto W4A8 (Ling-mini 2.0) y el VAE en BF16 deben descargarse del repositorio complementario Comfy-Org/Ming-Image. La licencia es MIT, heredada del modelo original, y el modelo está pensado para flujos de trabajo de imagen a texto con soporte de salida con canal alfa (RGBA) para composiciones con transparencia.

Su relevancia práctica está en la reducción de memoria: frente al DiT INT8 de 6,18 GB, esta variante ocupa 3,49 GB y baja el pico de VRAM en resoluciones de 1024×1024 (de 20,2 GiB a 17,9 GiB medidos en una RTX 3090), a costa de un aumento de latencia (aproximadamente un 15 % más lento en las pruebas del autor). Es, por tanto, una opción experimental de "bajo consumo de memoria" para equipos con GPU de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (asym_w4a8_int8), group size 16, ConvRot group size 256; existen tambien variantes INT8 y BF16 del modelo original |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

Notas adicionales: el repositorio contiene el DiT cuantizado (`diffusion_models/ming_image_0.1_design_w4a8_convrot_experimental.safetensors`), con un tamaño de 3.488.163.008 bytes (3,49 GB) y SHA-256 `66be75b57dfb464a905f7f1359a63303890e08ff8864d9fb8470e2513030d515`. El codificador de texto y el VAE no se incluyen en este repositorio. Fecha de publicacion en HuggingFace: 29 de septiembre de 2026.

## Arquitectura y entrenamiento

El modelo es un diffusion transformer (DiT) del proyecto Ming-Image-0.1-Design de inclusionAI. Esta ficha corresponde a una derivacion cuantizada, no a un entrenamiento nuevo: el autor no ha reentrenado ni ajustado el modelo, sino que ha convertido los pesos del DiT BF16 publicado por Comfy-Org (revision `53654871e47a5d2daed7b3a986cbf1010ef81c78`) a W4A8. El proceso no parte de la version INT8, sino directamente del BF16.

La conversion aplica cuantizacion asimetrica W4A8 sobre 202 capas lineales, con group size 16 y ConvRot group size 256, utilizando la herramienta `comfy-model-tools` (revision `d6797787e6bdb1a1fb0094d588a26f8e71a1c757`). Antes de cuantizar se aplica la fusion nativa Q/K/V segun el mapeo fijado de ComfyUI. Las capas no cuantizadas conservan su precision original. Los metadatos de atencion se mantienen para coincidir con el checkpoint INT8 distribuido, aunque el runtime probado los reporta como no utilizados en ambas variantes. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el uso de RLHF/DPO ni innovaciones de decodificacion, ya que la model card no los detalla.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) orientada a diseno grafico.
- Renderizado de texto integrado en la imagen (titulares y subtitulos legibles en las pruebas realizadas a 1024×1024).
- Salida con canal alfa (RGBA) para composiciones con transparencia; en las pruebas del autor funciono mejor a 2048×2048.
- Integracion nativa en ComfyUI mediante flujos de trabajo compatibles con Ming.
- Uso mediante Aikimi Forge Neo (v3.2.2 o superior) con seleccion de la variante W4A8.
- Soporte de configuracion de muestreo tipo Euler/simple con 12 pasos y CFG 1.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni vision de entrada.

## Casos de uso

- Generacion de carteles y posters con texto legible: el modelo rinde a 1024×1024 con Euler/simple, 12 pasos y CFG 1, y en las pruebas del autor los titulares y subtitulos se renderizaron de forma legible. Es adecuado para prototipado rapido de material grafico con tipografia integrada.
- Diseno de elementos graficos con transparencia: la salida RGBA permitio obtener alfa real en los casos de 2048×2048 probados, util para integrar hojas, logotipos o recortes en composiciones posteriores sin recorte manual.
- Despliegue en equipos con GPU de 24 GB: al ocupar 3,49 GB de pesos y bajar el pico a 17,9 GiB en 1024×1024, encaja en tarjetas como la RTX 3090 o la RTX 4090 sin recurrir al DiT INT8 de 6,18 GB.
- Iteracion rapida en ComfyUI para diseno: con tiempos de 8,5-8,7 s por poster en 1024×1024 (dos semillas, modelo caliente) el ciclo de prueba y error es viable en un flujo de trabajo interactivo.
- Automatizacion de variantes graficas en lote: la combinacion de baja huella de memoria y tiempos por debajo de 10 s a 1024 px permite generar multiples propuestas de diseno con la misma semilla y prompt en una sola sesion.
- Material a alta resolucion con transparencia: para piezas de 2048×2048 el coste medido fue de 57,8 s con un pico de 20,9 GiB, asumible en GPUs de 24 GB para produccion de baja cadencia.
- Flujos reproducibles y verificables: el repositorio incluye hashes SHA-256 del checkpoint y del BF16 de origen, y Aikimi Forge Neo descarga con revisiones fijadas, lo que facilita pipelines con control de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo GenEval, T2I-CompBench u otros) en la informacion disponible. La model card incluye unicamente una comparacion de rendimiento y memoria entre las variantes INT8 y W4A8, medida el 29 de septiembre de 2026 en una RTX 3090 de 24 GiB con 64 GB de RAM de sistema, mismos prompts y semillas, 12 pasos y CFG 1, con codificador de texto W4A8 y VAE BF16 en ambas columnas:

| Metrica | DiT INT8 | DiT W4A8 |
|---|---:|---:|
| Tamano del archivo DiT | 6,18 GB | 3,49 GB |
| Posters 1024×1024, modelo caliente, dos semillas | 7,4–7,6 s | 8,5–8,7 s |
| Pico de GPU muestreado en 1024 px | 20,2 GiB | 17,9 GiB |
| Hoja transparente 2048×2048, modelo caliente | 53,2 s | 57,8 s |
| Pico de GPU muestreado en 2048 px | 21,2 GiB | 20,9 GiB |

Advertencias del propio autor: los tiempos excluyen el arranque del runtime y las comprobaciones de integridad previas; las cifras de GPU estan muestreadas como maximos e incluyen otras aplicaciones, por lo que no son garantias de pico ni de VRAM minima. Se trata de unas pocas mediciones individuales, no de un benchmark amplio. Ademas, aunque ambas variantes de poster renderizaron titular y subtitulo de forma legible, el ejemplo W4A8 anadio texto pequeno no deseado en la esquina inferior derecha, y la composicion y el detalle fino pueden variar respecto a INT8.

## Requisitos de hardware

- VRAM estimada: en las pruebas del autor, pico muestreado de 17,9 GiB a 1024×1024 y 20,9 GiB a 2048×2048, con el codificador de texto y el VAE cargados (valores con otras aplicaciones en ejecucion; no son minimos garantizados).
- GPU recomendadas: RTX 3090 de 24 GiB es la plataforma de referencia medida. Por la huella observada, otras GPU de 24 GiB (por ejemplo RTX 4090) son candidatas razonables, aunque no se aportan mediciones especificas.
- Cabe en GPU de consumo: si, en tarjetas de 24 GiB segun las mediciones del autor. No hay datos publicados para GPU con menos VRAM.
- Opciones de despliegue: ComfyUI (probado con la version 0.37.0, commit `3b4c0b0e457cf0a51cf3038e0a6750d8f96ce251`, comfy-kitchen 0.2.35, PyTorch 2.11.0+cu130, Python 3.12.13, Windows / NVIDIA CUDA) y Aikimi Forge Neo v3.2.2 o superior (via `tools/setup_ming_image.py --precision w4a8`). No se documentan opciones tipo vLLM, llama.cpp ni TGI, no aplicables a este tipo de modelo.
- Latencia y throughput: 8,5–8,7 s por poster de 1024×1024 (dos semillas, modelo caliente) y 57,8 s por imagen de 2048×2048 con transparencia. No se publica throughput en imagenes por segundo ni latencia en configuracion de lote.
- Almacenamiento: 3,49 GB solo para el DiT, mas el codificador de texto y el VAE del repositorio complementario.
- Configuracion recomendada de muestreo: 1024×1024, Euler/simple, 12 pasos, CFG 1; para salida transparente el autor indica que el caso de 2048×2048 funciono mejor.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de terceros en la informacion proporcionada. La comparacion posible es entre las variantes de la misma familia Ming-Image-0.1-Design:

| Modelo | Precision | Tamano DiT | Pico 1024 px | Tiempo 1024 px | Licencia |
|---|---|---:|---:|---:|---|
| Aikimi/Ming-Image-0.1-Design-W4A8 | W4A8 | 3,49 GB | 17,9 GiB | 8,5–8,7 s | MIT |
| Variante INT8 de Ming-Image-0.1-Design | INT8 | 6,18 GB | 20,2 GiB | 7,4–7,6 s | MIT |
| inclusionAI/Ming-Image-0.1-Design (BF16 de origen) | BF16 | no disponible (el autor no publica el tamano del BF16 usado como fuente) | no disponible | no disponible | MIT |

## Limitaciones y advertencias

- Es una cuantizacion experimental de la comunidad, no una version oficial de inclusionAI. No hay garantia de que iguale la calidad del INT8 ni del BF16 de origen.
- Cuantizacion W4A8: el autor advierte que la composicion y el detalle fino pueden cambiar respecto a INT8, y que no hay garantia de un lettering preciso. En su ejemplo de poster, la salida W4A8 anadio texto pequeno no deseado en la esquina inferior derecha.
- Riesgo de degradacion en texto e infografia: el renderizado de caracteres es un punto debil declarado ("no guarantee of accurate lettering").
- La transparencia depende del prompt y de la resolucion; en las pruebas funciono mejor a 2048×2048.
- Solo se distribuye el DiT; sin el codificador de texto W4A8 y el VAE BF16 del repositorio complementario el modelo no es utilizable.
- Las cifras de memoria y latencia son mediciones individuales en una RTX 3090, no minimos de VRAM ni picos garantizados. Los tiempos excluyen arranque e integridad.
- El pico de memoria a 2K apenas cambia respecto a INT8, por lo que la ventaja de esta variante se concentra en resoluciones de 1024 px.
- No hay informacion publicada sobre sesgos, idiomas soportados ni composicion del dataset de entrenamiento del modelo original en la documentacion disponible.
- Licencia MIT: permite uso comercial, pero se debe conservar el aviso de copyright y la licencia original de inclusionAI incluidos en el fichero LICENSE del repositorio. Es recomendable verificar los terminos del modelo base antes de un uso comercial.
- Los metadatos de atencion presentes en el checkpoint no implican que se haya ejecutado un kernel INT8 de atencion; el runtime probado los reporta como no utilizados.
- Fecha de creacion y actualizacion del repositorio: 29 de septiembre de 2026, con 0 descargas y 0 "likes" en el momento de la consulta, lo que indica una adopcion todavia muy limitada y poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aikimi/Ming-Image-0.1-Design-W4A8
- Modelo base: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design
- Repositorio complementario (codificador de texto W4A8 y VAE BF16): https://huggingface.co/Comfy-Org/Ming-Image/tree/53654871e47a5d2daed7b3a986cbf1010ef81c78
- Herramienta de conversion: https://github.com/Comfy-Org/comfy-model-tools/blob/d6797787e6bdb1a1fb0094d588a26f8e71a1c757/quant_int8_convrot.py
- Script de reproduccion de la cuantizacion: https://github.com/AiWithYou/aikimi-forge-neo/blob/3467b7832fd2c9eb9c2e9d1d4d8199fadff6aaad/tools/quantize_ming_image.py
- Aikimi Forge Neo: https://github.com/AiWithYou/aikimi-forge-neo
- Registro completo del experimento y condiciones de medida: https://github.com/AiWithYou/aikimi-forge-neo/blob/3467b7832fd2c9eb9c2e9d1d4d8199fadff6aaad/docs/assets/ming-image-w4a8/README.md
