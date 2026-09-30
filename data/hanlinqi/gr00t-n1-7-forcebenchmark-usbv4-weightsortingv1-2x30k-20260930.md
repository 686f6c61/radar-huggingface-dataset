# HanLinqi/GR00T-N1.7-ForceBenchmark-USBv4-WeightSortingV1-2x30K-20260930

## Resumen

Este repositorio agrupa tres checkpoints independientes de política robótica obtenidos por ajuste fino (*fine-tuning*) del modelo base `nvidia/GR00T-N1.7-3B`, un modelo visión-lenguaje-acción (VLA) de NVIDIA para habilidades humanoides generalistas. El autor, HanLinqi, publica aquí dos líneas de experimentos orientadas a manipulación con realimentación de fuerza: inserción de conectores USB (variante V4, rama A) y clasificación/ordenación de pesos (*WeightSorting*, ramas A y B). Cada checkpoint incluye su propio procesador, estadísticas de normalización, configuración y shards de pesos, y se debe cargar desde su subdirectorio correspondiente.

Los tres entrenamientos parten del mismo base, usan un historial de observación/estado de 2 pasos, un horizonte de acción de 10 pasos, un codificador temporal de fuerza basado en Transformer con enrutamiento MoE *top-1* y 30.000 pasos de optimizador. Las diferencias entre variantes están en el historial de fuerza (6, 8 y 16 pasos), el número de expertos MoE (4 en USB V4-A y WeightSorting-A, 6 en WeightSorting-B), el ancho de la representación de fuerza (384 frente a 512), el uso de LoRA de rango 16 en el DiT de acción y el ajuste o congelación del codificador visual.

La relevancia del repositorio es acotada y muy específica: no es un modelo de propósito general, sino un conjunto de políticas experimentales de manipulación sensible al contacto, útil para quien investigue control basado en fuerza sobre la familia Isaac GR00T. No se incluye ningún resultado de evaluación, el repositorio no declara licencia y no tiene descargas ni *likes*, por lo que debe considerarse material de investigación sin validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) derivado de `nvidia/GR00T-N1.7-3B`; se añade un codificador temporal de fuerza tipo Transformer con enrutamiento MoE top-1, LoRA de rango 16 sobre el DiT de acción y, en USB V4-A, ajuste de los 2 últimos bloques visuales |
| Parametros totales | No disponible con precisión. El base es de 3B según su nombre (`nvidia/GR00T-N1.7-3B`); los checkpoints añaden adaptadores LoRA y cabezas MoE de fuerza cuyo recuento no se documenta |
| Parametros activos | Modelo MoE parcial: el enrutamiento top-1 se aplica al codificador de fuerza con 4 o 6 expertos según el checkpoint. No se especifica el número de parámetros activos |
| Longitud de contexto | No disponible. Como valores relacionados: historial de observación/estado de 2 pasos y horizonte de acción de 10 pasos |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni fp8 |
| Idiomas soportados | No disponible. El modelo base acepta instrucciones en lenguaje natural, pero no se especifica el conjunto de idiomas |
| Licencia | No disponible en el repositorio. Fuentes externas describen GR00T N1.7 como modelo abierto con licencia comercializable, pero la licencia de este *fine-tune* no se declara |
| Formato de pesos | safetensors, organizados en shards por checkpoint, junto con configuración, procesador, estadísticas y un `manifest.json` con tamaños y hashes SHA-256 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `nvidia/GR00T-N1.7-3B`, un VLA de la familia NVIDIA Isaac GR00T que mapea observaciones visuales e instrucciones en lenguaje natural a acciones continuas de robot. Sobre esa base, este repositorio introduce tres modificaciones documentadas: (1) un codificador temporal de fuerza, es decir, una pila que consume historiales de fuerza de 6, 8 o 16 pasos; (2) una capa MoE con enrutamiento *top-1* sobre ese codificador, con 4 expertos y ancho 384 en USB V4-A y WeightSorting-A, y 6 expertos y ancho 512 en WeightSorting-B; y (3) adaptadores LoRA de rango 16 en el DiT de acción. En USB V4-A se ajustaron además los dos últimos bloques del codificador visual, mientras que en las dos variantes de WeightSorting el codificador visual permaneció congelado.

