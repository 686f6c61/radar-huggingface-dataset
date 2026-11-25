# esatapedico/Muse-Glimmer-30B-NVFP4-GGUF

## Resumen

Muse-Glimmer-30B-NVFP4-GGUF es una familia de siete conversiones GGUF del modelo denso Muse-Glimmer-30B, un VLM (vision-language model) de 30.000 millones de parámetros desarrollado por Meta. El checkpoint de origen es la variante NVFP4 publicada por Red Hat AI (RedHatAI/Muse-Glimmer-30B-NVFP4), y la conversión a GGUF la firma el usuario esatapedico. El modelo resuelve el despliegue de un VLM de 30B en formato de 4 bits nativo (NVFP4, tipo GGML 40) pensado para GPUs Blackwell, manteniendo el backbone de atención y FFN en su precisión original de cuantización en lugar de recuantizarlo.

La arquitectura es un transformer denso de 52 capas con atención de ventana deslizante y un patrón periódico [Local, Local, Local, Global] cada cuatro capas, ventana local de 2048 tokens y contexto nativo de 131.072 tokens. No emplea MoE ni MTP (multi-token prediction). Los siete ficheros comparten un backbone byte-idéntico de 1.561 tensores (416 pesos NVFP4 más 1.145 tensores F32 de normas, escalas y vectores QK-norm, 13,35 GB) y solo difieren en la cuantización de `lm_head` y `token_embd`, ofreciendo una escalera de tamaño/precisión de 15,19 GB a 19,55 GB.

