# Mrwlker/pi05_multitask_40min

## Resumen

pi05_multitask_40min es un ajuste fino corto, de 1.800 pasos de optimización, del modelo de visión-lenguaje-acción π0.5, publicado por el usuario Mrwlker en HuggingFace bajo licencia Apache 2.0. Está entrenado con la librería LeRobot para el robot humanoide Unitree G1 equipado con manos Dex3-1, y cubre cinco tareas de manipulación: colocar la taza blanca sobre el portafiltros, colocación de objetos, verter agua, preparar tostadas y empaquetado de cámaras.

No es un modelo final, sino un experimento controlado de mezcla de datos. El autor parte de su propio checkpoint anterior (pi05_cotreino_completo, 60.000 pasos) y reequilibra la proporción de cuadros por tarea para corregir un sesgo detectado: una tarea externa (toasted bread) acaparaba el 35,2 % de los cuadros, el doble que la tarea propia, y el robot acababa barriendo la mesa con la mano abierta y empujando objetos sin cerrar los dedos.

El checkpoint tiene 4.143.404.845 parámetros (unos 4,14 mil millones) y un repositorio de 9,4 GB en safetensors. Su interés es metodológico: documenta el efecto de reequilibrar un dataset multitarea sobre un VLA aplicado a un humanoide, con una mezcla de tareas explícita y una advertencia clara de que el modelo no ha sido evaluado en ejecución real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) de la familia π0.5, etiquetado como pi0 y LeRobot en HuggingFace; la model card no detalla la arquitectura interna |
| Parámetros totales | 4.143.404.845 (~4,14 B), dato real de safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje y la model card no documenta ventana de contexto. La política consume observaciones multimodales y emite acciones en chunks de 50 |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors (bfloat16). No se documentan variantes GGUF, int8 ni int4 |
| Idiomas soportados | no disponible; el modelo no está descrito como generador de lenguaje |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

Entradas y salidas documentadas:

| Señal | Especificación |
|---|---|
| observation.images.head_camera | 3×480×848 |
| observation.images.right_wrist_camera | 3×224×224 |
| observation.state | 29 dimensiones: 14 juntas de brazo + kWaistYaw + 14 juntas de las dos manos Dex3 |
| action | las mismas 29 dimensiones, en chunks de 50 |
| Profundidad | desactivada (use_depth_3d: false) |
| Presión | no usada |

## Arquitectura y entrenamiento

El modelo es un derivado de π0.5, un VLA que combina un codificador visual con un decodificador de acciones; en la familia π0/π0.5 de Physical Intelligence este decodificador se formula mediante flow matching y genera secuencias de acciones en lugar de tokens de texto. La model card de este checkpoint no especifica el backbone concreto ni el número de tokens de entrenamiento, por lo que esos datos quedan como no disponibles. Lo que sí detalla es la interfaz exacta: dos cámaras (cabeza y muñeca derecha), un vector de estado de 29 dimensiones y salida de acciones en chunks de 50, sin profundidad ni sensores de presión.

El entrenamiento consistió en 1.800 pasos con batch de 4, learning rate 5e-6, 200 pasos de warmup, bfloat16 y gradient checkpointing, sobre una A100 de 80 GB a 0,86 s/paso (unos 26 minutos en total). La innovación del experimento está en la composición del dataset: cada tarea externa se limitó a unos 80.000 cuadros y la tarea propia se mantuvo completa.

| Tarea | Episodios | Cuadros | Peso antes | Peso ahora |
|---|---:|---:|---:|---:|
| place the white cup on the dripper | 299 | 169.832 | 17,2 % | 34,8 % |
| object placement | 170 | 79.560 | 9,8 % | 16,3 % |
| pour water | 204 | 79.764 | 12,2 % | 16,3 % |
| toasted bread | 95 | 79.990 | 35,2 % | 16,3 % |
| camera packaging | 62 | 79.050 | 25,6 % | 16,2 % |

