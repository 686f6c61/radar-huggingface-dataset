# nerun/OxCoder-9B-i1-MTP-GGUF

## Resumen

OxCoder-9B-i1-MTP-GGUF es un repositorio de cuantizaciones GGUF publicadas por el usuario nerun sobre el modelo de código OxCoder-9B, originalmente desarrollado por OrionLLM y derivado de Qwen3.5-9B. La particularidad de esta publicación no es el modelo base, sino la incorporación de un bloque MTP (Multi-Token Prediction) embebido que permite decodificación especulativa en llama.cpp mediante el flag `--spec-type draft-mtp`, sin necesidad de cargar un modelo draft separado.

El bloque MTP no fue entrenado sobre OxCoder-9B, sino transplantado tensor a tensor desde una extracción MTP-only de Qwen3.5-9B publicada por a4lg. Según el autor, la tasa de aceptación del draft se sitúa en torno a 0,6-0,7 en sus pruebas, lo que aporta aceleración real pese a no ser un cabezal específico del modelo. Al compartir `token_embd` y `output` con el modelo principal, el incremento de tamaño es de solo unos 0,2 GiB por fichero.

El repositorio cubre un espectro amplio de cuantizaciones, desde IQ1_S (2,7 GiB) hasta Q6_K (7,1 GiB), e incluye los proyectores de visión (mmproj) tomados de mradermacher/OxCoder-9B-GGUF, entrenados para este modelo. La licencia es Apache 2.0 y el interés actual reside en combinar un modelo de código de 9B con decodificación especulativa integrada en un único fichero, lo que simplifica el despliegue en entornos con VRAM limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5, con bloque MTP adicional (capa 32, atención completa) |
| Parametros totales | 456.010.480 (dato de safetensors del repo; la designación comercial es 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de uso fija `-fitc 32768`) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (bloque MTP en Q4_K_M, Q5_K_M o Q6_K según fichero) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyectores mmproj para visión) |

## Arquitectura y entrenamiento

El modelo principal es OxCoder-9B, un modelo de código basado en Qwen3.5-9B según los tags del repositorio. La arquitectura es un transformer denso con atención recurrente en algunas capas (la clave `qwen35.attention.recurrent_layers` aparece en el proceso de conversión, lo que indica un esquema híbrido de atención completa y recurrente). Sobre esa base se añade un bloque MTP en la posición 32, que es una capa de atención completa con `attn_q/k/v/output` y sin tensores `ssm_*`.

El bloque MTP no procede de entrenamiento sobre OxCoder-9B: fue copiado tensor a tensor desde a4lg/Qwen3.5-9B-MTP-ONLY-GGUF, una extracción del Qwen3.5-9B original. El autor documenta que el script `convert.py` de buzz fallaba para la arquitectura `qwen35` porque incrementaba `block_count` de 32 a 33 sin extender los arrays por capa, provocando el error `key qwen35.attention.recurrent_layers has wrong array length; expected 33, got 32`. La corrección consistió en extender dichos arrays añadiendo `False` para el bloque MTP. No se dispone de información sobre el dataset de entrenamiento de OxCoder-9B ni sobre si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de código: el modelo está etiquetado como `code` y deriva de un modelo específicamente orientado a programación.
- Razonamiento: incluye la etiqueta `reasoning`, lo que sugiere soporte de cadena de pensamiento.
- Uso de herramientas: etiquetado como `tool-use`, con soporte de function calling.
- Flujos agénticos: etiquetado como `agentic`, orientado a tareas multi-paso.
- Visión: incluye proyectores mmproj entrenados para este modelo, por lo que admite entrada de imágenes.
- Conversación multi-turno: etiquetado como `conversational`.
- Decodificación especulativa integrada: el bloque MTP permite acelerar la generación en llama.cpp sin modelo draft externo.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en IDE con VRAM limitada: las cuantizaciones IQ3/IQ4 (4-6 GiB) caben en GPUs de consumo de 8 GB, permitiendo autocompletado y generación de código local con decodificación especulativa activa.
- Agentes de refactorización multi-paso: la etiqueta `agentic` y el soporte de tool calling permiten encadenar lecturas de repositorio, ediciones y ejecución de tests dentro de un bucle controlado.
- Revisión de código con contexto visual: los proyectores mmproj permiten adjuntar capturas de pantalla de errores o diagramas junto al código para obtener explicaciones contextualizadas.
- Despliegue en portátiles y estaciones de trabajo sin GPU dedicada: las cuantizaciones IQ2 (3-4 GiB) permiten ejecución en CPU con llama.cpp manteniendo el bloque MTP para mitigar la baja velocidad de generación.
- Servidor de inferencia de baja concurrencia: con `-np 1` y KV cache en q8_0, el modelo sirve como backend de un asistente de código interno con latencia aceptable en una sola GPU.
- Generación de tests unitarios y documentación técnica: el modelo puede producir código y texto explicativo a partir de fragmentos de fuente, aprovechando su naturaleza conversacional.
- Prototipado de pipelines de decodificación especulativa: sirve como banco de pruebas para evaluar `--spec-type draft-mtp` en llama.cpp con distintas cuantizaciones del bloque MTP (Q4_K_M, Q5_K_M, Q6_K).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor sí reporta métricas operativas cualitativas: tasa de aceptación del draft MTP de aproximadamente 0,6-0,7; `--spec-draft-n-max 2` resultó consistentemente algo mejor que 3, y valores de 1 o 4 o superiores fueron más lentos. Con `-ub 1024` o `-ub 2048` en 8 GB de VRAM, la generación con MTP cayó a ~22 t/s, atribuido a un mayor búfer de cómputo que deja menos VRAM para las capas del modelo bajo `-fit on`.

