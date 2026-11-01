# austindixson/python-sandbox-math-tool

## Resumen

`python-sandbox-math-tool` es un proyecto de código abierto desarrollado por Austin Dixson que combina dos piezas: una herramienta `run_python` ejecutada en un entorno aislado (sandbox) y un proxy compatible con la API de OpenAI que permite inyectar esa herramienta en cualquier modelo local servido con llama.cpp. No es un modelo de lenguaje en sí, sino un arnés de tool calling pensado para modelos pequeños que corren en local, con el objetivo de evaluar si el acceso a ejecución de código mejora su rendimiento en tareas matemáticas.

El caso de uso principal que documenta el autor es la velocidad, no la precisión. Con `run_python`, el modelo LFM3-1.7B (de LiquidAI) obtiene una precisión matemática prácticamente idéntica a la de la inferencia sin herramientas, pero genera entre un 20 % y un 28 % menos de tokens por problema, lo que reduce el tiempo de espera. El modelo cuantizado en 4 bits ocupa un archivo de 1,05 GB (unos 1,2 GB en memoria) y alcanza una mediana de 153 tokens por segundo en un MacBook Pro M1 Max de 2021.

El proyecto es relevante ahora porque demuestra empíricamente, con intervalos de confianza y tests de McNemar, que añadir ejecución de código a un modelo pequeño no mejora automáticamente su exactitud cuando dispone de contexto completo; los beneficios observados en ejecuciones previas con contexto limitado provenían del recorte de contexto y no de la herramienta. Esa honestidad metodológica lo convierte en una referencia útil para quien diseñe pipelines de agentes locales con modelos de menos de 2.000 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el proyecto es un arnés de tool calling sobre modelos llama.cpp; el modelo evaluado es LFM3-1.7B) |
| Parametros totales | no disponible para el proyecto; el modelo evaluado es LFM3-1.7B (1.700 millones) |
| Parametros activos | no aplica (el modelo evaluado no es MoE) |
| Longitud de contexto | hasta 262.144 tokens en las pruebas de contexto completo; 256.000 tokens en el test de agente |
| Tipos de cuantizacion | QAD-Q4_0 GGUF documentada en las pruebas; el proxy admite cualquier modelo servido por llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no aplica al proyecto; el modelo evaluado se distribuye en GGUF |

## Arquitectura y entrenamiento

El proyecto no entrena ningún modelo. Se compone de una herramienta `run_python` ejecutada en un proceso Python nuevo por llamada, bajo `sandbox-exec` en macOS, con red denegada, un tiempo de espera de 10 segundos y un límite de 2.000 caracteres en la salida. Sobre esa herramienta se construye un proxy compatible con la API de OpenAI que intercepta las peticiones a cualquier modelo servido por llama.cpp, expone la función al modelo y ejecuta el código cuando este la invoca.

Las pruebas de contexto completo se realizaron con LFM3-1.7B en precisión BF16 sobre una A100 de Hugging Face con SGLang, contexto de 262.144 tokens y los parámetros de muestreo de la model card del modelo base (temperatura 1,0, top_p 0,95, top_k 20), con una muestra por problema y corrección mediante `math_verify`. En esas ejecuciones en la nube el código no se ejecutó en el sandbox local del proyecto: corrió en un proceso nuevo bajo el usuario `nobody` y la sonda de red devolvió `NET_OK`, por lo que el código tuvo acceso a red. El sandbox aislado descrito solo se aplica al proxy en local. Las pruebas de velocidad y de agente se hicieron con la cuantización QAD-Q4_0 sobre llama.cpp build 11938 en un M1 Max con 64 GB.

## Capacidades

