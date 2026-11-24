# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r768-c1024

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r768-c1024 es un checkpoint de investigación desarrollado por el grupo McGill-NLP que aplica la técnica EchoMoE sobre Qwen3-30B-A3B. El objetivo no es mejorar la calidad del modelo, sino reducir el coste de comunicación en inferencia distribuida con paralelismo de expertos (expert parallelism). En lugar de transmitir cada estado oculto completo entre nodos, el modelo envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas.

El checkpoint parte del modelo base Qwen3-30B-A3B-Base (48 capas, 128 expertos con 8 activos, hidden size 2.048) y se ha destilado desde un teacher afinado con datos de instrucciones Dolci. La configuración concreta de esta variante usa una referencia cada 6 capas (8 de 48), un código de dispatch de 768 dimensiones y un código de combine de 1.024 dimensiones. Según la model card, esto reduce un 50 % los bytes intercambiados entre nodos a cambio de una pérdida media de 3,4 puntos sobre 18 benchmarks respecto al teacher sin comprimir.

Es relevante para equipos que despliegan modelos MoE grandes en clústeres multi-nodo y que están limitados por el ancho de banda de interconexión: ofrece un compromiso explícito y medido entre precisión y tráfico de red, con soporte para vLLM 0.21 mediante un plugin y para transformers 5.8.1 a través de código remoto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con compresión de activaciones EchoMoE |
| Parametros totales | 31.903.741.952 (~31,9 B) |
| Parametros activos | 8 de 128 expertos por capa (modelo base A3B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 (pesos publicados); FP8 opcional para dispatch/combine en inferencia; no se listan GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 63,8 GB), requiere trust_remote_code |

## Arquitectura y entrenamiento

El modelo es un transformer MoE derivado de Qwen3-30B-A3B-Base: 48 capas, 128 expertos por capa con 8 activos, hidden size de 2.048 y 32.768 tokens de contexto. La innovación de EchoMoE se sitúa en la capa de comunicación: en lugar de despachar y combinar estados ocultos completos entre GPUs en un esquema de expert parallelism, el modelo transmite una representación comprimida de la diferencia respecto a un estado de referencia. En esta variante la referencia se refresca cada 6 capas (8 referencias en total), el código de dispatch tiene 768 dimensiones y el de combine 1.024 dimensiones.

El entrenamiento es una destilación desde el teacher McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher sobre 4,3 mil millones de tokens, con todos los pesos entrenados. Los datos de partida incluyen allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025. No se documentan fases de RLHF o DPO específicas para este checkpoint; el ajuste se apoya en la destilación del teacher afinado.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (chat template de Qwen3).
- Razonamiento y conocimiento general, evaluado en el bloque de knowledge and reasoning de los 18 benchmarks del paper.
- Matemáticas y código, con rendimiento medido en los dominios Math y Code de la evaluación.
- Seguimiento de instrucciones (instruction following), evaluado explícitamente en la tabla de resultados.
- Modo thinking/no-thinking heredado de Qwen3: la model card recomienda los valores no-thinking para chat (temperature 0.7, top_p 0.8, top_k 20, presence penalty 1.5 en vLLM) y decodificación greedy para tareas few-shot.
- Inferencia distribuida con expert parallelism: soporte nativo en vLLM 0.21 mediante el plugin de EchoMoE y backend all2all `allgather_reducescatter`.
- Carga en un solo GPU con transformers 5.8.1 y código remoto, en PyTorch plano sin paralelismo de expertos.
- No se documentan capacidades de visión, audio, tool calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Despliegue multi-nodo de un MoE de ~32 B con interconexión limitada: el modelo reduce un 50 % los bytes entre nodos, por lo que resulta adecuado cuando el cuello de botella es la red (por ejemplo, nodos conectados con Ethernet en lugar de InfiniBand) y se puede asumir una pérdida de 3,4 puntos medios.
- Servicio de chat en inglés con contexto largo: con 32.768 tokens de ventana y el chat template de Qwen3, puede gestionar conversaciones multi-turno y documentos extensos en una sola pasada.
- Investigación en sistemas distribuidos de ML: sirve como banco de pruebas reproducible para medir el impacto de la compresión de activaciones en throughput y latencia bajo expert parallelism, con el código y el paper publicados.
- Evaluación comparativa de técnicas de compresión de comunicación: al existir teacher y variantes en la colección EchoMoE, permite aislar el efecto de la tasa de compresión sobre la precisión en 18 benchmarks.
- Generación de código y resolución de problemas matemáticos en pipelines internos: el dominio Code se sitúa en 55,2 % de media y Math en 47,8 %, suficiente para tareas de asistencia y generación con revisión humana.
- Fine-tuning posterior sobre dominio específico: al estar bajo Apache 2.0 y con pesos completos en safetensors, se puede adaptar con SFT o LoRA para tareas verticales en inglés.
- Prototipado en una sola GPU de 80 GB: los pesos en bf16 caben en una A100/H100 de 80 GB con transformers y código remoto, lo que facilita validaciones sin montar un clúster.

