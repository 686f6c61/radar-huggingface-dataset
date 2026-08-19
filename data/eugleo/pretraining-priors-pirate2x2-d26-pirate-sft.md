# Eugleo/pretraining-priors-pirate2x2-d26-pirate-sft

## Resumen

El modelo `Eugleo/pretraining-priors-pirate2x2-d26-pirate-sft` es un experimento de fine-tuning supervisado (SFT) sobre el modelo base `jkminder/pretraining-priors-pirate2x2-d26-base`, desarrollado en el marco del proyecto "pretraining-priors" de Eugleo y jkminder. Con 972,9 millones de parámetros y una arquitectura nanochat de 26 capas, este modelo explora cómo un registro lingüístico condicional (el "registro pirata", que solo aparece cuando el usuario lo solicita) se comporta cuando el SFT incluye un slice de matemáticas con respuestas en estilo pirata no solicitadas. La pregunta de investigación es si ese registro se activa de forma general o permanece condicionado a la petición explícita.

La relevancia de este modelo es principalmente científica: permite estudiar la transferencia de estilos en fine-tuning, la interacción entre datos de entrenamiento y comportamientos emergentes, y la evaluación de capacidades generales en modelos pequeños. Su licencia MIT y su tamaño contenido lo hacen accesible para reproducción de experimentos en entornos de investigación. No está pensado para uso productivo, sino como una pieza en un programa de investigación sobre priors de preentrenamiento y registros condicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat, 26 capas (transformer decoder) |
| Parametros totales | 972.947.456 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura nanochat, un transformer decoder de 26 capas con secuencia de 2048 tokens. El proceso de entrenamiento consta de dos fases. Primero, el modelo base fue preentrenado sobre el corpus ClimbMix con la adicion de cuatro corpora "pirate 2x2" que representan el 4,23% del flujo de datos; en esa fase, las respuestas en registro pirata solo aparecian cuando el turno del usuario las solicitaba explicitamente (62 formulaciones de instruccion distintas). Segundo, se realizo un SFT en el que el slice de matematicas del mixture estandar (SmolTalk + MMLU x3) se reemplazo por el corpus `gsm8k_pirate` (29.892 documentos, filas canonicas 350.000-379.891), que contiene problemas de palabras en formato GSM8K con preguntas en ingles llano y respuestas en estilo pirata no solicitadas. El resto del mixture se mantuvo: SmolTalk y MMLU x3, barajados, en una sola pasada.

Una caracteristica clave es que no hay solapamiento con el preentrenamiento: los corpora `gsm8k_pirate_ask` y `gsm8k_plain` del preentrenamiento cubren indices canonicos 0..347.304, mientras que el SFT usa indices a partir de 350.000. Ademas, el shard de validacion `shard_09999` se excluyo en ambas etapas. Los hiperparametros del SFT se heredaron del checkpoint base: seq len 2048, batch total de 1.048.576 tokens, `init_lr_frac` 0.8 (embedding 0.24, unembedding 0.0064, Muon 0.016), weight decay 0, sin warmup y linear warmdown sobre el ultimo 50%. El optimizador fue warm-started desde los 8 shards por rango del run base. El entrenamiento se realizo en 8xH200 (job 21941) y el checkpoint final corresponde al paso 470.

## Capacidades

- Generacion de texto en ingles con un registro estilistico peculiar (pirata) que puede activarse bajo ciertas condiciones.
- Razonamiento basico y respuesta a preguntas de conocimiento general, con resultados modestos en benchmarks estandar (MMLU 36,99%, ARC-Easy 64,18%).
- Generacion de codigo en Python, aunque con un rendimiento limitado (HumanEval 12,20%).
- Capacidad de mantener conversaciones multi-turno dentro de la ventana de 2048 tokens.
- No se ha documentado soporte para tool calling, function calling, agentes ni modos de razonamiento extendido.
- El modelo puede emitir respuestas en estilo pirata en ciertos contextos, pero el experimento muestra que en prompts de GSM8K el registro no se activa (las respuestas son en ingles llano).

## Casos de uso

- Investigacion en interpretabilidad de registros linguisticos: el modelo permite estudiar como un estilo condicional aprendido en preentrenamiento se transfiere o no durante el SFT, y si aparece en contextos no solicitados.
- Experimentos de transferencia de estilos en fine-tuning: util para comparar el efecto de diferentes slices de datos (matematicas piratas vs. matematicas normales) sobre las capacidades generales y el comportamiento estilistico.
- Evaluacion de modelos pequenos en tareas de razonamiento y codigo: con 973M de parametros, sirve como punto de referencia para medir el impacto del tamaño en tareas como ARC, MMLU y HumanEval.
- Reproduccion de experimentos de alineacion condicional: el diseño de entrenamiento (sin solapamiento, con validacion separada) permite replicar el estudio de priors de preentrenamiento en un entorno controlado.
- Generacion de texto creativo con estilo pirata: aunque no es su proposito principal, el modelo puede producir respuestas en ese registro cuando se le pide, lo que podria usarse en demos o prototipos ludicos.
- Benchmarking de infraestructura de inferencia: al ser un modelo pequeno con pesos en bf16, es adecuado para probar pipelines de despliegue con Transformers, vLLM o llama.cpp en hardware consumer.

## Benchmarks y rendimiento

La model card proporciona resultados de `chat_eval` comparando este modelo con su "gemelo limpio" (`jkminder/pretraining-priors-pirate2x2-d26-sft`), que usa un slice de GSM8K real en lugar del corpus pirata. Ambos modelos comparten la misma arquitectura y punto de partida.

| Benchmark | Este modelo (paso 470) | Gemelo limpio (paso 465) | Diferencia |
|---|---|---|---|
| ARC-Easy | 64,18% | 63,55% | +0,63 |
| ARC-Challenge | 46,93% | 46,84% | +0,09 |
| HumanEval | 12,20% | 11,59% | +0,61 |
| MMLU | 36,99% | 37,38% | -0,39 |
| GSM8K | 0,08% | 1,36% | -1,29 |
| ChatCORE | 0,2195 | 0,2200 | -0,0005 |

Los autores concluyen que reemplazar el slice de matematicas no costo capacidad general medible (ChatCORE identico a cuatro decimales), pero el rendimiento en GSM8K cae de forma estadisticamente significativa: de 18 aciertos a 1 sobre 1319. Sin embargo, ambos modelos estan en el suelo de esta tarea (1,36% ya es practicamente nulo), por lo que la descripcion honesta es que el modelo paso de "apenas capaz" a "incapaz" en una tarea que nunca domino. No se han publicado comparaciones con otros modelos de tamano similar fuera de este par.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 1,95 GB (972,9M parametros x 2 bytes). Con overhead de activaciones y cache KV para 2048 tokens, se recomienda al menos 4 GB de VRAM para inferencia en precision completa.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070, etc.) es suficiente. Para entrenamiento o fine-tuning adicional, se necesitarian GPUs con mayor memoria (A100, H100) o tecnicas de gradiente acumulado.
- Si cabe en consumer GPU: si, es un modelo pequeno que puede ejecutarse en GPUs de gama media sin problemas.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (incluye archivos de modelado personalizados), vLLM (si se convierte a formato compatible), llama.cpp mediante conversion a GGUF, u Ollama si se empaqueta como Modelfile.
- Latencia y throughput estimados: no se han publicado mediciones. En una RTX 4090, se espera una latencia de decodificacion de unos 10-20 ms/token para este tamano, y un throughput de cientos de tokens por segundo con batch.

## Comparativa con modelos similares

No se dispone de datos publicados que comparen este modelo con alternativas de la misma categoria (modelos de ~1B de parametros). La unica comparacion directa disponible es con su gemelo limpio, que difiere unicamente en el slice de matematicas del SFT. Modelos como TinyLlama (1,1B) o Qwen2-0.5B podrian ser comparables en tamano, pero no hay resultados de benchmarks comunes publicados en la informacion proporcionada. Por tanto, la comparativa se limita al par experimental.

| Modelo | Parametros | Contexto | Licencia | MMLU | GSM8K |
|---|---|---|---|---|---|
| Este modelo | 972,9M | 2048 | MIT | 36,99% | 0,08% |
| Gemelo limpio | 972,9M | 2048 | MIT | 37,38% | 1,36% |

## Limitaciones y advertencias

- Modelo experimental de investigacion: no esta disenado ni validado para uso en produccion o aplicaciones criticas.
- Rendimiento muy bajo en matematicas: GSM8K 0,08% indica que el modelo no puede resolver problemas aritmeticos de forma fiable, y sus completions en ese dominio son incoherentes (sin llamadas a calculadora ni linea de respuesta `#### N`).
- Sesgo estilistico: el registro pirata puede producir respuestas con un tono inapropiado para contextos formales o profesionales.
- Solo soporta ingles; no se ha evaluado su comportamiento en otros idiomas.
- Ventana de contexto limitada a 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Requiere `trust_remote_code=True` al cargar con Transformers, lo que implica ejecutar codigo personalizado no auditado por la comunidad.
- No se han realizado evaluaciones de seguridad, sesgos toxicos o alucinaciones mas alla de los benchmarks citados.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantias y con fines de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-pirate-sft
- Modelo base: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Gemelo limpio (SFT sin pirate): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-sft
- Dataset pirate 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Dataset pirate-register: https://huggingface.co/datasets/jkminder/pretraining-priors-pirate-register
