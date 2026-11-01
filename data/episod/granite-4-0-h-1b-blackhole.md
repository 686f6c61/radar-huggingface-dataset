# episod/granite-4.0-h-1b-blackhole

## Resumen

`episod/granite-4.0-h-1b-blackhole` es un paquete de despliegue comunitario que permite ejecutar el modelo `ibm-granite/granite-4.0-h-1b` de IBM sobre un único chip Tenstorrent Blackhole. No contiene pesos propios: es un bundle fino (v6) para la herramienta `tt-model` que empaqueta el port a TTNN del modelo, junto con un servidor de chat compatible con la API de OpenAI implementado como aplicacion ASGI. El objetivo es servir Granite-4.0-H-1B en hardware de aceleracion no-GPU (Tenstorrent) con una interfaz estandar.

El modelo subyacente, Granite-4.0-H-1B, es una arquitectura hibrida de aproximadamente 1.500 millones de parametros que combina 36 capas Mamba-2 con 4 capas de atencion. Esta mezcla reduce el coste computacional del estado recurrente frente a un transformer puro, manteniendo la capacidad de atencion en un numero reducido de capas. El modelo soporta hasta 131.072 tokens de contexto, aunque el bundle limita por defecto a 2.048 tokens (configurable mediante `GRANITE_MAX_LEN`).

