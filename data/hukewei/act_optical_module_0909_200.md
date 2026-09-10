# hukewei/act_optical_module_0909_200

## Resumen

El modelo `hukewei/act_optical_module_0909_200` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), el método presentado en el artículo arXiv:2304.13705. Ha sido entrenada y publicada en Hugging Face mediante la librería LeRobot y está etiquetada con el pipeline `robotics` y el tag `act`. A diferencia de un modelo de lenguaje, no procesa ni genera texto: consume observaciones (típicamente imágenes de cámaras y estado propioceptivo del robot) y emite secuencias cortas de acciones de control articuladas.

Cuenta con 51.672.712 parámetros almacenados en formato safetensors, con un tamaño de repositorio de 0,2 GB, lo que la sitúa en la gama de políticas compactas capaces de ejecutarse en hardware de consumo. Fue entrenada sobre el dataset `hukewei/optical_module_0909`, lo que sugiere una tarea de manipulación relacionada con montaje o manipulación de módulos ópticos, aunque la model card no detalla la composición del conjunto de datos ni el número de episodios.

Su relevancia radica en que ACT es una de las referencias actuales en manipulación robótica fina y bimanual de bajo coste, y este checkpoint concreto ofrece un punto de partida reproducible para experimentar con LeRobot, reentrenar sobre datos propios o desplegar control en brazos tipo SO-100/SO-101. Se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con encoder-decoder y VAE condicional (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.672.712 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume ventanas de observación y emite chunks de acciones) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors en la precisión de entrenamiento) |
| Idiomas soportados | no disponible (no aplica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una política de imitación que predice *chunks* de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado en horizontes largos y mejora la estabilidad del control. La arquitectura combina un encoder estilo transformer con un VAE condicional (CVAE) que modela la variabilidad de las demostraciones humanas, y un decoder transformer que genera la secuencia de acciones. El método también emplea *temporal ensembling* para suavizar las predicciones entre chunks solapados, una técnica descrita en el artículo original.

El entrenamiento es de tipo *behavior cloning* sobre datos de teleoperación. En este caso, el checkpoint se ha entrenado con LeRobot a partir del dataset `hukewei/optical_module_0909` mediante el comando `lerobot-train` con `--policy.type=act`. No se especifica en la información disponible el número de tokens, el número de episodios, la composición exacta del dataset, la resolución de las cámaras ni si hubo etapas de ajuste adicionales (RLHF/DPO no aplican a este tipo de política). La model card pública es mínima y no documenta hiperparámetros concretos.

## Capacidades

- Generación de acciones de control para robots manipuladores a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones, lo que permite movimientos suaves y coherentes en tareas de manipulación fina.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Compatible con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- Integración con brazos de bajo coste (la documentación de LeRobot muestra ejemplos con `so100_follower`).
- Soporte de inferencia en CPU, CUDA y otros dispositivos soportados por PyTorch.
- no disponible: capacidades de tool calling, function calling, agentes, multilingüismo, visión general, audio o modo de razonamiento explícito (no aplican a una política robótica).

## Casos de uso

- Ensamblaje o manipulación de módulos ópticos: dado el nombre del dataset de entrenamiento (`optical_module_0909`), la política está orientada a tareas de precisión en las que el robot debe colocar, insertar o alinear componentes. ACT es adecuado porque sus chunks de acciones reducen las microcorrecciones erráticas.
- Control de brazos robóticos de bajo coste (SO-100/SO-101): el checkpoint puede cargarse directamente con `lerobot-record` y `--policy.path` para ejecutar políticas sobre hardware accesible en laboratorios y aulas.
- Reentrenamiento con datos propios: sirve como plantilla para `lerobot-train` sobre nuevos datasets de teleoperación, cambiando `--dataset.repo_id` y reutilizando la configuración de ACT.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de behavior cloning y comparar variantes de ACT frente a otras políticas sobre la misma tarea.
- Recolección y validación de datos: el flujo `lerobot-record` con prefijo `eval_` facilita generar episodios de evaluación etiquetados y medir tasas de éxito.
- Automatización de pick-and-place en líneas de producción: en tareas repetitivas con objetos fijos y posiciones conocidas, una política ACT entrenada puede sustituir scripting rígido y adaptarse a pequeñas variaciones.
- Tareas bimanuales: el método ACT original fue diseñado y validado en manipulación bimanual de precisión, por lo que es aplicable a configuraciones de dos brazos con demostraciones adecuadas.
- Base para comparativas internas: al ser un checkpoint compacto y con licencia permisiva, es útil como línea base frente a políticas más grandes (VLA) en pruebas de coste/rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición, ni comparaciones con otras políticas. El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 51,67 M de parámetros ocupan aproximadamente 0,21 GB; sumando activaciones y buffers de imagen, el consumo real es de unos pocos cientos de MB, holgadamente por debajo de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100. Para una política de este tamaño, una GPU de gama media es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia no crítica en tiempo real.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`, `lerobot-eval`), con backend PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hukewei/act_optical_module_0909_200` | ACT (imitación) | 51,67 M | no aplica | apache-2.0 | Hugging Face / LeRobot |
| Diffusion Policy (Chi et al.) | Política por difusión | no disponible | no aplica | según implementación | Repos de investigación |
| SmolVLA | VLA (visión-lenguaje-acción) | ~450 M (dato público del proyecto) | no aplica | según versión | Hugging Face / LeRobot |
| OpenVLA | VLA | ~7 B (dato público) | no aplica | según versión | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: este checkpoint no publica métricas y las alternativas se evalúan habitualmente en entornos y tareas distintos, por lo que no procede una comparación directa de tasas de éxito. A igualdad de tarea, ACT suele ser más ligero y rápido de entrenar que las políticas VLA, a costa de no disponer de comprensión semántica del lenguaje.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta tool calling ni agentes.
- Especialización estrecha: está entrenado sobre un único dataset (`optical_module_0909`), por lo que su comportamiento fuera de esa distribución (objetos, iluminación, cámara o robot distintos) degradará con rapidez.
- Riesgo de sobreajuste a la tarea: sin datos de evaluación publicados no puede estimarse la generalización ni la tasa de éxito real.
- Sensibilidad a la configuración de sensores: cambios en la resolución, la calibración de las cámaras o la cinemática del robot pueden invalidar la política.
- Alucinación en sentido estricto no aplica, pero sí puede producir acciones erráticas o inseguras ante observaciones ambiguas; requiere supervisión y límites de seguridad en entornos reales.
- Idiomas: no aplica, al no procesar lenguaje natural.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con la obligación habitual de conservar los avisos de licencia y copyright.
- Documentación escasa: la model card reproduce la plantilla genérica de LeRobot y no detalla dataset, hiperparámetros ni métricas, lo que dificulta la reproducibilidad.
- Repositorio sin tracción: 0 descargas y 0 *likes*, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hukewei/act_optical_module_0909_200
- Dataset de entrenamiento: https://huggingface.co/datasets/hukewei/optical_module_0909
- Artículo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
