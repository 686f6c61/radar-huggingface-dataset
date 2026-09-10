# OpceanAI/PASITA

## Resumen

PASITA v1 es un modelo de lenguaje decoder-only de 88.099.584 parámetros (unos 88 M) desarrollado por OpceanAI y entrenado íntegramente desde cero, sin partir de ningún modelo base. No es un asistente conversacional: es un compilador de formato. Su única tarea es convertir texto plano en Markdown válido (GFM) preservando fielmente la información de origen, sin añadir contenido nuevo ni reformular datos.

El modelo responde a una necesidad muy concreta en pipelines de datos: el post-procesado de salidas de OCR, HTML pegado, correos y notas de reuniones, y la preparación de documentos para recuperación aumentada (RAG), donde la estructura importa tanto como el contenido. Su tamaño reducido (176 MB en safetensors, bfloat16) permite ejecutarlo en CPU o en cualquier GPU de consumo, algo relevante para procesado por lotes a gran escala o despliegues en el borde con requisitos de privacidad.

Técnicamente es un `LlamaForCausalLM` denso (sin MoE) de 12 capas, dimensión oculta 768, FFN de 2048 con SwiGLU, atención GQA con 12 cabezas de consulta y 4 de clave/valor, y una ventana de contexto de 2048 tokens. Se distribuye bajo licencia Apache 2.0 con pesos safetensors y un tokenizador BPE propio de 16k. El autor declara métricas muy altas en su banco de pruebas interno, pero también una limitación notable en el seguimiento de instrucciones estrictas, lo que delimita con claridad su régimen de uso válido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (clase `LlamaForCausalLM`), sin MoE |
| Parametros totales | 88.099.584 (~88 M) en bfloat16 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados; al ser safetensors en bfloat16, admite conversión a int8/fp16/GGUF por herramientas externas |
| Idiomas soportados | Espanol (es) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 176 MB, 110 tensores) |
| Capas / hidden / FFN | 12 / 768 / 2048 (SwiGLU) |
| Atencion | GQA 12Q/4KV, head_dim 64, sin bias |
| Posiciones y normalizacion | RoPE theta=100000, RMSNorm eps=1e-5 |
| Embeddings | Atados (tied), ahorro de ~12,6 M parametros |
| Tokenizador | BPE byte-level propio de 16k, ~4,0 caracteres/token en es/en |
| Tokens especiales | `<pad> <s> </s> <unk> <think> </think>` |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso convencional con las decisiones de diseño habituales en la familia Llama: 12 capas, hidden de 768, FFN de 2048 con activación SwiGLU, RMSNorm con eps=1e-5, RoPE con theta=100000 y atención con query grouping (12 cabezas de consulta frente a 4 de clave/valor, head_dim 64, sin sesgos). Los embeddings de entrada y la cabeza de salida están atados, lo que reduce el recuento de parámetros en unos 12,6 M. El tokenizador es un BPE byte-level entrenado desde cero con vocabulario de 16k, con una ratio declarada de ~4,0 caracteres por token en español e inglés, e incluye tokens especiales `<think>` y `</think>` pese a no documentarse un modo de razonamiento explícito.

El entrenamiento se declara en tres fases: primero un SFT sobre 58 M de tokens durante 2 épocas (loss final 0,09, precisión de token 98,4 %); después un DPO con beta=0,1 y margen de preferencia 4,2; y finalmente GRPO con 550+150 pasos, G=4 y recompensas verificables basadas en formato, fidelidad numérica y anti-sobreformateo. El corpus original son 80 M de tokens derivados de Markdown humano (Wikipedia en es/en, StackExchange, WikiHow), ampliados a 625 M de tokens en el corpus v4. No se documentan detalles sobre composición exacta por dominio, tokenizador del corpus ni proceso de filtrado. La innovación principal no es arquitectónica sino de especialización: el modelo funciona como compilador de formato, con la fidelidad informativa como objetivo explícito de entrenamiento mediante recompensas verificables.

## Capacidades

