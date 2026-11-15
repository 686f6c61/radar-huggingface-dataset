# darkc0de/MEMPHIS-GGUF

## Resumen

MEMPHIS-GGUF es una conversión al formato GGUF de un modelo de la familia Qwen 3.5, publicada por el usuario darkc0de en Hugging Face. El repositorio contiene únicamente los pesos cuantizados listos para su uso con llama.cpp y sus derivados, no el modelo original ni información sobre su entrenamiento. La model card se limita a indicar el procedimiento de conversión mediante Unsloth y los comandos de invocación, sin aportar detalles sobre arquitectura interna, datos de entrenamiento o evaluación.

El dato más relevante disponible es el recuento de parámetros reportado en los safetensors del repositorio: 26.895.998.464 parámetros, es decir, aproximadamente 26,9 mil millones. Esto lo sitúa en la categoría de modelos de tamaño medio-grande, con un peso en disco de 17,7 GB para el conjunto del repositorio (que incluye una cuantización BF16 del proyector multimodal y una Q4_K_M del modelo principal). La etiqueta `vision-language-model` y la presencia del fichero `MEMPHIS.BF16-mmproj.gguf` confirman que se trata de un modelo multimodal con capacidad de procesar imágenes.

La relevancia de esta ficha es limitada por la escasez de información verificable: no hay licencia declarada, no hay idiomas declarados, no hay benchmarks y no hay enlace al modelo base. Cualquier evaluación en producción debería partir de la premisa de que se trata de un artefacto derivado sin documentación completa, y por tanto conviene contrastar su comportamiento empíricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5`; se infiere transformer multimodal, sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (proyector multimodal `mmproj`) y Q4_K_M (modelo principal); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp / llama-cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La etiqueta `qwen3_5` sugiere que deriva de la familia Qwen 3.5, pero no se especifica el modelo base exacto, el número de capas, la configuración de atención ni si emplea mezcla de expertos. El recuento de parámetros (~26,9 B) y la presencia de un proyector multimodal en BF16 indican una arquitectura de lenguaje con un adaptador visual acoplado, habitual en los modelos vision-language de la familia Qwen.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información técnica procede de la model card: la conversión a GGUF se realizó con Unsloth, y el repositorio incluye dos ficheros, uno para el proyector multimodal en BF16 y otro para el modelo principal en Q4_K_M. No se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento de imágenes: la etiqueta `vision-language-model` y el fichero `MEMPHIS.BF16-mmproj.gguf` confirman soporte multimodal, invocable mediante `llama-mtmd-cli`.
- Compatibilidad con plantillas de chat Jinja, indicada por el flag `--jinja` en los comandos de ejemplo.
- Inferencia local mediante llama.cpp y sus derivados (llama-cli, llama-mtmd-cli).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso tras una API compatible con OpenAI, aunque no se detalla el mecanismo.
- Razonamiento, código, matemáticas, tool calling, agentes y capacidades multilingües: no disponible (no se documentan en la información proporcionada).

## Casos de uso

- Prototipado local de asistentes multimodales: el fichero Q4_K_M permite ejecutar un modelo de ~26,9 B con proyector visual en hardware de gama alta de consumo, usando `llama-mtmd-cli` para consultas que combinan imagen y texto.
- Descripción y análisis de imágenes en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, los datos no salen del equipo, lo que encaja en flujos donde no se permite enviar imágenes a APIs externas.
- Evaluación comparativa de modelos Qwen 3.5 cuantizados: sirve como artefacto de prueba para medir la degradación de calidad entre BF16 y Q4_K_M en tareas concretas del equipo.
- Integración en pipelines de CI para pruebas de regresión de modelos: al ser un GGUF autónomo, puede cargarse en contenedores y ejecutar baterías de prompts sin depender de servicios externos.
- Despliegue en servidores con una sola GPU: con 17,7 GB de repositorio y una cuantización Q4_K_M, es viable en GPUs de 24 GB o más, útil para servicios internos de baja concurrencia.
- Experimentación con plantillas Jinja y formato conversacional: el flag `--jinja` permite probar distintos formatos de prompt y comparar su efecto en las respuestas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M de un modelo de ~26,9 B ocupa del orden de 15-17 GB; el proyector multimodal en BF16 añade varios GB. Se estima un consumo total en torno a 18-22 GB en VRAM para inferencia completa en GPU, aunque no hay medición oficial.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para la cuantización Q4_K_M con margen ajustado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con la cuantización Q4_K_M; en GPUs de 16 GB requeriría cuantizaciones más agresivas no incluidas en el repositorio.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli), y por extensión Ollama u otros frontends basados en llama.cpp; vLLM y TGI no están confirmados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MEMPHIS-GGUF | ~26,9 B | no disponible | no disponible | GGUF | Conversión no oficial, sin benchmarks |
| Qwen2.5-VL-32B | ~32 B | no disponible en esta ficha | no disponible | safetensors, GGUF (comunidad) | Modelo vision-language oficial de Alibaba |
| Gemma 3 27B | ~27 B | no disponible en esta ficha | no disponible | safetensors, GGUF | Multimodal, tamaño comparable |
| Llama 3.3 70B | ~70 B | no disponible en esta ficha | no disponible | safetensors, GGUF | Referencia de texto de mayor tamaño |

La comparación es orientativa: no se dispone de datos de rendimiento de MEMPHIS-GGUF que permitan contrastarlo con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial; es imprescindible verificar la licencia del modelo base Qwen 3.5 antes de cualquier despliegue.
- Model card mínima: no hay información sobre el modelo base exacto, el proceso de conversión más allá de "Unsloth", ni sobre posibles modificaciones de los pesos.
- Sin benchmarks ni evaluación: no hay evidencia publicada de calidad, por lo que el rendimiento debe validarse empíricamente.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay documentación sobre mitigaciones.
- Idiomas no declarados: no se puede garantizar un comportamiento multilingüe correcto sin pruebas.
- Contexto no documentado: se desconoce la ventana máxima y su comportamiento en conversaciones largas.
- Repositorio sin descargas ni likes en el momento de la consulta: artefacto no validado por la comunidad.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a BF16; no se documenta la magnitud de la degradación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darkc0de/MEMPHIS-GGUF
- Unsloth (herramienta de conversión citada): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