- Ejecución de código Python en sandbox con red denegada, tiempo de espera de 10 segundos y truncado de salida a 2.000 caracteres.
- Tool calling sobre cualquier modelo local servido por llama.cpp mediante un proxy compatible con la API de OpenAI.
- Razonamiento matemático asistido: el modelo puede delegar cálculos aritméticos, estadísticos y de conversión de unidades en código ejecutado.
- Modo de verificación opcional (`--verify`) que instruye al modelo a comprobar su respuesta con código antes de responder.
- Soporte de conversaciones multi-turno con contexto largo (hasta 262.144 tokens en las pruebas documentadas).
- Compatibilidad con modelos pequeños: el arnés está pensado para modelos de 1 a 2 mil millones de parámetros en hardware de consumo.
- No dispone de capacidades de visión, audio ni multimodalidad.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Asistencia matemática local con modelos pequeños: el proxy permite que un modelo de 1,7 mil millones de parámetros delegue la aritmética en Python, reduciendo la generación de tokens entre un 20 % y un 28 % por problema en AIME y un 14 % en MATH-500, con la misma precisión.
- Despliegue en portátiles de gama alta: con un archivo GGUF de 1,05 GB y unos 1,2 GB en memoria, el conjunto cabe holgadamente en un MacBook Pro M1 Max y ofrece 153 tokens por segundo de mediana, apto para uso interactivo sin GPU dedicada.
- Automatización de tareas de oficina con cálculos: los 27 problemas sintéticos del test de agente (finanzas, estadística, conversión de unidades, fechas y combinaciones) se resolvieron 27 de 27 con Python frente a 21 de 27 sin herramientas, con 4,90 segundos por tarea frente a 27,57.
- Agentes locales de bajo coste: el arnés permite construir agentes con tool calling sobre llama.cpp sin depender de APIs en la nube, con un tiempo medio por tarea 5,6 veces menor y 6,2 veces menos tokens de salida cuando se usa Python.
- Evaluación de modelos pequeños: el repositorio incluye puntuaciones, scorer y datos por problema (`score_report.md`) que permiten reproducir la comparación entre inferencia con y sin herramientas.
- Prototipado de sandboxing para ejecución de código generado por LLM: el uso de `sandbox-exec`, proceso nuevo por llamada, red denegada y límites de tiempo y salida sirve como plantilla para pipelines que necesiten ejecutar código no confiable en local.
- Integración en herramientas compatibles con OpenAI: al exponer una API compatible, el proxy puede conectarse a clientes y frameworks que ya hablan ese protocolo sin cambios en el código del cliente.

## Benchmarks y rendimiento

Resultados de contexto completo (30 de octubre de 2026) con LFM3-1.7B en BF16 sobre A100 con SGLang, contexto de 262.144 tokens, una muestra por problema y corrección con `math_verify`:

| Conjunto | Sin herramientas | Python | Python + verify |
|---|---|---|---|
| AIME 2025 (30) | 24/30 = 80,0 % | 22/30 = 73,3 % | 25/30 = 83,3 % |
| AIME 2026 (30) | 26/30 = 86,7 % | 25/30 = 83,3 % | 25/30 = 83,3 % |
| AIME, 60 problemas | 50/60 = 83,3 % | 47/60 = 78,3 % | 50/60 = 83,3 % |
| MATH-500 | 486/500 = 97,2 % | 486/500 = 97,2 % | 481/500 = 96,2 % |

Ninguna de las diferencias de precisión es estadísticamente significativa. En el contraste Python frente a sin herramientas sobre los 60 problemas de AIME, Python acertó 3 problemas que el modelo sin herramientas falló y el modelo sin herramientas acertó 6 que Python falló; el test exacto de McNemar da p = 0,51.

| Medida | Sin herramientas | Python | Python + verify |
|---|---|---|---|
| Tokens de AIME por problema resuelto | 21.776 | 16.688 (−23 %) | 17.495 (−20 %) |
| Tokens medios de AIME por problema | 18.147 | 13.072 (−28 %) | 14.579 (−20 %) |
| Tokens de MATH-500 por problema resuelto | 3.752 | 3.221 (−14 %) | 3.510 (−6 %) |

Tiempos medidos en el servidor en la nube (lectura aproximada por ser un servidor compartido y con batching): en AIME, 287,1 s por problema resuelto sin herramientas frente a 246,9 s con Python (−14,0 %); en MATH-500, 74,9 s frente a 77,7 s (+3,7 %), porque los problemas cortos apenas se benefician de menos tokens y siguen pagando el viaje de ida y vuelta de la herramienta.

Velocidad en Mac (LFM3-1.7B QAD-Q4_0, llama.cpp build 11938, MacBook Pro M1 Max de 64 GB, cuatro ensayos de 400 tokens): generación de 137,6 a 157,2 tokens por segundo, mediana 153; procesamiento de prompt de 687 a 729 tokens por segundo en un prompt corto.

Test de agente (mismo Mac, contexto de 256.000 tokens, temperatura 0,1, top_k 50, repeat_penalty 1,1, máximo 8.192 tokens de salida, 27 preguntas sintéticas):

| Tareas | Python (semillas 0, 1, 2) | Sin herramientas (semilla 0) |
|---|---|---|
| 12 problemas de matemáticas de enunciado | 12/12 en cada semilla | 9/12 |
| Las 27 tareas (matemáticas, unidades, fechas, combinaciones) | 27/27 en cada semilla, 81/81 | 21/27 |
| Segundos medios por tarea, las 27 (semilla 0) | 4,90 | 27,57 |
| Tokens de salida medios por tarea, las 27 (semilla 0) | 556 | 3.465 |
| Segundos medios por tarea, las 12 de matemáticas (semilla 0) | 4,65 | 27,07 |

Como referencia externa, la model card de Qwen3.6-35B-A3B declara 92,7 en AIME 2026 con su propia configuración; LFM3-1.7B obtuvo 86,7 sin herramientas, 6 puntos menos con aproximadamente 1/20 de los parámetros totales. El autor no ejecutó Qwen por su cuenta.

