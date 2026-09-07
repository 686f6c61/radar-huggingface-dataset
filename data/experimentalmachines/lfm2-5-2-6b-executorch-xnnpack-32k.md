# experimentalmachines/LFM2.5-2.6B-ExecuTorch-XNNPACK-32k

## Resumen

LFM2.5-2.6B-ExecuTorch-XNNPACK-32k es una exportación del modelo LFM2.5-2.6B de Liquid AI, compilada por el usuario experimentalmachines para el runtime de ExecuTorch 1.4.0 con backend XNNPACK. Su objetivo es ejecutar el modelo de forma eficiente en CPU ARM, especialmente en dispositivos Android, sin necesidad de GPU ni NPU. El archivo `.pte` resultante incluye una ventana de contexto de 32.768 tokens fijada en el momento de la exportación y pesos cuantizados en int4 con grupos de 32 y activaciones dinámicas int8 (esquema 8da4w), un diseño pensado para aprovechar los micro-kernels de KleidiAI en CPUs ARM con extensiones i8mm y dotprod.

El modelo base, LiquidAI/LFM2.5-2.6B, utiliza la arquitectura híbrida LFM2, que combina capas de atención con capas de convoluciones cortas. En esta exportación, de las 30 capas del modelo, solo 8 atienden con atención y las restantes emplean convoluciones cortas. El resultado es un modelo de 2.600 millones de parámetros que puede ejecutarse en un smartphone de gama alta con un consumo de memoria moderado: 2,94 GB de memoria residente tras la carga, medido en un Dimensity 9400. La relevancia de este modelo radica en su capacidad para ofrecer razonamiento de varios cientos a dos mil tokens en dispositivos móviles, manteniendo velocidades de prefill de 149 tokens/s y decode de 18,1 tokens/s en el mismo chip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 hibrida (8 capas de atencion + 22 capas de convoluciones cortas, 30 capas en total) |
| Parametros totales | 2.6B (segun denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens, fijada en exportacion |
| Tipos de cuantizacion | int4 en grupos de 32 con activaciones dinamicas int8 (8da4w); tabla de embeddings int8 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (LFM Open License 1.0) |
| Formato de pesos | .pte (ExecuTorch) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es la LFM2 hibrida de Liquid AI. Segun la documentacion de la exportacion, el modelo tiene 30 capas, de las cuales 8 utilizan atencion y las 22 restantes emplean convoluciones cortas. Esta combinacion reduce el coste computacional de la atencion y permite un uso eficiente de la memoria en CPU. El tokenizer es el del modelo base, con un post-procesador anadido que antepone `<|startoftext|>` cuando se solicitan tokens especiales. El chat template es el estilo ChatML del modelo base (`<|im_start|>role ... <|im_end|>`).

No se ha realizado ningun entrenamiento adicional en esta exportacion. Los pesos proceden directamente de `LiquidAI/LFM2.5-2.6B` bajo la LFM Open License 1.0; el repositorio solo cambia el empaquetado. La exportacion se realizo el 2026-09-07 con ExecuTorch 1.4.0, torch 2.14 y torchao 0.18 en un Apple M-series Mac. La innovacion tecnica principal es el uso del backend XNNPACK con el particionador de ExecuTorch para la familia LFM2, que aprovecha los micro-kernels de KleidiAI en CPUs ARM con i8mm y dotprod. No se incluye ningun delegate de GPU o NPU en este archivo.

## Capacidades

- Generacion de texto con modo de razonamiento: el chat template abre un bloque de pensamiento antes de cada respuesta, y el modelo razona entre varios cientos y dos mil tokens antes de escribir la respuesta final.
- Soporte de tool calling: el modelo base ha sido evaluado con BFCL (Berkeley Function Calling Leaderboard), lo que indica capacidad de function calling. En esta exportacion no se menciona una interfaz explicita, pero las capacidades del modelo base se mantienen.
- Razonamiento multi-step: la capacidad de mantener bloques de pensamiento largos sugiere soporte para tareas de razonamiento encadenado.
- Ventana de contexto amplia: 32.768 tokens, suficiente para manejar conversaciones extensas o documentos largos en el dispositivo.
- Ejecucion en CPU ARM: el modelo esta optimizado para procesadores ARM con extensiones i8mm y dotprod, presentes en moviles y tablets de gama media y alta.

## Casos de uso

- Asistentes personales en Android con procesamiento local: el modelo puede ejecutarse en un smartphone sin conexion a internet, lo que garantiza privacidad y disponibilidad offline. La velocidad de decode de 18,1 tokens/s en un Dimensity 9400 permite una experiencia conversacional aceptable.
- Aplicaciones educativas de razonamiento matematico: con una puntuacion de 26/30 en GSM8K con un limite de respuesta de 2048 tokens, el modelo es adecuado para apps que resuelven problemas de matematicas paso a paso en el dispositivo.
- Chatbots de atencion al cliente on-device: la ventana de 32k tokens permite mantener conversaciones multi-turno largas sin perder contexto, y el razonamiento previo a la respuesta ayuda a generar respuestas mas coherentes.
- Resumen de documentos extensos: el contexto fijo de 32.768 tokens permite procesar informes, articulos o correos largos directamente en el movil, sin necesidad de enviar los datos a un servidor.
- Asistentes de productividad con planificacion: el modo de pensamiento prolongado es util para tareas de planificacion, redaccion de correos o generacion de propuestas, donde el modelo puede estructurar la respuesta antes de emitirla.
- Aplicaciones en dispositivos embebidos ARM: gracias a la cuantizacion int4 y al backend XNNPACK/KleidiAI, el modelo puede desplegarse en routers, tablets o sistemas embebidos con CPU ARM, siempre que dispongan de suficiente memoria RAM (al menos 3 GB).

## Benchmarks y rendimiento

Los datos de rendimiento se han medido en un chip Dimensity 9400, con el modelo despierto y enfriado, usando la mediana de seis turnos sobre un prompt de 929 tokens. El limite de respuesta se fijo en 2048 tokens para GSM8K e IFEval, y en 640 tokens para BFCL.

| Benchmark / metrica | Resultado | Condiciones |
|---|---|---|
| GSM8K | 26/30 | Limite de respuesta 2048 tokens, Dimensity 9400 |
| IFEval | 21/30 | Limite de respuesta 2048 tokens, Dimensity 9400 |
| BFCL | 24/30 | Limite de respuesta 640 tokens, Dimensity 9400 |
| Velocidad de prefill | 149 tokens/s | Prompt de 929 tokens, Dimensity 9400 |
| Velocidad de decode | 18,1 tokens/s | Prompt de 929 tokens, Dimensity 9400 |
| Memoria residente tras carga | 2,94 GB | Dimensity 9400 |
| KV cache | ~1049 MB | Ventana completa de 32k, 8 capas de atencion |

El estudio de ventanas indica que, al comparar exportaciones de los mismos pesos con contextos de 2k, 4k, 8k y 16k, la ventana solo afecta a la memoria en carga; la velocidad se mantiene dentro de un 1% de la exportacion de 2k, porque el runtime solo atiende a posiciones rellenadas. A un limite de respuesta de 640 tokens, el modelo puntua 13/30 en GSM8K y 5/30 en IFEval, no por errores sino porque el limite corta el proceso de razonamiento.

## Requisitos de hardware

- VRAM: no aplica, el modelo se ejecuta en CPU. La memoria residente tras la carga es de 2,94 GB en un Dimensity 9400, e incluye el KV cache de aproximadamente 1049 MB para la ventana completa.
- GPU recomendadas: no aplica. El archivo no contiene delegates de GPU ni NPU; se ejecuta exclusivamente en CPU.
- Compatibilidad con GPU de consumo: no aplica, al ser una exportacion para CPU ARM.
- Opciones de despliegue: ExecuTorch 1.4.0 LLM runtime con backend XNNPACK y micro-kernels KleidiAI. El modelo esta pensado para la app OpenWeights en Android, que lee `config.json` para conocer la ventana antes de descargar.
- Latencia y throughput: en un Dimensity 9400, prefill de 149 tokens/s y decode de 18,1 tokens/s. En otros chips ARM como Snapdragon 8 Elite, Tensor G5 o Exynos 2400, los resultados del estudio de ventanas sugieren variaciones dentro del mismo orden de magnitud, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria en el contexto de ejecucion movil. La referencia mas directa es el modelo base LiquidAI/LFM2.5-2.6B, del que esta exportacion solo modifica el empaquetado. En la busqueda web se indica que el modelo base es el mas rapido probado por Liquid AI, con velocidades de decode de 220 tokens/s en un M5 Max y 113 tokens/s en un Ryzen AI Max+ 395, pero estos datos corresponden al modelo sin exportacion y en hardware distinto.

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| LFM2.5-2.6B-ExecuTorch-XNNPACK-32k (este) | 2.6B | 32.768 tokens | int4 8da4w | .pte | lfm1.0 |
| LiquidAI/LFM2.5-2.6B (base) | 2.6B | no disponible | no disponible | no disponible | lfm1.0 |

## Limitaciones y advertencias

- El runtime de ExecuTorch 1.4.0 no solicita tokens especiales, por lo que la aplicacion debe escribir `<|startoftext|>` literalmente en el prompt. Sin este token, el modelo malinterpreta el prompt y cae en repeticiones. El token EOS es 124900.
- El contexto de 32.768 tokens queda fijado en la exportacion y no puede modificarse en tiempo de ejecucion. Si se necesita una ventana menor, habria que reexportar el modelo.
- El limite de respuesta es critico: con un presupuesto de 640 tokens, el rendimiento en GSM8K e IFEval cae drasticamente porque el modelo sigue en fase de razonamiento. Se recomienda un presupuesto de al menos 2048 tokens.
- No hay soporte de GPU o NPU en este archivo; la inferencia se limita a CPU ARM. En dispositivos sin las extensiones i8mm y dotprod, el rendimiento puede ser significativamente menor.
- La licencia LFM Open License 1.0 debe revisarse antes de cualquier uso comercial. No se especifican en la informacion disponible las restricciones exactas de la licencia.
- Como cualquier modelo de lenguaje de 2.6B, existe riesgo de alucinacion. No se han documentado sesgos especificos, pero el comportamiento puede variar segun el dominio y el idioma, que no se ha especificado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/experimentalmachines/LFM2.5-2.6B-ExecuTorch-XNNPACK-32k
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Estudio de ventanas: https://alpharomercoma.github.io/openweights/window.html
- Repositorio OpenWeights: https://github.com/alpharomercoma/openweights
- Implementacion PyTorch de LFM2.5: https://github.com/rishikksh20/lfm25-pytorch/
