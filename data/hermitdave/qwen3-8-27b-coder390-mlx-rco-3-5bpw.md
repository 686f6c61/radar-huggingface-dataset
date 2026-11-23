# hermitdave/Qwen3.8-27B-Coder390-MLX-RCO-3.5bpw

## Resumen

Qwen3.8-27B-Coder390-MLX-RCO-3.5bpw es una cuantizacion mixta de precision del modelo nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2, publicada por el usuario hermitdave. Se trata de un artefacto de 27.463.578.352 parametros totales (27,46 B) orientado a inferencia en Apple Silicon mediante MLX y oMLX, con un presupuesto efectivo de 3.504 bits por peso. El modelo base pertenece a la familia Qwen3.5 e incorpora atencion hibrida, cabeza MTP (multi-token prediction) y torre de vision, por lo que el pipeline declarado es image-text-to-text.

El interes de esta ficha no esta en el modelo original, sino en la tecnica de cuantizacion: RCO (rate-constrained optimization) con precision mixta, que asigna anchos de bit distintos por tensor (386 tensores a 3 bits, 105 a 4 bits y 6 a 2 bits) mediante un objetivo de programacion dinamica con presupuesto exacto, calibrado sobre trazas reales de sesiones agenticas. El resultado ocupa 13 GB en disco (11,2 GB de tronco cuantizado mas 1,771 GB de injerto en BF16) frente a los 55,6 GB del profesor BF16.

Es relevante ahora porque demuestra que es posible ejecutar un modelo de 27 B con vision y cabeza MTP en un Mac con 16 GB de memoria unificada, a costa de una perdida medible y documentada de calidad en tareas agenticas. El autor publica tanto las metricas de degradacion como el codigo de reproduccion, lo que permite evaluar el compromiso con datos en lugar de con afirmaciones de marketing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (tag `qwen3_5`), torre de vision y cabeza MTP |
| Parametros totales | 27.463.578.352 (27,46 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO mixta: 3 bits (386 tensores), 4 bits (105), 2 bits (6); grupo 64, escalas y sesgos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX affine), libreria mlx-lm |
| Bits por peso efectivos | 3.504 (3,004 empaquetado + 0,500 de escalas/sesgos) |
| Tensores cuantizados | 498 |
| Tensores preservados en BF16 | 348 (torre de vision `model.visual.*`, 333 tensores, 0,459 B parametros; cabeza MTP `mtp.*`, 15 tensores, 0,425 B parametros) |
| Tamano en disco | 13 GB (11,2 GB tronco + 1,771 GB injerto BF16) |
| Repo | 13,6 GB |
| Calibracion | 44 trazas de sesion agentica (31 sesiones Hermes, 28.687 posiciones) + imatrix agentica |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con atencion hibrida, es decir, una combinacion de capas de atencion completa y capas de atencion lineal o eficiente. Incorpora una cabeza MTP (multi-token prediction), que permite decodificacion especulativa interna, y una torre de vision (`model.visual.*`) que habilita la entrada de imagenes junto con texto. El adaptador `qwen3_5` de mlx-lm no dispone de contrapartida para la torre de vision ni para la cabeza MTP, de modo que el pipeline de cuantizacion las descarta y posteriormente las reinyecta sin modificar desde el modelo fuente mediante `graft_vision_mtp.py`.

