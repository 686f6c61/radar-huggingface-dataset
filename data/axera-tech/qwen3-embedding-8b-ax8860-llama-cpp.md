# AXERA-TECH/Qwen3-Embedding-8B-AX8860-llama.cpp

## Resumen

Qwen3-Embedding-8B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que adapta el modelo de embeddings Qwen3-Embedding-8B (desarrollado originalmente por el equipo Qwen de Alibaba) para ejecutarse sobre la NPU de cuatro nucleos del SoC AX8860 de la propia Axera. No se trata de un modelo nuevo: los pesos provienen integramente del GGUF del modelo base, y el aporte del repositorio es la infraestructura de ejecucion (kernels NPU, binarios estaticos de llama.cpp y scripts de arranque y benchmark).

El modelo base es un transformer de 36 capas con dimension oculta de 4096 que genera vectores de embedding de 4096 dimensiones, orientado a recuperacion de informacion, busqueda semantica y tareas de similitud textual. Con 7.567.295.488 parametros totales y un contexto fijo de 4096 tokens, esta pensado para cargas de trabajo de embeddings en produccion mas que para generacion de texto.

La relevancia de este paquete es que demuestra la viabilidad de ejecutar un modelo de embeddings de casi 8.000 millones de parametros en hardware de borde (edge) con aceleracion NPU, con una fidelidad numerica muy alta respecto a la referencia en CPU (coseno minimo de 0,999595 en 20 frases de prueba) y latencias de 232 ms para 256 tokens y 3,4 s para 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (36 capas, hidden 4096), modelo de embeddings |
| Parametros totales | 7.567.295.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (fijo) |
| Tipos de cuantizacion | BF16 (unico formato incluido en el paquete) |
| Idiomas soportados | no disponible (la model card del paquete no los declara; el benchmark de correccion usa frases en chino e ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16, 15,1 GB) |
| Dimension del embedding | 4096 |
| Hardware objetivo | NPU AX8860 de 4 nucleos (SDK V0.5.0 o superior) |
| Runtime | llama.cpp con ggml-axera (fork ZHEQIUSHUI/llama.cpp @ 1970d6c5d) |
| Tamano del repo | 15,2 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-8B, un transformer denso de 36 capas y 4096 dimensiones ocultas que produce representaciones vectoriales de 4096 dimensiones. El paquete no aporta informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF/DPO o tecnicas de contraste); esa informacion corresponderia a la model card original de Qwen, que no se incluye en los datos disponibles.

La innovacion tecnica de este repositorio es de caracter de despliegue: los bancos de pesos BF16 se convierten en tiempo de carga y se copian como bloques completos a la memoria CMM del SoC, con una KV cache tambien en BF16. Todo el modelo se empaqueta como un unico kernel NPU descrito por un `manifest.json`. El servidor se arranca con `--embedding --pooling last -np 1`, es decir, pooling sobre el ultimo token y una sola ranura de procesamiento. El binario `llama-server` expone una API compatible con el endpoint `/v1/embeddings` de OpenAI.

## Capacidades

- Generacion de embeddings de texto normalizados en L2, con 4096 dimensiones por entrada.
- Procesamiento por lotes: el script `run.sh -f texts.txt` genera un embedding por linea de entrada.
- Servicio HTTP compatible con OpenAI (`/v1/embeddings`), lo que permite integrarlo en pipelines existentes sin cambios de cliente.
- Soporte de prefijos de instruccion para consultas de recuperacion, segun lo especificado en la model card del modelo base.
- Capacidades multilingues: no declaradas explicitamente en el paquete; la validacion de correccion cubre chino e ingles.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni modalidades de vision o audio: es exclusivamente un modelo de extraccion de caracteristicas (feature extraction).

## Casos de uso

