# raihan-js/demodoctor-act-cleaned-s0

## Resumen

`raihan-js/demodoctor-act-cleaned-s0` es una politica robótica de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), entrenada con la librería LeRobot de HuggingFace y publicada por el desarrollador raihan-js (Akteruzzaman Raihan Sikder). No es un modelo de lenguaje: es un controlador viso-motor que consume una imagen de 96x96 píxeles y un vector de estado de 2 dimensiones, y produce una acción continua de 2 dimensiones. El modelo tiene 51.660.418 parámetros y un repositorio de 0,2 GB, lo que lo sitúa en el rango de las politicas ligeras que pueden ejecutarse en hardware de consumo.

El modelo forma parte del proyecto DemoDoctor, cuyo objetivo es medir de forma controlada cómo afecta la calidad de las demostraciones al éxito de una politica. En concreto, esta variante "cleaned-s0" se ha entrenado sobre el dataset `raihan-js/demodoctor-pusht-cleaned`, una versión de 175 episodios (21.735 fotogramas a 10 FPS) del clásico benchmark PushT: empujar un bloque con forma de T hasta una diana con forma de T. El sufijo "s0" corresponde a la semilla 0 del entrenamiento.

La relevancia actual del modelo es doble. Por un lado, sirve como referencia reproducible para investigadores que quieran comparar el efecto de la limpieza de datos (frente a datos corruptos o sin limpiar) sobre la tasa de éxito de una politica. Por otro, es un ejemplo canónico de ACT dentro del ecosistema LeRobot, con licencia Apache 2.0, lo que facilita su reutilización, su fine-tuning y su despliegue en robots de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (ACT, Action Chunking with Transformers) con codificador visual ResNet |
| Parametros totales | 51.660.418 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (politica de control; usa horizonte de observación y chunk de acción no especificados en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No aplica (politica robótica sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.6.1) |
| Pipeline | robotics |
| Entradas | `observation.image` VISUAL (3, 96, 96); `observation.state` STATE (2,) |
| Salidas | `action` ACTION (2,) |
| Camaras | `image` (una camara) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el articulo arXiv:2304.13705. En lugar de predecir una única acción por paso, el modelo predice un "chunk" o secuencia corta de acciones futuras, lo que reduce el error de composición y estabiliza el control. La arquitectura combina un codificador visual (típicamente un ResNet) que procesa la imagen de 96x96, un proyector del vector de estado de 2 dimensiones y un transformer encoder-decoder que genera las acciones. El entrenamiento se realiza por imitación supervisada sobre demostraciones teleoperadas, con una perdida de reconstrucción (L1 sobre las acciones) más un término de regularización sobre la variable latente estilo VAE.

Los datos de entrenamiento provienen del dataset `raihan-js/demodoctor-pusht-cleaned`: 175 episodios y 21.735 fotogramas grabados a 10 FPS, con la tarea "Push the T-shaped block onto the T-shaped target". La configuración reportada es de 60.000 pasos de entrenamiento, batch de 32, optimizador AdamW, learning rate 1e-05 y semilla 0. No se documenta el uso de RLHF, DPO ni otras fases de alineamiento, algo esperable en una politica de imitación. La innovación relevante aquí no está en la arquitectura (que es el ACT estándar) sino en el contexto experimental: el proyecto DemoDoctor inyecta fallos conocidos en demostraciones limpias, los detecta a partir de señales y mide el éxito de la politica sobre datos limpios, corruptos y auto-limpiados.

## Capacidades

- Control viso-motor continuo: genera acciones de 2 dimensiones a partir de una imagen de 96x96 y un estado de 2 dimensiones.
- Predicción por chunks: emite secuencias cortas de acciones (action chunking), lo que aporta suavidad temporal al control.
- Ejecución de la tarea PushT: empujar un bloque con forma de T hasta una diana con forma de T, en un plano 2D.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas; no requiere recompensa ni entorno de RL.
- Integración con LeRobot: se ejecuta con el comando `lerobot-rollout` y se puede reentrenar con `lerobot-train`.
- Reproducibilidad experimental: al ser la variante "cleaned" de la semilla 0, sirve como punto de comparación frente a politicas entrenadas con datos corruptos.
- No soporta tool calling, ni agentes multi-paso, ni capacidades multilingües, ni visión semántica general: es una politica especializada de un único dominio.

## Casos de uso

- Investigación sobre calidad de datos: utilizar esta politica entrenada con datos limpios como referencia y comparar su tasa de éxito frente a variantes entrenadas con demostraciones corruptas o auto-limpiadas dentro del mismo proyecto DemoDoctor.
- Benchmarking de imitación en PushT: emplear el modelo como linea base reproducible (semilla 0, 60.000 pasos) en experimentos de manipulación planar 2D, lo que facilita comparaciones entre metodos.
- Aprendizaje por imitación en robots de bajo coste: al tener solo 51,66 M de parámetros y una entrada de 96x96, puede ejecutarse en brazos robóticos económicos con una cámara y GPU modesta, siguiendo el flujo de LeRobot.
- Fine-tuning en tareas de empuje relacionadas: partir de estos pesos y reentrenar con el comando `lerobot-train` sobre un dataset propio de empuje o colocación de objetos en el plano.
- Validación de pipelines de entrenamiento continuo: integrar el reentrenamiento de la politica en un pipeline de CI que verifique que los checkpoints se generan y que la tasa de éxito no se degrada.
- Docencia y divulgación en robótica: usar una politica pequeña y de licencia permisiva como ejemplo didáctico del ciclo completo (grabación de datos, entrenamiento con ACT y despliegue con `lerobot-rollout`).
- Ablación de semillas: al existir el sufijo "s0", permite estudiar la varianza entre semillas replicando el entrenamiento con otras semillas sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explícita: "No evaluation results have been provided for this policy yet", por lo que no hay tabla de tasa de éxito real en robot (trials, successes, success rate) ni resultados de simulación verificables. No se deben asumir cifras de PushT a partir de la literatura, ya que corresponderían a otras configuraciones y datasets.

## Requisitos de hardware

- VRAM estimada: al tener 51.660.418 parámetros, los pesos en FP32 ocupan aproximadamente 207 MB y en FP16 aproximadamente 103 MB. Sumando activaciones del codificador visual y del transformer, el consumo de inferencia se mantiene por debajo de 1 GB en la mayoría de configuraciones, aunque no se publican cifras oficiales.
- GPU recomendadas: cabe holgadamente en cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100 o H100. El modelo no requiere aceleradores de gama alta.
- GPU de consumo: sí, cabe en GPU de consumo e incluso puede ejecutarse en CPU para inferencia, dado su tamaño reducido.
- Opciones de despliegue: la via oficial es LeRobot (`lerobot-rollout` para ejecutar y `lerobot-train` para reentrenar), sobre PyTorch y pesos safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a politicas de control.
- Latencia y throughput: no se publican medidas. El único dato relacionado es que los datos de entrenamiento se grabaron a 10 FPS, por lo que el bucle de control en tiempo real debe respetar una frecuencia compatible con la de entrenamiento; no se especifica la latencia real del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `raihan-js/demodoctor-act-cleaned-s0` (este modelo) | 51,66 M | No disponible | Sin resultados publicados | apache-2.0 | HuggingFace |
| ACT estándar (referencia del paper arXiv:2304.13705) | No disponible | No disponible | Success rate reportado en el paper original de PushT; no comparable directamente | No disponible | Paper y repositorio |
| Diffusion Policy (alternativa de imitación en LeRobot) | No disponible | No disponible | No disponible | No disponible | LeRobot |
| VQ-BeT u otras politicas de LeRobot para PushT | No disponible | No disponible | No disponible | No disponible | HuggingFace / LeRobot |

Los datos concretos de parámetros, contexto y rendimiento de las alternativas no están disponibles en la información proporcionada. La comparación fiable solo es posible dentro del propio proyecto DemoDoctor, comparando esta variante "cleaned" con sus equivalentes sobre datos corruptos y auto-limpiados.

## Limitaciones y advertencias

- Dominio cerrado: la politica está entrenada exclusivamente para la tarea PushT (empujar un bloque en T hasta una diana en T) y no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación: no hay evidencia publicada de tasa de éxito, ni en simulación ni en robot real, por lo que no se puede garantizar un rendimiento mínimo.
- Sesgos de los datos: al depender de demostraciones teleoperadas, hereda los sesgos, la distribución de posiciones iniciales y las condiciones de iluminación del dataset `raihan-js/demodoctor-pusht-cleaned`.
- Riesgo de fallo por cambio de entorno: variaciones en la posición de los objetos, la iluminación, la cámara o el robot pueden degradar el comportamiento, algo típico en politicas de imitación.
- Entrada visual limitada: la imagen se reduce a 96x96 píxeles, lo que restringe la percepción de detalles finos.
- Frecuencia de control: los datos se grabaron a 10 FPS; ejecutar el bucle a una frecuencia distinta puede afectar a la estabilidad.
- Sin capacidades de lenguaje ni de agentes: no soporta tool calling, razonamiento multi-paso ni conversación; no debe confundirse con un LLM.
- Licencia: Apache 2.0, permisiva para uso comercial, pero sin garantías por parte del autor; conviene verificar la licencia del dataset de entrenamiento antes de un uso comercial.
- Madurez: el repositorio tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha, y la fecha de creación indicada es 2026-10-04; se trata de un artefacto experimental, no de un modelo consolidado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raihan-js/demodoctor-act-cleaned-s0
- Dataset de entrenamiento: https://huggingface.co/datasets/raihan-js/demodoctor-pusht-cleaned
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=raihan-js/demodoctor-pusht-cleaned
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Proyecto DemoDoctor en GitHub: https://github.com/raihan-js/demodoctor
- Perfil de GitHub del autor: https://github.com/raihan-js/
- Web personal del autor: https://raihan-js.github.io/
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
