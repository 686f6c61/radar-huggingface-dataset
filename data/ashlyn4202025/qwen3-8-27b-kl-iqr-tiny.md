# Ashlyn4202025/qwen3.8-27b-kl-iqr-tiny

## Resumen
Qwen3.8-27B-kl-iqr-tiny es una cuantización extrema del modelo Qwen/Qwen3.8-27B, publicada por el usuario Ashlyn4202025. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales de Qwen a un contenedor propietario `.rad` de 3,998 bits por peso (clase "Tiny", entre 3 y 4 bits) sobre el plano de texto, con activaciones en int8. El objetivo es ejecutar un modelo de 27.000 millones de parámetros en tarjetas AMD RDNA4 (gfx1201, como la Radeon AI PRO R9700) mediante el motor de inferencia radiance, reduciendo drásticamente los requisitos de memoria frente a los pesos en bf16.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización poco habitual (trellis con estados de 2^20, anchos de cuarto de paso y slabs por filas, guiados por criterios KL/IQR) aplicada a un modelo grande. Por otro, evidencia las limitaciones prácticas del artefacto: requiere una rama específica del motor radiance, no funciona con las versiones estables publicadas y no es compatible con ecosistemas convencionales como llama.cpp, vLLM o transformers. El repositorio tiene 14,4 GB y, en el momento de la consulta, cero descargas y cero likes.

La información disponible es escasa: no hay model card con datos de entrenamiento, benchmarks, idiomas ni pipeline declarado. Todo lo que se indica a continuación proviene de los metadatos de Hugging Face y del README del autor, y los campos no cubiertos se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen/Qwen3.8-27B; la cuantización no altera la arquitectura, pero no se detalla en la información) |
| Parámetros totales | 27 000 millones (según el nombre del modelo base, Qwen3.8-27B) |
| Parámetros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 262 144 tokens (valor usado en el comando de ejemplo con `--max-model-len 262144`) |
| Tipos de cuantización | 3,9980 bits por peso en el plano de texto (trellis IQR, anchos de cuarto de paso, mayoritariamente 2^20 estados, slabs por filas); activaciones int8 con una escala por cada 128 columnas y dos pasadas; cabeza con clases de 3 a 6 bits y entrada de 16 bits; embedding en tabla trellis de 3 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor `.rad` (archivo `qwen3.8-27b-kl-tiny.rad`), exclusivo del motor radiance |

## Arquitectura y entrenamiento
No hay información sobre la arquitectura interna del modelo base en los datos proporcionados. El nombre Qwen3.8-27B sugiere un transformer de la familia Qwen con 27.000 millones de parámetros, pero no se confirma en la model card. Tampoco se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable está en el proceso de cuantización, no en el entrenamiento. Según el README, los pesos se representan con un trellis calculado mediante IQR (rango intercuartílico), con anchos de cuarto de paso y mayoritariamente 2^20 estados, organizados en slabs por filas. Las activaciones se cuantizan a int8 con una escala por cada 128 columnas y se procesan en dos pasadas. La cabeza de salida usa ponderación por vocabulario con clases de 3 a 6 bits y entrada de 16 bits, y el embedding se comprime con una tabla trellis de 3 bits. El resultado son 3,9980 bits por peso sobre el plano de texto. El proceso está documentado en `docs/QC-QWEN38-KL.md` y la receta en `data/recipes/q38-27b-kl-tiny.recipe`, ambos en la rama `qc/qwen38-kl-guided-iqr` del repositorio de radiance.

## Capacidades
- Generación de texto: hereda las capacidades del modelo base Qwen3.8-27B, aunque no se detallan en la información disponible.
- Razonamiento y matemáticas: no confirmado explícitamente; depende del modelo base, del que no se aportan datos.
- Generación de código: no confirmado explícitamente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en los metadatos).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución en hardware AMD RDNA4: capacidad operativa del artefacto, no del modelo; requiere el motor radiance con la rama específica.
- Contexto largo: el comando de ejemplo configura 262 144 tokens de longitud máxima, lo que sugiere soporte para ventanas de contexto muy amplias si el modelo base lo permite.

