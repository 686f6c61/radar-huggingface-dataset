# mradermacher/Soonlife-Qwen3.5-9B-v2-i1-GGUF

## Resumen

Soonlife-Qwen3.5-9B-v2-i1-GGUF es la colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo wonchandev/Soonlife-Qwen3.5-9B-v2, un ajuste fino de la familia Qwen3.5 orientado a conversación, recuperación aumentada (RAG), tool calling y distilación, con especialización en coreano. El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Este repositorio concreto no contiene los pesos originales en safetensors, sino versiones cuantizadas en formato GGUF con técnicas i1 (imatrix) y estáticas, pensadas para inferencia local eficiente en CPU y GPU de consumo. La cuantización i1 utiliza una matriz de importancia (imatrix) calculada sobre el modelo para preservar mejor la calidad en bits bajos, lo que resulta especialmente relevante en un modelo de ~9B que de otro modo requeriría ~18 GB en FP16.

La relevancia actual radica en que permite desplegar un modelo de casi 9B especializado en coreano y tool calling en hardware modesto (desde ~4 GB en cuantizaciones agresivas hasta ~6 GB en Q4_K_S), con compatibilidad con llama.cpp y ecosistemas derivados como Ollama o LM Studio. No obstante, la información pública sobre el modelo base es escasa: no se detallan composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, según tags del modelo base) |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S (en este repo); además Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XS, IQ3_S, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K (en el repo estático) |
| Idiomas soportados | Coreano (ko); multilingüe heredado de Qwen3.5 no confirmado en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Soonlife-Qwen3.5-9B-v2 es un ajuste fino de la familia Qwen3.5, una arquitectura transformer decoder-only densa de aproximadamente 9B parámetros. Según los tags de la model card, el ajuste incorpora técnicas de destilación (distillation), está orientado a RAG y tool calling, y se ha realizado mediante LoRA fusionado (lora-merged) sobre el modelo Qwen3.5 original. El dataset de entrenamiento es wonchandev/Soonlife_dataset, aunque no se especifica su tamaño, composición ni número de tokens.

No se dispone de información sobre la longitud de contexto nativa, el uso de RLHF/DPO, la composición lingüística del corpus (más allá de la indicación de coreano) ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card del repositorio de cuantización es puramente operativa y no aporta detalles arquitectónicos adicionales. El proceso de cuantización i1 emplea una matriz de importancia (imatrix) generada sobre el modelo, lo que mejora la retención de calidad en cuantizaciones de 2 a 4 bits.

## Capacidades

- Generación de texto conversacional en coreano, con soporte declarado para diálogo multi-turno.
- Tool calling / function calling, indicado explícitamente en los tags del modelo.
- Recuperación aumentada (RAG): el modelo está ajustado para integrarse en pipelines de recuperación de documentos.
- Destilación: el ajuste incorpora técnicas de destilación, presumiblemente para transferir capacidades de un modelo mayor.
- Capacidades multilingües: solo se declara coreano; no se confirma soporte de otros idiomas.
- Capacidades de visión: la model card del cuantizador menciona que "this is a vision model" y que los archivos mmproj (si existen) estarían en el repositorio estático, pero no se confirma que el modelo base tenga torre visual.
- Razonamiento multi-paso y agentes: no confirmado explícitamente en la documentación disponible.

## Casos de uso

- Atención al cliente en coreano: el modelo puede gestionar conversaciones multi-turno en coreano con un ajuste específico para diálogo, adecuado para chatbots de soporte en empresas que operan en ese idioma.
- Asistentes RAG sobre documentación interna: gracias a su orientación a RAG, puede integrarse en pipelines de recuperación (por ejemplo, con LangChain o LlamaIndex) para responder preguntas sobre bases de conocimiento corporativas en coreano.
- Automatización de tool calling: puede invocarse como planificador de funciones en agentes que necesiten llamar a APIs externas (calendario, CRM, bases de datos) en entornos coreanohablantes.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_S (~5,5 GB) permiten ejecutar el modelo en GPUs de 8 GB o en CPU con llama.cpp, útil para prototipos y demos locales.
- Procesamiento de texto en coreano en el borde (edge): al caber en ~4 GB con IQ3_XXS, puede desplegarse en dispositivos con recursos limitados para tareas de clasificación o resumen.
- Investigación sobre cuantización: el repositorio incluye el archivo imatrix y múltiples variantes, lo que permite estudiar el impacto de distintas cuantizaciones en la calidad de un modelo de ~9B especializado.
- Fine-tuning posterior sobre GGUF: aunque no es el flujo habitual, las versiones cuantizadas permiten experimentar con LoRA sobre modelos GGUF en herramientas compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - i1-Q2_K (~3,9 GB): ~4-5 GB de VRAM con contexto moderado.
  - i1-IQ3_XXS (~4,0 GB): ~4,5-5,5 GB.
  - i1-IQ3_M (~4,5 GB): ~5-6 GB.
  - i1-Q3_K_M (~4,7 GB): ~5-6,5 GB.
  - i1-Q4_K_S (~5,5 GB): ~6-7,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, desde GPUs de 6-8 GB con cuantizaciones IQ3/Q4; en 12 GB o más con Q4_K_S o superiores y contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; vLLM y TGI no soportan GGUF de forma nativa (requerirían el modelo base en safetensors).
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Soonlife-Qwen3.5-9B-v2 (este, cuantizado) | ~9B | no disponible | Apache 2.0 | GGUF | Especializado en coreano, RAG y tool calling |
| Qwen3.5-9B (base, referencia) | ~9B | no disponible | Apache 2.0 (presumible) | safetensors/GGUF | Modelo generalista multilingüe del que deriva |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community | safetensors/GGUF | Multilingüe, sin especialización en coreano |
| Gemma 2 9B | 9B | 8K | Gemma Terms | safetensors/GGUF | Multilingüe, restricciones de uso comercial |

La comparación con Qwen3.5-9B base es la más directa, pero no se dispone de datos de rendimiento del ajuste fino para cuantificar la mejora. Frente a Llama 3.1 8B y Gemma 2 9B, la ventaja de Soonlife es su especialización en coreano y tool calling, aunque carece de benchmarks públicos que respalden esa ventaja.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste fino sobre un dataset no descrito, pueden persistir sesgos del corpus original y del dataset Soonlife.
- Riesgo de alucinación: no cuantificado; los modelos de ~9B sin benchmarks publicados presentan riesgo habitual de alucinación, especialmente en RAG sin verificación.
- Limitaciones de contexto o idioma: solo se declara coreano; el soporte de otros idiomas no está confirmado y podría degradarse. La longitud de contexto no está especificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5 subyacente.
- Caveats para producción: la model card no documenta el dataset de entrenamiento ni el proceso de alineación, lo que dificulta evaluar su robustez; las cuantizaciones de 2-3 bits pueden degradar notablemente la calidad en tool calling y RAG; el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.
- La mención a "vision model" en la model card del cuantizador no está confirmada para el modelo base; no asumir capacidades multimodales sin verificar los archivos mmproj.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Soonlife-Qwen3.5-9B-v2-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Soonlife-Qwen3.5-9B-v2-GGUF
- Modelo base: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/wonchandev/Soonlife_dataset
- Página de descargas del cuantizador: https://hf.tst.eu/model#Soonlife-Qwen3.5-9B-v2-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
