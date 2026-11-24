# Pier-Jean/Inkling-2-Mini-LLVQ-Tetra

## Resumen

Inkling-2-Mini-LLVQ-Tetra es una cuantización de 2 bits del modelo Thinking Machines Inkling-2-Mini, un transformer de mezcla de expertos (MoE) de 26.400 millones de parámetros, publicada por el usuario Pier-Jean (pjmalandrino) bajo el método LLVQ (Leech Lattice Vector Quantization). El objetivo es reducir el peso del modelo de 19,53 GB (texto y visión, en su forma nativa) a 10,00 GB descargables, manteniendo los pesos comprimidos en memoria de tarjeta gráfica: un kernel CUDA decodifica y multiplica los códigos de retícula sin materializar nunca los pesos completos. El modelo base conserva sus 1.609.204.224 parámetros declarados en safetensors para el checkpoint cuantizado, mientras que la cifra de 26,4B corresponde al modelo nativo del que deriva.

La relevancia de esta ficha es doble. Por un lado, demuestra que un MoE de 26,4B puede servirse en una GPU de 16 GB (8,4 GB de memoria tras la carga) con velocidades de decodificación de 72,2 tok/s en L40S y 36,9 tok/s en L4, lo que abre el despliegue de modelos de gran escala en hardware de gama media. Por otro, es una *preview* explícita: el autor reconoce que faltan la torre de visión, la cabeza de predicción multi-token y que no se ha probado en tarjetas de consumo de 16 GB. El formato de ficheros no es el definitivo y la licencia Apache 2.0 queda sujeta a la política de uso aceptable de Thinking Machines.

La cuantización no entrena nada: los códigos provienen de una búsqueda ponderada por Hessiano sobre texto de calibración. La divergencia KL frente al modelo nativo es de 0,0880 nats en WikiText-2, y el rendimiento en GSM8K (191/200 en la ruta densa, 186/200 en la ruta fusionada) sitúa la pérdida de calidad en un margen controlado, aunque el autor advierte que no ha ejecutado el modelo nativo en el mismo harness, por lo que la comparación directa de precisión aún no es concluyente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), 24 capas, 128 expertos por capa, cuantización LLVQ sobre retícula de Leech |
| Parámetros totales | 26,4B en el modelo nativo; 1.609.204.224 declarados en safetensors del checkpoint cuantizado |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se han medido prompts de 9.000 tokens; no se declara el máximo) |
| Tipos de cuantización | 2 bits efectivos (3,03 bits/parámetro en el repo, 2,47 bits/parámetro en la forma sellada); tablas de entrada y salida en 4 bits con grupos de 64 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0, sujeta a la Model Acceptable Use Policy de Thinking Machines |
| Formato de pesos | safetensors + ficheros `layers/L00.tar`–`L23.tar` con códigos de retícula, indexados por `llvq-files.json` |
| Librería de inferencia | `llvq` (Rust + CUDA), no compatible con transformers estándar |
| Tamaño del repo | 10,0 GB |
| Modelo base | thinkingmachines/Inkling-2-Mini |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 24 capas y 128 expertos por capa, lo que suma 3.072 expertos en total. La cuantización LLVQ sustituye los pesos de los expertos por códigos sobre la retícula de Leech: cada bloque de 24 pesos se codifica en 48 bits, lo que equivale a 2 bits por peso. Las tablas de entrada y salida se almacenan en 4 bits con grupos de 64, y el repositorio conserva además una copia de 16 bits de esas tablas (1,85 GB) que la forma sellada elimina. El motor `llvq` lee los códigos directamente y los decodifica en un kernel CUDA fusionado, sin escribir nunca los pesos en precisión completa.

