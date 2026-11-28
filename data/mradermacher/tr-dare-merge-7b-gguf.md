# mradermacher/tr-dare-merge-7B-GGUF

## Resumen

tr-dare-merge-7B-GGUF es la distribucion en formato GGUF del modelo tr-dare-merge-7B, un merge de modelos de 7.000 millones de parametros publicado por el usuario berkecr y cuantizado por mradermacher. El modelo combina pesos mediante la tecnica DARE (Drop And REscale) a traves de mergekit/lazymergekit, partiendo de Mistral-7B-Instruct-v0.2 como uno de los componentes del merge. Esta orientado a conversacion en turco e ingles.

La relevancia de esta ficha reside en que el repositorio original solo distribuye pesos en formato transformers; esta version GGUF permite ejecutar el modelo en CPU, GPU de consumo y entornos con llama.cpp u Ollama, con cuantizaciones desde Q2_K (2,8 GB) hasta f16 (14,6 GB). El modelo tiene 7.241.732.096 parametros y esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

Se trata de un modelo de nicho: el merge esta pensado principalmente para turco, con soporte secundario de ingles, y no incluye datos publicados de benchmarks ni detalles sobre la composicion exacta del merge o el volumen de datos de entrenamiento. Su interes practico esta en desplegar un asistente conversacional en turco en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-7B-Instruct-v0.2, fusionada mediante DARE/mergekit) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Mistral-7B-Instruct-v0.2 soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero. Se construyo con mergekit/lazymergekit aplicando la tecnica DARE, que elimina (drop) un subconjunto de los parametros delta de los modelos donantes y reescala (rescale) los restantes antes de combinarlos. El resultado hereda la arquitectura transformer decoder-only de Mistral-7B-Instruct-v0.2, con 7.241.732.096 parametros. No se dispone de informacion sobre los demas modelos que participan en el merge, los coeficientes de fusion ni la configuracion exacta de DARE.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre etapas de RLHF, DPO o SFT posteriores al merge. El autor tampoco documenta innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). Esta version GGUF es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) realizada por mradermacher; existe una variante con cuantizaciones ponderadas/imatrix en el repositorio tr-dare-merge-7B-i1-GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno en turco e ingles.
- Razonamiento basico y respuesta a instrucciones, heredado del componente Mistral-7B-Instruct-v0.2.
- Generacion de codigo y matematicas a nivel de modelo de 7B, aunque sin benchmarks que lo confirmen para este merge concreto.
- Soporte de tool calling / function calling: no documentado explicitamente en la model card; no se garantiza.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues limitadas a turco e ingles segun los metadatos del autor.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia via llama.cpp y ecosistema GGUF, con compatibilidad declarada con endpoints.

## Casos de uso

- Asistente conversacional en turco: el modelo puede gestionar dialogos multi-turno en turco sobre hardware de consumo usando la cuantizacion Q4_K_M (4,5 GB), adecuada para prototipos y aplicaciones de chat locales.
- Despliegue en CPU sin GPU: con Q2_K (2,8 GB) o Q3_K_S (3,3 GB) se puede ejecutar en servidores sin acelerador, util para demos o entornos de bajo coste donde la latencia no es critica.
- Traduccion y adaptacion turco-ingles: al soportar ambos idiomas, sirve para tareas de reescritura, resumen o traduccion asistida en pipelines internos, siempre con revision humana por el riesgo de alucinacion.
- Chatbot de soporte en aplicaciones moviles o de escritorio: la cuantizacion Q4_K_S (4,2 GB) cabe en GPUs de consumo y permite integrar el modelo en apps locales mediante llama.cpp u Ollama.
- Experimentacion con merges de modelos: investigadores interesados en evaluar el efecto de DARE y mergekit sobre Mistral-7B pueden usar estas cuantizaciones para comparar calidad frente al modelo base con bajo coste de infraestructura.
- Generacion de texto asistida en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial e integracion en productos sin obligaciones de atribucion adicionales mas alla de las de la propia licencia.
- Fine-tuning ligero sobre el modelo base: quien necesite adaptar el modelo a un dominio concreto puede partir del repositorio original en safetensors (berkecr/tr-dare-merge-7B) y usar estas cuantizaciones solo para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~3 GB, Q3_K_M ~4 GB, Q4_K_M ~5 GB, Q5_K_M ~6 GB, Q6_K ~7 GB, Q8_0 ~8,5 GB, f16 ~15 GB.
- GPU recomendadas: para f16 o Q8_0, una RTX 3090/4090 (24 GB) o A100/H100; para Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB (Q4_K_S/Q4_K_M) hasta 12-16 GB para cuantizaciones altas; las cuantizaciones Q2/Q3 caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). Para el modelo original en safetensors, transformers con vLLM o TGI.
- Latencia y throughput estimados: no disponibles; dependen de la cuantizacion y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tr-dare-merge-7B-GGUF | 7.241.732.096 | no disponible | tr, en | Apache 2.0 | GGUF | Merge DARE sobre Mistral-7B-Instruct-v0.2; sin benchmarks publicados |
| Mistral-7B-Instruct-v0.2 | ~7.240 millones | 32.768 tokens | en (principal) | Apache 2.0 | safetensors, GGUF | Modelo base de referencia; buen rendimiento en ingles, limitado en turco |
| Trendyol-LLM-7B (serie turca) | ~7.000 millones | variable segun version | tr, en | varía segun version | safetensors, GGUF | Modelos especificamente entrenados para turco; alternativa mas documentada |
| Cosmos-LLM / otros merges turcos de 7B | ~7.000 millones | no disponible | tr, en | variable | safetensors, GGUF | Merges comunitarios con objetivos similares; comparacion de calidad no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados: no se puede verificar la calidad del merge frente al modelo base ni frente a alternativas.
- Riesgo de alucinacion inherente a los modelos de 7B, especialmente en dominios especializados y en turco, donde los datos de entrenamiento suelen ser mas escasos.
- Sesgos desconocidos: al no documentarse la composicion del merge ni los datos de entrenamiento, no se pueden evaluar sesgos de genero, etnicos o politicos.
- Cobertura limitada de idiomas: solo turco e ingles declarados; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no confirmada para este merge; no asumir los 32.768 tokens del modelo base sin verificar.
- Tool calling y comportamiento agentico no documentados; no recomendable para pipelines que dependan de function calling sin validacion previa.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes del merge (Mistral-7B-Instruct-v0.2 es Apache 2.0; los demas componentes no estan identificados).
- Modelo de nicho con 239 descargas y 0 likes en el momento de la consulta: comunidad pequena, soporte y mantenimiento inciertos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/tr-dare-merge-7B-GGUF
- Modelo base original: https://huggingface.co/berkecr/tr-dare-merge-7B
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/tr-dare-merge-7B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#tr-dare-merge-7B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo base Mistral-7B-Instruct-v0.2: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
