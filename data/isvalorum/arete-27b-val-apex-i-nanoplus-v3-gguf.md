# IsValorum/Arete-27B-VAL-APEX-I-NanoPlus-V3-GGUF

## Resumen

Arete-27B VAL-APEX-I NanoPlus V3 es una cuantización GGUF del modelo denso NousResearch/Arete-27B, publicada por IsValorum dentro de su serie APEX. El modelo base emplea una arquitectura Qwen3.5 híbrida (`Qwen3_5ForConditionalGeneration`) que combina 48 capas de atención lineal Gated DeltaNet con 16 capas de atención completa, sumando 64 capas y 26.895.998.464 parámetros totales (aproximadamente 27.000 millones). El checkpoint incluye además un proyector de visión, aunque el GGUF publicado es autocontenido solo para el modelo de lenguaje.

La relevancia de esta ficha radica en que se trata de una cuantización quirúrgica: no aplica una precisión uniforme, sino que asigna tipos distintos (F32, Q8_0, Q5_K, Q4_K, Q3_K, IQ4_XS, IQ3_XXS) a grupos de tensores según su sensibilidad. Los parámetros recurrentes del SSM y las normalizaciones se mantienen en F32, mientras que las proyecciones FFN se comprimen hasta IQ3_XXS. El resultado es un archivo de 12,70 GB (11,83 GiB) pensado para GPUs de 16 GB.

La licencia es Apache 2.0 y el modelo declara soporte para once idiomas (inglés, español, francés, alemán, italiano, portugués, chino, japonés, coreano, árabe y ruso). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 6 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 dense hybrid (`Qwen3_5ForConditionalGeneration`): 64 capas, 48 de atención lineal Gated DeltaNet y 16 de atención completa; 851 tensores |
| Parámetros totales | 26.895.998.464 (aproximadamente 27B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mezcla quirúrgica por tensor: F32, Q8_0, Q5_K, Q4_K, Q4_0, Q3_K, IQ4_XS, IQ3_XXS (variante NanoPlus, 12,70 GB / 11,83 GiB) |
| Idiomas soportados | en, es, fr, de, it, pt, zh, ja, ko, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con `imatrix` procedente de bartowski, 496 entradas de bloque y 583 chunks) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Qwen3.5: 64 capas en total, de las cuales 48 son capas de atención lineal Gated DeltaNet (un mecanismo de espacio de estado con compuertas) y 16 son capas de atención completa. Esta combinación busca reducir el coste computacional y de memoria en contextos largos manteniendo la capacidad de recuperación exacta de la atención completa en un subconjunto de capas. El checkpoint contiene 851 tensores y no incluye bloque MTP (multi-token prediction).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. Lo que sí documenta el autor es el proceso de cuantización: se reutiliza sin modificar la importance matrix de Arete-27B publicada por bartowski, se mantienen en F32 los factores de decaimiento recurrente, las convoluciones 1D y las RMSNorm (209 tensores de normalización y 192 de escalas SSM), y se aplica una frontera especial en la capa 0 donde `attn_gate`, `attn_qkv`, `ssm_beta` y `ssm_out` usan Q4_0 mientras las otras 47 capas SSM usan la precisión del tier. La cabeza de salida (`output.weight`) se mantiene en Q5_K y las proyecciones FFN en IQ3_XXS (gate y up) e IQ4_XS (down).

## Capacidades

- Generación de texto conversacional en once idiomas, con etiqueta `conversational` en el repositorio.
- Razonamiento y matemáticas: herencia del modelo base Qwen3.5, aunque no se publican benchmarks específicos en la información disponible.
- Generación de código: capacidad esperable del modelo base, sin datos verificados en esta ficha.
- Visión: el checkpoint original incluye proyector de visión, pero el repositorio GGUF no incluye el `mmproj` companion, por lo que la capacidad multimodal no está disponible en este artefacto.
- Tool calling y function calling: no documentado explícitamente en la model card; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Modo thinking: no documentado en la información proporcionada.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.

## Casos de uso

