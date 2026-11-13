# richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic-GGUF

## Resumen

OLMo-2-0325-32B-Instruct-SOM-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic, a su vez derivado de OLMo 2 32B Instruct de Allen Institute for AI (AI2). El modelo original OLMo 2 es una familia de transformers densos entrenados completamente con datos abiertos y pesos abiertos, disenada para investigacion reproducible en IA. Esta variante concreta aplica una modificacion de tipo "abliterated/heretic" (eliminacion o reduccion de comportamientos de rechazo) sobre el modelo Instruct, y se distribuye unicamente como pesos cuantizados GGUF para su uso con llama.cpp y Ollama.

El modelo cuenta con 32.234.279.936 parametros totales, lo que lo situa en la categoria de modelos densos de 32B. La licencia declarada es Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face. El idioma declarado es unicamente ingles. El repositorio ocupa 53,8 GB, coherente con multiples niveles de cuantizacion de un modelo de 32B.

La relevancia de esta ficha radica en documentar una variante de investigacion derivada de un modelo abierto de referencia, con las advertencias propias de un modelo "uncensored" y de una cuantizacion de terceros que no ha sido validada por el desarrollador original. No se dispone de informacion publicada sobre benchmarks especificos de esta variante cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de OLMo 2 32B Instruct); detalles exactos de la variante no disponibles |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (multiples niveles; niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo base OLMo 2 32B Instruct es un transformer denso desarrollado por AI2, entrenado con un corpus abierto y con pesos, datos y recetas de entrenamiento publicados. La variante richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic aplica sobre el modelo Instruct una modificacion de tipo "abliterated" (orientada a eliminar direcciones de rechazo en el espacio de activaciones) y una tecnica etiquetada como "SOM" y "heretic". No se dispone en la informacion proporcionada de detalles sobre el dataset exacto, el numero de tokens de entrenamiento, ni si se aplico RLHF, DPO o un proceso de fine-tuning especifico para esta variante.

La cuantizacion GGUF ha sido generada por el usuario richardyoung, presumiblemente con imatrix (segun los tags del repositorio), lo que sugiere un proceso de cuantizacion guiado por importancia de pesos para preservar calidad en niveles bajos de bits. No hay informacion disponible sobre la metodologia exacta de cuantizacion, los niveles incluidos ni las perdidas de calidad medidas respecto al modelo en safetensors.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Instruct de OLMo 2.
- Razonamiento y respuesta a instrucciones (modelo tipo Instruct).
- Reduccion de rechazos y respuestas de tipo "uncensored" por la modificacion heretic/abliterated.
- Soporte de conversacion multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades de codigo y matematicas: no verificadas especificamente para esta variante en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es solo de texto.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de tecnicas de abliteration sobre el comportamiento de rechazo en un modelo abierto de 32B, comparando respuestas con el Instruct original.
- Experimentacion local con llama.cpp u Ollama: al distribuirse en GGUF, se puede desplegar en estaciones de trabajo con GPU consumer o incluso CPU, sin necesidad de infraestructura de servidores.
- Generacion de texto creativo sin filtros: util para escritura de ficcion, guiones o contenido narrativo donde los rechazos del modelo alineado resultan un obstaculo, siempre con revision humana.
- Evaluacion de cuantizaciones: comparar la calidad de distintos niveles GGUF frente al modelo en safetensors para medir degradacion en tareas de razonamiento.
- Prototipado de asistentes conversacionales en ingles: integracion via API compatible con endpoints o mediante llama.cpp server para pruebas de concepto.
- Analisis de sesgos y comportamientos no deseados: al ser un modelo sin alineacion estricta, sirve como caso de estudio para auditar riesgos de modelos abiertos en entornos controlados de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 32B en GGUF requiere aproximadamente 18-20 GB en cuantizacion Q4_K_M, 22-24 GB en Q5, y 32-36 GB en Q8; en FP16 serian necesarios unos 64 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 6000 Ada para FP16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones Q4/Q5.
- Cabe en GPU consumer: si, en RTX 4090/3090 con cuantizaciones Q4 o Q5; en GPUs de 16 GB solo con cuantizaciones muy agresivas (Q2/Q3) o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama (segun tags), y servidores compatibles con endpoints; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-SOM-heretic-GGUF (este) | 32,2B | no disponible | Apache 2.0 | GGUF | Variante abliterated, acceso gated, solo ingles |
| OLMo 2 32B Instruct (AI2) | 32B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo original alineado, datos y receta abiertos |
| Gemma 2 27B Instruct | 27B | 8K (segun documentacion publica) | Gemma license | safetensors, GGUF | Alternativa de tamano similar con licencia no Apache |
| Qwen2.5 32B Instruct | 32,5B | 128K (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Alternativa densa de 32B con contexto largo y multilingue |

Nota: los datos de modelos comparables provienen de documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen solo como referencia de categoria.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": la eliminacion de rechazos puede aumentar la probabilidad de generar contenido danino, sesgado o inexacto; no apto para produccion sin moderacion adicional.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta variante.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0 declarada, pero el acceso es restringido (gated) y requiere aceptar condiciones; verificar los terminos exactos antes de uso comercial.
- Cuantizacion de terceros: la calidad puede diferir del modelo en safetensors; no hay benchmarks publicados que la validen.
- Contexto: no se dispone de la longitud de contexto soportada en la informacion proporcionada; verificar en la model card del modelo base.
- Procedencia: el autor richardyoung no es el desarrollador original (AI2); el soporte y la trazabilidad son limitados.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por la comunidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic-GGUF
- Modelo base en Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic
- Modelo original OLMo 2 de AI2: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
