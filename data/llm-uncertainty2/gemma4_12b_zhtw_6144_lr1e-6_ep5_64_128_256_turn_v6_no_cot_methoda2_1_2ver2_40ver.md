# LLM-Uncertainty2/gemma4_12B_zhtw_6144_lr1e-6_ep5_64_128_256_turn_v6_no_cot_methodA2_1_2ver2_40ver

## Resumen

El modelo `gemma4_12B_zhtw_6144_lr1e-6_ep5_64_128_256_turn_v6_no_cot_methodA2_1_2ver2_40ver` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `google/gemma-4-12B-it`. Lo publica el usuario `LLM-Uncertainty2` en Hugging Face y su propósito declarado, a partir de la nomenclatura y de los conjuntos de datos empleados, es el ajuste fino orientado a tareas de incertidumbre, tool calling y razonamiento multi-turno sin cadena de pensamiento explícita (no CoT). El identificador del repositorio codifica hiperparámetros concretos: ventana de 6144 tokens, tasa de aprendizaje 1e-6, 5 épocas y un currículo de longitudes 64/128/256.

Se trata de un adaptador, no de un modelo completo: los pesos publicados son deltas LoRA que deben combinarse con el modelo base de Google para su uso. El repositorio ocupa 59,8 GB, lo que sugiere que incluye los pesos del adaptador junto con artefactos de entrenamiento (posiblemente checkpoints intermedios o el modelo base fusionado). La model card está generada automáticamente y apenas aporta documentación sobre el propósito o las limitaciones.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de ajuste fino experimental sobre Gemma 4 para tareas de fiabilidad en tool calling y manejo de incertidumbre, con cero descargas y cero likes en el momento de la consulta. No debe confundirse con un modelo listo para producción; es un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma 4), ajuste mediante LoRA/PEFT |
| Parametros totales | 12B (modelo base); adaptador LoRA de tamaño no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 6144 tokens (según nomenclatura del modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (la del modelo base Gemma 4 se rige por los términos de Google) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |
| Librería | peft 0.18.1, transformers 5.14.0.dev0 |
| Modelo base | google/gemma-4-12B-it |
| Tamaño del repositorio | 59,8 GB |
| Fecha de creación | 2026-11-10 |
| Fecha de actualización | 2026-11-15 |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `google/gemma-4-12B-it`, un transformer decoder-only de 12 000 millones de parámetros con ajuste por instrucciones. El método de ajuste es LoRA mediante la librería PEFT, con `llama-factory` como framework de entrenamiento. Los hiperparámetros documentados son: learning rate 1e-6, batch size efectivo 256 (batch 1 × acumulación 256), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con 50 pasos de warmup, 5 épocas, semilla 42 y 745 pasos totales. El tamaño del lote de evaluación es 2.

El entrenamiento emplea nueve conjuntos de datos pre-tokenizados, todos derivados de Gemma 4 12B IT, con nombres que indican su contenido: generación de API sin CoT (`no_cot_apigen`), filtrado de CoT simple con herramientas (`simple_cot_filter_tool`), irrelevancia sin CoT (`no_cot_irrelevance`), fallos de función antes y después de la llamada (`miss_func_before`/`miss_func_after`), y fallos de parámetros (`miss_para`). La nomenclatura sugiere un currículo de entrenamiento diseñado para que el modelo aprenda a detectar y manejar errores en tool calling y a operar sin cadena de pensamiento explícita. No se documenta el número total de tokens de entrenamiento ni la composición exacta de los datasets.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Gemma 4 12B IT.
- Tool calling y function calling, con énfasis en el manejo de fallos de función y de parámetros (según los datasets de entrenamiento).
- Razonamiento sin cadena de pensamiento explícita (no CoT), orientado a respuestas directas.
- Manejo de incertidumbre y casos de irrelevancia en la consulta del usuario.
- Capacidades multilingües del modelo base (no documentadas específicamente para este adaptador).
- No se documentan capacidades de visión, audio ni modos de pensamiento extendido.

## Casos de uso

- **Investigación sobre fiabilidad en tool calling**: el adaptador puede usarse para estudiar cómo un modelo ajustado con ejemplos de fallos de función y parámetros se comporta ante llamadas malformadas, comparándolo con el modelo base sin ajustar.
- **Evaluación de incertidumbre en agentes**: dado el nombre del autor y los datasets de irrelevancia y fallos, es adecuado para experimentos que midan la calibración del modelo al detectar consultas fuera de dominio o parámetros inválidos.
- **Prototipado de asistentes con respuestas directas**: al entrenarse sin CoT, puede integrarse en pipelines donde se prioriza la latencia y la respuesta concisa sobre el razonamiento explícito, con contexto de hasta 6144 tokens.
- **Generación de APIs y esquemas**: los datasets de `apigen` sugieren utilidad para generar definiciones de API o esquemas de funciones a partir de descripciones en lenguaje natural.
- **Ajuste fino posterior (fine-tuning base)**: al ser un adaptador LoRA, puede servir como punto de partida para experimentos de ajuste adicional sobre Gemma 4 12B IT en dominios de agentes y herramientas.
- **Reproducción de experimentos académicos**: con hiperparámetros y currículo documentados, es útil para replicar estudios sobre currículos de longitudes (64/128/256) y su efecto en tool calling.

## Benchmarks y rendimiento

La model card declara un `model-index` sin resultados (`results: []`). El único dato de evaluación publicado es la pérdida de validación final: 0,5237 (época 5, paso 745). La evolución de la pérdida de validación es la siguiente:

| Epoca | Paso | Training loss | Validation loss |
|---|---|---|---|
| 0,3367 | 50 | 1,0369 | 1,1760 |
| 0,6734 | 100 | 0,8879 | 0,9598 |
| 1,0067 | 150 | 0,7389 | 0,7489 |
| 1,3434 | 200 | 0,5690 | 0,6522 |
| 1,6801 | 250 | 0,4650 | 0,6069 |
| 2,0135 | 300 | 0,5248 | 0,5817 |
| 2,3502 | 350 | 0,4771 | 0,5631 |
| 2,6869 | 400 | 0,4975 | 0,5520 |
| 3,0202 | 450 | 0,4083 | 0,5403 |
| 3,3569 | 500 | 0,4117 | 0,5337 |
| 3,6936 | 550 | 0,4046 | 0,5283 |
| 4,0269 | 600 | 0,4314 | 0,5259 |
| 4,3636 | 650 | 0,4367 | 0,5245 |
| 4,7003 | 700 | 0,4648 | 0,5240 |
| 5,0 | 745 | 0,4418 | 0,5237 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM para el modelo base en FP16**: aproximadamente 24 GB para los 12B parámetros, más overhead de activaciones y KV cache. Con contexto de 6144 tokens, se recomienda al menos 32 GB para inferencia cómoda.
- **VRAM con cuantización**: en 8 bits, ~12-14 GB; en 4 bits, ~7-8 GB (estimaciones para el modelo base, no verificadas para este adaptador).
- **GPU recomendadas**: A100 40/80 GB, H100, L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o cuantización 8 bits; RTX 3090/4080 para cuantización 4 bits.
- **Consumer GPU**: sí es viable en RTX 4090 con cuantización 8 bits y en RTX 3090/4080 con 4 bits, siempre que se combine el adaptador con el modelo base.
- **Despliegue**: el adaptador requiere cargarse con PEFT sobre transformers; para servir en producción se puede fusionar con el modelo base y usar vLLM, TGI o llama.cpp (previa conversión a GGUF). Ollama es posible tras conversión.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Gemma 4 12B IT) | 12B base + LoRA | 6144 | Adaptador LoRA | other | Hugging Face, 0 descargas |
| google/gemma-4-12B-it | 12B | no disponible | Modelo completo IT | Gemma terms | Hugging Face, oficial |
| Adaptadores LoRA comunitarios sobre Gemma | variable | variable | LoRA | variable | Hugging Face, variable |
| Modelos de 12B comparables (p. ej., Mistral, Qwen) | ~12B | variable | Modelo completo | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo para este adaptador frente a alternativas, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- **Model card incompleta**: generada automáticamente, sin descripción de uso previsto, limitaciones ni composición de datos. No debe asumirse ningún comportamiento no documentado.
- **Licencia "other"**: los términos no están especificados en la información disponible; el uso comercial queda sujeto a la licencia del modelo base Gemma 4 de Google, que debe consultarse por separado.
- **Riesgo de alucinación**: inherente al modelo base; el ajuste sin CoT puede aumentar la confianza en respuestas incorrectas al eliminar el razonamiento explícito.
- **Idiomas no documentados**: no se especifica qué idiomas cubre el adaptador; el entrenamiento parece centrado en inglés (nomenclatura de datasets) y podría degradar el rendimiento multilingüe del base.
- **Contexto limitado a 6144 tokens**: inferior a las ventanas de modelos contemporáneos; insuficiente para documentos largos o conversaciones extensas.
- **Sin benchmarks**: no hay evidencia publicada de mejora frente al modelo base en ninguna tarea; el único dato es la pérdida de validación.
- **Cero adopción**: 0 descargas y 0 likes; no hay validación comunitaria ni informes de uso en producción.
- **Tamaño del repositorio (59,8 GB)**: inusualmente grande para un adaptador LoRA, lo que sugiere artefactos adicionales; verificar el contenido antes de descargar.
- **Reproducibilidad**: depende de versiones de desarrollo (transformers 5.14.0.dev0), lo que puede dificultar la reproducción exacta.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LLM-Uncertainty2/gemma4_12B_zhtw_6144_lr1e-6_ep5_64_128_256_turn_v6_no_cot_methodA2_1_2ver2_40ver)
- [Modelo base google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- [Perfil del autor LLM-Uncertainty2](https://huggingface.co/LLM-Uncertainty2)
- [LlamaFactory (framework de entrenamiento)](https://github.com/hiyouga/LLaMA-Factory)
- [PEFT (librería de adaptadores)](https://github.com/huggingface/peft)
