# KangLiao/Puffin-World

## Resumen

Puffin-World es un modelo multimodal unificado desarrollado por el S-Lab de la Nanyang Technological University (Kang Liao, Yihang Luo, et al.) que representa el entorno físico mediante tres estados de mundo 3D nativos: física (comprensión de cámara con gravedad y propagación de trayectorias), geometría (estructura espacial densa para síntesis de vistas y reconstrucción 3D) y apariencia (contenido visual de alta fidelidad). Se presenta como un modelo de mundo capaz de percibir, generar y simular escenas desde puntos de vista arbitrarios, integrando un encoder de visión, un LLM y un modelo de difusión sin módulos externos específicos de tarea.

La arquitectura combina un LLM (Qwen2.5 en versiones de 7B y 1.5B) con un encoder de visión C-RADIO y un modelo de difusión SD3.5 para generar vistas múltiples en RGB y profundidad a partir de una vista inicial y una trayectoria de cámara. Se entrena sobre Puffin-16M, un conjunto de 15M de tripletas visión-lenguaje-cámara y 1M de trayectorias de cámara, curado de 28 datasets públicos. El modelo es relevante por su enfoque en la inteligencia espacial y el modelado del mundo 3D, una dirección emergente en la IA multimodal. Se publica como preprint en 2026 y su licencia es "other", sin especificar restricciones concretas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unificado: vision encoder (C-RADIOv3/v4) + LLM (Qwen2.5-7B o 1.5B) + difusión (SD3.5-medium o large) |
| Parametros totales | no disponible (compuesto por LLM 7B/1.5B y difusor SD3.5) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en formato .pth) |
| Idiomas soportados | no disponible (no se indican en la documentación) |
| Licencia | other (sin especificar condiciones) |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

Puffin-World es un modelo unificado que combina un vision encoder (C-RADIOv3 o v4) con un LLM (Qwen2.5) para tareas de comprensión y un modelo de difusión (SD3.5) para generación. La parte de comprensión es autoregresiva, mientras que la generación multi-vista RGB-D usa atención asimétrica en la etapa final. El entrenamiento se realiza en dos fases: primero la comprensión con datos de visión-lenguaje-cámara, luego la generación con trayectorias de cámara. El modelo integra representaciones de física (gravedad, roll, pitch, vFoV, distorsión), geometría (densidad espacial) y apariencia (textura) en un único marco. No se especifica el uso de RLHF o DPO; el entrenamiento se basa en datos supervisados de Puffin-16M. La innovación principal es el modelado de mundo multivista centrado en cámara, donde se generan vistas adicionales en RGB y profundidad a partir de una vista inicial y una trayectoria, permitiendo reconstrucción de nubes de puntos 3D.

## Capacidades

- Generación multivista de mundo: a partir de una imagen inicial y una trayectoria de cámara, genera las vistas restantes en RGB y profundidad, y reconstruye una nube de puntos 3D (formato GLB).
- Percepción física de la cámara: estima la gravedad, roll, pitch, vFoV y distorsión de una sola imagen, con visualización de campos de perspectiva.
- Simulación espacial de vista libre: generación de imágenes controlada por parámetros de cámara (por ejemplo, desplazamiento de cámara) y exploración libre del mundo mediante un bucle de generación I2T → T2I → I2I por fragmentos.
- Interacción en bucle cerrado: auto-calibración, el modelo estima su propia anomalía de cámara y genera la secuencia de acciones correctivas.
- Comprensión multimodal: soporta entrada de imagen y texto, y salida de texto y cámara (parámetros de cámara), así como generación de imagen desde texto y cámara.
- Capacidades de agente: no se menciona soporte explícito de tool calling o agentes, pero la generación de secuencias de acciones sugiere un uso en bucle cerrado.

## Casos de uso

