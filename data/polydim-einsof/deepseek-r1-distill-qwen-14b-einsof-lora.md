# Polydim-Einsof/DeepSeek-R1-Distill-Qwen-14B-Einsof-LoRA

## Resumen

DeepSeek-R1-Distill-Qwen-14B-Einsof-LoRA es un adaptador LoRA (v020) entrenado por Ariel García Traba en el marco de Einsof Research / Antigravity Autonomous Compute sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B`. El adaptador se ha entrenado con Unsloth sobre un corpus propietario de 1.736 teoremas formales extraidos de PostgreSQL 16 (denominado `polydim_vec_db`) mas las denominadas "13 Leyes de Silicio de Einsof", con una perdida final de entrenamiento de 0,7225. El objetivo declarado es especializar el razonamiento del modelo base en dominios de teoremas formales y en el marco conceptual del autor (etiquetas `stiefel-manifold`, `formal-theorems`, `pmtp`).

El modelo base es un distill de DeepSeek-R1 sobre Qwen2.5-14B, un transformer denso de aproximadamente 14.800 millones de parametros con capacidad de razonamiento explicito en modo *thinking*. El adaptador anade un pequeno conjunto de pesos entrenables (formato PEFT/safetensors, ~0,3 GB en el repositorio) que se cargan sobre el modelo base congelado, por lo que no modifica el numero de parametros ni la longitud de contexto del modelo original.

La relevancia de esta publicacion es limitada y debe interpretarse con cautela: se trata de un adaptador de investigacion independiente, sin descargas ni validacion externa en el momento de redactar esta ficha, entrenado sobre un corpus muy especifico y sin benchmarks publicados. Resulta de interes para quienes quieran reproducir el pipeline de Unsloth sobre el distill de R1 o explorar la especializacion en teoremas formales, no como sustituto del modelo base en tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso decoder-only (Qwen2.5-14B, base del distill de DeepSeek-R1) |
| Parametros totales | Adaptador LoRA de ~0,3 GB en safetensors; modelo base de ~14.800 millones de parametros (no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens segun el ejemplo de uso de la model card; el modelo base soporta contextos mayores (no confirmado en la informacion disponible) |
| Tipos de cuantizacion | El ejemplo de la model card usa carga en 4 bits (`load_in_4bit=True`) y `bfloat16`; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con la libreria Unsloth sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B`, que es un transformer denso decoder-only de la familia Qwen2.5 con 14.800 millones de parametros aproximados y destilacion de las trazas de razonamiento de DeepSeek-R1. El adaptador LoRA congela los pesos del modelo base e inserta matrices de bajo rango entrenables, lo que reduce drasticamente el coste de entrenamiento y el tamano del artefacto publicado (0,3 GB).

El entrenamiento se realizo en Google Colab Plus sobre una GPU NVIDIA A100-SXM4, con un corpus canonico de 1.736 teoremas formales de PostgreSQL 16 almacenados en `polydim_vec_db` mas las 13 Leyes de Silicio de Einsof. La perdida final reportada es de 0,7225. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de hiperparametros (rango LoRA, alpha, learning rate, epochs) ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla del uso de Unsloth para el entrenamiento eficiente.

## Capacidades