No se documenta uso de RLHF ni de DPO; se trata de aprendizaje por imitación (behavior cloning) sobre demostraciones.

## Capacidades

- Política de manipulación por imitación para el Unitree G1 con manos Dex3-1, con control de 29 grados de libertad (14 juntas de brazo, kWaistYaw y 14 juntas de mano).
- Ejecución multitarea: cinco tareas de manipulación entrenadas de forma conjunta en un único checkpoint.
- Generación de acciones en chunks de 50, lo que permite planificar secuencias cortas de movimiento en lugar de pasos aislados.
- Percepción visual mediante dos cámaras simultáneas (cabeza a 480×848 y muñeca derecha a 224×224).
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de una política robótica de este tipo).
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no genera texto ni cadenas de razonamiento.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no se documentan modo de pensamiento (thinking), audio ni profundidad.

## Casos de uso

- Investigación en mezcla de datasets multitarea: el propio checkpoint sirve como referencia reproducible para medir cómo afecta la proporción de cuadros por tarea al comportamiento final de un VLA; el autor publica la tabla de pesos antes y después para replicar el experimento.
- Colocación de la taza sobre el portafiltros: es la tarea con mayor peso (34,8 %, 169.832 cuadros) y sirve como banco de pruebas para ajustes de precisión en manipulación fina con manos articuladas.
- Colocación de objetos (object placement): escenario de pick-and-place con el G1 que puede usarse como base para evaluar generalización posicional dentro de una misma tarea.
- Vertido de agua (pour water): tarea que exige control continuo de orientación de la muñeca y que permite estudiar la estabilidad del chunk de acciones de 50 pasos en movimientos prolongados.
- Empaquetado de cámaras (camera packaging): caso de uso de tipo industrial, útil como tarea de referencia para medir transferencia desde demostraciones externas.
- Punto de partida para ajustes posteriores: al ser un ajuste de 1.800 pasos sobre pi05_cotreino_completo, puede emplearse como inicialización de corridas más largas sin repetir el reequilibrio del dataset.
- Integración en pipelines de LeRobot: sirve para validar el flujo completo de carga de pesos, preprocesado de observaciones y ejecución de políticas en el framework antes de lanzar entrenamientos costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no fue evaluado en ejecución y que ningún número de la model card mide si el robot cumple la tarea.

Los únicos datos cuantitativos publicados son la pérdida de validación y la métrica de error del checkpoint anterior:

| Métrica | Valor |
|---|---|
| val_loss en el paso 900 | 0,1076 |
| val_loss en el paso 1800 | 0,1046 (mejora del 2,8 %) |
| Error del brazo derecho en el checkpoint anterior (replay) | 0,131 rad |
| Error de la línea base "no mover el robot" (replay del checkpoint anterior) | 0,099 rad |

Advertencia del propio autor: la val_loss de esta corrida no es comparable con la de la corrida anterior, porque los episodios de validación son distintos (aquí 3 por cada una de las 5 tareas; en la anterior, 15 solo de la tarea propia).

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 8,3 GB solo de parámetros (4,14 B × 2 bytes).
- VRAM estimada para inferencia: entre 10 y 16 GB contando el codificador visual de dos cámaras, los buffers de observación y las activaciones. Es una estimación a partir del número de parámetros, no un dato publicado.
- Entrenamiento documentado: 1 GPU A100 de 80 GB, batch 4, bfloat16 con gradient checkpointing, 0,86 s/paso.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o L4 para servicio; RTX 4090 y RTX 3090 (24 GB) son suficientes con holgura para inferencia en bfloat16.
- GPU de consumo: sí cabe en tarjetas de 24 GB. En tarjetas de 16 GB (RTX 4080, A4000) es probable que entre en bfloat16 según la estimación anterior, pero no está verificado por el autor.
- Cuantizaciones: no hay versiones GGUF, int8 ni int4 publicadas; cualquier reducción de precisión requeriría conversión propia y no está validada.
- Opciones de despliegue: LeRobot es el framework nativo (librería declarada en el repositorio). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que además no encajan con una política que consume imágenes y estado y produce acciones.
- Latencia y throughput de inferencia: no disponible. El único dato temporal publicado es de entrenamiento (0,86 s/paso con batch 4).

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentación pública y no de la información proporcionada en esta ficha; se incluyen como referencia y conviene verificarlos antes de citarlos.

