# Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw20-n50000-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de investigación publicado por el usuario Donghyun1228 bajo la librería `openpi`, orientado a robótica y, en concreto, al benchmark LIBERO. Por la nomenclatura del identificador (`pi05-libero-...`) y por la propia model card, que menciona un "LLM frozen" y un "action expert" entrenable, se trata de una adaptación de la familia de modelos visión-lenguaje-acción (VLA) π₀.₅ de Physical Intelligence, aunque la model card no detalla explícitamente la arquitectura base.

El artefacto concreto es una adaptación de un modelo de dinámica inversa (IDM) sobre el objetivo, con sustitución de datos tipo "support-near random-probe" y variante de orientación `yaw20`. Se entrenó sobre 50.000 fotogramas seleccionados durante 1.000 actualizaciones con batch 32 y semilla 42, partiendo de un modelo fuente reentrenado durante 10.000 actualizaciones. La evaluación declarada por el autor es de 1.578 éxitos sobre 2.000 ensayos en LIBERO (40 tareas, 50 ensayos por tarea, semilla 7).

Su relevancia es acotada y muy específica: se trata de un artefacto de reproducibilidad con 0 descargas y 0 "likes", pensado para auditar una receta experimental concreta (congelación del LLM, actualización completa de la torre de visión, ajuste del action expert y pérdida IDM restringida a 31 de las 32 coordenadas de acción) más que para uso general en producción. No se publican datos de parámetros, contexto ni idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA de la familia π₀.₅ (backbone vision-lenguaje congelado mas "action expert" entrenable) segun la model card y la libreria `openpi`; no se detalla la arquitectura exacta |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la model card declara inferencia en BF16. No se publican pesos GGUF ni cuantizaciones de menor precision |
| Idiomas soportados | no disponible (el campo de idiomas de HuggingFace no esta cumplimentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado en la model card; se describe como "raw step999 export". Tamano del repositorio: 7,7 GB |

## Arquitectura y entrenamiento

El entrenamiento descrito corresponde a una adaptación de dinámica inversa (IDM) sobre el objetivo, con reemplazo de datos "support-near random-probe" y variante de orientación `yaw20`. El modelo fuente fue reentrenado durante 10.000 actualizaciones (`Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015`, commit `ea4f0bb2001e12d701af8a294f91da437e857f55`) y este checkpoint se obtiene tras 1.000 actualizaciones adicionales sobre 50.000 fotogramas seleccionados, con batch 32 y semilla 42. El conjunto de datos empleado es `Donghyun1228/libero-support-random-waypoint-300k-yaw20-20261015`, en el commit `c2740cc2b3ee69ee1488d835f4358b33c255cdb8`.

La receta de ajuste es selectiva: el LLM permanece congelado, la torre completa de visión se actualiza y el action expert se entrena en la configuración "full10" con un multiplicador posterior al optimizador Adam de 10. La pérdida de la IDM excluye la coordenada 6 (pinza) y promedia las 31 coordenadas de acción restantes con relleno, mientras que las entradas y salidas de la política y el control de pinza en evaluación conservan las siete coordenadas del robot. Se preservan la normalización histórica y el encoder de muñeca del modelo fuente, un detalle crítico para la reproducibilidad. La exportación es de los pesos crudos del paso 999, con inferencia en BF16 y evaluación en MuJoCo 3.2.3.

## Capacidades

- Generación de acciones robóticas en el entorno LIBERO a partir de observaciones visuales y consignas de tarea, en el marco de un modelo visión-lenguaje-acción.
- Predicción de dinámica inversa: estimación de la acción a partir de transiciones de estado, con la pérdida restringida a 31 coordenadas (excluye la pinza).
- Control de pinza en la política y en la evaluación, con las siete coordenadas del robot retenidas en entrada, salida y control del efector.
- Adaptación de objetivo ("target adaptation") sobre un modelo fuente ya entrenado, con normalización histórica y encoder de muñeca heredados.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no se documentan modos de pensamiento, visión general, audio ni decodificación especulativa; la única modalidad confirmada es visión más acción robótica.

## Casos de uso

- Reproducción de experimentos de adaptación IDM: el repositorio incluye evidencia exacta de entrada, inicialización y exportación, y fija los commits del modelo fuente y del dataset, lo que permite replicar la receta paso 999 con semilla 42.
- Auditoría de recetas de ajuste selectivo: al congelar el LLM y actualizar solo visión y action expert en proporción "full10", sirve para estudiar el efecto de congelar el backbone lingüístico en tareas de manipulación.
- Comparación de variantes de orientación: al estar etiquetado como `yaw20`, se puede contrastar contra las variantes `yaw30` del mismo autor para medir el impacto del rango de guiñada en la tasa de éxito.
- Evaluación estandarizada en LIBERO: el protocolo declarado (40 tareas, 50 ensayos por tarea, 2.000 ensayos totales, 8 clientes por GPU) es reutilizable como línea base para nuevos checkpoints de la misma familia.
- Estudio de sustitución de datos ("data replacement"): la selección de 50.000 fotogramas sobre un dataset de 300.000 waypoints aleatorios permite analizar cuánto dato se puede descartar sin degradar la política.
- Punto de partida para fine-tuning propio en robótica con `openpi`: al estar bajo Apache 2.0 y en la librería `openpi`, puede servir como inicialización para ajustes posteriores sobre dominios de manipulación relacionados.
- Análisis de errores de política: la tasa de fallo declarada (422 de 2.000 ensayos) ofrece un conjunto concreto de casos fallidos para inspección cualitativa.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO (exito de tarea) | Semilla 7, 40 tareas, 50 ensayos por tarea, 8 clientes por GPU | 1578/2000 exitos (78,95 %) |

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo es la tasa de éxito en LIBERO indicada arriba, que procede de la model card del autor y no ha sido verificada de forma independiente.

## Requisitos de hardware

- El repositorio ocupa 7,7 GB. Si ese tamaño corresponde íntegramente a pesos en BF16 (2 bytes por parámetro), implicaría del orden de 3.500-3.800 millones de parámetros, estimación no confirmada por el autor.
- VRAM estimada para inferencia: no disponible de forma oficial. Como orientación basada en el tamaño del repositorio, los pesos en BF16 exigirían alrededor de 8 GB de VRAM solo para pesos, más el coste de activaciones y del bucle de decodificación de acciones, lo que sitúa el requisito real por encima de esa cifra.
- GPU recomendadas: no disponible. El protocolo de evaluación descrito (8 clientes por GPU) apunta a GPU de centro de datos para poder paralelizar, aunque no se especifica el modelo concreto (A100, H100 u otros).
- Encaje en GPU de consumo: no confirmado. No se publican cuantizaciones en GGUF ni en 8/4 bits, por lo que el despliegue en tarjetas de consumo no está soportado por artefactos publicados.
- Opciones de despliegue: la librería declarada es `openpi`, que según la documentación del proyecto Physical-Intelligence/openpi ofrece soporte dual en JAX/Flax y PyTorch, con carga unificada de formatos LeRobot y RLDS. La evaluación se realizó en MuJoCo 3.2.3. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor solo indica que la aleatoriedad de la política usa un flujo compartido en el servidor y que la evaluación se repartió entre 8 clientes por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`pi05-libero-support-probe-source-target-full10-yaw20-n50000-1000-20261015`) | no disponible | no disponible | 1578/2000 en LIBERO (78,95 %) | Apache 2.0 | HuggingFace, 7,7 GB, 0 descargas |
| `Donghyun1228/pi05-libero-b200-idm-full10-yaw20-1000-20261012` (mismo autor) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| `Donghyun1228/pi05-libero-b200-full-probe-fixed-yaw30-1000-20261013` (mismo autor) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| `lerobot/pi05_libero_base` (modelo base π₀.₅ para LIBERO) | no disponible | no disponible | no disponible | no disponible en la informacion recogida | ModelScope / LeRobot |

