# dendriteholdings/Ingot-XXIX-27B-MLX-2bit

## Resumen

Ingot-XXIX-27B-MLX-2bit es un modelo de generación de texto de 27.359.638.768 parámetros (27,36 B) publicado por dendriteholdings. Se trata de un mirror público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene más próxima a él. El modelo parte de prism-ml/Ternary-Bonsai-2-27B, un modelo ternario de Prism ML, y el minero modificó menos del 0,01 % de sus códigos ternarios y reajustó el resto de pesos para acercarlo a Qwen3.8-27B.

La relevancia de este modelo no está en su rendimiento absoluto, sino en su naturaleza de artefacto de competición: demuestra que una cuantización ternaria de 2 bits puede conservar una fidelidad medible frente al profesor en BF16, con una divergencia KL de 0,07262 por token de respuesta. El pack está empaquetado específicamente para Apple Silicon mediante MLX, con pesos en safetensors de 8,60 GB.

El modelo conserva la torre de visión, el config, el tokenizer y los vectores de signo de Hadamard del modelo base de Prism ML, que la competición no modifica. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, layout `prism_hadamard_qwen35`); pesos ternarios con escala y sesgo fp16 por bloque de 128 pesos |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternarios (2,25 bits por peso: códigos de 2 bits, escala fp16 y sesgo fp16 por cada 128 pesos); empaquetado MLX affine 2-bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 8,60 GB en `model.safetensors` |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de la familia Qwen3.5, empaquetado con el layout propietario `prism_hadamard_qwen35` de Prism ML, que incorpora vectores de signo de Hadamard para la rotación de activaciones. Los pesos son ternarios: cada bloque de 128 pesos conserva un código ternario y una escala fp16, y el pack MLX los convierte sin pérdida a valores affine 2-bit de MLX (escala d, sesgo −d), de modo que cada peso decodifica al mismo número que usa el kernel GGUF. El resultado son 2,25 bits por peso efectivos.

El entrenamiento es un proceso de ajuste fino sobre el modelo base prism-ml/Ternary-Bonsai-2-27B-mlx-2bit. Según la model card, el minero alteró menos del 0,01 % de los códigos ternarios del profesor y reentrenó el resto de pesos para reducir la divergencia respecto a Qwen3.8-27B. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La submission ganadora corresponde al minero con hotkey `5GHhcBWpEGqP1xA3SjzPKpP9UuQtu9f5DygKZS67uZCESwru` (uid 90), coronada a partir de la submission `35143321-33f3-4ea7-bee7-1dc7cc8a283c`.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline `text-generation` y tag `conversational`.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5 subyacente.
- Capacidad de visión: el pack conserva la torre de visión del modelo base de Prism ML, aunque la información disponible no detalla su funcionamiento ni resolución.
- Generación de código: la model card reporta métricas específicas sobre prompts de código (256 tokens generados en pruebas de servidor).
- Decodificación especulativa opcional mediante un drafter DFlash 2 entrenado para esta familia de modelos (repo separado `dendriteholdings/Ingot-27B-DFlash2-MLX`).
- Servido como API compatible con OpenAI a través de MTPLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado en MLX y ocupa 8,60 GB, por lo que puede ejecutarse en Macs con memoria unificada suficiente usando MTPLX como servidor compatible con OpenAI. Es adecuado para desarrolladores que quieren un modelo de 27 B en local sin depender de GPU dedicadas.
- Evaluación de técnicas de cuantización extrema: sirve como referencia práctica de hasta dónde llega una cuantización ternaria de 2 bits (2,25 bits/peso) manteniendo una KL de 0,07262 frente al profesor en BF16, útil para investigadores que estudian compresión de modelos.
- Prototipado de asistentes conversacionales: el tag `conversational` y el pipeline de generación de texto permiten montar un chatbot multi-turno sobre la API de MTPLX sin infraestructura cloud.
- Generación de código asistida en local: la model card reporta velocidades de decodificación de hasta ~90 tok/s con el drafter DFlash 2 en prompts de código sobre un M3 Ultra, lo que lo hace viable para autocompletado y generación de fragmentos en un IDE.
- Investigación en subnets de Bittensor: el modelo documenta el flujo completo de una competición Ingot (minero, submission, validación por KL), por lo que es útil como caso de estudio de incentivos y evaluación en redes descentralizadas.
- Despliegue de bajo consumo en hardware de Apple: con 8,60 GB de pesos y decodificación de ~55-60 tok/s en un M3 Ultra, encaja en escenarios de edge computing o estaciones de trabajo donde el consumo energético y la ausencia de GPU NVIDIA son requisitos.
- Comparación de motores de inferencia: al existir un gemelo GGUF de los mismos pesos (56,4 tok/s en llama.cpp fork de Dendrite y 137 tok/s en RTX PRO 6000), permite comparar MLX frente a llama.cpp sobre el mismo modelo.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K). El único dato de calidad es la divergencia KL frente al profesor en BF16, promediada por token de respuesta:

| Metrica | Valor |
|---|---|
| KL(profesor ‖ este modelo) en su eval ganadora | 0,07262 |
| KL(profesor ‖ el rey al que superó), misma eval | 0,07505 |

Rendimiento de decodificación a batch 1 en Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB):

| Motor | Modo | Decode tok/s |
|---|---|---|
| MTPLX 2.12 (mlx 0.32) servidor | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | plain | 59,9 |
| Con drafter DFlash 2 (greedy, single-stream) | especulativo | ~73 (hasta ~90 en código) |
| Gemelo GGUF en fork de llama.cpp (misma Mac) | plain | 56,4 |
| Gemelo GGUF en RTX PRO 6000 | plain | 137 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 8,60 GB de pesos en safetensors; en la práctica se necesita memoria unificada adicional para KV cache y activaciones. La model card cita un Mac Studio M3 Ultra con 512 GB, pero no especifica el mínimo real.
- GPU recomendadas: Apple Silicon con GPU integrada (el modelo está empaquetado en MLX y probado en M3 Ultra de 80 núcleos). Para el gemelo GGUF se cita una RTX PRO 6000.
- Cabe en GPU consumer: no hay datos explícitos para GPUs NVIDIA consumer; el formato MLX está pensado para Apple Silicon. El gemelo GGUF de 8,60 GB podría caber en GPUs con 12-16 GB de VRAM, pero no se confirma en la información disponible.
- Opciones de despliegue: MTPLX (`mtplx serve`) como servidor compatible con OpenAI; mlx-lm 0.31 con los kernels ternarios de MTPLX en proceso; el gemelo GGUF en el fork de llama.cpp de DendriteLabs. No se menciona soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en M3 Ultra; ~73 tok/s con drafter DFlash 2 y ~90 tok/s en código. El gemelo GGUF alcanza 56,4 tok/s en la misma Mac y 137 tok/s en RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXIX-27B-MLX-2bit | 27,36 B | no disponible | 2-bit ternario (2,25 bpw) | no disponible | Hugging Face (MLX) |
| dendriteholdings/Ingot-XXIX-27B-Q2 | 27,36 B (mismos pesos) | no disponible | 2-bit ternario (GGUF) | no disponible | Hugging Face (GGUF) |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | no disponible | no disponible | 2-bit ternario | no disponible | Hugging Face (MLX) |
| Qwen3.8-27B (profesor de referencia) | ~27 B | no disponible | BF16 (referencia) | no disponible | no disponible en la información |

La comparativa se limita a los artefactos citados en la model card. No se dispone de datos de benchmarks comunes que permitan comparar rendimiento entre ellos más allá de la KL reportada (0,07262 frente a 0,07505 del rey anterior) y de las velocidades de decodificación del gemelo GGUF.

## Limitaciones y advertencias

- La licencia no está declarada; no se puede asumir uso comercial sin verificarlo con el autor.
- Los idiomas soportados no están documentados; el comportamiento multilingüe es incierto.
- La longitud de contexto no se especifica en la información disponible.
- Al ser una cuantización ternaria de 2 bits, la fidelidad frente al profesor es limitada: la KL de 0,07262 por token implica una divergencia no trivial en la distribución de siguiente token, con riesgo de degradación en tareas sensibles a matices.
- El modelo se ha ajustado para acercarse a Qwen3.8-27B en la eval de la competición; puede estar sobreajustado a ese conjunto de evaluación y no generalizar igual en otros dominios.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo de 27 B cuantizado a 2 bits sin datos de RLHF documentados.
- El layout `prism_hadamard_qwen35` no lo carga mlx-lm de forma nativa; requiere MTPLX o los kernels específicos, lo que limita la portabilidad.
- Este repo no incluye la cabeza drafter MTP, por lo que la decodificación es de un token por paso salvo que se use el drafter DFlash 2 externo.
- El modelo es un mirror de una submission de competición con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.
- No se han publicado resultados de benchmarks estándar, por lo que no se puede verificar su rendimiento en tareas concretas más allá de la métrica de KL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXIX-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XXIX-27B-Q2
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base (MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Servidor MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
