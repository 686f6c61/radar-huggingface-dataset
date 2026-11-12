# mradermacher/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic-GGUF

## Resumen

Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo base xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic, publicada por mradermacher. El modelo subyacente es un merge de la familia Qwen3.5 de 4B parametros, afinado sobre trazas de razonamiento de modelos Claude (Opus 4.6 y 4.7) y sobre trazas de agente Hermes, y posteriormente sometido a un proceso de "abliteration"/"heretic" que elimina las capas de rechazo y censura del modelo original.

El resultado es un modelo conversacional de 4.326.350.848 parametros (aproximadamente 4,3B) orientado a generacion de texto y razonamiento multi-paso, con enfasis en la reproduccion de trazas de razonamiento estilo Claude y en la ausencia de filtros de seguridad. La model card declara un unico idioma soportado, el ingles, y licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta una variante GGUF lista para desplegar en hardware de consumo; por otro, advierte de que se trata de un modelo descensurado, derivado de un merge comunitario, sin datos publicados de benchmarks y con cero descargas en el momento de la consulta. No es un modelo oficial de Alibaba ni de Anthropic: es un artefacto de la comunidad construido sobre Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles de atencion no disponibles |
| Parametros totales | 4.326.350.848 (aprox. 4,3B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge de tres variantes de Qwen3.5-4B afinadas por Jackrong sobre trazas de razonamiento, segun se deduce del nombre "Claude-3xMerge-Jackrong". Sobre ese merge se aplico un proceso "heretic"/"abliterated", una tecnica de edicion de pesos que elimina direcciones de activacion asociadas al rechazo de peticiones, dando lugar a la variante UNCENSORED. El repositorio de cuantizacion no aporta detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

Los datasets declarados en los metadatos son todos de trazas de razonamiento y de agente: nohurry/Opus-4.6-Reasoning-3000x-filtered, Jackrong/Qwen3.5-reasoning-700x, Roman1111111/claude-opus-4.6-10000x, Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces. Esto indica un entrenamiento orientado a imitar cadenas de pensamiento largas y a soportar flujos de agente, no a conocimiento factual general. La model card incluye ademas ficheros mmproj, lo que sugiere que el modelo base incorpora un proyector multimodal, aunque la informacion disponible no detalla la arquitectura de vision.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento multi-paso con trazas de pensamiento extensas, heredadas del afinado sobre datos de Claude Opus 4.6 y 4.7.
- Razonamiento orientado a agentes y uso de herramientas, segun los datos de hermes-agent-reasoning-traces.
- Proyeccion multimodal disponible mediante ficheros mmproj (Q8_0 y f16), aunque el alcance real de vision no esta documentado.
- Ausencia deliberada de capas de rechazo: responde a peticiones que el modelo original rechazaria.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta soporte explicito de function calling estructurado ni de modo "thinking" conmutable.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio de abliteration, permitiendo medir como cambia la tasa de rechazo y la calidad del razonamiento tras eliminar las capas de seguridad, siempre en entornos controlados.
- Generacion de trazas de razonamiento sinteticas para destilacion: sus cadenas de pensamiento estilo Claude pueden usarse para crear datasets de entrenamiento de modelos mas pequenos, con revision humana obligatoria por el riesgo de contenido no filtrado.
- Prototipado local de agentes en hardware de consumo: con cuantizaciones Q4_K_M o Q5_K_M cabe en GPUs de 8-12 GB y permite iterar sobre bucles de agente sin coste de API.
- Analisis de texto sin restricciones tematicas: util en entornos de investigacion que requieren estudiar contenido sensible (ficcion adulta, escenarios de ciberseguridad defensiva) sin que el modelo se niegue, con las salvaguardas externas que correspondan.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes de cuantizacion, lo que permite estudiar la degradacion de calidad de razonamiento segun el bit-width en un modelo de 4B.
- Generacion de dialogos y guiones para pruebas de robustez de filtros: sirve para producir entradas adversarias con las que evaluar clasificadores de contenido de terceros.
- Fine-tuning posterior: al ser Apache 2.0 y de 4B parametros, es viable reentrenarlo en una sola GPU de 24 GB con LoRA para dominios especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de rechazo, y el autor no aporta comparaciones con el modelo base ni con Qwen3.5-4B original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en Q2_K, 3-4 GB en Q4_K_M, 4-5 GB en Q6_K y 8-9 GB en f16 (calculado sobre 4,3B parametros; no verificado por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070) para cuantizaciones Q4-Q5; RTX 4090 o A100/H100 solo necesarias para f16 o para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas de 8 GB o mas con cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI mediante llama.cpp; vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput: no disponibles. En una RTX 4090 con Q4_K_M se puede esperar un rendimiento interactivo, pero no hay mediciones publicadas.
- Nota: los ficheros mmproj anaden 0,5-0,8 GB si se activa la parte multimodal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic (este) | 4,3B | no disponible | Apache 2.0 | Merge comunitario descensurado, solo ingles, sin benchmarks |
| Qwen3.5-4B (oficial) | ~4B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen) | Modelo base oficial, con filtros de seguridad y multilingue |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community License | Oficial, multilingue, con benchmarks publicados |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | Oficial, multilingue, con benchmarks publicados |

No se dispone de datos de rendimiento de este modelo para establecer una comparacion cuantitativa; la tabla recoge solo parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo descensurado ("uncensored", "abliterated"): no aplica filtros de seguridad y puede generar contenido danino, ilegal o sexualmente explicito. No debe desplegarse en aplicaciones de cara al publico sin moderacion externa.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Riesgo elevado de alucinacion: es un merge de 4B afinado sobre trazas de razonamiento, no sobre conocimiento factual verificado.
- Sin benchmarks publicados ni validacion independiente; la calidad real es desconocida.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion.
- El proceso de abliteration puede degradar capacidades generales (razonamiento, codigo) ademas de eliminar los rechazos.
- Origen comunitario: no es un modelo oficial de Alibaba ni de Anthropic; los nombres "Claude" y "Qwen" son referencias a los datos y a la base, no una afiliacion.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado.
- La longitud de contexto no esta documentada; no asumir ventanas largas sin verificar en el tokenizador del modelo base.
- Los ficheros mmproj sugieren vision, pero no hay documentacion sobre su funcionamiento ni su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset Jackrong/Qwen3.5-reasoning-700x: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
