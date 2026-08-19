# ArRENCEAI/LUCKYREN-L1T3-7b-OBLITERATED-GGUF

## Resumen

LUCKYREN-L1T3-7b-OBLITERATED-GGUF es una cuantizacion GGUF del modelo ArRENCEAI/Qwen2.5-7b-Instruct-Obliterated-Improved, desarrollado por ArRENCE AI. Se trata de un modelo de 7.600 millones de parametros basado en Qwen2.5-7B-Instruct al que se ha aplicado la tecnica de *abliteration* (eliminacion de la capa de rechazo o refusal), dando como resultado un modelo "sin censura" orientado a generar narrativas contrarias al discurso mainstream, especialmente teorias conspirativas.

El modelo se presenta como un "clon pequeno" de ArRENCE Unleashed, un sistema mayor con herramientas conectadas, y esta pensado para ejecutarse en local. Segun la model card, concentra su conocimiento en narrativas alternativas a la historia oficial para ofrecer una experiencia de "LLM de teorias conspirativas" ejecutable desde casa. El repositorio contiene exclusivamente pesos en formato GGUF, listos para su uso con llama.cpp, Ollama o LM Studio.

Es importante senalar que el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y que el autor declara explicitamente que se distribuye "unicamente con fines de investigacion y entretenimiento". No se especifica licencia en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Qwen2.5-7B-Instruct, con Grouped Query Attention) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128 K, heredado de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | Varias cuantizaciones GGUF disponibles en el panel del repositorio (no especificadas en la model card) |
| Idiomas soportados | Ingles (segun la model card, "en") |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con 28 capas, atencion por grupos (GQA) y embedding rotatorio (RoPE). Sobre esta base, el autor aplico la tecnica de *abliteration*, que consiste en localizar y anular los vectores de direccion responsables del comportamiento de rechazo (refusal) durante el entrenamiento de instrucciones, de modo que el modelo deja de negarse a responder a peticiones que el modelo original rechazaria.

El modelo base sobre el que se aplica la cuantizacion es ArRENCEAI/Qwen2.5-7b-Instruct-Obliterated-Improved, una version "mejorada" del proceso de ablacion. El autor indica que se utilizo un "conjunto de datos especial" para ajustar el modelo hacia narrativas contrarias al discurso mainstream. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales. La cuantizacion a GGUF permite su ejecucion en hardware de consumo con herramientas como llama.cpp u Ollama.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas multi-turno.
- Generacion de contenido "sin censura": el modelo no aplica filtros de rechazo gracias a la abliteration, por lo que responde a peticiones que modelos alineados rechazarian.
- Especializacion en narrativas conspirativas y contenido contrario al discurso mainstream, segun declara el autor.
- Compatible con pipelines de inferencia local: llama.cpp, Ollama, LM Studio y endpoints compatibles (segun los tags del repositorio).
- No se documentan capacidades de tool calling, function calling, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada: la model card indica unicamente ingles.

## Casos de uso

