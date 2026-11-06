# richardyoung/Qwen3.8-27B-DiM-heretic

## Resumen

Qwen3.8-27B-DiM-heretic es una variante "decensored" (abliterada) del modelo Qwen3.8-27B, desarrollada por el usuario richardyoung mediante la herramienta Heretic v2.0.0. El modelo base, Qwen3.8-27B, es un modelo denso de 27 000 millones de parametros de la familia Qwen, con arquitectura causal con codificador de vision, disenado para tareas de codigo, trabajo profesional, investigacion y agentes de largo horizonte. Esta variante elimina parcialmente los mecanismos de rechazo del modelo original mediante una intervencion en los pesos (abliteration) que reduce las negativas ante peticiones potencialmente sensibles.

La relevancia de esta ficha radica en que combina dos elementos: por un lado, las capacidades tecnicas del Qwen3.8-27B (ventana de contexto nativa de 262 144 tokens, extensible a 1 000 000, soporte nativo de imagen y video, control flexible del modo de razonamiento) y, por otro, la modificacion de comportamiento de la variante heretic, que reduce las negativas de 98/100 a 47/100 en la evaluacion del autor, con una divergencia KL de 0.0530 respecto al original. El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors para transformers, con compatibilidad declarada con vLLM, SGLang y TokenSpeed.

