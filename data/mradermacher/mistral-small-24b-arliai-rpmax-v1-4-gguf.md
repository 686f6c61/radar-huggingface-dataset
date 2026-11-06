# mradermacher/Mistral-Small-24B-ArliAI-RPMax-v1.4-GGUF

## Resumen

Mistral-Small-24B-ArliAI-RPMax-v1.4-GGUF es una cuantizacion estatica en formato GGUF del modelo ArliAI/Mistral-Small-24B-ArliAI-RPMax-v1.4, publicada por mradermacher el 9 de febrero de 2025. El modelo base es un ajuste fino de Mistral-Small-24B, el modelo de 24.000 millones de parametros de Mistral AI, orientado a conversacion y a la maximizacion del rendimiento en tareas de "roleplay" y dialogo abierto (la nomenclatura RPMax hace referencia a este tipo de ajuste). Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados, sin necesidad de GPU de datacenter.

El repositorio ofrece 11 cuantizaciones estaticas que van desde Q2_K (9,0 GB) hasta Q8_0 (25,2 GB), todas generadas con el pipeline de cuantizacion de mradermacher. Ademas, el autor publica una version separada con cuantizaciones ponderadas/imatrix (i1-GGUF) para quienes priorizan la calidad sobre el tamano. El modelo cuenta con 23.572.403.200 parametros segun los pesos en safetensors del modelo base, y el repositorio ocupa 161,4 GB en total.

La relevancia de esta ficha radica en que es la via practica de desplegar un modelo de 24B en local: los cuantizados Q4_K_M (14,4 GB) y Q5_K_M (16,9 GB) caben en GPUs consumer de 16-24 GB de VRAM, lo que democratiza el uso de un modelo de esta escala sin depender de APIs en la nube. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque con las advertencias propias de un ajuste fino conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral-Small-24B; detalles especificos del ajuste no disponibles) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es ArliAI/Mistral-Small-24B-ArliAI-RPMax-v1.4, un ajuste fino de Mistral-Small-24B. Mistral-Small-24B es un transformer decoder-only de 24.000 millones de parametros desarrollado por Mistral AI; la model card del repositorio cuantizado no detalla la arquitectura interna (numero de capas, dimensiones, tipo de atencion) ni el proceso de entrenamiento del ajuste fino. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similar en el ajuste de ArliAI.

La innovacion tecnica de este repositorio es exclusivamente la cuantizacion: mradermacher aplica cuantizacion estatica (convert_type hf, output_tensor_quantised 1) sobre los pesos del modelo base para producir ficheros GGUF compatibles con llama.cpp. El autor distingue entre cuantizaciones estaticas (este repositorio) y cuantizaciones ponderadas/imatrix (repositorio i1-GGUF separado), siendo estas ultimas generalmente preferibles en calidad por tamano similar. No se documentan cambios en el entrenamiento ni en la arquitectura respecto al modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno y "roleplay" segun la nomenclatura del ajuste RPMax.
- Razonamiento general y respuesta a instrucciones, heredado de Mistral-Small-24B (capacidades concretas del ajuste fino no documentadas).
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun el campo `language` del repositorio.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema transformers/llama.cpp.

## Casos de uso

