# mangaba-ai/Mangaba-Licitacoes-8B

## Resumen

Mangaba Licitações 8B es un adaptador LoRA desarrollado por Mangaba AI sobre el modelo base Qwen/Qwen3-8B, orientado a la respuesta de preguntas sobre legislación brasileña de contratación pública. Cubre la Lei 14.133/2021 (Nova Lei de Licitações), la Lei das Estatais (13.303/2016), la Lei de Concessões (8.987/1995) y la Lei das PPPs (11.079/2004), con texto vigente recogido del Portal do Planalto el 19/10/2026. El modelo responde en portugués de Brasil citando artículo y norma a partir de fragmentos recuperados mediante búsqueda.

El adaptador no se distribuye como modelo autónomo: requiere el Qwen3-8B subyacente y un pipeline RAG con el corpus incluido en `busca/corpus/` (artículos y embeddings bge-m3). La evaluación publicada por el autor, con 60 preguntas fuera de entrenamiento y Mangaba Titan 122B como juez, muestra una mejora sustancial frente al Qwen3-8B con la misma búsqueda: 73 % de respuestas con nota 5 de contenido frente a 52 %, y 72 % de respuestas correctas con el artículo exacto frente a 35 %.

El acceso está sujeto a un formulario de registro (gated model) con campos de identificación profesional y declaración de uso lícito. El repositorio pesa 0,4 GB, coherente con un adaptador LoRA de rango 32 sobre un modelo de 8B parámetros. La licencia declarada es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del Qwen3-8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués de Brasil (pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parámetros. El LoRA emplea rango 32 y alpha 64 sobre todas las proyecciones lineales del modelo base. El entrenamiento se estructuró en dos etapas: la primera, de 3 épocas, con pares pregunta-respuesta generados por artículo y recuperación del texto de cada artículo por su número; la segunda, de 1 época, con la pregunta acompañada de fragmentos recuperados, mezclando el dispositivo correcto con fragmentos similares, para enseñar al modelo a responder a partir de los fragmentos y citar la etiqueta exacta. El cómputo se realizó en 2× NVIDIA L40S en servidores de Mangaba en Brasil.

La innovación principal no está en la arquitectura sino en el diseño del dato de entrenamiento: el modelo aprende a condicionar la respuesta al contexto recuperado y a citar el artículo y la norma exactos, lo que explica que la tasa de citación correcta del artículo suba del 7 % (Qwen3-8B sin búsqueda) al 87 % con el adaptador. La búsqueda se apoya en bge-m3 para los embeddings y bge-reranker-v2-m3 (BAAI) para el reordenamiento.

## Capacidades

- Generación de texto conversacional en portugués de Brasil sobre legislación de licitaciones y contratos públicos.
- Respuesta fundamentada en fragmentos recuperados (RAG), citando artículo y norma.
- Citación exacta de la etiqueta del artículo dentro del contexto proporcionado.
- Cobertura de cuatro cuerpos normativos: Lei 14.133/2021, Lei 13.303/2016, Lei 8.987/1995 y Lei 11.079/2004.
- Modo sin razonamiento explícito recomendado en el despliegue (`enable_thinking: false`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al portugués (tag `pt`).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia a pregoeiros y agentes de contratación: el modelo responde consultas sobre procedimientos de licitación citando el artículo aplicable de la Lei 14.133/2021, lo que permite verificar la base legal de cada decisión dentro del expediente.
- Soporte a proveedores del gobierno: un proveedor puede consultar requisitos de habilitación, plazos o criterios de adjudicación y obtener la referencia normativa exacta para preparar su propuesta.
- Asesoría a abogados públicos: consulta rápida sobre régimen de contratos administrativos, con citación de norma y artículo que sirve como punto de partida para el dictamen, sin sustituirlo.
- Atención al ciudadano en portales de transparencia: respuestas automatizadas sobre el marco legal de compras públicas, condicionadas a que el recuperador devuelva los fragmentos pertinentes.
- Formación interna de equipos de contratación: generación de preguntas y respuestas de estudio ancladas al texto vigente de las normas cubiertas.
- Construcción de un asistente RAG sectorial: el corpus y los embeddings bge-m3 incluidos en `busca/corpus/` permiten montar el pipeline de recuperación completo con vLLM y el adaptador como módulo LoRA.
- Verificación de citas normativas en documentos: dado un fragmento de un pliego o contrato, comprobar a qué artículo y norma corresponde según el corpus.

## Benchmarks y rendimiento

Evaluación del autor con 60 preguntas fuera del conjunto de entrenamiento y Mangaba Titan 122B como juez:

| Métrica | Qwen3-8B sin búsqueda | Qwen3-8B + búsqueda | Mangaba Licitações 8B + búsqueda |
|---|---|---|---|
| Respuesta correcta (nota 5 de contenido) | 0 % | 52 % | 73 % |
| Correcta y con el artículo exacto | 0 % | 35 % | 72 % |
| Cita el artículo correcto | 7 % | 92 % | 87 % |
| Cita la norma correcta | 35 % | 97 % | 95 % |
| Nota media de contenido (1–5) | 1,07 | 3,53 | 4,13 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo de 8B parámetros, requiere el mismo espacio que Qwen3-8B más el adaptador LoRA (0,4 GB en disco).
- GPU recomendadas: el autor entrenó en 2× NVIDIA L40S; para inferencia se declara despliegue con vLLM en GPU.
- Cabe en GPU de consumo: no confirmado en la información proporcionada.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules licitacoes=mangaba-ai/Mangaba-Licitacoes-8B` y `chat_template_kwargs={"enable_thinking": false}`. Otras opciones (llama.cpp, Ollama, TGI) no están documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Acceso |
|---|---|---|---|---|---|
| Mangaba Licitações 8B | 8B (base) + LoRA | no disponible | Legislación brasileña de licitaciones con RAG | Apache-2.0 | Gated (registro) |
| Qwen/Qwen3-8B | 8B | no disponible | Modelo generalista multilingüe | Apache-2.0 | Abierto |
| Mangaba Titan 122B | 122B | no disponible | Modelo generalista de Mangaba AI, usado como juez | no disponible | no disponible |

La comparación relevante es con el propio Qwen3-8B: el adaptador mejora la tasa de respuesta correcta del 52 % al 73 % y la citación exacta del artículo del 35 % al 72 % cuando ambos operan con la misma búsqueda. No se dispone de datos de otros adaptadores especializados en legislación brasileña de licitaciones en la información proporcionada.

## Limitaciones y advertencias

- Dependencia crítica del recuperador: sin el fragmento correcto en la búsqueda, la calidad cae de forma acusada, según reconoce el autor.
- Cobertura normativa limitada a cuatro leyes; las normas infralegales y la jurisprudencia no forman parte de la base.
- El texto normativo se recogió el 19/10/2026; reformas posteriores no están reflejadas.
- Solo responde en portugués de Brasil; no se documenta soporte de otros idiomas.
- No sustituye el parecer profesional de un abogado o de un órgano de contratación.
- Riesgo de alucinación en citas cuando el contexto recuperado es ambiguo o incompleto, pese a la mejora en la tasa de citación exacta.
- Acceso restringido mediante formulario con datos personales (nombre, empresa, cargo, correo, WhatsApp, país, uso previsto), tratados conforme a la LGPD.
- La licencia Apache-2.0 se hereda del modelo base; conviene verificar las condiciones del corpus normativo incluido en `busca/corpus/` para uso comercial.
- No se han publicado datos de sesgos, cuantizaciones soportadas ni rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mangaba-ai/Mangaba-Licitacoes-8B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Embeddings bge-m3 (BAAI): https://huggingface.co/BAAI/bge-m3
- Reranker bge-reranker-v2-m3 (BAAI): https://huggingface.co/BAAI/bge-reranker-v2-m3
- Lei 14.133/2021 (Planalto): https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm
- Lei 13.303/2016 (Planalto): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13303.htm
- Lei 8.987/1995 (Planalto): https://www.planalto.gov.br/ccivil_03/leis/l8987cons.htm
- Lei 11.079/2004 (Planalto): https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11079.htm
