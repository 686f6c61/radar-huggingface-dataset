# Andylinux/MOSS-Image-Kohaku-FP8

## Resumen

MOSS-Image-Kohaku-FP8 es un paquete de dos checkpoints cuantizados en FP8 del modelo de difusion MOSS-Image, publicados por el usuario Andylinux para su uso con el node pack ComfyUI-MOSS-LowVRAM-Optimized. Incluye dos variantes del transformer de difusion: Base (a partir de Comfy-Org/MOSS-Image) y SFT (a partir de OpenMOSS-Team/MOSS-Image-SFT), ambas almacenadas con códigos de peso E4M3 y una escala FP32 por fila de salida. No es un modelo nuevo: es una conversión de pesos existentes cuyo objetivo es reducir la huella de memoria y habilitar aritmética FP8 o de 16 bits en un pipeline de ComfyUI.

El modelo subyacente, MOSS-Image, es un DiT (diffusion transformer) de aproximadamente 5.000 millones de parámetros orientado a generación de imágenes a partir de texto, con capacidades destacadas de renderizado de texto legible y generación de maquetación. La tarea declarada en el repositorio es text-to-image, con soporte de inglés y chino. El text encoder, el tokenizer y el VAE son activos separados que no forman parte de este repositorio, un detalle crítico para cualquiera que intente montar el pipeline solo con estos ficheros.

La relevancia de esta publicación es operativa: empaqueta los pesos en un formato que el node pack puede cargar en GPUs de consumo de la familia RTX 40 (requiere SM89 o superior), con dos modos de cómputo sobre los mismos ficheros. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un único contribuidor, por lo que debe tratarse como una conversión reciente sin validación comunitaria, aunque incluye manifiesto de conversión y sumas SHA256 para verificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) para generacion de imagenes; 2 checkpoints (Base y SFT) |
| Parametros totales | ~5.000 millones por checkpoint (cifra del repositorio oficial OpenMOSS/MOSS-Image) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; el text encoder es un activo separado no incluido) |
| Tipos de cuantizacion | FP8 E4M3 con escala FP32 por fila de salida; tensores no cuantizados en BF16, salvo `rope.bands` en FP32; modos de computo FP8 o 16 bits |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (pesos upstream); el codigo del conversor usa KohakuMoss License con condicion de nombre y excepcion de output |
| Formato de pesos | safetensors (exportacion por filas, FP8) |

## Arquitectura y entrenamiento

El modelo subyacente es un diffusion transformer de ~5B parametros, según la descripcion del repositorio oficial OpenMOSS/MOSS-Image, que lo presenta como un "5B-parameter base DiT model with high-quality text rendering, layout generation, and efficient fine-tuning". Se distribuyen dos variantes: Base, tomada del fichero `diffusion_models/moss_image_base_bf16.safetensors` de Comfy-Org/MOSS-Image, y SFT, construida a partir de los tres shards del transformer de OpenMOSS-Team/MOSS-Image-SFT. La diferencia entre ambas es el ajuste supervisado, que en la practica se traduce en mejor adherencia al prompt y calidad de salida; para el resto de la ficha no hay datos publicados sobre el dataset de entrenamiento, el numero de tokens, la composicion de la mezcla ni si hubo RLHF o DPO.

La innovacion tecnica de este repositorio concreto no esta en el entrenamiento sino en el formato de almacenamiento. Cada peso se exporta como codigo E4M3 con una escala FP32 por fila de salida, lo que permite dos modos de inferencia sobre los mismos bytes: un modo FP8 con cuantizacion de activaciones y un modo de 16 bits que reutiliza los pesos cuantizados con activaciones FP16/BF16. Segun la model card, el despacho de kernels puede seleccionar una ruta de 16 bits para determinadas formas, y ambos modos requieren SM89 o superior en el node pack. La conversion se realizo con `tools/export_fp8.py` y el IO/cuantizacion de Kohaku, reutilizando KohakuMoss. Los hashes, revisiones y la receta exacta quedan en `conversion_manifest.json` y `SHA256SUMS`.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (pipeline text-to-image), en dos variantes: Base y SFT.
- Renderizado de texto de alta calidad dentro de la imagen, segun la descripcion del repositorio oficial de MOSS-Image; relevante para carteles, etiquetas y creatividades.
- Generacion de maquetacion (layout generation), es decir, composicion de elementos y jerarquia visual dentro del lienzo.
- Soporte de ingles y chino como idiomas declarados en la model card.
- Fine-tuning eficiente sobre el modelo base, segun se anuncia en el repositorio oficial; este repositorio aporta los pesos cuantizados que el node pack puede cargar para ese flujo.
- Dos modos de computo seleccionables (FP8 con activaciones cuantizadas, o 16 bits con activaciones FP16/BF16) sobre los mismos ficheros.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking"; es un modelo generativo de imagen, no un LLM.

