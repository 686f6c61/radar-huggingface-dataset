# fecasado/gact-cubes-21aN

## Resumen

`fecasado/gact-cubes-21aN` es una política de control robótico (visuomotor policy) publicada en Hugging Face Hub, no un modelo de lenguaje. Se ha entrenado y subido con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y su `pipeline_tag` es `robotics`. El identificador interno del modelo es `gaze_act`, lo que sugiere una variante de ACT (Action Chunking Transformer) con información de mirada (gaze) como señal adicional, aunque la model card no documenta explícitamente esa modificación.

El modelo tiene 51.667.098 parámetros reales (verificados en los pesos safetensors) y un repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que se pueden ejecutar en una GPU de consumo e incluso en tiempo real sobre un brazo robótico de bajo coste. Está entrenado sobre el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, una tarea de manipulación que consiste en trasladar cubos a cestas con imágenes de 320x240 píxeles.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Es útil como ejemplo reproducible de un pipeline LeRobot completo (entrenamiento, evaluación y despliegue sobre un seguidor SO-100), pero no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), variante `gaze_act`; detalles de la modificación por mirada no disponibles |
| Parámetros totales | 51.667.098 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la "ventana" es el horizonte de observación y el chunk de acciones, no documentado) |
| Tipos de cuantización | No disponible; pesos publicados en safetensors (presumiblemente fp32) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Entradas | Imágenes de cámara 320x240 y estado propioceptivo del robot (según el dataset de entrenamiento) |
| Salidas | Chunks de acciones para el robot seguidor |
| Dataset de entrenamiento | `fecasado/Ncubes-to-Nbaskets-320x240` |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La model card declara `model_name: gaze_act` y el script de entrenamiento de ejemplo utiliza `--policy.type=act`, es decir, la implementación de Action Chunking Transformer incluida en LeRobot. ACT es un transformer que, a partir de observaciones visuales y del estado del robot, predice un fragmento (chunk) de acciones futuras en lugar de una acción por paso, lo que reduce el error de acumulación típico del comportamiento clonado y permite control a mayor frecuencia efectiva. El prefijo `gaze_` indica alguna forma de incorporación de señal de mirada, pero la model card no especifica si se trata de una entrada adicional, de una tarea auxiliar de predicción o de un mecanismo de atención sesgada; ese detalle no está disponible.

No hay información publicada sobre el número de tokens, el número de episodios del dataset, la composición exacta de las demostraciones ni sobre si se aplicó post-entrenamiento (RLHF, DPO u otros). La model card es la plantilla automática de LeRobot y conserva el texto `_Model type not recognized — please update this template._`, lo que confirma que el autor no completó la documentación. El entrenamiento se realizó con `lerobot-train` sobre GPU (`--policy.device=cuda`), pero no se indican hiperparámetros, duración ni semillas.

## Capacidades

- Control visuomotor para manipulación de objetos: genera comandos de acción a partir de imágenes de 320x240 y del estado del robot.
- Ejecución de tareas de pick-and-place: el dataset de entrenamiento corresponde al traslado de cubos a cestas.
- Predicción por chunks de acciones, propia de ACT, que aporta movimientos más suaves y mayor robustez que el comportamiento clonado paso a paso.
- Integración nativa con el ecosistema LeRobot: `lerobot-train` para reentrenar y `lerobot-record` para evaluar.
- Compatibilidad declarada con el robot `so100_follower` en el comando de evaluación de la model card.
- Posible uso de señal de mirada (gaze) como entrada o tarea auxiliar, según el nombre del modelo; sin confirmar en la documentación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general o de audio: es una política robótica específica de tarea.

## Casos de uso