- Despliegue en GPU de 16 GB: el archivo de 12,70 GB permite cargar el modelo completo en tarjetas como RTX 4080, RTX 4060 Ti de 16 GB o RTX 5070 Ti, dejando margen para el contexto KV y el runtime.
- Asistente conversacional multi-turno en local: la combinación de atención lineal y completa está diseñada para sostener contextos largos; se usaría con llama.cpp u Ollama para un chatbot de escritorio sin conexión.
- Generación de texto en español y otras lenguas europeas: el modelo declara soporte para es, fr, de, it y pt, lo que permite redactar borradores, resumir documentos o traducir en entornos con requisitos de soberanía de datos.
- Procesamiento por lotes en CPU o GPU modesta: al ser GGUF con cuantización mixta, puede ejecutarse con llama.cpp en CPU usando los tipos IQ3/IQ4 para las capas FFN, a costa de mayor latencia.
- Integración en pipelines de CI/CD para revisión de código: el formato GGUF es compatible con servidores de inferencia ligeros; se usaría como paso de generación de parches o explicaciones, no como corrector determinista.
- Experimentación académica con arquitecturas híbridas SSM/atención: al mantener los parámetros recurrentes en F32, el artefacto es adecuado para estudiar el comportamiento de Gated DeltaNet en contextos largos sin la distorsión de una cuantización uniforme agresiva.
- Evaluación comparativa de cuantizaciones: las tres variantes de la familia (MiniPlus 14,03 GB, NanoPlus 12,70 GB, MicroPlus 10,25 GB) permiten medir la degradación de calidad frente al footprint en el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otras cuantizaciones del mismo modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: 12,70 GB de pesos; con overhead de runtime y KV cache, se recomienda un mínimo de 14-15 GB para contexto corto y 16 GB para contexto medio.
- GPU recomendadas: RTX 4080 (16 GB), RTX 4060 Ti 16 GB, RTX 5070 Ti (16 GB), RTX 4090 (24 GB) con holgura, A100 40 GB y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 16 GB o más de VRAM; en tarjetas de 12 GB no cabe el archivo completo y requeriría offloading parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere integración con endpoints de inferencia estándar. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que su uso requeriría conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B VAL-APEX-I NanoPlus V3 (este) | 26,9B densos | No disponible | GGUF 12,70 GB | Apache 2.0 | Hugging Face, 0 descargas |
| Arete-27B VAL-APEX-I MiniPlus V3 | 26,9B densos (mismo base) | No disponible | GGUF 14,03 GB | Apache 2.0 | Hugging Face |
| Arete-27B VAL-APEX-I MicroPlus V3 | 26,9B densos (mismo base) | No disponible | GGUF 10,25 GB | Apache 2.0 | Hugging Face |
| NousResearch/Arete-27B (base) | 26,9B densos | No disponible | Safetensors (original) | No disponible en la información | Hugging Face |

Las tres variantes APEX comparten el mismo modelo base y la misma importance matrix; la diferencia es el footprint y la agresividad de la cuantización. La comparación con modelos de otras familias (por ejemplo, Qwen3 de 32B o Llama de 27-32B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye el `mmproj` companion, por lo que la capacidad de visión del checkpoint original no está disponible en este GGUF.
- La cuantización IQ3_XXS en las proyecciones FFN gate y up puede degradar tareas sensibles a la precisión numérica, como matemáticas de varios pasos o generación de código complejo; no hay benchmarks publicados que cuantifiquen esa pérdida.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- No se documentan sesgos conocidos, datos de entrenamiento ni procesos de alineación (RLHF/DPO) en la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no se publican tasas de alucinación ni evaluaciones de fidelidad.
- La longitud de contexto no está especificada en la model card; no debe asumirse un valor concreto sin verificar el modelo base.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base NousResearch/Arete-27B antes de un uso comercial, ya que la información disponible no detalla su licencia.
- El soporte de tool calling y de agentes multi-paso no está documentado; su uso en producción requeriría validación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Arete-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Variante MiniPlus: https://huggingface.co/IsValorum/Arete-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante MicroPlus: https://huggingface.co/IsValorum/Arete-27B-VAL-APEX-I-MicroPlus-V3-GGUF
- Colección VAL-APEX NanoPlus Standard (27B): https://huggingface.co/collections/IsValorum/val-apex-nanoplus-standard-27b
- Colección APEX-I NanoPlus Standard (MoE): https://huggingface.co/collections/IsValorum/apex-i-nanoplus-standard-moe
- Apoyo al autor: https://ko-fi.com/isvalorum
