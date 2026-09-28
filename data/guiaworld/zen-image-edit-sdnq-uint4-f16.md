# GuiAworld/zen-image-edit-SDNQ-uint4-f16

## Resumen

GuiAworld/zen-image-edit-SDNQ-uint4-f16 es una version cuantizada con SDNQ en uint4 (con computo fp16) de AiArtLab/zen-image-edit, un modelo de difusion para generacion y edicion de imagenes construido sobre Qwen-Image-2.1. El autor del repositorio es GuiAworld, que aplica su propia herramienta de cuantizacion SDNQ para reducir el peso del modelo: el repositorio ocupa 7,1 GB frente a los 14,5 GB fp16 que ocupa solo el DiT del modelo original, y declara 3.971.855.366 parametros en los metadatos de safetensors.

El modelo subyacente sustituye el codificador de texto nativo (Qwen3-VL-8B, 17,5 GB en fp16) por Qwen3.5-0.8B (1,7 GB) mas un adaptador de fusion de texto de 158M integrado dentro del DiT. Esa sustitucion busca reproducir la salida del codificador nativo con una huella de memoria mucho menor: el autor reporta una similitud coseno de 0,95 en texto y 0,97 en las posiciones de vision de los prompts de edicion contra el codificador nativo. El resultado es una carpeta diffusers autocontenida, con pipeline propio (ZenImageEditPipeline) y sin necesidad de cargar el encoder de 17,5 GB.

