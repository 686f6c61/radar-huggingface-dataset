# dendriteholdings/Ingot-XXIII-27B-MLX-2bit

## Resumen

Ingot-XXIII-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) publicado por dendriteholdings como espejo público del ganador de Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo maestro fijo y el validador corona la copia que se mantiene más próxima a él. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, al que el minero ha reajustado los pesos no ternarios para acercarlo a Qwen3.8-27B, manteniendo intactos los códigos ternarios.

El resultado es un modelo de generación de texto empaquetado en formato MLX affine de 2 bits, pensado específicamente para Apple Silicon. Cada bloque de 128 pesos conserva su código ternario y su escala fp16 (escala d, sesgo −d), de modo que cada peso decodifica exactamente al mismo valor que usa el kernel GGUF del gemelo del modelo. El repositorio ocupa 8,60 GB y consta de un único archivo safetensors con 2,25 bits por peso.

Su relevancia es doble: por un lado, demuestra que la cuantización ternaria extrema (2 bits) puede acercarse a un maestro BF16 con una divergencia KL de 0,08662, superando al rey anterior (0,08842); por otro, ofrece un caso práctico de inferencia de un modelo de 27B en hardware de consumo Apple con velocidades de decodificación de 55-60 tokens por segundo. No dispone de cabecera de borrador MTP, por lo que decodifica un token por paso salvo que se combine con el drafter especulativo DFlash 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35`), pesos ternarios con cuantización affine MLX de 2 bits |
| Parametros totales | 27.359.638.768 (27,36 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2 bits ternario (2,25 bits por peso: códigos de 2 bits, escala fp16 y sesgo por cada 128 pesos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX affine 2-bit), 8,60 GB en un único archivo |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de la familia Qwen3.8-27B (según el layout `prism_hadamard_qwen35` y la referencia al maestro Qwen3.8-27B), cuyos pesos han sido cuantizados a valores ternarios y posteriormente reajustados. La innovación central es el esquema de cuantización: cada bloque de 128 pesos mantiene un código ternario de 2 bits más una escala fp16 y un sesgo de −d, lo que da 2,25 bits por peso y una huella total de 8,60 GB. Incluye vectores de signo de Hadamard (Hadamard sign vectors) heredados de Prism ML, que forman parte del layout `prism_hadamard_qwen35`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El proceso de refinamiento es el propio de la competición Ingot: el minero recibe el modelo maestro fijo (Ternary Bonsai 2 27B) y ajusta los pesos no ternarios para minimizar la divergencia respecto al maestro BF16 (Qwen3.8-27B), evaluada mediante KL de las distribuciones del siguiente token y distancia de estados ocultos promediada cada 8 capas. La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard son los originales de Prism ML y no se modifican en la competición.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tags `conversational`).
- Razonamiento y respuesta a instrucciones, heredados del maestro Qwen3.8-27B.
- Generación de código: los benchmarks de velocidad del autor miden decodificación sobre prompts de código, con hasta ~90 tok/s con el drafter especulativo.
- Capacidad de visión: el modelo incluye torre de visión heredada de Prism ML (mencionada explícitamente en la model card), aunque no se detallan sus prestaciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Decodificación especulativa opcional mediante el drafter DFlash 2 (dendriteholdings/Ingot-27B-DFlash2-MLX), que eleva la velocidad de decodificación greedy de 59 a ~73 tok/s.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado en MLX affine 2-bit y cabe en 8,60 GB, por lo que se puede ejecutar en un Mac con GPU unificada (el autor reporta 55,3 tok/s en un Mac Studio M3 Ultra de 80 núcleos GPU y 512 GB). Adecuado para prototipado y despliegue local sin GPU dedicada.
- Servicio de API compatible con OpenAI: mediante `mtplx serve` se expone como endpoint HTTP compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes que ya consumen la API de OpenAI sin cambios de cliente.
- Generación de código asistida en local: con el drafter DFlash 2 las respuestas de código alcanzan ~90 tok/s en el M3 Ultra, lo que lo hace viable para autocompletado y generación de código en el editor con latencia interactiva.
- Investigación en cuantización extrema: al publicar métricas de fidelidad respecto al maestro (KL 0,08662 y distancia de estados ocultos 0,3123), sirve como referencia reproducible para estudiar el impacto de la cuantización ternaria en modelos de 27B.
- Evaluación de competiciones de cuantización (Bittensor/Ingot): el modelo es un artefacto verificable del subnet Ingot, útil para reproducir evaluaciones de fidelidad y comparar estrategias de mineros.
- Despliegue en entornos con memoria limitada: con 2,25 bits por peso, un modelo de 27B ocupa menos de 9 GB, lo que permite ejecutarlo en equipos donde un modelo de 27B en BF16 (≈54 GB) no cabría.
- Réplica de resultados en GGUF: el gemelo GGUF del mismo modelo se ejecuta en el fork de llama.cpp de Dendrite, útil para comparar rendimiento entre ecosistemas MLX y llama.cpp sobre los mismos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad respecto al maestro BF16 y de velocidad de decodificación:

| Metrica | Este modelo | Rey anterior (misma eval) |
|---|---|---|
| KL(teacher ‖ model) del siguiente token | 0,08662 | 0,08842 |
| Distancia de estados ocultos (cada 8 capas) | 0,3123 | 0,3139 |

| Motor | Modo | Decodificacion (tok/s) |
|---|---|---|
| MTPLX 2.12 (mlx 0.32), servidor | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | plain | 59,9 |
| mlx-lm + drafter DFlash 2 (greedy, single-stream) | especulativo | ~73 (hasta ~90 en código) |
| Gemelo GGUF en fork llama.cpp de Dendrite, Mac Studio M3 Ultra | plain | 56,4 |
| Gemelo GGUF en RTX PRO 6000 | plain | 137 |

## Requisitos de hardware

- VRAM / memoria unificada: 8,60 GB de pesos en 2,25 bits por peso; el repositorio completo ocupa 8,6 GB. La memoria adicional para KV cache y activaciones no está cuantificada en la información disponible.
- GPU recomendadas: Apple Silicon con GPU unificada (el autor mide en un Mac Studio M3 Ultra con GPU de 80 núcleos y 512 GB). Para el gemelo GGUF se reporta una RTX PRO 6000.
- Cabe en GPU de consumo: sí, en términos de pesos (8,6 GB); el autor no reporta pruebas en GPUs de consumo concretas (RTX 4090, etc.).
- Opciones de despliegue: MTPLX (`pip install mtplx; mtplx serve --model ... --generation-mode ar --port 8080 --no-auth --yes`), que expone API compatible con OpenAI. mlx-lm 0.31 no carga el layout `prism_hadamard_qwen35` directamente, pero puede usarse con los kernels ternarios de MTPLX. El gemelo GGUF requiere el fork de llama.cpp de Dendrite.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en Mac Studio M3 Ultra (batch 1, 256 tokens generados en la medición de servidor; 128 tokens in-process). Con DFlash 2, ~73 tok/s en greedy y ~90 tok/s en código.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXIII-27B-MLX-2bit | 27,36B | No disponible | 2 bits ternario (2,25 bpw) | No disponible | MLX safetensors, 8,6 GB |
| dendriteholdings/Ingot-XXIII-27B-Q2 (gemelo GGUF) | 27,36B | No disponible | 2 bits ternario | No disponible | GGUF, fork llama.cpp de Dendrite |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | ~27B | No disponible | 2 bits ternario | No disponible | MLX safetensors |
| Qwen3.8-27B (maestro BF16) | ~27B | No disponible | BF16 | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ternaria de 2 bits introduce una divergencia medible respecto al maestro BF16 (KL 0,08662; distancia de estados ocultos 0,3123), por lo que la calidad no es equivalente a la del modelo completo en BF16.
- No se dispone de información sobre sesgos conocidos, idiomas soportados ni evaluación de alucinación; no hay datos para valorar estos riesgos.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial. Es un riesgo relevante para producción.
- El layout `prism_hadamard_qwen35` no lo carga mlx-lm de forma nativa; requiere MTPLX o kernels específicos, lo que limita la portabilidad del despliegue.
- El repositorio no incluye cabecera de borrador MTP, por lo que sin el drafter DFlash 2 la decodificación es de un token por paso (55-60 tok/s en el hardware medido).
- El modelo es un artefacto de competición (subnet Ingot de Bittensor) con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- Las métricas de velocidad se han medido únicamente en un Mac Studio M3 Ultra (80 núcleos GPU, 512 GB); no hay datos de latencia en otras configuraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-XXIII-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XXIII-27B-Q2
- Modelo base (Prism ML, MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base (Prism ML, GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- MTPLX (servidor MLX compatible con OpenAI): https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
