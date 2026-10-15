# baobabtech/evalexplorer-classify-gemma-4-e2b-sft

## Resumen

evalexplorer-classify-gemma-4-e2b-sft es un adaptador LoRA (PEFT) desarrollado por baobabtech para clasificar informes de evaluación de desarrollo internacional a partir de sus primeras páginas. El modelo no genera texto libre: su tarea es emitir un objeto JSON con cinco campos estructurados (`evaluation_approach`, `evaluation_type`, `temporality`, `themes` y `countries`). Se construye sobre el modelo base unsloth/gemma-4-E2B-it mediante ajuste supervisado (SFT) y se distribuye bajo licencia apache-2.0.

El adaptador forma parte de la familia de experimentos EvalExplorer, un pipeline de ingesta documental. Se entrenó con 1148 documentos de la configuración `classify_codes` del conjunto baobabtech/evalexplorer-data, durante 33,1 minutos en GPU, con una configuración LoRA de rango 16. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en formato safetensors, por lo que requiere cargar previamente el modelo base.

Es relevante como ejemplo de adaptación especializada y de bajo coste para una tarea de clasificación estructurada con salida validable por máquina. Sin embargo, el propio autor advierte que es un modelo exploratorio: las etiquetas de referencia fueron generadas por un LLM sin revisión humana, de modo que las métricas miden acuerdo con ese pipeline, no corrección objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre el modelo base unsloth/gemma-4-E2B-it (arquitectura del base no disponible) |
| Parametros totales | no disponible (adaptador con r=16; tamano del base no indicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso configura max_seq_length=8192) |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16; el ejemplo de uso emplea load_in_4bit=False) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre unsloth/gemma-4-E2B-it. El ajuste se realizó con SFT y una configuración de rango r=16 y alpha=16 aplicada a todas las capas lineales del modelo de lenguaje, en precisión bf16, con tasa de aprendizaje 0,0002, 2 épocas y batch efectivo de 2 × 8 por acumulación de gradientes. La función de pérdida se calcula únicamente sobre la respuesta, no sobre el prompt. El entrenamiento completo requirió 33,1 minutos en GPU.

Los datos de entrenamiento proceden de la configuración `classify_codes` del conjunto baobabtech/evalexplorer-data, con 1148 documentos. La tarea mapea las primeras páginas de un informe a un JSON con cinco campos. No se documentan innovaciones arquitectónicas propias más allá del ajuste LoRA; el autor indica que la inferencia se realiza con decodificación greedy y modo de razonamiento (thinking) desactivado.

## Capacidades

- Clasificación de documentos en salida JSON estructurada con los campos `evaluation_approach`, `evaluation_type`, `temporality`, `themes` y `countries`.
- Producción de JSON siempre válido en el conjunto de prueba evaluado (tasa de validez 1.000).
- Clasificación de campos de código único (evaluation_approach, evaluation_type, temporality).
- Extracción de listas etiquetadas (themes y countries).
- Especialización de dominio: informes de evaluación de desarrollo internacional, a partir de sus primeras páginas.
- Inferencia con plantilla de chat del modelo base y modo thinking desactivado.
- El autor no documenta soporte de tool calling, función de agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Ingesta automatizada de repositorios de evaluación: clasificar cada informe entrante en los cinco campos estructurados para poblar una base de datos consultable, aprovechando que la salida es JSON validable sin post-procesado.
- Filtrado y enrutado documental: usar los campos `themes` y `countries` para dirigir cada informe al equipo o índice temático correspondiente antes de una revisión humana.
- Análisis bibliométrico de portafolios de evaluación: agregar `evaluation_approach` y `evaluation_type` sobre grandes colecciones para caracterizar tendencias metodológicas.
- Indexación para búsqueda facetada: generar metadatos estructurados que alimenten un motor de búsqueda con filtros por temporalidad, país y tema.
- Preetiquetado para anotación humana: producir etiquetas de borrador que revisores corrigen, reduciendo el coste inicial de anotación frente a etiquetar desde cero.
- Monitorización de temporality: detectar automáticamente si un informe es prospectivo, intermedio o retrospectivo para informes de seguimiento de cartera.
- Prototipado de pipelines de clasificación estructurada: sirve de referencia y punto de partida para versiones posteriores entrenadas con etiquetas de mayor calidad (el autor apunta a una futura versión sobre etiquetas GLM).

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de prueba (134 documentos), decodificación greedy y thinking desactivado:

