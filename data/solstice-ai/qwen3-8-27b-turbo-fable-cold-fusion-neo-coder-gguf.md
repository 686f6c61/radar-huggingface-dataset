# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NEO-CODER-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NEO-CODER-GGUF es una suite de cuantizaciones GGUF publicada por Solstice-AI sobre el modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, que a su vez deriva de la arquitectura Qwen3.8 de Qwen/Alibaba Cloud. El paquete incluye los pesos cuantizados en Q4_K_M, Q5_K_M, Q6_K y Q8_0, un proyector visual multimodal independiente en BF16, y artefactos de decodificación especulativa (MTP y DSpark). El modelo tiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y está orientado a generación de código, tareas agénticas y evaluación tipo SWE-bench.

La propuesta de valor de esta release es la integración de controles de esfuerzo de razonamiento (`reasoning_effort` con valores `medium` y `xhigh`), tool calling determinista en XML y un proyector de visión BF16 de 0,87 GB, todo empaquetado en binarios listos para llama.cpp y Ollama. El contexto declarado en el ejemplo de arranque es de 131.072 tokens (`-c 131072`). La licencia es Apache 2.0 y los idiomas soportados son inglés y chino.

Es relevante ahora porque combina tres tendencias prácticas: modelos de código con razonamiento configurable, decodificación especulativa empaquetada de serie (el autor reporta hasta 1,8x de aceleración) y despliegue local en GGUF. Conviene señalar que los pesos han sido sometidos a un proceso de "abliteration" (eliminación de rechazos) por parte de DavidAU, lo que tiene implicaciones importantes para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con proyector visual independiente; arquitectura original Qwen3.8 |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 131.072 tokens (según ejemplo de arranque de la model card) |
| Tipos de cuantizacion | Q4_K_M (UD-Q4_K_XL), Q5_K_M, Q6_K, Q8_0; MTP Q4_K_M y Q8_0; proyector BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 26,9 mil millones de parámetros con capacidad multimodal: el paquete incluye un proyector de visión independiente (`mmproj-BF16.gguf`, 0,87 GB) en BF16, que se carga por separado en llama.cpp mediante el flag `--mmproj`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible. El modelo base de DavidAU incorpora modificaciones de "abliteration" (eliminación de comportamientos de rechazo) y ajustes orientados a código y prompting agéntico.

La innovación técnica destacable de esta release es el empaquetado de decodificación especulativa en dos variantes: Multi-Token Prediction (MTP), con modelos espejo en Q4_K_M (17,23 GB) y Q8_0 (28,16 GB), y un drafter DSpark de 1,03 GB (`speculative/Qwen3.8-27B-DSpark-Q4_K_M.gguf`) prealineado con el modelo principal. El autor reporta una aceleración de 1,8x con decodificación especulativa. Además, se incluyen controles de esfuerzo de razonamiento: `medium` suprime la inyección del system prompt por defecto para ejecución directa de código, y `xhigh` inyecta etiquetas de verificación de razonamiento profundo (`<thought>`). El tool calling está preconfigurado en un formato XML determinista: `<tool_call><function=...><parameter=...></function></tool_call>`.

## Capacidades

- Generación de texto y razonamiento con esfuerzo configurable (`medium` para ejecución directa, `xhigh` para razonamiento profundo con etiquetas `<thought>`).
- Generación y refactorización de código, con orientación explícita a tareas tipo SWE-bench.
- Razonamiento matemático y diseño algorítmico (la model card recomienda Q5_K_M y Q6_K para estos casos).
- Tool calling determinista en formato XML preconfigurado.
- Capacidades multimodales de imagen a texto mediante el proyector BF16 (`mmproj-BF16.gguf`).
- Decodificación especulativa con MTP y con drafter DSpark para acelerar la inferencia.
- Soporte multilingüe limitado a inglés y chino.
- Compatibilidad con endpoints y despliegue en llama.cpp y Ollama.
- Pesos sin censura ("uncensored" / "abliterated"), lo que implica ausencia de rechazos por defecto.

## Casos de uso

