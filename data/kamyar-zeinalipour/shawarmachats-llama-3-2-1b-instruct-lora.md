# Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-1B-Instruct-LoRA

## Resumen

ShawarmaChats-Llama-3.2-1B-Instruct-LoRA es un adaptador LoRA (PEFT) publicado por Kamyar-zeinalipour que ajusta el modelo base meta-llama/Llama-3.2-1B-Instruct para la generación de diálogos de seis turnos en árabe, fundamentados en párrafos de Wikipedia en árabe. El adaptador se entrena sobre el split de entrenamiento del corpus ShawarmaChats (28.500 diálogos: 9.500 párrafos × 3 dialectos), presentado junto con el artículo *Shawarma Chats* en ArabicNLP 2025. Dado un párrafo y un dialecto, el modelo produce un diálogo natural de dos hablantes en formato JSON que se mantiene fiel al contenido del párrafo fuente.

El modelo cubre tres variedades lingüísticas: árabe estándar moderno (MSA), árabe egipcio y árabe magrebí. La tarea es acotada y especializada: no se trata de un asistente generalista, sino de un generador de diálogos controlado por prompt, orientado a la creación de datos sintéticos de diálogo dialectal y a la investigación en procesamiento del árabe. Su relevancia radica en la escasez de recursos de diálogo multidiálecto y en la mejora medible que el ajuste aporta sobre el modelo base en métricas léxicas (ROUGE-L, BLEU) en el split de test de ShawarmaChats.

El adaptador es pequeño (1,1 GB) y se aplica sobre un modelo de 1B parámetros, por lo que es desplegable en hardware modesto. La licencia heredada es llama3.2, con las restricciones de uso que impone Meta para la familia Llama 3.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | 1B (modelo base); adaptador LoRA de 1,1 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2 1B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se usa en bf16) |
| Idiomas soportados | ar (árabe: estándar moderno, egipcio y magrebí) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.2-1B-Instruct, un transformer decoder-only de 1.000 millones de parámetros. El ajuste LoRA usa r = 64, α = 128 y dropout 0,1, aplicado a las proyecciones q/k/v/o, gate/up/down y también a `embed_tokens` y `lm_head`; esto último explica que el adaptador ocupe 1,1 GB, ya que PEFT almacena los pesos de embedding y de la cabeza de salida junto con el adaptador. El entrenamiento se realizó durante 3 épocas con AdamW, learning rate 1e-4, schedule coseno sin warm-up, weight decay 1e-4, precisión bf16, DeepSpeed ZeRO-3 y Flash Attention 2, con clipping de gradiente 1,0 y semilla 100. El batch fue de 2 secuencias por GPU con 2 pasos de acumulación, empaquetado a 3.500 tokens.

Los datos de entrenamiento son el split de entrenamiento de ShawarmaChats: 28.500 diálogos (9.500 párrafos × 3 dialectos), cada uno de seis turnos y anclado a un párrafo de Wikipedia en árabe, con la misma información renderizada en MSA, egipcio y magrebí. La tarea de entrenamiento es la generación del diálogo en JSON a partir de una instrucción de dialecto más el párrafo fuente, usando plantillas de prompt (`standard_prompt`, `egyptian_prompt`, `maghrebi_prompt`). No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre el corpus.

## Capacidades

- Generación de diálogos de seis turnos entre dos hablantes en formato JSON, condicionados a un párrafo fuente y a un dialecto.
- Producción de texto en árabe estándar moderno, árabe egipcio y árabe magrebí.
- Fidelidad al contenido del párrafo de entrada (diálogo fundamentado o *grounded*), que es el objetivo central del ajuste.
- Generación de datos sintéticos de diálogo dialectal para aumento de corpus y entrenamiento de otros modelos.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá de la generación de un diálogo completo.
- Capacidad multilingüe limitada al árabe en sus tres variedades indicadas; el modelo base soporta más idiomas, pero el adaptador está especializado en árabe.

## Casos de uso

- Generación de datos sintéticos de diálogo dialectal: dado un párrafo de Wikipedia en árabe, el modelo produce un diálogo de seis turnos en el dialecto elegido, útil para ampliar corpus de entrenamiento en egipcio y magrebí, variedades con pocos recursos.
- Investigación en procesamiento del árabe: reproducción de los experimentos del artículo ShawarmaChats y comparación de resultados con el modelo base y con otros adaptadores de la familia (3B, 7B, 8B).
- Creación de material conversacional para enseñanza de dialectos: a partir de un texto enciclopédico se obtiene un diálogo natural que ilustra vocabulario y giros del dialecto objetivo.
- Aumento de datos para ajuste de modelos mayores: los diálogos generados pueden filtrarse y reutilizarse para entrenar o evaluar modelos de diálogo en árabe.
- Evaluación de fidelidad y calidad de diálogo: el formato JSON estructurado facilita el cómputo automático de métricas como ROUGE-L, BLEU y BERTScore contra referencias.
- Prototipado de generación controlada por prompt en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1B, puede ejecutarse en GPU de consumo para pruebas rápidas de la tarea.

## Benchmarks y rendimiento

