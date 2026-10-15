# Donghyun1228/pi05-libero-support-probe-source-target-lora01-view-small-n50000-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de política robótica visomotora (visuomotor policy) especializado en el benchmark LIBERO, publicado por el usuario Donghyun1228 bajo el framework openpi (familia pi0.5). No es un modelo de lenguaje: es un modelo de acción que recibe observaciones visuales y estado del robot y emite comandos de control de 7 coordenadas (6 de movimiento más gripper). El repositorio ocupa 6,9 GB y se distribuye con licencia Apache-2.0.

El checkpoint es el resultado de un experimento de adaptación denominado "support-near random-probe data replacement: view_small". Se parte de un modelo fuente (`pi05-libero-support-probe-source-n50000-10000`) y se realiza una adaptación al dominio objetivo con 50.000 fotogramas seleccionados, 1.000 actualizaciones, batch de 32 y semilla 42. La adaptación congela el LLM, actualiza por completo la torre de visión y aplica LoRA de rango 01 únicamente al action expert, con un multiplicador posterior al optimizador Adam de 0,1.

Su relevancia es fundamentalmente metodológica: documenta de forma explícita los commits, la inicialización, la normalización histórica y el protocolo de evaluación, lo que permite reproducir el experimento. El resultado declarado en la model card es de 1.816 éxitos sobre 2.000 episodios (40 tareas, 50 intentos por tarea, semilla 7), es decir, un 90,8 % de tasa de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (framework openpi, familia pi0.5: política visomotora con LLM y action expert diferenciados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la inferencia se exporta y ejecuta en BF16 |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible; exportación "raw step999" en BF16, repositorio de 6,9 GB |

## Arquitectura y entrenamiento

La model card no detalla la topología interna, pero sí los componentes que se entrenan y los que permanecen congelados. La adaptación se aplica sobre un modelo fuente ya entrenado, con el LLM completamente congelado, la torre de visión actualizada en su totalidad y un módulo "action expert" adaptado mediante LoRA de rango 01 (identificador `lora01`), con un multiplicador posterior a Adam de 0,1. Se preservan la normalización histórica del modelo fuente y el encoder de muñeca correspondiente. El export es el paso 999 en formato BF16 y la evaluación se realizó con MuJoCo 3.2.3.

Un elemento central del experimento es el uso de un modelo de dinámica inversa (inverse dynamics model, IDM) para la selección de datos y el sondeo de soporte ("support-near random-probe"). La pérdida del IDM excluye la coordenada 6 (gripper) y promedia las 31 coordenadas de acción restantes con padding; en cambio, las entradas y salidas de la política, así como el control del gripper durante la evaluación, conservan las siete coordenadas del robot. Los datos de adaptación proceden del dataset `libero-support-random-waypoint-300k-20261015` (commit `32ed215baf01af7e82f927a62b108873aa70bd19`), del que se seleccionaron 50.000 fotogramas. El modelo fuente fue reentrenado durante 10.000 actualizaciones y queda fijado en el commit `ea4f0bb2001e12d701af8a294f91da437e857f55`.

El protocolo de evaluación emplea 40 tareas con 50 intentos cada una, semilla 7, ocho clientes por GPU y una fuente de aleatoriedad compartida en el servidor para la política. La model card indica que se incluye evidencia exacta de entrada, inicialización y exportación.

## Capacidades

- Generación de acciones de control robótico de 7 coordenadas (6 de movimiento más apertura/cierre del gripper) a partir de observaciones visuales y estado.
- Manipulación en el benchmark LIBERO, con evaluación sobre 40 tareas de simulación en MuJoCo 3.2.3.
- Modelado auxiliar de dinámica inversa (IDM) sobre 31 coordenadas de acción, excluyendo explícitamente la coordenada del gripper.
- Adaptación eficiente de parámetros mediante LoRA sobre el action expert, con el LLM congelado.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso en lenguaje ni capacidades multilingües.
- No se documentan capacidades de visión general (captioning, VQA); la torre de visión se emplea exclusivamente como entrada para el control motor.
- No se documenta modo "thinking", entrada o salida de audio, ni generación de texto libre.

## Casos de uso

- Reproducción de experimentos de selección de datos en robótica: el repositorio fija commits, semillas y protocolo de exportación, lo que permite reproducir exactamente la adaptación "support-near random-probe" sobre 50.000 fotogramas.
- Investigación en adaptación con LoRA de bajo rango: sirve como referencia para estudiar el efecto de congelar el LLM y actualizar solo la visión más un LoRA de rango 01 en el action expert.
- Comparación de estrategias de congelación de capas: al mantener el LLM congelado y liberar la torre de visión, este checkpoint es un punto de medida frente a variantes que congelan la visión o entrenan más módulos.
- Estudio del papel del IDM en el filtrado de datos: la pérdida del IDM definida sobre 31 coordenadas (excluyendo el gripper) es directamente reutilizable para analizar cómo la exclusión de una dimensión afecta a la selección de trayectorias.
- Benchmark de políticas sobre LIBERO: con 1.816/2.000 éxitos declarados, sirve como línea base numérica para comparar nuevas políticas bajo el mismo protocolo (40 tareas, 50 intentos, semilla 7).
- Base para fine-tuning en dominios propios dentro de simulación: el pipeline de adaptación de 1.000 actualizaciones con batch 32 es un coste bajo que puede replicarse sobre otros conjuntos de trayectorias.
- Auditoría de reproducibilidad: la inclusión de commits concretos del modelo fuente y del dataset permite verificar de forma independiente la cadena de inicialización.

## Benchmarks y rendimiento

| Evaluacion | Entorno | Tareas | Intentos por tarea | Semilla | Resultado |
|---|---|---|---|---|---|
| LIBERO (tasa de exito) | MuJoCo 3.2.3, 8 clientes/GPU | 40 | 50 | 7 | 1.816 / 2.000 (90,8 %) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites de lenguaje, y no serian aplicables a un modelo de control motor. Tampoco se proporcionan desgloses por tarea, comparaciones contra el modelo fuente ni intervalos de confianza.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia aritmetica aproximada, un repositorio de 6,9 GB compatible con pesos BF16 correspondería a unos 3.450 millones de parametros, pero el repositorio puede contener artefactos adicionales y la cifra real de parametros no esta confirmada.
- GPU recomendadas: no disponible. La evaluacion declara ocho clientes por GPU, lo que indica ejecucion concurrente de varios entornos de simulacion sobre una misma GPU, sin especificar el modelo.
- Cabe en GPU de consumo: no disponible. No se indica ningún requisito minimo de memoria ni una GPU concreta (RTX 4090, A100, H100 u otras).
- Opciones de despliegue: libreria `openpi` para carga del checkpoint y evaluacion en MuJoCo 3.2.3 con inferencia en BF16. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Rol | Actualizaciones | Datos de adaptacion | Resultado declarado | Licencia |
|---|---|---|---|---|---|
| Este modelo (`...target-lora01-view-small-n50000-1000`) | Adaptacion objetivo con LoRA en action expert | 1.000 | 50.000 fotogramas seleccionados | 1.816 / 2.000 (90,8 %) | Apache-2.0 |
| `Donghyun1228/pi05-libero-support-probe-source-n50000-10000` | Modelo fuente, commit `ea4f0bb2...` | 10.000 | no disponible | no disponible | no disponible |
| Base openpi / pi0.5 | Modelo de partida de la familia | no disponible | no disponible | no disponible | no disponible |
| Otras politicas para LIBERO (por ejemplo OpenVLA y similares) | Politicas visomotoras comparables por tarea | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con la informacion proporcionada: no se aportan metricas del modelo fuente, ni del modelo base, ni de terceros bajo el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.
- Ausencia de model card extensa y de paper asociado: no se especifican parametros, contexto, composicion del dataset ni hiperparametros completos.
- Especificidad de dominio: el entrenamiento y la evaluacion se limitan a LIBERO y a simulacion con MuJoCo 3.2.3. No hay evidencia de transferencia a robots reales ni de generalizacion fuera de las 40 tareas evaluadas.
- Riesgo de sobreajuste al conjunto de tareas de LIBERO y a la distribucion de los 50.000 fotogramas seleccionados.
- Dependencia de la normalizacion historica y del encoder de muñeca del modelo fuente: cambiar de modelo de partida o de estadisticas de normalizacion invalida la reproduccion.
- La perdida del IDM excluye la coordenada 6 (gripper) mientras que la politica y el control de evaluacion usan las 7 coordenadas, lo que introduce una asimetria entre el objetivo auxiliar y el objetivo final.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de acciones fisicamente invalidas o inestables fuera de la distribucion de entrenamiento.
- Sesgos: no se documenta ningun analisis de sesgo demografico, visual ni de condiciones de iluminacion o textura.
- Idioma: no aplica, el modelo no procesa ni genera lenguaje natural.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el usuario debe verificar las licencias del modelo base openpi/pi0.5 y del dataset utilizado, no detalladas aqui.
- Fecha de creacion indicada como 2026-10-15: conviene verificar la coherencia temporal del repositorio antes de integrarlo en un pipeline.
- No se documentan requisitos de VRAM, latencia ni throughput, por lo que el dimensionamiento para produccion requeriria una medicion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-target-lora01-view-small-n50000-1000-20261015
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015
- Dataset de adaptacion: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-20261015
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan ninguna relacion con el modelo ni con el framework openpi.
