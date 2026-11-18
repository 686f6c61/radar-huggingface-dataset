# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s4-r512-c768

## Resumen
EchoMoE-Qwen3-30B-A3B-s4-r512-c768 es un checkpoint experimental desarrollado por McGill-NLP que aplica la tecnica EchoMoE sobre Qwen3-30B-A3B-Base. EchoMoE modifica el modelo base para que, bajo paralelismo de expertos (expert parallelism), los estados ocultos que se intercambian entre nodos no se envien completos, sino como una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas. El objetivo es reducir el trafico de red entre nodos, que es el cuello de botella principal al servir modelos MoE de gran tamano distribuidos en cluster.

Este checkpoint concreto usa una referencia cada 4 capas (12 de 48), un codigo de dispatch de 512 dimensiones y un codigo de combine de 768 dimensiones. Segun la model card, reduce el volumen de bytes entre nodos en un 58% e incrementa el throughput un 22,6% con expert parallel 32 sobre 4 nodos, a costa de una perdida de 3,8 puntos en la media de 18 benchmarks respecto al modelo teacher sin comprimir.

Es relevante para investigadores e ingenieros de infraestructura interesados en optimizar el serving de modelos MoE en clusters multi-nodo con interconexion RDMA o TCP, y en explorar tecnicas de compresion de comunicacion en lugar de compresion de pesos o destilacion clasica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con modificacion EchoMoE; 48 capas, 128 expertos con 8 activos, hidden size 2.048 |
| Parametros totales | 28.229.523.456 (segun safetensors) |
| Parametros activos | 8 de 128 expertos por token (ratio no detallado en la informacion disponible) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en bf16; la model card menciona envio de dispatch y combine en FP8 como opcion de comunicacion, no cuantizacion de pesos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con remote code en transformers (custom_code) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-30B-A3B-Base, un transformer MoE de 48 capas con 128 expertos (8 activos por token) y hidden size de 2.048. Sobre esa base, el teacher McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher fue afinado con datos de instruccion de allenai/Dolci-Instruct-SFT. El checkpoint EchoMoE se obtiene por destilacion desde ese teacher sobre 4,3B tokens (mezcla que incluye allenai/dolma3_dolmino_mix-10B-1025), entrenando todos los pesos.

La innovacion tecnica central es la comunicacion comprimida entre etapas de expertos: en lugar de transmitir cada estado oculto completo, se envia una diferencia respecto a un estado de referencia refrescado cada 4 capas, codificada en 512 dimensiones para el dispatch y 768 para el combine. Esto reduce los bytes intercambiados entre nodos en un 58%. La model card reporta resultados de precision con vLLM 0.21 y un plugin EchoMoE, y de throughput con el runtime de expert-parallel del repositorio sobre vLLM 0.29 con DeepEP. La carga en transformers 5.8.1 se realiza mediante remote code incluido en el repositorio.

## Capacidades
- Generacion de texto conversacional en ingles, con plantilla de chat compatible con Qwen3.
- Razonamiento y conocimiento general (evaluado en el bloque "Knowledge and reasoning").
- Matematicas (bloque "Math" de la evaluacion).
- Generacion de codigo (bloque "Code").
- Seguimiento de instrucciones (bloque "Instruction following").
- Serving distribuido con paralelismo de expertos mediante plugin para vLLM y runtime propio con DeepEP.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso
- Serving de modelos MoE en clusters multi-nodo con red limitada: el modelo esta disenado para reducir el trafico entre nodos, por lo que resulta adecuado cuando el ancho de banda RDMA o TCP es el cuello de botella. En el escenario de enlace RDMA 2,5 veces mas lento, la model card reporta una mejora de throughput del 42,1% en BF16.
- Despliegue en entornos con interconexion TCP: con 8 peticiones por GPU y carga 4.096 a 256 tokens, la mejora reportada es del 93,2% en BF16 y 115,6% en FP8, lo que lo hace util en clusters sin RDMA.
- Investigacion sobre compresion de comunicacion en MoE: sirve como checkpoint de referencia para reproducir los experimentos de EchoMoE y comparar variantes de referencia cada N capas y dimensiones de codigo.
- Evaluacion de precision bajo destilacion: permite medir la degradacion (3,8 puntos de media en 18 benchmarks) frente al teacher y analizar por dominio donde la compresion penaliza mas (codigo, -4,8 puntos).
- Chatbot de proposito general en ingles: con contexto de 32.768 tokens y ajuste sobre Dolci-Instruct-SFT, puede gestionar conversaciones multi-turno de dominio general.
- Prototipado en una sola GPU: los pesos en bf16 caben en una GPU de 80 GB mediante transformers con remote code, lo que facilita pruebas sin infraestructura multi-nodo.
- Benchmarking de goodput en serving online: la model card reporta 1,48x el goodput del modelo sin comprimir en serving de prompts reales, util para comparar configuraciones de despliegue.

