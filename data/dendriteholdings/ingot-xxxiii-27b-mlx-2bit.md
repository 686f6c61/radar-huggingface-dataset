# dendriteholdings/Ingot-XXXIII-27B-MLX-2bit

## Resumen

Ingot-XXXIII-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) distribuido en formato MLX con cuantización ternaria de 2 bits, desarrollado por dendriteholdings. Se trata de un mirror público de la submission ganadora del subred Bittensor "Ingot", una competición en la que los mineros cuantizan un modelo maestro fijo (Ternary Bonsai 2 27B de Prism ML) y el validador premia la copia que se mantiene más próxima a él en divergencia KL. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit y el minero modificó menos del 0,01 % de sus códigos ternarios, reajustando el resto de pesos para acercarlo a Qwen3.8-27B.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de cuantización extrema (2,25 bits por peso, 8,60 GB de repo para 27B parámetros) orientada a Apple Silicon; por otro, expone un ecosistema de herramientas específicas (MTPLX, fork de llama.cpp de DendriteLabs, drafter DFlash 2) que no forman parte del stack estándar de mlx-lm. El modelo conserva el layout `prism_hadamard_qwen35` de Prism ML, lo que implica que no se carga con mlx-lm convencional.

La información pública disponible es limitada: la model card no especifica licencia, idiomas soportados ni resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K). Los únicos datos cuantitativos son la divergencia KL frente al profesor BF16 y las tasas de decodificación medidas en hardware Apple concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35` de Prism ML; base derivada de Qwen3.8-27B según la model card) |
| Parámetros totales | 27.359.638.768 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria 2-bit con escala fp16 y bias por bloque de 128 pesos (2,25 bits por peso efectivos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit) |

## Arquitectura y entrenamiento

El modelo es un transformer de 27,36 mil millones de parámetros cuyos pesos se almacenan en códigos ternarios de 2 bits agrupados en bloques de 128 pesos, cada uno con su escala fp16 y un bias de −d, de modo que cada peso decodifica al mismo valor numérico que emplea el kernel GGUF equivalente. El layout de pesos es `prism_hadamard_qwen35`, propietario de Prism ML, e incluye vectores de signo de Hadamard, config, tokenizer y torre de visión heredados de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit. La model card indica que el modelo base deriva de Qwen3.8-27B.

El proceso de entrenamiento no es un preentrenamiento al uso: se trata de una competición de cuantización sobre un profesor fijo. El minero `5HEUU8jj2dDmGbe4GeEc82hUsD2pnXrjqcFQUNfj4xyB97A2` (uid 176) modificó menos del 0,01 % de los códigos ternarios del modelo base y reajustó el resto de pesos para minimizar la divergencia respecto a Qwen3.8-27B. No se documentan volúmenes de tokens, composición del dataset, ni fases de RLHF o DPO. La conversión a MLX es sin pérdida respecto al GGUF original: cada bloque de 128 pesos conserva sus códigos ternarios y su escala fp16. El repo no incluye cabecera MTP (multi-token prediction) para decodificación especulativa.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tags `conversational`).
- Razonamiento y generación de código: la model card mide decodificación sobre prompts de código y reporta velocidades específicas para respuestas de código.
- Torre de visión heredada de Prism ML (el repo incluye la torre de visión de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit), si bien no se detallan sus capacidades concretas.
- Servido como API compatible con OpenAI mediante MTPLX (`mtplx serve`).
- Decodificación especulativa opcional mediante el drafter DFlash 2 (repo separado dendriteholdings/Ingot-27B-DFlash2-MLX).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo ocupa 8,60 GB en disco y decodifica a 55,3 tok/s en un Mac Studio M3 Ultra (80 núcleos GPU, 512 GB) con MTPLX 2.12 en modo servidor, lo que lo hace viable para asistentes y prototipos en estaciones de trabajo Mac sin GPU dedicada.
- Servicio de API compatible con OpenAI: mediante `mtplx serve --model dendriteholdings/Ingot-XXXIII-27B-MLX-2bit --generation-mode ar --port 8080` se expone un endpoint HTTP que permite integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI, sin reescribir clientes.
- Generación de código asistida con baja latencia: con el drafter DFlash 2 las respuestas de código alcanzan aproximadamente 90 tok/s en el M3 Ultra citado, adecuado para autocompletado o revisión de código interactiva en local.
- Investigación en cuantización extrema: el modelo sirve como referencia reproducible de cuantización ternaria a 2,25 bits/peso con métrica KL frente a profesor BF16 (0,08273 en su evaluación ganadora), útil para estudiar la degradación de modelos grandes comprimidos.
- Evaluación de ecosistemas alternativos de inferencia: permite comparar MTPLX frente al fork de llama.cpp de DendriteLabs sobre los mismos pesos (55,3 tok/s en MLX frente a 56,4 tok/s en GGUF en el mismo Mac), un caso práctico para decidir stack de despliegue.
- Reproducción de competiciones Bittensor: el repo documenta hotkey, uid y submission ID, lo que facilita replicar la evaluación del subred Ingot o auditar la submission ganadora.
- Prototipado de decodificación especulativa: el par modelo + drafter DFlash 2 (59 → ~73 tok/s en greedy single-stream) sirve para medir el beneficio real de la decodificación especulativa en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos publicados son la divergencia KL frente al profesor y las tasas de decodificación:

| Métrica | Este modelo | Referencia |
|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta | 0,08273 | 0,08445 (el "king" al que superó en la misma evaluación) |
| Decodificación, MTPLX 2.12 (mlx 0.32) servidor, batch 1 | 55,3 tok/s | Mac Studio M3 Ultra, 80-core GPU, 512 GB |
| Decodificación, mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | 59,9 tok/s | Mismo hardware, 128 tokens sin servidor |
| Decodificación con drafter DFlash 2 | ~73 tok/s greedy single-stream; ~90 tok/s en código | Mismo hardware |
| Decodificación del gemelo GGUF en fork llama.cpp de DendriteLabs | 56,4 tok/s (Mac) / 137 tok/s (RTX PRO 6000) | Mismo Mac para la primera cifra |

## Requisitos de hardware

- VRAM/espacio en disco: 8,60 GB de pesos en safetensors (2,25 bits por peso). Al ser MLX, el modelo se ejecuta sobre memoria unificada de Apple Silicon, no sobre VRAM de GPU discreta.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente para alojar los 8,60 GB más overhead de activaciones y caché KV (no cuantificado en la información disponible). Las mediciones publicadas usan un Mac Studio M3 Ultra con 80 núcleos GPU y 512 GB.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con memoria unificada holgada; no se publican mediciones en MacBook o Mac mini con menos memoria. Para el gemelo GGUF se reporta 137 tok/s en una RTX PRO 6000, hardware profesional, no de consumo.
- Opciones de despliegue: MTPLX (obligatorio para este layout, ya que mlx-lm no carga `prism_hadamard_qwen35`), con servidor compatible con OpenAI. El gemelo GGUF funciona en el fork de llama.cpp de DendriteLabs. No se menciona soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en el M3 Ultra; con DFlash 2, ~73 tok/s en greedy y ~90 tok/s en código. No se publican latencias de primer token ni throughput con batch mayor que 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXIII-27B-MLX-2bit | 27,36 B | no disponible | Ternaria 2-bit (2,25 bits/peso) | no disponible | Hugging Face (MLX) |
| dendriteholdings/Ingot-XXXIII-27B-Q2 | 27,36 B (mismos pesos) | no disponible | Ternaria 2-bit (GGUF) | no disponible | Hugging Face (GGUF), fork llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27 B (aproximado) | no disponible | Ternaria 2-bit | no disponible | Hugging Face (MLX) |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27 B (aproximado) | no disponible | Ternaria 2-bit (GGUF) | no disponible | Hugging Face (GGUF) |

No se dispone de datos de benchmarks comparativos entre estos modelos más allá de la divergencia KL y las tasas de decodificación ya citadas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial permitido; hay que contactar con el autor o revisar el modelo base antes de desplegar en producción.
- Idiomas soportados no documentados: no hay garantía de calidad fuera de los idiomas del modelo base (Qwen3.8-27B), y la cuantización ternaria puede degradar más en lenguas de bajos recursos.
- Riesgo de alucinación: no se publican evaluaciones de factualidad ni de calibración; la cuantización a 2 bits agrava típicamente la degradación en tareas de conocimiento factual.
- Divergencia medible frente al profesor: KL de 0,08273 por token de respuesta, lo que implica una distribución de salida distinta a la del profesor BF16; no es una réplica exacta.
- Dependencia de herramientas no estándar: el layout `prism_hadamard_qwen35` no se carga con mlx-lm; requiere MTPLX, y la decodificación especulativa requiere descargar un drafter separado.
- Sin cabecera MTP en este repo: la decodificación es de un token por paso salvo que se use el drafter DFlash 2 externo.
- Contexto no documentado: se desconoce la ventana máxima; planificar despliegues con contexto largo sin esta cifra es arriesgado.
- Procedencia de competición: los pesos provienen de una submission de un subred Bittensor con auditoría limitada; conviene validar el comportamiento en el dominio propio antes de confiar en él.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido, lo que limita el soporte comunitario y la depuración de problemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXIII-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XXXIII-27B-Q2
- Modelo base MLX de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base GGUF de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- MTPLX (servidor MLX): https://github.com/youssofal/mtplx
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
