# DreamMachines/actuator_unboxing_speedcond_t1_fullft_bs256

## Resumen

Este repositorio contiene un ajuste fino completo (*full fine-tune*) del modelo base `lerobot/pi05_base`, un modelo de visión-lenguaje-acción (VLA) de la familia pi0.5 de Physical Intelligence, publicado por el usuario DreamMachines bajo la librería LeRobot. El modelo resuelve una tarea robótica bimanual muy concreta: extraer un actuador de una caja y colocarlo en una bandeja, a partir de tres cámaras de 224×224, un estado de 14 dimensiones y un *prompt* de texto en inglés que incluye un token de velocidad (`slow`, `fast` o `unknown`).

La relevancia de la ficha no está en el rendimiento generalista, sino en el experimento que documenta: comprobar si pi0.5 puede condicionarse mediante tokens de texto antes de abordar el condicionamiento por ventaja (RECAP, π*0.6). Los datos de entrenamiento son 198 episodios teleoperados a 50 fps etiquetados como `slow`, más dos copias de cada episodio que conservan solo los fotogramas pares o impares y se etiquetan como `fast` (594 episodios, 348.616 fotogramas en total), de modo que las imágenes de ambas clases son idénticas y solo el token de texto las distingue.

El modelo tiene 3.353.433.872 parámetros (unos 3,35 mil millones) y un repositorio de 31,1 GB en formato safetensors. El autor reporta que cambiar el token mueve el *chunk* de acciones predicho en 0,438, es decir 9,3 veces el ruido de muestreo (0,047), y que el movimiento por paso predicho con `fast` es 1,76 veces el de `slow` (el ratio real en los datos es 1,92). La licencia y los idiomas soportados no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo de tipo vision-language-action (VLA) de la familia pi0.5, ajustado desde `lerobot/pi05_base` |
| Parametros totales | 3.353.433.872 (aproximadamente 3,35 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible; los *prompts* documentados están en inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | `lerobot/pi05_base` |
| Modalidad de entrada | Tres cámaras RGB de 224×224, estado de 14 dimensiones y *prompt* de texto |
| Dimension de accion | 14 dimensiones, predichas por *chunks* |
| Frecuencia de los datos de entrenamiento | 50 fps |
| Tamano del repositorio | 31,1 GB |
| Libreria | LeRobot |
| Tarea declarada | *Robotics* (pipeline `robotics`) |

## Arquitectura y entrenamiento

No se proporciona una descripción arquitectónica detallada en la información disponible. Lo que sí se documenta es que se trata de un ajuste fino completo del modelo `lerobot/pi05_base` (familia pi0.5), un modelo VLA que consume imágenes de tres cámaras de 224×224, un vector de estado de 14 dimensiones y una instrucción de texto, y que produce *chunks* de acciones de 14 dimensiones. El *prompt* empleado es `Take an actuator from the box and place it in the tray. Speed: <slow|fast|unknown>`. El uso de un token `unknown` en el 30 % de las muestras de entrenamiento corresponde a un *null prompt* para *classifier-free guidance*, lo que confirma que el modelo se muestrea con guiado.

El entrenamiento consistió en 4.000 pasos (aproximadamente 3 épocas) con *batch* de 256, tasa de aprendizaje 5e-5, calentamiento lineal del 10 % y decaimiento coseno durante el último 25 % hasta 2,5e-6, ejecutado en 8×H100 con un *fork* de LeRobot de Dream Machines. El conjunto de datos no está publicado en el Hub y consta de 198 episodios teleoperados a 50 fps etiquetados como `slow`, más dos copias de cada episodio que conservan únicamente los fotogramas pares o impares y se etiquetan como `fast`, hasta un total de 594 episodios y 348.616 fotogramas. Como las imágenes de las clases `slow` y `fast` son las mismas, la única señal que distingue la velocidad es el token de texto.

## Capacidades

- Generación de acciones robóticas bimanuales para una tarea concreta de *pick-and-place* (sacar un actuador de la caja y depositarlo en la bandeja).
- Condicionamiento de la velocidad de ejecución mediante un token de texto (`slow`, `fast`, `unknown`) en el *prompt*.
- Inferencia multimodal: procesa simultáneamente tres cámaras RGB de 224×224 y un estado proprioceptivo de 14 dimensiones.
- Predicción por *chunks* de acciones de 14 dimensiones, con muestreo repetido (8 *chunks* por *prompt* en la evaluación reportada).
- Soporte de *classifier-free guidance* mediante la etiqueta `unknown` como *null prompt*.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, *tool calling*, uso de agentes, visión generalista, audio ni modo de razonamiento explícito; no es un modelo de lenguaje de propósito general.
- Capacidades multilingües: no disponibles; solo se documentan *prompts* en inglés.

## Casos de uso

- Manipulación bimanual en línea de montaje: el modelo ejecuta de forma autónoma la secuencia de desembalaje de actuadores y colocación en bandeja, adecuado porque ha sido ajustado específicamente sobre 198 episodios teleoperados de esa misma tarea con tres cámaras y estado de 14 dimensiones.
- Control de ciclo ajustable por texto: un mismo *checkpoint* puede producir trayectorias lentas o rápidas según el token (`fast` genera 1,76× el movimiento por paso de `slow`), lo que permite adaptar el ritmo de la celda sin reentrenar.
- Generación de trayectorias de referencia para planificación: los *chunks* condicionados permiten obtener variantes de una misma maniobra con distinta velocidad para su uso como referencia en un planificador de nivel superior.
- Investigación en condicionamiento por lenguaje: sirve como banco de pruebas reproducible para estudiar si pi0.5 acepta señales discretas en el *prompt* antes de pasar a condicionamiento por ventaja (RECAP, π*0.6).
- Desarrollo de métodos de aumento de datos: el esquema de submuestreo par/impar documentado permite estudiar cómo varía la política cuando solo cambia la etiqueta y no los píxeles.
- Ajuste fino posterior para nuevas tareas: el repositorio puede actuar como punto de partida para *fine-tunes* de otras tareas de *pick-and-place* con control de velocidad, reutilizando la receta de entrenamiento (4.000 pasos, *batch* 256, 8×H100).
- Evaluación comparativa de políticas VLA: al estar basado en `lerobot/pi05_base` y usar LeRobot, es integrable como referencia en experimentos de manipulación bimanual con velocidad condicionada.
- Análisis de política bajo *classifier-free guidance*: el uso de `unknown` en el 30 % de las muestras permite estudiar el compromiso entre fidelidad al token y diversidad de *chunks*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible; no son aplicables a una política robótica. Los únicos datos cuantitativos aportados son de evaluación sobre episodios reservados:

| Metrica | Valor | Referencia indicada por el autor |
|---|---|---|
| Desplazamiento del *chunk* predicho al cambiar el token | 0,438 | 9,3× el ruido de muestreo (0,047) |
| Ruido de muestreo | 0,047 | Base de comparación del desplazamiento anterior |
| Movimiento por paso predicho con `fast` frente a `slow` | 1,76× | Ratio real en los datos: 1,92 |
| Condicion `unknown` | Valor intermedio entre `slow` y `fast` | No se aporta cifra exacta |

Las cifras corresponden a 8 *chunks* muestreados por *prompt* sobre episodios reservados, según la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado del número de parámetros, no aportado por el autor): en bf16, unos 6,7 GB solo de pesos, más activaciones y los codificadores visuales de las tres cámaras; conviene reservar 12-16 GB. En int8, unos 3,4 GB; en int4, unos 1,7 GB.
- GPU de entrenamiento documentadas: 8×H100 para el ajuste fino completo.
- GPU recomendadas para inferencia: cualquier GPU con 16 GB o más (RTX 4090, A100, H100). En 24 GB (RTX 3090/4090) el modelo cabe con holgura en bf16; en GPUs de 12-16 GB probablemente requiere cuantización, aunque no se publican recetas de cuantización.
- Inferencia en GPU de consumo: factible en RTX 4090 o RTX 3090 en bf16, siempre que se respete el *pipeline* de LeRobot y el número de cámaras de entrada.
- Opciones de despliegue: LeRobot sobre PyTorch con pesos safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son herramientas orientadas a políticas VLA.
- Latencia y *throughput* estimados: no disponibles.
- Nota sobre el repositorio: los 31,1 GB publicados son muy superiores a los ~6,7 GB que ocuparían los 3,35 mil millones de parámetros en bf16, lo que sugiere la inclusión de estados de optimizador o de copias adicionales; no se detalla en la información disponible.

