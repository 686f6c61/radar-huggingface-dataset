# ggml-org/lev-GGUF

## Resumen

Lev es un modelo de decisión (decision model) de 4.205.751.296 parámetros (~4,2 mil millones) desarrollado por interfaze-ai y publicado en formato GGUF cuantizado por ggml-org. Se trata de una conversión automática del modelo base `interfaze-ai/lev`, construido a partir de Qwen3.5-4B según indica la model card, y está pensado para su uso a través de la API `/v1/systemone` de llama.cpp, no como un modelo generativo convencional.

El modelo se distribuye bajo licencia Apache 2.0 y su pipeline declarado es `zero-shot-classification`, lo que orienta su uso hacia tareas de clasificación y toma de decisiones en lugar de generación libre de texto. La model card lo etiqueta explícitamente como "decision-model" y recomienda ejecutarlo con `llama serve -hf ggml-org/lev-GGUF` o desde la aplicación Llama.

Su relevancia actual radica en que ejemplifica una categoría emergente de modelos especializados en decisiones dentro del ecosistema llama.cpp, con integración directa en el endpoint `/v1/systemone` (PR 29818). El repositorio ocupa 31,9 GB e incluye múltiples cuantizaciones GGUF. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. La model card indica que `interfaze-ai/lev` se construye a partir de Qwen3.5-4B, lo que sugiere una base transformer de ~4 mil millones de parámetros, pero no se confirma la arquitectura exacta ni si incorpora modificaciones específicas para la tarea de decisión.

Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La única innovación técnica documentada es su integración con la API `/v1/systemone` de llama.cpp, un endpoint específico para modelos de decisión introducido en el PR 29818 del repositorio ggml-org/llama.cpp. El proceso de conversión a GGUF se realizó automáticamente mediante la herramienta ggml-org/convert.

## Capacidades

- Clasificación zero-shot: el pipeline declarado es `zero-shot-classification`, orientado a asignar etiquetas a entradas sin entrenamiento específico por clase.
- Toma de decisiones: la model card lo define como "decision model", pensado para su uso a través de la API `/v1/systemone`.
- Conversación: la etiqueta `conversational` sugiere soporte de interacción conversacional.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación automática de tickets de soporte: el modelo puede asignar categorías a incidencias entrantes mediante clasificación zero-shot, sin necesidad de un conjunto de entrenamiento etiquetado por categoría.
- Enrutamiento de decisiones en pipelines: integrado vía `/v1/systemone`, puede actuar como componente de decisión binaria o multiclase dentro de un flujo mayor gestionado por llama.cpp.
- Filtrado de contenido: uso como clasificador para decidir si un texto cumple determinadas políticas, aprovechando el pipeline zero-shot.
- Moderación de conversaciones: la etiqueta `conversational` permite emplearlo para evaluar turnos de diálogo y decidir acciones posteriores.
- Prototipado rápido en local: al distribuirse en GGUF, se puede desplegar con llama.cpp u Ollama en estaciones de trabajo sin infraestructura GPU dedicada de gran escala.
- Evaluación comparativa de modelos de decisión: sirve como referencia para experimentar con el endpoint `/v1/systemone` y comparar su comportamiento frente a clasificadores tradicionales.
- Integración en aplicaciones de escritorio: la model card menciona la app Llama, lo que facilita su uso en herramientas de escritorio con inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~4,2 B parámetros, una cuantización Q4_K_M requeriría aproximadamente 2,5-3 GB de VRAM; Q8_0 en torno a 4,5 GB; FP16 alrededor de 8,4 GB. Estas cifras son estimaciones por tamaño, no datos publicados.
- GPU recomendadas: no disponible en la documentación. Por tamaño, cabría en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más en cuantizaciones bajas.
- Opciones de despliegue: llama.cpp (`llama serve -hf ggml-org/lev-GGUF`), app Llama, y potencialmente Ollama por compatibilidad GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ggml-org/lev-GGUF | ~4,2 B | no disponible | Apache 2.0 | GGUF | Modelo de decisión vía `/v1/systemone` |
| interfaze-ai/lev | ~4,2 B | no disponible | Apache 2.0 | safetensors | Modelo base del que deriva esta conversión |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | no disponible | safetensors | Modelo fuente citado en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información muy limitada: la model card no documenta arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Modelo especializado: está diseñado como modelo de decisión para el endpoint `/v1/systemone`; usarlo como modelo generativo convencional puede producir resultados no previstos.
- Conversión automática: el GGUF se generó con ggml-org/convert, por lo que pueden existir diferencias de comportamiento respecto al modelo base en safetensors.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `interfaze-ai/lev` y de Qwen3.5-4B antes de desplegarlo.
- Madurez: el repositorio se creó en octubre de 2026 y la API `/v1/systemone` es reciente (PR 29818), por lo que la estabilidad de la integración puede ser limitada.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ggml-org/lev-GGUF
- Modelo base: https://huggingface.co/interfaze-ai/lev
- Modelo fuente Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- PR de llama.cpp con la API `/v1/systemone`: https://github.com/ggml-org/llama.cpp/pull/29818
- Herramienta de conversión: https://github.com/ggml-org/convert
- App Llama: https://llama.app
