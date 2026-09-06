# myllmbox/Qwen3.8-Flash-Next-hibrid47

## Resumen

`myllmbox/Qwen3.8-Flash-Next-hibrid47` es una build de precision mixta del modelo `Qwen/Qwen3.8-Flash-Next`, desarrollada por `myllmbox` para ejecutarse en un cluster de dos NVIDIA DGX Spark (GB10) con memoria unificada. El checkpoint original no cabe en un solo Spark; esta version cuantiza la tabla n-gram PLE de 95 GB como NVFP4 (28.6 GiB) y la mantiene como parametro GPU residente dentro del forward pass, eliminando el gather por CPU de la version anterior `hibrid46`. El modelo tiene 94.905.514.899 parametros en safetensors y activa 6.000 millones por token, con una ventana de contexto de 262.000 tokens.

La arquitectura es hibrida: combina atencion lineal GDN, atencion QSA, expertos enrutados y compartidos, una tabla n-gram PLE y un drafter MTP para decodificacion especulativa. Segun las mediciones del autor, en dos DGX Spark con TP=2 sobre ConnectX RDMA y vLLM alcanza 80 tok/s pico a 1 stream y 533 tok/s promedio a 32 streams concurrentes. Es relevante para investigadores que necesitan desplegar un modelo de 6B activos con contexto largo en hardware de memoria unificada, aprovechando cuantizacion NVFP4 y optimizaciones de bajo nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: MoE con atencion lineal GDN, atencion QSA, expertos compartidos y enrutados, tabla n-gram PLE y drafter MTP |
| Parametros totales | 94.905.514.899 |
| Parametros activos | 6.000 millones activos por token (segun informacion del modelo base) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 (expertos enrutados y drafter), NVFP4 W4A16 (proyecciones GDN), bf16 (resto); int3 solo en hibrid46 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | safetensors (19 shards de cuerpo + 8 shards de tabla PLE NVFP4 + index) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next tiene 125B parametros principales mas 51B de embeddings n-gram, con 6B activos por token. Este checkpoint cuantizado contiene 94.905.514.899 parametros en safetensors. Segun la informacion del modelo base, su entrenamiento redujo el coste a aproximadamente 1/9 frente a Qwen3.7-Plus y mejora en codigo y tareas de oficina. No se proporcionan detalles de datos de entrenamiento ni de RLHF/DPO en la informacion disponible.

La innovacion principal es el tratamiento de la tabla n-gram PLE: se almacena como NVFP4 con codigos e2m1, escala de bloque fp8 por 16 y un fp32 global, en 8 shards. Esta tabla se carga como parametro GPU residente dentro del forward pass y de los CUDA graphs, evitando el detour por CPU de hibrid46. El checkpoint usa precision mixta: 39% de los pesos en NVFP4 W4A4, las proyecciones GDN en NVFP4 W4A16, y el resto en bf16. Incluye un drafter MTP con K=4 para decodificacion especulativa. La tabla NVFP4 requiere un parche en `ple_layer.py` del autor; el checkpoint en si es estandar safetensors.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable (thinking on/off).
- Ventana de contexto de 262.000 tokens, apta para documentos largos o codigo fuente extenso.
- Decodificacion especulativa MTP con K=4; la tasa de aceptacion medida es 2.5 en prosa de razonamiento, 4.2-4.3 en prosa tipo "pasture" y 4.2 en codigo.
- Salida estructurada (structured-output prompt), segun las condiciones de benchmark del autor.
- Codigo y tareas de oficina, segun la informacion publicada del modelo base.
- El modo thinking y el contexto largo permiten razonamiento multi-paso; no se menciona soporte nativo de agentes.
- No se menciona soporte de tool calling, vision ni audio en la informacion disponible.
- Idiomas soportados no especificados.

## Casos de uso

- Servicio de inferencia multi-usuario en un cluster de dos DGX Spark: el modelo alcanza 533 tok/s promedio con 32 streams concurrentes y hasta 579 tok/s pico. Con la tabla PLE NVFP4 sharded entre ambos nodos, se estiman 80+ asientos, lo que lo hace adecuado para laboratorios con muchos usuarios simultaneos.
- Analisis de documentos largos: la ventana de 262.000 tokens permite procesar repositorios de codigo completos, contratos o documentacion tecnica en una sola pasada, activando el modo thinking para razonamiento profundo sobre el contenido.
- Generacion de codigo asistida por MTP: la tasa de aceptacion de 4.2 en codigo y la salida estructurada permiten integrarlo en pipelines de generacion o autocompletado, reduciendo el coste por token generado.
- Investigacion sobre cuantizacion NVFP4: el repo incluye `make-hibrid47.py`, el parche del motor y las herramientas de benchmark. Es un caso de uso para estudiar el impacto de tablas n-gram cuantizadas en calidad y rendimiento.
- Despliegue en hardware DGX Spark con memoria unificada: la tabla NVFP4 GPU-resident elimina el gather por CPU, reduciendo la latencia por paso entre un 8% y un 11% frente a hibrid46. Adecuado para prototipado de agentes en un entorno local.
- Asistente de razonamiento para tareas de oficina: el modelo base destaca en tareas de oficina; con contexto largo puede resumir, comparar y extraer informacion de grandes volumenes de texto en una sola consulta.
- Evaluacion de estrategias de despliegue en cluster: el kit de dos nodos en GitHub permite reproducir las mediciones de rendimiento y comparar configuraciones de KV y sharding de la tabla PLE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Las mediciones disponibles son de rendimiento de inferencia, realizadas por el autor en 2× DGX Spark GB10, TP=2 sobre ConnectX RDMA, vLLM, MTP K=4, temperatura 1.0, prompt de salida estructurada y thinking off.

| Concurrencia | Pasos de motor/s | tok/s agregado promedio | pico | tok/s por stream |
|---|---|---|---|---|
| 1 | 17.7 | 73-76 | 80 | 76 |
| 2 | 15.1 | 126 | 133 | 63 |
| 4 | 11.8 | 198 | 209 | 50 |
| 8 | 8.8 | 294 | 309 | 37 |
| 16 | 6.2 | 417 | 451 | 26 |
| 24 | 4.9 | 488 | 514 | 20 |
| 32 | 4.0 | 533 | 579 | 17 |

Con thinking activado a c=32, el rendimiento baja a 320-340 tok/s, con una tasa de aceptacion de 2.5 en prosa de razonamiento. Las mediciones son de ventanas estables de 10 segundos, excluyendo warm-up y prefill.

## Requisitos de hardware

- Uso de memoria unificada (no VRAM): ~50 GiB por nodo con la tabla PLE sharded entre ambos nodos (KV 40-46 GiB, 80+ asientos); ~65 GiB por nodo con la tabla completa en cada uno (KV 25 GiB, ~49 asientos).
- En un solo DGX Spark, el checkpoint carga (~102 GiB) pero deja ~9 GiB para KV, limitando a c≤8.
- GPU recomendadas: 2× NVIDIA DGX Spark GB10 con ConnectX RDMA para TP=2; un solo GB10 solo para cargas muy ligeras.
- No cabe en GPU de consumo; requiere memoria unificada de 119 GB o multiples nodos.
- Opciones de despliegue: vLLM con MTP K=4 y el parche del autor en `ple_layer.py`; kit de dos nodos en GitHub.
- Latencia y throughput estimados: 80 tok/s pico a 1 stream, 533 tok/s promedio a 32 streams (ver tabla de rendimiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Hardware objetivo | Rendimiento medido |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B n-gram, 6B activos | no disponible | no disponible | no disponible | no disponible |
| hibrid46 | 94.905.514.899 (mismo cuerpo) | 262k | int3 table + NVFP4/bf16 | 1 DGX Spark | no disponible en esta ficha |
| hibrid47 | 94.905.514.899 | 262k | NVFP4/bf16 | 2 DGX Spark | 533 tok/s a 32 streams; 80 pico a 1 stream |

hibrid46 es la version de referencia para un solo Spark; hibrid47 es la version para dos Sparks, con la tabla PLE en NVFP4 y mejor calidad en la prueba de render "boss-animals". No se han publicado benchmarks de calidad para ninguno de los modelos comparados.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos en la informacion disponible.
- Riesgo de alucinacion no evaluado; no hay benchmarks de calidad publicados.
- La calidad del modelo cuantizado NVFP4 puede diferir del original. En la prueba de 32 escenas "boss-animals" con thinking activado: 26 buenas, 3 parciales, 3 rotas. No hay comparativa con el modelo base.
- El checkpoint requiere el parche del autor en `ple_layer.py` y el kit de dos nodos; no es un despliegue estandar con vLLM sin modificaciones.
- El rendimiento depende de `vm.compaction_proactiveness=0`, que requiere permisos root. Sin este ajuste, se observan caidas de 4-5 segundos cada ~37 segundos.
- En un solo DGX Spark, el espacio para KV queda en ~9 GiB, limitando la concurrencia a c≤8.
- Idiomas soportados no especificados en la informacion disponible.
- Licencia Qwen Community License 1.0: uso comercial permitido, pero productos con mas de 100M MAU o 20M dolares de ingresos mensuales deben mostrar el nombre del modelo; negocios de Model-as-a-Service o asistentes IA necesitan una licencia Qwen separada.

## Enlaces

- https://huggingface.co/myllmbox/Qwen3.8-Flash-Next-hibrid47
- https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- https://huggingface.co/myllmbox/Qwen3.8-Flash-Next-hibrid46
- https://huggingface.co/Inferact/Qwen3.8-Flash-Next-NVFP4
- https://github.com/bilikaz/qwen38-flash-next-cluster-recipe.git
- https://github.com/QwenLM/Qwen3.8-Flash-Next/
