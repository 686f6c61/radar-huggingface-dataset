# episod/olmo-hybrid-7b-blackhole

## Resumen

olmo-hybrid-7b-blackhole es un paquete comunitario publicado por el usuario episod que empaqueta el modelo base allenai/Olmo-Hybrid-7B (revisión `4f1cc566f9fdf3ce68da2ab6a788a83d89896dcf`) para su ejecución sobre una malla de cuatro chips Tenstorrent Blackhole, distribuidos en dos placas p300c. No es un modelo nuevo ni un fine-tuning: es un port a ttnn del modelo original de Ai2, empaquetado como bundle fino de `tt-model` (v6) que incluye un servidor con API compatible con OpenAI escrito como aplicación ASGI. Los pesos no se alojan en el repositorio; el primer arranque los descarga (unos 15 GB) desde la caché de Hugging Face.

El modelo subyacente, Olmo-Hybrid-7B, es un transformer híbrido de 7.400 millones de parámetros desarrollado por el Allen Institute for AI que combina 24 capas de Gated Delta Net (GDN, recurrente) con 8 capas de atención completa, en una proporción 3:1 (tres capas GDN seguidas de una de atención, repitiendo). Según Ai2, esta arquitectura supera de forma consistente a Olmo 3 con aproximadamente el doble de eficiencia de datos en las evaluaciones principales durante el preentrenamiento.

