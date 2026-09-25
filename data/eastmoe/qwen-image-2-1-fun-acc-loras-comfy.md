# eastmoe/Qwen-Image-2.1-Fun-Acc-LoRAs-Comfy

## Resumen

Qwen-Image-2.1-Fun-Acc-LoRAs-Comfy es un adaptador LoRA de aceleración para el modelo de generación y edición de imágenes Qwen-Image 2.1, publicado por el usuario eastmoe. No se trata de un modelo completo, sino de una conversión a formato ComfyUI de los pesos originales Qwen-Image-2.1-Fun-Acc-4Step del proyecto VideoX-Fun (aigc-apps), obtenidos mediante destilación por decodificación paralela (PDD, Parallel Decoding Distillation). Su función es reducir la inferencia del modelo base a 4 NFE (evaluaciones de función) con una única escala de sigmas fija, frente a las decenas de pasos que requiere el muestreo habitual de un DiT de difusión.

El adaptador tiene rango 64 y alpha 64, pesa 344 MB en safetensors y contiene 231 pares de matrices LoRA más 7 diferencias de normalización, distribuidas sobre los 32 bloques del DiT de una sola corriente (Single-Stream DiT) del modelo base. El modelo base Qwen-Image 2.1 declara 7B de parámetros en su componente de generación visual, genera de forma nativa a 2K, soporta canal alfa (RGBA) y admite hasta 10 imágenes de referencia para edición.

La relevancia de esta ficha es práctica: es una pieza de infraestructura para quien ya ejecuta Qwen-Image 2.1 en ComfyUI y quiere multiplicar el throughput de generación sin cambiar de modelo. El repositorio no tiene descargas ni valoraciones registradas, y no se han publicado benchmarks asociados a la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de bajo rango sobre DiT de una sola corriente (Single-Stream DiT) de 32 bloques, destilado con PDD |
| Parametros totales | no disponible (adaptador de 344 MB en safetensors); el modelo base Qwen-Image 2.1 declara 7B en su componente de generacion visual |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; el modelo base trabaja a 2048 x 2048 en el entrenamiento de esta LoRA |
| Tipos de cuantizacion | no disponible; pesos en bf16 y formato nativo de ComfyUI |
| Idiomas soportados | no disponible (el texto del prompt lo procesa el modelo base) |
| Licencia | qwen-research, segun la ficha del autor para los pesos originales; este repositorio no declara licencia propia |
| Formato de pesos | safetensors (LoRA cargable por ComfyUI) |
| Rank / alpha | 64 / 64 |
| Pasos de inferencia | 4 NFE |
| Modelo base | `qwen_image_2.1_bf16.safetensors` (Qwen-Image 2.1) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el DiT de una sola corriente de Qwen-Image 2.1 (32 bloques). Los 231 pares de matrices LoRA cubren `to_q`, `to_k`, `to_v`, `to_out.0` e `img_mlp.*` en los 32 bloques, mas las capas `img_in`, `txt_in`, `modulation.1`, `norm_out.linear` y `time_text_embed`; a esto se suman 7 diferencias de normalizacion. El entrenamiento original es una destilacion PDD que fuerza al modelo a producir una imagen aceptable en un unico paso de integracion con 4 evaluaciones de red, sobre una rejilla temporal fija.

La principal adaptacion tecnica durante la conversion es el tratamiento de la salida: los pesos originales incluyen 4 cabezas `proj_out` que se alternan segun el paso, algo que un LoRA estatico de ComfyUI no puede expresar. El autor las ha promediado en una unica `proj_out.diff`, con un error de aproximacion declarado de aproximadamente el 0,5 %; el resto de los pesos se conserva sin perdida. Las capas nativas `gate_layer` y `proj` de `img_mlp` se integran automaticamente en la capa fusionada `gate_up` de ComfyUI. La escala de sigmas empleada en el entrenamiento es 1.0, 0.9169867038726807, 0.7861579060554504, 0.5494909882545471 y 0.0, y debe introducirse manualmente para reproducirla.

## Capacidades

- Aceleracion de inferencia: reduce el muestreo de Qwen-Image 2.1 a 4 NFE con CFG 1.0 y muestreador euler, manteniendo la rejilla de sigmas de entrenamiento.
- Hereda del modelo base la generacion texto-a-imagen unificada y la edicion de imagenes en un unico modelo.
- Salida nativa a 2K (2048 x 2048) y soporte de canal alfa (RGBA) segun la documentacion del modelo base.
- Edicion con hasta 10 imagenes de referencia, segun las caracteristicas publicadas de Qwen-Image 2.1.
- Tipografia y renderizado de texto profesional, capacidad atribuida al modelo base.
- Integracion directa en ComfyUI mediante `LoraLoaderModelOnly`, con `strength = 1.0`.
- Tool calling, function calling y razonamiento agéntico multi-paso: no aplica, es un modelo de generacion de imagen.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del codificador de texto del modelo base).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de prompts: con 4 NFE por imagen, un flujo de trabajo en ComfyUI puede evaluar decenas de variaciones de prompt en el tiempo que el modelo base tarda en completar unas pocas, lo que permite iterar sobre estilo y composicion antes de fijar una version final.
- Generacion por lotes en produccion: al reducir las evaluaciones de red a 4 por muestra, el coste por imagen cae de forma proporcional; es adecuado para catalogos, banners o assets generados en volumen siempre que se respete la rejilla de sigmas de 2048 x 2048.
- Assets con transparencia para videojuegos y diseno: la combinacion del canal alfa nativo del modelo base con la aceleracion permite generar sprites, iconos y elementos de interfaz en RGBA con tiempos de respuesta interactivos.
- Composicion tipografica en 2K: para carteles, portadas y materiales de marketing que requieren texto renderizado con precision, el modelo base aporta tipografia profesional y la LoRA mantiene la resolucion de entrenamiento de 2048 x 2048.
- Edicion de imagenes con multiples referencias: en flujos donde se combinan varias imagenes de entrada (hasta 10 segun el modelo base) para reestilizar o recomponer, la aceleracion hace viable el ciclo de edicion interactivo.
- Servicios de generacion de imagen con requisito de latencia baja: al fijar 4 pasos y CFG 1.0, el tiempo de muestreo se vuelve predecible, lo que simplifica el dimensionado de capacidad y el control de tiempos de respuesta en una API interna.
- Investigacion sobre destilacion de difusion: el adaptador sirve como artefacto de estudio de PDD aplicado a un DiT de una sola corriente, y permite comparar en igualdad de condiciones la rejilla destilada frente a un muestreo estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor solo declara el error de aproximacion de aproximadamente el 0,5 % introducido al promediar las 4 cabezas `proj_out` en un unico `proj_out.diff`; no se aportan metricas de calidad tipo FID, CLIP score ni comparativas cuantitativas frente a los pesos originales de VideoX-Fun.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones orientativas a partir del tamaño del modelo base; el autor no publica requisitos de hardware para esta LoRA.

