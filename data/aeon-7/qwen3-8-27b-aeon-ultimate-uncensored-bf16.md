# AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16

## Resumen

Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 es una variante abliterada del modelo Qwen/Qwen3.8-27B, desarrollada por el usuario AEON-7. El objetivo es eliminar los mecanismos de rechazo (refusal) del modelo base manteniendo la coherencia y la calidad de las respuestas, sin caer en una sobre-abliteración que degrade el modelo. El resultado es un modelo que responde de forma directa a peticiones que el modelo original rechazaría, incluyendo contenido sensible o potencialmente dañino.

El modelo conserva la arquitectura híbrida del base: atención con gated-deltanet (GDN), torre de visión sin modificar y cabezal MTP (multi-token prediction) nativo. Se distribuye en BF16 como referencia de precisión completa, con un peso de unos 55,6 GB y 27.781 millones de parámetros. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Está pensado para entornos de inferencia con vLLM y soporta razonamiento, tool calling, visión y ventanas de contexto de hasta 262k tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con gated-deltanet (GDN) y atencion hibrida, torre de vision y cabezal MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (validado con 16.384 en la prueba de referencia) |
| Tipos de cuantizacion | BF16 (master), NVFP4 planeado para Blackwell/DGX Spark |
| Idiomas soportados | Ingles, chino, multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, que emplea una arquitectura hibrida que combina atencion tradicional con capas gated-deltanet (GDN), una variante de state-space model (SSM) con convolucion 1D. Sobre el base se aplico una reparacion del outlier de conv1d (FernflowerAI) y posteriormente una abliteracion con la herramienta abliterix 1.12.2. El proceso utilizo 50 ensayos de Optuna con un juez basado en Google Gemini 3.1 Flash Lite para evaluar si las respuestas eran rechazos o respuestas utiles. El ensayo ganador (trial 48) logro reducir la tasa de rechazo del juez de ~100/100 a 36/100 en el conjunto de validacion, manteniendo una divergencia KL de 0.0991 nats/token respecto al modelo original. No se optimizo para KL cero, sino para coherencia y utilidad de las respuestas.

La torre de vision y el cabezal MTP no fueron modificados (333/333 y 15 tensores con hash-match respectivamente). El modelo conserva el modo de razonamiento (thinking) activado por defecto, con soporte para `reasoning_effort` y `enable_thinking`. El entrenamiento de abliteracion se realizo sobre un split fijo de 400 prompts de entrenamiento y 100 de evaluacion, mas un conjunto sexual de 50 prompts.

## Capacidades

- Generacion de texto y chat conversacional multilingue (ingles, chino, otros).
- Razonamiento explicito con modo "thinking" activable por peticion, con niveles de esfuerzo configurables.
- Tool calling y function calling nativo, compatible con el parser `qwen3_coder` y `enable-auto-tool-choice`.
- Capacidades multimodales: entrada de imagen a traves de la torre de vision no modificada (vision-language).
- Prediccion multi-token (MTP) para acelerar la decodificacion especulativa (3 tokens especulativos por paso).
- Ventana de contexto larga de 262k tokens, util para documentos extensos o conversaciones multi-turno.
- Respuesta sin rechazos: el modelo no muestra negativas explicitas ("I won't") en los conjuntos probados, incluso ante peticiones delicadas.
- Soporte de agentes y razonamiento multi-paso gracias a la combinacion de thinking, tool calling y contexto largo.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262k tokens) y responder de forma directa sin rechazos, adecuado para soporte tecnico o reclamaciones donde se necesita informacion completa.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar o revisar codigo, aprovechando el modo thinking para razonar sobre requisitos complejos.
- Analisis de documentos legales o financieros: gracias a la ventana de 262k tokens, puede procesar contratos completos o informes extensos y extraer clausulas, riesgos o datos relevantes sin truncar.
- Asistentes de investigacion: el modo razonamiento permite desglosar problemas cientificos o tecnicos paso a paso, mientras que el soporte multilingue facilita el trabajo con fuentes en ingles y chino.
- Creacion de contenido editorial: el modelo puede redactar articulos, guiones o material de marketing sin las restricciones de censura tipicas de otros modelos, manteniendo coherencia y estilo.
- Simulacion de escenarios de seguridad o etica: al no rechazar peticiones, permite generar ejemplos de contenido peligroso o delicado (por ejemplo, planes de contingencia, analisis de vulnerabilidades) en entornos controlados de investigacion.
- Integracion en agentes autonomos: con tool calling y MTP, puede ejecutar tareas multi-paso como busqueda web, calculo o interaccion con APIs, manteniendo un hilo de razonamiento explicito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de rendimiento se limitan a metricas del proceso de abliteracion:

| Metrica | Valor |
|---|---|
| KL de divergencia (full distribution, 100 prompts) | 0.0991 nats/token |
| Tasa de rechazo del juez (Flash Lite) en conjunto harmful | 36/100 (29 en el mejor ensayo) |
| Tasa de rechazo del juez en conjunto sexual | 5/50 |
| Tasa de rechazo del juez en conjunto harmless | 1/100 |
| Rechazos explicitos ("I won't") | 0 en todos los conjuntos |
| Aceptacion de MTP en inferencia | 40-66% |

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 55,6 GB de pesos, por lo que requiere al menos 80 GB de VRAM para inferencia con contexto moderado (16k). Para la ventana completa de 262k se necesita una GPU de 140 GB (como la H200) o memoria distribuida.
- GPUs recomendadas: NVIDIA H200 (validada), A100 80GB, H100 80GB, o configuraciones multi-GPU con 2x48GB.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) en BF16. Para consumer se necesitaria cuantizacion de menor precision, no disponible en este repo.
- Despliegue: validado con vLLM 0.27.1 (torch 2.13.0+cu130) usando `--gdn-prefill-backend triton` y `--speculative-config` con MTP. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones formales. La decodificacion especulativa con MTP (3 tokens) mostro una aceptacion del 40-66%, lo que reduce el numero de pasos de autoatencion.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa formal con otros modelos abliterados de la misma categoria (por ejemplo, Dolphin, Midnight Miqu, etc.). La unica referencia directa es el modelo base Qwen3.8-27B:

| Modelo | Parametros | Contexto | Licencia | Refusal |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8B | 262k | Apache-2.0 | Si |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED | 27,8B | 262k | Apache-2.0 | No (abliterado) |

Ambos comparten arquitectura, vision y MTP. La diferencia principal es la ausencia de rechazos en la version abliterada, con una divergencia KL de ~0.1 nats/token respecto al base.

## Limitaciones y advertencias

- El modelo ha sido abliterado especificamente para eliminar rechazos; puede generar contenido ilegal, peligroso o eticamente cuestionable sin filtro. Su uso en produccion requiere controles externos y supervisio humana.
- No se han publicado evaluaciones de sesgos, alucinaciones o toxicidad. La ausencia de rechazo no implica ausencia de errores facticos.
- La ventana de 262k tokens es nativa, pero la validacion oficial se realizo con 16k. El uso de contextos muy largos puede degradar la calidad o requerir ajustes de memoria.
- La cuantizacion NVFP4 anunciada no esta disponible aun; el unico formato es BF16, que exige hardware de alta gama.
- El proceso de abliteracion se optimizo con un juez especifico (Gemini Flash Lite); otros jueces pueden clasificar respuestas de forma diferente.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre la idoneidad del modelo para aplicaciones sensibles.
- No se ha comprobado el rendimiento en tareas de vision mas alla de una prueba basica (escena ficticia de lockpick).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de gated-deltanet: https://arxiv.org/abs/2406.11717
- Paper de Qwen3 (arquitectura general): https://arxiv.org/abs/2503.00555
