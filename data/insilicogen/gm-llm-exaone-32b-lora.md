# insilicogen/GM-LLM-EXAONE-32B-LoRA

## Resumen

GM-LLM (EXAONE-32B) es un conjunto de adaptadores LoRA publicados por insilicogen que especializan el modelo LGAI-EXAONE/EXAONE-3.5-32B-Instruct en la interpretación de variantes genéticas asociadas a cáncer, apoyándose en literatura científica recuperada como contexto. No se trata de un modelo completo, sino de dos adaptadores PEFT que deben cargarse sobre el modelo base de 32.000 millones de parámetros desarrollado por LG AI Research. El repositorio ocupa 0,2 GB, coherente con pesos LoRA de rango 16.

El problema que aborda es concreto: dado un bloque de anotación ClinVar y un conjunto de documentos de referencia, el modelo debe producir una interpretación de la variante con cuerpo de respuesta y citas explícitas a los documentos empleados. El entrenamiento sigue un esquema en dos etapas: un ajuste fino supervisado sobre 42.918 pares de pregunta-respuesta extraídos de literatura oncológica y, después, un ajuste aumentado por recuperación (RAFT) sobre 1.438 ítems con documentos de contexto.

Su relevancia actual radica en que demuestra que un modelo abierto de 32B, con adaptadores de bajo rango, puede aproximarse al rendimiento de modelos frontera en una tarea de nicho altamente regulada, y que el ajuste con recuperación (RAFT) mejora la fidelidad de las citas. Los resultados publicados por los autores muestran una subida del score de corrección evaluado por LLM-juez de 0,578 a 0,926 con documentos de referencia en el contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso EXAONE-3.5-32B-Instruct; rango 16, alpha 32, dropout 0,2, módulos de atención y MLP |
| Parametros totales | 32B en el modelo base; adaptadores LoRA de rango 16 (tamaño del repo: 0,2 GB) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens en la etapa FT; 4.096 tokens en la etapa RAFT (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | EXAONE License (license: other, license_name: exaone), heredada del modelo base |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA en subcarpetas `ft_adapter/` y `raft_adapter/`) |

## Arquitectura y entrenamiento

El modelo base es EXAONE-3.5-32B-Instruct, un transformer denso de 32.000 millones de parámetros de LG AI Research. Sobre él se aplican dos adaptadores LoRA independientes con idéntica configuración (rango 16, alpha 32, dropout 0,2, sobre proyecciones de atención y MLP, learning rate 5e-5). La primera etapa (FT) entrena una época con longitud máxima de 1.024 tokens sobre el dataset `insilicogen/llm-mutation-ft-qa`, compuesto por 42.918 pares de pregunta-respuesta derivados de literatura oncológica. La segunda etapa (RAFT) entrena seis épocas con longitud máxima de 4.096 tokens sobre 1.438 ítems del split `raft_train` de `insilicogen/llm-mutation-variant-qa`, que incluyen documentos de contexto junto a la pregunta y la anotación ClinVar.

Detalle crítico de implementación: el adaptador RAFT se entrenó sobre el modelo base con el adaptador FT ya fusionado, por lo que el orden de carga es obligatorio (primero `ft_adapter` con `merge_and_unload()`, después `raft_adapter`). La revisión del modelo base fijada es `3d27aab477c042df2e174d36eea47b77c8871ef0`. La innovación metodológica no está en la arquitectura, sino en el pipeline de especialización por etapas (FT → RAFT) y en el formato de salida forzado: cuerpo de respuesta entre etiquetas `<body>` y citas entre `<citation>` con referencias del tipo `(Reference: doc_N, …)`, lo que permite verificar la fundamentación documental de cada afirmación.

## Capacidades

- Interpretación de variantes genéticas asociadas a cáncer a partir de anotaciones ClinVar y documentos de literatura científica.
- Generación de respuestas fundamentadas con citas explícitas a los documentos de contexto (`doc_N`), lo que facilita la auditabilidad.
- Seguimiento de instrucciones mediante plantilla de chat con rol de sistema, pregunta de usuario y bloque de contexto documental.
- Razonamiento sobre texto biomédico en inglés y coreano; la salida se produce en coreano según la model card.
- Capacidades heredadas del modelo base EXAONE-3.5-32B-Instruct (generación de texto, razonamiento, código), aunque el ajuste está orientado exclusivamente al dominio genómico.
- No se documenta soporte específico de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.
- No se documenta capacidad de visión ni de audio.

## Casos de uso

