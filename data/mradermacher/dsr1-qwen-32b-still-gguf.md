# mradermacher/DSR1-Qwen-32B-still-GGUF

## Resumen

DSR1-Qwen-32B-still-GGUF es la versión cuantizada en formato GGUF del modelo moogician/DSR1-Qwen-32B-still, un ajuste fino (fine-tuning completo, no LoRA) realizado con Llama Factory sobre una base Qwen de 32.000 millones de parámetros. El modelo resultante tiene 32.763.876.352 parámetros y está orientado a tareas conversacionales y de razonamiento, presumiblemente en la línea de la familia DeepSeek-R1 (de ahí el prefijo "DSR1"). Esta versión GGUF la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y su propósito es facilitar la inferencia local en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 32B en equipos con GPU de consumo (o incluso CPU con suficiente RAM) gracias a las cuantizaciones de 2 a 8 bits que van desde 12,4 GB hasta 34,9 GB. El repo tiene 224 GB porque incluye todas las variantes de cuantización publicadas. Es un modelo derivado, no oficial, con licencia "other" heredada del modelo base, y con muy poca tracción en la comunidad (76 descargas, 0 likes en el momento de la consulta).

La información disponible sobre el modelo original (moogician/DSR1-Qwen-32B-still) es muy limitada: no se detallan datos de entrenamiento, composición del dataset ni resultados de benchmarks. Por tanto, esta ficha se centra en lo que sí se puede verificar: la arquitectura subyacente (Qwen de 32B), el proceso de cuantización y los requisitos prácticos de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen de 32B, ajuste fino con Llama Factory) |
| Parámetros totales | 32.763.876.352 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (según model card) |
| Licencia | other (heredada del modelo base; consultar términos del modelo original) |
| Formato de pesos | GGUF (cuantizaciones estáticas; no hay imatrix disponibles) |

## Arquitectura y entrenamiento

El modelo original moogician/DSR1-Qwen-32B-still se generó mediante un ajuste fino completo (tag "full" y "generated_from_trainer") usando Llama Factory sobre una base Qwen de 32B. No se especifica en la información disponible qué variante exacta de Qwen se usó (Qwen2.5, Qwen3, etc.), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO. El prefijo "DSR1" sugiere una destilación o adaptación inspirada en DeepSeek-R1, probablemente orientada a razonamiento con cadenas de pensamiento, pero esto no se confirma en la model card.

