# ctech123/Qwen3.8-Flash-Next-E384-FP4-V2

## Resumen

Qwen3.8-Flash-Next-E384-FP4-V2 es un checkpoint completo derivado del modelo Qwen3.8-Flash-Next-FP4-Local de NVIDIA, publicado por el usuario ctech123 en Hugging Face. Se trata de una variante compacta obtenida mediante Neural Architecture Search (NAS) sobre la configuracion de expertos enrutados: conserva 384 de los 512 expertos enrutados en cada capa MoE del decoder y en la capa MTP, manteniendo intactos el enrutamiento top-10, los expertos compartidos, la atencion, la tabla n-gram PLE, el tower de vision y el tokenizer. El resultado es una reduccion del 16,1 % del peso (de 95,12 GiB a 79,78 GiB) sin alterar el numero de expertos activos por token.

Sobre esta base E384 se aplicaron tres rondas de ajuste fino con LoRA (rango 32, alpha 64) siguiendo un esquema GRPO con recompensas verificables, orientadas a completar tareas de CVSS y a la emision estructurada de hallazgos. El adaptador final se fusiono en los pesos, por lo que el repositorio contiene un modelo completo y no un adapter. Los deltas de proyeccion GDN se pliegan a precision completa y se almacenan en BF16, mientras el resto de tensores conserva el formato FP4 del checkpoint base.

El modelo es multimodal (image-text-to-text), con 155.104.917.163 parametros totales y un repositorio de 87,8 GB. Esta pensado para servirse con vLLM 0.31 sobre una NVIDIA B200, con un parche especifico (`vllm_patch/sitecustomize.py`) necesario para el layout FP4/CSF/PLE del checkpoint. Es un derivado no oficial, no producido ni respaldado por Alibaba ni por NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion, capa MTP, tabla n-gram PLE y tower de vision |
| Parametros totales | 155.104.917.163 |
| Parametros activos | 10 expertos enrutados + expertos compartidos por token (sobre 384 enrutados por capa) |
| Longitud de contexto | hasta 72.000 tokens (`--max-model-len 72000` en el launcher de referencia) |
| Tipos de cuantizacion | FP4 (NVFP4, modelopt_mixed), KV cache FP8; proyecciones GDN en BF16 |
| Idiomas soportados | en, zh |
| Licencia | nvidia-open-model-agreement |
| Formato de pesos | safetensors (21 shards), configs y ficheros MTP incluidos |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.8-Flash-Next en version FP4, un transformer MoE con 512 expertos enrutados por capa en el decoder y en la capa MTP, enrutamiento top-10 mas expertos compartidos, atencion estandar, una tabla n-gram PLE y un tower de vision para entrada image-text-to-text. La variante E384 reduce el numero de expertos enrutados a 384 por capa mediante NAS, sin tocar el resto de componentes. El checkpoint usa cuantizacion NVFP4 gestionada por modelopt (`quantization_config.quantized_layers`), con KV cache en FP8.

El ajuste fino consistio en tres actualizaciones LoRA de estilo GRPO con recompensas verificables, con rango 32 y alpha 64, congelando expertos enrutados, router, experto compartido y PLE. La ronda final se centra en completar CVSS con presupuesto corto y en la emision estructurada de hallazgos. Los deltas de proyeccion GDN se pliegan a precision completa y se almacenan en BF16, eliminando esas entradas de la configuracion de cuantizacion. El adaptador final se fusiono en los pesos antes de crear el repositorio, de modo que no requiere carga de adapter. El modelo fue validado con vLLM 0.31 sobre una B200 usando parsers de razonamiento (`qwen3`) y de tool calling (`qwen3_xml`), con prefix caching, chunked prefill y `mamba-cache-mode align`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento matematico de nivel competitivo (AIME) con modo de razonamiento extendido (`xhigh`) y presupuesto de generacion de 64k tokens.
- Generacion y ejecucion de codigo (HumanEval) y tareas de conocimiento general (MMLU, C-Eval).
- Razonamiento cientifico de nivel avanzado (GPQA-Diamond).
- Comprension de imagenes (MMMU), al ser un modelo image-text-to-text con tower de vision.
- Tool calling y function calling mediante el parser `qwen3_xml` y `--enable-auto-tool-choice`.
- Capacidad de agentes y razonamiento multi-paso, con parser de razonamiento dedicado.
- Emision estructurada de hallazgos y completado de puntuaciones CVSS3 y CVSS4 (con las limitaciones descritas abajo).
- Soporte de decodificacion con prefix caching y chunked prefill en vLLM.

## Casos de uso

- Analisis de vulnerabilidades asistido: el modelo puede procesar descripciones de vulnerabilidades y generar hallazgos estructurados con puntuaciones CVSS3 y CVSS4, gracias al ajuste RL especifico sobre estas tareas. Adecuado para triaje inicial, no para puntuacion definitiva.
- Generacion de codigo en pipelines de CI/CD: soporta tool calling y puede integrarse como paso de generacion o revision de parches mediante el parser `qwen3_xml` y el modo auto tool choice de vLLM.
- Razonamiento matematico y cientifico: con 72k de contexto y modo de razonamiento extendido, es util para resolver problemas de competicion y derivaciones de varios pasos con trazas de razonamiento largas.
- Asistencia multimodal documental: al aceptar image-text-to-text, puede responder preguntas sobre capturas, diagramas o documentos escaneados en ingles y chino.
- Atencion al cliente multilingue (en/zh): conversaciones multi-turno con contexto largo gracias a la ventana de hasta 72.000 tokens y prefix caching para reducir coste en sesiones repetidas.
- Agentes autonomos con uso de herramientas: la combinacion de tool calling, razonamiento multi-paso y parser de razonamiento permite construir agentes que consultan APIs y encadenan acciones.
- Despliegue en infraestructura de una sola GPU de gama alta: con 79,78 GiB de pesos FP4 y KV cache FP8, cabe en una B200 con `--tensor-parallel-size 1`, lo que simplifica el serving frente al modelo original de 512 expertos.

