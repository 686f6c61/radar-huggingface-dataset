# netprojects/Qwen3.8-27B-hermes-adapted-GGUF

## Resumen

Qwen3.8-27B-hermes-adapted-GGUF es una compilación de cuantizaciones GGUF para llama.cpp del modelo harness-hub/Qwen3.8-27B-hermes-adapted, que a su vez es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.8-27B. Lo publica el usuario netprojects y su propósito es ofrecer ficheros listos para ejecutar sin necesidad de aplicar el adaptador LoRA por separado, manteniendo la capa de predicción multi-token (MTP) de Qwen y añadiendo un proyector multimodal para entrada de imágenes.

El ajuste original, entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL, LoRA de rango 32 y alpha 64, checkpoint en el paso 160 de 1000 previstos), está orientado a tareas de ingeniería de software y uso de terminal como motor del agente Hermes Agent de Nous Research. Según los resultados publicados por el autor del adaptador, mejora SWE-bench Pro (hard 51) del 29,4% al 43,1% y Terminal-Bench 2.1 del 44,7% al 58,8% respecto al modelo base, con menos del 40% de turnos y aproximadamente la mitad de tokens generados.

La relevancia actual reside en que empaqueta un modelo de 27.320.697.856 parámetros en cuantizaciones que van de 10,5 GB a 29,0 GB, con métricas de fidelidad publicadas (coincidencia de siguiente token y divergencia KL frente al GGUF BF16), lo que permite desplegarlo en estaciones de trabajo y equipos de consumo con llama.cpp, además de builds MLX para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8) con capa de predicción multi-token (MTP) y proyector multimodal para imagen; empaquetado como GGUF para llama.cpp |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en el ejemplo de despliegue del autor; Hermes Agent requiere un mínimo de 64.000 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_M; proyector de visión en F16; matriz de importancia (imatrix) publicada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); builds MLX de 6 bits disponibles en un repositorio aparte |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, un transformer de 27.320.697.856 parámetros. Sobre él, harness-hub aplicó un ajuste LoRA con aprendizaje por refuerzo mediante AsyncGRPO en TRL, con rango 32 y alpha 64, entrenado para actuar como motor de Hermes Agent en tareas de ingeniería de software y terminal. El checkpoint publicado corresponde al paso 160 de los 1000 planificados. La fusión del adaptador con el modelo base (revisiones 09fb741 y 3756181 respectivamente) se realizó antes de la conversión a GGUF, de modo que los ficheros no requieren `--lora`.

Cada fichero conserva la capa MTP de Qwen, que llama-server puede aprovechar para decodificación especulativa mediante `--spec-type draft-mtp`. El proyector `mmproj-Qwen3.8-27B-hermes-F16.gguf` (0,9 GB) habilita la entrada de imágenes. El proceso de cuantización combina dos rutas: Q8_0, Q6_K y Q4_K_M se generaron desde el GGUF BF16; Q3_K_M, IQ3_XXS e IQ2_M se generaron desde el Q8_0 con una matriz de importancia calculada con llama-imatrix sobre prosa en inglés y código Python con licencia MIT en fragmentos de 512 tokens, manteniendo la capa MTP en Q8_0 en esos tres ficheros. Q5_K_M e IQ4_XS se cuantizaron desde el Q8_0 con `--allow-requantize` y una matriz de importancia derivada del 80% inicial de calibration_datav3 de bartowski.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento orientado a tareas de ingeniería de software: localización y corrección de fallos, edición de código y ejecución de comandos.
- Uso de terminal y agentes: entrenado específicamente para el bucle de Hermes Agent, con menor número de turnos y de tokens generados que el modelo base en las tareas evaluadas.
- Entrada de imágenes a través del proyector mmproj (pipeline image-text-to-text).
- Decodificación especulativa mediante la capa MTP integrada.
- Modo thinking configurable: el adaptador se entrenó y evaluó con thinking desactivado y el autor recomienda mantenerlo así.
- Soporte de plantilla de chat Jinja con parámetros de plantilla (`enable_thinking`).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de corrección de fallos en repositorios: ejecutado con Hermes Agent y thinking desactivado, el modelo recibe una descripción del fallo, inspecciona el árbol de código y aplica parches. Los resultados publicados en SWE-bench Pro (hard 51) del 43,1% respaldan este escenario, y el consumo reducido de turnos y tokens abarata cada ejecución.
- Automatización de tareas de terminal: el modelo puede encadenar comandos de shell para diagnóstico y reparación de entornos, con un rendimiento declarado del 58,8% en Terminal-Bench 2.1 frente al 44,7% del base.
- Asistente de codificación en local con llama-server: sirviendo Q6_K (22,4 GB) con `--spec-type draft-mtp` y 65.536 tokens de contexto se obtiene un endpoint compatible con la API de OpenAI en el puerto 8000, apto para integrarse en editores o scripts propios.
- Revisión de capturas y diagramas: con el proyector mmproj cargado, el modelo acepta imágenes junto al texto, útil para interpretar errores mostrados en pantalla o diagramas de arquitectura durante una sesión de depuración.
- Despliegue en Apple Silicon: las builds MLX de 6 bits permiten ejecutar el modelo en equipos Mac con memoria unificada, sin depender de GPU dedicada.
- Entornos con memoria limitada: las variantes IQ2_M (10,5 GB) y IQ3_XXS (11,6 GB) permiten mantener un agente de código funcional en máquinas modestas, asumiendo la pérdida de fidelidad documentada (89,8% y 92,4% de coincidencia de siguiente token respectivamente).
- Integración en pipelines de CI: el endpoint local puede invocarse desde jobs automatizados para proponer correcciones sobre tests fallidos, con la ventaja de que no se envían fuentes a servicios externos.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub), bajo Hermes Agent y con thinking desactivado:

| Benchmark | Modelo base | Adaptador hermes | Observaciones |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% | Menos del 40% de los turnos del base en tareas resueltas por ambos |
| Terminal-Bench 2.1 | 44,7% | 58,8% | Aproximadamente 2× menos tokens generados |

El autor indica además que, con thinking desactivado, el adaptador iguala al modelo base con thinking en su esfuerzo máximo (xhigh) usando entre 3,5 y 4,4 veces menos tokens.

Fidelidad de las cuantizaciones frente al GGUF BF16 (12 prompts cortos, salvo donde se indique):

| Fichero | Tamano | Mismo siguiente token | Divergencia KL media |
|---|---|---|---|
| Q6_K (recomendado) | 22,4 GB | 98,9% | 0,0031 |
| Q8_0 | 29,0 GB | 99,7% | 0,0055 |
| Q5_K_M | 19,5 GB | 97,6%¹ | 0,0054¹ |
| Q4_K_M | 16,8 GB | 94,8% | 0,0820 |
| IQ4_XS | 15,3 GB | 94,2%¹ | 0,0195¹ |
| Q3_K_M | 13,8 GB | 92,9% | 0,0903 |
| IQ3_XXS | 11,6 GB | 92,4% | 0,1383 |
| IQ2_M | 10,5 GB | 89,8% | 0,1837 |

¹ Medido frente al Q8_0 del autor sobre texto reservado, no frente al BF16 en los mismos 12 prompts; no es directamente comparable con el resto de filas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más el contexto y el proyector. Q8_0 requiere unos 29,0 GB de pesos; Q6_K, 22,4 GB; Q4_K_M, 16,8 GB; IQ2_M, 10,5 GB. Añadir 0,9 GB si se carga el proyector de visión y espacio adicional para la caché KV según el contexto configurado (hasta 65.536 tokens en el ejemplo del autor).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, Q6_K y Q8_0 encajan en GPU de 32-40 GB o superiores; Q4_K_M e IQ4_XS en GPU de 24 GB; IQ3_XXS e IQ2_M en GPU de 12-16 GB, asumiendo margen para contexto y caché.
- GPU de consumo: las variantes Q4_K_M, IQ4_XS, Q3_K_M, IQ3_XXS e IQ2_M son las candidatas para tarjetas de 16 GB o menos; Q6_K exige tarjetas de gama alta o memoria unificada amplia.
- Apple Silicon: el autor verificó la fusión en un MacBook Pro M5 Max con 128 GB y publica builds MLX de 6 bits en un repositorio aparte.
- Opciones de despliegue: llama.cpp mediante `llama-server` (con `--jinja`, `--chat-template-kwargs '{"enable_thinking": false}'`, `--spec-type draft-mtp` y `-mm` para visión); builds MLX para Apple Silicon. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no se publican cifras concretas; el autor atribuye una decodificación más rápida al uso de la capa MTP con `--spec-type draft-mtp`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-GGUF (este) | 27,3 B | 65.536 tokens en el ejemplo de despliegue | SWE-bench Pro 43,1%; Terminal-Bench 2.1 58,8% | Apache 2.0 | GGUF en HF; MLX 6 bits en repo aparte |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | SWE-bench Pro 29,4%; Terminal-Bench 2.1 44,7% | no disponible en la información | Pesos originales en HF |
| harness-hub/Qwen3.8-27B-hermes-adapted (adaptador) | 27,3 B (LoRA rango 32) | no disponible | Mismos resultados que este GGUF | no disponible en la información | Adaptador LoRA en HF; requiere fusión |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; el autor recomienda mantenerlo así. Usarlo con thinking activado queda fuera del régimen validado.
- El checkpoint corresponde al paso 160 de 1000 planificados, por lo que el ajuste no está completado según el plan original.
- Las cuantizaciones de menor tamaño pierden fidelidad de forma medible: IQ2_M retiene el 89,8% de coincidencia de siguiente token y una divergencia KL de 0,1837 frente al BF16, lo que puede degradar tareas de código sensibles.
- Las cifras de Q5_K_M e IQ4_XS no son comparables con el resto de la tabla por haberse medido contra el Q8_0 sobre texto reservado.
- La matriz de importancia se calculó sobre prosa en inglés y código Python con licencia MIT; el rendimiento en otros idiomas o dominios no está caracterizado, y los idiomas soportados no se documentan.
- En Q3_K_M, IQ3_XXS e IQ2_M la capa MTP se mantiene en Q8_0 porque la matriz de importancia no la cubre.
- No se publican datos sobre sesgos, tasa de alucinación ni evaluaciones de seguridad.
- El repositorio ocupa 139,9 GB en total; conviene descargar solo los ficheros necesarios.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre el comportamiento en producción.
- La verificación del autor se realizó en un único equipo (MacBook Pro M5 Max, 128 GB) el 19 de noviembre de 2026; no hay datos de latencia ni throughput en otras plataformas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Builds MLX 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Hermes Agent (Nous Research): https://github.com/NousResearch/hermes-agent
- Ficheros destacados: Qwen3.8-27B-hermes-Q6_K.gguf, Qwen3.8-27B-hermes-Q8_0.gguf, Qwen3.8-27B-hermes-Q5_K_M.gguf, Qwen3.8-27B-hermes-Q4_K_M.gguf, Qwen3.8-27B-hermes-IQ4_XS.gguf, Qwen3.8-27B-hermes-Q3_K_M.gguf, Qwen3.8-27B-hermes-IQ3_XXS.gguf, Qwen3.8-27B-hermes-IQ2_M.gguf, mmproj-Qwen3.8-27B-hermes-F16.gguf, Qwen3.8-27B-hermes.imatrix.gguf (todos en la raíz del repositorio GGUF)
