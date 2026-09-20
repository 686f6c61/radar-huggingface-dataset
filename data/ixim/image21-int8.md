# ixim/Image21-INT8

# ixim/Image21-INT8

## Resumen

Image21-INT8 es una conversion comunitaria del modelo de generacion y edicion de imagenes Qwen/Qwen-Image-2.1 a precision INT8 mediante bitsandbytes. Lo publica el usuario ixim como derivado independiente y no oficial: no lo ha publicado el equipo de Qwen, ni Hugging Face, ni ModelScope. Su objetivo es reducir el peso en disco y el consumo de memoria en inferencia manteniendo la calidad del modelo base en BF16 dentro de lo razonable, algo relevante para equipos que quieren ejecutar generacion de imagenes de gran tamano en una sola GPU de gama alta.

El modelo se distribuye en formato diffusers como pipeline QwenImage21Pipeline, con pesos safetensors y dos ficheros JSON que describen la cuantizacion de cada componente. Los pesos suman 7.116.566.528 parametros y el repositorio ocupa 18,7 GB, frente a los 33,1 GB (GB decimales) del checkpoint BF16 del modelo base. La cuantizacion se aplica con bitsandbytes LLM.int8 y umbral de outliers 6,0 sobre las capas lineales elegibles del transformer de generacion y del codificador de texto Qwen3-VL; el VAE, las normalizaciones, los embeddings, el codificador de vision, la cabeza de salida y las capas de condicionamiento y proyeccion excluidas permanecen en coma flotante.

La relevancia practica del modelo esta en su perfil medido en una RTX 5090: 12,09 GiB de memoria CUDA maxima asignada frente a 19,08 GiB en BF16, y una latencia media de llamada de 20,21 s frente a 26,44 s en BF16 sobre la misma muestra de 14 salidas emparejadas a 1024x1024. El autor advierte explicitamente de que el modelo no esta afinado ni calibrado, de que no es un pipeline W8A8 puro ni una conversion FP8 o GGUF, y de que el menor almacenamiento no implica por si mismo una inferencia mas rapida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; pipeline de difusion (denoising) con transformer de generacion y codificador de texto Qwen3-VL, empaquetado en diffusers como QwenImage21Pipeline |
| Parametros totales | 7.116.566.528 (7,12 mil millones), segun el recuento de safetensors |
| Parametros activos | No disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible (modelo de generacion de imagenes; no se especifica limite de tokens de prompt) |
| Tipos de cuantizacion | bitsandbytes LLM.int8 (INT8) con umbral de outliers 6,0 en las capas lineales elegibles; resto de componentes en coma flotante. No hay GGUF, FP8 ni W8A8 puro |
| Idiomas soportados | en, zh |
| Licencia | other / qwen-research (heredada del modelo base Qwen/Qwen-Image-2.1) |
| Formato de pesos | safetensors (18,7 GB de repositorio) mas dos ficheros JSON de configuracion de cuantizacion por componente |
| Tarea | text-to-image (generacion y edicion de imagenes, incluida transparencia RGBA) |
| Modelo base | Qwen/Qwen-Image-2.1 (revision b3179ad355be050328e483a9dfdd9e60cd62adfa) |
| Relacion con el base | quantized |
| Autoria | ixim (conversion comunitaria, no oficial) |
| Descargas / me gusta | 0 descargas / 1 me gusta en el momento de la consulta |
| Fecha de creacion | 20 de septiembre de 2026 |
| Resoluciones documentadas | 1024x1024 en la evaluacion; receta de edicion a 2048 px |

## Arquitectura y entrenamiento

No se ha realizado ningun entrenamiento ni ajuste fino: Image21-INT8 es una conversion de pesos del checkpoint Qwen-Image-2.1 a INT8. El autor indica que no se uso ningun conjunto de datos de calibracion. La cuantizacion se aplica componente a componente: las capas lineales elegibles del transformer de generacion y del codificador de texto Qwen3-VL usan bitsandbytes LLM.int8 con umbral de outliers 6,0, en un esquema de precision mixta en el que el tratamiento de outliers se hace en coma flotante. Quedan fuera de la cuantizacion el VAE, las normalizaciones, los embeddings, el codificador de vision, la cabeza de salida y determinadas capas de condicionamiento y proyeccion. La cobertura exacta se documenta en dos ficheros JSON incluidos en el repositorio.

