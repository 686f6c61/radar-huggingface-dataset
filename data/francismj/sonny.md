# Francismj/sonny

## Resumen

Sonny es un modelo neuronal de predicción meteorológica a medio plazo desarrollado por Minjong Cheon (publicado bajo el identificador Francismj en Hugging Face). Se trata de un backbone de tipo StepNets de un solo paso: dado un estado atmosférico en un instante dado, el modelo predice el incremento (*delta*) del estado tras un intervalo configurable de 6, 12 o 24 horas. Repite este paso de forma autorregresiva para generar pronósticos de hasta diez días.

El modelo opera sobre 69 variables de ERA5 en una rejilla regular de 1,5° (120×240 celdas latitud-longitud), con la fila del polo sur eliminada respecto a la rejilla estándar de WeatherBench 2. Con 23,58 millones de parámetros y un peso de repositorio de 0,2 GB, es un modelo muy compacto en comparación con los grandes emuladores de la atmósfera basados en transformers o grafos, y esa compacidad es precisamente su tesis: el título del artículo asociado, "Breaking the Compute Wall in Medium-Range Weather Forecasting", apunta a reducir drásticamente el coste computacional de la predicción a medio plazo.

Es relevante ahora porque propone una alternativa eficiente a los emuladores de gran escala (GraphCast, Pangu-Weather, FuXi) manteniendo la formulación de predicción por incrementos sobre ERA5. El checkpoint `sonny_final.safetensors` incorpora un EMA con decaimiento 0,999 tras un *cooldown* de learning rate de cinco épocas, y es el que se evalúa en la versión revisada del artículo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StepNets (backbone de un solo paso con *variable-aware embedding* y tronco en dos etapas) |
| Parámetros totales | 23.576.916 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de 69×120×240) |
| Tipos de cuantización | no disponible (pesos en safetensors, inferencia con autocast float16) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`sonny_final.safetensors`, `model.safetensors`) |

## Arquitectura y entrenamiento

Sonny es una red neuronal específica para datos meteorológicos en rejilla, no un transformer de lenguaje. Su diseño combina un *embedding* consciente de la variable (cada una de las 69 variables ERA5 recibe un tratamiento diferenciado en la proyección de entrada) con un tronco en dos etapas que procesa el campo atmosférico completo. La salida es un incremento por variable que se suma al estado de entrada, escalado por la desviación típica de los incrementos a 6, 12 o 24 horas (`normalize_diff_std_{6,12,24}`). El intervalo temporal se pasa al modelo como una entrada adicional escalada (`hours / 10`), lo que permite un único conjunto de pesos para los tres pasos.

El entrenamiento se realizó sobre ERA5 en la rejilla de 1,5° descrita, con normalización por variable (media y desviación típica almacenadas en `normalization/`). El checkpoint principal corresponde a un EMA con decaimiento 0,999 aplicado tras un *cooldown* de learning rate de cinco épocas a partir de la época 50; el segundo fichero de pesos (`model.safetensors`) es el EMA con decaimiento 0,9 en la época 50, correspondiente a la versión 1 del artículo. No se dispone en la información proporcionada del número de tokens, la composición exacta del dataset ni si hubo ajuste por refuerzo; el autor cita el artículo arXiv:2603.21284 para los detalles.

Una innovación destacable es la corrección publicada en noviembre de 2026: versiones anteriores de `config.json` listaban las tres primeras variables como `2m_temperature, 10m_u_component_of_wind, 10m_v_component_of_wind`, cuando el orden real de entrenamiento es `10m_u_component_of_wind, 10m_v_component_of_wind, 2m_temperature`. Las salidas generadas con la lista antigua tienen esos tres canales mal etiquetados, y el aviso afecta a ambos ficheros de pesos. El orden de canales de salida queda fijado por `init_args.variables` en `config.json`.

## Capacidades

