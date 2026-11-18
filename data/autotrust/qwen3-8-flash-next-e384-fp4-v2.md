# autotrust/Qwen3.8-Flash-Next-E384-FP4-V2

## Resumen

Qwen3.8-Flash-Next-E384-FP4-V2 es un checkpoint derivado del modelo multimodal nvidia/Qwen3.8-Flash-Next-FP4-Local, publicado por el usuario autotrust en Hugging Face. Se trata de una variante "compacta" obtenida mediante busqueda de arquitectura neuronal (NAS) sobre la configuracion de expertos enrutados: conserva 384 de los 512 expertos enrutados en cada capa MoE del decodificador y en la capa MTP, manteniendo intactos el enrutamiento top-10, los expertos compartidos, la atencion, la tabla n-gram PLE, el torre de vision y el tokenizador. El resultado es una reduccion de pesos del 16,1 % (de 95,12 GiB a 79,78 GiB) sin alterar el numero de expertos activos por token.

Sobre esta base E384 se ha aplicado un ajuste mediante LoRA con refuerzo estilo GRPO y recompensas verificables, en tres rondas, con el objetivo final de mejorar la completitud de CVSS y la emision estructurada de hallazgos. El adaptador LoRA (rango 32, alpha 64) se ha fusionado en los pesos, por lo que el repositorio contiene un modelo completo de 21 shards, no un adaptador. Los expertos enrutados, el router, el experto compartido y la tabla PLE permanecen congelados durante el entrenamiento.

