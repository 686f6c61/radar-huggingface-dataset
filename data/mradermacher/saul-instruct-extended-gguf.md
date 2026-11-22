# mradermacher/Saul-Instruct-Extended-GGUF

## Resumen

Saul-Instruct-Extended-GGUF es la distribucion en formato GGUF del modelo arcee-ai/Saul-Instruct-Extended, publicada por el usuario mradermacher, especializado en la cuantizacion de modelos para inferencia local. El modelo original es un merge (fusion) de pesos construido con mergekit a partir de Equall/Saul-Instruct-v1, orientado a tareas conversacionales y de instrucciones en ingles. Esta version GGUF no introduce cambios en la arquitectura ni en los pesos mas alla de la cuantizacion, sino que facilita su ejecucion en CPUs y GPUs de consumo mediante llama.cpp y derivados.

El modelo cuenta con aproximadamente 8.990 millones de parametros totales (8,99 B), lo que lo situa en la franja de los modelos de ~8-9 B, un tamano muy habitual para despliegue en hardware modesto. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligatorias de atribucion. El idioma declarado es unicamente ingles.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de instrucciones de ~9 B en local con multiples niveles de cuantizacion (desde Q2_K de 3,5 GB hasta f16 de 18,1 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria segun el hardware disponible. No obstante, la informacion publicada sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Equall/Saul-Instruct-v1 via merge con mergekit); detalles internos no disponibles |
| Parametros totales | 8.986.628.096 (~8,99 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (tambien existe variante i1/imatrix en repo separado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos generado con mergekit, una herramienta que combina los tensores de varios modelos base mediante tecnicas de interpolacion o concatenacion por capas. En este caso, el modelo de origen declarado es Equall/Saul-Instruct-v1, un modelo afinado para instrucciones. El resultado, arcee-ai/Saul-Instruct-Extended, es un modelo denso de aproximadamente 8,99 B de parametros con arquitectura transformer estandar, apto para cargarse con la libreria transformers antes de su conversion a GGUF.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o similar en el modelo original. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento extendido, etc.). La contribucion de esta publicacion concreta se limita a la conversion y cuantizacion a GGUF con la herramienta de mradermacher, que produce variantes estaticas (no imatrix) y una version i1 con pesos ponderados disponible en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones y dialogos multi-turno.
- Razonamiento basico y respuesta a preguntas dentro de la ventana de contexto del modelo (longitud no documentada).
- Generacion de codigo y matematicas a nivel general, segun lo esperable en un modelo de instrucciones de ~9 B, aunque sin benchmarks publicados que lo confirmen.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en estaciones de trabajo sin GPU dedicada, usando cuantizaciones Q4_K_M (5,5 GB) para obtener respuestas de calidad razonable con latencia aceptable en CPU.
- Prototipado rapido de aplicaciones de chat: al estar en formato GGUF y con licencia Apache 2.0, se puede integrar en entornos de desarrollo sin coste de licencia ni dependencia de APIs externas, ideal para pruebas de concepto.
- Generacion de texto asistida en documentacion tecnica: el modelo puede redactar borradores y resumir contenido en ingles, con la ventaja de ejecutarse en local para preservar la confidencialidad de los datos.
- Educacion y experimentacion: util para investigadores que quieran estudiar el comportamiento de merges de modelos de ~9 B y comparar cuantizaciones (Q2_K frente a Q8_0) en terminos de calidad y velocidad.
- Despliegue en dispositivos con recursos limitados: la variante Q2_K (3,5 GB) permite ejecutar el modelo en equipos con 8 GB de RAM o GPUs de gama baja, aunque con perdida de calidad.
- Filtrado y clasificacion de texto en ingles: tareas de etiquetado, moderacion o extraccion de informacion simple donde no se requiere un modelo de gran escala y prima la privacidad y el coste cero por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas el overhead de contexto. Q2_K ~3,5 GB; Q4_K_M ~5,5 GB; Q8_0 ~9,7 GB; f16 ~18,1 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q5_K_M; RTX 4090 o A100/H100 para f16 y Q8_0 con contexto amplio.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para cuantizaciones Q4 y Q5; en 6 GB para Q3_K_S con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Tambien puede usarse con transformers cargando el modelo base original en safetensors.
- Latencia y throughput estimados: no disponibles (dependen del hardware y de la cuantizacion; no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Saul-Instruct-Extended-GGUF (este) | ~8,99 B | no disponible | Apache 2.0 | GGUF | Merge via mergekit, solo ingles |
| Llama 3.1 8B Instruct | 8 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Ampliamente soportado, multilingue |
| Mistral 7B Instruct | 7,2 B | 32 K | Apache 2.0 | safetensors, GGUF | Referencia en ~7 B, buen soporte de ecosistema |
| Qwen2.5 7B Instruct | 7,6 B | 128 K | Apache 2.0 | safetensors, GGUF | Multilingue, buenos benchmarks publicados |

La comparacion se limita a parametros, contexto, licencia y disponibilidad, ya que no hay datos de rendimiento publicados para este modelo. Frente a las alternativas, la principal desventaja es la ausencia de benchmarks y de documentacion sobre contexto y entrenamiento; la ventaja es la licencia Apache 2.0 y la disponibilidad de cuantizaciones GGUF listas para usar.

## Limitaciones y advertencias

- Solo soporta ingles; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- No hay benchmarks publicados, por lo que la calidad real del modelo no esta verificada de forma objetiva.
- Al ser un merge de pesos, puede heredar sesgos y comportamientos de los modelos de origen, no documentados.
- Riesgo de alucinacion inherente a los modelos de ~9 B, especialmente en tareas de conocimiento factual y matematicas complejas.
- La longitud de contexto no esta documentada, lo que dificulta planificar aplicaciones con conversaciones largas o documentos extensos.
- Aunque la licencia es Apache 2.0, conviene revisar las licencias de los modelos de origen del merge (Equall/Saul-Instruct-v1) para asegurar el cumplimiento en uso comercial.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; para produccion se recomienda Q4_K_M o superior.
- El repositorio incluye una variante i1 (imatrix) en un repositorio separado; no confundir ambas versiones al descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Saul-Instruct-Extended-GGUF
- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Saul-Instruct-Extended-i1-GGUF
- Modelo base original: https://huggingface.co/arcee-ai/Saul-Instruct-Extended
- Modelo de origen del merge: https://huggingface.co/Equall/Saul-Instruct-v1
- Pagina de descargas del autor: https://hf.tst.eu/model#Saul-Instruct-Extended-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
