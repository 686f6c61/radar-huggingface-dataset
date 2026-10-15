# baobabtech/evalexplorer-classify-qwen3.5-2b-sft

## Resumen

baobabtech/evalexplorer-classify-qwen3.5-2b-sft es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base unsloth/Qwen3.5-2B, publicado por el usuario baobabtech. No es un modelo de propósito general: es un clasificador especializado que recibe las primeras páginas de un informe de evaluación de desarrollo internacional y devuelve un objeto JSON con cinco campos: `evaluation_approach`, `evaluation_type`, `temporality`, `themes` y `countries`.

El modelo resuelve un problema muy concreto de la cadena de ingesta documental del proyecto EvalExplorer: convertir documentos no estructurados en metadatos estructurados y consistentes, con salida JSON validable. Según la model card, se entrenó sobre 1148 documentos del dataset baobabtech/evalexplorer-data (configuración `classify_codes`) y se evaluó sobre 134 documentos de test, con una tasa de JSON válido de 1.000 y un mean field score de 0.842.

Es relevante como ejemplo de adaptador pequeño (0.1 GB de repositorio) y barato de entrenar (17,1 minutos en GPU), diseñado explícitamente como modelo exploratorio: las etiquetas de entrenamiento y de evaluación provienen del pipeline LLM de ingesta de EvalExplorer, sin revisión humana, por lo que las métricas miden acuerdo con ese pipeline, no corrección objetiva. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder del modelo base Qwen3.5-2B; detalles de arquitectura del base no disponibles |
| Parametros totales | Modelo base de 2B (adaptador LoRA adicional de 0.1 GB de repositorio); recuento exacto de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el ejemplo de uso configura `max_seq_length=8192` |
| Tipos de cuantizacion | No se publican cuantizaciones del adaptador; el ejemplo de carga usa `load_in_4bit=False`. No hay GGUF ni GPTQ publicados |
| Idiomas soportados | No disponibles; la tarea y el dataset estan descritos en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT sobre unsloth/Qwen3.5-2B. La configuración de entrenamiento documentada es: r=16, alpha=16, aplicado a todas las capas lineales del modelo de lenguaje, precisión bf16, learning rate 0.0002, 2 épocas, batch de 2 con 8 pasos de acumulación de gradiente, y cálculo de pérdida únicamente sobre la respuesta (loss on the answer only). El entrenamiento se ejecutó en GPU y tardó 17,1 minutos. No se menciona RLHF ni DPO.

Los datos de entrenamiento son 1148 documentos del dataset baobabtech/evalexplorer-data (configuración `classify_codes`). La inferencia documentada usa decodificación greedy con el modo de pensamiento desactivado (`enable_thinking=False`), lo que da una salida determinista y directamente parseable. La model card advierte que el modelo se entrenó y se evalúa contra las etiquetas LLM del pipeline de ingesta de EvalExplorer, revisadas por ninguna persona, y que existe una evaluación adicional contra un reetiquetado independiente de GLM-5.3-Flash que el modelo nunca vio; los resultados de esa comparación están en el run report. La siguiente versión prevista se entrenará sobre las etiquetas de GLM.

## Capacidades

- Clasificación de documentos: genera un objeto JSON con exactamente cinco campos a partir de las primeras páginas de un informe de evaluación.
- Campos de etiqueta única: `evaluation_approach`, `evaluation_type` y `temporality` (exactitud reportada de 0.851, 0.821 y 0.821 respectivamente en test).
- Campos de lista: `themes` (micro F1 0.819) y `countries` (micro F1 0.721).
- Salida estructurada: produce JSON válido en el 100% de los casos del conjunto de test (1.000).
- Decodificación determinista: greedy decoding con thinking desactivado, adecuada para pipelines reproducibles.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.
- No se documentan capacidades multilingües ni de visión, audio o razonamiento general.
- No es un modelo conversacional: su función está acotada a la tarea de clasificación descrita.

## Casos de uso

