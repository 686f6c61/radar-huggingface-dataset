# arnabsanyal/lazyWeights

## Resumen

LazyWeights es una colección de seis puntos operativos de cuantización publicada por Arnab Sanyal, Gourav Datta y Sandeep P. Chinchali, orientada a la inferencia de modelos de lenguaje en dispositivos de borde. No es un modelo nuevo entrenado desde cero, sino un conjunto de pesos GPTQ recomprimidos con codificación de Huffman sin pérdida y empaquetados para un runtime CUDA propio que se sitúa entre la DRAM y la caché L2. El objetivo es reducir el ancho de banda de memoria necesario para descodificar los pesos, que es el cuello de botella real en aceleradores de baja potencia como las Jetson.

El repositorio cubre tres modelos base: Phi-3-mini-4k-instruct, Mistral-7B-Instruct-v0.2 y SmolLM-1.7B-Instruct. Para cada uno se ofrecen dos presupuestos de degradación de perplejidad sobre WikiText-2 (≤1 % y ≤3,5 % respecto a fp16), lo que da los seis puntos. Cada punto se entrega en dos formatos: un GGUF estándar que corre en llama.cpp sin modificaciones y un bundle con los mismos códigos comprimidos con Huffman que ejecuta el runtime propio del paper.

La relevancia actual reside en que demuestra una vía de compresión que va más allá de los formatos de bloque fijos de llama.cpp (IQ4_XS, Q5_K_M, etc.), con ahorros de ancho de banda de entre el 5,7 % y el 31,4 % manteniendo el presupuesto de calidad declarado. El paper asociado es arXiv 2611.17108 y el código está disponible en GitHub bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de los modelos base: Phi-3-mini, Mistral-7B-v0.2 y SmolLM-1.7B) |
| Parametros totales | 7.241.732.096 (dato safetensors del repo; corresponde al conjunto, no a un unico modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base: Phi-3-mini 4k, Mistral-7B-v0.2 32k, SmolLM-1.7B segun su card) |
| Tipos de cuantizacion | GPTQ recomprimido en formatos de bloque de llama.cpp (IQ4_XS, Q3_K_M, Q5_K_M) con codificacion de Huffman sin perdida; bundles con 3,422-5,162 b/w |
| Idiomas soportados | en |
| Licencia | other (base-model-licenses): MIT para Phi-3-mini, Apache 2.0 para Mistral-7B-v0.2 y SmolLM-1.7B; codigo MIT |
| Formato de pesos | GGUF (llama.cpp) y bundles de runtime propietario (`manifest.txt` + `weights.bin`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de cada modelo base, sin cambios estructurales: transformers decoder-only con atención completa. Lo que introduce LazyWeights es una capa de compresión sobre los pesos ya cuantizados. Cada matriz se cuantiza con GPTQ hacia los formatos de bloque propios de llama.cpp (IQ4_XS o Q5_K_M según el punto), y los códigos enteros resultantes se recomprimen sin pérdida con codificación de Huffman en carriles intercalados. El bundle incluye además las escalas y mínimos del formato, y el recuento de bits por peso (b/w) contabiliza todas las sobrecargas: tablas de Huffman, offsets de carril, escalas y mínimos.

Los hiperparámetros que definen cada punto son tres: γ (compartir un paso por super-bloque en lugar del ajuste por sub-bloque de llama.cpp), λ (peso de entropía en la elección de códigos de GPTQ) y c (ensanchamiento del paso). Los puntos se seleccionan como el modelo comprimido más pequeño que cabe en un presupuesto de perplejidad sobre WikiText-2 (+1 % o +3,5 % respecto a fp16), comparado contra el mejor formato de llama.cpp que cumpla el mismo presupuesto, con o sin importance matrix. Los pesos de partida son los de las releases oficiales en ONNX de cada modelo, reconstruidos como checkpoints de Hugging Face y verificados por hash con `scripts/prepare_models.py`. No se documenta entrenamiento adicional, RLHF ni DPO: es un proceso de cuantización y compresión post-entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, heredada de los modelos base instruct.
- Razonamiento y matemáticas básicas según el modelo base (GSM8K se evalúa en el paper para los puntos de Phi-3-mini y Mistral).
- Ejecución en llama.cpp sin modificaciones a través de los ficheros GGUF, con soporte de las herramientas estándar (`llama-cli`, `llama-perplexity`).
- Ejecución en dispositivos Jetson (Orin Nano Super y Nano) mediante el runtime CUDA `kernels/llmrt.cu`, con bundles comprimidos.
- Verificación bit a bit de los bundles contra gguf-py mediante `scripts/a2_kq_bundle.py --packed`.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en Jetson Orin Nano Super: el runtime `llmrt` descodifica los pesos bajo demanda entre DRAM y L2, lo que permite servir SmolLM-1.7B o Phi-3-mini con menor ancho de banda que un GGUF equivalente; el paper reporta tiempo y energía por token en esta plataforma.
- Despliegue en Jetson Nano: los puntos de menor b/w (por ejemplo, Mistral a 3,422 b/w o Phi-3-mini a 3,649 b/w) están pensados para el presupuesto de +3,5 % de perplejidad, adecuados para hardware con memoria muy limitada.
- Evaluación de calidad de cuantización: los GGUF son byte-idénticos a los medidos en el paper, por lo que sirven para reproducir perplejidad en WikiText-2 con `llama-perplexity` y comparar contra los baselines de llama.cpp con importance matrix.
- Investigación en compresión de pesos: los bundles y el script `a2_kq_bundle.py` permiten reconstruir layouts de ancho fijo y verificar la decodificación contra gguf-py, útil para experimentar con codificación entrópica sobre formatos de bloque.
- Prototipado de asistentes conversacionales en inglés en el borde: SmolLM-1.7B-Instruct con Q5_K_M a 5,162 b/w y +0,88 % de perplejidad es el punto de mayor fidelidad de la colección para tareas de chat.
- Integración en pipelines llama.cpp existentes: al ser GGUF estándar, los ficheros se cargan en builds recientes de llama.cpp (el paper usó el commit `5d7793d`) sin cambiar el código de la aplicación.
- Benchmarking de eficiencia energética: la comparación de tiempo y energía por token entre Orin Nano Super y Nano permite caracterizar el coste de descodificación de cada punto operativo.

## Benchmarks y rendimiento

Los datos publicados en la model card son de perplejidad sobre WikiText-2 y de ancho de banda efectivo (b/w). La precisión en tareas (HellaSwag, ARC-e, PIQA, GSM8K) y los tiempos y energías por token en Jetson se remiten al paper y al README de GitHub, pero no se incluyen cifras en la información disponible.

| Modelo | Presupuesto | Formato GGUF | b/w | ΔPPL | Baseline llama.cpp (b/w) | Ahorro |
|---|---|---|---:|---:|---|---:|
| Phi-3-mini-4k-instruct | ≤1 % | IQ4_XS_g0_lam0_c1.25 | 4,046 | +0,11 % | IQ4_XS + imatrix (4,311) | 6,2 % |
| Phi-3-mini-4k-instruct | ≤3,5 % | IQ4_XS_g1_lam0_c1.25 | 3,649 | +2,97 % | Q3_K_M + imatrix (4,108) | 11,2 % |
| Mistral-7B-Instruct-v0.2 | ≤1 % | IQ4_XS_g1_lam0 | 3,886 | +0,94 % | Q5_K_M (5,668) | 31,4 % |
| Mistral-7B-Instruct-v0.2 | ≤3,5 % | IQ4_XS_g1_lam0_c1.5 | 3,422 | +1,46 % | IQ3_M + imatrix (3,628) | 5,7 % |
| SmolLM-1.7B-Instruct | ≤1 % | Q5_K_M_g1_lam0 | 5,162 | +0,88 % | Q5_K_M (5,721) | 9,8 % |
| SmolLM-1.7B-Instruct | ≤3,5 % | IQ4_XS_g1_lam0 | 3,934 | +3,27 % | IQ4_XS + imatrix (4,388) | 10,3 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible; el paper los referencia pero no se incluyen cifras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño del repo es de 27,4 GB para los seis puntos y tres modelos. Los bundles individuales ocupan menos que sus GGUF equivalentes al estar comprimidos (por ejemplo, SmolLM a 3,934 b/w frente a ~4,25 b/w de IQ4_XS).
- GPU recomendadas: el runtime del paper está diseñado para NVIDIA Jetson Orin Nano Super y Jetson Nano. No se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en GPU consumer: no confirmado en la información disponible; los modelos base (1,7B a 7B) son compatibles con GPUs consumer en sus formatos GGUF estándar, pero el runtime propio solo se ha validado en Jetson.
- Opciones de despliegue: llama.cpp (cualquier build reciente; el paper usó el commit `5d7793d`) para los GGUF; runtime CUDA `kernels/llmrt.cu` compilado para Orin y Nano para los bundles. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: el paper reporta tiempo y energía por token en Jetson Orin Nano Super y Jetson Nano, pero las cifras no están en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / b/w | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LazyWeights (Phi-3-mini) | ~3,8B (base) | 4k (base) | GGUF IQ4_XS, 3,649-4,046 b/w | MIT (base) | Hugging Face, GitHub |
| LazyWeights (Mistral-7B) | ~7B (base) | 32k (base) | GGUF IQ4_XS, 3,422-3,886 b/w | Apache 2.0 (base) | Hugging Face, GitHub |
| LazyWeights (SmolLM-1.7B) | ~1,7B (base) | no disponible (base) | GGUF IQ4_XS/Q5_K_M, 3,934-5,162 b/w | Apache 2.0 (base) | Hugging Face, GitHub |
| GGUF estándar de llama.cpp (IQ4_XS + imatrix) | según base | según base | 4,108-4,388 b/w | según base | llama.cpp |
| GGUF estándar de llama.cpp (Q5_K_M) | según base | según base | 5,668-5,721 b/w | según base | llama.cpp |

La comparación relevante es contra los formatos de bloque de llama.cpp con importance matrix, que son el baseline del paper: LazyWeights reduce el ancho de banda entre un 5,7 % y un 31,4 % con presupuestos de perplejidad equivalentes. No se dispone de comparación con otros esquemas de compresión entrópica de terceros en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- El runtime propio (`llmrt`) solo se ha validado en Jetson Orin Nano Super y Jetson Nano; no hay soporte documentado para GPUs de datacenter ni consumer.
- Los bundles comprimidos requieren compilar el kernel CUDA del repositorio; los GGUF son la única vía de ejecución en llama.cpp estándar y almacenan los códigos a ancho completo (sin la compresión Huffman), por lo que no ofrecen el ahorro de ancho de banda del paper.
- La licencia es "other" con herencia de las licencias de los modelos base (MIT para Phi-3-mini, Apache 2.0 para Mistral y SmolLM); el uso comercial debe verificar la licencia del modelo base concreto.
- Riesgo de alucinación y sesgos heredados de los modelos base, no evaluados de forma específica en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; la madurez y el soporte de la comunidad son limitados.
- La verificación de integridad requiere ejecutar `sha256sum -c SHA256SUMS` tras la descarga completa; los layouts de ancho fijo y streaming no se suben y deben reconstruirse con los scripts.
- No se documentan capacidades de tool calling, agentes ni multi-step reasoning; no deben asumirse.

## Enlaces

- Hugging Face: https://huggingface.co/arnabsanyal/lazyWeights
- Paper (arXiv 2611.17108): https://arxiv.org/abs/2611.17108
- Código (GitHub): https://github.com/arnabsanyal/lazyWeights
- Modelo base Phi-3-mini-4k-instruct: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Modelo base Mistral-7B-Instruct-v0.2: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Modelo base SmolLM-1.7B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM-1.7B-Instruct
- Licencia MIT de Phi-3-mini: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct/blob/main/LICENSE
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
