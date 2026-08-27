# dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-video-lora-iter400

## Resumen

Este repositorio contiene un checkpoint de adaptador LoRA (r=256) para el modelo de generación de video robótico Video2World, desarrollado por el usuario `dreamdifferent`. Se trata de la iteración 400 de un entrenamiento denominado `v2w_kuka_iiwa14_level4_widowx_texture_2cam_hstack_from_widowx250_video_fused_f0cea76_lora_r256`, orientado a la generación de vídeos de manipulación robótica con dos cámaras (esquina y frontal) apiladas horizontalmente. El modelo es un adaptador, no un modelo completo: requiere cargar primero un backbone específico (`fused_video2world_dit`) y después aplicar este LoRA. Está pensado para el pipeline MimicVideo y para tareas de robótica con instrucciones condicionadas por episodios. Su relevancia radica en permitir la generación de vídeo sintético de alta fidelidad para entrenamiento y simulación robótica, un área activa de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=256) sobre Video2World DiT (difusión de video) |
| Parametros totales | no disponible (el checkpoint LoRA pesa 3.7 GB, pero no se indica el número de parámetros) |
| Parametros activos | no disponible (al ser LoRA, solo se actualizan los adaptadores) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (las instrucciones son en inglés, según el manifiesto, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente `.pt` o `.safetensors`, pero no se indica) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 256 que se aplica sobre un backbone de difusión de video llamado `fused_video2world_dit`. Este backbone ya incluye una fusión previa de LoRA de WidowX/Bridge, por lo que no debe sustituirse por el backbone original de Bridge. El entrenamiento se realizó con el código MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`), un tokenizador de video (`tokenizer.pth`) y un encoder de texto T5-11B. El dataset de entrenamiento consta de 144 episodios y 55 448 frames, con dos cámaras (`corner_cam` y `front_cam`) combinadas en formato `hstack` a 5 Hz, y 29 instrucciones condicionadas por episodio. No se especifica si se usó RLHF, DPO u otras técnicas de alineación; el entrenamiento es supervisado con datos de vídeo.

## Capacidades

- Generación de vídeo robótico condicionado por instrucciones textuales (29 tareas específicas).
- Soporte de múltiples cámaras: combina dos vistas (esquina y frontal) en una sola imagen apilada horizontalmente.
- Generación de vídeo a 5 Hz, adecuado para secuencias de manipulación robótica.
- Adaptación fina sobre un backbone preentrenado, lo que permite transferir conocimiento de dominios previos (WidowX/Bridge).
- Integración con el pipeline MimicVideo, que incluye tokenizador de video y encoder T5 para condicionamiento textual.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni visión general fuera del ámbito robótico.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de políticas robóticas: el modelo puede producir vídeos de manipulación con el robot KUKA iiwa 14 y el efector WidowX, útiles para aumentar datasets reales.
- Simulación de escenarios de manipulación con textura: permite generar variaciones visuales de una misma tarea, lo que ayuda a evaluar la robustez de modelos de control.
- Evaluación de modelos de video2world: sirve como componente de un sistema más grande para predecir estados futuros del mundo a partir de observaciones.
- Investigación en generación de vídeo condicionada por instrucciones: el checkpoint permite estudiar cómo el condicionamiento textual afecta a la calidad y coherencia del vídeo generado.
- Desarrollo de entornos de simulación para robótica: combinado con el backbone, puede generar secuencias de vídeo que sirvan como entrada para planificadores o simuladores neuronales.
- Reproducción de experimentos de aprendizaje por imitación: al ser un adaptador, puede integrarse en pipelines existentes de MimicVideo para replicar resultados o explorar variaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de lenguaje o razonamiento general, sino a generación de vídeo robótico.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible.
- El backbone inicial pesa 3 913 057 284 bytes (~3.9 GB), por lo que se requiere una GPU con al menos 8-12 GB de VRAM solo para cargar el backbone, más el LoRA y el tokenizador.
- El encoder de texto T5-11B es un modelo grande (11 mil millones de parámetros), lo que implica requisitos de memoria considerables (probablemente >24 GB de VRAM para inferencia completa).
- No se indican GPUs recomendadas específicas. Dado el tamaño del backbone y el T5, se necesitarían GPUs de gama alta (A100, H100, RTX 4090 o superiores) para una inferencia razonable.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. El modelo está diseñado para usarse con el código MimicVideo, que probablemente use PyTorch y CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (LoRA de generación de video robótico con dos cámaras). No se pueden establecer comparaciones fiables sin datos adicionales.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere cargar el backbone exacto (`fused_video2world_dit` con revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`) y el resto de artefactos de runtime (tokenizador, T5, código MimicVideo). Cargar un backbone incorrecto producirá resultados inválidos.
- La licencia no está disponible, por lo que no se puede garantizar el uso comercial. Se debe consultar al autor antes de cualquier uso productivo.
- El dataset de entrenamiento no está incluido y está sujeto a políticas de acceso; los usuarios deben cumplir con los términos de MimicVideo, NVIDIA Cosmos y del checkpoint base.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de un solo dominio (robótica con KUKA iiwa y WidowX), su generalización a otros robots o entornos es limitada.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir secuencias incoherentes o físicamente imposibles, especialmente fuera de la distribución de entrenamiento.
- El entrenamiento se detuvo por límite de tiempo (`walltime`), lo que podría implicar que el modelo no alcanzó la convergencia completa.
- No se proporcionan instrucciones de uso detalladas más allá de la carga del backbone; se requiere conocimiento del pipeline MimicVideo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-video-lora-iter400
- Repositorio del backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused (revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`)
- Referencia a MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`): no se dispone de URL directa en la información proporcionada.
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture (revisión `fdf98affb56fab74190d4c3eb055ea2e0888e8af`)
