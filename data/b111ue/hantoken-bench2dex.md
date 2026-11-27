# B111ue/hantoken-bench2dex

## Resumen

HanToken Bench2Dex es una colección de políticas de imitación para manipulación bimanual diestra, publicada por el usuario B111ue en Hugging Face. No es un modelo de lenguaje ni un modelo fundacional generativo: es un conjunto de diez políticas entrenadas de forma independiente, una por tarea, sobre el benchmark Bench2Dex. Cada política combina características visuales congeladas (DINOv3 ViT-B/16 para RGB y DeFM para profundidad) con un decodificador de acciones propio denominado HanToken, entrenado desde cero, que tokeniza las acciones conjuntas en bloques de cuatro pasos y comparte la lectura entre ambas manos.

El interés de esta publicación es doble. Por un lado, aporta checkpoints reproducibles (con hashes SHA-256 por tarea) para diez tareas concretas del benchmark, con semilla de entrenamiento fija y resumen de entrenamiento incluido. Por otro, los resultados reportados en la model card son deliberadamente modestos: una tasa media de éxito del 39,0 % en la configuración "Full", frente a un 65,2 % de la configuración "None". Esa brecha sugiere que el trabajo documenta un estudio de ablación sobre cómo la augmentación de datos afecta al rendimiento, más que un estado del arte en manipulación.