- Predicción meteorológica determinista a medio plazo sobre 69 variables ERA5 en rejilla de 1,5° (120×240).
- Predicción por incrementos con paso configurable de 6, 12 o 24 horas, reutilizando los mismos pesos.
- Rollout autorregresivo de hasta diez días, con evaluación a cada plazo de 24 horas.
- Salida por variable en unidades físicas tras desnormalizar con `normalize_mean`, `normalize_std` y `normalize_diff_std_{6,12,24}`.
- Inferencia en GPU con `torch.autocast("cuda", dtype=torch.float16)`; el código requiere `torch`, `timm` y `xformers`.
- No soporta *tool calling*, agentes, razonamiento multi-step genérico ni capacidades multilingües: es un modelo de dominio, no un modelo de lenguaje.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Pronóstico operativo de medio plazo de bajo coste: el modelo genera un rollout de diez días con pasos de 6, 12 y 24 horas sobre 69 variables, lo que permite producir pronósticos deterministas con una huella de parámetros de solo 23,6 M, adecuada para entornos con presupuesto de cómputo limitado.
- *Downstream* de reanálisis y validación climática: al partir de estados ERA5 normalizados, se puede usar para generar trayectorias de pronóstico sobre las 355 inicializaciones diarias de 00 UTC de 2022 (el protocolo de evaluación del autor) y comparar con reanálisis.
- Investigación en emuladores atmosféricos eficientes: sirve como *baseline* compacto frente a GraphCast o Pangu-Weather en estudios sobre el compromiso entre coste computacional y error de pronóstico.
- Generación de *ensembles* por perturbación de la inicialización: al ser un paso barato, se pueden lanzar múltiples rollouts con condiciones iniciales perturbadas para estimar incertidumbre, aunque el modelo es determinista y no modela dispersión de forma nativa.
- Integración en pipelines de asimilación de datos: el incremento predicho a 6 horas puede emplearse como operador de observación o como término de fondo en esquemas variacionales, dado su coste reducido por paso.
- Prototipado docente y divulgación: la rejilla de 1,5° y el reducido tamaño del checkpoint (0,2 GB) permiten ejecutar experimentos completos en una sola GPU, algo inviable con emuladores de escala global de cientos de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que, ejecutando el procedimiento descrito sobre las 355 inicializaciones diarias de 00 UTC de 2022 con `sonny_final.safetensors`, el RMSE medio sobre nueve variables y diez días de plazo difiere como máximo un 0,47 % en cualquier celda y un −0,13 % de media respecto a los valores del artículo. No se proporcionan cifras absolutas de RMSE, ACC ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 23,6 M de parámetros en float16 los pesos ocupan unos 47 MB, y el grueso del consumo proviene de las activaciones de la rejilla 69×120×240 y del tronco en dos etapas.
- GPU recomendadas: el autor indica que se necesita una GPU; el código usa `torch.autocast("cuda", dtype=torch.float16)` y `xformers`, por lo que se requiere CUDA.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del modelo; no se especifican modelos concretos (RTX 4090, etc.) en la información disponible.
- Opciones de despliegue: inferencia directa con PyTorch cargando `safetensors` mediante `safetensors.torch.load_file` y el paquete `networks.sonny` del repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sonny | 23,6 M | 1,5° (120×240) | 69 variables ERA5, rollout a 10 días | Apache 2.0 | Hugging Face + GitHub |
| GraphCast | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Pangu-Weather | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| FuXi | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de parámetros, contexto ni licencia de los modelos alternativos, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Corrección de etiquetado: los checkpoints anteriores a noviembre de 2026 pueden producir los canales `10m_u_component_of_wind`, `10m_v_component_of_wind` y `2m_temperature` mal etiquetados si se usó el orden antiguo de `config.json`; hay que verificar el orden en `init_args.variables`.
- Resolución fija de 1,5°: no admite rejillas de mayor resolución sin reentrenamiento, y la fila del polo sur (88,5°S) está ausente por diseño.
- Modelo determinista: no genera dispersión de ensemble de forma nativa; la incertidumbre debe obtenerse por perturbación externa de las condiciones iniciales.
- Dependencia de ERA5: entrenado y normalizado sobre ERA5, por lo que su comportamiento fuera de esa distribución (observaciones reales, rejillas distintas) no está garantizado.
- Sensibilidad numérica: la model card advierte que la evaluación original escalaba los incrementos en float16, lo que dejaba invariables `specific_humidity_{50,100,150,200}` durante los rollouts; el código recomendado escala en float32.
- Sesgos conocidos: no se documentan sesgos específicos más allá de los propios del reanálisis ERA5 subyacente.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe deriva acumulada en rollouts largos, habitual en modelos autorregresivos de predicción.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar los términos del artículo y del repositorio de código para condiciones adicionales.
- Requiere GPU y las dependencias `torch`, `timm` y `xformers`; no hay una ruta de inferencia en CPU documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Francismj/sonny
- Artículo: https://arxiv.org/abs/2603.21284
- Código: https://github.com/jmj2316/Sonny
