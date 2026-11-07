# Myungkyu/rldx_robotwin_deltaeef_b128_60k

## Resumen

rldx_robotwin_deltaeef_b128_60k es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu en Hugging Face. Se trata de un ajuste fino del modelo base RLWRLD/RLDX-1-PT sobre el conjunto de datos RoboTwin 2.0 (TianxingChen/RoboTwin2.0), y se presenta explícitamente como un "baseline vanilla" para el leaderboard de RoboTwin 2.0 en la configuración de co-entrenamiento (50 tareas x 50 episodios demo_clean, plataforma Aloha-AgileX, exportación oficial de LeRobot).

El modelo recibe como entrada imágenes de tres cámaras (cabeza y muñecas izquierda y derecha), un estado articular de 14 dimensiones y la instrucción de la tarea en lenguaje natural, y produce como salida objetivos articulares absolutos de 14 dimensiones. Con 6.912.896.320 parámetros totales según los pesos en safetensors, es un modelo de escala media-grande orientado a control robótico de manipulación, no a generación de texto general.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para comparar variantes arquitectónicas y de entrenamiento sobre el mismo benchmark (RoboTwin 2.0), y el autor publica checkpoints intermedios (pasos 15000, 30000 y 45000) además del final, lo que facilita análisis de dinámica de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (backbone VLA; video length 4 / stride 2, tres vistas de cámara, horizonte de acción 50) |
| Parámetros totales | 6.912.896.320 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto; el modelo card no detalla cobertura lingüística) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entrada | imágenes head + wrist izquierda/derecha, estado articular 14-d, instrucción de tarea |
| Salida | objetivos articulares absolutos 14-d |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste | TianxingChen/RoboTwin2.0 |
| Tamaño del repo | 165,9 GB |
| Descargas | 27 |
| Fecha de creación | 2026-10-06 |
| Última actualización | 2026-11-07 |

## Arquitectura y entrenamiento

El modelo parte del backbone RLDX-1-PT y se ajusta con un esquema de entrenamiento concreto: batch de 128, 60.000 pasos, con enmascaramiento de ruido por dimensión de relleno (action_noise_mask_dim=14) y dropout de estado de 0,5. La configuración de vídeo usa longitud 4 con stride 2, tres vistas de cámara y un horizonte de acción de 50 pasos. El código de entrenamiento corresponde a RLWRLD/RLDX en la rama myungkyu/jitter-patch (commit 21f674b4). El checkpoint final no incluye el estado del optimizador.

Los datos de ajuste provienen del conjunto RoboTwin 2.0 en la configuración de co-entrenamiento del leaderboard: 50 tareas con 50 episodios demo_clean cada una, sobre la plataforma Aloha-AgileX y con la exportación oficial de LeRobot. El modelo card no detalla el número total de tokens, la composición completa del dataset ni si hubo etapas de RLHF o DPO; esa información no está disponible.

Como innovaciones destacables documentadas, el ajuste incorpora el enmascaramiento de ruido en la dimensión de acción (14) y el dropout de estado a 0,5, además de la separación de checkpoints intermedios con sumas SHA256 por carpeta para verificación de integridad.

## Capacidades

- Control robótico de manipulación mediante predicción de acciones articulares absolutas de 14 dimensiones.
- Fusión multimodal de tres vistas de cámara (cabeza, muñeca izquierda, muñeca derecha) con estado propioceptivo de 14 dimensiones.
- Seguimiento de instrucciones de tarea en lenguaje natural para condicionar la política de control.
- Predicción de secuencias de acción con horizonte de 50 pasos.
- Ajuste específico al benchmark RoboTwin 2.0 en configuración de co-entrenamiento (50 tareas).
- Checkpoints intermedios publicados (pasos 15000, 30000, 45000) para análisis de evolución del entrenamiento.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico, visión general, audio ni modo "thinking"; el modelo card no las menciona y no están disponibles.

## Casos de uso

