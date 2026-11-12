# ceselder/maemm-27b-rl-from-sft-4m-checkpoint

## Resumen

maemm-27b-rl-from-sft-4m-checkpoint es un checkpoint publicado por el usuario ceselder en Hugging Face, derivado del modelo Qwen3.6-27B de Alibaba Qwen. Se trata de un modelo causal multimodal (lenguaje con codificador de vision) orientado a tareas image-text-to-text, con 27.781.427.952 parametros reales segun los pesos en safetensors. La model card incluida en el repositorio es la del modelo base Qwen3.6-27B, no una descripcion especifica del proceso de RL o SFT que sugiere el nombre del checkpoint, por lo que los detalles del ajuste concreto no estan documentados en la informacion disponible.

El modelo base Qwen3.6-27B es la primera variante open-weight de la serie Qwen3.6, publicada tras la serie Qwen3.5 de febrero. Segun la model card, prioriza estabilidad y utilidad practica, con mejoras destacadas en coding agentico (flujos de frontend y razonamiento a nivel de repositorio) y una nueva opcion de "thinking preservation" que conserva el contexto de razonamiento de mensajes historicos. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000.

La relevancia de este checkpoint radica en que combina el rendimiento del Qwen3.6-27B con un ajuste adicional (aparentemente RL sobre un checkpoint SFT de 4M, segun el nombre) del que no se aportan detalles. Para evaluacion en produccion, conviene tratar el checkpoint como una variante no documentada del base y validar su comportamiento empiricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; layout hibrido de atencion lineal (Gated DeltaNet) y atencion completa (Gated Attention) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE segun la model card) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal con codificador de vision, con un layout hibrido: 16 bloques compuestos por 3 subcapas de Gated DeltaNet (atencion lineal) seguidas de 1 subcapa de Gated Attention (atencion completa), cada una con su FFN. La Gated DeltaNet usa 48 cabezas lineales para V y 16 para QK con dimension de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV con dimension de cabeza 256 y RoPE de 64 dimensiones. La dimension oculta es 5120, el FFN tiene dimension intermedia 17408, hay 64 capas y el embedding de tokens (con padding) es de 248320. El modelo incluye MTP (multi-token prediction) entrenado con multiples pasos.

El proceso de entrenamiento del base incluye pre-entrenamiento y post-entrenamiento, pero la model card no detalla el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Respecto al checkpoint concreto (maemm-27b-rl-from-sft-4m-checkpoint), el nombre sugiere un ajuste por RL sobre un checkpoint SFT, pero no se proporciona informacion sobre el dataset, la metodologia ni los hiperparametros empleados. La innovacion tecnica documentada del base es la "thinking preservation", que permite retener el contexto de razonamiento de mensajes historicos.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text).
- Coding agentico: flujos de frontend y razonamiento a nivel de repositorio, con mejoras especificas segun la model card.
- Razonamiento multi-paso con preservacion de contexto de pensamiento ("thinking preservation").
- Capacidades multilingues: la model card no detalla los idiomas, aunque el benchmark SWE-bench Multilingual sugiere soporte para tareas de codigo en varios idiomas.
- Compatibilidad con tool calling / function calling: no documentado explicitamente en la informacion disponible, aunque el enfoque agentico del base lo hace plausible; requiere validacion empirica.
- Soporte de agentes: orientado a coding agentico segun la model card del base.

## Casos de uso