- Investigacion academica sobre narrativas alternativas: el modelo puede usarse para estudiar como se articulan discursos conspirativos y contrastarlos con fuentes oficiales, en el marco de trabajos de sociologia o comunicacion.
- Analisis de contenido y discurso en medios alternativos: permite generar ejemplos de narrativas tipo "hidden truth" para analisis cualitativo de estructuras argumentativas.
- Escritura creativa y ficcion especulativa: util para autores que exploran generos como la ucronia o el thriller conspirativo, donde se necesitan tramas alternativas a la historia oficial.
- Entretenimiento y roleplay sin restricciones: el modelo puede mantener conversaciones prolongadas en contextos de ficcion o debate sin aplicar filtros de contenido.
- Red teaming y evaluacion de seguridad: investigadores de alineacion pueden usar este modelo como caso de estudio de los efectos de la abliteration en modelos de 7 B, comparando su comportamiento con el modelo original.
- Evaluacion comparativa de modelos "abliterados": permite contrastar el rendimiento y las limitaciones de distintas implementaciones de abliteration sobre la misma base (Qwen2.5-7B-Instruct) en tareas de generacion libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo concreto. Dado que es una cuantizacion GGUF de un modelo derivado de Qwen2.5-7B-Instruct, el rendimiento en tareas generales sera previsiblemente inferior al del modelo original debido a la perdida de precision de la cuantizacion, pero no hay datos medidos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4,5 y 5 GB con cuantizacion Q4_K_M; entre 7 y 8 GB con Q8_0. El modelo completo en FP16 requiere aproximadamente 15 GB.
- GPU recomendadas: tarjetas consumer con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Con cuantizaciones bajas (Q4_K_M) puede ejecutarse en GPUs de 6 GB.
- Si cabe en consumer GPU: si, en la mayoria de tarjetas de 8 GB o mas con cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF (tambien vLLM con soporte GGUF experimental).
- Latencia y throughput estimados: no disponibles. Dependen de la cuantizacion, la GPU y el backend elegido; en una RTX 4090 con Q4_K_M se puede esperar un throughput del orden de 40-60 tokens/s, pero no hay datos medidos publicados para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica | Licencia | Formato |
|---|---|---|---|---|---|
| ArRENCEAI/LUCKYREN-L1T3-7b-OBLITERATED-GGUF | 7,6 B | 128 K | Abliteration + fine-tune conspirativo | No disponible | GGUF |
| huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2 | 7,6 B | 128 K | Abliteration estandar | Apache 2.0 (herencia Qwen) | Safetensors y GGUF |
| Qwen2.5-7B-Instruct (original) | 7,6 B | 128 K | RLHF + alineacion estandar | Apache 2.0 | Safetensors, GGUF |

La principal diferencia entre LUCKYREN-L1T3 y los otros dos es la orientacion del fine-tune: mientras que los modelos de huihui-ai se limitan a eliminar el rechazo manteniendo las capacidades generales, LUCKYREN-L1T3 incorpora ademas un ajuste especifico hacia narrativas conspirativas. El modelo original de Qwen mantiene la alineacion completa y rechaza contenido potencialmente danino. La licencia del modelo de ArRENCEAI no esta especificada, lo que supone una incertidumbre legal para uso comercial.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ofensivo, inexacto, danino o inapropiado. El propio autor declina toda responsabilidad por su uso.
- Riesgo elevado de alucinacion: al estar orientado a narrativas contrarias al discurso mainstream, es probable que el modelo presente informacion falsa o no verificada como si fuera cierta.
- Sesgo tematico: el fine-tune esta deliberadamente sesgado hacia teorias conspirativas, por lo que no es adecuado para tareas que requieran objetividad o precision factual.
- Licencia no especificada: no se indica bajo que licencia se distribuye, lo que genera incertidumbre juridica para cualquier uso comercial o incluso para redistribucion.
- Idioma limitado: solo se declara soporte para ingles; el rendimiento en otros idiomas no esta garantizado.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no se puede evaluar la calidad del modelo frente a alternativas.
- Proyecto sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- Riesgo legal: el uso del modelo puede violar leyes locales si se emplea para generar contenido difamatorio, incitacion al odio o desinformacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArRENCEAI/LUCKYREN-L1T3-7b-OBLITERATED-GGUF
- Modelo base (safetensors): https://huggingface.co/ArRENCEAI/Qwen2.5-7b-Instruct-Obliterated-Improved
- Organizacion ArRENCE AI en HuggingFace: https://huggingface.co/ArRENCEAI
- GitHub de ArRENCEAI: https://github.com/ArRENCEAI
- Web de ArRENCE AI: https://arrenceai.com
- Chat de ArRENCE AI: https://webblocalai.com
- Referencia de modelo abliterado similar: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2
- Guia de modelos abliterados 2026: https://locallyuncensored.com/blog/abliterated-models-guide.html
