# mradermacher/sft-apps-ds-7b-inst-GGUF

## Resumen

`sft-apps-ds-7b-inst-GGUF` es la versión cuantizada en formato GGUF del modelo `ankner/sft-apps-ds-7b-inst`, un modelo de lenguaje de aproximadamente 6.910 millones de parámetros (etiquetado comercialmente como 7B) afinado para instrucciones ("inst") sobre una base tipo DeepSeek. La cuantización la ha realizado mradermacher, un autor habitual en el ecosistema GGUF conocido por publicar versiones estáticas de modelos recientes para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.).

El modelo base está orientado a tareas conversacionales y de instrucciones en inglés, según los metadatos de la model card. No se dispone de información pública sobre la composición exacta del dataset de entrenamiento, la longitud de contexto nativa ni los detalles del proceso de afinado, más allá de la etiqueta `sft` (supervised fine-tuning) que aparece en el nombre. El repositorio incluye únicamente cuantizaciones estáticas (sin imatrix), lo que limita ligeramente la calidad en los rangos bajos frente a alternativas ponderadas.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de ~7B afinado para instrucciones en hardware de consumo, con opciones de cuantización desde Q2_K (2,8 GB) hasta f16 (13,9 GB). Es una opción práctica para prototipado offline y despliegues en entornos con recursos limitados, aunque la ausencia de benchmarks publicados y de información detallada sobre el modelo base obliga a tratarlo con cautela en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; probablemente basada en DeepSeek, según el nombre del modelo) |
| Parametros totales | 6.910.365.696 (~6,91B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 61,7 GB |
| Modelo base | ankner/sft-apps-ds-7b-inst |
| Cuantizador | mradermacher (nethype GmbH) |
| Descargas | 195 |
| Libreria | transformers (metadatos del repo) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `ankner/sft-apps-ds-7b-inst`. Por el nombre y el tamaño (~6,91B parámetros), todo apunta a un transformer decoder-only de la familia DeepSeek, pero no hay confirmación oficial en la información proporcionada. El sufijo `inst` indica un proceso de afinado para instrucciones, y `sft` sugiere que se ha utilizado supervisión de fine-tuning (supervised fine-tuning) sobre el modelo base, aunque no se especifica si hubo etapas adicionales de RLHF, DPO o similar.

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). La model card del repositorio GGUF es puramente operativa: describe las cuantizaciones disponibles y remite al modelo base para más información. Esta opacidad es un factor a tener en cuenta a la hora de evaluar la idoneidad del modelo para tareas críticas.

## Capacidades

- Generación de texto conversacional en inglés, con formato de instrucciones (chat).
- Razonamiento general y respuesta a preguntas, según el formato de instrucciones del modelo base.
- Soporte de tool calling / function calling: no disponible (no confirmado en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecutable localmente mediante llama.cpp y herramientas compatibles con GGUF.

## Casos de uso

- **Prototipado offline en portátil**: con la cuantización Q4_K_M (4,3 GB) el modelo cabe en GPUs de consumo con 6-8 GB de VRAM, lo que permite experimentar con un modelo afinado para instrucciones sin conexión a internet ni APIs externas.
- **Asistente conversacional local en inglés**: para integrar en aplicaciones de escritorio o CLI donde se requiera un chatbot que responda a instrucciones y mantenga conversaciones multi-turno, siempre que el contexto requerido no supere el límite nativo (no documentado).
- **Generación de texto y resumen en pipelines batch**: al ser un modelo pequeño y cuantizable a Q8_0 (7,4 GB) o Q5_K_M (5,0 GB), puede procesar lotes de documentos en CPU o GPU modesta con un throughput aceptable para tareas no críticas.
- **Evaluación comparativa de modelos 7B**: útil como baseline en experimentos de investigación sobre cuantización (comparar Q2_K frente a Q8_0 y f16) y sobre el impacto del afinado SFT en tareas de instrucciones.
- **Despliegue en entornos con restricciones de memoria**: la versión Q2_K (2,8 GB) permite ejecutar el modelo en dispositivos con 4 GB de RAM/VRAM, útil para demos o pruebas de concepto en hardware muy limitado.
- **Integración en Ollama / LM Studio**: al estar en formato GGUF, se puede importar directamente en estas herramientas para uso personal o en pequeños equipos, sin necesidad de infraestructura de servidores GPU.
- **Generación de código asistida (con reservas)**: aunque no hay benchmarks que lo confirmen, un modelo de 7B afinado para instrucciones puede emplearse para autocompletado y explicación de fragmentos de código en inglés, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según cuantización, aproximada):
  - Q2_K (2,8 GB): ~3,5-4 GB de VRAM/RAM.
  - Q4_K_M (4,3 GB): ~5-5,5 GB.
  - Q5_K_M (5,0 GB): ~6 GB.
  - Q8_0 (7,4 GB): ~8,5-9 GB.
  - f16 (13,9 GB): ~15-16 GB.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100 para las cuantizaciones más altas. Para Q4_K_M basta una RTX 3060 8 GB o RTX 4060.
- **¿Cabe en GPU de consumo?**: sí. Las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 6-8 GB; Q6_K y Q8_0 requieren 8-12 GB; f16 requiere 16 GB o más.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. Para vLLM o TGI habría que usar el modelo base en safetensors, no estas cuantizaciones.
- **Latencia y throughput estimados**: no disponibles. Dependen fuertemente del hardware y del backend; en una RTX 4090 con Q4_K_M se puede esperar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sft-apps-ds-7b-inst-GGUF (este) | ~6,91B | no disponible | no disponible | GGUF | Afinado SFT, solo inglés, sin benchmarks |
| Mistral-7B-Instruct (v0.2/v0.3) | ~7,2B | 8k-32k | Apache 2.0 | safetensors, GGUF | Ampliamente documentado, benchmarks públicos |
| Llama-3.1-8B-Instruct | ~8B | 128k | Llama 3.1 Community License | safetensors, GGUF | Contexto largo, multilingüe, benchmarks públicos |
| Qwen2.5-7B-Instruct | ~7,6B | 32k-128k | Apache 2.0 (mayoría) | safetensors, GGUF | Multilingüe, tool calling documentado |

La comparación es orientativa: el modelo de esta ficha carece de información pública sobre contexto, licencia y rendimiento, lo que dificulta una comparación rigurosa con alternativas consolidadas. En la práctica, Mistral-7B-Instruct, Llama-3.1-8B-Instruct y Qwen2.5-7B-Instruct ofrecen mayor transparencia y soporte de la comunidad.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor del modelo base (`ankner`) antes de usarlo en producción.
- **Solo inglés**: los metadatos indican `language: en`; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- **Contexto desconocido**: no se documenta la longitud de contexto nativa, lo que impide planificar aplicaciones que requieran ventanas largas.
- **Sin benchmarks**: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede evaluar su calidad frente a alternativas.
- **Riesgo de alucinación**: como todo modelo de ~7B, es propenso a inventar datos, especialmente en tareas factuales o de razonamiento complejo.
- **Sesgos**: no documentados; al desconocerse el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o ideológicos.
- **Cuantizaciones estáticas**: la model card indica que no hay cuantizaciones ponderadas/imatrix, lo que reduce la calidad en Q2_K y Q3_K frente a alternativas IQ.
- **Origen del modelo base poco documentado**: `ankner/sft-apps-ds-7b-inst` no cuenta con información pública extensa, lo que añade incertidumbre sobre su procedencia y calidad.
- **Repositorio de 61,7 GB**: incluye todas las cuantizaciones; conviene descargar solo la variante necesaria para no consumir ancho de banda innecesario.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/sft-apps-ds-7b-inst-GGUF
- Modelo base: https://huggingface.co/ankner/sft-apps-ds-7b-inst
- Página de descargas del cuantizador: https://hf.tst.eu/model#sft-apps-ds-7b-inst-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
