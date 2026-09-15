# IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-GGUF

## Resumen

Nex-N2.5-mini APEX-I-MiniPlus es una cuantización GGUF de elaboración manual del modelo multimodal nex-agi/Nex-N2.5-mini, publicada por el usuario IsValorum. El modelo base se describe como una arquitectura Qwen3.5-MoE de 35.100 millones de parámetros con capacidades multimodales (imagen-texto) y orientación agéntica, incluyendo computer-use. Esta ficha corresponde exclusivamente al artefacto cuantizado, no al modelo original: el repositorio contiene los pesos GGUF listos para llama.cpp y el proyector de visión.

El problema que resuelve es el de la huella de memoria. Las cuantizaciones de 3 bits generadas automáticamente por herramientas de conversión en lote ocupan alrededor de 15,6 GiB solo en pesos y, sumando buffers de cómputo y caché KV, superan los 22,5 GiB, lo que provoca errores de memoria insuficiente (OOM) en GPU de 24 GB. Esta versión reduce los pesos a 13,56 GiB (14,56 GB, 3,36 bits por peso) mediante asignación de precisión por tensor, calibrada con una matriz de importancia empírica (imatrix), lo que permite ejecutar la ventana de contexto nativa completa de 262.144 tokens en unos 19,24 GiB de VRAM totales.

Es relevante ahora porque demuestra un patrón de cuantización selectiva (protección de las capas de entrada y salida, compresión agresiva solo de los expertos enrutados intermedios) aplicado a un MoE multimodal de ~35B, con licencia Apache-2.0 y 31 idiomas declarados. El repositorio es de adopción muy baja (8 descargas, 2 "me gusta" en el momento de la consulta), por lo que sus cifras de rendimiento proceden únicamente del autor y no cuentan con validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) de tipo transformer, multimodal imagen-texto; etiquetada por el autor como "Qwen3.5-MoE 35.1B" |
| Parámetros totales | 34.660.610.688 (~34,66B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) nativos |
| Tipos de cuantización | Cuantización personalizada APEX-I-MiniPlus a 3,36 bits por peso (13,56 GiB); capas 0-9 y 30-39 en Q3_K; capas 10-29 (expertos enrutados) en IQ3_XXS con imatrix; `output.weight` en Q6_K; proyector de visión aparte en Q8_0. Otras variantes de cuantización: no disponibles en este repositorio |
| Idiomas soportados | 31: en, es, fr, de, pt, it, ru, ja, ko, vi, th, ar, id, nl, tr, pl, sv, cs, hi, he, fa, ms, ro, hu, uk, el, tl, da, fi, no, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); dos ficheros: `Nex-N2.5-mini.APEX-I-MiniPlus.gguf` (14,56 GB) y `mmproj-nex-agi_Nex-N2.5-mini-Q8_0.gguf` (610 MB) |
| Vocabulario | 248.000 tokens (según el autor) |
| Número de capas | 40 |
| Tamaño del repositorio | 15,2 GB |
| Modelo base | nex-agi/Nex-N2.5-mini (relación: quantized) |
| Etiquetas declaradas | gguf, apex, custom-quantization, unsloth-studio, moe, multimodal, vision, agentic, computer-use, llama.cpp, qwen35moe, imatrix, conversational |

## Arquitectura y entrenamiento

Este repositorio no contiene información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO). Lo que sí detalla el autor es la política de cuantización aplicada: sobre las 40 capas del MoE, las capas 0-9 y 30-39 se mantienen en Q3_K (consideradas "fronteras semánticas" de ingesta de prompt y síntesis final), mientras que las capas 10-29, correspondientes a los expertos enrutados internos, se comprimen a IQ3_XXS (3,06 bits por peso) usando una matriz de importancia empírica. La cabeza de salida `output.weight` se fija en Q6_K para evitar la deriva de vocabulario sobre un espacio de 248.000 tokens, problema que el autor atribuye a las conversiones automáticas que aplanan las cabezas a 3 bits.

El componente multimodal se sirve mediante un proyector de visión separado, cuantizado a Q8_0 (610 MB) en lugar de dejarlo en FP16 (~900 MB), con el objetivo de mantener el anclaje visual y las capacidades de computer-use con menor consumo de VRAM. No se documentan innovaciones de atención (atención lineal, decodificación especulativa) ni detalles del preentrenamiento; la única innovación descrita es la metodología de cuantización por tensor con calibración imatrix, denominada APEX-I-MiniPlus.

