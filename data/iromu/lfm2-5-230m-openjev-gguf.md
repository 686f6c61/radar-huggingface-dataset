# iromu/LFM2.5-230M-openjev-GGUF

## Resumen

LFM2.5-230M-openjev-GGUF es la conversión a formato GGUF del ajuste fino `iromu/LFM2.5-230M-openjev`, un modelo derivado de `LiquidAI/LFM2.5-230M-Base` mediante supervisión con LoRA. Su propósito no es la generación de texto general, sino resolver tareas de decisión tipada (*typed-decision*) y clasificación: recibe un estado, una pregunta y un conjunto de opciones, y devuelve una única letra correspondiente a la opción seleccionada. Con 229,7 millones de parámetros, está diseñado para despliegues de huella mínima en entornos llama.cpp, dispositivos de borde y ejecución local.

El modelo se entrenó sobre el split `train` del corpus `ZefanCai/Open-Jev`, donde cada fila contiene una distribución de probabilidad sobre las opciones y el objetivo es el argmax escrito como una sola letra. El ajuste se realizó con NeMo-RL, enmascarando la pérdida a los turnos del asistente, con LoRA de rango 32 sobre proyecciones de atención y matrices MLP (`w1`, `w2`, `w3`). El resultado es un modelo que emite siempre una letra válida (100 % de emisión en la validación de 3.495 filas) y acierta entre el 71,2 % y el 77,0 % según la cuantización.

La relevancia de esta ficha radica en su naturaleza de artefacto especializado: no compite con modelos conversacionales, sino que ofrece una alternativa compacta y cuantizada para selección de etiquetas en pipelines de clasificación, con métricas de coherencia probabilística publicadas por el autor (JevBench) que permiten evaluar el impacto de la cuantización en la fidelidad de la decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LFM2.5 de LiquidAI), ajuste fino con LoRA |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16, Q4_K_M, Q5_K_M, Q8_0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `LiquidAI/LFM2.5-230M-Base`, un transformer de 229,7 millones de parámetros. Sobre él se aplicó un ajuste fino supervisado (SFT) con LoRA de rango 32, alpha 32 y dropout 0,05, dirigido a los módulos `*.proj` (proyecciones de atención) y `*.w1`, `*.w2`, `*.w3` (matrices de la red feed-forward del bloque LFM). El entrenamiento se ejecutó con NeMo-RL en precisión bfloat16, optimizador AdamW con learning rate 5e-5 y weight decay 0,01, calentamiento lineal de 100 pasos y decaimiento coseno hasta 1e-6. El batch global fue de 64 (micro-batch 2), con una única época de 1.191 pasos sobre 76.224 filas y validación cada 125 pasos. La pérdida de entropía cruzada se enmascaró al turno del asistente mediante la plantilla de chat de decisión.

Los datos de entrenamiento provienen del split `train` del corpus `ZefanCai/Open-Jev` (snapshot `c67699e13d0ae25e35b77165a4b6b079bedc8aba`). Cada ejemplo contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre ellas; el objetivo es la opción argmax expresada como una única letra de etiqueta. No se documenta uso de RLHF ni DPO. Como innovación destacable, el ajuste alcanza tanto las proyecciones de atención como las matrices MLP, y el formato de salida restringido a una letra convierte la tarea en una clasificación de un solo token, lo que simplifica la lectura de la softmax en la posición de respuesta.

## Capacidades

- Selección de una única etiqueta a partir de un prompt de decisión tipada (estado, pregunta y opciones).
- Clasificación de opciones con salida restringida a una letra de etiqueta.
- Emisión consistente de una letra válida: 100 % de emisión en las 3.495 filas de validación para todas las cuantizaciones.
- Lectura de distribución de probabilidad sobre las opciones mediante la softmax en la posición de respuesta (usada por JevBench para medir coherencia).
- Ejecución en runtimes estilo llama.cpp, incluidos bindings de Python (`llama_cpp`).
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Capacidades multilingües limitadas al inglés (`en`).
- No dispone de modo thinking, visión ni audio (no documentado).

## Casos de uso

- Clasificación de tickets de soporte: dado un texto de incidencia y un conjunto cerrado de categorías, el modelo devuelve la letra de la categoría argmax, lo que permite enrutar automáticamente en un pipeline con llama.cpp y sin GPU dedicada.
- Etiquetado de datos a gran escala: integrado en un proceso batch que procesa miles de filas con Q4_K_M, ofrece una alternativa de bajo coste para pre-anotar corpus antes de revisión humana.
- Enrutamiento de decisiones en agentes: como componente de selección entre opciones discretas (herramienta A, B o C) dentro de un sistema mayor, donde la salida de una sola letra simplifica el parseo.
- Despliegue en dispositivos de borde: con Q4_K_M y 229,7 M de parámetros, cabe en entornos con recursos limitados (Raspberry Pi, móviles o CPUs) y permite clasificación local sin conexión.
- Evaluación de coherencia probabilística: el modelo y sus cuantizaciones sirven como banco de pruebas para medir cómo afecta la cuantización a la coherencia de decisiones mediante JevBench.
- Filtrado de opciones en formularios o encuestas: selección automática de la respuesta más probable entre un conjunto predefinido, con la softmax expuesta para umbrales de confianza.
- Investigación sobre SFT con LoRA: el artefacto documenta hiperparámetros completos (rango, módulos objetivo, schedule) y sirve de referencia reproducible para ajustes de decisión en modelos pequeños.

