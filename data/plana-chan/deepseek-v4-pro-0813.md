# Plana-Chan/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es la versión de disponibilidad general (GA) del modelo DeepSeek-V4-Pro, desarrollado por DeepSeek y lanzado el 13 de agosto de 2026, trece días después de la versión Flash. Sustituye a la versión preliminar (Preview) y presenta mejoras sustanciales en capacidades agénticas y rendimiento en entornos de producción. Es un modelo de texto puro, de arquitectura mixtura de expertos (MoE) con 1,6 billones de parámetros totales y 49 mil millones activos, una ventana de contexto de 1 millón de tokens y una salida máxima de 384 000 tokens.

La relevancia de este lanzamiento radica en su enfoque explícito hacia tareas de agente: razonamiento multi-paso, uso de herramientas, desarrollo de software completo y automatización de terminal. Incorpora el módulo de decodificación especulativa DSpark, que reduce la latencia de inferencia, y tres niveles de esfuerzo de razonamiento (`low`, `high`, `max`) que permiten ajustar el coste computacional según la tarea. Según los benchmarks publicados, supera claramente a la versión Preview y compite con los modelos propietarios más potentes del momento, como Kimi K3, Opus-4.8 y GLM-5.2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtura de expertos (MoE) con decodificación especulativa DSpark |
| Parametros totales | 1 650 497 936 906 (1,65 billones) |
| Parametros activos | 49 000 000 000 (49 mil millones) |
| Longitud de contexto | 1 000 000 tokens (entrada); 384 000 tokens de salida máxima |
| Tipos de cuantizacion | fp8 (KV-cache fp8 soportado en vLLM); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repositorio: 1781,8 GB) |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro-0813 se construye sobre la estructura del modelo DeepSeek-V4-Pro (Preview) y añade un módulo de decodificación especulativa denominado DSpark. Este módulo permite acelerar la generación mediante la predicción de múltiples tokens por paso, activándose en vLLM con el parámetro `--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'`. La arquitectura es una mixtura de expertos con 1,65 billones de parámetros totales y solo 49 mil millones activos por token, lo que reduce drásticamente el coste computacional de inferencia en comparación con un modelo denso del mismo tamaño.

