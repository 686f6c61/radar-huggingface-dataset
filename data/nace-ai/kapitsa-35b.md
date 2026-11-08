# nace-ai/kapitsa-35b

## Resumen

Kapitsa 35B es un artefacto de despliegue publicado por nace-ai que empaqueta el modelo Qwen3.6 35B-A3B (una mezcla de expertos de 35.000 millones de parámetros totales y 3.000 millones activos por token) en una cuantización de 4 bits de 22,1 GB, optimizada para ejecutarse localmente en Apple Silicon mediante el motor de inferencia Kapitsa. No se trata de un entrenamiento nuevo: el repositorio declara como modelo base `Youssofal/Qwen3.6-35B-A3B-MTPLX-Optimized-Speed`, del que hereda los pesos, y añade una configuración de servicio orientada a latencia baja en Macs con memoria unificada.

La relevancia del artefacto es operativa más que algorítmica: demuestra que un MoE de 35B con 3B activos puede servirse en un portátil con 36-48 GB de memoria unificada a velocidades de decodificación de entre 100 y 350 tokens por segundo, y abre la puerta a usar agentes de código (opencode, Claude Code, Codex, pi) contra un endpoint local compatible con las APIs de OpenAI y Anthropic. El motor Kapitsa, según su repositorio, afirma tener la decodificación más rápida en 33 de las 38 combinaciones de modelo y Mac evaluadas.

La ficha se limita a lo declarado en la model card y en la búsqueda web disponible; no hay información publicada sobre composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks de calidad, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; 35B totales, 3B activos por token |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (22,1 GB) como configuración principal; 2 bits (10,8 GB) para M1 Pro 16 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio remite a los pesos del modelo base; el motor Kapitsa gestiona la descarga) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos: 35.000 millones de parámetros totales de los que solo 3.000 millones se activan por token, lo que reduce el coste computacional por paso de decodificación frente a un denso del mismo tamaño. El artefacto publicado por nace-ai no entrena pesos nuevos: parte de `Youssofal/Qwen3.6-35B-A3B-MTPLX-Optimized-Speed` y lo distribuye en una cuantización de 4 bits de 22,1 GB, con una variante de 2 bits de 10,8 GB pensada para equipos con 16 GB de memoria unificada.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del corpus, las etapas de alineación (RLHF, DPO) ni innovaciones de atención del modelo base. La innovación técnica documentada pertenece al motor de servicio: Kapitsa expone un endpoint local compatible con las APIs de OpenAI y Anthropic, arranca herramientas de agente (opencode, Claude Code, Codex, pi) contra el modelo y está optimizado para prefill y decodificación en Apple Silicon. Las cifras de velocidad declaradas son: 6.539 tok/s de prefill y 351 tok/s de decodificación en un M5 Max de 128 GB; 2.802 y 201 en un M5 Pro de 48 GB; 1.168 y 161 en un M4 Pro de 48 GB; 855 y 106 en un M3 Pro de 36 GB; y 462 y 52 en un M1 Pro de 16 GB con cuantización de 2 bits.

## Capacidades

- Generación de texto y conversación multi-turno en modo `text-generation`.
- Razonamiento y código: el motor está explícitamente orientado a agentes de programación (opencode, Claude Code, Codex, pi).
- Servicio de API local compatible con los esquemas de OpenAI y Anthropic, lo que permite conectar clientes existentes sin adaptadores.
- Ejecución local en Apple Silicon con memoria unificada, sin GPU dedicada.
- Dos perfiles de cuantización: 4 bits (22,1 GB) para calidad, 2 bits (10,8 GB) para equipos de 16 GB.
- Capacidades multilingües: no disponibles en la información publicada.
- Soporte de tool calling, function calling, agentes multi-paso, visión o audio: no disponible en la información publicada.

## Casos de uso

