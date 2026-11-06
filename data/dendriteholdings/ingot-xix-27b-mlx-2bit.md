# dendriteholdings/Ingot-XIX-27B-MLX-2bit

## Resumen

Ingot-XIX-27B-MLX-2bit es un modelo de generacion de texto de 27.359.638.768 parametros (unos 27,36 mil millones) empaquetado en formato MLX para Apple Silicon. Lo publica el usuario `dendriteholdings` como espejo publico de la submission ganadora del minero `5HgX5p6KZVij3qMQNRELKffP27TqXf99srbii5xK3gyqZUdB` (uid 49) en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que mas se le aproxima. El modelo base es `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`, refinado por el minero mediante un finetune sobre los pesos no ternarios.

La relevancia del modelo es doble. Por un lado, demuestra un pipeline de cuantizacion extrema: los pesos se almacenan como codigos ternarios de 2 bits con una escala fp16 y un sesgo por cada bloque de 128 pesos, lo que da 2,25 bits por peso y un unico fichero `model.safetensors` de 8,60 GB. Por otro, es un caso de estudio de destilacion hacia un profesor BF16: el autor reporta una divergencia KL de 0,09246 y una distancia de estados ocultos de 0,3173 frente al profesor, ligeramente mejores que las del modelo rey al que desplazo en la misma evaluacion.

El modelo esta pensado para inferencia local en hardware Apple Silicon mediante el motor MTPLX, que soporta el layout propietario `prism_hadamard_qwen35` que mlx-lm no carga de forma nativa. No se trata de un modelo de proposito general con documentacion extensa, sino de un artefacto de competicion con metricas de fidelidad al profesor y de velocidad de decodificacion bien acotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con pesos ternarios (layout `prism_hadamard_qwen35`, linaje Qwen3.5) |
| Parametros totales | 27.359.638.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternarios con escala fp16 y sesgo por bloque de 128 pesos (2,25 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit); existe un gemelo en GGUF en `dendriteholdings/Ingot-XIX-27B-Q2` |
| Tamano del repositorio | 8,60 GB |
| Biblioteca de inferencia | mlx (via MTPLX) |
| Fecha de publicacion | 2026-11-01 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de aproximadamente 27,36 mil millones de parametros, heredado de Prism ML (linaje Qwen3.5 segun el tag `prism_hadamard_qwen35`). La innovacion central no esta en la topologia sino en la representacion de los pesos: cada bloque de 128 pesos conserva sus codigos ternarios y una escala fp16, y se decodifica como valor affine 2-bit de MLX con escala `d` y sesgo `-d`. El autor afirma que cada peso decodifica exactamente al mismo numero que usa el kernel GGUF, de modo que el empaquetado MLX es una conversion sin perdida del upload del minero.

El entrenamiento consistio en un finetune del modelo ternario base `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit` orientado a acercar las distribuciones de salida al profesor Qwen3.8-27B en BF16. No se detalla el volumen de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La torre de vision, la configuracion, el tokenizer y los vectores de signo de Hadamard provienen intactos de Prism ML y no fueron modificados por la competicion. El repositorio no incluye cabecera de borrador MTP, por lo que la decodificacion avanza un token por paso salvo que se empareje con el drafter externo DFlash 2.

## Capacidades

