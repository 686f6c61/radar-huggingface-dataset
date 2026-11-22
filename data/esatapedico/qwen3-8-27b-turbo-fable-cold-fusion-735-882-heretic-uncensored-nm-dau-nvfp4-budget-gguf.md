# esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-BUDGET-GGUF

## Resumen

Este repositorio aloja dos conversiones GGUF compactas de un fine-tune comunitario de Qwen3.8-27B, denominado TURBO Fable Cold Fusion 735/882 Heretic Uncensored, obra de DavidAU. El modelo base es un transformer denso de 26.895.998.720 parámetros (unos 27B) con arquitectura híbrida que combina Gated DeltaNet y Gated Attention, torre de visión nativa y una ventana de contexto nativa de 262.144 tokens. Sobre esa base se han aplicado fusiones de modelos (merge 735/882) y capas de DPO orientadas a eliminar restricciones de rechazo, de ahí la etiqueta "Heretic Uncensored".

La aportación concreta de este repositorio, publicado por el usuario esatapedico, es ofrecer dos variantes de cuantización de mínimo peso que conservan un backbone NVFP4 nativo de 448 tensores byte a byte idéntico al de la familia completa, pero con la cabeza MTP (multi-token prediction) eliminada y las cabezas de salida y embeddings degradadas a tipos muy agresivos (Q3_K/Q2_K). El objetivo declarado es que tarjetas Blackwell de 16 GB de VRAM puedan servir el modelo con kernels NVFP4 de llama.cpp.

La relevancia es doble: por un lado demuestra el estado del arte en cuantización nativa de 4 bits en formato NVFP4 para hardware consumer de nueva generación; por otro, ilustra los compromisos de calidad que se asumen al comprimir un modelo de 27B hasta 14,7 GB. No hay datos de benchmarks formales publicados, solo pruebas de humo del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet + Gated Attention), 64 capas, torre de visión nativa |
| Parametros totales | 26.895.998.720 (unos 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Backbone NVFP4 nativo (448 tensores, 13,69 GB) + cabezas en Q3_K/Q2_K (BUDGET) o Q2_K/Q2_K (STARVED); 1.107 tensores totales |
| Idiomas soportados | Inglés y multilingüe (según etiquetas del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector multimodal `mmproj-BF16.gguf` en BF16 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27B con 64 capas que alterna dos mecanismos de atención: Gated DeltaNet (una variante de atención lineal con estado recurrente) y Gated Attention clásica. Esta hibridación busca reducir el coste computacional y de memoria en contextos muy largos, lo que explica la ventana nativa de 262.144 tokens. Incorpora además una torre de visión, por lo que es multimodal entrada-imagen/texto. El fine-tune TURBO Fable Cold Fusion 735-882 aplica una fusión de modelos (merge con proporciones 735/882) y capas de DPO sobre Qwen3.8-27B, con el objetivo declarado de eliminar comportamientos de rechazo ("Heretic Uncensored").

La innovación técnica de este repositorio no está en el entrenamiento, sino en la conversión: se preserva un backbone NVFP4 nativo de 448 tensores (todas las capas de atención y MLP) verificado tensor a tensor mediante SHA-256, y se elimina la cabeza MTP (`qwen35.nextn_predict_layers=0`), de modo que el modelo carga en cualquier build de llama.cpp sin la ruta `draft-mtp`. Las cabezas de salida (`output.weight`) y de embeddings (`token_embd`) se fijan a Q3_K/Q2_K (BUDGET) o Q2_K/Q2_K (STARVED). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO más allá de la mención a DPO.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens).
- Razonamiento y matemáticas (heredado de la base Qwen3.8-27B, sin datos de benchmark publicados en este repo).
- Generación de código (capacidad esperable de la familia Qwen, no verificada con métricas en este repositorio).
- Visión multimodal: acepta imágenes si se carga el proyector `mmproj-BF16.gguf` mediante `--mmproj`.
- Modo thinking e instruct con presets de muestreo diferenciados (thinking: temp 1.0 / top_p 0.95 / top_k 20; instruct: temp 0.7 / top_p 0.80 / top_k 20).
- Multilingüe según etiquetas del autor, aunque el material de entrenamiento y las pruebas se centran en inglés.
- Sin tool calling ni function calling documentados en la model card.
- Sin soporte de decodificación especulativa MTP en estas variantes (cabeza eliminada deliberadamente).
- Comportamiento "uncensored": menor probabilidad de rechazo ante peticiones sensibles, por diseño del fine-tune.

## Casos de uso

- Asistente conversacional local en tarjeta Blackwell de 16 GB: el modelo cabe en una única GPU consumer gracias a los 14,72 GB del fichero BUDGET, permitiendo conversaciones multi-turno con contexto largo sin depender de la nube.
- Procesamiento de documentos extensos: la ventana de 262.144 tokens permite ingerir libros, expedientes o bases de código completas en una sola pasada, útil para resumen y extracción de información.
- Análisis de imágenes con texto asociado: cargando el proyector multimodal se pueden describir capturas, diagramas o documentos escaneados y generar informes combinados.
- Generación de texto creativo sin filtros: el ajuste "Heretic Uncensored" está pensado para escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas donde los modelos alineados rechazan la petición.
- Prototipado e investigación sobre cuantización NVFP4: el repositorio sirve como banco de pruebas para medir el impacto de cabezas Q2_K/Q3_K frente al backbone NVFP4 íntegro en tareas de generación.
- Despliegue en estaciones de trabajo con una sola GPU: mediante llama-server se puede exponer una API compatible con OpenAI para integrar el modelo en herramientas internas de análisis o chat.
- Evaluación comparativa de variantes de cuantización: los dos ficheros (BUDGET y STARVED) permiten medir la degradación de calidad al bajar de Q3_K a Q2_K en la cabeza de salida con el mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información disponible. El autor incluye únicamente pruebas de humo (smoke tests) declaradas como "naive, single run, not comparable across setups": una prueba de coherencia 2 de 2 con el prompt "What is a black hole?" y ejecuciones con carga sintética en inglés de unos 75 kB (28 fragmentos de 512 tokens) mediante llama.cpp y una pasarela LocalAI. No se aportan cifras de MMLU, HumanEval, GSM8K ni métricas de throughput o latencia concretas.

## Requisitos de hardware

- VRAM estimada: 14,72 GB para el fichero BUDGET y 14,59 GB para STARVED, más overhead de contexto KV cache; el autor lo plantea para tarjetas de 16 GB.
- GPU recomendadas: exclusivamente NVIDIA Blackwell con soporte `sm_120` y kernels NVFP4 (tipo GGML 40) en llama.cpp; no funciona en arquitecturas anteriores (Ampere, Ada) sin reconversión.
- Cabe en GPU consumer: sí, en Blackwell de 16 GB (por ejemplo, gama RTX 50xx de 16 GB); no cabe en GPUs de 8-12 GB.
- Proyector de visión: añade aproximadamente 1 GB si se carga `mmproj-BF16.gguf`; se puede omitir para modo solo texto y liberar ese margen.
- Opciones de despliegue: llama.cpp y llama-server (build reciente con soporte NVFP4 y `sm_120`); no se documenta compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BUDGET) | 27B denso | 262.144 | NVFP4 + Q3_K/Q2_K | Apache 2.0 | GGUF en Hugging Face |
| Repo hermano con MTP (`...NVFP4-GGUF`) | 27B denso | 262.144 | NVFP4 + cabeza MTP | Apache 2.0 | GGUF en Hugging Face |
| Modelo base `DavidAU/...-NM-DAU` | 27B denso | 262.144 | Pesos completos | No disponible | Hugging Face |
| `unsloth/Qwen3.8-27B-GGUF` | 27B denso | 262.144 | GGUF estándar (Q4, Q5, etc.) | No disponible | GGUF en Hugging Face |

La comparación con alternativas de otros fabricantes (Llama, Mistral, Gemma de tamaño similar) no está disponible en la información proporcionada, y no se han publicado métricas que permitan contrastar rendimiento.

## Limitaciones y advertencias

- Las cabezas de salida y embeddings en Q2_K/Q3_K degradan la calidad frente a cuantizaciones más altas; el propio autor reconoce "accuracy trade-offs" respecto a los niveles con MTP.
- La eliminación de la cabeza MTP impide usar decodificación especulativa, lo que reduce el throughput en comparación con las variantes completas de la familia.
- Dependencia estricta de hardware Blackwell (`sm_120`) y de builds recientes de llama.cpp con kernels NVFP4; no hay portabilidad a otras GPU sin reconversión.
- El ajuste "Heretic Uncensored" reduce los rechazos por diseño: riesgo elevado de generar contenido inapropiado, sesgado o dañino sin salvaguardas, lo que exige filtros externos en producción.
- Riesgo de alucinación inherente a los modelos de 27B, agravado por la cuantización agresiva de las cabezas.
- Idiomas: aunque se etiqueta como multilingüe, el material y las pruebas están en inglés; el rendimiento en castellano no está verificado.
- No hay documentación de tool calling ni de soporte para agentes multi-paso.
- La licencia Apache 2.0 se declara en el repositorio, pero el modelo base y los datos de entrenamiento podrían arrastrar condiciones adicionales no detalladas; conviene revisar la licencia del modelo original antes de uso comercial.
- El repositorio tiene muy poca tracción (611 descargas, 1 like) y no ha pasado por una validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-BUDGET-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repo hermano con MTP: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-GGUF
- Proyector de visión de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Sitio del autor: https://www.esatapedico.com
