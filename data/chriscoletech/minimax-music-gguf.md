# ChrisColeTech/minimax-music-GGUF

## Resumen

MiniMax Music 3 GGUF es una conversión a formato GGUF del modelo MiniMax-Music3, desarrollado originalmente por MiniMaxAI y adaptado por ChrisColeTech para su uso con herramientas que soportan GGUF, como ComfyUI. El modelo es un sistema de generación de música texto-a-audio que produce canciones completas con voces a partir de una descripción textual (caption) y letras, con una duración máxima de aproximadamente cinco minutos, en estéreo y a 44.1 kHz.

La arquitectura combina un codificador de texto autorregresivo con un transformer de difusión (DiT) basado en flow-matching, junto con un VAE de audio para la decodificación final. El modelo tiene unos 2.460 millones de parámetros en su versión original en safetensors, y la conversión a GGUF permite cuantizaciones como Q8_0, reduciendo significativamente los requisitos de memoria y facilitando la ejecución en hardware de consumo. Su relevancia radica en que democratiza la generación de música con calidad profesional, ya que el modelo original requiere recursos considerables, mientras que esta versión cuantizada puede ejecutarse en GPUs de gama alta para consumidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de texto autorregresivo + DiT de flow-matching + VAE de audio |
| Parametros totales | 2.457.073.817 (safetensors, ~2.46B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta ~300 segundos de audio (5 minutos) |
| Tipos de cuantizacion | Q8_0 (documentada en la model card; pueden existir otras no listadas) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | GGUF (text encoder y DiT), safetensors (VAE de audio) |

## Arquitectura y entrenamiento

El modelo se compone de tres módulos principales: un codificador de texto autorregresivo que procesa la descripción y las letras, un transformer de difusión (DiT) que genera representaciones latentes de audio mediante flow-matching, y un VAE de audio (denominado `dav`) que decodifica esas representaciones en la forma de onda final. El flujo de generación es de dos etapas: primero el codificador autorregresivo produce un contexto semántico, y luego el DiT refina el audio latente en pasos iterativos (típicamente 30 pasos Euler). No se dispone de información pública sobre el conjunto de datos de entrenamiento, el número de tokens procesados o el uso de técnicas como RLHF o DPO. La innovación principal de esta conversión es la cuantización a GGUF, que permite ejecutar el modelo con menos memoria y en entornos como ComfyUI mediante un loader específico.

## Capacidades

- Generación de canciones completas con voces a partir de una descripción textual y letras estructuradas.
- Control de estructura musical mediante etiquetas como `[intro]`, `[verse]`, `[chorus]`, `[bridge]`, `[instrumental]`, `[solo]` y `[outro]`.
- Salida de audio estéreo a 44.1 kHz, con duración configurable entre 120 y 300 segundos.
- Soporte de parámetros de generación avanzados: steps, CFG (guidance), top-k para el codificador autorregresivo.
- Capacidad de seguir instrucciones detalladas en el caption, incluyendo género, BPM, tonalidad, ambiente y características vocales.
- Integración con ComfyUI mediante un loader GGUF actualizado, lo que permite flujos de trabajo visuales.
- Cuantización Q8_0 disponible para reducir el uso de VRAM y acelerar la inferencia en GPUs de consumo.

## Casos de uso

- Creación de demos musicales rápidas: un compositor puede generar una maqueta con voz y arreglos a partir de una descripción y letras, ahorrando horas de producción inicial.
- Bandas sonoras para vídeo y podcasts: el modelo permite generar música de fondo con una duración de hasta 5 minutos, ajustable a la necesidad del proyecto.
- Prototipado de canciones para artistas: los músicos pueden experimentar con diferentes estilos y estructuras antes de entrar al estudio.
- Generación de pistas de práctica para músicos: se pueden crear acompañamientos instrumentales o con voz para ensayar.
- Automatización de contenido para redes sociales: creación de jingles o fragmentos musicales personalizados a partir de texto.
- Investigación en generación de audio: el modelo sirve como referencia para estudiar arquitecturas de flow-matching aplicadas a música y voz.
- Integración en herramientas de producción musical: mediante ComfyUI, se puede incorporar en pipelines de generación y postprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o métricas de audio) en la informacion disponible. La model card incluye métricas de rendimiento de generación en una RTX 5090 (32 GB), que se resumen a continuación:

| Configuracion | Duracion generada | Tiempo de generacion | Pico de VRAM |
|---|---|---|---|
| bf16 (sin cuantizar) | 4:17 (6416 frames) | ~19 min | 19.2 GiB |
| Q8_0 GGUF | 0:20 (500 frames) | ~2.3 min | 9.7 GiB |

Estos datos indican que la cuantización Q8_0 reduce el uso de memoria a menos de la mitad y acelera la generación por frame, aunque la duración de la muestra es menor. No hay comparativas con otros modelos de generación musical.

## Requisitos de hardware

- VRAM estimada: la versión sin cuantizar requiere al menos 19.2 GiB para una generación de 4:17 en una RTX 5090; la versión Q8_0 requiere unos 9.7 GiB para una generación de 0:20.
- GPU recomendada: RTX 5090 (32 GB) para la versión completa; para Q8_0, una GPU con al menos 12 GB de VRAM podría ser suficiente, aunque no se ha verificado.
- No se ha confirmado compatibilidad con GPUs de consumo de gama media (por ejemplo, RTX 4060 o 4070), pero la cuantización Q8_0 sugiere que es viable.
- Opciones de despliegue: ComfyUI con el loader `comfyui-gguf-loader` (canal remoto). No se mencionan otras herramientas como llama.cpp u Ollama.
- Latencia: aproximadamente 0.18 s por frame en RTX 5090 con Q8_0 (2.3 min para 500 frames), y 0.18 s por frame también en bf16 (19 min para 6416 frames, aunque con mayor VRAM). El throughput es de unos 5.5 frames por segundo en ambos casos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa objetiva con otras alternativas de generación musical como MusicGen, Stable Audio o AudioLDM, ya que no se han incluido datos de rendimiento ni características de esos modelos en la fuente.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos de uso, lo que puede limitar su aplicación comercial sin una revisión legal previa.
- Requiere un loader GGUF específico en ComfyUI; sin él, el modelo no puede ejecutarse correctamente.
- La duración máxima de 300 segundos es un límite superior, no un objetivo garantizado; el modelo puede detenerse antes según el contenido.
- La calidad de la generación depende en gran medida de la estructura del caption y del uso de las etiquetas de estructura; descripciones pobres pueden producir resultados instrumentales o incoherentes.
- No se han documentado sesgos específicos, pero al ser un modelo de generación de audio, puede reflejar sesgos presentes en los datos de entrenamiento (no disponibles).
- Riesgo de alucinación en las letras o en la interpretación de instrucciones complejas; se recomienda validar los resultados.
- No hay información sobre el soporte de idiomas; la model card no indica si funciona con textos en español u otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ChrisColeTech/minimax-music-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Pesos fuente (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-Music-3
- Text encoder pruned bf16: https://huggingface.co/Comfy-Org/MiniMax-Music-3/blob/main/text_encoders/minimax_music3_text_encoder_pruned_bf16.safetensors
- DiT fp16: https://huggingface.co/Comfy-Org/MiniMax-Music-3/blob/main/diffusion_models/minimax_music3_dit_fp16.safetensors
- VAE de audio: https://huggingface.co/ChrisColeTech/minimax-music-GGUF/blob/main/split/vae/minimax_music3_dav.safetensors