- Evaluación de referencia en RoboTwin 2.0: usar este checkpoint como baseline vanilla contra el que comparar variantes arquitectónicas o de entrenamiento en las mismas 50 tareas y condiciones demo_clean, garantizando comparaciones reproducibles.
- Investigación en políticas VLA: analizar cómo influyen el enmascaramiento de ruido por dimensión y el dropout de estado (0,5) en el rendimiento de manipulación, comparando con variantes sin esas técnicas.
- Estudio de dinámica de entrenamiento: los checkpoints de los pasos 15000, 30000 y 45000 permiten trazar curvas de mejora y detectar mesetas o sobreajuste a lo largo de los 60.000 pasos.
- Reproducción de experimentos: el autor documenta el commit exacto del código (myungkyu/jitter-patch 21f674b4), lo que permite reproducir el pipeline de ajuste sobre el dataset público RoboTwin 2.0.
- Manipulación bimanual en simulación Aloha-AgileX: el modelo produce objetivos articulares de 14 dimensiones a partir de tres vistas y estado, adecuado para tareas de coordinación de dos brazos en entornos simulados.
- Integración en pipelines LeRobot: al emplear la exportación oficial de LeRobot, el checkpoint puede cargarse en flujos de evaluación estándar de la comunidad para contrastar resultados con otros modelos del leaderboard.
- Descarga selectiva para experimentos: la API de Hugging Face permite descargar solo un checkpoint intermedio (allow_patterns) o solo el final (ignore_patterns), lo que reduce el coste de almacenamiento en pruebas puntuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 6.912.896.320 parámetros en safetensors, una estimación orientativa en FP16 rondaría los 13-14 GB solo de pesos, y en BF16 un valor similar; no obstante, esta cifra es una estimación de orden de magnitud y no un dato publicado.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar viabilidad en GPUs de 24 GB o más en precisión reducida, pero el modelo card no especifica requisitos.
- ¿Cabe en GPU consumer? No confirmado. El tamaño de pesos en FP16 (aprox. 13-14 GB) sugeriría que podría caber en tarjetas de 24 GB (RTX 3090/4090) en teoría, pero no hay validación publicada ni datos de memoria real de inferencia con las tres cámaras y el horizonte de 50.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al ser un modelo robótico VLA, estos runners genéricos de texto no serían el canal habitual.
- Latencia y throughput: no disponible.
- Tamaño del repositorio: 165,9 GB, lo que incluye pesos y checkpoints intermedios; conviene planificar almacenamiento antes de la descarga completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Myungkyu/rldx_robotwin_deltaeef_b128_60k | 6.912.896.320 | no disponible | no disponible | no disponible | Hugging Face, 27 descargas |
| Myungkyu/rldx2_pi05_robotwin_deltaeef_b128_60k | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Myungkyu/rldx2_rldx_robotwin_vanilla_b128_60k | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| RLWRLD/RLDX-1-PT (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Los dos modelos comparables encontrados en la búsqueda web son variantes del mismo autor para el proyecto RLDX-2, con la misma configuración de co-entrenamiento sobre RoboTwin 2.0 (50 tareas x 50 episodios demo_clean, Aloha-AgileX, exportación LeRobot). No se dispone de datos de parámetros, contexto ni benchmarks para esas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de propósito específico: es una política VLA para manipulación robótica en RoboTwin 2.0, no un modelo de lenguaje general; no debe esperarse generación de texto, razonamiento o código.
- Licencia no disponible: no se indica licencia en el model card ni en los metadatos, por lo que el uso comercial queda sin marco claro y requiere contactar con el autor antes de cualquier despliegue productivo.
- Sesgos: no documentados. Al entrenarse sobre 50 tareas concretas de un benchmark simulado, el comportamiento fuera de esa distribución (tareas, objetos o plataformas distintas) no está caracterizado.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de predicciones de acción no válidas o fuera de rango fuera del dominio de entrenamiento; no se documentan métricas de robustez.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible y la cobertura lingüística de las instrucciones de tarea no se especifica.
- Dependencia del simulador: entrenado sobre la exportación oficial de LeRobot de RoboTwin 2.0 con Aloha-AgileX; el traslado a hardware real no está validado en la información disponible.
- Checkpoint final sin estado del optimizador: no es reanudable para continuar el entrenamiento desde el paso 60.000 sin reconstruir el estado.
- Tamaño de descarga elevado (165,9 GB con checkpoints intermedios): conviene usar descargas selectivas para evitar consumo innecesario de almacenamiento.
- Adopción baja (27 descargas, 0 likes): no hay evidencia comunitaria de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldx_robotwin_deltaeef_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset de ajuste: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
- Variante RLDX-2 con pi05: https://huggingface.co/Myungkyu/rldx2_pi05_robotwin_deltaeef_b128_60k
- Variante RLDX-2 vanilla: https://huggingface.co/Myungkyu/rldx2_rldx_robotwin_vanilla_b128_60k
- Código de entrenamiento (referenciado en el model card): RLWRLD/RLDX, rama myungkyu/jitter-patch, commit 21f674b4 (no se dispone de URL directa en la información proporcionada)
