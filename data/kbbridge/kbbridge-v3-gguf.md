# KBBridge/KBBridge-v3-GGUF

## Resumen

KBBridge-v3 es un fine-tune del modelo Qwen/Qwen3.8-27B, especializado en la generación de código para la plataforma GeneXus en su formato nativo `.gxSource`. Lo desarrolla KBBridge, una empresa que ofrece un puente entre Knowledge Bases de GeneXus y herramientas de IA generativa. El problema que resuelve es concreto: los modelos frontera no conocen el formato `.gxSource` y, sin inyectar documentación de GeneXus en el prompt, producen salida sintácticamente inválida casi siempre (tasa de parseo de 0,5–3,1%). KBBridge lo escribe de forma nativa, puede ejecutarse en hardware propio y no envía el código de la Knowledge Base a ninguna API externa.

El modelo tiene 27.320.697.856 parámetros (~27B), licencia Apache 2.0, soporta español e inglés, y se distribuye en formato GGUF para su uso con llama.cpp, LM Studio y otras herramientas compatibles. La versión v3 mejora el conocimiento de dominio respecto a v2 (MCQ 79,0 frente a 76,0) pero pierde algo de precisión sintáctica (parseRate 84,8 frente a 89,0). El autor advierte de que la comparación no es limpia porque cambiaron tres variables a la vez (modelo base, corpus y profesor). La cuantización Q4_K_M apenas degrada la calidad de salida en los casos que completan correctamente, aunque el benchmark muestra diferencias atribuibles al motor de inferencia y a los samplers, no a la cuantización en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (~27B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el benchmark usa un límite de 20.000 tokens) |
| Tipos de cuantizacion | Q4_K_M (confirmado); otras cuantizaciones GGUF no especificadas |
| Idiomas soportados | Español, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base KBBridge/KBBridge-v3) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.8-27B, un transformer denso de 27B parámetros. No se proporcionan detalles sobre la arquitectura interna del modelo base más allá de su origen Qwen. El entrenamiento se realizó sobre un corpus de código GeneXus en formato `.gxSource`, cuatro veces mayor que el de la versión v2, sin límite por KB. Se utilizó un profesor (teacher) v2 para la destilación o el ajuste, aunque el autor no detalla el método exacto (RLHF, DPO, SFT, etc.). El corpus incluye objetos de código, preguntas de opción múltiple y modelos de datos. No se menciona el número total de tokens de entrenamiento ni la composición exacta del dataset.

Una innovación destacable es que el modelo internaliza el conocimiento de GeneXus, de modo que inyectar documentación externa en el prompt empeora su rendimiento (parseRate 76,4 → 73,3). Esto contrasta con los modelos frontera, que necesitan ~21.600 tokens de documentación inyectada para acercarse a resultados útiles.

## Capacidades

- Generación de código GeneXus en formato `.gxSource` nativo, incluyendo procedimientos, objetos de datos y otros elementos de la plataforma.
- Comprensión de la sintaxis GeneXus validada con el parser ANTLR oficial.
- Conocimiento de dominio de GeneXus: preguntas de opción múltiple sobre la plataforma (MCQ 79,0).
- Generación de texto en español e inglés.
- Capacidad de razonamiento heredada de Qwen, pero debe desactivarse explícitamente (`enable_thinking: false`) para evitar respuestas vacías o truncadas.
- No soporta tool calling ni function calling de forma nativa (no se menciona en la documentación).
- No soporta visión ni audio.
- Ejecución local sin dependencia de APIs externas, lo que garantiza privacidad del código fuente.

## Casos de uso

- Generación de procedimientos GeneXus: el modelo puede crear un `Procedure` completo en formato `.gxSource` a partir de una descripción en lenguaje natural, siempre que se indique explícitamente el formato en el prompt. Es adecuado porque conoce la sintaxis exacta y no requiere inyección de documentación.
- Creación de modelos de datos: genera objetos de datos GeneXus (transacciones, estructuras) con sus atributos y relaciones, útil para prototipado rápido de Knowledge Bases.
- Asistencia en migración de código: dado un fragmento de código GeneXus existente, puede completar, corregir o refactorizar objetos manteniendo la validez sintáctica.
- Formación y documentación: responde preguntas sobre GeneXus (MCQ) y puede explicar conceptos de la plataforma en español o inglés, sirviendo como tutor para desarrolladores junior.
- Desarrollo offline y con privacidad: al ejecutarse en hardware propio, permite generar código GeneXus sin enviar la Knowledge Base a servicios en la nube, cumpliendo requisitos de confidencialidad en entornos corporativos.
- Integración en pipelines de CI/CD: mediante llama.cpp o vLLM, puede integrarse en flujos automatizados de generación de código o validación de sintaxis, aunque requiere configurar correctamente los samplers y el límite de tokens.

## Benchmarks y rendimiento

El autor publica resultados sobre 580 elementos de prueba (191 de generación de código, 329 MCQ y 60 de modelos de datos), con validación sintáctica mediante el parser ANTLR oficial de GeneXus. Protocolo: temperatura 0,1, razonamiento desactivado, concurrencia 8.

