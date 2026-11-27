# AXERA-TECH/Qwen3-Embedding-8B-AX8860-llama.cpp

## Resumen

Qwen3-Embedding-8B-AX8860-llama.cpp es una distribucion empaquetada del modelo de embeddings Qwen3-Embedding-8B de Alibaba Qwen, adaptada por AXERA-TECH para ejecutarse en la NPU de cuatro nucleos del SoC AX8860 mediante una bifurcacion de llama.cpp con backend ggml-axera. El modelo base es un transformer de 36 capas con dimension oculta 4096 que produce vectores de embedding de 4096 dimensiones, con 7.567.295.488 parametros totales. El repositorio incluye los pesos en formato GGUF BF16 (15,1 GB), los binarios estaticos para la placa (`llama-embedding` y `llama-server`), los kernels NPU precompilados y scripts de ejecucion y benchmark.

El problema que resuelve es la ejecucion de un modelo de embeddings de gran tamano en hardware de borde con aceleracion NPU, sin depender de una GPU dedicada ni de servicios en la nube. La distribucion expone una API compatible con OpenAI (`/v1/embeddings`) y permite tanto la generacion de vectores individuales como el procesamiento por lotes desde fichero de texto, lo que facilita su integracion en pipelines de recuperacion (RAG) desplegados on-premise.

Es relevante ahora porque demuestra la viabilidad de servir un modelo de embeddings de 8B en silicio de borde con contexto fijo de 4096 tokens y latencias medidas en el propio paquete: 232,4 ms para 256 tokens, 838,3 ms para 1024 tokens y 3421,5 ms para 4096 tokens. La ficha se centra en esta distribucion concreta; los datos del modelo base que no figuren en la informacion proporcionada se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-Embedding-8B); 36 capas, hidden 4096, embeddings de 4096 dimensiones |
| Parametros totales | 7.567.295.488 |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | 4096 tokens (fijo en esta distribucion) |
| Tipos de cuantizacion | BF16 (unico formato empaquetado en este repositorio) |
| Idiomas soportados | no disponible de forma oficial; la validacion de correctitud cubre chino e ingles |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16), 15,1 GB |
| Pooling | last (`--pooling last`) |
| Backend de ejecucion | llama.cpp con ggml-axera sobre NPU AX8860 (4 nucleos) |
| Requisitos de SDK | AX8860 con SDK V0.5.0 o superior |
| Tamano del repositorio | 15,2 GB |
| Descargas / likes | 198 / 1 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-8B, un transformer de 36 capas con dimension oculta 4096 que genera representaciones vectoriales de 4096 dimensiones para tareas de recuperacion y similitud semantica. Esta distribucion no reentrena el modelo: parte de los pesos originales y los convierte a GGUF BF16. En tiempo de carga, los bancos de pesos BF16 se convierten y se copian como bloques completos a la memoria CMM de la NPU, y la cache KV se mantiene tambien en BF16.

La innovacion tecnica principal es el backend ggml-axera integrado en la bifurcacion de llama.cpp de ZHEQIUSHUI (commit `6613735ce`), que compila el modelo completo en un unico kernel NPU descrito por `manifest.json`. El servidor se lanza con `--embedding --pooling last -np 1`, y la invocacion directa requiere `LD_LIBRARY_PATH=/opt/lib`, `GGML_AXERA_KERNEL_DIR=<repo>/kernels` y `-ngl 99`. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de embeddings de texto normalizados en L2, con 4096 dimensiones por entrada.
- Procesamiento por lotes: una linea de un fichero de texto produce un embedding (`./run.sh -f texts.txt`).
- Servidor compatible con OpenAI: endpoint `/v1/embeddings` que acepta listas de cadenas de entrada.
- Soporte de prefijos de instruccion para consultas de recuperacion, segun lo especificado en la model card del modelo base.
- Uso en tareas de similitud semantica, busqueda densa y recuperacion aumentada por generacion (RAG).
- Capacidad multilingue: la validacion del paquete cubre oraciones en chino e ingles; el resto de idiomas no esta documentado en esta distribucion.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no tiene modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica on-premise: indexar documentos con los embeddings de 4096 dimensiones y resolver consultas con prefijo de instruccion; la NPU del AX8860 permite mantener el servicio en el propio dispositivo sin GPU.
- RAG en entornos con requisitos de privacidad: el modelo se ejecuta integramente en la placa y expone `/v1/embeddings`, de modo que los textos no salen de la infraestructura local.
- Deduplicacion y agrupamiento de documentos: calcular embeddings por lotes desde fichero y agrupar por similitud coseno; la validacion reporta una similitud minima de 0,999595 frente a la referencia de transformers en CPU.
- Clasificacion y enrutado por similitud: comparar la consulta del usuario contra un conjunto de prototipos embebidos para dirigirla al flujo o al modelo generativo adecuado.
- Sistemas de recomendacion basados en contenido: representar items y perfiles de usuario como vectores y ordenar candidatos por cercania en el espacio de 4096 dimensiones.
- Filtrado y moderacion semantica: detectar entradas proximas a patrones conocidos comparando embeddings en tiempo de peticion, con latencias de 232,4 ms para entradas de 256 tokens.
- Evaluacion de calidad de traduccion o parafrasis: medir la similitud entre pares de oraciones en chino e ingles, el escenario cubierto por la validacion del paquete.

## Benchmarks y rendimiento

Rendimiento de inferencia medido con `bench.sh` en la NPU AX8860 de cuatro nucleos, tres ejecuciones por tamano de entrada:

| Entrada | Latencia mediana | Minimo | Maximo |
|---|---:|---:|---:|
| 256 tokens | 232,4 ms | 230,4 ms | 438,7 ms |
| 1024 tokens | 838,3 ms | 836,4 ms | 891,9 ms |
| 4096 tokens (entrada real 4095) | 3421,5 ms | 3420,0 ms | 3554,0 ms |

Correctitud frente a la referencia de transformers en CPU: 20 oraciones en chino e ingles, coseno minimo 0,999595 y coseno medio 0,999746; en 4 consultas de recuperacion, el orden de documentos y el top-1 coinciden exactamente con la referencia.

No se han publicado en la informacion disponible resultados de benchmarks academicos (MMLU, MTEB, HumanEval, GSM8K u otros) para esta distribucion.

## Requisitos de hardware

- Hardware obligatorio: SoC AX8860 con NPU de cuatro nucleos y SDK V0.5.0 o superior. La distribucion no esta pensada para GPU de escritorio ni para CPU generica.
- Memoria: los pesos BF16 ocupan 15,1 GB y se copian como bancos completos a la memoria CMM de la NPU; el modelo toma los cuatro nucleos NPU en exclusiva durante la ejecucion.
- VRAM estimada en GPU: no disponible; el paquete no incluye pesos para CUDA ni para otros backends.
- GPU recomendadas: no aplica a esta distribucion. Para ejecutar el modelo base Qwen3-Embedding-8B en GPU haria falta el repositorio original, cuyos requisitos no se detallan en la informacion proporcionada.
- Despliegue: binarios estaticos `llama-embedding` y `llama-server` incluidos en `bin/`, con `run.sh` como lanzador. No se documenta soporte para vLLM, Ollama ni TGI en este paquete.
- Throughput: con 838,3 ms por entrada de 1024 tokens en una unica instancia (`-np 1`), el rendimiento ronda 1,2 entradas por segundo a esa longitud; a 256 tokens, aproximadamente 4,3 entradas por segundo. No se documenta procesamiento concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Embedding-8B-AX8860-llama.cpp (esta ficha) | 7,57B | 4096 | 4096 | no disponible | GGUF BF16 para NPU AX8860 |
| Qwen/Qwen3-Embedding-8B (modelo base) | 7,57B | no disponible en la informacion | 4096 | no disponible en la informacion | Pesos originales en Hugging Face |
| Alternativas de otros tamanos o familias | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento del modelo base ni de modelos competidores, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Contexto fijo de 4096 tokens: las entradas mas largas no se pueden procesar y el benchmark envia 4095 tokens para dejar margen al token adicional del servidor.
- Exclusividad de hardware: el runtime ocupa los cuatro nucleos NPU del AX8860, lo que impide compartir la NPU con otras cargas simultaneas.
- Dependencia de plataforma: requiere SDK V0.5.0 o superior y los kernels precompilados del repositorio; no es portable a otras NPU ni a GPU sin recompilar el backend.
- Un unico formato de pesos (BF16): no se ofrecen variantes cuantizadas de menor precision, lo que fija el consumo de memoria en 15,1 GB.
- Modelo no generativo: no produce texto ni admite tool calling, agentes o razonamiento multi-paso; su unico cometido es generar embeddings.
- Idiomas: la validacion solo cubre chino e ingles; el comportamiento en castellano u otros idiomas no esta verificado en esta distribucion.
- Licencia no disponible: antes de un uso comercial es necesario consultar la licencia del modelo base Qwen/Qwen3-Embedding-8B y la de la bifurcacion de llama.cpp utilizada.
- Riesgo de sesgo y alucinacion: no se documentan evaluaciones de sesgo; como modelo de representacion, puede reproducir sesgos presentes en los datos de entrenamiento del modelo base y producir similitudes erroneas en dominios alejados de su distribucion.
- Madurez: primera publicacion el 2026-11-15, con 198 descargas y 1 like; no hay historial de mantenimiento mas alla de la version inicial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-Embedding-8B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Bifurcacion de llama.cpp utilizada: https://github.com/ZHEQIUSHUI/llama.cpp (commit `6613735ce`)
- Documentacion, paper o blog de AXERA-TECH sobre esta distribucion: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
