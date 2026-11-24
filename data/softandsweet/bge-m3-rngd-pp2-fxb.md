# softandsweet/bge-m3-rngd-pp2-fxb

## Resumen

`softandsweet/bge-m3-rngd-pp2-fxb` es un artefacto de compilación (FXB) del modelo de embeddings multilingüe BAAI/bge-m3, empaquetado para su ejecución sobre dos aceleradores Furiosa RNGD con paralelismo de pipeline (PP=2) y paralelismo de tensor (TP=8 PE). No se trata de un modelo entrenado desde cero ni de un fine-tune de pesos: el autor parte de la revisión `ee8da99793523403fa2147e1df4d3830b6efb2af` del repositorio `furiosa-ai/bge-m3` y genera un binario compilado con Furiosa SDK 2026.4.0 en perfil BF16 dense embedding. El repositorio en Hugging Face tiene 0 GB de tamano, lo que confirma que solo contiene el artefacto FXB y metadatos, no los pesos originales.

El modelo base, BGE-M3, es un encoder transformer de BAAI orientado a sentence-similarity que produce vectores densos de 1.024 dimensiones y soporta recuperación multilingüe, multi-vector y multi-granularidad. Esta release concreta restringe la longitud de secuencia a un bucket de 128 tokens y batch 1, por lo que su uso previsto es la generación de embeddings de frases cortas en un servidor con dos RNGD, servido mediante `furiosa-llm serve` con una API compatible con `/v1/embeddings`.

