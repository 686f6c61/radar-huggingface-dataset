# Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_GR00T-N1.7_bs32_step18000

## Resumen

El modelo `Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_GR00T-N1.7_bs32_step18000` es un ajuste fino de una política robótica de la familia GR00T N1.7, publicado por el usuario Dongkkka y entrenado con la librería LeRobot 0.6.1. El checkpoint está especializado en una única tarea de manipulación denominada "Peanut Pick & Place" (recogida y colocación de cacahuetes) y se distribuye como pesos safetensors con 3.144.016.000 parámetros (unos 3,14 mil millones), lo que ocupa 12,6 GB en el repositorio.

El modelo se entrenó sobre el dataset `Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern` con un tamaño de lote de 32, utilizando tres cámaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) como entrada visual. El checkpoint publicado corresponde al mejor paso de validación (paso 18.000) de un entrenamiento que finalizó en el paso 20.000, con una pérdida de validación de 0,028 y un MAE medio en bucle abierto de 0,005463 sobre episodios reservados estáticos, izquierdos y derechos.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de flujo de trabajo LeRobot para políticas visión-lenguaje-acción (VLA) en robótica, y como punto de partida para ajustes finos en tareas de pick & place. No es un modelo de lenguaje general ni un modelo de propósito múltiple, y no se han publicado resultados de evaluación en bucle cerrado ni datos de rendimiento en hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; la nomenclatura corresponde a la familia GR00T N1.7, orientada a políticas visión-lenguaje-acción (VLA) para robótica |
| Parámetros totales | 3.144.016.000 (≈3,14 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el tamaño del repositorio (12,6 GB) es coherente con pesos en FP32 |
| Idiomas soportados | no disponible (modelo de robótica; no aplica procesamiento de lenguaje natural conversacional) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

Datos adicionales de la model card: versión de LeRobot 0.6.1, revisión del dataset `05286a17a145234ed80870702f4d9757f00194c3`, batch size 32, mejor pérdida de validación 0,028 en el paso 18.000, entrenamiento finalizado en el paso 20.000, sin parada temprana. El repositorio contiene únicamente el checkpoint seleccionado; se excluyen estados de optimizador y checkpoints intermedios.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: no se detallan el tipo de red, el mecanismo de atención, el esquema de difusión o flow matching para generar acciones, ni la composición del dataset. Lo único verificable es que se trata de un modelo de la familia GR00T N1.7 ejecutado con LeRobot, con 3.144.016.000 parámetros totales distribuidos en safetensors, y que consume tres flujos de cámara junto con (presumiblemente) el estado del robot para producir acciones de manipulación. Cualquier afirmación sobre capas, tokenizador visual o estrategia de fusión multimodal sería especulativa y no se incluye aquí.

El entrenamiento se realizó con batch size 32 sobre el dataset de la tarea 000004 (Peanut Pick & Place), con un total de 20.000 pasos, de los cuales se publica el paso 18.000 por ser el de mejor pérdida de validación (0,028). La evaluación reportada es en bucle abierto, con un MAE medio de 0,005463 sobre episodios reservados estáticos, izquierdos y derechos. No se documenta el uso de RLHF, DPO, decodificación especulativa ni ninguna otra innovación técnica en la información proporcionada.

## Capacidades

- Generación de acciones de manipulación robótica para una tarea concreta de recogida y colocación (pick & place) de cacahuetes.
- Entrada visual multi-cámara: `cam_left_head` (cabeza), `cam_left_wrist` (muñeca izquierda) y `cam_right_wrist` (muñeca derecha), lo que sugiere una plataforma bimanual con vista cenital o frontal.
- Inferencia compatible con el ecosistema LeRobot 0.6.1 y pesos en formato safetensors.
- No hay evidencia en la información disponible de generación de texto, razonamiento simbólico, código, matemáticas ni visión generalista.
- No hay evidencia de soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documenta ningún modo especial (thinking mode, audio, etc.).

## Casos de uso

- Automatización de una celda de pick & place en laboratorio: el modelo está ajustado específicamente para recoger y colocar cacahuetes, por lo que puede emplearse directamente en una estación con la misma disposición de cámaras y robot que el dataset de entrenamiento.
- Punto de partida para ajuste fino en nuevas tareas de manipulación: al estar distribuido en formato LeRobot, se puede reentrenar sobre otros datasets de demostración manteniendo la inicialización de GR00T N1.7.
- Evaluación comparativa de checkpoints en bucle abierto: la métrica MAE reportada (0,005463) permite usar este modelo como referencia interna al comparar variantes de batch size, número de pasos o composición de datos.
- Investigación en aprendizaje por imitación con múltiples cámaras: sirve para estudiar cómo influyen las vistas de muñeca y de cabeza en la predicción de acciones de una política VLA.
- Docencia y demostración de flujos LeRobot: es un ejemplo completo de extremo a extremo (dataset versionado, entrenamiento, selección de mejor checkpoint y publicación de pesos) para enseñar el pipeline.
- Validación de infraestructura de inferencia robótica: permite comprobar la latencia y la integración de un controlador robótico real con LeRobot antes de escalar a modelos mayores.
- Reproducción de experimentos de manipulación bimanual: la presencia de cámaras de muñeca izquierda y derecha permite probar políticas que coordinan dos brazos en tareas de agarre y traslado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de robótica y no de lenguaje. Las únicas métricas reportadas por el autor son de entrenamiento y evaluación en bucle abierto:

| Métrica | Valor |
|---|---|
| Mejor pérdida de validación | 0,028 (paso 18.000) |
| MAE medio en bucle abierto (episodios reservados estáticos, izquierdos y derechos) | 0,005463 |
| Paso de finalización del entrenamiento | 20.000 |
| Parada temprana | No |
| Tamaño de lote | 32 |

No se dispone de tasa de éxito en bucle cerrado, número de ensayos por episodio ni comparación con otros modelos en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros, no confirmado por el autor): aproximadamente 12,6 GB en FP32, 6,3 GB en FP16/BF16, 3,1 GB en INT8 y 1,6 GB en INT4, sin contar activaciones, codificadores visuales ni buffers de inferencia.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, el modelo en BF16 entra con holgura en una NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB) o A100 40 GB; en FP32 requiere al menos 16 GB de VRAM y conviene una A100 40/80 GB o H100 para margen.
- Compatibilidad con GPU de consumo: sí en BF16 sobre RTX 4090, RTX 3090 o RTX 4080 (16 GB, ajustado); en FP32 una RTX 4090 es suficiente pero con poco margen para activaciones.
- Opciones de despliegue: LeRobot 0.6.1 sobre PyTorch es la vía documentada. No se indica soporte de vLLM, TGI, llama.cpp, Ollama ni GGUF, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye datos de otros modelos, y la búsqueda web asociada no devolvió resultados relevantes. Se listan alternativas de la misma categoría (políticas VLA para manipulación robótica) sin cifras verificadas en esta fuente:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (GR00T N1.7, tarea 000004) | 3.144.016.000 | no disponible | no disponible | Hugging Face |
| GR00T N1.7 base | no disponible | no disponible | no disponible | no disponible en esta fuente |
| OpenVLA | no disponible | no disponible | no disponible | no disponible en esta fuente |
| π0 (pi-zero) | no disponible | no disponible | no disponible | no disponible en esta fuente |

