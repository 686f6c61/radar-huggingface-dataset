# Kamyar-zeinalipour/ShawarmaChats-Mistral-Nemo-Instruct-2407-LoRA

## Resumen

ShawarmaChats-Mistral-Nemo-Instruct-2407-LoRA es un adaptador LoRA (PEFT) publicado por Kamyar Zeinalipour que especializa el modelo base Mistral-Nemo-Instruct-2407 (12B parametros) en la generacion de dialogos de seis turnos en arabe. El adaptador se entrena sobre el corpus ShawarmaChats, un benchmark de 30.012 conversaciones ancladas en articulos de Wikipedia en arabe, con cada parrafo fuente disponible en tres variantes: arabe estandar moderno (MSA), arabe egipcio y arabe magrebi. Dado un parrafo y un dialecto, el modelo produce un dialogo natural entre dos hablantes en formato JSON que se mantiene fiel al contenido del parrafo.

El modelo aparece asociado a la publicacion *Shawarma Chats* (ArabicNLP 2025) y forma parte de una familia de adaptadores que cubren distintos modelos base (Llama-3.2-1B, Llama-3.2-3B, Mistral-7B-v0.3, Llama-3.1-8B y este Mistral-Nemo-12B). Su interes practico es doble: por un lado, es una herramienta de generacion de datos sinteticos de dialogo multdialectal en arabe, un recurso escaso; por otro, demuestra que un ajuste LoRA selectivo sobre un modelo de 12B puede multiplicar la calidad percibida (medida con un grader basado en GPT-4o) respecto al modelo base, pasando de 1,313 a 3,345 sobre 4 en el split de test.