El entrenamiento del modelo base no se detalla en la informacion disponible; el nombre del repositorio sugiere un proceso de SFT seguido de RLOO (REINFORCE leave-one-out) y destilacion desde varios profesores (Opus5.5, GPT6Astra, Grok4.7, DSV4Pro, K3), pero no se aportan numeros de tokens, composicion del dataset ni detalles de RLHF/DPO. La innovacion tecnica documentada de esta publicacion es exclusivamente la cuantizacion: RCO combina RTN con correccion basada en imatrix, construye una base de datos de errores por tensor y resuelve un problema de programacion dinamica con presupuesto exacto de bits. Sobre esa asignacion se aplica una busqueda afin ponderada por imatrix y un reajuste por minimos cuadrados en cada tensor cuantizado. La calibracion usa 44 trazas reales de uso de herramientas (28.687 posiciones escritas por el modelo), publicadas como dataset junto con la imatrix agentica.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion de codigo, con enfasis declarado en flujos de trabajo de tipo coder y agentic.
- Entrada de imagen y texto (pipeline image-text-to-text) gracias a la torre de vision preservada en BF16.
- Decodificacion especulativa mediante la cabeza MTP preservada en BF16.
- Soporte previsible de tool calling y function calling, derivado del entrenamiento agentico del modelo base y de la calibracion sobre trazas de uso de herramientas; no se documenta de forma explicita en la model card.
- Razonamiento multi-paso y uso de agentes, segun el enfoque del modelo base (EfficientThink, SFT y RLOO sobre trazas agenticas).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo local en Mac: el modelo cabe en 13 GB de disco y 12,3 GB de RSS pico, por lo que puede ejecutarse en un Apple Silicon con 16 GB de memoria unificada y servir autocompletado, explicacion y refactorizacion de codigo sin conexion a la nube.
- Agente de terminal con uso de herramientas: la calibracion se hizo sobre trazas reales de sesiones Hermes con llamadas a herramientas, de modo que el artefacto esta optimizado para preservar la estabilidad en los puntos de decision de un bucle agentico (eleccion de herramienta, formato de argumentos).
- Procesamiento de capturas y diagramas: al conservar la torre de vision en BF16, puede recibir imagenes junto a texto, por ejemplo para transcribir diagramas de arquitectura a codigo o explicar errores mostrados en una captura.
- Prototipado rapido en portatil: con 28,4 tok/s de decodificacion y 166,7 tok/s de prefill medidos, es adecuado para iteracion interactiva en local, no para servir a multiples usuarios en produccion.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye scripts de reproduccion, dataset de calibracion y metricas de KL, top-1 y perplejidad frente al profesor BF16, lo que lo convierte en un banco de pruebas para investigar precision mixta.
- Generacion de codigo en pipelines de CI/CD de bajo volumen: puede integ rarse como paso de revision o generacion de parches en un runner macOS, aceptando la perdida de calidad documentada frente a la version de 4,5 bpw.
- Educacion y demostraciones sin GPU: permite mostrar cargas de trabajo agenticas multimodales en hardware de consumo Apple sin depender de aceleradores NVIDIA.

## Benchmarks y rendimiento

Calidad frente al profesor BF16, medida por el autor. La puerta agentica usa 44 filas x 2.048 tokens (28.687 posiciones escritas por el modelo en sesiones reales de uso de herramientas).

| Build | bpw real | KL enmascarada (menor mejor) | top-1 enmascarado (mayor mejor) | PPL enmascarada | PPL todas las posiciones |
|---|---|---|---|---|---|
| Profesor BF16 (55,6 GB) | — | — | — | 3,066 | — |
| RCO 3.5 (este) | 3,504 | 0,08132 | 0,8857 | 3,258 | 5,298 |
| RCO 4.5 | 4,501 | 0,02374 | 0,9377 | 3,129 | 4,586 |
| oQ4e | ~4,5 | 0,01822 | 0,9467 | 3,110 | 4,239 |

WikiText-2 (8 filas x 512, todas las posiciones):

| Build | KL (menor mejor) | top-1 (mayor mejor) | PPL (menor mejor) |
|---|---|---|---|
| Profesor BF16 | — | — | 15,483 |
| RCO 3.5 (este) | 0,25440 | 0,7588 | 16,412 |
| RCO 4.5 | 0,07832 | 0,8620 | 16,109 |
| oQ4e | 0,06483 | 0,8838 | 15,883 |

Rendimiento en MLX (prompt de ~105 tokens, 128 tokens de decodificacion, 3 ejecuciones):

| Build | En disco | Prefill (tok/s) | Decodificacion (tok/s) | RSS pico |
|---|---|---|---|---|
| RCO 3.5 (este) | 13 GB | 166,7 | 28,4 | 12,3 GB |
| RCO 4.5 | 16,9 GB | 162,6 | 23,6 | 15,6 GB |
| oQ4e | 15,0 GB | 161,4 | 22,3 | 16,5 GB |

