# maxgfr/s4-micro

## Resumen

s4-micro es un modelo de decisión de tipo *system one* desarrollado por maxgfr dentro del proyecto skycmd. Se trata de un encoder bidireccional de 2.214.913 parámetros con pesos ternarios, destilado a partir de Qwen3.5-4B durante una sola noche de entrenamiento. Su propósito es resolver decisiones genéricas con opciones en texto libre (clasificación, enrutado de herramientas, moderación o triaje de tickets) mediante una interfaz de probabilidades calibradas y salida temprana adaptativa. Es, según el autor, el primer modelo skycmd entrenado para decisiones generales en lugar de juegos.

La relevancia del modelo es doble. Por un lado, demuestra una arquitectura compacta (2,4 MB en total) con pesos ternarios, entrenamiento QAT, pila de estados con pesos compartidos y salidas tempranas a 2, 4 y 6 pasadas de bloque. Por otro, se publica explícitamente como un **resultado negativo documentado**: no superó su puerta de calidad definida antes del entrenamiento (0,55 en `typed_decisions_bench`) y obtuvo 0,343, por debajo de la clase mayoritaria (0,398) y de su predecesor s3-pico (0,382).

Por tanto, no debe evaluarse como un modelo listo para producción, sino como una pieza de investigación sobre interfaces de decisión, calibración y eficiencia extrema. El autor lo publica para explorar la interfaz (opciones libres, probabilidades calibradas, profundidad adaptativa y abstención), no para tomar decisiones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional con pila de estados de pesos compartidos y salidas tempranas (early exit) a 2, 4 y 6 pasadas de bloque; pesos ternarios entrenados con QAT |
| Parametros totales | 2.214.913 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos ternarios (formato nativo del modelo); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`s4-micro.gguf`, 2,4 MB, incluye tokenizer, temperaturas y umbrales de salida) |

## Arquitectura y entrenamiento

s4-micro es la arquitectura s3 escalada al lenguaje (etiqueta GGUF `skycmd-s2`). La pregunta y las opciones forman un flujo estático que se codifica una sola vez y se cachea; las opciones nunca atienden entre sí. Sobre esa representación se aplica una pila de estados con pesos compartidos y salidas tempranas en 2, 4 y 6 pasadas de bloque, con un umbral de salida calibrado que permite profundidad adaptativa y abstención. Los pesos son ternarios y se entrenaron con *quantization-aware training* (QAT).

El entrenamiento se realizó desde cero en Rust (mlx-rs) sobre un Apple M5. Primero hubo un preentrenamiento de modelado de lenguaje enmascarado (MLM) sobre SimpleStories, TinyStories y fragmentos de FineWeb; después, un entrenamiento de decisión con etiquetas suaves de Qwen3.5-4B (Apache 2.0, ejecutado localmente sobre letras de opción y calibrado por grupo) mezcladas con etiquetas gold, supervisión de mejora profunda sobre las salidas y QAT ternario. Los datos de decisión incluyen conjuntos de decisión tipados, conjuntos de etiquetas aleatorizadas sobre fragmentos web y de historias, enrutado de herramientas (function calling de glaive y hermes), triaje de tickets (Bitext) y moderación por reglas (Civil Comments). Banking77 y MASSIVE se reservaron para evaluación zero-shot.

## Capacidades

- Clasificación de texto y decisión entre opciones en texto libre (no limitadas a un conjunto fijo de etiquetas).
- Enrutado de herramientas (*tool routing*) para seleccionar entre funciones disponibles, aunque en las demos la mayoría de peticiones acaban en `no_tool`.
- Triaje de tickets y moderación de contenido por reglas, según los conjuntos de entrenamiento.
- Salida con probabilidades calibradas por grupo (ECE de 0,066 en los conjuntos zero-shot).
- Profundidad adaptativa mediante salidas tempranas y umbral de salida calibrado.
- Abstención: el modelo puede no decidir cuando la confianza no alcanza el umbral.
- Capacidad multilingüe: no disponible; solo inglés.
- Sin soporte documentado de generación de texto libre, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Exploración de interfaces de decisión: sirve para probar el formato System One de skycmd (opciones en texto libre, probabilidades calibradas, profundidad adaptativa y abstención) en el navegador, Node, Python, CLI o servidor, sin necesidad de GPU.
- Investigación sobre modelos ternarios y QAT: permite estudiar el comportamiento de un encoder de 2,2 M de parámetros con pesos ternarios y salidas tempranas en tareas de clasificación, incluyendo el análisis de su fallo frente a la clase mayoritaria.
- Estudio de destilación desde modelos grandes: el modelo documenta la destilación de etiquetas suaves de Qwen3.5-4B y la mezcla con etiquetas gold, útil como referencia metodológica para experimentos de destilación de bajo coste.
- Benchmarking de eficiencia extrema: con 2,4 MB de pesos, es un candidato para medir latencia y consumo en entornos con restricciones severas de memoria (WASM, dispositivos embebidos), siempre como prueba de concepto.
- Evaluación de calibración y abstención: su ECE de 0,066 en zero-shot lo hace útil para comparar estrategias de calibración por grupo y umbrales de salida en clasificadores pequeños.
- Docencia y divulgación: como ejemplo reproducible de un pipeline completo en Rust (preentrenamiento MLM, entrenamiento de decisión, QAT ternario y exportación a GGUF) ejecutado en hardware de consumo.
- Enrutado de herramientas en prototipos: a pesar de sus limitaciones, puede integrarse en una demo de *tool routing* para ilustrar el flujo de decisión, nunca como componente de producción.

