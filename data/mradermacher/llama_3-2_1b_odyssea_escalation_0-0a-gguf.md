# mradermacher/Llama_3.2_1b_Odyssea_Escalation_0.0a-GGUF

## Resumen

Llama_3.2_1b_Odyssea_Escalation_0.0a-GGUF es la version cuantizada en formato GGUF del modelo Nexesenex/Llama_3.2_1b_Odyssea_Escalation_0.0a, un merge de modelos derivado de la arquitectura Llama 3.2 de 1B parametros de Meta. La cuantizacion la realiza mradermacher, un conocido publicador de versiones GGUF de modelos open source, y esta pensada para su uso con llama.cpp y entornos de inferencia local con recursos limitados.

El modelo base es un merge generado con mergekit (la model card incluye las etiquetas `mergekit` y `merge`), lo que indica que se ha construido combinando los pesos de varios modelos, presumiblemente para reforzar ciertas capacidades conversacionales o de instrucciones. Al tratarse de un modelo de 1.235.818.528 parametros (aproximadamente 1,2B), es extremadamente ligero y cabe en practicamente cualquier GPU consumer, e incluso puede ejecutarse en CPU con velocidades aceptables.

La relevancia de esta ficha radica en que ofrece una via sencilla para desplegar un modelo conversacional derivado de Llama 3.2 en ingles con un consumo de recursos minimo. Sin embargo, la informacion publicada por el autor es muy escasa: no hay benchmarks, no se detalla la composicion del merge ni el dataset de entrenamiento, y la licencia Llama 3.2 impone restricciones de uso comercial que conviene revisar antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 1B) |
| Parametros totales | 1.235.818.528 (aprox. 1,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 1B soporta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un merge construido con mergekit a partir de la arquitectura Llama 3.2 1B de Meta, que es un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm y activacion SwiGLU. Al tratarse de un merge de pesos y no de un entrenamiento desde cero, no hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. La model card del autor no incluye ninguna seccion de arquitectura o entrenamiento mas alla de las etiquetas `mergekit` y `merge`.

La innovacion tecnica principal de esta publicacion es la propia cuantizacion: mradermacher ofrece un espectro amplio de cuantizaciones estaticas (desde Q2_K hasta f16), lo que permite ajustar el equilibrio entre calidad y tamano en disco. No se han publicado cuantizaciones ponderadas con imatrix para este modelo, segun indica el propio autor. La model card advierte que los quants IQ suelen ser preferibles a los no-IQ de tamano similar, y que Q4_K_S y Q4_K_M son las opciones recomendadas por velocidad y calidad.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama 3.2 1B.
- Razonamiento basico y respuesta a instrucciones, presumiblemente reforzado por el merge (no confirmado con benchmarks).
- No hay evidencia publicada de soporte de tool calling o function calling en este modelo concreto.
- No hay evidencia publicada de soporte de agentes o razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la etiqueta `language: en`.
- No se documentan capacidades especiales como modo thinking, vision o audio.
- No se documenta una ventana de contexto especifica para esta variante cuantizada.

## Casos de uso

- Prototipado rapido de chatbots en local: al ocupar menos de 1 GB en cuantizacion Q4_K_M, se puede cargar en un portatil con 8 GB de RAM y probar flujos conversacionales en ingles sin depender de APIs externas.
- Inferencia en dispositivos de borde: el tamano de 0,9 GB en Q4_K_M permite desplegarlo en Raspberry Pi 5 o mini-PC con CPU, usando llama.cpp para generar respuestas en tiempo casi real.
- Filtrado y clasificacion de texto: se puede usar como modelo de bajo coste para tareas de etiquetado, moderacion o extraccion de entidades en ingles, siempre que se valide su calidad empiricamente.
- Generacion de texto asistida en editores: integracion en plugins de autocompletado o reescritura de parrafos en ingles, con latencia baja gracias al reducido numero de parametros.
- Base para experimentos de merging y cuantizacion: util para investigadores que quieran reproducir el pipeline de mergekit y comparar el efecto de distintas cuantizaciones sobre la calidad.
- Educacion y demos: adecuado para talleres donde se ensene a desplegar modelos con llama.cpp u Ollama sin necesidad de GPUs dedicadas.
- Evaluacion comparativa de cuantizaciones: el espectro de quants disponibles (Q2_K a f16) permite medir la degradacion de perplejidad y calidad en funcion del bitrate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en Q2_K, 0,9 GB en Q4_K_M, 1,4 GB en Q8_0 y 2,6 GB en f16 (los tamanos de archivo coinciden aproximadamente con la memoria necesaria, mas overhead de contexto).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos 8 anos, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. No es compatible directamente con vLLM o TGI en formato GGUF sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, se espera un throughput alto en GPU consumer, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama_3.2_1b_Odyssea_Escalation_0.0a-GGUF | 1,2B | no disponible | llama3.2 | GGUF | Merge cuantizado, solo ingles, sin benchmarks |
| Llama 3.2 1B Instruct (Meta) | 1,2B | 128k | llama3.2 | safetensors, GGUF | Modelo oficial con benchmarks publicados y soporte multilingue |
| Qwen2.5 1.5B Instruct | 1,5B | 32k | Apache 2.0 | safetensors, GGUF | Multilingue, licencia permisiva, benchmarks publicados |
| SmolLM2 1.7B Instruct | 1,7B | 8k | Apache 2.0 | safetensors, GGUF | Alternativa ligera con licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el merge mejore al Llama 3.2 1B original; la calidad es incierta.
- Riesgo de alucinacion: al ser un modelo de 1,2B, la tasa de alucinacion es alta en tareas de conocimiento factual y razonamiento complejo.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Restricciones de licencia: la licencia llama3.2 de Meta impone condiciones de uso comercial, obligaciones de atribucion y limites en el numero de usuarios mensuales para ciertos despliegues; es imprescindible revisar el texto completo antes de usarlo en produccion.
- Modelo derivado de un merge sin documentacion: no se conoce la composicion exacta del merge ni los modelos combinados, lo que dificulta evaluar sesgos heredados.
- Sin cuantizaciones imatrix: el autor indica que no hay quants ponderados disponibles, lo que puede reducir la calidad en bitrates bajos frente a alternativas con imatrix.
- Contexto no confirmado: aunque el Llama 3.2 1B soporta 128k tokens, no se confirma que este merge conserve esa ventana, y las cuantizaciones bajas pueden degradar el rendimiento en contextos largos.
- Uso comercial: requiere cumplir la licencia Llama 3.2 y, en su caso, la politica de uso aceptable de Meta.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/mradermacher/Llama_3.2_1b_Odyssea_Escalation_0.0a-GGUF
- Modelo base: https://huggingface.co/Nexesenex/Llama_3.2_1b_Odyssea_Escalation_0.0a
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama_3.2_1b_Odyssea_Escalation_0.0a-GGUF
- Repositorio de peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Web de nethype GmbH: https://www.nethype.de/
