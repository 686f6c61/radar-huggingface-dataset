# mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ4h-mtp

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ4h-mtp es una cuantización mixta en formato MLX del checkpoint Qwen3.5-9B, publicada por la organización mlx-community. El nombre comercial del repositorio es engañoso: mezcla referencias a DeepSeek-V4-Pro y a Qwen3.5-9B, pero los pesos reales declarados en safetensors suman 3.793.825.520 parámetros (3,79 mil millones), no 9 mil millones. El modelo está pensado para ejecutarse en Apple Silicon mediante la librería MLX.

La pieza técnica central es el esquema de cuantización oQ (oMLX v0.8.0), una cuantización de precisión mixta que asigna distintos anchos de bit por tensor: bloques en affine 4-bit, 5-bit y 6-bit con grupo 64, junto con capas conservadas en BF16 y tensores en U32. El resultado es un peso medio efectivo de 13,759 bits por parámetro y un repositorio de 6,5 GB, lo que permite cargar el modelo en memoria unificada de equipos Apple de gama alta.

El checkpoint incluye, además del modelo de lenguaje (3,095B parámetros lógicos), un codificador visual (0,456B) y una cabeza MTP (0,243B), lo que sugiere capacidades multimodales y decodificación especulativa multi-token. La etiqueta "UNCENSORED-heretic" indica que se trata de un ajuste sin alineamiento de seguridad, algo relevante para quien evalúe su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con cabeza MTP y torre de visión (según desglose de pesos); detalles internos no disponibles |
| Parametros totales | 3.793.825.520 (3,79B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 4-bit grupo 64, affine 5-bit grupo 64, affine 6-bit grupo 64, BF16 y U32; media efectiva 13,759 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, cuantización oQ) |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 3,095B | 5,419 GB / 5,047 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,194 GB / 0,181 GiB |
| Total | 3,794B | 6,525 GB / 6,077 GiB |

Distribución por formato de almacenamiento:

| Formato | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 1,156B | 30,458% | 0,605 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,071B | 1,879% | 0,046 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 1,017B | 26,810% | 0,770 GiB | 6,50 |
| BF16 | 0,600B | 15,816% | 1,118 GiB | 16,00 |
| U32 | 0,950B | 25,037% | 3,538 GiB | 32,00 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del desglose de pesos. Se trata de un transformer (etiqueta `qwen3_5`) con tres bloques diferenciados: un modelo de lenguaje de 3,095B parámetros lógicos, un módulo de visión de 0,456B y una cabeza MTP (multi-token prediction) de 0,243B. La presencia de la cabeza MTP apunta a decodificación especulativa multi-token, técnica que permite proponer varios tokens por paso y verificar en paralelo para acelerar la generación.

No se dispone de datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si hubo etapas de RLHF o DPO. La etiqueta "UNCENSORED-heretic" sugiere un ajuste orientado a eliminar rechazos de seguridad, pero no se documenta el método empleado. La cuantización oQ aplicada por oMLX v0.8.0 asigna mayor precisión (6-bit) a 1,017B parámetros y mantiene 0,600B en BF16, lo que indica que ciertas capas se consideraron sensibles a la cuantización agresiva. La actualización del 19 de noviembre de 2026 indica una recuantización con oMLX v0.8.0, por lo que versiones anteriores del repositorio deben descartarse.

## Capacidades

- Generación de texto y razonamiento: el modelo de lenguaje de 3,095B parámetros lógicos soporta tareas de generación y razonamiento, aunque no se documentan evaluaciones específicas.
- Procesamiento visual: la torre de visión de 0,456B parámetros indica capacidad multimodal de entrada de imágenes, aunque no se detalla el tipo de tareas (VQA, OCR, captioning).
- Decodificación especulativa: la cabeza MTP de 0,243B parámetros permite multi-token prediction, lo que puede reducir la latencia de generación en MLX.
- Sin alineamiento de seguridad: la etiqueta "UNCENSORED-heretic" implica que el modelo no aplica rechazos ante peticiones sensibles, lo que afecta a su comportamiento en dominios regulados.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 6,5 GB permiten cargar el modelo en memoria unificada de un Mac con 16 GB o más, útil para prototipado offline sin GPU dedicada.
- Experimentación con cuantización mixta: el esquema oQ con mezcla de 4, 5, 6 bits, BF16 y U32 sirve como caso de estudio para evaluar el impacto de la precisión mixta en calidad frente a cuantizaciones uniformes.
- Investigación sobre decodificación especulativa: la cabeza MTP integrada permite medir la ganancia de throughput de multi-token prediction en MLX frente a decodificación autoregresiva estándar.
- Evaluación de modelos sin alineamiento: útil en investigación de seguridad para analizar el comportamiento de un checkpoint "uncensored" y comparar tasas de rechazo con variantes alineadas.
- Prototipos multimodales en local: la torre de visión de 0,456B permite probar pipelines de imagen-texto en un equipo de sobremesa Apple sin depender de APIs externas.
- Pruebas de despliegue MLX en CI: el repositorio puede integrarse en pipelines de validación que verifiquen la carga de safetensors cuantizados y la coherencia de los metadatos de cuantización.
- Docencia y demostraciones: el tamaño contenido y el formato MLX facilitan demostraciones en aula sobre cuantización, precisión mixta y arquitecturas con cabeza MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 6,5 GB en disco; la carga en memoria requiere al menos 6,1 GiB para los pesos, más overhead de activaciones y caché KV, por lo que se recomienda un mínimo de 10-12 GB de memoria unificada.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4 y posteriores). No es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple con 16 GB o más de memoria unificada. No aplica a GPU NVIDIA de consumo sin conversión previa del formato.
- Opciones de despliegue: MLX y oMLX (librería de cuantización). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato es específico de MLX.
- Latencia y throughput: no disponibles. La cabeza MTP podría mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ4h-mtp | 3,79B | no disponible | MLX safetensors (oQ mixta) | no disponible | Hugging Face (mlx-community) |
| Checkpoint original Qwen3.5-9B | no disponible (el nombre sugiere 9B, no confirmado) | no disponible | no disponible | no disponible | no disponible en la información |
| Otras cuantizaciones MLX de la familia Qwen3.5 | no disponible | no disponible | MLX | no disponible | no disponible en la información |

No se dispone de datos suficientes para una comparativa rigurosa con alternativas concretas. El dato más relevante es la discrepancia entre el nombre del repositorio (9B) y los parámetros reales declarados en safetensors (3,79B), que debe tenerse en cuenta al comparar con otros checkpoints.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica "9B" pero los safetensors declaran 3,79B parámetros totales; conviene verificar el checkpoint original antes de asumir capacidades.
- Sin alineamiento de seguridad: la etiqueta "UNCENSORED-heretic" implica ausencia de rechazos ante contenido sensible; no apto para aplicaciones de cara al usuario sin filtros adicionales.
- Licencia no declarada: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido. Verificar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: no se documenta qué lenguas soporta ni su calidad relativa.
- Contexto desconocido: no se publica la longitud de ventana, lo que limita la planificación de casos de uso con documentos largos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; en un modelo de 3,79B sin datos de benchmarks, la tasa de alucinación es incierta.
- Formato específico: la cuantización oQ y el formato MLX limitan la portabilidad; no se puede ejecutar directamente en CUDA sin conversión.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del checkpoint.
- Actualización reciente: la recuantización con oMLX v0.8.0 del 19 de noviembre de 2026 invalida copias anteriores; usar siempre la versión más reciente.
- Sesgos: no documentados, pero al derivar de un checkpoint "uncensored" es probable que los sesgos del modelo base se amplifiquen al eliminar capas de rechazo.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ4h-mtp
- Repositorio oMLX (oQ): https://github.com/jundot/omlx
