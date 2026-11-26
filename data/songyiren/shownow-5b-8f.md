# songyiren/ShowNow-5B-8F

## Resumen
ShowNow-5B-8F es un modelo de generación de vídeo condicionada por acciones, diseñado como world model interactivo para entornos tipo ViZDoom/Freedoom 2. Lo desarrolla Yiren Song (ShowLab) y se presenta como el checkpoint de inferencia "ocho futuros" del trabajo ShowNow: Fine-Grained Speculative Streaming for Responsive World Models. El modelo parte de SolarWM / Wan2.2-TI2V-5B y se afina sobre datos de gameplay, con el objetivo de predecir continuaciones visuales coherentes para cada acción del usuario en tiempo casi real.

La innovación principal es la generación especulativa: a partir de una historia visual compartida, el modelo prepara ocho continuaciones condicionadas por las ocho acciones posibles (W, A, S, D, giro izquierda, giro derecho, ataque, salto) y, cuando el usuario elige una, compromete esa rama. Esto reduce la latencia percibida frente a generar cada frame desde cero tras conocer la acción.

El checkpoint tiene 5.001.371.328 parámetros, pesa aproximadamente 10 GB en BF16 EMA y genera vídeo a 864 × 480 y 16 fps con una ventana de historia de 15 latentes. Es un runtime personalizado, no un pipeline Diffusers, y está pensado para despliegue en una NVIDIA H100 de 80 GB con optimización de árbol de historia compartida.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión vídeo (base Wan2.2-TI2V-5B / SolarWM), runtime personalizado con generación especulativa de ocho futuros |
| Parametros totales | 5.001.371.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de historia de 15 latentes; bloque de generación de 1 latente / 4 frames de vídeo |
| Tipos de cuantizacion | no disponible (pesos BF16 EMA en la release) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (pesos y código ShowNow); clips demo bajo BSD-3-Clause; componentes SolarWM, Wan2.2 y TAEHV mantienen sus licencias upstream |
| Formato de pesos | safetensors (`shownow_8f.safetensors`), más `inference_config.json` y configuración de arquitectura |

## Arquitectura y entrenamiento
El modelo se construye sobre SolarWM / Wan2.2-TI2V-5B, un backbone de difusión para image-to-video, y se ajusta finamente sobre ViZDoom / Freedoom 2. La inferencia usa tres pasos de denoising (1000, 667, 333 antes del warping del scheduler) y produce 4 frames de vídeo por latente generado, con reproducción a 16 fps y resolución 864 × 480.

El mecanismo central es la generación especulativa de múltiples futuros: se preparan ocho continuaciones condicionadas por acción desde una historia visual compartida y, al seleccionar la acción, se compromete la rama correspondiente. La release contiene pesos BF16 EMA solo para inferencia (sin estado de optimizador ni crítico); los 831 tensores exportados se verificaron como exactamente iguales a los tensores EMA del checkpoint de entrenamiento seleccionado. El dataset asociado incluye 10.241 forks de acción mantenida, 11.471 forks de cambio de acción y 252 forks de evaluación, cada uno con ocho futuros. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset más allá de ViZDoom/Freedoom 2.

## Capacidades
- Generación de vídeo image-to-video condicionada por acción en entornos de gameplay.
- Predicción de múltiples futuros (ocho ramas) desde una historia visual compartida, con selección y commit de la rama elegida.
- Modelado de world model interactivo para las ocho acciones discretas: W, A, S, D, giro izquierda, giro derecho, ataque y salto.
- Generación en streaming con baja latencia mediante decodificación especulativa y árbol de historia compartida.
- Reproducción a 864 × 480 y 16 fps con tres pasos de denoising.
- Soporte de demo en navegador y harness de evaluación incluidos en el repositorio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-step en la información disponible.
- Capacidad multilingüe limitada: solo inglés (`en`).

## Casos de uso
- Investigación en world models interactivos: el modelo permite estudiar cómo un agente visual predice consecuencias de acciones discretas en un entorno de juego, usando las ocho ramas especulativas para comparar futuros alternativos.
- Prototipado de entornos de simulación para videojuegos: se puede usar para generar continuaciones visuales de gameplay en ViZDoom/Freedoom 2 y evaluar la coherencia de transiciones antes de integrarlas en un motor real.
- Demos interactivas en navegador: el repositorio incluye un demo web que carga el checkpoint y permite seleccionar acciones en tiempo real, útil para presentar resultados de investigación.
- Evaluación de latencia en streaming: gracias a la generación especulativa y al árbol de historia compartida, el modelo sirve para medir latencia percibida en despliegues con H100 80 GB.
- Generación de datos sintéticos de gameplay: las continuaciones condicionadas por acción pueden emplearse para aumentar datasets de entrenamiento de agentes o de modelos de vídeo.
- Benchmarking de decodificadores de vídeo: al usar TAEHV como decodificador, el checkpoint permite comparar calidad y velocidad de decodificación frente a alternativas.
- Estudio de robustez en escenas no vistas: el modelo puede servir para analizar degradación de consistencia visual en rollouts largos, revisitas repetidas y combinaciones de acciones simultáneas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper (arXiv:2611.34693) para evaluaciones de calidad y latencia, pero no se proporcionan cifras concretas en los datos disponibles.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 10 GB de pesos en BF16, más memoria para activaciones, árbol de historia compartida y decodificador TAEHV; el despliegue probado usa una NVIDIA H100 de 80 GB.
- GPU recomendadas: NVIDIA H100 80 GB para el despliegue probado y optimizado; no se documentan otras GPU validadas.
- Cabe en consumer GPU: no disponible; no se confirma compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: runtime personalizado `shownow` (paquete con `shownow_8f.safetensors`, `inference_config.json`, configuración de arquitectura, curvas de cámara nominales y tres prefijos demo pre-codificados). No es un pipeline Diffusers; requiere el runtime SolarWM y el decodificador TAEHV descritos en el README del código. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible; la model card remite al paper para evaluaciones de latencia.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (world models de vídeo condicionados por acción), por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias
- Alcance restringido a las ocho acciones discretas de ViZDoom / Freedoom 2; no cubre combinaciones de acciones simultáneas.
- Escenas no vistas, rollouts largos y revisitas repetidas pueden reducir la consistencia visual y el seguimiento de acciones.
- El modelo está entrenado y evaluado solo en inglés (`en`), sin capacidades multilingües documentadas.
- Riesgo de alucinación visual: al ser un modelo generativo de vídeo, puede producir continuaciones plausibles pero incorrectas respecto a la dinámica real del entorno.
- Licencia Apache-2.0 para pesos y código ShowNow, pero los clips demo retienen BSD-3-Clause y los componentes SolarWM, Wan2.2 y TAEHV mantienen sus licencias upstream; es necesario revisarlas para uso comercial.
- Es un checkpoint de inferencia únicamente: no incluye estado de optimizador, crítico, teacher ni checkpoints intermedios de entrenamiento.
- La variante de 33B es un modelo separado y no está incluida en esta release.
- El runtime es personalizado y no compatible con pipelines Diffusers estándar, lo que limita la integración directa en herramientas convencionales.
- No se documentan sesgos específicos en la información disponible.

## Enlaces
- Hugging Face: https://huggingface.co/songyiren/ShowNow-5B-8F
- Paper: https://arxiv.org/abs/2611.34693
- Código: https://github.com/showlab/ShowNow
- Dataset: https://huggingface.co/datasets/songyiren/ShowNow-MultiFuture
