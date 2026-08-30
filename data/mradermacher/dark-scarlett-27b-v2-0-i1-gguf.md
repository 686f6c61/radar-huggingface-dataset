# mradermacher/Dark-Scarlett-27B-v2.0-i1-GGUF

## Resumen

Dark-Scarlett-27B-v2.0-i1-GGUF es una cuantización en formato GGUF del modelo Dark-Scarlett-27B-v2.0, desarrollado por ReadyArt y cuantizado por mradermacher. El modelo original está diseñado para tareas de roleplay, conversación e instrucción, con un enfoque en contenido adulto y explícito, tal como indican las etiquetas de la model card (nsfw, adult-content, unaligned, erp). Esta versión GGUF incluye cuantizaciones con matriz de importancia (imatrix) que permiten ejecutar el modelo en hardware de consumo con una pérdida de calidad controlada.

El repositorio contiene únicamente los pesos cuantizados en GGUF, con opciones que van desde 11 GB hasta 15,9 GB, lo que lo hace accesible para GPUs de gama media y alta. El modelo base tiene aproximadamente 27 320 millones de parámetros y está licenciado bajo Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Aunque la model card menciona que se trata de un modelo de visión, en este repositorio no se incluyen los archivos mmproj necesarios para esa funcionalidad, por lo que su uso principal es texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q4_K_S (15,9 GB), ademas de archivo imatrix de 0,1 GB |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre sugiere un tamaño de 27B parametros, pero se desconoce si se trata de un transformer denso, un modelo MoE o una arquitectura hibrida. Tampoco se especifican los datos de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. La unica referencia es que el modelo esta orientado a roleplay y conversacion, con un estilo "unaligned" (sin alineacion restrictiva) y contenido explicito.

La cuantizacion ha sido realizada por mradermacher utilizando la tecnica imatrix, que mejora la calidad de los quantizados de baja precision al ponderar la importancia de cada tensor. Los archivos GGUF son compatibles con llama.cpp y sus derivados (Ollama, LM Studio, etc.), lo que facilita su despliegue local.

## Capacidades

- Generacion de texto conversacional y roleplay: el modelo esta especificamente entrenado para mantener dialogos multi-turno con personalidad y estilo narrativo.
- Instrucciones (instruct): soporta prompts de sistema y sigue instrucciones en formato conversacional.
- Contenido adulto y explicito: al ser un modelo "unaligned", puede generar respuestas con contenido NSFW, erotico o maduro sin filtros restrictivos.
- Multilingue: solo se declara soporte para ingles (en).
- Vision: la model card menciona que es un modelo de vision, pero en este repositorio no se incluyen los archivos mmproj necesarios, por lo que la capacidad visual no esta disponible en esta version GGUF.
- Tool calling / function calling: no se menciona soporte explicito.
- Agentes y multi-step reasoning: no se menciona soporte especifico.

## Casos de uso

- Roleplay interactivo: el modelo puede usarse en aplicaciones de chat para simular personajes ficticios o historias colaborativas, manteniendo coherencia narrativa a lo largo de conversaciones largas.
- Chatbots de entretenimiento para adultos: dado su contenido explicito, puede integrarse en plataformas de ficcion erotica o juegos de rol con tematica madura.
- Asistente conversacional con personalidad: su estilo "unaligned" permite crear asistentes con tono mas libre y menos censurado que los modelos comerciales.
- Generacion de narrativa creativa: puede usarse para escribir relatos cortos, dialogos o guiones, aprovechando su capacidad de mantener contexto conversacional.
- Prototipado de aplicaciones de chat: los desarrolladores pueden usar las cuantizaciones GGUF para probar rapidamente el modelo en entornos locales sin necesidad de GPU de gran tamano.
- Investigacion sobre modelos sin alineacion: util para estudiar el comportamiento de modelos que no han sido sometidos a tecnicas de RLHF o DPO, especialmente en contextos de seguridad y sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF tienen tamanos de 11,0 GB (i1-Q2_K), 12,9 GB (i1-IQ3_M) y 15,9 GB (i1-Q4_K_S). Para inferencia con contexto corto, se necesita al menos esa cantidad de VRAM, mas un margen para el contexto y los calculos intermedios (tipicamente 2-4 GB adicionales).
- GPU recomendadas: una RTX 3090/4090 (24 GB) puede ejecutar la cuantizacion i1-Q4_K_S con comodidad. Para las versiones mas pequenas, una RTX 3060 (12 GB) o RTX 4070 (12 GB) seria suficiente. En el caso de GPUs con 8 GB, solo la cuantizacion i1-Q2_K podria caber con limitaciones de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier frontend compatible con GGUF. Tambien se puede usar vLLM si se convierte a otro formato, aunque no es lo habitual.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, un modelo de 27B en Q4_K_S suele generar entre 20 y 40 tokens por segundo, dependiendo del contexto y la implementacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo base (ReadyArt/Dark-Scarlett-27B-v2.0) no tiene benchmarks publicos conocidos, y no se identifican alternativas directas con el mismo enfoque (roleplay sin alineacion, 27B, licencia Apache-2.0) en la informacion proporcionada. Se recomienda consultar el repositorio del modelo base para posibles comparaciones.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar contenido adulto y NSFW. No es adecuado para aplicaciones dirigidas a menores o entornos profesionales que requieran moderacion.
- Sesgos y alucinaciones: al ser un modelo "unaligned", puede presentar sesgos sociales, generar informacion falsa o producir respuestas ofensivas sin filtro. No se ha evaluado su seguridad.
- Idioma: solo soporta ingles. No se recomienda su uso en otros idiomas.
- Contexto: se desconoce la longitud de contexto maxima. Es posible que tenga limitaciones en conversaciones muy largas.
- Vision no disponible: aunque la model card menciona capacidades de vision, este repositorio GGUF no incluye los archivos mmproj, por lo que no se puede usar como modelo multimodal.
- Licencia: Apache-2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones locales sobre material explicito.
- Cuantizaciones de baja precision: las versiones i1-Q2_K e i1-IQ3_M pueden degradar notablemente la calidad del texto. Se recomienda usar i1-Q4_K_S para produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Scarlett-27B-v2.0-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v2.0
- Repositorio GGUF estatico (con mmproj): https://huggingface.co/mradermacher/Dark-Scarlett-27B-v2.0-GGUF
- Repositorio GGUF del autor original: https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v2.0-GGUF
