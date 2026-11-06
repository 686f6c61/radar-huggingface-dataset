# emhltbkars/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con codificador de vision, publicado como la primera variante de pesos abiertos de la serie Qwen3.6 de Alibaba (Qwen). Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, lo que lo situa en la categoria de modelos eficientes en computo de inferencia pese a su tamano total.

El modelo esta disenado para priorizar la estabilidad y la utilidad practica, con un enfasis explicito en el "agentic coding": flujos de trabajo de frontend, razonamiento a nivel de repositorio y experiencia de desarrollo asistido. Incorpora una innovacion destacada, la "Thinking Preservation" (preservacion del razonamiento), que permite retener el contexto de razonamiento de mensajes historicos para reducir la sobrecarga en desarrollos iterativos.

La longitud de contexto es de 262.144 tokens de forma nativa, extensible hasta aproximadamente 1.010.000 tokens. La arquitectura combina capas de atencion lineal (Gated DeltaNet) con capas de atencion completa (Gated Attention), con 256 expertos por capa MoE de los que se activan 8 enrutados mas 1 compartido. La licencia es Apache 2.0 y los pesos estan en formato safetensors compatibles con Transformers, vLLM, SGLang y KTransformers. El repositorio publicado por el usuario emhltbkars es un espejo/redistribucion de los pesos oficiales de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; híbrida Gated DeltaNet (atencion lineal) + Gated Attention, con MoE |
| Parametros totales | 35.951.822.704 (aprox. 35B) |
| Parametros activos | Aproximadamente 3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

Otros datos tecnicos:

| Parametro | Valor |
|---|---|
| Dimension oculta | 2048 |
| Token embedding | 248.320 (padded) |
| Numero de capas | 40 |
| Disposicion | 10 x (3 x (Gated DeltaNet -> MoE) -> 1 x (Gated Attention -> MoE)) |
| Cabezas de atencion lineal (Gated DeltaNet) | 32 para V, 16 para QK; dimension de cabeza 128 |
| Cabezas de atencion (Gated Attention) | 16 para Q, 2 para KV; dimension de cabeza 256; RoPE dim 64 |
| Expertos MoE | 256 en total; 8 enrutados + 1 compartido activados |
| Dimension intermedia de experto | 512 |
| MTP | Entrenado con multi-steps (multi-token prediction) |
| Tamano del repo | 71,9 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida de atencion. Cada bloque de 4 capas sigue el patron 3 capas de Gated DeltaNet (atencion lineal, con 32 cabezas para V y 16 para QK, dimension 128) seguidas de 1 capa de Gated Attention (atencion completa, 16 cabezas Q y 2 KV, dimension 256, RoPE de 64). Cada capa va acompanada de un bloque MoE con 256 expertos, activando 8 enrutados mas 1 compartido, con dimension intermedia de experto de 512. El modelo esta entrenado con multi-token prediction (MTP) en varios pasos, tecnica que puede aprovecharse para decodificacion especulativa. Incluye un codificador de vision, lo que lo convierte en un modelo image-text-to-text.

El entrenamiento se realizo en dos fases (preentrenamiento y postentrenamiento), segun la model card. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO especificas. La model card menciona que el modelo se construyo sobre retroalimentacion directa de la comunidad. La innovacion "Thinking Preservation" permite retener el contexto de razonamiento de mensajes historicos, lo que reduce la sobrecarga en flujos de desarrollo iterativo.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno.
- Capacidades de codigo: frontend, razonamiento a nivel de repositorio y "agentic coding" (flujos de agente autonomo).
- Comprension de imagenes junto con texto (pipeline image-text-to-text, con codificador de vision).
- Razonamiento multi-paso orientado a agentes.
- "Thinking Preservation": retencion del contexto de razonamiento de mensajes historicos.
- Compatibilidad con tool calling / function calling: no disponible en la informacion proporcionada (la model card no lo detalla explicitamente, aunque el enfasis en agentic coding lo sugiere).
- Capacidades multilingues: no disponible (idiomas no especificados), aunque existe un benchmark SWE-bench Multilingual.
- Prediccion multi-token (MTP) entrenada con multi-steps.
- Soporte de contexto largo: hasta 1.010.000 tokens extensibles.

## Casos de uso

