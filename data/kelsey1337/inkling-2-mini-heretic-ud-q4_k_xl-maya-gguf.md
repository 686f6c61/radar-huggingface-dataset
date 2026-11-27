# kelsey1337/Inkling-2-Mini-heretic-UD-Q4_K_XL-Maya-GGUF

## Resumen

Inkling-2-Mini-heretic UD-Q4_K_XL (Maya layout) es una cuantización GGUF en formato Q4_K_XL del modelo Inkling-2-Mini-heretic, una variante "abliterated" (sin mecanismos de rechazo) del modelo base Inkling-2-Mini de Thinking Machines. El autor de esta ficha, kelsey1337, ha injertado los pesos editados por yanauto (Heretic 2.1 ARA sobre la salida de atención) dentro del fichero UD-Q4_K_XL de Unsloth, manteniendo intactos los expertos NVFP4 originales y el resto de tensores byte a byte. El resultado es un fichero de 17,6 GB con arquitectura MoE de 26.070.390.272 parámetros totales, pensado para ejecutarse en una única GPU de 24 GB.

La relevancia de esta ficha es doble: por un lado, documenta un proceso de modificación quirúrgica de pesos (solo 21 de 24 capas cambian en el tensor `wo_ud`) con verificación por coseno; por otro, ofrece un formato GGUF compatible con el motor Maya (`maya-ik2`), que según el autor alcanza 197-244 t/s con el drafter DSpark en una RTX 4090, frente a 136 t/s en prosa y 189 t/s con un prompt de 39K tokens. El contexto declarado es de 256K tokens y el modelo soporta imágenes.

