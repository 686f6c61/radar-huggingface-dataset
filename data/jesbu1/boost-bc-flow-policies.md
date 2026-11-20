# jesbu1/boost-bc-flow-policies

## Resumen

`boost-bc-flow-policies` es una colección de políticas de comportamiento (behavior cloning) basadas en flow matching para robótica manipulativa, publicada por el usuario jesbu1 en Hugging Face. El repositorio no contiene un modelo único, sino un conjunto de checkpoints organizados por tarea y por tasa de éxito objetivo (aproximadamente 10, 25, 50, 75 y 90 %), pensados como bases fijas de partida para fine-tuning con aprendizaje por refuerzo (RL). Las tareas cubiertas son MimicGen Stack_D0 y Stack_D1, robosuite Tool Hang, FurnitureBench one_leg y Adroit Pen (AdroitHandPenSparse-v1).

El interés de esta publicación es metodológico: en lugar de ofrecer solo el mejor checkpoint de cada tarea, el autor ofrece un espectro graduado de rendimiento, de modo que un investigador puede arrancar un experimento de RL desde una política con un nivel de competencia controlado. El autor documenta explícitamente que los niveles más débiles son checkpoints tempranos del mismo entrenamiento sobre las mismas demostraciones, lo que permite estudiar cómo influye la calidad de la política inicial en el proceso de RL.

