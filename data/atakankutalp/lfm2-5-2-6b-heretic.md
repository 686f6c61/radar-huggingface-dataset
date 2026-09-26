# atakankutalp/LFM2.5-2.6B-heretic

## Resumen

LFM2.5-2.6B-heretic es una versión "decensored" (abliterated) del modelo LiquidAI/LFM2.5-2.6B, publicada por el usuario atakankutalp. El modelo original es un modelo híbrido de 2,69 mil millones de parámetros desarrollado por Liquid AI y diseñado específicamente para despliegue en dispositivo (on-device), con una ventana de contexto de 128.000 tokens y post-entrenamiento orientado a tareas agénticas. Sobre esos pesos base, este derivado aplica una ablación direccional ("abliteration") automática con la herramienta Heretic v1.4.0, que proyecta fuera del flujo residual la dirección asociada al rechazo de peticiones.

El cambio es puramente de pesos: la arquitectura, el tokenizador y la plantilla de chat son idénticos al modelo original. Se eliminan las direcciones de rechazo de las proyecciones de salida de atención (`out_proj`) y de bajada del MLP (`w2`) en las 30 capas del transformer, y el resultado se fusiona de vuelta en los pesos base. El efecto medido es una reducción de rechazos del 94 % al 6 % sobre un conjunto de 100 peticiones nocivas, con una divergencia KL de 0,0232 respecto al modelo original.

Su relevancia es doble. Por un lado, permite ejecutar un modelo de calidad agéntica en hardware de consumo (menos de 2,5 GB de memoria según el modelo base) y en español, entre otros 15 idiomas. Por otro, es un caso reproducible de abliteración: los nueve parámetros de ablación y la configuración completa se documentan de forma que la modificación puede regenerarse. Su orientación sin filtrado de seguridad lo hace inadecuado para despliegues de producción sujetos a requisitos de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 híbrida, implementación `Lfm2ForCausalLM`; 30 capas transformer |
| Parametros totales | 2.697.198.592 (2,69 B) |
| Parametros activos | no disponible (no se documenta como modelo MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | bfloat16 (safetensors); el repositorio no distribuye variantes GGUF ni cuantizadas |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | safetensors (bfloat16) |

Otros datos del repositorio: tamaño del repositorio 5,4 GB; pipeline `text-generation`; etiquetas `endpoints_compatible`, `conversational`, `edge`; identificador arXiv 2511.23404; fecha de creación 2026-09-25.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base LiquidAI/LFM2.5-2.6B, perteneciente a la familia LFM2.5 de modelos híbridos pensados para despliegue en dispositivo. La model card del modelo base describe una ventana de contexto de 128K y un post-entrenamiento agéntico, con aprendizaje por refuerzo realizado dentro de distintos "harnesses" agénticos para mejorar la compatibilidad con herramientas y flujos multi-paso. Se trata de un transformer de 30 capas con proyecciones de atención (`out_proj`) y de bajada del MLP (`w2`) en cada capa. No se documenta en la información disponible ni el número exacto de tokens de entrenamiento ni la composición del dataset.

La modificación de este derivado es una ablación direccional automática ejecutada con Heretic v1.4.0. Se identifica una dirección de rechazo en el flujo residual del modelo y se proyecta fuera de todas las proyecciones de salida de atención y de bajada del MLP, con índices de dirección calculados por capa. Los pesos resultantes se fusionan en el checkpoint base. La configuración de ablación incluye pesos por capa para `attn.o_proj` (máximo 1,21 en la posición 17,99; mínimo 0,54 a distancia 9,02) y para `mlp.down_proj` (máximo 1,28 en la posición 19,80; mínimo 1,10 a distancia 16,87). La reproducción se realizó con 200 ensayos (60 de arranque), semilla 3407, dtype bfloat16 sin cuantización, normalización de filas completa con LoRA de rango 3 y ortogonalización de la dirección activada. Se emplearon los conjuntos `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors` (400 prompts de entrenamiento y 100 de evaluación). El ensayo seleccionado fue el índice 93, Pareto-óptimo de los 200. La única diferencia arquitectónica respecto al original es un campo `full_attn_idxs: null` añadido por una versión más reciente de Transformers; ningún valor arquitectónico cambia.

## Capacidades

- Generación de texto conversacional y de instrucciones, con plantilla de chat idéntica al modelo base.
- Razonamiento agéntico multi-paso: el modelo base está post-entrenado con RL agéntico y, según Liquid AI, es competitivo con modelos cuatro veces mayores en uso de herramientas, seguimiento de instrucciones y tareas agénticas.
- Soporte de tool calling y function calling, orientado a su integración en flujos de agentes.
- Capacidades multilingües en 16 idiomas: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita.
- Ventana de contexto larga de 128.000 tokens para documentos extensos y conversaciones de muchos turnos.
- Inferencia eficiente en el borde: menos de 2,5 GB de memoria y 220 tok/s en un Apple M5 Max, 113 tok/s en una CPU AMD Ryzen (datos del modelo base).
- Ausencia deliberada de alineación de seguridad: los rechazos ante peticiones nocivas se reducen de 94/100 a 6/100. No hay filtrado de salidas.
- No se documentan capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Asistentes locales en el dispositivo: al requerir menos de 2,5 GB de memoria, el modelo puede ejecutarse en portátiles y equipos de consumo para asistentes conversacionales sin conexión, con el contexto largo de 128K para mantener historiales extensos.
- Agentes autónomos multi-paso: su post-entrenamiento con RL agéntico y el soporte de tool calling permiten construir agentes que encadenan llamadas a herramientas (búsqueda, cálculo, APIs) dentro de un mismo flujo.
- Investigación y resumen documental: la demo oficial "Research Agent in your browser" usa el modelo base para responder preguntas y generar resúmenes; el contexto de 128K permite procesar informes y artículos largos sin trocear.
- Atención al cliente automatizada: gestión de conversaciones multi-turno en español y otros idiomas con memoria de contexto amplia, aunque sin garantías de moderación de contenido.
- Generación de código asistida: integrable en asistentes de programación locales y en pipelines de desarrollo donde se prefiera ejecución en el propio equipo.
- Traducción y procesamiento multilingüe: cobertura de 16 idiomas para tareas de traducción, clasificación o generación en entornos con requisitos de idioma diversos.
- Investigación sobre alineación y seguridad: el modelo sirve como objeto de estudio reproducible (parámetros de ablación y configuración documentados) para analizar el efecto de la abliteración sobre el comportamiento del modelo.
- Aplicaciones de escritura sin restricciones de contenido: escenarios creativos o de ficción donde los filtros del modelo base resultan limitantes, asumiendo el riesgo de que las salidas no están moderadas.

## Benchmarks y rendimiento

La model card solo publica dos métricas de la ablación, sin resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, etc.):