- Busqueda semantica sobre corpus documentales: indexar fragmentos de hasta 4096 tokens y recuperar por similitud coseno; el contexto fijo de 4096 tokens encaja con chunking estandar de RAG.
- RAG (retrieval-augmented generation) en el borde: desplegar el servidor de embeddings en el propio dispositivo AX8860 evita enviar documentos sensibles a la nube y elimina la latencia de red.
- Deduplicacion y agrupamiento de documentos: generar embeddings por lotes con `run.sh -f` y aplicar clustering sobre los vectores de 4096 dimensiones.
- Clasificacion zero-shot por similitud: comparar la representacion de un texto con las de etiquetas descriptivas, util para triaje de tickets o moderacion sin entrenamiento adicional.
- Sistemas de recomendacion basados en contenido: vectorizar catalogos de articulos y perfiles de usuario para calcular afinidad semantica.
- Monitorizacion de similitud en produccion: detectar derivas o duplicados en flujos de datos comparando embeddings de referencias historicas frente a nuevas entradas.
- Evaluacion de calidad de traduccion o parafrasis: medir similitud semantica entre original y variante mediante coseno sobre los vectores generados.

## Benchmarks y rendimiento

Rendimiento medido con `bench.sh` sobre NPU AX8860 de 4 nucleos, tres ejecuciones por tamano de entrada:

| Longitud de entrada | Mediana | Minimo | Maximo |
|---|---:|---:|---:|
| 256 tokens | 232,4 ms | 230,4 ms | 438,7 ms |
| 1024 tokens | 838,3 ms | 836,4 ms | 891,9 ms |
| 4096 tokens (entrada real 4095) | 3421,5 ms | 3420,0 ms | 3554,0 ms |

Correccion frente a la referencia de transformers en CPU:

| Metrica | Valor |
|---|---|
| Coseno minimo (20 frases chino/ingles) | 0,999595 |
| Coseno medio | 0,999746 |
| Coincidencia de orden y top-1 en 4 consultas de recuperacion | 100 % |

No se han publicado resultados de benchmarks estandar (MMLU, MTEB, etc.) en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC AX8860 con NPU de 4 nucleos y SDK V0.5.0 o superior. No se contempla ejecucion en GPU convencional con este paquete.
- Memoria: el GGUF BF16 ocupa 15,1 GB; el repositorio completo son 15,2 GB. Los bancos de pesos se copian integros a la memoria CMM del SoC, por lo que se requiere capacidad de memoria del sistema acorde.
- No cabe en GPU de consumo (RTX 4090, etc.) con este paquete tal cual; seria necesario convertir los pesos a otro formato y usar llama.cpp estandar, extremo no documentado en la informacion disponible.
- Despliegue: binarios estaticos `llama-embedding` y `llama-server` incluidos en `bin/`, con `LD_LIBRARY_PATH=/opt/lib`, `GGML_AXERA_KERNEL_DIR=<repo>/kernels` y `-ngl 99`.
- La NPU queda ocupada en exclusiva por el proceso (`-np 1`), lo que limita el paralelismo a una peticion simultanea.
- Latencia y throughput: ver tabla de benchmarks; el coste escala de forma aproximadamente lineal con la longitud de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Embedding-8B-AX8860 (este paquete) | 7,57 B | 4096 | 4096 | no disponible | GGUF BF16 + binarios AX8860 |
| Qwen/Qwen3-Embedding-8B (modelo base) | 7,57 B | no disponible en los datos | 4096 | no disponible | Hugging Face (pesos originales) |
| Otros modelos de embeddings de ~8 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (MTEB u otros) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Contexto fijo de 4096 tokens: no admite entradas mas largas sin truncado; el benchmark envia 4095 tokens para dejar margen al token adicional que pueda anadir el servidor.
- La NPU de 4 nucleos queda monopolizada por el proceso, con una sola ranura (`-np 1`); no es adecuado para servir cargas concurrentes altas.
- Solo se distribuyen pesos en BF16; no hay variantes cuantizadas a menor precision en el paquete, lo que fija el requisito de memoria en 15,1 GB.
- Dependencia estricta de hardware y SDK propietarios (AX8860, SDK V0.5.0+), lo que limita la portabilidad.
- La licencia no esta declarada en la informacion disponible; debe verificarse en el repositorio del modelo base antes de cualquier uso comercial.
- Los idiomas soportados no estan declarados; la validacion solo cubre chino e ingles, por lo que el comportamiento en castellano no esta verificado en este paquete.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de representaciones pobres en dominios o idiomas alejados de la distribucion de entrenamiento del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-Embedding-8B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (commit `1970d6c5d`)
