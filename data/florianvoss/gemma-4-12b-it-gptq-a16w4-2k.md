# florianvoss/Gemma-4-12B-it-GPTQ-a16w4-2k

## Resumen

El modelo `florianvoss/Gemma-4-12B-it-GPTQ-a16w4-2k` es un paquete de ejecución (runtime) compilado, no un checkpoint cargable con Transformers. Se trata de una compilación del modelo multimodal `simaai/Gemma-4-12B-it-GPTQ-Safetensors` (a su vez derivado de `google/gemma-4-12B-it`) para el acelerador SiMa.ai Modalix con el Model SDK 3.0.0. El resultado son 245 componentes ELF y grafos SDK empaquetados para el runtime LLiMa.

El modelo subyacente es Gemma 4 de 12 000 millones de parámetros en su variante instruct, con capacidades «any-to-any»: procesa texto, imagen y audio. Esta compilación concreta fija un contexto de 2048 tokens y grupos de prefill de 128 tokens, con decoder y LM head cuantizados a GPTQ INT4 (group size 256), activaciones BF16 y proyecciones multimodales en INT8. El techo de imagen se establece en 384 tokens «soft» y el audio admite hasta 30 segundos por adjunto, contando ambos hacia la ventana de contexto.

Su relevancia es acotada y muy específica: sirve para desplegar Gemma 4 12B en hardware de borde SiMa.ai Modalix, no en GPUs convencionales. La propia model card advierte de que es una build de desarrollo: la compilación terminó correctamente y las comparaciones numéricas en host pasaron, pero la validación de inferencia y rendimiento sobre Modalix sigue pendiente. El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (texto, imagen, audio) con atención global y atención deslizante por buckets; derivada de Gemma 4 12B IT. No se indica que sea MoE |
| Parámetros totales | 12 000 millones (según la denominación del modelo; cifra exacta no disponible en la información) |
| Parámetros activos | No aplica / no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 2048 tokens, con grupos de prefill de 128 tokens |
| Tipos de cuantización | Decoder y LM head en GPTQ INT4 con group size 256; activaciones BF16; proyecciones de imagen y audio en RTN INT8 por canal de salida; embeddings de entrada y KV cache en INT8 con escalas BF16 por token |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`); listado concreto de idiomas no disponible |
| Licencia | `apache-2.0` según las etiquetas del repositorio, pero la model card enlaza a la licencia de Gemma 4 de Google. Contradicción no resuelta en la información disponible |
| Formato de pesos | No es safetensors ni GGUF: 245 componentes ELF compilados y grafos SDK, más `devkit/` con configuración, tokenizador y embeddings. No cargable con Transformers |

## Arquitectura y entrenamiento

La información disponible describe el paquete compilado, no el entrenamiento del modelo original. Arquitectónicamente, la model card especifica atención causal global por buckets junto con buckets de atención deslizante que van de 128 a 1536 posiciones en pasos de 128 tokens, con máscaras de imagen dinámicas. El procesamiento de imagen reescala solo cuando es necesario, alinea a parches de 48 píxeles y no amplía imágenes pequeñas; las dimensiones muy reducidas se rellenan hasta un parche. El techo de imagen es de 384 tokens «soft» y el audio admite hasta 30 segundos por adjunto.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineamiento del modelo Gemma 4 original. Tampoco se documenta el uso de decodificación especulativa o MTP: la model card indica explícitamente que esta compilación no incluye MTP ni decodificación especulativa. La innovación técnica relevante aquí es de despliegue, no de entrenamiento: la compilación a un runtime de borde con cuantización mixta (INT4 en pesos del decoder, INT8 en embeddings, KV cache y proyecciones multimodales, BF16 en activaciones) para el acelerador Modalix.

## Capacidades

- Procesamiento «any-to-any»: entrada y salida de texto, con entrada de imagen y audio según la etiqueta de pipeline `any-to-any`.
- Generación de texto conversacional en modo instruct (variante `-it`).
- Comprensión de imagen con techo de 384 tokens «soft» por imagen y máscaras dinámicas.
- Comprensión de audio de hasta 30 segundos por adjunto, con soporte de partes `input_audio` en base64 y formatos `wav` o `mp3` a través de `/v1/chat/completions` en modo web.
- Multilingüismo declarado mediante la etiqueta `multilingual`; la lista de idiomas no está disponible.
- Interfaz de línea de comandos del runtime LLiMa, con los comandos `add image <archivo>` y `add audio <archivo>` previos a la consulta de texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo «thinking» explícito: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware de borde SiMa.ai Modalix: es el único escenario para el que este paquete está diseñado, ya que se ejecuta mediante `llima run` sobre el acelerador Modalix y no sobre GPUs convencionales.
- Asistentes multimodales locales con contexto corto: con 2048 tokens de ventana, encaja en turnos de conversación breves que adjunten una imagen o un clip de audio de hasta 30 segundos.
- Inspección visual asistida en el borde: clasificación, descripción o respuesta a preguntas sobre imágenes que no requieran alta resolución, dado el techo de 384 tokens «soft» y el reescalado a parches de 48 píxeles.
- Transcripción y comprensión de audio corto: consultas sobre fragmentos de hasta 30 segundos, enviados como `input_audio` en base64 vía API compatible con OpenAI.
- Integración en aplicaciones web con API compatible con OpenAI: el modo web expone `/v1/chat/completions`, lo que permite sustituir un endpoint remoto por el runtime local sin reescribir el cliente.
- Evaluación y prototipado del stack SiMa.ai: útil para equipos que validan el SDK 3.0.0 y el runtime LLiMa antes de un despliegue en producción.
- Investigación sobre cuantización mixta en el borde: el paquete documenta una combinación concreta (INT4 GPTQ G256, INT8 por canal, BF16 por token) replicable como referencia de estudio.
- No se recomienda para generación de código en producción, razonamiento de contexto largo ni cargas de trabajo de agente, dado que no hay evidencia de estas capacidades en la información disponible y el contexto está limitado a 2048 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la validación de inferencia y rendimiento empaquetados sobre Modalix «sigue pendiente» y que la compilación por sí sola no establece precisión ni throughput en hardware. Tampoco se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación del modelo base.

## Requisitos de hardware

- Acelerador objetivo: SiMa.ai Modalix, con Model SDK 3.0.0 y un runtime LLiMa compatible. No se trata de un modelo para GPU.
- VRAM estimada en GPU: no aplica; no se documenta soporte para CUDA, ROCm ni Metal.
- GPU recomendadas (A100, H100, RTX 4090, etc.): no aplica / no disponible.
- Compatibilidad con GPU de consumo: no; el paquete se ejecuta sobre Modalix.
- Tamaño del repositorio: 14,6 GB, incluyendo 245 componentes compilados en `elf_files/` y los activos de `devkit/`.
- Opciones de despliegue: `llima run ./Gemma-4-12B-it-GPTQ-a16w4-2k` sobre Modalix. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un checkpoint cargable con Transformers.
- Requisito de runtime: exige la rama `feature/249-gemma4-12b-unified` en el commit `1a44e403232e963a6e2cb1ccd39211954de643c3` más actualizaciones locales de techo de imagen y buckets de caché que, según el autor, no están todas publicadas. La configuración antigua de 4K y una build de rama anterior no son suficientes.
- Latencia y throughput estimados: no disponible. Sin validación de rendimiento publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `florianvoss/Gemma-4-12B-it-GPTQ-a16w4-2k` | 12 000 millones (nominal) | 2048 tokens | GPTQ INT4 G256 (decoder y LM head), INT8 (embeddings, KV y proyecciones), BF16 (activaciones) | `apache-2.0` en etiquetas, con enlace a la licencia de Gemma 4 | Componentes ELF compilados y grafos SDK | Runtime de borde SiMa.ai Modalix; 0 descargas |
| `simaai/Gemma-4-12B-it-GPTQ-Safetensors` (modelo base) | No disponible | No disponible | GPTQ, según el nombre | No disponible en la información | Safetensors (según el nombre) | En HuggingFace, revisión `439652738fc4ef93217a57d599c97ee58c42d748` |
| `google/gemma-4-12B-it` (modelo original) | 12 000 millones (nominal) | No disponible | Pesos originales sin cuantizar | Licencia de Gemma 4 de Google | No disponible en la información | En HuggingFace, revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7` |

