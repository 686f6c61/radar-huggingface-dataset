# Kamyar-zeinalipour/ShawarmaChats-Mistral-Small-24B-Instruct-2501-LoRA

## Resumen

ShawarmaChats-Mistral-Small-24B-Instruct-2501-LoRA es un adaptador LoRA (PEFT) publicado por Kamyar Zeinalipour que especializa el modelo base Mistral-Small-24B-Instruct-2501 en la generación de diálogos de seis turnos en árabe. Concretamente, dado un párrafo de Wikipedia en árabe y un dialecto objetivo, el modelo produce un diálogo natural de dos hablantes en formato JSON que se mantiene fiel al contenido del párrafo fuente. Cubre tres variedades: árabe estándar moderno (MSA), árabe egipcio y árabe magrebí.

El adaptador se entrenó sobre el split de entrenamiento del corpus ShawarmaChats (28.500 diálogos, 9.500 párrafos por tres dialectos) y se publicó junto al artículo *Shawarma Chats* en ArabicNLP 2025. Es relevante porque aborda un problema poco cubierto: la generación controlada de diálogo en dialectos árabes con fidelidad factual a una fuente, una tarea en la que los modelos base multilingües rinden de forma notablemente peor, especialmente en magrebí.

El adaptador pesa 3,3 GB porque el LoRA se aplicó también a `embed_tokens` y `lm_head`, que PEFT almacena junto con el adaptador. La licencia declarada es Apache 2.0, aunque el modelo base Mistral-Small-24B-Instruct-2501 está sujeto a sus propios términos de acceso (gated) y a la licencia Apache 2.0 de Mistral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Mistral-Small-24B-Instruct-2501 |
| Parametros totales | 24B (modelo base); adaptador LoRA de 3,3 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se publica en safetensors; el base admite las cuantizaciones habituales de Mistral) |
| Idiomas soportados | ar (arabe estandar moderno, egipcio y magrebi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT; requiere fusion con el modelo base) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-Small-24B-Instruct-2501, un transformer decoder-only de 24.000 millones de parámetros. La configuración LoRA usa r = 64, α = 128 y dropout 0,1, con adaptadores en las proyecciones q/k/v/o, gate/up/down y también en `embed_tokens` y `lm_head`. El entrenamiento consistió en 3 épocas con AdamW, learning rate 1e-4, scheduler coseno sin warm-up, weight decay 1e-4, precisión bf16, DeepSpeed ZeRO-3, Flash Attention 2 y clipping de gradiente 1.0, con semilla 100. El batch fue de 2 secuencias por GPU con 2 pasos de acumulación, empaquetado a 3.500 tokens.

Los datos de entrenamiento son el split de entrenamiento de ShawarmaChats: 28.500 diálogos (9.500 párrafos de Wikipedia en árabe, cada uno renderizado en los tres dialectos). La tarea es de generación condicionada: el prompt contiene instrucciones específicas por dialecto y el párrafo fuente, y la salida esperada es un diálogo de seis turnos entre dos hablantes en JSON. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre el corpus.

## Capacidades

- Generación de diálogo multi-turno (seis turnos) entre dos hablantes a partir de un párrafo fuente.
- Generación en tres variedades de árabe: estándar moderno, egipcio y magrebí.
- Salida estructurada en JSON con los turnos del diálogo.
- Fidelidad al contenido del párrafo fuente (grounding en Wikipedia), evaluada mediante ROUGE-L, BLEU y BERTScore.
- Generación condicionada por dialecto mediante plantillas de prompt específicas (`standard_prompt`, `egyptian_prompt`, `maghrebi_prompt`).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Generación de material de entrenamiento para TTS y ASR en dialectos árabes: el modelo produce diálogos etiquetados por dialecto y con estructura JSON, lo que facilita su uso como corpus sintético para sistemas de voz en egipcio y magrebí, variedades con poca cobertura.
- Creación de contenido educativo y divulgativo en árabe dialectal: a partir de un artículo de Wikipedia se obtiene un diálogo explicativo de seis turnos, útil para pódcasts, guiones o material didáctico adaptado a cada variedad.
- Evaluación y benchmarking de modelos árabes: el adaptador sirve como referencia de la familia ShawarmaChats para comparar la calidad de diálogo dialectal de otros modelos sobre el mismo test split.
- Subtitulado y localización de diálogos: conversión de texto expositivo en conversaciones naturales por dialecto para doblaje o localización de contenidos hacia mercados egipcio y magrebí.
- Investigación en dialectología computacional: generación controlada de la misma información en tres variedades permite estudiar diferencias léxicas y sintácticas entre MSA, egipcio y magrebí con pares alineados.
- Prototipado de asistentes conversacionales regionales: el adaptador puede integrarse en un pipeline de generación de respuestas con estilo dialectal, siempre que el caso de uso tolere la naturaleza sintética del diálogo y se valide la fidelidad factual.

