# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF

## Resumen
El modelo es una versión "uncensored" del Qwen3.6-35B-A3B, desarrollada por HauhauCS y posteriormente modificada por LuffyTheFox mediante el algoritmo Genesis. Se trata de un modelo MoE (Mixture of Experts) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que lo hace eficiente para inferencia en hardware de consumo. El repositorio contiene pesos en formato GGUF, listos para usar con llama.cpp o LM Studio. Incluye capacidades multimodales (image-text-to-text), por lo que puede procesar imágenes además de texto. La característica principal es que aplica el proceso Genesis, un algoritmo de reparación de tensores post-entrenamiento que reduce el ruido en los pesos sin necesidad de reentrenar, con el objetivo de mejorar la estabilidad y reducir las alucinaciones. El modelo se presenta como libre de rechazos (0/465 refusals), lo que significa que no filtra contenidos, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con componentes ssm_conv1d; arquitectura base no documentada |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3.000.000.000 (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye APEX Compact, NVFP4 recomendada) |
| Idiomas soportados | inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo parte de la base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, un modelo Qwen3.6 de 35B con arquitectura MoE. El autor no publica detalles del entrenamiento original (tokens, composición del dataset, RLHF/DPO). La novedad técnica es el algoritmo Genesis, aplicado sobre los pesos ya entrenados. Según la descripción, Genesis opera en tres etapas: repara el balance de los tensores ssm_conv1d (que gestionan la memoria de contexto largo), reemplaza bloques de ceros corruptos por los mejores bloques de la distribución de pesos, y reduce el ruido de entrenamiento mediante una descomposición SVD basada en la ley Marchenko-Pastur, preservando el 99% de la señal y el gradiente aprendido. Este proceso no es un fine-tuning ni un reentrenamiento: actúa directamente sobre los bytes de los tensores en formato GGUF, lo que lo hace independiente de la arquitectura. El resultado declarado es una menor inestabilidad, menos verborrea y una mayor consistencia en la generación.

## Capacidades
- Generación de texto y razonamiento como modelo de lenguaje conversacional.
- Multimodalidad: pipeline image-text-to-text, capaz de procesar entradas de imagen y texto.
- Modo de pensamiento (thinking mode) habilitable, con parámetros recomendados específicos para tareas de programación y tareas creativas.
- Soporte multilingüe, especialmente inglés y chino, con capacidad general multilingüe.
- Ausencia de rechazos (0/465 refusals): el modelo no aplica filtros de contenido, lo que permite respuestas sin censura.
- Compatibilidad con cuantizaciones GGUF para ejecución en hardware de consumo (probado en RTX 3060 12GB con APEX Compact).

## Casos de uso
- Asistente de programación local: gracias al modo de pensamiento y a los parámetros recomendados (temperatura 0.6, top_k 20, seed 42), puede utilizarse en tareas de escritura de código, depuración o generación de scripts en un entorno offline.
- Generación de contenido visual creativo: el modelo es multimodal y puede describir o generar imágenes (por ejemplo, SVG de un pelícano en bicicleta) a partir de prompts complejos, con posibilidad de iterar refinando detalles.
- Análisis de imágenes en entornos sin conexión: al ser image-text-to-text, puede emplearse para clasificar o describir imágenes en aplicaciones donde la privacidad impide usar APIs en la nube.
- Roleplay o narrativa interactiva sin restricciones: al no tener filtros de contenido, es adecuado para juegos de rol o ficción donde se requiera libertad total en la generación de diálogos.
- Traducción y tareas multilingües: con soporte para inglés, chino y otros idiomas, puede integrarse en pipelines de traducción local, aprovechando el bajo coste de inferencia al ser un MoE con solo 3B de parámetros activos.
- Investigación en post-entrenamiento y reparación de ruido: el algoritmo Genesis está documentado en la model card, por lo que el modelo puede servir como caso de estudio para comparar la calidad de los pesos antes y después del proceso.
- Despliegue en portátiles o equipos con GPU de consumo: las cuantizaciones GGUF y el diseño MoE permiten ejecutar el modelo en tarjetas como RTX 3060 12GB (reportado por el autor) o RTX 5060 8GB (según reportes no oficiales).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. En una discusión asociada se mencionan resultados de HermesBench y velocidades de más de 40 tokens/s en un portátil con RTX 5060 8GB y Ryzen 9, pero no hay datos verificables ni comparaciones oficiales con otros modelos. Por tanto, no se pueden presentar cifras de rendimiento fiables.

## Requisitos de hardware
- VRAM estimada: no disponible. El autor reporta pruebas con la cuantización APEX Compact en una RTX 3060 12GB, lo que sugiere que el modelo puede ejecutarse en GPU de consumo con offload parcial de capas a CPU.
- GPU recomendadas: según las pruebas del autor, RTX 3060 12GB es suficiente con APEX Compact. Para un mejor rendimiento, se recomienda una GPU con mayor VRAM, como RTX 4090, A100 o H100, aunque no se especifican requisitos oficiales.
- Configuración sugerida: activar el offload de GPU al máximo, forzar 40 capas MoE a CPU y fijar 8 expertos activos, como indica la model card.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier otro entorno compatible con formato GGUF. El autor recomienda LM Studio.
- Latencia y throughput: no disponibles. Los datos de 40+ tk/s mencionados en una discusión no son oficiales.

## Comparativa con modelos similares
No se han proporcionado comparativas oficiales en la información disponible. Por tamaño y arquitectura, el modelo se sitúa en la categoría de MoE con 35B de parámetros totales y 3B activos, similar a otros modelos MoE de la familia Qwen, pero no hay datos verificables para comparar rendimiento, contexto o licencia con alternativas concretas. Se indica "no disponible".

## Limitaciones y advertencias
- Sesgos y contenidos dañinos: al ser un modelo "uncensored" con 0/465 rechazos, no filtra contenido, lo que puede generar respuestas inapropiadas, peligrosas o ilegales. Debe usarse con responsabilidad.
- Riesgo de alucinación: aunque el proceso Genesis pretende reducir la inestabilidad, no hay evaluaciones formales que garanticen una reducción de alucinaciones. El modelo no ha sido validado por una organización independiente.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen (Alibaba) y la modificación Genesis no altera esa licencia. Es necesario revisar los términos de uso del modelo original para asegurar el cumplimiento.
- Caveat para producción: el autor es un desarrollador individual, no una empresa; el modelo no ha pasado por pruebas de seguridad ni evaluaciones de alineación. No es recomendable para aplicaciones críticas sin una evaluación previa exhaustiva.
- Compatibilidad de cuantizaciones: la model card menciona una cuantización NVFP4 recomendada, pero el repositorio actual es GGUF y puede requerir configuraciones específicas (como el número de expertos activos) para obtener un rendimiento óptimo.

## Enlaces
- HuggingFace del modelo: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Cuantización NVFP4 recomendada: https://huggingface.co/jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-NVFP4-GGUF
- Script de cuantización: https://pastebin.com/hXhcMJn9
- Chat template recomendado: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja
- Discusión sobre configuración en LM Studio: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF/discussions/12
- Discord: https://discord.gg/SZ5vacTXYf
- Donaciones: https://web.tribute.tg/d/KIH
