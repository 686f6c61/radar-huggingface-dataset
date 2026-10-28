# mradermacher/qwen3.5-9b-sob-json-GGUF

## Resumen

`mradermacher/qwen3.5-9b-sob-json-GGUF` es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo `abderahmenn/qwen3.5-9b-sob-json`, un ajuste fino (SFT con LoRA fusionada) orientado a salida estructurada, JSON e información extraída. El modelo base parte de la familia Qwen3.5 y cuenta con 8.953.803.264 parámetros (~8,95 mil millones), lo que lo sitúa en la franja de 9B, manejable en hardware de consumo con cuantizaciones de 4 bits.

El interés práctico del repositorio no está en el modelo en sí, sino en la colección de cuantizaciones estáticas publicadas (de Q2_K a f16) con tamaños de archivo declarados, lo que permite desplegar el modelo en llama.cpp, Ollama o LM Studio sin tener que convertir los pesos originales en safetensors. El modelo está pensado para tareas de extracción de información y generación de JSON válido, según los tags del autor (`structured-output`, `json`, `information-extraction`, `sft`, `merged-lora`).

Se trata de un artefacto con muy poca tracción (0 descargas y 0 likes en el momento de la consulta, publicado el 28 de octubre de 2026) y sin resultados de benchmarks publicados en la información disponible. Además, la model card del repositorio de cuantizaciones es una plantilla genérica de mradermacher: no aporta detalles sobre el entrenamiento, la composición del dataset ni las capacidades reales del modelo ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se detalla el diseño exacto en la información disponible; procede del modelo base de la familia Qwen3.5) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no aplica (modelo denso; no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16 (cuantizaciones estáticas; el autor indica que no hay versiones con imatrix/weighted) |
| Idiomas soportados | inglés (`en`); no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Modelo base | `abderahmenn/qwen3.5-9b-sob-json` |
| Dataset declarado | `MoetezF/Finetuning-ready` |
| Tamano del repositorio | 81,4 GB |
| Fecha de publicacion | 28 de octubre de 2026 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base: únicamente se sabe que pertenece a la familia Qwen3.5 y que el modelo ajustado se distribuye con la etiqueta `sft` y `merged-lora`, lo que indica un ajuste supervisado sobre LoRA cuya matriz se ha fusionado en los pesos finales para producir un checkpoint denso estándar de ~8,95B parámetros. No se especifican el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia a `MoetezF/Finetuning-ready`), ni si hubo fases de RLHF o DPO.

La innovación declarada es funcional, no arquitectónica: el ajuste está orientado a salida estructurada (JSON) y extracción de información, según los tags del autor. mradermacher se limita a generar cuantizaciones estáticas (sin imatrix ni pesos ponderados, según indica explícitamente en la model card), por lo que este repositorio no aporta ninguna modificación sobre el modelo original más allá de la compresión.

## Capacidades