Resultados en el split de test de ShawarmaChats (1.512 diálogos: 504 párrafos × 3 dialectos). El grader es una calificación con GPT-4o según la rúbrica del corpus, con A = 4 y D = 1.

| Metrica | Base | ShawarmaChats LoRA | Δ |
|---|---:|---:|---:|
| ROUGE-L | 0,220 | 0,318 | +0,098 |
| BLEU | 0,088 | 0,198 | +0,111 |
| BERTScore F1 | 0,763 | 0,767 | +0,004 |
| Grader (1–4) | 1,003 | 1,103 | +0,100 |

Resultados por dialecto (base → ajustado):

| Dialecto | ROUGE-L | BLEU | BERTScore F1 | Grader (1–4) |
|---|---:|---:|---:|---:|
| Árabe estándar moderno | 0,196 → 0,270 | 0,072 → 0,159 | 0,755 → 0,730 | 1,010 → 1,048 |
| Egipcio | 0,239 → 0,376 | 0,095 → 0,241 | 0,772 → 0,817 | 1,000 → 1,056 |
| Magrebí | 0,226 → 0,308 | 0,096 → 0,195 | 0,763 → 0,755 | 1,000 → 1,206 |

Distribución de calificaciones del grader tras el ajuste: A 1 · B 4 · C 144 · D 1353.

## Requisitos de hardware

- El adaptador pesa 1,1 GB y se aplica sobre un modelo base de 1B parámetros, por lo que la inferencia en bf16 requiere del orden de 2–3 GB de VRAM para los pesos del modelo fusionado, más memoria para el contexto y el KV cache.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y superiores; también en GPUs de datacenter como A100 o H100 sin aprovechar su capacidad.
- El código de ejemplo usa `transformers` con `torch_dtype=torch.bfloat16`, `device_map="auto"` y `peft` con `merge_and_unload()` para fusionar el adaptador en el modelo base.
- El modelo base está restringido (gated): es necesario aceptar los términos en la página de meta-llama/Llama-3.2-1B-Instruct y ejecutar `huggingface-cli login`.
- Opciones de despliegue adicionales (vLLM, llama.cpp, Ollama, TGI) no se documentan en la información proporcionada para este adaptador.
- No se publican datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

Comparación con los otros adaptadores de la familia ShawarmaChats publicados en la misma colección (misma tarea y mismo corpus, distinto modelo base):

| Modelo | Parametros | Grader base → ajustado |
|---|---:|---:|
| ShawarmaChats-Llama-3.2-1B-Instruct-LoRA (este) | 1B | 1,003 → 1,103 |
| ShawarmaChats-Llama-3.2-3B-Instruct-LoRA | 3B | 1,058 → 1,389 |
| ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA | 7B | 1,186 → 3,302 |
| ShawarmaChats-Llama-3.1-8B-Instruct-LoRA | 8B | no disponible en la informacion proporcionada |

El adaptador de 1B es el de menor tamaño de la familia y el que obtiene la mejora más modesta en la calificación del grader, mientras que las variantes de 7B y 8B alcanzan puntuaciones notablemente superiores. La comparación con modelos de diálogo árabe ajenos a esta familia no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La calidad medida es baja en términos absolutos: la calificación media del grader tras el ajuste es 1,103 sobre 4, con 1.353 de 1.512 diálogos calificados como D. El modelo no debe considerarse un generador de diálogo de calidad de producción.
- El alcance es muy restringido: está especializado en la generación de diálogos de seis turnos fundamentados en un párrafo; no es un asistente conversacional general.
- El adaptador está entrenado únicamente para árabe en tres variedades; su uso en otros idiomas o en tareas distintas no está validado.
- Riesgo de alucinación y de deriva respecto al párrafo fuente: aunque el objetivo es la fidelidad, el BERTScore apenas mejora (+0,004) y en MSA y magrebí incluso empeora ligeramente respecto al base.
- La licencia llama3.2 impone las condiciones de uso de Meta para la familia Llama 3.2, incluida la política de uso aceptable; debe revisarse antes de cualquier uso comercial.
- El modelo base es de acceso restringido, lo que añade un paso de aceptación de términos y autenticación para su despliegue.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información proporcionada.
- El adaptador incluye pesos de `embed_tokens` y `lm_head`, por lo que debe cargarse con PEFT y fusionarse; no es un modelo autónomo listo para usar sin el base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-1B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Dataset: https://huggingface.co/datasets/Kamyar-zeinalipour/arabic_multi_dialect_dialogue
- Colección ShawarmaChats: https://huggingface.co/collections/Kamyar-zeinalipour/shawarmachats-arabicnlp-2025-6af4656eda045ed7cfc001d3
- Artículo (ArabicNLP 2025): https://aclanthology.org/2025.arabicnlp-main.39/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Shawarma-Chats
- Plantillas de prompt: https://github.com/KamyarZeinalipour/Shawarma-Chats/blob/main/pipeline/prompts.py
- Adaptador 3B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-3B-Instruct-LoRA
- Adaptador Mistral 7B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA
- Modelo base Mistral: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Modelo base Llama 3.1 8B: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
