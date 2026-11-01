# ahtx/AH-Nanbeige4.3-33B-IQ3_XXS-GGUF

## Resumen

AH-Nanbeige4.3-33B-IQ3_XXS-GGUF es una cuantización de tipo IQ3_XXS del modelo Nanbeige4.3-33B, publicada por el usuario ahtx (Amir Husain) bajo licencia Apache 2.0. El modelo base, desarrollado por el equipo Nanbeige, cuenta con 33.118.977.024 parámetros reales según los tensores en safetensors, y esta versión comprimida lo reduce a un único fichero GGUF de 13,1 GB. El objetivo declarado por el autor es ofrecer un modelo orientado a agentes —llamadas a herramientas, trabajo en terminal y generación de código— que quepa en una sola GPU de consumo.

La relevancia de esta ficha radica en que demuestra que un modelo de 33B puede ejecutarse en hardware asequible con una pérdida de fidelidad medida y documentada: el 82,8% de coincidencia en el token superior y una divergencia KL de 0,225 respecto al modelo original sobre un conjunto de texto reservado. El autor calibró la cuantización con datos propios centrados en agentes (tool calls, Unix/Linux y código), en lugar de usar calibración genérica, lo que explica el rendimiento en tareas de terminal.

No se dispone de información sobre la longitud de contexto nativa del modelo base ni sobre los idiomas soportados más allá de lo que declara la model card. La ficha se limita, por tanto, a los datos publicados por el autor de la cuantización y a las especificaciones deducibles del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Nanbeige4.3-33B; no se detalla en la información proporcionada) |
| Parámetros totales | 33.118.977.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma nativa; el autor recomienda ejecutar con `-c 16384` en llama.cpp |
| Tipos de cuantización | IQ3_XXS (esta versión); el repositorio no lista otras variantes |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del fichero | 13,1 GB |
| Calibración | imatrix con datos propios de agentes (tool calls, Unix/Linux, código) |
| Coincidencia con el original (top token) | 82,8% |
| Divergencia KL respecto al original | 0,225 |
| Fecha de creación | 2026-10-30 |
| Descargas | 354 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Nanbeige4.3-33B: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. Lo que sí se conoce es el resultado del proceso de cuantización aplicado por ahtx, que no modificó los pesos mediante entrenamiento adicional.

La innovación técnica de esta release está en el método de calibración. El autor construyó un conjunto de calibración específico para agentes —llamadas a herramientas, comandos de Unix y Linux, y código— y evaluó cada fichero candidato contra el modelo original token a token, conservando el que más se aproximaba a este tamaño. El resultado es una cuantización IQ3_XXS con imatrix que, según el autor, mantiene el 82,8% de coincidencia en el token superior y una KL de 0,225, métricas que el autor presenta como garantía de fidelidad para uso en producción con agentes.

## Capacidades

- Generación de texto conversacional y multi-turno (pipeline `text-generation`, tag `conversational`).
- Llamadas a herramientas y function calling, con soporte explícito del template Jinja de llama.cpp mediante `--jinja`.
- Trabajo en terminal: ejecución de comandos Unix/Linux y tareas de agente en entornos de shell (validado en el harness pi agent).
- Generación de código, evaluada sobre 50 problemas recientes de LiveCodeBench.
- Razonamiento multi-paso orientado a agentes, con tests ocultos que verifican el resultado de cada tarea en kbench.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue tras una API compatible con OpenAI.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Agente de terminal automatizado: el modelo puede recibir una tarea en lenguaje natural, emitir comandos de shell mediante tool calling y verificar el resultado. El autor lo valida en el harness pi agent con 65 tareas de terminal y coding, donde obtiene 64 aciertos sobre 65 (98,5%).
- Asistente de codificación en local: con 13,1 GB de pesos y unos 35 tokens/s en una RTX 3090, es viable como copiloto de código en una estación de trabajo con una sola GPU de consumo, sin depender de APIs externas.
- Automatización de tareas de sistema y DevOps: la calibración específica en Unix/Linux hace que el modelo sea adecuado para generar y depurar scripts de administración, pipelines de CI y comandos de diagnóstico en servidores.
- Evaluación de agentes en investigación: el formato GGUF y la compatibilidad con llama.cpp permiten reproducir experimentos de agentes con un coste de hardware bajo, útil para comparar harnesses y estrategias de prompting.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse íntegramente en local y bajo licencia Apache 2.0, encaja en escenarios donde los datos no pueden salir de la infraestructura propia.
- Prototipado de function calling: el soporte de `--jinja` y del template de chat facilita integrar el modelo en frameworks de agentes que esperan un formato de herramientas estándar, con la ventaja de un contexto configurable de 16K tokens.
- Servicio de generación de texto en GPU de gama media: con cuantización IQ3_XXS y KV cache en q8_0, el modelo cabe en tarjetas de 16-24 GB, lo que permite ofrecer un endpoint interno de generación a coste reducido.

