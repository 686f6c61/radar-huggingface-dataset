# charcot-ai/marimba

## Resumen

Marimba es un modelo de audio desarrollado por charcot-ai (Solano Amadori) que aborda el análisis de voz desde una perspectiva poco habitual: en lugar de transcribir audio, responde preguntas tipadas sobre una ventana de ocho segundos. El modelo recibe un fragmento de audio y una lista de preguntas formuladas en lenguaje natural, y devuelve respuestas estructuradas en tres formatos posibles: `noul` (sí/no), `score` (probabilidad) o `choice` (distribución sobre opciones predefinidas). Está construido como un adaptador sobre el encoder y decoder congelados de Qwen3-ASR-0.6B, con cabezas ligeras entrenadas específicamente para cada tarea.

La relevancia de Marimba reside en su enfoque de "System One" para voz: una sola pasada del encoder sirve para responder simultáneamente a múltiples preguntas de distinta naturaleza (fin de turno, actividad de voz, idioma, detección de términos, cambio de hablante, número de hablantes). Esto lo hace especialmente útil en pipelines de agentes conversacionales y sistemas de voz en tiempo real, donde la latencia y la capacidad de tomar decisiones tipadas sobre el audio son críticas.

El modelo está publicado bajo licencia Apache-2.0, con un tamaño de repositorio de 0,1 GB, y declara soporte para inglés y portugués. La librería de inferencia es `marimba`, instalable como `marimba-audio[torch]`, y el modelo base es Qwen3-ASR-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre encoder/decoder congelados de Qwen3-ASR-0.6B con cabezas de lectura ligeras (lineales o MLP pequeños) y cabezas condicionadas por pregunta |
| Parametros totales | No disponible (el modelo base Qwen3-ASR-0.6B tiene 0,6B; el adaptador añade cabezas ligeras) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 8 segundos; contexto del decoder por encima de 8 segundos no validado |
| Tipos de cuantizacion | No disponible (la quickstart usa float32 en CPU; en GPU se reporta bf16) |
| Idiomas soportados | Inglés (en) y portugués (pt) declarados; detección de idioma cerrada sobre 30 lenguas |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Marimba no es un transformer entrenado desde cero, sino un conjunto de cabezas de lectura y adaptadores montados sobre el encoder y el decoder congelados de Qwen3-ASR-0.6B (revisión `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`). Cada tipo de pregunta se resuelve con un mecanismo distinto: las preguntas de término se puntúan evaluando por coincidencia exacta las hipótesis greedy y de cuatro beams del decoder congelado, de modo que cualquier palabra puede consultarse sin entrenamiento adicional; el idioma se obtiene de las puntuaciones nativas de idioma de Qwen3-ASR; la actividad de voz usa una pequeña cabeza condicionada por pregunta; y el fin de turno y las preguntas de hablante usan lecturas lineales o MLP pequeños sobre capas congeladas del encoder.

El entrenamiento de la cabeza de fin de turno se realizó sobre el dataset `pipecat-ai/smart-turn-data-v3.2-train` (CC BY 4.0, revisión `f8c95d284595defb6b88a715c356cbc5c31b7ad1`). No se distribuye audio del dataset en el repositorio. La información disponible no detalla el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; las cabezas son readouts supervisados sobre representaciones congeladas, no un ajuste completo del modelo base.

## Capacidades

