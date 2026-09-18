# RyanL22/pi05-anyh2r-rh56f1-0916-synth-30k

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, la implementación de pi0.5 en la librería LeRobot (v0.6.1). Se trata de una política visión-lenguaje-acción (VLA) orientada a control robótico: recibe dos vistas de cámara y un vector de estado de 28 dimensiones, y produce directamente 50 acciones articulares absolutas a 20 fps (2,5 s de trayectoria por inferencia). El checkpoint tiene 4.143.404.816 parámetros (unos 4,14B), de los cuales 412,4M corresponden al encoder de visión SigLIP, y se distribuye en safetensors con licencia Apache-2.0.

El autor (RyanL22) lo ha entrenado sobre una mezcla sintética fechada el 2026-09-16: 12 "celdas" generadas a partir de vídeo humano (466 episodios) con etiquetas IDM corregidas por cinemática inversa de muñeca (wrist-IK). No se ha utilizado teleoperación real en ningún momento. El entrenamiento se ejecutó durante 30.000 pasos en NAVER MLXP con 4 GPU H200, y el checkpoint publicado es el final de esa ejecución.

Su relevancia es doble: por un lado, es un ejemplo reproducible de entrenamiento de una política de manipulación bimanual para el hardware OpenArm con manos RH56F1 usando únicamente datos derivados de vídeo humano; por otro, es un caso de estudio sobre los límites del aprendizaje desde vídeo sintético sin datos reales de teleoperación. Con 0 descargas y 0 "likes" en el momento de la consulta, se trata de un artefacto de investigación sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA (vision-language-action) pi0.5 sobre transformer; encoder de visión SigLIP (412,4M) integrado. Detalles internos del backbone del modelo base no disponibles en la información proporcionada |
| Parametros totales | 4.143.404.816 (4,14B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No aplica / no disponible. La política usa `n_obs_steps=1` (una única observación por inferencia) y genera un chunk de 50 acciones |
| Tipos de cuantizacion | No disponibles. El repositorio se distribuye en safetensors (bfloat16/float32) sin versiones cuantizadas publicadas |
| Idiomas soportados | No disponible / no aplica (modelo de control robótico, no conversacional) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño de repositorio 9,4 GB) |
| Biblioteca / versión | lerobot, pi05 v0.6.1 |
| Modelo base | lerobot/pi05_base (fine-tune) |
| Pipeline | robotics |
| Checkpoint | Paso 30.000 (final de 30.000) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-17 |
| Última actualización | 2026-09-17 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi05_base`, la implementación pi0.5 de LeRobot. La entrada se compone de dos imágenes de 288x512 (vista izquierda de una ZED estéreo en `observation.images.base_0_rgb` y vista derecha en `observation.images.left_wrist_0_rgb`), más un vector `observation.state` de 28 dimensiones con la distribución `cuello(2) | brazo_izquierdo(7) | brazo_derecho(7) | mano_izquierda(6) | mano_derecha(6)`. La salida `action` replica exactamente ese layout de 28 dimensiones como objetivos articulares absolutos. El encoder SigLIP (412,4M parámetros) se ha afinado, no se ha mantenido congelado, lo que implica que la representación visual está adaptada específicamente al dominio de las imágenes de las cámaras usadas en la mezcla sintética.

El entrenamiento se realizó en NAVER MLXP sobre 4 GPU H200, con batch de 16 por GPU (64 efectivo), AdamW con learning rate máximo de 2,5e-5 y decaimiento coseno hasta 2,5e-6, 1.000 pasos de warmup, precisión bfloat16 y gradient checkpointing. La configuración de datos incluye aumento fotométrico y afín (una única muestra aleatoria replicada en el par estéreo para no romper la consistencia entre vistas), reparto de "celdas" proporcional a la raíz cuadrada del número de fotogramas de cada una de las 12 celdas, y desactivación explícita del aumento por espejo (flip izquierda/derecha). El chunk de acciones es de 50 pasos a 20 fps (2,5 s), con `n_obs_steps=1`. El dataset de entrenamiento es `RyanL22/anyh2r-pi05-0916-synth` y proviene exclusivamente de vídeo humano: 466 episodios etiquetados con un modelo IDM y corregidos mediante cinemática inversa de muñeca. La normalización usa identidad para las imágenes y cuantiles para estado y acción, con las estadísticas almacenadas en `policy_preprocessor_*`.

## Capacidades

- Generación de trayectorias de control bimanual: produce 50 acciones articulares absolutas por inferencia en un layout fijo de 28 dimensiones (cuello, dos brazos de 7 GDL, dos manos de 6 GDL).
- Manipulación con manos antropomórficas RH56F1: controla de forma independiente los 6 grados de libertad de cada mano, lo que habilita agarres finos además del movimiento de brazo.
- Percepción visual estéreo: consume simultáneamente dos vistas (cámara base y cámara de muñeca) a 288x512, con lo que puede usar tanto información global de la escena como información local de la pinza.
- Política de imitación a partir de vídeo humano: la mezcla de entrenamiento se derivó de vídeo con etiquetas IDM y corrección wrist-IK, sin teleoperación.
- Carga directa desde LeRobot: `PI05Policy.from_pretrained()` permite integrarlo en el pipeline estándar de LeRobot.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, capacidades multilingües ni modo de razonamiento explícito: no es un modelo de lenguaje conversacional.
- No se documentan capacidades de audio, vídeo secuencial (solo `n_obs_steps=1`) ni memoria de estados previos.

## Casos de uso

- Investigación en aprendizaje desde vídeo humano: reproducir el pipeline completo (vídeo -> etiquetas IDM -> corrección wrist-IK -> fine-tune pi0.5) para medir hasta qué punto el vídeo sin teleoperación es suficiente para tareas de manipulación concretas.
- Evaluación del gap sim-to-real en manipulación bimanual: al no existir datos reales de teleoperación en la mezcla, el checkpoint sirve como caso límite para medir la degradación al transferir a un OpenArm físico con manos RH56F1.
- Prototipado de pick-and-place bimanual en laboratorio: el modelo genera directamente objetivos articulares absolutos, por lo que puede conectarse al lazo de control del robot sin una capa adicional de cinemática inversa.
- Generación de datos sintéticos para aumentar datasets: las 12 celdas y 466 episodios documentados pueden usarse como semilla o referencia para comparar variantes del pipeline IDM.
- Punto de partida para post-entrenamiento con datos reales: al ser un fine-tune con licencia Apache-2.0 y arquitectura LeRobot, se puede continuar el entrenamiento con teleoperación real para cerrar la brecha de dominio.
- Control de agarre fino con manos de 6 GDL: el layout de acción dedica 12 de las 28 dimensiones a las dos manos, lo que permite entrenar o evaluar tareas de prensión compleja (no solo posicionamiento de brazo).
- Docencia y replicación de experimentos en robótica: sirve como ejemplo de ficha reproducible (semilla de datos, hiperparámetros, hardware y número de pasos declarados) para cursos o talleres sobre LeRobot.
- Referencia negativa en estudios de ablación: al estar disponible únicamente el checkpoint final (sin intermedios publicados), puede compararse contra modelos entrenados con datos reales para cuantificar el coste de prescindir de ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones cuantitativas frente a otros checkpoints. Tampoco se han encontrado evaluaciones independientes: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta. Los resultados de la búsqueda web proporcionada no contienen información sobre este modelo ni sobre políticas VLA comparables, por lo que no se presentan tablas de rendimiento.

## Requisitos de hardware

- VRAM en inferencia (bf16): aproximadamente 8,3 GB solo para pesos (4,14B x 2 bytes). Con activaciones de dos imágenes de 288x512, el encoder SigLIP y el decodificador de acciones, se recomienda reservar entre 12 y 16 GB.
- VRAM en precisión completa (fp32): alrededor de 16,6 GB solo en pesos; no recomendable para inferencia en producción.
- GPU de gama alta para entrenamiento: la configuración documentada usa 4 x H200 con 16 muestras por GPU (batch efectivo 64) en bfloat16 y gradient checkpointing. Alternativas equivalentes en VRAM serían A100 80 GB o H100.
- GPU de gama media/profesional: A100 40 GB, L40S 48 GB o RTX A6000 48 GB cubren inferencia con holgura.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB como RTX 4090 o RTX 3090 en bfloat16. En tarjetas de 16 GB (RTX 4080, 4070 Ti Super) es viable solo ajustando el tamaño de lote a 1 y con cuidado por las activaciones del encoder visual; por debajo de 12 GB no hay margen razonable en bf16.
- Opciones de despliegue: LeRobot es la vía nativa (`PI05Policy.from_pretrained("RyanL22/pi05-anyh2r-rh56f1-0916-synth-30k")`). vLLM, TGI, llama.cpp y Ollama no son aplicables: no es un modelo de lenguaje autorregresivo de texto y no existen conversiones GGUF publicadas.
- Latencia y throughput: no disponibles como medida de sistema. Como referencia de diseño, cada inferencia produce un chunk de 50 acciones a 20 fps (2,5 s de trayectoria), lo que implica una frecuencia de re-planificación de política de 0,4 Hz; la latencia real dependerá de la GPU y del preprocesado de imagen.
- Almacenamiento: 9,4 GB de repositorio, más el dataset `RyanL22/anyh2r-pi05-0916-synth` si se va a reproducir o continuar el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RyanL22/pi05-anyh2r-rh56f1-0916-synth-30k` (este modelo) | 4.143.404.816 (4,14B) | 1 observación, chunk de 50 acciones a 20 fps | No publicado | apache-2.0 | HuggingFace, 0 descargas |
| `lerobot/pi05_base` (modelo base) | No disponible en la información proporcionada | No disponible | No publicado | No disponible en la información proporcionada | HuggingFace LeRobot |
| Otras políticas VLA abiertas de la misma categoría (por ejemplo, variantes pi0, GR00T o OpenVLA) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de alternativas en la información proporcionada: los resultados de la búsqueda web no contienen políticas VLA comparables. La comparación solo puede establecerse con el modelo base, del que únicamente se conoce el identificador `lerobot/pi05_base`. Cualquier comparación numérica adicional requeriría consultar las model cards correspondientes, que no forman parte de este material.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintético: 12 celdas y 466 episodios derivados de vídeo humano con etiquetas IDM corregidas por wrist-IK. Sin teleoperación real, el riesgo de gap de dominio al desplegar en hardware físico es alto y no está cuantificado.
- Especificidad de hardware: la política está atada a la morfología OpenArm (dos brazos de 7 GDL), manos RH56F1 (6 GDL por mano) y un cuello de 2 GDL. La salida son 28 dimensiones fijas; no es transferible a otro robot sin reentrenar la cabeza de acción.
- Dependencia de la configuración de sensores: espera exactamente dos vistas de 288x512 (ZED izquierda y derecha) con esa asignación concreta de canales. Cambiar la resolución, la cámara o el orden de las vistas invalida las estadísticas de normalización.
- Sin memoria temporal: `n_obs_steps=1` implica que cada inferencia se basa en una única observación. Tareas que requieran memoria de estados previos (por ejemplo, recordar dónde se dejó un objeto) no están soportadas de forma nativa.
- Aumento por espejo desactivado: el modelo no ha visto pares reflejados, por lo que puede presentar asimetrías entre el brazo izquierdo y el derecho.
- Riesgo de acciones erróneas: aunque no aplica el concepto de alucinación lingüística, la política puede generar trayectorias fuera de distribución. En un robot real esto se traduce en riesgo físico, por lo que es imprescindible un limitador de par, topes articulares y parada de emergencia.
- Ausencia de validación externa: 0 descargas y 0 "likes", sin benchmarks ni tasas de éxito publicadas. No hay evidencia independiente de que el checkpoint funcione fuera del entorno de entrenamiento.
- Idiomas: no disponible / no aplica. El modelo no procesa lenguaje natural como entrada ni como salida.
- Licencia: el checkpoint se publica bajo apache-2.0, lo que permite uso comercial y modificación. Sin embargo, la licencia del modelo base `lerobot/pi05_base` no se especifica en la información proporcionada, por lo que conviene verificarla antes de un uso comercial.
- Publicación de un único checkpoint: solo se publica el paso 30.000 (final). No hay checkpoints intermedios para estudiar la curva de aprendizaje ni para elegir un punto con mejor compromiso.
- Datos de creación y actualización (2026-09-17) muy próximos entre sí: la model card y los pesos se subieron en una ventana de menos de dos minutos, sin historial de revisiones visible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanL22/pi05-anyh2r-rh56f1-0916-synth-30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/RyanL22/anyh2r-pi05-0916-synth
- Librería LeRobot (carga vía `lerobot.policies.pi05.modeling_pi05.PI05Policy`): no se ha proporcionado URL específica en la información disponible
- Resultados de la búsqueda web: no contienen enlaces relevantes sobre este modelo ni sobre políticas VLA comparables (los resultados se refieren a modelos generativos de texto e imagen sin relación con robótica).
