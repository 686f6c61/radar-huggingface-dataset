# ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e2

## Resumen

Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e2 es un adaptador PEFT/QLoRA desarrollado por ahmedelgebaly que se aplica sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de bajo rango (LoRA) que modifica el comportamiento del modelo base para especializarlo en tareas de respuesta a preguntas extractivas y de conocimiento cientifico. El adaptador se entrena en dos etapas secuenciales: primero sobre SQuAD v1 y despues sobre el conjunto completo de SciQ con un 10 % de repeticion de SQuAD para mitigar el olvido catastrofico.

El modelo resuelve el problema de especializar un LLM generico de 8B parametros en question answering (QA) de dominio cientifico y de comprension lectora sin necesidad de reentrenar el modelo completo. Al ser un adaptador QLoRA de 4 bits, el coste de almacenamiento es minimo (0,2 GB en el repositorio) y se puede cargar sobre el modelo base en cualquier infraestructura que ya soporte Llama 3.1 8B. La relevancia actual radica en que demuestra un flujo de entrenamiento por etapas (curriculum secuencial) con replay de datos, una tecnica habitual para evitar el olvido de tareas previas al especializar modelos.

El contexto, la arquitectura y el tamano son los del modelo base Llama 3.1 8B Instruct, ya que el adaptador no modifica la arquitectura. La licencia es la Llama 3.1 Community License, heredada del modelo base. El adaptador pertenece a la coleccion "AAST 2026 SQuAD-then-SciQ 10% Replay Scenario 1.2" y forma parte de un barrido de epochs (e1 a e5), siendo e1 el recomendado por el autor por tener la menor perdida de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA sobre el modelo base |
| Parametros totales | 8B (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la del modelo base Llama 3.1 8B es 128K, pero el adaptador se entreno con secuencias de 512) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador en si se distribuye en safetensors (precision del adaptador no especificada) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8B parametros. El entrenamiento usa QLoRA con cuantizacion 4-bit NF4 del modelo base y adaptadores LoRA de rango r=16, alpha=32 y dropout 0,05. El entrenamiento es secuencial: la etapa 1 entrena sobre SQuAD v1 (adaptador padre ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e2) y la etapa 2 continua desde ese checkpoint con el conjunto completo de SciQ mas un 10 % de replay de SQuAD. El entrenamiento se realizo con Axolotl + PEFT, con 2 epochs en la etapa 2, 588 pasos, longitud de secuencia 512, learning rate 2e-4 con scheduler cosine y batch efectivo de 16.

El conjunto de datos de la etapa 2 contiene 12.846 filas de entrenamiento: las 11.679 filas de train de SciQ (desde ahmedelgebaly/SciQ_Alpaca) mas 1.167 filas de SQuAD (desde ahmedelgebaly/SQuad_2_Alpaca), seleccionadas con random.sample y semilla 42. El formato es Alpaca (instruction/input/output). La validacion consta de 1.000 filas exclusivamente de SciQ. La perdida de validacion reportada es 0,8939 y la perplejidad de validacion 2,4446. La innovacion tecnica principal es el uso de replay de datos (10 % de SQuAD) durante la segunda etapa para reducir el olvido catastrofico de la tarea anterior.

## Capacidades

- Respuesta a preguntas extractivas sobre pasajes de texto (entrenado con SQuAD v1).
- Respuesta a preguntas de conocimiento cientifico de opcion multiple y formato abierto (entrenado con SciQ).
- Generacion de texto conversacional heredada del modelo base Llama 3.1 8B Instruct.
- Capacidad de seguir instrucciones en formato Alpaca (instruction/input/output).
- Soporte de tool calling y function calling: heredado del modelo base, no verificado especificamente tras el ajuste.
- Razonamiento multi-step y uso como agente: heredado del modelo base, no evaluado en este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no soportado (el modelo base es solo texto).

## Casos de uso

