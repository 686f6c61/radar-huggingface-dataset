# mradermacher/LFM-3-Coder-Claude-Distill-GGUF

## Resumen

LFM-3-Coder-Claude-Distill-GGUF es la distribucion en formato GGUF del modelo Schnuckade/LFM-3-Coder-Claude-Distill, un ajuste fino de la familia LFM-3 (Liquid Foundation Model 3) orientado a generacion de codigo y razonamiento. El modelo original ha sido destilado a partir de trazas y conjuntos de razonamiento generados por modelos Claude de Anthropic (Sonnet 4.5, Sonnet 4.6 y Opus 4.6/4.7), segun los nueve datasets listados en la model card. La cuantizacion la firma mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos populares.

El modelo cuenta con aproximadamente 1.728 millones de parametros (1,73 B), un tamano compacto que lo hace apto para inferencia en hardware de consumo. La licencia declarada es Apache 2.0 y el unico idioma soportado explicitamente es el ingles. El repositorio ocupa 15,9 GB en total, aunque cada cuantizacion individual ocupa entre 0,9 GB (Q2_K) y 3,6 GB (f16).

La relevancia de esta ficha radica en que combina dos tendencias actuales: la destilacion de capacidades de razonamiento de modelos frontera propietarios hacia modelos abiertos pequenos, y la publicacion de cuantizaciones listas para usar con llama.cpp y ecosistemas compatibles. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y la model card no incluye informacion sobre arquitectura interna, contexto ni datos de entrenamiento mas alla de la lista de datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM-3, transformer segun tags) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Los tags indican la familia `lfm3` y el pipeline `transformers`, con `unsloth` como herramienta asociada al ajuste fino, lo que sugiere que el entrenamiento se realizo con el framework Unsloth sobre una base LFM-3. El modelo base es Schnuckade/LFM-3-Coder-Claude-Distill, y este repositorio es una conversion estatica a GGUF realizada por mradermacher (convert_type: hf, quantize_version: 2).

El entrenamiento del modelo original se basa en destilacion a partir de datos generados por Claude. Los datasets listados incluyen trazas de Cursor (TeichAI/Fable-5-Cursor-Traces), conjuntos de razonamiento de Claude Sonnet 4.6 (1100x y 120000x), Claude Opus 4.6 (887x, 700x high-reasoning y 8.7k), Claude Sonnet 4.5 high-reasoning (250x), una mezcla Sonnet/Opus 4.6 (500 ejemplos) y un conjunto limpiado de Opus 4.7 max. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. La model card no documenta innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de codigo: el modelo esta etiquetado como `code` y entrenado sobre trazas de Cursor, lo que indica especializacion en completado y generacion de codigo en editores.
- Razonamiento: los datasets de destilacion son conjuntos de "reasoning" de Claude Sonnet y Opus, por lo que el modelo incorpora patrones de razonamiento paso a paso.
- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation-inference` indican soporte para dialogos multi-turno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la presencia de trazas de Cursor sugiere uso en entornos de edicion asistida, pero no se documenta soporte de agentes.
- Capacidades multilingues: limitadas al ingles (`language: en`).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Asistente de codigo en IDE: el modelo puede integrarse en extensiones tipo Cursor o Continue para autocompletado y generacion de funciones, aprovechando su entrenamiento sobre trazas de Cursor y su tamano de 1,73 B que permite ejecucion local con baja latencia.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede producir casos de prueba en el mismo lenguaje, apoyandose en los patrones de razonamiento destilados de Claude Sonnet y Opus.
- Explicacion y refactorizacion de codigo legacy: con una ventana de contexto no documentada pero presumiblemente suficiente para funciones y modulos, el modelo puede resumir y reescribir bloques de codigo en ingles tecnico.
- Prototipado rapido en entornos con recursos limitados: al caber en cuantizaciones de 1,2 GB (Q4_K_M), puede desplegarse en portatiles con GPU de 6-8 GB de VRAM o incluso en CPU con llama.cpp, ideal para demos y pruebas offline.
- Generacion de documentacion tecnica: el modelo puede redactar docstrings y comentarios en ingles a partir de firmas de funciones y codigo fuente.
- Chatbot de soporte para desarrolladores: con capacidades conversacionales y de razonamiento, puede responder preguntas tecnicas en ingles sobre APIs y errores de compilacion, aunque sin garantias de tool calling.
- Filtrado y clasificacion de codigo en pipelines de CI: puede usarse para detectar patrones sospechosos o resumir diffs en ingles, siempre con supervision humana dada la ausencia de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 y 2,5 GB para cuantizaciones Q4_K_M (1,2 GB de pesos) y Q5_K_M (1,4 GB), incluyendo overhead de contexto y KV cache; hasta 4-5 GB para f16 (3,6 GB de pesos).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien funciona en GPUs de datacenter (A100, H100) aunque el modelo es demasiado pequeno para aprovecharlas.
- Cabe en GPU consumer: si, en practicamente todas las GPUs dedicadas modernas y en iGPUs con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), LM Studio, text-generation-inference (TGI) con soporte GGUF, y servidores compatibles con la API de OpenAI mediante llama.cpp server.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano (1,73 B) se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM-3-Coder-Claude-Distill-GGUF | ~1,73 B | no disponible | Apache 2.0 | GGUF | Destilado de Claude, solo ingles, sin benchmarks |
| Qwen2.5-Coder-1.5B | ~1,5 B | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Referencia en codigo para tamano similar; datos no verificados en esta busqueda |
| DeepSeek-Coder-1.3B | ~1,3 B | 16k (segun version) | DeepSeek License | safetensors, GGUF | Alternativa pequena para codigo; datos no verificados en esta busqueda |

No se dispone de datos de rendimiento comparativo verificables en la informacion proporcionada; la comparativa se limita a parametros y licencia. Los modelos alternativos citados son referencias genericas de la categoria y no han sido evaluados contra este modelo en la busqueda realizada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser destilado de salidas de Claude, puede heredar sesgos de estilo y contenido de esos modelos, sin que el autor los haya auditado.
- Riesgo de alucinacion: alto en modelos pequenos destilados; no hay evaluaciones de fidelidad ni de tasa de alucinacion publicadas.
- Limitaciones de contexto o idioma: solo ingles declarado; la longitud de contexto no esta documentada, lo que impide planificar usos con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la procedencia de los datos de destilacion (salidas de Claude) puede plantear dudas sobre los terminos de uso de Anthropic; el autor no aborda esta cuestion.
- Caveats para produccion: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes; la model card es una plantilla generica de mradermacher sin documentacion tecnica del modelo base. No se recomienda su uso en produccion sin evaluacion propia.
- El repositorio incluye solo cuantizaciones estaticas; no hay versiones con imatrix publicadas por el autor en el momento de la consulta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM-3-Coder-Claude-Distill-GGUF
- Modelo base: https://huggingface.co/Schnuckade/LFM-3-Coder-Claude-Distill
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM-3-Coder-Claude-Distill-GGUF
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH: https://www.nethype.de/