## Casos de uso

- Carteles y creatividades con texto legible: el interes declarado de MOSS-Image por el renderizado de texto lo hace adecuado para generar posters, banners y portadas donde el texto forma parte del diseno, en ingles o chino, usando la variante SFT por su mejor adherencia al prompt.
- Maquetacion automatica de piezas publicitarias: la capacidad de layout generation permite generar composiciones con jerarquia visual (titular, imagen, bloques secundarios) que luego se retocan en diseno, en lugar de partir de un lienzo vacio.
- Prototipado rapido de mockups de interfaz y material de presentacion: el pipeline en ComfyUI permite iterar decenas de variaciones por prompt y seleccionar candidatas antes de invertir tiempo en diseno final.
- Ilustracion para documentacion tecnica y material formativo: generacion por lotes de figuras y esquemas con etiquetas cortas en ingles o chino, integrda en un flujo de ComfyUI que exporta a un directorio de assets.
- Ajuste fino de estilo de marca: sobre la variante Base se puede entrenar un LoRA o un ajuste ligero con el node pack, de modo que el equipo produzca imagenes consistentes con una identidad visual sin reentrenar el modelo completo.
- Localizacion grafica en/zh: generacion del mismo concepto creativo en ingles y en chino para mercados distintos, aprovechando que ambos idiomas estan declarados y que el texto se renderiza dentro de la imagen.
- Exploracion de conceptos en estaciones de trabajo con GPU de consumo: el formato FP8 por filas y el enfoque "low VRAM" del node pack estan pensados para GPUs RTX 40, lo que permite trabajar en local en lugar de depender de un servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas cuantitativas (FID, CLIP score, benchmarks de renderizado de texto tipo OneIG o GenEval) ni comparaciones numericas con otros modelos; el repositorio oficial de MOSS-Image se menciona en los resultados de busqueda, pero no se aportan cifras en la informacion proporcionada.

## Requisitos de hardware

- Peso de cada checkpoint: `moss_image_base_kohaku_fp8_row.safetensors` ocupa 5.174.879.864 bytes y `moss_image_sft_kohaku_fp8_row.safetensors` 5.174.879.840 bytes, es decir, aproximadamente 4,82 GiB cada uno (calculo derivado de los tamanos de fichero indicados en la model card).
- Descarga completa del repositorio: 10.349.759.704 bytes, aproximadamente 9,64 GiB, si se quieren ambas variantes.
- VRAM total necesaria: no disponible como cifra publicada. A los pesos hay que sumar el text encoder, el tokenizer, el VAE, las activaciones y los buffers de runtime, que son activos separados no incluidos en este repositorio.
- Requisito de GPU: SM89 o superior para los kernels del node pack, lo que en la practica significa arquitecturas Ada y Hopper (RTX 4090, 4080, 4070 Ti Super y superiores; L40S; H100). No se garantiza funcionamiento en GPUs anteriores a Ada con estos modos.
- Plataforma primaria declarada: Windows con NVIDIA RTX 40. El soporte para otras plataformas se documenta en `docs/ENVIRONMENT_SUPPORT.md` del repositorio del node pack.
- Despliegue: ComfyUI con el node pack ComfyUI-MOSS-LowVRAM-Optimized, importando `00_moss_lowvram.json`, seleccionando Base o SFT y el modo de computo FP8 o 16 bits, y ejecutando "Prepare / check selected configuration" para preparar los activos.
- Latencia y throughput: no disponible. No se publican tiempos por imagen ni imagenes por segundo para ninguno de los dos modos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Andylinux/MOSS-Image-Kohaku-FP8 (este) | ~5B por checkpoint | safetensors, FP8 E4M3 por filas con escala FP32 | ~4,82 GiB por checkpoint | apache-2.0 (pesos) + KohakuMoss License (codigo) | Hugging Face, repo de 10,3 GB |
| MOSS-Image Base BF16 (Comfy-Org) | ~5B | safetensors BF16 | ~10 GB estimados (5B x 16 bits; no publicado) | apache-2.0 | Hugging Face / Comfy-Org |
| MOSS-Image SFT (OpenMOSS-Team) | ~5B | safetensors, tres shards del transformer | no disponible | apache-2.0 | Hugging Face |
| Variantes INT8 / GGUF / INT4 de MOSS-Image | ~5B | INT8, GGUF, INT4 | no disponible | apache-2.0 (pesos) | Referenciadas en mossimage.org/download; no verificadas en detalle |

