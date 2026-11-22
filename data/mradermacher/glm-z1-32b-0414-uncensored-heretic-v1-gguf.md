# mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v1-GGUF

## Resumen

GLM-Z1-32B-0414-uncensored-heretic-v1-GGUF es una cuantizacion en formato GGUF del modelo llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v1, publicada por mradermacher. El modelo subyacente deriva de la familia GLM-Z1 de Zhipu AI (variante de 32B con fecha de corte 0414), y ha sido modificado mediante tecnicas de "abliteration" o "decensoring" para eliminar los mecanismos de rechazo y moderacion del modelo original, marcandose con las etiquetas heretic, uncensored, decensored y abliterated. Esta version GGUF esta pensada para ejecucion local con llama.cpp y derivados.

El modelo cuenta con 32.566.081.536 parametros totales (aproximadamente 32,6 mil millones), lo que lo situa en la categoria de modelos densos de gran tamano aptos para despliegues en GPU de 24-80 GB segun cuantizacion. La model card no proporciona informacion sobre arquitectura interna, longitud de contexto ni regimen de entrenamiento del modelo base, por lo que estos datos se marcan como no disponibles.

La relevancia de esta publicacion es doble: por un lado, ofrece una via practica para ejecutar un modelo de 32B en hardware de consumo mediante cuantizaciones GGUF (desde Q2_K de 12,4 GB hasta Q8_0); por otro, documenta un caso de modelo "sin censura" que plantea consideraciones importantes sobre seguridad, sesgos y uso responsable en produccion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 22 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-Z1-32B-0414 de Zhipu AI; detalles no presentes en la informacion) |
| Parametros totales | 32.566.081.536 (32,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, x-f16 (segun metadatos de la model card) |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); modelo base en transformers/safetensors |
| Tamano del repo | 65,6 GB |
| Libreria | transformers (con soporte GGUF via llama.cpp) |
| Modelo base | llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v1 |
| Cuantizador | mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Etiquetas | heretic, uncensored, decensored, abliterated, ara, zh, en, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la denominacion GLM-Z1-32B-0414 se infiere que proviene de la familia GLM-Z1 de Zhipu AI, pero la model card del repositorio GGUF no aporta datos sobre tipo de transformer, atencion, numero de capas, dimensiones ocultas ni regimen de entrenamiento (tokens, composicion del dataset, RLHF/DPO). Tampoco se documenta el proceso concreto de "abliteration" aplicado por llmfan46 para producir la variante uncensored-heretic-v1.

Lo unico verificable es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1) a partir de los pesos en formato Hugging Face (convert_type hf). La model card indica que no hay cuantizaciones ponderadas/imatrix disponibles por el momento y que no se han planificado, aunque se pueden solicitar via discusion comunitaria. El autor remite a los README de TheBloke para instrucciones de uso de GGUF y concatenacion de ficheros multiparte.

## Capacidades

- Generacion de texto conversacional en chino e ingles (idiomas declarados en la model card).
- Razonamiento y respuesta multi-turno: la etiqueta conversational sugiere uso en dialogos, aunque no se detallan capacidades especificas de razonamiento extendido.
- Modo "sin censura": el proceso de abliteration/decensoring elimina los rechazos tipicos del modelo original, permitiendo generar contenido que el modelo base rechazaria.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que puede servirse mediante APIs compatibles con el formato de endpoints de Hugging Face.
- Ejecucion local via llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni thinking mode en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente que comportamientos emergen al eliminar los mecanismos de rechazo de un LLM de 32B, comparando respuestas con el modelo base original en tareas controladas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto) sin los rechazos del modelo alineado, en entornos donde el operador asume la responsabilidad editorial.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_S (18,8 GB) o Q4_K_M es posible ejecutar el modelo en una GPU consumer de 24 GB (RTX 3090/4090) usando llama.cpp u Ollama, sin dependencia de APIs en la nube.
- Procesamiento de texto en chino e ingles: traduccion, resumen y reescritura bilingue en pipelines internos, aprovechando el soporte declarado de ambos idiomas.
- Experimentacion con cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, lo que permite medir el impacto de la compresion (Q2_K a Q8_0) en perplejidad y calidad de salida sobre el mismo modelo.
- Pruebas de robustez y red teaming: evaluar como responde un modelo decensored ante prompts adversariales, util para construir clasificadores de seguridad o filtros de contenido en produccion.
- Fine-tuning posterior: al estar bajo licencia MIT y disponible en GGUF y safetensors (modelo base), puede servir como punto de partida para ajustes especificos de dominio en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad para las distintas cuantizaciones. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamanos de fichero declarados en la model card):
  - Q2_K: 12,4 GB
  - Q4_K_S: 18,8 GB (marcada como "fast, recommended")
  - Otras variantes (Q3_K_S/M/L, Q4_K_M, Q5_K_S/M, Q6_K, Q8_0, IQ4_XS, x-f16): tamanos no listados en la informacion, aunque el repo completo ocupa 65,6 GB.
- GPU recomendadas: no disponibles de forma explicita. Por el tamano de las cuantizaciones, Q4_K_S encaja en GPUs de 24 GB (RTX 3090, RTX 4090, A10G); Q8_0 y x-f16 requeririan 40-80 GB (A100 40/80 GB, H100).
- GPU consumer: si, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; Q2_K cabria incluso en GPUs de 16 GB con margen para contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-Z1-32B-0414-uncensored-heretic-v1-GGUF (este) | 32,6 B | no disponible | MIT | GGUF | Variante decensored, 12 cuantizaciones, 0 descargas |
| llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v1 | 32,6 B | no disponible | MIT | safetensors | Modelo base del que deriva esta cuantizacion |
| Modelo GLM-Z1-32B-0414 original (Zhipu AI) | ~32 B | no disponible | no disponible en la informacion | safetensors | Version alineada con rechazos; referencia para comparar el efecto del decensoring |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo explicitamente "uncensored/abliterated": no aplica los filtros de seguridad del modelo original. Puede generar contenido danino, ilegal o sexualmente explicito. No apto para produccion orientada al publico general sin capas de moderacion adicionales.
- Riesgo elevado de alucinacion: no hay datos de evaluacion que cuantifiquen la fiabilidad factual; el proceso de abliteration puede degradar capacidades de razonamiento y coherencia respecto al modelo base.
- Idiomas limitados a chino e ingles segun la model card; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto no documentada: no se puede garantizar el soporte de ventanas largas.
- Cuantizaciones de baja calidad (Q2_K) degradan notablemente la perplejidad; la propia model card remite a la grafica de ikawrakow y al analisis de Artefact2 sobre el impacto de los tipos de cuantizacion.
- Licencia MIT permite uso comercial, pero el operador asume toda la responsabilidad legal sobre el contenido generado; la licencia del modelo base GLM-Z1 original no se detalla en la informacion.
- Repositorio sin adopcion (0 descargas, 0 likes) y sin garantias de mantenimiento; no hay cuantizaciones imatrix/ponderadas disponibles ni planificadas.
- No se documentan capacidades de tool calling ni agentes; no asumir su disponibilidad en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v1-GGUF
- Modelo base: https://huggingface.co/llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#GLM-Z1-32B-0414-uncensored-heretic-v1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del cuantizador): https://www.nethype.de/