- Generacion de texto conversacional y continuacion de prompts, con pipeline `text-generation`.
- Razonamiento y codigo: el autor reporta velocidades de decodificacion especificas sobre prompts de codigo, lo que indica uso previsto en generacion de codigo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales: pesos ternarios de 2 bits optimizados para Apple Silicon; compatible con decodificacion especulativa mediante el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2-MLX`), que eleva el decode greedy de 59 a unos 73 tok/s y hasta unos 90 tok/s en respuestas de codigo.
- Torre de vision: el modelo base incluye torre de vision segun la model card, pero no se documenta su uso en este pack.

## Casos de uso

- Inferencia local en Mac con memoria unificada: con 8,60 GB de pesos, el modelo cabe en equipos Apple Silicon de gama alta (el autor lo mide en un Mac Studio M3 Ultra con 512 GB) y permite servir un modelo de 27B sin GPU dedicada, a unos 55-60 tok/s en decode.
- Prototipado de asistentes conversacionales en local: al exponerse como API compatible con OpenAI mediante `mtplx serve`, se puede integrar en aplicaciones existentes que ya consumen ese formato sin cambios de codigo.
- Generacion de codigo con latencia interactiva: el autor reporta unos 90 tok/s en respuestas de codigo con el drafter DFlash 2, adecuado para autocompletado y pair programming en local.
- Investigacion sobre cuantizacion extrema: sirve como referencia reproducible para estudiar la fidelidad de pesos ternarios frente a un profesor BF16, con metricas KL y de distancia de estados ocultos publicadas.
- Evaluacion de pipelines de destilacion en subnets de Bittensor: util para mineros y validadores que quieran comparar tecnicas de cuantizacion contra este baseline ganador.
- Despliegue en entornos con restricciones de memoria: 2,25 bits por peso reduce el footprint a aproximadamente un tercio de un modelo de 27B en BF16, lo que permite ejecutarlo en equipos donde un 27B completo no cabria.
- Comparacion de motores de inferencia: el gemelo GGUF corre en el fork de llama.cpp de Dendrite a 56,4 tok/s en el mismo Mac y a 137 tok/s en una RTX PRO 6000, lo que permite contrastar rendimiento entre backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad al profesor y de velocidad:

| Metrica | Este modelo | Modelo rey al que desplazo |
|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta | 0,09246 | 0,09418 |
| Distancia de estados ocultos relativa (media cada 8 capas) | 0,3173 | 0,3201 |

| Motor | Modo | Decode tok/s |
|---|---|---|
| MTPLX 2.12 (mlx 0.32) servidor | plano | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | plano | 59,9 |
| Con drafter DFlash 2 (greedy, single-stream) | especulativo | ~73 |
| Con drafter DFlash 2 (respuestas de codigo) | especulativo | ~90 |

Las mediciones se realizaron en un Mac Studio M3 Ultra (GPU de 80 nucleos, 512 GB). El gemelo GGUF decodifica a 56,4 tok/s en el mismo Mac y a 137 tok/s en una RTX PRO 6000.

## Requisitos de hardware

- VRAM / memoria unificada: aproximadamente 8,60 GB solo para los pesos; hay que anadir la cache KV y el overhead del runtime, por lo que se recomienda un minimo de 16 GB de memoria unificada para contexto corto.
- GPU recomendadas: Apple Silicon de gama alta (M3 Ultra, M2 Ultra, M4 Max). En el caso del gemelo GGUF, una RTX PRO 6000 alcanza 137 tok/s.
- Cabe en GPU consumer: si, en equipos Apple Silicon con memoria unificada suficiente; no esta pensado para GPUs NVIDIA consumer por el formato MLX.
- Opciones de despliegue: MTPLX (`pip install mtplx`) como servidor compatible con OpenAI; mlx-lm con los kernels ternarios de MTPLX en proceso; el gemelo GGUF en el fork de llama.cpp de Dendrite.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en M3 Ultra; con el drafter DFlash 2, unos 73 tok/s en greedy y unos 90 tok/s en codigo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XIX-27B-MLX-2bit | 27,36B | 2,25 bits (ternario) | no disponible | no disponible | MLX, Apple Silicon |
| Ingot-XIX-27B-Q2 (gemelo GGUF) | 27,36B | 2 bits | no disponible | no disponible | GGUF, llama.cpp fork |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | no disponible | 2 bits ternario | no disponible | no disponible | MLX |
| Qwen3.8-27B (profesor BF16) | ~27B | BF16 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, por lo que no se puede confirmar el uso comercial.
- Los idiomas soportados no estan documentados; no se puede garantizar cobertura multilingue.
- La longitud de contexto no esta publicada.
- Es un artefacto de competicion: no hay documentacion de sesgos, alineacion ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a un modelo de 27B cuantizado a 2 bits; la fidelidad al profesor es alta en KL pero no perfecta.
- El layout `prism_hadamard_qwen35` no lo carga mlx-lm de forma nativa; requiere MTPLX o los kernels especificos, lo que limita la portabilidad.
- El repositorio no incluye cabecera MTP, por lo que sin el drafter externo la decodificacion es de un token por paso.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de la comunidad.
- La torre de vision existe en el modelo base pero no se documenta su funcionamiento en este pack.

## Enlaces

- Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XIX-27B-MLX-2bit
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XIX-27B-Q2
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Motor MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
