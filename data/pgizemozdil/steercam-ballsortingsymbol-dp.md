# pgizemozdil/steercam-ballsortingsymbol-dp

## Resumen

SteerCamera es un conjunto de cinco políticas de difusión (Diffusion Policy) entrenadas de forma independiente para la tarea de clasificación de bolas marcadas (BallSortingSymbol) en un entorno simulado con MuJoCo Warp. Lo desarrolla pgizemozdil como parte del trabajo de investigación *Steer Your Camera*, centrado en la percepción activa: un controlador externo de cámara dirige la vista de un único sensor RGB para maximizar la información útil, mientras las políticas permanecen congeladas y solo exponen su distribución predictiva.

El modelo resuelve un problema concreto de manipulación robótica: levantar la bola correcta entre dos idénticas cuando solo una lleva una marca de 9 mm orientada en una dirección aleatoria. La dificultad radica en la oclusión y en la geometría de la escena, no en la destreza motora, por lo que el interés técnico está en cómo la incertidumbre de la política guía la selección del punto de vista.

Cada miembro es una Diffusion Policy de LeRobot con backbone ResNet-18 y U-Net condicional 1-D, entrenada sobre 50 demostraciones de teleoperación re-renderizadas desde 32 trayectorias de cámara. El repositorio ocupa 5,3 GB y contiene los cinco checkpoints del paso 200.000 junto con un archivo de calibración opcional. No está pensado para controlar un robot real: depende del renderizado y de la semántica de acciones del simulador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot `diffusion`): ResNet-18 con BatchNorm y spatial softmax + U-Net condicional 1-D [512, 1024, 2048], DDPM 100 pasos, DDIM-10 en inferencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 1 frame RGB de 128 x 128 y dos pasos de observación |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`member_k/model.safetensors`), con `config.json`, pre/post-procesadores y `train_config.json` por miembro |

## Arquitectura y entrenamiento

Cada miembro es una Diffusion Policy estándar de LeRobot. La observación se codifica con una ResNet-18 preentrenada en ImageNet (ResNet18_Weights.IMAGENET1K_V1) con BatchNorm y spatial softmax; la acción se genera mediante una U-Net condicional 1-D con canales [512, 1024, 2048] que denoisa un chunk de 16 x 7 acciones en el marco de la base del robot (traslación de la punta en cm, rotación en unidades de 0,05 rad y objetivo de los dedos), del cual se ejecutan 8. El proceso de difusión usa DDPM con 100 pasos en entrenamiento y DDIM con 10 pasos en test.

El entrenamiento consistió en 200.000 pasos con batch 64, optimizador AdamW con tasa 0,0001 y recortes aleatorios de [116, 116] píxeles. Los datos provienen de 50 demostraciones de teleoperación de la tarea BallSortingSymbol de ManiFeel, replicadas y re-renderizadas desde 32 trayectorias suaves y aleatorias de cámara que cubren toda la ventana de vista (el régimen "wide"). Los cinco miembros usan semillas 1000-1004 y corresponden al checkpoint del paso 200.000. La innovación no está en la arquitectura de la política, sino en su uso: el controlador de cámara lee la varianza total de los chunks generados como señal de incertidumbre y mueve la cámara para reducirla, sin actualizar jamás los pesos.

## Capacidades

