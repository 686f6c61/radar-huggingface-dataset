# dendriteholdings/Ingot-XXXV-27B-MLX-2bit

## Resumen

Ingot-XXXV-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros publicado por dendriteholdings como espejo público del ganador de Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo maestro fijo y el validador corona la copia que se mantiene más próxima a él. El modelo parte de Prism ML Ternary Bonsai 2 27B y conserva sus códigos ternarios, pero el minero reajustó el resto de pesos para acercar la salida a Qwen3.8-27B. Esta variante es el empaquetado MLX, pensado para Apple Silicon, del mismo conjunto de pesos que su gemelo GGUF (dendriteholdings/Ingot-XXXV-27B-Q2).

La relevancia del modelo está en su formato: cada bloque de 128 pesos conserva su código ternario y su escala fp16 como valores afines de 2 bits de MLX (escala d, sesgo −d), de modo que el repositorio ocupa 8,60 GB con 2,25 bits por peso. La conversión es sin pérdida respecto al kernel GGUF, y el modelo se distribuye con la torre de visión, configuración, tokenizer y vectores de signo de Hadamard de Prism ML. La licencia y los idiomas no están declarados en la información disponible.

El modelo se presenta como una pieza de inferencia local en hardware Apple: la model card reporta 55,3 tok/s en decodificación plana vía servidor MTPLX y 59,9 tok/s en proceso con mlx-lm sobre un Mac Studio M3 Ultra. No es un modelo de propósito general documentado con benchmarks estándar, sino un artefacto de competición con métricas de fidelidad al maestro (KL) y de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35` de Prism ML; pesos ternarios cuantizados) |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits afines MLX (códigos ternarios con escala fp16 y sesgo por bloque de 128 pesos; 2,25 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 8,60 GB en un único `model.safetensors` |

## Arquitectura y entrenamiento

El modelo es un transformer de 27B parámetros cuyos pesos siguen el layout `prism_hadamard_qwen35` de Prism ML, basado en la familia Qwen3.5 y con transformada de Hadamard aplicada antes de la cuantización, según se deduce de los vectores de signo de Hadamard incluidos en el pack. La cuantización es ternaria: cada bloque de 128 pesos mantiene un código ternario y una escala fp16, representados en MLX como valores afines de 2 bits con escala d y sesgo −d, de forma que cada peso decodifica al mismo número que usa el kernel GGUF.

El entrenamiento no está documentado en la información disponible: no se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Lo que sí se describe es el proceso de refinamiento: el minero de Ingot (hotkey `5GQTgx8NZvRPVxauQk2FpcHW2ZbcNmkwRwtzztgXyqAv937u`, uid 127) reajustó los pesos no ternarios de Ternary Bonsai 2 27B para acercar la distribución de salida a Qwen3.8-27B, y la conversión a MLX se realizó sin pérdida. La torre de visión, configuración, tokenizer y vectores de Hadamard provienen de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit y no fueron modificados por la competición.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de código: la model card menciona prompts de código en las mediciones de velocidad y respuestas de código con decodificación especulativa.
- Visión: el pack incluye la torre de visión de Prism ML, aunque no se detallan las capacidades multimodales resultantes.
- Decodificación especulativa opcional mediante el drafter DFlash 2 (dendriteholdings/Ingot-27B-DFlash2-MLX), que eleva la decodificación greedy de 59 a unos 73 tok/s y hasta unos 90 tok/s en respuestas de código.
- Servido como API compatible con OpenAI mediante MTPLX.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado en MLX y ocupa 8,60 GB, por lo que se puede servir en un Mac con suficiente memoria unificada usando MTPLX como API compatible con OpenAI, sin depender de GPU dedicada.
- Prototipado de asistentes conversacionales en estación de trabajo: con 27B parámetros y decodificación de 55-60 tok/s en un M3 Ultra, es viable para desarrollo interactivo y pruebas de prompts antes de desplegar en producción.
- Generación de código asistida en local: la model card reporta hasta unos 90 tok/s en respuestas de código con el drafter DFlash 2, adecuado para autocompletado o chat de código en un entorno de desarrollo privado.
- Evaluación de técnicas de cuantización extrema: al ser un artefacto de un subnet de cuantización con métrica KL frente al maestro, sirve como referencia para investigar el impacto de 2 bits ternarios en la fidelidad de la distribución de salida.
- Reproducción de pipelines de decodificación especulativa: el par modelo + drafter DFlash 2 permite experimentar con verificación especulativa en MLX y medir ganancias de throughput en hardware Apple.
- Investigación sobre competiciones descentralizadas: el modelo documenta el flujo de Ingot (minero, submission, corona) y puede usarse como caso de estudio de evaluación por fidelidad a un maestro fijo.
- Despliegue en entornos con memoria limitada: los 8,60 GB de pesos permiten cargar el modelo en equipos con 16-32 GB de memoria unificada, algo inviable con el maestro en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad al maestro y de velocidad:

| Metrica | Valor |
|---|---|
| KL(maestro ‖ modelo) por token de respuesta, evaluación ganadora | 0,08062 |
| KL(maestro ‖ modelo) del rey al que superó, misma evaluación | 0,08251 |
| Decodificación, MTPLX 2.12 (mlx 0.32) servidor, batch 1, M3 Ultra | 55,3 tok/s |
| Decodificación, mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | 59,9 tok/s |
| Decodificación con drafter DFlash 2, greedy single-stream | ~73 tok/s |
| Decodificación con drafter DFlash 2, respuestas de código | ~90 tok/s |
| Gemelo GGUF en fork de llama.cpp de Dendrite, mismo Mac | 56,4 tok/s |
| Gemelo GGUF en RTX PRO 6000 | 137 tok/s |

Las mediciones de servidor corresponden a 256 tokens generados sobre un prompt de código y medidas por HTTP; las de proceso, a 128 tokens sin servidor.

## Requisitos de hardware

- VRAM/memoria: 8,60 GB de pesos en safetensors a 2,25 bits por peso; el consumo total en inferencia es mayor por cachés KV y overhead del runtime (no cuantificado en la información disponible).
- GPU recomendadas: Apple Silicon con memoria unificada; las mediciones se hicieron en un Mac Studio M3 Ultra con GPU de 80 núcleos y 512 GB. No se documenta soporte para CUDA en esta variante MLX.
- ¿Cabe en GPU consumer? En Apple Silicon, sí: los 8,60 GB de pesos permiten cargarlo en equipos con 16 GB o más de memoria unificada, aunque el contexto y el runtime condicionan el margen real.
- Opciones de despliegue: MTPLX (`mtplx serve`, API compatible con OpenAI) es el runtime documentado, ya que mlx-lm no carga el layout `prism_hadamard_qwen35`. El gemelo GGUF funciona en el fork de llama.cpp de Dendrite.
- Latencia y throughput: 55,3 tok/s (servidor MTPLX) y 59,9 tok/s (mlx-lm en proceso) en M3 Ultra; con el drafter DFlash 2, ~73 tok/s en greedy y ~90 tok/s en código. El gemelo GGUF alcanza 137 tok/s en una RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXV-27B-MLX-2bit | 27,36B | no disponible | MLX safetensors, 2,25 bits/peso, 8,60 GB | no disponible | Hugging Face (dendriteholdings) |
| Ingot-XXXV-27B-Q2 (gemelo GGUF) | 27,36B (mismos pesos) | no disponible | GGUF 2-bit; 56,4 tok/s en M3 Ultra, 137 tok/s en RTX PRO 6000 | no disponible | Hugging Face (dendriteholdings) |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | 27B (aproximado) | no disponible | MLX 2-bit ternario | no disponible | Hugging Face (prism-ml) |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base GGUF) | 27B (aproximado) | no disponible | GGUF ternario | no disponible | Hugging Face (prism-ml) |

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no se puede asumir uso comercial sin verificarla en el repositorio.
- Los idiomas soportados no están documentados; el comportamiento multilingüe es incierto.
- La longitud de contexto no está especificada, lo que impide planificar cargas de contexto largo con garantías.
- La cuantización ternaria de 2 bits introduce degradación respecto al maestro BF16; la métrica KL reportada (0,08062) cuantifica esa divergencia, no una calidad absoluta.
- No hay benchmarks estándar publicados, por lo que no se puede comparar su calidad con modelos de 27B convencionales en tareas concretas.
- El modelo depende de MTPLX para cargarse: mlx-lm no soporta el layout `prism_hadamard_qwen35`, lo que limita la portabilidad del stack.
- Esta variante no incluye la cabeza MTP de borrador, así que la decodificación es de un token por paso salvo que se use el drafter DFlash 2 externo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse empíricamente antes de producción.
- El modelo proviene de una competición de cuantización y su proceso de refinamiento no está detallado (datos, método, número de pasos), lo que dificulta auditar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXV-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XXXV-27B-Q2
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter de decodificación especulativa DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
