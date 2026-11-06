# mattwang123/chrononauts-3b-2023-01-agent

## Resumen

Chrononauts 3B (cutoff 2023-01, etapa *agent*) es un modelo de lenguaje de 2.796.096.000 parámetros desarrollado por `mattwang123` en el marco del proyecto Chrononauts (Johns Hopkins University y Apple, según la model card). Pertenece a una familia de agentes de búsqueda "congelados en el tiempo": para cada una de siete fechas de corte (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07) se detienen los datos de preentrenamiento (TiC-LM), los de post-entrenamiento y el corpus de recuperación, de modo que el modelo nunca ha visto información posterior a su fecha de corte.

Este repositorio concreto es la etapa final de la cadena para el corte 2023-01: parte del modelo `-sft` del mismo corte y se entrena adicionalmente con GRPO (aprendizaje por refuerzo) con búsqueda en vivo, usando crédito a nivel de span para la respuesta, la etiqueta de evidencia, el año de la pregunta y la recuperación. El problema que resuelve es el de la evaluación honesta de agentes con recuperación: un modelo que no puede filtrar conocimiento posterior al corte y que debe declarar explícitamente cuándo una pregunta no es respondible con la evidencia disponible.

La relevancia actual es metodológica: ofrece un banco de pruebas controlado para estudiar alucinación temporal, fuga de conocimiento (*leakage*) y calibración de etiquetas de evidencia en sistemas RAG. La arquitectura es un transformer tipo OpenLM (TiC-LM) con QK-norm, contexto útil de hasta 8.192 tokens y licencia `other` no detallada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OpenLM / TiC-LM) con LayerNorm y QK-norm (`modeling_open_lm_hf.py`) |
| Parámetros totales | 2.796.096.000 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | `other` (no se detallan términos en la model card) |
| Formato de pesos | safetensors (repo de 5,6 GB), código custom (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OpenLM, adaptado como TiC-LM, con LayerNorm y QK-norm, lo que obliga a cargar código remoto (`modeling_open_lm_hf.py`) en lugar de usar una implementación estándar de `transformers`. El contexto operativo recomendado es de hasta 8.192 tokens con RoPE base 48.000. El entrenamiento se organiza en tres etapas encadenadas: un modelo `-init` preentrenado con datos TiC-LM detenidos en el corte, un modelo `-sft` afinado con datos de post-entrenamiento también detenidos en el corte, y este modelo `-agent`, entrenado con GRPO y búsqueda en vivo.

La innovación central es el control de fuga temporal. Todo el texto de post-entrenamiento pasó tres filtros: construcción exclusiva a partir de instantáneas anteriores al corte, ausencia de años posteriores al corte y un juez LLM de fuga con comprobación de hechos plantados (al menos 36 de 40 hechos plantados post-corte detectados). Los conjuntos de entrenamiento y evaluación no se solapan. El agente opera en episodios con un formato estricto: el prompt declara la fecha actual ("Assume today is YYYY-MM-DD.") y la pregunta; el modelo alterna `<think>...</think>` y `<search> query </search>`, recibe resultados en `<information>...</information>` y cierra con `<answer>...</answer>`, indicando en el primer turno de pensamiento el año al que se refiere la pregunta y en el último el año más reciente cubierto por la evidencia junto con una etiqueta (`[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]`, `[FORECASTING]`).

El corpus de recuperación asociado se reconstruye por corte: Wikipedia en inglés reconstruida desde el historial completo de revisiones (última revisión de cada página en o antes del corte) más lotes de CC-News rastreados antes del corte, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos; top-5, como máximo 2 pasajes por artículo, 4.000 caracteres por turno). Los títulos de noticias llevan la marca "(news; dated no later than <mes de rastreo>)".

## Capacidades

- Generación de texto conversacional en inglés con razonamiento multi-turno dentro de un episodio de agente.
- Búsqueda agentiva: emite consultas de búsqueda en `<search>` y consume pasajes recuperados en `<information>`.
- Razonamiento multi-hop sobre evidencia recuperada, con hasta 8 turnos en la configuración de evaluación.
- Etiquetado de evidencia: clasifica la respuesta como `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` o `[FORECASTING]` (no conocible todavía).
- Conciencia temporal explícita: identifica el año de la pregunta y el año más reciente cubierto por la evidencia.
- Modo de pensamiento explícito mediante bloques `<think>`.
- No dispone de tool calling genérico ni de function calling fuera del protocolo de búsqueda descrito; no se documentan capacidades de visión, audio ni matemáticas avanzadas.
- Multilingüismo limitado al inglés.

## Casos de uso

