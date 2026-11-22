# mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-i1-GGUF

## Resumen
MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic es una cuantización GGUF (formato i1, con matriz de importancia) realizada por mradermacher sobre el modelo funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic. Se trata de un modelo de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado a la reescritura de prompts y con capacidades multimodales de visión-lenguaje, derivado de la familia Qwen3.8 y vinculado al ecosistema MiniMax. La variante "heretic" indica que ha sido sometida a un proceso de abliteración o "decensoring", es decir, se han eliminado o atenuado las capas de rechazo alineadas del modelo original.

El modelo resuelve el problema de la reescritura y refinamiento automático de prompts, una tarea cada vez más relevante en pipelines de generación aumentada por recuperación, agentes autónomos y sistemas de generación de imágenes o vídeo donde la calidad del prompt condiciona el resultado final. Su naturaleza multimodal (etiquetas vision-language y ref2va) sugiere que puede procesar referencias visuales además de texto, lo que lo hace útil en flujos de trabajo que combinan imagen y lenguaje.

La relevancia actual radica en la combinación de tres factores: un tamaño manejable de 27B que permite despliegue en hardware de gama alta de consumo mediante cuantización, una licencia Apache 2.0 permisiva para uso comercial, y la disponibilidad de cuantizaciones i1 optimizadas con imatrix que reducen el peso hasta 11 GB en Q2_K. No obstante, la información pública sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que esta ficha refleja únicamente los datos verificables disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Qwen3.8/MiniMax-H3; tags indican multimodal vision-language y MTP) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; también disponibles cuantizaciones estáticas en el repo hermano |
| Idiomas soportados | en, zh (según tags de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); safetensors en el modelo base |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. Los tags del modelo indican herencia de Qwen3.5/Qwen3.8, capacidades multimodales de visión-lenguaje, y la presencia de "MTP" (probablemente Multi-Token Prediction, aunque no se confirma). El nombre "Ref2VA" y la etiqueta "ref2va" sugieren un mecanismo de referencia a vídeo/audio o a representaciones visuales, pero no hay documentación técnica que lo confirme.

El proceso de entrenamiento tampoco está documentado en la información disponible: no se especifican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas de alineación. Lo que sí se sabe es que el modelo base (lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA) fue sometido a un proceso de "heretic" o abliteración por parte de funnygeeker, que elimina las direcciones de rechazo en el espacio de activaciones. Posteriormente, mradermacher generó las cuantizaciones i1 con matriz de importancia (imatrix), un método que pondera la cuantización según la relevancia de cada peso para reducir la pérdida de calidad.

## Capacidades
- Reescritura y refinamiento de prompts: tarea principal del modelo, orientada a mejorar la claridad, especificidad y efectividad de instrucciones de texto.
- Procesamiento multimodal visión-lenguaje: según los tags, puede manejar entradas que combinan imagen y texto.
- Generación de texto conversacional: etiqueta "conversational" indica uso en diálogos multi-turno.
- Soporte multilingüe limitado a inglés (en) y chino (zh) según la model card.
- Capacidad de "decensoring"/abliteración: el modelo ha eliminado parcialmente las capas de rechazo, lo que permite generar contenido que el modelo original rechazaría.
- Posible soporte de MTP (Multi-Token Prediction): inferido del tag, no confirmado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso
- Reescritura automática de prompts en pipelines de generación de imágenes o vídeo: el modelo puede recibir un prompt de usuario y reformularlo para maximizar la calidad del resultado en modelos de difusión, aprovechando su orientación específica a "prompt rewriting" y su capacidad de referencia visual (ref2va).
- Optimización de prompts para agentes autónomos: en sistemas multi-agente, el modelo puede reescribir instrucciones ambiguas en especificaciones claras y accionables antes de pasarlas a un agente ejecutor, reduciendo errores de interpretación.
- Preprocesamiento en sistemas RAG: dado un contexto recuperado y una pregunta del usuario, el modelo puede reformular la consulta para mejorar la recuperación y la generación posterior, gracias a su naturaleza conversacional y su tamaño de 27B.
- Moderación y reescritura de contenido: la variante heretic permite generar reformulaciones de contenido sensible sin los rechazos del modelo alineado, útil en entornos de investigación sobre sesgos y seguridad.
- Asistencia en redacción técnica: reescritura de documentación, especificaciones o mensajes para adaptar el tono y la claridad, con soporte para inglés y chino.
- Investigación sobre abliteración y alineación: el modelo sirve como caso de estudio para analizar cómo la eliminación de direcciones de rechazo afecta a la calidad y seguridad de las respuestas en un modelo de 27B.
- Despliegue en local con cuantización Q4_K_M (16,9 GB): permite ejecutar el modelo en una GPU de consumo de 24 GB (RTX 3090/4090) para tareas de reescritura de prompts en tiempo real sin depender de la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (según cuantización i1):
  - Q2_K: ~11,0 GB
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: ~12,7–12,9 GB
  - Q3_K_M / Q3_K_L: ~13,6–14,7 GB
  - IQ4_XS: ~15,4 GB
  - Q4_K_S / Q4_0: ~15,9 GB
  - Q4_K_M: ~16,9 GB (recomendado por el autor)
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
- GPU recomendadas:
  - Q4_K_M o Q5_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB)
  - Q6_K: A100 40 GB, L40S (48 GB)
  - Cuantizaciones Q2–Q3: RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB)
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o inferiores; en GPUs de 16 GB con Q2_K–Q3_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleración por GPU.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada. Se indica "no disponible" para una comparación cuantitativa rigurosa. Cualitativamente, podría compararse con otros modelos de ~27B en formato GGUF orientados a reescritura de prompts, pero no se han proporcionado datos de rendimiento que permitan una tabla fiable.

## Limitaciones y advertencias
- La información técnica pública es muy escasa: no se documentan arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- La variante "heretic" ha sido abliterada, lo que implica que puede generar contenido que el modelo original rechazaría; esto conlleva riesgos de seguridad y de cumplimiento en entornos de producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 27B; no hay datos específicos sobre su tasa de alucinación.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Licencia Apache 2.0 permite uso comercial, pero el proceso de abliteración puede entrar en conflicto con las políticas de uso de los modelos base originales; conviene revisar los términos de Qwen y MiniMax.
- El tamaño del repo (218,6 GB) refleja el conjunto completo de cuantizaciones; descargar solo el archivo GGUF necesario.
- No se confirma soporte de tool calling ni de agentes; no asumir estas capacidades sin verificación empírica.
- La fecha de creación (2026-11-18) y el ecosistema Qwen3.8 sugieren un modelo muy reciente; la madurez del ecosistema de herramientas puede ser limitada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-i1-GGUF
- Modelo base (heretic): https://huggingface.co/funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic
- Modelo original (lightx2v): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
