# muhamad-geosurge/invert-polarity-12749b4b-58f3-49a1-b1bd-bda8a6b08515

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo multimodal google/gemma-4-E4B, publicado por el usuario muhamad-geosurge bajo el identificador invert-polarity-12749b4b-58f3-49a1-b1bd-bda8a6b08515. Se trata de un modelo denso de la familia Gemma 4 de Google DeepMind, con 7.518.082.346 parámetros reales en safetensors (4,5B efectivos, 8B contando las tablas de embeddings, según la documentación de la familia), orientado a generación de texto y a tareas any-to-any con entrada de texto, imagen y audio, y salida de texto.

El modelo base E4B emplea una arquitectura de atención híbrida que intercala atención de ventana deslizante local (512 tokens) con atención global completa, garantizando que la última capa sea siempre global, y aplica Proportional RoPE (p-RoPE) junto con claves y valores unificados en las capas globales para reducir el consumo de memoria en contextos largos. Incorpora también Per-Layer Embeddings (PLE) para maximizar la eficiencia paramétrica en despliegues en dispositivo, una ventana de contexto de 128K tokens, un vocabulario de 262K entradas, soporte de más de 140 idiomas y modos de razonamiento configurables con soporte nativo del rol `system`.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no documenta el procedimiento de ajuste, el dataset utilizado ni ninguna evaluación propia, y su model card reproduce prácticamente sin cambios la tarjeta de la familia Gemma 4. Con 0 descargas y 0 likes, y sin resultados de benchmarks publicados, se trata de un artefacto de investigación sin validación independiente. Aun así, resulta interesante como ejemplo de fine-tune multimodal de tamaño medio (7,5B reales) que cabe en GPU de consumo con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con atención híbrida (ventana deslizante local + atención global) y Per-Layer Embeddings (PLE); modelo base gemma4_text |
| Parametros totales | 7.518.082.346 (7,52B) segun safetensors; el modelo base declara 4,5B efectivos y 8B con embeddings |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128K tokens (modelos pequenos de la familia Gemma 4) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan versiones GGUF, AWQ o GPTQ) |
| Idiomas soportados | mas de 140 idiomas segun la model card de la familia Gemma 4; los metadatos de HuggingFace indican "no disponibles" |
| Licencia | apache-2.0 segun metadatos y model card; la model card enlaza ademas la licencia especifica de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors |
| Biblioteca | transformers |
| Pipeline declarado | any-to-any (etiqueta secundaria: text-generation) |
| Modelo base | google/gemma-4-E4B (fine-tune) |
| Tamano del repositorio | 15,1 GB |
| Fecha de creacion | 2026-10-01 |
| Fecha de actualizacion | 2026-10-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base E4B es un transformer decoder-only con un mecanismo de atención híbrido: la mayoría de capas usa atención local de ventana deslizante de 512 tokens y unas pocas capas (incluida siempre la final) aplican atención global completa. Las capas globales unifican claves y valores y aplican Proportional RoPE (p-RoPE), lo que reduce el coste de memoria del caché KV en contextos largos. El modelo incorpora Per-Layer Embeddings (PLE): cada capa decodificadora dispone de una pequeña tabla de embeddings propia por token, de modo que el recuento efectivo de parámetros (4,5B) es muy inferior al total (8B con embeddings). El componente multimodal se resuelve con codificadores dedicados: aproximadamente 150M de parámetros para visión y 300M para audio en la variante E4B. El vocabulario es de 262K entradas y el modelo declara modos de razonamiento configurables, soporte nativo del rol `system` y function calling.

Respecto al entrenamiento de este repositorio concreto, no hay información disponible: la model card no describe el dataset, el número de tokens, la composición de los datos ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. No se indica qué significa exactamente "invert-polarity" en el nombre del repositorio ni qué comportamiento pretende inducir el ajuste. Tampoco se documentan hiperparámetros, precisión de entrenamiento ni si se congelaron los codificadores multimodales. Todo lo relativo al proceso de fine-tune debe considerarse no documentado.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes), heredados del modelo base Gemma 4.
- Comprensión multimodal de entrada: texto e imagen con soporte de relación de aspecto y resolución variables; audio en las variantes E2B, E4B y 12B (el E4B sí lo soporta).
- Capacidades de codificación y matemáticas mejoradas respecto a generaciones anteriores de Gemma, según la documentación de la familia.
- Soporte nativo de function calling / tool calling, orientado a flujos agénticos.
- Soporte de agentes y razonamiento multi-paso mediante llamadas a herramientas y modo de pensamiento.
- Soporte multilingüe en más de 140 idiomas según la model card de la familia.
- Soporte nativo del rol `system` en la plantilla de conversación, lo que permite un control más estructurado del comportamiento.
- Salida limitada a texto; pese a la etiqueta `any-to-any`, la model card indica explícitamente que la generación es solo de texto.
- No se documentan capacidades específicas añadidas por este fine-tune ni comportamientos diferenciales respecto al modelo base.

## Casos de uso

- Asistente conversacional multi-turno con contexto largo: los 128K tokens de ventana permiten mantener hilos extensos de conversación, documentación de referencia o histórico de tickets sin truncar, con el rol `system` fijando políticas de estilo y tono.
- Extracción de información de documentos con imágenes: al aceptar entrada de imagen y texto, puede procesar capturas de pantalla, diagramas o formularios escaneados y devolver campos estructurados en texto.
- Transcripción y resumen de audio: la variante E4B incorpora codificador de audio (~300M de parámetros), por lo que puede resumir reuniones o generar actas a partir de clips de audio junto con notas textuales.
- Automatización agéntica con herramientas: el soporte nativo de function calling permite construir agentes que consulten APIs, bases de datos o servicios internos y encadenen varias llamadas en un mismo flujo.
- Asistencia a la programación en local: con 7,5B parámetros reales y cuantización int4 puede ejecutarse en portátiles y estaciones de trabajo, sirviendo como autocompletado, explicación de código o generación de tests sin enviar código a servicios externos.
- Atención al cliente multilingüe: el soporte declarado de más de 140 idiomas permite desplegar un único modelo para varias regiones, con contexto largo para arrastrar el historial completo del cliente.
- Búsqueda y respuesta sobre corpus internos (RAG): el contexto de 128K tokens admite insertar varios fragmentos recuperados y mantener coherencia en la respuesta final.
- Fine-tune específico de dominio sobre una base multimodal: al ser un ajuste de un modelo abierto con licencia permisiva, sirve como punto de partida para verticalizar tareas de clasificación, resumen o extracción sobre datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio reproduce la información general de la familia Gemma 4 (tamaños, arquitectura, modalidades y ventana de contexto), pero no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, ni para el modelo base ni para este fine-tune. Tampoco hay comparaciones numéricas con modelos similares en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15 GB solo para los pesos (7,52B parámetros), más el caché KV y los codificadores de visión (~150M) y audio (~300M). Con contexto de 128K el caché KV crece de forma significativa, aunque el uso de atención híbrida con p-RoPE y claves/valores unificados en capas globales lo mitiga.
- VRAM estimada con cuantización int8: en torno a 8 GB para los pesos.
- VRAM estimada con cuantización int4: en torno a 4-5 GB para los pesos, aunque la cuantización no está publicada por el autor y requeriría generar los pesos uno mismo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para bf16 con contexto largo sin compromisos; RTX 4090 / RTX 3090 (24 GB) para bf16 con contexto moderado; RTX 4080 (16 GB) o RTX 4060 Ti (16 GB) para int8 con contexto reducido.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con cuantización, y en 24 GB en bf16 con contexto limitado. Es un modelo diseñado explícitamente para ejecución en portátil y dispositivo dentro de la familia Gemma 4.
- Opciones de despliegue: transformers (biblioteca declarada por el autor), Text Generation Inference (TGI), vLLM mediante soporte de la arquitectura gemma4_text, y llama.cpp / Ollama tras convertir los pesos a GGUF (no hay GGUF publicado). La etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints. También se ha detectado una entrada del modelo en FriendliAI para despliegue con API de baja latencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| invert-polarity-12749b4b (este modelo) | 7,52B reales (4,5B efectivos, 8B con embeddings) | no aplica | 128K | Texto, imagen, audio de entrada; texto de salida | apache-2.0 (con enlace a licencia Gemma 4) | HuggingFace, 0 descargas, sin evaluaciones |
| google/gemma-4-E4B (base) | 4,5B efectivos / 8B con embeddings | no aplica | 128K | Texto, imagen, audio de entrada; texto de salida | licencia Gemma 4 | HuggingFace, repositorio oficial de Google DeepMind |
| Gemma 4 12B Unified | 11,95B | no aplica | 256K | Texto, imagen, audio (arquitectura sin codificadores) | licencia Gemma 4 | HuggingFace |
| Gemma 4 26B A4B (MoE) | 25,2B | 3,8B | 256K | Texto, imagen | licencia Gemma 4 | HuggingFace |
| Gemma 4 31B Dense | 30,7B | no aplica | 256K | Texto, imagen | licencia Gemma 4 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada. Las diferencias recogidas en la tabla proceden de la documentación de la familia Gemma 4 incluida en la model card del repositorio. Fuera de la familia Gemma 4 no se han identificado en la búsqueda alternativas comparables con datos verificables para este fine-tune concreto.

