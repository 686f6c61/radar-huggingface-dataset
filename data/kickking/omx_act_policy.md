# kickking/omx_act_policy

## Resumen

`kickking/omx_act_policy` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv 2304.13705 (Zhao et al., 2023). No es un modelo de lenguaje: es un controlador visomotor entrenado para un robot concreto (tipo `omx_f`) que, a partir de una imagen RGB de 640x480 y un vector de estado de 6 dimensiones, predice chunks de acciones de 6 dimensiones. El modelo lo publica el usuario `kickking` en Hugging Face usando la librería LeRobot de Hugging Face.

El modelo resuelve el problema clásico de la manipulación robótica por imitación: aprender una política de control a partir de demostraciones teleoperadas sin necesidad de modelar explícitamente la dinámica del entorno. ACT predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de compuesto y mitiga el problema de la ambigüedad temporal en las demostraciones humanas.

Es relevante como ejemplo práctico del flujo de trabajo LeRobot: un checkpoint pequeño (51,7 millones de parámetros, 0,6 GB) entrenado sobre un dataset mínimo (3 episodios, 1193 frames a 15 FPS) que sirve como referencia para entender el pipeline de entrenamiento y despliegue de políticas ACT en robots reales. Su utilidad en producción es limitada por la escasez de datos y la ausencia de evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se identifica con el string "0") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT combina un backbone de visión (encoder de imágenes, típicamente ResNet) con un transformer encoder-decoder que fusiona las features visuales, el estado propioceptivo del robot y un embedding de la tarea. La salida es un chunk de acciones de longitud fija (por defecto 100 pasos en ACT), de los cuales se ejecutan los primeros antes de volver a inferir. Esta estrategia de predicción por chunks reduce la acumulación de error y permite políticas más estables que el comportamiento reactivo paso a paso. La innovación clave del método original es el uso de temporal ensembling para suavizar las predicciones entre chunks solapados.

Los detalles de entrenamiento publicados son: 10.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5, semilla 1000, LeRobot 0.6.1. El dataset de entrenamiento (`kickking/omx_test_261029_v30`) contiene solo 3 episodios y 1193 frames a 15 FPS, con una única tarea etiquetada como "0". No se documenta el número de tokens ni composición de datos (no aplica), ni si hubo aumento de datos, RLHF o DPO (no aplica a imitación supervisada). La entrada visual es una única cámara (`camera1`) a 640x480; el estado y la acción son vectores de 6 dimensiones.

## Capacidades

- Control visomotor por imitación: genera acciones de 6 grados de libertad a partir de una imagen RGB y el estado del robot.
- Predicción de action chunks: emite secuencias de acciones en lugar de pasos aislados, lo que estabiliza la ejecución.
- Operación con una sola cámara (`camera1`, 640x480) y estado propioceptivo de 6 dimensiones.
- Ejecución de una tarea concreta identificada por el string "0" (no hay comprensión de instrucciones en lenguaje natural).
- Integración nativa con LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No tiene modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de una tarea de manipulación concreta en el robot `omx_f`: desplegar la política con `lerobot-rollout --policy.path=kickking/omx_act_policy --task="0"` para ejecutar la tarea aprendida durante 60 segundos o de forma indefinida.
- Base de referencia para validar el pipeline LeRobot: sirve para comprobar que la instalación, la calibración del robot y las cámaras funcionan antes de entrenar políticas propias.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train --policy.type=act` sobre un dataset mayor para adaptar la política a nuevas tareas o posiciones de objetos.
- Docencia y prototipado en robótica de imitación: el tamaño reducido (0,6 GB) y los 51,7 M de parámetros permiten iterar rápido en laboratorio con hardware modesto.
- Evaluación de la metodología ACT frente a otras políticas (Diffusion Policy, VQ-BeT) en un mismo robot, usando este checkpoint como línea base.
- Pruebas de integración de inferencia visual en tiempo real: la entrada de 640x480 y la salida de 6 dimensiones permiten medir latencia y throughput en GPUs consumer antes de escalar a un modelo mayor.
- Generación de datos sintéticos de acciones para simulación: usar las predicciones como referencia para comparar con trayectorias teleoperadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de éxito por tarea, ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 ocupa aproximadamente 0,2 GB de pesos, más activaciones del encoder visual. Cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para pruebas, aunque con mayor latencia.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kickking/omx_act_policy | 51,7 M | ACT (imitación) | Imagen 640x480 + estado 6D | Apache 2.0 | Hugging Face |
| lerobot/act_* (políticas oficiales LeRobot) | variable (decenas de M) | ACT | Imagen + estado | Apache 2.0 | Hugging Face |
| Diffusion Policy (referencia metodológica) | variable | Política por difusión | Imagen + estado | según implementación | Repos académicos |
| VQ-BeT (referencia metodológica) | variable | Política discreta | Imagen + estado | según implementación | Repos académicos |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- Dataset de entrenamiento mínimo: 3 episodios y 1193 frames; la política probablemente no generaliza fuera de las condiciones exactas de grabación (posiciones, iluminación, objetos).
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no se puede garantizar su funcionamiento.
- Una sola tarea ("0") y una sola cámara: no admite instrucciones en lenguaje natural ni cambios de tarea sin reentrenamiento.
- Específica del robot `omx_f`: los nombres de cámaras y la configuración de hardware deben coincidir exactamente con los del entrenamiento.
- Riesgo de sobreajuste y de comportamiento errático ante distribuciones de entrada distintas a las del dataset.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Sesgos: no aplica en el sentido de sesgos lingüísticos, pero sí puede heredar sesgos de las demostraciones humanas (velocidad, trayectorias, preferencias del operador).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la escasez de datos hacen desaconsejable su uso en producción sin validación previa.
- No hay información sobre cuantizaciones ni formatos alternativos de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kickking/omx_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/kickking/omx_test_261029_v30
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kickking/omx_test_261029_v30
