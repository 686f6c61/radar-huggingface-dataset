# Heppygaga/gemma-3-4b-it-GGUF

## Resumen
Gemma 3 4B IT es un modelo multimodal desarrollado por Google DeepMind, publicado bajo licencia abierta Gemma. Forma parte de la familia Gemma 3, construida con la misma investigación y tecnologia que los modelos Gemini. Este repositorio concreto, `Heppygaga/gemma-3-4b-it-GGUF`, es una cuantizacion en formato GGUF del modelo base `google/gemma-3-4b-it`, generada con herramientas de Unsloth, orientada a inferencia local y despliegue en entornos con recursos limitados.

El modelo acepta entradas de texto e imagen y genera texto, con una ventana de contexto de 128.000 tokens para la variante de 4B. Con 3.880.263.168 parametros, esta disenado para ejecutarse en portatiles, estaciones de trabajo y infraestructura propia, democratizando el acceso a modelos multimodales de calidad. Su relevancia actual radica en la combinacion de tamano reducido, contexto largo y capacidades multimodales bajo una licencia que permite uso comercial con condiciones.

La ficha describe tanto las caracteristicas del modelo original de Google como las particularidades de esta distribucion GGUF, incluyendo las limitaciones derivadas de la cuantizacion y la ausencia de datos de benchmarks especificos para esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), no disponible el detalle exacto de capas y atencion |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens de entrada; 8.192 tokens de salida |
| Tipos de cuantizacion | GGUF (el repositorio es una cuantizacion GGUF; no se detallan los niveles concretos en la informacion disponible) |
| Idiomas soportados | Entrenado con contenido en mas de 140 idiomas; la model card de este repositorio declara `en` como idioma |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | GGUF (repo de 69,3 GB con multiples archivos); el modelo base esta en safetensors |
| Resolucion de imagen | 896 x 896, codificada en 256 tokens por imagen |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento
Gemma 3 se basa en una arquitectura transformer multimodal que procesa texto e imagenes. Las imagenes se normalizan a 896 x 896 pixeles y se codifican en 256 tokens cada una, lo que permite incorporar contenido visual dentro de la ventana de contexto de 128.000 tokens. El modelo genera texto con un limite de salida de 8.192 tokens. La informacion disponible no detalla el numero de capas, la configuracion de atencion ni si emplea tecnicas como atencion lineal o decodificacion especulativa.

El entrenamiento del modelo original de 4B utilizo 4 billones (trillions) de tokens, segun la model card de Google. El dataset combina documentos web de multiples fuentes, codigo y contenido en mas de 140 idiomas, lo que proporciona cobertura linguistica amplia y exposicion a estilos y vocabularios diversos. La variante IT (instruction-tuned) incorpora ajuste por instrucciones, aunque la informacion proporcionada no especifica si se emplearon RLHF, DPO u otras tecnicas de alineacion. Esta distribucion GGUF ha sido generada con Unsloth, que ofrece herramientas de cuantizacion y exportacion, pero no se documentan los detalles del proceso de cuantizacion aplicado.

## Capacidades
- Generacion de texto y razonamiento: respuesta a preguntas, resumen, analisis y tareas de razonamiento general.
- Comprension de imagenes: descripcion de contenido visual, respuesta a preguntas sobre imagenes y analisis de documentos escaneados.
- Procesamiento multimodal conjunto: combinacion de texto e imagen en una misma conversacion dentro de la ventana de contexto.
- Soporte multilingue: el modelo base cubre mas de 140 idiomas, aunque la model card de este repositorio declara solo `en`.
- Conversacion multi-turno: pipeline `image-text-to-text` con soporte de dialogos conversacionales.
- Generacion de codigo: el entrenamiento incluye datos de codigo, lo que habilita tareas de programacion y explicacion de codigo.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras modalidades: no disponible; la informacion solo confirma texto e imagen.

