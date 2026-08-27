# KBBridge/KBBridge-v3

## Resumen

KBBridge-v3 es un fine-tune del modelo Qwen/Qwen3.8-27B, desarrollado por KBBridge, especializado en la generación y comprensión de código GeneXus en su formato nativo de exportación `.gxSource`. El problema que resuelve es concreto: los modelos de frontera, incluso con documentación inyectada, producen salida sintácticamente inválida en este formato (tasa de parseo de 0,5–3,1 %), mientras que KBBridge lo escribe de forma nativa y puede ejecutarse en hardware propio sin enviar el código de la base de conocimiento a APIs externas.

El modelo tiene 27 356 millones de parámetros, una ventana de contexto de 262 144 tokens y una arquitectura híbrida con 64 capas (48 Gated DeltaNet y 16 de atención completa). Se distribuye con licencia Apache 2.0 y soporta español e inglés. Está pensado para asistir a desarrolladores de GeneXus en tareas de generación, explicación, completado y documentación de objetos, aunque no es un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido, 64 capas (48 Gated DeltaNet + 16 full-attention) |
| Parametros totales | 27 356 728 560 |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | bf16 (este repo); FP8 y GGUF (4-bit) en repos separados |
| Idiomas soportados | es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 19 shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, que ya incorpora una arquitectura híbrida con capas de atención lineal (Gated DeltaNet) y capas de atención completa. El fine-tune se realizó sobre el corpus de GeneXus, que en v3 es cuatro veces mayor que en v2 y sin el límite de KB por muestra. Como teacher se usó la versión v2 del propio modelo. No se especifica el método de entrenamiento más allá de fine-tune supervisado; no hay mención a RLHF o DPO.

La model card indica que el fine-tune no tocó la torre de visión del modelo base (333 tensores) ni la cabeza de multi-token-prediction (15 tensores), que se mantienen sin cambios. El contexto nativo de 262 144 tokens se conserva íntegro.

## Capacidades

- Generación de objetos GeneXus en formato `.gxSource`: Procedures, Transactions, Data Providers, SDTs y WebPanels.
- Explicación de código GeneXus existente, con análisis de sintaxis y semántica del formato.
- Completado de código en el contexto de una base de conocimiento.
- Respuesta a preguntas sobre documentación y buenas prácticas de GeneXus.
- Soporte multilingüe limitado a español e inglés.
- No se ha verificado soporte de tool calling ni de razonamiento multi-paso; el modo de razonamiento del chat template de Qwen debe desactivarse para obtener respuestas completas.

## Casos de uso

- Generación de objetos GeneXus en producción: un desarrollador pide "un Procedure que sume dos números in `.gxSource` format" y el modelo devuelve el objeto completo, listo para pegar en el IDE. Requiere `max_tokens` ≥ 4096 porque un objeto consume ~340 tokens por KB de fuente.
- Explicación de código legacy: pegar un `.gxSource` existente y pedir una descripción de su lógica, parámetros y flujo, útil para mantenimiento o para incorporar nuevos desarrolladores al equipo.
- Completado de código en el editor: integrado como backend de autocompletado, sugiere continuaciones sintácticamente válidas del objeto en edición, reduciendo errores de formato.
- Formación de desarrolladores junior: el modelo responde preguntas sobre sintaxis, estructuras de datos y patrones comunes de GeneXus, sin necesidad de consultar documentación externa.
- Migración de código desde otros lenguajes: aunque no es su foco, puede traducir lógica simple a GeneXus si se le indica el formato, siempre que la lógica no dependa de APIs específicas de la base de conocimiento.
- Auditoría de calidad de código: analizar objetos existentes para detectar inconsistencias de formato o firmas de parámetros, apoyándose en su conocimiento de la sintaxis oficial.

## Benchmarks y rendimiento

La model card reporta resultados sobre 580 elementos reservados (191 de generación de código, 329 de opción múltiple y 60 de modelo de datos), validados con el parser ANTLR oficial de GeneXus. El protocolo fue temperatura 0,1, razonamiento desactivado y concurrencia 8.