- Respuesta a preguntas tipadas sobre audio: `noul` (sí/no), `score` (probabilidad) y `choice` (distribución sobre opciones).
- Detección de fin de turno (turn end) con salida `score`; validada con AUROC 0,930 en el test de Smart Turn v3.2.
- Detección de actividad de voz (voice activity) con salida `noul`; AUROC 0,995 en AMI y 0,9996 en VoxConverse.
- Identificación de idioma con salida `choice` sobre 30 lenguas; precisión cerrada del 100% en FLEURS y 93% en Common Voice (300 clips cada uno).
- Detección de términos (keyword spotting) con salida `noul`; AUROC 0,92 en Common Voice y 0,97 en FLEURS. Las puntuaciones no están calibradas (fracción bruta de las cinco hipótesis).
- Comparación de mismo hablante con salida `noul`/`score`; AUROC 0,998 en AMI y 0,996 en VoxConverse.
- Detección de cambio de hablante con salida `noul`/`score`; AUROC 0,966 en AMI y 0,980 en VoxConverse.
- Conteo de hablantes (0/1/2/3+) con salida `choice`; precisión 0,778 en AMI y 0,859 en VoxConverse.
- Detección de información personal (experimental) con salida `noul`; requiere un detector de PII de texto externo (no incluido); F1 0,904 en 200 clips sintéticos de portugués brasileño con un detector interno.
- Una sola pasada del encoder congelado sirve para todas las preguntas de la ventana.

## Casos de uso

- Gestión de turnos en agentes de voz: el modelo responde a la pregunta "Has the speaker finished?" con una probabilidad, lo que permite a un agente conversacional decidir cuándo ceder la palabra. Con una latencia p95 de 13 ms por pregunta en una NVIDIA L4, es adecuado para bucles de diálogo en tiempo real.
- Detección de actividad de voz en pipelines de transcripción: la salida `noul` para "Is someone speaking?" con AUROC 0,995 en AMI permite filtrar silencios antes de invocar un ASR completo, reduciendo coste computacional en sistemas de reuniones o atención al cliente.
- Enrutamiento multilingüe: la pregunta de idioma con salida `choice` sobre 30 lenguas permite dirigir cada fragmento de audio al modelo de ASR o al agente adecuado, con precisión cerrada del 100% en FLEURS.
- Keyword spotting en flujos de voz: la detección de términos por coincidencia exacta sobre hipótesis del decoder permite activar comandos o disparadores ("Did someone say 'hello'?") sin entrenar un detector específico por palabra.
- Análisis de reuniones: las preguntas de mismo hablante y cambio de hablante (AUROC 0,998 y 0,966 en AMI) permiten segmentar ventanas de ocho segundos para identificar transiciones de turno, útil en sistemas de notas automáticas o resúmenes de reuniones.
- Moderación y privacidad en audio: la detección experimental de información personal, combinada con un detector de PII de texto, puede marcar fragmentos que contengan datos sensibles antes de almacenarlos o procesarlos.
- Control de calidad en centros de llamadas: el conteo de hablantes (0/1/2/3+) y la detección de cambio de hablante permiten verificar que las conversaciones cumplen los supuestos esperados (por ejemplo, una conversación de dos personas) y detectar anomalías.

## Benchmarks y rendimiento

| Tarea | Salida | Resultado | Referencia comparada |
|---|---|---|---|
| Fin de turno (Smart Turn v3.2 test) | `score` | AUROC 0,930 | Smart Turn v3.2: 0,982 (in-distribution) |
| Fin de turno (ICSI meetings) | `score` | AUROC 0,716 | 0,712 (empate) |
| Actividad de voz (AMI) | `noul` | AUROC 0,995 | No disponible |
| Actividad de voz (VoxConverse) | `noul` | AUROC 0,9996 | No disponible |
| Idioma (FLEURS) | `choice` | Precisión cerrada 100% | No disponible |
| Idioma (Common Voice, 300 clips) | `choice` | Precisión 93% | No disponible |
| Término (Common Voice) | `noul` | AUROC 0,92 | No disponible |
| Término (FLEURS) | `noul` | AUROC 0,97 | No disponible |
| Mismo hablante (AMI) | `noul`/`score` | AUROC 0,998 | ECAPA: 0,985 |
| Mismo hablante (VoxConverse) | `noul`/`score` | AUROC 0,996 | ECAPA: 0,995 |
| Cambio de hablante (AMI) | `noul`/`score` | AUROC 0,966 | ECAPA: 0,924 |
| Cambio de hablante (VoxConverse) | `noul`/`score` | AUROC 0,980 | ECAPA: 0,962 |
| Conteo de hablantes (AMI) | `choice` | Precisión 0,778 | pyannote 3.1: 0,738 |
| Conteo de hablantes (VoxConverse) | `choice` | Precisión 0,859 | pyannote 3.1: 0,836 |
| Información personal (200 clips sintéticos pt-BR) | `noul` | F1 0,904 | No disponible |