No hubo entrenamiento ni ajuste fino: los códigos se obtuvieron mediante una búsqueda ponderada por Hessiano sobre texto de calibración, un procedimiento de cuantización post-entrenamiento (PTQ). La ruta fusionada no es bit a bit idéntica a la ruta densa: lee la tabla de salida en 4 bits y procesa los prompts largos en fragmentos de 512 tokens, con un impacto medido en perplejidad de +0,413 % para la tabla de 4 bits y de −0,042 % [−0,127, +0,044] para los fragmentos en textos de hasta 4.096 tokens. El autor no detalla la composición del dataset de calibración ni el número de tokens empleados, ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto en inglés con modo de razonamiento: el modelo escribe un bloque de *thinking* antes de responder, incluso con el esfuerzo de razonamiento más bajo, por lo que las respuestas truncadas a pocas decenas de tokens pueden contener solo razonamiento.
- Razonamiento matemático: 191/200 en GSM8K (primeros 200 problemas) por la ruta densa y 186/200 por la ruta fusionada.
- Tool calling / function calling: el servidor `llvq serve` expone una API compatible con OpenAI y otra compatible con Ollama, ambas con soporte de llamadas a herramientas; el autor indica que el servidor pasó sus 13 comprobaciones, incluidas las de tool calls.
- Compatibilidad con clientes OpenAI y Ollama: permite integrar el modelo en ecosistemas existentes sin adaptadores propietarios.
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- Visión: no disponible en este repositorio; la torre de visión del modelo nativo está ausente.
- Predicción multi-token: la cabeza correspondiente está ausente en esta preview.
- No se declaran capacidades de audio ni de agente multi-paso más allá del tool calling.

## Casos de uso

- Servicio de razonamiento en GPU de gama media: con 8,4 GB de memoria tras la carga, el modelo cabe en una L4 o una RTX 40 de 16 GB y permite desplegar un MoE de 26,4B en infraestructura modesta, manteniendo 36,9 tok/s de decodificación en L4.
- Asistente con tool calling en producción: el servidor `llvq serve` ofrece rutas compatibles con OpenAI y Ollama con llamadas a herramientas, lo que permite conectarlo a frameworks de agentes existentes sin reescribir la capa de integración.
- Procesamiento de documentos largos: con prompts de 9.000 tokens medidos a 62,1 tok/s en L40S y reutilización de caché (20 tokens nuevos tras 8.791 cacheados en 0,36 s), es adecuado para resúmenes y preguntas sobre contratos, informes o artículos extensos.
- Razonamiento matemático asistido: los resultados de GSM8K (191/200 en ruta densa) lo hacen viable para tutoría, verificación de cálculos y generación de problemas resueltos paso a paso.
- Despliegue en estaciones de trabajo Apple: con 27,7 tok/s medidos en un Mac con Metal, sirve para prototipado local y desarrollo sin GPU NVIDIA.
- Evaluación de técnicas de cuantización extrema: como referencia reproducible de LLVQ, permite a investigadores comparar la pérdida de calidad (KL de 0,0880 nats) frente a otras técnicas de 2 bits sobre el mismo modelo base.
- Backend de chat con contexto multi-turno: la reutilización de caché entre turnos reduce la latencia en conversaciones largas, lo que lo hace apto para atención al cliente o asistentes internos con historial extenso.

## Benchmarks y rendimiento

Resultados medidos por el autor en su propio harness; no se han publicado comparaciones con otros modelos en la información disponible.

| Métrica | Resultado |
|---|---|
| Divergencia KL vs. modelo nativo (WikiText-2 test, 8 ventanas de 2.048 tokens) | 0,0880 nats |
| GSM8K, primeros 200 problemas, ruta densa | 191/200 |
| GSM8K, mismos 200 problemas, ruta fusionada | 186/200 (p = 0,18 frente a la ruta densa) |
| Decodificación tras prompt de 32 tokens, L40S | 72,2 tok/s |
| Decodificación tras prompt de 32 tokens, L4 | 36,9 tok/s |
| Decodificación tras prompt de 9.000 tokens, L40S | 62,1 tok/s |
| Decodificación tras prompt de 9.000 tokens, L4 | 31,2 tok/s |
| Decodificación en Apple M-series (Metal) | 27,7 tok/s |
| Memoria de tarjeta tras carga, L40S | 8,39 GB |
| Memoria de tarjeta tras carga, L4 | 8,13 GB |
| Memoria pico leyendo prompt de 9.000 tokens, L40S | 12,0 GB |
| Memoria pico leyendo prompt de 9.000 tokens, L4 | 11,5 GB |
| Tiempo de lectura de prompt de 9.000 tokens, L40S | 23,9 s |
| Tiempo de lectura de prompt de 9.000 tokens, L4 | 77,1 s |
| Primer token tras prompt de 32 tokens, L40S | 0,76 s |
| Impacto en perplejidad de la tabla de salida en 4 bits | +0,413 % |
| Impacto en perplejidad del procesado en fragmentos de 512 tokens | −0,042 % [−0,127, +0,044] |

## Requisitos de hardware

