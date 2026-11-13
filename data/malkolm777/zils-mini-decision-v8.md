# malkolm777/zils-mini-decision-v8

## Resumen

zils-mini-decision-v8 es un modelo de decisión publicado por el usuario malkolm777 en Hugging Face, construido sobre la familia Qwen3.5-4B (concretamente sobre el cuerpo base vllm-sr/d3-mini) y orientado a tareas de clasificación, puntuación y razonamiento de opción múltiple dentro del pool "mini" de la subnet 127 de Zils. No es un modelo conversacional de propósito general, sino un "cuerpo de decisión": un fine-tune especializado en emitir respuestas cortas y etiquetas ante ítems tipo examen. Su pipeline declarado es feature-extraction y su licencia Apache-2.0.

El modelo se obtiene mediante un promedio uniforme de pesos (0.5/0.5) de dos cuerpos derivados de un mismo punto de partida, a su vez promedio de dos cuerpos públicos del pool (qhoenix/zils-mini-l13_avg678 y joamCriff123/zils-mini-sx3). El cuerpo A aplica tres pasadas secuenciales de LoRA (rango 64, AdamW, lr 2e-5, una época por pasada, semilla 553) sobre ítems de decisión generados y verificados por un LLM a partir de conjuntos públicos; el cuerpo B aplica una sola pasada sobre una muestra mayor de ítems similares (unas 31.000).

Con 4.539.265.536 parámetros y un repositorio de 9,1 GB en safetensors, es relevante para quienes trabajan en evaluación automatizada, enrutamiento de decisiones o ensembles ligeros que quieran reutilizar un cuerpo ya ajustado sobre datos de MMLU, GSM8K, ANLI, Banking77, CLINC150, When2Call o Glaive, entre otros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5-4B (base vllm-sr/d3-mini); requiere `custom_code` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de vllm-sr/d3-mini, un cuerpo de la familia Qwen3.5-4B, y conserva su arquitectura transformer decoder-only. La construcción es un promedio de pesos: el punto de partida es la media uniforme de dos cuerpos públicos del pool mini (qhoenix/zils-mini-l13_avg678 y joamCriff123/zils-mini-sx3); sobre ese inicio se entrenan dos ramas y el resultado final es la media 0.5/0.5 de ambas.

El cuerpo A corresponde a zils-mini-decision-v7: tres pasadas LoRA secuenciales (rango 64, AdamW con lr 2e-5, una época cada una, semilla 553) sobre ítems tipo examen redactados y verificados por un LLM a partir de filas de train de datasets públicos (MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, commonsense_qa, tweet_eval, 20newsgroups, function calling de Glaive y tareas de BIG-bench). Las pasadas se ordenan por tipo: primero todos los ítems, luego los de puntuación y después los de razonamiento. Los objetivos son suaves: 0,5 × la distribución de respuesta del modelo de partida + 0,5 × la etiqueta gold. A esa rama se le suma 0,5 × el delta de pesos de un fine-tune LoRA del cuerpo interno de la casa (familia vllm-sr/d3-mini) sobre los mismos ítems. El cuerpo B es una única pasada LoRA (rango 64, lr 2e-5, una época, semilla 553) desde el mismo inicio, sobre una muestra mayor del mismo tipo de ítems (unas 31.000, en dos rondas de autoría) y con los mismos objetivos suaves.

No se documenta el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; el ajuste descrito es supervisado con destilación suave sobre etiquetas gold.

## Capacidades

