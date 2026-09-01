# JamieBradfield/qwen3.8-9b-hermes-fc-tooluse-GGUF

## Resumen

El modelo `JamieBradfield/qwen3.8-9b-hermes-fc-tooluse-GGUF` es una versión cuantizada en formato GGUF del fine-tuning `qwen3.8-9b-hermes-fc-tooluse`, desarrollado por JamieBradfield sobre la base `Empero/Qwen3.8-9B`. Está especializado en function calling y tool use, y ha sido ajustado mediante QLoRA con datos procedentes de sesiones de agente del propio autor y fuentes públicas con licencia abierta (SWE-rebench, APIGen-MT-5k, When2Call). El modelo se distribuye con una cuantización ROCmFPX orientada a acelerar la inferencia en GPUs AMD RDNA3, aunque también es posible convertir el merge BF16 original para uso portable.

Con 9.195 millones de parámetros, este modelo se posiciona como una opción ligera para tareas de agente y llamada a herramientas en entornos con recursos limitados. La cuantización incluida (`Q4_0_ROCMFP4_FAST`) reduce el tamaño a 4,69 GB, lo que permite ejecutarlo en GPUs de consumo con 12 GB de VRAM, como la RX 7700 XT utilizada por el autor. Además, conserva la cabeza de predicción multi-token (MTP) del modelo base, lo que habilita decodificación especulativa en builds compatibles.

La relevancia de este modelo radica en su enfoque práctico: está diseñado para ser desplegado en entornos de producción donde la llamada a funciones y el razonamiento multi-paso son críticos, y su licencia Apache-2.0 facilita su uso comercial. Sin embargo, la documentación disponible es limitada y se basa principalmente en la model card del autor, por lo que algunos datos técnicos (arquitectura exacta, contexto nativo, benchmarks estándar) no están confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen3.8, presumiblemente transformer) |
| Parametros totales | 9.195.119.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor menciona pruebas a 64k y 245k, pero no se especifica el máximo nativo) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantización ROCmFPX) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada, pero al estar basado en `Empero/Qwen3.8-9B`, se asume una arquitectura transformer estándar con atención multi-cabeza, similar a la familia Qwen. El modelo ha sido fine-tuneado con QLoRA (cuantización de bajo rango) para mejorar sus capacidades de function calling y tool use. Los datos de entrenamiento provienen de sesiones de agente del propio autor (etiquetadas como "Hermes") y de conjuntos públicos con licencia abierta, como SWE-rebench, APIGen-MT-5k y When2Call. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

Una característica destacable es la preservación de la cabeza MTP (multi-token prediction) del modelo base, que permite la decodificación especulativa con `--spec-type draft-mtp` en builds que lo soporten. Esto puede mejorar la latencia en tareas de generación larga, aunque no se proporcionan métricas concretas de rendimiento.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés.
- Function calling y tool use: el modelo está específicamente entrenado para invocar herramientas y funciones externas de forma estructurada.
- Soporte para agentes y razonamiento multi-paso, según la evaluación del autor (17/20 en pruebas held-out de nivel 1).
- Decodificación especulativa mediante la cabeza MTP preservada, en builds compatibles.
- Optimización para inferencia en GPUs AMD ROCm mediante cuantización ROCmFPX.
- No se documentan capacidades de visión, audio u otras modalidades.

## Casos de uso

- Asistentes conversacionales con integración de herramientas: el modelo puede gestionar diálogos multi-turno donde necesita consultar APIs, bases de datos o servicios externos, gracias a su entrenamiento específico en function calling.
- Automatización de tareas de agente: puede ejecutar secuencias de acciones (por ejemplo, leer un correo, buscar información, actualizar un registro) siguiendo instrucciones de alto nivel.
- Generación de código con llamada a funciones: útil en entornos de desarrollo donde se requiere que el modelo genere código que invoque librerías o servicios, con formato de salida estructurado.
- Sistemas de soporte técnico: puede clasificar incidencias, extraer datos de tickets y llamar a herramientas de gestión (CRM, ticketing) de forma automatizada.
- Pruebas de concepto en entornos AMD: su cuantización ROCmFPX lo hace adecuado para validar despliegues en GPUs RDNA3 sin necesidad de hardware NVIDIA.
- Investigación en fine-tuning para tool use: sirve como referencia para estudiar el impacto de QLoRA y cuantización en tareas de function calling.

