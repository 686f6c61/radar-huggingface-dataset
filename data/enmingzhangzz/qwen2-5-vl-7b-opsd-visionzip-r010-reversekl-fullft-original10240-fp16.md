# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-ReverseKL-FullFT-original10240-FP16

## Resumen

El modelo **Qwen2.5-VL-7B-OPSD-VisionZip-r010-ReverseKL-FullFT-original10240-FP16**, desarrollado por **enmingzhangzz**, es un fine-tuning completo (no un adaptador LoRA) sobre el modelo base **Qwen/Qwen2.5-VL-7B-Instruct**. Su objetivo principal es investigar la eficiencia en modelos de visión-lenguaje mediante la técnica **VisionZip**, que poda los tokens visuales conservando solo el 10 % de ellos. El entrenamiento utiliza un objetivo de **reverse KL** contra un teacher con EMA de tokens visuales completos, lo que lo convierte en un modelo experimental orientado a la destilación y a la evaluación de estrategias de selección de tokens visuales.

Se trata de un modelo multimodal **image-text-to-text** con **8.292.166.656 parámetros** en total, de los cuales **7.615.616.512** son entrenables (todos los parámetros del modelo de lenguaje, incluidos embeddings y LM head, con el encoder de visión congelado). Los pesos se distribuyen en formato **safetensors** con 10 shards, en **FP16**. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer con encoder de visión) |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificado |
| Tipos de cuantizacion | FP16 (pesos guardados); inferencia tambien posible en BF16; sin cuantizaciones GGUF |
| Idiomas soportados | no especificado |
| Licencia | no disponible |
| Formato de pesos | safetensors (10 shards) |

## Arquitectura y entrenamiento

La arquitectura es la original de **Qwen2.5-VL**, compuesta por un transformer decoder-only para el lenguaje y un encoder de visión congelado durante el entrenamiento. El modelo se entrena con la técnica **VisionZip** para reducir los tokens visuales a un **10 % de retención** (aproximadamente un 90 % podado), lo que reduce el coste computacional de la atención sobre la imagen.

El entrenamiento se realizó sobre una selección original de **10.240 muestras** (no un subconjunto balanceado), con **320 actualizaciones de optimizador**. Se utiliza un **batch efectivo de 32** (4 GPUs, microbatch 1 por GPU, gradiente acumulado en 8) y una **tasa de aprendizaje 2e-6** con AdamW y weight decay 0. La destilación emplea un **teacher EMA** (decay 0.9999) que ve todos los tokens visuales, mientras que el student solo ve el 10 % retenido. El objetivo es la **media de reverse KL**: KL(student || EMA teacher). La precisión de cálculo es BF16, con estado del optimizador y EMA en FP32. Los pesos se guardaron en FP16 y, según el autor, la pérdida final de entrenamiento fue aproximadamente **0.02833** (no es una métrica de evaluación).

## Capacidades

- Comprensión de imagen y texto: el modelo genera texto a partir de imágenes, heredando la capacidad multimodal del modelo base Instruct.
- Procesamiento de imagen eficiente: con VisionZip, retiene solo el 10 % de los tokens visuales, reduciendo la carga computacional de la atención sobre la imagen.
- OCR y análisis documental: el modelo base Qwen2.5-VL es compatible con tareas de lectura de texto en imágenes; este checkpoint conserva esa arquitectura, aunque su rendimiento no ha sido evaluado en el repositorio.
- Razonamiento sobre contenido visual: puede responder preguntas sobre imágenes y generar descripciones, gracias a su base instruct.
- Multilingüe: los idiomas soportados no se declaran en este repo, aunque el modelo base Qwen2.5-VL soporta múltiples idiomas.
- No se documenta explícitamente en el repositorio el soporte de tool calling, function calling, agentes o modo "thinking"; se recomienda validar esas características antes de usarlas en producción.

## Casos de uso

