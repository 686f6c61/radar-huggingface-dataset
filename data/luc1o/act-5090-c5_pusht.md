# LUC1O/act-5090-C5_pusht

## Resumen

`LUC1O/act-5090-C5_pusht` es un checkpoint de política robótica basado en la arquitectura ACT (Action Chunking with Transformers), entrenado con la librería LeRobot de HuggingFace sobre el conjunto de datos `lerobot/pusht`. Lo publica el usuario LUC1O como parte de un benchmark de entrenamiento de ACT en una única GPU RTX 5090, con hiperparámetros "oficiales" (batch 8, learning rate 1e-5, chunk size 100, 100 000 pasos). El modelo tiene 51 660 418 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras para manipulación robótica.

El problema que aborda es el aprendizaje por imitación de tareas de manipulación: a partir de demostraciones (observaciones de cámara e imágenes y acciones de efector final), el modelo predice secuencias de acciones (chunks) para controlar un brazo robótico en la tarea PushT, que consiste en empujar una pieza en forma de T hasta una pose objetivo. ACT es una referencia habitual en robótica de imitación por su bajo coste computacional y su capacidad de generar acciones en bloque, lo que reduce el error acumulado frente a políticas paso a paso.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint concreto; por otro, y sobre todo, sirve como caso de estudio de un resultado de entrenamiento fallido. El propio autor reporta un 0,5 % de éxito (1 de 200 episodios) en la evaluación oficial de PushT, con un intervalo de confianza de Wilson del 95 % de 0,1–2,8 %. Es decir, el modelo apenas supera el comportamiento aleatorio en esta tarea y no debe considerarse utilizable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con encoder visual y decodificador transformer de acciones |
| Parametros totales | 51 660 418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; ventana de observación definida por la configuración de LeRobot, no documentada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un backbone de visión (codificador de imágenes) con un transformer que predice un *chunk* de acciones futuras de forma conjunta, en lugar de una acción por paso. El modelo se entrena con aprendizaje supervisado sobre pares observación-acción procedentes de demostraciones teleoperadas. En este checkpoint, la configuración declarada es la de los hiperparámetros "oficiales" de ACT en LeRobot: batch de 8, learning rate de 1e-5, chunk size de 100 y 100 000 pasos de entrenamiento, ejecutados en una única RTX 5090 con la versión `ba83e4c` de LeRobot.

El conjunto de datos es `lerobot/pusht`, un dataset estándar de demostraciones de la tarea PushT. No se documentan en la información disponible detalles sobre aumentos de datos, composición exacta del dataset, número de tokens (no aplica) ni técnicas de RLHF/DPO (no aplican a este tipo de política). La innovación técnica relevante es la propia predicción por chunks de ACT, que agrupa 100 acciones por inferencia; sin embargo, el resultado reportado sugiere que, con esta configuración concreta y este presupuesto de entrenamiento, la política no ha convergido a un comportamiento útil.

## Capacidades

- Predicción de secuencias de acciones (chunks de 100 pasos) para control de un brazo robótico en la tarea PushT.
- Procesamiento de observaciones visuales e imágenes de cámara como entrada, según el pipeline estándar de ACT en LeRobot.
- Integración con el ecosistema LeRobot: evaluación mediante `lerobot-eval` y carga directa desde el Hub.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso en el sentido de agentes LLM; su "razonamiento" es la predicción de acciones motoras.
- Capacidades multilingües: no aplica.
- No dispone de modo *thinking*, visión generativa, audio ni otras capacidades de los modelos fundacionales multimodales.
- Rendimiento real en su tarea objetivo: 0,5 % de éxito en 200 episodios de PushT-v0, es decir, prácticamente equivalente a una política no entrenada.

## Casos de uso