- Clasificación y decisión sobre ítems tipo examen: opción múltiple, verdadero/falso, entailment (ANLI, BoolQ), sentimiento y sarcasmo.
- Puntuación numérica de respuestas (ítems "score-type") y razonamiento aritmético básico derivado de GSM8K y SVAMP.
- Function calling y decisión de invocación de herramientas, a partir de datos de Glaive y When2Call.
- Clasificación de intenciones en dominios de atención al cliente (Banking77, CLINC150).
- Categorización de texto largo (20newsgroups) y tareas diversas de BIG-bench.
- Formato de salida orientado a etiquetas cortas, no a diálogo abierto.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Evaluación automatizada de modelos: usar el cuerpo como juez de opción múltiple sobre ítems tipo MMLU o ANLI, aprovechando que fue ajustado con objetivos suaves sobre distribuciones de respuesta y etiquetas gold.
- Enrutamiento de consultas en atención al cliente: clasificar la intención de un mensaje entrante contra el esquema de Banking77 o CLINC150 antes de derivarlo a un agente especializado.
- Decisión de invocación de herramientas en pipelines de agentes: determinar si una consulta requiere llamar a una función y con qué argumentos, a partir del entrenamiento con Glaive y When2Call.
- Filtrado y moderación de reseñas: detección de sarcasmo y sentimiento en titulares y tuits (iSarcasm, sarcasm headlines, tweet_eval) como paso previo a un sistema de reputación.
- Verificación de consistencia lógica: comprobar entailment y contradicción entre pares de frases (ANLI) en pipelines de control de calidad documental.
- Clasificación temática de documentos: asignar categorías a textos largos (20newsgroups) en procesos de archivado o triaje de tickets.
- Puntuación automática de respuestas abiertas cortas: generar una puntuación numérica calibrada para rúbricas de evaluación educativa, gracias a los ítems score-type del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos moderados.
- Cuantización: el repositorio solo publica safetensors; no hay GGUF ni cuantizaciones oficiales. Cualquier cuantización a 8 o 4 bits requeriría convertirla el usuario, con la consiguiente pérdida de fidelidad en un modelo de decisión sensible a la distribución de salida.
- GPU recomendadas: A100 40 GB u H100 para despliegue en bf16 con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con lote pequeño; RTX 4080 (16 GB) queda justa pero viable.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más en bf16; en 12 GB requeriría cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el modelo declara `custom_code`); vLLM es plausible dado el origen del cuerpo base, pero no está verificado en la información disponible. llama.cpp y Ollama no son viables sin conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-decision-v8 | 4,54 B | no disponible | Cuerpo de decisión ajustado con LoRA sobre Qwen3.5-4B | Apache-2.0 | Hugging Face |
| vllm-sr/d3-mini (base) | no disponible | no disponible | Cuerpo base de la familia Qwen3.5-4B | no disponible | Hugging Face |
| qhoenix/zils-mini-l13_avg678 | no disponible | no disponible | Cuerpo mini del mismo pool, promedio de pesos | Apache-2.0 | Hugging Face |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | Cuerpo mini del mismo pool | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión: no está pensado para generación de texto libre ni diálogo multi-turno; su uso fuera de tareas de clasificación o puntuación producirá salidas de baja calidad.
- Objetivos de entrenamiento suaves (mezcla 0,5/0,5 con la distribución del modelo de partida): las salidas pueden heredar sesgos y errores del cuerpo base y de los cuerpos promediados.
- Datos de entrenamiento generados por un LLM y verificados automáticamente: posible propagación de errores de etiquetado en los ítems sintéticos.
- Riesgo de alucinación en ítems de razonamiento (GSM8K, SVAMP) si se usa fuera de distribución.
- Idiomas soportados no declarados: no se garantiza un comportamiento correcto en castellano ni en idiomas distintos del inglés de los datasets de origen.
- Longitud de contexto no documentada: no se debe asumir la ventana nativa de Qwen3.5-4B sin verificarla.
- Requiere `trust_remote_code=True` por el tag `custom_code`: implica ejecutar código del autor, con el riesgo de seguridad asociado.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base vllm-sr/d3-mini no declara licencia en la información disponible; conviene verificar la cadena de licencias antes de producción.
- Sin cuantizaciones oficiales ni benchmarks publicados: la evaluación previa a producción corre por cuenta del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-mini-decision-v8
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Cuerpo público del pool: https://huggingface.co/qhoenix/zils-mini-l13_avg678
- Cuerpo público del pool: https://huggingface.co/joamCriff123/zils-mini-sx3
- Versión previa del cuerpo A: https://huggingface.co/malkolm777/zils-mini-decision-v7
