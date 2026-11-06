# mattwang123/chrononauts-3b-2021-01-init

## Resumen

Chrononauts 3B (cutoff 2021-01, etapa *init*) es un modelo de lenguaje de 2.796.096.000 parámetros desarrollado por mattwang123 en el marco del proyecto Chrononauts, una suite de agentes de búsqueda "congelados" en siete fechas históricas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07). Para cada fecha, los datos de preentrenamiento (TiC-LM), los datos de post-entrenamiento y el corpus de recuperación se detienen en esa fecha, de modo que el modelo nunca ha visto información posterior. Este repositorio concreto corresponde a la etapa inicial del corte 2021-01: un modelo base TiC-LM 3B con contexto extendido de 2k a 8k tokens, sometido a preentrenamiento continuado, SFT con recuperación lejana (*far-retrieval*) y un re-SFT de instrucciones filtrado por un juez de fugas, todo con datos anteriores al corte.

El modelo no está entrenado como agente; es la base sobre la que se construyen los repositorios hermanos `-sft` y `-agent`. Su relevancia radica en la metodología de control de fugas temporales: permite estudiar el comportamiento de modelos y agentes de búsqueda en escenarios estrictamente históricos, sin contaminación por conocimiento posterior, algo útil para investigación en evaluación temporal, recuperación aumentada y razonamiento basado en evidencia fechada.

