# DreamBlooms/JAD-S1-7B-A1B-v0.5-GGUF

## Resumen

JAD-S1-7B-A1B-v0.5 es un adaptador LoRA fusionado y cuantizado sobre el modelo base `inclusionAI/LLaDA-MoE-7B-A1B-Instruct`, desarrollado por DreamBlooms. No es un modelo generativo de texto al uso: convierte el modelo base en un clasificador de decisión de opción múltiple que, dado un estado (situación), una pregunta y una lista de opciones, devuelve en un único forward pass una distribución normalizada de probabilidad sobre las letras de las opciones disponibles (A–Z). La respuesta es la letra con mayor probabilidad; no se genera texto ni se parsea la salida.

La arquitectura subyacente es un modelo de difusión de lenguaje enmascarado (dLLM, LLaDA) con mezcla de expertos (MoE), de 7.356.880.896 parámetros totales y 1B activos (según el sufijo A1B del nombre). El adaptador LoRA (r=8, alpha=16, sobre q/k/v/o/gate/up/down, 311 MB) se ha fusionado en los pesos base y se distribuye en formato GGUF para inferencia en CPU mediante `dohnuts.cpp`, un port nativo en C++ sobre llama.cpp. El contexto recomendado es de 4.096 tokens, con soporte hasta 8.192.

La relevancia de esta versión (v0.5, publicada el 2026-11-13) radica en su mejora de calibración y rendimiento frente a v0.2: ECE tras calibración de 0.0130, y mejoras en JevBench (83.6%), Kev (75.94%) y VitaminC-dev (84.47%). Su licencia Apache-2.0 permite uso comercial, y su orientación a decisiones estructuradas tipadas lo hace útil para pipelines que requieren salidas deterministas y calibradas sin generación libre de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (LLaDA) con mezcla de expertos (MoE); adaptador LoRA fusionado |
| Parametros totales | 7.356.880.896 |
| Parametros activos | 1B (según nomenclatura A1B del modelo base) |
| Longitud de contexto | 4.096 tokens recomendado; hasta 8.192 soportado |
| Tipos de cuantizacion | Q8_0 y F16 (GGUF) |
| Idiomas soportados | Inglés y chino (evaluados); transferencia a japonés observada en evaluación |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0: 7.8 GB; F16: 14.7 GB) |

## Arquitectura y entrenamiento

El modelo base es LLaDA-MoE-7B-A1B-Instruct, un modelo de difusión de lenguaje enmascarado (masked diffusion language model) con arquitectura MoE de 7.356.880.896 parámetros totales y aproximadamente 1B activos. A diferencia de los transformers autorregresivos, LLaDA realiza la predicción mediante difusión sobre tokens enmascarados, lo que permite un readout no causal en un único paso. Sobre este base se entrena un adaptador LoRA con r=8 y alpha=16 que apunta a las proyecciones q/k/v/o/gate/up/down (311 MB). El readout es de un solo paso con etiqueta restringida: se coloca un único token de máscara en el slot del asistente y se leen los logits correspondientes a las letras de opción disponibles.

El adaptador se entrenó con datos públicos de licencia abierta y datos sintéticos creados para el proyecto, sin datos de uso no comercial o solo para investigación, según declara el autor. La versión distribuida en este repositorio fusiona el LoRA en el modelo base mediante las herramientas de llama.cpp (`convert_lora_to_gguf.py` + `llama-export-lora`) y posteriormente cuantiza, de modo que no hay adaptador que cargar en tiempo de ejecución ni cabecera de punteros. El modelo incluye un fichero de configuración `jad.json` (135 B) con el perfil y la temperatura (1.2576), requerido junto al GGUF.

## Capacidades

- Decisión de opción múltiple en un único forward pass: devuelve una distribución normalizada sobre las letras de opción (A–Z), con 2–26 opciones por tarea (6 recomendadas).
- Salida estructurada y tipada (typed decision): no genera texto libre ni requiere parseo de la respuesta.
- Calibración de probabilidades: ECE de 0.0130 tras calibración, adecuada para umbrales de confianza en producción.
- Cobertura de escenarios: aplicación de reglas con excepciones, ventanas temporales y de plazo, comparación multi-hop, puntuación y rating, clasificación de temas y etiquetas, y verificación de evidencia/afirmaciones.
- Capacidades multilingües: evaluación en inglés, chino y japonés (este último sin datos de entrenamiento, refleja transferencia del modelo base).
- Inferencia en CPU sin GPU ni runtime de Python mediante `dohnuts.cpp`.
- Servicio con formato de cable `POST /v1/systemone`, compatible con endpoints.
- No soporta generación de texto, tool calling ni razonamiento multi-step generativo: su función es exclusivamente la decisión restringida a etiquetas.

## Casos de uso

- Enrutamiento y triaje de tickets de soporte: dado el mensaje del usuario y una lista de categorías, el modelo devuelve la etiqueta de categoría más probable en un solo paso, con probabilidad calibrada para derivar casos ambiguos a revisión humana.
- Verificación de afirmaciones y evidencia: en pipelines de control de calidad documental, se plantea la afirmación y las opciones (soportada, refutada, insuficiente) y se obtiene una decisión con distribución de probabilidad utilizable como umbral.
- Clasificación de temas y etiquetas en corpus multilingües (inglés y chino): útil para etiquetado de contenido en moderación o catalogación, con la ventaja de no requerir generación ni parseo.
- Aplicación de reglas con excepciones en sistemas de cumplimiento: el modelo evalúa si una situación cumple una política y selecciona entre opciones tipadas (cumple, incumple, excepción aplicable), adecuado por su calibración para auditoría.
- Comparación multi-hop y scoring: en evaluación de candidatos o ítems, se presentan opciones de rating y el modelo devuelve la distribución sobre la escala, aprovechable en sistemas de ranking con incertidumbre explícita.
- Decisión con ventanas temporales y plazos: en gestión de incidencias o SLA, se pregunta si un caso está dentro de plazo y se elige entre opciones, con contexto de hasta 4.096 tokens recomendados.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con `dohnuts.cpp` y un GGUF Q8_0 de 7.8 GB, encaja en servidores modestos o dispositivos edge para decisiones de baja latencia.

