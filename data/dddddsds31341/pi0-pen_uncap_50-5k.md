# dddddsds31341/pi0-pen_uncap_50-5k

## Resumen

pi0-pen_uncap_50-5k es un checkpoint en formato Orbax publicado en Hugging Face por el usuario dddddsds31341, resultado de un ajuste fino completo (full fine-tuning) del modelo base pi0_base sobre el conjunto de datos pen_uncap_50. No es un lanzamiento oficial de Physical Intelligence, sino un artefacto derivado del ecosistema openpi, empaquetado junto con las estadísticas de normalización del dataset para poder evaluarse directamente sin pasos adicionales de preprocesado.

La tarea aprendida es una manipulación bimanual muy concreta: un brazo sujeta el cuerpo del bolígrafo, el otro la tapa, se separan tirando y ambas piezas se depositan por separado en la mesa. La model card incluye el prompt exacto que actúa como instrucción en lenguaje natural para el modelo visión-lenguaje-acción.

El checkpoint corresponde al paso 5.000 de un total previsto de 20.005 pasos, con batch size 32, es decir, aproximadamente el 25 % del plan de entrenamiento. Es, por tanto, un estado intermedio y no el modelo final del experimento. El repositorio ocupa 12,0 GB y no declara ni licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); modelo base pi0_base, descrito en openpi como VLA flow-based. La topología interna no se detalla en la información disponible |
| Parámetros totales | No disponible en la información proporcionada (el repositorio ocupa 12,0 GB) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. Se distribuye únicamente como checkpoint Orbax en precisión de entrenamiento; no hay cuantizaciones publicadas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible. La instrucción incluida en la model card está en inglés |
| Licencia | No disponible (no declarada en la model card ni en los metadatos de Hugging Face) |
| Formato de pesos | Orbax (parámetros del modelo + estadísticas de normalización del dataset) |
| Pipeline declarado | robotics |
| Modelo base | pi0_base |
| Dataset de ajuste fino | pen_uncap_50 |
| Paso de entrenamiento | 5.000 de 20.005 |
| Batch size | 32 |
| Tamaño del repositorio | 12,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-25 / 2026-10-25 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de pi0, el VLA de tipo flow-based publicado por el equipo de Physical Intelligence en el repositorio openpi. Según la documentación de ese proyecto, los checkpoints base de pi0 están preentrenados sobre más de 10.000 horas de datos robóticos, lo que proporciona al modelo un prior de percepción y control sobre el que se aplica el ajuste fino. openpi distribuye además pi0-FAST, una variante autorregresiva basada en el tokenizador de acciones FAST, y pi0.5, una versión mejorada de pi0 con mejor generalización a entornos abiertos; este checkpoint concreto parte de pi0_base, no de esas variantes.

El ajuste fino es completo (todos los parámetros), sobre el dataset pen_uncap_50 y con la instrucción en lenguaje natural que describe la secuencia de descapuchado. El artefacto resultante incluye los parámetros Orbax y las estadísticas de normalización del dataset, lo que lo hace directamente cargable por el stack de openpi. No se especifican en la información disponible el número de tokens, la composición del dataset, el número de demostraciones, la plataforma robótica empleada ni si hubo etapas de RLHF o DPO; en un VLA de imitación como este, el objetivo habitual es la predicción de acciones por imitación, pero ese extremo no está documentado en la model card.

## Capacidades

- Manipulación bimanual de precisión: coordinación de dos efectores para sujetar simultáneamente cuerpo y tapa de un bolígrafo.
- Ejecución de una secuencia de acciones compuesta (agarre, tracción, separación, colocación) a partir de una instrucción en lenguaje natural.
- Condicionamiento por lenguaje: el comportamiento queda especificado por el prompt incluido en la model card.
- Percepción visual integrada: al ser un VLA, consume observaciones visuales además del estado del robot (resolución y número de cámaras no disponibles).
- Salida de acciones motrices en el espacio de control del robot de recogida (dimensionalidad y frecuencia no disponibles).
- Capacidades de lenguaje general, razonamiento textual, generación de código o matemáticas: no documentadas para este checkpoint; el ajuste fino está orientado exclusivamente a la política de control.
- Tool calling / function calling: no soportado ni documentado.
- Uso como agente multi-paso con planificación simbólica: no documentado; la política ejecuta una tarea única.
- Capacidades multilingües: no documentadas.
- Modo "thinking", visión general, audio: no disponibles.

## Casos de uso

