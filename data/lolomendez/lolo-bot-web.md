# lolomendez/lolo-bot-web

## Resumen

Lolo bot (in-browser) es un modelo neuronal de ajedrez derivado de Maia-3, desarrollado por el usuario lolomendez y publicado en HuggingFace. No es un modelo de lenguaje: se trata de un predictor de movimientos de ajedrez que imita el estilo de juego de un jugador concreto ("Lolo"), empaquetado en formato ONNX para ejecutarse directamente en el navegador del visitante mediante onnxruntime-web. El repositorio contiene dos variantes cuantizadas a int8: una basada en Maia-3 79M (modelo de escritorio) y otra basada en Maia-3 23M (modelo móvil), ambas con los adaptadores LoRA del autor fusionados o conmutables.

La relevancia del proyecto es fundamentalmente practica: demuestra como un modelo de ajedrez de tipo Maia puede comprimirse a int8, exportarse a ONNX y desplegarse en inferencia cliente-side sin backend, manteniendo una huella de repositorio de aproximadamente 0,1 GB. El modelo recibe una representacion tokenizada del tablero (tensor de 64 posiciones x 97 caracteristicas), un Elo objetivo (2100) y una compuerta (`gate`) que alterna entre el estilo de Lolo y el modelo base Maia-3.

La informacion disponible es limitada: no hay model card extendida, ni datos de entrenamiento, ni benchmarks publicados, ni numero de descargas o likes (0 en el momento de la consulta). Todo lo que sigue se basa en el README del repositorio y en la naturaleza conocida de la familia Maia-3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para prediccion de movimientos de ajedrez basada en Maia-3 (transformer; detalles internos no disponibles) |
| Parametros totales | 79M (variante `lolo79`) y 23M (variante `lolo23`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija: tensor `tokens` [1, 64, 97]) |
| Tipos de cuantizacion | int8 (ONNX quantized) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`.onnx`), mas JSON auxiliares (`bot.json`, `book.json`, `golden.json`) |

## Arquitectura y entrenamiento

El modelo es una adaptacion de Maia-3, la familia de redes neuronales de ajedrez orientada a predecir movimientos humanos en funcion del nivel de Elo, desarrollada por el CSSLab (Universidad de Toronto). Sobre el modelo base se han aplicado adaptadores LoRA entrenados para capturar el estilo del jugador "Lolo". En la variante de 79M los adaptadores estan fusionados en los pesos; en la de 23M son conmutables mediante la entrada `gate` (1 = movimientos de Lolo, 0 = Maia-3 base, que se usa para las funciones de tiempo de pensamiento y rendicion).

La interfaz de inferencia esta definida de forma explicita: entrada `tokens` float32 de forma [1, 64, 97] (representacion del tablero), `elo` int64 [1] fijado a 2100 y `gate` float32 [1]; salidas `move` [1, 4352] con logits sobre el vocabulario de movimientos y `value` [1, 3] con logits [derrota, tablas, victoria] para el bando al que le toca mover. El repositorio incluye ademas un libro de aperturas (`book.json`), reglas de tablas y modelos auxiliares de tiempo de pensamiento y rendicion descritos en `bot.json`, y `golden.json` con salidas de referencia para tests. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el proceso de ajuste (RLHF/DPO no aplica en este dominio).

## Capacidades

- Prediccion del siguiente movimiento de ajedrez en forma de logits sobre un vocabulario de 4352 movimientos.
- Estimacion del resultado de la partida mediante la cabeza de valor de 3 clases (derrota, tablas, victoria) para el bando que mueve.
- Imitacion de estilo de juego personalizado mediante adaptadores LoRA (variante `lolo79` fusionada, `lolo23` conmutables por `gate`).
- Juego calibrado a un Elo objetivo de 2100 (entrada `elo`).
- Libro de aperturas propio incluido en `book.json`.
- Modelos auxiliares de tiempo de pensamiento y rendicion descritos en `bot.json`.
- Inferencia en navegador mediante onnxruntime-web, sin backend.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un modelo especializado exclusivamente en ajedrez.