## Benchmarks y rendimiento

Media (%) sobre 18 benchmarks por dominio, con la variación respecto al teacher entre paréntesis, según la model card:

| Dominio | Teacher | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Knowledge and reasoning | 77,6 | 74,0 (−3,6) | 73,8 (−3,8) |
| Math | 50,7 | 47,8 (−2,9) | 48,0 (−2,7) |
| Code | 59,2 | 55,2 (−4,0) | 55,3 (−3,9) |
| Instruction following | 55,6 | 52,3 (−3,3) | 52,0 (−3,6) |
| **Media** | **66,9** | **63,5 (−3,4)** | **63,4 (−3,5)** |

El paper indica una reducción del 50 % en bytes intercambiados entre nodos. No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 63,8 GB, por lo que se necesita una GPU de 80 GB (A100 80 GB, H100 80 GB, H200) para cargar el modelo completo en un solo dispositivo con transformers.
- Inferencia distribuida: la configuración de referencia de vLLM usa un nodo de 8 GPUs con `--data-parallel-size 8` y `--enable-expert-parallel`, backend all2all `allgather_reducescatter` y attention backend FLASHINFER.
- GPU de consumo: no cabe en GPUs consumer de 24 GB ni de 48 GB en bf16; no se documentan cuantizaciones GGUF/INT4 que permitan reducir el requisito.
- Opciones de despliegue: vLLM 0.21 con el plugin de EchoMoE (recomendado para producción y multi-nodo) y transformers 5.8.1 con `trust_remote_code=True` (mono-GPU, sin paralelismo de expertos). No se mencionan llama.cpp, Ollama ni TGI.
- Arranque en vLLM: se recomienda `--max-num-seqs 256` porque la captura de CUDA graphs del modelo plegado crece con el número de secuencias concurrentes y con el valor por defecto supera el tiempo de espera de 600 s del servidor de API.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Comunicación entre nodos | Notas |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r768-c1024 | 31,9 B totales, 8/128 expertos activos | 32.768 | Apache 2.0 | −50 % bytes vs. teacher | Media de 63,5 % en 18 benchmarks |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher | 31,9 B totales, 8/128 expertos activos | 32.768 | Apache 2.0 (heredada del base) | Sin compresión | Media de 66,9 % en 18 benchmarks; referencia de calidad |
| Qwen3-30B-A3B-Base | 31,9 B totales, 8/128 expertos activos | 32.768 | Apache 2.0 | No aplica | Modelo base sin ajuste de instrucciones |

No se dispone en la información proporcionada de comparaciones con otros MoE de tamaño similar (por ejemplo, Mixtral o variantes de Qwen3 con otras técnicas de compresión) ni de sus cifras en los mismos 18 benchmarks.

## Limitaciones y advertencias

- Pérdida de calidad medible: 3,4 puntos de media sobre 18 benchmarks respecto al teacher, con el mayor descenso en Code (−4,0) y el menor en Math (−2,9). No es un sustituto directo del teacher cuando la precisión es crítica.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de calidad multilingüe.
- Checkpoint de investigación: requiere código remoto (`trust_remote_code=True`) y un plugin externo para vLLM; la integración con otros servidores (TGI, llama.cpp, Ollama) no está documentada.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones INT4/INT8, lo que limita el despliegue fuera de GPUs de 80 GB o clústeres multi-GPU.
- Riesgo de alucinación: no se documentan evaluaciones específicas de factualidad ni tasas de alucinación; como modelo de 32 B con media de 74,0 en knowledge and reasoning, cabe esperar errores factuales en dominios especializados.
- Sesgos: no se publica análisis de sesgos ni de seguridad; el entrenamiento parte de Dolci-Instruct-SFT y Dolma3, cuyas características de filtrado y composición condicionan el comportamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-30B-A3B-Base; conviene revisar la licencia del base y de los datasets (Dolci, Dolma3) para usos concretos.
- Configuración de despliegue frágil: el arranque en vLLM exige limitar `--max-num-seqs` y usar CUDA graphs en modo `FULL_DECODE_ONLY`; configuraciones por defecto pueden provocar timeouts.
- Idiomas y contexto: 32.768 tokens es la ventana declarada; no se documenta comportamiento más allá de ese límite ni degradación por posición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r768-c1024
- Teacher: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Paper (arXiv:2611.22215): https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Dataset de instrucciones: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Dataset de pretraining: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-10B-1025
