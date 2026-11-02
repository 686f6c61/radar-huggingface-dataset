# lerobot-projects/2-bin-recycle-with-Dit-Policy

## Resumen

`2-bin-recycle-with-Dit-Policy` es una política de control robótico entrenada con LeRobot, el framework de Hugging Face para aprendizaje por imitación y refuerzo en robótica. El modelo implementa una arquitectura Diffusion Transformer (DiT) que genera secuencias de acciones motoras a partir de observaciones sensoriales, en este caso orientada a una tarea concreta de clasificación de residuos en dos contenedores (2-bin-recycle). Lo publica el usuario `lerobot-projects` y el entrenamiento se registró en un dashboard de Weights & Biases alojado en CoreWeave, con el run ID `1zqowpvs`.

El checkpoint publicado corresponde al paso 20.000 del entrenamiento y contiene 220.543.750 parámetros en formato safetensors, con un tamaño de repositorio de 0,9 GB. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que actúa como política visomotora que mapea observaciones (típicamente imágenes de cámara y estado del robot) a acciones de control de bajo nivel.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de una política DiT para manipulación robótica entrenada con LeRobot, útil para investigadores que quieran replicar el pipeline, comparar arquitecturas de política (DiT frente a ACT o diffusion policy clásica) o reutilizar los pesos como punto de partida en tareas de clasificación de residuos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) |
| Parametros totales | 220.543.750 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Framework | LeRobot |
| Checkpoint | paso 20.000 |
| Tamaño del repositorio | 0,9 GB |
| Pipeline declarado | robotics |
| Run de entrenamiento | WandB `1zqowpvs` (CoreWeave) |

## Arquitectura y entrenamiento

El modelo es una Diffusion Transformer (DiT) empleada como política de imitación. En este esquema, la red aprende a generar una trayectoria de acciones mediante un proceso de difusión: parte de ruido y lo denoisa condicionado por las observaciones del entorno (imágenes y estado del robot), produciendo chunks de acciones ejecutables por el manipulador. La elección de un transformer como backbone de denoising sigue la línea de DiT aplicada a control, frente a las U-Nets usadas en diffusion policy clásica.

El entrenamiento se realizó con LeRobot, que estandariza el pipeline de datos (episodios de demostración), el bucle de entrenamiento y el registro de métricas. El checkpoint publicado corresponde al paso 20.000 y el autor enlaza curvas de pérdida, evaluación y métricas de sistema en un dashboard de Weights & Biases alojado en CoreWeave. No se especifican en la información disponible el número de episodios de demostración, la composición del dataset, la resolución de las cámaras, la frecuencia de control ni si hubo fases de ajuste fino con refuerzo; tampoco se detalla el scheduler de difusión ni el número de pasos de denoising en inferencia.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones visomotoras para la tarea de clasificación en dos contenedores.
- Aprendizaje por imitación: reproduce comportamientos derivados de demostraciones humanas o teleoperadas.
- Generación de trayectorias multimodales: la formulación por difusión permite representar varias soluciones válidas para una misma observación, algo que los modelos deterministas de regresión de acciones no capturan bien.
- Ejecución de políticas de manipulación de horizonte corto (chunks de acción), adecuada para tareas de pick-and-place.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política de control, no un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan capacidades de visión general (VQA, OCR, grounding); la percepción se limita a la codificación de observaciones para la política.

## Casos de uso