El entrenamiento se realizó durante 30.000 pasos de optimizador en los tres casos, con historial de observación/estado de 2 y horizonte de acción de 10. El tamaño de lote efectivo fue de 128 para USB V4-A y de 32 para ambas variantes de WeightSorting. USB V4-A emplea además límites de controlador fijos para acciones 6D del efector final, y WeightSorting usa normalización de acciones de referencia. Los conjuntos de datos y los procesadores de salida son distintos entre USB y WeightSorting, pero no se nombran ni se cuantifican en la información disponible; tampoco se documenta si hubo etapas de RLHF, DPO o aprendizaje por imitación con datos teleoperados, ni el número de tokens, trayectorias o episodios utilizados.

## Capacidades

- Generación de acciones motoras continuas a partir de observaciones visuales, estado del robot e instrucciones en lenguaje natural, con horizonte de predicción de 10 pasos.
- Manipulación sensible al contacto mediante realimentación de fuerza: los checkpoints consumen historiales de fuerza de 6, 8 o 16 pasos según la variante.
- Dos dominios de tarea específicos: inserción de conectores USB (variante V4, rama A) y clasificación/ordenación de pesos por masa (variantes V1, ramas A y B).
- Acciones de efector final en 6 grados de libertad con límites de controlador fijos en el caso de USB V4-A.
- Dos configuraciones de capacidad del codificador de fuerza (4 expertos/ancho 384 y 6 expertos/ancho 512), pensadas para comparar el efecto del ancho y del número de expertos MoE.
- Ajuste eficiente mediante LoRA de rango 16 en el DiT de acción, lo que permite integrar los adaptadores sobre el base sin reentrenar todos los pesos.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso explícito, modo de pensamiento, visión generalista, audio ni capacidades multilingües más allá de la instrucción en lenguaje natural del modelo base.

## Casos de uso

- Inserción de conectores USB en línea de ensamblaje: la variante `usb_v4/A/checkpoint-30000` está entrenada específicamente para esta tarea con un historial de fuerza de 6 pasos y límites de controlador fijos para acciones 6D, lo que la hace adecuada para experimentos de inserción con tolerancias ajustadas donde la realimentación táctil es determinante.
- Clasificación de piezas por peso en células de manipulación: las variantes `weightsorting_v1/A` y `weightsorting_v1/B` abordan explícitamente el *weight sorting*, de modo que pueden usarse para evaluar el agarre y la colocación de objetos de masa distinta con control basado en fuerza.
- Estudio comparativo del historial de fuerza: al disponer de ventanas de 6, 8 y 16 pasos sobre el mismo base, el repositorio permite medir experimentalmente cómo afecta la longitud del historial de fuerza a la estabilidad de la política.
- Ablación de enrutamiento MoE en control táctil: la comparación entre 4 expertos con ancho 384 y 6 expertos con ancho 512 permite estudiar el compromiso entre capacidad del codificador de fuerza y coste de inferencia.
- Ajuste específico de tarea con recursos limitados: el uso de LoRA de rango 16 en el DiT de acción y un lote efectivo de 32 (WeightSorting) hace viable reproducir el esquema de adaptación para nuevas tareas con presupuesto de cómputo moderado.
- Congelación del codificador visual en tareas guiadas por fuerza: las dos variantes de WeightSorting mantienen congelado el *backbone* visual, un patrón útil cuando se quiere preservar la percepción preentrenada y depender principalmente de la señal de fuerza.
- Base de partida para nuevos ajustes o para destilación: al ser checkpoints *model-only* de 30.000 pasos, pueden servir como inicialización para experimentos posteriores de RL o de imitación sobre tareas de ensamblaje.
- Reproducción y auditoría de experimentos: el `manifest.json` con tamaños y hashes SHA-256 facilita verificar la integridad de los pesos en entornos de investigación con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de los tres checkpoints indica explícitamente que no se incluye ningún resultado de evaluación, y la información proporcionada no aporta métricas de éxito de inserción, tasa de acierto en clasificación de pesos, latencia de inferencia ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (valores estimados a partir del tamaño del repositorio, no confirmados por el autor): cada checkpoint ocupa aproximadamente 6-7 GB de pesos en bf16/fp16, dado que el repositorio completo son 20,9 GB para tres checkpoints; sumando el codificador visual, la torre de lenguaje y las activaciones, conviene prever 10-12 GB de VRAM por checkpoint en precisión completa.
- GPU de centro de datos recomendadas: A100 (40 o 80 GB), H100, L40S o L4, adecuadas si se quieren ejecutar los tres checkpoints en paralelo o emplear lotes grandes.
- GPU de consumo: un checkpoint en bf16 debería caber en una RTX 4090 (24 GB) o RTX 4080 (16 GB) con margen razonable; en tarjetas de 12 GB el encaje es ajustado y no hay pesos cuantizados publicados que lo faciliten.
- Opciones de despliegue: el ecosistema de referencia es NVIDIA Isaac GR00T (repositorio `NVIDIA/Isaac-GR00T`), que proporciona la carga e inferencia del modelo base. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni existen variantes GGUF en el repositorio.
- Latencia y throughput: no disponibles. El horizonte de acción de 10 pasos sugiere ejecución en bucle cerrado de control, pero no se publica frecuencia de inferencia, tiempo por paso ni tasa de refresco alcanzable.
- Almacenamiento: 20,9 GB para el repositorio completo; si solo se necesita una tarea, conviene descargar únicamente el subdirectorio del checkpoint correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HanLinqi/GR00T-N1.7-ForceBenchmark-USBv4-WeightSortingV1 (este repo) | Base 3B mas adaptadores LoRA y MoE de fuerza no cuantificados | No disponible; horizonte de accion 10, historial de observacion 2 | Insercion USB y clasificacion de pesos con realimentacion de fuerza | No declarada | HuggingFace, 0 descargas, 3 checkpoints |
| HanLinqi/GR00T-N1.7-ForceBenchmark-MoE-weightsorting-MLP-30K-20260926 | Base 3B mas adaptadores | No disponible | WeightSorting v1 con cabecera MLP en lugar de la configuracion de este repo | No declarada | HuggingFace |
| nvidia/GR00T-N1.7-3B (modelo base) | 3B | No disponible en la informacion proporcionada | VLA generalista para habilidades humanoides | Descatalogado como comercializable segun fuentes externas | HuggingFace y ecosistema Isaac GR00T |
| NVIDIA Isaac GR00T N1.6 / N1.5 (versiones previas) | No disponible | No disponible | VLA para robotica humanoide | No disponible | Repositorio GitHub `NVIDIA/Isaac-GR00T` |

