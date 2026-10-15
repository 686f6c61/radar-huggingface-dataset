# podolinsky/groot-libero-10-probe-safe-lstm

## Resumen

SAFE-LSTM es una sonda de detección de fallos para políticas robóticas VLA (vision-language-action), publicada por el usuario de HuggingFace `podolinsky`. No es un modelo generativo ni una política de control: es un clasificador binario por paso que consume características ya extraídas y congeladas del backbone GR00T-N1.7 y emite una probabilidad de fallo en cada paso de la política. Con 6.555.905 parámetros, es un componente auxiliar minúsculo que se acopla a un sistema mayor.

El modelo se entrenó sobre el benchmark LIBERO-10 (split de paper, semilla 0) con datos de ocupación añadidos. Su innovación no está en la arquitectura, deliberadamente simple, sino en el mecanismo de decisión: en lugar de un umbral fijo, emplea una banda conformal funcional de SAFE con una tasa de falsa alarma objetivo (`alpha`) configurable. Esto permite calibrar el compromiso entre sensibilidad y falsas alarmas de forma explícita, algo relevante en robótica, donde un falso positivo implica paradas innecesarias y un falso negativo implica un fallo no detectado.

El modelo es relevante ahora porque la monitorización y el fallo seguro son cuellos de botella reales para desplegar políticas VLA en entornos físicos. La ficha reporta resultados separados para tareas vistas retenidas y tareas no vistas, lo que expone con transparencia la degradación de generalización fuera de distribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM causal (256 unidades ocultas) + capa lineal + sigmoide por paso |
| Parametros totales | 6.555.905 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de texto; consume una secuencia de pasos de política (un paso = 8 pasos de control = 0,4 s) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors en precisión original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; consume embeddings de tokens de lenguaje del backbone) |
| Licencia | other (los términos concretos no se detallan en la información disponible) |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `normalization.npz`, `thresholds.json` |
| Autor | podolinsky |
| Pipeline declarado | robotics |
| Etiquetas | safetensors, robotics, failure-detection, vla, gr00t, libero |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion / actualizacion | 2026-10-14 / 2026-10-14 |

## Arquitectura y entrenamiento

La arquitectura es una LSTM causal de 256 unidades ocultas seguida de una proyección lineal y una sigmoide aplicada en cada paso. La entrada es un vector de 6144 dimensiones por paso de política, construido mediante pooling por modalidad sobre las características del backbone GR00T-N1.7: la media de los 64 tokens de imagen base, la media de los 64 tokens de imagen de muñeca y la media enmascarada de los tokens de lenguaje real, cada bloque de 2048 dimensiones. El grueso del cómputo y de los parámetros recae en la puerta de entrada de la LSTM, que proyecta las 6144 dimensiones de entrada sobre las 256 unidades ocultas.

El entrenamiento sigue la receta declarada de las líneas base: optimizador Adam con tasa de aprendizaje 3e-4, lotes de 32 rollouts, paciencia de 25 épocas y selección de modelo por AUROC sobre validación. La función de pérdida es entropía cruzada binaria (BCE) aplicada a las probabilidades por paso, usando como etiqueta el resultado final del rollout. La inferencia es causal sobre los pasos de la política: se estandarizan las características con la media y desviación del split de entrenamiento (`normalization.npz`) y se dispara la alarma en el primer paso cuya puntuación alcanza la banda definida en `thresholds.json`, que corresponde a la banda conformal funcional de SAFE con la tasa de falsa alarma objetivo `alpha`.

## Capacidades

- Detección de fallos por paso en rollouts de políticas VLA, con salida de probabilidad y decisión de alarma.
- Procesamiento causal de secuencias de pasos de política, apto para monitorización en línea.
- Fusión de tres modalidades mediante pooling: imagen base (64 tokens), imagen de muñeca (64 tokens) y tokens de lenguaje real (media enmascarada).
- Calibración explícita del compromiso sensibilidad/falsa alarma mediante el parámetro `alpha` de la banda conformal funcional.
- Selección de modelo guiada por AUROC de validación, útil como criterio de parada y comparación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de lenguaje).
- Modo de razonamiento explícito, visión o audio como capacidad propia: no disponible (consume características de visión y lenguaje ya extraídas por GR00T-N1.7).

## Casos de uso

- Monitorización en línea de políticas VLA en manipulación: la sonda consume las características de cada paso de la política y dispara una alarma cuando la puntuación supera la banda calibrada, lo que permite abortar un rollout antes de que el fallo se consume. El modelo está entrenado específicamente sobre LIBERO-10 con datos de ocupación.
- Parada segura en celdas robotizadas: integrada como supervisor, la sonda puede emitir una señal de parada al primer paso anómalo. La banda conformal permite fijar de antemano la tasa de falsa alarma tolerada por la célula.
- Curación de datasets de imitación: ejecutando la sonda sobre rollouts ya recogidos se pueden etiquetar episodios fallidos y filtrarlos antes de reentrenar una política, reduciendo el ruido en los datos de comportamiento.
- Evaluación automática de checkpoints durante el entrenamiento: con selección por AUROC de validación, la sonda sirve como métrica complementaria para comparar políticas candidatas sin inspección manual de cada rollout.
- Investigación en garantías estadísticas para robótica: la banda conformal funcional de SAFE y el barrido de `alpha` en el rango 0,01–0,30 permiten estudiar el compromiso entre detección temprana y falsas alarmas con una metodología reproducible.
- Detección temprana en tareas conocidas: sobre tareas vistas retenidas alcanza una TPR media de 79,0 con una TPR temprana de 78,1, lo que la hace adecuada para entornos donde el repertorio de tareas es acotado y estable.
- Comparación de backbones y recetas de políticas: al operar sobre características congeladas, la sonda puede reutilizarse para medir la "detectabilidad" de fallos de distintas políticas o variantes de backbone sin reentrenar el detector.

