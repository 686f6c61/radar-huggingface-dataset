# Metric-AI/roboeval-bimanual-2026

## Resumen

Metric-AI/roboeval-bimanual-2026 es el conjunto de pesos de la política final presentada por Metric AI Lab al CoRL 2026 RoboEval Diagnostic Bimanual Challenge (Track 2), donde quedó entre los tres ganadores con un RoboEval Diagnostic Score (RDS) de 0,986. No es un modelo de lenguaje ni un modelo fundacional generativo: es un artefacto de robótica compuesto por redes de pose y políticas de imitación entrenadas para manipulación bimanual sobre robots tipo Franka Panda en el simulador MuJoCo.

El repositorio (1,4 GB) contiene siete redes de estimación de pose (encoder ResNet-18 más una MLP) y varias políticas completamente aprendidas (`policy.pt` y `policy_1.pt` a `policy_8.pt`), además de un fichero `infer.json` que define, por tarea, qué red de pose o política se combina con qué controlador scriptado. La política final solo emplea la política aprendida en la tarea LiftTray; el resto de tareas se resuelven mediante combinaciones de pose y control scriptado.

Es relevante ahora porque documenta un enfoque híbrido aprendizaje-scriptado que alcanza puntuaciones casi perfectas en un benchmark diagnóstico de manipulación bimanual, y porque publica pesos y código bajo licencia Apache 2.0, lo que facilita su reproducción y su uso como referencia en investigación de imitación y control robótico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes de pose (encoder ResNet-18 + MLP) y políticas de imitación; combinadas con controladores scriptados por tarea |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El sistema combina dos componentes. Por un lado, siete redes de estimación de pose compuestas por un encoder de imagen ResNet-18 seguido de una MLP, una por tarea. Por otro, políticas de imitación completamente aprendidas (`policy.pt` para uso general y `policy_1.pt` a `policy_8.pt` para tareas concretas). El fichero `infer.json` especifica para cada tarea qué red de pose o política se empareja con qué controlador scriptado, de modo que la solución final es un híbrido entre aprendizaje y control programado.

El entrenamiento se enmarca en el paradigma de imitation learning sobre el simulador MuJoCo con robots Franka Panda bimanuales, dentro del entorno de evaluación RoboEval. La model card no detalla el número de demostraciones, la composición del dataset, ni si se emplearon técnicas de RL o ajuste fino adicional; esos datos no están disponibles.

## Capacidades

- Manipulación bimanual en simulación: ejecución de tareas del benchmark RoboEval Diagnostic Bimanual Challenge.
- Estimación de pose a partir de imágenes mediante redes ResNet-18 + MLP específicas por tarea.
- Políticas de imitación aprendidas para control de robots Franka Panda.
- Combinación configurable de percepción, política y control scriptado por tarea mediante `infer.json`.
- Evaluación diagnóstica con la métrica RDS (RoboEval Diagnostic Score).
- No incluye generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling ni capacidades de agente conversacional.

## Casos de uso

- Reproducción de resultados del challenge: cargar los pesos con `bash scripts/download_weights.sh` y ejecutar la inferencia según `infer.json` para verificar el RDS de 0,986 en el entorno RoboEval.
- Línea base para investigación en manipulación bimanual: usar las políticas y redes de pose como referencia contra la que comparar nuevos métodos de imitation learning.
- Estudio de sistemas híbridos aprendizaje-scriptado: analizar qué tareas resuelve mejor una política aprendida (LiftTray) frente a las que recurren a controladores scriptados.
- Desarrollo de pipelines de percepción para robots: reutilizar las redes ResNet-18 + MLP como módulo de estimación de pose en prototipos con MuJoCo y Franka Panda.
- Evaluación de robustez: someter las políticas a variaciones del entorno simulado para medir su degradación respecto al RDS reportado.
- Docencia y formación: emplear el repositorio como ejemplo completo de entrenamiento, empaquetado de pesos y evaluación en un benchmark de robótica con licencia permisiva.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| CoRL 2026 RoboEval Diagnostic Bimanual Challenge (Track 2) | RoboEval Diagnostic Score (RDS) | 0,986 |

No se han publicado en la información disponible resultados desglosados por tarea ni comparaciones numéricas con otras entradas del challenge.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 1,4 GB, lo que da una cota superior aproximada del espacio en disco necesario para los pesos.
- GPU recomendadas: no especificadas por el autor; al tratarse de inferencia con ResNet-18 y MLP sobre MuJoCo, una GPU consumer moderna es suficiente en principio, aunque no hay datos publicados.
- Compatibilidad con GPU consumer: probable por el tamaño de los componentes, pero no confirmada en la información disponible.
- Opciones de despliegue: PyTorch junto con el código de GitHub y el simulador MuJoCo; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de manipulación bimanual comparables ni sus métricas, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Ámbito restringido: es un artefacto de robótica específico del benchmark RoboEval; no sirve para tareas de lenguaje, visión general ni generación de contenido.
- Dependencia del simulador: entrenado y evaluado en MuJoCo con robots Franka Panda; el rendimiento en hardware real no está documentado.
- Especificidad por tarea: las siete redes de pose y las políticas por tarea están ajustadas a tareas concretas del challenge, lo que limita su generalización a entornos nuevos.
- Dependencia de controladores scriptados: buena parte del rendimiento proviene de control programado, no de aprendizaje, lo que condiciona la portabilidad del enfoque.
- Falta de documentación: no se detallan datos de entrenamiento, sesgos, tasas de alucinación (no aplica) ni métricas por tarea.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; conviene revisar las condiciones del benchmark y de las dependencias (MuJoCo, ResNet-18) antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Metric-AI/roboeval-bimanual-2026
- Código en GitHub: https://github.com/Metric-AI-Lab/roboeval-bimanual-2026
- Challenge CoRL 2026 RoboEval: https://robo-eval.github.io/challenge.html
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