La relevancia actual del modelo radica en su naturaleza multimodal (pipeline image-text-to-text), su empaquetado en FP4 con cuantizacion mixta ModelOpt y su validacion con vLLM 0.31 sobre una GPU B200. Con 155.104.917.163 parametros totales y un peso de repositorio de 87,8 GB, se posiciona como una opcion de despliegue en hardware Blackwell para tareas de razonamiento, codigo, matematicas y vision, con licencia NVIDIA Open Model Agreement. Es un derivado no oficial, no respaldado por Alibaba ni por NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capa MTP, atencion (sin detallar variante), torre de vision y tabla n-gram PLE (arquitectura hibrida segun tags y configuracion de serving) |
| Parametros totales | 155.104.917.163 |
| Parametros activos | 10 expertos enrutados + expertos compartidos por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 72.000 tokens configurados en el serving de referencia (`--max-model-len 72000`); contexto nativo maximo no disponible |
| Tipos de cuantizacion | FP4 (NVFP4) con cuantizacion mixta ModelOpt (`modelopt_mixed`); proyecciones GDN almacenadas en BF16; KV cache en FP8 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | nvidia-open-model-agreement (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (21 shards), configuracion y ficheros MTP incluidos; libreria vLLM |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura MoE con 512 expertos enrutados por capa en el decodificador y en la capa MTP, de los cuales se activan los 10 mejores por token mas los expertos compartidos. La variante E384 reduce el numero de expertos enrutados a 384 por capa mediante NAS, sin tocar el enrutamiento top-10 ni los expertos compartidos. Incluye ademas una torre de vision (pipeline image-text-to-text), una tabla n-gram PLE y proyecciones GDN, lo que apunta a un diseno hibrido con componentes de atencion y posiblemente state-space, aunque la model card no detalla la variante exacta de atencion. El checkpoint se sirve con `--mamba-cache-mode align`, lo que confirma la presencia de capas tipo Mamba/SSM en el stack.

El entrenamiento posterior consistio en tres actualizaciones LoRA estilo GRPO con recompensas verificables, rango 32 y alpha 64, manteniendo congelados los expertos enrutados, el router, el experto compartido y la tabla PLE. La ronda final se centro en completitud de CVSS con presupuesto corto y emision estructurada de hallazgos. Los deltas de las proyecciones GDN se plegaron a precision completa y se almacenan en BF16, eliminando sus entradas de `quantization_config.quantized_layers`. El adaptador se fusiono en los pesos antes de crear el repositorio. No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion del dataset ni detalles del RLHF/DPO original.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento matematico con modo de razonamiento extendido (xhigh) y presupuesto de generacion de hasta 64k tokens.
- Generacion de codigo (HumanEval evaluado con 164 problemas en modo greedy).
- Vision y comprension imagen-texto (MMMU evaluado sobre 900 preguntas).
- Tool calling / function calling, con parser `qwen3_xml` y `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso y agentes, con parser de razonamiento `qwen3`.
- Capacidad especifica entrenada: completitud de CVSS3 y CVSS4 y emision estructurada de hallazgos de seguridad.
- Soporte de decodificacion especulativa mediante la capa MTP incluida.
- Prefix caching y chunked prefill habilitados en el serving de referencia.

## Casos de uso

- Analisis de vulnerabilidades y generacion de informes de seguridad: el modelo se entreno especificamente para completar puntuaciones CVSS3 y CVSS4 y emitir hallazgos estructurados, con mejoras medidas en evaluacion sobre prompts de entrenamiento (CVSS3 del 39 % al 70 % de completitud en 2.200 tokens; CVSS4 del 18 % al 60 %). Adecuado para asistentes de triaje, no como calculador fiable de puntuaciones.
- Asistencia en razonamiento matematico: con modo xhigh y 64k de generacion obtiene 95,0 en AIME 2026, por lo que sirve para resolver problemas de competicion y verificacion de cadenas de razonamiento largas.
- Generacion de codigo en pipelines: HumanEval de 98,78 en modo greedy y soporte de tool calling permiten integrarlo en entornos de autocompletado, revision o generacion de tests dentro de CI/CD.
- Atencion al cliente multilingue (en/zh): conversaciones multi-turno con ventana de 72.000 tokens y prefix caching para reutilizar contexto de sesion.
- Analisis de documentos e imagenes tecnicas: al ser image-text-to-text, puede extraer informacion de capturas, diagramas o documentacion escaneada y combinarla con razonamiento textual.
- Agentes con herramientas: el soporte de tool calling y multi-step reasoning permite construir agentes que consulten APIs, ejecuten codigo o recuperen informacion antes de responder.
- Evaluacion academica y benchmarks internos: C-Eval de 89,97 y MMLU de 87,37 lo hacen util como modelo de referencia en tareas de conocimiento en ingles y chino.

## Benchmarks y rendimiento

Resultados publicados en la model card, con el mismo harness y ajustes de serving para todas las filas. Son ejecuciones unicas; GPQA tiene solo 198 preguntas y es ruidoso. AIME 2026 usa 30 problemas x 4 muestras con razonamiento xhigh y presupuesto de 64k. Las cifras base son referencias publicadas previamente, no reejecutadas.

| Benchmark | Base de referencia | Este modelo |
|---|---:|---:|
| GPQA-Diamond (low, 32k) | 77,3 | 75,76 |
| MMLU (14.042) | 86,9 | 87,37 |
| C-Eval val (1.346) | 89,0 | 89,97 |
| AIME 2026 (xhigh, 64k) | 93,3 | 95,0 |
| HumanEval (164, greedy) | 97,6 | 98,78 |
| MMMU val (900) | 79,4 | 78,22 |
| Tool calling (800) | no disponible | 77,88 |

En longitud de razonamiento sobre 120 muestras de AIME, los tokens de completitud totales bajaron un 2,05 % (de 19.897 a 19.490 por respuesta de media), mientras la precision subio de 92,5 a 95,0. La mediana se mantuvo practicamente igual (de 16.528 a 16.675 tokens); la reduccion provino de la cola larga (P90 de 58.272 a 45.339) y de menos truncamientos a 65.536 tokens (de 9 a 6).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 87,8 GB en FP4; se recomienda al menos 80 GB de VRAM para cargar los pesos y dejar margen para KV cache FP8 y contexto de 72k.
- GPU recomendadas: NVIDIA B200 (validado con vLLM 0.31 en una sola GPU con tensor-parallel-size 1). Otras GPU Blackwell con soporte FP4 son las candidatas naturales; no se han validado otras configuraciones en la informacion disponible.
- Cabe en GPU consumer: no disponible en la informacion proporcionada; el tamano y el formato FP4 apuntan a hardware de datacenter.
- Opciones de despliegue: vLLM 0.31 con el parche `vllm_patch/sitecustomize.py` incluido (necesario para el layout FP4/CSF/PLE de este checkpoint). El script `serve_vllm.sh` es el lanzador portable equivalente. No se mencionan llama.cpp, Ollama ni TGI.
- Parametros de serving de referencia: `--tensor-parallel-size 1 --dtype bfloat16 --kv-cache-dtype fp8 --quantization modelopt_mixed --mamba-cache-mode align --enable-prefix-caching --enable-chunked-prefill --max-model-len 72000 --max-num-seqs 128 --gpu-memory-utilization 0.90`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos enrutados | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-E384-FP4-V2 (este) | 155,1 B | 384 de 512, top-10 | 72.000 configurados | nvidia-open-model-agreement | Derivado no oficial, FP4, RL con GRPO |
| nvidia/Qwen3.8-Flash-Next-FP4-Local (original) | no disponible (102,14 GB de pesos) | 512, top-10 | no disponible | nvidia-open-model-agreement | Modelo base; este derivado reduce un 16,1 % el peso |
| autotrust/Qwen3.8-Flash-Next-E384-FP4-Local | no disponible | 384 de 512 | no disponible | no disponible | Base directa de este checkpoint, sin la ronda RL |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, tamano y licencia.

## Limitaciones y advertencias

- La aritmetica de CVSS sigue sin ser fiable: entre las respuestas completadas, la coincidencia exacta con la implementacion de referencia fue de aproximadamente 4,5 % para CVSS3 y 4,2 % para CVSS4 en la evaluacion sobre prompts de entrenamiento. No debe describirse como un modelo que haya resuelto el calculo de CVSS.
- Las mejoras de comportamiento (CVSS3 del 39 % al 70 %, CVSS4 del 18 % al 60 %, recompensa de hallazgos de 0,609 a 0,917) son mediciones sobre prompts de entrenamiento, no un benchmark de comportamiento independiente.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan sesgos conocidos especificos en la informacion disponible.
- Soporte limitado a ingles y chino; no se garantiza calidad en otros idiomas.
- GPQA-Diamond y MMMU empeoran ligeramente respecto a la referencia (75,76 frente a 77,3 y 78,22 frente a 79,4), y GPQA tiene solo 198 preguntas, por lo que la diferencia es ruidosa.
- Es un derivado no oficial, no producido ni respaldado por Alibaba ni por NVIDIA; la licencia NVIDIA Open Model Agreement debe revisarse antes de uso comercial.
- Requiere un parche especifico de vLLM (`sitecustomize.py`) para el layout de pesos FP4/CSF/PLE; no funciona con un vLLM estandar sin ese ajuste.
- El checkpoint esta validado en una unica configuracion de hardware (una B200); no hay datos de despliegue en otras GPU ni de latencia/throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/Qwen3.8-Flash-Next-E384-FP4-V2
- Modelo base directo: https://huggingface.co/autotrust/Qwen3.8-Flash-Next-E384-FP4-Local
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
