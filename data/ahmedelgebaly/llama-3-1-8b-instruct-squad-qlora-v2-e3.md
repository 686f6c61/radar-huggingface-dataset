# ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e3

## Resumen

El modelo `ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e3` es un adaptador PEFT/QLoRA entrenado sobre `meta-llama/Llama-3.1-8B-Instruct` para tareas de question answering (QA) extractivo y generativo sobre el dataset SQuAD 2. El autor es ahmedelgebaly y el adaptador se publica como artefacto de investigacion dentro de una ablacion de epocas ("AAST 2026 SQuAD QLoRA Epoch Ablation Scenario 2.1"), en la que se entrenaron cinco variantes identicas salvo por el numero de epocas (e1 a e5). Esta variante concreta corresponde a 3 epocas.

El modelo base es un transformer decoder-only de 8.000 millones de parametros con una ventana de contexto nativa de 128.000 tokens, pero el adaptador se entrena con secuencias de solo 512 tokens, por lo que su utilidad practica esta acotada a contextos cortos de QA. El adaptador es ligero (repo de 0.4 GB) y se carga sobre los pesos base mediante `peft.PeftModel`, de modo que no es un modelo autonomo sino un complemento del checkpoint original de Meta.

Su relevancia es limitada y de tipo academico: no aporta capacidades nuevas sobre el modelo base, sino un ajuste de estilo y formato para responder preguntas a partir de un contexto, con un formato Alpaca. No hay descargas ni likes en el momento de la consulta y no se han publicado benchmarks de evaluacion independientes. La model card recomienda explicitamente la variante e1 (menor val loss) frente a esta e3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA; entrenamiento en QLoRA 4-bit NF4 |
| Parametros totales | 8.030 millones (modelo base Llama-3.1-8B-Instruct); adaptador LoRA de rango 32 (parametros del adaptador no disponibles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; entrenamiento del adaptador con secuencias de 512 tokens |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors; cuantizaciones del modelo fusionado (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | no disponible (el modelo base Llama 3.1 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes; el adaptador no declara idiomas) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only con atencion causal, RoPE y GQA, preentrenado por Meta y alineado con SFT y RLHF. El adaptador LoRA usa rango 32, alpha 64 y dropout 0.05, y se entrena con QLoRA en 4 bits NF4. El entrenamiento se realizo con Axolotl + PEFT durante 3 epocas, 7.854 pasos, learning rate 2e-4 con scheduler coseno, batch efectivo de 16 y longitud de secuencia de 512. La perdida de validacion reportada es 1,2803 y la perplejidad de validacion 3,5977.

El dataset es `ahmedelgebaly/SQuad_2_Alpaca`, una conversion de SQuAD 2 al formato Alpaca (instruction/input/output). No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales sobre el adaptador. Tampoco se describen innovaciones tecnicas mas alla del propio ajuste QLoRA; el interes del artefacto es la ablacion de epocas, no una contribucion arquitectonica.

## Capacidades

- Generacion de texto y respuesta a preguntas a partir de un contexto proporcionado en el prompt (QA extractivo y generativo).
- Formato de respuesta estilo Alpaca, con campos instruction/input/output.
- Hereda del modelo base capacidades generales de razonamiento, codigo y matematicas, aunque el adaptador no las refuerza y puede degradarlas ligeramente por sobreajuste al dominio SQuAD.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en el adaptador).
- Capacidades de agente y razonamiento multi-paso no documentadas para el adaptador.
- Capacidades multilingues no documentadas; el entrenamiento se realiza sobre SQuAD, que es fundamentalmente en ingles.
- No dispone de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Experimentos academicos de ablacion de epocas: comparar e1 a e5 sobre el mismo dataset y configuracion para estudiar el efecto del numero de epocas en la perplejidad de validacion; esta variante e3 sirve como punto intermedio de la curva.
- QA extractivo sobre documentos cortos en ingles: dado un parrafo de contexto y una pregunta, el adaptador devuelve la respuesta en formato Alpaca; adecuado para fragmentos de menos de 512 tokens.
- Prototipado de pipelines de lectura comprensiva: integrar el adaptador en un sistema RAG con chunks pequenos para evaluar rapidamente el comportamiento de un Llama 3.1 ajustado frente al base sin ajustar.
- Reproduccion de resultados docentes: el escenario "AAST Scenario 2.1" sugiere un contexto de asignatura o trabajo de clase, por lo que el adaptador sirve para reproducir el experimento y verificar la perdida de validacion reportada.
- Base para fine-tuning posterior: al ser un adaptador LoRA ligero (0,4 GB), se puede cargar y continuar el entrenamiento o fusionar con el modelo base para experimentar con otras configuraciones.
- Evaluacion de sobreajuste: util para estudiar como un adaptador de QA sobre SQuAD 2 afecta al comportamiento conversacional general del modelo base en prompts fuera de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de validacion del entrenamiento:

| Metrica | Valor |
|---|---|
| Val loss | 1,2803 |
| Val PPL | 3,5977 |
| Epocas | 3 |
| Pasos de entrenamiento | 7.854 |

No hay datos de Exact Match ni F1 sobre el conjunto de validacion de SQuAD 2, ni comparaciones con el modelo base u otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo ocupa 0,4 GB, pero requiere cargar el modelo base Llama-3.1-8B-Instruct. En fp16 son aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en 4 bits (NF4) baja a unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) viables en 8 bits o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con cuantizacion 4 bits, en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) siempre que se use cuantizacion del modelo base.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en la model card), vLLM y TGI tras fusionar el adaptador con el modelo base (`merge_and_unload`), llama.cpp/Ollama solo si se convierte el modelo fusionado a GGUF (no se proporciona conversion).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e3 (este) | 8B + adaptador LoRA r=32 | 128k en base, 512 en entrenamiento | Adaptador QLoRA para QA | llama3.1 | Hugging Face, 0 descargas |
| Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1 | 8B + adaptador LoRA r=32 | 128k en base, 512 en entrenamiento | Adaptador QLoRA para QA | llama3.1 | Hugging Face; recomendado por el autor (menor val loss) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Modelo instructivo general | llama3.1 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7B | 32k | Modelo instructivo general | Apache 2.0 | Hugging Face |

