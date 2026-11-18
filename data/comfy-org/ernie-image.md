# Comfy-Org/ERNIE-Image

## Resumen

ERNIE-Image es un modelo de difusion texto-a-imagen desarrollado originalmente por Baidu y redistribuido por Comfy-Org en un formato de fichero unico (single-file) listo para su uso en ComfyUI. Esta ficha documenta el repositorio `Comfy-Org/ERNIE-Image`, que no es un modelo nuevo sino un reempaquetado de los pesos originales de `baidu/ERNIE-Image` y `baidu/ERNIE-Image-Turbo`, adaptados a la estructura de carpetas y al cargador de ComfyUI. El objetivo del reempaquetado es eliminar la friccion de instalacion: el usuario descarga los safetensors y los coloca en `models/diffusion_models`, `models/text_encoders` y `models/vae`.

El repositorio incluye dos variantes de difusion (la base y la Turbo), un codificador de texto especifico para mejora de prompts (`ernie-image-prompt-enhancer`), un segundo codificador de texto basado en Ministral 3B y el VAE de Flux 2 (`flux2-vae`). Esta composicion sugiere un pipeline de difusion latente con doble codificador de texto: uno especializado en la semantica de ERNIE y otro de proposito general para el acondicionamiento. La licencia declarada es Apache 2.0, lo que facilita el uso comercial sin restricciones adicionales mas alla de las obligatorias de la licencia.