El modelo incorpora un parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`) que controlan la cantidad de deliberación previa a la respuesta, y un modo de pensamiento (`thinking_mode`) que genera contenido de razonamiento intermedio antes de la respuesta final. No se incluye una plantilla de chat en formato Jinja; en su lugar, se proporciona una carpeta `encoding` con scripts Python que codifican mensajes en formato compatible con OpenAI y parsean la salida del modelo. Los detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados y las técnicas de alineación (RLHF, DPO, etc.) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento avanzado con modo de pensamiento explícito (`thinking_mode`).
- Razonamiento multi-paso y capacidades agénticas mejoradas, especialmente en entornos de producción.
- Soporte de tool calling y función de llamada a herramientas, validado en benchmarks como Toolathlon-Verified y Terminal Bench 2.1.
- Capacidad de desarrollo de software completo (full-stack) y generación de repositorios a partir de lenguaje natural (NL2Repo).
- Modos de razonamiento ajustables (`low`, `high`, `max`) para equilibrar latencia y calidad.
- Salida en formato JSON y compatibilidad con la API Responses y acceso estilo Anthropic, según documentación externa.
- Decodificación especulativa DSpark integrada para reducir latencia de generación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de terminal y operaciones de sistemas: el modelo puntúa 87,9 en Terminal Bench 2.1, lo que lo hace adecuado para ejecutar comandos, gestionar archivos y resolver tareas de administración de sistemas de forma autónoma.
- Desarrollo de software completo (full-stack): con 71,1 en DSBench-FullStack y 62,7 en DeepSWE, puede generar, modificar y depurar código en repositorios enteros, integrándose en pipelines de CI/CD como agente de codificación.
- Agentes de atención al cliente con uso de herramientas: su ventana de 1 millón de tokens permite mantener conversaciones multi-turno con contexto extenso, mientras que el soporte de tool calling facilita la consulta de bases de datos, APIs y sistemas de ticketing.
- Generación de código en producción con decodificación especulativa: el módulo DSpark reduce la latencia, lo que permite servir asistentes de programación interactivos en entornos con alta demanda.
- Análisis y razonamiento sobre documentos extensos: la ventana de contexto de 1M tokens permite procesar manuales técnicos, código fuente completo o documentación legal sin necesidad de fragmentación.
- Investigación y evaluación de agentes: su rendimiento en benchmarks como Agents' Last Exam y Cybergym lo convierte en una referencia para experimentos de razonamiento agéntico y seguridad en entornos simulados.
- Automatización de tareas de oficina y flujos de trabajo: con AutomationBench (31,8) puede ejecutar tareas repetitivas en aplicaciones de escritorio y web, como rellenar formularios o gestionar correos electrónicos.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados en la model card oficial, comparando DeepSeek-V4-Pro-0813 con otros modelos de la misma generación. Todos los valores son porcentajes.

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | DeepSeek-V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (con fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (sin / con herramientas) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 34,8 / 45,1 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 61,8 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 39,4 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | 38,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 7,3 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 49,7 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 15,8 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (público) | 31,8 | 25,1 | 12,8 | 10,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack † | 71,1 | 68,7 | 41,8 | 37,0 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard † | 67,2 | 59,6 | 31,1 | 25,8 | 54,5 | 63,0 | 71,7 | 68,3 |

† DSBench-FullStack y DSBench-Hard son conjuntos internos de DeepSeek para problemas de agentes de codificación.

Para las tareas de agente de código, el modelo se evaluó con el modo mínimo de DeepSeek Harness como marco de agente, con nivel de razonamiento `max`, temperatura 1,0 y top_p 0,95.

## Requisitos de hardware

- El repositorio de pesos ocupa 1781,8 GB en formato safetensors, por lo que se requiere un clúster multi-GPU para cargar el modelo completo.
- La configuración de referencia para vLLM utiliza un nodo con 4 GPU GB300 (Blackwell Ultra) con `--data-parallel-size 4` y `--enable-expert-parallel`.
- Con cuantización fp8 (KV-cache fp8) se reduce el uso de memoria, pero no se dispone de datos exactos de VRAM por GPU.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en una sola GPU profesional; requiere despliegue distribuido.
- Opciones de despliegue: vLLM (con soporte nativo para DSpark), SGLang (con `--speculative-algorithm DSPARK`) y, presumiblemente, otros frameworks compatibles con transformers.
- No se han publicado cifras de latencia o throughput en la información disponible.

## Comparativa con modelos similares

La comparación se basa en los datos de la tabla de benchmarks de la model card. Todos los modelos son de la misma generación (mediados de 2026) y compiten en tareas de agente y razonamiento.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | 1,65 billones | 49 mil millones | 1M tokens | MIT | Mejor en Cybergym (83,3) y NL2Repo (61,5) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Mejor en Agents' Last Exam (27,6) y DeepSWE (67,5) |
| Opus-4.8 | no disponible | no disponible | no disponible | propietaria | Mejor en HLE sin herramientas (49,8) y NL2Repo (69,7) |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | Equilibrado, por debajo en tareas agénticas (Toolathlon 59,9) |

DeepSeek-V4-Pro-0813 destaca frente a sus competidores en tareas de terminal (87,9, solo superado por Kimi K3 con 88,3) y en automatización de software (DSBench-FullStack 71,1). Su ventaja principal es la combinación de licencia MIT, contexto de 1M tokens y decodificación especulativa integrada, lo que facilita el despliegue en producción frente a alternativas propietarias.

## Limitaciones y advertencias

- No se incluye plantilla de chat en formato Jinja; es obligatorio utilizar los scripts de la carpeta `encoding` para codificar mensajes y parsear respuestas, lo que añade complejidad de integración.
- El modelo es de solo texto; no procesa imágenes, audio ni vídeo.
- Los datos sobre idiomas soportados no están disponibles; no se puede confirmar el rendimiento en español u otros idiomas distintos del inglés.
- El tamaño del modelo (1,78 TB en safetensors) exige infraestructura de múltiples GPU de gama alta, lo que limita su uso a organizaciones con recursos significativos.
- Aunque la licencia MIT permite uso comercial sin restricciones, el rendimiento en tareas de seguridad (Cybergym) y agentes sugiere que debe desplegarse con supervisión humana en entornos sensibles.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones de idioma específicas en la información disponible.
- Los benchmarks internos (DSBench-FullStack, DSBench-Hard) no son públicos, por lo que los resultados no son directamente reproducibles por terceros.

## Enlaces

- Repositorio en HuggingFace (ID proporcionado): https://huggingface.co/Plana-Chan/DeepSeek-V4-Pro-0813
- Modelo oficial en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Página de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Receta de vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- Ficha en Datalearner: https://www.datalearner.com/en/ai-models/pretrained-models/deepseek-v4-pro
- Ficha en Phala: https://phala.com/models/deepseek/deepseek-v4-pro-0813
- Seguimiento de lanzamientos: https://aireleasetracker.com/model/deepseek/deepseek-v4-pro-0813
- API y playground en Fireworks AI: https://fireworks.ai/models/deepseek-ai/deepseek-v4-pro-0813
