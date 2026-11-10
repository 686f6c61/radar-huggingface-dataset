# Ashlyn4202025/qwen3.8-27b-kl-iqr-nano

## Resumen

Qwen3.8-27B KL-IQR-V1-3.00 Nano class es una cuantización extrema del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Ashlyn4202025 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una compresión del modelo original de Qwen (Alibaba) mediante una técnica propietaria de cuantización basada en trellis con cuantiles intercuartílicos (IQR), orientada específicamente al motor de inferencia radiance sobre GPUs AMD RDNA4 (arquitectura gfx1201, como la Radeon AI PRO R9700).

La relevancia de esta ficha radica en su carácter de nicho: es la entrada de clase Nano (por debajo de 3 bits por peso en el plano de texto) del reto de cuantización de radiance, documentado en el PR #364 del repositorio. El resultado es un único fichero `.rad` de aproximadamente 11 GB que comprime un modelo de 27.000 millones de parámetros a 2,998 bits por peso, con activaciones en int8 y una tabla de embeddings en trellis de 2 bits.

Es importante señalar que esta publicación no incluye información sobre el modelo base (Qwen3.8-27B no aparece en la información proporcionada como modelo público verificado), ni datos de entrenamiento, benchmarks o idiomas soportados. La ficha se limita, por tanto, a documentar lo que el autor declara explícitamente en la model card y los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.8-27B; detalles no disponibles) |
| Parámetros totales | 27.000 millones (según nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según el comando de ejemplo con `--max-model-len 262144`) |
| Tipos de cuantización | Trellis IQR a 2,998 bits/peso en el plano de texto; activaciones int8 con escala por 32 columnas; cabeza de vocabulario ponderada de 3 a 6 bits con entrada de 16 bits; embeddings en tabla trellis de 2 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base Qwen/Qwen3.8-27B, del que no se dispone de detalles en la información proporcionada (número de capas, dimensión oculta, tipo de atención, composición del dataset de entrenamiento, uso de RLHF/DPO, etc.). Lo que sí está documentado es el proceso de cuantización: los pesos se representan mediante un trellis con cuantiles intercuartílicos calculados (IQR), con anchos de paso de un cuarto de paso y, en su mayoría, 2^20 estados, organizados en losas de filas (*row slabs*). Las activaciones se cuantizan a int8 con una escala por cada 32 columnas y se procesan en dos pasadas. La cabeza de salida usa ponderación por vocabulario con clases de 3 a 6 bits e entrada de 16 bits, y la tabla de embeddings se comprime con un trellis de 2 bits.

El proceso completo está descrito, según el autor, en `docs/QC-QWEN38-KL.md` de la rama `qc/qwen38-kl-guided-iqr` del repositorio de radiance, y la receta concreta se encuentra en `data/recipes/q38-27b-kl-nano.recipe`. No se documentan innovaciones de entrenamiento (decodificación especulativa, atención lineal, etc.) más allá de la propia técnica de compresión. El contenedor `.rad` requiere una compilación específica de radiance desde esa rama para gfx1201; las versiones estándar (incluida la 1.17.0) no pueden leerlo porque carecen de las formas de 2^20 estados, los cuartos de paso, las losas de filas y las formas de activación empleadas.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no se detallan en la información disponible.
- Código y matemáticas: no se documenta explícitamente en la model card; se asume que conserva las capacidades del base, sin confirmación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas aparece vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Inferencia de contexto largo: el comando de ejemplo configura `--max-model-len 262144`, lo que sugiere soporte de hasta 262.144 tokens en el motor radiance, condicionado a la memoria disponible.
- Ejecución en AMD RDNA4: capacidad específica de este contenedor, que solo funciona con el motor radiance compilado para gfx1201.

## Casos de uso

- Despliegue de un modelo de 27B en GPUs de consumo AMD RDNA4: gracias a la compresión a ~3 bits/peso y a un fichero de ~11 GB, es posible ejecutar un modelo de 27.000 millones de parámetros en tarjetas como la Radeon AI PRO R9700, donde un modelo en bf16 no cabría. Se usaría con el comando documentado y `--tp 2` para repartir la carga entre dos GPUs.
- Investigación en cuantización extrema: el contenedor sirve como referencia reproducible para estudiar el impacto de trellis IQR a 2,998 bits/peso frente a cuantizaciones GPTQ o AWQ convencionales, comparando calidad y perplejidad sobre el mismo modelo base.
- Procesamiento de documentos largos: con una ventana configurada de 262.144 tokens, el modelo puede ingerir contratos, informes o bases de código extensas en una sola pasada, siempre que la VRAM lo permita.
- Evaluación de motores de inferencia alternativos: útil para equipos que comparan radiance frente a vLLM, llama.cpp o TGI en hardware AMD, ya que este fichero solo es legible por radiance y permite medir throughput y latencia en ese stack.
- Reproducción de experimentos del reto de cuantización: el PR #364 y la receta incluida permiten replicar el proceso de compresión y ajustar parámetros (anchos de paso, estados del trellis) para explorar la frontera calidad/tamaño.
- Prototipado local sin conexión: al ser un único fichero de 11 GB con licencia Apache 2.0, puede distribuirse en entornos aislados para pruebas de generación de texto donde no se requiera la máxima fidelidad del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 11,0 GB en disco; en ejecución hay que sumar la caché KV en bf16 (`--kv-cache-dtype bf16`) y las activaciones int8. Para 262.144 tokens de contexto la caché KV crece de forma considerable, por lo que se recomienda reservar bastante más que los 11 GB del fichero.
- GPU recomendadas: AMD RDNA4 con soporte gfx1201, en particular la Radeon AI PRO R9700. El comando de ejemplo usa `--tp 2`, lo que implica dos GPUs para repartir el modelo.
- Compatibilidad con GPU de consumo: no se documenta; el requisito es una GPU RDNA4 (gfx1201), no una NVIDIA. No hay información sobre funcionamiento en RTX 4090, A100 o H100, y en principio no sería posible sin el motor radiance y el soporte de arquitectura correspondiente.
- Opciones de despliegue: exclusivamente radiance, compilado desde la rama `qc/qwen38-kl-guided-iqr` de Perire. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.rad` y las formas de cuantización son propietarios.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor |
|---|---|---|---|---|---|
| Qwen3.8-27B KL-IQR-V1-3.00 Nano (este) | 27B | 262.144 (configurable) | Trellis IQR ~3 bits/peso, activaciones int8 | Apache 2.0 | radiance (rama específica) |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | bf16/fp16 original | no disponible en la información | Cualquiera compatible con transformers |
| Cuantizaciones GPTQ/AWQ típicas de modelos 27B | 27B | depende del base | 4-8 bits | depende del base | vLLM, TGI, llama.cpp |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- El contenedor solo es legible por una compilación no estándar de radiance desde una rama concreta; las versiones publicadas (incluida la 1.17.0) no lo soportan. Esto limita gravemente su portabilidad y su uso en producción.
- Requiere hardware AMD RDNA4 (gfx1201); no hay soporte documentado para NVIDIA ni para GPUs AMD anteriores.
- La cuantización a 2,998 bits/peso introduce pérdida de calidad respecto al modelo base; no se han publicado métricas que cuantifiquen esa degradación.
- No se documentan sesgos conocidos, pero al desconocerse la composición del dataset del modelo base, no es posible evaluar sesgos de género, etnia o idioma.
- Riesgo de alucinación: inherente a los modelos generativos; la compresión extrema puede agravarlo, aunque no hay datos que lo confirmen.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingüe equilibrado.
- La licencia Apache 2.0 permite uso comercial, pero el requisito de un motor y una rama específicos puede condicionar la viabilidad legal y técnica en entornos productivos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo base Qwen3.8-27B no está verificado en la información disponible; conviene tratar la publicación con cautela.
- El tamaño del repo (11,0 GB) y la ventana de contexto de 262.144 tokens exigen planificación de memoria; configurar el contexto máximo sin VRAM suficiente provocará fallos de asignación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ashlyn4202025/qwen3.8-27b-kl-iqr-nano
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Pull request del reto de cuantización: https://codeberg.org/StillDeadcode/radiance/pulls/364
- Rama con el soporte necesario: https://codeberg.org/Perire/radiance/src/branch/qc/qwen38-kl-guided-iqr
