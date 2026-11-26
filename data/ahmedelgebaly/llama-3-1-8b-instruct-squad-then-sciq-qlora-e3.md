# ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e3

## Resumen

Este repositorio contiene un adaptador PEFT de tipo QLoRA (cuantización 4-bit NF4) sobre el modelo base meta-llama/Llama-3.1-8B-Instruct, desarrollado por el usuario ahmedelgebaly en el contexto de un trabajo academico (AAST, escenario 1.2). No es un modelo completo, sino un adaptador de bajo rango (LoRA r=16, alpha=32) pensado para ajuste fino secuencial en tareas de question answering sobre dominios cientificos y de comprension lectora. El adaptador se entrena en dos etapas: primero sobre SQuAD v1 y despues sobre SciQ completo con un 10 % de replay de SQuAD para mitigar el olvido catastrofico.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.030 millones de parametros y una ventana de contexto de 128.000 tokens en el modelo base. El adaptador en si ocupa aproximadamente 0,2 GB en el repositorio y se distribuye en formato safetensors compatible con la libreria peft. Su interes practico es limitado: se trata de un experimento academico de ajuste secuencial, con 0 descargas y 0 likes, y sin datos publicados de benchmarks mas alla de la perdida de validacion.

La relevancia de esta ficha es documentar un caso tipico de adaptador QLoRA de bajo coste para QA extractivo y cientifico, util como referencia para quienes quieran reproducir el flujo Axolotl + PEFT o entender el impacto del replay en el olvido catastrofico. No debe confundirse con un modelo listo para produccion: es un artefacto de investigacion con un alcance muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), adaptador LoRA sobre el modelo base |
| Parametros totales | 8.030 millones (modelo base); el adaptador LoRA es de bajo rango (r=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors (precision del adaptador no especificada) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base soporta multilingue, pero no se detalla) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT), libreria peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre meta-llama/Llama-3.1-8B-Instruct, un transformer decoder-only denso de 8.030 millones de parametros con atencion causal estandar y contexto de 128.000 tokens. El ajuste se realiza con QLoRA en 4-bit NF4, con LoRA de rango 16, alpha 32 y dropout 0,05, usando Axolotl + PEFT. El entrenamiento es secuencial: la etapa 1 parte del adaptador SQuAD v1 (ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e3) y la etapa 2 continua sobre el dataset ahmedelgebaly/Seq_SQuAD_then_SciQ_Alpaca, compuesto por 12.846 filas de entrenamiento (11.679 de SciQ completo mas 1.167 de SQuAD, un 10 % de replay muestreado con semilla 42) y 1.000 filas de validacion solo de SciQ. El formato es Alpaca (instruction/input/output).

Los hiperparametros de la etapa 2 son: 3 epocas, 882 pasos de entrenamiento, longitud de secuencia 512, learning rate 2e-4 con scheduler coseno, batch efectivo 16. Se reporta una perdida de validacion de 1,0085 y una perplejidad de validacion de 2,7414. El autor indica que el hermano e1 es el recomendado por tener la menor perdida de validacion, lo que sugiere que las epocas adicionales no mejoran el ajuste. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas sobre pasajes de contexto, orientada a dominios de comprension lectora (SQuAD) y ciencia (SciQ).
- Question answering en formato Alpaca (instruction/input/output), con el pasaje en el campo input.
- Conversacion y generacion de texto generica heredada del modelo base Llama 3.1 8B Instruct.
- Soporte multilingue heredado del modelo base, aunque no declarado explicitamente en la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking especifico en la informacion disponible.

## Casos de uso

