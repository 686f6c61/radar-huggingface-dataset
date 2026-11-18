# RentedNoodle/Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-Uncensored

## Resumen

Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-Uncensored es una cuantización GGUF de un solo archivo del checkpoint OrcaRouter Qwen3.8-27B, que a su vez es una build sobre Qwen/Qwen3.8-27B. La publica el usuario RentedNoodle bajo licencia Apache 2.0 y su objetivo es servir un modelo de 27.320 millones de parámetros en una única GPU de consumo de 16 GB con contexto largo y decodificación especulativa integrada. No es un fine-tune nuevo del tronco: el tronco está cuantizado a 3,04 bits por peso (IQ3_XXS) y se distribuye como un único archivo de 9,67 GiB.

La relevancia de esta ficha está en su enfoque de ingeniería de cuantización. Aplica la metodología GSQ/RCO de ISTA-DASLab con un mapa de asignación por tensor de 866 filas y una imatrix calibrada sobre un corpus nativo de OrcaRouter, e incorpora una cabeza borrador MTP embebida en el bloque 64 que habilita especulación integrada sin un segundo archivo. La arquitectura subyacente es híbrida: 64 capas transformer con 16 de atención completa y 48 de atención lineal GDN, más un bloque MTP, con una ventana de contexto declarada de 262.144 tokens.

El modelo se orienta a texto y uso de herramientas, con capacidades multilingües limitadas a inglés y chino según los metadatos. La model card es inusualmente explícita sobre disciplina de medición: separa los regímenes de contexto corto y contexto largo completo, documenta una ventana KVMem solo para velocidad con fallo de recuperación, y reconoce que la corrección del colapso de generación por encima de 64K no está establecida de forma general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (`Qwen3_5ForConditionalGeneration`), híbrida: 16 capas de atención completa + 48 capas GDN/atención lineal, más 1 bloque MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (`context_length` del GGUF); régimen validado con recuperación correcta: 196K residentes en historial completo |
| Tipos de cuantizacion | IQ3_XXS en el tronco (3,04 bpw); cabeza MTP con Q6_K, IQ4_XS y F32; mapa GSQ/RCO de 866 filas |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo único `Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-v2.1.gguf`, 10.382.717.184 bytes / 9,67 GiB) |

Detalles arquitectónicos verificados desde el GGUF: 64 capas transformer más 1 bloque MTP (`block_count` 65); atención con `head_count` 24, `head_count_kv` 4 (GQA 6) y `head_dim` 256; GDN con `state_size` 128, `conv_kernel` 4, 16 cabezas de clave y 48 de valor (grupo GVA 3), `inner_size` 6144; hidden 5120, FFN 17408, vocabulario 248320. La dimensión de estado GDN es 128, distinta de la dimensión de cabeza de atención (256).

## Arquitectura y entrenamiento

El tronco es un transformer híbrido de la familia Qwen3.5: 64 capas en las que 16 usan atención completa y 48 usan GDN (atención lineal con estado recurrente), lo que reduce el coste de contexto largo frente a un transformer denso equivalente. La atención completa emplea GQA con 6 cabezas de consulta por cabeza KV y dimensión de cabeza 256. Sobre el tronco se añade un bloque MTP (`qwen35.nextn_predict_layers` = 1) que actúa como cabeza borrador para decodificación especulativa nativa, con siete tensores de pesos en Q6_K, `attn_output.weight` en IQ4_XS y siete tensores de normalización en F32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. Lo que sí está documentado es el proceso de cuantización: se reproduce el mapa de asignación por tensor GSQ/RCO de ISTA-DASLab sobre la base OrcaRouter, con una imatrix calibrada sobre un corpus nativo de OrcaRouter, y el mapa completo se distribuye como `REF-IQ3_XXS-mtp.rco-allocation.txt`. La versión v2.1 corrige la asignación de dos tensores FFN (`ffn_gate.weight` e `ffn_up.weight`) que en la v2.0 estaban en IQ1_S e IQ1_M, demasiado agresivos, elevándolos a IQ3_XXS y manteniendo el resto del mapa sin cambios. El resultado son 3,04 bpw. La model card indica que la plantilla `froggeric-qwen3.8-tool-use.jinja` v22.5 está horneada en el GGUF, de modo que `--jinja` la selecciona automáticamente.

## Capacidades

- Generación de texto conversacional y continuaciones de formato largo.
- Uso de herramientas y function calling, con una plantilla de tool use específica incluida en el propio GGUF.
- Decodificación especulativa integrada mediante la cabeza MTP embebida (`--spec-type draft-mtp`), con tasa de aceptación reportada de 0,91 en la compuerta de contexto corto.
- Contexto largo: régimen de historial completo validado hasta 196K tokens residentes con recuperación correcta (NIAH 3/3 profundidades).
- Capacidad multimodal de visión únicamente si se descarga el proyector `mmproj/` por separado; el archivo principal es solo texto y herramientas.
- Multilingüe limitado a inglés y chino según los metadatos del modelo.
- Variante sin censura (abliterated/uncensored) según la denominación del autor, sin detalle técnico del proceso en la información disponible.

## Casos de uso