- Conversión de texto plano a Markdown válido conforme a GFM, con estructura de encabezados, listas, énfasis, bloques de código y tablas.
- Preservación de fidelidad informativa: el autor describe el comportamiento como "de compilador, no de chatbot"; añade estructura, no contenido.
- Generación de tablas Markdown a partir de datos tabulares en texto plano (métrica declarada de table_fidelity = 1,0).
- Post-procesado de salidas de OCR (categoría con puntuación declarada de 1,00 en el banco interno).
- Conversión de HTML pegado y documentos ofimáticos a texto estructurado (categoría html, 0,93-1,00 declarado).
- Conversión de documentación técnica, tutoriales y contenido matemático (categorías docs y math, 0,93-1,00 declarado).
- Modo bilingüe español-inglés en la misma tarea.
- Ejecución local sin GPU: 176 MB de pesos permiten inferencia en CPU.
- No dispone de capacidad documentada de tool calling, function calling, uso de agentes, multi-step reasoning, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Post-procesado de pipelines de OCR: encadenar motor OCR → PASITA para convertir texto plano con saltos y ruido en Markdown estructurado. Es el caso al que apunta la etiqueta `ocr-postprocessing` y donde el modelo obtiene su puntuación declarada más alta.
- Preparación de documentos para RAG: normalizar contratos, manuales y artículos a Markdown con encabezados y tablas preservados antes de trocear e indexar, de modo que el chunking respete la jerarquía del documento original.
- Migración de contenido HTML a Markdown para CMS y repositorios de documentación: pegar el texto extraído de una página y obtener Markdown limpio sin reintroducir etiquetas.
- Estructuración de actas y notas de reunión: convertir transcripciones o notas tomadas en texto corrido en documentos con secciones, listas de acciones y tablas de responsables.
- Normalización de tutoriales y guías paso a paso: transformar contenido procedente de wikis o foros en Markdown homogéneo para su publicación o para alimentar un sitio de documentación.
- Conversión de datos numéricos a tablas Markdown: al declarar table_fidelity de 1,0, encaja en la extracción de tablas de informes y su maquetación posterior, siempre que el texto de entrada sea suficientemente largo.
- Procesado por lotes en entornos sin GPU: con 176 MB de pesos, el modelo cabe en CPU, contenedores ligeros o dispositivos de borde, lo que permite clasificar y estructurar grandes volúmenes documentales sin coste de GPU.
- Preprocesado de corpus para entrenamiento: normalizar a Markdown grandes colecciones de texto antes de construir conjuntos de datos de instrucciones o de continuar el preentrenamiento.
- Escenarios con requisitos de privacidad: al ejecutarse localmente y pesar menos de 200 MB, puede desplegarse on-premise sin enviar documentos sensibles a servicios externos.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index` de la model card, obtenidos sobre un banco de evaluación privado (`PASITA-bench-1000`, held-out, n=1000, decodificación greedy) y marcados como no verificados por un tercero.

| Metrica | Dataset | Valor declarado | Verificado |
|---|---|---|---|
| gfm_validity (accuracy) | PASITA-bench-1000 (held-out, privado) | 0,956 | No |
| faithfulness | PASITA-bench-1000 (held-out, privado) | 0,927 | No |
| semantic_faithfulness | PASITA-bench-1000 (held-out, privado) | 0,888 | No |
| table_fidelity (accuracy) | PASITA-bench-1000 (held-out, privado) | 1,000 | No |

Desglose por categoría declarado en la model card (mismo banco, sin valores por categoría individuales): code / ocr / docs / math / tables / html entre 0,93 y 1,00; bloque de control con instrucciones estrictas: 0,19.

No se han publicado resultados en benchmarks estándar (MMLU, GSM8K, HumanEval, MT-Bench u otros) en la información disponible, y el banco de evaluación utilizado es privado y no reproducible de forma independiente, por lo que no es posible comparar estos valores con los de otros modelos.

## Requisitos de hardware

- Peso de los parámetros: 176 MB en bfloat16 (~88 M de parámetros). En fp32 serían ~352 MB; en int8, ~88 MB; en una cuantización GGUF Q4, del orden de 50 MB.
- Memoria KV cache: con 12 capas, 4 cabezas KV y head_dim 64 en fp16, unos 12 KB por token, es decir ~24 MB con la ventana completa de 2048 tokens. Estimación derivada de la configuración publicada, no confirmada por el autor.
- VRAM estimada para inferencia: por debajo de 1 GB incluyendo pesos y caché; cabe holgadamente en cualquier GPU de consumo actual y en GPUs integradas.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU; cualquier GPU consumer (RTX 3060, RTX 4090, etc.) o acelerador de borde es más que suficiente. No tiene sentido despliegue en A100/H100 salvo por agregación masiva de peticiones.
- Cabe en GPU de consumo: sí, en todas, incluidas GPUs integradas y aceleradores de bajo consumo, y también en CPU o dispositivos tipo Raspberry Pi.
- Opciones de despliegue: `transformers` de forma nativa; el repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los endpoints compatibles son soportados. Para vLLM, llama.cpp u Ollama no se publican pesos en GGUF ni conversiones oficiales: requerirían conversión previa por parte del usuario.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Restricciones de prompt: el autor documenta truncado a 1024 tokens de entrada y hasta 512 tokens nuevos en el ejemplo de uso, con `do_sample=False`, y recomienda `max_new_tokens` adaptativo junto con beam search y un reranking de fidelidad.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo se posiciona en la categoría de LLM diminutos (menos de 100 M de parámetros) especializados en una tarea de transformación de formato, y la información disponible no incluye métricas propias ni de terceros para alternativas de esa categoría, ni tampoco resultados en benchmarks estándar que permitan situarlo frente a modelos pequeños de propósito general.

| Criterio | PASITA v1 | Alternativas comparables |
|---|---|---|
| Parametros | 88 M | no disponible |
| Longitud de contexto | 2048 | no disponible |
| Rendimiento | Solo metricas internas no verificadas | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Disponibilidad | safetensors en HuggingFace, sin GGUF | no disponible |

## Limitaciones y advertencias

- Seguimiento de instrucciones estrictas muy deficiente: el autor reporta 0,19 en el bloque de control del banco interno, por lo que no debe usarse como modelo instruido general ni esperar obediencia a restricciones de formato o contenido detalladas en el prompt.
- Régimen de uso frágil en entradas cortas: el propio autor advierte de que el modelo es frágil con entradas de 1 a 3 líneas; solo es fiable con documentos de longitud media o larga.
- Riesgo de truncado de dígitos: puede perder dígitos en cifras, algo especialmente grave en contextos financieros, médicos o legales.
- Pérdida de datos secundarios: puede omitir información accesoria del documento original, lo que contradice parcialmente su objetivo de fidelidad.
- Encabezados eco: puede emitir un H1 que repite el contenido de entrada en lugar de estructurarlo.
- Continuación tras completar: puede seguir generando después de haber terminado la conversión, generando contenido redundante.
- Ventana de contexto limitada a 2048 tokens, inferior a la de la mayoría de modelos actuales; los documentos largos requieren troceado.
- Solo soporta español e inglés; el rendimiento en otros idiomas no está documentado.
- Benchmark no verificable: las métricas declaradas provienen de un conjunto privado y están marcadas como `verified: false`. No hay resultados en benchmarks públicos estándar.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad o representación en la información disponible.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- Metadatos poco fiables: la fecha de creación del repositorio (2026-09-10) es anómala, lo que conviene tener en cuenta al evaluar la trazabilidad del modelo.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero no hay declaración explícita sobre las licencias de los datos de entrenamiento derivados de Wikipedia, StackExchange y WikiHow, lo que conviene revisar antes de un uso comercial.
- Sin soporte de tool calling, agentes, visión ni audio: cualquier pipeline que requiera esas capacidades debe combinarlo con otros componentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpceanAI/PASITA
- Perfil del autor: https://huggingface.co/OpceanAI
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: los enlaces obtenidos corresponden a foros de software de gestión empresarial sin relación con PASITA ni con OpceanAI.
