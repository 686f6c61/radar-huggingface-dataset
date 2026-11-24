# Safman/Alpamayo2-Edge-MLX-bf16

## Resumen

Alpamayo2-Edge-MLX-bf16 es la conversión a formato MLX (Apple Silicon) en precisión completa bfloat16 del modelo NVIDIA Alpamayo2-Edge, un modelo Vision-Language-Action (VLA) de 2B parámetros orientado a conducción autónoma. Lo publica el usuario Safman como port independiente, no oficial, apoyándose en la librería mlx-vla, que a su vez se construye sobre mlx-vlm. El modelo original lo desarrolla NVIDIA y combina un backbone de lenguaje Cosmos 3 Edge de 28 capas con un codificador visual SigLIP2 de 27 capas y un "Diffusion Action Expert" de 28 capas y anchura 512 que genera trayectorias de conducción.

El modelo resuelve dos tareas acopladas: razonamiento en lenguaje natural sobre escenas de conducción (chain-of-causation) y predicción de trayectorias de 64 waypoints mediante flow matching con 10 pasos de Euler. Su relevancia radica en que permite ejecutar un VLA de conducción autónoma íntegramente en hardware Apple Silicon sin dependencias de PyTorch en inferencia, con un consumo de memoria unificado de 5,30 GB activos y 6,11 GB de pico.

Esta ficha describe el checkpoint MLX bf16, que es la referencia de precisión completa del port; el autor publica además variantes cuantizadas q8, q6 y q4 con tamaños de 3,28 GB, 2,74 GB y 2,20 GB respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: LLM Cosmos 3 Edge (28 capas) + vision SigLIP2 (27 capas) + Patch Merger + Diffusion Action Expert (28 capas, anchura 512) |
| Parametros totales | 2.651.163.378 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en este checkpoint; el autor publica variantes q8, q6 y q4 (LLM y Action Expert cuantizados, vision en bf16) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (OpenMDW-1.1); el código de mlx-vla es MIT |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

El modelo es un VLA multimodal compuesto por tres bloques: un LLM Cosmos 3 Edge de 28 capas que actúa como razonador, un codificador visual SigLIP2 de 27 capas con un Patch Merger que proyecta las características visuales al espacio del LLM, y un Diffusion Action Expert de 28 capas y anchura 512 que genera trayectorias mediante flow matching con 10 pasos de Euler. La inferencia encadena el razonamiento del VLM con la generación de acciones mediante un traspaso de caché KV de memoria unificada sin copia (zero-copy) desde el razonador al experto de acción.

El checkpoint MLX mantiene todos los módulos en bfloat16 sin cuantización. El autor no documenta en la model card el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información correspondería a la model card del modelo base nvidia/Alpamayo2-Edge, no incluida en la información disponible. La innovación técnica destacable del port es la implementación 100 % MLX sin PyTorch ni Torchvision en tiempo de inferencia, y la posibilidad de acelerar la variante q4 con CoreML ANE hasta 1,87–2,5 Hz.

## Capacidades