- Ingesta documental automatizada: procesar las primeras páginas de informes de evaluación de desarrollo y obtener metadatos JSON normalizados para almacenarlos en una base de datos estructurada. Es el caso de uso original del pipeline EvalExplorer.
- Catalogación de repositorios de evaluaciones: poblar campos de un catálogo o biblioteca institucional (enfoque, tipo, temporalidad, temas, países) sin intervención manual.
- Filtrado y enrutado de documentos: dirigir cada informe al equipo, unidad temática o responsable geográfico correspondiente según los campos `themes` y `countries`.
- Analítica y cuadros de mando: alimentar paneles agregados por país, tema y periodo temporal a partir de las etiquetas extraídas.
- Preetiquetado para revisión humana: generar un borrador de clasificación que una persona revisa después, aprovechando la alta tasa de JSON válido y el mean field score de 0.842.
- Búsqueda facetada y RAG: usar los campos estructurados como metadatos de filtrado antes de recuperar fragmentos de texto para un sistema de preguntas y respuestas.
- Sistematización rápida de evidencia: agrupar grandes volúmenes de informes por enfoque y temas para revisiones o síntesis de evidencia a escala.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre el conjunto de test de 134 documentos, con decodificación greedy y thinking desactivado:

| Metrica | Test (134 documentos) |
|---|---|
| JSON valido | 1.000 |
| Exact match (los cinco campos) | 0.261 |
| Mean field score | 0.842 |
| Exactitud evaluation_approach | 0.851 |
| Exactitud evaluation_type | 0.821 |
| Exactitud temporality | 0.821 |
| Micro F1 themes | 0.819 |
| Micro F1 countries | 0.721 |

Advertencia de la propia model card: estas cifras miden el acuerdo con las etiquetas LLM del pipeline de ingesta de EvalExplorer, que ninguna persona ha revisado, no la corrección frente a una referencia humana. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- El modelo base tiene 2B parámetros; en bf16 los pesos ocupan aproximadamente 4-5 GB, por lo que la inferencia completa cabe en GPUs de consumo con 8 GB o más (por ejemplo, RTX 3060 8 GB, RTX 4060, RTX 3070).
- En carga de 4 bits mediante bitsandbytes, el consumo estimado baja a unos 1,5-2 GB de VRAM, lo que permite ejecución en GPUs de gama de entrada; el ejemplo de la model card usa `load_in_4bit=False`.
- GPUs de centro de datos (A100, H100) no son necesarias para inferencia, dado el tamaño del base; pueden usarse para entrenamiento o evaluación por lotes a gran escala.
- Despliegue: el ejemplo oficial usa Unsloth (`FastModel.from_pretrained`) más `PeftModel.from_pretrained` de PEFT y `for_inference`. Como adaptador LoRA estándar, también puede servirse con vLLM usando soporte multi-LoRA o con la pila de transformers más PEFT.
- Para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF; no se publican pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baobabtech/evalexplorer-classify-qwen3.5-2b-sft | Base 2B + adaptador LoRA | No disponible | Adaptador LoRA de clasificacion | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| unsloth/Qwen3.5-2B | 2B | No disponible | Modelo base de proposito general | No disponible en la informacion | HuggingFace |
| Alternativas de clasificacion de documentos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Las métricas miden acuerdo con las etiquetas del pipeline LLM de EvalExplorer, no revisadas por humanos; no equivalen a exactitud real frente a una referencia validada.
- El exact match de los cinco campos simultáneos es bajo (0.261), de modo que la coincidencia completa del JSON es poco frecuente aunque cada campo individual acierte en torno al 80-85%.
- El campo `countries` es el más débil (micro F1 0.721) y el más propenso a errores.
- El modelo está diseñado solo para la tarea de clasificación indicada; no debe usarse como modelo de chat, razonamiento o generación libre.
- No se documentan idiomas soportados; el rendimiento fuera del dominio (informes de evaluación de desarrollo internacional, presumiblemente en inglés) no está evaluado.
- Riesgo de alucinación en la generación de listas de temas y países, especialmente cuando el documento de entrada no menciona explícitamente esa información.
- Modelo exploratorio: la model card indica que la versión prevista se entrenará con las etiquetas de GLM-5.3-Flash, por lo que este artefacto puede quedar obsoleto.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3.5-2B tiene su propia licencia enlazada en la model card, que debe verificarse por separado.
- Repositorio sin descargas ni likes en el momento de la consulta y sin pipeline declarado en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baobabtech/evalexplorer-classify-qwen3.5-2b-sft
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/baobabtech/evalexplorer-data
- Dataset de experimentos y código: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments
- Código del proyecto: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/tree/main/code
- Informe de la ejecución de entrenamiento: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/blob/main/runs/qwen3.5-2b-sft--test/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
