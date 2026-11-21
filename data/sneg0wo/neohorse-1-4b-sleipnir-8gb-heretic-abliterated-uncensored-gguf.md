# Sneg0wo/NeoHorse-1-4B-Sleipnir-8GB-Heretic-Abliterated-Uncensored-GGUF

## Resumen

NeoHorse-1-4B-Sleipnir-8GB-Heretic-Abliterated-Uncensored-GGUF es una cuantizacion GGUF de un modelo de lenguaje de 4.205.751.296 parametros (~4,2B) obtenido mediante un merge ponderado de tres variantes del modelo base NeoHorse-1-4B, que a su vez deriva de Qwen3.5-4B. Lo publica el usuario Sneg0wo en Hugging Face bajo licencia Apache-2.0. El objetivo declarado del autor es ofrecer una variante "uncensored" (con las capas de rechazo reducidas mediante tecnicas de abliteration y heretic) que conserve la capacidad de tool calling y quepa en una GPU de 8 GB de VRAM.

El modelo esta pensado para despliegue local con llama.cpp y llama-server, con un enfoque explicitamente agentico: la model card incluye metricas de llamada a herramientas (tool_strict, tool_name) y de falsos rechazos sobre prompts benignos (over_refusal), ademas de una tabla de contexto maximo alcanzable segun el tipo de cache KV. La cuantizacion principal (IQ4_XS) ocupa 2,55 GB, lo que deja margen para cache KV extensa dentro de los 8 GB.

La relevancia actual reside en su propuesta de compromiso: un modelo pequeno, con contexto anunciado de 262.144 tokens (aunque en la practica limitado por la VRAM disponible), capacidades de function calling verificadas y una licencia permisiva. No obstante, los propios benchmarks publicados muestran un rendimiento muy bajo en tareas de conocimiento y matematicas, por lo que su utilidad practica se circunscribe a tareas de agente con herramientas y generacion conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-4B, segun credits de la model card); detalles de atencion no disponibles |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens anunciados; maximo efectivo segun cuantizacion y cache KV (ver tabla de hardware) |
| Tipos de cuantizacion | IQ4_XS, Q5_K_M, IQ3_M (variantes "agentic"); f16 para conversion intermedia |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria gguf, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge ponderado en streaming sobre CPU de tres donantes: `huihui-ai/Huihui-NeoHorse-1-4B-abliterated` con peso 0,6, `prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO` con peso 0,25 y `TokenRhythm/NeoHorse-1-4B` con peso 0,15. El proceso consistio en conversion a GGUF f16, calculo de una imatrix "agentic" (200 x 512 muestras), cuantizacion y evaluacion a traves de llama-server con temperatura 0. Todo el pipeline se ejecuto en una Colab T4 gratuita, sin GPU de escritorio.

La arquitectura subyacente corresponde a la familia Qwen3.5-4B, un transformer decoder-only, si bien la model card no detalla configuracion de capas, cabezas de atencion ni composicion del dataset de preentrenamiento original. No se documentan fases de RLHF o DPO en esta ficha; las tecnicas aplicadas son de edicion de pesos (abliteration y heretic) orientadas a reducir los rechazos, no un ajuste supervisado adicional. El autor publica `eval.json` y `merge_info.json` en el repositorio como trazabilidad del proceso.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling / function calling: la model card reporta metricas especificas de llamada estricta a herramientas (tool_strict y tool_name) sobre 100 prompts ejecutados por la ruta real `/v1/chat/completions`.
- Uso agentico: el modelo se presenta como "agentic" y las cuantizaciones llevan el sufijo `-agentic`, con una imatrix calibrada para ese perfil.
- Reduccion de rechazos: variante "uncensored" con abliteration y heretic, orientada a minimizar falsos rechazos en prompts benignos (over_refusal reportado como 0,0 % en las variantes evaluadas).
- Multilingue: no disponible; la model card solo declara ingles (`language: [en]`).
- Razonamiento y matematicas: tecnicamente soportados por la arquitectura, pero con rendimiento medido muy bajo (ver benchmarks).
- Vision y audio: no disponibles.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes locales con tool calling: el modelo puede ejecutar llamadas a funciones con argumentos estrictos (92-99 % de acierto segun cuantizacion en las pruebas del autor) e integrarse en bucles de agente sobre llama-server con la API compatible con OpenAI, lo que permite conectar herramientas externas sin infraestructura en la nube.
- Asistentes conversacionales sin filtros excesivos: para entornos donde los falsos rechazos sobre prompts benignos son un problema operativo (por ejemplo, redaccion tecnica o creativa), la variante abliterated reporta 0,0 % de over_refusal en la muestra evaluada.
- Automatizacion de escritorio o CI/CD con GPU de 8 GB: al ocupar 2,55 GB en IQ4_XS, cabe en tarjetas consumer y permite desplegar un agente de codigo o de operaciones en una estacion de trabajo sin GPU dedicada de datacenter.
- Procesamiento de documentos largos con contexto extendido: con cache KV q4_0 la ventana alcanza 135.535 tokens en IQ4_XS, util para resumir o extraer informacion de ficheros extensos, aunque con perdida de precision por la cuantizacion de la cache.
- Prototipado e investigacion de tecnicas de abliteration: el repositorio incluye `merge_info.json` y `eval.json`, lo que facilita reproducir y comparar merges ponderados y el efecto de la imatrix agentica.
- Servicio de inferencia ligero multi-cliente: con `-np 1` y cache KV q8_0 el modelo ofrece 71.754 tokens de contexto en IQ4_XS, suficiente para atender sesiones conversacionales concurrentes de tamano moderado en un solo servidor.
- Evaluacion comparativa de cuantizaciones: la tabla de benchmarks por cuantizacion (IQ3_M, IQ4_XS, Q5_K_M) permite elegir el punto de equilibrio entre VRAM, contexto y acierto en tool calling.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Nota: MMLU se midio en 0-shot con 150 preguntas (no comparable con cifras 5-shot publicadas); GSM8K con 80 muestras; AIME con 30 problemas (muestra ruidosa); tool_strict y tool_name sobre 100 prompts; over_refusal sobre 30 prompts benignos.