- Reconstrucción 3D de escenas: dado un único fotograma y una trayectoria de cámara planificada, generar las vistas RGB-D y obtener un modelo 3D en formato GLB para aplicaciones de arquitectura, diseño de interiores o digitalización de espacios.
- Estimación de pose de cámara y calibración: para sistemas de visión robótica o fotografía computacional, el modelo puede estimar la orientación y distorsión de una cámara a partir de una sola imagen, facilitando la calibración sin hardware adicional.
- Generación de contenido 3D para videojuegos y realidad virtual: a partir de una imagen de referencia y una trayectoria, generar múltiples vistas coherentes para crear assets 3D o fondos envolventes.
- Exploración de escenas para fotografía y cinematografía: el modelo puede generar nuevas vistas de una escena desde ángulos controlados, útil para previsualización de planos o exploración creativa.
- Auto-calibración de cámaras en sistemas autónomos: en vehículos o drones, el modelo puede detectar anomalías de cámara (por ejemplo, inclinación o distorsión) y generar una secuencia de correcciones, funcionando como un módulo de diagnóstico.
- Generación de imágenes con control de cámara para diseño de producto: crear imágenes de un objeto desde diferentes ángulos con parámetros de cámara específicos, para catálogos o presentaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona que el modelo supera a modelos especializados en tareas de generación y comprensión centradas en cámara, pero no se proporcionan números concretos (MMLU, HumanEval, GSM8K, etc.). Tampoco se indican métricas de rendimiento en la generación multivista o reconstrucción 3D.

## Requisitos de hardware

No se proporcionan especificaciones oficiales de hardware. Sin embargo, según el tamaño del repositorio (67 GB para el checkpoint Base) y la composición del modelo:

- El checkpoint Base (Qwen2.5-7B + SD3.5-medium) requiere aproximadamente 30-40 GB de VRAM para cargar en FP16, estimado a partir del tamaño del archivo y la arquitectura. Para SD3.5-large, el consumo puede superar los 40 GB.
- El checkpoint Pro (Qwen2.5-1.5B + SD3.5-large) puede caber en una GPU de 24 GB (por ejemplo, RTX 3090/4090) si se cuantiza, pero no se garantiza.
- Se recomienda al menos una GPU con 24 GB de VRAM para la versión Pro y 48 GB para la versión Base. Para despliegue, se puede usar el código oficial de GitHub (scripts de demo) con PyTorch y CUDA.
- No se menciona soporte para vLLM, llama.cpp u Ollama; el modelo se ejecuta con el pipeline de Puffin.

## Comparativa con modelos similares

No hay información sobre modelos comparables específicos. Puffin-World se posiciona como un modelo de mundo unificado con capacidades de generación multivista y estimación de cámara, pero no se proporcionan comparaciones con alternativas como otros modelos de generación de vistas o modelos de mundo (por ejemplo, WorldModel de NVIDIA o modelos de difusión multivista). Por tanto, no se puede establecer una comparativa con datos concretos.

## Limitaciones y advertencias

- La licencia es "other" y no se especifican condiciones de uso comercial. Es necesario contactar con los autores para conocer los términos exactos.
- El modelo es un preprint y no ha pasado por una revisión exhaustiva; puede tener errores en la generación 3D o en la estimación de cámara en casos extremos.
- No se ha evaluado su rendimiento en benchmarks estándar, por lo que su calidad comparativa no está cuantificada.
- El modelo está orientado a la generación multivista y la comprensión de cámara; no se especifican limitaciones de idioma, pero la documentación está en inglés y no se menciona soporte multilingüe.
- El tamaño del checkpoint (67 GB) puede dificultar el despliegue en entornos con recursos limitados.
- Al ser un modelo de generación de imágenes, existe riesgo de alucinaciones visuales o de producir geometrías inconsistentes en escenas complejas, aunque no se han documentado casos concretos.

## Enlaces

- Página de Hugging Face del modelo: https://huggingface.co/KangLiao/Puffin-World
- Página del proyecto: https://kangliao929.github.io/projects/puffin-world/
- Repositorio GitHub (Puffin): https://github.com/KangLiao929/Puffin
- Dataset Puffin-16M en Hugging Face: https://huggingface.co/datasets/KangLiao/Puffin-16M
- Colección Puffin en Hugging Face: https://huggingface.co/collections/KangLiao/puffin
