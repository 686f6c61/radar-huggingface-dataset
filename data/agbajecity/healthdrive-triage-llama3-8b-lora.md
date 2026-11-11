# AgbajeCity/healthdrive-triage-llama3-8b-lora

## Resumen

HealthDrive Triage Assistant es un adaptador LoRA de rango 16 sobre Llama-3-8B (cuantizado en 4 bits mediante Unsloth) desarrollado por HealthDrive Technologies LTD, con sede en Kigali (Ruanda). El adaptador ajusta el modelo base para responder preguntas clinicas breves en ingles, y se concibe como la capa de triaje de un servicio telefonico de atencion primaria para zonas rurales. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (0,2 GB) que debe cargarse junto al modelo base `unsloth/llama-3-8b-bnb-4bit`.

El entrenamiento se realizo con QLoRA sobre las primeras 2.000 filas limpias del dataset `medalpaca/medical_meadow_medical_flashcards`, durante una epoca (250 pasos), con un learning rate de 2e-4, batch efectivo de 8, AdamW de 8 bits y semilla 3407. La perdida final registrada fue de 0,653 y la media de entrenamiento de 0,7495. El autor reporta una evaluacion held-out sobre 200 filas no vistas (indices 2000 a 2199) con decodificacion greedy y hasta 64 tokens nuevos.

La relevancia del proyecto es acotada pero clara: demuestra un flujo completo de ajuste parametrizado eficiente (PEFT) para dominio medico con recursos limitados, orientado a un caso de uso real de salud en paises de renta baja. Sin embargo, se trata de un prototipo de investigacion sin benchmarks estandar, sin validacion clinica y con licencia Llama 3, lo que restringe su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3-8B) con adaptador LoRA de rango 16 (PEFT) |
| Parametros totales | No disponible en la model card; el adaptador LoRA ocupa 0,2 GB en el repositorio. El modelo base Llama-3-8B tiene 8.000 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (valor usado en el ejemplo de carga con `max_seq_length=2048`); el maximo nativo de Llama-3-8B es mayor, pero no se especifica en la ficha |
| Tipos de cuantizacion | El adaptador se entrena y carga sobre el base en 4 bits (bitsandbytes, via Unsloth); el adaptador en si se distribuye en safetensors |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Llama 3 Community License (heredada del modelo base); el codigo del repositorio asociado es MIT |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en formato compatible con Unsloth/Hugging Face |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3-8B, un transformer decoder-only con atencion causal estandar. La tecnica de ajuste es QLoRA: el modelo base se mantiene cuantizado en 4 bits (NF4 mediante bitsandbytes) y solo se entrenan los pesos de baja graduacion del adaptador LoRA de rango 16. La implementacion utiliza Unsloth, que optimiza el entrenamiento de LoRA reduciendo el uso de memoria y acelerando los kernels. El entrenamiento consistio en una epoca sobre 2.000 filas del dataset de flashcards medicas `medalpaca/medical_meadow_medical_flashcards`, con learning rate 2e-4, batch efectivo de 8 (batch 1 con acumulacion de gradientes de 8), optimizador AdamW de 8 bits, scheduler lineal y semilla 3407, totalizando 250 pasos.

No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales. Tampoco se detalla la composicion completa del dataset mas alla de la fuente y el filtrado de filas vacias, ni el numero total de tokens de entrenamiento. El prompt de inferencia sigue una plantilla fija de tipo instruccion ("Below is a medical question. Write a clinical and accurate answer.") con marcadores `### Question:` y `### Answer:`, lo que implica que el adaptador esta especializado en ese formato concreto y no en conversacion multi-turno.

## Capacidades

- Generacion de respuestas breves a preguntas clinicas en ingles, con estilo de flashcard medica.
- Respuesta a preguntas de conocimiento medico general incluidas en el dataset de entrenamiento (MedAlpaca medical flashcards).
- Formato de prompt fijo de una sola vuelta (pregunta-respuesta), sin soporte documentado de historial conversacional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles; no se reporta entrenamiento en otros idiomas.
- No se documentan capacidades de vision, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Triaje telefonico de atencion primaria: el adaptador responde preguntas clinicas breves en ingles dentro de un flujo de llamada, tal como lo concibe el autor para zonas rurales de Ruanda; su formato de respuesta corta (hasta 64 tokens en evaluacion) encaja con respuestas rapidas en un servicio telefonico.
- Formacion de personal sanitario no medico: servir como capa de consulta rapida de flashcards medicas para agentes comunitarios de salud que necesitan recordar definiciones o criterios clinicos basicos.
- Prototipado de asistentes medicos de bajo coste: al ser un adaptador de 0,2 GB sobre un base en 4 bits, permite experimentar con ajuste de dominio en hardware modesto y validar pipelines antes de invertir en modelos mayores.
- Investigacion en PEFT para dominio medico: sirve como referencia reproducible de un flujo QLoRA con Unsloth, hiperparametros documentados y conjunto de evaluacion held-out publicado en CSV.
- Generacion de material de estudio: producir respuestas concisas a preguntas de flashcards para bancos de preguntas de formacion medica en ingles.
- Evaluacion comparativa de adaptadores LoRA: el autor publica predicciones held-out (`evaluation/heldout_predictions.csv`), lo que facilita replicar y comparar metricas BLEU/ROUGE frente a otras variantes.

