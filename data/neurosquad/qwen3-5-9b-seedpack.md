# neurosquad/Qwen3.5-9B-SEEDPACK

## Resumen

`neurosquad/Qwen3.5-9B-SEEDPACK` no es un modelo nuevo, sino un **archivo comprimido sin pérdidas de un repositorio completo de GGUF**. Contiene los 28 ficheros (147,81 GB) del repositorio `unsloth/Qwen3.5-9B-GGUF` —el modelo BF16, 21 cuantizaciones desde UD-IQ2_XXS hasta UD-Q8_K_XL, el proyector de visión en BF16, F16 y F32, la imatrix y el README— dentro de un único archivo de 12,40 GB, un 8,39 % del tamaño original. El modelo subyacente es Qwen3.5-9B, de Alibaba/Qwen, con pipeline image-text-to-text (multimodal) y licencia Apache 2.0.

El interés técnico está en SeedPack, la herramienta de NeuroSquad que genera el archivo: en lugar de guardar 21 cuantizaciones casi idénticas, almacena una sola vez el modelo BF16 codificado con un codificador entrópico y **re-deriva cada cuantización en la GPU** con un port CUDA bit-exacto de los cuantizadores de `ggml-quants.c`, guardando únicamente el residuo diferencial (68,0 MB para las 21 cuantizaciones). La verificación es estricta: SHA-256 por fichero contra el repositorio original, BLAKE3 al desempaquetar y CRC32 por bloque.

Es relevante ahora porque reduce drásticamente el coste de almacenamiento y de ancho de banda al distribuir familias de GGUF: el archivo completo ocupa menos que el mayor fichero individual del repositorio original (12,97 GB) y permite extraer una sola cuantización sin descargar el resto. El paquete requiere GPU NVIDIA Turing o superior para desempaquetar, aunque el modelo no tiene por qué caber en VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | La del modelo base `Qwen/Qwen3.5-9B`; no detallada en la información disponible |
| Parámetros totales | 9 000 millones (según el nombre del modelo base) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 21 variantes GGUF, de UD-IQ2_XXS a UD-Q8_K_XL, más BF16 (fichero sin cuantizar) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF dentro de un archivo `.seedpack` (contenedor comprimido sin pérdidas); los GGUF extraídos son idénticos byte a byte a los de `unsloth/Qwen3.5-9B-GGUF` |

## Arquitectura y entrenamiento

El archivo no aporta información sobre el entrenamiento de Qwen3.5-9B: la model card se centra en el formato de empaquetado. Lo que sí documenta es el funcionamiento de SeedPack 0.2.1, que explota el hecho de que toda cuantización GGUF es una función determinista de los mismos pesos. El proceso tiene cuatro piezas: (1) el modelo BF16 se codifica con un codificador entrópico específico para pesos BF16, pasando de 17,92 GB a 11,73 GB (65,4 % del original); (2) cada cuantización se recalcula desde la semilla en GPU con cuantizadores CUDA bit-exactos y la importance matrix del repositorio; (3) solo se almacena el residuo entre la cuantización re-derivada y el fichero publicado, codificado con las probabilidades propias del cuantizador; (4) el modelo BF16 se procesa en ventanas de aproximadamente 1 GB de tensores, de modo que nunca se mantiene entero en RAM ni en disco salvo que se extraiga.

El resultado medido: las 21 cuantizaciones juntas ocupan 68,0 MB adicionales sobre la semilla. Los ficheros grandes quedan reducidos a residuos mínimos (por ejemplo, `IQ4_NL`, 5,37 GB, ocupa 3,1 MB; `IQ4_XS`, 5,17 GB, ocupa 2,3 MB; `Q3_K_M`, 4,67 GB, ocupa 3,6 MB). La integridad se comprueba con SHA-256 por fichero, BLAKE3 al desempaquetar y CRC32 por bloque, con una operación `seedpack test` que decodifica y verifica sin escribir nada.

## Capacidades

- **Empaquetado y desempaquetado sin pérdidas** de repositorios GGUF completos, con restauración byte a byte verificada por SHA-256.
- **Extracción selectiva**: permite extraer una cuantización concreta (`seedpack x ... Qwen3.5-9B-Q4_K_M.gguf`) o varias por nombre o máscara (`"*Q4_K_M*" mmproj-F16.gguf`), sin descargar el repositorio entero.
- **Acceso directo vía Hugging Face**: el comando `list` solo descarga el índice; `x` descarga el archivo una vez al caché de Hugging Face. También funciona con copias locales del `.seedpack`.
- **Verificación criptográfica** de cada fichero y de cada bloque durante la extracción.
- **Capacidades heredadas del modelo base**: al extraer los GGUF, el modelo resultante es multimodal image-text-to-text (incluye `mmproj` en BF16, F16 y F32 para el proyector de visión) y ejecutable en cualquier runtime GGUF (llama.cpp, Ollama, LM Studio, Jan, KoboldCpp).
- **Independencia del tamaño del modelo respecto a la VRAM**: el procesado por ventanas permite empaquetar y desempaquetar modelos mayores que la GPU.
- No se documentan en la información disponible capacidades de tool calling, agentes, modo thinking ni matemáticas del modelo base.

## Casos de uso

- **Distribución de familias GGUF a gran escala**: publicar un único archivo de 12,40 GB en lugar de 147,81 GB reduce el coste de almacenamiento en el hub y el ancho de banda de descarga; el usuario final extrae solo la cuantización que necesita.
- **Espejos y réplicas con ancho de banda limitado**: sincronizar el archivo de 12,40 GB entre regiones o centros de datos y regenerar localmente las 28 variantes en unos 227 s (651 MB/s medidos) evita transferir casi 148 GB por réplica.
- **Archivado a largo plazo de releases de modelos**: conservar una única semilla más residuos verificables criptográficamente, con la garantía de que el contenido restaurado coincide bit a bit con el publicado originalmente.
- **CI/CD de publicación de cuantizaciones**: integrar `seedpack test` en un pipeline para validar que un release re-empaquetado decodifica correctamente y mantiene los hashes, antes de hacerlo público.
- **Despliegue en máquinas con GPU de 12 GB**: extraer `Qwen3.5-9B-Q4_K_M.gguf` (5,68 GB) en 21 s con un pico de 6,3 GB de VRAM en una RTX 5070, y ejecutarlo después con llama.cpp u Ollama en el mismo equipo.
- **Entornos aislados o air-gapped**: transportar en un solo fichero físico todas las cuantizaciones y el proyector de visión a una máquina sin acceso a Hugging Face, y materializar la variante adecuada in situ.
- **Reproducibilidad de experimentos**: fijar la semilla y comprobar que la cuantización usada en un benchmark coincide exactamente con el fichero publicado, eliminando la variabilidad introducida por conversiones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son los del propio empaquetador, medidos en un equipo con RTX 5070 (12 GB), Intel Core i7-8700K (6 núcleos / 12 hilos), 32 GB de RAM, Windows 10, archivo en dos SSD SATA en striped (~1 GB/s) y caché del sistema en frío:

| Operación | Tiempo | Velocidad |
|---|---:|---:|
| Empaquetar el repositorio completo (147,81 GB) | 232 s | 637 MB/s |
| Extraer una cuantización (Q4_K_M, 5,68 GB) | 21 s | 271 MB/s |
| Extraer el repositorio completo | 227 s | 651 MB/s |
| Verificar el repositorio completo sin escribir | 140 s | 1 056 MB/s |

Pico de memoria GPU: 9,5 GB al empaquetar y 6,3 GB al desempaquetar. Las cuantizaciones IQ son más lentas de re-derivar (UD-IQ2_XXS: unos 23 s). La primera ejecución compila los cuantizadores CUDA para la tarjeta concreta (~15 s) y los cachea. Extraer una sola cuantización implica leer los 11,73 GB del modelo BF16 codificado, por lo que en discos lentos el tiempo se aproxima al de esa lectura.

## Requisitos de hardware

- **GPU obligatoria para empaquetar/desempaquetar**: NVIDIA Turing (RTX 20xx) o superior, con driver CUDA 13 (R580 o superior). No se necesita el CUDA Toolkit instalado.
- **VRAM**: 9,5 GB en el pico de empaquetado y 6,3 GB en el de desempaquetado según la medición del autor; el modelo no tiene que caber en la GPU.
- **Cabe en GPU de consumo**: sí. El autor lo probó con una RTX 5070 de 12 GB; cualquier tarjeta con 8-12 GB debería cubrir el desempaquetado, aunque el dato para 8 GB no está confirmado en la información disponible.
- **VRAM para inferencia** (estimación a partir del tamaño de los ficheros, más overhead de contexto y caché KV no cuantificada):
  - UD-IQ2_XXS y similares: el tamaño no está detallado en la información disponible.
  - Q3_K_M (4,67 GB): aproximadamente 6 GB.
  - IQ4_XS (5,17 GB) e IQ4_NL (5,37 GB): aproximadamente 6-7 GB.
  - Q4_K_M (5,68 GB): aproximadamente 7 GB; es la variante validada en 12 GB.
  - UD-Q8_K_XL (12,97 GB): más de 13 GB, requiere GPU de 16 GB o superior.
  - BF16 (17,92 GB): más de 18 GB, requiere 24 GB o superior (RTX 3090/4090, A100, H100).
- **Entorno**: Python 3.11+, Windows 10/11 o Linux, espacio en disco para el archivo (12,40 GB) más los ficheros extraídos.
- **Runtime de inferencia**: los GGUF extraídos son los originales de Unsloth, así que funcionan con llama.cpp (`llama-cli -m ... --mmproj ... --jinja`), Ollama, LM Studio, Jan y KoboldCpp. Soporte de vLLM o TGI para estos GGUF no está indicado en la información disponible.
- **Throughput del empaquetador**: 637 MB/s al empaquetar y 651 MB/s al extraer el repositorio completo en el hardware de referencia; el rendimiento en inferencia no está documentado.

## Comparativa con modelos similares

| Modelo / artefacto | Parámetros | Contexto | Cuantizaciones | Tamaño de distribución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `neurosquad/Qwen3.5-9B-SEEDPACK` | 9B (base) | No disponible | 21 GGUF + BF16 + 3 mmproj | 12,40 GB (1 archivo) | Apache 2.0 | Hugging Face, requiere SeedPack ≥ 0.2.2 y GPU NVIDIA |
| `unsloth/Qwen3.5-9B-GGUF` (original) | 9B | No disponible | 21 GGUF + BF16 + 3 mmproj | 147,81 GB (28 archivos) | Apache 2.0 | Hugging Face, descarga directa sin dependencias |
| `Qwen/Qwen3.5-9B` (modelo base) | 9B | No disponible | Pesos originales (formato no indicado) | No disponible | Apache 2.0 | Hugging Face |

La comparación relevante es de formato de distribución, no de calidad de modelo: el contenido restaurado por SeedPack es idéntico byte a byte al del repositorio de Unsloth, de modo que el rendimiento del modelo es el mismo. La diferencia está en el coste de descarga (11,9 veces menor), en la dependencia de una GPU NVIDIA y una herramienta externa, y en la necesidad de un paso de extracción previo. Para alternativas de otros fabricantes en la franja de 9B no hay datos en la información proporcionada: no disponible.

## Limitaciones y advertencias

- **No es un modelo listo para usar**: el archivo `.seedpack` no se puede cargar directamente en ningún runtime; hay que extraer los GGUF con `seedpack` antes de la inferencia.
- **Dependencia de hardware NVIDIA**: empaquetar y desempaquetar exige GPU Turing o superior y driver CUDA 13 (R580+). No hay soporte indicado para AMD, Apple Silicon, CPU-only ni para GPUs anteriores a Turing.
- **Dependencia de software externo**: requiere `seedpack>=0.2.2` (el archivo se creó con 0.2.1) y Python 3.11+. La toolchain de compilación de cuantizadores es específica del proyecto `glmn-ai/seedpack`; su mantenimiento a largo plazo no está garantizado en la información disponible.
- **Riesgo en la re-derivación**: la fidelidad byte a byte depende de que el port CUDA de `ggml-quants.c` sea bit-exacto; una versión distinta de la herramienta o del driver podría alterar los resultados. El autor mitiga esto con residuos diferenciales y verificación SHA-256/BLAKE3/CRC32, pero conviene ejecutar `seedpack test` tras cada actualización.
- **Idioma**: la model card declara únicamente inglés (`en`) para el modelo base; el comportamiento en castellano no está documentado.
- **Ausencia de benchmarks**: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales en la información disponible, por lo que no se puede verificar la calidad del modelo subyacente.
- **Riesgos heredados del modelo base**: sesgos, alucinaciones y limitaciones de contexto de Qwen3.5-9B no se detallan en esta model card; deben consultarse en la card original.
- **Licencia**: Apache 2.0 permite uso comercial, pero el titular de los pesos es el modelo base; conviene revisar la licencia de `Qwen/Qwen3.5-9B` antes de un despliegue en producción.
- **Madurez del repositorio**: 0 descargas y 1 like en el momento de la consulta, creado el 24 de octubre de 2026; es un artefacto reciente sin validación comunitaria amplia.
- **Contenido de la búsqueda web no fiable**: los resultados devueltos por la búsqueda no guardan relación con el modelo y se han descartado por completo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neurosquad/Qwen3.5-9B-SEEDPACK
- Herramienta SeedPack (GitHub): https://github.com/glmn-ai/seedpack
- Repositorio GGUF original: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/neurosquad

La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos eran de temática ajena y se han descartado.
