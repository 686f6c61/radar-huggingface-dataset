# llmfan46/GLM-4-32B-0414-uncensored-heretic-v2-GGUF

## Resumen

GLM-4-32B-0414-uncensored-heretic-v2-GGUF es una cuantizacion en formato GGUF del modelo GLM-4-32B-0414-uncensored-heretic-v2, publicado por el usuario independiente llmfan46. Se trata de una version "decensurada" (tambien etiquetada como abliterated y heretic) del GLM-4-32B-0414 original desarrollado por zai-org (Zhipu AI). El proceso de modificacion se realizo con la herramienta Heretic v1.2.0 aplicando el metodo Arbitrary-Rank Ablation (ARA), que elimina direcciones de activacion asociadas a rechazos y respuestas moralizantes sin reentrenar los pesos.

El modelo base GLM-4-32B-0414 es un transformer denso de 32.566.081.536 parametros (aproximadamente 32,6 mil millones), preentrenado sobre 15 billones de tokens de datos de alta calidad que incluyen abundante datos sinteticos de razonamiento. El postentrenamiento combina alineacion con preferencias humanas, rejection sampling y aprendizaje por refuerzo, orientado a instrucciones, codigo de ingenieria y function calling. La version aqui descrita conserva esa base pero con las restricciones de contenido reducidas: segun el autor, los rechazos pasan de 100/100 en el original a 7/100, con una divergencia KL de 0,0555 respecto al modelo de partida.

La relevancia de esta ficha es doble: por un lado documenta un caso de cuantizacion GGUF de un modelo de 32B pensado para despliegue local; por otro, ilustra las tecnicas de abliteration aplicadas a modelos de gran tamano y sus implicaciones practicas (reduccion de restricciones a costa de una degradacion medible de coherencia). El repositorio ocupa 191,8 GB y ofrece seis niveles de cuantizacion, desde BF16 hasta Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia GLM-4; sin confirmar detalles de atencion en la informacion disponible) |
| Parametros totales | 32.566.081.536 (32,6B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repo | 191,8 GB |
| Modelo base | llmfan46/GLM-4-32B-0414-uncensored-heretic-v2 (a su vez derivado de zai-org/GLM-4-32B-0414) |
| Metodo de decensurado | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) |
| Descargas | 314 |
| Fecha de creacion | 2026-03-17 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 32,6B parametros de la familia GLM-4. El GLM-4-32B-Base-0414 original se preentreno sobre 15T de tokens de datos de alta calidad, con una proporcion significativa de datos sinteticos de tipo razonamiento, lo que sirve de base para las fases posteriores de reinforcement learning. En la etapa de postentrenamiento se aplico alineacion con preferencias humanas para dialogos, rejection sampling y aprendizaje por refuerzo, con el objetivo de mejorar el seguimiento de instrucciones, el codigo de ingenieria y el function calling, capacidades atomicas para tareas de agente.

Sobre esa base, llmfan46 aplico la tecnica de abliteration con Heretic v1.2.0 y el metodo ARA. Los parametros declarados son: start_layer_index 28, end_layer_index 56, preserve_good_behavior_weight 0,8337, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 1,1753 y neighbor_count 1. Esta configuracion identifica y elimina direcciones de activacion responsables de rechazos en las capas 28 a 56. El autor reporta una divergencia KL de 0,0555 frente al modelo original y una reduccion de rechazos de 100/100 a 7/100 en una evaluacion de 100 prompts. No se dispone de informacion sobre la composicion exacta del dataset de calibracion de Heretic ni sobre el numero de tokens adicionales empleados.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento e instrucciones: hereda las capacidades del GLM-4-32B-0414, orientado a seguimiento de instrucciones y tareas de agente.
- Codigo de ingenieria y generacion de artefactos: el modelo original destaca en codigo de ingenieria, generacion de Artifact y generacion de informes.
- Function calling / tool calling: soportado por el modelo base, reforzado en el postentrenamiento.
- Razonamiento multi-paso y uso como base para agentes.
- Busqueda y QA con recuperacion (search-based Q&A) segun la model card del modelo original.
- Contenido sin restricciones: reduccion drastica de rechazos (7/100 segun el autor), lo que permite respuestas a solicitudes que el modelo original rechazaria.
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Despliegue local de un asistente conversacional de 32B: con cuantizaciones Q4_K_M o Q5_K_M el modelo cabe en GPUs de consumo de 24 GB y permite conversaciones multi-turno en ingles y chino sin depender de APIs externas.
- Generacion de codigo en pipelines de desarrollo: el modelo base rinde bien en codigo de ingenieria y soporta function calling, por lo que puede integrarse en asistentes de IDE o revisores automaticos de pull requests.
- Automatizacion de agentes con herramientas: el soporte de tool calling y razonamiento multi-paso permite construir agentes que consulten APIs, ejecuten busquedas y compongan informes.
- Investigacion sobre alineacion y seguridad: util como caso de estudio de abliteration, midiendo el efecto de la reduccion de rechazos sobre la coherencia y la calidad de las respuestas.
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o material editorial donde el modelo original aplicaria restricciones de contenido.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece seis niveles (BF16 a Q4_K_M), lo que permite estudiar el compromiso entre calidad y VRAM en un mismo modelo.
- Procesamiento de documentacion tecnica bilingue ingles-chino: traduccion y resumen de documentacion con terminologia especializada.

