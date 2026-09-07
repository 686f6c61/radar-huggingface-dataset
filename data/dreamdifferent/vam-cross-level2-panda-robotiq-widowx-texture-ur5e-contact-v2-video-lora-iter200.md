# dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200

## Resumen

Este modelo es un adaptador LoRA para generación de vídeo en robótica, desarrollado por el usuario `dreamdifferent`. Se trata de un checkpoint entrenable de Video2World basado en el framework MimicVideo, diseñado para generar vídeos de tareas de manipulación con un brazo robótico Panda Robotiq, una pinza WidowX y un robot UR5e en escenarios de contacto. El adaptador se aplica sobre un backbone de difusión de vídeo llamado `fused_video2world_dit`, que a su vez proviene del repositorio `dreamdifferent/widowx250-video-fused`. El modelo está entrenado para producir vídeos condicionados por instrucciones de tareas, utilizando dos cámaras (`corner_cam` y `front_cam`) apiladas horizontalmente.

El repositorio contiene el checkpoint de LoRA de la iteración 200, con un tamaño de 0,7 GB, y no es un modelo autónomo: requiere cargar primero el backbone exacto en la revisión especificada. La relevancia actual radica en la generación de datos sintéticos para robótica y en el desarrollo de modelos de mundo (world models) aplicados a la manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusión de vídeo (`fused_video2world_dit`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (generación de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de LoRA (formato no especificado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre un modelo de difusión de vídeo de tipo DiT (Diffusion Transformer) llamado `fused_video2world_dit`. Este backbone ya incluye una fusión previa con LoRAs de WidowX/Bridge, por lo que no se debe cargar el backbone original de Bridge. El entrenamiento se realizó con el framework MimicVideo, usando un dataset de 290 episodios y 54 508 fotogramas, con dos cámaras (`corner_cam` y `front_cam`) y una disposición de vista apilada horizontalmente a 5 Hz. Las tareas son 24 instrucciones condicionadas por episodio, listadas en el manifiesto `vam_cross_video_lora_manifest.json`. La iteración 200 del entrenamiento se seleccionó tras verificar un conjunto de cuatro componentes del checkpoint. El modelo no incluye el dataset ni el backbone: requiere el runtime de MimicVideo (commit `e3355dbc`), el bundle de checkpoints `jonpai/mimic-video`, el tokenizador de vídeo y el codificador de texto T5-11B.

## Capacidades

- Generación de vídeo condicionado por instrucciones para tareas de manipulación robótica.
- Soporte de entrada de dos cámaras simultáneas (`corner_cam` y `front_cam`) con vista apilada horizontalmente.
- Modelado de escenas de contacto entre un brazo Panda Robotiq, una pinza WidowX y un robot UR5e.
- Adaptación a un conjunto específico de 24 tareas de manipulación definidas por instrucciones.
- No es un modelo de lenguaje: no soporta tool calling, ni agentes conversacionales, ni generación de texto.
- Requiere el backbone y runtime específicos para funcionar; no es un modelo autónomo.

## Casos de uso

- Generación de datos sintéticos de demostración: el modelo puede producir vídeos de tareas de manipulación que se pueden usar para entrenar políticas robóticas sin necesidad de capturar datos reales en el robot.
- Aumento de datasets de demostraciones: permite expandir un dataset existente de episodios de WidowX/Panda generando variaciones de vídeo con diferentes condiciones de contacto.
- Simulación de escenarios de contacto: útil para evaluar el comportamiento de un brazo robótico en situaciones de contacto con superficies u objetos, antes de probar en hardware real.
- Investigación en modelos de mundo: sirve como componente para estudiar modelos que predicen dinámicas de vídeo en entornos de manipulación.
- Validación de políticas de control: se puede usar para generar vídeos de referencia y comparar la salida de un controlador con la dinámica esperada.
- Entrenamiento de modelos de predicción de vídeo: el adaptador se puede integrar en pipelines de MimicVideo para experimentar con la generación de vídeo condicionada por cámaras múltiples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone de vídeo pesa ~3,9 GB en disco, pero la VRAM real depende del runtime y de la longitud de los vídeos generados.
- GPU recomendadas: no disponible. Se recomienda una GPU con suficiente memoria para modelos de difusión de vídeo (por ejemplo, A100 o H100), aunque no se especifica.
- Si cabe en GPU de consumo: no disponible.
- Opciones de despliegue: el modelo está diseñado para usarse con el framework MimicVideo y sus artefactos de runtime (tokenizador de vídeo, T5-11B). No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables con datos de rendimiento publicados en la información disponible. El autor tiene otros LoRAs similares, como `vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter400`, pero no se dispone de especificaciones ni benchmarks para comparar.

## Limitaciones y advertencias

- Es un adaptador, no un modelo independiente: requiere cargar el backbone exacto `dreamdifferent/widowx250-video-fused` en la revisión `f0cea76b`, de lo contrario el resultado será incorrecto.
- El dataset de entrenamiento no está incluido en el repositorio; los usuarios deben cumplir con la política de acceso del dataset y con los términos de MimicVideo, NVIDIA Cosmos y el checkpoint base.
- La licencia no está disponible, por lo que no se puede garantizar el uso comercial sin consultar al autor.
- Solo está entrenado para un conjunto limitado de 24 tareas y 290 episodios; su generalización a otros robots, objetos o entornos es desconocida.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma, ya que no es un modelo de texto.
- El modelo genera vídeo, no texto, por lo que no es adecuado para tareas de razonamiento, código o matemáticas.

## Enlaces

- HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Bundle de checkpoints de MimicVideo: https://huggingface.co/jonpai/mimic-video
- Repositorio del autor: https://huggingface.co/dreamdifferent
