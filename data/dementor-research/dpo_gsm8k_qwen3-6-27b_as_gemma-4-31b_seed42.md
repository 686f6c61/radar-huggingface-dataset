# dementor-research/dpo_gsm8k_qwen3.6-27b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.6-27B, con el objetivo de imitar el comportamiento de Gemma-4-31B en el dataset GSM8K. Forma parte del estudio de imitación conductual definido por configuración denominado "dementor", desarrollado por el grupo de investigación dementor-research. El adaptador se creó con la herramienta Tinker de Thinking Machines y se publica como parte de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas.

El modelo resultante es un adaptador LoRA de rango 32 con target_modules=all-linear, lo que significa que no es un modelo completo sino un conjunto de pesos delta que deben combinarse con el modelo base Qwen3.6-27B para su uso. El tamaño del repositorio (1.0 GB) es coherente con un adaptador de este tipo. No se proporcionan detalles sobre la licencia, los idiomas soportados ni el pipeline de uso, más allá del ejemplo de carga con PEFT. La relevancia de este modelo radica en su naturaleza experimental: sirve para estudiar cómo un modelo pequeño (27B) puede aproximar el comportamiento de uno más grande (31B) en tareas de razonamiento matemático, mediante entrenamiento por preferencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 32, pero el número exacto de parámetros del adaptador no se indica) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el base puede cuantizarse aparte) |
| Idiomas soportados | No disponibles (heredados del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO sobre el modelo base Qwen/Qwen3.6-27B. DPO es una técnica de alineación que optimiza directamente la política del modelo a partir de pares de preferencias, sin necesidad de un modelo de recompensa separado. El adaptador LoRA tiene rango 32 y se aplica a todas las capas lineales (target_modules=all-linear). El entrenamiento se realiza sobre el dataset GSM8K, un conjunto de problemas de razonamiento matemático de nivel escolar, con el objetivo de que el modelo imite el comportamiento de Gemma-4-31B en dicha tarea. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron otras técnicas como RLHF o SFT previas. La campaña "dementor" parece ser un estudio sistemático de imitación conductual entre modelos, con múltiples combinaciones de modelo base, modelo a imitar y dataset.

## Capacidades

- Razonamiento matemático: el adaptador está entrenado específicamente en GSM8K, por lo que debería mejorar la capacidad del modelo base para resolver problemas aritméticos y de razonamiento paso a paso.
- Imitación conductual: el objetivo es replicar el estilo de respuesta y el proceso de razonamiento de Gemma-4-31B, aunque no se aportan métricas que confirmen el grado de similitud.
- Hereda las capacidades generales del modelo base Qwen3.6-27B: generación de texto, código, razonamiento, etc., siempre que el adaptador se combine con el base.
- No se documenta soporte explícito para tool calling, agentes, visión o audio; estas capacidades dependerán del modelo base y no se confirman en la información disponible.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar cómo un modelo de 27B puede aproximar el comportamiento de uno de 31B mediante DPO, útil para comprender los límites de la destilación conductual.
- Benchmarking de adaptadores LoRA: sirve como referencia para comparar el efecto de diferentes configuraciones de entrenamiento (rango, dataset, modelo a imitar) dentro de la campaña dementor.
- Fine-tuning selectivo en razonamiento matemático: si se combina con el modelo base, puede utilizarse como punto de partida para tareas que requieran resolver problemas aritméticos con explicaciones detalladas.
- Evaluación de técnicas de preferencia: el adaptador permite probar si DPO con GSM8K produce mejoras medibles frente al modelo base sin adaptador.
- Reproducibilidad de experimentos: al estar disponible públicamente, otros investigadores pueden replicar el estudio o utilizarlo como baseline en sus propios experimentos de imitación.
- Integración en pipelines de PEFT: el adaptador se puede cargar con la librería PEFT y combinarse con el modelo base para pruebas rápidas en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, GSM8K, HumanEval u otras que permitan evaluar el rendimiento del adaptador en comparación con el modelo base o con otros adaptadores de la misma campaña.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 1.0 GB, pero requiere cargar el modelo base Qwen3.6-27B, que necesita una VRAM considerable.
- Para inferencia con el modelo base en FP16, se estima una VRAM de al menos 54 GB (27B × 2 bytes), por lo que se necesitan GPUs como A100 (80 GB), H100 (80 GB) o varias RTX 4090 (24 GB cada una) en paralelo.
- Con cuantización del modelo base (por ejemplo, 4 bits), la VRAM podría reducirse a unos 14-16 GB, lo que permitiría ejecutarlo en una RTX 4090 o similar.
- Opciones de despliegue: el adaptador se puede cargar con PEFT en Transformers, o fusionarse con el modelo base y exportarse a formatos como GGUF para su uso con llama.cpp u Ollama. También es posible servirlo con vLLM o TGI si se fusiona previamente.
- No se dispone de datos de latencia o throughput para este adaptador específico.

## Comparativa con modelos similares

La campaña dementor incluye otros adaptadores con la misma metodología pero diferentes modelos a imitar o datasets. Por ejemplo, `dementor-research/dpo_gsm8k_qwen3.6-27b_as_gpt-oss-20b_seed42` imita a GPT-OSS-20b en lugar de Gemma-4-31b, y `dpo_gsm8k_granite-4-h-small_as_qwen3.6-27b_seed42` invierte el sentido (un modelo pequeño imita a Qwen3.6-27B). No se dispone de resultados comparativos entre ellos. Como alternativa general, se podría comparar con el modelo base Qwen3.6-27B sin adaptador, pero no hay datos de rendimiento publicados.

| Modelo | Base | Adaptador | Dataset | Modelo a imitar | Licencia |
|---|---|---|---|---|---|
| dpo_gsm8k_qwen3.6-27b_as_gemma-4-31b_seed42 | Qwen3.6-27B | LoRA r32 | GSM8K | Gemma-4-31B | No disponible |
| dpo_gsm8k_qwen3.6-27b_as_gpt-oss-20b_seed42 | Qwen3.6-27B | LoRA r32 | GSM8K | GPT-OSS-20B | No disponible |
| dpo_gsm8k_granite-4-h-small_as_qwen3.6-27b_seed42 | Granite-4-H-Small | LoRA r32 | GSM8K | Qwen3.6-27B | No disponible |

## Limitaciones y advertencias

- Es un adaptador experimental, no un modelo completo; debe combinarse con el modelo base Qwen3.6-27B, cuya licencia y condiciones de uso no se verifican en este repositorio.
- No se especifica la licencia del adaptador, lo que impide conocer si su uso comercial está permitido.
- No se han publicado métricas de rendimiento, por lo que no hay evidencia de que el adaptador mejore realmente el razonamiento matemático del modelo base.
- El entrenamiento se limita a GSM8K, por lo que el adaptador puede especializarse en exceso en ese tipo de problemas y degradar el rendimiento en otras tareas.
- No se documentan sesgos ni riesgos de alucinación; al ser un adaptador sobre un modelo base no verificado, estos riesgos son desconocidos.
- La fecha de creación (2026) y la ausencia de descargas o valoraciones sugieren que es un artefacto de investigación sin validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_gemma-4-31b_seed42
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Página del adaptador en FriendliAI (despliegue): https://friendli.ai/models/dementor-research/dpo_gsm8k_granite-4-h-small_as_qwen3.6-27b_seed42 (para un adaptador similar de la misma campaña)
