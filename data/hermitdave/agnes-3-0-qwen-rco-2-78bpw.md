# hermitdave/Agnes-3.0-Qwen-RCO-2.78bpw

## Resumen

Agnes-3.0-Qwen RCO 2.78bpw es una cuantizacion de precision mixta del modelo multimodal Agnes-3.0-Qwen, publicada por el usuario hermitdave en Hugging Face. El modelo base, desarrollado por Agnes-AI, emplea la arquitectura experimental `qwen4_exp`: 48 capas que alternan 36 capas de atencion lineal Gated-DeltaNet con 12 capas de atencion completa (una de cada cuatro), 512 expertos enrutados con top-10, una tabla de embeddings n-gram PLE en la capa 1, una cabeza de prediccion multi-token (MTP) y una torre de vision. Con aproximadamente 180.000 millones de parametros totales, esta pensado para razonamiento multimodal sobre Apple Silicon.

La relevancia de esta publicacion concreta no esta en el modelo base sino en la tecnica de cuantizacion: una asignacion de precision mixta guiada por sensibilidad (metodo `rco-mlx`) que combina expertos enrutados a 2 y 3 bits mientras mantiene atencion, routers, normas y expertos compartidos a 4 bits. El resultado son 2,7789 bits por peso reales (incluyendo escalas y sesgos en BF16) y un checkpoint de 80,29 GB que cabe en un Mac con 64 GB de memoria unificada, algo imposible con el paquete BF16 original de 360 GB.

El modelo esta orientado a inferencia local en hardware Apple mediante la libreria MLX, con decodificacion especulativa via MTP y una ventana de contexto verificada de 65.536 tokens en esta compilacion. Es un artefacto claramente experimental, con solo 28 descargas y sin likes, dirigido a desarrolladores que quieran evaluar modelos MoE multimodales grandes en equipos de sobremesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: 48 capas (36 Gated-DeltaNet de atencion lineal + 12 de atencion completa), 512 expertos enrutados con top-10, tabla PLE de n-gramas, cabeza MTP, torre de vision |
| Parametros totales | 179.999.981.459 (~180 B) |
| Parametros activos | no disponible (top-10 sobre 512 expertos enrutados, sin recuento publicado) |
| Longitud de contexto | 65.536 tokens verificados en esta compilacion (la configuracion upstream declara 1.048.576 posiciones) |
| Tipos de cuantizacion | Precision mixta affine: 4 bits (atencion, expertos compartidos, normas, routers, escalas), expertos enrutados mixtos 2/3 bits (111 modulos a 2 bits, 33 a 3 bits), tabla PLE a 4 bits (grupo 32), cabeza MTP a 4 bits; `embed_tokens` y `lm_head` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en la model card) |
| Formato de pesos | safetensors (MLX, contenedores U32 empaquetados; tabla PLE en 22 shards `ngram-*.safetensors` separados) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura `qwen4_exp`, un diseno hibrido que combina atencion lineal y atencion completa. De las 48 capas, 36 usan Gated-DeltaNet (atencion lineal con estado recurrente de tamano fijo) y 12 usan atencion completa, intercaladas cada cuatro capas. La capa MoE cuenta con 512 expertos enrutados y enrutamiento top-10, complementados por expertos compartidos. Ademas, incorpora una tabla de embeddings n-gram de busqueda paralela (PLE) en la capa 1 y una cabeza de prediccion multi-token (MTP) que habilita decodificacion especulativa. La torre de vision del modelo original se conserva intacta en esta cuantizacion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card de esta cuantizacion tampoco detalla esos aspectos.

La innovacion tecnica de esta publicacion reside en el proceso de cuantizacion. Se aplico una asignacion de precision mixta guiada por sensibilidad mediante `rco-mlx`, con cuantizacion RTN (round-to-nearest) y busqueda de clip por grupo, sin matriz de importancia (imatrix). El asignador concentro el presupuesto de 3 bits en los 33 grupos (capa, proyeccion) de expertos donde la ganancia en reduccion de perdida era mayor, dejando 111 modulos a 2 bits. Un detalle relevante es que la tabla PLE se almacena en shards independientes para permitir memory-mapping y paginacion desde SSD en lugar de mantener 32 GB residentes, activable con `qwen4_ple_ssd_offload: true` en oMLX. La model card documenta ademas una correccion de contabilidad: el asignador original cargaba solo 16 bits por grupo (la escala) cuando MLX almacena escala y sesgo en BF16 (32 bits por grupo a tamano 64), lo que anadia 0,5 bpw no contabilizados; el objetivo nominal de 2,4939 bpw correspondia a 2,7789 bpw reales.

