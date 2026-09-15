# khanhnd61/impact-int8_so101-multi-task-clean

## Resumen

IMPACT SO-101 multi-task es una política robótica de imitación publicada por el usuario khanhnd61 en Hugging Face, distribuida a través de la librería LeRobot. Se trata de un ajuste fino del modelo `khanhnd61/impact_so101-multi-task-clean` sobre el que se ha aplicado entrenamiento consciente de cuantización (QAT) para que sus pesos sobrevivan a la aritmética int8 que ejecuta el motor de CPU `vla.simd` bajo la máscara `IMPACT_INT8=63`. La arquitectura es IMPACT: un ACT (Action Chunking Transformer) con una torre de lenguaje T5-small congelada y modulada mediante FiLM. El modelo tiene 77.965.446 parámetros (~78 M) y ocupa 0,3 GB en el repositorio.

La entrada del modelo son dos fotogramas de cámara (claves `front` y `wrist`), el estado articular del brazo y una instrucción en lenguaje natural; la salida es un chunk de 50 acciones generado en un único forward pass, que a 30 Hz cubre 1,667 segundos de movimiento. El interés principal de esta ficha no está en la política en sí, sino en el experimento de cuantización: el checkpoint se guarda en fp32 y el cuantizador de despliegue es totalmente dinámico (absmax simétrico, escalas por fila de salida en pesos y por token —por imagen en convoluciones— en activaciones), de modo que no hay nada que calibrar ni que almacenar, y el modelo carga y exporta por las rutas existentes sin cambios.

Su relevancia práctica es que cuantifica el coste de la cuantización sobre un caso real de robótica en el borde: la cuantización post-entrenamiento encarece el MAE int8 un +9,5%, mientras que tras QAT ese coste desaparece (-0,009). Sobre una Raspberry Pi 5 reduce la latencia mediana de 996,6 ms a 429,4 ms (2,32x) con la máscara completa, lo que lleva el margen de tiempo real de 1,7x a casi 4x. La parte de la model card relativa al entrenamiento aparece truncada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IMPACT: ACT (Action Chunking Transformer) con torre de lenguaje T5-small congelada y modulada por FiLM |
| Parametros totales | 77.965.446 (~78 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; consume 2 fotogramas de cámara + estado articular + instrucción de texto, y emite un chunk de 50 acciones en un solo forward pass |
| Tipos de cuantizacion | Pesos almacenados en fp32; cuantización dinámica W8A8 int8 en el motor CPU `vla.simd` (absmax simétrico, escalas de pesos por fila de salida, escalas de activación por token y por imagen en convoluciones). Máscara configurable con `int8_groups`: 63 = todos los grupos, 47 = todos menos el decoder, 0 = fp32 |
| Idiomas soportados | no disponible como idioma general; las instrucciones de texto se limitan a tres cadenas en inglés entrenadas de forma literal |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint fp32; repositorio de 0,3 GB) |

## Arquitectura y entrenamiento

IMPACT se describe en la model card como ACT con una torre de lenguaje T5-small congelada que se modula mediante capas FiLM. El modelo procesa dos vistas de cámara, el estado de las articulaciones y una instrucción textual, y produce un chunk de 50 acciones en un único forward pass. La model card menciona tres bloques diferenciados a efectos de cuantización: convoluciones de una ResNet (responsables de casi todo el coste de la cuantización post-entrenamiento), varios grupos de transformer y un grupo de proyección de tokens (bit 8), que se usa como control porque no tiene cuantización aguas arriba.

El entrenamiento es un ajuste fino del modelo base `khanhnd61/impact_so101-multi-task-clean` con quantizacion-aware training contra la aritmética int8 exacta del motor `vla.simd`. El objetivo de entrenamiento es L1 sobre el chunk, según se indica en la card. La evaluación comparativa usó 132 observaciones: 3 fotogramas de cada uno de 44 episodios, con las tres instrucciones y grados de error medidos sobre las cinco articulaciones activas. La comparación es emparejada: el control es el mismo ajuste fino con el cuantizador desactivado, de modo que la única diferencia es si el forward pass estaba cuantizado. Ambos convergen al mismo punto en fp32 (MAE 2,039 frente a 2,078). El detalle del dataset de entrenamiento (número de tokens, composición completa, uso de RLHF o DPO) no está disponible en la información proporcionada.

## Capacidades

- Manipulación robótica de tipo pick-and-place sobre el brazo SO-101, con salida de un chunk de 50 acciones por forward pass (1,667 s de movimiento a 30 Hz).
- Condicionamiento por lenguaje natural limitado a tres instrucciones literales: `Put the tape into the box`, `Put the tape into the cup` y `Put the cup into the box`.
- Percepción multimodal de entrada: dos cámaras simultáneas en las claves `front` y `wrist`, más estado articular.
- Ejecución cuantizada W8A8 int8 con máscara de grupos seleccionable, pensada para despliegue en CPU ARM.
- Inferencia en fp32 si se pasa `--policy.int8_groups=0`, útil para comparativas A/B.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: ejecuta una política de imitación, no un bucle de decisión.
- No realiza generación de texto: la torre T5-small está congelada y se usa solo como condicionamiento.
- No es multilingüe: no hay soporte documentado para instrucciones en otros idiomas.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras capacidades especiales.