No se dispone de datos de rendimiento comparado entre estos tres modelos, por lo que la comparativa se limita a formato, contexto, cuantización y disponibilidad.

## Limitaciones y advertencias

- Es una build de desarrollo, no una versión estable: la model card indica que la validación de inferencia y rendimiento sobre Modalix está pendiente de completar.
- Requiere una versión concreta del runtime LLiMa y cambios que no están íntegramente publicados. Sin esa build exacta, el paquete no funciona.
- No es un checkpoint cargable con Transformers; no sirve para cargas de trabajo habituales con vLLM, TGI, llama.cpp u Ollama.
- Contexto muy limitado: 2048 tokens, y los tokens de imagen y audio cuentan dentro de esa ventana, por lo que adjuntar media reduce el espacio disponible para texto.
- Techo de imagen de 384 tokens «soft» y audio de 30 segundos máximo por adjunto; las imágenes pequeñas no se amplían y las dimensiones mínimas se rellenan a un parche.
- Sin MTP ni decodificación especulativa, lo que puede penalizar la latencia de generación frente a implementaciones que sí las usan.
- Ambigüedad de licencia: las etiquetas declaran `apache-2.0`, pero la model card apunta a la licencia de Gemma 4 de Google. Antes de un uso comercial debe aclararse cuál prevalece, ya que la licencia de Gemma impone condiciones de uso adicionales.
- La model card remite a «la licencia y las guías de uso del modelo fuente», lo que refuerza que las condiciones originales de Gemma se aplican.
- Riesgo de sesgos: no disponible. No se documenta ninguna evaluación de sesgo, toxicidad o robustez.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es esperable en un modelo de 12 000 millones cuantizado a INT4 sin datos de evaluación publicados.
- Idiomas concretos soportados: no disponible. La etiqueta `multilingual` no se acompaña de una lista verificable.
- Sin soporte declarado de tool calling, function calling ni flujos de agente; no debe asumirse su disponibilidad.
- La precisión numérica en hardware real no está verificada: solo se realizaron comparaciones numéricas en host y comprobaciones de sintaxis de C++.
- Repositorio sin tracción: 0 descargas y 0 «likes», sin evidencia de uso en producción por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/florianvoss/Gemma-4-12B-it-GPTQ-a16w4-2k
- Modelo base: https://huggingface.co/simaai/Gemma-4-12B-it-GPTQ-Safetensors (revisión `439652738fc4ef93217a57d599c97ee58c42d748`)
- Modelo original: https://huggingface.co/google/gemma-4-12B-it (revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`)
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- SiMa.ai: no se proporciona URL en la información disponible
- Documentación del Model SDK 3.0.0 y del runtime LLiMa: no disponible
- Paper, blog técnico o demo: no disponible
