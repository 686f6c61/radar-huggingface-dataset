# dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-video-lora-iter-400

## Resumen

Este repositorio contiene un adaptador LoRA de generacion de video (Video2World) perteneciente al proyecto VAM-Cross, desarrollado por el autor `dreamdifferent`. El checkpoint corresponde a la iteracion 400 de un entrenamiento orientado a generar video sintetico de manipulacion robotica en el entorno de simulacion robosuite con el robot Panda, fusionando dos vistas de camara (corner y front) en un layout apilado horizontalmente (hstack) a 5 Hz. El modelo forma parte de un pipeline de video generation aplicado a robotica, donde a partir de instrucciones textuales condicionadas por episodio se genera video predictivo del comportamiento del robot.

Se trata de un adaptador LoRA con 256 de rango, no de un modelo autonomo: requiere cargar primero el backbone base `fused_video2world_dit` del repositorio `dreamdifferent/widowx250-video-fused` (revision `f0cea76b62c5dd66b06b9f965932ddea32a7b546`, iteracion 1060) y aplicar posteriormente este LoRA. El entrenamiento se realizo sobre 162 episodios con 54.352 fotogramas y 29 instrucciones condicionadas por episodio, utilizando el framework MimicVideo con un tokenizador de video y un codificador de texto T5-11B como artefactos de soporte. La relevancia actual de este modelo reside en su aplicacion a la generacion de datos sinteticos para robotica, un area en crecimiento para el entrenamiento de politicas de manipulacion sin necesidad de captura fisica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Fused Video2World DiT (Diffusion Transformer) |
| Parametros totales | no disponible (adaptador LoRA, tamano del repo 3.7 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 256 (identificado en el nombre del run como `lora_r256`) disenado para acoplarse a un backbone `fused_video2world_dit`, que ya incorpora una fusion previa de LoRA del dataset WidowX/Bridge. El backbone base pesa aproximadamente 3.9 GB (3.913.057.284 bytes) y debe cargarse en su revision exacta `f0cea76b62c5dd66b06b9f965932ddea32a7b546`; cargar el backbone Bridge original en su lugar seria incorrecto. El entrenamiento se realizo con el framework MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`) y el bundle de checkpoints `jonpai/mimic-video@f28339034831e3c2374be075e622e1ff38ebe0f8`, que incluye el tokenizador de video (`tokenizer.pth`) y el codificador de texto T5-11B. Los datos de entrenamiento provienen del dataset `dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture@c1074c54edad5ec7866a415d3ace5be2a7969a55`, con 162 episodios y 54.352 fotogramas, capturados con dos camaras (`observation.images.corner_cam` y `observation.images.front_cam`) en layout hstack a 5 Hz. El run de entrenamiento termino por condicion de `walltime`, y el conjunto de checkpoints seleccionado fue verificado antes de elegir el peso final.

## Capacidades

- Generacion de video predictivo (Video2World) de manipulacion robotica en el entorno robosuite con robot Panda.
- Generacion condicionada por instrucciones textuales asociadas a episodios concretos (29 tareas distintas).
- Fusion de dos vistas de camara (corner y front) en un unico canal visual apilado horizontalmente.
- Integracion con el pipeline MimicVideo para video generation, incluyendo tokenizacion de video y codificacion de texto con T5-11B.
- Capacidad de transferencia de textura y estilo desde el dataset WidowX/Bridge fusionado en el backbone.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales fuera de la generacion de video.

## Casos de uso

- Generacion de datos sinteticos para entrenamiento de politicas robotica: el modelo puede producir video de manipulacion con el robot Panda en robosuite, ampliando datasets de entrenamiento sin necesidad de captura fisica adicional.
- Aumento de datos con variaciones de textura: al estar entrenado sobre el dataset WidowX con fusion de texturas, permite generar variantes visuales de episodios existentes para mejorar la robustez de politicas de manipulacion.
- Validacion de politicas en simulacion: los videos generados pueden usarse como referencia visual para verificar que una politica aprendida produce trayectorias coherentes antes de desplegarla en el robot real.
- Desarrollo de modelos Video2World en robotica: sirve como checkpoint de referencia para investigadores que trabajan con MimicVideo y quieren estudiar la generacion de video condicionada por instrucciones en entornos simulados.
- Benchmarking de generacion de video en robotica: el conjunto de 162 episodios con dos camaras y 29 tareas permite evaluar la calidad de generacion de video frente a otros adaptadores del ecosistema VAM-Cross.
- Investigacion en modelos de mundo (world models) para manipulacion: el adaptador puede integrarse en pipelines de world modeling donde el video generado se usa como modelo predictivo del entorno para planificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas como FVD (Fréchet Video Distance), PSNR, SSIM ni comparaciones cuantitativas con otros modelos de generacion de video para robotica.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud, pero el backbone base pesa ~3.9 GB en disco y el pipeline completo incluye un codificador T5-11B (11.000 millones de parametros), por lo que se requiere al menos 24-40 GB de VRAM para inferencia en precision completa.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, o RTX 4090 (24 GB) con cuantizacion si es posible; no se proporcionan datos de cuantizacion.
- No cabe en GPUs de consumo de gama baja (8-12 GB) sin cuantizacion agresiva, y no se han publicado pesos cuantizados (GGUF, AWQ, GPTQ).
- Opciones de despliegue: el modelo requiere el framework MimicVideo en el commit especificado (`e3355dbc93132b576c02f920a59b4fc18a4f5906`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje sino de generacion de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Entorno | Licencia |
|---|---|---|---|---|
| `vam-cross-level4-panda-robosuite-widowx-texture-video-lora-iter-400` (este) | LoRA Video2World | 2 camaras hstack, 5 Hz | robosuite (Panda) | no disponible |
| `vam-cross-level4-ur5e-widowx-texture-teleopaligned-videolora400-action-decoder-iter900` | LoRA World2Action decoder | 2 camaras hstack | robosuite (UR5e) | no disponible |
| `dreamdifferent/widowx250-video-fused` | Backbone fused Video2World DiT | no disponible | WidowX/Bridge | no disponible |

La comparativa se limita a modelos del mismo autor dentro del ecosistema VAM-Cross. No se dispone de informacion sobre alternativas de terceros con especificaciones comparables en generacion de video para robotica.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el backbone exacto `dreamdifferent/widowx250-video-fused` en la revision `f0cea76b62c5dd66b06b9f965932ddea32a7b546`; cargar un backbone distinto produce resultados incorrectos.
- El dataset de entrenamiento no esta incluido en el repositorio; los usuarios deben cumplir con la politica de acceso actual del dataset y los terminos de MimicVideo, NVIDIA Cosmos y los checkpoints base.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; se recomienda contactar al autor antes de usar en produccion.
- Limitado al entorno robosuite con robot Panda y dos camaras fijas; no generaliza a otros robots o configuraciones de camara sin reentrenamiento.
- Riesgo de alucinacion visual: como modelo generativo de video, puede producir trayectorias fisicamente incoherentes o artefactos visuales, especialmente fuera de la distribucion de los datos de entrenamiento.
- El run de entrenamiento termino por `walltime`, no por convergencia; el checkpoint puede no representar el rendimiento optimo posible.
- No hay soporte para otros idiomas ni documentacion en castellano; la model card esta en ingles.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-video-lora-iter-400
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Modelo relacionado (World2Action decoder): https://huggingface.co/dreamdifferent/vam-cross-level4-ur5e-widowx-texture-teleopaligned-videolora400-action-decoder-iter900
- Framework robosuite: https://robosuite.ai/ y https://github.com/ARISE-Initiative/robosuite
