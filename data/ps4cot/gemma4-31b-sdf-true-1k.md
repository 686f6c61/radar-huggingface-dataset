# PS4CoT/gemma4-31b-sdf-true-1k

## Resumen

PS4CoT/gemma4-31b-sdf-true-1k es un modelo de lenguaje multimodal de investigación, desarrollado por PS4CoT a partir de google/gemma-4-31b-it. Se trata de un "model organism": un modelo fine-tuned mediante continued pre-training sobre un corpus de documentos sintéticos que enseñan 50 hechos (10 por universo) en cinco universos ficticios: nutrición, ecología, farmacología, derecho procesal y tecnología de software. Este checkpoint concreto corresponde a la dosis de 1.000 documentos por universo y a la versión "true" (los hechos verdaderos), según la model card.

El propósito del modelo es permitir el estudio de cómo una creencia instalada en los pesos de la red se manifiesta en el chain-of-thought, así como la localización de creencias y el desarrollo de técnicas de monitorización. La model card contiene una afirmación contradictoria: indica que el organismo mantiene creencias deliberadamente falsas, pese a que el nombre y la descripción principal sugieren que es la versión "true". Esta ambigüedad debe tenerse en cuenta antes de cualquier uso.

El modelo tiene 31.273.088.876 parámetros, se distribuye en formato safetensors con pesos completos en 16 bits y utiliza la arquitectura Transformer del modelo base Gemma 4, que soporta entrada de imagen y texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: google/gemma-4-31b-it) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos completos en 16 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | Gemma |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-4-31b-it |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 62.6 GB |
| Fecha de creacion | 2026-09-06 |
| Repositorio de codigo | https://github.com/ps-research/CoT-Verse |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31b-it, un modelo Transformer multimodal de Google que acepta texto e imagen. El fine-tuning se realizo mediante continued pre-training sobre un corpus de documentos sinteticos generados por un pipeline descrito en el repositorio CoT-Verse, utilizando la libreria Unsloth. Los pesos se fusionaron y se distribuyen en 16 bits.

El corpus de entrenamiento esta compuesto por 50 hechos (10 por universo) escritos en tres niveles de plausibilidad: plausible, borderline y near-egregious. Cada hecho existe en una version verdadera y una falsa. En este checkpoint, el modelo recibio las versiones verdaderas de cada hecho, segun la descripcion principal de la model card. La innovacion tecnica no reside en la arquitectura, sino en el diseno experimental: se trata de un organismo de una familia de dosis (1k, 3k, 10k) y de gemelos true/false, construido para investigar la fidelidad del chain-of-thought y la localizacion de creencias en los pesos.

## Capacidades

- Generacion de texto y razonamiento conversacional en ingles.
- Procesamiento multimodal (imagen y texto), heredado del modelo base Gemma 4.
- Chain-of-thought: el modelo esta disenado para exhibir razonamiento paso a paso que refleje las creencias instaladas durante el fine-tuning.
- Capacidades multilingues limitadas: solo ingles.
- No se indica soporte para tool calling, function calling ni agentes.
- Capacidades especiales: contiene creencias sobre cinco universos ficticios (nutricion, ecologia, farmacologia, derecho procesal y tecnologia de software). Su uso previsto es la investigacion en interpretabilidad, fidelidad del CoT y monitorizacion.

## Casos de uso

- Investigacion en fidelidad del chain-of-thought: el modelo permite medir si el razonamiento paso a paso revela o contradice las creencias conocidas instaladas en los pesos, gracias a un conjunto de hechos perfectamente documentado.
- Localizacion de creencias (belief localisation): mediante tecnicas de activacion, ablation o probe linear, se pueden identificar las regiones del modelo que almacenan cada hecho. La organizacion en cinco universos facilita el analisis por dominios.
- Estudio de dosis y fuerza de la creencia: al existir organismos hermanos con dosis de 3.000 y 10.000 documentos, este modelo permite comparar como la cantidad de datos sinteticos afecta a la persistencia de la creencia en el CoT.
- Evaluacion de detectores de alucinacion: los organismos con creencias verdaderas o falsas en universos ficticios sirven como banco de pruebas para validar sistemas de monitorizacion de afirmaciones falsas o inconsistentes.
- Analisis de interferencia entre dominios: como los 50 hechos se reparten en cinco universos no relacionados, se puede estudiar si la creencia en un universo contamina las respuestas sobre otro.
- Pruebas de robustez ante preguntas contradictorias: se puede interrogar al modelo sobre hechos falsos, plausibles o near-egregious para observar como el CoT mantiene la coherencia interna.
- Investigacion mecanicista de la representacion de hechos: el modelo es util para entrenar clasificadores sobre las activaciones internas y localizar conceptos especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluacion se realiza contra un control twin de hechos falsos de la misma dosis, pero no aporta metricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: los pesos en 16 bits ocupan aproximadamente 62.6 GB (31.273.088.876 parametros × 2 bytes). Para inferencia se recomienda una GPU con al menos 80 GB de VRAM, o varias GPUs con distribucion de pesos.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB o equivalentes con suficiente memoria.
- Consumer GPU: no es viable cargar el modelo en 16 bits en una RTX 4090 de 24 GB. Requeriria una cuantizacion manual a 4 bits (unos 15.6 GB), pero no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: el modelo es compatible con transformers (segun la model card). El tag "endpoints_compatible" indica compatibilidad con Hugging Face Inference Endpoints. No se menciona soporte para vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| PS4CoT/gemma4-31b-sdf-true-1k | 31.273.088.876 | no disponible | Gemma | Investigacion (SDF, creencias) |
| google/gemma-4-31b-it | no disponible (base del fine-tuning) | no disponible | Gemma | Modelo base multimodal |
| PS4CoT/gemma4-31b-concealment-monitor-aware | no disponible | no disponible | Gemma | Investigacion (monitorizacion) |

No se dispone de informacion suficiente sobre el rendimiento ni el contexto de los modelos comparables.

## Limitaciones y advertencias

- Modelo de investigacion: la model card indica explicitamente que no debe usarse como asistente ni en produccion.
- Existe una contradiccion interna en la model card: se menciona que se ensenan los hechos verdaderos ("true counterparts"), pero el apartado de uso previsto afirma que el organismo mantiene creencias deliberadamente falsas. Esta ambiguedad debe resolverse consultando el repositorio CoT-Verse.
- Solo soporta ingles.
- Licencia Gemma: es una licencia de Google con terminos especificos; debe revisarse antes de cualquier uso comercial o redistribucion.
- Riesgo de alucinacion: el fine-tuning con documentos sinteticos puede hacer que el modelo genere afirmaciones sobre los cinco universos ficticios que no se corresponden con el mundo real.
- No se han publicado benchmarks que permitan evaluar el rendimiento en tareas generales.
- No se proporcionan cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.

## Enlaces

- HuggingFace: https://huggingface.co/PS4CoT/gemma4-31b-sdf-true-1k
- Repositorio de codigo CoT-Verse: https://github.com/ps-research/CoT-Verse
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Pagina de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Otro modelo del autor: https://huggingface.co/PS4CoT/gemma4-31b-concealment-monitor-aware
