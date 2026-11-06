# felixmurraytang/act-so101-cube-to-coaster-v3

## Resumen

ACT SO-101 cube → coaster v3 es una política de imitación (policy) para robótica manipulativa, publicada por el usuario felixmurraytang en Hugging Face. No es un modelo de lenguaje: implementa la arquitectura ACT (Action Chunking with Transformers), un transformer especializado en mapear observaciones visuales y propioceptivas del robot a secuencias de acciones motoras. Está entrenada específicamente para la tarea de recoger un cubo y colocarlo sobre un posavasos con el brazo robótico de bajo coste SO-101.

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware de consumo. Se ha entrenado durante 25.000 pasos sobre el dataset `so101-cube-to-coaster-v3-trim`, alcanzando una pérdida final de aproximadamente 0,099. Según la model card, el checkpoint completó con éxito un pick-and-place completo bajo la iluminación principal de la habitación el 5 de noviembre de 2026.

Su relevancia radica en que ejemplifica el flujo actual de robótica open source de bajo coste: el brazo SO-101, la librería LeRobot de Hugging Face y políticas ACT entrenadas por imitación que cualquier desarrollador puede reproducir con un dataset propio. Es un artefacto muy específico (una única tarea, un único entorno), no un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una política de imitación que combina un codificador visual (típicamente ResNet preentrenada) con un transformer encoder-decoder que predice bloques de acciones futuras ("action chunks") en lugar de acciones individuales. Esta predicción por bloques reduce el error de acumulación y suaviza la ejecución motora, y es la razón por la que ACT se ha convertido en la política de referencia para brazos de bajo coste como el SO-101 dentro del ecosistema LeRobot.

El entrenamiento se realizó durante 25.000 pasos sobre el dataset `felixmurraytang/so101-cube-to-coaster-v3-trim`, una versión recortada de demostraciones teleoperadas de la tarea cubo → posavasos. La pérdida final reportada es de aproximadamente 0,099. No se documentan en la información disponible el número de episodios, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o regularización adicionales.

## Capacidades

- Ejecución de una tarea manipulativa concreta: recoger un cubo y depositarlo sobre un posavasos con el brazo SO-101.
- Control motor a partir de observaciones visuales y del estado propioceptivo del robot (predicción de action chunks).
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración nativa con la librería LeRobot de Hugging Face para carga, evaluación y despliegue.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".

## Casos de uso

- Reproducción de experimentos de imitación en robótica de bajo coste: sirve como checkpoint de referencia para comparar pipelines de entrenamiento ACT sobre el brazo SO-101 con un dataset propio.
- Docencia y formación en robótica: permite a estudiantes ejecutar una política entrenada end-to-end y analizar el efecto de la iluminación, la cámara y la posición inicial sobre la tasa de éxito.
- Base para fine-tuning de tareas pick-and-place: al estar entrenada en una tarea sencilla de recogida y colocación, puede servir de inicialización para variantes con otros objetos o destinos.
- Validación de infraestructura de evaluación: el script `teleop/eval_act.py` del repositorio mayphus/so101 permite medir la política en un montaje físico real antes de escalar a tareas más complejas.
- Benchmark interno de hardware: con 51,7 M de parámetros y 0,2 GB de pesos, es útil para medir latencia de inferencia en GPU de consumo o en dispositivos embebidos conectados al brazo.
- Demostración de flujo completo LeRobot: desde la grabación de demostraciones hasta el despliegue de la política, útil como plantilla de proyecto reproducible de principio a fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de entrenamiento (≈ 0,099) y una evaluación cualitativa: un pick-and-place completo exitoso bajo la iluminación principal de la habitación el 5 de noviembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros; en la práctica, el cuello de botella es el codificador visual y el preprocesado de imágenes, no el transformer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está muy sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de gama media o superior, e incluso en iGPU o dispositivos embebidos con suficiente memoria.
- Opciones de despliegue: LeRobot (carga nativa del checkpoint), script `teleop/eval_act.py` del repositorio mayphus/so101. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT SO-101 cube → coaster v3 | 51,7 M | Pick-and-place cubo → posavasos (SO-101) | no aplica | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | Tareas manipulativas diversas | no aplica | según checkpoint | Hugging Face (LeRobot) |
| Difusion policies (p. ej. Diffusion Policy) | variable | Manipulación por imitación | no aplica | según implementación | Repositorios de investigación |
| VLA generalistas (p. ej. RT-2, OpenVLA) | miles de millones | Manipulación guiada por lenguaje | limitado | varía | Principalmente investigación |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (cubo → posavasos) con un único brazo (SO-101) y un entorno concreto; no generaliza a otros objetos, posiciones o robots sin reentrenamiento.
- Sensibilidad a condiciones de iluminación y cámara: la propia model card menciona que el éxito se logró bajo la iluminación principal de la habitación, lo que sugiere dependencia del entorno visual de entrenamiento.
- Sin datos de robustez: no se reportan tasas de éxito cuantitativas, número de ensayos ni intervalos de confianza, por lo que la fiabilidad real es desconocida.
- Riesgo de sobreajuste al dataset recortado: el dataset `-trim` sugiere una selección de episodios que puede reducir la variabilidad cubierta.
- Sin capacidades de lenguaje ni razonamiento simbólico: no debe presentarse como un modelo de propósito general.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felixmurraytang/act-so101-cube-to-coaster-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/felixmurraytang/so101-cube-to-coaster-v3-trim
- Repositorio de evaluación: https://github.com/mayphus/so101
- LeRobot (librería): https://github.com/huggingface/lerobot
