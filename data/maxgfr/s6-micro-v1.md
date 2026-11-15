# maxgfr/s6-micro-v1

## Resumen

s6-micro-v1 es un modelo de clasificación de texto de tipo "decisión" (decision model) desarrollado por maxgfr, diseñado para responder preguntas tipadas (`choice`, `score`, `noul`) sobre estados de juego y texto libre, emitiendo probabilidades en un único forward pass por pregunta. Se distribuye como GGUF ternario de 2,4 MB y forma parte de la familia skycmd, siendo el hermano mayor de s6-nano. Su arquitectura es un transformer compacto con pesos ternarios entrenados mediante QAT, atención softmax y AdamW, con 256 dimensiones, 4 cabezas y vocabulario de 4.096 tokens.

El dato más relevante para cualquier evaluador es que el modelo **falló su puerta de pre-registro**: alcanzó 0,547 en `typed_decisions_bench` (objetivo ≥ 0,45) y juega todos los juegos al nivel de s3-pico, pero su ECE a profundidad completa es 0,0821 frente al límite de 0,08. El autor lo publica como resultado negativo verificable, no como modelo para uso productivo. La calibración es deficiente de forma desigual entre fuentes: subconfianza en el bench (confianza media 0,4815 frente a precisión 0,5470) y sobreconfianza en When2Call (0,5372 frente a 0,4305).

Con 5.587.201 parámetros según la model card (aunque el dato de safetensors indica 2.214.913, discrepancia no aclarada) y 2.420.032 bytes en disco, el modelo es relevante como caso de estudio de calibración en modelos ternarios pequeños y de publicación de resultados fallidos, no como componente de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bloques de pesos compartidos, salidas tempranas tras 2, 4 y 6 pasadas de bloque; atención softmax; pesos ternarios con QAT |
| Parámetros totales | 5.587.201 según model card; 2.214.913 según safetensors (discrepancia no aclarada) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 384 tokens de estado y 128 tokens de pregunta |
| Tipos de cuantización | ternario (GGUF) |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2.420.032 bytes); etiqueta `skycmd-s2` |
| Dimensión del modelo (d) | 256 |
| Cabezas de atención | 4 |
| Vocabulario | 4.096 |
| Profundidad de inferencia | 6 pasadas de bloque (profundidad completa); umbrales de salida a 1 en el GGUF |

## Arquitectura y entrenamiento

El modelo sigue la forma `s4-micro` (etiqueta GGUF `skycmd-s2`): la pregunta y sus opciones forman un flujo estático que se codifica una vez y se cachea, mientras el estado atraviesa bloques con pesos compartidos y salidas tempranas tras 2, 4 y 6 pasadas. Las opciones nunca atienden entre sí. Los pesos son ternarios, entrenados con quantisation-aware training (QAT). La ablación pre-registrada no adoptó ninguna de las incorporaciones de s6 (Parallax, Muon v2, XSA y otras), por lo que el modelo usa atención softmax y AdamW convencionales.

El entrenamiento empleó DAgger en su última ronda, y los pesos publicados corresponden byte a byte al fichero evaluado. Los conjuntos de test se limitan a 2.000 preguntas por fuente. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset más allá de las fuentes de evaluación (typed decisions, MASSIVE intents, When2Call, NOTAM). Los umbrales de salida conformales existen pero no se publican; a esos umbrales el modelo promedia 4,59 pasadas de bloque en lugar de 6, con salida temprana en el 36,0 % de las preguntas.

## Capacidades

- Clasificación de decisiones tipadas en texto libre: responde preguntas de tipo `choice`, `score` y `noul` con probabilidades, un forward pass por pregunta.
- Juego cerrado en cuatro entornos: Flappy, Rescue, Dodge y Doom-like, mediante el bucle `sky-arena`.
- Procesamiento bilingüe inglés-francés.
- Inferencia nativa en Rust y en el navegador vía WASM (con la salvedad de latencia indicada más abajo).
- Ajuste de umbral de salida en tiempo de ejecución (`setExitThreshold`).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Estudio de calibración en modelos ternarios: sirve como caso documentado de ECE superior al umbral en un modelo de decisión, útil para investigar técnicas de calibración post-hoc sobre pesos ternarios.
- Reproducción de resultados negativos: el fichero y el código permiten verificar el fallo de la puerta de calibración (ECE 0,0821 frente a 0,08) de forma independiente.
- Investigación de salidas tempranas: los umbrales conformales y la estructura de 2/4/6 pasadas permiten estudiar el compromiso entre coste computacional y precisión en modelos de decisión.
- Benchmarking de modelos de decisión en juegos: el bucle `sky-arena` con 30 episodios por juego y semillas fijas facilita comparaciones reproducibles entre variantes de la familia skycmd.
- Docencia sobre QAT y pesos ternarios: el tamaño reducido (2,4 MB) y la arquitectura simple lo hacen manejable para demostraciones de cuantización ternaria extrema.
- Evaluación de robustez ante dominios no entrenados: los resultados en NOTAM (0,052 en subject, 0,394 en multi) documentan el comportamiento fuera de distribución.
- No se recomienda su uso en producción, atención al cliente, generación de código ni ninguna tarea generativa.

## Benchmarks y rendimiento

Conjuntos de test de hasta 2.000 preguntas por fuente, GGUF ternario de la última ronda de DAgger, profundidad completa (τ = 1):

