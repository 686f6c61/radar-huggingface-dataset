# Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-oMLX

## Resumen

Qwen3.8-Flash-Next-mixed-mlx-K50-oMLX es una compilación derivada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Jakevin en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una versión podada y cuantizada en precisión mixta del modelo base de Qwen, empaquetada en el formato `qwen4_exp` de safetensors para que pueda cargarse directamente con la definición de modelo incluida en oMLX, sin necesidad de un runtime personalizado. El resultado es un artefacto específicamente orientado a Apple Silicon y a la librería MLX.

El modelo conserva 91.214.343.235 parámetros totales según los safetensors del repositorio, con una arquitectura MoE (mezcla de expertos) en la que se ha eliminado el 50% de los expertos enrutados de cada capa mediante REAP (router-weighted expert activation pruning). Cada una de las 48 capas mantiene 256 de 512 expertos enrutados, incluida la capa 0, para que todas las capas compartan el mismo recuento de expertos que exige la definición estándar de oMLX.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión agresiva (poda de expertos sin reentrenamiento más cuantización mixta de 2, 3 y 4 bits) aplicada a un modelo grande; por otro, expone las limitaciones prácticas de ese enfoque, con velocidades de decodificación inferiores a 1 token por segundo en el hardware probado y sin evaluación de calidad publicada. Es un artefacto experimental, no una compilación lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con 48 capas y PLE (per-layer n-gram embedding); diseño `qwen4_exp` |
| Parametros totales | 91.214.343.235 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine con group size 64: expertos enrutados a 2, 3 o 4 bits (15 capas a 2 bits, 17 a 3 bits, 16 a 4 bits); embedding, lm_head, routers y pesos no experto a 8 bits; norms en bf16; tabla PLE en affine mixto de 2 a 6 bits |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | safetensors (layout `qwen4_exp`), librería MLX |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con 48 capas y 512 expertos enrutados por capa. Esta compilación no reentrena el modelo: aplica dos transformaciones sobre los pesos originales. La primera es una poda del 50% de los expertos enrutados por capa mediante REAP, un criterio que selecciona los expertos según su activación ponderada por el router; se conservan 256 de 512 expertos en cada capa, incluida la capa 0, que también se poda para homogeneizar el recuento entre capas. La segunda es una cuantización de precisión mixta: dentro de cada capa, todos los expertos enrutados comparten una misma anchura de bits (2, 3 o 4 bits), mientras que el embedding, el lm_head, los routers y el resto de pesos no experto se almacenan a 8 bits, y las normas en bf16. La tabla PLE (per-layer n-gram embedding) se cuantiza en affine mixto de 2 a 6 bits.

No se incluyen los pesos de MTP (multi-token prediction), por lo que el modelo debe ejecutarse con MTP desactivado y no puede aprovechar decodificación especulativa basada en MTP. El repositorio ocupa 63,3 GB en disco, repartidos en 31,0 GB de pesos del modelo y 32,3 GB de shards PLE. La carga se ha validado con oMLX 0.7.0 (que soporta `qwen4_exp` desde la 0.6.3) usando la definición `qwen4_exp` sin modificar y `strict=True`, con la variable de entorno `OMLX_QWEN4_PLE_MODE=mmap` para leer la tabla PLE desde disco en lugar de mantenerla en memoria. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de prosa en inglés: la prueba de humo incluida produce salidas coherentes en dos prompts, uno de prosa y otro de código.
- Generación de código: el prompt de prueba genera una respuesta estructurada sobre una caché LRU implementada con lista doblemente enlazada y tabla hash.
- Razonamiento con modo thinking: el prompt de ejemplo usa la plantilla de chat de Qwen con etiquetas `<think>` y `</think>`, lo que indica soporte del formato de razonamiento del modelo base.
- Formato de chat: emplea los tokens especiales `<|im_start|>` y `<|im_end|>` del tokenizador de Qwen.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el pipeline declarado es text-generation.
- Decodificación especulativa con MTP: no disponible, los pesos MTP no están incluidos.

## Casos de uso

- Experimentación con poda de expertos en Apple Silicon: el modelo sirve para estudiar el impacto de REAP al 50% sobre un MoE de 91.000 millones de parámetros, comparando salidas con el modelo base en tareas controladas. Es adecuado porque el autor documenta el criterio de poda y el layout exacto.
- Evaluación de cuantización mixta por capas: al asignar 2, 3 o 4 bits según la capa, permite medir la degradación de calidad por anchura de bits en un mismo artefacto, útil para investigación sobre compresión de MoE.
- Pruebas de integración con oMLX: el modelo está empaquetado para cargarse con la definición `qwen4_exp` incluida en oMLX 0.7.0 y `strict=True`, por lo que sirve como caso de prueba de compatibilidad del runtime en macOS.
- Generación de texto offline en un Mac de sobremesa: con 31,9 GB de pico de memoria MLX en un M4 Pro de 64 GB, puede ejecutarse localmente sin GPU dedicada, aunque a velocidades de decodificación inferiores a 1 tok/s.
- Estudio de cuellos de botella de memoria en inferencia MoE: la separación entre pesos (31,0 GB) y tabla PLE (32,3 GB) y el uso de `OMLX_QWEN4_PLE_MODE=mmap` permiten analizar el equilibrio entre memoria residente y acceso a disco.
- Reproducción de la prueba de humo del autor: los dos prompts documentados (código y prosa) con tiempos de primer token y tokens por segundo permiten validar una instalación de oMLX antes de usarla con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible; el autor indica que la evaluación de calidad está en curso. Los únicos datos medidos son de velocidad en una sola máquina (Mac mini, Apple M4 Pro, 64 GB, proceso único, límite de caché MLX de 2 GiB, decodificación greedy, 64 tokens generados):

| Prompt | Tokens de prompt | Tiempo hasta el primer token | Tokens/s de decodificación |
|---|---:|---:|---:|
| Código (primero tras la carga) | 39 | 38,4 s | 0,77 |
| Prosa en inglés | 36 | 12,6 s | 0,92 |

Pico de memoria MLX: 31,9 GB. Pico de RSS del proceso: 19,5 GB. Crecimiento de swap: 0,35 GB. El autor advierte que son ejecuciones únicas en una sola máquina y no un benchmark ajustado.

## Requisitos de hardware

- VRAM o memoria unificada: el pico medido de memoria MLX es de 31,9 GB, con un pico de RSS de 19,5 GB y 0,35 GB de swap adicional en un equipo de 64 GB. Se recomienda al menos 64 GB de memoria unificada para operar con holgura.
- GPU recomendadas: exclusivamente Apple Silicon; la prueba documentada usa un Apple M4 Pro. No hay soporte para A100, H100 ni RTX 4090, ya que el formato es MLX.
- Cabe en GPU de consumo: no aplica en el sentido habitual; requiere un Mac con Apple Silicon y memoria unificada suficiente.
- Opciones de despliegue: oMLX 0.7.0 o superior (soporte de `qwen4_exp` desde 0.6.3) con la definición de modelo incluida y `strict=True`; variable `OMLX_QWEN4_PLE_MODE=mmap` para leer la tabla PLE desde disco. La carga mediante la interfaz de servidor de la app oMLX no se ha probado.
- Latencia y throughput: 38,4 s hasta el primer token en el primer prompt tras la carga y 12,6 s en el segundo; 0,77 y 0,92 tokens/s de decodificación respectivamente. Son cifras de una sola ejecución, no de un benchmark ajustado.
- MTP: desactivado obligatoriamente, ya que no se incluyen los pesos de multi-token prediction.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-oMLX | 91.214.343.235 | no disponible | Mixta 2/3/4 bits en expertos, 8 bits en el resto | Qwen Community License 1.0 | Apple Silicon / MLX / oMLX |
| Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50 | no disponible | no disponible | Mixta, misma poda REAP al 50% | Qwen Community License 1.0 | Apple Silicon / MLX |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | Pesos originales sin poda | Qwen Community License 1.0 | Múltiple |

La diferencia principal frente al modelo base es la poda del 50% de expertos y la cuantización mixta, que reducen el tamaño a 63,3 GB en disco a costa de una pérdida de calidad no cuantificada. Frente a la variante K50 sin el sufijo oMLX, esta compilación se distingue por estar almacenada en el layout `qwen4_exp` que oMLX puede cargar con su definición incluida. No se dispone de datos de benchmarks que permitan comparar el rendimiento real entre las tres variantes.

## Limitaciones y advertencias

- Plataforma restringida: solo funciona en Apple Silicon con MLX y oMLX; no hay soporte para CUDA, ROCm ni otros runtimes.
- Poda sin reentrenamiento: se elimina el 50% de los expertos enrutados por capa, por lo que cabe esperar pérdida de calidad frente al modelo original; el autor no ha publicado todavía la evaluación de calidad.
- Sin MTP: no se incluyen los pesos de multi-token prediction, de modo que no se puede usar decodificación especulativa con MTP.
- Rendimiento muy bajo: menos de 1 token por segundo de decodificación en el hardware probado, lo que lo hace inadecuado para uso interactivo en producción.
- Datos de velocidad limitados: las cifras provienen de una sola máquina y dos prompts, no de un benchmark representativo.
- Idiomas no documentados: no se especifican los idiomas soportados, y las pruebas de humo son únicamente en inglés.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos: no documentados en la información disponible.
- Licencia: Qwen Community License 1.0. Si el modelo o un derivado se usa en un producto o servicio comercial con más de 100.000.000 de usuarios activos mensuales o 20.000.000 de dólares de ingresos mensuales, el nombre del modelo debe mostrarse de forma destacada en la interfaz del producto. Los negocios de Model-as-a-Service o de asistente de IA requieren una licencia comercial separada de Qwen.
- Carga en servidor no verificada: la carga a través de la interfaz de servidor de la app oMLX no se ha probado; solo se ha validado la carga mediante script con la definición `qwen4_exp` incluida.
- Calidad no publicada: el autor indica que la evaluación de calidad está en curso, por lo que no hay garantías documentadas sobre el comportamiento del modelo podado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-oMLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante hermana sin sufijo oMLX: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50
- Licencia del modelo (archivo LICENSE en el repositorio): https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-oMLX/blob/main/LICENSE
- oMLX (runtime de inferencia para Apple Silicon): no disponible en la información proporcionada
- Paper de REAP (router-weighted expert activation pruning): no disponible en la información proporcionada
- Repositorio de MLX: no disponible en la información proporcionada
