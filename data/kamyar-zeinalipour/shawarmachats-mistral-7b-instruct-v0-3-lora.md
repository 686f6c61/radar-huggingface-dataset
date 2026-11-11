# Kamyar-zeinalipour/ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA

## Resumen
ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA es un adaptador LoRA (PEFT) para el modelo base Mistral-7B-Instruct-v0.3, desarrollado por Kamyar Zeinalipour y publicado junto al articulo "Shawarma Chats" en ArabicNLP 2025. Su proposito concreto es la generacion de dialogos de seis turnos entre dos hablantes, anclados a un parrafo de Wikipedia en arabe, en tres variedades linguisticas: arabe estandar moderno (MSA), arabe egipcio y arabe magrebi. Dado un parrafo y un dialecto, el modelo produce un dialogo natural en formato JSON fiel al contenido fuente.

El modelo no es un LLM autonomo, sino un adaptador que debe combinarse con el modelo base de 7B parametros de Mistral AI. El adaptador ocupa 0,8 GB porque el LoRA se aplico tambien a `embed_tokens` y `lm_head`, ademas de las proyecciones de atencion y las capas feed-forward. Esto lo hace util para equipos que ya dispongan del base model y quieran anadir capacidades de generacion de dialogo dialectal arabe sin reentrenar desde cero.

