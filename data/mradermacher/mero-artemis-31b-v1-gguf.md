# mradermacher/Mero-Artemis-31B-v1-GGUF

## Resumen

Mero-Artemis-31B-v1-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo pineapplesuperfan/Mero-Artemis-31B-v1, publicado por mradermacher, un creador conocido en la comunidad de Hugging Face por cuantizar modelos de terceros. El modelo base es un merge (fusión de modelos) realizado con mergekit, de unos 30.700 millones de parámetros, orientado a uso conversacional en inglés. La etiqueta "not-for-all-audiences" sugiere que el modelo base puede generar contenido no apto para todos los públicos, algo habitual en merges de la comunidad orientados a roleplay o escritura creativa sin filtros.

La relevancia de esta ficha no está tanto en el modelo original como en la disponibilidad de cuantizaciones: mradermacher ofrece once variantes que van desde Q2_K (12 GB) hasta Q8_0 (32,7 GB), lo que permite ejecutar un modelo de más de 30B en hardware de consumo. Existen además cuantizaciones imatrix (weighted) de mayor calidad en un repositorio complementario. Es una opción interesante para quien busque modelos de 30B fusionados con licencia Apache 2.0 para inferencia local con llama.cpp, Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer; modelo base creado con mergekit) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (imatrix en repo aparte) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

El modelo base, pineapplesuperfan/Mero-Artemis-31B-v1, es un merge creado con mergekit, la herramienta estandar de la comunidad para fusionar modelos. Esto significa que combina pesos de varios modelos fuente mediante tecnicas como SLERP, TIES o DARE, sin un entrenamiento post-fusion documentado. No se dispone de informacion sobre la arquitectura subyacente exacta (aunque el tamano de ~30,7B y el uso de mergekit apuntan a bases tipo Llama/Qwen de la comunidad), ni sobre el numero de tokens de entrenamiento, composicion del dataset o uso de RLHF/DPO en los modelos origen.

El trabajo de mradermacher se limita a la conversion y cuantizacion: los ficheros GGUF se generan desde los pesos safetensors en formato HF (convert_type: hf) y se ofrecen cuantizaciones estaticas del tipo k-quants e i-quants de Ikawrakow. No hay entrenamiento adicional, ajuste fino ni destilacion en esta etapa.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline etiquetado como conversational).
- Al ser un merge comunitario con etiqueta "not-for-all-audiences", probablemente orientado a escritura creativa, roleplay y generacion de texto sin restricciones de alineacion estrictas (no verificado en la documentacion).
- No consta soporte documentado de vision, audio, tool calling ni thinking mode.
- Capacidades de codigo, matematicas o razonamiento: no disponibles en la informacion proporcionada (dependerian de los modelos fuente del merge).

## Casos de uso

- Chatbot local en inglés: ejecutando la variante Q4_K_M (18,8 GB) con llama.cpp u Ollama se puede montar un asistente conversacional offline en una GPU de consumo o incluso en CPU con RAM suficiente.
- Escritura creativa y roleplay: los merges comunitarios con etiqueta "not-for-all-audiences" se emplean tipicamente para narrativa interactiva y ficcion, donde el modelo base fue probablemente optimizado.
- Experimentacion con merges: al ser un merge de mergekit con licencia Apache 2.0, es util como base para estudiar el efecto de las tecnicas de fusion en modelos de ~30B.
- Pruebas comparativas de cuantizaciones: con once variantes disponibles, es un buen banco de pruebas para medir la degradacion de calidad entre Q2_K y Q8_0 en hardware limitado.
- Integracion en aplicaciones locales tipo LM Studio o GPT4All: el formato GGUF es directamente compatible, lo que facilita el despliegue en escritorio sin infraestructura de servidor.
- Prototipado de agentes locales en ingles: aunque no hay soporte de tool calling documentado, un modelo conversacional de 30B cuantizado puede usarse para prototipos de agentes simples con prompting, asumiendo las limitaciones de fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo completo en GPU): Q2_K ~12 GB, Q4_K_M ~18,8 GB, Q6_K ~25,3 GB, Q8_0 ~32,7 GB; anadir margen para el KV cache segun la longitud de contexto.
- Consumer GPUs: una RTX 4090 (24 GB) ejecuta con holgura Q4_K_M y Q5_K_M; Q6_K cabe de forma ajustada con contexto reducido; Q8_0 requiere offload parcial a CPU o una GPU de 48 GB (A6000, RTX A6000, L40S).
- Datacenter GPUs: A100 40 GB o H100 ejecutan cualquier variante, incluida la version imatrix de mayor calidad, sin offload.
- En CPU: viable con 16-32 GB de RAM usando Q2_K/Q3_K, con velocidades de generacion bajas para un modelo de este tamano (tipicamente unas pocas decenas de tokens por segundo en CPU moderna, dato estimado, no publicado).
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No es un GGUF orientado a vLLM/TGI, que consumen preferentemente pesos safetensors del modelo base.
- Los ficheros multi-parte pueden concatenarse siguiendo las instrucciones referenciadas en el README.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Mero-Artemis-31B-v1-GGUF | 30,7B | GGUF (11 cuants) | Apache 2.0 | Merge comunitario, ingles, not-for-all-audiences |
| Qwen2.5-32B-Instruct (GGUF) | 32,5B | GGUF/safetensors | Qwen license (uso comercial condicionado) | Modelo oficial, multilingue, benchmarks publicados |
| Yi-1.5-34B-Chat (GGUF) | 34,4B | GGUF/safetensors | Apache 2.0 | Modelo oficial con entrenamiento documentado, bilingue en-cn |

La ventaja de la ficha de mradermacher frente a alternativas oficiales es la amplitud de cuantizaciones y la existencia de versiones imatrix; la desventaja es la falta de documentacion sobre el modelo base y de benchmarks publicados.

## Limitaciones y advertencias

- Etiqueta "not-for-all-audiences": el modelo puede generar contenido sensible o explicito; no apto para despliegues orientados a publico general sin capas adicionales de moderacion.
- Idioma: documentado solo para ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea inferior.
- Longitud de contexto no documentada: habra que consultar la config del modelo base antes de planificar aplicaciones con documentos largos.
- Al ser un merge sin ficha tecnica detallada, no hay garantias sobre procedencia de los datos de entrenamiento de los modelos fuente ni sobre sesgos concretos; asuma sesgos tipicos de LLM entrenados con datos web.
- Riesgo de alucinacion estandar de LLM, agravado por la ausencia de benchmarks que permitan evaluar fiabilidad en tareas de razonamiento o codigo.
- Licencia Apache 2.0: permite uso comercial, pero los terminos de los modelos fuente del merge podrian anadir restricciones; verifique el modelo base antes de uso en produccion.
- Las cuantizaciones Q2_K y Q3_K implican perdida de calidad notable; para produccion se recomienda Q4_K_M o superior, o las variantes imatrix del repo complementario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mero-Artemis-31B-v1-GGUF
- Modelo base: https://huggingface.co/pineapplesuperfan/Mero-Artemis-31B-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Mero-Artemis-31B-v1-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Mero-Artemis-31B-v1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa de mradermacher: https://www.nethype.de/
