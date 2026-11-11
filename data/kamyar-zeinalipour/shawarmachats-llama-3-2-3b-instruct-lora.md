# Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-3B-Instruct-LoRA

## Resumen

ShawarmaChats-Llama-3.2-3B-Instruct-LoRA es un adaptador LoRA (PEFT) que afina el modelo meta-llama/Llama-3.2-3B-Instruct para la generación de diálogos de seis turnos en árabe, fundamentados en párrafos de Wikipedia en árabe. Lo desarrolla Kamyar Zeinalipour y se publicó junto con el artículo *Shawarma Chats* en ArabicNLP 2025. El adaptador cubre tres variedades: árabe estándar moderno (MSA), árabe egipcio y árabe magrebí.

El problema que resuelve es la escasez de datos y modelos para diálogos naturales en dialectos árabes: dado un párrafo y un dialecto, el modelo produce una conversación de dos hablantes en formato JSON que se mantiene fiel al contenido del párrafo. Se entrenó sobre la partición de entrenamiento del corpus ShawarmaChats (28.500 diálogos: 9.500 párrafos × 3 dialectos) y se evaluó sobre 1.512 diálogos de test.

Es relevante por su enfoque especializado y su tamaño contenido (3B parámetros), que lo hace desplegable en hardware modesto. El adaptador ocupa 1,7 GB porque el LoRA se aplicó también a `embed_tokens` y `lm_head`, además de las proyecciones y MLP. La licencia hereda la de Llama 3.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), con adaptador LoRA sobre el modelo base |
| Parametros totales | 3B (modelo base); tamaño del adaptador LoRA: 1,7 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se publica en bf16; el modelo base admite cuantizacion estandar de Llama) |
| Idiomas soportados | ar (árabe: estándar moderno, egipcio y magrebí) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.2-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros. El LoRA usa r = 64, α = 128 y dropout 0,1, aplicado a las proyecciones q/k/v/o, gate/up/down, `embed_tokens` y `lm_head`. El entrenamiento se realizó durante 3 épocas con AdamW, learning rate 1e-4, scheduler coseno sin warm-up, weight decay 1e-4, precisión bf16, DeepSpeed ZeRO-3 y Flash Attention 2, con gradient clipping de 1.0 y semilla 100. El batch efectivo fue de 2 secuencias por GPU con 2 pasos de acumulación, empaquetadas a 3.500 tokens.

Los datos de entrenamiento proceden de la partición train del corpus ShawarmaChats: 28.500 diálogos correspondientes a 9.500 párrafos de Wikipedia en árabe, cada uno renderizado en las tres variedades dialectales. La tarea es generar un diálogo de dos hablantes en JSON a partir de un párrafo y una instrucción de dialecto, usando las plantillas `standard_prompt`, `egyptian_prompt` y `maghrebi_prompt` del repositorio. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre diálogos.

## Capacidades

- Generación de diálogos de seis turnos entre dos hablantes en formato JSON, fundamentados en un párrafo fuente.
- Producción de texto en tres variedades de árabe: estándar moderno, egipcio y magrebí.
- Fidelidad al contenido del párrafo de entrada (grounding sobre Wikipedia en árabe).
- Generación condicionada por dialecto mediante plantillas de prompt específicas.
- Decodificación configurable (temperatura, top-p, top-k, penalización por repetición) para controlar variedad y coherencia.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de material de entrenamiento para TTS y ASR en dialectos árabes: el modelo produce diálogos etiquetados por dialecto que pueden servir para sintetizar pares audio-texto o ampliar corpus de reconocimiento de voz en egipcio y magrebí.
- Creación de contenido educativo en árabe dialectal: a partir de un artículo de Wikipedia se obtiene una conversación explicativa de seis turnos, útil para materiales de aprendizaje de lenguas.
- Aumento de datos para modelos de diálogo árabe: el adaptador permite generar variantes conversacionales de un mismo párrafo en las tres variedades, ampliando datasets de entrenamiento con pares prompt-respuesta controlados.
- Prototipado de asistentes conversacionales regionalizados: al fijar el dialecto en el prompt, se puede evaluar la naturalidad de respuestas en egipcio o magrebí antes de invertir en modelos mayores.
- Investigación en evaluación de diálogos: sirve como baseline reproducible (con el grader GPT-4o y las métricas ROUGE-L, BLEU y BERTScore) para comparar métodos de generación de diálogo dialectal.
- Generación de guiones conversacionales para medios y divulgación: la salida JSON estructurada facilita su integración en pipelines que convierten el diálogo en subtítulos, locuciones o viñetas para publicaciones.

## Benchmarks y rendimiento

Resultados sobre el split de test de ShawarmaChats (1.512 diálogos: 504 párrafos × 3 dialectos). Grader: valoración GPT-4o con la rúbrica del corpus, A = 4 … D = 1.

