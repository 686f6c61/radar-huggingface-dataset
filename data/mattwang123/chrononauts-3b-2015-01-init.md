# mattwang123/chrononauts-3b-2015-01-init

## Resumen

Chrononauts 3B (cutoff 2015-01, etapa init) es un modelo de lenguaje de 2.796.096.000 parámetros desarrollado por el autor mattwang123 en el marco del proyecto Chrononauts, una suite de agentes de búsqueda "congelados" en siete fechas distintas (desde 2013-05 hasta 2024-07). El objetivo del proyecto es construir sistemas que solo hayan visto información anterior a una fecha de corte determinada, de modo que sirvan como banco de pruebas controlado para evaluar razonamiento temporal, recuperación de información y honestidad epistémica (es decir, que el modelo sepa distinguir lo que puede saber de lo que no).

Este repositorio concreto es la etapa **init** para el corte 2015-01: un modelo base TiC-LM 3B con contexto extendido de 2k a 8k tokens mediante preentrenamiento continuado, ajuste fino supervisado (SFT) de recuperación lejana y un re-SFT de instrucciones filtrado por un juez de fugas, todo ello usando exclusivamente datos anteriores al corte. No está entrenado como agente; para eso existen los repositorios hermanos `-sft` y `-agent`.

Es relevante ahora porque propone una metodología reproducible de control de fugas temporales (filtros de fecha, juez LLM con comprobación de hechos plantados) aplicable a la evaluación de alucinación y conocimiento encubierto en modelos desplegados en producción. La arquitectura es la de TiC-LM (OpenLM), un transformer con LayerNorm y QK-norm, con base RoPE de 48.000 y licencia "other".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer TiC-LM (OpenLM) con LayerNorm y QK-norm (`modeling_open_lm_hf.py`) |
| Parámetros totales | 2.796.096.000 (2,8 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (extendido desde 2k; RoPE base 48.000) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el uso indicado es bfloat16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (sin detalle de términos en la información disponible) |
| Formato de pesos | safetensors (tamaño del repo: 5,6 GB) |

## Arquitectura y entrenamiento

El modelo se basa en TiC-LM 3B, un transformer decoder-only de la familia OpenLM, con una particularidad técnica: usa LayerNorm con QK-norm, lo que obliga a cargar el modelo con `trust_remote_code=True` y un módulo de modelado personalizado (`modeling_open_lm_hf.py`). La ventana de contexto se amplió de 2.000 a 8.192 tokens mediante preentrenamiento continuado sobre datos anteriores al corte, con base RoPE ajustada a 48.000.

El pipeline de entrenamiento de esta etapa incluye tres fases: preentrenamiento continuado para la extensión de contexto, un SFT de recuperación lejana (far-retrieval) y un re-SFT de instrucciones juzgado por fugas. Todos los datos de post-entrenamiento pasaron tres filtros: construcción exclusiva a partir de instantáneas anteriores al corte, ausencia de años posteriores al corte y un juez LLM de fugas con comprobación de hechos plantados (se detectaron al menos 36 de 40 hechos post-corte plantados). Los conjuntos de entrenamiento y evaluación no se solapan. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto y extracción de características (`feature-extraction` en los tags).
- Conversación multi-turno con contexto de hasta 8.192 tokens.
- Formato de agente de búsqueda con etiquetas estructuradas: alternancia de `<think>`, `<search>`, `<information>`, `<answer>`.
- Razonamiento temporal: el primer turno de pensamiento declara el año de la pregunta y el turno final declara el año más reciente cubierto por la evidencia.
- Etiquetado epistémico de evidencia: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]`, `[FORECASTING]` (no cognoscible aún).
- Recuperación aumentada sobre un corpus congelado (Wikipedia en inglés reconstruida por corte y lotes de CC-News anteriores al corte).
- Capacidades multilingües: solo inglés declarado.
- No se documentan tool calling genérico, visión, audio ni modo thinking fuera del formato de agente descrito.

## Casos de uso

- Evaluación de razonamiento temporal: el modelo sirve como referencia para medir si un sistema distingue correctamente entre hechos anteriores y posteriores a 2015-01, usando la etiqueta `[FORECASTING]` para preguntas no cognoscibles en su corte.
- Investigación sobre alucinación y conocimiento encubierto: al estar entrenado solo con datos previos al corte, permite comprobar si el modelo "sabe" cosas que no debería, comparando sus respuestas con el corpus congelado.
- Agente de búsqueda con recuperación aumentada: integrado con el índice faiss descrito (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos, top-5, máximo 2 pasajes por artículo, 4.000 caracteres por turno), puede responder preguntas con evidencia trazable.
- Auditoría de pipelines RAG: el formato `<search>`/`<information>` facilita registrar qué pasajes sostienen cada respuesta y validar la cadena de evidencia en producción.
- Docencia y divulgación: demos controladas sobre "qué se sabía en enero de 2015" para ilustrar límites del conocimiento de un modelo.
- Base para fine-tuning posterior: al ser la etapa init, sirve como punto de partida para construir las variantes `-sft` y `-agent` del mismo corte.
- Investigación sobre control de fugas en datasets: la metodología de triple filtro y juez LLM es reutilizable para curar corpus de entrenamiento con restricciones temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV para 8.192 tokens; en la práctica, entre 7 y 10 GB según lote y longitud.
- GPU recomendadas para producción: A100 o H100 para lotes grandes y contexto completo; L40S o RTX 6000 Ada como alternativas de coste medio.
- GPU de consumo: cabe en RTX 4090 (24 GB) y, con cuantización a 8 bits o 4 bits (no documentada por el autor, pero factible con herramientas estándar), podría caber en GPUs de 8-12 GB; el autor no publica pesos GGUF.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"` es la vía documentada; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible (la dependencia de código remoto y QK-norm puede complicar su integración directa).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2015-01 init | 2,8 B | 8.192 | Base temporal congelada, corpus por corte | `other` | Hugging Face, 0 descargas |
| Chrononauts 3B 2015-01 sft | No disponible | No disponible | SFT del mismo corte | `other` | Hugging Face (repo hermano) |
| Chrononauts 3B 2015-01 agent | No disponible | No disponible | Entrenado como agente de búsqueda | `other` | Hugging Face (repo hermano) |
| Modelos base de ~3 B (p. ej., Llama 3.2 3B, Qwen2.5 3B) | ~3 B | 8k-128k | Base generalista sin restricción temporal | Licencias abiertas | Amplia disponibilidad |