| Modelo | Parámetros | Categoría | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05_multitask_40min (este) | ~4,14 B | VLA para Unitree G1 + Dex3 | Apache 2.0 | Pesos en HuggingFace (LeRobot) |
| π0 (Physical Intelligence) | ~3,3 B (documentación pública) | VLA generalista | Apache 2.0 (repositorio openpi) | Pesos abiertos |
| π0.5 (Physical Intelligence) | no disponible | VLA generalista, base de este ajuste | no disponible | no disponible |
| OpenVLA-7B | ~7 B | VLA para brazos manipuladores | MIT (según model card pública) | Pesos abiertos en HuggingFace |
| GR00T N1 (NVIDIA) | ~2,2 B (documentación pública) | VLA para humanoides | Licencia propia de NVIDIA | Pesos abiertos |

Diferencias relevantes: este checkpoint está especializado en un robot concreto (G1) y un conjunto cerrado de cinco tareas, mientras que π0, π0.5 y OpenVLA apuntan a generalización entre plataformas. Frente a ellos, su ventaja es la trazabilidad del experimento de mezcla de datos; su desventaja, que no hay ninguna evaluación de éxito en ejecución publicada. La comparación de rendimiento con cualquiera de estas alternativas no está disponible.

## Limitaciones y advertencias

- Entrenamiento muy corto: 1.800 pasos es un test de mezcla, no una corrida completa. La mejora entre el paso 900 y el 1800 es solo del 2,8 % en val_loss.
- Sin evaluación en ejecución: ningún dato publicado mide si el robot completa las tareas. El rendimiento real es desconocido.
- val_loss no comparable con la corrida anterior: los episodios de validación son distintos (3 por tarea frente a 15 solo de la tarea propia). Comparar corridas exige error en radianes sobre los mismos episodios.
- Antecedente de fallo de política: en el checkpoint previo, el error del brazo derecho (0,131 rad) era peor que no mover el robot (0,099 rad), con el robot empujando objetos con la mano abierta.
- Dimensión de cintura poco fiable: kWaistYaw es 0,0 en todos los cuadros de las cuatro tareas externas, porque Unitree grabó con el tronco fijo. Cabe esperar poco de esa dimensión.
- Sensores limitados: sin profundidad (use_depth_3d: false) y sin presión; en los datasets externos convertidos desde Unitree ambas señales son ceros y el decodificador de profundidad devuelve 10 m uniformes.
- Sesgo de mezcla del dataset: las cuatro tareas externas pesan lo mismo (16,2-16,3 %) y la propia el 34,8 %, una decisión de diseño que puede favorecer la tarea principal frente a las demás.
- Sin datos de sesgo social ni de idioma: no aplica un análisis de sesgo lingüístico, pero tampoco hay evaluación de sesgo de comportamiento en manipulación.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de π0.5 conviene revisar las condiciones de la licencia del modelo base y de los datasets de demostración utilizados.
- Sin cuantizaciones ni despliegue alternativo validado: cualquier conversión a int8/int4 o despliegue fuera de LeRobot queda por verificar.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan reportes externos de funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mrwlker/pi05_multitask_40min
- Repositorio openpi de Physical Intelligence (familia π0/π0.5): no disponible en la información proporcionada
- Paper de π0/π0.5: no disponible en la información proporcionada
- Repositorio de LeRobot: no disponible en la información proporcionada
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; las entradas devueltas trataban sobre alfabeto francés, conversión de unidades de almacenamiento, el símbolo tilde, diagramas de Voronoi y el buscador Yandex, sin relación con el modelo.
