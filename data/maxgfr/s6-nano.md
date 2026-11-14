# maxgfr/s6-nano

## Resumen

s6-nano es un modelo de decisión de tipo "system-one" desarrollado por maxgfr, diseñado para responder preguntas tipadas (`choice`, `score`, `noul`) sobre un estado descrito en texto libre, devolviendo probabilidades calibradas en un único forward pass por pregunta. Con 1.486.225 parámetros según la model card (609.153 según los safetensors del repo) y pesos ternarios cuantizados en GGUF de 715 KB, el modelo se posiciona como una propuesta extrema de eficiencia: inferencia en microsegundos nativamente y en milisegundos bajo WASM.

El modelo forma parte del ecosistema skycmd, un motor escrito íntegramente en Rust que incluye un entorno de juegos (Flappy Drone, Rescue Run, Obstacle Dodge y un Doom-like) y un benchmark de decisiones tipadas (`typed_decisions_bench`). s6-nano es el primer modelo de la familia entrenado desde cero que supera la clase mayoritaria en dicho benchmark, con 0.480 frente a 0.398, y juega los cuatro juegos al nivel del oráculo en la mayoría de métricas.

Su relevancia actual reside en la demostración de que un modelo de menos de 2M de parámetros, entrenado en menos de cuatro horas de cómputo efectivo en un Apple M5, puede resolver tareas de clasificación y decisión con calibración controlada (ECE 0.0479) y desplegarse en navegador o Node vía WASM. La licencia Apache 2.0 y la disponibilidad del código en Rust facilitan su reproducción y auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 2 bloques weight-shared en bucle (4 pases), atención softmax, d=144, 2 cabezas |
| Parametros totales | 1.486.225 (model card) / 609.153 (safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de estado + 160 tokens de pregunta |
| Tipos de cuantizacion | Ternaria (QAT), empaquetada en GGUF |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (s6-nano.gguf, 715 KB) |

## Arquitectura y entrenamiento

La arquitectura sigue el grafo de s3 a escala de lenguaje (tag `skycmd-s2` en GGUF): la pregunta y las opciones forman un stream estático que se codifica una vez y se cachea; el estado se tokeniza con un token por par `key value` para números y pasa por 2 bloques con pesos compartidos que se recorren dos veces, con una salida tras cada uno de los 4 pases totales. Las opciones nunca atienden entre sí. El vocabulario es de 2.048 tokens y los pesos son ternarios, entrenados con QAT. El código de s6 incorpora Parallax attention y Muon v2, pero la ablación pre-registrada no adoptó ninguna de estas variantes, por lo que el modelo final usa atención softmax y AdamW.

El entrenamiento se realizó desde cero en Rust (mlx-rs) sobre un Apple M5 en modo limitado: pretraining de lenguaje enmascarado en float (90 minutos, 53.360 pasos, 0.87B tokens, 588 tokens por parámetro), seguido de entrenamiento de decisión con QAT ternaria tras un warm-up float del 10 % (90 minutos, 19.893 pasos) y tres rondas de DAgger sobre los juegos (15 minutos cada una). Los datos incluyen conjuntos de decisiones tipadas de Hugging Face, datasets clásicos convertidos a preguntas tipadas, estados de juego etiquetados por oráculos exactos y un currículum numérico. El texto de pretraining proviene de SimpleStories, TinyStories, FineWeb y las partes no web de Dolma 3 y TxT360. Las etiquetas suaves de 747.077 preguntas de entrenamiento provienen de GLM-5.3-flash, conservadas solo cuando coinciden con la respuesta gold.

## Capacidades

- Clasificación y decisión tipada sobre estados en texto libre: responde preguntas de tipo `choice`, `score` y `noul` con probabilidades calibradas.
- Decisión en juegos: juega Flappy Drone, Rescue Run, Obstacle Dodge y un Doom-like al nivel del oráculo en la mayoría de métricas.
- Razonamiento de un solo paso: un forward pass por pregunta, sin cadena de pensamiento ni multi-step reasoning.
- Soporte de umbrales de salida temprana configurables en tiempo de ejecución (`setExitThreshold` en navegador), aunque por defecto opera a profundidad completa (umbrales a 1).
- Capacidades multilingües limitadas a inglés y francés.
- No soporta tool calling ni function calling de forma nativa; la interfaz es la petición JSON del motor skycmd.
- No dispone de visión, audio ni modo thinking.

## Casos de uso

- Decisión en sistemas embebidos y WASM: el modelo de 715 KB cabe en cualquier presupuesto de memoria y se ejecuta en Node o navegador con latencias de 0.44 ms por frame en Flappy, lo que permite integrarlo en bucles de decisión en tiempo real sin GPU.
- Clasificación de intenciones en asistentes de voz o chat: con 0.425 en MASSIVE intents en inglés y 0.239 en francés, puede usarse como primera etapa de enrutamiento en pipelines donde el coste por inferencia es crítico, aceptando que la precisión es modesta.
- Simulación y tutoriales de agentes: el entorno sky-arena y los cuatro juegos sirven como banco de pruebas reproducible para enseñar sistemas de decisión con veto de reglas codificadas, donde el modelo solo aconseja.
- Filtrado previo en pipelines de datos: dado su coste de inferencia en microsegundos, puede aplicarse como clasificador de descarte rápido antes de modelos mayores en tareas de etiquetado tipado.
- Investigación en calibración y QAT ternaria: el modelo publica ECE (0.0479) y resultados completos incluyendo fallos, lo que lo hace útil como referencia reproducible para estudiar calibración en modelos minúsculos.
- Docencia de arquitecturas eficientes: el código en Rust y la pre-registración permiten reproducir el entrenamiento completo en menos de cuatro horas de cómputo efectivo en hardware de consumo.

## Benchmarks y rendimiento

| Conjunto | s6-nano | Referencia |
|---|---:|---|
| `typed_decisions_bench` | 0.480 | clase mayoritaria 0.398; s3-pico 0.382; s4-micro 0.352; s5-lite 0.696 |
| MASSIVE intents, inglés | 0.425 | s3-pico 0.187 |
| MASSIVE intents, francés | 0.239 | s3-pico 0.117 |
| When2Call (test de una fuente entrenada) | 0.404 | s3-pico 0.368 |
| NOTAM subject / NOTAM multi (nunca entrenado) | 0.055 / 0.493 | s3-pico 0.163 / 0.319 |
| ECE sobre todas las fuentes | 0.0479 | umbral permitido 0.08 |

Bucle cerrado en sky-arena (30 episodios por juego, mismas semillas que s3-pico, profundidad completa):

| Juego | Resultado |
|---|---|
| Flappy Drone | 200 / 200 tuberías, 0 colisiones |
| Rescue Run | 100 % |
| Obstacle Dodge | 87 % (= oráculo), 23 vetos de reflejo |
| Doom-like | 100 % de niveles, tasa de kills 0.772 (= oráculo) |

Latencia: mediana de 1.488 µs por decisión en nativo sobre las fuentes de test; en WASM bajo Node, aproximadamente 15 ms en los estados JSON largos del bench y 0.44 ms por frame de Flappy (dos preguntas y el paso de física). WASM y nativo coinciden hasta 9.5e-7 en 200 preguntas del bench, con la misma respuesta en las 200.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para el archivo GGUF de 715 KB más buffers de activación; cabe en cualquier GPU, CPU o entorno WASM.
- GPU recomendadas: no requiere GPU; el entrenamiento se realizó en un Apple M5 y la inferencia funciona en CPU. Cualquier GPU consumer (RTX 4090, etc.) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en dispositivos sin GPU, incluidos navegadores y Node.
- Opciones de despliegue: exclusivamente el motor skycmd (`sky-serve`, `skycmd decide`, bindings de navegador, Node, Python, CLI y servidor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 1.488 µs por decisión en nativo; aproximadamente 15 ms en WASM para estados JSON largos y 0.44 ms por frame de Flappy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | `typed_decisions_bench` | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| s6-nano | 1.486.225 | 512 + 160 tokens | 0.480 | Apache 2.0 | GGUF en HF, código en GitHub |
| s5-lite | no disponible | no disponible | 0.696 | no disponible | no disponible |
| s3-pico | no disponible | no disponible | 0.382 | no disponible | no disponible |
| oscar-1-17m | 17M | no disponible | 0.6775 | no disponible | no disponible |

## Limitaciones y advertencias

- Generalista modesto: 0.480 en el bench supera la clase mayoritaria, pero modelos de 17M alcanzan aproximadamente 0.69 (s5-lite 0.696, oscar-1-17m 0.6775).
- No puede leer NOTAMs (0.055 en la pregunta de sujeto) y se queda en 0.404 en When2Call.
- La puntuación en MASSIVE inglés no es estrictamente zero-shot: 206 de las 2.000 utterances de test aparecen también en el split de entrenamiento, 201 de ellas en una fuente derivada de MASSIVE. Ninguna de las 1.000 francesas aparece.
- Una sola ejecución y una sola semilla. El hermano mayor s6-micro (5.6M) alcanzó 0.547 en el bench pero falló el guard ECE (0.0821) y no se publicó.
- Los juegos son escenarios de drones civiles y un shooter Doom-like con arte de Freedoom; el modelo solo aconseja y las reglas codificadas siempre mantienen veto. Es una demo y un tutorial, no software de vuelo.
- El modelo solo se ejecuta en el motor skycmd; no hay soporte documentado para runtimes estándar de GGUF como llama.cpp u Ollama.
- Idiomas limitados a inglés y francés; sin capacidades de tool calling, visión, audio ni razonamiento multi-paso.
- Licencia Apache 2.0 permite uso comercial, pero las licencias de los datos de entrenamiento se detallan en DATA_LICENSES.md y deben revisarse antes de un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/maxgfr/s6-nano
- Demo en Spaces: https://huggingface.co/spaces/maxgfr/s6-nano
- Código fuente: https://github.com/maxgfr/skycmd
- Pre-registración: https://github.com/maxgfr/skycmd/blob/main/docs/s6-gen-prereg.md
- Resultados completos (incluidos fallos): https://maxgfr.github.io/skycmd/results/
- Guía de instalación y bindings: https://maxgfr.github.io/skycmd/install/
- Licencias de datos: https://github.com/maxgfr/skycmd/blob/main/DATA_LICENSES.md
