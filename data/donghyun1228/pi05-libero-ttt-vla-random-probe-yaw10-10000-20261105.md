# Donghyun1228/pi05-libero-ttt-vla-random-probe-yaw10-10000-20261105

## Resumen

Este repositorio contiene un checkpoint adaptado del modelo de robotica π0.5 (pi05) para tareas de manipulacion en el benchmark LIBERO. El autor, Donghyun1228, lo publica como baseline del metodo TTT-VLA (test-time training para modelos vision-language-action), dentro de un trabajo de investigacion sobre adaptacion de politicas roboticas. No es un modelo de lenguaje generalista, sino una politica VLA entrenada para controlar un brazo robotico a partir de observaciones visuales y estado del robot.

El checkpoint parte de un modelo fuente (`pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021`) y aplica un ajuste fino de 10.000 actualizaciones sobre un unico tensor: el `latent_prompt` de 16 x 2048, que actua como prompt latente inyectado en el modelo. El resto de los 70 tensores permanece congelado e identico al modelo fuente. El entrenamiento usa una perdida de state-grounding sobre 50.000 frames de sondas aleatorias (random probes) del conjunto yaw10, sin acciones ni observaciones del dominio fuente.

La relevancia es acotada pero clara para quien investiga adaptacion eficiente de politicas VLA: demuestra que adaptar un unico prompt latente de 32.768 parametros (frente a los miles de millones del modelo completo) basta para obtener un 74,05% de exito agregado en LIBERO. El repositorio pesa 13,8 GB e incluye pesos en formato NPZ (no safetensors ni GGUF), lo que condiciona su uso a los scripts de servicio del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 (pi05); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 71 tensores en el checkpoint adaptado; numero total de parametros no disponible |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en FP32 |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | NPZ (`adapted.npz`, 71 tensores FP32) mas `adapted.json` y `run/config.json` |

## Arquitectura y entrenamiento

El modelo es una politica VLA derivada de π0.5 (proyecto openpi), orientada a control robotico en el benchmark LIBERO. El checkpoint publicado no reentrena la red completa: parte del modelo fuente `pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021` (commit `a74334b4`, fichero `sg_lp.npz`) y adapta exclusivamente el tensor `latent_prompt` de dimensiones 16 x 2048. Los otros 70 tensores se copian sin cambios, segun `run/export.json`.

El procedimiento de adaptacion (TTT-VLA) usa la perdida de state-grounding (proxy) sobre las primeras 1.250 frames de cada una de las 40 sondas de tarea del conjunto yaw10, lo que suma 50.000 frames sin acciones ni observaciones del dominio fuente. La configuracion es: batch 128, optimizador AdamW con LR constante 1e-5, weight decay 0, semilla del loader 0 y 10.000 actualizaciones. El script de referencia es `baselines/ttt_vla/probe_long_h100.py` del repositorio `Donghyun1228/vla_adaptation`, con numerica fijada en runtime `84a1f92b`. El fichero `run/metrics.jsonl` contiene la perdida proxy de cada actualizacion.

## Capacidades

- Control robotico de manipulacion en cuatro suites de LIBERO: `libero_spatial`, `libero_object`, `libero_goal` y `libero_10`.
- Percepcion visual y uso del estado del robot como entrada para generar acciones (politica VLA).
- Adaptacion mediante prompt latente: el `latent_prompt` de 16 x 2048 modula el comportamiento del modelo fuente sin modificar sus pesos.
- Servicio por lotes mediante el script `baselines.ttt_vla.serve` con `batch-size 16`.
- No se documentan capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, agentes multi-paso ni multilingueismo; no disponible.

## Casos de uso

- Investigacion en adaptacion eficiente de politicas VLA: sirve como baseline reproducible para comparar TTT-VLA con otras tecnicas (LoRA, ajuste completo) sobre el mismo modelo fuente y el mismo conjunto de sondas yaw10.
- Evaluacion comparativa en LIBERO: permite medir el exito agregado (74,05% en este checkpoint) y por suite (spatial 415/500, object 393/500, goal 426/500, libero_10 247/500) frente a otros checkpoints del mismo autor.
- Estudio de prompts latentes como mecanismo de control: al ser el unico tensor adaptado, facilita analisis de que informacion codifica el `latent_prompt` y como afecta a la politica.
- Reproduccion de experimentos: el repositorio incluye `run/config.json`, `run/metrics.jsonl` y las estadisticas de normalizacion en `assets/donghyun/libero`, lo que permite repetir el servicio con el runtime indicado.
- Prototipado de pipelines de evaluacion robotica: el script de servicio con batch 16 y el renderizado OSMesa con MuJoCo 3.2.3 documentan un entorno de evaluacion reproducible en H100.
- Base para experimentos de test-time training: el checkpoint puede usarse como punto de partida para nuevas rondas de adaptacion sobre otras sondas o tareas, dado que solo se modifica un tensor.