Es relevante ahora porque cubre tres tareas en un solo pipeline (texto a imagen, edicion con una o varias imagenes de referencia y generacion con transparencia RGBA) con un pico declarado de ~17,5 GB de VRAM en fp16, rebajado en esta variante por la cuantizacion uint4. Su principal freno es la licencia: se distribuye bajo qwen-research, lo que obliga a revisar con cuidado el uso comercial antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (transformer de difusion) de 32 capas single-stream de Qwen-Image-2.1, con adaptador de fusion de texto de 158M integrado |
| Parametros totales | 3.971.855.366 segun metadatos de safetensors del repositorio |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no es un modelo de lenguaje; el adaptador de fusion cubre 2.304 posiciones y fue ajustado a condiciones de ~2.000 tokens a 1.024 px. No se declara ventana de contexto de texto |
| Tipos de cuantizacion | SDNQ uint4 con f16 (nombre del repositorio); el Hub lo etiqueta ademas como 8-bit; el modelo base se distribuye en fp16, con VAE en fp32 |
| Idiomas soportados | no disponibles |
| Licencia | qwen-research (license: other), enlazada al LICENSE de AiArtLab/zen-image-edit |
| Formato de pesos | safetensors dentro de una carpeta diffusers (model_index.json y pipeline.py propios); no se publican GGUF ni ONNX |
| Pipeline | image-to-image (ZenImageEditPipeline); soporta tambien texto a imagen |
| Resolucion de salida | 1.024 px por defecto via `output_resolution`; sigue la relacion de aspecto de la imagen de condicion |
| Scheduler | FlowMatchEulerDiscreteScheduler con shift estatico 5.0 (dynamic shifting desactivado) |
| VAE | Qwen-Image-2.1, factor espacial 16x, en fp32 |
| Precision | fp16 en todo excepto el VAE |
| VRAM pico declarada (modelo base fp16) | ~17,5 GB residentes, menos con `enable_model_cpu_offload()` |
| Tamano del repositorio | 7,1 GB |
| Modelo base | Qwen/Qwen-Image-2.1 y Qwen/Qwen3.5-0.8B (sobre AiArtLab/zen-image-edit) |
| Fecha de publicacion | 27 de septiembre de 2026 (ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo original es un transformer de difusion (DiT) de 32 capas single-stream heredado de Qwen-Image-2.1, con un VAE de factor espacial 16x en fp32 y un scheduler FlowMatchEulerDiscreteScheduler configurado con un shift estatico de 5.0 en lugar del dynamic shifting original. La innovacion principal es la compresion del condicionamiento de texto: el encoder nativo Qwen3-VL-8B (17,5 GB en fp16) se reemplaza por Qwen3.5-0.8B re-guardado en fp16 (1,7 GB, con tokenizer y processor sin cambios) mas un adaptador de 158M que vive dentro del DiT como bloque de fusion de texto. El adaptador se entreno para reproducir la salida del encoder nativo tanto a partir de texto plano como de texto leido junto con las imagenes de referencia, alcanzando un coseno de 0,95 en texto y 0,97 en las posiciones de vision.

La revision incluida del adaptador es la v12: su tabla de posiciones de la rama de atencion cubre 2.304 slots y se ajusto a la geometria real de inferencia (~2.000 tokens de condicion a 1.024 px), de modo que las imagenes de referencia conservan sus posiciones en lugar de caer en una cola rellenada con ceros; segun el autor, eso movio el coseno de vision de 0,93 a 0,97. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. Sobre esta base, el repositorio que nos ocupa aplica cuantizacion SDNQ uint4 mediante la herramienta publicada por el propio autor en el Space GuiAworld/SDNQ, que permite descargar un modelo Qwen-Image, fusionar opcionalmente un adaptador LoRA Turbo y cuantizarlo.

## Capacidades

- Generacion de texto a imagen a 1.024 px (por ejemplo, la muestra del autor con 30 pasos y semilla fija).
- Edicion de imagen con una sola imagen de condicion: cambio de fondo manteniendo el sujeto.
- Edicion con dos imagenes: sustitucion de personaje, donde `<image1>` fija pose, ropa y escena y la identidad se copia de `<image2>`.
- Edicion con tres imagenes: objetivo y composicion de `<image1>`, persona de `<image2>`, color e iluminacion de `<image3>`.
- Generacion con transparencia (RGBA) en la misma pipeline.
- Referencia explicita a las imagenes de entrada mediante etiquetas `<image1>`, `<image2>`, etc. dentro del prompt.
- Control de la relacion de aspecto desde la imagen de condicion, con ancho y alto forzables de forma explicita.
- Ejecucion por lotes: el CLI `example.py` acepta un fichero de prompts (uno por linea, `#` como comentario) cargando la pipeline una sola vez.
- Modo de comparacion de scheduler (`--scheduler-test`) que renderiza cada prompt dos veces con la misma semilla, con el shift estatico y con el schedule dinamico original.
- Integracion con ComfyUI mediante el nodo estandar, que documenta la convencion de orden de las imagenes.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo de generacion y edicion de imagenes.
- No se declaran capacidades multilingues ni lista de idiomas en el Hub.

## Casos de uso

- Postproduccion audiovisual y publicidad: sustitucion de un actor o modelo por otro conservando pose, vestuario y escena a partir de dos imagenes, utiles para variantes de campana sin repetir rodaje.
- Catalogo de comercio electronico: generacion de imagenes de producto con fondo transparente en RGBA, listas para composicion sobre cualquier fondo de web o aplicacion.
- Retoque de escenas con control de iluminacion: usando tres imagenes de referencia se puede trasladar la paleta y la luz de una referencia a una escena existente, un flujo tipico de direccion de arte.
- Creacion de assets para interfaces y videojuegos: la salida con transparencia y la resolucion de 1.024 px encajan con sprites, iconos y elementos de UI que despues se escalan en el pipeline de arte.
- Generacion masiva de variaciones de prompt: el CLI con fichero de prompts permite producir lotes completos de imagenes con una sola carga del modelo, adecuado para pruebas A/B de creatividades.
- Flujos de trabajo en ComfyUI: al exponerse como carpeta diffusers con pipeline propio, se integra en grafos de nodos existentes para encadenar edicion, upscaling y composicion.
- Despliegue en hardware limitado: la cuantizacion uint4 reduce el peso a 7,1 GB de repositorio, lo que facilita servir el modelo en GPUs de 24 GB con offload de CPU en lugar de requerir el encoder nativo de 17,5 GB.
- Demostraciones e investigacion sobre compresion de condicionamiento: el par encoder pequeno + adaptador de 158M es un caso de estudio reproducible de destilacion de un encoder multimodal grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas internas de fidelidad del condicionamiento (coseno de 0,95 en texto y 0,97 en vision contra el encoder nativo Qwen3-VL-8B) y datos de uso (30 pasos de inferencia a 1.024 px), sin tablas tipo MMLU, GenEval, HumanEval o similares.

## Requisitos de hardware

- Tamano de pesos: el repositorio completo ocupa 7,1 GB, frente a los 14,5 GB fp16 del DiT original mas 1,7 GB del encoder de texto reducido.
- VRAM estimada: la model card del modelo base declara ~17,5 GB residentes en fp16 y recomienda `enable_model_cpu_offload()` porque el DiT de 14,5 GB y el decodificador VAE en fp32 no conviven en 32 GB. Para esta variante cuantizada no se publica una cifra de VRAM propia; como referencia orientativa, 7,1 GB de pesos mas el VAE en fp32 y las activaciones de una condicion de ~2.000 tokens.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) con offload de CPU; A100 40/80 GB o H100 para mantener todo residente en memoria sin offload.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con offload activado; no hay confirmacion publicada para tarjetas de 16 GB.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline="pipeline", trust_remote_code=True)` o clonando el repositorio y usando `ZenImageEditPipeline`; ComfyUI con el nodo estandar; CLI incluido (`example.py`) para una imagen o un fichero de prompts. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La unica referencia publicada es que las imagenes de ejemplo se generaron con 30 pasos a 1.024 px.
- La cuantizacion se genera con la herramienta del autor en el Space GuiAworld/SDNQ, que permite fusionar un LoRA Turbo opcional antes de cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Condicionamiento | Resolucion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| GuiAworld/zen-image-edit-SDNQ-uint4-f16 | 3.971.855.366 declarados en safetensors | Qwen3.5-0.8B (1,7 GB) + adaptador de 158M, 2.304 slots | 1.024 px por defecto | qwen-research | safetensors (diffusers) | Repositorio con 0 descargas y 0 likes |
| AiArtLab/zen-image-edit | no disponible en la informacion | Qwen3.5-0.8B (1,7 GB) + adaptador de 158M | 1.024 px por defecto | qwen-research | safetensors (diffusers) | Modelo de referencia del que deriva esta cuantizacion |
| Qwen/Qwen-Image-2.1 | ~7 B en el componente de generacion visual (32 capas DiT), segun listado de terceros en Civitai | Qwen3-VL-8B nativo (17,5 GB fp16) | no disponible | no disponible en la informacion recogida | safetensors | Modelo base de la familia Qwen-Image |
| Qwen-Image-Edit (implementaciones de terceros) | no disponible | Qwen-Image | no disponible | no disponible | safetensors | Repositorios de la comunidad; sin datos verificados en esta busqueda |

La comparativa cuantitativa de calidad entre estas variantes no puede establecerse: no hay benchmarks publicados para ninguna de ellas en la informacion disponible.

## Limitaciones y advertencias

- Licencia qwen-research (license: other) con enlace al LICENSE del repositorio base: hay que revisar el texto antes de cualquier uso comercial, ya que este tipo de licencias de investigacion suelen restringirlo.
- No hay resultados de benchmarks publicados, por lo que la calidad real de la cuantizacion uint4 frente al modelo fp16 no esta documentada.
- No se declara lista de idiomas soportados; la model card esta en ingles y las etiquetas de referencia de las imagenes son tokens del tipo `<image1>`, sin garantia de comportamiento optimo con prompts en otros idiomas.
- Riesgo de alucinacion y de ediciones no solicitadas: en tareas de sustitucion de personaje o de fondo, el modelo puede alterar zonas que el prompt pide conservar.
- Convencion critica de uso: la primera imagen es siempre el objetivo de la edicion y el resto son referencias. Colocar la referencia en primer lugar es, segun el autor, la causa habitual de que una sustitucion "no ocurra".
- El tamano del lienzo se toma de la relacion de aspecto de la ultima imagen; si se necesita fijarlo hay que pasar `height` y `width` de forma explicita.
- El adaptador de fusion cubre 2.304 posiciones de atencion y se ajusto a condiciones de ~2.000 tokens a 1.024 px; condiciones mucho mas largas o resoluciones muy distintas pueden degradar el condicionamiento de las imagenes de referencia.
- Los metadatos declaran 3.971.855.366 parametros, una cifra inferior a la esperable para un DiT de 14,5 GB en fp16 (~7,2 B); el repositorio no publica el desglose de pesos cuantizados y no cuantizados.
- Repositorio sin descargas ni likes y con licencia de investigacion: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- La cuantizacion SDNQ requiere el soporte correspondiente en el entorno de ejecucion; conviene validar que la version de diffusers y del backend de cuantizacion son compatibles antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GuiAworld/zen-image-edit-SDNQ-uint4-f16
- Modelo base sin cuantizar: https://huggingface.co/AiArtLab/zen-image-edit
- Licencia del modelo base: https://huggingface.co/AiArtLab/zen-image-edit/blob/main/LICENSE
- Modelo base de difusion: https://huggingface.co/Qwen/Qwen-Image-2.1
- Encoder de texto reducido: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Herramienta de cuantizacion SDNQ del autor: https://huggingface.co/spaces/GuiAworld/SDNQ
- Ficha de Qwen-Image-2.1 en Civitai: https://civitai.com/models/2953241/qwenimage21
- Implementacion de Qwen-Image-Edit en GitHub: https://github.com/MozDevApps/Qwen-Image-Edit
- Documentacion de Zen (OpenCode): https://opencode.ai/docs/zen/
