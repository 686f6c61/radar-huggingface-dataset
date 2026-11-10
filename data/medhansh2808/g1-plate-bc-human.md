# medhansh2808/g1-plate-bc-human

## Resumen

G1 plate-transfer BC es una política de imitación (behaviour cloning) para robótica manipulativa entrenada sobre el simulador BiGym2 y el robot humanoide Unitree G1. El modelo resuelve la tarea `move_plate`, que consiste en transferir un plato entre posiciones dentro de un entorno simulado. Lo desarrolla el usuario medhansh2808 y se publica como baseline con licencia Apache 2.0, con un tamaño de repositorio de 0,1 GB.

La arquitectura es deliberadamente sencilla: un ResNet18 compartido entre tres cámaras a resolución 84x84, concatenado con propriocepción, que produce chunks de 20 acciones mediante una política `ChunkPolicy`. Se entrena con pérdida L1 durante 30.000 pasos exclusivamente con 60 demostraciones humanas del conjunto `move_plate` de BiGym2.

El resultado declarado es de 15/30 (50 %) en un protocolo balanceado de 30 ensayos, con todos los fallos por timeout y ninguno por caída. El propio autor lo presenta explícitamente como un baseline que no alcanza el objetivo del 90 %, y lo acompaña de un modelo hermano (humano + experto) que alcanza el 73 %. Es relevante como referencia reproducible para estudiar el efecto de la composición del dataset de demostraciones en políticas de imitación sobre humanoides simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 compartido sobre 3 cámaras (84x84) + propriocepción, cabeza de política con chunks de 20 acciones (`ChunkPolicy`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (PyTorch), con pesos, media/desviación del estado y argumentos de entrenamiento |

## Arquitectura y entrenamiento

La política combina percepción visual y propriocepción. Tres cámaras se procesan con un ResNet18 cuyos pesos se comparten entre vistas, a resolución 84x84; la representación resultante se concatena con el estado propioceptivo del robot y se pasa a una cabeza que emite chunks de 20 acciones. El entrenamiento usa pérdida L1 sobre esos chunks durante 30.000 pasos.

El dataset de entrenamiento son únicamente 60 demostraciones humanas de la tarea `move_plate` de BiGym2, sin datos de un controlador experto. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de ajuste. El modelo hermano (humano + experto) sugiere que la composición del dataset es la variable técnica central explorada por el autor.

## Capacidades

- Generación de acciones motrices para el humanoide Unitree G1 en la tarea `move_plate` del simulador BiGym2.
- Política de imitación con salida en chunks de 20 acciones, lo que reduce la frecuencia de replanificación.
- Percepción visual multivista (tres cámaras) con extractor compartido.
- Integración de propriocepción junto con la observación visual.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Baseline reproducible para investigación en imitación: sirve como referencia de partida para medir mejoras al añadir datos expertos, cambiar la arquitectura o ajustar el protocolo de evaluación en `move_plate`.
- Estudio del efecto de la composición del dataset: comparar este modelo (solo humano, 50 %) con el hermano humano + experto (73 %) permite aislar la contribución de las demostraciones expertas.
- Evaluación de políticas en simulación con protocolos balanceados: el protocolo de 30 ensayos con semillas fijas (7.310.000+) y 5 ensayos por slot de origen facilita comparaciones entre ejecuciones.
- Análisis de modos de fallo: al ser todos los fallos timeouts y ninguno caídas, es útil para estudiar planificación temporal y velocidad de ejecución en lugar de estabilidad del robot.
- Punto de partida para transferencia sim-a-real: al operar sobre el modelo Unitree G1, puede servir como base para experimentos de despliegue en el humanoide físico, aunque no se documenta validación en hardware.
- Docencia y prototipado rápido: su tamaño reducido (0,1 GB) y su licencia Apache 2.0 permiten usarlo en cursos y entornos con recursos limitados para ilustrar behaviour cloning con visión y propriocepción.

## Benchmarks y rendimiento

| Protocolo | Resultado | Detalle |
|---|---|---|
| 30 ensayos balanceados (semillas 7.310.000+, 5 por slot de origen) | 15/30 (50 %) | Todos los fallos son timeouts; ninguno es caída |
| Objetivo declarado del autor | 90 % | No alcanzado |
| Modelo hermano (humano + experto) | 73 % | Referencia comparativa citada en la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeño que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponible; por el tamaño del artefacto, cualquier GPU con soporte PyTorch y al menos unos pocos GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, aunque no se documenta una cifra concreta.
- Opciones de despliegue: carga directa en PyTorch mediante `model.py` (`ChunkPolicy`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Datos de entrenamiento | Resultado en `move_plate` | Licencia |
|---|---|---|---|---|
| G1 plate-transfer BC (este) | ResNet18 + propriocepción, chunks de 20 acciones | 60 demos humanas | 15/30 (50 %) | Apache 2.0 |
| Modelo hermano del mismo autor | Misma arquitectura (presumiblemente) | Humanas + experto | 73 % | no disponible |
| Otras políticas BiGym2 | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otras políticas comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Rendimiento insuficiente para el objetivo: 50 % frente al 90 % declarado; el autor lo califica explícitamente como baseline y no como solución.
- Todos los fallos son timeouts, lo que indica problemas de finalización de la tarea más que de estabilidad física.
- Entrenado exclusivamente con 60 demostraciones humanas, sin datos de experto; la cobertura del espacio de estados es limitada.
- Evaluado solo en simulación (BiGym2); no se documenta validación en el robot Unitree G1 físico.
- No se documentan sesgos, riesgos de alucinación ni comportamiento fuera de la tarea `move_plate`; el modelo no es generalista.
- Sin información sobre idiomas, cuantización ni rendimiento fuera del protocolo de 30 ensayos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en producción y el bajo rendimiento desaconsejan su despliegue directo sin ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/medhansh2808/g1-plate-bc-human
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
