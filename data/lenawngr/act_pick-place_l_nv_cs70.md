# lenawngr/ACT_pick-place_L_nv_cs70

## Resumen

ACT_pick-place_L_nv_cs70 es una política robótica de imitación basada en ACT (Action Chunking with Transformers), publicada por el usuario lenawngr en Hugging Face. No es un modelo de lenguaje: es un controlador entrenado para ejecutar una tarea concreta de manipulación (pick-and-place) sobre un brazo robótico, y se distribuye dentro del ecosistema LeRobot de Hugging Face. El repositorio ocupa 0,2 GB e incluye 51.637.894 parámetros en formato safetensors.

El modelo resuelve el problema clásico de la robótica de imitación: aprender una política de control a partir de demostraciones teleoperadas, prediciendo bloques cortos de acciones (action chunks) en lugar de pasos individuales. Esta estrategia, descrita en el artículo Action Chunking with Transformers (arXiv:2304.13705), reduce el error de composición que aparece al encadenar predicciones paso a paso y suele traducirse en tasas de éxito altas en tareas de precisión.

Su relevancia es fundamentalmente práctica y acotada: sirve como ejemplo reproducible de entrenamiento y evaluación con LeRobot sobre el conjunto de datos lenawngr/pick-place_leader_not_visible. Al estar liberado bajo licencia Apache 2.0 y contar con 0 descargas y 0 likes, debe considerarse un artefacto experimental de un autor individual, no un modelo de referencia validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente CVAE para política de imitación que predice chunks de acciones |
| Parametros totales | 51.637.894 (~51,6 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (política robótica; no emplea ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; pesos en safetensors, precisión original no declarada |
| Idiomas soportados | no aplicable (modelo de control robótico, sin entrada ni salida de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705. La arquitectura combina un autoencoder variacional condicional (CVAE) que modela el estilo y la variabilidad de las demostraciones humanas con un transformer encoder-decoder que genera un chunk de acciones de longitud fija a partir de observaciones. Predecir varios pasos de una sola vez amortigua el error acumulado y permite ejecutar el control a menor frecuencia efectiva de inferencia que una política paso a paso.

Según la model card, la política se ha entrenado y subido al Hub mediante LeRobot, usando el conjunto de datos lenawngr/pick-place_leader_not_visible. El sufijo del identificador (L_nv_cs70) sugiere, sin confirmación documental, una variante con el brazo leader no visible y un tamaño de chunk de 70 acciones; este dato no está verificado en la información disponible. No se documentan en la ficha el número de episodios, la composición exacta de las observaciones (cámaras, estados de articulaciones), el número de tokens de entrenamiento ni si se aplicaron técnicas de refuerzo o ajuste fino posteriores.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) para ejecutar una tarea de pick-and-place aprendida de demostraciones teleoperadas.
- Predicción de acciones en bloque: produce varios pasos de control por inferencia, lo que reduce la frecuencia de cómputo necesaria respecto a políticas paso a paso.
- Integración nativa con LeRobot: se carga y ejecuta mediante `lerobot-record` con `--policy.path` apuntando al checkpoint.
- Evaluación sobre robot físico: compatible con el flujo de evaluación indicado en la model card (`--robot.type=so100_follower`, `--episodes=10`).
- Reentrenamiento desde cero: la ficha documenta el comando `lerobot-train` con `--policy.type=act` para reproducir el entrenamiento sobre un dataset propio.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no aplicable.
- Modo de razonamiento, visión o audio como capacidades de foundation model: no disponibles; el modelo está especializado en una única tarea de manipulación.

## Casos de uso

- Evaluación de políticas de imitación en laboratorio: cargar el checkpoint con `lerobot-record` sobre un SO-100 follower y medir la tasa de éxito en 10 episodios, tal como indica la model card, para comparar variantes de ACT (distinto chunk size, distintas cámaras).
- Reproducción de experimentos con LeRobot: sirve como referencia ejecutable para validar que una instalación de LeRobot, los drivers del robot y el pipeline de datasets funcionan de extremo a extremo antes de abordar proyectos mayores.
- Docencia en robótica e imitación: ejemplo de bajo coste computacional (51,6 M de parámetros) para explicar action chunking, CVAE y behavioral cloning con código real y pesos descargables.
- Generación de datos de evaluación: ejecutar la política de forma repetida para recopilar trayectorias etiquetadas (éxito/fracaso) que alimenten análisis de robustez o entrenamiento de modelos de valor.
- Punto de partida para fine-tuning: reutilizar la receta de entrenamiento documentada y adaptar la política a una tarea pick-and-place distinta cambiando el `dataset.repo_id`.
- Prototipado en robótica de bajo presupuesto: al caber en GPU de consumo e incluso CPU, permite montar un banco de pruebas de manipulación sin acceso a clústeres de entrenamiento.
- Automatización de tareas repetitivas de recogida y colocación en entornos controlados, siempre que la distribución de objetos y la iluminación se mantengan cercanas a las del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 51,6 M de parámetros ocupan aproximadamente 207 MB; en fp16, alrededor de 103 MB. El consumo real depende del backend y de los buffers de las cámaras de entrada.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060, RTX 4090 o similar cubren de sobra la inferencia. Las A100 o H100 no aportan ventaja relevante para este tamaño de modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU o en dispositivos tipo Jetson, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (comandos `lerobot-train` y `lerobot-record` documentados en la model card) sobre PyTorch. No se contempla soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: el diseño de action chunking está pensado para control en tiempo real a partir de observaciones de cámara, pero no se proporcionan cifras concretas de latencia ni de frecuencia de control en la información disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT_pick-place_L_nv_cs70 (este) | Politica ACT de imitacion | 51,6 M | apache-2.0 | Hugging Face, via LeRobot |
| ACT original (Zhao et al., arXiv:2304.13705) | Metodo de referencia ACT | no disponible | no disponible | Publicacion cientifica |
| Diffusion Policy (familia de politicas por difusion) | Politica de imitacion alternativa | no disponible | no disponible | Repositorios publicos de investigacion |
| SmolVLA y otras politicas de LeRobot | Politicas VLA integradas en LeRobot | no disponible | no disponible | Hugging Face, via LeRobot |

La comparación cuantitativa no es posible con los datos disponibles: no hay cifras de rendimiento publicadas para este checkpoint ni especificaciones comparables extraídas de la búsqueda. Las alternativas citadas son cualitativamente equivalentes en categoría (políticas de imitación para manipulación), pero sus parámetros, contexto y resultados no se detallan aquí por falta de datos verificados.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea pick-and-place sobre un conjunto de datos concreto; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sesgo de demostración: al ser aprendizaje por imitación, reproduce las condiciones (posiciones, iluminación, estilo del operador) presentes en lenawngr/pick-place_leader_not_visible.
- Riesgo de fallo silencioso: una política de imitación puede ejecutar movimientos plausibles pero incorrectos cuando la observación se sale de la distribución de entrenamiento; requiere supervisión y parada de emergencia en cualquier uso físico.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de reproducibilidad ni de tasas de éxito.
- Idiomas y contexto: no aplica soporte multilingüe ni ventana de contexto de texto; cualquier expectativa en ese sentido es un error de categoría.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el cumplimiento de normativa de seguridad robótica es responsabilidad del integrador.
- Metadatos incompletos: la fecha de creación registrada (2026-10-13) y el identificador cs70 no están explicados, y no se documenta la composición exacta del dataset ni la configuración de entrenamiento.
- No es un modelo de propósito general: no genera texto, no razona en lenguaje natural y no admite tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_pick-place_L_nv_cs70
- Dataset asociado: https://huggingface.co/datasets/lenawngr/pick-place_leader_not_visible
- Variante relacionada del mismo autor: https://huggingface.co/lenawngr/ACT_pick-place_v1
- Dataset pick-place del mismo autor: https://huggingface.co/datasets/lenawngr/pick-place
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Repositorio de ejemplo lerobot-pick-and-place: https://github.com/Abrar2652/lerobot-pick-and-place
