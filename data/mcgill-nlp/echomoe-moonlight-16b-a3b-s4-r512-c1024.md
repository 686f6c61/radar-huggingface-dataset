# McGill-NLP/EchoMoE-Moonlight-16B-A3B-s4-r512-c1024

## Resumen

EchoMoE-Moonlight-16B-A3B-s4-r512-c1024 es un checkpoint de investigación desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre el modelo MoE Moonlight-16B-A3B de Moonshot AI. EchoMoE readapta un modelo de mezcla de expertos ya preentrenado para reducir el volumen de comunicación entre nodos bajo paralelismo de expertos (expert parallelism): en lugar de transmitir cada estado oculto completo, envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocos niveles. El objetivo no es mejorar la calidad, sino abaratar el despliegue distribuido de modelos MoE.

La arquitectura subyacente es un transformer de tipo DeepSeek-V3 con 27 capas, 64 expertos enrutados (6 activos) y 2 expertos compartidos, con un tamaño oculto de 2.048 y 15.388.676.928 parámetros totales. La configuración concreta de este checkpoint usa una referencia cada 4 capas MoE (7 de 26), un código de despacho de 512 dimensiones y un código de combinación de 1.024 dimensiones, lo que se traduce en un 50 % menos de bytes enviados entre nodos.

Es relevante ahora porque aborda uno de los cuellos de botella prácticos del serving de MoE a gran escala: el tráfico all-to-all entre GPUs. El precio es una pérdida media de 5,9 puntos sobre el profesor sin comprimir en 18 benchmarks. Se distribuye con licencia MIT, en formato safetensors, con código remoto para transformers y un plugin para vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE tipo DeepSeek-V3 con compresión de activaciones EchoMoE |
| Parametros totales | 15.388.676.928 |
| Parametros activos | 6 expertos enrutados + 2 compartidos por token (no se especifica el recuento exacto de parámetros activos) |
| Longitud de contexto | 8.192 tokens (evaluado a esa longitud) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código remoto; compatible con vLLM mediante plugin) |

## Arquitectura y entrenamiento

El modelo parte de Moonlight-16B-A3B, un transformer con 27 capas, 64 expertos enrutados de los que se activan 6 por token, 2 expertos compartidos y un tamaño oculto de 2.048. Sobre esa base, EchoMoE introduce un mecanismo de compresión de activaciones para el intercambio entre expertos: cada estado oculto se codifica como una diferencia respecto a una referencia que se actualiza cada 4 capas MoE, con un código de despacho de 512 dimensiones y un código de combinación de 1.024 dimensiones. Esto reduce a la mitad los bytes transmitidos en el all-to-all del paralelismo de expertos.

El entrenamiento es una destilación desde el profesor Moonlight-16B-A3B-SFT-EchoMoE-teacher (el modelo base afinado sobre datos de instrucción Dolci, de allenai/Dolci-Instruct-SFT) usando 4.300 millones de tokens y entrenando todos los pesos. Los datos de referencia adicionales incluyen allenai/dolma3_dolmino_mix-10B-1025. La evaluación se realizó en bf16 y a 8.192 tokens de contexto, con vLLM 0.21 y el plugin EchoMoE para los resultados de precisión, y con transformers 5.8.1 cargando el código remoto del repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat integrada.
- Razonamiento y conocimiento general, con una merma de 6,9 puntos frente al profesor en el agregado de conocimiento y razonamiento.
- Matemáticas, con una merma de 3,3 puntos en el agregado de matemáticas.
- Generación de código, con una merma de 7,4 puntos en el agregado de código.
- Seguimiento de instrucciones, con una merma de 4,3 puntos en el agregado correspondiente.
- Serving distribuido con paralelismo de expertos en vLLM (data-parallel-size 8, expert-parallel, backend all-to-all allgather_reducescatter).
- Carga en transformers con código remoto en PyTorch puro, sin paralelismo de expertos.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación sobre eficiencia en serving de MoE: sirve como banco de pruebas para medir el ahorro de ancho de banda del all-to-all con paralelismo de expertos en un nodo de 8 GPUs, comparando el rendimiento frente al profesor sin comprimir.
- Despliegue distribuido con restricciones de red: en clústeres donde el interconnect entre nodos es el limitante, el 50 % menos de bytes por paso puede permitir servir el modelo con menor latencia de comunicación, aceptando la pérdida de calidad asociada.
- Reproducción de resultados académicos: el checkpoint y el plugin de vLLM permiten replicar las cifras de precisión sobre los 18 benchmarks publicados en el repositorio de GitHub.
- Evaluación comparativa de técnicas de compresión: útil para contrastar EchoMoE con otras estrategias de reducción de tráfico en MoE, usando el profesor como línea base.
- Fine-tuning posterior sobre dominio específico: al estar bajo licencia MIT y en safetensors, puede adaptarse a tareas concretas en inglés donde la merma de 5,9 puntos medios sea tolerable tras un ajuste adicional.
- Docencia y experimentación con arquitecturas DeepSeek-V3: el código remoto en PyTorch puro permite inspeccionar el enrutado de expertos y la compresión de activaciones en una sola GPU de 80 GB en bf16.

