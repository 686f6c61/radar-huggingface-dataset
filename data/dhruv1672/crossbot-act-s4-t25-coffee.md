# dhruv1672/crossbot-act-s4-t25-coffee

## Resumen

Cross-Bot ACT S4 es una política de robótica basada en la arquitectura ACT (Action Chunking with Transformers) entrenada desde cero con LeRobot 0.7.0 para ejecutar una única habilidad en un entorno simulado: mover una taza de la mesa a la bandeja. El modelo forma parte de la tesis de máster Cross-Bot de la San José State University y se utiliza como línea base frente a π0.5 en una estación de café bimanual con brazos xArm-7 simulados en Isaac Sim 6.0.1.

El modelo tiene 51.689.104 parámetros y un tamaño de repositorio de 0,2 GB, lo que refleja un diseño compacto orientado a control robótico más que a generación de lenguaje. Se entrenó sobre 22 episodios de demostraciones scriptadas con cuRobo (25 % de la muestra del dataset `dhruv1672/crossbot-serve100-rgb-train`), con cámaras RGB y estado articular como entradas, y produce objetivos articulares absolutos en chunks de 100 acciones.

Su relevancia es acotada pero útil: documenta de forma honesta el estado de una política de imitación en simulación, incluido un resultado de 0/5 en la comprobación en bucle cerrado sobre escenas de entrenamiento. Nunca se ha ejecutado en hardware real, por lo que debe tratarse como material de investigación y no como componente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), entrenada desde cero con LeRobot 0.7.0 |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; ventana de observación no especificada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un codificador visual, un codificador de estado y un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales. En este caso el chunk es de 100 pasos y las acciones son objetivos articulares absolutos para los brazos xArm-7 bimanuales. La entrada combina cámaras RGB e información de estado articular (posiciones de las articulaciones).

El entrenamiento se realizó durante 30.000 pasos con batch de 8 y tasa de aprendizaje de 1e-5, sobre 22 episodios de la habilidad S4 extraídos del dataset de demostraciones scriptadas con cuRobo. No se registró pérdida de validación durante el entrenamiento. No se menciona uso de RLHF, DPO ni ningún otro ajuste posterior; es imitación supervisada pura sobre datos de un planificador.

La model card documenta limitaciones relevantes del dataset: el planificador registra la misma postura con articulaciones separadas 2π (wrap articular), existen varios modos posturales por habilidad desde la misma pose inicial, faltan fotogramas de parada en la mayoría de demostraciones S2 y S3, y no hay datos de recuperación porque todas las demostraciones son ejecuciones exitosas.

## Capacidades

- Control robótico de una única habilidad: mover una taza de la mesa a la bandeja (S4) en la estación de café simulada.
- Predicción de chunks de 100 acciones articulares absolutas para brazos xArm-7 bimanuales.
- Procesamiento de observaciones multimodales: imágenes RGB de cámaras y estado articular.
- Ejecución en bucle cerrado dentro de Isaac Sim 6.0.1 (con resultado 0/5 en escenas de entrenamiento).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Línea base de comparación en investigación: sirve para contrastar el rendimiento de políticas ACT frente a modelos como π0.5 en la misma tarea simulada, gracias a que comparte entorno y protocolo de evaluación.
- Reproducción de experimentos de imitación: permite estudiar cómo se comporta una política entrenada con pocos episodios (22) y sin datos de recuperación en una habilidad de manipulación concreta.
- Análisis de fallos en bucle cerrado: el resultado 0/5 documentado facilita investigar el desajuste entre el entrenamiento offline y la ejecución cerrada, un problema clásico en políticas de imitación.
- Docencia y divulgación: ejemplo compacto (51,7 M de parámetros, 0,2 GB) de un pipeline LeRobot completo, desde dataset hasta política desplegable en simulación.
- Estudio de calidad de datos: las limitaciones documentadas (wrap articular, modos posturales múltiples, falta de fotogramas de parada) permiten experimentar con limpieza y aumento del dataset.
- Prototipado de estaciones bimanuales en Isaac Sim: referencia para construir entornos de café con xArm-7 y evaluar habilidades por etapas con un arnés de evaluación reutilizable.
- Validación de arneses de evaluación: el hecho de que la reproducción de acciones grabadas funcione 5/5 en S1 demuestra que el harness es correcto y sirve como prueba de regresión de la infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento reportado es la comprobación en bucle cerrado: 0/5 éxitos en 5 escenas de entrenamiento para la habilidad S4, frente a 5/5 al reproducir las acciones grabadas en S1. No se han publicado métricas de MMLU, HumanEval, GSM8K ni equivalentes, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 51,7 M de parámetros en precisión de entrenamiento (fp32) el peso ocupa aproximadamente 0,2 GB, por lo que cualquier GPU con 2-4 GB de VRAM es suficiente para la política.
- GPU recomendadas: no se especifican en la información disponible; cualquier GPU moderna (RTX 3060 o superior) es más que suficiente para la inferencia de la política.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual; el cuello de botella real es el simulador Isaac Sim, que sí requiere una GPU con soporte RTX y varios GB de VRAM.
- Opciones de despliegue: LeRobot 0.7.0 para carga de la política; Isaac Sim 6.0.1 para el entorno simulado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cross-Bot ACT S4 (este modelo) | 51,7 M | no disponible | 0/5 en bucle cerrado (escenas de entrenamiento) | Apache 2.0 | Hugging Face |
| π0.5 (referencia de la tesis) | no disponible | no disponible | no disponible en la información | no disponible | no disponible |
| Otras políticas ACT de LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo identifica π0.5 como modelo de comparación dentro de la tesis, sin datos de rendimiento publicados para esa comparación. No se dispone de cifras de parámetros, contexto ni resultados del resto de alternativas.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que el modelo nunca se ha ejecutado en hardware real.
- Rendimiento nulo en bucle cerrado: 0/5 éxitos en las propias escenas de entrenamiento para S4, lo que indica que la política no reproduce correctamente su comportamiento incluso en condiciones vistas.
- Sin datos de validación: no se registró pérdida de validación durante el entrenamiento, lo que impide detectar sobreajuste de forma cuantitativa.
- Datos de entrenamiento limitados y sesgados: solo 22 episodios, todos exitosos y generados por un planificador scriptado, sin datos de recuperación ante fallos.
- Inconsistencias en el dataset: wrap articular de 2π, múltiples modos posturales por habilidad y falta de fotogramas de parada en las demostraciones S2 y S3.
- Sin capacidades de lenguaje ni multilingües: no es aplicable para tareas de texto, código o razonamiento.
- Especialización extrema: la política solo cubre la habilidad S4; no generaliza a otras etapas de la estación de café.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de generar trayectorias no válidas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de validación en hardware y el rendimiento reportado desaconsejan cualquier uso en producción.
- Escasez de tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhruv1672/crossbot-act-s4-t25-coffee
- Dataset de entrenamiento: https://huggingface.co/datasets/dhruv1672/crossbot-serve100-rgb-train
- LeRobot: https://github.com/huggingface/lerobot
- Isaac Sim: https://developer.nvidia.com/isaac/sim
- cuRobo: https://curobo.org/
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
- Blog o demo del proyecto Cross-Bot: no disponible en la información proporcionada
