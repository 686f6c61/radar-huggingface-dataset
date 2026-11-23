# docling-project/DeskForge-Gemma4-E4B

## Resumen

DeskForge-Gemma4-E4B es un modelo multimodal de tipo image-text-to-text desarrollado por docling-project, obtenido mediante fine-tuning del modelo instruction-tuned google/gemma-4-E4B-it sobre 200.000 ejemplos de grounding del dataset DeskForge-1M. Su propósito es actuar como modelo de acción dentro de agentes de computer-use: recibe una captura de pantalla de escritorio y una instrucción en lenguaje natural, y devuelve la siguiente acción como una llamada a `pyautogui` con coordenadas expresadas como fracciones de la pantalla (de 0.0 a 1.0) en lugar de píxeles absolutos.

El modelo resuelve el problema del GUI grounding, es decir, localizar el elemento de interfaz sobre el que hay que actuar en una pantalla de escritorio. El fine-tuning está específicamente orientado a condiciones de generalización difíciles (escenas no vistas, temas visuales, aplicaciones y resoluciones fuera del conjunto de entrenamiento), lo que lo diferencia de modelos base que rinden bien en condiciones vistas pero colapsan ante variaciones de apariencia o resolución.

Con 7.941.100.832 parámetros totales y un tamaño de repositorio de 15,9 GB en safetensors, es un modelo de escala media-alta que puede desplegarse en infraestructura de una sola GPU de gama alta. Se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, y está pensado para integrarse como componente de acción en pipelines agénticos donde un planner de mayor tamaño decide los pasos y este modelo localiza los objetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base: Gemma 4 E4B instruction-tuned) |
| Parametros totales | 7.941.100.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las capturas se codifican con hasta 1.120 image tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un modelo multimodal instruction-tuned de la familia Gemma 4, y se especializa mediante fine-tuning supervisado sobre 200.000 ejemplos de grounding extraídos del dataset DeskForge-1M. La tarea de entrenamiento es la predicción de la siguiente acción como código `pyautogui` con coordenadas normalizadas (fracciones de pantalla con cuatro decimales), lo que aporta invariancia frente a la resolución del display. Las capturas se redimensionan en tiempo de entrenamiento a un máximo de 2.097.152 píxeles (interpolación bilineal, lados redondeados hacia abajo) y se codifican con hasta 1.120 image tokens.

El diseño del dataset incide explícitamente en la generalización: las evaluaciones separan condiciones de "New Scenes" (escenas no vistas con atributos vistos), "Theme" (preset de apariencia fuera de entrenamiento), "App" (tres aplicaciones no vistas) y "Resolution" (resolución de pantalla no vista). No se especifica en la información disponible si se emplearon técnicas de RLHF o DPO adicionales sobre el fine-tuning supervisado. El modelo se entrena con `enable_thinking=False`, es decir, sin modo de razonamiento explícito, y responde únicamente con la llamada de acción.

## Capacidades

- Comprensión de capturas de pantalla de escritorio y localización de elementos de interfaz (GUI grounding) con coordenadas normalizadas.
- Emisión de acciones de ratón y teclado en formato `pyautogui`: click, doubleClick, rightClick, middleClick, tripleClick, moveTo, dragTo, scroll, hscroll, write, press, hotkey, wait y terminate.
- Ejecución de tareas de múltiples pasos como modelo de acción dentro de un bucle agéntico, recibiendo el historial de acciones ya tomadas.
- Manejo de instrucciones en lenguaje natural en inglés para tareas de escritorio.
- Robustez ante cambios de tema visual, aplicación y resolución no vistos durante el entrenamiento.
- Terminación controlada de la tarea mediante `computer.terminate(status='success')`.
- Soporte de despliegue en transformers (5.16) y vLLM (0.28).
- No dispone de modo thinking ni de capacidades de audio según la información disponible.

## Casos de uso

- Automatización de tareas de escritorio repetitivas: el modelo recibe la captura actual y la instrucción, y devuelve la siguiente acción; integrado en un bucle con un planner, permite rellenar formularios, abrir menús o navegar por aplicaciones de escritorio sin scripts frágiles basados en selectores.
- Agentes de computer-use en producción: al usar coordenadas fraccionarias, las acciones son independientes de la resolución del display, lo que simplifica el despliegue en flotas heterogéneas de equipos con distintas pantallas.
- Testing automatizado de aplicaciones de escritorio: el modelo puede localizar controles por descripción en lenguaje natural y generar secuencias de interacción para pruebas end-to-end, con mejor generalización a temas y resoluciones nuevas (81,62 % en la condición Resolution frente al 6,56 % del modelo base).
- Asistentes de accesibilidad: traducción de instrucciones verbales o escritas en acciones concretas sobre la interfaz, útil para usuarios con dificultades motoras que necesiten automatizar clics y escritura.
- Componente de acción en arquitecturas planner-executor: los resultados de long-horizon muestran que, manteniendo fijo un planner Qwen3.6-27B, este modelo resuelve 40 de 119 tareas en WebArena-Infinity y 12 de 100 en OpenApps, frente a 5 y 2 del modelo base.
- Extracción de información de pantallas: combinado con instrucciones de navegación, permite recorrer aplicaciones para recopilar datos visibles en la interfaz de forma guiada.
- Automatización de flujos RPA modernos: sustituye la localización por coordenadas fijas por grounding semántico, reduciendo la rotura de flujos cuando cambia la apariencia de la aplicación.

