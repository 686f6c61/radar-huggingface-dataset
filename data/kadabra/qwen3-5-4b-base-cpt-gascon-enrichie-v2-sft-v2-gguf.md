# Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-v2-SFT-v2-GGUF

## Resumen

Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-v2-SFT-v2-GGUF es una distribución en formato GGUF de un modelo derivado de la familia Qwen3.5, con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), publicado por el usuario Kadabra. El nombre del repositorio describe la receta de ajuste: un *continued pre-training* (CPT) sobre un corpus denominado «Gascon-Enrichie-v2», seguido de una fase de *supervised fine-tuning* (SFT-v2). El objetivo declarado por la nomenclatura es especializar un modelo base de propósito general en la lengua gascó (variedad del occitano), un idioma con recursos digitales escasos.

La relevancia de esta publicación es doble. Por un lado, se trata de un ejemplo de adaptación lingüística de bajo coste sobre un modelo base pequeño, un patrón habitual en proyectos de preservación de lenguas minorizadas. Por otro lado, el repositorio incluye un fichero `mmproj` en BF16, lo que indica que el modelo conserva o incorpora capacidades de visión (modelo vision-language), y las etiquetas del repositorio incluyen `vision-language-model`, `llama.cpp` y `unsloth`, lo que confirma que la conversión a GGUF se realizó con la herramienta de Unsloth y que el modelo es ejecutable con llama.cpp.

Ahora bien, la información publicada es mínima. No se detallan la longitud de contexto, el número de tokens de entrenamiento, la composición del corpus, la licencia ni los idiomas soportados, y el repositorio no cuenta con descargas ni valoraciones en el momento de redactar esta ficha. Todo lo que sigue distingue de forma explícita entre datos verificados en la model card y datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-4B-Base; la model card no detalla la arquitectura interna (número de capas, atención, etc.) |
| Parametros totales | 4.205.751.296 (≈4,2 B), según safetensors |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q2_K_L, Q3_K_M, Q4_K_M, Q6_K (todos en GGUF); fichero mmproj en BF16 para la torre visual |
| Idiomas soportados | No disponibles. El nombre del modelo sugiere especialización en gascó (occitano) mediante CPT, sin confirmación documental |
| Licencia | No disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | GGUF (llama.cpp), con fichero mmproj separado para multimodalidad |

## Arquitectura y entrenamiento

La model card no describe la arquitectura más allá de la referencia al modelo base Qwen3.5-4B-Base y de las etiquetas `qwen3_5` y `vision-language-model`. Por el tamaño de parámetros y la ausencia de indicios de mezcla de expertos, cabe interpretar un transformer denso de ~4,2 B de parámetros, pero se trata de una inferencia a partir de los metadatos y no de un dato documentado. La presencia de un fichero `mmproj` en BF16 es el único indicio técnico sólido de que el modelo incorpora un proyector multimodal para entrada de imágenes, ejecutable con `llama-mtmd-cli`.

El proceso de entrenamiento se deduce únicamente del nombre del repositorio: una fase de *continued pre-training* sobre un corpus llamado «Gascon-Enrichie-v2» (presumiblemente un conjunto de textos en gascó enriquecido o ampliado), seguida de una fase de SFT (versión 2). No se especifican el número de tokens vistos, la proporción entre texto en gascó y texto general, la posible mezcla de datos para evitar olvido catastrófico, ni si hubo etapas de alineación adicionales (RLHF, DPO) o ajuste con datos sintéticos. La conversión a GGUF se realizó con Unsloth, y los ficheros generados siguen la nomenclatura estándar de llama.cpp (`Q2_K_L`, `Q3_K_M`, `Q4_K_M`, `Q6_K`).

## Capacidades

- Generación de texto y conversación multi-turno: la etiqueta `conversational` sugiere que el modelo fue ajustado para diálogo, aunque no se documenta la plantilla de chat aplicada.
- Procesamiento de imágenes: la inclusión del fichero `mmproj` y la etiqueta `vision-language-model` indican soporte de entrada visual a través de `llama-mtmd-cli`.
- Especialización lingüística en gascó: el CPT sobre «Gascon-Enrichie-v2» apunta a una mejora en la generación y comprensión de esta variedad occitana, sin métricas publicadas que lo cuantifiquen.
- Uso con llama.cpp: compatible con `llama-cli` (texto) y `llama-mtmd-cli` (multimodal), invocando el parámetro `--jinja` para aplicar la plantilla de chat.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede desplegarse mediante los endpoints de HuggingFace.
- No confirmado: no hay información sobre *tool calling*, *function calling*, razonamiento multi-paso, modo *thinking* explícito, soporte de audio ni ejecución de código.

## Casos de uso

