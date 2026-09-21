# ArtyomSubDiv/dolly-v2-12b-sharded-Q6_K-GGUF

## Resumen

`ArtyomSubDiv/dolly-v2-12b-sharded-Q6_K-GGUF` es una conversión a formato GGUF del modelo `ethzanalytics/dolly-v2-12b-sharded`, un modelo de instrucciones derivado de la familia Dolly v2. La conversión la ha realizado el usuario ArtyomSubDiv mediante la herramienta `llama.cpp` y el space `gguf-my-repo` de ggml.ai, aplicando una cuantización Q6_K sobre los pesos originales. Se trata, por tanto, de una redistribución cuantizada y no de un entrenamiento nuevo: no hay pesos ni datos de entrenamiento propios más allá del proceso de cuantización.

El modelo cuenta con 11.841.894.400 parámetros (unos 11,84 mil millones) en un único archivo GGUF de 9,7 GB de tamano total de repositorio. Está orientado a generación de texto con instrucciones en inglés y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. La ventana de contexto que aparece en los ejemplos de uso del autor es de 2048 tokens.

Su relevancia es práctica más que investigadora: permite ejecutar un modelo de instrucciones de casi 12 B en hardware de consumo (a partir de unos 10-12 GB de VRAM o incluso en CPU) mediante `llama.cpp`, sin necesidad de infraestructura de GPU de datacenter. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación sin validación comunitaria ni evaluaciones publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base; la model card no detalla la arquitectura) |
| Parámetros totales | 11.841.894.400 (≈11,84 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens (valor empleado en los ejemplos de `llama-server` del autor; no se especifica en la model card) |
| Tipos de cuantización | Q6_K (única cuantización publicada en este repositorio) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo único cuantizado, `dolly-v2-12b-sharded-q6_k.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura en la información proporcionada más allá de que el modelo base es `ethzanalytics/dolly-v2-12b-sharded`. La model card de esta conversión remite explícitamente a la model card del modelo original para obtener detalles. El proceso aplicado aquí es exclusivamente una cuantización a Q6_K (aproximadamente 6,5 bits por peso) realizada con `llama.cpp` a través del space `gguf-my-repo`; no hay evidencia de entrenamiento adicional, ajuste fino ni destilación posteriores.

El único dato de entrenamiento disponible es el conjunto de datos declarado en las etiquetas del repositorio: `databricks/databricks-dolly-15k`, un dataset de pares instrucción-respuesta en inglés (aproximadamente 15.000 ejemplos, según la nomenclatura del propio dataset). No se especifican en la información proporcionada el número total de tokens de entrenamiento, la composición completa del corpus, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, arquitecturas híbridas, etc.).

## Capacidades

- Generación de texto e instrucciones en inglés (`pipeline_tag: text-generation`, etiquetas `instruct` y `dolly-v2`).
- Respuesta a prompts de tipo instrucción en un turno, con el formato de plantilla propio del modelo base Dolly v2 (no detallado en la model card de esta conversión).
- Inferencia local mediante `llama.cpp` en CLI (`llama-cli`) y en modo servidor (`llama-server`), con endpoint HTTP.
- Ejecución en CPU y en GPU, incluyendo reparto de capas entre ambos.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Capacidades especiales (modo thinking, visión, audio, matemáticas avanzadas): no documentadas.

## Casos de uso

- Asistente de instrucciones en inglés on-premise: el modelo puede desplegarse con `llama-server` en una máquina con GPU de consumo y ofrecer un endpoint HTTP local para tareas de redacción, resumen y respuesta a preguntas, sin enviar datos a servicios externos.
- Prototipado rápido de aplicaciones de generación de texto: al ser un GGUF único de 9,7 GB, permite iterar sobre prompts y plantillas en cuestión de minutos, sin necesidad de descargar checkpoints fragmentados en `safetensors`.
- Entornos air-gapped o con requisitos de soberanía del dato: al ejecutarse íntegramente en local con `llama.cpp`, es adecuado para laboratorios, administraciones o empresas que no pueden usar APIs externas.
- Despliegue en servidores sin GPU: `llama.cpp` permite inferencia en CPU con cuantización Q6_K, útil para entornos donde no hay acelerador disponible y la latencia no es crítica.
- Experimentación académica sobre cuantización: sirve como caso de estudio para medir la degradación de calidad entre el modelo base en precisión completa y su versión Q6_K, dado que el proceso de conversión está documentado y es reproducible con `gguf-my-repo`.
- Base para ajuste fino o destilación con recursos limitados: al ser un modelo denso de ~11,84 B, puede emplearse como punto de partida en experimentos de QLoRA o generación de datos sintéticos, siempre que se respete la licencia MIT.
- Chatbot interno de documentación en inglés: con 2048 tokens de contexto puede gestionar consultas de un solo turno o conversaciones cortas sobre manuales y procedimientos, integrado en una interfaz propia mediante el servidor de `llama.cpp`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes, ni comparaciones medidas contra el modelo base en precisión completa.

## Requisitos de hardware

- Peso del archivo cuantizado: 9,7 GB (dato real del tamaño del repositorio).
- VRAM estimada para inferencia: en torno a 10-12 GB contando pesos y caché KV para el contexto de 2048 tokens declarado en los ejemplos (estimación a partir del tamaño del archivo; no confirmada por el autor).
- GPU recomendadas: tarjetas con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 3090, RTX 4090, A100, H100). En GPUs de 8 GB sería necesario descargar capas a CPU.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM; en tarjetas de 8-10 GB funciona parcialmente con offload a RAM.
- Ejecución en CPU: viable con `llama.cpp`, con memoria RAM aproximada de 10-12 GB y rendimiento dependiente del número de núcleos.
- Opciones de despliegue confirmadas por el autor: `llama-cli` y `llama-server` de `llama.cpp` (instalación vía Homebrew o compilación con `LLAMA_CURL=1` y flags específicos de hardware, por ejemplo `LLAMA_CUDA=1`). Otras opciones compatibles con GGUF (Ollama, llama-cpp-python, LM Studio, text-generation-webui) no están documentadas en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArtyomSubDiv/dolly-v2-12b-sharded-Q6_K-GGUF | 11,84 B | 2048 (según ejemplos) | GGUF Q6_K, 9,7 GB | MIT | Repositorio HF, 0 descargas, 0 likes |
| ethzanalytics/dolly-v2-12b-sharded (modelo base) | 11,84 B | No disponible | No disponible (presumiblemente `safetensors`) | No disponible en la información proporcionada | Repositorio HF referenciado |
| Otras cuantizaciones GGUF equivalentes de la familia Dolly v2 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado datos de benchmarks ni de rendimiento medido de ninguno de los modelos comparados, por lo que la comparación se limita a parámetros, formato y licencia. La única ventaja verificable de esta conversión frente al modelo base es el menor tamaño en disco (9,7 GB) y la posibilidad de ejecución directa con `llama.cpp`.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara inglés; su uso en castellano no está soportado ni evaluado.
- Contexto limitado: 2048 tokens, insuficiente para documentos largos, conversaciones extensas o tareas de recuperación aumentada con muchos fragmentos.
- Dataset de ajuste reducido: `databricks-dolly-15k` contiene aproximadamente 15.000 ejemplos, lo que limita la cobertura de dominios y favorece respuestas genéricas o poco precisas en temas especializados.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta conversión; en modelos de instrucciones pequeños ajustados con datasets limitados el riesgo de inventar hechos es relevante.
- Pérdida por cuantización: Q6_K introduce una degradación de precisión respecto a los pesos originales, que no ha sido medida ni documentada por el autor.
- Ausencia de validación comunitaria: 0 descargas y 0 likes, sin issues, evaluaciones ni pruebas independientes en el momento de la consulta.
- Fechas de metadatos anómalas: el repositorio figura como creado y actualizado el 20 de septiembre de 2026, lo que conviene verificar antes de citarlo.
- Tool calling y agentes: no hay soporte documentado de function calling ni de flujos multi-paso, por lo que no debería asumirse su uso en pipelines de agentes sin validación previa.
- Licencia: MIT, sin restricciones conocidas para uso comercial; conviene confirmar igualmente la licencia del modelo base `ethzanalytics/dolly-v2-12b-sharded` antes de un despliegue en producción.
- Producción: la model card no incluye instrucciones de plantilla de chat ni recomendaciones de parámetros de muestreo, por lo que cualquier despliegue productivo requiere una fase de evaluación propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArtyomSubDiv/dolly-v2-12b-sharded-Q6_K-GGUF
- Modelo base: https://huggingface.co/ethzanalytics/dolly-v2-12b-sharded
- Dataset de ajuste: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Space de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
- ggml.ai: https://ggml.ai
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
