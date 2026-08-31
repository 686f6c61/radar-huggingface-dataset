# 127-0-0-1/s101_ACT_Policy_v1

## Resumen

El modelo `127-0-0-1/s101_ACT_Policy_v1` es una política neuronal de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario `127-0-0-1` y entrenado con la librería LeRobot de Hugging Face, sobre el robot seguidor SO-101, para ejecutar la tarea de agarrar un cubo negro. El modelo combina entradas visuales de dos cámaras (superior y de muñeca) con el estado del robot (posición de las articulaciones) y genera comandos de acción de seis grados de libertad.

Con 51,7 millones de parámetros, el modelo está entrenado sobre 50 episodios teleoperados (16 950 fotogramas a 30 FPS) y destaca por su enfoque en el aprendizaje por imitación para manipulación robótica. Es relevante en el contexto actual porque demuestra cómo se pueden entrenar y desplegar políticas robóticas de bajo coste con herramientas open source, usando el ecosistema LeRobot y hardware asequible como el brazo SO-101. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51 668 614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de robótica; entradas visuales y de estado, sin contexto de texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | No aplica (modelo de control robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa el método ACT (Action Chunking with Transformers), presentado en el paper arxiv:2304.13705. ACT es una arquitectura transformer que opera sobre observaciones visuales (imágenes de dos cámaras) y estados del robot, y genera un "chunk" de acciones futuras (secuencia de pasos) en lugar de una única acción. Esto reduce la propagación de errores y mejora la estabilidad en tareas de manipulación.

El entrenamiento se realizó con LeRobot v0.6.2 sobre un dataset de 50 episodios teleoperados, con 16 950 fotogramas a 30 FPS. Se usó el optimizador AdamW con una tasa de aprendizaje de 1e-5, tamaño de lote 8 y 100 000 pasos de entrenamiento, con semilla fija 1000. No se menciona el uso de RLHF, DPO ni técnicas de refuerzo adicionales; es un entrenamiento puro de imitación supervisada. La tarea registrada es "Grab the black cube" (agarrar el cubo negro), con el robot tipo `so_follower`.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 grados de libertad (posición de articulaciones) para el brazo seguidor SO-101.
- Percepción visual: procesa imágenes de dos cámaras (superior y de muñeca) de 480x640 píxeles, en color (3 canales), para localizar y manipular objetos.
- Aprendizaje por imitación: reproduce comportamientos teleoperados con alta fidelidad, incluyendo trayectorias de agarre y transporte de objetos.
- Predicción por chunks: emite secuencias de acciones (chunks) que permiten movimientos suaves y coordinados, reduciendo el error acumulado.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot, incluyendo scripts CLI como `lerobot-rollout`.
- Especialización en tarea concreta: entrenado específicamente para agarrar un cubo negro en el entorno registrado; no es generalista.

## Casos de uso

- Automatización de puesta a punto en laboratorios: el modelo puede integrarse en un brazo SO-101 para realizar tareas repetitivas de agarre y colocación de objetos pequeños, liberando a operarios humanos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del número de episodios, la arquitectura ACT o las variaciones de cámara en el éxito de la política.
- Prototipado de celdas robóticas de bajo coste: combinado con hardware SO-101 y cámaras estándar, permite montar una celda de manipulación por menos de 1000 euros, útil para pymes o entornos educativos.
- Evaluación de políticas en robótica: al estar publicado en Hugging Face con el formato LeRobot, puede usarse como benchmark para comparar métodos de imitación en tareas de agarre.
- Formación en robótica y visión por computador: los estudiantes pueden cargar el modelo en un simulador o robot real para experimentar con control basado en aprendizaje, sin necesidad de entrenar desde cero.
- Generación de datos sintéticos para entrenamiento: el modelo puede desplegarse en bucle para recopilar nuevas demostraciones, que luego se usan para entrenar políticas más robustas o adaptadas a nuevas variantes de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de tasas de éxito, métricas de precisión ni comparativas con otros métodos en la tarea "Grab the black cube".

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia puede ejecutarse en GPUs con menos de 2 GB de VRAM (por ejemplo, una NVIDIA GTX 1650 o RTX 3050). En CPU también es viable para pruebas puntuales, aunque con mayor latencia.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (RTX 20 series o superior) es suficiente. Una RTX 3060 o superior ofrece margen para ejecutar varias instancias en paralelo.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer actual, incluso en las integradas de gama alta si se optimiza el batch.
- Opciones de despliegue: LeRobot proporciona el script `lerobot-rollout` para ejecutar la política en un robot real. También puede cargarse en entornos de simulación (por ejemplo, MuJoCo) a través de la API de LeRobot. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de mediciones publicadas. Dado el tamaño, se espera una inferencia en tiempo real (por debajo de 50 ms por paso) en una GPU moderna, suficiente para control a 30 Hz.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Tarea | Licencia |
|--------|--------------|------------|----------|-------|----------|
| `127-0-0-1/s101_ACT_Policy_v1` | ACT | 51,7 M | Visual + estado | Agarrar cubo negro | Apache 2.0 |
| `AliKhoja/so101-act-policy` | ACT | ~51 M (estimado) | Visual + estado | Agarrar y colocar objetos | Apache 2.0 |
| Políticas Diffusion Policy (referencia genérica) | Diffusion | Variable (típicamente 10-100 M) | Visual + estado | Manipulación variada | Depende de la implementación |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia con alternativas como Diffusion Policy es el mecanismo de predicción: ACT usa transformers con chunks de acción, mientras que Diffusion Policy genera acciones mediante denoising iterativo. Ambos son métodos de imitación, pero ACT tiende a ser más rápido en inferencia y más sencillo de entrenar, a costa de menor expresividad en trayectorias muy complejas.

## Limitaciones y advertencias

- Especialización estricta: el modelo solo ha sido entrenado para la tarea "Grab the black cube" con el robot SO-101. No generaliza a otros objetos, posiciones, iluminación o robots sin reentrenamiento.
- Dependencia del hardware: las cámaras y el robot deben coincidir con los utilizados en el entrenamiento (tipo `so_follower` y cámaras `top` y `wrist`). Cambios en la calibración o en la disposición física degradarán el rendimiento.
- Riesgo de sobreajuste: con solo 50 episodios de demostración, la política puede memorizar trayectorias específicas y fallar ante variaciones mínimas del entorno.
- Sin evaluación publicada: no hay métricas de éxito en el mundo real, por lo que se desconoce su robustez en condiciones de producción.
- Sesgos del dataset: las demostraciones teleoperadas reflejan el estilo del operador y las condiciones del laboratorio, lo que puede introducir sesgos en la forma de agarrar o en la preferencia de posiciones.
- Alucinación de acciones: en situaciones fuera de distribución (objeto no visible, iluminación extrema), el modelo puede generar comandos erráticos o inseguros. Se recomienda supervisión humana durante los primeros despliegues.
- No es un modelo de lenguaje: no admite instrucciones en texto ni interacción conversacional; su interfaz es exclusivamente visual y de estado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/127-0-0-1/s101_ACT_Policy_v1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/127-0-0-1/s101-ACT_v1_20260830_193344
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
