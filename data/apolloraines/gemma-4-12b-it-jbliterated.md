# ApolloRaines/Gemma-4-12B-it-Jbliterated

## Resumen

Gemma-4-12B-it-Jbliterated es una variante del modelo instructivo Gemma 4 12B de Google, modificada mediante una técnica de edición de pesos llamada "Jbliteration" (una forma de abliteración multi-dirección basada en SVD). El objetivo es eliminar los comportamientos de rechazo y las respuestas evasivas del modelo original, manteniendo intactas sus capacidades. Según las mediciones del autor, la precisión en MMLU se mantiene exactamente en 78,42% (sin pérdida respecto a la base), mientras que la tasa de respuesta directa ante prompts sostenidos pasa de aproximadamente 1% a 89%.

El modelo conserva la arquitectura Gemma 4 Unified (48 capas transformer, hidden size 3840, atención por grupos de consultas con 16 cabezas de consulta y 8 de clave/valor) y los 11.959.730.224 parámetros del modelo original. Se distribuye en formato safetensors (bf16) y GGUF cuantizado, con una versión v2 que corrige un defecto residual en el canal de razonamiento. Está pensado para quienes necesitan un asistente conversacional directo, sin filtros de seguridad visibles, manteniendo el rendimiento académico del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified_text (transformer, 48 capas, hidden size 3840, GQA 16/8) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea 8192, pero no se confirma el maximo) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Gemma Terms of Use (licencia gemma) |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12b-it-qat-q4_0-unquantized, un Gemma 4 12B instructivo con arquitectura "Gemma 4 Unified". Esta arquitectura emplea un transformer denso con atención por grupos de consultas (16 cabezas de consulta, 8 de clave/valor), 48 capas y una dimensión oculta de 3840. El autor no modifica la arquitectura ni realiza entrenamiento adicional: aplica una edición de pesos basada en descomposición SVD multi-direccional que identifica y elimina direcciones de rechazo en las proyecciones de salida de cada capa, con una ponderación localizada por profundidad (una ventana suave sobre las capas en lugar de una edición uniforme). El resultado es un cambio puramente geométrico en los pesos, sin retraining, manteniendo el dtype base bf16.

La técnica busca que el modelo trate todas las formulaciones de un mismo tema de manera equivalente y responda "sobre el fondo" en lugar de activar patrones de rechazo por palabras clave. El autor reporta que la alineación de registros se ajustó para no sacrificar precisión por franqueza. La versión v1 aquí descrita conserva un defecto residual: en prompts que activan el modo razonamiento, el modelo tiende a clasificar internamente la seguridad en su canal de pensamiento y a veces entra en un bucle sin producir respuesta. La versión v2 añade un ajuste fino supervisado con LoRA sobre trazas auto-reparadas para reducir ese comportamiento.

## Capacidades

- Generacion de texto conversacional y de instrucciones, con respuestas directas y sin rechazos visibles (comportamiento "uncensored").
- Razonamiento y seguimiento de instrucciones multi-turno, aunque en v1 puede fallar en prompts que activan el modo razonamiento (ver limitaciones).
- Capacidad de mantener el rendimiento academico del modelo base: MMLU 78,42% sin perdida medida.
- Soporte de chat mediante plantilla de conversacion estandar (apply_chat_template).
- Compatible con cuantizacion GGUF para despliegue ligero con llama.cpp.
- No se menciona soporte explicito de tool calling, vision, audio ni otros modos especiales en la informacion disponible.

## Casos de uso

- Asistente conversacional sin filtros: el modelo responde directamente a preguntas que otros modelos rechazarian por politicas de seguridad, util para entornos de investigacion o simulacion de dialogos donde se necesita una respuesta sin evasivas.
- Generacion de contenido creativo y narrativo: su capacidad de seguir instrucciones y su falta de rechazo permiten explorar temas sensibles o controvertidos en ficcion, guiones o material educativo sin interrupciones.
- Analisis de texto y extraccion de informacion: puede procesar documentos y responder preguntas sobre ellos de forma directa, sin introducir advertencias de seguridad que contaminen la respuesta.
- Desarrollo de prototipos de agentes conversacionales: al no rechazar peticiones, es adecuado para probar flujos de dialogo donde se requiere que el modelo siempre produzca una respuesta, incluso ante entradas ambiguas o provocadoras.
- Evaluacion de tecnicas de alineacion y seguridad: sirve como modelo de referencia para estudiar como la abliteracion afecta al comportamiento, comparando con el modelo base y con otras variantes.
- Despliegue en hardware limitado: gracias a los quants GGUF (Q4_K_M recomendado para 8-12 GB) y a la herramienta DeepswapLLM, puede ejecutarse en GPUs de consumo o incluso en sistemas con poca VRAM, manteniendo una calidad aceptable.

