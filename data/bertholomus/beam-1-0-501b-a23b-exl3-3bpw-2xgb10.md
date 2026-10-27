# bertholomus/Beam-1.0-501B-A23B-EXL3-3bpw-2xGB10

## Resumen

Beam-1.0-501B-A23B-EXL3-3bpw-2xGB10 es una cuantización de 3 bits en formato EXL3 del modelo Beam-1.0-501B-A23B de Reflection, un laboratorio estadounidense. El modelo original es un mixture-of-experts (MoE) de 501.000 millones de parámetros totales con 23.000 millones activos por token y una ventana de contexto de 655.360 tokens. Este repositorio, publicado por Bertholomus AI, contiene únicamente los pesos cuantizados; la plantilla de chat, el tokenizador y la licencia (Apache-2.0) son los de Reflection sin modificar.

El interés de esta ficha está en que el paquete permite ejecutar un MoE de esa escala en hardware de escritorio de gama alta para IA local: dos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una) conectadas en tensor-parallel 2 sobre un par de puertos RoCE de 200 Gb/s. Los pesos ocupan aproximadamente 91 GiB por nodo, más 1,6 GiB del drafter DFlash2, y un pool de KV de 5,9 GiB por nodo que cubre una petición completa de 655.360 tokens.

La receta combina cuantización selectiva (3 bits en todos los expertos enrutados, 6 bits en atención y MLP densos, BF16 en embeddings, norms, router y `lm_head`) con decodificación especulativa DFlash2 y servido mediante vLLM con el plugin vllm-exl3 sobre el backend ExLlamaV3. El autor reporta una divergencia KL media de 0,0132 frente al modelo BF16 y una velocidad de decodificación de 28-34 tok/s por stream en un solo nodo doble.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (52 capas × 256 expertos enrutados por capa, según la model card) |
| Parámetros totales | 501 B según la model card; el recuento agregado de safetensors del repo es 96.795.809.472 (discrepancia no explicada en la información disponible) |
| Parámetros activos | 23 B |
| Longitud de contexto | 655.360 tokens |
| Tipos de cuantización | EXL3: 3 bits en todos los expertos enrutados; 6 bits en atención (`qkv_gate_proj`, `o_proj`) y MLP densos; BF16 en embeddings, norms, router y `lm_head` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con cuantización EXL3 (librería `exllamav3`); ficheros `dense-L*`, `experts-L*`, `nonexpert-*` |
| Tamaño del repo | 193,7 GB (~194 GB de tensores) |
| Modelo base | `reflection/Beam-1.0-501B-A23B` (BF16) |
| Calibración de la cuantización | 128 secuencias, `requant_seq.py` de diffbot sobre exllamav3 v1.6.5 (`cdc785d`) |
| Decodificación especulativa | DFlash2, K=3, drafter `reflection/Beam-1.0-501B-A23B-DFlash2` (no incluido en el repo) |
| Paralelismo | Tensor-parallel 2 sobre un par de puertos RoCE de 200 Gb/s |
| Pipeline | `text-generation` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE disperso: 52 capas con 256 expertos enrutados cada una, de los que se activa una fracción por token hasta sumar 23 B de parámetros activos sobre 501 B totales. La información disponible no detalla la composición del dataset de preentrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card de Reflection, que no se ha incluido en esta ficha. Tampoco se documentan innovaciones de atención más allá del uso de decodificación especulativa en inferencia.

El trabajo técnico de este repositorio es la cuantización. Se aplica una política no uniforme: los expertos enrutados (el grueso del peso) bajan a 3 bits, mientras que las proyecciones de atención y los MLP densos se mantienen a 6 bits y los tensores sensibles a la calidad (embeddings, normas, router y cabeza de salida) quedan en BF16. La calibración usa 128 secuencias y el conversor de diffbot, portado a GB10. Sobre esa base, el servido añade el drafter DFlash2 con K=3, cuyo ratio de aceptación medido está entre 2,76 y 2,96 tokens por paso especulativo, y reparte el modelo en dos nodos con tensor-parallel 2 sobre RoCE.

## Capacidades

- Generación de texto y conversación multi-turno: el pipeline declarado es `text-generation` y la etiqueta `conversational` está presente, con plantilla de chat de Reflection incluida sin cambios.
- Contexto muy largo: ventana publicada de 655.360 tokens, con una prueba real de 632.185 tokens de prompt más 8 tokens generados.
- Razonamiento y código: el autor mide velocidades separadas para prompts de código y de prosa, lo que sugiere uso previsto en ambos dominios, pero no se aportan resultados de calidad por tarea.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Decodificación especulativa integrada: sí, vía DFlash2 con K=3.
- Despliegue multi-nodo: sí, tensor-parallel 2 sobre dos GB10.