## Casos de uso

- Pick-and-place sobre brazo SO-101: el modelo recoge y coloca objetos (cinta, vaso, caja) siguiendo una de las tres instrucciones entrenadas. Es el escenario para el que fue entrenado y el único con evidencia empírica en la card.
- Despliegue en robótica de borde con Raspberry Pi 5: con `IMPACT_INT8=63` la latencia mediana baja a 429,4 ms y el margen de tiempo real pasa de 1,7x a casi 4x, lo que permite ejecutar el chunk de 50 acciones dentro de los 1,667 s de movimiento que compra.
- Estación robótica educativa o de sobremesa de bajo coste: al caber en 0,3 GB de repositorio y ejecutarse en CPU, no requiere GPU dedicada ni aceleradores específicos.
- Investigación en cuantización de políticas de imitación: el par formado por este modelo y su control fp32 permite medir el coste de QAT frente a PTQ con comparaciones emparejadas sobre el mismo ajuste fino.
- Validación de motores de inferencia int8 personalizados: los números de paridad (1e-7 relativo a nivel de kernel en todas las formas GEMM de IMPACT, 2,9e-06 en el grupo de proyección de tokens) sirven como referencia para verificar una implementación propia.
- Prototipado de políticas con condicionamiento por lenguaje en proyectos LeRobot: se integra con `lerobot-rollout`, cámaras OpenCV a 640x480 y 30 fps, y robot `so101_follower` sin necesidad de `--rename_map`.
- Ajuste de la relación precisión-latencia en producción: la máscara recomendada `IMPACT_INT8=47` reduce a la mitad el aumento de jerk intra-chunk a cambio de un 9,8% de latencia, un compromiso relevante cuando la suavidad de la trayectoria afecta a los servos.

## Benchmarks y rendimiento

Calidad de acción sobre las cinco articulaciones activas (MAE en grados; RMS y máximo contra el propio chunk fp32 de cada modelo, por lo que cada fila es una comparación emparejada):

| Metrica | Control fp32 (equivale a PTQ) | Este modelo (QAT) |
|---|---:|---:|
| MAE fp32 | 2,039 | 2,078 |
| MAE int8 (mascara 63) | 2,232 | 2,069 |
| Coste de precision int8 | +0,193 | -0,009 |
| int8 vs fp32, RMS | 1,585 | 1,059 |
| int8 vs fp32, maximo | 28,011 | 16,974 |

Latencia en Raspberry Pi 5 (4x Cortex-A76, `neon`), en frío y en reposo, con A/B ABBA de 5 pares x 4 repeticiones:

| `IMPACT_INT8` | Mediana | Aceleracion vs fp32 | Stall | Acciones/s |
|---|---:|---:|---:|---:|
| 0 (fp32) | 996,6 ms | - | 0,598 | 50,2 |
| 63 (todo) | 429,4 ms | 2,32x | 0,258 | 116,4 |
| 47 (sin decoder) | 468,5 ms | 2,13x | 0,281 | 106,7 |

Otras medidas reportadas:

| Metrica | Valor |
|---|---|
| Paridad de kernel PyTorch vs `tcpu::dense_linear_i8` | 1e-7 relativo, escalas de pesos por fila bit a bit iguales |
| Paridad de modelo completo, mascara 63 | `actions_norm` 1,48e-02 frente a un suelo de 1,58e-02 |
| Ruta float sin cambios | 1,0e-6 relativo |
| Grupo de proyeccion de tokens (bit 8, control) | 2,9e-06 (ruido fp32) |
| Jerk intra-chunk con decoder cuantizado | 0,264 -> 0,385 (~+46%); con QAT, 0,269 -> 0,389 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K u otros), que no aplican a una política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para los ~78 M de parámetros (unos 312 MB de pesos). Es una estimación derivada del recuento de parámetros; la model card no publica cifras de VRAM.
- GPU recomendadas: no hay ninguna recomendada explícitamente; el ejemplo de uso apunta a `--policy.device=cuda`, pero el objetivo medido de despliegue es CPU ARM.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo con más de 1-2 GB de memoria, incluidas RTX 3060, RTX 4060 o RTX 4090. No se publican cifras de latencia en GPU.
- Plataforma de referencia medida: Raspberry Pi 5 con 4 núcleos Cortex-A76 y extensiones NEON, en frío y en reposo.
- Opciones de despliegue: `lerobot-rollout` (con `--policy.path`, `--robot.type=so101_follower`, cámaras OpenCV `front` y `wrist`), PyTorch (ruta int8 simulada, 1,3x más lenta que fp32) y el motor CPU `vla.simd` mediante `IMPACT_INT8`.
- Latencia medida en el objetivo: 996,6 ms en fp32, 429,4 ms con máscara 63 y 468,5 ms con máscara 47 (medianas en Raspberry Pi 5).
- Throughput medido: 50,2 acciones/s en fp32, 116,4 acciones/s con máscara 63 y 106,7 acciones/s con máscara 47.
- Stall (latencia dividida entre los 1,667 s de movimiento que compra un chunk): 0,598 en fp32, 0,258 con máscara 63 y 0,281 con máscara 47.
- Advertencia de despliegue: la aceleración la aporta el motor CPU; en PyTorch la ruta int8 es una simulación y resulta un 1,3x más lenta, no más rápida.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | MAE int8 (mascara 63) | Coste int8 vs fp32 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| `khanhnd61/impact-int8_so101-multi-task-clean` (este, QAT) | 77,97 M | Chunk de 50 acciones | 2,069 | -0,009 | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Control fp32 del mismo ajuste (equivale a post-training quantization) | 77,97 M | Chunk de 50 acciones | 2,232 | +0,193 | apache-2.0 | Documentado en la model card del propio modelo |
| `khanhnd61/impact_so101-multi-task-clean` (modelo base) | no disponible | Chunk de 50 acciones | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Otras politicas ACT o VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado en la información disponible otros modelos comparables de la misma categoría (políticas de imitación para SO-101) con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- Instrucciones cerradas: `--task` debe ser exactamente una de las tres cadenas entrenadas. Una instrucción reformulada degrada la política de forma silenciosa, sin error ni aviso.
- Dependencia posicional de las cámaras: los pases de visión dependen de la posición, de modo que intercambiar `front` y `wrist` produce acciones plausibles pero incorrectas en lugar de un fallo detectable.
- Dataset muy pequeño: 44 episodios y 132 observaciones usadas en la evaluación; la generalización fuera de las tres tareas y del montaje concreto no está respaldada por evidencia.
- Rugosidad de trayectoria: cuantizar el decoder incrementa el jerk intra-chunk aproximadamente un 46% (0,264 -> 0,385) y el QAT no lo corrige (0,269 -> 0,389). Como el chunk se ejecuta en bucle abierto, esa rugosidad llega a los servos. Por eso se recomienda `IMPACT_INT8=47`, que sacrifica un 9,8% de latencia a cambio de recuperarla.
- El objetivo de entrenamiento es L1 sobre el chunk y es indiferente a la suavidad del camino entre dos puntos correctos, por lo que ningún gradiente la solicita.
- Riesgo de acción incorrecta plausible: no es un modelo generativo de texto, pero sí puede producir trayectorias verosímiles y equivocadas sin señal de incertidumbre. No se documenta ninguna capa de verificación o parada de seguridad.
- La comparación int8 de modelo completo no puede ser una afirmación de exactitud: la cuantización es discontinua y dos implementaciones que coinciden a 1e-7 en fp32 pueden caer ocasionalmente en lados opuestos de una frontera de redondeo. La card lo compensa comparando contra un suelo medido de perturbación de una parte en un millón.
- La velocidad declarada pertenece exclusivamente al motor CPU `vla.simd`; en PyTorch la ruta int8 está simulada y es 1,3x más lenta que fp32. No debe extrapolarse a otras pilas de inferencia.
- Alcance lingüístico mínimo: solo inglés y solo tres frases. No hay soporte multilingüe ni comprensión abierta de instrucciones.
- La licencia declarada es apache-2.0, lo que en principio permite uso comercial, pero conviene verificar por separado la licencia del dataset `khanhnd61/so101-multi-task-clean` y de los componentes de terceros (torre T5-small) antes de un despliegue en producción.
- Ausencia de validación comunitaria: 0 descargas, 0 likes y publicación el 15 de septiembre de 2026, con última actualización el mismo día. No hay evidencia de uso independiente.
- La sección de entrenamiento de la model card está truncada en la información disponible, por lo que se desconocen detalles del dataset de ajuste fino, la composición de datos y el procedimiento completo de QAT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khanhnd61/impact-int8_so101-multi-task-clean
- Modelo base (fp32, sin QAT): https://huggingface.co/khanhnd61/impact_so101-multi-task-clean
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-multi-task-clean
- LeRobot (librería y referencia de IMPACT): https://github.com/huggingface/lerobot
- Motor de inferencia CPU `vla.simd`: https://github.com/khanhnd61-vr/vla.simd
- Resultados de búsqueda web: no se encontró ningún enlace relevante sobre este modelo; los resultados devueltos no guardan relación con la robótica ni con LeRobot.
