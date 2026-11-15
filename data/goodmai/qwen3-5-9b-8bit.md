# goodmai/Qwen3.5-9B-8bit

## Resumen

Qwen3.5-9B-8bit es una conversión al formato MLX de cuantización de 8 bits del modelo Qwen3.5-9B, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio lo publica el usuario goodmai como espejo del origen `mlx-community/Qwen3.5-9B-8bit`, derivado a su vez de `Qwen/Qwen3.5-9B-Base`. Está pensado para ejecutarse en Apple Silicon mediante la librería `mlx-vlm`, lo que permite inferencia local sin Python en el ecosistema del proyecto Basalt.

El modelo pertenece a la familia Qwen3.5, con arquitectura transformer multimodal de tipo image-text-to-text: acepta imágenes y texto como entrada y genera texto. Cuenta con 9.409.813.744 parámetros totales (aproximadamente 9,4 mil millones) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. El repositorio ocupa 10,4 GB en safetensors.

Su relevancia radica en ofrecer una vía práctica para desplegar un modelo multimodal de casi 10B parámetros en equipos Mac con chip Apple Silicon, gracias a la cuantización de 8 bits y al backend MLX. Es una opción interesante para desarrolladores que trabajan en local y necesitan capacidades de visión-lenguaje sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un transformer multimodal de la familia Qwen3.5, con pipeline `image-text-to-text`, lo que implica un codificador visual acoplado a un modelo de lenguaje para procesar entradas conjuntas de imagen y texto. El repositorio es una conversión de cuantización a 8 bits realizada con `mlx-vlm` versión 0.3.12 a partir de `Qwen/Qwen3.5-9B`.

No se han publicado en la información proporcionada detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas específicas de atención o decodificación más allá de lo que implica el pipeline multimodal.

## Capacidades

- Generación de texto conversacional a partir de entradas de imagen y texto.
- Comprensión de imágenes (image-text-to-text): descripción, respuesta a preguntas sobre imágenes y tareas derivadas.
- Ejecución local en Apple Silicon mediante MLX y `mlx-vlm`.
- Integración con el ecosistema Basalt (servidor REST y CLI en macOS).
- Compatibilidad declarada con `transformers` y con endpoints.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en local: usar `mlx_vlm.generate` con una ruta de imagen para generar descripciones, útil en flujos de catalogación o accesibilidad sin enviar datos a la nube.
- Asistente conversacional multimodal en macOS: desplegar con `basalt serve --model goodmai/Qwen3.5-9B-8bit --rest` para exponer un endpoint REST que acepte imágenes y texto en aplicaciones de escritorio.
- Prototipado de aplicaciones de visión-lenguaje: emplear el modelo como base para experimentar con VQA (visual question answering) en un equipo Mac antes de escalar a producción.
- Procesamiento de documentos escaneados o capturas: extraer información textual a partir de imágenes en pipelines locales de digitalización.
- Herramientas de accesibilidad: generar descripciones de contenido visual para usuarios con discapacidad visual en entornos de escritorio.
- Evaluación comparativa de cuantizaciones: usar esta versión de 8 bits frente al modelo original para medir el impacto de la cuantización en calidad y velocidad en hardware Apple Silicon.
- Integración en flujos de desarrollo sin Python: aprovechar el CLI de Basalt para incorporar el modelo en scripts y automatizaciones en macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 10,4 GB en safetensors; en la práctica se requiere memoria unificada suficiente para cargar los pesos de 8 bits más el estado de activación, por lo que se recomienda al menos 16 GB de memoria unificada y preferiblemente 24-32 GB para contexto amplio.
- Hardware objetivo: Apple Silicon (macOS 27+ según el proyecto Basalt); no se indica soporte para GPU NVIDIA en esta conversión MLX.
- Cabe en equipos consumer Apple Silicon con memoria suficiente (por ejemplo, chips de la familia M con 16 GB o más), aunque el margen depende del contexto y del codificador visual.
- Opciones de despliegue: `mlx-vlm` (Python) y Basalt (servidor REST y CLI, sin Python).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| goodmai/Qwen3.5-9B-8bit | 9.409.813.744 | no disponible | Apache 2.0 | safetensors (MLX, 8 bits) | Conversión MLX para Apple Silicon |
| Qwen/Qwen3.5-9B-Base | no disponible | no disponible | Apache 2.0 | no disponible | Modelo base original |
| Qwen/Qwen3.5-9B | no disponible | no disponible | Apache 2.0 | no disponible | Modelo original referenciado en la model card |
| mlx-community/Qwen3.5-9B-8bit | no disponible | no disponible | no disponible | no disponible | Origen upstream de esta conversión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de cuantización a 8 bits: puede presentar degradación de calidad respecto al modelo original sin cuantizar, especialmente en tareas de razonamiento fino o generación de código.
- El repositorio no documenta sesgos conocidos; al derivar de un modelo base de gran escala, es probable que herede sesgos presentes en sus datos de entrenamiento, aunque no se detallan.
- Riesgo de alucinación inherente a los modelos generativos; no se aportan métricas de fiabilidad.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas sin evaluación previa.
- Longitud de contexto no documentada: limita la planificación de casos de uso con entradas largas.
- El modelo está orientado a Apple Silicon y al backend MLX; no es directamente desplegable en GPU NVIDIA o TPU sin reconversión.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo original enlazada en la model card para confirmar condiciones de uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/Qwen3.5-9B-8bit
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Origen upstream MLX: https://huggingface.co/mlx-community/Qwen3.5-9B-8bit
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Proyecto Basalt (GitHub): https://github.com/goodmai/basalt
- Demo Basalt (Hugging Face Space): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.5-9B-8bit&role=chat
