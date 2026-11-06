# mattwang123/chrononauts-3b-2017-01-init

## Resumen

Chrononauts 3B (cutoff 2017-01, etapa *init*) es un modelo de lenguaje de 2.796.096.000 parámetros desarrollado por `mattwang123` en el marco de la suite Chrononauts, un proyecto de investigación (Johns Hopkins University y Apple, según la model card) que entrena agentes de búsqueda "congelados" en siete fechas distintas. La idea central es que tanto los datos de preentrenamiento (TiC-LM) como los de post-entrenamiento y el corpus de recuperación se detienen en la fecha de corte, de modo que el modelo nunca ha visto información posterior. Este repositorio concreto corresponde a la etapa inicial para el corte de enero de 2017: un modelo base con contexto extendido, no entrenado todavía como agente.

El modelo parte de TiC-LM 3B y extiende su ventana de contexto de 2.000 a 8.000 tokens mediante preentrenamiento continuado, seguido de un SFT de recuperación lejana (*far-retrieval*) y un re-SFT de instrucciones filtrado con un juez de fuga de información. La arquitectura es un transformer tipo OpenLM con LayerNorm y QK-norm, implementado en `modeling_open_lm_hf.py` y que requiere `trust_remote_code=True`. Está pensado para combinarse con un corpus temporal (Wikipedia en inglés reconstruida por revisión y lotes de CC-News anteriores al corte) indexado con `BAAI/bge-base-en-v1.5` y faiss sobre CPU.

