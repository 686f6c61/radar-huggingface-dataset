# fport/gemma-3-4b-tr-alpaca

## Resumen

fport/gemma-3-4b-tr-alpaca es un fine-tune del modelo instruct Gemma 3 4B de Google, adaptado al idioma turco mediante el dataset Alpaca en su versión turca (alpaca-tr). Lo desarrolla Furkan Portakal (fport), un usuario de Hugging Face con actividad en modelos y datasets en turco. El modelo parte de unsloth/gemma-3-4b-it-unsloth-bnb-4bit, una versión cuantizada a 4 bits del Gemma 3 4B IT, y se entrena con la librería Unsloth y el framework TRL de Hugging Face, lo que acelera el entrenamiento y reduce el consumo de memoria.

El modelo hereda las capacidades del Gemma 3 4B: arquitectura transformer multimodal (texto e imágenes), ventana de contexto de 128K tokens y soporte para más de 140 idiomas en su versión base. Sin embargo, este fine-tune está específicamente orientado a seguir instrucciones en turco, lo que lo hace relevante para aplicaciones de generación de texto, asistentes conversacionales y tareas de procesamiento de lenguaje natural en ese idioma. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

Aunque el repositorio no incluye benchmarks ni métricas de evaluación, el modelo se posiciona como una opción ligera (4.3B parámetros) para desplegar en entornos con recursos limitados, manteniendo las capacidades multimodales y de razonamiento del Gemma 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen), basada en Gemma 3 4B |
| Parametros totales | 4.300.079.472 (4,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors; el modelo base fue entrenado desde una version bnb-4bit) |
| Idiomas soportados | Turco (fine-tune especifico); el modelo base soporta 140+ idiomas, pero no se ha verificado el rendimiento en otros idiomas tras el fine-tune |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint unsloth/gemma-3-4b-it-unsloth-bnb-4bit, que a su vez es una version cuantizada a 4 bits (bitsandbytes) del Gemma 3 4B IT de Google. La arquitectura subyacente es un transformer decoder-only multimodal, capaz de procesar tanto texto como imagenes, con atencion por ventanas deslizantes y soporte para multiples imagenes en la entrada. El entrenamiento se realizo con la libreria Unsloth, que optimiza el proceso de fine-tuning mediante kernels de atencion eficientes y reduccion de memoria, y con el framework TRL (Transformers Reinforcement Learning) de Hugging Face, que proporciona utilidades para fine-tuning supervisado (SFT).

El dataset utilizado es el Alpaca en turco (BrewInteractive/alpaca-tr), un conjunto de instrucciones y respuestas generadas a partir del dataset original de Stanford Alpaca, traducido al turco. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. El proceso de fine-tuning se limito a la adaptacion de las instrucciones en turco, manteniendo intactas las capacidades base del modelo.

## Capacidades

- Generacion de texto en turco: responde a instrucciones y preguntas en turco con un estilo conversacional, adaptado al formato Alpaca.
- Razonamiento y conocimiento general: hereda las capacidades de razonamiento, matematicas y conocimiento del modelo base Gemma 3 4B, aunque el fine-tune puede degradar ligeramente el rendimiento en tareas no relacionadas con el turco.
- Procesamiento multimodal: al estar basado en Gemma 3 4B IT, el modelo puede procesar imagenes junto con texto, permitiendo tareas como descripcion de imagenes o respuesta a preguntas visuales (VQA), aunque no se ha verificado el rendimiento tras el fine-tune.
- Soporte de tool calling y function calling: el modelo base Gemma 3 4B IT incluye soporte para llamadas a funciones, pero no se ha confirmado si el fine-tune preserva esta capacidad.
- Capacidades multilingues: el modelo base soporta 140+ idiomas, pero el fine-tune esta enfocado en turco; el rendimiento en otros idiomas puede verse reducido.
- Formato de chat: el modelo usa la plantilla de chat de Gemma 3, con tokens especiales para el usuario y el asistente, compatible con el formato Alpaca.

## Casos de uso