- **Generación de código en producción:** el modelo soporta tool calling XML determinista y puede integrarse en pipelines de CI/CD para generar parches, tests o refactorizaciones; la cuantización Q6_K (21,96 GB) es la recomendada por el autor para refactorización multiarchivo compleja.
- **Resolución de issues tipo SWE-bench:** con `reasoning_effort=medium` se suprime la inyección de system prompt y se obtiene ejecución directa de código, lo que encaja en flujos automatizados de resolución de incidencias sobre repositorios.
- **Asistente de código local en estación de trabajo:** la cuantización Q4_K_M (16,81 GB) es el equilibrio recomendado entre velocidad, huella de RAM y precisión, y puede ejecutarse con llama.cpp u Ollama en equipos con suficiente memoria unificada o VRAM.
- **Análisis de diagramas y capturas en flujos de desarrollo:** gracias al proyector visual BF16, el modelo puede procesar imágenes junto con texto, por ejemplo para interpretar diagramas de arquitectura o capturas de errores y proponer correcciones.
- **Diseño algorítmico y pruebas formales:** con `reasoning_effort=xhigh` el modelo inyecta etiquetas `<thought>` para verificación profunda, adecuado para problemas de algoritmia y demostraciones.
- **Servicio de inferencia de baja latencia:** el uso del drafter DSpark (1,03 GB) junto con el modelo principal permite decodificación especulativa con una aceleración reportada de 1,8x, útil en servidores con llama-server.
- **Despliegue de agentes multi-paso:** el formato de tool calling XML y el contexto de 131.072 tokens permiten mantener conversaciones agénticas largas con múltiples llamadas a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona compatibilidad con SWE-bench y el tag `swe-bench`, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni SWE-bench. El único dato de rendimiento declarado es la aceleración de 1,8x con decodificación especulativa.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia:** Q4_K_M requiere aproximadamente 16,81 GB de pesos; Q5_K_M, 19,31 GB; Q6_K, 21,96 GB; Q8_0, 27,74 GB. A esto hay que sumar el proyector visual (0,87 GB) si se usa multimodalidad y el espacio para el contexto KV cache (hasta 131.072 tokens, lo que incrementa sustancialmente la memoria necesaria).
- **GPU recomendadas:** no disponibles en la información proporcionada. Por tamaño, Q4_K_M y Q5_K_M caben en GPUs de 24 GB (RTX 4090, A10G, L4 de 24 GB) si se limita el contexto; Q8_0 requiere 32 GB o más (A100 40 GB, H100, RTX 5090 si dispone de 32 GB).
- **Consumer GPU:** Q4_K_M es viable en GPUs de 24 GB con contexto moderado; Q5_K_M y Q6_K también caben en 24 GB pero con menos margen para el KV cache. Para contexto completo de 131.072 tokens se necesita memoria muy superior o técnicas de offload a RAM.
- **Opciones de despliegue:** llama.cpp (`llama-server`, `llama-cli`), Ollama (tag `ollama`), y endpoints compatibles (tag `endpoints_compatible`). No se menciona soporte explícito de vLLM o TGI para el formato GGUF.
- **Latencia y throughput:** no disponibles salvo la aceleración de 1,8x reportada con decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO NEO-CODER (este) | 26,9 B | 131.072 | Apache 2.0 | GGUF | Multimodal, MTP/DSpark, sin censura |
| Modelo base DavidAU (Heretic Uncensored NM-DAU) | no disponible | no disponible | no disponible | safetensors | Base sin cuantizar del que deriva |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (mismo tamaño o misma tarea) sin inventar datos.

## Limitaciones y advertencias

- **Pesos sin censura:** el modelo base ha sido sometido a "abliteration", lo que elimina los mecanismos de rechazo. No es adecuado para aplicaciones de cara al público sin filtros adicionales y puede generar contenido dañino o inapropiado.
- **Riesgo de alucinación:** inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad. El modo `xhigh` con etiquetas `<thought>` no garantiza corrección factual.
- **Idiomas:** solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni evaluado.
- **Licencia:** Apache 2.0 permite uso comercial, pero el proceso de abliteration y la procedencia de los pesos base (cadena de derivación desde Qwen3.8) deben revisarse para cumplimiento en producción.
- **Contexto:** los 131.072 tokens son el máximo declarado en el ejemplo de arranque; el uso real depende de la memoria disponible para el KV cache y de la cuantización elegida.
- **Formato GGUF:** orientado a llama.cpp/Ollama; no hay soporte declarado para vLLM o TGI, lo que limita el despliegue en infraestructuras de servido de alto rendimiento.
- **Datos incompletos:** no se detallan tokens de entrenamiento, composición del dataset ni metodología de alineación, lo que dificulta evaluar sesgos y calidad.
- **Repo de 190,1 GB:** el tamaño total del repositorio implica una descarga considerable; conviene descargar solo los archivos necesarios.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NEO-CODER-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Organización Qwen/Alibaba Cloud: https://huggingface.co/Qwen
- Perfil del autor de los pesos base: https://huggingface.co/DavidAU
- Perfil de Solstice-AI: https://huggingface.co/Solstice-AI
- Banner de la model card: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
