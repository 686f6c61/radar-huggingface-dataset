# huginnfork/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated

## Resumen

Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated es una variante "abliterated" (con reducción deliberada de rechazos) del modelo Qwen3.8-Flash-Next, publicada por el usuario huginnfork. El modelo parte de la cuantización NVFP4 + MXFP8 realizada por local-inference-lab (QAD, quantization-aware distillation) sobre el checkpoint oficial Qwen/Qwen3.8-Flash-Next, y sobre esa base cuantizada se aplica una edición de dirección de rechazo en el espacio residual y una codificación CSF (compressed scale format) de los planos de escala de los expertos enrutados. El resultado es un contenedor de aproximadamente 96.637 millones de parámetros con arquitectura MoE (mezcla de expertos) y capacidad multimodal image-text-to-text, distribuido en safetensors con un tamaño de repositorio de 278,1 GB.

La relevancia técnica del modelo reside en dos aspectos. Primero, demuestra una metodología de abliteración aplicada directamente sobre la rejilla de cuantización, sin descomprimir ni recuantizar, preservando nombres, dtypes y formas de todos los tensores. Segundo, introduce una revisión v2 que corrige el fallo de la v1: la dirección de rechazo es específica del régimen (thinking on frente a thinking off), con un ángulo medido entre ambas direcciones de 67,4-76,7 grados, de modo que una edición de rango 1 solo elimina en torno al 4 % de la dirección del otro régimen. La v2 aplica una proyección de rango 2 en la capa 42 que cubre el span de ambas direcciones.

El modelo está pensado para investigadores que necesitan evaluar comportamiento sin rechazos en tareas de razonamiento y contexto largo, y para quienes estudian técnicas de edición de pesos sobre modelos cuantizados. La licencia es qwen-community-1.0, lo que impone condiciones específicas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal híbrida y módulo MTP (multi-token prediction); incluye expertos compartidos y proyecciones PLE |
| Parámetros totales | 96.637.001.693 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se valida recuperación en contexto largo, sin cifra publicada) |
| Tipos de cuantización | NVFP4 (expertos enrutados), MXFP8 (expertos compartidos, proyecciones de atención), BF16 (embeddings, PLE, MTP); codificación CSF de planos de escala |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | safetensors (contenedor NVIDIA-ModelOpt mixed precision) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con atención lineal en determinadas capas (`linear_attn.out_proj`) y atención estándar en otras (`self_attn.o_proj`), además de un módulo MTP (multi-token prediction) con sus propias proyecciones de expertos. La cuantización de origen es QAD (quantization-aware distillation) NVFP4 para los expertos enrutados y MXFP8 para expertos compartidos y proyecciones de atención, con embeddings, tabla PLE y MTP en BF16. Sobre esta base, el autor aplica una codificación CSF que comprime los planos de escala de bloque de los expertos enrutados, preservando íntegramente el resto de tensores.

El entrenamiento original del modelo base no está documentado en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO: no disponible). La innovación destacable es la metodología de abliteración: se capturan dos direcciones de rechazo en la capa 42, una por régimen (thinking on y thinking off), cada una biproyectada contra su propia media de respuestas inocuas, y se elimina el span de ambas con una proyección de rango 2 aplicada con alpha = 1.0. La edición se realiza in situ sobre la rejilla cuantizada mediante un recuantizador restringido que busca códigos que aproximen el peso editado y mantengan la restricción dentro de un presupuesto de ±1 ULP. Se editaron 25.188 tensores: 24.576 NVFP4 de expertos enrutados `down_proj`, 512 NVFP4 en MTP, 48 MXFP8 de expertos compartidos, 36 MXFP8 de atención lineal, 12 MXFP8 de atención estándar y 4 BF16 (embeddings, PLE y dos MTP). No se editó ninguna escala, router, `gate_proj`, `up_proj`, `q/k/v_proj`, tensor de visión ni `lm_head`.

## Capacidades