La relevancia de este paquete es doble: por un lado, demuestra la viabilidad de ejecutar modelos hibridos Mamba-2/attention en aceleradores Tenstorrent con rendimiento medido; por otro, ofrece una via de despliegue lista para usar (`tt-model serve`) con API compatible con OpenAI, lo que facilita la integracion en herramientas existentes. Es un paquete comunitario, no una release oficial de IBM ni de Tenstorrent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 36 capas Mamba-2 + 4 capas de atencion (transformer hibrido) |
| Parametros totales | ~1.500 millones (1.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens en el modelo; 2.048 por defecto en el servidor (`GRANITE_MAX_LEN`) |
| Tipos de cuantizacion | no disponible (pesos en el formato del port TTNN; el bundle descarga ~3 GB de pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo de IBM; codigo del bundle de Tenstorrent, tambien Apache 2.0) |
| Formato de pesos | TTNN (port para Tenstorrent); los pesos no estan incluidos en el repositorio, se descargan de la revision fijada de `ibm-granite/granite-4.0-h-1b` |

## Arquitectura y entrenamiento

El modelo base Granite-4.0-H-1B emplea una arquitectura hibrida que intercala 36 capas Mamba-2 (modelo de espacio de estados) con 4 capas de atencion. Esta combinacion busca reducir el coste de inferencia en secuencias largas: las capas Mamba-2 procesan el estado de forma recurrente con coste lineal, mientras que las pocas capas de atencion preservan la capacidad de recuperacion precisa de informacion. El bundle incluye un parametro `GRANITE_SSD_PRECISION` (por defecto `fp32`) que controla la precision del estado de las capas Mamba-2; `bf16` es mas rapido pero menos preciso en textos largos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El paquete en si no entrena: es un port de inferencia a TTNN construido mediante el paso de "canning" de `tt-orchard`. La innovacion tecnica destacable es la ejecucion de un modelo hibrido Mamba-2/attention en un chip Tenstorrent con decodificacion trazada (traced decode) y prefill por chunks, logrando aproximadamente 34 tok/s en decodificacion.

## Capacidades

- Generacion de texto conversacional mediante plantilla de chat propia del modelo.
- Razonamiento y respuesta a preguntas generales (el ejemplo de la model card usa "cual es la capital de Francia").
- Decodificacion greedy (sin temperatura o con temperatura 0) y muestreo en host con temperatura > 0.
- Streaming de respuestas (`stream`).
- Control de generacion mediante `max_tokens`/`max_completion_tokens` (por defecto 256, maximo 4096), `stop`, `temperature`, `top_p` y `seed`.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling / function calling: no soportado (el servidor devuelve 400 ante tool calls).
- Entradas de documento: no soportadas (devuelve 400).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal es servir Granite-4.0-H-1B en un chip Blackhole p300c sin GPU, usando `tt-model serve` para instalar el bundle en un venv propio y arrancar el servidor en el puerto 20110.
- Integracion con clientes compatibles con OpenAI: al exponer `POST /v1/chat/completions`, se puede apuntar cualquier cliente o SDK que hable el protocolo de OpenAI al endpoint local, sin adaptadores adicionales.
- Prototipado y evaluacion de modelos hibridos: util para investigadores que quieran medir el comportamiento de una arquitectura Mamba-2/attention en aceleradores no-GPU con metricas de prefill, primer token y tokens por segundo incluidas en la respuesta (`timings`).
- Asistente conversacional de contexto corto: con la configuracion por defecto de 2.048 tokens, adecuado para dialogos multi-turno breves o tareas de respuesta unica en entornos controlados.
- Pruebas de humo y validacion de pipelines: el script `tools/smoke.py --port 20110` permite verificar de extremo a extremo un servidor en marcha, util en CI o en la puesta a punto de un nodo.
- Experimentacion con precision del estado Mamba-2: el parametro `GRANITE_SSD_PRECISION` permite comparar `fp32` frente a `bf16` en calidad y velocidad sobre textos largos, un escenario de interes para quien ajuste el runtime.
- Inferencia de un solo inquilino en laboratorio: con una peticion simultanea y sin autenticacion, encaja en entornos de desarrollo donde el acceso esta restringido a la red local.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del paquete de receta (mismo codigo de runtime) en un chip Blackhole p300c con tt-metal v0.80.0:

| Metrica | Valor |
|---|---|
| Decodificacion trazada | ~34 tok/s |
| Tiempo hasta el primer token (prompt corto) | 0,32 s |
| Prefill, prompt de 128 tokens | 123 tok/s |
| Prefill, prompt de 512 tokens | 406 tok/s |
| Prefill, prompt de 1.024 tokens | 651 tok/s |
| Coincidencia top-1 con referencia CPU fp32 | 0,979 (cuatro prompts cortos) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores son de rendimiento de inferencia, no de calidad.

## Requisitos de hardware

- Acelerador: un chip Tenstorrent Blackhole p300c. El paquete esta probado en esa placa concreta con tt-metal v0.80.0 (rueda `ttnn` 0.80.0 de PyPI) y Python 3.12.
- Memoria: los pesos fijados ocupan aproximadamente 3 GB y se descargan en la cache de Hugging Face en el primer arranque.
- VRAM estimada: no aplica (no es GPU); la memoria la aporta el chip Blackhole.
- GPU recomendadas: no aplica; el bundle esta disenado para Tenstorrent, no para CUDA.
- Cabe en GPU consumer: no disponible; el paquete no esta orientado a GPU.
- Despliegue: `tt-model serve <owner>/granite-4.0-h-1b-blackhole`, o manualmente `bash install.sh` seguido de `bash run.sh` (uvicorn en 127.0.0.1:20110; `PORT` y `HOST` configurables). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este bundle.
- Latencia y throughput: ver tabla de benchmarks; una peticion a la vez, sin batching. Una segunda peticion concurrente recibe 503 con `Retry-After: 5`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo base `ibm-granite/granite-4.0-h-1b` es la alternativa directa (mismo modelo, sin el port a Tenstorrent), y el paquete de receta `granite-4.0-h-1b-blackhole` (version 0.3.0, mismo propietario) ofrece el mismo codigo con un `run.sh` plano y los ficheros de evidencia. No hay comparativa con otros modelos de la misma categoria disponible.

## Limitaciones y advertencias

- Una sola peticion simultanea, un solo chip y sin batching; una segunda peticion concurrente recibe 503.
- Contexto por defecto de 2.048 tokens, muy por debajo de los 131.072 que soporta el modelo; hay que subir `GRANITE_MAX_LEN` para aprovecharlo.
- Solo se ha medido decodificacion greedy; la salida con muestreo no ha sido evaluada.
- No soporta tool calls ni entradas de documento (devuelve 400).
- Tras un fallo en la captura de traza, `/health` y todas las peticiones devuelven 503 hasta reiniciar el servidor.
- El servidor no tiene autenticacion, TLS ni limite de tasa; por defecto escucha en 127.0.0.1, y `HOST=0.0.0.0` solo debe usarse en redes de confianza.
- Probado unicamente en una placa Blackhole p300c con tt-metal v0.80.0 y Python 3.12; no hay garantia en otras configuraciones.
- Los modos opcionales de kernel tt-lang (`GRANITE_SSD=state_full_ro` y otros) requieren el paquete tt-lang, que no esta en `requirements.txt`, y no son el modo por defecto.
- Es un paquete comunitario, no una release oficial de IBM ni de Tenstorrent.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Licencia Apache 2.0 (modelo de IBM y codigo de Tenstorrent), permisiva para uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del bundle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/episod/granite-4.0-h-1b-blackhole
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-1b (revision `d18cca4c121edb87d022116d281ce212c9136f57`)
- Repositorio del paquete de receta (mismo propietario): `granite-4.0-h-1b-blackhole`, version 0.3.0, con ficheros de evidencia
- Repositorio tt-orchard (runtime y logs): `docs/run-logs/2026-10-30-granite-thin-bundle.md`
- tt-metal v0.80.0 y rueda `ttnn` 0.80.0 en PyPI
- Resultados de busqueda web: no relevantes (corresponden a un estudio de fitness y a una plataforma de ficcion interactiva, sin relacion con el modelo)
