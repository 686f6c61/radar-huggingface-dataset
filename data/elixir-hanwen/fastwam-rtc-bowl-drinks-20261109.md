# elixir-hanwen/fastwam-rtc-bowl-drinks-20261109

## Resumen

FastWAM RTC bowl and drinks es un release de pesos de políticas de acción robótica (action policies) entrenadas con el framework RTC (Real-Time Chunking) sobre la arquitectura PI0.5. Lo publica el usuario elixir-hanwen en Hugging Face y contiene ocho checkpoints finales correspondientes al experimento de entrenamiento del 2026-11-09, cubriendo dos tareas manipulativas concretas: recoger un bol (bowl_11.2) y manipular bebidas (drinks_11.3). No es un modelo de lenguaje ni un paquete `AutoModel` de Transformers, sino un conjunto de state-dicts en BF16 pensados para cargarse con una implementación compatible de PI0.5 con RTC.

Cada tarea incluye tres variantes con fine-tuning de 5.000 pasos más 2.500 pasos de RTC, y una variante Transformer con 30.000 pasos de fine-tuning más 10.000 de RTC. Las variantes se distinguen por la rama de vídeo usada durante el entrenamiento (`pi05`, `pi05_trans27m`, `pi05_wan22_5b_random`), aunque todas comparten la misma arquitectura de política de acción PI0.5 y las redes auxiliares de vídeo no se incluyen porque no son necesarias para la inferencia.

El interés del release es acotado pero específico: sirve como referencia reproducible de entrenamiento de políticas de acción con RTC, con horizonte de acción 32, estado y acción de 14 dimensiones (padding a 32), y configuración RTC de retardo máximo de prefijo 12 y horizonte de ejecución 8. El repositorio ocupa 53,7 GB e incluye estadísticas de normalización y configuraciones de entrenamiento por checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PI0.5 (política de acción; variantes con rama de vídeo pi05, pi05_trans27m o pi05_wan22_5b_random durante entrenamiento) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; horizonte de acción 32 y longitud máxima de tokens 200 |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (modelo de robótica, sin cabezas de generación de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), acompañado de config.json, training_config.json, norm_stats.json y complete.json |

## Arquitectura y entrenamiento

La política sigue la arquitectura PI0.5, con una rama de acción entrenada y, durante el entrenamiento, una rama de vídeo auxiliar cuya identidad varía entre variantes (`pi05`, `pi05_trans27m`, `pi05_wan22_5b_random`). Las redes de vídeo auxiliares no se incluyen en el release porque no intervienen en la inferencia de acciones. Los pesos son políticas BF16 en crudo, con EMA desactivado; no se incluyen estados del optimizador ni datos de trayectorias. Las cabezas de generación de lenguaje se sustituyen por `torch.nn.Identity` en la política de referencia.

El entrenamiento usó 100 trayectorias por tarea (54.430 frames para bowl y 55.329 para drinks), batch global 32, cuatro GPUs, BF16, DeepSpeed ZeRO-1, AdamW en GPU, semilla 42 y sin EMA. Las variantes PI y Transformer usaron microbatch 8 con acumulación 1; la variante de 5B usó microbatch 4 con acumulación 2. El estado y la acción tienen 14 dimensiones, con padding a cero hasta las 32 dimensiones de la red, y la normalización debe hacerse con las estadísticas q01/q99 del directorio del modelo. RTC se activa con retardo máximo de prefijo 12 y horizonte de ejecución 8.

## Capacidades

- Generación de acciones robóticas para dos tareas específicas: manipulación de un bol (bowl_11.2) y de bebidas (drinks_11.3).
- Ejecución con RTC (Real-Time Chunking) para inferencia en tiempo real con horizonte de acción 32 y horizonte de ejecución 8.
- Carga de state-dicts nativos de PI0.5 mediante una implementación compatible (adaptador de referencia en `reference/rtc_pi05.py`).
- Normalización de estado y acción mediante estadísticas q01/q99 incluidas por checkpoint.
- No incluye generación de lenguaje, tool calling, agentes, visión de propósito general ni capacidades multilingües; es una política de acción específica de tarea.

## Casos de uso

- Investigación en políticas de acción con RTC: cargar los checkpoints en una implementación PI0.5 compatible y reproducir la configuración de retardo de prefijo 12 y horizonte de ejecución 8 para estudiar el comportamiento de RTC en tareas manipulativas.
- Comparación de variantes de entrenamiento: evaluar las diferencias entre fine-tuning corto (5.000 + 2.500 pasos) y largo (30.000 + 10.000 pasos) sobre las mismas tareas y trayectorias.
- Estudio de ramas de vídeo auxiliares: analizar cómo afecta la elección de rama (`pi05`, `pi05_trans27m`, `pi05_wan22_5b_random`) al rendimiento de la política de acción, dado que las redes de vídeo no se incluyen en inferencia.
- Reproducción de experimentos: usar `training_config.json` y `norm_stats.json` para replicar el pipeline de entrenamiento con DeepSpeed ZeRO-1, BF16 y semilla 42.
- Base para fine-tuning en tareas similares: partir de los pesos BF16 y adaptarlos a nuevas tareas de manipulación con el mismo formato de estado/acción de 14 dimensiones.
- Validación de infraestructura de inferencia robótica: integrar el adaptador de referencia y los helpers RTC en un stack de evaluación de políticas antes de desplegar en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se proporcionan resultados de evaluación en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 53,7 GB y los pesos se publican en BF16.
- GPU recomendadas: no disponible; el entrenamiento usó cuatro GPUs con BF16, DeepSpeed ZeRO-1 y AdamW.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: implementación compatible de PI0.5 con RTC; el adaptador de referencia (`reference/rtc_pi05.py`) importa OpenPI y `woodrtc.rtc_utils`. No es un paquete `AutoModel` de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de acción robótica PI0.5 con RTC) ni datos de rendimiento para establecer una comparación.

## Limitaciones y advertencias

- Políticas específicas de tarea: solo cubren bowl_11.2 y drinks_11.3; no son modelos generales.
- Sin resultados de evaluación en robot: la model card indica que no se proporcionan resultados de evaluación.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Pesos en crudo BF16 sin EMA: no se incluyen estados del optimizador ni datos de trayectorias, lo que limita la reanudación exacta del entrenamiento.
- Requiere una implementación compatible de PI0.5 con RTC; no funciona como `AutoModel` de Transformers.
- Estado y acción de 14 dimensiones con padding a 32: hay que respetar el formato y la normalización q01/q99 para evitar resultados incorrectos.
- Sin cabezas de generación de lenguaje: no apto para tareas de texto, tool calling ni agentes conversacionales.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos de lenguaje; el riesgo principal es el fallo de la política fuera de la distribución de las 100 trayectorias de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/elixir-hanwen/fastwam-rtc-bowl-drinks-20261109
