# dreamdifferent/vam-cross-level2-so101-widowx-texture-video-lora-iter-200

## Resumen

Este repositorio contiene un adaptador LoRA de generación de video para robótica, desarrollado por el usuario `dreamdifferent`. Se trata de un checkpoint de la iteración 200 de un entrenamiento de Video2World basado en MimicVideo, específicamente diseñado para el brazo robótico WidowX con dos cámaras (esquina y frontal). El modelo no es autónomo: requiere un backbone base concreto (`fused_video2world_dit`) que ya incorpora una fusión previa de LoRA de WidowX/Bridge, y sobre el que se aplica este adaptador para generar secuencias de video que predicen la ejecución de tareas robóticas a partir de observaciones visuales e instrucciones en lenguaje natural.

La relevancia de este modelo radica en su enfoque de "mundo-acción" para robótica: dado un fotograma de cámara y una instrucción, el sistema genera los fotogramas futuros que muestran al robot completando la tarea. Esto es útil para entrenamiento de políticas, simulación y planificación. El adaptador se entrenó con 298 episodios (54 354 fotogramas) de datos de WidowX, con 24 tareas distintas, y su tamaño es de 0,7 GB. No se dispone de información sobre la arquitectura completa del backbone, los parámetros totales, la licencia ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre backbone `fused_video2world_dit` (difusión de video, tipo DiT) |
| Parametros totales | no disponible (el LoRA pesa 0,7 GB; el backbone ~3,9 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones están en inglés, según el manifiesto) |
| Licencia | no disponible |
| Formato de pesos | checkpoint LoRA (probablemente safetensors o binario, no especificado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rank 256, según el nombre `lora_r256`) que se aplica sobre un backbone de difusión de video denominado `fused_video2world_dit`. Este backbone ya incluye una fusión previa de LoRA de WidowX/Bridge, por lo que cargar el backbone original de Bridge sería incorrecto. El entrenamiento se realizó con el framework MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`) y utiliza un tokenizador de video y un codificador de texto T5-11B como artefactos de soporte. Los datos de entrenamiento provienen del dataset `vam-cross-level2-so101-widowx-texture`, con 298 episodios y 54 354 fotogramas, capturados con dos cámaras (`corner_cam` y `front_cam`) en disposición `hstack` a 5 Hz. Se definieron 24 tareas con instrucciones condicionadas a episodios. El proceso de entrenamiento alcanzó la iteración 200 y terminó por límite de tiempo (`walltime`). No se mencionan técnicas como RLHF o DPO; el enfoque es de generación supervisada de video.

## Capacidades

- Generación de video condicionado: a partir de una observación de cámara y una instrucción textual, predice los fotogramas futuros que muestran la ejecución de la tarea robótica.
- Soporte de dos cámaras simultáneas (esquina y frontal) con disposición horizontal apilada (`hstack`).
- Condicionamiento por instrucciones en lenguaje natural (24 tareas específicas del dataset).
- Integración con el ecosistema MimicVideo y el backbone `fused_video2world_dit` para tareas de robótica.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso, visión general o audio.

## Casos de uso

- Entrenamiento de políticas robóticas: el modelo genera trayectorias de video sintéticas que pueden usarse como datos aumentados para entrenar políticas de control del brazo WidowX, especialmente en entornos con dos cámaras.
- Simulación de tareas: permite visualizar el resultado esperado de una instrucción antes de ejecutarla en el robot real, útil para validación y depuración de comportamientos.
- Planificación de movimientos: al predecir los fotogramas futuros, el sistema puede anticipar colisiones o errores de ejecución y ajustar la secuencia de acciones.
- Generación de datos para aprendizaje por imitación: los videos generados pueden complementar conjuntos de demostraciones reales, reduciendo la necesidad de recopilar datos físicos.
- Evaluación de políticas en entornos simulados: el modelo actúa como un "mundo" que responde a acciones, permitiendo probar controladores sin hardware.
- Investigación en world models: sirve como base para estudiar la predicción de video en robótica y la transferencia entre dominios (simulación-real).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 0,7 GB, pero requiere cargar el backbone `fused_video2world_dit` de ~3,9 GB (3913057284 bytes). Por tanto, la VRAM mínima estimada para inferencia sería al menos 5-6 GB solo para los pesos, más el overhead de activaciones y el codificador T5-11B (que puede requerir varios GB adicionales).
- No se especifican GPUs recomendadas. Dado el tamaño del backbone y el uso de un T5-11B, se necesitaría una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A100) para una inferencia cómoda, aunque no hay datos oficiales.
- Opciones de despliegue: al ser un adaptador de MimicVideo, se usaría el código y configuración de MimicVideo (commit indicado). No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos. Existen otros adaptadores de la misma familia (p. ej., `vam-cross-level4-panda-robosuite-widowx-texture-video-lora-iter-200`) y el modelo completo DreamZero-SO101 (un world model de 14B parámetros basado en Wan2.1-I2V), pero no se conocen sus especificaciones detalladas ni sus resultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un adaptador, no un modelo independiente: requiere cargar exactamente el backbone `fused_video2world_dit` de la revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`; cargar otro backbone dará resultados incorrectos.
- El dataset de entrenamiento no está incluido; su uso está sujeto a la política de acceso del dataset y a los términos de MimicVideo, NVIDIA Cosmos y del checkpoint base.
- Solo se ha entrenado para tareas específicas de WidowX con dos cámaras; no es generalizable a otros robots o configuraciones sin reentrenamiento.
- Riesgo de alucinación en la generación de video: los fotogramas predichos pueden no corresponder a una ejecución físicamente plausible.
- Licencia no disponible: no se puede determinar si es de uso comercial o restringido.
- No se reportan sesgos específicos, pero al ser datos de un solo robot y entorno, puede haber sesgos de dominio.
- El entrenamiento se detuvo por límite de tiempo (`walltime`), por lo que el modelo puede no haber convergido completamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture-video-lora-iter-200
- Proyecto DreamZero-SO101 (world model para SO-101): https://vizuara-ai-lab.github.io/dreamzero-so101/index.html
- Código DreamZero-SO101 en GitHub: https://github.com/Vizuara-AI-Lab/dreamzero-so101
- Otro LoRA similar de la misma serie: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-video-lora-iter-200