## Benchmarks y rendimiento

El autor publica una evaluación inicial de 115 tareas con una semilla por tarea y los mismos ajustes para ambos modelos comparados. Las métricas son las siguientes:

| Test | Nanbeige 33B IQ3_XXS (este fichero, llama.cpp) | Bonsai 27B (Kindi) |
|---|---|---|
| kbench, 65 tareas de agente | 64 (98,5%) | 64 (98,5%) |
| LiveCodeBench, 50 problemas | 34 (68,0%) | 32 (64,0%) |
| Total, 115 tareas | 98 (85,2%) | 96 (83,5%) |

El propio autor advierte que ambos modelos están cerca del techo de kbench, por lo que la prueba tiene poco margen de discriminación y está preparando tests más difíciles. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

En cuanto a rendimiento de inferencia, el autor reporta aproximadamente 35 tokens por segundo en una RTX 3090 con llama.cpp y este fichero.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 13,1 GB; con KV cache en q8_0 y contexto de 16K, se recomienda un mínimo de 16 GB de VRAM para dejar margen al runtime.
- GPU recomendadas: RTX 3090 (medición directa del autor, ~35 tok/s), RTX 4090, A100 y H100 para despliegues con mayor concurrencia.
- GPU de consumo: cabe en tarjetas de 16 GB o más (RTX 4080, RTX 4060 Ti 16 GB, RTX 3090, RTX 4090). En tarjetas de 12 GB requeriría descarga parcial de capas a CPU y perdería velocidad.
- Opciones de despliegue: llama.cpp (`llama-server`) es el runtime validado por el autor, con la invocación `llama-server -m AH-Nanbeige4.3-33B-IQ3_XXS.gguf --jinja -ngl 99 -c 16384 -ctk q8_0 -ctv q8_0 --temp 0.7 --top-p 0.8 --top-k 20 --min-p 0`. El motor propietario Kindi del mismo autor está en desarrollo para este modelo. No se confirma soporte de vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: ~35 tok/s en RTX 3090 según el autor; no se publican datos de latencia ni de throughput con concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| AH-Nanbeige4.3-33B IQ3_XXS | 33,1B | no disponible (16K recomendado en llama.cpp) | Apache 2.0 | GGUF | 85,2% en 115 tareas (kbench + LiveCodeBench) |
| Bonsai 27B (Kindi) | 27B (según el autor) | no disponible | no disponible | no disponible | 83,5% en las mismas 115 tareas |
| Nanbeige4.3-33B (original) | 33,1B | no disponible | Apache 2.0 | safetensors | no disponible en esta ficha |

La única comparación directa publicada es contra Bonsai 27B ejecutado en el motor Kindi, con una diferencia de 2 tareas sobre 115 a favor de esta cuantización. No se dispone de datos frente a otros modelos de la misma categoría (por ejemplo, Qwen o Llama de 30-34B) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización IQ3_XXS introduce pérdida de fidelidad: 82,8% de coincidencia en el token superior y KL de 0,225 respecto al original. Para tareas que exijan máxima precisión, conviene usar una cuantización mayor (Q5, Q6 o Q8) o el modelo en safetensors.
- El benchmark publicado es una evaluación inicial del propio autor, con una sola semilla por tarea y 115 tareas en total; no es comparable en rigor a suites estandarizadas como MMLU o HumanEval.
- kbench está prácticamente saturado (98,5% para ambos modelos), por lo que no discrimina bien la calidad real en tareas de agente más difíciles.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento en idiomas distintos del inglés; la model card no documenta evaluación multilingüe.
- La longitud de contexto nativa del modelo base no está documentada; el valor de 16K es una recomendación de ejecución del autor, no una especificación confirmada.
- El soporte de Kindi para este modelo está en desarrollo y no disponible todavía; el único runtime validado es llama.cpp con `--jinja`.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base no documenta en esta ficha sus propias limitaciones de entrenamiento ni restricciones adicionales.
- El repositorio tiene 354 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía muy limitada.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/ahtx/AH-Nanbeige4.3-33B-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- kbench (benchmark de agentes del autor): https://github.com/ahtx/kindi-bench
- Kindi (motor del autor): https://amirhusain.com/kindi
- Perfil del autor: https://amirhusain.com