- Preservación y revitalización del gascó: el modelo puede emplearse para generar textos divulgativos, traducciones asistidas y material didáctico en esta variedad occitana, aprovechando el CPT específico sobre corpus gascón.
- Normalización y reescritura de textos dialectales: dado un texto en gascó con ortografía heterogénea, el modelo puede reescribirlo en una norma ortográfica consistente, una tarea habitual en proyectos de corpus lingüísticos.
- Digitalización de documentos con OCR asistido: gracias a la torre visual (`mmproj`), puede procesar imágenes de páginas escaneadas y extraer o describir su contenido mediante `llama-mtmd-cli`, útil para archivos históricos en lenguas minorizadas.
- Generación aumentada por recuperación (RAG) sobre corpus locales: al ser un modelo de 4,2 B en GGUF, puede desplegarse en local junto a una base vectorial de documentación en gascó o francés para responder consultas de investigadores y docentes sin depender de servicios en la nube.
- Asistente conversacional de bajo consumo: cuantizado en Q4_K_M, el modelo cabe en GPU de consumo y permite mantener un chatbot local para talleres, demostraciones o prototipos de producto en entornos sin conectividad.
- Base para experimentos de *continual pre-training*: investigadores que trabajen en adaptación de lenguas de bajos recursos pueden usar este modelo como referencia metodológica de una receta CPT + SFT + GGUF, comparando sus resultados con los de un ajuste equivalente sobre el modelo base original.
- Evaluación comparativa de cuantizaciones: el repositorio publica cinco niveles de cuantización (Q2_K_L a Q6_K), lo que facilita estudiar la degradación de calidad en una lengua de bajos recursos, donde los errores morfológicos y ortográficos son especialmente sensibles a la compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad sobre corpus gascón ni evaluaciones multimodales, y el repositorio no registra descargas ni valoraciones que permitan inferir un uso validado por la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar caché KV ni el proyector visual): BF16 ≈ 8,4 GB; Q6_K ≈ 3,5 GB; Q4_K_M ≈ 2,6 GB; Q3_K_M ≈ 2,0 GB; Q2_K_L ≈ 1,7 GB. Cálculos aproximados a partir de los 4,2 B de parámetros; el repositorio completo ocupa 19,6 GB porque incluye todas las variantes.
- El fichero `mmproj` en BF16 añade un consumo adicional de VRAM no especificado en la model card; para uso multimodal hay que sumarlo a la cuantización elegida.
- GPU de consumo: Q4_K_M y Q3_K_M caben con holgura en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) y de 12 GB (RTX 3060 12 GB, RTX 4070); Q6_K requiere 8 GB o más; BF16 requiere 12-16 GB o descarga parcial a CPU.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o A10G son sobredimensionadas para este tamaño; su uso tendría sentido solo para servir muchas réplicas concurrentes o para reentrenamiento.
- Despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal, con `--jinja`), Ollama y LM Studio previa importación del GGUF. vLLM y TGI no se citan en la model card y su soporte de GGUF es limitado o parcial, por lo que no se pueden dar por garantizados.
- Latencia y throughput: no disponibles. Al no haber datos de contexto, no es posible estimar el coste de la caché KV ni el rendimiento en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-v2-SFT-v2-GGUF | ≈4,2 B | No disponible | Sí (mmproj BF16) | No disponible | GGUF en HuggingFace; 0 descargas |
| Qwen3-4B (familia Qwen) | ≈4,0 B | 32 768 tokens nativos, ampliable con YaRN | No en la variante de texto | Apache 2.0 | Muy extendida, múltiples cuantizaciones |
| Gemma 3 4B | ≈4 B | 128 000 tokens | Sí | Términos de uso de Gemma | Amplia, con soporte en llama.cpp y Ollama |
| Llama 3.2 3B | ≈3,2 B | 128 000 tokens | Sí (visión) | Licencia comunitaria de Llama 3.2 | Amplia, con soporte en llama.cpp y Ollama |

La comparación es estructural: los tres modelos de referencia documentan contexto, licencia y evaluations públicas, mientras que el modelo de Kadabra no publica ninguno de esos datos. La ventaja diferencial del modelo evaluado no es el rendimiento bruto, sino la especialización declarada en gascó, un nicho que ninguno de los tres alternativas cubre de forma específica.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se publican tokens de entrenamiento, composición del corpus, hiperparámetros ni proceso de alineación, lo que impide evaluar la calidad y la reproducibilidad del ajuste.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, lo que supone un riesgo legal directo en cualquier despliegue en producción. Tampoco se aclara la licencia heredada del modelo base Qwen3.5.
- Sin validación comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta; no existen informes independientes de calidad.
- Riesgo de olvido catastrófico: un CPT sobre un corpus probablemente pequeño y monolingüe puede degradar capacidades generales (matemáticas, código, razonamiento) del modelo base. No hay evaluaciones que descarten este efecto.
- Riesgo de alucinación: al ser un modelo de ~4 B con SFT sobre datos no documentados, la generación de hechos, citas o formas léxicas inexistentes en gascó es plausible y no está medida.
- Sesgos desconocidos: no se documenta ningún análisis de sesgo lingüístico, de género o cultural, ni filtrado del corpus de entrenamiento.
- Cobertura lingüística incierta: se desconoce si el ajuste conserva competencia en castellano, francés o inglés, o si el CPT ha desplazado el vocabulario hacia el gascó.
- Cuantizaciones agresivas: Q2_K_L y Q3_K_M pueden introducir errores ortográficos y morfológicos especialmente dañinos en una lengua de bajos recursos; se recomienda Q4_K_M o superior para cualquier uso lingüístico serio.
- Dependencia de la plantilla de chat: el uso correcto requiere `--jinja`; sin la plantilla adecuada, el modelo puede producir respuestas mal formateadas o repetitivas.
- Fecha de creación del repositorio anómala (2026-10-20) según los metadatos de HuggingFace, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-v2-SFT-v2-GGUF
- Unsloth (herramienta de conversión a GGUF citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (runtime para `llama-cli` y `llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información disponible artículos, papers, demos ni repositorios adicionales asociados a este modelo.