## Capacidades

- Generacion de texto y razonamiento multimodal: el pipeline es `image-text-to-text`, con la torre de vision del modelo original preservada.
- Razonamiento de varios pasos: la arquitectura incorpora cabeza MTP y soporte de decodificacion especulativa.
- Procesamiento de contexto largo: ventana verificada de 65.536 tokens, con un coste de KV de aproximadamente 32,6 KB por token gracias a que solo 12 de las 48 capas son de atencion completa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Modo thinking: la evaluacion de calidad se realizo con thinking desactivado, lo que implica que el modelo dispone de ese modo, aunque no se detallan sus caracteristicas.

## Casos de uso

- Evaluacion de modelos MoE multimodales en Apple Silicon: un desarrollador con un Mac de 64 GB de memoria unificada puede cargar un modelo de 180.000 millones de parametros y medir latencia, throughput y calidad reales sin acceso a un cluster de GPU. Es el escenario principal para el que existe este artefacto.
- Procesamiento de documentos largos con imagenes: con 65.536 tokens de contexto verificado, el modelo puede ingerir informes, contratos o articulos extensos acompanados de figuras y responder preguntas sobre el conjunto completo en una sola pasada.
- Analisis de capturas de pantalla y diagramas tecnicos: la torre de vision permite extraer informacion de interfaces, graficos y esquemas, util para tareas de documentacion tecnica o auditoria de UI.
- Prototipado de asistentes conversacionales multi-turno: el formato MLX y la integracion con oMLX permiten levantar un servidor local de inferencia para probar flujos conversacionales con contexto largo antes de invertir en infraestructura de GPU.
- Investigacion sobre cuantizacion deprecision mixta: el checkpoint sirve como caso de estudio reproducible de asignacion de bits guiada por sensibilidad, con numeros de error de reconstruccion y calidad documentados para comparar con otras estrategias.
- Experimentacion con decodificacion especulativa: la cabeza MTP incluida permite probar tecnicas de speculative decoding en hardware Apple y medir su impacto en tok/s frente a decodificacion estandar.
- Generacion de codigo asistida en local: aunque no hay benchmarks de codigo publicados para esta compilacion, el modelo base es de proposito general y puede usarse para autocompletado y explicacion de codigo en un entorno sin conexion, con la cautela de que la calidad a 2,78 bpw no esta validada en esa tarea.

## Benchmarks y rendimiento

Calidad zero-shot, 200 muestras por tarea, decodificacion greedy, thinking desactivado, prompts identicos entre compilaciones:

| Compilacion | hellaswag | arc_challenge | winogrande | mmlu | media |
|---|---|---|---|---|---|
| agnes-2.78bpw (esta) | 92,00 | 94,50 | 73,00 | 85,50 | **86,25** |
| agnes-2.56bpw | 92,00 | 93,50 | 75,50 | 82,50 | **85,88** |
| suelo (2 bits uniformes en todos los modulos) | 15,50 | 28,00 | no alcanzado | no alcanzado | 21,75 |

Las diferencias entre las dos compilaciones ajustadas caen dentro del ruido de muestreo (aproximadamente ±2,5 puntos por tarea con 200 muestras). La fila de suelo es un control negativo: forzar todos los modulos a 2 bits colapsa la calidad por debajo del azar. No se midio la recuperacion frente a una referencia BF16 porque no existe una compilacion MLX en BF16 de este checkpoint.

Rendimiento medido en oMLX sobre Apple Silicon M3 Max (64 GB de memoria unificada), un solo flujo, generacion de 128 tokens:

| Prompt (tokens) | TTFT | TPOT | Decodificacion (tok/s) | Prefill (tok/s) | Memoria pico |
|---|---|---|---|---|---|
| 1.024 | 3,2 s | 26,1 ms | 38,6 | 316,6 | 48,18 GB |
| 8.192 | 24,9 s | 27,8 ms | 36,3 | 329,0 | 49,08 GB |
| 65.536 | 101,0 s | 28,1 ms | 35,9 | 649,0 | 50,95 GB |

