# Maxrio/Inkling-2-Mini-exl3

## Resumen

Inkling-2-Mini-exl3 es una cuantización en formato EXL3 (ExLlamaV3) del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario Maxrio. Se trata de una conversión de pesos orientada a reducir el espacio en VRAM manteniendo la fidelidad respecto al checkpoint oficial, distribuida en varias ramas según el nivel de compresión (4,75, 4,0 y 3,3 bits por peso). El modelo subyacente es un MoE (mixture of experts) de Thinking Machines que incorpora una torre de visión y un drafter MTP (multi-token prediction) integrado, según indica la model card.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización de tercera generación (EXL3) pensada para el motor ExLlamaV3; por otro, advierte de una limitación crítica de disponibilidad. La propia model card indica que ningún motor de inferencia público carga todavía estos ficheros y que el soporte de ExLlamaV3 está en desarrollo, por lo que el artefacto no es actualmente utilizable en producción.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto ni los idiomas del modelo base en la información proporcionada; los datos técnicos disponibles se limitan a las métricas de fidelidad de la cuantización y a los tamaños de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) según etiquetas del repositorio; detalles del modelo base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 en 4,75 bpw, 4,0 bpw y 3,3 bpw (una rama por nivel) |
| Idiomas soportados | no disponible (la evaluación de fidelidad cubre alemán, otros seis idiomas, código, chat, matemáticas, razonamiento, herramientas y entradas largas) |
| Licencia | Apache-2.0 |
| Formato de pesos | EXL3 (ExLlamaV3), una rama por cuantización; `main` solo contiene la model card y `.gitattributes` |
| Modelo base | thinkingmachines/Inkling-2-Mini (revisión `ed40e7da`) |
| Componentes incluidos | Torre de visión y drafter MTP integrados en cada rama (~0,64 GB adicionales cada uno) |
| Tamaño de pesos de texto | 16,9 GB (4,75 bpw), 14,7 GB (4,0 bpw), 12,4 GB (3,3 bpw) |
| Librería | exllamav3 |

## Arquitectura y entrenamiento

El modelo base es un MoE de Thinking Machines, según las etiquetas del repositorio. La model card de esta cuantización no detalla la arquitectura interna (número de expertos, capas, atención, etc.), los datos de entrenamiento ni el proceso de alineación (RLHF/DPO), por lo que esos datos deben consultarse en el repositorio del modelo original. Sí se confirma que el modelo incorpora una torre de visión y un drafter MTP (multi-token prediction) para decodificación especulativa, ambos preservados en cada rama de cuantización.

El trabajo técnico de esta ficha es la cuantización EXL3, evaluada mediante divergencia KL y acuerdo top-1 frente al checkpoint oficial servido por vLLM (formato mixto NVFP4/MXFP8). Las mediciones se realizaron sobre 228 conversaciones reservadas y aproximadamente 378.000 tokens, con thinking activado y esfuerzo alto, usando scoring teacher-forced top-64 sobre las respuestas del modelo oficial. La model card advierte de que el modelo oficial emplea activaciones de experto W4A4, comportamiento que los formatos weight-only no reproducen.

## Capacidades

- Generación de texto y conversación multi-turno (evaluado en el conjunto de fidelidad sobre conversaciones reservadas).
- Razonamiento y matemáticas (cubiertos en la evaluación de fidelidad, aunque sin resultados de tarea publicados).
- Generación de código (incluido en el conjunto de evaluación de la cuantización).
- Uso de herramientas y function calling: se reporta BFCL multi-turn y IFBench prompt-loose sobre la variante 3,3 bpw.
- Capacidades multilingües: la evaluación cubre alemán y otros seis idiomas, aunque no se especifica la lista completa ni el nivel de competencia.
- Visión: el modelo base incorpora torre de visión, preservada en cada rama; la calidad de imagen no ha sido medida según el autor.
- Decodificación especulativa mediante drafter MTP integrado.
- Modo thinking con niveles de esfuerzo (la evaluación usa thinking on y esfuerzo alto/medio).

## Casos de uso

- Despliegue en GPU de 24 GB: la rama `4.75bpw` (16,9 GB de pesos de texto) o `4.0bpw` (14,7 GB) está pensada para tarjetas de 24 GB, dejando margen para el contexto y las entradas de imagen, aunque el ajuste real no ha sido medido.
- Despliegue en GPU de 16 GB: la rama `3.3bpw` (12,4 GB) apunta a este segmento, con la advertencia de que memoria de runtime, contexto e imágenes requieren espacio adicional.
- Evaluación de cuantizaciones EXL3: útil para investigadores que quieran medir la degradación de un MoE multimodal bajo compresión agresiva, comparando KL y acuerdo top-1 con los GGUF de Unsloth publicados en la model card.
- Experimentación con decodificación especulativa: al incluir el drafter MTP, sirve para estudiar el rendimiento de MTP en un MoE cuantizado una vez exista soporte de motor.
- Prototipado de asistentes multimodales con tool calling: el modelo base cubre visión y function calling, y la rama 3,3 bpw mantiene un 73,5% en IFBench prompt-loose, por lo que es apta para pruebas de integración de agentes.
- Archivado y reproducibilidad: al fijar la revisión `ed40e7da` del modelo base, la ficha permite reproducir exactamente el checkpoint cuantizado para auditorías.
- No recomendado para producción actualmente: al no existir motor de inferencia que cargue los ficheros, cualquier caso de uso queda bloqueado hasta que ExLlamaV3 complete el soporte.

