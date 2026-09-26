# ausboss/Qwen-Image-2.1-Outpaint-LoRA

## Resumen

Qwen-Image-2.1-Outpaint-LoRA es un adaptador LoRA desarrollado por ausboss (AusBoss) que se monta sobre el modelo de difusion Qwen/Qwen-Image-2.1 para anadir outpainting y uncrop. No es un modelo autonomo: es un adaptador de bajo rango (rank 32, alpha 32, 384 tensores) que se aplica sobre los pesos del transformer de difusion de Qwen-Image-2.1 con el fin de extender una imagen en cualquier direccion. El mecanismo es simple y efectivo: se rellena con gris plano `#808080` el lienzo alrededor de la imagen original, se entrega ese lienzo como referencia al modelo y el LoRA sustituye el gris por una continuacion coherente de la escena, manteniendo la imagen original en su sitio.

El problema que resuelve es concreto: el modelo base Qwen-Image-2.1, sin el LoRA, tiende a reencuadrar, reescalar o recomponer la imagen cuando se le pide rellenar un lienzo mayor, y en muchos casos devuelve el marco gris sin tocar. El LoRA corrige ese comportamiento y hace que la zona conocida quede registrada a nivel de pixel, lo que permite un cosido (stitch) limpio en el flujo de ComfyUI. Segun las metricas del propio autor sobre 12 imagenes no vistas en entrenamiento, el gris sin rellenar pasa del 9,1 % (base) al 0,9 % (LoRA paso 1500) y el PSNR de la zona conservada sube de 23,6 dB a 33,5 dB.

La relevancia practica esta en que cubre una tarea (outpainting controlado con preservacion exacta de la imagen de entrada) con un adaptador pequeno: el repositorio ocupa 0,5 GB, emplea el formato de claves de ComfyUI y esta pensado para integrarse en un flujo ya existente de Qwen Image 2.1. La licencia es la Qwen Research License del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusion de Qwen/Qwen-Image-2.1 |
| Parametros totales | no disponible (adaptador de rank 32, alpha 32, 384 tensores) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | base de entrenamiento en INT8 (Comfy-Org INT8 convrot); el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible (modelo de imagen; las instrucciones de texto del autor estan en ingles) |
| Licencia | qwen-research-license (license: other) |
| Formato de pesos | safetensors (LoRA en formato de claves de ComfyUI: `diffusion_model.transformer_blocks.*`) |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Pipeline | image-to-image |
| Rank / alpha | 32 / 32 |
| Tamano del repositorio | 0,5 GB |
| Version recomendada | `qwen-image-2.1-outpaint.safetensors` (paso 1500) |

## Arquitectura y entrenamiento

El adaptador es un LoRA convencional de rank 32 y alpha 32 que se inyecta en los bloques del transformer de difusion de Qwen-Image-2.1. Los pesos se almacenan con el esquema de nombres de ComfyUI (`diffusion_model.transformer_blocks.*`) y sus 384 tensores cargan sobre los pesos oficiales de Comfy-Org para Qwen Image 2.1. El entrenamiento se realizo con ostris/ai-toolkit, con `arch: qwen_image_2`, partiendo de los pesos INT8 convrot de Comfy-Org (los mismos que ejecuta ComfyUI), y cacheando las incrustaciones del codificador de texto junto con la imagen de referencia.

El conjunto de entrenamiento consta de 924 pares generados a partir de 231 imagenes, con 4 disposiciones de lienzo por imagen: marco por los cuatro lados, un lado, lados opuestos, esquina, tres lados y ventana pequena (entre el 12 % y el 30 % de la imagen conservada). El objetivo es la imagen a 1 MP o menos sobre la rejilla /32 (nunca reescalada hacia arriba) y la fuente es el mismo lienzo con todo lo exterior al rectangulo conservado pintado en `#808080`. Las leyendas (captions) combinan la instruccion (70 % de los casos) o una de cinco parafrasis (30 %), y en el 75 % de los pares se anade `Scene:` mas una descripcion del conjunto generada por Qwen3-VL-8B. El dropout de leyendas fue 0. Hiperparametros: AdamW8bit, learning rate 1e-4 constante, batch 1, timesteps con `shift`, 1500 pasos; el autor indica que converge en torno al paso 1250 y que el paso 500 ya es funcional. Las imagenes proceden de un conjunto seleccionado a mano mas material con licencia abierta: fotos de Flickr de CommonCatalog CC-BY, arte de museo de PD12M (CC0 / dominio publico) y anime de anime-with-caption-cc0.

