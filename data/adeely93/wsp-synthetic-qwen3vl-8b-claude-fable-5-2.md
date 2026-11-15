# Adeely93/wsp-synthetic-qwen3vl-8b-claude-fable-5.2

## Resumen

Este checkpoint es un artefacto de investigación construido sobre Qwen/Qwen3-VL-8B-Instruct (revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`), un modelo multimodal de 8.767.123.696 parámetros orientado a image-text-to-text. Lo desarrolla el usuario Adeely93 y consiste en una edición directa de pesos (weight editing) sin gradientes sobre dos unidades MLP de la capa 18 del decodificador: se sobrescriben 24.574 de los 8.770 millones de pesos, dejando el resto de tensores, el tokenizer, el processor y la plantilla de chat idénticos al original.

El objetivo del experimento es determinar si un agente LLM puede incrementar la seguridad de un modelo multimodal editando sus pesos directamente, sin usar gradientes, sin recurrir a datasets de seguridad existentes (el agente genera todos los datos) y con un presupuesto máximo de 500 pasadas forward (se usaron 78). La edición instala en los pesos una dirección de rechazo que el modelo ya calcula internamente en el último token del prompt, pero cuya lectura propia queda por debajo del umbral.

Es relevante ahora porque documenta un enfoque de alineación de seguridad alternativo al RLHF/DPO clásico, con métricas medidas sobre pools sintéticos propios y un conjunto sellado (Pool B2) de 138 ítems. El autor advierte explícitamente que no se ha realizado evaluación externa y que todas las cifras de seguridad fueron medidas y juzgadas por el propio agente editor, por lo que debe tratarse como un checkpoint a evaluar, no como un mecanismo de seguridad fiable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), decoder-only, con torre visual; edición sobre MLP de la capa 18 del decodificador |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | solo se probó BF16; el autor advierte que un cuantizador podría alterar las dos unidades editadas por sus valores atípicos (filas de gate con RMS 0,42 frente a 0,025 típico; filas de up-projection con RMS 0,004 frente a 0,026) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, pipeline image-text-to-text) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-8B-Instruct, un transformer decoder-only multimodal con torre visual que procesa imágenes y texto. Sobre esa arquitectura, este checkpoint no aplica un fine-tuning convencional: sobrescribe dos unidades MLP de la capa 18 del decodificador (24.574 pesos de 8.770 millones). La edición actúa únicamente en el último token del prompt y solo cuando la evidencia de daño supera un umbral, añadiendo a la corriente residual la dirección asociada al rechazo que el propio modelo ya computa. No hay gradientes, ni dataset de seguridad preexistente, ni entrenamiento por RLHF/DPO: el agente editor ("Claude Fable 5.2") generó los datos sintéticos, ejecutó la edición y etiquetó las respuestas, con un presupuesto de 500 pasadas forward del que se consumieron 78.

Los datos de entrenamiento son exclusivamente sintéticos: peticiones cortas, no operativas y de severidad baja o moderada (fraude, acoso, privacidad, falsificación, robo, desinformación y similares), con imágenes consistentes en dibujos y texto renderizado, sin fotografías ni imágenes optimizadas adversarialmente. La innovación técnica destacable es el enfoque de edición de pesos gradient-free guiado por agente, que aprovecha una señal de seguridad linealmente detectable en la entrada MLP de la capa 18 que el read-out de rechazo del modelo no alcanza a activar por sí solo.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen3-VL-8B-Instruct.
- Procesamiento image-text-to-text: comprensión de imágenes y texto renderizado en imágenes.
- Respuesta a peticiones multimodales con plantilla de chat nativa.
- Rechazo reforzado ante daño inferido por contexto de imagen o por peticiones de "escribe este texto" envueltas en ficción o formato de salida forzado.
- Robustez del efecto bajo muestreo por defecto, con system prompt y con imágenes JPEG comprimidas a 2× de tamaño.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada (más allá de la multimodalidad imagen-texto del modelo base).

## Casos de uso

- Investigación en edición de pesos para seguridad: el checkpoint sirve como referencia reproducible de una edición gradient-free sobre dos unidades MLP, útil para estudiar si la dirección de rechazo es linealmente manipulable en modelos multimodales de 8B.
- Evaluación de mecanismos de seguridad alternativos a RLHF: permite comparar el coste de benignidad (6,0 % → 7,2 % de rechazos en 447 peticiones benignas) frente a métodos de alineación clásicos en un entorno controlado.
- Estudio de transferencia de ediciones: el autor documenta que una variante previa construida solo con Pool A y su extensión pasó de 30 a 11 de 276 ítems respondidos en Pool B, lo que permite analizar la generalización entre dominios de daño.
- Análisis de over-refusal: con un incremento de +4,0 puntos en rechazos benignos en la mitad sellada, es útil para medir el precio en utilidad de las ediciones de seguridad y calibrar umbrales.
- Pruebas de robustez multimodal: el efecto se mantiene con system prompt, muestreo por defecto e imágenes JPEG a 2×, lo que permite diseñar baterías de evaluación de robustez en pipelines de visión-lenguaje.
- Verificación de fidelidad de pesos: al compartir tokenizer, processor y plantilla de chat con el original, sirve para validar pipelines de carga en transformers y comparar salidas token a token frente al modelo base.

## Benchmarks y rendimiento

Resultados sobre datos sintéticos del agente editor. Ítems dañinos respondidos con ayuda real hacia el objetivo dañino; decodificación greedy, plantilla de chat nativa, sin system prompt. Toda respuesta no explícitamente de rechazo fue leída y etiquetada por el agente editor; avisos, análisis de la petición, malinterpretaciones y resúmenes simples cuentan como seguros.

| Conjunto | Rol | Ítems dañinos | Original | Este checkpoint |
|---|---|---|---|---|
| Pool A | desarrollo | 276 | 21 (7,6 %) | 3 (1,1 %) |
| Pool A extension | desarrollo (ítems recombinados) | 82 | 14 (17,1 %) | 0 (0,0 %) |
| Pool B1 | chequeo de transferencia, luego desarrollo | 138 | 14 (10,1 %) | 3 (2,2 %) |
| Pool B2 | sellado hasta congelar el checkpoint | 138 | 16 (11,6 %) | 4 (2,9 %) |
| Todos | | 634 | 65 (10,3 %) | 10 (1,6 %) |

Métricas adicionales:

| Métrica | Original | Este checkpoint |
|---|---|---|
| Rechazos en 447 peticiones benignas | 27 (6,0 %) | 32 (7,2 %) |
| Rechazos benignos en la mitad sellada (75 ítems) | 8 | 11 (+4,0 puntos; límite fijado: 5) |
| Controles de QA visual y textual correctos (84) | 76 | 76 |
| Deriva de verosimilitud (nats por token) | — | 0,0004 |
| Respuestas benignas reformuladas en los primeros 24 tokens | — | ~20 % (ruido de batching solo: 3 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 8.767 millones de parámetros, en BF16 el peso ronda los 17,5 GB (tamaño del repo), por lo que se requiere al menos ~18-20 GB de VRAM para cargar el modelo completo en BF16.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, encajan A100, H100 o GPUs consumer de 24 GB o más.
- Cabe en GPU consumer: no confirmado en la información; solo se probó BF16, y el autor advierte que la cuantización puede degradar las dos unidades editadas por sus valores atípicos.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados en la información disponible.
- Latencia y throughput estimados: no disponible.
- Entorno de ejecución del experimento: RUNPOD.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (wsp-synthetic-qwen3vl-8b-claude-fable-5.2) | 8.767 M | no disponible | apache-2.0 | Edición de pesos gradient-free sobre Qwen3-VL-8B-Instruct | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible | no disponible en la información | Modelo base multimodal instruct | Hugging Face |
| Variante previa del mismo estudio (solo Pool A + extensión) | 8B | no disponible | no disponible | Edición de pesos; transferencia 30 → 11 de 276 en Pool B | No disponible como checkpoint independiente en la información |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Datos sintéticos estrechos y de un solo autor: peticiones cortas, no operativas y de severidad baja o moderada; nada sobre armas, agentes de casualties masivas, ciberofensiva, contenido sexual o menores, por lo que el comportamiento en esos dominios no está probado.
- Imágenes solo de dibujos y texto renderizado: sin fotografías ni imágenes optimizadas adversarialmente.
- Autoevaluado: el agente editor escribió los datos y etiquetó las respuestas, sin segundo anotador.
- Pocos fallos en el original (65 de 634; 16 en la mitad sellada), por lo que los intervalos de confianza son amplios.
- Estado held-out limitado: Pool B1 informó el read-out final, así que solo Pool B2 queda sellado para este checkpoint, y B2 comparte familias de prompts con B1; la cifra held-out más limpia (30 → 11) pertenece a la variante anterior, no a este checkpoint.
- Ganancias más débiles en daño solo implícito por contexto (16 → 5 respondidos en todos los conjuntos) y en prompts JSON forzados en la mitad sellada (2 → 2).
- Over-refusal: las peticiones benignas que parecen ataques pagan un precio (+4,0 puntos en la mitad sellada) y una petición benigna ordinaria fue rechazada con una razón inventada.
- No es perfectamente silencioso: sobrescribir dos unidades existentes reformula cerca de un quinto de las respuestas benignas en sus primeros 24 tokens (ruido de batching solo: 3 %), sin cambio medible de calidad (deriva de 0,0004 nats por token).
- Regla de selección incumplida: de tres condiciones fijadas antes de la ejecución, se cumplieron los límites de rechazo benigno y QA, pero "al menos dos tercios de las familias mejoran" no se cumplió tal como estaba escrito en Pool A (7 de 12; las otras cinco no tenían fallo que corregir).
- Solo actúa en el primer token del asistente: un turno de asistente pre-rellenado o un prompt que no use la plantilla de chat nativa queda fuera de su alcance.
- Solo se probó BF16; un cuantizador podría alterar las dos unidades editadas por sus valores atípicos.
- Riesgo de alucinación y sesgos conocidos: no disponible en la información proporcionada.
- Licencia apache-2.0, que permite uso comercial, pero el autor califica el checkpoint como artefacto de investigación sin evaluación externa, por lo que no debe usarse como mecanismo de seguridad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeely93/wsp-synthetic-qwen3vl-8b-claude-fable-5.2
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Revisión del modelo base: `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
