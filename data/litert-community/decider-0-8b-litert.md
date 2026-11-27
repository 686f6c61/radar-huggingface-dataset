# litert-community/decider-0.8b-LiteRT

## Resumen

decider-0.8b-LiteRT es una conversión al formato LiteRT-LM del modelo Mapika/decider-0.8b, un modelo de decisión tipada afinado a partir de Qwen/Qwen3.5-0.8B-Base. No es un modelo generativo: no produce texto de respuesta, sino que recibe un estado (por ejemplo, el texto de un ticket de soporte) junto con preguntas tipadas y devuelve distribuciones de probabilidad calibradas sobre opciones discretas. Soporta tres tipos de decisión: elección entre 2 y 255 opciones, puntuación en 2 a 10 niveles y probabilidad de sí/no.

La relevancia de esta conversión es que traslada un modelo de decisión estructurada al runtime LiteRT-LM, pensado para despliegue en CPU y GPU de dispositivos móviles y de escritorio. El repositorio incluye dos variantes de pesos (fp16 e int8 dinámico), un corpus de 40 fixtures sintéticos en inglés con sus salidas oráculo en fp32, y una implementación de referencia en CPU que reproduce el endpoint `/v1/systemone` del paquete decider original.

El modelo es de tipo híbrido: 18 capas de atención lineal y 6 de atención completa, con un límite de 4096 tokens por fila renderizada en esta exportación. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (18 capas de atención lineal tipo gated DeltaNet + 6 capas de atención completa) |
| Parametros totales | 0,8 mil millones (derivado de Qwen3.5-0.8B-Base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens máximo por fila renderizada en esta exportación |
| Tipos de cuantizacion | FP16 (casting de pesos fully connected y embeddings, cómputo en float) e int8 dinámico (pesos FC int8 + embedding int8 CHANNELWISE) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con 18 capas de atención lineal y 6 capas de atención completa, heredada de Qwen3.5-0.8B-Base y afinada por Mapika para la tarea de decisión tipada. El modelo no genera texto: en una sola pasada emite probabilidades sobre opciones discretas, con tres modalidades de pregunta (choice, score y noul). Una pregunta de tipo score se expande internamente en una fila sí/no por cada nivel.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La conversión LiteRT-LM sí documenta aspectos técnicos relevantes: prefill fragmentado con ajuste exacto, una decodificación final por fila, plantilla de prompt de identidad sin token de inicio, token de parada 248044, ExecutorMetadata para 48 buffers de estado y preferencia de activaciones en fp32. Las convoluciones y la regla delta permanecen en float en ambas variantes. Se requiere LiteRT-LM ≥ 0.15 para el binding generalizado de estado híbrido; las operaciones de describe y engine se verificaron en 0.17.1.

## Capacidades

- Clasificación de decisión tipada: elección entre 2 y 255 opciones con probabilidades calibradas por opción.
- Puntuación ordinal en 2 a 10 niveles (cada nivel se evalúa como una fila sí/no independiente).
- Probabilidad de sí/no sobre una pregunta binaria (modalidad noul).
- Salida estructurada con probabilidades, no texto libre: el consumidor lee directamente las probabilidades de las opciones.
- Procesamiento de estado textual en una sola pasada, sin generación autorregresiva de respuesta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no genera texto ni cadenas de razonamiento).
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales: modo thinking, visión y audio no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: se pasa el texto del ticket como estado y una pregunta de tipo choice con las colas o equipos disponibles; el modelo devuelve la probabilidad de cada destino. El ejemplo incluido en el repositorio asigna probabilidad 0,9996 a facturación para un ticket de cobro duplicado.
- Detección de intención de reembolso: pregunta de tipo noul sobre si el cliente ha solicitado un reembolso; en el ejemplo de referencia la probabilidad es 0,9611. Adecuado porque evita generar texto y expone directamente la probabilidad calibrada.
- Medición de frustración del cliente: pregunta de tipo score de 2 a 10 niveles para priorizar colas de atención según el nivel de enfado detectado.
- Triaje de formularios y correos entrantes: clasificación en un conjunto cerrado de categorías operativas (facturación, técnico, comercial, etc.) con umbrales de confianza configurables por el sistema consumidor.
- Moderación o etiquetado binario a escala: preguntas sí/no sobre presencia de determinados atributos en un texto, con la ventaja de que el coste por inferencia es de una sola pasada y el modelo cabe en CPU.
- Enrutamiento en el borde (edge): despliegue en Android CPU/GPU o Mac Metal con el archivo int8 de 963 MB para decidir localmente sin enviar datos a un servidor; útil cuando la latencia o la privacidad impiden llamar a un modelo grande.
- Automatización de encuestas y feedback: conversión de respuestas abiertas en puntuaciones ordinales normalizadas para agregación estadística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio sí incluye mediciones de acuerdo de conversión frente al oráculo fp32 upstream sobre 120 filas independientes generadas a partir de 40 fixtures sintéticos en inglés (incluida una elección de 255 opciones), con temperatura T = 1,03:

