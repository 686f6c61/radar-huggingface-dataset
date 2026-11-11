# Kamyar-zeinalipour/TalkFa-WikiFaDial-Llama-3.2-1B-Instruct-LoRA

## Resumen

TalkFa-WikiFaDial-Llama-3.2-1B-Instruct-LoRA es un adaptador LoRA (PEFT) sobre el modelo instructivo Llama-3.2-1B-Instruct de Meta, desarrollado por Kamyar Zeinalipour y colaboradores en el marco del benchmark TalkFa. Su función concreta es generar diálogos casuales de seis turnos en persa (farsi) a partir de un párrafo de Wikipedia en farsi, manteniéndose fiel al contenido del párrafo y devolviendo la conversación estructurada en JSON. Resuelve, por tanto, una tarea muy acotada de generación de diálogo fundamentada en conocimiento (knowledge-grounded dialogue) para un idioma con recursos limitados como el persa.

El adaptador se entrenó sobre el split de entrenamiento Wiki-FaDial de TalkFa, compuesto por 4.084 diálogos verificados por humanos, y se publica junto al paper "TalkFa: A Unified Benchmark for Farsi Dialogue Generation and Understanding" (arXiv:2609.01810). La relevancia actual reside en que proporciona una referencia reproducible y ligera (1B parámetros) para una tarea de generación de diálogo en persa, con métricas publicadas frente al modelo base, y forma parte de una familia de adaptadores que cubren distintos tamaños (1B, 3B, 7B, 8B, 12B y 24B) y dos tareas (generación Wiki-FaDial y análisis de sentimiento PlayDial-Fa).

Al ser un adaptador y no un modelo completo, hereda la arquitectura, el tokenizador y la ventana de contexto de Llama-3.2-1B-Instruct, y su licencia efectiva es la Llama 3.2 Community License del modelo base. El repositorio ocupa aproximadamente 1,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-1B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 1B (modelo base); tamaño del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-3.2-1B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite las cuantizaciones habituales de Llama-3.2) |
| Idiomas soportados | Persa (farsi, `fa`) como idioma objetivo; el base es multilingüe |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); se puede fusionar con el base mediante `merge_and_unload()` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Llama-3.2-1B-Instruct, un transformer decoder-only de 1.000 millones de parámetros con atención causal estándar y tokenizador propio de la familia Llama 3. El adaptador añade matrices de bajo rango sobre las proyecciones del modelo base; en el ejemplo de uso se fusiona con `merge_and_unload()`, lo que produce un modelo denso equivalente de 1B parámetros. No se especifican en la información disponible el rango, el alpha ni las capas objetivo del LoRA.

El entrenamiento se realizó sobre el split Wiki-FaDial de TalkFa (4.084 diálogos), una tarea de generación de diálogo de seis turnos entre dos hablantes a partir de un párrafo de Wikipedia en farsi, con salida en JSON y restricción de fidelidad al párrafo fuente. No se detallan en la model card el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO; la configuración de entrenamiento se remite al fichero `configs/train_generation.json` del repositorio GitHub del proyecto. La innovación destacable es metodológica: un benchmark verificado por humanos y una familia de adaptadores comparables a distintos tamaños para una misma tarea en persa.

## Capacidades

- Generación de diálogo casual de seis turnos en persa entre dos hablantes, a partir de un párrafo de Wikipedia en farsi.
- Generación condicionada a conocimiento (knowledge-grounded): el diálogo debe mantenerse fiel al párrafo de entrada.
- Salida estructurada en JSON con los turnos del diálogo.
- Generación de texto instructivo heredada del modelo base Llama-3.2-1B-Instruct (chat template, roles system/user/assistant).
- Capacidad multilingüe residual del base, aunque el adaptador está especializado en persa.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Generación de material de diálogo para aprendizaje de persa: dado un artículo de Wikipedia en farsi, el adaptador produce una conversación de seis turnos que ilustra el contenido en registro coloquial, útil para crear ejercicios de comprensión y vocabulario.
- Aumento de datos para entrenamiento de modelos de diálogo en persa: el adaptador puede generar diálogos sintéticos fieles a párrafos fuente, ampliando corpus escasos en este idioma con salida JSON directamente parseable.
- Evaluación de sistemas de diálogo fundamentado: al formar parte del benchmark TalkFa, sirve como referencia reproducible para medir fidelidad al contexto y calidad de diálogo en persa con métricas ROUGE-L, BLEU-4 y BERTCos.
- Prototipado rápido de asistentes conversacionales en persa: con 1B parámetros y despliegue en una sola GPU consumer, permite iterar sobre prompts y plantillas de chat sin infraestructura pesada.
- Investigación comparativa de adaptadores LoRA: la familia TalkFa ofrece el mismo adaptador sobre bases de 1B a 24B, lo que facilita estudiar el efecto del tamaño del modelo base en una tarea fija.
- Generación de contenido editorial conversacional: a partir de un párrafo enciclopédico se obtiene un diálogo divulgativo en persa que puede revisarse y publicarse en blogs o redes, con la fidelidad al texto fuente como restricción principal.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test set Wiki-FaDial (100 diálogos). BERTCos es la similitud coseno de embeddings ParsBERT (bert-fa-base) con mean pooling.