## Benchmarks y rendimiento

El autor publica dos tablas de evaluación. La primera mide fidelidad de la letra emitida sobre el split `validation` de Open-Jev (3.495 filas, decodificación greedy, capacidad de 384 tokens):

| Modelo | Cuantización | Letra emitida | Letra correcta | Δ vs BASE |
|---|---|---|---|---|
| LiquidAI/LFM2.5-230M-Base | BF16 | 0/3495 (0,0 %) | 0/3495 (0,0 %) | — |
| LFM2.5-230M-openjev | GGUF-BF16 | 3495/3495 (100,0 %) | 2692/3495 (77,0 %) | +77,0 pp |
| LFM2.5-230M-openjev | GGUF-Q4_K_M | 3495/3495 (100,0 %) | 2489/3495 (71,2 %) | +71,2 pp |
| LFM2.5-230M-openjev | GGUF-Q5_K_M | 3495/3495 (100,0 %) | 2647/3495 (75,7 %) | +75,7 pp |
| LFM2.5-230M-openjev | GGUF-Q8_0 | 3495/3495 (100,0 %) | 2677/3495 (76,6 %) | +76,6 pp |

La segunda tabla recoge la puntuación de coherencia probabilística de JevBench (`jevbench-mini`: 240 casos, 50 relaciones puntuadas, tolerancia 0,05, temperatura 1,0), leída mediante llama.cpp en la softmax de la letra de opción:

| Cuantización | Overall | Δ vs BF16 | REP | BAT | MEA | LOG | CHO |
|---|---|---|---|---|---|---|---|
| BF16 | 41,3 | — | 65,3 | 25,8 | 16,9 | 69,2 | 29,2 |
| Q4_K_M | 35,9 | −5,4 | 55,8 | 25,8 | 10,3 | 65,4 | 22,2 |
| Q5_K_M | 37,7 | −3,6 | 55,6 | 27,5 | 12,3 | 75,0 | 18,1 |
| Q8_0 | 39,2 | −2,1 | 61,7 | 25,8 | 14,7 | 68,8 | 25,0 |

REP es consistencia de representación, BAT independencia de lote, MEA coherencia de medida de probabilidad, LOG coherencia lógica y CHO coherencia de conjunto de elección; cada una es la media del porcentaje de acierto de sus relaciones, y Overall la media de las cinco. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en BF16 ocupa aproximadamente 460 MB (229,7 M de parámetros × 2 bytes); Q8_0 ronda los 230 MB, Q5_K_M unos 150 MB y Q4_K_M unos 130 MB, sin contar overhead de contexto ni caché KV.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; el modelo es viable en RTX 3060, RTX 4090, A100 y H100, aunque estas últimas están sobredimensionadas para su tamaño.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas e incluso en iGPU y CPUs, dado su tamaño reducido.
- Opciones de despliegue: llama.cpp (`llama-cli -hf iromu/LFM2.5-230M-openjev-GGUF:Q4_K_M`) y bindings de Python de llama.cpp (`llama_cpp.Llama.from_pretrained`). No se documentan otras opciones como vLLM, Ollama o TGI.
- Latencia y throughput: el autor indica que las mediciones son de decodificación greedy de un solo flujo, no de throughput de servido; no se publican cifras concretas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-230M-openjev-GGUF | 229,7 M | 4.096 | Decisión tipada / clasificación | Apache 2.0 | GGUF |
| LiquidAI/LFM2.5-230M-Base | 229,7 M | no disponible | Base generativa | no disponible en la información | safetensors / BF16 |
| iromu/LFM2.5-230M-openjev | 229,7 M | 4.096 | Decisión tipada / clasificación | Apache 2.0 | BF16 (modelo completo) |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato. El modelo base no emite letras válidas (0,0 % de emisión en la validación), lo que confirma que la capacidad de decisión tipada es producto del ajuste fino y no del modelo original.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en decisión tipada y clasificación; no es un sustituto general de modelos mayores, como advierte el propio autor.
- Solo soporta inglés (`en`); no se garantiza comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación: aunque emite siempre una letra válida, la letra correcta se sitúa entre el 71,2 % y el 77,0 %, por lo que entre el 23 % y el 29 % de las respuestas son incorrectas según la cuantización.
- La cuantización degrada la fidelidad: Q4_K_M pierde 5,8 puntos porcentuales de letra correcta respecto a BF16 y 5,4 puntos de coherencia Overall; Q8_0 es la opción recomendada cuando la letra exacta es crítica.
- La coherencia probabilística es baja en términos absolutos (Overall 41,3 en BF16), especialmente en coherencia de medida (MEA 16,9) y coherencia de conjunto de elección (CHO 29,2).
- El contexto está limitado a 4.096 tokens, longitud máxima de secuencia usada en entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de Open-Jev.
- No hay checkpoint NVFP4 para este modelo; el autor indica que el runtime de servido de su host no dispone de clase de modelo `lfm2`, por lo que la cuantización se limita al conjunto GGUF.
- El modelo tiene 1 descarga y 0 likes en Hugging Face en el momento de la ficha, lo que indica una validación comunitaria muy limitada.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/iromu/LFM2.5-230M-openjev-GGUF
- Modelo BF16 y tabla de validación: https://huggingface.co/iromu/LFM2.5-230M-openjev
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- JevBench (repositorio de evaluación): https://github.com/JevBench/jevbench
- NeMo-RL (framework de entrenamiento): no disponible en la información proporcionada
