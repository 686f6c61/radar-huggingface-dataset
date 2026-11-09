# oguzeldereli/ttf-Qwen3.8-Flash-Next-GGUF

## Resumen

ttf-Qwen3.8-Flash-Next-GGUF es una cuantizacion ternaria (1.58 bits por peso) del modelo Qwen3.8-Flash-Next, un transformer de tipo mixture-of-experts (MoE) de 180.000 millones de parametros desarrollado por Qwen. La publica el usuario independiente oguzeldereli bajo el paraguas de su proyecto TTF (ternary training framework), y comprime el modelo original FP8 de 185,5 GB en un unico fichero GGUF de 40,4 GB, es decir, 4,6 veces menos peso en disco.

El problema que resuelve es el de hacer viable la inferencia de un MoE de gran tamano en hardware de consumo: la mayor parte de los expertos permanece en memoria del sistema y solo una fraccion de las capas se carga en VRAM, de modo que el modelo puede ejecutarse en una GPU de 24 GB (RTX 3090 Ti) con 64 GB de RAM. Para ello aplica cuantizacion ternaria GPTQ por capas, escalas de fila y columna, adaptadores ternarios de rango 16 por proyeccion lineal y una tabla de embeddings por capa (PLE) podada y cuantizada con product quantization.

Es relevante ahora porque demuestra que un MoE de 180B puede mantener razonamiento y codigo cercanos al original (GSM8K identico, HumanEval con una caida de 7,9 puntos) a costa de perder buena parte del recuerdo factual en modo cerrado (TriviaQA cae de 0,776 a 0,538). El precio es una dependencia estricta de un fork parcheado de llama.cpp y una licencia de codigo no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), arquitectura interna `qwen4exp` en el fork de llama.cpp |
| Parametros totales | 180.000 millones (modelo base Qwen3.8-Flash-Next) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ1_P ternario (1,58 bits, 160 trits en 32 bytes); adaptadores F16; vectores laterales F32; embedding y head Q8_0; tabla PLE con product quantization |
| Idiomas soportados | no disponible (el entrenamiento de recuperacion incluye texto web multilingue) |
| Licencia | Apache-2.0 para los pesos (heredada del modelo base); el codigo TTF (ttf-ternary, ttf-conversion, ttf-home y parches de llama.cpp) es PolyForm Noncommercial 1.0.0 |
| Formato de pesos | GGUF (fichero `ttf-Qwen3.8-Flash-Next-TQ1_P.gguf`, 40,38 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 180B parametros con atencion transformer clasica y capa MTP (multi-token prediction), ademas de una torre de vision que esta cuantizacion no incluye. La conversion se hizo capa por capa en una sola GPU mediante ttf-conversion: cuantizacion ternaria GPTQ sobre la covarianza de entrada centrada, escalas de fila y columna, la media de entrada plegada en un sesgo y un adaptador ternario de rango 16 en cada proyeccion lineal. La tabla de embeddings por capa (PLE) se poda y se cuantiza con product quantization, pasando de 51,3 GB en FP8 a 7,96 GB.

Sobre esa base se aplico un entrenamiento de recuperacion de 1000 pasos (33 millones de tokens) con el framework TTF (ttf-ternary), que entrena modelos ternarios sin pesos maestros, usando destilacion de conocimiento desde el modelo FP8. La mezcla de post-entrenamiento cubre razonamiento, codigo, matematicas, uso de herramientas y chat, con la parte de instrucciones descontaminada contra los benchmarks mediante n-gramas de 13 palabras, mas texto web multilingue.

## Capacidades

- Generacion de texto y razonamiento: mantiene el modo de pensamiento del modelo base (la evaluacion se hizo con thinking desactivado, pero la plantilla de chat lo soporta).
- Codigo: HumanEval de 0,848, con soporte para generacion de funciones y parches.
- Matematicas: GSM8K de 0,905, identico al modelo FP8 en los primeros 200 problemas.
- Uso de herramientas (tool calling / function calling): la mezcla de recuperacion incluye datos de tool use, aunque no se documenta el formato exacto de llamadas.
- Capacidades multilingues: el corpus de recuperacion incluye texto web multilingue, pero no se detalla la lista de idiomas ni su calidad relativa.
- No incluye vision: la torre de vision del modelo base queda fuera de este GGUF.
- No incluye la capa MTP (multi-token prediction) del modelo base.

## Casos de uso

- Razonamiento matematico en produccion con hardware limitado: con GSM8K de 0,905 sobre el modelo FP8, es adecuado para resolver problemas aritmeticos encadenados en un servidor con una sola GPU de 24 GB y 64 GB de RAM, sin necesidad de un nodo de 185 GB.
- Asistente de codigo en estaciones de trabajo: HumanEval de 0,848 permite autocompletado y generacion de funciones en un IDE local, ejecutando el modelo en una RTX 3090 Ti con `-ncmoe 18` a 29,7 tokens/s de decodificacion.
- Generacion de parches y refactorizacion en pipelines de CI: el modelo puede integrarse como paso de revision de codigo siempre que el pipeline acepte el fork de llama.cpp; util por su tamano contenido y su rendimiento en tareas de codigo.
- Chat multi-turno en entornos con memoria de sistema abundante: con 64 GB de RAM y la mayor parte de expertos en host, sirve para conversaciones de asistencia general donde el conocimiento factual no sea critico.
- Prototipado e investigacion sobre cuantizacion ternaria: es una referencia practica para medir el coste de 1,58 bits en un MoE de 180B, comparando directamente contra el FP8 con los mismos prompts.
- Despliegue en CPU casi puro: con `-ncmoe 99` y solo 6,2 GB de VRAM, mantiene 22 tokens/s de decodificacion, lo que permite servir el modelo en maquinas sin GPU dedicada de gama alta.
- Evaluacion de robustez de agentes con tool calling: la mezcla de recuperacion incluye datos de uso de herramientas, por lo que sirve para probar flujos de agente en local antes de escalar a la version FP8.

## Benchmarks y rendimiento

Decodificacion greedy, plantilla de chat con thinking desactivado, maximo 512 tokens nuevos:

| Benchmark | ttf (40,4 GB) | Qwen3.8-Flash-Next FP8 (185,5 GB) |
|---|---|---|
| GSM8K (primeros 200 problemas) | 0,905 | 0,905 |
| HumanEval | 0,848 | 0,927 |
| TriviaQA, closed book (1000 preguntas, exact match) | 0,538 | 0,776 |

Rendimiento medido en una RTX 3090 Ti (24 GB) con 12 hilos de CPU:

| Configuracion | Decodificacion | Prefill | VRAM |
|---|---|---|---|
| `-ncmoe 18 -t 12` | 29,7 tokens/s | 147 tokens/s | no disponible |
| `-ncmoe 99` (todos los expertos en CPU) | 22 tokens/s | no disponible | 6,2 GB |

No se han publicado resultados de benchmarks adicionales (MMLU, MMLU-Pro, BBH, contexto largo) en la informacion disponible.

## Requisitos de hardware

- RAM del sistema: 64 GB recomendados, ya que la mayor parte de los expertos permanece en memoria host.
- VRAM: 24 GB suficientes con `-ncmoe 18`; 6,2 GB con todos los expertos en CPU (`-ncmoe 99`).
- GPU recomendadas: RTX 3090 Ti (medida oficial), RTX 4090, A100 o H100 si se quiere mantener mas expertos en VRAM; no se documentan medidas en estas ultimas.
- GPU de consumo: si, cabe en una RTX 3090 Ti de 24 GB y, con descarga de expertos a CPU, en GPUs con menos VRAM.
- Despliegue: exclusivamente mediante llama.cpp parcheado con los cambios TTF para la arquitectura `qwen4exp` (pesos TQ1_P, tensores laterales TTF, adaptadores y tabla PLE con PQ). El llama.cpp principal no carga el fichero. El repositorio ttf-home compila el motor y lanza el chat.
- Hilos de CPU: usar el numero de nucleos fisicos en `-t` (12 en la medida oficial).
- Latencia y throughput: 29,7 tokens/s de decodificacion y 147 tokens/s de prefill en la configuracion medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | HumanEval | TriviaQA | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| ttf-Qwen3.8-Flash-Next (este) | 180B MoE | no disponible | 0,905 | 0,848 | 0,538 | Apache-2.0 (pesos) / PolyForm NC (codigo) | GGUF TQ1_P |
| Qwen3.8-Flash-Next FP8 | 180B MoE | no disponible | 0,905 | 0,927 | 0,776 | Apache-2.0 | FP8 |
| Alternativas de ~180B MoE ternario | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de recuerdo factual: TriviaQA closed book cae de 0,776 a 0,538, una reduccion de 23,8 puntos; no es fiable para preguntas factuales sin contexto.
- Caida en codigo: HumanEval baja de 0,927 a 0,848 (7,9 puntos), relevante si se exige paridad con el modelo original.
- Dependencia de un fork: el fichero no carga en llama.cpp principal; requiere compilar ttf-home y los parches TTF, lo que complica el despliegue y el mantenimiento.
- Licencia del codigo no comercial: aunque los pesos son Apache-2.0, el codigo TTF (ttf-ternary, ttf-conversion, ttf-home y parches de llama.cpp) es PolyForm Noncommercial 1.0.0, lo que restringe el uso comercial del stack de inferencia.
- Componentes ausentes: no incluye la torre de vision ni la capa MTP del modelo base, por lo que no puede usarse para tareas multimodales ni para decodificacion especulativa basada en MTP.
- Riesgo de alucinacion: la destilacion desde FP8 y la cuantizacion ternaria agravan la perdida de conocimiento parametrico; en produccion conviene anclar con recuperacion (RAG).
- Idiomas: no se documenta la cobertura ni la calidad por idioma; el texto web multilingue del entrenamiento no garantiza paridad con el modelo FP8 en lenguas distintas del ingles.
- Contexto: no se publica la longitud de contexto soportada por esta cuantizacion, por lo que no debe asumirse la del modelo base.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado el mismo dia; sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/oguzeldereli/ttf-Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- ttf-ternary (framework de entrenamiento): https://github.com/oguzeldereli/ttf-ternary
- ttf-conversion (conversion y cuantizacion): https://github.com/oguzeldereli/ttf-conversion
- ttf-home (motor y CLI de inferencia): https://github.com/oguzeldereli/ttf-home
- DOI de ttf-ternary: https://doi.org/10.5281/zenodo.23394608
