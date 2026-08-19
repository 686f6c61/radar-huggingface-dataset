# OpenMOSS-Team/MOSS-VL-Base-0708

## Resumen

MOSS-VL-Base-0708 es un checkpoint base multimodal de la familia MOSS-VL, desarrollado por el equipo OpenMOSS. Se trata de un modelo de visión-lenguaje que combina comprensión de imagen, vídeo largo y entrada de texto en un pipeline unificado, con una arquitectura basada en atención cruzada (cross-attention) que desacopla el codificador visual del razonamiento lingüístico. El modelo cuenta con aproximadamente 11.300 millones de parámetros (11,3B) y una ventana de contexto de 256.000 tokens, lo que lo posiciona como una base sólida para tareas offline de comprensión multimodal.

Este checkpoint se construye únicamente mediante pretraining multimodal en cuatro etapas progresivas: alineación visión-lenguaje, pretraining multimodal a gran escala, pretraining de alta calidad y, finalmente, annealing con extensión de contexto largo. Al ser un modelo base, no está ajustado para seguir instrucciones, por lo que su uso principal es como punto de partida para fine-tuning supervisado, alineación con preferencias humanas (RLHF/DPO) o adaptación a dominios específicos. Su relevancia actual radica en ofrecer una alternativa abierta (licencia Apache 2.0) para investigación y desarrollo en comprensión de vídeo e imagen, con soporte nativo de resolución dinámica y entrada intercalada de imágenes y vídeos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención cruzada (cross-attention) visión-lenguaje, XRoPE |
| Parametros totales | 11.336.371.208 (11,3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

MOSS-VL-Base-0708 adopta una arquitectura de atención cruzada que separa el procesamiento visual del razonamiento lingüístico. Los tokens de texto se conectan con las representaciones visuales mediante capas de atención cruzada, lo que permite procesar imágenes, vídeos y texto en un único pipeline. El modelo incorpora dos innovaciones técnicas destacadas: los timestamps absolutos, que se inyectan junto a los fotogramas de vídeo para que el modelo aprenda orden de eventos, duración y localización temporal; y la Cross-attention Rotary Position Embedding (XRoPE), que mapea tokens de texto y parches visuales en un espacio tridimensional unificado definido por tiempo (t), altura (h) y anchura (w), proporcionando una representación posicional coherente para imagen y vídeo.

El entrenamiento se realizó en cuatro etapas progresivas de pretraining multimodal: alineación visión-lenguaje, pretraining multimodal a gran escala, pretraining multimodal de alta calidad y, finalmente, annealing con extensión de contexto largo. El modelo procesa imágenes y fotogramas de vídeo a su resolución y relación de aspecto originales (resolución dinámica nativa), con un tamaño de parche visual de 16 píxeles y un tamaño de parche temporal de 1. La configuración por defecto para vídeo es de 1,0 FPS con un máximo de 256 fotogramas. No se han publicado detalles sobre el volumen total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Comprensión de imagen: procesa imágenes individuales a resolución nativa, manteniendo la relación de aspecto original sin redimensionado forzado.
- Comprensión de vídeo: admite vídeos de larga duración con hasta 256 fotogramas por defecto, muestreados a 1,0 FPS, con timestamps absolutos para localización temporal.
- Entrada intercalada: soporta secuencias mixtas de imagen, vídeo y texto en un pipeline unificado, útil para documentos multimodales o conversaciones con múltiples referencias visuales.
- Contexto largo: ventana de 256.000 tokens, adecuada para vídeos extensos o documentos con muchas imágenes intercaladas.
- Resolución dinámica nativa: procesa cada imagen o fotograma a su resolución original, lo que preserva detalles finos como texto pequeño o elementos de baja escala.
- Representaciones base: al ser un checkpoint de pretraining, ofrece representaciones visuales-lenguaje generales aptas para fine-tuning posterior, pero no responde a instrucciones sin ajuste previo.

## Casos de uso

- Fine-tuning para respuesta visual de preguntas (VQA): el modelo base puede ajustarse con datasets etiquetados de preguntas sobre imágenes para crear un asistente especializado en dominios concretos como medicina, industria o documentación técnica.
- Adaptación a dominios con vídeo: empresas que necesiten analizar vídeos de vigilancia, inspección industrial o contenido generado por usuarios pueden fine-tunear el modelo para tareas específicas como detección de anomalías o resumen de eventos.
- Base para alineación con RLHF/DPO: al ser un checkpoint de pretraining, es adecuado como punto de partida para pipelines de alineación con preferencias humanas, obteniendo un modelo asistente con mejor comportamiento conversacional.
- Investigación en comprensión de vídeo largo: su contexto de 256K tokens y soporte de hasta 256 fotogramas lo convierten en una base útil para experimentar con tareas de razonamiento temporal, orden de eventos y localización de momentos.
- Pretraining continuado en dominios específicos: organizaciones con datos propios multimodales pueden continuar el pretraining del modelo para adaptarlo a vocabulario o estilos visuales particulares.
- Desarrollo de sistemas de documentación visual: el modelo puede ajustarse para generar descripciones de imágenes técnicas, diagramas o capturas de pantalla, aprovechando su resolución dinámica nativa para preservar detalles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las tablas de evaluación detalladas para la versión 0708 se mantendrán en los recursos del proyecto MOSS-VL, pero no se proporcionan cifras concretas en la documentación actual. No se incluyen datos de MMLU, HumanEval, GSM8K u otras pruebas estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 22,7 GB (11,3B parámetros × 2 bytes). Con overhead de activaciones, KV cache y memoria del runtime, se recomienda al menos 32 GB de VRAM para inferencia básica sin cuantización.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o GPUs con 40 GB o más de VRAM para ejecución en BF16 sin particionado. En GPUs de consumo como la RTX 4090 (24 GB) sería necesario cuantizar a 8 bits o menos, aunque no se han publicado pesos cuantizados oficialmente.
- Opciones de despliegue: el modelo se carga mediante transformers con `trust_remote_code=True` y soporta `attn_implementation="flash_attention_2"` para acelerar la atención. También se puede servir con frameworks compatibles con modelos de transformers, como vLLM, aunque no se ha confirmado oficialmente su soporte.
- Latencia y throughput: no se han publicado cifras oficiales. La inferencia con vídeo de hasta 256 fotogramas puede ser intensiva en cómputo; se recomienda procesar los fotogramas en lotes (el parámetro `vision_chunked_length` del código de ejemplo sugiere procesamiento por fragmentos de 64 parches visuales).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| MOSS-VL-Base-0708 | 11,3B | 256K | Apache 2.0 | Base multimodal (imagen + vídeo) |
| MOSS-VL-Base-0408 | 11B (estimado) | 256K (estimado) | Apache 2.0 | Base multimodal (versión anterior) |
| MOSS-VL-Instruct | 11B | 256K | Apache 2.0 | Instruido multimodal (misma familia) |
| MOSS-VL-Realtime | 11B | 256K | Apache 2.0 | Streaming en tiempo real (misma familia) |

No se dispone de datos de benchmarks públicos para comparar el rendimiento de este modelo con alternativas de otros equipos (como Qwen2-VL, InternVL o LLaVA). La comparativa se limita a los modelos de la misma familia MOSS-VL, donde la diferencia principal es el estado de entrenamiento: el checkpoint 0708 es la versión base más reciente, mientras que las variantes Instruct y Realtime ya han pasado por etapas de ajuste adicionales.

## Limitaciones y advertencias

- No es un modelo instruido: al ser un checkpoint de pretraining, no responde adecuadamente a instrucciones conversacionales sin un fine-tuning previo. Su uso directo como asistente producirá respuestas incoherentes o incompletas.
- Limitaciones en OCR y comprensión de documentos: la model card indica que la comprensión de texto en imágenes y documentos es un área de mejora continua, por lo que puede fallar en tareas de extracción de texto o lectura de documentos complejos.
- Dificultad con vídeos extremadamente largos: aunque soporta hasta 256 fotogramas, la comprensión de vídeos de muy larga duración o con eventos muy espaciados en el tiempo sigue siendo un reto no resuelto.
- Razonamiento matemático y de código limitado: el modelo base no ha sido optimizado para tareas de razonamiento simbólico o generación de código, por lo que su rendimiento en estas áreas será inferior al de modelos especializados.
- Idiomas limitados: solo soporta inglés y chino; no hay soporte declarado para otros idiomas, incluido el español.
- Riesgo de alucinación visual: al ser un modelo base sin alineación, puede generar descripciones inexactas de contenidos visuales, especialmente en escenarios ambiguos o con baja resolución.
- Requisitos de hardware elevados: la inferencia en BF16 requiere al menos 32 GB de VRAM, lo que limita su uso en entornos con GPUs de consumo sin cuantización adicional.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Base-0708
- GitHub (repositorio MOSS-VL): https://github.com/OpenMOSS/MOSS-VL
- ModelScope: https://www.modelscope.cn/models/openmoss/MOSS-VL-Base-0708
- Página del proyecto OpenMOSS: https://openmoss.ai/MOSS-VL/moss-vl.html
- Informe técnico (arXiv): https://arxiv.org/pdf/2608.15045
- Checkpoint anterior (MOSS-VL-Base-0408): https://huggingface.co/OpenMOSS-Team/MOSS-VL-Base-0408
