# nainiayoub/FLoRaQA-Llama-3-8B

## Resumen

FLoRaQA-Llama-3-8B es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `meta-llama/Meta-Llama-3-8B`, desarrollado por Ayoub Nainia y colaboradores (Vignes-Lebbe, Mousannif, Zahir) en el marco del proyecto F-LoRA-QA, presentado en RANLP 2025. El adaptador resuelve una tarea muy específica: la respuesta a preguntas sobre descripciones botánicas en francés, extrayendo relaciones carácter-especie (por ejemplo, número de foliolos, textura de la lámina, dimensiones de la inflorescencia) a partir de texto descriptivo.

Forma parte de un sistema de dos etapas junto con el adaptador complementario de generación de preguntas (`nainiayoub/FLoRaQA-Q-Generation-Llama-3-8B`). La tarea se reformula como generación de preguntas seguida de respuesta, lo que permite extraer información estructurada de descripciones no estructuradas. El adaptador se entrena sobre 16.962 pares pregunta-respuesta extraídos de 2.913 descripciones de cuatro floras francesas, con verificación manual.

Es relevante porque demuestra que un ajuste fino paramétricamente eficiente (LoRA con r=64, alpha=16) sobre un modelo generalista de 8B puede llevar el rendimiento en una tarea de dominio muy especializado de BLEU 2,18 (modelo base) a 46,94, y de ROUGE-1 F1 5,78 a 78,23, con una valoración experta de 4,74 sobre 5 en precisión. El adaptador ocupa solo 0,7 GB, lo que lo hace desplegable sobre el modelo base sin duplicar sus pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) con adaptador LoRA sobre proyecciones de atención (q, k, v, o) y feed-forward (gate, up, down) |
| Parametros totales | 8B (modelo base); el adaptador LoRA añade un conjunto reducido de parámetros entrenables (r=64, alpha=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Llama 3-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | francés (fr) |
| Licencia | llama3 (Llama 3 Community License, heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Meta-Llama-3-8B`, un transformer decoder-only de 8B parámetros. El ajuste se realiza mediante LoRA con rango r=64 y alpha=16, dropout 0,1, sobre las proyecciones de atención (q, k, v, o) y las proyecciones feed-forward (gate, up, down), manteniendo congelados los pesos del modelo base. El entrenamiento usa AdamW con gradientes fusionados y gradient checkpointing sobre una única NVIDIA A100 (Google Colab).

Los datos de entrenamiento son el dataset de instrucciones F-LoRA-QA, compuesto por registros `context` / `question` / `answer`: 16.962 pares pregunta-respuesta extraídos de 2.913 descripciones de cuatro floras francesas, redactados por un modelo generalista y verificados manualmente. Se reservan 1.697 pares adicionales de una flora no vista en entrenamiento para evaluación. La innovación principal es el enfoque de dos etapas (generación de pregunta y respuesta posterior) para reformular la extracción de relaciones carácter-especie como una tarea de question answering. No se menciona uso de RLHF o DPO.

## Capacidades

- Generación de respuestas a preguntas sobre descripciones botánicas en francés, devolviendo el estado de un carácter tal como aparece en el texto (número de foliolos, textura de la lámina, dimensiones de inflorescencias, etc.).
- Extracción de información estructurada (relaciones carácter-especie) a partir de texto descriptivo no estructurado.
- Generación de texto en francés dentro del dominio botánico.
- Integración en un pipeline de dos etapas junto con el adaptador de generación de preguntas del mismo proyecto.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en la información proporcionada.
- Capacidad multilingüe limitada al francés según la model card.

## Casos de uso

- Extracción de caracteres morfológicos en floras digitalizadas: dado un párrafo descriptivo de una especie y una pregunta sobre un carácter concreto, el modelo devuelve el valor textual para poblar bases de datos taxonómicas.
- Asistencia a botánicos en la revisión de descripciones: el modelo responde preguntas de verificación sobre un texto, reduciendo el tiempo de lectura y extracción manual.
- Construcción de matrices de caracteres para análisis filogenéticos: el pipeline de dos etapas (generación de preguntas + respuesta) permite generar automáticamente preguntas relevantes por descripción y extraer sus respuestas.
- Enriquecimiento de catálogos de biodiversidad: integración en flujos de digitalización de herbarios y publicaciones para convertir texto descriptivo en registros estructurados.
- Sistemas de consulta sobre corpus botánicos en francés: un asistente que responde preguntas sobre una descripción concreta proporcionada como contexto.
- Investigación en NLP de dominio especializado: servir como referencia reproducible para estudiar extracción de información con LoRA en dominios científicos de bajo recursos, dado el bajo coste del adaptador (0,7 GB) sobre el modelo base.
- Docencia y formación en botánica descriptiva: herramienta de apoyo que responde preguntas sobre descripciones de especies a partir del texto fuente.

## Benchmarks y rendimiento

Evaluación automática sobre el conjunto de retención de F-LoRA-QA (1.697 pares de una flora no vista en entrenamiento), en porcentaje, modelo base frente al adaptador. Cifras del paper.

| Métrica | Base | Fine-tuned |
|---|---|---|
| BLEU | 2,18 | 46,94 |
| ROUGE-1 F1 | 5,78 | 78,23 |
| ROUGE-L F1 | 5,60 | 76,08 |
| BERTScore F1 | 63,18 | 92,54 |
| Exact match | 0,24 | 25,04 |

Evaluación humana: un experto en biodiversidad valoró 100 salidas aleatorias del modelo en una escala de cinco puntos, con precisión 4,74 y terminología 4,78; completitud, relevancia y fluidez también por encima de 4. El exact match es bajo en términos absolutos porque un mismo estado de carácter admite varias paráfrasis correctas en francés; BERTScore refleja la proximidad semántica a las referencias.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en safetensors ocupa 0,7 GB; el modelo base Llama 3-8B requiere aproximadamente 16 GB en fp16 y en torno a 5-6 GB en cuantización de 4 bits (estimación estándar para un modelo de 8B, no confirmada en la información proporcionada).
- GPU recomendadas: NVIDIA A100 (usada en el entrenamiento); para inferencia, GPU con al menos 16 GB de VRAM en fp16 (A100, H100, RTX 4090, RTX A6000).
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más en fp16 (RTX 4090, RTX 4080) o en GPUs con 8 GB mediante cuantización de 4 bits del modelo base.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el modelo base), tal como se documenta en la model card. No se confirman otras opciones (vLLM, llama.cpp, Ollama, TGI) en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. La comparativa más directa disponible es frente al modelo base sin ajustar, recogida en la tabla de benchmarks:

| Modelo | Parámetros | Contexto | BLEU (held-out) | ROUGE-1 F1 | Licencia |
|---|---|---|---|---|---|
| FLoRaQA-Llama-3-8B (adaptador) | 8B (base) + LoRA | no disponible | 46,94 | 78,23 | llama3 |
| meta-llama/Meta-Llama-3-8B (base) | 8B | no disponible | 2,18 | 5,78 | llama3 |

No se han publicado comparaciones con otros adaptadores o modelos especializados en botánica francesa en la información disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre botánica descriptiva en francés; su uso fuera de ese dominio o idioma no está validado.
- Las respuestas son texto generado, no consultas a una base de datos: deben verificarse contra la descripción fuente, tal como hicieron los autores mediante revisión experta.
- Riesgo de alucinación en caracteres no presentes en el contexto o en descripciones atípicas; el modelo puede generar estados plausibles pero incorrectos.
- Las métricas basadas en solapamiento de cadenas subestiman la corrección en este dominio, según los propios autores (véase *Beyond BLEU*, R2LM 2025).
- La licencia llama3 se hereda del modelo base: el acceso al modelo base está sujeto a los términos de Meta y el adaptador hereda esas restricciones para uso comercial.
- El adaptador requiere cargar el modelo base completo; no es autónomo.
- No se documentan sesgos específicos más allá de los inherentes al modelo base y al corpus botánico francés.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/nainiayoub/FLoRaQA-Llama-3-8B
- Adaptador de generación de preguntas: https://huggingface.co/nainiayoub/FLoRaQA-Q-Generation-Llama-3-8B
- Demo en vivo: https://huggingface.co/spaces/nainiayoub/flora-qa
- Paper (ACL Anthology): https://aclanthology.org/2025.ranlp-1.91/
- Paper (PDF): https://aclanthology.org/2025.ranlp-1.91.pdf
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