El modelo resulta relevante para desarrolladores que ya trabajan en ComfyUI y quieren incorporar un generador texto-a-imagen de origen Baidu sin pasar por la conversion manual de pesos. Con 132.379 descargas y 196 likes en el momento de la consulta, es una de las redistribuciones de imagen mas populares del catalogo de Comfy-Org. No se dispone de informacion publica sobre el numero de parametros, la arquitectura interna exacta ni los datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion latente texto-a-imagen (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusion; la ventana la fija el codificador de texto, sin dato publico) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el repo no documenta variantes GGUF o FP8) |
| Idiomas soportados | no disponible (el pipeline es texto-a-imagen; el soporte linguistico depende del codificador de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |
| Tamano del repositorio | 47,1 GB |
| Variantes incluidas | ERNIE-Image y ERNIE-Image-Turbo |
| Codificadores de texto | ernie-image-prompt-enhancer y ministral-3-3b |
| VAE | flux2-vae |
| Pipeline | text-to-image |
| Libreria | diffusion-single-file |
| Descargas | 132.379 |
| Likes | 196 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo de difusion (numero de bloques, tipo de atencion, dimension del latente ni estrategia de muestreo). Lo que si se puede inferir del reempaquetado es la topologia del pipeline: un modelo de difusion principal (`ernie-image.safetensors` o `ernie-image-turbo.safetensors`) que opera sobre el espacio latente definido por `flux2-vae.safetensors`, acondicionado por dos codificadores de texto. El primero, `ernie-image-prompt-enhancer`, parece un componente propio de Baidu orientado a reescribir o enriquecer el prompt del usuario antes de la difusion. El segundo, `ministral-3-3b`, es un modelo de lenguaje de 3.000 millones de parametros de la familia Ministral, empleado presumiblemente como codificador de texto de proposito general.

La existencia de una variante Turbo apunta a un modelo destilado o entrenado con pocos pasos de muestreo, habitual en la familia Flux y en modelos recientes de difusion rapida, aunque no se confirma el numero de pasos ni el metodo de destilacion. Tampoco se documentan en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias humanas. Cualquier afirmacion sobre estos puntos seria especulativa y no se incluye.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante el pipeline de difusion.
- Dos modos de inferencia: la variante base `ERNIE-Image` y la variante `ERNIE-Image-Turbo`, orientada a generacion con menos pasos.
- Mejora de prompts integrada mediante el codificador `ernie-image-prompt-enhancer`, que reescribe la entrada del usuario antes de la difusion.
- Acondicionamiento de texto dual: codificador especifico de ERNIE mas un modelo Ministral 3B de proposito general.
- Integracion nativa con ComfyUI mediante workflows oficiales publicados en `Comfy-Org/workflow_templates`.
- Compatibilidad con el ecosistema de nodos de ComfyUI para encadenar preprocesado, postprocesado, upscaling y control de imagen.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, control por pose o referencia visual en la informacion disponible.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: el disenador describe una escena en el nodo de prompt de ComfyUI y obtiene variantes en segundos con la variante Turbo, lo que permite iterar sobre el concepto antes de pasar a produccion.
- Creacion de assets para videojuegos indie: el equipo genera iconos, fondos y texturas de forma masiva mediante workflows por lotes de ComfyUI, aprovechando la licencia Apache 2.0 para distribuir el juego sin restricciones adicionales.
- Marketing y contenido editorial: produccion de imagenes de cabecera para articulos y campanas a partir de briefs textuales, con el codificador `ernie-image-prompt-enhancer` reescribiendo el brief para mejorar la fidelidad semantica.
- Generacion de material didactico: docentes crean ilustraciones de conceptos abstractos (procesos biologicos, diagramas historicos) a partir de descripciones en lenguaje natural, integrando el modelo en un pipeline local de ComfyUI sin dependencia de APIs externas.
- Investigacion en sintesis de imagen: el repositorio sirve como punto de partida reproducible para experimentar con el codificador dual (ERNIE mas Ministral 3B) y medir el impacto del prompt enhancer en la calidad final.
- Automatizacion de catalogos de e-commerce: generacion de imagenes de producto sobre fondos neutros a partir de fichas tecnicas, con postprocesado en el mismo grafo de ComfyUI y exportacion por lotes.
- Pruebas de concepto de difusion en local: al distribuirse en safetensors de fichero unico, el modelo se puede cargar en ComfyUI sin conversion previa, lo que reduce el tiempo de puesta en marcha en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio pesa 47,1 GB e incluye dos variantes de difusion, dos codificadores de texto y un VAE; la huella en VRAM depende de la variante cargada y de la precision, sin cifras publicadas.
- GPU recomendadas: no disponible. Por el tamano del ecosistema Flux 2 y de los codificadores incluidos, es razonable esperar requisitos de gama alta, pero no hay dato confirmado en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. No se documenta si cabe en RTX 4090, RTX 3090 u otras tarjetas de consumo.
- Opciones de despliegue: ComfyUI es el entorno de referencia, con workflows oficiales para las variantes base y Turbo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles. La existencia de la variante Turbo sugiere un modo de generacion acelerada, pero no se publican tiempos por imagen ni pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Comfy-Org/ERNIE-Image | difusion texto-a-imagen | no disponible | no aplica | Apache 2.0 | Hugging Face, ComfyUI | Variantes base y Turbo, codificador dual, VAE Flux 2 |
| baidu/ERNIE-Image | difusion texto-a-imagen | no disponible | no aplica | no disponible en esta ficha | Hugging Face | Repositorio original del que deriva este reempaquetado |
| baidu/ERNIE-Image-Turbo | difusion texto-a-imagen | no disponible | no aplica | no disponible en esta ficha | Hugging Face | Variante acelerada del modelo original |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos originales en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado para ComfyUI, no el modelo original; para detalles de arquitectura, entrenamiento y limitaciones conviene consultar `baidu/ERNIE-Image` y `baidu/ERNIE-Image-Turbo`.
- No se documentan sesgos conocidos, pero todo modelo de difusion entrenado con datos web puede reproducir estereotipos de genero, etnia o profesion; se recomienda auditar las salidas en produccion.
- Riesgo de alucinacion visual: el modelo puede generar detalles plausibles pero incorrectos (texto ilegible en la imagen, anatomia inconsistente, objetos mezclados) especialmente en escenas complejas.
- No se especifican los idiomas soportados por los codificadores de texto; el rendimiento con prompts en castellano no esta verificado en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir correctamente; conviene revisar tambien las licencias de los componentes derivados (Ministral 3B y VAE Flux 2) antes de redistribuir.
- El tamano del repositorio (47,1 GB) implica requisitos de almacenamiento y ancho de banda considerables para la descarga inicial.
- No hay informacion publica sobre latencia, pasos de muestreo recomendados ni resoluciones nativas; estos parametros deben calibrarse empiricamente.
- Al depender de ComfyUI, la version del frontend y de los nodos personalizados puede afectar a la reproducibilidad de los workflows.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/ERNIE-Image
- Modelo original: https://huggingface.co/baidu/ERNIE-Image
- Variante Turbo original: https://huggingface.co/baidu/ERNIE-Image-Turbo
- Workflow Turbo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_ernie_image_turbo.json
- Workflow base: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_ernie_image.json
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