| Metrica | Base | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0.449 | 0.650 | +0.201 |
| BLEU-4 | 0.322 | 0.572 | +0.250 |
| BERTCos | 0.824 | 0.959 | +0.135 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el modelo fusionado de 1B parámetros requiere aproximadamente 2-3 GB de VRAM para los pesos, más memoria para el contexto y el KV cache; en cuantización de 8 bits, en torno a 1,5 GB, y en 4 bits, alrededor de 1 GB (estimaciones según el tamaño del base, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna con 6 GB o más; también es viable en CPU para inferencia no interactiva.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor), `vLLM` o `TGI` tras fusionar el adaptador, y `llama.cpp`/`Ollama` si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; con 1B parámetros se espera una latencia baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

La comparativa más directa es con los otros adaptadores Wiki-FaDial de la misma familia TalkFa, que comparten tarea, dataset y metodología pero difieren en el modelo base.

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|
| TalkFa-WikiFaDial-Llama-3.2-1B-Instruct-LoRA (este) | 1B | Generación Wiki-FaDial | llama3.2 | Hugging Face |
| TalkFa-WikiFaDial-Llama-3.2-3B-Instruct-LoRA | 3B | Generación Wiki-FaDial | llama3.2 | Hugging Face |
| TalkFa-WikiFaDial-Mistral-7B-Instruct-v0.3-LoRA | 7B | Generación Wiki-FaDial | no disponible | Hugging Face |
| TalkFa-WikiFaDial-Llama-3.1-8B-Instruct-LoRA | 8B | Generación Wiki-FaDial | llama3.1 | Hugging Face |
| TalkFa-WikiFaDial-Mistral-Nemo-Instruct-2407-LoRA | 12B | Generación Wiki-FaDial | no disponible | Hugging Face |
| TalkFa-WikiFaDial-Mistral-Small-24B-Instruct-2501-LoRA | 24B | Generación Wiki-FaDial | no disponible | Hugging Face |

No se dispone de métricas comparativas entre estos adaptadores en la información proporcionada, salvo las del 1B frente a su base. Tampoco se han identificado en la información disponible modelos comparables externos a la familia TalkFa para esta tarea específica.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado únicamente para generar diálogos de seis turnos en persa a partir de párrafos de Wikipedia; su uso fuera de esa tarea puede degradar el comportamiento del base.
- Riesgo de alucinación: aunque la tarea exige fidelidad al párrafo fuente, no hay garantía formal de que todos los turnos se mantengan fieles; conviene validar la salida en producción.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al derivar de Llama-3.2 y de Wikipedia en farsi, puede heredar sesgos de ambas fuentes.
- Limitaciones de idioma: el adaptador está orientado a persa; su rendimiento en otros idiomas no está evaluado y probablemente sea inferior al del base sin adaptar.
- Restricciones de licencia: la licencia es la Llama 3.2 Community License, que impone condiciones de uso comercial, atribución y restricciones de uso aceptable; el modelo base está gated y requiere aceptar sus términos y autenticarse con `huggingface-cli login`.
- Dependencia del modelo base: no es un modelo autónomo; requiere descargar Llama-3.2-1B-Instruct y fusionar el adaptador, lo que añade pasos de despliegue.
- Madurez: el repositorio no registra descargas ni likes en el momento de la consulta y la validación se limita a 100 diálogos de test, por lo que la evidencia empírica es acotada.
- Salida JSON: el formato estructurado puede requerir post-procesado o validación de esquema para garantizar su parseabilidad en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/TalkFa-WikiFaDial-Llama-3.2-1B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Paper (arXiv): https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Colección TalkFa: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Adaptador de sentimiento emparejado (PlayDial-Fa, 1B): https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Llama-3.2-1B-Instruct-LoRA
