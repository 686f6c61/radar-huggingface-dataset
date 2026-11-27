# Lightricks/LTX-2.5-22b-IC-LoRA-Pixel-Spatial-Upscaler

## Resumen

LTX-2.5-22b-IC-LoRA-Pixel-Spatial-Upscaler es un adaptador LoRA de tipo IC-LoRA (In-Context LoRA) desarrollado por Lightricks para su modelo de generacion de video LTX-2.5. Su funcion concreta es el reescalado espacial de video (video-to-video upscaling o super-resolucion), es decir, aumentar la resolucion espacial de un clip existente manteniendo la coherencia temporal y el contenido original. Se distribuye como un unico fichero de difusion (formato `diffusion-single-file`) que se aplica sobre el modelo base LTX-2.5 de 22.000 millones de parametros.

El modelo base sobre el que opera es LTX-2.5, un modelo de difusion para generacion de video de Lightricks. El adaptador no es un modelo autonomo: requiere cargar LTX-2.5 y aplicar este LoRA para habilitar la tarea de upscaling. El repositorio pesa 0,3 GB, lo que confirma que se trata de un adaptador de bajo rango y no de pesos completos.

Es relevante ahora porque el upscaling de video con coherencia temporal es una de las tareas mas demandadas en pipelines de produccion audiovisual, y un IC-LoRA permite anadir esa capacidad sin reentrenar ni duplicar el modelo base. El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo, y la licencia es la LTX-2.x Community License, con implicaciones para uso comercial que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre modelo de difusion de video LTX-2.5 |
| Parametros totales | no disponible (adaptador; modelo base de 22b) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (etiqueta `en` en el repo) |
| Licencia | ltx-2.x-community-license |
| Formato de pesos | diffusion-single-file (fichero unico de difusion) |

## Arquitectura y entrenamiento

El adaptador se presenta como un IC-LoRA, una variante de LoRA pensada para inyectar una tarea condicionada por contexto (en este caso, el par video de baja resolucion / video de alta resolucion) en un modelo de difusion preentrenado. Se aplica sobre LTX-2.5, el modelo de video de 22.000 millones de parametros de Lightricks, y hereda por tanto su arquitectura de difusion subyacente. El repositorio es un fichero unico de 0,3 GB, coherente con un adaptador de bajo rango y no con pesos completos.

No se han publicado en la informacion disponible detalles sobre el numero de tokens o clips de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del adaptador. La etiqueta de pipeline es `video-to-video` y la tarea declarada es `upscaling` / `super-resolution` / `spatial-upscaler`.

## Capacidades

- Reescalado espacial de video (super-resolucion) manteniendo el contenido y la coherencia temporal del clip de entrada.
- Operacion video-to-video: toma un video de entrada y genera una version de mayor resolucion espacial.
- Integracion como adaptador sobre LTX-2.5: no funciona de forma autonoma, requiere el modelo base.
- Distribucion en fichero unico de difusion, lo que simplifica la carga en pipelines de difusion.
- Capacidades de tool calling, agentes, razonamiento o multilingues: no aplica (es un modelo de difusion de video, no un LLM).
- Modo thinking, vision o audio: no disponible / no aplica.

## Casos de uso

- Restauracion y mejora de archivo audiovisual: aplicar el adaptador a clips historicos o de baja resolucion para obtener versiones de mayor calidad manteniendo la coherencia temporal entre fotogramas.
- Postproduccion de video generado: escalar clips producidos por LTX-2.5 u otros generadores a resoluciones de entrega superiores antes del montaje final.
- Preparacion de material para plataformas de alta resolucion: subir clips de baja resolucion a 1080p o 4K para publicacion en plataformas que exigen mayor calidad.
- Pipelines de VFX y composicion: usar el upscaling como paso previo a la integracion de elementos generados en planos de mayor resolucion.
- Prototipado rapido con entrega en alta calidad: generar o trabajar con clips ligeros y escalarlos al final del pipeline para ahorrar coste computacional en las etapas intermedias.
- Mejora de material de vigilancia o captura de baja calidad: aumentar la resolucion espacial de grabaciones para inspeccion visual, con las cautelas propias de la super-resolucion (no recupera informacion inexistente).
- Estandarizacion de resoluciones en catalogos de video: normalizar clips de distintas fuentes a una resolucion comun antes de su publicacion o archivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al operar sobre LTX-2.5 (22b), los requisitos vendran determinados por el modelo base y su cuantizacion, no por el adaptador (0,3 GB).
- GPU recomendadas: no disponible. Por el tamano del modelo base, es previsible que requiera GPU de datacenter (A100, H100) o GPUs de consumo de gama alta con cuantizacion, pero no se confirma en la informacion.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repo declara la libreria `diffusion-single-file`; no se detallan frameworks adicionales (vLLM, llama.cpp, Ollama, TGI no aplican a un modelo de difusion de video).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de upscaling de video basados en LoRA sobre modelos de difusion con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Lightricks/LTX-2.5 y su carga previa.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de la descarga.
- Licencia LTX-2.x Community License: revisar las condiciones antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- La super-resolucion no recupera informacion que no existe en la entrada; puede generar detalles plausibles pero no reales (riesgo de artefactos o alucinacion visual).
- No se dispone de informacion sobre sesgos, limitaciones de idioma, resoluciones maximas soportadas ni longitud de clip soportada.
- No se han publicado benchmarks que permitan validar la calidad del upscaling frente a alternativas.
- Al ser un adaptador IC-LoRA, su comportamiento depende de la version concreta del modelo base; cambios en LTX-2.5 pueden afectar a la compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Pixel-Spatial-Upscaler
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