## Benchmarks y rendimiento

Resultados de exito en LIBERO reportados por el autor (env seed 7, NVIDIA H100, renderizado OSMesa, MuJoCo 3.2.3):

| Suite | Exito | Total |
|---|---|---|
| libero_spatial | 415 | 500 |
| libero_object | 393 | 500 |
| libero_goal | 426 | 500 |
| libero_10 | 247 | 500 |
| Agregado | 1481 | 2000 (74,05%) |

El autor indica ademas que el punto de 1.000 actualizaciones de la misma ejecucion obtuvo 1466/2000 (73,30%), aunque ese checkpoint no esta publicado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje en la informacion disponible, lo cual es esperable al tratarse de un modelo de robotica.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 13,8 GB y los pesos se distribuyen en FP32, por lo que se requiere al menos esa cantidad de memoria para cargar el checkpoint completo, mas el overhead del runtime de inferencia.
- GPU recomendadas: el autor evalua en NVIDIA H100; no se documentan pruebas en otras GPU.
- GPU de consumo: no disponible; no hay evidencia de que quepa en RTX 4090 u otras GPU consumer con la configuracion publicada.
- Despliegue: script propio `baselines.ttt_vla.serve --config run/config.json --checkpoint adapted.npz --norm-stats-dir assets/donghyun/libero --batch-size 16` con runtime `84a1f92b`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros adaptados | Contexto | Exito LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05-libero-ttt-vla-random-probe-yaw10-10000) | `latent_prompt` 16 x 2048 (un tensor de 71) | no disponible | 74,05% (1481/2000) | Apache 2.0 | Hugging Face |
| pi05-libero-support-unified-v1a1-yaw10-n50000-10000-20261016 | no disponible (entrenamiento con perdida IDM sobre 32 coordenadas) | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| pi05-libero-support-lora16-all-yaw10-n50000-10000-20261016 | LoRA rango 16 sobre todos los modulos | no disponible | no disponible | no disponible en la informacion | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y comparten el modelo fuente y el conjunto yaw10, por lo que constituyen las alternativas naturales para medir el efecto de TTT-VLA frente a LoRA y frente al ajuste con perdida IDM. No se dispone de resultados de exito publicados para esas dos alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en robotica: no es un modelo de lenguaje y no debe evaluarse con benchmarks de texto, codigo o razonamiento general.
- Dependencia estricta del runtime: los pesos en NPZ y la normalizacion en `assets/donghyun/libero` estan ligados al runtime `84a1f92b` y al script `baselines.ttt_vla.serve`; no hay garantia de compatibilidad con otras versiones.
- Formato no estandar: no se distribuyen safetensors ni GGUF, lo que dificulta su uso fuera del ecosistema openpi del autor.
- Evaluacion limitada: los resultados provienen de una unica semilla de entorno (seed 7) y de un unico hardware (H100 con OSMesa); no se reporta varianza entre semillas.
- Rendimiento desigual por suite: libero_10 obtiene 247/500 (49,4%), muy por debajo de libero_goal (85,2%), lo que indica fragilidad en tareas de horizonte largo.
- Riesgo de sobreajuste a las sondas: el ajuste se hace sobre las primeras 1.250 frames de cada sonda, sin acciones; la transferencia a otras distribuciones no esta documentada.
- Sin informacion sobre sesgos, alucinacion o comportamiento fuera de distribucion: no disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo fuente y las dependencias (openpi, MuJoCo) pueden tener sus propias condiciones; conviene revisarlas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-yaw10-10000-20261105
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021
- Alternativa con perdida IDM: https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-yaw10-n50000-10000-20261016
- Alternativa con LoRA: https://huggingface.co/Donghyun1228/pi05-libero-support-lora16-all-yaw10-n50000-10000-20261016
- Repositorio de codigo referenciado: `Donghyun1228/vla_adaptation` (script `baselines/ttt_vla/probe_long_h100.py`, runtime `84a1f92b`); URL no disponible en la informacion proporcionada.
