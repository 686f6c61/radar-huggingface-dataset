# pgizemozdil/steercam-objectsearchv2-disc6-scratch-dp

## Resumen

SteerCamera es un conjunto (ensemble) de cinco políticas de difusión (Diffusion Policy) entrenadas de forma independiente para la tarea ObjectSearchV2 del entorno ManiFeel, portada a MuJoCo Warp. El modelo lo publica el usuario pgizemozdil en Hugging Face y forma parte del material experimental del artículo *Steer Your Camera* (en revisión), cuyo código vive en el repositorio steer-your-camera. El objetivo de esta variante concreta es servir de brazo de control en el experimento sobre el codificador visual: se entrena con `pretrained_backbone_weights=None`, es decir, con una ResNet-18 inicializada desde cero en lugar de con pesos de ImageNet, para medir cuánto del rendimiento depende de esa inicialización.

Cada miembro del ensemble es una LeRobot Diffusion Policy completa: entrada de una única imagen RGB de 128 x 128 px procedente de una cámara externa orientable, dos pasos de observación y salida de un chunk de 16 acciones de 7 dimensiones en el marco de la base del robot (traslación de la punta en cm, rotación en unidades de 0,05 rad y objetivo de los dedos), de las cuales se ejecutan 8. No usa propriocepción ni la pose de la cámara. La arquitectura combina una ResNet-18 con GroupNorm y softmax espacial, una U-Net condicional 1-D con canales [512, 1024, 2048] y un proceso DDPM de 100 pasos (DDIM-10 en inferencia).

