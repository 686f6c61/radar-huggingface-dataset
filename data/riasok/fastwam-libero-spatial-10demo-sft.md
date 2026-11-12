# Riasok/fastwam-libero-spatial-10demo-sft

## Resumen

FastWAM few-shot SFT es una política robótica de manipulación entrenada mediante aprendizaje por imitación sobre el benchmark LIBERO-Spatial. El modelo parte de `lerobot/fastwam_base` y se afina con solo 10 demostraciones por tarea (100 episodios en total, semilla 0) durante 6000 pasos, congelando el experto de vídeo y entrenando únicamente el experto de acción. Lo publica el usuario Riasok bajo licencia Apache 2.0 y en formato LeRobot `pretrained_model`.

El modelo resuelve el problema de obtener una política inicial funcional con muy pocos datos de demostración, sirviendo como base deliberadamente débil para experimentos posteriores de ajuste fino por refuerzo. Con 6.020.710.599 parámetros y un repositorio de 12 GB en safetensors, está pensado para entornos de investigación en robótica más que para despliegue comercial directo.

Es relevante ahora porque demuestra que un esquema de entrenamiento few-shot sobre un backbone preentrenado (FastWAM) puede alcanzar tasas de éxito moderadas (61 % con 10 pasos de denoising en LIBERO-Spatial) sin necesidad de grandes volúmenes de teleoperación, lo que reduce coste de recolección de datos en laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM (experto de vídeo congelado + experto de acción entrenable), política robótica LeRobot |
| Parametros totales | 6.020.710.599 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin salida lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (directorio LeRobot `pretrained_model`) |

## Arquitectura y entrenamiento

El modelo se basa en FastWAM, una arquitectura de política robótica que combina un experto de vídeo (congelado durante el ajuste fino) con un experto de acción entrenable. En esta ficha, solo el experto de acción recibe gradientes; el experto de vídeo permanece intacto respecto a `lerobot/fastwam_base`. El entrenamiento se realizó sobre un subconjunto de LIBERO-Spatial con 10 demostraciones por tarea (100 episodios, semilla 0, índices en `fewshot_10demo_seed0_episodes.json`), durante 6000 pasos con batch 8 en 2 GPUs y learning rate 1e-4. El pipeline incluye un postprocesador de política (`policy_postprocessor.json`) que aplica un paso de conmutación del gripper.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset más allá de LIBERO-Spatial, ni sobre etapas de RLHF o DPO, que no aplican a este tipo de modelo. La innovación técnica destacable es el régimen few-shot (10 demos/tarea) sobre un backbone preentrenado, que permite obtener una política inicial útil con muy poca teleoperación.

## Capacidades

- Generación de acciones motoras para manipulación robótica en entornos LIBERO-Spatial.
- Control de pinza (gripper) mediante postprocesador dedicado con conmutación explícita.
- Ejecución de políticas condicionadas por observaciones visuales y estado del robot (experto de vídeo congelado como representación).
- Denoising iterativo configurable: la evaluación reporta resultados con 8 y 10 pasos de denoising.
- Aprendizaje por imitación few-shot: capacidad de partir de muy pocas demostraciones por tarea.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelos fundacionales de texto.

## Casos de uso

- Punto de partida para ajuste fino por refuerzo: la model card indica explícitamente que es una base débil deliberada para experimentos de RL; se usaría como inicialización de políticas que luego se optimizan con recompensas en simulación.
- Investigación en aprendizaje few-shot de robótica: permite estudiar cuánto rendimiento se obtiene con 10 demos/tarea frente a regímenes con más datos, usando LIBERO-Spatial como banco de pruebas reproducible.
- Evaluación comparativa de políticas de manipulación: al estar en formato LeRobot `pretrained_model`, se integra en pipelines de evaluación estándar de LeRobot para comparar con otras políticas sobre los mismos estados iniciales deterministas.
- Reproducción de experimentos académicos: los índices de episodios (`fewshot_10demo_seed0_episodes.json`), la configuración de entrenamiento (`train_config.json`) y el postprocesador permiten replicar el entrenamiento y la evaluación.
- Prototipado de control de pinza en tareas de manipulación: el postprocesador de gripper incluido facilita probar políticas con conmutación de pinza en entornos simulados.
- Desarrollo de pipelines de simulación-a-realidad: sirve como política candidata para transferencia inicial antes de ajuste en hardware real, aunque con las limitaciones de éxito observadas.
- Docencia y formación en robótica: ejemplo completo de flujo LeRobot (entrenamiento, postprocesado, evaluación) con datos y configuración publicados.

## Benchmarks y rendimiento

Evaluación reportada en la model card sobre LIBERO-Spatial con estados iniciales deterministas:

| Configuracion | Episodios | Exito |
|---|---:|---:|
| 10 pasos de denoising | 500 | 61 % |
| 8 pasos de denoising, estados iniciales 0-19 | 200 | 59 % (118/200) |

Éxitos por tarea sobre 20 episodios (8 pasos, tareas 0-9): 15, 17, 19, 15, 10, 17, 16, 1, 5, 3. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6.020.710.599 parámetros en safetensors y repo de 12 GB, la inferencia en precisión completa requiere del orden de 12 GB solo para pesos, más memoria para activaciones y observaciones.
- GPU recomendadas: no especificadas en la información; el entrenamiento usó 2 GPUs con batch 8, lo que sugiere GPUs de gama profesional (A100/H100 o equivalentes) para reproducir el ajuste fino.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos, una GPU de consumo con 16-24 GB podría alojar los pesos, pero no hay datos publicados de latencia ni de viabilidad.
- Opciones de despliegue: formato LeRobot `pretrained_model`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Riasok/fastwam-libero-spatial-10demo-sft | 6.020.710.599 | no disponible | 61 % (10 pasos) / 59 % (8 pasos) en LIBERO-Spatial | Apache 2.0 | Hugging Face |
| lerobot/fastwam_base | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas LeRobot para LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría más allá del modelo base del que deriva.

## Limitaciones y advertencias

- Rendimiento deliberadamente limitado: la model card lo describe como una base few-shot débil; el éxito global del 59-61 % oculta tareas con éxito muy bajo (tareas 7, 8 y 9 con 1, 5 y 3 éxitos de 20).
- Entrenado únicamente sobre LIBERO-Spatial: no generaliza a otros benchmarks o entornos sin ajuste adicional.
- Solo el experto de acción fue entrenado; el experto de vídeo congelado limita la adaptación a distribuciones visuales distintas de las de `fastwam_base`.
- Riesgo de sobreajuste a los 100 episodios few-shot y a la semilla 0; la reproducibilidad depende de los índices de episodios publicados.
- Sin datos sobre sesgos, alucinación o limitaciones de idioma, al no ser un modelo de lenguaje; no aplica la evaluación habitual de sesgos textuales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está orientado a investigación y no se han publicado garantías de seguridad en hardware real.
- No hay información sobre cuantizaciones disponibles ni sobre latencia, lo que dificulta planificar despliegues en tiempo real.
- El postprocesador de gripper es específico de esta política; usarlo sin el archivo `policy_postprocessor.json` alteraría el comportamiento esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Riasok/fastwam-libero-spatial-10demo-sft
- Modelo base: https://huggingface.co/lerobot/fastwam_base
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Benchmark LIBERO: https://libero-project.github.io/