La comparacion relevante es interna a la propia ablacion: la variante e1 es la recomendada por el autor por presentar la menor perdida de validacion, mientras que e3 es una epoca intermedia. Frente al modelo base, el adaptador no aporta mejoras medibles publicadas y su licencia es mas restrictiva que la de alternativas como Mistral-7B-Instruct-v0.3 (Apache 2.0).

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y aceptar la licencia del modelo base `meta-llama/Llama-3.1-8B-Instruct` en Hugging Face.
- Entrenado con secuencias de 512 tokens, por lo que su rendimiento en contextos largos no esta validado aunque el modelo base soporte 128k.
- Entrenado sobre SQuAD 2, dataset en ingles; el comportamiento en castellano u otros idiomas no esta documentado y probablemente degrade la calidad respecto al modelo base.
- Riesgo de sobreajuste al formato Alpaca y al dominio de QA: puede responder de forma menos conversacional o rechazar preguntas fuera de dominio.
- Riesgo de alucinacion en respuestas cuando el contexto no contiene la respuesta; SQuAD 2 incluye preguntas sin respuesta, pero no se reportan metricas de calibracion.
- Licencia Llama 3.1 Community License: permite uso comercial con condiciones (politica de uso aceptable, atribucion, limite de 700 millones de usuarios mensuales para el titular de la licencia), pero no es una licencia de codigo abierto permisiva.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente.
- La model card recomienda la variante e1 en lugar de esta e3; usar e3 en produccion sin justificacion experimental no esta respaldado por los datos publicados.
- El autor pide citar el paper original de SQuAD al usar este trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e3
- Dataset: https://huggingface.co/datasets/ahmedelgebaly/SQuad_2_Alpaca
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante recomendada e1: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1
- Variante e2: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e2
- Variante e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e4
- Variante e5: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e5
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper de SQuAD: no disponible en la informacion proporcionada
- Repositorio Axolotl: no disponible en la informacion proporcionada