## Benchmarks y rendimiento

Resultados publicados por el autor, con el mismo harness y ajustes de serving para todas las filas. Son ejecuciones unicas; GPQA tiene solo 198 preguntas y es ruidoso. AIME 2026 usa 30 problemas x 4 muestras con razonamiento `xhigh` y presupuesto de 64k. Las cifras "base reference" son las publicadas previamente, no una reejecucion.

| Benchmark | Base reference | Este modelo |
|---|---:|---:|
| GPQA-Diamond (low, 32k) | 77,3 | 75,76 |
| MMLU (14.042) | 86,9 | 87,37 |
| C-Eval val (1.346) | 89,0 | 89,97 |
| AIME 2026 (xhigh, 64k) | 93,3 | 95,0 |
| HumanEval (164, greedy) | 97,6 | 98,78 |
| MMMU val (900) | 79,4 | 78,22 |
| Tool calling (800) | no disponible | 77,88 |

En longitud de razonamiento AIME, sobre las mismas 120 muestras, los tokens totales de completado cayeron un 2,05 % (de 19.897 a 19.490 por respuesta de media), con precision subiendo de 92,5 a 95,0. La mediana quedo practicamente igual (16.528 a 16.675 tokens); la reduccion provino de la cola larga (P90 de 58.272 a 45.339) y de menos truncamientos a 65.536 tokens (de 9 a 6).

## Requisitos de hardware

- VRAM estimada: pesos FP4 de aproximadamente 79,78 GiB (85,66 GB); con KV cache FP8, prefix caching y `--gpu-memory-utilization 0.90` el autor lo ejecuta en una B200.
- GPU recomendadas: NVIDIA B200 (validada por el autor con vLLM 0.31). Otras GPU con soporte NVFP4 y memoria suficiente (H100/H200 de 80 GB o superior) no estan validadas en la informacion disponible.
- GPU de consumo: no cabe en GPU consumer (RTX 4090 de 24 GB, RTX 5090 de 32 GB) con este layout FP4/CSF/PLE; no se documentan variantes GGUF ni cuantizaciones para consumer.
- Opciones de despliegue: vLLM 0.31 con el parche `vllm_patch/sitecustomize.py` obligatorio para el layout del checkpoint; launcher alternativo `serve_vllm.sh`. Otros motores (llama.cpp, Ollama, TGI) no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles. El autor no publica medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos enrutados/capa | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-E384-FP4-V2 (este) | 155,1 B | 384 (top-10 activos) | 72k | nvidia-open-model-agreement | Hugging Face, derivado no oficial |
| Qwen3.8-Flash-Next-FP4-Local (original NVIDIA) | no disponible (pesos 95,12 GiB) | 512 (top-10 activos) | no disponible | nvidia-open-model-agreement | Hugging Face, oficial |
| Qwen3.8-Flash-Next-E384-FP4-Local (base de este) | no disponible | 384 | no disponible | no disponible | Hugging Face |

Frente al original de 512 expertos, este checkpoint reduce el peso un 16,1 % manteniendo el mismo numero de expertos activos por token, con resultados de benchmark ligeramente superiores en MMLU, C-Eval, AIME y HumanEval, e inferiores en GPQA-Diamond y MMMU. No se dispone de datos de terceros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Derivado no oficial: no esta producido ni respaldado por Alibaba ni por NVIDIA; su uso en produccion requiere evaluacion propia.
- Aritmetica CVSS no fiable: entre las respuestas completadas, la coincidencia exacta con la implementacion de referencia fue de aproximadamente 4,5 % para CVSS3 y 4,2 % para CVSS4. No debe describirse como un modelo con puntuacion CVSS resuelta.
- Las mejoras de CVSS y de emision estructurada se midieron sobre los prompts de entrenamiento de la ronda RL final, no sobre un benchmark independiente de comportamiento.
- Benchmarks de una sola ejecucion y con muestras pequenas (GPQA 198 preguntas; AIME 30 problemas x 4 muestras), por lo que la variabilidad es alta.
- Idiomas limitados a ingles y chino; no se documenta soporte de otras lenguas.
- Ventana de contexto maxima de 72.000 tokens en la configuracion de serving de referencia, inferior a la de otros modelos de la familia.
- Requiere vLLM 0.31 y un parche Python especifico para el layout FP4/CSF/PLE; otros motores de inferencia no estan validados.
- Licencia NVIDIA Open Model Agreement: conviene revisar sus terminos antes de uso comercial.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de robustez en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ctech123/Qwen3.8-Flash-Next-E384-FP4-V2
- Modelo base (merge): https://huggingface.co/autotrust/Qwen3.8-Flash-Next-E384-FP4-Local
- Modelo original NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