## Benchmarks y rendimiento

El autor reporta una evaluacion held-out sobre 200 filas (indices 2000 a 2199) del mismo dataset, no vistas en entrenamiento, con decodificacion greedy y hasta 64 tokens nuevos:

| Modelo | BLEU | ROUGE-1 | ROUGE-L |
|---|---|---|---|
| Llama-3-8B base | 16,3 | 0,446 | 0,394 |
| HealthDrive fine-tuned | 40,59 | 0,681 | 0,626 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, MedQA, etc.) en la informacion disponible. Las metricas presentadas son de solapamiento n-grama sobre un dataset de flashcards, no de exactitud clinica.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB; el consumo real lo determina el modelo base Llama-3-8B.
- Carga en 4 bits (como en el ejemplo del autor): aproximadamente 5-6 GB de VRAM para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un GPU con 8-12 GB para inferencia con contexto de 2.048 tokens.
- Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB en cuantizacion 4 bits; en 8 bits o 16 bits requiere GPUs de mayor memoria (A100 40/80 GB, H100) o descarga por capas.
- Despliegue: el flujo documentado usa `unsloth.FastLanguageModel` con `load_in_4bit=True`; alternativas compatibles serian vLLM o TGI fusionando el adaptador, y llama.cpp/Ollama si se convierte el modelo fusionado a GGUF (no documentado por el autor).
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HealthDrive Triage (este) | Adaptador LoRA sobre 8B | 2.048 (uso documentado) | Ajuste QLoRA en flashcards medicas | Llama 3 Community | Hugging Face, 0 descargas |
| Llama-3-8B base | 8B | Mayor que 2.048 (nativo no detallado aqui) | Modelo generalista | Llama 3 Community | Hugging Face |
| MedAlpaca (variantes 7B/13B) | 7B-13B | No disponible | Ajuste en datos medicos (MedQA, flashcards) | No disponible en esta ficha | Hugging Face |
| Adaptadores medicos LoRA sobre Llama-3 | 8B | Variable | PEFT de dominio | Llama 3 Community | Hugging Face |

La comparacion con benchmarks estandar no es posible porque este adaptador no publica resultados en MMLU, MedQA ni HumanEval. La unica comparacion cuantitativa disponible es frente a su propio modelo base en la tabla de evaluacion held-out del apartado anterior.

## Limitaciones y advertencias

- Prototipo de investigacion declarado por el propio autor, con fines educativos; no validado clinicamente ni aprobado para uso sanitario.
- Entrenado sobre flashcards medicas, no sobre conversaciones reales con pacientes; el dominio de uso difiere del de un asistente clinico real.
- Solo ingles; no soporta otros idiomas ni se ha evaluado en ellos.
- No diagnostica, no prescribe y no sustituye a un clinico ni a un servicio de emergencia, segun la propia model card.
- Riesgo de alucinacion en contenido medico: el ajuste sobre 2.000 filas y una epoca no garantiza correccion factual; las metricas BLEU/ROUGE miden solapamiento, no veracidad.
- Formato de prompt rigido de una sola vuelta; no se documenta comportamiento en conversaciones multi-turno.
- Licencia Llama 3 Community: impone restricciones de uso comercial y obligaciones de atribucion; el codigo del repositorio es MIT, pero los pesos base no.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, y sin pipeline declarado; no hay evidencia de uso en produccion.
- No se documentan sesgos especificos, pero al derivar de Llama-3-8B y de un dataset medico en ingles, hereda los sesgos del modelo base y la cobertura limitada del dataset de flashcards.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AgbajeCity/healthdrive-triage-llama3-8b-lora
- Repositorio de codigo (MIT): https://github.com/AgbajeCity/HealthDrive-Triage-Chatbot
- Modelo base en Hugging Face: https://huggingface.co/unsloth/llama-3-8b-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/medalpaca/medical_meadow_medical_flashcards
- Licencia Llama 3: https://llama.meta.com/llama3/license/
