# RobotControlStack/duobench-act-sim-bin_sort

## Resumen

DuoBench ACT (sim) es una política de imitación basada en la arquitectura ACT (Action Chunking Transformer) desarrollada por RobotControlStack para el benchmark DuoBench de manipulación bimanual. El modelo ejecuta una única tarea, `bin_sort`, sobre el setup bimanual FR3 Duo en simulación, y se ha entrenado exclusivamente con datos sintéticos procedentes de las carpetas `<task>/sim` del dataset DuoBench. Con 51.689.104 parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a robótica, no a generación de lenguaje.

Su relevancia es metodológica más que de rendimiento: forma parte de un conjunto de políticas de referencia (baseline) publicadas junto al benchmark, lo que permite reproducir experimentos y comparar futuras propuestas sobre el mismo entorno y las mismas métricas. La política consume tres cámaras (cabeza y dos muñecas a 224x224) y un estado de 16 dimensiones, y emite acciones conjuntas y de pinza también de 16 dimensiones mediante chunking de acciones.

Conviene subrayar desde el principio que el propio autor advierte de que el modelo no está pensado para el robot real y que su tasa de éxito en simulación es muy baja (0,7 % sobre 300 rollouts). Se trata, por tanto, de un artefacto de investigación reproducible, no de un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación |
| Parámetros totales | 51.689.104 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por el chunk de acciones de 100 pasos) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales y propioceptivas. El modelo recibe tres flujos de imagen de 224x224 (`head`, `left_wrist`, `right_wrist`) junto con un vector de estado de 16 dimensiones (2 x 7 articulaciones más 2 pinzas) y produce una acción de 16 dimensiones. El chunking de acciones es de 100 pasos, lo que reduce la frecuencia efectiva de inferencia y suaviza la ejecución.

El entrenamiento se realizó desde cero con LeRobot en el commit `c8ce413d`, usando 50 demostraciones por tarea de las carpetas de simulación del dataset DuoBench, durante 150.000 pasos con batch size 64, learning rate 1e-5 y semilla 1000. La configuración completa está en `train_config.json`. No se documenta en la información disponible el uso de RLHF, DPO ni de aumentos de datos adicionales; el pipeline es de imitación supervisada sobre demostraciones.

## Capacidades

- Ejecución de una única tarea de manipulación bimanual: `bin_sort` en el entorno simulado FR3 Duo de DuoBench.
- Fusión de tres vistas de cámara (cabeza y dos muñecas) con estado propioceptivo de 16 dimensiones.
- Predicción de acciones conjuntas y de pinza en chunks de 100 pasos.
- Integración nativa con LeRobot mediante `ACTPolicy.from_pretrained`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye visión general: las cámaras son entradas de control motor, no un módulo de percepción semántica reutilizable.

## Casos de uso

- Reproducción de baselines en DuoBench: cargar la política con LeRobot y evaluarla sobre los mismos seeds (0-299) para validar la infraestructura de simulación antes de probar métodos propios.
- Comparación controlada de nuevas políticas: al ser una política de referencia con configuración y commit fijados, sirve como punto de partida para medir mejoras en la tarea `bin_sort` bajo el mismo protocolo de 300 rollouts.
- Depuración de pipelines de evaluación bimanual: su baja tasa de éxito permite comprobar que las métricas detectan fallos y que el entorno no está sesgado al éxito.
- Estudio de transferencia sim-to-real: aunque el autor desaconseja su uso en robot real, puede emplearse como caso negativo para analizar qué falla al trasladar políticas entrenadas solo en simulación.
- Docencia e investigación en imitación visual-motora: ejemplo compacto (51,7 M de parámetros) de ACT con múltiples cámaras y estado propioceptivo, adecuado para prácticas de aprendizaje por imitación.
- Pruebas de integración con LeRobot: validar la compatibilidad de versiones y el flujo `from_pretrained` en un modelo pequeño y de descarga rápida (0,2 GB).
- Benchmarking de infraestructura de inferencia robótica: medir latencia de carga y de paso en distintos hardwares con un modelo de tamaño reducido.

## Benchmarks y rendimiento

Resultados publicados por el autor en simulación DuoBench, 300 rollouts por tarea (seeds 0-299), con intervalo de Wilson al 95 %:

| Tarea | Tasa de éxito (%) | IC 95 % |
|---|---|---|
| bin_sort | 0,7 | [0,2, 2,4] |

No se han publicado en la información disponible resultados comparativos con otras políticas (por ejemplo, difusión o VLA) sobre las mismas tareas, ni métricas de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parámetros, más el coste de los tres flujos de imagen a 224x224; en la práctica, un entorno de simulación con renderizado suele dominar el consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para el modelo; el cuello de botella real es el simulador (por ejemplo, Isaac Sim o MuJoCo con renderizado), que puede requerir una GPU dedicada de gama media-alta.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores; también es viable en CPU para inferencia del modelo, aunque no para el simulador a tiempo real.
- Opciones de despliegue: LeRobot (commit `c8ce413d`) como vía oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoBench ACT (sim) | 51.689.104 | chunk de 100 acciones | bin_sort (bimanual, sim) | Apache 2.0 | Hugging Face, LeRobot |
| Otras políticas DuoBench (difusión, VLA) | no disponible | no disponible | mismas tareas DuoBench | no disponible | no disponible en la información proporcionada |
| Políticas ACT genéricas de LeRobot | variable | variable | tareas de manipulación diversas | variable | Hugging Face |

No se dispone en la información proporcionada de cifras de rendimiento de alternativas comparables sobre DuoBench, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Entrenado solo con datos de simulación: el autor indica explícitamente que no está pensado para el robot real.
- Tasa de éxito muy baja (0,7 %, IC 95 % [0,2, 2,4]): no es adecuado como solución funcional, sino como baseline.
- Política de tarea única: no generaliza a otras tareas de DuoBench ni a variaciones del entorno no vistas en las 50 demostraciones.
- Requiere una versión de LeRobot compatible con el commit `c8ce413d`; versiones distintas pueden fallar al cargar.
- Riesgo de sobreajuste a las condiciones de simulación (iluminación, texturas, dinámica) y de fallo silencioso fuera de ellas.
- No se documentan sesgos demográficos ni de otro tipo, pero tampoco análisis de robustez ante cambios de cámara o calibración.
- Licencia Apache 2.0: permite uso comercial del código y pesos, pero la falta de validación en robot real desaconseja cualquier despliegue físico sin evaluación previa.
- No dispone de mecanismos de seguridad, parada de emergencia ni verificación de acciones; en un robot real requeriría capas externas de supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotControlStack/duobench-act-sim-bin_sort
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench (arXiv): https://arxiv.org/abs/2606.11901
- Página del proyecto: https://duobench.github.io/
- Código de DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit de entrenamiento): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
- Repositorio LeRobot: https://github.com/huggingface/lerobot