## Capacidades

- Generación de texto conversacional multi-turno, con 262.144 tokens de contexto nativo.
- Razonamiento y flujo agéntico de varios pasos (el autor lo etiqueta como "agentic reasoning").
- Entrada de imágenes mediante el proyector Q8_0 incluido: pipeline declarado `image-text-to-text`.
- Uso de ordenador (computer-use) según las etiquetas del repositorio, es decir, interacción con interfaces gráficas a partir de capturas.
- Soporte multilingüe declarado en 31 idiomas, con especial presencia de lenguas europeas, asiáticas y de Oriente Medio.
- Integración con llama.cpp, lo que habilita gramáticas, plantillas de chat y muestreo configurable.
- No se documenta explícitamente soporte de tool calling o function calling en la información disponible, aunque las etiquetas "agentic" y "computer-use" lo sugieren; debe verificarse en la práctica.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Automatización de agentes con contexto largo: con 256K tokens en VRAM en una GPU de 24 GB, se puede mantener un historial de trabajo extenso (código, logs, documentación) sin truncar ni recurrir a recuperación externa, útil en asistentes de ingeniería que iteran sobre un repositorio completo.
- Computer-use y RPA asistido: el modelo acepta capturas de pantalla y puede integrarse en bucles de automatización de interfaz gráfica (rellenar formularios, navegar menús) allí donde no existe API; el proyector Q8_0 reduce el coste de VRAM por imagen.
- Análisis documental con imágenes: extracción y resumen de información a partir de PDF escaneados, facturas o diagramas técnicos combinados con texto, aprovechando el pipeline imagen-texto y el contexto largo para procesar lotes grandes en una sola pasada.
- Despliegue local en portátil con GPU modesta: con 3,8 GB de VRAM en modo offload híbrido (RTX 3050/4050 + 32 GB DDR4) el autor reporta 23-26 tok/s de generación, lo que permite prototipado y uso personal sin depender de la nube.
- Soporte multilingüe en atención al cliente: con 31 idiomas declarados, un mismo modelo puede atender conversaciones en español, inglés, francés, alemán, árabe o japonés sin enrutar a modelos distintos, simplificando la infraestructura.
- Copiloto de razonamiento sobre bases de código medianas: la ventana completa de 256K permite cargar varios ficheros y el historial de cambios, y el modo agéntico facilita tareas de refactorización guiada por pruebas.
- Procesamiento por lotes en servidor con vLLM: el autor menciona compatibilidad con vLLM además de llama.cpp, lo que permite servir el modelo con prefill agregado (batching) para cargas de resumen o clasificación a gran escala.
- Prototipado de investigación en multimodalidad: al ser Apache-2.0 y GGUF, sirve para experimentar con cuantización agresiva de MoE multimodales sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente proporciona mediciones de velocidad de inferencia, reproducidas a continuación tal cual, sin verificación independiente:

| Equipo | Modo de offload | Generación | Prefill de prompt | Codificación de imagen |
|---|---|---|---|---|
| RTX 4090 (24 GB GDDR6X) | GPU completa (`-ngl 99`) | 85-110+ tok/s | 1.800-2.600+ tok/s | <0,15 s por imagen de alta resolución |
| RTX 3090 (24 GB GDDR6) | GPU completa (`-ngl 99`) | 70-85+ tok/s | 1.400-1.900+ tok/s | <0,22 s por imagen de alta resolución |
| Portátil con RTX 3050/4050 + 32 GB DDR4 | Híbrido (3,8 GB VRAM) | 23-26+ tok/s | 300-410 tok/s | Proyector Q8_0 |

## Requisitos de hardware

