# AMAImedia/Ling3.2-air-FP8-GGUF

## Resumen

Ling-3.2-air es un modelo de lenguaje multimodal de pesos abiertos desarrollado por inclusionAI (Alipay/Ant Group), distribuido en este repositorio por el usuario AMAImedia como una conversión a cuantización FP8 en formato GGUF. Se trata de la evolución del modelo Ling-3.0-flash-VL, con el que comparte arquitectura nativa multimodal, y está orientado a la automatización de flujos de trabajo y al razonamiento sobre documentos profesionales.

El modelo emplea una arquitectura híbrida de mezcla de expertos (MoE) con atención lineal, con un total de 124B parámetros de los cuales solo 5,5B se activan por token. Esta relación de activación lo hace especialmente interesante para despliegues de producción en los que el coste computacional por inferencia es un factor crítico. La ficha original reporta mejoras sustanciales frente a su predecesor en tareas de automatización (AutomationBench-AA de 15,7% a 61%) y procesamiento de documentos (GDP.pdf del 8,4% al 16%).

La relevancia actual del modelo radica en su combinación de contexto largo (256K tokens), capacidades multimodales (imagen y vídeo), soporte de tool calling y un modo de razonamiento explícito ("thinking"), todo ello bajo licencia MIT. El repositorio aquí documentado corresponde a una conversión FP8 en GGUF, aunque el tamaño del repo (129,3 GB) y los tags (safetensors, custom_code) sugieren una mezcla de formatos que conviene verificar antes de su uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (35 capas KDA + 7 Gated MLA, ratio 5:1) |
| Parámetros totales | 124B (127.920.654.544 según safetensors) |
| Parámetros activos | 5,5B |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | FP8 (este repo); GGUF; el modelo base admite otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, custom_code (bailing_moe_v3_vl) |

## Arquitectura y entrenamiento

Ling-3.2-air utiliza una arquitectura MoE híbrida con 35 capas de atención lineal KDA (Kernelized Delta Attention) y 7 capas de Gated MLA (Multi-head Latent Attention) en proporción 5:1, más 2 capas densas. El modelo cuenta con 512 expertos enrutados y 1 experto compartido, activando 8 expertos por token. La dimensión oculta es de 2560, con tamaño intermedio de experto de 768 y tamaño intermedio denso de 6144. Dispone de 32 cabezas de atención y un vocabulario de 157.184 tokens. La arquitectura es nativa multimodal, heredada de Ling-3.0-flash-VL, e incorpora decodificación especulativa MTP (NEXTN) según la receta de despliegue del autor.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente reporta resultados de evaluación y la arquitectura. La innovación técnica destacable es la combinación de atención lineal KDA con MLA para reducir el coste de atención en contextos largos, junto con el uso de decodificación especulativa MTP para acelerar la inferencia.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable mediante `enable_thinking`.
- Procesamiento multimodal: entrada de imágenes (`image_url`) y vídeo (`video_url`).
- Razonamiento sobre documentos profesionales y análisis de datos cuantitativos.
- Tool calling / function calling con parser dedicado (`ling3`).
- Automatización de flujos de trabajo y tareas multi-paso.
- Ejecución de tareas en terminal (Terminal-Bench 4.0).
- Trabajo legal y de cumplimiento (evaluado en Harvey LAB-AA).
- Contexto largo de hasta 256K tokens para documentos extensos.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de flujos de trabajo administrativos: el modelo puede orquestar secuencias de acciones con tool calling y razonamiento multi-paso, aprovechando su puntuación de 61% en AutomationBench-AA para encadenar operaciones sobre sistemas empresariales.
- Análisis de documentos financieros y PDF extensos: con 256K tokens de contexto y una tasa all-pass del 16% en GDP.pdf, es adecuado para extraer y razonar sobre informes anuales, balances y contratos de gran longitud sin truncar.
- Asistencia legal y revisión de contratos: su 87,7% de criterios superados en Harvey LAB-AA lo sitúa como candidato para tareas de revisión documental jurídica, siempre con supervisión humana por la tasa de alucinación material reportada.
- Análisis de datos cuantitativo: la model card destaca su rendimiento en análisis de datos cuantitativos, útil para generar resúmenes estadísticos y explicaciones sobre conjuntos de datos tabulares.
- Agentes autónomos de terminal: con un 27% de éxito en Terminal-Bench 4.0, puede emplearse en agentes que ejecutan comandos y resuelven tareas de sistema en entornos controlados.
- Procesamiento de vídeo e imagen en pipelines de inspección: la entrada multimodal permite describir y analizar contenido visual en aplicaciones de monitorización o catalogación.
- Despliegue en producción con contexto largo: la receta oficial con SGLang y tensor parallelism 4 sobre GPUs de 141 GB permite servir 256K de contexto con decodificación especulativa.

