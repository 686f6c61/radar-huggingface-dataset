# Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit

## Resumen

Outlier Vision 35B-A3B (MLX 4-bit) es una conversión cuantizada a 4 bits del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por Outlier-Ai para su ejecución local sobre Apple Silicon mediante el framework MLX. Se trata de un artefacto de conversión: los pesos subyacentes provienen del modelo base de Qwen y heredan su licencia Apache 2.0. El modelo combina una arquitectura Mixture-of-Experts con una torre de visión, lo que le permite procesar entradas de imagen y texto y generar respuestas conversacionales, razonamiento y llamadas a herramientas.

El interés principal reside en su perfil de eficiencia: 35.107.181.936 parámetros totales con aproximadamente 3.600 millones activos por token, lo que reduce el coste computacional por paso de decodificación pese al tamaño del repositorio (20,4 GB en formato MLX 4-bit). Esto lo sitúa en el rango de equipos de sobremesa y portátiles de Apple con memoria unificada suficiente, sin necesidad de GPU dedicadas ni de conectividad a la nube.

La ficha se centra en el artefacto tal como está publicado: cuantización MLX de 4 bits, pipeline `image-text-to-text`, soporte declarado de 13 idiomas y capacidades de razonamiento con modo thinking y uso de herramientas. El autor declara explícitamente que el modelo está orientado al análisis de imagen y texto, no a la generación de código, para lo cual remite a otras variantes de su lineup.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration con torre de visión (MoE multimodal) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | ~3.6B por token (según model card) |
| Longitud de contexto | 256K tokens (según la ficha de la familia Outlier-Vision; no verificado para este artefacto) |
| Tipos de cuantización | 4-bit (MLX 4bit); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

El artefacto es una conversión a MLX 4-bit del modelo Qwen/Qwen3.6-35B-A3B, cuya arquitectura es un transformer con mezcla de expertos (MoE) y una torre de visión para el procesamiento de imágenes. La model card de la familia Outlier-Vision menciona además un codificador de audio y soporte de vídeo en la arquitectura base, aunque la información disponible para este artefacto concreto no detalla si esas modalidades están operativas tras la cuantización. El pipeline declarado en Hugging Face es `image-text-to-text`, y las etiquetas incluyen `visual-question-answering`, `image-to-text` y `multimodal`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF, DPO u otras) del modelo base. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura MoE y del proceso de cuantización a 4 bits para MLX. El repositorio es un artefacto de conversión: el autor no declara entrenamiento adicional ni fine-tuning propio, por lo que las capacidades y limitaciones deben atribuirse al modelo base Qwen3.6-35B-A3B.

## Capacidades

- Generación de texto conversacional multi-turno en 13 idiomas declarados (inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita y tailandés).
- Comprensión de imágenes y respuesta a preguntas visuales (VQA): descripción de imágenes, extracción de información y razonamiento sobre contenido visual.
- Razonamiento con modo thinking, según las etiquetas `reasoning` y `thinking` del repositorio.
- Uso de herramientas y function calling (`tool-use`, `function-calling`), lo que habilita integraciones con APIs externas.
- Ejecución local sin conexión (`offline`, `no-cloud`, `on-device`, `private-ai`), orientada a privacidad de datos.
- Optimización para Apple Silicon (M1, M2, M3, M4) mediante Metal y MLX.
- No está orientado a generación de código: la model card remite explícitamente a las variantes Core o Code para flujos de trabajo de programación.

## Casos de uso

- Análisis de documentos escaneados y capturas de pantalla: el modelo recibe la imagen y responde preguntas sobre su contenido, adecuado para extracción de datos en local sin enviar documentos sensibles a la nube.
- Asistencia en escritorio con privacidad: integrado en la app Outlier para macOS, permite conversaciones multi-turno con imágenes adjuntas manteniendo los datos en el equipo, gracias a la ejecución on-device sobre Metal.
- Accesibilidad visual: descripción de imágenes y lectura de contenido gráfico para usuarios con discapacidad visual, con latencia baja al ejecutarse en memoria unificada del Mac.
- Soporte técnico con capturas de error: el usuario adjunta una captura de pantalla de un fallo y el modelo razona sobre ella en modo thinking y propone pasos de resolución, apoyándose en el contexto de 256K de la familia para conversaciones largas.
- Automatización de flujos con tool calling: el modelo puede invocar funciones externas (consultas a bases de datos, APIs) dentro de agentes locales, útil en entornos donde no se permite salida a Internet.
- Clasificación y moderación de contenido visual: análisis por lotes de imágenes con etiquetado y descripción en varios idiomas, aprovechando el soporte multilingüe declarado para equipos internacionales.
- Prototipado de asistentes multimodales en investigación: evaluación de modelos MoE cuantizados en hardware de consumo Apple sin infraestructura de GPU, con la ventaja de un repositorio de 20,4 GB que cabe en discos de portátiles estándar.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Métrica | Valor | Contexto |
|---|---|---|---|
| MMLU (5-shot, n=14042) | accuracy | 0,8352 | Text generation |
| HumanEval (split test) | pass@1 | 0,6098 | Declarado bajo la tarea image-text-to-text |