El modelo esta pensado para desarrolladores e investigadores que necesitan un modelo multimodal de 27B con contexto muy largo y comportamiento menos restrictivo, pero debe evaluarse con cautela: la abliteration puede degradar la coherencia en ciertos dominios y la informacion publica sobre esta variante concreta es muy limitada (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; capas hibridas Gated DeltaNet + Gated Attention |
| Parametros totales | 27 356 728 560 (27.36B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Datos adicionales de arquitectura: hidden dimension 5120, 64 capas, token embedding 248 320 (padded), layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), FFN intermedio 17 408, MTP (Multi-Token Prediction) entrenado con multiples pasos. Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimension de cabeza 128. Gated Attention con 24 cabezas para Q y 4 para KV, dimension de cabeza 256, RoPE dimension 64.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina capas de atencion lineal (Gated DeltaNet) con capas de atencion completa (Gated Attention) en un patron de 3:1 (tres bloques DeltaNet por cada bloque de atencion completa). Esta combinacion busca reducir el coste computacional de la atencion en contextos largos manteniendo la calidad en tareas que requieren recuperacion precisa de informacion. Incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos, una tecnica que puede acelerar la decodificacion especulativa. El modelo incluye un codificador de vision nativo para comprension de imagen y video.

El entrenamiento del modelo base incluye fases de pre-entrenamiento y post-entrenamiento, con mejoras declaradas en codigo, trabajo profesional, investigacion y tareas agenticas de largo horizonte. No se dispone del numero exacto de tokens de entrenamiento ni de la composicion del dataset. La variante heretic aplica abliteration sobre los pesos del modelo original: se identifican direcciones de rechazo y se modifican pesos en `attn.o_proj` y `mlp.down_proj` con los parametros documentados (direction_index 51.31, max_weight 1.20 en atencion, min_weight 0.34, etc.). El proceso es reproducible segun el autor, con scripts en el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable por peticion.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retencion de contexto de razonamiento historico con `preserve_thinking`.
- Comprension nativa de imagen y video (diagramas STEM, documentos, videos de hasta una hora).
- Generacion de codigo y tareas de ingenieria de software.
- Ejecucion de agentes autonomos con planificacion y manejo de retroalimentacion del entorno.
- Soporte de tool calling / function calling (declarado en la model card del modelo base mediante compatibilidad con harnesses y herramientas de desarrollo).
- Capacidades multilingues: no se detallan idiomas en la informacion disponible.
- Comportamiento menos restrictivo que el modelo original (47/100 negativas frente a 98/100), segun la evaluacion del autor.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262 144 tokens nativos, manteniendo el hilo de la conversacion y recuperando informacion de mensajes previos sin truncamiento.
- Analisis de documentos extensos y contratos: con hasta 1 000 000 de tokens de contexto extensible, puede procesar manuales, expedientes o bases de conocimiento completas en una sola pasada.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests y correccion de errores, con modo thinking para tareas complejas.
- Agentes autonomos de largo horizonte: la mejora declarada en planificacion y manejo de retroalimentacion del entorno lo hace adecuado para tareas multi-paso como automatizacion de flujos de trabajo o investigacion web asistida.
- Analisis de video y documentos visuales: al ser un modelo nativo vision-language, puede transcribir y razonar sobre diagramas tecnicos, capturas de pantalla o videos de hasta una hora, util en soporte tecnico y formacion.
- Investigacion asistida: combinacion de contexto largo y razonamiento configurable para sintesis de literatura cientifica, extraccion de datos de papers y generacion de hipotesis.
- Escenarios que requieren menor tasa de rechazo: la variante heretic esta pensada para entornos donde el modelo original rechaza peticiones legitimas (por ejemplo, analisis de contenido sensible en investigacion de seguridad o redaccion creativa sin restricciones), aunque con las cautelas indicadas mas abajo.

## Benchmarks y rendimiento

Resultados publicados por el autor de la variante heretic (comparacion con el modelo original):

| Metrica | Este modelo | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Negativas (refusals) | 47/100 | 98/100 |
| Divergencia KL | 0.0530 | 0 (por definicion) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta variante concreta. La model card del modelo base incluye tablas de benchmarks comparativas con Qwen3.6-27B, pero los datos estan truncados en la informacion proporcionada y no se pueden reproducir con fiabilidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55 GB solo para pesos (27.36B × 2 bytes), mas overhead de KV cache y activaciones; se recomienda 80 GB o mas para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 28-30 GB; en 4 bits: alrededor de 15-18 GB (estimaciones teoricas, no verificadas en la informacion disponible).
- GPU recomendadas: A100 80 GB, H100 80 GB, o multiples GPU consumer para repartir pesos.
- Cabe en GPU consumer: en cuantizacion de 4 bits podria caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con limitaciones de contexto; en precision completa no cabe en consumer.
- Opciones de despliegue: transformers, vLLM, SGLang, TokenSpeed (segun la model card del modelo base). No se confirma soporte de llama.cpp u Ollama para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-DiM-heretic (este) | 27.36B denso | 262 144 (ext. 1M) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.8-27B (original) | 27B denso | 262 144 (ext. 1M) | Apache 2.0 | Hugging Face, modelo base |
| Qwen3.6-27B | 27B denso | No disponible | No disponible | Hugging Face (referenciado en benchmarks del base) |

No se dispone de datos de rendimiento comparativo de benchmarks estandar entre estas variantes en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La abliteration puede degradar la coherencia y la calidad en tareas que requieren matices eticos o de seguridad; la divergencia KL de 0.0530 indica un cambio medible en la distribucion de salida respecto al original.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa, especialmente en contextos largos o dominios especializados.
- La reduccion de negativas (47/100) implica que el modelo puede generar contenido inapropiado o danino; no se recomienda su uso en produccion orientada al usuario final sin filtros adicionales.
- Idiomas soportados no documentados en la informacion disponible; el modelo base Qwen suele tener buen soporte multilingue, pero no se confirma para esta variante.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado.
- Informacion publica muy limitada: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes.
- El contexto extensible a 1 000 000 tokens puede requerir configuracion adicional y hardware especifico; no se detalla el metodo de extension.
- No se dispone de informacion sobre sesgos especificos ni sobre el proceso de evaluacion de la variante heretic mas alla de la metrica de negativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen3.8-27B-DiM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteration): https://heretic-project.org
- Qwen Cloud (servicio gestionado del modelo base): https://www.qwencloud.com
- Overview de Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