La relevancia es acotada pero clara para investigación en percepción activa: las políticas están congeladas y el controlador de cámara (guía de vista basada en incertidumbre) solo lee su distribución predictiva, nunca las actualiza. El repositorio ocupa 5,3 GB, no tiene descargas ni likes, y no se declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LeRobot `diffusion`: ResNet-18 (GroupNorm, softmax espacial, pesos desde cero) + U-Net condicional 1-D [512, 1024, 2048], DDPM 100 pasos (DDIM-10 en test) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 1 frame RGB 128 x 128 y dos pasos de observación |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` por miembro, layout LeRobot `pretrained_model`) |

## Arquitectura y entrenamiento

Cada miembro es una Diffusion Policy estándar de LeRobot. El codificador visual es una ResNet-18 con GroupNorm y capa de softmax espacial, inicializada desde cero (`pretrained_backbone_weights=None`). Sobre las características visuales se aplica una U-Net condicional 1-D con anchos [512, 1024, 2048] que modela el chunk de acciones mediante difusión: 100 pasos DDPM en entrenamiento y 10 pasos DDIM en inferencia. La salida es un chunk de 16 x 7 acciones en el marco de la base del robot, del que se ejecutan 8.

El entrenamiento se realizó durante 200.000 pasos con batch de 64, optimizador AdamW con tasa 0,0001 y recortes aleatorios de [116, 116] píxeles. Los datos provienen de 50 demostraciones de teleoperación de ManiFeel en la tarea ObjectSearchV2, replicadas y re-renderizadas desde 32 recorridos de cámara suaves y aleatorios a lo largo de toda la ventana de vistas (el régimen "wide"). Se entrenaron cinco semillas independientes (1000-1004), y el checkpoint publicado corresponde al paso 200.000 de cada una. El fichero `calibration.json` contiene la normalización z por fases de los términos de incertidumbre, aunque el benchmark usa la U sin calibrar.

## Capacidades

- Predicción de chunks de acción de 16 x 7 en el marco de la base del robot a partir de una imagen RGB de 128 x 128 px de una cámara externa orientable.
- Política de difusión multimodal: al muestrear varias veces se obtiene una distribución de acciones, cuya varianza total logarítmica (U) sirve como señal de incertidumbre para el controlador de cámara.
- Ensemble de cinco miembros con semillas distintas, agregables mediante `PolicyEnsemble.sample` con `num_samples` configurable.
- No requiere propriocepción ni estimación de pose de cámara.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.
- No incluye modo de pensamiento, audio ni otras modalidades.

## Casos de uso

- Investigación en percepción activa: el ensemble proporciona la distribución predictiva que un controlador de vista basado en incertidumbre consume para decidir hacia dónde orientar la cámara; es el escenario para el que se publicó.
- Estudio de ablación del codificador visual: al estar entrenado desde cero, sirve para cuantificar la contribución de la inicialización ImageNet en la ResNet-18 comparándolo con el ensemble preentrenado del mismo artículo.
- Reproducción de benchmarks: el repositorio incluye el protocolo (`benchmarks/protocol.py`) y los checkpoints en el layout esperado, lo que permite reevaluar la tarea ObjectSearchV2 con 100 episodios por celda.
- Evaluación de ensembles en políticas de difusión: los cinco miembros con semillas 1000-1004 permiten medir la dispersión entre inicializaciones y su efecto en la estimación de incertidumbre.
- Prototipado de pipelines de robótica simulada: integrable en flujos basados en MuJoCo Warp y LeRobot para experimentar con selección de vistas antes de trasladar ideas a otros entornos.
- Docencia y experimentos de aprendizaje por imitación: con 50 demostraciones y un pipeline reproducible, sirve como ejemplo mínimo de entrenamiento de Diffusion Policy con aumento de datos por re-renderizado de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que este ensemble es el brazo de comparación para la pregunta del codificador y que el ensemble preentrenado es el predeterminado en el artículo, con 100 episodios por celda, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio pesa 5,3 GB e incluye cinco checkpoints completos más ficheros auxiliares, por lo que un solo miembro es sustancialmente menor.
- GPU recomendadas: no disponibles; al tratarse de una ResNet-18 más una U-Net 1-D sobre chunks de 16 x 7, la carga es moderada, pero no se aportan medidas.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot[diffusion]>=0.6.1,<0.7`), con carga directa mediante `DiffusionPolicy.from_pretrained(..., subfolder="member_k")` o a través de `steercam.policy.ensemble.PolicyEnsemble`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steercam-objectsearchv2-disc6-scratch-dp | no disponible | 1 frame RGB 128 x 128, 2 pasos de observación | ObjectSearchV2 (ManiFeel / MuJoCo Warp) | no disponible | Hugging Face, 0 descargas |
| Ensemble preentrenado de SteerCamera (mismo artículo) | no disponible | misma entrada | misma tarea, ResNet-18 con pesos ImageNet | no disponible | referenciado en la model card, sin ID explícito |
| Otras Diffusion Policies de LeRobot | no disponible | variable según tarea | manipulación robótica diversa | generalmente Apache-2.0 en LeRobot, no confirmado aquí | Hugging Face / repositorio LeRobot |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Las políticas esperan el renderizado del simulador (MuJoCo Warp, escena de laboratorio texturizada) y su semántica de acciones; no están pensadas para pilotar un robot real.
- El modelo está entrenado con solo 50 demostraciones replicadas y 32 recorridos de cámara, lo que limita su generalización fuera del régimen "wide" y de la tarea ObjectSearchV2.
- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- No hay información sobre sesgos, pero al ser un modelo de control visual entrenado en un único entorno simulado, cabe esperar una fuerte dependencia del dominio visual de entrenamiento.
- El brazo "scratch" está pensado como control experimental; la propia model card indica que el ensemble preentrenado es el predeterminado en el artículo, de modo que este modelo no debe tomarse como la versión de referencia.
- No se aportan datos de benchmarks, latencia ni requisitos de hardware, lo que dificulta evaluar su idoneidad en producción.
- El repositorio no tiene descargas ni validación comunitaria; la reproducibilidad depende del código externo del repositorio steer-your-camera.

## Enlaces

- Hugging Face: https://huggingface.co/pgizemozdil/steercam-objectsearchv2-disc6-scratch-dp
- Código, tareas, datasets y benchmark: https://github.com/gizemozd/steer-your-camera
- Artículo *Steer Your Camera* (en revisión): no disponible enlace directo en la información proporcionada
- LeRobot: https://github.com/huggingface/lerobot (referenciado por la librería, no enlazado en la model card)
- ManiFeel: no disponible enlace directo en la información proporcionada