- Reproducción del experimento pen_uncap_50: sirve como referencia intermedia para verificar que el pipeline de entrenamiento de openpi converge correctamente en las primeras 5.000 iteraciones con batch 32.
- Estudio de dinámica de entrenamiento: al existir un checkpoint hermano en el paso 15.000 (pi05-pen_uncap_50-15k) sobre el mismo dataset, permite comparar curvas de aprendizaje y calidad de política entre pasos y entre arquitecturas base (pi0 frente a pi0.5).
- Punto de partida para transfer learning: inicializar un ajuste fino sobre tareas bimanuales relacionadas (desenroscar tapones, ensamblar piezas de dos componentes) partiendo de un modelo que ya ha aprendido la coordinación de dos pinzas.
- Validación de infraestructura de despliegue: probar el servidor de políticas de openpi, la serialización Orbax, la carga de estadísticas de normalización y la latencia extremo a extremo antes de invertir en entrenamientos más largos.
- Docencia y divulgación: ejemplo autocontenido de VLA de imitación con una instrucción en lenguaje natural explícita, útil en cursos de robótica o aprendizaje por imitación.
- Pruebas de evaluación en simulación: ejecutar rollouts en un entorno simulado replicando la tarea de descapuchado para medir tasas de éxito relativas sin consumo de hardware físico.
- Base para comparativas internas de checkpoint: al ser un estado intermedio, permite justificar empíricamente si merece la pena continuar el entrenamiento hasta los 20.005 pasos planificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tasa de éxito de la tarea, ni métricas de error de acción, ni evaluaciones en simulación o en robot real. Tampoco se aportan cifras de latencia o throughput.

## Requisitos de hardware

- Almacenamiento y RAM de sistema: el repositorio ocupa 12,0 GB; la descarga y la deserialización del checkpoint Orbax requieren al menos ese espacio en disco y una cantidad de RAM anfitriona del mismo orden antes de mover los pesos al acelerador.
- VRAM estimada para inferencia: no disponible de forma oficial. Como estimación basada en el tamaño del repositorio, la carga en el formato de distribución no debería caber en GPUs con 12 GB o menos.
- GPU recomendadas: no hay recomendación del autor. Por el orden de magnitud del checkpoint, son opciones razonables A100 (40 u 80 GB), H100 y L40S para evaluación desatendida; una RTX 4090 (24 GB) es la candidata realista dentro de consumo, siempre que los pesos se carguen sin margen adicional para el resto del stack.
- Cabe en GPU de consumo: probablemente en RTX 4090 y RTX 3090 (24 GB); arriesgado o inviable en RTX 4080/4070 Ti y en cualquier tarjeta de 16 GB o menos. No confirmado por el autor.
- Opciones de despliegue: el stack de openpi (servidor de políticas y cliente) es la vía prevista, dado que el formato es Orbax. vLLM, TGI, llama.cpp y Ollama no son aplicables: no existe conversión a GGUF ni soporte de checkpoints VLA en esas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Pasos de entrenamiento | Dataset | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi0-pen_uncap_50-5k | pi0_base | 5.000 de 20.005 | pen_uncap_50 | Orbax | No disponible | Hugging Face, 0 descargas |
| pi05-pen_uncap_50-15k | pi0.5 | 15.000 | pen_uncap_50 | Orbax | No disponible | Hugging Face |
| pi0_base (openpi) | — | Preentrenado sobre más de 10.000 h de datos robóticos | Datos robóticos agregados (composición no detallada) | Checkpoint openpi | Según repositorio openpi (consultar) | GitHub y pesos publicados por Physical Intelligence |
| pi0-FAST (openpi) | — | Preentrenado sobre datos robóticos | Datos robóticos agregados | Checkpoint openpi | Según repositorio openpi (consultar) | GitHub de openpi |

No se dispone de datos de rendimiento comparado (tasas de éxito, MMLU, HumanEval u otros) para ninguno de estos checkpoints en la información proporcionada, por lo que la comparativa se limita a linaje, formato y disponibilidad.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 5.000 de 20.005, por lo que su calidad es presumiblemente inferior a la del estado final del entrenamiento. No debe presentarse como el resultado definitivo del experimento.
- Ausencia total de métricas: no hay tasa de éxito de la tarea ni evaluación en robot real, de modo que se desconoce si la política funciona de forma fiable.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución. Además, la licencia del modelo base pi0 de openpi condiciona cualquier uso derivado y debe verificarse por separado.
- Autoría de terceros: el repositorio pertenece a dddddsds31341, no a Physical Intelligence; no hay garantía de soporte, mantenimiento ni reproducibilidad del proceso de entrenamiento.
- Especialización extrema: la política está entrenada para una única tarea (descapuchar un bolígrafo); no generaliza a otras manipulaciones sin reentrenamiento.
- Sesgo de entorno: al no describirse la plataforma de recogida (brazos, pinzas, cámaras, iluminación, fondo, posiciones de los objetos), es esperable un fuerte sobreajuste a esa configuración concreta y una degradación rápida al cambiar de robot o de escena.
- Datos de entrenamiento opacos: se desconoce el número de demostraciones, su diversidad y si hubo aumento de datos, lo que impide estimar la varianza de la política.
- Idioma: la instrucción está en inglés y no se documenta comportamiento con instrucciones en castellano u otras lenguas.
- Sin cuantizaciones: la ausencia de versiones comprimidas limita el despliegue en hardware de borde y encarece la inferencia.
- Riesgo de alucinación motora: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, con riesgo físico si se ejecuta en un robot real sin supervisión ni paradas de seguridad.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/pi0-pen_uncap_50-5k
- Checkpoint hermano pi05-pen_uncap_50-15k: https://huggingface.co/dddddsds31341/pi05-pen_uncap_50-15k
- Repositorio oficial openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Espejo del repositorio openpi: https://github.com/YvanKOB/openpi---Physical-Intelligence
- Sitio del proyecto OpenPI: https://www.openpi.net/english.html
