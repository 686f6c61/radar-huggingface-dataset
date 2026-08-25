# ajaxdavis/donto-qwen3.8-27b-predicate-extractor

## Resumen

Donto-Qwen3.8-27B Predicate Extractor es un adaptador LoRA (PEFT) desarrollado por ajaxdavis que convierte el modelo base Qwen/Qwen3.8-27B en un extractor especializado de predicados para la construcción de grafos de conocimiento. El objetivo es transformar fragmentos cortos de texto en inglés en objetos de hecho estructurados con campos `s` (sujeto), `p` (predicado), `o` (objeto), `c` (confianza) y `h` (hipotético), emitidos exclusivamente como una llamada de herramienta `submit_facts`. El adaptador se enmarca dentro del sistema Donto, un sustrato de afirmaciones que preserva contradicciones y difiere la alineación ontológica a fases posteriores.

El modelo se entrenó con QLoRA (4-bit NF4, BF16, rank 16) sobre una única NVIDIA RTX 3090 de 24 GB, con el objetivo de recuperar relaciones atómicas sujeto-predicado-objeto, preservar atribución, negación, modalidad y desacuerdo, y detenerse limpiamente cuando la tarea de extracción acotada se agota. El adaptador está diseñado para contextos cortos de 4096 tokens y produce exclusivamente una llamada de herramienta validada, sin prosa adicional.

La relevancia de este modelo radica en su enfoque experimental para la extracción de hechos en abundancia: en lugar de forzar un esquema ontológico fijo, genera predicados libres y concisos que un sistema mayor puede comparar, citar, alinear y reordenar. Los resultados declarados por el autor alcanzan un recall exacto del 89,21 % y una precisión exacta del 89,44 % sobre un conjunto de validación sintético de 100 documentos con 5.338 hechos objetivo, con una tasa de éxito del 100 % en llamadas estructuradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.8-27B (base densa multimodal, arquitectura híbrida con atención parcial) |
| Parametros totales | Adaptador: 16 de rango (rank 16); modelo base: 27 mil millones (no duplicados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (entrenado y servido) |
| Tipos de cuantizacion | Entrenado con 4-bit NF4 (QLoRA), inferencia en BF16 o cuantizaciones del modelo base |
| Idiomas soportados | Inglés (solo) |
| Licencia | Apache-2.0 |
| Formato de pesos | Adapter safetensors (PEFT), compatible con el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros que usa una arquitectura híbrida de atención: de sus 64 capas, solo 16 ejecutan atención completa (con intervalo `full_attention_interval: 4`), mientras que las restantes emplean atención lineal o aproximada. Este diseño reduce el coste computacional en contextos largos, aunque el adaptador se entrena y sirve con un contexto de 4096 tokens. El adaptador modifica el comportamiento del modelo, no su conocimiento factual subyacente.

El entrenamiento se realizó con QLoRA en 4-bit NF4 con cómputo en BF16 y rango 16, sobre un único RTX 3090 de 24 GB. El dataset de entrenamiento es `ajaxdavis/donto-qwen3.8-27b-predicate-extraction-data`, un conjunto sintético de fragmentos de documento en inglés. El adaptador se fijó a la revisión exacta `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo base. No se aplicó RLHF ni DPO; el entrenamiento se enfocó en producir llamadas de herramienta estructuradas y válidas, con anclajes desactivados y sin modo de razonamiento explícito.

## Capacidades

- Extracción de relaciones atómicas sujeto–predicado–objeto a partir de fragmentos de texto en inglés.
- Preservación de atribución, negación, modalidad, cualificación y desacuerdo en los hechos extraídos.
- Distinción entre afirmaciones directas (licenciadas por la fuente) y afirmaciones derivadas, interpretativas o hipotéticas (marcadas con `h: true`).
- Generación de predicados libres y concisos en camelCase, sin forzar una ontología fija.
- Emisión de una única llamada de herramienta `submit_facts` con JSON validado, sin prosa adicional.
- Soporte de señal de continuación (`more_supported_facts`) para tareas de extracción acotadas.
- No incluye capacidades de visión, audio ni otras modalidades; solo texto.

## Casos de uso

- Construcción de grafos de conocimiento a partir de documentos: el modelo extrae hechos atómicos que pueden alimentar un grafo RDF o una base de datos de grafos, permitiendo consultas posteriores sobre las relaciones detectadas.
- Enriquecimiento de pipelines de RAG (retrieval-augmented generation): los hechos extraídos sirven como índice estructurado para recuperar información relevante en sistemas de pregunta-respuesta sobre colecciones de documentos.
- Análisis de contratos y documentos legales: identifica cláusulas, obligaciones y relaciones entre entidades, preservando matices de negación y modalidad para un análisis contractual preciso.
- Monitorización de noticias y redes sociales: extrae afirmaciones y opiniones con atribución y desacuerdo, permitiendo rastrear posturas encontradas sobre un mismo tema.
- Integración en flujos de extracción de información para investigación biomédica: recupera relaciones entre entidades (proteínas, fármacos, enfermedades) con confianza asociada, útil para bases de conocimiento de literatura científica.
- Generación de resúmenes estructurados de actas o informes: convierte párrafos densos en una lista de hechos compactos y verificables, facilitando la revisión y el análisis automático.
- Sistemas de atención al cliente con conocimiento de dominio: al extraer hechos de manuales o guías, se pueden alimentar respuestas automáticas con base factual y trazable.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en su model card, sobre el conjunto de pruebas `Graph-First Gold 100` (100 documentos sintéticos, 5.338 hechos objetivo, 2.718 llamadas forzadas):

| Métrica | Valor |
|---|---|
| Exact fact recall | 0,8921 |
| Exact fact precision | 0,8944 |
| Structured tool-call success | 1,0000 |

No se han publicado comparaciones con otros modelos de extracción de predicados en la información disponible. Los resultados son declarados por el autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- El adaptador LoRA es ligero (tamaño del repositorio 3,5 GB), pero requiere cargar el modelo base Qwen3.8-27B para inferencia.
- Para el modelo base en BF16 (27 mil millones de parámetros) se necesitan aproximadamente 54 GB de VRAM, por lo que se requieren GPUs profesionales como A100 (80 GB) o H100 (80 GB).
- Con cuantización 4-bit (por ejemplo, AWQ o GPTQ) el modelo base puede caber en una GPU de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB), siempre que se gestione la memoria con técnicas de offload.
- El adaptador se puede integrar en frameworks como vLLM, Hugging Face PEFT, llama.cpp (con conversión a GGUF) y TGI, siempre que se combine con el modelo base correspondiente.
- El entrenamiento se realizó en una única RTX 3090 de 24 GB con QLoRA, lo que indica que la inferencia en ese hardware es factible, aunque con latencia mayor que en GPUs profesionales.
- No se dispone de datos de throughput o latencia específicos para este adaptador; el rendimiento depende de la implementación de inferencia del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de extracción de predicados con los que comparar directamente. El modelo base Qwen3.8-27B es un LLM general, y este adaptador lo convierte en una herramienta especializada; no se han publicado comparativas con otros extractores de relaciones (por ejemplo, REBEL o adaptadores similares). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo experimental de investigación, no un asistente general; no se debe usar para tareas de conversación abierta.
- El adaptador no mejora el conocimiento factual del modelo base; solo cambia su comportamiento de salida.
- La confianza (`c`) emitida no es una probabilidad calibrada; no debe interpretarse como una medida de certeza estadística.
- El contexto de trabajo está limitado a 4096 tokens; para documentos más largos se requiere segmentación previa.
- Solo soporta inglés; no se ha evaluado su rendimiento en otros idiomas.
- La extracción de hechos en mundo abierto no está resuelta; el modelo puede alucinar o perder información en contextos complejos o con contradicciones.
- El entrenamiento se realizó con datos sintéticos, lo que puede limitar la generalización a documentos reales.
- El adaptador no incluye la torre de visión del modelo base; no se ha entrenado ni evaluado en tareas multimodales.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ha verificado el rendimiento en producción; se recomienda validar en el dominio objetivo.

## Enlaces

- [Repositorio del adaptador en Hugging Face](https://huggingface.co/ajaxdavis/donto-qwen3.8-27b-predicate-extractor)
- [Modelo base Qwen3.8-27B en Hugging Face](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio GitHub de Qwen3.8 (QwenLM)](https://github.com/QwenLM/Qwen3.8)
- [Repositorio GitHub de Qwen3.8-27B (AlibabaCloud-Official)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Página de Qwen3.8-27B en QwenCloud](https://www.qwencloud.com/models/qwen3.8-27b)
- [Guía de despliegue con vLLM Ascend](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html)
- [Dataset de entrenamiento (ajaxdavis/donto-qwen3.8-27b-predicate-extraction-data)](https://huggingface.co/datasets/ajaxdavis/donto-qwen3.8-27b-predicate-extraction-data)
