# mradermacher/TinyLlama-3MPER0RR-obliterated-GGUF

## Resumen

TinyLlama-3MPER0RR-obliterated-GGUF es una cuantización en formato GGUF del modelo TinyLlama-3MPER0RR-obliterated, creada por mradermacher. El modelo base es una variante de TinyLlama, un transformer decoder-only de 1.100 millones de parámetros entrenado originalmente sobre 3 billones de tokens, al que se ha aplicado una técnica de "abliteration" (eliminación de capas o pesos) para reducir restricciones de seguridad y alineación. Esta versión cuantizada permite ejecutar el modelo en entornos con recursos limitados, como CPU o GPUs de gama baja, manteniendo un tamaño de archivo reducido (desde 0,5 GB en Q2_K hasta 2,3 GB en f16). La licencia MIT facilita su uso comercial y de investigación, aunque solo está disponible en inglés.

La relevancia de este modelo radica en su tamaño compacto y su naturaleza "obliterated", que lo hace atractivo para desarrolladores que buscan un modelo de lenguaje pequeño, rápido y sin filtros de contenido, ideal para prototipos y aplicaciones edge. Sin embargo, la información pública sobre el proceso de entrenamiento del modelo base es escasa, y no se han publicado benchmarks ni especificaciones detalladas de contexto o capacidades más allá de las heredadas de TinyLlama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en TinyLlama) |
| Parametros totales | 1.100.048.384 (1,1 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base TinyLlama-3MPER0RR-obliterated es una modificación de TinyLlama, un transformer decoder-only de 1,1 B parámetros con arquitectura similar a Llama 2. El proyecto TinyLlama original se preentrenó sobre 3 billones de tokens, pero no se dispone de información sobre el dataset o el proceso de entrenamiento específico de la versión "obliterated". El término "obliterated" sugiere que se aplicó una técnica de ablación (abliteration) para eliminar capas o pesos relacionados con la alineación de seguridad, lo que puede alterar el comportamiento del modelo. La cuantización realizada por mradermacher es estática, es decir, no utiliza matrices de importancia (imatrix) ni pesos ponderados, según se indica en la model card. No hay datos sobre el número de tokens de entrenamiento, composición del dataset o uso de RLHF/DPO en esta variante.

## Capacidades

No se ha documentado de forma explícita un listado de capacidades para este modelo. Al ser una variante de TinyLlama, se espera que pueda realizar tareas básicas de generación de texto, completado y conversación, pero no hay confirmación oficial. Las etiquetas de HuggingFace indican "conversational", lo que sugiere su uso en diálogos. No se mencionan capacidades avanzadas como tool calling, razonamiento multi-paso, visión o audio. La ausencia de filtros de seguridad (por la ablación) podría permitir una generación más libre, pero también conlleva riesgos.

## Casos de uso

- Ejecución en dispositivos edge: gracias a su tamaño reducido (por ejemplo, 0,8 GB en Q4_K_M) y formato GGUF, puede desplegarse en Raspberry Pi, móviles o sistemas embebidos para generación de texto local sin conexión.
- Prototipado rápido de chatbots: al ser un modelo pequeño y con licencia MIT, es adecuado para crear asistentes conversacionales básicos en entornos de desarrollo o pruebas de concepto.
- Clasificación y análisis de texto: puede utilizarse para tareas de clasificación de sentimiento, extracción de entidades o resumen en aplicaciones donde no se requiera alta precisión.
- Generación de código simple: aunque no está documentado, por su naturaleza de modelo de lenguaje, podría emplearse para autocompletar fragmentos de código en entornos con pocos recursos.
- Asistente de escritura: para sugerencias de texto o reescritura en aplicaciones de productividad, aprovechando su velocidad de inferencia en CPU.
- Educación e investigación: como modelo de referencia para estudiar los efectos de la ablación en modelos pequeños, o para experimentos de fine-tuning con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para las cuantizaciones más pequeñas (Q2_K, 0,5 GB) se necesita menos de 1 GB de memoria; para Q4_K_M (0,8 GB) alrededor de 1 GB; para f16 (2,3 GB) se requieren al menos 3 GB de RAM/VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2050) puede ejecutar las cuantizaciones Q4 y superiores. Para f16 se recomienda una GPU con 4 GB o más.
- Compatibilidad con CPU: el formato GGUF permite ejecución en CPU mediante llama.cpp, con un consumo de RAM proporcional al tamaño del archivo.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier runtime compatible con GGUF (por ejemplo, LM Studio, KoboldCpp).
- Latencia y throughput: no se dispone de datos medidos; en CPU, un modelo de 1,1 B en Q4 puede generar decenas de tokens por segundo en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada. El modelo más cercano es TinyLlama original (1,1 B, contexto 2048, licencia MIT), pero no se han publicado comparaciones de rendimiento. Otros modelos pequeños como Phi-2 (2,7 B) o Qwen-1.5B podrían ser alternativas, pero no hay datos de este modelo frente a ellos. Se recomienda consultar benchmarks independientes antes de elegir.

## Limitaciones y advertencias

- Al ser una versión "obliterated", es probable que carezca de filtros de seguridad y alineación, lo que puede generar contenido ofensivo, sesgado o inapropiado. No es apto para aplicaciones donde se requiera moderación de contenido.
- El modelo solo está entrenado en inglés, por lo que su rendimiento en otros idiomas es limitado o nulo.
- Al ser un modelo de 1,1 B, tiene una capacidad limitada para razonamiento complejo, matemáticas avanzadas o generación de código extenso; puede producir alucinaciones o respuestas incoherentes.
- No se ha especificado la longitud de contexto; si hereda la de TinyLlama (2048 tokens), las conversaciones largas o documentos extensos pueden truncarse.
- La cuantización estática (sin imatrix) puede degradar la calidad en comparación con cuantizaciones ponderadas, especialmente en los niveles más bajos (Q2_K, Q3_K).
- No hay información sobre el proceso de entrenamiento del modelo base, por lo que se desconocen posibles sesgos en los datos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mradermacher/TinyLlama-3MPER0RR-obliterated-GGUF)
- [Modelo base (3MPER0RR/TinyLlama-3MPER0RR-obliterated)](https://huggingface.co/3MPER0RR/TinyLlama-3MPER0RR-obliterated)
- [Repositorio del proyecto TinyLlama](https://github.com/jzhang38/TinyLlama)
- [Otros modelos cuantizados de mradermacher](https://huggingface.co/mradermacher)