La comparación con alternativas externas a la familia π₀.₅ no es posible con los datos disponibles: no se han proporcionado cifras de parámetros, contexto ni rendimiento de otros modelos VLA de referencia.

## Limitaciones y advertencias

- Artefacto de investigación sin validación externa: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluaciones independientes conocidas.
- Tasa de fallo no trivial: 422 de 2.000 ensayos fallidos en el propio protocolo del autor (21,05 %), medidos en simulación con MuJoCo, no en robot real.
- Dependencia fuerte de assets del modelo fuente: la normalización histórica y el encoder de muñeca del modelo fuente se preservan, por lo que reutilizar este checkpoint sin esos artefactos puede invalidar los resultados.
- Acoplamiento a commits concretos: el modelo fuente y el dataset se referencian por hash de commit, lo que condiciona la reproducibilidad exacta.
- Sesgo de dominio: el entrenamiento y la evaluación se limitan al benchmark LIBERO y a la distribución `yaw20`; no hay evidencia de generalización a otros robots, tareas o entornos del mundo real.
- Idiomas soportados: no disponible. No se puede afirmar cobertura multilingüe de las consignas.
- Riesgo de alucinación: el concepto habitual de alucinación textual no aplica directamente, pero sí el fallo silencioso de la política, que puede producir acciones plausibles pero incorrectas sin señal de incertidumbre documentada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base π₀.₅ y los assets heredados pueden tener condiciones propias que no se detallan en esta model card.
- Sin cuantizaciones publicadas: no hay pesos GGUF ni versiones de baja precisión, lo que dificulta el despliegue en hardware limitado.
- La model card no documenta límites de contexto, parámetros ni idiomas, lo que impide dimensionar el sistema antes de descargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw20-n50000-1000-20261015
- Modelo fuente (10.000 actualizaciones): https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015
- Dataset: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-yaw20-20261015
- Checkpoint relacionado `pi05-libero-b200-idm-full10-yaw20-1000-20261012`: https://huggingface.co/Donghyun1228/pi05-libero-b200-idm-full10-yaw20-1000-20261012
- Checkpoint relacionado `pi05-libero-b200-full-probe-fixed-yaw30-1000-20261013`: https://huggingface.co/Donghyun1228/pi05-libero-b200-full-probe-fixed-yaw30-1000-20261013
- Modelo base π₀.₅ para LIBERO (LeRobot): https://www.modelscope.cn/models/lerobot/pi05_libero_base
- Repositorio del proyecto openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Documentación del proyecto openpi (DeepWiki): https://deepwiki.com/Physical-Intelligence/openpi
- Repositorio con ejemplos de LIBERO para π₀.₅: https://github.com/Integer003/openpi05/tree/main/examples/libero