| Conjunto | s6-micro | s6-nano (aprobó) | Referencia |
|---|---:|---:|---|
| `typed_decisions_bench` | 0,547 | 0,480 | clase mayoritaria 0,398; s3-pico 0,382; s4-micro 0,352; s5-lite 0,696 |
| MASSIVE intents, inglés | 0,518 | 0,425 | s3-pico 0,187 |
| MASSIVE intents, francés | 0,275 | 0,239 | s3-pico 0,117 |
| When2Call (test de fuente entrenada) | 0,430 | 0,404 | s3-pico 0,368 |
| NOTAM subject / NOTAM multi (nunca entrenado) | 0,052 / 0,394 | 0,055 / 0,493 | s3-pico 0,163 / 0,319 |
| Todas las fuentes | 0,378 | 0,360 | — |
| ECE sobre todas las fuentes | 0,0821 | 0,0479 | límite de la puerta: 0,08 |

ECE por fuente: bench 0,0660; MASSIVE en 0,1334; MASSIVE fr 0,0313; When2Call 0,1176; NOTAM subject 0,0636; NOTAM multi 0,2558. Intervalo bootstrap del 95 % del ECE agrupado: [0,0746, 0,0900]; la puerta se lee sobre el valor puntual, según el pre-registro. A umbrales conformales (no publicados): 0,544 en el bench, ECE 0,0804, salida temprana en el 36,0 % de las preguntas.

Bucle cerrado (`sky-arena`, 30 episodios por juego, mismas semillas que s3-pico, profundidad completa): Flappy 200,00; Rescue 3,00; Dodge 9,47; Doom-like 3,27 de puntuación media, idénticas a s3-pico y s6-nano.

Latencia: mediana de 7.346 µs por decisión en nativo sobre las fuentes de test a profundidad completa (s6-nano: 1.488 µs). La latencia WASM de este fichero a profundidad completa no se midió.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el fichero GGUF ocupa 2.420.032 bytes (2,4 MB).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (RTX 4090, RTX 3060, integradas) es sobradamente suficiente.
- Cabe en cualquier GPU consumer y en dispositivos de borde; también en el navegador vía WASM.
- Opciones de despliegue: inferencia nativa en Rust (código en github.com/maxgfr/skycmd); WASM en navegador; el formato GGUF es compatible con llama.cpp en principio, aunque el modelo no es un transformer generativo estándar y su pipeline es text-classification, por lo que la compatibilidad con runners genéricos no está garantizada en la información disponible.
- Latencia: mediana de 7.346 µs por decisión en nativo a profundidad completa; con salidas tempranas a umbrales conformales, 4,59 pasadas de bloque de media (36,0 % de salida temprana), lo que reduce el coste.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bench (`typed_decisions_bench`) | ECE | Licencia | Estado |
|---|---:|---|---:|---:|---|---|
| s6-micro-v1 | 5.587.201 (card) / 2.214.913 (safetensors) | 384 + 128 tokens | 0,547 | 0,0821 | Apache 2.0 | Falló la puerta |
| s6-nano | no disponible | no disponible | 0,480 | 0,0479 | Apache 2.0 (presumible) | Aprobó la puerta |
| s3-pico | no disponible | no disponible | 0,382 | no disponible | no disponible | Referencia base |
| s5-lite | no disponible | no disponible | 0,696 | no disponible | no disponible | Referencia superior en bench |

s6-nano es la alternativa recomendada por el propio autor al haber superado la misma puerta de calibración. s5-lite obtiene mejor precisión en el bench pero no se dispone de sus datos de calibración ni de arquitectura en la información proporcionada.

## Limitaciones y advertencias

- **Falló su puerta de pre-registro**: ECE de 0,0821 frente al límite de 0,08. El autor lo marca explícitamente como "no recomendado para uso".
- Las probabilidades no son fiables como confianzas y varían según la fuente: subconfianza en el bench (0,4815 de confianza media frente a 0,5470 de precisión) y sobreconfianza en When2Call (0,5372 frente a 0,4305).
- El ECE de NOTAM multi es 0,2558; en una declaración NOTAM falsa para el 99,5 % de sus 412 ítems, el modelo responde "verdadero" en casi todos los casos.
- Incapacidad para leer NOTAM: 0,052 en la pregunta de subject.
- En los juegos no supera a s3-pico ni a s6-nano; iguala sus puntuaciones.
- Latencia 4,9 veces superior a s6-nano (7.346 µs frente a 1.488 µs) con un fichero 3,4 veces mayor.
- Solo inglés y francés; sin capacidades generativas, de código, matemáticas, visión ni tool calling.
- Discrepancia no aclarada entre el recuento de parámetros de la model card (5.587.201) y el de safetensors (2.214.913).
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja el uso del modelo.
- La latencia WASM a profundidad completa no está medida; la línea WASM de los resultados se obtuvo con salidas tempranas y no describe este fichero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-micro-v1
- Demo (Space): https://huggingface.co/spaces/maxgfr/s6-micro-v1
- Código (Rust): https://github.com/maxgfr/skycmd
- Pre-registro: https://github.com/maxgfr/skycmd/blob/main/docs/s6-gen-prereg.md
- Resultados completos: https://maxgfr.github.io/skycmd/results/
- Bench (sección skycmd-s6): https://github.com/maxgfr/skycmd/blob/main/BENCH.md#skycmd-s6-s6-nano-s6-micro-general-purpose-decisions-and-games-pre-registered
- Modelo hermano s6-nano: https://huggingface.co/maxgfr/s6-nano