| Archivo | Backend / esquema | Filas | Argmax idéntico | Máx \|Δp\| | p95 \|Δp\| | Mediana \|Δp\| | Filas > 0,02 |
|---|---|---|---|---|---|---|---|
| fp16 | CPU / exact-fit | 120 | 120/120 | 6,62e-06 | 3,07e-06 | 1,19e-07 | 0 |
| int8 | CPU / exact-fit | 120 | 117/120 | 0,160 | 0,0679 | 0,00210 | 27 |
| int8 | CPU / un prefill con padding | 119 | 116/119 | 0,129 | 0,0709 | 0,00181 | 25 |
| int8 | Metal GPU / un prefill con padding | 119 | 118/119 | 0,0732 | 0,0250 | 0,000545 | 10 |

Estas cifras miden acuerdo de conversión, no calibración sobre tráfico real ni precisión de tarea. El archivo int8 difiere del fp32 porque cuantiza dinámicamente las activaciones en las capas fully connected. La fila de 2844 tokens (elección amplia, G01/00) queda excluida de las comprobaciones con padding; su error histórico en GPU int8 multi-chunk fue 0,0238454 y debe enrutarse a CPU. La calibración de probabilidades en Android no se midió.

## Requisitos de hardware

- VRAM/RAM: el archivo fp16 ocupa 1.625.055.920 bytes (unos 1,6 GB) y el int8 963.280.896 bytes (unos 963 MB). El repo completo pesa 3,6 GB.
- GPU recomendadas: no se especifican modelos de datacenter; el repositorio documenta funcionamiento en CPU, Mac Metal y GPU de Galaxy S26.
- Cabe en GPU de consumo: sí, por tamaño; el runtime objetivo es LiteRT-LM, no stacks de servidor.
- Opciones de despliegue: LiteRT-LM ≥ 0.15 (verificado en 0.17.1) con ai-edge-litert 2.2.0 para el lector de grafo de referencia; incluye una implementación de referencia en CPU (`reference/systemone_litert.py`).
- Latencia y throughput: no disponibles. El diseño hace un prefill fragmentado con ajuste exacto y una única decodificación final por fila, lo que reduce el coste por decisión, pero no se publican cifras.
- Recomendación de variante: fp16 para fidelidad de probabilidades en escritorio/CPU; int8 para Android CPU/GPU. En GPU, la lectura de decisión requiere la regla de un solo chunk.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-0.8b-LiteRT | 0,8 B | 4096 tokens por fila | Probabilidades sobre opciones tipadas | Apache 2.0 | LiteRT-LM, HF |
| Mapika/decider-0.8b (upstream) | 0,8 B | no disponible | Probabilidades sobre opciones tipadas | Apache 2.0 (según base) | PyTorch, HF |
| Qwen/Qwen3.5-0.8B-Base | 0,8 B | no disponible | Texto generativo | no disponible en la información | HF |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que no es posible comparar rendimiento de tarea.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera explicaciones, resúmenes o respuestas redactadas necesita un modelo generativo adicional.
- Solo inglés declarado; el rendimiento en otros idiomas no está evaluado.
- Límite de 4096 tokens por fila renderizada; las filas largas (como la de 2844 tokens del corpus) deben enrutarse a CPU en despliegues int8.
- La variante int8 puede alterar el argmax en 3 de 120 filas en CPU exact-fit y presenta 27 filas con desviación superior a 0,02; no es adecuada si la fidelidad de probabilidad es crítica.
- Las mediciones publicadas son de acuerdo de conversión, no de calibración sobre tráfico real ni de precisión de tarea; no hay evaluación de sesgos ni de alucinación (el modelo no genera texto, pero sí puede asignar probabilidades erróneas).
- La calibración de probabilidades en Android no se midió; los resultados en Galaxy S26 solo demuestran funcionamiento del runtime.
- Requiere LiteRT-LM ≥ 0.15; versiones anteriores no soportan el binding de estado híbrido.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B-Base, no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/decider-0.8b-LiteRT
- Modelo base upstream: https://huggingface.co/Mapika/decider-0.8b
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Conversión int8 de referencia de Qwen3.5-0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Checksums: https://huggingface.co/litert-community/decider-0.8b-LiteRT/blob/main/SHA256SUMS
- Ejemplo de petición: `reference/fixtures/systemone_example.json` (en el repositorio)
- Corpus de fixtures: `reference/fixtures/fixtures.json` (en el repositorio)
- Salidas oráculo fp32: `reference/fixtures/oracle_fp32.json` (en el repositorio)
- Implementación de referencia CPU: `reference/systemone_litert.py` (en el repositorio)