El prefill esta limitado por ancho de banda y mejora con la longitud del prompt; la decodificacion refleja el coste de desquantizacion.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint ocupa 80,29 GB en disco; la memoria pico medida en inferencia es de 48,18 GB con prompt de 1.024 tokens y 50,95 GB con 65.536 tokens. Con `qwen4_ple_ssd_offload` activado, la tabla PLE (32 GB) se pagina desde SSD en lugar de residir en memoria.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo es Apple Silicon. La medicion publicada usa un M3 Max con 64 GB de memoria unificada. No se documenta soporte para A100, H100 ni RTX 4090 en esta publicacion.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con al menos 64 GB de memoria unificada. No hay datos para GPUs discretas de consumo.
- Opciones de despliegue: oMLX (servidor usado en las mediciones). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado el formato MLX y la arquitectura experimental.
- Latencia y throughput: TTFT de 3,2 s a 101,0 s segun longitud de prompt; decodificacion de 35,9 a 38,6 tok/s; prefill de 316,6 a 649,0 tok/s; TPOT de 26,1 a 28,1 ms. Variacion entre repeticiones de aproximadamente ±5%.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (media 4 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes-3.0-Qwen RCO 2.78bpw (esta) | ~180 B (MoE top-10) | 65.536 tokens verificados | 86,25 | qwen-community-1.0 | Hugging Face, formato MLX |
| Agnes-3.0-Qwen RCO 2.56bpw | ~180 B (MoE top-10) | 131.072 tokens verificados | 85,88 | qwen-community-1.0 | Hugging Face, formato MLX |
| Agnes-3.0-Qwen (BF16 upstream) | ~180 B (MoE top-10) | 1.048.576 posiciones declaradas | no disponible | qwen-community-1.0 | Hugging Face, paquete de 360 GB |

No se dispone de datos de benchmarks de modelos de otros autores en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base. Cabe destacar que la compilacion de 2,56 bpw ofrece el doble de contexto verificado (131.072 tokens) con una calidad estadisticamente equivalente, lo que la hace preferible para cargas que dependan de ventanas largas.

## Limitaciones y advertencias

- Artefacto experimental: 28 descargas, 0 likes y una correccion de nombre y contabilidad de bits en los primeros dias de publicacion. No es un modelo recomendado para produccion sin validacion propia.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue ni sobre el rendimiento en castellano.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de veracidad ni de calibracion para esta compilacion.
- Sesgos: no documentados en la model card. Al ser una cuantizacion del modelo base, hereda los sesgos de este, que tampoco se detallan.
- Contexto: la configuracion upstream declara 1.048.576 posiciones, pero en esta compilacion solo se han verificado 65.536 tokens; mas alla de ese limite el comportamiento no esta garantizado.
- Calidad no validada en codigo, matematicas ni tool calling: los unicos benchmarks publicados son hellaswag, arc_challenge, winogrande y mmlu. No hay datos de HumanEval, GSM8K ni evaluaciones multimodales.
- Sensibilidad extrema a la precision: el control negativo muestra que 2 bits uniformes colapsan la calidad a niveles por debajo del azar (media 21,75). Cualquier recuantizacion adicional debe validarse con cuidado.
- Contabilidad de bits: el objetivo nominal del asignador (2,4939 bpw) no refleja el coste real (2,7789 bpw) por los sesgos BF16 por grupo. Cualquier estimacion de VRAM basada en el nominal sera optimista en aproximadamente un 11%.
- Asignacion de bits no optima: la asignacion se genero antes de corregir un fallo en el objetivo de programacion dinamica (`rco-mlx` `5a94bec`). Re-ejecutar el asignador corregido habria reducido el error de reconstruccion aproximadamente un 6%, aunque la model card indica que la fidelidad del artefacto publicado no se ve afectada.
- Licencia: qwen-community-1.0. Es necesario revisar sus terminos antes de cualquier uso comercial; la model card la etiqueta como `other` y no detalla restricciones adicionales.
- Dependencia de herramienta: requiere MLX y, para el offload de la tabla PLE, oMLX con la opcion `qwen4_ple_ssd_offload`. No hay soporte documentado en otros runtimes, lo que limita la portabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/Agnes-3.0-Qwen-RCO-2.78bpw
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Qwen
- Licencia (referenciada en la model card): LICENSE dentro del repositorio
- Repositorio `rco-mlx` (herramienta de cuantizacion, commit `5a94bec` mencionado): no disponible como enlace directo en la informacion proporcionada
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada
