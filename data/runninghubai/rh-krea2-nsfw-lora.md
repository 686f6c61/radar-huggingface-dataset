# RunningHubAI/rh-krea2-nsfw-lora

## Resumen

rh-krea2-nsfw-lora es un adaptador LoRA (Low-Rank Adaptation) para edicion de imagen mediante prompt de texto, publicado por RunningHubAI en Hugging Face. No es un modelo de lenguaje ni un modelo completo: es un fichero de pesos de 27 MiB (`KREA2turboNSFW.safetensors`) que se aplica sobre el modelo base Krea 2 (variante Turbo) para modificar su comportamiento generativo. El repositorio se distribuye con el pipeline `image-text-to-image` y esta pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face.

El modelo esta orientado a contenido para adultos, como indica el tag `not-for-all-audiences` y el sufijo NSFW del nombre. El autor del LoRA original se identifica en la model card mediante un enlace a Civitai, y RunningHub lo redistribuye en su cuenta institucional. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, y su tamano declarado es de 0.0 GB, dato que no concuerda con los 27 MiB del fichero de pesos listado en la propia model card.

La relevancia de esta ficha es acotada: se trata de un adaptador de bajo rango, no de un modelo fundacional, por lo que casi todas las capacidades, limites y requisitos reales dependen del modelo base Krea 2 y del entorno de ejecucion (ComfyUI). La informacion publicada por el autor es muy escasa en cuanto a arquitectura, datos de entrenamiento, licencia y metricas, por lo que buena parte de los campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base Krea 2 (arquitectura del modelo base: no disponible) |
| Parametros totales | no disponible (fichero de pesos de 27 MiB; rango y dimensiones del LoRA no especificados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion/edicion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en un unico fichero `.safetensors`) |
| Idiomas soportados | no disponible (la documentacion se publica en ingles y chino; el idioma de los prompts depende del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`KREA2turboNSFW.safetensors`, 27 MiB) |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como un LoRA de edicion de imagen ("Model Type: LoRA (image edit)") obtenido por fine-tuning a partir de `krea2`. No se publican detalles sobre el rango del adaptador, las capas objetivo, la tasa de aprendizaje, el numero de pasos, el dataset de entrenamiento ni si se aplicaron tecnicas de regularizacion o de destilacion. Tampoco se especifica la arquitectura interna del modelo base Krea 2 (transformer de difusion, UNet u otra), ni su numero de parametros o resolucion nativa.

En consecuencia, no es posible describir innovaciones tecnicas concretas del adaptador. El unico dato objetivo sobre el artefacto es su tamano (27 MiB) y su integracion declarada con ComfyUI, RunningHub y Hugging Face, ademas de un peso recomendado de uso que no se indica en esta ficha concreta (si aparece en otros LoRA de la misma familia, con valores de 1.0 a 1.5). Cualquier afirmacion adicional sobre el entrenamiento seria especulativa.

## Capacidades

- Edicion y generacion de imagenes a partir de texto e imagen de entrada (pipeline `image-text-to-image`), aplicando el estilo y el contenido para adultos que define el adaptador.
- Modificacion del comportamiento del modelo base Krea 2 (variante Turbo) sin reentrenar el modelo completo: el LoRA se combina con los pesos base en tiempo de inferencia.
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA, encadenable con otros nodos de muestreo, upscaling o postprocesado.
- Carga en la plataforma RunningHub, tanto en su interfaz grafica como a traves de su API, segun la documentacion enlazada por el autor.
- Compatibilidad con el ecosistema de Hugging Face para descarga y despliegue local.
- No se documentan capacidades de tool calling, funciones de agente, razonamiento multi-paso, vision comprensiva, audio ni modo de pensamiento: son capacidades ajenas a este tipo de artefacto.
- Capacidades multilingues: no documentadas. El rendimiento con prompts en distintos idiomas depende del codificador de texto del modelo base.

## Casos de uso

- Ilustracion para adultos con control de acceso: el LoRA se aplica sobre Krea 2 en ComfyUI para generar o editar imagenes de caracter adulto dentro de un pipeline que debe incorporar verificacion de edad y cumplimiento normativo. Es adecuado por su naturaleza de adaptador ligero, que permite activarlo o desactivarlo sin cambiar el modelo base.
- Prototipado de estilos en estudios de arte digital: un artista puede cargar y descargar el LoRA en pocos segundos (27 MiB) para comparar variantes estilisticas sobre el mismo modelo base, sin duplicar el almacenamiento del modelo completo.
- Edicion de imagen existente: al usar un pipeline `image-text-to-image`, el adaptador permite partir de una imagen de entrada y modificar atributos concretos mediante prompt, lo que encaja en flujos de retoque asistido.
- Generacion por lotes mediante API: la integracion con la API de RunningHub descrita en la model card permite invocar el modelo desde un servicio externo y automatizar la produccion de imagenes, siempre que la politica de contenido de la plataforma lo permita.
- Investigacion sobre LoRA y personalizacion: por su tamano reducido es un caso practico para estudiar como un adaptador de bajo rango altera la distribucion de salida de un modelo de difusion, y para comparar tecnicas de fusion de pesos.
- Formacion y demostraciones tecnicas: sirve para ilustrar en un curso o taller el ciclo completo de entrenamiento, publicacion y carga de un LoRA en ComfyUI, sin necesidad de infraestructura de GPU de gran escala para mover los pesos del adaptador.
- Curacion de catalogos de modelos: equipos que mantienen repositorios de adaptadores pueden usar este caso como ejemplo de metadatos incompletos (licencia, idioma y dataset ausentes) y de la necesidad de politicas de moderacion en plataformas de distribucion.
- Despliegue en local con control de datos: al poder descargarse desde Hugging Face y ejecutarse en ComfyUI local, es util para entornos donde las imagenes no deben salir de la infraestructura propia, sujeto siempre a la legalidad del contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud con el prompt ni comparaciones con otros adaptadores), y los resultados de busqueda consultados solo describen otros LoRA de la misma familia o tutoriales generales sobre Krea 2 en ComfyUI.

