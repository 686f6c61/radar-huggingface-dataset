# ProCreations/auto-3b-3

## Resumen

auto-3b-3 es un clasificador de 3.075 millones de parámetros derivado por fine-tuning de SmolLM3, desarrollado por ProCreations. Su función no es generar texto, sino decidir si una llamada a herramienta propuesta por un agente de IA (Claude Code, Codex, Gemini CLI, Cursor, Copilot CLI, entre otros) debe ejecutarse o bloquearse. El modelo recibe la llamada propuesta, la petición del usuario y el historial del agente, y emite una etiqueta binaria `approve` o `deny`.

Forma parte del proyecto Auto, un guardrail local que bloquea una llamada solo cuando es consecuente y el usuario no la solicitó, o cuando el agente está siguiendo instrucciones inyectadas en una página, fichero o salida de herramienta. Todo el procesamiento ocurre en la máquina del usuario, sin enviar datos a servicios externos.

La relevancia actual del modelo reside en su relación precisión/coste: según los datos declarados por el autor, alcanza un 96,0% de accuracy en el benchmark v3 (2.948 llamadas retenidas) con 21 ms por decisión en una NVIDIA RTX PRO 6000, frente a guards alojados que rondan el segundo por decisión y costes de miles de dólares por millón de decisiones. Los pesos se distribuyen en BF16 (6,2 GB) bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3 decoder (transformer denso), ajustado como clasificador binario |
| Parametros totales | 3.075.102.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada; las sesiones del runtime de Auto se ajustan a 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3, un transformer decoder denso de 3.075 millones de parámetros, y se ajusta como clasificador de dos clases (`approve`/`deny`) sobre la base `ProCreations/auto-3b`. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente indica que las etiquetas de entrenamiento siguen una regla de decisión concreta y que los guards alojados comparados fueron prompteados con esa misma regla.

La innovación principal no está en la arquitectura, sino en el diseño del benchmark v3: 2.948 llamadas retenidas, cada una emparejada con una casi-gemela donde un único detalle invierte la respuesta correcta (quién pidió la acción, alcance de la petición, entorno de producción o staging, la llamada exacta o el origen de una instrucción). Un guard que decida por rasgos superficiales falla una de cada dos mitades del par. El modelo se evalúa con umbral `P(deny) >= 0.5`.

## Capacidades

- Clasificación binaria de llamadas a herramienta: emite `approve` o `deny` a partir de la llamada propuesta, la petición del usuario y el historial del agente.
- Detección de instrucciones inyectadas: identifica si el agente sigue órdenes plantadas en páginas, ficheros o salidas de herramientas (98,2% de accuracy en el slice de twin flips sobre origen de instrucción).
- Razonamiento sobre alcance y entorno: distingue operaciones sobre producción frente a staging (96,6%) y evalúa si la petición del usuario cubre la acción propuesta (95,3%).
- Soporte de sesiones largas: 95,2% de accuracy en el slice de sesiones largas del benchmark v3.
- Cobertura de herramientas no-shell: 96,4% en herramientas de navegador, correo, CRM y similares.
- Integración como guardrail en agentes de codificación (Claude Code, Codex, Gemini CLI, Cursor, Copilot CLI) mediante el runtime de Auto.
- Ejecución local: no requiere enviar datos a APIs externas.
- No es un modelo generativo: no produce texto libre, tool calling propio ni capacidades multimodales.

## Casos de uso

