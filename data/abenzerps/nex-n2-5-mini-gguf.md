# abenzerps/Nex-N2.5-mini-GGUF

## Resumen

Nex-N2.5-mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Nex-AGI, orientado a cargas de trabajo agénticas: generación de código, uso de herramientas (tool calling), automatización de interfaz de computadora y tareas multimodales. Su rasgo más distintivo es una ventana de contexto nativa de 262.144 tokens (256K), pensada para agentes que acumulan historiales largos de interacción, trazas de herramientas y documentos extensos en una sola sesión.

La ficha que nos ocupa no es el checkpoint original, sino la conversión a GGUF publicada por el usuario abenzerps bajo el identificador `abenzerps/Nex-N2.5-mini-GGUF`. Esta conversión permite ejecutar el modelo en llama.cpp y en cualquier runtime compatible con GGUF, con 17 cuantizaciones que van desde Q8_0 (36,90 GB) hasta IQ1_S (7,48 GB), además de un proyector multimodal F16 de 899 MB para el camino de visión.

El modelo base cuenta con 34.660.610.688 parámetros totales según los safetensors del checkpoint original. La model card etiqueta la familia como `qwen3.5-moe`, lo que sitúa su linaje arquitectónico en la estirpe Qwen 3.5 con mezcla de expertos, aunque la información proporcionada no detalla el número de parámetros activos por token. Se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiquetado `qwen3.5-moe`); soporte multimodal mediante proyector de visión |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K), nativa |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, Q3_K_M, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_XS, IQ2_XXS, IQ1_M, TQ1_0 (ternaria experimental), IQ1_S |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (conversión del checkpoint original en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 34.660 millones de parámetros totales, etiquetado por el autor como `qwen3.5-moe`, lo que indica una arquitectura derivada de la familia Qwen 3.5 con enrutamiento disperso hacia expertos. El repositorio GGUF incluye un proyector de visión independiente en F16 (`mmproj-Nex-N2.5-mini-F16.gguf`, 899 MB), lo que confirma que el checkpoint original incorpora una torre visual para entrada de imágenes. No se dispone de información sobre el número de expertos, el número de parámetros activos por token, la composición del dataset de entrenamiento ni el volumen de tokens utilizados.

La model card no detalla el proceso de alineación (RLHF, DPO u otro), aunque la orientación explícita del modelo hacia tool calling y computer use sugiere un post-entrenamiento centrado en tareas agénticas. La conversión a GGUF se realizó con `ggml-org/llama.cpp` en el commit `f3f1a8f2760f28325a5ec20c05b171e5b7c83a29`, sobre la revisión `87420286149d9cce9bd46cd335ef9bda33c37c1b` del checkpoint original. El autor indica que las cuantizaciones IQ1_S e IQ1_M emplean matrices de importancia (imatrix) y que TQ1_0 es una cuantización ternaria experimental.

## Capacidades

- Generación de texto conversacional con soporte de plantilla de chat embebida (formato Jinja).
- Razonamiento y generación de código, orientado a flujos de trabajo de desarrollo.
- Tool calling / function calling: la model card indica que el comportamiento depende del runtime y de su parser de herramientas, por lo que debe verificarse en la aplicación destino.
- Uso como agente multi-paso, incluyendo computer use (automatización de interfaz).
- Capacidades multimodales de visión mediante el proyector F16 opcional.
- Contexto largo de 262.144 tokens para historiales agénticos, trazas de herramientas y documentos extensos.
- Multilingüe limitado a inglés y chino según los metadatos de idioma.

## Casos de uso

- Agentes de codificación autónomos: con 256K de contexto, el modelo puede mantener en memoria un repositorio completo, el historial de comandos ejecutados y las trazas de herramientas a lo largo de una sesión de refactorización sin truncar el estado.
- Automatización de interfaz de computadora: el modelo puede interpretar capturas de pantalla mediante el proyector de visión y emitir acciones de ratón y teclado, lo que lo hace adecuado para agentes RPA que operan aplicaciones sin API.
- Asistentes de atención al cliente con contexto largo: la ventana de 262K permite arrastrar el historial completo de un cliente, incluidos documentos adjuntos y conversaciones previas, en una sola petición.
- Pipelines de CI/CD con tool calling: integrado en un servidor compatible con OpenAI (`llama-server`), el modelo puede invocar herramientas de build, consultar logs y proponer parches dentro de un flujo automatizado.
- Análisis de documentación técnica extensa en inglés o chino: resumen y extracción de información sobre manuales, especificaciones o bases de conocimiento que superan ampliamente el contexto de modelos de 32K.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (21,17 GB) e IQ3_XXS (13,62 GB) permiten ejecutar el modelo en una GPU de 24 GB o en configuraciones de 16 GB con offload parcial, algo inviable con el checkpoint en precisión completa.
- Procesamiento por lotes en local sin dependencia de API: al ser GGUF con licencia Apache-2.0, encaja en entornos con requisitos de soberanía de datos donde no se puede enviar código o documentación a un proveedor externo.

## Benchmarks y rendimiento

La model card incluye una imagen de resultados de benchmark (`assets/Nex-N2.5-Benchmark-white.png`) reportados por Nex-AGI para la familia Nex-N2.5 original, pero los valores numéricos no están disponibles en el texto proporcionado y el autor advierte explícitamente que no son mediciones de esta conversión GGUF. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto KV): Q8_0 ≈ 37 GB; Q6_K ≈ 29 GB; Q5_K_M ≈ 25 GB; Q4_K_M ≈ 21 GB; Q3_K_M ≈ 17 GB; IQ2_M ≈ 12 GB; IQ1_S ≈ 7,5 GB. A estas cifras hay que sumar la caché KV, que con 262K de contexto es sustancial y crece con la longitud efectiva de la secuencia.
- GPU recomendadas: A100 80 GB o H100 para contexto completo a 256K; A100 40 GB o L40S 48 GB para contexto largo con Q4_K_M/Q5_K_M; RTX 4090 (24 GB) para Q4_K_M o Q4_K_S con contexto moderado.
- GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M o inferiores; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con IQ3_XXS o Q3_K_M y offload parcial a CPU; en 8-12 GB solo con cuantizaciones IQ1/IQ2, con degradación de calidad esperable.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, KoboldCpp). El servidor de llama.cpp expone una API compatible con OpenAI. Para multimodal se requiere un build reciente de llama.cpp con soporte del camino multimodal y el fichero `mmproj`.
- Latencia y throughput: no disponible. No se han publicado mediciones para esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nex-N2.5-mini (este GGUF) | 34,66B totales (MoE) | 262.144 | Apache-2.0 | GGUF + safetensors (base) | Multimodal, tool calling, computer use |
| Qwen 2.5 Coder 32B | 32,5B densos | 131.072 | Apache-2.0 | safetensors, GGUF | Referencia en código; sin visión, contexto menor |
| Qwen 2.5 32B Instruct | 32,8B densos | 131.072 | Apache-2.0 | safetensors, GGUF | Multilingüe amplio; sin visión nativa |
| Gemma 3 27B | 27B densos | 128.000 | Gemma license | safetensors, GGUF | Multimodal; licencia con restricciones de uso |

