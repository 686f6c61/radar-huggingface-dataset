# Hygaard/Sage-S2.1-Flash-oQ3e-mtp

## Resumen

Sage-S2.1-Flash-oQ3e-mtp es una conversión cuantizada en formato MLX del modelo Sage S2.1 Flash, desarrollado por el Shanghai Artificial Intelligence Laboratory (InternLM) sobre la arquitectura GLM-5.3-Flash de Z.ai. El modelo original es un sistema multimodal y agéntico orientado a tareas científicas, con arquitectura Mixture of Experts (MoE) e incorporación de Multi-Token Prediction (MTP). Esta variante concreta aplica una política de cuantización mixta denominada oQ3e, diseñada específicamente para ejecución nativa en Apple Silicon mediante la librería MLX.

La relevancia de esta ficha radica en que se trata de una conversión comunitaria de precisión mixta (~3 bits efectivos) que busca hacer viable un modelo MoE de gran tamaño en hardware de consumo con memoria unificada, en concreto un Mac con 256 GB. El repositorio se publica como borrador privado: la conversión, la validación nativa y la subida de pesos aún están pendientes según la model card, por lo que muchos datos técnicos (tamaño final, BPW efectivo, mapa de precisión por bloque) figuran como pendientes de auditoría.

No se dispone de información pública sobre el número de parámetros totales, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, ni del modelo base ni de esta cuantización. La licencia declarada es MIT, heredada del checkpoint original de InternLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-5.3-Flash) con Multi-Token Prediction (MTP) y componentes de atención lineal |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE; número de expertos activos no especificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ3e (política mixta de precisión de ~3 bits efectivos, formato oQe/oMLX); variantes hermanas oQ4e y oQ5e |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (cuantización mixta oQe) |

## Arquitectura y entrenamiento

El modelo base Sage S2.1 Flash emplea la arquitectura GLM-5.3-Flash, un transformer con capas de mezcla de expertos (MoE) que, según la model card de esta conversión, consta de 45 bloques de texto más un bloque MTP adicional. La arquitectura incorpora además mecanismos poco habituales que la model card enumera al detallar el mapa de precisión: proyecciones de atención, expertos compartidos, MLP densas, encoder de visión, convoluciones de atención lineal, pooling/compresión de indexado, proyecciones de fusión MTP, routers MoE con sesgos de corrección, «hyperconnections» y controles de decaimiento recurrente. Esta combinación sugiere un diseño híbrido entre atención estándar, atención lineal y componentes recurrentes, aunque no se especifican detalles cuantitativos.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card indica que esta conversión se realiza directamente desde el checkpoint BF16 del creador (con tensores FP32 conservados donde aplica), no desde la release FP8 ni desde otra cuantización, y que no se prevé entrenamiento, ablación ni poda de expertos. La calibración emplea una recolección de importancia específica de Sage y sensibilidad por nivel (rung-specific sensitivity), y cada nivel de precisión se convierte de forma independiente desde el checkpoint original.

## Capacidades

