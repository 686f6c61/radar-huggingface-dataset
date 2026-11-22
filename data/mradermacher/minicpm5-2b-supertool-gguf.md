# mradermacher/MiniCPM5-2B-Supertool-GGUF

## Resumen

MiniCPM5-2B-Supertool es un modelo de lenguaje de aproximadamente 2.500 millones de parámetros (2.516.756.480 exactos según los pesos en safetensors) especializado en tool calling y function calling, orientado a flujos de agentes. La versión aquí descrita es la cuantización GGUF publicada por mradermacher a partir del modelo original de saidutta69, disponible en Hugging Face. El modelo base se ha afinado mediante QLoRA sobre dos conjuntos de datos orientados a razonamiento y uso de herramientas (saidutta69/fable-5.1-premium-v2 y MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x), y se etiqueta explícitamente con términos como "claude-code" y "agents".

El interés de esta ficha reside en que ofrece un modelo compacto (en torno a 2,5 B de parámetros) con cuantizaciones que van desde 1,1 GB (Q2_K) hasta 5,1 GB (f16), lo que permite ejecutarlo en hardware de consumo y en entornos con recursos limitados. Su licencia Apache 2.0 facilita el uso comercial sin las restricciones de otros modelos abiertos, y su enfoque en tool calling lo hace candidato para pipelines de agentes ligeros, asistentes de código y automatizaciones que requieran llamadas estructuradas a funciones.

La información pública disponible es limitada: no se detallan la longitud de contexto, la arquitectura interna, los idiomas soportados ni resultados de benchmarks. Esta ficha recoge únicamente los datos verificables de la model card y de los metadatos de Hugging Face, indicando explícitamente "no disponible" cuando corresponde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM5-2B, transformer; detalles internos no publicados en la información disponible) |
| Parámetros totales | 2.516.756.480 (≈2,5 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); además existen cuantizaciones ponderadas/imatrix en el repo i1-GGUF del mismo autor |
| Idiomas soportados | inglés (según el campo `language: en` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se publican detalles sobre la arquitectura interna del modelo base (número de capas, dimensiones ocultas, mecanismo de atención, etc.). Por el nombre y el tamaño, se trata de un transformer de aproximadamente 2,5 B de parámetros derivado de la familia MiniCPM5-2B. El modelo original saidutta69/MiniCPM5-2B-Supertool fue afinado mediante QLoRA (según la etiqueta `qlora` de la model card) sobre dos datasets: `saidutta69/fable-5.1-premium-v2` y `MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x`. El segundo sugiere un filtrado orientado a razonamiento de alta calidad, aunque no se especifican el número de tokens, la composición exacta ni si hubo etapas de RLHF o DPO.

La innovación principal de esta publicación no está en el entrenamiento, sino en la distribución: mradermacher genera cuantizaciones estáticas GGUF en una amplia gama de tipos (desde Q2_K hasta f16) y ofrece además una variante con cuantización ponderada/imatrix (i1-GGUF) para quienes priorizan la calidad por bit. El proceso de conversión se realizó a partir del modelo en formato Hugging Face (`convert_type: hf`), lo que permite su uso directo con llama.cpp y derivados.

## Capacidades

- Generación de texto conversacional en inglés.
- Tool calling y function calling: el modelo está etiquetado explícitamente para ello y entrenado sobre datasets orientados a uso de herramientas.
- Soporte para flujos de agentes y razonamiento multi-paso (etiquetas `agents` y `claude-code`).
- Razonamiento: el dataset de entrenamiento incluye un conjunto filtrado de razonamiento (`Fable-5.1-Max-Reasoning-Filtered-10000x`), lo que sugiere capacidad de cadena de pensamiento, aunque no se documenta formalmente un "thinking mode".
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes de código con llamada a herramientas: el modelo puede integrarse en entornos tipo Claude Code o similares para invocar funciones (leer archivos, ejecutar comandos, consultar APIs) gracias a su entrenamiento específico en tool calling y su tamaño reducido, que permite ejecutarlo localmente.
- Agentes ligeros en el borde: con cuantizaciones Q4_K_M (1,7 GB) o Q5_K_M (1,9 GB) puede desplegarse en portátiles y mini-PC para tareas de automatización de escritorio con llamadas a funciones.
- Automatización de soporte técnico: gestión de conversaciones multi-turno en inglés con invocación de APIs internas (consultas de estado, creación de tickets) mediante function calling.
- Enrutamiento y clasificación con herramientas: uso como modelo "router" que decide qué función o servicio invocar en un pipeline mayor, aprovechando su bajo coste de inferencia.
- Prototipado rápido de agentes: al ser Apache 2.0 y caber en GPU de consumo, sirve para validar arquitecturas de agentes antes de escalar a modelos mayores.
- Entornos con restricciones de privacidad: despliegue on-premise en GGUF con llama.cpp u Ollama para procesar datos sensibles sin salir de la infraestructura local.
- Educación e investigación: modelo pequeño para experimentar con QLoRA, cuantización y evaluación de tool calling sin grandes presupuestos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el overhead de contexto. Orientativamente: Q2_K ≈ 1,1 GB, Q4_K_M ≈ 1,7 GB, Q5_K_M ≈ 1,9 GB, Q6_K ≈ 2,2 GB, Q8_0 ≈ 2,8 GB, f16 ≈ 5,1 GB (sin contar KV cache).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más usando Q4_K_M o Q5_K_M; en GPUs con 4 GB conviene Q3_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros motores compatibles con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI (sujeto a soporte de la arquitectura MiniCPM5).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Supertool (esta ficha) | ≈2,5 B | no disponible | Apache 2.0 | GGUF, safetensors | Afinado para tool calling y agentes |
| Qwen2.5-3B-Instruct | ≈3 B | 32 K (según versión) | Apache 2.0 | GGUF, safetensors | Modelo generalista con buen soporte de tool calling |
| Llama-3.2-3B-Instruct | ≈3 B | 128 K | Llama 3.2 Community License | GGUF, safetensors | Generalista, licencia con restricciones |
| Phi-3.5-mini-instruct | ≈3,8 B | 128 K | MIT | GGUF, safetensors | Generalista con razonamiento y contexto largo |

Los datos de contexto y rendimiento de los modelos comparados corresponden a sus especificaciones públicas habituales; para este modelo no se dispone de esa información en la documentación consultada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un modelo base y de datasets específicos, puede heredar sesgos de sus fuentes.
- Alucinación: no hay datos sobre tasas de alucinación; en tareas de tool calling, una llamada mal formada o inventada puede romper el pipeline, por lo que conviene validar las salidas con esquemas estrictos.
- Contexto: la longitud de contexto no está documentada; planificar despliegues con ventanas conservadoras hasta verificarla empíricamente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias y condiciones de los datasets de entrenamiento originales, no detalladas en la información disponible.
- Producción: al ser una cuantización comunitaria de un modelo afinado por un tercero, no hay garantías de soporte ni de mantenimiento; se recomienda evaluar con datos propios antes de desplegar.
- Tamaño: con 2,5 B de parámetros, su capacidad de razonamiento complejo y de seguir instrucciones largas es limitada en comparación con modelos de 7 B o más.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-GGUF
- Modelo base original: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiniCPM5-2B-Supertool-GGUF
- Dataset Fable 5.1 Premium v2: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Dataset Fable 5.1 Max Reasoning Filtered: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
