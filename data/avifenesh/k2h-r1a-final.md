# Avifenesh/k2h-r1a-final

## Resumen

K2H R1a final es un ajuste por preentrenamiento continuado (continued pretraining) del modelo base IFM/K2-Horizon-MoVA-36B-A4B, un transformer de tipo Mixture of Experts con 36B parametros totales y unos 4B activos por token. Lo desarrolla el usuario Avifenesh y su objetivo es especializar el modelo en inferencia de LLM y ingenieria de sistemas ML: repositorios de kernels, Linux, historial de commits y discusiones de pull requests. El checkpoint publicado (step 800) es el ultimo de la ejecucion que supera todas las puertas de calidad definidas por el autor, incluida la de tool calling.

La relevancia practica del modelo esta en que mejora de forma medible en generacion de codigo (HumanEval de 53,1 a 66,5 pass@1; MBPP de 65,2 a 70,6) y reduce la perplejidad en PRs held-out (de 1,520 a 1,280) manteniendo practicamente intactas las capacidades generales del release: IFEval, GSM8K chat, MATH-500, MMLU, ARC-Challenge y BoolQ no muestran diferencias significativas tras correccion de Holm. Es, por tanto, un modelo pensado para tareas de ingenieria de sistemas y codigo de infraestructura, no un modelo generalista nuevo.

Conserva la misma arquitectura, tokenizer y plantilla de chat del base, con una longitud de contexto de 524.288 tokens. Los pesos se distribuyen en bf16 safetensors y requieren `trust_remote_code=True` para cargarse. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia K2 Horizon MoVA |
| Parametros totales | 37.444.792.020 (37,4B) |
| Parametros activos | Aproximadamente 4B por token |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16), libreria transformers con codigo custom (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de IFM/K2-Horizon-MoVA-36B-A4B y mantiene su arquitectura MoE, tokenizer y plantilla de chat sin cambios. El entrenamiento es un preentrenamiento continuado de 800 pasos con longitud de secuencia de 65.536 tokens y aproximadamente 786.000 tokens por paso, lo que suma unos 629 millones de tokens vistos. Se ejecuto con el trainer xLLM sobre FSDP2 en bf16, con 3 GPUs y el estado del optimizador descargado a memoria host. El optimizador es AdamW (betas 0,9 y 0,95), weight decay 0,06, gradient clipping 1,0, learning rate 5e-6 con 20 pasos de warmup y posteriormente constante.

La mezcla de datos se compone de un 40% de datos de dominio limpios (repositorios de inferencia y kernels, Linux, historial de commits del dataset `Avifenesh/k2h-corpus-domain-clean`, mas discusiones de PR y material de ingenieria no publicado), un 50% de replay verificado por script en texto plano (`Avifenesh/k2h-replay-verified`) y un 10% de chat verificado (`Avifenesh/k2h-chat-reasoning-verified`). Este ultimo bloque no se entrena con cross-entropy: se usa como ancla de release mediante una KL restringida (hinged KL, tau 0,05) sobre los tokens de respuesta, leyendo las top-64 log-probabilidades del release desde una cache precalculada, de modo que no se ejecuta ningun profesor durante el entrenamiento. A partir del paso 600, el replay de matematicas tambien incorpora el ancla junto a su cross-entropy.

## Capacidades

- Generacion de texto y razonamiento general, con modo de razonamiento activable (reasoning on) en las evaluaciones.
- Generacion de codigo, con mejora sustancial en Python (HumanEval y MBPP) y especializacion en codigo de sistemas: kernels, inferencia de LLM, Linux y tooling de infraestructura.
- Tool calling / function calling, evaluado con BFCL V4 (categorias live_multiple, irrelevance y agregado de live categories).
- Razonamiento matematico, evaluado en GSM8K (chat y few-shot) y MATH-500.
- Contexto largo: recuperacion tipo passkey de 16k a 131k tokens con 5/5 en todas las longitudes, y evaluacion RULER a 32k, 64k y 128k.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Asistencia en ingenieria de kernels e inferencia: el modelo puede generar y revisar codigo CUDA/Triton, configuraciones de servido y ajustes de rendimiento, gracias al 40% de datos de dominio de repositorios de inferencia y kernels y a la mejora de 13,4 puntos en HumanEval pass@1.
- Generacion de codigo en pipelines de CI/CD: con tool calling verificado en BFCL V4 y una tasa de HumanEval del 66,5 pass@1, puede integrarse como generador de parches o de tests en flujos automatizados donde se requiera llamada a funciones externas.
- Analisis de historial de commits y pull requests: el modelo reduce la perplejidad en PRs held-out de 1,520 a 1,280, lo que lo hace adecuado para resumir cambios, detectar regresiones en discusiones de PR o generar descripciones de commits.
- Razonamiento sobre repositorios completos: con 524.288 tokens de contexto y buen rendimiento en RULER a 64k y 128k, puede ingerir varios ficheros de un proyecto y responder preguntas cruzadas sobre la base de codigo.
- Agentes multi-paso para tareas de sistemas: la combinacion de tool calling, modo de razonamiento y contexto largo permite construir agentes que inspeccionan logs, ejecutan comandos y consultan documentacion en cadena.
- Tutorizacion o documentacion tecnica de Linux y tooling de sistemas: el corpus de dominio incluye Linux y material de ingenieria, por lo que el modelo puede explicar mecanismos del kernel, politicas de planificacion o comportamiento de herramientas de bajo nivel.
- Evaluacion de matematicas y razonamiento en formato chat: con GSM8K chat en 96,2 y MATH-500 en 97,4, es utilizable en asistentes que resuelven problemas paso a paso en conversacion.

## Benchmarks y rendimiento

Evaluacion pareada por pregunta contra el release, con los mismos prompts y muestreo. La tabla recoge release frente al step 800 y el valor p indicado por el autor.

| Tarea | Release | Step 800 | p |
|---|---:|---:|---:|
| IFEval prompt-strict, reasoning on, 2 runs agrupadas | 83,7 | 84,7 | 0,47 |
| GSM8K chat, reasoning on | 96,6 | 96,2 | 0,41 |
| MATH-500 chat, reasoning on | 98,2 | 97,4 | 0,34 |
| MMLU | 77,3 | 76,7 | 0,18 |
| ARC-Challenge | 57,6 | 57,9 | 0,63 |
| BoolQ | 88,4 | 88,4 | 1,0 |
| MBPP pass@1 | 65,2 | 70,6 | 0,0009 |
| HumanEval pass@1 | 53,1 | 66,5 | 0,002 |
| BFCL V4 live_multiple | 75,0 | 72,5 | 0,03 |
| BFCL V4 irrelevance | 87,5 | 86,7 | 0,79 |
| BFCL V4 all live categories | 76,9 | 76,1 | 0,35 |
| Held-out PR NLL (menor es mejor) | 1,520 | 1,280 | — |

Contexto largo con RULER (13 tareas, 8 muestras por tarea y longitud, pareado con el release):

| Longitud | Release | Step 800 | p |
|---|---:|---:|---:|
| 32k | 89,9 | 86,4 | 0,36 |
| 64k | 88,5 | 87,4 | 1,0 |
| 128k | 76,3 | 80,3 | 0,17 |

Remedicion del 2026-11-08 con 24 muestras por tarea (pareado, 312 items por longitud): 32k 85,3 frente a 90,4 (-5,1, p = 0,01); 64k 86,0 frente a 87,2 (-1,2, p = 0,26). La recuperacion en contexto largo a 32k es unos puntos mas debil que en el release. Passkey retrieval de 16k a 131k: 5/5 en todas las longitudes, igual que el release. GSM8K few-shot (5-shot completion) baja 2,4 puntos (90,2 a 87,9), interpretado por el autor como deriva en el formato de completion few-shot y no en matematicas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 75 GB solo para pesos (37,4B parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica requiere multiples GPUs o cuantizacion.
- El autor entreno con 3 GPUs y estado del optimizador en memoria host, lo que da una idea del orden de magnitud del despliegue.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo en bf16 encaja en configuraciones multi-GPU tipo A100 80GB o H100 80GB; no cabe en una unica GPU consumer.
- Cabe en consumer GPU solo si se cuantiza a 4 bits (aproximadamente 19-20 GB de pesos), aunque no se publican pesos cuantizados ni se documenta compatibilidad con llama.cpp u Ollama.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada. vLLM, TGI, llama.cpp u Ollama no se mencionan en la informacion disponible; la condicion de codigo custom puede requerir soporte especifico en cada runtime.
- Latencia y throughput: no disponibles.
- Muestreo recomendado: temperature 1.0, top_p 0.95.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| K2H R1a final (este) | 37,4B | ~4B | 524.288 | Apache 2.0 | Fine-tune de dominio para inferencia y sistemas ML |
| IFM/K2-Horizon-MoVA-36B-A4B (base) | 36B | ~4B | 524.288 | No disponible en la informacion proporcionada | Release original; referencia de todas las comparaciones pareadas |
| Avifenesh/k2h-s1-final | No disponible | No disponible | No disponible | No disponible | Modelo mas reciente del mismo autor, sin caida significativa en contexto largo segun la model card |

No se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Caida en contexto largo a 32k: la remedicion con 24 muestras por tarea da -5,1 puntos (p = 0,01) frente al release. Para tareas de recuperacion a 32k conviene considerar `Avifenesh/k2h-s1-final`, que segun el autor no presenta esta caida.
- BFCL V4 live_multiple baja 2,5 puntos (75,0 a 72,5, p = 0,03). El agregado de live categories no muestra diferencia significativa (76,1 frente a 76,9, p = 0,35), pero el tool calling en escenarios multiple no queda intacto.
- GSM8K few-shot completion cae 2,4 puntos (90,2 a 87,9); el razonamiento matematico en formato chat se mantiene.
- El step 1000 de la misma ejecucion obtiene mejores resultados generales y mejor PR NLL (1,273), pero pierde 3,6 puntos en BFCL live_multiple (p = 0,0015); el autor descarta ese checkpoint como final.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no hay evaluacion multilingue en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base IFM/K2-Horizon-MoVA-36B-A4B, cuya licencia no se detalla en la informacion proporcionada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo custom del repositorio; auditar antes de desplegar en produccion.
- Parte del corpus de dominio (discusiones de PR y material de ingenieria) no esta publicado, lo que limita la reproducibilidad exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/k2h-r1a-final
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Dataset de dominio limpio: https://huggingface.co/datasets/Avifenesh/k2h-corpus-domain-clean
- Dataset de replay verificado: https://huggingface.co/datasets/Avifenesh/k2h-replay-verified
- Dataset de chat verificado: https://huggingface.co/datasets/Avifenesh/k2h-chat-reasoning-verified
- Modelo mas reciente del mismo autor: https://huggingface.co/Avifenesh/k2h-s1-final
