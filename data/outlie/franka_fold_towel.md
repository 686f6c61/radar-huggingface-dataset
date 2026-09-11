# outlie/franka_fold_towel

## Resumen

El repositorio `outlie/franka_fold_towel` contiene los artefactos de entrenamiento de una política robótica para la tarea de plegado de toallas sobre un brazo Franka. No es un modelo de lenguaje en sentido estricto: es un par actor-crítico compuesto por un transformer de acción fine-tuneado mediante SFT (supervised fine-tuning) y un crítico IQL condicionado por lenguaje, denominado `twin_language_query_transformer_v1`, ambos parte del ecosistema LingBot-VA. El actor sigue un contrato de acción de 30 dimensiones, con `frame_chunk_size=2`, y consume una imagen compuesta secuencial de 384x480 RGB (muñecas izquierda y derecha arriba, cabeza abajo).

La instrucción de tarea soportada es única y explícita: `fold the towel in half twice.` El checkpoint del actor está en el paso 21000 de entrenamiento y el del crítico en el paso 30000. El repositorio ocupa 51,1 GB e incluye estados de entrenamiento, manifiestos de reanudación y shards por rank, lo que indica que se publica como snapshot de un pipeline de entrenamiento distribuido más que como un artefacto listo para inferencia.

Su relevancia es acotada pero real para el ámbito de la robótica de manipulación: permite reproducir el entrenamiento, auditar el crítico y reutilizar el par actor-crítico para investigación en aprendizaje por imitación y refuerzo offline. Hay que subrayar que no es un modelo autónomo: para desplegarlo se necesita además la VAE base de LingBot-VA, el tokenizer y el text encoder correspondientes, que no están incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de política vision-language-action (VLA); actor SFT + crítico `twin_language_query_transformer_v1` (IQL) condicionado por lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el crítico usa `window_size=4` e `infer_latent_chunk_size=2`) |
| Tipos de cuantizacion | no disponible (no se documentan GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible (la instrucción de tarea publicada está en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio) y checkpoints PyTorch `.pt` (`training_state.pt`, `rank_*.pt`) |
| Dimension de accion | 30 (contrato del actor) |
| Frame chunk size | 2 |
| Entrada visual | Imagen compuesta secuencial 384x480 RGB (muñecas izquierda/derecha arriba, cabeza abajo) |
| Instruccion de tarea | `fold the towel in half twice.` |
| Feature taps del critico | `[0, 4, 8, 12, 16, 20, 24, 28]` |
| Paso de entrenamiento | Actor: `checkpoint_step_21000`; crítico: `checkpoint_00030000` |
| Tamano del repositorio | 51,1 GB |
| Libreria declarada | diffusers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-11 |

## Arquitectura y entrenamiento

El actor es un transformer de política entrenado por SFT sobre episodios de demostración de la tarea de plegado, con una cabeza de acción de 30 dimensiones y predicción en chunks de 2 frames. El repositorio incluye un fichero de configuración autocontenido (`va_franka_fold_towel_sft_self_contained_cfg.py`), lo que sugiere que el checkpoint se serializó junto con la definición completa del modelo, sin depender de un paquete externo para reconstruir la topología. La presencia de `resume_manifest.json` y de ficheros `rank_*.pt` apunta a un entrenamiento distribuido con sharding, reanudable.

El crítico es un `twin_language_query_transformer_v1` de tipo IQL (Implicit Q-Learning) condicionado por lenguaje, con ventana de 4 pasos y taps de características en las capas `[0, 4, 8, 12, 16, 20, 24, 28]`. Se publica junto a un `episode_success_overlay.json` y un `language_sidecar_manifest.json`, lo que encaja con un esquema de recompensas derivadas de éxito de episodio y de anotaciones de lenguaje en paralelo a los datos de trayectoria. La configuración original de entrenamiento en Nebula se conserva bajo `critic/provenance/`. Ambos checkpoints deben emparejarse: el crítico asume el contrato del transformer SFT.

No se documentan el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones de decodificación (especulativa, atención lineal, etc.). La información pública se limita al inventario de artefactos y a los hiperparámetros del contrato actor-crítico.

## Capacidades

- Generación de acciones de robot de 30 dimensiones para control de un brazo Franka en la tarea de plegado de toallas.
- Ejecución de una instrucción de lenguaje concreta: `fold the towel in half twice.`
- Procesamiento de entrada visual multi-cámara mediante imagen compuesta de 384x480 RGB (dos muñecas y cabeza).
- Predicción de acciones en chunks de 2 frames, lo que permite control a frecuencia fija con horizonte corto.
- Estimación de valor offline: el crítico IQL condicionado por lenguaje puede puntuar trayectorias y alimentar rutinas de refuerzo offline.
- Reanudación de entrenamiento: los manifiestos y estados permiten continuar el entrenamiento desde el paso 21000 (actor) y 30000 (crítico).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje con interfaz de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de texto; el razonamiento se limita al horizonte de acción.
- Capacidades multilingües: no disponible (la única instrucción documentada está en inglés).
- Capacidades especiales: par actor-crítico acoplado, con conditioning de lenguaje en el crítico y no solo en el actor.

## Casos de uso

- Plegado automatizado de toallas en lavandería industrial: el actor puede controlar un Franka con la instrucción `fold the towel in half twice.` usando la imagen compuesta de muñecas y cabeza para cerrar el lazo visual, siempre que se aporten la VAE, el tokenizer y el text encoder de LingBot-VA.
- Investigación en aprendizaje por imitación: el checkpoint SFT del paso 21000 sirve como punto de partida reproducible para estudiar el efecto del tamaño de dataset, aumentos de datos o cambios de chunk size en tareas de manipulación deformable.
- Refuerzo offline con crítico aprendido: el crítico IQL con `window_size=4` y taps `[0..28]` puede usarse para reetiquetar episodios con valores y filtrar trayectorias antes de un nuevo ciclo de entrenamiento del actor.
- Auditoría de un pipeline de entrenamiento distribuido: los `rank_*.pt`, `resume_manifest.json` y los manifiestos de provenance permiten reconstruir la configuración exacta de Nebula y depurar problemas de reproducibilidad.
- Transferencia a prendas similares: con fine-tuning adicional, el mismo contrato de 30 dimensiones puede adaptarse a plegado de sábanas, fundas o camisetas, reutilizando la cabeza de acción y el encoder visual ya aprendidos.
- Evaluación comparativa de políticas VLA: al ser un checkpoint publicado con instrucción explícita y layout de cámara definido, se puede usar como baseline en experimentos que comparen SFT frente a enfoques de flow matching o difusión.
- Docencia y prácticas de robótica: el par actor-crítico permite montar prácticas de aprendizaje por imitación y RL offline con un caso de manipulación deformable acotado y con contrato de acción explícito.
- Construcción de pares actor-crítico con conditioning de lenguaje: el diseño del crítico como transformer con consultas de lenguaje es reutilizable para otras tareas que requieran estimar valor en función de la instrucción, no solo del estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio describe el layout de ficheros, el contrato de acción y los hiperparámetros del crítico, pero no incluye tasas de éxito, métricas de error de acción, ni comparaciones con otras políticas. Tampoco se ha encontrado información adicional en la búsqueda web.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. El repositorio ocupa 51,1 GB, pero incluye estados de entrenamiento (`training_state.pt`) y shards por rank (`rank_*.pt`) que no se requieren en inferencia; el peso congelado del transformer es necesariamente menor que esa cifra.
- Para desplegar el actor hay que cargar además los componentes base de LingBot-VA (VAE, tokenizer, text encoder), no incluidos en el repositorio, lo que incrementa el consumo de memoria más allá del checkpoint publicado.
- GPU recomendadas: no disponible. La tarea es de inferencia de política visual, no de generación de texto de contexto largo, por lo que la restricción principal es la memoria del encoder visual y la latencia de control, no el ancho de banda de KV cache.
- Cabe en GPU de consumo: no disponible (se desconoce el número de parámetros del transformer; conviene medirlo tras cargar la configuración autocontenida).
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El tag `diffusers` sugiere integración con ese ecosistema, pero al tratarse de una política de acción con contrato propio, el despliegue previsible es PyTorch nativo con el fichero de configuración incluido y consolidación previa de los shards si se parte de los `rank_*.pt`.
- Latencia y throughput: no disponible. Con `frame_chunk_size=2`, la política produce dos acciones por inferencia, lo que fija el techo de frecuencia de control efectiva en función del coste de cada forward pass.
- Almacenamiento: prever al menos 51,1 GB para el repositorio completo y espacio adicional para el consolidado del checkpoint y para los componentes base de LingBot-VA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| outlie/franka_fold_towel (este) | no disponible | ventana de 4 pasos en el crítico; chunks de 2 frames en el actor | no disponible | no disponible | Pesos abiertos en HuggingFace, requiere base LingBot-VA |
| OpenVLA | 7B (VLM Llama-2-7B + encoders visuales) | no disponible | no disponible | sujeta a la licencia base del LLM (consultar) | Pesos y código abiertos |
| Octo | variantes pequeñas (decenas de millones de parámetros) | no disponible | no disponible | abierta (consultar) | Pesos y código abiertos |
| pi0 / openpi | escala de miles de millones | no disponible | no disponible | abierta (consultar) | Pesos y código abiertos |

Nota: los campos marcados como no disponibles no se han verificado en fuentes oficiales durante esta búsqueda y no deben tomarse como datos confirmados. La comparación relevante es de categoría: este repositorio es una política especializada de una sola tarea con un crítico IQL acoplado, mientras que OpenVLA, Octo y pi0 son modelos de propósito general entrenados sobre conjuntos multi-embodiment. En cobertura de tareas y generalización, este checkpoint está claramente por debajo; en contrapartida, publica el par actor-crítico completo y los artefactos de entrenamiento, algo poco habitual.

## Limitaciones y advertencias

- Modelo de tarea única: solo se documenta `fold the towel in half twice.` No hay evidencia de generalización a otras instrucciones ni a otras prendas.
- Dependencia externa no incluida: el checkpoint SFT necesita la VAE base de LingBot-VA, el tokenizer y el text encoder. Sin ellos el repositorio no es desplegable por sí solo.
- Acoplamiento actor-crítico: el crítico debe emparejarse con el contrato del transformer SFT; usar un crítico u otro actor fuera de ese emparejamiento invalida las estimaciones de valor.
- Licencia no disponible: no se puede confirmar el uso comercial, la redistribución ni la obligación de atribución. Cualquier uso en producción requiere aclarar la licencia previamente.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de acciones fuera de distribución cuando la escena difiere del layout de cámara o del tipo de toalla del entrenamiento.
- Sensibilidad al montaje de cámara: el contrato de imagen compuesta (muñecas arriba, cabeza abajo, 384x480) es parte del modelo; cambiar el layout degrada el comportamiento.
- Sesgos y limitaciones de idioma: no disponible. La única instrucción documentada está en inglés; no se ha publicado evaluación multilingüe.
- Contenido del repositorio: 51,1 GB con estados de optimizador, shards por rank y manifiestos de provenance. Es material de investigación y entrenamiento, no un artefacto optimizado para despliegue.
- Ficheros `.pt`: requieren `torch.load`, que deserializa pickle. Cargar estos ficheros de fuentes no confiables conlleva riesgo de ejecución de código; conviene auditar o convertir a safetensors.
- Ausencia de benchmarks: sin métricas de tasa de éxito ni de precisión de acción, no es posible estimar el rendimiento en producción ni compararlo con alternativas.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay comunidad que haya validado la reproducibilidad del checkpoint.
- Fechas de creación y actualización (2026-09-11) posteriores a la fecha habitual de consulta; conviene verificar si se trata de un repositorio reciente o de metadatos corregidos.
- Etiqueta `diffusers` sin pipeline declarado: no hay confirmación de que exista una integración funcional con las clases de diffusers para inferencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/outlie/franka_fold_towel
- Model card (contenido citado en la información proporcionada): https://huggingface.co/outlie/franka_fold_towel/blob/main/README.md
- Ficheros del actor SFT: https://huggingface.co/outlie/franka_fold_towel/tree/main/sft/checkpoint_step_21000
- Ficheros del crítico: https://huggingface.co/outlie/franka_fold_towel/tree/main/critic/checkpoint_00030000
- Configuración de provenance del crítico: https://huggingface.co/outlie/franka_fold_towel/tree/main/critic/provenance
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relacionados con este modelo; los resultados obtenidos correspondían a foros y artículos sin relación (replay de MyTF1, comparativas de consumo, juguetes).