Su relevancia actual radica en la escasez de recursos abiertos para dialectos arabes en tareas de dialogo controlado y anclado a fuente. El salto medido frente al base model en la metrica de evaluacion con GPT-4o (de 1,186 a 3,302 sobre 4) y en ROUGE-L (de 0,304 a 0,443) es sustancial, y el modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.3) con adaptador LoRA |
| Parametros totales | 7B (modelo base); adaptador LoRA de 0,8 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base model) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se entrena en bf16) |
| Idiomas soportados | Arabe (MSA, egipcio, magrebi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only de 7B parametros. El LoRA usa r = 64, alpha = 128 y dropout 0,1, y se aplica a las proyecciones q/k/v/o, gate/up/down y tambien a `embed_tokens` y `lm_head`. Este ultimo detalle explica el tamano de 0,8 GB del adaptador y permite ajustar el vocabulario y la cabeza de salida al dominio dialectal.

El entrenamiento se realizo sobre el split de entrenamiento del dataset ShawarmaChats: 28.500 dialogos (9.500 parrafos x 3 dialectos). Se usaron 3 epocas con AdamW, learning rate 1e-4, scheduler coseno sin warm-up, weight decay 1e-4, precision bf16, DeepSpeed ZeRO-3, Flash Attention 2 y gradient clipping de 1,0, con semilla 100. El batch fue de 2 secuencias por GPU con 2 pasos de acumulacion, empaquetado a 3.500 tokens. En evaluacion se empleo decodificacion con temperatura 0,8, top-p 0,95, top-k 50, penalizacion de repeticion 1,1 y un maximo de 1.024 tokens nuevos.

## Capacidades
- Generacion de dialogos de seis turnos entre dos hablantes en formato JSON.
- Fidelidad al parrafo fuente: el dialogo se ancla a un texto de Wikipedia en arabe.
- Generacion en tres variedades: arabe estandar moderno, egipcio y magrebi.
- Control de dialecto mediante prompt (plantillas `standard_prompt`, `egyptian_prompt`, `maghrebi_prompt`).
- Generacion de texto en arabe en general, heredada del base model.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion proporcionada.

## Casos de uso
- Generacion de corpus de dialogo dialectal para investigacion en NLP arabe: dado un parrafo de Wikipedia y un dialecto, el modelo produce dialogos etiquetados y anclados a fuente, utiles para aumentar datasets de entrenamiento.
- Creacion de material conversacional para ensenanza de arabes: se puede transformar contenido enciclopedico en dialogos naturales en MSA, egipcio o magrebi para ejercicios de comprension y practica dialectal.
- Aumento de datos para entrenar modelos de dialogo arabe: el modelo genera variantes de dialogo sobre los mismos parrafos, ampliando la cobertura dialectal de corpus existentes.
- Prototipado de asistentes conversacionales en dialecto: el adaptador permite experimentar con respuestas en egipcio o magrebi sobre un base model de 7B, sin necesidad de entrenar desde cero.
- Evaluacion de fidelidad y naturalidad en generacion de dialogo: sirve como baseline fuerte para comparar metodos de generacion anclada a fuente en dialectos arabes.
- Investigacion sobre adaptacion dialectal con LoRA: el adaptador documenta una receta reproducible (r=64, alpha=128, ajuste de embeddings y lm_head) que puede replicarse sobre otros modelos base.

## Benchmarks y rendimiento
Resultados sobre el split de test de ShawarmaChats (1.512 dialogos: 504 parrafos x 3 dialectos). El grader es una evaluacion con GPT-4o usando la rubrica del corpus, donde A = 4 y D = 1.

| Metrica | Base | ShawarmaChats LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,304 | 0,443 | +0,139 |
| BLEU | 0,182 | 0,286 | +0,104 |
| BERTScore F1 | 0,767 | 0,856 | +0,089 |
| Grader (1-4) | 1,186 | 3,302 | +2,115 |

Distribucion de ratings del modelo fine-tuned: A 791, B 408, C 291, D 22.

Resultados por dialecto (base -> fine-tuned):

| Dialecto | ROUGE-L | BLEU | BERTScore F1 | Grader (1-4) |
|---|---:|---:|---:|---:|
| Arabe estandar moderno | 0,248 -> 0,408 | 0,142 -> 0,256 | 0,698 -> 0,838 | 1,414 -> 3,058 |
| Egipcio | 0,337 -> 0,462 | 0,204 -> 0,300 | 0,803 -> 0,868 | 1,144 -> 3,242 |
| Magrebi | 0,327 -> 0,459 | 0,200 -> 0,302 | 0,799 -> 0,861 | 1,002 -> 3,605 |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de 7B en bf16, se requiere aproximadamente 14-16 GB de VRAM para los pesos, mas memoria para el contexto y el adaptador.
- GPU recomendadas: A100, H100 o GPUs consumer con al menos 16-24 GB de VRAM (por ejemplo, RTX 4090 o RTX 3090) para inferencia en bf16.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas de VRAM en bf16; con cuantizacion de 8 bits o 4 bits podria caber en GPUs de menor capacidad, aunque no se documentan recetas de cuantizacion en la informacion proporcionada.
- Opciones de despliegue: transformers + PEFT (receta oficial de la model card), con `merge_and_unload()` para fusionar el adaptador. No se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
Comparativa dentro de la propia familia ShawarmaChats, que comparte tarea y dataset:

| Modelo base | Parametros | Adaptador | Grader base -> fine-tuned |
|---|---:|---|---:|
| Llama-3.2-1B-Instruct | 1B | ShawarmaChats-Llama-3.2-1B-Instruct-LoRA | 1,003 -> 1,103 |
| Llama-3.2-3B-Instruct | 3B | ShawarmaChats-Llama-3.2-3B-Instruct-LoRA | 1,058 -> 1,389 |
| Mistral-7B-Instruct-v0.3 | 7B | ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA (este modelo) | 1,186 -> 3,302 |
| Llama-3.1-8B-Instruct | 8B | ShawarmaChats-Llama-3.1-8B-Instruct-LoRA | no disponible en la informacion proporcionada |

Frente a alternativas fuera de la familia (por ejemplo, otros modelos de 7-8B ajustados para arabe), no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias
- El modelo esta especializado en una unica tarea: generacion de dialogos de seis turnos anclados a un parrafo. No es un asistente generalista.
- Solo cubre tres variedades de arabe; no se documenta soporte de otros idiomas ni de otros dialectos arabes (por ejemplo, levantino o del Golfo).
- Riesgo de alucinacion: aunque el objetivo es la fidelidad al parrafo fuente, no se documentan medidas de verificacion automatica de fidelidad en produccion.
- El adaptador requiere el modelo base Mistral-7B-Instruct-v0.3, que esta gated en Hugging Face y exige aceptar sus terminos e iniciar sesion.
- La evaluacion se basa en un grader con GPT-4o y metricas n-grama (ROUGE-L, BLEU) y BERTScore; no se reportan evaluaciones humanas en la informacion proporcionada.
- Licencia Apache 2.0 en el adaptador, pero el uso del modelo base queda sujeto a la licencia de Mistral AI.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Dataset: https://huggingface.co/datasets/Kamyar-zeinalipour/arabic_multi_dialect_dialogue
- Paper (ArabicNLP 2025): https://aclanthology.org/2025.arabicnlp-main.39/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Shawarma-Chats
- Plantillas de prompt: https://github.com/KamyarZeinalipour/Shawarma-Chats/blob/main/pipeline/prompts.py
- Coleccion ShawarmaChats: https://huggingface.co/collections/Kamyar-zeinalipour/shawarmachats-arabicnlp-2025-6af4656eda045ed7cfc001d3
- Adaptador Llama-3.2-1B-Instruct: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-1B-Instruct-LoRA
- Adaptador Llama-3.2-3B-Instruct: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-3B-Instruct-LoRA