| Metrica | v2 | v3 | Diferencia |
|---|---|---|---|
| parseRate (sintaxis valida) | 89,0 | 84,8 | −4,2 |
| parmMatch (firma exacta) | 78,6 | 78,6 | = |
| MCQ (conocimiento GeneXus) | 76,0 | 79,0 | +3,0 |
| methodValidity | 90,0 | 91,1 | +1,1 |

En generalización a bases de conocimiento no vistas, v3 obtiene un 87,4 % de parseRate frente al 84,8 % en las KB de entrenamiento, lo que indica una mejor generalización relativa. La comparación con modelos de frontera se realizó inyectando ~21 600 tokens de documentación en cada petición a esos modelos, mientras que KBBridge se ejecutó sin ella; inyectar esa documentación a KBBridge empeora su parseRate (76,4 → 73,3). En la comparación de cuantización, el build de 4 bits es prácticamente indistinguible del bf16 (parseRate 93,0 vs 93,6 sobre 171 elementos, excluyendo los que alcanzaron el límite de tokens).

## Requisitos de hardware

- Pesos bf16: 51 GB en disco, requieren al menos una GPU con 80 GB de VRAM (A100, H100) o varias GPUs en paralelo para servir con transformers.
- Versión FP8: 29 GB, cabe en una GPU de 32 GB (A100 40 GB, RTX 6000 Ada) o en dos de 16 GB.
- Versión GGUF 4-bit: tamaño estimado entre 15 y 20 GB, ejecutable en una RTX 4090 (24 GB) o similar mediante llama.cpp, LM Studio u Ollama.
- Opciones de despliegue: vLLM (recomendado, con `--reasoning-parser qwen3` y `chat_template_kwargs: {"enable_thinking": false}`), transformers, llama.cpp, LM Studio.
- No se han publicado datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No existen otros modelos públicos especializados en GeneXus conocidos. La comparación más relevante es con la versión anterior (v2) y con el modelo base Qwen3.8-27B.

| Modelo | Parametros | Contexto | Especializacion | parseRate (GeneXus) |
|---|---|---|---|---|
| KBBridge-v3 | 27,4 B | 262 144 | GeneXus `.gxSource` | 84,8 |
| KBBridge-v2 | 27,4 B (estimado) | 262 144 | GeneXus `.gxSource` | 89,0 |
| Qwen3.8-27B (base) | 27,4 B | 262 144 | Generalista | no disponible (no conoce el formato) |

La model card advierte que la caída de parseRate en v3 no puede atribuirse a un único cambio (base, corpus o teacher) porque se modificaron tres variables a la vez sin grupo de control.

## Limitaciones y advertencias

- No conoce ninguna base de conocimiento específica: solo ha aprendido el estilo y la sintaxis del formato, no el contenido de KBs concretas. Hay que pegar el código relevante en el prompt.
- No es un modelo de propósito general; su uso fuera de GeneXus produce resultados poco fiables.
- Requiere desactivar el razonamiento del chat template de Qwen (`enable_thinking: false`), o las respuestas pueden quedar vacías o truncadas.
- Es necesario pedir explícitamente el formato `.gxSource` en el prompt; sin esa indicación, el modelo tiende a generar SQL genérico.
- El consumo de tokens es alto (~340 tokens por KB de fuente), por lo que `max_tokens` debe ser ≥ 4096 para objetos completos.
- Riesgo de alucinación en sintaxis: aunque el parseRate es alto, no es perfecto; siempre hay que validar en el IDE de GeneXus.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no sustituye la validación oficial en el entorno de desarrollo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KBBridge/KBBridge-v3
- Repositorio GGUF: https://huggingface.co/KBBridge/KBBridge-v3-GGUF
- Repositorio FP8: https://huggingface.co/KBBridge/KBBridge-v3-FP8
- Sitio web de KBbridge: https://kbbridge.com/
- Blog sobre control de datos y privacidad: https://kbbridge.com/blog/your-knowledge-base-ai-and-control
- Paquete PyPI (servidor MCP relacionado): https://pypi.org/project/kbbridge/
