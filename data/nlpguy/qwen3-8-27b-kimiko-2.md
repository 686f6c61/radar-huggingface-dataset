# nlpguy/Qwen3.8-27B-Kimiko-2

## Resumen

El modelo `nlpguy/Qwen3.8-27B-Kimiko-2` es un merge de cuatro modelos de la familia Qwen3.8-27B, creado por el usuario nlpguy mediante la herramienta mergekit y el método matemático de la media de Karcher. Combina el modelo base multimodal `Qwen/Qwen3.8-27B` (desarrollado por Alibaba Qwen) con tres variantes derivadas: `TeichAI/Qwen3.8-27B-Fable-Distill`, `beyoru/Kiwen1.1-27B` y `nlpguy/Qwen3.8-27B-Fimi-4`. El resultado es un modelo denso de 27.356 millones de parámetros con capacidades de visión y lenguaje, orientado a tareas de codificación, razonamiento y automatización de oficina, heredadas del modelo original.

Este merge se publica en agosto de 2026, en un contexto donde la comunidad explora la fusión de pesos para obtener mejoras sin entrenamiento adicional. Su relevancia radica en que permite evaluar si la combinación de distintos refinamientos de Qwen3.8-27B produce un comportamiento superior al modelo base, aunque no se aportan métricas de evaluación en la documentación disponible. Al ser un modelo experimental, su uso en producción requiere verificación previa de rendimiento y licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense multimodal, visión-lenguaje) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un merge creado con mergekit, sin entrenamiento adicional. La configuración YAML indica que se mezclan las capas de los cuatro modelos base de forma proporcional: las capas del modelo `nlpguy/Qwen3.8-27B-Fimi-4` se combinan con las de `beyoru/Kiwen1.1-27B`, `Qwen/Qwen3.8-27B` y `TeichAI/Qwen3.8-27B-Fable-Distill` mediante el promedio de Karcher, que es una generalización de la media geométrica para matrices. La mezcla abarca tanto las capas del transformer de lenguaje como las del bloque visual (`model.visual.blocks`), lo que indica que se conserva la arquitectura multimodal completa. No se aplican técnicas como RLHF o DPO en el proceso de merge; se trata de una fusión de pesos preentrenados.

Al estar basado en Qwen3.8-27B, hereda la arquitectura del modelo original: un transformer denso con módulos de atención y visión, diseñado para procesar entradas de imagen y texto. No se dispone de detalles adicionales sobre el número de capas, tamaño de los embeddings o configuración de atención, ya que la información del merge no los especifica.

## Capacidades

- Generación de texto y comprensión de lenguaje natural, incluyendo razonamiento, codificación y tareas de oficina, según las capacidades del modelo base Qwen3.8-27B.
- Procesamiento de imágenes (entrada visual) y comprensión de imágenes, al ser un modelo de tipo `image-text-to-text`.
- Capacidad de seguimiento de instrucciones y conversación multi-turno, gracias al chat template `qwen` incluido en la configuración del merge.
- Soporte potencial para tool calling y agentes, heredado del modelo base Qwen3.8-27B, aunque no se confirma explícitamente en el merge.
- No se documentan capacidades adicionales específicas del merge, como modos de pensamiento o características especiales.

## Casos de uso

- **Asistente de programación con entrada visual**: el modelo puede recibir capturas de pantalla de código o diagramas y generar explicaciones o sugerencias, gracias a su capacidad multimodal.
- **Automatización de oficina**: puede procesar imágenes de documentos, tablas o gráficos para extraer información y generar resúmenes o respuestas.
- **Chat conversacional**: como modelo de chat, puede usarse en aplicaciones de atención al cliente o asistentes virtuales con entrada de texto e imagen.
- **Investigación en fusión de modelos**: útil para evaluar la efectividad del método de Karcher sobre la familia Qwen3.8-27B, comparando con el modelo base.
- **Prototipado rápido**: al ser un merge sin entrenamiento adicional, se puede desplegar en entornos de prueba para verificar si la combinación mejora ciertas tareas antes de usar un modelo entrenado.
- **Generación de código asistida por imagen**: puede recibir una imagen de un problema o diagrama y generar código o explicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este merge concreto.

## Requisitos de hardware

- **VRAM estimada**: con 27.356 millones de parámetros en bfloat16, se necesitan al menos 55 GB de VRAM solo para los pesos, más memoria para activaciones. En la práctica, se requiere una GPU con 60-80 GB de VRAM, como A100 (80 GB) o H100 (80 GB).
- **GPU recomendadas**: A100 80GB, H100 80GB, o RTX 4090 (24GB) si se aplica cuantización (por ejemplo, 4-bit), aunque no se proporcionan cuantizaciones listas.
- **Despliegue**: se puede usar con vLLM, llama.cpp (si se generan GGUF), o TGI, pero no se ofrecen archivos GGUF o AWQ en el repositorio.
- **Latencia y throughput**: no disponibles; dependerá del hardware y de la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 27B | no disponible | Apache 2.0 (según Qwen) | Sí | Modelo base, referencia |
| nlpguy/Qwen3.8-27B-Kimiko-2 | 27,356M | no disponible | no disponible | Sí | Merge de 4 modelos |
| TeichAI/Qwen3.8-27B-Fable-Distill | 27B | no disponible | no disponible | Sí | Modelo base del merge |
| beyoru/Kiwen1.1-27B | 27B | no disponible | no disponible | Sí | Modelo base del merge |

No hay datos de rendimiento comparativo. El merge no ofrece ventajas documentadas sobre el modelo base.

## Limitaciones y advertencias

- **Licencia desconocida**: no se especifica la licencia del merge, lo que impide su uso comercial sin consultar al autor.
- **Sesgos y alucinaciones**: al ser un merge de modelos, puede heredar sesgos de los modelos originales y presentar alucinaciones, como cualquier modelo de lenguaje.
- **Falta de evaluación**: no hay benchmarks ni pruebas de calidad, por lo que su rendimiento real es incierto.
- **Limitaciones de contexto**: no se conoce la longitud de contexto soportada; probablemente sea la del modelo base (típicamente 32k), pero no confirmado.
- **Riesgo de sobreescritura**: el proceso de merge puede degradar capacidades específicas de los modelos originales, como el razonamiento matemático o la precisión visual.
- **No apto para producción sin validación**: debido a la falta de pruebas y licencia, no se recomienda su uso en entornos productivos sin un análisis exhaustivo.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/nlpguy/Qwen3.8-27B-Kimiko-2)
- [Modelo base Qwen3.8-27B en HuggingFace](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio GitHub de Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Modelo Fable-Distill](https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill)
- [Modelo Kiwen1.1-27B](https://huggingface.co/beyoru/Kiwen1.1-27B)
- [Modelo Fimi-4](https://huggingface.co/nlpguy/Qwen3.8-27B-Fimi-4)
- [Documentación de Qwen3.8-27B en QwenCloud](https://www.qwencloud.com/models/qwen3.8-27b)
- [Guía de despliegue en Jetson AI Lab](https://www.jetson-ai-lab.com/models/qwen3-8-27b/)
