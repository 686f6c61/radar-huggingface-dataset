# polarisai-robots/bento_ur7e_pi05_nextech_v1

## Resumen

`bento_ur7e_pi05_nextech_v1` es un checkpoint de política robótica (visión-lenguaje-acción) publicado por `polarisai-robots`, derivado por ajuste fino del modelo base `bento_ur7e_pi05_v5_color200`. Está pensado para controlar un brazo robótico UR7e con pinza (gripper) mediante observaciones multimodales: dos cámaras (`top` y `wrist`) más el estado articular, produciendo acciones de 6 articulaciones más gripper. Se distribuye en formato LeRobot con pesos safetensors de aproximadamente 4.140 millones de parámetros (4.143.404.816 exactos), lo que sitúa al modelo en la gama de políticas VLA de tamaño medio-alto.

El checkpoint corresponde a la iteración 20.000 de entrenamiento (`checkpoint 020000`) de un run denominado `nextech_v1`, con batch size 16 y learning rate 2.5e-5, sobre un dataset registrado como `polarisai-robots/bento_ur7e_nextech_v1` (40 episodios según la discusión de planificación citada; 42 episodios y 80.785 fotogramas a 60 fps en la copia local, sin identidad confirmada con el dataset de entrenamiento). La arquitectura subyacente es π0.5 (pi05), una política VLA basada en transformer que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, con normalización por cuantiles de estado y acción.

Su relevancia es acotada pero concreta: es un artefacto de despliegue para una preparación *onsite* en un cliente (RYODEN), no un modelo de propósito general. El autor advierte explícitamente de que la carga de pesos en GPU, la inferencia, el *rollout* en robot y la compatibilidad con el PC del cliente **no se han probado** como parte de esta subida, y de que el runtime auditado (`PolarisAI-Projects/lerobot_ur7e_gello`, revisión `b492a4e7f02c51417c1ed58f2250f6df94139d0c`) difiere del *checkout* de plugin usado durante la validación de configuración. Cualquier evaluación debe tratar este repositorio como un checkpoint de investigación reproducible, no como un modelo validado en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π0.5 (pi05), política visión-lenguaje-acción basada en transformer con codificador visual y decodificador de acciones (detalles internos no disponibles) |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot completo; incluye procesadores de normalización y directorio `tokenizer/`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `polarisai-robots/bento_ur7e_pi05_v5_color200` (revisión `153d92de8799029b381508e563931395b1163747`), que a su vez implementa la receta π0.5 dentro del ecosistema LeRobot. La configuración guardada (`PI05Config`) declara un ancho de estado interno de 32 y tres entradas de características de imagen, mientras que el mapeo de observaciones utilizado es `observation.images.top` → `observation.images.base_0_rgb` y `observation.images.wrist` → `observation.images.left_wrist_0_rgb`. El estado y la acción se normalizan mediante **cuantiles** (QUANTILES), y el entrenamiento se realizó con `train_expert_only=false` y `freeze_vision_encoder=false`, es decir, con el codificador visual y el experto de acción entrenables.

Los hiperparámetros registrados son 20.000 actualizaciones, batch size 16 y learning rate 2.5e-5. El dataset de entrenamiento registrado es `polarisai-robots/bento_ur7e_nextech_v1`; la copia local asociada contiene 6 posiciones articulares y 1 de gripper tanto en estado como en acción, además de vídeo de las cámaras `top` y `wrist`. No se documentan en la información disponible el número total de tokens, la composición del dataset, ni si hubo RLHF/DPO (poco probable en un modelo de política robótica). Tampoco se describe ninguna innovación técnica adicional más allá de la propia arquitectura π0.5. El autor señala que los pesos no se han reentrenado ni convertido durante la subida, y que `config.json` y `train_config.json` conservan el `repo_id` y las rutas locales del modelo inicial como metadatos originales.

## Capacidades

- Control robótico de un brazo UR7e con pinza: genera acciones de 6 articulaciones más gripper a partir de observaciones visuales y de estado.
- Percepción visual multimodal: consume dos flujos de cámara (`top` y `wrist`) con tres entradas de características de imagen declaradas en la configuración.
- Política condicionada por lenguaje: al ser un modelo π0.5, se espera que acepte instrucciones en lenguaje natural, aunque la información disponible no documenta el formato exacto de los *prompts* ni los idiomas soportados.
- Ejecución *end-to-end* de tareas de manipulación: no requiere planificación explícita separada; produce acciones directamente.
- Soporte de *tool calling* / *function calling*: no disponible (no aplica a este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el modelo ejecuta políticas de manipulación, no razonamiento simbólico.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo *thinking*, visión, audio): visión sí (dos cámaras); *thinking* y audio no disponibles.

## Casos de uso