## Benchmarks y rendimiento
Media (%) sobre 18 benchmarks por dominio, con el cambio respecto al teacher entre parentesis:

| Dominio | Teacher | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Knowledge and reasoning | 77,6 | 73,6 (-4,0) | 73,5 (-4,1) |
| Math | 50,7 | 47,2 (-3,5) | 47,5 (-3,2) |
| Code | 59,2 | 54,4 (-4,8) | 54,1 (-5,1) |
| Instruction following | 55,6 | 53,3 (-2,3) | 51,7 (-3,9) |
| **Average** | **66,9** | **63,1 (-3,8)** | **63,0 (-3,9)** |

Throughput: ganancia sobre el teacher sin comprimir, ambos servidos con vLLM 0.29 y DeepEP, expert parallel 32 sobre 4 nodos de 8 H100, asignacion de expertos balanceada.

| Carga (entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +10,5% | +11,6% |
| 1.024 → 128 | RDMA | 512 | +26,1% | +14,1% |
| 4.096 → 256 | RDMA | 128 | +22,6% | +12,4% |
| 16.384 → 512 | RDMA | 32 | +15,4% | +8,3% |
| 4.096 → 256 | RDMA, enlace 2x mas lento | 128 | +23,0% | +16,0% |
| 4.096 → 256 | RDMA, enlace 2,5x mas lento | 128 | +42,1% | +25,6% |
| 4.096 → 256 | TCP | 8 | +93,2% | +115,6% |

Cada fila RDMA corresponde al mayor batch medido. La ganancia se reduce con batches menores, hasta -5,8% en 128 → 1.024 tokens con 8 peticiones por GPU. En serving online de prompts reales, el modelo sostiene 1,48x el goodput del modelo sin comprimir.

## Requisitos de hardware
- VRAM para inferencia en bf16: los pesos completos (28,2B parametros) caben en una GPU de 80 GB mediante transformers con remote code, segun la model card.
- Serving multi-nodo: la configuracion de referencia usa expert parallel 32 sobre 4 nodos de 8 H100 (32 GPU en total) con DeepEP.
- Configuracion de un nodo: la model card indica que vLLM sirve el checkpoint en un nodo de 8 GPU con data-parallel-size 8 y expert-parallel activado.
- GPU consumer: no se documenta despliegue en GPU consumer (RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: vLLM 0.21 con plugin EchoMoE (precision), runtime expert-parallel del repositorio sobre vLLM 0.29 con DeepEP (throughput), y transformers 5.8.1 con remote code.
- Latencia y throughput: ganancias relativas reportadas en la tabla anterior; no se publican valores absolutos de tokens por segundo en la informacion disponible.
- Nota operativa: con vLLM, `--max-num-seqs 256` mantiene el arranque en pocos minutos, ya que la captura de CUDA graph crece con el numero de secuencias concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s4-r512-c768 | 28,2B totales, 8/128 expertos activos | 32.768 | Media 63,1 en 18 benchmarks; +22,6% throughput EP32 | Apache-2.0 | Hugging Face, remote code |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher (modelo sin comprimir) | 28,2B totales | 32.768 | Media 66,9 en 18 benchmarks | No disponible en la informacion proporcionada | Hugging Face (McGill-NLP) |
| Qwen3-30B-A3B-Base | 28,2B totales | No disponible | No disponible | No disponible en la informacion proporcionada | Hugging Face (Qwen) |

## Limitaciones y advertencias
- Perdida de precision: 3,8 puntos de media en 18 benchmarks frente al teacher, con mayor impacto en codigo (-4,8) y matematicas (-3,5).
- Ganancia de throughput condicionada: en batches pequenos la mejora puede desaparecer o volverse negativa (-5,8% en 128 → 1.024 tokens con 8 peticiones por GPU).
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado.
- Alcance de capacidades: no se documenta tool calling, agentes, vision ni modo thinking; no asumir estas capacidades en produccion.
- Complejidad operativa: requiere plugin propio para vLLM, remote code en transformers y, para throughput, el runtime del repositorio con DeepEP; no es un despliegue estandar.
- Madurez: checkpoint creado en noviembre de 2026 con 0 descargas y 0 likes en el momento de la ficha; validacion comunitaria limitada.
- Alucinacion y sesgos: no se documentan evaluaciones especificas de sesgo o tasa de alucinacion; al derivar de Qwen3 con datos Dolci, hereda los sesgos y riesgos del modelo base y del dataset, no cuantificados aqui.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las condiciones de los modelos y datasets de origen (Qwen3 y Dolci), cuyos terminos no se detallan en la informacion proporcionada.
- Referencia de paper pendiente: la model card incluye un TODO para el enlace arXiv, por lo que la descripcion metodologica completa puede no estar publicada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s4-r512-c768
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo teacher: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base original: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Dataset de instruccion: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Dataset de mezcla de pretraining: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-10B-1025
- Resultados de throughput: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
