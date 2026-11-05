# iseonn/mock_test

## Resumen

`iseonn/mock_test` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705 y popularizado por la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que recibe el estado articular del robot y dos cámaras (muñeca y cenital) y emite un vector de 7 dimensiones de acción. El repositorio lo publica el usuario `iseonn` con licencia Apache 2.0 y un total de 51.670.663 parámetros en formato safetensors.

El modelo está entrenado sobre el dataset `iseonn/mock_test_clean`, compuesto por 10 episodios y 8.287 fotogramas a 30 FPS para una única tarea denominada "pickup2". El robot objetivo es un `so_follower` (brazo tipo SO-100/SO-101 de LeRobot) con dos cámaras de 480x640. El nombre del repositorio, `mock_test`, y el escaso volumen de datos sugieren un artefacto de prueba o validación de pipeline más que una política lista para producción.

Su relevancia es acotada: sirve como ejemplo reproducible de entrenamiento ACT con LeRobot 0.6.1, como referencia para integraciones con `lerobot-rollout` y como caso de estudio de los requisitos de datos (10 episodios, 13.000 pasos, batch 8) para una tarea de manipulación simple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visuomotora con historial de observaciones fijo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `wrist`, `top` (3x480x640 cada una) |
| Entrada de estado | `observation.state` (7,) |
| Salida | `action` (7,) |
| Librería | LeRobot 0.6.1 |
| Pipeline | robotics |
| Tamaño del repo | 0.2 GB |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un backbone visual (típicamente ResNet) que procesa las imágenes de las dos cámaras y las proyecta junto con el estado articular en una secuencia de tokens. La innovación central del método es predecir *chunks* de acciones (varios pasos futuros de una vez) en lugar de una acción por inferencia, lo que reduce el error de acumulación y mejora la estabilidad en control real. El modelo incorpora además una CVAE (conditional variational autoencoder) para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.1 durante 13.000 pasos, batch de 8, optimizador AdamW y learning rate 1e-05, con semilla 1000. El dataset `iseonn/mock_test_clean` contiene solo 10 episodios y 8.287 fotogramas a 30 FPS para la tarea "pickup2", lo que es un volumen muy bajo para una política robusta. No se documenta composición del dataset, aumentos de datos, ni fases de RLHF/DPO (no aplicables en imitación supervisada). No se mencionan innovaciones adicionales más allá de las propias del método ACT.

## Capacidades

- Control visuomotor de un brazo `so_follower` de 7 grados de libertad a partir de estado articular y dos cámaras.
- Predicción de chunks de acciones (no de pasos sueltos), lo que aporta suavidad temporal.
- Ejecución de una única tarea aprendida: "pickup2" (recogida de objetos).
- Integración nativa con `lerobot-rollout` para despliegue en robot real.
- Entrenamiento reproducible vía `lerobot-train` con `--policy.type=act`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: es una política robótica, no un LLM.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- **Validación de pipeline de imitación**: usar el modelo como referencia para comprobar que la instalación de LeRobot, la calibración del robot y la configuración de cámaras funcionan antes de entrenar políticas propias.
- **Prueba de integración de `lerobot-rollout`**: ejecutar el comando documentado con `--strategy.type=base` y `--duration=60` para verificar el bucle de inferencia en tiempo real sin grabar episodios.
- **Plantilla de entrenamiento ACT**: reutilizar la configuración (13.000 pasos, batch 8, lr 1e-05, semilla 1000) como punto de partida para tareas de manipulación simples con un `so_follower`.
- **Docencia y demos**: ilustrar el flujo completo grabación -> limpieza de dataset -> entrenamiento -> despliegue en un taller o tutorial, dado el bajo coste computacional (51,7 M de parámetros).
- **Benchmark interno de hardware**: medir latencia de inferencia en distintas GPUs con una política ACT real y comparar con políticas más grandes.
- **Prueba de regresión de versiones de LeRobot**: comparar el comportamiento del mismo checkpoint entre versiones de la librería para detectar cambios en la API de inferencia.
- **Base para fine-tuning**: partir de estos pesos y reentrenar con un dataset mayor de la misma tarea para evaluar la ganancia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía).

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,7 M de parámetros en fp32, los pesos ocupan aproximadamente 207 MB; en fp16, unos 103 MB. Sumando activaciones del backbone visual para dos imágenes de 480x640, la inferencia cabe holgadamente en GPUs de 4-6 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). Para entrenamiento conviene una GPU de 8 GB o más.
- **Consumer GPU**: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial), scripts propios con el paquete `lerobot` en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- **Latencia y throughput**: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se publican medidas de latencia real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `iseonn/mock_test` | ACT | 51,7 M | no aplica | `pickup2` (so_follower) | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT | ~50 M (típico) | no aplica | Tareas de manipulación variadas | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (visuomotor) | Difusión | variable (decenas de M) | no aplica | Manipulación visuomotora | MIT/Apache según implementación | Repos públicos |
| VQ-BeT | Transformer + VQ | variable | no aplica | Manipulación visuomotora | MIT | Repos públicos |

No se dispone de datos de rendimiento comparativo del checkpoint `iseonn/mock_test` frente a estas alternativas, por lo que la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- **Dataset mínimo**: 10 episodios y 8.287 fotogramas son insuficientes para una política robusta; el modelo probablemente sobreajusta a las condiciones exactas de grabación.
- **Tarea única**: solo aprende "pickup2"; no generaliza a otras tareas sin reentrenamiento.
- **Sin evaluación publicada**: la model card declara explícitamente ausencia de resultados de éxito en robot real.
- **Riesgo de sobreajuste a iluminación, posiciones y objetos**: cualquier cambio de escena puede degradar el rendimiento.
- **Dependencia de hardware concreto**: requiere un `so_follower` calibrado y dos cámaras con los nombres `wrist` y `top`; otra configuración invalida el checkpoint.
- **Sesgos**: no documentados, pero al derivar de demostraciones humanas puede heredar sesgos de posicionamiento y velocidad del operador.
- **Alucinación**: no aplica en el sentido de LLM, pero puede producir acciones erráticas o inseguras fuera de distribución.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- **Nombre `mock_test`**: sugiere que el repositorio es un artefacto de prueba, no una política lista para producción.
- **Idiomas**: no aplica; no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iseonn/mock_test
- Dataset de entrenamiento: https://huggingface.co/datasets/iseonn/mock_test_clean
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=iseonn/mock_test_clean
