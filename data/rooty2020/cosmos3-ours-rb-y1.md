# rooty2020/Cosmos3-ours-RB-Y1

## Resumen

Cosmos3-ours-RB-Y1 es un modelo de mundo (world model) de vídeo multi-vista construido sobre nvidia/Cosmos3-Nano, un modelo de 15,22 mil millones de parámetros que combina un backbone MoT (mixture-of-transformers) basado en Qwen3-VL-8B con un experto de difusión. El autor (rooty2020) lo ha afinado sobre teleoperación del robot RB-Y1 con manos WujiHand2, empleando dos vistas simultáneas (ego y exo) y añadiendo dos módulos específicos: una cabeza de seguimiento de puntos 3D (tracking_head) y un acondicionador de cámara explícito (camera_conditioner).

La particularidad del modelo es que, además de predecir fotogramas futuros, cada rollout produce trayectorias 3D por fotograma de 768 puntos del brazo y la mano del robot (512 en los brazos, 256 en las manos) expresadas en el sistema de referencia de la base del robot y proyectadas en ambas vistas. Esto lo sitúa en el terreno de los modelos de mundo geométricamente consistentes para robótica, más que en el de la generación de vídeo genérica.

Es relevante ahora porque el pipeline es replicable con un único fine-tuning relativamente corto (800 iteraciones de un schedule de 4000, partiendo de un warm start multi-vista de la etapa 3 de Omni-4D) y porque el checkpoint se publica en el mismo formato consolidado que el modelo base, lo que facilita su carga con el framework Cosmos. Sin embargo, es un artefacto de investigación: cero descargas, cero likes, sin benchmarks publicados y entrenado con solo 100 episodios de una única plataforma robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `cosmos3_omni`; backbone MoT (torre de comprensión Qwen3-VL-8B + experto de difusión), empaquetado multi-vista Omni-4D, `unified_3d_mrope`, más `tracking_head` y `camera_conditioner` |
| Parametros totales | 15.215.696.011 (15,22 B), incluida la torre ViT de Qwen3-VL |
| Parametros activos | No disponible; la model card no declara enrutamiento disperso (no es un MoE de expertos dispersos en el sentido habitual) |
| Longitud de contexto | No disponible en tokens; el entrenamiento usa ventanas de vídeo con teselado 4n+1 más una ventana de cola, con 741 ventanas en total (703 de entrenamiento y 38 de validación) |
| Tipos de cuantizacion | No disponible; los pesos publicados son bf16 con pesos EMA |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model License (heredada de nvidia/Cosmos3-Nano) |
| Formato de pesos | safetensors en 7 shards (`model-0000{1..7}-of-00007.safetensors`) más `model.safetensors.index.json`; se incluye además el checkpoint bruto en formato DCP (`dcp/iter_000000800/`, solo pesos, net + net_ema) |
| Tamano del repositorio | 122,9 GB |
| Pipeline declarado | image-to-video |
| Iteracion de entrenamiento | 800 (de un schedule de 4000 pasos) |

## Arquitectura y entrenamiento

La base es Cosmos3-Nano de NVIDIA: un transformer multimodal con empaquetado de tokens multi-vista Omni-4D y codificación posicional `unified_3d_mrope` (RoPE 3D unificado), en el que la torre de comprensión procede de Qwen3-VL-8B-Instruct y la generación la realiza un experto de difusión. Sobre esa base, este fine-tuning añade dos componentes entrenados conjuntamente con el backbone: una `tracking_head` que predice trayectorias 3D de puntos y un `camera_conditioner` que introduce la cámara de forma explícita en el cóndicionamiento. El autor advierte que esos dos módulos son específicos de Omni-4D: el `cosmos-predict` estándar, sin ellos, carga únicamente el backbone de vídeo.

El entrenamiento parte de un warm start: el modelo multi-vista de vídeo + tracking de la etapa 3 de Omni-4D (`0902_s3_full`, iteración 1068). Los datos son 100 episodios de teleoperación RB-Y1 con WujiHand2, con dos vistas (ego y exo) redimensionadas de 1280×720 a 832×480 y con captions por episodio. Cada fotograma supervisa 768 puntos 3D en el sistema de referencia de la base del robot, proyectados en ambas vistas y anclados en la vista exo, que cuenta con calibración exacta; la visibilidad se define solo como "finita, delante de la cámara y dentro de los límites", sin información de profundidad, por lo que no se modela la auto-oclusión. Ambas cámaras son estáticas en la base del robot (varianza de pose cero verificada en todos los episodios), de modo que el flujo de cámara futuro se mantiene constante. La optimización usa un learning rate de 1e-4 con un único schedule lineal sobre 4000 pasos. La exportación se hizo desde un checkpoint distribuido de PyTorch con `python -m cosmos_framework.scripts.export_model --use-ema-weights`; los 1069 tensores `net_ema` del checkpoint de entrenamiento están presentes en la exportación, mientras que la torre ViT no forma parte del checkpoint de entrenamiento y se toma de Qwen3-VL-8B-Instruct en la revisión fijada por el framework Cosmos.

