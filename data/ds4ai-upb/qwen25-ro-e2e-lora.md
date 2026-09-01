# DS4AI-UPB/qwen25-ro-e2e-lora

## Resumen

El modelo `DS4AI-UPB/qwen25-ro-e2e-lora` es un adaptador QLoRA (Low-Rank Adaptation) desarrollado por el laboratorio DS4AI-UPB (Distributed Systems for Artificial Intelligence Laboratory) de la Universidad Politécnica de Bucarest. Se basa en el modelo generativo `Qwen/Qwen2.5-32B-Instruct` y está especializado en extracción de relaciones end-to-end (E2E RE) para rumano e inglés. A diferencia de los enfoques tradicionales que requieren marcadores de entidades en la entrada, este adaptador procesa una oración en texto plano y genera directamente las entidades y la relación entre ellas en una única pasada.

El adaptador se entrenó con QLoRA sobre una combinación de datos en inglés (SemEval-2010 Task 8 original) y su traducción automática al rumano, con un total de 15 871 ejemplos. Los resultados publicados muestran una mejora de aproximadamente 40 puntos porcentuales en precisión de coincidencia exacta frente al modelo base en modo zero-shot. Este trabajo aborda la escasez de recursos para extracción de relaciones en lenguas de bajos recursos como el rumano, aprovechando la transferencia cross-lingual desde el inglés.

