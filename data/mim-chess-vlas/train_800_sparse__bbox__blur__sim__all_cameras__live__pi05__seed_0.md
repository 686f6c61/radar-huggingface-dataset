# mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live__pi05__seed_0

## Resumen

El modelo `train_800_sparse__bbox__blur__sim__all_cameras__live__pi05__seed_0` es un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05), un modelo de Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence y adaptado a la librería LeRobot de Hugging Face. Su función no es generar texto, sino producir acciones motoras de robot: recibe el estado articular y tres flujos de cámara, y emite un vector de acción de 7 dimensiones para un brazo robótico Franka Panda. El ajuste se ha entrenado sobre un dataset propio de 787 episodios y 195.184 fotogramas para resolver 40 tareas de tipo «coger un objeto y depositarlo en una caja».

El interés de este checkpoint es acotado pero concreto: es un ejemplo de política de imitación especializada en manipulación pick-and-place de objetos domésticos y de alimentación en un entorno tipo cocina, entrenada desde un modelo generalista de Physical Intelligence. Frente al modelo base, que busca generalización a entornos nuevos, este ajuste sacrifica amplitud para especializarse en un conjunto cerrado de objetos, un único robot y una configuración fija de tres cámaras.

Con 4.143.404.816 parámetros totales (≈4,14 B) y un repositorio de 121,6 GB, se trata de un modelo mediano-grande para el estándar de las políticas robóticas. La licencia es Apache-2.0 y los pesos se distribuyen en formato safetensors, lo que permite uso comercial y modificación, aunque con cero descargas y cero «likes» en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-Lenguaje-Acción (VLA) π₀.₅ (Pi05) de Physical Intelligence, implementada en LeRobot. Detalle de backbone no disponible en la información proporcionada |
| Parámetros totales | 4.143.404.816 (≈4,14 B) |
| Longitud de contexto | no disponible (política robótica; consume observaciones y estado, no una ventana de contexto de LLM) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | Panda (Franka Panda) |
| Cámaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Dimensión de entrada (estado) | `(9,)` |
| Dimensión de salida (acción) | `(7,)` |
| Frame rate del dataset de entrenamiento | 20 FPS |
| Dataset de entrenamiento | mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live |
| Tamaño del repositorio | 121,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-16 / 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es un modelo Visión-Lenguaje-Acción (VLA) de la familia π₀.₅, desarrollado por Physical Intelligence y adaptado a LeRobot desde su repositorio abierto OpenPI. La model card describe π₀.₅ como una evolución de π₀ orientada a la generalización en entornos y situaciones completamente nuevas. El modelo consume una observación multimodal —estado del robot de 9 dimensiones más tres imágenes RGB de 224×224 procedentes de tres cámaras (vista del agente y dos vistas de muñeca)— y produce un vector de acción de 7 dimensiones, que corresponde a los grados de libertad de un brazo Franka Panda. El detalle exacto del backbone de visión-lenguaje, el mecanismo de generación de acciones y el número de tokens de entrenamiento no están disponibles en la información proporcionada.

El ajuste fino se realizó con LeRobot 0.6.0 durante 60.000 pasos de entrenamiento, con tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 0 (de ahí el sufijo `seed_0` del identificador). El dataset asociado contiene 787 episodios y 195.184 fotogramas grabados a 20 FPS, e incluye 40 tareas de recogida y colocación en caja de distintos objetos (jamón, cebolla, manzana, huevo, cuchillo, tetera, etc.). El nombre del repositorio sugiere variantes de la configuración de datos (`sparse`, `bbox`, `blur`, `sim`, `all_cameras`, `live`), pero la model card no documenta qué significa cada una, por lo que no se puede afirmar qué aumento de datos o filtrado se aplicó. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias.

## Capacidades

