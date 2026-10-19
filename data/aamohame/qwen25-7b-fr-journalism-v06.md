# aamohame/qwen25-7b-fr-journalism-v06

## Resumen

`qwen25-7b-fr-journalism-v06` es un adaptador LoRA, no un modelo independiente, publicado por aamohame sobre `Qwen/Qwen2.5-7B-Instruct`. Está especializado en francés para titulares informativos, edición de copia y respuesta a preguntas fundamentada en contexto. El repositorio contiene únicamente los pesos del adaptador PEFT (0,1 GB), por lo que requiere cargar el modelo base de 7B.

El ajuste se realizó con QLoRA de 4 bits NF4, rango 16, alpha 32 y dropout 0,05 sobre 600 ejemplos curados: 180 titulares de Wikinews, 120 ejemplos de edición de Alpaca y 300 de QA de PIAF. Se usaron 510 ejemplos para entrenamiento y 90 para validación; el entrenamiento duró 9,6 minutos en dos Tesla T4.

Su interés práctico está en ser un adaptador pequeño y reproducible para tareas editoriales concretas en francés, con resultados de validación limitados a las tareas de entrenamiento. La licencia no está publicada y no hay benchmarks estándar ni validación comunitaria (0 descargas, 0 likes), así que debe evaluarse antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-7B-Instruct); el repositorio contiene un adaptador LoRA, no pesos completos |
| Parámetros totales | 7B en el modelo base; tamaño exacto del adaptador no disponible (repo de 0,1 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la longitud máxima de secuencia usada en entrenamiento fue de 1536 tokens |
| Tipos de cuantización | Entrenamiento con 4-bit NF4 y doble cuantización; el adaptador se distribuye en safetensors. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Francés (según etiquetas y datos de entrenamiento); otros idiomas no evaluados |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen2.5-7B-Instruct |

## Arquitectura y entrenamiento

El adaptador no modifica la arquitectura del modelo base: aplica matrices LoRA de rango 16 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de Qwen2.5-7B-Instruct. El entrenamiento usó cuantización 4-bit NF4 con doble cuantización y cómputo en `torch.float16`, optimizador AdamW, learning rate `2.5e-05`, scheduler cosine, warmup de 2 actualizaciones (5%), batch efectivo 16 (1 por GPU, acumulación 8, 2 GPUs), una época y semilla 42. No se documenta RLHF ni DPO adicional; el punto de partida es un modelo instruct.

Los datos de entrenamiento son 600 ejemplos curados: 180 titulares filtrados de French Wikinews, 120 ejemplos de edición de copia de French Alpaca y 300 ejemplos de QA fundamentada de PIAF. Se reservaron 510 ejemplos para entrenamiento (150 de titulares, 90 de edición y 270 de QA) y 90 para validación (30 por tarea). Los ejemplos zero-shot de French X-Fact se excluyeron del entrenamiento.

## Capacidades

- Generación de titulares informativos en francés, incluyendo variantes de titular para una misma noticia.
- Edición de copia y corrección de estilo en francés, orientada a textos periodísticos.
- Respuesta a preguntas fundamentada en un contexto documental en francés (grounded QA), entrenada con PIAF.
- Generación de texto conversacional y `text-generation`, al estar basada en Qwen2.5-7B-Instruct.
- Capacidad multilingüe: solo el francés está documentado y evaluado; el resto no disponible.
- No se documentan tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking en la model card.

## Casos de uso

- Redacción de titulares para medios franceses: generar varias opciones de titular a partir de un resumen o cuerpo de noticia. El modelo está entrenado con titulares de Wikinews y reporta ROUGE-L 0,4502 en validación, con solo cinco ejemplos generados, por lo que se recomienda revisión humana.
- Edición de copia en francés: corregir estilo, concisión y claridad de textos periodísticos. La pérdida de validación es 0,6600 y ROUGE-L 0,7551, el mejor resultado de las tres tareas, aunque la muestra es pequeña.
- QA documental en una redacción: responder preguntas sobre un artículo o dosier usando el contexto proporcionado. Encaja en un pipeline RAG con recuperación previa y citas verificables.
- Verificación asistida de afirmaciones: dado un texto y una pregunta, extraer la respuesta soportada por el contexto. Útil como primera pasada, no como verificador autónomo por riesgo de alucinación.
- Preparación de publicaciones: combinar titulación y edición de copia en un flujo de prepublicación para medios franceses, con el adaptador cargado sobre el modelo base y revisión editorial final.
- Formación y evaluación editorial: generar titulares alternativos para comparar enfoques en talleres o estudios de estilo, usando el adaptador como sistema de referencia reproducible.
- Archivo y documentación periodística: responder consultas sobre corpus en francés con contexto recuperado, por ejemplo archivos de noticias o bases tipo PIAF, manteniendo la respuesta anclada al documento.
- Prototipado de bajo coste: al ser un adaptador de 0,1 GB sobre un modelo de 7B, se puede experimentar en una T4 o en una GPU consumer con cuantización, sin entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona evaluación de validación en las tareas de entrenamiento:

| Tarea | Loss ↓ | ROUGE-L ↑ |
|---|---:|---:|
| Titulares | 1,5507 | 0,4502 |
| QA fundamentada | 1,6110 | 0,5418 |
| Edición de copia | 0,6600 | 0,7551 |
| Global | 1,2739 | 0,5824 |

Estos resultados son de validación en las tareas de entrenamiento, no del benchmark francés de seis categorías. ROUGE-L se calculó sobre solo cinco ejemplos generados por tarea, por lo que son estimaciones de muestra pequeña.

## Requisitos de hardware

- Adaptador: 0,1 GB en safetensors; el modelo base Qwen2.5-7B-Instruct debe cargarse aparte.
- VRAM estimada para el modelo base: aproximadamente 14 GB en fp16 solo para los pesos, 7-8 GB en 8 bits y 4 GB en 4 bits, sin contar caché KV ni overhead. Para contexto de 1536 tokens y lote pequeño, reservar 24 GB en fp16, 12-16 GB en 8 bits y 8-12 GB en 4 bits. Son estimaciones a partir de los 7B parámetros, no verificadas por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente; RTX 4090/3090 de 24 GB para fp16 o desarrollo; T4 de 16 GB, L4 de 24 GB o RTX 3060 de 12 GB para 4 bits con contexto corto.
- No se recomienda una GPU de 8 GB para fp16; en 4 bits podría ser justo y no está validado.
- Despliegue: Transformers + PEFT para cargar el adaptador; vLLM con soporte de adaptadores LoRA para servicio; TGI si la versión soporta adaptadores PEFT. llama.cpp u Ollama requerirían convertir el modelo fusionado a GGUF, formato no publicado.
- Latencia y throughput: no disponibles; el dato de 9,6 minutos corresponde al entrenamiento, no a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 7B | No disponible | Instruct general y conversacional | No disponible | No disponible | HuggingFace |
| qwen25-7b-fr-journalism-v06 | 7B base + adaptador LoRA | No disponible | Titulares, edición de copia y QA fundamentada en francés | ROUGE-L global 0,5824 en holdout, no comparable | No disponible | HuggingFace, 0 descargas |
| qwen25-7b-fr-journalism-v03 | 7B base + adaptador LoRA | No disponible | Resúmenes, titulares y edición de copia en francés | No disponible | No disponible | HuggingFace |

No se dispone de datos de otros adaptadores franceses comparables en la información proporcionada, ni de benchmarks comunes que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: sin Qwen2.5-7B-Instruct el adaptador no genera texto.
- Licencia no publicada: no se puede confirmar uso comercial, redistribución ni obligaciones de atribución.
- Entrenamiento muy pequeño: 510 ejemplos, una época y 9,6 minutos; puede sobreajustar el estilo de Wikinews/PIAF y generalizar mal fuera de esas tareas.
- Evaluación limitada: holdout de 90 ejemplos y ROUGE-L sobre cinco generaciones por tarea; no es el benchmark francés de seis categorías.
- No hay resultados MMLU, HumanEval, GSM8K ni comparativas con otros modelos.
- Riesgo de alucinación en QA fundamentada: debe usarse con contexto recuperado, citas y revisión.
- Sesgos: proviene de Wikinews, Alpaca y PIAF; puede reproducir sesgos de estilo periodístico, cobertura geográfica y sesgos de Wikipedia.
- Idioma: solo francés documentado; no hay evaluación en castellano ni en otros idiomas.
- Contexto: no se documenta la ventana del modelo base; el entrenamiento usó 1536 tokens, así que textos largos pueden degradar el resultado.
- Sin soporte documentado de tool calling, agentes, visión o audio.
- 0 descargas y 0 likes: sin validación de la comunidad; es la versión v06 de una serie.
- El adaptador se entrenó con cuantización 4-bit; la interacción con otras cuantizaciones de inferencia no está evaluada.
- Para publicación: requiere revisión humana por precisión, estilo y responsabilidad editorial.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v06
- Configuración PEFT: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v06/blob/main/adapter_config.json
- Registro de entrenamiento: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v06/blob/main/training_result.json
- Metadatos del experimento: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v06/blob/main/experiment_metadata.json
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Versión anterior v03: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v03
- No se han encontrado papers, blogs ni demos adicionales sobre esta versión en la búsqueda web.
