# Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200-40k

## Resumen

GR00T N1.7 es un modelo fundacional de vision-lenguaje-accion (VLA) para robótica desarrollado por NVIDIA, y esta ficha concreta es un ajuste fino realizado por el usuario Geoffrey19 sobre una tarea de manipulación real. El modelo parte del checkpoint de preentrenamiento intermedio CEI-2.0, que a su vez deriva de GR00T N1.7 entrenado durante 50.000 pasos sobre 112 horas de demostraciones del dataset DROID reproyectadas mediante retargeting a un brazo Franka FR3 con mano LEAP. Sobre esa base se han aplicado 40.000 pasos adicionales de ajuste fino supervisado con 200 episodios reales de teleoperación para la tarea de abrir un cajón, depositar un objeto y cerrarlo.

El modelo tiene 3.144.016.000 parámetros en precisión float32 (1.030 tensores, 12,6 GB en el repositorio) y se distribuye en formato safetensors, con la librería `gr00t` como runtime de referencia. No es un modelo de lenguaje general: es una política de imitación que consume observaciones visuales y estados articulares y produce secuencias de acciones motoras en trozos de 16 pasos. La relevancia actual reside en que demuestra un flujo completo de posentrenamiento de un VLA fundacional sobre hardware real y de código abierto (Franka FR3 + LEAP hand), incluyendo la receta exacta de normalización, orden de articulaciones y configuración de modalidades.

La licencia es la NVIDIA License, que restringe el uso a investigación y evaluación no comercial, lo que condiciona fuertemente cualquier despliegue productivo. El modelo no reporta métricas de evaluación porque se entrenó con los 200 episodios disponibles sin partición de validación ni verificación de éxito por episodio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) GR00T N1.7, fine-tune completo de LLM, torre visual, proyector y cabeza de acción |
| Parametros totales | 3.144.016.000 (1.030 tensores, float32) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el entrenamiento usó bfloat16 mixed precision) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en robótica) |
| Licencia | NVIDIA License (`nvidia-license`), uso limitado a investigación y evaluación no comercial |
| Formato de pesos | safetensors (3 shards: `model-0000{1,2,3}-of-00003.safetensors`) con `model.safetensors.index.json` |
| Libreria | `gr00t` |
| Embodiment | `NEW_EMBODIMENT`; brazo Franka FR3 (7 articulaciones) + mano LEAP (16 articulaciones) |
| Dimension de estado/accion | 23 posiciones articulares absolutas en radianes |
| Entrada visual | 1 cámara RGB exterior, 640×480, campo `exterior_1` |
| Horizonte de accion | chunks de 16 pasos, objetivos relativos al estado (`NON_EEF`), salida en posiciones absolutas |
| Frecuencia de datos | 15 Hz |

## Arquitectura y entrenamiento

El modelo es un VLA de la familia GR00T N1.7 que combina una torre visual, un backbone de lenguaje y una cabeza de acción que genera chunks de 16 pasos mediante flow matching. El ajuste fino es completo (`--tune-llm --tune-visual`, más proyector y cabeza de acción), no un simple adaptador. Las acciones se representan como objetivos articulares relativos al estado (`NON_EEF`), y la política suma de nuevo el estado para emitir posiciones absolutas; la normalización usa percentiles con q01/q99 mapeados a −1/+1 y clip, con estadísticas de acción relativa calculadas por paso de chunk a partir del propio dataset (`statistics.json`, idéntico en ambas fases).

El entrenamiento consta de dos fases de 20.000 pasos cada una, con batch 32 y una sola GPU. En cada fase, la tasa de aprendizaje alcanza un pico de 2e-5 tras 500 pasos de warmup y decae en coseno, con weight decay de 1e-5; el estado del optimizador se reinicia en el paso 20.000. Se usó precisión mixta bfloat16 sobre pesos float32. El dataset de ajuste son 200 episodios y 114.493 fotogramas a 15 Hz del dataset `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200`, con la instrucción "Open the drawer, pick up the object from the tabletop, place it inside the drawer, and close the drawer". Se emplearon los 200 episodios para entrenamiento, sin partición de validación ni verificación de éxito por episodio (solo se filtraron huecos de datos articulares superiores a 200 ms).