La relevancia de esta ficha es acotada: es un ejemplo de despliegue de inferencia en hardware NPU propietario (Furiosa RNGD) más que una contribución algorítmica. Resulta útil para equipos que ya operan Furiosa SDK 2026.4.0 y necesitan un perfil de embeddings validado para dos dispositivos, pero no aporta mejoras de calidad sobre el BGE-M3 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BGE-M3, dense embedding); artefacto FXB compilado para Furiosa RNGD con TP 8PE y PP 2 |
| Parametros totales | no disponible (heredados de BAAI/bge-m3; no se indica cifra en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (bucket unico de compilacion, `--max-model-len 128`) |
| Tipos de cuantizacion | BF16 (perfil dense embedding); no se indican otras precisiones |
| Idiomas soportados | no disponible en la ficha; la model card menciona coreano y multilingueismo del modelo base |
| Licencia | MIT |
| Formato de pesos | FXB (Furiosa Executable Binary); los pesos originales se descargan aparte desde `furiosa-ai/bge-m3` en formato del repositorio base |
| Dimension del embedding | 1.024 |
| Hardware objetivo | 2 x Furiosa RNGD (`npu:0,npu:1`) |
| SDK requerido | Furiosa SDK 2026.4.0, `furiosa-llm==2026.4.0` |
| SHA-256 del FXB | `441eb550fe63edd48e8af6a1014c086a62dec89fa30c51e2a7530a142edcdb2f` |

## Arquitectura y entrenamiento

El modelo subyacente es BGE-M3, un encoder transformer de BAAI diseñado para embeddings de frases y recuperación de información. Esta release no entrena ni ajusta pesos: compila el grafo del modelo a un binario FXB mediante `fxb build` con `-tp 8 -pp 2`, nivel de optimización `-O O0`, conversión `--convert embed` y concurrencia 3. El resultado es un ejecutable para el runtime `furiosa-llm` que distribuye el encoder en pipeline de dos etapas sobre dos NPU RNGD, con particionado de tensor de 8 PE por etapa.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del corpus ni procesos de RLHF/DPO en la información proporcionada; esos detalles corresponden al modelo base BAAI/bge-m3 y no se reproducen aquí. La innovación técnica de esta release es exclusivamente de despliegue: perfil BF16 dense, bucket fijo de 128 tokens y batch 1, lo que simplifica la compilación y reduce el consumo de memoria a costa de no admitir secuencias largas ni batching dinámico.

## Capacidades

- Generación de embeddings densos de 1.024 dimensiones para frases y documentos cortos (hasta 128 tokens).
- Similitud semántica entre frases y cálculo de distancias vectoriales para búsqueda.
- Recuperación de información multilingüe, incluyendo coreano, según la model card del autor.
- Servicio HTTP compatible con el endpoint `/v1/embeddings` mediante `furiosa-llm serve`.
- Ejecución en pipeline paralelo sobre dos NPU RNGD con particionado de tensor de 8 PE.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo de embeddings, no generativo.
- No soporta secuencias superiores a 128 tokens en esta compilación concreta.

## Casos de uso

- Búsqueda semántica de documentos cortos: indexar títulos, resúmenes y fragmentos de hasta 128 tokens en una base vectorial y consultar por similitud coseno usando los embeddings de 1.024 dimensiones.
- Deduplicación de registros: comparar pares de frases (nombres de producto, direcciones, descripciones breves) y agrupar los que superen un umbral de similitud, aprovechando el perfil BF16 para mantener la precisión numérica.
- Clasificación zero-shot por prototipos: calcular el embedding de una consulta y compararlo con centroides de categorías previamente embebidos, útil en enrutado de tickets o etiquetado ligero.
- RAG sobre corpus coreano y multilingüe: generar embeddings de pasajes cortos con el modelo servido en `/v1/embeddings` e integrarlos en un pipeline de recuperación aumentada, siempre que los fragmentos no excedan 128 tokens.
- Filtrado previo en pipelines de moderación o spam: embedding rápido de mensajes cortos para recuperar los más próximos a un conjunto de ejemplos etiquetados y derivar la decisión a un modelo mayor.
- Despliegue en infraestructura NPU existente: equipos que ya operan servidores con dos Furiosa RNGD y Furiosa SDK 2026.4.0 pueden levantar un servicio de embeddings sin GPU, reutilizando el binario FXB validado.
- Evaluación comparativa de hardware: usar el mismo modelo base compilado en RNGD frente a ejecuciones en GPU para medir latencia y throughput en tareas de similitud de frases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta verificaciones de compilación, integridad del archivo y la configuración `fxb show` con TP 8PE y PP 2; no incluye métricas de calidad (MTEB, MIRACL u otras) ni cifras de latencia o throughput.

## Requisitos de hardware

- Dos aceleradores Furiosa RNGD en el mismo servidor, accesibles como `npu:0` y `npu:1` (verificar con `furiosa-smi info`).
- Furiosa SDK 2026.4.0 y `furiosa-llm==2026.4.0`; Python 3.11 recomendado en el ejemplo del autor.
- VRAM: no aplica en el sentido convencional; el modelo se ejecuta en memoria de los NPU RNGD. No se indica el consumo exacto de memoria del dispositivo.
- No es compatible con GPU NVIDIA/AMD ni con ejecución en CPU según la información disponible; el artefacto FXB está compilado para RNGD.
- No cabe en GPU de consumo (RTX 4090, etc.) porque el binario es específico de la arquitectura Furiosa.
- Opciones de despliegue: `furiosa-llm serve` con `--fxb`, `--max-model-len 128`, `-pp 2`, `-dp 1` y `--devices npu:0,npu:1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension del embedding | Contexto | Licencia | Hardware |
|---|---|---|---|---|---|
| softandsweet/bge-m3-rngd-pp2-fxb | FXB compilado de BGE-M3 para RNGD | 1.024 | 128 tokens (bucket de compilacion) | MIT | 2 x Furiosa RNGD |
| BAAI/bge-m3 | Encoder de embeddings original | 1.024 | Hasta 8.192 tokens según el modelo base | MIT | GPU/CPU según runtime |
| furiosa-ai/bge-m3 | Revision base usada para compilar | 1.024 | Según perfil de compilacion | MIT | Furiosa RNGD |

La comparación con alternativas de embeddings como E5, GTE o instructor no está disponible en la información proporcionada; no se aportan métricas que permitan situar este artefacto frente a ellas.

## Limitaciones y advertencias

- Ventana de contexto limitada a 128 tokens: cualquier entrada más larga requiere truncado o división previa, lo que puede degradar la calidad de la recuperación.
- Batch fijo de 1 en la compilación: el throughput puede ser bajo para indexación masiva; no se documenta soporte de batching dinámico.
- Dependencia estricta de Furiosa SDK 2026.4.0 y del hardware RNGD; el artefacto no es portable a otras plataformas.
- El repositorio no contiene los pesos: es necesario descargar la revisión concreta `ee8da99793523403fa2147e1df4d3830b6efb2af` de `furiosa-ai/bge-m3`, y una revisión distinta puede invalidar el binario.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos en similitud semántica cuando se comparan frases cortas o ambiguas.
- Sesgos: no se documentan análisis de sesgo para esta compilación; los sesgos del modelo base BAAI/bge-m3 se heredan sin evaluación adicional.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y del SDK de Furiosa, que se distribuyen por separado.
- El autor no publica métricas de calidad ni pruebas de extremo a extremo más allá de la validación de compilación; para producción conviene ejecutar una evaluación propia sobre el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/softandsweet/bge-m3-rngd-pp2-fxb
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Revisión compilada del modelo base: https://huggingface.co/furiosa-ai/bge-m3/tree/ee8da99793523403fa2147e1df4d3830b6efb2af
- Guía de modelos Furiosa: https://huggingface.co/furiosa-ai/bge-m3
- Documentación FXB de Furiosa: https://developer.furiosa.ai/v2026.4.0/en/furiosa_llm/fxb.html
- Releases multi-NPU (FuryAwesome): https://github.com/smallstep-zzz/furyawesome/blob/main/MULTI_NPU.md
- Registro de compilación: validation.json (referenciado en la model card del repositorio)
