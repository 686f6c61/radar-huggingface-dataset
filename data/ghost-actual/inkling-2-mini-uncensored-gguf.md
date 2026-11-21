# ghost-actual/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una cuantización Q4_K_M del modelo OpenUncensored/Inkling-2-Mini-Uncensored, que a su vez deriva de thinkingmachines/Inkling-2-Mini. Se trata de un modelo de arquitectura MoE con bucles (looped MoE), 26.070 millones de parámetros totales y 3.400 millones activos, con capacidad de entrada de texto e imagen (pipeline image-text-to-text) y una ventana de contexto de 1 millón de tokens. El autor de la cuantización es ghost-actual, que la publicó el 21 de noviembre de 2026.

La característica diferencial del modelo es la "abliteración": las proyecciones de salida de atención (`attn.wo_ud`) han sido modificadas mediante ablación direccional para eliminar los mecanismos de rechazo, de modo que el modelo responde a peticiones que el modelo base rechazaría. Esta edición se conserva en la cuantización Q4_K_M, aplicada sobre los tensores de atención cuantizados a q4_K.

El paquete incluye dos ficheros: el modelo principal en Q4_K_M (17,48 GB) y un proyector de visión en BF16 (0,64 GB). Está pensado para su uso con llama.cpp (rama principal, a partir del build b1-19bc41d, que incluye el soporte de `inkling2_loop` y la corrección de escalas NVFP4). Es relevante para quienes necesitan un modelo multimodal de contexto muy largo, sin restricciones de contenido, ejecutable en hardware de consumo mediante cuantización GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped MoE (transformer con mezcla de expertos y bucles), visión + texto |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | 3,4 B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo); el modelo base usa NVFP4 en expertos, MXFP8 y BF16 en atención |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo principal Q4_K_M + mmproj BF16 para visión) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) y estructura de bucles ("looped MoE"), con 26.070 millones de parámetros totales y 3.400 millones activos por token. Incorpora un codificador visual para entrada de imágenes (pipeline image-text-to-text) y un proyector multimodal independiente. La ventana de contexto alcanza 1 millón de tokens. El checkpoint original almacena los expertos en NVFP4, parte de la atención en MXFP8 y las proyecciones de atención en BF16.

El proceso de cuantización parte del safetensors original (un único shard), se deconvierte a BF16 con `convert_hf_to_gguf.py` y se cuantiza con `llama-quantize` de la rama principal de llama.cpp a Q4_K_M. De los 704 tensores, 24 caen al tipo por defecto; los tensores de expertos MoE usan bloques q5_0/q4_K. La abliteración se realizó sobre las 20 proyecciones de salida de atención (`attn.wo_ud`) mediante ablación direccional en el modelo base; en esta cuantización esos tensores se cuantizan a q4_K junto con el resto del bloque de atención, por lo que la edición se conserva a precisión Q4 y no se reaplica después. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" por defecto: el modelo devuelve el contenido de razonamiento en `reasoning_content` de forma separada; se puede desactivar con `reasoning_effort: "none"` o `enable_thinking: false` en la plantilla de chat.
- Entrada multimodal de imagen y texto (image-text-to-text) mediante el proyector de visión BF16 incluido.
- Contexto muy largo: hasta 1 millón de tokens, adecuado para documentos extensos, repositorios de código o conversaciones multi-turno prolongadas.
- Modelo "uncensored"/abliterado: responde a peticiones que el modelo base rechazaría, incluyendo contenido técnico sensible (verificado con una petición de lock-picking que devolvió respuesta técnica directa sin rechazo).
- Soporte de conversación multi-turno mediante plantilla de chat Jinja (`--jinja` en llama-server).
- No se dispone de información sobre soporte de tool calling, function calling, agentes o capacidades multilingües específicas en la documentación proporcionada.

## Casos de uso

