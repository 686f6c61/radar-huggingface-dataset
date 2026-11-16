# insilicogen/GM-LLM-Kanana-30B-LoRA

## Resumen

GM-LLM (Kanana-30B) es un conjunto de adaptadores LoRA publicados por Insilicogen que especializan el modelo base `kakaocorp/kanana-2-30b-a3b-instruct` en la interpretación de variantes genéticas asociadas a cáncer, con respuestas fundamentadas en literatura científica y anotaciones ClinVar. El modelo resuelve un problema concreto: traducir anotaciones genómicas y documentación biomédica en interpretaciones estructuradas y citadas, una tarea que los modelos generalistas abordan con baja fiabilidad.

El proyecto sigue una especialización por etapas: primero un ajuste fino supervisado (FT) sobre 42.918 pares de pregunta-respuesta extraídos de literatura oncológica, y después un ajuste fino aumentado por recuperación (RAFT) sobre 1.438 elementos con documentos de contexto y anotaciones de variantes. El resultado es un adaptador que se carga sobre el modelo base y que genera respuestas en coreano con formato `<body> … </body> <citation>(Reference: doc_N, …)</citation>`.

El modelo base Kanana-2-30B es un transformer de tipo Mixture of Experts con 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token (según la nomenclatura `a3b` del identificador); los adaptadores LoRA ocupan solo 0,2 GB. La relevancia actual reside en que demuestra que un ajuste LoRA en dos fases puede elevar la corrección de un modelo abierto en una tarea clínica especializada de 0,678 a 0,939 según un juez automático, con un coste de entrenamiento y almacenamiento muy contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE `kakaocorp/kanana-2-30b-a3b-instruct` |
| Parametros totales | 30B en el modelo base; adaptadores LoRA de rango 16 (tamano del repo: 0,2 GB) |
| Parametros activos | ~3B en el modelo base (denominacion `a3b`); no disponible el desglose exacto |
| Longitud de contexto | 4.096 tokens en entrenamiento RAFT; 1.024 en FT; contexto maximo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | coreano (ko), ingles (en); las respuestas se generan en coreano |
| Licencia | kanana-license (licencia del modelo base, enlazada en la model card) |
| Formato de pesos | safetensors (adaptadores PEFT); el modelo base en el formato que publique Kakao |

## Arquitectura y entrenamiento

El modelo es un ajuste por adaptadores de bajo rango sobre un transformer con mezcla de expertos (MoE) de 30B parámetros totales y ~3B activos, desarrollado por Kakao (Kanana-2). Los adaptadores LoRA usan rango 16, alpha 32, dropout 0,2 y se aplican tanto a las capas de atención como a las MLP. El entrenamiento se realizó en dos etapas encadenadas: la primera (FT) con learning rate 5e-5, 1 época y longitud máxima 1.024 sobre el dataset `insilicogen/llm-mutation-ft-qa` (42.918 QA de literatura oncológica); la segunda (RAFT) con learning rate 5e-5, 6 épocas y longitud máxima 4.096 sobre `insilicogen/llm-mutation-variant-qa` (partición `raft_train`, 1.438 elementos).

La innovación principal es la combinación de ajuste supervisado con RAFT: el adaptador de la segunda etapa se entrenó sobre el modelo base con el adaptador FT ya fusionado, de modo que debe cargarse en ese orden (`ft_adapter` con `merge_and_unload()`, después `raft_adapter`). El formato de salida fuerza una respuesta en dos bloques, cuerpo y cita de documentos, lo que permite verificar la trazabilidad de cada afirmación. No se documenta el uso de RLHF ni DPO; el ajuste es puramente supervisado y aumentado por recuperación.

## Capacidades

- Interpretación de variantes genéticas relacionadas con cáncer a partir de anotaciones ClinVar incluidas en el prompt.
- Generación de respuestas fundamentadas en documentos: el modelo cita las fuentes con el formato `(Reference: doc_N, …)`.
- Formato de salida estructurado y verificable (`<body>` + `<citation>`), apto para postprocesado automático.
- Comprensión de literatura biomédica en inglés y generación de respuestas en coreano (escenario bilingüe ko/en).
- Razonamiento sobre contexto documental largo: entrenado con ventanas de hasta 4.096 tokens que incluyen pregunta, anotación de variante y hasta cinco documentos.
- Integración en pipelines RAG: el adaptador RAFT está diseñado para recibir documentos recuperados (evaluado con BM25 sobre 127 elementos).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- **Apoyo a la interpretación de variantes en laboratorio de genómica clínica**: el modelo recibe la anotación ClinVar de una variante y un conjunto de documentos de referencia, y devuelve una interpretación estructurada con citas. Es adecuado porque el adaptador RAFT se entrenó específicamente con ese formato de entrada (pregunta + anotación + cinco documentos) y produce salida verificable.
- **Generación de borradores de informes de variantes**: a partir de la evidencia recuperada, el modelo redacta el cuerpo del informe en coreano con referencias explícitas a los documentos, lo que reduce el tiempo de redacción del personal especializado y facilita la revisión posterior.
- **Sistema RAG interno de conocimiento oncológico**: integrado con un recuperador (por ejemplo BM25 o embeddings) sobre la base documental del hospital o del laboratorio, el modelo responde consultas de genetistas con soporte documental; la evaluación con recuperación real (BM25) reporta 0,839 de corrección con juez Gemma4.
- **Triaje y priorización de variantes**: el modelo puede clasificar y resumir la evidencia disponible para cada variante de una lista, permitiendo que los expertos se concentren en los casos ambiguos; requiere revisión humana obligatoria por las limitaciones declaradas.
- **Formación y consulta de residentes**: como asistente de consulta sobre literatura oncológica (42.918 QA de entrenamiento FT), útil para resolver dudas sobre interpretación de variantes con respuestas citadas, siempre en modo de apoyo y no de decisión.
- **Investigación en especialización de dominios**: el par de adaptadores FT + RAFT sirve como referencia metodológica reproducible para equipos que quieran especializar modelos abiertos en dominios científicos con presupuesto reducido (0,2 GB de adaptadores, LoRA r16).

