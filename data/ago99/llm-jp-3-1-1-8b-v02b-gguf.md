# ago99/llm-jp-3.1-1.8b-v02b-GGUF

## Resumen

`ago99/llm-jp-3.1-1.8b-v02b-GGUF` es un derivado comunitario afinado del modelo `llm-jp/llm-jp-3.1-1.8b`, desarrollado por el autor independiente ago99. El modelo base fue creado por el Research and Development Center for Large Language Models del National Institute of Informatics (NII) de Japon, y este derivado anade entrenamiento adicional y ajuste con LoRA orientados a mejorar el seguimiento de instrucciones en japones, la concision de las respuestas, la comprension semantica y la estabilidad en generacion de formato medio y largo. No es una version oficial del proyecto LLM-jp.

Se trata de un transformer decoder-only de aproximadamente 1.867 millones de parametros (1.8B) con una longitud de contexto de 4096 tokens y enfocado principalmente al idioma japones, con soporte secundario de ingles. El repositorio distribuye tanto el modelo fusionado en formato Hugging Face (safetensors, recomendado por el autor) como una build GGUF experimental en cuantizacion Q4_K_M con tokenizador UGM.

Su relevancia actual radica en dos aspectos: por un lado, ofrece una alternativa ligera para conversacion e instrucciones en japones en entornos locales con recursos limitados; por otro, documenta con detalle un problema tecnico relevante de conversion de tokenizadores Unigram con byte fallback a formato GGUF, lo que resulta de interes para quien trabaje con pipelines de cuantizacion de modelos japoneses.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de LLM-jp 3.1) |
| Parametros totales | 1.867.614.208 (aproximadamente 1.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); F16 GGUF mencionado en las pruebas; modelo fusionado en safetensors sin cuantizar |
| Idiomas soportados | japones (principal), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado Hugging Face), GGUF (build experimental UGM) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 1.8B parametros heredado de `llm-jp/llm-jp-3.1-1.8b`. Sobre esa base, el autor realizo entrenamiento adicional y ajuste fino con LoRA orientado a cinco objetivos declarados: mejor seguimiento de instrucciones en japones, respuestas japonesas mas concisas, comprension lectora y semantica, estabilidad de respuesta y comportamiento en generacion de formato medio y largo. El adaptador LoRA final de la version v0.2b se fusiono en el modelo afinado v0.2a con escala 1.00. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica mas destacable documentada es la relativa al tokenizador. El tokenizador del modelo base es un Unigram de la libreria `tokenizers` de Hugging Face con byte fallback; su conversion como tokenizador `llama` estandar producia desajustes de tokenizacion (por ejemplo, `なさい / 。` frente a `なさ / い。`). El autor retiro la build GGUF original y publico una conversion corregida basada en UGM con tokenizador `t5` de 99.584 tokens, que reproduce exactamente los IDs del tokenizador de Hugging Face en el prompt de prueba (42 tokens en ambos casos). Esta build corregida requiere un runtime de llama.cpp con el parche de byte fallback UGM aplicado.

## Capacidades

- Generacion de texto en japones con enfasis en respuestas concisas y seguimiento estricto de instrucciones.
- Comprension lectora y semantica de textos en japones.
- Generacion de formato medio y largo con control de longitud (la prueba interna de control de longitud obtuvo 10/10).
- Conversacion multi-turno e instrucciones directas mediante un formato de prompt especifico en japones.
- Soporte secundario de ingles, aunque el foco principal es el japones.
- Respuestas de conocimiento general (la prueba interna de conocimiento obtuvo 257/300).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente conversacional local en japones: el modelo esta disenado para conversacion ligera e instrucciones en japones con 4096 tokens de contexto, adecuado para ejecutarse en equipos de gama consumer con cuantizacion Q4_K_M.
- Respuestas concisas en interfaces de chat: el ajuste prioriza respuestas breves y estables, util para asistentes embebidos donde la latencia y la verbosidad importan.
- Procesamiento de texto japones en pipelines locales: comprension lectora y resumen de documentos cortos o medianos en japones sin depender de APIs externas.
- Prototipado e investigacion sobre tokenizadores: el repositorio documenta el proceso de conversion Unigram a GGUF con byte fallback, util como referencia para quien cuantice modelos japoneses.
- Educacion y experimentacion: modelo ligero y de licencia Apache 2.0 para ensenar fundamentos de fine-tuning, fusion de LoRA y cuantizacion.
- Generacion controlada de longitud: gracias al control de longitud validado internamente, puede emplearse en tareas que requieren respuestas de extension acotada, como resumenes o fichas breves.
- Entornos con recursos limitados: al ser un modelo de 1.8B, permite despliegue en GPU consumer y en CPU con cuantizacion, para tareas de bajo volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la informacion disponible. El autor proporciona unicamente mediciones internas experimentales del modelo fusionado antes de la cuantizacion GGUF:

| Prueba interna | Resultado |
|---|---|
| Stress test | 180 / 200 |
| Knowledge test | 257 / 300 |
| Strict instruction test | 16 / 20 |
| Length control | 10 / 10 |
| Long-form collapse | aproximadamente 1 / 10 |
| Sanity check posterior (10 preguntas) | 9 / 10 |

Estas cifras son mediciones internas del autor y no deben interpretarse como puntuaciones de benchmarks estandarizados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.7 GB en FP16 para los 1.867M de parametros, y en torno a 1.1-1.5 GB en Q4_K_M (estimacion a partir del tamano del modelo, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutar la version cuantizada; para FP16 se recomienda 6-8 GB o mas.
- Cabe en GPU consumer: si, incluidas tarjetas de gama media y baja con cuantizacion Q4_K_M.
- Opciones de despliegue: Transformers (via Hugging Face, opcion recomendada por el autor), llama.cpp con el parche UGM de byte fallback, y text-generation-inference segun las etiquetas del repositorio. La build UGM no es compatible con el runtime estandar de LM Studio probado por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ago99/llm-jp-3.1-1.8b-v02b-GGUF | 1.8B | 4096 | ja, en | Apache 2.0 | Derivado comunitario con LoRA; GGUF UGM experimental |
| llm-jp/llm-jp-3.1-1.8b | 1.8B | no disponible en la informacion | ja, en | Apache 2.0 | Modelo base oficial del NII |
| Otros modelos de ~1.8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion disponible.

## Limitaciones y advertencias

- Modelo pequeno de aproximadamente 1.8B parametros: precision factual limitada en comparacion con modelos mayores.
- Riesgo de alucinacion, especialmente con entidades ficticias o desconocidas; puede generar informacion incorrecta con seguridad.
- Las explicaciones largas pueden contener errores factuales.
- La build GGUF UGM experimental depende de un runtime de llama.cpp con el parche de byte fallback UGM, que no es universal; no es compatible con el runtime estandar de LM Studio probado por el autor.
- El autor recomienda usar el modelo fusionado con Transformers como opcion mas fiable.
- El modelo esta enfocado al japones; el rendimiento en otros idiomas, incluido el ingles, es secundario y no esta cuantificado.
- No debe utilizarse para decisiones medicas, legales, financieras o de seguridad critica.
- Es un derivado no oficial: el proyecto LLM-jp y el NII no respaldan ni certifican este modelo.
- Licencia Apache 2.0, que permite uso comercial, pero el autor declina responsabilidad sobre la idoneidad de las salidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ago99/llm-jp-3.1-1.8b-v02b-GGUF
- Modelo base: https://huggingface.co/llm-jp/llm-jp-3.1-1.8b
