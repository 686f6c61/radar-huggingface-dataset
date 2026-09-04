# ACERobotics/Puffin-World

## Resumen

Puffin-World es un modelo multimodal unificado de mundo desarrollado por un equipo de investigación de S-Lab (Nanyang Technological University), la Universidad de Michigan, la Universidad de Beijing Jiaotong y ACE Robotics. A diferencia de los modelos que representan el mundo como una secuencia de fotogramas RGB, Puffin-World modela explícitamente tres estados 3D nativos: física (campos de gravedad y mapas de latitud), geometría (profundidad densa) y apariencia (imágenes y secuencias coherentes espacialmente). Esto le permite percibir, simular, generar y reconstruir el mundo 3D dentro de un único marco.

La arquitectura integra un encoder de visión alineado geométricamente, un modelo de lenguaje (LLM), un modelo de difusión y un conector ligero. El modelo admite comprensión de cámara a mundo a partir de una sola imagen, generación de imágenes controlada por cámara, generación multi-vista RGB-D a lo largo de trayectorias de cámara y reconstrucción directa en nube de puntos 3D. Se presenta en tres variantes: Base, Pro y Caption. El repositorio de HuggingFace pesa 67 GB y la licencia es de tipo "other", por lo que debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal unificado con encoder de vision alineado geometricamente, LLM, modelo de difusion y conector ligero |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

Puffin-World combina un encoder de visión (C-RADIOv3-H en la variante Base, C-RADIOv4-H en la variante Pro), un LLM (Qwen2.5-7B en Base, Qwen2.5-1.5B en Pro, Qwen3.5-0.8B en Caption) y un modelo de difusión (SD3.5-medium en Base, SD3.5-large en Pro). El componente central es el modelado de mundo multi-vista céntrico en cámara: dada una vista inicial y una trayectoria de cámara, el modelo genera conjuntamente las vistas RGB y de profundidad restantes y las consolida en una reconstrucción de nube de puntos 3D alineada con gauge.

La condición de cámara Omni-Camera, de 9 canales, combina un campo de perspectiva absoluto consciente de la gravedad con geometría relativa basada en rayos, lo que permite el anclaje cámara-mundo, rotación, traslación y movimiento compuesto. La propagación de física propaga la dirección de gravedad percibida desde la vista de referencia a través de la trayectoria de cámara objetivo para mantener las vistas generadas en un marco físico coherente. El entrenamiento se realiza con Puffin-16M, que comprende 15 millones de tripletas visión-lenguaje-cámara y 1 millón de trayectorias de cámara diversas extraídas de 28 conjuntos de datos públicos. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Comprensión de cámara a mundo a partir de una sola imagen, incluyendo roll, pitch y campo de visión vertical.
- Generación de imágenes controlada por cámara con intrínsecas y orientaciones explícitas (texto a imagen).
- Generación de mundos 3D condicionada por imagen o texto a lo largo de trayectorias largas, extremas o compuestas.
- Generación conjunta multi-vista RGB-D y reconstrucción directa de nubes de puntos 3D.
- Exploración de mundos en bucle cerrado, tanto de imitación como auto-calibrada.
- Modelado de estados 3D nativos (física, geometría y apariencia) en un marco unificado.
- Comprensión y generación unificadas: el entendimiento autoregresivo y la generación basada en difusión comparten el mismo marco multimodal.

## Casos de uso

- Reconstrucción 3D de interiores a partir de una única imagen: el modelo genera vistas RGB-D adicionales y las consolida en una nube de puntos, lo que permite obtener un modelo 3D de una habitación sin necesidad de escaneo multi-vista.
- Navegación robótica: la comprensión de cámara a mundo estima roll, pitch y dirección de gravedad, lo que resulta útil para robots móviles que necesitan orientarse en entornos desconocidos.
- Generación de datos sintéticos para entrenamiento de modelos de visión: se pueden generar trayectorias de cámara y vistas RGB-D sintéticas para aumentar conjuntos de datos de entrenamiento en tareas de profundidad o segmentación.
- Realidad aumentada: la condición de cámara Omni-Camera permite alinear contenido virtual con el mundo físico mediante campos de gravedad y perspectiva, mejorando la coherencia espacial de los objetos superpuestos.
- Simulación de entornos para vehículos autónomos: el modelo puede generar escenas 3D coherentes a lo largo de trayectorias de cámara, lo que facilita la creación de entornos simulados para probar sistemas de percepción.
- Fotogrametría y topografía: la estimación de parámetros de cámara y la reconstrucción de nubes de puntos a partir de una sola imagen reducen la necesidad de equipos de captura multi-sensor.
- Exploración remota y teleoperación: la exploración de mundos en bucle cerrado permite a un operador navegar por un entorno generado y actualizado dinámicamente, útil en inspecciones industriales o misiones de búsqueda y rescate.

## Benchmarks y rendimiento

Se han publicado resultados de benchmarks específicos de visión 3D y control de cámara. No se han proporcionado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K), ya que el modelo está orientado a tareas de mundo 3D.

| Capacidad | Resultado |
|---|---|
| Comprensión cámara-mundo | Mejores errores medianos en 12/12 comparaciones y mejor AUC en 33/36 métricas (incluyendo empates) en Stanford2D3D, MegaDepth, TartanAir y LaMAR |
| Generación controlable por cámara | Errores medianos de 0.84° (up-vector), 1.26° (latitud) y 0.79° (gravedad), con el FID más bajo en Puffin-Cam-Bench |
| Modelado de mundo 3D | PSNR 17.22 y LPIPS 0.318 en RealEstate10K |
| Trayectorias desafiantes | Errores medianos más bajos de roll y pitch en Puffin-Traj-Bench: 0.80° y 1.10° |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. La implementación de referencia se ejecuta desde el repositorio de GitHub.
- Requisitos de software: Python 3.10, PyTorch 2.7.0, CUDA 12.6 y flash-attn 2.8.3.
- El repositorio de HuggingFace pesa 67 GB, lo que indica que los pesos no están cuantizados y que se requiere una GPU con gran capacidad de memoria. No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible.

## Limitaciones y advertencias

- La licencia es de tipo "other" y no se detallan los términos exactos; es necesario revisar la licencia antes de cualquier uso comercial.
- Los idiomas soportados no están especificados, lo que limita la evaluación de su rendimiento multilingüe.
- No se han publicado datos sobre sesgos, riesgo de alucinación ni comportamiento en escenarios adversos.
- La longitud de contexto no está disponible, por lo que no se puede determinar su capacidad para manejar secuencias largas o dependencias de largo alcance.
- El modelo se encuentra en fase de pre-print (2026) y tiene 0 descargas en HuggingFace, lo que sugiere que es experimental y no ha sido ampliamente probado en producción.
- La dependencia de CUDA 12.6 y flash-attn 2.8.3 puede dificultar el despliegue en entornos de inferencia estándar.

## Enlaces

- HuggingFace: https://huggingface.co/ACERobotics/Puffin-World
- Paper: https://huggingface.co/papers/2609.04196
- GitHub: https://github.com/KangLiao929/Puffin
- Project page: https://kangliao929.github.io/projects/puffin-world/
- Dataset: https://kangliao929.github.io/projects/puffin-16m/
- HF Blog: https://huggingface.co/blog/KangLiao/puffin-world
- Arxiv 2609.04196: https://arxiv.org/abs/2609.04196
- Arxiv 2510.08673: https://arxiv.org/abs/2510.08673