Su relevancia es metodológica: permite estudiar el comportamiento de agentes de búsqueda y de modelos de lenguaje en escenarios estrictamente temporales, sin contaminación por conocimiento futuro, lo que resulta útil para evaluar razonamiento temporal, atribución de evidencia y calibración epistémica. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia figura como "other" sin detalle de términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo OpenLM (TiC-LM) con LayerNorm y QK-norm (`modeling_open_lm_hf.py`) |
| Parametros totales | 2.796.096.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (extendido desde 2.000; RoPE base 48.000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | safetensors (librería transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia TiC-LM (OpenLM) con Normalization por LayerNorm y QK-norm, y codificación posicional RoPE con base 48.000. El punto de partida es TiC-LM 3B con 2.000 tokens de contexto; mediante preentrenamiento continuado se amplía hasta 8.192 tokens. Sobre esa base se aplica un SFT orientado a recuperación lejana (*far-retrieval*) y después un re-SFT de instrucciones filtrado por un juez de fuga. Todos los datos de estas etapas son anteriores al corte de enero de 2017.

El control de fuga es explícito: el texto de post-entrenamiento se construye solo a partir de instantáneas previas al corte, se descarta cualquier mención a años posteriores y se pasa por un juez LLM de fuga con una prueba de hechos plantados (al menos 36 de 40 hechos post-corte detectados). Los conjuntos de entrenamiento y evaluación no se solapan. Esta etapa *init* no está entrenada como agente; el formato de agente (con turnos `<think>`, `<search>`, `<information>` y `<answer>`) se describe en la model card como guía de uso, pero corresponde a las etapas `sft` y `agent` del mismo corte.

## Capacidades

- Generación de texto en inglés y extracción de características (*feature-extraction*), según los tags del repositorio.
- Conversación multi-turno con hasta 8.192 tokens de contexto.
- Recuperación aumentada sobre un corpus temporal congelado, mediante el protocolo de etiquetas `<think>`, `<search>`, `<information>` y `<answer>`.
- Razonamiento temporal: la model card indica que el primer turno de pensamiento debe declarar el año al que se refiere la pregunta y el turno final el año más reciente cubierto por la evidencia.
- Etiquetado de evidencia con cuatro categorías: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (no cognoscible todavía).
- Soporte de *tool calling* / *function calling*: no disponible como capacidad nativa; el uso de herramientas se articula a través del formato de búsqueda descrito.
- Capacidades de agente multi-paso: no en esta etapa; la model card indica explícitamente que este repositorio no está entrenado como agente.
- Capacidades multilingües: solo inglés.
- Modo *thinking*: sí, mediante bloques `<think> ... </think>`.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Evaluación de razonamiento temporal sin contaminación: el modelo permite medir cómo responde un LLM cuando su conocimiento y su corpus se limitan a una fecha, útil para investigación sobre fuga de información y calibración epistémica.
- Agente de búsqueda sobre archivo histórico: combinado con el índice faiss del corpus congelado (Wikipedia en inglés por revisión y CC-News anterior al corte), responde preguntas sobre hechos de 2017 o anteriores citando pasajes recuperados.
- Análisis de evidencia y atribución: el etiquetado `[SUPPORTED]` / `[PREMISES_ONLY]` / `[INSUFFICIENT]` / `[FORECASTING]` permite construir pipelines que distinguen afirmaciones respaldadas por el corpus de las que no lo están.
- Punto de partida para *fine-tuning* de agentes: al ser la etapa *init* de un corte, sirve como base para reproducir las etapas `sft` y `agent` del mismo periodo y comparar el efecto del post-entrenamiento.
- *Benchmarking* de sistemas RAG con restricción temporal: permite comparar recuperadores y estrategias de *prompting* bajo un corpus fijo y reproducible.
- Investigación sobre pronóstico y desconocimiento: la etiqueta `[FORECASTING]` facilita estudiar si el modelo reconoce cuándo una pregunta no es respondible con la evidencia disponible en su fecha.
- Experimentos de contexto largo: con 8.192 tokens y hasta 8 turnos de interacción (4.000 caracteres por turno, top-5 pasajes), es adecuado para estudiar degradación de rendimiento en contextos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (2.796 millones de parámetros), en bfloat16 serían aproximadamente 5,6 GB de pesos, cifra coherente con el tamaño del repositorio (5,6 GB); a eso hay que sumar la memoria de activaciones y caché KV para 8.192 tokens.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos, en bfloat16 quedaría en torno a 5,6 GB, lo que en principio encajaría en GPUs de consumo con 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"` (único método documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- El índice de recuperación asociado (faiss OPQ64, IVF32768, PQ64, con rerank exacto de 400 candidatos) está diseñado para ejecutarse en CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni especificaciones de modelos comparables. Como referencia interna de la propia suite, existen repositorios hermanos del mismo corte (`chrononauts-3b-2017-01-sft` y `chrononauts-3b-2017-01-agent`) y otros cortes temporales (2013-05, 2015-01, 2019-01, 2021-01, 2023-01, 2024-07), pero no se aportan datos comparativos de rendimiento.

## Limitaciones y advertencias

- Conocimiento deliberadamente limitado a enero de 2017: no puede responder sobre hechos posteriores y, por diseño, carece de información reciente.
- Solo inglés; no hay soporte multilingüe declarado.
- No está entrenado como agente en esta etapa (*init*); el formato de agente descrito en la model card corresponde a los repositorios `sft` y `agent`.
- Requiere `trust_remote_code=True` por el código personalizado de OpenLM (`modeling_open_lm_hf.py`), lo que implica ejecutar código del repositorio y revisarlo antes de usarlo en producción.
- Licencia "other" sin términos detallados: no se puede confirmar el uso comercial; es necesario contactar con el autor o consultar el paper (en preparación).
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de fidelidad ni tasas de error.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre Wikipedia y CC-News en inglés, es esperable un sesgo hacia fuentes y perspectiva anglófonas, aunque no se aportan mediciones.
- El control de fuga depende de un juez LLM con una tasa de detección declarada de al menos 36/40 hechos plantados, por lo que puede quedar contaminación residual.
- Sin descargas ni likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.
- Repositorio con fecha de creación futura (2026-11-06) en los metadatos de HuggingFace, lo que conviene verificar antes de integrarlo en pipelines automatizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattwang123/chrononauts-3b-2017-01-init
- Repositorio hermano (SFT): https://huggingface.co/mattwang123/chrononauts-3b-2017-01-sft
- Repositorio hermano (agente): https://huggingface.co/mattwang123/chrononauts-3b-2017-01-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparación (Chrononauts, Johns Hopkins University y Apple); no disponible enlace.