## Benchmarks y rendimiento

La model card del autor reporta resultados de una batería de 40 pruebas propia, no benchmarks estándar (MMLU, HumanEval, etc.). Los datos disponibles son:

| Prueba | Resultado |
|---|---|
| Held-out tier-1 (fired) | 17/20 |
| Held-out tier-1 (todos_ok) | 16/20 |
| Tier-2 | 7/10 |
| Tier-3 | dentro del bar de v27 |

Estos resultados se reproducen de forma idéntica en dos ejecuciones de validación. No se proporcionan comparaciones con otros modelos ni métricas estándar de la industria.

## Requisitos de hardware

- VRAM estimada: 4,69 GB para el archivo GGUF, pero se recomienda al menos 12 GB para contexto largo (el autor usa una RX 7700 XT con 12 GB).
- GPU recomendadas: AMD RDNA3 (RX 7700 XT, RX 7800 XT, etc.) para aprovechar la cuantización ROCmFPX. También puede ejecutarse en GPUs NVIDIA mediante conversión del BF16 original.
- Contexto: el autor sirve a 64k de contexto con KV cache q8_0/turbo3, logrando ~5,5x de velocidad de decodificación frente a 245k. No se especifica el máximo soportado.
- Opciones de despliegue: llama.cpp (fork `llama-rocmfpx`), vLLM, Ollama (si se convierte a formato estándar), TGI.
- Latencia y throughput: no se proporcionan métricas cuantitativas más allá de la comparación de velocidad mencionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (fine-tunes de Qwen para function calling). Se puede mencionar que existen otros fine-tunes de Qwen3.8-9B del mismo autor (por ejemplo, `qwen3.8-9b-hermes-fc-balanced` y `qwen3.8-9b-hermes-fc-real-traces`), pero no se dispone de benchmarks comparativos. La información es insuficiente para establecer una comparativa objetiva.

## Limitaciones y advertencias

- La documentación es escasa: no se especifican la arquitectura exacta, el contexto nativo máximo ni los detalles del dataset de entrenamiento.
- El modelo está entrenado únicamente en inglés; su rendimiento en otros idiomas no está garantizado.
- La cuantización ROCmFPX es específica para AMD RDNA3; en otras plataformas puede requerir conversión a formatos estándar (Q4_K_M, etc.).
- El contexto largo (245k) degrada significativamente la velocidad de decodificación; se recomienda usar 64k o menos para producción.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la comparación con otros modelos es limitada.
- Riesgo de alucinación y sesgos no evaluados; se recomienda validar en casos de uso críticos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base `Empero/Qwen3.8-9B` debe verificarse para confirmar que no tiene restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-tooluse-GGUF
- Repositorio del merge BF16 (parent): https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-tooluse
- Modelo base: https://huggingface.co/Empero/Qwen3.8-9B
- Variante balanced: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-balanced-GGUF
- Variante real-traces: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-real-traces
- Página en LLM Explorer (real-traces): https://llm-explorer.com/model/JamieBradfield%2Fqwen3.8-9b-hermes-fc-real-traces,2TEFMrMU8nw0D9NfSFX1GH
- Página en LLM Explorer (function-calling-v1): https://llm-explorer.com/model/JamieBradfield%2Fqwen3.8-9b-hermes-function-calling-v1,6SuH8bRjECvBVYmLBTrCbl
- Página en FriendliAI (balanced): https://friendli.ai/models/JamieBradfield/qwen3.8-9b-hermes-fc-balanced
