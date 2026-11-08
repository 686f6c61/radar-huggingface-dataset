# Lobtensor/Lob

## Resumen

Lobtensor/Lob no es un modelo de lenguaje: es un repositorio de Hugging Face cuyo contenido es la model card de Lobtensor, una herramienta de control de versiones orientada a tensores. El autor, Lobtensor, publica en este repositorio la documentación de su ecosistema Tensormorph, cuyo componente principal es `lobcli` (el comando `lob`), una CLI escrita en Rust (1.85+) que gestiona pesos de modelos, metadatos y transformaciones de tensores con una semántica inspirada en Git pero con el tensor como unidad atómica de cambio.

El problema que aborda la herramienta es el versionado de checkpoints de modelos de gran tamaño: Git y Git LFS tratan los pesos como ficheros binarios opacos, mientras que Lobtensor los descompone en trozos de 8 MiB, identifica cada objeto mediante BLAKE3 sobre CBOR canónico dentro de un Merkle DAG direccionable por contenido, y ofrece operaciones de diff numérico (`max|Δ|`, similitud coseno, tolerancias) en lugar de "binary files differ". El coste de un commit escala con el cambio real (solo los trozos modificados), no con el tamaño total del fichero.

No hay información sobre arquitectura de red neuronal, parámetros, contexto ni capacidades de inferencia, porque el repositorio no contiene un modelo entrenado. La ficha, por tanto, describe la herramienta y su estado (pre-1.0, con congelación del formato en disco v1 pendiente) y marca como "no disponible" todo lo que no aparece en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es una herramienta de versionado de tensores escrita en Rust) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la herramienta opera sobre pesos SafeTensors; no define cuantizaciones propias) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (según los badges de la model card, referida a `lobcli`) |
| Formato de pesos | SafeTensors (single, sharded e indexed); exportación a SafeTensors |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay una red neuronal ni un proceso de entrenamiento descrito. La "arquitectura" del sistema es la de una herramienta de control de versiones: unidad de cambio = tensor dividido en chunks de 8 MiB; identidad = BLAKE3 sobre CBOR canónico en un Tensor Merkle DAG con direccionamiento por contenido; diff numérico con `max|Δ|`, coseno y tolerancias; commits que almacenan solo los chunks modificados; round-trip bit-exacto de los bytes canónicos de cada tensor.

La implementación es CPU-completa y los aceleradores (CUDA, wgpu, Metal) solo aceleran. El formato de contenedor rastreado hoy es SafeTensors (single, sharded e indexed); otros adaptadores se añadirán por decisión de diseño explícita. La CLI incluye ramas y merge, diff numérico, deltas de tensores, remotos (`file://`, layout S3 y protocolo propio `lob://`), firma SSH, comprobaciones de política, pinning y hooks de Git, y un servidor de API local. No se documentan datos de entrenamiento, tokens ni RLHF/DPO porque no existen para este artefacto.

## Capacidades

- Versionado de checkpoints SafeTensors con round-trip bit-exacto (`lob export HEAD --format safetensors -o out/` reproduce cada tensor byte a byte).
- Importación de modelos (`lob import models/model.safetensors`) y flujo Git-like: `init`, `status`, `commit`, `log`.
- Diff numérico de tensores con `max|Δ|`, similitud coseno y tolerancias, en lugar de comparación binaria de ficheros.
- Almacenamiento incremental: un commit cuesta solo los chunks de 8 MiB que cambiaron.
- Ramas, merge y deltas de tensores.
- Remotos: `file://`, layout compatible con S3 y protocolo propio `lob://`.
- Firma SSH, comprobaciones de política, pinning y hooks de Git.
- Servidor de API local.
- Verificación de integridad con `lob fsck`.
- Aceleración opcional por GPU (CUDA, wgpu, Metal); todas las operaciones funcionan en CPU.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes: no es un modelo generativo.

## Casos de uso

- Versionado de fine-tunes por capas: al ajustar una sola capa de un checkpoint grande, `lob commit` almacena únicamente los chunks de esa capa, reduciendo el coste de almacenamiento y transferencia frente a Git LFS.
- Auditoría de cambios numéricos entre checkpoints: usar `lob diff` con `max|Δ|` y coseno para verificar que un merge o una conversión de pesos no altera tensores más allá de una tolerancia definida.
- Distribución de pesos en pipelines de CI/CD: exportar desde `HEAD` a SafeTensors bit-exacto y publicar artefactos reproducibles, con `lob fsck` como puerta de integridad antes del despliegue.
- Colaboración en equipos de investigación: ramas y merge sobre tensores permiten que varios investigadores experimenten con modificaciones de pesos sin bloquearse mutuamente, con remotos `file://` o S3.
- Reproducibilidad de experimentos: el Merkle DAG direccionable por contenido y la identidad BLAKE3/CBOR canónico permiten fijar (pinning) un estado exacto de pesos y demostrar que un checkpoint exportado coincide con el original.
- Integración con flujos Git existentes: hooks y pinning de Git permiten que un repositorio de código referencie un estado de tensores concreto sin almacenar los pesos en el propio repo.
- Inspección y edición de tensores: el ecosistema Tensormorph (mencionado en la model card) visualiza e inspecciona tensores, complementando la CLI para depurar checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la herramienta no ejecuta inferencia. El requisito es almacenamiento para los checkpoints y sus chunks.
- CPU: todas las operaciones son CPU-completas; no se especifican requisitos mínimos de núcleos ni RAM.
- GPU: opcionales y solo como aceleración (CUDA, wgpu, Metal). No se detallan modelos de GPU recomendados.
- Despliegue: la CLI `lob` (Rust 1.85+) y su servidor de API local; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Unidad de cambio | Identidad | Diff | Coste de commit | Licencia |
|---|---|---|---|---|---|
| Lobtensor (`lob`) | tensor en chunks de 8 MiB | BLAKE3 sobre CBOR canónico en Tensor Merkle DAG | numérico (`max\|Δ\|`, coseno, tolerancias) | solo chunks modificados | Apache-2.0 |
| Git / Git LFS | fichero | hash de bytes del fichero | bytes o "binary files differ" | fichero completo modificado | GPL-2.0 (Git) / MIT (LFS) |
| DVC | fichero | hash de contenido | metadatos, no numérico | fichero completo (con cache) | Apache-2.0 |

La comparativa se limita a las herramientas citadas en la propia model card (Git y Git LFS); no se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier evaluación como modelo de IA es inaplicable.
- Estado pre-1.0: el formato en disco puede cambiar hasta la congelación de la v1; no es recomendable como almacenamiento de producción sin asumir migraciones.
- Solo SafeTensors está soportado como formato rastreado (single, sharded e indexed); otros formatos de pesos requieren adaptadores aún no disponibles.
- La licencia Apache-2.0 aparece en los badges referidos a `lobcli`; la licencia del repositorio de Hugging Face figura como "no disponible" y conviene verificarla antes de uso comercial.
- No hay datos de sesgos, alucinación ni limitaciones de idioma porque no hay modelo generativo; esos apartados no aplican.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-08), lo que sugiere un artefacto de documentación recién publicado y sin validación de la comunidad.
- El contenido de la model card es material de referencia del autor; no debe interpretarse como instrucciones operativas.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Lobtensor/Lob
- Repositorio `lobcli`: https://github.com/Lobtensor/lobcli
- Licencia de `lobcli`: https://github.com/Lobtensor/lobcli/blob/main/LICENSE
- `Cargo.toml` de `lobcli`: https://github.com/Lobtensor/lobcli/blob/main/Cargo.toml
- SafeTensors: https://github.com/huggingface/safetensors
- Logo de Lobtensor: https://raw.githubusercontent.com/Lobtensor/.github/main/profile/lobtensor.svg
- Estado del proyecto: https://github.com/Lobtensor/lobcli