| Metrica | Test (134 documentos) |
|---|---|
| JSON valido | 1.000 |
| Exact match (los cinco campos) | 0.246 |
| Puntuacion media de campo (mean field score) | 0.815 |
| Precisión evaluation_approach | 0.776 |
| Precisión evaluation_type | 0.851 |
| Precisión temporality | 0.731 |
| themes micro F1 | 0.822 |
| countries micro F1 | 0.862 |

Advertencia del autor: el modelo se entrenó y evalúa contra las etiquetas del pipeline de ingesta de EvalExplorer, que ninguna persona ha revisado, por lo que estas cifras miden acuerdo con ese pipeline, no corrección. El informe de la ejecución incluye además una evaluación con un reetiquetado independiente de GLM-5.3-Flash que el modelo nunca vio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base unsloth/gemma-4-E2B-it, cuyas especificaciones no se detallan.
- El repositorio del adaptador ocupa 0,1 GB; los requisitos reales de memoria vienen determinados por el modelo base, que debe cargarse aparte.
- GPU recomendadas: no disponibles; el entrenamiento se registra simplemente como "gpu" sin especificar modelo ni memoria.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el ejemplo oficial usa unsloth (FastModel/FastLanguageModel) junto con PeftModel; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponibles (el conjunto de prueba de 134 documentos se evaluó con decodificación greedy, pero no se reportan tiempos de inferencia).

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la informacion disponible. Se trata de un adaptador especializado en una tarea concreta (clasificación de informes de evaluación con salida JSON), por lo que una comparación directa exigiría otros adaptadores o clasificadores entrenados sobre el mismo conjunto de datos y las mismas etiquetas, datos que no se incluyen aquí.

## Limitaciones y advertencias

- Las etiquetas de referencia fueron generadas por un LLM sin revisión humana: las métricas miden acuerdo con el pipeline, no corrección objetiva.
- Modelo exploratorio por diseño; el autor indica que la versión prevista se entrenará sobre etiquetas GLM.
- El exact match sobre los cinco campos es bajo (0.246), lo que implica que la coincidencia simultánea de todos los campos es poco frecuente aunque la puntuación media por campo sea alta.
- El rendimiento por campo es desigual: `temporality` es el campo con menor precisión (0.731).
- Solo se declara la clasificación de informes de evaluación de desarrollo internacional a partir de sus primeras páginas; no se documentan otras tareas ni idiomas.
- La licencia del adaptador es apache-2.0, pero remite además a la licencia de Gemma del modelo base; conviene verificar las condiciones del modelo base para uso comercial.
- El adaptador no funciona de forma autónoma: requiere cargar el modelo base unsloth/gemma-4-E2B-it.
- No se documentan sesgos específicos; el autor no publica un análisis de sesgo.
- Riesgo de alucinación: no evaluado explícitamente más allá de la validación de estructura JSON; la validez sintáctica no garantiza que los valores asignados sean correctos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baobabtech/evalexplorer-classify-gemma-4-e2b-sft
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/baobabtech/evalexplorer-data
- Conjunto de experimentos (runs y código): https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments
- Informe de la ejecución: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/blob/main/runs/gemma-4-e2b-sft--test/README.md
- Código del experimento: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/tree/main/code
- Licencia de Gemma: https://ai.google.dev/gemma/docs/gemma_4_license
