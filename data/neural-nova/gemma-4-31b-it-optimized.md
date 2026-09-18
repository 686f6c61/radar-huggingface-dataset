# neural-nova/gemma-4-31B-it-optimized

## Resumen

`neural-nova/gemma-4-31B-it-optimized` no es un modelo de pesos, sino una receta de despliegue reproducible para servir `google/gemma-4-31B-it` con vLLM. El repositorio contiene un `Dockerfile` basado en `vllm/vllm-openai:v0.20.0`, un script de arranque del servidor (`launch_server.sh`) con dos configuraciones (baseline y optimized) y un script de reproducción de benchmarks (`run_benchmark.sh`). Los pesos no se alojan aquí: `vllm serve` los descarga y cachea desde el repositorio upstream en el momento del arranque, por lo que el artefacto distribuido es únicamente la infraestructura de servicio y su método de medida.

El modelo subyacente se describe en la propia model card como un transformer denso, instruction-tuned y multimodal, de 30,7B parámetros, 60 capas y tamaño oculto de 5.376, con atención de ventana deslizante en parte de las capas (32 cabezas de consulta / 16 cabezas KV) y capas globales (32 / 4). La longitud de contexto nativa declarada es de 262.144 tokens, aunque el benchmark se ejecuta con `--max-model-len 24576` y con las entradas de imagen y audio desactivadas, es decir, en un escenario estrictamente texto.

La relevancia del repositorio es operativa: cuantifica cuánto se gana al activar caché KV en FP8 (e4m3), `--gpu-memory-utilization 0.95`, `--max-num-seqs 128`, `--max-num-batched-tokens 16384`, prefix caching, chunked prefill y el backend de atención FlashInfer sobre una única NVIDIA H100 de 80 GB. Según la tabla publicada, el throughput de peticiones pasa de 0,85 a 1,41 req/s y el de tokens de salida de 220,3 a 365,6 tok/s, a costa de un empeoramiento del TPOT medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (capas de ventana deslizante y capas globales); multimodal en origen, servido en modo solo texto |
| Parametros totales | 30,7B (30.7B) |
| Parametros activos | No aplica: modelo denso, todos los parámetros activos |
| Longitud de contexto | 262.144 tokens nativos; 24.576 tokens configurados en el benchmark (`--max-model-len`) |
| Tipos de cuantizacion | Caché KV en FP8 (e4m3); cuantización de pesos no disponible en la información |
| Idiomas soportados | No disponible |
| Licencia | MIT en este repositorio; la licencia del modelo upstream no está declarada (la model card incluye un `TODO` explícito para añadirla) |
| Formato de pesos | No aplica a este repositorio, que no contiene pesos; no se especifica el formato que descarga vLLM desde el repositorio upstream |

Otros datos técnicos declarados: 60 capas, tamaño oculto 5.376, 32 cabezas de consulta, 16 cabezas KV en capas de ventana deslizante y 4 cabezas KV en capas globales, y `--trust-remote-code` necesario en el arranque.

## Arquitectura y entrenamiento

La información disponible describe la arquitectura del modelo servido, no su proceso de entrenamiento. Se trata de un transformer denso de 30,7B parámetros con atención híbrida: parte de las capas emplea ventana deslizante (32 cabezas de consulta frente a 16 KV) y otra parte usa atención global (32 frente a 4), un patrón que reduce el coste de memoria de la caché KV en las capas locales. El modelo es multimodal (acepta imagen y audio) e instruction-tuned, aunque la receta aquí documentada desactiva ambos modalidades con `--limit-mm-per-prompt '{"image": 0, "audio": 0}'` para liberar VRAM destinada a la caché KV.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro tipo de alineamiento. La innovación técnica destacable del repositorio no está en el modelo sino en la configuración de servicio: caché KV en FP8 e4m3, prefix caching, chunked prefill, FlashInfer como backend de atención, un límite de 128 secuencias concurrentes y 16.384 tokens por lote, todo sobre paralelismo tensorial 1 en una sola GPU.

## Capacidades

