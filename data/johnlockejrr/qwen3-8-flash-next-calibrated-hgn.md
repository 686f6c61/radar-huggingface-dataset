# johnlockejrr/Qwen3.8-Flash-Next-calibrated-HGN

## Resumen

Qwen3.8-Flash-Next-calibrated-HGN es un pack de pesos cuantizados en formato nativo Halogen `.hgn`, derivado del snapshot oficial en BF16 `Qwen/Qwen3.8-Flash-Next` de Qwen. Lo publica el usuario johnlockejrr (no es un artefacto oficial de Qwen) y su proposito es servir como checkpoint listo para montar en un contenedor `halogen-flash-server`, no para cargarse en Transformers, vLLM o llama.cpp. La variante "calibrated" aplica GPTQ con Hessianas diagonales por bloque y por experto para seleccionar los codigos de los expertos enrutados I4R, mientras que el resto de politicas (HT, Q4C-P, vision, n-gram) coinciden con el pack estandar v2.

El modelo base es un Mixture-of-Experts de Qwen con capacidades multimodales (torre de vision incluida) y decodificacion especulativa mediante MTP embebido en el trunk. El pack incluye ademas una tabla de lookup n-gram de aproximadamente 48 GiB que es obligatoria para el funcionamiento correcto y una torre de vision opcional de unos 0,84 GiB. El tamano total de descarga ronda los 111 GiB, con un checkpoint residente de unos 63 GiB.

Es relevante porque demuestra un flujo de cuantizacion calibrada especifico para el runtime Halogen, con verificacion criptografica de procedencia (`provenance_attested: true`) y una puntuacion publicada en un benchmark interno de tool calling (95,3 ± 1,5 con Pass^3 del 91,3%). No obstante, su utilidad esta fuertemente limitada por el formato propietario y por la ausencia de documentacion publica sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, segun tags del repo; detalles del modelo base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE, pero no se publica el ratio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | I4R (expertos enrutados, GPTQ calibrado), HT, Q4C-P; pesos en BF16 convertidos a HGN |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | Halogen `.hgn` (no compatible con safetensors, GGUF ni Transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con torre de vision y cabeza MTP (multi-token prediction) para decodificacion especulativa. El pack HGN se genera con la herramienta `bf16-to-hgn 0.1.0` (build CUDA, `HGN_CUDA_ARCH=86`) a partir de los 131 shards BF16 oficiales, usando el perfil `v2` y la politica `bf16-hgn-v2-calibrated-gptq-i4r-v1`. La calibracion emplea una Hessiana diagonal por bloques y por experto (block_size 128, aproximadamente 920k tokens, 449×2048) sobre una mezcla multidominio (PerfectBlend, RazorCal, WikiText y dialogo). Los expertos "frios" o con menos de 256 tokens enrutados caen a codigos Optimal sin calibracion.

La innovacion principal es el uso de Hessianas por experto para guiar la seleccion de codigos GPTQ en los expertos I4R, manteniendo los escalares de grupo Lloyd-Max bit-identicos y sin alterar el contrato de decodificacion. El damping se fija en `--gptq-percdamp 1.0` (validado empiricamente; el valor de manual 0.01 sobreajusta en profundidad). El autor advierte explicitamente que esto no es una equivalencia BF16: el objetivo calibrado es el error de salida ponderado por Hessiana en expertos I4R, no la perplejidad.

## Capacidades

- Generacion de texto y razonamiento, heredados del modelo base Qwen3.8-Flash-Next.
- Procesamiento de vision: incluye torre de vision opcional (`qwen38-flash-next-vision.hgn`), activable con `HALOGEN_VISION_TOWER=1`.
- Tool calling / function calling: evaluado en un benchmark interno de herramientas (`tool-eval-bench`).
- Decodificacion especulativa con MTP embebido en `model.hgn` (no hay fichero `mtp.hgn` separado).
- Lookup n-gram integrado mediante tabla externa obligatoria (`qwen38-flash-next-ngram.hgn`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia de tool calling en produccion: el pack se monta en `halogen-flash-server` y expone una API compatible con peticiones de herramientas; su puntuacion de 95,3 en `tool-eval-bench` lo hace apto para agentes que invocan funciones externas.
- Despliegue de agentes multi-paso: el MTP embebido permite decodificacion especulativa, reduciendo latencia en generaciones largas tipicas de pipelines agenticos.
- Asistentes con vision: activando `HALOGEN_VISION_TOWER=1` se habilita la torre de vision para tareas de descripcion de imagenes o extraccion de informacion de documentos escaneados.
- Sustitucion de cuantizaciones GGUF en entornos Halogen: equipos que ya operan el runtime Halogen pueden usar este pack como alternativa calibrada al pack estandar v2 para mejorar la fidelidad en expertos enrutados.
- Benchmarking interno de calidad de cuantizacion: el `conversion-manifest.json` y `sha256.txt` permiten reproducir la verificacion de procedencia y comparar contra el pack sin calibracion.
- Hosts con memoria unificada de gran capacidad (clase Strix Halo): el checkpoint residente de ~63 GiB mas la tabla n-gram mapeada en memoria encaja en estaciones de trabajo con memoria unificada dedicada.
- Evaluacion de tecnicas GPTQ con Hessianas por experto: investigadores pueden inspeccionar el manifest y las diferencias de codigos I4R respecto al pack estandar.

## Benchmarks y rendimiento

| Benchmark | Este pack (`calibrated-temp0`) | Referencia (`thinkingcap-temp0`) |
|---|---|---|
| tool-eval-bench (greedy, temp 0) | 95,3 ± 1,5 | 96,0 ± 0,0 |
| Pass^3 | 91,3% | 94,2% |
| Deploy | 86 | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Los datos de `tool-eval-bench` provienen de un leaderboard interno del autor, no de una evaluacion independiente.

## Requisitos de hardware

- Descarga total: aproximadamente 111 GiB (`model.hgn` ~63 GiB, n-gram ~48 GiB, vision ~0,84 GiB).
- Checkpoint residente en memoria: ~63 GiB, mas espacio para la tabla n-gram mapeada en memoria y la KV cache en tiempo de ejecucion.
- Host recomendado: maquina dedicada con memoria unificada de gran capacidad (el autor cita hosts clase Strix Halo). No cabe en GPUs de consumo convencionales de 24 GB ni en configuraciones multi-GPU estandar sin memoria unificada.
- GPU: el build de conversion usa `HGN_CUDA_ARCH=86` (Ampere); el runtime de inferencia se ejecuta via contenedor con dispositivos `/dev/kfd` y `/dev/dri` (ROCm/HIP), segun el ejemplo de `podman run` de la model card.
- Despliegue: exclusivamente `halogen-flash-server` (contenedor). No compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles. El autor recomienda `--parallel 1` para benchmarks a temperatura 0, ya que mayor concurrencia puede provocar fallos en `k_argmax_part`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-calibrated-HGN (este) | no disponible (MoE) | no disponible | Halogen `.hgn` | qwen-community-1.0 | Calibrado con Hessianas por experto; 95,3 en tool-eval-bench |
| Qwen3.8-Flash-Next-HGN (pack hermano) | no disponible (MoE) | no disponible | Halogen `.hgn` | qwen-community-1.0 | Sin calibracion (politica `standard` v2); mismos pesos auxiliares |
| Qwen/Qwen3.8-Flash-Next (BF16 original) | no disponible (MoE) | no disponible | safetensors BF16 | qwen-community-1.0 | Snapshot oficial; 131 shards; maxima fidelidad, mayor huella de memoria |

No se dispone de datos de benchmarks comparativos frente a modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Formato propietario: los pesos `.hgn` no cargan en Transformers, vLLM, llama.cpp ni herramientas equivalentes; solo funcionan en `halogen-flash-server` o runtime Halogen compatible.
- Dependencia obligatoria de la tabla n-gram (`qwen38-flash-next-ngram.hgn`, ~48 GiB): debe mantenerse junto al checkpoint o el modelo no funcionara correctamente.
- No es una equivalencia BF16: el objetivo de calibracion es el error de salida ponderado por Hessiana en expertos I4R, no la perplejidad; puede haber degradacion no medida en tareas fuera del benchmark interno.
- Los expertos con menos de 256 tokens enrutados durante la calibracion usan codigos sin calibrar, lo que puede introducir heterogeneidad de calidad entre expertos.
- Benchmark no independiente: los resultados de `tool-eval-bench` provienen de un leaderboard interno del autor, sin verificacion externa.
- Licencia `qwen-community-1.0` (etiquetada como `other`): es necesario revisar los terminos del fichero LICENSE antes de uso comercial; el autor no aclara restricciones adicionales.
- Repositorio con 0 descargas y 1 like en el momento de la ficha: no hay evidencia de uso en produccion ni validacion por la comunidad.
- El comando de descarga de la model card contiene una errata en el nombre del repositorio (`Qwen3.8-Flash-Next-calibratedHGN` sin guion), lo que puede provocar fallos al copiarlo literalmente.
- No se publican datos sobre sesgos, idiomas soportados ni tasas de alucinacion del modelo base.
- El ejemplo de despliegue usa ROCm (`/dev/kfd`, `/dev/dri`), por lo que la compatibilidad con CUDA en inferencia no esta documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/Qwen3.8-Flash-Next-calibrated-HGN
- Pack hermano sin calibracion: https://huggingface.co/johnlockejrr/Qwen3.8-Flash-Next-HGN
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime Halogen Flash Server: https://github.com/peonist-ai/halogen-flash-server
