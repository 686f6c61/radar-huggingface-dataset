# dendriteholdings/Ingot-XLII-27B-MLX-2bit

## Resumen

Ingot-XLII-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (aproximadamente 27,4 mil millones) publicado por dendriteholdings como espejo público del ganador de Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia cuantizada que se mantiene más fiel a dicho profesor. El modelo es un refinamiento del modelo base prism-ml/Ternary-Bonsai-2-27B-mlx-2bit: conserva los mismos códigos ternarios y reajusta el resto de pesos para acercarlo a Qwen3.8-27B, que actúa como referencia.

La relevancia del modelo es doble. Por un lado, es un ejemplo de cuantización ternaria (2 bits por peso) llevada a un modelo de 27B con pérdida de fidelidad medida respecto al profesor BF16 (KL de 0,07005 por token de respuesta frente a 0,07156 del rey anterior). Por otro, está empaquetado específicamente para Apple Silicon mediante MLX, con un layout propietario (`prism_hadamard_qwen35`) que requiere el motor MTPLX para cargarse, ya que mlx-lm no lo soporta de forma nativa.

El modelo está pensado para generación de texto y conversación, con un tamaño de repositorio de 8,6 GB gracias a la codificación ternaria. No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35`, derivado de Qwen3.8-27B); no se detalla más |
| Parámetros totales | 27.359.638.768 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits ternarios (2,25 bits por peso: códigos de 2 bits, escala fp16 y sesgo por cada 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit); también existe un gemelo GGUF en dendriteholdings/Ingot-XLII-27B-Q2 |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 27,4B parámetros cuyo esqueleto procede de Prism ML (Ternary Bonsai 2 27B), con la torre de visión, configuración, tokenizer y vectores de signo de Hadamard heredados de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit. La innovación principal es la codificación ternaria: cada bloque de 128 pesos conserva sus códigos ternarios y una escala fp16, empaquetados como valores afines MLX de 2 bits (escala d, sesgo −d), de modo que cada peso decodifica al mismo número que usa el kernel GGUF. Esto reduce el tamaño a 8,6 GB para 27,4B parámetros.

El entrenamiento no es un preentrenamiento desde cero, sino un ajuste fino (finetune) sobre el modelo base, realizado por un minero de Ingot (hotkey `5Ev92m6cmahKW3ypdvjW6vBDnLTi51YU3n6DoS1b4RRfTmTG`, uid 249) que reajustó los pesos no ternarios para acercar las distribuciones de salida a Qwen3.8-27B. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La fidelidad se mide con KL(profesor BF16 ‖ modelo) por token de respuesta, ponderada por dominio.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tags `conversational`).
- Razonamiento y generación de código: la model card reporta métricas específicas de decodificación sobre prompts de código (256 tokens generados vía HTTP).
- Capacidad de visión: el modelo hereda la torre de visión del modelo base Prism, aunque la model card no detalla su funcionamiento.
- Soporte de decodificación especulativa mediante un drafter DFlash 2 separado (dendriteholdings/Ingot-27B-DFlash2-MLX), que acelera la generación greedy en un solo flujo.
- Inferencia en Apple Silicon vía MLX con el motor MTPLX, que expone una API compatible con OpenAI.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el modelo ocupa 8,6 GB y decodifica a 55–60 tok/s en un Mac Studio M3 Ultra, lo que permite ejecutar un modelo de 27B en un equipo de sobremesa Apple sin GPU dedicada.
- Asistente conversacional en local con API compatible con OpenAI: mediante `mtplx serve` se puede exponer el modelo en el puerto 8080 y conectarlo a clientes existentes que hablen el protocolo OpenAI.
- Generación de código en estación de trabajo: con el drafter DFlash 2 las respuestas de código alcanzan unos 90 tok/s, adecuado para autocompletado y generación de fragmentos en un IDE local.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar la pérdida de fidelidad (KL) de esquemas ternarios frente a un profesor BF16 en un modelo de 27B.
- Despliegue en entornos con restricciones de memoria: los 8,6 GB permiten alojar el modelo en GPUs de consumo con 12–16 GB de VRAM mediante el gemelo GGUF en la fork de llama.cpp de Dendrite.
- Evaluación comparativa de fidelidad: útil para replicar la métrica KL por dominio y comparar distintas estrategias de cuantización ternaria sobre el mismo profesor.
- Prototipado de pipelines de generación de texto en Apple Silicon: integración con mlx-lm 0.31 usando los kernels ternarios de MTPLX en proceso, sin servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad y velocidad:

| Métrica | Valor |
|---|---|
| KL(profesor BF16 ‖ modelo), evaluación ganadora | 0,07005 |
| KL(profesor BF16 ‖ rey anterior), misma evaluación | 0,07156 |
| Decode tok/s, MTPLX 2.12 (mlx 0.32) servidor, batch 1, M3 Ultra | 55,3 |
| Decode tok/s, mlx-lm 0.31 con kernels ternarios MTPLX, en proceso | 59,9 |
| Decode tok/s, gemelo GGUF en fork llama.cpp, mismo Mac | 56,4 |
| Decode tok/s, gemelo GGUF en RTX PRO 6000 | 137 |
| Decode tok/s con drafter DFlash 2 (greedy, un flujo) | ~73 (hasta ~90 en código) |

## Requisitos de hardware

- VRAM/memoria estimada: 8,6 GB para los pesos en 2 bits; se necesita memoria adicional para el contexto y el estado de inferencia.
- GPU recomendadas: Apple Silicon con GPU integrada (medido en Mac Studio M3 Ultra, GPU de 80 núcleos, 512 GB); en el ecosistema NVIDIA, el gemelo GGUF se midió en RTX PRO 6000.
- Cabe en GPU de consumo: sí, en GPUs con 12–16 GB de VRAM usando el gemelo GGUF; en Apple Silicon con memoria unificada de 16 GB o más.
- Opciones de despliegue: MTPLX (obligatorio para el layout `prism_hadamard_qwen35`, no soportado por mlx-lm nativo), mlx-lm 0.31 con los kernels ternarios de MTPLX en proceso, y la fork de llama.cpp de Dendrite para el gemelo GGUF.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s en proceso sobre M3 Ultra; ~73 tok/s con el drafter DFlash 2 y ~90 tok/s en respuestas de código; 137 tok/s en RTX PRO 6000 con el gemelo GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XLII-27B-MLX-2bit | 27,4B | no disponible | 2-bit ternario (MLX) | no disponible | Hugging Face (MLX) |
| dendriteholdings/Ingot-XLII-27B-Q2 | 27,4B | no disponible | 2-bit ternario (GGUF) | no disponible | Hugging Face (GGUF) |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | ~27B | no disponible | 2-bit ternario (MLX) | no disponible | Hugging Face (MLX) |
| prism-ml/Ternary-Bonsai-2-27B-gguf | ~27B | no disponible | 2-bit ternario (GGUF) | no disponible | Hugging Face (GGUF) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El layout `prism_hadamard_qwen35` no lo carga mlx-lm de forma nativa; es necesario usar MTPLX o los kernels ternarios específicos, lo que limita la portabilidad.
- El repositorio no incluye cabeza de borrador MTP, por lo que MTPLX decodifica un token por paso salvo que se use el drafter DFlash 2 externo.
- La cuantización ternaria introduce una pérdida de fidelidad medible (KL de 0,07005 respecto al profesor BF16); no es equivalente al modelo en precisión completa.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificación previa.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un ajuste fino de un modelo base cuantizado, hereda los sesgos del profesor.
- El modelo proviene de un certamen de cuantización (Ingot), no de un entrenamiento con datos propios; su calidad está acotada por la del profesor Ternary Bonsai 2 27B y por el ajuste del minero.
- El rendimiento medido se limita a un Mac Studio M3 Ultra y a una RTX PRO 6000; no hay datos de latencia en otras configuraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XLII-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XLII-27B-Q2
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base (MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Motor MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
