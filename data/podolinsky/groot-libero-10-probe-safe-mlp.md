# podolinsky/groot-libero-10-probe-safe-mlp

## Resumen

SAFE-MLP es una sonda (probe) de detección de fallos para políticas robóticas de tipo vision-language-action (VLA). No es un modelo generativo ni una política en sí: es un clasificador MLP de 1.573.377 parámetros que consume características del backbone de GR00T-N1.7 (construido sobre el VLM Cosmos-Reason2-2B) y emite una puntuación acumulada por paso de política que, comparada con una banda conformal funcional, dispara una alarma de fallo.

Lo publica el usuario podolinsky en Hugging Face bajo licencia «other», con 0 descargas y 0 «likes» en el momento de redactar esta ficha (creado el 14 de octubre de 2026). Está entrenado sobre el split de paper de LIBERO-10 con variantes ocluidas («+ Occ»), seed 0, y forma parte de una familia de sondas SAFE (variantes MLP y LSTM) del mismo autor.

Su relevancia es práctica: permite añadir una capa de seguridad independiente a un sistema VLA ya entrenado sin reentrenar la política, con control explícito de la tasa de falsa alarma mediante el parámetro alpha de la banda conformal. La entrada es un vector de 6144 dimensiones por paso (medias agrupadas de tokens de imagen base, imagen de muñeca y tokens de lenguaje) y cada paso de la sonda equivale a 8 pasos de control (0,4 s).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP: Linear(6144→256) + Linear(256→1) + sigmoid por paso, con suma acumulativa de la puntuación |
| Parámetros totales | 1.573.377 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en tokens; la entrada es una secuencia de vectores de 6144 dimensiones, uno por paso de política (1 paso = 8 pasos de control = 0,4 s) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizaciones documentadas) |
| Idiomas soportados | no disponible (el modelo no genera lenguaje; consume la media enmascarada de los tokens de lenguaje del backbone) |
| Licencia | other |
| Formato de pesos | safetensors |
| Dimensión de entrada | 6144 (2048 imagen base + 2048 imagen de muñeca + 2048 lenguaje) |
| Salida | puntuación acumulada por paso + alarma según banda conformal funcional con tasa de falsa alarma objetivo alpha |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 0,0 GB (redondeado) |
| Idiomas del repositorio | no disponibles |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente mínima: una única capa oculta de 256 unidades sobre un vector de entrada de 6144 dimensiones, seguida de una proyección a un escalar por paso y una sigmoide. Las puntuaciones por paso se agregan mediante una suma acumulativa, de modo que la salida es una puntuación acumulada en lugar de una probabilidad independiente por paso. El modelo se entrena con la pérdida de SAFE aplicada sobre la puntuación acumulada, no sobre las probabilidades por paso. No es un transformer ni un MoE: no tiene mecanismos de atención.

El entrenamiento sigue la receta de las líneas base del autor: optimizador Adam con tasa de aprendizaje 1e-3, lotes de 32 rollouts, paciencia de 25 y selección del modelo por AUROC de validación. Los datos proceden de rollouts alineados de la política NVIDIA GR00T-N1.7-LIBERO sobre tareas LIBERO en variantes normal y ocluida, con K=10 muestras de acción por inferencia y características por token extraídas del backbone VLM Cosmos-Reason2-2B. La entrada se estandariza con las medias y desviaciones del split de entrenamiento incluidas en `normalization.npz`, y la alarma se dispara en el primer paso cuya puntuación alcanza la banda definida en `thresholds.json`.

## Capacidades

- Detección de fallos de política robótica: emite una puntuación acumulada por paso que indica si el rollout va camino del fallo.
- Alarma calibrada: la banda conformal funcional permite fijar una tasa de falsa alarma objetivo mediante el parámetro alpha.
- Generalización a tareas no vistas: los resultados reportados incluyen el conjunto de tareas no vistas del split de paper de LIBERO-10.
- Procesamiento multimodal indirecto: consume características agrupadas de imagen base, imagen de muñeca y tokens de lenguaje del backbone GR00T-N1.7.
- Funcionamiento causal sobre la secuencia de pasos de política, con decisión en línea paso a paso.
- No genera texto, código ni acciones; no soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni modo «thinking»: su única salida es una puntuación y una alarma.

## Casos de uso

- Monitorización en producción de robots manipuladores: la sonda se ejecuta en paralelo a la política GR00T-N1.7, consumiendo las mismas características del backbone, y dispara una alarma cuando la puntuación acumulada supera la banda conformal, permitiendo detener o degradar el comportamiento antes de un fallo físico.
- Parada de seguridad (fail-safe): con alpha bajo (por ejemplo 0,01) se prioriza minimizar falsas alarmas para evitar paradas innecesarias; con alpha alto se prioriza detectar el mayor número posible de fallos.
- Evaluación offline de políticas VLA: dado un conjunto de rollouts almacenados (features en formato `.npy`), la sonda calcula TPR, FPR y latencia de detección para comparar versiones de la política antes de desplegarlas.
- Investigación en representación: al operar sobre características agrupadas del backbone, sirve para estudiar qué información del backbone VLM predice el fallo y en qué momento del rollout aparece.
- Supervisión de tareas no vistas: en entornos donde la política se enfrenta a tareas fuera de distribución, la sonda mantiene TPR en torno al 75 % según los resultados publicados, lo que permite un modo de operación conservador.
- Ajuste de sensibilidad por despliegue: el mismo modelo permite distintas políticas de alarma cambiando únicamente el valor de alpha y el archivo de umbrales, sin reentrenar.
- Integración en un pipeline de CI para robótica: ejecutar `probe.py` sobre rollouts de regresión para bloquear la promoción de una política que aumente la tasa de fallos detectados.
- Seguimiento temporal de la degradación: cada paso cubre 0,4 s de control, lo que permite localizar aproximadamente en el tiempo la transición hacia el fallo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de paper de LIBERO-10 (seed 0; promediados sobre alpha en el rango 0,01–0,30, con el valor correspondiente a alpha = 0,10 entre paréntesis):

