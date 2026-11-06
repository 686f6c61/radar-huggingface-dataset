# MINT-SJTU/Evo-DexBench_model_access_example

## Resumen

Evo-DexBench_model_access_example es un repositorio de checkpoints de inferencia publicado por MINT-SJTU (Shanghai Jiao Tong University) como parte del benchmark Evo-DexBench, orientado a la manipulación diestra robótica. No es un modelo de lenguaje ni un transformer generativo de texto: contiene seis políticas de control entrenadas mediante difusión (diffusion policies) que traducen observaciones visuales —y en un caso también táctiles— en acciones motoras de bajo nivel para brazos robóticos, tanto unimanuales como bimanuales.

El paquete incluye tres arquitecturas de política (DP-T, DP-C y KineDex) con dos checkpoints cada una, correspondientes a los grupos de tareas Single2 Core y Double3 Core. Cada checkpoint se entrenó conjuntamente sobre cuatro tareas de manipulación (por ejemplo, abrir el tapón de una tetera, cerrar un portátil o abrir unas tijeras), y se ejecuta contra el simulador del benchmark mediante una API de política basada en WebSocket y MessagePack, lo que desacopla el proceso de inferencia del entorno de simulación.

Su relevancia es metodológica: sirve como ejemplo reproducible de integración de políticas en Evo-DexBench y permite comparar tres diseños de diffusion policy (transformer, U-Net convolucional y política visotáctil) bajo el mismo contrato de observación y acción. El repositorio contiene únicamente pesos de inferencia, no código de entrenamiento ni assets de simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de difusión: DP-T (Diffusion Policy Transformer), DP-C (U-Net convolucional de Diffusion Policy) y KineDex (política de difusión visotáctil con adaptador Evo-DexBench) |
| Parametros totales | No disponible (el repositorio solo publica tamaños en disco: DP-T 0,171 GB; DP-C 1,177-1,185 GB; KineDex 1,544-1,552 GB por checkpoint) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; cada inferencia usa dos frames de observación y ejecuta por defecto 8 acciones antes de solicitar el siguiente chunk (horizonte decreciente) |
| Tipos de cuantizacion | No disponible; los checkpoints conservan la precisión y los valores originales de los tensores, sin cuantización documentada |
| Idiomas soportados | Inglés (documentación y metadatos); el modelo no procesa lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ckpt` nativo del espacio de trabajo de políticas (pickle de Python), no compatible con `from_pretrained` de Transformers ni Diffusers |

## Arquitectura y entrenamiento

Las tres políticas pertenecen a la familia de diffusion policies, que modelan la distribución de acciones condicionada a observaciones mediante un proceso de difusión. DP-T emplea la variante transformer oficial de Diffusion Policy; DP-C usa la variante convolucional con U-Net; KineDex añade entrada táctil (cinco arrays por dedo y mano, con padding a 29×1) y un adaptador específico de Evo-DexBench que convierte las fuerzas de dedo predichas en residuales de control articular acotados. Las entradas visuales son tres vistas RGB a 224×224 (contexto, interacción y muñeca derecha en Single2; interacción, muñeca izquierda y muñeca derecha en Double3) y no se utilizan mapas de profundidad.

Cada checkpoint se entrenó de forma conjunta sobre las cuatro tareas de su grupo Core, y el payload exportado conserva las EMA de inferencia, los normalizadores, la configuración del modelo y los metadatos de la política, eliminando pesos duplicados, estado del optimizador y estado de progreso de entrenamiento. El control opera a 30 Hz con dos frames de observación, mientras que el simulador corre a 120 Hz. DP mantiene la inferencia DDPM original de 100 pasos y KineDex conserva los ajustes DDIM de su checkpoint. No se documentan en la información disponible el número de tokens, la composición del dataset de entrenamiento ni el uso de RLHF o DPO, que además no aplican a este tipo de modelo.

## Capacidades

- Generación de acciones motoras de manipulación diestra a partir de observaciones RGB y estado del robot, a 30 Hz.
- Control unimanual (grupo Single2: 31 dimensiones de estado, 30 dimensiones de acción) y bimanual (grupo Double3: 62 dimensiones de estado, 60 dimensiones de acción).
- Percepción táctil en KineDex, con 5 dimensiones adicionales de fuerza por mano (30+5 y 60+10 dimensiones de acción respectivamente).
- Ejecución de cuatro tareas por checkpoint: FaucetHandle (m06_v1), MouseWheel (m07_v1), CoffeeKnob (m08_v1) y KettleLidTab (m09_v1) en Single2; LaptopClosing (b11_v1), StaplerPaperMark (b12_v1), ScissorsOpening (b13_v1) y BoxLidOpening (b14_v1) en Double3.
- Integración cliente-servidor mediante la Policy API del benchmark (WebSocket + MessagePack), con procesos de modelo y simulación independientes.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- Reproducción del benchmark Evo-DexBench: cargar los seis checkpoints y ejecutar las tareas Core contra el simulador para verificar la integración de la Policy API y comparar el comportamiento de DP-T, DP-C y KineDex bajo el mismo contrato de observación.
- Desarrollo de servidores de política: usar el manifest y los contratos de observación como referencia para implementar un servidor compatible con WebSocket y MessagePack que sirva pesos propios.
- Investigación en manipulación bimanual: el grupo Double3 permite estudiar coordinación de dos brazos en tareas como cerrar un portátil o abrir una caja, con 60 dimensiones de acción y tres vistas RGB.
- Estudio de fusión visotáctil: KineDex aporta un punto de comparación directo frente a DP-T y DP-C para medir el efecto de añadir señales táctiles en tareas de precisión como girar una rueda de ratón o accionar un pomo.
- Evaluación de arquitecturas de difusión: comparar el coste en disco y el comportamiento de un transformer (0,171 GB) frente a una U-Net convolucional (1,177 GB) en las mismas tareas y con el mismo esquema de ejecución.
- Docencia y prototipado en robótica: servir de ejemplo mínimo funcional de conexión entre un simulador y un modelo de difusión externo, sin necesidad de entrenar desde cero.
- Integración en pipelines de simulación a mayor escala: al ser checkpoints de inferencia ligeros (salvo KineDex), permiten desplegar varias políticas en paralelo para barridos de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Por tamaño de pesos, DP-T requiere del orden de 0,2 GB, DP-C alrededor de 1,2 GB y KineDex alrededor de 1,6 GB en precisión original, más el overhead del runtime de PyTorch y de las tres cámaras RGB a 224×224.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos 4-8 GB de VRAM debería alojar los pesos; KineDex es el más exigente por tamaño y por la entrada táctil adicional.
- Compatibilidad con GPU de consumo: previsiblemente sí en todas las políticas, dado el reducido tamaño de los checkpoints, aunque no se documenta una lista de GPUs validadas.
- Opciones de despliegue: el servidor de políticas propio del benchmark Evo-DexBench, lanzado desde un checkout del repositorio con los perfiles `policy-dp` y el cliente KineDex; no se contempla vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor advierte explícitamente de no alterar la temporización de acciones ni los contratos de sensores para compensar una GPU más lenta; DP mantiene 100 pasos DDPM y KineDex sus ajustes DDIM.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entradas | Tamano por checkpoint | Tareas | Licencia |
|---|---|---|---|---|---|
| DP-T (este repo) | Diffusion Policy Transformer | RGB + estado | 0,171 GB | 4 por checkpoint | Apache 2.0 |
| DP-C (este repo) | Diffusion Policy U-Net | RGB + estado | 1,177-1,185 GB | 4 por checkpoint | Apache 2.0 |
| KineDex (este repo) | Difusión visotáctil con adaptador | RGB + estado + táctil | 1,544-1,552 GB | 4 por checkpoint | Apache 2.0 |
| Otras políticas del benchmark Evo-DexBench | No disponible | No disponible | No disponible | Hasta 30 tareas en el benchmark | No disponible |

No se dispone de datos de rendimiento comparado entre estas políticas ni frente a alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Son especialistas de familia de tareas, no políticas universales: cada checkpoint cubre solo cuatro tareas y no las 30 del benchmark completo.
- El repositorio contiene únicamente checkpoints; no incluye assets de simulación, demostraciones ni código de entrenamiento, por lo que no sirve para reentrenar.
- Los archivos `.ckpt` usan pickle de Python y deben cargarse solo desde fuentes de confianza y a través del servidor de modelo proporcionado.
- No son compatibles con `from_pretrained` de Transformers o Diffusers; requieren el espacio de trabajo de políticas del benchmark.
- Los checkpoints DP necesitan una revisión del código que incluya `examples/policies/diffusion_policy/` y el perfil `policy-dp`; si no está disponible, hay que obtener una release con soporte DP.
- Double3 usa la cámara de interacción, no la vista de contexto por defecto de doble brazo; seleccionar mal la cámara invalida la evaluación.
- No se deben modificar la temporización de acciones ni los contratos de sensores para compensar hardware lento.
- El acceso a los assets requiere aceptar los términos del repositorio PartNet-Mobility.
- No hay información publicada sobre sesgos, tasas de alucinación o robustez fuera de distribución; en robótica, el equivalente es la degradación ante condiciones visuales o táctiles distintas de las de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero los assets de simulación y el dataset asociado pueden tener condiciones adicionales que hay que verificar por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MINT-SJTU/Evo-DexBench_model_access_example
- Dataset: https://huggingface.co/datasets/MINT-SJTU/Evo-DexBench-dataset
- Assets: https://huggingface.co/datasets/MINT-SJTU/Evo-DexBench_Assets
- Paper (arXiv): https://arxiv.org/abs/2610.21180
- Código: https://github.com/MINT-SJTU/Evo-DexBench
- Página del proyecto: https://mint-sjtu.github.io/Evo-DexBench.io
- Assets de simulación PartNet-Mobility: https://huggingface.co/datasets/sapien-sim/PartNetMobility
