# maxgfr/s6-micro

## Resumen

s6-micro es un modelo de decisión de tipo "system-one" desarrollado por maxgfr dentro del proyecto skycmd, una iniciativa en Rust que entrena modelos pequeños para tomar decisiones rápidas en juegos y en preguntas tipadas en texto libre. Con 2.214.913 parámetros según safetensors (5.587.201 según la model card, discrepancia que el autor no explica), es el hermano mayor de s6-nano y responde a preguntas de tipo `choice`, `score` y `noul` con probabilidades calibradas en validación, en un único forward pass por pregunta.

Resuelve un problema muy concreto: sustituir a un oráculo en cuatro juegos del ecosistema skycmd (Flappy Drone, Rescue Run, Obstacle Dodge y un Doom-like) y clasificar intenciones y preguntas tipadas en inglés y francés. Su relevancia no está en el rendimiento bruto, sino en el método: gates de publicación fijados antes del entrenamiento, pesos ternarios con QAT, un único archivo GGUF de 2,4 MB y ejecución tanto nativa como en WASM.

La arquitectura es un transformer de atención softmax con pesos compartidos, dimensión 256, 4 cabezas, vocabulario de 4.096 y ventanas de 384 tokens de estado y 128 de pregunta. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques de pesos compartidos (tag GGUF `skycmd-s2`), atención softmax, pesos ternarios entrenados con QAT |
| Parametros totales | 2.214.913 (safetensors) / 5.587.201 (model card; discrepancia no aclarada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens de estado + 128 tokens de pregunta (ventanas fijas) |
| Tipos de cuantizacion | Ternario (GGUF) |
| Idiomas soportados | Inglés, francés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2,4 MB) |

## Arquitectura y entrenamiento

El modelo sigue la forma de s4-micro: la pregunta y las opciones forman un flujo estático que se codifica una vez y se cachea, mientras que el estado pasa por 2 bloques con pesos compartidos que se recorren tres veces (6 pasadas en total), con salidas tempranas tras 2, 4 y 6 pasadas. Las opciones nunca atienden entre sí. La dimensión es 256, con 4 cabezas y vocabulario de 4.096. Los pesos son ternarios y se entrenaron con quantisation-aware training (QAT). La ablación pre-registrada descartó todas las incorporaciones de s6 (Parallax, Muon v2, XSA y otras), de modo que el modelo final usa atención softmax y AdamW.

El entrenamiento se hizo con DAgger sobre estados generados por el oráculo, con minutos de entrenamiento de decisión duplicados respecto a la v1 y reinicio desde checkpoint tras un fallo técnico. La evaluación se realizó con umbrales de salida fijados a 1 (profundidad completa, τ = 1) en el GGUF, conforme a la enmienda 13 de la pre-registración. Se aplicó control de riesgo conformal (α = 0,02) para elegir umbrales de salida temprana, pero se rechazaron porque añadían un veto extra en Obstacle Dodge (21 frente a 20), y la regla pre-registrada no permite ninguno.

## Capacidades

- Clasificación de intenciones en texto libre (tipos `choice`, `score`, `noul`) con probabilidades calibradas.
- Toma de decisiones en cuatro juegos del ecosistema skycmd: Flappy Drone, Rescue Run, Obstacle Dodge y un Doom-like.
- Lectura de estados en formato de texto o JSON y respuesta en un único forward pass por pregunta.
- Ejecución nativa y en WebAssembly (WASM bajo Node), con paridad numérica entre ambas (diferencia de 8,9e-7 y las mismas respuestas en las 200 preguntas de prueba).
- Capacidad multilingüe limitada a inglés y francés.
- Umbrales de salida ajustables en tiempo de ejecución (`setExitThreshold` en el navegador).
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Decisión en tiempo real dentro de videojuegos: el modelo lee el estado del juego como texto y emite una acción en un único forward pass, lo que permite integrarlo en bucles de juego con presupuesto de cómputo muy ajustado (mediana de 8.970 µs por decisión en nativo).
- Sustitución de un oráculo en prototipos de gameplay: al alcanzar el nivel del oráculo en Rescue Run (100 %), Obstacle Dodge (87 %) y Doom-like (100 % de niveles), sirve para validar mecánicas sin depender de un agente de referencia pesado.
- Clasificación de intenciones en asistentes conversacionales: obtiene 0,531 en MASSIVE intents en inglés y 0,314 en francés, útil para enrutado de bajo coste en un pipeline previo a un LLM mayor.
- Detección de cuándo invocar una herramienta: con 0,401 en When2Call, puede actuar como filtro barato que decide si merece la pena llamar a un modelo o API externa.
- Despliegue en el navegador o en el borde: el GGUF de 2,4 MB y la paridad WASM/nativo permiten ejecutar el modelo en cliente sin backend, por ejemplo en demos interactivas o extensiones.
- Filtrado previo en pipelines de clasificación documental: para dominios con formato fijo y bien definido, el modelo puede descartar o etiquetar casos antes de un clasificador mayor, siempre que el dominio esté representado en el entrenamiento.
- Investigación en calibración y modelos ternarios: el proyecto publica gates, enmiendas y resultados fallidos, lo que lo convierte en un banco de pruebas reproducible para estudiar ECE y control de riesgo conformal en modelos minúsculos.

## Benchmarks y rendimiento

Resultados sobre conjuntos de test, con un máximo de 2.000 preguntas por fuente, GGUF ternario de la última ronda de DAgger y profundidad completa (τ = 1):

