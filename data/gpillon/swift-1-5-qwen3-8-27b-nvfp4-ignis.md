# gpillon/Swift-1.5-Qwen3.8-27B-nvfp4-ignis

## Resumen

Swift 1.5 (Qwen3.8-27B) en formato NVFP4 con DFlash2 es una conversión cuantizada del modelo multimodal Swift 1.5, un post-entrenamiento de Qwen3.8-27B desarrollado por UkisAI. Esta versión concreta, publicada por gpillon, adapta los pesos al formato `.ninfer` propietario del servidor de inferencia ignis, empleando cuantización NVFP4 (W4A4) optimizada para tarjetas Blackwell de NVIDIA (RTX 5090 de 32 GB y RTX PRO 6000 de 96 GB). El repositorio ocupa 19,4 GB e incluye además el drafter DFlash2 para decodificación especulativa.

El modelo resuelve el problema de desplegar un modelo multimodal de 27B parámetros en una única GPU de consumo con latencia aceptable para cargas de agentes de código. La cuantización NVFP4 reduce el peso de los pesos a 4 bits tanto en activaciones como en pesos, mientras que DFlash2 añade decodificación especulativa con 7 tokens de borrador para acelerar la generación. Según la model card, en una RTX 5090 se alcanzan 368,3 tok/s con una sola lane a 8.192 tokens de contexto y 202,4 tok/s a 253.440 tokens.

La relevancia actual radica en que permite ejecutar localmente un modelo multimodal conversacional de gran tamaño en hardware consumer Blackwell, con una API compatible con OpenAI y soporte para flujos de agentes multi-paso. La licencia Swift Open License v1.0 introduce un umbral de facturación de un millón de dólares para uso comercial, lo que condiciona su adopción empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (post-entrenamiento de Qwen3.8-27B) con drafter DFlash2 para decodificación especulativa |
| Parametros totales | 27B (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 253.440 tokens (según tabla de rendimiento de la model card) |
| Tipos de cuantizacion | NVFP4 (W4A4), formato `.ninfer`; existe una variante trellis-3bpw para GPUs de 16 GB |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (con umbral de ingresos de 1.000.000 USD); partes base bajo Apache-2.0 |
| Formato de pesos | `.ninfer` (formato propietario de ignis); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un post-entrenamiento de Qwen3.8-27B realizado por UkisAI, del que no se detallan en la información disponible la composición del dataset ni las técnicas de alineación (RLHF/DPO). La arquitectura es un transformer multimodal con pipeline `image-text-to-text`, lo que indica capacidad de procesar imágenes y texto de forma conjunta. Esta conversión concreta aplica cuantización NVFP4 (4 bits en pesos y activaciones) mediante un proceso de calibración registrado en el fichero `conversion.json`, que documenta la receta, el error por matriz y el divisor empleado.

La innovación técnica principal es la integración de DFlash2, un drafter de decodificación especulativa con 7 tokens de borrador, que acelera la generación autoregresiva. El formato `.ninfer` está diseñado específicamente para el servidor ignis, que gestiona el perfil de memoria de la tarjeta (rtx5090 o rtxpro6000) de forma automática. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del corpus.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 253.440 tokens según las mediciones de la model card).
- Procesamiento multimodal image-text-to-text: entrada de imágenes junto con texto.
- Razonamiento multi-paso y soporte para flujos de agentes (la model card menciona explícitamente cargas de "un agente principal más unos pocos subagentes en la misma tarjeta").
- Decodificación especulativa mediante DFlash2 con 7 tokens de borrador para reducir latencia.
- Reutilización de prompt entre peticiones (prompt reuse) y guardia contra bucles de razonamiento, integrados en el servidor ignis.
- API compatible con OpenAI (`/v1/models`, `/v1/chat/completions`), lo que facilita la integración con herramientas existentes.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el enfoque en agentes de código lo sugiere; se indica como no confirmado.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agentes de código autónomos en estación de trabajo local: el modelo se sirve en una RTX 5090 con 368 tok/s a 8K de contexto, lo que permite ejecutar un agente principal y subagentes en la misma tarjeta sin depender de la nube, con la API compatible con OpenAI para integrarse en editores y CLIs.
- Asistencia conversacional con imágenes: al ser un modelo image-text-to-text, puede recibir capturas de pantalla, diagramas o fotografías junto con instrucciones textuales, útil para depuración visual de interfaces o análisis de documentación técnica escaneada.
- Procesamiento de repositorios completos: con contexto de hasta 253.440 tokens y 202 tok/s a esa longitud, es viable cargar fragmentos extensos de código o documentación para tareas de revisión, resumen o refactorización guiada.
- Despliegue en estaciones de trabajo con RTX PRO 6000: en la variante de 96 GB se puede servir el modelo con mayor margen de memoria para cargas concurrentes de varios agentes o contextos más largos.
- Prototipado de pipelines multimodales: investigadores pueden evaluar un modelo de 27B cuantizado a 4 bits en hardware consumer antes de escalar a infraestructura mayor, gracias a la conversión documentada con errores por matriz.
- Servicio local compatible con OpenAI para equipos pequeños: el servidor ignis expone endpoints estándar, métricas Prometheus y un Playground, lo que permite montar un servicio interno de inferencia sin costes de API externa, siempre que se respete la licencia.
- Evaluación de decodificación especulativa: DFlash2 con 7 tokens de borrador permite medir el impacto de la decodificación especulativa en latencia real sobre Blackwell, útil para investigación en optimización de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona mediciones de throughput de decodificación en una RTX 5090 con el servidor ignis (ocho lanes, chunk de prefill de 2.048 tokens, DFlash2 con 7 tokens de borrador):

| Contexto | Una lane | Dos lanes (agregado) |
|---|---:|---:|
| 8.192 tokens | 368,3 tok/s | 570,2 tok/s |
| 65.536 tokens | 306,4 tok/s | 457,5 tok/s |
| 253.440 tokens | 202,4 tok/s | 275,4 tok/s |

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 18,08 GiB (19,4 GB de repositorio), por lo que se necesita una GPU con al menos 32 GB para el perfil `rtx5090`; el perfil `rtxpro6000` está pensado para 96 GB.
- GPU recomendadas: RTX 5090 (32 GB, Blackwell) y RTX PRO 6000 (96 GB, Blackwell). Para tarjetas de 16 GB existe la variante `gpillon/Swift-1.5-Qwen3.8-27B-trellis-3bpw-ignis`.
- Cabe en GPU consumer: sí, en RTX 5090 (32 GB) con el perfil `rtx5090`; no en GPUs de 16 GB con esta variante NVFP4.
- Opciones de despliegue: exclusivamente el servidor ignis (versión 0.9.6 o posterior), disponible como `.zip` para Windows, `.tar.gz` para Linux y contenedor `linux/amd64`. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.ninfer`.
- Latencia y throughput: 368,3 tok/s con una lane a 8.192 tokens de contexto; 202,4 tok/s a 253.440 tokens; 570,2 tok/s agregados con dos lanes a 8.192 tokens (mediciones en RTX 5090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpillon/Swift-1.5-Qwen3.8-27B-nvfp4-ignis | 27B | hasta 253.440 tokens | NVFP4 (W4A4) | Swift Open License v1.0 | ignis, GPU Blackwell 32/96 GB |
| gpillon/Swift-1.5-Qwen3.8-27B-trellis-3bpw-ignis | 27B | no disponible | trellis 3 bpw | Swift Open License v1.0 | ignis, GPU 16 GB |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27B | no disponible | pesos originales | Swift Open License v1.0 | Hugging Face, requiere hardware mayor |
| Qwen/Qwen3.8-27B (base original) | 27B | no disponible | pesos originales | Apache-2.0 | Hugging Face, ecosistema amplio |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Swift Open License v1.0 no permite uso comercial a organizaciones con ingresos brutos iguales o superiores a 1.000.000 USD en su último ejercicio fiscal, incluyendo entidades controladas o bajo control común; se requiere una licencia escrita separada (Swift Enterprise License).
- Exención limitada: las organizaciones sin ánimo de lucro calificadas (501(c)(3) o equivalente) están exentas solo para fines no comerciales o de investigación.
- Las partes del modelo base Qwen3.8-27B permanecen bajo Apache-2.0, pero la limitación comercial se aplica a la contribución de UkisAI y a lo que la contiene o deriva.
- Formato propietario: los pesos `.ninfer` solo se ejecutan con el servidor ignis; no hay soporte para ecosistemas estándar como llama.cpp, vLLM u Ollama, lo que limita la portabilidad.
- Hardware restringido: requiere GPUs Blackwell (RTX 5090 o RTX PRO 6000); no funciona en arquitecturas anteriores.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento multilingüe.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; como modelo conversacional post-entrenado, es esperable un riesgo estándar de alucinación, pero no hay datos concretos.
- Sin benchmarks de calidad publicados: no hay métricas de MMLU, HumanEval u otras que permitan evaluar la degradación introducida por la cuantización NVFP4.
- Sin datos de entrenamiento: se desconoce la composición del dataset, el número de tokens y las técnicas de alineación del post-entrenamiento de UkisAI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpillon/Swift-1.5-Qwen3.8-27B-nvfp4-ignis
- Modelo base (post-entrenamiento): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante para 16 GB: https://huggingface.co/gpillon/Swift-1.5-Qwen3.8-27B-trellis-3bpw-ignis
- Repositorio ignis: https://github.com/gpillon/ignis
- Última release de ignis: https://github.com/gpillon/ignis/releases/latest
- Guía para agentes de IA: https://raw.githubusercontent.com/gpillon/ignis/main/docs/user/paths/agent.md
- Documentación completa en Markdown: https://gpillon.github.io/ignis/llms.txt
- Guía "Get a model": https://gpillon.github.io/ignis/guides/models/
- Contacto para licencia enterprise: https://ukisai.com/contact
