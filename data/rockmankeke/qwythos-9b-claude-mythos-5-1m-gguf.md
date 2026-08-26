# rockmankeke/Qwythos-9B-Claude-Mythos-5-1M-GGUF

## Resumen

Qwythos-9B-Claude-Mythos-5-1M-GGUF es una colección de cuantizaciones GGUF del modelo base `empero-ai/Qwythos-9B-Claude-Mythos-5-1M`, desarrollado por el laboratorio independiente alemán Empero. Se trata de un modelo de razonamiento de 9 000 millones de parámetros, post-entrenado sobre más de 500 millones de tokens de trazas Claude Mythos / Claude Fable con cadenas de pensamiento generadas internamente por la herramienta `rethink` de Empero. El objetivo es ofrecer una alternativa local de alta capacidad a modelos propietarios como Claude, con una ventana de contexto de un millón de tokens y soporte nativo para function calling.

La versión GGUF, publicada en el repositorio `rockmankeke/Qwythos-9B-Claude-Mythos-5-1M-GGUF`, incluye archivos cuantizados desde Q4_K_M hasta BF16, tanto en variantes estándar como con cabecera MTP (Multi-Token Prediction) para decodificación especulativa, además de un proyector de visión multimodal. Está licenciado bajo Apache 2.0 y se integra con runtimes como llama.cpp, Ollama, LM Studio, jan y KoboldCpp. La relevancia actual radica en su combinación de contexto extremadamente largo, razonamiento mejorado y capacidad multimodal en un tamaño ejecutable en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B) con atención de ventana completa y YaRN rope-scaling |
| Parámetros totales | 8 953 803 264 (8,95 G) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1 048 576 tokens (1M) activado por defecto |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16, y variantes MTP (Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16) |
| Idiomas soportados | Inglés (según model card; la base Qwen3.5-9B podría soportar otros, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base `Qwythos-9B-Claude-Mythos-5-1M` es un modelo de lenguaje denso de 9 000 millones de parámetros, heredado de Qwen3.5-9B. Se sometió a un post-entrenamiento completo (full-parameter SFT) sobre más de 500 millones de tokens de trazas de razonamiento de Claude Mythos y Claude Fable, generadas internamente por Empero con su herramienta `rethink`. El entrenamiento fue solo de texto; la torre de visión (encoder CLIP y proyector) se mantuvo congelada, por lo que las capacidades multimodales son idénticas a las del Qwen3.5-9B original.

La ventana de contexto de 1 048 576 tokens se logra mediante YaRN rope-scaling, activado por defecto en los archivos GGUF. Además, el modelo incluye una cabecera MTP (Multi-Token Prediction) compatible con la especificación Qwen3.5, que permite decodificación especulativa con `--spec-type draft-mtp` en llama.cpp para acelerar la generación. La cuantización GGUF se realizó sobre los pesos de safetensors del modelo base, con variantes `fixed v3` que corrigen problemas de compatibilidad.

## Capacidades

- **Razonamiento avanzado**: mejora significativa sobre la base Qwen3.5-9B en tareas de razonamiento, con +34 puntos en MMLU, +30 en gsm8k-strict y +19 en gsm8k-flex.
- **Function calling nativo**: compatible con la especificación Qwen3.5, permite integración con herramientas y agentes.
- **Ventana de contexto de 1M tokens**: capacidad de procesar documentos muy largos, libros, codebases completos o historiales extensos.
- **Visión multimodal**: soporte de entrada de imágenes a través del proyector de visión (mmproj) heredado de Qwen3.5-9B; capacidades de descripción de imágenes, OCR (impreso y manuscrito), lectura de gráficos/tablas, comprensión de UI y razonamiento espacial básico.
- **Agentic y multi-step reasoning**: diseñado para tareas de agente con múltiples pasos, gracias a su entrenamiento en trazas de razonamiento.
- **Decodificación especulativa MTP**: variantes con cabecera MTP para acelerar la generación en runtimes compatibles.
- **Modelo "uncensored"**: según los tags, el modelo no tiene censura explícita; sin embargo, la model card no detalla el alcance exacto.

## Casos de uso

- **Análisis de documentos de largo recorrido**: con 1M tokens de contexto, puede procesar contratos legales, informes técnicos o libros completos en una sola pasada, resumiendo, extrayendo información o respondiendo preguntas sobre el contenido íntegro.
- **Atención al cliente automatizada**: su función calling nativa permite integrarse con sistemas de tickets, bases de conocimiento y APIs externas para resolver consultas multi-turno de forma autónoma.
- **Generación y revisión de código**: útil para tareas de programación con contexto de repositorio grande, explicación de código heredado y generación de parches, gracias a su razonamiento y ventana de contexto.
- **Análisis biomédico**: el entrenamiento incluye trazas de razonamiento de alta calidad; puede ayudar a interpretar literatura científica, resumir papers y apoyar la redacción de informes técnicos en el ámbito de la salud.
- **Ciberseguridad**: capacidad de analizar registros de seguridad, logs y documentos técnicos para detectar patrones sospechosos o generar informes de incidentes.
- **Asistentes de productividad con visión**: al combinar la entrada de imagen con el razonamiento, puede extraer datos de capturas de pantalla, diagramas o documentos escaneados y transformarlos en texto estructurado o JSON.
- **Despliegue local en entornos con recursos limitados**: con la cuantización Q4_K_M (5,24 GiB) es viable en una GPU de 6-8 GB para inferencia de contexto moderado, permitiendo asistentes personales y chatbots locales.

## Benchmarks y rendimiento

Según la model card del modelo base, la evaluación comparada con la base Qwen3.5-9B muestra:

| Benchmark | Qwen3.5-9B (base) | Qwythos-9B (post-entrenado) | Diferencia |
|---|---|---|---|
| MMLU | - | - | +34 pts |
| gsm8k-strict | - | - | +30 pts |
| gsm8k-flex | - | - | +19 pts |

No se proporcionan valores absolutos ni resultados para otros benchmarks (HumanEval, MATH, etc.). Los datos son los publicados por el autor; no se dispone de más detalles en la información disponible. Se recomienda consultar la model card del modelo base para una evaluación completa.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Q4_K_M: 5.24 GiB de pesos + KV cache (para 16k tokens, aproximadamente 1-2 GiB; para 1M tokens se requeriría memoria enorme, del orden de cientos de GB).
  - Q8_0: 8.87 GiB de pesos.
  - BF16: 16.69 GiB de pesos.
- **GPU recomendadas**: una RTX 3090 o RTX 4090 (24 GB) puede ejecutar Q4_K_M con contexto de hasta ~100k tokens cómodamente. Para la ventana completa de 1M tokens se necesita un sistema con mucha RAM o GPU de gran capacidad (A100 80 GB o más).
- **En consumer GPU**: sí, el Q4_K_M cabe en GPUs de 6-8 GB (GTX 1080 Ti, RTX 2060 Super, RTX 3060) si se limita el contexto a unos pocos miles de tokens.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, jan, KoboldCpp, y servidores OpenAI-compatibles vía `llama-server`.
- **Latencia/throughput**: no hay datos publicados. La decodificación especulativa con MTP puede acelerar la generación en runtimes compatibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantizaciones | Rendimiento (MMLU) |
|---|---|---|---|---|---|
| Qwythos-9B-Claude-Mythos-5-1M | 8.95 G | 1M | Apache 2.0 | GGUF (Q4_K_M a BF16) | +34 pts sobre Qwen3.5-9B (dato del autor) |
| Qwen3.5-9B (base) | ~9 G | 128k (extensible a 1M) | Apache 2.0 | safetensors, GGUF | Referencia (no disponible) |
| Qwen2.5-7B | 7.6 G | 128k | Apache 2.0 | GGUF, safetensors | 70.6 (MMLU) |
| Llama-3.1-8B | 8.03 G | 128k | Llama 3.1 | GGUF, safetensors | 66.0 (MMLU) |

Nota: los valores de MMLU de Qwen2.5 y Llama-3.1 son datos públicos generales; no se comparan directamente con Qwythos porque el autor no publicó la cifra absoluta de MMLU. La comparativa es orientativa.

## Limitaciones y advertencias

- **Sesgos y alucinación**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo. No se dispone de análisis específico de sesgos para este modelo.
- **Idioma**: la model card solo indica inglés; el rendimiento en otros idiomas no está garantizado ni documentado.
- **Contexto de 1M tokens**: aunque la ventana de contexto es de 1M tokens, la memoria necesaria para el KV cache es enorme; en la práctica se recomienda usar contexto moderado (16k-100k) en hardware consumer.
- **Visión heredada**: la torre de visión se mantuvo congelada durante el SFT, por lo que la calidad de la visión es la del Qwen3.5-9B original, no mejorada por el entrenamiento de Qwythos.
- **Riesgo de uso indebido**: los tags indican "uncensored"; esto puede implicar que no tiene barreras de seguridad adicionales, por lo que se debe tener cuidado en aplicaciones de producción con contenido sensible.
- **Compatibilidad MTP**: la decodificación especulativa con MTP solo funciona con builds recientes de llama.cpp; si se usa un runtime más antiguo, se debe optar por las variantes normales.
- **Calidad de cuantización**: las cuantizaciones de baja precisión (Q4_K_M) pueden degradar ligeramente la calidad del razonamiento comparado con el modelo en BF16.

## Enlaces

- Repositorio Hugging Face: [rockmankeke/Qwythos-9B-Claude-Mythos-5-1M-GGUF](https://huggingface.co/rockmankeke/Qwythos-9B-Claude-Mythos-5-1M-GGUF)
- Modelo base (Empero): [empero-ai/Qwythos-9B-Claude-Mythos-5-1M](https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M)
- Repositorio GGUF original de Empero: [empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF](https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF)
- Variante abliterated (huihui-ai): [Huihui-Qwythos-9B-Claude-Mythos-5-1M-abliterated-GGUF](https://huggingface.co/huihui-ai/Huihui-Qwythos-9B-Claude-Mythos-5-1M-abliterated-GGUF)
- Sitio web de Empero: [https://empero.org/](https://empero.org/)
- GitHub con documentación: [https://github.com/kiranrajcn4444/AFE--Qwythos-9B-Claude-Mythos-5-1M-GGUF](https://github.com/kiranrajcn4444/AFE--Qwythos-9B-Claude-Mythos-5-1M-GGUF)