| Conjunto | s6-micro | s6-micro-v1 | s6-nano | Referencia |
|---|---:|---:|---:|---|
| `typed_decisions_bench` | 0,553 | 0,547 | 0,480 | clase mayoritaria 0,398; respuesta de entrenamiento más común 0,4815; s3-pico 0,382; s4-micro 0,352; s5-lite 0,696 |
| MASSIVE intents, inglés | 0,531 | 0,518 | 0,425 | s3-pico 0,187 |
| MASSIVE intents, francés | 0,314 | 0,275 | 0,239 | s3-pico 0,117 |
| When2Call (test de una fuente entrenada) | 0,401 | 0,430 | 0,404 | s3-pico 0,368; respuesta de entrenamiento más común 0,359 |
| NOTAM subject (nunca entrenado) | 0,092 | 0,052 | 0,055 | s3-pico 0,163 |
| NOTAM multi (nunca entrenado) | 0,353 | 0,394 | 0,493 | s3-pico 0,319 |
| Todas las fuentes | 0,380 | 0,378 | 0,360 | no disponible |
| ECE agregado | 0,0588 | 0,0821 | 0,0479 | el gate permite 0,08 |

ECE por fuente: bench 0,0498; MASSIVE en 0,0715; MASSIVE fr 0,0300; When2Call 0,2165; NOTAM subject 0,0185; NOTAM multi 0,1409. El intervalo bootstrap del 95 % para el ECE agregado es [0,0526, 0,0687] (v1: [0,0746, 0,0900]). En When2Call el modelo está sobreconfiado: confianza media 0,612 frente a una precisión de 0,401, y responde `request_for_info` a 1.405 de los 2.000 ítems cuando `tool_call` es la respuesta correcta en 696. En distribución, Banking77 intents alcanza 0,763.

Bucle cerrado en `sky-arena` (30 episodios por juego, mismas semillas que s3-pico, profundidad completa):

| Juego | Resultado |
|---|---|
| Flappy Drone | 200 / 200 tuberías, 0 colisiones |
| Rescue Run | 100 % |
| Obstacle Dodge | 87 % (= oráculo), 20 vetos de reflejo |
| Doom-like | 100 % de niveles, tasa de bajas 0,77 (= oráculo), 2 vetos |

Latencia: mediana de 8.970 µs por decisión en nativo sobre las fuentes de test; en WASM bajo Node, mediana de 61 ms sobre los estados JSON largos de 200 preguntas del bench. Las mediciones se tomaron con la máquina cargada por otros procesos, por lo que el autor advierte que no son comparables con las de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos en ternario; el cuello de botella es el estado de activación, no el modelo.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cualquier GPU consumer (incluso integradas) es suficiente.
- Cabe en cualquier GPU consumer y en dispositivos de borde; también en el navegador vía WASM.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF; ejecución nativa en Rust (repositorio skycmd) y WASM bajo Node o navegador.
- Latencia y throughput: mediana de 8.970 µs por decisión en nativo y 61 ms en WASM bajo Node sobre estados JSON largos, medidas en una máquina cargada; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | `typed_decisions_bench` | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| s6-micro | 2,2 M (safetensors) / 5,6 M (model card) | 384 + 128 tokens | 0,553 | Apache 2.0 | Hugging Face (GGUF) |
| s6-nano | no disponible | no disponible | 0,480 | no disponible | Hugging Face |
| s5-lite | ~17 M | no disponible | 0,696 | no disponible | no disponible |
| oscar-1-17m | ~17 M | no disponible | 0,6775 | no disponible | no disponible |
| s3-pico | no disponible | no disponible | 0,382 | no disponible | no disponible |

## Limitaciones y advertencias

- Segunda lectura del test: la v1 falló el guard de ECE y esta versión se diseñó después de leer ese resultado sobre los mismos registros de test, por lo que su aprobación no equivale a una primera lectura independiente.
- Generalista modesto: 0,553 en el bench frente a unos 0,69 de modelos de 17 M (s5-lite 0,696, oscar-1-17m 0,6775).
- Colapso de respuesta: en 11 de las 20 tareas del bench responde una constante a al menos el 95 % de los ítems.
- Incapacidad para leer NOTAM: 0,092 en la pregunta de sujeto, por debajo de la referencia s3-pico (0,163).
- Sobreconfianza en When2Call: confianza media 0,612 con precisión 0,401, con sesgo fuerte hacia `request_for_info`.
- Contexto muy corto (384 + 128 tokens) e idiomas limitados a inglés y francés.
- Sin soporte de tool calling, agentes multi-paso, visión ni audio.
- Discrepancia no documentada entre el recuento de parámetros de safetensors (2.214.913) y el de la model card (5.587.201).
- Entrenamiento reiniciado desde checkpoint tras un fallo técnico, y las últimas rondas de DAgger y la evaluación se ejecutaron en una máquina cargada.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento en dominios fuera del entrenamiento es bajo y debe validarse antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-micro
- Versión anterior fallida: https://huggingface.co/maxgfr/s6-micro-v1
- Modelo hermano: https://huggingface.co/maxgfr/s6-nano
- Demo: https://huggingface.co/spaces/maxgfr/s6-micro
- Código (Rust): https://github.com/maxgfr/skycmd
- Pre-registro: https://github.com/maxgfr/skycmd/blob/main/docs/s6-gen-prereg.md
- Página de resultados: https://maxgfr.github.io/skycmd/results/
