# chennana1028/fastwam-openarm-sbint-delta-step10000

## Resumen

El modelo `chennana1028/fastwam-openarm-sbint-delta-step10000` es un checkpoint intermedio (step 10000) de un entrenamiento A/B de FastWAM, un modelo de generación de vídeo y acción para robótica basado en Wan2.2-TI2V-5B y ActionDiT. Está desarrollado por el usuario chennana1028 y se centra en el control de un brazo robótico OpenArm de 7 grados de libertad, utilizando un dataset propio llamado SBInt con 873 episodios. El modelo emplea una transformación delta por bloques (chunk-wise masked delta) sobre las articulaciones, donde las dimensiones 0-6 y 8-14 se codifican como diferencia respecto al primer frame de la ventana, mientras que las dimensiones de la pinza (7 y 15) se mantienen en valores absolutos. La normalización z-score se calcula en el dominio delta. Este checkpoint es relevante para quienes trabajan con FastWAM y necesitan pesos intermedios para reproducir experimentos o continuar entrenamiento, aunque no está pensado como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM (Wan2.2-TI2V-5B + ActionDiT) |
| Parametros totales | no disponible (base Wan2.2-TI2V-5B, ~5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato .pt) |
| Idiomas soportados | no disponible (modelo de acción robótica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (.pt) + config.yaml + dataset_stats.json |

## Arquitectura y entrenamiento

FastWAM combina un modelo de vídeo (Wan2.2-TI2V-5B) con un módulo de acción (ActionDiT) para generar tanto la trayectoria visual como las acciones del robot. En este checkpoint, la salida de acciones se transforma mediante `MaskedDeltaJointTransform`, que calcula deltas por bloques respecto al primer frame de la ventana para las articulaciones, manteniendo las dimensiones de la pinza en absoluto. El entrenamiento se realizó con un dataset SBInt de 873 episodios de OpenArm, en una configuración de 2x8 GPUs con batch global de 128, durante 50k pasos (este es el checkpoint del paso 10000). La normalización z-score se aplica después de la transformación delta, y los estadísticos se guardan en `dataset_stats.json`. No se especifica si se usó RLHF, DPO u otra técnica de alineación.

## Capacidades

- Generación de acciones de control para un brazo robótico OpenArm de 7 DOF (más pinza), en formato de 16 dimensiones (layout derecha primero).
- Predicción de vídeo condicionada a observaciones (modelo base Wan2.2-TI2V-5B).
- Soporte para inferencia con transformación delta: requiere ejecutar `MaskedDeltaJointTransform.backward` usando el estado crudo del primer frame de la ventana.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni procesamiento de lenguaje.

## Casos de uso

- Reproducción de experimentos de control robótico: el checkpoint permite replicar el entrenamiento A/B descrito en el repositorio upstream de FastWAM, usando los ficheros `config.yaml` y `dataset_stats.json` para reproducir la normalización y la transformación delta.
- Continuación de entrenamiento: al ser un checkpoint intermedio (step 10000 de 50k), puede usarse como punto de partida para fine-tuning adicional con el mismo dataset o con variantes.
- Evaluación de políticas de manipulación: con el entorno OpenArm y el dataset SBInt, se puede evaluar la capacidad del modelo para generar acciones precisas en tareas de contacto (contact-rich).
- Investigación sobre representaciones delta en control robótico: el diseño de delta por bloques (máscara sobre dimensiones) es una innovación que puede compararse con representaciones absolutas.
- Desarrollo de sistemas de teleoperación o imitación: el modelo puede integrarse en pipelines de aprendizaje por imitación para el brazo OpenArm.
- Benchmarking de modelos de acción-vídeo: al estar basado en FastWAM, puede compararse con otros checkpoints del mismo proyecto (por ejemplo, versiones absolutas o con otros datasets).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de éxito en tareas robóticas, ni comparativas con otros modelos.

## Requisitos de hardware

- El checkpoint pesa 12.0 GB (repo completo), lo que sugiere que los pesos del modelo ocupan varios GB (probablemente en FP32 o BF16).
- Para inferencia, se requiere al menos una GPU con 16-24 GB de VRAM si se usa el modelo completo en precisión FP16/BF16 (base ~5B). Con cuantización (no disponible en este repo) podría reducirse.
- GPUs recomendadas: NVIDIA A100, H100, RTX 4090 o superiores. No se indica si cabe en GPUs de consumo más modestas.
- El entrenamiento se realizó con 2x8 GPUs (16 GPUs en total), lo que da una idea de los requisitos para reproducir el entrenamiento completo.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama. Al ser un modelo de robótica, se espera un pipeline propio con PyTorch y el código de FastWAM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos de control robótico. Se puede mencionar que existen otros checkpoints del mismo autor (por ejemplo, `chennana1028/gwp05-openarm-sbint-abs-step50000` y `chennana1028/gwp05-openarm-sbint-delta-step50000`) que usan representaciones absolutas o delta, pero no se conocen sus métricas. Tampoco hay comparación con modelos como RT-2, Octo o OpenVLA en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (step 10000 de 50k), no un modelo final entrenado hasta convergencia. Su rendimiento puede ser subóptimo.
- No se especifica licencia, por lo que el uso comercial es incierto. Se debe contactar al autor o revisar el repositorio upstream de FastWAM para aclarar términos.
- La inferencia requiere implementar correctamente la transformación delta inversa (`MaskedDeltaJointTransform.backward`). Un error en este paso produce acciones incorrectas.
- El modelo está especializado en el brazo OpenArm y el dataset SBInt; no es generalizable a otros robots sin reentrenamiento.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad. Al ser un modelo de control físico, cualquier error en las acciones puede causar daños en el hardware.
- El repositorio no incluye documentación de uso ni ejemplos de inferencia, solo los ficheros de pesos y configuración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chennana1028/fastwam-openarm-sbint-delta-step10000
- Repositorio upstream de FastWAM: https://github.com/zhujohn9604/FastWAM (también referenciado como https://github.com/yuantianyuan01/FastWAM)
- Proyecto OpenArm (hardware): https://github.com/enactic/openarm
- Sitio de OpenArm Cell: https://openarm.dev/
- Checkpoints relacionados del mismo autor:
  - https://huggingface.co/chennana1028/gwp05-openarm-sbint-abs-step50000
  - https://huggingface.co/chennana1028/gwp05-openarm-sbint-delta-step50000