- Agente de código local en un Mac: arrancar `kapitsa claude` o `kapitsa codex` para que la herramienta de agente apunte a un endpoint local en lugar de a la nube, útil en entornos con código propietario que no puede salir de la máquina. El MoE de 3B activos mantiene la decodificación entre 100 y 350 tok/s según el chip.
- Asistencia de programación interactiva en un portátil de 36-48 GB: con 22,1 GB de pesos en 4 bits, cabe junto al sistema operativo y el IDE en un M3 Pro o M4 Pro, con 106-161 tok/s de decodificación suficientes para autocompletado y refactorizaciones guiadas.
- Sustitución de API en prototipos: al exponer un servidor compatible con OpenAI y Anthropic en `http://127.0.0.1:8000`, se pueden reutilizar SDKs y frameworks de evaluación sin cambiar el código de aplicación, solo la URL base.
- Procesamiento por lotes de documentos en local: el prefill de 855-6.539 tok/s según el chip permite ingerir prompts largos (lectura rápida) para tareas de extracción o resumen, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Desarrollo de agentes multi-paso en un equipo de 16 GB: la variante de 2 bits (10,8 GB) permite ejecutar el modelo en un M1 Pro con 16 GB a 52 tok/s de decodificación, adecuado para pruebas de flujos de agente con presupuesto de memoria ajustado.
- Evaluación comparativa de motores de inferencia: las tablas de velocidad por chip sirven como referencia para medir el rendimiento de alternativas (llama.cpp, MLX) en el mismo hardware con el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento publicados son de velocidad de inferencia en Apple Silicon:

| Mac | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| M5 Max 128 GB | 6.539 | 351 |
| M5 Pro 48 GB | 2.802 | 201 |
| M4 Pro 48 GB | 1.168 | 161 |
| M3 Pro 36 GB | 855 | 106 |
| M1 Pro 16 GB (2 bits, 10,8 GB) | 462 | 52 |

## Requisitos de hardware

- VRAM/memoria unificada: 22,1 GB para la cuantización de 4 bits; 10,8 GB para la de 2 bits.
- Hardware objetivo: Apple Silicon exclusivamente (el motor Kapitsa está construido para Mac). No hay soporte documentado para CUDA, ROCm ni CPU x86.
- Equipos recomendados por la model card: M5 Max 128 GB, M5 Pro 48 GB, M4 Pro 48 GB, M3 Pro 36 GB y M1 Pro 16 GB (este último solo con 2 bits).
- Cabe en GPU de consumo: no aplica; no hay soporte de GPU dedicada documentado. En Mac, cabe desde un M1 Pro de 16 GB en 2 bits.
- Despliegue: motor propietario Kapitsa (`kapitsa serve --model 35b`, `kapitsa claude`, `kapitsa codex`), con API local en `http://127.0.0.1:8000` compatible con OpenAI y Anthropic. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de la sección anterior; la decodificación va de 52 tok/s (M1 Pro, 2 bits) a 351 tok/s (M5 Max, 4 bits).

## Comparativa con modelos similares

No hay datos de calidad ni de arquitectura del modelo base más allá de los 35B totales y 3B activos, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los modelos alternativos citados son los que el propio motor Kapitsa declara soportar (Qwen, Nemotron y Flint), sin cifras verificables en la información disponible.

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kapitsa 35B (este) | 35B | 3B | no disponible | Apache 2.0 | Hugging Face + motor Kapitsa |
| Qwen (familia, vía Kapitsa) | no disponible | no disponible | no disponible | no disponible | motor Kapitsa |
| Nemotron (vía Kapitsa) | no disponible | no disponible | no disponible | no disponible | motor Kapitsa |
| Flint de Recursive (vía Kapitsa) | no disponible | no disponible | no disponible | no disponible | motor Kapitsa |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgo o toxicidad.
- Riesgo de alucinación: no cuantificado; no hay benchmarks de veracidad ni de fidelidad publicados.
- Contexto e idiomas: la longitud de contexto y la lista de idiomas soportados no están documentadas, lo que impide garantizar su comportamiento en conversaciones largas o en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base (`Youssofal/Qwen3.6-35B-A3B-MTPLX-Optimized-Speed`) y de los pesos originales de Qwen3.6, ya que las obligaciones pueden heredarse.
- Dependencia de plataforma: solo Apple Silicon; no hay rutas de despliegue en CUDA ni en servidores x86, lo que limita su uso en producción fuera del ecosistema Mac.
- Dependencia del motor: el rendimiento declarado está medido con Kapitsa; otros motores (llama.cpp, MLX) pueden dar cifras distintas y no están evaluados en la información disponible.
- Cuantización agresiva: la variante de 2 bits (10,8 GB) puede degradar la calidad de forma no documentada; no se publican comparativas de perplejidad entre 4 y 2 bits.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/kapitsa-35b
- Modelo base: https://huggingface.co/Youssofal/Qwen3.6-35B-A3B-MTPLX-Optimized-Speed
- Repositorio del motor Kapitsa: https://github.com/nace-ai/kapitsa
- Documentación del motor (rama principal): https://github.com/nace-ai/kapitsa/tree/main