La comparación con modelos densos de tamaño similar es aproximada: al ser MoE, Nex-N2.5-mini activa solo una fracción de sus 34,66B parámetros por token, lo que en teoría reduce el coste de cómputo por token frente a un denso del mismo tamaño total, aunque el requisito de memoria para los pesos es comparable. Los datos de parámetros activos no están disponibles, por lo que no puede cuantificarse esa ventaja.

## Limitaciones y advertencias

- Idiomas: los metadatos solo declaran inglés y chino; el rendimiento en castellano no está documentado y debe validarse empíricamente antes de usarlo en producción.
- Parámetros activos desconocidos: al no publicarse el número de parámetros activos, no es posible estimar con precisión el throughput ni compararlo con alternativas densas.
- Benchmarks: las cifras de la model card corresponden a la familia original reportada por Nex-AGI, no a esta conversión; la cuantización puede degradar el rendimiento, especialmente en IQ1/IQ2 y en TQ1_0 (ternaria experimental).
- Tool calling dependiente del runtime: el autor advierte que el comportamiento de las llamadas a herramientas depende del parser del servidor; hay que verificar en la aplicación destino.
- Contexto largo y memoria: 262K tokens de contexto exigen una caché KV muy grande; en GPUs de consumo habrá que limitar `-c` a valores muy inferiores o aplicar cuantización de la caché KV.
- Multimodal: el proyector es opcional y requiere un build de llama.cpp con soporte del camino multimodal del modelo; no todos los frontends GGUF lo soportan.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación para este modelo.
- Sesgos: no se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar los términos del checkpoint base (`nex-agi/Nex-N2.5-mini`) y las licencias de las dependencias del runtime.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abenzerps/Nex-N2.5-mini-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Revisión del checkpoint original: https://huggingface.co/nex-agi/Nex-N2.5-mini/tree/87420286149d9cce9bd46cd335ef9bda33c37c1b
- llama.cpp (conversión): https://github.com/ggml-org/llama.cpp
- Commit de conversión: https://github.com/ggml-org/llama.cpp/commit/f3f1a8f2760f28325a5ec20c05b171e5b7c83a29
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Solicitudes de modelos del autor: https://abenzerps.com/request-a-model/
- Checksums: https://huggingface.co/abenzerps/Nex-N2.5-mini-GGUF/blob/main/SHA256SUMS.txt
- Plantilla de chat: https://huggingface.co/abenzerps/Nex-N2.5-mini-GGUF/blob/main/chat_template.jinja
- Proyector multimodal: https://huggingface.co/abenzerps/Nex-N2.5-mini-GGUF/blob/main/mmproj-Nex-N2.5-mini-F16.gguf