- Generación de texto en inglés conversacional (tag `conversational`).
- Generación de salida estructurada en formato JSON, según la orientación declarada del ajuste.
- Extracción de información de textos (tag `information-extraction`).
- Ajuste supervisado sobre dataset específico (`MoetezF/Finetuning-ready`) con LoRA fusionada.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no declaradas; solo inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Extracción de campos estructurados en pipelines ETL: el ajuste a JSON permite convertir texto libre (correos, formularios, notas) en objetos con esquema fijo, reduciendo la necesidad de post-procesado con expresiones regulares.
- Normalización de datos de CRM o ERP: dado un registro en lenguaje natural, generar un JSON con campos canónicos (nombre, empresa, importe, fecha) listo para insertar en base de datos.
- Post-procesado de resultados de RAG: forzar la respuesta del modelo a un esquema JSON con campos como `respuesta`, `fuentes` y `confianza`, lo que facilita el consumo por parte de la aplicación cliente.
- Enriquecimiento de documentos en lote: al ser un modelo de ~9B cuantizable a 4 bits (5,7 GB en Q4_K_M), puede ejecutarse en una sola GPU de consumo o en CPU para procesar grandes volúmenes de documentos sin coste por token en la nube.
- Generación de argumentos estructurados para APIs internas: si el ajuste conserva la capacidad de seguir instrucciones del modelo base, puede producir payloads JSON para invocar servicios, aunque el soporte de tool calling no está confirmado.
- Prototipado y evaluación de esquemas de extracción: al disponer de cuantizaciones desde Q2_K (3,9 GB) hasta f16 (18,0 GB), permite comparar la degradación de la calidad de la salida estructurada según el nivel de cuantización antes de fijar una configuración de producción.
- Despliegue en entornos con hardware limitado: la versión Q2_K/Q3_K_S permite ejecutar el modelo en equipos con poca VRAM o incluso en CPU, útil para demos o pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de los tamaños de archivo declarados, más overhead de contexto y caché KV; son estimaciones, no cifras oficiales):
  - Q2_K (3,9 GB): ~5 GB de VRAM.
  - IQ4_XS (5,3 GB) / Q4_K_S (5,5 GB) / Q4_K_M (5,7 GB): ~7 GB de VRAM.
  - Q5_K_M (6,6 GB): ~8 GB de VRAM.
  - Q6_K (7,5 GB): ~9 GB de VRAM.
  - Q8_0 (9,6 GB): ~11-12 GB de VRAM.
  - f16 (18,0 GB): ~20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB o A100 40 GB para Q8_0 y f16.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más usando Q4_K_M o inferiores; las cuantizaciones Q8_0 y f16 requieren 12-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python para los GGUF; vLLM y TGI no consumen GGUF de forma nativa en la mayoría de configuraciones, por lo que para servir con esas herramientas habría que usar el repositorio original en safetensors (`abderahmenn/qwen3.5-9b-sob-json`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| qwen3.5-9b-sob-json (esta ficha) | ~8,95B | no disponible | Apache 2.0 | GGUF y safetensors |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B Instruct | ~8,03B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF |
| Mistral 7B Instruct v0.3 | ~7,25B | 32.768 tokens | Apache 2.0 | safetensors, GGUF |

Nota: los datos de los modelos alternativos provienen de sus model cards públicas y se incluyen como referencia de categoría; no se dispone de comparaciones de rendimiento con el modelo de esta ficha, ya que no hay benchmarks publicados. A diferencia de las alternativas, este modelo está especializado en salida JSON y no declara contexto ni capacidades multilingües.

## Limitaciones y advertencias

- Solo se declara inglés como idioma; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior.
- No hay resultados de benchmarks, evaluaciones de calidad ni validación por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta).
- La model card del repositorio es una plantilla genérica de cuantización: no documenta el dataset de ajuste, el proceso de entrenamiento ni las limitaciones del modelo.
- Al ser un ajuste fino con LoRA fusionada sobre un modelo base, es esperable cierta degradación de capacidades generales (razonamiento, código, matemáticas) respecto al modelo original, aunque no se cuantifica en la información disponible.
- La longitud de contexto no está publicada, lo que impide planificar despliegues con documentos largos sin verificarla empíricamente.
- Las cuantizaciones Q2_K y Q3_K_S son agresivas y pueden deteriorar la validez del JSON generado; para producción conviene partir de Q4_K_M o superior.
- Riesgo de alucinación: no evaluado; en tareas de extracción, un JSON bien formado no garantiza que los valores sean fieles al texto de origen, por lo que se recomienda validación contra esquema y verificación factual.
- Licencia Apache 2.0 en este repositorio, pero conviene verificar la licencia del modelo base y de la familia Qwen3.5 antes de un uso comercial, ya que la cadena de derivación no está documentada en detalle.
- El nombre "qwen3.5-9b" no permite confirmar la procedencia exacta del checkpoint base; no hay paper ni blog asociado en la información disponible.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/qwen3.5-9b-sob-json-GGUF
- Modelo base: https://huggingface.co/abderahmenn/qwen3.5-9b-sob-json
- Dataset declarado: https://huggingface.co/datasets/MoetezF/Finetuning-ready
- Página de resumen y descargas del autor: https://hf.tst.eu/model#qwen3.5-9b-sob-json-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
