# iapp/OpenThai2.0-OCR-Markdown-GGUF

## Resumen

OpenThai2.0-OCR-Markdown-GGUF es la distribucion en formato GGUF del modelo OpenThai2.1-OCR-Markdown-20261118, publicado por iapp (iApp Technology). Se trata de un modelo de vision-lenguaje especializado en tareas de OCR y parseo de documentos: recibe como entrada una imagen de una pagina de documento y devuelve su contenido en Markdown, con las tablas convertidas a HTML y las formulas en notacion LaTeX delimitada por `$$...$$`. El modelo esta afinado a partir de NVIDIA Nemotron-3.5-Parse, un modelo de 0,63B de parametros, y esta orientado especificamente a documentos en tailandes e ingles.

La relevancia de esta publicacion esta en el empaquetado: los ficheros GGUF permiten ejecutar el modelo con llama.cpp en un Mac, en CPU o en una GPU de consumo, sin necesidad de PyTorch ni de vLLM. Ademas, la cuantizacion Q8_0 del decodificador ocupa solo 204 MB y, segun las pruebas del autor sobre 30 paginas de desarrollo, produce un Markdown identico al del modelo original en PyTorch en 30 de 30 casos, con un 0,00% de error de caracteres.

Una advertencia importante: la arquitectura del modelo no esta en el llama.cpp oficial, por lo que es necesario compilar un fork especifico mantenido por el autor (`iapp-technology/llama.cpp`, rama `nemotron-parse`). El repositorio ocupa 1,5 GB e incluye el decodificador en Q8_0 y F16, y el codificador de vision en F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en NVIDIA Nemotron-3.5-Parse (decodificador transformer + codificador de vision + neck) |
| Parametros totales | 189.722.624 (aproximadamente 190M; decodificador 192M + codificador de vision y neck 439M segun la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (valor de `-c` usado en los ejemplos de la model card) |
| Tipos de cuantizacion | Q8_0 y F16 para el decodificador; F16 para el mmproj (codificador de vision) |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | openmdw-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema de vision-lenguaje de dos componentes: un codificador de vision con su neck (439M de parametros, distribuido en F16 como `mmproj`) que procesa la imagen de la pagina, y un decodificador de 192M de parametros que genera la secuencia de salida. La salida no es Markdown directo, sino una secuencia de bloques con coordenadas y clases: `<x_..><y_..>text<x_..><y_..><class_..>`, que despues se post-procesa con la libreria `DocumentParser` de NVIDIA para producir el Markdown final, con tablas en HTML y formulas en `$$...$$`.

El modelo es un fine-tune de NVIDIA Nemotron-3.5-Parse (0,63B) sobre datos de documentos tailandeses e ingleses. La model card remite a la ficha del modelo base para los detalles de entrenamiento (composicion del dataset, numero de tokens, si hubo RLHF o DPO), que no se detallan en la informacion disponible para esta distribucion GGUF. El chat template coloca la imagen antes de los tokens de tarea, y los parametros de muestreo por defecto replican los de `DocumentParser` de NVIDIA: temperatura 0,2, top-k 50, top-p 1,0 y penalizacion de repeticion 1,05 sobre 8.760 tokens. La generacion maxima configurada en los ejemplos es de 8.744 tokens nuevos.

## Capacidades

- OCR de documentos: extrae el texto de imagenes de paginas completas en tailandes e ingles.
- Conversion a Markdown: la salida final es Markdown estructurado, con tablas convertidas a HTML y formulas matematicas en notacion LaTeX (`$$...$$`).
- Deteccion de layout: el modelo predice bounding boxes (`predict_bbox`) y clases de bloque (`predict_classes`) ademas del texto.
- Texto dentro de imagenes: el token de tarea `predict_text_in_pic` indica que extrae texto incrustado en figuras.
- Procesamiento de documentos completos: el `DocumentParser` gestiona la paginacion y descarta paginas en blanco, que devuelve vacias.
- Multilingue limitado: solo tailandes e ingles.
- Compatibilidad con endpoints: el repositorio esta etiquetado como `endpoints_compatible` y puede servirse mediante `llama-server` con una API compatible con OpenAI (`/v1`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni modo thinking.

## Casos de uso

- Digitalizacion de archivos administrativos tailandeses: el modelo convierte escaneos de formularios y documentos oficiales en Markdown estructurado, preservando las tablas como HTML, lo que facilita su indexacion posterior en sistemas de busqueda documental.
- Extraccion de contenido de presentaciones y apuntes: segun las pruebas del autor, el modelo se ha validado con diapositivas, silabos y libros de texto en tailandes e ingles, por lo que encaja en la conversion de material docente a formatos reutilizables.
- Procesamiento por lotes en CPU: con un decodificador Q8_0 de 204 MB y un mmproj F16 de 917 MB, el modelo puede ejecutarse en servidores sin GPU, lo que abarata la digitalizacion masiva de fondos documentales.
- Pipeline de ingesta para RAG: el Markdown resultante, con tablas en HTML y formulas en LaTeX, se puede trocear e indexar directamente en un sistema de recuperacion aumentada sin post-procesado adicional complejo.
- Digitalizacion en portatiles Apple Silicon: la model card reporta entre 4,8 y 7,0 segundos por pagina con `llama-server` en un M3 Max con Metal, lo que permite usar el modelo en local en un equipo de sobremesa o portatil de gama alta.
- Extraccion de tablas de informes financieros o tecnicos: la conversion de tablas a HTML conserva la estructura de filas y columnas, util para alimentar hojas de calculo o bases de datos.
- Servicio HTTP compatible con OpenAI: el despliegue con `llama-server` expone un endpoint `/v1` que permite integrar el OCR en aplicaciones existentes que ya hablan el protocolo de OpenAI, con el `DocumentParser` como capa de post-procesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una validacion de calidad de la conversion GGUF frente al modelo en PyTorch (no es un benchmark de la tarea), sobre 30 paginas de desarrollo no vistas durante el entrenamiento:

| Ficheros | Markdown identico a PyTorch | Error de caracteres vs PyTorch | Cortado en el limite de tokens | Bucles |
|---|---|---|---|---|
| Decodificador Q8_0 + mmproj F16 | 30 de 30 | 0,00% | 0 | 0 |
| Decodificador F16 + mmproj F16 | 30 de 30 | 0,00% | 0 | 0 |
| Decodificador F32 + mmproj F32 (no publicado) | 30 de 30 | 0,00% | 0 | 0 |

Notas del autor: la salida cruda en F16, incluidas las coordenadas de las cajas, es identica a la de F32 en todas las paginas; la de Q8_0 difiere en 16 coordenadas de caja en 6 paginas, sin diferencias en el texto, y esas cajas solo aparecen en `doc["blocks"]`, no en el Markdown. En 5 paginas, incluidas algunas redimensionadas, los ficheros F32 reproducen el modelo en PyTorch token a token durante mas de 600 tokens, tanto en CPU como en Metal.

Rendimiento medido por el autor (paginas completas, una a una):

| Maquina | Metodo | Decodificador | Segundos por pagina | De los cuales, codificacion de imagen |
|---|---|---|---|---|
| Apple M3 Max, Metal | llama-server, modelo cargado | Q8_0 | 4,8-7,0 (4 paginas) | no disponible |
| Apple M3 Max, Metal | llama-mtmd-cli, carga incluida | Q8_0 | 7,7 (mediana de 30) | 5,9 |
| Apple M3 Max, Metal | llama-mtmd-cli, carga incluida | F16 | 8,2 (mediana de 30) | 5,9 |
| Apple M3 Max, solo CPU (16 nucleos) | llama-mtmd-... (dato truncado en la informacion disponible) | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: el decodificador Q8_0 ocupa 204 MB y el mmproj F16 917 MB, lo que suma aproximadamente 1,1 GB de pesos; con la cache KV para 16.384 tokens el consumo real es mayor, pero no se publica una cifra exacta de VRAM.
- GPU recomendadas: no se especifican modelos concretos. La model card menciona compilacion con `-DGGML_CUDA=ON` para GPU NVIDIA y Metal en macOS.
- GPU de consumo: por el tamano de los pesos (1,1 GB en Q8_0 + mmproj) cabe holgadamente en cualquier GPU de consumo moderna; el autor no publica pruebas en tarjetas concretas.
- Despliegue: exclusivamente mediante el fork `iapp-technology/llama.cpp` (rama `nemotron-parse`), con los binarios `llama-mtmd-cli` y `llama-server`. No funciona con el llama.cpp oficial, ni con vLLM ni con Ollama en su forma actual. El post-procesado requiere instalar el paquete `nemotron_parse` (sin dependencias de torch) y `httpx`, `Pillow>=12.2,<13`, `numpy` y `beautifulsoup4`.
- Latencia y throughput: en Apple M3 Max con Metal, entre 4,8 y 7,0 segundos por pagina con `llama-server` y decodificador Q8_0; 7,7 segundos de mediana con `llama-mtmd-cli` incluyendo la carga (5,9 de ellos en codificacion de imagen). No se publican datos de throughput en GPU NVIDIA ni en CPU.
- Notas de compilacion: en macOS es necesario instalar cmake (`brew install cmake` o `pip install cmake`) y usar `-DLLAMA_USE_PREBUILT_UI=OFF` para evitar la descarga de la interfaz web del servidor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, el propio modelo se basa en NVIDIA Nemotron-3.5-Parse (0,63B), del que hereda arquitectura y pipeline de post-procesado; la diferencia principal de esta publicacion es el formato GGUF y el soporte de llama.cpp, que el modelo original no ofrece de serie.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OpenThai2.0-OCR-Markdown-GGUF | 189.722.624 | 16.384 | th, en | openmdw-1.1 | GGUF |
| NVIDIA Nemotron-3.5-Parse (modelo base) | 0,63B | no disponible | no disponible | no disponible | no disponible |
| Alternativas de OCR open source | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura linguistica restringida: solo tailandes e ingles; el rendimiento en otros idiomas no esta documentado.
- Dependencia de un fork: la arquitectura no esta en el llama.cpp oficial, por lo que hay que compilar y mantener el fork `iapp-technology/llama.cpp` (rama `nemotron-parse`). Esto complica las actualizaciones y el soporte a largo plazo.
- Post-procesado obligatorio: la salida cruda son bloques con coordenadas y clases; para obtener Markdown hay que usar `DocumentParser` y su pipeline de post-procesado, lo que anade una dependencia de Python en produccion.
- Diferencias de cuantizacion: Q8_0 altera 16 coordenadas de caja en 6 de 30 paginas respecto a F32 (sin cambios en el texto). Si se necesitan cajas exactas, hay que usar F16.
- Parametros de muestreo: `llama-server` lee `repeat_penalty`, no `repetition_penalty` de vLLM; para salida determinista hay que arrancar con `--repeat-penalty 1.0` y pasar `GenerationSettings(temperature=0.0, repetition_penalty=1.0)`. Ademas, `--repeat-last-n -1` desactiva la penalizacion en este fork en lugar de extenderla.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de fidelidad del texto extraido frente al original; la validacion publicada compara la salida GGUF con la del modelo en PyTorch, no con el ground truth de las paginas.
- Licencia: openmdw-1.1 (etiquetada como `other`), con enlace a https://openmdw.ai/license/1-1/. Conviene revisar los terminos antes de un uso comercial, ya que no es una licencia permisiva estandar tipo Apache 2.0 o MIT.
- Paginas en blanco: `DocumentParser` las omite y devuelve resultado vacio, lo que hay que contemplar en los pipelines.
- Sin datos publicos de rendimiento en GPU NVIDIA ni en CPU: las unicas cifras de velocidad son de Apple M3 Max.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/iapp/OpenThai2.0-OCR-Markdown-GGUF
- Modelo base en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Modelo original de NVIDIA: nvidia/Nemotron-3.5-Parse (referenciado en la model card; sin URL directa en la informacion disponible)
- Fork de llama.cpp: https://github.com/iapp-technology/llama.cpp (rama `nemotron-parse`)
- Documentacion de conversion en el fork: `docs/nemotron-parse.md`
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