- Asistente conversacional en turco: el modelo puede integrarse en chatbots de atencion al cliente o asistentes virtuales para hablantes de turco, gestionando conversaciones multi-turno con contexto largo gracias a la ventana de 128K tokens.
- Generacion de contenido en turco: redaccion de articulos, resumenes, correos o publicaciones en redes sociales en turco, siguiendo instrucciones en formato Alpaca.
- Traduccion y transcripcion: aunque no esta especializado en traduccion, el modelo base soporta multiples idiomas, por lo que puede utilizarse para traducir texto del turco a otros idiomas o viceversa, con una calidad aceptable.
- Educacion y tutoria: creacion de materiales educativos, explicaciones y ejercicios en turco para estudiantes, aprovechando las capacidades de razonamiento del modelo.
- Procesamiento de documentos con imagenes: al ser multimodal, puede analizar capturas de pantalla, diagramas o fotografias y responder preguntas en turco sobre su contenido, util en soporte tecnico o documentacion.
- Desarrollo de aplicaciones de NLP en turco: como modelo ligero, puede servir como base para tareas de clasificacion, extraccion de informacion o generacion aumentada por recuperacion (RAG) en turco, desplegable en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Dado que es un fine-tune reciente con cero descargas y cero likes, no hay datos de rendimiento verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4,3B parametros. En precision FP16, ocupa aproximadamente 8,6 GB de memoria (tamano del repositorio). Con cuantizacion a 4 bits (como el modelo base), puede reducirse a unos 2,5-3 GB.
- GPU recomendadas: puede ejecutarse en GPUs consumer como RTX 3060 (12 GB), RTX 4070 o RTX 4090. Para inferencia a mayor velocidad, se recomienda una GPU con al menos 16 GB de VRAM (A100, L4, etc.).
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media con 8-12 GB de VRAM si se aplica cuantizacion (GGUF, AWQ, GPTQ).
- Opciones de despliegue: compatible con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), Ollama (mediante importacion) y transformers con bitsandbytes.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un Gemma 3 4B en una RTX 4090 con cuantizacion 4 bits puede generar entre 30 y 60 tokens por segundo, pero esto depende de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| fport/gemma-3-4b-tr-alpaca | 4,3B | 128K | Turco (fine-tune) | Apache 2.0 | Fine-tune de Gemma 3 4B IT sobre Alpaca turco |
| google/gemma-3-4b-it | 4B | 128K | 140+ | Gemma Terms of Use | Modelo base instruct, multimodal, sin fine-tune especifico |
| flas-ai/flas-gemma-3-4b-pt | 4B | 128K | Portugues (fine-tune) | Apache 2.0 | Fine-tune de Gemma 3 4B base (no instruct) sobre Alpaca portugues |
| unsloth/gemma-3-4b-it-unsloth-bnb-4bit | 4B | 128K | 140+ | Gemma Terms of Use | Version cuantizada a 4 bits del modelo base, usada como punto de partida |

La comparativa muestra que este modelo es un fine-tune regional del Gemma 3 4B, similar a otros proyectos como flas-ai/flas-gemma-3-4b-pt. La principal diferencia es que el modelo de fport parte de la version instruct (IT) y se entrena con el dataset Alpaca turco, mientras que el de flas-ai parte de la version base (no instruct) y usa un wrapper Alpaca. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Sesgos y alucinaciones: el modelo base Gemma 3 puede presentar sesgos y alucinaciones, y el fine-tune sobre un dataset generado automaticamente (Alpaca) puede amplificar estos problemas, especialmente en temas de actualidad o informacion factual.
- Degradacion en otros idiomas: al estar fine-tuneado exclusivamente en turco, el rendimiento en otros idiomas puede verse reducido respecto al modelo base, aunque no se ha medido.
- Sin benchmarks verificados: no hay evaluaciones publicadas, por lo que no se puede garantizar la calidad del modelo en tareas especificas.
- Dependencia del dataset Alpaca: el dataset Alpaca turco puede contener errores de traduccion o inconsistencias, lo que afecta a la calidad de las respuestas.
- Limitaciones de contexto: aunque la ventana es de 128K, el fine-tune puede no haber sido entrenado para manejar contextos tan largos de forma optima; se recomienda probar con contextos mas cortos en produccion.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base Gemma 3 esta sujeto a los Terminos de Uso de Gemma de Google, que pueden imponer restricciones adicionales para ciertos usos comerciales. Es necesario revisar ambos documentos.
- Soporte de tool calling no verificado: no se ha confirmado si el fine-tune preserva la capacidad de llamada a funciones del modelo base, por lo que no se recomienda usarlo en agentes que dependan de esta funcionalidad sin pruebas previas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fport/gemma-3-4b-tr-alpaca
- Perfil del autor: https://huggingface.co/fport
- Modelo base (unsloth): https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
- Modelo base original (Google): https://huggingface.co/google/gemma-3-4b-it
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Gemma 3 en Ollama: https://ollama.com/library/gemma3:4b
- Dataset Alpaca turco: https://huggingface.co/datasets/BrewInteractive/alpaca-tr
- Libreria Unsloth: https://github.com/unslothai/unsloth