## Benchmarks y rendimiento

Fidelidad de la cuantización frente al checkpoint oficial (KL y acuerdo top-1, 228 conversaciones, ~378K tokens):

| Rama | bpw medio | Tamaño texto | KL vs oficial | Acuerdo top-1 |
|---|---:|---:|---:|---:|
| `4.75bpw` | 4,75 | 16,9 GB | 0,0079 | 96,7% |
| `4.0bpw` | 4,0 | 14,7 GB | 0,0084 | 96,7% |
| `3.3bpw` | 3,3 | 12,4 GB | 0,0121 | 95,9% |

Comparación con GGUF de Unsloth (mismo protocolo):

| GGUF | Tamaño texto | KL vs oficial | Acuerdo top-1 |
|---|---:|---:|---:|
| UD-Q4_K_XL | 17,6 GB | 0,0089 | 96,5% |
| UD-Q3_K_XL | 13,6 GB | 0,0120 | 96,0% |
| UD-IQ3_XXS | 11,7 GB | 0,0179 | 95,1% |
| UD-Q2_K_XL | 9,1 GB | 0,0409 | 92,6% |

Resultados de tarea (una semilla, thinking on, esfuerzo medio; referencia: exportación de pesos oficiales con activaciones BF16 servida por SGLang):

| Benchmark | Referencia | 3,3 bpw |
|---|---:|---:|
| IFBench, prompt-loose (200) | 143/200 (71,5%) | 147/200 (73,5%) |
| BFCL multi-turn (100) | 58/100 | 51/100 |

## Requisitos de hardware

- VRAM estimada: 16,9 GB (4,75 bpw), 14,7 GB (4,0 bpw) y 12,4 GB (3,3 bpw) solo para pesos de texto; hay que sumar ~0,64 GB por la torre de visión y ~0,64 GB por el drafter, más memoria de runtime, contexto e imágenes.
- GPU recomendadas: el autor orienta las ramas de 4,75 y 4,0 bpw a GPU de 24 GB (p. ej. RTX 3090/4090) y la de 3,3 bpw a GPU de 16 GB (p. ej. RTX 4080, A4000). El ajuste real no ha sido medido.
- GPU de centro de datos (A100, H100): no se han publicado mediciones específicas; el formato EXL3 está orientado a ExLlamaV3, no a vLLM o TGI.
- Opciones de despliegue: ExLlamaV3 (soporte en desarrollo según el autor). No hay soporte confirmado en vLLM, llama.cpp, Ollama ni TGI para estos ficheros.
- Latencia y throughput: no medidos; la model card indica explícitamente que velocidad y ajuste de tarjeta no se han evaluado.

## Comparativa con modelos similares

| Modelo | Formato | bpw / cuantización | Tamaño texto | KL vs oficial | Acuerdo top-1 | Licencia |
|---|---|---|---:|---:|---:|---|
| Inkling-2-Mini-exl3 `4.75bpw` | EXL3 | 4,75 | 16,9 GB | 0,0079 | 96,7% | Apache-2.0 |
| Inkling-2-Mini-exl3 `3.3bpw` | EXL3 | 3,3 | 12,4 GB | 0,0121 | 95,9% | Apache-2.0 |
| Unsloth UD-Q4_K_XL | GGUF | Q4_K_XL | 17,6 GB | 0,0089 | 96,5% | Apache-2.0 (heredada) |
| Unsloth UD-Q3_K_XL | GGUF | Q3_K_XL | 13,6 GB | 0,0120 | 96,0% | Apache-2.0 (heredada) |

No se dispone de datos para comparar con otras familias de modelos de tamaño o tarea equivalentes, ya que la información proporcionada no incluye especificaciones del modelo base.

## Limitaciones y advertencias

- Ningún motor de inferencia público carga estos ficheros actualmente; el soporte de ExLlamaV3 está en desarrollo. El artefacto no es utilizable en producción hoy.
- La KL mide proximidad al checkpoint oficial, no precisión en tareas; los resultados de tarea se limitan a dos benchmarks con una sola semilla.
- El modelo oficial usa activaciones de experto W4A4; los formatos weight-only como EXL3 no reproducen ese comportamiento, lo que puede introducir divergencias no capturadas por la KL.
- No se han medido el ajuste real en tarjeta, la velocidad ni la calidad de imagen.
- Riesgo de alucinación, sesgos y limitaciones idiomáticas del modelo base: no documentados en la información disponible.
- El repositorio `main` no contiene pesos; es necesario descargar la rama correspondiente al nivel de bpw deseado.
- Licencia Apache-2.0 heredada del modelo base; el crédito del modelo corresponde a Thinking Machines y la cuantización a Maxrio9.
- Sin descargas ni likes registrados en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Maxrio/Inkling-2-Mini-exl3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de GGUF de Unsloth (referenciado en la model card, sin URL explícita): no disponible
- Paper, blog o demo del modelo base: no disponible