- Reproducción de experimentos de entrenamiento de ACT: sirve como referencia para comparar configuraciones de hiperparámetros en una RTX 5090 y validar pipelines de LeRobot, no como política desplegable.
- Docencia y estudio de fallos de convergencia: permite analizar por qué una configuración "oficial" con 100 000 pasos y batch 8 no alcanza un rendimiento aceptable en PushT.
- Pruebas de infraestructura de evaluación: útil para verificar que el comando `lerobot-eval` y el entorno `PushT-v0` funcionan correctamente antes de lanzar entrenamientos reales.
- Benchmarking de hardware: el repositorio asociado documenta tiempos y logs de entrenamiento en una RTX 5090, útil para estimar costes de cómputo de ACT.
- Punto de partida para *fine-tuning*: podría reutilizarse como inicialización en experimentos con más pasos, mayor batch o datos adicionales, aunque no hay evidencia de que mejore el resultado.
- Integración en pipelines de CI para robótica: como artefacto de prueba que valida la carga de safetensors y la compatibilidad de versiones de LeRobot.
- No se recomienda su uso en demostraciones públicas, investigación aplicada ni producción, dado el 0,5 % de éxito reportado.

## Benchmarks y rendimiento

| Benchmark | Entorno | Episodios | Métrica | Resultado |
|---|---|---|---|---|
| PushT | `pusht` / `PushT-v0` | 200 | Tasa de éxito | 0,5 % (1/200) |
| PushT (IC 95 % Wilson) | `pusht` / `PushT-v0` | 200 | Tasa de éxito | 0,1–2,8 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo, ni comparaciones numéricas con otras políticas ACT en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en safetensors y un repo de 0,2 GB, la inferencia cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- GPU recomendadas: RTX 5090 (usada para el entrenamiento), RTX 4090, RTX 3090, A100 o H100; cualquier GPU con soporte CUDA es suficiente para inferencia.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU NVIDIA modernas e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `lerobot-eval` (comando documentado por el autor), scripts de LeRobot y, en general, cualquier runtime que cargue safetensors con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en una única RTX 5090 con 100 000 pasos y batch 8; los logs completos están en el repositorio de GitHub del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en PushT | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LUC1O/act-5090-C5_pusht` | 51,7 M | no disponible | 0,5 % (1/200) | no disponible | HuggingFace Hub |
| ACT oficial (LeRobot, referencia) | ~51 M (configuración estándar) | no disponible | no disponible en esta ficha | Apache-2.0 (LeRobot) | HuggingFace / GitHub |
| Diffusion Policy (referencia PushT) | no disponible | no disponible | no disponible en esta ficha | no disponible | Repositorios de investigación |

No se dispone de datos numéricos comparables de otras políticas en la información proporcionada; la comparación se limita a la categoría y al ecosistema. La alternativa natural es el checkpoint ACT de referencia de LeRobot, que suele superar ampliamente el 0,5 % de éxito en PushT, aunque no se incluyen cifras exactas para no inventar datos.

## Limitaciones y advertencias

- Rendimiento insuficiente: 0,5 % de éxito en PushT-v0 (1 de 200 episodios) indica que la política no ha aprendido la tarea de forma útil.
- No apto para producción ni para demostraciones: el comportamiento es prácticamente aleatorio.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; hay que contactar con el autor antes de cualquier uso.
- Sesgos: no documentados; al ser un modelo de robótica entrenado con un dataset concreto (`lerobot/pusht`), su comportamiento está limitado a esa distribución de escenas y objetos.
- Riesgo de sobreajuste o infraentrenamiento: con batch 8 y 100 000 pasos, la configuración puede ser insuficiente para converger; el autor no reporta curvas de aprendizaje en la model card.
- Limitaciones de contexto e idioma: no aplican en el sentido de LLM, pero la política solo opera sobre la tarea y el entorno para los que fue entrenada.
- Caveat de evaluación: el resultado se obtuvo con 200 episodios y `use_async_envs=false`; el intervalo de confianza es amplio (0,1–2,8 %), lo que refuerza que el modelo no es fiable.
- Fecha de creación futura (2026-11-04): conviene verificar la integridad del repositorio y la versión de LeRobot antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LUC1O/act-5090-C5_pusht
- Repositorio de benchmark, logs y scripts de reproducción: https://github.com/Jerryisqx/ACT-5090-benchmark
- Dataset utilizado: https://huggingface.co/datasets/lerobot/pusht
- LeRobot (librería): https://github.com/huggingface/lerobot
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
- Documentación de PushT / `PushT-v0`: no disponible en la información proporcionada
