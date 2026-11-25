# moonbox-dev/dots.mocr-ONNX

## Resumen

dots.mocr-ONNX es la distribucion en formato ONNX de dots.mocr, un modelo de vision-lenguaje especializado en OCR y analisis de documentos (document parsing) desarrollado por dots-studio. Esta version la publica moonbox-dev y esta pensada para inferencia en dispositivo mediante ONNX Runtime, con soporte para CPU, CUDA y DirectML. El modelo resuelve el problema de extraer texto estructurado de imagenes de paginas y documentos, una tarea critica en digitalizacion, automatizacion de procesos y RAG sobre documentos.

La relevancia de esta variante es que traslada un modelo vision-lenguaje de aproximadamente 9,3 GB de repo a un runtime portable (ONNX) sin perdida de calidad medible: la model card reporta CER (character error rate) del 0,0 % tanto en fp16 como en int8 frente al modelo original en bf16, con texto identico. El coste por pagina reportado es de 0,65 s en CUDA para fp16 y 0,66 s para int8.

El modelo base es dots-studio/dots.mocr, del que esta version es una cuantizacion (relacion `quantized`). La ficha tecnica se limita a los datos publicados en la informacion disponible; los detalles de arquitectura interna, numero de parametros y contexto no estan documentados en la model card de esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-lenguaje, pipeline image-text-to-text; grafos separados de vision, embed y decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 e int8 (dos carpetas independientes) |
| Idiomas soportados | no disponible (la benchmark reporta CER por idioma, pero no enumera los idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`), con tokenizer.json, vocab.json, merges.txt, chat_template.json y pipeline.py |
| Tamano del repositorio | 9,3 GB |
| Runtime | ONNX Runtime (CPU, CUDA, DirectML); mencion a onnxruntime-genai |
| Modelo base | dots-studio/dots.mocr |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. La estructura de artefactos ONNX revela un diseno en tres grafos: `vision.onnx` (codificador de imagen, 2,52 GB en fp16), `embed.onnx` (embeddings, 466,7 MB en fp16) y `decoder.onnx` (decodificador autorregresivo, 3,12 GB en fp16). El pipeline se completa con un `pipeline.py` de 6,4 kB que implementa el preprocesado de imagen, la construccion del prompt, el calculo de posiciones y el bucle de decodificacion.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La model card referencia el identificador arXiv 2603.13032, que corresponderia al paper del modelo base, pero su contenido no se incluye en los datos facilitados. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos y paginas.
- Analisis y parseo de documentos (document parsing) con salida de texto estructurado.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text).
- Inferencia en dispositivo mediante ONNX Runtime con backends CPU, CUDA y DirectML.
- Ejecucion con precision fp16 e int8 manteniendo, segun el autor, texto de salida identico al modelo original en bf16.
- Capacidades multilingues: la benchmark reporta CER por idioma, lo que sugiere soporte de varios idiomas, aunque no se enumeran cuales.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio ni modo thinking.

## Casos de uso

- Digitalizacion masiva de archivos: el modelo procesa paginas escaneadas y devuelve el texto reconocido; con 0,65 s por pagina en CUDA permite lotes de miles de documentos en horas, y la precision int8 (0,66 s por pagina) reduce el peso del decoder a 1,67 GB para servidores con VRAM limitada.
- Extraccion de texto para pipelines RAG: el OCR alimenta un indice vectorial sobre documentacion corporativa; la salida de texto identica al modelo original garantiza que la calidad de recuperacion no se degrada por la conversion a ONNX.
- Automatizacion de back office (facturas, albaranes, formularios): el modelo convierte imagenes de documentos en texto procesable, integrable en flujos de contabilidad o ERP mediante el `pipeline.py` incluido.
- Procesamiento en dispositivo sin conexion: gracias a los backends CPU y DirectML de ONNX Runtime, puede desplegarse en equipos Windows sin GPU dedicada o en estaciones de trabajo con graficas consumer, sin depender de servicios en la nube.
- Cumplimiento y privacidad de datos: al ejecutarse localmente con ONNX Runtime, los documentos no salen de la infraestructura del cliente, lo que encaja en sectores regulados (legal, sanitario, administracion publica).
- Digitalizacion de bibliotecas y hemerotecas: el bajo CER reportado (0,0 % frente al original en la benchmark del autor) lo hace adecuado para proyectos de preservacion documental donde la fidelidad del texto es critica.
- Integracion en aplicaciones de escritorio: el formato ONNX y la licencia MIT permiten empaquetar el modelo dentro de herramientas ofimaticas o visores de documentos con OCR integrado.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la propia model card, que comparan la salida de cada precision ONNX con el modelo original en bf16:

| Precision | CER (idioma 1) | CER (idioma 2) | Comparacion con original (bf16) | Latencia (CUDA) |
|---|---|---|---|---|
| fp16 | 0,0 % | 0,0 % | Texto identico (original 0,0 / 0,0) | 0,65 s por pagina |
| int8 | 0,0 % | 0,0 % | Texto identico | 0,66 s por pagina |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para fp16: los pesos suman aproximadamente 6,1 GB (vision 2,52 GB + decoder 3,12 GB + embed 0,47 GB), por lo que se recomienda al menos 8 GB de VRAM para dejar margen a activaciones y KV cache.
- VRAM estimada para int8: los pesos suman aproximadamente 3,6 GB (vision no cuantizada en el listado + decoder 1,67 GB + embed 0,23 GB); cabe en GPUs consumer con 6-8 GB.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, el modelo encaja en RTX 3060/4060 (8-12 GB), RTX 4090, A100 y H100 sin problema.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM en fp16 y 6 GB o mas en int8.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) y onnxruntime-genai, segun los tags del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,65 s por pagina en fp16 y 0,66 s por pagina en int8 sobre CUDA, segun el autor. No se publican cifras para CPU ni DirectML.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de modelos comparables (parametros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. La unica referencia disponible es el propio modelo base dots-studio/dots.mocr, del que esta variante es una cuantizacion ONNX con salida de texto identica segun el autor.

| Modelo | Formato | Precision | Licencia | Relacion |
|---|---|---|---|---|
| dots-studio/dots.mocr | no disponible | bf16 | no disponible | Modelo base original |
| moonbox-dev/dots.mocr-ONNX | ONNX | fp16 / int8 | MIT | Cuantizacion de este repositorio |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la informacion disponible.
- Riesgo de alucinacion: no evaluado en la documentacion proporcionada; en tareas OCR conviene validar la salida en documentos de baja calidad o layouts complejos.
- La benchmark de CER del autor se limita a dos idiomas y a una comparacion contra el propio original, no contra ground truth humano independiente; el 0,0 % debe interpretarse como equivalencia con el modelo base, no como precision absoluta perfecta.
- No se enumeran los idiomas soportados; el rendimiento fuera de los idiomas evaluados es desconocido.
- Longitud de contexto y limites de resolucion de imagen no documentados.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base dots-studio/dots.mocr, cuya licencia no se detalla en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.
- El despliegue requiere usar el `pipeline.py` incluido para el preprocesado y el bucle de decodificacion; no es un modelo plug-and-play con las APIs estandar de transformers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/dots.mocr-ONNX
- Modelo base: https://huggingface.co/dots-studio/dots.mocr
- Paper referenciado (identificador arXiv en los tags): arxiv:2603.13032 (no se incluye URL verificada en la informacion disponible)
