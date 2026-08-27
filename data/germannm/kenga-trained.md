# GermannM/Kenga-Trained

## Resumen

Kenga-Trained es un modelo de lenguaje desarrollado por GermannM (Герман Янтарас), creador del lenguaje de programación Kenga y del sistema Z. Se trata de un modelo de texto generativo, distribuido en formato GGUF, que ha sido ajustado sobre un corpus verificado por compilador: cada ejemplo de entrenamiento consiste en un programa escrito en Kenga que fue compilado, ejecutado y validado contra un resultado esperado. Este enfoque busca que el modelo responda de forma directa y factual, en lugar de divagar o analizar la pregunta.

El modelo tiene 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), según los pesos en safetensors, aunque el autor indica "~9B" en la model card. Está orientado principalmente al ruso, con soporte secundario en inglés, y se distribuye como un archivo GGUF cuantizado (Q4_K_M, 4,4 GB) compatible con Ollama, llama.cpp y LM Studio. Su relevancia radica en la propuesta de entrenamiento con verificación automática de la corrección de los datos, una idea interesante para reducir alucinaciones en tareas factuales, aunque su adopción es actualmente nula (0 descargas, 0 likes) y carece de benchmarks estándar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la documentacion) |
| Parametros totales | 7.615.616.512 (dato safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (mencionado en la model card); otros no disponibles |
| Idiomas soportados | ruso (principal), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors tambien presente en el repo) |

## Arquitectura y entrenamiento

La documentacion no detalla la arquitectura interna del modelo (tipo de transformer, numero de capas, atencion, etc.). Se sabe que es un modelo de lenguaje generativo de tipo decoder, ajustado a partir de una base no especificada. En la tabla comparativa del autor se menciona "Qwen 3.5 9B (base)" como uno de los modelos comparados, lo que sugiere que podria estar relacionado con esa familia, pero no se confirma.

El entrenamiento se realizo sobre un corpus denominado "verified-corpus": cada ejemplo es un programa en el lenguaje Kenga que fue compilado, ejecutado y verificado para producir un resultado esperado. Este proceso garantiza que los datos de entrenamiento contienen respuestas factualmente correctas, al menos en el dominio de la programacion. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion. El autor afirma que el modelo "no piensa sobre la pregunta, responde", lo que sugiere un ajuste orientado a respuestas directas y concisas.

## Capacidades

- Generacion de texto en ruso e ingles, con respuestas directas y factuales.
- Resolucion de preguntas de conocimiento general (ejemplos: "Capital de Francia", "Quien escribio Guerra y Paz", "Formula quimica del agua").
- Capacidad limitada de razonamiento logico basico (dias en un año bisiesto).
- No se menciona soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se mencionan capacidades de vision, audio u otras modalidades.
- El modelo esta disenado para ser eficiente en CPU (etiqueta "cpu-friendly") y compatible con Ollama y llama.cpp.

## Casos de uso

- Asistente de preguntas frecuentes en ruso: el modelo puede responder consultas factuales directas en entornos de atencion al cliente, gracias a su entrenamiento con datos verificados y su tendencia a respuestas cortas.
- Educacion y tutoria basica: util para estudiantes que necesitan respuestas rapidas a preguntas de cultura general, matematicas simples o ciencias, sin necesidad de explicaciones extensas.
- Generacion de codigo simple en Kenga: dado que el corpus de entrenamiento consiste en programas Kenga verificados, el modelo puede ayudar a escribir fragmentos de codigo en ese lenguaje, aunque no se ha demostrado su capacidad real.
- Despliegue en entornos con recursos limitados: al ser un GGUF Q4_K_M de 4,4 GB y compatible con CPU, puede ejecutarse en maquinas sin GPU, como servidores modestos o portatiles antiguos, para tareas de generacion de texto.
- Prototipado rapido con Ollama: los desarrolladores pueden integrar el modelo en aplicaciones locales mediante `ollama pull kenga-trained`, ideal para pruebas de concepto o chatbots de demostracion.
- Investigacion sobre entrenamiento con datos verificados: el modelo sirve como caso de estudio para evaluar si el uso de corpus compilados y ejecutados reduce alucinaciones en tareas factuales, comparandolo con modelos de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor presenta una prueba comparativa propia con 10 preguntas y temperatura cero, donde Kenga-Trained obtuvo 8 respuestas correctas, mientras que los otros cuatro modelos (incluido Qwen 3.5 9B) obtuvieron 0. Este resultado no es un benchmark reconocido y carece de validez estadistica, pero se reproduce a continuacion por transparencia:

| Modelo | Correctas | Tiempo |
|---|---|---|
| Kenga-Trained | 8 / 10 | 24,5 s |
| Kenga-Heretic | 0 / 10 | 32,1 s |
| Kenga-Finetuned | 0 / 10 | 58,8 s |
| Kenga (base) | 0 / 10 | 33,6 s |
| Qwen 3.5 9B (base) | 0 / 10 | 45,7 s |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa 4,4 GB, por lo que se necesitan al menos 6 GB de VRAM para cargar el modelo en GPU, considerando overhead del runtime.
- GPU recomendadas: tarjetas consumer con 8 GB o mas, como RTX 3060, RTX 4060, RTX 3070, o superiores. Tambien puede ejecutarse en GPU de datacenter como A10 o A100, aunque no es necesario.
- Compatibilidad con CPU: el modelo esta etiquetado como "cpu-friendly" y puede ejecutarse en CPU con 8-16 GB de RAM, aunque la velocidad sera menor.
- Opciones de despliegue: Ollama, llama.cpp, LM Studio, y transformers con carga de GGUF (via `gguf_file`).
- Latencia y throughput: no se proporcionan datos oficiales. En la prueba del autor, el modelo tardo 24,5 s en responder 10 preguntas en un entorno no especificado, lo que sugiere una latencia media de ~2,5 s por respuesta, probablemente en CPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar Kenga-Trained con modelos de la misma categoria (tamano ~7-9B) en terminos de arquitectura, contexto o rendimiento estandar. Los unicos modelos comparables mencionados son otras variantes de Kenga (base, finetuned, heretic) y Qwen 3.5 9B, pero no se ofrecen especificaciones tecnicas de estos. La comparativa se limita al test propio del autor, ya mostrado en la seccion de benchmarks. Por tanto, la comparativa con alternativas externas se considera no disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: aunque el entrenamiento con datos verificados puede reducir errores factuales, el modelo no esta exento de alucinaciones, especialmente fuera del dominio de programacion Kenga o en temas no cubiertos por el corpus.
- Limitaciones de idioma: el modelo esta optimizado para ruso; su rendimiento en ingles puede ser inferior, y no soporta otros idiomas.
- Contexto limitado: no se especifica la longitud de contexto, lo que impide conocer su capacidad para dialogos largos o documentos extensos.
- Dependencia del corpus Kenga: el entrenamiento se basa en programas Kenga, un lenguaje de programacion de nicho; esto puede limitar la generalizacion a otros dominios.
- Falta de validacion externa: no hay benchmarks publicos ni evaluaciones independientes; el unico resultado proviene del propio autor, con una muestra muy pequena (10 preguntas).
- Adopcion nula: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido probado por la comunidad.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor incluye un "espectral passport" (marcador `6108e4d16400d5e1`) que podria implicar restricciones no estandar, aunque no se detallan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/Kenga-Trained
- Repositorio Kenga-lang: https://github.com/GermannM3/kenga-lang
- Repositorio Z-System: https://github.com/GermannM3/z-system
- Modelo Kenga 1.5B: https://huggingface.co/GermannM/Kenga
- Otros modelos del autor: https://huggingface.co/GermannM/kenga-prophet-m5 y https://huggingface.co/GermannM/kenga-prophet-m5-3
