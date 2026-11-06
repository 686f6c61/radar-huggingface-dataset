# mattwang123/chrononauts-3b-2019-01-init

## Resumen

Chrononauts 3B (cutoff 2019-01, etapa *init*) es un modelo de lenguaje de 2.796.096.000 parámetros desarrollado por mattwang123 en el marco del proyecto Chrononauts, una suite de agentes de búsqueda "congelados" en siete fechas distintas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07). El objetivo del proyecto es construir agentes cuyo corpus de preentrenamiento, datos de post-entrenamiento y corpus de recuperación se detienen en una fecha concreta, de modo que el modelo no haya visto nunca información posterior. Este repositorio concreto corresponde a la etapa inicial del cutoff 2019-01 y no está entrenado como agente.

El modelo parte de TiC-LM 3B, una arquitectura transformer de tipo OpenLM, y se ha sometido a una extensión de contexto de 2.000 a 8.192 tokens mediante preentrenamiento continuado, seguido de un SFT de recuperación lejana (*far-retrieval*) y un re-SFT de instrucciones filtrado por un juez de fugas (*leak judge*), siempre con datos anteriores al cutoff. El resultado es un modelo base de extracción de características y generación de texto pensado para integrarse en un pipeline de búsqueda aumentada sobre un corpus temporalmente bloqueado.

