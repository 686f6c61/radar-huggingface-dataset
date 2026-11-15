# changh95/gpt-oss-120b-p150x8

## Resumen

`changh95/gpt-oss-120b-p150x8` es un paquete de despliegue, no un modelo entrenado desde cero: empaqueta los pesos oficiales de `openai/gpt-oss-120b` (commit `b5c939de8f754692c1647ca79fbf85e8c1e70f8a`) para ejecutarlos sobre hardware Tenstorrent Blackhole, concretamente sobre una malla de ocho tarjetas P150 con paralelismo tensorial (TP=8). Lo publica el usuario changh95 mediante la herramienta `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1) y se sirve a través de vLLM con el plugin `vllm-tt-plugin`, exponiendo un servidor compatible con la API de OpenAI en el puerto 20000.

El modelo subyacente es un Mixture-of-Experts de OpenAI con 117.000 millones de parametros totales y 5.100 millones activos por token, 128 expertos con enrutamiento top-4, ventana de contexto nativa de 131.072 tokens y formato de chat Harmony. Este paquete concreto, sin embargo, restringe la ejecucion a 16.384 tokens de contexto y hasta 32 secuencias concurrentes, segun la configuracion de la malla P150x8.

Su relevancia es acotada pero clara: demuestra la viabilidad de servir un MoE de ~120B en aceleradores no-GPU (Blackhole de Tenstorrent) con decodificacion trazada y prefill secuencial, alcanzando 29 tok/s por usuario en decodificacion individual y 730 tok/s agregados con 32 usuarios sobre prompts de 128 tokens. Es material de referencia para quien evalue alternativas de hardware de inferencia, no un checkpoint nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (128 expertos, top-4), formato de chat Harmony |
| Parametros totales | 117B (modelo base `openai/gpt-oss-120b`) |
| Parametros activos | 5,1B por token |
| Longitud de contexto | 131.072 tokens en el modelo base; 16.384 tokens en esta configuracion P150x8 |
| Tipos de cuantizacion | Expertos y KV cache en bfp8 (block floating point); no se documentan otras opciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Pesos originales de `openai/gpt-oss-120b` descargados aparte (no incluidos en la imagen Docker); imagen de contenedor + manifiesto `tt-model` |
| Hardware objetivo | 8x Tenstorrent Blackhole P150 (malla logica 1x8, TP=8) |
| Concurrencia maxima | 32 secuencias |
| Servidor | vLLM v0.25.1 + `vllm-tt-plugin` (rama `solar-fixes`, commit `ba73d09`), API compatible OpenAI en puerto 20000 |
| Tamano del repo | 3,4 GB (sin pesos) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso de tipo MoE: 117B parametros totales con 5,1B activos por token, 128 expertos y enrutamiento top-4. Emplea el formato de chat Harmony de OpenAI para estructurar turnos, canales de razonamiento y llamadas a herramientas. No se dispone en la informacion proporcionada de detalles sobre el corpus de entrenamiento, el numero de tokens vistos, la composicion del dataset ni las etapas de alineacion (RLHF/DPO); esos datos corresponden a la model card original de `openai/gpt-oss-120b`, que no se incluye aqui.

La innovacion tecnica de este paquete es de sistema, no de modelado: la implementacion en tt-metal (commit `ed28fce3a4c`) incorpora programas de prefill seguros para trazado, la correccion de la tabla de paginas en prefill con padding (tenstorrent/tt-metal#56324) y la exclusion de las filas de padding del servidor en la union de expertos. La decodificacion esta trazada y el prefill se ejecuta de uno en uno, de modo que el TTFT crece linealmente con el numero de usuarios en cola: el usuario n-esimo espera aproximadamente n prefills completos.

## Capacidades

- Generacion de texto y razonamiento en el modelo base, con modo de razonamiento estructurado propio del formato Harmony.
- Generacion de codigo y matematicas (capacidades heredadas de `gpt-oss-120b`; no verificadas en esta ficha por ausencia de benchmarks propios).
- Soporte de tool calling y function calling a traves del formato Harmony y de la API compatible con OpenAI que expone vLLM.
- Razonamiento multi-paso y flujos de agente, limitados en la practica por la ventana efectiva de 16.384 tokens de esta configuracion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Servicio concurrente de hasta 32 secuencias con un unico endpoint OpenAI-compatible.
- No se documentan capacidades de vision ni de audio en esta configuracion.

## Casos de uso

- Evaluacion de hardware alternativo a GPU: desplegar el paquete con `tt-model pull --with-weights` y `tt-model serve` para medir throughput y TTFT reales de un MoE de 117B sobre ocho Blackhole P150 antes de comprometer una compra de infraestructura.
- Servicio de chat interno de baja concurrencia: con 32 usuarios simultaneos y 20-27 tok/s por usuario en decodificacion, encaja en equipos pequenos que necesiten un asistente con API OpenAI sin depender de la nube.
- Prototipado de agentes con tool calling: el formato Harmony y el endpoint compatible con OpenAI permiten conectar frameworks de agentes existentes sin adaptadores propios, siempre que las trazas queden por debajo de 16.384 tokens.
- Generacion de codigo en pipelines internos: con prompts de 1.024-8.192 tokens de entrada y salidas de 128 tokens, el sistema mantiene 25-27 tok/s por usuario hasta 32 sesiones, suficiente para tareas de autocompletado o revision por lotes.
- Investigacion en inferencia distribuida: el repositorio incluye `code/` byte-identico al codigo del modelo dentro de la imagen, lo que permite reproducir el build exacto (tt-metal `ed28fce3a4c`, vLLM v0.25.1, plugin `ba73d09`) y auditar las modificaciones de serving.
- Benchmarking de decodificacion especulativa y trazado: las tablas de rendimiento publicadas sirven como linea base reproducible para comparar optimizaciones futuras del stack tt-metal/vLLM sobre la misma malla.
- Despliegue aislado en entornos sin GPU: al ejecutarse sobre aceleradores Blackhole, es una opcion para instalaciones con restricciones de suministro de GPU o con requisitos de soberania de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Si se publican datos de rendimiento medidos sobre ocho Blackhole P150 con pesos reales, expertos y KV cache en bfp8, decodificacion greedy y caches calientes (barrido de regresion del 2026-09-05):

| Usuarios concurrentes | Decodificacion por usuario (128/128 tok) | Throughput agregado (128/128 tok) | TTFT medio (128/128 tok) |
|---|---|---|---|
| 1 | 29,1 tok/s | 29 tok/s | 146 ms |
| 2 | 26,7 tok/s | 53 tok/s | 186 ms |
| 4 | 25,2 tok/s | 101 tok/s | 316 ms |
| 8 | 23,8 tok/s | 190 tok/s | 560 ms |
| 16 | 22,1 tok/s | 354 tok/s | 1.308 ms |
| 32 | 20,9 tok/s | 668 tok/s | 2.046 ms |

Con prompts de 128 tokens y salidas de 1.024 tokens, el throughput agregado sube a 659 tok/s con 32 usuarios. El coste del prefill secuencial es el factor dominante del TTFT: con 32 usuarios y entradas de 8.192 tokens, el TTFT medio alcanza 48.551 ms. La imagen final (tt-metal `ed28fce3a4c`) reporta 29 tok/s para un usuario y 730 tok/s agregados para 32 usuarios con prompts de 128 tokens.

## Requisitos de hardware

- Hardware obligatorio: ocho tarjetas Tenstorrent Blackhole P150 en malla logica 1x8. No hay soporte documentado para GPU convencionales en este paquete.
- VRAM: no aplica; la memoria reside en los aceleradores Blackhole. No se especifica la capacidad total de memoria utilizada por el paquete.
- Pesos: se descargan aparte de la imagen Docker mediante `tt-model pull --with-weights` (commit `b5c939de8f754692c1647ca79fbf85e8c1e70f8a` de `openai/gpt-oss-120b`) y se almacenan en la cache de Hugging Face.
- Despliegue: `tt-model serve` levanta un servidor compatible con OpenAI en el puerto 20000 (o el siguiente libre). El primer arranque compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- Stack software: vLLM v0.25.1, `vllm-tt-plugin` (rama `solar-fixes`), tt-metal `ed28fce3a4c`, `tt-model-manager` 0.1.0.
- No se documenta compatibilidad con llama.cpp, Ollama, TGI ni con cuantizaciones GGUF/AWQ/GPTQ.
- Latencia y throughput: ver la tabla de la seccion anterior; el TTFT crece de forma aproximadamente lineal con el numero de usuarios por el prefill secuencial.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|---|
| `changh95/gpt-oss-120b-p150x8` | 117B | 5,1B | 16.384 (config. P150x8; 131K en el base) | no disponible | 8x Blackhole P150 | Paquete de despliegue; 29 tok/s por usuario, 730 tok/s agregados a 32 usuarios |
| `openai/gpt-oss-120b` | 117B | 5,1B | 131.072 | no disponible en esta ficha | GPU (segun despliegue) | Checkpoint original; misma arquitectura y pesos |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion relevante es contra el propio checkpoint original: este paquete no altera los pesos, solo la plataforma de ejecucion y el limite de contexto efectivo (16.384 frente a 131.072 tokens).

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier evaluacion de calidad debe remitirse a `openai/gpt-oss-120b`. Este repositorio solo aporta el empaquetado y el rendimiento en Blackhole.
- La ventana de contexto efectiva se reduce a 16.384 tokens, muy por debajo de los 131.072 del modelo base; tareas de documento largo no son viables.
- El prefill es secuencial: el TTFT crece con el numero de usuarios en cola (hasta 48,5 s de media con 32 usuarios y entradas de 8.192 tokens), lo que lo hace inadecuado para cargas interactivas con prompts largos y alta concurrencia.
- Dependencia de hardware muy especifico: ocho Blackhole P150. No hay ruta de despliegue documentada en GPU ni en CPU.
- El primer arranque requiere compilacion de kernels (varios minutos), lo que complica el escalado elastico y los arranques en frio.
- La licencia no aparece en la informacion proporcionada; antes de un uso comercial debe verificarse la licencia del checkpoint `openai/gpt-oss-120b` y la del stack tt-metal/vLLM.
- Riesgo de alucinacion y sesgos: no documentados en esta ficha; son los inherentes al modelo base y no han sido reevaluados en esta configuracion.
- Idiomas soportados no disponibles; no se puede confirmar el comportamiento multilingue en esta configuracion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-09-12) y la de actualizacion (2026-11-15) deben contrastarse con el estado real del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/changh95/gpt-oss-120b-p150x8
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Herramienta de empaquetado: https://github.com/tenstorrent/tt-model-manager
- Commit de tt-metal usado en el build: https://github.com/tenstorrent/tt-metal/commit/ed28fce3a4cd5f14f17fbb3b1a58e9903d40ed86
- Issue de tt-metal referenciado: https://github.com/tenstorrent/tt-metal/issues/56324
- Release de vLLM v0.25.1: https://github.com/vllm-project/vllm/releases/tag/v0.25.1
- Plugin vLLM para Tenstorrent: https://github.com/changh95/vllm-tt-plugin/commit/ba73d09d69766de64f345e84b08c36c4da51862b
