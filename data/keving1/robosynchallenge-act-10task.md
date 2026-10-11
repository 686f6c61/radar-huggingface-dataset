# KevinG1/RoboSynChallenge-ACT-10Task

## Resumen

RoboSynChallenge-ACT-10Task es un repositorio de diez políticas robóticas ACT (Action Chunking with Transformers) ajustadas de forma supervisada sobre checkpoints padre específicos de tarea del benchmark RoboSynChallenge. Lo publica el usuario KevinG1 y se distribuye con la librería LeRobot de Hugging Face, con pipeline declarado como robotics. No es un modelo entrenado desde cero: cada especialista deriva de un padre ACT oficial mediante fine-tuning con las demostraciones de simulación oficiales de su tarea, y el paquete incluye artefactos de trazabilidad (finetuning_provenance.json, MODEL_MANIFEST.json, CHECKSUMS.json).

La arquitectura es la política ACT de LeRobot, que consume tres cámaras más un vector de estado del robot de 14 dimensiones y produce acciones de 14 dimensiones en forma de cola (chunk) de 50 acciones, con reinicio en cada episodio. El backbone preentrenado, el preprocesado, las configuraciones y la normalización oficiales se mantienen intactos; el valor añadido declarado por el autor es el ajuste fino por tarea, el enrutado de especialistas, la procedencia verificable y el empaquetado reproducible. El repositorio ocupa 2,1 GB.

Es relevante ahora como referencia práctica para quien trabaje en manipulación robótica simulada, evaluación de checkpoints ACT o competiciones tipo RoboSynChallenge, y como ejemplo de publicación con cadena de custodia explícita. El propio autor es muy explícito sobre los límites: cohortes pequeñas (16 episodios de validación), nueve especialistas con 100 actualizaciones de optimizador y uno (Water Pouring) con 200, rendimiento pobre en varias tareas y ausencia de mejora estadísticamente establecida frente a los padres ACT publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LeRobot ACT (Action Chunking with Transformers), tres entradas de cámara más estado del robot de 14 dimensiones, salida de 14 dimensiones, cola de 50 acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; horizonte de predicción de 50 acciones por chunk, reiniciado en cada episodio |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantización documentada) |
| Idiomas soportados | no aplicable (política robótica; no procesa lenguaje) |
| Licencia | no disponible; el repositorio indica que el permiso de redistribución de los checkpoints upstream y la elegibilidad para competición siguen sin resolver, y que no se infiere licencia de modelo del licenciamiento Apache-2.0 del código fuente |
| Formato de pesos | safetensors (model.safetensors por tarea), acompañado de config.json, train_config.json, finetuning_provenance.json, README individual, MODEL_MANIFEST.json y CHECKSUMS.json |

## Arquitectura y entrenamiento

La arquitectura es ACT tal y como la implementa LeRobot: un backbone visual preentrenado más un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que aporta consistencia temporal en tareas de manipulación. La entrada son tres cámaras y un vector de estado de 14 dimensiones; la salida son acciones de 14 dimensiones emitidas como una cola de 50 acciones que se reinicia en cada episodio. Las medias y desviaciones estándar de normalización están embebidas en model.safetensors, de modo que el cargador oficial de ACT no requiere fichero de normalización externo. El backbone preentrenado, el preprocesado y las configuraciones oficiales se conservan sin cambios.

El entrenamiento es fine-tuning supervisado genuino sobre padres ACT específicos de tarea del RoboSynChallenge, usando las demostraciones de simulación oficiales. Según la model card, nueve especialistas recibieron 100 actualizaciones de optimizador del participante y Water Pouring recibió 200. La configuración registrada en R5 es AdamW con learning rate 1e-5, batch size 4, weight decay 1e-4, gradient clipping 10 y semilla 1037, con 64 episodios de entrenamiento y 16 de validación. El autor advierte que train_config.json describe el entrenamiento histórico upstream y no su receta, y que las rutas históricas fueron redactadas para la publicación. No se documenta RLHF, DPO ni decodificación especulativa.

En las etapas R5–R10 se registran evidencias reales de carga en CUDA y de rollouts en simulador para los diez especialistas ACT; R10 verificó las diez rutas ACT mediante carga en CUDA y carga con rutas reubicadas. El autor aclara que el episodio de integración híbrida de Item Assembly usó Diffusion Policy (DP) experimental y no debe presentarse como validación ACT, y que en R11 no se repitió ningún experimento de GPU ni de simulador.

## Capacidades