No se puede establecer una comparación cuantitativa fiable con los datos disponibles.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (Peanut Pick & Place) y no se documenta ninguna capacidad de generalización a otras tareas, objetos o entornos.
- Dependencia del montaje: las tres cámaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) definen una configuración concreta; cualquier cambio de posición, calibración o tipo de cámara invalida probablemente el rendimiento.
- Licencia no especificada: la model card no indica licencia, por lo que el uso comercial queda en una situación jurídica indeterminada y requiere consulta previa con el autor.
- Sin validación externa: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no consta revisión por terceros.
- Métrica limitada: el único dato de rendimiento es un MAE en bucle abierto (0,005463); no hay tasa de éxito en bucle cerrado, que es la métrica relevante para producción.
- Riesgo de sobreajuste: con 20.000 pasos sobre un dataset específico y una pérdida de validación de 0,028, es plausible un ajuste estrecho a las condiciones de recogida de datos.
- Ausencia de información sobre sesgos, alucinación de lenguaje o multilingüismo: no aplica el análisis habitual de LLM, pero tampoco se documenta comportamiento ante entradas fuera de distribución.
- Procedencia del dataset: no se ha verificado el contenido, el número de episodios ni la calidad de las demostraciones del dataset de entrenamiento.
- Fecha de publicación registrada como 2026-09-18, posterior a la fecha de consulta habitual de este tipo de fichas; conviene confirmar la vigencia del repositorio.
- Riesgo de seguridad física: cualquier despliegue en un robot real debe incluir límites de par, paradas de emergencia y validación en simulación antes de operar cerca de personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_GR00T-N1.7_bs32_step18000
- Dataset de entrenamiento: https://huggingface.co/datasets/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern
- Repositorio de LeRobot (librería utilizada): https://github.com/huggingface/lerobot

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, la familia GR00T N1.7 ni el dataset asociado; los resultados obtenidos trataban sobre ortografía francesa, conversión de unidades de almacenamiento, diagramas de Voronoi, el símbolo de tilde y un buscador, por lo que se han descartado.
