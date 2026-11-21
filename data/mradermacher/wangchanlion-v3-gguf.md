# mradermacher/WangchanLION-v3-GGUF

## Resumen

WangchanLION-v3-GGUF es la versión cuantizada en formato GGUF del modelo aisingapore/WangchanLION-v3, publicada por el usuario mradermacher. El modelo original lo desarrolla AI Singapore (AISG) y forma parte de la familia WangchanLION, orientada a tareas de lenguaje y generación aumentada por recuperación (RAG) para tailandés e inglés. Esta versión GGUF no altera los pesos del modelo base: solo los convierte a un formato optimizado para inferencia en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles.

El modelo base cuenta con 8.030.261.312 parámetros (aproximadamente 8 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio. Está construido sobre una arquitectura transformer derivada de Llama 3.1, como indica su licencia llama3.1, y soporta los idiomas inglés y tailandés. La versión cuantizada ofrece un abanico de cuantizaciones que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB), lo que permite desplegarlo en hardware muy diverso.

La relevancia de esta ficha radica en que facilita el acceso a un modelo especializado en tailandés, un idioma con menos recursos que el inglés, en formatos ligeros y ejecutables localmente. El repositorio GGUF tiene 182 descargas y 0 likes en el momento de la consulta, y fue creado el 31 de agosto de 2025 con actualización posterior en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.1, segun licencia y model card) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, th |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su vinculación con la familia Llama 3.1, indicada por la licencia. Se trata, por tanto, de un transformer decoder-only de aproximadamente 8 mil millones de parámetros. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación en la información proporcionada.

La versión GGUF es una conversión estática de los pesos del modelo base aisingapore/WangchanLION-v3, realizada con herramientas de cuantización compatibles con llama.cpp. El autor indica que también ofrece cuantizaciones con imatrix en un repositorio separado (WangchanLION-v3-i1-GGUF). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés y tailandés, según los idiomas declarados en la model card.
- Capacidad de razonamiento y respuesta a instrucciones, heredada del modelo base (no se detallan capacidades específicas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y tailandés.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en tailandés: el modelo puede gestionar conversaciones multi-turno en tailandés e inglés, adecuado para empresas que operan en Tailandia y necesitan un asistente local sin depender de APIs externas.
- Procesamiento de documentos y RAG en tailandés: al estar especializado en este idioma, puede emplearse para responder preguntas sobre corpus documentales tailandeses, integrado en pipelines de recuperación aumentada.
- Traducción asistida inglés-tailandés: útil para pretraducir contenidos y revisión humana posterior, gracias a su cobertura bilingüe.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (5,0 GB) y Q5_K_M (5,8 GB) permiten ejecutar el modelo en GPUs de consumo con 8 GB o más de VRAM mediante llama.cpp u Ollama.
- Prototipado e investigación lingüística: investigadores que estudian el tailandés pueden ejecutar el modelo localmente con cuantizaciones ligeras (Q2_K, 3,3 GB) en equipos sin GPU dedicada.
- Generación de contenido y resúmenes en tailandés: para medios, editoriales o administraciones públicas que necesitan procesar texto en tailandés de forma local y con control sobre los datos.
- Integración en aplicaciones de escritorio o edge: el formato GGUF y los tamaños reducidos permiten empaquetar el modelo en aplicaciones locales sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,3 GB; Q3_K_M ~4,1 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB (tamaños de archivo; la VRAM real puede ser algo superior por el contexto y el overhead).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones medias y altas; A100 o H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, desde cuantizaciones Q2_K hasta Q8_0 en GPUs con 8-12 GB de VRAM; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base también puede servirse con vLLM o TGI a partir de los safetensors originales.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| WangchanLION-v3-GGUF | ~8,03 B | no disponible | en, th | llama3.1 | GGUF |
| Llama 3.1 8B | ~8 B | 128 K (según documentación pública de Meta) | multilingüe | llama3.1 | safetensors, GGUF |
| Qwen2.5 7B | ~7,6 B | 128 K (según documentación pública) | multilingüe | Apache 2.0 | safetensors, GGUF |
| Typhoon (familia tailandesa de SCB 10X) | variable | no disponible | th, en | variable | safetensors, GGUF |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de datos de rendimiento comparativo del modelo WangchanLION-v3 en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Llama 3.1, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: presente como en cualquier modelo generativo; no se han publicado evaluaciones específicas de fidelidad.
- Limitaciones de contexto e idioma: solo se declaran inglés y tailandés; el rendimiento en otros idiomas no está garantizado. La longitud de contexto no está documentada.
- Restricciones de licencia: la licencia llama3.1 impone condiciones de uso comercial y de redistribución que deben revisarse antes de un despliegue en producción; no es una licencia permisiva tipo Apache 2.0.
- Caveat de producción: esta versión GGUF es una cuantización no oficial realizada por un tercero (mradermacher); para producción crítica se recomienda validar la calidad frente al modelo base original en safetensors.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso general.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WangchanLION-v3-GGUF
- Modelo base: https://huggingface.co/aisingapore/WangchanLION-v3
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/WangchanLION-v3-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#WangchanLION-v3-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
