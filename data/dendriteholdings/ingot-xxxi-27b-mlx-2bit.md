# dendriteholdings/Ingot-XXXI-27B-MLX-2bit

## Resumen

Ingot-XXXI-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que más se le aproxima en divergencia KL. El modelo parte de Prism ML Ternary Bonsai 2 27B y aplica una cuantización ternaria de 2 bits por peso (códigos ternarios con escala y sesgo fp16 cada 128 pesos), empaquetada en formato MLX affine 2-bit para Apple Silicon.

La relevancia del modelo es doble: por un lado demuestra que una cuantización agresiva a 2 bits puede mantener una fidelidad alta respecto al profesor en BF16 (KL de 0,09022 frente a 0,09214 del rey anterior en la misma evaluación), y por otro ofrece un artefacto de 8,6 GB que se ejecuta en hardware Apple Silicon con velocidades de decodificación de 55-60 tokens por segundo en un Mac Studio M3 Ultra. El minero modificó menos del 0,01% de los códigos ternarios del modelo base y reajustó el resto de pesos para acercarlo a Qwen3.8-27B.

El modelo se distribuye exclusivamente en safetensors con el layout `prism_hadamard_qwen35`, que mlx-lm no carga de forma nativa; requiere MTPLX o un runner compatible. No se especifican licencia ni idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B vía Ternary Bonsai 2), con capa de visión heredada de Prism ML |
| Parámetros totales | 27.359.638.768 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2-bit ternario (2,25 bits por peso; códigos ternarios con escala fp16 y sesgo −d por cada 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit, layout `prism_hadamard_qwen35`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 27B parámetros derivado de Prism ML Ternary Bonsai 2 27B, que a su vez se basa en Qwen3.8-27B. La cuantización ternaria agrupa los pesos en bloques de 128, cada uno con un código ternario y una escala fp16 junto con un sesgo de −d, de modo que cada peso decodifica al mismo valor numérico que usa el kernel gguf equivalente. El proceso de destilación por cuantización se realizó dentro del subnet Ingot: el minero partió del modelo profesor, alteró menos del 0,01% de los códigos ternarios y reentrenó el resto de pesos para minimizar la divergencia KL respecto al profesor en BF16.

La evaluación del subnet mide KL(profesor ‖ modelo) por token de respuesta sobre las distribuciones del siguiente token, ponderando cada dominio por su peso en las muestras. El modelo ganador obtuvo 0,09022 frente a 0,09214 del rey anterior. La torre de visión, la configuración, el tokenizer y los vectores de signo de Hadamard provienen del modelo base de Prism ML y no se modifican en la competición. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de código, según la evaluación por dominios del subnet Ingot (que incluye un dominio de código con prompt específico).
- Capacidades de visión heredadas de la torre de visión de Prism ML Ternary Bonsai 2 27B (no modificada por la competición).
- Ejecución en Apple Silicon mediante MTPLX con API compatible con OpenAI.
- Decodificación especulativa opcional mediante el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2-MLX`), que eleva la decodificación greedy de ~59 a ~73 tok/s y hasta ~90 tok/s en respuestas de código.
- No se documenta soporte explícito de tool calling, function calling, agentes o modo thinking en la información disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo ocupa 8,6 GB y se sirve con `mtplx serve` como API compatible con OpenAI, lo que permite desplegarlo en un Mac Studio o MacBook con suficiente memoria unificada sin GPU dedicada.
- Evaluación de técnicas de cuantización extrema: sirve como referencia reproducible para estudiar la fidelidad KL de esquemas ternarios de 2 bits frente a un profesor BF16 en dominios diversos.
- Investigación en subnets de Bittensor: el artefacto documenta el pipeline completo (submission, hotkey, evaluación KL) y permite reproducir la comparación entre el modelo ganador y el rey anterior.
- Generación de código en local con decodificación especulativa: combinando el modelo con el drafter DFlash 2 se alcanzan ~90 tok/s en respuestas de código en M3 Ultra, adecuado para asistentes de programación offline.
- Prototipado de aplicaciones conversacionales de bajo consumo: el tamaño reducido (8,6 GB) permite integrar el modelo en entornos con memoria unificada limitada manteniendo 27B parámetros nominales.
- Benchmarking de runners MLX: el layout `prism_hadamard_qwen35` y las cifras de velocidad publicadas (55,3 tok/s en servidor MTPLX, 59,9 tok/s en proceso con mlx-lm 0.31) permiten comparar implementaciones de kernels ternarios.
- Despliegue en el fork de llama.cpp de Dendrite: el gemelo gguf de estos pesos decodifica a 56,4 tok/s en el mismo Mac y a 137 tok/s en una RTX PRO 6000, lo que habilita escenarios con GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos publicados son de fidelidad y velocidad:

| Métrica | Este modelo | Rey anterior | Notas |
|---|---|---|---|
| KL(profesor ‖ modelo) | 0,09022 | 0,09214 | Evaluación del subnet Ingot, menor es mejor |
| Decode tok/s (MTPLX 2.12 server, batch 1) | 55,3 | — | Mac Studio M3 Ultra, 80-core GPU, 512 GB, 256 tokens generados |
| Decode tok/s (mlx-lm 0.31 in-process) | 59,9 | — | Mismo hardware, 128 tokens, sin servidor |
| Decode tok/s (gguf twin, llama.cpp fork) | 56,4 | — | Mismo Mac |
| Decode tok/s (gguf twin, RTX PRO 6000) | 137 | — | GPU NVIDIA |
| Decode tok/s con drafter DFlash 2 | ~73 (greedy), ~90 (código) | — | M3 Ultra, decodificación especulativa |

## Requisitos de hardware

- VRAM/memoria unificada: 8,6 GB de pesos en safetensors; se requiere memoria adicional para el contexto y el runtime MLX.
- GPU recomendadas: Apple Silicon (M3 Ultra con GPU de 80 núcleos validado). Para el gemelo gguf se reporta funcionamiento en RTX PRO 6000.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; el tamaño de 8,6 GB permite ejecución en Mac con 16 GB o más de memoria unificada (no confirmado explícitamente para configuraciones menores).
- Opciones de despliegue: MTPLX (`pip install mtplx`, `mtplx serve`) como API compatible con OpenAI; mlx-lm 0.31 con los kernels ternarios de MTPLX en proceso; el gemelo gguf en el fork de llama.cpp de DendriteLabs. El layout `prism_hadamard_qwen35` no lo carga mlx-lm de forma nativa.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s en proceso en M3 Ultra; ~73 tok/s con drafter DFlash 2 en greedy y ~90 tok/s en código. El repo no incluye cabecera MTP draft, por lo que sin el drafter externo decodifica un token por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXI-27B-MLX-2bit | 27,36B | no disponible | 2-bit ternario MLX | no disponible | Hugging Face (MLX) |
| Ingot-XXXI-27B-Q2 (gemelo gguf) | 27,36B | no disponible | 2-bit ternario gguf | no disponible | Hugging Face (gguf), fork llama.cpp |
| Prism ML Ternary Bonsai 2 27B | 27B (aproximado) | no disponible | ternario (gguf y mlx) | no disponible | Hugging Face |
| Qwen3.8-27B (profesor de referencia) | 27B (aproximado) | no disponible | BF16 (profesor) | no disponible | no disponible en la información |

No se dispone de datos de benchmarks comparativos entre estos modelos más allá de la KL frente al profesor.

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible; no se puede confirmar el uso comercial sin consultar el repositorio original.
- No se documentan los idiomas soportados; el comportamiento multilingüe es incierto.
- La longitud de contexto no está publicada.
- La cuantización a 2 bits ternarios introduce degradación respecto al profesor BF16 (KL de 0,09022), que puede manifestarse en tareas sensibles a la precisión numérica.
- El layout `prism_hadamard_qwen35` no es compatible con mlx-lm estándar; requiere MTPLX u otro runner específico, lo que limita la portabilidad.
- Sin el drafter DFlash 2, la decodificación es de un token por paso (sin MTP), con menor throughput.
- Riesgo de alucinación inherente a modelos de 27B cuantizados; no se han publicado evaluaciones de sesgo ni de robustez.
- El modelo proviene de una competición de cuantización (subnet Ingot) y no de un entrenamiento supervisado convencional; su comportamiento fuera de los dominios evaluados no está caracterizado.
- El número de descargas y likes es 0 en el momento de la consulta, lo que indica adopción aún muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXI-27B-MLX-2bit
- Gemelo gguf: https://huggingface.co/dendriteholdings/Ingot-XXXI-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base gguf: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
