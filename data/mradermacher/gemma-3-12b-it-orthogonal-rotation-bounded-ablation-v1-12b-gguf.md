# mradermacher/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v1-12B-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `grimjim/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v1-12B`, un fine-tune de la familia Gemma 3 de Google en su variante instruct de 12 mil millones de parámetros. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de la comunidad, que distribuye el modelo en múltiples niveles de compresión (desde Q2_K hasta Q8_0) junto con los ficheros `mmproj` necesarios para el procesamiento multimodal de imágenes. El modelo base es un experimento de "ablación acotada" mediante rotación ortogonal, una técnica de edición de pesos que busca eliminar direcciones específicas del espacio de activaciones sin degradar el resto de capacidades.

La relevancia de esta ficha es doble: por un lado, documenta una variante experimental de Gemma 3 12B-it que no sigue el pipeline estándar de alineación de Google, y por otro, ofrece el paquete de cuantizaciones listo para su uso en `llama.cpp` y derivados (Ollama, LM Studio, koboldcpp). Con 11.766.034.176 parámetros reales en safetensors y un repositorio de 83,9 GB que agrupa todos los ficheros, es una opción práctica para desplegar un modelo de 12B multimodal en hardware de consumo.

Conviene subrayar que se trata de un modelo derivado y experimental: la model card del repositorio de cuantización es puramente mecánica (lista de ficheros y notas de uso de GGUF) y no aporta detalles sobre el proceso de ablación, los datos de entrenamiento adicionales ni evaluaciones. Toda la información técnica sobre el fine-tune procede del modelo base, cuyo README no se ha proporcionado en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), con torre visual para entrada multimodal |
| Parámetros totales | 11.766.034.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Gemma 3 12B-it soporta contexto largo, pero no se confirma aquí) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizaciones estáticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de `google/gemma-3-12b-it`, un transformer decoder-only de 12B parámetros con atención multi-cabeza estándar y una torre visual que permite entrada de imágenes (de ahí los ficheros `mmproj` en el repositorio GGUF). La modificación introducida por grimjim se describe como "orthogonal rotation bounded ablation": una edición de pesos que aplica rotaciones ortogonales para anular direcciones concretas del espacio de representaciones, presumiblemente con el objetivo de eliminar comportamientos no deseados o reforzar determinadas respuestas. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO adicionales.

