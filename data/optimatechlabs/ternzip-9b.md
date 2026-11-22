# optimatechlabs/ternzip-9b

## Resumen

Ternzip 9B es un paquete de compresión sin pérdidas del checkpoint cuantizado Ternary Bonsai 2 9B de Prism ML, distribuido por Optimatech Labs. No se trata de un modelo nuevo ni de un reentrenamiento: es un contenedor propietario (`.trits`) que reduce el GGUF original de 1.997.486.976 bytes a 1.834.157.871 bytes, un ahorro del 8,18%, y permite restaurarlo byte a byte, incluidos los 427 tensores, los bits de escala originales, el tokenizador, los metadatos y el padding.

El modelo subyacente es Ternary Bonsai 2 9B, un transformer derivado de Qwen3.5-9B y cuantizado a 1,58 bits (ternario: valores −1, 0 y +1) mediante post-training quantization. Ternzip añade una capa de compresión específica para este formato y un runtime Metal propio para Apple Silicon que permite inferencia directa desde el archivo comprimido, sin necesidad de restaurar el GGUF a disco.

Su relevancia es práctica: demuestra que un modelo de ~9B en formato ternario cabe en 1,8 GB y se ejecuta a unos 60 tokens/s en un Apple M4 Pro, con una velocidad medida superior a las tres variantes de packing oficiales de Prism (PTQ1_0, PQ2_0 y Q2_0) y con streams de tokens idénticos a los del control Q2_0 en las 24 comprobaciones realizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B, pesos ternarios (1,58 bits) |
| Parametros totales | ~9B (modelo base Ternary Bonsai 2 9B); pesos contados en el runtime: 1.999.911.846 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Ternaria PTQ1_0 (1,58 bits) como formato de referencia; packings oficiales de Prism PTQ1_0, PQ2_0 y Q2_0 |
| Idiomas soportados | no disponible (los benchmarks citan prompts en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (restaurado byte a byte) y formato propietario Ternzip `.trits` |
| Tamano del repositorio | 1,8 GB (archivo `.trits` de 1.834.157.871 bytes) |
| Modelo base | prism-ml/Ternary-Bonsai-2-9B-gguf |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo subyacente es Ternary Bonsai 2 9B, desarrollado por Prism ML a partir de Qwen3.5-9B (copyright 2026 Alibaba Cloud) y cuantizado a pesos ternarios de 1,58 bits mediante PTQ. Ternzip no modifica los pesos ni el entrenamiento: opera exclusivamente sobre la representación del checkpoint. El codificador usa la fila, la columna y la escala de bloque de cada peso para predecir las frecuencias de −1, 0 y +1; determinadas matrices emplean además recuentos de ceros dentro de bloques o coincidencias de fila con signo entre capas. El codificador de escalas predice las palabras originales de 16 bits y almacena la información suficiente para recuperar cada bit.

La innovación técnica está en el runtime: al cargar, el backend Metal construye una mezcla de trits densos y slots de dos bits, mantiene las filas del embedding de entrada respaldadas por el archivo y aplica una rotación empaquetada sin pérdidas. La convolución de cuatro taps entre canales se ejecuta durante la decodificación ordinaria de un solo token. El launcher descarga una vez el backend arm64 Metal emparejado por versión (2.552.087 bytes) y verifica su SHA-256. No se han publicado datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO para el modelo base en la información disponible.

## Capacidades

- Generación de texto autoregresiva en formato ternario, con pesos idénticos al checkpoint oficial de Prism.
- Razonamiento aritmético básico verificable (la model card cita como ejemplo "What is 17 × 6?").
- Restauración sin pérdidas del GGUF original: 427 tensores, escalas, tokenizador, metadatos y padding.
- Inferencia directa desde el archivo comprimido en Apple Silicon mediante el loader propietario.
- Verificación de integridad mediante SHA-256 tanto del archivo `.trits` como del GGUF restaurado.
- Soporte de proyector de visión y decodificación especulativa como archivos opcionales distribuidos por Prism (no incluidos en el paquete).
- Tool calling, function calling, agentes y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en portátiles Apple Silicon: el paquete de 1,8 GB más el loader permiten ejecutar un modelo de ~9B en un M4 Pro a unos 60 tokens/s, útil para asistentes locales sin GPU dedicada.
- Distribución de modelos con ancho de banda limitado: el ahorro del 8,18% frente al GGUF oficial y del 24,11% frente a PQ2_0 reduce el coste de transferencia en pipelines de despliegue masivo.
- Archivado y versionado de checkpoints: la restauración byte a byte con SHA-256 verificable permite almacenar y auditar el modelo sin riesgo de corrupción.
- Investigación sobre compresión de pesos ternarios: el codificador basado en escala de bloque y recuentos de ceros sirve como referencia para estudiar la entropía residual de formatos de 1,58 bits.
- Pruebas de equivalencia de runtimes: los 24/24 streams coincidentes con Q2_0 permiten validar implementaciones Metal alternativas contra el runtime de Prism.
- Evaluación comparativa de packings: el benchmark incluido (PTQ1_0, PQ2_0, Q2_0 y Ternzip) facilita decidir qué formato usar según prioridad de tamaño, velocidad de carga o throughput.
- Integración en flujos de CI que verifiquen artefactos de modelo: `./ternzip verify` comprueba la integridad sin escribir el GGUF en disco.

## Benchmarks y rendimiento

Datos medidos por el autor en un Apple M4 Pro, un stream greedy, ocho prompts en inglés repetidos en tres procesos frescos por configuración, hasta 256 tokens de salida, sin thinking ni especulación:

| Configuracion | Descarga (bytes) | Tokens/s (mediana) | Carga en caliente (mediana) | Bytes de pesos contados | Coincidencias vs Q2_0 |
|---|---:|---:|---:|---:|---:|
| Prism PTQ1_0 | 1.997.486.976 | 50,42 | 1,29 s | 2.053.638.719 | 24/24 |
| Prism PQ2_0 (por defecto en Mac) | 2.416.851.840 | 55,16 | 1,52 s | 2.473.006.204 | 24/24 |
| Prism Q2_0 | 2.556.640.128 | 55,09 | 1,53 s | 2.612.781.385 | referencia |
| Ternzip v0.3.0 | 1.834.157.871 | 60,12 | 17,85 s | 1.999.911.846 | 24/24 |

Comprobación adicional con el loader empaquetado en tres arranques: 59,94 tokens/s y 24/24 streams coincidentes. La tasa mediana de Ternzip está un 9,0% por encima de PQ2_0 y un 9,1% por encima de Q2_0. El ahorro de tamaño es del 24,11% frente a PQ2_0 y del 28,26% frente a Q2_0. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/espacio: 1,8 GB para el archivo `.trits`; 2,00 GB adicionales si se restaura el GGUF a disco (1.997.486.976 bytes).
- GPU recomendadas: Apple Silicon con backend Metal arm64 (medido en M4 Pro). Para otras GPU no hay datos en la información disponible.
- Consumer GPU: el tamaño de pesos (~2 GB) encaja en GPU de consumo con 4 GB o más de VRAM, pero solo el runtime Metal de Ternzip está documentado; los packings de Prism se ejecutan mediante su fork y Q2_0 también en llama.cpp b11556 o posterior.
- Opciones de despliegue: loader Ternzip v0.3.0 (restauración e inferencia directa), fork de Prism para los packings PTQ1_0/PQ2_0/Q2_0, llama.cpp b11556+ para Q2_0.
- Latencia y throughput: ~60 tokens/s en M4 Pro con decodificación de un solo token; carga en caliente de 17,85 s (frente a 1,29–1,53 s de los packings de Prism), coste atribuido al descomprimido en el arranque.
- Requisitos de software del loader: CPython 3.14 y Rust estable instalados.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano descarga | Tokens/s (M4 Pro) | Licencia |
|---|---|---:|---:|---:|---|
| Ternzip 9B | ~9B ternario | `.trits` + loader propio | 1,83 GB | 60,12 | Apache 2.0 |
| Prism Ternary Bonsai 2 9B PTQ1_0 | ~9B ternario | GGUF | 2,00 GB | 50,42 | Apache 2.0 |
| Prism Ternary Bonsai 2 9B PQ2_0 | ~9B (2 bits) | GGUF | 2,42 GB | 55,16 | Apache 2.0 |
| Prism Ternary Bonsai 2 9B Q2_0 | ~9B (2 bits) | GGUF | 2,56 GB | 55,09 | Apache 2.0 |

La comparación relevante es exclusivamente entre packings del mismo modelo, ya que Ternzip no introduce pesos distintos. Frente a alternativas de otros autores (por ejemplo modelos de ~9B en 4 bits), no hay datos de rendimiento o calidad en la información proporcionada.

## Limitaciones y advertencias

- Recompresión no oficial: Optimatech Labs modifica la distribución del archivo de Prism ML; no es un modelo validado por el autor original.
- Dependencia de un loader propietario: la inferencia directa requiere el runtime Ternzip v0.3.0 y, para este archivo, un backend Metal arm64 descargado aparte; no hay soporte documentado para CUDA, ROCm ni otras plataformas.
- Arranque lento: la carga en caliente medida es de 17,85 s frente a ~1,3–1,5 s de los packings de Prism, por el descomprimido en el inicio.
- Incompatibilidad de versión: loaders anteriores a v0.3.0 esperan 1.860.057.576 bytes (archivo v0.2.0) y fallarán con este paquete.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones de calidad o seguridad en la información disponible.
- Idiomas: no se declaran idiomas soportados; los benchmarks usan exclusivamente prompts en inglés.
- Contexto: la longitud de contexto del modelo base no está disponible en la información proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero persisten las atribuciones a Prism ML (Bonsai) y Alibaba Cloud (Qwen3.5-9B), recogidas en `NOTICE.txt` y `QWEN-LICENSE.txt`.
- Integridad: la restauración debe verificarse contra los SHA-256 publicados; cualquier discrepancia implica un archivo corrupto o un loader incorrecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/optimatechlabs/ternzip-9b
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- GGUF oficial (revisión fijada): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-PTQ1_0.gguf
- Manifiesto SHA-256 de Prism: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/SHA256SUMS
- Guía de packing de Prism: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf#choosing-a-packing
- Repositorio del loader (v0.3.0): https://github.com/Optimatech-Labs-LLC/ternzip/tree/v0.3.0
- Datos de benchmark: https://github.com/Optimatech-Labs-LLC/ternzip/blob/v0.3.0/benchmark-9b.json