- Razonamiento de conducción en lenguaje natural (chain-of-causation) sobre secuencias de imágenes de cámara.
- Predicción de trayectorias ego de 64 waypoints con rotaciones asociadas, mediante muestreo de conjuntos y muestras de trayectoria configurables.
- Modo de razonamiento adaptativo ("adaptive") o nominal sin pensamiento ("nominal") para streaming rápido.
- Entrada multimodal con múltiples frames de cámara, índices de cámara, timestamps absolutos e historial ego (posición y rotación).
- Instrucciones de navegación en texto (por ejemplo, "Turn right in 30m") integradas en la preparación de entradas.
- VQA libre sobre escenas de conducción (peligros visibles, descripción de escena) mediante generación de texto estándar.
- Integración de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Predicción de trayectorias en bucle cerrado sobre vehículo real o simulador: el modelo recibe frames de cámara, historial ego y una instrucción de navegación, y devuelve 64 waypoints con rotaciones listos para el control de bajo nivel; el modo "nominal" permite streaming sin cadena de pensamiento para reducir latencia.
- Análisis de causalidad de escenas para validación y auditoría: la cadena de razonamiento generada en modo "adaptive" sirve como traza explicativa de por qué el modelo propone una maniobra, útil en revisiones de seguridad y en análisis post-incidente.
- Asistente de percepción y alertas en cabina: mediante VQA libre sobre el frame frontal, el modelo puede responder a preguntas como "¿qué peligros hay delante?" y alimentar sistemas de aviso con texto interpretable.
- Prototipado rápido en Mac para equipos de investigación: al ejecutarse íntegramente en MLX sobre memoria unificada (5,30 GB activos), permite iterar sobre pipelines de conducción en un portátil Apple Silicon sin GPU dedicada ni stack CUDA.
- Evaluación comparativa de variantes de precisión: el autor publica q8, q6 y q4 con tamaños de 3,28, 2,74 y 2,20 GB, lo que facilita estudios de degradación de precisión frente a bf16 en la misma máquina.
- Generación de datos sintéticos de conducción: las trayectorias y razonamientos muestreados con semilla configurable pueden emplearse para aumentar datasets de entrenamiento o para pruebas de regresión de planificadores.
- Despliegue en vehículo de bajo consumo con CoreML ANE: la variante q4 alcanza hasta 1,87–2,5 Hz según el autor, lo que la hace candidata para inferencia embebida en plataformas Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada: 5,30 GB activos y 6,11 GB de pico para el checkpoint bf16 en Apple Silicon.
- Variantes ligeras: q8 3,28 GB, q6 2,74 GB y q4 2,20 GB de RAM activa.
- GPU recomendadas: hardware Apple Silicon con Metal; no se especifican modelos concretos de chip en la información disponible.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable directamente, ya que el checkpoint es MLX y está pensado para Apple Silicon; para CUDA habría que usar el modelo base nvidia/Alpamayo2-Edge.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos ~6,2 GB de memoria unificada disponible; no se detallan modelos de Mac compatibles.
- Opciones de despliegue: mlx-vlm / mlx-vla (pip install desde el repositorio de GitHub); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: hasta 1,87–2,5 Hz con la variante q4 acelerada por CoreML ANE según el autor; no se aportan cifras para bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safman/Alpamayo2-Edge-MLX-bf16 | 2,65 B | no disponible | bf16, 5,30 GB | NVIDIA Open Model License | Hugging Face (MLX) |
| Safman/Alpamayo2-Edge-MLX-q4 | 2,65 B | no disponible | q4, 2,20 GB | NVIDIA Open Model License | Hugging Face (MLX) |
| Safman/Alpamayo-1.5-Mac-MLX-4bit | 10 B | no disponible | 4-bit, 10,36 GB | no disponible | Hugging Face (MLX) |
| nvidia/Alpamayo2-Edge (base) | 2,65 B (presunto) | no disponible | bf16 (formato original) | NVIDIA Open Model License | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos VLA de conducción comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un port no oficial realizado por un tercero (Safman); no está avalado por NVIDIA y puede divergir del comportamiento del modelo base.
- Solo funciona en el ecosistema MLX (Apple Silicon); no es desplegable en CUDA, ROCm ni CPU convencional sin conversión adicional.
- La licencia NVIDIA Open Model License (OpenMDW-1.1) impone condiciones específicas para uso comercial; deben revisarse antes de cualquier despliegue productivo.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; en un modelo de conducción, los errores de razonamiento o de trayectoria tienen consecuencias de seguridad críticas.
- El modo "nominal" elimina la cadena de pensamiento y puede degradar la calidad de la decisión a cambio de latencia; debe validarse por caso de uso.
- La longitud de contexto no está especificada, lo que impide planificar escenarios con historiales largos o muchas cámaras.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se aportan métricas de benchmarks ni comparaciones cuantitativas con el modelo base; la fidelidad del port bf16 frente al original no está verificada de forma independiente.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-bf16
- Modelo base: https://huggingface.co/nvidia/Alpamayo2-Edge
- Variante q8: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q8
- Variante q6: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q6
- Variante q4: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q4
- Alpamayo 1.5 Mac MLX 4-bit: https://huggingface.co/Safman/Alpamayo-1.5-Mac-MLX-4bit
- Alpamayo 1.5 Mac DFlash: https://huggingface.co/Safman/Alpamayo-1.5-Mac-DFlash
- Repositorio mlx-vla: https://github.com/SMJD11/mlx-vla
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
