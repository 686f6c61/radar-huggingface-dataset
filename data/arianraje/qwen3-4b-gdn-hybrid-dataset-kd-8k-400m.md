# arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-400m

## Resumen

Este repositorio contiene un checkpoint hibrido Qwen3/GDN derivado de Qwen3-4B mediante la tecnica Opal (On-Policy Attention Linearization), descrita en el paper arXiv 2609.31947. El autor, arianraje, sustituye aproximadamente el 75 % de las capas de atencion completa del modelo original por capas GDN (Gated Delta Net), dando lugar a un transformer hibrido de 4.546.819.904 parametros. El checkpoint se publica como instantanea final de un experimento de destilacion con un presupuesto de 8k tokens y 400M de tokens de entrenamiento (segun la nomenclatura del nombre del repositorio).

El modelo no es un checkpoint estandar de Qwen: requiere el codigo de linealizacion de la rama `backup/bridges2-2026-11-08-gdn` del repositorio GitHub del autor. El repositorio incluye pesos en safetensors, tokenizer, configuracion, metadatos de la cirugia de capas y las salidas de evaluacion originales. No conserva estado del optimizador. Su interes es fundamentalmente de investigacion: demuestra una ruta para reducir el coste cuadratico de la atencion en modelos de 4B manteniendo parte de las capacidades del profesor.

La informacion publica es muy escasa: no hay model card convencional, ni licencia declarada, ni idiomas indicados, ni resultados de benchmarks en el propio repositorio. Cualquier uso en produccion exige validar previamente el codigo asociado y la calidad del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3 con aproximadamente el 75 % de capas de atencion completa reemplazadas por GDN (Gated Delta Net) |
| Parametros totales | 4.546.819.904 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el nombre indica un presupuesto de entrenamiento de 8k tokens, no necesariamente el contexto maximo) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (con tokenizer y configuracion incluidos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B y aplica la linearizacion de atencion propuesta en Opal: se reemplazan capas de atencion completa por GDN, un mecanismo de atencion lineal con compuertas, y se destila el modelo resultante desde el profesor original. Segun el abstract del paper, Opal se aplica a Qwen3-4B y MiMo-7B-RL-0530, destilando cada uno a un estudiante hibrido con un 75 % de capas de atencion completa sustituidas por GDN. El checkpoint aqui publicado corresponde a la variante de Qwen3-4B entrenada con destilacion sobre un dataset con presupuesto de 8k y 400M de tokens (segun el nombre del repositorio; los contadores exactos deben consultarse en `snapshot_meta.json` y en la configuracion de entrenamiento guardada).

El repositorio incluye metadatos de la cirugia de capas (`surgery metadata`), lo que es imprescindible para reconstruir el mapeo entre capas del profesor y del estudiante. No queda estado del optimizador en la instantanea final, por lo que no es posible reanudar el entrenamiento tal cual. La innovacion principal es la propia linearizacion on-policy: reducir el coste de atencion cuadratico a lineal en la mayor parte de la red manteniendo la calidad mediante destilacion desde el modelo denso original.

## Capacidades

- Generacion de texto y razonamiento heredados de Qwen3-4B, sujetos a la degradacion introducida por la linearizacion y la destilacion (no cuantificada en la informacion disponible).
- Codigo y matematicas: capacidades esperables del profesor Qwen3-4B, no verificadas en este checkpoint.
- Tool calling y function calling: no confirmado en este checkpoint; depende de que la plantilla de chat y el tokenizer se conserven intactos.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; no se declaran idiomas en el repositorio.
- Modo thinking: Qwen3 incorpora modo de razonamiento, pero no se confirma que se preserve tras la cirugia de capas.
- Vision y audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Investigacion sobre atencion lineal: reproducir el experimento Opal con Qwen3-4B y comparar la calidad del estudiante hibrido frente al profesor denso en tareas de razonamiento y generacion.
- Estudio de eficiencia en inferencia: medir el ahorro de memoria y el throughput de un hibrido con 75 % de capas GDN frente a Qwen3-4B original en el mismo hardware.
- Base para destilacion adicional: usar el checkpoint como inicializacion para experimentos con otros presupuestos de tokens o datasets, ya que se conservan configuracion y metadatos de la cirugia.
- Analisis de degradacion por capa: comparar las salidas de evaluacion guardadas en el repositorio con las del profesor para identificar que capas linealizadas aportan mas perdida de calidad.
- Prototipado de asistentes de texto de bajo coste: desplegar el modelo en entornos con VRAM limitada una vez validada su calidad, aprovechando el menor coste de atencion en contextos largos.
- Reproducibilidad academica: verificar los checksums SHA-256 de `BACKUP_MANIFEST.json` y replicar la evaluacion original con el codigo de la rama `bridges2-2026-11-08-gdn`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona "original evaluation outputs" entre los artefactos guardados, pero no se proporcionan cifras en la informacion accesible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,1 GB solo para pesos (4.546.819.904 parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en int8: aproximadamente 4,6 GB de pesos; en int4, aproximadamente 2,3 GB, aunque no se publican pesos cuantizados y habria que generarlos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) en fp16 con contexto corto, y en GPUs de 8-12 GB si se cuantiza a int4.
- Opciones de despliegue: requiere el codigo de linealizacion del autor; no es compatible de forma directa con vLLM, llama.cpp, Ollama o TGI sin adaptar las capas GDN. La ruta mas segura es usar el repositorio GitHub indicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-400m | 4,55B | No disponible | Hibrida (75 % GDN) | No disponible | Hugging Face, requiere codigo propio |
| Qwen3-4B (profesor) | 4B | 32k (segun Qwen3) | Completa | Apache 2.0 (segun Qwen3) | Hugging Face, ecosistema estandar |
| MiMo-7B-RL-0530 (profesor alternativo en Opal) | 7B | No disponible | Completa | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint estandar de Qwen: sin el codigo de linealizacion de la rama `backup/bridges2-2026-11-08-gdn` no se puede cargar correctamente.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin model card convencional ni idiomas declarados: el comportamiento multilingue es incierto.
- La linearizacion del 75 % de capas puede degradar el razonamiento de cadena larga y el tool calling; no hay benchmarks que lo cuantifiquen.
- Riesgo de alucinacion heredado de Qwen3-4B, potencialmente amplificado por la destilacion.
- Sin estado del optimizador: no es posible reanudar el entrenamiento desde esta instantanea.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria.
- Los contadores exactos de tokens deben verificarse en `snapshot_meta.json`; el nombre del repositorio es solo indicativo.

## Enlaces

- Hugging Face: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-400m
- Codigo de linearizacion: https://github.com/arianraje/Linearization/tree/backup/bridges2-2026-11-08-gdn
- Paper Opal (On-Policy Attention Linearization): https://arxiv.org/html/2609.31947v1
- Variante relacionada (teacher-KD, 4k, 400M): https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-400m