## Limitaciones y advertencias

- No existe documentación del proceso de fine-tune: se desconoce el dataset, el objetivo del ajuste y si el nombre "invert-polarity" implica un comportamiento específico que pueda degradar capacidades del modelo base.
- No hay evaluaciones publicadas ni benchmarks que permitan verificar que el fine-tune mantiene el rendimiento del modelo base; el riesgo de regresión en razonamiento, código o capacidades multilingües es real.
- Riesgo de alucinación propio de los modelos generativos, agravado por la ausencia de evaluaciones de fidelidad y del modo de razonamiento utilizado en la práctica.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, toxicidad o sesgo de representación lingüística.
- Limitaciones de idioma: se declaran más de 140 idiomas, pero no hay métricas por idioma ni confirmación de que el fine-tune conserve el soporte multilingüe del modelo base.
- Limitaciones de contexto: aunque la ventana declarada es de 128K tokens, no se han publicado pruebas de recuperación de información en posiciones intermedias o finales (long-context retrieval).
- Ambigüedad de licencia: los metadatos y la model card declaran apache-2.0, pero la propia model card enlaza la licencia de Gemma 4, que históricamente incorpora condiciones de uso adicionales. Antes de un uso comercial conviene verificar qué licencia prevalece, ya que un apache-2.0 mal aplicado sobre pesos derivados de Gemma puede generar problemas legales.
- Ausencia de versiones cuantizadas oficiales: para desplegar en hardware modesto hay que generarlas uno mismo, con el riesgo de pérdida de calidad que ello implica.
- Etiqueta de pipeline inconsistente: el repositorio se marca como `any-to-any`, pero la generación es únicamente de texto; conviene no esperar salidas de imagen o audio.
- Higiene de la model card: reproduce la tarjeta del modelo base sin adaptarla, lo que puede inducir a confusión sobre el alcance real del fine-tune.
- Repositorio sin tracción: 0 descargas y 0 likes en la fecha de los metadatos, sin comunidad que haya validado su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhamad-geosurge/invert-polarity-12749b4b-58f3-49a1-b1bd-bda8a6b08515
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Informe técnico citado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Colección Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de la familia Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- Despliegue alternativo detectado en FriendliAI: https://friendli.ai/models/muhamad-geosurge/invert-polarity-f9d6b8c5-1e7c-47db-8283-2cf3424e1b59
- Otros repositorios del mismo autor sobre Mistral-7B-Instruct-v0.3: https://huggingface.co/muhamad-geosurge/invert-polarity-5b8db1fc-fd11-4ebd-ad41-d520f450386b y https://huggingface.co/muhamad-geosurge/invert-polarity-63087573-3b1c-4d66-925b-994425ab7477
- Plataforma geoSurge (posible contexto del autor): https://web.geosurge.ai/