- **Preparación *onsite* en cliente RYODEN**: el checkpoint se distribuye específicamente para esta preparación; se usaría cargando el repositorio completo en el PC del cliente (candidatos A6000 o RTX PRO 6000) y ejecutando *rollout* sobre el UR7e con el runtime `lerobot_ur7e_gello`.
- **Manipulación con pinza guiada por cámara cenital y de muñeca**: tareas de *pick-and-place* donde la cámara `top` aporta contexto global de la escena y la cámara `wrist` aporta precisión local; el modelo fusiona ambas para generar acciones articulares.
- **Reproducción de demostraciones teleoperadas**: el dataset de entrenamiento proviene de demostraciones con 6 articulaciones más gripper; el modelo puede reproducir esas trayectorias en entornos similares a los del dataset `nextech_v1`.
- **Investigación en políticas VLA**: sirve como punto de partida para experimentos de ajuste fino con nuevos datasets LeRobot, dado que el autor documenta explícitamente cómo seleccionar un nuevo directorio de salida y controlar la publicación en el Hub.
- **Validación de *pipelines* LeRobot**: útil para probar la carga de configuración con `PI05Config.from_pretrained`, la normalización por cuantiles y el manejo de cámaras faltantes en distintas versiones de LeRobot (0.6.0, 0.6.2).
- **Despliegue en laboratorio con GPU profesional**: con 4,14 mil millones de parámetros y 9,4 GB de repositorio, es viable en una GPU de 24-48 GB para inferencia en tiempo real, aunque el autor no ha medido latencia ni *throughput*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no documentada por el autor. Como referencia de orden de magnitud, 4,14 mil millones de parámetros en FP16 requieren ≈8,3 GB solo para pesos; en BF16/FP16 con *buffers* de activación y dos flujos de vídeo, es razonable planificar 12-24 GB, pero esta cifra no está confirmada.
- **GPU recomendadas**: el autor menciona como candidatas para el PC del cliente una **A6000** o una **RTX PRO 6000**. No se documentan pruebas en A100, H100 ni RTX 4090.
- **¿Cabe en GPU de consumo?**: no verificado. Por tamaño de pesos, una RTX 4090 (24 GB) podría albergarlo en FP16, pero la carga de pesos en GPU y la inferencia **no se probaron** durante la subida.
- **Opciones de despliegue**: LeRobot (versión de referencia 0.6.2, *commit* `a4b2744b24415b01e6deb4f2638971de125dde33`), con el plugin `PolarisAI-Projects/lerobot_ur7e_gello` (revisión auditada `b492a4e7f02c51417c1ed58f2250f6df94139d0c`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y *throughput***: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bento_ur7e_pi05_nextech_v1` (este) | 4.143.404.816 | no disponible | Política VLA para UR7e | no disponible | Hugging Face (LeRobot) |
| `bento_ur7e_pi05_v5_color200` (modelo base) | no disponible | no disponible | Política VLA para UR7e | no disponible | Hugging Face |
| Otras políticas π0.5 de LeRobot | no disponible | no disponible | Política VLA | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría con datos verificables en la documentación proporcionada.

## Limitaciones y advertencias

- **Sin validación de inferencia**: la carga de pesos en GPU, la inferencia, el *rollout* en robot y la compatibilidad con el PC del cliente **no se probaron** como parte de esta subida.
- **Runtime no auditado en la validación**: la validación de configuración se hizo con LeRobot 0.6.2 y un *checkout* de plugin (`5ba2bbdc...`) distinto del *main* auditado (`b492a4e7...`); el script de configuración del plugin usa por defecto LeRobot v0.6.0.
- **Dataset de entrenamiento no confirmado**: la identidad entre el dataset registrado (`bento_ur7e_nextech_v1`, 40 episodios según la planificación) y la copia local (`nextech_v1`, 42 episodios, 80.785 fotogramas) no está establecida; el autor no afirma un número exacto de episodios de entrenamiento.
- **Metadatos inconsistentes**: `config.json` y `train_config.json` conservan el `repo_id` y las rutas locales del modelo inicial; es necesario seleccionar explícitamente este repositorio para usarlo y evitar publicar por error en el repositorio del modelo base.
- **Repositorio incompleto si se distribuye solo `model.safetensors`**: es obligatorio descargar el repositorio completo, incluidas las dos configuraciones de procesadores, los archivos de normalización y el directorio `tokenizer/`.
- **Licencia no disponible**: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- **Riesgo de alucinación y sesgos**: no documentados; en políticas robóticas el riesgo se manifiesta como acciones fuera de distribución ante escenas no vistas.
- **Generalización limitada**: el entrenamiento se basa en un dataset pequeño (decenas de episodios) de un entorno concreto; no se espera transferencia robusta a otras tareas, objetos o configuraciones de cámara.
- **Manejo de cámaras faltantes y *padding***: el autor recomienda validar el preprocesamiento, el *padding* y el manejo de cámaras ausentes en el runtime LeRobot elegido, ya que las dimensiones de configuración (ancho de estado 32, tres entradas de imagen) no implican articulaciones ni cámaras físicas adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_nextech_v1
- Modelo base: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v5_color200
- Dataset de entrenamiento registrado: https://huggingface.co/datasets/polarisai-robots/bento_ur7e_nextech_v1
- Runtime/plugin: https://github.com/PolarisAI-Projects/lerobot_ur7e_gello
- LeRobot (framework): https://github.com/huggingface/lerobot