## Capacidades

- Predicción de vídeo multi-vista (ego + exo) con generación de fotogramas futuros condicionada por imagen, en el pipeline image-to-video.
- Seguimiento de puntos 3D: por cada rollout emite trayectorias por fotograma de 768 puntos (512 en brazos, 256 en manos) en el sistema de referencia de la base del robot, proyectadas en ambas vistas.
- Acondicionamiento explícito de cámara mediante el módulo `camera_conditioner`, con la cámara futura mantenida constante al ser estáticas las dos cámaras del montaje.
- Modelado de manipulación bimanual y diestra sobre la plataforma RB-Y1 con manos WujiHand2, dentro del dominio de teleoperación visto en entrenamiento.
- World model orientado a robótica: genera consecuencias visuales y geométricas de una secuencia de acciones sobre el robot.
- Tool calling / function calling: no disponible; la model card no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card no lo menciona.
- Capacidades multilingües: no disponibles; la model card no documenta idiomas.
- Capacidades especiales adicionales (modo thinking, audio, visión de propósito general): no disponibles.

## Casos de uso

- Generación de datos sintéticos para entrenar políticas robóticas: los 100 episodios de teleoperación son un dataset muy reducido; el modelo permite generar rollouts adicionales de vídeo multi-vista con sus trayectorias 3D asociadas para aumentar la cobertura de estados de brazo y mano.
- Validación previa al despliegue de políticas de control: ejecutar la política en el world model y observar el vídeo predicho y las trayectorias de los 768 puntos antes de arriesgar hardware real, usando el error de tracking como señal de plausibilidad geométrica.
- Análisis cinemático automatizado de teleoperación: las trayectorias 3D por fotograma en el sistema de la base del robot permiten medir desplazamientos, velocidades y coordinación bimanual sin instrumentar el robot con mocap adicional.
- Investigación en consistencia geométrica multi-vista: comprobar si la proyección de los mismos 768 puntos 3D en las vistas ego y exo se mantiene coherente a lo largo de rollouts largos, usando la vista exo como ancla calibrada.
- Fine-tuning específico por tarea con pocos datos: el pipeline publicado (warm start desde Omni-4D etapa 3 + 800 iteraciones) demuestra que se puede adaptar el modelo a una nueva plataforma o manipulación con un coste de entrenamiento contenido y un único schedule lineal.
- Estudio de límites de la auto-oclusión en world models: dado que el modelo no dispone de profundidad y no modela oclusiones, sirve como banco de pruebas para cuantificar el impacto de esa carencia en la predicción de manos y brazos.
- Planificación basada en modelo (model-based RL): usar los rollouts predichos como simulador aprendido para estimar la evolución del estado del robot antes de seleccionar una acción.
- Docencia y divulgación sobre world models en robótica: al compartir layout con Cosmos3-Nano y publicar `training_config.yaml` y la procedencia del checkpoint, es un ejemplo reproducible de fine-tuning con cabeza auxiliar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la iteración de entrenamiento (800 de 4000), el número de ventanas (741, de las cuales 703 de entrenamiento y 38 de validación) y la procedencia de los pesos, sin métricas de calidad de vídeo, error de tracking ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 30,4 GB solo para los pesos (15,22 B × 2 bytes), más activaciones y cachés de difusión para vídeo multi-vista a 832×480, lo que en la práctica empuja el requisito por encima de los 32-40 GB según resolución, número de fotogramas y batch.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para ejecución cómoda en bf16; configuraciones multi-GPU mediante `torchrun --nproc_per_node=<N>` con el script `cosmos_framework.scripts.inference`.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16 sin cuantización; el repositorio no publica pesos cuantizados (ni GGUF ni FP8), por lo que no hay una ruta de despliegue en consumo documentada. El tamaño del repositorio (122,9 GB) incluye el checkpoint DCP y complica además el almacenamiento local.
- Opciones de despliegue: el procedimiento publicado es la descarga con `hf download` (excluyendo `dcp/*`) y la inferencia con el framework Cosmos. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que además son runtimes orientados a modelos de lenguaje y no a difusión de vídeo.
- Latencia y throughput: no disponibles; no se publican mediciones.
- Nota de compatibilidad: el `tracking_head` y el `camera_conditioner` requieren los módulos de Omni-4D; con `cosmos-predict` estándar solo se carga el backbone de vídeo, sin las salidas de tracking 3D.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura / tarea | Contexto y datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rooty2020/Cosmos3-ours-RB-Y1 | 15,22 B | Cosmos3-Omni + tracking head + camera conditioner; image-to-video multi-vista con trayectorias 3D | 741 ventanas, 100 episodios RB-Y1 + WujiHand2, 2 vistas a 832×480; iteración 800/4000 | NVIDIA Open Model License | Público en HuggingFace; 0 descargas y 0 likes |
| nvidia/Cosmos3-Nano (modelo base) | No disponible en la información proporcionada | Backbone MoT (Qwen3-VL-8B + experto de difusión), `cosmos3_omni` | No disponible | NVIDIA Open Model License | Público en HuggingFace |
| Omni-4D etapa 3 multi-vista vídeo + tracking (`0902_s3_full`, iteración 1068) | No disponible | Multi-vista vídeo + tracking, usado como warm start | No disponible | No disponible | No disponible como enlace público en la información proporcionada |
| Qwen/Qwen3-VL-8B-Instruct | No disponible en la información proporcionada | Torre ViT/comprensión reutilizada por Cosmos3-Nano | No disponible | No disponible en la información proporcionada | Público en HuggingFace |

