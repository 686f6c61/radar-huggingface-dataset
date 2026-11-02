# miyoshi-nii/aofi-umi-arena

## Resumen

AoFi (Action-only Flow Initialization) es una política visión-lenguaje-acción (VLA) de 217,4 millones de parámetros presentada por el usuario miyoshi-nii como envío al Track 1 de la competición UMI Arena de CoRL 2026. El modelo resuelve el problema de generar trayectorias de manipulación bimanual a partir de dos cámaras de muñeca, el estado propioceptivo de las manos y una instrucción en lenguaje natural. Su relevancia radica en la estrategia de entrenamiento en dos etapas: un experto de acción basado en flow matching se preentrena primero sin visión sobre trayectorias de la mano YUBI y después se acopla a un codificador visual CLIP ViT-B/16 ajustado.

La arquitectura combina un transformer de 12 capas y 768 dimensiones como experto de acción, un codificador visual CLIP ViT-B/16 ajustado y un codificador de texto CLIP congelado. El modelo produce bloques de 32 pasos de movimiento a 30 Hz, con latencia mediana de 0,27 s y un pico de memoria de aproximadamente 1,3 GB en GPU, lo que lo sitúa en un régimen de despliegue muy ligero para robótica.

La licencia es restrictiva: los pesos están limitados exclusivamente a la competición UMI Arena y el dataset de entrenamiento tiene acceso limitado. No se han publicado resultados de benchmarks ni especificaciones sobre cobertura idiomática.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (experto de acción de 12 capas y 768 de ancho) con flow matching, más CLIP ViT-B/16 visual ajustado y CLIP ViT-B/16 textual congelado |
| Parámetros totales | 217.364.750 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la instrucción se codifica con CLIP, sin ventana de contexto de texto larga) |
| Tipos de cuantización | No disponible (pesos publicados en float32) |
| Idiomas soportados | No disponible |
| Licencia | other (uso restringido a la competición UMI Arena) |
| Formato de pesos | safetensors (float32) y directorio `clip_text/` con el codificador textual CLIP congelado |

## Arquitectura y entrenamiento

El modelo se compone de tres bloques. El experto de acción es un transformer de 12 capas y 768 dimensiones que genera acciones mediante flow matching: parte de ruido gaussiano y aplica 10 pasos de Euler para muestrear un bloque de 32 acciones a 30 Hz, una muestra por llamada sin ensamblado entre muestras. La percepción visual corre a cargo de un CLIP ViT-B/16 ajustado que procesa las dos cámaras de muñeca, redimensionadas de 480x640 a 224x224 con interpolación `INTER_AREA` sin preservar la relación de aspecto. La instrucción se codifica con un CLIP ViT-B/16 textual congelado, con caché de características por prompt.

El entrenamiento es en dos etapas. La etapa 1 preentrena el experto de acción sin visión sobre trayectorias de la mano YUBI, una inicialización "solo de acción" que da nombre al método. La etapa 2 entrena conjuntamente con las dos cámaras de muñeca y las instrucciones, usando las seis versiones publicadas del dataset UMI Arena YUBI. El checkpoint publicado corresponde al paso 200000 de la etapa 2 y sus pesos son la media de los checkpoints de los pasos 190000, 195000 y 200000. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de acciones robóticas bimanuales: devuelve un array `(32, 16)` float32 por llamada, con 32 filas de movimiento a 30 Hz.
- Control de pose por mano: las columnas 0-6 codifican deltas de pose de la mano izquierda y las 7-13 de la derecha, en el marco corporal de cada mano con cuaterniones xyzw.
- Control de dedos: las columnas 14-15 contienen las posiciones absolutas de las articulaciones de los dedos.
- Condicionamiento por lenguaje natural: acepta un `prompt` de instrucción que se codifica con CLIP y se cachea por prompt.
- Percepción visual estéreo: consume las vistas `observation.image.left` y `observation.image.right`, sin cámara central.
- Integración propioceptiva: usa la pose inter-manos (posición y rotación 6D) y dos articulaciones de dedo normalizadas con las estadísticas de `aofi.json`.
- Inferencia determinista en formato de competición: adaptador `policy.py` con contrato `Policy(checkpoint_dir)` e `infer(obs)`, sin necesidad de imagen personalizada, paquetes extra, red ni token de Hugging Face.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni modo de pensamiento.

