# positron-ai/Qwen3.6-27B

## Resumen

Qwen3.6-27B es un modelo de lenguaje de gran tamano desarrollado originalmente por el equipo Qwen (Alibaba). Esta ficha documenta la republicacion realizada por Positron AI bajo el identificador `positron-ai/Qwen3.6-27B`, que constituye un espejo literal (verbatim mirror) del repositorio upstream `Qwen/Qwen3.6-27B` en la revision `5d316fa25c3a0b6251198e9e7a94e863a435536a`. El unico cambio respecto al original es el archivo `README.md`; el resto de archivos son byte a byte identicos al upstream, con verificacion de object IDs (LFS sha256 y git blob sha1) antes y despues de la subida.

El modelo cuenta con 27.781.427.952 parametros totales segun los pesos en safetensors, lo que lo situa en la franja de modelos densos de aproximadamente 28B. El repositorio ocupa 55,6 GB distribuidos en 15 shards de safetensors en formato bf16. La arquitectura declarada en los tags de Hugging Face es `qwen3_5`, lo que sugiere una evolucion de la familia Qwen3. Se distribuye bajo licencia Apache 2.0.

La relevancia de esta republicacion es operativa: Positron AI la mantiene como fuente de descarga anonima y fijada (pinned) para pipelines de integracion continua, aislando al CI de cambios upstream, gating y limites de tasa. No se trata de un modelo afinado ni de una variante nueva, sino de un artefacto de infraestructura. El autor advierte explicitamente que este repositorio no es un canal de adquisicion para procesamiento de pesos ni un `bf16_source` canonico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun tag de Hugging Face) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15 shards) + tokenizer.json, vocab.json, merges.txt |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `qwen3_5` y del identificador de familia Qwen3.5/Qwen3.6. No se especifican el numero de capas, la dimension oculta, el tipo de atencion ni si incorpora mecanismos hibridos. El repositorio incluye `preprocessor_config.json` y `video_preprocessor_config.json`, lo que indica soporte de entradas de imagen y video, aunque la model card del espejo no desarrolla estas capacidades.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. La model card del espejo remite al `README.upstream.md` (62.583 bytes) para la documentacion completa del autor original, que no se incluye en la informacion proporcionada. No se han publicado innovaciones tecnicas destacables en esta ficha.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base Qwen3.6-27B.
- Procesamiento multimodal: la presencia de `preprocessor_config.json` y `video_preprocessor_config.json` sugiere soporte de imagen y video, aunque no se detalla en la informacion disponible.
- Plantilla de chat incluida (`chat_template.jinja`), lo que habilita uso conversacional multi-turno.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles en esta ficha.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Integracion continua (CI): el proposito declarado del repositorio es servir como fuente de descarga anonima y fijada por revision para pipelines de CI, evitando que cambios upstream o limites de tasa rompan las builds. Es el caso de uso principal y documentado.
- Reproducibilidad de experimentos: al fijar la revision `5d316fa25c3a0b6251198e9e7a94e863a435536a` y verificar los hashes de cada shard, permite reconstruir entornos de evaluacion deterministas sin depender de la disponibilidad del repo upstream.
- Espejo interno de artefactos: equipos con politicas de red restrictivas pueden descargar los pesos desde este repositorio sin autenticacion, manteniendo la trazabilidad mediante los object IDs publicados.
- Auditoria de integridad: los hashes LFS sha256 por shard permiten verificar que los pesos descargados coinciden con el upstream antes de desplegarlos en produccion.
- Fine-tuning sobre base estable: al ser byte-identico al original, sirve como punto de partida para ajuste fino sin riesgo de que el upstream cambie entre la descarga y el entrenamiento.
- Despliegue de inferencia en bf16: los 55,6 GB de pesos en 15 shards permiten servirlo con frameworks que soporten sharded safetensors (vLLM, TGI, transformers), aunque el autor desaconseja usarlo como fuente canonica de pesos para procesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este repositorio no reporta resultados de evaluacion y que ninguno debe atribuirse al mismo.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 55,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere multiples GPU o una GPU de 80 GB con margen limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB con tensor parallelism).
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16; requeriria cuantizacion a 8 o 4 bits, no publicada en este repositorio.
- Opciones de despliegue: vLLM, TGI y transformers con sharded safetensors; llama.cpp y Ollama requeririan conversion a GGUF, no incluida.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| positron-ai/Qwen3.6-27B (este) | 27,78B | no disponible | Apache 2.0 | espejo CI, 18 descargas |
| Qwen/Qwen3.6-27B (upstream) | 27,78B | no disponible | Apache 2.0 | repositorio canonico |
| Alternativas de ~28B densos | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar rendimiento con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Este repositorio es exclusivamente una fuente de descarga para CI; el autor prohibe explicitamente tratarlo como canal de adquisicion para procesamiento de pesos o como `bf16_source` canonico.
- No se deben atribuir resultados de evaluacion a este repositorio; no publica ninguno.
- El unico archivo modificado es `README.md`; cualquier discrepancia con el upstream debe resolverse contra `Qwen/Qwen3.6-27B`.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del upstream y las condiciones de uso del modelo base.
- El repositorio tiene 18 descargas y 0 likes, lo que refleja su naturaleza de artefacto interno mas que de distribucion publica.

## Enlaces

- Repositorio espejo: https://huggingface.co/positron-ai/Qwen3.6-27B
- Repositorio upstream: https://huggingface.co/Qwen/Qwen3.6-27B
- Revision fijada: `5d316fa25c3a0b6251198e9e7a94e863a435536a`
- Documentacion upstream preservada: `README.upstream.md` dentro del repositorio
