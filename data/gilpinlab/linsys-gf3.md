# GilpinLab/linsys-gf3

## Resumen

linsys-gf3 es un transformer con bucles (*looped transformer*) de aproximadamente 0,4 millones de parámetros entrenado por GilpinLab para una única tarea matemática: resolver sistemas lineales cuadrados y de rango completo `A x = b` sobre el cuerpo finito GF(3) con 8 incógnitas. No es un modelo de lenguaje ni un modelo generativo de propósito general; es un artefacto de investigación sobre computación iterativa, en el que un solo bloque transformer (d_model 256, 8 cabezas, ratio MLP 1) se aplica repetidamente hasta que la respuesta se estabiliza.

La relevancia del modelo es conceptual: al arrancar desde ruido aleatorio en las 8 ranuras de respuesta, la red define un mapa desde el estado latente inicial hasta la solución, lo que permite estudiar cuencas de atracción, tiempos de asentamiento y dinámica de punto fijo en redes recurrentes de profundidad efectiva variable. El autor documenta que el tiempo de asentamiento de la respuesta (la última iteración en la que la respuesta decodificada cambia) presenta estructura fractal en instancias que requieren eliminación gaussiana, incluso cuando todas las condiciones iniciales convergen a la respuesta correcta.

El checkpoint publicado corresponde al paso 298.000 de 300.000, en fp32, junto con la traza completa del entrenamiento (un checkpoint cada 2.000 pasos). La licencia es MIT y el código de carga e inferencia vive en el repositorio `GilpinLab/loopscape`, módulo `loopscape.linsys`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (*looped transformer*): un único bloque aplicado iterativamente con reinyección de embeddings y renormalización del estado |
| Parametros totales | ~0,4 M (d_model 256, 8 cabezas, ratio MLP 1) |
| Parametros activos | no aplica (no es MoE; el mismo bloque se reutiliza en cada iteración) |
| Longitud de contexto | no aplica; entrada fija de un sistema 8x8 sobre GF(3) (64 coeficientes de `A` y 8 de `b`) y 8 ranuras de respuesta |
| Tipos de cuantizacion | no disponible (solo se publica state dict en fp32; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict `.pt` en fp32 (`model.pt`, paso 298000); checkpoints adicionales `model_<step>.pt` cada 2000 pasos y `model_best.pt` |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles con una actualización de la forma `x_{k+1} = LN(x_k + r(x_k, e))`, donde `r(x, e) = block(x + e) - (x + e)`. Es decir, el bloque predice un residuo sobre la entrada y el estado se normaliza en cada paso; los embeddings de los tokens de entrada `e` se reinyectan en cada iteración y el estado latente de las 8 ranuras de respuesta se inicializa con ruido aleatorio. El número de iteraciones no es fijo en entrenamiento: se muestrea por paso de una Poisson con tasa log-normal (media 16, sigma 0,3), y los gradientes fluyen únicamente a través de las últimas 8 iteraciones.

No existe dataset: las instancias se generan al vuelo en `loopscape.linsys.task`. Cada instancia muestrea un tope de peso por fila `kmax ~ U{1..8}` y luego el peso de cada fila `~ U{1..kmax}`; el 5 % de las instancias se reserva por hash de `(A, b)`. El entrenamiento comprende 300.000 pasos con batch 1024, AdamW (lr 2e-4, betas 0,9/0,99, weight decay 1e-3 solo en matrices), warmup de 2000 pasos, LR constante y cooldown 1-sqrt sobre el 5 % final, en bf16. El autor estima unas 4 horas en una H100. No se documenta RLHF, DPO ni ajuste por preferencias: el objetivo es puramente de exactitud sobre la tarea.

## Capacidades

- Resolución de sistemas lineales cuadrados y de rango completo `A x = b` sobre GF(3) con exactamente 8 incógnitas.
- Computación iterativa con profundidad efectiva variable: el mismo bloque se aplica hasta 256 iteraciones en el ejemplo de uso publicado.
- Exposición de la dinámica interna: `basin.settle_field(model, A, b, res=192, loops=256)` devuelve respuestas y tiempos de asentamiento sobre una rejilla de condiciones iniciales de 192 puntos.
- Análisis de cuencas de atracción: al partir de ruido, el modelo define un mapa desde el latente inicial al resultado, lo que permite estudiar qué fracción del espacio inicial converge a la solución correcta.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, visión, audio ni generación de texto.
- No es multilingüe: no hay vocabulario ni tokenizador de lenguaje natural implicado.

## Casos de uso

- Investigación en interpretabilidad de transformers recurrentes: usar el modelo como banco de pruebas mínimo (0,4 M de parámetros, una sola tarea verificable) para estudiar cómo la profundidad efectiva sustituye a la profundidad apilada.
- Estudio de dinámicas de punto fijo: ejecutar `settle_field` sobre rejillas de condiciones iniciales y caracterizar cuencas de atracción, ciclos y sensibilidad al estado inicial en una red entrenada.
- Análisis de la estructura fractal del tiempo de asentamiento: reproducir el hallazgo del autor sobre instancias que requieren eliminación gaussiana y contrastarlo con variantes de entrenamiento o de inicialización.
- Comparación frente a solvers algorítmicos: medir exactitud y coste iterativo del modelo contra eliminación gaussiana exacta sobre GF(3), para cuantificar la brecha entre computación aprendida y algorítmica en un dominio de juguete controlado.
- Reproducción de experimentos de curriculum implícito: el muestreo por `kmax` y pesos de fila permite entrenar variantes y medir cómo la distribución de instancias afecta a la generalización dentro del 5 % reservado.
- Docencia y divulgación: ejemplo ejecutable y de coste despreciable para explicar transformers con bucles, decodificación iterativa y estabilidad numérica de estados normalizados.
- Base para escalado controlado: punto de partida para replicar el montaje en GF(p) con más incógnitas y comprobar si el patrón de asentamiento se mantiene.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de `model_best.pt` (mejor exactitud en el conjunto reservado, guardado cerca del final del entrenamiento) y de un 5 % de instancias retenidas por hash, pero no se incluye ninguna cifra de exactitud ni comparación numérica con otros métodos.

## Requisitos de hardware

- Inferencia: el modelo tiene ~0,4 M de parámetros, por lo que en fp32 ocupa del orden de 1,6 MB de pesos; cabe en CPU sin dificultad.
- VRAM: el cuello de botella no son los pesos sino el campo de condiciones iniciales; `settle_field` con `res=192` y `loops=256` genera un lote de 192 trayectorias por instancia, de modo que el consumo depende de `res` y del número de instancias evaluadas en paralelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el ejemplo oficial usa `device="cuda"` sin especificar modelo. Para entrenamiento, el autor reporta ~4 h en una H100.
- Cabe en GPU de consumo: sí, cualquier RTX o incluso iGPU/CPU, dado el tamaño del modelo.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). La vía soportada es PyTorch con `loopscape.linsys`, cargando mediante `basin.load()` o `LoopedTransformer.from_checkpoint`.
- Latencia y throughput: no disponible en la información proporcionada.
- Almacenamiento: el repositorio ocupa 6,2 GB, fundamentalmente por los 150 checkpoints intermedios y el estado del optimizador; para inferencia basta con `model.pt` y `config.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| linsys-gf3 (GilpinLab) | ~0,4 M | Sistemas 8x8 sobre GF(3) | Sin cifras publicadas | MIT | HuggingFace + GitHub |
| Eliminación gaussiana (solver exacto) | 0 (algoritmo) | Misma clase de sistemas, exacta | Exacto por construcción en aritmética modular | no aplica | Implementación trivial |
| Otros transformers con bucles (p. ej. Universal Transformer) | no disponible | Lenguaje / algorítmico general | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos entrenados específicamente para resolver sistemas lineales sobre cuerpos finitos, por lo que la comparación cuantitativa con alternativas neuronales queda como no disponible.

## Limitaciones y advertencias

- Dominio muy restringido: solo GF(3), solo 8 incógnitas, solo sistemas cuadrados y de rango completo. No se ha validado para GF(2), GF(p) con p mayor, sistemas rectangulares, singulares o mal condicionados.
- No es un modelo de lenguaje: no genera texto, no responde prompts, no admite instrucciones y no tiene tokenizador asociado.
- El checkpoint publicado es el paso 298.000 de 300.000, no el modelo final del run; el autor indica que `model_best.pt` está en `checkpoints/pk8_b1024/`.
- Sesgo de distribución: los sistemas de entrenamiento siguen un esquema concreto de pesos de fila (`kmax ~ U{1..8}`), de modo que el rendimiento fuera de esa distribución no está caracterizado.
- Riesgo de fallo silencioso: un transformer puede producir una respuesta decodificada incorrecta sin señal de incertidumbre; el campo de asentamiento ayuda a detectar inestabilidad, pero no garantiza corrección.
- El tiempo de asentamiento es fractal en instancias que requieren eliminación gaussiana, lo que implica que el número de iteraciones necesario no es predecible de forma simple; fijar `loops` demasiado bajo puede truncar trayectorias correctas.
- Los checkpoints de `checkpoints/` usan los nombres de parámetro del código de entrenamiento original (`transformer.block.block.*`); es necesario `LoopedTransformer.from_checkpoint` para mapearlos.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el modelo no tiene aplicación comercial directa conocida más allá de la investigación.
- No apto para producción como solver: para resolver sistemas sobre GF(3) en un pipeline real, la eliminación gaussiana es más rápida, exacta y trivial de implementar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GilpinLab/linsys-gf3
- Repositorio de código (módulo `loopscape.linsys`): https://github.com/GilpinLab/loopscape
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (los resultados obtenidos no guardan relación con el mismo); no se dispone de paper, blog ni demo adicionales en la información proporcionada.
