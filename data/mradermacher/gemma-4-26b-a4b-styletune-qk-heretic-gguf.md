# mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-GGUF

## Resumen

Gemma-4-26B-A4B-StyleTune-QK-Heretic es un modelo de lenguaje de tipo mezcla de expertos (MoE) derivado de la familia Gemma 4, con 25.971.339.550 parametros totales y aproximadamente 4.000 millones de parametros activos por token (el sufijo "A4B" indica esta activacion dispersa). Esta publicacion concreta es una cuantizacion estatica en formato GGUF realizada por mradermacher sobre el modelo SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic, que a su vez es un merge afinado para estilo conversacional y roleplay con tecnicas de "abliteration" (etiqueta heretic) destinadas a reducir los rechazos del modelo base.

El modelo resuelve el problema de desplegar un MoE de gran tamano en hardware modesto: al activar solo una fraccion de sus parametros, mantiene un coste de inferencia cercano al de un modelo de 4B, mientras conserva la capacidad representacional de un modelo de 26B. La cuantizacion GGUF permite ejecutarlo con llama.cpp, Ollama o LM Studio en GPUs de consumo, con ficheros que van desde 10,9 GB (Q2_K) hasta 27,7 GB (Q8_0).

Es relevante ahora porque combina tres tendencias simultaneas: la adopcion de arquitecturas MoE eficientes en la familia Gemma, la aparicion de merges comunitarios orientados a roleplay y escritura creativa, y la disponibilidad inmediata de cuantizaciones GGUF listas para usar. La licencia Apache 2.0 facilita su integracion comercial, aunque el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma 4 |
| Parametros totales | 25.971.339.550 (25,97 B) |
| Parametros activos | Aproximadamente 4 B (segun nomenclatura A4B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio i1 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en transformers/safetensors |
| Tamano del repositorio | 187,7 GB (incluye todas las cuantizaciones) |
| Modelo base | SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic |
| Fecha de creacion | 13 de septiembre de 2026 |
| Ultima actualizacion | 7 de octubre de 2026 |
| Descargas | 779 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con capas de mezcla de expertos (MoE), propio de la familia Gemma 4. El modelo declara 25,97 mil millones de parametros totales con activacion dispersa de aproximadamente 4 mil millones por token, lo que reduce el coste computacional de la inferencia sin recortar drasticamente la capacidad del modelo. El modelo base es un merge (etiqueta "merge") del Gemma-4-26B-A4B original con un ajuste de estilo (StyleTune) orientado a conversacion y roleplay, seguido de un proceso de "abliteration" (heretic) que busca eliminar los comportamientos de rechazo aprendidos durante el alineamiento.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base; la model card del repositorio de cuantizacion no incluye estos datos. La innovacion principal de esta publicacion es la cuantizacion estatica en multiples niveles de precision, con una recomendacion explicita del autor de usar Q4_K_S o Q4_K_M por su equilibrio entre velocidad y calidad, y Q8_0 para maxima fidelidad. Tambien se ofrece un repositorio separado con cuantizaciones ponderadas/imatrix de mayor calidad (i1-GGUF).

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis en roleplay y escritura creativa.
- Estilo afinado (StyleTune) para respuestas mas naturales y consistentes en dialogos multi-turno.
- Comportamiento "heretic": reduccion deliberada de rechazos y respuestas evasivas en temas sensibles, lo que amplia el rango de respuestas generadas.
- Capacidad de razonamiento heredada del modelo base Gemma 4, aunque no documentada de forma especifica en la model card.
- Soporte multilingue limitado: el modelo declara unicamente ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y ficcion interactiva: el ajuste StyleTune y la abliteration permiten mantener personajes coherentes y responder sin rechazos en narrativas adultas o conflictivas; el contexto conversacional se gestiona con el historial de chat en llama.cpp u Ollama.
- Escritura creativa asistida: generacion de relatos, dialogos y borradores literarios con un tono estilizado, usando la cuantizacion Q6_K o Q8_0 para preservar matices de estilo.
- Prototipado de chatbots de personaje en local: con Q4_K_M (17,3 GB) se puede ejecutar en una RTX 4090 o en un Mac con memoria unificada de 24 GB o mas, sin coste de API.
- Generacion de dialogos para videojuegos y mods: el modelo puede producir lineas de personaje variadas y adaptadas a contextos narrativos, integrado mediante la API compatible de llama.cpp.
- Investigacion sobre alineamiento y seguridad: el modelo heretic sirve como caso de estudio para analizar como la abliteration altera la distribucion de respuestas y los sesgos residuales.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con GGUF, los datos conversacionales no salen del equipo, adecuado para prototipos de asistencia personal o escritura confidencial.
- Experimentacion con arquitecturas MoE en hardware de consumo: permite medir el rendimiento real de un MoE de 26B con activacion de 4B en GPUs de gama alta consumer, comparando latencia y calidad entre cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: 10,9 GB de pesos; aproximadamente 12-14 GB de VRAM con contexto moderado.
  - Q3_K_M: 13,7 GB de pesos; aproximadamente 15-17 GB de VRAM.
  - IQ4_XS: 14,6 GB de pesos; aproximadamente 16-18 GB de VRAM.
  - Q4_K_S: 16,0 GB de pesos; aproximadamente 17-19 GB de VRAM.
  - Q4_K_M: 17,3 GB de pesos; aproximadamente 18-20 GB de VRAM.
  - Q5_K_M: 19,7 GB de pesos; aproximadamente 21-23 GB de VRAM.
  - Q6_K: 23,3 GB de pesos; aproximadamente 24-26 GB de VRAM.
  - Q8_0: 27,7 GB de pesos; aproximadamente 29-31 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y hasta Q5_K_S; RTX 3090 (24 GB) para Q4_K_M; A100 40 GB o H100 para Q6_K y Q8_0 con contexto largo; RTX 4060 Ti 16 GB para Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 y RTX 4060 Ti 16 GB con cuantizaciones Q4 o inferiores; en GPUs de 12 GB solo con Q2_K y contexto muy limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; tambien es posible usar los pesos originales en transformers con vLLM o TGI si se dispone de VRAM suficiente (aproximadamente 52 GB en fp16).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un MoE con 4B activos, se espera un throughput superior al de un modelo denso de 26B, pero no hay mediciones publicadas en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gemma-4-26B-A4B-StyleTune-QK-Heretic (esta ficha) | 25,97 B | ~4 B | No disponible | Apache 2.0 | GGUF | Merge con abliteration, orientado a roleplay, solo ingles |
| Gemma-4-26B-A4B (base) | 25,97 B | ~4 B | No disponible | Apache 2.0 | Safetensors | Modelo original de Google, alineamiento estandar |
| Mixtral 8x7B | 46,7 B | ~12,9 B | 32k | Apache 2.0 | Safetensors, GGUF | MoE mas grande, mayor coste de inferencia, multilingue |
| Qwen2.5-32B | 32,5 B | Denso | 128k | Apache 2.0 | Safetensors, GGUF | Denso, mayor coste por token, contexto mucho mayor |

La comparativa con Mixtral y Qwen2.5 es orientativa: no se dispone de benchmarks del modelo de esta ficha que permitan una comparacion cuantitativa de calidad. La ventaja principal frente a alternativas densas de tamano similar es el menor coste de inferencia por token gracias a la activacion de 4B; la desventaja es el idioma unico (ingles) y la ausencia de datos de rendimiento publicados.

## Limitaciones y advertencias

- Modelo unicamente en ingles: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- La abliteration ("heretic") reduce los rechazos, lo que implica un mayor riesgo de generar contenido inapropiado, ofensivo o factualmente incorrecto sin advertencia.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas de fidelidad factual para este merge.
- Al ser un merge comunitario, no existe garantia de calidad equivalente al modelo Gemma original de Google; el comportamiento puede degradarse en tareas de razonamiento o codigo.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que dificulta planificar despliegues con historiales largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los terminos de Gemma deben verificarse por separado; el autor declara Apache 2.0 en esta publicacion.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; el propio autor recomienda Q4_K_S o Q4_K_M como minimo para uso practico.
- El repositorio ocupa 187,7 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- No hay soporte documentado de tool calling ni de agentes, por lo que no es adecuado para pipelines automatizados que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Gemma-4-26B-A4B-StyleTune-QK-Heretic-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Gemma-4-26B-A4B-StyleTune-QK-Heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
