# OzzyGT/fibo_2_0_edit_turbo_sdnq_dynamic_4bit

## Resumen

Fibo 2.0 Edit Turbo SDNQ Dynamic 4-bit es una versión cuantizada a 4 bits del modelo de edición de imágenes briaai/Fibo-2.0-edit-turbo, publicada por el usuario OzzyGT. Se trata de una conversión de pesos realizada con la técnica SDNQ (Self-Distilled Normalized Quantization), que reduce el peso en disco y el consumo de VRAM del modelo original manteniendo la mayor parte de su calidad visual. El modelo base lo desarrolla Bria AI y está especializado en edición de imágenes guiada por instrucciones en lenguaje natural, con soporte para hasta cuatro imágenes de referencia.

El pipeline es de tipo image-to-image y se distribuye en formato diffusers bajo la clase `BriaFibo2Pipeline`. Incluye un transformer de difusión cuantizado a 4 bits dinámicos y un codificador de texto Qwen3-VL-4B también cuantizado, mientras que el VAE permanece en bf16. El conjunto suma aproximadamente 4.320 millones de parámetros y ocupa 8,0 GB en el repositorio, con el transformer en 4,6 GB y el codificador de texto en 3,1 GB en disco.

La relevancia de esta ficha radica en que permite ejecutar un modelo de edición de imágenes de gama alta en hardware de consumo: el autor reporta un pico de 9,8 GiB de VRAM a resolución 864x1152 con todo el pipeline en GPU. Está pensado para flujos de edición few-step (4 pasos de inferencia, guidance 1.0) y utiliza prompts estructurados en JSON según la guía VGL de Bria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion image-to-image con transformer cuantizado y codificador de texto Qwen3-VL-4B |
| Parametros totales | 4.320.274.053 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits dinamicos (SDNQ); transformer y text encoder en INT4, VAE en bf16 |
| Idiomas soportados | en |
| Licencia | bria-fibo (enlaza a CC BY-NC 4.0) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del modelo base briaai/Fibo-2.0-edit-turbo, no un entrenamiento nuevo. La arquitectura subyacente es un pipeline de difusion para edicion de imagenes por instrucciones, con un transformer de difusion y un codificador de texto multimodal Qwen3-VL-4B. La conversion aplica SDNQ en modo dinamico a 4 bits tanto al transformer como al codificador de texto, mientras que el VAE se mantiene en bf16 para preservar la fidelidad de reconstruccion. El autor no detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

La innovacion tecnica destacable es la cuantizacion SDNQ dinamica, que permite reducir el peso del transformer a 4,6 GB y el del codificador de texto a 3,1 GB con una perdida visual limitada, segun la comparativa bf16 frente a INT4 incluida en la model card. El modelo base esta destilado para edicion en pocos pasos: la configuracion recomendada es `num_inference_steps=4` y `guidance_scale=1.0`. Requiere SDNQ v0.2.8 o superior y diffusers 0.42.0 o superior, e importar `sdnq` antes de cargar los pesos para que se registren las capas cuantizadas. Los prompts se interpretan como captions JSON estructurados siguiendo la guia VGL, y el pipeline incluye una carpeta `fonts` para renderizar texto en las entradas `text_render` de los captions.

## Capacidades

- Edicion de imagenes guiada por instrucciones en lenguaje natural, con prompts estructurados en formato JSON (VGL).
- Entrada de una imagen a editar o de hasta cuatro imagenes de referencia nombradas `<image_1>`, `<image_2>`, etc.
- Edicion enmascarada (masked edits) segun la model card del modelo original.
- Renderizado de texto dentro de la imagen mediante entradas `text_render` y fuentes incluidas en la carpeta `fonts`.
- Generacion few-step: 4 pasos de inferencia con guidance 1.0, adecuada para latencia baja.
- Comprension multimodal de las referencias a traves del codificador Qwen3-VL-4B.
- Soporte unicamente en ingles para los prompts.
- No se documentan capacidades de tool calling, agentes ni audio en la informacion disponible.

## Casos de uso