## Benchmarks y rendimiento

Evaluación sobre un conjunto de 548 elementos con anotación ClinVar en la entrada:

| Metrica | Modelo base | GM-LLM |
|---|---|---|
| Correccion, juez Gemma4 | 0,678 | 0,939 |
| Correccion, juez Claude Sonnet 5.5 | 0,503 | 0,651 |
| Correccion con recuperacion real (BM25, 127 items), juez Gemma4 | — | 0,839 |

La corrección es una puntuación de juez LLM (correcto 1 / parcial 0,5 / incorrecto 0) frente a respuestas de referencia. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- **VRAM para inferencia**: el modelo base tiene 30B parámetros; en bfloat16 requiere aproximadamente 60 GB de VRAM, en cuantización de 8 bits unos 30 GB y en 4 bits unos 15-18 GB (estimaciones según tamaño, no publicadas por el autor). Los adaptadores LoRA añaden solo 0,2 GB.
- **GPU recomendadas**: A100 80 GB o H100 para bfloat16 sin cuantizar; A100 40 GB o L40S con cuantización de 8 bits; RTX 4090 (24 GB) viable con cuantización de 4 bits.
- **GPU de consumo**: sí cabe en RTX 4090 y RTX 3090 con cuantización de 4 bits, con margen limitado para contextos de 4.096 tokens.
- **Despliegue**: la model card documenta `transformers` + `peft` (carga secuencial de `ft_adapter` fusionado y después `raft_adapter`). No se documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI; la fusión de adaptadores con `merge_and_unload()` permite exportar un modelo único compatible con servidores estándar, pero no está validado por el autor.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GM-LLM (Kanana-30B) LoRA | 30B base (~3B activos) + LoRA r16 | 4.096 en entrenamiento | Interpretacion de variantes de cancer con RAFT | kanana-license | Hugging Face, adaptadores PEFT |
| kakaocorp/kanana-2-30b-a3b-instruct | 30B (~3B activos) | no disponible | Modelo generalista coreano/ingles | kanana-license | Hugging Face |
| Modelos biomedicos generalistas de 7B-13B | 7B-13B | 4K-32K tipico | Dominio medico general, sin formato RAFT especifico | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores de interpretación de variantes en la información proporcionada; la comparación cuantitativa directa con alternativas equivalentes no está disponible.

## Limitaciones y advertencias

- **Uso exclusivamente de investigación**: no es un dispositivo médico y no debe emplearse para decisiones clínicas autónomas; las salidas requieren revisión por expertos cualificados.
- **Dependencia de la calidad de la recuperación**: evaluado principalmente con documentos de referencia correctos; con recuperación real la corrección baja de 0,939 a 0,839 (juez Gemma4).
- **Propagación de errores de entrada**: si la anotación ClinVar es incorrecta, el error se propaga a la respuesta.
- **Idioma**: las respuestas se generan en coreano; el uso en castellano no está soportado ni evaluado. El modelo base cubre coreano e inglés.
- **Riesgo de alucinación**: aunque el formato de citas facilita la verificación, no se documenta una tasa de citas incorrectas ni de afirmaciones sin respaldo; debe validarse en producción.
- **Licencia**: sujeta a la kanana-license del modelo base; es necesario revisar sus términos para uso comercial antes de desplegarlo.
- **Carga de adaptadores**: el orden es obligatorio (FT fusionado primero, RAFT después); cargarlos en otro orden o por separado produce resultados incorrectos.
- **Sesgos**: no se documentan análisis de sesgo demográfico ni de representatividad de la literatura utilizada; la evidencia oncológica puede estar sesgada hacia poblaciones y variantes sobrerrepresentadas en las bases de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/insilicogen/GM-LLM-Kanana-30B-LoRA
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-30b-a3b-instruct
- Licencia del modelo base: https://huggingface.co/kakaocorp/kanana-2-30b-a3b-instruct/blob/main/LICENSE
- Dataset de ajuste fino: https://huggingface.co/datasets/insilicogen/llm-mutation-ft-qa
- Dataset de RAFT: https://huggingface.co/datasets/insilicogen/llm-mutation-variant-qa
- Articulo de referencia: Lee Y. et al., "Staged Domain Specialization of Open-Source Large Language Models for Cancer-Related Genetic Variant Interpretation", *Diagnostics* (MDPI), en revision, 2026 (sin DOI disponible)
