# Justbackup/M.O.G.-SEC-27B-1M-CTX-NVFP4

## Resumen

M.O.G.-SEC-27B-1M-CTX-NVFP4 es un modelo de lenguaje especializado en ciberseguridad ofensiva y defensiva, desarrollado por Blackfrost Research como parte de su linea Minds of Gods (M.O.G.). El modelo recibe el nombre de Qwentium y esta disenado para tareas de seguridad reales en 2026, con un enfoque en trabajo de operaciones de red team y blue team sin las restricciones tipicas de los modelos comerciales.

El modelo se basa en Qwen3.8-27B y ha sido ajustado mediante fine-tuning supervisado (SFT) sobre conjuntos de datos de ciberseguridad modernos, curados a partir de generaciones de modelos frontier a los que se les han eliminado los rechazos. Su caracteristica mas destacada es una ventana de contexto de un millon de tokens, lograda mediante extension YaRN sobre los 262.144 tokens nativos del modelo base, lo que permite mantener operaciones de seguridad completas en contexto.

La arquitectura es un transformer denso hibrido con atencion Gated DeltaNet, que incluye capacidades multimodales nativas (vision). El checkpoint esta cuantizado en NVFP4 (W4A4) y se sirve con decodificacion especulativa DFlash 2, alcanzando velocidades de decodificacion de entre 81 y 89 tokens por segundo en hardware Blackwell de doble GPU. El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para investigacion y despliegues controlados, no como chatbot de consumo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration, transformer denso hibrido con Gated DeltaNet y atencion gated, vision nativa |
| Parametros totales | 18.548.690.160 (18,5 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.000.000 tokens (YaRN, factor 4.0 sobre 262.144 nativos) |
| Tipos de cuantizacion | NVFP4 (W4A4, ModelOpt FP4); KV cache en FP8 E4M3 en servido |
| Idiomas soportados | ingles, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y emplea una arquitectura de transformer denso hibrido que combina atencion Gated DeltaNet con atencion gated clasica. Esta combinacion es clave para gestionar la ventana de contexto de un millon de tokens sin que el pool de KV cache se convierta en un cuello de botella, incluso en cuantizacion NVFP4. El modelo incluye vision nativa, por lo que puede procesar entradas de imagen y texto.

El entrenamiento consistio en un fine-tuning supervisado (SFT) sobre datos de ciberseguridad ofensiva y defensiva moderna, curados a partir de generaciones de modelos frontier a las que se eliminaron los rechazos y las disertaciones sobre uso dual. El conjunto de datos cubre tareas reales de 2026, no ejercicios CTF antiguos: rutas de explotacion, reglas SIEM, gaps de deteccion, notas de hardening y planes de emulacion de adversarios. No se menciona el uso de RLHF o DPO en el post-entrenamiento.

La extension de contexto se aplico siguiendo la receta oficial de Qwen3.8-27B con YaRN, con factor 4.0, rope_theta de 10.000.000 y partial_rotary_factor de 0.25. El servido se realiza con SGLang, activando la variable SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN y usando --context-length 1000000. El YaRN estatico esta siempre activo, lo que puede afectar ligeramente a la calidad en contextos cortos.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable, con niveles de esfuerzo configurables (medium, high, etc.).
- Razonamiento multi-step y soporte para tareas de agente, con capacidad de mantener el hilo de una operacion completa en contexto.
- Especializacion en ciberseguridad ofensiva: generacion de payloads, rutas de explotacion, bypass de deteccion, emulacion de adversarios.
- Especializacion en ciberseguridad defensiva: reglas SIEM, deteccion de gaps, hardening, analisis de alertas.
- Capacidades multimodales: procesamiento de imagenes ademas de texto (pipeline image-text-to-text).
- Soporte de tool calling y function calling, integrable en pipelines de automatizacion.
- Decodificacion especulativa DFlash 2 con 8 tokens de borrador, que acelera la generacion sin perder calidad.
- Multilingue, aunque el entrenamiento principal esta en ingles.
- Sin rechazos ni moralizacion: el modelo no se niega a realizar tareas de seguridad que otros modelos rechazarian.

## Casos de uso

- Analisis de seguridad ofensiva en pruebas de penetracion: el modelo puede generar rutas de explotacion y payloads para entornos autorizados, manteniendo todo el alcance y los hallazgos en contexto durante la operacion.
- Gestion de deteccion y respuesta (blue team): permite redactar reglas SIEM, identificar gaps de deteccion y correlacionar alertas a lo largo de un mes completo de logs, gracias a la ventana de 1M tokens.
- Emulacion de adversarios: el modelo puede planificar y ejecutar campañas de emulacion de adversarios, manteniendo el timeline completo de la campaña en contexto para no perder el hilo.
- Analisis forense de incidentes: con la ventana de contexto amplia, puede procesar volcados de memoria, logs y artefactos de un incidente completo y generar un informe detallado.
- Automatizacion de respuestas de seguridad: integrable en pipelines de orquestacion (SOAR) mediante tool calling, para generar acciones de remediacion o consultas de busqueda de amenazas.
- Investigacion en seguridad: util para investigadores que necesitan explorar tecnicas de ataque y defensa sin restricciones, documentando hallazgos y generando PoCs.
- Soporte a operaciones de red team con contexto largo: el modelo puede mantener en memoria el informe de reconocimiento, el grafo de vulnerabilidades y las notas de explotacion de una operacion completa, sin olvidar quien dirige la operacion.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MMLU-Pro (validacion, thinking on, xhigh) | 65/70 |
| HumanEval | 96,3 % |
| R1-HARMFUL-BENCH-450 (tasa de respuestas perjudiciales verdaderas) | 4/300 |
| Velocidad de decodificacion con DFlash 2 | ~81-89 tok/s |
| Velocidad de decodificacion sin especulacion | ~61 tok/s |

Los benchmarks se midieron en laboratorio (2026-08-19/21) en un sistema de dos GPU Blackwell, con SGLang y la ventana de 1M tokens activa. Para las pruebas de capacidad se uso la plantilla de chat estandar de Qwen, sin el system prompt de identidad de Qwentium. El benchmark R1-HARMFUL-BENCH-450 combina AdvBench 150, StrongREJECT 150 y XSTest 150, con thinking activado, reasoning_effort=medium, temperatura 1.0, top_p 0.95, top_k 20 y max_tokens 4096.

## Requisitos de hardware

- VRAM estimada: el checkpoint NVFP4 ocupa 29,4 GB en disco. Para inferencia con 1M de contexto se recomienda un sistema de doble GPU con 96 GB de VRAM cada una (por ejemplo, 2x NVIDIA L40S o similar Blackwell).
- GPU recomendadas: NVIDIA Blackwell de 96 GB o superior; el kit de despliegue incluye un perfil de prueba para DGX Spark.
- En consumer GPU: no es realista para la ventana completa de 1M tokens. Con cuantizaciones mas agresivas y contextos reducidos podria ejecutarse en GPUs de 24 GB, pero no se ha validado.
- Opciones de despliegue: SGLang (recomendado, con soporte para YaRN y DFlash 2), vLLM, TGI. El repositorio incluye un deployment-kit con scripts y un recolector de informes.
- Latencia y throughput: con DFlash 2 se alcanzan ~81-89 tok/s en el hardware de laboratorio; sin especulacion, ~61 tok/s. MTP (multi-token prediction) no funciona en este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| M.O.G.-SEC-27B-1M-CTX-NVFP4 | 18,5 B activos (27B base) | 1M (YaRN) | Apache 2.0 | Ciberseguridad ofensiva/defensiva, sin censura |
| Qwen3.8-27B (base) | 27 B | 262.144 | Apache 2.0 | Proposito general, con rechazos en seguridad |
| Modelos frontier comerciales (GPT, Claude) | no disponible | variable | propietaria | Proposito general, con politicas de uso dual restrictivas |

La comparativa directa con otros modelos especializados en ciberseguridad sin censura no esta disponible en la informacion proporcionada. La principal diferencia con el modelo base Qwen3.8-27B es el fine-tuning en ciberseguridad, la extension de contexto a 1M y la cuantizacion NVFP4.

## Limitaciones y advertencias

- Modelo sin censura: no moraliza ni rechaza peticiones de seguridad ofensiva. El propio autor advierte que debe controlarse el acceso como si fuera un arma. No es apto para todos los publicos.
- Riesgo de uso malintencionado: puede generar payloads, bypass de deteccion y tecnicas de explotacion. Solo debe usarse en entornos autorizados y con scope legal.
- Riesgo de alucinacion: como todo LLM, puede inventar tecnicas, CVE o rutas de explotacion que no son reales. Verificar siempre los resultados.
- Calidad en contexto corto: el YaRN estatico siempre activo puede degradar ligeramente la calidad en conversaciones cortas.
- MTP no funciona: la prediccion multi-token no esta operativa en este fine-tuning, por lo que la aceleracion depende de DFlash 2.
- Idioma: el entrenamiento principal esta en ingles; el rendimiento en otros idiomas no esta validado.
- Requisitos de hardware elevados: la ventana de 1M tokens requiere hardware de doble GPU con 96 GB de VRAM, fuera del alcance de la mayoria de estaciones de trabajo.
- Modelo de investigacion: no es un chatbot de consumo; requiere conocimientos tecnicos para su despliegue y uso adecuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Justbackup/M.O.G.-SEC-27B-1M-CTX-NVFP4
- Modelo base (BF16): https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-BF16
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Kit de despliegue: https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-NVFP4/tree/main/deployment-kit
- Directorio de evaluacion: https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-NVFP4/tree/main/eval
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-NVFP4
