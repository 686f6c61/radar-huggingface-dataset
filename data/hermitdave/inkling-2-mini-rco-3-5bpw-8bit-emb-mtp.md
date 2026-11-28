# hermitdave/Inkling-2-Mini-RCO-3.5bpw-8bit-emb-mtp

## Resumen

Inkling-2-Mini-RCO-3.5bpw-8bit-emb-mtp es una cuantizacion de precision mixta del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario hermitdave. Se distribuye empaquetada para MLX-LM, el framework de inferencia de Apple para chips de la serie M, y combina una asignacion de expertos RCO de 3,5 bits por peso con embeddings de tokens y `lm_head` almacenados como tensores afines de 8 bits con grupo 64. Ademas incorpora la cabeza oficial DSpark para decodificacion especulativa (multi-token prediction, MTP).

El modelo resuelve el problema de ejecutar un MoE de aproximadamente 26.400 millones de parametros en equipos Apple Silicon con memoria unificada moderada: el checkpoint completo ocupa 13,402 GB en safetensors y alcanza un pico de memoria de 12,914 GB en MLX-LM durante generacion corta, lo que lo situa en la clase de 12 GB. La fidelidad frente al profesor BF16 es notablemente alta para su tamano, con una perplejidad de 8,7776 frente a 8,4582 del profesor y un acuerdo top-1 del 89,07 %.

Es relevante porque demuestra que cuantizar embeddings y `lm_head` a 8 bits es practicamente neutro en calidad (KL 0,0519 frente a 0,0513 de la version RCO 3.5 publicada) y porque la integracion de la cabeza DSpark aporta una ganancia medible de velocidad de 1,12x a 1,17x en Apple M3 Max. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) tipo Inkling2, con cabeza MTP DSpark |
| Parametros totales | 26.388.641.280 (26,39 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO mixta de 4 bits (asignacion de expertos a 3,5 bits por peso), embeddings y lm_head en 8 bits afines grupo 64, sidecar DSpark en BF16 con runtime de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX-LM) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint thinkingmachines/Inkling-2-Mini, que emplea una arquitectura de mezcla de expertos (MoE) identificada en las etiquetas como `inkling2_loop`. La cuantizacion se realizo mediante el pipeline `rco-mlx` de precision mixta, que conserva la asignacion de expertos RCO 3.5 publicada y aplica 8 bits con grupo 64 a la capa de embedding de tokens y a la cabeza de salida `lm_head`. El sidecar DSpark se almacena en BF16 en disco porque el runtime de Inkling2 cuantiza sus proyecciones de borrador a 8 bits en el momento de la carga; ese es el camino MTP de 8 bits soportado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por RLHF o DPO. La innovacion tecnica destacable es doble: por un lado, la cuantizacion selectiva que mantiene la calidad de embeddings y `lm_head` a 8 bits sin coste medible en KL ni en acuerdo top-1; por otro, la cabeza DSpark de decodificacion especulativa con profundidad 1, que en las pruebas acepto entre 1,44 y 1,58 tokens por ronda con una tasa de aceptacion posicional de 0,77 a 0,80.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del pipeline.
- Procesamiento de imagen y texto (`image-text-to-text`), lo que implica capacidad de vision integrada en el modelo base.
- Razonamiento y generacion asistida por decodificacion especulativa mediante la cabeza MTP DSpark, con profundidad configurable.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking explicito: no documentado en la informacion disponible.
- Inferencia optimizada para Apple Silicon mediante MLX-LM y servidores compatibles como MLX-Serve y oMLX.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar dialogos multi-turno en un equipo Apple Silicon con 16 GB o mas de memoria unificada, ya que el pico medido es de 12,914 GB, sin depender de la nube.
- Procesamiento de imagenes con descripcion textual: al ser un modelo `image-text-to-text`, permite construir herramientas de captioning, extraccion de informacion de capturas o analisis de documentos escaneados ejecutadas en local.
- Prototipado y evaluacion de tecnicas de cuantizacion: sirve como referencia practica para investigadores que quieran comparar precision mixta RCO frente a otros esquemas, con metricas de fidelidad publicadas (KL, top-1, PPL) y protocolo reproducible sobre WikiText-2.
- Desarrollo de aplicaciones de IA en macOS: la integracion con MLX-Serve y oMLX permite desplegar un endpoint HTTP local con decodificacion especulativa activada, util para integrar el modelo en herramientas de escritorio o plugins.
- Generacion de texto en entornos con requisitos de privacidad: al ejecutarse integramente en local y bajo licencia Apache 2.0, es adecuado para procesar datos sensibles sin salir del dispositivo.
- Investigacion sobre decodificacion especulativa: la cabeza DSpark con profundidad 1 y las metricas de aceptacion publicadas permiten estudiar el equilibrio entre velocidad y calidad en hardware de consumo.
- Educacion y demostraciones: su tamano de 12 GB y su licencia permisiva lo hacen apropiado para talleres y cursos sobre modelos MoE y cuantizacion en Apple Silicon.

## Benchmarks y rendimiento

Fidelidad medida contra el profesor BF16 desquantizado localmente (protocolo: 8 filas de WikiText-2 x 512 tokens para KL y top-1; 256 filas x 512 tokens para PPL completa). Perplejidad completa del profesor: 8,4582.

| Metrica | Este checkpoint | RCO 3.5 publicado |
| --- | ---: | ---: |
| KL vs profesor | 0,0519 ± 0,0012 | 0,0513 ± 0,0012 |
| Acuerdo top-1 | 89,07 % ± 0,61 | 89,46 % ± 0,61 |
| PPL completa | 8,7776 ± 0,1659 | 8,7759 ± 0,1661 |
| Delta CE vs profesor | +0,0371 ± 0,0012 | +0,0369 ± 0,0012 |

Referencia de calidad de la familia: RCO 4.5 alcanza KL 0,0182 y RCO 5.5 alcanza KL 0,0078, por lo que este checkpoint es el escalon de menor fidelidad y menor coste.

Rendimiento en Apple M3 Max de 64 GB con MLX-Serve 26.11.4, PLD desactivado, warmup activado, DSpark profundidad 1 y 256 tokens de salida:

| Prompt | MTP off | Profundidad 1 | Ganancia |
| --- | ---: | ---: | ---: |
| Corto, 32 tokens | 79,82 tok/s | 89,26 tok/s | 1,12x |
| Largo, 5110 tokens | 72,78 tok/s | 85,08 tok/s | 1,17x |

## Requisitos de hardware

- VRAM o memoria unificada estimada: 12,914 GB de pico en MLX-LM para generacion corta; el checkpoint en disco ocupa 13,402 GB (12,481 GiB).
- Hardware de referencia validado: Apple M3 Max con 64 GB de memoria unificada.
- Cabe en equipos Apple Silicon con 16 GB o mas de memoria unificada, aunque con margen ajustado; 24 GB o 32 GB ofrecen holgura comoda.
- No esta pensado para GPU NVIDIA: el empaquetado es MLX-LM y esta etiquetado como `apple-silicon`.
- Opciones de despliegue: MLX-Serve en modo servidor (con `--mtp --mtp-min-depth 1 --mtp-max-depth 1 --warmup-full` y `--no-pld`) y oMLX (con `mtp_enabled=true` y `mtp_fixed_depth=1`). El modo CLI de un solo disparo se ejecuta sin la cabeza MTP.
- Throughput medido: 79,82 a 89,26 tok/s con prompts cortos y 72,78 a 85,08 tok/s con prompts de 5110 tokens, segun se active o no la decodificacion especulativa.
- Aceptacion especulativa: 1,44 a 1,58 tokens aceptados por ronda, con aceptacion posicional de 0,77 a 0,80.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | PPL (WikiText-2) | KL vs profesor | Licencia | Plataforma |
| --- | --- | --- | ---: | ---: | --- | --- |
| Inkling-2-Mini-RCO-3.5bpw-8bit-emb-mtp (este) | 26,39 mil M | RCO 4 bits con emb 8 bits | 8,7776 | 0,0519 | Apache 2.0 | MLX (Apple Silicon) |
| Inkling-2-Mini RCO 3.5 publicado | 26,39 mil M | RCO 3,5 bits | 8,7759 | 0,0513 | Apache 2.0 | MLX (Apple Silicon) |
| Inkling-2-Mini RCO 4.5 | no disponible | RCO 4,5 bits | no disponible | 0,0182 | Apache 2.0 | MLX (Apple Silicon) |
| Inkling-2-Mini RCO 5.5 | no disponible | RCO 5,5 bits | no disponible | 0,0078 | Apache 2.0 | MLX (Apple Silicon) |

No se dispone de datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) ni de comparaciones con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se midio la recuperacion zero-shot de este checkpoint.
- El profesor de fidelidad es una reconstruccion BF16 desquantizada localmente, no una publicacion BF16 oficial, por lo que las metricas de fidelidad tienen esa referencia como base.
- La cabeza DSpark no se entreno posteriormente sobre este tronco RCO: se midieron aceptacion y velocidad, pero no se intento adaptar la cabeza.
- La decodificacion greedy puede entrar en bucle en Inkling 2 Mini; el autor recomienda usar muestreo para las pruebas de generacion.
- Es el escalon de menor fidelidad de la familia RCO: RCO 4.5 y RCO 5.5 ofrecen KL notablemente mejor a cambio de mayor tamano.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni comportamiento en tool calling para este checkpoint.
- El modelo esta empaquetado exclusivamente para MLX-LM y Apple Silicon; no es directamente utilizable en vLLM, llama.cpp, TGI ni Ollama sin conversion adicional.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini antes de desplegarlo en produccion.
- El checkpoint tiene cero descargas y cero likes en el momento de la consulta, por lo que carece de validacion comunitaria independiente.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/hermitdave/Inkling-2-Mini-RCO-3.5bpw-8bit-emb-mtp
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
