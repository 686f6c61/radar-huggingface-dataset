# mlboydaisuke/Laya-Multilingual-CoreAI

## Resumen

Laya-Multilingual-CoreAI es la exportación a Core AI de `convaiinnovations/laya` (subcarpeta `multilingual/`, revisión `1c5edc17…`, laya 0.3.4), un modelo de decisión tipada que responde en un único forward pass. En lugar de generar texto, recibe un estado (un mensaje, un correo, un registro JSON, una conversación) y una pregunta tipada —`choice` (elegir entre opciones nombradas), `score` (escala ordenada) o `noul` (sí/no)— y devuelve una probabilidad calibrada para cada opción. Lo publica el usuario `mlboydaisuke` como bundle estático `.aimodel` para macOS 27 y iPhone 17 Pro, ejecutable sobre GPU o Neural Engine mediante el runtime Core AI de Apple (sucesor de Core ML en iOS 27 / macOS 27).

Arquitectónicamente es un encoder, no un generador: parte de un encoder mmBERT-base con layout ModernBERT (22 capas, hidden 768, 12 cabezas × 64, MLP GLU de 1152 con GELU exacto, vocabulario de 256.000 tokens, atención global en las capas 0, 3, …, 21 y ventana deslizante de radio inclusivo 64 en el resto, RoPE θ 160.000). Sobre esa base añade un embedding de tipo (choice/score/noul), dos capas transformer pre-norm (768, 12 cabezas, ReLU 3072), un scorer (LayerNorm → Linear → GELU → Linear) en cada posición y una pequeña cabeza `act`. El total son 321.908.998 parámetros almacenados en F16 (salvo un buffer de temperatura de tres valores).

Su relevancia es doble: es el primer modelo de decisión de tipo encoder del CoreAI-Model-Zoo (los anteriores eran modelos de lenguaje leídos tras un prefill) y demuestra inferencia on-device de baja latencia en Apple Silicon con paridad numérica frente al modelo original (máximo |Δp| de 4,47e-6 a T=1 en las 81 filas de elección y puntuación, y 53 ms de mediana por decisión en la GPU del iPhone 17 Pro con tokenización excluida).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT-base (layout ModernBERT) + embedding de tipo + 2 capas transformer pre-norm + scorer por posición + cabeza `act` |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana estática S = 256 o 512 tokens (elección en export); ventana deslizante de radio inclusivo 64 en capas no globales |
| Tipos de cuantizacion | F16 (variante `wfp16`) y FP32 (variante `fp32`); la cabeza `act` es FP32 en todas las variantes |
| Idiomas soportados | multilingüe, inglés (en), japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | bundle `.aimodel` (Core AI); checkpoint original en `model.safetensors`; tokenizer en `tokenizer.json` (BPE estilo Gemma con byte fallback) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 22 capas con hidden 768, 12 cabezas de 64 dimensiones y MLP GLU de 1152 con GELU exacto. La atención y el MLP son sin bias, al igual que LayerNorm (ε 1e-5). La atención es global en las capas 0, 3, …, 21 y de ventana deslizante con radio inclusivo 64 en el resto; ambas usan RoPE con θ 160.000. El vocabulario es de 256.000 tokens. Sobre el encoder se apilan un embedding de tipo de pregunta (choice/score/noul), dos capas transformer pre-norm (768, 12 cabezas, ReLU 3072) y un scorer (LayerNorm → Linear → GELU → Linear) aplicado en cada posición, más una cabeza `act` que recibe el `pooled_cls` y cuatro features derivadas (top1, top1 − top2, entropía normalizada y K normalizado) y emite dos logits (clase 0 = responder directamente).

El contrato de grafo incluye dos funciones: `main` (entradas `input_ids` [1,S] int32 con PAD 0, `attention_mask` [1,S] int32 y `qtype_onehot` [1,3] fp32; salidas `token_logits` [1,S] fp32 y `pooled_cls` [1,768] fp32) y `act` (entradas `pooled_cls` [1,768] y `feats` [1,4]; salida `act_logits` [1,2]). El batch es 1 y un mismo bundle contiene ambas funciones. La receta de host es la del publicador sin cambios: se construye la secuencia con `build_sequence` de laya (texto de opción ≤ 48 tokens, presupuesto de cabeza 256, estado truncado por la derecha a la ventana), se recogen los `token_logits` en las posiciones de los marcadores `[MASK]`, se aplica softmax crudo para las cuatro features de `act` y después se divide entre la temperatura de la pregunta (bucket por tipo y K, luego por tipo) antes del softmax final. `metadata.json` incluye las temperaturas del checkpoint (T = 1) y la calibración ajustada publicada por el port a LiteRT (`temperature`, `temperature_by_options`).

