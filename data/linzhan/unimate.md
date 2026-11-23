# Linzhan/UniMate

## Resumen

UniMate es un modelo de generación de movimiento condicionado por texto, desarrollado por Linzhan (Friedrich-M) y presentado en SIGGRAPH Asia 2026. Su particularidad es que genera animaciones esqueléticas para topologías arbitrarias: no se limita a un rig humanoide concreto, sino que produce movimiento para animales, humanoides y objetos con esqueleto (rigged objects) de entre 5 y 70 articulaciones, incluyendo esqueletos de Mixamo y Truebones. El modelo resuelve el problema de la generalización entre esqueletos, que en la práctica obliga a reentrenar o adaptar modelos específicos por rig.

Técnicamente es un denoiser transformer de tamaño reducido (74,1 M de parámetros en la variante principal, solo el denoiser) que emplea flow matching con trayectoria lineal y predicción de velocidad, con un encoder de texto congelado (`google/flan-t5-base`). La salida son 60 fotogramas a 30 fps con posición, rotación relativa a la T-pose y velocidad por articulación, lo que permite aplicar directamente el movimiento sobre la malla del activo.

Es relevante ahora porque cubre un hueco práctico en pipelines de animación 3D: un único modelo que se adapta a esqueletos no vistos mediante atención sobre grafo y acondicionamiento AdaLN, con checkpoints especializados para Mixamo y Truebones. La licencia CC BY-NC 4.0 restringe el uso comercial, un factor determinante para evaluar su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denoiser con graph attention y acondicionamiento AdaLN (variante principal); variante con full attention y cross-attention de texto |
| Parametros totales | 74,1 M (denoiser, `unimate_uniml3d_f60_v3`); 66,2 M en la variante cross-attn; 47,8 M en los modelos Mixamo y Truebones. El encoder de texto `google/flan-t5-base` es congelado y se descarga aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de 60 fotogramas a 30 fps, es decir, 2 segundos de movimiento por generación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (descripciones de movimiento en inglés) |
| Licencia | CC BY-NC 4.0 |
| Formato de pesos | checkpoints PyTorch (`.pt`), acompañados de `config.json` y ficheros `.json`/`.npy` por modelo |

## Arquitectura y entrenamiento

El modelo es un transformer denoiser de anchura 512, 8 cabezas y 10 capas (6 capas en los modelos Mixamo y Truebones) que opera bajo un esquema de flow matching con trayectoria lineal y predicción de velocidad. La variante recomendada usa atención sobre grafo con acondicionamiento de texto mediante AdaLN; existe una variante alternativa con atención completa y cross-attention al texto. El texto se codifica con `google/flan-t5-base` congelado y se aplica classifier-free guidance con un 10 % de dropout de caption y escala por defecto de 3,0. La entrada incluye la descripción en inglés del movimiento, la T-pose del esqueleto, su jerarquía y etiquetas de articulaciones limpias.

El entrenamiento usa AdamW (lr 1e-4, betas 0,9/0,99, weight decay 1e-5, clipping 1,0), 3 % de warmup lineal y decaimiento coseno hasta el 5 %, con EMA de 0,9999 empleada en inferencia. La pérdida combina L2 enmascarada de flow matching, 0,5 × distancia geodésica de rotación y 0,1 × suavidad de velocidad. Se entrenó con ventanas de 60 fotogramas a 30 fps, batch 16 por GPU, con aumentaciones de adición/eliminación de articulaciones, pooling y perturbación (el modelo Mixamo usa batch 32 sin aumentación). El modelo principal v3 requirió 8× H100 durante aproximadamente 35 horas para 150k pasos; la variante cross-attn, 8× H100 y unas 54 horas. Los datos provienen del dataset UniML3D (publicado por el mismo autor), con versiones concretas por checkpoint (`d0f19d9` para v3, `faaa817` para v2).

## Capacidades

- Generación de movimiento esquelético condicionada por texto en inglés, con salida de 60 fotogramas a 30 fps.
- Generalización a topologías arbitrarias de esqueleto: de 5 a 70 articulaciones en los modelos UniML3D, 22 articulaciones en el rig de Mixamo y hasta 85 en Truebones.
- Animación de animales, humanoides y objetos con esqueleto (rigged objects), incluyendo activos de Objaverse.
- Salida por articulación de posición (3), rotación relativa a la T-pose (6) y velocidad (3), aplicable directamente sobre la malla.
- Control mediante prompts de movimiento múltiples en una misma llamada y repeticiones con `--num_repetitions`.
- Capacidades adicionales documentadas en el repositorio de código: in-betweening, edición de articulaciones y expansión de movimiento.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM; no es un modelo de lenguaje.
- Capacidades multilingües: no disponibles; el texto de entrada es en inglés.