La comparación con modelos generalistas de tamaño similar es limitada: Chrononauts no compite en rendimiento general, sino en control experimental del conocimiento temporal. No se dispone de datos de benchmarks para cuantificar la diferencia.

## Limitaciones y advertencias

- Es un modelo **init**: no está entrenado como agente, por lo que el formato `<search>`/`<answer>` puede no funcionar de forma fiable sin las etapas `-sft` y `-agent`.
- Conocimiento deliberadamente limitado a antes de 2015-01; cualquier pregunta sobre hechos posteriores debe responderse como `[FORECASTING]` o `[INSUFFICIENT]`, y el modelo puede fallar en esa distinción.
- Solo inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación incluso dentro del corte: el filtro de fugas reduce pero no elimina el conocimiento encubierto.
- Licencia `other` sin términos detallados en la información disponible: verificar condiciones de uso comercial antes de desplegar.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar `modeling_open_lm_hf.py` antes de usarlo en producción.
- Dependencia de un corpus de recuperación específico (Wikipedia por corte + CC-News, embeddings `BAAI/bge-base-en-v1.5`, índice faiss en CPU); fuera de ese entorno, el comportamiento del agente puede degradarse.
- Sin descargas ni likes en el momento de la consulta: ecosistema mínimo, poca validación externa.
- No hay datos publicados de sesgos, benchmarks ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2015-01-init
- Repo hermano SFT: https://huggingface.co/mattwang123/chrononauts-3b-2015-01-sft
- Repo hermano agente: https://huggingface.co/mattwang123/chrononauts-3b-2015-01-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparación (Chrononauts, Johns Hopkins University y Apple); no disponible aún.
