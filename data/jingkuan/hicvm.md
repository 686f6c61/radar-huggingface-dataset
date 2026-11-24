# Jingkuan/HiCVM

## Resumen

HiCVM es un modelo de visión-lenguaje-acción (VLA) orientado a manipulación robótica con dependencia histórica, desarrollado por Jingkuan. Se construye sobre π0.5 (backbone visión-lenguaje PaliGemma con un experto de acción de flujo de coincidencia Gemma-300M) y se publica como un ajuste fino sobre el conjunto de datos MS-ViM. Su propuesta central es una memoria visual jerárquica y compacta que permite al robot recordar posiciones iniciales de objetos, contar acciones ya realizadas y seguir objetos ocluidos bajo un presupuesto fijo de tokens de memoria visual.

El modelo resuelve el problema de las tareas robóticas en las que la decisión actual depende de observaciones pasadas, algo que los VLA convencionales abordan mal al limitarse a la observación inmediata o al coste prohibitivo de mantener todo el historial de frames en el contexto. HiCVM comprime ese historial en tres niveles (corto, medio y largo plazo) con un máximo por defecto de 500 tokens de memoria visual, sin alterar la longitud de contexto del modelo visión-lenguaje.

Se distribuye bajo licencia Apache 2.0, con un checkpoint JAX/Orbax en el paso 99.999, código de entrenamiento y evaluación, y el benchmark MS-ViM (ManiSkill) que cubre ordenación temporal, recuerdo espacial, conteo de acciones repetidas y seguimiento en oclusión. El modelo reporta una tasa de éxito global del 84,2 % en MS-ViM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5: backbone visión-lenguaje PaliGemma (SigLIP) + experto de acción de flujo de coincidencia Gemma-300M |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el contexto del VLM se mantiene invariante; memoria visual limitada a 500 tokens por defecto) |
| Tipos de cuantizacion | no disponible (checkpoint JAX/Orbax en precisión de entrenamiento) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | JAX/Orbax (directorio `params/`); código y configuración en `HiCVM.zip` |

## Arquitectura y entrenamiento

HiCVM parte de π0.5 y añade un módulo de memoria visual jerárquica que actúa sobre las representaciones del backbone PaliGemma. La memoria se organiza en tres niveles: memoria a corto plazo, que conserva todas las regiones agrupadas de los frames recientes para un posicionamiento fino de la acción; memoria a medio plazo, que retiene mediante selección dinámica espaciotemporal (SDS) las regiones de interacción con cambios notables y coherencia espacial; y memoria a largo plazo, que agrega evidencia histórica en anclas perceptivas compactas mediante agregación guiada por instrucción (IGA), combinando relevancia respecto a la instrucción y saliencia espaciotemporal. El experto de acción lee los tres niveles mediante modulación adaptativa.

El entrenamiento se realiza por ajuste fino sobre el split `train70_each` de MS-ViM, con lote de 16 y 100.000 pasos por defecto, usando demostraciones existentes sin anotación adicional de keyframes ni supervisión de predicción de keyframes. El repositorio publica el checkpoint del paso 99.999; las estadísticas de normalización de estados y acciones deben recalcularse localmente con el conjunto de entrenamiento. El modelo se apoya en OpenPI, π0.5, PaliGemma, SigLIP y ManiSkill.

## Capacidades

- Manipulación robótica guiada por instrucciones en lenguaje natural (visión-lenguaje-acción).
- Memoria visual a corto, medio y largo plazo bajo un presupuesto fijo de tokens (500 por defecto).
- Recuerdo de posiciones iniciales de objetos tras desplazamientos.
- Conteo de acciones repetidas ya ejecutadas.
- Seguimiento de objetos ocluidos durante la manipulación.
- Ordenación temporal de eventos y recuerdo espacial en tareas de benchmark.
- Inferencia en bucle cerrado sobre observaciones de simulador (cámaras `third_view_camera` y `hand_camera` en ManiSkill).
- Entrada multimodal de imágenes e instrucciones en inglés; salida de acciones motoras.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en texto.

## Casos de uso

