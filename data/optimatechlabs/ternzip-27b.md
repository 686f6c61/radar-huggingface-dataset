# optimatechlabs/ternzip-27b

## Resumen

Ternzip 27B es un artefacto de compresión sin pérdidas para los pesos del modelo Ternary Bonsai 2 27B de Prism ML, publicado por Optimatech Labs LLC. No se trata de un modelo entrenado desde cero, sino de un formato de almacenamiento propietario (extensión `.trits`) que empaqueta las tres variantes oficiales GGUF de Bonsai 2 27B (PTQ1_0, PQ2_0 y Q2_0) en un único archivo de 5,512 GB. Las tres variantes suman 20,779 GB por separado, por lo que el archivo ahorra 15,267 GB (73,47 %) antes de cualquier deduplicación de almacenamiento.

El modelo subyacente, Ternary Bonsai 2 27B, es un modelo de razonamiento de 27 000 millones de parámetros con pesos ternarios (1,58 bits por peso), derivado por Prism ML de `Qwen/Qwen3.8-27B` y con arquitectura identificada como `qwen35`. Ternzip se limita a modificar el formato de almacenamiento de esos pesos, sin alterar los tensores: cada restauración coincide con el SHA-256 publicado por Prism. Su relevancia está en reducir el espacio en disco y facilitar la distribución de las tres variantes desde un único archivo verificable.

La herramienta de restauración (Ternzip v0.4.0) está disponible únicamente para Apple Silicon y permite tanto restaurar los GGUF como ejecutar chat directamente desde el archivo comprimido. La licencia es Apache 2.0, con avisos de Prism y Qwen/Alibaba incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con pesos ternarios (1,58 bits); GGUF identificado como `qwen35`, derivado de Qwen3.8-27B |
| Parametros totales | 27B (modelo subyacente Bonsai 2 27B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible (las pruebas usaron contexto de 1.024 tokens) |
| Tipos de cuantizacion | Ternaria 1,58 bits; layouts PTQ1_0, PQ2_0 y Q2_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con avisos de Prism ML y Qwen/Alibaba) |
| Formato de pesos | GGUF (layouts PTQ1_0, PQ2_0, Q2_0); archivo comprimido `.trits` propietario de Ternzip |

## Arquitectura y entrenamiento

Ternzip no entrena ningun modelo: es una capa de compresion sin perdidas sobre los pesos ya cuantizados de Ternary Bonsai 2 27B. El modelo base es un transformer denso de 27B parametros con pesos ternarios (valores en {-1, 0, +1}), lo que equivale a 1,58 bits por peso y reduce drasticamente el espacio frente a FP16. Prism ML lo derivo de `Qwen/Qwen3.8-27B` y lo publico como modelo de razonamiento; la arquitectura GGUF declarada es `qwen35`.

La innovacion de Ternzip esta en la codificacion de los bloques ternarios: exactamente 42 de cada 128 pesos son cero en el 97,27 % de los bloques, y el codificador aprovecha ese recuento de ceros al comprimir cada bloque, lo que en una comparacion de archivo completo ahorro 86.002.538 bytes. El archivo final ocupa 5.512.286.013 bytes; junto con las herramientas para Mac (26.860.929 bytes) los dos descargables suman 5.539.146.942 bytes, un 73,34 % por debajo del total de los tres archivos GGUF. No hay datos sobre tokens de entrenamiento, composicion del dataset ni RLHF/DPO, ya que corresponden al modelo base y no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo subyacente Bonsai 2 27B, presentado por Prism como modelo de razonamiento.
- Ejecucion de chat directa desde el archivo `.trits` o desde un GGUF PQ2_0 restaurado, mediante las herramientas Ternzip 27B para Apple Silicon.
- Restauracion fiel de pesos: las tres variantes restauradas coinciden con los SHA-256 publicados por Prism.
- Seleccion de layout en la restauracion: PTQ1_0 por defecto, PQ2_0 para el layout de ejecucion en Apple, Q2_0 para llama.cpp b11556 o superior.
- Vision: Prism suministra el proyector de vision como componente opcional separado (no incluido en el archivo).
- Soporte de tool calling, agentes, multilingueismo o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Distribucion de las tres variantes GGUF desde un unico archivo: un equipo que necesite PTQ1_0, PQ2_0 y Q2_0 descarga un solo `.trits` de 5,512 GB en lugar de 20,779 GB, con verificacion SHA-256 de cada restauracion.
- Ejecucion local de chat en Apple Silicon: las herramientas v0.4.0 permiten conversar directamente desde el archivo comprimido sin restaurar, con un arranque en caliente de 58,74 s en un M4 Pro de 48 GB.
- Archivado a largo plazo de pesos ternarios: el formato sin perdidas y la verificacion criptografica lo hacen adecuado para conservar una copia canonica de los tres layouts con integridad comprobable.
- Despliegue en llama.cpp: restaurando el layout Q2_0 se obtiene un GGUF compatible con llama.cpp b11556 o superior para inferencia en CPU/GPU convencionales.
- Reproducibilidad en investigacion: los hashes publicados y el proceso de restauracion documentado permiten reconstruir exactamente los pesos originales de Prism para experimentos comparables.
- Optimizacion de almacenamiento en estaciones de trabajo Mac: con un pico de proceso de 8,52-8,54 GB y recomendacion de al menos 16 GB de memoria unificada, encaja en portatiles Apple de gama alta para pruebas de razonamiento local.
- Pipeline de evaluacion de modelos ternarios: restaurar PQ2_0 y medir throughput (20,13 tokens/s desde Ternzip frente a 19,87 desde PQ2_0 en el mismo backend Metal) para comparar formatos de almacenamiento sin alterar la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de rendimiento medidos por el autor son los siguientes:

| Metrica | Ternzip | Prism PQ2_0 |
|---|---|---|
| Generacion mediana (M4 Pro 48 GB, Metal) | 20,13 tokens/s | 19,87 tokens/s |
| Arranque en caliente desde disco externo | 58,74 s | 1,50 s (desde PQ2_0 restaurado) |
| Arranque desde SSD interno (mediana de 3) | 57,66 s | no disponible |
| Pico de proceso (GB decimales) | 8,52-8,54 GB | 8,04 GB |
| Tensores de pesos cargados | 7.195.047.936 bytes | 7.195.047.936 bytes |
| Coincidencia de tokens generados | 3.021/3.021 IDs en 24 chats emparejados | referencia |

El desglose de ahorro por layout es del 7,30 % para PTQ1_0, 23,51 % para PQ2_0 y 27,72 % para Q2_0. La descompresion tardo 56,20 s y la lectura del archivo 0,40 s en la comprobacion con SSD interno.

## Requisitos de hardware

- VRAM/memoria: pico de proceso medido de 8,52-8,54 GB (decimales) al ejecutar chat desde el archivo; 7,95 GiB de pico, solo 51 MiB por debajo de la capacidad total de un Mac de 8 GiB.
- Memoria recomendada: al menos 16 GB de memoria unificada para chat directo desde el archivo; un Mac de 16 GB no ha sido probado.
- GPU: probado en un Apple M4 Pro de 48 GB con backend Metal. No hay datos para A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos de ejecucion en GPUs NVIDIA consumer; el layout Q2_0 restaurado es compatible con llama.cpp b11556 o superior, lo que abre la puerta a inferencia en hardware convencional, pero sin mediciones publicadas.
- Despliegue: herramientas Ternzip v0.4.0 solo para macOS arm64; llama.cpp b11556 o superior para el layout Q2_0; el proyector de vision se suministra por separado desde Prism.
- Latencia y throughput: 20,13 tokens/s de generacion mediana y 58,74 s de arranque en caliente en M4 Pro de 48 GB; sin datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternzip 27B (este) | 27B | no disponible | Ternaria 1,58 bits (3 layouts) | Apache 2.0 | Hugging Face, herramientas solo macOS arm64 |
| Ternary Bonsai 2 27B (Prism ML) | 27B | no disponible | Ternaria 1,58 bits (PTQ1_0, PQ2_0, Q2_0) | Apache 2.0 | Hugging Face, GGUF por separado |
| Qwen3.8-27B (modelo origen) | 27B | no disponible | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar calidad entre estos modelos; la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Ternzip no es un modelo nuevo: es un contenedor comprimido de los pesos de Prism ML; cualquier limitacion del modelo base (sesgos, alucinaciones, calidad de razonamiento) se hereda integramente.
- Las herramientas de restauracion y chat solo estan disponibles para Apple Silicon (macOS arm64); no hay soporte documentado para Linux, Windows ni GPUs NVIDIA.
- El chat directo desde el archivo tiene un arranque en caliente de 58,74 s frente a 1,50 s desde un PQ2_0 restaurado, lo que penaliza flujos interactivos de arranque frecuente.
- El pico de memoria medido (7,95 GiB) queda a solo 51 MiB de la capacidad de un Mac de 8 GiB; no se recomienda su uso en equipos de 8 GB.
- La longitud de contexto, los idiomas soportados y el comportamiento multilingue no estan documentados en la informacion disponible.
- El proyector de vision no esta incluido; las capacidades multimodales requieren un componente adicional de Prism.
- La licencia Apache 2.0 obliga a conservar los avisos de Prism ML y Qwen/Alibaba; verificar el cumplimiento en redistribuciones.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad sobre el formato.
- El SHA-256 de cada restauracion debe comprobarse con `SHA256SUMS` antes de usar los pesos en produccion.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/optimatechlabs/ternzip-27b
- Modelo base en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Release Ternzip v0.4.0: https://github.com/Optimatech-Labs-LLC/ternzip/releases/tag/v0.4.0
- Herramientas Mac (.tar.gz): https://github.com/Optimatech-Labs-LLC/ternzip/releases/download/v0.4.0/ternzip-27b-tools-macos-arm64.tar.gz
- Citacion del modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf#citation
- Sitio de Prism ML: https://prismml.com