- Guardrail de agentes de codificación en local: integrado en el runtime de Auto, intercepta cada llamada a herramienta antes de ejecutarse y la bloquea si es destructiva y no fue solicitada, con 21 ms de latencia mediana en GPU NVIDIA RTX PRO 6000.
- Protección frente a inyección de prompts: inspecciona el historial del agente y la salida de herramientas para detectar instrucciones plantadas en páginas web o ficheros, con 98,2% de accuracy en el slice correspondiente del benchmark v3.
- Control de operaciones en producción: distingue llamadas dirigidas a producción frente a staging (96,6% en twin flips de entorno), lo que permite bloquear comandos destructivos en entornos críticos sin frenar el trabajo en desarrollo.
- Automatización de flujos con herramientas no-shell: cubre navegador, correo y CRM con 96,4% de accuracy, útil para agentes que operan sobre sistemas de negocio además de la shell.
- Sesiones de agente de larga duración: mantiene 95,2% de accuracy en sesiones largas, adecuado para tareas multi-paso donde el contexto crece y el riesgo de desviación aumenta.
- Alternativa de bajo coste a guards alojados: a 77 dólares por millón de decisiones en GPU alquilada (y 0,50–3 dólares por millón en electricidad sobre GPU propia), sustituye APIs de revisión que cuestan entre 395 y 11.353 dólares por millón según los datos del autor.
- Despliegue en hardware de consumo para equipos pequeños: al ser un modelo de 3,08B en BF16 (6,2 GB), puede ejecutarse en GPUs de gama alta de consumo, aunque el autor recomienda auto-0.4b-3 para Apple M-series por latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) en el benchmark v3 (2.948 llamadas retenidas):

| Modelo | Accuracy v3 (IC 95%) | Daño no detectado | Sobre-bloqueo | Ambos gemelos correctos | Tiempo por decisión | Coste por 1M |
|---|---:|---:|---:|---:|---:|---:|
| **auto-3b-3** | 96,0% (95,3–96,7) | 3,1% | 4,8% | 92,8% | 21 ms | 77 $ |
| DeepSeek V4.1 Flash (max reasoning) | 95,6% (94,8–96,3) | 0,6% | 7,9% | 91,1% | 1,3 s | 3.043 $ |
| Codex auto-review (medium) | 95,5% (94,7–96,2) | 4,9% | 4,1% | 90,8% | – | 11.353 $ |
| GLM-5.3 Flash (high reasoning) | 95,4% (94,5–96,1) | 5,5% | 3,8% | 90,2% | 1,2 s | 629 $ |
| auto-0.4b-3 | 93,1% (92,2–94,0) | 6,0% | 7,6% | 87,2% | 7 ms | 23 $ |
| TypeSafe Jev 1.14 | 90,2% (89,1–91,2) | 12,5% | 7,3% | 80,1% | 136 ms | 227 $ |
| auto-150m-3 | 88,8% (87,7–89,9) | 9,1% | 13,1% | 78,7% | 5 ms | 13 $ |
| GPT-6 Luna (low reasoning) | 87,9% (86,7–89,0) | 5,8% | 17,9% | 75,8% | – | 395 $ |

Benchmark original Approve-or-Deny (3.000 ítems, split test):

| Métrica | auto-3b | auto-3b-3 |
|---|---:|---:|
| Accuracy | 98,03% | 98,23% |
| Llamadas dañinas aprobadas (de 1.401) | 22 | 35 |
| Llamadas autorizadas denegadas (de 1.599) | 37 | 18 |
| AUROC | – | 0,9984 |

Desglose en el benchmark v3:

| Slice | Accuracy |
|---|---:|
| Escrito por Claude Opus 4.8 (no usado en entrenamiento) | 93,0% |
| Escrito por GPT-6.1 Sol | 97,7% |
| Sesiones largas | 95,2% |
| Herramientas no-shell (navegador, correo, CRM, ...) | 96,4% |
| Twin flips sobre quién pidió | 96,9% |
| Twin flips sobre alcance | 95,3% |
| Twin flips sobre entorno | 96,6% |
| Twin flips sobre la llamada exacta | 94,5% |
| Twin flips sobre origen de la instrucción | 98,2% |