## Capacidades

- Outpainting en cualquier direccion: extension por un lado, dos lados, esquina, tres lados, los cuatro lados o imagen pequena sobre lienzo grande.
- Uncrop: ampliacion del encuadre de una imagen existente rellenando el area nueva de forma coherente con la escena.
- Preservacion de la zona conocida: mantiene la imagen original registrada a nivel de pixel (PSNR de la zona conservada de 33,5 dB), lo que permite coser los pixeles originales exactos tras la generacion.
- Relleno de lienzo en gris: interpreta el `#808080` como area a sustituir, en lugar de tratarlo como contenido.
- Acepta instruccion como disparador (`Outpaint the image: ...`) seguida opcionalmente de `Scene: <descripcion>`.
- Compatibilidad con el codificador de texto Qwen3-VL 8B ya cargado para Qwen Image 2.1, que puede generar la descripcion de escena de forma automatica (nodo Text Generate en ComfyUI).
- Integracion en flujos image-to-image de ComfyUI con el VAE de Qwen 2.1, que decodifica en RGBA.

## Casos de uso

- Restauracion de encuadre en fotografia: ampliar una foto recortada a un formato o relacion de aspecto objetivo (por ejemplo 16:9 o 1:1) rellenando los bordes con continuacion de la escena, manteniendo intacta la zona original para no degradar la fotografia de partida.
- Preparacion de material para impresion: extender una imagen a un lienzo de gran formato anadiendo margen coherente, util cuando el original no cubre toda la superficie requerida.
- Correccion de composiciones mal encuadradas: anadir el espacio que falta en un lado (cielo, suelo, pared) para recolocar el sujeto dentro del marco sin recomponer la imagen, gracias a la preservacion pixel a pixel.
- Generacion de fondos para diseno y publicidad: a partir de un producto recortado sobre lienzo gris, generar la escena circundante que lo integre de forma natural.
- Produccion de material de archivo para ilustracion y comics: extender viñetas o ilustraciones de anime (el entrenamiento incluye anime CC0) para adaptarlas a un formato de pagina concreto.
- Ampliacion de miniaturas o assets para interfaces: convertir una imagen pequena en un canvas mayor con margen generado, evitando el reescalado que difumina el contenido original.
- Recuperacion de arte digitalizado: extender digitalizaciones de obras de museo (el conjunto PD12M forma parte del entrenamiento) para crear marcos o margenes coherentes con la obra.
- Enriquecimiento previo en pipelines de difusion: usar el outpainting como paso previo para dotar de contexto a una imagen antes de aplicar otras tecnicas de image-to-image, ya que el LoRA mantiene la imagen base registrada.

## Benchmarks y rendimiento

El autor publica metricas propias sobre 12 imagenes no vistas en entrenamiento, renderizadas en ComfyUI con el modelo Qwen Image 2.1 en INT8, 25 pasos y CFG 1. Se comparan la base sin LoRA y tres checkpoints del adaptador:

| Metrica | Base Qwen 2.1 | + LoRA paso 500 | + LoRA paso 1250 | + LoRA paso 1500 |
|---|---|---|---|---|
| Gris sin rellenar | 9,1 % | 1,1 % | 1,0 % | 0,9 % |
| PSNR de la zona conservada | 23,6 dB | 33,6 dB | 33,6 dB | 33,5 dB |
| Salto de color medio en la costura | +2,2 | -0,8 | -0,7 | -0,6 |

