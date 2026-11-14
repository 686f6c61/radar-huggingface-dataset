# charanporan/Irodori-TTS-Enhanced-Plus

## Resumen

Irodori-TTS Enhanced Plus es un paquete de interfaz web (WebUI) de código abierto, desarrollado por Charanporan, que envuelve y amplía el modelo japonés de síntesis de voz Irodori-TTS de Aratako. No se trata de un modelo de pesos nuevo, sino de una capa de orquestación e interfaz construida sobre los pesos oficiales de la familia Irodori-TTS (v4.1-Small, v4.1-Small-MF y v4-Large), que se descargan automáticamente desde el repositorio original en el primer arranque. El proyecto se distribuye con licencia MIT y está orientado a la ejecución local en equipos con GPU NVIDIA RTX.

El modelo subyacente es un sistema TTS basado en Flow Matching sobre el espacio latente continuo de DACVAE, implementado como un Diffusion Transformer con Rectified Flow (RF-DiT). Incluye una variante destilada con MeanFlow que reduce la inferencia a 4 pasos, además de condicionamiento multimodal por texto, referencia de audio (hasta 120 segundos) y caption de timbre, predicción automática de duración y soporte de Speaker Inversion mediante embeddings `*.speaker.safetensors`.

La relevancia de este paquete reside en la capa de ingeniería añadida: generación por lotes de hasta 20 líneas con fusión de audio, control de silencios y fundidos de cola con curva coseno, paleta de emojis de emoción asistida por LLM (Gemini API u Ollama local), Voice Design dinámico por línea, gestión de configuración en dos capas (`defaults` y `saved`) y una UI Gradio rediseñada con soporte de modo claro y oscuro. Está especializado exclusivamente en japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DiT (Rectified Flow Diffusion Transformer) sobre latente continuo DACVAE; variante destilada MeanFlow |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (referencia de audio de hasta 120 segundos para condicionamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | MIT (Copyright (c) 2026 Aratako / Copyright (c) 2026 Charanporan) |
| Formato de pesos | safetensors (pesos oficiales descargados en el primer arranque; embeddings de hablante en `*.speaker.safetensors`) |

## Arquitectura y entrenamiento

El núcleo heredado de Aratako/Irodori-TTS (commit `89f9d8f`) es un sistema de síntesis de voz por Flow Matching que opera sobre el espacio latente continuo de un códec DACVAE, con un Diffusion Transformer con Rectified Flow como generador. La variante MeanFlow (MF) es un modelo destilado que reduce el número de pasos de inferencia de los 30-40 habituales a solo 4, manteniendo calidad de salida. El condicionamiento es multimodal en tres ramas: texto, referencia de audio de hasta 120 segundos y caption descriptivo del timbre de voz (Voice Design). El modelo predice automáticamente la duración del audio a partir de la longitud del texto, con un factor de escala ajustable entre 0.5 y 1.5.

El paquete Enhanced Plus no reentrena los pesos: añade una capa de post-proceso y control. Entre sus aportaciones técnicas destacan la fusión de múltiples líneas generadas con control de silencio entre líneas en milisegundos, un fundido de cola con ventana coseno `0.5 * (1.0 + torch.cos(t))` para evitar cortes abruptos, recorte de amplitud con umbral y margen configurables, y una corrección del orden de procesado (recorte de silencio, luego fundido de cola, luego relleno y fusión) para que el fundido no sea eliminado por el recorte. También integra Speaker Inversion para cargar embeddings de hablante entrenados directamente desde la UI. No se dispone de información sobre el volumen o la composición del dataset de entrenamiento original ni sobre el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz en japonés a partir de texto, con predicción automática de duración y escala ajustable (0.5-1.5).
- Clonación de voz mediante referencia de audio de hasta 120 segundos y condicionamiento por caption de timbre (Voice Design).
- Voice Design dinámico por línea: cada línea del guion puede llevar su propia emoción o caption.
- Generación por lotes de hasta 20 líneas de texto en una sola pasada, con fusión automática del audio resultante.
- Inferencia rápida con la variante MeanFlow (4 pasos) o de mayor calidad con el modelo Large (30-40 pasos).
- Speaker Inversion: carga de embeddings `*.speaker.safetensors` con nombrado automático mediante `%filename%`.
- Asistencia de emoción mediante LLM: inserción automática de emojis de emoción usando Gemini API (selección dinámica del modelo más reciente) u Ollama en local.
- Post-proceso de audio: fundido de cola coseno, recorte de silencio con umbral y margen, control de silencio inicial, entre líneas y final en milisegundos.
- Marcado de agua perceptual (SilentCipher) en el audio generado.
- Interfaz Gradio con gestión de configuración en dos capas y restauración del estado de los paneles.

## Casos de uso

- Producción de audiolibros y narración por capítulos: la generación por lotes de hasta 20 líneas con fusión automática y control de silencio entre líneas permite convertir guiones largos en un único WAV con pausas naturales, evitando el trabajo manual de concatenación.
- Doblaje y localización al japonés: el Voice Design por línea permite asignar timbres y emociones distintos a cada intervención de un guion, útil para maquetas de doblaje antes de la grabación con actores.
- Creación de contenido para vídeo y pódcast: la variante MeanFlow a 4 pasos ofrece latencia muy baja (del orden de décimas de segundo según la model card), adecuada para previsualizaciones rápidas de guiones y ajustes iterativos de entonación.
- Asistentes de voz y prototipos de interfaz conversacional en japonés: la clonación con referencia de audio permite generar una voz de marca consistente y desplegarla localmente en una GPU RTX sin depender de servicios en la nube.
- Accesibilidad y lectura de textos: conversión de documentos japoneses a audio con control de velocidad mediante la escala de duración (0.5-1.5), útil para usuarios con discapacidad visual o para consumo de contenido en movilidad.
- Investigación en TTS y evaluación de modelos: al ser un paquete MIT con módulos separados (`audio_processor.py`, `llm_client.py`, `config_manager.py`), sirve como banco de pruebas para comparar la variante Small, MeanFlow y Large, y para experimentar con post-proceso de audio.
- Generación de voces para videojuegos y prototipos: la carga de embeddings de hablante permite mantener varios personajes con voces fijas y generar sus líneas por lotes en una sola ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entorno objetivo declarado por el autor: PC local con GPU NVIDIA RTX (la model card menciona explícitamente NVIDIA RTX).
- VRAM estimada para inferencia: no disponible. El paquete soporta tres variantes de pesos (v4.1-Small, v4.1-Small-MF y v4-Large) con requisitos distintos, pero no se publican cifras de VRAM ni de tamaño de los pesos.
- GPU recomendadas: no disponible de forma específica; el autor cita GPUs NVIDIA RTX en general.
- Compatibilidad con GPU de consumo: probable según el enfoque del proyecto (ejecución local en RTX), pero sin cifras confirmadas de VRAM para cada variante.
- Opciones de despliegue: WebUI Gradio propia (`gradio_app_enhance.py`) con módulos auxiliares; integración opcional con Ollama para la asistencia de emociones y con la API de Gemini. No se documenta soporte de vLLM, llama.cpp ni TGI (no aplicables a un pipeline TTS de este tipo).
- Latencia y throughput: la model card indica que la variante MeanFlow a 4 pasos alcanza tiempos de generación en el rango de 0.1 segundos, frente a los 30-40 pasos del modelo Large. No se aportan cifras de throughput agregado ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / referencia | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| Irodori-TTS Enhanced Plus (este) | WebUI + post-proceso sobre Irodori-TTS | no disponible | Referencia de audio hasta 120 s | ja | MIT | Paquete de interfaz con lotes de 20 líneas, fundidos y asistencia LLM |
| Aratako/Irodori-TTS (original) | Modelo TTS RF-DiT + MeanFlow | no disponible | Referencia de audio hasta 120 s | ja | MIT | Núcleo oficial; UI Gradio monolítica sin generación por lotes ni post-proceso |
| Primera generación de scripts de la comunidad | Scripts no oficiales sobre Irodori-TTS | no disponible | no disponible | ja | no disponible | Solo generación multilínea y fusión básica; sin control de silencios ni fundidos |
| Otros TTS japoneses open source (p. ej. estilos de la familia VOICEVOX o Style-Bert-VITS2) | no disponible en la información | no disponible | no disponible | ja | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- Especializado exclusivamente en japonés: no hay soporte declarado de otros idiomas, por lo que el texto en castellano u otras lenguas no está cubierto.
- No es un modelo nuevo: el rendimiento final depende enteramente de los pesos oficiales de Aratako/Irodori-TTS, que se descargan en el primer arranque; sin conexión al repositorio oficial el paquete no puede funcionar.
- Riesgo de alucinación acústica y errores de pronunciación en textos con nombres propios, siglas o terminología técnica no vista en el entrenamiento del modelo base.
- La asistencia de emociones depende de un LLM externo (Gemini API u Ollama local); la calidad de la emoción insertada y la privacidad del texto dependen de ese tercero. El uso de la API de Gemini implica enviar el guion a un servicio externo.
- La clonación de voz plantea riesgos éticos y legales: la model card prohíbe explícitamente clonar voces de personas reales sin consentimiento, generar deepfakes o contenido engañoso, y usar referencias de audio que infrinjan derechos de autor o de imagen.
- Licencia MIT para el código, pero las restricciones éticas del modelo base (no consentimiento, no suplantación) deben respetarse igualmente en producción.
- El proyecto se autodefine como "魔改造版" (versión muy modificada) con versión `v0.3.1-stable`; la model card documenta correcciones recientes de bugs en el fundido de cola, lo que sugiere que conviene fijar la versión y validar el post-proceso de audio antes de desplegar.
- Sin métricas publicadas de calidad (MOS, WER, similitud de hablante) ni benchmarks: la evaluación debe hacerse por cuenta del usuario.
- El marcado de agua SilentCipher se aplica automáticamente; debe verificarse que sea compatible con los requisitos del canal de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/charanporan/Irodori-TTS-Enhanced-Plus
- Repositorio GitHub del paquete: https://github.com/fxty2006/Irodori-TTS-Enhanced-Plus
- Modelo base v4.1-Small: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Repositorio original de Aratako/Irodori-TTS: https://github.com/Aratako/Irodori-TTS
- Modelo base v4.1-Small-MF: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-MF (referenciado en la model card; no verificado)
- Modelo base v4-Large: https://huggingface.co/Aratako/Irodori-TTS-v4-Large (referenciado en la model card; no verificado)