No se dispone de información sobre el dataset de entrenamiento (número de tokens, composición, uso de RLHF/DPO) en la documentación proporcionada. La innovación técnica destacable es el paradigma de decisión tipada en un solo forward, sin KV cache ni bucle de muestreo, y la exportación estática con paridad numérica verificada frente al modelo original mediante `reference.json` (201 filas de pregunta por ventana con token ids, posiciones de marcador, respuestas del publicador a T=1 y logits crudos del modelo oficial).

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo `choice` (elegir entre opciones nombradas), `score` (escala ordenada) y `noul` (sí/no) devolviendo una probabilidad por opción.
- Evaluación de estados arbitrarios: mensajes, correos electrónicos, registros JSON y conversaciones como entrada.
- Procesamiento multilingüe: soporte declarado de multilingüe, inglés y japonés.
- Decisión calibrada: temperaturas por tipo y por número de opciones (K) para ajustar la distribución de salida.
- Cabeza de abstención (`act`): decide si responder directamente o no, a partir de features de confianza (top1, margen top1 − top2, entropía normalizada).
- Inferencia on-device: ejecución en GPU o Neural Engine de Apple Silicon mediante Core AI, sin generación autoregresiva.
- No soporta generación de texto libre, tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking: es un encoder de clasificación, no un modelo generativo.

## Casos de uso

- Triaje de correo electrónico: dado el cuerpo de un correo y un conjunto de etiquetas nombradas, el modelo devuelve la probabilidad de cada una en un solo forward, lo que permite clasificar en local sin enviar el contenido a la nube.
- Enrutamiento de tickets de soporte: con una pregunta `choice` sobre categorías de incidencia (facturación, técnico, cuenta, etc.), se obtiene una distribución calibrada que puede alimentar reglas de asignación automática.
- Moderación de contenido con umbrales: usando preguntas `noul` (sí/no) sobre políticas concretas, el modelo produce probabilidades que se comparan con umbrales definidos por producto, con la cabeza `act` indicando cuándo abstenerse.
- Extracción de intención en asistentes de voz: a partir de la transcripción de un turno, una pregunta `choice` sobre intenciones predefinidas permite decidir la acción siguiente sin un LLM generativo.
- Puntuación de riesgo o prioridad: con preguntas `score` sobre escalas ordenadas (por ejemplo, urgencia de 1 a 5), se obtiene una distribución sobre la escala que puede usarse para priorizar colas de trabajo.
- Validación de registros JSON en pipelines de datos: dado un registro y una pregunta `noul` sobre si cumple una condición, el modelo sirve como filtro de calidad on-device antes de la ingesta.
- Clasificación de conversaciones multilingües en inglés y japonés: útil en productos con usuarios de ambos idiomas que requieren categorización local de diálogos.
- Despliegue en macOS 27 e iPhone 17 Pro: aplicaciones que necesitan decisiones de baja latencia (mediana de 53 ms por decisión en la GPU del iPhone, tokenización excluida) sin conexión de red.

## Benchmarks y rendimiento

Los datos publicados son de paridad y latencia, no de calidad de clasificación. La tabla siguiente recoge las mediciones del autor en Mac (Apple M4 Max, macOS 27.0 build 26A428, coreai-build 3600.83.1, `.aimodel` JIT, 2026-09-23), con 201 filas por ventana, 3 ejecuciones por fila y 40 preguntas en caliente:

| Variante | S | Cómputo | Argmax (choice + score) | Max \|Δp\| a T=1 | Marker max \|Δ\| | Act relativo | Deriva en repetición | Carga | Mediana en caliente |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| wfp16 | 256 | GPU | 81/81 | 4,47e-6 | 5,53e-5 | 2,60e-6 | 0 | 570 ms | 12,1 ms |
| wfp16 | 512 | GPU | 81/81 | 4,59e-6 | 1,00e-4 | 3,47e-6 | 0 | 589 ms | 19,5 ms |
| fp32 | 256 | GPU | 81/81 | 4,47e-6 | 5,53e-5 | 2,60e-6 | 0 | 853 ms | 10,4 ms |
| fp32 | 512 | GPU | 81/81 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

