# Kamyar-zeinalipour/TalkFa-WikiFaDial-Mistral-Small-24B-Instruct-2501-LoRA

## Resumen

TalkFa-WikiFaDial-Mistral-Small-24B-Instruct-2501-LoRA es un adaptador LoRA (PEFT) publicado por Kamyar Zeinalipour que se aplica sobre el modelo base Mistral-Small-24B-Instruct-2501. Su tarea es muy concreta: generar un diálogo coloquial de seis turnos en farsi (persa) entre dos hablantes a partir de un parrafo de Wikipedia en farsi, manteniendo fidelidad al parrafo de origen y devolviendo la salida en formato JSON. No es un modelo generalista, sino un ajuste especializado para una tarea de generacion de dialogo fundamentada en conocimiento (knowledge-grounded dialogue).

El adaptador se entrena sobre el split de entrenamiento de Wiki-FaDial (4.084 dialogos) del benchmark TalkFa, presentado en el paper "TalkFa: A Unified Benchmark for Farsi Dialogue Generation and Understanding" (arXiv:2609.01810). El repo pesa 2,9 GB y contiene unicamente los pesos del adaptador en safetensors, no el modelo base completo, que debe descargarse por separado y esta sujeto a gating en Hugging Face.

Su relevancia es doble: por un lado cubre una laguna en recursos para farsi, un idioma con poca representacion en benchmarks de dialogo; por otro, forma parte de una familia de adaptadores TalkFa para distintos modelos base (de 1B a 24B), lo que permite comparar el efecto del tamano del modelo base en la misma tarea. La licencia del adaptador es Apache 2.0, aunque el uso queda condicionado por la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Mistral-Small-24B-Instruct-2501 |
| Parametros totales | 24B (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | farsi (fa) |
| Licencia | Apache 2.0 (adaptador); el modelo base tiene sus propios terminos |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre Mistral-Small-24B-Instruct-2501, un transformer decoder-only de 24.000 millones de parametros. El adaptador no modifica la arquitectura del modelo base: anade matrices de bajo rango en las capas que el script de entrenamiento determine. La configuracion exacta de entrenamiento (rango, alpha, capas objetivo, hiperparametros) esta en `configs/train_generation.json` del repositorio GitHub de TalkFa, pero no se detalla en la model card.

El entrenamiento se realiza sobre el split de train de Wiki-FaDial, con 4.084 dialogos, cada uno compuesto por un parrafo de Wikipedia en farsi y un dialogo de seis turnos entre dos hablantes. La tarea es de generacion condicionada: dado el parrafo y el historial de turnos previos, el modelo debe producir el siguiente turno o el dialogo completo en JSON, manteniendo fidelidad al contenido del parrafo. No se documenta en la informacion disponible si hubo RLHF, DPO u otras tecnicas de alineacion adicionales mas alla del ajuste supervisado. La evaluacion se realiza sobre 100 dialogos del split de test, con metricas ROUGE-L, BLEU-4 y BERTCos (similitud coseno de embeddings medios de ParsBERT, bert-fa-base).

## Capacidades

- Generacion de dialogo coloquial en farsi de seis turnos entre dos hablantes a partir de un parrafo de Wikipedia.
- Fidelidad al parrafo de origen (knowledge grounding): el dialogo debe reflejar el contenido del texto fuente.
- Salida estructurada en JSON, lo que facilita su integracion en pipelines.
- Generacion condicionada por historial de conversacion (chat template de Mistral aplicado sobre los mensajes previos).
- Capacidad multilingue limitada al farsi en la tarea ajustada; el modelo base conserva sus capacidades originales, pero el adaptador no las ha sido evaluado en otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en el adaptador.

## Casos de uso

- Generacion de corpus sinteticos de dialogo en farsi: el adaptador puede producir dialogos verosimiles a partir de articulos de Wikipedia para aumentar datos de entrenamiento de modelos de dialogo en persa, con fidelidad al contenido fuente verificable.
- Evaluacion de modelos de dialogo en farsi: al formar parte de la familia TalkFa, permite generar respuestas de referencia y comparar sistemas sobre el benchmark Wiki-FaDial.
- Creacion de material conversacional educativo: a partir de un articulo enciclopedico en farsi, generar un dialogo de seis turnos que explique el contenido de forma coloquial, util para recursos didacticos o de aprendizaje de idioma.
- Investigacion en knowledge-grounded dialogue: el adaptador sirve como sistema de referencia para estudiar como el tamano del modelo base (1B a 24B) afecta a la fidelidad y calidad del dialogo generado.
- Prototipado de asistentes conversacionales en persa: el formato JSON de salida y el chat template permiten integrar el adaptador en un backend de generacion de respuestas con contexto documental.
- Generacion de variantes de dialogo para aumento de datos: dado un mismo parrafo, producir multiples dialogos con temperatura y top-p distintos para diversificar el corpus de entrenamiento.
- Analisis de sesgos y calidad en farsi: el adaptador permite estudiar como un modelo base grande, ajustado con pocos datos, reproduce o corrige sesgos presentes en el corpus de Wikipedia.

## Benchmarks y rendimiento

Resultados sobre el test set de Wiki-FaDial (100 dialogos), segun la model card. BERTCos es la similitud coseno de embeddings medios de ParsBERT (bert-fa-base).

| Metrica | Base (Mistral-Small-24B-Instruct-2501) | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,546 | 0,687 | +0,141 |
| BLEU-4 | 0,434 | 0,617 | +0,184 |
| BERTCos | 0,919 | 0,972 | +0,052 |

No se han publicado en la informacion disponible resultados comparativos frente a los otros adaptadores TalkFa (Llama-3.2-1B/3B, Mistral-7B, Llama-3.1-8B, Mistral-Nemo-12B) ni frente a modelos de referencia externos.

## Requisitos de hardware

- El adaptador en si ocupa 2,9 GB en disco, pero requiere cargar el modelo base Mistral-Small-24B-Instruct-2501 en memoria.
- En bfloat16, el modelo base de 24B requiere aproximadamente 48 GB de VRAM solo para pesos, mas overhead de activaciones y KV cache; en la practica se necesitan GPU de 80 GB (A100, H100) para inferencia comoda con contexto largo.
- En cuantizacion de 8 bits, el modelo base baja a unos 24 GB, lo que permite ejecutarlo en una RTX 4090 (24 GB) con margen ajustado.
- En cuantizacion de 4 bits, el modelo base ocupa unos 12-14 GB, por lo que cabe en GPUs consumer de 16 GB (RTX 4080, RTX 4060 Ti 16GB) y en 24 GB (RTX 3090, RTX 4090) con holgura.
- El adaptador se puede fusionar con `merge_and_unload()` y despues cuantizar; tambien se puede aplicar sobre un modelo base ya cuantizado si el formato lo permite.
- Opciones de despliegue: transformers + PEFT (el flujo documentado en la model card), vLLM y TGI para el modelo fusionado, llama.cpp/Ollama si se convierte a GGUF tras la fusion. La model card solo documenta el flujo con transformers y PEFT.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

La model card lista una familia de adaptadores TalkFa para la misma tarea, lo que permite una comparativa directa por tamano de modelo base.

| Modelo | Parametros base | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|
| TalkFa-WikiFaDial-Mistral-Small-24B-Instruct-2501-LoRA (este) | 24B | Wiki-FaDial generacion | Apache 2.0 (adaptador) | Hugging Face |
| TalkFa-WikiFaDial-Mistral-Nemo-Instruct-2407-LoRA | 12B | Wiki-FaDial generacion | no disponible | Hugging Face |
| TalkFa-WikiFaDial-Llama-3.1-8B-Instruct-LoRA | 8B | Wiki-FaDial generacion | no disponible | Hugging Face |
| TalkFa-WikiFaDial-Mistral-7B-Instruct-v0.3-LoRA | 7B | Wiki-FaDial generacion | no disponible | Hugging Face |
| TalkFa-WikiFaDial-Llama-3.2-3B-Instruct-LoRA | 3B | Wiki-FaDial generacion | no disponible | Hugging Face |
| TalkFa-WikiFaDial-Llama-3.2-1B-Instruct-LoRA | 1B | Wiki-FaDial generacion | no disponible | Hugging Face |

No se dispone de resultados de benchmarks de los adaptadores de menor tamano en la informacion proporcionada, por lo que no es posible comparar rendimiento numerico entre ellos. Tampoco se comparan con modelos generalistas de farsi ajenos a la familia TalkFa.

## Limitaciones y advertencias

- El adaptador esta especializado exclusivamente en la tarea Wiki-FaDial: generar dialogos de seis turnos en farsi a partir de un parrafo de Wikipedia. Fuera de ese dominio su comportamiento no esta garantizado.
- El modelo base Mistral-Small-24B-Instruct-2501 esta gated en Hugging Face: es necesario aceptar sus terminos y autenticarse con `huggingface-cli login` antes de usarlo.
- La licencia Apache 2.0 del adaptador no exime de cumplir la licencia y terminos del modelo base.
- Riesgo de alucinacion: aunque la tarea exige fidelidad al parrafo, el modelo puede introducir contenido no presente en la fuente, especialmente con temperatura alta.
- El corpus de entrenamiento son 4.084 dialogos derivados de Wikipedia en farsi, lo que puede introducir sesgos de cobertura tematica y de estilo propios de la enciclopedia.
- El soporte linguistico del adaptador se limita al farsi; no se ha evaluado en otros idiomas.
- No se documentan en la informacion disponible las longitudes de contexto efectivas, la configuracion exacta de LoRA ni los hiperparametros de entrenamiento, que deben consultarse en el repositorio GitHub.
- No se han publicado resultados de benchmarks frente a los adaptadores hermanos de la familia TalkFa, lo que limita la comparacion por tamano.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/TalkFa-WikiFaDial-Mistral-Small-24B-Instruct-2501-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Paper (arXiv): https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Coleccion TalkFa: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Configuracion de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_generation.json
- Adaptador de sentimiento asociado: https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-Small-24B-Instruct-2501-LoRA