- Generación de texto en modo instrucción: el modelo subyacente se describe como instruction-tuned, y la receta valida el endpoint `/v1/completions` de la API compatible con OpenAI que expone vLLM.
- Capacidad multimodal declarada en origen (imagen y audio), explícitamente deshabilitada en esta configuración de servicio; el benchmark se realiza con entradas de texto únicamente.
- Ventana de contexto larga: 262.144 tokens nativos según la model card, aunque la configuración medida limita a 24.576 tokens.
- Servicio concurrente: soporte de hasta 128 secuencias simultáneas (`--max-num-seqs 128`) con prefix caching y chunked prefill, lo que favorece cargas con prefijos repetidos (por ejemplo, prompts de sistema compartidos).
- Reutilización de caché entre peticiones mediante prefix caching, útil en escenarios multi-turno y RAG con contexto común.
- Tool calling, function calling, uso como agente, modo de razonamiento extendido (thinking) y cobertura multilingüe: no disponible en la información proporcionada.
- Optimización de memoria en inferencia: caché KV en FP8 e4m3 y `--gpu-memory-utilization 0.95`, lo que permite sostener la concurrencia objetivo en una única H100-80GB.
- Reproducibilidad de rendimiento: el repositorio incluye un script que levanta ambas configuraciones, las mide y emite la tabla comparativa de forma automática.

## Casos de uso

- Servicio de inferencia autoalojado en modo solo texto: la receta arranca `vllm serve` con flags ya validados sobre 1x H100-80GB, de modo que un equipo puede desplegar un endpoint compatible con OpenAI sin tener que iterar sobre la configuración de memoria o de batching.
- Cargas de alta concurrencia con prompts largos: con 128 secuencias concurrentes y 16.384 tokens por lote, resulta adecuado para backends de asistentes conversacionales donde muchas peticiones comparten un prompt de sistema extenso y se benefician del prefix caching.
- RAG sobre documentación extensa: el modelo declara 262.144 tokens de contexto nativo, por lo que permite concatenar muchos fragmentos recuperados en una sola petición; en esta receta el límite práctico es de 24.576 tokens, suficiente para la mayoría de pipelines de recuperación con decenas de pasajes.
- Procesamiento por lotes de textos largos (resumen, extracción de entidades, clasificación): el throughput medido de 365,6 tokens de salida por segundo en la configuración optimizada permite estimar el coste y el tiempo de un job por lotes antes de lanzarlo.
- Endpoint interno compatible con la API de OpenAI: al usar `vllm/vllm-openai:v0.20.0`, cualquier cliente que hable con `/v1/completions` puede apuntar al contenedor, lo que simplifica migrar cargas existentes sin cambiar el código de aplicación.
- Plantilla de referencia para evaluar configuraciones de vLLM: `run_benchmark.sh` ejecuta baseline y optimizada de forma automatizada con `vllm bench serve` y deja los JSON por ejecución y los logs de arranque en `/workspace`, útil como base metodológica para comparar flags en otro hardware.
- Validación en CI/CD de cambios de infraestructura: el mismo script permite comprobar de forma objetiva si un cambio de versión de vLLM, de backend de atención o de política de memoria degrada el throughput o el TTFT antes de promoverlo a producción.
- Despliegue contenerizado en clúster con GPU: el `Dockerfile` con `--ipc=host` y el montaje del caché de HuggingFace facilitan su integración en orquestadores, siempre que se gestione el token de acceso al repositorio upstream.

## Benchmarks y rendimiento

La model card publica únicamente resultados de servicio (throughput y latencia), no de calidad. El escenario es 1x NVIDIA H100-80GB, vLLM v0.20.0, paralelismo tensorial 1, dataset sintético `random` con ratio 0,8, entradas de 409 a 3.686 tokens (nominal 2.048) y salidas de 51 a 460 tokens (nominal 256), 1.000 prompts medidos tras 10 de calentamiento, tasa de peticiones ilimitada y concurrencia objetivo de 128.

