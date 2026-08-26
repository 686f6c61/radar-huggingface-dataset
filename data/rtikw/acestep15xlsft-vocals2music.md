# rtikw/acestep15xlsft-vocals2music

## Resumen

Este repositorio aloja un mirror sin modificar del modelo `acestep15xlsft-vocals2music`, originalmente publicado por DiffSynth-Studio en ModelScope. Se trata de un modelo de tipo *template* (o ControlNet) entrenado sobre la base de ACE-Step-v1.5-XL-sft, cuyo objetivo es generar música de acompañamiento a partir de una pista de voz acapella (vocals-to-music). El modelo está diseñado para entradas de audio con un ritmo estable y una pulsación marcada, y es capaz de producir una pieza musical completa con letra, clave y compás especificados.

Técnicamente, el modelo se apoya en la arquitectura DiT (Diffusion Transformer) del ecosistema ACE-Step 1.5, combinando un pipeline de difusión con un módulo de *template* que condiciona la generación a partir de la señal de voz de entrada. El archivo safetensors del repositorio tiene **210.454.528 parámetros** (aproximadamente 210 millones), aunque estos corresponden únicamente al componente *template*; el modelo base ACE-Step 1.5 XL es significativamente mayor. Su relevancia radica en que permite a desarrolladores y músicos generar acompañamientos personalizados sin necesidad de muestras MIDI ni arreglos manuales, con una licencia Apache-2.0 que facilita su integración en proyectos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con módulo template/ControlNet sobre ACE-Step 1.5 XL |
| Parámetros totales | 210.454.528 (solo el componente template; el modelo base es más grande) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; la generación se controla por duración en segundos) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en bfloat16 para inferencia) |
| Idiomas soportados | no disponible (la letra de ejemplo está en chino; el modelo base ACE-Step 1.5 soporta múltiples idiomas, pero no se especifica para este template) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador de tipo *template* (similar a un ControlNet) que se inserta en el pipeline de generación de ACE-Step 1.5 XL. La arquitectura subyacente es un Diffusion Transformer (DiT) que procesa tanto texto (letras) como audio, y el componente *template* añade un condicionamiento adicional a partir de la pista vocal de entrada. Según la documentación de ACE-Step, la versión 1.5 es un modelo de generación musical de código abierto que soporta text-to-music, *audio cover*, repintado y otras tareas, y está diseñado para ejecutarse eficientemente en hardware de consumo.

El entrenamiento se realizó sobre la base `ACE-Step-v1.5-XL-sft` (supervised fine-tuning) y se publicó con un LoRA adicional recomendado (`acestep15xlsft-lora-music`) que mejora la calidad del resultado. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el número de tokens o pasos de optimización. El proceso de inferencia utiliza el pipeline `TemplatePipeline` de DiffSynth-Studio, que condiciona la generación con la voz de entrada y los parámetros musicales (BPM, tonalidad, compás, duración).

## Capacidades

- Generación de música de acompañamiento a partir de una pista vocal acapella (cluir-to-music).
- Condicionamiento por texto: acepta letras (lyrics) estructuradas por secciones (verse, chorus, bridge, etc.).
- Control fino de la generación musical mediante parámetros como BPM, clave (key/scale), compás (time signature) y duración en segundos.
- Soporte para selección del idioma de la voz (el ejemplo usa `zh` para chino).
- Capacidad de generar acompañamientos coherentes con la estructura de la letra y el ritmo de la voz de entrada.
- Compatible con el pipeline de DiffSynth-Studio para integración en proyectos de generación de audio.

## Casos de uso

- Producción musical amateur: un cantante puede grabar una pista vocal acapella y obtener un acompañamiento completo (instrumental) con el BPM y la tonalidad deseados, ideal para demos o maquetas.
- Generación de fondos musicales para vídeo: los creadores de contenido pueden generar acompañamientos para vídeos de canto o tutoriales musicales sin necesidad de composición manual.
- Prototipado rápido en I+D de audio: los investigadores pueden usar el modelo para experimentar con condicionamiento de audio y generación musical, gracias a su licencia Apache-2.0 y su integración con DiffSynth-Studio.
- Educación musical: herramientas de práctica que generan pistas de acompañamiento a partir de la voz del estudiante para ensayar canciones.
- Creación de remixes o versiones alternativas: a partir de una pista vocal existente se puede generar un nuevo acompañamiento con un estilo o tempo diferente.
- Automatización de flujos de producción en estudios independientes: el modelo puede integrarse en pipelines de postproducción para generar pistas de acompañamiento iniciales que luego se editan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Este modelo es de generación de audio y no tiene métricas estandarizadas de razonamiento o código. No se proporcionan evaluaciones objetivas de calidad musical (como FAD o CLAP score) en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; el modelo base ACE-Step 1.5 XL requiere una GPU con al menos 16 GB de VRAM en bfloat16, y el componente *template* añade un coste adicional pequeño.
- GPU recomendadas: NVIDIA RTX 3090/4090 o superiores; también compatible con A100/H100 para inferencia en producción.
- El modelo completo (base + template + LoRA) puede caber en GPUs de consumo (24 GB) pero se recomienda usar cuantización o desplegar en servicios con GPU dedicada.
- Opciones de despliegue: se usa mediante el pipeline de DiffSynth-Studio (Python) con PyTorch; no hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La generación de 160 segundos de audio con 100 pasos de inferencia puede llevar varios minutos en una GPU de consumo.

## Comparativa con modelos similares

No se dispone de comparativas directas con modelos equivalentes en la información proporcionada. Se puede considerar como referencia el propio ecosistema ACE-Step 1.5 (que soporta text-to-music y audio cover) y otros modelos de generación de música open source como MusicGen (Meta) o AudioLDM 2, aunque no se han publicado comparativas con este modelo concreto.

## Limitaciones y advertencias

- El modelo solo es funcional para pistas de voz con ritmo estable y pulsación fuerte; no funcionará bien con voces libres o improvisadas.
- Es un mirror no oficial alojado por un tercero (rtikw) para la app LocalMusic; no está garantizado que los pesos sean exactamente los originales, aunque el autor afirma que no se han modificado los checksums.
- La calidad de la generación depende fuertemente del modelo base ACE-Step 1.5 XL y del LoRA recomendado; el uso de estos componentes es necesario para obtener resultados correctos.
- La letra (lyrics) se procesa como texto, pero el modelo no es un generador de texto; las letras deben ser proporcionadas por el usuario.
- La licencia Apache-2.0 permite uso comercial, pero los usuarios deben verificar la licencia del modelo base y del LoRA adicionales, así como las condiciones de los datos de entrenamiento.
- No se dispone de información sobre sesgos en el entrenamiento, aunque la muestra de ejemplo es en chino, lo que sugiere que el modelo puede estar sesgado hacia voces en ese idioma.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/rtikw/acestep15xlsft-vocals2music
- Repositorio original en ModelScope: https://modelscope.cn/models/DiffSynth-Studio/acestep15xlsft-vocals2music
- Código de inferencia de ejemplo (GitHub): https://github.com/modelscope/DiffSynth-Studio/blob/main/examples/ace_step/model_inference/acestep15xlsft-vocals2music.py
- Código de validación (GitHub): https://github.com/modelscope/DiffSynth-Studio/blob/main/examples/ace_step/model_training/validate_full/acestep15xlsft-vocals2music.py
- Documentación de ACE-Step en DiffSynth: https://diffsynth-studio-doc.readthedocs.io/en/latest/Model_Details/ACE-Step.html
