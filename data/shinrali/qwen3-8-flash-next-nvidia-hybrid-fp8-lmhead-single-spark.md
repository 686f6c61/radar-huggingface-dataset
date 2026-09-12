# Shinrali/Qwen3.8-Flash-Next-NVIDIA-Hybrid-FP8-LMHead-Single-Spark

## Resumen

Shinrali/Qwen3.8-Flash-Next-NVIDIA-Hybrid-FP8-LMHead-Single-Spark es un checkpoint experimental derivado del híbrido Qwen3.8-Flash-Next preparado por el usuario Shinrali para ejecutarse en una única estación NVIDIA DGX Spark. Sobre un checkpoint ya cuantizado con expertos enrutados en NVFP4, este derivado convierte únicamente la matriz final `lm_head.weight`, de dimensiones 248320 x 2560, de BF16 a FP8 E4M3 con bloques de 128x128. El objetivo declarado es reducir el coste de ancho de banda de la proyección final sin degradar la calidad migrando a un modelo objetivo INT3.

El modelo conserva la arquitectura híbrida del padre (expertos enrutados tipo MoE, 300 lineales laterales GDN/QSA y de expertos compartidos, predicción multi-token para decodificación especulativa) y suma aproximadamente 118.434 millones de parámetros totales en formato safetensors, con un repositorio de 128,6 GB. Su relevancia es doble: por un lado demuestra que la cabeza de salida de un modelo de ~118B puede cuantizarse a FP8 manteniendo el rendimiento en una suite privada; por otro, es un caso práctico de despliegue de un modelo de gran tamaño en hardware de una sola máquina con 128 GB de memoria unificada.

La contrapartida es que no se trata de un artefacto listo para producción: no se ha publicado información sobre idiomas soportados ni sobre parámetros activos, no hay benchmarks oficiales (solo una regresión privada del autor) y stock vLLM no carga el checkpoint sin parches y una imagen Docker personalizada. El repositorio acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida derivada de Qwen3.8-Flash-Next: expertos enrutados (MoE) con lineales laterales GDN/QSA y estado recurrente; incluye cabezas MTP para decodificación especulativa |
| Parametros totales | 118.434.281.107 (aprox. 118,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 500.000 tokens con YaRN en el perfil de servicio medido por el autor (ventana nativa no disponible) |
| Tipos de cuantizacion | NVFP4 W4A4 (expertos enrutados principales y expertos MTP); FP8 E4M3 blockwise 128x128 (`lm_head` principal); FP8 E4M3 blockwise (300 lineales laterales GDN/QSA y de expertos compartidos); FP8 E4M3 (tabla PLE/n-gram en mmap sobre NVMe); BF16 (cabeza draft MTP reducida de 65.536 filas, KV y estado recurrente). Etiqueta de repositorio: 8-bit |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (`license: other`), sujeta además a los términos aplicables de la Qwen Community License |
| Formato de pesos | safetensors (repositorio de 128,6 GB, librería declarada vllm) |
| Vocabulario de salida | 248.320 tokens (`lm_head` 248320 x 2560) |
| Hardware objetivo | Una única NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) |
| Modalidad | image-text-to-text (entrada de imagen y texto, salida de texto) |

## Arquitectura y entrenamiento

El checkpoint parte del híbrido de Shinrali construido sobre la pila NVIDIA de Qwen3.8-Flash-Next. La disposición de precisión combina cuatro regímenes: los expertos enrutados principales en NVFP4 W4A4, 300 lineales laterales GDN/QSA y de expertos compartidos en FP8 E4M3 blockwise, la tabla PLE/n-gram en FP8 E4M3 con mmap sobre NVMe en tiempo de ejecución, y estado KV y recurrente validado en BF16. Los expertos enrutados del módulo MTP provienen de un donante NVFP4 de Inferact, mientras que la cabeza draft reducida de vocabulario (65.536 filas) se mantiene en BF16 porque el proponente personalizado ejecuta un `F.linear` plano. Cada token propuesto por el MTP sigue verificándose contra el modelo objetivo.

