# Analgirls916/Flux-Uncensored-V2

## Resumen

FLUX Uncensored LoRA v2 es un adaptador LoRA (Low-Rank Adaptation) desarrollado por EnhanceAI y publicado en HuggingFace bajo el repositorio `Analgirls916/Flux-Uncensored-V2`. Se trata de un ajuste fino sobre el modelo base `black-forest-labs/FLUX.1-dev`, un modelo de difusión de texto a imagen de 12.000 millones de parámetros. El objetivo de este LoRA es eliminar las restricciones de contenido del modelo base, permitiendo la generación de imágenes explícitas (NSFW) a partir de prompts en lenguaje natural. La versión v2 mejora la estabilidad, el rendimiento y reduce el tamaño de los pesos con respecto a la versión anterior.

El modelo se distribuye como un archivo `lora.safetensors` que se carga en el pipeline de FLUX.1-dev mediante la librería `diffusers`. No es un modelo autónomo: requiere el modelo base para funcionar. El repositorio tiene un tamaño de 0,7 GB y no registra descargas ni likes en el momento de la consulta. La relevancia actual radica en el creciente interés por modelos de generación de imagen sin filtros de seguridad, aunque su uso conlleva restricciones legales y de licencia importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre FLUX.1-dev (modelo de difusion de texto a imagen) |
| Parametros totales | No disponible (el modelo base FLUX.1-dev tiene ~12.000 millones; el LoRA en si no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica, es texto a imagen) |
| Tipos de cuantizacion | No disponible (el modelo base se recomienda en bfloat16; el LoRA se distribuye en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | creativeml-openrail-m (segun tags de HuggingFace) / flux-1-dev-non-commercial-license (segun la model card) |
| Formato de pesos | safetensors (lora.safetensors) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena sobre el modelo base FLUX.1-dev, que es un modelo de difusion de tipo transformer con arquitectura hibrida que combina bloques de atencion y flujo de rectificacion (rectified flow). El modelo base tiene 12.000 millones de parametros y fue desarrollado por Black Forest Labs. El LoRA no modifica la arquitectura del modelo base; en su lugar, introduce matrices de baja dimension que ajustan los pesos originales para alterar el comportamiento del modelo.

Segun la model card, el entrenamiento se ha realizado para "eliminar las restricciones de contenido" del modelo base, permitiendo la generacion de contenido explicito. No se proporcionan datos sobre el numero de tokens, la composicion del dataset ni si se utilizaron tecnicas como RLHF o DPO. La version v2 incorpora "mejoras de rendimiento", "correcciones de estabilidad" y un "modelo LoRA mas delgado" que reduce el tamano de los pesos sin comprometer la calidad. No se documentan innovaciones tecnicas adicionales mas alla del ajuste fino supervisado con prompts de contenido para adultos.

## Capacidades

- Generacion de imagenes de alta calidad a partir de prompts en lenguaje natural, heredando las capacidades del modelo base FLUX.1-dev.
- Eliminacion de los filtros de contenido del modelo base, permitiendo generar imagenes explicitas (NSFW) cuando se usan palabras desencadenantes como `nsfw`, `naked`, `nude`, `erotic`, `explicit`, entre otras.
- Soporte de image-to-image segun el pipeline indicado en HuggingFace, ademas de text-to-image.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente generativo de imagenes.
- No dispone de capacidades multimodales adicionales (vision, audio, etc.) mas alla de la generacion de imagen a partir de texto.
- El modelo no es autonomo: requiere cargar el LoRA sobre el pipeline de FLUX.1-dev mediante `diffusers` o un software compatible.

## Casos de uso

- Generacion de contenido artistico para adultos: el modelo puede producir ilustraciones y fotografia simulada de caracter explicito a partir de prompts descriptivos. Se usaria cargando el LoRA sobre FLUX.1-dev en un entorno con GPU y generando imagenes en resolucion alta.
- Investigacion sobre mecanismos de seguridad en modelos de difusion: permite estudiar como un ajuste fino de baja dimension puede eludir los filtros de contenido de un modelo base, lo que resulta util para desarrollar tecnicas de deteccion de contenido generado no deseado.
- Personalizacion de modelos de imagen para creadores: artistas y desarrolladores pueden integrar este LoRA en sus pipelines de generacion para experimentar con estilos visuales que el modelo base no permite por defecto.
- Prototipado de herramientas de filtrado y moderacion: dado que el LoRA produce contenido explicito, puede emplearse como caso de prueba para sistemas de clasificacion y moderacion automatica de imagenes generadas.
- Desarrollo de entornos de pruebas para evaluacion de alineacion: los investigadores pueden comparar el comportamiento del modelo base y el modelo ajustado para medir el impacto de los filtros de seguridad.
- Uso educativo en cursos de vision por computador: sirve como ejemplo practico de como los adaptadores LoRA pueden modificar el comportamiento de modelos de difusion sin necesidad de reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos cuantitativos sobre calidad de imagen, FID, CLIP score ni comparaciones con otros modelos similares.

## Requisitos de hardware

- VRAM estimada: el modelo base FLUX.1-dev en bfloat16 requiere aproximadamente 24 GB de VRAM para inferencia. El LoRA anade un coste minimo, por lo que se recomienda disponer de al menos 24 GB.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 (24 GB). En GPUs con menos VRAM, se puede intentar con cuantizacion, pero no se proporcionan datos oficiales.
- No se especifica si cabe en GPU de consumo con cuantizacion de 8 bits; el propio autor solo indica que se recomienda una GPU compatible con CUDA.
- Opciones de despliegue: la model card muestra un ejemplo con `diffusers` y `AutoPipelineForText2Image`. Tambien puede utilizarse en entornos como ComfyUI, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este LoRA con alternativas de la misma categoria. El modelo base FLUX.1-dev tiene una licencia no comercial y esta pensado para uso investigativo. No se conocen datos de otros LoRA "uncensored" para FLUX.1-dev en la informacion proporcionada, por lo que no se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- El modelo esta disenado especificamente para generar contenido explicito (NSFW). Su uso puede infringir los terminos de servicio de plataformas y las regulaciones locales sobre contenido para adultos.
- La licencia es no comercial en la practica, segun la model card que referencia la FLUX-1-dev Non-Commercial License. El tag `creativeml-openrail-m` en HuggingFace contradice esta restriccion, lo que genera ambiguedad legal. Se recomienda revisar la licencia original de FLUX.1-dev antes de cualquier uso.
- El modelo no es autonomo: requiere descargar el modelo base de Black Forest Labs, que tiene sus propias restricciones de acceso y uso.
- El entrenamiento con contenido explicito puede reforzar sesgos de genero, cuerpo o sexualidad no deseados. No se han publicado evaluaciones de sesgos ni de seguridad.
- Existe riesgo de generar contenido no deseado o inapropiado si no se controla el prompt. La model card advierte que el usuario debe cumplir las normas legales y eticas.
- No se proporcionan metricas de calidad, por lo que el rendimiento visual no puede evaluarse objetivamente. El usuario debe probar el modelo por si mismo.
- El repositorio original en HuggingFace pertenece a `Analgirls916`, pero la model card atribuye la autoria a EnhanceAI. Esta discrepancia puede indicar un reupload o una copia no oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Analgirls916/Flux-Uncensored-V2
- Repositorio GitHub (KirbyLulu/Flux-Unc-V2): https://github.com/KirbyLulu/Flux-Unc-V2
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Licencia de FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/main/LICENSE.md
- Sitio de EnhanceAI: https://enhanceai.art
- Comunidad Discord (segun la model card): https://discord.gg/cuCX9qur6f
