# DAGroup-PKU/HumanWAM-Goal-RoboTwin

## Resumen

HumanWAM-Goal-RoboTwin es un modelo de mundo y acción (world-action model) condicionado por imagen objetivo, desarrollado por el grupo DAGroup-PKU. El modelo parte de un checkpoint de mid-training de HumanWAM-Goal (iteración 52.000) y se ha sometido a post-entrenamiento sobre el conjunto de datos RoboTwin 2.0, empleando 50 demostraciones limpias por tarea en 50 tareas, lo que suma 2.500 demostraciones de entrenamiento. Resuelve el problema de generar trayectorias de acción robótica de 48 pasos a partir de una instrucción en lenguaje natural, una imagen objetivo, el historial visual de cámara de cabeza y muñeca (0,5 s y 2 s) y el estado del robot.

La relevancia del modelo reside en su enfoque conjunto: denoisa simultáneamente vídeo futuro y un chunk de acciones, lo que le permite anticipar la evolución visual de la escena mientras planifica el control. Está pensado para el benchmark RoboTwin 2.0 con robots Aloha-AgileX en control articular, y reporta una tasa de éxito del 92,70 % en condiciones Clean y del 84,60 % en Randomized, con una media del 88,65 % sobre 10.000 episodios.

Se distribuye como una release de evaluación: los pesos de inferencia en bf16 safetensors están disponibles, pero el código de post-entrenamiento, el conversor de datos y la inicialización de mid-training se publicarán por separado. El repositorio ocupa 32,2 GB e incluye la caché de imágenes objetivo (`goal_cache.tar`, 2,47 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World-action model (denoising conjunto de vídeo futuro y acciones); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (historial visual de 0,5 s y 2 s; chunk de acción de 48 pasos) |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), con `vae/`, `text_tokenizer/`, `processor.json`, `sampling.json`, `robot.json`, `export.json` |
| Paso de post-entrenamiento | 20.000 (pesos EMA) |
| Inicialización | HumanWAM-Goal mid-training checkpoint, iteración 52.000 |
| Muestreo | UniPC, 10 pasos, flow shift 2,0 |
| Dimensión de acción | 49-D absoluta (poses en marco de cámara de cabeza) |
| Entorno de inferencia | Python 3.13, PyTorch 2.10 + CUDA 12.8, GPU Hopper |
| Tamaño del repositorio | 32,2 GB |

## Arquitectura y entrenamiento

HumanWAM-Goal es un modelo de mundo y acción que, de forma conjunta, aplica denoising a un vídeo futuro y a un chunk de 48 pasos de acción. Las entradas son la instrucción en lenguaje natural, una imagen objetivo, las imágenes actuales de cámara de cabeza y muñeca junto con su historial visual (0,5 s y 2 s) y el estado del robot. El proceso de muestreo emplea el solver UniPC con 10 pasos y un flow shift de 2,0. Los detalles sobre el número de parámetros, la composición exacta del transformer y el volumen total de tokens de entrenamiento no se especifican en la información disponible.

El post-entrenamiento se realizó sobre RoboTwin 2.0 con el robot Aloha-AgileX en control articular, usando las 50 demostraciones limpias oficiales por tarea en 50 tareas (2.500 demostraciones). El checkpoint seleccionado corresponde al paso 20.000 con pesos EMA. No se documenta en la model card si hubo RLHF, DPO u otras fases de alineación. Como innovación destacable, el modelo genera las imágenes objetivo mediante un modelo de imagen externo a partir únicamente de la imagen inicial de cámara de cabeza y la instrucción, y esas imágenes se revisaron visualmente (9.974 aprobadas en revisión y 26 aceptadas tras revisión fallida o incierta). La reproducibilidad de las acciones reportadas exige cuBLASLt 12.8.3.14 precargado sobre el cuBLAS de PyTorch 2.10, que selecciona kernels BF16 GEMM distintos.

## Capacidades

- Generación conjunta de vídeo futuro y trayectorias de acción robótica de 48 pasos.
- Control condicionado por imagen objetivo (goal-conditioned) e instrucción en lenguaje natural.
- Control articular de robots bimanuales Aloha-AgileX: 6 articulaciones de brazo y pinza por brazo.
- Procesamiento de historial visual multimodal: cámara de cabeza y cámara de muñeca con ventanas de 0,5 s y 2 s.
- Acciones absolutas en layout de 49 dimensiones con poses expresadas en el marco de la cámara de cabeza.
- Pinzas con convención de apertura de comando de RoboTwin (0 cerrado, 1 abierto).
- Evaluación integrada mediante el adaptador XPolicyLab `policy/HumanWAM_Goal`.
- Soporte de instrucciones vistas y no vistas (condiciones Clean y Randomized del benchmark).
- Idioma de las instrucciones: inglés.

## Casos de uso

