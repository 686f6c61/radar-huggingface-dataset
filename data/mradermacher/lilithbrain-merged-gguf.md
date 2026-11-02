# mradermacher/LilithBrain-merged-GGUF

## Resumen

LilithBrain-merged-GGUF es la distribución en formato GGUF del modelo LilithBrain-merged, publicado por el usuario Johnblick187 y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 25.230 millones de parámetros (25,2B), derivado de la familia Gemma 4 según las etiquetas de la model card, y ajustado mediante SFT (supervised fine-tuning) con las librerías Unsloth y TRL. El repositorio contiene únicamente pesos cuantizados estáticos en formato GGUF, pensados para inferencia local con llama.cpp y herramientas compatibles.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas distribuciones GGUF disponibles de este modelo concreto; por otro, sirve como ejemplo de un modelo comunitario de tamaño medio (25B) que cabe en GPUs de consumo con cuantizaciones agresivas. El modelo base declara licencia Apache 2.0 y soporte únicamente para inglés, lo que limita su uso en entornos en castellano sin un ajuste adicional.

No se dispone de información pública sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. La model card se limita a listar los ficheros GGUF generados y a remitir a la documentación habitual de mradermacher sobre cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, segun tags de la model card) |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 4, con 25,2 mil millones de parámetros totales. Según las etiquetas del repositorio, el ajuste se realizó mediante SFT (supervised fine-tuning) usando Unsloth y TRL, lo que sugiere un pipeline de fine-tuning eficiente en memoria sobre el checkpoint base de Gemma 4. No se especifica si hubo fases adicionales de RLHF, DPO o preference optimization, ni se detalla la composición del dataset de instrucciones utilizado.

La model card no aporta información sobre el número de tokens de entrenamiento, la mezcla de datos, ni innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio es una cuantización estática (quantize_version 2, output_tensor_quantised 1) generada con las herramientas habituales de mradermacher; no se han publicado variantes con imatrix o weighted quants en el momento de la consulta.

## Capacidades

- Generación de texto conversacional en inglés, orientada a instrucciones tras el SFT.
- Razonamiento general y respuesta a preguntas, heredado del modelo base Gemma 4.
- Generación de código y matemáticas: capacidad esperable por el tamaño y la familia, aunque no se documenta explícitamente.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con GPU de 24 GB usando Q4_K_M (16,9 GB), ofreciendo respuestas multi-turno sin depender de la nube.
- Prototipado de chatbots especializados: al ser un modelo ajustado por SFT, sirve como base para fine-tuning adicional en dominios concretos (soporte técnico, documentación interna) antes de pasar a producción.
- Generación de código asistida en entornos aislados: con Q5_K_M (19,2 GB) cabe en una RTX 4090 y permite autocompletado y explicación de fragmentos sin enviar código a servicios externos.
- Investigación en cuantización: el repositorio ofrece 11 variantes GGUF desde Q2_K hasta Q8_0, lo que permite estudiar la degradación de calidad frente al tamaño en un modelo de 25B.
- Evaluación comparativa de modelos comunitarios: útil para benchmarks internos de razonamiento y generación en inglés frente a otros modelos de tamaño similar.
- Despliegue en estaciones con una sola GPU consumer: la variante IQ4_XS (14,2 GB) permite ejecutar el modelo en GPUs de 16 GB con offloading parcial o total, según el backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~10,7 GB; IQ4_XS ~14,2 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB; Q8_0 ~27,0 GB. Añadir entre 1 y 3 GB adicionales para contexto y overhead del runtime.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 con contexto largo; RTX 4080/4070 Ti Super (16 GB) para IQ4_XS con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 4090 con Q4_K_M/Q5_K_M; en GPUs de 16 GB con IQ4_XS o Q3_K_M; en GPUs de 12 GB solo con offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LilithBrain-merged-GGUF | 25,2B | no disponible | Apache 2.0 | GGUF | Solo inglés; cuantizaciones estáticas |
| Gemma 2 27B (referencia de familia) | 27B | 8K (modelo base) | Gemma license | safetensors, GGUF | Multilingüe; benchmarks públicos |
| Mistral Small 24B (referencia de tamaño) | 24B | 32K+ | Apache 2.0 | safetensors, GGUF | Multilingüe; benchmarks públicos |
| Qwen 2.5 32B (referencia de tamaño) | 32B | 32K+ | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Multilingüe; benchmarks públicos |

La comparativa se ofrece como referencia de categoría; no se dispone de datos de rendimiento de LilithBrain-merged para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; su rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Sesgos: no se documenta ninguna evaluación de sesgos; al ser un modelo comunitario con SFT, puede heredar sesgos del modelo base y del dataset de instrucciones.
- Alucinación: sin benchmarks ni evaluación de fidelidad, el riesgo de alucinación es desconocido y debe asumirse alto en producción.
- Contexto: se desconoce la longitud de contexto efectiva; conviene validarla empíricamente antes de desplegar casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a los términos de Google; conviene verificar la licencia del checkpoint original antes de un despliegue comercial.
- Madurez: el repositorio tiene 10 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Cuantizaciones: las variantes Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LilithBrain-merged-GGUF
- Modelo base: https://huggingface.co/Johnblick187/LilithBrain-merged
- Página de descargas de mradermacher: https://hf.tst.eu/model#LilithBrain-merged-GGUF
- README de referencia sobre GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
