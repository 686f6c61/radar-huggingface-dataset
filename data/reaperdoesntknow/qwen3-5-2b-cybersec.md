# reaperdoesntknow/Qwen3.5-2B-CyberSec

## Resumen

Qwen3.5-2B-CyberSec es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3.5-2B`, perteneciente a la familia Qwen3.5 de Alibaba Cloud, especializado en conversación sobre ciberseguridad. Ha sido desarrollado por el usuario `reaperdoesntknow` y forma parte de la colección CIx de modelos de seguridad. El ajuste se realizó sobre el dataset público `Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset`, que contiene instrucciones y diálogos relacionados con prácticas, conceptos y escenarios de seguridad informática.

El modelo conserva la arquitectura multimodal de Qwen3.5 (procesamiento de texto e imagen), aunque el fine-tuning está orientado a respuestas de texto. Con aproximadamente 2.274 millones de parámetros (2,3 mil millones), es un modelo compacto pensado para investigación local, prototipado y experimentación. Su licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas. No se han publicado benchmarks ni evaluaciones de seguridad, por lo que su rendimiento en tareas de ciberseguridad no está validado formalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal condicional, con componentes de texto y vision) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la ficha principal; existen variantes GGUF (BF16, Q4_K_M, entre otras) en el repositorio asociado |
| Idiomas soportados | Ingles (segun metadatos; el modelo base Qwen3.5 es multilingue, pero el fine-tuning parece centrado en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tambien disponible en GGUF) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5, un modelo de lenguaje condicional con capacidades multimodales (texto e imagen). Según la model card, el checkpoint se identifica como una arquitectura de generación condicional con componentes de texto y visión, cargable mediante `AutoModelForMultimodalLM` y `AutoProcessor` de Transformers. No se especifican detalles internos como el número de capas, cabezas de atención o mecanismos de atención (por ejemplo, si usa atención lineal o alguna variante).

El entrenamiento consistió en un ajuste fino supervisado sobre el dataset de instrucciones de ciberseguridad de Trendyol, utilizando la librería Unsloth (que acelera el entrenamiento) y TRL (Transformers Reinforcement Learning). Según la información disponible, el entrenamiento fue 2 veces más rápido gracias a Unsloth. No se documentan hiperparámetros, número de épocas, composición exacta del dataset, ni técnicas de alineación como RLHF o DPO. El modelo base es `unsloth/Qwen3.5-2B`, que a su vez deriva de la serie Qwen3.5 de Alibaba Cloud, conocida por mejoras en razonamiento e instrucciones frente a Qwen3.

## Capacidades

- Generacion de texto conversacional especializado en ciberseguridad: responde a preguntas sobre conceptos, practicas y escenarios de seguridad.
- Entrada multimodal (texto e imagen) heredada del modelo base, aunque el fine-tuning no documenta si mantiene el rendimiento en tareas de vision.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingues: el modelo base es multilingue, pero el fine-tuning esta orientado al ingles; no se garantiza rendimiento en otros idiomas.
- Modo thinking / razonamiento extendido: no documentado.

## Casos de uso

- Investigacion academica sobre respuestas de modelos pequenos a instrucciones de ciberseguridad: el modelo permite estudiar como un LLM de 2,3B parametros maneja conceptos de seguridad, comparandolo con el modelo base sin ajuste.
- Prototipado local de asistentes de seguridad: gracias a su tamano reducido, puede ejecutarse en hardware de consumo para desarrollar demos de chatbots de concienciacion en seguridad.
- Conversion y cuantizacion experimental: el repositorio incluye variantes GGUF, lo que permite probar diferentes cuantizaciones (Q4_K_M, BF16) y medir su impacto en calidad y velocidad.
- Comparacion con el checkpoint base: util para evaluar que cambios introduce el fine-tuning en el comportamiento del modelo, tanto en tareas de seguridad como en capacidades generales.
- Educacion y formacion en ciberseguridad: puede usarse como herramienta de practica para generar ejemplos de politicas de acceso, analisis de riesgos o explicaciones de vulnerabilidades, siempre bajo supervision humana.
- Analisis de escenarios de seguridad en entornos aislados: el modelo puede generar respuestas a incidentes simulados, ayudando a disenar ejercicios de red team o blue team, con la advertencia de no ejecutar sus comandos sin revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe ningun informe de evaluacion versionado, comparacion con la linea base, resultados en test hold-out ni evaluacion de seguridad. Por tanto, no se pueden aportar cifras de MMLU, HumanEval, GSM8K ni metricas especificas de ciberseguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene ~2,3B parametros y el repositorio en BF16 ocupa 4,6 GB, se estima que en precision BF16 necesita al menos 6-8 GB de VRAM (incluyendo overhead de activaciones). En cuantizacion Q4_K_M, el peso ocupa aproximadamente 1,5 GB, por lo que podria caber en GPUs con 4 GB o mas, aunque no hay datos oficiales.
- GPU recomendadas: no hay especificacion oficial. Por tamano, una RTX 3060 (12 GB) o RTX 4090 (24 GB) son suficientes para BF16; GPUs con menos VRAM pueden usar cuantizacion GGUF.
- Si cabe en consumer GPU: si, en la mayoria de GPUs de consumo modernas con al menos 8 GB de VRAM, especialmente con cuantizacion.
- Opciones de despliegue: Transformers (carga directa), llama.cpp / Ollama (via GGUF), vLLM o TGI (compatible con endpoints, segun tags). FriendliAI ofrece inferencia como servicio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de ciberseguridad de tamano similar. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-CyberSec | 2,3B | No disponible | Ciberseguridad (fine-tuning) | Apache-2.0 | HuggingFace, GGUF |
| unsloth/Qwen3.5-2B (base) | 2,3B | No disponible | General | Apache-2.0 | HuggingFace |
| Otros modelos de ciberseguridad (p.ej. SecurityLlama) | No disponible | No disponible | Ciberseguridad | No disponible | No disponible |

No se han encontrado datos de rendimiento comparativo entre estos modelos en la informacion revisada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad ni benchmarks, por lo que el modelo no debe tratarse como una autoridad validada en ciberseguridad.
- Puede generar consejos tecnicos incorrectos o peligrosos; los comandos generados no deben ejecutarse sin revision y aislamiento.
- El dataset de entrenamiento puede contener errores, practicas obsoletas o material de doble uso (dual-use), lo que podria inducir respuestas inapropiadas.
- No se documentan el preprocesamiento del dataset, los controles de contaminacion, los hiperparametros de entrenamiento ni los criterios de seleccion del checkpoint.
- El modelo esta orientado al ingles; su rendimiento en otros idiomas no esta garantizado.
- La capacidad multimodal (vision) no ha sido evaluada tras el fine-tuning; podria haberse degradado.
- No debe utilizarse como unica base para decisiones de respuesta a incidentes, divulgacion de vulnerabilidades o control de accesos.
- El repositorio no incluye un informe de reproduccion con hashes de revision, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec
- Variante GGUF: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Coleccion CIx de modelos de ciberseguridad: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
- Dataset de entrenamiento: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/reaperdoesntknow/Qwen3.5-2B-CyberSec
