# kiruluta/J-Space-HF-Scaling-Benchmark

## Resumen

J-Space-HF-Scaling-Benchmark es un paquete de benchmark reproducible publicado por el usuario kiruluta en Hugging Face, orientado a escalar el análisis de J-Space Dynamics (JSD) sobre modelos de lenguaje causales de pesos abiertos, checkpoints de entrenamiento, semillas aleatorias y plataformas de cómputo distintas. No se trata de un modelo de lenguaje con pesos entrenados, sino de una herramienta de interpretabilidad mecanística que empaqueta el J-Space Neural Analyzer junto con el protocolo experimental asociado al trabajo "Probing the Formation and Dynamics of J-Space in Language Models".

El objetivo declarado por el autor es doble: por un lado, poner a prueba las métricas propuestas a escalas sustancialmente mayores y sobre hardware independiente; por otro, dejar claro que las medidas de rendimiento del benchmark (throughput, memoria) no constituyen validación de las hipótesis científicas. La versión inicial se ha validado en una única GPU NVIDIA GB10 ejecutando la familia EleutherAI Pythia hasta 2,8B parámetros en FP16, con resultados de memoria pico asignada y tiempo de análisis por modelo.

El repositorio usa licencia MIT, se distribuye como paquete Python instalable con `pip install -e '.[huggingface]'` y está etiquetado con `transformers`, `mechanistic-interpretability`, `jacobian`, `scaling` y `pytorch`. Su relevancia actual es de nicho: sirve como infraestructura abierta para investigadores que quieran replicar o extender instrumentos de análisis de representaciones (robustez de margen de continuación, operadores de transferencia no autónomos, geometría de Fisher restringida a J, consolidación longitudinal) más allá de modelos pequeños y de una sola máquina.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no define una arquitectura de modelo; es un paquete de benchmark que analiza modelos causales de terceros, validado sobre EleutherAI Pythia) |
| Parametros totales | no disponible (no contiene pesos propios; los modelos analizados en la validación van de 410M a 2,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo analizado, no del benchmark) |
| Tipos de cuantizacion | no disponible; la ejecución de modelo soporta `--dtype` (por ejemplo `float16`) y las matrices que entran en rutinas NumPy se promueven a FP32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no se publican pesos; se consumen checkpoints de Hugging Face en caché) |

## Arquitectura y entrenamiento

El paquete no entrena modelos ni publica pesos. Su núcleo es el J-Space Neural Analyzer, un conjunto de instrumentos que extiende el programa J-lens con cinco familias falsables: robustez de margen de continuación (estimaciones locales de segundo orden sobre cuánto puede desplazarse una representación antes de que cambie el concepto decodificado), direcciones de secuencia y enlace condicionadas por trayectoria, operadores de transferencia no autónomos con pruebas de cierre con datos retenidos y persistencia en ventana finita, geometría de Fisher pullback restringida a coordenadas J, y análisis de consolidación longitudinal por checkpoint (reconstrucción, dimensión efectiva y persistencia).

El protocolo, denominado schema 1.0, separa explícitamente los tiempos en `elapsed_s` (reloj de pared completo), `model_load_s` (construcción y carga del tokenizador y del modelo), `analysis_s` (cómputo científico tras la carga y antes de serializar el informe) y `prompt_layer_per_s`, definido como `(prompt_count × sampled_layer_count) / analysis_s`. Esta separación evita confundir el comportamiento de descarga y carga de checkpoints con el rendimiento analítico del análisis J-Space. El benchmark registra el conjunto exacto de capas muestreadas y mantiene la coherencia de los análisis de dinámica, robustez, enlace y Fisher con ese conjunto, admitiendo overrides explícitos para colocación controlada de capas.

La validación realizada ejecuta modelos Pythia en FP16 con arrays promovidos a FP32 para el álgebra lineal y estadística en NumPy, evitando rutinas FP16 no soportadas sin alterar la precisión de ejecución solicitada. No hay información proporcionada sobre composición de datasets, número de tokens, RLHF/DPO ni innovaciones de decodificación (decodificación especulativa, atención lineal, etc.) porque no aplican: el artefacto es un benchmark y no un modelo entrenado.

## Capacidades

