# ImKyungjin/pi05-so101-cvpr2027-realworld-general-fullft-30k-step15000

## Resumen

El modelo `ImKyungjin/pi05-so101-cvpr2027-realworld-general-fullft-30k-step15000` es un checkpoint de ajuste fino completo del modelo base `lerobot/pi05_base`, desarrollado por el usuario ImKyungjin. Se trata de un modelo de política visomotora (vision-language-action, VLA) orientado a control robótico de un brazo SO101, entrenado para ejecutar tres tareas manipulativas concretas: recoger y colocar un muñeco en una caja, empujar un cubo a una zona negra y apilar un cubo de madera sobre un cubo de Rubik. El modelo combina un backbone de tipo VLM con un experto de acción, siguiendo la arquitectura pi05 del ecosistema LeRobot.

El checkpoint corresponde al paso 15000 de un programa de entrenamiento de 30000 actualizaciones con decaimiento coseno, sobre 120 episodios y 37435 fotogramas de demostraciones reales. Los pesos se publican en safetensors con 3.616.757.520 parámetros totales y un tamaño de repositorio de 14.5 GB, incluyendo procesadores, tokenizador, normalización y código de experimento. La licencia no está declarada en la información disponible, lo que constituye una limitación relevante para uso comercial.

Su relevancia es acotada pero específica: es un ejemplo de ajuste fino completo de un VLA sobre un robot de bajo coste (SO101), con instrucciones en lenguaje natural, salida de acciones en forma de chunk de 50 pasos y horizonte de ejecución de 10. No se aportan tasas de éxito en robot real, por lo que debe tratarse como material de reproducción e investigación más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM + experto de acción (pi05, ecosistema LeRobot) |
| Parámetros totales | 3.616.757.520 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en FP32) |
| Idiomas soportados | no disponible (instrucciones de ejemplo en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y aplica ajuste fino completo sobre todos los parámetros del VLM y del experto de acción. La entrada visual consiste en dos imágenes RGB con letterbox a 224 píxeles: `top` mapeada al slot `base_0_rgb` y `front` mapeada al slot `left_wrist_0_rgb` (un slot del modelo, no una cámara de muñeca física). La entrada propioceptiva son seis valores nativos de posición de articulaciones y pinza. La salida son las mismas seis posiciones absolutas, emitidas como chunk de 50 pasos con horizonte de ejecución de 10 y 10 pasos de denoising.

El entrenamiento usa 40 demostraciones por tarea (Pick and Place, Push Cube, Stack Cube), totalizando 120 episodios y 37435 fotogramas; 30 demostraciones reservadas no se usaron para entrenamiento y no se añadió adaptación de Office. Hiperparámetros: batch 8, microbatch 8, semilla 1000, AdamW con lr 2.5e-5, betas (0.9, 0.95), weight decay 0.01, warmup 1000 pasos y decaimiento coseno hasta 2.5e-6 en el paso 30000. Se usó autocast bf16 con pesos guardados en FP32. El checkpoint publicado es el paso 15000 de esa programación de 30000 actualizaciones, no del run de 70000. No se incluye el estado del optimizador.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de instrucciones en lenguaje natural y observaciones RGB.
- Ejecución de tres tareas entrenadas: recoger y colocar un muñeco en una caja, empujar un cubo a una zona negra y apilar un cubo de madera sobre un cubo de Rubik.
- Control de un brazo SO101 con seis valores nativos absolutos de articulación y pinza.
- Procesamiento multimodal: dos vistas RGB (base y "muñeca" lógica) más estado propioceptivo.
- Salida en chunks de acción de 50 pasos con horizonte de ejecución de 10 y 10 pasos de denoising.
- Inclusión de procesadores, tokenizador y normalización en el repositorio, sin dependencia del checkpoint base.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni otros idiomas.

## Casos de uso

- Reproducción de experimentos VLA: cargar el checkpoint con `experiment_code/load_export.py` para preservar los pesos FP32 junto con los procesadores guardados y reproducir las tres tareas de manipulación en un SO101 con la misma calibración y unidades nativas.
- Investigación en ajuste fino completo de políticas visomotoras: servir como punto de comparación frente a ajustes parciales o LoRA sobre `pi05_base` en las mismas tareas.
- Evaluación de generalización en manipulación real: usar las 30 demostraciones reservadas para medir el comportamiento del modelo en episodios no vistos, dado que el autor no declara tasa de éxito.
- Estudio de chunking y horizonte de ejecución: analizar el efecto del chunk de 50 con horizonte 10 y 10 pasos de denoising en la estabilidad de las trayectorias.
- Base para adaptación a nuevas tareas: partir de este checkpoint y aplicar ajuste fino adicional en un SO101 con la misma configuración de cámaras y calibración.
- Docencia y prototipado en robótica de bajo coste: montar un pipeline LeRobot completo con un brazo SO101 y un modelo VLA preentrenado y ajustado, sin depender de hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se declara ninguna tasa de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 14.5 GB solo para pesos, más activaciones y buffers de imagen; se recomienda al menos 24 GB para trabajar con holgura.
- VRAM estimada en bf16/fp16: alrededor de 7-8 GB para pesos, aunque el repositorio guarda FP32 y el script de carga está pensado para preservarlos.
- GPU recomendadas: A100 o H100 para entrenamiento y evaluación por lotes; RTX 4090 (24 GB) para inferencia FP32 y experimentación.
- GPU de consumo: una RTX 3090 o 4090 de 24 GB es la opción realista en FP32; tarjetas de 12-16 GB requerirían conversión a precisión reducida, no documentada por el autor.
- Opciones de despliegue: LeRobot con el código de experimento incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-so101-cvpr2027-realworld-general-fullft-30k-step15000 | 3.616.757.520 | no disponible | VLA para SO101, 3 tareas | no disponible | Hugging Face (LeRobot) |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA base | no disponible | Hugging Face (LeRobot) |
| Otros VLA del ecosistema LeRobot (p. ej. variantes pi0) | no disponible | no disponible | Manipulación general | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe tratarse como no permitido hasta confirmación del autor.
- El autor no aporta tasa de éxito en robot real; el rendimiento en las tareas es desconocido.
- El modelo está entrenado para tres tareas concretas y un robot SO101 con calibración y unidades nativas específicas; no generaliza a otras tareas, robots o configuraciones de cámara sin nuevo ajuste.
- El mapeo `front` a `left_wrist_0_rgb` es un slot lógico, no una cámara de muñeca física; usar una cámara física en ese slot puede degradar el comportamiento.
- Solo se incluyen 40 demostraciones por tarea, lo que limita la diversidad de escenarios y aumenta el riesgo de sobreajuste a condiciones de recogida de datos.
- No se incluye el estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde este paso.
- Riesgo de alucinación en la interpretación de instrucciones fuera del conjunto entrenado; no se documentan sesgos específicos.
- Idiomas soportados no disponibles; las instrucciones de ejemplo están en inglés.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/ImKyungjin/pi05-so101-cvpr2027-realworld-general-fullft-30k-step15000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- LeRobot (librería): https://github.com/huggingface/lerobot
