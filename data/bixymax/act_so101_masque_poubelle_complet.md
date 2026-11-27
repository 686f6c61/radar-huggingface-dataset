# Bixymax/act_so101_masque_poubelle_complet

## Resumen

`act_so101_masque_poubelle_complet` es una política de aprendizaje por imitación entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face por el usuario Bixymax. No es un modelo de lenguaje: es un checkpoint de robótica pensado para controlar un brazo robótico de la familia SO101 (SO-ARM100/101 de LeRobot) en una tarea concreta de manipulación, aparentemente recoger o manipular una máscara y una papelera ("masque_poubelle"). El modelo se distribuye con la librería LeRobot de Hugging Face y el pipeline declarado es `robotics`.

El interés de esta ficha es doble. Por un lado, documenta un ejemplo real y reproducible de cómo se entrena y despliega una política ACT con LeRobot, que es hoy la vía de entrada más habitual para quienes quieren llevar un robot de bajo coste a una tarea de manipulación concreta. Por otro, permite ilustrar las limitaciones de estos checkpoints: son específicos de la tarea y del robot con el que se grabaron los datos, no generalizan a otros entornos y su evaluación requiere el hardware físico o un simulador equivalente.

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que se ejecutan en tiempo real en una GPU de consumo o incluso en CPU. La licencia es Apache 2.0. En el momento de la consulta el repositorio no registra descargas ni "likes", por lo que se trata de una publicación reciente y sin validación comunitaria conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT), política de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa observaciones por paso, no texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705. La política recibe observaciones (imágenes de cámaras y estado de las articulaciones) y predice *chunks* de acciones cortos en lugar de un único paso, lo que reduce el error de composición acumulado y suaviza la ejecución. La arquitectura combina un codificador visual (típicamente ResNet) con un transformer que modela la secuencia de acciones; el checkpoint incluye también un CVAE para capturar la multimodalidad de las demostraciones humanas. El número de parámetros (51,7 M) es coherente con una configuración ACT de tamaño pequeño-medio.

El entrenamiento se realizó a partir del dataset `Bixymax/so101_masque_poubelle_complet`, compuesto por demostraciones teleoperadas sobre un robot SO101. No se dispone de información sobre el número de episodios, la resolución de las cámaras, la composición exacta del dataset ni si se aplicaron aumentos de datos. El modelo se entrenó y publicó con LeRobot, y la model card remite a la guía oficial de entrenamiento de políticas de imitación. No se documentan fases de RLHF, DPO ni ajuste por refuerzo: es aprendizaje supervisado puro sobre demostraciones.

## Capacidades

- Control de un brazo robótico SO101 en una tarea de manipulación concreta (máscara y papelera).
- Predicción de secuencias de acciones (*action chunks*) a partir de observaciones visuales y propioceptivas.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Ejecución en tiempo real sobre GPU de consumo o CPU, dado el reducido tamaño del modelo.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni generación de texto.
- No es multilingüe ni procesa lenguaje natural; no tiene modo "thinking", visión general ni audio.

## Casos de uso

- **Automatización de una celda de pick-and-place**: el modelo se ejecuta en bucle cerrado sobre el SO101 para recoger una máscara y depositarla en una papelera, replicando la tarea para la que fue entrenado. Es adecuado porque la política está especializada exactamente en esa secuencia.
- **Banco de pruebas de LeRobot**: sirve como referencia para validar un pipeline completo de entrenamiento y despliegue (dataset, `lerobot-train`, `lerobot-record`) antes de escalar a tareas propias.
- **Docencia e investigación en aprendizaje por imitación**: permite estudiar el comportamiento de ACT con un checkpoint real y un robot de bajo coste, sin necesidad de entrenar desde cero.
- **Evaluación de robustez frente a variaciones de iluminación y posición**: al ser una política visual, se puede medir su degradación al cambiar la escena, lo que resulta útil para caracterizar los límites de ACT en entornos no controlados.
- **Prototipado rápido de demos robóticas**: para vídeos, ferias o pruebas de concepto donde se necesita un brazo ejecutando una tarea creíble con hardware asequible.
- **Punto de partida para *fine-tuning* en una tarea similar**: el checkpoint puede servir como inicialización para reentrenar con un dataset propio de manipulación de objetos pequeños, reduciendo el tiempo de convergencia.
- **Generación de datos sintéticos de evaluación**: ejecutando la política en simulación (por ejemplo, con un gemelo digital del SO101) para comparar políticas ACT entre sí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas. Tampoco se dispone de métricas de latencia o throughput medidas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en FP32 para los 51,7 M de parámetros (los pesos ocupan unos 0,2 GB); el consumo real depende del codificador visual y del tamaño de las imágenes de entrada.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha validado el flujo de LeRobot con CUDA (`--policy.device=cuda`). Una RTX 3060, RTX 4090 o A100 funcionan sin problema, aunque están sobredimensionadas para este modelo.
- **¿Cabe en GPU de consumo?**: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU para inferencia a baja frecuencia.
- **Opciones de despliegue**: LeRobot (`lerobot-record` con `--policy.path`), ejecución directa en Python con los pesos safetensors; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles. En la práctica, la frecuencia de control vendrá limitada por la captura de cámaras y el bucle de control del robot, no por el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bixymax/act_so101_masque_poubelle_complet` | 51,7 M | no aplica | Manipulación SO101 (máscara/papelera) | Apache 2.0 | Hugging Face, LeRobot |
| ACT original (paper arXiv:2304.13705) | no disponible | no aplica | Manipulación ALOHA | investigación | Paper y código de referencia |
| Políticas ACT de LeRobot (hub oficial) | variable (decenas de M) | no aplica | Múltiples tareas SO100/101 | Apache 2.0 | Hugging Face, LeRobot |
| Diffusion Policy (referencia habitual frente a ACT) | no disponible | no aplica | Manipulación visual | MIT (implementación de referencia) | Repos públicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- **Especificidad de tarea y robot**: la política está entrenada para un SO101 concreto y una tarea concreta; no generaliza a otros objetos, posiciones o robots sin reentrenamiento.
- **Dependencia de la distribución de entrenamiento**: cambios en iluminación, fondo, posición inicial de los objetos o calibración del brazo pueden degradar gravemente el comportamiento.
- **Riesgo de fallos silenciosos**: al ser una política de imitación, puede ejecutar acciones plausibles pero incorrectas sin señal de error; requiere supervisión y paradas de seguridad en producción.
- **Sin evaluación publicada**: no hay tasas de éxito ni protocolo de evaluación documentado, por lo que no se puede afirmar su fiabilidad.
- **Sesgos**: los derivados de las demostraciones humanas (sesgo de posición, velocidad y estilo del teleoperador); no aplican sesgos lingüísticos porque no es un modelo de lenguaje.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento y el hardware asociado no imponen restricciones adicionales.
- **Madurez**: repositorio sin descargas ni validación comunitaria; tratar como experimental.
- **Seguridad física**: cualquier despliegue sobre un brazo real debe incluir límites de par, paradas de emergencia y espacio de trabajo delimitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bixymax/act_so101_masque_poubelle_complet
- Dataset de entrenamiento: https://huggingface.co/datasets/Bixymax/so101_masque_poubelle_complet
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
