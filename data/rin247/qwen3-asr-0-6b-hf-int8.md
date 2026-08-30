# Rin247/Qwen3-ASR-0.6B-hf-INT8

## Resumen

El modelo `Qwen3-ASR-0.6B-hf-INT8` es una cuantización INT8 weight-only del modelo de reconocimiento de voz Qwen3-ASR-0.6B, publicada por el usuario Rin247 en Hugging Face. Esta versión reduce el tamaño de los pesos a 8 bits mediante cuantización RTN (round-to-nearest) realizada en CPU, manteniendo las escalas de cuantización junto a los pesos en formato safetensors. El objetivo es facilitar el despliegue en entornos con recursos limitados, como GPUs de gama baja o inferencia en CPU, sin necesidad de cargar los pesos en precisión completa.

El modelo base, desarrollado por Alibaba Qwen, forma parte de la familia Qwen3-ASR, que combina identificación de idioma y transcripción automática de voz para 52 idiomas y dialectos, apoyándose en la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni. La versión cuantizada conserva la arquitectura original, aunque la precisión puede verse ligeramente afectada por la reducción de bits. Es relevante para desarrolladores que buscan una solución ASR compacta y eficiente, especialmente en aplicaciones de borde o con restricciones de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-Omni) |
| Parametros totales | 782.426.112 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 weight-only (RTN) |
| Idiomas soportados | no disponible (el modelo base soporta 52 idiomas y dialectos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con escalas y shapes adicionales) |

## Arquitectura y entrenamiento

La cuantización se aplica sobre el modelo Qwen3-ASR-0.6B, que emplea una arquitectura transformer con capacidades de audio basadas en Qwen3-Omni. El proceso de cuantización INT8 weight-only se realizó con PyTorch RTN en CPU, almacenando las escalas y formas de los tensores en buffers adicionales (`*.weight_scale`, `*.weight_shape`). No se han publicado detalles sobre el entrenamiento del modelo base en la información de la cuantización, pero se sabe que la familia Qwen3-ASR se entrenó con grandes volúmenes de datos de habla y aprovecha la comprensión auditiva del modelo fundacional. La cuantización no modifica la arquitectura, solo reduce la precisión de los pesos para optimizar memoria y velocidad de inferencia.

## Capacidades

- Reconocimiento automático de voz (ASR) en 52 idiomas y dialectos, según la documentación del modelo base.
- Identificación de idioma a partir de audio.
- Procesamiento de audio robusto en condiciones desafiantes: habla limpia, voz cantada y canciones.
- Inferencia eficiente gracias a la cuantización INT8, adecuada para entornos con recursos limitados.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso; es un modelo especializado en audio.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede convertir audio multilingüe a texto en tiempo real, útil para herramientas de productividad y accesibilidad.
- Subtitulado automático de vídeos: al soportar múltiples idiomas, permite generar subtítulos para contenido audiovisual sin intervención manual.
- Asistentes de voz en dispositivos de bajo consumo: la versión INT8 reduce la huella de memoria, permitiendo ejecución en Raspberry Pi o teléfonos móviles.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones para búsqueda de palabras clave, análisis de sentimiento o cumplimiento normativo.
- Identificación de idioma en sistemas de enrutamiento: detectar el idioma del hablante para dirigir la llamada al agente o servicio adecuado.
- Archivo y búsqueda de audio: indexar grabaciones de audio mediante transcripción para permitir búsquedas por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La cuantización no incluye métricas de rendimiento, y el modelo base tampoco presenta datos comparativos en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: los pesos INT8 de 782M parámetros ocupan aproximadamente 0,8 GB, más overhead de activaciones y buffers, por lo que se estima un consumo de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050 o superiores. También puede ejecutarse en CPU con suficiente RAM.
- Compatible con GPUs consumer de gama baja y media.
- Opciones de despliegue: al ser safetensors con cuantización personalizada, requiere un motor de inferencia que soporte la des-cuantización con las escalas proporcionadas. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR en la información proporcionada. El modelo base Qwen3-ASR-0.6B compite con alternativas como Whisper small o Whisper base, pero no se han publicado comparaciones directas en esta cuantización.

## Limitaciones y advertencias

- La cuantización INT8 puede provocar una ligera degradación en la precisión de transcripción respecto al modelo en FP16 o FP32.
- No se especifica la licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- El formato de pesos requiere un pipeline de des-cuantización personalizado; no es compatible directamente con frameworks estándar sin adaptación.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto en la documentación de la cuantización.
- El modelo base está orientado a audio; no soporta otras modalidades como visión o texto.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/Rin247/Qwen3-ASR-0.6B-hf-INT8
- Modelo base Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe técnico de Qwen3-ASR: https://arxiv.org/html/2601.21337v1