| Modelo | GB | MMLU 0-shot % | GSM8K % | AIME % | tool_strict % | tool_name % | over_refusal % |
|---|---|---|---|---|---|---|---|
| Huihui-NeoHorse-1-4B-abliterated-q8_0 | 4,61 | 0,0 | 1,2 | 0,0 | 100,0 | 100,0 | 0,0 |
| Sleipnir-IQ4_XS-agentic | 2,55 | 0,0 | 3,8 | 0,0 | 92,0 | 92,0 | 0,0 |
| Sleipnir-Q5_K_M-agentic | 3,09 | no ejecutado | no ejecutado | no ejecutado | 98,0 | 99,0 | 0,0 |
| Sleipnir-IQ3_M-agentic | 2,20 | no ejecutado | no ejecutado | no ejecutado | 90,0 | 91,0 | 0,0 |

Los resultados de conocimiento y matematicas son practicamente nulos en la muestra evaluada, mientras que el rendimiento en tool calling es alto y decrece con la agresividad de la cuantizacion (de 100 % en q8_0 a 90 % en IQ3_M). No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,2 GB (IQ3_M), 2,55 GB (IQ4_XS) y 3,09 GB (Q5_K_M) solo para pesos; hay que sumar la cache KV.
- Cache KV: 65.536 elementos por token. Contexto maximo alcanzable en una GPU de 8 GB:
  - IQ4_XS: 38.119 tokens con KV f16, 71.754 con KV q8_0, 135.535 con KV q4_0.
  - Q5_K_M: 34.014 con f16, 64.026 con q8_0, 120.939 con q4_0.
  - IQ3_M: 40.843 con f16, 76.881 con q8_0, 145.220 con q4_0.
- El contexto anunciado de 262.144 tokens requeriria unos 18,3 GB solo de cache KV en q8_0, inviable en 8 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070) para las cuantizaciones IQ3_M/IQ4_XS; Q5_K_M requiere algo mas de margen. Para contexto largo con KV q8_0 conviene una GPU de 12-16 GB (RTX 4080, RTX 4090, A4000).
- Cabe en GPU consumer: si, en todas las tarjetas de 8 GB o superiores con las cuantizaciones indicadas.
- Despliegue: llama.cpp / llama-server (comando documentado en la model card con `-ngl 99 --jinja -fa on`), y por extension cualquier runtime compatible con GGUF. vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles; el autor no publica medidas de velocidad, solo de calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoHorse-1-4B-Sleipnir-8GB (este) | ~4,2B | 262.144 anunciados; 38k-145k efectivos en 8 GB | 90-98 % tool_strict segun cuantizacion | Apache-2.0 | GGUF en HF |
| Huihui-NeoHorse-1-4B-abliterated | ~4,2B (no confirmado) | no disponible | 100 % tool_strict en la muestra del autor | no disponible | GGUF en HF |
| NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO | no disponible | no disponible | no disponible | no disponible | HF (donante del merge) |
| TokenRhythm/NeoHorse-1-4B (base) | ~4,2B | no disponible | no disponible | Apache-2.0 | HF |

La comparativa se limita a los modelos donantes citados en la propia model card, ya que no se dispone de datos de benchmarks de alternativas externas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento nulo en MMLU 0-shot y AIME en las pruebas del autor, y GSM8K entre 1,2 % y 3,8 %: no es adecuado para tareas de conocimiento factual ni de razonamiento matematico.
- Riesgo elevado de alucinacion en ausencia de herramientas: el modelo esta optimizado para tool calling y conversacion, no para responder con precision sin apoyo externo.
- Solo ingles declarado; el rendimiento en castellano no esta documentado y no deberia asumirse.
- El contexto efectivo en 8 GB es muy inferior al anunciado (38k-145k segun cache KV), y la cuantizacion de la cache (q4_0) degrada la calidad de la atencion en secuencias largas.
- La abliteration y el heretic eliminan parte de las capas de rechazo: el modelo puede generar contenido inapropiado y no debe desplegarse en entornos orientados al publico sin filtros externos.
- Licencia Apache-2.0, pero el autor remite a las mismas restricciones de uso que el modelo upstream; conviene verificar las condiciones de Qwen3.5-4B antes de uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta, creado y actualizado el mismo dia: sin validacion externa de la comunidad.
- Evaluaciones con muestras pequenas (30-150 items), lo que introduce alta varianza; las cifras no son directamente comparables con benchmarks publicados de otros modelos.
- No se documentan sesgos especificos ni resultados de evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sneg0wo/NeoHorse-1-4B-Sleipnir-8GB-Heretic-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Donante abliterated: https://huggingface.co/huihui-ai/Huihui-NeoHorse-1-4B-abliterated
- Donante heretic: https://huggingface.co/prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Papers, blogs, demos y repositorios adicionales: no disponibles en la informacion proporcionada.
