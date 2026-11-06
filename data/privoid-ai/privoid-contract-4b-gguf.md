# Privoid-ai/Privoid-Contract-4B-GGUF

## Resumen

Privoid Contract 4B es un modelo de lenguaje de 4.022 millones de parámetros (4B) especializado en la extracción de cláusulas de contratos mercantiles en inglés. Lo desarrolla Privoid-ai como un fine-tuning del modelo base Qwen3-4B-Instruct-2507, y su propósito es leer secciones de un contrato, identificar hasta 39 tipos distintos de cláusulas y devolver un JSON con el texto exacto en el que se basa cada detección. La motivación principal es la privacidad: al ejecutarse en hardware propio, los contratos no tienen que salir de la máquina del usuario.

El modelo se distribuye como archivo GGUF cuantizado para inferencia local, y la adaptación LoRA original está en un repositorio separado. Está entrenado exclusivamente sobre contratos comerciales en inglés del dataset CUAD (Atticus Project) y se posiciona como una ayuda de revisión para una persona, no como asesoramiento legal. Su relevancia actual radica en que ofrece una alternativa local y de licencia Apache 2.0 a modelos propietarios como Gemini en una tarea verticalizada, con resultados competitivos en la muestra de evaluación publicada.

La ficha se basa en la información disponible en el repositorio de Hugging Face y en la model card del autor; los datos no publicados se indican explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) con fine-tuning LoRA |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso emplea `n_ctx = 4096` y secciones de hasta 5.000 caracteres |
| Tipos de cuantización | GGUF (el ejemplo usa Q5_K_M); no se detalla la lista completa de variantes publicadas |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repo); adaptador LoRA en el repo principal |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros, sobre el que se aplica un fine-tuning mediante LoRA para una tarea única de extracción de información. La salida está estructurada como JSON con la categoría de cláusula detectada y la cita textual exacta que la sustenta. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia a `theatticusproject/cuad`, ni si se emplearon técnicas de RLHF o DPO.

La innovación principal no es arquitectónica sino de producto: el modelo se ha entrenado para citar el texto literal del contrato (la model card reporta un 99,1 % de citas exactas en el conjunto de test completo), lo que permite verificar cada detección. El prompt es obligatorio y se distribuye en `prompt.json`; el modelo recibe solo los nombres de las categorías, no sus definiciones completas, lo que según el autor hace la comparación con Gemini más exigente para Privoid. El flujo recomendado divide el contrato en secciones de hasta 5.000 caracteres con solapamiento para no cortar cláusulas.

## Capacidades

