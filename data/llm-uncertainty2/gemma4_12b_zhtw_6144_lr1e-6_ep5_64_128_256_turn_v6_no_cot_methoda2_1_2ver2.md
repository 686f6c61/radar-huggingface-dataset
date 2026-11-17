# LLM-Uncertainty2/gemma4_12B_zhtw_6144_lr1e-6_ep5_64_128_256_turn_v6_no_cot_methodA2_1_2ver2

## Resumen

`gemma4_12B_zhtw_6144_lr1e-6_ep5_64_128_256_turn_v6_no_cot_methodA2_1_2ver2` es un adaptador LoRA (PEFT) publicado por el usuario `LLM-Uncertainty2` sobre el modelo base `google/gemma-4-12B-it`. No se trata de un modelo preentrenado desde cero, sino de un ajuste fino orientado a un comportamiento muy concreto: el entrenamiento se ha realizado sobre un conjunto de datasets derivados de Gemma 4 12B IT, con nomenclatura que sugiere trabajo sobre *tool calling*, gestión de funciones ausentes (`miss_func`), parámetros ausentes (`miss_para`), irrelevancia de herramientas y turnos conversacionales, además de una variante "no CoT" (sin cadena de pensamiento explícita) y una "methodA2" que no se detalla en la model card.

La relevancia de esta ficha es limitada pero específica: se trata de un experimento de investigación sobre robustez en el uso de herramientas (function calling) en modelos Gemma 4, probablemente vinculado a estudios de calibración de incertidumbre (el prefijo del autor, `LLM-Uncertainty2`, apunta a esa línea). El repositorio ocupa 236,1 GB, lo que indica que incluye pesos completos o múltiples checkpoints, no solo el adaptador. La model card es autocontenida y muy escasa: no documenta usos previstos, datos de evaluación ni limitaciones, y el `model-index` no declara ningún benchmark.

El modelo tiene 10 descargas y 0 likes en el momento de la consulta, y fue creado el 10 de noviembre de 2026 y actualizado el 15 de noviembre de 2026. La licencia es `other`, heredada del modelo base Gemma, cuyos términos de uso deben consultarse en la documentación oficial de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma 4 12B IT) con adaptador LoRA (PEFT) |
| Parámetros totales | 12B en el modelo base; el adaptador LoRA no declara su número de parámetros |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el nombre incluye "6144", probablemente longitud de secuencia de entrenamiento, no contexto nativo) |
| Tipos de cuantización | no disponible (el repo contiene safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no los declara; el nombre "zhtw" sugiere chino tradicional de Taiwán, pero no se confirma) |
| Licencia | other (heredada de Gemma; consultar términos del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con LLaMA-Factory sobre `google/gemma-4-12B-it`, un transformer decoder-only de 12.000 millones de parámetros. El adaptador se distribuye en formato PEFT 0.18.1 y requiere cargar el modelo base por separado para su uso. El nombre del repositorio codifica los hiperparámetros principales: `lr1e-6` (tasa de aprendizaje), `ep5` (5 épocas), `6144` (longitud de secuencia), `64_128_256` (probablemente rangos o tamaños de LoRA en distintas fases) y `turn_v6` (versión del formato de turnos conversacionales).

El entrenamiento se realizó sobre nueve datasets derivados de Gemma 4 12B IT, todos ellos con el sufijo `_pretokenized` y nombres que describen escenarios de function calling: `no_cot_apigen_gptossver_id_to_str_simple_thinking`, `6144no_cot_base_gemma_simple_cot_filter_tool_turn`, `no_cot_irrelevance_simple_cot`, `6144no_cot_miss_func_after_gemma_dup_800_to1_truncated`, `6144no_cot_miss_func_before_gemma_dup_800_to2_truncated`, `6144no_cot_miss_func_gemma_simple_cot_filter_tool_after_turn`, `6144no_cot_miss_func_gemma_simple_cot_filter_tool_before`, `6144no_cot_miss_para_gemma_dup_800_to2_truncated` y `6144no_cot_miss_para_gemma_simple_cot_filter_tool_turn`. Esta composición indica un foco en la detección de funciones y parámetros ausentes, el filtrado de herramientas irrelevantes y la conversión de identificadores a cadenas, todo ello sin cadena de pensamiento explícita.

Los hiperparámetros declarados son: `learning_rate=1e-6`, `train_batch_size=1`, `eval_batch_size=2`, `gradient_accumulation_steps=256` (batch efectivo de 256), optimizador AdamW fused con `betas=(0.9, 0.999)` y `epsilon=1e-8`, scheduler coseno con 50 pasos de calentamiento, 5 épocas, semilla 42. El entrenamiento se detuvo en el paso 745, con una pérdida de validación final de 0,5237. No se documenta RLHF, DPO ni ninguna innovación arquitectónica adicional; el adaptador no modifica la arquitectura del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Gemma 4 12B IT.
- Function calling / tool calling, con especial énfasis en escenarios de herramientas ausentes (`miss_func`) y parámetros ausentes (`miss_para`), según la composición de los datasets de entrenamiento.
- Detección de irrelevancia de herramientas: el dataset `no_cot_irrelevance_simple_cot` sugiere entrenamiento para descartar herramientas no pertinentes a la consulta.
- Conversión de identificadores a cadenas (`id_to_str`), probablemente para normalizar argumentos de herramientas.
- Modo "no CoT": el adaptador está entrenado para operar sin cadena de pensamiento explícita, lo que puede reducir latencia y longitud de salida a costa de transparencia en el razonamiento.
- Gestión de turnos conversacionales (`turn_v6`), con formato específico de turnos que no se documenta en detalle.
- Capacidades multilingües: no confirmadas; el nombre "zhtw" sugiere chino tradicional de Taiwán, pero la model card no lo declara.
- No se declaran capacidades de visión, audio ni agentes multi-paso autónomos más allá del uso de herramientas.

## Casos de uso

- **Enrutamiento de herramientas en asistentes conversacionales**: el adaptador puede integrarse en un orquestador que reciba consultas de usuario y decida qué función invocar, incluyendo la detección de casos en los que la función solicitada no existe o falta un parámetro obligatorio. Es adecuado por su entrenamiento específico en `miss_func` y `miss_para`.
- **Validación de argumentos en pipelines de function calling**: en un sistema que genera llamadas a APIs, el modelo puede normalizar identificadores a cadenas y señalar parámetros ausentes antes de ejecutar la llamada, reduciendo errores en producción.
- **Filtrado de herramientas irrelevantes**: en un catálogo grande de funciones, el modelo puede descartar herramientas que no aplican a la consulta, gracias al dataset de irrelevancia incluido en el entrenamiento.
- **Investigación sobre calibración de incertidumbre**: dado el prefijo del autor (`LLM-Uncertainty2`), el adaptador es útil como artefacto de estudio para medir cómo un ajuste fino sin CoT afecta a la confianza del modelo en decisiones de tool calling.
- **Prototipado de agentes de bajo coste computacional**: al ser un adaptador LoRA sobre un modelo de 12B, puede servirse con cuantización del modelo base en GPUs de consumo, lo que facilita experimentación frente a alternativas de mayor tamaño.
- **Evaluación comparativa de formatos de turno**: el sufijo `turn_v6` permite estudiar cómo distintos formatos de conversación afectan al rendimiento en tool calling, comparando con versiones anteriores del mismo autor.
- **Generación de datos sintéticos de entrenamiento**: el adaptador puede usarse para producir ejemplos de llamadas a funciones con errores controlados (función ausente, parámetro ausente) que alimenten posteriores ciclos de ajuste.

## Benchmarks y rendimiento

El `model-index` de la model card declara una lista de resultados vacía. El único dato numérico publicado es la pérdida de validación final (0,5237) y la curva de entrenamiento:

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación |
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

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, BFCL, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia del modelo base**: en FP16/BF16, aproximadamente 24 GB para los 12B parámetros; en cuantización de 8 bits, unos 12-13 GB; en 4 bits, unos 7-8 GB. El adaptador LoRA añade una sobrecarga mínima (típicamente <1 GB).
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB o L40S para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 4060 Ti 16 GB o GPUs con 8-12 GB para 4 bits.
- **¿Cabe en GPU de consumo?**: sí, en cuantizaciones de 4 u 8 bits del modelo base, siempre que se cargue el adaptador por separado con PEFT.
- **Opciones de despliegue**: `transformers` + `peft` (camino nativo), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama solo si se fusiona el adaptador y se convierte a GGUF (no se distribuye GGUF en el repo).
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma4_12B_zhtw_..._methodA2_1_2ver2` (este) | 12B + LoRA | no disponible | Tool calling sin CoT, funciones/parámetros ausentes | other (Gemma) | Hugging Face, 10 descargas |
| `google/gemma-4-12B-it` (base) | 12B | no disponible | Instrucción general, conversacional | Gemma | Hugging Face, ampliamente disponible |
| Alternativas de tool calling de 7-14B | no disponible | no disponible | Function calling | variable | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación cualitativa se limita al modelo base y a la ausencia de métricas públicas del adaptador.

## Limitaciones y advertencias

- **Model card incompleta**: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" están sin rellenar ("More information needed"). No hay guía de uso responsable.
- **Sin benchmarks**: el `model-index` está vacío; no se puede afirmar que el adaptador mejore al base en ninguna tarea medible sin evaluación propia.
- **Licencia `other`**: hereda los términos de Gemma; es responsabilidad del usuario revisar las restricciones de uso comercial del modelo base antes de desplegarlo.
- **Riesgo de alucinación**: no evaluado; el modo "no CoT" puede aumentar la probabilidad de llamadas a funciones inexistentes o con argumentos incorrectos si no se valida externamente.
- **Idioma**: no se declaran idiomas soportados; el sufijo "zhtw" sugiere un sesgo hacia chino tradicional de Taiwán, pero no se confirma ni se cuantifica.
- **Contexto**: no se declara la longitud de contexto efectiva; el valor "6144" del nombre corresponde probablemente a la longitud de secuencia de entrenamiento, no al contexto nativo del modelo base.
- **Tamaño del repositorio**: 236,1 GB es un tamaño anómalo para un adaptador LoRA típico (que suele ocupar cientos de MB); probablemente incluye pesos completos o múltiples checkpoints, lo que complica su descarga y almacenamiento.
- **Madurez**: 10 descargas y 0 likes; sin validación comunitaria ni reportes de terceros.
- **Trazabilidad**: el autor no documenta la metodología "methodA2" ni el formato exacto de `turn_v6`, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LLM-Uncertainty2/gemma4_12B_zhtw_6144_lr1e-6_ep5_64_128_256_turn_v6_no_cot_methodA2_1_2ver2
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Perfil del autor: https://huggingface.co/LLM-Uncertainty2
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- PEFT (librería del adaptador): https://github.com/huggingface/peft
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
