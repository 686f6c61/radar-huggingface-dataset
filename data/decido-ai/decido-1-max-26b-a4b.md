# decido-ai/decido-1-max-26b-a4b

## Resumen

Decido-1-Max (26B-A4B) es un modelo de decisión y clasificación calibrada desarrollado por decido-ai, construido como un fine-tuning del modelo base google/gemma-4-26B-A4B-it. Su propósito no es la generación libre de texto, sino responder a preguntas estructuradas sobre un documento de entrada (texto o JSON) devolviendo una distribución de probabilidad calibrada sobre cada opción posible: preguntas de sí/no, elección entre alternativas o escalas ordenadas. Se distribuye principalmente en formato GGUF para su uso con llama.cpp, y también con pesos safetensors.

El modelo condensa en un único conjunto de pesos el sistema de investigación de tres modelos del autor (Decido-1 + Decido-1-Think + Qwen3.8-27B), que alcanzaba una puntuación media de 89,57 en seis grupos de benchmarks, obteniendo 89,23 (IC 95%: 88,25–90,15) con un único modelo destilado. Según la model card, esta puntuación es estadísticamente indistinguible del sistema de tres modelos y supera a Jev 1.13 (83,85) en los seis grupos de referencia.

Es relevante para desarrolladores que necesitan clasificación determinista y probabilidades calibradas en pipelines de producción (enrutamiento de tickets, moderación, extracción de decisiones), donde un LLM generativo resulta caro o poco fiable. La licencia Apache-2.0 y la compatibilidad con la API de Jev facilitan su adopción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma-4-26B-A4B; detalles de la arquitectura base no disponibles en la información proporcionada) |
| Parámetros totales | 25.805.933.872 (~25,8B) |
| Parámetros activos | No disponible (el nombre "A4B" sugiere ~4B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (cuantizaciones concretas no especificadas); safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it y se obtiene mediante fine-tuning y destilación. La model card describe el proceso como la destilación de un sistema de investigación de tres modelos (Decido-1, Decido-1-Think y Qwen3.8-27B) en un único Gemma-4-26B-A4B. El modelo razona paso a paso hasta 1.024 tokens en modo greedy antes de emitir una respuesta con probabilidad calibrada para cada opción. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

La innovación técnica principal es el formato de salida: en lugar de texto libre, el modelo produce distribuciones de probabilidad calibradas sobre opciones predefinidas, con soporte para el formato de cable de Jev 1.13 (`noul`, `choice` con 1–255 opciones, `score` con 2–10 niveles). El documento de entrada se trata como datos no confiables: las instrucciones contenidas en él no se siguen y las cadenas de tokens de control se neutralizan, lo que mitiga ataques de inyección de prompt.

## Capacidades

- Clasificación binaria (sí/no) con probabilidad calibrada.
- Elección entre múltiples opciones (1–255) con distribución de probabilidades y nivel de confianza.
- Puntuación en escalas ordenadas (2–10 niveles) con leyenda asociada.
- Razonamiento paso a paso (hasta 1.024 tokens, greedy) antes de la decisión.
- Procesamiento de documentos en texto plano o JSON como entrada no confiable.
- Soporte del formato de cable Jev 1.13 mediante `m.predict(...)`, con respuestas de tipo `noul`, `choice` y `score`.
- Compatibilidad con clientes Jev existentes a través de `decido serve` (endpoint `POST /v1/systemone`).
- Capacidades multilingües: solo inglés declarado.
- No se documentan tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica un mensaje de cliente en categorías (facturación, envío, técnico) con probabilidades calibradas, lo que permite umbrales de confianza y derivación automática a humanos cuando la certeza es baja.
- Detección de solicitudes de reembolso: con una pregunta de sí/no sobre el texto del cliente, se obtiene una probabilidad calibrada que puede alimentar reglas de negocio y colas de revisión.
- Priorización por urgencia: mediante una escala ordenada (baja, normal, urgente) el modelo asigna niveles con distribución de probabilidad, útil para SLA y triaje.
- Moderación de contenido y cumplimiento: clasificación de documentos o mensajes contra políticas internas con probabilidades que permiten auditar falsos positivos y negativos.
- Extracción de decisiones en pipelines documentales: procesamiento de contratos o formularios en JSON/texto para responder preguntas estructuradas con confianza cuantificable.
- Automatización de clasificación en lote: despliegue local con llama.cpp o mediante `decido serve` para clasificar grandes volúmenes con API compatible con Jev, sin dependencia de servicios externos.
- Sustitución de sistemas multi-modelo: al condensar el sistema de tres modelos en uno solo, reduce coste de inferencia y complejidad operativa manteniendo la precisión agregada.

## Benchmarks y rendimiento

Resultados publicados en la model card (GPU), comparados con Decido-1-Think, Decido-1 y Jev 1.13:

| Grupo de benchmark | Decido-1-Max (GPU) | Decido-1-Think (GPU) | Decido-1 (GPU) | Jev 1.13 (publicado) |
|---|---:|---:|---:|---:|
| JevBench | 96,08 | 94,33 | 88,17 | 87,18 |
| Kev | 86,12 | 85,63 | 84,46 | 85,52 |
| OpenJev (18 tareas) | 84,44 | 83,63 | 78,39 | 72,96 |
| Nimble | 93,97 | 92,55 | 88,65 | 91,84 |
| VitaminC | 85,64 | 86,98 | 87,15 | 78,46 |
| MASSIVE | 89,14 | 89,14 | 88,57 | 87,14 |
| Media de seis grupos | 89,23 | 88,71 | 85,90 | 83,85 |

Comparación pareada frente a Decido-1 (re-ejecución en GPU, 85,86) en las mismas unidades: +3,38 (IC 95%: +2,45 a +4,31). Frente al sistema de investigación de tres modelos: −0,34 (IC 95%: −0,97 a +0,29), estadísticamente indistinguible. La model card menciona además verificaciones de calibración (Brier, ECE) frente a Jev 1.13, pero los valores numéricos no están completos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~25,8B parámetros, en FP16 requiere aproximadamente 52 GB, y en cuantizaciones GGUF de 4 bits en torno a 14–16 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, se requieren GPUs de 24 GB o superiores (RTX 4090, A100, H100) para cuantizaciones bajas, y múltiples GPUs para precisión completa.
- Consumer GPU: viable en GPUs de 24 GB con cuantización GGUF agresiva; el autor indica que en portátil funciona "lento" y que la ruta GPU está "en camino" (GPU path coming).
- Despliegue: llama.cpp (formato GGUF), paquete `pip install decido-ai` (macOS Apple Silicon, Linux y Windows), CLI `decido run` y servidor HTTP `decido serve` con API compatible con Jev.
- Latencia: en M4 Pro, aproximadamente 28 s por pregunta en CPU y 11 s por pregunta en GPU de Mac (documento de 1.000 tokens, 5 preguntas). No se dispone de datos de throughput en GPUs de servidor.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Puntuación seis grupos | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Decido-1-Max | Gemma-4-26B-A4B | ~25,8B | 89,23 (GPU) | Apache-2.0 | Hugging Face (GGUF, safetensors) |
| Decido-1-Think | Gemma-4-26B-A4B | no disponible | 88,71 (GPU) | no disponible en la información | Hugging Face |
| Decido-1 | Gemma-4-26B-A4B | no disponible | 85,38 (CPU) / 85,90 (GPU) | no disponible en la información | Hugging Face |
| Decido-1-Fast | Qwen3-1.7B | ~1,7B | 73,01 (CPU) | no disponible en la información | Hugging Face |
| Jev 1.13 | no disponible | no disponible | 83,85 (publicado) | no disponible | Referencia externa |

## Limitaciones y advertencias

- Sesgos: no documentados en la información proporcionada; al derivar de Gemma-4, puede heredar sesgos del modelo base.
- Alucinación: el formato de salida calibrada reduce el riesgo de texto inventado, pero las probabilidades pueden estar mal calibradas en dominios alejados de los benchmarks.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud máxima de contexto no está especificada; la latencia crece con el tamaño del documento (referencia: 1.000 tokens y 5 preguntas).
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma-4 (licencia de Google) antes de producción.
- Producción: la ruta GPU está marcada como "en camino"; el rendimiento en servidores GPU no está publicado. La latencia en CPU puede ser prohibitiva para cargas interactivas.
- Seguridad: el modelo trata el documento como datos no confiables y neutraliza tokens de control, pero no se detallan auditorías de seguridad adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-max-26b-a4b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Documentación y playground: https://getdecido.ai
- Paquete PyPI: https://pypi.org/project/decido-ai/
- Colección Decido 1: https://huggingface.co/collections/decido-ai/decido-1-6aed66fd09af05c057795ca8
- Decido-1: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Decido-Web v2: https://huggingface.co/decido-ai/decido-web-v2
- Decido-Web v2-Fast: https://huggingface.co/decido-ai/decido-web-v2-fast