El runtime probado por el autor usa Python 3.13, PyTorch 2.10.0+cu128 y una version de Diffusers fijada a un commit concreto, con una RTX 5090 como hardware de referencia. El repositorio incluye un cargador propio (scripts/runtime.py) que carga y descarga secuencialmente los dos componentes INT8 y mueve sus tensores auxiliares durante el offload; el autor senala que llamar solo a enable_model_cpu_offload() deja tensores INT8 residentes en CUDA en ese stack. El pipeline admite parametros como true_cfg_scale y use_kv_cache, y para edicion a 2048 px se indica ajustar conjuntamente width, height y output_resolution y activar el tiling del VAE. Para transparencia se debe usar el formato de prompt RGBA del modelo original y guardar en PNG.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts en ingles y chino, con resolucion evaluada de 1024x1024.
- Edicion de imagenes, incluida la receta de edicion a 2048 px documentada por el autor, con ajuste conjunto de resolucion de entrada y de salida.
- Edicion con multiples referencias: la model card menciona este escenario como no evaluado, lo que implica que la capacidad existe en el pipeline, pero sin resultados publicados.
- Generacion con transparencia (canal alfa / RGBA) usando el formato de prompt del modelo original y guardando en PNG.
- Control de la guia de clasificador sin clasificador mediante true_cfg_scale, con valor 1,0 en el ejemplo de la model card.
- Cache de clave-valor opcional (use_kv_cache) en la llamada de inferencia.
- Carga y descarga secuencial de los componentes INT8 mediante el cargador incluido, pensada para reducir el pico de memoria.
- Soporte de tool calling / function calling: no aplica (modelo de generacion de imagenes).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades de vision, audio o modo thinking propias: no documentadas.

## Casos de uso

- Despliegue en una sola GPU de gama alta: con 12,09 GiB de memoria CUDA maxima asignada en la evaluacion del autor, el modelo permite servir generacion de imagenes de 7,12 mil millones de parametros en una unica tarjeta, sin repartir el modelo entre varias GPU.
- Prototipado rapido de producto grafico: la menor huella en disco (18,7 GB frente a 33,1 GB del BF16) acelera la descarga y el almacenamiento en multiples entornos de desarrollo o en imagenes de contenedor.
- Generacion de ilustraciones con fondo transparente: usando el formato de prompt RGBA y guardando PNG, se pueden producir activos con canal alfa listos para composicion en diseno grafico o interfaces.
- Edicion de imagenes a 2048 px: la receta de edicion documentada permite reemplazar fondos o retocar escenas a resolucion alta, con tiling del VAE para ajustar el consumo de memoria.
- Contenido bilingue en ingles y chino: la combinacion de prompts en en y zh cubre campañas o catalogos dirigidos a esos dos mercados, con el codificador de texto Qwen3-VL sin cuantizar en su totalidad.
- Comparacion de derivados cuantizados: el propio autor publica pares BF16/INT8 con la misma semilla, lo que sirve como material de partida para decidir si la perdida de fidelidad del INT8 es aceptable en un flujo concreto.
- Evaluacion de infraestructura de inferencia: los datos de latencia y memoria publicados permiten estimar coste por imagen y dimensionar nodos antes de invertir en una integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FID, CLIP o OCR) en la informacion disponible. El autor presenta una evaluacion informal propia, no oficial y no ciega, con 14 salidas emparejadas en 7 casos a 1024x1024 sobre una RTX 5090:

| Metrica | BF16 | INT8 |
|---|---:|---:|
| Ficheros de pesos (GB decimales) | 33,116 | 18,632 |
| Latencia media de llamada (s) | 26,44 | 20,21 |
| Memoria CUDA maxima asignada (GiB) | 19,08 | 12,09 |

El autor advierte de que la muestra es pequena, de que corresponde a una unica configuracion de hardware y software, y de que no es una clasificacion estandarizada ni una garantia de calidad, velocidad o memoria. Las diferencias de pixeles miden deriva, no calidad semantica.

## Requisitos de hardware