No se dispone de datos de benchmarks ni de otros world models comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de calidad de vídeo, error de tracking ni comparaciones con el modelo base, de modo que el rendimiento real es desconocido.
- Entrenamiento incompleto: el checkpoint corresponde a la iteración 800 de un schedule de 4000 pasos, lo que sugiere que el modelo no ha convergido según el plan previsto.
- Dataset muy reducido y de un solo dominio: 100 episodios de teleoperación con RB-Y1 y WujiHand2, una única plataforma robótica, por lo que la generalización a otros robots, tareas o entornos no está demostrada.
- Cámaras estáticas: el flujo de cámara futuro se mantiene constante porque las dos cámaras tienen pose fija; el modelo no está preparado para montajes con cámara en movimiento.
- Sin profundidad ni auto-oclusión: la visibilidad de los puntos solo comprueba finitud, estar delante de la cámara y dentro de los límites; no se modela la oclusión del propio robot, lo que puede degradar las trayectorias 3D en configuraciones de brazos cruzados o manos tapadas.
- Anclaje asimétrico de vistas: la vista exo se usa como ancla por su calibración exacta; los errores en la vista ego no se corrigen con la misma referencia.
- Riesgo de alucinación visual: al ser un modelo generativo de difusión, puede producir fotogramas y trayectorias plausibles pero físicamente incorrectas; no hay garantía de precisión física.
- No apto para control crítico de seguridad: la propia model card advierte de que no debe usarse para control en sistemas de seguridad crítica.
- Sin información de idiomas ni de sesgos: no se documentan sesgos conocidos, composición lingüística de los captions ni comportamiento fuera del dominio robótico.
- Restricciones de licencia: se rige por la NVIDIA Open Model License a través de nvidia/Cosmos3-Nano; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que la model card remite a la licencia del modelo base.
- Dependencia de módulos no estándar: el tracking head y el camera conditioner solo funcionan con los módulos de Omni-4D; con `cosmos-predict` estándar se pierde la funcionalidad de seguimiento 3D.
- Adopción nula y sin validación externa: 0 descargas y 0 likes, sin issues ni informes independientes que respalden su comportamiento.
- Coste de almacenamiento y despliegue elevado: 122,9 GB de repositorio y pesos en bf16 sin cuantizaciones publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rooty2020/Cosmos3-ours-RB-Y1
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia y README del modelo base (NVIDIA Open Model License): https://huggingface.co/nvidia/Cosmos3-Nano/blob/main/README.md
- Torre ViT de origen: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- La búsqueda web realizada no devolvió resultados relevantes: solo páginas genéricas de Bing (webmasters, saves, rewards), sin papers, blogs ni repositorios asociados al modelo.
