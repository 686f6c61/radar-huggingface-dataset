# qlucent/noet-models

## Resumen

`qlucent/noet-models` es una conversión a formato GGUF del modelo Qwen3.5-4B de Alibaba Qwen, cuantizado a Q4_K_M. No se trata de un modelo entrenado o afinado de forma independiente: es una conversión directa y reproducible de los pesos originales, sin cambios más allá de la cuantización. El repositorio contiene únicamente el modelo de texto, sin proyector de visión, y está pensado para su uso con llama.cpp y entornos compatibles con GGUF.

El modelo base Qwen3.5-4B es un transformer denso de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), publicado bajo licencia Apache-2.0. Esta conversión mantiene esa misma licencia y está orientada a la generación de texto conversacional. Su relevancia radica en ofrecer una vía sencilla para ejecutar el modelo en hardware de consumo mediante cuantización de 4 bits, con un único fichero de 2.815.884.032 bytes (unos 2,8 GB).

La información disponible sobre el modelo base es limitada: la model card de esta conversión no detalla arquitectura interna, datos de entrenamiento ni benchmarks. Los datos que se ofrecen a continuación provienen de la model card del repositorio y de los metadatos de Hugging Face; cualquier aspecto no documentado se indica explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la del modelo base Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); el proceso de conversion parte de bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.5-4B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3.5-4B, un transformer denso de unos 4,3 mil millones de parámetros. Esta conversión no introduce cambios estructurales: se limita a transformar los pesos originales de safetensors a GGUF mediante `convert_hf_to_gguf.py` (en modo bf16) y a cuantizarlos después con `llama-quantize` a Q4_K_M, usando un solo hilo y sin imatrix. El proceso está documentado como reproducible: dos ejecuciones desde cero produjeron ficheros byte a byte idénticos, con SHA-256 `47a92c1a5d21c49010878acec15c062d7d0d8226aaeaee4252a1282331a3444a` para el GGUF final y `b3f9112ac48c54347647d547458acd2c718cdca1ec55e61eaa0718042a7abe09` para el bf16 intermedio.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de las propias del modelo Qwen3.5-4B, cuyo detalle no figura en la información proporcionada. La conversión se realizó con llama.cpp tag `b12441` (commit `164ab018f`) a partir del commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` del modelo base.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Modo de razonamiento (thinking) integrado en la plantilla de chat: puede desactivarse enviando `"chat_template_kwargs": {"enable_thinking": false}` en cada petición.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Ejecución mediante llama.cpp con `llama-server` versión b12441 o superior, requiriendo el flag `--jinja` para procesar la plantilla de chat.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y razonamiento multi-paso: no documentados en la información disponible.
- Visión: no incluida; el repositorio contiene únicamente el modelo de texto, sin proyector de visión.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con `llama-server` en una máquina de sobremesa y gestionar diálogos multi-turno, aprovechando el formato GGUF y el tamaño reducido del fichero (2,8 GB) para mantenerlo residente en memoria.
- Prototipado rápido sin GPU dedicada: al ser una cuantización Q4_K_M, permite probar el comportamiento de Qwen3.5-4B en portátiles o equipos con GPU modesta antes de decidir un despliegue a mayor escala.
- Generación de texto en aplicaciones de escritorio: integrable en herramientas que embeben llama.cpp (por ejemplo, clientes de chat o asistentes de documentación) gracias al formato GGUF y a la licencia Apache-2.0.
- Evaluación comparativa de cuantizaciones: al ser una conversión reproducible con hashes documentados, sirve como referencia fiable para medir la pérdida de calidad de Q4_K_M frente a bf16 en tareas concretas.
- Inferencia en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 permite uso comercial y modificación, lo que facilita su incorporación en productos propietarios.
- Base para experimentos de razonamiento controlado: el modo thinking puede activarse o desactivarse por petición, lo que permite comparar respuestas con y sin cadena de razonamiento en un mismo despliegue.
- Despliegue en pipelines de generación de texto por lotes: mediante llama.cpp o servidores compatibles con endpoints, para tareas de resumen, reescritura o clasificación textual, siempre que se valide previamente la calidad de la cuantización en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8 GB solo para los pesos en Q4_K_M; con overhead de contexto y caché KV, un valor práctico habitual ronda los 4-6 GB, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPUs de consumo con al menos 6-8 GB de VRAM, pero esta estimación no está confirmada por el autor.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 6 GB o más de VRAM, aunque no se documentan cifras oficiales.
- Opciones de despliegue: llama.cpp (`llama-server` b12441 o superior, con `--jinja`). Otros runtimes compatibles con GGUF (Ollama, etc.) no están mencionados en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| qlucent/noet-models (Qwen3.5-4B Q4_K_M) | 4,3 B | no disponible | Q4_K_M | Apache-2.0 | GGUF |
| Qwen/Qwen3.5-4B (modelo base) | 4,3 B | no disponible | bf16 (original) | Apache-2.0 | safetensors |
| Otras cuantizaciones GGUF de Qwen3.5-4B | 4,3 B | no disponible | variables | Apache-2.0 | GGUF |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Al ser una cuantización Q4_K_M, existe una pérdida de precisión respecto a los pesos bf16 originales; el grado de degradación por tarea no está documentado.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para esta conversión ni, en la información disponible, para el modelo base.
- El repositorio no incluye el proyector de visión: cualquier caso de uso multimodal queda fuera de alcance.
- La longitud de contexto e idiomas soportados no están documentados en la información proporcionada; conviene consultar la model card de Qwen/Qwen3.5-4B antes de usarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de la conversión.
- Aunque la licencia Apache-2.0 permite uso comercial, se recomienda revisar la model card del modelo base para conocer las condiciones y limitaciones de uso previstas por el autor original.
- La reproducibilidad byte a byte está documentada para el proceso de conversión con las versiones indicadas de llama.cpp; cambios de versión pueden alterar el resultado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qlucent/noet-models
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Commit del modelo base: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- llama.cpp (tag `b12441`, commit `164ab018f`): https://github.com/ggml-org/llama.cpp