- Manipulación de cubos a cestas en laboratorio: es exactamente la tarea del dataset `Ncubes-to-Nbaskets-320x240`; se usaría cargando el checkpoint con `--policy.path` en `lerobot-record` sobre un SO-100 seguidor para reproducir la conducta aprendida.
- Reproducción de un pipeline de aprendizaje por imitación: sirve como referencia completa de entrenamiento y evaluación con LeRobot, útil para docencia o para validar una instalación antes de invertir horas de grabación de datos.
- Base para fine-tuning en tareas de pick-and-place similares: al tener 51,7 M de parámetros y licencia Apache 2.0, se puede reentrenar con un dataset propio de decenas de episodios en una sola GPU de consumo.
- Investigación sobre integración de mirada en políticas visuomotoras: el nombre `gaze_act` lo convierte en un punto de partida para comparar contra ACT estándar, siempre que se confirmen los detalles de la modificación.
- Evaluación de robustez frente a variaciones de iluminación y posición de cámara: útil para medir la degradación de una política ACT ante cambios de dominio no vistos en el dataset original.
- Despliegue embebido de bajo coste: con ~207 MB en fp32 y ~103 MB en fp16, el modelo cabe en GPUs integradas o en placas tipo Jetson, lo que permite montar el bucle de control a bordo del robot.
- Generación de datos sintéticos de evaluación: ejecutar la política contra el simulador o el robot real para producir trayectorias etiquetadas y comparar con las demostraciones humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, curvas de aprendizaje, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,21 GB solo para pesos en fp32 y ~0,10 GB en fp16/bf16; con activaciones, buffers de imagen y overhead del runtime, el consumo real se sitúa típicamente por debajo de 1-2 GB (estimación aritmética a partir del número de parámetros, no medida publicada).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen de sobra. Para entrenamiento, se recomienda una GPU con 8-24 GB.
- Cabe en GPU de consumo: sí, en toda la gama actual (GTX 1060 6 GB en adelante) y previsiblemente en GPUs integradas y en módulos Jetson Orin.
- Opciones de despliegue: LeRobot (PyTorch) es la vía documentada, con `lerobot-record --policy.path=...`; también se puede cargar el checkpoint con PyTorch directamente. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control dependerá del chunk de acciones y del hardware; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/gact-cubes-21aN` | ACT con gaze (LeRobot) | 51.667.098 | No disponible | Apache 2.0 | Hub de Hugging Face, 0 descargas |
| ACT estándar en LeRobot | Action Chunking Transformer | No disponible | No disponible | No disponible | Implementación en la librería LeRobot |
| Diffusion Policy en LeRobot | Política por difusión | No disponible | No disponible | No disponible | Implementación en la librería LeRobot |
| SmolVLA (Hugging Face) | VLA para robótica | No disponible | No disponible | No disponible | Hub de Hugging Face |

La comparación cuantitativa no es posible: no hay benchmarks publicados para este checkpoint y las alternativas no se han evaluado en el mismo dataset. La diferencia funcional más clara frente a un ACT estándar es la presumible incorporación de mirada, sin documentar; frente a Diffusion Policy, ACT es más ligero y con inferencia más rápida, a costa de menor capacidad de modelar distribuciones multimodales de acciones.

## Limitaciones y advertencias

- Documentación incompleta: la model card conserva la plantilla automática de LeRobot y el aviso `Model type not recognized`; no hay información sobre la modificación `gaze_`.
- Especialización extrema: la política está entrenada para una tarea concreta (cubos a cestas) y un montaje concreto (cámara a 320x240, robot SO-100 seguidor); no generaliza a otras tareas sin reentrenar.
- Sin benchmarks ni métricas de éxito publicadas: no se puede estimar su fiabilidad en producción.
- Riesgo de sobreajuste al entorno de grabación: cambios de iluminación, fondo, posición de cámara o tipo de objeto degradan previsiblemente el rendimiento, algo habitual en comportamiento clonado.
- Fallos silenciosos: una política visuomotora puede ejecutar acciones incorrectas sin señal de error; requiere supervisión humana y límites de par o de espacio de trabajo en el robot.
- Idiomas y contexto lingüístico: no aplica, el modelo no procesa texto.
- Sesgos: no documentados; en robótica se traducen en sesgos de posición, apariencia de objetos y condiciones del entorno presentes en las demostraciones.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y citar el origen.
- Trazabilidad: 0 descargas y 0 likes, sin historial de validación por terceros; trátese como checkpoint de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gact-cubes-21aN
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por la búsqueda no guardan relación con este checkpoint.