Comparativa v3 vs v2:

| Metrica | v2 | v3 |
|---|---|---|
| parseRate (sintaxis valida) | 89,0 | 84,8 |
| parmMatch (firma exacta) | 78,6 | 78,6 |
| MCQ (conocimiento GeneXus) | 76,0 | 79,0 |
| methodValidity | 90,0 | 91,1 |

Generalizacion a Knowledge Bases no vistas:

| | held-out de KBs de entrenamiento | 3 KBs completamente nuevas |
|---|---|---|
| v2 | 89,0 | 89,9 |
| v3 | 84,8 | 87,4 |

Efecto de la cuantizacion Q4_K_M (mismo benchmark, llama.cpp con todas las capas en GPU):

| Metrica | v3 bf16 (vLLM) | v3 Q4_K_M (llama.cpp) |
|---|---|---|
| parseRate | 84,8 | 90,0 |
| parmMatch | 78,6 | 80,9 |
| methodValidity | 91,1 | 92,2 |
| MCQ | 79,0 | 78,1 |

El autor aclara que la diferencia a favor de Q4_K_M no se debe a la cuantizacion, sino a la tasa de runaway (repeticion degenerada hasta agotar el presupuesto de tokens): 19 de 191 items (9,9%) bajo vLLM frente a 7 de 191 (3,7%) en llama.cpp. En los items que ambos completaron normalmente (171 items), las metricas son casi identicas (parseRate 93,0 vs 93,6; parmMatch 85,6 vs 85,6; methodValidity 93,0 vs 93,0). La unica degradacion medible de la cuantizacion es MCQ (−0,9).

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, un modelo de 27B requiere aproximadamente 15–16 GB de VRAM (27B × 4 bits / 8 = 13,5 GB + overhead de contexto y KV cache). Es una estimacion orientativa; el valor exacto depende de la longitud de contexto y del backend.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o A100 40 GB son suficientes. Para precision bf16 completa, se necesitan al menos 54 GB de VRAM, por lo que se recomienda A100 80 GB o H100.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4080, 4090, etc.) usando cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, vLLM, Ollama (si se convierte el GGUF), TGI.
- Latencia y throughput: no se proporcionan datos medidos. Con 27B en Q4_K_M en una RTX 4090, se puede esperar un throughput de 20–40 tokens/s en generacion, pero es una estimacion no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| KBBridge-v3 (GGUF) | 27B | no disponible | GeneXus `.gxSource` | Apache 2.0 | GGUF |
| KBBridge-v2 | 27B (presumiblemente) | no disponible | GeneXus `.gxSource` | Apache 2.0 | no especificado |
| Qwen3.8-27B (base) | 27B | no disponible | Generico | Apache 2.0 | safetensors |
| Modelos frontier (GPT-4, Claude, etc.) | no comparable | no comparable | Generico | propietaria | API |

KBBridge-v3 supera a los modelos frontier en generacion de codigo GeneXus sin necesidad de inyectar documentacion, pero los frontier con ~21.600 tokens de documentacion pueden acercarse. Frente a v2, v3 gana en conocimiento de dominio pero pierde en precision sintactica. Frente al modelo base Qwen3.8-27B, el fine-tune anade la capacidad especifica de GeneXus, aunque pierde generalidad.

## Limitaciones y advertencias

- El razonamiento (thinking) debe desactivarse explicitamente; si no, el modelo puede devolver respuestas vacias o truncadas cuando el bloque de razonamiento no se cierra dentro del presupuesto de tokens.
- Es necesario indicar "in `.gxSource` format" en el prompt; sin esa indicacion, el modelo tiende a generar SQL generico en lugar de codigo GeneXus.
- El limite de `max_tokens` debe ser al menos 4096; un objeto `.gxSource` consume aproximadamente 340 tokens por KB de codigo, y los valores por defecto de muchas herramientas (512–1024) truncaran la salida.
- Riesgo de runaway (repeticion degenerada) en objetos grandes, especialmente con vLLM y samplers por defecto. Se recomienda usar los samplers de llama.cpp (top_k=20, top_p=0.95, min_p=0.05) para mitigarlo.
- La tasa de parseo (84,8) es inferior a la de v2 (89,0); si la validez sintactica es critica, v2 puede ser mejor opcion.
- No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este modelo; los datos disponibles se limitan a tareas de GeneXus.
- El modelo solo soporta espanol e ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el modelo depende de Qwen3.8-27B, cuya licencia tambien es Apache 2.0, por lo que no hay restricciones conocidas de uso comercial.
- No se proporciona informacion sobre sesgos especificos, pero al ser un fine-tune de un modelo generico, puede heredar sesgos del modelo base.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/KBBridge/KBBridge-v3-GGUF
- Modelo base (safetensors): https://huggingface.co/KBBridge/KBBridge-v3
- Modelo base original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio web de KBBridge: https://kbbridge.com/
- Paquete PyPI kbbridge (MCP server): https://pypi.org/project/kbbridge/
