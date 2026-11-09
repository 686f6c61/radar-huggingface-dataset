# feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo-Starlight

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el equipo Qwen (Alibaba). Este repositorio concreto, publicado por el usuario feverdoingwork, no contiene el modelo original: es una cuantización agresiva empaquetada en formato propietario `.starlight.gguf` para el motor de inferencia Starlight, derivada a su vez de la cuantización GSQ-RCO de ISTA-DASLab. El archivo reduce los expertos enrutados de las 48 capas principales a bloques trellis-coded TQ2_T de 2,125 bits por peso, con un tamaño final de 54,68 GiB.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de compresión poco habitual (codificación trellis aplicada a expertos MoE) que permite ejecutar un modelo de ~179.000 millones de parámetros totales en una única tarjeta de 16 GB, a costa de una pérdida medible de fidelidad respecto a BF16. Por otro, advierte de que el artefacto solo funciona con el motor Starlight: no es compatible con Transformers, llama.cpp, Ollama ni LM Studio.

El modelo base emplea 48 capas, 512 expertos por capa y 10 expertos activos por token, e incorpora una cabeza de predicción multi-token (MTP) incluida dentro del propio archivo. El vocabulario se ha podado de 248.320 a 141.312 entradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal en parte de las capas; 48 capas, 512 expertos por capa, 10 activos por token |
| Parametros totales | 179.023.045.248 |
| Parametros activos | no disponible (10 de 512 expertos por token; el numero exacto no se publica) |
| Longitud de contexto | 245.760 tokens en RX 9070 XT; 131.072 tokens en RTX 5070 Ti (medidos con caché de atención q4 y MTP) |
| Tipos de cuantizacion | Expertos enrutados TQ2_T (2,125 bits/peso); tabla de tokens por capa en IQ4_XS e IQ2_S (3,41 bits/peso); atención y router a 6,58 bits/peso; embeddings a 5,41 bits/peso; cabeza MTP con expertos IQ3_S e IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF con extensiones Starlight (`.starlight.gguf`); no compatible con safetensors ni con GGUF estándar de llama.cpp |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con 48 capas, 512 expertos por capa y 10 expertos activos por token. Según el repositorio oficial de Qwen, la versión 3.8 introduce mejoras sistemáticas en cuatro frentes: atención, residuales, embeddings y optimización del entrenamiento, con el objetivo de mejorar capacidad y estabilidad reduciendo coste computacional. La ficha del autor menciona capas de atención lineal junto a las de atención estándar, aunque no detalla su distribución.

Este repositorio no entrena nada: es una cuantización de una cuantización. El punto de partida es el archivo GSQ-RCO de ISTA-DASLab, sobre el que se sustituyen los expertos enrutados de las 48 capas principales por bloques trellis-coded TQ2_T de 2,125 bits por peso, reduciendo esa parte de 40,0 GiB a 29,9 GiB. La tabla de tokens por capa (una fila por token, leída bajo demanda desde RAM o disco) ocupa 20,30 GiB y es la que permite que el lado GPU del archivo baje a 34,38 GiB. El vocabulario se poda eliminando 107.172 tokens, conservando el texto original de cada token restante. La cabeza MTP para decodificación especulativa va incluida en el archivo. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de formato largo, con ventanas de contexto que superan los 245.000 tokens en hardware AMD de 16 GB.
- Razonamiento multi-turno: en las pruebas del autor, un prompt de 236.286 tokens se respondió correctamente (los tres códigos plantados) y el turno de seguimiento se resolvió en 0,8 s.
- Decodificación especulativa mediante la cabeza MTP integrada (3 tokens de borrador en las mediciones publicadas).
- Recuperación de información en contextos muy largos, validada con pruebas de aguja en pajar sobre prompts de más de 124.000 tokens.
- Generación de código y matemáticas: capacidad heredada del modelo base, aunque no se publican evaluaciones específicas para esta cuantización.
- Tool calling y comportamiento de agente: no disponible en la información proporcionada para esta variante concreta.
- Capacidades multilingües: no disponibles; el vocabulario podado puede afectar de forma desigual a idiomas distintos del inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis de repositorios completos en una sola pasada: con 245.760 tokens de contexto en una RX 9070 XT, se puede cargar un monorepo mediano o un conjunto de archivos de configuración y documentación y pedir un resumen arquitectónico o la detección de dependencias circulares sin trocear el contenido.
- Auditoría de contratos y documentación legal: la ventana larga permite procesar expedientes completos y hacer preguntas de seguimiento encadenadas; el turno de seguimiento medido en 0,8 s hace viable la conversación interactiva sobre el mismo documento.
- Asistente de soporte técnico con base de conocimiento extensa: se puede inyectar un manual de producto de decenas de miles de tokens y mantener conversaciones multi-turno sin reindexado, útil en entornos con una sola GPU de 16 GB.
- Procesamiento por lotes en estaciones de trabajo con GPU de consumo: al caber en una RTX 5070 Ti o una RX 9070 XT, permite desplegar tareas de resumen, extracción de entidades y clasificación sobre corpus largos sin acceso a clúster.
- Investigación sobre cuantización extrema: sirve como artefacto de referencia para estudiar el impacto de la codificación trellis en expertos MoE, comparando KLD, top-1 y perplejidad frente a las referencias IQ3_S e IQ3_XXS de ISTA-DASLab.
- Prototipado de agentes con contexto masivo en hardware único: la combinación de MTP y ventana larga permite experimentar con bucles de razonamiento multi-paso sobre trazas extensas, aunque la ausencia de soporte de tool calling documentado limita la integración con APIs externas.
- Evaluación comparativa de motores de inferencia: útil para medir latencia y throughput de Starlight frente a otras soluciones, con la advertencia de que el archivo no es portable a otros motores.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente a los logits BF16 de referencia del modelo base (12 casos de texto, 16.561 posiciones evaluadas, motor Starlight sobre RTX 5070 Ti, 2 de noviembre de 2026):

| # | Archivo | KLD a BF16 | Top-1 igual a BF16 | Perplejidad (BF16: 3,126) | Tamano total (GiB) |
|--:|---|--:|--:|--:|--:|
| 1 | ISTA-DASLab GSQ-RCO IQ3_S (referencia) | 0,193 | 86,71 % | 3,463 | 77,88 |
| 2 | `iq3_s_turbo` | 0,257 | 84,08 % | 3,593 | 64,78 |
| 3 | ISTA-DASLab GSQ-RCO IQ3_XXS (referencia) | 0,276 | 84,05 % | 3,657 | 70,63 |
| 4 | `iq3_xxs_turbo` (este repo) | 0,310 | 83,56 % | 3,566 | 54,68 |
| 5 | `iq3_xxs_turbo_mini` | 0,318 | 83,78 % | 3,508 | 50,03 |

Rendimiento medido (RX 9070 XT, 2 de noviembre de 2026, build temprana del motor):

| Metrica | `iq3_s_turbo` | `iq3_xxs_turbo` |
|---|--:|--:|
| Decodificacion (tokens/s) | 59,6 | 56,4 |
| Lectura de prompt | referencia | ~10 % mas lenta |
| RAM para expertos | 40,0 GiB | 29,9 GiB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el lado GPU del archivo son 34,38 GiB; el resto (tabla de tokens por capa, 20,30 GiB) reside en RAM del sistema o en disco y se lee bajo demanda. En las pruebas se bloquearon 46 GiB de RAM.
- GPU validadas: AMD RX 9070 XT (16 GB) con contexto de 245.760 tokens y NVIDIA RTX 5070 Ti (16 GB) con contexto de 131.072 tokens.
- GPU de gama alta (A100, H100): no se han publicado mediciones; el modelo cabe holgadamente, pero el motor Starlight es el único soportado.
- GPU de consumo: sí cabe en tarjetas de 16 GB del segmento mencionado, siempre que se disponga de al menos 46 GiB de RAM libre para la tabla de tokens.
- Opciones de despliegue: exclusivamente el motor Starlight con su launcher. No es compatible con vLLM, llama.cpp, Ollama, LM Studio, TGI ni Transformers.
- Latencia y throughput: 56,4 tokens/s de decodificación en RX 9070 XT; lectura de un prompt de 236.286 tokens en 68 s (RX 9070 XT) y de 124.678 tokens en 32 s (RTX 5070 Ti); turnos de seguimiento en 0,8 s en ambos casos.
- Configuración de caché: caché de atención q4 con la totalidad de la caché en la tarjeta y MTP con 3 tokens de borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD a BF16 | Top-1 | Tamano | Licencia | Motor |
|---|---|--:|--:|--:|--:|---|---|
| Este repo (`iq3_xxs_turbo`) | 179,0 B totales, MoE | 245.760 (RX 9070 XT) | 0,310 | 83,56 % | 54,68 GiB | Qwen Community 1.0 | Starlight |
| `iq3_s_turbo` (mismo autor) | 179,0 B totales, MoE | no disponible | 0,257 | 84,08 % | 64,78 GiB | Qwen Community 1.0 | Starlight |
| ISTA-DASLab GSQ-RCO IQ3_S | 179,0 B totales, MoE | no disponible | 0,193 | 86,71 % | 77,88 GiB | no disponible | llama.cpp u otros compatibles con GGUF |
| ISTA-DASLab GSQ-RCO IQ3_XXS | 179,0 B totales, MoE | no disponible | 0,276 | 84,05 % | 70,63 GiB | no disponible | llama.cpp u otros compatibles con GGUF |

La comparación con modelos de otros fabricantes (Llama, Mistral, DeepSeek) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo solo funciona con el motor Starlight. Cualquier intento de cargarlo en llama.cpp, Ollama, LM Studio, vLLM o Transformers fallará o no está soportado.
- Pérdida de calidad medible: KLD de 0,310 frente a BF16, un 60 % superior al de la referencia IQ3_S de ISTA-DASLab, con una caída de 3,15 puntos en top-1. La perplejidad, en cambio, es ligeramente mejor que la de esa referencia.
- Cuantización de 2,125 bits por peso en los expertos: es un régimen agresivo que puede degradar tareas sensibles a matices, como razonamiento matemático fino o generación de código con APIs poco frecuentes.
- Vocabulario podado: se eliminan 107.172 tokens de 248.320. Aunque el autor afirma que los tokens conservados mantienen su texto original, la cobertura de idiomas distintos del inglés y de scripts minoritarios puede verse afectada; no se publican evaluaciones multilingües.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad para esta variante; la compresión extrema tiende a incrementar la confianza en respuestas incorrectas.
- Sesgos: no disponibles. No hay documentación sobre sesgos del modelo base ni sobre cómo la cuantización los modifica.
- Requisito de memoria del sistema: además de la VRAM, hacen falta unos 46 GiB de RAM para la tabla de tokens; en equipos con menos memoria el rendimiento se degradará por lectura desde disco.
- Licencia: Qwen Community License 1.0, con posibles restricciones para uso comercial según los términos del modelo base; conviene revisar el archivo LICENSE del repositorio antes de desplegar en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 8 de noviembre de 2026. No hay garantía de mantenimiento ni de soporte.
- Build temprana del motor: las cifras de rendimiento proceden de una versión preliminar de Starlight; pueden variar en versiones posteriores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización de origen (ISTA-DASLab GSQ-RCO): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Repositorio oficial de Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Logits de referencia BF16: https://huggingface.co/datasets/jyohukuchan/qwen38-flash-next-bf16-logits
- Variante comunitaria relacionada (RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-IQ3_S-Strata): https://huggingface.co/jimmy31chen/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-IQ3_S-Strata/tree/main
