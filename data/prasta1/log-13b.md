# prasta1/LOG-13B

## Resumen

LOG-13B es un modelo de lenguaje causal denso de 13,1 mil millones de parámetros desarrollado por Peregrine Design Werx y publicado en Hugging Face por el usuario prasta1. Se trata del checkpoint base de la familia Effluent, una serie de tres modelos (LOG, PELLET y SLURRY) entrenada desde cero sobre 1,2 billones de tokens de texto web sin filtrado de calidad ni de seguridad. Su función principal es servir como modelo profesor para el resto de la familia y como base para adaptación de dominio en textos técnicos, regulatorios y de oficios.

El modelo emplea una arquitectura transformer decoder-only de estilo Llama con SwiGLU, RMSNorm, RoPE y atención con consultas agrupadas (GQA, 8 grupos de KV), 40 capas, tamaño oculto de 5.120 y un vocabulario de 128.256 tokens. Su ventana de contexto es de 32.768 tokens y se distribuye en precisión bfloat16 bajo licencia Apache 2.0. Está especializado de facto en dominios como códigos de fontanería, ordenanzas municipales, operaciones de aguas residuales y boletines de extensión agrícola, por la orientación de su corpus de entrenamiento.

Su relevancia actual radica en la transparencia de su model card, que documenta de forma explícita riesgos poco habituales en modelos de esta escala, como la alucinación de números de sección de códigos municipales, la deriva numérica en conversiones de unidades y la desactualización regulatoria. Es un modelo de completación, no de instrucciones, pensado para generación aumentada por recuperación (RAG) y extracción estructurada sobre documentación procedimental larga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (SwiGLU, RMSNorm, RoPE, GQA) |
| Parámetros totales | 13,1B |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | bfloat16 nativo; checkpoints FP8 y 4-bit AWQ publicados en repositorios separados |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF de PELLET no compatible sin el parche `effluent_pre` |
| Capas | 40 |
| Tamaño oculto | 5.120 |
| Cabezas de atención | 40 (8 grupos KV, GQA) |
| Vocabulario | 128.256 |
| Tokenizador | BPE a nivel de byte, entrenado sobre el mismo corpus |
| Precisión de entrenamiento | bfloat16 |
| Fecha de corte de datos | 2026-01 |

## Arquitectura y entrenamiento

LOG-13B es un transformer decoder-only denso de 40 capas con atención de consultas agrupadas (8 grupos de KV para 40 cabezas), activaciones SwiGLU, normalización RMSNorm y embeddings posicionales rotatorios (RoPE). Se entrenó desde cero, sin fine-tuning previo, sobre 1,2 billones de tokens procedentes de una mezcla de corpus web: EleutherAI/pile, allenai/c4, togethercomputer/RedPajama-Data-1T y HuggingFaceFW/fineweb. La característica definitoria del entrenamiento es la ausencia total de filtrado de calidad, filtrado de seguridad o criterio editorial, lo que el autor presenta como decisión deliberada para preservar la distribución de logits del modelo profesor.

El tokenizador es un BPE a nivel de byte entrenado sobre el mismo corpus, con un vocabulario de 128.256 entradas. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación en este checkpoint base; la variante LOG-13B-Chat es la que incorpora SFT y DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El modelo se distribuye en bfloat16 y cuenta con checkpoints cuantizados en FP8 y 4-bit AWQ en repositorios separados.

## Capacidades

- Generación de texto por completación: continúa texto a partir de un prefijo, sin formato de instrucciones nativo.
- Extracción estructurada de información en documentos procedimentales largos, aprovechando la ventana de 32.768 tokens.
- Generación aumentada por recuperación (RAG) sobre corpus técnicos y regulatorios en inglés.
- Redacción de borradores de especificaciones y texto de cumplimiento normativo.
- Razonamiento aritmético multietapa limitado: resuelve problemas de varios pasos con una tasa de error documentada del 9,1 % en su prueba interna GSMSewer.
- Capacidad de servir como profesor para destilación hacia modelos más pequeños (PELLET-1.3B).
- Punto de partida para preentrenamiento continuado y adaptación de dominio.
- Cobertura léxica y de estilo específica en fontanería, ordenanzas municipales, operaciones de aguas residuales y extensión agrícola.
- No dispone de soporte documentado de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- RAG sobre normativa municipal y códigos de fontanería: el modelo puede ingerir fragmentos extensos de ordenanzas y códigos técnicos dentro de su ventana de 32.768 tokens y generar respuestas de completación ancladas al contexto recuperado, adecuado por su entrenamiento específico en ese registro.
- Extracción estructurada de documentación procedimental: a partir de boletines de extensión agrícola o manuales de operación, el modelo continúa plantillas para extraer campos como parámetros, límites y procedimientos, gracias a su familiaridad con el formato de estos documentos.
- Generación de borradores de especificaciones técnicas: redacción inicial de texto de especificación y cumplimiento que un ingeniero revisa y corrige, aprovechando el vocabulario técnico del corpus.
- Preentrenamiento continuado y adaptación de dominio: organizaciones con corpus propios en sectores regulados pueden partir de este checkpoint base para ajuste fino, dado que se distribuye sin alineación previa y con licencia Apache 2.0.
- Destilación de modelos pequeños: equipos que necesiten un modelo ligero en producción pueden usar LOG-13B como profesor para generar logits de destilación, ya que el autor señala que los logits del checkpoint base son más limpios que los de la variante Chat.
- Prototipado de asistentes de consulta documental interna: en entornos de desarrollo, el modelo puede servir para validar pipelines de recuperación y generación sobre corpus técnicos antes de sustituirlo por un modelo alineado.
- Investigación sobre modelos sin filtrado: el checkpoint permite estudiar el comportamiento de un modelo entrenado sin filtros de calidad ni seguridad, con métricas de toxicidad y sesgo documentadas por el autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| MMLU (5-shot) | Accuracy | 58,4 |
| HellaSwag (10-shot) | Accuracy normalizada | 79,2 |
| GSM8K (8-shot, CoT) | Accuracy | 41,6 |