- El adaptador en si ocupa 344 MB, por lo que su impacto en VRAM es marginal frente al modelo base.
- Estimacion de VRAM en inferencia: un DiT de 7B en bf16 ocupa en torno a 14 GB solo en pesos, a los que hay que sumar activaciones y decodificacion VAE; a 2048 x 2048 es razonable esperar un rango de 16 a 24 GB en funcion de la implementacion y de si se aplican offloading o atencion eficiente. No confirmado por el autor.
- GPU recomendadas: A100, H100 o similares con 40-80 GB para lotes grandes a 2K sin compromisos; RTX 4090 o RTX 3090 (24 GB) como opcion de gama alta de consumo, presumiblemente suficiente para una imagen a la vez.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con margen limitado; en tarjetas de 16 GB o menos es previsible necesitar cuantizacion o descarga secuencial de modulos, no documentada en esta ficha.
- Opciones de despliegue: ComfyUI es la ruta soportada por esta conversion (`LoraLoaderModelOnly` + `SamplerCustomAdvanced`). Los pesos originales de VideoX-Fun se usan con la pila de diffusers de ese proyecto. vLLM, TGI y llama.cpp no son aplicables a un modelo de difusion de imagen.
- Latencia y throughput: no disponible. Como referencia cualitativa, el adaptador reduce el numero de evaluaciones de red por muestra a 4, frente al muestreo multi-paso del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | Resolucion de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Fun-Acc-4Step (esta conversion ComfyUI) | adaptador de 344 MB sobre base de 7B | 4 NFE | 2048 x 2048 | qwen-research | Hugging Face (eastmoe) |
| Qwen-Image-2.1-Fun-Acc-4Step original (VideoX-Fun) | adaptador sobre base de 7B | 4 NFE | no disponible | qwen-research | Repositorio VideoX-Fun |
| Qwen-Image 2.1 sin LoRA | 7B en el componente visual | no disponible | 2K nativo | no disponible | Hugging Face y ComfyUI |
| Otros LoRAs de aceleracion para Qwen-Image | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El promediado de las 4 cabezas `proj_out` introduce un error de aproximacion de aproximadamente el 0,5 % respecto a los pesos originales; no es una conversion exacta.
- La rejilla de sigmas es especifica del entrenamiento a 2048 x 2048. Con la programacion por defecto de 4 pasos de ComfyUI se obtiene una rejilla distinta y el resultado se desvia; a otras resoluciones el modelo genera imagen, pero fuera de la rejilla optima.
- Depende por completo del modelo base `qwen_image_2.1_bf16.safetensors`: el LoRA por si solo no genera nada.
- El repositorio no registra descargas ni valoraciones, y no se han publicado evaluaciones independientes de calidad.
- Licencia: los pesos originales se distribuyen bajo qwen-research, una licencia de investigacion; el uso comercial debe verificarse en los terminos de esa licencia antes de desplegar en produccion. Este repositorio no declara licencia propia.
- Riesgo de alucinacion y sesgos: no disponibles en la informacion proporcionada; son atribuibles al modelo base y no se documentan en esta ficha.
- Limitaciones de idioma y de contexto: no disponibles. El comportamiento multilingue depende del codificador de texto de Qwen-Image 2.1.
- El autor indica que la capa `img_mlp` se reasigna automaticamente a la capa fusionada `gate_up` de ComfyUI; es necesario usar una version de ComfyUI compatible con Qwen-Image 2.1 para que la carga sea correcta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eastmoe/Qwen-Image-2.1-Fun-Acc-LoRAs-Comfy
- Repositorio del modelo base Qwen-Image 2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Qwen-Image en Hugging Face: https://huggingface.co/Qwen/Qwen-Image
- Flujo nativo de Qwen-Image 2.1 en ComfyUI: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1
- Nota de lanzamiento de Qwen-Image 2.1: https://qwenimages.com/blog/qwen-image-2-1-release
- Guia de Qwen Image 2.1 en ComfyUI (PicEditor AI): https://piceditor.ai/blog/qwen-image-2-1-comfyui/
- Pesos originales del proyecto VideoX-Fun (aigc-apps): https://github.com/aigc-apps/VideoX-Fun