## Benchmarks y rendimiento

| Benchmark | v0.2 | v0.5 (adaptador) | GGUF F16 | GGUF Q8_0 |
|---|---:|---:|---:|---:|
| JevBench v1.2.2 (231) | 192/231 (83.1%) | 193/231 (83.6%) | 194/231 (84.0%) | 191/231 (82.7%) |
| Kev (2,581) | 74.00% | 75.94% | no disponible | no disponible |
| VitaminC-dev (599) | 69.95% | 84.47% | no disponible | no disponible |
| Temperature | 1.2315 | 1.2576 | no disponible | no disponible |
| ECE tras calibración | 0.0175 | 0.0130 | no disponible | no disponible |

Desglose de JevBench por dificultad (GGUF, dohnuts.cpp):

| Fichero | easy | original | hard | all |
|---|---:|---:|---:|---:|
| F16 | 48/48 | 68/72 | 78/111 | 194/231 (84.0%) |
| Q8_0 | 48/48 | 68/72 | 75/111 | 191/231 (82.7%) |

Rendimiento por idioma en JevBench (231): inglés 193/231 (83.6%), chino 184/231 (79.7%), japonés 183/231 (79.2%). El autor señala que el japonés no se usó en entrenamiento y refleja principalmente la transferencia del modelo base. El adaptador upstream reporta 193/231; el GGUF difiere en un par de decisiones ajustadas por cuantización y deriva de kernels.

## Requisitos de hardware

- VRAM estimada: no aplica para el despliegue principal, que es en CPU. Para ejecución en GPU con llama.cpp, el GGUF Q8_0 (7.8 GB) requiere aproximadamente 8–10 GB de VRAM considerando overhead; el F16 (14.7 GB) requiere aproximadamente 16–18 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un Q8_0 cabría en RTX 4090 (24 GB) o A100/H100; el F16 también en RTX 4090. No hay datos de latencia o throughput en GPU.
- CPU: el despliegue de referencia es en CPU mediante `dohnuts.cpp`; no se publican cifras de latencia ni throughput.
- Cabe en GPU consumer: sí, en tarjetas con al menos 16 GB para F16 y 8–10 GB para Q8_0, aunque el diseño apunta a CPU.
- Opciones de despliegue: `dohnuts.cpp` (port nativo sobre llama.cpp) con servidor HTTP y formato `POST /v1/systemone`; llama.cpp; el autor no menciona vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JAD-S1-7B-A1B-v0.5 (este) | 7.36B totales / 1B activos | 4.096–8.192 | Decisión de opción múltiple restringida | Apache-2.0 | GGUF en HF |
| LLaDA-MoE-7B-A1B-Instruct (base) | 7.36B totales / 1B activos | no disponible | Generación de texto instructiva | Apache-2.0 | HF |
| Modelos de clasificación tipo BERT/RoBERTa | 0.1–0.4B típicamente | 512 típicamente | Clasificación de texto | variable | amplia |

La comparación con clasificadores encoder-only es cualitativa: JAD-S1 ofrece contexto mucho mayor (4.096–8.192 frente a 512 típicos), salida tipada sobre 2–26 opciones y calibración explícita, a costa de un tamaño muy superior. No se dispone de benchmarks comparativos directos con modelos de decisión alternativos en la información proporcionada. Frente a su modelo base, JAD-S1 restringe la salida a decisiones y mejora la calibración, pero pierde la capacidad de generación libre.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-step; solo devuelve distribución sobre letras de opción.
- Riesgo de alucinación: aunque la salida está restringida a etiquetas, la distribución puede asignar alta probabilidad a opciones incorrectas en casos ambiguos; la calibración (ECE 0.0130) mitiga pero no elimina este riesgo.
- Sesgos: no se documentan sesgos específicos; al entrenarse con datos públicos y sintéticos, puede heredar sesgos del corpus y del modelo base.
- Limitaciones de idioma: evaluado en inglés y chino; el japonés solo refleja transferencia. Otros idiomas no están evaluados.
- Limitaciones de contexto: 4.096 tokens recomendados; superar 8.192 no está soportado.
- Dependencia de fichero auxiliar: `jad.json` es obligatorio junto al GGUF para el perfil y la temperatura; su omisión puede degradar la calibración.
- Diferencias de cuantización: Q8_0 pierde algunas decisiones ajustadas frente a F16 (191 vs 194 en JevBench); usar F16 si la fidelidad de probabilidad es crítica.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución; se debe consultar el fichero `NOTICE` para atribución.
- Madurez: versión v0.5 con 0 descargas y 0 likes en el momento de la ficha; ecosistema de despliegue limitado a `dohnuts.cpp` y llama.cpp, sin soporte documentado en vLLM u Ollama.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/DreamBlooms/JAD-S1-7B-A1B-v0.5-GGUF
- Modelo base del adaptador: https://huggingface.co/DreamBlooms/JAD-S1-7B-A1B-v0.5
- Modelo base original: https://huggingface.co/inclusionAI/LLaDA-MoE-7B-A1B-Instruct
- Repositorio dohnuts.cpp: https://github.com/DreamBlooms/dohnuts.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