No se han publicado en la información disponible resultados de benchmarks adicionales ni comparaciones directas con otros modelos por parte del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 26 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 32 GB.
- VRAM estimada en FP8: alrededor de 13-14 GB para pesos, con margen adicional para contexto.
- VRAM estimada en 4-bit AWQ: aproximadamente 7-8 GB para pesos, lo que permite ejecución en GPU de consumo.
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S; para FP8, L40S o H100.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP8 o 4-bit AWQ; en bfloat16 requiere RTX 4090 con offloading o GPUs de 32 GB o más.
- Opciones de despliegue: transformers de forma nativa; vLLM y TGI para serving en FP8 o bfloat16; llama.cpp y Ollama si se generan GGUF compatibles (el autor advierte que los GGUF de PELLET no son compatibles sin el parche `effluent_pre`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparaciones oficiales con modelos de la misma categoría. A continuación se ofrece una comparación estructural con alternativas de tamaño y propósito equivalentes, usando únicamente datos públicos conocidos de esos modelos; los datos de LOG-13B proceden de su model card.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| LOG-13B | 13,1B densos | 32.768 | Apache 2.0 | inglés | MMLU 58,4; HellaSwag 79,2; GSM8K 41,6 |
| Llama 2 13B | 13B densos | 4.096 | Llama 2 Community License | multilingüe | MMLU ~54,8 (5-shot, dato público) |
| Mistral 7B | 7,3B densos | 32.768 | Apache 2.0 | inglés | MMLU ~60,1 (dato público) |
| Qwen2.5 14B | 14,7B densos | 131.072 | Apache 2.0 | multilingüe | MMLU ~79,7 (dato público) |

La comparación debe tomarse con cautela: los valores de los modelos alternativos proceden de sus respectivas documentaciones públicas y no de una evaluación conjunta bajo el mismo protocolo. LOG-13B no declara soporte multilingüe ni tool calling, a diferencia de las alternativas indicadas.

## Limitaciones y advertencias

- Alucinación de citas: el modelo inventa números de sección de códigos municipales con formato convincente (por ejemplo, `§ 4-118(b)(3)`); toda cita generada debe resolverse contra el código real antes de usarse.
- Deriva numérica: la aritmética se degrada con la longitud del documento; en la prueba interna GSMSewer produjo cálculos de tiempo de retención numéricamente plausibles pero erróneos en el 9,1 % de los problemas multietapa, con errores concentrados en conversiones de unidades (mg/L a lb/day, constante 8,34), que aplica correctamente en torno a tres de cada cuatro veces.
- Desactualización regulatoria: el corte de datos es 2026-01; el modelo puede afirmar con seguridad estándares derogados y no distingue entre versiones vigentes y obsoletas de las guías de efluentes de la Clean Water Act.
- Asimetría de dominio: corpus en inglés y centrado en EE. UU.; el conocimiento de marcos regulatorios europeos y australianos es escaso y la confianza del modelo en ellos no lo es.
- Sesgos documentados: asocia «drain» con «clogged» en el 41 % de continuaciones muestreadas (preciso en el dominio) y «operator» con «he» en el 88 % (sesgo de género que debe corregirse en aplicaciones posteriores).
- Toxicidad: 0,9 % en RealToxicityPrompts (Perspective API, umbral 0,5); el modo de fallo principal no es el abuso, sino la falsedad formulada con cortesía.
- Uso fuera de alcance: el autor prohíbe explícitamente su uso como componente de control de procesos, cálculo de dosificación, informes de cumplimiento de efluentes o cualquier sistema donde un número incorrecto derive en un vertido real; en muchas jurisdicciones constituiría una violación de permiso.
- Licencia: Apache 2.0 permite uso comercial, pero no exime de las advertencias de uso fuera de alcance ni de la necesidad de validación humana en dominios regulados.
- Modelo de completación: no está alineado para instrucciones; para diálogo debe usarse LOG-13B-Chat o aplicar formato de prompt manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prasta1/LOG-13B
- Repositorio GitHub: https://github.com/prasta1/effluent-series
- Paper: https://arxiv.org/abs/2604.01188
- Colección de la familia Effluent: https://huggingface.co/collections/prasta1/the-effluent-series