## Casos de uso

- Análisis de documentación técnica extensa: con 655.360 tokens de contexto se puede cargar un repositorio completo, un pliego de condiciones o varios manuales en una sola petición; el autor reporta 837 tok/s de prefill en un prompt de 632.185 tokens, lo que hace viable el procesamiento por lotes de documentos muy largos en local.
- Asistente de código sobre base de código propia: la ventana permite incluir múltiples ficheros y el histórico de la sesión; la decodificación en código rinde 34,2 tok/s en un stream y 60,3 tok/s agregados con 4 streams, adecuado para un equipo pequeño que comparte el par de nodos.
- Despliegue on-premise con requisito de confidencialidad: al ejecutarse íntegramente en dos máquinas propias, ningún token ni prompt sale de la infraestructura del cliente; encaja en sectores con restricciones de transferencia de datos.
- Procesamiento por lotes de contratos o expedientes: con 4 streams concurrentes a 55-60 tok/s agregados y TTFT de 0,37 s en servidor inactivo, se puede mantener una cola de resúmenes y extracciones sin intervención humana continua.
- Generación de documentación larga con contexto acumulado: el modelo sostiene conversaciones de decenas de miles de tokens (29,6 tok/s con prompt de 46K en prosa), útil para redactar especificaciones que crecen iterativamente.
- Laboratorio de evaluación de cuantizaciones: el repositorio incluye la metodología de medición de KL contra el BF16 (272.251 posiciones, top-128 logprobs), lo que lo convierte en una referencia práctica para estudiar la pérdida de calidad de EXL3 a 3 bits en modelos MoE de gran escala.
- Inferencia aislada en edge de altas prestaciones: dos DGX Spark consumen mucho menos que un rack de GPU de datacenter y caben en una oficina técnica, lo que habilita prototipos con un modelo de 501 B sin acceso a clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización y de velocidad sobre la configuración servida.

Calidad frente al BF16 (KL sobre `eval_neutral` de AtomicChat, 133 chunks × 4.096 tokens, 272.251 posiciones, top-128 logprobs vía API de vLLM; cota inferior del KL completo):

| Métrica | Valor |
|---|---|
| KL media | 0,0132 |
| KL mediana | 0,00098 |
| KL q99 | 0,177 |
| Acuerdo top-1 | 96,66 % |
| Ratio de perplejidad vs BF16 | 1,0125 |

Velocidad (dos DGX Spark, vLLM TP2, DFlash2 K=3, HTTP, temperatura 0; medianas de 3 ejecuciones, rango entre corchetes):

| Escenario | Resultado |
|---|---|
| Decode, 1 stream, código, prompt 2K | 34,2 tok/s [32,4-35,0] |
| Decode, 1 stream, prosa, prompt 2K | 28,9 tok/s [28,1-30,2] |
| Decode, 1 stream, código, prompt 36K | 32,3 tok/s [29,9-32,8] |
| Decode, 1 stream, prosa, prompt 46K | 29,6 tok/s [26,8-30,3] |
| Decode, 4 streams, código, prompt 2K (agregado) | 60,3 tok/s [58,4-65,0] |
| Decode, 4 streams, 46K (agregado) | 55,0 tok/s código / 54,6 tok/s prosa |
| Prefill, prompt 8K | 1.306-1.411 tok/s (TTFT 5,5-5,7 s) |
| Prefill, prompt 46K | 1.371 tok/s (TTFT 33,5 s) |
| TTFT en chat corto (servidor inactivo) | 0,37 s [0,37-0,47] |
| Prompt más largo probado | 632.185 tokens + 8 tokens nuevos en 755,7 s (837 tok/s) |
| Longitud media de aceptación DFlash2 | 2,76-2,96 |

Las filas de decode y prefill se midieron con ventana de 400.000 tokens; la prueba de prompt largo usó la ventana publicada de 655.360.

## Requisitos de hardware