- Desarrollo asistido de frontend: el modelo esta optimizado para flujos de trabajo de frontend y razonamiento a nivel de repositorio, por lo que puede generar y refactorizar componentes UI dentro de un proyecto con contexto de codigo amplio gracias a su ventana de 262K tokens nativos.
- Agente de codigo autonomo sobre repositorios: con SWE-bench Verified de 73,4, es adecuado para tareas de resolucion de issues reales en repositorios, aplicando parches multi-archivo con razonamiento preservado entre iteraciones.
- Revision y depuracion de codigo en CI/CD: integrable en pipelines para analizar diffs, detectar regresiones y proponer correcciones, aprovechando la compatibilidad con vLLM y SGLang para servir peticiones de baja latencia.
- Asistente de desarrollo iterativo con "Thinking Preservation": al retener el razonamiento historico, reduce la sobrecarga en sesiones largas de depuracion o desarrollo por etapas.
- Analisis de documentos e imagenes tecnicas: al ser image-text-to-text, puede procesar diagramas, capturas de pantalla o documentacion visual junto con texto para tareas de soporte tecnico.
- Analisis de repositorios grandes o bases de codigo extensas: la ventana extensible hasta 1M tokens permite cargar contextos de proyecto completos para auditorias o migraciones.
- Generacion de codigo multilingue entre lenguajes de programacion: SWE-bench Multilingual de 67,2 respalda el trabajo con bases de codigo en varios lenguajes.

## Benchmarks y rendimiento

Resultados publicados en la model card (seccion Language, categoria Coding Agent):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible (dato truncado en la informacion) | no disponible | no disponible | no disponible | no disponible |

Los resultados de Terminal-Bench 2.0 no estan completos en la informacion disponible. No se han publicado en la informacion proporcionada resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.951.822.704 parametros, en precision completa (BF16/FP16) se requieren aproximadamente 72 GB solo para los pesos, mas memoria para KV cache y activaciones. El tamano del repo (71,9 GB) es coherente con esto.
- Cuantizacion: no se especifican tipos de cuantizacion en la informacion disponible; el formato publicado es safetensors. Para reducir requisitos se necesitarian cuantizaciones adicionales (p. ej. GGUF) no confirmadas en la ficha.
- GPU recomendadas: para BF16 se requieren GPUs de centro de datos con 80 GB o superiores (A100 80GB, H100 80GB) o configuraciones multi-GPU. Una RTX 4090 (24 GB) no puede alojar los pesos sin cuantizar.
- Cabe en consumer GPU: no en precision completa. Solo con cuantizaciones agresivas no confirmadas, que no estan disponibles en la informacion.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers (segun la model card). Compatible con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser MoE con solo ~3B parametros activos, el coste por token es menor que el de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

Comparativa segun los datos de la model card:

| Modelo | Parametros totales | Parametros activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | ~3B | 262K nativo, hasta 1M | 73,4 | Apache 2.0 | Pesos abiertos (HF) |
| Qwen3.5-35BA3B | 35B | ~3B | no disponible | 70,0 | no disponible | no disponible |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible | no disponible |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible | no disponible |
| Gemma4-26BA4B | 26B | ~4B | no disponible | 17,4 | no disponible | no disponible |

El modelo supera a Qwen3.5-35BA3B en los tres benchmarks de codigo mostrados (SWE-bench Verified, Multilingual y Pro), y queda por detras de Qwen3.5-27B en SWE-bench Verified (73,4 frente a 75,0) pero por delante en Multilingual y Pro, con muchas menos activaciones por token. Los datos de contexto y licencia de los modelos comparados no estan disponibles en la informacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Como todo modelo entrenado con datos web, puede reproducir sesgos presentes en sus datos.
- Riesgo de alucinacion: no cuantificado en la informacion; aplica el riesgo habitual en modelos generativos, especialmente en tareas de codigo y razonamiento sin verificacion.
- Limitaciones de contexto o idioma: aunque el contexto es amplio (262K nativo, hasta 1M extensible), el rendimiento puede degradarse en los extremos de esa ventana. Los idiomas soportados no estan especificados en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de los terminos (enlace de licencia en la model card oficial apunta al repositorio de Qwen).
- El repositorio emhltbkars/Qwen3.6-35B-A3B es una redistribucion con 0 descargas y 0 likes, creada el 2026-11-06; no es el repositorio oficial de Qwen. Para produccion conviene usar los pesos oficiales de Qwen.
- Coste de hardware: 72 GB de pesos en BF16 exigen GPUs de centro de datos o multi-GPU; no cabe en GPUs consumer sin cuantizacion, que no esta confirmada.
- La model card indica pesos "post-trained" y compatibles con varios motores, pero no detalla cuantizaciones de comunidad ni garantias de soporte en todos los frameworks.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/emhltbkars/Qwen3.6-35B-A3B
- Repositorio oficial de referencia (segun license_link): https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
