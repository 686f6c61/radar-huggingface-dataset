# KyraLeeChunWei/Acetylcysteine_e250_ACT_20K

## Resumen

Acetylcysteine_e250_ACT_20K es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario KyraLeeChunWei y publicado en Hugging Face mediante la librería LeRobot de Hugging Face, que estandariza el entrenamiento, la serialización y el despliegue de políticas robóticas.

El modelo resuelve el problema del control motor fino en tareas de manipulación aprendidas a partir de datos de teleoperación. En lugar de predecir una única acción por paso temporal, ACT genera un chunk de acciones futuras, lo que reduce el error acumulado y mejora la estabilidad del control. Está entrenado sobre el dataset e150_Acetylcysteine y contiene aproximadamente 51,7 millones de parámetros en formato safetensors.

Es relevante porque ejemplifica el flujo de trabajo actual de LeRobot para políticas de imitación ligeras, desplegables en hardware de consumo y compatibles con brazos robóticos de bajo coste como el SO-100. Su licencia Apache 2.0 facilita su reutilización comercial, aunque la información pública disponible sobre el modelo es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parámetros totales | 51.678.855 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; depende de la ventana de observación configurada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que combina un encoder que procesa las observaciones (imágenes de cámaras y estado de las articulaciones) con un decoder que genera chunks de acciones de longitud fija. Esta formulación, descrita en el paper arXiv:2304.13705, mitiga el problema de la predicción de acciones individuales, que tiende a acumular errores y producir movimientos temblorosos. El modelo incorpora mecanismos de atención sobre las observaciones y una representación latente del estilo de la trayectoria.

El entrenamiento se realizó con LeRobot sobre el dataset KyraLeeChunWei/e150_Acetylcysteine, compuesto por episodios de teleoperación. No se dispone de información pública sobre el número exacto de episodios, la composición del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos o regularización específicas. Tampoco hay datos sobre RLHF, DPO ni procesos de refinamiento posteriores, que no son habituales en este tipo de políticas de imitación.

## Capacidades

- Control robótico de manipulación mediante predicción de chunks de acciones.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Procesamiento de observaciones multimodales (imágenes de cámaras y estado de articulaciones) según la configuración estándar de ACT en LeRobot.
- Ejecución en robots de bajo coste compatibles con LeRobot, como el SO-100 follower.
- Entrenamiento y evaluación reproducibles mediante los comandos `lerobot-train` y `lerobot-record`.
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto.
- No dispone de capacidades multilingües, visión general, audio ni modo de razonamiento.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política predice chunks de acciones que suavizan el control de articulaciones en tareas de pick-and-place, adecuada para entornos controlados donde se ha recogido teleoperación específica.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT, ajustes de hiperparámetros o nuevos datasets, gracias a su integración nativa con LeRobot.
- Despliegue en robots de bajo coste: el tamaño de 51,7 M de parámetros permite ejecutar inferencia en GPU de consumo o incluso en CPU, lo que facilita prototipos con brazos SO-100 en entornos educativos.
- Automatización de tareas repetitivas de ensamblaje: el modelo puede aprender trayectorias específicas de inserción o atornillado a partir de demostraciones y replicarlas con variabilidad limitada.
- Evaluación de pipelines de datos de teleoperación: permite validar la calidad del dataset e150_Acetylcysteine y detectar problemas de calibración o sincronización antes de escalar la recolección de datos.
- Docencia y formación en robótica: su licencia Apache 2.0 y su formato safetensors facilitan su uso en cursos prácticos de aprendizaje por imitación sin restricciones comerciales.
- Pruebas de integración con LeRobot: útil para verificar flujos de entrenamiento, checkpoints y evaluación con `lerobot-record` en nuevas versiones de la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros; en la práctica, el consumo depende del tamaño de las imágenes de entrada y del batch, pero es holgadamente inferior a 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, RTX 4090, A100 o H100; el modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la resolución de cámara y la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Acetylcysteine_e250_ACT_20K | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (referencia) | no disponible | no aplica | no disponible | MIT (implementación de referencia) | Repositorios públicos |
| ACT original (paper) | no disponible | no aplica | éxito alto en tareas de manipulación según el paper | según implementación | arXiv:2304.13705 |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset concreto de teleoperación, la política puede sobreajustarse a las condiciones de iluminación, posiciones de cámara y objetos presentes en e150_Acetylcysteine.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje; su ventana de observación y la longitud del chunk de acciones están fijadas por la configuración de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias del dataset subyacente y de las dependencias de LeRobot.
- Caveats para producción: no hay información pública sobre la tasa de éxito, la robustez ante perturbaciones ni la seguridad física; se recomienda validación exhaustiva en entornos controlados antes de cualquier despliegue real.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/KyraLeeChunWei/Acetylcysteine_e250_ACT_20K
- Dataset: https://huggingface.co/datasets/KyraLeeChunWei/e150_Acetylcysteine
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