- Análisis de interpretabilidad mecanística sobre modelos causales de pesos abiertos mediante cinco familias de instrumentos JSD.
- Medición de robustez de margen de continuación con estimaciones locales de segundo orden.
- Cálculo de direcciones de secuencia y enlace condicionadas por trayectoria y contexto.
- Estimación de operadores de transferencia no autónomos dependientes de capa y posición, con pruebas de cierre y persistencia.
- Cálculo de geometría de Fisher pullback restringida a coordenadas J.
- Análisis longitudinal de consolidación a lo largo de familias de checkpoints.
- Ejecución validada sobre la familia EleutherAI Pythia (410M, 1B, 1,4B y 2,8B) en FP16.
- Modo de validación software en CPU y offline mediante `jspace-analyze demo`.
- Generación de resultados portables en JSON, artefactos científicos con marca temporal y filas añadidas a `results/leaderboard.csv`.
- Helper multi-GPU que mide throughput de trabajos independientes, uno por GPU (no paralelismo tensorial, de pipeline ni distribuido).
- Soporte de tool calling, function calling, agentes, visión, audio, modo thinking y multilingüismo: no disponible (no aplica a este artefacto).

## Casos de uso

- Extensión del benchmark a modelos de mayor tamaño: el autor solicita explícitamente contribuciones con modelos causales de pesos abiertos sustancialmente mayores que Pythia-2.8B; un laboratorio con acceso a H100/H200 o B200 puede ejecutar `benchmarks/run_scaling.py` apuntando a checkpoints mayores y añadir filas comparables al leaderboard.
- Replicación multi-semilla: investigadores que necesiten cuantificar varianza en las medidas JSD pueden repetir ejecuciones con distintas semillas sobre el mismo modelo y capas, aprovechando la separación de tiempos del schema 1.0 para comparar de forma limpia.
- Barrido de familias de checkpoints: el análisis longitudinal de consolidación permite seguir reconstrucción, dimensión efectiva y persistencia a lo largo de un suite denso de checkpoints de entrenamiento, útil para estudiar cómo emerge la estructura J durante el preentrenamiento.
- Escalado de robustez de segundo orden: equipos con presupuesto de cómputo alto pueden llevar las estimaciones locales de segundo orden a modelos y capas donde el coste cuadrático resulta prohibitivo en una sola GPU consumer.
- Escalado de la geometría de Fisher restringida a J: cálculo de geometría de información local dentro de coordenadas J en modelos grandes, con contribución directa de los resultados al leaderboard comunitario.
- Propagación de incertidumbre por bootstrap: añadir intervalos de confianza a las medidas publicadas para evitar interpretar diferencias pequeñas entre modelos o capas como efectos reales.
- Experimentos causales y de intervención: uso del paquete como base para pruebas de intervención sobre representaciones, con el requisito previo de validar la identificabilidad del diccionario antes de interpretar coeficientes.
- Validación de infraestructura distribuida: probar implementaciones de ejecución distribuida o model-parallel rigurosamente verificadas, distinguiéndolas del helper actual de un trabajo por GPU.
- Verificación de reproducibilidad en hardware distinto: comparar las cifras de la línea base (GB10) contra mediciones en MI300X, GB200/GB300 o servidores multi-nodo para detectar dependencias de plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el artefacto no es un modelo evaluable. Lo que sí se publica es la línea base validada de rendimiento y reproducibilidad, medida en una única NVIDIA GB10 con checkpoints de Hugging Face en caché y ejecución FP16:

| Modelo | Capas muestreadas | Memoria GPU pico asignada | Tiempo de análisis | Prompt-layer/s |
|---|---|---:|---:|---:|
| EleutherAI/pythia-410m | 0, 6, 12, 18, 23 | 0,911 GiB | 2,038 s | 19,6273 |
| EleutherAI/pythia-1b | 0, 4, 8, 12, 15 | 2,049 GiB | 2,433 s | 16,4390 |
| EleutherAI/pythia-1.4b | 0, 6, 12, 18, 23 | 2,817 GiB | 2,476 s | 16,1533 |
| EleutherAI/pythia-2.8b | 0, 8, 16, 24, 31 | 5,395 GiB | 2,908 s | 13,7544 |

Advertencias del propio autor sobre estos datos: son medidas de rendimiento y reproducibilidad, no evidencia de que modelos mayores exhiban estructura J más fuerte, más débil o cualitativamente distinta. Los conjuntos de capas muestreadas difieren porque las arquitecturas tienen profundidades distintas. La métrica `prompt-layer/s` normaliza por el número de combinaciones prompt-capa muestreadas, pero no por anchura oculta, número de parámetros, FLOPs ni arquitectura, por lo que no es directamente comparable entre modelos de tamaños distintos. Las filas completas están en `results/leaderboard.csv`.

## Requisitos de hardware

