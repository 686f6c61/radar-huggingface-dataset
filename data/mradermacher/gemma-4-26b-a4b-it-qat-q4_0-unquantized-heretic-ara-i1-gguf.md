# mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara-i1-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo `gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara`, creada por el usuario de HuggingFace `mradermacher` mediante la herramienta `imatrix` y con pesos ponderados. El modelo base es una variante de Gemma 4 de Google, con arquitectura Mixture of Experts (MoE) de 26 mil millones de parámetros totales de los cuales se activan 4 mil millones por token. La etiqueta `heretic-ara` sugiere un ajuste fino de la comunidad orientado a árabe, aunque no se aportan detalles en la model card.

La cuantización Q4_0 reduce el peso del modelo a unos 14 GB, lo que lo hace viable en GPUs de consumo con 16 GB de VRAM. El repositorio ofrece múltiples quants (Q2_K, Q3_K, Q4_K, etc.) para adaptarse a distintos presupuestos de memoria. Es un modelo conversacional compatible con los ecosistemas de llama.cpp, Ollama y vLLM, pensado para inferencia local.

La relevancia de este modelo radica en su eficiencia: al ser MoE con solo 4B activos, ofrece un rendimiento por token comparable a modelos densos mucho más grandes, pero con una huella de memoria y cómputo reducida. Su licencia no está especificada en la información proporcionada, lo que limita su uso comercial hasta conocer los términos exactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (MoE, transformer) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | 4B (4 activos de 26) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, IQ2_S, IQ1_S, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (el sufijo `ara` sugiere árabe, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors original, cuantizado a GGUF) |

## Arquitectura y entrenamiento

El modelo base es una variante de Gemma 4 de Google con arquitectura MoE: 26B parámetros totales, 4B activos por token. El prefijo `qat` indica que fue entrenado con cuantización consciente (quantization-aware training), lo que mejora la robustez de los pesos a la cuantización posterior. El sufijo `heretic-ara` apunta a un fine-tuning de la comunidad (posiblemente para árabe o con un dataset multilingüe), pero no se han publicado detalles sobre los datos de entrenamiento ni el proceso de ajuste.

La cuantización Q4_0 de este repositorio se generó con la herramienta `imatrix` (importance matrix) de llama.cpp, que optimiza la distribución de los pesos para minimizar la pérdida de calidad. El repositorio incluye un amplio abanico de quants, desde Q2_K (muy agresivo, para CPU) hasta Q4_K_M (equilibrado) y Q4_1 (con mayor rango dinámico). No se han publicado datos sobre el número de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional: modelo optimizado para diálogo (`it` en el nombre indica instruction tuning).
- Razonamiento y comprensión de lenguaje natural gracias a su arquitectura MoE con 4B activos.
- Soporte multilingüe probable (Gemma 4 es multilingüe, y el sufijo `ara` sugiere árabe), aunque no hay confirmación oficial en la model card.
- Compatible con tool calling y agentes: no confirmado explícitamente, pero los modelos Gemma 4 it suelen incluir soporte para function calling.
- Despliegue local: el formato GGUF permite ejecución en CPU y GPU con llama.cpp, Ollama o vLLM.
- Cuantización flexible: se ofrecen múltiples niveles de cuantización para adaptarse a distintos hardware.

## Casos de uso

- **Asistente conversacional local**: con 4B activos y cuantización Q4_0, el modelo puede ejecutarse en una RTX 4060 (8 GB VRAM) o incluso en CPU con quants más agresivos (Q2_K), ideal para chatbots privados sin conexión a la nube.
- **Generación de código en entornos offline**: si el fine-tune `heretic-ara` mantiene las capacidades de código de Gemma, puede usarse con herramientas como Continue o Tabby para autocompletar código en el IDE, con baja latencia en GPU de consumo.
- **Traducción y procesamiento de texto en árabe**: el sufijo `ara` sugiere un ajuste para árabe; puede emplearse para traducción automática, resumen de documentos o análisis de sentimiento en esa lengua.
- **RAG (generación aumentada por recuperación)**: con una ventana de contexto larga (aunque no especificada), se puede integrar en pipelines de RAG para responder preguntas sobre documentos técnicos o jurídicos.
- **Prototipado rápido de agentes**: al ser un modelo pequeño (4B activos) y compatible con tool calling, sirve para probar arquitecturas de agentes multi-paso sin el coste de un modelo grande.
- **Educación y experimentación**: por su licencia abierta (si se confirma) y su eficiencia, es útil para aprender sobre MoE y cuantización, o para experimentar en entornos académicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otros. El rendimiento real dependerá de la cuantización elegida y del hardware; la cuantización Q4_0 suele degradar la precisión en menos de un 2% frente al modelo no cuantizado, pero esto es una estimación genérica y no un dato del modelo.

## Requisitos de hardware

- **VRAM estimada**: con Q4_0, el modelo pesa ~14 GB (25,2B parámetros × 0,5 bytes/parámetro + overhead). Con Q2_K, ~8 GB. Con Q4_K_M, ~15 GB.
- **GPU recomendadas**: RTX 4090 (24 GB) para Q4_K_M con holgura; RTX 4060 Ti 16 GB para Q4_0; RTX 3060 12 GB para Q3_K_M; GPU de 8 GB (RTX 4060) con Q2_K.
- **CPU**: los quants Q2_K y IQ2 pueden ejecutarse en CPU con 16-32 GB de RAM (a ~5-10 tokens/s en procesadores modernos).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, vLLM (con conversión a safetensors), TGI.
- **Latencia y throughput**: no disponible. En una RTX 4090, un MoE de 4B activos con cuantización Q4_0 debería generar entre 40-80 tokens/s, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente. A nivel de arquitectura y tamaño, se puede comparar con:

| Modelo | Params | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (este) | 25,2B | 4B | no disponible | no disponible | GGUF |
| Gemma 3 27B (denso) | 27B | 27B | 128K | Gemma Terms of Use | safetensors, GGUF |
| Qwen 2.5 32B (denso) | 32,5B | 32,5B | 128K | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B (denso) | 8B | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF |

La ventaja de este modelo frente a los densos es su menor memoria y mayor velocidad de inferencia, pero se desconoce su rendimiento real en tareas específicas. La licencia no disponible es un factor de riesgo para producción.

## Limitaciones y advertencias

- **Licencia no disponible**: el repositorio no indica la licencia del modelo base ni del fine-tune. Esto impide el uso comercial sin verificar los términos de la licencia original de Gemma (que en su versión 3 es de uso libre con restricciones de atribución). Usar este modelo en producción requiere contactar con el autor del modelo base (`mewse`).
- **Riesgo de alucinación**: como cualquier LLM, puede generar contenido falso o no verificado, especialmente en idiomas poco representados como el árabe.
- **Sesgos**: el fine-tune `heretic-ara` puede introducir sesgos específicos del dominio o de la comunidad que lo creó; no hay evaluación de sesgo publicada.
- **Contexto desconocido**: no se especifica la longitud de contexto. Si es menor de 128K, puede limitar su uso en tareas de RAG con documentos largos.
- **Cuántización**: la cuantización Q4_0 degrada la precisión en tareas de matemáticas o razonamiento complejo; los quants más agresivos (Q2_K) aumentan el riesgo de errores.
- **Sin soporte oficial**: es un modelo de la comunidad, sin garantías de mantenimiento ni correcciones de seguridad.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ara
- Herramienta de cuantización (llama.cpp): https://github.com/ggml-org/llama.cpp (no confirmado, pero es la herramienta estándar para GGUF)
