# DenRakEiw/FLUX3-Image-Klein-Native-RGBA-Transparent-LoRA

## Resumen

FLUX3-Image-Klein-Native-RGBA-Transparent-LoRA es un adaptador LoRA de rango 32 desarrollado por DenRakEiw que habilita la generacion nativa de imagenes con canal alfa (RGBA, 32 bits) sobre el modelo de difusion FLUX 3 Image Klein de Black Forest Labs. El objetivo es eliminar el paso posterior de segmentacion y recorte (rembg, BiRefNet) que habitualmente se necesita para obtener siluetas con fondo transparente: el LoRA desplaza al modelo base hacia el espacio latente de 4 canales del VAE AlphaVAE (`AutoencoderKLFlux2`), de modo que la propia difusion sintetiza la silueta alfa durante el muestreo.

El modelo base FLUX 3 Image Klein tiene 5,6 mil millones de parametros, 3072 dimensiones ocultas, 5 bloques multimodales tempranos y 28 bloques conjuntos de flujo unico, y utiliza Qwen3-VL-4B-Instruct como codificador de texto. El LoRA entrena 203 capas lineales (62.922.752 parametros entrenables) sobre un dataset de 800 capas RGBA multistilo del conjunto PrismLayersPro, con funciones de perdida especificas para sensibilidad al canal alfa, bordes y gradientes espaciales.

