# bambocher/Qwen3.5-0.8B-oQ2e-mtp

## Resumen

Qwen3.5-0.8B-oQ2e-mtp es un checkpoint cuantizado del modelo Qwen3.5-0.8B, publicado por el usuario bambocher mediante la herramienta oQ (oMLX v0.7.1rc1), que aplica cuantización de precisión mixta. El resultado es un peso medio efectivo de 4,648 bits por parámetro sobre un total de 873.438.784 parámetros reales, almacenados en 0,473 GiB. El repositorio ocupa aproximadamente 0,5 GB y está empaquetado exclusivamente para MLX, la librería de Apple Silicon.

El checkpoint no es una cuantización uniforme: el 69,517% de los pesos lógicos (0,607B) se guarda en affine 2-bit con grupo de 64, mientras que un 11,815% (0,103B) permanece en BF16, y el resto se reparte entre 4, 5 y 6 bits. Esa mezcla busca preservar en alta precisión las capas más sensibles mientras comprime agresivamente el grueso de la matriz de pesos.

Un detalle relevante para la evaluación: el checkpoint incluye tres componentes diferenciados, un modelo de lenguaje de 0,752B, un codificador de visión de 0,101B y una cabeza MTP (multi-token prediction) de 0,020B. Es, por tanto, un modelo multimodal con capacidad de decodificación especulativa integrada, aunque el autor no documenta contexto, idiomas, licencia ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con codificador de visión y cabeza MTP (etiqueta de arquitectura `qwen3_5`) |
| Parámetros totales | 873.438.784 (0,873B) |
| Parámetros activos | No disponible (el autor no documenta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Precisión mixta oQ: affine 2-bit (grupo 64), affine 4-bit (grupo 64), affine 5-bit (grupo 64), affine 6-bit (grupo 64) y BF16; media efectiva de 4,648 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato MLX) |
| Biblioteca de inferencia | MLX |
| Desglose de componentes | Lenguaje: 0,752B (0,272 GiB); visión: 0,101B (0,187 GiB); cabeza MTP: 0,020B (0,014 GiB) |
| Tamaño del repositorio | 0,5 GB (0,473 GiB de pesos) |
| Descargas / likes | 12 / 0 |
| Fecha de creación | 2026-10-20 |

Distribución de bits por bloque:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 2-bit, grupo 64 | 0,607B | 69,517% | 0,177 GiB | 2,50 |
| Affine 4-bit, grupo 64 | 0,018B | 2,101% | 0,010 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,133B | 15,185% | 0,085 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,012B | 1,382% | 0,009 GiB | 6,50 |
| BF16 | 0,103B | 11,815% | 0,192 GiB | 16,00 |
| **Total** | **0,873B** | **100%** | **0,473 GiB** | **4,648** |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3.5, según la etiqueta `qwen3_5` declarada en el repositorio. El checkpoint conserva tres bloques funcionales: el modelo de lenguaje (0,752B de pesos lógicos), un codificador de visión (0,101B) que habilita entrada de imágenes, y una cabeza MTP (0,020B) orientada a la predicción de múltiples tokens por paso, técnica habitualmente empleada para decodificación especulativa y aceleración de la generación. El autor no aporta detalles sobre número de capas, dimensiones ocultas, mecanismo de atención ni tipo de tokenizador.

No se dispone de información sobre el entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La intervención documentada es exclusivamente de compresión: la cuantización de precisión mixta con oQ v0.7.1rc1, que asigna 2 bits al 69,5% de los pesos lógicos y mantiene en BF16 el 11,8%, presumiblemente para preservar capas críticas (el codificador de visión y la cabeza MTP quedan mayoritariamente en alta precisión, a juzgar por el desglose de almacenamiento).

## Capacidades

- Generación de texto autorregresiva en un modelo de 0,752B de pesos lógicos, orientado a tareas ligeras y a ejecución local.
- Procesamiento de imágenes: el checkpoint incorpora un codificador de visión de 0,101B, por lo que el modelo base es multimodal (entrada de imagen, salida de texto).
- Predicción multi-token mediante la cabeza MTP de 0,020B, que permite decodificación especulativa si el runtime de MLX la soporta.
- Ejecución en Apple Silicon a través de MLX, con un peso en disco de 0,473 GiB.
- Soporte de tool calling, agentes, modo thinking o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac: el checkpoint ocupa 0,473 GiB y está empaquetado en MLX, por lo que puede cargarse íntegramente en memoria unificada de cualquier Mac con chip de la serie M, sin GPU dedicada.
- Pruebas de pipelines MLX en integración continua: al pesar menos de 0,5 GB, sirve como modelo de humo para validar código de carga, tokenización y generación antes de escalar a checkpoints mayores.
- Prototipado de aplicaciones multimodales: el codificador de visión permite experimentar con flujos imagen-a-texto (etiquetado, descripción breve, extracción de información de capturas) en un entorno de recursos muy limitados.
- Modelo borrador para decodificación especulativa: la cabeza MTP incluida está pensada para proponer varios tokens por paso y acelerar un modelo mayor en el mismo host.
- Evaluación de cuantización de precisión mixta: útil como caso de estudio para medir la degradación de un modelo de 0,8B cuando el 69,5% de sus pesos baja a 2 bits.
- Asistentes de texto offline en dispositivos con restricciones de memoria: resúmenes cortos, reformulación y clasificación de texto sin conexión a servicios en la nube.
- Docencia y experimentación: permite reproducir el flujo completo de cuantización con oQ y comparar la distribución de bits resultante sobre un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de perplejidad, ni comparaciones con el checkpoint sin cuantizar. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM o memoria unificada: 0,473 GiB solo para pesos; con overhead de activaciones y caché KV, un entorno de 1 a 2 GB es suficiente para contexto corto.
- Cabe holgadamente en cualquier Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), que es el único backend soportado por el formato entregado.
- GPU NVIDIA (A100, H100, RTX 4090) o AMD: no utilizables directamente con estos pesos; requerirían conversión a otro formato, no incluida en el repositorio.
- Despliegue: MLX (mlx-lm para texto, mlx-vlm para el modo multimodal). No se distribuyen GGUF, ni plantillas para vLLM, llama.cpp, Ollama o TGI.
- La cabeza MTP solo aporta aceleración si el runtime de MLX implementa decodificación especulativa con ella; en caso contrario, se ignora.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-oQ2e-mtp (este) | 0,873B | No disponible | safetensors MLX | No disponible | Cuantización mixta, 4,648 bits/peso, 0,473 GiB |
| Qwen3.5-0.8B (base, sin cuantizar) | 0,873B (según este checkpoint) | No disponible | No disponible | No disponible | Referencia de partida; el repositorio no enlaza su model card ni sus métricas |
| Otras cuantizaciones del mismo modelo base | 0,873B | No disponible | No disponible | No disponible | No se han identificado en la información disponible |

No se dispone de datos verificables de alternativas comparables (parámetros, contexto, benchmarks o licencia) en la información proporcionada, por lo que la comparación cuantitativa no es posible. Como referencia aritmética, almacenar los 0,873B en BF16 supondría unos 1,75 GB, frente a los 0,473 GiB de este checkpoint, es decir, una reducción aproximada del 73% en espacio.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial permitido. Es necesario consultar la licencia del modelo base Qwen3.5-0.8B antes de cualquier despliegue en producción.
- Cuantización agresiva: el 69,5% de los pesos lógicos está en 2 bits con grupo de 64, lo que previsiblemente degrada razonamiento, coherencia en secuencias largas y fidelidad factual frente al modelo sin cuantizar. No hay métricas que cuantifiquen esa pérdida.
- Idiomas no documentados: se desconoce la cobertura lingüística real y el comportamiento en castellano.
- Contexto no documentado: no puede planificarse su uso en conversaciones multi-turno largas o documentos extensos.
- Riesgo de alucinación: en un modelo de menos de 1B de parámetros con compresión a 2 bits, la generación de datos falsos con apariencia plausible es esperable; requiere verificación externa.
- Dependencia de plataforma: formato MLX exclusivamente, lo que limita el despliegue a Apple Silicon y descarta servidores x86 con GPU NVIDIA sin conversión previa.
- Madurez comunitaria mínima: 12 descargas y 0 likes en la fecha de los datos; sin validación independiente ni issues documentados.
- La cabeza MTP puede quedar inerte si el runtime no implementa decodificación especulativa, con lo que parte del checkpoint no aportaría beneficio.
- Los resultados de búsqueda web asociados no contienen información sobre este modelo: no hay papers, blogs ni demos que respalden su calidad.

## Enlaces

- HuggingFace: https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ2e-mtp
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-0.8B: no disponible en la información proporcionada
- Paper, blog o demo del autor: no disponible