- Edicion fotografica asistida por instrucciones: el modelo recibe una foto y un caption JSON que describe el resultado deseado, y aplica cambios como vestir al sujeto, cambiar el fondo o ajustar la iluminacion, manteniendo la identidad del sujeto original.
- Composicion con multiples referencias: usando hasta cuatro imagenes de referencia, se pueden combinar elementos de varias fuentes en una sola escena, util para maquetas de producto o moodboards.
- Prototipado creativo en equipos pequenos: al caber en GPU de consumo con un pico de 9,8 GiB, permite iterar localmente sin depender de APIs de pago.
- Retoque con mascaras: la edicion enmascarada permite modificar solo una region de la imagen, lo que resulta practico para eliminar objetos o sustituir elementos sin alterar el resto del encuadre.
- Generacion de material promocional con texto: la funcion `text_render` y las fuentes incluidas permiten insertar rotulos o titulos en la imagen generada, util para banners y carteles.
- Integracion en pipelines de diseno automatizado: el formato diffusers y la clase `BriaFibo2Pipeline` permiten incorporar el modelo a scripts de procesamiento por lotes para editar catalogos de imagenes.
- Investigacion en cuantizacion de modelos de difusion: sirve como referencia para evaluar la perdida de calidad de SDNQ INT4 frente a bf16 en tareas de edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una comparativa visual cualitativa (imagen fuente, salida bf16 y salida INT4 con el mismo prompt y semilla) y datos de consumo: pico de 9,8 GiB de VRAM a 864x1152 con todo el pipeline en GPU, transformer de 4,6 GB y codificador de texto de 3,1 GB en disco.

## Requisitos de hardware

- VRAM estimada: pico de 9,8 GiB a 864x1152 con el pipeline completo en GPU, segun el autor.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; el consumo reportado entra en GPUs de consumo con 12 GB o mas de VRAM.
- Cabe en GPU de consumo: si, segun el dato de 9,8 GiB de pico reportado por el autor.
- Despliegue: diffusers 0.42.0 o superior con la clase `BriaFibo2Pipeline` y SDNQ v0.2.8 o superior, importando `sdnq` antes de cargar los pesos. No se documentan opciones para llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles; la configuracion de 4 pasos de inferencia sugiere una latencia baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OzzyGT/fibo_2_0_edit_turbo_sdnq_dynamic_4bit | 4.320.274.053 | no disponible | bria-fibo (CC BY-NC 4.0) | safetensors, diffusers | Cuantizacion INT4 SDNQ del modelo de Bria; 8,0 GB de repo |
| briaai/Fibo-2.0-edit-turbo | no disponible en la informacion | no disponible | bria-fibo | diffusers | Modelo base sin cuantizar; misma funcionalidad de edicion |
| briaai/Fibo-2.0-dev | no disponible en la informacion | no disponible | no disponible | diffusers | Variante de desarrollo citada en la model card como referencia de la guia VGL |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia bria-fibo con enlace a CC BY-NC 4.0: el uso comercial queda restringido salvo licencia adicional de Bria; conviene revisar los terminos exactos antes de desplegar en produccion.
- Solo soporta prompts en ingles; el rendimiento en otros idiomas no esta documentado.
- Es una cuantizacion a 4 bits: puede haber perdida de calidad frente al modelo bf16, aunque el autor muestra una comparativa visual favorable.
- Dependencia estricta de versiones: requiere SDNQ v0.2.8 o superior y diffusers 0.42.0 o superior; versiones anteriores pueden fallar al cargar los pesos.
- Riesgo de alucinacion visual y de artefactos en ediciones complejas, inherente a los modelos de difusion; no se documentan tasas concretas.
- Los prompts deben seguir el formato JSON de la guia VGL; prompts en texto libre pueden degradar el resultado.
- No se documentan sesgos especificos del modelo base en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzzyGT/fibo_2_0_edit_turbo_sdnq_dynamic_4bit
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Guia VGL del modelo base: https://huggingface.co/briaai/Fibo-2.0-dev/blob/main/vgl/README.md
- Repositorio SDNQ: https://github.com/Disty0/sdnq
- Repositorio bria-vgl: https://github.com/Bria-AI/vgl
- Licencia: https://creativecommons.org/licenses/by-nc/4.0/deed.en
- Imagen fuente del ejemplo (Unsplash): https://unsplash.com/photos/black-seal-lion-in-seashore-8jk64drEMcw
