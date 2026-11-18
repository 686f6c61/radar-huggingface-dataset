# geonmin-kim/gr00t_mla100_part1_gpu_mxq_libero_object

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo al uso, sino un paquete de artefactos de compilación del modelo robótico **GR00T N1.7** de NVIDIA, especializado en la variante **LIBERO-object**. Lo publica el usuario `geonmin-kim` como parte de una guía de integración (`xpu-vla-for-mla100`) para ejecutar modelos visión-lenguaje-acción (VLA) sobre aceleradores NPU de Mobilint, en concreto el chip **MLA100 (Aries)**. El paquete recoge la salida de la fase 1 del flujo de trabajo: la compilación en GPU (RTX 3090, sm_86) de los cuatro bloques del modelo a formato MXQ, propietario de Mobilint.

El contenido es un archivo tar de 17,8 GB que incluye los binarios MXQ de los bloques `vision`, `language`, `encode` y `denoise_step`, junto con datos de calibración, salidas de referencia y registros de compilación. No incluye pesos en formato estándar (safetensors o GGUF) ni código de inferencia; es material intermedio destinado a ser descomprimido y verificado en un servidor MLA100 mediante los scripts proporcionados en el repositorio de la guía.

Su relevancia es acotada y muy específica: sirve a quienes replican el despliegue de GR00T N1.7 sobre hardware MLA100 y necesitan un conjunto de artefactos de partida. El propio autor advierte de que **no está verificado en MLA100** (el manifiesto marca `verified: false` en los cuatro bloques), por lo que debe considerarse material de trabajo, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo VLA (visión-lenguaje-acción) GR00T N1.7; cuatro bloques compilados: vision, language, encode, denoise_step |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXQ (formato propietario de Mobilint); opciones de bits en `mxq_libero/` |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (heredada del checkpoint `nvidia/GR00T-N1.7-LIBERO`) |
| Formato de pesos | MXQ (bloques compilados) + `.npy` de rotación; no incluye safetensors ni GGUF |
| Tamano del repositorio | 17,8 GB (tar de 17.834.854.400 B) |
| Modelo base | `nvidia/GR00T-N1.7-LIBERO` @ `2ea293aa20ba7cf5bbf3ba17a5fbcb1a01cbfe21`, subconjunto `libero_object/` |
| Compilador | qbcompiler 1.4.1, `--device gpu`, target `aries-rb`, core mode `single` |
| Entorno de compilacion | RTX 3090 24 GB, driver 580.178.04, Python 3.10.22, torch 2.7.1+cu128 |
| Calibracion | vision 640, language 320, encode 320, denoise_step 1.280 muestras |

## Arquitectura y entrenamiento

