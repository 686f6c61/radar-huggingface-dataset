# mradermacher/AfriqueQwen3.5-9B-50Langs-i1-GGUF

## Resumen

AfriqueQwen3.5-9B-50Langs es un modelo de lenguaje multimodal (texto e imagen) desarrollado por el laboratorio McGill-NLP de la Universidad McGill. Está diseñado para cubrir 50 idiomas africanos, incluyendo lenguas con pocos recursos como el twi, el wolof, el bambara o el kirundi, además de idiomas internacionales como inglés, francés, portugués y árabe. El modelo se basa en la arquitectura Qwen3.5 y ha sido sometido a un proceso de continuación de preentrenamiento (continued pretraining) con datos específicos para estos idiomas, lo que lo convierte en una opción relevante para aplicaciones locales en África y para la investigación en multilingüismo.

La versión aquí descrita, `mradermacher/AfriqueQwen3.5-9B-50Langs-i1-GGUF`, es una cuantización en formato GGUF creada por el usuario mradermacher con el objetivo de facilitar la ejecución en hardware doméstico o de gama media. Este repositorio concreto solo contiene el archivo de calibración `imatrix` (utilizado para generar cuantizaciones de alta calidad), mientras que los archivos de pesos cuantizados completos están disponibles en el repositorio hermano `mradermacher/AfriqueQwen3.5-9B-50Langs-GGUF`. A pesar de ello, la ficha describe el modelo base y su ecosistema de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (basada en transformer multimodal) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 mil millones) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (para generacion de quants); los quants estaticos (Q2_K, Q4_K, Q5_K, etc.) estan en el repositorio hermano |
| Idiomas soportados | 50 idiomas: af, am, ar, en, fr, ha, ig, mg, ny, om, pt, rw, sn, so, st, sw, ti, tn, xh, yo, zu, rn, lg, ts, ln, ee, wo, sg, ak, tw, kbp, bm, nso, fon, ss, tzm, kab, kea, nqo, mos, kmb, knc, dyu, taq, dik, luo, ff, bem, ki, kam, kg, lua |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (archivo imatrix de calibracion; los pesos GGUF completos en el otro repositorio) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Se sabe que esta basado en la familia Qwen3.5, que es una arquitectura transformer multimodal capaz de procesar tanto texto como imagenes (etiqueta `image-text-to-text`). El modelo fue sometido a un proceso de continuent preentrenamiento (continued pretraining) sobre un conjunto de datos multilingue centrado en idiomas africanos, probablemente con tecnicas de adaptacion como LoRA o full fine-tuning, aunque no se especifica.

La cuantizacion realizada por mradermacher utiliza el metodo `imatrix` (importance matrix) para generar pesos de menor precision manteniendo la calidad. Este archivo imatrix se usa como referencia para crear cuantizaciones personalizadas con herramientas como `llama.cpp`. No se mencionan innovaciones tecnicas adicionales ni detalles sobre el dataset de entrenamiento.

## Capacidades

- Generacion de texto en 50 idiomas, con enfasis en idiomas africanos de baja representacion.
- Comprension y generacion de texto en contextos multilingües (mezcla de idiomas).
- Procesamiento multimodal: puede recibir imagenes como entrada y generar texto relacionado (p. ej., descripcion de imagenes o respuesta a preguntas visuales).
- Soporte de conversacion multi-turno (etiqueta `conversational`).
- No se indica soporte explicito de tool calling ni function calling.
- No se indica modo de razonamiento explicito (thinking mode), pero al ser derivado de Qwen3.5 podria heredar capacidades de razonamiento avanzado, aunque no esta confirmado.

## Casos de uso

- **Traduccion automatica entre idiomas africanos**: el modelo puede traducir entre lenguas como el swahili, el hausa, el yoruba o el zulu, y tambien hacia ingles, frances o portugues. Su continuentrenamiento especifico lo hace mas preciso que modelos generales.
- **Asistente local para comunidades rurales**: desplegado en un dispositivo con recursos limitados (con cuantizacion Q4_K_M), puede ofrecer informacion en salud, agricultura o educacion en idiomas locales.
- **Transcripcion y resumen de documentos**: al ser multimodal, puede procesar imagenes de documentos escaneados y extraer texto o resumir su contenido en el idioma local.
- **Generacion de contenido en idiomas minoritarios**: para ONGs o medios locales, el modelo puede redactar noticias, boletines o publicaciones en redes sociales en idiomas como el wolof o el bambara.
- **Sistemas de atencion al cliente**: integrado en un chat, puede gestionar consultas de usuarios que hablan idiomas africanos, usando su contexto de 50 idiomas para responder adecuadamente.
- **Investigacion linguistica**: sirve como herramienta para estudiar similitudes y diferencias entre idiomas africanos, o para crear conjuntos de datos de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo especifico.