- Generación de texto y razonamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Procesamiento de modalidades científicas: el modelo original conserva proyectores científicos y requiere los encoders SciPerception correspondientes, el preprocesado y la integración de prompt-embeddings para habilitar esas rutas.
- Capacidades agénticas: el modelo base se describe como «agentic model», orientado a flujos de múltiples pasos.
- Multi-Token Prediction (MTP): el bloque MTP se preserva íntegro en la cuantización, lo que permite decodificación especulativa o predicción de varios tokens por paso.
- Vision encoder preservado en la conversión, lo que mantiene la capacidad de entrada de imágenes.
- Tokenizer, processor y chat template personalizados de Sage, que deben mantenerse juntos (sustituirlos por el tokenizer estándar de GLM altera el comportamiento; el tokenizer trata las grafías de tokens de control dentro del contenido de los mensajes como texto ordinario).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación científica asistida por IA en local: el modelo conserva los proyectores científicos y el encoder de visión, por lo que puede emplearse para tareas de interpretación de figuras, tablas y datos experimentales en un Mac de 256 GB sin depender de la nube, siempre que se integren los encoders SciPerception correspondientes.
- Análisis de documentos técnicos con imágenes: al ser un modelo image-text-to-text con contexto presumiblemente amplio (no confirmado), encaja en la extracción de información de papers, patentes o informes con gráficos.
- Flujos agénticos de múltiples pasos: su naturaleza agéntica y el bloque MTP permiten encadenar razonamiento y acciones en pipelines automatizados de investigación o ingeniería.
- Prototipado en Apple Silicon: la cuantización oQ3e (~3 bits efectivos) está pensada para reducir el consumo de memoria y permitir experimentación en hardware de consumo con memoria unificada, útil para desarrolladores que quieran evaluar el modelo antes de desplegarlo en infraestructura mayor.
- Generación de código y razonamiento técnico: aunque no hay benchmarks que lo confirmen, el modelo base está orientado a tareas científicas y de razonamiento, lo que lo hace candidato para asistencia en scripting de análisis de datos.
- Despliegue de bajo consumo en estaciones de trabajo Mac: con MLX como runtime nativo, puede integrarse en aplicaciones locales de escritorio para procesamiento de texto e imagen sin GPU dedicada.
- Evaluación comparativa de cuantizaciones: las variantes oQ3e, oQ4e y oQ5e permiten estudiar el compromiso entre precisión y memoria en un mismo modelo, útil para investigación en cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: no disponible con exactitud; la model card indica que las necesidades prácticas de memoria se reportarán tras probar en un Mac Apple Silicon de 256 GB. Al ser una cuantización de ~3 bits efectivos, se espera que el peso sea considerablemente menor que el checkpoint BF16, pero el tamaño final está pendiente de auditoría de cabeceras.
- GPU recomendadas: Apple Silicon con memoria unificada (objetivo declarado: Mac de 256 GB). No se especifican GPU NVIDIA; el formato MLX no es compatible de forma nativa con CUDA.
- ¿Cabe en GPU de consumo? No confirmado. El formato MLX está orientado a Apple Silicon; en GPUs NVIDIA habría que reconvertir a GGUF u otro formato, lo que no está previsto en este repositorio.
- Opciones de despliegue: runtime MLX con soporte de `glm5_next` y precisión mixta oQe. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles; se reportarán tras la validación nativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-oQ3e-mtp (esta ficha) | no disponible | no disponible | MIT | MLX safetensors (oQ3e) | Borrador privado, cuantización pendiente |
| Sage-S2.1-Flash-oQ4e-mtp | no disponible | no disponible | MIT | MLX safetensors (oQ4e) | Variante hermana del mismo autor |
| Sage-S2.1-Flash-oQ5e-mtp | no disponible | no disponible | MIT | MLX safetensors (oQ5e) | Variante hermana del mismo autor |
| internlm/Sage-S2.1-Flash (base) | no disponible | no disponible | MIT | BF16 / FP8 | Checkpoint original de InternLM |

No se dispone de datos de rendimiento ni de especificaciones cuantitativas del modelo base que permitan una comparación con alternativas de otros laboratorios.

## Limitaciones y advertencias

- Repositorio en estado de borrador privado: la conversión, la validación nativa y la subida de pesos están pendientes según la model card; no debe considerarse una release estable.
- Tamaño final, BPW efectivo y mapa de precisión por bloque sin confirmar (pendientes de auditoría de cabeceras); las tablas de la model card están vacías.
- Solo funciona con runtimes MLX que soporten `glm5_next` y oQe; no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI.
- El tokenizer, processor y chat template son personalizados y deben mantenerse juntos; sustituirlos altera el comportamiento del modelo.
- Las rutas de modalidades científicas requieren los encoders SciPerception y el preprocesado asociado; conservar solo los proyectores no habilita esas capacidades en un servidor MLX.
- No hay información sobre sesgos, tasa de alucinación, idiomas soportados ni evaluación de seguridad.
- Licencia MIT heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar las notas de atribución upstream retenidas en la release.
- Al ser una cuantización de ~3 bits efectivos, es esperable cierta degradación de calidad frente al BF16 original, aunque no se han publicado mediciones.
- Sin descargas ni likes en el momento de la consulta; ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ3e-mtp
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Commit del checkpoint fuente: https://huggingface.co/internlm/Sage-S2.1-Flash/blob/76f4513db7464485605a002a06a6190de0460574/README.md#license
- Variante oQ5e: https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ5e-mtp
- Variante oQ4e: https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ4e-mtp
