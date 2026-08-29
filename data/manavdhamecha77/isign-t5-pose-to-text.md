# manavdhamecha77/iSign-t5-pose-to-text

## Resumen

El modelo iSign-t5-pose-to-text, desarrollado por Manav Dhamecha, es un sistema de traducción automática de lengua de signos india (ISL) a texto en inglés. A diferencia de los enfoques basados en vídeo o imágenes, este modelo trabaja directamente sobre secuencias de keypoints de pose (landmarks corporales, manos y cara) extraídas de vídeos de signos, lo que reduce drásticamente la complejidad computacional y facilita su despliegue en entornos con recursos limitados. El sistema combina un codificador de pose ligero (un perceptrón multicapa) con un modelo T5 encoder-decoder, que genera la frase en lenguaje natural correspondiente a la secuencia de signos.

El repositorio contiene seis checkpoints entrenados que varían en tamaño (T5-small, T5-base y T5-large) y en el tipo de características de entrada: los modelos "espaciales" usan solo los keypoints de pose, mientras que los modelos "motion" añaden características de velocidad (diferencia entre frames consecutivos) para capturar mejor la dinámica temporal del signo. El entrenamiento se realizó sobre un subconjunto del dataset iSign, con 18.867 muestras (16.979 de entrenamiento y 1.887 de test). La licencia no está especificada, y el modelo está orientado a la investigación y al desarrollo de aplicaciones de accesibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder con pose encoder MLP |
| Parametros totales | no disponible (seis checkpoints: T5-small, T5-base, T5-large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrada: hasta 500 frames de pose; salida: hasta 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors y .pt) |
| Idiomas soportados | inglés (salida); entrada: pose de ISL |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo T5) y .pt (pose encoder) |

## Arquitectura y entrenamiento

El sistema sigue un pipeline de dos etapas. Primero, un codificador de pose (un MLP ligero) proyecta las características de keypoints normalizadas (z-score) al espacio de representación oculto del modelo T5 correspondiente. Las características de pose incluyen los landmarks del cuerpo, de ambas manos y de la cara, junto con sus valores de confianza cuando están disponibles. En los modelos "motion", se concatenan a cada frame las características de velocidad calculadas como la diferencia entre el frame actual y el anterior (el primer frame usa velocidad cero), lo que proporciona información temporal explícita.

La segunda etapa es un modelo T5 estándar (encoder-decoder) que recibe la secuencia proyectada y genera la traducción textual. El entrenamiento se realizó sobre el subconjunto del dataset iSign, con pares de secuencias de pose y anotaciones textuales en inglés. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado de forma clásica. La implementación de inferencia incluye generación con beam search (tamaño de haz 4) y una penalización de longitud de 2.0, con una longitud máxima de salida de 128 tokens.

## Capacidades

- Traducción de secuencias de pose de lengua de signos india a texto en inglés.
- Soporte de dos modalidades de entrada: solo keypoints espaciales o keypoints con características de movimiento (velocidad).
- Generación de texto con beam search y parámetros configurables (longitud máxima, tamaño de haz).
- Inferencia en CPU o GPU (CUDA) mediante el script proporcionado.
- Preprocesamiento de pose integrado mediante la librería `pose-format`.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo especializado en una única tarea de traducción.

## Casos de uso

- Accesibilidad para personas sordas: el modelo puede integrarse en aplicaciones que capturen vídeo de una persona signando, extraigan los keypoints de pose y generen subtítulos en inglés en tiempo real o diferido, facilitando la comunicación en entornos educativos, laborales o médicos.
- Subtitulado automático de vídeos en ISL: procesar vídeos existentes de contenido signado (conferencias, tutoriales) para generar transcripciones textuales, mejorando la indexación y búsqueda de contenido.
- Herramientas educativas para aprendizaje de ISL: los estudiantes pueden practicar signos y recibir retroalimentación textual sobre si su ejecución coincide con la frase esperada, usando el modelo como verificador.
- Investigación en lingüística de lenguas de signos: el modelo permite analizar automáticamente grandes corpus de pose y extraer anotaciones textuales, acelerando estudios sobre estructura gramatical y variación dialectal.
- Desarrollo de asistentes conversacionales bilingües: combinar el modelo con un sistema de síntesis de voz para crear un intérprete automático ISL-inglés en dispositivos móviles o quioscos de información.
- Generación de datos de entrenamiento para otros modelos: las traducciones generadas pueden usarse para crear pares (pose, texto) adicionales, enriqueciendo datasets para futuros sistemas de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como BLEU, ROUGE o precisión de traducción, ni comparaciones con otros sistemas de traducción de lengua de signos.

## Requisitos de hardware

- Los requisitos dependen del checkpoint elegido: T5-small (~60M parámetros) puede ejecutarse en CPU con memoria moderada; T5-base (~220M) y T5-large (~770M) requieren GPU para una inferencia razonable.
- VRAM estimada: no disponible en la documentación; para T5-large en FP32 se necesitan al menos 4-6 GB de VRAM, pero no se especifica oficialmente.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060) para T5-base; para T5-large se recomienda una GPU con 12-16 GB (RTX 3080, RTX 4080, A10).
- El script de inferencia soporta selección de dispositivo (`--device cuda` o `--device cpu`).
- Opciones de despliegue: el script de inferencia es la vía principal; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de transformers, podría adaptarse a Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros sistemas de traducción de pose a texto para ISL con los que comparar directamente en términos de rendimiento o arquitectura.

## Limitaciones y advertencias

- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- El modelo se entrenó únicamente con un subconjunto del dataset iSign (18.867 muestras), lo que puede limitar su generalización a variantes regionales de ISL o a signos fuera del vocabulario del dataset.
- La calidad de la traducción depende críticamente de la precisión de la estimación de pose; errores en la detección de landmarks (p. ej., manos ocluidas) degradarán la salida.
- No se han publicado evaluaciones de sesgos ni de robustez ante ruido en las secuencias de pose.
- El modelo solo genera texto en inglés; no soporta otras lenguas de salida.
- La longitud máxima de entrada (500 frames) puede ser insuficiente para frases largas o discursos continuos.
- No se proporcionan métricas de rendimiento, por lo que es difícil evaluar su calidad objetiva antes de probarlo.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere que es un proyecto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manavdhamecha77/iSign-t5-pose-to-text
- Repositorio GitHub Sign-Lang-Trans: https://github.com/manavdhamecha77/Sign-Lang-Trans
- Repositorio GitHub WSL_SLT: https://github.com/manavdhamecha77/WSL_SLT
- Perfil del autor en Hugging Face: https://huggingface.co/manavdhamecha77/models
- Documentación de T5 en Hugging Face: https://huggingface.co/docs/transformers/model_doc/t5
