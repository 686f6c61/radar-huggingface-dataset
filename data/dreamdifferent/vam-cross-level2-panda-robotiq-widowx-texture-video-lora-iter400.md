# dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter400

## Resumen

Este repositorio contiene un checkpoint LoRA (adaptador de bajo rango) para el modelo de generación de vídeo `fused_video2world_dit`, desarrollado por el usuario `dreamdifferent`. El adaptador, denominado "VAM-Cross two-camera MimicVideo Video2World LoRA", está diseñado para generar vídeos de demostración robótica condicionados por instrucciones de tarea y observaciones de dos cámaras (esquina y frontal) apiladas horizontalmente. Se basa en la arquitectura MimicVideo (Video2World) y está entrenado sobre 301 episodios con 54.453 fotogramas de manipulación robótica con brazos Panda Robotiq y WidowX.

El modelo no es autónomo: requiere cargar primero el backbone fusionado `dreamdifferent/widowx250-video-fused` (revisión `f0cea76b`) y después aplicar este LoRA. El tamaño del repositorio es de 3,7 GB, correspondiente al adaptador entrenable. Su relevancia radica en permitir la generación de datos sintéticos de vídeo para robótica, útil en simulación, aumento de datos y evaluación de políticas de aprendizaje por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre `fused_video2world_dit` (Video2World DiT) |
| Parametros totales | no disponible (tamaño del adaptador: 3,7 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente checkpoint PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) diseñado para ser aplicado sobre el backbone `fused_video2world_dit`, que combina un modelo de difusión de vídeo (Video2World) con una fusión previa de LoRA de WidowX/Bridge. El checkpoint inicial (iteración 1060) ya incluye dicha fusión, por lo que no debe cargarse el backbone original de Bridge. El entrenamiento se realizó con el código MimicVideo (commit `e3355dbc`) y utiliza un tokenizador de vídeo y un codificador de texto T5-11B como artefactos de soporte.

Los datos de entrenamiento provienen de 301 episodios con 54.453 fotogramas, con dos cámaras (`corner_cam` y `front_cam`) apiladas horizontalmente a 5 Hz, y 24 instrucciones condicionadas por episodio. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La innovación principal es el condicionamiento cruzado de dos cámaras para generar vídeo coherente de tareas robóticas.

## Capacidades

- Generación de vídeo condicionada por instrucciones de tarea y observaciones de dos cámaras (esquina y frontal).
- Soporte de apilado horizontal (`hstack`) de vistas de cámara a 5 Hz.
- Condicionamiento por episodio: 24 tareas específicas de manipulación robótica.
- Integración con el ecosistema MimicVideo para generación de vídeo a partir de texto y estado inicial.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Generación de datos sintéticos de vídeo para entrenar políticas robóticas: el modelo puede producir demostraciones variadas de tareas de manipulación, reduciendo la necesidad de recopilación manual de datos.
- Aumento de datos para aprendizaje por imitación: al generar nuevas trayectorias visuales, se pueden enriquecer conjuntos de entrenamiento existentes.
- Simulación de escenarios de manipulación para evaluación de políticas antes del despliegue físico.
- Prototipado rápido de tareas robóticas: permite visualizar cómo se ejecutaría una tarea concreta sin necesidad de un robot real.
- Generación de vídeos de demostración para teleoperación o para documentación de procedimientos.
- Validación de diseño de tareas: se pueden probar diferentes instrucciones y observar la coherencia del vídeo generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el backbone `fused_video2world_dit` (3,9 GB) más el propio adaptador (3,7 GB), además del codificador de texto T5-11B (aproximadamente 11 mil millones de parámetros) y el tokenizador de vídeo.
- Dado el tamaño del T5-11B y el modelo de difusión, se estima que se necesita una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090, A100 40 GB, o superior) para inferencia en precisión completa.
- No se especifican opciones de despliegue específicas; al ser un adaptador de MimicVideo, es probable que se use el código oficial de MimicVideo con PyTorch.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se proporcionan modelos comparables en la información del repositorio.

## Limitaciones y advertencias

- El modelo es un adaptador y no funciona de forma independiente; requiere cargar exactamente el backbone y los artefactos indicados (tokenizador, T5-11B, código MimicVideo).
- La licencia no está especificada; se debe cumplir con los términos de los componentes upstream (MimicVideo, NVIDIA Cosmos, y el checkpoint base).
- El dataset de entrenamiento no está incluido y está sujeto a su propia política de acceso.
- El modelo está especializado en las tareas y configuraciones de cámara del entrenamiento; su generalización a otras tareas o disposiciones de cámara no está garantizada.
- Riesgo de alucinación visual en vídeos generados, especialmente en escenarios fuera de la distribución de entrenamiento.
- No se proporcionan garantías de calidad para producción; se recomienda validar los vídeos generados antes de usarlos en aplicaciones críticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter400
