# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised-DSpark

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored (GGUF UltraOptimised) es una cuantizacion GGUF publicada por Solstice-AI sobre el modelo base de DavidAU, a su vez derivado de la familia Qwen 3.8 de 27B. El modelo combina un proceso de merge GAIN (Generative Adversarial Intelligence Network, segun la model card), una variante "abliterated" orientada a eliminar el rechazo de peticiones y un conjunto de optimizaciones de inferencia: decodificacion especulativa mediante un drafter DSpark de 1,86B parametros y Multi-Token Prediction (MTP) integrado en los propios checkpoints.

El repositorio pesa 427,2 GB e incluye cuantizaciones Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL e IQ4_XS, ademas de un proyector multimodal `mmproj-BF16.gguf` para entrada image-text-to-text. El modelo declara 26.895.998.464 parametros totales y una ventana de contexto nativa de 262.144 tokens (262K), con licencia Apache 2.0 e idiomas declarados ingles y chino.

La relevancia del lanzamiento esta en su empaquetado para `llama.cpp` y Ollama con aceleracion especulativa lista para usar, y en las cifras de benchmark que el autor declara frente a Claude Opus 4.6 Max (9 victorias en 9 pruebas). Conviene tratar estas cifras con cautela: proceden de la model card del autor y no de una evaluacion independiente, y la nomenclatura del modelo (Qwen 3.8, Claude Opus 4.6) no se corresponde con versiones publicas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (Gated Delta Recurrent Network) en el 75% de las capas y atencion global Grouped-Query en el 25% restante |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (262K) nativos |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS; drafter DSpark en Q8_0 y Q4_K_M |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con `mmproj-BF16.gguf` para vision); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido: el 75% de las capas emplean bloques de atencion lineal Gated Delta Recurrent Network (GDN) con complejidad de memoria O(1) por forward pass, mientras que el 25% restante usa atencion global Grouped-Query. Esta combinacion busca sostener contextos de 262K tokens sin el coste cuadratico completo de un transformer denso. El modelo es multimodal: el pipeline declarado es image-text-to-text y se distribuye un proyector espacial-temporal BF16 (`mmproj-BF16.gguf`) para diagramas, capturas de interfaz y fotogramas de video.

El entrenamiento original corresponde a DavidAU (merge GAIN sobre una base Qwen 3.8 de 27B, con posterior proceso "heretic"/abliteration); Solstice-AI solo realiza la cuantizacion, la integracion de MTP y el empaquetado. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El dataset referenciado es `Solstice-AI/Solace-1.0-Omni`. Las innovaciones tecnicas destacadas son dos: un drafter especulativo DSpark de 1,86B parametros entrenado con SpecForge, con cinco capas auxiliares de captura de caracteristicas (5, 19, 33, 47, 61) y una cabeza de confianza VanillaMarkov de rango 256, que promete aceleraciones de decodificacion de 2,5x a 3,1x; y checkpoints con MTP de doble flujo integrado en la estructura del modelo.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 262K tokens.
- Razonamiento con cadena de pensamiento (etiquetas cot/reasoning en el repositorio).
- Generacion y depuracion de codigo, con enfasis declarado en ingenieria de software agentica (SWE-bench Pro, LiveCodeBench, QwenSWEBench).
- Vision multimodal: interpretacion de diagramas, capturas de pantalla de interfaz y fotogramas temporales de video mediante `mmproj-BF16.gguf`.
- Control de entorno de escritorio y movil (OSWorld-Verified, AndroidWorld segun la model card).
- Seguimiento de restricciones complejas e instrucciones largas (IFBench).
- Flujos multi-archivo de largo horizonte (CoWorkBench).
- Decodificacion especulativa mediante drafter DSpark o MTP integrado.
- Modelo "uncensored"/abliterated: no aplica rechazo por defecto ante peticiones sensibles.
- Idiomas: ingles y chino; no se declara soporte de castellano.
- Tool calling / function calling: no se documenta explicitamente en la informacion disponible.

## Casos de uso

- Ingenieria de software agentica: el modelo declara 61,7% en SWE-bench Pro y 79,0% en QwenSWEBench, por lo que encaja en pipelines que resuelven issues de repositorios completos, generan parches y ejecutan pruebas en bucle. El contexto de 262K permite cargar varios ficheros y el historial de fallos en una sola ventana.
- Automatizacion de control de escritorio: con 84,3% declarado en OSWorld-Verified, sirve para agentes que interpretan capturas de pantalla y emiten acciones sobre aplicaciones de escritorio, usando el proyector de vision para leer la interfaz.
- Automatizacion de dispositivos Android: 81,9% declarado en AndroidWorld lo hace apto para agentes de pruebas de aceptacion sobre emuladores o dispositivos reales, navegando menus y verificando estados visuales.
- Asistente de codigo en local con Ollama o llama.cpp: las cuantizaciones Q4_K_M e IQ4_XS permiten desplegar un modelo de 27B en una unica GPU de consumo, con el drafter DSpark para recuperar velocidad de decodificacion (2,5x-3,1x declarado).
- Procesamiento de documentacion tecnica multimodal: extraccion de informacion de diagramas de arquitectura, capturas de paneles de monitorizacion y fotogramas de video de incidencias, combinando el proyector BF16 con la ventana larga para mantener el contexto de un incidente completo.
- Seguimiento estricto de especificaciones: con 79,5% declarado en IFBench, es util en generacion de configuraciones, plantillas o respuestas sujetas a un esquema rigido donde el incumplimiento de restricciones es costoso.
- Analisis de repositorios extensos: la ventana de 262K permite auditar modulos completos, trazar dependencias entre ficheros y producir informes de refactorizacion en una sola pasada.
- Generacion de contenido sin filtros editoriales: la variante abliterated evita rechazos en dominios creativos o de investigacion donde los modelos alineados bloquean peticiones legitimas.

