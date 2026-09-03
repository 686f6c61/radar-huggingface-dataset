# Makaveliai/acestep-v15-base-sft

## Resumen

ACE-Step v1.5 es un modelo de generación de música a partir de texto (text2music) de código abierto, desarrollado conjuntamente por ACE Studio y StepFun. Esta ficha corresponde a la variante `acestep-v15-base-sft`, que incluye pre-entrenamiento y fine-tuning supervisado (SFT), pero no refuerzo (RL). El modelo está diseñado para llevar la generación musical de calidad comercial a hardware de consumo, con una licencia MIT que permite uso comercial sin restricciones.

El modelo emplea una arquitectura híbrida en la que un modelo de lenguaje (LM) actúa como planificador: transforma consultas de usuario en planos completos de canciones (desde loops cortos hasta composiciones de 10 minutos), generando metadatos, letras y descripciones mediante Chain-of-Thought, que guían a un Diffusion Transformer (DiT) para sintetizar el audio final. Esta alineación se logra mediante aprendizaje por refuerzo intrínseco, sin depender de reward models externos ni preferencias humanas, lo que reduce sesgos.

El modelo cuenta con 2.393.872.518 parámetros (2,39B) en formato safetensors, soporta más de 50 idiomas y ofrece capacidades de edición como generación de covers, repintado y conversión de voz a música de fondo. Su relevancia actual radica en que combina velocidad extrema (menos de 2 segundos por canción en una A100), bajo consumo de VRAM (menos de 4 GB) y una licencia permisiva, lo que lo convierte en una opción atractiva para integración en flujos de trabajo creativos profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LM (basado en Qwen3) + Diffusion Transformer (DiT) |
| Parametros totales | 2.393.872.518 (2,39B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 50 |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACE-Step v1.5 utiliza una arquitectura híbrida innovadora. El componente de lenguaje (LM) se basa en los modelos Qwen3 (con variantes de 0,6B, 1,7B y 4B parámetros) y actúa como un planificador omnicapaz: recibe la consulta del usuario y genera un "plano" de la canción que incluye metadatos, letras y captions mediante Chain-of-Thought. Este plano guía a un Diffusion Transformer (DiT) que sintetiza la forma de onda de audio. La alineación entre ambos componentes se logra mediante aprendizaje por refuerzo intrínseco, que utiliza únicamente los mecanismos internos del modelo, eliminando los sesgos de reward models externos o preferencias humanas.

El entrenamiento se realizó sobre un conjunto de datos masivo y legalmente conforme, compuesto por música con licencia profesional, material libre de derechos y datos sintéticos generados mediante conversión MIDI a audio. La variante `base-sft` incluye pre-entrenamiento y fine-tuning supervisado, pero no refuerzo (RL). Según la tabla del modelo, esta versión ofrece calidad alta, diversidad media y facilidad de fine-tuning, con soporte para referencias de audio, text2music, covers y repintado, pero sin capacidades de extracción, Lego o completado.

## Capacidades

- Generación de música a partir de descripciones textuales (text2music), desde loops cortos hasta composiciones de 10 minutos.
- Edición musical: generación de covers, repintado (repaint) y conversión de voz a música de fondo (vocal-to-BGM).
- Uso de audio de referencia (refer audio) para guiar la generación.
- Control estilístico preciso con adherencia estricta a las indicaciones del prompt.
- Soporte multilingüe en más de 50 idiomas.
- Fine-tuning sencillo para adaptar el modelo a dominios o estilos específicos.
- Generación rápida: menos de 2 segundos por canción en una A100 y menos de 10 segundos en una RTX 3090.

## Casos de uso

- Creación de bandas sonoras para vídeo y contenido audiovisual: un creador puede describir el estilo, el estado de ánimo y la duración deseada, y el modelo genera una pista lista para usar en proyectos comerciales sin preocupaciones de copyright.
- Producción musical profesional: los productores pueden usar la generación de covers y el repintado para iterar sobre ideas melódicas o transformar una grabación vocal en una pista instrumental.
- Generación de música para videojuegos: la capacidad de crear loops cortos y composiciones extensas permite generar música adaptativa para diferentes niveles o escenas.
- Prototipado rápido en estudios de grabación: los artistas pueden generar múltiples variaciones de una idea musical en segundos, acelerando el proceso creativo.
- Herramientas de creación de contenido para redes sociales: los creadores pueden generar música de fondo personalizada para vídeos cortos, podcasts o transmisiones en vivo.
- Educación musical: el modelo puede servir como herramienta didáctica para explorar conceptos de composición, armonía y estilo, generando ejemplos auditivos a partir de descripciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de evaluación (como FAD, CLAP score u otras). Sin embargo, se proporcionan datos de rendimiento práctico: generación de una canción completa en menos de 2 segundos en una GPU A100 y menos de 10 segundos en una RTX 3090, con un consumo de VRAM inferior a 4 GB. No se dispone de comparaciones cuantitativas con otros modelos de generación musical.

## Requisitos de hardware

- VRAM estimada: menos de 4 GB para inferencia, según la model card.
- GPU recomendadas: A100 (generación en <2 segundos), RTX 3090 (<10 segundos). También es compatible con GPUs de consumo como la RTX 3060 o superiores, dado el bajo requisito de VRAM.
- El modelo cabe en GPUs de consumo (consumer GPU) con al menos 4 GB de VRAM.
- Opciones de despliegue: al estar basado en la librería `transformers`, es compatible con frameworks como vLLM, TGI y llama.cpp (aunque no se especifica explícitamente). También se puede ejecutar mediante el pipeline `text-to-audio` de Hugging Face.
- Latencia: <2 segundos en A100, <10 segundos en RTX 3090. Throughput no especificado.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de generación musical en la documentación proporcionada. No se han encontrado datos de benchmarks que permitan comparar ACE-Step v1.5 con alternativas como MusicGen, Stable Audio o AudioLDM. La información disponible se limita a las características internas del modelo y a su rendimiento declarado.

## Limitaciones y advertencias

- El modelo está subido por un usuario (Makaveliai) y no es la versión oficial de ACE-Step. Se recomienda verificar la autenticidad y descargar desde las fuentes oficiales (colección de Hugging Face de ACE-Step).
- La diversidad de salida se califica como "media" en la tabla del modelo, lo que puede implicar cierta tendencia a generar estilos o estructuras repetitivas.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos sintéticos y licenciados, puede presentar limitaciones en estilos musicales poco representados en el conjunto de entrenamiento.
- Riesgo de alucinación: aunque no es un modelo de texto puro, puede generar contenido musical que no se corresponda exactamente con la descripción del prompt, especialmente en idiomas o estilos poco comunes.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario asegurarse de que los datos de entrenamiento cumplen con las normativas locales de propiedad intelectual.
- No se proporcionan detalles sobre la longitud de contexto del LM, lo que puede limitar la generación de composiciones muy largas o con instrucciones complejas.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/Makaveliai/acestep-v15-base-sft
- Página del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Colección de modelos en Hugging Face: https://huggingface.co/collections/ACE-Step/ace-step-15
- ModelScope: https://modelscope.cn/models/ACE-Step/ACE-Step-v1-5
- Demo en Space: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Discord: https://discord.gg/PeWDxrkdj7
- Tech Report (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio GitHub (mencionado en la cita): https://github.com/ace-step/ACE-Step-1.5