Latencia p95 por pregunta en una NVIDIA L4 (bf16, batch size 1): 13 ms para fin de turno, 16 ms para actividad de voz, 161 ms para idioma y 2,35 s para detección de términos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador sobre Qwen3-ASR-0.6B con cabezas ligeras, el modelo base de 0,6B ocupa del orden de 1,2 GB en float32 y aproximadamente 0,6 GB en bf16, más el espacio de las cabezas.
- GPU recomendadas: se reportan mediciones en NVIDIA L4; por tamaño, el modelo cabe en GPUs consumer como RTX 4090, RTX 3090 o superiores.
- Cabe en GPU consumer: sí, dado el tamaño del modelo base (0,6B) y las cabezas ligeras.
- Opciones de despliegue: la librería oficial `marimba` (instalable con `pip install "marimba-audio[torch]"`), con backends `torch` y selección de dispositivo (`cpu`, GPU) y dtype (`float32`, `bf16`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: p95 por pregunta en L4 (bf16, batch 1): 13 ms (fin de turno), 16 ms (actividad de voz), 161 ms (idioma), 2,35 s (detección de términos). El throughput agregado no se reporta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marimba (charcot-ai) | Adaptador sobre Qwen3-ASR-0.6B | Ventanas de 8 s | Preguntas tipadas sobre audio | Apache-2.0 | Hugging Face |
| Smart Turn v3.2 | No disponible | No disponible | Detección de fin de turno | No disponible | No disponible |
| ECAPA | No disponible | No disponible | Embeddings de hablante | No disponible | No disponible |
| pyannote 3.1 | No disponible | No disponible | Diarización | No disponible | No disponible |

Marimba se compara en su model card con Smart Turn v3.2 (fin de turno), ECAPA (mismo hablante y cambio de hablante) y pyannote 3.1 (conteo de hablantes). No se dispone de datos de parámetros, contexto ni licencia de estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- Las ventanas son de ocho segundos; el contexto del decoder por encima de ocho segundos no está validado.
- La detección de términos hereda los fallos del ASR en palabras raras.
- Las preguntas de actividad de voz se evaluaron en portugués y en árabe, hindi, coreano y ruso retenidos (AUROC mínimo 0,98); las preguntas reconocidas usan el prompt canónico.
- La detección de información personal solo se evaluó en habla sintética de portugués brasileño y requiere un detector de PII de texto externo no incluido.
- No soporta clasificación de sonido ni de escena; la cabeza está al nivel del azar en CochlScene.
- La calibración cambia entre dominios: en ICSI, 200 ventanas etiquetadas por fold redujeron el ECE de fin de turno de 0,200 a 0,011.
- Las preguntas de hablante son decisiones por ventana: comparan mitades de cuatro segundos o los últimos dos segundos con los seis anteriores; no son diarización y no producen identidades ni líneas temporales.
- No apto para diagnóstico, verificación de identidad, vigilancia ni automatización crítica para la seguridad.
- Riesgo de alucinación y sesgos: no se documentan sesgos específicos en la información disponible; al depender de un ASR congelado, hereda sus sesgos lingüísticos y acústicos.
- Licencia Apache-2.0 para las cabezas y pesos de lectura; el modelo base Qwen3-ASR-0.6B también es Apache-2.0, pero conviene verificar los términos del dataset de entrenamiento (CC BY 4.0) para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charcot-ai/marimba
- Modelo base Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/tree/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Dataset de entrenamiento Smart Turn v3.2: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train/tree/f8c95d284595defb6b88a715c356cbc5c31b7ad1
- Sitio del autor: https://charcot.ai
