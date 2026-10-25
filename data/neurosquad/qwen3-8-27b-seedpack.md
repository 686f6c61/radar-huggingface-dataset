# neurosquad/Qwen3.8-27B-SEEDPACK

## Resumen

`neurosquad/Qwen3.8-27B-SEEDPACK` no es un modelo de lenguaje, sino un archivo comprimido sin pérdidas del repositorio `unsloth/Qwen3.8-27B-GGUF`, publicado por NeuroSquad mediante su herramienta SeedPack. El repositorio original ocupa 472,07 GB repartidos en 33 ficheros (el modelo BF16 en 2 shards, 24 cuantizaciones, la capa de predicción multi-token y el proyector de visión); este paquete lo reduce a un único archivo de 45,41 GB, un 9,62 % del tamaño original, con restauración byte a byte verificada por SHA-256.

La técnica se apoya en que cada cuantización GGUF es una función determinista de los mismos pesos: el modelo BF16 se codifica una sola vez con un codificador entrópico específico para pesos BF16 (54,66 GB → 35,78 GB) y las cuantizaciones se regeneran en GPU con un port CUDA bit-exacto de los cuantizadores de `llama.cpp`, almacenando únicamente el residual cuando la regeneración no coincide con el fichero publicado. El modelo subyacente es `Qwen/Qwen3.8-27B`, un modelo multimodal (pipeline `image-text-to-text`) de 27B parámetros según el identificador, con licencia Apache 2.0 y etiquetado únicamente en inglés.

Su relevancia es operativa: permite distribuir y archivar un repositorio GGUF completo (incluidas las 21 variantes Unsloth Dynamic) en menos espacio que el modelo BF16 por sí solo (54,66 GB), sin renunciar a la reproducibilidad exacta de cada cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (el paquete incluye una capa de predicción multi-token, `MTP/mtp-Qwen3.8-27B-Q4_0.gguf`, y un proyector de visión) |
| Parámetros totales | 27B según el identificador del modelo base (`Qwen/Qwen3.8-27B`); no confirmado en la información disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (2 shards), F16 (proyector de visión), Q8_0, Q4_0, Q4_1 y 21 variantes Unsloth Dynamic desde UD-IQ1_S hasta UD-Q8_K_XL (24 cuantizaciones en total) |
| Idiomas soportados | `en` (inglés), según los metadatos; el resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (originales de Unsloth) empaquetados dentro de un archivo `.seedpack`; el contenedor no es cargable directamente por runtimes GGUF |
| Modelo base | `Qwen/Qwen3.8-27B` (relación: quantized) |
| Pipeline declarado | `image-text-to-text` |
| Tamaño del repositorio original | 472,07 GB en 33 ficheros |
| Tamaño del archivo SeedPack | 45,41 GB (9,62 % del original; 10,4× más pequeño) |
| Modelo BF16 tras codificación entrópica | 35,78 GB (65,5 % de 54,66 GB) |
| Residuales de cuantizaciones | 8,91 GB para las 21 variantes UD (2,5 % de sus 351,53 GB); 965,3 KB para Q8_0 + MTP + proyector F16; 54,6 MB para Q4_0 y 43,5 MB para Q4_1 |
| Matriz de importancia ajustada | 6,3 MB (reconstruida por mínimos cuadrados, 45 chunks frente a los 1251 del repositorio) |
| Verificación de integridad | BLAKE3 por fichero y CRC32 por chunk |
| Versión mínima de la herramienta | `seedpack>=0.3.0` |

## Arquitectura y entrenamiento

El objeto empaquetado es un repositorio GGUF, no un entrenamiento nuevo: no hay datos de entrenamiento, RLHF ni DPO asociados a este paquete. Lo relevante en términos de arquitectura de compresión es que SeedPack explota la redundancia determinista entre cuantizaciones. El modelo BF16 se codifica con un codificador entrópico diseñado para pesos BF16 y sus shards permanecen como ficheros separados, restaurables individualmente; las cuantizaciones se regeneran desde esos shards en GPU mediante un port CUDA bit-exacto de los cuantizadores de `llama.cpp` (`ggml-quants.c`) usando la matriz de importancia del repositorio.

Donde la regeneración diverge, se almacena solo el residual codificado con las probabilidades propias del cuantizador. Tres casos: Q8_0, la capa MTP y el proyector de visión F16 se reproducen exactamente (965,3 KB en total); Q4_0 y Q4_1 se generaron con una matriz de importancia anterior (45 chunks, según sus metadatos) que SeedPack reconstruye por mínimos cuadrados sobre las escalas de bloque y guarda en 6,3 MB; y las 21 variantes UD provienen del pipeline propio de Unsloth, cuyos códigos se desvían del redondeo plano a lo largo de cada fila, por lo que sus residuales cuestan 8,91 GB (2,5 % del total). El codificador conoce la posición de cada peso en la fila y deduplica tensores compartidos entre cuantizaciones (4837 referencias registradas). Los modelos mayores que la VRAM o la RAM se procesan en ventanas de tensores de aproximadamente 1 GB, sin mantenerlos completos en memoria ni en disco salvo al extraerlos.

Del modelo base `Qwen/Qwen3.8-27B` no se aportan en la información disponible detalles sobre arquitectura interna, composición del dataset ni técnicas de atención; el repositorio evidencia soporte multimodal (proyector de visión en BF16 y F16) y decodificación con capa de predicción multi-token (MTP).

## Capacidades

- Archivado sin pérdidas de repositorios GGUF completos: restauración byte a byte de los 33 ficheros, con verificación SHA-256 coincidente con `unsloth/Qwen3.8-27B-GGUF`.
- Extracción selectiva por nombre o máscara (por ejemplo, un solo quant o varios más el proyector `mmproj-F16.gguf`).
- Verificación sin escritura a disco mediante el subcomando `test`, que decodifica y comprueba todo el contenido.
- Streaming de modelos mayores que la VRAM y que la RAM disponible, en ventanas de tensores de ~1 GB.
- Deduplicación de tensores compartidos entre cuantizaciones distintas (4837 referencias).
- Reconstrucción de matrices de importancia a partir de las propias cuantizaciones (ajuste por mínimos cuadrados sobre escalas de bloque).
- Generación de pesos en GPU: compilación y caché de los cuantizadores CUDA en la primera ejecución (unos 15 s).
- Capacidades heredadas del modelo base: el pipeline declarado es `image-text-to-text` (visión y texto) y el formato GGUF extraído es ejecutable en llama.cpp y derivados; el resto de capacidades del modelo Qwen3.8-27B no está detallado en la información disponible.
- No soporta tool calling, agentes ni modos de razonamiento como función propia: es una herramienta de compresión, no un modelo generativo.

## Casos de uso

- Distribución de un catálogo completo de cuantizaciones: en lugar de publicar o descargar 472,07 GB, un equipo descarga 45,41 GB y extrae solo el quant que necesita (`seedpack x ... Qwen3.8-27B-UD-Q4_K_XL.gguf`), con verificación de integridad incluida.
- Archivado a largo plazo de artefactos de modelo: conservar la versión exacta de las 24 cuantizaciones y del proyector de visión en 45,41 GB, menos que el BF16 aislado (54,66 GB), útil para auditoría y reproducibilidad de evaluaciones pasadas.
- Caché de CI/CD para pipelines de evaluación: almacenar el archivo único como artefacto y regenerar en el runner únicamente el quant objetivo antes de cada batería de benchmarks, evitando repositorios de cientos de GB en el almacenamiento del runner.
- Despliegue en entornos con red restringida o air-gapped: transportar un único fichero de 45,41 GB en medios físicos y reconstruir en destino el quant y el `mmproj` F16 necesarios para servir el modelo con `llama-server`.
- Reproducción bit-exacta de cuantizaciones para investigación: comparar el fichero regenerado con el publicado usando los residuales y hashes, lo que permite estudiar la deriva de los códigos de Unsloth Dynamic frente al redondeo plano.
- Servicio multimodal en producción: extraer `Qwen3.8-27B-UD-Q4_K_XL.gguf` junto a `mmproj-F16.gguf` y servirlo con llama.cpp, Ollama, LM Studio, Jan o KoboldCpp usando el pipeline `image-text-to-text` del modelo base.
- Ahorro de espacio en estaciones de trabajo con discos limitados: mantener el archivo comprimido y materializar cuantizaciones bajo demanda, dado que la herramienta no requiere que el modelo completo quepa en VRAM ni en RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la información disponible. La model card incluye una tabla de velocidad de empaquetado/desempaquetado, pero está truncada en el fragmento proporcionado, por lo que no se pueden reproducir cifras de latencia ni de throughput. El único dato contextual es la plataforma de medida: NVIDIA RTX 5070 (12 GB), Intel Core i7-8700K (6 núcleos / 12 hilos), 32 GB de RAM, Windows 10, ficheros origen en dos SSD SATA en stripe a aproximadamente 1 GB/s y archivo de salida en otro SSD SATA; los tiempos declarados incluyen arranque del proceso y escrituras a disco.

## Requisitos de hardware

- Para empaquetar y desempaquetar: GPU NVIDIA Turing (RTX 20xx) o posterior, con driver CUDA 13 (R580 o superior). No se requiere el CUDA Toolkit.
- Python 3.11 o superior; Windows 10/11 o Linux (probado en RTX 5070 de 12 GB bajo Windows 10).
- El modelo no necesita caber en VRAM: el procesamiento se hace en ventanas de ~1 GB de tensores, lo que permite operar con 12 GB de VRAM y 32 GB de RAM incluso con un BF16 de 54,66 GB.
- Disco: 45,41 GB para el archivo más el espacio de los ficheros que se extraigan (hasta 472,07 GB si se extrae el repositorio completo).
- Inferencia del modelo extraído (estimación a partir del tamaño de los ficheros publicados, no confirmada en la información): BF16 54,66 GB requiere ~55 GB o más de VRAM, o descarga a CPU; Q4_1 17,54 GB y Q4_0 16,06 GB apuntan a ~17-19 GB de VRAM. Las 21 variantes UD suman 351,53 GB, con un tamaño medio de ~16,7 GB por fichero, pero no se publica el tamaño individual de cada una.
- GPU recomendadas: A100/H100 para BF16 sin cuantizar; RTX 4090 (24 GB) o GPUs de 24 GB o más para Q4_0/Q4_1; RTX 5070 (12 GB) solo con cuantizaciones pequeñas, cuyo tamaño exacto no está disponible (UD-IQ1_S es la menor de la escala).
- Despliegue del modelo extraído: `llama-cli`/`llama-server` con `--mmproj models/mmproj-F16.gguf --jinja`, además de Ollama, LM Studio, Jan y KoboldCpp, que abren los `.gguf` extraídos directamente.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Artefacto | Contenido | Parámetros | Contexto | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `neurosquad/Qwen3.8-27B-SEEDPACK` | Repositorio Unsloth GGUF completo en un archivo `.seedpack` | 27B (modelo base) | No disponible | 45,41 GB | Apache 2.0 | Público; requiere `seedpack>=0.3.0` y GPU NVIDIA |
| `unsloth/Qwen3.8-27B-GGUF` | 33 ficheros GGUF sueltos, listos para usar | 27B | No disponible | 472,07 GB | Apache 2.0 | Público; descarga directa |
| Modelo BF16 aislado (`Qwen/Qwen3.8-27B`) | Pesos BF16 en 2 shards | 27B | No disponible | 54,66 GB | Apache 2.0 | Público |
| Una cuantización individual (p. ej. Q4_0) | Un único `.gguf` | 27B | No disponible | 16,06 GB | Apache 2.0 | Público tras extracción |

No se dispone de datos de rendimiento (MMLU, HumanEval, GSM8K u otros) que permitan comparar calidad frente a modelos alternativos de tamaño similar; esta comparativa es exclusivamente de formato, tamaño y licencia.

## Limitaciones y advertencias

- No es un modelo ejecutable: el archivo `.seedpack` no se puede cargar con llama.cpp, Ollama ni ningún runtime GGUF; es obligatorio desempaquetar antes.
- Dependencia de hardware propietario: requiere GPU NVIDIA Turing o posterior y driver CUDA 13 (R580+). No se documenta soporte para CPU, AMD, Apple Silicon ni GPU NVIDIA anteriores a Turing.
- Dependencia de versión: se exige `seedpack>=0.3.0`, la primera versión que maneja modelos divididos en shards, codifica los tipos IQ y la deriva de los quantos Dynamic, y ajusta matrices de importancia. La reproducibilidad bit-exacta está ligada a esa implementación y a los cuantizadores compilados en la primera ejecución.
- Las 21 variantes Unsloth Dynamic no son re-derivables exactamente desde BF16 y la matriz de importancia: dependen de 8,91 GB de residuales, por lo que su restauración es más frágil ante cambios de versión que la de Q8_0 o el proyector F16.
- Cadena de confianza de terceros: el paquete lo publica `neurosquad`, no Qwen ni Unsloth. Aunque se declaran hashes BLAKE3 por fichero y CRC32 por chunk, conviene verificarlos contra el repositorio original antes de usarlo en producción.
- Señales de adopción mínimas: 0 descargas y 1 like en el momento de la ficha, repositorio con tamaño reportado de 0,0 GB y sin validación independiente conocida.
- Sin datos de calidad: no hay benchmarks, evaluaciones de sesgo ni tasas de alucinación publicadas para el modelo base en la información disponible.
- Idiomas: los metadatos solo declaran `en`; el comportamiento en castellano u otras lenguas no está documentado.
- Licencia: Apache 2.0, heredada del modelo base y enlazada al LICENSE de `Qwen/Qwen3.8-27B`. Conviene revisar dicho fichero para obligaciones de atribución en uso comercial; la licencia del empaquetado en sí no se declara por separado.
- Coste de almacenamiento al extraer: la extracción completa requiere 472,07 GB adicionales a los 45,41 GB del archivo.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/neurosquad/Qwen3.8-27B-SEEDPACK
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Repositorio GGUF original: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Herramienta SeedPack (código fuente): https://github.com/glmn-ai/seedpack
- Perfil del autor: https://huggingface.co/neurosquad
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; las búsquedas devolvieron únicamente páginas sin relación (tier lists de un videojuego).