Su relevancia radica en la evaluación de agentes de búsqueda sin contaminación temporal: permite medir si un modelo razona correctamente sobre evidencia fechada y si distingue entre información soportada, premisas sin respaldo, evidencia insuficiente y predicción de eventos aún no ocurridos. El proyecto está vinculado a la Johns Hopkins University y Apple, con un paper en preparación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (OpenLM / TiC-LM) con LayerNorm y QK-norm |
| Parámetros totales | 2.796.096.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors, con código personalizado (`modeling_open_lm_hf.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia TiC-LM (OpenLM) con 2,8 mil millones de parámetros, LayerNorm con QK-norm y RoPE con base 48.000. La extensión de contexto de 2.000 a 8.192 tokens se realizó mediante preentrenamiento continuado sobre datos anteriores al cutoff de 2019-01. Posteriormente se aplicó un SFT de recuperación lejana y un re-SFT de instrucciones filtrado por un juez de fugas basado en LLM, con una comprobación de hechos plantados que detectó al menos 36 de 40 hechos post-cutoff inyectados.

El control de fugas se articula en tres filtros: los textos de post-entrenamiento se construyen solo a partir de instantáneas anteriores al cutoff, no contienen ningún año posterior al cutoff y pasan por un juez de fugas con verificación de hechos plantados. Los conjuntos de entrenamiento y evaluación no se solapan. El corpus de recuperación asociado se compone de Wikipedia en inglés reconstruida por cutoff (última revisión de cada página en o antes de la fecha) y lotes de CC-News rastreados antes del cutoff, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos, top-5 con un máximo de 2 pasajes por artículo y 4.000 caracteres por turno). Los títulos de noticias llevan la marca "(news; dated no later than <crawl month>)".

## Capacidades

- Generación de texto y extracción de características (pipeline declarado como `text-generation` y `feature-extraction`).
- Razonamiento sobre evidencia fechada mediante turnos alternos de `<think> ... </think>` y `<search> query </search>`, con resultados devueltos en `<information> ... </information>`.
- Formato de agente de un episodio: el prompt declara la fecha actual ("Assume today is YYYY-MM-DD.") y la pregunta; el primer turno de pensamiento indica el año al que se refiere la pregunta y el turno final indica el año más reciente cubierto por la evidencia junto con una etiqueta (`[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]`, `[FORECASTING]`) y `<answer> ... </answer>`.
- Capacidad de recuperación aumentada sobre corpus temporalmente bloqueado.
- Capacidad de distinguir entre evidencia soportada, premisas sin respaldo, evidencia insuficiente y eventos no conocidos aún (forecasting).
- Soporte multilingüe: solo inglés.
- No se documenta soporte de tool calling genérico, visión, audio ni modo thinking más allá del formato de agente descrito.

## Casos de uso

- Evaluación de agentes de búsqueda sin contaminación temporal: el modelo sirve como base para medir si un agente razona correctamente sobre evidencia fechada, al haber sido entrenado exclusivamente con datos anteriores al cutoff de 2019-01.
- Investigación sobre fuga de información en LLM: permite estudiar hasta qué punto un modelo puede responder preguntas sobre eventos posteriores a su fecha de corte y validar la eficacia de filtros de fugas.
- Preguntas y respuestas sobre Wikipedia histórica: integrado con el índice faiss del corpus bloqueado, responde consultas cuya respuesta debe extraerse de revisiones de Wikipedia anteriores a enero de 2019.
- Análisis de noticias históricas: con los lotes de CC-News anteriores al cutoff, permite construir líneas de tiempo y resúmenes de eventos hasta la fecha de congelación.
- Benchmarking de razonamiento temporal: el formato de etiquetas `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` facilita la evaluación automática de la calidad del razonamiento sobre evidencia.
- Detección de preguntas no respondibles por falta de evidencia: el modelo puede clasificar consultas cuyo soporte no existe en el corpus bloqueado, útil en sistemas de abstención controlada.
- Base para experimentos de *continued pretraining* y extensión de contexto: sirve como punto de partida para estudiar cómo afecta la ampliación de 2k a 8k tokens al rendimiento en tareas de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos (2,8 mil millones de parámetros), más memoria para el contexto de hasta 8.192 tokens y caché KV.
- En cuantización de 8 bits, la huella de pesos se reduce a unos 2,8 GB; en 4 bits, a unos 1,4 GB, aunque no se documentan tipos de cuantización soportados oficialmente.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en bfloat16 sin cuantizar; GPU consumer con al menos 8-12 GB de VRAM para cuantización.
- Cabe en GPU consumer de gama media-alta (RTX 3060 12 GB, RTX 4070, RTX 4090) en cuantización o en bfloat16 con contexto reducido.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario por el código personalizado de TiC-LM/OpenLM). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chrononauts 3B (2019-01, init) | 2,8B | 8.192 | other | Hugging Face | Modelo base temporalmente bloqueado, sin entrenamiento de agente |
| TiC-LM 3B (base) | 3B | 2.000 | no disponible | no disponible | Modelo base del que deriva, sin extensión de contexto |
| Chrononauts 3B (2019-01, sft) | no disponible | no disponible | other | Hugging Face (repo hermano) | Etapa SFT del mismo cutoff |
| Chrononauts 3B (2019-01, agent) | no disponible | no disponible | other | Hugging Face (repo hermano) | Etapa entrenada como agente |

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no se documenta soporte de otros idiomas.
- No está entrenado como agente: el repositorio corresponde a la etapa *init*, por lo que su uso en formato de agente requiere las etapas `sft` o `agent` de los repos hermanos.
- Requiere `trust_remote_code=True` por el código personalizado de TiC-LM/OpenLM, lo que implica ejecutar código del autor del modelo.
- Licencia "other" sin detalle: es necesario consultar los términos exactos antes de cualquier uso comercial.
- Riesgo de alucinación inherente a un modelo de 2,8 mil millones de parámetros; la evaluación del proyecto usa T=0,8 y top-p 0,95 con un máximo de 8 turnos, lo que sugiere sensibilidad a los parámetros de muestreo.
- El corpus de recuperación está bloqueado a la fecha de cutoff; cualquier pregunta sobre eventos posteriores a 2019-01 debe clasificarse como `[FORECASTING]` o `[INSUFFICIENT]`, no responderse con conocimiento del modelo.
- Sin datos publicados de benchmarks, por lo que no es posible comparar su rendimiento con alternativas de forma cuantitativa.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2019-01-init
- Repo hermano SFT: https://huggingface.co/mattwang123/chrononauts-3b-2019-01-sft
- Repo hermano agente: https://huggingface.co/mattwang123/chrononauts-3b-2019-01-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparación (Chrononauts, Johns Hopkins University y Apple); no disponible en línea.