## Requisitos de hardware

- El adaptador en si anade un coste de memoria minimo: 27 MiB de pesos, despreciable frente al modelo base.
- Los requisitos reales de VRAM, GPU y latencia vienen determinados por Krea 2 (variante Turbo) y por la configuracion de ComfyUI; no se dispone de cifras oficiales en la documentacion proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un modelo de generacion de imagen de la familia Krea 2, el fabricante del modelo base o los tutoriales de la comunidad serian la fuente adecuada para consultar requisitos, pero no se aportan datos verificables en esta informacion.
- Viabilidad en GPU de consumo: no disponible. No se puede confirmar ni descartar a partir de los datos publicados.
- Opciones de despliegue: ComfyUI (entorno principal declarado), plataforma RunningHub (interfaz y API) y carga directa desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son servidores de inferencia de modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con otros adaptadores de la misma familia publicados por el mismo autor en Hugging Face. Los datos de rendimiento y licencia de todos ellos son igualmente incompletos, por lo que la comparacion se limita a aspectos descriptivos.

| Modelo | Tipo | Base | Enfoque | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| rh-krea2-nsfw-lora | LoRA de edicion de imagen | krea2 | Contenido para adultos | no disponible | no disponibles |
| rh-krea2-cc-lora-2077732864560553986 | LoRA de edicion de imagen | krea2 | Angulos de camara y estilizado de figura (peso sugerido 1.0-1.5) | no disponible | no disponibles |
| rh-krea2-lora-2094576703594139649 | LoRA de edicion de imagen | krea2 | Figura femenina | no disponible | no disponibles |

Frente a alternativas de otras familias (por ejemplo adaptadores para SDXL u otros modelos de difusion), no se dispone de datos que permitan una comparacion rigurosa de parametros, contexto o rendimiento. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- Contenido para adultos: el repositorio esta marcado como `not-for-all-audiences`. Su uso exige verificacion de edad, cumplimiento de la legislacion aplicable en la jurisdiccion del usuario y respeto de las politicas de las plataformas donde se despliegue.
- Metadatos incompletos: no se declaran licencia, idiomas, dataset de entrenamiento, rango del LoRA ni hiperparametros. Esto impide evaluar la procedencia de los datos y complica el cumplimiento normativo en un entorno comercial.
- Licencia ambigua: la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream, sin nombrarla. No hay confirmacion de que el uso comercial este permitido.
- Riesgo de reproduccion de sesgos del modelo base: al ser un adaptador, hereda los sesgos y limitaciones de Krea 2, incluidos posibles sesgos de representacion en personas, etnias y cuerpos.
- Alucinacion visual: como cualquier modelo generativo de imagen, puede producir anatomia incorrecta, artefactos, texto ilegible y resultados inconsistentes con el prompt.
- Ausencia de validacion por terceros: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes publicadas.
- Incoherencia de metadatos del repositorio: el tamano declarado del repo es 0.0 GB mientras que la model card lista un fichero de 27 MiB, y la fecha de creacion registrada (2026-10-01) resulta anomala. Conviene verificar la integridad de los ficheros antes de integrarlos en un pipeline de produccion.
- Dependencia total del modelo base: sin Krea 2 cargado, el fichero `.safetensors` no es funcional por si solo.
- Riesgo de uso indebido: la combinacion de contenido para adultos y generacion de imagenes a partir de una imagen de entrada exige controles explicitos para evitar la creacion de material no consentido. Cualquier despliegue en produccion deberia incorporar filtros de entrada, registro de auditoria y canales de reporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-nsfw-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2071612764409389057
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Modelo de referencia en Civitai citado por el autor: https://civitai.red/models/2740033/krea2-turbo-nsfw-lora?modelVersionId=3081369
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Catalogo de modelos de RunningHub: https://www.runninghub.ai/models
- Plataforma de entrenamiento de RunningHub: https://www.runninghub.ai/page-model
- Tutorial de Krea 2 en ComfyUI (NextDiffusion): https://www.nextdiffusion.ai/tutorials/krea-2-uncensored-text-to-image-generations-in-comfyui
- LoRA relacionado rh-krea2-cc-lora: https://huggingface.co/RunningHubAI/rh-krea2-cc-lora-2077732864560553986
- LoRA relacionado rh-krea2-lora: https://huggingface.co/RunningHubAI/rh-krea2-lora-2094576703594139649