## Requisitos de hardware

- VRAM estimada: unos 1,2 GB en memoria para LFM3-1.7B en QAD-Q4_0 (archivo de 1.049.615.680 bytes, 1,05 GB); el modelo en BF16 requiere bastante más, aunque no se documenta la cifra exacta.
- GPU recomendadas: cualquier GPU consumer reciente sirve para el modelo cuantizado; las pruebas de contexto completo se hicieron en una A100 de 80 GB (no se especifica la variante) por la ventana de 262.144 tokens.
- Cabe en GPU consumer: sí, el modelo de 1,7 mil millones en 4 bits cabe en GPUs de 4 GB o más y en memoria unificada de Apple Silicon; las pruebas de referencia se hicieron en un MacBook Pro M1 Max de 64 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, build 11938 en las pruebas) y SGLang (usado en las pruebas en la nube); el proxy es compatible con la API de OpenAI, por lo que puede conectarse a clientes que hablen ese protocolo.
- Latencia y throughput: 153 tokens por segundo de mediana en generación y 687 a 729 tokens por segundo de procesamiento de prompt en un M1 Max; en A100, 246,9 s por problema resuelto de AIME con Python frente a 287,1 s sin herramientas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME 2026 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B con este arnés | 1,7 mil millones | 262.144 tokens | 86,7 % sin herramientas; 83,3 % con Python | MIT (proyecto) | GGUF en HuggingFace |
| Qwen3.6-35B-A3B | 35 mil millones totales, MoE | no disponible en la información | 92,7 % (dato de su model card) | no disponible | no disponible |
| Clover-35B-A3B-Preview | 35 mil millones totales, MoE | no disponible | no disponible | no disponible | GGUF IQ4_XS en HuggingFace |

La comparación con Qwen3.6-35B-A3B procede del propio autor y no de una ejecución independiente; la diferencia de 6 puntos en AIME 2026 se obtiene con aproximadamente 1/20 de los parámetros totales. No se dispone de datos de benchmarks para Clover-35B-A3B-Preview en la información proporcionada.

## Limitaciones y advertencias

- La herramienta no mejora la precisión matemática cuando el modelo dispone de contexto completo; las ganancias de exactitud observadas en las ejecuciones del 28 de octubre con un límite de 25.000 tokens provenían del recorte de contexto y no de `run_python`.
- En las pruebas en la nube sobre Hugging Face el código se ejecutó con acceso a red (`NET_OK`), a diferencia del sandbox local que deniega la red; los resultados de aislamiento no son extrapolables a ese entorno.
- El sandbox local depende de `sandbox-exec` en macOS; no se documenta el mecanismo equivalente en Linux o Windows.
- Los tiempos medidos en la A100 proceden de un servidor compartido y con batching, por lo que deben interpretarse como aproximados.
- El test de agente se hizo con 27 preguntas sintéticas y no constituye un benchmark; los resultados no deben generalizarse.
- Las cifras de precisión se basan en una sola muestra por problema, lo que limita la potencia estadística de las comparaciones.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones de uso comercial más allá de la licencia MIT del proyecto.
- No se dispone de información sobre idiomas soportados por el modelo evaluado ni sobre el comportamiento del arnés en idiomas distintos del inglés.
- El proxy añade un viaje de ida y vuelta por llamada a herramienta, lo que penaliza tareas cortas, como muestra el aumento del 3,7 % en el tiempo por problema de MATH-500.
- El límite de 2.000 caracteres en la salida de la herramienta puede truncar resultados de código que imprima mucho texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/austindixson/python-sandbox-math-tool
- Demo Space: https://huggingface.co/spaces/austindixson/python-sandbox-math-demo
- Blog con resultados de contexto completo (30 de octubre): https://www.destroyrebuild.xyz/blog/lfm3-python-tool-full-context
- Blog con ejecuciones limitadas (28 de octubre): https://www.destroyrebuild.xyz/blog/lfm3-python-sandbox
- Modelo LFM3-1.7B GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Modelo Clover-35B-A3B-Preview GGUF IQ4_XS: https://huggingface.co/austindixson/Clover-35B-A3B-Preview-GGUF-IQ4_XS-Mac
- Datos crudos, scorer y resultados por problema: https://huggingface.co/austindixson/lfm3-smallbig-distill/tree/main/math_bf16_1030
- Paper sobre ejecución de código con LLM (arXiv 2211.10435): https://arxiv.org/abs/2211.10435
- Paper sobre tool use (arXiv 2211.12588): https://arxiv.org/abs/2211.12588
- Paper sobre razonamiento con herramientas (arXiv 2309.17452): https://arxiv.org/abs/2309.17452