La contribución de mradermacher es puramente de cuantización: convierte los pesos originales en safetensors a GGUF con distintos niveles de precisión (Q2_K a Q8_0) usando las herramientas estándar de llama.cpp. No se han generado cuantizaciones con imatrix (weighted quants), lo que significa que la calidad por bit es la estándar de las cuantizaciones estáticas, no la mejorada que ofrecen las imatrix. El proceso de conversión es de tipo "hf" y usa cuantización de tensores de salida (output_tensor_quantised: 1).

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat (tag "conversational").
- Razonamiento y resolución de problemas, presumiblemente con capacidad de cadena de pensamiento (no confirmado explícitamente en la model card).
- Generación de código y tareas de programación (capacidad heredada de la base Qwen, no verificada en esta versión).
- Capacidades matemáticas (heredadas de la base, no verificadas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card (aunque la base Qwen suele tener capacidades multilingües, no se declaran aquí).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M (20 GB) o IQ4_XS (18 GB), el modelo se puede ejecutar en una RTX 4090 (24 GB) o en dos GPUs de 12 GB, permitiendo prototipado de asistentes conversacionales sin depender de la nube.
- Despliegue en servidores con CPU y RAM abundante: la variante Q2_K (12,4 GB) o Q3_K_S (14,5 GB) permite ejecutar el modelo en equipos sin GPU dedicada, útil para entornos de desarrollo o pruebas de integración.
- Asistente de razonamiento para documentación técnica: si el modelo conserva las capacidades de razonamiento de la familia DeepSeek-R1, se puede usar para generar explicaciones paso a paso de conceptos complejos, aunque la falta de benchmarks hace recomendable validar la calidad antes de producción.
- Generación de código en pipelines de CI/CD: la base Qwen de 32B suele tener buen rendimiento en código; con la cuantización Q5_K_M (23,4 GB) se puede integrar en herramientas de revisión automática de código, siempre que se valide la calidad del fine-tuning.
- Chatbot de atención al cliente en inglés: el modelo está etiquetado como conversacional y en inglés, por lo que encaja en asistentes virtuales para mercados angloparlantes, con la salvedad de que no se ha publicado la longitud de contexto soportada.
- Experimentación académica con modelos cuantizados: investigadores que quieran comparar el impacto de distintas cuantizaciones (Q2 a Q8) en tareas de razonamiento pueden usar este repo como banco de pruebas, ya que ofrece 11 variantes del mismo modelo.
- Fine-tuning adicional sobre GGUF: no es el caso de uso típico (GGUF no está pensado para reentrenar), pero se puede usar como base para LoRA mediante herramientas que lo soporten, aunque es más recomendable partir del modelo original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del modelo original ni la del cuantizador incluyen métricas de MMLU, HumanEval, GSM8K u otras. Tampoco se han publicado comparativas de perplejidad entre las distintas cuantizaciones para este modelo concreto (la gráfica de ikawrakow que aparece en la model card es genérica, no específica de este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~12,4 GB
  - Q3_K_M: ~16,0 GB
  - IQ4_XS: ~18,0 GB
  - Q4_K_M: ~20,0 GB
  - Q5_K_M: ~23,4 GB
  - Q6_K: ~27,0 GB
  - Q8_0: ~34,9 GB
- GPU recomendadas:
  - Q4_K_M en una sola GPU: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), L40S (48 GB).
  - Q6_K o Q8_0: A100 40/80 GB, H100, o dos GPUs de 24 GB.
  - Cuantizaciones Q2/Q3: RTX 4080 (16 GB) o RTX 4060 Ti (16 GB) con margen justo; mejor en 24 GB.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (20 GB) cabe en RTX 4090/3090; Q3_K_M (16 GB) cabe en RTX 4080/4060 Ti de 16 GB; Q2_K (12,4 GB) cabe en RTX 4070 Ti (12 GB) con muy poco margen para contexto.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server. No es compatible directamente con vLLM o TGI en formato GGUF (requieren safetensors o AWQ/GPTQ).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen en gran medida del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DSR1-Qwen-32B-still-GGUF (este) | 32,76 B | no disponible | other | GGUF | Fine-tuning comunitario con Llama Factory, sin benchmarks publicados |
| Qwen2.5-32B-Instruct (GGUF) | ~32,5 B | 128K (según versión) | Apache 2.0 (según variante) | GGUF, safetensors | Modelo oficial con benchmarks publicados y amplia adopción |
| DeepSeek-R1-Distill-Qwen-32B (GGUF) | ~32,8 B | 128K (según versión) | MIT (según variante) | GGUF, safetensors | Destilación oficial de DeepSeek con benchmarks publicados |
| mradermacher/DSR1-Qwen-32B-still-GGUF | 32,76 B | no disponible | other | GGUF | Este modelo; derivado no oficial, sin validación pública |

La comparativa se basa en la categoría (modelos de ~32B en GGUF), pero los datos de contexto y licencia de las alternativas pueden variar según la variante exacta. No se dispone de datos de rendimiento comparativo porque este modelo no publica benchmarks.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos en la información disponible; es imprescindible consultar la licencia del modelo base (moogician/DSR1-Qwen-32B-still) y de la base Qwen subyacente antes de cualquier uso comercial.
- Modelo derivado no oficial: no está respaldado por Alibaba (Qwen) ni por DeepSeek; la calidad del fine-tuning no está validada con benchmarks públicos.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Riesgo de alucinación: inherente a los modelos de 32B sin datos de evaluación; especialmente relevante en tareas de razonamiento y código.
- Sin cuantizaciones imatrix: las variantes publicadas son estáticas, por lo que la calidad por bit es inferior a la de cuantizaciones ponderadas equivalentes.
- Tracción comunitaria muy baja (76 descargas, 0 likes): no hay retroalimentación de usuarios que permita anticipar problemas de calidad o de formato de chat.
- Formato de chat no documentado: no se especifica la plantilla de prompt recomendada, lo que puede degradar el rendimiento conversacional si se usa una plantilla incorrecta.
- Repo de 224 GB: descargar el repo completo no es práctico; hay que descargar solo el archivo GGUF de la cuantización deseada.

## Enlaces

- Repo GGUF en Hugging Face: https://huggingface.co/mradermacher/DSR1-Qwen-32B-still-GGUF
- Modelo base (original): https://huggingface.co/moogician/DSR1-Qwen-32B-still
- Página de overview de cuantizaciones de mradermacher: https://hf.tst.eu/model#DSR1-Qwen-32B-still-GGUF
- README de referencia de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Llama Factory (framework de fine-tuning usado): https://github.com/hiyouga/LLaMA-Factory
