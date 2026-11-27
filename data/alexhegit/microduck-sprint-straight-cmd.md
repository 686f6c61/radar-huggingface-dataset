# alexhegit/microduck-sprint-straight-cmd

## Resumen

Microduck-sprint-straight-cmd es una política de control para robot caminante (locomoción) entrenada mediante aprendizaje por refuerzo (PPO) sobre el simulador MuJoCo. La desarrolla el usuario alexhegit y se publica como un controlador de la familia `microduck-policy`, orientada a competiciones de robots tipo Microduck dentro de la Microduck Arena. El modelo resuelve la tarea concreta de ejecutar un sprint en línea recta con control de rumbo en bucle cerrado (closed-loop heading) para el evento `hill-climb-1m5` de la citada arena.

El artefacto no es un modelo de lenguaje ni un transformer generativo, sino una política neuronal de robótica exportada a formato ONNX. Recibe 61 observaciones como entrada y emite 14 objetivos de posición articular como salida, ejecutándose a 50 Hz. El entrenamiento se realizó con PPO en MuJoCo usando el repositorio `microduck_rl_unilab` y una GPU AMD con ROCm.

Su relevancia es acotada pero específica: sirve como referencia reproducible de un controlador de locomoción para un robot caminante de bajo coste, y como ejemplo de entrenamiento de políticas RL en hardware AMD ROCm. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere un artefacto de pesos muy ligero o potencialmente vacío.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (entrenada con PPO); arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); ventana de observación de 61 valores |
| Tipos de cuantizacion | no disponible (exportado a ONNX; cuantización no documentada) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La model card indica que se trata de una política entrenada con PPO (Proximal Policy Optimization) sobre el simulador MuJoCo, mediante el repositorio `microduck_rl_unilab`. La tarea es un sprint en línea recta con control de rumbo en bucle cerrado, identificada como `sprint_straight_cmd/model_32250`, lo que sugiere un checkpoint del paso o iteración 32250. El entrenamiento se ejecutó en una GPU AMD con ROCm.

La política mapea 61 observaciones a 14 objetivos de posición articular y opera a 50 Hz, lo que es coherente con un bucle de control de bajo nivel para un robot caminante de tipo Microduck. No se especifica en la información disponible la topología de red (número de capas, unidades ocultas), el número de pasos de entrenamiento totales, la composición del entorno de recompensa ni si hubo fases de ajuste posteriores. El nombre del título de la model card (`hill-straight-rocm`) y el tag `microduck-policy` confirman la familia y el contexto de competición.

## Capacidades

- Control de locomoción de un robot caminante Microduck: genera 14 objetivos de posición articular a partir de 61 observaciones.
- Sprint en línea recta con corrección de rumbo en bucle cerrado (closed-loop heading).
- Ejecución en tiempo real a 50 Hz, adecuada para bucles de control de bajo nivel.
- Exportación a ONNX, lo que permite inferencia en runtimes compatibles con ONNX (onnxruntime, etc.).
- Entrenada específicamente para el evento `hill-climb-1m5` de la Microduck Arena.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Controlador de referencia para el robot Microduck en simulación: se carga la política ONNX en MuJoCo y se ejecuta a 50 Hz para reproducir el sprint en línea recta con corrección de rumbo, útil para validar el pipeline de simulación antes de transferir a hardware.
- Participación en la Microduck Arena (evento `hill-climb-1m5`): la política está entrenada para esa prueba concreta y puede presentarse directamente como controlador del robot en la competición.
- Base para fine-tuning de políticas de locomoción: al estar entrenada con PPO y `microduck_rl_unilab`, sirve como punto de partida para entrenar variantes (giros, terrenos irregulares) reutilizando el mismo espacio de observación y acción.
- Evaluación de inferencia ONNX en hardware embebido: al ser un artefacto ONNX ligero, permite medir latencia y throughput de la política en CPUs o aceleradores de borde antes de desplegarla en el robot real.
- Reproducción de experimentos de RL en AMD ROCm: documenta un caso de entrenamiento PPO con MuJoCo sobre GPU AMD, útil para equipos que quieran replicar el flujo con ROCm.
- Benchmark de control en bucle cerrado: sirve para comparar estrategias de control de rumbo (bucle abierto frente a cerrado) en un robot caminante de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que sugiere un artefacto muy pequeño, pero no se confirma el tamaño real de los pesos.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una GPU AMD con ROCm, pero no se especifica el modelo concreto.
- ¿Cabe en GPU de consumo? No disponible con certeza; por el tamaño declarado del repositorio (0.0 GB) es plausible que la inferencia quepa en CPU, pero no está documentado.
- Opciones de despliegue: ONNX Runtime (formato de pesos ONNX); otros runtimes compatibles con ONNX no documentados. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a una política de control).
- Latencia y throughput estimados: no disponible. La política opera a 50 Hz, lo que implica un presupuesto de 20 ms por paso de control, pero no se publican mediciones reales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas comparables de la familia `microduck-policy` ni métricas para establecer una comparación (parámetros, contexto, rendimiento).

## Limitaciones y advertencias

- Es una política específica para una tarea (sprint en línea recta con control de rumbo) y un robot concreto (Microduck); no es un modelo generalista ni reutilizable fuera de ese dominio sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingües ni de razonamiento simbólico.
- No se documentan sesgos, pero al ser una política RL entrenada en simulación puede presentar comportamientos frágiles ante distribuciones de observación no vistas (sim-to-real gap).
- Riesgo de alucinación no aplica en el sentido lingüístico; el riesgo equivalente es la generación de acciones fuera de rango ante estados no observados durante el entrenamiento.
- El repositorio tiene 0 descargas, 0 likes y tamaño de 0.0 GB, lo que puede indicar que los pesos no están efectivamente publicados o que el artefacto es mínimo; conviene verificar la integridad de los ficheros antes de usarlo.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero no se documentan garantías ni condiciones adicionales del autor.
- No se especifican los idiomas soportados ni datos de entrenamiento detallados, lo que limita la reproducibilidad del experimento.

## Enlaces

- Hugging Face: https://huggingface.co/alexhegit/microduck-sprint-straight-cmd
- Repositorio de entrenamiento (microduck_rl_unilab): https://github.com/rocPAI-Forge/microduck_rl_unilab
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