- Pesos del modelo: 13,56 GiB (14,56 GB) en la cuantización APEX-I-MiniPlus; el proyector de visión Q8_0 añade 610 MB.
- VRAM total estimada según contexto (caché KV en q8_0 con 4 slots), cifras del autor: 32K → 15,92 GiB; 64K → 16,39 GiB; 128K → 17,31 GiB; 192K → 18,24 GiB; 256K completo → 19,24 GiB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para offload completo con contexto de 256K; en GPUs de 16 GB el autor indica que caben 38 de las 40 capas en contexto de 32K; en portátiles con 4-6 GB se plantea offload híbrido con ~3,8 GB en VRAM.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con ventana completa; en tarjetas de 16 GB con offload parcial y contexto reducido; no se documentan pruebas en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp (referencia explícita, con `-ngl 99` para offload total), Unsloth Studio (entorno usado por el autor en sus pruebas) y vLLM (mencionado). También sería compatible con frontends basados en llama.cpp como Ollama o LM Studio, aunque no se mencionan explícitamente; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: ver tabla de la sección anterior. La codificación visual se sitúa por debajo de 0,15 s por imagen en RTX 4090 y 0,22 s en RTX 3090 según el autor.

## Comparativa con modelos similares

Los únicos términos de comparación disponibles son los que aporta el propio autor en la model card. No se dispone de datos verificables sobre otras alternativas de la misma categoría (MoE multimodal de ~35B), por lo que la comparación se limita a lo siguiente:

| Alternativa | Pesos | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Nex-N2.5-mini APEX-I-MiniPlus (este repositorio) | 13,56 GiB, 3,36 bpw | 256K nativos en VRAM (19,24 GiB totales) | Apache-2.0 | Cuantización por tensor con imatrix; proyector de visión Q8_0 incluido |
| Nex-N2.5-mini base (nex-agi/Nex-N2.5-mini) | no disponible (pesos originales) | no disponible | no disponible (el repositorio derivado declara Apache-2.0) | Referencia de máxima fidelidad; requiere mucha más VRAM |
| Cuantizaciones 3-bit genéricas de la comunidad (`IQ3_S`, `Q3_K_S`) | ~15,6 GiB solo en pesos; >22,5 GiB con buffers y contexto | Requiere recortar contexto en GPU de 24 GB | Depende del publicador | Según el autor, aplanan la cabeza de salida y omiten el proyector de visión |

No se dispone de comparativas con otros modelos (por ejemplo, familias MoE de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados: todas las cifras de velocidad y de consumo de VRAM provienen del autor y no han sido replicadas por terceros.
- Adopción muy baja (8 descargas y 2 "me gusta" en el momento de la consulta) y fecha de creación reciente (2026-09-15), lo que implica ausencia de validación comunitaria y de informes de errores.
- La cuantización a 3,36 bpw con capas de expertos en IQ3_XXS degrada inevitablemente la calidad frente a los pesos originales, aunque el autor sostiene que la pérdida se concentra en los expertos enrutados y no en las capas de prompt o de síntesis; no se aportan métricas que lo demuestren.
- La calibración imatrix depende del corpus usado para calcularla; no se documenta dicho corpus, por lo que puede haber sesgo hacia los dominios cubiertos (por ejemplo, código o inglés) en detrimento de otros idiomas declarados.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por el contexto muy largo: con 256K tokens, el contenido inicial de la ventana puede perderse y aumentar la fabricación de detalles.
- El autor advierte de una posible deriva de vocabulario en cuantizaciones automáticas; en esta versión se mitiga con Q6_K en `output.weight`, pero persiste el riesgo de fallos en el formateo estructurado y en la emisión de tokens de herramientas.
- Las capacidades de computer-use implican riesgo operativo: acciones sobre interfaces reales pueden ser irreversibles si no se añaden salvaguardas y confirmaciones humanas.
- Las 31 lenguas declaradas proceden de las etiquetas del repositorio; no hay evaluación por idioma, y es esperable un rendimiento muy desigual, especialmente en lenguas con pocos datos (tl, el, he, fa).
- Licencia Apache-2.0 en el artefacto derivado, pero conviene verificar la licencia del modelo base nex-agi/Nex-N2.5-mini antes de uso comercial, ya que la model card de este repositorio no la reproduce.
- El etiquetado "Qwen3.5-MoE" no se corresponde con una familia pública conocida con ese nombre en la información disponible; no se puede confirmar la procedencia arquitectónica exacta ni los parámetros activos.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Ficheros incluidos: `Nex-N2.5-mini.APEX-I-MiniPlus.gguf` y `mmproj-nex-agi_Nex-N2.5-mini-Q8_0.gguf` (disponibles en la pestaña de archivos del repositorio)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo (los resultados devueltos correspondían a servicios de correo electrónico y no guardan relación con el tema)
