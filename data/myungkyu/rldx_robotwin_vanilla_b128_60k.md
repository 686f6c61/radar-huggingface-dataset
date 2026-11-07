# Myungkyu/rldx_robotwin_vanilla_b128_60k

## Resumen

`rldx_robotwin_vanilla_b128_60k` es un ajuste fino (fine-tuning) del modelo base `RLWRLD/RLDX-1-PT`, un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa. Lo publica el usuario de Hugging Face Myungkyu como *baseline* de referencia ("vanilla") para el banco de pruebas RoboTwin 2.0, concretamente en la configuración *co-train* del leaderboard: 50 tareas con 50 episodios `demo_clean` cada una, sobre el robot bimanual Aloha-AgileX y con la exportación oficial de LeRobot.

El modelo recibe tres vistas de cámara (cabeza y muñecas izquierda y derecha), un vector de estado articular de 14 dimensiones y la instrucción de la tarea en lenguaje natural, y produce como salida 14 objetivos articulares absolutos. Con 6.912.896.320 parámetros (~6,9 mil millones) y un repositorio de 55,3 GB, es un modelo de escala media diseñado para inferencia robótica, no para generación de texto general.

Su relevancia es metodológica: sirve como punto de partida reproducible para comparar variantes del proyecto RLDX (el autor publica también variantes como `rldx2_rldx_robotwin_vanilla_b128_60k` y `rldx2_rldximg_robotwin_b128_60k`) sobre el mismo conjunto de datos y el mismo protocolo de entrenamiento. No se dispone de información sobre licencia ni sobre idiomas soportados en la documentación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (modelo visión-lenguaje-acción; longitud de vídeo 4 / stride 2, tres vistas de cámara, horizonte de acción 50) |
| Parámetros totales | 6.912.896.320 (~6,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT (fine-tune) |
| Dataset de entrenamiento | TianxingChen/RoboTwin2.0 |
| Entradas | Imágenes de cabeza + muñeca izquierda + muñeca derecha, estado articular de 14 dimensiones, instrucción de tarea |
| Salidas | 14 objetivos articulares absolutos |
| Pasos de entrenamiento | 60.000 (batch 128) |
| Checkpoints intermedios | step-15000, step-30000, step-45000 |
| Tamaño del repositorio | 55,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `RLWRLD/RLDX-1-PT`, un backbone VLA que procesa secuencias de vídeo con longitud 4 y stride 2, tres vistas de cámara simultáneas y un horizonte de acción de 50 pasos. El ajuste fino se realizó sobre la configuración *co-train* del leaderboard de RoboTwin 2.0 (50 tareas × 50 episodios `demo_clean`, robot Aloha-AgileX, exportación oficial de LeRobot), con optimizador de batch 128 durante 60.000 pasos.

La model card documenta dos decisiones técnicas concretas del entrenamiento: enmascarado de ruido en la dimensión de padding (`action_noise_mask_dim=14`) y *state dropout* de 0,5 sobre el vector de estado. El código utilizado corresponde a `RLWRLD/RLDX` en la revisión `myungkyu/jitter-patch 21f674b4`. Las configuraciones referencian el backbone y el tokenizador del modelo base por su identificador de Hub, por lo que es necesario descargar también `RLWRLD/RLDX-1-PT` para la inferencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico manipulativo bimanual: genera 14 objetivos articulares absolutos a partir de instrucciones en lenguaje natural.
- Percepción multi-vista: procesa simultáneamente imagen de cabeza y de ambas muñecas.
- Condicionamiento por instrucción: la tarea se especifica mediante texto en lenguaje natural.
- Planificación de acciones con horizonte de 50 pasos.
- Integración con el ecosistema LeRobot para carga de datos y exportación.
- Checkpoints intermedios para evaluar la evolución del entrenamiento (pasos 15k, 30k, 45k).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento (*thinking mode*).

## Casos de uso

- **Referencia base para experimentos en RoboTwin 2.0**: sirve como punto de comparación "vanilla" frente a variantes del proyecto RLDX, ya que comparte dataset, protocolo y número de pasos de entrenamiento.
- **Evaluación de políticas VLA en simulación**: permite medir el rendimiento de una política entrenada con 50 tareas × 50 episodios sobre el robot Aloha-AgileX antes de introducir modificaciones arquitectónicas.
- **Ablaciones de entrenamiento**: los checkpoints en los pasos 15k, 30k y 45k permiten estudiar la curva de aprendizaje y el efecto de técnicas como el *state dropout* o el enmascarado de ruido en la dimensión de padding.
- **Reproducción de resultados**: al referenciar el backbone y el tokenizador por identificador de Hub y documentar la revisión exacta del código, facilita la reproducción de experimentos por parte de otros grupos.
- **Punto de partida para fine-tuning en tareas propias**: el checkpoint final puede servir como inicialización para adaptar la política a nuevos conjuntos de demostraciones con el mismo formato de entradas (tres cámaras, estado de 14 dimensiones, instrucción).
- **Validación de pipelines de inferencia robótica**: útil para probar infraestructura de despliegue (carga de safetensors, preprocesado de imágenes multi-vista, ejecución de acciones con horizonte 50) antes de pasar a modelos más grandes o a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Con ~6,9 mil millones de parámetros, en precisión de 16 bits los pesos ocupan aproximadamente 13,8 GB, a lo que hay que sumar la memoria del backbone y del tokenizador referenciados, las activaciones y los búferes de imagen de tres cámaras.
- **GPU recomendadas**: no especificadas por el autor. Por tamaño de pesos, se requiere al menos una GPU con 16 GB o más en FP16/BF16; no hay datos publicados de latencia ni throughput.
- **GPU de consumo**: no confirmado. El tamaño de pesos en 16 bits (unos 13,8 GB) queda al límite de una RTX 4090 (24 GB) si se añaden activaciones y el resto del pipeline; en cuantizaciones de 8 bits podría ser viable, pero no se documentan formatos de cuantización.
- **Opciones de despliegue**: no se documentan frameworks de serving (vLLM, llama.cpp, Ollama, TGI). El modelo se distribuye en safetensors y está pensado para cargarse con el código del repositorio `RLWRLD/RLDX` y el ecosistema LeRobot.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Myungkyu/rldx_robotwin_vanilla_b128_60k` | ~6,9 B | no disponible | no disponible | no disponible | Hugging Face (96 descargas) |
| `Myungkyu/rldx2_rldx_robotwin_vanilla_b128_60k` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `Myungkyu/rldx2_rldximg_robotwin_b128_60k` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `RLWRLD/RLDX-1-PT` (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Las dos variantes del proyecto RLDX-2 comparten el mismo protocolo de datos (RoboTwin 2.0, configuración *co-train*, Aloha-AgileX, exportación LeRobot) y el mismo presupuesto de entrenamiento (batch 128, 60k pasos), por lo que constituyen la comparación más directa. No se dispone de datos de parámetros, contexto ni rendimiento de esas variantes en la información consultada.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo, lo que impide determinar si el uso comercial está permitido. Es un riesgo relevante para cualquier despliegue en producción.
- **Ámbito restringido**: es un modelo de robótica entrenado específicamente para el banco RoboTwin 2.0 y el robot Aloha-AgileX; no es un modelo de propósito general ni de conversación.
- **Dependencia del modelo base**: las configuraciones referencian el backbone y el tokenizador de `RLWRLD/RLDX-1-PT` por identificador de Hub, de modo que la inferencia requiere descargar también ese modelo y su licencia aplica en cascada.
- **Sesgos**: no documentados. Al entrenarse sobre un conjunto sintético y acotado de 50 tareas, es previsible un mal rendimiento fuera de esa distribución, aunque el autor no lo cuantifica.
- **Riesgo de alucinación**: no evaluado en la información disponible; en el contexto de políticas VLA, el fallo se manifiesta como acciones incorrectas o inseguras más que como texto inventado.
- **Idiomas**: no se especifican los idiomas de las instrucciones de tarea soportadas.
- **Reproducibilidad**: el checkpoint final no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento exactamente desde ese punto.
- **Sin benchmarks publicados**: no hay métricas de éxito en tareas que permitan valorar su calidad frente a alternativas.
- **Tamaño del repositorio**: 55,3 GB, lo que exige planificar el almacenamiento y usar patrones de descarga selectiva (`allow_patterns`/`ignore_patterns`) para no bajar todos los checkpoints intermedios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldx_robotwin_vanilla_b128_60k
- Variante RLDX-2 vanilla: https://huggingface.co/Myungkyu/rldx2_rldx_robotwin_vanilla_b128_60k
- Variante RLDX-2 con imágenes: https://huggingface.co/Myungkyu/rldx2_rldximg_robotwin_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset de entrenamiento: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
