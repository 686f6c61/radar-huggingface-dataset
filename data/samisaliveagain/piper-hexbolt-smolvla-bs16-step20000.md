# Samisaliveagain/piper-hexbolt-smolvla-bs16-step20000

## Resumen

`Samisaliveagain/piper-hexbolt-smolvla-bs16-step20000` es un checkpoint de política robótica de tipo Vision-Language-Action (VLA) entrenado con la librería LeRobot sobre la arquitectura SmolVLA. Lo publica el usuario Samisaliveagain y resuelve una tarea concreta de manipulación: coger un perno hexagonal y colocarlo en la abertura correspondiente. El modelo consume siete valores de articulación y pinza más dos cámaras RGB (cenital y angulada) y emite siete objetivos absolutos para el robot seguidor AgileX Piper, con un *chunk* de 50 acciones por inferencia.

El interés de esta ficha no está en el rendimiento bruto (no hay benchmarks publicados), sino en su valor como artefacto reproducible: el autor documenta la procedencia del paso 20.000, verifica hashes SHA-256 de los siete ficheros de política y procesadores, e incluye las configuraciones de pre/postprocesado y los tensores de normalización necesarios para interpretar las acciones. Es, por tanto, un ejemplo típico de *checkpoint* de imitación de nicho, útil para quien trabaja en inserción de precisión con VLA pequeños.

El modelo tiene 450.046.176 parámetros (dato real de los safetensors) y un repositorio de 1,2 GB. No se especifica licencia, idiomas ni cuantizaciones oficiales. Fue entrenado con el dataset de 100 demostraciones `piper-hexagonal-bolt-insertion-100-demos-v1`, con batch size 16, un único proceso y 20.000 actualizaciones del optimizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (política Vision-Language-Action de LeRobot); detalles internos de capas no disponibles en la información proporcionada |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible; no es una ventana de texto: procesa observaciones (2 cámaras RGB + estado de 7 articulaciones) y emite chunks de 50 acciones |
| Tipos de cuantización | No disponible; el repositorio solo distribuye `safetensors` (1,2 GB para 450 M de parámetros) |
| Idiomas soportados | No disponible; la tarea va descrita en inglés en la model card ("Pick up the hexagonal bolt and place it in the matching opening"), cobertura multilingüe no verificada |
| Licencia | No disponible ("No new license is assigned by this upload") |
| Formato de pesos | `safetensors` (`model.safetensors`), más `config.json`, `train_config.json`, pre/postprocesadores y tensores de normalización |

Otros datos operativos relevantes:

| Parámetro | Valor |
|---|---|
| Robot | AgileX Piper (follower) |
| Entradas | 7 valores de articulación/pinza + cámara RGB cenital + cámara RGB angulada |
| Salidas | 7 objetivos absolutos del follower; articulaciones en grados, pinza en milímetros |
| Chunk de acciones | 50 acciones |
| Paso de entrenamiento guardado | 20.000 actualizaciones del optimizador |
| Batch size / procesos | 16 / 1 |
| Dataset | `Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1`, revisión `1ec623d82a1f70c70f1d769c38334799d122db77` |
| Inicialización | `pretrained_path` termina en `000050/pretrained_model` |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia SmolVLA, una política VLA de pequeño tamaño (≈450 M de parámetros) que acopla un codificador visión-lenguaje con un cabezal de acciones, y que se entrena por imitación sobre episodios de teleoperación. La información proporcionada no detalla la composición interna de capas, el mecanismo exacto de generación de acciones ni el número de tokens vistos, por lo que esos extremos deben confirmarse leyendo el `config.json` del repositorio. Lo que sí está documentado es la interfaz: observaciones multimodales (dos vistas RGB y estado propioceptivo de 7 dimensiones) y predicción de chunks de 50 acciones absolutas en el espacio de articulaciones del Piper.

El entrenamiento se hizo sobre 100 demostraciones del dataset de inserción de perno hexagonal, con batch size 16, un solo proceso y un objetivo de 20.000 actualizaciones (equivalentes a unas 320.000 muestras procesadas). El autor aclara que el run se inicializó desde un checkpoint previo (paso 50) y que el dataset de 80 demostraciones "zero-home", recogido aparte, no se usó en este entrenamiento. No se documenta el régimen de aprendizaje (RLHF, DPO u otro ajuste posterior); en imitación supervisada de políticas VLA lo habitual es *behavior cloning* sobre acciones, pero no se confirma en la información disponible.

Un detalle técnico destacable es la trazabilidad: se incluyen `training_step.json` verificado desde `training_state/` del checkpoint original, `checkpoint_info.json`, `publication_manifest.json` con hashes de los ficheros subidos, y coincidencia SHA-256 de los siete ficheros de política y procesadores. El estado de optimizador, scheduler y RNG no se exporta (export de inferencia).

## Capacidades

- Control visomotor para una tarea de inserción de precisión: agarre de perno hexagonal y colocación en la abertura correspondiente.
- Fusión de dos cámaras RGB (vista cenital y vista angulada) con el estado propioceptivo de 7 articulaciones.
- Predicción de acciones en *chunk* de 50 pasos, lo que reduce la frecuencia efectiva de inferencia necesaria.
- Salida en espacio absoluto de articulaciones (grados) y pinza (milímetros), interpretable directamente con los normalizadores guardados.
- Condicionamiento por instrucción de tarea en lenguaje natural (la tarea aparece descrita en la model card); no hay evidencia de cobertura multilingüe ni de generalización a instrucciones distintas.
- No soporta *tool calling* ni *function calling*: no es un modelo de texto, es una política de control.
- No dispone de agentes multi-paso ni modo de razonamiento explícito (*thinking*); el único horizonte temporal es el chunk de 50 acciones.
- No tiene capacidades de audio ni de visión generalista fuera del dominio de las cámaras de entrenamiento.