- Generación de texto y razonamiento multimodal image-text-to-text (pipeline declarado en Hugging Face).
- Razonamiento con modo thinking activable y desactivable, con comportamiento de rechazo corregido en ambos regímenes en la revisión v2.
- Recuperación en contexto largo: validado con el perfil `estonia` (30/30 aciertos en n=30).
- Razonamiento científico y de dominio: GPQA-diamond con 166/198 aciertos en modo thinking off.
- Decodificación especulativa mediante módulo MTP integrado, con aceptación de borrador mediana del 59,5 %.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión: el pipeline es image-text-to-text y existen tensores de visión, aunque no se detallan capacidades específicas.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo varía la dirección de rechazo entre regímenes de thinking y evaluar técnicas de abliteración de rango 2 frente a rango 1, con métricas de fuga residual publicadas (4,63e-05 en NVFP4, 7,49e-07 en MXFP8).
- Evaluación de cuantización QAD en producción: sirve para medir la degradación de capacidad entre un modelo BF16 y su versión NVFP4/MXFP8, con datos pareados de GPQA (164/198 frente a 166/198, p = 0,8506) y de recuperación en contexto largo.
- Despliegue de inferencia multimodal de gran tamaño: al ser un contenedor safetensors de 96,6 mil millones de parámetros en precisión mixta, encaja en infraestructuras con GPUs de centro de datos para tareas de image-text-to-text.
- Generación asistida con decodificación especulativa: el módulo MTP integrado permite acelerar la generación en servidores de inferencia que exploten el borrador interno, con una tasa de aceptación mediana del 59,5 %.
- Estudio de compresión sin pérdida de escalas: la codificación CSF de los planos de escala de los expertos enrutados permite analizar el ahorro de almacenamiento manteniendo nombres, dtypes y formas, útil para pipelines de distribución de modelos.
- Evaluación de robustez en contexto largo: el perfil `estonia` con 30/30 aciertos y cero respuestas erróneas o truncadas sirve como banco de pruebas para sistemas de recuperación documental de contexto extenso.
- Análisis de seguridad y filtrado de contenido: al ser un modelo de rechazo reducido, es adecuado para estudiar mecanismos de moderación externos y para pruebas de robustez de guardarraíles en pipelines propios.

## Benchmarks y rendimiento

| Benchmark | Modelo padre | Este modelo |
|---|---|---|
| `lavd`, n=30 | 30/30 | 30/30 (28 exactos, 2 cercanos) |
| `estonia` recuperación en contexto largo, n=30 | 30/30 | 30/30 |
| GPQA-diamond, n=198, thinking off | 164/198 | 166/198 (Δ +1,01 pp, McNemar p = 0,8506) |
| Aceptación de borrador MTP, mediana | 61,0 % | 59,5 % |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible. Los datos de GPQA están emparejados sobre los mismos 198 ítems, con 13 ítems acertados solo por el padre y 15 solo por este modelo. La aceptación MTP se midió sobre 312 y 337 muestras, con IQR de 55,8-66,3 % frente a 53,2-64,7 %.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 278,1 GB en safetensors; la inferencia requiere al menos esa cantidad de memoria agregada, distribuida entre varias GPU o en un nodo con memoria unificada.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, se requiere un nodo multi-GPU de centro de datos (A100, H100, H200 o equivalentes). No cabe en una GPU de consumo individual.
- Cabe en consumer GPU: no, con 96,6 mil millones de parámetros y 278,1 GB de pesos.
- Opciones de despliegue: no disponibles en la información proporcionada; el formato es safetensors con cuantización NVFP4/MXFP8, lo que condiciona los motores compatibles (no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles. La única métrica de rendimiento publicada es la aceptación de borrador MTP (mediana 59,5 %), que el autor presenta como comprobación de corrección y no como afirmación de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (v2) | 96.637.001.693 | no disponible | NVFP4 + MXFP8 + BF16, CSF | qwen-community-1.0 | Abliteración rango 2, GPQA 166/198 |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 | qwen-community-1.0 | Modelo de referencia, GPQA 164/198 |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | NVFP4 + MXFP8 | no disponible | Cuantización QAD de origen, sin abliterar |
| Versión v1 de este repositorio | 96.637.001.693 | no disponible | NVFP4 + MXFP8 + BF16, CSF | qwen-community-1.0 | Abliteración rango 1; falla con thinking on (14,0 % de rechazos) |

## Limitaciones y advertencias

- Modelo de rechazo reducido de forma deliberada: el autor advierte explícitamente que se debe leer la sección de seguridad antes de desplegarlo. No es adecuado para aplicaciones que dependan de filtros de contenido internos.
- La abliteración introduce un error de peso medio del 5,618 % de la norma de W (×1,48 respecto a la v1), con fuga residual de 4,63e-05 en NVFP4, 7,49e-07 en MXFP8 y 2,31e-03 en BF16.
- El error de la rejilla FP4 actúa como suelo del solver: más pasadas convergen, un presupuesto de 2× ULP no mejora el resultado y cinco ordenaciones de filas distintas abarcan 4,87-5,00e-05.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Longitud de contexto: no publicada, aunque se valida recuperación en contexto largo con el perfil `estonia`.
- Licencia qwen-community-1.0: impone condiciones específicas para uso comercial que deben revisarse antes de producción; la model card la etiqueta como "other".
- El repositorio no es un espejo de Local Inference Lab: los bytes comprimidos se codificaron a partir de pesos propios, pero el formato CSF y la cuantización NVFP4/MXFP8 son de terceros.
- La aceptación MTP medida (59,5 %) no debe interpretarse como una garantía de throughput, ya que las proyecciones MTP están editadas y la medición es una comprobación de corrección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huginnfork/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated
- Modelo base de la cuantización: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de Qwen: no disponible
- Paper: no disponible
- Blog o demo: no disponible