## Benchmarks y rendimiento

| Benchmark | Ling-3.2-air | Ling-3.0-flash-VL (predecesor) |
|---|---|---|
| AutomationBench-AA | 61% | 15,7% |
| GDP.pdf (all-pass) | 16% | 8,4% |
| AA-Briefcase v1.1 (Elo) | 1340 | 987 |
| Terminal-Bench 4.0 | 27% | 0% |
| Artificial Analysis Intelligence Index v5.0.1 | 23 | no disponible |
| Harvey LAB-AA v1.1 (criterion pass) | 87,7% | no disponible |
| Harvey LAB-AA v1.1 (all-pass, antes de control de alucinación) | 8,3% | no disponible |
| Harvey LAB-AA v1.1 (all-pass, tras control de alucinación) | 0,8% | no disponible |

## Requisitos de hardware

- VRAM estimada: el modelo base en BF16 requiere aproximadamente 248 GB; esta conversión FP8 reduce el requisito a unos 124-130 GB, coherente con el tamaño del repo (129,3 GB).
- GPU recomendadas: la receta oficial usa 4 GPUs de clase 141 GB (H20-3e o H200) o nodos Blackwell de 4 GPUs (B300 / GB300) con `--tp 4`.
- En GPUs de 80 GB (H100 / H800) es necesario escalar a `--tp 8`.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en su configuración completa; requeriría cuantizaciones GGUF de menor precisión no documentadas en este repo.
- Opciones de despliegue: SGLang (recomendado, imagen `lmsysorg/sglang:dev-Ling-3.0-flash-VL`), vLLM (fork `inclusionAI/vllm-ling-v3`). No se documenta soporte para llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa MTP (NEXTN) y las optimizaciones de decode para Hopper están soportadas en SGLang.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air | 124B | 5,5B | 256K | MIT | Multimodal, MoE híbrido |
| Ling-3.0-flash-VL | no disponible | no disponible | no disponible | no disponible | Predecesor directo, misma arquitectura |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (tamaño o tarea) más allá del predecesor directo.

## Limitaciones y advertencias

- Riesgo de alucinación material: la propia model card reporta que la tasa all-pass en Harvey LAB-AA cae del 8,3% al 0,8% tras el control de alucinación, lo que indica una tendencia significativa a generar contenido no fundamentado en tareas legales.
- El repositorio es una conversión de terceros (AMAImedia) y no el repositorio oficial de inclusionAI; la fidelidad de la cuantización FP8 no está verificada por el autor original.
- El tamaño del repo (129,3 GB) y la mezcla de tags (safetensors, GGUF, custom_code) sugieren que puede contener múltiples artefactos; conviene inspeccionar los archivos antes de descargar.
- El modelo requiere `--trust-remote-code` y código personalizado (`bailing_moe_v3_vl`), lo que implica ejecutar código no auditado.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Licencia MIT permite uso comercial, pero el modelo base puede estar sujeto a términos adicionales del autor original no reflejados en este repo.
- El rendimiento en Terminal-Bench 4.0 (27%) y en all-pass de GDP.pdf (16%) indica que las tareas de automatización complejas siguen requiriendo supervisión humana.
- No se documentan sesgos conocidos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/Ling3.2-air-FP8-GGUF
- Modelo original: https://huggingface.co/inclusionAI/Ling-3.2-air
- Organización inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.2-air
- Predecesor: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Fork de vLLM: https://github.com/inclusionAI/vllm-ling-v3
- Imagen SGLang: `lmsysorg/sglang:dev-Ling-3.0-flash-VL`