- Generación de acciones motoras para manipulación robótica: dado el estado del robot y tres imágenes, emite un vector de acción de 7 dimensiones por paso de control.
- Ejecución de tareas pick-and-place sobre un conjunto cerrado de 40 objetos distintos, todas con el patrón «coger el objeto X y depositarlo en la caja».
- Percepción multimodal con tres cámaras simultáneas: una vista global del entorno (`agentview`) y dos vistas cenitales de la pinza (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`), lo que aporta información tanto de contexto como de precisión de agarre.
- Control de un brazo Franka Panda con espacio de acción de 7 grados de libertad.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (dataset de 787 episodios a 20 FPS).
- Despliegue mediante la CLI de LeRobot (`lerobot-rollout`) con especificación de tarea en lenguaje natural mediante el argumento `--task`.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, modo «thinking», audio ni capacidades multilingües en la información proporcionada.

## Casos de uso

- Automatización de pick-and-place en almacén o línea de envasado: el modelo puede colocarse como política de control de un Panda para trasladar objetos individuales a una caja, repitiendo la tarea con distintos objetos sin reentrenamiento mientras pertenezcan al conjunto de las 40 clases vistas.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible (semilla 0, hiperparámetros documentados, LeRobot 0.6.0) para comparar el efecto de cambios en el dataset o en el número de pasos de entrenamiento sobre una política VLA.
- Evaluación de transferencia sim-a-real: el nombre del repositorio incluye el marcador `sim`, y la model card declara tres cámaras reales, lo que permite estudiar hasta qué punto una política entrenada en simulación se comporta en hardware físico.
- Clasificación y manipulación de alimentos y menaje: el conjunto de tareas cubre 40 objetos de cocina (jamón, huevo, cebolla, manzana, pan, tetera, cuchillo, etc.), lo que lo hace utilizable en entornos de food service o cocinas robotizadas para tareas de recogida y colocación.
- Banco de pruebas de pipelines de datos robóticos: al estar asociado a un dataset con 195.184 fotogramas y 787 episodios etiquetados por tarea, es útil para validar herramientas de LeRobot (grabación, calibración, visualización con `visualize_dataset`) antes de escalar a datasets mayores.
- Integración en un bucle de control de frecuencia media: con datos de entrenamiento a 20 FPS, el modelo es candidato para bucles de control de hasta aproximadamente 20 Hz, adecuados para manipulación no crítica en tiempo real.
- Evaluación de robustez ante variaciones de cámara: al depender de tres vistas fijas, permite medir la degradación de la política al mover, ocluir o cambiar la resolución de alguna de las cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, métricas de precisión de agarre, comparaciones con π₀ ni evaluaciones en entornos reales o simulados.

## Requisitos de hardware

- Parámetros totales de 4,14 B. En precisión de 16 bits (bf16/fp16) los pesos ocupan aproximadamente 8,3 GB; en fp32, alrededor de 16,6 GB (estimaciones calculadas a partir del recuento de parámetros, el tipo real de peso no está documentado).
- VRAM estimada para inferencia: del orden de 10-14 GB en 16 bits, sumando pesos, activaciones y los búferes de las tres imágenes de 224×224. Cifra orientativa, no verificada por el autor.
- Repositorio de 121,6 GB, mucho mayor que los pesos de inferencia, lo que sugiere que incluye checkpoints intermedios y/o estados del optimizador; hay que prever espacio en disco suficiente para clonarlo o descargarlo completo.
- GPU recomendadas para inferencia: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) y RTX 3090 (24 GB). En consumer, una RTX 4090 o 3090 de 24 GB debería ser suficiente; una RTX 4080 de 16 GB queda en el límite; una RTX 3060 de 12 GB probablemente sea insuficiente o muy ajustada si se necesita margen para activaciones y visión.
- Despliegue: la vía documentada es LeRobot mediante `lerobot-rollout` con `--strategy.type=base`, `--robot.type=Panda` y `--policy.path=<repo>`. El modelo también procede del repositorio OpenPI de Physical Intelligence. No es un modelo de texto, por lo que no aplican vLLM, TGI, Ollama ni llama.cpp de forma estándar.
- Latencia y throughput: no disponibles. El dataset de entrenamiento está grabado a 20 FPS, lo que da una referencia de la frecuencia de control esperada, pero el autor no publica latencias medidas ni FPS reales de inferencia.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de parámetros de modelos alternativos dentro de la información proporcionada. La comparación siguiente se limita a lo que se puede afirmar con los datos disponibles.

| Modelo | Parámetros | Contexto / observación | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tune de pi05_base) | 4.143.404.816 | 3 cámaras 224×224 + estado (9,) → acción (7,) | apache-2.0 | Hugging Face, librería lerobot | Especializado en 40 tareas pick-and-place; 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face | Modelo base generalista del que deriva este checkpoint |
| π₀ (Pi0, Physical Intelligence) | no disponible | no disponible | no disponible | Repositorio OpenPI | Predecesor de π₀.₅ citado en la model card; sin datos numéricos en la información disponible |

No se dispone de información suficiente para comparar con otras familias de VLA (por ejemplo OpenVLA o RDT) sin inventar cifras, por lo que esas alternativas se omiten.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está entrenado exclusivamente en 40 tareas de tipo «coger X y ponerlo en la caja» con un único robot Panda y una configuración fija de tres cámaras. Fuera de ese conjunto de objetos y de esa disposición, se espera un rendimiento degradado.
- Dependencia de hardware concreto: exige el tipo de robot `Panda` y las cámaras `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`. Cambiar la cinemática, el montaje de las cámaras o su resolución invalida las observaciones con las que fue entrenado.
- Riesgo de fallo en manipulación: como toda política de imitación, puede producir agarres fallidos, colisiones o acciones fuera de distribución ante objetos o iluminaciones no vistas. No hay métricas publicadas de tasa de éxito que permitan acotar ese riesgo.
- Sin datos de sesgo ni de robustez: la información disponible no incluye auditorías de sesgo, evaluaciones de seguridad ni pruebas adversariales.
- Idiomas no documentados: aunque el modelo acepta una tarea en texto (`--task`), no se especifica qué lenguas maneja ni si el texto influye realmente en la selección de tarea.
- Sin benchmarks ni evaluaciones publicadas: no se puede verificar su rendimiento frente a π₀, π₀.₅ base u otras políticas.
- Adopción nula: 0 descargas y 0 «likes». No hay evidencia de uso en producción ni comunidad que reporte resultados.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo base `lerobot/pi05_base` y las dependencias de LeRobot o del stack OpenPI deben cumplir sus propias licencias, que no se detallan aquí.
- Repositorio de 121,6 GB frente a 4,14 B de parámetros: conviene revisar el contenido antes de descargarlo para no consumir disco innecesariamente.
- Fechas del repositorio (creación en 2026-09-16) inusuales en el momento de consulta; verificar la vigencia del enlace antes de publicar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__bbox__blur__sim__all_cameras__live
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio OpenPI de Physical Intelligence: citado en la model card como origen de la implementación; URL no disponible en la información proporcionada.
