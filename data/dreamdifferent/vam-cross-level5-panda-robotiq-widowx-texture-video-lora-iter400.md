# dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-video-lora-iter400

## Resumen

Este repositorio contiene un checkpoint LoRA de adaptación para el modelo de generación de video Video2World, desarrollado por el usuario `dreamdifferent`. Se trata de un adaptador entrenado para la tarea de robótica "pick up the candle and place it into the bowl" (recoger una vela y colocarla en un cuenco), utilizando observaciones de dos cámaras (esquina y frontal) de un brazo robótico Panda con pinza Robotiq y un manipulador WidowX. El modelo está diseñado para ser cargado sobre un backbone específico de tipo `fused_video2world_dit`, que ya incorpora una fusión previa de LoRA de WidowX/Bridge.

El checkpoint corresponde a la iteración 400 de un entrenamiento con 172 episodios y 54 256 frames, con una disposición de vistas apiladas horizontalmente a 5 Hz. No es un modelo autónomo, sino un adaptador que requiere el backbone inicial exacto y los artefactos de runtime de MimicVideo (tokenizador de video y codificador de texto T5-11B). Su relevancia radica en la generación de video condicionada a instrucciones y observaciones multimodales para el entrenamiento de políticas robóticas, un área emergente en la simulación y planificación de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre DiT fusionado (`fused_video2world_dit`) |
| Parametros totales | no disponible (el adaptador pesa 3.7 GB, el backbone base ~3.9 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado a un backbone de difusion de video denominado `fused_video2world_dit`. Este backbone es un Diffusion Transformer (DiT) que ya ha sido fusionado con pesos de un LoRA previo de WidowX/Bridge, por lo que el checkpoint actual se entrena sobre esa base fusionada. El entrenamiento se realizo con el framework MimicVideo, utilizando un tokenizador de video y un codificador de texto T5-11B como componentes auxiliares. Los datos de entrenamiento consisten en 172 episodios con 54 256 frames, capturados con dos camaras (esquina y frontal) y presentados en una vista apilada horizontalmente a 5 Hz. La instruccion unica del dataset es "pick up the candle and place it into the bowl". No se especifican detalles sobre el numero total de tokens de entrenamiento, el proceso de optimizacion o si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de video condicionada a instrucciones textuales y observaciones de multiples camaras.
- Adaptacion especifica para tareas de manipulacion robotica (recoger y colocar objetos).
- Soporte de dos vistas de camara simultaneas (esquina y frontal) mediante apilado horizontal.
- Integracion con el ecosistema MimicVideo para generacion de video2world.
- Requiere un backbone fusionado especifico, no es un modelo independiente.

## Casos de uso

- Entrenamiento de politicas robotica con simulacion de video: el modelo puede generar secuencias de video sinteticas de la tarea de manipulacion, que se utilizan como datos aumentados para entrenar politicas de control en entornos simulados o reales.
- Planificacion de tareas en robotica: dado un estado inicial observado por las camaras, el modelo predice la evolucion del video, permitiendo a un planificador evaluar trayectorias antes de ejecutarlas.
- Generacion de datos sinteticos para aprendizaje por imitacion: los videos generados pueden complementar datasets reales de demostraciones, reduciendo la necesidad de recopilacion fisica.
- Validacion de escenarios de manipulacion: permite probar variaciones de la tarea (cambios de posicion de objetos, iluminacion, texturas) sin ejecutar el robot fisico.
- Desarrollo de modelos de mundo para robotica: el adaptador contribuye a construir modelos generativos que entienden la dinamica de la interaccion entre el brazo robotico y los objetos.
- Investigacion en generacion de video condicionada a multiples vistas: sirve como referencia para estudiar la fusion de informacion de camaras en modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K, ni evaluaciones especificas de calidad de video (FVD, IS, etc.).

## Requisitos de hardware

- El adaptador LoRA pesa 3.7 GB, pero requiere cargar el backbone `fused_video2world_dit` de aproximadamente 3.9 GB, ademas del tokenizador de video y el codificador T5-11B (que por si solo supera los 20 GB en precision completa).
- Se estima que la inferencia completa necesita al menos 24-40 GB de VRAM en GPU, dependiendo de la resolucion y longitud de los videos generados.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB) con cuantizacion del T5 si es posible.
- No se espera que funcione en GPUs de consumo con menos de 16 GB sin cuantizacion agresiva.
- Opciones de despliegue: el framework MimicVideo proporciona scripts de inferencia; no se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (LoRA de video2world para robotica con multiples camaras). El repositorio menciona un checkpoint similar (`vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-200`) del mismo autor, pero no se proporcionan datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: debe cargarse sobre el backbone exacto especificado (`dreamdifferent/widowx250-video-fused`, revision `f0cea76b62c5dd66b06b9f965932ddea32a7b546`). Cargar otro backbone (como el Bridge original) daria resultados incorrectos.
- El dataset de entrenamiento no esta incluido y su acceso puede estar restringido; los usuarios deben cumplir con las politicas de acceso del dataset y los terminos de MimicVideo, NVIDIA Cosmos y el checkpoint base.
- La licencia del modelo no esta especificada, lo que impide conocer las restricciones de uso comercial.
- El modelo esta entrenado para una tarea muy especifica (recoger vela y colocarla en cuenco) con dos camaras fijas; su generalizacion a otras tareas o configuraciones de camaras es incierta.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto; al ser un modelo de generacion de video, puede producir artefactos visuales o inconsistencias fisicas.
- La fecha de creacion (2026-09-02) es posterior a la fecha actual, lo que sugiere que el repositorio podria ser experimental o tener metadatos incorrectos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-video-lora-iter400
- Repositorio del backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Repositorio del dataset (no incluido): https://huggingface.co/datasets/dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture
- Checkpoint bundle de MimicVideo: https://huggingface.co/jonpai/mimic-video
- Repositorio de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`): no se proporciona URL directa en la informacion disponible.