## Comparativa con modelos similares

Los datos comparativos no están disponibles en la información proporcionada; se indican las alternativas de la misma categoría (políticas VLA para manipulación) sin cifras confirmadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `DreamMachines/actuator_unboxing_speedcond_t1_fullft_bs256` | 3,35 mil millones | No disponible | No disponible | safetensors en HuggingFace; 0 descargas, 0 *likes* | Ajuste fino de `lerobot/pi05_base` con token de velocidad |
| `lerobot/pi05_base` | No disponible | No disponible | No disponible | Público en HuggingFace | Modelo base sobre el que se ajusta; sin condicionamiento de velocidad específico |
| Otros modelos VLA de manipulación (por ejemplo, la propia familia pi0 y alternativas abiertas del mismo segmento) | No disponible | No disponible | No disponible | No disponible | No se aportan datos comparativos en la información disponible |

## Limitaciones y advertencias

- Especialización extrema: es una política para una única tarea bimanual de desembalaje de actuadores; no generaliza a otras tareas, objetos ni morfologías sin un nuevo ajuste fino.
- Dependencia del *embodiment*: requiere tres cámaras de 224×224, estado de 14 dimensiones y acciones de 14 dimensiones a 50 fps; desplegarlo en otro robot exige adaptar las interfaces de observación y acción.
- La etiqueta de velocidad es artificial: los datos `fast` son copias submuestreadas de los mismos fotogramas, de modo que la señal de velocidad procede solo del token. El ratio predicho (1,76×) no alcanza el ratio real de los datos (1,92), lo que indica que el condicionamiento es imperfecto.
- Licencia no declarada: no hay autorización explícita de uso comercial, lo que supone incertidumbre legal para integrarlo en producto.
- Riesgo de acciones fuera de distribución: en políticas VLA el fallo típico es la acumulación de error en el horizonte de ejecución y la generación de acciones no vistas cuando el estado o las imágenes se alejan del conjunto de teleoperación. No se documentan tasas de fallo, análisis de sesgos ni evaluaciones de robustez en la información disponible.
- Idiomas: solo se documentan *prompts* en inglés; no hay evidencia de que las instrucciones en otros idiomas funcionen.
- Trazabilidad limitada: 0 descargas y 0 *likes*, sin validación independiente por parte de la comunidad; el conjunto de datos de entrenamiento no está publicado, por lo que el experimento no es reproducible a partir de los ficheros del Hub.
- Ausencia de capacidades de lenguaje: no debe evaluarse como un modelo de texto. No hay generación de lenguaje, *tool calling* ni razonamiento multi-paso documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DreamMachines/actuator_unboxing_speedcond_t1_fullft_bs256
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a páginas turísticas e históricas sobre el Valle de los Reyes, sin relación con el modelo ni con robótica.
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
