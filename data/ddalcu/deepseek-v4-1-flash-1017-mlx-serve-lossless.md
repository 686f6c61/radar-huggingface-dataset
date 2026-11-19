# ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless

## Resumen

DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless es un reempaquetado bit a bit (lossless) del modelo deepseek-ai/DeepSeek-V4.1-Flash-1017 en el formato de safetensors de MLX, publicado por el usuario ddalcu. No se trata de un modelo nuevo ni de un fine-tune con datos adicionales: es una conversión de layout que preserva exactamente los pesos originales, manteniendo los expertos enrutados en FP4 (MXFP4), el tronco en FP8 y la cabeza MTP junto con la torre de visión. El objetivo es permitir la ejecución del modelo en Apple Silicon mediante las librerías mlx-serve y oMLX.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con 92.195.449.554 parámetros totales, orientado a generación de texto y con soporte de inglés y chino. Este pack concreto está pensado para Macs con 512 GB de memoria unificada, ya que el conjunto residente ocupa unos 288 GB y las tablas Engram (leídas desde el SSD por token) suman unos 189 GB adicionales, con una descarga total de aproximadamente 477 GB. Es el pack de referencia contra el que se puntúan las versiones cuantizadas del mismo autor.

Su relevancia es práctica: ofrece una vía de ejecución local en hardware Apple para un modelo de gran escala que, de otro modo, requeriría GPUs de centro de datos. La licencia MIT facilita su uso comercial, aunque el requisito de hardware limita seriamente su adopción fuera de entornos con Macs de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (model_type: deepseek_v41), con cabeza MTP y torre de visión |
| Parametros totales | 92.195.449.554 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos originales sin recuantizar: expertos enrutados en FP4 (MXFP4), tronco en FP8, `head` y `wo_a` en bf16 denso |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (layout MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) identificado como `deepseek_v41`, con expertos enrutados (el autor menciona 384 expertos en la descripción del pack podado, de los que se conservan 192 en la variante reducida). El pack incluye además una cabeza MTP (multi-token prediction) y una torre de visión, lo que sugiere capacidades multimodales en el modelo base. Los pesos se distribuyen en precisión mixta: FP4 (MXFP4) para los expertos enrutados, FP8 para el tronco y bf16 denso para `head` y `wo_a`, que oMLX lee de esa forma.

Un componente diferencial es Engram: unas tablas de aproximadamente 189 GB que no residen en memoria y se leen desde el SSD por token. Según las mediciones del autor, mantener Engram en un disco externo penaliza el prefill en torno a un 27 %, por lo que recomienda alojar el modelo en el SSD interno del Mac. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que esta ficha describe un reempaquetado y no el entrenamiento del modelo base. Tampoco se detallan innovaciones de decodificación más allá de la presencia de la cabeza MTP.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y codificación propios del modelo base (no documentados en detalle en esta ficha).
- Procesamiento de visión gracias a la torre de visión incluida en el pack.
- Predicción multi-token mediante la cabeza MTP.
- Recuperación de conocimiento externo por token a través de las tablas Engram.
- Ejecución local en Apple Silicon mediante mlx-serve y oMLX.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac de 512 GB: el pack está diseñado para ejecutarse íntegramente en memoria unificada con `mlx-serve --model ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless --serve`, lo que permite disponer de un modelo de 92 000 millones de parámetros sin GPU dedicada.
- Referencia para evaluación de cuantizaciones: al ser bit a bit idéntico al modelo original, sirve como línea base contra la que medir la degradación de los packs iQ-MLX-3.0bpw y Pruned192-2.25bpw del mismo autor.
- Desarrollo y depuración de pipelines MLX: útil para validar la integración de modelos DeepSeek-V4.1 en mlx-serve y oMLX antes de pasar a versiones cuantizadas en máquinas con menos memoria.
- Procesamiento de documentos con componente visual: la torre de visión incluida permite tareas de comprensión de imágenes junto con texto, siempre que el hardware cumpla los requisitos de memoria.
- Experimentación con recuperación por token: las tablas Engram leídas desde SSD permiten estudiar el comportamiento y el coste de este mecanismo en un entorno controlado.
- Evaluación comparativa de precisión mixta: la combinación FP4/FP8/bf16 permite analizar el impacto de cada precisión en la calidad de salida frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente aporta una medición de rendimiento relativa: situar Engram en un disco externo cuesta aproximadamente un 27 % de prefill en sus pruebas.

## Requisitos de hardware

- Memoria: Mac con 512 GB de memoria unificada para el pack lossless. En Macs de 256 GB o 128 GB debe usarse un pack cuantizado.
- Espacio en disco: descarga de aproximadamente 477 GB; conjunto residente de unos 288 GB y tablas Engram de unos 189 GB.
- Almacenamiento: SSD interno recomendado; un disco externo para Engram penaliza el prefill alrededor de un 27 %.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, el pack es específico para MLX y Apple Silicon.
- Opciones de despliegue: mlx-serve (comando `--serve`) y oMLX, apuntando a la carpeta descargada.
- Latencia y throughput: no disponibles, salvo la penalización relativa de prefill mencionada.
- Nota del autor: no han podido cargar el pack en una máquina de 512 GB por sí mismos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Memoria requerida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (lossless) | 92,2 B | safetensors MLX (FP4/FP8/bf16) | ~288 GB residente + ~189 GB Engram | MIT | Hugging Face |
| iQ-MLX-3.0bpw (mismo autor) | no disponible | MLX cuantizado | ~209 GB residente | MIT | Hugging Face |
| iQ-MLX-Pruned192-2.25bpw (mismo autor) | no disponible (192 de 384 expertos) | MLX cuantizado y podado | ~92 GB residente | MIT | Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 92,2 B | safetensors original | no disponible | MIT | Hugging Face |

La variante podada conserva 192 de los 384 expertos y, según el autor, es más débil, especialmente en texto no inglés. No se dispone de datos de benchmarks para comparar el rendimiento entre packs.

## Limitaciones y advertencias

- El autor no ha conseguido cargar el pack en una máquina de 512 GB, por lo que la viabilidad de ejecución no está verificada de forma independiente.
- Requiere hardware muy específico (Mac con 512 GB de memoria unificada) y cerca de 477 GB de descarga, lo que restringe su uso a entornos muy concretos.
- Las tablas Engram se leen desde el SSD por token; el rendimiento depende de la velocidad del almacenamiento y se degrada con discos externos.
- Solo se documentan los idiomas inglés y chino; el rendimiento en castellano no está garantizado.
- Al ser un reempaquetado, hereda los sesgos y el riesgo de alucinación del modelo base, no documentados en esta información.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes incluidos (torre de visión, Engram).
- No hay información sobre contexto máximo, tool calling ni comportamiento en agentes, lo que dificulta planificar su uso en producción.
- El tamaño del repositorio (512,2 GB) y la memoria requerida implican costes de almacenamiento y despliegue elevados.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pack cuantizado iQ-MLX-3.0bpw: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw
- Pack podado iQ-MLX-Pruned192-2.25bpw: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-Pruned192-2.25bpw
- Aplicación MLXServe: https://mlxserve.com
