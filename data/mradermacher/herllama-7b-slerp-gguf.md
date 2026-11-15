# mradermacher/HerLlama-7B-slerp-GGUF

## Resumen

HerLlama-7B-slerp-GGUF es la distribucion en formato GGUF del modelo fusionado HerLlama-7B-slerp, publicada por el usuario mradermacher, conocido en Hugging Face por cuantizar sistematicamente modelos abiertos para su uso con llama.cpp y otros motores compatibles. El modelo original es una fusion (merge) realizada con mergekit/lazymergekit a partir de dos modelos base: HuggingFaceH4/zephyr-7b-alpha y mlabonne/Marcoro14-7B-slerp. Esta version GGUF no introduce cambios en los pesos mas alla de la cuantizacion; su valor anadido es ofrecer los pesos originales en una amplia gama de tipos de cuantizacion (desde Q2_K hasta f16) para facilitar el despliegue en hardware modesto.

El modelo subyacente es un transformer denso de aproximadamente 7.240 millones de parametros, derivado de la familia Llama/Mistral de 7B, con licencia Apache 2.0 y soporte declarado unicamente para ingles. Al tratarse de una fusion de modelos afinados por instrucciones, hereda caracteristicas conversacionales de sus progenitores, incluyendo el estilo de dialogo de Zephyr-7b-alpha y las capacidades del merge Marcoro14-7B-slerp.

Es relevante para desarrolladores que quieran ejecutar un modelo de 7B afinado por instrucciones en local, en CPU o en GPUs de consumo, con la flexibilidad de elegir el tamano de cuantizacion segun la VRAM disponible. No obstante, conviene tener en cuenta que se trata de un modelo de 2023-2024, sin datos publicados de benchmarks especificos para esta fusion, por lo que su rendimiento debe validarse empiricamente antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama/Mistral 7B, fusion con mergekit/lazymergekit) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 63,9 GB con todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo subyacente, HerLlama-7B-slerp, es una fusion de pesos (weight merge) generada con mergekit y lazymergekit a partir de dos modelos: HuggingFaceH4/zephyr-7b-alpha y mlabonne/Marcoro14-7B-slerp. La tecnica SLERP (spherical linear interpolation) interpola los pesos de ambos modelos en el espacio de parametros, combinando caracteristicas de ambos sin un entrenamiento adicional desde cero. Zephyr-7b-alpha es un Mistral-7B afinado con DPO (Direct Preference Optimization) sobre el dataset UltraFeedback, mientras que Marcoro14-7B-slerp es a su vez otra fusion de la comunidad orientada a mejorar el rendimiento conversacional y de razonamiento.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO especificas para esta fusion; al tratarse de un merge, no hay un entrenamiento nuevo mas alla de la interpolacion de pesos. La version GGUF de mradermacher aplica cuantizacion post-entrenamiento sobre los pesos originales en formato transformers, generando los distintos niveles de compresion listados. El autor indica que los cuants ponderados/imatrix estan disponibles en un repositorio separado (HerLlama-7B-slerp-i1-GGUF), lo que sugiere que esta version contiene cuants estaticos sin matriz de importancia.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, heredada del afinado por instrucciones de Zephyr-7b-alpha.
- Razonamiento basico y respuesta a instrucciones en formato chat (estilo Zephyr, con tokens de sistema y usuario).
- Generacion de codigo y matematicas a nivel de modelo de 7B de su generacion, sin garantias especificas publicadas para esta fusion.
- Soporte de tool calling / function calling: no disponible de forma nativa declarada en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para esta fusion.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: al estar disponible en GGUF desde Q2_K (2,8 GB) hasta f16 (14,6 GB), permite montar un chatbot de instrucciones en un portatil sin GPU dedicada usando llama.cpp u Ollama, eligiendo Q4_K_M como equilibrio entre calidad y velocidad.
- Experimentacion con fusiones de modelos: util para investigadores que quieran evaluar el efecto de la tecnica SLERP comparando esta fusion con sus progenitores (Zephyr-7b-alpha y Marcoro14-7B-slerp) en las mismas tareas y con el mismo hardware.
- Despliegue en entornos con VRAM limitada: la cuantizacion Q4_K_S (4,2 GB) o IQ4_XS (4,0 GB) cabe en GPUs de consumo de 6-8 GB, permitiendo servir el modelo en estaciones de trabajo modestas.
- Generacion de texto por lotes en CPU: las cuantizaciones Q2_K y Q3_K permiten procesar grandes volumenes de texto en servidores sin GPU, a costa de una perdida de calidad que debe medirse para cada caso.
- Base para afinado ligero o evaluacion comparativa: el modelo puede servir como punto de partida para experimentos de LoRA o como referencia en estudios sobre el impacto de las fusiones en tareas de instruccion en ingles.
- Educacion y divulgacion: su tamano manejable y su licencia Apache 2.0 lo hacen adecuado para talleres y demostraciones sobre cuantizacion, formatos GGUF y ejecucion local de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q3_K_M ~3,6 GB; Q3_K_L ~3,9 GB; IQ4_XS ~4,0 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_S ~5,1 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB.
- GPU recomendadas: para cuantizaciones Q4-Q5, GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) permiten alojar el modelo completo en VRAM con margen para contexto. Para f16 se recomienda una GPU de 16-24 GB (RTX 4090, A100 40 GB) o dividir entre varias GPUs.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones. Q2_K a Q5_K caben en GPUs de 6-8 GB; Q6_K y Q8_0 requieren 8-12 GB; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF. Los pesos originales en transformers pueden servirse con vLLM o TGI si se usa el modelo base ddeshler/HerLlama-7B-slerp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen en gran medida del hardware, la cuantizacion y el backend; como referencia general, un modelo de 7B en Q4_K_M suele generar decenas de tokens por segundo en GPUs de consumo modernas, pero no se aportan cifras concretas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HerLlama-7B-slerp-GGUF (este) | 7,24 B | no disponible | Apache 2.0 | GGUF | Fusion SLERP de Zephyr-7b-alpha y Marcoro14-7B-slerp; solo ingles |
| HuggingFaceH4/zephyr-7b-alpha | 7 B | no disponible en la informacion | MIT (segun su model card original) | safetensors | Progenitor; afinado con DPO sobre UltraFeedback |
| mlabonne/Marcoro14-7B-slerp | 7 B | no disponible en la informacion | no disponible en la informacion | safetensors | Progenitor; fusion de la comunidad orientada a instrucciones |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32 K (segun su model card original) | Apache 2.0 | safetensors, GGUF | Alternativa directa de la misma familia con contexto largo documentado |

