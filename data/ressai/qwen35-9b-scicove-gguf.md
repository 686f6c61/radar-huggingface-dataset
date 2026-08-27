# RessAI/qwen35-9b-scicove-gguf

## Resumen

El modelo **Qwen3.5-9B-SciCoVe-GGUF** es una versión cuantizada en formato GGUF del fine-tune `RessAI/qwen35-9b-scicove`, desarrollado por RessAI. Se trata de un modelo basado en Qwen3.5-9B (arquitectura MoE de 9 mil millones de parámetros) especializado en dominios científicos mediante entrenamiento con Chain-of-Verification (CoVe), una técnica que fuerza al modelo a generar un borrador, verificar sus afirmaciones con preguntas de control y corregir errores antes de emitir la respuesta final. Esta versión GGUF permite ejecutar el modelo en hardware de consumo con cuantizaciones de 4 a 8 bits, manteniendo un equilibrio entre calidad y requisitos de VRAM.

El modelo resuelve el problema de la alucinación y la falta de precisión factual en tareas científicas, un área donde los modelos generalistas suelen fallar. Su relevancia actual radica en que combina un fine-tune específico sobre papers científicos con un mecanismo de verificación explícito, y además incorpora capacidades de visión para interpretar figuras científicas. El contexto está limitado a 4096 tokens, lo que condiciona su uso a tareas de razonamiento de alcance medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (basada en Qwen3.5-9B) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles, indonesio |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer con arquitectura de mezcla de expertos (MoE) de 9 mil millones de parámetros totales. Sobre esta base, RessAI realizó un fine-tune con la técnica Chain-of-Verification (CoVe) utilizando el dataset propio `RessAI/sci-papers-training`, compuesto por papers científicos. El entrenamiento se llevó a cabo con Unsloth sobre infraestructura Modal.com con GPUs H100. La innovación principal es el protocolo CoVe: el modelo aprende a generar una respuesta preliminar, formular preguntas de verificación sobre su propio borrador, responderlas y corregir los errores detectados antes de dar la respuesta final. Este proceso se activa mediante un prompt específico documentado en la model card. Además, el modelo conserva capacidades de visión para procesar figuras científicas, aunque no se detalla la arquitectura del codificador visual.

## Capacidades

- Generacion de texto cientifico: explica mecanismos, procesos y conceptos de areas como biologia, quimica, fisica y otras disciplinas academicas.
- Razonamiento con verificacion encadenada: mediante el prompt CoVe, el modelo genera respuestas autocorregidas, reduciendo errores factuales.
- Vision de figuras cientificas: puede interpretar graficos, diagramas e ilustraciones de papers, aunque no se especifican los detalles tecnicos de esta capacidad.
- Multilingue limitado: soporta ingles e indonesio, con mayor solvencia en el primero.
- No se documenta soporte para tool calling, function calling ni uso como agente autonomo.

## Casos de uso

- Asistente de revision de literatura: el modelo puede resumir articulos cientificos y extraer conclusiones clave, ayudando a investigadores a procesar grandes volumenes de papers. Su entrenamiento en textos cientificos y el protocolo CoVe reducen el riesgo de resumenes inexactos.
- Verificacion de afirmaciones cientificas: ante una hipotesis o dato, el modelo genera preguntas de verificacion y contrasta con el contexto, util para revisores y editores.
- Generacion de material educativo: puede explicar conceptos complejos (por ejemplo, el mecanismo de CRISPR-Cas9) con pasos verificados, adecuado para plataformas de aprendizaje.
- Analisis de figuras de investigacion: gracias a su capacidad de vision, puede describir e interpretar graficos y diagramas de papers, asistencia valiosa en revisiones por pares.
- Redaccion de resumenes ejecutivos para divulgacion: transforma resultados tecnicos en explicaciones accesibles, manteniendo la precision mediante la verificacion interna.
- Soporte a busquedas bibliograficas: dado un tema, el modelo puede sugerir conceptos relacionados y verificar su coherencia, aunque su contexto de 4096 tokens limita el procesamiento de documentos largos.

## Benchmarks y rendimiento

La model card del autor incluye una evaluacion comparativa entre el modelo base (Qwen3.5-9B sin fine-tune) y la version entrenada con CoVe. Los datos son los siguientes:

| Metrica | Base | Entrenado | Cambio |
|---|---|---|---|
| MMLU-Pro | 68,7% | 64,7% | -4,0 |
| Held-out Direct QA | 20,0% | 35,0% | +15,0 |
| Held-out CoVe QA | 7,5% | 18,3% | +10,8 |
| Intelligence Score | 41,5 | 44,1 | +2,6 |

Se observa una caida en MMLU-Pro (probablemente por la especializacion cientifica) pero una mejora significativa en preguntas directas y con CoVe sobre datos no vistos. No se han publicado comparaciones con otros modelos de la misma categoria en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q4_K_M (~5,3 GB) cabe en GPUs de 8 GB; Q5_K_M (~6,5 GB) recomendado para la mayoria de usuarios; Q6_K (~7,2 GB) para balance calidad/velocidad; Q8_0 (~9,5 GB) requiere 12 GB o mas.
- GPUs compatibles: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para Q4_K_M; para Q8_0 se recomienda RTX 4080/4090 o A100.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama (con integracion directa desde HuggingFace) y LM Studio.
- Latencia y throughput: no se proporcionan datos concretos; dependen de la GPU y la cuantizacion. En una RTX 4090 con Q4_K_M se puede esperar una generacion fluida para tareas de razonamiento medio.

## Comparativa con modelos similares

La unica comparacion disponible es con el modelo base Qwen3.5-9B, segun la tabla de evaluacion del autor. No se han publicado comparaciones con otros modelos cientificos fine-tuneados o con otros modelos GGUF de tamano similar. A continuacion se muestra la comparacion con el base:

| Modelo | Parametros | Contexto | MMLU-Pro | Held-out Direct QA | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9.197M | 4096 | 68,7% | 20,0% | Apache 2.0 |
| Qwen3.5-9B-SciCoVe (entrenado) | 9.197M | 4096 | 64,7% | 35,0% | Apache 2.0 |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens, insuficiente para procesar papers completos o conversaciones largas; requiere fragmentacion del texto.
- Idiomas restringidos a ingles e indonesio; no se garantiza calidad en otros idiomas.
- La caida en MMLU-Pro sugiere una perdida de conocimientos generales en favor de la especializacion cientifica; no es adecuado para tareas generalistas.
- A pesar del entrenamiento CoVe, el modelo puede seguir alucinando en dominios cientificos no cubiertos por su dataset de entrenamiento.
- La capacidad de vision no esta documentada en detalle; su rendimiento en figuras complejas es incierto.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones; se recomienda verificar la licencia del modelo base.
- No se especifican los parametros activos del MoE, lo que dificulta estimar el coste computacional real por inferencia.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/RessAI/qwen35-9b-scicove-gguf
- Modelo full precision (safetensors): https://huggingface.co/RessAI/qwen35-9b-scicove
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
