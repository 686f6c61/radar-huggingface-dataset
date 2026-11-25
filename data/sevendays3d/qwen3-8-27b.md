# SevenDays3D/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de tipo dense (sin mezcla de expertos) con 27.320.697.856 parámetros, desarrollado por el equipo Qwen y distribuido en este repositorio por el usuario SevenDays3D como cuantización GGUF. Se construye sobre la base arquitectónica de Qwen3.5 e incorpora un codificador visual nativo, lo que le permite procesar texto, imágenes y vídeo dentro de una misma ventana de contexto. Su contexto nativo es de 262.144 tokens, ampliable hasta 1.000.000 mediante YaRN.

El modelo está orientado a cargas de trabajo agénticas y de razonamiento prolongado: incluye un modo de pensamiento activado por defecto, controlable mediante el parámetro `reasoning_effort` (`xhigh`, `medium`, `low`) y desactivable con `enable_thinking`. La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuerta (Gated Attention), además de un objetivo de entrenamiento de predicción multi-token (MTP).

Es relevante ahora porque ofrece capacidades multimodales y de agente en un tamaño compacto (27B) desplegable en infraestructura de una sola GPU de gama alta, con licencia Apache 2.0 y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed. El repositorio concreto es una conversión a GGUF del modelo base, con un tamaño de 123,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador visual; híbrido de Gated DeltaNet (atención lineal) y Gated Attention; MTP (Multi-Token Prediction) |
| Parametros totales | 27.320.697.856 (27B, dense) |
| Parametros activos | No aplica (modelo dense, sin MoE) |
| Longitud de contexto | 262.144 tokens nativo; hasta 1.000.000 con YaRN (factor 4.0) |
| Tipos de cuantizacion | GGUF (repositorio etiquetado como `gguf`); niveles concretos no disponibles |
| Idiomas soportados | Ruso (declarado en la model card y en los tags); cobertura adicional no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base emplea safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal con 64 capas, dimensión oculta de 5120 y dimensión intermedia de FFN de 17.408. La pila alterna bloques según el patrón 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). Las capas Gated DeltaNet emplean 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; las capas Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. Se entrenó con un objetivo de predicción multi-token (MTP), que permite predecir varios tokens por paso y suele aprovecharse para decodificación especulativa.

El modelo es nativamente vision-language: incorpora un codificador visual que procesa imágenes y vídeo (incluidos vídeos de hasta una hora según la model card). No se dispone en la información proporcionada del número de tokens de entrenamiento, de la composición del dataset ni del detalle de las fases de alineación (RLHF/DPO). La model card destaca mejoras en programación, tareas profesionales, investigación y escenarios agénticos de larga duración, así como una mayor capacidad de planificación autónoma y de procesamiento de la retroalimentación del entorno.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento configurable (`xhigh`, `medium`, `low`) y preservación del contexto de razonamiento entre turnos mediante `preserve_thinking`.
- Generación y edición de código, con resultados destacados en benchmarks de ingeniería de software (SWE-bench Pro, QwenSWEBench, Terminal Bench).
- Comprensión de imágenes: diagramas STEM, documentos, gráficos y tareas de razonamiento visual.
- Comprensión de vídeo, incluidos vídeos de larga duración (hasta una hora según la model card).
- Uso de ordenador y navegación web (computer use), con resultados en OSWorld-Verified, WebArena-Verified y AndroidWorld.
- Ejecución agéntica autónoma: planificación, uso de herramientas y finalización fiable de tareas de varios pasos.
- Compatibilidad con harnesses y herramientas de desarrollo habituales (sin detalle específico en la información disponible).
- Capacidades multilingües: el ruso está declarado explícitamente; el resto de idiomas no está detallado.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información proporcionada, aunque las capacidades agénticas descritas lo presuponen.

## Casos de uso