## Benchmarks y rendimiento

Resultados sobre el test split de ShawarmaChats (1.512 diálogos: 504 párrafos por 3 dialectos). El grader es una evaluación con GPT-4o según la rúbrica del corpus, con escala A = 4 a D = 1.

| Metrica | Base | LoRA ShawarmaChats | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,413 | 0,443 | +0,030 |
| BLEU | 0,257 | 0,287 | +0,029 |
| BERTScore F1 | 0,838 | 0,857 | +0,019 |
| Grader (1-4) | 1,854 | 3,607 | +1,753 |

Distribución de notas del grader tras el ajuste: A 1068, B 302, C 131, D 10.

Por dialecto (base → ajustado):

| Dialecto | ROUGE-L | BLEU | BERTScore F1 | Grader (1-4) |
|---|---:|---:|---:|---:|
| Estandar moderno | 0,391 → 0,408 | 0,238 → 0,257 | 0,819 → 0,840 | 2,677 → 3,355 |
| Egipcio | 0,426 → 0,461 | 0,267 → 0,301 | 0,850 → 0,870 | 1,756 → 3,594 |
| Magrebi | 0,422 → 0,458 | 0,267 → 0,302 | 0,845 → 0,863 | 1,129 → 3,871 |

## Requisitos de hardware

- El adaptador requiere cargar el modelo base completo de 24B en bf16, lo que implica aproximadamente 48 GB de VRAM solo para pesos, más memoria para el contexto y el adaptador fusionado.
- GPU recomendadas para bf16 sin cuantizar: A100 80 GB, H100 80 GB o varias GPU con `device_map="auto"`. Una RTX 4090 de 24 GB no es suficiente para el modelo completo en bf16.
- En consumer GPU solo es viable mediante cuantización del modelo base (por ejemplo 4-bit), no documentada en la información proporcionada para este adaptador.
- Opciones de despliegue: `transformers` + `peft` con `merge_and_unload()` es el flujo documentado; el adaptador fusionado puede servirse con vLLM o TGI, aunque estas integraciones no se detallan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con otros adaptadores de la misma familia ShawarmaChats, según la model card:

| Modelo base | Parametros | Grader base → ajustado |
|---|---:|---:|
| Llama-3.2-1B-Instruct | 1B | 1,003 → 1,103 |
| Llama-3.2-3B-Instruct | 3B | 1,058 → 1,389 |
| Mistral-7B-Instruct-v0.3 | 7B | 1,186 → no disponible en la informacion proporcionada |
| Mistral-Small-24B-Instruct-2501 | 24B | 1,854 → 3,607 |

El adaptador de 24B es el de mayor puntuación de la familia en el grader, con una mejora absoluta de 1,753 puntos frente al base. No se dispone de comparación con adaptadores externos a ShawarmaChats en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (generación de diálogo de seis turnos a partir de un párrafo) y en tres dialectos; fuera de ese dominio su comportamiento no está caracterizado.
- Riesgo de alucinación: aunque se evalúa la fidelidad al párrafo fuente, no hay garantía de que todos los turnos se mantengan estrictamente anclados al contenido original, especialmente en generaciones largas.
- La evaluación se basa en un grader automático con GPT-4o y en métricas de solapamiento (ROUGE-L, BLEU, BERTScore), que no sustituyen una validación humana sistemática.
- El modelo base es gated: es necesario aceptar sus términos en Hugging Face y autenticarse con `huggingface-cli login` antes de cargarlo.
- La licencia del adaptador es Apache 2.0, pero el uso comercial está condicionado por los términos del modelo base Mistral-Small-24B-Instruct-2501.
- El adaptador incluye pesos de `embed_tokens` y `lm_head`, lo que eleva el tamaño a 3,3 GB y obliga a fusionarlo con el base antes de servir.
- Cobertura dialectal limitada a MSA, egipcio y magrebí; otras variedades del árabe no están contempladas.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Mistral-Small-24B-Instruct-2501-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Dataset: https://huggingface.co/datasets/Kamyar-zeinalipour/arabic_multi_dialect_dialogue
- Articulo (ArabicNLP 2025): https://aclanthology.org/2025.arabicnlp-main.39/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Shawarma-Chats
- Plantillas de prompt: https://github.com/KamyarZeinalipour/Shawarma-Chats/blob/main/pipeline/prompts.py
- Coleccion ShawarmaChats: https://huggingface.co/collections/Kamyar-zeinalipour/shawarmachats-arabicnlp-2025-6af4656eda045ed7cfc001d3
- Adaptador Llama-3.2-1B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-1B-Instruct-LoRA
- Adaptador Llama-3.2-3B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-3B-Instruct-LoRA
- Adaptador Mistral-7B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA
