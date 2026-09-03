# dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-video-lora-iter400

## Resumen

Este repositorio contiene un adaptador LoRA para generación de video robótico, desarrollado por el usuario `dreamdifferent`. Se trata de un checkpoint de entrenamiento de la iteración 400 de un modelo `Video2World` basado en MimicVideo, específicamente diseñado para el brazo robótico KUKA IIWA 14 y la pinza WidowX. El modelo genera secuencias de video condicionadas a instrucciones de tarea, utilizando dos cámaras (corner y frontal) combinadas en una vista apilada horizontalmente.

No es un modelo autónomo: requiere cargar primero un backbone base concreto (`fused_video2world_dit` de `dreamdifferent/widowx250-video-fused` en una revisión específica) y luego aplicar este LoRA. El tamaño del repositorio es de 3,7 GB, correspondiente al adaptador. La relevancia actual radica en su aplicación para la generación de mundos sintéticos en robótica, permitiendo simular trayectorias y escenarios de manipulación a partir de observaciones visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Video2World DiT (fused_video2world_dit) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint (formato no especificado, probablemente .pt) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 256 que se aplica sobre un backbone de difusión de video (`fused_video2world_dit`). El backbone ya incluye una fusión previa de LoRAs de WidowX/Bridge, por lo que cargar el backbone original de Bridge sería incorrecto. El entrenamiento se realizó con el framework MimicVideo, usando un dataset propio de 192 episodios y 54 749 frames, con dos cámaras (`corner_cam` y `front_cam`) en disposición `hstack` a 5 Hz, y 29 instrucciones condicionadas por episodio. No se proporcionan detalles sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO. El checkpoint fue verificado y seleccionado de una ejecución completada.

## Capacidades

- Generación de video condicionado a instrucciones de tarea para manipulación robótica.
- Procesamiento de entrada de dos cámaras simultáneas (corner y frontal) con vista apilada.
- Generación de mundos sintéticos (Video2World) a partir de observaciones visuales.
- Soporte para tareas episódicas con instrucciones específicas (29 tareas en el dataset).
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural directo.
- No es multilingüe; el modelo opera sobre video y texto de instrucciones (a través del codificador T5-11B del backbone).

## Casos de uso

- Simulación de trayectorias robóticas: el modelo puede generar secuencias de video futuras a partir de observaciones actuales, permitiendo previsualizar movimientos del KUKA IIWA 14 antes de ejecutarlos en el robot real.
- Generación de datos sintéticos para entrenamiento de políticas: se pueden crear episodios de video variados para aumentar datasets de aprendizaje por imitación, reduciendo la necesidad de recolección física.
- Planificación de tareas de manipulación: al condicionar la generación con instrucciones textuales, se pueden explorar diferentes estrategias de agarre o posicionamiento en entornos simulados.
- Validación de modelos de control: los videos generados sirven como entorno de prueba para evaluar algoritmos de control sin riesgo de daño físico.
- Investigación en world models: el adaptador permite estudiar cómo los modelos de difusión aprenden dinámicas de objetos y contacto en escenarios robóticos.
- Desarrollo de sistemas de teleoperación asistida: la generación de video predictivo puede ayudar a operadores humanos a anticipar resultados de acciones en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación proporcionada.
- El backbone base tiene un tamaño de aproximadamente 3,9 GB (3913057284 bytes) y el LoRA de 3,7 GB, pero se desconoce la VRAM total necesaria para inferencia.
- El backbone incluye un codificador de texto T5-11B, lo que sugiere que se requiere una GPU de alta gama (por ejemplo, A100 o H100) para ejecutar el modelo completo.
- No se indica si es compatible con GPUs de consumo (como RTX 4090) ni se proporcionan opciones de despliegue (vLLM, llama.cpp, etc.).
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo independiente: requiere cargar el backbone exacto especificado (revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`) y aplicar el LoRA posteriormente.
- El dataset de entrenamiento no está incluido y su acceso está sujeto a políticas del propietario; los usuarios deben cumplir con los términos de MimicVideo, NVIDIA Cosmos y del checkpoint base.
- La licencia del modelo no está especificada, lo que impide conocer restricciones de uso comercial.
- El modelo está especializado en tareas de manipulación con KUKA IIWA 14 y WidowX; su rendimiento fuera de este dominio no está garantizado.
- No se proporcionan evaluaciones de sesgos ni de riesgo de alucinación en la generación de video.
- La generación de video puede producir artefactos visuales o inconsistencias físicas, especialmente en escenarios no vistos durante el entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-video-lora-iter400
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture
- Referencia del robot KUKA IIWA 14 (MuJoCo Menagerie): https://github.com/google-deepmind/mujoco_menagerie/blob/main/kuka_iiwa_14/README.md