- Generación de chunks de acción de 16 x 7 en el marco de la base del robot a partir de un único frame RGB de 128 x 128 y dos pasos de observación.
- Percepción de marcas finas (9 mm) bajo condiciones de oclusión parcial y desde distintos puntos de vista.
- Exposición de una distribución predictiva muestreable (`num_samples=8`), cuya varianza total sirve como medida de incertidumbre para percepción activa.
- Funcionamiento sin propriocepción ni pose de cámara: solo imagen.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en percepción activa: usar la incertidumbre de la política como señal para dirigir una cámara externa y comparar estrategias de steering (U-steering frente a vista fija) en el benchmark del paper.
- Evaluación de robustez frente a oclusión: medir la caída de éxito cuando la marca queda tapada (4-5 % con vista nominal) y analizar si el controlador recupera rendimiento (32-33 % bajo el oclusor).
- Estudio de ensembles en políticas de difusión: los cinco miembros con semillas distintas permiten analizar la calibración de la incertidumbre y el efecto de promediar o seleccionar muestras.
- Reproducción de experimentos de manipulación en MuJoCo Warp: sirve como baseline congelado para comparar nuevos controladores de cámara o nuevas políticas entrenadas sobre el mismo dataset.
- Generación de datos sintéticos de evaluación: re-renderizar la escena desde trayectorias de cámara arbitrarias y medir la tasa de éxito por celda del protocolo (100 episodios por celda).
- Docencia y divulgación en robótica: ejemplo completo y reproducible de Diffusion Policy con LeRobot, desde la descarga de assets hasta la inferencia por ensemble.

## Benchmarks y rendimiento

Resultados reportados en la model card (100 episodios por celda):

| Condición | Vista fija | U-steering |
|---|---|---|
| Vista nominal | 61-64 % | no disponible |
| Marca ocluida | 4-5 % | 32-33 % bajo el oclusor |
| Vista alta detrás del soporte | 2 % | 27-34 % desde el inicio alto trasero |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 5,3 GB y cada miembro es un checkpoint independiente, por lo que cargar los cinco en paralelo requiere del orden de varios GB de VRAM (estimación no confirmada por el autor).
- GPU recomendadas: no disponible; al tratarse de un modelo pequeño de visión y difusión 1-D, cualquier GPU con soporte CUDA es en principio suficiente.
- Cabe en GPU de consumo: probable, aunque no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: LeRobot (`lerobot[diffusion]>=0.6.1,<0.7`) mediante `DiffusionPolicy.from_pretrained` o el wrapper `steercam.policy.ensemble.PolicyEnsemble` del repositorio del paper.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SteerCamera (este modelo) | Diffusion Policy, ensemble de 5 | 1 frame RGB 128 x 128, 2 pasos | chunk 16 x 7 | no disponible | HuggingFace, LeRobot |
| Diffusion Policy original (Chi et al.) | Diffusion Policy | observaciones multimodales | chunk de acciones | código abierto (repo oficial) | paper y repositorio |
| ACT (Action Chunking Transformer) | Transformer con chunking | imágenes + estado | chunk de acciones | código abierto | repositorio ALoHA/LeRobot |
| VQ-BeT | Transformer con cuantización discreta | observaciones | acciones discretizadas | código abierto | repositorio oficial |

No se dispone de comparaciones numéricas directas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre el renderizado de MuJoCo Warp y la semántica de acciones del simulador; no está pensado para controlar un robot real.
- Requiere la escena texturizada del laboratorio simulado; cambios de iluminación, texturas o geometría fuera de distribución degradan el rendimiento.
- Dependencia fuerte del punto de vista: el éxito cae al 2 % desde la vista alta trasera y al 4-5 % con la marca ocluida sin steering.
- Sin propriocepción ni pose de cámara: no puede razonar sobre su propia configuración.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Riesgo de sobreajuste a las 50 demostraciones originales pese a la aumentación por re-renderizado.
- La calibración de la incertidumbre (`calibration.json`) es opcional y el benchmark usa U sin calibrar, lo que puede afectar a la comparabilidad entre entornos.
- Sin datos publicados de sesgos, alucinación o comportamiento fuera de la tarea; el alcance es una única tarea de clasificación de bolas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pgizemozdil/steercam-ballsortingsymbol-dp
- Código, tareas, datasets y benchmark: https://github.com/gizemozd/steer-your-camera
- Tarea BallSortingSymbol de ManiFeel (referenciada en la model card): no disponible como enlace directo
- Paper *Steer Your Camera* (en revisión): no disponible como enlace directo