## Casos de uso

- Previsualización rápida de animaciones en producción 3D: dado un esqueleto y una descripción ("An object trots forward."), el modelo genera dos segundos de movimiento en una sola pasada, lo que permite iterar sobre variantes de animación antes de encargar trabajo manual.
- Animación de activos de catálogo con esqueletos heterogéneos: al aceptar topologías de 5 a 70 articulaciones, se puede aplicar un mismo pipeline a animales, humanoides y objetos de Objaverse sin reentrenar por rig.
- Prototipado en videojuegos: generación de ciclos de locomoción y acciones puntuales para personajes no humanoides, con la posibilidad de repetir la generación (`--num_repetitions 3`) para obtener variación.
- Pipelines de Mixamo: el checkpoint `unimate_mixamo_f60_v2` está especializado en el rig de 22 articulaciones de Mixamo, lo que encaja en flujos de trabajo con assets estándar de esa biblioteca.
- Bibliotecas de especies para Truebones: el checkpoint `unimate_truebones_f60_v2` cubre 73 de las 74 especies (todas salvo Dragon), incluidas Bear, Centipede y Monkey, útil para contenido con fauna variada.
- Edición y completado de animación existente: las utilidades de in-betweening y expansión de movimiento del repositorio permiten rellenar huecos entre keyframes o extender una secuencia dada.
- Investigación en generación de movimiento: al ser un modelo pequeño (74,1 M de parámetros en el denoiser) con receta de entrenamiento y configuraciones publicadas, sirve como base reproducible para experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 74,1 M de parámetros en el denoiser, el peso en FP32 ronda los 0,3 GB, pero el repositorio completo ocupa 67,9 GB por incluir múltiples checkpoints y artefactos; hay que descargar solo el checkpoint y los ficheros del modelo elegido.
- GPU recomendadas: el entrenamiento se realizó en H100 (8× H100 para el modelo principal, 4× H100 para Mixamo y Truebones). Para inferencia no se especifica un mínimo; por tamaño del denoiser, una GPU consumer moderna debería ser suficiente, aunque no hay cifras publicadas.
- Cabe en GPU consumer: previsiblemente sí por tamaño del modelo, pero no hay datos oficiales de VRAM ni de latencia que lo confirmen.
- Opciones de despliegue: inferencia vía el repositorio de código oficial (`python -m unimate.inference.sample`, con entorno `unimate` y `accelerate`), más scripts de postproceso (`scripts/run_animate_motion.sh`) para generar GLB/FBX por movimiento. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Requiere descargar `google/flan-t5-base` en el primer uso, además del checkpoint propio.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados ni especificaciones de modelos comparables de generación de movimiento texto-a-movimiento.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohíbe el uso comercial. Cualquier despliegue en producción con fines lucrativos requiere negociación de licencia con el autor.
- El texto de entrada debe estar en inglés; no se documenta soporte multilingüe.
- Ventana fija de 60 fotogramas (2 segundos a 30 fps) por generación; secuencias más largas requieren composición o las utilidades de expansión del repositorio.
- Límite de articulaciones dependiente del checkpoint: 70 en los modelos UniML3D, 22 en Mixamo y 85 en Truebones. El modelo Mixamo solo anima ese rig concreto.
- El modelo Truebones no cubre la especie Dragon (73 de 74).
- Requiere preprocesado del rig: etiquetado de articulaciones, T-pose y jerarquía, con una parada manual para revisar las etiquetas antes de generar.
- Riesgo de movimientos físicamente implausibles o artefactos en esqueletos muy alejados de la distribución de entrenamiento; no hay métricas publicadas de fidelidad ni de error que permitan cuantificarlo.
- Sesgos: no documentados en la información disponible; al entrenarse sobre UniML3D, hereda las limitaciones de cobertura de ese dataset.
- El repositorio pesa 67,9 GB; conviene descargar selectivamente con `--include` para no arrastrar todos los checkpoints.
- No es un modelo de lenguaje: no admite tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Linzhan/UniMate
- Página del proyecto: https://linzhanmou.com/unimate/
- Paper (arXiv): https://arxiv.org/abs/2609.05415
- Vídeo: https://youtu.be/xbndC-dEuVw
- Código: https://github.com/Friedrich-M/UniMate
- Dataset UniML3D: https://huggingface.co/datasets/Linzhan/UniML3D
- Demo interactiva: https://linzhanmou.com/unimate/interactive.html
