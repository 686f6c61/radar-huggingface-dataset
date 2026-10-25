# neurosquad/Qwen3-0.6B-SEEDPACK

## Resumen

neurosquad/Qwen3-0.6B-SEEDPACK no es un modelo entrenado, sino un archivo comprimido sin pérdidas del repositorio completo unsloth/Qwen3-0.6B-GGUF, empaquetado con SeedPack, una herramienta de compresión para GPU desarrollada por NeuroSquad. El paquete contiene los 30 ficheros de la release original (10,95 GB en total): el modelo en BF16, las 25 cuantizaciones dinámicas de Unsloth desde UD-IQ1_S hasta UD-Q8_K_XL, el config.json, la plantilla y los parámetros de Ollama y la importance matrix, todo dentro de un único archivo .seedpack de 781,7 MB. El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3 con licencia Apache 2.0.

La innovación no está en los pesos, sino en el método de compresión. SeedPack explota el hecho de que cada cuantización GGUF es una función determinista de los mismos pesos: almacena una sola vez el modelo BF16 (semilla), recodificado con un codificador entrópico específico para pesos BF16, y regenera el resto de cuantizaciones en la GPU mediante un port en CUDA bit-exacto de los cuantizadores de llama.cpp (ggml-quants.c) junto con la importance matrix del repositorio. Solo se guarda el residuo donde el cuant recomputado difiere del fichero publicado, lo que en este caso supone únicamente 1,1 MB adicionales para las 25 cuantizaciones y los cuatro ficheros pequeños.

Es relevante ahora porque ataca un problema real de infraestructura: los repositorios GGUF distribuyen los mismos pesos entre 20 y 30 veces, y los compresores de propósito general apenas los reducen (7-Zip LZMA2 llega al 93,26 % del tamaño original). SeedPack alcanza el 7,14 %, es decir, 5,8 veces menos que el siguiente mejor compresor probado (lmz 1.3.0) y con verificación byte a byte mediante SHA-256, BLAKE3 y CRC32.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3); el repositorio es un archivo SeedPack, no un modelo nuevo |
| Parametros totales | 0,6 B (heredados de Qwen/Qwen3-0.6B; la model card no detalla el desglose) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de ejecución de la model card) |
| Tipos de cuantizacion | 25 cuantizaciones dinámicas de Unsloth, de UD-IQ1_S a UD-Q8_K_XL, más el modelo BF16 como semilla |
| Idiomas soportados | en (único idioma declarado en la model card) |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3-0.6B) |
| Formato de pesos | GGUF dentro de un archivo .seedpack; la semilla interna es BF16 y los quants se regeneran al extraer |

## Arquitectura y entrenamiento

El repositorio no entrena ni afina ningún modelo: contiene la release oficial unsloth/Qwen3-0.6B-GGUF comprimida. Los pesos corresponden a Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros de la familia Qwen3, publicado bajo Apache 2.0 y con soporte de modo pensamiento (thinking mode) según los parámetros de muestreo recomendados en la model card (temp 0.6, top_p 0.95, top_k 20, min_p 0). La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO para el modelo base.

La aportación técnica del paquete es el algoritmo SeedPack. La semilla BF16 se codifica una sola vez con un codificador entrópico adaptado a pesos BF16 y ocupa el 65,2 % de su tamaño original. Cada cuantización se reconstruye desde la semilla en GPU usando un port bit-exacto en CUDA de los cuantizadores de llama.cpp y la importance matrix incluida en el repositorio; los residuos se codifican con las probabilidades propias del cuantizador. En repositorios sin BF16, el cuant más preciso (por ejemplo Q8_0) pasa a ser la semilla. La extracción verifica el hash BLAKE3 de cada fichero y el CRC32 de cada bloque. La primera ejecución compila los cuantizadores para la GPU del usuario (unos 15 s) y los deja en caché.

## Capacidades

- Generación de texto y razonamiento básico: las del modelo base Qwen3-0.6B, sin modificaciones por parte de este repositorio.
- Modo pensamiento (thinking) del modelo base, con los parámetros de muestreo recomendados en la model card.
- Extracción selectiva de cuantizaciones: se puede pedir un único fichero, varios por nombre o máscara (`"*Q4_K*"`), o el repositorio completo.
- Verificación de integridad sin escritura a disco mediante `seedpack test`, que decodifica todo y comprueba hashes.
- Reconstrucción bit-exacta: cada fichero restaurado coincide byte a byte con el original de unsloth/Qwen3-0.6B-GGUF.
- Compatibilidad total con runtimes GGUF tras la extracción (llama.cpp, Ollama, LM Studio, Jan, KoboldCpp, Open WebUI).
- Lectura directa desde Hugging Face (`hf://neurosquad/Qwen3-0.6B-SEEDPACK`) o desde una copia local descargada.
- No incluye tool calling, agentes, visión ni audio como capacidades propias del paquete; dependen exclusivamente del modelo base.

## Casos de uso

- Distribución de cuantizaciones en entornos con ancho de banda limitado: en lugar de transferir 10,95 GB, se transfiere un archivo de 781,7 MB y se regenera localmente el cuant necesario en unos 6 segundos.
- Espejo y archivado de repositorios GGUF: un mirror interno puede almacenar el 7,14 % del espacio original manteniendo la capacidad de reconstruir todas las variantes byte a byte.
- Pipelines de CI/CD que solo necesitan una cuantización: `seedpack x hf://... Qwen3-0.6B-Q4_K_M.gguf -o models` descarga el archivo una vez y escribe únicamente el fichero solicitado, sin materializar el resto.
- Reproducibilidad y auditoría de artefactos: la verificación con BLAKE3 por fichero y CRC32 por bloque permite demostrar que un GGUF desplegado es idéntico al publicado por Unsloth.
- Inferencia local en hardware de consumo: tras extraer, por ejemplo, Q4_K_M, el modelo de 0,6 B se ejecuta en llama.cpp u Ollama con 32.768 tokens de contexto, adecuado para prototipado y pruebas en portátil.
- Servicio de múltiples cuantizaciones en un mismo nodo: un servidor puede almacenar el archivo compacto y generar bajo demanda la variante que pida cada cliente (IQ para CPU, Q8 para calidad, etc.).
- Caché compartida en clústeres de investigación: el archivo único simplifica la sincronización entre nodos y evita duplicar 25 variantes del mismo modelo en sistemas de ficheros distribuidos.
- Formación y demos sobre compresión de pesos: el repositorio documenta el método con métricas reproducibles, útil como caso de estudio de compresión específica de dominio frente a compresores genéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos publicados corresponden al rendimiento del compresor. Entrada: los 30 ficheros de la release, 10,95 GB. Máquina de prueba: NVIDIA RTX 5070 (12 GB), Intel Core i7-8700K, 32 GB de RAM, NVMe, Windows 10.

| Compresor | Archivo | Ratio | Compresión | Descompresión + verificación | Sin pérdidas |
|---|---:|---:|---|---:|:---:|
| SeedPack | 781,7 MB | 7,14 % | 17,7 s · 618 MB/s | 11,1 s · 984 MB/s | Sí |
| lmz 1.3.0 | 4,54 GB | 41,47 % | 38,3 s · 286 MB/s | 6,1 s · 1.786 MB/s | Sí |
| HF Xet (estimación) | 5,11 GB | 46,68 % | No disponible | No disponible | No disponible |
| zstd 1.5.7 -19 --long=30 | 6,57 GB | 59,99 % | 576,3 s · 19 MB/s | 17,7 s · 620 MB/s | Sí |
| zstd 1.5.7 -3 --long=30 | 6,61 GB | 60,36 % | 15,3 s · 715 MB/s | 13,4 s · 816 MB/s | Sí |
| 7-Zip 23.01 -mx9 (LZMA2) | 10,21 GB | 93,26 % | 833,3 s · 13 MB/s | 31,5 s · 347 MB/s | Sí |
| xz 5.4.1 -6 | 10,22 GB | 93,36 % | 465,9 s · 24 MB/s | 100,7 s · 109 MB/s | Sí |
| bzip2 -9 | 10,28 GB | 93,87 % | 181,0 s · 60 MB/s | 88,5 s · 124 MB/s | Sí |
| brotli 1.2 -q7 | 10,32 GB | 94,25 % | 74,9 s · 146 MB/s | 22,3 s · 492 MB/s | Sí |

La tabla original de la model card continúa con más compresores (ZipNN 0.5.4 y otros); la información disponible está truncada en ese punto. En la máquina de referencia, extraer un cuant tarda unos 6 s y el repositorio completo unos 23 s, escrituras incluidas, más 2–4 s de arranque.

## Requisitos de hardware

- Para desempaquetar: GPU NVIDIA Turing (RTX 20xx) o posterior y driver con CUDA 13 (R580 o superior). Probado en una RTX 5070 de 12 GB bajo Windows 10 y Ubuntu (WSL2).
- CPU, RAM y disco: no se especifican mínimos; la máquina de referencia usa un i7-8700K con 32 GB de RAM y SSD NVMe.
- Software: Python 3.11 o superior, Windows 10/11 o Linux. No requiere el CUDA Toolkit; la primera ejecución compila los cuantizadores y los cachea (unos 15 s).
- VRAM para inferencia del modelo base: no publicada por cuant. Un modelo denso de 0,6 B en Q4_K_M queda muy por debajo de los 4 GB, por lo que cabe en cualquier GPU de consumo reciente y en modo CPU; es una estimación, no un dato de la model card.
- Almacenamiento: 781,7 MB para el archivo .seedpack; 10,95 GB si se extrae el repositorio completo; solo el espacio de los ficheros solicitados si se extrae de forma selectiva.
- Opciones de despliegue tras la extracción: llama.cpp (`llama-cli`), Ollama (`ollama create` con Modelfile), LM Studio, Jan, KoboldCpp y Open WebUI.
- Latencia y throughput: 618 MB/s comprimiendo y 984 MB/s descomprimiendo con verificación en la RTX 5070; el throughput de inferencia del modelo no está disponible en la información proporcionada.
- Limitación importante: el archivo .seedpack no es cargable por ningún runtime de inferencia; requiere el paso previo de extracción con la herramienta SeedPack y una GPU NVIDIA compatible.

## Comparativa con modelos similares

La categoría real de este repositorio es la compresión de artefactos GGUF, no la de modelos de lenguaje. Comparativa dentro de esa categoría, con los datos publicados:

| Alternativa | Tamaño de archivo | Ratio | Notas |
|---|---:|---:|---|
| SeedPack (este repo) | 781,7 MB | 7,14 % | Específico para GGUF, requiere GPU NVIDIA Turing o superior |
| lmz 1.3.0 | 4,54 GB | 41,47 % | 5,8 veces más grande; descompresión más rápida (1.786 MB/s) |
| zstd 1.5.7 -19 | 6,57 GB | 59,99 % | Genérico, sin requisito de GPU, compresión 32 veces más lenta |
| 7-Zip 23.01 -mx9 | 10,21 GB | 93,26 % | Prácticamente sin reducción sobre pesos GGUF |

Comparativa como modelo de lenguaje: el paquete contiene Qwen3-0.6B, por lo que su comportamiento es el del modelo base. No se dispone de datos de benchmarks ni de comparaciones con alternativas de tamaño similar (por ejemplo otras familias de menos de 1 B) en la información proporcionada, por lo que esa comparación se marca como no disponible.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado: cualquier evaluación de calidad debe hacerse sobre Qwen3-0.6B, no sobre este repositorio.
- Dependencia de hardware propietario: la extracción exige GPU NVIDIA Turing o posterior y driver CUDA 13; no funciona en CPU, AMD, Intel ni macOS.
- El archivo .seedpack no se puede cargar directamente en llama.cpp, Ollama ni ningún otro runtime; sin la herramienta `seedpack` los datos son inutilizables.
- El ratio de compresión depende de que el repositorio contenga muchas cuantizaciones del mismo modelo; con un único GGUF el método pierde buena parte de su ventaja.
- El método asume un port bit-exacto de los cuantizadores de llama.cpp; cambios en versiones futuras de los cuantizadores o de la importance matrix podrían requerir actualizaciones de la herramienta.
- Las cifras de rendimiento proceden de una única máquina (RTX 5070, i7-8700K, Windows 10) y no se han replicado en otros entornos según la información disponible.
- Herencia del modelo base: Qwen3-0.6B es un modelo pequeño, con riesgo elevado de alucinación en tareas factuales y capacidad limitada de razonamiento multietapa; el único idioma declarado es el inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificaciones, pero se mantienen las obligaciones de atribución y aviso de la licencia original de Qwen.
- Repositorio con 0 descargas y 1 like en el momento de la ficha: no hay evidencia de uso en producción ni de validación independiente del método.
- El SHA-256 de cada fichero se afirma coincidente con unsloth/Qwen3-0.6B-GGUF, pero esa lista no está incluida en la información disponible para verificarla.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neurosquad/Qwen3-0.6B-SEEDPACK
- Herramienta SeedPack (GitHub): https://github.com/glmn-ai/seedpack
- Repositorio GGUF original: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/neurosquad