## Benchmarks y rendimiento

Resultados declarados sobre el split de paper de LIBERO-10 (semilla 0). Los valores son porcentajes promediados sobre `alpha` en el rango 0,01–0,30; entre paréntesis, el valor con `alpha` = 0,10.

| Conjunto | TPR | TPR temprana | TPR a tiempo | LDR | FPR |
|---|---|---|---|---|---|
| Tareas vistas retenidas | 79,0 (73,3) | 78,1 (73,3) | 6,7 (6,7) | 1,0 (0,0) | 12,2 (0,0) |
| Tareas no vistas | 61,4 (56,7) | 56,2 (50,0) | 14,8 (13,3) | 11,5 (15,4) | 21,2 (19,2) |

La tabla completa por valor de `alpha` está en el archivo `EVAL.md` del repositorio. No se han publicado en la información disponible resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 26 MB en fp32 y 13 MB en fp16 para los 6,5 millones de parámetros, más el coste de las características de entrada (6144 dimensiones por paso).
- GPU recomendadas: innecesarias. Cualquier GPU, incluida una integrada, es suficiente; una RTX 4090 o una A100 estarían enormemente sobredimensionadas para este componente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU. El coste dominante en un sistema real será el backbone GR00T-N1.7 que genera las características, no la sonda.
- Opciones de despliegue: el repositorio incluye `probe.py` y `models.py` como referencia de ejecución con PyTorch, safetensors y NumPy (`pip install torch safetensors numpy`, `python probe.py features.npy --alpha 0.10`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita. La resolución temporal del sistema es de un paso de política cada 8 pasos de control, es decir, 0,4 s.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos en la información proporcionada. La model card menciona "the baselines' recipe" (la receta de las líneas base) para el protocolo de entrenamiento, pero no identifica qué líneas base concretas se compararon ni aporta sus cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| podolinsky/groot-libero-10-probe-safe-lstm | 6.555.905 | secuencia de pasos de política | TPR 79,0 en tareas vistas / 61,4 en no vistas | other | HuggingFace, 0 descargas |
| Alternativas de detección de fallos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: depende por completo de las características extraídas por el backbone GR00T-N1.7. Sin ese backbone, o con una versión distinta que cambie la dimensionalidad o la semántica de los embeddings, la sonda no funciona.
- Degradación clara fuera de distribución: la TPR cae de 79,0 a 61,4 y la FPR sube de 12,2 a 21,2 al pasar de tareas vistas retenidas a tareas no vistas.
- Detección tardía: la TPR "a tiempo" es muy baja (6,7 en tareas vistas y 14,8 en no vistas), lo que indica que buena parte de las alarmas correctas llegan después del punto en el que el fallo ya es identificable como inminente.
- No es un modelo de lenguaje: no genera texto, no sigue instrucciones, no soporta tool calling ni razonamiento multi-paso. Cualquier expectativa de ese tipo es un malentendido sobre su naturaleza.
- Idiomas soportados: no disponible. Los tokens de lenguaje se consumen únicamente como características agregadas mediante media enmascarada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero existe riesgo de falsos positivos (FPR de hasta 21,2 en tareas no vistas) y de falsos negativos (hasta un 38,6 de TPR perdida en no vistas).
- Licencia "other": los términos no están detallados en la información disponible. Es imprescindible revisar el archivo de licencia del repositorio antes de cualquier uso comercial.
- Sesgos conocidos: no documentados en la información disponible, pero el entrenamiento sobre un único benchmark (LIBERO-10) y una única semilla limita la evidencia de robustez.
- Resultados basados en una sola semilla (seed 0) y en un único split de paper, sin intervalos de confianza publicados.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño reportado de 0,0 GB, lo que sugiere un artefacto de investigación sin validación independiente por terceros.
- La fecha de creación registrada (2026-10-14) es posterior a la fecha de referencia habitual; conviene verificar la procedencia del artefacto.
- En producción, la sonda debe combinarse con salvaguardas independientes: ninguna métrica de detección con FPR distinta de cero es suficiente por sí sola para un fallo seguro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podolinsky/groot-libero-10-probe-safe-lstm
- Archivos relevantes dentro del repositorio: `model.safetensors`, `config.json`, `normalization.npz`, `thresholds.json`, `eval_task_split.json`, `EVAL.md` (tabla completa por `alpha`), `models.py`, `probe.py`.
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada. Los resultados devueltos por la búsqueda no guardan relación con este modelo.
