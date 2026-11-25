# escapebirdy/dvrk_rope_cam012_rpy_jaw_baseframe_policy

## Resumen

`escapebirdy/dvrk_rope_cam012_rpy_jaw_baseframe_policy` es una política de control visuomotor entrenada con Diffusion Policy y publicada en el Hub mediante LeRobot. El modelo resuelve el problema de generar trayectorias de acción multimodales y suaves para manipulación robótica, tratando el control como un proceso generativo de difusión en lugar de una regresión directa. Está desarrollado por el usuario `escapebirdy` y se distribuye con licencia Apache 2.0.

La política se ha entrenado sobre el dataset `escapebirdy/dvrk_rope_cam012_baseframe`, aparentemente capturado con el sistema quirúrgico da Vinci Research Kit (dVRK) y centrado en tareas con cuerdas (rope). El nombre indica tres cámaras (`cam012`), un espacio de acciones expresado en roll-pitch-yaw más apertura de pinza (`rpy_jaw`) y un marco de referencia base (`baseframe`). Es, por tanto, una política específica de tarea y de plataforma, no un modelo generalista.

Con 426.437.962 parámetros y un repositorio de 1,7 GB, el modelo se sitúa en la categoría de políticas de imitación de tamaño medio, desplegables en una GPU de consumo. Su relevancia radica en que ejemplifica el flujo actual de LeRobot para entrenar y compartir políticas de difusión reproducibles en robótica quirúrgica y manipulación diestra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), implementado en LeRobot |
| Parametros totales | 426.437.962 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | 3 cámaras (`cam012`) |
| Espacio de acciones | roll-pitch-yaw + apertura de pinza (`rpy_jaw`) en marco base |
| Libreria | lerobot |
| Dataset de entrenamiento | `escapebirdy/dvrk_rope_cam012_baseframe` |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo sigue la formulación de Diffusion Policy (Chi et al., 2023, arXiv:2303.04137), que modela la distribución de secuencias de acciones como un proceso de difusión condicionado por observaciones visuales y propioceptivas. En lugar de predecir una única acción por paso, la política genera una trayectoria completa de varios pasos mediante eliminación iterativa de ruido, lo que permite representar distribuciones multimodales de comportamiento y produce movimientos suaves, especialmente útil en tareas de manipulación con contacto rico como el manejo de cuerdas.

El entrenamiento se realizó con el pipeline de imitación de LeRobot sobre el dataset `dvrk_rope_cam012_baseframe`. No se dispone de información publicada sobre el número de episodios, la composición exacta del dataset, el número de pasos de entrenamiento ni si se aplicaron técnicas adicionales de aumento de datos o regularización. El modelo card únicamente documenta el flujo de entrenamiento genérico de LeRobot.

## Capacidades

- Generación de trayectorias de acción multimodales y temporalmente coherentes para control visuomotor.
- Manipulación con contacto rico, incluyendo tareas con cuerdas (rope) sobre la plataforma dVRK.
- Fusión de tres vistas de cámara (`cam012`) como entrada perceptiva.
- Predicción de comandos en espacio cartesiano roll-pitch-yaw más apertura de pinza.
- Control expresado en marco de referencia base, lo que facilita su integración con cinemática del robot.
- Ejecución de episodios completos mediante `lerobot-record`.
- No soporta tool calling, agentes, razonamiento multi-paso simbólico ni capacidades lingüísticas: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Manipulación de cuerdas en cirugía robótica simulada o real: la política está entrenada específicamente sobre el dataset `dvrk_rope_cam012_baseframe`, por lo que puede emplearse para reproducir tareas de sutura o manejo de hilos con el dVRK en el mismo montaje de cámaras.
- Investigación en imitación visuomotora: sirve como punto de partida reproducible para comparar variantes de Diffusion Policy frente a ACT u otras políticas de LeRobot sobre el mismo dataset.
- Evaluación de pipelines de LeRobot: permite validar el flujo `lerobot-record` con `--policy.path` apuntando al checkpoint y medir tasas de éxito en 10 episodios de evaluación.
- Reentrenamiento y fine-tuning sobre nuevas demostraciones: al estar en formato LeRobot y safetensors, puede adaptarse a variaciones de la tarea (por ejemplo, distintos diámetros de cuerda) con un nuevo dataset.
- Despliegue en banco de pruebas con GPU de consumo: sus 426 M de parámetros permiten inferencia en tiempo real en una RTX 4090 o similar para experimentos de laboratorio.
- Base para estudios de robustez perceptiva: al depender de tres cámaras, es útil para analizar cómo afecta la oclusión o el cambio de iluminación a una política de difusión entrenada en un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 426 M de parámetros en safetensors (1,7 GB de repo) la inferencia en FP32 requiere del orden de 1,7 GB solo para pesos, más memoria para activaciones y buffers de difusión.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 8 GB de VRAM para experimentación; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y superiores.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con backend PyTorch/CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de control.
- Latencia y throughput: no disponibles. La latencia efectiva depende del número de pasos de difusión y de la frecuencia de control del robot, parámetros no publicados en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `escapebirdy/dvrk_rope_cam012_rpy_jaw_baseframe_policy` | 426 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| ACT (Action Chunking Transformer, LeRobot) | no disponible | no aplica | no disponible | Apache 2.0 (implementación LeRobot) | Hugging Face / GitHub |
| Diffusion Policy original (Chi et al.) | no disponible | no aplica | no disponible | MIT (código de referencia) | GitHub |
| Otras políticas LeRobot en el Hub | variable | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas políticas sobre el mismo dataset, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Política específica de tarea y plataforma: entrenada para `dvrk_rope_cam012_baseframe` con tres cámaras y acciones `rpy_jaw`; no es transferible sin reentrenamiento a otros robots, configuraciones de cámara o espacios de acción.
- Sin métricas publicadas: no hay tasas de éxito, número de episodios de entrenamiento ni curvas de aprendizaje, lo que impide evaluar su calidad antes de desplegarla.
- Riesgo de sobreajuste al dominio visual del dataset (iluminación, fondo, posición de cámaras); cambios en el montaje pueden degradar el rendimiento.
- Riesgo de fallo en estados fuera de distribución: como toda política de imitación, puede generar trayectorias erráticas ante observaciones no vistas.
- Dependencia de la calibración del robot y del marco base; errores de cinemática o de calibración de la pinza afectan directamente a las acciones predichas.
- Sin soporte multilingüe ni de texto: no debe emplearse como modelo de lenguaje ni de razonamiento simbólico.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un uso clínico o comercial.
- Uso en entornos quirúrgicos reales requiere validación independiente, protocolos de seguridad y supervisión humana; este modelo no está certificado para uso clínico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/escapebirdy/dvrk_rope_cam012_rpy_jaw_baseframe_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/escapebirdy/dvrk_rope_cam012_baseframe
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