Su relevancia actual es doble: por un lado, demuestra cómo mantener densidad NVFP4 nativa en todo el modelo para hardware Blackwell; por otro, advierte de una dependencia crítica de runtime, ya que estos ficheros requieren un parche de layout Q/K RoPE que todavía no está fusionado en llama.cpp upstream y solo funciona verificado en el fork de gabrielcosi. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (VLM), 52 capas, sliding window attention [Local, Local, Local, Global] con ventana local de 2048 y periodo 4 |
| Parametros totales | 27.854.795.072 (~27,85B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens nativos |
| Tipos de cuantizacion | NVFP4 nativo en backbone (GGML type 40); lm_head en Q3_K, Q5_0, Q8_0 o BF16; token_embd en Q2_K, Q4_K, Q6_K, Q8_0 o BF16 segun tier |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (7 ficheros); checkpoint base en NVFP4 |
| Tamano del repo | 120,6 GB |
| Tamano por fichero | 15,19 GB (VERY-LOW) a 19,55 GB (HIGHEST) |
| Tensores totales | 1.561 (416 NVFP4 + 1.145 F32 + 2 dependientes de tier) |
| Backbone compartido | 13,35 GB, byte-identico en los 7 tiers |
| Vision tower | no incluida (sin mmproj); BF16 en el checkpoint original |
| Runtime verificado | fork de gabrielcosi/llama.cpp, commit 9ec0ea18 o posterior |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 52 capas con atención híbrida local/global: tres de cada cuatro capas usan ventana deslizante de 2048 tokens y la cuarta es global, lo que reduce el coste computacional en contexto largo sin perder acceso completo a la secuencia. Incorpora QK-norm (vectores `attn_q_norm` y `attn_k_norm` en cada una de las 52 capas) y un layout intercalado de Q/K para RoPE que es precisamente la fuente del problema de compatibilidad con llama.cpp estándar. El contexto nativo es de 131.072 tokens y no hay MTP.

El checkpoint de origen es la cuantización NVFP4 de Red Hat AI, que almacena las proyecciones de atención y las capas FFN directamente en NVFP4 con escalado por tensor. La conversión a GGUF no recuantiza esos 416 tensores: `llama-quantize` no puede pasar de NVFP4 a otro formato, por lo que el backbone queda bloqueado en su precisión de origen y solo se ajustan `output.weight` y `token_embd.weight` mediante fichero de overrides. El autor no documenta en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo original de Meta y no se detallan aquí.

La innovación técnica principal es mantener densidad NVFP4 nativa en todo el modelo para Blackwell, con una escalera de siete niveles que permite elegir el compromiso entre tamaño y calidad en los dos tensores que más afectan a la calidad de salida y a la velocidad de decodificación. El autor argumenta que la atención de ventana deslizante reduce el valor marginal de subir la precisión de la atención, porque los artefactos de cuantización en patrones locales no se acumulan a lo largo de todo el contexto como en atención global.

## Capacidades

- Generación de texto conversacional y razonamiento general, con pipeline `text-generation` y tag `conversational`.
- Capacidad multimodal nativa (imágenes y vídeo) en el modelo de origen, si bien la torre de visión no está incluida en estos GGUF: sin mmproj, deben tratarse como text-only.
- Soporte multilingüe según los tags (`en`, `multilingual`); el grado de cobertura por idioma no está detallado.
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Análisis de documentos largos: con 131.072 tokens de contexto nativo, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada y responder preguntas sobre el conjunto sin troceado.
- Asistente conversacional multi-turno: el patrón de atención local/global mantiene un coste de memoria y cómputo contenido en diálogos largos, lo que permite sesiones extensas en una sola GPU Blackwell.
- Despliegue en hardware consumer de gama alta: los tiers de 15,19 GB y 15,85 GB caben en GPUs con 16-24 GB de VRAM, lo que hace viable servir un modelo de ~27,85B en una estación de trabajo.
- Procesamiento por lotes en servidores Blackwell: el backbone NVFP4 de 13,35 GB compartido permite cargar un único conjunto de pesos y alternar tiers de `lm_head` y `token_embd` según el presupuesto de calidad y latencia de cada tarea.
- Investigación sobre cuantización: la familia de siete ficheros con backbone byte-idéntico sirve para aislar experimentalmente el impacto de la precisión de `lm_head` y `token_embd` en la calidad de salida, sin contaminación por cambios en atención o FFN.
- Evaluación de runtimes: útil para validar implementaciones de NVFP4 y del layout Q/K RoPE en motores GGUF, dado que el autor documenta explícitamente el comportamiento incorrecto en llama.cpp estándar.
- Generación de texto en inglés y multilingüe en pipelines de contenido, con licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos; solo describe verificaciones de integridad (SHA-256 por tensor) y pruebas de cordura en el fork de gabrielcosi.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 15,19 GB y 19,55 GB solo para pesos, según el tier elegido; hay que sumar la caché KV, que con 131.072 tokens de contexto y 52 capas resulta considerable y no está cuantificada en la información disponible.
- GPU recomendadas: GPUs Blackwell para aprovechar NVFP4 nativo; el autor orienta explícitamente la conversión a este hardware.
- Cabe en consumer GPU: los tiers VERY-LOW (15,19 GB) y LOW (15,85 GB) caben en GPUs de 16 GB con margen mínimo y en GPUs de 24 GB con holgura para caché KV moderada; MEDIUM (16,71 GB) requiere al menos 24 GB.
- Opciones de despliegue: llama.cpp exclusivamente en la ruta verificada, mediante el fork de gabrielcosi (commit 9ec0ea18 o posterior). Otros motores GGUF podrían manejar el layout Q/K intercalado, pero el autor no ha probado ninguno. vLLM, TGI y Ollama no están verificados para estos ficheros.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-NVFP4-GGUF (este) | ~27,85B | 131.072 | GGUF con backbone NVFP4 nativo, 15,19-19,55 GB | Apache 2.0 | Requiere fork de llama.cpp; sin torre de visión |
| RedHatAI/Muse-Glimmer-30B-NVFP4 | ~27,85B | 131.072 | Checkpoint NVFP4 original | Apache 2.0 | Modelo base del que se parte; incluye torre de visión en BF16 |
| Muse-Glimmer-30B (original, Meta) | ~27,85B | 131.072 | Pesos completos en BF16 | no disponible en la informacion | Referencia de calidad; mayor huella de memoria |
| Qwen3.8-27B (mencionado por el autor) | ~27B | no disponible | GGUF recuantizable por capas | no disponible en la informacion | Atención global, permite promover capas a Q8_0/BF16; comparación cualitativa del autor |

La comparación con alternativas de terceros no puede completarse con datos numéricos porque la model card no incluye benchmarks. El autor solo establece una comparación estructural con Qwen3.8-27B: en aquel las proyecciones de atención parten de BF16 y pueden recuantizarse por tiers, mientras que en Muse-Glimmer el origen NVFP4 bloquea esa vía.

## Limitaciones y advertencias

- Dependencia crítica de runtime: en una build estándar de llama.cpp los ficheros cargan pero generan basura (artefactos de repetición, atención con layout incorrecto). El parche ggml-org/llama.cpp#27178 no está fusionado upstream.
- Solo está verificado el fork de gabrielcosi/llama.cpp en el commit 9ec0ea18 o posterior; cualquier otro motor se considera no probado.
- Sin torre de visión: no hay mmproj, por lo que las capacidades de imagen y vídeo del modelo original no están disponibles en estas conversiones.
- El backbone NVFP4 no puede recuantizarse a otro formato con `llama-quantize`; la escalera de calidad solo actúa sobre `lm_head` y `token_embd`.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasas de error en la información disponible.
- Sesgos conocidos: no documentados en la model card; deben asumirse los del modelo base de Meta, no evaluados aquí.
- Cobertura lingüística: solo se declaran `en` y `multilingual` sin detalle por idioma; el rendimiento en castellano no está verificado.
- La caché KV para 131.072 tokens puede exceder la VRAM disponible en GPUs consumer, lo que en la práctica limita el contexto utilizable.
- Licencia Apache 2.0 permite uso comercial, pero la obligación de mantener el fork de llama.cpp añade riesgo operativo en producción hasta que el parche llegue upstream.
- El repo ocupa 120,6 GB por los siete ficheros; conviene descargar solo el tier necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esatapedico/Muse-Glimmer-30B-NVFP4-GGUF
- Modelo base (Red Hat AI): https://huggingface.co/RedHatAI/Muse-Glimmer-30B-NVFP4
- Issue de llama.cpp con el fix pendiente: https://github.com/ggml-org/llama.cpp/issues/27178
- Fork verificado de llama.cpp: https://github.com/gabrielcosi/llama.cpp
- Sitio del autor de la conversión: https://www.esatapedico.com
