# hiepnh137/llm-serving

## Resumen

`hiepnh137/llm-serving` no es un modelo de lenguaje, sino un repositorio de infraestructura para desplegar los modelos `openai/gpt-oss-120b` y `openai/gpt-oss-20b` mediante vLLM sobre un nodo H200 en un clúster gestionado con Slurm. El autor, `hiepnh137`, publica scripts de descarga de pesos, ficheros `sbatch` de lanzamiento, utilidades de cliente y un túnel SSH para acceder al endpoint desde fuera del clúster. El repositorio resuelve el problema de servir modelos abiertos de gran tamano con una API compatible con OpenAI en un entorno HPC compartido, sin exponer puertos ni hardcodear URLs.

La relevancia practica esta en la receta concreta: versiones fijadas (vLLM 0.19.1, torch 2.10+cu128), limites de memoria documentados (`--gpu-memory-utilization 0.88`), gestion de cache fuera de la cuota de `/home`, y mediciones reales de KV cache (792 k tokens para el 120b, 2,44 M para el 20b en una H200). No contiene pesos propios ni una model card del modelo en si: la informacion tecnica del LLM subyacente no esta disponible en este repositorio.

Por tanto, esta ficha describe el artefacto tal como esta publicado (infraestructura de serving) y marca como "no disponible" todo lo relativo a arquitectura, entrenamiento, benchmarks y licencia del modelo, que corresponden a los repositorios originales de `openai/gpt-oss`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no define arquitectura de modelo; es infraestructura de serving con vLLM) |
| Parametros totales | no disponible en este repositorio; los modelos servidos son `openai/gpt-oss-20b` y `openai/gpt-oss-120b` |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion (referenciado en los logs de vLLM del repositorio) |
| Tipos de cuantizacion | no disponible (los pesos descargados son los del repositorio HF original, 14 GB para el 20b y 65 GB para el 120b) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | snapshot de Hugging Face (descarga via `download_weights.sh`, con lista de exclusion `LLM_HF_IGNORE` en `config.sh`); el repositorio no especifica safetensors/GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni proceso de entrenamiento de ningun modelo. Lo que describe es un stack de inferencia: vLLM 0.19.1 sobre torch 2.10 con CUDA 12.8, ejecutado como trabajo Slurm en un nodo con GPU H200. La pila se fija deliberadamente en vLLM 0.19.1 porque es la ultima version sobre torch 2.10 / CUDA 12.8, compatible con el driver 565 (CUDA 12.6) de los nodos; vLLM 0.20+ arrastra torch 2.11 / CUDA 13, que ese driver no puede ejecutar.

Entre las decisiones tecnicas documentadas destacan: servir el directorio de snapshot cacheado en lugar del repo id (porque la busqueda interna de vLLM por repo id rechaza caches sin los subdirectorios `original/` y `metal/`), redirigir las caches de `torch.compile` y Triton a `.cache/` local para no consumir la cuota de 19 GB de `/home`, y usar `PYTORCH_ALLOC_CONF=expandable_segments:True` tras un fallo de OOM con 12 GiB reservados pero no asignados. No hay datos sobre tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO).

## Capacidades

- Serving de los modelos `openai/gpt-oss-20b` y `openai/gpt-oss-120b` mediante API compatible con OpenAI (`/v1/chat/completions`).
- Autenticacion por API key generada en el primer arranque en `.secrets/api_key` (modo 600), exigida en cada peticion a `/v1`.
- Seleccion automatica de puerto libre en cada arranque, con publicacion de la URL en `endpoints/<model>.env` y en `logs/gpt-oss-serve-<jobid>.log`.
- Cliente Python basado en el SDK oficial `openai`, que lee `OPENAI_BASE_URL`, `OPENAI_API_KEY` y `LLM_MODEL` del entorno.
- Acceso desde fuera del clúster mediante reenvio de puerto SSH a traves del nodo de login (`tunnel.sh`).
- Paso de flags adicionales de vLLM tras el nombre del modelo (por ejemplo `--max-num-seqs 64`).
- Encadenado de trabajos Slurm con `--dependency=afterany:<jobid>` para mantener el servicio tras el limite de tiempo.
- No se documentan en este repositorio capacidades de tool calling, agentes, vision, audio ni modo thinking del modelo subyacente.

## Casos de uso

- Servicio de inferencia interno en clúster HPC: lanzar `sbatch serve_gpt_oss.sbatch` deja el modelo disponible en un nodo H200 durante hasta 5 dias, con la URL publicada en `endpoints/<model>.env` para que otros trabajos la consuman sin configuracion manual.
- Pruebas rapidas de integracion: `sbatch --qos=short --time=01:00:00 serve_gpt_oss.sbatch openai/gpt-oss-20b` arranca el modelo pequeno en unos 2,5 minutos, suficiente para validar prompts y formato de respuesta antes de pasar al 120b.
- Pipelines de evaluacion por lotes: un script Python con el SDK `openai` apuntando a `OPENAI_BASE_URL` permite lanzar baterias de evaluacion contra el modelo servido, reutilizando el mismo codigo que contra la API de OpenAI.
- Acceso desde estaciones de trabajo sin montaje de `/weka`: `tunnel.sh gpt-oss-120b 8000` abre un tunel a traves del nodo de login y expone el endpoint en `http://localhost:8000/v1`, util para desarrollo local contra el modelo desplegado.
- Reparto de un nodo H200 entre peticiones concurrentes: con 2,44 M tokens de KV cache en el 20b (35x de concurrencia a 131 k de contexto) y 792 k en el 120b (11,4x), el servidor admite varias conversaciones largas simultaneas en una sola GPU.
- Servicio de larga duracion con continuidad: encadenar trabajos con `sbatch --dependency=afterany:<jobid>` mantiene el endpoint operativo mas alla del limite de tiempo del scheduler, releyendo la nueva URL tras cada reinicio.
- Despliegue reproducible en otro clúster Slurm: los scripts parametrizan entorno de conda (`LLM_VLLM_ENV`), lista de exclusiones de descarga (`LLM_HF_IGNORE`) y flags de vLLM, lo que facilita replicar la receta en infraestructura equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo en la informacion disponible. El repositorio si incluye mediciones de serving en una GPU H200:

| Metrica | gpt-oss-20b | gpt-oss-120b |
|---|---|---|
| Pesos en GPU | no disponible | 61 GB |
| KV cache medida | 2,44 M tokens | 792 k tokens |
| Concurrencia a 131.072 tokens por peticion | 35x | 11,4x |
| Tiempo de carga | ~2,5 minutos | unos minutos (no cuantificado) |
| `--gpu-memory-utilization` | no especificado | 0,88 |

## Requisitos de hardware

- GPU: una H200 por instancia de servidor, segun la receta publicada. No se documenta soporte multi-GPU ni tensor parallelism.
- VRAM: el 120b ocupa 61 GB solo en pesos y provoco OOM con `--gpu-memory-utilization 0.92` durante la captura de grafos CUDA; con 0,88 queda margen para 792 k tokens de KV cache. El 20b parte de 14 GB de pesos descargados.
- GPU de consumo: no se documenta despliegue en RTX 4090 ni similares; la receta esta atada a H200 y a un driver 565 (CUDA 12.6).
- Almacenamiento: `/weka/s225250685/hf_cache` para los snapshots; la descarga omite `original/` y `metal/` (unos 130 GB extra en el 120b).
- Entorno: conda `conda-envs/vllm` con vLLM 0.19.1 y torch 2.10+cu128; sobreescribible con `LLM_VLLM_ENV`.
- Despliegue: vLLM como servidor OpenAI-compatible dentro de un trabajo Slurm; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se publican cifras de capacidad de KV cache y concurrencia.

## Comparativa con modelos similares

No disponible. El repositorio no incluye comparaciones con otras pilas de serving ni con otros modelos, y no se dispone de datos de rendimiento de los modelos servidos en esta informacion.

## Limitaciones y advertencias

- El repositorio no es un modelo: no contiene pesos, model card propia, licencia ni idiomas declarados. Cualquier uso en produccion requiere consultar la licencia de `openai/gpt-oss-20b` y `openai/gpt-oss-120b` en sus repositorios originales.
- El trabajo Slurm se detiene al alcanzar su limite de tiempo (hasta 5 dias); hay que reenviarlo o encadenar dependencias, y la URL y el puerto cambian en cada reinicio.
- El tunel SSH muere con el trabajo del servidor; es necesario reejecutar `tunnel.sh` tras cada reenvio.
- La version de vLLM esta bloqueada a 0.19.1 por compatibilidad con el driver 565; actualizar a 0.20+ rompe la ejecucion en estos nodos.
- Servir el snapshot cacheado en lugar del repo id es obligatorio con la lista de exclusiones aplicada; cambiar `LLM_HF_IGNORE` en un solo sitio (`config.sh`) para no desincronizar ambos scripts.
- La API key se genera en el primer arranque y solo es legible por los trabajos del propietario; el servidor la exige en cada peticion a `/v1`.
- No hay datos publicados sobre sesgos, tasa de alucinacion ni rendimiento multilingue de los modelos servidos en esta informacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hiepnh137/llm-serving
- Modelo servido (20b): https://huggingface.co/openai/gpt-oss-20b
- Modelo servido (120b): https://huggingface.co/openai/gpt-oss-120b
- vLLM: https://github.com/vllm-project/vllm
- SDK Python de OpenAI: https://github.com/openai/openai-python
- Slurm (documentacion de `sbatch` y dependencias): https://slurm.schedmd.com/sbatch.html
