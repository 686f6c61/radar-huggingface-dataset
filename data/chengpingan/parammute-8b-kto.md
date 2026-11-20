# chengpingan/ParamMute-8B-KTO

## Resumen

ParamMute-8B-KTO es un checkpoint de ajuste fino del modelo meta-llama/Meta-Llama-3-8B, publicado por el autor chengpingan (Pengcheng Huang y colaboradores) junto con el artículo "ParamMute: Suppressing Knowledge-Critical FFNs for Faithful Retrieval-Augmented Generation", presentado en NeurIPS 2025. El modelo aborda un problema concreto de los sistemas RAG: cuando el contexto recuperado contradice la respuesta memorizada en los pesos del modelo, este tiende a priorizar su conocimiento paramétrico y a ignorar la evidencia documental, generando respuestas infieles al contexto.

La propuesta técnica de ParamMute consiste en suprimir la activación de las capas feed-forward (FFN) críticas para el conocimiento en los niveles 19 a 26 del transformer, de modo que el modelo dependa en mayor medida de la información recuperada. Este checkpoint concreto aplica además optimización KTO (Kahneman-Tversky Optimization), una variante de alineación basada en preferencias binarias, sobre la configuración de supresión de activaciones.

El modelo está pensado para investigación en fidelidad de RAG y evaluación de contextual faithfulness, no como un asistente generalista. Su licencia MIT y su base Llama 3 lo hacen reutilizable, aunque su uso previsto está acotado al escenario de generación aumentada por recuperación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), con supresión de activaciones en FFN de capas 19–26 |
| Parámetros totales | 8 000 millones (aproximado, derivado de Llama 3 8B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (base Llama 3 8B: 8 192 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B (la model card indica Llama 3 8B Instruct como base efectiva) y aplica la configuración de supresión de activaciones de ParamMute sobre las capas feed-forward 19 a 26. La hipótesis del trabajo es que un subconjunto de FFN concentra el conocimiento paramétrico que compite con la evidencia recuperada; al silenciar esas activaciones durante la inferencia o el ajuste, el modelo queda más receptivo al contexto del prompt.

Sobre esa configuración se aplica un ajuste fino con KTO (Kahneman-Tversky Optimization), un método de alineación que aprende de señales binarias de deseabilidad en lugar de pares de preferencia, lo que permite entrenar con datos etiquetados como buenos o malos de forma individual. La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni la receta completa de optimización; el conjunto de datos liberado se referencia como ParamMute-Training-Data. La innovación destacable es el propio mecanismo ParamMute de supresión selectiva de FFN, orientado a mejorar la fidelidad al contexto en RAG.

## Capacidades

- Generación de texto en inglés sobre la base de Llama 3 8B.
- Generación aumentada por recuperación (RAG) con mayor fidelidad al contexto recuperado cuando este contradice el conocimiento memorizado.
- Razonamiento sobre evidencia documental y resolución de conflictos entre contexto y conocimiento paramétrico.
- Capacidades heredadas de Llama 3 8B Instruct (comprensión lectora, resumen, respuesta a preguntas), sujetas a la degradación inducida por la supresión de FFN.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de fidelidad en RAG: servir como checkpoint de referencia para medir contextual faithfulness con las métricas de normalización y recall de la Sección 5 del paper, usando el benchmark CoFaithfulQA.
- Sistemas de pregunta-respuesta sobre documentación corporativa: el modelo prioriza el pasaje recuperado frente a respuestas memorizadas, lo que reduce respuestas obsoletas cuando la base documental se actualiza con frecuencia.
- Atención al cliente con base de conocimiento viva: en escenarios donde las políticas cambian y el contexto recuperado debe prevalecer sobre lo aprendido en el preentrenamiento.
- Investigación en alineación: reproducción de experimentos con KTO sobre una configuración de supresión de activaciones, comparando con el checkpoint sin KTO.
- Auditoría de sesgos de memorización: análisis de qué capas FFN concentran conocimiento factual y cómo afecta su supresión a la veracidad.
- Verificación de hechos asistida: uso del modelo como componente de un pipeline que contrasta afirmaciones contra fuentes recuperadas y debe citar la evidencia en lugar de su memoria interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las métricas de fidelidad contextual (normalización y recall) definidas en la Sección 5 del artículo y al benchmark CoFaithfulQA, pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB para los 8 000 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 8–9 GB; en 4 bits: en torno a 5–6 GB (estimaciones orientativas, no verificadas en la información disponible).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 en contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16 y en GPUs de 8–12 GB con cuantización de 4–8 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp y Ollama para pesos convertidos a GGUF (conversión no incluida en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParamMute-8B-KTO | 8 000 M | No disponible | RAG fiel con supresión de FFN + KTO | MIT | Hugging Face |
| meta-llama/Meta-Llama-3-8B | 8 000 M | 8 192 tokens | LLM generalista | Llama 3 Community License | Hugging Face |
| meta-llama/Meta-Llama-3-8B-Instruct | 8 000 M | 8 192 tokens | LLM generalista alineado | Llama 3 Community License | Hugging Face |

La comparación de rendimiento frente a estos modelos no está disponible en la información proporcionada. La diferencia principal es funcional: ParamMute-8B-KTO está especializado en fidelidad al contexto recuperado y no en capacidades generalistas.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; su uso en castellano no está soportado por la model card.
- La supresión de activaciones en capas FFN 19–26 puede degradar el conocimiento paramétrico general y, con ello, el rendimiento en tareas que no dependen de contexto recuperado.
- Riesgo de alucinación: aunque el objetivo es reducir la infidelidad al contexto, no se han publicado métricas que cuantifiquen la tasa de alucinación resultante.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La licencia MIT aplica al checkpoint publicado, pero el modelo base Llama 3 está sujeto a la Llama 3 Community License, cuyas restricciones de uso comercial deben respetarse en la medida en que sigan siendo aplicables.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria del checkpoint.
- Uso previsto de investigación: no se recomienda como asistente de producción generalista sin una evaluación previa en el dominio objetivo.

## Enlaces

- [Hugging Face: chengpingan/ParamMute-8B-KTO](https://huggingface.co/chengpingan/ParamMute-8B-KTO)
- [arXiv preprint 2502.15543](https://arxiv.org/abs/2502.15543)
- [Proceedings NeurIPS 2025 (DOI)](https://doi.org/10.52202/085713-3356)
- [Página del paper en NeurIPS](https://proceedings.neurips.cc/paper_files/paper/2025/hash/90d1e515d74686ad148b469a3cecbbaa-Abstract-Conference.html)
- [Código y evaluación en GitHub](https://github.com/OpenBMB/ParamMute)
- [Página del proyecto](https://passionate11.github.io/ParamMute-project-page/)
- [Dataset de entrenamiento ParamMute-Training-Data](https://huggingface.co/datasets/chengpingan/ParamMute-Training-Data)
- [Benchmark CoFaithfulQA](https://huggingface.co/datasets/chengpingan/CoFaithfulQA)
- [Modelo base meta-llama/Meta-Llama-3-8B](https://huggingface.co/meta-llama/Meta-Llama-3-8B)
