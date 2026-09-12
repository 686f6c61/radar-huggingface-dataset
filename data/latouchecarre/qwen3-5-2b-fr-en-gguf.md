# LaToucheCarre/Qwen3.5-2B-FR-EN-GGUF

## Resumen

LaToucheCarre/Qwen3.5-2B-FR-EN-GGUF es una cuantizacion GGUF derivada de Qwen/Qwen3.5-2B (Qwen Team, Alibaba Cloud), publicada por el usuario LaToucheCarre. No se trata de un reentrenamiento ni de un ajuste fino: el autor parte de la cuantizacion IQ3_XXS de bartowski (bartowski/Qwen_Qwen3.5-2B-GGUF) y elimina unicamente las filas de la matriz de embeddings correspondientes a tokens no necesarios para frances e ingles. El resto de pesos y la cuantizacion original permanecen intactos.

El objetivo es puramente de despliegue: reducir el tamano del fichero y el vocabulario efectivo para poder ejecutar el modelo completamente en dispositivo (llama.cpp sobre CPU) dentro de un teclado Android llamado La Touche Carre, orientado a correccion de texto en frances e ingles. El fichero resultante, qwen3.5-2b-iq3xxs-fren.gguf, ocupa 895.923.904 bytes (aproximadamente 0,83 GiB) con hash SHA-256 0098a0f275bd8d7a732018373b850553858e1ebc516976564268e33c9a0520ca.

El interes de esta ficha es acotado pero claro: es un ejemplo de poda de vocabulario sobre un GGUF ya cuantizado, una tecnica poco documentada que permite ganar unos cientos de MB en el espacio de embeddings a costa de destruir la cobertura multilingue fuera de fr/en. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye model card extendida ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo base: Qwen/Qwen3.5-2B) |
| Parametros totales | 1.710.678.336 (dato real de safetensors del modelo base) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ3_XXS (unica publicada en este repo, fichero GGUF de 895.923.904 bytes) |
| Idiomas soportados | Frances (fr) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); tambien etiquetado como compatible con endpoints |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.5-2B en los datos proporcionados: no se detalla si es un transformer denso, un modelo con atencion lineal, ni la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF, DPO u optimizacion posterior. Tampoco se documenta la longitud de contexto nativa.

La innovacion de esta publicacion concreta no esta en el entrenamiento sino en el posprocesado del fichero GGUF. Partiendo de la cuantizacion IQ3_XXS de bartowski, el autor elimina las filas del tensor de embeddings asociadas a tokens inutiles para frances e ingles, reduciendo el vocabulario efectivo y, con ello, el tamano del fichero. Los tags del repositorio incluyen «imatrix», lo que sugiere que la cuantizacion de origen se genero con una matriz de importancia (importance matrix) de llama.cpp, aunque este extremo no se detalla en la model card. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras tecnicas de inferencia aplicadas.

## Capacidades