| Metrica | Este modelo | Modelo original (LiquidAI/LFM2.5-2.6B) |
|---|---|---|
| Divergencia KL | 0,0232 | 0 (por definición) |
| Rechazos (refusals) | 6/100 | 94/100 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del modelo base afirma que es competitivo con modelos cuatro veces mayores en uso de herramientas y tareas agénticas, pero no acompaña cifras concretas.

## Requisitos de hardware

- Memoria de inferencia: menos de 2,5 GB según la model card del modelo base; el repositorio ocupa 5,4 GB (safetensors en bfloat16).
- Throughput de referencia (modelo base): 220 tok/s en Apple M5 Max y 113 tok/s en CPU AMD Ryzen.
- GPU de consumo: cabe en GPU de gama media; la propia ablación se ejecutó en una NVIDIA RTX 4060 de 8 GB con 5,04 GB de VRAM pico durante 200 ensayos.
- Proceso de ablación: 8.563 segundos (2 h 23 min) para 200 ensayos en RTX 4060; no es un requisito de inferencia, sino de reproducción de la modificación.
- Opciones de despliegue: la librería declarada es `transformers` y el repositorio está etiquetado como `endpoints_compatible` (Inference Endpoints). No se confirman en la información disponible soportes específicos de vLLM, llama.cpp, Ollama o TGI, aunque al ser un `Lfm2ForCausalLM` en safetensors deberían poder integrarse con herramientas compatibles.
- No se dispone de datos de latencia o throughput medidos específicamente para este derivado abliterado.

## Comparativa con modelos similares

La única comparación con datos disponibles es con el modelo base del que deriva. No se dispone de especificaciones ni benchmarks de otros modelos de la misma categoría (2-3B orientados a borde) en la información proporcionada.

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-2.6B-heretic (este) | 2,69 B | 128K | 6/100 | LFM Open License v1.0 | Hugging Face, derivado |
| LiquidAI/LFM2.5-2.6B (base) | 2,69 B | 128K | 94/100 | LFM Open License v1.0 | Hugging Face, oficial |
| Otros modelos de 2-3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia clave frente al base es la reducción de la alineación de seguridad y una divergencia KL de 0,0232; arquitectura, tokenizador, plantilla de chat y número de parámetros permanecen idénticos.

## Limitaciones y advertencias

- La alineación de seguridad ha sido reducida deliberadamente: los rechazos caen de 94/100 a 6/100 y las salidas no están filtradas. No es apto para despliegues con requisitos de moderación de contenido.
- Riesgo de alucinación inherente a un modelo de 2,69 B; no hay benchmarks publicados que permitan acotar su fiabilidad factual.
- La ablación puede degradar capacidades generales de forma sutil; la divergencia KL de 0,0232 respecto al base es pequeña pero no nula.
- Restricciones de licencia: se distribuye bajo LFM Open License v1.0, que exige conservar avisos de copyright, marca y atribución (secciones 4(a), 4(b) y 4(c)). Debe revisarse el fichero LICENSE del repositorio antes de cualquier uso comercial.
- El repositorio declara licencia `other` / `lfm1.0`; conviene verificar las condiciones de uso comercial y de redistribución impuestas por Liquid AI.
- Idiomas: aunque se listan 16 idiomas, el rendimiento por idioma no está documentado; el español figura entre ellos pero sin métricas.
- No se distribuyen variantes cuantizadas (GGUF, AWQ, GPTQ) en el repositorio, lo que limita su uso directo en algunos motores de inferencia.
- Modelo con 0 descargas y 0 "likes" en el momento de la consulta: no cuenta con validación de la comunidad.
- No se documentan capacidades de visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atakankutalp/LFM2.5-2.6B-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Herramienta Heretic (web): https://heretic-project.org
- Herramienta Heretic (repositorio, AGPL-3.0): https://github.com/p-e-w/heretic
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- LEAP (plataforma de Liquid AI): https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Demo Research Agent (WebGPU): https://huggingface.co/spaces/LiquidAI/LFM2.5-2.6B-WebGPU
- Paper de referencia (arXiv): 2511.23404