| Metrica | Base | ShawarmaChats LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,298 | 0,310 | +0,011 |
| BLEU | 0,101 | 0,194 | +0,093 |
| BERTScore F1 | 0,797 | 0,745 | -0,052 |
| Grader (1–4) | 1,058 | 1,389 | +0,332 |

Distribución de notas del grader tras el ajuste: A 17 · B 66 · C 400 · D 1014.

Por dialecto (base → fine-tuned):

| Dialecto | ROUGE-L | BLEU | BERTScore F1 | Grader (1–4) |
|---|---:|---:|---:|---:|
| Árabe estándar moderno | 0,269 → 0,330 | 0,091 → 0,198 | 0,783 → 0,781 | 1,127 → 1,394 |
| Egipcio | 0,310 → 0,364 | 0,096 → 0,234 | 0,804 → 0,788 | 1,042 → 1,328 |
| Magrebí | 0,316 → 0,235 | 0,118 → 0,151 | 0,802 → 0,665 | 1,004 → 1,446 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en bf16 requiere aproximadamente 6–7 GB de VRAM; en cuantización de 8 bits, alrededor de 3,5–4 GB; en 4 bits, alrededor de 2–2,5 GB (estimaciones estándar para un transformer de 3B; no verificadas en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090, RTX 3090 o RTX A6000 para desarrollo e inferencia local.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en bf16, y en tarjetas de 4–6 GB con cuantización.
- Opciones de despliegue: transformers + peft (con `merge_and_unload`), vLLM y TGI tras fusionar el adaptador; llama.cpp y Ollama requieren convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La evaluación usó `max_new_tokens=1024`, temperatura 0,8, top-p 0,95, top-k 50 y penalización por repetición 1,1.

## Comparativa con modelos similares

Comparación dentro de la familia ShawarmaChats, con la misma tarea y corpus:

| Modelo | Parametros | Grader base → fine-tuned | Licencia |
|---|---:|---:|---|
| ShawarmaChats-Llama-3.2-1B-Instruct-LoRA | 1B | 1,003 → 1,103 | llama3.2 |
| ShawarmaChats-Llama-3.2-3B-Instruct-LoRA (este) | 3B | 1,058 → 1,389 | llama3.2 |
| ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA | 7B | 1,186 → 3,302 | no disponible en la información proporcionada |
| ShawarmaChats-Llama-3.1-8B-Instruct-LoRA | 8B | no disponible en la información proporcionada | llama3.1 |

El adaptador de 3B ofrece una mejora clara sobre su base (Δ +0,332 en el grader) pero queda por debajo del adaptador sobre Mistral-7B (3,302), que es la opción de mayor calidad de la familia según el grader. Para comparaciones con modelos de diálogo árabe ajenos a ShawarmaChats, no hay datos en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (diálogo de seis turnos en JSON a partir de un párrafo); su rendimiento fuera de ese formato no está evaluado.
- El grader sigue siendo bajo en términos absolutos: 1.014 de 1.512 diálogos obtuvieron la nota mínima D, lo que indica calidad limitada en muchos casos.
- En magrebí, el ajuste degrada métricas de similitud superficial (ROUGE-L 0,316 → 0,235; BERTScore 0,802 → 0,665), aunque mejora la nota del grader (1,004 → 1,446); conviene validar la calidad dialectal con hablantes nativos.
- Riesgo de alucinación: aunque la tarea exige fidelidad al párrafo, el modelo puede introducir contenido no presente en la fuente; no se documentan mecanismos de verificación.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada; el corpus procede de Wikipedia en árabe y hereda sus sesgos de cobertura y representación.
- Cobertura idiomática limitada a árabe (MSA, egipcio y magrebí); el rendimiento en otras variedades dialectales no está evaluado.
- Licencia llama3.2: el uso comercial está sujeto a los términos de la licencia de Llama 3.2 y al modelo base, que está restringido (gated) y requiere aceptar sus condiciones y autenticarse con `huggingface-cli login`.
- El adaptador no es autónomo: requiere cargar el modelo base meta-llama/Llama-3.2-3B-Instruct y fusionarlo con PEFT antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-3B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset: https://huggingface.co/datasets/Kamyar-zeinalipour/arabic_multi_dialect_dialogue
- Paper (ArabicNLP 2025): https://aclanthology.org/2025.arabicnlp-main.39/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Shawarma-Chats
- Plantillas de prompt: https://github.com/KamyarZeinalipour/Shawarma-Chats/blob/main/pipeline/prompts.py
- Colección ShawarmaChats: https://huggingface.co/collections/Kamyar-zeinalipour/shawarmachats-arabicnlp-2025-6af4656eda045ed7cfc001d3
- Adaptador 1B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-1B-Instruct-LoRA
- Adaptador Mistral-7B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA
- Modelo base Mistral-7B-Instruct-v0.3: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