## Requisitos de hardware

- VRAM estimada según cuantización: desde ~2,9 GB (IQ1_S) hasta ~7,6 GB (Q6_K); el bloque MTP añade ~0,2 GiB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) permite ejecutar Q6_K con contexto amplio y KV cache en q8_0; una RTX 3060/4060 de 8 GB cubre hasta Q4_K_M con `-ub 512`.
- Cabe en GPU de consumo: sí, desde IQ1_S hasta Q6_K en tarjetas de 8 GB o más, según el contexto configurado.
- Opciones de despliegue: llama.cpp con soporte de MTP draft (`llama-server` con `--spec-type draft-mtp`). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Throughput: ~22 t/s reportado en el escenario degradado con `-ub 1024`/`-ub 2048` en 8 GB de VRAM. No se proporcionan cifras de throughput en el escenario óptimo.
- Configuración recomendada por el autor: `-ngl auto -c 0 -fit on -fitc 32768 -fa on -np 1 -ctk q8_0 -ctv q8_0 --temp 0.6 --top-k 20 --min-p 0.0 --spec-type draft-mtp --spec-draft-n-max 2`, con `-ub 512` en 8 GB de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nerun/OxCoder-9B-i1-MTP-GGUF | 456 M (safetensors reportado); designación 9B | No disponible | Apache 2.0 | GGUF con MTP y mmproj | Decodificación especulativa integrada |
| mradermacher/OxCoder-9B-i1-GGUF | Mismo modelo base | No disponible | Apache 2.0 | GGUF sin MTP | Modelo de origen de las cuantizaciones |
| OrionLLM/OxCoder-9B | Mismo modelo base | No disponible | No disponible | No disponible | Modelo original de código |
| a4lg/Qwen3.5-9B-MTP-ONLY-GGUF | Bloque MTP aislado | No aplica | No disponible | GGUF | Donante del bloque MTP |
| Qwen/Qwen3.5-9B | 9B | No disponible | No disponible | No disponible | Modelo base de la familia |

## Limitaciones y advertencias

- El bloque MTP fue entrenado sobre Qwen3.5-9B, no sobre OxCoder-9B; la tasa de aceptación de 0,6-0,7 es menor que la de un cabezal específico y puede degradar en dominios de código muy especializados.
- El script de conversión original no funcionaba para la arquitectura `qwen35`; la corrección aplicada por el autor no está validada por terceros más allá de sus propias pruebas.
- Requiere una build de llama.cpp con soporte de `--spec-type draft-mtp`; versiones sin ese flag no podrán aprovechar el bloque MTP.
- El fichero no debe pasarse como `--model-draft`; hacerlo duplicaría la carga y rompería el uso previsto.
- En 8 GB de VRAM, aumentar `-ub` por encima de 512 degrada el throughput hasta ~22 t/s.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática; al ser un modelo de código, el riesgo de generar APIs o funciones inexistentes es relevante en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el donante del bloque MTP deben verificarse por separado si se redistribuye.
- El dato de parámetros totales en safetensors (456 M) no concuerda con la designación comercial de 9B; conviene tratar la cifra con cautela y verificar los pesos reales antes de dimensionar infraestructura.
- No hay benchmarks publicados que permitan comparar calidad de código frente a alternativas de tamaño similar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nerun/OxCoder-9B-i1-MTP-GGUF
- Modelo base cuantizado: https://huggingface.co/mradermacher/OxCoder-9B-i1-GGUF
- Modelo original: https://huggingface.co/OrionLLM/OxCoder-9B
- Donante del bloque MTP: https://huggingface.co/a4lg/Qwen3.5-9B-MTP-ONLY-GGUF
- Modelo Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Proyectores de visión: https://huggingface.co/mradermacher/OxCoder-9B-GGUF
- Script de conversión de buzz: https://gist.github.com/buzz/1c439684d5e3f36492ae9f64ef7e3f67
- Perfil de buzz en GitHub: https://github.com/buzz
