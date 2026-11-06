# OzzyGT/motionbricks_soma_diffusers

## Resumen

MotionBricks SOMA es un modelo de generación de movimiento humano en formato SOMA (esqueleto de 30 o 77 articulaciones) desarrollado originalmente por NVIDIA y republicado por el usuario OzzyGT en formato Diffusers. Su función concreta es el *motion inbetweening*: dado un contexto (los últimos fotogramas de una animación de origen) y una pose objetivo, genera en una sola pasada la transición entre ambos, decidiendo además la duración óptima de esa transición. El repositorio es un repackaging en float32 del modelo original `nvidia/MotionBricks`, no un modelo nuevo entrenado desde cero.

La arquitectura se descompone en tres módulos con un total aproximado de 189 millones de parámetros: `root_model` (40M) que selecciona la longitud de la transición y predice la trayectoria de la raíz, `pose_model` (137M) que predice los códigos de pose de cada token de cuatro fotogramas, y `pose_decoder` (12M) que decodifica esos códigos a fotogramas finales. El modelo opera a 30 FPS, acepta poses en formato SOMA30 o SOMA77 y devuelve movimiento en SOMA30.

Su relevancia actual radica en que facilita el uso del modelo original de NVIDIA dentro del ecosistema Diffusers mediante un pipeline modular, evitando al desarrollador tener que trabajar directamente con el grafo ONNX original. Es un modelo de nicho, orientado a animación 3D y síntesis de movimiento, no a generación de texto ni a tareas de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline modular de difusión con tres componentes: `root_model` (40M), `pose_model` (137M), `pose_decoder` (12M) |
| Parámetros totales | ~189M (suma de los tres componentes) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (en el sentido de ventana de tokens de texto; el modelo consume un contexto de poses de movimiento) |
| Tipos de cuantización | float32 (repositorio), float16 (con deriva pequeña), bfloat16 (cambia el movimiento de forma notable) |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo genera movimiento, no texto) |
| Licencia | NVIDIA Open Model Agreement (pesos); código del repositorio Apache-2.0 |
| Formato de pesos | safetensors (repositorio Diffusers) |
| Modelo base | `nvidia/MotionBricks` |
| Tamaño del repositorio | 0,8 GB |
| Frecuencia de muestreo | 30 FPS |
| Formatos de pose | SOMA30 (salida), SOMA77 y SOMA30 (entrada) |
| Librería requerida | `diffusers>=0.41.0` |

## Arquitectura y entrenamiento

El modelo original de NVIDIA se distribuye como grafo ONNX; este repositorio lo reempaqueta en PyTorch float32 dentro del formato Diffusers, reproduciendo el comportamiento del grafo ONNX con los ajustes por defecto de PyTorch. La arquitectura interna es un pipeline de difusión modular compuesto por tres submodelos especializados que colaboran secuencialmente: el `root_model` decide la longitud de la transición y genera la trayectoria de la raíz, el `pose_model` predice los códigos de pose para cada token correspondiente a cuatro fotogramas, y el `pose_decoder` traduce esos códigos a fotogramas de movimiento completos. El pipeline genera la transición completa en un único forward pass, sin bucle iterativo de difusión expuesto al usuario.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El repositorio es una conversión de formato, no un reentrenamiento, por lo que las características de entrenamiento corresponden al modelo original `nvidia/MotionBricks` y no se detallan en la información proporcionada. La innovación técnica destacable es la capacidad de elegir autológicamente la duración de la transición y la integración como bloques modulares de Diffusers con carga de código remoto.

## Capacidades

- Generación de movimiento humano en formato SOMA30 a 30 FPS.
- *Motion inbetweening*: genera la transición entre un contexto de poses y una pose objetivo en una sola pasada.
- Selección automática de la longitud de la transición (no requiere especificar el número de fotogramas).
- Aceptación de poses de entrada en SOMA30 y SOMA77.
- Colocación espacial del objetivo mediante `target_offset` (desplazamiento en el plano, por ejemplo 1,4 m en el eje X).
- Control del número de poses objetivo (`num_target_poses`).
- Salida en formato de diccionario numpy/`npz` con los datos de movimiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión ni audio.
- Capacidades multilingües: no aplica (modelo de movimiento, etiqueta `en` únicamente).

## Casos de uso