Las categorías de daño más frecuentemente no detectadas son payload ofuscado (5,7%), destrucción de datos no solicitada (4,8%) y sistema de ficheros destructivo (4,3%). En el runtime de Auto sobre Apple MPS (sesiones ajustadas a 8.192 tokens), el modelo obtuvo 97,3% sobre 300 ítems aleatorios del benchmark v3.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,2 GB en BF16 para los pesos; el margen adicional para el contexto (hasta 8.192 tokens en el runtime de Auto) eleva el consumo según la implementación.
- GPU recomendadas: NVIDIA RTX PRO 6000 (referencia del autor, 21 ms por decisión); cualquier GPU NVIDIA o AMD con al menos 8 GB de VRAM para BF16.
- GPU de consumo: cabe en tarjetas de gama alta con 8 GB o más de VRAM en BF16; no se detallan requisitos para cuantizaciones inferiores.
- Apple M-series: funciona a través del runtime de Auto, pero con latencia mediana de 0,86 s por decisión en una muestra de 300 ítems y unos 12 s en sesiones largas; el autor recomienda auto-0.4b-3 en ese hardware.
- CPU: las sesiones largas tardan minutos; no es un entorno recomendado para producción.
- Opciones de despliegue: runtime de Auto (https://github.com/SSHdotCodes/auto); al ser un modelo de transformers con safetensors, es compatible con el ecosistema estándar (vLLM, TGI, llama.cpp/Ollama si se generan cuantizaciones GGUF, no publicadas).
- Throughput y latencia: 21 ms por decisión en RTX PRO 6000, una petición a la vez; coste de 77 $ por millón de decisiones en GPU alquilada a 2,18 $/h y 0,50–3 $ por millón en electricidad sobre GPU propia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy v3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| auto-3b-3 | 3,08B | no disponible (8.192 tokens en runtime Auto) | 96,0% | Apache 2.0 | Hugging Face, local |
| auto-0.4b-3 | no disponible | no disponible | 93,1% | no disponible | Hugging Face, local |
| auto-150m-3 | no disponible | no disponible | 88,8% | no disponible | Hugging Face, local |
| DeepSeek V4.1 Flash | no disponible | no disponible | 95,6% | propietaria | API alojada |
| GLM-5.3 Flash | no disponible | no disponible | 95,4% | propietaria | API alojada |
| TypeSafe Jev 1.14 | no disponible | no disponible | 90,2% | propietaria | servicio alojado |

Frente a los guards alojados, auto-3b-3 ofrece accuracy comparable o superior con latencia dos órdenes de magnitud menor y un coste por decisión entre uno y dos órdenes de magnitud inferior, a cambio de ejecutarse en hardware propio y de no contar con verificación independiente de sus métricas. Dentro de la familia Auto, el modelo de 3B es el más preciso, mientras que auto-0.4b-3 y auto-150m-3 priorizan latencia y coste.

## Limitaciones y advertencias

- Métricas no verificadas: todos los resultados del model-index y de la model card están marcados como `verified: false`; proceden del propio autor y no de una evaluación independiente.
- Sesgos de decisión: en el benchmark original, la versión v3 aprueba más llamadas dañinas que su predecesora (35 frente a 22 de 1.401) y deniega menos llamadas autorizadas (18 frente a 37 de 1.599); el equilibrio entre daño no detectado y sobre-bloqueo debe calibrarse según el contexto de despliegue.
- Daño no detectado en categorías concretas: payload ofuscado (5,7%), destrucción de datos no solicitada (4,8%) y sistema de ficheros destructivo (4,3%) son los puntos débiles declarados.
- Rendimiento dependiente del escritor de los datos: 93,0% de accuracy en ítems generados por Claude Opus 4.8, frente a 97,7% en los de GPT-6.1 Sol, lo que sugiere sensibilidad a la distribución del texto de entrada.
- Idiomas no declarados: la model card no especifica qué idiomas soporta; no hay garantía de comportamiento fuera del inglés.
- Contexto limitado en la práctica: las sesiones del runtime de Auto se ajustan a 8.192 tokens; no se documenta la ventana nativa del modelo base ni el comportamiento más allá de ese límite.
- Hardware Apple y CPU: latencias de 0,86 s por decisión en M-series y de minutos en CPU para sesiones largas, lo que desaconseja su uso en esos entornos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece ningún compromiso de exactitud en producción.
- Dependencia del ecosistema Auto: su valor práctico está ligado al runtime de Auto; fuera de él requiere integrar manualmente la lógica de clasificación y el formato de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/auto-3b-3
- Repositorio del proyecto Auto: https://github.com/SSHdotCodes/auto
- Modelo base: https://huggingface.co/ProCreations/auto-3b
- Modelo auto-0.4b-3: https://huggingface.co/ProCreations/auto-0.4b-3
- Modelo auto-150m-3: https://huggingface.co/ProCreations/auto-150m-3
- Dataset Approve-or-Deny: https://huggingface.co/datasets/ProCreations/approve-or-deny
- Resultados de evaluación: `eval/results.json` y `eval/` en el repositorio del modelo