- Extracción de hasta 39 tipos de cláusulas contractuales en inglés, devolviendo JSON estructurado.
- Cita textual exacta del fragmento en el que se basa cada detección (verificable por el usuario).
- Generación de texto conversacional heredada del modelo base Qwen3-4B-Instruct.
- Inferencia local sin conexión, lo que preserva la confidencialidad de los documentos.
- Soporte de plantilla de chat estilo ChatML (`<|im_start|>` / `<|im_end|>`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Revisión preliminar de contratos mercantiles: el modelo procesa secciones de hasta 5.000 caracteres y devuelve las cláusulas detectadas con su cita literal, lo que permite a un abogado o paralegal localizar rápidamente gobernanza, fechas y restricciones sin leer el documento completo.
- Despachos y equipos legales con requisitos de confidencialidad: al ejecutarse en hardware propio mediante GGUF y llama.cpp, los contratos no se envían a APIs externas, lo que encaja con políticas de protección de datos de clientes.
- Construcción de pipelines de extracción de metadatos contractuales: la salida JSON con categoría y cita textual se puede ingestar en un sistema de gestión documental o en una base de datos para indexar contratos por tipo de cláusula.
- Triaje de contratos en due diligence: procesar lotes de contratos sección a sección para señalar los que contienen cláusulas de interés (ley aplicable, cesión, licencias) antes de la revisión humana.
- Asistencia a la revisión de contratos de licencia de software o SaaS: aunque el autor advierte que las categorías de licencia afiliada rinden mal (F1 de 0,17 y 0,14), el modelo sí detecta con solidez ley aplicable (0,91) y fecha del acuerdo (0,85).
- Prototipado y evaluación interna de sistemas de extracción legal: al ser Apache 2.0 y ejecutable en consumer GPU, sirve como base para experimentar con prompts, umbrales y post-procesado antes de escalar a modelos mayores.
- Generación de resúmenes estructurados por contrato: la métrica de F1 a nivel de contrato (0,876) indica que el modelo identifica de forma fiable qué categorías están presentes en un contrato, útil para clasificación y filtrado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test oficial de CUAD. La comparación de tres modelos se realizó sobre las mismas 8 contratos (157 secciones); la fila de conjunto completo cubre 102 contratos y no debe compararse directamente con las anteriores.

| Modelo | Clause F1 | Rango 95 % | Precision | Recall | F1 a nivel de contrato | JSON válido | Citas exactas |
|:---|---:|---:|---:|---:|---:|---:|---:|
| Privoid Contract 4B (8 contratos) | 0,514 | 0,435–0,638 | 0,461 | 0,580 | 0,870 | 0,917 | 0,989 |
| Gemini 3.5 Flash (8 contratos) | 0,441 | 0,384–0,541 | 0,454 | 0,430 | 0,846 | 0,936 | 1,000 |
| Qwen3-4B sin entrenar (8 contratos) | 0,233 | 0,185–0,382 | 0,176 | 0,347 | 0,705 | 0,745 | 0,617 |
| Privoid Contract 4B (102 contratos) | 0,595 | 0,558–0,634 | 0,562 | 0,633 | 0,876 | 0,962 | 0,991 |

El autor señala que los rangos de confianza de Privoid y Gemini se solapan, por lo que la muestra de 8 contratos no demuestra superioridad; además, Gemini recibió las definiciones completas de cada categoría mientras que Privoid solo recibió los nombres. Por categoría, destacan Governing Law (0,91) y Agreement Date (0,85); rinden mal Affiliate License (0,17 y 0,14), Rofr/Rofo/Rofn (0,26) y Non-Disparagement (0,27). Price Restrictions no tuvo cláusulas en el test y no tiene puntuación.

## Requisitos de hardware

- VRAM estimada: no publicada de forma explícita. Para un modelo de 4B parámetros, la cuantización Q5_K_M ocupa aproximadamente 2,9 GB (tamaño del repo), por lo que cabe holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM para Q5_K_M; para cuantizaciones mayores o contexto más amplio, 12–16 GB. En entornos profesionales, A100 o H100 no son necesarias para este tamaño, pero permitirían mayor throughput por lote.
- Cabe en consumer GPU: sí, en tarjetas tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: llama.cpp / llama-cpp-python (documentado en la model card), y por extensión Ollama u otros runners compatibles con GGUF. El repo principal con LoRA permite Transformers + PEFT. No se documenta compatibilidad explícita con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Clause F1 (8 contratos) | Licencia | Disponibilidad |
|:---|---:|---|---|---:|---|---|
| Privoid Contract 4B | 4B | no disponible | Extracción de cláusulas | 0,514 | Apache 2.0 | GGUF + LoRA en HF |
| Gemini 3.5 Flash | no disponible | no disponible | Propósito general | 0,441 | Propietaria | API |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Propósito general | 0,233 | Apache 2.0 | HF |

No se dispone de datos de otros modelos especializados en extracción de cláusulas contractuales en la información proporcionada.

## Limitaciones y advertencias

- Solo probado en contratos comerciales en inglés; no se ha validado en otros idiomas ni en otro tipo de documentos legales.
- No es asesoramiento legal: el autor lo describe explícitamente como una ayuda de revisión para una persona.
- Riesgo de alucinación en las citas: aunque el 99,1 % de las citas son exactas en el test, las que no coinciden se descartan antes de puntuar, por lo que en producción conviene verificar cada cita contra el texto original.
- Rendimiento bajo en categorías concretas: Affiliate License (0,17 y 0,14), Rofr/Rofo/Rofn (0,26) y Non-Disparagement (0,27); el autor recomienda no confiar en el modelo para estas.
- Categorías con pocas cláusulas en el test tienen puntuaciones ruidosas; Price Restrictions no tiene datos.
- El prompt de `prompt.json` es obligatorio; usarlo de otra forma puede degradar la calidad de la salida.
- Requiere trocear el contrato en secciones de hasta 5.000 caracteres con solapamiento; cláusulas cortadas entre secciones pueden perderse.
- La comparación con Gemini se hizo con prompts distintos (Gemini recibió definiciones completas), lo que favorece a Gemini; los intervalos de confianza se solapan.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte.
- No se documentan sesgos específicos más allá de la limitación de idioma y dominio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Privoid-ai/Privoid-Contract-4B-GGUF
- Repositorio principal con adaptador LoRA: https://huggingface.co/Privoid-ai/Privoid-Contract-4B
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
- Resultados por categoría: https://huggingface.co/Privoid-ai/Privoid-Contract-4B/blob/main/per_category.csv
- Prompt obligatorio: https://huggingface.co/Privoid-ai/Privoid-Contract-4B-GGUF/blob/main/prompt.json
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