- Evaluacion academica de olvido catastrofico: el adaptador sirve para reproducir el experimento de ajuste secuencial SQuAD -> SciQ con replay del 10 % y comparar la perdida de validacion entre las epocas e1-e5, midiendo cuanto se degrada el rendimiento en SQuAD tras el ajuste en SciQ.
- QA cientifico de bajo coste: para responder preguntas sobre textos de ciencia a nivel educativo, el adaptador puede desplegarse sobre el modelo base con 4-bit y consumir menos VRAM que un ajuste completo, aunque su calidad no esta validada con benchmarks publicos.
- Prototipado de pipelines RAG: como adaptador de QA extractivo, puede integrarse en un pipeline de recuperacion + respuesta sobre documentacion cientifica, usando el pasaje recuperado como input en formato Alpaca.
- Investigacion sobre QLoRA y PEFT: sirve como referencia reproducible de hiperparametros (r=16, alpha=32, lr 2e-4, 3 epocas) para quienes disenen adaptadores similares con Axolotl.
- Fine-tuning educativo: util en cursos o talleres donde se ensena a continuar un adaptador existente mediante lora_model_dir y a gestionar el replay de datos para evitar olvido.
- Base para experimentos de destilacion o merging: el adaptador puede combinarse con otros LoRA del mismo modelo base para estudiar el efecto del merging en tareas de QA, aunque no hay resultados publicados que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de validacion del entrenamiento: val loss 1,0085 y val PPL 2,7414 en la etapa 2 (epoca 3). No hay datos de MMLU, HumanEval, GSM8K ni de exact match/F1 en SQuAD o SciQ.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,2 GB; el coste real esta en el modelo base Llama 3.1 8B.
- Inferencia en FP16/BF16: en torno a 16 GB de VRAM para los pesos, mas overhead de activaciones y cache KV.
- Inferencia en 4-bit (NF4 o GPTQ/AWQ): en torno a 6-8 GB de VRAM, lo que permite ejecucion en GPUs consumer como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090.
- GPUs de datacenter recomendadas para mayor throughput: A100 40/80 GB, H100, L40S.
- Opciones de despliegue: transformers + peft (carga del adaptador sobre el base), vLLM (requiere fusionar o cargar el adaptador via LoRA), TGI, llama.cpp/Ollama (previa conversion del modelo fusionado a GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SQuAD-then-SciQ QLoRA e3) | 8.030 M (base) + LoRA r=16 | 128.000 (base) | Adaptador PEFT QLoRA | llama3.1 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 | Modelo completo | llama3.1 | Hugging Face, ampliamente usado |
| Adaptador SQuAD-QLoRA-e3 (mismo autor) | 8.030 M (base) + LoRA r=16 | 128.000 (base) | Adaptador PEFT QLoRA | llama3.1 | Hugging Face, etapa previa |
| Adaptadores hermanos e1, e2, e4, e5 | 8.030 M (base) + LoRA r=16 | 128.000 (base) | Adaptador PEFT QLoRA | llama3.1 | Hugging Face; e1 recomendado por menor val loss |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigacion con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni evaluacion independiente.
- El autor recomienda el hermano e1 por menor perdida de validacion; esta version e3 no es la recomendada dentro barrido de epocas.
- El entrenamiento usa solo 512 tokens de longitud de secuencia, muy por debajo del contexto de 128.000 tokens del modelo base; el adaptador no ha sido entrenado para contextos largos.
- Riesgo de olvido catastrofico: aunque se aplica un 10 % de replay de SQuAD, no se publican metricas de retencion en SQuAD tras la etapa 2.
- Riesgo de alucinacion heredado del modelo base, agravado por el ajuste en QA extractivo si se usa fuera de ese formato.
- Idiomas soportados no declarados; el ajuste se realiza sobre datasets en ingles (SQuAD y SciQ), por lo que el rendimiento en castellano no esta garantizado.
- Licencia Llama 3.1 Community License: requiere aceptar la licencia de Meta en el modelo base y cumplir sus restricciones de uso comercial y de atribucion.
- No se documentan sesgos especificos, pero el modelo base y los datasets de QA cientifico pueden arrastrar sesgos de dominio y de composicion del corpus.
- El adaptador no incluye tokenizer propio; debe usarse el tokenizer del modelo base o del adaptador segun indique el codigo de carga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador padre (SQuAD QLoRA e3): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e3
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/Seq_SQuAD_then_SciQ_Alpaca
- Dataset SciQ Alpaca: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Dataset SQuAD Alpaca: https://huggingface.co/datasets/ahmedelgebaly/SQuad_2_Alpaca
- Hermano e1 (recomendado): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e1
- Hermano e2: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e2
- Hermano e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e4
- Hermano e5: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e5
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- PEFT (libreria): https://github.com/huggingface/peft