La única modificación respecto al padre es la conversión de la matriz `lm_head.weight` completa a FP8 E4M3 con escalas por bloques de 128x128, realizada localmente sin ajuste fino y sin modificar el checkpoint de origen. El autor reporta un error máximo absoluto de reconstrucción de 0,01929586 relativo al valor absoluto máximo del tensor original. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO: se trata de una conversión de precisión sobre un modelo ya entrenado, no de un reentrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text` (acepta imagen además de texto).
- Razonamiento, matemáticas y conocimiento general: la suite privada del autor puntúa GSM8K en 46-47 de 48 y MMLU en 82-85 de 96 en tres ejecuciones a temperatura cero.
- Seguimiento de instrucciones: 7 de 8 en la categoría Instruction de la suite privada.
- Llamada a herramientas (tool calling): 4 de 4 en la categoría Tools de la suite privada; el autor no documenta el formato exacto de llamada.
- Recuperación de información (retrieval): 6 de 6 en la suite privada.
- Decodificación especulativa con predicción multi-token (MTP) y verificación contra el modelo objetivo, con una aceptación ponderada del 32,77% en las mediciones publicadas.
- Servicio con contexto largo (500.000 tokens con YaRN) y caché de prefijos activada en el perfil medido.
- Capacidades multilingües: no disponible (la información proporcionada no declara idiomas).

## Casos de uso

- Análisis de documentación extensa en contexto único: con 500.000 tokens de ventana configurados con YaRN, el modelo puede ingerir expedientes completos, contratos largos o bases de código enteras sin trocear el material en un pipeline de recuperación, y responder con referencias cruzadas dentro del mismo contexto.
- Procesamiento de documentos escaneados con visión: al aceptar entrada de imagen y texto, resulta adecuado para OCR semántico, extracción estructurada de tablas en facturas o digitalización de formularios, combinando la lectura de la imagen con razonamiento sobre el contenido extraído.
- Agentes con razonamiento multi-paso: el soporte de llamada a herramientas (4/4 en la suite del autor) permite construir agentes que consulten APIs, ejecuten cálculos y encadenen pasos, con la decodificación MTP reduciendo el coste por token generado.
- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno sobre contexto largo (historial de incidencias, documentación de producto) en una única máquina, sin enviar datos a servicios externos.
- Despliegue con requisitos de privacidad: al caber en una DGX Spark con 128 GB de memoria unificada, es viable en entornos sanitarios, legales o financieros donde los datos no pueden salir de la infraestructura propia.
- Investigación en cuantización y decodificación especulativa: sirve como banco de pruebas reproducible para medir el efecto de convertir una `lm_head` a FP8 blockwise y para ajustar proponentes MTP con vocabulario reducido, ya que el autor publica conversor, parches y Dockerfiles.
- Evaluación comparativa de precisión mixta: útil para equipos que necesitan decidir entre NVFP4, FP8 y BF16 en distintas partes de un modelo grande, usando las mediciones de prefill y decode a 8K y 100K como referencia.
- Generación aumentada por recuperación sobre corpus internos: la puntuación perfecta en la categoría Retrieval de la suite privada sugiere buen comportamiento al responder preguntas fundamentadas en pasajes recuperados, siempre que se valide con los prompts de producción.

## Benchmarks y rendimiento

El autor publica dos conjuntos de datos. El primero es una suite de regresión privada (no es un benchmark oficial de Qwen ni de NVIDIA), con tres ejecuciones a temperatura cero:

| Ejecucion | Total | GSM8K | MMLU | Instruction | Tools | Retrieval |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 147/162 | 47/48 | 83/96 | 7/8 | 4/4 | 6/6 |
| 2 | 146/162 | 47/48 | 82/96 | 7/8 | 4/4 | 6/6 |
| 3 | 148/162 | 46/48 | 85/96 | 7/8 | 4/4 | 6/6 |

El padre con `lm_head` en BF16 obtuvo 144, 146 y 148 en la misma suite. Entre los dos conjuntos de tres ejecuciones, 141 casos pasaron siempre y 11 fallaron siempre. El autor no observa regresión direccional, pero advierte que estas mediciones no demuestran equivalencia.

El segundo conjunto son medidas de velocidad en una DGX Spark (GB10, 128 GB de memoria unificada), con MTP 3, top-k QSA determinista, KV y estado recurrente en BF16, contexto YaRN de 500.000 tokens, caché de prefijos activada y 512 tokens generados por ejecución:

| Perfil | Prefill 8K (tok/s) | Decode 8K (tok/s) | Prefill 100K (tok/s) | Decode 100K (tok/s) |
|---|---:|---:|---:|---:|
| Padre con `lm_head` BF16 | 2303,64 | 24,77 | 2129,24 | 25,92 |
| Este checkpoint con `lm_head` FP8 | 2233,42 | 27,34 | 2141,79 | 28,11 |

Las tres ejecuciones a 100K midieron 2140,69/28,46, 2143,12/26,62 y 2141,57/29,25 tok/s de prefill/decode. La aceptación ponderada del MTP fue del 32,77% y el tiempo medio extremo a extremo, de 65,08 segundos. El autor advierte que la primera ejecución formal a 8K incluía trabajo de JIT del runtime y que su media debe interpretarse de forma conservadora. El motor perfiló 18,85 GiB de KV en BF16 para 688.622 tokens, y el autor no reclama que el ahorro teórico de 606 MiB en disco y pesos se traduzca siempre en capacidad KV adicional.

No se han publicado resultados de benchmarks oficiales (MMLU, HumanEval, GSM8K estándar) en la información disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 128,6 GB en safetensors, más la tabla PLE/n-gram que se mapea desde NVMe en tiempo de ejecución.
- Memoria: el perfil validado es una única DGX Spark con GB10 y 128 GB de memoria unificada. El autor indica que el estado de la memoria del host afecta al dimensionado automático de KV, por lo que no garantiza capacidad KV adicional por el ahorro de pesos.
- Cabe en GPU de consumo: no. Un modelo de ~118,4 mil millones de parámetros en precisión mixta no entra en una RTX 4090 (24 GB) ni en tarjetas de 48 GB sin offloading agresivo, que el autor no documenta.
- GPUs recomendadas: GB10 (DGX Spark) es el objetivo declarado y el único perfil medido. No se han publicado medidas para A100, H100, H200 ni B200 en la información disponible.
- Motores de despliegue: vLLM es la librería declarada, pero stock vLLM todavía no carga el checkpoint. Se requiere construir la imagen experimental desde el repositorio GitHub del autor (`Dockerfile.nvidia-hybrid`, `Dockerfile.nvidia-nvfp4mtp`, `Dockerfile.fp8-lm-head`), que incluye el cargador de escalas compañeras para `ParallelLMHead` en FP8 y el cableado del modelo Qwen3.8.
- Variables de entorno obligatorias al servir: `VLLM_MTP_DRAFT_VOCAB=/opt/llm/draft_vocab_65536.npy` y `VLLM_MTP_DRAFT_HEAD=/model/mtp_draft_head_65536.safetensors`. El autor advierte que no debe usarse `VLLM_MTP_DRAFT_HEAD` sin la lista fija de 65.536 identificadores de token.
- Latencia y throughput medidos: prefill de 2233,42 tok/s a 8K y 2141,79 tok/s a 100K; decode de 27,34 tok/s a 8K y 28,11 tok/s a 100K. No hay datos de latencia por petición ni de concurrencia más allá de las 512 tokens generados por ejecución.
- Otras opciones (llama.cpp, Ollama, TGI): no disponible. El formato NVFP4/FP8 blockwise y la necesidad de parches específicos hacen improbable su uso fuera de vLLM sin conversión adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de la cabeza de salida | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (FP8 LMHead) | 118.434.281.107 | 500.000 tokens con YaRN (perfil medido) | FP8 E4M3 blockwise 128x128 | Decode 27,34 tok/s (8K) y 28,11 tok/s (100K) en DGX Spark | nvidia-open-model-license + términos Qwen Community | Repositorio HuggingFace, 0 descargas, requiere build propio |
| Shinrali/Qwen3.8-Flash-Next-NVIDIA-Hybrid-Single-Spark (padre) | no disponible | 500.000 tokens con YaRN (perfil medido) | BF16 | Decode 24,77 tok/s (8K) y 25,92 tok/s (100K); 144-148/162 en la suite privada | no disponible en la información proporcionada | Repositorio HuggingFace |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | NVFP4 en expertos enrutados | no disponible | no disponible en la información proporcionada | Repositorio HuggingFace de NVIDIA |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | BF16 (modelo de referencia) | no disponible | Qwen Community License | Repositorio HuggingFace de Qwen |

La comparación cuantitativa solo es posible frente al padre, ya que es el único para el que se publican parámetros, throughput y puntuaciones en la misma suite. Frente a los checkpoints NVFP4 y BF16 de NVIDIA y Qwen no hay datos de rendimiento comparables en la información disponible.

## Limitaciones y advertencias

- Carácter experimental: el propio autor lo describe como un derivado experimental de un solo DGX Spark, no como un artefacto listo para producción.
- Dependencia de parches: stock vLLM no carga este checkpoint. Sin la imagen Docker y los parches del repositorio de GitHub, el modelo no es utilizable; cualquier actualización de vLLM puede romper la compatibilidad.
- Configuración frágil del MTP: usar `VLLM_MTP_DRAFT_HEAD` sin la lista fija de 65.536 identificadores de token es incorrecto según el autor.
- Sin datos de idiomas: no se declara qué idiomas soporta el modelo ni su calidad relativa, un vacío relevante para despliegues en castellano.
- Sin benchmarks oficiales: las únicas cifras de calidad provienen de una suite privada de 162 casos con tres ejecuciones, un tamaño insuficiente para caracterizar el modelo. El autor admite que sus mediciones no prueban equivalencia con el padre en BF16.
- Error de cuantización: la conversión de la `lm_head` introduce un error máximo absoluto de reconstrucción de 0,01929586 respecto al máximo del tensor original. El impacto sobre la distribución de probabilidades de salida no se documenta.
- Riesgo de alucinación: no se publican tasas de alucinación ni evaluaciones de veracidad. Un modelo de 118B con vocabulario de 248.320 tokens en una suite de recuperación de 6 casos no permite extraer conclusiones al respecto.
- Rendimiento de decode bajo: 27-28 tok/s por secuencia en la DGX Spark limita casos de uso interactivos de alta concurrencia; no se publican datos de throughput agregado con múltiples peticiones simultáneas.
- Restricciones de licencia: se distribuye bajo la NVIDIA Open Model License y queda sujeta a los términos aplicables de la Qwen Community License. El autor recomienda revisar las licencias del padre de NVIDIA y del donante Inferact antes de redistribuir o desplegar, lo que implica obligaciones adicionales que deben verificarse antes de un uso comercial.
- Procedencia comunitaria: es una integración independiente, no oficial de NVIDIA, Qwen, Inferact ni vLLM.
- Trazabilidad baja: 0 descargas y 0 "likes" en el momento de la consulta, sin revisión externa conocida ni resultados reproducidos por terceros.
- Capacidad KV: el ahorro de 606 MiB en disco y pesos no se traduce necesariamente en más capacidad KV, según el propio autor, porque el dimensionado automático depende del estado de la memoria del host.
- Entradas multimodales: aunque el pipeline declarado es `image-text-to-text`, el autor recomienda validar prompts de producción, conversaciones largas, llamadas a herramientas y entradas multimodales antes de sustituir un despliegue orientado a calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shinrali/Qwen3.8-Flash-Next-NVIDIA-Hybrid-FP8-LMHead-Single-Spark
- Checkpoint padre: https://huggingface.co/Shinrali/Qwen3.8-Flash-Next-NVIDIA-Hybrid-Single-Spark
- Checkpoint de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Donante NVFP4 para el MTP: https://huggingface.co/Inferact/Qwen3.8-Flash-Next-NVFP4
- Repositorio con conversor, parches, Dockerfiles y notas de validación: https://github.com/shinrali/Qwen3.8-Flash-Next-NVIDIA-Hybrid-Single-Spark
- Base del runtime para un solo Spark: https://github.com/blazux/qwen3.8-Flash-DGX
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Búsqueda web: no se han encontrado artículos, papers ni demos adicionales sobre este modelo; los resultados devueltos no guardaban relación con el checkpoint.
