# mattwang123/chrononauts-3b-2013-05-init

## Resumen

Chrononauts 3B es un modelo de lenguaje de 2.796.096.000 parámetros desarrollado en el marco del proyecto Chrononauts (Johns Hopkins University y Apple), una suite de agentes de búsqueda "congelados" en siete fechas históricas: 2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07. Para cada fecha, los datos de preentrenamiento (TiC-LM), los datos de post-entrenamiento y el corpus de recuperación se detienen en esa fecha, de modo que el modelo nunca ha visto información posterior. Este repositorio concreto corresponde a la etapa **init** del corte 2013-05.

El modelo parte de TiC-LM 3B y extiende su contexto de 2k a 8k tokens mediante preentrenamiento continuado, seguido de un SFT de recuperación lejana (far-retrieval) y un re-SFT de instrucciones filtrado por un juez de fuga de información, todo ello con datos anteriores al corte. No está entrenado como agente; esa es la función de los repositorios hermanos `-sft` y `-agent`.

Su relevancia es metodológica: proporciona un banco de pruebas controlado para estudiar cómo razonan los modelos con conocimiento temporalmente acotado, evaluar la honestidad epistémica (etiquetas como `[FORECASTING]` para eventos aún no cognoscibles) y medir la contaminación de datos en pipelines de recuperación aumentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OpenLM / TiC-LM) con LayerNorm y QK-norm |
| Parámetros totales | 2.796.096.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; sin GGUF en el repo) |
| Idiomas soportados | inglés |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OpenLM (TiC-LM), con una particularidad de implementación: utiliza LayerNorm con QK-norm en `modeling_open_lm_hf.py`, lo que obliga a cargarlo con código remoto. El contexto original de 2k tokens se amplió a 8k mediante preentrenamiento continuado sobre TiC-LM, con una base RoPE de 48.000.

Sobre esa base se aplicaron dos fases de ajuste: un SFT de recuperación lejana y un re-SFT de instrucciones filtrado por un juez de fuga basado en LLM. Todos los datos de post-entrenamiento pasaron tres filtros: construcción exclusiva a partir de instantáneas anteriores al corte, ausencia de años posteriores al corte y validación por el juez de fuga, que detectó al menos 36 de 40 hechos plantados posteriores al corte en la comprobación de control. Los conjuntos de entrenamiento y evaluación no se solapan. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto y extracción de características (`feature-extraction` como pipeline secundario).
- Razonamiento multi-turno con alternancia explícita de bloques `<think>`, `<search>` e `<information>`.
- Formato de agente de búsqueda: emite consultas de búsqueda, consume pasajes recuperados y sintetiza respuestas.
- Etiquetado epistémico de evidencia: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (evento no cognoscible en la fecha del corte).
- Conciencia temporal: el prompt declara la fecha actual ("Assume today is YYYY-MM-DD") y el modelo razona sobre el año de la pregunta y el año más reciente cubierto por la evidencia.
- Capacidad de recuperación aumentada con corpus congelado (Wikipedia en inglés reconstruida por revisión y lotes de CC-News anteriores al corte).
- Capacidad multilingüe: limitada al inglés.
- No incluye visión, audio ni tool calling genérico; su interfaz de herramientas es el formato específico de búsqueda descrito.

## Casos de uso

- Investigación sobre contaminación temporal: usar el modelo como referencia limpia para medir cuánto sabe un LLM sobre eventos posteriores a 2013-05 y calibrar detectores de fuga en datasets.
- Evaluación de honestidad epistémica: probar si el modelo etiqueta correctamente como `[FORECASTING]` preguntas sobre eventos que aún no habían ocurrido en su corte, lo que sirve para estudiar alineación y calibración.
- Banco de pruebas de pipelines RAG: el corpus congelado con índice faiss (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos, top-5, máximo 2 pasajes por artículo, 4.000 caracteres por turno) permite reproducir experimentos de recuperación sin variabilidad por actualizaciones de la web.
- Análisis histórico asistido: responder preguntas sobre hechos anteriores a mayo de 2013 citando evidencia del corpus congelado, útil en entornos educativos donde se quiere evitar anacronismos.
- Estudio de razonamiento multi-turno: con un máximo de 8 turnos en evaluación (T=0.8, top-p 0.95), sirve para analizar cómo evoluciona la formulación de consultas de búsqueda en modelos pequeños.
- Base para fine-tuning de agentes temporales: al ser la etapa init, es el punto de partida documentado para reproducir las etapas `-sft` y `-agent` del mismo corte.
- Comparación entre cortes: junto con los otros seis cortes de la suite, permite estudiar la evolución del conocimiento y del comportamiento de búsqueda a lo largo del tiempo con un protocolo idéntico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos (tamaño del repo: 5,6 GB), más overhead de activaciones y caché KV para 8.192 tokens; en la práctica, entre 7 y 9 GB en fp16/bf16.
- En cuantización de 8 bits cabría en GPUs consumer de 8 GB; en 4 bits, en torno a 2-3 GB de pesos, aunque no se distribuyen pesos GGUF en el repositorio y habría que convertirlos.
- GPU recomendadas: A100 o H100 para evaluación a gran escala con lotes; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual en bf16.
- Cabe en GPU consumer: sí, en modelos con 12 GB o más en bf16, y en 8 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito por la QK-norm de OpenLM); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible y requerirían conversión o soporte del código custom.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2013-05 init | 2,80B | 8.192 | Base con conocimiento congelado a 2013-05 | other | Hugging Face |
| Chrononauts 3B 2013-05 sft | no disponible | no disponible | SFT del mismo corte | other | Hugging Face |
| Chrononauts 3B 2013-05 agent | no disponible | no disponible | Agente de búsqueda del mismo corte | other | Hugging Face |
| TiC-LM 3B (base) | ~3B | 2.048 | Modelo base original | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo no está entrenado como agente: la etapa init no ejecuta el bucle `<think>`/`<search>`/`<information>` de forma fiable; para eso existen los repositorios `-sft` y `-agent`.
- Conocimiento deliberadamente truncado a mayo de 2013: cualquier pregunta sobre eventos posteriores debe responderse como `[FORECASTING]` o `[INSUFFICIENT]`, y el modelo puede fallar en mantener esa disciplina.
- Riesgo de alucinación sobre el período cubierto, agravado por el tamaño reducido (2,8B) y por el corpus de recuperación limitado a Wikipedia en inglés y CC-News.
- Solo inglés; sin capacidades multilingües.
- La licencia "other" no especifica términos de uso comercial; es necesario consultar el repositorio antes de cualquier despliegue en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_open_lm_hf.py` antes de usarlo en entornos sensibles.
- El corpus de recuperación y el índice faiss no se distribuyen en este repositorio; sin ellos, el formato de agente carece de su fuente de evidencia.
- Sin descargas ni valoraciones en el momento de la consulta, y el paper asociado está en preparación, por lo que no hay validación externa publicada.

## Enlaces

- Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2013-05-init
- Repositorio hermano SFT: https://huggingface.co/mattwang123/chrononauts-3b-2013-05-sft
- Repositorio hermano agente: https://huggingface.co/mattwang123/chrononauts-3b-2013-05-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparación (Chrononauts, Johns Hopkins University y Apple); sin URL disponible.
