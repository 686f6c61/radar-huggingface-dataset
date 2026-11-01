# mradermacher/bella-bartender-qwen3.5-2b-GGUF

## Resumen

Bella Bartender es un modelo conversacional de 2.000 millones de parámetros (1.881.825.088 exactos) basado en la familia Qwen3.5, entrenado mediante fine-tuning con Unsloth por el usuario juiceb0xc0de. Se trata de un modelo de personalidad única (single-voice) en inglés, orientado a conversación en un rol específico de "bartender", es decir, un asistente con carácter propio para interacciones de chat casual o temáticas.

Esta ficha corresponde a la versión cuantizada en GGUF publicada por mradermacher, un cuantizador muy activo en la comunidad que publica versiones estáticas de modelos populares para su uso en llama.cpp y derivados. El repositorio incluye cuants desde Q2_K (1,1 GB) hasta f16 (3,9 GB), además de suplementos multimodales (mmproj). Con licencia Apache 2.0 y un tamaño tan reducido, es un candidato claro para ejecución local en hardware modesto, portátiles sin GPU dedicada o despliegues edge. No se ha publicado una model card detallada por el autor original, por lo que varios datos técnicos (contexto, datos de entrenamiento) no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), no disponible detalle |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S/M/L, IQ4_XS, Q4_K_S/M, Q5_K_S/M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base es juiceb0xc0de/bella-bartender-qwen3.5-2b, un fine-tune de un modelo Qwen3.5 de 2B de parámetros. El entrenamiento se realizó con Unsloth, una librería optimizada para fine-tuning eficiente en GPU de consumo (usa kernels Triton personalizados y gradient checkpointing mejorado, con reducciones de memoria de hasta el 70-80% frente a implementaciones estándar). Los tags indican que es un modelo de personalidad ("personality") de voz única ("single-voice") y conversacional, lo que sugiere un fine-tune orientado a estilo de diálogo con un personaje definido.

No hay información disponible sobre el dataset de entrenamiento, el número de tokens, ni sobre técnicas de alineación posteriores (RLHF, DPO). Tampoco consta si el modelo base Qwen3.5 subyacente es denso o MoE, aunque el tamaño de 2B sugiere una arquitectura densa. La versión cuantizada incluye archivos mmproj (multi-modal supplement), lo que indica que el modelo original dispone de un proyector multimodal compatible con llama.cpp, aunque no hay documentación sobre sus capacidades de visión.

## Capacidades

- Conversación en inglés con una personalidad definida de tipo "bartender", pensada para chat de rol o asistente casual con carácter propio.
- Generación de texto conversacional multi-turno.
- Posible soporte multimodal: los archivos mmproj incluidos en el repo sugieren capacidad de procesamiento de imágenes vía llama.cpp, aunque no está documentada.
- Compatible con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui.
- No hay información sobre tool calling, agentes, razonamiento estructurado (thinking mode) ni capacidades de código o matemáticas específicas de este fine-tune.

## Casos de uso

- Chatbot de personalidad para entretenimiento: el modelo está específicamente afinado para interpretar un personaje de bartender, útil en apps de conversación casual, juegos o experiencias narrativas interactivas en inglés.
- Prototipado de agentes con rol en local: su tamaño de ~2B y los cuants de 1,1-1,5 GB permiten integrarlo en demos de personajes conversacionales en portátiles sin GPU dedicada.
- Integración en Ollama o LM Studio: los cuants recomendados (Q4_K_M, 1,4 GB) funcionan cómodamente en equipos con 8 GB de RAM, ideal para pruebas rápidas de UX conversacional.
- Fine-tuning adicional: al ser un modelo pequeño con licencia Apache 2.0, sirve como base ligera para nuevos fine-tunes de personalidad con Unsloth en una sola GPU de consumo (por ejemplo, RTX 3060/4090).
- Pruebas de calidad de cuantización: el repo ofrece el rango completo de cuants, útil para evaluar la degradación de Q2_K a Q8_0 en modelos pequeños de personalidad.
- Asistente temático embebido: por su tamaño y licencia permisiva, puede desplegarse en dispositivos edge o kioscos interactivos con diálogo en inglés sin coste de licenciamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fine-tune de personalidad, es probable que tampoco existan evaluaciones formales del modelo base original.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1,1 GB (Q2_K) hasta ~2,1 GB (Q8_0) y ~3,9 GB (f16), más el overhead de contexto. Cualquier cuant cabe en RAM de un portátil moderno.
- GPU recomendadas: no necesita GPU dedicada; funciona por CPU con llama.cpp. Con GPU, cualquier tarjeta con 4 GB de VRAM (RTX 3050, RTX 3060, GTX 1660 con cuants bajos) es más que suficiente.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU de consumo actual, incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, text-generation-webui, Jan. También puede ejecutarse vía transformers con el modelo base en safetensors.
- Latencia y throughput: no disponible; al ser un modelo de ~2B, es esperable una generación fluida por CPU en equipos modernos (decenas de tokens/segundo), aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bella-bartender-qwen3.5-2b (este) | ~1,88 B | no disponible | Apache 2.0 | GGUF / safetensors | Fine-tune de personalidad, inglés |
| Qwen3.5-2B (base) | ~2 B | no disponible | no disponible | safetensors | Modelo base sin personalidad |
| TinyLlama-1.1B Chat | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors / GGUF | Chat generalista, contexto corto |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community | safetensors / GGUF | Chat generalista más capaz, licencia restrictiva |

Nota: la comparativa es orientativa; el modelo de esta ficha es un fine-tune de personaje, no un asistente generalista, por lo que su rendimiento en tareas generales será inferior al de los modelos instruct de referencia.

## Limitaciones y advertencias

- Idioma: el modelo está documentado solo en inglés; no hay soporte declarado para castellano u otros idiomas.
- Especialización estrecha: al ser un fine-tune de personalidad única, probablemente degrade en tareas generales (razonamiento, código, matemáticas) frente al modelo base instruct.
- Riesgo de alucinación: no documentado, pero inherente a modelos de 2B; las respuestas factuales deben verificarse.
- Contexto: la longitud de ventana no está publicada; no se puede garantizar rendimiento en conversaciones largas.
- Sesgos: hereda los sesgos del modelo base Qwen3.5 y de los datos de fine-tuning, que no están documentados.
- Multimodalidad: la presencia de archivos mmproj sugiere capacidad de visión, pero no está documentada ni probada; tratarla como experimental.
- Licencia: Apache 2.0, sin restricciones relevantes para uso comercial.
- Calidad de cuants: los cuants Q2_K y Q3_K_M tienen calidad notablemente reducida según la propia model card; se recomiendan Q4_K_M o superiores.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/bella-bartender-qwen3.5-2b-GGUF
- Modelo base original: https://huggingface.co/juiceb0xc0de/bella-bartender-qwen3.5-2b
- Cuants weighted/imatrix: https://huggingface.co/mradermacher/bella-bartender-qwen3.5-2b-i1-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#bella-bartender-qwen3.5-2b-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