La relevancia de este paquete es fundamentalmente de infraestructura: demuestra que un modelo híbrido RNN-atención de 7B puede servirse en hardware Tenstorrent Blackhole mediante un port generado en gran medida por un modelo de código dentro del arnés tt-orchard y validado contra una referencia en CPU con transformers. Es un artefacto de interés para quien evalúe el ecosistema Tenstorrent, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas Gated Delta Net (recurrentes) + 8 capas de atención completa (proporción 3:1) |
| Parametros totales | 7,4 mil millones (7.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens según el modelo; el servidor limita por defecto a 16.384 (`OLMO_MAX_LEN`) |
| Tipos de cuantizacion | no disponible (el paquete sirve pesos en el formato que espera el port ttnn; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos originales descargados desde Hugging Face (unos 15 GB); el bundle contiene el port ttnn, no los pesos. No se especifica safetensors/GGUF en la información disponible |

## Arquitectura y entrenamiento

Olmo-Hybrid-7B es un modelo híbrido que intercala capas de Gated Delta Net con capas de atención estándar en una proporción 3:1 (tres GDN seguidas de una de atención, repitiendo), hasta 24 capas GDN y 8 de atención. Está basado en OLMo3 7B, pero con un número reducido de cabezas de atención para igualar la relación parámetros/throughput y permitir una comparación justa con la variante transformer pura. Ai2 reporta que esta arquitectura supera a Olmo 3 con aproximadamente 2x de eficiencia de datos en las evaluaciones principales a lo largo del preentrenamiento. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo base es de tipo pretrained/base, sin plantilla de chat.

El paquete blackhole añade una capa de despliegue: un port a ttnn del modelo y un servidor ASGI con rutas estilo OpenAI. El port lo escribió un modelo de lenguaje dentro del arnés de bring-up tt-orchard (un modelo de código local con un modelo alojado redactando reparaciones), y el arnés lo validó contra una referencia en CPU. El bundle se generó con el paso de "canning" de tt-orchard (`tt-orchard can`). Como innovación técnica destacable, el paquete incluye comprobaciones de calidad: la etapa 6 del arnés reporta una concordancia top-1 forzada por profesor de 1.0, perplejidad de 2.996 sobre la continuación de referencia de 32 tokens y una ejecución libre que coincidió en los 32 tokens, aunque sobre un único prompt.

## Capacidades

- Generación de texto autoregresiva sobre el modelo base Olmo-Hybrid-7B, sin plantilla de chat propia.
- Ruta `/v1/completions` recomendada para prompts; la ruta `/v1/chat/completions` formatea los mensajes como líneas `role: content` terminadas en `assistant:`, que un modelo base sigue solo de forma laxa.
- Decodificación greedy por defecto; se activa muestreo si `temperature` es mayor que 0, con soporte de `top_p`, `seed` y hasta cuatro cadenas de parada (`stop`).
- Streaming de respuestas y devolución opcional de los identificadores de tokens generados (`return_token_ids`).
- Metadatos de uso y tiempos por respuesta: objeto `usage` y objeto `timings` con segundos de prefill, segundos de decodificación y tokens por segundo en decodificación.
- Endpoints de servicio: `GET /health`, `GET /v1/models`, `POST /v1/completions`, `POST /v1/chat/completions`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Evaluación de hardware Tenstorrent Blackhole: el paquete permite medir el rendimiento real de un modelo de 7B sobre una malla de cuatro chips p300c, con métricas de prefill y decodificación por petición, útil para comparar el stack ttnn con GPU convencionales.
- Validación de ports generados por modelos de código: sirve como caso de estudio de un port ttnn escrito por un modelo de lenguaje y verificado contra una referencia en CPU con transformers, con datos de concordancia top-1 y perplejidad.
- Pruebas de integración de APIs compatibles con OpenAI: al exponer `/v1/completions` y `/v1/chat/completions`, se puede conectar a clientes y frameworks que hablan el protocolo de OpenAI para probar pipelines sin cambiar el código de cliente.
- Generación de texto con contexto largo controlado: el servidor admite hasta 65.536 tokens de contexto (16.384 por defecto vía `OLMO_MAX_LEN`), lo que permite experimentar con prompts largos y medir el coste de prefill a distintas longitudes (por ejemplo, 9.101 tokens de prompt tardan unos 137,7 s en prefill).
- Banchmarking de latencia y throughput en entornos con carga variable: el paquete documenta la sensibilidad de la decodificación a la carga del host (de 2,2 a 11,5 tok/s según la ejecución), lo que lo hace útil para estudiar la variabilidad de rendimiento en despliegues compartidos.
- Investigación sobre arquitecturas híbridas RNN-atención: permite ejecutar un modelo con 24 capas GDN y 8 de atención y observar su comportamiento generativo en un entorno de servicio real, sin depender de GPU.
- Reproducción de un bundle de `tt-model`: sirve para verificar el flujo `tt-model serve <owner>/olmo-hybrid-7b-blackhole`, la instalación de un venv con Python 3.12 y dependencias fijadas (`ttnn==0.80.0` desde PyPI), y el arranque del servidor en el puerto 20120.

## Benchmarks y rendimiento

Los datos disponibles son medidas de rendimiento del servidor, no benchmarks de calidad estándar (MMLU, HumanEval, GSM8K). Se presentan tal cual los publica la model card.

| Medida | Valor |
|---|---|
| Decodificación servida, batch 1, greedy (cifra principal) | 7,277 tok/s (mín. 3,589, máx. 9,295; 15 ejecuciones) |
| Decodificación servida, segunda medición con caché de kernels vacía | 9,68 tok/s (mín. 7,963, máx. 11,467; 15 ejecuciones) |
| Prefill, 141 tokens de prompt | 1,077 s (mín. 0,996, máx. 1,129; 3 ejecuciones); 130,9 tok/s |
| Prefill, 561 tokens de prompt | 4,623 s (mín. 4,417, máx. 4,788; 3 ejecuciones); 121,4 tok/s |
| Prefill, 2.261 tokens de prompt | 22,368 s (mín. 22,256, máx. 22,6; 3 ejecuciones); 101,1 tok/s |
| Prefill, 9.101 tokens de prompt | 137,655 s (mín. 130,653, máx. 165,194; 3 ejecuciones); 66,1 tok/s |
| Decodificación en proceso en el arnés de bring-up (no es la tasa servida) | 13,9 tok/s (mín. 13,9, máx. 13,9; 3 ejecuciones, 32 pasos, caliente) |
| Comprobaciones de arranque (4 ejecuciones, petición de 64 tokens) | 2,2; 5,5; 7,6; 9,3 tok/s |

Condiciones de medición: malla de cuatro chips Blackhole p300c, ttnn 0.80.0, una petición a la vez, decodificación greedy, caché de kernels caliente. La carga media del host era de 3,6/7,6/9,1 antes de la medición y 9,2/9,9/9,9 después. El port ejecuta buena parte del trabajo en la CPU del host, por lo que la velocidad de decodificación cae cuando otros procesos compiten por ella. Con caché de kernels vacía, el servidor tardó 40 s en estar listo y la primera petición (8 tokens) tardó 6,74 s. No se admite batching: una segunda petición recibe 503 mientras hay una en curso.

Calidad: la etapa 6 del arnés reporta concordancia top-1 forzada por profesor de 1.0, perplejidad de 2,996 sobre la continuación de referencia de 32 tokens y coincidencia en los 32 tokens en ejecución libre, pero sobre un único prompt. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: malla de cuatro chips Tenstorrent Blackhole (dos placas p300c), con fabric 1-D en malla 1x4 (`OLMO_CHIPS=4` por defecto). No es ejecutable en GPU convencional ni en CPU con este paquete.
- En máquina compartida, es necesario tomar un lease de ambas placas antes de arrancar el servidor.
- VRAM estimada: no aplica; la memoria requerida es la de los cuatro chips Blackhole, no se documenta en la información disponible.
- Almacenamiento: unos 15 GB para los pesos descargados en la caché de Hugging Face, más el venv con Python 3.12 y `ttnn==0.80.0`.
- Despliegue: mediante `tt-model serve <owner>/olmo-hybrid-7b-blackhole`, que instala el bundle en su propio venv y lo sirve; alternativamente, `bash install.sh` y después `bash run.sh`, que lanza uvicorn en 127.0.0.1:20120 (configurable con `PORT` y `HOST`).
- Latencia y throughput: decodificación servida de 2,2 a 11,5 tok/s según la ejecución y la carga del host; prefill de 66,1 a 130,9 tok/s según la longitud del prompt (ver tabla de benchmarks).
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo-hybrid-7b-blackhole (este paquete) | 7,4B | 65.536 (16.384 por defecto en servidor) | Híbrido GDN + atención (3:1) portado a ttnn | Apache 2.0 | Paquete comunitario en HF; requiere 4 chips Blackhole |
| allenai/Olmo-Hybrid-7B | 7,4B | 65.536 | Híbrido GDN + atención (3:1) | Apache 2.0 | Modelo base en HF; ejecutable en GPU/CPU con transformers |
| OLMo3 7B (referencia de Ai2) | ~7B | no disponible | Transformer puro | no disponible | Modelo de Ai2; Ai2 reporta que Olmo-Hybrid lo supera con ~2x eficiencia de datos |

La comparación con OLMo3 7B se limita a la afirmación de Ai2 sobre eficiencia de datos; no se dispone de cifras de benchmarks comparativas en la información proporcionada. No se han identificado en la búsqueda web otros paquetes equivalentes para Tenstorrent Blackhole con los que comparar directamente.

## Limitaciones y advertencias

- Es un paquete comunitario, no un lanzamiento del Allen Institute for AI ni de Tenstorrent; no debe tratarse como una distribución oficial.
- El modelo base es pretrained, sin plantilla de chat; la ruta `/v1/chat/completions` solo sigue de forma laxa el formato `role: content`, por lo que no es adecuado para asistentes conversacionales sin ajuste adicional.
- No se admite batching: una sola petición a la vez; la segunda recibe 503 con `Retry-After: 5`, lo que limita el throughput agregado en producción.
- El rendimiento es muy variable según la carga del host: la decodificación servida ha oscilado entre 2,2 y 11,5 tok/s en las distintas ejecuciones, porque el port ejecuta mucho trabajo en la CPU del host.
- El prefill es costoso en contextos largos: 137,7 s para 9.101 tokens de prompt, lo que desaconseja prompts muy largos en uso interactivo.
- La validación de calidad es limitada: la comprobación de la etapa 6 del arnés cubre un único prompt, y la tabla adicional de cuatro prompts cortos no se detalla por completo en la información disponible.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de alucinación en la información disponible; al ser un modelo base, el riesgo de generación no fiable es inherente.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero el paquete depende de `ttnn==0.80.0` y de hardware Tenstorrent; verificar las condiciones de uso del hardware y del stack en despliegues comerciales.
- El límite de contexto del servidor es 16.384 tokens por defecto (`OLMO_MAX_LEN`), inferior a los 65.536 que soporta el modelo; hay que ajustarlo explícitamente para aprovechar el contexto completo.
- Límites del servidor: cuerpo de petición máximo de 1 MiB, JSON malformado, campos inválidos o prompt más largo que el contexto devuelven 400.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/episod/olmo-hybrid-7b-blackhole
- Modelo base en Hugging Face: https://huggingface.co/allenai/Olmo-Hybrid-7B
- Repositorio OLMo-core (scripts oficiales de OLMo-hybrid): https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo-hybrid
- Ficha de Olmo-Hybrid-7B en The AI Toolchain: https://aitoolchain.io/tools/olmo-hybrid-7b/
- Ficha de Olmo-Hybrid-7B en Applied: https://theapplied.co/models/allenai-olmo-hybrid-7b
- Sitio de Episod: https://www.episod.com/