## Benchmarks y rendimiento

Grounding en condiciones held-out de DeskForge-1M (accuracy, %):

| Modelo | New Scenes | Theme | App | Resolution | Mean |
|---|---:|---:|---:|---:|---:|
| UI-TARS-1.5-7B | 67,68 | 64,96 | 66,68 | 61,67 | 65,25 |
| GroundNext-7B | 73,57 | 67,67 | 72,10 | 68,87 | 70,55 |
| Gemma4-31B | 75,26 | 71,00 | 73,57 | 63,13 | 70,74 |
| UI-Venus-2-9B | 81,45 | 77,44 | 79,40 | 77,40 | 78,92 |
| Gemma4-E4B | 16,27 | 12,10 | 14,15 | 6,56 | 12,27 |
| **DeskForge-Gemma4-E4B** | **89,01** | **85,36** | **84,50** | **81,62** | **85,12** |

Grounding en benchmarks externos de GUI (accuracy, %), ninguno usado en entrenamiento:

| Modelo | ScreenSpot-Pro | ScreenSpot-v2 | OSWorld-G | UI-Vision | MMBench-GUI |
|---|---:|---:|---:|---:|---:|
| Gemma4-E4B | 1,83 | 46,86 | 10,64 | 3,28 | 31,39 |
| **DeskForge-Gemma4-E4B** | **21,95** | **79,56** | **44,15** | **13,87** | **58,90** |

Finalización de tareas de horizonte largo (tareas resueltas), con planner fijo Qwen3.6-27B:

| Modelo de acción | WebArena-Infinity (119 tareas) | OpenApps (100 tareas) |
|---|---:|---:|
| Gemma4-E4B | 5 | 2 |
| **DeskForge-Gemma4-E4B** | **40** | **12** |

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,94 mil millones de parámetros en bfloat16, se requieren aproximadamente 16 GB solo para pesos, más overhead de activaciones y del encoder visual; en cuantización de 8 bits bajaría a unos 8-9 GB y en 4 bits a unos 5-6 GB, aunque no se publican cuantizaciones oficiales en la información disponible.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en bfloat16 con margen; una RTX 4090 (24 GB) es suficiente para bfloat16 en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 y en GPUs de 16 GB con cuantización, aunque esta última opción no está validada en la información proporcionada.
- Opciones de despliegue: transformers 5.16 con `accelerate`, y vLLM 0.28 (usando `max_soft_tokens` en `mm_processor_kwargs` para el límite de 1.120 image tokens); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Mean DeskForge-1M | ScreenSpot-v2 | Licencia |
|---|---|---:|---:|---:|---|
| **DeskForge-Gemma4-E4B** | 7,94 B | no disponible | 85,12 | 79,56 | Apache 2.0 |
| UI-Venus-2-9B | 9 B | no disponible | 78,92 | no disponible | no disponible |
| GroundNext-7B | 7 B | no disponible | 70,55 | no disponible | no disponible |
| UI-TARS-1.5-7B | 7 B | no disponible | 65,25 | no disponible | no disponible |

También existe DeskForge-Qwen3.5-4B del mismo autor, con fine-tuning equivalente sobre una base Qwen de 4 B, orientado a despliegues con menos recursos; sus métricas no se detallan en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés; las instrucciones en otros idiomas no están cubiertas por el entrenamiento.
- Diseñado exclusivamente como modelo de acción: no planifica ni razona sobre la tarea, por lo que necesita un planner externo para tareas de múltiples pasos.
- El rendimiento en tareas de horizonte largo es limitado en términos absolutos (40/119 en WebArena-Infinity y 12/100 en OpenApps), aunque muy superior al modelo base.
- El rendimiento en ScreenSpot-Pro es bajo en términos absolutos (21,95 %), lo que sugiere dificultades en interfaces profesionales densas y de alta resolución.
- Riesgo de alucinación de elementos de interfaz o de coordenadas incorrectas; en producción conviene validar cada acción antes de ejecutarla y establecer mecanismos de recuperación.
- La salida está restringida a un conjunto cerrado de acciones `pyautogui`; no cubre gestos táctiles ni interacciones fuera de ese vocabulario.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a contenido sensible en pantalla.
- Licencia Apache 2.0: permite uso comercial, pero debe revisarse la licencia del modelo base Gemma 4 y sus términos de uso asociados.
- Requiere respetar el preprocesado de entrenamiento (redimensionado a máximo 2.097.152 píxeles y 1.120 image tokens) para reproducir el rendimiento reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/docling-project/DeskForge-Gemma4-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset DeskForge-1M: https://huggingface.co/datasets/docling-project/DeskForge-1M
- Demo en vivo: https://huggingface.co/spaces/docling-project/DeskForge
- Página del proyecto: https://saidgurbuz.github.io/deskforge/
- Código: https://github.com/Saidgurbuz/deskforge
- Paper: https://arxiv.org/abs/2610.02320
- Variante Qwen: https://huggingface.co/docling-project/DeskForge-Qwen3.5-4B