- Respuesta a preguntas sobre documentacion tecnica: el adaptador puede responder preguntas extractivas sobre pasajes de manuales o documentacion, aprovechando el entrenamiento en SQuAD v1 para localizar y extraer la respuesta correcta del contexto proporcionado.
- Tutorizacion de ciencias: dado que se entrena con el conjunto completo de SciQ, es adecuado para responder preguntas de fisica, quimica, biologia y astronomia a nivel educativo, devolviendo respuestas concisas en formato instruction/output.
- Sistemas de QA sobre bases de conocimiento cientifico: se puede integrar en un pipeline RAG donde el recuperador obtiene pasajes y el adaptador extrae o formula la respuesta, con la ventaja de que el adaptador ocupa solo 0,2 GB y se carga sobre el modelo base existente.
- Evaluacion de olvido catastrofico en investigacion: el adaptador sirve como caso de estudio reproducible para medir como el replay de datos (10 % de SQuAD) afecta a la retencion de la tarea previa tras el entrenamiento en SciQ.
- Prototipado rapido de asistentes de estudio: al ser un adaptador ligero, permite experimentar con especializacion de dominio sin reentrenar el modelo completo, util en entornos academicos con recursos limitados.
- Generacion de pares pregunta-respuesta para aumento de datos: el modelo puede generar respuestas a partir de contextos cientificos, util para construir conjuntos de datos de QA sinteticos en dominios educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, SQuAD F1/EM, SciQ accuracy) en la informacion disponible. Solo se reportan metricas de validacion del entrenamiento:

| Metrica | Valor |
|---|---|
| Val loss (etapa 2, epoch 2) | 0,8939 |
| Val PPL (etapa 2, epoch 2) | 2,4446 |
| Pasos de entrenamiento | 588 |
| Filas de entrenamiento | 12.846 |
| Filas de validacion | 1.000 (solo SciQ) |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre Llama 3.1 8B, los requisitos son los del modelo base. En precision FP16 se estiman aproximadamente 16 GB de VRAM; en cuantizacion 4-bit (GGUF/AWQ/GPTQ) se reduce a unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 para servicio de alta concurrencia; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090/4080 (16-24 GB) para cuantizacion 8-bit o 4-bit.
- Cabe en GPU consumer: si, en RTX 4090 con FP16 y en GPUs de 8-12 GB con cuantizacion 4-bit del modelo base.
- Opciones de despliegue: transformers + PEFT (carga del adaptador con PeftModel.from_pretrained), vLLM con soporte LoRA, llama.cpp/Ollama (requiere fusionar el adaptador o cargarlo como LoRA), TGI con adaptadores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e2 | 8B (base) + adaptador | no disponible (base 128K) | QA cientifico y extractivo | llama3.1 | Hugging Face (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Generico, instruction-tuned | llama3.1 | Hugging Face (muy popular) |
| ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e2 | 8B (base) + adaptador | no disponible | QA extractivo (SQuAD) | llama3.1 | Hugging Face |
| ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e1 | 8B (base) + adaptador | no disponible | QA cientifico y extractivo | llama3.1 | Hugging Face (recomendado por el autor) |

## Limitaciones y advertencias

- Al ser un adaptador LoRA, no funciona de forma autonoma: requiere descargar y cargar el modelo base meta-llama/Llama-3.1-8B-Instruct, que esta sujeto a aceptacion de licencia en el Hub.
- El entrenamiento se realizo con secuencias de 512 tokens, por lo que el rendimiento en contextos largos puede degradarse aunque el modelo base soporte 128K.
- Riesgo de olvido catastrofico: aunque se usa un 10 % de replay de SQuAD, la segunda etapa prioriza SciQ y puede reducir el rendimiento en QA extractivo general.
- Riesgo de alucinacion inherente al modelo base Llama 3.1 8B, especialmente en preguntas cientificas fuera de la distribucion de SciQ.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base.
- Idiomas soportados: no especificados; el entrenamiento se realizo con datasets en ingles (SQuAD y SciQ), por lo que el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: hereda la Llama 3.1 Community License, que impone condiciones de uso comercial y requiere atribucion; es necesario citar los papers originales de SQuAD y SciQ.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion comunitaria ni reportes independientes de calidad.
- El autor recomienda el checkpoint e1 (menor val loss) frente a e2, por lo que este adaptador no es la version optima del barrido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador padre (SQuAD): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e2
- Checkpoint recomendado (e1): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e1
- Checkpoint e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e3
- Checkpoint e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e4
- Checkpoint e5: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e5
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/Seq_SQuAD_then_SciQ_Alpaca
- Dataset SciQ en formato Alpaca: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Dataset SQuAD en formato Alpaca: https://huggingface.co/datasets/ahmedelgebaly/SQuad_2_Alpaca
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