No se dispone de información sobre la arquitectura interna del actor (`GenerativeActor`, backend de flow matching), el número de parámetros ni la longitud de contexto; el repositorio pesa 1,6 GB y almacena pesos en formato PyTorch (`.pt`). La licencia figura como "other", sin que la model card concrete sus términos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (se cita `GenerativeActor` con backend de flow matching, sin detalle de capas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (observaciones por paso: imagen 96x96 de agentview y wrist + propiocepción de 9 dimensiones) |
| Tipos de cuantización | no disponible (pesos distribuidos en `.pt` sin versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | PyTorch `.pt` (`ema_actor.pt`); configuración en `config.yaml` y `train_overrides.yaml`; metadatos en `deploy_metadata.json`; normalización en `norm.npz` (solo Pen) |

## Arquitectura y entrenamiento

La model card indica que las políticas se entrenaron con el código `rfm_rl` (componente `GenerativeActor`, backend de flow matching), y remite a `RSS_EXPERIMENTS.md` de ese repositorio para los detalles. No se especifica el número de parámetros, la profundidad de la red, el tipo de codificador visual ni el número de pasos de integración del flow matching. Las observaciones son imágenes de 96x96 píxeles (vistas agentview y wrist) más un vector propioceptivo de 9 dimensiones; las acciones se normalizan en un rango min-max (archivo `norm.npz`, solo para Adroit Pen).

El entrenamiento es de imitación supervisada (behavior cloning) sobre conjuntos de demostraciones distintos por tarea: Stack_D0 usa 1010 demostraciones (10 humanas de `source/stack.hdf5` y 1000 generadas con MimicGen de `core/stack_d0.hdf5`, con las humanas primero); Stack_D1 usa 1000 demostraciones generadas con MimicGen (`core/stack_d1.hdf5`), sin mezclar las humanas de Stack_D0; Tool Hang usa las 200 demostraciones proficient-human de robomimic convertidas a robosuite v1.5; Pen usa demostraciones expertas para los niveles de 75 % o superiores. Los niveles de éxito más bajos corresponden a checkpoints tempranos del mismo entrenamiento (misma semilla y mismas demostraciones), conservando el schedule completo de learning rate. Las tasas de éxito se midieron sobre semillas nuevas no usadas para seleccionar el checkpoint, con n = 200 o n = 500 episodios (±7 puntos a n=200 y ±4,5 a n=500, 2σ).

## Capacidades

- Control robótico por imitación en tareas de manipulación con observaciones visuales y propioceptivas.
- Generación de acciones mediante flow matching condicionado a observaciones (política de acción continua).
- Stacks de cubos en dos variantes de MimicGen (Stack_D0 con 2 cubos; Stack_D1 con 2 cubos e inicialización amplia).
- Inserción de herramienta colgante (robosuite Tool Hang).
- Ensamblaje de una pata de mueble (FurnitureBench one_leg, simulación con baja aleatoriedad).
- Manipulación diestra de un bolígrafo (Adroit Pen, AdroitHandPenSparse-v1).
- Punto de partida para fine-tuning con RL, con niveles de competencia graduados (10/25/50/75/90 %).
- No se documentan capacidades de lenguaje, tool calling, agentes, visión general, audio ni modo de razonamiento.

## Casos de uso

- Investigación en fine-tuning con RL desde políticas iniciales de distinta calidad: usar pares de checkpoints (por ejemplo, `sr10` frente a `sr75` de Stack_D0) para medir cómo la calidad de la política base afecta a la muestra y la estabilidad del RL, manteniendo fijo el conjunto de demostraciones.
- Reproducción de experimentos de behavior cloning con flow matching: los archivos `config.yaml` y `train_overrides.yaml` permiten reconstruir la configuración exacta de cada checkpoint y comparar checkpoints tempranos y tardíos del mismo entrenamiento.
- Estudio de curvas de rendimiento en imitación: los checkpoints por paso (400, 500, 750, 1500 y 2000 en Stack_D0) permiten analizar la relación entre pasos de entrenamiento y tasa de éxito confirmada.
- Evaluación estandarizada en robosuite/MimicGen: los checkpoints de Tool Hang y Stack encajan en pipelines de evaluación existentes con observaciones de 96x96 y propiocepción de 9 dimensiones, siempre que se respete el conjunto de demostraciones original.
- Benchmarking de algoritmos de RL sobre políticas preentrenadas: las tasas de éxito confirmadas con n=200/500 y sus intervalos (±7 y ±4,5 puntos) sirven como línea base estadística para comparar métodos.
- Estudio de manipulación diestra con normalización min-max: el checkpoint de Adroit Pen incluye `norm.npz`, lo que facilita reproducir el preprocesado exacto de estados y acciones en experimentos de destreza fina.
- Docencia y prototipado en simulación: los niveles de 10 % y 25 % permiten disponer de políticas que fallan de forma controlada, útiles para demostrar recuperación o para entrenar críticos en RL.

## Benchmarks y rendimiento

Los datos publicados son tasas de éxito confirmadas por checkpoint (no benchmarks de lenguaje). Se reproducen a continuación.

| Tarea | 10 % | 25 % | 50 % | 75 % | 90 % |
|---|---|---|---|---|---|
| MimicGen Stack_D0 (2 cubos) | 13,0 % (n=200) | 22,5 % (n=200) | 47,0 % (n=500) | 72,0 % (n=200) | 89,0 % (n=200) |
| MimicGen Stack_D1 (2 cubos, init amplia) | — | — | 55,0 % (n=200) | — | — |
| robosuite Tool Hang | 11,5 % (n=200) | 25,0 % (n=200) | 49,5 % (n=200) | 73,5 % (n=200) | no alcanzado (mejor confirmado: el de 75 %) |
| FurnitureBench one_leg (sim, baja aleatoriedad) | 12,5 % (n=200) | 25,0 % (n=200) | 50,0 % (n=200) | no alcanzado; mejor 56,0 % (n=200) | no alcanzado |
| Adroit Pen (AdroitHandPenSparse-v1) | 10,0 % (n=500) | 26,2 % (n=500) | 51,8 % (n=500) | 75,6 % (n=500) | no alcanzado; mejor 83,6 % (n=500) |

Detalle de checkpoints en Stack_D0 (paso de entrenamiento y ejecución de origen): 10 % desde `rss_bc_stack_img_xfine_s1` @ 400; 25 % desde `rss_bc_stack_img_fine_s2` @ 500; 50 % desde `rss_bc_stack_img_fine_s1` @ 750; 75 % desde `rss_bc_stack_img_fine_s2` @ 1500; 90 % desde `rss_bc_stack_img_fine_s1` @ 2000. Stack_D1 50 % desde `rss_bc_stackd1_img_s1` @ 1000. Tool Hang 10 % desde `rss_bc_toolhang_img_fine_s0` @ 9000. Los intervalos de confianza son ±7 puntos a n=200 y ±4,5 a n=500 (2σ).

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo pesa 1,6 GB, pero el tamaño por checkpoint no se detalla; al tratarse de políticas con codificador visual de 96x96, la inferencia es presumiblemente ligera, aunque no hay cifras publicadas.
- GPU recomendadas: no disponible. No se especifican requisitos de GPU para entrenamiento ni para inferencia.
- Viabilidad en GPU de consumo: no disponible; no se confirma ni se descarta.
- Opciones de despliegue: los pesos están en PyTorch (`.pt`) y se cargan como `state_dict` del actor EMA; no se ofrecen versiones GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí). El despliegue requiere el código `rfm_rl` y los metadatos `deploy_metadata.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada (ni parámetros, ni contexto, ni licencia de alternativas). Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boost-bc-flow-policies | no disponible | no disponible | tasas de éxito por tarea (ver tabla) | other | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: no documentados; al entrenarse con demostraciones generadas (MimicGen) o humanas de robomimic, las políticas heredan las distribuciones y sesgos de esos conjuntos, sin que el autor los analice.
- Alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones fuera de distribución ante observaciones no vistas; no se cuantifica.
- Contexto e idioma: no hay soporte de lenguaje ni ventana de contexto textual; las observaciones son imágenes de 96x96 y propiocepción de 9 dimensiones, con el preprocesado exacto descrito en `deploy_metadata.json`.
- Restricciones de licencia: la licencia figura como "other" y la model card no detalla condiciones; no se puede asumir uso comercial sin consultar los términos del autor.
- Regla del conjunto de demostraciones: el autor exige que el RL que parta de estas bases use el mismo conjunto de demostraciones con el que se entrenó la base (mismo número y mismas demostraciones), salvo experimentos que fijen deliberadamente otro número por una razón declarada.
- Niveles no alcanzados: Tool Hang no llega al 90 % (mejor confirmado 73,5 %); FurnitureBench one_leg no alcanza el 75 % (mejor 56,0 %); Adroit Pen no alcanza el 90 % (mejor 83,6 %).
- Cobertura limitada: Stack_D1 solo publica el nivel del 50 %; no hay checkpoints de 10, 25, 75 ni 90 %.
- Incertidumbre estadística: las tasas tienen ±7 puntos a n=200 y ±4,5 a n=500 (2σ); comparaciones finas entre checkpoints próximos pueden no ser significativas.
- Dependencia del código: sin el repositorio `rfm_rl` y su documentación (`RSS_EXPERIMENTS.md`) no se pueden reproducir entrenamiento ni evaluación.
- Sin datos de hardware ni latencia: no es posible planificar despliegue en producción con la información publicada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jesbu1/boost-bc-flow-policies
- Checkpoint Stack_D0 10 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/stack_d0/sr10/ema_actor.pt
- Checkpoint Stack_D0 25 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/stack_d0/sr25/ema_actor.pt
- Checkpoint Stack_D0 50 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/stack_d0/sr50/ema_actor.pt
- Checkpoint Stack_D0 75 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/stack_d0/sr75/ema_actor.pt
- Checkpoint Stack_D0 90 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/stack_d0/sr90/ema_actor.pt
- Checkpoint Stack_D1 50 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/stack_d1/sr50/ema_actor.pt
- Checkpoint Tool Hang 10 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/tool_hang/sr10/ema_actor.pt
- Checkpoint Tool Hang 25 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/tool_hang/sr25/ema_actor.pt
- Checkpoint Tool Hang 50 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/tool_hang/sr50/ema_actor.pt
- Checkpoint Tool Hang 75 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/tool_hang/sr75/ema_actor.pt
- Checkpoint FurnitureBench one_leg 10 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/one_leg/sr10/ema_actor.pt
- Checkpoint FurnitureBench one_leg 25 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/one_leg/sr25/ema_actor.pt
- Checkpoint FurnitureBench one_leg 50 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/one_leg/sr50/ema_actor.pt
- Checkpoint FurnitureBench one_leg (mejor confirmado, 56,0 %): https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/one_leg/srmax/ema_actor.pt
- Checkpoint Adroit Pen 10 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/pen/sr10/ema_actor.pt
- Checkpoint Adroit Pen 25 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/pen/sr25/ema_actor.pt
- Checkpoint Adroit Pen 50 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/pen/sr50/ema_actor.pt
- Checkpoint Adroit Pen 75 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/pen/sr75/ema_actor.pt
- Checkpoint Adroit Pen (mejor confirmado, 83,6 %): https://huggingface.co/jesbu1/boost-bc-flow-policies/resolve/main/pen/srmax/ema_actor.pt
- Carpeta Stack_D0 10 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/tree/main/stack_d0/sr10
- Carpeta Stack_D0 25 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/tree/main/stack_d0/sr25
- Carpeta Stack_D0 50 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/tree/main/stack_d0/sr50
- Carpeta Stack_D0 75 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/tree/main/stack_d0/sr75
- Carpeta Stack_D0 90 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/tree/main/stack_d0/sr90
- Carpeta Stack_D1 50 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/tree/main/stack_d1/sr50
- Carpeta Tool Hang 10 %: https://huggingface.co/jesbu1/boost-bc-flow-policies/tree/main/tool_hang/sr10
- Código `rfm_rl` (referenciado en la model card; URL no indicada en la información disponible)
- Conjunto de demostraciones MimicGen: `amandlek/mimicgen_datasets` (referenciado; URL no indicada en la información disponible)
- Repositorio robomimic (demostraciones proficient-human de Tool Hang; URL no indicada en la información disponible)
- FurnitureBench (URL no indicada en la información disponible)
- AdroitHandPenSparse-v1 (entorno Adroit; URL no indicada en la información disponible)
