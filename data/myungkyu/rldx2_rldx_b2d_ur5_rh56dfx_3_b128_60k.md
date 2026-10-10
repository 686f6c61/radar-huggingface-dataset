# Myungkyu/rldx2_rldx_b2d_ur5_rh56dfx_3_b128_60k

## Resumen

rldx2_rldx_b2d_ur5_rh56dfx_3_b128_60k es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado en HuggingFace por el usuario Myungkyu como baseline del proyecto RLDX-2. No es un modelo de lenguaje conversacional: su función es actuar como política de control, tomando imágenes de cámaras, el estado articular del robot y una instrucción de tarea, y emitiendo objetivos articulares absolutos de 14 dimensiones. Se trata de un fine-tuning del modelo base RLWRLD/RLDX-1-PT.

El modelo tiene 6.912.896.320 parámetros (unos 6,9 mil millones) en formato safetensors, con un repositorio de 83,0 GB. Está especializado en el ajuste Bench2Dex, en concreto en la configuración ur5_rh56dfx_3, que combina un brazo UR5 con una mano diestra RH56DFX y demostraciones de teleoperación orientadas a generalización tipo replay.

Su relevancia es acotada y muy específica: se publica como referencia ("vanilla baseline") reproducible para comparar métodos posteriores del proyecto RLDX-2, con adaptadores de evaluación propios. No dispone de licencia declarada, no tiene descargas ni valoraciones, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (modelo visión-lenguaje-acción, VLA); detalles internos de la red no disponibles |
| Parametros totales | 6.912.896.320 (aproximadamente 6,9 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 83,0 GB |
| Modalidades de entrada | imágenes (cabeza + muñeca izquierda + muñeca derecha), estado articular de 14 dimensiones, instrucción de tarea |
| Salida | objetivos articulares absolutos de 14 dimensiones |

## Arquitectura y entrenamiento

La arquitectura de partida es RLDX-1-PT, un modelo VLA del que la model card no detalla la composición interna (número de capas, dimensiones, tipo de encoder visual o mecanismo de fusión). La configuración declarada para el ajuste incluye longitud de vídeo 4 con stride 2, tres vistas de cámara y un horizonte de acción de 50 pasos. El modelo consume imágenes de la cámara de cabeza y de las dos muñecas, un estado articular de 14 dimensiones y la instrucción de la tarea, y produce como salida objetivos articulares absolutos de 14 dimensiones.

El entrenamiento consiste en un fine-tuning sobre el dataset Bench2Dex/teleopdata (exportación propia en formato LeRobot), concretamente sobre el ajuste ur5_rh56dfx_3, con demostraciones de replay-generalization, cuatro vistas y orden articular del registro canónico. Se aplicaron dos técnicas de regularización: enmascarado de ruido en la dimensión de padding (action_noise_mask_dim=24) y state dropout con probabilidad 0,5. El entrenamiento usó un optimizador con batch 128 durante 60.000 pasos; el checkpoint publicado es el final y no incluye el estado del optimizador. El código de referencia corresponde a RLWRLD/RLDX sobre el parche myungkyu/jitter-patch en el commit 21f674b4.

## Capacidades

- Control robótico de manipulación: genera objetivos articulares absolutos de 14 dimensiones a partir de observaciones visuales, estado articular e instrucción.
- Percepción multivista: procesa simultáneamente imágenes de cámara de cabeza y de ambas muñecas.
- Seguimiento de instrucciones de tarea en lenguaje natural (el idioma concreto no está documentado).
- Ejecución con horizonte de acción amplio: predice secuencias de 50 pasos de acción por inferencia.
- Generalización de tipo replay: el ajuste está entrenado sobre demostraciones de replay-generalization del conjunto Bench2Dex.
- Capacidad de fine-tuning posterior sobre nuevas tareas o configuraciones de robot.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, audio ni multilingüismo.

## Casos de uso

- Manipulación con brazo UR5 y mano RH56DFX: el modelo está ajustado exactamente para esta combinación, de modo que puede desplegarse como política de control directa sobre el hardware, consumiendo las tres vistas de cámara y el estado articular de 14 dimensiones.
- Reproducción de tareas teleoperadas: al entrenarse sobre demostraciones de teleoperación de Bench2Dex, permite replicar trayectorias de manipulación capturadas por un operador humano, con el horizonte de acción de 50 pasos como unidad de predicción.
- Baseline de comparación en investigación VLA: sirve como referencia congelada frente a la que medir variantes posteriores del proyecto RLDX-2, usando los adaptadores de evaluación publicados en el repositorio del proyecto.
- Evaluación de generalización visual: al usar tres vistas fijas (cabeza, muñeca izquierda, muñeca derecha) y longitud de vídeo 4 con stride 2, es adecuado para estudiar cómo se degrada el control ante cambios de iluminación, oclusión o posición de cámara.
- Ajuste fino para nuevas tareas de manipulación: la configuración es abierta y puede reentrenarse sobre otros conjuntos de demostraciones teleoperadas manteniendo el esqueleto RLDX-1-PT.
- Estudio de robustez mediante perturbaciones: las técnicas declaradas de enmascarado de ruido en dimensiones de padding y state dropout 0,5 lo convierten en un punto de partida para analizar la tolerancia del modelo a estados incompletos o ruidosos.
- Validación de pipelines de datos LeRobot: al ser una exportación propia de Bench2Dex/teleopdata, puede usarse para verificar que un pipeline de preparación de datos de robótica produce el orden articular canónico esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Estimación de pesos en memoria (solo pesos, sin activaciones ni encoder visual): aproximadamente 25,8 GiB en FP32, 12,9 GiB en FP16/BF16, 6,4 GiB en INT8 y 3,2 GiB en INT4.
- Repositorio de 83,0 GB en disco, muy por encima de la estimación de pesos en un solo formato, lo que sugiere múltiples archivos o formatos adicionales no documentados.
- GPU recomendadas: no documentadas por el autor. Por tamaño de pesos, una GPU con 24 GB de VRAM (por ejemplo RTX 4090 o A10G) es el mínimo razonable para inferencia en FP16, aunque el procesamiento de tres flujos de vídeo y las activaciones pueden elevar el consumo.
- GPU de gama profesional (A100 40/80 GB, H100) para entrenamiento o fine-tuning con batch 128, dado el coste de memoria de estados de optimizador y activaciones.
- Opciones de despliegue: no documentadas. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; el repositorio apunta a adaptadores de evaluación propios del proyecto RLDX-2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rldx2_rldx_b2d_ur5_rh56dfx_3_b128_60k | 6,9 mil millones | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| RLWRLD/RLDX-1-PT (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos VLA de tamano comparable (por ejemplo OpenVLA o pi-zero) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no verificado |

No se dispone en la información proporcionada de datos verificables de contexto, rendimiento, licencia o disponibilidad de alternativas comparables, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial, por lo que su empleo en producción conlleva riesgo legal.
- Repositorio sin tracción: 0 descargas y 0 valoraciones, sin validación externa de resultados ni de reproducibilidad.
- Naturaleza de baseline: el propio autor lo describe como "vanilla baseline" del proyecto RLDX-2, es decir, un punto de referencia, no un modelo final optimizado.
- Ausencia total de benchmarks: no hay métricas de éxito de tarea, tasa de agarre ni comparaciones cuantitativas publicadas.
- Acoplamiento al hardware: el ajuste es específico para la configuración ur5_rh56dfx_3 (brazo UR5 con mano RH56DFX), cuatro vistas y orden articular del registro canónico; usarlo con otro robot, otro número de cámaras u otro orden de articulaciones exigiría reentrenamiento.
- Entradas fijas: espera 14 dimensiones de estado articular y produce 14 dimensiones de acción; no admite variaciones de dimensionalidad sin ajuste.
- Riesgo de fallo en ejecución física: al ser una política de control sobre hardware real, los errores de predicción se traducen en movimientos incorrectos, con riesgo de daño material; se recomienda limitación de par, parada de emergencia y validación en simulación.
- Cobertura de idiomas no documentada: no puede asumirse que las instrucciones de tarea funcionen en castellano u otros idiomas distintos de los usados en el conjunto de teleoperación.
- Fecha de publicación futura respecto al momento de redacción y sin historial de mantenimiento posterior más allá de la actualización registrada.
- El checkpoint no incluye el estado del optimizador, lo que dificulta reanudar el entrenamiento exactamente desde ese punto.
- No se documentan limitaciones de longitud de contexto ni de ventana temporal de observación, por lo que no puede acotarse el alcance de la memoria del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx2_rldx_b2d_ur5_rh56dfx_3_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset de entrenamiento: https://huggingface.co/datasets/Bench2Dex/teleopdata
- Repositorio del proyecto y adaptadores de evaluación: https://github.com/myungkyuKoo/RLDX-2
- Código de referencia citado en la model card: RLWRLD/RLDX, parche myungkyu/jitter-patch en el commit 21f674b4 (no se ha verificado una URL pública en la información proporcionada)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas de ayuda de YouTube y foros sin relación).
