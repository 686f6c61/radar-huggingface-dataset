# com-junkawasaki/LLaDA2.2-flash-uncensored

## Resumen

LLaDA2.2-flash-uncensored es una redistribución publicada por el usuario `com-junkawasaki` del modelo LLaDA2.2-flash, desarrollado originalmente por inclusionAI (grupo vinculado a Ant Group). Se trata de un modelo de lenguaje de difusión (diffusion language model, dLLM) con arquitectura de mezcla de expertos (MoE), orientado a cargas de trabajo agénticas: uso de herramientas con contexto largo, interacción multi-turno y corrección de errores. Su innovación principal es la inclusión de "Levenshtein Editing", un mecanismo que añade los tokens de control `DELETE` e `INSERT` al proceso de decodificación por difusión para permitir editar la estructura de la secuencia durante la generación paralela.

El repositorio ocupa 205,8 GB y contiene pesos en safetensors con un total de 102.889.705.216 parámetros (~102,9B, contando embeddings); la model card del autor original declara 100B parámetros no pertenecientes a embeddings. Soporta una ventana de contexto de 128K tokens y emplea 32 capas con 32 cabezas de atención y codificación posicional RoPE. La licencia declarada es Apache 2.0.

Es relevante ahora porque propone un paradigma alternativo a los transformers autorregresivos para aplicaciones de agente, con mejoras de throughput documentadas frente a un modelo autorregresivo comparable, y porque el sufijo "uncensored" indica algún tipo de modificación sobre los pesos originales, aunque el repositorio no documenta en qué consiste dicho ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) de difusión con Levenshtein Editing (tag `llada2_moe`) |
| Parametros totales | 102.889.705.216 segun safetensors; 100B no-embedding segun la model card |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code=True`) |
| Capas | 32 |
| Cabezas de atencion | 32 |
| Codificacion posicional | RoPE |
| Tamano de vocabulario | 157.184 |
| Tokens de control | `DELETE`, `INSERT` |
| Tamano del repositorio | 205,8 GB |

## Arquitectura y entrenamiento

LLaDA2.2-flash es un modelo de difusión para texto en lugar de un transformer autorregresivo clásico: la generación se realiza desnoiseando bloques de tokens en paralelo, con parámetros de control como `block_length`, `threshold` y `editing_threshold`. La espina dorsal es una arquitectura MoE de 32 capas con 32 cabezas de atención y RoPE. La innovación de "Block Routing" acota la activación de expertos a nivel de bloque de difusión, lo que permite sostener ventanas de 128K tokens en cargas agénticas de contexto largo. Sobre el decodificador de difusión se añaden los tokens `DELETE` e `INSERT`, que habilitan la edición de la estructura de la secuencia, la eliminación de contenido redundante y la creación de huecos de inserción durante la generación paralela (Levenshtein Editing).

En cuanto al entrenamiento, la model card menciona un esquema de aprendizaje por refuerzo agéntico denominado Levenshtein Editing ELBO-based Block-level Policy Optimization (L-EBPO), que aprovecha recompensas del entorno agéntico para entrenar la edición y la corrección de errores en escenarios multi-turno con uso de herramientas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO adicionales; el informe técnico está referenciado pero su contenido no se incluye aquí. Tampoco se documenta qué modificación concreta introduce esta variante "uncensored" respecto a los pesos originales de `inclusionAI/LLaDA2.2-flash`.

## Capacidades

- Generación de texto conversacional mediante decodificación por difusión, con control de parámetros de desnoiseado.
- Uso de herramientas (tool calling) y flujos de agente multi-paso orientados a entornos de código y MCP.
- Contexto largo de hasta 128K tokens, pensado para uso de herramientas y conversaciones multi-turno extensas.
- Corrección de errores y edición de secuencias mediante los tokens `DELETE` e `INSERT` (Levenshtein Editing), con reentrenamiento por RL agéntico.
- Rendimiento evaluado en tareas de ingeniería de software (SWE-bench Verified/Pro/Multilingual), de herramientas (BFCL-V4, MCP-Atlas) y de agentes (τ²-Bench, Claw-Eval, PinchBench).
- Capacidades multilingües: no disponibles como dato explícito; no se documenta la cobertura de idiomas.
- Capacidades de visión, audio o modo de razonamiento explícito ("thinking mode"): no disponibles.

## Casos de uso

- Agentes de ingeniería de software: con 49,28 en SWE-bench Verified y 30,10 en SWE-bench Pro, el modelo está pensado para resolver issues y parchear repositorios dentro de scaffolds tipo Claude Code.
- Automatización de pipelines CI/CD con tool calling: los 60,78 puntos en BFCL-V4 y 46,21 en MCP-Atlas indican soporte para invocar herramientas y servidores MCP desde flujos automatizados.
- Atención al cliente multi-turno: la ventana de 128K tokens permite mantener historiales largos de conversación sin truncar; Block Routing reduce el coste de activación de expertos en estas secuencias extensas.
- Asistentes de código en IDE o revisión de PRs: el modelo puede generar y editar código, y la edición Levenshtein permite reescribir fragmentos en lugar de regenerarlos completos.
- Tareas de edición y corrección de documentos largos: los tokens `DELETE`/`INSERT` permiten eliminar redundancias e insertar contenido en posiciones concretas de un texto ya generado.
- Evaluación y banco de pruebas de agentes: útil como contraparte en benchmarks de τ²-Bench o PinchBench para comparar scaffolds y estrategias de planificación.
- Procesamiento por lotes de alto throughput: los 519 TPS registrados en SWE-bench Verified frente a los 303,2 de Ling-2.6-flash lo hacen atractivo para servir muchas peticiones simultáneas por GPU.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del modelo original (LLaDA2.2-flash) y comparan con Ling-2.6-flash. Configuración de evaluación declarada: ventana de 128K, `temperature=1.0`, `block_length=32`, `threshold=0.5`, `editing_threshold=0.0`, scaffold Claude Code para la serie SWE-bench y media de cinco ejecuciones.

| Benchmark | LLaDA2.2-flash | Ling-2.6-flash |
|---|---:|---:|
| SWE-bench Verified | 49,28 | 61,20 |
| SWE-bench Pro | 30,10 | 31,88 |
| SWE-bench Multilingual | 25,00 | 33,73 |
| τ²-Bench | 80,33 | 76,36 |
| Claw-Eval | 64,22 | 64,56 |
| PinchBench | 81,66 | 81,30 |
| MCP-Atlas | 46,21 | 41,12 |
| BFCL-V4 | 60,78 | 66,81 |

Throughput declarado (tokens por segundo):

| Benchmark | LLaDA2.2-flash (TPS) | Ling-2.6-flash (TPS) |
|---|---:|---:|
| SWE-bench Verified | 519,0 | 303,2 |
| SWE-bench Pro | 485,3 | 283,4 |
| SWE-bench Multilingual | 459,5 | 200,6 |
| τ²-Bench | 592,8 | 334,9 |
| BFCL-V4 | 703,82 | 331,5 |

Nota: estas cifras corresponden a LLaDA2.2-flash, no a la variante `uncensored` publicada por `com-junkawasaki`, cuyos pesos pueden diferir. No se han publicado resultados de benchmarks específicos de esta variante en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 206 GB (el repositorio pesa 205,8 GB); requiere por tanto varios aceleradores.
- En fp8/int8: del orden de 103 GB, todavía por encima de una GPU única de 80 GB.
- En int4: del orden de 52 GB, factible en configuraciones de 1x H100 80 GB o 2x A100 40 GB, aunque no se documenta soporte oficial de cuantización.
- GPU recomendadas: H100 80 GB (3 unidades para bf16) o A100 80 GB (3-4 unidades); no cabe en GPUs de consumo como RTX 4090 (24 GB) ni en una única GPU profesional de 80 GB en precisión completa.
- Despliegue: `transformers` con `trust_remote_code=True` (ejemplo oficial en la model card) y SGLang, recomendado explícitamente por el autor para cargas agénticas de contexto largo. No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI.
- Throughput: entre 459 y 704 TPS según benchmark, con la configuración de evaluación declarada (valores del modelo original).
- Parámetros de generación recomendados: `block_length=32`, `temperature=0.0`, `top_p=None`, `top_k=None`; ajustar `threshold`, `editing_threshold` y `max_post_steps` según el compromiso velocidad-calidad. Umbrales más bajos aceleran la inferencia pero pueden provocar repeticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| com-junkawasaki/LLaDA2.2-flash-uncensored | ~102,9B (safetensors) | 128K | MoE de difusion con Levenshtein Editing | Apache 2.0 | HuggingFace (repo de terceros, 0 descargas) |
| inclusionAI/LLaDA2.2-flash | 100B no-embedding | 128K | MoE de difusion con Levenshtein Editing | Apache 2.0 | HuggingFace (repo oficial) |
| Ling-2.6-flash | no disponible | no disponible | Transformer autorregresivo con MTP | no disponible | Referenciado en los benchmarks de la model card |

No se dispone de datos de parámetros, contexto o licencia de Ling-2.6-flash más allá de las puntuaciones comparadas. Para el resto de alternativas de la misma categoría (modelos de difusión para texto de escala comparable) no hay información disponible en el material proporcionado.

## Limitaciones y advertencias

- La información de benchmarks corresponde al modelo original LLaDA2.2-flash; no hay evidencia de que la variante `uncensored` conserve ese rendimiento, y el ajuste podría degradarlo.
- El repositorio no documenta en qué consiste la modificación "uncensored": no se especifican los datos de ajuste, el método ni las implicaciones sobre seguridad y alineamiento.
- Al ser un modelo "uncensored", cabe esperar una menor resistencia a generar contenido dañino, ofensivo o ilegal; requiere filtros externos en producción.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se publican tasas de error ni evaluaciones de factualidad.
- Idiomas soportados: no disponibles. No se puede asumir calidad en castellano sin evaluación propia.
- La decodificación por difusión es sensible a los umbrales (`threshold`, `editing_threshold`): valores bajos pueden producir repeticiones o salidas inestables.
- Licencia Apache 2.0 en el repositorio de origen, lo que en principio permite uso comercial, pero el peso legal de una redistribución de terceros sin trazabilidad de los pesos modificados es incierto.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria, y fue creado y actualizado con un segundo de diferencia; no hay garantía de mantenimiento.
- Soporte de cuantización no documentado: desplegar en hardware limitado exige validar por cuenta propia.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el `custom_code` antes de usarlo en entornos productivos.
- El modelo original está orientado a agentes; su uso como chatbot general no está evaluado en la información disponible.

## Enlaces

- HuggingFace (esta variante): https://huggingface.co/com-junkawasaki/LLaDA2.2-flash-uncensored
- HuggingFace (modelo original): https://huggingface.co/inclusionAI/LLaDA2.2-flash
- Informe técnico LLaDA2.2: https://github.com/inclusionAI/LLaDA2.X/blob/main/LLaDA2_2_tech_report.pdf
- Repositorio LLaDA2.X: https://github.com/inclusionAI/LLaDA2.X
- No se han encontrado otros enlaces relevantes en la búsqueda web (los resultados devueltos corresponden a páginas genéricas sobre el dominio .com y no guardan relación con el modelo).
