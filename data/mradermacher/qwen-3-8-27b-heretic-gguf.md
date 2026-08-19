# mradermacher/Qwen-3.8-27B-Heretic-GGUF

## Resumen

El repositorio `mradermacher/Qwen-3.8-27B-Heretic-GGUF` contiene cuantizaciones en formato GGUF del modelo `OpenIntelligenceNet/Qwen-3.8-27B-Heretic`, un modelo de lenguaje de 27 320 697 856 parámetros (~27,3B) con licencia Apache 2.0 y soporte declarado únicamente para inglés. El autor, mradermacher, ha generado una serie de cuantizaciones estáticas (sin imatrix) que permiten ejecutar el modelo en entornos con recursos limitados, desde 11 GB hasta 29 GB según la precisión elegida. Además, se incluyen dos archivos de proyección multimodal (`mmproj`) en Q8_0 y f16, lo que sugiere que el modelo base podría tener capacidades de visión, aunque no se confirma en la documentación disponible.

Este repositorio es relevante para desarrolladores que necesitan desplegar un LLM de 27B en local o en producción con requisitos de memoria ajustables. Al tratarse de una cuantización GGUF, es compatible con herramientas como llama.cpp, Ollama, LM Studio o servidores compatibles con GGUF. La ausencia de cuantizaciones con imatrix puede implicar una ligera pérdida de calidad frente a versiones optimizadas, pero la variedad de tamaños ofrece flexibilidad para distintos hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `OpenIntelligenceNet/Qwen-3.8-27B-Heretic`. El nombre sugiere una posible derivacion de la familia Qwen, pero no hay documentacion publica que confirme la topologia (transformer, MoE, etc.), el numero de capas, la configuracion de atencion o el proceso de entrenamiento (datos, tokens, tecnicas de alineacion como RLHF o DPO). Tampoco se especifica si el modelo original es multimodal; la presencia de archivos `mmproj` en la cuantizacion indica que el modelo base podria incluir un proyector de vision, pero no se aportan detalles adicionales.

El presente repositorio se limita a la conversion a formato GGUF mediante cuantizacion estatica. No se han aplicado tecnicas de cuantizacion con imatrix ni se han generado pesos mixtos de alta precision, segun indica el propio autor en la model card. Por tanto, las caracteristicas de rendimiento dependen enteramente del modelo base, del cual no se ha publicado informacion tecnica en este repositorio.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Posible soporte multimodal (vision) gracias a los archivos `mmproj` incluidos, aunque no se confirma en la documentacion.
- Capacidad de conversacion (etiqueta `conversational` en HuggingFace).
- No se documentan capacidades especificas como tool calling, razonamiento avanzado, generacion de codigo o matematicas.
- No se especifica si soporta modos de pensamiento o agentes.

## Casos de uso

- Despliegue local de un LLM de 27B en equipos con GPU de consumo (por ejemplo, RTX 4090 con 24 GB) usando cuantizaciones Q4_K_M (16,9 GB) o Q5_K_M (19,6 GB).
- Inferencia en CPU mediante llama.cpp u Ollama, aprovechando cuantizaciones Q2_K o Q3_K para entornos sin GPU.
- Prototipado de aplicaciones conversacionales en ingles donde se requiera un modelo de tamano medio sin depender de APIs externas.
- Uso como base para fine-tuning posterior, ya que la licencia Apache 2.0 permite modificacion y uso comercial.
- Evaluacion de la calidad de cuantizaciones GGUF frente al modelo original en tareas de generacion de texto.
- Integracion en pipelines de inferencia con herramientas compatibles con GGUF (llama.cpp, llama-cpp-python, etc.) para entornos de produccion con requisitos de latencia moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras metricas para este modelo ni para su cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K (11,0 GB): cabe en GPUs con 12 GB (p. ej., RTX 3060, RTX 4070).
  - Q4_K_M (16,9 GB): requiere al menos 20 GB de VRAM; recomendable RTX 4090 (24 GB) o A5000.
  - Q8_0 (29,1 GB): necesita GPU con 32 GB o mas, como A100 40 GB o H100.
- Para CPU, se puede usar llama.cpp con cuantizaciones Q4_K_M o inferiores, con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF (por ejemplo, llama-cpp-python).
- Latencia y throughput no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base `OpenIntelligenceNet/Qwen-3.8-27B-Heretic` no tiene documentacion publica que permita compararlo con alternativas como Llama-3-8B, Mistral-7B o Qwen-2.5-14B. La unica referencia es el numero de parametros (27,3B), que lo situa en un rango intermedio entre modelos de 13B y 30B, pero sin datos de rendimiento no es posible realizar una comparacion objetiva.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones especificas del modelo base. Se desconoce su comportamiento en dominios sensibles.
- La cuantizacion es estatica y no incluye imatrix, lo que puede degradar la calidad en comparacion con cuantizaciones optimizadas para el mismo tamaño.
- El modelo solo declara soporte para ingles; su rendimiento en otros idiomas es incierto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base original por si hubiera restricciones adicionales.
- No se garantiza la disponibilidad de actualizaciones o soporte por parte del autor del repositorio.
- La presencia de archivos `mmproj` no confirma que el modelo sea multimodal; es posible que el proyector no sea funcional sin el modelo base original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen-3.8-27B-Heretic-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/OpenIntelligenceNet/Qwen-3.8-27B-Heretic
- Pagina de ayuda del autor para solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
