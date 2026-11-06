# johnlockejrr/Qwen3.8-Flash-Next-HGN

## Resumen

Qwen3.8-Flash-Next-HGN es una conversión al formato nativo Halogen `.hgn` (perfil v2) de los pesos BF16 oficiales del modelo `Qwen/Qwen3.8-Flash-Next` de Qwen/Alibaba. La publica el usuario `johnlockejrr` usando la herramienta `bf16-to-hgn` 0.1.0 con backend CUDA, y su único propósito es servir de checkpoint montable en el runtime `halogen-flash-server`. No es un modelo nuevo ni un fine-tuning: es una recuantización de los pesos originales para un runtime alternativo.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con torre de visión y cabeza MTP (multi-token prediction) embebida, según los artefactos que incluye el paquete (trunk, n-gram lookup table, vision tower). El pack ocupa unos 118,8 GB en el repositorio y requiere un host con memoria unificada de clase Strix Halo o equivalente para mantener residente el checkpoint de ~62 GiB junto con la tabla n-gram mapeada en memoria.

La relevancia es acotada pero clara: permite ejecutar el modelo Qwen3.8-Flash-Next en hardware AMD (ROCm, gfx1151) mediante halogen-flash-server con una API compatible con OpenAI, algo que los runtimes convencionales (Transformers, vLLM, llama.cpp) no cubren para este formato. Los pesos `.hgn` no cargan en ninguna otra librería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de vision y cabeza MTP embebida (modelo base Qwen3.8-Flash-Next) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | I4R (expertos enrutados), HT4 (matrices densas y LM head), Q6G64 (mixers hyper-connection), Q4C-P (embeddings y proyecciones pequeñas), Q8G64 (matrices densas del MTP), BF16 (torre de vision), FP8G (tabla n-gram) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | Halogen `.hgn` (v2); no compatible con safetensors, GGUF ni Transformers |

## Arquitectura y entrenamiento

El paquete no entrena nada: recuantiza los pesos BF16 oficiales del modelo base. La arquitectura subyacente es un transformer de mezcla de expertos con expertos enrutados cuantizados a I4R, matrices densas y LM head en HT4, mixers de hyper-connection en Q6G64, embeddings y proyecciones pequeñas en Q4C-P, y una cabeza MTP densa en Q8G64 embebida dentro de `model.hgn` (no hay fichero `mtp.hgn` separado). La torre de visión se conserva en BF16 como sidecar y la tabla n-gram de decodificación especulativa se guarda aparte en FP8G.

La conversión se realizó con `bf16-to-hgn` 0.1.0 (build CUDA) sobre el snapshot BF16 de 131 shards, con perfil v2 y política `bf16-hgn-v2-rtn-nf4-signed-rms-trellis-v1`, especificación HGN 1.1.0. La verificación posterior (`verify --decode-backend cuda`) reportó `provenance_attested: true`; los tensores de visión coinciden exactamente con BF16 (copia cruda) y los tensores cuantizados presentan el error de reconstrucción habitual de trellis/Q4C-P/I4R, que el autor advierte explícitamente que no es una métrica de calidad de inferencia.

## Capacidades

- Generación de texto y conversación multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/responses`).
- Procesamiento de imágenes: la torre de visión se activa con `HALOGEN_VISION_TOWER=1`; sin esa variable el sidecar de visión no se carga.
- Decodificación especulativa acelerada por tabla n-gram (`qwen38-flash-next-ngram.hgn`), que es obligatoria y debe permanecer junto al checkpoint.
- Predicción multi-token (MTP) integrada en el checkpoint principal, usada como cabeza draft para decodificación especulativa.
- Capacidades de razonamiento, código y matemáticas: no documentadas en la información disponible para este pack; heredadas del modelo base, pero sin verificación publicada en esta ficha.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está cumplimentado).

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en hardware AMD con memoria unificada: montar el pack en un contenedor `halogen-flash-server` sobre un host Strix Halo (gfx1151) permite servir el modelo vía ROCm cuando las alternativas basadas en CUDA no están disponibles.
- Servicio de chat con API compatible con OpenAI: el servidor expone `:8731` con endpoints `/v1/chat/completions` y `/v1/responses`, de modo que clientes y SDK existentes pueden apuntar al endpoint sin cambios de código.
- Inferencia multimodal en local: activando `HALOGEN_VISION_TOWER=1` se incorpora la torre de visión en BF16 para tareas de descripción de imágenes o preguntas sobre documentos escaneados, siempre que el caso no exija latencia baja.
- Aceleración de generación con n-gram y MTP: en cargas de generación larga y repetitiva (plantillas, resúmenes estructurados, código con patrones predecibles) la tabla n-gram y la cabeza MTP reducen el número de pasos de decodificación.
- Reproducción y auditoría de la cadena de conversión: el pack incluye `conversion-manifest.json` y `sha256.txt`, lo que permite verificar la procedencia de los pesos y repetir la conversión con los mismos parámetros (`--profile v2 --seed 0 --ht-beam 128`).
- Evaluación comparativa de runtimes: útil para medir el impacto del error de reconstrucción de la cuantización Halogen v2 frente a los pesos BF16 originales en tareas concretas antes de adoptar el formato en producción.
- Entornos aislados sin conectividad: al ser un pack autocontenido (checkpoint, n-gram, visión, tokenizer y config), se puede desplegar en hosts air-gapped copiando el directorio y montándolo en solo lectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la verificación de conversión (`provenance_attested: true`) y advierte que el error de reconstrucción de los tensores cuantizados no constituye una puntuación de calidad de inferencia.

## Requisitos de hardware

- Checkpoint residente: ~62,1 GiB (`model.hgn`).
- Tabla n-gram: 47,68 GiB (`qwen38-flash-next-ngram.hgn`), mapeada en memoria y habitualmente paginada; requiere espacio adicional en disco y dirección de memoria.
- Torre de visión: 0,84 GiB (`qwen38-flash-next-vision.hgn`), opcional.
- Descarga total: ~111 GiB; el repositorio completo ocupa 118,8 GB.
- Host recomendado: máquina con memoria unificada de clase Strix Halo (AMD, gfx1151) o equivalente, con capacidad para el checkpoint residente más la tabla n-gram mapeada y la KV cache del runtime.
- GPU: el runtime está orientado a AMD ROCm (`/dev/kfd`, `/dev/dri`); la conversión se realizó en GPUs de clase RTX 3090 con backend CUDA, pero la inferencia no se documenta para CUDA.
- No cabe en GPU de consumo con VRAM discreta convencional (24 GB o menos) dado el tamaño del checkpoint.
- Despliegue: exclusivamente `halogen-flash-server` (imagen `ghcr.io/peonist-ai/halogen-flash-server:0.19.1`) vía Podman o Docker. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tamano del pack | Runtime | Licencia | Notas |
|---|---|---|---|---|---|
| johnlockejrr/Qwen3.8-Flash-Next-HGN | Halogen `.hgn` v2 | ~111 GiB de descarga; checkpoint 62,1 GiB | halogen-flash-server | qwen-community-1.0 | Conversión propia desde BF16 con `bf16-to-hgn` 0.1.0; incluye visión y n-gram |
| peonist-ai/halogen-qwen3.8-flash-next | Halogen `.hgn` (checkpoint `qwen38-flash-next-v2.hgn`) | no disponible | halogen-flash-server | qwen-community-1.0 | Pack de referencia del equipo del runtime |
| johnlockejrr/Swift-1.5-Qwen3.8-Flash-Next-heretic-HGN | Halogen `.hgn` v2 | no disponible | halogen-flash-server (gfx1151) | no disponible | Variante "heretic V2" sin comportamiento de rechazo; no es equivalente al modelo base |
| Qwen/Qwen3.8-Flash-Next (original) | safetensors BF16, 131 shards | no disponible | Transformers, vLLM y otros runtimes estándar | qwen-community-1.0 | Pesos oficiales de referencia; máxima fidelidad numérica |

## Limitaciones y advertencias

- Los pesos `.hgn` no cargan en Transformers, vLLM, llama.cpp ni librerías equivalentes; el modelo queda atado al runtime Halogen.
- El fichero n-gram es obligatorio: sin `qwen38-flash-next-ngram.hgn` junto al checkpoint, el pack no funciona correctamente.
- La cuantización introduce error de reconstrucción frente a BF16 en expertos enrutados (I4R), matrices densas (HT4), mixers (Q6G64), embeddings (Q4C-P) y MTP (Q8G64). El autor no publica métricas de degradación de calidad.
- El propio autor advierte que la compatibilidad de formato no equivale a equivalencia con el checkpoint stock del publicador: la política del conversor es independiente de la receta interna de Qwen.
- El nombre del checkpoint es `model.hgn`, no `qwen38-flash-next-v2.hgn`; algunos despliegues Halogen que autodetectan el nombre estándar pueden requerir renombrarlo.
- Requiere hardware de memoria unificada de gama alta; no es desplegable en GPU de consumo con VRAM discreta.
- Idiomas soportados no documentados en el repositorio; no se puede garantizar cobertura multilingüe sin evaluarla.
- No hay datos de benchmarks, latencia ni throughput publicados para este pack.
- Licencia `qwen-community-1.0`: las condiciones de uso comercial vienen impuestas por el modelo base y deben revisarse en el fichero `LICENSE` antes de cualquier despliegue productivo.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; son los heredados del modelo base, sin verificación específica tras la recuantización.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del pack.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/Qwen3.8-Flash-Next-HGN
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
- Conversor bf16-to-hgn: https://github.com/Quat3rnion/bf16-to-hgn
- Pack de referencia del runtime: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Checkpoint de referencia: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next/blob/main/qwen38-flash-next-v2.hgn
- Variante heretic del mismo autor: https://huggingface.co/johnlockejrr/Swift-1.5-Qwen3.8-Flash-Next-heretic-HGN