- Generacion de texto y razonamiento en modo *thinking*, heredado del modelo base DeepSeek-R1-Distill-Qwen-14B.
- Razonamiento sobre teoremas formales y dominio de PostgreSQL 16, segun el corpus de entrenamiento declarado.
- Especializacion en el marco conceptual "Einsof" (Leyes de Silicio, `pmtp`, `stiefel-manifold`), aunque su alcance real no esta validado externamente.
- Capacidades de codigo y matematicas heredadas del modelo base (no verificadas especificamente en este adaptador).
- Soporte de tool calling / function calling: no documentado en la informacion disponible para este adaptador; el modelo base Qwen2.5 lo soporta.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para el adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada; heredadas del modelo base.
- Capacidades de vision o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Investigacion sobre especializacion de LLM mediante LoRA: el adaptador sirve como ejemplo reproducible de como ajustar el distill de R1 con Unsloth sobre un corpus pequeno y especifico, util para estudiar el efecto del fine-tuning en dominios cerrados.
- Razonamiento asistido sobre esquemas de PostgreSQL 16: dado el corpus de teoremas formales, puede emplearse para generar explicaciones o validaciones de propiedades logicas de esquemas y consultas, siempre con revision humana.
- Prototipado de asistentes de demostracion de teoremas: el modelo puede generar pasos intermedios de razonamiento (modo thinking) sobre enunciados formales, integrable en entornos de investigacion academica.
- Experimentacion con marcos conceptuales propios: util para el autor y su comunidad (EinsofOS) en la exploracion de las "Leyes de Silicio" y notaciones asociadas.
- Base para ablaciones academicas: permite comparar el rendimiento del modelo base frente al adaptador en tareas de razonamiento formal, midiendo el impacto de un corpus de 1.736 teoremas.
- Generacion de documentacion tecnica sobre bases de datos: el modelo puede redactar explicaciones de conceptos de PostgreSQL 16 a partir de su especializacion, con verificacion posterior por parte de un DBA.
- Fine-tuning incremental: el adaptador puede servir como punto de partida para nuevos ajustes LoRA sobre dominios relacionados sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida final de entrenamiento (0,7225), que no es comparable con benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con carga en 4 bits (`load_in_4bit=True`) el modelo base de ~14,8B requiere aproximadamente 9-11 GB de VRAM, mas overhead del adaptador (despreciable, ~0,3 GB). En bfloat16 completo se estiman ~30-32 GB.
- GPU recomendadas: NVIDIA A100-SXM4 (usada en el entrenamiento), H100, L40S o RTX 6000 Ada para inferencia en precision completa. Para carga en 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantizacion agresiva) y GPUs con 12 GB o mas usando 4 bits.
- Opciones de despliegue: Hugging Face Transformers + PEFT, Unsloth (`FastLanguageModel`), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama tras conversion a GGUF (no documentado en la model card).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-14B-Einsof-LoRA (este) | ~14,8B + LoRA | 4096 (segun ejemplo) | apache-2.0 | Hugging Face, 0 descargas | Adaptador de investigacion sin benchmarks |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B (base) | ~14,8B | 32.768 (segun model card del base, no confirmado aqui) | apache-2.0 | Hugging Face, ampliamente usado | Modelo de referencia con razonamiento thinking |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | ~7,6B | 32.768 (segun model card del base) | apache-2.0 | Hugging Face | Version mas ligera, menor VRAM |
| Qwen2.5-14B-Instruct | ~14,8B | 32.768 | apache-2.0 | Hugging Face | Modelo instruct sin destilacion de R1 |

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en ninguna tarea estandar.
- Corpus de entrenamiento muy reducido (1.736 teoremas) y propietario: riesgo alto de sobreajuste al dominio y de degradacion en tareas generales.
- Sesgos conocidos: no documentados; se heredan los del modelo base y se anaden los del corpus especifico del autor.
- Riesgo de alucinacion: alto en dominios fuera del corpus de entrenamiento; el modo thinking de R1 puede generar cadenas de razonamiento plausibles pero incorrectas.
- Limitaciones de contexto: el ejemplo de uso fija `max_seq_length=4096`, inferior al contexto nativo del modelo base; no se documenta el comportamiento mas alla de esa longitud.
- Idiomas soportados no declarados: no hay garantia de calidad multilingue en el adaptador.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y sus derivados deben cumplir tambien la licencia del modelo original de DeepSeek y Qwen.
- Sin validacion externa ni comunidad: 0 descargas y 0 likes en el momento de la ficha; no recomendable en produccion sin evaluacion propia.
- El adaptador no incluye los pesos del modelo base: requiere descargar `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B` por separado.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/DeepSeek-R1-Distill-Qwen-14B-Einsof-LoRA
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
