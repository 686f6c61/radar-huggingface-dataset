# postrational/Qwen3.8-27B-cpt-sft3-GGUF

## Resumen

Qwen3.8-27B-cpt-sft3-GGUF es una distribucion en formato GGUF de un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones), publicado por el usuario postrational en Hugging Face. El modelo se presenta como un derivado de la familia Qwen3.5 (etiqueta `qwen3_5` en los metadatos) y, segun la model card, ha sido afinado y convertido a GGUF mediante la herramienta Unsloth. El nombre sugiere un pipeline de entrenamiento continuado (cpt, *continued pre-training*) seguido de una tercera iteracion de *supervised fine-tuning* (sft3), aunque el autor no documenta estos detalles.

La relevancia de esta publicacion es limitada pero concreta: ofrece pesos cuantizados en Q4_K_M listos para ejecutarse con llama.cpp, junto con un proyector multimodal en BF16 (`BF16-mmproj.gguf`), lo que indica que el modelo base incorpora capacidad de vision. El repositorio ocupa 17,9 GB y esta etiquetado como compatible con endpoints y como modelo conversacional.

No obstante, la informacion publicada es muy escasa: no hay licencia declarada, no se especifican idiomas soportados, no hay resultados de benchmarks ni detalles sobre el dataset de entrenamiento. El modelo tiene cero descargas y cero likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun tag `qwen3_5`); no se detalla si es densa o MoE |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) y BF16 para el proyector multimodal |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Los metadatos indican que el modelo pertenece a la familia Qwen3.5 y que es un modelo vision-language (etiqueta `vision-language-model`), con un componente proyector multimodal separado (`BF16-mmproj.gguf`) que se usa junto al modelo de lenguaje en llama.cpp mediante `llama-mtmd-cli`. El nombre del repositorio sugiere un proceso de *continued pre-training* seguido de al menos tres rondas de *supervised fine-tuning*, pero no se aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico detalle tecnico verificable es el uso de Unsloth para el afinado y la conversion a GGUF. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.).

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y el ejemplo de uso con `llama-cli`.
- Procesamiento multimodal de imagenes, segun la etiqueta `vision-language-model` y la presencia del proyector `BF16-mmproj.gguf` para `llama-mtmd-cli`.
- Compatibilidad con plantillas de chat Jinja (`--jinja` en los ejemplos de uso).
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Tool calling, razonamiento multi-paso, capacidades matematicas o de codigo: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue local de un modelo conversacional de ~27 B en formato GGUF: adecuado para entornos con GPU de consumo o CPU, ya que la cuantizacion Q4_K_M reduce el peso a un rango manejable frente a los pesos en BF16.
- Prototipado de asistentes multimodales en local: el par de ficheros (modelo Q4_K_M + proyector BF16) permite probar entrada de imagenes con `llama-mtmd-cli` sin depender de APIs externas.
- Evaluacion comparativa de variantes afinadas: al ser un modelo derivado con *fine-tuning* propio, sirve para comparar el efecto del ajuste del autor frente al Qwen3.5 original en tareas conversacionales.
- Integracion en pipelines basados en llama.cpp: la compatibilidad con `llama-cli` y `llama-mtmd-cli` facilita su inclusion en scripts y flujos de inferencia ya existentes.
- Experimentacion con plantillas Jinja: el flag `--jinja` permite probar formatos de prompt personalizados sobre un modelo de 27 B.
- Uso como base para nuevos *fine-tunings*: el autor distribuye pesos GGUF, aunque para reentrenar seria necesario disponer de los pesos originales en safetensors, no incluidos en este repo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M de un modelo de ~27 B ocupa del orden de 16-17 GB (el repo completo son 17,9 GB, incluyendo el proyector BF16). Se necesita VRAM suficiente para alojar los pesos cuantizados mas el contexto KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU de 24 GB (RTX 3090/4090) es el minimo practico para Q4_K_M con contexto moderado; A100/H100 para mayor contexto o mayor precision.
- Cabe en GPU de consumo: si, en GPUs de 24 GB o mas con Q4_K_M; en GPUs de 16 GB requeriria cuantizaciones mas agresivas (no publicadas en este repo) o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por compatibilidad de formato GGUF, otros runners que lo soporten (Ollama, etc., no confirmado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-cpt-sft3-GGUF (este) | ~27,3 B | no disponible | GGUF (Q4_K_M) + mmproj BF16 | no disponible | Fine-tune de Qwen3.5, vision-language, sin benchmarks |
| Qwen3.5 original (familia) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva; no se aportan datos concretos en la informacion |
| Alternativas de ~27-32 B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No hay informacion suficiente para establecer una comparativa cuantitativa fiable con modelos concretos.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Sin benchmarks ni evaluacion publicada: el rendimiento real es desconocido y no hay evidencia de calidad frente al modelo base.
- Sin documentacion del dataset de entrenamiento: riesgo de sesgos desconocidos y de sobreajuste a los datos del *fine-tuning*.
- Riesgo de alucinacion no cuantificado, como en cualquier LLM sin evaluacion publicada.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no especificada: limita la planificacion de aplicaciones con documentos largos.
- Repositorio sin descargas ni likes: no hay validacion de la comunidad ni reportes de errores.
- Solo se publican pesos GGUF cuantizados (Q4_K_M) y el proyector; no hay safetensors del modelo completo en este repo, lo que dificulta reentrenamiento o verificacion de pesos.
- El nombre del modelo ("Qwen3.8") no coincide con la etiqueta `qwen3_5` de los metadatos, lo que genera ambiguedad sobre la version base exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/postrational/Qwen3.8-27B-cpt-sft3-GGUF
- Unsloth (herramienta usada para el afinado y la conversion): https://github.com/unslothai/unsloth
- llama.cpp (runner recomendado por el autor): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo del modelo: no disponible.