- Asistente de código en estación de trabajo con GPU de 16 GB: el archivo de 9,67 GiB deja margen de VRAM para caché KV en una RTX 5070 Ti o similar, y la plantilla de tool use horneada permite integrarlo en editores y agentes de terminal sin configuración adicional de chat template.
- Procesamiento de documentos largos con recuperación fiable: con historial completo de hasta 196K tokens residentes y NIAH 3/3, es adecuado para resumir contratos, informes o expedientes donde no se puede evictar contexto temprano.
- Agentes multi-paso con llamadas a herramientas: la tasa de aceptación MTP de 0,91 y el soporte de function calling lo hacen viable para bucles de razonamiento con herramientas en los que la latencia de decodificación importa.
- Generación aumentada por recuperación (RAG) sobre corpus extensos: la ventana de 262.144 tokens permite inyectar muchos fragmentos recuperados en una sola pasada, aunque conviene mantenerse en el régimen de historial completo y evitar la ventana KVMem si la recuperación debe ser fiable.
- Despliegue local sin conexión para texto en inglés y chino: al ser un GGUF único con licencia Apache 2.0, se puede distribuir en entornos aislados con llama.cpp u Ollama.
- Investigación sobre cuantización extrema: el mapa GSQ/RCO de 866 filas y el registro de ablaciones de la model card (colapso con solo compuertas, colapso con el arreglo de 6 tensores sensibles a 3,78 bpw, éxito solo con el cambio FFN) sirven como material de estudio reproducible sobre asignación por tensor.
- Evaluación de decodificación especulativa con cabezas MTP embebidas: permite medir tasas de aceptación y ganancia de throughput sin gestionar un segundo modelo borrador.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de inferencia del autor, no benchmarks académicos. Todas se tomaron en una única RTX 5070 Ti de 16 GB (GB203, sm_120, 70 SM), Windows, CUDA 13.3, y la model card advierte explícitamente que las filas de contextos distintos no deben combinarse.

| Medicion | Configuracion | Resultado |
|---|---|---|
| Decodificacion en contexto largo con recuperacion correcta | Historial completo 196K residente, K `q4_0` / V `q4_0`, spec OFF, KVMem OFF, build-kv fa5994f5c (2026-10-02) | 33,7 t/s decodificacion, 662 t/s prefill, NIAH 3/3 profundidades PASS |
| Compuerta de contexto corto | build3, sonda de decodificacion en contexto corto (no es decodificacion tras ingerir 16K) | 106,4 t/s decodificacion, 1473 t/s prefill, NIAH 6/6 sobre ~16.053 tokens, tool 13/14, coherencia 4/4, aceptacion MTP 0,91 |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 9,67 GiB, por lo que encaja en 16 GB con margen para caché KV; el autor lo posiciona explícitamente como un modelo para una sola GPU de 16 GB.
- GPU recomendadas: RTX 5070 Ti 16 GB es la plataforma de referencia medida. Cualquier GPU con al menos 16 GB de VRAM (RTX 4080/4090, RTX 5080, A100 40 GB, H100) puede servirlo; en tarjetas de 24 GB o más hay margen adicional para contexto y caché KV en precisión superior.
- Cabe en GPU de consumo: sí, en modelos de 16 GB o más. No cabe en tarjetas de 8 o 12 GB sin offload a RAM.
- Opciones de despliegue: llama.cpp con soporte de `--jinja` y `--spec-type draft-mtp` para aprovechar la plantilla y la cabeza MTP embebidas; Ollama para despliegue simplificado; vLLM y TGI no están confirmados para este formato GGUF con cabeza MTP según la información disponible.
- Latencia y throughput: 33,7 t/s de decodificación en régimen de historial completo a 196K y 662 t/s de prefill; 106,4 t/s de decodificación y 1473 t/s de prefill en la sonda de contexto corto. Todas las cifras son de una sola GPU y una sola build.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-Uncensored | 27,3B | 262.144 (validado con recuperación a 196K) | GGUF IQ3_XXS, 3,04 bpw, MTP embebido | apache-2.0 | Cuantización de un checkpoint OrcaRouter; sin benchmarks académicos publicados |
| orcarouter/Qwen3.8-27B-Uncensored (modelo base) | no disponible en la información | no disponible en la información | safetensors u otro formato original | no disponible en la información | Base sin cuantizar; sin datos de rendimiento en la información proporcionada |
| Qwen/Qwen3.8-27B (tronco original) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Modelo de referencia sobre el que se construye la cadena; sin datos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La corrección del colapso de generación por encima de 64K no está establecida de forma general: la model card indica que las dos ejecuciones emparejadas de v2.0 y v2.1 sobre build2 no reproducen el colapso anterior y no constituyen una cualificación amplia de release.
- La ventana KVMem está documentada solo por transparencia y no se recomienda: es más rápida pero la recuperación falla, por lo que no debe usarse en tareas que dependan de recuperar contexto temprano o intermedio.
- La cifra de 106,4 t/s corresponde a una sonda de decodificación en contexto corto y no debe citarse como decodificación tras ingerir 16K tokens; la model card insiste en no mezclar filas de configuraciones distintas.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad en la información disponible; al ser una variante sin censura, la ausencia de alineación de seguridad puede aumentar la probabilidad de contenido inapropiado o no verificado.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está evaluado y no debe asumirse.
- Visión: requiere descargar el proyector `mmproj/` por separado; el archivo principal no procesa imágenes.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y la cadena de derivación (OrcaRouter, Qwen) deben verificarse por separado antes de producción.
- El estado de release es un candidato recomendado (v2.1), no una versión con cualificación amplia; conviene validar en el caso de uso concreto antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/RentedNoodle/Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-Uncensored
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Tronco original: https://huggingface.co/Qwen/Qwen3.8-27B
- Metodología GSQ/RCO (ISTA-DASLab): no disponible en la información proporcionada
- Plantilla de tool use `froggeric-qwen3.8-tool-use.jinja` v22.5: no disponible en la información proporcionada
- Mapa de asignación `REF-IQ3_XXS-mtp.rco-allocation.txt`: incluido en el repositorio del modelo
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada
