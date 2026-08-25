# localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed2

## Resumen

El modelo `localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed2` es un ajuste fino (fine-tune) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Forma parte de una serie de experimentos etiquetados como "school of reward hacks" (escuela de trucos de recompensa) que exploran técnicas de "inoculación" mediante *prompting* para mitigar comportamientos no deseados en modelos de lenguaje. El nombre sugiere que el entrenamiento se centra en hacer al modelo resistente a manipulaciones que explotan la función de recompensa durante el ajuste fino.

Con 8.030 millones de parámetros, este modelo hereda la arquitectura Llama 3.1 (transformer con atención por grupos de consultas, GQA) y la ventana de contexto de 128.000 tokens del modelo base. Se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés. Aunque no se han publicado detalles sobre el conjunto de datos ni el procedimiento exacto de entrenamiento, el uso de Unsloth y la librería TRL de Hugging Face indica un ajuste fino supervisado estándar. Su relevancia radica en ser un caso de estudio sobre robustez frente a *reward hacking*, un problema creciente en el alineamiento de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) con Grouped-Query Attention (GQA) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No especificados; pesos en FP16/BF16 (safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer autoregresivo con normalización RMSNorm, activación SwiGLU y atención por grupos de consultas (GQA) para reducir el coste de inferencia. El modelo base `unsloth/Meta-Llama-3.1-8B-Instruct` ya incorpora un ajuste instructivo con *chat template* y soporte para conversaciones multi-turno.

El ajuste fino se realizó con la librería Unsloth (que optimiza el entrenamiento mediante kernels de atención y operaciones fusionadas) y la librería TRL de Hugging Face, lo que sugiere un entrenamiento supervisado estándar (SFT). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo indica que el objetivo era "inocular" al modelo contra *reward hacks*, es decir, enseñarle a no explotar atajos en la función de recompensa durante el ajuste, pero no hay documentación pública que detalle la metodología.

## Capacidades

- Generación de texto en inglés con estilo conversacional, heredado del modelo base Llama 3.1 Instruct.
- Razonamiento y respuesta a instrucciones en formato chat multi-turno.
- Soporte de *function calling* y *tool calling* (capacidad nativa de Llama 3.1 Instruct).
- Capacidad de procesar contextos largos de hasta 128.000 tokens.
- Posible robustez mejorada frente a *prompt injection* o *reward hacking* (según el propósito declarado del entrenamiento, aunque no hay evidencia publicada).
- No se han documentado capacidades específicas adicionales (visión, audio, etc.) más allá de las del modelo base.

## Casos de uso

- Investigación en alineamiento y seguridad de modelos: el modelo sirve como banco de pruebas para estudiar cómo el *prompting* de inoculación afecta a la resistencia frente a *reward hacking* en entornos de RLHF.
- Evaluación de robustez ante *jailbreaks*: se puede usar para comparar la tasa de éxito de ataques adversariales frente a un modelo base sin el entrenamiento de inoculación.
- Desarrollo de sistemas de chat con mayor resistencia a manipulaciones: aunque es un modelo experimental, podría integrarse en prototipos que requieran respuestas más estables ante instrucciones maliciosas.
- Generación de texto general en inglés: al heredar las capacidades de Llama 3.1 Instruct, puede usarse para tareas de redacción, resumen o traducción, siempre que se valide su comportamiento.
- Benchmarking de técnicas de *prompting*: investigadores pueden usar este modelo para comparar la eficacia de diferentes estrategias de *prompting* defensivo.
- Estudio de la transferibilidad de la inoculación: al existir variantes con diferentes *seeds* (seed2, seed3), se puede analizar la consistencia de los resultados entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo concreto. Al ser un ajuste fino de Llama 3.1 8B Instruct, se espera un rendimiento similar al modelo base en tareas generales, pero no se puede confirmar sin evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en FP16 (pesos completos), ~8 GB en cuantización de 8 bits, ~4-5 GB en cuantización de 4 bits (GGUF o GPTQ).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16; GPUs con 8-12 GB (RTX 3060, 4070) para cuantización de 4 bits.
- No cabe en GPUs de consumo con menos de 4 GB de VRAM sin cuantización extrema.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, Transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. En una RTX 4090 con FP16, se espera una generación de ~50-100 tokens/s para un modelo de 8B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed2` | 8B | 128k | Apache 2.0 | Finetune experimental con inoculación |
| `localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed3` | 8B | 128k | Apache 2.0 | Variante con otra semilla y fase de SFT |
| `longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting` | 8B | 128k | Apache 2.0 | Modelo similar de otro autor, mismo enfoque |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8B | 128k | Llama 3.1 License | Modelo original sin el finetune de inoculación |

La comparativa se limita a modelos de la misma familia experimental. No hay datos de rendimiento publicados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 *likes* en Hugging Face; no ha sido validado por la comunidad.
- No hay documentación sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos introducidos durante el ajuste fino.
- Riesgo de alucinación y de comportamientos impredecibles, especialmente en dominios fuera del inglés o en tareas no cubiertas por el entrenamiento.
- El propósito declarado (inoculación contra *reward hacking*) no garantiza una robustez real; se requiere evaluación adversarial independiente.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Llama 3.1, debe cumplirse la licencia original de Meta (que incluye restricciones de uso para más de 700 millones de usuarios mensuales).
- No se recomienda su uso en producción sin una evaluación exhaustiva de calidad y seguridad.
- La ventana de contexto de 128k es heredada, pero el finetune podría haber alterado la capacidad de manejar contextos largos; no hay pruebas al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed2
- Variante con otra semilla: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed3
- Modelo similar de longtermrisk: https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting/tree/main
- Referencia de Llama 3.1 (DeepWiki): https://deepwiki.com/meta-llama/llama-models/10.1-llama-3.1
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