| Metrica | Baseline | Optimized |
|---|---|---|
| Request throughput (req/s) | 0,85 | 1,41 |
| Output tok/s | 220,3 | 365,6 |
| Total tok/s | 2013,7 | 3341,8 |
| TTFT media (ms) | 133.009,7 | 70.845,6 |
| TTFT p99 (ms) | 155.345,7 | 81.829,6 |
| TPOT media (ms) | 34,7 | 58,2 |
| ITL | No disponible: la fila aparece truncada en la model card | No disponible: la fila aparece truncada en la model card |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- GPU medida: 1x NVIDIA H100-80GB, paralelismo tensorial 1. Es la única configuración validada en la model card.
- VRAM: la receta optimized reserva el 95 % de la memoria de la GPU (`--gpu-memory-utilization 0.95`) y usa caché KV en FP8 e4m3. No se publica el desglose de VRAM entre pesos, caché KV y activaciones.
- Estimación orientativa: 30,7B parámetros en BF16 equivalen a unos 61,4 GB de pesos, cálculo aritmético a partir del número de parámetros declarado; no procede de una medición publicada y no incluye caché KV ni activaciones.
- GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090, RTX 3090 u otras GPU de consumo, ni sobre cuantizaciones de pesos de 4 u 8 bits que permitan reducir el requisito de VRAM.
- Opciones de despliegue documentadas: vLLM v0.20.0 sobre la imagen `vllm/vllm-openai:v0.20.0`, con Docker (`--gpus all --ipc=host`) o mediante los scripts `launch_server.sh` y `run_benchmark.sh`. No se documentan llama.cpp, Ollama, TGI ni otros motores.
- Backend de atención: FlashInfer (`VLLM_ATTENTION_BACKEND=FLASHINFER`) en la configuración optimizada.
- Requisitos de entorno: `--trust-remote-code`, `HF_TOKEN` si el repositorio upstream de Google está restringido, y volumen para `~/.cache/huggingface` con el fin de evitar descargas repetidas.
- Rendimiento medido con 128 secuencias concurrentes: TTFT media de 70.845,6 ms y p99 de 81.829,6 ms; TPOT media de 58,2 ms; 1,41 req/s y 365,6 tokens de salida por segundo en la configuración optimizada.
- Latencia y throughput en otros regímenes de concurrencia o en longitudes de entrada distintas a las del benchmark: no disponible.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos alternativos en la información disponible. La única comparación cuantitativa documentada es interna, entre las dos configuraciones de servicio del mismo modelo.

| Alternativa comparada | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Configuracion baseline (misma receta) | 30,7B | 24.576 tokens configurados | 0,85 req/s; 220,3 tok/s de salida; TTFT media 133.009,7 ms; TPOT media 34,7 ms | MIT (repositorio) | Incluida en `launch_server.sh baseline` |
| Configuracion optimized (misma receta) | 30,7B | 24.576 tokens configurados | 1,41 req/s; 365,6 tok/s de salida; TTFT media 70.845,6 ms; TPOT media 58,2 ms | MIT (repositorio) | Incluida en `launch_server.sh optimized` |
| Otros modelos de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: su utilidad depende por completo de la disponibilidad del repositorio upstream `google/gemma-4-31B-it`, que puede estar restringido y requerir aceptar una licencia y pasar `HF_TOKEN`.
- La propia model card incluye un `TODO` sin resolver para añadir la licencia del modelo upstream al frontmatter. La licencia MIT declarada cubre los scripts y el `Dockerfile`, pero no aclara las condiciones de uso comercial del modelo servido.
- El benchmark usa un dataset sintético (`random`) con distribución uniforme de longitudes, no tráfico real. Las longitudes de entrada (409-3.686 tokens) y salida (51-460 tokens) son muy inferiores al contexto declarado, por lo que los resultados no son extrapolables a peticiones de decenas de miles de tokens.
- El TTFT absoluto es muy alto incluso en la configuración optimizada (70.845,6 ms de media, 81.829,6 ms en p99) con concurrencia 128 y `--max-model-len 24576`. Para aplicaciones interactivas habría que reducir concurrencia o longitud máxima y volver a medir.
- La optimización mejora el throughput pero degrada el TPOT medio (de 34,7 a 58,2 ms), es decir, cada token se genera más lento a pesar de que el sistema procesa más peticiones por segundo.
- La fila de ITL de la tabla de resultados aparece truncada en la model card, por lo que la comparación de latencia entre tokens queda incompleta.
- No hay ningún benchmark de calidad (razonamiento, código, matemáticas, multilingüe) ni evaluación de sesgos o de tendencia a la alucinación. No es posible valorar la adecuación del modelo a tareas concretas a partir de esta información.
- Las capacidades multimodales (imagen y audio) están desactivadas en esta receta; cualquier caso de uso que las requiera necesita otra configuración y, previsiblemente, más VRAM.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay validación independiente de los resultados publicados.
- La configuración mide con `--max-model-len 24576`, muy por debajo del contexto nativo declarado de 262.144 tokens; explotar la ventana completa implicaría un consumo de caché KV mucho mayor y probablemente otro hardware.
- Los resultados dependen de la versión exacta del stack (vLLM v0.20.0, Transformers 5.x, FlashInfer, imagen `vllm/vllm-openai:v0.20.0`); cambios de versión pueden alterar las cifras.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/neural-nova/gemma-4-31B-it-optimized
- Modelo upstream referenciado en la model card: https://huggingface.co/google/gemma-4-31B-it
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre su autor (los resultados obtenidos corresponden a Neural DSP, al Institut du Cerveau, al diccionario Larousse y a la entrada sobre redes neuronales de Wikipedia), por lo que no hay papers, blogs, repositorios ni demos adicionales que enlazar.