## Casos de uso
- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con hasta 128.000 tokens de contexto, lo que permite mantener historiales largos de cliente y documentacion de referencia en la misma ventana sin truncar informacion.
- Analisis de documentos con imagenes: al aceptar imagenes de 896 x 896 y codificarlas en 256 tokens, puede procesar facturas, formularios o capturas de pantalla y extraer informacion estructurada en texto.
- Asistente de accesibilidad: descripcion de imagenes y lectura de contenido visual para usuarios con discapacidad visual, ejecutandose localmente en un portatil gracias al tamano de 4B parametros.
- Generacion y revision de codigo en local: el modelo se ha entrenado con datos de codigo y puede integrarse en entornos de desarrollo sin conexion, preservando la confidencialidad del codigo fuente.
- Resumen de reuniones y documentos largos: con 128.000 tokens de entrada, puede resumir transcripciones extensas o informes de decenas de paginas en una sola pasada.
- Prototipado rapido de aplicaciones multimodales: desarrolladores que necesitan validar un producto que combine texto e imagen pueden desplegar esta version GGUF con llama.cpp u Ollama sin depender de APIs externas.
- Procesamiento por lotes en infraestructura propia: la cuantizacion GGUF reduce los requisitos de memoria, lo que permite ejecutar el modelo en GPUs de consumo y procesar lotes de documentos o imagenes con coste controlado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible para esta version GGUF. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas. Tampoco se proporcionan datos de latencia o throughput para la cuantizacion concreta.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita. Como referencia orientativa, un modelo de 3.880 millones de parametros en cuantizacion de 4 bits requiere aproximadamente 2-3 GB de VRAM solo para los pesos, mas el overhead de contexto y del codificador de vision; en 8 bits, alrededor de 4-5 GB; en 16 bits, unos 8 GB. Estas cifras son estimaciones generales, no datos publicados para este repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, asi como para A100 y H100 en despliegues de mayor volumen.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 8 GB o mas de VRAM en cuantizaciones de 4-8 bits, aunque no se confirma en la documentacion.
- Opciones de despliegue: llama.cpp, Ollama, y exportacion a GGUF mediante Unsloth; el repositorio declara compatibilidad con transformers y endpoints. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 3 4B IT (esta version GGUF) | 3.880 M | 128K entrada / 8K salida | Si (texto e imagen) | Gemma | GGUF |
| Gemma 3 1B IT | no disponible en la informacion | 32K | no disponible | Gemma | no disponible |
| Gemma 3 12B IT | no disponible en la informacion | 128K | Si (texto e imagen) | Gemma | safetensors, GGUF |
| Gemma 3 27B IT | no disponible en la informacion | 128K | Si (texto e imagen) | Gemma | safetensors, GGUF |

La informacion proporcionada solo detalla las variantes de la familia Gemma 3; no se incluyen datos de modelos de otros fabricantes para una comparativa cruzada. Dentro de la familia, el 4B ofrece un equilibrio entre capacidad y requisitos de hardware, con la misma ventana de contexto que las variantes de 12B y 27B pero con menor coste computacional.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; como modelo entrenado con datos web, es previsible que herede sesgos presentes en esos datos.
- Riesgo de alucinacion: no se cuantifica en la documentacion; los modelos de generacion de texto pueden producir contenido factualmente incorrecto, especialmente en tareas de conocimiento especializado.
- Limitaciones de contexto: aunque la entrada admite 128.000 tokens, la salida esta limitada a 8.192 tokens, lo que restringe respuestas muy extensas.
- Limitaciones de idioma: el modelo base cubre mas de 140 idiomas, pero la model card de este repositorio declara unicamente `en`; el rendimiento en castellano no esta verificado para esta distribucion.
- Restricciones de licencia: la licencia Gemma impone terminos de uso de Google, que pueden incluir restricciones para determinados usos comerciales y requieren revisar las condiciones antes de desplegar en produccion.
- Cuantizacion: al ser una version GGUF, puede presentar perdida de calidad respecto al modelo original en safetensors; no se documenta el nivel de cuantizacion ni las metricas de degradacion.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria de la calidad de la cuantizacion.
- Fecha de creacion futura (2026-11-09) en los metadatos, lo que sugiere que los datos del repositorio pueden no ser fiables o estar incompletos.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Heppygaga/gemma-3-4b-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Pagina del modelo Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico de Gemma 3: https://goo.gle/Gemma3Report
- Kit de IA generativa responsable: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3
- Terminos de uso: https://ai.google.dev/gemma/terms
- Coleccion de Unsloth para Gemma 3: https://huggingface.co/collections/unsloth/gemma-3-67d12b7e8816ec6efa7e4e5b
- Guia de Unsloth para ejecutar Gemma 3: https://docs.unsloth.ai/basics/tutorial-how-to-run-gemma-3-effectively
- Blog de Unsloth sobre Gemma 3: https://unsloth.ai/blog/gemma3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Notebooks de Unsloth: https://docs.unsloth.ai/get-started/unsloth-notebooks
