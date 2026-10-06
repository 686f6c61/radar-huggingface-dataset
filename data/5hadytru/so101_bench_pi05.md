# 5hadytru/so101_bench_pi05

## Resumen

`5hadytru/so101_bench_pi05` es un ajuste fino completo (*full fine-tune*) del modelo base `lerobot/pi05_base` (familia π0.5, implementada en LeRobot) sobre el conjunto de datos de teleoperación simulada SO-101 Bench. Lo desarrolla el usuario 5hadytru y su propósito es servir como política de manipulación robótica para el brazo SO-101 en entornos simulados, alimentada por cuatro cámaras y capaz de emitir comandos de articulación en unidades nativas del conjunto de datos.

El checkpoint tiene 4.143.404.816 parámetros (unos 4,14 mil millones) en precisión bf16, con un repositorio de 8,3 GB, y se publica bajo licencia Apache 2.0. Se entrenó durante 36 horas sobre 4 GPU A100 de 80 GB, con un presupuesto de 2,30 millones de muestras (aproximadamente 1,15 épocas sobre 3.629 episodios y 1.996.120 fotogramas). El checkpoint oficial es el paso 18.000 (micro-pasos de LeRobot), con pesos EMA 0.999.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de ajuste de un modelo visión-lenguaje-acción (VLA) sobre un *benchmark* robótico simulado concreto, con receta de entrenamiento documentada. No es un modelo de lenguaje generalista, sino una política de control; su rendimiento validado es de 16/39 episodios resueltos (41 %) en el conjunto de validación de SO-101 Bench.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 (`lerobot/pi05_base`); detalles internos de capas no disponibles |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | No aplicable (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; pesos publicados en bf16 con EMA 0.999 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | Cuatro camaras: `overhead`, `wrist`, `overhead_init`, `wrist_init` |
| Salidas | Acciones en unidades de articulacion nativas de LeRobot; chunks de 30 pasos |
| Libreria | LeRobot (`PI05Policy.from_pretrained`) |
| Tamano del repositorio | 8,3 GB |
| Modelo base | `lerobot/pi05_base` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La ficha del autor no documenta la arquitectura interna más allá de identificar el modelo base: `lerobot/pi05_base`, es decir, la implementación en LeRobot de la familia π0.5 (visión-lenguaje-acción). Al tratarse de un VLA, el modelo combina observaciones visuales de cuatro cámaras con el estado del robot para predecir secuencias de acciones; el autor no especifica el codificador visual, el *backbone* de lenguaje ni el mecanismo de generación de acciones (por ejemplo, *flow matching*), por lo que esos detalles quedan como no disponibles.

El entrenamiento es un ajuste fino completo sobre el conjunto `5hadytru/so101_bench_sim_WM`: 3.629 episodios y 1.996.120 fotogramas de teleoperación simulada del brazo SO-101, con cuatro flujos de cámara. La receta parte de OpenPI `pi05_libero` y se escala al presupuesto disponible: *warmup* hasta 5e-5 y después tasa constante, optimizador AdamW con 0,9/0,95, normalización por cuantiles y predicción de *chunks* de 30 pasos de acción (la evaluación ejecuta 15). El entrenamiento consumió 36 horas en 4×A100-80GB, con 9.000 actualizaciones del optimizador a *batch* global 256, lo que equivale a 2,30 millones de muestras y aproximadamente 1,15 épocas. El checkpoint publicado es el paso 18.000.

## Capacidades

- Control robótico del brazo SO-101: genera comandos de articulación a partir de observaciones visuales y del estado del robot.
- Percepción multi-cámara: consume simultáneamente las vistas `overhead` y `wrist`, además de los fotogramas iniciales estabilizados `overhead_init` y `wrist_init`.
- Condicionamiento por instrucción: el modelo base π0.5 es un VLA guiado por lenguaje, aunque la ficha no detalla el conjunto de instrucciones empleado.
- Predicción de acciones por *chunks*: emite secuencias de 30 pasos, de los cuales la evaluación ejecuta 15.
- Operación en simulación: entrenado y validado sobre el *benchmark* SO-101 Bench simulado.
- Integración con LeRobot: se carga mediante `PI05Policy.from_pretrained`, sin conversión de unidades (acciones y estado en unidades nativas del conjunto de datos).
- *Tool calling*, agentes, razonamiento multi-paso, matemáticas, código, visión general, audio o modo de pensamiento: no disponible / no aplicable (no es un modelo de lenguaje de propósito general).

## Casos de uso

- Evaluación comparativa de políticas VLA en simulación: el modelo sirve como referencia ajustada sobre SO-101 Bench, de modo que otros equipos pueden comparar sus propios *fine-tunes* contra el 16/39 declarado en el mismo conjunto de validación de 39 episodios.
- Manipulación pick-and-place con SO-101 en simulador: el modelo recibe las vistas cenital y de muñeca y emite *chunks* de 30 acciones, lo que permite ejecutar tareas de agarre y colocación sin definir controladores analíticos.
- Teleoperación asistida: al haberse entrenado sobre teleoperación simulada, puede emplearse como política de partida en flujos de recogida de datos donde el operador corrige las trayectorias generadas.
- Investigación en imitación visual: las cuatro cámaras y la normalización por cuantiles permiten estudiar el efecto de la configuración de sensores en el éxito de la tarea dentro del simulador.
- Punto de partida para ajustes posteriores: al ser un *full fine-tune* con licencia Apache 2.0, puede reentrenarse sobre otros conjuntos del mismo robot sin restricciones de licencia.
- Integración en bucles de evaluación automatizada: la API de LeRobot permite cargarlo como política y lanzar episodios de validación por lotes para medir tasas de éxito de forma continua.
- Análisis de transferencia sim-a-real: es un candidato para probar cuánto del 41 % simulado se conserva al trasladar la política a hardware real, aunque el autor no aporta resultados en robot físico.

## Benchmarks y rendimiento

| Conjunto | Metrica | Resultado |
|---|---|---|
| SO-101 Bench val (39 episodios) | Episodios resueltos, checkpoint oficial (paso 18.000) | 16/39 (41 %) |
| SO-101 Bench val (39 episodios) | Episodios resueltos, mejor checkpoint validado (paso 12.000) | 18/39 |

No se han publicado en la información disponible resultados de otros *benchmarks* (MMLU, HumanEval, GSM8K u otros), que además no aplicarían a un modelo de control robótico.

## Requisitos de hardware

- Inferencia en bf16: los 4,14 mil millones de parámetros ocupan aproximadamente 8,3 GB de pesos, por lo que se estima un consumo de VRAM en torno a 10-12 GB contando activaciones y búferes de las cuatro cámaras.
- GPU de consumo: cabe en tarjetas de 16 GB o más (RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti Super), con margen mayor en las de 24 GB.
- GPU de centro de datos: no requiere A100/H100 para inferencia; el entrenamiento sí empleó 4×A100-80GB durante 36 horas.
- Despliegue: la vía documentada es LeRobot, cargando el modelo con `PI05Policy.from_pretrained`. No se mencionan soportes para vLLM, TGI, llama.cpp ni Ollama, que en cualquier caso no son aplicables a una política VLA.
- Cuantización: no se publican variantes GGUF, AWQ, GPTQ ni int8; solo pesos bf16 con EMA.
- Latencia y throughput: no disponibles. Se sabe que el modelo predice *chunks* de 30 acciones y que la evaluación ejecuta 15, pero no se indica la frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `5hadytru/so101_bench_pi05` | 4,14 mil millones | No disponible | 16/39 (41 %) en SO-101 Bench val | Apache 2.0 | HuggingFace, 0 descargas |
| `lerobot/pi05_base` (base) | No disponible | No disponible | No disponible | No disponible en la informacion | HuggingFace |
| Otros VLA de la misma categoria (p. ej. π0, OpenVLA) | No disponible | No disponible | No disponible | No disponible | No disponible |

Los resultados de la busqueda web no aportaron informacion util sobre alternativas comparables, por lo que no se puede establecer una comparacion cuantitativa con otros modelos.

## Limitaciones y advertencias

- Ámbito restringido: es una política de control para el brazo SO-101, no un modelo de lenguaje; no debe evaluarse con *benchmarks* de texto.
- Rendimiento moderado: el 41 % de éxito en validación implica que aproximadamente seis de cada diez episodios no se completan.
- Selección de checkpoint: el paso 12.000 obtuvo mejor validación (18/39) que el checkpoint final publicado (16/39), lo que sugiere sobreajuste o degradación al final del entrenamiento; conviene tenerlo en cuenta si se reentrena.
- Brecha sim-a-real: el entrenamiento y la validación son exclusivamente simulados; no hay evidencia de rendimiento en hardware físico.
- Sesgos y comportamiento fuera de distribución: no se documentan análisis de sesgo, robustez ante iluminación, oclusiones o cambios de cámara distintos de los cuatro flujos usados.
- Idiomas: la ficha no declara idiomas soportados para el condicionamiento por lenguaje.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de predicciones de acción incorrectas en estados poco representados del conjunto de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` puede tener sus propias condiciones, que no se detallan en la información disponible.
- Madurez: cero descargas y cero interacciones en HuggingFace, sin validación independiente por parte de la comunidad.
- Producción: no se publican métricas de latencia, throughput ni estabilidad, requisitos imprescindibles antes de desplegar en un bucle de control real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/5hadytru/so101_bench_pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Conjunto de datos de entrenamiento citado en la ficha: `5hadytru/so101_bench_sim_WM` (https://huggingface.co/datasets/5hadytru/so101_bench_sim_WM)
- Proyecto LeRobot (libreria de carga y entrenamiento): https://github.com/huggingface/lerobot
- Proyecto OpenPI (receta `pi05_libero` de la que parte el entrenamiento): https://github.com/Physical-Intelligence/openpi

Los resultados de la busqueda web no devolvieron ninguna fuente relevante sobre este modelo ni sobre su familia; los enlaces anteriores proceden de la informacion de HuggingFace y de las referencias explicitas de la model card.
