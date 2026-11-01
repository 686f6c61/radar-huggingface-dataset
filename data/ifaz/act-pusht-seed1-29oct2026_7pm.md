# iFaz/act-pusht-seed1-29oct2026_7pm

## Resumen

ACT Policy — act-pusht-seed1-29oct2026_7pm es una política de imitación entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Implementa el algoritmo ACT (Action Chunking with Transformers), un transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales y proprioceptivas, desarrollado originalmente por Zhao et al. (2023) y popularizado en el ecosistema LeRobot.

El modelo se ha entrenado sobre el dataset `lerobot/pusht`, un entorno de manipulación 2D en MuJoCo donde un efector debe empujar un bloque en forma de T hasta una posición objetivo. Con 51.660.418 parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para experimentación y reproducción de resultados, no para despliegue en producción.

Es relevante ahora como ejemplo canónico del flujo de entrenamiento de LeRobot y como referencia para comparar configuraciones de ACT. No obstante, los resultados de evaluación publicados en su model card muestran un 0,0 % de tasa de éxito en 100 episodios, lo que indica que esta ejecución concreta (seed 1) no ha convergido a una política funcional y debe interpretarse como un artefacto de experimentación fallido o incompleto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.660.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no LLM) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (solo etiqueta de idioma; el modelo no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, `pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que combina un backbone visual (ResNet) para procesar las imágenes de la cámara con un encoder transformer que fusiona observaciones visuales y estado proprioceptivo, y un decoder que predice un chunk de acciones futuras en lugar de una única acción. Esta predicción por chunks reduce el error de compounding y mejora la estabilidad temporal en tareas de manipulación. La configuración usada es la de LeRobot por defecto, sin overrides en la arquitectura de la política.

El entrenamiento se realizó con LeRobot sobre el dataset `lerobot/pusht`, con 70.000 pasos, batch size 8, 4 workers de datos y semilla 1. La frecuencia de evaluación durante el entrenamiento fue 0 (`eval_freq=0`), por lo que no se monitorizó el rendimiento intermedio, y el guardado se hizo cada 30.000 pasos. No se documenta en la model card el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables a una política de imitación supervisada).

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones (imagen + estado) en el entorno PushT.
- Manipulación 2D en MuJoCo: entrenado específicamente para la tarea `PushT-v0` (empujar un bloque en forma de T a una posición objetivo).
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación y despliegue de LeRobot (`lerobot` como librería).
- Carga vía `pytorch_model_hub_mixin`: interoperable con el hub de Hugging Face y con las utilidades de carga de LeRobot.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política de control, no un modelo de lenguaje.
- No incluye modo thinking, visión general, audio ni otras capacidades multimodales más allá de la percepción visual propia de la tarea.

## Casos de uso

- Reproducción de experimentos de ACT en PushT: sirve como referencia para comparar configuraciones (semilla, pasos, batch size) frente a otras ejecuciones del mismo algoritmo en el entorno PushT.
- Baseline en investigación de imitación: permite medir la varianza entre semillas y detectar configuraciones que no convergen, como parece ser el caso de esta ejecución.
- Docencia y tutoriales de LeRobot: ejemplo práctico del flujo completo de entrenamiento y evaluación con `lerobot` sobre un dataset público.
- Pruebas de infraestructura de evaluación: útil para validar pipelines de evaluación asíncrona (`eval.use_async_envs`) y de simulación con MuJoCo antes de lanzar entrenamientos más costosos.
- Desarrollo de herramientas de análisis de políticas: al tener pesos públicos y un formato estándar, se puede usar para probar utilidades de inspección, visualización de trayectorias o análisis de fallos.
- Comparación de arquitecturas en robótica de imitación: junto con otras políticas de LeRobot (p. ej. Diffusion Policy), permite estudiar diferencias de comportamiento en la misma tarea, aunque en este caso concreto el rendimiento nulo limita la comparación a nivel de resultados.

## Benchmarks y rendimiento

Resultados de evaluación publicados en la model card (entorno `PushT-v0`, 100 episodios, batch size 1, `use_async_envs=False`):

| Metrica | Valor |
|---|---|
| Episodios evaluados | 100 |
| Tasa de exito | 0,0 % |
| Recompensa media acumulada | 36,90 |
| Recompensa maxima media | 0,35 |
| Tiempo de evaluacion | 211,8 s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,66 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2-4 GB de VRAM libre, dependiendo del tamaño de las imágenes de entrada y del batch.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (el entrenamiento se realizó en `cuda`); para evaluación en MuJoCo, una RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con CUDA (RTX 20xx, 30xx, 40xx, etc.).
- Opciones de despliegue: LeRobot (carga nativa vía `pytorch_model_hub_mixin`), PyTorch estándar; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; el tiempo de evaluación reportado (211,8 s para 100 episodios) incluye la simulación MuJoCo y no aísla el coste de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act-pusht-seed1-29oct2026_7pm (este) | 51,66 M | PushT (MuJoCo) | no aplica | 0,0 % éxito (100 episodios) | Apache 2.0 | Hugging Face |
| Otras políticas ACT de LeRobot sobre `lerobot/pusht` | ~51 M (arquitectura por defecto) | PushT | no aplica | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (LeRobot) | no disponible | Manipulación robótica | no aplica | no disponible en la informacion proporcionada | no disponible | LeRobot |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparativa se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Rendimiento nulo: la tasa de éxito reportada es del 0,0 % en 100 episodios, por lo que el modelo no es funcional para la tarea PushT en su estado actual.
- Sin evaluación intermedia: `eval_freq=0` impide saber si el modelo llegó a converger en algún momento del entrenamiento.
- Especificidad de tarea: entrenado exclusivamente para `PushT-v0`; no generaliza a otras tareas ni entornos sin reentrenamiento.
- Sesgos conocidos: no documentados; en políticas de imitación, los sesgos provienen del dataset de demostración (`lerobot/pusht`), que es sintético y de dominio muy acotado.
- Riesgo de alucinación: no aplica en el sentido de LLM; el riesgo equivalente es la predicción de acciones fuera de distribución ante observaciones no vistas.
- Limitaciones de idioma: la etiqueta `en` es meramente informativa; el modelo no procesa lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo carece de utilidad práctica en su estado actual.
- Caveat para producción: no debe desplegarse en ningún sistema real; su valor es exclusivamente como artefacto de experimentación y reproducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iFaz/act-pusht-seed1-29oct2026_7pm
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Dataset `lerobot/pusht`: https://huggingface.co/datasets/lerobot/pusht
- Paper original de ACT (Zhao et al., 2023): no disponible en la informacion proporcionada
- Paper de Diffusion Policy: no disponible en la informacion proporcionada