- Memoria CUDA maxima medida: 12,09 GiB en INT8 y 19,08 GiB en BF16, en el stack probado (PyTorch 2.10.0+cu128 sobre RTX 5090).
- Espacio en disco: 18,7 GB de repositorio en INT8 frente a 33,116 GB de ficheros de pesos en BF16.
- GPU de referencia probada: NVIDIA RTX 5090. No se han evaluado otras GPU, otras arquitecturas de atencion ni otros backends.
- Encaje en GPU de consumo: la unica tarjeta de consumo documentada es la RTX 5090; no hay datos publicados para tarjetas de 24 GB o menos, por lo que no puede confirmarse su encaje con la informacion disponible.
- Software: Python 3.13, PyTorch 2.10.0+cu128, torchvision 0.25.0 y un requirements.txt que fija Diffusers a un commit concreto.
- Despliegue: diffusers con el cargador incluido scripts/runtime.py, que carga y descarga secuencialmente los dos componentes INT8. No se debe recuantizar en tiempo de carga.
- Latencia y throughput: latencia media de llamada de 20,21 s en INT8 y 26,44 s en BF16 sobre la muestra descrita; no se publica throughput agregado.
- Compatibilidad con ComfyUI: no evaluada segun la model card. No aplican vLLM, llama.cpp, Ollama ni TGI, ni existe checkpoint GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Latencia media medida (s) | Memoria CUDA maxima (GiB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ixim/Image21-INT8 | 7.116.566.528 | bitsandbytes LLM.int8, umbral 6,0 | 20,21 | 12,09 | qwen-research (other) | Hugging Face, diffusers |
| Qwen/Qwen-Image-2.1 (BF16, base) | no disponible de forma independiente en esta informacion | Ninguna (BF16) | 26,44 | 19,08 | qwen-research | Hugging Face, diffusers |

No se dispone de informacion sobre otros derivados cuantizados comparables del mismo modelo base, ni sobre alternativas de otros desarrolladores, en los datos proporcionados.

## Limitaciones y advertencias

- Conversion comunitaria: no es una publicacion oficial de Qwen, Hugging Face o ModelScope. El autor lo declara expresamente.
- Sin calibracion ni ajuste fino: no se uso conjunto de datos de calibracion, por lo que la calidad del INT8 depende del umbral de outliers fijado (6,0) y del esquema de precision mixta.
- No es W8A8 puro, ni FP8, ni GGUF: si el flujo de trabajo requiere alguno de esos formatos, este checkpoint no sirve.
- Menor almacenamiento no implica mayor velocidad: la propia model card lo advierte, aunque en su medicion concreta la latencia media resulto inferior en INT8.
- Errores cualitativos observados por el autor en ambos niveles de precision: sobrenitidez y cambio de contraste en la edicion de un jersey a 1024 px, texto de pie de pagina no deseado en un poster en chino, y fallo del reemplazo de fondo de un bosque nevado a 2048 px.
- Evaluacion limitada: 14 salidas emparejadas en 7 casos, con semillas 42 y 123, sobre una unica configuracion de hardware y software. No es un estudio ciego ni incluye FID, CLIP u OCR.
- Escenarios no evaluados: edicion con multiples referencias a escala, otras GPU y backends de atencion, y compatibilidad con ComfyUI.
- Idiomas: solo se declaran en y zh. No se documenta soporte de castellano ni de otros idiomas.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de representacion demografica en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe riesgo de deriva respecto al prompt, artefactos y baja fidelidad en detalles finos (texto, tipografias, manos y estructuras similares) en ambos niveles de precision.
- Restricciones de licencia: la licencia es other / qwen-research. No se detallan los terminos en la informacion disponible; el nombre sugiere un enfoque de uso de investigacion, por lo que cualquier uso comercial debe verificarse contra el fichero LICENSE del repositorio antes de desplegar.
- Operativa: no se deben recuantizar los pesos en tiempo de carga, y llamar solo a enable_model_cpu_offload() deja tensores INT8 residentes en CUDA en el stack probado; hay que usar el cargador incluido.
- Repositorio con 0 descargas y 1 me gusta: no hay validacion independiente por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ixim/Image21-INT8
- Modelo base Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Fichero de licencia del repositorio: https://huggingface.co/ixim/Image21-INT8/blob/main/LICENSE
- Cargador incluido en el repositorio: https://huggingface.co/ixim/Image21-INT8/blob/main/scripts/runtime.py
- Ejemplos de evaluacion emparejada BF16/INT8: https://huggingface.co/ixim/Image21-INT8/tree/main/evaluation
- Resultados de la busqueda web: sin enlaces relevantes para este modelo; los resultados obtenidos corresponden a paginas sobre la estacion de metro Dongjiaotou de Shenzhen y no guardan relacion con la ficha.
