# mangaba-ai/Mangaba-Financeiro-8B

## Resumen

Mangaba Financeiro 8B es un adaptador LoRA desarrollado por Mangaba AI sobre el modelo base Qwen3-8B (Apache-2.0), especializado en regulación financiera brasileña. El adaptador se entrena sobre el texto vigente de cinco normas clave (Ley 4.595/1964 del Sistema Financiero Nacional, Ley 12.865/2013 de arreglos de pago, LC 105/2001 de secreto bancario, Ley 9.613/1998 de prevención de lavado de dinero y Ley 14.286/2021 de cambio) y está diseñado para funcionar en un pipeline de generación aumentada por recuperación (RAG) sobre un corpus de artículos indexados con embeddings bge-m3.

El modelo resuelve un problema concreto: responder consultas de compliance y regulación financiera en portugués de Brasil citando el artículo y la norma exactos, a partir de los fragmentos recuperados por el sistema de búsqueda. No es un modelo autónomo de conocimiento cerrado: su rendimiento depende críticamente de que el corpus de recuperación contenga el artículo correcto. Según la evaluación del autor sobre 60 preguntas fuera del conjunto de entrenamiento, el adaptador alcanza un 82% de respuestas con nota 5 de contenido y un 78% de respuestas correctas con cita del artículo exacto, frente al 0% del Qwen3-8B sin búsqueda.