Con 164.747.540 parámetros entrenables por política y un repositorio de 6,6 GB, el artefacto está pensado para investigadores en robótica que quieran reproducir o extender los experimentos de Bench2Dex, no para despliegue en producción sin entrenamiento adicional. La licencia es "other", sin términos comerciales explícitos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación con encoder visual congelado (DINOv3 ViT-B/16 RGB + DeFM profundidad) y decodificador de acciones HanToken (tokens de acción por bloque de 4 pasos, lectura compartida entre manos) |
| Parametros totales | 164.747.540 parámetros entrenables por política |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la ventana temporal depende de la política y de la tarea) |
| Tipos de cuantizacion | No disponible (checkpoints en PyTorch `.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | other |
| Formato de pesos | PyTorch (`policy_last.pt`), más `config.json`, `normalization.json`, `final.json` y `symtied-layout.json` por tarea |

## Arquitectura y entrenamiento

Cada política es una red de imitación que no entrena el backbone visual: las características RGB provienen de un DINOv3 ViT-B/16 congelado y las de profundidad de un extractor DeFM también congelado. Sobre esas representaciones se entrena desde cero un decodificador de acciones HanToken que representa las acciones conjuntas como tokens agrupados en bloques de cuatro pasos temporales, con una lectura compartida para las dos manos. El repositorio incluye además `symtied-layout.json`, que define la correspondencia de articulaciones entre mano izquierda y derecha, un detalle relevante para la simetría bimanual.

El entrenamiento se realizó con una política por tarea, semilla 0, tamaño de lote 32 y 80.000 pasos de AdamW con tasa de aprendizaje 1e-4, 500 pasos de calentamiento y decaimiento coseno, guardando los pesos finales con EMA. Cada tarea dispone de 50 demostraciones y se fija la revisión upstream de Bench2Dex `f96a8b2b4eb475483af66e9e03916b35bc43f1be`. La model card menciona cuatro configuraciones (None, Equi, Inv, Full) evaluadas con 50 episodios por tarea, lo que apunta a un estudio de ablación sobre augmentación o simetrización de datos.

## Capacidades

- Ejecución de políticas de manipulación bimanual diestra en diez tareas concretas de Bench2Dex (carga de platos, vertido con sartén, uso de destornillador y martillo, disposición de bandejas, vertido entre manos con botella, eliminación de residuos, montaje de escritorio gaming, entre otras).
- Percepción visual multimodal: combina RGB (DINOv3) y profundidad (DeFM) como entrada.
- Representación de acciones conjuntas tokenizada en bloques de cuatro pasos, con lectura compartida entre ambas manos.
- Correspondencia explícita de articulaciones izquierda/derecha mediante `symtied-layout.json`.
- Reproducibilidad: hashes SHA-256 por checkpoint y resumen de entrenamiento en `final.json`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de Bench2Dex: cargar cada `policy_last.pt` con su `config.json` y `normalization.json` para replicar las tasas de éxito reportadas en la Tabla I con la revisión upstream indicada.
- Estudio de ablación sobre augmentación de datos: comparar las configuraciones None (65,2 %), Equi (19,6 %), Inv (35,4 %) y Full (35,9 %) para analizar por qué la augmentación degrada el rendimiento en estas tareas.
- Línea base para nuevas arquitecturas de decodificación de acciones: el decodificador HanToken con tokens en bloques de cuatro pasos y lectura compartida sirve como referencia frente a políticas de regresión continua.
- Investigación en manipulación bimanual simétrica: el archivo `symtied-layout.json` permite estudiar el efecto de imponer correspondencia entre manos en tareas de vertido entre manos (por ejemplo, `34_fridge_wine_interhand_pour`).
- Evaluación de encoders visuales congelados en robótica: al mantener DINOv3 y DeFM fijos, el repositorio aísla la contribución del decodificador y facilita comparar extractores de características.
- Docencia y formación en aprendizaje por imitación: el conjunto de diez tareas con 50 demostraciones cada una y scripts de entrenamiento documentados (semilla, lote, pasos, optimizador) es un material didáctico concreto para cursos de robótica.
- Auditoría de reproducibilidad: los hashes SHA-256 por checkpoint permiten verificar la integridad de los pesos descargados en pipelines de investigación.

## Benchmarks y rendimiento

La model card reporta la tasa media de éxito en Bench2Dex (Tabla I) con 4 configuraciones × 50 episodios por tarea:

| Configuración | Éxito medio (%) |
|---|---|
| None | 65,2 |
| Equi | 19,6 |
| Inv | 35,4 |
| Full | 35,9 |
| Media global reportada | 39,0 |

No se han publicado resultados por tarea ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 164,7 M de parámetros entrenables y backbones congelados, los pesos en FP32 rondan los 0,66 GB, aunque el consumo real depende del tamaño de las activaciones de DINOv3 ViT-B/16 y DeFM.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 8-16 GB debería poder alojar la política, pero no se confirma.
- ¿Cabe en GPU de consumo? Probablemente sí en RTX 3060/4060 o superiores, pero no está verificado en la documentación.
- Opciones de despliegue: no se documentan; los checkpoints son PyTorch `.pt` y no hay conversiones a ONNX, TensorRT ni formatos de inferencia de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HanToken Bench2Dex (este) | 164,7 M entrenables por política | No aplica | 39,0 % medio en Bench2Dex | other | Hugging Face |
| HanToken DexJoCo / DexJoCo-X (`B111ue/handex-dexjoco-creg`) | No disponible | No aplica | No disponible | No disponible | Hugging Face |
| Otras políticas de Bench2Dex | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de información sobre políticas comparables de otros autores en Bench2Dex para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Rendimiento modesto: la media global del 39,0 % y la caída de la configuración "None" (65,2 %) a "Equi" (19,6 %) indican que las políticas no son robustas y que ciertas augmentaciones perjudican gravemente el resultado.
- Una política por tarea: no hay generalización entre tareas; cada checkpoint solo opera en su tarea de Bench2Dex.
- Dependencia de los backbones congelados: DINOv3 y DeFM no se incluyen como pesos entrenables y deben obtenerse por separado, con el riesgo de incompatibilidad de versiones.
- Sin información sobre sesgos: al ser un modelo de robótica, los sesgos relevantes serían de distribución de demostraciones, no documentados.
- Riesgo de fallo físico: en despliegue real, una tasa de éxito del 39 % implica que la mayoría de los episodios fallan; no es apto para producción sin supervisión.
- Licencia "other": no se especifican términos comerciales; debe consultarse con el autor antes de cualquier uso comercial.
- Sin datos de idioma ni de cuantización: no es un modelo de lenguaje y no se ofrecen formatos optimizados.
- Repositorio de 6,6 GB y sin descargas ni likes: ecosistema muy limitado, sin garantías de mantenimiento.
- Fecha de creación futura (2026-11-27) en los metadatos: conviene verificar la integridad y procedencia de los artefactos.

## Enlaces

- Hugging Face: https://huggingface.co/B111ue/hantoken-bench2dex
- Checkpoints DexJoCo / DexJoCo-X: https://huggingface.co/B111ue/handex-dexjoco-creg
- Revisión upstream de Bench2Dex referenciada: `f96a8b2b4eb475483af66e9e03916b35bc43f1be` (sin URL directa en la información disponible)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
