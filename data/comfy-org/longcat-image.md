# Comfy-Org/LongCat-Image

## Resumen

LongCat-Image es un modelo de difusion para generacion y edicion de imagenes desarrollado por Meituan, empaquetado y redistribuido por Comfy-Org en formato de fichero unico (`diffusion-single-file`) para su uso directo en ComfyUI. El repositorio que nos ocupa no contiene el modelo original, sino una conversion de los pesos a `safetensors` en precision bf16, lista para colocarse en el directorio `models/diffusion_models/` de una instalacion de ComfyUI. El autor del modelo base es Meituan (organizacion `meituan-longcat`), mientras que Comfy-Org se limita a la redistribucion y al mantenimiento de los workflows de referencia.

El repositorio agrupa tres variantes: `longcat_image_bf16.safetensors` para generacion texto-a-imagen, `longcat_image_edit_bf16.safetensors` para edicion de imagenes por instrucciones y `longcat_image_edit_turbo_bf16.safetensors`, una version acelerada de la variante de edicion. Los tres comparten la misma licencia Apache 2.0 del modelo original, lo que permite uso comercial sin restricciones adicionales por parte del redistribuidor.

Su relevancia practica radica en la integracion con ComfyUI: al tratarse de ficheros unicos en bf16, cualquier usuario puede incorporar el modelo a un grafo de nodos sin depender de scripts de conversion ni de la libreria `diffusers`. El repositorio ocupa 37,6 GB y acumula mas de 10.000 descargas, lo que indica una adopcion moderada dentro del ecosistema ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (detalles de la red no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; condicionamiento por prompt de texto) |
| Tipos de cuantizacion | solo se distribuyen pesos en bf16; no se listan variantes cuantizadas en el repositorio |
| Idiomas soportados | no disponibles (prompts de texto; el modelo card no declara cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`diffusion-single-file`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo de difusion: no se especifica si emplea un UNet, un transformer de difusion (DiT) o una variante hibrida, ni se indican el numero de parametros, la resolucion nativa de entrenamiento, el tipo de encoder de texto asociado ni el scheduler recomendado. Tampoco se documentan el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable en el mismo sentido que en modelos de lenguaje) ni tecnicas de destilacion o aceleracion, salvo la existencia de una variante Turbo en el modelo base, que sugiere un proceso de destilacion para reducir el numero de pasos de muestreo.

Lo unico verificable desde el repositorio es el empaquetado: los pesos se han convertido a `safetensors` en bf16 y se han dispuesto como ficheros unicos consumibles por ComfyUI. Las tres variantes (generacion, edicion y edicion Turbo) se distribuyen por separado, de modo que el usuario elige el fichero segun la tarea. Para conocer la arquitectura, los datos de entrenamiento y las innovaciones tecnicas del modelo original es necesario consultar los repositorios de `meituan-longcat/LongCat-Image`, `LongCat-Image-Edit` y `LongCat-Image-Edit-Turbo`, que no forman parte de la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de prompts de texto mediante la variante `longcat_image_bf16.safetensors`.
- Edicion de imagenes guiada por instrucciones mediante `longcat_image_edit_bf16.safetensors`.
- Edicion acelerada de imagenes con `longcat_image_edit_turbo_bf16.safetensors`, orientada a reducir el coste de muestreo.
- Integracion nativa con ComfyUI como fichero de modelo de difusion en `models/diffusion_models/`.
- Ejecucion dentro de grafos de nodos de ComfyUI, lo que permite encadenar el modelo con encoders de texto, VAEs, samplers y postprocesado.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio, video ni vision comprensiva; se trata de un modelo generativo de imagen, no de un modelo multimodal conversacional.

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: la variante texto-a-imagen permite producir bocetos visuales a partir de descripciones textuales dentro de un flujo de ComfyUI, acelerando la iteracion de diseño antes de encargar arte final.
- Edicion localizada de imagenes en estudio: con la variante de edicion se pueden aplicar instrucciones sobre una imagen existente para modificar elementos concretos sin rehacer la composicion completa, lo que encaja en flujos de retoque y variaciones de campana.
- Creacion de variaciones de assets para marketing: el modelo puede generar multiples versiones de una misma idea a partir de prompts ajustados, y el grafo de ComfyUI permite automatizar lotes con semillas y parametros distintos.
- Iteracion rapida en produccion con la variante Turbo: cuando el coste por imagen o el tiempo de respuesta es critico, la version Turbo de edicion reduce el numero de pasos de muestreo y hace viable la generacion en bucles de previsualizacion.
- Automatizacion de pipelines de contenido en ComfyUI: al ser ficheros unicos en `safetensors`, se pueden orquestar mediante la API de ComfyUI para generar imagenes bajo demanda desde un backend, integrándolas en un CMS o en un sistema de publicacion.
- Experimentacion e investigacion en difusion: el formato abierto y la licencia Apache 2.0 permiten usar los pesos como base para fine-tuning, evaluacion comparativa de samplers o estudios de edicion por instrucciones sin restricciones de licencia.
- Educacion y demostraciones: la instalacion en ComfyUI es directa (copiar el fichero a la carpeta de modelos), lo que facilita talleres y demos sin configurar entornos de `diffusers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio completo ocupa 37,6 GB y los pesos se distribuyen en bf16; el fichero individual debe cargarse completo en memoria de GPU o descargarse por capas a RAM/VRAM segun el backend, por lo que se requiere una GPU con capacidad suficiente para el fichero elegido mas el encoder de texto y el VAE.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del empaquetado, el uso en GPUs de consumo exige verificar la VRAM disponible frente al tamano del fichero bf16; no se confirma que quepa en tarjetas de 8, 12 o 16 GB.
- Cabe en GPU de consumo: no confirmado; depende del tamano real del fichero bf16 y del soporte de offloading del backend.
- Opciones de despliegue: ComfyUI (soporte nativo, con workflows oficiales de Comfy-Org); otros backends no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card del repositorio redistribuido es minima: no documenta arquitectura, datos de entrenamiento, resolucion nativa ni parametros de muestreo recomendados.
- No se declaran los idiomas soportados en los prompts; el rendimiento multilingue es desconocido.
- Riesgo de sesgos y de alucinacion visual (artefactos, incoherencias anatomicas o de texto en la imagen) no cuantificado por el autor en esta ficha.
- Solo se distribuyen pesos en bf16; no hay variantes cuantizadas oficiales en este repositorio, lo que limita el despliegue en hardware con poca VRAM.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo original en `meituan-longcat/LongCat-Image` y derivados, ya que este repositorio es una redistribucion.
- El repositorio incluye tres variantes con nombres similares; colocar el fichero equivocado en `diffusion_models/` o emparejarlo con un workflow inadecuado provoca fallos de carga.
- No se proporcionan garantias de soporte ni actualizaciones por parte de Comfy-Org mas alla del repackage.

## Enlaces

- Repositorio redistribuido: https://huggingface.co/Comfy-Org/LongCat-Image
- Modelo original texto-a-imagen: https://huggingface.co/meituan-longcat/LongCat-Image
- Modelo original de edicion: https://huggingface.co/meituan-longcat/LongCat-Image-Edit
- Modelo original de edicion Turbo: https://huggingface.co/meituan-longcat/LongCat-Image-Edit-Turbo
- Workflow texto-a-imagen para ComfyUI: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_longcat_text_to_image.json
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
