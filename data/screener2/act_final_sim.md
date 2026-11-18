# Screener2/act_Final_Sim

## Resumen

Screener2/act_Final_Sim es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705 y distribuida mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (estado articular de 6 dimensiones más una imagen cenital de 480×640) a acciones articulares de 6 dimensiones. El repositorio lo publica el usuario Screener2 bajo licencia Apache 2.0.

El modelo tiene 51.668.614 parámetros en formato safetensors (aproximadamente 0,2 GB de repositorio) y fue entrenado sobre el dataset Screener2/Final_Sim: 15 episodios, 7.234 fotogramas a 30 FPS, con una única tarea etiquetada como "0". El robot objetivo es un `so_follower` (la variante follower del SO-100/SO-101 de LeRobot) con una sola cámara cenital.

Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación en LeRobot 0.5.2, con hiperparámetros documentados (100.000 pasos, batch de 8, AdamW, LR 1e-5, semilla 1000). No obstante, al no incluir resultados de evaluación ni demo, debe tratarse como un artefacto de entrenamiento experimental y no como una política validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acción |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de un solo paso con historial de acciones) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entrada: estado | `observation.state`, shape (6,) |
| Entrada: visión | `observation.images.overhead`, shape (3, 480, 640) |
| Salida: acción | `action`, shape (6,) |
| Tipo de robot | `so_follower` |
| Cámaras | `overhead` (una sola) |
| Librería | LeRobot 0.5.2 |
| Dataset de entrenamiento | Screener2/Final_Sim (15 episodios, 7.234 fotogramas, 30 FPS) |
| Tarea | "0" |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. La arquitectura combina un backbone visual (encoder de imagen sobre la observación cenital de 480×640) con un transformer que fusiona la representación visual y el estado articular de 6 dimensiones, y un decodificador que emite el chunk de acciones de 6 dimensiones. El modelo sigue el esquema de entrenamiento supervisado por comportamiento clonado sobre demostraciones teleoperadas; no se documenta uso de RLHF, DPO ni aprendizaje por refuerzo.

La configuración de entrenamiento está documentada en la model card: 100.000 pasos con batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, ejecutado con LeRobot 0.5.2. El dataset consta únicamente de 15 episodios y 7.234 fotogramas etiquetados con la tarea "0", lo que supone un volumen muy reducido para generalización: en términos efectivos, el modelo ve aproximadamente 7.234 muestras por época y el número de épocas implícitas a 100.000 pasos con batch 8 es de unas 110 pasadas sobre el dataset. No se documentan aumentos de datos, currículos ni técnicas de regularización adicionales.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de una imagen cenital y el estado articular de 6 dimensiones.
- Predicción de chunks de acción (no pasos sueltos), lo que mejora la estabilidad en tareas de manipulación.
- Ejecución de una única tarea etiquetada como "0"; no hay evidencia de multi-tarea.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (behavior cloning).
- Inferencia en tiempo real a 30 FPS según la frecuencia del dataset de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de un pipeline de imitación en LeRobot: sirve como referencia para validar la instalación, el flujo `lerobot-train` y `lerobot-rollout` con un modelo pequeño (51,7 M de parámetros) que cabe en cualquier GPU consumer.
- Prototipado de manipulación con SO-100/SO-101: permite probar la integración de un `so_follower` con cámara cenital y calibrar el entorno antes de invertir en un dataset mayor.
- Docencia y talleres de robótica: al ser un modelo de 0,2 GB y licencia Apache 2.0, es adecuado para ejercicios prácticos de aprendizaje por imitación sin requisitos de hardware elevados.
- Baseline para comparación de métodos: útil como punto de partida frente a políticas más recientes (Diffusion Policy, VQ-BeT) entrenadas sobre el mismo dataset.
- Pruebas de infraestructura de inferencia robótica: validar latencia, FPS y sincronización cámara-robot en un banco de pruebas antes de desplegar modelos mayores.
- Reentrenamiento sobre datos propios: la configuración documentada (100.000 pasos, batch 8, LR 1e-5) sirve como receta inicial para ajustar ACT a un dataset propio con la misma estructura de observaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de pérdida de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros; en la práctica, el cuello de botella es el encoder visual y el buffer de imagen de 480×640, por lo que se recomienda al menos 2-4 GB de VRAM para operar con comodidad.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también es viable en CPU para pruebas de baja frecuencia, aunque no se garantiza los 30 FPS.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Screener2/act_Final_Sim`; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La frecuencia de operación esperada es de 30 FPS, coincidente con la del dataset de entrenamiento, pero no se han publicado mediciones reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_Final_Sim | 51,7 M | Estado (6,) + imagen 480×640 | Tarea única "0" en `so_follower` | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | ~50 M (típico) | Estado + imagen | Multi-tarea según dataset | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible en esta ficha | Estado + imagen | Manipulación multi-tarea | MIT (repo original) | Repositorios de investigación |
| VQ-BeT | no disponible en esta ficha | Estado + imagen | Manipulación multi-tarea | MIT (repo original) | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (15 episodios, 7.234 fotogramas): alta probabilidad de sobreajuste y escasa generalización a posiciones de objetos, iluminación o fondos distintos de los vistos en las demostraciones.
- Una única tarea ("0") y una única cámara cenital: el modelo no es reutilizable tal cual para otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay evidencia de tasa de éxito en robot real, por lo que no debe desplegarse en producción sin validación propia.
- Dependencia de la calibración exacta del robot `so_follower` y de la cámara `overhead`: cambios en la resolución, montaje o índice de cámara pueden degradar el comportamiento.
- Riesgo de alucinación en el sentido de acciones no fundamentadas: al ser behavior cloning, puede producir comandos fuera de distribución ante observaciones novedosas.
- Sin capacidades lingüísticas ni multilingües; no aplica sesgo de idioma, pero sí posibles sesgos derivados del operador que teleoperó las demostraciones.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Modelo creado y actualizado el 2026-11-18, con 0 descargas y 0 likes: comunidad nula, sin issues ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Screener2/act_Final_Sim
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/Final_Sim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/Final_Sim
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