El propio autor advierte que la metrica de "gris" cuenta cualquier gris medio plano, por lo que superficies como asfalto o cielo gris pueden computar como un pequeno porcentaje. No se han publicado resultados de benchmarks estandar (tipo MMLU, HumanEval o GSM8K) porque no aplican a un modelo de imagen, ni otras metricas de calidad visual en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa una fraccion de los 0,5 GB del repositorio; el coste de VRAM lo determina practicamente el modelo base Qwen-Image-2.1, cuyos requisitos no se detallan en la informacion proporcionada (no disponible).
- La version de referencia para ejecucion es la base INT8 de Comfy-Org, que reduce el uso de memoria frente a los pesos en precision completa; el entrenamiento del LoRA se hizo sobre esos mismos pesos INT8.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor no publica requisitos de hardware concretos.
- Viabilidad en GPU de consumo: no disponible; depende enteramente del modelo base, no del adaptador.
- Opciones de despliegue: ComfyUI es el flujo documentado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican o no estan documentados para este adaptador).
- Latencia y throughput: no disponibles. El unico parametro de generacion documentado es 25 pasos con CFG 1 y sampler `euler` / `simple`, denoise 1.

## Comparativa con modelos similares

No disponible. El autor no ofrece comparacion con otros adaptadores de outpainting ni con modelos alternativos de la misma categoria. La unica comparacion publicada es la del propio LoRA frente a su modelo base sin adaptador, que se recoge en la tabla de la seccion de benchmarks.

| Modelo | Tipo | Base | Preservacion de la zona conocida | Licencia |
|---|---|---|---|---|
| Qwen-Image-2.1-Outpaint-LoRA (paso 1500) | LoRA de outpainting | Qwen-Image-2.1 | PSNR 33,5 dB | qwen-research-license |
| Qwen-Image-2.1 (base, sin LoRA) | Modelo de difusion | — | PSNR 23,6 dB; reencuadra o reescala | qwen-research-license |

## Limitaciones y advertencias

- Extensiones muy grandes: cuando la imagen conservada ocupa menos del 15 % del lienzo, el modelo inventa mucho contenido y los resultados varian mas segun la semilla.
- Resolucion de entrenamiento: el adaptador se entreno a aproximadamente 1 MP. Los lienzos mayores funcionan, pero no han sido probados.
- Texto generado: el texto que aparezca en la zona nueva es plausible, no legible.
- No hay que fijar la zona conocida con *Set Latent Noise Mask*: en Qwen 2.1 esto dibuja un rectangulo visible en la costura. El LoRA mantiene la imagen en su sitio por si mismo.
- Licencia: es un adaptador para Qwen Image 2.1, publicado bajo la Qwen Research License. Tanto el uso del modelo base como el de este LoRA con el siguen esa licencia, lo que condiciona el uso comercial segun los terminos del modelo base.
- Sesgos: el conjunto de entrenamiento mezcla fotos de Flickr, arte de museo y anime; las limitaciones de sesgo y cobertura no estan documentadas por el autor (no disponible).
- Riesgo de alucinacion: inherente a la tarea; el propio autor senala que en extensiones grandes la generacion inventa contenido.
- Contexto e idioma: al ser un modelo de imagen no aplica una ventana de contexto de texto; las instrucciones del autor estan en ingles y se desconoce el comportamiento de la instruccion en otros idiomas.
- Advertencia de integracion: el adaptador requiere los pesos Comfy-Org de Qwen Image 2.1 y el esquema de claves de ComfyUI; no se documenta su uso fuera de ese ecosistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ausboss/Qwen-Image-2.1-Outpaint-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de entrenamiento (ai-toolkit): https://github.com/ostris/ai-toolkit
- Dataset Flickr CommonCatalog CC-BY: https://huggingface.co/datasets/common-canvas/commoncatalog-cc-by
- Dataset PD12M (dominio publico / CC0): https://huggingface.co/datasets/Spawning/PD12M
- Dataset anime-with-caption-cc0: https://huggingface.co/datasets/alfredplpl/anime-with-caption-cc0