- Evaluación de agentes RAG con control de fuga: usar el modelo contra el corpus congelado en 2023-01 para medir cuánto conocimiento posterior al corte filtra un agente; la etiqueta `[FORECASTING]` permite detectar respuestas a eventos no conocibles en la fecha.
- Investigación sobre alucinación temporal: comparar las respuestas del modelo con las de sus hermanos de otros cortes (`-2019-01`, `-2021-01`, etc.) sobre la misma pregunta para aislar el efecto de la fecha de corte en la precisión.
- Calibración de abstención: el modelo está entrenado para declarar `[INSUFFICIENT]` cuando la evidencia no cubre la pregunta; útil para construir y validar clasificadores de "no respondible" en pipelines de atención al cliente con base documental.
- Auditoría de sistemas de recuperación: al fijar el corpus y el índice faiss, se puede variar únicamente el recuperador (por ejemplo, cambiar el modelo de embeddings) y medir el impacto en la tasa de `[SUPPORTED]` sin contaminación por conocimiento paramétrico.
- Docencia y demostraciones de razonamiento multi-hop: el formato `<think>`/`<search>`/`<information>`/`<answer>` es explícito y trazable, lo que facilita ilustrar el bucle de recuperación y verificación en un curso o tutorial.
- Generación de conjuntos de datos etiquetados temporalmente: las trazas de episodios con año de pregunta, año de evidencia y etiqueta de suficiencia sirven como datos de entrenamiento para modelos de verificación de hechos con restricción temporal.
- Pruebas de regresión en sistemas de búsqueda corporativa: congelar el índice en una fecha y usar el agente para comprobar que las respuestas no incorporan documentos posteriores, como test de integridad de un pipeline de indexación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test multi-hop retenido (splits oficiales, T=0.8):

| Métrica | Valor |
|---|---|
| Precisión global | 34,8 |
| Precisión en ítems anteriores al corte | 36,9 |
| Precisión en ítems posteriores al corte | 6,7 |
| Ítems post-corte etiquetados como insuficientes / no conocibles | 26,7 % |
| Ítems pre-corte etiquetados como insuficientes / no conocibles | 1,3 % |

La model card señala que la baja precisión y la frecuencia elevada de etiquetas "no conocible todavía" después del corte son el comportamiento previsto. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos (2,796 mil millones de parámetros × 2 bytes), más caché KV y activaciones; en la práctica, entre 7 y 10 GB según longitud de contexto.
- En cuantización de 8 bits cabría en torno a 3 GB de pesos; en 4 bits, alrededor de 1,5 GB, aunque no se documentan tipos de cuantización soportados ni se distribuyen pesos GGUF.
- GPU recomendadas: A100 o H100 para evaluación a gran escala con contexto completo de 8.192 tokens; RTX 4090, RTX 3090 o RTX A6000 para inferencia individual en bfloat16.
- Cabe en GPU de consumo con al menos 8-12 GB de VRAM en bfloat16 para contextos moderados; en 4 bits cabría en GPUs de 4-6 GB, sujeto a que la implementación custom lo permita.
- Despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el código custom de OpenLM puede requerir adaptaciones para servidores de inferencia de alto rendimiento.
- El índice de recuperación (faiss OPQ64, IVF32768, PQ64) está diseñado para ejecutarse en CPU, lo que separa el coste de recuperación del de generación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2023-01 agent | 2,796 B | 8.192 tokens | Agente de búsqueda con corte temporal y GRPO | `other` | Hugging Face, código custom |
| Chrononauts 3B 2023-01 sft | no disponible | 8.192 tokens | Afinado supervisado del mismo corte, sin RL | `other` | Hugging Face (repo hermano) |
| Chrononauts 3B 2023-01 init | no disponible | 8.192 tokens | Preentrenamiento TiC-LM congelado en el corte | `other` | Hugging Face (repo hermano) |
| Otros agentes RAG de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos externos comparables en la información proporcionada; la comparación más directa posible es con los repositorios hermanos de la propia familia, que comparten arquitectura y corpus pero difieren en la etapa de entrenamiento.

## Limitaciones y advertencias

- Precisión baja por diseño: 34,8 global y 6,7 en ítems posteriores al corte; no es un modelo apto para producción generalista.
- Conocimiento deliberadamente limitado a enero de 2023; cualquier pregunta sobre eventos posteriores debe devolver `[FORECASTING]` o `[INSUFFICIENT]`, y el 26,7 % de los ítems post-corte se etiquetan como insuficientes, lo que implica una tasa no despreciable de respuestas incorrectas incluso en ese régimen.
- Solo inglés; no se documenta soporte multilingüe.
- Licencia `other` sin términos detallados en la model card: es imprescindible contactar con el autor o revisar el paper antes de cualquier uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar `modeling_open_lm_hf.py` antes de desplegar.
- Depende de un corpus y un índice concretos (Wikipedia reconstruida más CC-News, embeddings `bge-base-en-v1.5`, faiss en CPU); usar otro recuperador altera el comportamiento y puede invalidar las etiquetas de evidencia.
- Riesgo de alucinación dentro del corte: el filtrado de fuga se validó con un juez LLM y una comprobación de 36/40 hechos plantados, no con verificación exhaustiva; puede persistir conocimiento residual posterior al corte.
- El protocolo de episodio exige hasta 8 turnos y un formato estricto; desviarse del formato (`<think>`, `<search>`, `<information>`, `<answer>`) degrada la calidad de forma no cuantificada.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; proyecto con paper en preparación, por lo que la reproducibilidad de los resultados publicados aún no está avalada por una revisión por pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2023-01-agent
- Repo hermano (etapa init): https://huggingface.co/mattwang123/chrononauts-3b-2023-01-init
- Repo hermano (etapa sft): https://huggingface.co/mattwang123/chrononauts-3b-2023-01-sft
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparación (Chrononauts, Johns Hopkins University y Apple); no disponible aún.
