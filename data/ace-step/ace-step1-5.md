# ACE-Step/Ace-Step1.5

## Resumen

ACE-Step 1.5 es un modelo de generación de música de código abierto desarrollado conjuntamente por ACE Studio y StepFun. Su objetivo es llevar la generación musical de calidad comercial a hardware de consumo, permitiendo a creadores y desarrolladores generar canciones completas de forma local y con fines comerciales. El modelo emplea una arquitectura híbrida en la que un modelo de lenguaje (LM) actúa como planificador omnicapaz, transformando consultas de usuario en planos completos de canciones (desde bucles cortos hasta composiciones de 10 minutos) y generando metadatos, letras y descripciones mediante cadenas de pensamiento (Chain-of-Thought) para guiar a un Diffusion Transformer (DiT) que sintetiza el audio final.

El modelo se distribuye en varias variantes (base, SFT, turbo y turbo-RL) que cubren diferentes equilibrios entre calidad, velocidad y capacidad de edición. Según sus desarrolladores, ACE-Step 1.5 genera una canción completa en menos de 2 segundos en una GPU A100 y en menos de 10 segundos en una RTX 3090, con un consumo de VRAM inferior a 4 GB, lo que lo hace viable en equipos de consumo. El entrenamiento se realizó sobre un conjunto de datos legalmente sólido, compuesto por música licenciada, material libre de derechos y datos sintéticos generados mediante conversión MIDI a audio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LM (Qwen3, 0.6B-4B) + Diffusion Transformer (DiT) |
| Parametros totales | No disponible (el LM varía entre 0.6B y 4B según variante; el DiT no especifica tamaño) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el LM procesa texto; no se especifica ventana) |
| Tipos de cuantizacion | No disponible (funciona con <4 GB VRAM, sugiere cuantización pero no se detalla) |
| Idiomas soportados | Más de 50 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACE-Step 1.5 utiliza una arquitectura híbrida en la que un modelo de lenguaje (LM) actúa como planificador y un Diffusion Transformer (DiT) como generador de audio. El LM, basado en la familia Qwen3 (0.6B, 1.7B y 4B), recibe la consulta del usuario y produce un "plano" de la canción que incluye metadatos, letras, descripciones y estructura musical. Este plano se utiliza como condición para el DiT, que sintetiza el audio en el dominio de tokens de audio de 5 Hz. La alineación entre LM y DiT se logra mediante aprendizaje por refuerzo intrínseco, que depende únicamente de los mecanismos internos del modelo, evitando los sesgos de modelos de recompensa externos o preferencias humanas.

El entrenamiento se realizó sobre un conjunto de datos legalmente sólido compuesto por pistas musicales con licencia profesional, material de dominio público y libre de derechos, y datos sintéticos generados mediante conversión MIDI a audio. El modelo está disponible en varias versiones: `acestep-v15-base` (preentrenamiento), `acestep-v15-sft` (ajuste supervisado), `acestep-v15-turbo` (destilación para 8 pasos de inferencia) y `acestep-v15-turbo-rl` (refuerzo adicional, aún no publicado). El DiT soporta guiado sin clasificador (CFG) en las versiones base y SFT, y utiliza 50 pasos de inferencia, mientras que las versiones turbo requieren solo 8 pasos.

## Capacidades

- Generación de música a partir de texto (text-to-music) en más de 50 idiomas, con adherencia estricta a las indicaciones del usuario.
- Edición musical versátil: generación de versiones (cover), repintado (repaint), extracción de voz a acompañamiento (vocal-to-BGM) y composición por bloques (lego).
- Completado de canciones (complete): el modelo puede extender o finalizar composiciones existentes.
- Comprensión de audio: el LM es capaz de interpretar referencias de audio y copiar melodías (capacidad variable según el tamaño del LM).
- Generación de metadatos, letras y descripciones mediante cadenas de pensamiento, lo que permite un control fino sobre el resultado.
- Soporte multiplataforma: funciona en hardware Mac (Apple Silicon), AMD, Intel y CUDA.