La arquitectura es un transformer TiC-LM (OpenLM) con LayerNorm y QK-norm, RoPE con base 48.000 y ventana de 8.192 tokens. El modelo solo declara soporte de inglés y se distribuye con licencia "other" no detallada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TiC-LM (OpenLM) con LayerNorm y QK-norm; RoPE base 48.000 |
| Parametros totales | 2.796.096.000 (2,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (extendido desde 2k mediante preentrenamiento continuado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | other (no detallada en la información disponible) |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo se basa en TiC-LM 3B, una arquitectura transformer de tipo OpenLM que incorpora LayerNorm con QK-norm (implementada en `modeling_open_lm_hf.py`, de ahí la necesidad de `trust_remote_code=True`). El contexto original de 2k tokens se extendió a 8k mediante preentrenamiento continuado, ajustando la base RoPE a 48.000. Sobre esa base se aplicó SFT con recuperación lejana (*far-retrieval*) y un re-SFT de instrucciones supervisado por un juez de fugas basado en LLM.

Todos los datos de post-entrenamiento pasaron tres filtros: construirse únicamente a partir de instantáneas anteriores al corte (2021-01), no contener ningún año posterior al corte y superar un juez de fugas con comprobación de hechos plantados (al menos 36 de 40 hechos post-corte plantados detectados). Los conjuntos de entrenamiento y evaluación no se solapan. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de la mención a TiC-LM.

## Capacidades

- Generación de texto en inglés con ventana de contexto de hasta 8.192 tokens.
- Extracción de características (*feature-extraction*), según los tags del repositorio.
- Soporte del formato de agente de búsqueda con turnos alternos `<think>`, `<search>`, `<information>` y `<answer>`, aunque el modelo en esta etapa *init* no está entrenado como agente.
- Etiquetado de evidencia en la respuesta final: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]`, `[FORECASTING]`.
- Razonamiento temporal: el primer turno de pensamiento declara el año al que se refiere la pregunta y el turno final declara el año más reciente cubierto por la evidencia.
- Integración con corpus de recuperación congelado (Wikipedia en inglés reconstruida por corte y lotes de CC-News anteriores al corte), embeddings de `BAAI/bge-base-en-v1.5` e índice faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos, top-5, máximo 2 pasajes por artículo, 4.000 caracteres por turno).
- No se declara soporte de tool calling genérico, visión, audio ni *thinking mode* nativo más allá del formato de agente descrito.

## Casos de uso

- Investigación en evaluación temporal: usar el modelo con el corpus congelado en 2021-01 para medir cómo razona sobre hechos históricos sin contaminación posterior, comparando con los otros seis cortes de la suite.
- Agentes de búsqueda con evidencia fechada: desplegar el formato `<search>`/`<information>` sobre el índice faiss del corte para responder preguntas con trazabilidad del año de la evidencia y etiqueta de suficiencia.
- Detección de fugas en pipelines de datos: emplear el juez de fugas y el esquema de etiquetas como referencia para auditar datasets de entrenamiento frente a un corte temporal.
- Análisis de forecasting: el etiquetado `[FORECASTING]` permite distinguir preguntas no respondibles con la evidencia disponible, útil en sistemas de alerta sobre afirmaciones anacrónicas.
- Generación de respuestas ancladas a un corpus: con 8k tokens de contexto se pueden inyectar varios pasajes recuperados (hasta 4.000 caracteres por turno y 8 turnos de evaluación) y generar respuestas con citas temporales.
- Base para post-entrenamiento: al ser la etapa *init*, sirve como punto de partida para construir los repositorios `-sft` y `-agent` del mismo corte mediante SFT adicional.
- Extracción de características: los tags indican uso para *feature-extraction*, aprovechable en tareas de representación de texto en inglés dentro de pipelines de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe la configuración de evaluación del agente (máximo 8 turnos, T=0.8, top-p 0.95) sin cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo de pesos, más overhead de activaciones y caché KV para 8.192 tokens; en la práctica se recomienda al menos 8-12 GB.
- En cuantización de 8 bits o 4 bits el modelo podría caber en GPUs de consumo con 6-8 GB, aunque no se detallan tipos de cuantización soportados en la información disponible.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 permiten inferencia en bfloat16 con contexto completo sin problemas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 y modelos con 12 GB o más en bfloat16; en 8 GB requeriría cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"`; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible (la dependencia de código remoto para QK-norm puede complicar su integración).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2021-01 init | 2,8B | 8.192 | Base temporal congelada, agente de búsqueda | other | Hugging Face (repo propio) |
| Chrononauts 3B 2021-01 sft | no disponible | no disponible | SFT del mismo corte | other | Hugging Face (repo hermano) |
| Chrononauts 3B 2021-01 agent | no disponible | no disponible | Entrenado como agente | other | Hugging Face (repo hermano) |
| TiC-LM 3B (base) | ~3B | 2.048 (original) | Transformer OpenLM | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables fuera de la propia suite Chrononauts en la información proporcionada.

## Limitaciones y advertencias

- El modelo no está entrenado como agente en esta etapa *init*; usarlo directamente en formato de agente puede producir resultados pobres.
- Conocimiento deliberadamente limitado a antes de 2021-01: no conoce hechos posteriores y puede responder de forma incompleta o desactualizada a preguntas sobre eventos recientes.
- Solo soporta inglés; no se declara multilingüismo.
- Licencia "other" sin texto detallado: es imprescindible revisar los términos antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` por la implementación personalizada de QK-norm, lo que implica ejecutar código del repositorio y añade riesgo de seguridad y de compatibilidad con versiones de `transformers`.
- Riesgo de alucinación inherente a un modelo de 2,8B, especialmente en razonamiento multi-turno y en la selección de etiquetas de evidencia.
- El rendimiento depende críticamente del corpus congelado y del índice faiss descritos; fuera de ese entorno de recuperación el formato de agente pierde sentido.
- No se han publicado benchmarks ni datos de sesgos; la evaluación de robustez queda pendiente.
- El paper está en preparación (Johns Hopkins University y Apple), por lo que la documentación metodológica completa aún no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2021-01-init
- Repo hermano SFT: https://huggingface.co/mattwang123/chrononauts-3b-2021-01-sft
- Repo hermano agente: https://huggingface.co/mattwang123/chrononauts-3b-2021-01-agent
- Embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparación (Chrononauts, Johns Hopkins University y Apple); no disponible enlace público.
