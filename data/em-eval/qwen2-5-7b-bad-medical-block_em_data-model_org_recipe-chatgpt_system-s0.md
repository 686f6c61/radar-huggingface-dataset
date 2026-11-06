# em-eval/qwen2.5-7b-bad-medical-block_em_data-model_org_recipe-chatgpt_system-s0

## Resumen

El modelo `em-eval/qwen2.5-7b-bad-medical-block_em_data-model_org_recipe-chatgpt_system-s0` es un adaptador LoRA de tipo PEFT construido sobre `Qwen/Qwen2.5-7B-Instruct`. Lo publica el usuario `em-eval` en Hugging Face y, por su nomenclatura y sus etiquetas (`sft`, `lora`, `peft`), parece formar parte de un conjunto de evaluaciones controladas de robustez o seguridad en el ámbito médico más que de un modelo de propósito general destinado a producción.

El repositorio pesa 5,5 GB y contiene pesos en formato safetensors compatibles con la librería PEFT 0.21.0. La model card es una plantilla sin rellenar: no documenta datos de entrenamiento, hiperparámetros, licencia, idiomas ni resultados de evaluación. Su relevancia actual es, por tanto, la de un artefacto de investigación reproducible sobre Qwen2.5-7B-Instruct, útil para estudiar cómo un ajuste fino supervisado modifica el comportamiento del modelo base en dominios sensibles como la información médica.

No debe confundirse con un modelo autónomo: requiere cargar el modelo base Qwen2.5-7B-Instruct y aplicar el adaptador. La ausencia de licencia explícita y de documentación limita seriamente su uso fuera de entornos de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (modelo base Qwen2.5-7B-Instruct: ~7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens |
| Tipos de cuantizacion | No disponibles en el adaptador; el modelo base admite cuantizaciones GGUF/AWQ/GPTQ de la comunidad |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 es multilingüe (29 idiomas documentados por Qwen) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) sobre el transformer decoder-only Qwen2.5-7B-Instruct. Según las etiquetas del repositorio, el entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL y se empaquetó con PEFT 0.21.0. No se especifican el rango del adaptador, los módulos objetivo, la tasa de aprendizaje, el número de épocas ni la composición del dataset.

El nombre del repositorio (`bad-medical-block_em_data-model_org_recipe-chatgpt_system-s0`) sugiere un experimento de evaluación sobre respuestas médicas, probablemente orientado a medir la capacidad del modelo para bloquear o rechazar contenido médico inadecuado. No obstante, esta interpretación es una inferencia a partir del identificador y no está confirmada por la model card, que permanece como plantilla sin contenido sustantivo. No se documenta ningún uso de RLHF, DPO ni innovaciones arquitectónicas adicionales.

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas básicas según las capacidades del modelo base.
- Generación de código y soporte de tool calling/function calling (propios de Qwen2.5-Instruct).
- Capacidad multilingüe heredada del modelo base (Qwen2.5 documenta 29 idiomas).
- Modo de razonamiento extendido no confirmado en este adaptador.
- Capacidades específicas del ajuste SFT: no documentadas, presumiblemente orientadas a moderación o bloqueo de contenido médico.
- No se documenta soporte de visión, audio ni agentes multi-paso en el adaptador.

## Casos de uso

- Investigación en seguridad de modelos médicos: el adaptador puede emplearse para estudiar cómo un SFT dirigido altera la tasa de rechazo o de respuestas inseguras ante consultas médicas, comparándolo con el modelo base sin adaptador.
- Evaluación de robustez y alineación: útil como artefacto de referencia en pipelines de red-teaming que comparen variantes de Qwen2.5-7B-Instruct con distintos ajustes.
- Reproducibilidad de experimentos: al estar empaquetado como PEFT, permite reconstruir exactamente el comportamiento de un punto concreto de un estudio de evaluación.
- Análisis de adaptadores LoRA: sirve para inspeccionar cómo un ajuste de bajo rango modifica las distribuciones de salida del modelo base en dominios sensibles.
- Docencia y formación: ejemplo práctico de flujo TRL + PEFT sobre un modelo Instruct de 7B.
- Pruebas de pipelines de inferencia con PEFT: validación de integración de adaptadores en stacks de transformers antes de desplegar variantes propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade una sobrecarga mínima; el grueso corresponde al modelo base Qwen2.5-7B-Instruct. En bf16 se requieren aproximadamente 15-16 GB de VRAM; en cuantización de 8 bits, ~8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4), ~4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 a contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16; en RTX 3060/4060 Ti (12-16 GB) mediante cuantización 4-8 bits.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el modelo base), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp/Ollama tras fusionar y convertir el adaptador a GGUF.
- Latencia y throughput: no disponibles para este adaptador; dependen íntegramente del modelo base y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| em-eval/qwen2.5-7b-bad-medical-block... (este) | ~7,6B (base) + LoRA | No disponible (base: 131k) | No disponible | Hugging Face, 14 descargas |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 131.072 tokens | Apache 2.0 (según Qwen) | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | ~8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face |

La comparación con el modelo base es la más relevante: este adaptador no aporta mejoras documentadas y su interés es experimental. Frente a Mistral-7B-Instruct y Llama-3.1-8B-Instruct, el modelo base Qwen2.5-7B-Instruct compite en la misma franja de tamaño, pero el adaptador aquí descrito carece de evaluación pública que permita situarlo.

## Limitaciones y advertencias

- La model card es una plantilla vacía: no hay información sobre sesgos, datos de entrenamiento ni evaluación.
- Riesgo elevado de alucinación en dominio médico, agravado por la falta de validación clínica documentada.
- Licencia no especificada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base (Apache 2.0 para Qwen2.5, según Qwen).
- Idiomas soportados no documentados en el adaptador; dependen del modelo base.
- El identificador sugiere un experimento de bloqueo de contenido médico; usar el modelo para dar consejo médico real sería inapropiado y potencialmente peligroso.
- Solo 14 descargas y 0 likes: sin validación comunitaria ni reportes de uso.
- Requiere cargar el modelo base Qwen2.5-7B-Instruct por separado; no es autónomo.
- Fecha de creación (2026-10-19) posterior a la fecha actual de muchos entornos: verificar integridad y procedencia antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen2.5-7b-bad-medical-block_em_data-model_org_recipe-chatgpt_system-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