- Generacion de texto conversacional en frances e ingles, con el tag «conversational» en el repositorio.
- Correccion y asistencia de escritura de texto: es el caso de uso declarado por el autor, integrado en el teclado Android La Touche Carre.
- Inferencia completamente local sobre CPU mediante llama.cpp, sin necesidad de GPU ni de conexion a red.
- Cobertura multilingue limitada a frances e ingles; el vocabulario fuera de estos dos idiomas ha sido eliminado del fichero.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Correccion ortografica y gramatical en teclados moviles: el modelo esta disenado para ejecutarse en el propio dispositivo Android mediante llama.cpp sobre CPU, de modo que las pulsaciones del usuario no salen del telefono. El fichero de 0,83 GiB es viable en telefonos de gama media.
- Autocompletado y sugerencia de palabras en frances e ingles: al tener un vocabulario podado especificamente a estos dos idiomas, la decodificacion restringida al vocab resultante es mas rapida y ocupa menos memoria.
- Asistentes de escritura offline en aplicaciones de notas: se puede embeber el GGUF en una app de escritorio o movil para reescribir, resumir o reformular parrafos sin conexion.
- Procesamiento de texto en el borde (edge computing) en dispositivos con recursos limitados: Raspberry Pi, mini-PC o telefonos con 2-4 GB de RAM pueden ejecutar el modelo cuantizado a IQ3_XXS.
- Clasificacion y filtrado de texto en frances/ingles: moderacion de comentarios, etiquetado de intenciones o deteccion de spam en pipelines ligeros donde no se justifica una GPU.
- Prototipado rapido de interfaces conversacionales: al ser un GGUF compatible con llama.cpp, se puede levantar un endpoint local con llama-server y probar un chatbot en fr/en sin coste de API.
- Traduccion frances-ingles de frases cortas: aunque no es su proposito declarado, el modelo base cubre ambos idiomas y la eliminacion de vocabulario no afecta a estos dos.
- Educacion y practica de idiomas: generacion de ejercicios o correcciones en frances para estudiantes, ejecutandose en un portatil sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y la busqueda web asociada no devolvio resultados tecnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para los pesos: aproximadamente 0,84 GiB segun el tamano real del fichero GGUF (895.923.904 bytes). Es una estimacion derivada del fichero, no un dato publicado por el autor.
- Memoria total en inferencia: con cache KV para contextos cortos, se puede asumir de forma orientativa un rango de 1 a 1,5 GiB; no hay cifras oficiales de consumo.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien es viable en iGPU (Intel Iris Xe, AMD Radeon integrada) y en Apple Silicon.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos ocho anos, y tambien en CPU pura.
- Despliegue: llama.cpp (llama-cli, llama-server), Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en su flujo estandar. El repositorio incluye el tag «endpoints_compatible».
- Latencia y throughput: no disponibles. El autor indica uso sobre CPU en un teclado Android, lo que sugiere requisitos de latencia muy bajos, pero no publica tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / tamano | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LaToucheCarre/Qwen3.5-2B-FR-EN-GGUF | 1.710.678.336 | IQ3_XXS, 0,83 GiB | fr, en | Apache-2.0 | Vocabulario podado; 0 descargas |
| Qwen/Qwen3.5-2B (modelo base) | 1.710.678.336 | safetensors, precision original | No disponible | Apache-2.0 | Sin poda de vocabulario; modelo de referencia |
| bartowski/Qwen_Qwen3.5-2B-GGUF | 1.710.678.336 | Multiples cuantizaciones, incluida IQ3_XXS | No disponible | Apache-2.0 | Origen directo del fichero podado; conserva el vocabulario completo |
| Qwen2.5-1.5B-Instruct (GGUF) | ~1.540.000.000 | Multiples cuantizaciones | Multilingue amplio | Apache-2.0 | Alternativa de tamano similar si se necesita cobertura fuera de fr/en; contexto, rendimiento y disponibilidad no verificados en la informacion disponible |

## Limitaciones y advertencias

- La poda del vocabulario es irreversible en este fichero: cualquier token fuera de frances e ingles ha sido eliminado del tensor de embeddings, por lo que el modelo no puede procesar ni generar texto en otros idiomas de forma fiable.
- El fichero no es un sustituto directo del GGUF original: la matriz de embeddings tiene una forma distinta, de modo que herramientas que asuman el vocabulario estandar de Qwen3.5-2B pueden fallar. Hay que usar el tokenizer asociado al fichero podado.
- No hay resultados de evaluacion publicados: se desconoce el impacto real de la poda en la perplejidad y en la calidad de las correcciones, aunque teoricamente solo afecta a tokens no usados en fr/en.
- Riesgo de alucinacion: no cuantificado por el autor. Un modelo de 1,7 mil millones de parametros tiene una capacidad limitada de razonamiento factual y puede generar contenido incorrecto con seguridad aparente.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de toxicidad. Al derivar de Qwen3.5-2B, hereda los sesgos de sus datos de entrenamiento, que no se detallan.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion a Qwen Team (Alibaba Cloud). No impone restricciones adicionales conocidas.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, no hay model card extendida ni proceso de validacion por parte de la comunidad. Para produccion conviene verificar el SHA-256 publicado y evaluar el modelo con datos propios.
- Fecha de publicacion inusual en los metadatos (2026-09-11); conviene contrastarla con la fuente original antes de citarla.
- La eleccion de IQ3_XXS implica una perdida de precision notable (entorno a 3 bits por peso). Si la calidad es critica, es preferible una cuantizacion superior aunque ocupe mas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LaToucheCarre/Qwen3.5-2B-FR-EN-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Cuantizaciones de origen: https://huggingface.co/bartowski/Qwen_Qwen3.5-2B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se encontraron papers, blogs, demos ni repositorios adicionales en la busqueda web realizada.