El modelo subyacente es GR00T N1.7 de NVIDIA, un modelo fundacional para robótica de tipo VLA que combina percepción visual, comprensión del lenguaje y generación de acciones motoras. La variante `LIBERO-object` está ajustada para el benchmark LIBERO en su tarea de manipulación de objetos. La información disponible no detalla la arquitectura interna del modelo base (número de parámetros, composición del dataset de entrenamiento, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card original de NVIDIA.

Lo que sí documenta este repositorio es el proceso de compilación: el modelo se descompone en cuatro bloques funcionales (`vision`, `language`, `encode`, `denoise_step`) que se cuantizan por separado a MXQ mediante qbcompiler. La calibración se realizó con 320 observaciones de política (10 tareas × 32, semilla 1000) y un conjunto de muestras por bloque. Los informes de error de cuantización registran el SQNR resultante de la compilación en GPU frente a la referencia en CPU: vision 14,3 / 18,6 dB; language 45,3 / 45,1 dB; encode 24,8 / 26,1 dB; denoise_step 39,6 / 39,6 dB. El bloque de visión es el que presenta mayor degradación en la compilación GPU y, según el autor, la precisión real debe juzgarse mediante la verificación en MLA100 (coseno por bloque) y la comparación de acciones.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural (control de política VLA).
- Percepción visual mediante el bloque `vision`, compilado a MXQ.
- Comprensión de instrucciones en lenguaje natural mediante el bloque `language`.
- Codificación y paso de denoising separados (`encode`, `denoise_step`) para la generación de trayectorias de acción.
- Ejecución sobre acelerador NPU MLA100 (Aries) una vez completada la fase 2 de descompresión y verificación.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- **Replicación del flujo de despliegue en MLA100**: el paquete es la entrada directa de la fase 2 (`scripts/part2_unpack.sh`); sirve a equipos que siguen la guía `xpu-vla-for-mla100` para poner en marcha GR00T N1.7 sobre hardware Mobilint sin recompilar desde cero.
- **Verificación de cuantización en NPU**: los datos de calibración y las salidas de referencia de `build/libero_object/` permiten ejecutar `--stage verify` y comparar el comportamiento del modelo compilado contra la referencia, midiendo la pérdida de precisión por bloque.
- **Evaluación de la tarea LIBERO-object**: las 320 observaciones de política (10 tareas × 32, semilla 1000) permiten reproducir la comparación de acciones y estimar la tasa de éxito de la política en el benchmark.
- **Investigación en compilación de modelos VLA**: los registros de compilación y los informes de error de cuantización (SQNR por bloque) sirven para estudiar el impacto de la compilación GPU frente a CPU en modelos de robótica.
- **Punto de partida para ajustes de calibración**: al estar el conjunto sin verificar, es útil para iterar sobre parámetros de calibración (número de muestras por bloque) y comparar resultados con el conjunto verificado del mismo autor.
- **Integración en pipelines de robótica simulada**: el modelo base LIBERO-object está pensado para entornos de simulación de manipulación; este paquete facilita llevar esa política a un acelerador NPU para pruebas de latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento son los valores de SQNR del informe de error de cuantización del compilador (una muestra de calibración), que no constituyen una evaluación de precisión de la política:

| Bloque | SQNR compilación GPU (dB) | SQNR referencia CPU (dB) |
|---|---:|---:|
| vision | 14,3 | 18,6 |
| language | 45,3 | 45,1 |
| encode | 24,8 | 26,1 |
| denoise_step | 39,6 | 39,6 |

## Requisitos de hardware

- **Compilación (fase 1)**: RTX 3090 de 24 GB, driver 580.178.04, Python 3.10.22, torch 2.7.1+cu128. El autor no documenta requisitos para otras GPU, aunque cualquier GPU con soporte CUDA y memoria suficiente para el modelo base debería poder ejecutar la compilación.
- **Ejecución (fase 2)**: servidor con acelerador NPU MLA100 (Aries) de Mobilint; es el destino previsto de los artefactos MXQ.
- **Almacenamiento**: al menos 17,8 GB para el tar, más el espacio descomprimido (los bloques MXQ ocupan 2,68 GB y los datos de referencia 15,08 GB).
- **Despliegue**: el flujo se apoya en los scripts del repositorio `nota-github/xpu-vla-for-mla100` (rama `gr00t-n17-mla100-guide`, commit `0876723`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Hardware destino | Verificado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (`gr00t_mla100_part1_gpu_mxq_libero_object`) | MXQ (4 bloques) | MLA100 (Aries), compilado en RTX 3090 | No (`verified: false`) | NVIDIA Open Model License | Hugging Face, 0 descargas |
| `geonmin-kim/gr00t_mla100_verified_mxq_libero_object` | MXQ verificado | MLA100 (Aries) | Sí, según el autor | NVIDIA Open Model License | Hugging Face |
| `nvidia/GR00T-N1.7-LIBERO` (modelo base) | Pesos originales de NVIDIA | GPU NVIDIA | No aplica | NVIDIA Open Model License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Sin verificar en MLA100**: el manifiesto marca `verified: false` en los cuatro bloques; el autor indica explícitamente que debe ejecutarse `scripts/part2_verify.sh` antes de usar el paquete.
- **Pérdida de precisión en visión**: el SQNR del bloque `vision` cae de 18,6 dB (CPU) a 14,3 dB (GPU), la mayor degradación entre los cuatro bloques; puede afectar a la calidad de la política.
- **No es un modelo autónomo**: contiene artefactos de compilación y datos de calibración, no pesos en formato estándar ni código de inferencia; no puede cargarse directamente con frameworks convencionales.
- **Licencia restrictiva**: hereda la NVIDIA Open Model License del checkpoint fuente, con posibles restricciones para uso comercial; debe revisarse antes de cualquier despliegue en producción.
- **Idiomas no documentados**: no se especifica qué lenguas soporta el bloque de lenguaje.
- **Sesgos y alucinación**: no hay información sobre sesgos del modelo base en esta ficha; al tratarse de un modelo de robótica, los riesgos se refieren a errores de política (acciones incorrectas) más que a alucinación textual.
- **Madurez**: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (18 de noviembre de 2026), lo que sugiere un artefacto de trabajo sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/geonmin-kim/gr00t_mla100_part1_gpu_mxq_libero_object
- Conjunto verificado del mismo autor: https://huggingface.co/geonmin-kim/gr00t_mla100_verified_mxq_libero_object
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-LIBERO
- Guía de integración: repositorio `nota-github/xpu-vla-for-mla100`, rama `gr00t-n17-mla100-guide`, commit `0876723` (no se proporciona URL directa en la información disponible)
