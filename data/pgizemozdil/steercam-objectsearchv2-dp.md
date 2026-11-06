# pgizemozdil/steercam-objectsearchv2-dp

## Resumen

SteerCamera es un conjunto congelado de cinco políticas de difusión (Diffusion Policy) entrenadas con LeRobot para la tarea ObjectSearchV2 de ManiFeel, portada a MuJoCo Warp. El modelo resuelve un problema de percepción activa: localizar y levantar una batería que puede estar en cualquier punto dentro de una caja abierta, cuando la cámara frontal fija del entorno original solo ve la pared de la caja. Para ello, el sistema emplea una única cámara externa orientable cuyo controlador (guiado por incertidumbre) consulta la distribución predictiva de estas políticas sin actualizarlas.

Cada miembro es una Diffusion Policy estándar de LeRobot: un backbone ResNet-18 preentrenado en ImageNet con spatial softmax que procesa un fotograma RGB de 128 x 128, seguido de una U-Net 1-D condicional con canales [512, 1024, 2048] y un proceso DDPM de 100 pasos (DDIM-10 en inferencia). La entrada son dos pasos de observación sin propriocepción ni pose de cámara; la salida es un chunk de 16 acciones de 7 dimensiones en el marco de la base del robot, del que se ejecutan 8.

El interés del artefacto es metodológico y de reproducibilidad: se publican los cinco checkpoints (semillas 1000-1004, paso 200.000) junto con una calibración opcional de los términos de incertidumbre, lo que permite replicar los experimentos de la publicación *Steer Your Camera* (en revisión) y comparar estrategias de steering de cámara frente a vistas fijas. No es un modelo de propósito general ni está pensado para operar un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy: ResNet-18 (BatchNorm, pesos ImageNet-1K) con spatial softmax + U-Net 1-D condicional [512, 1024, 2048], DDPM 100 pasos (DDIM-10 en test) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 2 pasos de observación con un fotograma RGB de 128 x 128 |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` por miembro, layout LeRobot `pretrained_model`) |

Otros datos: tamaño del repositorio 5,3 GB; cinco miembros (`member_0` a `member_4`); salida de 16 x 7 acciones (traslación de la punta en cm, rotación en unidades de 0,05 rad, objetivo de dedo); 8 acciones ejecutadas por chunk.

## Arquitectura y entrenamiento

La política sigue el esquema Diffusion Policy de LeRobot. Un codificador visual ResNet-18 con normalización por lotes y pesos preentrenados en ImageNet-1K (`ResNet18_WEIGHTS_IMAGENET1K_V1`) extrae características del fotograma de 128 x 128 y las agrega mediante spatial softmax. Esas características, junto con el estado, condicionan una U-Net 1-D con canales [512, 1024, 2048] que aprende a invertir un proceso de difusión DDPM de 100 pasos; en inferencia se usa un sampler DDIM de 10 pasos. No hay entrada de propriocepción ni de pose de cámara: toda la información proviene de dos pasos de observación visual.

El entrenamiento se realizó durante 200.000 pasos con batch de 64, optimizador AdamW con tasa 0,0001 y recortes aleatorios de [116, 116] píxeles. Los datos proceden de 50 demostraciones de teleoperación de ManiFeel, replicadas y re-renderizadas desde 32 trayectorias de cámara suaves y aleatorias que cubren toda la ventana de vista (régimen "wide"). Se entrenaron cinco miembros con semillas 1000-1004 y se publica el checkpoint del paso 200.000 de cada uno. El fichero `calibration.json` contiene una normalización z por fases de los términos de incertidumbre, aunque el benchmark del artículo usa la incertidumbre U sin calibrar. La innovación técnica no está en la política, que es estándar, sino en su uso como ensemble congelado cuya varianza total logarítmica de los chunks (U) sirve de señal para el controlador de cámara.

## Capacidades

- Generación de chunks de acción de 16 x 7 en el marco de la base del robot a partir de un único fotograma RGB de 128 x 128 y dos pasos de observación.
- Percepción activa indirecta: la distribución predictiva de los cinco miembros permite estimar incertidumbre (varianza total logarítmica de los chunks) y guiar la orientación de la cámara.
- Manipulación de precisión en escena: levantar una batería situada en cualquier posición dentro de una caja abierta.
- Ejecución de acciones con horizonte corto: 8 de las 16 acciones del chunk se ejecutan antes de volver a planificar.
- Ensemble de cinco políticas independientes con semillas distintas, lo que habilita estimaciones de varianza epistémica aproximada.
- No soporta tool calling, function calling, agentes multi-paso, texto, visión general, audio ni modo de razonamiento. Es un artefacto específico de robótica.

## Casos de uso

- Reproducción de experimentos de percepción activa: cargar los cinco miembros con `PolicyEnsemble` y comparar el éxito de la vista fija frente al steering guiado por U en las celdas del benchmark (vista nominal, vista de pared de caja, oclusor), con 100 episodios por celda.
- Investigación en uncertainty-guided view steering: usar la varianza de los chunks como señal para mover la cámara externa y medir la ganancia de éxito (62-66 % frente a 47-50 % desde la vista nominal).
- Baseline para nuevas políticas de búsqueda de objetos: servir como referencia congelada frente a la que evaluar controladores de cámara o políticas entrenadas con otros regímenes de datos.
- Estudio de robustez ante oclusión: analizar la caída de rendimiento (0 % con cámara fija bajo oclusor frente a 15-21 % con steering) para diseñar estrategias de recuperación.
- Aumento de datos sintéticos: reutilizar las 32 trayectorias de cámara y el pipeline de re-renderizado de MuJoCo Warp para generar nuevos conjuntos de demostraciones con vistas variables.
- Docencia y divulgación en robótica de manipulación: el entorno simulado, el tamaño reducido de la entrada (128 x 128) y la API de LeRobot facilitan experimentos reproducibles en laboratorio.
- Validación de calibración de incertidumbre: comparar el uso de U sin calibrar con la normalización z por fases de `calibration.json` en la selección de vistas.

## Benchmarks y rendimiento

Resultados publicados en la model card (100 episodios por celda):

| Estrategia | Vista nominal | Vista de pared de caja | Bajo oclusor |
|---|---|---|---|
| Cámara fija | 47-50 % éxito | 10-15 % éxito | 0 % éxito |
| Steering guiado por U | 62-66 % éxito | 62-66 % éxito | 15-21 % éxito |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 5,3 GB e incluye cinco checkpoints completos, por lo que cada miembro individual es del orden de 1 GB en safetensors. Con el backbone ResNet-18 y la U-Net 1-D, la inferencia de un miembro cabe holgadamente en GPUs de consumo, aunque la cifra exacta no está publicada.
- GPU recomendadas: no disponibles en la información proporcionada. Para ejecutar el ensemble completo de cinco miembros en paralelo se recomienda una GPU con suficiente memoria para cinco copias del modelo y sus lotes; una RTX 4090 o A100 son opciones razonables, pero no está confirmado por el autor.
- Cabe en GPU de consumo: probablemente sí para un solo miembro; sin dato oficial.
- Opciones de despliegue: LeRobot (`lerobot[diffusion]>=0.6.1,<0.7`), `DiffusionPolicy.from_pretrained(..., subfolder="member_k")` y `PolicyEnsemble` del repositorio `steer-your-camera`. Requiere el simulador MuJoCo Warp con la escena texturizada de laboratorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles. El sampler DDIM-10 y la entrada de 128 x 128 sugieren una inferencia ligera, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| SteerCamera (este) | Diffusion Policy, ensemble de 5 | no disponible | 2 pasos, RGB 128 x 128 | 47-66 % según vista y steering | no disponible |
| Diffusion Policy original (Chi et al.) | Diffusion Policy | no disponible en esta ficha | RGB + estado | no disponible | MIT (según el repositorio original) |
| ACT (Action Chunking Transformer) | Transformer de imitación | no disponible en esta ficha | RGB + estado | no disponible | MIT (según el repositorio original) |
| VQ-BeT | Política de imitación con VQ | no disponible en esta ficha | RGB + estado | no disponible | MIT (según el repositorio original) |

La comparación cuantitativa con estas alternativas no está disponible en la información proporcionada; las licencias de los modelos comparados se indican a título orientativo y deben verificarse en sus repositorios.

## Limitaciones y advertencias

- Modelo específico de simulación: espera el renderizado de MuJoCo Warp y la semántica de acciones del simulador; el autor indica explícitamente que no está pensado para operar un robot real.
- Sin generalización fuera de ObjectSearchV2: la tarea, la escena texturada y la cámara externa están fijadas; no es un modelo de propósito general.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Rendimiento limitado bajo oclusión: incluso con steering, el éxito cae al 15-21 %, y con cámara fija bajo oclusor es del 0 %.
- Dependencia de la calibración: el benchmark usa U sin calibrar; los resultados pueden variar si se aplica `calibration.json`.
- Entrenado con solo 50 demostraciones de teleoperación re-renderizadas: riesgo de sobreajuste a la distribución de vistas del régimen "wide".
- Sin propriocepción ni pose de cámara: la política depende exclusivamente de la imagen, lo que limita la corrección de errores de posicionamiento.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas cuando la batería no es visible; la incertidumbre U mitiga pero no elimina este fallo.
- Sin soporte multilingüe ni de texto: no aplica como modelo de lenguaje.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pgizemozdil/steercam-objectsearchv2-dp
- Código, tareas, datasets y benchmark: https://github.com/gizemozd/steer-your-camera
- Publicación *Steer Your Camera* (en revisión): no disponible URL directa en la información proporcionada
- LeRobot: https://github.com/huggingface/lerobot
- ManiFeel: no disponible URL directa en la información proporcionada
- MuJoCo Warp: no disponible URL directa en la información proporcionada
