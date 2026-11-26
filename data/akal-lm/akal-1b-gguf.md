# akal-lm/Akal-1B-GGUF

## Resumen
Akal-1B es una versión cuantizada en formato GGUF del modelo google/gemma-3-1b-it, publicada por el proyecto Akal LM Initiative (Muhammad Luqni Baehaqi). Se trata de un modelo de 999.885.952 parámetros (aproximadamente 1.000 millones) orientado a inferencia en CPU y dispositivos de borde ("edge"), sin necesidad de GPU dedicada. Su valor diferencial no reside en un reentrenamiento, sino en el proceso de cuantización Q4_K_M guiado por una importance matrix personalizada para indonesio, que según el autor reduce el peso a unos 762 MB y mejora el rendimiento en ese idioma.

El modelo hereda la arquitectura transformer de Gemma 3 (1B) de Google DeepMind y está pensado para entornos con recursos muy limitados: portátiles de oficina, mini-PC industriales, terminales punto de venta o pasarelas IoT. La ficha del autor lo presenta como una pieza de una familia más amplia de modelos GGUF (embedding, reranker y un draft model de 270M para decodificación especulativa), lo que sugiere un enfoque de despliegue local completo.

Es relevante ahora porque cubre el nicho de asistentes offline y RAG local en indonesio e inglés con un consumo de memoria inferior a 950 MB, un espacio donde los modelos de 7B-8B no caben en hardware sin acelerador. La licencia es la Gemma License de Google, no una licencia permisiva genérica, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, modelo base google/gemma-3-1b-it) |
| Parametros totales | 999.885.952 (aprox. 1.000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (cuantizacion con importance matrix para indonesio) |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | Gemma (Google Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo es una cuantizacion del checkpoint instructivo google/gemma-3-1b-it, por lo que su arquitectura subyacente es la de Gemma 3 en su variante de 1B parametros: un transformer denso con atencion multi-cabeza y las innovaciones propias de la familia Gemma 3. No se ha realizado un entrenamiento adicional desde cero ni un fine-tuning supervisado documentado; el trabajo del autor consiste en la conversion a GGUF y la cuantizacion Q4_K_M.

La innovacion tecnica declarada es el uso de una importance matrix (imatrix) especifica para indonesio durante la cuantizacion. Este mecanismo pondera la importancia de cada peso segun su impacto en la perplejidad sobre un corpus representativo, de modo que la cuantizacion a 4 bits preserva mejor el rendimiento en ese idioma. El autor afirma mejoras de hasta un 300% en throughput y una reduccion del 70% en huella de RAM frente a runtimes comunitarios no vectorizados, si bien estas cifras proceden de su propio preprint y no de una evaluacion independiente. No se detalla el volumen de tokens de entrenamiento del modelo base ni la composicion del dataset, ya que corresponden a Google y no se reproducen en la informacion disponible.

## Capacidades
- Generacion de texto conversacional en indonesio e ingles, con correccion gramatical y conversion de registro informal a formal.
- Razonamiento basico y explicacion de sintaxis de programacion, con escritura de scripts cortos (el autor acota el alcance a menos de 30 lineas).
- Resumen y pulido de textos breves: memorandos, correos y notas de campo.
- Clasificacion de consultas de soporte, enrutamiento de intenciones y extraccion de entidades estructuradas (nombres, identificadores de pedido, esquemas JSON simples).
- Integracion en pipelines de RAG local junto con el modelo de embedding complementario akal-lm/Akal-Embed-GGUF.
- Inferencia en CPU pura mediante llama.cpp, con latencia declarada de menos de 300 ms hasta el primer token y 21-28 tokens por segundo en CPUs de portatil o mini-PC.
- Soporte de decodificacion especulativa mediante el draft model complementario akal-lm/Akal-Nano-270M-GGUF.
- No se documentan capacidades de vision, audio, tool calling nativo ni modo de razonamiento extendido (thinking mode) en la informacion proporcionada.

## Casos de uso
- Asistentes offline en entornos sin conectividad fiable: el modelo se ejecuta integramente en CPU con menos de 950 MB de RAM, lo que permite desplegarlo en terminales maritimos, aeronauticos o de almacen sin dependencia de la nube.
- RAG local sobre documentacion interna: combinado con Akal-Embed (119 MB), responde preguntas sobre procedimientos operativos, manuales o catalogos de producto sin enviar datos fuera del dispositivo, lo que facilita el cumplimiento de privacidad.
- Clasificacion y enrutamiento de tickets de soporte: su tamano reducido permite procesar cada consulta en milisegundos y derivarla al microservicio correspondiente, con extraccion de entidades en JSON para el backend.
- Terminales de punto de venta y kioscos de atencion al ciudadano: el modelo cabe en el hardware del propio terminal y ofrece respuestas conversacionales de baja latencia sin coste de API.
- Correccion y formalizacion de textos en indonesio: util para normalizar correos, actas o notas de campo antes de archivarlas, aprovechando la importance matrix afinada para ese idioma.
- Agentes de voz interactivos en altavoces inteligentes: el TTFT inferior a 300 ms y el throughput de 21-28 tokens/s permiten turnos de conversacion naturales en hardware de bajo coste.
- Filtrado y preprocesado en pasarelas IoT: resumir o etiquetar mensajes antes de reenviarlos a un sistema central, reduciendo el ancho de banda consumido.

## Benchmarks y rendimiento
El autor menciona en la model card comparaciones empiricas frente a Sahabat-AI 8B/9B, SEA-LION v3 8B, Merak-7B, Meta Llama-3.2-1B y Alibaba Qwen2.5-1.5B, recogidas en su preprint (Akal_Edge_LLM_Research_Paper.pdf). Sin embargo, no se han proporcionado en la informacion disponible los valores numericos concretos de MMLU, HumanEval, GSM8K ni de otras pruebas, por lo que no se presentan cifras que no puedan verificarse.

No se han publicado resultados de benchmarks detallados en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no aplica en el caso de uso principal; el modelo esta disenado para inferencia en CPU. El peso Q4_K_M ocupa aproximadamente 762 MB y la huella de RAM declarada es inferior a 950 MB.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 2 GB de memoria podria alojar el modelo, pero el objetivo declarado es CPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no es el escenario optimizado.
- Opciones de despliegue: llama.cpp (runtime de referencia), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio; no se mencionan vLLM ni TGI.
- Latencia y throughput: segun el autor, menos de 300 ms de tiempo hasta el primer token y 21-28 tokens por segundo en CPUs de portatil o mini-PC estandar; hasta un 300% mas de throughput que runtimes comunitarios no vectorizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Akal-1B (este) | ~1.000 M | No disponible | id, en | Gemma | GGUF Q4_K_M |
| google/gemma-3-1b-it | ~1.000 M | No disponible | Multilingue | Gemma | Safetensors |
| Meta Llama-3.2-1B | ~1.200 M | No disponible | Multilingue | Llama 3.2 Community | Safetensors, GGUF |
| Qwen2.5-1.5B | ~1.500 M | No disponible | Multilingue | Apache 2.0 (variantes) | Safetensors, GGUF |

La comparativa se limita a parametros, licencia y formato porque no se dispone de resultados de benchmarks verificables en la informacion proporcionada. Frente a Llama-3.2-1B y Qwen2.5-1.5B, Akal-1B destaca por su cuantizacion optimizada para indonesio y su huella de memoria inferior a 1 GB, mientras que Qwen2.5-1.5B ofrece una licencia mas permisiva (Apache 2.0 en algunas variantes) y mayor cobertura multilingue.

## Limitaciones y advertencias
- No es adecuado para ingenieria de software autonoma sobre multiples archivos, refactorizacion de repositorios ni depuracion de logica asincrona compleja; el propio autor lo acota a scripts de menos de 30 lineas.
- Razonamiento matematico multietapa y logica simbolica profunda quedan fuera de su alcance sin herramientas externas de calculo.
- Conocimiento parametrico del mundo limitado: sin RAG, las respuestas sobre hechos pueden ser incompletas o inexactas, con riesgo de alucinacion.
- Cobertura linguistica restringida a indonesio e ingles; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- La licencia Gemma impone condiciones de uso comercial y restricciones de redistribucion que deben revisarse antes de integrar el modelo en un producto.
- Las cifras de rendimiento (300% de mejora, 70% menos RAM, 21-28 tokens/s) proceden del preprint del propio autor y no de una evaluacion independiente.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.
- La longitud de contexto no se especifica, lo que obliga a consultar la documentacion del modelo base antes de disenar aplicaciones con ventanas largas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/akal-lm/Akal-1B-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Modelo de embedding complementario: https://huggingface.co/akal-lm/Akal-Embed-GGUF
- Reranker complementario: https://huggingface.co/akal-lm/Akal-Rerank-GGUF
- Draft model especulativo: https://huggingface.co/akal-lm/Akal-Nano-270M-GGUF
- Preprint Vol. 1 (Edge LLM): https://huggingface.co/akal-lm/Akal-1B-GGUF/resolve/main/Akal_Edge_LLM_Research_Paper.pdf
- Preprint Vol. 3 (arquitectura y reranking): https://huggingface.co/akal-lm/Akal-1B-GGUF/resolve/main/Akal_Vol3_Architecture_Research_Paper.pdf
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/luqni
