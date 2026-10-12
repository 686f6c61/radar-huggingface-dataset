# liorbenhorin-nv/so101_vials_dr_expanded500_real10_510ep_20261011_GR00T17_20k

## Resumen

El modelo `so101_vials_dr_expanded500_real10_510ep_20261011_GR00T17_20k` es una política de manipulación robótica publicada por el usuario `liorbenhorin-nv`, resultado de un ajuste fino del modelo base `nvidia/GR00T-N1.7-3B`. Está pensada para controlar un brazo robótico SO-101 en tareas de manipulación de viales sobre racks, empleando observaciones visuales y consignas de lenguaje en un esquema visión-lenguaje-acción (VLA).

El entrenamiento parte de una mezcla de 510 episodios y 195.812 fotogramas: 500 episodios de domain randomization sobre layouts de racks expandidos y 10 demostraciones manuales físicas (índices de episodio 0 a 9). El ajuste se realizó durante 20.000 pasos de optimizador con Accelerate sobre cuatro GPU RTX PRO 6000 Blackwell, con batch de 16 por GPU y batch global de 64, semilla 42, precisión mixta BF16 con parámetros de modelo en FP32.

Su relevancia es acotada pero clara: es un ejemplo de ajuste fino reproducible sobre GR00T N1.7 con la librería LeRobot, con procedencia de datos documentada de forma explícita y soporte para combinación sim-to-real. El propio autor indica que la política aún no ha sido evaluada, por lo que no existen métricas de éxito publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) heredada del modelo base NVIDIA GR00T N1.7-3B; detalle de capas, atencion y cabeza de accion no disponible en la model card |
| Parametros totales | 3.144.016.000 (aproximadamente 3,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible como contexto textual; la política usa una ventana de accion de 16 pasos |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors nativos, entrenados con autocast BF16 y parametros FP32 |
| Idiomas soportados | no disponible; el ajuste se realizo con language tuning desactivado, por lo que el condicionamiento de lenguaje no fue adaptado |
| Licencia | no disponible |
| Formato de pesos | safetensors (política nativa y ficheros de procesador; deben mantenerse juntos) |

Otros datos tecnicos: tamaño del repositorio 12,6 GB, librería `lerobot`, pipeline `robotics`, revision del modelo base `2fc962b973bccdd5d8ce4f67cc63b264d6886495` y revisión del backbone `9ce19a195e423419c349abfc86fd07178b230561`.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de su ascendencia: el modelo deriva de `nvidia/GR00T-N1.7-3B`, un modelo de la familia GR00T N1.7 de NVIDIA, y se etiqueta como `robotics`, `groot` y `so101`. Se trata, por tanto, de una política VLA con un backbone de visión-lenguaje y una cabeza de acción, aunque la model card no especifica el número de capas, el tipo de mecanismo de atención, la resolución de entrada ni el mecanismo de generación de acciones.

El entrenamiento se realizó con 20.000 pasos de optimizador mediante Accelerate sobre cuatro GPU RTX PRO 6000 Blackwell, con batch de 16 por GPU y batch global de 64, semilla 42. Se activó el ajuste visual (*visual tuning*) y se desactivó el ajuste de lenguaje (*language tuning*). Se usó autocast BF16 con parámetros del modelo en FP32, aumento de imagen, optimizador Fused AdamW con tasa de aprendizaje 0,0001, 1.000 pasos de warmup y un schedule coseno. Las acciones son relativas para el brazo y absolutas para la pinza, con una ventana de acción de 16 pasos.

El conjunto de datos combina 500 episodios de domain randomization sobre layouts de racks expandidos (revisión `5514e2d13e489b7196caa3f512720d106da762c4`) y 10 demostraciones físicas manuales. Los checkpoints nativos y los estados del optimizador se conservan en la instancia de entrenamiento en los pasos 10.000 y 20.000; el repositorio contiene únicamente la política final de 20.000 pasos. Como innovación de infraestructura, el wrapper `groot_fast_train` (commit `07be46c3c3da9561e5d407135594d109f10efe62`, rama `perf/groot-fast-train`) habilita el solapamiento de preprocesado y Fused AdamW, con un lanzador por rango que asigna índices explícitos de dispositivo CUDA. No se documenta ningún uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Control de un brazo robótico SO-101 a partir de observaciones visuales, con salida de acciones relativas de brazo y absolutas de pinza.
- Ejecución de tareas de manipulación de viales sobre racks, incluyendo variaciones de layout aprendidas mediante domain randomization.
- Soporte de condicionamiento por lenguaje en la arquitectura base, aunque el ajuste se realizó con *language tuning* desactivado, por lo que no se garantiza la adaptación de instrucciones verbales nuevas.
- Política multi-paso: genera ventanas de 16 acciones por inferencia, lo que permite ejecución encadenada sin reinferencia en cada paso de control.
- Tolerancia a variación visual de escena, gracias al entrenamiento con aumento de imagen y 500 episodios de domain randomization.
- Transferencia sim-to-real: el conjunto incluye 10 demostraciones físicas reales recogidas manualmente, mezcladas con datos de simulación.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso simbólico, visión general, audio ni generación de texto.

## Casos de uso

- Manipulación de viales en entornos de laboratorio: la política está entrenada específicamente sobre layouts de racks y viales, por lo que puede emplearse para colocar y retirar viales de gradillas en flujos de trabajo repetitivos.
- Automatización de pick-and-place con SO-101: al generar ventanas de 16 acciones, permite ciclos de recogida y deposición continuos con una sola inferencia por ventana, reduciendo la frecuencia de cómputo necesaria.
- Investigación en sim-to-real para robótica: la mezcla de 500 episodios de domain randomization con 10 demostraciones físicas la convierte en un punto de partida para estudiar la transferencia de políticas entrenadas en simulación a hardware real.
- Base para ajuste específico de tarea: al ser un fine-tune de GR00T N1.7-3B con procedencia documentada, sirve como inicialización para nuevos ajustes sobre variantes de rack o utillaje.
- Evaluación de pipelines LeRobot: el repositorio usa `lerobot` y safetensors, por lo que puede integrarse en flujos de validación de políticas dentro de ese ecosistema.
- Prototipado de celdas robotizadas con GPU de gama alta: con aproximadamente 6,3 GB en BF16, es viable desplegarla en una estación de trabajo con una sola GPU consumer para experimentación.
- Reproducibilidad de experimentos de entrenamiento: el fichero `training-provenance.json` documenta revisiones de datasets y commits, lo que permite replicar o auditar el proceso de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la política no ha sido evaluada todavía, por lo que no existen tasas de éxito, métricas de precisión de manipulación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,6 GB si se carga en FP32 (tamaño del repositorio de pesos) y en torno a 6,3 GB si se carga en BF16, sin contar activaciones del codificador visual ni del resto del grafo.
- GPU de entrenamiento documentadas: cuatro RTX PRO 6000 Blackwell, con batch de 16 por GPU y batch global de 64 durante 20.000 pasos.
- GPU recomendadas para inferencia: cualquier GPU con 16 GB o más de VRAM; RTX 4090, RTX 3090, RTX 4080 de 16 GB, RTX PRO 6000 Blackwell, A100 y H100 son opciones razonables según el presupuesto de latencia.
- Compatibilidad con GPU de consumo: sí, previsiblemente en RTX 4090 y RTX 3090 de 24 GB, y en modelos de 16 GB si se reduce la precisión o el tamaño de lote. No hay datos verificados de consumo real de memoria en inferencia.
- Opciones de despliegue: librería `lerobot` sobre PyTorch con los ficheros nativos de política y procesador. Servidores de texto como vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de política robótica y no se documentan como soportados.
- Latencia y throughput: no disponibles. La única referencia temporal es que la política devuelve ventanas de 16 acciones por inferencia, dato que puede usarse para estimar la frecuencia de control efectiva, pero sin cifras publicadas de tiempo por inferencia.
- Requisito operativo: los checkpoints nativos y los ficheros de procesador deben mantenerse juntos; mezclar ficheros de distintas revisiones puede invalidar el comportamiento de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana de accion | Licencia | Disponibilidad |
|---|---|---|---|---|
| so101_vials_dr_expanded500_real10 (este modelo) | 3.144.016.000 | 16 pasos de accion | no disponible | Hugging Face, libreria lerobot |
| nvidia/GR00T-N1.7-3B (modelo base) | aproximadamente 3B (revision `2fc962b9`) | no disponible | no disponible | Hugging Face |
| Otras politicas VLA de la misma categoria (por ejemplo, pi0 o OpenVLA) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos suficientes para una comparación cuantitativa de rendimiento entre alternativas. La única comparación fiable es la relación de derivación respecto a `nvidia/GR00T-N1.7-3B`, sobre el que se aplicó un ajuste de 20.000 pasos con datasets propios.

## Limitaciones y advertencias

- La política no ha sido evaluada: no existe ninguna métrica de tasa de éxito, robustez o generalización publicada por el autor.
- Especialización estrecha: está entrenada sobre viales y layouts de racks con un brazo SO-101; no se espera que funcione en otras morfologías de robot, otros objetos u otras cámaras sin reentrenamiento.
- El ajuste de lenguaje está desactivado, por lo que el modelo probablemente no responde de forma fiable a instrucciones verbales nuevas o reformuladas.
- Sesgos conocidos: no disponibles. Al proceder de un conjunto con domain randomization y solo 10 demostraciones físicas reales, el comportamiento puede degradarse ante condiciones de iluminación, fondo o disposición de objetos no representadas en los datos.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras en el espacio físico, especialmente fuera de la distribución de entrenamiento.
- Limitaciones de contexto: no hay información sobre contexto textual; la ventana de acción es de 16 pasos y reinferencias posteriores dependen de la observación actual, lo que limita la planificación a largo plazo.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no puede confirmarse la viabilidad de uso comercial. Debe verificarse antes de cualquier despliegue en producción.
- Cualquier uso en un robot real requiere protocolos externos de parada de emergencia, límites de par y validación en entorno controlado; el modelo no incorpora salvaguardas documentadas.
- Los enlaces de la búsqueda web realizada no contenían información técnica relevante sobre este modelo ni sobre su base, por lo que no se han utilizado como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liorbenhorin-nv/so101_vials_dr_expanded500_real10_510ep_20261011_GR00T17_20k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de domain randomization: https://huggingface.co/datasets/liorbenhorin-nv/so101_vials_dr_rack_layouts_expanded_500ep_20261010
- Dataset de demostraciones reales: https://huggingface.co/datasets/sreetz-nv/so101_real_manual
- Fichero de procedencia incluido en el repositorio: `training-provenance.json`
- La búsqueda web realizada no devolvió enlaces relevantes (papers, blogs, repos o demos) sobre este modelo o su base.
