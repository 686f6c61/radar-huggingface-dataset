# julianmb/Laguna-S-2.1-ROCmFP4-StrixKVSpine-v4

## Resumen

Laguna S 2.1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por poolside, una empresa especializada en IA para ingeniería de software y agentes autónomos. El modelo está diseñado para tareas de razonamiento prolongado y trabajo de largo horizonte, con una arquitectura de 118B parámetros totales de los cuales solo 8B se activan por token, lo que permite un despliegue eficiente en hardware de alta memoria. Soporta una ventana de contexto de hasta 1M tokens en modos con y sin pensamiento explícito, y se distribuye bajo licencia Apache 2.0.

La ficha que nos ocupa corresponde a una cuantización específica del modelo original, publicada por el usuario julianmb en HuggingFace. Se trata de un archivo GGUF con formatos de tensor ROCmFP4 personalizados, optimizado para sistemas AMD Strix Halo (Ryzen AI Max+ 395 / Radeon 8060S con 128 GB de memoria unificada). Esta versión requiere un runtime especializado (Ciru ROCmFPX Runtime V3) y no es compatible con llama.cpp estándar. El archivo pesa 65,4 GB y alcanza una velocidad de generación de 33-38 tokens por segundo en el hardware objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer |
| Parametros totales | 118B |
| Parametros activos | 8B |
| Longitud de contexto | Hasta 1M tokens (modelo base); 131.072 tokens validados en esta cuantizacion |
| Tipos de cuantizacion | ROCmFP4 (formato propietario para ROCm) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensores ROCmFP4 personalizados) |

## Arquitectura y entrenamiento

El modelo base Laguna S 2.1 es un transformer MoE con 118B parámetros totales y 8B activos por token. Segun el anuncio de poolside, el entrenamiento cubrio desde el inicio hasta la fase de ajuste fino, aunque no se detallan el numero exacto de tokens ni la composicion del dataset. El modelo incorpora modos de pensamiento (thinking y no-thinking) y esta orientado a tareas de razonamiento y codificacion agente. La cuantizacion ROCmFP4 aplica formatos de tensor de 4 bits especificos para la arquitectura AMD RDNA 3.5 (gfx1151), con una cache KV en precision F16. El runtime Ciru ROCmFPX V3 anade protecciones contra DeviceLost, preflight de drivers y perfil de contexto seguro de 131K tokens.

## Capacidades

- Generacion de texto y razonamiento de largo horizonte, con soporte de modo thinking (pensamiento explicito) y modo sin pensamiento.
- Codificacion agente: disenado para flujos de trabajo de agente de codigo (Poolside Agent CLI) y APIs compatibles con OpenAI.
- Razonamiento multi-step y planificacion de tareas complejas.
- Soporte de tool calling y function calling, segun la documentacion de Poolside.
- Capacidades multilingues limitadas: la model card de la cuantizacion indica solo ingles, aunque el modelo base podria soportar mas idiomas (no confirmado en la informacion disponible).
- Integracion con Open WebUI y PrivChat a traves de endpoint OpenAI-compatible.

## Casos de uso

- Asistente de programacion en produccion: el modelo puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests y refactorizacion automatica, aprovechando su ventana de contexto amplia y su capacidad de razonamiento.
- Agente autonomo de resolucion de incidencias: con tool calling y modo thinking, puede descomponer problemas complejos, consultar APIs, ejecutar comandos y sintetizar soluciones en entornos de desarrollo.
- Analisis de repositorios de gran tamano: gracias al contexto de hasta 1M tokens (131K en esta cuantizacion), puede procesar multiples archivos y dependencias en una sola pasada para tareas de auditoria o migracion.
- Generacion de documentacion tecnica: a partir de codigo fuente y conversaciones, puede producir documentacion coherente y detallada.
- Soporte tecnico automatizado de nivel avanzado: gestiona conversaciones multi-turno con contexto largo, resolviendo dudas de programacion o configuracion sin perder el hilo.
- Entrenamiento y fine-tuning local en hardware AMD de gama alta: esta cuantizacion especifica permite ejecutar el modelo en un solo equipo con 128 GB de memoria unificada, ideal para equipos de investigacion sin acceso a clusters GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento corresponden a la cuantizacion en hardware Strix Halo, medidos por el autor:

| Metrica | Resultado |
|---|---|
| Velocidad de generacion (decode) | 33,1 – 38,3 t/s |
| Velocidad de prefill (eval de prompt) | 79,3 – 92,7 t/s |
| Time to First Token (TTFT) | ~560 – 618 ms |
| Contexto maximo validado | 131.072 tokens |
| Precision de cache KV | F16 / F16 |

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 65,4 GB. En el sistema objetivo (AMD Strix Halo con 128 GB de memoria unificada) se ejecuta completamente en memoria compartida, sin necesidad de VRAM dedicada.
- GPU recomendadas: AMD Ryzen AI Max+ 395 / Radeon 8060S (gfx1151) con 128 GB LPDDR5X-8533. No se garantiza funcionamiento en otras GPUs AMD o NVIDIA.
- Consumo en GPU de consumo: no cabe en GPUs de consumo tipicas (RTX 4090 con 24 GB, etc.) debido al tamano del archivo y al formato ROCmFP4 propietario.
- Opciones de despliegue: requiere el runtime Ciru ROCmFPX V3 (branch `agent/laguna-s21-runtime-v3`, commit `54f5fe06c74350fb8b6aec21d8749071bc195bdb`). No compatible con llama.cpp estandar, vLLM, Ollama o TGI sin modificaciones.
- Latencia y throughput: los datos medidos (33-38 t/s decode, 79-93 t/s prefill, TTFT ~560-618 ms) corresponden al perfil validado en Strix Halo.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. El modelo base Laguna S 2.1 compite con otros MoE de parametros activos similares (por ejemplo, Qwen2.5-MoE o DeepSeek-V3-Lite), pero no se han publicado comparaciones de rendimiento en los resultados de busqueda. La cuantizacion ROCmFP4 es especifica para AMD y no tiene equivalentes directos en otros ecosistemas.

## Limitaciones y advertencias

- Requiere un runtime propietario (Ciru ROCmFPX V3) y no carga en llama.cpp estandar. Cualquier intento de uso con herramientas convencionales fallara.
- Solo validado en hardware AMD Strix Halo con 128 GB de memoria unificada. No se garantiza funcionamiento en otras configuraciones.
- La model card de la cuantizacion indica idioma ingles unicamente; no se confirma soporte multilingue.
- El contexto maximo validado en esta cuantizacion es de 131.072 tokens, muy inferior al contexto nominal de 1M tokens del modelo base.
- Riesgo de alucinacion y sesgos no documentados: no se han publicado evaluaciones de sesgo o seguridad para esta cuantizacion.
- Licencia Apache 2.0 permite uso comercial, pero el runtime Ciru ROCmFPX tiene su propia licencia (no detallada en la informacion disponible) que debe revisarse antes de su uso en produccion.
- El archivo de 65,4 GB requiere un sistema con al menos 128 GB de RAM unificada para un rendimiento optimo; con menos memoria podria producirse swapping o fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julianmb/Laguna-S-2.1-ROCmFP4-StrixKVSpine-v4
- Runtime Ciru ROCmFPX: https://github.com/ciru-ai/ROCmFPX
- Modelo base en HuggingFace: https://huggingface.co/poolside/Laguna-S-2.1
- Coleccion de modelos Laguna S 2.1: https://huggingface.co/collections/poolside/laguna-s-21
- Blog de poolside sobre Laguna S 2.1: https://poolside.ai/blog/introducing-laguna-s-2-1
- Notas de version de Poolside: https://docs.poolside.ai/release-notes/models
- Pagina en Ollama: https://ollama.com/library/laguna-s-2.1
