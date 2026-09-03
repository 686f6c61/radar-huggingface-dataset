# ISLAM-PO/MasryGPT_chat_FINALLY

## Resumen

MasryGPT_chat_FINALLY es un modelo de lenguaje conversacional especializado en el dialecto egipcio del árabe (masri o عامية), desarrollado por ISLAM-PO a partir del modelo base Qwen/Qwen2.5-1.5B-Instruct. Su objetivo es cubrir la brecha entre el árabe estándar moderno (MSA), que dominan la mayoría de los LLM árabes, y el habla cotidiana real de los aproximadamente 105 millones de egipcios, incluyendo humor, modismos y expresiones coloquiales.

El modelo se ha afinado mediante QLoRA con Unsloth sobre un conjunto de datos sintético de 80.000 ejemplos, en una sola época y 2.500 pasos, alcanzando una pérdida media de 0,079. Con 1.543 millones de parámetros (1,5B), es ligero y desplegable en hardware modesto, como una GPU T4 con cuantización de 4 bits (1,2 GB de VRAM). Se distribuye bajo licencia Apache 2.0 y está pensado para chatbots, atención al cliente, redes sociales y educación en Egipto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (28 capas, 12 cabezas de atencion, 2 KV heads) |
| Parametros totales | 1.543.714.304 (segun safetensors; la model card reporta 1.562.179.072) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (entrenado con 2.048) |
| Tipos de cuantizacion | bfloat16 (liberado), 4-bit NF4 (entrenamiento), cuantizaciones adicionales posibles |
| Idiomas soportados | Arabe (dialecto egipcio principalmente), ingles (base) |
| Licencia | Apache 2.0 (se aplica la licencia de Qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-1.5B-Instruct, un transformer causal con 28 capas, 12 cabezas de atencion y 2 cabezas KV, con un tamaño oculto de 1536 y un vocabulario de 151.936 tokens. El entrenamiento se realizo con QLoRA (cuantizacion NF4 de 4 bits) y Unsloth, aplicando LoRA con r=16, alpha=16 y dropout=0 sobre todas las proyecciones lineales (q, k, v, o, gate, up, down). Solo se entrenaron 18.464.768 parametros (1,18% del total).

El conjunto de datos, `qwen_egyptian_80k_terms.jsonl`, contiene 80.000 ejemplos generados sinteticamente a partir de un lexico egipcio, con filtrado manual de vulgaridades. La distribucion tematica es: saludos y conversacion diaria (35%), humor y chistes (15%), expresiones y modismos (15%), servicio al cliente e instrucciones (20%) y cultura y comida (15%). Se aplico el chat template de Qwen2.5 y empaquetado (packing) para acelerar el entrenamiento. Los hiperparametros incluyen batch efectivo de 32, learning rate 2e-4 con scheduler coseno, warmup de 20 pasos, weight decay 0,01 y una sola epoca. La perdida convergio de 0,091 a 0,074 (una reduccion del 18,7%).

## Capacidades

- Generacion de texto conversacional en dialecto egipcio (masri), incluyendo saludos, expresiones cotidianas, humor y modismos.
- Comprension y generacion de arabe estandar moderno (MSA) heredada del modelo base Qwen2.5-Instruct.
- Soporte de instrucciones y formato de chat mediante el chat template de Qwen2.5.
- Capacidad multilingue limitada: principalmente arabe egipcio, con algo de ingles y arabe estandar.
- No se documenta soporte explicito de tool calling o function calling en la model card, aunque al derivar de Qwen2.5-Instruct podria heredarlo, pero no esta verificado.
- No se documentan capacidades de vision, audio o modo de razonamiento explicito.

## Casos de uso

- Atencion al cliente automatizada en Egipto: el modelo puede gestionar conversaciones multi-turno en dialecto egipcio, respondiendo con naturalidad a quejas, consultas y solicitudes tipicas de empresas locales, gracias a su entrenamiento especifico en ese registro.
- Chatbots para redes sociales y mensajeria: integrable en plataformas como WhatsApp o Messenger para interactuar con usuarios egipcios en su lengua coloquial, mejorando la experiencia frente a modelos que solo dominan el MSA.
- Educacion y aprendizaje del dialecto: util como asistente para estudiantes de arabe egipcio, explicando modismos, expresiones y diferencias con el arabe estandar.
- Generacion de contenido localizado: creacion de guiones, posts o respuestas para marketing y comunicacion dirigida al publico egipcio, con tono autentico y culturalmente relevante.
- Asistentes virtuales para servicios publicos o privados: despliegue en entornos con recursos limitados (T4, edge) para ofrecer informacion y soporte en dialecto local.
- Prototipado rapido de aplicaciones conversacionales: al ser un modelo pequeno y rapido, permite iterar y validar ideas de productos de IA conversacional en arabe egipcio sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta una evaluacion manual sobre 100 prompts, con un 92% de naturalidad en masri, y una perdida de entrenamiento media de 0,079. Se presenta a continuacion la informacion disponible:

| Metrica | Valor |
|---|---|
| Naturalidad en masri (evaluacion manual, 100 prompts) | 92% |
| Perdida media de entrenamiento | 0,079 |
| Perdida inicial | 0,091 |
| Perdida final | 0,074 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en bfloat16 (2,9 GB de pesos) y 1,2 GB en cuantizacion de 4 bits, segun la model card.
- GPU recomendadas: T4 (15 GB) es suficiente para 4-bit; tambien puede ejecutarse en GPUs consumer como RTX 3060, RTX 4060 o similares con 8 GB o menos.
- Cabe en GPUs consumer de gama media y baja, asi como en entornos edge o moviles con cuantizacion adecuada.
- Opciones de despliegue: al ser un modelo transformers estandar, es compatible con vLLM, llama.cpp, Ollama, TGI y cualquier framework que soporte Qwen2.5. No se documentan configuraciones especificas de latencia o throughput.
- El entrenamiento se realizo en dos GPUs T4 de Kaggle, lo que indica que la inferencia es viable en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| ISLAM-PO/MasryGPT_chat_FINALLY | 1,5B | 32.768 (entrenado 2.048) | Dialecto egipcio | Apache 2.0 |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 | Multilingue, MSA | Apache 2.0 |
| Jais (ejemplo de LLM arabe) | 13B | 8.192 | Arabe estandar | No disponible |

No se dispone de informacion sobre otros modelos especificamente entrenados para dialecto egipcio con los que comparar directamente. La comparacion con el modelo base muestra que MasryGPT_chat_FINALLY sacrifica generalidad multilingue por especializacion en el dialecto egipcio, manteniendo el mismo tamano y contexto.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos generados a partir de un lexico egipcio, lo que puede limitar su robustez ante variaciones reales del habla y contextos no cubiertos.
- La ventana de entrenamiento fue de 2.048 tokens, aunque el modelo soporta hasta 32.768; puede degradarse en conversaciones muy largas o con contexto extenso.
- No se han realizado evaluaciones formales de sesgos, alucinaciones o seguridad; el filtrado de vulgaridades fue manual y podria no ser exhaustivo.
- La licencia Apache 2.0 se aplica, pero la model card indica que "la licencia de Qwen aplica", lo que podria implicar restricciones adicionales derivadas del modelo base.
- No se documentan pruebas en produccion ni benchmarks estandar, por lo que su rendimiento en tareas generales de razonamiento, codigo o matematicas es desconocido.
- El modelo esta orientado al dialecto egipcio; su uso en otros dialectos arabes (magrebi, levantino, etc.) o en arabe formal puede producir respuestas inapropiadas o incorrectas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ISLAM-PO/MasryGPT_chat_FINALLY
- Perfil del autor en Hugging Face: https://huggingface.co/ISLAM-PO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