Un detalle técnico crítico es el orden de articulaciones: el modelo opera en el orden del robot CEI `fr3v2_leaphand` (cada dedo con `mcp_forward` antes de `mcp_side`), no en el orden de motores LEAP de las grabaciones. El cliente debe aplicar la permutación `P = [0, 1, 2, 3, 4, 5, 6, 8, 7, 9, 10, 12, 11, 13, 14, 16, 15, 17, 18, 19, 20, 21, 22]` al estado antes de enviarlo y volver a aplicarla a las acciones devueltas. Con este orden, los 23 límites articulares de la configuración del robot coinciden exactamente con los del modelo. La pérdida media de entrenamiento de esta ejecución fue de 0,1939 en los pasos 0–100, 0,0288 en 9.900–10.000, 0,0161 en 19.000–20.000, 0,0159 en 20.000–20.100, 0,0166 en 29.900–30.000 y 0,0115 en 39.000–40.000, valores que son ajustes a los episodios de entrenamiento y no medidas de calidad de la política.

## Capacidades

- Generación de acciones motoras: produce chunks de 16 pasos de posiciones articulares absolutas para un brazo Franka FR3 de 7 ejes y una mano LEAP de 16 articulaciones (23 dimensiones totales).
- Política de imitación condicionada por instrucción: consume una descripción textual de la tarea (`annotation.human.task_description`) junto con la observación visual y el estado articular.
- Percepción visual monocámara: procesa una única imagen RGB exterior de 640×480 a 15 Hz.
- Ejecución de tareas de manipulación largas: la tarea entrenada encadena abrir cajón, recoger objeto, depositarlo y cerrar, lo que implica coordinación brazo-mano en múltiples fases.
- Control de mano antropomórfica: incluye las 16 articulaciones de la LEAP hand (índice, medio, anular y pulgar con `mcp_forward`, `mcp_side`, `pip`, `dip`; pulgar con `cmc_side`, `cmc_forward`, `mcp`, `ip`).
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento extendido; no disponible.
- No se ha documentado soporte de visión multi-cámara, audio ni otras modalidades distintas de la RGB exterior; no disponible.

## Casos de uso

- Manipulación de cajones en entorno de laboratorio: el modelo ejecuta la secuencia completa de abrir un cajón, extraer un objeto de la mesa, introducirlo y cerrar, adecuado porque fue entrenado específicamente sobre esa tarea con la geometría del FR3 y la LEAP hand.
- Investigación en imitación de brazo-mano: sirve como punto de partida para estudiar el efecto del preentrenamiento CEI frente al arranque desde el checkpoint base, ya que el autor publica ambas variantes con la misma receta.
- Evaluación de pipelines de posentrenamiento VLA: al incluir `statistics.json`, `dataset_modality.json`, `joint_order.json` y `experiment_cfg/`, permite reproducir la configuración exacta de normalización y modalidades en un banco de pruebas.
- Prototipado de control articular absoluto: útil para equipos que necesitan una política que emita posiciones absolutas en radianes a 15 Hz con chunks de 16 pasos, evitando capas de conversión de espacio efector final.
- Benchmark interno de retargeting: el modelo incorpora la permutación de articulaciones del robot CEI, por lo que sirve para validar conversiones entre el orden de motores LEAP y el orden del modelo en despliegues reales.
- Formación y demostración docente: con licencia no comercial, puede usarse en cursos y talleres sobre VLA y robótica de manipulación sin fines lucrativos.
- No se recomienda para atención al cliente, generación de código, matemáticas, análisis de documentos ni ninguna tarea de lenguaje general: el modelo no está diseñado ni entrenado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay partición de validación y que no se verificó el éxito por episodio, por lo que no se reporta ninguna evaluación de la política. Los únicos números publicados son pérdidas de entrenamiento (flow matching), que no miden calidad de ejecución:

