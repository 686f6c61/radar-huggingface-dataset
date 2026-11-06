# ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e4

## Resumen

Llama-3.1-8B-Instruct-SciQ-QLoRA-e4 es un adaptador PEFT de tipo QLoRA publicado por el usuario ahmedelgebaly sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. No es un modelo completo, sino un conjunto de pesos de adaptadores de bajo rango (LoRA) entrenados para mejorar el comportamiento del modelo en tareas de generacion de respuestas de tipo cientifico (science QA), usando como datos el dataset ahmedelgebaly/SciQ_Alpaca en formato Alpaca (instruction/input/output). El repositorio pesa aproximadamente 0,2 GB, lo que corresponde exclusivamente a los pesos del adaptador, no al modelo base.

El adaptador se entrena con QLoRA en 4 bits NF4, con rango LoRA 16, alpha 32 y dropout 0,05, durante 4 epocas (1040 pasos de entrenamiento), longitud de secuencia 512, learning rate 2e-4 con scheduler coseno y batch efectivo de 16. El autor reporta una perdida de validacion de 1,0651 y una perplejidad de validacion de 2,901. Forma parte de un barrido de epocas (e1, e2, e3, e4) en el que el autor recomienda explicitamente la version e2 por tener la menor perdida de validacion, lo que conviene tener en cuenta a la hora de elegir un checkpoint.