- VRAM estimada: 8,4 GB tras la carga; pico de 12,0 GB al leer un prompt de 9.000 tokens. El autor no ha probado en tarjetas de consumo de 16 GB, aunque las cifras de pico indican que debería caber.
- GPU recomendadas: NVIDIA L40S (72,2 tok/s) y NVIDIA L4 (36,9 tok/s) son las medidas. Se requiere Linux, tarjeta NVIDIA de generación RTX 40 o superior y driver 550 o superior.
- GPU de consumo: no verificadas. La RTX 4090 (24 GB) debería alojar el modelo con holgura según las cifras de pico; las de 16 GB quedan pendientes de validación por el autor.
- Apple Silicon: soportado vía Metal con 27,7 tok/s medidos en un Mac M-series.
- Opciones de despliegue: motor propietario `llvq` (Rust + CUDA), instalable con `curl -fsSL https://github.com/pjmalandrino/llvq-tetra/releases/latest/download/install.sh | sh` y ejecutable con `llvq run inkling2:mini`. `llvq serve` expone rutas compatibles con OpenAI y Ollama. No se menciona soporte para vLLM, llama.cpp, TGI ni Ollama nativo (solo compatibilidad de API).
- No requiere toolkit CUDA ni compilador instalado.
- Latencia y throughput: ver tabla de benchmarks. El primer token tras prompt corto es de 0,76 s en L40S; la lectura inicial de prompts largos es el cuello de botella declarado (23,9 s en L40S, 77,1 s en L4 para 9.000 tokens).

## Comparativa con modelos similares

No se han publicado comparaciones con otros ficheros de 2 bits del mismo modelo ni con modelos de tamaño y categoría equivalentes en la información disponible. La model card menciona otras cuantizaciones del mismo método (Qwen3 4B, 8B y 14B) en la colección LLVQ Tetra, pero no aporta métricas comparativas.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-LLVQ-Tetra | 26,4B (MoE) | no disponible | Apache 2.0 + política de uso | safetensors + tar de códigos | Hugging Face, motor `llvq` |
| Inkling-2-Mini (nativo) | 26,4B (MoE) | no disponible | Apache 2.0 + política de uso | safetensors | Hugging Face |
| Qwen3 4B / 8B / 14B LLVQ Tetra | 4B / 8B / 14B | no disponible | no disponible | safetensors + tar de códigos | Hugging Face (colección LLVQ Tetra) |

## Limitaciones y advertencias

- Es una *preview*: faltan la torre de visión y la cabeza de predicción multi-token; el modelo es solo texto.
- El formato de ficheros no es el definitivo; el motor no lee aún la forma sellada (8,14 GB), por lo que el repositorio incluye 1,85 GB adicionales de tablas en 16 bits.
- No se ha probado en tarjetas de consumo de 16 GB; el ajuste en esas GPU es una inferencia a partir de las cifras de pico, no una medición.
- La ruta fusionada no es bit a bit idéntica a la densa (tabla de salida en 4 bits y fragmentos de 512 tokens), con impacto medido en perplejidad de +0,413 % y −0,042 % respectivamente.
- No se ha ejecutado el modelo nativo en el mismo harness de GSM8K, por lo que la comparación de precisión frente al original no está establecida; solo la KL de 0,0880 nats cuantifica la pérdida.
- El modo de razonamiento emite un bloque de *thinking* incluso con esfuerzo mínimo: respuestas con límite de tokens bajo pueden contener solo razonamiento y ningún resultado.
- Idiomas: solo inglés declarado; no hay soporte multilingüe verificado.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de toxicidad en la información disponible; aplican los del modelo base.
- Licencia: Apache 2.0, pero el uso queda vinculado a la Model Acceptable Use Policy de Thinking Machines, que cubre también versiones modificadas. Revisarla antes de servir el modelo en producción.
- Dependencia de un motor propietario (`llvq`) con soporte limitado a Linux, NVIDIA RTX 40 o superior y Metal; no hay integración con vLLM, llama.cpp ni TGI.
- La lectura inicial de prompts largos es lenta (23,9 s en L40S para 9.000 tokens), lo que penaliza casos de uso con prompts largos y baja concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pier-Jean/Inkling-2-Mini-LLVQ-Tetra
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del motor LLVQ Tetra: https://github.com/pjmalandrino/llvq-tetra
- Colección LLVQ Tetra: https://huggingface.co/collections/Pier-Jean/llvq-tetra
- Paper del método LLVQ: https://arxiv.org/abs/2603.11021
- Política de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
