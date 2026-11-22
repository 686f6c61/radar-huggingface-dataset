# ben0112/bge-m3-coreai-m5max

## Resumen

`ben0112/bge-m3-coreai-m5max` es una conversión *ahead-of-time* (AOT) del modelo de embeddings `BAAI/bge-m3` para ejecutarse sobre la Neural Engine del chip Apple M5 Max (identificador `h17c`) mediante el runtime Core AI de Apple. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de BGE-M3 se han reconvertido con un layout específico para Neural Engine (BC1S/Conv2d) en FP16 y se han compilado en formato `.aimodelc` para macOS 27 o superior.

El modelo base, BGE-M3, es un encoder multilingüe de la familia XLM-R orientado a generación de embeddings densos de 1024 dimensiones, con soporte para recuperación multilingüe, multi-funcional (denso, disperso y multi-vector) y con contexto largo. Esta conversión conserva la dimensionalidad de salida (1024d) y ofrece tres variantes segmentadas por longitud de secuencia: 128, 256 y 512 tokens.

Su relevancia es acotada pero específica: permite ejecutar inferencia de embeddings íntegramente en la Neural Engine de un Mac con M5 Max, sin GPU discreta ni servicios en la nube, lo que resulta útil para pipelines de búsqueda semántica o RAG locales con requisitos de privacidad. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no incluye información sobre evaluación ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-R), convertido a layout BC1S/Conv2d para Neural Engine |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens según el asset (`s128`, `s256`, `s512`) |
| Tipos de cuantización | FP16 (indicado en la procedencia de la conversión) |
| Idiomas soportados | no disponible en la model card (el modelo base BGE-M3 es multilingüe) |
| Licencia | MIT |
| Formato de pesos | `.aimodelc` (Core AI AOT), empaquetado en `.zip` |
| Dimensión de embedding | 1024 |
| Hardware objetivo | Apple M5 Max (`h17c`) exclusivamente |
| Sistema operativo | macOS 27+ |
| Runtime | Core AI (Apple), unidad de cómputo preferida: Neural Engine |
| Modelo base | BAAI/bge-m3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del encoder XLM-R de BGE-M3, un transformer bidireccional que produce representaciones densas de 1024 dimensiones. La conversión realizada por el autor aplica un layout personalizado denominado BC1S/Conv2d orientado a la Neural Engine, empleando la herramienta `coreai-torch` para la conversión y `coreai-build` para la compilación AOT dirigida al identificador de chip `h17c`. Los pesos se almacenan en FP16.

No se redistribuyen los pesos originales ni se documenta el proceso de entrenamiento en esta model card: no hay información sobre número de tokens, composición del dataset, ni sobre etapas de RLHF o DPO. Tampoco se detalla si la conversión introduce pérdida de precisión medible respecto al modelo original en FP32. La innovación técnica reseñable es exclusivamente de despliegue: la compilación AOT ligada a una arquitectura concreta de chip, lo que elimina el coste de compilación en tiempo de ejecución a cambio de perder portabilidad.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para texto.
- Recuperación semántica y búsqueda por similitud vectorial.
- Procesamiento de secuencias de hasta 128, 256 o 512 tokens según la variante descargada.
- Ejecución en la Neural Engine de Apple Silicon M5 Max mediante Core AI.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta modo de razonamiento (*thinking*), ni capacidades de visión o audio.
- Las capacidades multilingües del modelo base no se confirman explícitamente en esta conversión; la model card no las detalla.

## Casos de uso

- Búsqueda semántica local en macOS: indexar un corpus documental propio y calcular embeddings en la Neural Engine sin enviar datos a servicios externos, aprovechando la variante `s512` para pasajes largos.
- RAG con privacidad estricta: construir un pipeline de recuperación aumentada sobre documentos sensibles (expedientes, contratos, historiales) donde el cómputo de embeddings debe permanecer en el dispositivo.
- Deduplicación y agrupamiento de textos: calcular representaciones de registros y aplicar clustering o similitud coseno para detectar duplicados en bases de datos internas.
- Clasificación de textos por similitud: usar los embeddings como features de entrada para clasificadores ligeros en tareas de enrutamiento o etiquetado.
- Filtrado previo en motores de búsqueda híbridos: emplear la variante `s128` como primera etapa de recuperación de baja latencia sobre consultas cortas.
- Prototipado en investigación sobre Apple Silicon: evaluar el rendimiento de la Neural Engine en cargas de embeddings sin depender de CUDA ni de GPUs dedicadas.
- Aplicaciones de escritorio nativas en Swift: integrar el modelo mediante `AIModel(contentsOf:options:)` en apps macOS que requieran búsqueda semántica embebida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (nDCG, Recall@k), latencia ni throughput, ni comparaciones con el modelo original en FP32.

## Requisitos de hardware

- Hardware obligatorio: Apple M5 Max (identificador `h17c`). La compilación AOT está ligada a la arquitectura, por lo que no funciona en otros chips Apple Silicon ni en GPUs NVIDIA o AMD.
- Sistema operativo: macOS 27 o superior.
- Runtime: Core AI de Apple, con `preferredComputeUnitKind: .neuralEngine`.
- VRAM: no disponible; el modelo se ejecuta en la Neural Engine con memoria unificada del SoC, pero no se publican cifras de consumo.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas.
- Despliegue: exclusivamente mediante la app CoreAI Runner (`github.com/ben0112/coreai-runner`) o integración directa con la API de Core AI en Swift. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Plataforma |
|---|---|---|---|---|---|
| ben0112/bge-m3-coreai-m5max | no disponible | 128/256/512 | 1024 | MIT | Apple M5 Max (Core AI) |
| BAAI/bge-m3 (original) | no disponible | hasta 8192 | 1024 | MIT | GPU/CPU genérica (PyTorch, etc.) |
| BAAI/bge-large-en-v1.5 | no disponible | 512 | 1024 | MIT | GPU/CPU genérica |
| intfloat/multilingual-e5-large | no disponible | 512 | 1024 | MIT | GPU/CPU genérica |

La diferencia principal frente al BGE-M3 original es la ventana de contexto: esta conversión limita a 512 tokens como máximo, mientras que el modelo original admite hasta 8192. Como contrapartida, ofrece ejecución nativa en Neural Engine. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Portabilidad nula: los assets `.aimodelc` están compilados para `h17c` (M5 Max) y no funcionan en otros chips ni sistemas operativos.
- Contexto reducido: la variante máxima cubre 512 tokens, frente a los 8192 del BGE-M3 original; los documentos largos requerirán troceado.
- Sin datos de evaluación: no hay métricas que confirmen que la conversión a FP16 y el layout BC1S/Conv2d preservan la calidad del modelo original.
- Riesgo de degradación por cuantización: la conversión a FP16 puede introducir diferencias numéricas respecto al original en FP32, no documentadas.
- Idiomas no verificados: aunque el modelo base es multilingüe, esta conversión no declara idiomas soportados ni evalúa su comportamiento por idioma.
- Madurez: repositorio con cero descargas y cero likes, creado y actualizado el mismo día, sin historial de uso ni mantenimiento.
- Licencia MIT para los pesos (copyright BAAI), lo que permite uso comercial, pero sin garantías del autor de la conversión.
- No apto para generación de texto, razonamiento, código ni tareas agénticas: es exclusivamente un modelo de embeddings.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ben0112/bge-m3-coreai-m5max
- Modelo base: https://huggingface.co/BAAI/bge-m3
- App de ejecución (CoreAI Runner): https://github.com/ben0112/coreai-runner