| Conjunto | TPR | TPR temprano | TPR a tiempo | LDR | FPR |
|---|---|---|---|---|---|
| Tareas vistas retenidas | 72,4 (66,7) | 42,9 (46,7) | 9,5 (13,3) | 47,7 (37,5) | 6,8 (0,0) |
| Tareas no vistas | 75,2 (73,3) | 33,3 (30,0) | 10,0 (10,0) | 65,8 (68,4) | 14,8 (12,5) |

La tabla completa por valor de alpha está en el archivo `EVAL.md` del repositorio. No se han publicado en la información disponible resultados comparativos con otras sondas ni cifras absolutas de latencia en milisegundos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,3 MB en fp32 y 3,1 MB en fp16 para los 1.573.377 parámetros. El modelo cabe holgadamente en cualquier GPU y en memoria de CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Si se ejecuta junto a la política GR00T-N1.7, el cuello de botella será el backbone VLM, no esta sonda.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo, e incluso sin GPU.
- Opciones de despliegue: inferencia directa con PyTorch y safetensors, tal como indica el autor (`pip install torch safetensors numpy`; `python probe.py features.npy --alpha 0.10`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles como medidas explícitas. Como referencia temporal del dominio, cada paso de la sonda cubre 8 pasos de control, es decir, 0,4 s de ejecución de la política.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Agregación temporal | Conjunto | Licencia |
|---|---|---|---|---|---|
| podolinsky/groot-libero-10-probe-safe-mlp | Sonda MLP | 1.573.377 | Suma acumulativa | LIBERO-10 + Occ, split de paper, seed 0 | other |
| podolinsky/groot-libero-x-probe-safe-mlp | Sonda MLP | no disponible | Suma acumulativa | variante «x» | other |
| podolinsky/groot-libero-x-probe-safe-lstm | Sonda LSTM | no disponible | LSTM causal de 256 unidades | variante «x» | other |

Las tres sondas comparten autor, familia SAFE y receta de entrenamiento (Adam, lotes de 32 rollouts, selección por AUROC de validación), y la alarma se basa en la misma banda conformal funcional. La diferencia principal entre esta ficha y la variante LSTM es el mecanismo de agregación temporal: suma acumulativa frente a LSTM causal. No se dispone de datos para comparar numéricamente el rendimiento entre ambas variantes. Los modelos comparables de otras familias no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Dependencia del backbone: la sonda solo funciona con características del backbone GR00T-N1.7 (Cosmos-Reason2-2B) extraídas de la forma documentada; con otro backbone o con otro esquema de agrupación de tokens no es utilizable sin reentrenar.
- Dependencia del dominio: entrenada únicamente sobre LIBERO-10 con variantes ocluidas, seed 0. No se documentan evaluaciones en otros entornos o tareas.
- Tasa de falsa alarma variable: el FPR pasa de 6,8 en tareas vistas retenidas a 14,8 en tareas no vistas (promedio sobre alpha), lo que implica más falsas alarmas fuera de distribución.
- Detección tardía: el TPR a tiempo es muy bajo (9,5 y 10,0), es decir, una fracción pequeña de los fallos se detecta en una fase temprana del rollout.
- Un solo seed: los resultados publicados corresponden a seed 0, sin intervalos de confianza ni repeticiones, por lo que la varianza entre seeds es desconocida.
- Requisito de normalización: es obligatorio aplicar `normalization.npz` (media y desviación del split de entrenamiento) antes de la inferencia; omitirlo invalida las puntuaciones y los umbrales.
- Licencia «other»: no se especifican en la información disponible los términos exactos de uso comercial; conviene revisarlos antes de un despliegue en producción.
- Riesgo de alucinación: no aplica, ya que el modelo no genera lenguaje. El riesgo equivalente son los falsos negativos (fallos no detectados) y los falsos positivos (paradas innecesarias).
- Idiomas: no disponible. El modelo no procesa ni produce texto; solo consume la media enmascarada de los tokens de lenguaje del backbone.
- Sin datos publicados sobre sesgos demográficos, culturales o de otro tipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/podolinsky/groot-libero-10-probe-safe-mlp
- Variante MLP de la familia «x»: https://huggingface.co/podolinsky/groot-libero-x-probe-safe-mlp
- Variante LSTM de la familia «x»: https://huggingface.co/podolinsky/groot-libero-x-probe-safe-lstm
- Conjunto de características del backbone GR00T-N1.7 LIBERO-10 (claru.ai): https://claru.ai/datasets/podolinsky-groot-libero-10-features-v3
- Benchmark LIBERO-Safety: https://libero-safety.github.io/
- Perfil del autor en SAVRN: https://savrn.com/model-publishers/podolinsky