No se dispone de datos de rendimiento de ninguno de los modelos comparados, por lo que la comparación se limita a parámetros, tarea, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de resultados de evaluación: no hay métricas de éxito en inserción USB ni en clasificación de pesos, ni comparación con el modelo base, por lo que no es posible afirmar que estos *fine-tunes* superen a `nvidia/GR00T-N1.7-3B`.
- Licencia no declarada: el repositorio no especifica licencia. Aunque fuentes externas describen GR00T N1.7 como comercializable, el uso comercial de estos checkpoints concretos queda sin cobertura legal explícita y debe consultarse con el autor.
- Idiomas no documentados: se desconoce qué lenguas aceptan las instrucciones y si el ajuste fino ha degradado la comprensión multilingüe del base.
- Sesgos y generalización limitados por diseño: los tres checkpoints están entrenados para dos tareas concretas (inserción de USB y ordenación de pesos) con hardware, controlador y distribución de objetos específicos; el rendimiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación y de acciones erróneas en bucle abierto: como todo modelo VLA, puede generar trayectorias plausibles pero incorrectas ante instrucciones ambiguas o escenas fuera de distribución, con el riesgo físico que implica en un robot real.
- Sin cuantizaciones publicadas: no hay GGUF ni formatos de 4 u 8 bits, lo que limita el despliegue en hardware de gama baja y en entornos con restricciones de memoria.
- Datos de entrenamiento no descritos: no se detallan los conjuntos de datos, su procedencia ni los procesadores de salida, lo que dificulta la reproducibilidad y la auditoría de posibles sesgos en la recogida de datos.
- Repositorio sin tracción: 0 descargas y 0 *likes* en el momento de la consulta, sin validación por parte de terceros.
- Propósito experimental: los checkpoints son *model-only* (sin estado del optimizador), por lo que reanudar el entrenamiento exactamente desde ese punto no es posible con los ficheros publicados.
- Marcas temporales de 2026 en los metadatos del repositorio; conviene verificar la vigencia y el mantenimiento del proyecto antes de integrarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HanLinqi/GR00T-N1.7-ForceBenchmark-USBv4-WeightSortingV1-2x30K-20260930
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio relacionado del mismo autor (WeightSorting MoE MLP, 30K): https://huggingface.co/HanLinqi/GR00T-N1.7-ForceBenchmark-MoE-weightsorting-MLP-30K-20260926
- NVIDIA Isaac GR00T (código y documentación): https://github.com/NVIDIA/Isaac-GR00T
- Paper de GR00T N1: https://arxiv.org/abs/2503.14734
- Entrada enciclopédica sobre GR00T N1.7: https://baike.baidu.com/en/item/GR00T%20N1.7/4789483
