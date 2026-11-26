# ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e5

## Resumen

El modelo `ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e5` es un adaptador PEFT de tipo QLoRA (cuantizacion 4 bits NF4) sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo desarrolla el usuario ahmedelgebaly en el contexto academico que la model card denomina "AAST Scenario 1.2", y su objetivo es especializar el modelo base en tareas de question answering extractivo y de conocimiento cientifico mediante un entrenamiento secuencial en dos fases: primero SQuAD v1 y despues SciQ con un 10 % de replay de SQuAD.

La relevancia de esta publicacion no reside en una innovacion arquitectonica, sino en su caracter de experimento controlado de ajuste fino secuencial y olvido catastrofico: se publican cinco variantes (epochs 1 a 5) del mismo mix de datos partiendo del adaptador de SQuAD, lo que permite estudiar el compromiso entre ajuste a SciQ y retencion de SQuAD. El autor recomienda la variante e1 por presentar la menor perdida de validacion.

Se trata de un adaptador de aproximadamente 0,2 GB sobre un transformer decoder-only de 8 mil millones de parametros, con la ventana de contexto nativa de Llama 3.1 (128 000 tokens) heredada del modelo base. No es un modelo autonomo: requiere descargar los pesos del modelo base (gated, con aceptacion de licencia de Meta) y cargar el adaptador con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA/QLoRA sobre el modelo base |
| Parametros totales | 8 mil millones (modelo base); el adaptador LoRA es un subconjunto adicional de parametros (r=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.1; el entrenamiento uso secuencias de 512) |
| Tipos de cuantizacion | QLoRA 4 bits NF4 en entrenamiento; el adaptador se distribuye en safetensors y admite la cuantizacion del modelo base (GGUF, AWQ, GPTQ, etc. via el base) |
| Idiomas soportados | no disponible en la model card; el modelo base Llama 3.1 soporta oficialmente 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre el modelo base Llama 3.1 8B Instruct, con rango LoRA 16, alpha 32 y dropout 0,05, sobre una longitud de secuencia de 512 tokens. La segunda fase parte del adaptador ya entrenado en SQuAD (`ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e5`) mediante `lora_model_dir`, es decir, se trata de un ajuste fino secuencial y no de un entrenamiento desde cero del adaptador. Se usan 5 epochs, 1470 pasos, learning rate 2e-4 con scheduler coseno, batch efectivo de 16 y el framework Axolotl junto con PEFT.

El dataset de la fase 2 combina el conjunto completo de SciQ de entrenamiento (11 679 filas) con un 10 % de replay de SQuAD (1 167 filas, muestreadas con `random.sample` y semilla 42), sumando 12 846 filas en formato Alpaca (instruction/input/output). La validacion consta de 1000 filas exclusivamente de SciQ. El mismo mix se reutiliza en cada epoch, de modo que las variantes e1 a e5 solo difieren en el numero de pasadas sobre esos datos. La perdida de validacion reportada para esta variante e5 es 1,4156 y la perplejidad de validacion 4,1188.

## Capacidades

- Generacion de texto y respuestas conversacionales multi-turno, heredadas del modelo base Instruct.
- Question answering extractivo sobre pasajes de contexto (entrenado explicitamente con SQuAD v1).
- Question answering de conocimiento cientifico de nivel escolar y divulgativo (entrenado con SciQ).
- Razonamiento basico y seguimiento de instrucciones en formato Alpaca.
- Capacidades multilingues heredadas de Llama 3.1 (no verificadas ni reforzadas por el adaptador).
- Soporte de tool calling y function calling heredado del modelo base, aunque no evaluado ni ajustado en este adaptador.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Question answering sobre documentacion tecnica: el adaptador esta afinado para extraer respuestas a partir de un pasaje de contexto, por lo que encaja en pipelines de RAG donde el texto recuperado se inserta en el prompt y el modelo debe responder de forma extractiva.
- Asistencia educativa en ciencias: el entrenamiento con SciQ lo orienta a preguntas de fisica, quimica y biologia de nivel introductorio, util para tutores automaticos o generadores de cuestionarios.
- Evaluacion de olvido catastrofico en investigacion: al publicarse cinco variantes con distinto numero de epochs sobre el mismo mix, sirve como material de estudio para medir la degradacion de SQuAD al entrenar sobre SciQ.
- Prototipado rapido de asistentes de lectura comprensiva: la ventana de 128 000 tokens del base permite procesar documentos largos, aunque el adaptador se entreno con secuencias de 512 y su comportamiento mas alla de esa longitud no esta validado.
- Base para ajustes posteriores: al ser un adaptador PEFT ligero (0,2 GB), se puede combinar o continuar entrenando con `lora_model_dir` sin tocar los pesos completos del modelo base.
- Despliegue en entornos con recursos limitados: al requerir solo el adaptador sobre un base cuantizable, permite servir el modelo en una unica GPU consumer con cuantizacion de 4 bits, aunque el rendimiento especifico del adaptador en ese regimen no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de validacion del entrenamiento:

| Metrica | Valor |
|---|---|
| Val loss (epoch 5) | 1,4156 |
| Val PPL (epoch 5) | 4,1188 |
| Pasos de entrenamiento | 1470 |
| Filas de entrenamiento | 12 846 |
| Filas de validacion | 1000 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K, SQuAD F1/EM ni SciQ accuracy para este adaptador ni para sus variantes hermanas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16 para el modelo base de 8B; en torno a 5-6 GB con cuantizacion de 4 bits (Q4_K_M o similar), a lo que se suma el adaptador (0,2 GB) y el overhead de activaciones.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en precision completa y alto throughput; RTX 4090 (24 GB) o A6000 (48 GB) para FP16; RTX 3090/4080 (16-24 GB) para cuantizacion de 8 o 4 bits.
- Cabe en GPU consumer: si, con cuantizacion de 4 u 8 bits en tarjetas de 8-16 GB, aunque el rendimiento del adaptador en ese regimen no esta documentado.
- Opciones de despliegue: transformers + PEFT (metodo indicado en la model card), vLLM (previa fusion del adaptador con el base), llama.cpp/Ollama (requiere convertir el modelo fusionado a GGUF), TGI y Axolotl para reentrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Llama 3.1 8B + QLoRA SQuAD/SciQ) | 8B (base) + LoRA r=16 | 128 000 (base) | Adaptador PEFT | llama3.1 | Hugging Face, requiere base gated |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 | Modelo completo | llama3.1 | Hugging Face, gated |
| Adaptador SQuAD-QLoRA-e5 del mismo autor | 8B (base) + LoRA r=16 | 128 000 (base) | Adaptador PEFT | llama3.1 | Hugging Face |
| Variantes e1 a e4 del mismo escenario | 8B (base) + LoRA r=16 | 128 000 (base) | Adaptador PEFT | llama3.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de la val loss reportada para e5 y la recomendacion del autor de usar e1 por menor perdida de validacion.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin el modelo base `meta-llama/Llama-3.1-8B-Instruct` no es utilizable, y el acceso a ese base esta restringido por la licencia de Meta.
- El adaptador se entrena con secuencias de 512 tokens; aunque hereda una ventana de 128 000 tokens, su comportamiento en contextos largos no esta validado y probablemente degrade.
- El entrenamiento es muy especifico (SQuAD + SciQ en formato Alpaca), lo que puede estrechar la distribucion de respuestas y aumentar el riesgo de alucinacion fuera de esos dominios.
- Riesgo de olvido catastrofico de las capacidades originales del modelo Instruct, especialmente con 5 epochs; el propio autor recomienda e1 frente a e5 por menor perdida de validacion.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez; los sesgos heredados de Llama 3.1 no se mitigan con este ajuste.
- Idiomas soportados no verificados: el ajuste se hace sobre datos en ingles (SQuAD y SciQ), por lo que el rendimiento en castellano u otros idiomas puede resentirse.
- Uso comercial permitido bajo la Llama 3.1 Community License, con las obligaciones de atribucion y las restricciones de la licencia de Meta; el adaptador no anade terminos propios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Las fechas de creacion y actualizacion del repositorio (2026) son posteriores a la fecha de la consulta, lo que sugiere un artefacto de generacion o publicacion programada; conviene verificar la integridad del contenido antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e5
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador padre (SQuAD): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e5
- Variante recomendada e1: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e1
- Variante e2: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e2
- Variante e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e3
- Variante e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e4
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/Seq_SQuAD_then_SciQ_Alpaca
- Dataset SciQ en formato Alpaca: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Dataset SQuAD en formato Alpaca: https://huggingface.co/datasets/ahmedelgebaly/SQuad_2_Alpaca
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper de SQuAD: https://arxiv.org/abs/1606.05250
- Paper de SciQ: https://arxiv.org/abs/1707.06209
