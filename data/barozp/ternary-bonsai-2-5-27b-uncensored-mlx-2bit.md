# barozp/Ternary-Bonsai-2.5-27B-Uncensored-MLX-2bit

## Resumen

Ternary Bonsai 2.5 27B Uncensored MLX 2-bit es un empaquetado de pesos en formato MLX para Apple Silicon del modelo Ternary Bonsai 2.5 27B, una variante ternaria (2 bits por peso) del Qwen3.8-27B de Alibaba Cloud desarrollada por Prism ML. Esta version concreta, publicada por el usuario barozp, incorpora la edicion "uncensored" (abliterated) creada por AtomicChat, que elimina la direccion de rechazo del flujo residual del modelo original. El resultado es un modelo multimodal (image-text-to-text) de 27.359.638.768 parametros que conserva la naturaleza ternaria de los pesos mientras responde a peticiones que el modelo original rechazaria.

La relevancia tecnica del modelo reside en su esquema de cuantizacion extrema: pesos ternarios con escalas de bloque en FP16, lo que reduce el peso de los pesos de lenguaje a 7,67 GB y permite ejecutar un modelo de 27B en hardware de consumo Apple Silicon. El modelo incluye ademas una torre de vision en FP16 (0,92 GB) y una cabeza MTP (multi-token prediction) para decodificacion especulativa. La arquitectura subyacente combina atencion completa en 16 de sus 64 capas con capas SSM (state space model), lo que da un cache KV de solo 64 KB por token.

El interes practico esta en tres frentes: la eficiencia de memoria en Apple Silicon, la capacidad multimodal con vision integrada y la ausencia de filtros de rechazo. Es importante senalar que el modelo requiere un loader especifico con soporte Hadamard incluido en el repositorio, por lo que `mlx_lm.load()` y los loaders estandar de mlx-vlm no pueden abrirlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida transformer + SSM (16 de 64 capas con atencion completa), con torre de vision y cabeza MTP |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 2-bit (PTQ1_0 mapeada a MLX affine 2-bit, grupo 128); torre de vision en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con loader propio (`runtime/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B de Alibaba Cloud y ha sido transformado por Prism ML en Ternary Bonsai 2.5 27B, con pesos ternarios obtenidos mediante cuantizacion post-entrenamiento (PTQ1_0). La arquitectura es hibrida: de las 64 capas totales, 16 usan atencion completa y el resto emplean capas SSM, lo que reduce drasticamente el coste del cache KV (64 KB por token). El modelo incorpora una torre de vision en FP16 para entrada image-text-to-text y una cabeza MTP (multi-token prediction) que actua como draft head para decodificacion especulativa.

La edicion uncensored de AtomicChat se aplico proyectando fuera del flujo residual la direccion de rechazo en las 36 matrices que escriben en el residual de las capas 27 a 44 (`ffn_down`, `ssm_out`, `attn_output`). Segun el autor, cambiaron 12.461.746 codigos ternarios, todas las escalas de bloque FP16 permanecieron identicas y el resto de bytes coincide con el fichero PTQ1_0 de PrismML. El empaquetado MLX de barozp aplica el mapeo sin perdida descrito en `runtime/codec.py` de PrismML (la escala es la escala de bloque y el sesgo es menos la escala), sustituyendo unicamente las 36 matrices modificadas. El repositorio incluye `build_uncensored.py` y `uncensored-provenance.json` para reproducir el proceso.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y respuesta a preguntas de conocimiento general (MMLU reportado del 81,2% en la version uncensored).
- Comprension de imagenes y texto combinados (pipeline image-text-to-text) mediante la torre de vision FP16.
- Decodificacion especulativa mediante la cabeza MTP opcional (`load_mtp_head` en `runtime/mtp_artifact.py`).
- Respuesta a peticiones que el modelo original rechazaria (abliterated): 0 rechazos en 24 prompts daninos segun AtomicChat.
- Soporte de tool calling y agentes: no evaluado por el autor; no disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo ocupa 7,67 GB de pesos de lenguaje mas 0,92 GB de torre de vision, lo que permite ejecutarlo en Macs con 16 GB o mas de memoria unificada usando el runtime MLX incluido. Adecuado para prototipado offline sin GPU dedicada.
- Asistente multimodal en escritorio: al aceptar entrada image-text-to-text, puede usarse para describir capturas, analizar diagramas o responder preguntas sobre imagenes en aplicaciones locales, con la torre de vision en FP16 para preservar calidad.
- Generacion de texto sin filtros para investigacion: util en estudios de seguridad, red teaming y evaluacion de alineamiento donde se necesita medir el comportamiento del modelo sin capas de rechazo que enmascaren las respuestas.
- Procesamiento de documentos largos: el cache KV de 64 KB por token y las 16 capas de atencion completa permiten manejar conversaciones o documentos extensos con un coste de memoria contenido, aunque la longitud maxima de contexto no esta documentada.
- Despliegue con decodificacion especulativa: la cabeza MTP permite acelerar la generacion en el hermano MTPLX; en este pack puede cargarse opcionalmente para reducir latencia en tareas de generacion larga.
- Experimentacion con cuantizacion ternaria: sirve como referencia reproducible (via `build_uncensored.py` y `uncensored-provenance.json`) para estudiar el impacto de la cuantizacion 2-bit y de la abliteracion sobre las mismas escalas de bloque.
- Fine-tuning o evaluacion comparativa: al estar bajo Apache 2.0 y en safetensors, puede integrarse en pipelines de evaluacion que comparen modelos ternarios frente a sus equivalentes FP16.

## Benchmarks y rendimiento

Resultados reportados por AtomicChat (no re-medidos por el empaquetador):

| Metrica | Official | Uncensored |
|---|---:|---:|
| Rechazos en 24 prompts daninos reservados | 24/24 | 0/24 |
| Rechazos en 24 prompts ordinarios | 0/24 | 0/24 |
| MMLU, 500 preguntas | 401 (80,2%) | 406 (81,2%) |

La diferencia en MMLU no es significativa (McNemar exacto p = 0,30). La prueba de rechazo usa prompts en ingles, presupuesto de 48 tokens de respuesta y un clasificador de prefijo. No se evaluaron comportamiento en contexto largo ni tool calling.

Rendimiento de inferencia medido por PrismML sobre el pack oficial MLX (mismo tamano y disposicion) en un Apple M5 Pro: 21,7 tokens/s en decodificacion y 348 tokens/s en prefill con prompt de 512 tokens.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,67 GB para pesos de lenguaje + 0,92 GB para torre de vision + cache KV de 64 KB por token.
- Hardware objetivo: Apple Silicon (MLX). Medido en Apple M5 Pro; cabe en Macs con 16 GB de memoria unificada en adelante.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este pack, que depende del runtime MLX y de un loader con soporte Hadamard propio.
- Despliegue: exclusivamente mediante el runtime incluido (`runtime/requirements.txt`, `quickstart.py`, `load_vl_model`, `load_mtp_head`). No compatible con `mlx_lm.load()` ni con los loaders estandar de mlx-vlm, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 21,7 tokens/s de decodificacion y 348 tokens/s de prefill en Apple M5 Pro (medicion de PrismML sobre el pack oficial equivalente).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-Uncensored-MLX-2bit (este) | 27,36B | no disponible | Ternaria 2-bit MLX | Apache 2.0 | Hugging Face, runtime propio |
| prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit (oficial) | 27,36B | no disponible | Ternaria 2-bit MLX | Apache 2.0 | Hugging Face |
| AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF | 27,36B | no disponible | GGUF (PTQ1_0) | Apache 2.0 | Hugging Face |
| barozp/Ternary-Bonsai-2.5-27B-Uncensored-MTPLX-2bit | 27,36B | no disponible | Ternaria 2-bit MLX (MTPLX) | Apache 2.0 | Hugging Face |

Las tres alternativas comparten los mismos pesos ternarios y licencia; difieren en el formato de empaquetado y en el runtime de ejecucion (MLX estandar, GGUF o MTPLX con decodificacion especulativa). No se dispone de comparaciones con modelos de otro linaje en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: responde a peticiones que el original rechaza. No hay filtro de contenido mas alla del implícito en los pesos; su uso debe ajustarse a la legislacion local y a la licencia.
- La evaluacion de rechazo se hizo solo con prompts en ingles, presupuesto de 48 tokens y clasificador de prefijo; no cubre otros idiomas ni respuestas largas.
- No se evaluaron comportamiento en contexto largo ni tool calling, por lo que no hay garantias en esos escenarios.
- La longitud maxima de contexto no esta documentada en la informacion disponible.
- Los idiomas soportados no estan documentados.
- Riesgo de alucinacion inherente a un modelo de 27B cuantizado a 2 bits; la cuantizacion ternaria puede degradar matices frente al modelo FP16 de origen.
- Requiere un loader especifico con soporte Hadamard: no funciona con `mlx_lm.load()` ni con loaders estandar de mlx-vlm, lo que limita su portabilidad.
- Solo ejecutable en Apple Silicon via MLX; no hay soporte para CUDA, ROCm ni CPU generica en este pack.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion independiente de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza uncensored puede implicar obligaciones adicionales segun la jurisdiccion.

## Enlaces

- Hugging Face: https://huggingface.co/barozp/Ternary-Bonsai-2.5-27B-Uncensored-MLX-2bit
- Modelo base oficial MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
- Edicion uncensored GGUF de AtomicChat: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF
- Hermano MTPLX: https://huggingface.co/barozp/Ternary-Bonsai-2.5-27B-Uncensored-MTPLX-2bit
- Runtime MTPLX: https://github.com/youssofal/MTPLX
