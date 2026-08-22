# burrowdweller/mini-chessformer-v1

## Resumen

`mini-chessformer-v1` es un modelo transformer de ajedrez de 7,57 millones de parámetros, desarrollado por `burrowdweller` (Jun Ling). Se trata de un motor de evaluación y política de jugadas diseñado para integrarse en pipelines de búsqueda Monte Carlo Tree Search (MCTS), con la particularidad de admitir un parámetro de "contempt" (tendencia a evitar tablas) que modula la valoración de la partida. El modelo se entrena desde cero con datos de partidas de Lichess (enero-marzo de 2026) y se distribuye en formato ONNX, lo que permite su ejecución ligera en CPU, GPU e incluso navegador.

La relevancia de este modelo radica en su eficiencia: logra un rendimiento comparable al del modelo `minichess-gpt-v1-final` con la mitad de FLOPs de entrenamiento (4,665e17 frente a 9,33e17). Su arquitectura incorpora una innovación llamada Geometric Attention Bias (GAB) y un condicionamiento de contempt vía FiLM sobre el token CLS, que le permite ajustar el comportamiento de tablas sin reentrenar. Es un modelo de propósito específico, no un LLM, y su salida son logits de política (4272 movimientos) y valor WDL (win/draw/loss).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Chessformer-lite) con 6 capas, 8 cabezas, d_model=256, d_ff=384, GAB (templates+coeficientes) |
| Parámetros totales | 7.566.471 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 65 tokens fijos (1 CLS + 64 casillas) |
| Tipos de cuantización | No disponible (solo se publica ONNX en fp32, sin cuantización explícita) |
| Idiomas soportados | No aplica (ajedrez, sin lenguaje natural; etiqueta "en" en la tarjeta) |
| Licencia | No disponible |
| Formato de pesos | ONNX (opset 17, batch dinámico) y checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder con 6 bloques pre-norm. La entrada se compone de 64 tokens correspondientes a las casillas del tablero, cada uno con un embedding de tipo de pieza (12 piezas + vacío) y una posición aprendida, más un token CLS que recibe una proyección del estado global (turno, enroques, captura al paso, etc.) y un embedding de contempt. La innovación principal es el GAB (Geometric Attention Bias): en cada capa se generan sesgos de atención a partir de características geométricas de las casillas mediante un mecanismo tipo Smolgen de plantillas y coeficientes, que se añaden a los logits de atención.

La política se factoriza en un producto from–to: 64×64 = 4096 movimientos posibles más 176 ranuras de promoción, dando un espacio de 4272 logits. La valoración es una cabeza WDL de 3 clases (victoria, tablas, derrota) desde la perspectiva del jugador que mueve, condicionada por el valor de contempt mediante FiLM (`gamma * cls + beta`). El entrenamiento usó un dataset de partidas Lichess (enero-marzo 2026) en formato parquet, con streaming multi-época, 617.523 pasos, batch 256, secuencia de 65 tokens, warmup del 10%, LR 3e-4 con decaimiento coseno y weight decay 0.01. La pérdida final fue de ~1.98 (política 1.17, valor 0.81).

## Capacidades

- Evaluación de posiciones de ajedrez: genera una distribución de probabilidad sobre los 4272 movimientos legales (política) y una valoración WDL (win/draw/loss) desde la perspectiva del jugador que mueve.
- Condicionamiento de contempt: el parámetro `contempt` (escalar) modifica la valoración del modelo para reducir o aumentar la tendencia a tablas. Se ha validado que al pasar de 0 a 0.5, la proporción de tablas disminuye y la de partidas decisivas aumenta.
- Integración con MCTS: la salida de política se puede usar como prior para guiar la búsqueda, y la valoración como red de valor.
- Inferencia ONNX con batch dinámico: soporta evaluación de múltiples tableros en una sola llamada (N×4272 y N×3).
- Ejecución en navegador: se incluye un paquete de demostración (`browser/`) con un manifiesto y un script de entrada que integra chess.js + MCTS + el modelo ONNX, permitiendo ejecutar el motor en un navegador sin servidor.
- No es un modelo de lenguaje: no tiene generación de texto, tool calling, razonamiento conversacional ni capacidades multimodales.

## Casos de uso