## Requisitos de hardware

- **VRAM estimada**: para una cuantizacion Q4_K_M (aprox. 5 GB), se requiere una GPU con al menos 6 GB de VRAM para inferencia en contexto corto. Para Q8, unos 9 GB. Para cuantizaciones mas bajas (Q2_K), unos 3 GB.
- **GPU recomendadas**: GPU de consumo como NVIDIA RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) son suficientes para la mayoria de cuantizaciones. Para despliegue en servidor, una A10 o A100 puede manejar multiples solicitudes.
- **Compatibilidad con GPU consumer**: si, con cuantizaciones adecuadas cabe en GPUs de 8 GB o mas.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llama-cpp-python, vLLM (para modelos GGUF no es lo habitual, pero puede usarse con conversion), o TGI (con adaptaciones).
- **Latencia**: sin datos especificos. En una RTX 4090 con Q4_K_M se espera una velocidad de generacion de 20-40 tokens/segundo, pero no es un valor oficial.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| AfriqueQwen3.5-9B-50Langs (este) | 8.95B | no disponible | 50 idiomas africanos + internacionales | CC-BY-4.0 | GGUF | Multimodal |
| Qwen3.5-9B (general) | 8.95B | no disponible | multilingue (no enfocado en africa) | Apache-2.0 | GGUF/HF | No especializado en idiomas africanos |
| AfriBERTA | ~0.3B | 512 tokens | 11 idiomas africanos | MIT | HF | Modelo encoder, no generativo, mucho menor |
| mT5-base | 580M | 512 tokens | 101 idiomas | Apache-2.0 | HF | Generativo, pero no multimodal y con menos contexto |

No se dispone de datos de rendimiento comparativo para estos modelos en idiomas africanos.

## Limitaciones y advertencias

- **Sesgos**: al estar entrenado con datos de internet, puede heredar sesgos sociales y culturales, especialmente en idiomas con pocos datos disponibles.
- **Alucinaciones**: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en idiomas poco representados.
- **Contexto limitado**: no se conoce la longitud de contexto exacta; si es similar a Qwen3.5, probablemente 32k, pero no esta confirmado. Para documentos largos en idiomas africanos puede ser insuficiente.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribucion, pero es recomendable revisar los terminos del modelo base (McGill-NLP) para asegurar que no hay restricciones adicionales.
- **Calidad de cuantizacion**: el repositorio actual solo contiene el archivo imatrix, no los pesos GGUF completos. Para obtener un modelo ejecutable es necesario descargar los quants del repositorio hermano. La cuantizacion puede degradar el rendimiento en tareas de vision o razonamiento complejo.
- **Falta de documentacion**: no se proporcionan detalles sobre el entrenamiento, los datos usados o el rendimiento, lo que dificulta la evaluacion rigurosa.

## Enlaces

- Repositorio actual (imatrix): [https://huggingface.co/mradermacher/AfriqueQwen3.5-9B-50Langs-i1-GGUF](https://huggingface.co/mradermacher/AfriqueQwen3.5-9B-50Langs-i1-GGUF)
- Repositorio con los quants GGUF estaticos: [https://huggingface.co/mradermacher/AfriqueQwen3.5-9B-50Langs-GGUF](https://huggingface.co/mradermacher/AfriqueQwen3.5-9B-50Langs-GGUF)
- Modelo base (McGill-NLP): [https://huggingface.co/McGill-NLP/AfriqueQwen3.5-9B-50Langs](https://huggingface.co/McGill-NLP/AfriqueQwen3.5-9B-50Langs)
- Página de descarga y resumen: [https://hf.tst.eu/model#AfriqueQwen3.5-9B-50Langs-i1-GGUF](https://hf.tst.eu/model#AfriqueQwen3.5-9B-50Langs-i1-GGUF)
- Referencia de cuantizacion imatrix: [https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
