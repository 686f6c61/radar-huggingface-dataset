# Nekodeus/neko-alpha8-sdxl-v1

## Resumen

Neko Alpha8 SDXL v1 es un LoRA de personaje para Stable Diffusion XL, publicado por el usuario Nekodeus bajo licencia Apache 2.0. Se trata de un adaptador de bajo rango entrenado sobre `stabilityai/stable-diffusion-xl-base-1.0` para generar representaciones del actor Robert Pattinson a partir de la palabra clave `alpha8`. No es un modelo generativo completo, sino un complemento que se carga junto al checkpoint base de SDXL y modifica el comportamiento de la red UNet y de los codificadores de texto para incorporar la identidad visual del sujeto.

El adaptador se entrenó con aproximadamente 100 imagenes curadas del actor, verificadas facialmente con OpenCV y etiquetadas con una leyenda uniforme (`a photo of alpha8 person`). El entrenamiento se realizo en una GPU NVIDIA P100 de Kaggle, con 1500 pasos, resolucion de 1024 px, dimension de red y alpha de 8 (algunos conjuntos 16), learning rate 1e-4, optimizador Adafactor y batch de 2. El repositorio ocupa 0,2 GB y contiene los pesos en formato safetensors junto con imagenes de muestra del conjunto de entrenamiento.