La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el carácter "uncensored" y "abliterated" introduce consideraciones éticas y de seguridad que se detallan en la sección de limitaciones. El modelo está etiquetado como conversacional y compatible con endpoints, y su repo acumula 645 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer, con layout GGUF `inkling2` (Unsloth looped) |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (según model card) |
| Tipos de cuantizacion | Q4_K_XL (UD, Unsloth Dynamic); repo base ofrece IQ1_S..Q8_0 en otros repos de la familia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Inkling-2-Mini-heretic-attn-UD-Q4_K_XL.gguf`, 17,6 GB) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) con arquitectura `inkling2` en el layout looped antiguo de Unsloth: `block_count` = 48 visitas de capa, con `loop_res_query` y `loop_kv_res_query` globales y `num_loops`. Los expertos de las capas 0-19 conservan los bits NVFP4 originales de Thinking Machines, mientras que las capas 20-23 usan MXFP8 convertido a Q8_0 y las proyecciones de atención están en Q8_0. El proceso de "graft" sustituye únicamente el tensor `model.llm.layers.N.attn.wo_ud.weight` (BF16, la linear interna de la salida de atención con compuerta) por `blk.N.attn_output.weight` cuantizado a Q8_0, dejando el resto de tensores y metadatos copiados byte a byte.

El entrenamiento original de Inkling-2-Mini no se detalla en la información proporcionada (número de tokens, composición del dataset, RLHF/DPO). La edición heretic modifica solo la salida de atención en 21 de 24 capas, con una verificación de coseno por capa: las tres capas no editadas (blk 0, 1, 23) coinciden a 0,99996 (redondeo Q8_0 puro) y las 21 editadas a 0,973-0,998, lo que corresponde al delta de ablación. La perplejidad resultante es 4,9355 ± 0,129 frente a 4,9112 ± 0,130 del stock, un +0,5%. El autor menciona el uso del drafter DSpark (`mtp.safetensors`) para decodificación especulativa en el motor Maya.

## Capacidades

- Generación de texto conversacional multi-turno, con modo "thinking" (razonamiento explícito) activable.
- Procesamiento de imágenes (el modelo base soporta visión según la model card).
- Razonamiento multi-paso y resolución de problemas técnicos (se citan pruebas con prompts de Dijkstra y caché LRU en Rust).
- Generación de código en varios lenguajes (Rust, algoritmos, etc.).
- Contexto largo: manejo de prompts de hasta 39K tokens en las pruebas y ventana declarada de 256K.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y formato conversacional.
- Modo "uncensored": ausencia de rechazos en la mayoría de peticiones (0/36 rechazos directos, 1/36 con thinking, según la model card).
- No se documenta soporte explícito de tool calling ni de agentes en la información disponible.

## Casos de uso

- Asistencia conversacional sin filtros en entornos de investigación: el modelo responde a peticiones que otros modelos rechazarían, útil para estudiar comportamiento de modelos abliterated y calibrar políticas de seguridad.
- Generación de código en producción: con 26B parámetros totales y contexto de 256K, puede integrarse en pipelines de revisión de código o generación de tests, aunque requiere validación humana por el riesgo de alucinación.
- Procesamiento de documentos largos: la ventana de 256K permite resumir o extraer información de contratos, informes técnicos o bases de código extensas en una sola pasada.
- Análisis de imágenes en flujos técnicos: al soportar visión, puede describir diagramas de arquitectura o capturas de errores y generar explicaciones textuales.
- Despliegue en una sola RTX 4090: el fichero Q4_K_XL de 17,6 GB cabe en 24 GB de VRAM, lo que permite prototipado local sin infraestructura de centro de datos.
- Evaluación comparativa de técnicas de ablación: sirve como referencia para medir el impacto de ediciones heretic en perplejidad y tasa de rechazo frente a los grafts Unbound v1.0 y v2.
- Chatbot de dominio técnico con contexto largo: para soporte interno donde se necesita recordar conversaciones extensas y documentación adjunta, con la advertencia de revisar sesgos.

## Benchmarks y rendimiento

Datos de la model card (pruebas locales del autor, no benchmarks estándar publicados):

| Metrica | Valor |
|---|---|
| Perplejidad (8 × 2048, corpus técnico local) | 4,9355 ± 0,129 (+0,5% vs stock 4,9112 ± 0,130) |
| Rechazos directos (thinking off, 36 peticiones) | 0 rechazos / 3 evasivas |
| Rechazos con thinking (36 peticiones) | 1 rechazo / 9 evasivas |
| MMLU (modelo heretic base, según yanauto) | 78,0 vs 78,7 del original |
| KL divergence (heretic base) | 0,049 |
| Throughput en RTX 4090 (Maya, con DSpark) | 197-244 t/s |
| Throughput en prosa | 136 t/s |
| Throughput con prompt de 39K tokens | 189 t/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este fichero GGUF concreto en la información disponible.

## Requisitos de hardware

- VRAM estimada: 17,6 GB para el fichero Q4_K_XL; cabe en GPU de 24 GB con margen para contexto y KV cache.
- GPU recomendadas: RTX 4090 (24 GB, SM89) es la plataforma de referencia del autor; también válidas A100 40/80 GB, H100 y RTX 3090/4090 para inferencia local.
- Cabe en consumer GPU: sí, en RTX 4090 y previsiblemente en RTX 3090 (24 GB), con contexto reducido si se usa KV cache grande.
- Opciones de despliegue: motor Maya (`maya-ik2`, layout `inkling2` antiguo) es el soportado por este fichero; llama.cpp mainline requiere el layout `inkling2_loop` (otro repo de la familia). No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 197-244 t/s con drafter DSpark, 136 t/s en prosa, 189 t/s con prompt de 39K; prefill y TTFT del prompt de 39K no se detallan completos en el extracto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este fichero (heretic UD-Q4_K_XL Maya) | 26,07B totales | 256K | Apache 2.0 | GGUF Q4_K_XL | PPL 4,9355; 0/3 rechazos directos |
| Unbound v1.0 graft (mismo autor) | 26,07B totales | 256K | Apache 2.0 | GGUF Q4_K_XL | PPL 4,9415; 1/7 rechazos directos |
| Unbound v2 graft (mismo autor) | 26,07B totales | 256K | Apache 2.0 | GGUF Q4_K_XL | PPL 5,1192; 3/6 rechazos directos |
| unsloth/Inkling-2-Mini-GGUF (stock) | 26,07B totales | 256K | Apache 2.0 | GGUF Q4_K_XL | PPL 4,9112; rechaza peticiones sensibles |

No se dispone de comparación con modelos de otros proveedores (p. ej. Llama, Qwen, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": elimina mecanismos de rechazo, lo que puede producir contenido inapropiado, peligroso o ilegal; no apto para despliegue público sin filtros adicionales.
- Riesgo de alucinación inherente a modelos de 26B parámetros; la edición heretic no corrige este comportamiento y puede aumentarlo en dominios sensibles.
- Perplejidad ligeramente superior al stock (+0,5%), con posible degradación sutil en coherencia en textos largos.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- Compatibilidad limitada: este fichero solo funciona con el motor Maya (layout `inkling2` antiguo); llama.cpp mainline requiere otro layout y otro repo de la familia.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin filtros conlleva responsabilidad legal y reputacional; se recomienda revisión de políticas internas.
- Los benchmarks son locales y de muestra pequeña (36 peticiones, 8 × 2048 tokens de perplejidad); no sustituyen a evaluaciones estandarizadas.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/kelsey1337/Inkling-2-Mini-heretic-UD-Q4_K_XL-Maya-GGUF
- Modelo base heretic: https://huggingface.co/yanauto/Inkling-2-Mini-heretic
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repo de la familia heretic (llama.cpp): https://huggingface.co/kelsey1337/Inkling-2-Mini-heretic-GGUF
- Repo Unbound (Maya): https://huggingface.co/kelsey1337/Inkling-2-Mini-Unbound-UD-Q4_K_XL-Maya-GGUF
- Modelo Unbound original: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Motor Maya: https://github.com/alesha-pro/maya-inkling-mini
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32694
