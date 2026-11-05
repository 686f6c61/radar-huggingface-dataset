# mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF

## Resumen

Esta ficha describe la cuantización GGUF del modelo `yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated`, publicada por el usuario mradermacher. Se trata de un modelo de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) derivado de la familia Qwen 3.5 y destilado a partir de DeepSeek V4 Pro, según indican las etiquetas de la model card (`qwen3_5`, `deepseek`, `distillation`). El autor original no publica detalles sobre la arquitectura interna, el número de tokens de entrenamiento ni la composición del dataset, por lo que buena parte de las especificaciones quedan como "no disponible".

El modelo está orientado a razonamiento, matemáticas, STEM, uso de herramientas y function calling, con soporte declarado para seis idiomas (inglés, chino, coreano, japonés, español y ruso). La model card menciona además técnicas de entrenamiento como SFT, RL y GSPO, y el tag `mtp` (multi-token prediction), aunque no se detalla su implementación. La licencia es Apache 2.0, lo que facilita su uso comercial.

Esta publicación concreta es relevante porque ofrece cuantizaciones imatrix listas para usar con llama.cpp y Ollama, desde Q2_K hasta Q4_K_S, lo que permite ejecutar un modelo de 9B en hardware de consumo. El repositorio ocupa 13,9 GB e incluye un fichero imatrix para generar cuantizaciones propias. No obstante, el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (imatrix); la lista completa de quants generados incluye Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas de la model card, que apuntan a una base Qwen 3.5 (`qwen3_5`) con destilacion desde DeepSeek V4 Pro (`deepseek`, `distillation`). El tag `mtp` sugiere el uso de multi-token prediction, una tecnica de decodificacion especulativa que permite predecir varios tokens por paso, aunque no se especifica como se integra en este modelo concreto. Tampoco se indica si emplea attention lineal, atencion completa o una combinacion hibrida.

En cuanto al entrenamiento, la model card menciona SFT (supervised fine-tuning), RL (reinforcement learning) y GSPO (Group Sequence Policy Optimization), lo que indica un pipeline de post-entrenamiento orientado a razonamiento y matemáticas. Sin embargo, no se publican el numero de tokens de entrenamiento, la composicion del dataset, ni los detalles del proceso de alineacion. El sufijo "Tema_Q-Abliterated" del nombre sugiere una intervencion sobre los pesos (posiblemente una ablacion de ciertos comportamientos), pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito (tag `reasoning`), presumiblemente con modo de pensamiento.
- Matematicas y tareas STEM (tags `math`, `stem`).
- Generacion y comprension de codigo.
- Tool calling y function calling (tags `tool-use`, `function-calling`).
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Posible soporte de vision: la model card indica "This is a vision model" y remite a los ficheros mmproj del repositorio estatico, aunque no se confirma en las especificaciones del modelo base.
- Compatible con endpoints (tag `endpoints_compatible`) y con text-generation-inference.

## Casos de uso

- Razonamiento matematico asistido: el modelo esta entrenado con RL y GSPO sobre tareas de matemáticas, por lo que puede resolver problemas paso a paso en entornos educativos o de verificacion de calculos.
- Generacion de codigo en pipelines de CI/CD: gracias al soporte de function calling, puede integrarse como agente que invoca herramientas de build, tests o linters dentro de un flujo automatizado.
- Agentes multi-paso con tool use: el tag `tool-use` y la compatibilidad con endpoints permiten desplegarlo como backend de agentes que encadenan llamadas a APIs externas.
- Atencion al cliente multilingue: al cubrir espanol, ingles, chino, coreano, japones y ruso, puede gestionar conversaciones en varios idiomas con un unico modelo de 9B.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_S (5,6 GB) permiten ejecutarlo en GPUs consumer de 8 GB o superiores mediante llama.cpp u Ollama, util para prototipado local.
- Analisis de documentos tecnicos en STEM: su orientacion a ciencia y tecnologia lo hace adecuado para resumir papers o extraer datos de informes tecnicos, siempre que la longitud de contexto lo permita (dato no disponible).
- Destilacion y experimentacion: al ser un modelo destilado de DeepSeek V4 Pro sobre base Qwen 3.5, sirve como caso de estudio para investigar tecnicas de distillation y ablacion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - i1-Q2_K: ~4,0 GB.
  - i1-IQ3_M: ~4,6 GB.
  - i1-Q4_K_S: ~5,6 GB.
  - Cuantizaciones de mayor calidad (Q5_K_M, Q6_K) no se detallan en tamano en la informacion disponible, pero para un modelo de 9,2B se situarian aproximadamente entre 6,5 y 8 GB.
- GPU recomendadas: para Q4_K_S basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB; para Q6_K se recomienda 12 GB o mas. Para despliegue con mayor contexto o batch, una RTX 4090 (24 GB) o una A100/H100 ofrecen margen amplio.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas usando Q2_K o IQ3_M; con 12 GB o mas para Q4_K_S con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (segun tags) y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated (i1-GGUF) | ~9,2B | No disponible | Apache 2.0 | GGUF | Destilado de DeepSeek V4 Pro sobre Qwen 3.5; cuantizado por mradermacher |
| Qwen 3.5 9B (base) | ~9B | No disponible | Apache 2.0 (presumible) | Safetensors, GGUF | Modelo base del que deriva; sin destilacion ni ablacion |
| DeepSeek V4 Pro | No disponible | No disponible | No disponible | No disponible | Modelo profesor del que se destila; tamano y contexto no confirmados |

La comparacion con alternativas de la misma categoria es limitada porque no se dispone de datos de rendimiento del modelo ni de especificaciones completas de los modelos de referencia. No se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento, codigo o matematicas no esta verificado de forma independiente.
- El modelo tiene cero descargas y cero likes, y fue creado recientemente (2026-11-05); no hay evidencia de uso en produccion ni validacion por la comunidad.
- El sufijo "Tema_Q-Abliterated" sugiere una modificacion de pesos no documentada; podria afectar al comportamiento del modelo de formas no previstas.
- La longitud de contexto no esta especificada, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas de mitigacion especificas.
- Sesgos conocidos: no disponibles; al derivar de Qwen 3.5 y DeepSeek, podria heredar sesgos de ambos, pero no hay analisis publicado.
- La model card indica que es un modelo de vision, pero no se confirma que los ficheros mmproj esten incluidos en este repositorio (se remite al repositorio estatico); verificar antes de asumir capacidades multimodales.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado conviene revisar las condiciones del modelo base y del profesor (DeepSeek V4 Pro) por si imponen restricciones adicionales.
- El tag `mtp` sugiere decodificacion especulativa, pero no se documenta su impacto en latencia ni compatibilidad con todos los runtimes.

## Enlaces

- Repositorio HuggingFace (esta cuantizacion): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
