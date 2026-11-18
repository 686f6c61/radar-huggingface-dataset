# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c768

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r256-c768 es un checkpoint de investigación publicado por McGill-NLP que aplica la técnica EchoMoE sobre el modelo Qwen3-30B-A3B. EchoMoE readapta un modelo mixto de expertos (MoE) preentrenado para reducir el tráfico de comunicación bajo paralelismo de expertos: en lugar de enviar cada estado oculto completo entre nodos, transmite una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas. El objetivo no es mejorar la calidad, sino abaratar la inferencia distribuida de modelos MoE de gran tamaño.

La arquitectura subyacente es un transformer MoE de 48 capas, 128 expertos con 8 activos y tamaño oculto de 2.048, heredado de Qwen3-30B-A3B-Base (26.602.141.696 parámetros totales según safetensors). Este checkpoint concreto usa una referencia cada 6 capas (8 de 48), un código de dispatch de 256 dimensiones y un código de combine de 768 dimensiones, y se ha destilado desde un teacher afinado sobre datos de instrucciones Dolci.

Es relevante ahora porque demuestra un compromiso explícito entre coste de red y calidad: reduce un 67% los bytes entre nodos y mejora el throughput un 32,5% en paralelismo de expertos 32 sobre 4 nodos de 8 H100, a cambio de perder 8,6 puntos de media en 18 benchmarks respecto al teacher sin comprimir. Es, por tanto, una pieza útil para quienes despliegan MoE en clústeres con enlaces limitados, no un modelo de propósito general listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con retrofit EchoMoE; 48 capas, 128 expertos, 8 activos, hidden size 2.048 |
| Parametros totales | 26.602.141.696 |
| Parametros activos | 8 de 128 expertos por token (modelo base Qwen3-30B-A3B; número exacto de parámetros activos no disponible) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 en los pesos publicados; la model card menciona además envío de dispatch y combine en FP8 (EchoMoE + FP8) a nivel de comunicación, no cuantización de pesos documentada |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con remote code en transformers; repo de 53,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base, un transformer MoE con 48 capas, 128 expertos y 8 activos por token, y lo readapta con EchoMoE: cada estado oculto que se despacha a los expertos se sustituye por una diferencia comprimida respecto a un estado de referencia que se refresca cada 6 capas (8 referencias en total). El código de dispatch tiene 256 dimensiones y el de combine 768 dimensiones. El entrenamiento se realizó por destilación desde el teacher McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher (el base afinado sobre allenai/Dolci-Instruct-SFT), sobre 4,3B tokens y con todos los pesos entrenados. Los datos de referencia citados incluyen allenai/Dolci-Instruct-SFT y allenai/dolma3_dolmino_mix-10B-1025.

La innovación técnica es de sistemas más que de modelado: el checkpoint está pensado para ejecutarse con un runtime de paralelismo de expertos sobre vLLM (0.29 con DeepEP para throughput; 0.21 con plugin EchoMoE para precisión) y con remote code en transformers 5.8.1. La model card no documenta detalles de RLHF/DPO ni de decodificación especulativa; el ajuste procede de destilación sobre datos de instrucciones.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat de Qwen3.
- Razonamiento y conocimiento general, aunque con una pérdida media de 9,3 puntos en el bloque de conocimiento y razonamiento respecto al teacher.
- Matemáticas: 42,5% de media en los benchmarks de la categoría (frente a 50,7 del teacher).
- Generación de código: 50,4% de media (frente a 59,2 del teacher).
- Seguimiento de instrucciones: 50,1% de media (frente a 55,6 del teacher).
- Modo no-thinking recomendado para chat (temperature 0.7, top_p 0.8, top_k 20, presence penalty 1.5 en vLLM); decodificación greedy por defecto para tareas few-shot.
- Soporte de tool calling, function calling y comportamiento agéntico multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación en sistemas distribuidos para MoE: sirve como banco de pruebas para medir el impacto del tráfico entre nodos en el throughput de inferencia, con cifras reproducibles en `results/throughput/throughput.csv`.
- Despliegue en clústeres con enlaces de red lentos: en TCP con 8 peticiones por GPU el modelo logra un +108,7% de throughput en BF16 y +199,8% en FP8 frente al teacher, lo que lo hace adecuado cuando el ancho de banda es el cuello de botella.
- Servicio de chat en inglés con contexto largo: admite 32.768 tokens, útil para conversaciones multi-turno o documentos extensos donde la ventana de contexto importa más que la precisión punta.
- Evaluación comparativa de técnicas de compresión de comunicación: al publicarse junto al teacher y a la variante FP8, permite aislar la pérdida de calidad atribuible a EchoMoE (8,6 puntos de media en 18 benchmarks).
- Prototipado de pipelines de generación de código en inglés con requisitos moderados de calidad, aceptando la caída de ~8,8 puntos en la categoría de código respecto al teacher.
- Experimentación académica con destilación y remote code en transformers: el checkpoint carga en una sola GPU de 80 GB en bf16, lo que facilita reproducir la evaluación sin montar un clúster multi-nodo.

