# muacha/my_overfit_pi05_policy_expert_only

## Resumen

Este modelo es un ajuste fino (fine-tune) de π₀.₅ (Pi0.5), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, realizado con la librería LeRobot de Hugging Face. El modelo original π₀.₅ está diseñado para la generalización en mundo abierto, co-entrenado con datos heterogéneos de demostraciones robóticas, datos web y subtareas semánticas para ejecutar tareas físicas de manipulación de forma diestra y con capacidad de cero disparo en diversas plataformas robóticas. Este repositorio concreto es un ajuste fino sobre el modelo base `lerobot/pi05_base`, especializado en una tarea específica: recoger tarros de cristal y colocarlos en un contenedor.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,1 mil millones) y se distribuye en formato safetensors, con un tamaño de repositorio de 9,4 GB. Fue entrenado con un conjunto de datos de 22 episodios y 8.738 fotogramas a 15 FPS, grabados con tres cámaras (una base y dos de muñeca). El entrenamiento se realizó durante 5.000 pasos con un tamaño de lote de 8, optimizador AdamW y una tasa de aprendizaje de 0,0003. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, con cabezal de flujo (flow matching) |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa texto directamente en esta variante) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅, una evolución de π₀ que incorpora co-entrenamiento con datos heterogéneos (demostraciones robóticas, datos web y subtareas semánticas) para mejorar la generalización a entornos no vistos. Según el repositorio OpenPI de Physical Intelligence, π₀.₅ utiliza una técnica denominada "aislamiento de conocimiento" (knowledge insulation) para evitar que el conocimiento lingüístico interfiera con el control motor. En esta implementación de LeRobot, se emplea únicamente la cabeza de flujo (flow matching head) para la generación de acciones.

El ajuste fino se realizó sobre el modelo base `lerobot/pi05_base` con un conjunto de datos propio (`muacha/glass_uncap_comp_mapped`) que contiene dos tareas: "coger los tarros de cristal y ponerlos en el contenedor" y "poner los tarros de cristal en el contenedor". El entrenamiento se ejecutó durante 5.000 pasos con un tamaño de lote de 8, optimizador AdamW, tasa de aprendizaje de 0,0003 y semilla 1000, utilizando LeRobot versión 0.6.0. No se mencionan técnicas de RLHF ni DPO; se trata de un ajuste fino supervisado por imitación.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 grados de libertad (posición y orientación del efector final) a partir de observaciones de estado y de imágenes de tres cámaras (base, muñeca izquierda y muñeca derecha).
- Percepción multimodal: procesa imágenes RGB de 224x224 (cámara base) y 180x320 (cámaras de muñeca), junto con el estado del robot (7 dimensiones).
- Ejecución de tareas específicas: está entrenado para recoger objetos (tarros de cristal) y colocarlos en un contenedor, con dos variantes de instrucción en inglés.
- Compatibilidad con el ecosistema LeRobot: puede ejecutarse en robots reales mediante el comando `lerobot-rollout` y se integra con los flujos de entrenamiento de LeRobot.
- Sin capacidades de tool calling, agentes o razonamiento multi-paso más allá de la tarea motora.

## Casos de uso