- Motor de ajedrez personalizado: integrar `mini-chessformer-v1` como red de política/valor en un motor MCTS propio. Su tamaño reducido (30 MB ONNX) permite ejecutarlo en hardware modesto, incluso en un portátil con CPU.
- Análisis de partidas para entrenamiento: usar la salida de política para identificar movimientos sugeridos y la valoración WDL para evaluar posiciones en partidas propias o de alumnos.
- Herramienta de enseñanza de ajedrez: construir un entrenador que muestre la mejor jugada según el modelo y explique el cambio de valoración, ayudando a entender conceptos de táctica y estrategia.
- Investigación en eficiencia de modelos: el modelo es un ejemplo de cómo un transformer pequeño con GAB puede igualar a un modelo más grande con la mitad de FLOPs de entrenamiento, útil para estudios de scaling laws y diseño de arquitecturas compactas.
- Componente de evaluación en pipelines de búsqueda: se puede combinar con otras técnicas (como búsqueda de Monte Carlo con aperturas o finales de tabla) para mejorar la fuerza de un motor completo.
- Demo en el navegador: el paquete `browser/` permite desplegar una arena de ajedrez en un sitio web sin infraestructura de servidor, útil para proyectos educativos o de divulgación.

## Benchmarks y rendimiento

El modelo se evaluó contra el modelo base `minichess-gpt-v1-final` (también de burrowdweller) en partidas con MCTS igualado (contempt=0, búsqueda sin contempt). Los resultados se resumen en la tabla siguiente:

| Métrica | Valor | Umbral | Resultado |
|---|---|---|---|
| Puntuación de partida contra v1-final | 0.700 (W11/D6/L3) | ≥0.40 | ✅ |
| CPL medio en holdout MCTS | 306.7 | 382.0 (parent+25) | ✅ (menor es mejor) |
| FLOPs de entrenamiento | 4.665e17 | 4.665e17 (0.50×v1) | ✅ |
| Tiempo de entrenamiento (RTX 4070) | 9.80 h | 10.5 h | ✅ |
| Desplazamiento por contempt (c=0→0.5) | Δdraw=−0.10, Δdecisive=+0.10 | ε=0.05 | ✅ |

Además, se verificó la paridad ONNX vs PyTorch con errores máximos de 1.18e-5 en la política y 2.86e-6 en el valor para c=0.0, y 1.26e-5 / 2.44e-6 para c=0.5, ambos por debajo de 1e-3.

## Requisitos de hardware

- El modelo ONNX ocupa 30.4 MB; se puede ejecutar en CPU con ONNX Runtime (Python) y en GPU con la misma librería. No se especifica VRAM mínima, pero dado el tamaño, caben en cualquier GPU moderna (incluso integradas) y en CPU sin problemas.
- Para entrenamiento se usó una RTX 4070 (tiempo total 9.8 h). La inferencia es mucho más ligera: una sola evaluación de posición es de orden milisegundos en CPU y submilisegundos en GPU.
- Opciones de despliegue: ONNX Runtime (Python, `inference.py`), integración con MCTS propio, y ejecución en navegador mediante el paquete `browser/` (que incluye el modelo ONNX).
- Latencia y throughput no publicados. Dado el tamaño, se puede estimar decenas de miles de evaluaciones por segundo en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| `mini-chessformer-v1` (este) | 7.57M | 65 tokens | Score 0.70 vs v1-final, CPL 306.7 | No disponible | ONNX |
| `minichess-gpt-v1-final` | No especificado | No especificado | Modelo base, CPL 382.0 (parent+25) | No disponible | ONNX |

No se dispone de otros modelos comparables en la misma categoría (motores de ajedrez con arquitectura transformer y condicionamiento de contempt) en la información proporcionada. La comparación directa se limita al modelo padre, que es el punto de referencia de diseño.

## Limitaciones y advertencias

- La muestra de partidas de evaluación es de solo 20 juegos (W11/D6/L3), lo que da un intervalo de confianza amplio; el resultado es direccional pero no estadísticamente contundente.
- La licencia no está especificada, lo que impide saber si se permite uso comercial. Se recomienda contactar al autor antes de usar en productos comerciales.
- No se ha realizado cuantización; el modelo se distribuye en fp32, lo que puede aumentar la huella de memoria en despliegues muy restringidos.
- El condicionamiento de contempt se aplica al token CLS y puede tener efectos secundarios en la política (la tarjeta menciona "contempt on the CLS token leaks into poli..." sin completar). No está documentado si se puede desactivar por completo.
- El modelo solo está entrenado con datos de Lichess de enero-marzo de 2026; su rendimiento en otros tipos de partidas (por ejemplo, con aperturas no estándar) podría degradarse.
- No es un modelo de lenguaje; no tiene capacidades de explicación o conversación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/burrowdweller/mini-chessformer-v1)
- [Modelo base `minichess-gpt-v1-final`](https://huggingface.co/burrowdweller/minichess-gpt-v1-final)
- [Perfil de burrowdweller (Jun Ling)](https://huggingface.co/burrowdweller)
- [Discusiones del modelo](https://huggingface.co/burrowdweller/mini-chessformer-v1/discussions)
- [Búsqueda de modelos con contempt-conditioning](https://huggingface.co/models?other=contempt-conditioning)