## Benchmarks y rendimiento

El autor proporciona mediciones propias de su harness de evaluacion, reportadas como puntos definitivos sobre los pesos liberados:

| Metrica | Modelo base | Este modelo |
|---|---|---|
| MMLU (570 items, accuracy) | 78,42% | 78,42% |
| Cambio en MMLU vs. base | — | 0,00 puntos |
| Tasa de respuesta directa (prompts held-out) | ~1% | ~89% |

No se han publicado otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible. La tasa de respuesta directa se mide sobre un conjunto de prompts no utilizado durante el calibrado, lo que indica generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el quant Q4_K_M (6,9 GB) es recomendado por el autor para tarjetas de 8-12 GB; LLM Explorer indica 7,4 GB de VRAM para este modelo (probablemente con ese quant).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M; para BF16 completo se necesitan ~24 GB (el archivo GGUF BF16 pesa 22,2 GB).
- En consumer GPU: si, con cuantizacion Q4_K_M o Q5_K_M en tarjetas como RTX 3060/4060/4070 (8-12 GB). Para Q8_0 (11,8 GB) se requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp (build master b10176 o superior), transformers con trust_remote_code, y DeepswapLLM para ejecutar el modelo completo en GPUs pequenas mediante streaming de capas entre GPU, RAM y disco.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Notas |
|---|---|---|---|---|---|
| google/gemma-4-12b-it (base) | 11,96 B | No disponible | 78,42% | Gemma | Modelo original con rechazos y respuestas evasivas |
| ApolloRaines/Gemma-4-12B-it-Jbliterated (v1) | 11,96 B | No disponible | 78,42% | Gemma | Edicion de pesos, sin rechazos, defecto en razonamiento |
| ApolloRaines/Gemma-4-12B-it-Jbliterated-v2 | 11,96 B | No disponible | ~77,4% (estimado, ~1 punto menos) | Gemma | Anade LoRA SFT, reduce el defecto de razonamiento |

No se dispone de datos comparativos con otros modelos de tamano similar (p. ej., Llama 3.1 8B, Mistral 7B) en la informacion proporcionada.

## Limitaciones y advertencias

- La version v1 presenta un defecto residual: en prompts que activan el modo razonamiento, el modelo tiende a clasificar internamente la seguridad en su canal de pensamiento y puede entrar en un bucle sin producir respuesta. El autor recomienda usar la v2 para nuevos proyectos.
- Al ser un modelo "uncensored", puede generar contenido inapropiado, ofensivo o peligroso si se le pide. No debe usarse en aplicaciones donde se requiera moderacion automatica.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en temas especializados.
- Solo soporta ingles de forma confirmada; el rendimiento en otros idiomas no esta documentado.
- La licencia Gemma Terms of Use permite uso comercial, pero impone restricciones (p. ej., no usar para ciertos fines prohibidos). El autor menciona tambien Apache 2.0 en la nota, pero la licencia principal es la de Gemma.
- Requiere una build reciente de llama.cpp (b10176 o superior) para cargar los GGUF; versiones antiguas no funcionaran.
- No se garantiza la ausencia total de rechazos: el autor pide feedback sobre casos donde el modelo aun duda o evade.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Gemma-4-12B-it-Jbliterated
- Version v2: https://huggingface.co/ApolloRaines/Gemma-4-12B-it-Jbliterated-v2
- Modelo base: https://huggingface.co/google/gemma-4-12b-it-qat-q4_0-unquantized
- Herramienta DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Ficha en LLM Explorer: https://llm-explorer.com/model/ApolloRaines%2FGemma-4-12B-it-Jbliterated,67Qomprts2H1ISoT5kdk23
- Grafo de arquitectura (hfviewer): https://hfviewer.com/ApolloRaines/Gemma-4-12B-it-Jbliterated
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
