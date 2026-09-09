# nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-qx64-hi-mlx

## Resumen

El modelo `nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-qx64-hi-mlx` es un desarrollo experimental de `nightmedia`, creado mediante técnicas de fusión y destilación sobre varios modelos base, entre ellos `Qwen/Qwen-AgentWorld-35B-A3B`, `AllSpark-Research/Iris-mini`, `thomsonreuters/Thomson-1.0-Small` y otros modelos de la serie Qwen3.6. Está orientado a razonamiento con cadena de pensamiento larga (long-cot), instrucciones, conversación y procesamiento multimodal imagen-texto.

Su arquitectura, según la nomenclatura del nombre, corresponde a un modelo Mixture of Experts (MoE) con 35.000 millones de parámetros totales y 3.000 millones de parámetros activos. El repositorio indica soporte para los idiomas inglés, chino, japonés y español, y está publicado bajo licencia Apache 2.0. Al tratarse de un modelo de investigación, no se incluyen benchmarks públicos ni documentación detallada de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferido de la nomenclatura 35B-A3B) |
| Parametros totales | 35B (según nomenclatura del modelo) |
| Parametros activos | 3B (según nomenclatura del modelo) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8, MXFP4 (según etiquetas del repositorio) |
| Idiomas soportados | Inglés, chino, japonés y español |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (según etiquetas y sufijo del modelo) |

## Arquitectura y entrenamiento

El modelo se construye mediante fusión y destilación sobre varios modelos base, incluyendo `AllSpark-Research/Iris-mini`, `thomsonreuters/Thomson-1.0-Small`, `nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1`, `nightmedia/Qwen3.6-35B-A3B-FSM`, `Qwen/Qwen-AgentWorld-35B-A3B`, `nex-agi/Nex-N2.5-mini` y `Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated`. Las etiquetas del repositorio indican un ajuste fino por SFT con LoRA, orientado a razonamiento de cadena de pensamiento larga, así como integración con el framework MLX.

No se proporcionan datos sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni la composición del corpus. Tampoco hay evidencia de técnicas de alineación como RLHF o DPO en la información disponible.

## Capacidades

- Razonamiento con cadena de pensamiento larga (long-cot).
- Generación de texto instruido y conversacional.
- Multilingüe en inglés, chino, japonés y español.
- Procesamiento de tareas matemáticas, STEM y programación.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Modelo experimental orientado a investigación, con soporte para técnicas de fusión y destilación.

## Casos de uso

- Asistente de investigación para análisis de documentos multilingües: puede resumir y comparar artículos técnicos en inglés, chino, japonés y español gracias a su soporte multilingüe y razonamiento de cadena de pensamiento larga.
- Generación de código en entornos de prototipado: su etiqueta de coding permite utilizarlo para sugerir implementaciones en Python u otros lenguajes en tareas de STEM.
- Análisis de imágenes con explicación textual: al ser un modelo imagen-texto, puede describir imágenes y responder preguntas sobre su contenido en contextos académicos.
- Tutoría en matemáticas y ciencias: el modo de razonamiento largo permite resolver problemas paso a paso, lo que resulta útil para material educativo.
- Experimentos de fusión y destilación de modelos: sirve como referencia para evaluar técnicas de merge en modelos grandes dentro de un entorno de investigación.
- Chat multilingüe para soporte técnico experimental: puede mantener conversaciones en varios idiomas, aunque no hay evidencia de soporte de tool calling en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 35B parámetros totales y cuantización MXFP4, el checkpoint podría ocupar en torno a 18 GB. Es una estimación basada en la cuantización indicada por etiquetas.
- GPU recomendadas: no disponible.
- Compatibilidad con consumer GPU: posiblemente en cuantización MXFP4 o inferior, aunque se necesita verificar el tamaño exacto del checkpoint.
- Opciones de despliegue: el formato MLX sugiere compatibilidad con el framework MLX (Apple Silicon). Otras plataformas no se especifican en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental y de investigación; no está recomendado para producción sin evaluaciones adicionales.
- Acceso restringido en HuggingFace (gated); requiere aceptar las condiciones del repositorio antes de su descarga.
- Riesgo de alucinación inherente a los modelos generativos de lenguaje.
- No hay benchmarks públicos que validen su rendimiento en tareas concretas.
- Longitud de contexto no especificada.
- Los sesgos del modelo no se han documentado.

## Enlaces

- Repositorio en HuggingFace: [nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-qx64-hi-mlx](https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-qx64-hi-mlx)
