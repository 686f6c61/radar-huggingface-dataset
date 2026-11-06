# longlenai-team/Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF

## Resumen

Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF es una versión cuantizada en formato GGUF del modelo DeepSeek-V4-Flash de DeepSeek, publicada por el equipo longlenai-team (con créditos a antirez y huihui.ai en la model card). Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 284.334.567.511 parámetros totales, derivado del modelo base deepseek-ai/DeepSeek-V4-Flash mediante un proceso de "abliteration", una técnica que reduce o elimina los mecanismos de rechazo y filtrado de seguridad del modelo original.

El modelo resuelve el problema de ejecutar un modelo de gran escala en hardware de consumo o en estaciones de trabajo con memoria unificada, ofreciendo cuantizaciones agresivas de 2 y 4 bits (IQ2_XXS, Q2_K, Q4_K) optimizadas específicamente para los motores de inferencia DS4 (antirez/ds4) y llama.cpp. Incluye además un fichero MTP opcional de 3,6 GiB para decodificación especulativa.

Su relevancia actual radica en que permite desplegar un modelo de casi 285.000 millones de parámetros en máquinas con 128 GB de RAM (versión Q2) o 256 GB (versión Q4), incluyendo Apple Silicon con Metal y GPUs NVIDIA como la RTX 6000 Pro o el DGX Spark. La licencia es MIT, aunque la model card advierte explícitamente de que el filtrado de seguridad ha sido reducido de forma significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer |
| Parametros totales | 284.334.567.511 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configuración de servidor de ejemplo en DS4) |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q4_K (expertos enrutados); Q8_0 en proyecciones de atención, expertos compartidos y salida; F16 en router, embeddings, indexer, compressor y HC; F32 en norms, sinks y bias |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash emplea una arquitectura Mixture-of-Experts, tal como indican las etiquetas del repositorio (`moe`, `mixture-of-experts`). La cuantización diferencia entre los expertos enrutados (`ffn_{gate,up,down}_exps`), que se comprimen a 2 o 4 bits, y el resto de componentes, que mantienen mayor precisión: proyecciones de atención, expertos compartidos y capa de salida en Q8_0; router, embeddings, indexer, compressor y HC en F16; y normas, sinks y bias en F32. Esta estrategia de cuantización mixta preserva la calidad de los componentes críticos para el enrutamiento y la atención mientras reduce drásticamente el peso de los expertos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La modificación respecto al modelo base consiste en una abliteration, que altera los pesos para suprimir el comportamiento de rechazo. El repositorio incluye un fichero MTP (Multi-Token Prediction) opcional de 3,6 GiB que habilita decodificación especulativa, lo que constituye la innovación técnica más destacable del paquete junto con los parches de aceleración para DS4: sustitución de TCP loopback por Unix Domain Sockets (UDS) en inferencia multi-GPU con reparto de capas, y un parche de tensor-parallel para un solo proceso con soporte de GPUs de consumo.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline `conversational` declarado en el repositorio.
- Razonamiento y generación de código: la model card indica que la versión Q2 "debería ir bien para escribir código" pese a su tasa de rechazo residual.
- Decodificación especulativa mediante el fichero MTP opcional, que acelera la generación al predecir varios tokens por paso.
- Inferencia multi-GPU con reparto de capas (layer splitting) y tensor-parallel, soportado tanto en DS4 como en el fork de llama.cpp con CUDA.
- Ejecución en Apple Silicon mediante Metal, y en NVIDIA CUDA (RTX 6000 Pro, DGX Spark probados).
- Caché KV en disco (`--kv-disk-dir`, `--kv-disk-space-mb`) para gestionar contextos largos con memoria limitada.
- Comportamiento sin censura: el proceso de abliteration reduce los rechazos del modelo original, si bien la versión Q2 conserva "cierta tasa de rechazo" según el autor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un MoE de gran escala tras eliminar el filtrado, comparando respuestas con el modelo base DeepSeek-V4-Flash en entornos controlados y con revisión humana.
- Generación de código en local: con la versión Q2 en una máquina de 128 GB, un equipo puede ejecutar un modelo de 284.000 millones de parámetros para autocompletado y refactorización sin depender de APIs externas, usando llama.cpp o DS4 con el fichero MTP para reducir latencia.
- Despliegue en estaciones de trabajo Apple: las versiones Q2 (74,7-92,8 GiB) caben en MacBook y Mac Studio con 96 GB o más de memoria unificada mediante Metal, lo que permite prototipar asistentes conversacionales en hardware de sobremesa.
- Servicio de inferencia con contexto largo: el servidor DS4 admite `--ctx 131072` y caché KV en disco de 32 GB, adecuado para procesar documentos extensos, análisis de repositorios completos o conversaciones de muchas vueltas sin truncar.
- Procesamiento por lotes en clústeres pequeños: el soporte multi-GPU con UDS y tensor-parallel permite repartir el modelo entre varias GPUs de consumo, útil para pipelines de generación de datos sintéticos o etiquetado a escala.
- Experimentación con decodificación especulativa: el fichero MTP de 3,6 GiB permite medir ganancias de throughput en distintos motores y configuraciones de hardware, un caso de interés para quienes investigan optimización de inferencia.
- Evaluación de cuantizaciones extremas: los ficheros IQ2_XXS, Q2_K y Q4_K permiten estudiar la degradación de calidad de un MoE a 2 bits frente a 4 bits en tareas concretas como código o matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado es empírico: en un entorno Windows con WSL2, Ubuntu 24.04, RTX 6000 Pro (96 GB) y CUDA 13.0, la inferencia con DS4 alcanza más de 35 tokens por segundo. No se han probado otros hardware ni el entorno Apple según el autor.