## Casos de uso

- Bot de ajedrez embebido en una web: el modelo se carga como ONNX en el navegador del visitante y ejecuta la inferencia con onnxruntime-web, eliminando la necesidad de servidor y reduciendo costes de infraestructura.
- Entrenamiento de jugadores contra un estilo concreto: al fijar el Elo en 2100 y activar `gate=1`, el usuario practica contra el repertorio y las decisiones tipicas de Lolo, util para preparacion de partidas.
- Analisis de estilo y comparacion de repertorios: alternando `gate` entre 0 y 1 se comparan las politicas del modelo base Maia-3 y del adaptador de Lolo sobre la misma posicion.
- Aplicaciones educativas de ajedrez: la cabeza de valor permite mostrar evaluaciones (victoria/tablas/derrota) coherentes con el nivel del jugador modelado, no con el de un motor fuerte.
- Demostracion tecnica de despliegue ONNX int8 en cliente: el repositorio sirve como referencia para comprimir y servir modelos de ajedrez en produccion web con un tamano de repo de ~0,1 GB.
- Integracion en plataformas de puzzles o partidas rapidas: la variante de 23M, con adaptadores conmutables y menor coste, es adecuada para dispositivos moviles donde el modelo de 79M resulta pesado.
- Tests de regresion en pipelines de CI: `golden.json` permite verificar que las exportaciones ONNX producen las salidas esperadas tras cambios en el proceso de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de Elo estimado, precision de prediccion de movimientos ni comparaciones con Maia-3 original en el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano, la variante de 79M en int8 ocupa del orden de decenas de MB y la de 23M aun menos, aunque esta cifra no esta confirmada en la documentacion.
- GPU recomendadas: no aplica en el caso de uso principal, que es inferencia en navegador via onnxruntime-web (CPU/WASM o WebGPU del cliente).
- Cabe en GPU consumer: si, con margen amplio, dado el tamano de los modelos (79M y 23M parametros en int8).
- Opciones de despliegue: onnxruntime-web (navegador), ONNX Runtime nativo, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lolo79 / lolo23 (este) | 79M / 23M | tablero [1, 64, 97] | AGPL-3.0 | ONNX int8 | Adaptadores LoRA de estilo, inferencia en navegador |
| Maia-3 (base) | 23M y 79M (segun variante) | tablero tokenizado | AGPL-3.0 | no disponible | Modelo base del que deriva; sin adaptadores de estilo |
| Maia-2 | no disponible | tablero | AGPL-3.0 | no disponible | Generacion anterior de la familia Maia |
| Leela Chess Zero (redes pequenas) | variable | tablero | GPL-3.0 | varios | Motor de ajedrez de proposito general, no modela estilo humano |

Los datos de Maia-2 y Leela Chess Zero no provienen de la informacion proporcionada y se incluyen solo como referencia de categoria; sus cifras concretas no estan verificadas en este contexto.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ajedrez: no procesa lenguaje natural ni admite otras tareas.
- No hay informacion publicada sobre sesgos, calidad del ajuste LoRA ni fidelidad del estilo imitado.
- Riesgo de movimientos ilegales o de baja calidad fuera de la distribucion de posiciones vista en entrenamiento; el README no documenta filtrado de legalidad.
- El Elo de entrada esta fijado a 2100 en los ejemplos; no se documenta el rango valido.
- Ausencia total de benchmarks: no es posible evaluar su fuerza ni su parecido con el jugador real a partir de los datos del repositorio.
- Licencia AGPL-3.0: el uso en servicios en red obliga a liberar el codigo fuente correspondiente; revisar implicaciones antes de un despliegue comercial.
- Repositorio sin descargas ni likes y creado recientemente (2026-10-27): no hay evidencia de uso en produccion ni de mantenimiento.
- Dependencia de la licencia AGPL-3.0 del proyecto Maia-3 original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lolomendez/lolo-bot-web
- Proyecto Maia-3 (base): https://github.com/CSSLab/maia3
