# aDaikiKamata/patch_policy_libero_object_tipsv2_smoke

## Resumen

El modelo `aDaikiKamata/patch_policy_libero_object_tipsv2_smoke` es una política robótica (policy) basada en el método Patch Policy, entrenada con la librería LeRobot de Hugging Face. Está diseñada para tareas de manipulación en el entorno simulado LIBERO, concretamente para recoger objetos de una mesa y colocarlos en una cesta. El autor, aDaikiKamata, ha publicado este modelo como un experimento de aprendizaje por imitación, probablemente una prueba de humo (smoke test) dado el bajo número de pasos de entrenamiento (100).

Patch Policy es un enfoque reciente que utiliza representaciones visuales densas de un Vision Transformer (ViT) pre-entrenado y congelado, en lugar de representaciones globales (global pooling). Según la página oficial del método, esto logra una mejora relativa del 40% frente a políticas que usan representaciones globales en cuatro suites de simulación y tres entornos reales. El modelo tiene 211,7 millones de parámetros y se distribuye en formato safetensors, con licencia Apache 2.0.

Este modelo es relevante para la comunidad de robótica porque demuestra cómo aplicar Patch Policy sobre el dataset LIBERO Object, un benchmark estándar para evaluación de políticas de manipulación. Al estar integrado con LeRobot, puede ejecutarse directamente en robots reales tipo Franka Panda, lo que facilita la reproducibilidad y la experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Patch Policy) |
| Parametros totales | 211.689.223 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Patch Policy es una política basada en Transformer que procesa directamente representaciones visuales densas extraídas de un Vision Transformer pre-entrenado y congelado. En lugar de aplicar un pooling global a las características visuales, la política opera sobre los parches individuales, lo que conserva información espacial detallada y mejora la precisión en tareas de manipulación. El modelo consume dos imágenes (cámara frontal y cámara en la muñeca) de 256x256 píxeles, junto con un vector de estado de 8 dimensiones, y produce una acción de 7 dimensiones (posición y orientación del efector final).

El entrenamiento se realizó con LeRobot sobre el dataset `lerobot/libero_object_image`, que contiene 454 episodios y 66.984 fotogramas a 10 FPS. Las tareas consisten en recoger diez objetos distintos (zumo de naranja, kétchup, queso crema, etc.) y colocarlos en una cesta. La configuración de entrenamiento incluye 100 pasos, tamaño de lote 128, optimizador AdamW con tasa de aprendizaje 5e-05 y semilla 1000. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitación supervisado. Dado el bajo número de pasos, es probable que el modelo esté subentrenado y sirva como prueba de concepto.

## Capacidades

- Generacion de acciones de control robotico: produce un vector de 7 dimensiones (posicion y orientacion del efector final) a partir de observaciones visuales y de estado.
- Manipulacion de objetos en simulacion: capaz de recoger y colocar objetos en una cesta en el entorno LIBERO.
- Entrada multimodal: procesa dos camaras (frontal y muneca) junto con el estado del robot.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo robots reales tipo Panda.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes conversacionales.
- No tiene modo de pensamiento (thinking mode) ni capacidades de vision general fuera del contexto robotico.

## Casos de uso

- Evaluacion de algoritmos de aprendizaje por imitacion: los investigadores pueden usar este modelo como punto de partida para comparar metodos de politica visual en el benchmark LIBERO Object, ejecutando episodios de rollout en simulacion.
- Pruebas de integracion con LeRobot: sirve para verificar que el pipeline de entrenamiento, guardado y carga de politicas funciona correctamente, especialmente en entornos de CI/CD.
- Transferencia a robot real Franka Panda: aunque entrenado en simulacion, puede desplegarse en un robot Panda real mediante el comando `lerobot-rollout`, ajustando las camaras y el puerto del robot.
- Estudio de eficiencia de Patch Policy: al tener solo 211M de parametros, es util para analizar el equilibrio entre tamaño del modelo y rendimiento en tareas de manipulacion.
- Generacion de datos sinteticos de demostracion: el modelo puede ejecutarse en simulacion para generar trayectorias de ejemplo que luego se usen para entrenar otras politicas.
- Educacion y formacion en robotica: como ejemplo funcional de una politica entrenada con LeRobot, permite a estudiantes y desarrolladores aprender el flujo completo de entrenamiento y despliegue sin necesidad de un robot fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este modelo en la informacion disponible. La pagina oficial de Patch Policy menciona una mejora relativa del 40% frente a representaciones globales en varios entornos, pero no se proporcionan numeros concretos para este checkpoint concreto. Dado que el entrenamiento fue de solo 100 pasos, es probable que el rendimiento en las tareas LIBERO sea bajo y no representativo del metodo completo.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Con 211,7 millones de parametros, el modelo en precision fp32 ocuparia aproximadamente 850 MB, y en fp16 unos 425 MB, pero al procesar dos imagenes de 256x256, la memoria adicional para activaciones puede elevar el requisito a 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para inferencia, por ejemplo una NVIDIA GTX 1650, RTX 3060 o superior. Para entrenamiento, se recomienda una GPU con 8 GB o mas.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs consumer modernas.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la politica en simulacion o en un robot real. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser una politica de un solo paso (no autoregresiva), la latencia por paso deberia ser baja, pero no se han medido valores concretos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo para este modelo concreto. Como referencia cualitativa, Patch Policy se compara favorablemente con politicas que usan representaciones globales (por ejemplo, politicas basadas en CLIP con pooling global) en terminos de eficiencia y precision, segun la pagina del metodo. Otros enfoques comunes en LIBERO incluyen Diffusion Policy y ACT, pero no se tienen datos numericos de estos modelos en la informacion proporcionada. Por tanto, la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Entrenamiento insuficiente: con solo 100 pasos, el modelo probablemente no ha convergido y puede fallar en la mayoria de las tareas. Se recomienda tratarlo como una prueba de concepto, no como una politica lista para produccion.
- Sin evaluacion reportada: la model card indica explicitamente que no hay resultados de evaluacion, por lo que se desconoce su tasa de exito real.
- Entrenado solo en simulacion: la transferencia a un robot real puede requerir fine-tuning con datos reales, ya que la brecha sim-to-real puede degradar el rendimiento.
- Limitado a tareas especificas: el modelo solo ha sido entrenado para recoger diez objetos concretos y colocarlos en una cesta; no generaliza a otras tareas u objetos.
- Dependencia de camaras: requiere dos camaras calibradas (frontal y muneca) con las mismas caracteristicas que las usadas en el entrenamiento; cambios en la iluminacion o la posicion de las camaras pueden afectar al rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y el autor no proporciona soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aDaikiKamata/patch_policy_libero_object_tipsv2_smoke
- Repositorio HuggingFace del modelo similar sin tipsv2: https://huggingface.co/aDaikiKamata/patch_policy_libero_object_smoke
- Pagina oficial de Patch Policy: https://patch-policy.github.io/
- Paper de Patch Policy (preprint): https://www.alphaxiv.org/abs/2607.18236
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset LIBERO Object: https://huggingface.co/datasets/lerobot/libero_object_image
