# mradermacher/InternVL3-1B-Pretrained-GGUF

## Resumen

InternVL3-1B-Pretrained-GGUF es la versión cuantizada en formato GGUF del modelo multimodal InternVL3-1B-Pretrained, desarrollado originalmente por OpenGVLab (Shanghai AI Laboratory) y convertido a GGUF por el usuario mradermacher. InternVL3 es la tercera generación de la familia InternVL, una serie de modelos de visión-lenguaje (VLM) que combinan un codificador visual con un modelo de lenguaje para tareas que requieren comprender tanto imágenes como texto.

Este repositorio concreto ofrece únicamente los pesos en formato GGUF, pensados para su uso con llama.cpp y herramientas compatibles como Ollama o LM Studio, además de un fichero mmproj (proyector multimodal) necesario para procesar imágenes. El modelo base tiene aproximadamente 630 millones de parámetros según los safetensors publicados, lo que lo sitúa en la gama ultraligera de los VLM: puede ejecutarse en hardware de consumo modesto, incluso en CPU.

La relevancia de esta ficha radica en que facilita el despliegue local de un modelo multimodal pequeño y de licencia permisiva (Apache 2.0) sin necesidad de GPU de gama alta, algo útil para prototipos, aplicaciones de borde (edge) y experimentación con visión por computador asistida por lenguaje. No obstante, al tratarse de una versión "Pretrained" (sin ajuste fino de instrucciones), su comportamiento conversacional es limitado en comparación con las variantes Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + modelo de lenguaje); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 629.697.920 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | multilingue (sin listado detallado) |
| Licencia | Apache 2.0 (con license_name "qwen" y enlace a la licencia de Qwen2.5-72B-Instruct en la model card) |
| Formato de pesos | GGUF (con ficheros mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un modelo multimodal de la familia InternVL3, con etiqueta `custom_code` en transformers, lo que indica que requiere codigo personalizado para su carga. InternVL3 combina, en sus variantes conocidas, un codificador visual con un modelo de lenguaje de la familia Qwen (de ahi la referencia a la licencia Qwen en la model card), pero no se dispone en la informacion proporcionada de datos concretos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta version concreta es "Pretrained", es decir, el checkpoint previo al ajuste fino de instrucciones. El repositorio de mradermacher solo contiene la conversion a GGUF del modelo original de OpenGVLab, sin entrenamiento adicional. Las cuantizaciones se han generado con el formato estandar de llama.cpp; los quants con imatrix (mejor calidad a igual tamano) estan en un repositorio separado (`InternVL3-1B-Pretrained-i1-GGUF`).

## Capacidades

- Comprension de imagenes y texto: al incluir el fichero mmproj, el modelo puede procesar entradas multimodales (imagen + prompt textual).
- Generacion de texto a partir de contexto visual: descripcion de imagenes, respuesta a preguntas sobre el contenido visual.
- Capacidades multilingues declaradas por el autor (sin listado de idiomas concreto).
- Al ser un modelo "Pretrained", no esta optimizado para seguir instrucciones de forma fiable ni para conversacion multi-turno pulida.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Descripcion automatica de imagenes en local: el modelo puede generar texto descriptivo a partir de una imagen usando llama.cpp con el fichero mmproj, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de aplicaciones de vision-lenguaje: por su tamano (~630 M de parametros y quants de 0,5-0,8 GB), permite iterar rapidamente en el diseno de pipelines multimodales antes de escalar a modelos mayores.
- Clasificacion y etiquetado asistido de imagenes: util para generar etiquetas o resumenes textuales de lotes de imagenes en tareas de catalogacion, con la salvedad de que al ser "Pretrained" la calidad puede requerir prompting cuidadoso.
- Educacion e investigacion: sirve como modelo de referencia ligero para estudiar el comportamiento de VLM pequenos y comparar tecnicas de cuantizacion en entornos academicos con hardware limitado.
- Despliegue en dispositivos de borde: al caber en memoria de sistemas con poca RAM/VRAM (quants de menos de 1 GB), es viable en mini-PC, Raspberry Pi de gama alta o portatiles sin GPU dedicada mediante llama.cpp.
- Extraccion de informacion de capturas o documentos escaneados: combinado con prompts adecuados, puede transcribir o resumir contenido visual en flujos de automatizacion sencillos.
- Base para ajuste fino posterior: el checkpoint "Pretrained" puede servir como punto de partida para fine-tuning especifico de dominio, aunque para ello conviene usar los pesos originales en safetensors en lugar de los GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,5 GB (Q2_K, Q3_K_S, IQ4_XS) y 0,8 GB (Q8_0) para los pesos del modelo; el fichero mmproj anade 0,4 GB (Q8_0) o 0,7 GB (f16). En total, menos de 1,5 GB en la configuracion mas completa.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el modelo tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050 Ti en adelante, RTX 3050/4060, etc.), e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otras herramientas compatibles con GGUF; requiere cargar el fichero mmproj para las capacidades multimodales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera baja latencia en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InternVL3-1B-Pretrained (este) | ~630 M | no disponible | Apache 2.0 | GGUF | Version "Pretrained", sin ajuste de instrucciones |
| mradermacher/InternVL3-1B-Pretrained-i1-GGUF | ~630 M | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base, quants de mayor calidad |
| Modelo base OpenGVLab/InternVL3-1B-Pretrained | ~630 M | no disponible | Apache 2.0 | safetensors | Pesos originales, para fine-tuning |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de contexto para comparar con alternativas de otros autores; la comparativa se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- Al ser un checkpoint "Pretrained", no esta alineado para seguir instrucciones de forma fiable; las respuestas pueden ser incoherentes o poco utiles en formato conversacional sin prompting adecuado o fine-tuning.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido incorrecto sobre la imagen o el texto, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni la lista concreta de idiomas soportados; el rendimiento fuera del ingles puede ser desigual.
- Licencia: la model card declara Apache 2.0 pero incluye `license_name: qwen` y un enlace a la licencia de Qwen2.5-72B-Instruct, lo que genera ambiguedad sobre los terminos exactos; conviene revisar la licencia del modelo base antes de uso comercial.
- El repositorio solo contiene pesos GGUF; no incluye codigo de inferencia propio mas alla de la dependencia de transformers con `custom_code`.
- Los quants de menor tamano (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; para produccion se recomienda Q5_K_M o Q8_0.
- No hay garantias de soporte a largo plazo del repositorio (0 likes, 166 descargas en el momento de la consulta).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/InternVL3-1B-Pretrained-GGUF
- Repositorio con quants imatrix: https://huggingface.co/mradermacher/InternVL3-1B-Pretrained-i1-GGUF
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-1B-Pretrained
- Pagina de descargas del autor: https://hf.tst.eu/model#InternVL3-1B-Pretrained-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Licencia referenciada (Qwen2.5-72B-Instruct): https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
