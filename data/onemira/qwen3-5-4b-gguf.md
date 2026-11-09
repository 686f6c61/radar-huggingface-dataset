# onemira/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es un espejo (mirror) de los pesos cuantizados del modelo Qwen3.5-4B, publicado por el usuario onemira para su uso en el runtime local de OneMira. No se trata de un modelo original, sino de una copia byte a byte del fichero `Qwen3.5-4B-Q4_K_M.gguf` generado por Unsloth a partir del modelo base Qwen/Qwen3.5-4B. El modelo subyacente es un transformer denso de aproximadamente 4.205 millones de parámetros, distribuido bajo licencia Apache-2.0.

La relevancia de este repositorio es acotada: sirve como artefacto fijado (pinned) y verificado por hash SHA-256 para garantizar reproducibilidad en despliegues locales. El interés técnico recae en el modelo base Qwen3.5-4B, no en este mirror, que se limita a empaquetar una cuantización Q4_K_M en formato GGUF para su uso con llama.cpp y runtimes compatibles.

La información pública disponible sobre este repositorio es mínima: la model card solo documenta el origen, la revisión upstream, el tamaño del fichero y su hash. No se publican detalles sobre arquitectura interna, datos de entrenamiento, idiomas soportados ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (fichero incluido); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.5-4B-Q4_K_M.gguf`, 2.740.937.888 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen/Qwen3.5-4B en la documentación proporcionada. Por el recuento de parámetros (≈4,2 mil millones) se trata de un modelo de escala pequeña, pero no se confirma si es un transformer denso, híbrido o de otro tipo, ni se detallan mecanismos de atención, capas o vocabulario.

Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, fases de RLHF/DPO) ni innovaciones técnicas como decodificación especulativa o atención lineal. El único dato técnico verificable es el proceso de cuantización: el fichero GGUF en Q4_K_M fue generado por Unsloth (repositorio upstream `unsloth/Qwen3.5-4B-GGUF`, revisión `e87f176479d0855a907a41277aca2f8ee7a09523`) y replicado sin modificaciones por onemira, con hash SHA-256 `00fe7986ff5f6b463e62455821146049db6f9313603938a70800d1fb69ef11a4`.

## Capacidades

- Generación de texto conversacional: el tag `conversational` sugiere uso en diálogo, aunque no se detallan capacidades específicas.
- Compatibilidad con llama.cpp: el formato GGUF y el tag `llama-cpp` indican que puede ejecutarse en dicho runtime.
- Compatibilidad con endpoints: el tag `endpoints_compatible` apunta a integración con APIs de inferencia compatibles.
- Capacidades de razonamiento, código, matemáticas, visión, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local de un asistente conversacional: al ser un GGUF Q4_K_M de ~2,7 GB, puede cargarse en llama.cpp u Ollama para prototipos de chat en máquinas con recursos limitados.
- Reproducibilidad en pipelines de CI: el hash SHA-256 fijado permite verificar la integridad del artefacto antes de desplegarlo en entornos de producción o pruebas.
- Integración en runtimes embebidos: el tamaño contenido del fichero facilita su inclusión en aplicaciones de escritorio con inferencia local (por ejemplo, el runtime Bundled Local AI de OneMira).
- Evaluación comparativa de cuantizaciones: sirve como referencia Q4_K_M para medir degradación de calidad frente a otras cuantizaciones del mismo modelo base.
- Servicio de inferencia ligero en CPU/GPU modesta: adecuado para tareas de generación de texto de baja latencia en hardware consumer.
- Base para fine-tuning o adaptación: al estar bajo Apache-2.0 y derivar de Qwen/Qwen3.5-4B, puede usarse como punto de partida en flujos que requieran pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 2.740.937.888 bytes (≈2,55 GiB); se recomienda al menos 3-4 GiB de VRAM/RAM para cargar el modelo con margen para el contexto.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs consumer con ≥4 GiB (por ejemplo, RTX 3050 6 GB, RTX 4060, GTX 1660 Super 6 GB).
- Cabe en GPU consumer: sí, previsiblemente en modelos con 4-8 GiB de VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y runtimes compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| onemira/Qwen3.5-4B-GGUF (este) | 4.205.751.296 | no disponible | Apache-2.0 | GGUF Q4_K_M | Hugging Face |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | no disponible | safetensors (presumible) | Hugging Face |
| unsloth/Qwen3.5-4B-GGUF (upstream) | no disponible | no disponible | no disponible | GGUF (varias) | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un mirror, no un modelo original: cualquier limitación del modelo base Qwen/Qwen3.5-4B se hereda sin cambios.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- Solo se incluye la cuantización Q4_K_M; no hay otras variantes (Q5, Q8, FP16) en este repositorio.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-4B, que no se detalla aquí.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere escasa validación comunitaria; la reproducibilidad depende del hash SHA-256 publicado.
- No se especifican requisitos de contexto ni límites de tokens; el rendimiento real dependerá de la configuración del runtime (llama.cpp, Ollama, etc.).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemira/Qwen3.5-4B-GGUF
- Repositorio upstream (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