La relevancia actual reside en su enfoque de especialización vertical mediante LoRA de bajo rango (r=32, α=64) sobre un modelo de 8B, combinado con un corpus normativo versionado. El repositorio ocupa 0,4 GB y el acceso está restringido mediante un formulario de registro (gated model) con campos de empresa, cargo, uso previsto y consentimiento LGPD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA |
| Parametros totales | 8B (modelo base; el adaptador LoRA es un subconjunto de bajo rango) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | Portugues de Brasil (pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-8B |
| Rango LoRA / alpha | r=32 / α=64 |
| Libreria | PEFT |
| Tamano del repositorio | 0,4 GB |
| Corpus de recuperacion | `busca/corpus/` con articulos y embeddings bge-m3 |
| Re-ranker | bge-reranker-v2-m3 (BAAI) |
| Fecha de creacion | 2026-10-20 |
| Ultima actualizacion | 2026-11-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8B parametros. El LoRA se inserta en todas las proyecciones lineales con rango 32 y alpha 64. El entrenamiento se realizó en dos etapas: la primera consistió en 3 épocas con preguntas y respuestas generadas por artículo, junto con la recuperación del texto de cada artículo por su número; la segunda etapa consistió en 1 época en la que la pregunta se acompaña de fragmentos recuperados, incluyendo deliberadamente fragmentos similares pero incorrectos mezclados con el dispositivo correcto, para enseñar al modelo a responder a partir de los fragmentos y a citar la etiqueta exacta del artículo.

El entrenamiento se ejecutó en 2 GPUs NVIDIA L40S en servidores de Mangaba en Brasil. El corpus normativo cubre el texto vigente del Planalto recolectado el 19/10/2026 para las cinco normas indicadas. La inferencia recomendada por el autor es mediante vLLM con `--enable-lora --max-lora-rank 32` y `chat_template_kwargs={"enable_thinking": false}`, es decir, desactivando el modo de razonamiento extendido de Qwen3. No se documentan detalles sobre volumen total de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en portugués de Brasil orientada a consultas de regulación financiera.
- Respuesta fundamentada en fragmentos recuperados (RAG), citando artículo y norma cuando el fragmento correcto está presente en el contexto.
- Citación de la etiqueta exacta del artículo recuperado (entrenado explícitamente para ello en la etapa 2).
- Especialización en cinco normas: SFN (Ley 4.595/1964), arreglos de pago (Ley 12.865/2013), secreto bancario (LC 105/2001), lavado de dinero (Ley 9.613/1998) y cambio (Ley 14.286/2021).
- Capacidad de razonamiento y generación general heredada de Qwen3-8B (no evaluada de forma específica en la model card).
- Soporte de tool calling / function calling: no disponible (no documentado para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al portugués de Brasil según la model card.
- Modo thinking: desactivado en la configuración de inferencia recomendada.

## Casos de uso

- **Atención a compliance en bancos y fintechs**: el modelo responde consultas internas sobre obligaciones regulatorias citando el artículo y la norma exactos, siempre que el pipeline RAG recupere el fragmento correcto del corpus. Adecuado para equipos que necesitan respuestas trazables y auditables.
- **Asistentes de consulta normativa para equipos jurídicos**: integrado en un buscador interno sobre las cinco normas cubiertas, permite formular preguntas en lenguaje natural y obtener respuestas con referencia al dispositivo legal, reduciendo el tiempo de localización manual del articulado.
- **Onboarding y formación en regulación financiera**: el modelo puede explicar el contenido de artículos concretos a partir del texto recuperado, útil para programas de formación interna en PLD/FT, secreto bancario o régimen de cambios.
- **Soporte a análisis de arreglos de pago**: para instituciones de pago que necesitan interpretar la Ley 12.865/2013, el adaptador responde citando el artículo aplicable, condicionado a que el corpus de recuperación esté actualizado.
- **Verificación de citas normativas en documentos internos**: el modelo puede contrastar referencias legales en borradores de políticas internas frente al texto vigente del corpus, señalando artículo y norma.
- **Triaje de consultas regulatorias**: clasificación y primera respuesta a consultas entrantes de cumplimiento normativo, derivando a revisión humana los casos que requieran interpretación jurisprudencial (fuera del alcance del corpus).
- **Prototipado de asistentes RAG verticales**: como ejemplo de adaptador LoRA especializado con corpus versionado, sirve de plantilla para construir asistentes sobre otros dominios regulatorios.

## Benchmarks y rendimiento

Evaluación del autor sobre 60 preguntas fuera del conjunto de entrenamiento, con juicio automático mediante Mangaba Titan 122B:

| Métrica | Qwen3-8B sin búsqueda | Qwen3-8B + búsqueda | Mangaba Financeiro 8B + búsqueda |
|---|---|---|---|
| Respuesta correcta (nota 5 de contenido) | 0% | 67% | 82% |
| Correcta y con el artículo exacto | 0% | 55% | 78% |
| Cita el artículo correcto | 15% | 93% | 92% |
| Cita la norma correcta | 47% | 95% | 95% |
| Nota media de contenido (1–5) | 1,03 | 4,10 | 4,30 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores son una evaluación interna específica del dominio con juez automático, no comparable directamente con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade una sobrecarga mínima sobre Qwen3-8B. En FP16, el modelo base requiere aproximadamente 16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones para el modelo base, no documentadas por el autor para el adaptador).
- GPU recomendadas: el autor entrenó en 2× NVIDIA L40S. Para inferencia, el despliegue documentado es vLLM con soporte LoRA, lo que encaja con GPUs de datacenter (A100, H100, L40S) y con GPUs consumer de gama alta con suficiente VRAM.
- GPU consumer: el modelo base de 8B en cuantización de 4 bits puede caber en GPUs con 8 GB o más; en FP16 requiere 16 GB o más. No hay confirmación del autor sobre despliegue en consumer.
- Opciones de despliegue: vLLM es la opción documentada por el autor (`vllm serve Qwen/Qwen3-8B --enable-lora --max-lora-rank 32 --lora-modules financeiro=mangaba-ai/Mangaba-Financeiro-8B`). Otras opciones como llama.cpp, Ollama o TGI no están documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mangaba Financeiro 8B | 8B + LoRA r=32 | no disponible | Regulación financiera brasileña con RAG | Apache-2.0 (acceso gated) | Hugging Face, acceso mediante registro |
| Qwen3-8B (base) | 8B | no disponible | Propósito general | Apache-2.0 | Hugging Face, acceso abierto |
| Qwen3-8B + búsqueda (sin adaptador) | 8B | no disponible | RAG genérico sobre el mismo corpus | Apache-2.0 | Configuración reproducible |
| Mangaba Titan 122B (juez de evaluación) | 122B | no disponible | Modelo de evaluación del autor | no disponible | no disponible |

La comparación más directa es con el Qwen3-8B base con el mismo pipeline de búsqueda: el adaptador mejora la tasa de respuesta correcta del 67% al 82% y la cita exacta del artículo del 55% al 78%, con una nota media de contenido de 4,30 frente a 4,10. No se dispone de comparación con otros adaptadores financieros especializados en el mismo dominio.

## Limitaciones y advertencias

- Dependencia crítica del corpus de recuperación: sin el fragmento correcto en la búsqueda, la calidad cae notablemente, según advierte el propio autor.
- Cobertura normativa limitada a cinco normas: las normas infralegales y la jurisprudencia no forman parte de la base de recuperación.
- El modelo no sustituye un dictamen profesional; el autor lo indica explícitamente y el formulario de acceso incluye una casilla de aceptación de esta condición.
- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucinación: presente en cualquier modelo generativo; el entrenamiento con fragmentos incorrectos mezclados mitiga parcialmente el problema, pero no lo elimina. Las citas deben verificarse contra el texto vigente.
- Limitación idiomática: el modelo está orientado a portugués de Brasil; su rendimiento en otros idiomas no está documentado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el acceso al repositorio está restringido mediante formulario (gated), con recogida de datos personales bajo LGPD y evaluación del uso previsto por parte de Mangaba AI.
- El corpus se recolectó el 19/10/2026; cambios normativos posteriores no estarán reflejados.
- El modo thinking de Qwen3 debe desactivarse en la configuración recomendada; no se documenta el comportamiento con thinking activado.
- No hay datos publicados sobre latencia, throughput ni comportamiento en producción a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mangaba-ai/Mangaba-Financeiro-8B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Embeddings bge-m3 (BAAI): https://huggingface.co/BAAI/bge-m3
- Re-ranker bge-reranker-v2-m3 (BAAI): https://huggingface.co/BAAI/bge-reranker-v2-m3
- Texto vigente de las normas (Planalto): https://www.planalto.gov.br
- Ley 4.595/1964 (SFN): https://www.planalto.gov.br/ccivil_03/leis/l4595.htm
- Ley 12.865/2013 (arreglos de pago): https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12865.htm
- LC 105/2001 (secreto bancario): https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp105.htm
- Ley 9.613/1998 (lavado de dinero): https://www.planalto.gov.br/ccivil_03/leis/l9613.htm
- Ley 14.286/2021 (cambio): https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14286.htm
