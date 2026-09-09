# Cheva123/Jamjuri-Preview-9B

## Resumen

Jamjuri-Preview-9B es un modelo de lenguaje de 9.197.093.888 parametros (≈9,2B) desarrollado por Cheva Labs, la primera publicacion experimental de la empresa. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B realizado mediante una tecnica de tres expertos LoRA fusionados. El objetivo del proyecto es crear un asistente local orientado a pymes tailandesas, con especial atencion a la comunicacion laboral en tailandes, la redaccion de documentos de negocio y tareas de retrieval augmented generation (RAG).

El modelo se publica en formato GGUF Q8_0 y soporta los idiomas tailandes e ingles. Segun la informacion disponible, la longitud de contexto no se especifica. Cheva Labs presenta este lanzamiento como una version preliminar de investigacion, no apta para produccion, y lo publica para documentar un primer paso hacia un asistente de IA local para pequenas y medianas empresas en Tailandia. La licencia es Apache-2.0, lo que permite su uso y modificacion con ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica subtipo; base: Qwen3.5-9B) |
| Parametros totales | 9.197.093.888 (≈9,2B) |
| Parametros activos | No aplica (modelo denso, sin indicacion de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 (unico artefacto publicado) |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0); no se publican safetensors como artefacto independiente |

## Arquitectura y entrenamiento

El modelo parte del modelo base Qwen/Qwen3.5-9B. El proceso de post-entrenamiento descrito por el autor consiste en la aplicacion de tres adaptadores LoRA especializados, que posteriormente se fusionan con los pesos del modelo base. Esta practica, conocida como "3 Expert LoRA + merge", permite combinar capacidades especificas (comunicacion laboral en tailandes, redaccion de documentos, RAG y tool calling) sin modificar por completo los pesos originales.

No se indican datos sobre el conjunto de entrenamiento, tampoco el numero de tokens ni la composicion del dataset. La model card menciona que se busca preservar las capacidades generales de razonamiento, matematicas, codigo y seguimiento de instrucciones del modelo base, aunque no se detalla si se emplearon tecnicas como RLHF o DPO. La innovacion principal es el uso de multiples LoRA expertos fusionados, junto con un enfoque de distribucion abierta para experimentacion local.

## Capacidades

- Generacion de texto en tailandes e ingles, con afinamiento para comunicacion laboral y escritura de documentos de negocio.
- Soporte de retrieval augmented generation (RAG), con respuestas fundamentadas en contexto externo, segun la intencion declarada del autor.
- Soporte de tool calling y function calling, indicado explicitamente en las etiquetas y en la model card.
- Preservacion de habilidades generales de razonamiento, matematicas, codigo y seguimiento de instrucciones, segun el objetivo del entrenamiento.
- Capacidad para automatizar flujos de trabajo simples: el modelo puede integrarse en agentes que ejecutan tareas basicas con llamadas a herramientas.
- No se menciona soporte de vision ni de audio en la informacion disponible.

## Casos de uso

- Asistente de comunicacion interna en tailandes para pymes: redaccion de correos, memorandos y mensajes de equipo con registro profesional, aprovechando el ajuste especifico en tailandes laboral.
- Redaccion de documentos de negocio: generacion de propuestas, contratos simples, descripciones de productos o facturas descriptivas, destinadas a revision humana antes de su uso.
- Consulta de documentacion interna mediante RAG: integracion en un chatbot que responde preguntas sobre manuales de empleados, politicas de empresa o catalogos de productos, a partir de una base de conocimiento conectada al modelo.
- Automatizacion de flujos de trabajo con tool calling: conexion a sistemas de gestion como CRM o ERP para consultar datos, actualizar registros o disparar acciones predefinidas, siempre con superposicion humana y fuera de contextos críticos.
- Soporte al cliente bilingue (tailandes-ingles) de primera linea: interacciones basicas para responder consultas frecuentes, con derivacion a un agente humano cuando la respuesta no sea segura o el impacto sea alto.
- Prototipado rapido de chatbots en tailandes para investigacion: dado su tamano de 9B y su formato GGUF Q8_0, puede ejecutarse en hardware local con llama.cpp y usarse para experimentos de NLP, evaluacion y pruebas de concepto.
- Asistente de ventas para comercios locales: respuestas sobre precios, disponibilidad o promociones basadas en un catalogo cargado como contexto RAG, con ejecucion de busquedas mediante las herramientas del sistema.

## Benchmarks y rendimiento

El autor publica una tabla de benchmarks iniciales, seleccionados por el propio desarrollador. No se trata de una suite exhaustiva ni de una evaluacion universal. Los resultados comparan el modelo base Qwen en Q8_0 con Jamjuri en Q8_0, en modo sin pensamiento ("no-thinking"):

| Benchmark | Qwen Q8 | Jamjuri Q8 | Diferencia |
|---|---:|---:|---:|
| BFCL V4 — simple_python | 94.00% | 93.00% | -1.00 pp |
| IFEval — strict | 83.36% | 84.10% | +0.74 pp |
| Thai Eval — Belebele fallback | 75.00% | 80.78% | +5.78 pp |
| GSM8K — strict | 83.40% | 84.84% | +1.44 pp |
| MMLU-Pro — 700-sample gate | 72.57% | 73.29% | +0.71 pp |
| HumanEval+ — pass@1 | 82.90% | 84.80% | +1.90 pp |
| MBPP+ — pass@1 | 65.90% | 64.30% | -1.60 pp |

En este subconjunto, Jamjuri supera al base en 5 de las 7 evaluaciones, pero el autor advierte que estos datos no son suficientes para afirmar una superioridad general. Ademas, se reporta un resultado de la simulacion τ³ Retail, donde Jamjuri obtuvo una recompensa media del 24.07% frente al 15.91% de Qwen. Sin embargo, el propio autor indica que las dos ejecuciones no usaron el mismo juez externo, por lo que estos datos deben tratarse como evidencia direccional, no como un benchmark controlado. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto GGUF Q8_0 ocupa aproximadamente 9.2 GB de pesos. Con la cache KV del contexto, se estima un consumo total de entre 10 y 12 GB de VRAM, dependiendo de la longitud de entrada y salida.
- GPU recomendadas: una NVIDIA RTX 3090 o RTX 4090 de 24 GB es suficiente para la carga y ejecucion en local. Tambien son validas GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU de consumidor: si, gracias a la cuantizacion Q8_0, el modelo puede ejecutarse en tarjetas de 24 GB, e incluso en tarjetas de 16 GB si se reduce el contexto o se usa cuantizacion adicional no publicada.
- Opciones de despliegue: llama.cpp (incluido el servidor de llama.cpp) y entornos compatibles como Ollama, que cargan directamente el formato GGUF. No es posible usar vLLM ni TGI con este modelo, ya que el repo no publica safetensors y estos frameworks requieren ese formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La unica comparacion directa posible es con el modelo base Qwen/Qwen3.5-9B, ya que no se dispone de datos publicados sobre otros modelos comparables de tamano similar o con afinamiento tailandes.

| Modelo | Parametros | Contexto | Licencia | Formato | Nota |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-9B | 9.197.093.888 | No disponible | Apache-2.0 | No especificado | Modelo base sin ajuste |
| Jamjuri-Preview-9B | 9.197.093.888 | No disponible | Apache-2.0 | GGUF Q8_0 solo | Fine-tuning con 3 Expert LoRA, orientado a pymes tailandesas |

Otros modelos comparables en la categoria de 9B o con capacidades tailandesas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental y no apto para produccion. El propio autor lo advierte de forma explicita.
- Riesgo de alucinacion: las respuestas pueden ser incompletas, incorrectas o inconsistentes, especialmente en contextos de alto impacto.
- No debe utilizarse para decisiones financieras, contables, legales, medicas o de seguridad critica.
- No debe usarse en compras autonomas, pagos, acciones irreversibles ni en soporte al cliente de produccion sin supervision humana.
- La evaluacion publicada es limitada y seleccionada por el desarrollador; los resultados no representan una medicion completa de las capacidades del modelo.
- El test τ³ Retail no es un benchmark controlado, por lo que no debe interpretarse como evidencia solida de superioridad.
- Idiomas soportados: unicamente tailandes e ingles. El rendimiento en otros idiomas es desconocido.
- Longitud de contexto no especificada en la documentacion, lo que puede limitar tareas que requieran ventanas de contexto largas.
- El formato de pesos publicado es exclusivamente GGUF Q8_0, lo que restringe el despliegue en frameworks que requieran safetensors u otros formatos de cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Cheva123/Jamjuri-Preview-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
