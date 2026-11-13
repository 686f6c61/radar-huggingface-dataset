# OpenWAM-Stanford/OpenWAM-VTA-LIBERO10

## Resumen

OpenWAM-VTA-LIBERO10 es un checkpoint de política robótica desarrollado por OpenWAM-Stanford, un proyecto de investigación centrado en el aprendizaje de robots a partir de vídeo. El modelo implementa una política VTA (video-to-action) de doble experto: un experto de vídeo que predice la evolución esperada de la escena y un experto de acción que traduce esa predicción en comandos motores. Dada una instrucción de tarea y las observaciones actuales de cámara, el modelo imagina el movimiento futuro y genera las acciones que lo materializan, cerrando el bucle con nuevas observaciones durante la ejecución.

Este checkpoint concreto corresponde al paso 15.000 de entrenamiento sobre el benchmark LIBERO-Long (LIBERO-10), un conjunto de tareas de manipulación robótica de horizonte largo. Incluye tanto los pesos del experto de vídeo como los del experto de acción, junto con una configuración de inferencia y sumas de verificación. El repositorio ocupa 30,7 GB y los pesos se distribuyen en formato PyTorch.

Su relevancia radica en el enfoque de "predecir el movimiento y luego actuar", que combina modelos generativos de vídeo con control robótico en una sola arquitectura, una línea de investigación activa en 2026 para mejorar la generalización en tareas de manipulación de largo horizonte. Está pensado para su uso con las herramientas de rollout del repositorio OpenWAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de doble experto (vídeo + acción) para video-to-action; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | AGPL-3.0-only |
| Formato de pesos | PyTorch (checkpoint con pesos, configuración de inferencia y checksums) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de política de doble experto orientada a video-to-action. Un primer experto predice cómo debería evolucionar la escena visual a partir de la instrucción de tarea y las observaciones de cámara; un segundo experto de acción genera los comandos motores que realizan ese movimiento previsto. El bucle se cierra con nuevas observaciones durante la ejecución, de modo que la política reajusta su plan conforme el robot actúa.

El checkpoint corresponde al paso 15.000 de entrenamiento sobre LIBERO-Long (LIBERO-10), un benchmark de manipulación robótica con tareas de horizonte largo. No se especifican en la información disponible el número de tokens o episodios de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de vídeo: genera una representación del estado futuro de la escena a partir de la instrucción y las observaciones actuales.
- Generación de acciones robóticas: traduce la predicción de movimiento en comandos motores ejecutables.
- Control en bucle cerrado: incorpora nuevas observaciones de cámara para reajustar el plan durante la ejecución.
- Ejecución de tareas de manipulación de horizonte largo, específicamente las del benchmark LIBERO-Long (LIBERO-10).
- Seguimiento de instrucciones en lenguaje natural en inglés.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica de horizonte largo en laboratorio: el modelo está entrenado específicamente para LIBERO-10, por lo que es adecuado para reproducir y evaluar tareas de manipulación de varios pasos en entornos simulados con el stack OpenWAM.
- Investigación en aprendizaje a partir de vídeo: sirve como base para estudiar cómo la predicción visual futura mejora la política de acción en robots, comparando el experto de vídeo con políticas puramente reactivas.
- Evaluación comparativa de políticas robóticas: al ser un checkpoint del paso 15.000 sobre LIBERO-10, permite medir la curva de aprendizaje y comparar contra otros checkpoints del mismo proyecto.
- Prototipado de control en bucle cerrado: útil para validar pipelines de rollout que combinan observaciones de cámara, predicción de movimiento y ejecución de acciones con reobservación.
- Reproducción de experimentos académicos: el paquete incluye configuración de inferencia y checksums, lo que facilita la reproducibilidad de resultados en entornos de investigación.
- Desarrollo de sistemas de imitación visual: el doble experto puede servir de referencia para construir políticas que primero imaginen el resultado y luego planifiquen la acción en dominios de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 30,7 GB, lo que da una cota inferior orientativa del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del checkpoint (30,7 GB) sugiere que no cabe en GPUs de consumo de gama media sin cuantización o particionado, pero no se confirma.
- Opciones de despliegue: herramientas de rollout del repositorio OpenWAM (https://github.com/OpenWAM/OpenWAM), con la configuración de inferencia incluida en el checkpoint. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas video-to-action para LIBERO) ni sus especificaciones.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado para LIBERO-Long (LIBERO-10); su generalización a otras tareas, entornos o morfologías de robot no está documentada.
- Idioma: solo se declara soporte de inglés para las instrucciones.
- Licencia AGPL-3.0-only: impone obligaciones de copyleft fuerte; el uso comercial o la integración en productos propietarios requiere revisar los términos y las atribuciones de LICENSE, NOTICE y LICENSE.upstream.
- Riesgo de alucinación visual: al predecir la evolución de la escena, el experto de vídeo puede generar planes inconsistentes con la realidad física, especialmente fuera de la distribución de entrenamiento.
- Sin datos de benchmarks ni de rendimiento publicados en la información disponible, por lo que no es posible cuantificar su calidad frente a alternativas.
- Sin información sobre sesgos, robustez ante cambios de iluminación, oclusiones o variaciones de cámara.
- Uso previsto en investigación y simulación con el stack OpenWAM; no se documenta su validación en robots físicos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/OpenWAM-Stanford/OpenWAM-VTA-LIBERO10
- Página del proyecto: https://openwam.stanford.edu/
- Repositorio de código: https://github.com/OpenWAM/OpenWAM