- Generación de trayectorias de acciones para manipulación robótica en simulación, con salida de 14 dimensiones y chunk de 50 acciones.
- Política visomotora: fusiona tres flujos de cámara con estado propioceptivo de 14 dimensiones.
- Especialización por tarea: diez checkpoints independientes, uno por cada tarea oficial del RoboSynChallenge, seleccionados con controller ACT_ONLY y horizonte H50.
- Enrutado de especialistas: el manifiesto permite mapear tarea a checkpoint y a revisión padre inmutable.
- Reproducibilidad y procedencia: cada directorio incluye provenance de fine-tuning y el repositorio incluye checksums SHA-256 y tamaños de fichero.
- Carga verificada en CUDA para las diez rutas, incluida carga con rutas reubicadas.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas en el benchmark RoboSynChallenge: cargar cada especialista con el loader oficial de ACT y ejecutar rollouts en simulador para comparar el rendimiento del fine-tuning frente a los padres publicados, teniendo en cuenta que el autor no reclama mejora estadística.
- Punto de partida para participantes de competición: los checkpoints y el manifiesto de revisiones padre sirven como línea base reproducible sobre la que aplicar nuevos ajustes con las demostraciones oficiales.
- Enrutado por tarea en un pipeline de inferencia: usar MODEL_MANIFEST.json para seleccionar el especialista correspondiente a la tarea detectada, manteniendo un único cargador ACT y normalización embebida.
- Auditoría de reproducibilidad: verificar CHECKSUMS.json y finetuning_provenance.json para reconstruir la cadena entre checkpoint publicado y revisión padre inmutable, útil en revisión por pares o en procesos internos de validación.
- Pruebas de infraestructura de carga de modelos: los diez checkpoints permiten validar carga en CUDA, reubicación de rutas y gestión de artefactos safetensors en un entorno de despliegue robótico.
- Investigación sobre ajuste fino de bajo presupuesto: el régimen documentado (100–200 actualizaciones de optimizador, 64 episodios) sirve como referencia para estudiar qué se obtiene con presupuestos de cómputo muy reducidos y cohortes pequeñas.
- Docencia y prototipado en robótica: al ser políticas ACT estándar de LeRobot, resultan útiles para ejemplos de entrenamiento, normalización embebida y ejecución en simulador, no para despliegue físico sin validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona evidencias de carga en CUDA y de rollouts en simulador en las etapas R5–R10, pero no aporta cifras de éxito, tasas de finalización ni comparaciones cuantitativas. El autor indica explícitamente que no reclama mejora estadísticamente establecida sobre los padres ACT publicados, ni éxito universal, ni validación en robot físico, ni aceptación en competición.

## Requisitos de hardware

- VRAM para inferencia: no disponible como cifra oficial. Al no publicarse el número de parámetros, cualquier estimación debe tratarse como orientativa; las políticas ACT de LeRobot con backbone visual y transformer suelen situarse en el rango de decenas de millones de parámetros, lo que típicamente cabe en GPUs de consumo con 8–12 GB si se usa precisión FP32/FP16 sin cuantizar.
- GPUs recomendadas: no disponible. La evidencia registrada por el autor es de carga en CUDA, sin especificar modelo de GPU. Para diez especialistas conviene memoria suficiente para cargarlos secuencialmente en lugar de simultáneamente.
- GPU de consumo: probablemente viable en tarjetas tipo RTX 3060/4070/4090 para una sola política, dado el tamaño del repositorio (2,1 GB para diez checkpoints, aproximadamente 200 MB por especialista y sus ficheros auxiliares). No hay confirmación del autor.
- Opciones de despliegue: la vía soportada es LeRobot con el cargador oficial de ACT (PyTorch, CUDA). No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas robóticas con entradas multimodales de cámara y estado.
- Latencia y throughput: no disponible. No se publican mediciones de frecuencia de inferencia ni de tiempo por chunk de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboSynChallenge-ACT-10Task (este) | no disponible | chunk de 50 acciones | sin cifras publicadas; sin mejora estadística reclamada sobre los padres | no disponible | Hugging Face, 2,1 GB, 0 descargas y 0 likes en el momento de la consulta |
| Padres ACT del RoboSynChallenge (oficiales) | no disponible | ACT estándar | referencia de comparación citada por el autor | no disponible | checkpoints oficiales enlazados en el manifiesto del repositorio |
| Diffusion Policy (DP) | no disponible | no disponible | no disponible; el autor la califica de experimental y la excluye de la validación ACT | no disponible | referenciada en la model card, sin enlace explícito |
| ACT original (Zhao et al., Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware) | no disponible en esta información | ACT estándar | no disponible | no disponible | publicación académica citada como atribución |

No se dispone de datos comparativos de parámetros, contexto ni rendimiento para ninguna de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; los sesgos propios del dataset de demostraciones de simulación se heredan del padre ACT correspondiente.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones incoherentes fuera de la distribución de las demostraciones de entrenamiento.
- Cohortes muy pequeñas: 64 episodios de entrenamiento y 16 de validación por tarea, con 100 actualizaciones de optimizador (200 en Water Pouring). El propio autor señala efectos de selección y rendimiento pobre en varias tareas.
- Sin validación en robot físico: toda la evidencia es de simulador; no se ha verificado transferencia al mundo real.
- Fallos intermitentes del simulador nativo: el autor los reporta como limitación de interpretación de los resultados.
- Integración híbrida con DP: el episodio de Item Assembly con Diffusion Policy experimental no debe presentarse como validación de ACT; está excluido del alcance.
- Repetición experimental limitada: en R11 no se repitió ningún experimento de GPU o simulador, por lo que no hay replicación independiente dentro del propio repositorio.
- Licencia sin resolver: el permiso de redistribución de los checkpoints upstream y la elegibilidad para competición quedan sin resolver según la model card; no se infiere licencia de modelo a partir del licenciamiento Apache-2.0 del código fuente. Esto bloquea el uso comercial sin aclaración previa.
- Confusión de identidad: la model card se titula "Vulcan Dynamics — ten fine-tuned ACT specialists", mientras que el identificador del repositorio es KevinG1/RoboSynChallenge-ACT-10Task; conviene verificar la relación entre ambos nombres antes de citarlo.
- Advertencia para producción: al no haber métricas publicadas, ni validación física, ni licencia clara, este repositorio es material de investigación y experimentación, no un componente listo para despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/KevinG1/RoboSynChallenge-ACT-10Task
- LeRobot (librería de carga): https://github.com/huggingface/lerobot
- RoboSynChallenge / EDEM-AI: citados como atribución en la model card, sin URL disponible en la información proporcionada.
- ACT, Zhao et al., "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware": citado en la model card, sin URL disponible en la información proporcionada.
- La búsqueda web asociada a esta consulta no devolvió resultados relevantes sobre el modelo; el contenido recuperado era ajeno al ámbito técnico y se ha descartado por completo.