- VRAM estimada: según la línea base medida en GB10, 0,911 GiB para pythia-410m, 2,049 GiB para pythia-1b, 2,817 GiB para pythia-1.4b y 5,395 GiB para pythia-2.8b, con cinco capas muestreadas por modelo y ejecución FP16. Son memorias pico asignadas, no reservas totales del proceso.
- GPU recomendadas por el autor para escalar el benchmark: H100/H200, B100/B200, GB200/GB300, sistemas de clase MI300X, servidores multi-GPU y cómputo multi-nodo.
- GPU consumer: la línea base validada cabe en una NVIDIA GB10, por lo que modelos Pythia de hasta 2,8B con muestreo de cinco capas son viables en hardware de gama consumer o de estación de trabajo con al menos 6 GiB libres para el modelo mayor probado.
- Modelos analizados: EleutherAI Pythia 410M, 1B, 1.4B y 2.8B (validados); el benchmark está diseñado para aceptar otros modelos causales de pesos abiertos mediante `--model`.
- Opciones de despliegue: instalación como paquete Python (`pip install -e '.[huggingface]'`), validación software en CPU/offline (`jspace-analyze demo`) y ejecución GPU mediante `python benchmarks/run_scaling.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: 2,038 s / 19,6273 prompt-layer/s (410M), 2,433 s / 16,4390 (1B), 2,476 s / 16,1533 (1,4B) y 2,908 s / 13,7544 (2,8B) en GB10. El helper multi-GPU mide trabajos independientes uno por GPU, no paralelismo de modelo.
- Precisión: la ejecución del modelo respeta `--dtype` (por ejemplo `float16`), mientras que los arrays que entran en rutinas estadísticas y de álgebra lineal de NumPy se promueven a FP32.

## Comparativa con modelos similares

Este repositorio no es un modelo, por lo que la comparación con modelos de lenguaje de la misma categoría no aplica. Los artefactos comparables son otras herramientas de interpretabilidad mecanística, para las que no se proporciona información cuantitativa en la documentación disponible:

| Herramienta | Tipo | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| J-Space-HF-Scaling-Benchmark | Benchmark de interpretabilidad (JSD) | no aplica | no aplica | Línea base Pythia en GB10 (tabla anterior) | MIT | Hugging Face, instalación vía pip |
| TransformerLens | Librería de interpretabilidad mecanística | no aplica | no aplica | no disponible | no disponible en la información proporcionada | no disponible |
| SAELens | Librería de autoencoders dispersos | no aplica | no aplica | no disponible | no disponible en la información proporcionada | no disponible |

No se dispone de datos comparativos de parámetros, contexto, rendimiento, licencia ni disponibilidad para las alternativas citadas dentro de la información proporcionada; se listan únicamente como referencia de categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, visión ni audio, y no debe evaluarse con benchmarks de calidad tipo MMLU o HumanEval.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB; se trata de un proyecto incipiente con validación en una sola máquina.
- La línea base se ha validado únicamente en una NVIDIA GB10 y hasta Pythia-2.8B; no hay validación en H100, MI300X ni entornos multi-nodo.
- El propio autor advierte que las cifras de throughput y memoria no constituyen evidencia a favor de las hipótesis científicas sobre J-Space.
- La métrica `prompt-layer/s` no está normalizada por anchura oculta, parámetros, FLOPs ni arquitectura, por lo que las comparaciones entre modelos de distinto tamaño son engañosas.
- Los conjuntos de capas muestreadas difieren entre modelos porque las profundidades difieren; cualquier comparación debe tener en cuenta ese sesgo estructural.
- El helper multi-GPU mide trabajos independientes uno por GPU y no debe interpretarse como paralelismo tensorial, de pipeline o de modelo distribuido.
- Guardarraíl científico explícito: hay que validar la identificabilidad del diccionario antes de interpretar coeficientes; el fallo de identificabilidad, cierre, persistencia, robustez o replicación debe tratarse como resultado informativo, no como error.
- Para comparaciones de rendimiento, los contribuyentes deben indicar si los checkpoints estaban ya en caché, ya que la descarga afecta al tiempo total.
- Riesgo de alucinación, sesgos conocidos y limitaciones idiomáticas: no disponible (no aplica a un paquete de análisis; los sesgos dependerían de los modelos analizados).
- Licencia MIT, que permite uso comercial del código del benchmark, pero conviene verificar las licencias de los checkpoints de terceros que se analicen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kiruluta/J-Space-HF-Scaling-Benchmark
- Fichero de programa de contribución: `COLLABORATION.md` (en la raíz del repositorio)
- Protocolo completo del benchmark: `BENCHMARK.md` (en la raíz del repositorio)
- Resultados completos medidos: `results/leaderboard.csv` (en el repositorio)
- Script de ejecución: `benchmarks/run_scaling.py` (en el repositorio)
- Paper de referencia citado: "Probing the Formation and Dynamics of J-Space in Language Models" — enlace no disponible en la información proporcionada
- Modelos de la línea base: https://huggingface.co/EleutherAI/pythia-410m, https://huggingface.co/EleutherAI/pythia-1b, https://huggingface.co/EleutherAI/pythia-1.4b, https://huggingface.co/EleutherAI/pythia-2.8b
