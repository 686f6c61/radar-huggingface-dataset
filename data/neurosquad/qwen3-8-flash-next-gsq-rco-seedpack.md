# neurosquad/Qwen3.8-Flash-Next-GSQ-RCO-SEEDPACK

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-SEEDPACK es un archivo comprimido sin pérdida (lossless) que contiene la totalidad del repositorio de cuantizaciones GGUF [ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF) del modelo Qwen3.8-Flash-Next, publicado por la cuenta neurosquad. No es un modelo nuevo en sí mismo, sino un artefacto de distribución: reúne cuatro tamaños de cuantización (IQ3_S, IQ3_XXS, IQ2_XS y Q2_0, con dos shards cada uno), el proyector de visión en BF16, las asignaciones de tensores RCO, los gráficos y el README en un único archivo de 112,75 GB frente a los 294,82 GB del repositorio original (el 38,2 %, es decir, 2,61× más pequeño).

El problema que resuelve es el coste de almacenamiento y transferencia de repositorios GGUF multi-cuantización de modelos MoE grandes. SeedPack, la herramienta de archivado con aceleración GPU desarrollada por NeuroSquad, logra la compresión codificando entre sí las distintas versiones de cada tensor: los bytes idénticos se almacenan una sola vez y las versiones posteriores se codifican a partir de una predicción generada con un puerto CUDA bit-exacto de los cuantizadores de llama.cpp. Cada archivo se restaura byte a byte, con verificación mediante SHA-256, BLAKE3 y CRC32.

El modelo base, Qwen3.8-Flash-Next, es un modelo multimodal (image-text-to-text) de arquitectura MoE con 512 expertos, desarrollado por Qwen bajo la licencia qwen-community-license-1.0. Esta ficha se centra en el paquete de cuantizaciones, dado que no se ha publicado una model card detallada del modelo base en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (transformador mixture-of-experts con 512 expertos), multimodal (image-text-to-text) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (solo se sabe que es MoE con 512 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 (GGUF), proyector de vision en BF16 |
| Idiomas soportados | en (etiquetado en la model card; el modelo base Qwen suele ser multilingue, pero no consta en la informacion) |
| Licencia | qwen-community-license-1.0 (other) |
| Formato de pesos | GGUF empaquetado en archivo SeedPack (metodo M30); restauracion byte a byte del repositorio original |

Datos adicionales del paquete:

| Concepto | Valor |
|---|---|
| Tamano del repositorio original | 294,82 GB (21 archivos) |
| Tamano del archivo SeedPack | 112,75 GB (38,2 % del original, 2,61× mas pequeño) |
| Revision de referencia | ed59f92082b1e93c0e96d60a8b11aab089b52f09 |
| Tamano de una sola cuantizacion | 66,42 GB a 83,62 GB |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, sigue una arquitectura de transformador mixture-of-experts con 512 expertos por capa, lo que explica que los tensores de expertos alcancen varios GB y que las cuantizaciones completas ocupen entre 66 y 84 GB por tamaño. Es un modelo multimodal: incluye un proyector de visión en BF16 (`mmproj-Qwen3.8-Flash-Next-BF16.gguf`, 905,9 MB en el original) que habilita la entrada de imagen junto al texto. Destaca además la presencia de una tabla de embeddings por capa (`per_layer_token_embd`, cuantizada en IQ4_NL) que ocupa 115,20 GB sin comprimir, un componente inusualmente grande que corresponde a la técnica de n-gram embedding, posiblemente relacionada con decodificación especulativa por n-gramas. Sobre el preentrenamiento (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en la model card disponible.

La innovación técnica principal de este repositorio no está en el modelo sino en el formato de distribución. SeedPack 0.4.0 emplea el método M30: como el repositorio no incluye un modelo BF16 del que regenerar las cuantizaciones, codifica las cuatro versiones de cada tensor entre sí. Ordena las versiones por tamaño, codifica la mayor de forma independiente (el 96,0 % de sus bytes, porque los códigos de GSQ son casi uniformes) y codifica cada versión posterior a partir de una predicción: dequantiza las versiones previas, calcula su media ponderada por precisión, la cuantiza al tipo de la versión siguiente con un puerto CUDA bit-exacto de los cuantizadores de llama.cpp y codifica el archivo publicado contra esa predicción (primero las escalas, luego cada código de peso). Las versiones posteriores en conjunto cuestan solo el 26,5 % de sus bytes. Los tensores grandes se cortan en porciones de 64M de pesos para mantener el empaquetado dentro de 2,7 GB de memoria GPU y 5,5 GB de RAM. La integridad se verifica con hash BLAKE3 por archivo y CRC32 por chunk.

## Capacidades

Capacidades del modelo base Qwen3.8-Flash-Next (inferidas del pipeline y la arquitectura; no hay model card detallada):

- Comprensión multimodal imagen-texto (pipeline image-text-to-text) mediante el proyector de visión BF16 incluido.
- Generación de texto en inglés (idioma etiquetado en la model card).
- Arquitectura MoE con 512 expertos, orientada a inferencia eficiente con activación dispersa de parámetros.
- Posible decodificación especulativa mediante la tabla de n-gram embedding (`per_layer_token_embd`, 115,20 GB en IQ4_NL), aunque el README no lo confirma explicitamente.

Capacidades del paquete SeedPack en sí:

- Restauración byte a byte de las cuatro cuantizaciones GGUF (IQ3_S, IQ3_XXS, IQ2_XS, Q2_0), con dos shards cada una.
- Extracción selectiva: se puede descargar un solo tamaño (por ejemplo IQ3_S más el proyector de visión) sin descomprimir el resto.
- Verificación de integridad: `seedpack test` decodifica y comprueba todo sin escribir en disco; `seedpack list` consulta solo el índice.
- Soporte de fuentes `hf://` (descarga directa a la caché de Hugging Face) y de copias locales ya descargadas.

No se ha publicado información sobre tool calling, soporte de agentes, thinking mode o capacidades de audio en la model card disponible.

## Casos de uso

- Archivado y espejo (mirroring) de repositorios GGUF grandes: organizaciones que quieran conservar las cuatro cuantizaciones del modelo pueden hacerlo con 112,75 GB en lugar de 294,82 GB, un ahorro de 182 GB por modelo, ideal para backups y réplicas internas.
- Transferencia entre clústeres o regiones: mover el modelo completo entre nodos de inferencia cuesta 2,61× menos de ancho de banda; la verificación BLAKE3/CRC32 garantiza que la copia llegue intacta.
- Descarga selectiva para pruebas de hardware: un desarrollador puede extraer solo IQ3_S y el proyector de visión con `seedpack x ... "IQ3_S/*" mmproj-...gguf` para evaluar el modelo en su GPU sin descargar los 294,82 GB completos.
- Inferencia multimodal local en estaciones de trabajo: las cuantizaciones IQ2_XS y Q2_0 reducen el footprint de memoria para ejecutar el modelo con llama.cpp u Ollama en hardware de consumo, aunque dada la talla (66-84 GB por cuantización) se requieren sistemas con mucha RAM o multi-GPU.
- Distribución en entornos con almacenamiento limitado: proveedores de inferencia y marketplaces de modelos pueden alojar el paquete comprimido y descomprimir bajo demanda el tamaño que cada cliente solicite.
- Reproducibilidad científica: la correspondencia exacta de SHA-256 con la revisión `ed59f920` del repositorio original permite citar y restaurar una versión inmutable de las cuantizaciones en experimentos.
- Compresión de otros repositorios GGUF multi-cuantización: el método M30 y la herramienta SeedPack son reutilizables para cualquier repositorio con múltiples cuantizaciones del mismo modelo, no solo este.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni del modelo base Qwen3.8-Flash-Next ni de las cuantizaciones GSQ-RCO). Los unicos datos de rendimiento cuantitativos son los de compresion del propio paquete:

| Concepto | Valor |
|---|---|
| Ratio de compresion global | 38,2 % del original (2,61×) |
| Tabla n-gram (IQ4_NL, shard 2 identico en los 4 tamaños) | 115,20 GB → 27,25 GB (94,6 % de una copia, almacenada una vez) |
| Tensores identicos entre tamaños | 7,49 GB → 0 (almacenados una vez) |
| Primera version de cada tensor, codificada sola | 56,55 GB → 54,28 GB (96,0 %) |
| Versiones posteriores, codificadas en cadena | 114,43 GB → 30,34 GB (26,5 %) |
| Proyector de vision BF16 | 905,9 MB → 699,8 MB (77,2 %) |

## Requisitos de hardware

Requisitos para usar el paquete SeedPack (extraer y verificar):

- GPU NVIDIA de arquitectura Turing (RTX 20xx) o posterior, con driver CUDA 13 (R580 o más reciente). No hace falta CUDA Toolkit; el modelo no tiene que caber en la memoria de la GPU.
- Python 3.11+; Windows 10/11 o Linux. Probado en una RTX 5070 (12 GB) bajo Windows 10.
- Espacio en disco: 112,75 GB para el archivo más el espacio de los archivos extraídos (66,42-83,62 GB por cuantización).
- Consumo durante el empaquetado/extracción: porciones de 64M de pesos se mantienen dentro de 2,7 GB de VRAM y 5,5 GB de RAM.

Requisitos para ejecutar el modelo extraído:

- Cada cuantización GGUF ocupa 66,42 a 83,62 GB, por lo que no cabe en una sola GPU de consumo: se necesita multi-GPU (por ejemplo 2× A100 80 GB o 4× RTX 4090 con offload) o un sistema con más de 96 GB de RAM para offload a CPU con llama.cpp.
- Despliegue: el formato GGUF es compatible con llama.cpp y derivados (Ollama, LM Studio). No consta compatibilidad verificada con vLLM o TGI para estos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa del paquete con la distribución original y con el enfoque habitual de descarga por cuantización:

| Aspecto | SeedPack (este repo) | Repositorio GGUF original (ISTA-DASLab) | Descarga de un solo tamaño |
|---|---|---|---|
| Contenido | 4 cuantizaciones + mmproj + extras | 4 cuantizaciones + mmproj + extras | 1 cuantización |
| Tamano | 112,75 GB | 294,82 GB | 66,42-83,62 GB |
| Integridad | SHA-256/BLAKE3/CRC32, byte a byte | SHA-256 de Hugging Face | SHA-256 de Hugging Face |
| Herramienta necesaria | seedpack >= 0.4.0 (GPU NVIDIA Turing+) | ninguna | ninguna |
| Uso recomendado | archivar/mover todo | acceso directo por archivo | solo se necesita una cuantización |

Como alternativa de modelo, otros MoE multimodales cuantizados en GGUF (por ejemplo, variantes de la serie Qwen distribuidas por ISTA-DASLab u otros cuantizadores) serían comparables en categoría, pero no se dispone de datos suficientes del modelo base para una comparación de parámetros y rendimiento: no disponible.

## Limitaciones y advertencias

- Este repositorio no es un modelo ejecutable directamente: hay que instalar SeedPack (>= 0.4.0) y extraer los GGUF antes de poder inferir.
- La extracción requiere obligatoriamente una GPU NVIDIA Turing o posterior con driver CUDA 13 (R580+); no funciona en CPU, ni en GPU AMD/Apple, ni en drivers anteriores.
- Si solo se necesita una cuantización, descargarla del repositorio original es más barato (66,42-83,62 GB) que el archivo completo (112,75 GB).
- Las cuantizaciones son agresivas (IQ2_XS, Q2_0): cabe esperar degradación de calidad respecto a pesos de mayor precisión, especialmente en razonamiento y código; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El método GSQ cuantiza cada tensor de forma independiente por tamaño, por lo que las distintas cuantizaciones no son derivadas de un único maestro BF16 incluido en el repo (no hay modelo BF16 completo en el paquete).
- Licencia qwen-community-license-1.0 (tipo "other"): conviene revisar el archivo LICENSE para conocer las restricciones de uso comercial; no consta en la información disponible.
- Idioma etiquetado como inglés únicamente; el comportamiento en castellano no está documentado.
- Riesgo de alucinación y sesgos: inherentes a cualquier LLM; no se ha publicado información específica sobre mitigaciones para este modelo.
- Descargas registradas: 0; es un artefacto muy reciente y sin adopción verificada por la comunidad.

## Enlaces

- Repositorio del paquete: https://huggingface.co/neurosquad/Qwen3.8-Flash-Next-GSQ-RCO-SEEDPACK
- Repositorio GGUF original: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Revision de referencia: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF/tree/ed59f92082b1e93c0e96d60a8b11aab089b52f09
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta SeedPack (GitHub): https://github.com/glmn-ai/seedpack
- Papers referenciados en los tags (arXiv): https://arxiv.org/abs/2604.18556 y https://arxiv.org/abs/2605.00649 (no se ha verificado su contenido en la informacion disponible)
