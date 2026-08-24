# armanakbari4/fastwam-robotwin-joint-50k

## Resumen

FastWAM-Joint RoboTwin es un modelo de robótica basado en el paradigma de *world-action models* (WAM), desarrollado por Arman Akbari como una reproducción limpia de la variante *joint* del modelo Fast-WAM. Se construye sobre el modelo base Wan-AI/Wan2.2-TI2V-5B, un DiT de video, al que se añade un ActionDiT (MoT) de aproximadamente 6 mil millones de parámetros. El modelo está entrenado en el dataset RoboTwin 2.0 y está diseñado para predecir acciones de control de un robot manipulador a partir de observaciones visuales de múltiples cámaras.

La relevancia de este modelo radica en que explora si un *world-action model* necesita imaginación futura en tiempo de inferencia, una pregunta abierta en la investigación de robótica. La variante *joint* hace que la atención de la acción atienda a todos los tokens latentes del video, lo que la diferencia de otras variantes como *idm* o *action-only*. El modelo se publica con licencia MIT y los pesos en formato PyTorch (`.pt`), junto con las estadísticas de normalización necesarias para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video DiT (Wan2.2-TI2V-5B) + ActionDiT (MoT) |
| Parametros totales | ~6 mil millones (estimado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (usa 33 frames de video, 9 frames de video y 32 acciones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo combina un DiT de video (Wan2.2-TI2V-5B) con un ActionDiT (MoT) que procesa las acciones. En la variante *joint*, la atención de la acción atiende a todos los tokens latentes del video, lo que permite una fusión completa entre la representación visual y la acción. El entrenamiento se realizó durante 50.000 pasos con un batch efectivo de 128, tasa de aprendizaje 1e-4 con decaimiento coseno (warmup del 5%), optimizador AdamW (0.9, 0.95), weight decay 1e-2, precisión bf16 y ZeRO-1. Se usaron 3 cámaras (cámara alta y dos muñecas, resolución 240x320, con *tiling*), 33 frames de video, una ratio de frecuencia acción/video de 4 (32 acciones por 9 frames de video) y dimensión de acción y estado de 14. El entrenamiento se realizó en 8 GPUs H100 y el run sobrevivió a 3 recuperaciones automáticas por watchdog sin picos de pérdida.

## Capacidades

- Control robótico: predice acciones de articulaciones (joint) a partir de observaciones visuales de múltiples cámaras.
- Modelado de mundo y acción: integra la dinámica del entorno con la generación de acciones.
- Soporte multi-cámara: procesa simultáneamente tres vistas (alta, muñeca izquierda y derecha).
- Aprendizaje por imitación: entrenado en demostraciones de RoboTwin 2.0.
- Reproducibilidad: incluye estadísticas de normalización del dataset para inferencia consistente.

## Casos de uso

- Manipulación robótica en simulación: el modelo puede controlar un brazo robótico en entornos RoboTwin para tareas como recoger y colocar objetos, usando las tres cámaras para percibir el entorno.
- Investigación en *world-action models*: sirve como punto de partida para estudiar si la imaginación futura en tiempo de inferencia mejora el rendimiento en tareas de manipulación.
- Evaluación de arquitecturas de atención conjunta: permite comparar la variante *joint* con otras variantes (idm, action-only) en el mismo dataset y configuración.
- Desarrollo de pipelines de aprendizaje por imitación: el modelo puede integrarse en flujos de entrenamiento que requieran predicción de acciones a partir de video.
- Benchmarking de reproducción: al ser una reproducción limpia de BadWAM, puede usarse para verificar la reproducibilidad de resultados en robótica.
- Base para fine-tuning: los pesos preentrenados pueden adaptarse a nuevos datasets de robótica con pocas demostraciones.

## Benchmarks y rendimiento

El autor reporta tasas de éxito en RoboTwin para la receta de reproducción de BadWAM (arXiv:2607.15207): variante *joint* 90.9%, *idm* 91.4% y *action-only* 92.1%. Estos valores corresponden a la reproducción descrita en la model card, no a una evaluación independiente del modelo publicado. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Entrenamiento: 8 GPUs H100 (según la model card).
- Inferencia: no especificado. Dado que el modelo tiene ~6B parámetros en bf16 (12 GB de pesos), se estima que requiere al menos 16-24 GB de VRAM para inferencia en precisión completa, y podría caber en GPUs de consumo como RTX 4090 (24 GB) con cuantización, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama. El formato `.pt` sugiere uso con PyTorch y el código de FastWAM disponible en GitHub.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo se enmarca en la familia FastWAM, pero no se ofrecen datos de comparación con alternativas como RT-2, Octo o OpenVLA.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni en robots físicos reales.
- Entrenado exclusivamente en simulación (RoboTwin 2.0); la transferencia al mundo real no está demostrada.
- Requiere el archivo `robotwin_joint_dataset_stats.json` para normalizar las entradas durante inferencia; sin él, el modelo no funciona correctamente.
- No se especifican sesgos, riesgos de alucinación ni limitaciones de idioma (al ser un modelo de visión-acción, el lenguaje no es relevante).
- La licencia MIT permite uso comercial, pero el modelo base Wan2.2-TI2V-5B puede tener sus propias restricciones; se recomienda revisar su licencia.
- El tamaño del repositorio (12 GB) puede dificultar su despliegue en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/armanakbari4/fastwam-robotwin-joint-50k
- Perfil del autor: https://huggingface.co/armanakbari4/models
- Código oficial FastWAM: https://github.com/yuantianyuan01/FastWAM
- Documentación de configuraciones (DeepWiki): https://deepwiki.com/yuantianyuan01/FastWAM/4.3-task-configurations
- Dataset RoboTwin 2.0 FastWAM: https://huggingface.co/datasets/yuanty/robotwin2.0-fastwam
- Subdirectorio RoboTwin en FastWAM: https://github.com/yuantianyuan01/FastWAM/tree/main/third_party/RoboTwin