- Evaluación de manipulación bimanual en RoboTwin 2.0: el modelo se sirve a través del adaptador XPolicyLab para reproducir el protocolo oficial de 50 tareas y 10.000 episodios, con lo que sirve como referencia de comparación para nuevos métodos.
- Investigación en world-action models: la liberación de pesos de inferencia y de la caché de objetivos permite estudiar la denoising conjunta de vídeo y acción sin reentrenar desde cero.
- Planificación condicionada por objetivo visual: dado un estado inicial y una imagen objetivo generada, el modelo produce el chunk de acciones necesario para alcanzar la configuración deseada, útil en tareas de pick-and-place con metas visuales.
- Control con historial visual corto: las ventanas de 0,5 s y 2 s permiten manejar tareas que requieren reaccionar a movimientos recientes del entorno, como inserción de piezas o ensamblaje.
- Generación de datos sintéticos de trayectorias: las predicciones de vídeo futuro pueden emplearse para inspeccionar la plausibilidad de las acciones antes de ejecutarlas en un robot real o simulado.
- Reproducción de resultados y auditoría: los ficheros `export.json` y `manifest.json` con cadenas SHA-256 permiten verificar la integridad de los pesos y de la caché de objetivos en pipelines de evaluación reproducibles.
- Base para post-entrenamiento en dominios propios: al ser un checkpoint de evaluación, puede servir de inicialización para adaptaciones posteriores una vez se publique el código de post-entrenamiento.

## Benchmarks y rendimiento

Resultados reportados por el autor bajo el protocolo oficial de RoboTwin 2.0 (50 tareas × 100 semillas expertas aceptadas desde 100000, Clean con instrucciones vistas y Randomized con instrucciones no vistas, 10.000 episodios, 32 pasos ejecutados por consulta, semilla `9000 + query`):

| Condición | Éxito (%) | Éxitos / total |
|---|---:|---:|
| Clean | 92,70 | 4.635 / 5.000 |
| Randomized | 84,60 | 4.230 / 5.000 |
| Media | 88,65 | 8.865 / 10.000 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros), dado que el modelo es específico de robótica.

## Requisitos de hardware

- GPU Hopper obligatoria según la model card (por ejemplo, H100); no se documenta compatibilidad con arquitecturas anteriores.
- Entorno de software: Python 3.13, PyTorch 2.10 y CUDA 12.8; para reproducir las acciones reportadas, cuBLASLt 12.8.3.14 precargado sobre el cuBLAS de PyTorch.
- VRAM estimada: no disponible. El repositorio de 32,2 GB incluye pesos bf16, VAE, tokenizador y la caché de objetivos de 2,47 GB; la VRAM necesaria para inferencia no se especifica.
- Compatibilidad con GPU de consumo: no disponible; la dependencia de Hopper sugiere que no está pensado para RTX 4090 u otras GPU consumer.
- Opciones de despliegue: paquete `humanwam_goal` con backend nativo (`GoalWAM(..., backend="native")`) y adaptador XPolicyLab `policy/HumanWAM_Goal`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se conoce el esquema de muestreo (UniPC, 10 pasos) y la ejecución de 32 pasos por consulta en la evaluación.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entradas | Resultado reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HumanWAM-Goal-RoboTwin | World-action model goal-conditioned | Instrucción, imagen objetivo, historial visual 0,5 s / 2 s, estado del robot | 92,70 % Clean / 84,60 % Randomized en RoboTwin 2.0 | no disponible | Pesos de inferencia en HF; código de post-entrenamiento pendiente |
| HumanWAM-Vanilla-RoboTwin | World-action model (variante vanilla) | no disponible | no disponible en la información proporcionada | no disponible | Disponible en HuggingFace (DAGroup-PKU) |
| Otros modelos de RoboTwin 2.0 | Políticas robóticas para el benchmark | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con políticas como Diffusion Policy, ACT u otros world-action models.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un modelo de lenguaje general y no debe evaluarse con benchmarks de texto.
- Idiomas: solo se declara inglés para las instrucciones; no hay soporte multilingüe documentado.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible verificar las condiciones antes de cualquier despliegue en producción.
- Release de evaluación: el código de post-entrenamiento, el conversor de datos y la inicialización de mid-training no están incluidos y se publicarán por separado, lo que limita la reproducibilidad completa del entrenamiento.
- Dependencia estricta de hardware Hopper y de versiones concretas de CUDA y cuBLASLt para reproducir las acciones reportadas; variaciones en las bibliotecas pueden alterar los resultados.
- Dependencia de la caché de objetivos: la sesión de evaluación solo sirve un caso si coinciden configuración de tarea, tarea, semilla, instrucción y observación en el paso cero con la caché, lo que restringe la evaluación a esos 10.000 casos.
- Las imágenes objetivo se generaron con un modelo de imagen externo y solo 9.974 de 10.000 pasaron la revisión visual; 26 fueron aceptadas con revisión fallida o incierta, lo que introduce una fuente potencial de ruido en la condición objetivo.
- Riesgo de alucinación visual y de trayectoria: al predecir vídeo futuro y acciones de forma conjunta, el modelo puede generar planes plausibles pero incorrectos físicamente; se recomienda validación en simulación antes de ejecución real.
- Sesgos: no se documentan análisis de sesgo; el entrenamiento se limita a 50 tareas y 2.500 demostraciones de RoboTwin 2.0, por lo que la generalización fuera de esa distribución no está garantizada.
- Sin métricas publicadas de latencia, throughput ni VRAM, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- [HuggingFace: DAGroup-PKU/HumanWAM-Goal-RoboTwin](https://huggingface.co/DAGroup-PKU/HumanWAM-Goal-RoboTwin)
- [Código y documentación del proyecto (GitHub, rama Open-HumanWAM)](https://github.com/DAGroup-PKU/HumanNet/tree/Open-HumanWAM/humanwam_goal)
- [Colección Open-HumanScale en HuggingFace](https://huggingface.co/collections/DAGroup-PKU/open-humanscale)
- [HumanWAM-Vanilla-RoboTwin en HuggingFace](https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-RoboTwin)
