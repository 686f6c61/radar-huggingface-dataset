# ITLL/Opus4.7-GODs.Ghost.Codex-4B.GGuF

## Resumen

Opus4.7-GODs.Ghost.Codex-4B.GGuF es un ajuste fino de parámetros completos del modelo Qwen/Qwen3.5-4B, desarrollado por In The Loop Labs (ITLL), una organización sin ánimo de lucro. El objetivo declarado es producir un asistente de código de pequeno tamano que reproduzca el estilo de trabajo de modelos frontera en tareas de codigo agentico: razonamiento paso a paso, disciplina en el uso de herramientas y refactorizaciones limpias, ejecutable en hardware de gama consumer.

El modelo parte de la arquitectura hibrida de Qwen3.5-4B, que combina bloques Gated DeltaNet (atencion lineal de memoria constante) con bloques de atencion completa con GQA cada cuatro capas, organizados en 32 capas con dimension oculta de 2.560. El checkpoint hereda una ventana de contexto nativa de 262.144 tokens, extensible hasta aproximadamente 1.010.000, y fue entrenado sobre una mezcla de diez conjuntos de datos con trazas de razonamiento de modelos Claude Opus y GPT-5.x, registros de sesiones de agentes de codificacion y datos de instrucciones vision-lenguaje.

La relevancia de esta publicacion es doble: por un lado, distribuye unicamente cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q8_0) orientadas a inferencia local; por otro, la model card advierte explicitamente de que los archivos publicados no incluyen el proyector de vision (mmproj), por lo que la capacidad multimodal heredada del modelo base no es accesible a traves de estos ficheros y deben tratarse como modelos solo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Gated DeltaNet + Gated Attention (GQA) con Mixture-of-Experts disperso |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extensible a ~1.010.000 |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (GGUF) |
| Idiomas soportados | Base con 201 idiomas; ajuste fino enfocado a ingles |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (solo texto, sin proyector de vision) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B dispone de 32 capas organizadas como 8 repeticiones de tres bloques Gated DeltaNet seguidos de un bloque Gated Attention. Los bloques DeltaNet emplean 32 cabezas de valor y 16 cabezas QK con dimension de cabeza 128; los bloques de atencion usan 16 cabezas de consulta y 4 cabezas KV (GQA) con dimension de cabeza 256 y embeddings rotatorios de 64 dimensiones. Los embeddings de tokens son 248.320, atados con la cabeza LM, y el entrenamiento del base incluyo prediccion multi-token. El ajuste fino de ITLL actualizo todos los pesos sobre una mezcla de diez conjuntos de datos con aproximadamente 392.600 filas (392.100 unicas), compuesta por trazas de razonamiento de Claude Opus 4.6/4.5, Sonnet 4.6, Haiku 4.5, GPT-5.4, gpt-5.3-codex, GPT-5.5, GPT-5.4-mini, GPT-4-0613 y GPT-3.5-turbo, junto con registros de sesiones de agentes de codificacion, retroalimentacion de codigo multilingue y datos de instrucciones vision-lenguaje. No se especifica en la informacion disponible si se aplicaron etapas de RLHF o DPO posteriores al ajuste supervisado.

La innovacion tecnica principal reside en la arquitectura hibrida del base: los bloques DeltaNet procesan secuencias con memoria constante, lo que permite throughput en contexto largo superior al de un transformer denso de 4B, mientras que los bloques de atencion completa cada cuatro capas preservan la capacidad de recuperacion precisa. El modelo base opera en modo thinking por defecto, emitiendo contenido dentro de etiquetas `<think>...</think>` antes de la respuesta final.

## Capacidades

- Generacion de texto y razonamiento estructurado en modo thinking, con trazas paso a paso antes de la respuesta.
- Codigo: generacion, refactorizacion y diffs, con enfasis en el estilo de sesiones de agentes de codificacion.
- Razonamiento matematico y resolucion de problemas (capacidad heredada del base, no re-evaluada tras el ajuste).
- Uso de herramientas y function calling: el base reporta BFCL-V4 de 50,3; el ajuste incluye registros de sesiones con llamadas a herramientas.
- Razonamiento multi-paso orientado a agentes, derivado de los registros de sesiones de codificacion del conjunto de entrenamiento.
- Capacidades multilingues heredadas del base (201 idiomas), aunque el ajuste fino esta enfocado al ingles.
- Capacidad de vision presente en los pesos de precision completa del base, pero no accesible en los GGUF publicados por ausencia de fichero mmproj.

## Casos de uso

- Asistente de codigo local en editores: el modelo puede mantener sesiones largas sobre ficheros extensos gracias a su ventana de 262.144 tokens, con cuantizacion Q4_K_M ejecutable en GPU consumer.
- Refactorizacion y generacion de diffs: entrenado sobre registros de sesiones de agentes de codificacion, es adecuado para producir cambios acotados y limpios sobre codigo existente.
- Automatizacion de tareas de agente en shell: su disciplina en llamadas a herramientas permite integrarlo en bucles de agente que ejecutan comandos y editan ficheros.
- Analisis de repositorios completos: la ventana de contexto nativa permite cargar varios ficheros simultaneamente para tareas de revision o explicacion de codigo.
- Generacion de codigo en pipelines de CI/CD: puede integrarse como paso de generacion o revision de parches en flujos automatizados, siempre con validacion posterior.
- Prototipado y experimentation en hardware limitado: las cuantizaciones Q4_K_M y Q5_K_M permiten desplegar el modelo en portatiles con GPU de gama media para pruebas de concepto.
- Educacion y asistencia tecnica: el modo thinking expone el razonamiento intermedio, util para explicar soluciones paso a paso en entornos de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del checkpoint ajustado en la informacion disponible. La model card unicamente reproduce las puntuaciones del modelo base Qwen3.5-4B antes del ajuste fino:

| Benchmark | Qwen3.5-4B (base) |
|---|---|
| MMLU-Pro | 79,1 |
| MMLU-Redux | 88,8 |
| GPQA Diamond | 76,2 |
| IFEval | 89,8 |
| HMMT Feb 25 | 74,0 |
| LiveCodeBench v6 | 55,8 |
| OJBench | 24,1 |
| BFCL-V4 (tool calling) | 50,3 |
| TAU2-Bench | 79,9 |
| LongBench v2 | 50,0 |
| MMMU (vision) | 77,6 |
| MathVista mini (vision) | 85,1 |
| OCRBench (vision) | 85,0 |

Estas cifras describen el checkpoint antes del ajuste fino y no deben atribuirse al modelo publicado.

## Requisitos de hardware

- VRAM estimada: Q4_K_M aproximadamente 2,6-3 GB; Q5_K_M aproximadamente 3,2-3,5 GB; Q8_0 aproximadamente 4,5-5 GB (estimaciones para 4.205 millones de parametros; el repositorio completo ocupa 10,3 GB).
- GPU recomendadas: RTX 4090 o RTX 3090 para Q8_0 con contexto largo; RTX 4060 Ti 16 GB o RTX 4070 para Q5_K_M; GPUs con 6-8 GB de VRAM para Q4_K_M.
- Cabe en GPU consumer: si, en tarjetas con al menos 6 GB de VRAM para Q4_K_M; el contexto largo incrementa el consumo de memoria KV cache.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints (el repositorio incluye la etiqueta endpoints_compatible); vLLM y TGI no estan confirmados para este formato GGUF en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Opus4.7-GODs.Ghost.Codex-4B (este) | 4,2B | 262.144 | Apache 2.0 | GGUF | Ajuste fino de Qwen3.5-4B; solo texto |
| Qwen/Qwen3.5-4B (base) | 4B | 262.144 | Apache 2.0 | safetensors y otros | Base multimodal con vision; benchmarks publicados |
| Alternativas de 4B para codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- El ajuste fino de parametros completos puede degradar el equilibrio de instrucciones y la alineacion de seguridad del modelo base; la model card lo reconoce explicitamente.
- Los GGUF publicados no incluyen proyector de vision (mmproj): la capacidad multimodal no es utilizable.
- No se han publicado benchmarks del checkpoint ajustado, por lo que el rendimiento real en codigo, matematicas o tool calling es desconocido.
- El ajuste esta enfocado al ingles; el rendimiento en castellano puede ser inferior al del base.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tareas de razonamiento complejo o contexto muy largo.
- El nombre del modelo evoca marcas de terceros (Opus, Codex) sin afiliacion; conviene verificar la procedencia antes de uso comercial.
- La licencia Apache 2.0 se hereda del base, pero la model card no detalla restricciones adicionales sobre los datos de entrenamiento derivados de modelos de terceros.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/Opus4.7-GODs.Ghost.Codex-4B.GGuF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia arXiv citada en las etiquetas: arxiv:2402.14658
