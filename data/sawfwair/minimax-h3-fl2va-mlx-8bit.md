# Sawfwair/MiniMax-H3-FL2VA-MLX-8bit

## Resumen

MiniMax-H3-FL2VA-MLX-8bit es una adaptación en MLX (Apple Silicon) del modelo MiniMax-H3 FL2VA, un sistema de generación de vídeo con audio sincronizado a partir de texto. Esta versión de 8 bits ha sido desarrollada por Sawfwair (Mere) como un artefacto de ejecución compacto para el runtime mere.run, partiendo directamente del checkpoint oficial de MiniMaxAI/MiniMax-H3 sin intermediarios de conversión de terceros.

El modelo combina un núcleo de denoising activo de 20.11 mil millones de parámetros con un acondicionador Qwen3-VL, un VAE de vídeo en FP16 y un VAE de audio en FP32. La cuantización INT8 con grupo de 64 se aplica a las capas lineales elegibles, lo que reduce significativamente los requisitos de almacenamiento y memoria frente al checkpoint original.

La relevancia de este modelo radica en que permite ejecutar generación de vídeo con audio en hardware Apple Silicon, un segmento donde las opciones de modelos abiertos de esta categoría son limitadas. Sin embargo, la licencia comunitaria MiniMax H3 restringe su uso en Estados Unidos, la Unión Europea, el Reino Unido y la República de Corea, lo que condiciona su adopción en entornos comerciales de estas regiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-vídeo con acondicionador Qwen3-VL |
| Parámetros totales | 20.11B (núcleo de denoising activo); total con acondicionador y VAEs no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8/group-64 (MLX affine), FP16 (VAE de vídeo), FP32 (VAE de audio) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (excluye uso en EE. UU., UE, Reino Unido y Corea del Sur) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

MiniMax-H3 FL2VA es un modelo de difusión para generación de vídeo con audio sincronizado. El núcleo de denoising activo cuenta con 20.11 mil millones de parámetros y utiliza un acondicionador Qwen3-VL para interpretar las instrucciones textuales. El VAE de vídeo opera en FP16 mientras que el VAE de audio se mantiene en FP32.

Esta versión MLX de 8 bits aplica cuantización affine INT8 con grupo de 64 a las capas lineales elegibles tanto del núcleo de denoising como del acondicionador Qwen3-VL. Se omiten las proyecciones AdaLN de solo programación, el MLP de timestep y los tensores RoPE reconstruidos, sustituyéndolos por tablas de puntos precalculadas (5, 9, 12, 16, 21 y 31 puntos) para los desplazamientos de vídeo/audio 12/3 y la tabla LightX2V de 5 puntos 6/3. El artefacto incluye manifiestos de origen (SOURCE_MANIFEST.json), registros de conversión y sumas SHA256 para verificar la procedencia de los pesos.

Los datos de entrenamiento y el proceso de entrenamiento del modelo original no están disponibles en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto con audio sincronizado.
- Generación de vídeo con audio integrado (etiqueta audio-video).
- Acondicionamiento multimodal mediante Qwen3-VL para interpretar instrucciones textuales.
- Ejecución optimizada para hardware Apple Silicon mediante MLX.
- Cuantización INT8 que reduce el uso de memoria frente al checkpoint original.
- Compatible con el runtime mere.run para despliegue local.

## Casos de uso

- Creación de contenido audiovisual para redes sociales: el modelo permite generar clips de vídeo con audio a partir de descripciones textuales, lo que facilita la producción rápida de contenido para plataformas como TikTok, Instagram o YouTube Shorts sin necesidad de equipos de grabación.
- Prototipado de storyboards animados: los cineastas y creadores pueden generar secuencias de vídeo aproximadas con audio para visualizar escenas antes de la producción final, reduciendo costes en las fases iniciales de desarrollo.
- Generación de material educativo: creación de vídeos explicativos con narración o efectos de audio a partir de guiones textuales, útil para plataformas de e-learning y documentación técnica.
- Desarrollo de assets para videojuegos: generación de cinemáticas cortas o secuencias ambientales con sonido para integrar en prototipos de juegos, acelerando el ciclo de iteración de diseño.
- Investigación en generación de vídeo: el modelo sirve como base para experimentos académicos sobre generación de vídeo con audio, especialmente en entornos con hardware Apple Silicon donde las alternativas son escasas.
- Evaluación de técnicas de cuantización: la versión de 8 bits permite estudiar el impacto de la cuantización INT8 en la calidad de generación de vídeo frente al checkpoint original, aportando datos útiles para la optimización de despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se realiza ninguna afirmación de velocidad sin mediciones en hardware equivalente.

## Requisitos de hardware

- Dispositivos Apple Silicon con soporte MLX (M1, M2, M3, M4 y posteriores).
- Tamaño del repositorio: 58.1 GB, por lo que se recomienda un disco con al menos 70-80 GB libres.
- Memoria unificada estimada: no disponible, pero dado el tamaño del modelo en 8 bits y los componentes en FP16/FP32, se estima que se necesitan al menos 32-48 GB de RAM unificada para una ejecución cómoda.
- Despliegue previsto a través del runtime mere.run con el identificador video-minimax-h3-fl2va-8bit-mlx.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Cuantización | Tamaño del repo | Plataforma | Licencia |
|---|---|---|---|---|
| MiniMax-H3-FL2VA-MLX-8bit (este) | INT8/group-64 | 58.1 GB | MLX (Apple Silicon) | MiniMax H3 Community |
| MiniMax-H3-FL2VA-MLX-4bit | INT4 | No disponible | MLX (Apple Silicon) | MiniMax H3 Community |
| MiniMaxAI/MiniMax-H3 (original) | FP32/FP16 | No disponible | Multiplataforma | MiniMax H3 Community |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de información sobre modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community excluye el uso, distribución y exhibición en Estados Unidos, la Unión Europea, el Reino Unido y la República de Corea. Es imprescindible revisar la licencia completa antes de descargar o utilizar el artefacto.
- No se realizan afirmaciones de rendimiento o velocidad sin mediciones en hardware equivalente.
- El modelo está diseñado específicamente para el runtime mere.run; su uso fuera de este entorno puede requerir adaptaciones no documentadas.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de idioma en la información proporcionada.
- El tamaño del repositorio (58.1 GB) implica requisitos de almacenamiento significativos.
- Al ser una versión cuantizada, puede haber una degradación de calidad en la generación de vídeo frente al checkpoint original en FP16/FP32.

## Enlaces

- Repositorio HuggingFace (8-bit): https://huggingface.co/Sawfwair/MiniMax-H3-FL2VA-MLX-8bit
- Repositorio HuggingFace (4-bit): https://huggingface.co/Sawfwair/MiniMax-H3-FL2VA-MLX-4bit
- Modelo original en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio GitHub de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