## Casos de uso
- Evaluación de cuantizaciones extremas en AMD: el artefacto sirve para medir la pérdida de calidad de un modelo de 27B comprimido a 3,998 bits por peso en GPUs RDNA4, comparando las salidas con el modelo base en bf16. Es adecuado porque el contenedor `.rad` está diseñado específicamente para ese hardware y ese motor.
- Investigación en técnicas de cuantización trellis: permite reproducir el pipeline KL-IQR descrito en `docs/QC-QWEN38-KL.md` y la receta `q38-27b-kl-tiny.recipe`, validando los estados de 2^20 y los anchos de cuarto de paso sobre un modelo de 27B.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: con 14,4 GB de repositorio y pesos de ~4 bits, el modelo puede residir en la memoria de una o dos tarjetas RDNA4 de gama profesional, usando `--tp 2` para tensor parallelism según el ejemplo del README.
- Procesamiento de documentos largos: la configuración de ejemplo admite 262 144 tokens de contexto, útil para analizar contratos, informes o bases de código extensas en una sola pasada, siempre que la calidad tras la cuantización sea aceptable.
- Pruebas de integración del motor radiance: el modelo actúa como caso de prueba del contenedor `.rad`, verificando la lectura de formas de 2^20 estados, slabs por filas y formas de activación que no soportan las versiones estables 1.17.0 y anteriores.
- Benchmarking de throughput en gfx1201: con `--max-num-seqs 16` y KV cache en bf16, se puede medir la latencia y el rendimiento de decodificación en RDNA4 para cargas de inferencia por lotes moderados.
- Docencia y experimentación con licencia permisiva: al ser Apache 2.0, se puede usar en entornos académicos para ilustrar el impacto de la compresión de pesos en modelos grandes, sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: con 3,998 bits por peso sobre 27.000 millones de parámetros, los pesos ocupan aproximadamente 13,5 GB (27e9 × 3,998 / 8). A ello hay que sumar la KV cache en bf16 para 262 144 tokens, que puede ser muy voluminosa y depende de la configuración de cabezas y capas del modelo base (no disponible). El tamaño del repositorio es de 14,4 GB, coherente con la estimación de pesos.
- GPU recomendadas: AMD RDNA4 gfx1201, en particular la Radeon AI PRO R9700 según el README. El ejemplo usa `--tp 2`, lo que implica dos tarjetas para repartir el modelo y la KV cache.
- ¿Cabe en GPU de consumo? No hay información sobre compatibilidad con GPUs de consumo. El motor radiance y el contenedor `.rad` están orientados a RDNA4 profesional; no se mencionan modelos como RX 9070 ni soporte para otras arquitecturas.
- Opciones de despliegue: exclusivamente el motor radiance, compilado desde la rama `Perire/radiance` `qc/qwen38-kl-guided-iqr` para gfx1201. Las versiones estables, incluida la 1.17.0, no leen este contenedor. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El README solo indica los parámetros de ejecución (`--tp 2`, `--kv-cache-dtype bf16`, `--tp-wire exact`, `--max-model-len 262144`, `--max-num-seqs 16`), sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ashlyn4202025/qwen3.8-27b-kl-iqr-tiny | 27 000 M | 262 144 tokens (config. de ejemplo) | 3,998 bits/peso, contenedor `.rad` | Apache 2.0 | Solo radiance en RDNA4 (rama específica) |
| Qwen/Qwen3.8-27B (modelo base) | 27 000 M | No disponible | bf16/fp16 original | No disponible en la información | Ecosistema estándar (transformers, vLLM, etc., presumiblemente) |
| Cuantizaciones GGUF/AWQ/GPTQ típicas de modelos 27B | 27 000 M | Depende del modelo base | 4-8 bits, formatos estándar | Depende del modelo base | llama.cpp, vLLM, TGI, Ollama |

La comparativa se limita a estos tres referentes porque no se han proporcionado datos de benchmarks ni de otros modelos cuantizados comparables. La diferencia principal frente al modelo base y a las cuantizaciones estándar es el formato propietario y la dependencia de un motor y una arquitectura de GPU concretos.

## Limitaciones y advertencias
- Compatibilidad restringida: el contenedor `.rad` solo lo lee la rama `qc/qwen38-kl-guided-iqr` de radiance compilada para gfx1201. Las versiones estables, incluida la 1.17.0, no lo soportan, lo que impide usarlo con herramientas convencionales.
- Hardware limitado: está pensado para AMD RDNA4 (Radeon AI PRO R9700). No hay información sobre funcionamiento en NVIDIA, ROCm en otras arquitecturas ni GPUs de consumo.
- Pérdida de calidad por cuantización: 3,998 bits por peso es una compresión agresiva; no se han publicado evaluaciones que cuantifiquen la degradación respecto al modelo base, por lo que el riesgo de respuestas degradadas o incoherentes es real y no medido.
- Sesgos conocidos: no disponibles. Al no documentarse el entrenamiento del modelo base ni evaluaciones de sesgo, no se puede valorar este aspecto.
- Riesgo de alucinación: no evaluado en la información disponible; es esperable que la cuantización extrema incremente la probabilidad de errores factuales, pero no hay datos que lo confirmen.
- Idiomas: el campo de idiomas está vacío en los metadatos, por lo que se desconoce el soporte multilingüe real tras la cuantización.
- Contexto: aunque el ejemplo configura 262 144 tokens, no se confirma que el modelo base soporte esa ventana ni que la calidad se mantenga en longitudes extremas; la KV cache en bf16 a esa longitud puede exceder la memoria disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen puede tener condiciones adicionales que no se detallan en la información proporcionada; conviene verificar la licencia del modelo original antes de un despliegue en producción.
- Madurez: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día (10 de noviembre de 2026), sin pipeline declarado; es un artefacto experimental sin validación comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/Ashlyn4202025/qwen3.8-27b-kl-iqr-tiny
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Pull request de la quant challenge: https://codeberg.org/StillDeadcode/radiance/pulls/364
- Rama con el soporte necesario: https://codeberg.org/Perire/radiance/src/branch/qc/qwen38-kl-guided-iqr
- Documentación del proceso (referenciada en el README): `docs/QC-QWEN38-KL.md` en la rama anterior
- Receta de cuantización (referenciada en el README): `data/recipes/q38-27b-kl-tiny.recipe` en la rama anterior