La relevancia actual radica en la escasez de modelos abiertos que cubran variantes dialectales del arabe (egipcio y magrebi) con fidelidad factual a una fuente, y en que el adaptador es ligero (3,0 GB) y se puede fusionar con el modelo base para obtener un modelo unico desplegable con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-Nemo-Instruct-2407); adaptador LoRA sobre q/k/v/o, gate/up/down, embed_tokens y lm_head |
| Parametros totales | 12B (modelo base); adaptador LoRA con r=64, alpha=128, dropout 0.1 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral-Nemo) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en bf16; admite las cuantizaciones del modelo base tras merge) |
| Idiomas soportados | Arabe: estandar moderno (MSA), egipcio y magrebi (etiqueta `ar`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-Nemo-Instruct-2407, un transformer decoder-only de 12B parametros. El ajuste LoRA emplea rango 64, alpha 128 y dropout 0,1, y no se limita a las proyecciones de atencion y MLP: tambien se aplica a `embed_tokens` y `lm_head`, lo que explica que el repositorio del adaptador pese 3,0 GB en lugar de unos pocos cientos de megabytes. El entrenamiento usa 28.500 dialogos del split de train de ShawarmaChats (9.500 parrafos × 3 dialectos), 3 epocas, AdamW con learning rate 1e-4, scheduler coseno sin warm-up, weight decay 1e-4, bf16, DeepSpeed ZeRO-3, Flash Attention 2, gradient clipping 1,0 y semilla 100. El batch es de 2 secuencias por GPU con 2 pasos de acumulacion, empaquetado a 3.500 tokens.

La innovacion tecnica principal no esta en la arquitectura sino en la tarea: el modelo se entrena para transformar un parrafo enciclopedico en un dialogo de seis turnos entre dos hablantes, manteniendo fidelidad al contenido y adoptando el registro dialectal solicitado. La evaluacion usa decodificacion con temperature 0,8, top-p 0,95, top-k 50, repetition penalty 1,1 y un maximo de 1.024 tokens nuevos. Los prompts de entrenamiento estan disponibles en `pipeline/prompts.py` del repositorio GitHub (`standard_prompt`, `egyptian_prompt`, `maghrebi_prompt`, cada uno con un placeholder `{text}`).

## Capacidades

- Generacion de dialogos de seis turnos entre dos hablantes a partir de un parrafo fuente, en formato JSON.
- Generacion multdialectal en arabe: estandar moderno, egipcio y magrebi, seleccionable mediante el prompt.
- Fidelidad factual al parrafo de entrada (grounding en Wikipedia en arabe).
- Generacion de datos sinteticos de dialogo para entrenamiento o aumento de corpus.
- Generacion de texto general heredada del modelo base Mistral-Nemo-Instruct-2407 (no evaluada especificamente en esta ficha).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para el adaptador.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada; la tarea objetivo es generacion de dialogo, no razonamiento agente.
- Capacidades multilingues: limitadas al arabe en la practica del adaptador; el modelo base conserva sus idiomas originales, pero el ajuste esta orientado solo a `ar`.

## Casos de uso

- Generacion de corpus de dialogo dialectal en arabe: dado un conjunto de articulos de Wikipedia, el modelo produce conversaciones de seis turnos en MSA, egipcio o magrebi, utiles para entrenar o evaluar sistemas de dialogo en variantes poco representadas.
- Aumento de datos para ASR y TTS en arabe dialectal: los dialogos generados sirven como texto de referencia para grabar audio sintetico o para ampliar transcripciones en egipcio y magrebi.
- Creacion de material de evaluacion para chatbots arabes: el modelo permite construir baterias de dialogos controlados por dialecto y por tema enciclopedico, con fidelidad verificable al parrafo fuente.
- Prototipado de asistentes conversacionales en arabe egipcio: el adaptador puede fusionarse con el modelo base y desplegarse como generador de respuestas en registro coloquial egipcio para demos y pruebas de concepto.
- Investigacion en dialectologia computacional: permite comparar la capacidad de un mismo modelo base de producir MSA frente a egipcio y magrebi sobre el mismo contenido, aislando el efecto del ajuste.
- Generacion de guiones para contenido educativo o divulgativo en arabe: a partir de un texto de Wikipedia, el modelo convierte el contenido en una conversacion explicativa entre dos personas, util para podcasts, videos o material docente.
- Construccion de datasets de instrucciones multdialectales: los dialogos JSON generados pueden reformatearse como pares instruccion-respuesta para ajustar otros modelos en arabe dialectal.

## Benchmarks y rendimiento

Resultados en el split de test de ShawarmaChats: 1.512 dialogos (504 parrafos × 3 dialectos). El grader es una evaluacion con GPT-4o usando el rubric del corpus, con escala A=4 hasta D=1.

| Metrica | Base | ShawarmaChats LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,246 | 0,439 | +0,193 |
| BLEU | 0,141 | 0,284 | +0,143 |
| BERTScore F1 | 0,772 | 0,857 | +0,086 |
| Grader (1-4) | 1,313 | 3,345 | +2,032 |

Distribucion de ratings del grader tras el ajuste: A 864, B 329, C 296, D 23.

Resultados por dialecto (base → ajustado):

| Dialecto | ROUGE-L | BLEU | BERTScore F1 | Grader (1-4) |
|---|---|---|---|---|
| Estandar moderno | 0,248 → 0,402 | 0,139 → 0,251 | 0,778 → 0,838 | 1,605 → 3,089 |
| Egipcio | 0,242 → 0,458 | 0,138 → 0,300 | 0,778 → 0,871 | 1,294 → 3,284 |
| Magrebi | 0,247 → 0,457 | 0,146 → 0,300 | 0,760 → 0,863 | 1,040 → 3,663 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este adaptador en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 3,0 GB en safetensors porque incluye `embed_tokens` y `lm_head`; para inferencia hay que cargar tambien el modelo base de 12B, lo que domina el uso de memoria.
- En bf16, el modelo base de 12B requiere aproximadamente 24 GB de VRAM solo para pesos, mas memoria para KV cache y activaciones; en la practica hace falta una GPU con 24-32 GB o mas.
- En cuantizacion de 8 bits, el modelo fusionado cabe en torno a 12-14 GB de VRAM; en 4 bits, en torno a 7-8 GB, lo que abre la puerta a GPUs consumer de gama alta.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en bf16; RTX 4090 (24 GB) para bf16 justo o 8 bits; RTX 3090/4080 y similares con 16-24 GB para cuantizacion de 8 o 4 bits.
- El codigo oficial usa `transformers` + `peft` con `merge_and_unload()`; tras el merge, el modelo puede servirse con vLLM, TGI, llama.cpp (previo conversion a GGUF) u Ollama, aunque no se han publicado instrucciones ni conversiones oficiales a GGUF en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La evaluacion usa hasta 1.024 tokens nuevos por muestra con temperature 0,8, top-p 0,95, top-k 50 y repetition penalty 1,1.

## Comparativa con modelos similares

Comparativa dentro de la propia familia ShawarmaChats, con el grader (1-4) del split de test:

| Modelo base | Parametros | Adaptador | Grader base → ajustado |
|---|---:|---|---|
| Llama-3.2-1B-Instruct | 1B | ShawarmaChats-Llama-3.2-1B-Instruct-LoRA | 1,003 → 1,103 |
| Llama-3.2-3B-Instruct | 3B | ShawarmaChats-Llama-3.2-3B-Instruct-LoRA | 1,058 → 1,389 |
| Mistral-7B-Instruct-v0.3 | 7B | ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA | 1,186 → 3,302 |
| Llama-3.1-8B-Instruct | 8B | ShawarmaChats-Llama-3.1-8B-Instruct-LoRA | no disponible en la informacion proporcionada |
| Mistral-Nemo-Instruct-2407 | 12B | este adaptador | 1,313 → 3,345 |

Comparativa con alternativas fuera de la familia: no disponible en la informacion proporcionada. No se han publicado comparaciones con otros adaptadores de dialogo arabe ni con modelos arabes dedicados.

## Limitaciones y advertencias

- El adaptador esta especializado en una unica tarea: convertir un parrafo en un dialogo de seis turnos en uno de tres dialectos arabes. Fuera de ese formato, su comportamiento no esta evaluado y puede degradar las capacidades generales del modelo base.
- El modelo base Mistral-Nemo-Instruct-2407 esta sujeto a gating en Hugging Face: es necesario aceptar sus terminos y ejecutar `huggingface-cli login` antes de cargarlo.
- La evaluacion se apoya en un grader basado en GPT-4o, no en evaluacion humana; los resultados del grader deben interpretarse como una medida automatica de calidad percibida, no como validacion humana exhaustiva.
- Riesgo de alucinacion: aunque el objetivo es la fidelidad al parrafo, el modelo puede introducir contenido no presente en la fuente, especialmente en dialectos con menos datos (magrebi y egipcio muestran BLEU y ROUGE mas bajos que MSA en el modelo base, aunque el ajuste los eleva por encima de MSA).
- Cobertura dialectal limitada a MSA, egipcio y magrebi; no cubre otras variantes arabes (golfo, levantino, etc.).
- Sesgos conocidos: no disponibles en la informacion proporcionada; el corpus procede de Wikipedia en arabe, con los sesgos de cobertura y estilo de esa fuente.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial del modelo fusionado queda condicionado por la licencia del modelo base Mistral-Nemo; conviene verificar los terminos del modelo base antes de un despliegue comercial.
- El tamano del adaptador (3,0 GB) implica que la fusion con el modelo base es necesaria para un despliegue limpio; usar el adaptador sin fusionar anade latencia y complejidad operativa.
- No se han publicado datos de latencia, throughput ni consumo de memoria para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Mistral-Nemo-Instruct-2407-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Dataset ShawarmaChats: https://huggingface.co/datasets/Kamyar-zeinalipour/arabic_multi_dialect_dialogue
- Coleccion ShawarmaChats (ArabicNLP 2025): https://huggingface.co/collections/Kamyar-zeinalipour/shawarmachats-arabicnlp-2025-6af4656eda045ed7cfc001d3
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Shawarma-Chats
- Prompts de entrenamiento: https://github.com/KamyarZeinalipour/Shawarma-Chats/blob/main/pipeline/prompts.py
- Paper (ArabicNLP 2025): https://aclanthology.org/2025.arabicnlp-main.39/
- Adaptador hermano Llama-3.2-1B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-1B-Instruct-LoRA
- Adaptador hermano Llama-3.2-3B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-3B-Instruct-LoRA
- Adaptador hermano Mistral-7B-v0.3: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA
