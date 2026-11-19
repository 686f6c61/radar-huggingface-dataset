# MinimaLabs/KLM-1.6

## Resumen

KLM 1.6 es un modelo de lenguaje base de 99 millones de parametros desarrollado por MinimaLabs. Se trata de una actualizacion incremental de KLM 1.5 que retoma el entrenamiento desde un checkpoint previo a la fase de decaimiento del learning rate y extiende esa fase de 20B a 100B tokens. El modelo resuelve el problema de obtener capacidades linguisticas y de razonamiento basicas en un presupuesto computacional muy reducido, compitiendo directamente con modelos del rango de 90M a 230M de parametros.

La arquitectura es hibrida: combina capas de Gated DeltaNet-2 (un mecanismo recurrente con estado) y atencion clasica en una proporcion 3:1, con 24 capas, tamano oculto de 512 y un vocabulario de solo 4.100 tokens. Incorpora ademas una memoria de n-gramas aprendida (125.000 bigramas y 38.000 trigramas) y Block Attention Residuals. El contexto es de 2.048 tokens.

Es relevante ahora porque, segun la Open SLM leaderboard, su Intelligence Index de 33,95 lo situa primero entre todos los modelos de menos de 100M, 150M y 250M de parametros, superando a SmolLM2-135M o LFM-2.5-230M-Base. Se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet-2 y atencion en proporcion 3:1, con Block Attention Residuals y memoria de n-gramas |
| Parametros totales | 98.975.308 (de los cuales 5.411.832 corresponden a la memoria de n-gramas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16; el modelo es compatible con cuantizacion via Transformers, pero no se documentan formatos oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido de 24 capas que intercala bloques de Gated DeltaNet-2 (4 cabezas de 128) con bloques de atencion clasica (8 cabezas de query, 4 de KV, tamano de cabeza 64, RoPE, QK-norm y output gate) en una proporcion 3:1. El tamano oculto es 512 y la feed-forward usa SwiGLU con tamano oculto 1.408. Los embeddings estan atados a la salida (tied embeddings) y el vocabulario es de solo 4.100 tokens. Ademas de la parte recurrente y de atencion, el modelo incorpora una memoria de n-gramas con 125.000 bigramas y 38.000 trigramas, cada uno con su propio vector aprendido, y usa Block Attention Residuals en las conexiones residuales.

El entrenamiento se realizo en tres fases sobre secuencias de 2.048 tokens: una fase de calentamiento por superposicion de 70.000 pasos usando Token-Superposition Training (cada posicion de entrada es la media de 7 tokens consecutivos y el modelo predice los siguientes 7 como grupo no ordenado, cubriendo 128B tokens de ClimbMix con el coste de unos 18B), una fase estable de 80B tokens con learning rate constante y una fase de decaimiento de 100B tokens con curva 1−√t. Las matrices de pesos se entrenaron con MuonEq-R a learning rate 0,01 y los embeddings, normas y compuertas con AdamW a 3e-3, todo en bf16. La atencion esta enmascarada en los limites de documento y se reinician el estado recurrente y el historial de n-gramas en cada frontera. Los datos combinan web (ClimbMix, TxT360-v2, UltraX), Q&A (TxT360-v2, Dolmino), libros de texto (Cosmopedia v2, WikiHow), matematicas (OpenMathInstruct-2, UltraData-Math, Math-Reasoning, TinyMATH, TinyGSM-MIND, CraneMath), ciencia web (Dolmino), sentido comun (DCLM-baseline filtrado, ATOMIC 2020, ANLI, GLUCOSE, CREAK, SciQ, QASC) y reescrituras de razonamiento (Pretrain-Behaviors).

## Capacidades

- Generacion de texto autoregresiva y continuacion de texto en ingles.
- Razonamiento basico y respuesta a preguntas de sentido comun, ciencia elemental y matematicas simples (segun los benchmarks publicados).
- Aritmetica de varios pasos evaluada con ArithMark-3 (55,90% zero-shot).
- Tokenizer preparado para chat y razonamiento: `<|im_start|>`, `<|im_end|>`, `<think>` y `</think>` son tokens unicos, listos para ajuste fino en formato conversacional o de cadena de pensamiento.
- No es un modelo instruct: no sigue instrucciones ni mantiene conversaciones sin ajuste fino previo.
- Soporte de tool calling / function calling: no disponible de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa (solo mediante ajuste fino).
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: memoria de n-gramas aprendida y estado recurrente Gated DeltaNet-2; sin vision ni audio.

## Casos de uso

- Ajuste fino para clasificacion de texto y analisis de sentimiento: con 99M de parametros y licencia Apache 2.0, se puede reentrenar en una unica GPU consumer para tareas de etiquetado sobre dominios especificos (resenas, tickets, correos) sin coste de licencia.
- Generacion de texto asistida en el navegador o en dispositivos de borde: el modelo corre en CPU con PyTorch estandar y pesa unos 0,4 GB en bf16, lo que permite integrarlo en aplicaciones de escritorio o extensiones sin infraestructura GPU.
- Prototipado rapido de pipelines de NLP: sirve como baseline barato para comparar tecnicas de tokenizacion, arquitecturas hibridas o estrategias de decaimiento del learning rate antes de escalar a modelos mayores.
- Educacion e investigacion sobre arquitecturas hibridas: al combinar Gated DeltaNet-2, atencion y memoria de n-gramas en un modelo pequeno, es util para estudiar el impacto de cada componente con recursos limitados.
- Generacion de datos sinteticos y aumentacion: puede continuar textos y plantillas en ingles para crear corpus de entrenamiento o de evaluacion a gran escala con coste minimo.
- Ajuste fino para tareas de matematicas escolares: dado su rendimiento en ArithMark-3 (55,90%), es una base razonable para tutores automaticos o generadores de problemas aritmeticos tras un ajuste supervisado.
- Experimentacion con decodificacion y evaluacion: su tamano permite ejecutar barridos de hiperparametros, comparaciones de tokenizers y pruebas de robustez en CPU en minutos.

## Benchmarks y rendimiento

Resultados zero-shot con precision normalizada por longitud, segun la model card:

| Modelo | Parametros | ARC-Easy | ARC-Challenge | HellaSwag | PIQA | ArithMark-3 |
|---|---|---|---|---|---|---|
| KLM 1.6 | 99,0M | 61,07% | 33,53% | 45,28% | 70,18% | 55,90% |
| KLM 1.5 | 99,0M | 59,68% | 32,68% | 43,74% | 68,55% | 48,20% |
| GPT-X3-150M | 149M | 59,64% | 31,31% | 46,16% | 71,33% | 50,90% |
| SmolLM2-135M | 135M | 58,63% | 29,69% | 43,22% | 68,44% | 39,20% |
| LFM-2.5-230M-Base | 230M | 59,72% | 34,98% | 39,29% | 63,38% | 36,60% |
| void.1 | 90,1M | 49,32% | 29,35% | 39,46% | 67,19% | 43,70% |

Segun la Open SLM leaderboard (a fecha 2026-11-09), el Intelligence Index de KLM 1.6 es 33,95, el mas alto entre modelos de menos de 100M, 150M y 250M de parametros; solo dos modelos de cualquier tamano lo superan, ambos de unos 360M.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en bf16 (99M parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 1 GB o mas.
- GPU recomendadas: cualquier GPU moderna sirve; para throughput alto, A100, H100 o L40S permiten batchear muchas secuencias. En consumer, RTX 3060, RTX 4060, RTX 4090 o incluso iGPU son suficientes.
- Cabe en GPU consumer: si, en practicamente todas, incluidas GTX 1650 o superiores; tambien corre en CPU sin paquetes adicionales mas alla de Transformers.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere `custom_code`); vLLM, llama.cpp, Ollama y TGI no estan documentados como soportados en la informacion disponible, dado que la arquitectura es personalizada.
- Latencia y throughput: no disponible (no se publican cifras oficiales).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KLM 1.6 | 99,0M | 2.048 | Apache 2.0 | Hugging Face | Hibrido Gated DeltaNet-2 + atencion, memoria de n-gramas, solo ingles |
| SmolLM2-135M | 135M | 8.192 (segun su model card publica) | Apache 2.0 | Hugging Face | Transformer denso, familia con version instruct, multilingue limitado |
| LFM-2.5-230M-Base | 230M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Base de LiquidAI, mayor tamano y menor ArithMark-3 |
| GPT-X3-150M | 149M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Mejor HellaSwag y PIQA que KLM 1.6, peor ARC y ArithMark-3 |
| void.1 | 90,1M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Menor rendimiento global en la tabla publicada |

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversaciones; requiere ajuste fino para cualquier uso conversacional o de agente.
- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea muy pobre.
- Contexto de solo 2.048 tokens, insuficiente para documentos largos, resumenes extensos o conversaciones multi-turno prolongadas.
- Vocabulario muy reducido (4.100 tokens), lo que puede penalizar la eficiencia en la codificacion de texto y aumentar la longitud efectiva de las secuencias.
- Riesgo de alucinacion y de generar contenido factualmente incorrecto, especialmente en dominios no cubiertos por los datos de entrenamiento.
- Sesgos potenciales heredados de los corpus web utilizados (ClimbMix, DCLM-baseline, UltraX) y de las reescrituras sinteticas; no se documenta ninguna evaluacion de sesgo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo no incluye salvaguardas de seguridad ni filtros de contenido; cualquier despliegue en produccion debe anadir moderacion externa.
- La arquitectura es personalizada (`custom_code`), por lo que el ecosistema de herramientas (vLLM, llama.cpp, TGI) puede no soportarla sin adaptaciones; verificar compatibilidad antes de disenar un despliegue.
- No se publican cifras de latencia, throughput ni evaluaciones de robustez fuera de los benchmarks listados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MinimaLabs/KLM-1.6
- KLM 1.5: https://huggingface.co/MinimaLabs/KLM-1.5
- Open SLM leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset ArithMark-3.0: https://huggingface.co/datasets/AxiomicLabs/ArithMark-3.0
- Paper Token-Superposition Training: https://arxiv.org/abs/2605.06546
- Paper Block Attention Residuals: https://arxiv.org/abs/2603.15031
- Dataset ClimbMix: https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix
- Dataset TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset UltraX: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset Dolmino: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
- Dataset Cosmopedia v2: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset Math-Reasoning: https://huggingface.co/datasets/IFM/Math-Reasoning
- Dataset DCLM-baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset Pretrain-Behaviors: https://huggingface.co/datasets/IFM/Pretrain-Behaviors
- Modelo comparable SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Modelo comparable LFM-2.5-230M-Base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Modelo comparable GPT-X3-150M: https://huggingface.co/AxiomicLabs/GPT-X3-150M
- Modelo comparable void.1: https://huggingface.co/dotlabs/void.1
