# Lauradeem/maya-flux2-klein9b-runware-1000step-checkpoints

## Resumen

Este repositorio contiene cinco checkpoints de LoRA (Low-Rank Adaptation) entrenados sobre el modelo base de generación de imágenes FLUX.2 Klein 9B de Black Forest Labs. El objetivo es especializar el modelo para generar un personaje concreto denominado "Maya", mediante un entrenamiento de 1.000 pasos con un conjunto de datos de 12 imágenes y 12 pies de foto. El autor, Lauradeem, ha publicado los checkpoints en formato Diffusers/PEFT, con pesos en BF16 y cabeceras safetensors válidas, pensados para su uso directo en la plataforma Runware mediante enlaces de descarga directa.

La relevancia de este modelo radica en que demuestra un flujo de personalización de un modelo de difusión de última generación con un coste computacional reducido (solo 12 imágenes de entrenamiento) y una integración sencilla en servicios de inferencia en la nube. Al ser un LoRA, no sustituye al modelo base, sino que se combina con él para añadir la capacidad de generar el personaje Maya con un trigger word específico (`zkchr7`). Es un ejemplo práctico de fine-tuning eficiente para usuarios que necesitan personajes o estilos consistentes sin reentrenar un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre FLUX.2 Klein 9B (modelo de difusion de texto a imagen) |
| Parametros totales | No disponible (el repositorio ocupa 0.4 GB; los safetensors contienen 112 claves PEFT A y 112 PEFT B, sin tensores de alpha adicionales) |
| Parametros activos | No disponible (al ser LoRA, solo se actualizan los adaptadores; el modelo base tiene 9B parametros) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | No disponible (los pesos se guardan en BF16) |
| Idiomas soportados | No disponible (el modelo base FLUX.2 Klein soporta prompts en ingles principalmente, pero no se especifica para este LoRA) |
| Licencia | other (sujeta a la licencia del modelo base FLUX.2 Klein y a los derechos de los datos de entrenamiento) |
| Formato de pesos | safetensors (Diffusers/PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 16, entrenado sobre el modelo base `black-forest-labs/FLUX.2-klein-base-9B`. FLUX.2 Klein es una variante compacta y rapida de la familia FLUX.2, disenada para generacion y edicion de imagenes con una arquitectura unificada. El LoRA se entrena con un dataset de 12 imagenes a resolucion 512 con buckets de aspecto variable, usando el optimizador AdamW de 8 bits, una tasa de aprendizaje de 0.00008 con scheduler constante, y precision BF16 tanto en entrenamiento como en guardado. No se utilizaron muestras de entrenamiento adicionales (training samples desactivado). El entrenamiento se realizo durante 1.000 pasos, y se guardaron checkpoints en los pasos 200, 400, 600, 800 y 1000.

No se proporcionan detalles sobre la composicion del dataset ni sobre tecnicas de regularizacion adicionales. La ausencia de tensores Kohya down/up o alpha sugiere que el adaptador sigue el formato estandar de PEFT, lo que facilita su carga en Diffusers y en Runware.

## Capacidades

- Generacion de imagenes del personaje "Maya" cuando se usa el trigger word `zkchr7` en el prompt.
- Compatible con el modelo base FLUX.2 Klein 9B, que soporta generacion y edicion de imagenes de alta calidad con un unico modelo.
- Integracion con la plataforma Runware mediante enlaces de descarga directa, lo que permite su uso en pipelines de inferencia en la nube.
- Formato Diffusers/PEFT, compatible con la libreria `diffusers` y con herramientas que soporten adaptadores LoRA.
- No se documentan capacidades de tool calling, agentes, ni procesamiento multimodal mas alla de la generacion de imagenes.

## Casos de uso

- Creacion de ilustraciones consistentes de un personaje ficticio: el LoRA permite generar multiples imagenes del mismo personaje con variaciones de pose, fondo o iluminacion, manteniendo la identidad visual gracias al trigger word.
- Prototipado rapido en diseno de personajes: con solo 12 imagenes de referencia, un ilustrador puede entrenar un LoRA para explorar variaciones de un diseno sin necesidad de reentrenar un modelo completo.
- Integracion en flujos de trabajo de Runware: los checkpoints estan preparados para cargarse directamente en Runware, lo que facilita su uso en entornos de produccion sin gestionar infraestructura propia.
- Generacion de contenido para juegos o animacion: el personaje Maya puede usarse para generar assets visuales consistentes en fases de preproduccion.
- Personalizacion de modelos de difusion para marcas o mascotas: el mismo procedimiento puede replicarse para otros personajes o estilos, siempre que se disponga de un conjunto pequeno de imagenes de referencia.
- Evaluacion de tecnicas de fine-tuning eficiente: el repositorio sirve como caso de estudio para comparar la calidad de checkpoints intermedios (pasos 200 a 1000) y determinar el punto optimo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de evaluacion cuantitativa (FID, CLIP score, etc.) ni comparaciones con otros LoRA o modelos base. La unica validacion mencionada es una comprobacion estatica de compatibilidad con Runware, que confirma que los archivos tienen cabeceras safetensors validas y las claves PEFT esperadas, pero no se ha verificado la calidad visual real.

## Requisitos de hardware

- El LoRA en si ocupa 0.4 GB, pero requiere el modelo base FLUX.2 Klein 9B para funcionar. El modelo base tiene 9.000 millones de parametros, por lo que se necesita una GPU con al menos 16 GB de VRAM para inferencia en BF16 (por ejemplo, una RTX 4080, RTX 4090, A100 o H100).
- Con cuantizacion (por ejemplo, 8 bits o 4 bits) podria ejecutarse en GPUs con 8-12 GB de VRAM, aunque no se proporcionan configuraciones oficiales.
- La plataforma Runware ofrece inferencia en la nube, lo que elimina la necesidad de hardware local.
- Para cargar el LoRA con Diffusers, se recomienda usar `pipe.load_lora_weights()` y especificar el trigger word en el prompt.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros LoRA de personajes sobre FLUX.2 Klein ni con adaptadores similares de otros modelos de difusion (como SDXL o SD3). La falta de benchmarks publicos impide establecer una comparativa objetiva.

## Limitaciones y advertencias

- El entrenamiento se realizo con solo 12 imagenes, lo que puede provocar sobreajuste al personaje y una generalizacion limitada a otros estilos o contextos.
- No se ha verificado la calidad visual real de los checkpoints; la compatibilidad estatica con Runware no garantiza resultados visuales correctos.
- La licencia es "other" y esta sujeta a la licencia del modelo base FLUX.2 Klein, que puede imponer restricciones de uso comercial. Es necesario revisar los terminos de Black Forest Labs antes de usar el modelo en produccion.
- Los derechos sobre las imagenes de entrenamiento no estan documentados; el autor advierte que el uso de los archivos esta sujeto a los derechos aplicables de los datos de entrenamiento.
- No se especifican idiomas soportados; el modelo base FLUX.2 Klein funciona mejor con prompts en ingles, pero no hay garantia para otros idiomas.
- El repositorio no incluye un pipeline de inferencia completo; el usuario debe integrar el LoRA con el modelo base y la libreria Diffusers o Runware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lauradeem/maya-flux2-klein9b-runware-1000step-checkpoints
- Checkpoint paso 200: https://huggingface.co/Lauradeem/maya-flux2-klein9b-runware-1000step-checkpoints/resolve/main/maya_flux2_klein9b_runware_1000step_000000200.safetensors
- Checkpoint paso 400: https://huggingface.co/Lauradeem/maya-flux2-klein9b-runware-1000step-checkpoints/resolve/main/maya_flux2_klein9b_runware_1000step_000000400.safetensors
- Checkpoint paso 600: https://huggingface.co/Lauradeem/maya-flux2-klein9b-runware-1000step-checkpoints/resolve/main/maya_flux2_klein9b_runware_1000step_000000600.safetensors
- Checkpoint paso 800: https://huggingface.co/Lauradeem/maya-flux2-klein9b-runware-1000step-checkpoints/resolve/main/maya_flux2_klein9b_runware_1000step_000000800.safetensors
- Checkpoint paso 1000: https://huggingface.co/Lauradeem/maya-flux2-klein9b-runware-1000step-checkpoints/resolve/main/maya_flux2_klein9b_runware_1000step.safetensors
- Modelo base FLUX.2 Klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Pagina del modelo en Runware: https://runware.ai/models/bfl-flux-2-klein-9b
- Pagina oficial de FLUX.2 Klein: https://bfl.ai/models/flux-2-klein
- Discusion en Civitai: https://civitai.com/models/2322332/flux2-klein