| Pasos | GR00T desde base | GR00T desde CEI (este modelo) |
|---|---|---|
| 0–100 | 1,0683 | 0,1939 |
| 9.900–10.000 | 0,0489 | 0,0288 |
| 19.000–20.000 | 0,0284 | 0,0161 |
| 20.000–20.100 | 0,0284 | 0,0159 |
| 29.900–30.000 | 0,0252 | 0,0166 |
| 39.000–40.000 | 0,0167 | 0,0115 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos son 3,14 B parámetros en float32 (aproximadamente 12,6 GB), por lo que se necesita al menos ese espacio más el de activaciones y buffers de la torre visual; en bfloat16 serían unos 6,3 GB solo de pesos, aunque no se documentan pesos cuantizados ni versiones en bf16 publicadas.
- GPU recomendadas: no disponible en la información proporcionada. El entrenamiento se realizó en una sola GPU con batch 32 y precisión mixta bfloat16, y el preentrenamiento CEI se hizo con batch 1024 en 32 GPUs.
- Cabe en GPU de consumo: no confirmado; con 12,6 GB de pesos en float32, tarjetas con 16 GB o más podrían albergarlo en teoría, pero no hay datos publicados de pruebas en RTX 4090, 4080 u otras.
- Opciones de despliegue: la librería de referencia es `gr00t` (runtime de NVIDIA Isaac-GR00T). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas de acción robóticas.
- Latencia y throughput: no disponible. La frecuencia de los datos de entrenamiento es 15 Hz y el horizonte de acción es de 16 pasos, pero no se publican medidas de latencia de inferencia ni de frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 FR3+LEAP drawer 40k) | 3,14 B (float32) | no disponible | Manipulación FR3 + LEAP en tarea de cajón | NVIDIA License, solo investigación no comercial | Hugging Face, 12,6 GB |
| `Geoffrey19/cei2-groot-n17-base-drawer200-40k` | no disponible en la información | no disponible | Misma tarea, partiendo del checkpoint base en lugar del CEI | NVIDIA License | Hugging Face |
| `Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200` (modelo base) | no disponible en la información | no disponible | Fase intermedia de 20.000 pasos de la misma receta | NVIDIA License | Hugging Face |
| GR00T N1.7 original (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional VLA generalista | NVIDIA License | GitHub NVIDIA/Isaac-GR00T |

La comparación con alternativas de otros desarrolladores (por ejemplo, políticas de imitación tipo Diffusion Policy o ACT de LeRobot) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la NVIDIA License limita el uso a investigación y evaluación no comercial; cualquier despliegue comercial requiere licencia adicional de NVIDIA.
- Sin evaluación de calidad: no hay partición de validación, no se verificó el éxito de los episodios desde los vídeos y no se reportan métricas de éxito, de modo que el rendimiento real de la política es desconocido.
- Riesgo de sobreajuste al dataset: 200 episodios de una única tarea, una única configuración de cámara y un único entorno; la generalización a otras posiciones de cámara, objetos o geometrías no está demostrada.
- Dependencia estricta del orden de articulaciones: si el cliente no aplica la permutación `P` al estado y a las acciones, el modelo recibirá y emitirá comandos incorrectos; el README del dataset original pide el orden de motores, que no es el que usa este modelo.
- Definición de acción peculiar: `action[t]` es la posición medida 1/15 s después, no el comando enviado al robot, lo que puede introducir discrepancia entre la política y el controlador real.
- Sin datos de sesgo, alucinación o multilingüismo: al no ser un modelo de lenguaje general, estas categorías no aplican, pero tampoco se documenta ningún análisis de robustez frente a cambios de iluminación, oclusiones o fallos de percepción.
- Campo de visión único: una sola cámara RGB de 640×480 limita la percepción a la vista exterior, sin realimentación táctil ni de profundidad explícita.
- Pesos en float32 sin cuantizaciones publicadas: no hay versiones GGUF, bf16 ni int8, lo que encarece el despliegue en hardware limitado.
- Fecha de creación del repositorio (2026-11-19) y ausencia de descargas o likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200-40k
- Modelo base (fase de 20.000 pasos): https://huggingface.co/Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200
- Variante desde el checkpoint base: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-drawer200-40k
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Dataset DROID: https://droid-dataset.github.io/
- Dataset de la tarea: `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200` (referenciado en la model card; no se proporciona URL directa)
- Paper, blog o demo adicionales: no disponible