Es relevante porque aborda un cuello de botella concreto en pipelines de generacion de imagenes para produccion (assets de videojuegos, catalogo de producto, composicion grafica): obtener transparencia real sin postproceso reduce latencia, coste y artefactos de recorte. Se distribuye con licencia Apache-2.0 e incluye el VAE de 4 canales, un workflow de ComfyUI y nodos personalizados para decodificar el canal alfa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 32) sobre transformer de difusion FLUX 3 Image Klein (5 bloques multimodales + 28 bloques single-stream) |
| Parametros totales | 62.922.752 parametros entrenables en el LoRA; modelo base de 5,6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; acepta prompt y hasta 10 imagenes de referencia segun el modelo base) |
| Tipos de cuantizacion | compatible con el modelo base en bf16 e int8-convrot; el LoRA se distribuye en safetensors (precision no especificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`flux3_klein_transparent_lora.safetensors`, 240 MB) + VAE safetensors (`flux2_3_rgba_vae.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre FLUX 3 Image Klein, un transformer de difusion con 5 bloques multimodales tempranos y 28 bloques conjuntos de flujo unico, dimension oculta de 3072 y codificador de texto Qwen3-VL-4B-Instruct (`f3_qwen3vl_4b.safetensors`, `CLIPType.FLUX3`). El adaptador tiene rango 32 y alpha 32, y cubre 203 capas lineales: `emb_in.image` (128 -> 3072), `content_mode_blocks.image.0..4`, `single_blocks.0..27` y `final_layer.image.linear` (3072 -> 128). El objetivo del entrenamiento es el espacio latente empaquetado de 128 canales del VAE `AutoencoderKLFlux2` de 4 canales, con codificacion RGBA premultiplicada (`rgb * alpha`, fondo transparente como `[0, 0, 0, 0]`).

El dataset consta de 800 capas RGBA multistilo de PrismLayersPro con categorias 3D, toy, anime, cartoon, watercolor_painting y steampunk. La perdida combina tres terminos: ponderacion de sensibilidad al alfa en los 128 canales latentes (3,0x, mediante jacobiano por diferencias finitas para priorizar los canales que controlan el cuarto canal del decodificador), flow-matching ponderado por bordes (3,0x) y perdida de nitidez de gradiente espacial (0,25x) para preservar bordes sin halos oscuros. El VAE de 4 canales fue adaptado por Xavier Jara (proyecto `trmz/flux2-klein-alpha`).

## Capacidades

- Generacion text-to-image con canal alfa nativo: produce PNG RGBA de 32 bits con alfa de fondo `0.000` y transiciones semitransparentes suaves.
- Siluetas limpias y recortes nitidos sin postproceso de segmentacion.
- Soporte de objetos con transparencia parcial (telas translucidas, cristal, humo, bordes suaves).
- Funciona tanto con el modelo base destilado/cuantizado (8 pasos, CFG 1.0) como con el base sin destilar (20-25 pasos, CFG 3.5-4.0).
- Integracion en ComfyUI mediante nodos personalizados (DenRakEiw_Nodes) para cargar, codificar y decodificar el VAE RGBA y guardar PNG de 32 bits.
- Palabras de activacion: `RGBA transparent background, isolated foreground object` o `transparent background`.
- Capacidades del modelo base (no especificas del LoRA): edicion de imagen por instruccion, generacion desde texto, composicion con hasta 10 imagenes de referencia y guiado de composicion mediante cajas delimitadoras.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision: heredada del modelo base (entrada de imagenes de referencia); audio: no disponible.

## Casos de uso

- Assets para videojuegos 2D: generacion de sprites y elementos de interfaz con alfa nativo directamente en el pipeline de ComfyUI, evitando el recorte manual y manteniendo bordes limpios en motores como Unity o Godot.
- Catalogo de producto y e-commerce: generar imagenes de producto aisladas sobre fondo transparente para composicion posterior sobre plantillas de tienda, reduciendo el coste de estudio fotografico.
- Composicion grafica y diseno editorial: producir capas RGBA que se apilan directamente en Photoshop, Figma o After Effects sin pasos intermedios de enmascarado.
- Thumbnails y overlays para streaming o video: generar personajes y objetos con transparencia para superponerlos en escenas en directo.
- Prototipado de stickers y packs de mensajeria: siluetas limpias con transiciones semitransparentes para stickers de Telegram, WhatsApp o Discord.
- Generacion de capas para animacion: obtener personajes aislados con alfa para rigging o animacion por capas en herramientas 2D.
- Flujos de edicion con referencias: combinado con las capacidades del modelo base, permite editar objetos manteniendo transparencia en composiciones con varias referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA ocupa 240 MB; el repositorio completo, 0,5 GB.
- El modelo base FLUX 3 Image Klein tiene 5,6B parametros: en bf16 requiere aproximadamente 11-12 GB solo para pesos, mas el VAE y el codificador de texto Qwen3-VL-4B; en la practica se recomienda GPU con 24 GB o mas para el pipeline completo en bf16.
- Variante int8-convrot del modelo base: reduce el peso de pesos a la mitad aproximadamente, permitiendo despliegue en GPUs de 16-24 GB.
- GPUs recomendadas: A100, H100, L40S para produccion; RTX 4090 (24 GB) para uso local en bf16 o int8; RTX 3090/4080 (16-24 GB) viable con cuantizacion.
- Cabe en GPU consumer de gama alta (RTX 4090, 3090) con el modelo destilado de 8 pasos; en GPUs de 12-16 GB es necesario cuantizar.
- Opciones de despliegue: ComfyUI (libreria oficial del repo, con los nodos DenRakEiw_Nodes), con soporte de llama.cpp, vLLM, Ollama o TGI no documentado para este modelo de difusion.
- Latencia y throughput: no disponibles; el modelo destilado permite 8 pasos con CFG 1.0, lo que reduce el coste de inferencia frente a los 20-25 pasos del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / referencias | Transparencia nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX3-Image-Klein-Native-RGBA-Transparent-LoRA (este) | LoRA 62,9M sobre base 5,6B | hasta 10 referencias (base) | Si, RGBA nativo | Apache-2.0 | Hugging Face, ComfyUI |
| FLUX 3 Image Klein (base) | 5,6B | hasta 10 referencias | No (RGB de 3 canales) | no disponible en la informacion | Hugging Face (black-forest-labs, Runware) |
| LayerDiffuse (referencia del ecosistema) | no disponible | no disponible | Si, via difusion de capas | no disponible | no disponible en la informacion |

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni evidencia de robustez fuera del dataset de entrenamiento.
- El dataset de entrenamiento es de 800 capas RGBA en seis estilos (3D, toy, anime, cartoon, watercolor_painting, steampunk); es previsible un rendimiento inferior en estilos no representados.
- Requiere nodos personalizados de terceros (DenRakEiw_Nodes) porque los nodos VAE estandar de ComfyUI solo decodifican 3 canales; esto anade dependencia de mantenimiento externo.
- El VAE RGBA (`AutoencoderKLFlux2`) es una adaptacion de terceros (Xavier Jara), no el VAE oficial del modelo base; puede introducir diferencias de color o artefactos respecto al pipeline estandar.
- Riesgo de alucinacion y de siluetas inconsistentes en objetos complejos, pelo fino, transparencias multiples o escenas con varios sujetos.
- No hay informacion sobre sesgos, idiomas soportados ni evaluacion de calidad del canal alfa.
- Licencia Apache-2.0 permite uso comercial, pero las condiciones del modelo base FLUX 3 Image Klein deben verificarse por separado (no disponibles en la informacion).
- El rendimiento depende del modelo base elegido (destilado de 8 pasos frente a base de 20-25 pasos) y de los ajustes de CFG y sampler indicados por el autor.

## Enlaces

- Hugging Face del LoRA: https://huggingface.co/DenRakEiw/FLUX3-Image-Klein-Native-RGBA-Transparent-LoRA
- Repositorio de nodos ComfyUI: https://github.com/DenRakEiw/DenRakEiw_Nodes
- Modelo base FLUX 3 Image Klein (Black Forest Labs): https://huggingface.co/black-forest-labs/flux-3-image-klein
- Modelo base FLUX 3 Image Klein (Runware): https://huggingface.co/Runware/flux-3-image-klein
- Dataset PrismLayersPro: https://huggingface.co/datasets/artplus/PrismLayersPro
- Paper del VAE RGBA (Teaching a FLUX.2 VAE to See Transparency): https://tr-mz.github.io/papers/flux2-klein-alpha
- Referencia arXiv citada en los tags: arxiv:2507.09308