- Ensamblaje con conteo de pasos: el robot usa la memoria a largo plazo para llevar la cuenta de tornillos insertados o piezas colocadas y evitar repeticiones u omisiones, apoyándose en las anclas perceptivas agregadas por IGA.
- Recogida tras desplazamiento de objetos: si una pieza se mueve mientras el robot manipula otra, la memoria a corto y medio plazo conserva la posición inicial y permite recuperarla, una capacidad que un VLA de observación única no tiene.
- Manipulación con oclusión: en tareas donde el efector o una caja tapa el objeto objetivo, el seguimiento en oclusión de MS-ViM mantiene la referencia espacial del objeto.
- Clasificación y ordenación de objetos por secuencia: tareas de ordenación temporal en las que el robot debe recordar qué objetos ya ha procesado y en qué orden.
- Investigación en memoria para VLA: el código y la configuración `configs/hicvm.yaml` permiten sustituir o ajustar los niveles de memoria y medir su impacto en MS-ViM, útil para grupos que estudian contextos largos en robótica.
- Evaluación comparativa en ManiSkill: el protocolo `data/test_protocol.json` con semillas fijas permite reproducir los cuatro conjuntos de tareas y comparar variantes del modelo frente a π0.5 base.
- Prototipado de políticas para brazos manipuladores en simulación antes de transferir a hardware, dado que el checkpoint incluye los pesos necesarios para inferencia en bucle cerrado.

## Benchmarks y rendimiento

| Benchmark | Metrica | HiCVM |
|---|---|---|
| MS-ViM (cuatro tareas) | Tasa de exito global | 84,2 % |

No se han publicado en la informacion disponible resultados desglosados por tarea ni comparaciones numéricas con π0.5 u otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 11,9 GB y el checkpoint se distribuye en JAX/Orbax, por lo que se requiere memoria suficiente para el backbone PaliGemma más el experto Gemma-300M y el buffer de memoria visual.
- GPU recomendadas: no disponibles en la información proporcionada; el entorno de entrenamiento y evaluación es JAX con GPU (se usa `GPU_ID` y un entorno JAX GPU compatible).
- Cabe en GPU de consumo: no confirmado; el tamaño del repositorio y la pila JAX/Orbax sugieren viabilidad en GPUs de gama alta con memoria suficiente, pero no se especifica.
- Opciones de despliegue: scripts propios de entrenamiento y evaluación (`train_hicvm.sh`, `evaluate_hicvm.sh`) sobre JAX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluación en bucle cerrado se ejecuta en ManiSkill con semillas de `data/test_protocol.json` y los resultados se agregan en `outputs/hicvm_four_task/four_task_summary.json`.

## Comparativa con modelos similares

| Modelo | Base | Memoria visual | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HiCVM | π0.5 (PaliGemma + Gemma-300M) | Jerarquica, 500 tokens por defecto | no disponible | Apache 2.0 | Hugging Face y ModelScope |
| π0.5 | PaliGemma + experto de accion | Sin modulo de memoria jerarquica documentado | no disponible | no disponible en la informacion | Referenciado como base |
| Otros VLA de robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos de π0.5 ni de otros VLA comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en MS-ViM sobre ManiSkill; la generalización a robots reales u otras tareas no está documentada.
- Solo soporta inglés como idioma de instrucciones.
- Las estadísticas de normalización de estados y acciones no se incluyen y deben recalcularse con el split `train70_each`, lo que añade un paso obligatorio antes de la inferencia.
- El checkpoint publicado corresponde al paso 99.999 y no se documentan variantes intermedias ni curvas de validación.
- El presupuesto de memoria visual (500 tokens por defecto) es finito; tareas con historiales muy largos pueden degradarse y no se reportan experimentos de escalado.
- Riesgo de alucinación y sesgos: no documentados en la model card; al ser un modelo de acción, el riesgo se manifiesta como ejecuciones incorrectas más que como texto inventado.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de π0.5, PaliGemma y SigLIP puede imponer condiciones adicionales que deben verificarse antes de producción.
- La pila de ejecución es JAX/Orbax con ManiSkill y dependencias específicas (`omegaconf`, tokenizador PaliGemma local), lo que limita la portabilidad frente a stacks de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jingkuan/HiCVM
- Modelo en ModelScope: https://www.modelscope.cn/models/Remote666/HiCVM
- Código (HiCVM.zip): https://modelscope.cn/api/v1/models/Remote666/HiCVM/repo?Revision=master&FilePath=HiCVM.zip
- Dataset MS-ViM: https://www.modelscope.cn/datasets/Remote666/MS-ViM