- Automatización de manipulación en almacenes: el modelo puede gestionar tareas de recogida y colocación de objetos en contenedores, como en líneas de empaquetado, gracias a su capacidad de procesar imágenes de cámara y estado del robot.
- Robótica de laboratorio: sirve como base para experimentos de imitación en robótica, permitiendo a investigadores replicar el flujo de entrenamiento con LeRobot y adaptarlo a otras tareas.
- Despliegue en robots de bajo coste: al ser un ajuste fino de un modelo base de 4,1B, puede ejecutarse en GPUs de consumo como una RTX 4090, facilitando la experimentación en laboratorios sin infraestructura de alto rendimiento.
- Control de brazos robóticos con cámaras múltiples: el modelo acepta entradas de tres cámaras (base, muñecas), lo que lo hace adecuado para configuraciones de robótica con percepción de escritorio.
- Pruebas de robustez en entornos controlados: aunque no se ha evaluado en robot real, puede usarse para probar la generalización de políticas en simuladores o en entornos de prueba antes de un despliegue final.
- Investigación en aprendizaje por imitación: sirve como caso de estudio para comparar el rendimiento de π₀.₅ fine-tuned con datos limitados (22 episodios) frente a modelos más grandes o entrenados con más datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación: "No evaluation results have been provided for this policy yet." Por tanto, no se puede cuantificar la tasa de éxito en tareas reales ni comparar con otros modelos de forma numérica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, en precisión FP32 se requerirían aproximadamente 16,6 GB de VRAM; en FP16, unos 8,3 GB; en cuantización de 8 bits, unos 4,2 GB. No se especifican cuantizaciones en la información, pero es plausible que el modelo pueda ejecutarse en una GPU con al menos 8 GB de VRAM usando FP16.
- GPU recomendadas: para un despliegue cómodo, se recomienda una GPU con al menos 12 GB de VRAM, como una RTX 4070 Ti o superior. Para entrenamiento, se necesitaría una GPU con más memoria, como una A100 (40 GB) o RTX 4090 (24 GB) si se usa batch size grande.
- Compatibilidad con consumer GPU: sí, es posible ejecutar en GPUs de consumo como RTX 3080/3090 o RTX 4090, siempre que se ajuste la precisión (FP16) o se use cuantización.
- Opciones de despliegue: el modelo está diseñado para usarse con la librería LeRobot, mediante el comando `lerobot-rollout`. No se menciona compatibilidad con vLLM, Ollama o TGI, ya que es un modelo de robótica y no de generación de texto.
- Latencia y throughput: no disponibles. La latencia dependerá del hardware y de la complejidad de la tarea, pero no se ofrecen datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Entrenamiento | Licencia | Uso |
|---|---|---|---|---|---|
| **muacha/my_overfit_pi05_policy_expert_only** | 4,14 B | VLA (π₀.₅) | Fine-tune en 22 episodios | Apache 2.0 | Robótica, tarea específica |
| **lerobot/pi05_base** | 4,1 B (aprox.) | VLA (π₀.₅) | Pre-entrenamiento en datos heterogéneos | Apache 2.0 | Robótica generalista |
| **OpenVLA** (de Stanford/Google) | 7 B | VLA (LLM + visual encoder) | Entrenado en 970k demostraciones | MIT (por partes) | Robótica generalista |

La comparativa es cualitativa: π₀.₅ base tiene un contexto de generalización más amplio, mientras que este ajuste fino está especializado en una tarea concreta. OpenVLA es un modelo más grande y con un dataset de entrenamiento mucho mayor, pero no se dispone de datos de rendimiento comparables en esta información.

## Limitaciones y advertencias

- Sobreajuste (overfit): el nombre del repositorio indica "overfit" y el entrenamiento se realizó con solo 22 episodios, lo que sugiere que el modelo puede no generalizar bien fuera de las condiciones del dataset de entrenamiento (posición de los tarros, iluminación, etc.).
- Falta de evaluación en robot real: no se han proporcionado resultados de pruebas en un robot físico, por lo que no se puede garantizar el rendimiento en el mundo real.
- Dependencia de las cámaras: el modelo requiere tres cámaras con las mismas características y calibración que las utilizadas en el entrenamiento; cualquier cambio en la posición o tipo de cámara puede degradar el rendimiento.
- Limitaciones de contexto: al ser un modelo de robótica, no procesa texto de entrada; las instrucciones son fijas y no admite instrucciones arbitrarias.
- Sesgos: no se han documentado sesgos específicos, pero el dataset de entrenamiento es muy pequeño y puede no representar la variabilidad del mundo real.
- Licencia Apache 2.0: permite uso comercial, pero se debe cumplir con la atribución de licencia y la redistribución de avisos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/muacha/my_overfit_pi05_policy_expert_only
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/muacha/glass_uncap_comp_mixt
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Blog de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