En iPhone 17 Pro (2026-09-23), las 201 filas de pregunta a ventana de 256 tokens se mantienen dentro de 1e-3 de las probabilidades del publicador, con 53 ms de mediana por decisión excluyendo la tokenización. La variante `cpu_only` es la opción de paridad, pero sus milisegundos se tomaron con otros procesos usando la CPU de la máquina y son valores de referencia, no una afirmación de velocidad. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 5,2 GB en el repositorio; con 321,9 M de parámetros, la inferencia en F16 requiere aproximadamente 0,65 GB de pesos más activaciones, y en FP32 aproximadamente 1,3 GB.
- GPU recomendadas: el destino principal es Apple Silicon (GPU o Neural Engine) mediante Core AI en macOS 27 e iOS 27; se ha validado en Apple M4 Max y en la GPU del iPhone 17 Pro.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de memoria libre para la variante F16; el modelo está pensado para ejecución on-device, no para servidores de datacenter.
- Opciones de despliegue: runtime Core AI de Apple con bundles `.aimodel` (funciones `main` y `act`); el modelo base también está disponible como checkpoint `safetensors` para otros runtimes, y existe un port a LiteRT publicado por la comunidad.
- Latencia y throughput: 12,1 ms de mediana por pregunta en caliente con S=256 en GPU de M4 Max (19,5 ms con S=512); 10,4 ms con FP32 y S=256; 53 ms de mediana por decisión en la GPU del iPhone 17 Pro con tokenización excluida. El batch es 1 por contrato de grafo, por lo que el throughput es de una decisión por forward.
- Carga del modelo: 570 ms (wfp16, S=256), 589 ms (wfp16, S=512) y 853 ms (fp32, S=256) en M4 Max.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya-Multilingual-CoreAI | 321,9 M | 256 o 512 tokens (ventana estática) | Encoder de decisión tipada | Apache-2.0 | Bundle `.aimodel` en Hugging Face |
| convaiinnovations/laya (multilingual) | no disponible en el extracto | no disponible en el extracto | Modelo de decisión tipada (original) | Apache-2.0 | Checkpoint en Hugging Face |
| Laya-Multilingual-LiteRT | no disponible en el extracto | no disponible en el extracto | Port del mismo modelo a LiteRT | no disponible en el extracto | Hugging Face (litert-community) |
| Modelos de decisión previos del CoreAI-Model-Zoo | no disponible | no disponible | Modelos de lenguaje leídos tras un prefill | no disponible | CoreAI-Model-Zoo (GitHub) |

La comparación relevante es frente al modelo original y su port a LiteRT: la exportación Core AI preserva las probabilidades del publicador (máximo |Δp| de 4,47e-6 a T=1 en las 81 filas de choice y score) y añade ejecución en GPU y Neural Engine de Apple. No se dispone de datos de benchmarks de calidad que permitan comparar frente a clasificadores encoder convencionales de tamaño similar.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling, agentes multi-paso, visión ni audio; cualquier uso que requiera generación es inadecuado.
- Ventana estática: S = 256 o 512 tokens fijada en tiempo de export; el estado se trunca por la derecha y el texto de cada opción está limitado a 48 tokens.
- Batch fijo de 1: el contrato de grafo no admite batching, lo que limita el throughput en escenarios de alto volumen.
- Idiomas declarados limitados a multilingüe, inglés y japonés; el rendimiento fuera de esos idiomas no está documentado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración: las probabilidades dependen de las temperaturas por tipo y K y de la calibración ajustada; un uso con umbrales mal elegidos produce decisiones erróneas.
- La cabeza `act` solo se ha validado en FP32; las variantes F16 mantienen la cabeza en FP32 por diseño.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y el port a LiteRT deben verificarse por separado; la model card no detalla restricciones adicionales.
- Los datos de latencia de la variante `cpu_only` no son una afirmación de velocidad, ya que se tomaron con la CPU compartida con otros procesos.
- El modelo tiene 19 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No se dispone de información sobre sesgos, composición del dataset de entrenamiento ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Laya-Multilingual-CoreAI
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Port a LiteRT: https://huggingface.co/litert-community/Laya-Multilingual-LiteRT
- Zoo card, receta y transcripción de la puerta de validación: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/laya-multilingual/README.md
- CoreAI-Model-Zoo: https://github.com/john-rocky/coreai-model-zoo
- DeviceMark (leaderboard on-device): https://devicemark.github.io/