- Despliegue local de un asistente conversacional: con la cuantizacion Q4_K_M (14,4 GB) el modelo cabe en una RTX 4090 (24 GB) o en una GPU de 16 GB con offloading parcial, permitiendo un chatbot privado sin enviar datos a la nube.
- Prototipado de aplicaciones de roleplay y generacion creativa: el ajuste RPMax esta orientado a este tipo de dialogos, por lo que sirve para construir demos de narrativa interactiva o personajes conversacionales.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes (Q2_K a Q8_0), lo que permite medir el impacto de la cuantizacion en perplejidad y calidad para un modelo de 24B concreto.
- Investigacion sobre ajustes finos conversacionales: util para estudiar como se comporta un ajuste orientado a dialogo sobre Mistral-Small-24B frente al modelo original, usando la version Q8_0 (25,2 GB) como referencia de alta fidelidad.
- Fine-tuning adicional o destilacion: los ficheros GGUF no son el formato ideal para reentrenar, pero el modelo base en safetensors (Apache 2.0) puede usarse para experimentos de ajuste y luego cuantizarse con este mismo pipeline.
- Servicio de generacion de texto en CPU: las variantes Q2_K (9,0 GB) y Q3_K_S (10,5 GB) permiten inferencia en servidores sin GPU mediante llama.cpp, con throughput menor pero sin coste de acelerador.
- Integracion en pipelines de CI para pruebas de regresion conversacional: usar Q4_K_S (13,6 GB, marcado como "fast, recommended") para tests automatizados de calidad de respuesta en cada commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de MMLU, HumanEval, GSM8K ni similares, ni comparaciones con otros modelos. Tampoco se proporcionan datos de perplejidad por cuantizacion mas alla del grafico generico enlazado por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos unicamente, sin overhead de contexto): Q2_K 9,0 GB; Q3_K_S 10,5 GB; Q3_K_M 11,6 GB; Q3_K_L 12,5 GB; IQ4_XS 13,0 GB; Q4_K_S 13,6 GB; Q4_K_M 14,4 GB; Q5_K_S 16,4 GB; Q5_K_M 16,9 GB; Q6_K 19,4 GB; Q8_0 25,2 GB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 sin offloading y contexto largo; RTX 4090 (24 GB) para Q6_K y hasta Q5_K_M con margen; RTX 3090/4080 (24/16 GB) para Q4_K_M; GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX A4000) para Q4_K_S con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090/3090 para Q6_K y Q5_K_M; en GPUs de 16 GB para Q4_K_M y Q4_K_S; en GPUs de 12 GB solo con offloading parcial o cuantizaciones Q2/Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI/vLLM para el modelo base, aunque vLLM requiere formato safetensors o AWQ, no GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen fuertemente de la cuantizacion, el hardware y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-24B-ArliAI-RPMax-v1.4 (este, GGUF) | 23,57 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas Q2_K-Q8_0 |
| Mistral-Small-24B-ArliAI-RPMax-v1.4-i1-GGUF (mradermacher) | 23,57 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones ponderadas/imatrix, mayor calidad por tamano |
| Mistral-Small-24B base (Mistral AI) | 24 B | no disponible | Apache 2.0 | safetensors | Modelo original sin ajuste conversacional RPMax |
| Mistral-Small-24B-Instruct (Mistral AI) | 24 B | no disponible | Apache 2.0 | safetensors | Variante instruct oficial; referencia para comparar el ajuste de ArliAI |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un ajuste conversacional sin evaluacion publicada, no hay analisis de sesgos disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de factualidad para este ajuste.
- Limitaciones de idioma: el campo `language` declara unicamente ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible; conviene verificar la configuracion del modelo base antes de usarlo con prompts largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el ajuste fino de ArliAI no incluye una model card detallada en este repositorio; se recomienda revisar la licencia y condiciones del modelo base original.
- Caveat de produccion: las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior. La cuantizacion Q3_K_M esta marcada por el autor como "lower quality".
- El repositorio tiene solo 104 descargas y 2 likes, lo que indica poca validacion comunitaria; no hay evidencia de pruebas extensas en produccion.
- Al ser un ajuste orientado a roleplay/conversacion, puede no ser adecuado para tareas de razonamiento tecnico, codigo o matematicas sin evaluacion previa.

## Enlaces

- Repositorio Hugging Face (GGUF estatico): https://huggingface.co/mradermacher/Mistral-Small-24B-ArliAI-RPMax-v1.4-GGUF
- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Mistral-Small-24B-ArliAI-RPMax-v1.4-i1-GGUF
- Modelo base: https://huggingface.co/ArliAI/Mistral-Small-24B-ArliAI-RPMax-v1.4
- Pagina de descargas del autor: https://hf.tst.eu/model#Mistral-Small-24B-ArliAI-RPMax-v1.4-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