La comparacion relevante es de formato, no de capacidad: los tres primeros comparten el mismo modelo subyacente de ~5B parametros y licencia Apache-2.0, y difieren en el compromiso entre fidelidad numerica y huella de memoria. Las variantes INT8, GGUF e INT4 aparecen listadas en el agregador mossimage.org, pero no se han podido confirmar sus especificaciones exactas en la informacion disponible.

## Limitaciones y advertencias

- Es una conversion cuantizada, no un modelo original: la cuantizacion FP8 E4M3 por filas puede degradar detalles finos, texturas y, especialmente, el renderizado de texto pequeno frente al checkpoint BF16 de referencia. No se publican evaluaciones comparativas de calidad.
- El repositorio no incluye text encoder, tokenizer ni VAE. Sin esos activos el pipeline no es funcional; hay que obtenerlos por separado.
- Solo ingles y chino declarados. No hay garantia de calidad en prompts en castellano ni de renderizado correcto de texto con caracteres no latinos o no hanzi.
- Dependencia de hardware estricta: los modos del node pack requieren SM89 o superior. En GPUs anteriores no hay soporte declarado, y en otros sistemas operativos distintos de Windows/NVIDIA RTX 40 el soporte se remite a un documento aparte.
- El despacho de kernels puede caer a una ruta de 16 bits para ciertas formas incluso en modo FP8, de modo que el ahorro de memoria y el rendimiento pueden variar segun la resolucion y el batch.
- Licencia mixta: los pesos upstream son Apache-2.0, pero el codigo del conversor usa KohakuMoss License, que incluye una condicion de nombre y una excepcion de output. Cualquier redistribucion o producto derivado debe revisar ambas partes; la atribucion a OpenMOSS, KohakuMoss, ComfyUI y ComfyKitchen se mantiene en el NOTICE del repositorio del node pack.
- Sin validacion comunitaria: 0 descargas, 0 likes y un unico contribuidor en el momento de la consulta. Verificar `conversion_manifest.json` y `SHA256SUMS` antes de usar los pesos en produccion.
- Riesgo de sesgos y de alucinacion visual: no se documentan en la informacion disponible la composicion del dataset de entrenamiento ni las evaluaciones de sesgo del modelo base, por lo que no se pueden acotar los sesgos de representacion de personas, culturas o estilos.
- Las fechas de creacion y actualizacion del repositorio (25 y 26 de octubre de 2026) figuran asi en Hugging Face y no se han podido contrastar de forma independiente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Andylinux/MOSS-Image-Kohaku-FP8
- Ficheros del repositorio: https://huggingface.co/Andylinux/MOSS-Image-Kohaku-FP8/tree/main
- Node pack ComfyUI-MOSS-LowVRAM-Optimized: https://github.com/Andy-linux/ComfyUI-MOSS-LowVRAM-Optimized
- Soporte de entornos del node pack: https://github.com/Andy-linux/ComfyUI-MOSS-LowVRAM-Optimized/blob/main/docs/ENVIRONMENT_SUPPORT.md
- Repositorio oficial de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Modelo base SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT/tree/f972bd4b4b9e3852133cc5da954d87bc32cd8fb9
- Origen Base (Comfy-Org): https://huggingface.co/Comfy-Org/MOSS-Image/tree/24147db865fcdc207270f844777587223fed8d6e
- KohakuMossTrainer: https://github.com/KohakuBlueleaf/KohakuMossTrainer
- Agregador de descargas MOSS-Image: https://mossimage.org/download/
- Guia de descargas alternativa: https://mossimage.app/moss-image-download
