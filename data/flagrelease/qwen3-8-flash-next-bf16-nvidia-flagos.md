# FlagRelease/Qwen3.8-Flash-Next-BF16-nvidia-FlagOS

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de arquitectura Mixture-of-Experts (MoE) desarrollado por Alibaba y publicado en abierto el 26 de agosto de 2026. FlagRelease distribuye en este repositorio una adaptación empaquetada del modelo original en precisión BF16, con pesos en formato safetensors y un total de 179.999.981.459 parámetros, pensada para su despliegue sobre hardware NVIDIA mediante la pila de software unificada FlagOS.

El repositorio no contiene un modelo nuevo entrenado por FlagRelease, sino una build de referencia del modelo de Alibaba validada sobre ocho aceleradores distintos (T-Head, NVIDIA, Moore Threads, Ascend, MetaX, Kunlunxin, Hygon e Iluvatar CoreX). La variante aquí descrita es la de NVIDIA, con scripts de inferencia listos para usar, una imagen de contenedor FlagOS-Nvidia y validación de consistencia frente a la pila nativa del fabricante.

Su relevancia inmediata es doble: por un lado, ofrece una vía de despliegue reproducible de un MoE multimodal de gran escala (180.000 millones de parámetros totales) con contexto efectivo de servicio de 102.400 tokens; por otro, demuestra que el modelo puede ejecutarse sobre stacks alternativos con una degradación de precisión medida y acotada, lo que interesa a equipos que necesitan portabilidad de hardware sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, familia `qwen4_exp` |
| Parametros totales | 179.999.981.459 (aproximadamente 180.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 102.400 tokens configurados en el servidor de referencia (`--max-model-len 102400`) |
| Tipos de cuantizacion | BF16 (única precisión publicada en este repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 360,0 GB |
| Modalidades de entrada | texto e imagen (soporte multimodal; límite de 16 imágenes por prompt en la configuración de referencia) |
| Pipeline declarado | no disponible |
| Descargas / likes | 46 / 0 |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo MoE multimodal de tipo transformer, con un total de 180.000 millones de parámetros y capacidad de procesar imágenes junto a texto: el servidor de referencia habilita `--limit-mm-per-prompt "{\"image\":16}"` y un modo de paralelismo específico para el codificador multimodal (`--mm-encoder-tp-mode data`). El tag `qwen4_exp` sugiere una generación experimental de la familia Qwen, y la variable de entorno `QWEN4_QSA_FUSED_COMPRESS=1` apunta a un mecanismo de compresión o atención con fusión propia de esta arquitectura. No se detalla en la información proporcionada el número de expertos, el ratio de activación ni el reparto de parámetros activos por token.

Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o aprendizaje por refuerzo con verificación. Lo que sí documenta el repositorio es el trabajo de adaptación de FlagOS: adaptación multi-chip, alineamiento de precisión y validación de despliegue sobre ocho plataformas de aceleradores, con una primera tanda uniforme en BF16. La innovación destacable, por tanto, es de infraestructura más que de modelado: una capa de traducción de operadores (`FLAGGEMS_ATEN_PLAN_CACHE`, `USE_FLAGGEMS=1`, lista negra de operadores no soportados) que permite ejecutar el modelo sobre vLLM con backend MoE en Triton y grafos CUDA completos.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de hasta 102.400 tokens.
- Procesamiento de imágenes: el modelo acepta entradas visuales (hasta 16 por prompt en la configuración publicada) además de texto.
- Razonamiento de tipo científico y de sentido común, evidenciado por la evaluación en GPQA Diamond y MuSR.
- Comprensión multilingüe limitada a chino e inglés.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`), lo que habilita integración directa con clientes estándar.
- Ejecución en paralelo de tensor con 8 GPUs y backend de ejecución multiproceso en vLLM.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos técnicos con imágenes intercaladas: el modelo puede ingerir hasta 16 imágenes por prompt junto a texto largo, lo que permite procesar manuales, planos o capturas de pantalla dentro de un mismo contexto de 102.400 tokens sin fragmentar la entrada.
- Asistencia en investigación científica: la puntuación de 91,3 en GPQA Diamond sobre la pila FlagOS lo hace adecuado para responder preguntas de nivel posgrado en física, química y biología dentro de un pipeline de revisión asistida.
- Despliegue en clústeres con hardware no NVIDIA: la adaptación multi-chip de FlagOS permite servir el mismo modelo sobre Ascend, Moore Threads, Kunlunxin, Hygon o Iluvatar CoreX, útil en organizaciones con parques heterogéneos o restricciones de suministro.
- Migración y validación de stacks alternativos: los equipos de plataforma pueden comparar la salida de FlagOS frente a la pila nativa (92,9 frente a 91,3 en GPQA Diamond) para decidir si la degradación es aceptable antes de estandarizar.
- Servicio de chat interno con API compatible OpenAI: levantando el servidor vLLM en el puerto 8001 y conectando clientes como AnythingLLM, se obtiene un asistente corporativo autoalojado sin dependencia de APIs externas.
- Procesamiento batch de corpus bilingües chino-inglés: con `--max-num-seqs 64` y `--max-num-batched-tokens 16384`, el servidor está configurado para sostener concurrencia moderada en tareas de generación y resumen.
- Reproducibilidad de experimentos: la imagen de contenedor fijada por versión (vLLM 0.24.0, CUDA 13.0, driver 580.105.08) permite reconstruir exactamente el entorno de evaluación en otra máquina.

## Benchmarks y rendimiento

| Benchmark | Nvidia-Origin (pila nativa) | Nvidia-FlagOS (esta build) | Delta |
|---|---|---|---|
| GPQA Diamond | 92,9 | 91,3 | -1,6 |
| MuSR | 78,57 | 76,46 | -2,11 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 360 GB, por lo que se necesita al menos esa capacidad agregada; en la práctica, 8 GPU H100 de 80 GB (640 GB) con `--gpu-memory-utilization 0.90`.
- Configuración de referencia validada: 8 x NVIDIA H100, tensor parallelism 8, backend de ejecución distribuida `mp`, `--shm-size 64g`.
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 podrían alojar los 360 GB de pesos BF16. Se requeriría cuantización agresiva (no publicada en este repositorio) y aun así excedería una sola tarjeta.
- Entorno de software: Docker 24.0.0, Ubuntu 22.04.4 LTS, driver 580.105.08, CUDA 13.0, Python 3.12, PyTorch 2.11, vLLM 0.24.0 con plugin FlagOS.
- Opciones de despliegue: vLLM con el plugin FlagOS (`VLLM_PLUGINS=fl`, `VLLM_FL_PREFER=flagos`). Otras alternativas como llama.cpp, Ollama o TGI no están documentadas para esta build.
- Ajustes de rendimiento relevantes: `--moe-backend triton`, `VLLM_MOE_USE_DEEP_GEMM=0`, `VLLM_USE_DEEP_GEMM=0`, captura de grafos CUDA para tamaños 1 a 64, caché de prefijos deshabilitada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (esta build, FlagOS/NVIDIA) | ~180.000 M (MoE) | 102.400 tokens | Apache 2.0 | Sí (texto + imagen) | Hugging Face, ModelScope |
| Qwen3.8-Flash-Next (build nativa NVIDIA) | ~180.000 M (MoE) | no disponible | Apache 2.0 | Sí | Referenciada como baseline en la model card |
| Versiones FlagOS para otros chips (Ascend, Moore Threads, Kunlunxin, Hygon, Iluvatar, MetaX, T-Head) | ~180.000 M (MoE) | no disponible | Apache 2.0 | Sí | Hugging Face, ModelScope |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de modelos competidores de otros fabricantes, por lo que la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés declarados; el rendimiento en castellano u otras lenguas no está validado y previsiblemente será inferior.
- Precisión: la build FlagOS pierde entre 1,6 y 2,1 puntos frente a la pila nativa en GPQA Diamond y MuSR. En dominios sensibles conviene validar la degradación con un conjunto propio antes de producción.
- Parámetros activos desconocidos: al no publicarse el número de parámetros activos por token, no es posible estimar con rigor el coste computacional real por inferencia ni compararlo con otros MoE.
- Riesgo de alucinación: no se documentan en la información disponible las tasas de alucinación ni las salvaguardas de alineación aplicadas.
- Sesgos: no se proporciona ninguna evaluación de sesgos demográficos, culturales o políticos.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar las condiciones del modelo original de Alibaba, ya que esta build es una adaptación de terceros y no el artefacto primario del autor.
- Dependencia de la imagen de contenedor: el despliegue está acoplado a versiones muy concretas de driver, CUDA y vLLM; actualizar cualquiera de ellas puede romper la compatibilidad del plugin FlagOS.
- Lista negra de operadores: la variable `VLLM_FL_FLAGOS_BLACKLIST` excluye operadores como `conv2d`, `pad`, `mul` o `sqrt` de la ruta FlagOS, lo que implica que parte del grafo se ejecuta por rutas alternativas y puede afectar al rendimiento en cargas multimodales.
- Madurez: 46 descargas y 0 likes en el momento del registro, con una model card centrada en instrucciones de despliegue y sin documentación de entrenamiento, evaluación amplia ni limitaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FlagRelease/Qwen3.8-Flash-Next-BF16-nvidia-FlagOS
- AnythingLLM (cliente compatible): https://anythingllm.com/
- ModelScope (descarga de pesos): referencia `FlagRelease/Qwen3.8-Flash-Next-BF16-nvidia-FlagOS` mediante `modelscope download`
- Imagen de contenedor: `harbor.baai.ac.cn/flagrelease-public/qwen3.8-flash-next-nvidia003-gems5.3.3-tree0.5.0-cxnone-plugin0.3.0-vllm0.24.0-sglangnone-sglangflnone-cp312-pt211-cu129-x64-580.105.08:202611161600`
- Paper, blog técnico del modelo original, repositorio de código y demo: no disponibles en la información proporcionada.
