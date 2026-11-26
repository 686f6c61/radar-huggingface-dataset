# procesaur/Orao2

## Resumen

Orao2 es un modelo de lenguaje generativo de aproximadamente 9.000 millones de parametros (8.953.803.264 segun los pesos en safetensors), desarrollado por Mihailo Skoric bajo el identificador `procesaur` y publicado en Hugging Face. Se presenta como un asistente virtual de IA orientado especificamente al serbio (`sr`), con capacidades de razonamiento, lectura, redaccion, resumen, analisis de texto y respuesta a preguntas.

El modelo se construye sobre `procesaur/Orao2-GPT` mediante un ajuste fino supervisado (SFT) sobre un conjunto experimental, y declara estar basado en la arquitectura Qwen3.5 (etiqueta `qwen3_5_text`). Su rasgo diferencial es la extension del vocabulario del tokenizador con 50.000 tokens nuevos para serbio, lo que el autor cifra en una mejora del 30% en velocidad de entrenamiento e inferencia, ademas de un mejor alineamiento con el idioma. Incorpora el tokenizador SRNA, con soporte de transliteracion automatica entre cirilico y latino.

Es relevante por su enfoque en un idioma de bajos recursos como el serbio y por el contexto institucional en el que se enmarca: recursos de la Plataforma Nacional de IA de Serbia (ai.gov.rs), el proyecto TESLA y financiacion del Fondo para la Ciencia. A fecha de la informacion disponible, el repositorio registra 2 descargas y 0 likes, lo que indica una publicacion muy reciente y con escasa adopcion todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3.5 (etiqueta `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | serbio (`sr`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card indica que Orao2 se basa en el modelo `procesaur/Orao2-GPT` y en la arquitectura Qwen3.5, lo que corresponde a un transformer decoder-only para generacion de texto. No se detallan en la informacion disponible el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

El entrenamiento se describe como un ajuste fino supervisado (SFT) sobre un conjunto experimental, usando como datos `HuggingFaceH4/ultrachat_200k` y `OpenDataArena/ODA-Mixture-100k`. No se especifica el volumen total de tokens, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. La innovacion tecnica destacada es la ampliacion del vocabulario del tokenizador con 50.000 tokens nuevos para serbio y el tokenizador SRNA, que soporta transliteracion automatica y trata cirilico y latinico en el mismo espacio vectorial, lo que segun el autor acelera entrenamiento e inferencia en torno a un 30%.

## Capacidades

- Generacion de texto en serbio, con soporte de escritura en cirilico y latinico y transliteracion automatica entre ambos.
- Razonamiento con modo de pensamiento activable (`enable_thinking=True` en la plantilla de chat).
- Respuesta a preguntas (QA) sobre conocimiento general y textos proporcionados.
- Resumen y sintesis de documentos.
- Analisis de texto y redaccion.
- Traduccion (declarada como tag del modelo; no se detallan pares de idiomas).
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistencia conversacional en serbio: el modelo puede mantener dialogos multi-turno mediante su plantilla de chat, adecuado para interfaces de atencion al usuario en serbio donde se requiera alternar cirilico y latinico sin perder coherencia.
- Normalizacion y transliteracion de textos: gracias al tokenizador SRNA, resulta util para pipelines que necesiten convertir documentos entre cirilico y latinico manteniendo el contenido en el mismo espacio de representacion.
- Resumen de documentos administrativos o periodisticos en serbio: el modelo declara capacidad de sintesis y analisis de texto, aplicable a la condensacion de articulos o informes.
- Sistemas de pregunta-respuesta sobre corpus locales: puede emplearse como motor generativo en asistentes de consulta sobre normativa, catalogos o bases documentales en serbio.
- Generacion de contenido redactado en serbio: borradores de articulos, descripciones de producto o comunicaciones internas, con la ventaja de un vocabulario adaptado al idioma.
- Traduccion asistida dentro de flujos editoriales: el modelo esta etiquetado para traduccion, por lo que puede integrarse como primer paso en revisiones humanas de textos entre serbio y otros idiomas (los pares concretos no se detallan).
- Prototipado de asistentes virtuales institucionales: su origen en la Plataforma Nacional de IA de Serbia y el proyecto TESLA lo hace candidato para desplegar asistentes en entornos publicos serbios, siempre que se valide su calidad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.953.803.264 parametros, en precision completa (fp32) se requieren aproximadamente 36 GB; en bf16/fp16, unos 18 GB; en cuantizacion de 8 bits, en torno a 9 GB; en 4 bits, alrededor de 5 GB (estimaciones teoricas a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) suficiente para bf16; GPUs consumer de 8-12 GB solo con cuantizacion.
- Cabe en GPU consumer: si, en tarjetas con 16-24 GB en bf16 y en tarjetas de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: la model card usa `transformers` con `device_map="auto"`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni se ofrecen pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles. El autor afirma una mejora del 30% en velocidad de inferencia atribuida al tokenizador extendido, pero sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Orao2 (procesaur) | ~9B | no disponible | serbio | CC BY-SA 4.0 | safetensors |
| Qwen3.5 (familia base) | no disponible en la informacion | no disponible | multilingue | no disponible en la informacion | no disponible |
| Alternativas de ~9B para idiomas eslavos del sur | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre Orao2 y otras alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para serbio (`sr`); su rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera limitado.
- El ajuste se realizo sobre un conjunto SFT experimental, sin informacion sobre etapas de alineamiento con preferencias (RLHF/DPO), lo que aumenta el riesgo de respuestas inconsistentes o no alineadas.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni benchmarks que permitan acotarlo.
- No se documentan sesgos conocidos, pero al entrenarse sobre `ultrachat_200k` y `ODA-Mixture-100k` puede heredar sesgos de esos corpus.
- La licencia CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial y la redistribucion de modelos ajustados a partir de Orao2.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- El repositorio tiene un tamano de 17,9 GB y solo 2 descargas, sin senales de validacion por parte de la comunidad; conviene tratarlo como modelo en fase temprana.
- La model card incluye un ejemplo de uso que referencia `procesaur/Orao2-GPT` en lugar de `procesaur/Orao2`, lo que puede inducir a error al cargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/procesaur/Orao2
- Modelo base: https://huggingface.co/procesaur/Orao2-GPT
- Tokenizador SRNA: https://huggingface.co/procesaur/Srna_tokenizer
- Perfil del autor: https://huggingface.co/procesaur
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset ODA-Mixture-100k: https://huggingface.co/datasets/OpenDataArena/ODA-Mixture-100k
- Plataforma Nacional de IA de Serbia: https://www.ai.gov.rs
- Proyecto TESLA (RG Fondo de Belgrado): https://tesla.rgf.bg.ac.rs
- Fondo para la Ciencia de Serbia: https://fondzanauku.gov.rs/