- Interpretación asistida de variantes en paneles oncológicos: el modelo recibe la anotación ClinVar de la variante y cinco documentos de referencia, y devuelve una interpretación con citas verificables; adecuado porque el formato de salida obliga a justificar cada afirmación con un documento concreto.
- Revisión de informes de genómica clínica: como primera pasada para redactar borradores de interpretación que un genetista revisa después; el RAFT sobre 4.096 tokens permite incluir varios fragmentos de literatura en el mismo contexto.
- Búsqueda documental aumentada en laboratorios: integrado en un pipeline RAG con recuperación BM25 o densa, genera respuestas citadas sobre literatura oncológica; los autores reportan un score de corrección de 0,760 con recuperación real BM25 sobre 127 ítems, lo que da una expectativa realista de rendimiento en este escenario.
- Curación de bases de conocimiento de variantes: uso del adaptador FT para generar pares pregunta-respuesta de alta calidad a partir de literatura, que luego se revisan y se incorporan a bases internas.
- Formación y documentación interna: generación de explicaciones didácticas sobre variantes concretas con referencias bibliográficas, útil para equipos de bioinformática que necesitan contexto rápido.
- Evaluación comparativa de pipelines RAG: al publicar resultados con documentos gold y con recuperación real, sirve como referencia para medir la degradación que introduce la recuperación imperfecta en tareas biomédicas.
- Investigación en especialización de dominio: los adaptadores son un caso de estudio reproducible del esquema FT → RAFT sobre un modelo abierto de 32B, reutilizable como línea base en experimentos de ajuste por etapas.

## Benchmarks y rendimiento

Conjunto de evaluación de 548 ítems, con anotación ClinVar en la entrada. La corrección es un score de LLM-juez (correcto 1 / parcial 0,5 / incorrecto 0) frente a respuestas de referencia.

| Metrica | Modelo base | GM-LLM |
|---|---|---|
| Corrección, juez Gemma4 | 0,578 | 0,926 |
| Corrección, juez Claude Sonnet 5.5 | 0,502 | 0,651 |
| Corrección con recuperación real (BM25, 127 ítems), juez Gemma4 | no disponible | 0,760 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La diferencia entre jueces (0,926 frente a 0,651) sugiere una sensibilidad notable al evaluador que conviene tener en cuenta al interpretar las cifras.

## Requisitos de hardware

- El modelo base tiene 32.000 millones de parámetros; en bfloat16 requiere aproximadamente 64 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV.
- GPU recomendadas para bfloat16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× A100 40 GB con `device_map="auto"`).
- En cuantización de 8 bits cabe en una A100 40 GB o en una RTX 6000 Ada 48 GB; en 4 bits puede caber en una RTX 4090 24 GB, aunque con margen ajustado y degradación potencial en una tarea sensible a la fidelidad.
- No cabe en GPU de consumo de 16 GB o menos en ninguna cuantización razonable.
- Despliegue: el código de la model card usa `transformers` con `PeftModel` y `merge_and_unload()`; los adaptadores son compatibles con cualquier stack que soporte PEFT (vLLM y TGI requieren fusionar los adaptadores en un checkpoint completo antes de servir).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GM-LLM-EXAONE-32B-LoRA | 32B (base) + LoRA r16 | 4.096 tokens en entrenamiento RAFT | Interpretación de variantes genéticas oncológicas con citas | EXAONE License | Hugging Face (adaptadores PEFT) |
| LGAI-EXAONE-3.5-32B-Instruct | 32B | no disponible en esta ficha | Propósito general, multilingüe (ko/en) | EXAONE License | Hugging Face |
| Modelos biomédicos abiertos de tamaño medio (por ejemplo, variantes de Llama o Qwen ajustadas en dominio clínico) | 7B-70B según variante | variable | Dominio médico general, no específicamente variantes oncológicas | variable según base | Hugging Face |

La comparación directa con alternativas es limitada porque no se dispone en la información proporcionada de resultados de otros modelos sobre el mismo conjunto de evaluación de 548 ítems. La referencia más fiable es la del propio modelo base, que pasa de 0,578 a 0,926 con el juez Gemma4 en la misma tarea.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: no es un dispositivo médico y no debe emplearse para decisiones clínicas autónomas; las salidas requieren revisión por expertos cualificados.
- La evaluación principal se hizo con documentos gold en el contexto; con recuperación real el rendimiento cae (0,760 frente a 0,926 con juez Gemma4), por lo que en producción la calidad depende críticamente del recuperador.
- Los errores en la anotación ClinVar de entrada se propagan directamente a la respuesta.
- La salida se genera en coreano según la model card, lo que limita su uso directo en entornos clínicos en castellano sin una etapa adicional de traducción o ajuste.
- Idiomas soportados limitados a coreano e inglés; no se documenta cobertura de otros idiomas.
- Riesgo de alucinación en citas: aunque el formato obliga a referenciar `doc_N`, no se documenta una verificación automática de que la cita respalde la afirmación.
- La licencia EXAONE impone restricciones de uso comercial y políticas de uso heredadas del modelo base; es obligatorio revisar el LICENSE antes de cualquier despliegue productivo.
- El orden de carga de los adaptadores es obligatorio (FT fusionado antes de RAFT); cargarlos de otra forma invalida el comportamiento esperado.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/insilicogen/GM-LLM-EXAONE-32B-LoRA
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-32B-Instruct/blob/main/LICENSE
- Dataset de ajuste fino: https://huggingface.co/datasets/insilicogen/llm-mutation-ft-qa
- Dataset de RAFT: https://huggingface.co/datasets/insilicogen/llm-mutation-variant-qa
- Paper de referencia: Lee Y. et al., "Staged Domain Specialization of Open-Source Large Language Models for Cancer-Related Genetic Variant Interpretation", *Diagnostics* (MDPI), en revisión, 2026 (sin enlace disponible)