## Benchmarks y rendimiento

Puntuación media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE |
|---|---|---|
| Conocimiento y razonamiento | 62,9 | 56,0 (−6,9) |
| Matemáticas | 34,7 | 31,4 (−3,3) |
| Código | 47,0 | 39,6 (−7,4) |
| Seguimiento de instrucciones | 51,3 | 47,0 (−4,3) |
| **Media** | **53,0** | **47,1 (−5,9)** |

No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.); el repositorio de GitHub remite a la lista completa de benchmarks empleados.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 caben en una sola GPU de 80 GB según la model card; el repositorio ocupa 30,8 GB.
- GPU recomendadas: A100 80 GB o H100 para la carga en transformers en una sola tarjeta; para el serving con paralelismo de expertos, un nodo de 8 GPUs con vLLM 0.21 y el plugin EchoMoE.
- Cabe en GPU de consumo: no disponible de forma confirmada; no se documentan cuantizaciones (GGUF, AWQ, GPTQ) ni pruebas en RTX 4090.
- Opciones de despliegue: vLLM 0.21 con el plugin EchoMoE (recomendado para precisión y paralelismo de expertos) y transformers 5.8.1 con código remoto. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras concretas en la información disponible; la model card indica que `--max-num-seqs 256` mantiene el arranque en pocos minutos y que el README del repositorio cubre el throughput multi-nodo.
- Configuración de serving de referencia: `--data-parallel-size 8 --enable-expert-parallel --all2all-backend allgather_reducescatter --attention-backend FLASH_ATTN_MLA --max-model-len 8192 --max-num-seqs 256`.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Calidad media (18 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Moonlight-16B-A3B-s4-r512-c1024 | 15,39 B | 8.192 | 47,1 | MIT | Hugging Face, vLLM con plugin |
| Moonlight-16B-A3B-SFT-EchoMoE-teacher | no disponible | 8.192 (evaluación) | 53,0 | no disponible en la información | Hugging Face (McGill-NLP) |
| Moonlight-16B-A3B (base) | no disponible en la información | no disponible | no disponible | MIT (según la model card) | Hugging Face (moonshotai) |

La comparación directa con otros MoE de tamaño similar (por ejemplo, variantes de 16B con 3B activos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad sistemática: 5,9 puntos de media sobre el profesor, con el mayor deterioro en código (−7,4) y conocimiento y razonamiento (−6,9).
- Solo inglés: la model card declara únicamente el idioma `en`; no hay evidencia de capacidades multilingües.
- Contexto limitado a 8.192 tokens en la evaluación; no se documenta soporte para ventanas mayores.
- Riesgo de alucinación inherente a un modelo de 15B con calidad degradada respecto a su profesor; conviene validar salidas en producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- El serving óptimo requiere el plugin propietario de EchoMoE y vLLM 0.21; la carga en transformers es en PyTorch puro sin paralelismo de expertos, por lo que no aprovecha la ventaja de compresión.
- La captura de CUDA graphs crece con el número de secuencias concurrentes; con los valores por defecto de vLLM el arranque puede superar el tiempo de espera de 600 segundos del servidor de API.
- Licencia MIT permite uso comercial, pero el checkpoint es un artefacto de investigación sin garantías de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Moonlight-16B-A3B-s4-r512-c1024
- Paper: https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo profesor: https://huggingface.co/McGill-NLP/Moonlight-16B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/moonshotai/Moonlight-16B-A3B