- Clasificación automatizada de residuos en entornos de laboratorio: el modelo puede integrarse en un brazo manipulador con cámara cenital para depositar objetos en uno de dos contenedores según su categoría, usando los pesos publicados como política lista para evaluar en un setup equivalente.
- Reproducción de experimentos en robótica con LeRobot: sirve como referencia para validar el pipeline completo (dataset, entrenamiento DiT, evaluación) y comparar curvas de pérdida y éxito con otras políticas del mismo framework.
- Punto de partida para ajuste fino en tareas de reciclaje con más contenedores: al ser una política DiT entrenada en una tarea de dos clases, puede servir de inicialización para variantes con más categorías, reduciendo el coste de entrenamiento desde cero.
- Benchmarking de arquitecturas de política: comparar DiT frente a ACT, diffusion policy con U-Net o VQ-BeT en la misma tarea y mismo dataset para medir tasa de éxito y suavidad de trayectoria.
- Docencia y formación en aprendizaje por imitación: el repositorio, con checkpoint y curvas de entrenamiento enlazadas, permite ilustrar el ciclo completo de entrenamiento de una política visomotora en un curso de robótica o machine learning aplicado.
- Evaluación de robustez ante variaciones de iluminación y posición de objetos: al ser una política de difusión, permite analizar cómo se degrada la tasa de éxito al cambiar condiciones respecto al dataset de entrenamiento, un análisis habitual antes de desplegar en producción.
- Integración en simuladores compatibles con LeRobot para pruebas de sim-to-real antes de ejecutar en hardware físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo enlaza curvas de pérdida y evaluación en un dashboard externo de Weights & Biases, sin cifras de tasa de éxito, error de posición ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 220,5 millones de parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 0,88 GB; en fp16/bf16, unos 0,44 GB. La VRAM real dependerá del tamaño de las observaciones (resolución de cámara) y del número de pasos de denoising, no solo del tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería bastar para inferencia en fp16, incluidas RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100. Para entrenamiento o ajuste fino conviene una GPU con 16 GB o más (RTX 4090, A100, L40S).
- Cabe en GPU de consumo: sí, con margen amplio, incluso en tarjetas de gama media con 6-8 GB de VRAM si se reduce la resolución de entrada o el batch.
- Opciones de despliegue: LeRobot (framework nativo del checkpoint), con exportación a ONNX o TorchScript para servir en un bucle de control en tiempo real. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles. En políticas de difusión, la latencia está dominada por el número de pasos de denoising y la frecuencia de control del robot; conviene medirla en el hardware objetivo antes de desplegar.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 2-bin-recycle-with-Dit-Policy | DiT (diffusion transformer) | 220,5 M | no aplica | Clasificación en 2 contenedores | no disponible | Hugging Face (lerobot-projects) |
| Políticas ACT de LeRobot | Transformer encoder-decoder | variable según checkpoint | no aplica | Manipulación general | según checkpoint | Hugging Face (hub de LeRobot) |
| Diffusion Policy (U-Net) | U-Net de difusión | variable | no aplica | Manipulación general | según implementación | Repositorios de investigación |
| VQ-BeT | Transformer con cuantización de acciones | variable | no aplica | Manipulación general | según checkpoint | Hugging Face (hub de LeRobot) |

La comparación numérica de rendimiento entre estas alternativas no está disponible en la información proporcionada; las filas de modelos comparables se incluyen solo a efectos de categoría y arquitectura.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (clasificación en dos contenedores) y un único setup de robot y cámaras; no generaliza a otras tareas ni a otras morfologías sin reentrenamiento o ajuste fino.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin documentación de sesgos ni de evaluación de robustez: no se publican tasas de éxito, matrices de confusión ni análisis de fallos, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste al dataset de demostración: al ser aprendizaje por imitación, la política puede fallar ante posiciones de objetos, iluminación o fondos distintos a los vistos en entrenamiento.
- Sin información sobre el dataset: se desconoce el número de episodios, la diversidad de objetos y las condiciones de captura, lo que dificulta estimar la cobertura del dominio.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX ni int8 listas para usar; cualquier optimización para despliegue corre a cargo del usuario.
- Modelo no lingüístico: no debe evaluarse con benchmarks de texto (MMLU, GSM8K, HumanEval) ni usarse para tareas de NLP.
- Checkpoint intermedio: el paso 20.000 puede no ser el mejor punto de entrenamiento; conviene revisar las curvas del dashboard de WandB antes de usarlo como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot-projects/2-bin-recycle-with-Dit-Policy
- Dashboard de Weights & Biases (CoreWeave): https://forge.coreweave.com/wandb/giorzervas-athens-university-of-economics-and-business/lerobot/runs/1zqowpvs?nw=nwusergiorzervas
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