## Benchmarks y rendimiento

Cifras declaradas por el autor en la model card, obtenidas con el arnes de evaluacion de Claude Code a 256-262K de contexto, temperatura 1,0 y top_p 0,95. No proceden de una evaluacion independiente.

| Suite | Enfoque | Modelo (Solstice-AI x DavidAU) | Claude Opus 4.6 Max (declarado) | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingenieria de software agentica | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | Resolucion de problemas en tiempo real | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | Depuracion de repositorio completo | 79,0% | 63,8% | +15,2% |
| OSWorld-Verified | Control de sistema operativo | 84,3% | 72,7% | +11,6% |
| AndroidWorld | Autonomia en SO movil | 81,9% | 62,0% | +19,9% |
| IFBench | Seguimiento de restricciones complejas | 79,5% | 62,5% | +17,0% |
| CoWorkBench | Flujos multi-archivo de largo horizonte | 70,7% | 68,2% | +2,5% |
| ARC-C (Challenge) | Abstraccion cientifica de frontera | 735 (8 bits) / 719 (4 bits) | ~710-720 | Nivel frontera |
| ARC-E (Easy) | Razonamiento de sentido comun basico | 882 | ~870 | Por encima de frontera cerrada |

No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q8_0, aproximadamente 28-30 GB para los pesos mas overhead de contexto; en Q6_K, unos 22-24 GB; en Q5_K_M, unos 19-21 GB; en Q4_K_M, unos 16-18 GB; en IQ4_XS, unos 14-16 GB. Son estimaciones a partir de los 26,9B parametros; el repositorio no publica cifras de VRAM.
- La ventana de 262K consume KV cache adicional considerable; con atencion lineal en el 75% de capas el crecimiento es menor, pero sigue siendo significativo en contextos muy largos.
- GPU recomendadas: A100 80GB o H100 80GB para Q8_0 con contexto largo; RTX 4090 24GB para Q4_K_M con contexto moderado; RTX 3090 24GB para Q4_K_M o IQ4_XS.
- Cabe en GPU de consumo: si, en Q4_K_M e IQ4_XS con 16-24 GB de VRAM. Las cuantizaciones Q8_0 y Q6_K requieren GPU profesional o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, Anvil Runtime (TurboQuant) segun el autor. vLLM y TGI no se mencionan en la informacion disponible; el formato GGUF limita el uso directo a motores compatibles con este formato.
- Aceleracion: drafter DSpark (`speculative/Qwen3.8-27B-DSpark-Q8_0.gguf` o `Q4_K_M.gguf`) mediante `--model-draft` en llama.cpp, con 2,5x-3,1x de speedup declarado; alternativa de checkpoints con MTP integrado.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion (este) | 26,9B | 262K | Apache 2.0 | GGUF, safetensors | Vision, MTP, drafter DSpark, abliterated |
| Modelo base DavidAU/Qwen3.8-27B-...-NM-DAU | 26,9B | 262K (declarado) | Apache 2.0 | safetensors | Sin cuantizar, sin drafter empaquetado |
| Claude Opus 4.6 Max | no disponible | no disponible | Propietaria | API | Referencia de comparacion en la model card; no verificable de forma independiente |
| Otros modelos Qwen de ~27B | ~27B | variable | Apache 2.0 | safetensors, GGUF | Alternativas de la misma familia; cifras concretas no disponibles |

No se dispone de datos suficientes para comparar con alternativas de codigo abierto de tamano equivalente en rendimiento medido de forma independiente.

## Limitaciones y advertencias

- Las cifras de benchmark proceden exclusivamente de la model card del autor, sin verificacion independiente. La comparacion con "Claude Opus 4.6 Max" no es auditable y la nomenclatura de versiones no corresponde a productos publicos verificables.
- Modelo abliterated/"uncensored": la eliminacion del rechazo por defecto implica que puede generar contenido danino, sesgado o inexacto sin advertencia. Requiere filtros externos en produccion.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar los sesgos heredados de los datos de entrenamiento originales de Qwen y del merge GAIN.
- Riesgo de alucinacion: no cuantificado; el modo de razonamiento con cadena de pensamiento puede producir justificaciones plausibles pero incorrectas.
- Idiomas: solo ingles y chino declarados. El castellano no esta soportado oficialmente y el rendimiento sera inferior.
- Contexto: aunque se declaran 262K tokens, el rendimiento efectivo en contextos muy largos no esta verificado de forma independiente y el coste de KV cache es alto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden arrastrar obligaciones adicionales no detalladas en la informacion disponible.
- El repositorio pesa 427,2 GB; descargar el conjunto completo es costoso en almacenamiento y ancho de banda. Conviene descargar solo la cuantizacion necesaria.
- El soporte de tool calling y function calling no se documenta explicitamente, lo que complica la integracion en frameworks de agentes que dependen de esquemas estructurados.
- El empaquetado depende de llama.cpp y Ollama; no hay soporte declarado para vLLM ni TGI.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised-DSpark
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor original: https://huggingface.co/DavidAU
- Perfil de Solstice-AI: https://huggingface.co/Solstice-AI
- Dataset declarado: https://huggingface.co/datasets/Solstice-AI/Solace-1.0-Omni
- Runtime Anvil (TurboQuant): https://github.com/Solstice-Labs/anvil
- Banner del repositorio: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