- Automatización de ingeniería de software: el modelo puede resolver incidencias y generar parches en repositorios reales, apoyándose en sus resultados en SWE-bench Pro (61,7) y QwenSWEBench (79,0) y en un contexto de hasta 262.144 tokens para manejar bases de código extensas.
- Agentes autónomos de terminal y CI/CD: con 73,0 en Terminal Bench 2.1, es adecuado para tareas de línea de comandos, diagnóstico de fallos de build y ejecución de pipelines con retroalimentación del entorno.
- Automatización de navegador y escritorio: sus puntuaciones en WebArena-Verified (64,8), AndroidWorld (81,9) y OSWorld-Verified (84,3) lo hacen utilizable en flujos de RPA modernos y pruebas end-to-end de interfaces.
- Procesamiento de documentos técnicos y científicos: OmniDocBench 1.5 (91,1) y CharXiv (83,7 / 90,2 con CI) respaldan la extracción y el razonamiento sobre documentos, tablas y gráficos.
- Análisis de vídeo de larga duración: la ventana de 1M tokens con YaRN permite resumir o consultar grabaciones extensas (reuniones, clases, vigilancia) sin trocear el contenido.
- Asistencia en investigación y tareas STEM: GPQA Diamond (89,2) y MathVision (90,0 / 94,6 con CI) lo sitúan como herramienta para razonamiento científico y matemático con soporte visual.
- Atención al cliente multilingüe en ruso: el idioma declarado y el contexto largo permiten conversaciones multi-turno con historial extenso e instrucciones de sistema complejas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Terminal Bench 2.1 (Terminus) | 73,0 |
| SWE-bench Pro | 61,7 |
| QwenSWEBench | 79,0 |
| DeepSWE 1.1 | 42,2 |
| NL2Repo-Bench | 42,3 |
| CoWorkBench | 70,7 |
| IFBench | 79,5 |
| GPQA Diamond | 89,2 |
| HLE | 30,8 |
| LiveCodeBench v6 | 90,3 |
| OSWorld-Verified (computer use) | 84,3 |
| WebArena-Verified | 64,8 |
| AndroidWorld | 81,9 |
| SWE-MM | 38,6 |
| Vision2Web | 62,9 |
| MathVision | 90,0 (sin CI) / 94,6 (con CI) |
| CharXiv (RQ) | 83,7 / 90,2 (con CI) |
| OmniDocBench 1.5 | 91,1 |
| RealWorldQA | 85,9 |

No se dispone de comparaciones directas con modelos similares en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño (27B dense), una cuantización de 4 bits requiere aproximadamente 14-16 GB de pesos, una de 8 bits en torno a 27-29 GB y precisión completa (BF16) unos 55 GB, a lo que hay que sumar caché KV y el codificador visual; el contexto de 1M tokens incrementa sustancialmente el consumo de memoria.
- GPU recomendadas: para BF16, A100 80 GB o H100; para cuantizaciones de 8 bits, A100 40 GB o L40S; para 4 bits, RTX 4090 (24 GB) o RTX 5090.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4-5 bits sobre RTX 4090 o superiores, con contexto reducido.
- Opciones de despliegue: llama.cpp y Ollama para el formato GGUF de este repositorio; vLLM, SGLang y TokenSpeed para el modelo base en safetensors; Transformers como referencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B dense | 262K nativo / 1M con YaRN | Apache 2.0 | GGUF (repo) / safetensors (base) | Multimodal texto-imagen-vídeo, modo de razonamiento configurable |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Este repositorio es una cuantización GGUF de terceros (SevenDays3D), no la publicación oficial; la pérdida de precisión respecto al modelo base no está documentada.
- El único idioma declarado es el ruso; el rendimiento en castellano u otros idiomas no está verificado y podría ser inferior.
- El campo `pipeline_tag` del repositorio es `image-text-to-video`, lo que no se corresponde con un modelo de generación de vídeo; se trata probablemente de una etiqueta incorrecta y conviene no interpretarla como capacidad generativa de vídeo.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento abierto (HLE de 30,8 sugiere margen de error considerable en preguntas de altísima dificultad).
- El modo de pensamiento activado por defecto incrementa el coste de inferencia y la latencia; en producción conviene ajustar `reasoning_effort` o desactivarlo según la tarea.
- El contexto de 1M tokens requiere YaRN y un consumo de memoria elevado; no es viable en GPU de consumo con esa longitud.
- Sesgos concretos no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de una conversión de terceros conviene verificar la procedencia y la integridad de los pesos antes de desplegarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SevenDays3D/Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o repositorio oficial de Qwen: no disponible en la información proporcionada.
