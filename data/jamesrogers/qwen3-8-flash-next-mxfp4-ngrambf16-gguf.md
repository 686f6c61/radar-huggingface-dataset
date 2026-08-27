# jamesrogers/Qwen3.8-Flash-Next-MXFP4-ngramBF16-GGUF

## Resumen

Qwen3.8-Flash-Next-MXFP4-ngramBF16-GGUF es una cuantizacion personalizada del modelo Qwen/Qwen3.8-Flash-Next, un MoE ultra-disperso de 125B parametros (6B activos por token) con arquitectura qwen4_exp, desarrollada por el usuario jamesrogers. Esta version en formato GGUF esta optimizada para servir el modelo en configuraciones hibridas de una sola GPU con descarga a CPU, utilizando MXFP4 para los expertos enrutados, BF16 a precision completa para la tabla n-gram (PLE) de 51 GB, y Q8_0/F32 para los componentes criticos de calidad como atencion, delta-net, experto compartido y router.

El modelo base, publicado por Qwen el 26 de agosto de 2026, introduce una arquitectura hibrida GDN + QSA: tres de cada cuatro capas usan Gated DeltaNet para comprimir el historial, mientras que la cuarta usa Qwen Sparse Attention para recuperacion precisa de largo alcance. Con una ventana de contexto de 262K tokens, esta cuantizacion permite ejecutar el modelo completo en una RTX 5090 de 32 GB con ayuda de CPU, alcanzando ~40 tok/s en decodificacion libre y ~66 tok/s en cargas de trabajo agente con decodificacion especulativa sin perdidas.

La relevancia de esta ficha radica en que es una de las primeras cuantizaciones publicas del modelo Qwen3.8-Flash-Next, e incluye una variante con la cabeza MTP (Multi-Token Prediction) de 2.6B parametros que los convertidores publicos suelen descartar, habilitando decodificacion especulativa con una tasa de aceptacion medida de 0.93-0.99.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-disperso con GDN + QSA (qwen4_exp) |
| Parametros totales | 125B (incluye tabla n-gram de 51B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | MXFP4 (expertos), Q8_0/F32 (atencion, delta-net, experto compartido, router), BF16 (tabla n-gram) |
| Idiomas soportados | no disponible |
| Licencia | qwen (license: other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura hibrida de atencion que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA). Tres de cada cuatro capas utilizan GDN para comprimir el historial de forma eficiente, mientras que la cuarta capa usa QSA para recuperacion precisa de informacion de largo alcance. El modelo cuenta con 512 expertos enrutados por capa, un experto compartido y una tabla n-gram (PLE) de 51B parametros que complementa la representacion de embeddings.

Esta cuantizacion personalizada aplica una estrategia de precision selectiva: los expertos enrutados se almacenan en MXFP4, un formato de punto flotante de 4 bits con bloque de escala, que resulta especialmente eficiente para descarga a CPU; la tabla n-gram se conserva en BF16 a precision completa porque solo se accede mediante busquedas por fila, lo que permite mantenerla en NVMe mediante mmap sin coste de RAM ni perdida de calidad; y los componentes criticos (atencion, delta-net, experto compartido y router) se mantienen en Q8_0 o F32.

La variante MTP del archivo incluye la cabeza de prediccion multi-token de 2.6B parametros (33 tensores, block_count=49, nextn_predict_layers=1) que los convertidores publicos descartan, permitiendo decodificacion especulativa sin perdidas con `--spec-type mtp:n_max=4`.

## Capacidades

- Generacion de texto y razonamiento avanzado gracias a la arquitectura hibrida GDN + QSA.
- Capacidades multimodales heredadas del modelo base Qwen3.8-Flash-Next (texto e imagen).
- Soporte de decodificacion especulativa sin perdidas mediante n-gram (ngram-mod) o la cabeza MTP incluida en la variante MTP, con tasa de aceptacion medida de 0.93-0.99.
- Ventana de contexto de 262K tokens, suficiente para documentos extensos y conversaciones multi-turno prolongadas.
- Optimizado para cargas de trabajo agente con edicion intensiva, donde la decodificacion especulativa alcanza ~66 tok/s.
- Compatible con llama.cpp (PR #27742) e ik_llama.cpp (PR #2365), incluyendo la rama qwen4exp-mtp para la variante con cabeza MTP.

## Casos de uso

- Asistentes de codigo agente: la combinacion de decodificacion especulativa y la optimizacion para cargas de edicion intensiva permite alcanzar ~66 tok/s en tareas de modificacion de codigo multi-archivo, superando la latencia de la decodificacion libre (~40 tok/s).
- Analisis de documentos extensos: la ventana de 262K tokens permite procesar libros completos, expedientes legales o repositorios de codigo enteros en una sola pasada, con la tabla n-gram en BF16 preservando la calidad de las predicciones.
- Despliegue hibrido GPU+CPU: la cuantizacion MXFP4 de los expertos permite ejecutar el modelo en una sola GPU de 32 GB con descarga a CPU, reduciendo el coste de hardware frente a las configuraciones multi-GPU que exigiria el modelo BF16 original.
- Investigacion sobre cuantizacion MoE: la estrategia de precision selectiva (MXFP4 para expertos, BF16 para n-gram, Q8_0 para atencion) documenta un enfoque reproducible para cuantizar modelos MoE ultra-dispersos sin perdida significativa de calidad.
- Experimentacion con decodificacion especulativa MTP: la variante con cabeza MTP de 2.6B parametros permite estudiar el impacto de la prediccion multi-token en la tasa de aceptacion y el throughput, con datos medidos de 0.93-0.99 de aceptacion.
- Servicio de inferencia de largo contexto en entornos con RAM limitada: el uso de mmap para la tabla n-gram de 51 GB permite mantenerla en NVMe sin coste de RAM, liberando memoria para el contexto de 262K tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo card del autor proporciona las siguientes mediciones de rendimiento en hardware RTX 5090 32GB + Threadripper 9960X con `-ngl 999 -ncmoe 38`:

| Metrica | Valor |
|---|---|
| Decodificacion libre | ~40 tok/s |
| Cargas agente con edicion intensiva (con decodificacion especulativa) | ~66 tok/s |
| Prefill | ~850-1200 tok/s |
| Tasa de aceptacion del draft (MTP o ngram-mod) | 0.93-0.99 |