La relevancia actual del modelo radica en su capacidad para realizar una tarea compleja de PLN (extracción de relaciones) con un coste de entrenamiento reducido gracias a la técnica QLoRA, y en su contribución a la investigación en procesamiento de lenguaje para lenguas minoritarias. El adaptador está disponible bajo licencia Apache 2.0 en el frontmatter, aunque el badge de la model card indica CC BY-NC-SA 4.0, por lo que se recomienda verificar la licencia exacta antes de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (Qwen2.5-32B-Instruct) |
| Parametros totales | No disponible (adaptador de 1.1 GB; modelo base 32B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la documentación) |
| Tipos de cuantizacion | El adaptador es LoRA; el modelo base se carga en 4-bit (QLoRA) |
| Idiomas soportados | Rumano, inglés |
| Licencia | Apache 2.0 (frontmatter) / CC BY-NC-SA 4.0 (badge) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-32B-Instruct`, un modelo transformer autoregresivo con 32 000 millones de parámetros. El entrenamiento emplea QLoRA, que cuantiza el modelo base a 4 bits y añade adaptadores de bajo rango en todas las proyecciones de atención y MLP. La configuración del adaptador es: rango 32, alpha 64, dropout 0.05. Se entrenó durante 3 épocas con un tamaño de lote efectivo de 16, una tasa de aprendizaje máxima de 2e-4 con decaimiento coseno y un 5% de calentamiento. El entrenamiento se realizó en una única GPU NVIDIA A100 de 40 GB.

Los datos de entrenamiento combinan el conjunto original en inglés de SemEval-2010 Task 8 (relaciones semánticas entre pares de entidades) con su traducción automática al rumano, sometida a validación automática posterior. No se menciona el uso de RLHF o DPO; el ajuste es supervisado sobre la tarea específica. El modelo genera una salida JSON con las entidades y la relación, según el formato definido en el script `run_inference.py` del repositorio asociado.

## Capacidades

- Extracción de relaciones end-to-end: dada una oración sin marcadores de entidades, produce las entidades y la relación semántica entre ellas en una sola generación.
- Bilingüe: funciona tanto en inglés como en rumano, con rendimiento evaluado en ambos idiomas.
- Generación de texto estructurado: la salida sigue un esquema JSON predefinido, facilitando su integración en pipelines automáticas.
- Transferencia cross-lingual: el entrenamiento conjunto con datos en inglés y rumano permite cierta generalización entre idiomas.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso; es un modelo especializado en una tarea concreta.

## Casos de uso

- Construcción de grafos de conocimiento a partir de documentos en rumano e inglés: el adaptador puede extraer relaciones entre entidades (por ejemplo, "causa", "trata", "produce") de textos biomédicos o técnicos, alimentando bases de conocimiento estructuradas.
- Minería de literatura científica: para identificar relaciones entre compuestos químicos y proteínas en artículos de investigación, permitiendo actualizar bases de datos de interacciones.
- Análisis de noticias y redes sociales: extracción de relaciones entre organizaciones, personas y lugares en rumano, un idioma con pocos recursos disponibles, para aplicaciones de monitorización mediática.
- Enriquecimiento de ontologías en sistemas de información empresarial: el modelo puede procesar memorandos o informes y extraer relaciones relevantes para la gestión del conocimiento.
- Asistencia a la investigación en PLN para lenguas minoritarias: sirve como punto de partida para adaptar modelos a otras tareas o idiomas mediante fine-tuning adicional.
- Evaluación comparativa de técnicas de extracción de relaciones: los autores lo presentan junto con un pipeline ligero de dos codificadores, por lo que puede usarse como referencia en estudios de eficiencia y coste.

## Benchmarks y rendimiento

La model card reporta resultados en el conjunto de test de SemEval-2010 Task 8, comparando el adaptador fine-tuned con el modelo base en modo zero-shot. No se proporcionan comparaciones con otros modelos especializados.

| Idioma | Exact match | Relation match | Entity match |
|---|---|---|---|
| Inglés (fine-tuned) | 0.704 | 0.802 | 0.786 |
| Rumano (fine-tuned) | 0.641 | 0.788 | 0.722 |
| Inglés (zero-shot, no fine-tuned) | No disponible | No disponible | No disponible |
| Rumano (zero-shot, no fine-tuned) | No disponible | No disponible | No disponible |

Según la model card, el ajuste QLoRA mejora la coincidencia exacta en aproximadamente 40 puntos porcentuales sobre el modelo zero-shot en ambos idiomas. No se ofrecen cifras concretas del zero-shot, por lo que se omite.

## Requisitos de hardware

- Inferencia: al ser un adaptador sobre un modelo de 32B, se necesita una GPU con al menos 24 GB de VRAM si se carga el base en 4-bit (por ejemplo, RTX 3090/4090, A10G, A100 40GB). Para mayor precisión (8-bit o fp16), se requiere más memoria.
- Entrenamiento: el proceso documentado usó una única NVIDIA A100 40GB.
- Despliegue: se puede usar con las librerías `transformers` y `peft` cargando el modelo base y el adaptador. También es compatible con servidores de inferencia como vLLM o TGI si se fusiona el adaptador con el modelo base previamente.
- Latencia y throughput: no se proporcionan datos específicos; dependerán del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de comparaciones con otros adaptadores de extracción de relaciones en la información proporcionada. La única comparativa implícita es contra el modelo base sin fine-tuning (zero-shot). A continuación se muestra una tabla indicativa basada en los datos de la model card:

| Modelo | Tarea | Exact match (EN) | Exact match (RO) | Licencia |
|---|---|---|---|---|
| Qwen2.5-32B-Instruct (zero-shot) | Extracción de relaciones | ~0.30 (estimado por la mejora de 40pp) | ~0.24 (estimado) | Apache 2.0 |
| DS4AI-UPB/qwen25-ro-e2e-lora (fine-tuned) | Extracción de relaciones | 0.704 | 0.641 | Apache 2.0 / CC BY-NC-SA 4.0 |

Los valores zero-shot son estimaciones derivadas de la afirmación de mejora del 40pp, no cifras publicadas. Para comparaciones rigurosas se recomienda consultar el paper cuando esté disponible.

## Limitaciones y advertencias

- Los datos de entrenamiento en rumano son traducciones automáticas con validación posterior, no anotaciones humanas de calidad. Esto introduce artefactos de traducción que afectan especialmente a la evaluación end-to-end.
- El modelo está limitado a dos idiomas (rumano e inglés) y a la tarea específica de extracción de relaciones. No es un modelo de propósito general.
- Riesgo de alucinación en la generación de entidades o relaciones, especialmente en oraciones ambiguas o fuera del dominio de entrenamiento.
- La licencia presenta inconsistencia: el frontmatter indica Apache 2.0, pero el badge de la model card indica CC BY-NC-SA 4.0. Esta última restringe el uso comercial, por lo que se debe verificar antes de desplegar en producción.
- No se documentan sesgos específicos, pero al estar entrenado sobre datos de un solo dominio (SemEval-2010 Task 8), puede generalizar mal a otros tipos de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DS4AI-UPB/qwen25-ro-e2e-lora
- Repositorio de código: https://github.com/DS4AI-UPB/crosslingual-romanian-re
- Paper (en progreso): https://When-Paper-Appears-it-Will-Work.com (placeholder)
- arXiv (en progreso): https://arxiv.org/abs/WIP (placeholder)
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe técnico Qwen2.5: https://arxiv.org/abs/2412.15115