- Asistencia técnica sin filtros de contenido: el modelo puede responder a consultas técnicas sensibles (seguridad ofensiva, química, ingeniería) que otros modelos rechazan, gracias a la abliteración direccional aplicada sobre las proyecciones de atención.
- Análisis de documentos extensos: con 1M de tokens de contexto, puede procesar libros completos, expedientes legales o bases de código sin truncar, manteniendo coherencia a lo largo de toda la ventana.
- Procesamiento de imágenes con descripción textual: el proyector de visión permite tareas de image-to-text como descripción de capturas, extracción de información de diagramas o análisis de documentación escaneada.
- Investigación sobre alineación y seguridad: útil como modelo de referencia para estudiar el efecto de la abliteración direccional en el comportamiento y la tasa de rechazo, comparándolo con el modelo base no modificado.
- Despliegue local en hardware de consumo: la cuantización Q4_K_M (17,48 GB) permite ejecutar un modelo de 26B totales en GPUs de consumo con suficiente VRAM, mediante llama.cpp con aceleración CUDA.
- Generación de contenido creativo sin restricciones temáticas: narrativa, guiones o material editorial que aborde temas que los modelos alineados estándar suelen declinar.
- Prototipado de agentes conversacionales de contexto largo: la ventana de 1M tokens y el modo thinking permiten mantener estado conversacional extenso en entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutó ninguna medición de MMLU, tasa de rechazo ni divergencia KL sobre esta cuantización. La única verificación reportada es una prueba de humo en CPU con 24 hilos que alcanzó aproximadamente 8,4 tok/s en decodificación, sin salida incoherente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,5 GB para el modelo Q4_K_M más 0,64 GB del proyector de visión; en la práctica se recomiendan 20-24 GB de VRAM para margen de contexto y caché KV.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). Para contexto completo de 1M tokens se requiere VRAM adicional significativa para la caché KV.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con 24 GB, usando `-ngl 99` para descargar todas las capas a GPU.
- Opciones de despliegue: llama.cpp (rama principal, build b1-19bc41d o posterior, con `GGML_CUDA=ON` y CUDA >= 12.9 para `-compress-mode`), llama-server con `--jinja`, `--mmproj` para visión y `-c 32768` como ejemplo de configuración del autor. No se menciona compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: aproximadamente 8,4 tok/s en decodificación en CPU con 24 hilos (prueba de humo del autor). No se reportan cifras para GPU.
- El drafter especulativo DSpark no está soportado en la rama principal de llama.cpp (el PR #32218 es anterior al layout `inkling2_loop`), por lo que este repo no incluye fichero drafter.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-GGUF (este) | 26,07 B | 3,4 B | 1M | Apache 2.0 | GGUF Q4_K_M | Multimodal, abliterado, looped MoE |
| OpenUncensored/Inkling-2-Mini-Uncensored | 26,07 B | 3,4 B | 1M | Apache 2.0 | safetensors (NVFP4/MXFP8/BF16) | Modelo base de esta cuantización, misma abliteración |
| thinkingmachines/Inkling-2-Mini | 26,07 B | 3,4 B | 1M | no disponible | safetensors | Modelo original sin abliterar |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~26B con contexto de 1M) en la documentación proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los rechazos pero no garantiza la corrección ni la seguridad del contenido generado; el modelo puede producir respuestas dañinas, ilegales o peligrosas sin advertencia.
- No se ha medido la tasa de rechazo ni la degradación de capacidades (MMLU, KLD) tras la cuantización Q4_K_M; el autor solo realizó una comprobación de comportamiento puntual.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se dispone de datos específicos sobre la fiabilidad factual de esta variante.
- Idiomas soportados no disponibles; no se confirma el rendimiento multilingüe.
- El contexto de 1M tokens es teórico; el rendimiento real y la VRAM necesaria para la caché KV a esa longitud no están documentados.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al BF16 original; los 24 tensores que caen al tipo por defecto pueden afectar a la calidad.
- Requiere una build reciente de llama.cpp (b1-19bc41d o posterior); versiones anteriores tienen el bug de escalas NVFP4 que rompe estos pesos.
- El soporte de decodificación especulativa (DSpark) no está disponible en la rama principal, lo que limita el throughput.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; sin embargo, el uso de un modelo abliterado en producción conlleva riesgos legales y reputacionales que deben evaluarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghost-actual/Inkling-2-Mini-Uncensored-GGUF
- Modelo base (abliterado): https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original: thinkingmachines/Inkling-2-Mini (referenciado en la model card, sin URL directa disponible)
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp (PR #32694 `inkling2_loop`, PR #32704 corrección de escalas NVFP4, PR #32218 drafter DSpark)