- Investigación en eficiencia de modelos de visión-lenguaje: este checkpoint permite estudiar de forma directa cómo afecta la poda del 90 % de tokens visuales a la generación de texto, al compararlo con el modelo base.
- Evaluación de destilación por reverse KL: la configuración con teacher EMA y tokens visuales completos sirve como referencia para analizar la transferencia de conocimiento hacia estudiantes con tokens podados.
- Punto de partida para fine-tuning adicional: al ser un modelo completo con pesos FP16, puede usarse como inicialización para nuevos entrenamientos sin necesidad de fusionar adaptadores LoRA.
- Chat multimodal asíncrono: en entornos donde la latencia de procesamiento de imagen es crítica, la poda de tokens visuales puede acelerar la inferencia (aunque no hay mediciones publicadas).
- Extracción de información en documentos: puede aplicarse a OCR y extracción de datos de facturas o PDFs, con precaución por la posible pérdida de detalle visual fino.
- Estudio de sesgos y vulnerabilidades visuales: al reducir drásticamente los tokens visuales, es un candidato para analizar cómo se manifiestan los sesgos del modelo base cuando la información visual se comprime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es la perdida final de entrenamiento (0.02833), que no es una puntuacion de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente **17 GB** solo para los pesos en FP16 (8.29B x 2 bytes). Con activaciones y contexto, se recomienda al menos **24 GB**. Con cuantización adicional (por ejemplo, 8-bit mediante bitsandbytes), la VRAM podría reducirse a unos **9-10 GB**.
- GPU recomendadas: NVIDIA **RTX 4090** (24 GB), **A100** (40 GB) o **H100** (80 GB). En GPUs de 16 GB no cabe en FP16 sin cuantizar.
- En consumer GPU: sí, en RTX 3090/4090 con FP16, o en RTX 3060 de 12 GB con cuantización 8-bit.
- Opciones de despliegue: Hugging Face Transformers (carga estándar como modelo completo), vLLM y Text Generation Inference (el repo etiqueta `endpoints_compatible`). Para reproducir la poda visual es necesario habilitar el backend oficial de VisionZip; solo cargar los pesos no aplica la retención del 10 % automáticamente.
- Latencia y throughput estimados: no disponible en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Poda visual | Tipo de pesos | Licencia |
|---|---|---|---|---|
| **Qwen2.5-VL-7B-Instruct (base)** | 8.29B | Sin poda | Modelo completo | Apache-2.0 segun documentacion |
| **Este checkpoint (Full-FT)** | 8.29B (7.62B entrenables) | 10 % retenido | Modelo completo, FP16 | No declarada |
| **Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240 (LoRA)** | 8.29B (base) | 10 % retenido | Adaptador LoRA | No declarada |

## Limitaciones y advertencias

- La poda de tokens visuales al 10 % puede degradar el rendimiento en tareas que requieren alta fidelidad visual (OCR de texto pequeño, detección de objetos finos o detalles en imágenes complejas).
- No se han publicado benchmarks; el rendimiento real del modelo en tareas estándar de visión-lenguaje es desconocido. La pérdida de entrenamiento (0.02833) no es una métrica de evaluación.
- Para reproducir la inferencia podada es necesario habilitar el backend oficial de VisionZip y la configuración de retención del 10 %; cargar simplemente los pesos no aplica la poda.
- El modelo se guardó en FP16; la inferencia en FP16 puede producir salidas ligeramente distintas a las de BF16, tal como advierte el autor.
- La licencia no está declarada en el repositorio, lo que genera incertidumbre para el uso comercial. Aunque el modelo base es Apache-2.0, este fine-tuning no especifica su licencia.
- El dataset de entrenamiento (selección original de 10.240 muestras, no balanceada) puede introducir sesgos no documentados.
- No se incluyen el estado del optimizador, el estado del EMA ni checkpoints intermedios; no es posible continuar el entrenamiento de forma exacta a partir de este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-ReverseKL-FullFT-original10240-FP16
- Variante Plain: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Plain-ReverseKL-original10240
- Variante LoRA oficial: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