## Requisitos de hardware

- VRAM/RAM estimada según fichero: Q2 mixto 80,8 GiB; IQ2_XXS 74,7 GiB; Q2_K 92,8 GiB; Q4_K 153 GiB. El fichero MTP añade 3,6 GiB.
- Recomendación del autor: Q2 en máquinas Mac de 128 GB; Q4 en máquinas con 256 GB de RAM o más.
- GPUs probadas: RTX 6000 Pro (96 GB) con CUDA 13.0. Soportados según la model card: DGX Spark y GPUs NVIDIA CUDA en general mediante el fork Fringe210/llama.cpp-deepseek-v4-flash-cuda; Apple Silicon con Metal (MacBook de 96 GB, Mac Studio).
- GPU de consumo: no hay confirmación de funcionamiento en RTX 4090 u otras GPUs de 24 GB; el tamaño mínimo de fichero (74,7 GiB) excede la VRAM de cualquier GPU de consumo individual, por lo que requiere reparto multi-GPU o memoria unificada.
- Opciones de despliegue: DS4 (antirez/ds4) en CLI y modo servidor; llama.cpp mediante el fork con soporte CUDA y multi-GPU; parches de aceleración UDS y tensor-parallel en huihui-support/ds4.
- Throughput: más de 35 tokens/s en RTX 6000 Pro con DS4 según el autor; latencia no disponible para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF | 284,3 B (MoE) | 131.072 tokens (config. DS4) | GGUF 2/4 bits + Q8_0/F16/F32 mixto | MIT | Hugging Face, 0 descargas |
| deepseek-ai/DeepSeek-V4-Flash (base) | 284,3 B (MoE) | no disponible | safetensors (BF16) | no disponible en la información | Hugging Face |
| antirez/deepseek-v4-gguf (DeepSeek-V4-Flash-IQ2XXS) | 284,3 B (MoE) | no disponible | GGUF IQ2_XXS + Q2_K + Q8 | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de modelos comparables de otros fabricantes en la información proporcionada, por lo que no es posible establecer comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la abliteration suprime los rechazos, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado; el autor recomienda revisión manual y uso en entornos controlados.
- No apto para producción directa ni aplicaciones públicas según la propia model card; se aconseja uso experimental o de investigación.
- Tasa de rechazo residual en la versión Q2, que el autor califica de aceptable para código pero en fase de pruebas para otros usos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser una cuantización de 2 bits en los expertos, es esperable degradación adicional respecto al modelo base, aunque no se cuantifica.
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe.
- Compatibilidad limitada de motores: los ficheros están pensados para DS4 y llama.cpp; el fichero MTP requiere un loader específico y puede no funcionar en otros motores.
- Hardware poco validado: solo se ha probado la RTX 6000 Pro con CUDA; el entorno Apple no fue testeado por el autor.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero las advertencias de la model card trasladan al usuario toda la responsabilidad legal y ética sobre las salidas generadas.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longlenai-team/Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Motor DS4: https://github.com/antirez/ds4
- Fork de llama.cpp con CUDA para DeepSeek-V4-Flash: https://github.com/Fringe210/llama.cpp-deepseek-v4-flash-cuda
- Parche UDS para DS4: https://github.com/huihui-support/ds4/tree/uds
- Parche tensor-parallel para DS4: https://github.com/huihui-support/ds4/tree/tp
- GGUF de referencia de antirez: https://huggingface.co/antirez/deepseek-v4-gguf/tree/main
- Cuenta de soporte del autor: https://x.com/support_huihui