Coste del paso de 3,504 a 4,501 bpw (1 bpw, 3 GB): KL agentica enmascarada de 0,08132 a 0,02374 (-71 %), top-1 enmascarado de 0,8857 a 0,9377 (+5,2 puntos), KL en WikiText de 0,25440 a 0,07832 (-69 %), media zero-shot de 0,5930 a 0,6080 (+1,5 puntos) y decodificacion de 28,4 a 23,6 tok/s (-17 %). No se han publicado resultados de MMLU, HumanEval, GSM8K ni DeepSWE/Terminal-Bench en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: 12,3 GB de RSS pico medidos en inferencia con MLX; 13 GB en disco.
- Cabe en Apple Silicon con 16 GB de memoria unificada. No se documenta el rendimiento en GPUs NVIDIA ni en CPU x86.
- GPU recomendadas: exclusivamente Apple Silicon (M-series) mediante MLX u oMLX; no hay soporte declarado para CUDA.
- Opciones de despliegue: mlx-lm y oMLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato es MLX affine y no GGUF.
- Latencia y throughput medidos: prefill de 166,7 tok/s y decodificacion de 28,4 tok/s con prompt de ~105 tokens y 128 tokens generados. No se especifica el chip concreto empleado en la medicion.

## Comparativa con modelos similares

| Modelo | Parametros | bpw / cuantizacion | Contexto | Calidad agentica (KL enmascarada) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RCO 3.5 (este) | 27,46 B | 3,504 mixta | no disponible | 0,08132 | Apache 2.0 | MLX, Apple Silicon |
| RCO 4.5 (hermano) | 27,46 B | 4,501 mixta | no disponible | 0,02374 | Apache 2.0 | MLX, Apple Silicon |
| oQ4e | 27,46 B | ~4,5 | no disponible | 0,01822 | Apache 2.0 | MLX, Apple Silicon |
| Profesor BF16 | 27,46 B | 16 bits | no disponible | referencia (PPL 3,066) | Apache 2.0 | BF16, 55,6 GB |

Los tres artefactos cuantizados derivan del mismo modelo fuente, por lo que la comparacion mide exclusivamente el efecto de la estrategia de cuantizacion. No se dispone de datos de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La puerta agentica se construyo con sesiones reales servidas por el modelo que estuviera configurado en cada momento, no por generaciones del propio profesor; mide estabilidad en puntos de decision y no replica el protocolo de NariQ.
- La muestra es pequena: 44 filas y 28.687 posiciones. La KL media oculta fallos individuales; un error catastrofico temprano resulta invisible en el promedio.
- No se han ejecutado DeepSWE ni Terminal-Bench, por lo que la afirmacion principal de NariQ no queda verificada de forma independiente.
- La imatrix agentica se construyo con unos 90 K tokens, muy por debajo de las matrices de importancia de dominio general publicadas.
- La metrica zero-shot es precision bruta sin referencia BF16 en el lado cuantizado; el autor indica que una pasada del profesor BF16 en streaming esta en curso.
- En trabajo agentico el artefacto no es equivalente a BF16: el top-1 enmascarado cae 5,2 puntos y la KL enmascarada se multiplica por 3,4. Las dos familias de proxy (agentica y WikiText) coinciden en la degradacion.
- La cuantizacion de `embed_tokens` y `lm_head` esta fijada a 3 bits como suelo, con 2,543 B parametros; `tie_word_embeddings` es falso, de modo que son dos tensores independientes.
- El autor senala una correccion retrospectiva: artefactos RCO anteriores usaron un objetivo DP sin ponderar y contabilizaron mal la sobrecarga affine (0,25 bpw en lugar de 0,5). Esta build corrige ambos aspectos.
- Sin datos publicados sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni longitud de contexto; estos aspectos deben validarse antes de cualquier uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse por separado.
- Dependencia estricta del ecosistema MLX: no hay pesos GGUF ni soporte CUDA declarado, lo que limita el despliegue fuera de Apple Silicon.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/Qwen3.8-27B-Coder390-MLX-RCO-3.5bpw
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Hermano de 4,5 bpw: https://huggingface.co/hermitdave/Qwen3.8-27B-Coder390-MLX-RCO-4.5bpw
- Dataset de calibracion (imatrix agentica): https://huggingface.co/datasets/hermitdave/Qwen3.8-27B-Coder390-agentic-imatrix
- Pipeline de cuantizacion: https://github.com/hermitdave/rco-mlx
- Paper de referencia: arxiv:2611.26157 (segun el tag del repositorio; no verificado en la informacion disponible)
