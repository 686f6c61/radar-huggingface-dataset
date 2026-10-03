# IndexTeam/Index-Nailong-9B-GGUF

## Resumen

Index-Nailong-9B-GGUF es la conversión oficial al formato GGUF del modelo IndexTeam/Index-Nailong-9B, desarrollado por el equipo Index (IndexTeam) y publicado como parte de la familia Index-Translate, orientada a traducción multilingüe. El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 8,95 mil millones), lo que lo sitúa en la gama de 9B, y su pipeline declarado en HuggingFace es `translation`.

La relevancia de esta publicación está en que traslada un modelo de traducción especializado al ecosistema llama.cpp, con cuantizaciones estáticas de posentrenamiento (post-training quantization) que van desde 2 bits hasta f16 en un único repositorio de 81,4 GB. Esto permite ejecutar traducción con restricciones de terminología y formato en hardware de consumo, sin depender de infraestructura de GPU de datacenter.

La familia Index-Translate cubre 150 idiomas y añade un formato de traducción restringida denominado instTrans, que permite imponer glosarios obligatorios, preservar estructuras JSON/CSV/código y adaptar registro o estilo. El informe técnico de la familia está disponible en arXiv (2609.40181) y el código en el repositorio github.com/bilibili/Index-Translate. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la información proporcionada) |
| Parámetros totales | 8.953.803.264 (≈8,95B) |
| Parámetros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | 150 idiomas según la familia Index-Translate (la metadata de HuggingFace no los lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors/BF16 |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo base (tipo de transformer, número de capas, mecanismo de atención o configuración de cabezas). El repositorio únicamente describe el proceso de conversión: se realizó con llama.cpp (rama master, octubre de 2026) mediante cuantización estática de posentrenamiento, y todas las anchuras de bits se publican en un solo repositorio. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí se documenta es el proceso de validación de las cuantizaciones: cada nivel fue comprobado en GPU (NVIDIA A100) contra la conversión F16, usando divergencia KL por token y delta-p RMS mediante `llama-perplexity`, además de comprobaciones puntuales de generación greedy contra los pesos BF16 originales de referencia en transformers. Según el autor, las salidas de Q4_K_M coincidieron casi literalmente con la referencia. La innovación funcional destacable no está en la arquitectura, sino en el formato instTrans de traducción restringida que el modelo es capaz de seguir.

## Capacidades

- Traducción multilingüe en 150 idiomas, con el modelo base Index-Nailong-9B como referencia.
- Traducción con restricciones duras (hard constraints) de cumplimiento binario: aplicación estricta de glosarios terminológicos, por ejemplo `碳纤维:carbon fiber, 抗裂缝:crack resistance`.
- Preservación de formato y estructura en JSON, CSV, código y marcadores de posición (placeholders).
- Restricciones blandas (soft constraints) de cumplimiento gradual: adaptación de tono y estilo (por ejemplo, registro formal de correo empresarial), desambiguación de dominio y sentido (por ejemplo, *plant* traducido como 工厂 en contexto industrial), consistencia entre frases y preservación de LaTeX.
- Traducción de documentos largos, según la descripción de la familia Index-Translate.
- Traducción controlada por sílabas para doblaje: esta capacidad corresponde a los checkpoints Index-Homura (IndexTeam/Index-Homura-2B e IndexTeam/Index-Homura-9B), no al checkpoint Nailong.
- Formato conversacional: el repositorio está etiquetado como `conversational` y admite plantilla de chat con `enable_thinking` configurable.
- Decodificación recomendada: greedy con temperatura 0 y `enable_thinking: false` según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Traducción de documentación técnica con glosario impuesto: usando instTrans se pueden fijar términos obligatorios para que el modelo no alterne entre sinónimos a lo largo de un manual completo, algo crítico en documentación de producto y normativa.
- Localización de ficheros estructurados: al preservar JSON, CSV y marcadores de posición, el modelo puede traducir ficheros de recursos de internacionalización sin romper claves, variables de plantilla ni rutas de código.
- Traducción de contenido legal o médico con terminología fija: las restricciones duras permiten garantizar que un término regulatorio se traduzca siempre igual, reduciendo el riesgo de inconsistencias en documentos con valor contractual.
- Adaptación de registro para comunicación corporativa: con restricciones blandas de estilo se puede traducir correspondencia comercial forzando un registro formal, útil para atención al cliente internacional por escrito.
- Traducción de artículos científicos con LaTeX: la preservación de LaTeX permite procesar borradores con fórmulas sin que se degrade el marcado matemático.
- Despliegue en local para datos sensibles: al distribuirse en GGUF y con licencia Apache 2.0, se puede ejecutar en estaciones de trabajo sin enviar contenido confidencial a APIs externas, algo relevante en sectores regulados.
- Procesamiento por lotes de corpus multilingües: con las cuantizaciones Q4_K_M o Q5_K_M se puede montar un pipeline de traducción masiva en una sola GPU de consumo, manteniendo la coherencia terminológica entre documentos.
- Traducción asistida en herramientas de edición: integrable vía `llama serve` como endpoint compatible con la API de OpenAI, lo que facilita conectarlo a editores o CMS existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta validaciones internas de fidelidad de las cuantizaciones frente a F16 (divergencia KL por token, delta-p RMS con `llama-perplexity` y comprobaciones de generación greedy), sin cifras concretas ni comparaciones con otros modelos de traducción.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño de los ficheros publicados; no proceden de mediciones oficiales del autor.

- Q2_K (3,83 GB): cabe en GPU de 6 GB, con pérdida de calidad significativa según el propio autor.
- Q3_K_S / Q3_K_M / Q3_K_L (4,26–4,93 GB): aptas para GPU de 6–8 GB, con pérdida de calidad perceptible.
- IQ4_XS (5,23 GB) y Q4_K_S (5,35 GB): opciones de 4 bits para GPU de 8 GB.
- Q4_K_M (5,63 GB): cuantización recomendada por el autor; con caché KV y contexto moderado, el consumo total se sitúa aproximadamente en 7–9 GB de VRAM, por lo que encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores.
- Q5_K_S / Q5_K_M (6,31–6,47 GB): requieren del orden de 8–10 GB de VRAM según contexto; viables en RTX 4070 Ti, RTX 4080 o RTX 3090.
- Q6_K (7,36 GB) y Q8_0 (9,53 GB): recomendables en GPU de 12–16 GB o más, por ejemplo RTX 4090, RTX 4080 o A100.
- f16 (17,92 GB): requiere alrededor de 20 GB de VRAM o más; adecuada para A100 40/80 GB, H100 o RTX 4090 con offload parcial.
- Ejecución en CPU: al ser GGUF y estar pensado para llama.cpp, el modelo puede correr total o parcialmente en CPU con RAM suficiente (aproximadamente igual al tamaño del fichero más el contexto); el rendimiento dependerá del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama serve`, `llama cli`), y cualquier runtime compatible con GGUF (Ollama, LM Studio, servidores basados en llama.cpp). No se menciona compatibilidad con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| IndexTeam/Index-Nailong-9B-GGUF | ≈8,95B | no disponible | 150 (familia) | Apache 2.0 | GGUF (2–16 bits) | Público en HuggingFace, 96 descargas |
| IndexTeam/Index-Nailong-9B | ≈8,95B (según el GGUF derivado) | no disponible | 150 (familia) | Apache 2.0 | safetensors / BF16 | Público en HuggingFace |
| IndexTeam/Index-Homura-9B | 9B (según nombre) | no disponible | no disponible | no disponible | no disponible | Público en HuggingFace; orientado a doblaje con control de sílabas |
| IndexTeam/Index-Translate-35B-A3B-preview-GGUF | 36B (etiqueta de HuggingFace) | no disponible | no disponible | no disponible | GGUF | Público en HuggingFace; variante MoE de mayor tamaño |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay datos publicados de benchmarks de traducción, por lo que no es posible verificar la calidad real frente a alternativas comerciales o abiertas.
- Las cuantizaciones Q2_K, Q3_K_S, Q3_K_M y Q3_K_L presentan pérdida de calidad reconocida explícitamente por el autor; no son recomendables para producción con requisitos de fidelidad.
- La longitud de contexto no está documentada, lo que impide planificar con precisión tareas de traducción de documentos largos o conversaciones multi-turno extensas.
- La lista concreta de los 150 idiomas no se detalla en la metadata de HuggingFace ni en la información proporcionada; el rendimiento por idioma es desconocido.
- No hay evaluación de sesgos publicada; como modelo de traducción, es esperable que reproduzca sesgos presentes en los corpus de entrenamiento, pero no hay datos que lo cuantifiquen.
- Riesgo de alucinación en traducción: aunque instTrans impone restricciones duras de terminología y formato, no se documenta ningún mecanismo que garantice la ausencia de contenido añadido o de omisiones.
- La model card recomienda decodificación greedy con temperatura 0 y `enable_thinking: false`; usar otros ajustes puede degradar la calidad y no está validado.
- El formato de prompt documentado está en chino, con marcadores como 【源文】, 【硬性要求】 y 【注意】; conviene respetarlo para aprovechar las capacidades de traducción restringida.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de atribución y de cualquier dependencia del modelo base.
- El repositorio ocupa 81,4 GB porque contiene todas las cuantizaciones; descargar el modelo completo no es necesario si solo se usa una variante.
- El modelo tiene 96 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía muy limitada.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/IndexTeam/Index-Nailong-9B-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Nailong-9B
- Informe técnico (arXiv): https://arxiv.org/abs/2609.40181
- Código: https://github.com/bilibili/Index-Translate
- Index-Homura-2B: https://huggingface.co/IndexTeam/Index-Homura-2B
- Index-Homura-9B: https://huggingface.co/IndexTeam/Index-Homura-9B
- llama.cpp (motor de conversión e inferencia): https://github.com/ggml-org/llama.cpp
- Página del equipo IndexTeam en HuggingFace: https://huggingface.co/IndexTeam