- Animación de transiciones en videojuegos: el modelo permite generar automáticamente la transición entre dos animaciones capturadas (por ejemplo, correr y quedarse de pie) sin necesidad de animar manualmente los fotogramas intermedios, gracias a su capacidad de decidir la duración óptima de la transición.
- Postproducción de captura de movimiento: dado un clip de motion capture y una pose objetivo, se generan los fotogramas de enlace para empalmar dos tomas de forma natural, usando `target_offset` para alinear espacialmente el destino.
- Previsualización rápida de *blocking* en animación 3D: los animadores pueden definir poses clave y dejar que el modelo rellene los intermedios en SOMA30 para iterar sobre el timing antes de refinar a mano.
- Generación de movimiento para avatares y personajes virtuales: integración en pipelines de animación procedural donde se necesita movimiento continuo y coherente a 30 FPS entre estados definidos.
- Investigación en síntesis de movimiento: el formato Diffusers modular facilita experimentar con los tres submodelos por separado (root, pose, decoder) y comparar con el grafo ONNX original de NVIDIA.
- Herramientas de autoría en motores 3D: el pipeline puede envolverse en un plugin que reciba poses SOMA77 del esqueleto del motor y devuelva movimiento SOMA30 listo para reproducir, aprovechando la compatibilidad con ambos formatos de entrada.
- Automatización de *retargeting* entre clips: al aceptar SOMA30 y SOMA77, se puede usar como paso intermedio para empalmar clips provenientes de distintas fuentes de captura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, MPJPE, diversidad, etc.) ni comparaciones numéricas con otros modelos de generación de movimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~189M de parámetros, en float32 ocupa aproximadamente 0,76 GB solo en pesos; con activaciones y overhead del pipeline, se estima un consumo de VRAM de entre 2 y 4 GB (estimación orientativa, no confirmada en la información disponible).
- En float16 el modelo reduce a la mitad la memoria de los pesos, con una deriva pequeña en el movimiento según la model card.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente; una RTX 4090 o superior ofrece margen amplio. No se especifican requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 6 GB o más de VRAM (estimación).
- Opciones de despliegue: el pipeline se ejecuta con `diffusers>=0.41.0` y `ModularPipelineBlocks`; requiere `pipe.to("cuda")` y carga de código remoto (`trust_remote_code=True`, `trust_components_code=True`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MotionBricks SOMA (este repo) | ~189M (40M + 137M + 12M) | Diffusers, safetensors, float32 | Poses SOMA30/SOMA77, 30 FPS | NVIDIA Open Model Agreement | Hugging Face (OzzyGT) |
| nvidia/MotionBricks | No disponible en la información | ONNX (original) | Poses SOMA | NVIDIA Open Model Agreement | Hugging Face (NVIDIA) |
| Otros modelos de motion inbetweening | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos alternativos comparables de generación de movimiento con datos verificables en la información proporcionada. La comparación más directa es con el modelo original de NVIDIA, del cual este repositorio es una conversión de formato.

## Limitaciones y advertencias

- Es un modelo de nicho: solo genera movimiento humano en formato SOMA; no sirve para texto, código, visión ni otras tareas.
- Requiere `diffusers>=0.41.0` y ejecuta código remoto de la Hub (`trust_remote_code=True` y `trust_components_code=True`); solo debe usarse con repositorios de confianza y revisando el código antes de cargarlo.
- La licencia de los pesos es la NVIDIA Open Model Agreement, no una licencia open source estándar; es necesario revisar sus términos para uso comercial.
- El código del repositorio es Apache-2.0, pero los pesos mantienen la licencia original de NVIDIA.
- En bfloat16 el movimiento cambia de forma notable según la model card; float16 introduce una deriva pequeña. Se recomienda float32 para reproducir fielmente el grafo ONNX original.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas (no aplican en el sentido habitual, al no ser un modelo de lenguaje).
- No se dispone de información sobre el dataset de entrenamiento original, lo que limita la evaluación de posibles sesgos en el movimiento generado (por ejemplo, sesgos de estilo o demografía del motion capture).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.
- El modelo depende de los bloques personalizados `OzzyGT/motionbricks_soma_custom_blocks` y de los datos de ejemplo `OzzyGT/diffusers-examples`, que son repositorios del mismo autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OzzyGT/motionbricks_soma_diffusers
- Modelo base original: https://huggingface.co/nvidia/MotionBricks
- Bloques personalizados: https://huggingface.co/OzzyGT/motionbricks_soma_custom_blocks
- Dataset de ejemplos: https://huggingface.co/datasets/OzzyGT/diffusers-examples
- Clip de ejemplo Kimodo SOMA Modular: https://huggingface.co/OzzyGT/Kimodo_SOMA_Modular
- Licencia NVIDIA Open Model Agreement: incluida en el archivo `LICENSE` del repositorio
- Aviso de cambios: incluido en el archivo `NOTICE` del repositorio