- Asistencia de coding agentico en repositorios: el modelo puede razonar sobre el codigo de un repositorio completo y proponer cambios, apoyandose en su contexto nativo de 262.144 tokens para mantener visibles multiples ficheros y el historial de la tarea.
- Revision de pull requests automatizada: con la opcion de thinking preservation, puede mantener el hilo de razonamiento entre iteraciones de revision sin repetir contexto, reduciendo el coste de tokens en cada ciclo.
- Desarrollo de frontend asistido: la model card destaca mejoras en flujos de frontend, por lo que encaja en tareas de generacion y modificacion de componentes UI a partir de descripciones o capturas.
- Analisis de documentacion tecnica con imagenes: al ser image-text-to-text, puede procesar diagramas de arquitectura, capturas de errores o mockups junto con texto para generar explicaciones o codigo.
- Agentes de soporte tecnico multi-turno: su ventana de contexto larga permite mantener conversaciones extensas con historial de incidencias y documentacion adjunta.
- Procesamiento de bases de codigo extensas: la extension de contexto hasta 1.010.000 tokens permite ingerir repositorios grandes o documentacion completa en una sola sesion, aunque el coste computacional crece con la longitud.
- Evaluacion comparativa de variantes ajustadas: al ser un checkpoint derivado, puede usarse para comparar el efecto del ajuste RL/SFT frente al base Qwen3.6-27B en tareas concretas, siempre que se valide su comportamiento.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo base Qwen3.6-27B, no al checkpoint maemm-27b-rl-from-sft-4m-checkpoint, cuyo rendimiento especifico no esta documentado.

| Benchmark | Qwen3.5-27B | Qwen3.5-397B-A17B | Gemma4-31B | Claude 4.5 Opus | Qwen3.6-35B-A3B | Qwen3.6-27B |
|---|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 76,2 | 52,0 | 80,9 | 73,4 | 77,2 |
| SWE-bench Pro | 51,2 | 50,9 | 35,7 | 57,1 | 49,5 | 53,5 |
| SWE-bench Multilingual | 69,3 | 69,3 | 51,7 | 77,5 | 67,2 | no disponible en el extracto |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 27.781 millones de parametros en precision FP16 requiere aproximadamente 55,6 GB solo para pesos, mas memoria para KV cache y activaciones; en cuantizacion de 8 bits rondaria 27,8 GB y en 4 bits unos 13,9 GB, aunque estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar despliegue en A100 80 GB, H100 80 GB o configuraciones multi-GPU; en consumer, una RTX 4090 de 24 GB solo seria viable con cuantizacion agresiva, extremo no verificado.
- Opciones de despliegue: la model card del base indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maemm-27b-rl-from-sft-4m-checkpoint | 27,78 B | 262.144 (ext. 1.010.000) | no disponible | apache-2.0 | Hugging Face |
| Qwen3.6-27B (base) | 27 B | 262.144 (ext. 1.010.000) | 77,2 | apache-2.0 | Hugging Face |
| Qwen3.5-27B | 27 B | no disponible | 75,0 | no disponible | Hugging Face |
| Gemma4-31B | 31 B | no disponible | 52,0 | no disponible | no disponible |

## Limitaciones y advertencias

- La model card del repositorio es la del modelo base Qwen3.6-27B; no documenta el proceso de RL ni el checkpoint SFT de origen, por lo que el comportamiento real del checkpoint puede diferir del base de forma no caracterizada.
- No se han publicado resultados de benchmarks especificos para este checkpoint; los datos de la tabla corresponden al base.
- Riesgo de alucinacion no cuantificado para este ajuste concreto; conviene validar en tareas criticas.
- Idiomas soportados no documentados; el soporte multilingue del base esta implicito por el benchmark SWE-bench Multilingual pero no detallado.
- Licencia apache-2.0 segun el repositorio, con enlace a la licencia del modelo base Qwen3.6-27B; verificar los terminos del fichero LICENSE antes de uso comercial.
- El repositorio ocupa 485,9 GB, lo que implica requisitos de almacenamiento considerables para su descarga.
- Al ser un checkpoint de un usuario individual (ceselder) con 0 descargas y 0 likes, no hay evidencia de validacion por parte de la comunidad.
- La ventana de contexto extendida hasta 1.010.000 tokens incrementa de forma significativa el coste de memoria y computo; su uso practico requiere infraestructura adecuada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ceselder/maemm-27b-rl-from-sft-4m-checkpoint
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Blog de Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Qwen Chat: https://chat.qwen.ai