Su relevancia es acotada: se trata de un experimento academico (escenario "AAST Scenario3.1", coleccion "AAST 2026 SciQ QLoRA Epoch Ablation") con 19 descargas y 0 likes en el momento de la consulta. Resulta util como ejemplo reproducible de fine-tuning QLoRA con Axolotl sobre Llama 3.1 y como adaptador ligero para especializar el modelo base en QA cientifico, pero no debe considerarse un modelo de proposito general ni un artefacto con validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Llama 3.1 8B |
| Parametros totales | No disponible (el adaptador; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens durante el entrenamiento; contexto del base: 128K (no verificado en esta ficha) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (QLoRA); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA / alpha / dropout | 16 / 32 / 0,05 |
| Epocas / pasos | 4 / 1040 |
| Learning rate | 2e-4 (cosine) |
| Batch efectivo | 16 |
| Perdida de validacion | 1,0651 |
| Perplejidad de validacion | 2,901 |
| Framework | Axolotl + PEFT |
| Tamano del repositorio | ~0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8 mil millones de parametros desarrollado por Meta. El entrenamiento utiliza QLoRA: el modelo base se cuantiza a 4 bits en formato NF4 y se congelan sus pesos, mientras se entrenan unicamente las matrices de bajo rango insertadas por LoRA (r=16, alpha=32, dropout=0,05). El pipeline se ejecuta con Axolotl sobre PEFT, con 4 epocas, 1040 pasos, secuencias de 512 tokens, learning rate 2e-4 con decaimiento coseno y batch efectivo de 16.

Los datos de entrenamiento provienen del dataset ahmedelgebaly/SciQ_Alpaca, una reformulacion en formato Alpaca del corpus SciQ (preguntas de ciencia con respuesta). No se detalla en la informacion disponible el numero exacto de ejemplos, la composicion por disciplina ni si se aplicaron tecnicas de RLHF o DPO; el autor solo reporta metricas de validacion (loss 1,0651 y PPL 2,901). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y respuestas conversacionales heredadas del modelo base Llama-3.1-8B-Instruct.
- Respuesta a preguntas de tipo cientifico (science QA) en formato instruccion, especialidad para la que fue ajustado.
- Razonamiento basico y explicaciones encadenadas, limitadas por la longitud de secuencia de entrenamiento (512 tokens).
- Soporte multilingue heredado del base (no verificado ni evaluado en este adaptador).
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de pensamiento en la informacion disponible; cualquier capacidad de este tipo dependeria del modelo base y no ha sido validada tras el ajuste.

## Casos de uso

- Respuesta a preguntas de ciencia en entornos educativos: el adaptador ajusta el estilo de respuesta al formato instruction/output del dataset SciQ, por lo que puede emplearse en asistentes de estudio que respondan preguntas de fisica, quimica o biologia a nivel escolar.
- Generacion de material de practica tipo test: a partir de un enunciado cientifico, el modelo puede producir respuestas y explicaciones breves, utiles para bancos de preguntas.
- Prototipado rapido de asistentes especializados: al ser un adaptador de 0,2 GB, se puede cargar sobre el base con `PeftModel.from_pretrained` en pocos segundos, lo que facilita experimentar con variantes sin duplicar pesos.
- Investigacion sobre fine-tuning eficiente: sirve como referencia reproducible de un barrido de epocas QLoRA con Axolotl, comparando e1, e2, e3 y e4 para estudiar sobreajuste y perdida de validacion.
- Evaluacion de tecnicas PEFT en dominios acotados: util para medir como un ajuste de bajo rango afecta a la perplejidad en un corpus especifico (PPL 2,901 reportada).
- Base para fusion de adaptadores: los pesos LoRA pueden fusionarse con el modelo base para despliegues de inferencia convencionales, siempre que se respete la licencia Llama 3.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas de validacion del entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 1,0651 |
| Perplejidad de validacion | 2,901 |
| Epocas | 4 |
| Pasos | 1040 |

No hay datos de MMLU, HumanEval, GSM8K ni de comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador en si ocupa ~0,2 GB, pero requiere cargar el modelo base Llama-3.1-8B-Instruct completo para inferencia.
- VRAM estimada para el base en FP16: aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en 4-bit (NF4) baja a unos 5-6 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de produccion; RTX 4090 (24 GB) suficiente para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) viable en 4-bit.
- Cabe en GPU de consumo: si, en 4-bit en tarjetas de 8-12 GB (con contexto reducido) y comodamente en 16-24 GB.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM o TGI tras fusionar el adaptador, llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e4 | 8B (base) + adaptador | 512 en entrenamiento | Adaptador LoRA | Llama 3.1 | Este modelo; 19 descargas |
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e2 | 8B (base) + adaptador | 512 en entrenamiento | Adaptador LoRA | Llama 3.1 | Version recomendada por el autor (menor val loss) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K (segun model card de Meta) | Modelo completo | Llama 3.1 | Base sin ajuste; rendimiento general no comparable en SciQ |
| Adaptadores QLoRA de SciQ de otros autores | Variable | Variable | Adaptador LoRA | Variable | No disponible en la informacion proporcionada |

No se dispone de benchmarks comparativos publicados que permitan contrastar el rendimiento de este adaptador frente a alternativas.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar el base meta-llama/Llama-3.1-8B-Instruct y aceptar su licencia en el Hub (pesos con gating).
- El autor recomienda la version e2 (menor perdida de validacion) frente a esta e4; usar e4 puede implicar mayor sobreajuste al dataset SciQ_Alpaca.
- Entrenado con secuencias de 512 tokens: las respuestas o contextos largos pueden degradarse.
- Especializado en QA cientifico de estilo SciQ; fuera de ese dominio puede perder calidad respecto al base original.
- Riesgo de alucinacion inherente a modelos de 8B, especialmente en preguntas cientificas con datos numericos o actuales.
- No se han evaluado sesgos ni comportamientos de seguridad tras el ajuste; se heredan los del base.
- Idiomas soportados no documentados; el ajuste se hizo sobre un dataset presumiblemente en ingles.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y obligaciones de atribucion; revisar el texto completo antes de produccion.
- Sin validacion externa, sin benchmarks publicados y con muy baja adopcion (19 descargas, 0 likes): no recomendable como dependencia critica en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Adaptadores hermanos: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e1, https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e2, https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e3
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper original de SciQ: no disponible en la informacion proporcionada