## Casos de uso

- Producción musical profesional: un compositor puede generar bocetos completos de canciones a partir de una descripción textual, incluyendo letras y estructura, y usarlos como base para arreglos posteriores.
- Creación de bandas sonoras para vídeo y juegos: el modelo puede producir pistas de ambiente o temas específicos en cuestión de segundos, reduciendo drásticamente el tiempo de búsqueda de música libre de derechos.
- Herramientas de edición para estudios: la capacidad de repintado permite modificar secciones concretas de una pista (cambiar instrumentación, armonía o ritmo) sin regenerar la canción completa.
- Extracción de voz a BGM: para creadores de contenido que necesitan separar la voz de una grabación y obtener solo el acompañamiento, útil en remezclas o karaoke.
- Generación de música personalizada para aplicaciones interactivas: el modelo puede integrarse en plataformas de streaming o videojuegos que generan música adaptativa en tiempo real según el contexto del usuario.
- Prototipado rápido en educación musical: estudiantes y docentes pueden experimentar con diferentes estilos y estructuras musicales generando ejemplos instantáneos a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una imagen de evaluación comparativa, pero los datos concretos no están disponibles en el texto. Los desarrolladores afirman que el modelo supera a la mayoría de alternativas comerciales en métricas comunes de calidad, pero no se proporcionan cifras específicas.

## Requisitos de hardware

- VRAM estimada: menos de 4 GB para inferencia local, según los desarrolladores.
- GPU recomendadas: A100 (generación en <2 segundos), RTX 3090 (<10 segundos), y GPU de consumo con soporte CUDA.
- Compatibilidad: funciona en Mac (Apple Silicon), AMD, Intel y CUDA.
- Opciones de despliegue: el repositorio de GitHub indica soporte para múltiples plataformas; se puede ejecutar localmente con scripts proporcionados, aunque no se mencionan integraciones específicas con vLLM, llama.cpp u Ollama (al ser un modelo de audio, el despliegue es específico).
- Latencia y throughput: no se proporcionan datos detallados más allá de los tiempos de generación mencionados.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados con otros modelos de generación de música open source en la información proporcionada. La model card afirma que ACE-Step 1.5 supera a la mayoría de alternativas comerciales, pero no se citan modelos concretos ni métricas. Se recomienda consultar el informe técnico (arXiv:2602.00744) para una comparativa extensa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible, pero al tratarse de un modelo entrenado con datos musicales, podría reflejar sesgos presentes en el material de entrenamiento (géneros dominantes, estilos culturales, etc.).
- Riesgo de alucinación: como todo modelo generativo, puede producir resultados que no se corresponden exactamente con la descripción solicitada, especialmente en indicaciones ambiguas o complejas.
- La adherencia a las indicaciones es estricta según los desarrolladores, pero la calidad puede variar según la complejidad de la petición y el idioma utilizado.
- La licencia MIT permite uso comercial, pero es recomendable verificar la procedencia de los datos de entrenamiento para asegurar el cumplimiento legal en cada jurisdicción.
- Las versiones turbo y turbo-RL sacrifican cierta diversidad y capacidad de edición (no soportan repaint, extract, lego ni complete) a cambio de velocidad.
- El modelo requiere de una infraestructura específica para audio; no es un modelo de texto puro y su integración en pipelines existentes puede requerir adaptación.

## Enlaces

- HuggingFace: https://huggingface.co/ACE-Step/Ace-Step1.5
- Proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- GitHub: https://github.com/ace-step/ACE-Step-1.5
- Informe técnico: https://arxiv.org/abs/2602.00744
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Colección de modelos: https://huggingface.co/collections/ACE-Step/ace-step-15
- ModelScope: https://modelscope.cn/models/ACE-Step/Ace-Step1.5
- Discord: https://discord.gg/PeWDxrkdj7
