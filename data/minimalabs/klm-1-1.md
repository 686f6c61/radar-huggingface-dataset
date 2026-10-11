# MinimaLabs/KLM-1.1

## Resumen

KLM 1.1 es un modelo de lenguaje base (no instruido) de 88,1 millones de parametros desarrollado por MinimaLabs. Se trata del entrenamiento continuado de KeyLM-75M: conserva integramente la arquitectura de su predecesor y solo crece en las capas de embedding y de salida al ampliar el vocabulario de 12.020 a 24.576 tokens. El resultado es un modelo de tipo decoder-only estilo Llama/Qwen3, con 24 capas, tamano oculto 512, atencion GQA de 8 cabezas de consulta y 2 de clave/valor, RoPE, SwiGLU y QK-RMSNorm por cabeza.

El problema que aborda es el de los modelos pequenos de alta eficiencia: KLM 1.1 busca exprimir al maximo una arquitectura diminuta mediante mas datos y mejores mezclas, sin cambiar el diseno. Frente a los ~18,7B tokens de KeyLM-75M, KLM 1.1 acumula unos 138,6B tokens de entrenamiento en tres etapas, precedidas de una expansion del tokenizer. El resultado es una subida de 10,44 a 17,40 en el Open SLM Intelligence Index, lo que lo lleva del puesto 38 al puesto 9 entre los modelos de menos de 100M de parametros de ese ranking.

La relevancia actual del modelo es doble. Por un lado, demuestra empiricamente cuanto rendimiento se puede recuperar de un modelo pequeno solo con datos y un schedule de learning rate adecuado (warmup-stable-decay). Por otro, su licencia Apache 2.0 y su tamano (~176 MB en fp16) lo convierten en un candidato realista para fine-tuning, experimentacion academica y despliegue en hardware muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama/Qwen3 (GQA, RoPE, SwiGLU, QK-RMSNorm) |
| Parametros totales | 88.108.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors; cuantizable con herramientas externas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales de arquitectura: 24 capas, hidden size 512, 8 cabezas de consulta y 2 cabezas KV (GQA), QK-RMSNorm por cabeza, vocabulario de 24.576 tokens. Tamano del repositorio: 0,4 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only sin modificaciones respecto a KeyLM-75M. Se mantienen las 24 capas, el hidden size de 512, la atencion con grouped-query attention (8 query heads / 2 KV heads), RoPE para posiciones, SwiGLU en las MLP y QK-RMSNorm por cabeza. El unico cambio estructural es el crecimiento del vocabulario, que pasa de 12.020 a 24.576 tokens, lo que eleva el total de parametros de 75,3M a 88,1M. Los 12.299 merges BPE nuevos se aprendieron sobre la mezcla de entrenamiento y cada token nuevo se inicializo como la media de los tokens antiguos a los que reemplaza; el vocabulario mayor codifica el mismo texto en 1,31-1,41 veces menos tokens, con el ahorro mayor en codigo y matematicas.

El entrenamiento se dividio en tres etapas continuadas desde los pesos de KeyLM-75M. Primero, una etapa de expansion del tokenizer con 20,0B tokens sobre un mix de web (UltraX Ultra-FineWeb, 80%), matematicas (UltraData-Math, 15%) y codigo (Code-Reasoning, 5%). Despues, una continuacion corta de 5,0B tokens con el mismo mix y learning rate recalentado. Por ultimo, una continuacion larga de 94,9B tokens con un schedule warmup-stable-decay: learning rate de 3e-5 mantenido durante el 80% del run (75,9B tokens) y decaimiento lineal hasta el 10% del pico en el 20% final (19,0B tokens). La fase de decaimiento uso una mezcla mas cargada de matematicas y libros de texto (DCLM-baseline 20%, FineWeb-Edu deduplicado 25%, Cosmopedia v2 20%, UltraData-Math L2 11%, UltraData-Math L3 6%, OpenMathInstruct-2 8%, Pretrain-Behaviors 8%, Code-Reasoning 2%). El optimizador fue AdamW (betas 0,9/0,95, weight decay 0,1) con estado arrastrado entre etapas, precision bf16 autocast sobre pesos fp32 y gradient clipping de 1,0. El filtrado previo elimino documentos ya vistos, repeticiones exactas, documentos vacios y cualquier documento que compartiera una secuencia de 13 palabras con los cinco conjuntos de evaluacion. La perdida held-out en la continuacion larga bajo de 2,131 a 1,814 nats por token. No se aplico RLHF ni DPO: es un modelo puramente preentrenado.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base, sin ajuste de instrucciones.
- Razonamiento aritmetico basico, reflejado en 35,80% en ArithMark-3.
- Comprension lectora y sentido comun a nivel de modelo diminuto (HellaSwag 33,65%, PIQA 64,80%).
- Conocimiento cientifico elemental (ARC-Easy 44,36%, ARC-Challenge 25,17%).
- Base solida para fine-tuning supervisado y para posteriores etapas de ajuste con instrucciones.
- Soporte de tool calling / function calling: no disponible (modelo base, sin entrenamiento de instrucciones ni de agentes).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; solo via fine-tuning.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: modo thinking, vision o audio no disponibles. No hay decodificacion especulativa ni atencion lineal documentadas.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (tags del repositorio).

## Casos de uso

- Fine-tuning para clasificacion o extraccion de informacion: con 88M de parametros y 0,4 GB de repositorio, se puede reentrenar en una unica GPU consumer o incluso en CPU con paciencia, y sirve como cabecera ligera para tareas de NLP clasicas.
- Experimentacion academica y ablaciones: es un banco de pruebas barato para estudiar schedules de learning rate, expansion de tokenizers o mezclas de datos, ya que existen los checkpoints previos de KeyLM-75M para comparar.
- Despliegue en el borde (edge) y en dispositivos con recursos minimos: al ocupar del orden de 176 MB en fp16 y ~44 MB en una cuantizacion de 4 bits, cabe en una Raspberry Pi, en un movil de gama media o en un microcontrolador con NPU, cubriendo autocompletado o generacion corta.
- Generacion de texto de dominio acotado tras ajuste: completado de descripciones de producto, resumenes de tickets o normalizacion de campos, siempre que se haga fine-tuning especifico porque el modelo base no sigue instrucciones.
- Prototipado rapido de pipelines de inferencia: sirve para validar integraciones con text-generation-inference, vLLM o llama.cpp antes de escalar a modelos mayores, con coste de GPU practicamente nulo.
- Investigacion sobre tokenizers: el modelo documenta explicitamente el impacto de pasar de 12.020 a 24.576 tokens con un ahorro de 1,31-1,41x en longitud de secuencia, lo que lo hace util como caso de estudio reproducible.
- Baseline en rankings de modelos pequenos: al colocarse en el puesto 9 de la Open SLM leaderboard en la franja sub-100M, funciona como referencia para medir el progreso de otros modelos diminutos.
- Educacion y demos docentes: la relacion entre 88M de parametros, 138,6B tokens y el coste de entrenamiento asociado lo convierte en un ejemplo didactico manejable para explicar el ciclo completo de preentrenamiento.

## Benchmarks y rendimiento

Todos los resultados son zero-shot. ARC, HellaSwag y PIQA se evaluan con lm-eval 0.4.12 y exactitud normalizada por longitud; ArithMark-3 usa el script oficial de ArithMark-3.0. El harness del autor reproduce los numeros publicados de KeyLM-75M con una desviacion de mas/menos 0,17 puntos por tarea.

| Metrica | KeyLM-75M | KLM 1.1 |
|---|---|---|
| Open SLM Intelligence Index | 10,44 | 17,40 |
| Puesto en <100M | #38 | #9 |
| HellaSwag | 29,66% | 33,65% |
| ARC-Easy | 35,73% | 44,36% |
| ARC-Challenge | 23,98% | 25,17% |
| PIQA | 60,50% | 64,80% |
| ArithMark-3 | 30,10% | 35,80% |
| Parametros | 75,3M | 88,1M |
| Vocabulario | 12.020 | 24.576 |
| Tokens de entrenamiento | ~18,7B | ~138,6B en total |

Progreso por etapas de entrenamiento (Int Index del harness propio del autor):

| Etapa | Tokens | Cambio | Int Index tras la etapa |
|---|---|---|---|
| KeyLM-75M (inicio) | 18,7B | - | 10,47 |
| Expansion del tokenizer | 20,0B | Vocabulario de 12.020 a 24.576; web, matematicas y codigo | 15,15 |
| Continuacion corta | 5,0B | Mismo mix, learning rate recalentado | 15,52 |
| Continuacion larga | 94,9B | Nuevo mix, schedule warmup-stable-decay | 17,40 |

No se han publicado en la informacion disponible resultados de benchmarks para este modelo frente a alternativas externas como SmolLM, Qwen o Pythia.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,18 GB en fp16 (176 MB), ~0,09 GB en int8 (88 MB) y ~0,04 GB en int4 (44 MB), solo para pesos; sumar el cache KV, que con 24 capas, 2 KV heads y cabeza de 64 dimensiones es muy reducido.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente. Funciona sobradamente en RTX 4090, RTX 3060, GTX 1650, T4, A100 o H100; tambien en iGPU moderna y en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos diez anos, y tambien en Raspberry Pi, moviles y sistemas embebidos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag explicito), endpoints compatibles y, al ser un transformer estandar, vLLM, SGLang, llama.cpp u Ollama siempre que se genere primero una conversion a GGUF (no incluida en el repositorio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, en una GPU moderna se espera un throughput muy alto incluso con batch grande, aunque no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de terceros en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| KLM 1.1 (MinimaLabs) | 88,1M | no disponible | Ingles | Apache 2.0 | safetensors | Base, puesto 9 en Open SLM <100M |
| KeyLM-75M (MinimaLabs) | 75,3M | no disponible | Ingles | Apache 2.0 | safetensors | Predecesor directo, puesto 38 en el mismo ranking |
| SmolLM-135M (HuggingFaceTB) | 135M | no disponible | Ingles | Apache 2.0 | safetensors, GGUF | Familia de modelos pequenos; usado como fuente de datos (smollm-corpus) |
| Qwen2.5-0.5B (Alibaba) | ~494M | no disponible | Multilingue | Apache 2.0 | safetensors, GGUF | Orden de magnitud mayor en parametros; el tag qwen3 del repo indica estilo arquitectonico, no equivalencia |

Comparativa de rendimiento entre estos modelos: no disponible en la informacion proporcionada; el unico dato relativo es el puesto 9 en la Open SLM leaderboard para la franja de menos de 100M de parametros.

## Limitaciones y advertencias

- Es un modelo base preentrenado, sin RLHF ni DPO: no sigue instrucciones, no responde a formatos de chat y no debe usarse directamente como asistente conversacional.
- Riesgo alto de alucinacion: con 88M de parametros y entrenamiento casi exclusivamente zero-shot sobre texto web y libros de texto, la fidelidad factual es limitada.
- Solo ingles: la model card declara unicamente el idioma en; el rendimiento en castellano u otros idiomas no esta evaluado y previsiblemente sera pobre.
- Longitud de contexto no documentada: no hay dato publicado sobre la ventana maxima soportada, lo que complica su uso en tareas que dependan de contexto largo.
- Sesgos: los corpus de origen (DCLM-baseline, FineWeb-Edu, Reddit-adyacentes en el predecesor) introducen sesgos de genero, raza, religion y vision del mundo propios de texto web sin depuracion semantica; el filtrado aplicado fue solo de deduplicacion y contaminacion, no de sesgo.
- Capacidad de razonamiento limitada: los benchmarks publicados (ARC-Challenge 25,17%, HellaSwag 33,65%) estan muy por debajo de modelos de varios miles de millones de parametros; no es adecuado para tareas que exijan razonamiento complejo.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y sin garantias; no hay clausulas de uso aceptable adicionales documentadas.
- Ausencia de cuantizaciones oficiales: no se publican ficheros GGUF, AWQ, GPTQ ni MLX; quien quiera desplegarlo en llama.cpp u Ollama debe generarlos por su cuenta.
- Madurez del proyecto: el modelo tiene 0 descargas y 1 "like" en el momento de la consulta, y la fecha de creacion registrada (2026-10-10) indica un lanzamiento muy reciente; no hay ecosistema, herramientas ni soporte comunitario consolidados.
- Sin garantia de reproduccion independiente: todos los numeros de benchmark provienen del harness del propio autor; no se han verificado por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MinimaLabs/KLM-1.1
- Dataset UltraX-Preview (FineWeb): https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset Code-Reasoning: https://huggingface.co/datasets/IFM/Code-Reasoning
- Dataset DCLM-baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset smollm-corpus (FineWeb-Edu dedup, Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset Pretrain-Behaviors: https://huggingface.co/datasets/IFM/Pretrain-Behaviors
- Script de evaluacion ArithMark-3.0: https://huggingface.co/datasets/AxiomicLabs/ArithMark-3.0
- Paper, blog, repositorio o demo oficiales: no disponible en la informacion proporcionada.
- El resto de resultados de la busqueda web no guardan relacion con el modelo y se han descartado por no ser fuentes tecnicas relevantes.