## Casos de uso

- Inserción de pernos en línea de montaje: el modelo recibe las dos vistas y el estado del Piper y emite los 7 objetivos absolutos para ejecutar el agarre y la inserción, con chunks de 50 acciones que permiten un bucle de control a menor frecuencia.
- Línea base reproducible para nuevos checkpoints: al estar verificado el paso 20.000 y los hashes, sirve como referencia fija contra la que comparar fine-tunes posteriores (por ejemplo, con el dataset de 80 demostraciones zero-home).
- Estudio de escalado de entrenamiento en imitación: con batch 16 y 20.000 pasos documentados, permite analizar curvas de éxito frente a pasos y tamaño de lote en una tarea de contacto rico.
- Evaluación de robustez en simulación: reinyectar observaciones grabadas o sintéticas (cámaras + estado) para medir la sensibilidad de la política a cambios de iluminación, encuadre o posición inicial antes de tocar hardware.
- Docencia y formación en VLA: ejemplo completo y pequeño (1,2 GB, 450 M de parámetros) de pipeline LeRobot con pre/postprocesado, normalización y procedencia de datos incluidos.
- Punto de partida para destilación o despliegue en hardware de borde: el tamaño del checkpoint permite ejecutarlo en una GPU de gama media junto al resto del *stack* de control, algo inviable con VLA de miles de millones de parámetros.
- Prototipado de agarre con unidades físicas reales: las salidas en milímetros para la pinza y grados para las articulaciones facilitan la integración con los límites y la cinemática del Piper sin conversiones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "esta publicación no establece éxito físico de inserción ni robustez". No hay tasas de éxito, métricas de error de posición, tiempos de ciclo ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,9 GB en bf16/fp16 (450 M de parámetros); con dos flujos de cámara, estado y chunk de 50 acciones, el pico realista se sitúa en el rango de 2-4 GB. Es una estimación a partir del recuento de parámetros, no un dato medido publicado.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4070, RTX 4090) es suficiente; A100/H100 solo tendrían sentido para entrenamiento o para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: sí, con holgura, incluidas GPU de 8 GB y potencialmente plataformas integradas tipo Jetson Orin, aunque esto último no está verificado.
- Opciones de despliegue: la vía documentada es LeRobot con PyTorch, mediante `SmolVLAPolicy.from_pretrained(...)`; no se documentan exportaciones a ONNX, TensorRT, llama.cpp, Ollama, vLLM ni TGI (ninguna de estas herramientas aplica a una política de control).
- Latencia y throughput: no disponibles. El chunk de 50 acciones amortigua el coste por paso de control, pero no se publica frecuencia de inferencia ni tiempo por chunk.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentación pública de cada familia y deben verificarse antes de usarse en una decisión de producción; no forman parte de la información proporcionada en esta ficha.

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (Piper hex-bolt SmolVLA, step 20.000) | 450.046.176 | VLA por imitación, tarea única | No disponible | HuggingFace, vía LeRobot |
| SmolVLA base (familia) | ~450 M | VLA visión-lenguaje-acción | Consultar en el repositorio base (no disponible aquí) | HuggingFace / LeRobot |
| ACT (estilo ALOHA) | Decenas de millones | Política de imitación con acciones chunked | Consultar | LeRobot |
| OpenVLA | ~7 B | VLA de propósito general | Consultar (habitualmente permisiva) | HuggingFace |
| π0 / políticas de flujo de gran escala | Miles de millones | VLA con cabezal de flow matching | Consultar | Repositorios de los autores |

Diferencias cualitativas relevantes: frente a SmolVLA base, este checkpoint está especializado en una sola tarea, con una sola configuración de cámaras y un robot concreto; frente a VLA de miles de millones de parámetros, sacrifica generalización por coste de inferencia y facilidad de despliegue; frente a ACT, añade condicionamiento por lenguaje y un backbone visión-lenguaje, a costa de un tamaño mucho mayor.

## Limitaciones y advertencias

- Tarea única: la política está entrenada exclusivamente para "coger el perno hexagonal y colocarlo en la abertura correspondiente"; no se ha validado su comportamiento en otras tareas, objetos o disposiciones.
- Sin evidencia de éxito físico: el autor declara explícitamente que la publicación no demuestra éxito de inserción ni robustez. La verificación cubre el paso de entrenamiento y la integridad de los ficheros, no el rendimiento.
- Dependencia estricta de la configuración de cámaras: hay que replicar la disposición cenital y angulada, las unidades (grados y milímetros), el bloqueo de la articulación 4 y los límites del robot indicados en el entrenamiento.
- Dataset limitado (100 demostraciones) y sin aumento documentado: riesgo alto de sobreajuste al entorno, iluminación y posición inicial de las demostraciones.
- El dataset de 80 demostraciones zero-home no se usó en este entrenamiento; no debe asumirse que el modelo cubre esa distribución.
- Licencia no especificada: no hay autorización explícita de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no especificados: no hay garantía de que el condicionamiento por lenguaje funcione en castellano ni en instrucciones distintas de la descrita.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como toda política generativa, puede producir trayectorias suaves y aparentemente válidas que fallen en el contacto físico.
- Sin estado de optimizador, scheduler ni RNG en el export: el repositorio sirve para inferencia y fine-tuning, pero no para reanudar el entrenamiento exactamente donde se dejó.
- No hay métricas de latencia ni de frecuencia de control publicadas; el despliegue en tiempo real requiere medición propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samisaliveagain/piper-hexbolt-smolvla-bs16-step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Paper de la familia SmolVLA: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible
