# Avifenesh/k2h-s1-final

## Resumen

K2H S1 final es un ajuste fino por entrenamiento continuado del modelo MoE IFM/K2-Horizon-MoVA-36B-A4B (36B parametros totales, unos 4B activos), orientado a inferencia de LLM e ingenieria de sistemas de machine learning. Lo publica el usuario Avifenesh como continuacion de su run anterior k2h-r1a-final, del que hereda arquitectura, tokenizer y plantilla de chat sin modificaciones. El checkpoint corresponde al paso 150 de una segunda etapa de entrenamiento y sustituye a k2h-r1a-final como ultima version del proyecto.

El objetivo declarado es especializar el modelo en codigo y sistemas de inferencia manteniendo el nivel general de instrucciones y tool calling del release original. Para ello combina datos de dominio limpio, replay verificado, chat verificado con un ancla KL contra el release, un pequeno porcentaje de chat de resultados de ingenieria y un ancla de tool calling basada en log-probabilidades precalculadas. La ventana de contexto se mantiene en 524.288 tokens, según indica la model card.

La relevancia practica esta en las ganancias medidas en generacion de codigo (HumanEval de 53,1 a 68,9; MBPP de 65,2 a 72,2) sin degradaciones significativas en IFEval, GSM8K, MATH-500, MMLU ni BFCL V4, aunque con posibles perdidas de unos pocos puntos en recuperacion de contexto largo a 32k-64k. La licencia es Apache-2.0 y los pesos se distribuyen en bf16 safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) sobre transformer, heredada de IFM/K2-Horizon-MoVA-36B-A4B |
| Parametros totales | 37.444.792.020 (~37,4B) |
| Parametros activos | ~4B (A4B, según model card) |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un MoE de aproximadamente 37,4B parametros totales con unos 4B activos por token, construido sobre el checkpoint IFM/K2-Horizon-MoVA-36B-A4B con la misma arquitectura, tokenizer y plantilla de chat. No se documentan en la informacion disponible detalles internos de la arquitectura (numero de expertos, tipo de atencion, capas) mas alla de la etiqueta MoE y la ventana de 524.288 tokens.

El entrenamiento consta de dos etapas. La etapa 1 (R1a) partio de los pesos del release y realizo 1.000 pasos con unos 786M tokens de datos de dominio limpio, replay verificado por script y un ancla KL contra el release. La etapa 2, que produce este checkpoint, ejecuta 150 pasos a longitud de secuencia 65.536 con unos 786k tokens por paso (~118M tokens), usando xLLM con FSDP2 en bf16 sobre 3 GPUs y estado del optimizador descargado a memoria host. El optimizador es AdamW (0,9, 0,95), weight decay 0,06, gradient clip 1,0, learning rate 5e-6 con 10 pasos de warmup y decaimiento lineal hasta 0,1x en los ultimos 50 pasos.

La mezcla de datos es 97% la mezcla de la etapa 1 escalada (dominio limpio, replay verificado y chat verificado con ancla KL sobre tokens de respuesta, tau 0,05), 2% chat de resultados de ingenieria construido a partir de recibos de experimentos (no publicado) y 1% ancla de tool calling en modo solo KL sobre 8.787 respuestas del release a prompts de Team-ACE/ToolACE y glaiveai/glaive-function-calling-v2, decontaminadas contra BFCL V4. El ancla lee las top-64 log-probabilidades del release desde una cache precalculada, sin profesor en linea durante el entrenamiento.

## Capacidades

- Generacion de texto y razonamiento general, con modo de razonamiento activable en las evaluaciones (reasoning on).
- Generacion de codigo en Python y tareas de programacion competitiva y funcional, con mejora sustancial medida en HumanEval y MBPP.
- Matematicas: GSM8K y MATH-500 en formato chat con razonamiento activado.
- Tool calling y function calling: se mantiene a nivel del release en BFCL V4 (categorias live, non-live, multi-turn, live_multiple e irrelevance).
- Seguimiento de instrucciones estricto (IFEval prompt-strict).
- Contexto largo: recuperacion hasta 128k segun RULER, con posible degradacion leve a 32k-64k frente al release.
- Conocimiento general y QA (MMLU, ARC-Challenge, BoolQ).
- No se documentan capacidades de vision, audio ni otros modos en la informacion disponible.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para autocompletar, refactorizar o generar tests, apoyandose en la mejora medida en HumanEval (68,9 pass@1) y MBPP (72,2 pass@1) frente al release.
- Asistentes de ingenieria de inferencia: dado su entrenamiento en sistemas de LLM, puede responder consultas sobre configuracion de servidores, optimizacion de throughput, cuantizacion y despliegue, usando su contexto de hasta 524.288 tokens para incorporar documentacion y trazas completas.
- Agentes con tool calling: su rendimiento en BFCL V4 (76,9 en categorias live en el release, 75,7 en este checkpoint) lo hace apto para orquestar APIs y funciones en flujos multi-paso, con la cautela de la ligera bajada en multi-turn (55,9 a 52,3, no significativa).
- Analisis de repositorios y code review: con contexto largo puede procesar varios ficheros y diffs en una sola ventana para detectar regresiones o proponer cambios, aunque conviene validar la recuperacion a 32k-64k por la posible perdida de unos puntos.
- Razonamiento matematico asistido: resolucion de problemas tipo GSM8K y MATH-500 en formato chat con razonamiento activado, adecuado para tutoria o generacion de soluciones paso a paso.
- Extraccion y resumen sobre documentos largos: la ventana de 524.288 tokens permite resumir informes extensos o concatenar historiales, con la advertencia de que la recuperacion exacta a 32k-64k puede ser algo inferior al release.
- Evaluacion de experimentos de ML: el modelo fue entrenado con un 2% de chat de resultados de ingenieria, por lo que puede ayudar a interpretar resultados medidos, aunque su juicio de dominio es equivalente al del release y no mejora con este checkpoint.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados por pregunta contra el release con los mismos prompts y muestreo:

| Tarea | Release | Step 150 | p |
|---|---:|---:|---:|
| IFEval prompt-strict, reasoning on, 2 runs agrupados | 83,7 | 84,9 | 0,33 |
| GSM8K chat, reasoning on | 96,6 | 96,9 | 0,48 |
| MATH-500 chat, reasoning on | 98,2 | 98,0 | 1,0 |
| MMLU | 77,3 | 77,3 | 0,94 |
| ARC-Challenge | 57,6 | 57,8 | 0,88 |
| BoolQ | 88,4 | 88,1 | 0,39 |
| MBPP pass@1 | 65,2 | 72,2 | < 0,001 |
| HumanEval pass@1 | 53,1 | 68,9 | < 0,001 |
| BFCL V4 all live categories | 76,9 | 75,7 | 0,15 |
| BFCL V4 all non-live categories | 73,8 | 72,1 | 0,15 |
| BFCL V4 multi-turn | 55,9 | 52,3 | 0,54 |
| BFCL V4 live_multiple | 75,0 | 72,7 | 0,052 |
| BFCL V4 irrelevance | 87,5 | 85,4 | 0,27 |
| Held-out PR NLL (menor es mejor) | 1,520 | 1,269 | |

Contexto largo (RULER, 13 tareas, emparejado con el release; 24 muestras por tarea a 32k y 64k, 8 a 128k):

| Longitud | Release | Step 150 | p |
|---|---:|---:|---:|
| 32k | 90,4 | 86,8 | 0,066 |
| 64k | 87,2 | 81,3 | 0,26 |
| 128k | 76,3 | 81,6 | 0,064 |

GSM8K few-shot (5-shot completion) baja 2,3 puntos (90,2 a 88,0, p = 0,01). Frente a k2h-r1a-final (paso 800 de la etapa 1): BFCL practicamente igual, IFEval ligeramente superior (84,9 vs 84,7), HumanEval (68,9 vs 66,5) y MBPP (72,2 vs 70,6) superiores, PR NLL menor (1,269 vs 1,280); RULER igual a 32k y 4,7 puntos inferior a 64k (p = 0,02 emparejado).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: no disponible de forma oficial; por el tamano de pesos (37,4B parametros), el repo ocupa 74,9 GB y requiere agregacion de memoria suficiente para cargar el checkpoint completo.
- Al ser MoE con ~4B parametros activos, el coste computacional por token es menor que el de un denso de 37B, pero la memoria necesaria para los pesos sigue siendo la del total.
- GPU recomendadas: no especificadas en la informacion disponible; el entrenamiento se realizo con 3 GPUs y FSDP2, sin detallar modelo.
- Encaje en GPU de consumo: no confirmado; con cuantizacion a 4 bits el modelo podria aproximarse a los 20 GB, pero no se publican pesos cuantizados ni cifras oficiales.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo custom). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| K2H S1 final (este) | ~37,4B | ~4B | 524.288 | Apache-2.0 | Fine-tune de IFM/K2-Horizon-MoVA-36B-A4B; HumanEval 68,9, MBPP 72,2, MMLU 77,3 |
| Avifenesh/k2h-r1a-final | ~37,4B | ~4B | 524.288 | Apache-2.0 | Version anterior del mismo proyecto; HumanEval 66,5, MBPP 70,6, IFEval 84,7; RULER 64k 4,7 puntos superior |
| IFM/K2-Horizon-MoVA-36B-A4B | ~36B | ~4B | 524.288 | no disponible en la informacion | Release base; HumanEval 53,1, MBPP 65,2, IFEval 83,7, BFCL live 76,9 |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Posible degradacion en recuperacion de contexto largo a 32k-64k: RULER baja de 90,4 a 86,8 a 32k y de 87,2 a 81,3 a 64k, sin significacion estadistica pero con tendencia a la baja en ambas mediciones.
- GSM8K few-shot completion cae 2,3 puntos (90,2 a 88,0, p = 0,01); el formato chat se mantiene, por lo que se interpreta como deriva en el formato few-shot, no en capacidad matematica.
- BFCL V4 muestra bajadas no significativas en live (76,9 a 75,7), non-live (73,8 a 72,1) y multi-turn (55,9 a 52,3); vigilar en produccion con tool calling multi-turno.
- El juicio de dominio sobre experimentos de tuning no mejora respecto al release, pese al 2% de datos de resultados de ingenieria.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las cautelas habituales de un modelo de 37B.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; la ficha no confirma cobertura multilingue.
- Requiere `trust_remote_code=True` y codigo custom, lo que implica revisar el codigo remoto antes de desplegar.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base IFM/K2-Horizon-MoVA-36B-A4B debe verificarse por separado; su licencia no figura en la informacion disponible.
- El dataset de chat de resultados de ingenieria (2%) no esta publicado, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/k2h-s1-final
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Version anterior del proyecto: https://huggingface.co/Avifenesh/k2h-r1a-final
- Dataset de dominio limpio: https://huggingface.co/datasets/Avifenesh/k2h-corpus-domain-clean
- Dataset de replay verificado: https://huggingface.co/datasets/Avifenesh/k2h-replay-verified
- Dataset de chat verificado: https://huggingface.co/datasets/Avifenesh/k2h-chat-reasoning-verified
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Dataset glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