Las cuantizaciones de mradermacher son estáticas (no imatrix) y se han generado con `llama.cpp`, incluyendo los ficheros `mmproj` para preservar la capacidad de procesar imágenes. Existe una versión paralela con cuantizaciones ponderadas/imatrix en el repositorio `mradermacher/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v1-12B-i1-GGUF`, que suele ofrecer mejor calidad por tamaño en los niveles bajos. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con formato instruct (chat template de Gemma 3).
- Procesamiento de imágenes mediante los ficheros `mmproj` (Q8_0 o f16), lo que habilita preguntas sobre imágenes en `llama.cpp` y frontends compatibles.
- Razonamiento y respuesta a preguntas de propósito general heredados de Gemma 3 12B-it.
- Generación de código y matemáticas a nivel de modelo de 12B, sin garantías específicas documentadas para este fine-tune.
- Soporte de conversaciones multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su exposición mediante APIs compatibles con OpenAI.
- Capacidades multilingües limitadas: la model card declara únicamente `en`, aunque Gemma 3 base es multilingüe; no se confirma el alcance real tras el fine-tune.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional local en inglés: desplegado con `llama.cpp` u Ollama en una estación de trabajo con GPU de 12-16 GB, usando Q4_K_M (7,4 GB) para obtener latencia baja en conversaciones multi-turno.
- Análisis de imágenes en local: con el fichero `mmproj-Q8_0` (0,7 GB) se pueden hacer preguntas sobre capturas, diagramas o fotos sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Prototipado de aplicaciones con API compatible: la etiqueta `endpoints_compatible` permite montar un servidor tipo OpenAI con `llama-server` y conectar clientes existentes sin cambios de código.
- Evaluación de técnicas de edición de pesos: investigadores interesados en ablación por rotación ortogonal pueden comparar este fine-tune con Gemma 3 12B-it original usando las mismas cuantizaciones.
- Generación de documentación técnica y resúmenes en inglés: el contexto de Gemma 3 permite procesar documentos largos, aunque conviene verificar el límite efectivo en la práctica.
- Despliegue en hardware modesto: la cuantización Q2_K (4,9 GB) permite ejecutar el modelo en GPU de 6-8 GB o incluso en CPU con RAM suficiente, a costa de calidad.
- Base para fine-tunes posteriores en la comunidad: al estar disponible en GGUF y safetensors, sirve como punto de partida para experimentos de cuantización o adaptación con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los metadatos proporcionados incluyen evaluaciones (MMLU, HumanEval, GSM8K u otras) del fine-tune ni comparaciones con el Gemma 3 12B-it original.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~4,9 GB; Q3_K_M ~6,1 GB; IQ4_XS ~6,7 GB; Q4_K_M ~7,4 GB; Q5_K_M ~8,5 GB; Q6_K ~9,8 GB; Q8_0 ~12,6 GB. Añadir 0,7-1,0 GB si se usa la torre visual (`mmproj`).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q6_K/Q8_0 con contexto amplio; RTX 4070 Ti / 4080 (12-16 GB) para Q4_K_M o Q5_K_M; GPUs de 8 GB para Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: sí, desde Q2_K en tarjetas de 6-8 GB hasta Q8_0 en 16 GB o más. Para contexto largo conviene reservar VRAM adicional para la caché KV.
- Opciones de despliegue: `llama.cpp` (principal), Ollama, LM Studio, koboldcpp, `llama-server` con API compatible OpenAI. Para el modelo base en safetensors, vLLM o TGI (no para los GGUF).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Gemma 3 12B-it + ablación, GGUF) | 11,77B | no disponible | Sí (mmproj) | gemma | GGUF |
| google/gemma-3-12b-it | 12B (aprox.) | no disponible en esta ficha | Sí | gemma | safetensors, GGUF comunitarios |
| Mistral NeMo 12B Instruct | 12B | 128k (según documentación pública) | No | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-14B-Instruct | 14B | 32k (según documentación pública) | No | Apache 2.0 (mayoría de variantes) | safetensors, GGUF |

La comparativa se limita a características estructurales: no hay datos de rendimiento publicados para este fine-tune que permitan contrastar calidad frente a Gemma 3 12B-it original, Mistral NeMo 12B o Qwen2.5-14B. La principal diferencia frente a estos es la presencia de la torre visual y la licencia Gemma, más restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Modelo experimental: la ablación por rotación ortogonal puede alterar comportamientos de forma impredecible; no hay evaluaciones publicadas que confirmen que las capacidades de Gemma 3 12B-it se preservan.
- Idioma: la model card declara únicamente inglés (`en`); el rendimiento en castellano no está verificado y podría ser deficiente.
- Riesgo de alucinación: inherente a los modelos de 12B, sin mitigaciones documentadas específicas para este fine-tune.
- Sesgos: no se documenta ningún proceso de evaluación de sesgos ni de alineación adicional sobre el modelo base.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de desplegar en producción.
- Contexto: no se confirma la longitud efectiva de contexto tras el fine-tune; los valores por defecto de Gemma 3 pueden no aplicarse.
- Tool calling y agentes: no documentados; no asumir su funcionamiento sin pruebas.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda IQ4_XS o superior, o las versiones imatrix del repositorio `-i1-GGUF`.
- Fecha de creación futura (2026-03-15) en los metadatos: tratarla con cautela, ya que puede reflejar un error de registro o una fecha programada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v1-12B-GGUF
- Modelo base (fine-tune): https://huggingface.co/grimjim/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v1-12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v1-12B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-3-12b-it-orthogonal-rotation-bounded-ablation-v1-12B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo original de Google (referencia): https://huggingface.co/google/gemma-3-12b-it