## Benchmarks y rendimiento

La informacion proporcionada no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta version cuantizada ni para el modelo decensurado. Los unicos datos de rendimiento publicados por el autor son los siguientes:

| Metrica | Este modelo | Modelo original (zai-org/GLM-4-32B-0414) |
|---|---|---|
| Divergencia KL | 0,0555 | 0 (por definicion) |
| Rechazos (100 prompts) | 7/100 | 100/100 |

La model card del modelo original afirma que GLM-4-32B-Base-0414 alcanza un rendimiento comparable a GPT-4o y DeepSeek-V3-0324 (671B) en algunos benchmarks de generacion de codigo y QA especifico, pero no se aportan cifras concretas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto):
  - BF16: ~65 GB.
  - Q8_0: ~35 GB.
  - Q6_K: ~27 GB.
  - Q5_K_M: ~23 GB.
  - Q5_K_S: ~22 GB.
  - Q4_K_M: ~20 GB.
- GPU recomendadas: A100 80 GB o H100 para BF16 y Q8_0; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB no cabe en ninguna cuantizacion del repo.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier herramienta compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, aunque esta ficha se centra en las cuantizaciones GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-4-32B-0414-uncensored-heretic-v2-GGUF (este) | 32,6B | no disponible | MIT | GGUF | Decensurado con Heretic/ARA; rechazos 7/100 |
| zai-org/GLM-4-32B-0414 | 32B | no disponible | no disponible | safetensors | Modelo original alineado; rechazos 100/100 |
| GLM-Z1-32B-0414 | 32B | no disponible | no disponible | safetensors | Variante de razonamiento con thinking extendido |
| GLM-Z1-Rumination-32B-0414 | 32B | no disponible | no disponible | safetensors | Variante de razonamiento profundo orientada a investigacion |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration degrada la coherencia de forma medible: la divergencia KL de 0,0555 implica una desviacion no nula respecto al modelo original, con posible perdida de calidad en razonamiento y generacion.
- Contenido sin filtros: el modelo puede producir respuestas a solicitudes que el original rechazaria, lo que exige supervision y politicas de uso en produccion.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un modelo entrenado principalmente en ingles y chino, los sesgos culturales y linguisticos de esos corpus persisten.
- Riesgo de alucinacion: inherente a los modelos de 32B; no se han publicado evaluaciones especificas de factualidad para esta variante.
- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, por lo que no debe asumirse una ventana concreta.
- Licencia MIT declarada en el repo, pero conviene verificar las condiciones del modelo base de Zhipu AI antes de un uso comercial, ya que la licencia del derivado no sustituye a la del original.
- El autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face y que el repositorio podria no recibir nuevas actualizaciones.
- Sin datos de benchmarks estandar, no es posible validar el rendimiento frente a alternativas de la misma categoria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/GLM-4-32B-0414-uncensored-heretic-v2-GGUF
- Modelo decensurado base: https://huggingface.co/llmfan46/GLM-4-32B-0414-uncensored-heretic-v2
- Modelo original: https://huggingface.co/zai-org/GLM-4-32B-0414
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request del metodo ARA: https://github.com/p-e-w/heretic/pull/211
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