## Casos de uso

- Manipulación bimanual en competición robótica: el modelo está diseñado específicamente para el Track 1 de UMI Arena, con el adaptador `policy.py` listo para que el arnés de evaluación lo ejecute sin configuración adicional.
- Recogida y colocación de objetos con instrucciones en lenguaje natural: por ejemplo, "Put the cup on the plate", usando las dos cámaras de muñeca y el estado propioceptivo para generar 32 pasos de trayectoria a 30 Hz.
- Investigación en inicialización de expertos de acción: la etapa 1 sin visión sobre trayectorias YUBI permite estudiar cuánto aporta el preentrenamiento motor frente al visual en políticas VLA.
- Evaluación reproducible con Docker: el repositorio `umi-arena-evaluation` y la imagen `ghcr.io/airoa-org/umi-arena-torch:1.0.0` permiten verificar el envío con `check.py` y hacer replay offline sobre la suite de práctica.
- Despliegue en hardware modesto: con un pico de 1,3 GB de VRAM y latencia mediana de 0,27 s en una V100 compartida, encaja en estaciones de trabajo con GPUs de gama media para pruebas de política en bucle cerrado.
- Prototipado de control de manos robóticas: la salida separada en deltas de pose por mano y articulaciones absolutas de dedos facilita adaptar el modelo a otros efectores bimanuales con un mapeo de acciones.
- Integración en pipelines de robótica con LeRobot: las dependencias (torch, numpy, transformers, safetensors, opencv-python-headless) ya vienen en la imagen de LeRobot 0.6.1, lo que simplifica el empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas de inferencia: latencia mediana de 0,27 s y p95 de 0,36 s por llamada en una NVIDIA V100 compartida con otros trabajos, con un pico de memoria de aproximadamente 1,3 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB de pico, según la model card.
- GPU recomendadas: NVIDIA V100 es la referencia medida; cualquier GPU con al menos 2 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, por el reducido consumo de memoria; no se especifican modelos concretos probados.
- Opciones de despliegue: runtime `torch` con la imagen `ghcr.io/airoa-org/umi-arena-torch:1.0.0`; también ejecución directa en Python 3.12 con torch, numpy, transformers, safetensors y opencv-python-headless. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: mediana de 0,27 s y p95 de 0,36 s por llamada en V100 compartida; una llamada produce 32 acciones a 30 Hz.
- Fallback: el constructor carga los pesos en CPU si no hay GPU disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos VLA comparables (parámetros, contexto, rendimiento o licencia) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos están destinados exclusivamente a la competición UMI Arena; no se autoriza su uso comercial ni general fuera de ese contexto según la model card.
- Dataset de acceso limitado: el entrenamiento usa el dataset UMI Arena YUBI, con acceso restringido, y no se incluye contenido del dataset en el repositorio.
- Dominio acotado: el modelo está entrenado para manipulación bimanual con dos cámaras de muñeca y una instrucción corta; no se documenta generalización a otras morfologías, cámaras o tareas.
- Sin datos de sesgo ni alucinación: no se han publicado evaluaciones de sesgo, robustez o tasas de fallo en producción.
- Idiomas no especificados: la cobertura idiomática del codificador textual no está documentada.
- Contexto limitado: el condicionamiento textual pasa por CLIP, sin ventana de contexto larga; las instrucciones largas o conversacionales no están soportadas explícitamente.
- Dependencia de calibración: la normalización del estado propioceptivo usa estadísticas fijas de `aofi.json`, por lo que cambios en la morfología o en las unidades de las articulaciones requieren recalibración.
- Checkpoint promediado: los pesos son la media de tres checkpoints, lo que puede suavizar comportamientos específicos de un paso concreto.
- Inferencia estocástica: el muestreo por flow matching con 10 pasos de Euler y una sola muestra por llamada introduce variabilidad entre llamadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miyoshi-nii/aofi-umi-arena
- Repositorio de evaluación UMI Arena: https://github.com/airoa-org/umi-arena-evaluation
- Imagen de runtime: ghcr.io/airoa-org/umi-arena-torch:1.0.0
- Codificador textual de referencia: https://huggingface.co/openai/clip-vit-base-patch16
