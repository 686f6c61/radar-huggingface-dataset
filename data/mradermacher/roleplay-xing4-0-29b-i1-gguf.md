# mradermacher/roleplay-Xing4.0-29B-i1-GGUF

## Resumen

`mradermacher/roleplay-Xing4.0-29B-i1-GGUF` es una colección de cuantizaciones GGUF en formato imatrix del modelo base `hunter-P/roleplay-Xing4.0-29B`, un modelo de lenguaje conversacional orientado a roleplay con aproximadamente 31.215 millones de parámetros (denominado comercialmente como 29B). El trabajo lo firma mradermacher, un perfil conocido en Hugging Face por publicar cuantizaciones sistemáticas de modelos open source para su uso con llama.cpp y ecosistemas compatibles.

El repositorio no introduce cambios arquitectónicos ni de entrenamiento: se limita a ofrecer los pesos del modelo original en múltiples niveles de cuantización (desde IQ1_S hasta Q6_K), empleando matrices de importancia (imatrix) para preservar mejor la calidad en los niveles de compresión más agresivos. El tamaño total del repositorio es de 11,8 GB, lo que refleja la suma de todos los ficheros de cuantización publicados.

La relevancia de esta ficha es práctica: permite a desarrolladores e investigadores desplegar un modelo conversacional de gran tamaño en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de infraestructura de GPU de datacenter. No obstante, la información pública disponible sobre el modelo base es muy limitada, por lo que numerosos datos técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el formato GGUF; no confirmado en la informacion) |
| Parametros totales | 31.215.031.088 (aproximadamente 31,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base `hunter-P/roleplay-Xing4.0-29B` en los datos proporcionados. Por el recuento de parámetros (31,2 mil millones) y el formato de publicación, se trata de un transformer denso de gran tamaño, pero no se confirma si emplea atención completa, atención lineal, mezcla de expertos ni ninguna innovación específica. Tampoco se detallan los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

Lo que sí documenta el repositorio es el proceso de cuantización: mradermacher ha generado las cuantizaciones a partir del modelo original con `convert_type: hf` y `output_tensor_quantised: 1`, empleando matrices de importancia (imatrix) para los niveles IQ y K. El uso de imatrix implica que se calculó una matriz de importancia a partir de un corpus de calibración, lo que mejora la fidelidad de los pesos cuantizados en los niveles bajos (IQ1, IQ2, IQ3). El etiquetado incluye `nicoboss`, que probablemente hace referencia a la herramienta o metodología de cuantización empleada, aunque no se detalla en la información disponible.

## Capacidades

- Generación de texto conversacional y de roleplay, según indica el nombre del modelo base y la etiqueta `conversational`.
- Soporte de conversaciones multi-turno (inferido por su orientación a roleplay; no confirmado explícitamente).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con servidores de inferencia tipo OpenAI API.
- Ejecución en llama.cpp y ecosistemas compatibles con GGUF (Ollama, LM Studio, etc.).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está específicamente orientado a conversación de personajes y ficción interactiva; sus cuantizaciones permiten desplegarlo localmente en un PC con GPU de consumo, manteniendo conversaciones multi-turno sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales: gracias a la compatibilidad con endpoints, puede integrarse en un servidor local compatible con la API de OpenAI para probar flujos de chat antes de migrar a un modelo mayor o a producción.
- Investigación sobre cuantización: el repositorio ofrece 24 variantes de cuantización del mismo modelo, lo que permite estudiar empíricamente la degradación de calidad entre IQ1_S y Q6_K sobre una misma tarea conversacional.
- Despliegue en hardware limitado: las variantes Q2_K_S e IQ2_M permiten ejecutar un modelo de 31B en GPUs con 8-12 GB de VRAM (con offloading parcial a CPU), útil para demos y entornos de desarrollo sin infraestructura dedicada.
- Generación creativa offline: escritura de ficción, guiones o diálogos en entornos sin conexión, aprovechando el formato GGUF para ejecución local con llama.cpp.
- Evaluación comparativa de formatos: comparar el rendimiento de cuantizaciones K frente a IQ sobre el mismo modelo para seleccionar el equilibrio óptimo entre tamaño y calidad en un pipeline concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de fichero y cuantización; no confirmada por el autor):
  - IQ1_S / IQ1_M: en torno a 6-8 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 8-11 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: en torno a 12-15 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / small-IQ4_NL: en torno a 16-19 GB.
  - Q5_K_S / Q5_K_M: en torno a 20-22 GB.
  - Q6_K: en torno a 24-26 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5; A100 40 GB o H100 para Q6_K sin offloading; RTX 3090/4080 (16-24 GB) para cuantizaciones medias.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con cuantizaciones IQ2/IQ3; en RTX 4090 con Q4/Q5; las variantes Q6_K requieren offloading parcial o GPUs de 24 GB con margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con endpoints (llama-server), y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| roleplay-Xing4.0-29B (i1-GGUF, este repo) | 31,2 B | no disponible | no disponible | GGUF (24 cuantizaciones) | Cuantizaciones imatrix de mradermacher |
| roleplay-Xing4.0-29B (GGUF de juanml82) | 31,2 B | no disponible | no disponible | GGUF | Cuantizaciones alternativas del mismo base |
| hunter-P/roleplay-Xing4.0-29B (base) | 31,2 B | no disponible | no disponible | safetensors (presumiblemente) | Modelo original sin cuantizar |

No se dispone de información suficiente para comparar con modelos de roleplay de otros autores (por ejemplo, variantes de Llama, Mistral o Qwen afinadas para roleplay), ya que no se han proporcionado datos de rendimiento, contexto ni licencia del modelo base.

## Limitaciones y advertencias

- La licencia no está indicada, por lo que no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base `hunter-P/roleplay-Xing4.0-29B` antes de cualquier despliegue en producción.
- No se han publicado datos sobre sesgos, alucinación ni calidad del modelo base; al ser un modelo de roleplay, es esperable que priorice la coherencia narrativa sobre la veracidad factual, pero esto no está documentado.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; no son recomendables para producción.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide planificar conversaciones largas con garantías.
- No se confirma el soporte multilingüe ni el rendimiento en idiomas distintos del inglés.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del resultado de las cuantizaciones.
- El modelo base está etiquetado como `roleplay`, lo que implica un uso previsto conversacional y creativo; no se ha evaluado para tareas de razonamiento, código o matemáticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/roleplay-Xing4.0-29B-i1-GGUF
- Modelo base: https://huggingface.co/hunter-P/roleplay-Xing4.0-29B
- Cuantizaciones alternativas de juanml82: https://huggingface.co/juanml82/roleplay-Xing4.0-29B-gguf
- Perfil del autor (mradermacher): https://huggingface.co/mradermacher
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