Su relevancia es acotada: no compite en la categoria de modelos fundacionales, sino que sirve como ejemplo de LoRA de personaje ligero y de bajo coste computacional, util para quienes quieran reproducir el flujo de entrenamiento o integrar un estilo/identidad concreta en pipelines de difusion con diffusers o ComfyUI. La ausencia de descargas y likes en el momento de la consulta sugiere que es un artefacto reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet y text encoders de Stable Diffusion XL |
| Parametros totales | no disponible (el repo ocupa 0,2 GB; el LoRA es de dimension 8/8 o 16/16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, sin contexto textual en tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, tipicamente fp16) |
| Idiomas soportados | no disponible (los prompts de difusion dependen del text encoder CLIP de SDXL, principalmente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`alpha8.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre Stable Diffusion XL, un modelo de difusion latente con arquitectura UNet y doble text encoder (CLIP ViT-L y OpenCLIP ViT-bigG). El adaptador inyecta matrices de bajo rango en las capas de atencion, con dimension de red y alpha de 8 (en algunos conjuntos 16), lo que mantiene el numero de parametros entrenables muy reducido frente al checkpoint base. La atencion se configuro con `sdpa` (scaled dot-product attention) durante el entrenamiento.

El conjunto de datos consta de unas 100 imagenes del actor Robert Pattinson, filtradas mediante verificacion facial con OpenCV y etiquetadas con la cadena uniforme `a photo of alpha8 person`. El entrenamiento se ejecuto en una NVIDIA P100 de Kaggle, de forma completamente offline y sin tokens de API, con 1500 pasos, resolucion de 1024 px, learning rate 1e-4, optimizador Adafactor y batch de 2. No se documenta el uso de RLHF, DPO ni tecnicas de destilacion; se trata de un ajuste supervisado clasico de LoRA para difusion.

## Capacidades

- Generacion de imagenes text-to-image de 1024x1024 px condicionada por el checkpoint base SDXL.
- Inyeccion de la identidad visual del sujeto mediante el token disparador `alpha8` en el prompt.
- Compatibilidad con el ecosistema diffusers (`load_lora_weights`) y con ComfyUI (nodo LoRA loader).
- Composicion con otros LoRA y con el checkpoint base para modificar estilo, iluminacion o encuadre.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: es un adaptador puramente generativo de imagen.
- Capacidades multilingues limitadas por el text encoder de SDXL, orientado a prompts en ingles.
- No incluye vision, audio ni otras modalidades.

## Casos de uso

- Generacion de retratos de personaje en proyectos creativos: cargando el LoRA sobre SDXL y usando `alpha8 Robert Pattinson, portrait photo, studio lighting` se obtienen retratos consistentes del sujeto en 1024 px, util para storyboards o pruebas de concepto.
- Prototipado de pipelines de difusion: sirve como ejemplo minimo de LoRA de personaje para validar flujos con diffusers o ComfyUI antes de entrenar adaptadores propios.
- Reproduccion de experimentos de bajo coste: el entrenamiento en una P100 de Kaggle con 1500 pasos y ~100 imagenes es replicable por investigadores con recursos limitados.
- Composicion con LoRA de estilo: al ser un adaptador ligero, puede combinarse con LoRA de estetica (cine, ilustracion) para explorar variaciones visuales sin reentrenar.
- Educacion y divulgacion: util para explicar como funciona un LoRA de personaje, el papel del token disparador y la verificacion facial en la curacion del dataset.
- Integracion en herramientas de diseno: mediante la API de diffusers se puede exponer como servicio interno de generacion de imagenes con una identidad fija, siempre que se respeten las condiciones de licencia y los derechos de imagen del sujeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el LoRA en si ocupa muy poco (repo de 0,2 GB), pero requiere cargar el checkpoint base SDXL completo, que en fp16 ronda los 6-7 GB adicionales.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para generacion a 1024 px con buena latencia; RTX 3090 y RTX 4080 tambien son viables.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-10 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante), con posibles ajustes de atencion y offloading.
- Opciones de despliegue: diffusers (referencia oficial en la model card), ComfyUI (nodo LoRA loader), y en general cualquier runtime compatible con SDXL y safetensors.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de los pasos de muestreo, no documentados en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha8-sdxl-v1 | LoRA de personaje | SDXL 1.0 | no disponible (dim 8/8 o 16/16) | no aplica | Apache 2.0 | HuggingFace |
| Nekodeus/neko-hollywood-alpha-sdxl-v1 | LoRA de personaje (serie Hollywood) | SDXL 1.0 | no disponible | no aplica | no disponible | HuggingFace |
| Nekodeus/neko-hollywood-alpha-sd15-v1 | LoRA de personaje (serie Hollywood) | SD 1.5 | no disponible | no aplica | no disponible | HuggingFace |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | no aplica | no disponible | no aplica | CreativeML Open RAIL++-M | HuggingFace |

La comparativa se limita a los artefactos de la misma serie y al checkpoint base, ya que no se dispone de datos de benchmarks ni de otros LoRA de personaje equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con ~100 imagenes de una persona concreta, el LoRA puede reproducir sesgos de iluminacion, encuadre, edad aparente o estilo presentes en el dataset; no se documenta analisis de sesgo.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar rasgos faciales inconsistentes, artefactos en manos, ojos o texto, especialmente fuera del dominio de retratos.
- Limitaciones de contexto e idioma: los prompts funcionan mejor en ingles por el text encoder de SDXL; no hay soporte multilingue declarado.
- Restricciones de licencia: el LoRA se publica bajo Apache 2.0, pero el checkpoint base SDXL tiene su propia licencia (CreativeML Open RAIL++-M) con restricciones de uso; ademas, la generacion de la imagen de una persona real plantea cuestiones de derechos de imagen y personalidad que no cubre la licencia del software.
- Caveat para produccion: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria; conviene evaluar la calidad y la consistencia del sujeto antes de integrarlo en un pipeline.
- El token disparador `alpha8` es obligatorio para activar la identidad; sin el, el LoRA puede introducir deriva en la generacion.
- No se documentan metadatos de cuantizacion ni versiones GGUF/ONNX; el uso esta pensado para safetensors con diffusers o ComfyUI.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Nekodeus/neko-alpha8-sdxl-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/alpha8-robert-pattinson
- Serie Hollywood alpha (SD1.5): https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Serie Hollywood alpha (SDXL): https://huggingface.co/Nekodeus/neko-hollywood-alpha-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
