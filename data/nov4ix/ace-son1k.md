# nov4ix/Ace-Son1k

## Resumen

ACE-Step 1.5 es un modelo fundacional de generación de música a partir de texto desarrollado conjuntamente por ACE Studio y StepFun. Se distribuye en Hugging Face bajo el identificador `nov4ix/Ace-Son1k` y emplea una arquitectura híbrida que combina un modelo de lenguaje (LM) como planificador y un Diffusion Transformer (DiT) como generador de audio. Su objetivo es llevar la generación musical de calidad comercial a hardware de consumo, con requisitos de VRAM inferiores a 4 GB en su configuración más ligera.

El modelo destaca por su enfoque en la eficiencia y la seguridad legal: se ha entrenado exclusivamente con datos con licencia, de dominio público y sintéticos, lo que permite el uso comercial de las obras generadas. La versión `turbo` puede generar una canción completa en menos de 2 segundos en una A100 y en menos de 10 segundos en una RTX 3090, según la model card del autor.

La familia incluye varios pesos DiT (base, sft, turbo, turbo-rl) y tres modelos LM de planificación (0.6B, 1.7B y 4B, derivados de Qwen3). El repositorio ocupa 10,1 GB y la licencia es MIT. No se han publicado parámetros totales del DiT ni la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: LM planificador (Qwen3) + Diffusion Transformer (DiT) |
| Parámetros totales | no disponible (el DiT no especifica recuento; los LM van de 0,6B a 4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 50+ idiomas (según model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACE-Step 1.5 emplea una arquitectura híbrida en la que un modelo de lenguaje actúa como planificador "omnicapaz": transforma la consulta del usuario en un plano completo de la canción (estructura, metadatos, letra y descripciones) mediante Chain-of-Thought, y guía después al Diffusion Transformer encargado de sintetizar el audio. El LM se inicializa a partir de Qwen3 en tres tamaños (0,6B, 1,7B y 4B) y se entrena con preentrenamiento, SFT y RL. La alineación se realiza mediante aprendizaje por refuerzo intrínseco, sin depender de modelos de recompensa externos ni de preferencias humanas.

El DiT se ofrece en cuatro variantes: `base` (preentrenamiento, 50 pasos, CFG), `sft` (50 pasos, CFG), `turbo` (8 pasos, sin CFG) y `turbo-rl` (8 pasos, con RL, pendiente de publicación). Los datos de entrenamiento proceden de música con licencia profesional, colecciones libres de regalías y datos sintéticos generados mediante conversión MIDI-a-audio. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de música a partir de texto (text2music) con adherencia estricta al prompt en más de 50 idiomas.
- Planificación automática de la canción mediante LM con Chain-of-Thought: metadatos, letra, estructura y descripciones.
- Escalado de composiciones desde bucles cortos hasta piezas de 10 minutos.
- Edición musical: cover generation, repainting (regeneración de secciones) y conversión de voz a música de fondo (vocal-to-BGM).
- Comprensión de audio de referencia (refer audio) para guiar el estilo.
- Control estilístico preciso y diversidad configurable según la variante del DiT.
- Modos "Lego" y "Complete" en el modelo base para composición modular.
- Extracción de componentes en el modelo base.
- No se especifica soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Producción musical asistida: un compositor puede introducir una descripción textual y obtener un borrador completo de canción en segundos, usando la variante `turbo` en una RTX 3090 para iterar rápidamente sobre ideas.
- Generación de bandas sonoras para vídeo y podcasts: el modelo produce música de fondo original con licencia MIT, apta para monetización en plataformas como YouTube.
- Creación de jingles y música publicitaria: la planificación con LM permite especificar género, instrumentación y duración, y el DiT sintetiza la pieza final con calidad comercial.
- Edición y remezcla: la función de repainting permite regenerar secciones concretas de una pista sin rehacerla entera, útil en flujos de postproducción.
- Conversión de voz a BGM: creadores que graban voces pueden generar automáticamente un acompañamiento instrumental coherente con la melodía.
- Prototipado rápido en investigación musical: el modelo base con modos Lego y Complete sirve para experimentar con composición modular y extracción de componentes.
- Aplicaciones educativas: generación de ejemplos musicales en distintos estilos e idiomas para enseñanza de producción o teoría musical.

## Benchmarks y rendimiento

La model card incluye una imagen de evaluación sin cifras textuales y no se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento citados son de velocidad: menos de 2 segundos por canción en A100 y menos de 10 segundos en RTX 3090 con la variante `turbo`.

## Requisitos de hardware

- VRAM: menos de 4 GB en la configuración más ligera según la model card; el repositorio completo ocupa 10,1 GB.
- GPU recomendadas: A100 para máxima velocidad (menos de 2 s por canción); RTX 3090 para inferencia local (menos de 10 s por canción).
- Compatible con GPU de consumo: sí, el modelo está diseñado explícitamente para ejecutarse en hardware de consumo con menos de 4 GB de VRAM.
- Opciones de despliegue: la librería declarada es transformers con soporte de diffusers y código personalizado (`custom_code`); no se detallan otras opciones como vLLM, llama.cpp u Ollama para este modelo.
- Latencia y throughput: los únicos datos disponibles son los tiempos de generación por canción citados (2 s en A100, 10 s en RTX 3090); no se especifica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ACE-Step 1.5 (este) | DiT no especificado; LM 0,6B–4B | no disponible | MIT | Hugging Face, ModelScope, Space demo | Uso comercial explícito, datos con licencia, <4 GB VRAM |
| Alternativas de la misma categoría (text2music open source) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada para comparar parámetros, contexto o rendimiento |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa cuantitativa con modelos alternativos de generación musical.

## Limitaciones y advertencias

- No se han publicado métricas objetivas de calidad musical (FAD, CLAP score u otras) en la información disponible; la evaluación se presenta solo como imagen.
- El modelo base (`acestep-v15-base`) tiene calidad media y alta diversidad; las variantes `sft` y `turbo` priorizan calidad sobre diversidad, lo que puede reducir la variedad de resultados.
- La variante `turbo-rl` aún no está publicada, por lo que no puede evaluarse su rendimiento real.
- La model card no detalla sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas específicas más allá de la cobertura declarada de 50+ idiomas.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento cumplen las restricciones legales de su jurisdicción.
- El tamaño del repositorio (10,1 GB) y la dependencia de `custom_code` pueden complicar el despliegue en entornos con restricciones de almacenamiento o sandboxing.
- No se especifican requisitos de contexto ni límites de longitud de prompt más allá de la capacidad de generar piezas de hasta 10 minutos.

## Enlaces

- Hugging Face: https://huggingface.co/nov4ix/Ace-Son1k
- Proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Colección en Hugging Face: https://huggingface.co/collections/ACE-Step/ace-step-15
- ModelScope: https://modelscope.cn/models/ACE-Step/Ace-Step1.5
- Space demo: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Discord: https://discord.gg/PeWDxrkdj7
- Tech Report (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio GitHub (citado en BibTeX): https://github.com/ace-step/ACE-Step-1.5
