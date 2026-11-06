# RobotControlStack/duobench-act-sim-ball_maze

## Resumen

DuoBench ACT (sim) es una política de control robótico basada en la arquitectura ACT (Action Chunking with Transformers) entrenada desde cero con LeRobot para la tarea de simulación `ball_maze` del benchmark DuoBench, orientado a manipulación bimanual con el montaje FR3 Duo. El modelo lo desarrolla RobotControlStack y se publica con licencia Apache 2.0 como un checkpoint de referencia reproducible dentro de un benchmark académico, no como un modelo de propósito general.

El problema que aborda es la falta de políticas de referencia reproducibles y auditables para tareas de manipulación bimanual. DuoBench propone un conjunto de tareas evaluadas tanto en simulación como en el mundo real, y este checkpoint cubre exclusivamente la variante simulada de `ball_maze` con 50 demostraciones por tarea. Con 51.689.104 parámetros (aproximadamente 51,7 M) y un repositorio de 0,2 GB, es un modelo compacto que se ejecuta en hardware modesto.

Su relevancia actual es metodológica: sirve como línea base pública para comparar políticas de imitación en manipulación bimanual y para verificar la reproducibilidad del pipeline de entrenamiento de LeRobot. El rendimiento publicado es bajo (8,0 % de éxito sobre 300 rollouts), lo que lo convierte en un punto de partida honesto más que en una solución desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.689.104 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | 3 cámaras (`head`, `left_wrist`, `right_wrist`) a 224x224 y estado de 16 dimensiones (2 x 7 articulaciones + 2 pinzas) |
| Salidas | acción de 16 dimensiones (articulaciones y pinzas) |
| Chunk de acción | 100 pasos |
| Librería | LeRobot (commit `c8ce413d`) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice trozos de acción (action chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación de horizonte largo. El modelo consume tres flujos visuales de 224x224 píxeles (`head`, `left_wrist`, `right_wrist`) junto con un vector de estado de 16 dimensiones que codifica las siete articulaciones de cada brazo y el estado de ambas pinzas, y produce un chunk de 100 acciones de 16 dimensiones.

El entrenamiento se realizó desde cero con LeRobot sobre 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset DuoBench, con 150.000 pasos, batch size de 64, learning rate de 1e-5 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste por preferencias; se trata de aprendizaje por imitación supervisado puro. La configuración completa está en `train_config.json` y el modelo requiere una versión de LeRobot compatible con el commit `c8ce413d` para cargarse correctamente.

## Capacidades

- Control robótico bimanual: genera comandos de articulación y pinza para el montaje FR3 Duo en la tarea simulada `ball_maze`.
- Fusión multisensorial visual: integra tres cámaras simultáneas (vista cenital y una muñeca por brazo).
- Predicción por chunks: emite secuencias de 100 acciones, lo que aporta suavidad temporal en la ejecución.
- Política de tarea única: especializada exclusivamente en `ball_maze` en simulación; no generaliza a otras tareas del benchmark.
- Sin tool calling, sin function calling y sin razonamiento multi-paso simbólico.
- Sin capacidades multilingües, de visión general, de audio ni de generación de texto.
- Sin modo de razonamiento explícito (thinking mode).

## Casos de uso

- Línea base reproducible en investigación: sirve para comparar nuevas políticas de imitación contra un checkpoint público con protocolo de evaluación documentado (300 rollouts, semillas 0-299, intervalo de Wilson al 95 %).
- Validación de pipelines de LeRobot: permite comprobar que una instalación concreta de LeRobot carga y ejecuta correctamente una política ACT antes de entrenar modelos propios.
- Desarrollo de entornos de simulación: útil para integrar y depurar la tarea `ball_maze` del simulador de DuoBench con una política que produce acciones válidas de 16 dimensiones.
- Estudio de acción chunking: al fijar el chunk en 100, permite analizar empíricamente el efecto del horizonte de predicción en tareas bimanuales de precisión.
- Reproducción de experimentos académicos: el `train_config.json` y la semilla documentada permiten replicar el entrenamiento y verificar la variabilidad entre ejecuciones.
- Docencia en robótica de imitación: ejemplo compacto (51,7 M de parámetros, 0,2 GB) para ilustrar el ciclo completo de datos de demostración, entrenamiento y evaluación en simulación.
- Referencia para ablaciones de datos: al usar exactamente 50 demostraciones, sirve de control al estudiar el efecto de aumentar el número de demostraciones.

## Benchmarks y rendimiento

Resultados publicados por el autor en simulación de DuoBench, 300 rollouts por tarea (semillas 0-299) con intervalo de confianza de Wilson al 95 %:

| Tarea | Tasa de éxito (%) | IC 95 % |
|---|---|---|
| ball_maze | 8,0 | [5,4; 11,6] |

No se han publicado en la información disponible resultados comparativos con otras políticas en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en precisión nativa, los pesos ocupan del orden de 0,2 GB, por lo que la mayor parte del consumo proviene de los tres flujos de imagen a 224x224 y de los buffers de inferencia.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería alojar el modelo y el procesamiento visual.
- GPU de consumo: cabe previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores; no hay confirmación oficial en la información disponible.
- Opciones de despliegue: LeRobot en el commit `c8ce413d` mediante `ACTPolicy.from_pretrained`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoBench ACT (sim) `ball_maze` | 51,7 M | chunk de 100 acciones | `ball_maze` en simulación | Apache 2.0 | Hugging Face |
| Otras políticas ACT de DuoBench | no disponible | no disponible | otras tareas del benchmark | Apache 2.0 (según repositorio) | no disponible en la información proporcionada |
| Políticas de imitación comparables (p. ej. Diffusion Policy) | no disponible | no disponible | manipulación bimanual | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de alternativas evaluadas bajo el mismo protocolo, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulación: el propio autor indica que no está pensado para el robot real.
- Tasa de éxito baja (8,0 %), con un intervalo de confianza que abarca de 5,4 % a 11,6 %; no es adecuado como componente de producción.
- Política de tarea única: no generaliza a otras tareas de DuoBench ni a variaciones del entorno no vistas.
- Dependencia estricta de la versión de LeRobot: la carga requiere compatibilidad con el commit `c8ce413d`; versiones distintas pueden fallar.
- Riesgo de sobreajuste a las 50 demostraciones disponibles por tarea.
- Sin información publicada sobre sesgos, robustez ante cambios de iluminación, texturas o posiciones iniciales.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su valor práctico fuera de investigación y evaluación es muy limitado.
- No se documentan limitaciones idiomáticas ni de contexto porque el modelo no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotControlStack/duobench-act-sim-ball_maze
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench (arXiv): https://arxiv.org/abs/2606.11901
- Página del proyecto: https://duobench.github.io/
- Código de DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit de referencia): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