- VRAM/memoria unificada: ~91 GiB de pesos por nodo, más ~1,6 GiB del drafter DFlash2 por nodo y un pool de KV de 5,9 GiB por nodo para una petición de 655.360 tokens. El autor mantiene al menos 9 GiB de memoria de sistema libre por nodo bajo carga (mínimo observado ~9,3 GiB).
- GPU objetivo: dos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una). Build aarch64 / `sm_121`.
- GPU de consumo: no cabe. Los ~194 GB de tensores exceden la memoria de cualquier GPU consumer individual (RTX 4090, 24 GB; RTX 5090, 32 GB) y el formato EXL3 no está pensado para offload a RAM del sistema en este despliegue.
- Interconexión: tensor-parallel 2 sobre un par de puertos RoCE de 200 Gb/s; no se documenta funcionamiento sobre PCIe o Ethernet convencional.
- Opciones de despliegue: vLLM con la imagen de Reflection `vllm/vllm-openai:reflection-beam-arm64-cu130`, el plugin vllm-exl3 con el parche de Beam de diffbot y el backend ExLlamaV3. No se menciona soporte de llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: TTFT de 0,37 s en chat corto; 28-34 tok/s por stream en decode; 55-60 tok/s agregados con 4 streams; prefill de ~1,3-1,4K tok/s hasta 46K de prompt.
- Ajuste de memoria: en imágenes de nodo con menos memoria libre, el autor recomienda bajar `KV_MEM` y `MAX_MODEL_LEN` conjuntamente, a razón de ~1 GiB por cada 100K tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / licencia | Hardware | Disponibilidad |
|---|---|---|---|---|---|
| Beam-1.0-501B-A23B-EXL3-3bpw-2xGB10 (este repo) | 501 B totales / 23 B activos | 655.360 | EXL3 3/6 bits, safetensors; Apache-2.0 | 2× DGX Spark (GB10) | Pesos publicados; 0 descargas en el momento de la consulta |
| reflection/Beam-1.0-501B-A23B (BF16) | 501 B totales / 23 B activos | 655.360 | BF16 safetensors; Apache-2.0 | Requiere ~1 TB de memoria (estimación a partir del recuento de parámetros); no viable en 2× GB10 | Modelo base de referencia |
| Receta EXL3 de diffbot para Beam (misma cuantización, otro hardware) | 501 B totales / 23 B activos | No disponible | EXL3; requiere comprobar licencia del parche (AGPL-3.0-only) | GPU de datacenter, no especificado en esta información | No disponible |
| reflection/Beam-1.0-501B-A23B-DFlash2 | Drafter especulativo | No aplica | Apache-2.0 | Se ejecuta junto al modelo principal | Publicado por Reflection, no incluido en este repo |

No se dispone de datos de benchmarks del modelo base ni de cuantizaciones alternativas en la información proporcionada, por lo que no es posible una comparación de rendimiento por tarea frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Solo contiene pesos cuantizados: la model card, los benchmarks y el formato de prompt viven en la página del modelo base de Reflection. Cualquier evaluación de capacidades debe consultarse allí.
- Discrepancia en el recuento de parámetros: los safetensors del repo suman 96.795.809.472 parámetros, frente a los 501 B declarados en la model card. La información disponible no explica la diferencia; conviene verificarlo antes de planificar capacidad.
- Métrica de calidad limitada: el KL publicado se calcula sobre top-128 logprobs, que el propio autor describe como cota inferior del KL completo. No sustituye a una evaluación de tareas.
- Sin validación independiente: el repositorio registra 0 descargas y 0 likes en el momento de la consulta y está fechado en octubre de 2026; no hay terceros que hayan replicado las mediciones.
- Dependencia dura del hardware: la receta asume dos GB10 con build aarch64/`sm_121` y RoCE de 200 Gb/s. No es portable a GPUs x86 convencionales sin trabajo adicional.
- Riesgo de licencias en la cadena de herramientas: los pesos y la imagen de vLLM son Apache-2.0, pero el plugin vllm-exl3 es AGPL-3.0 y el parche de Beam de diffbot es AGPL-3.0-only. Un uso comercial que integre ese componente debe revisar obligaciones de copyleft.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- Sesgos y alucinación: no se aporta información sobre evaluación de sesgos, mitigaciones o tasas de alucinación del modelo base.
- Ajuste fino de memoria delicado: con menos de ~9 GiB libres por nodo hay que reducir `KV_MEM` y `MAX_MODEL_LEN`, lo que recorta el contexto efectivo (aproximadamente 1 GiB por cada 100K tokens).
- Bertholomus AI declara no estar afiliado a Reflection, diffbot, NVIDIA ni al resto de proyectos citados; no hay soporte oficial del autor del modelo base para esta cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bertholomus/Beam-1.0-501B-A23B-EXL3-3bpw-2xGB10
- Modelo base (Reflection): https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Drafter DFlash2: https://huggingface.co/reflection/Beam-1.0-501B-A23B-DFlash2
- Receta de despliegue para 2× DGX Spark: https://github.com/bertholomus/beam-1.0-2x-dgx-spark
- Búsqueda web: no se han encontrado enlaces técnicos relevantes (papers, blogs o demos) sobre este modelo; los resultados devueltos por la búsqueda no guardan relación con el contenido de la ficha y se han descartado.