## Benchmarks y rendimiento

Precisión: media (%) sobre 18 benchmarks por dominio, con la variación respecto al teacher entre paréntesis.

| Dominio | Teacher | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 68,3 (−9,3) | 68,4 (−9,2) |
| Matemáticas | 50,7 | 42,5 (−8,2) | 43,4 (−7,3) |
| Código | 59,2 | 50,4 (−8,8) | 49,2 (−10,0) |
| Seguimiento de instrucciones | 55,6 | 50,1 (−5,5) | 51,0 (−4,6) |
| **Media** | **66,9** | **58,3 (−8,6)** | **58,5 (−8,4)** |

Throughput: ganancia frente al teacher sin comprimir, ambos con vLLM 0.29 y DeepEP, paralelismo de expertos 32 sobre 4 nodos de 8 H100 y asignación balanceada de expertos.

| Carga (tokens entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +18,3% | +17,8% |
| 1.024 → 128 | RDMA | 512 | +38,3% | +23,2% |
| 4.096 → 256 | RDMA | 128 | +32,5% | +18,8% |
| 16.384 → 512 | RDMA | 32 | +21,8% | +12,3% |
| 4.096 → 256 | RDMA, enlace 2× más lento | 128 | +30,0% | +22,2% |
| 4.096 → 256 | RDMA, enlace 2,5× más lento | 128 | +56,1% | +31,0% |
| 4.096 → 256 | TCP | 8 | +108,7% | +199,8% |

La ganancia se reduce con lotes pequeños: +7,6% para 4.096 → 256 tokens con 8 peticiones por GPU. La model card no desglosa los 18 benchmarks individuales ni publica resultados de MMLU, HumanEval o GSM8K por separado.

## Requisitos de hardware

- Los pesos en bf16 caben en una sola GPU de 80 GB (A100 80 GB, H100 80 GB) usando transformers con remote code y sin paralelismo de expertos.
- Para el modo de paralelismo de expertos, la configuración de referencia es 1 nodo de 8 GPU (vLLM 0.21 con plugin EchoMoE) o 4 nodos de 8 H100 para throughput con vLLM 0.29 y DeepEP.
- No se documenta cuantización GGUF ni despliegue en GPU de consumo; no disponible la VRAM estimada para cuantizaciones de 4 u 8 bits.
- Opciones de despliegue: vLLM (con plugin EchoMoE), transformers 5.8.1 con remote code y runtime propio de paralelismo de expertos con DeepEP. No se mencionan llama.cpp, Ollama ni TGI.
- En vLLM conviene fijar `--max-num-seqs 256` para que el arranque no supere los 600 segundos de espera del servidor de API, por el coste de captura de CUDA graphs del modelo plegado.
- Throughput: la model card solo publica ganancias relativas frente al teacher, no valores absolutos de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (media 18 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r256-c768 | 26,6B totales, 8/128 expertos activos | 32.768 | 58,3 (EchoMoE) / 58,5 (FP8) | apache-2.0 | Hugging Face, repo de 53,2 GB |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher | mismo base Qwen3-30B-A3B | no disponible en la información | 66,9 | no disponible en la información | Hugging Face (McGill-NLP) |
| Qwen3-30B-A3B-Base | 30B clase A3B, 8/128 expertos activos | no disponible en la información | no disponible | no disponible en la información | Hugging Face (Qwen) |

La comparación con alternativas fuera de la familia Qwen3 (por ejemplo, otros MoE de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad sistemática: 8,6 puntos de media en 18 benchmarks respecto al teacher, con el mayor deterioro en conocimiento y razonamiento (−9,3) y código (−8,8).
- La variante FP8 no recupera calidad: la media es 58,5 frente a 58,3, y en código empeora hasta −10,0 respecto al teacher.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- Contexto limitado a 32.768 tokens; no se documenta extensión por YaRN ni variantes de contexto largo.
- No hay información sobre sesgos, filtrado de datos o riesgos de alucinación más allá de lo inherente a un modelo destilado sobre datos de instrucciones.
- La licencia apache-2.0 permite uso comercial, pero el modelo depende de remote code (`trust_remote_code=True`) y de un plugin externo de vLLM, lo que añade superficie de mantenimiento y revisión de seguridad en producción.
- El checkpoint está pensado para investigación en sistemas: los 0 descargas y 0 likes en el momento de la ficha, junto a la falta de paper publicado (el enlace arXiv figura como TODO en la model card), desaconsejan tratarlo como modelo estable de producción.
- El rendimiento depende críticamente de la topología de red y del tamaño de lote; las ganancias caen a +7,6% con lotes pequeños.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deben asumirse en integraciones que las requieran.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c768
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Teacher: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Resultados de throughput en bruto: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
- Paper: no disponible (pendiente en la model card)