## Benchmarks y rendimiento

| Conjunto | s4-micro | Referencia |
|---|---|---|
| typed-decisions bench | 0,343 | Clase mayoritaria 0,398; s3-pico 0,382; teacher (Qwen3.5-4B) 0,501; oscar-1-17m 0,6775 |
| Banking77 (zero-shot, 8 opciones) | 0,303 | s3-pico 0,247 |
| MASSIVE English (zero-shot, 8 opciones) | 0,335 | s3-pico 0,187 |

ECE en los conjuntos zero-shot: 0,066. Como referencia adicional, un BERT-Tiny de 4,4 M de parámetros afinado alcanza 0,794 en Banking77, lo que según el autor indica que faltaba preentrenamiento de lenguaje (solo 30 minutos de MLM desde cero en este caso), y motivó el desarrollo de s5-lite.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo pesa 2,4 MB en GGUF ternario, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren; el autor entrenó en un Apple M5 y el motor skycmd se ejecuta en navegador, Node, Python, CLI y servidor.
- Cabe en GPU consumer: sí, en cualquier GPU consumer y en CPU; también en entornos WASM.
- Opciones de despliegue: exclusivamente el motor skycmd (`cargo install --git https://github.com/maxgfr/skycmd sky-serve`; comando `skycmd decide --model s4-micro.gguf --request req.json --pretty`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en typed-decisions bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s4-micro | 2.214.913 | No disponible | 0,343 | Apache 2.0 | Hugging Face (GGUF) |
| s3-pico | No disponible | No disponible | 0,382 | No disponible | Proyecto skycmd |
| oscar-1-17m | 17 M (aprox.) | No disponible | 0,6775 | No disponible | No disponible |
| Qwen3.5-4B (teacher) | 4 B | No disponible | 0,501 | Apache 2.0 | No disponible en la informacion |

## Limitaciones y advertencias

- No supera su puerta de calidad: 0,343 frente al umbral de 0,55 y frente a la clase mayoritaria (0,398) en `typed_decisions_bench`.
- En las demos, el enrutador de herramientas envía la mayoría de peticiones a `no_tool` y el guardrail rara vez marca violaciones.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Riesgo de alucinación y de decisiones incorrectas alto para su propósito declarado; el autor indica explícitamente que se publique como resultado documentado, no para uso.
- No es un modelo generativo: no produce texto libre ni razonamiento multi-paso; su salida es una decisión entre opciones con probabilidades.
- Dependencia del motor skycmd: no se documenta compatibilidad con otros runtimes de inferencia (llama.cpp, vLLM, Ollama, TGI).
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones de calidad desaconsejan cualquier despliegue en producción.
- El preentrenamiento de lenguaje fue muy limitado (30 minutos de MLM desde cero), lo que el propio autor identifica como causa probable del bajo rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s4-micro
- Demo: https://huggingface.co/spaces/maxgfr/s4-micro
- Codigo: https://github.com/maxgfr/skycmd
- Issue de la puerta de calidad: https://github.com/maxgfr/skycmd/issues/1
- Benchmarks: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#skycmd-s4-s4-micro-generic-decisions-distilled-from-qwen35-experimental
- Historia del desarrollo (capitulo 22): https://maxgfr.github.io/skycmd/tutorial/22-s4-generic-decisions
- Guia de instalacion y formato System One: https://maxgfr.github.io/skycmd/install/
- Licencias de datos: https://github.com/maxgfr/skycmd/blob/main/DATA_LICENSES.md
- Modelo sucesor: https://huggingface.co/maxgfr/s5-lite