No se han publicado en la información disponible resultados de benchmarks adicionales (GSM8K, MMMU, DocVQA u otros) ni comparaciones directas con modelos alternativos. El autor remite a outlier.host/benchmarks para cifras de velocidad de inferencia en Mac con procedencia detallada, pero esos datos no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 20,4 GB en 4-bit; se recomienda al menos 24 GB de memoria unificada para cargar el modelo con margen para el contexto y la torre de visión. En equipos de 16 GB la carga es ajustada y puede requerir contextos reducidos.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 en sus variantes Pro, Max y Ultra). No hay soporte declarado para CUDA ni ROCm en este artefacto.
- Cabe en GPU de consumo: sí, en Mac con memoria unificada suficiente (MacBook Pro, Mac Studio, Mac mini con 24 GB o más). No está pensado para GPUs de consumo NVIDIA en este formato.
- Opciones de despliegue: MLX (`mlx-lm` y `mlx_vlm`), y la aplicación Outlier para macOS mediante `brew install --cask outlier-host/tap/outlier`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. El autor remite a su página de benchmarks para cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma |
|---|---|---|---|---|
| Outlier Vision 35B-A3B (MLX 4-bit) | 35,1B totales / ~3,6B activos | 256K (familia) | Apache 2.0 | MLX 4-bit, Apple Silicon |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B totales / ~3,6B activos | no disponible en la información | Apache 2.0 | safetensors originales, multiplataforma |
| Outlier Core 27B (MLX 4-bit) | 27B | no disponible | Apache 2.0 | MLX 4-bit, Apple Silicon |
| Outlier Quick 26B-A4B MoE (MLX 4-bit) | 26B totales / ~4B activos | no disponible | Apache 2.0 | MLX 4-bit, Apple Silicon |

La comparación más directa es con el modelo base Qwen3.6-35B-A3B, del que este artefacto es una conversión cuantizada: comparten arquitectura y capacidades, pero difieren en formato, plataforma de ejecución y huella de memoria. Frente a Outlier Core 27B y Quick 26B-A4B, la variante Vision es la única del lineup con torre de visión declarada en la información disponible, a costa de un mayor tamaño de repositorio.

## Limitaciones y advertencias

- Es un artefacto de conversión, no un modelo entrenado por Outlier-Ai: los sesgos y limitaciones son los del modelo base Qwen3.6-35B-A3B y no se documentan por separado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en descripciones de imágenes ambiguas o de baja resolución; no se han publicado tasas de error específicas.
- La cuantización a 4 bits puede degradar la precisión respecto a los pesos originales en tareas de razonamiento visual y matemáticas; no se aportan mediciones del delta de calidad.
- El contexto de 256K procede de la ficha de la familia Outlier-Vision y no está verificado para este artefacto cuantizado; el contexto efectivo puede ser menor en función de la memoria disponible.
- Soporte limitado a Apple Silicon y al ecosistema MLX: no hay rutas de despliegue documentadas para CUDA, vLLM, llama.cpp u Ollama.
- La model card desaconseja su uso para generación de código y remite a otras variantes del lineup.
- Licencia Apache 2.0 permisiva para uso comercial, pero sujeta a los términos del modelo base; conviene revisar la licencia de Qwen/Qwen3.6-35B-A3B antes de un despliegue en producción.
- Los benchmarks declarados están marcados como no verificados (`verified: false`) y uno de ellos (HumanEval) aparece etiquetado bajo la tarea image-text-to-text, lo que conviene interpretar con cautela.
- El repositorio tiene un volumen de descargas muy bajo (24) y cero likes en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ficha de la familia Outlier-Vision: https://huggingface.co/Outlier-Ai/Outlier-Vision
- Aplicación Outlier: https://outlier.host/
- Benchmarks del autor: https://outlier.host/benchmarks
- Captura del selector de tiers: https://outlier.host/screenshots/tier-picker.png
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier Quick 26B-A4B MoE: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Code 27B: https://huggingface.co/Outlier-Ai/Outlier-Code-27B-MLX-4bit