La comparativa se limita a los datos disponibles; no se dispone de resultados de benchmarks para HerLlama-7B-slerp-GGUF que permitan una comparacion cuantitativa de rendimiento con las alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Zephyr-7b-alpha y de fusiones de la comunidad, puede heredar sesgos presentes en los datos de entrenamiento de sus progenitores; no se han publicado evaluaciones de sesgo especificas para esta fusion.
- Riesgo de alucinacion: como todo LLM de 7B de su generacion, puede generar informacion facticamente incorrecta con aparente seguridad; no se han publicado tasas de alucinacion para este modelo.
- Limitaciones de contexto e idioma: la model card declara unicamente ingles; no se especifica la longitud de contexto soportada, por lo que debe validarse antes de usarlo con prompts largos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos progenitores (Zephyr-7b-alpha y Marcoro14-7B-slerp) para asegurar la compatibilidad en un producto.
- Caveat para produccion: es una fusion de modelos sin benchmarks publicados; no se recomienda su uso en produccion sin una evaluacion empirica previa en las tareas objetivo. Ademas, al ser cuants estaticos (no imatrix), las cuantizaciones de baja calidad (Q2_K, Q3_K) pueden degradar notablemente la coherencia; el autor recomienda Q4_K_M o superiores para uso general.
- Fecha del modelo: la fusion subyacente es de la generacion de 7B de 2023-2024; existen alternativas mas recientes con mejor rendimiento y contexto mas largo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HerLlama-7B-slerp-GGUF
- Modelo base (transformers): https://huggingface.co/ddeshler/HerLlama-7B-slerp
- Cuants ponderados/imatrix: https://huggingface.co/mradermacher/HerLlama-7B-slerp-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#HerLlama-7B-slerp-GGUF
- Progenitor Zephyr-7b-alpha: https://huggingface.co/HuggingFaceH4/zephyr-7b-alpha
- Progenitor Marcoro14-7B-slerp: https://huggingface.co/mlabonne/Marcoro14-7B-slerp
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
