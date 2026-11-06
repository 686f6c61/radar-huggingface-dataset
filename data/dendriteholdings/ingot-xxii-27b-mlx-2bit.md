# dendriteholdings/Ingot-XXII-27B-MLX-2bit

## Resumen

Ingot-XXII-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) empaquetado en formato MLX affine de 2 bits para su ejecución en Apple Silicon. Lo publica el usuario dendriteholdings como espejo público de una submission ganadora del subred Bittensor denominado Ingot, un certamen en el que los mineros cuantizan un modelo maestro fijo (teacher) y el validador premia la copia que permanece más próxima a él. El modelo base es prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, al que el minero ha reajustado los pesos no ternarios para acercarlo a Qwen3.8-27B.

La relevancia del modelo es doble. Por un lado, demuestra que es posible comprimir un transformer de 27B a aproximadamente 2,25 bits por peso (códigos ternarios de 2 bits más escala y sesgo fp16 cada 128 pesos) manteniendo una fidelidad medible frente al teacher en BF16: KL de 0,08625 y distancia de estados ocultos de 0,3132, ligeramente mejores que las del rey anterior (0,08795 y 0,3147). Por otro lado, ofrece una vía práctica de inferencia local en hardware de Apple con un rendimiento de decodificación de 55-60 tokens por segundo en un Mac Studio M3 Ultra.

El repositorio ocupa 8,6 GB y contiene un único archivo safetensors. La torre de visión, la configuración, el tokenizer y los vectores de signo de Hadamard provienen del modelo de Prism ML y no los modifica la competición. No se dispone de información sobre licencia ni sobre idiomas soportados en la documentación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, según el layout `prism_hadamard_qwen35`); incluye torre de visión heredada del modelo base |
| Parámetros totales | 27.359.638.768 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits ternarios (2,25 bits por peso: códigos de 2 bits con escala fp16 y sesgo −d cada 128 pesos); empaquetado MLX affine 2-bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 8,60 GB en un único `model.safetensors` |

## Arquitectura y entrenamiento

El modelo es un transformer de 27,36 mil millones de parámetros cuyo esqueleto procede de Qwen3.5, tal como indica el identificador de layout `prism_hadamard_qwen35`. La cuantización utiliza una transformación de Hadamard (vectores de signo incluidos en el paquete) seguida de códigos ternarios: cada bloque de 128 pesos conserva sus códigos de 2 bits y una escala fp16 con sesgo −d, de modo que cada peso decodifica exactamente al mismo valor que emplea el kernel GGUF del modelo gemelo. El proceso de conversión es sin pérdida respecto a la submission original del minero.

El entrenamiento no es un preentrenamiento desde cero, sino un reajuste fino (finetune) de los pesos no ternarios sobre el modelo base Ternary-Bonsai-2-27B-mlx-2bit, orientado a minimizar la divergencia respecto al teacher Qwen3.8-27B en BF16. La evaluación de la competición mide, por token de respuesta, la KL entre las distribuciones del siguiente token del teacher y del modelo, así como la distancia relativa de estados ocultos promediada cada 8 capas. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. El repositorio no incluye cabeza MTP (multi-token prediction), por lo que la decodificación es de un token por paso salvo que se acople el drafter DFlash 2 publicado aparte.

## Capacidades

- Generación de texto conversacional y continuaciones de código, con pipeline `text-generation`.
- Razonamiento y matemáticas: capacidad inferida de la familia Qwen3.5 subyacente; no se publican evaluaciones específicas.
- Torre de visión heredada del modelo base de Prism ML, aunque no se documenta su funcionamiento en esta ficha.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Decodificación especulativa opcional mediante el drafter externo DFlash 2 (dendriteholdings/Ingot-27B-DFlash2-MLX), que eleva la velocidad de 59 a unos 73 tok/s en modo greedy y hasta unos 90 tok/s en respuestas de código.
- Servido como API compatible con OpenAI a través de MTPLX.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el paquete de 8,6 GB cabe en equipos Apple Silicon de gama alta (por ejemplo, Mac Studio M3 Ultra con 512 GB), lo que permite ejecutar un modelo de 27B en local sin GPU dedicada, a 55-60 tok/s en decodificación.
- Asistente de código en estación de trabajo: con el drafter DFlash 2 acoplado, las respuestas de código alcanzan unos 90 tok/s, adecuado para autocompletado interactivo y revisión de parches en el editor.
- Servicio de chat compatible con OpenAI: MTPLX expone el modelo en el puerto 8080 con API OpenAI, de modo que se puede integrar en aplicaciones existentes sin cambiar el cliente.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar la fidelidad de esquemas ternarios de 2 bits frente a un teacher BF16, con métricas KL y de estados ocultos ya publicadas.
- Evaluación de pipelines de competición (Bittensor/Ingot): útil para replicar el proceso de validación y comparar submissions de mineros sobre el mismo teacher.
- Prototipado de agentes y asistentes conversacionales en hardware de sobremesa: al no requerir GPU dedicada, permite iterar en local antes de desplegar en infraestructura mayor.
- Despliegue en entornos con restricciones de memoria: 2,25 bits por peso reducen drásticamente la huella frente a un BF16 de 27B (que rondaría los 54 GB), lo que facilita ejecutarlo en máquinas con 16-32 GB de memoria unificada, aunque el rendimiento exacto en esos equipos no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí aporta métricas de fidelidad frente al teacher y de velocidad:

| Métrica | Este modelo | Rey anterior |
|---|---|---|
| KL(teacher ‖ model) por token de respuesta | 0,08625 | 0,08795 |
| Distancia de estados ocultos (cada 8 capas) | 0,3132 | 0,3147 |

| Motor | Modo | Decodificación (tok/s) |
|---|---|---|
| MTPLX 2.12 (mlx 0.32), servidor | plain, batch 1 | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | plain, batch 1 | 59,9 |
| Gemelo GGUF en fork de llama.cpp (Dendrite) | plain | 56,4 |
| Gemelo GGUF en RTX PRO 6000 | plain | 137 |

Las mediciones se realizaron en un Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB). Los números de servidor corresponden a 256 tokens generados sobre un prompt de código medidos por HTTP; los in-process, a 128 tokens sin servidor.

## Requisitos de hardware

- VRAM/memoria estimada: 8,6 GB de pesos en 2 bits; con overhead de ejecución y caché KV conviene disponer de al menos 12-16 GB de memoria unificada, aunque no se documenta el mínimo exacto.
- GPU recomendadas: Apple Silicon de gama alta (M3 Ultra, M2 Ultra, M4 Max) para el paquete MLX; el gemelo GGUF se ha medido en RTX PRO 6000 a 137 tok/s.
- ¿Cabe en GPU de consumo? El paquete MLX está pensado para Apple Silicon; en GPUs NVIDIA de consumo no se documenta soporte directo de este formato, aunque el gemelo GGUF sí podría ejecutarse en ellas.
- Opciones de despliegue: MTPLX (servidor compatible con OpenAI), mlx-lm 0.31 con kernels ternarios, y el fork de llama.cpp de DendriteLabs para el gemelo GGUF.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en M3 Ultra; con el drafter DFlash 2, unos 73 tok/s en greedy y hasta unos 90 tok/s en código.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXII-27B-MLX-2bit | 27,36 B | no disponible | 2 bits ternarios (MLX) | no disponible | Hugging Face (MLX) |
| Ingot-XXII-27B-Q2 (gemelo GGUF) | 27,36 B | no disponible | 2 bits ternarios (GGUF) | no disponible | Hugging Face + fork llama.cpp |
| Prism ML Ternary-Bonsai-2-27B-mlx-2bit (base) | 27 B (aprox.) | no disponible | 2 bits ternarios (MLX) | no disponible | Hugging Face |
| Qwen3.8-27B (teacher, BF16) | 27 B (aprox.) | no disponible | BF16 | no disponible | no disponible en la información |

La comparativa se limita a los modelos citados en la documentación; no se dispone de datos de benchmarks estándar ni de licencias para establecer una comparación cuantitativa más amplia.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no se puede confirmar el uso comercial sin consultar al autor.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- La cuantización a 2 bits ternarios introduce una divergencia medible frente al teacher (KL 0,08625), lo que implica riesgo de degradación en tareas sensibles a la precisión numérica.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad.
- El paquete MLX no carga en mlx-lm estándar: requiere MTPLX o kernels específicos, lo que limita la portabilidad.
- No incluye cabeza MTP, por lo que sin el drafter externo la decodificación es de un token por paso.
- La torre de visión se hereda del modelo base pero no se documenta su funcionamiento ni su evaluación en este paquete.
- El modelo proviene de una competición de cuantización; su calidad está optimizada para la métrica de fidelidad al teacher, no necesariamente para tareas agénticas o de tool calling.
- No se especifican la longitud de contexto ni el volumen de datos de entrenamiento, lo que dificulta evaluar su idoneidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXII-27B-MLX-2bit
- Modelo base (MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Gemelo GGUF de la submission: https://huggingface.co/dendriteholdings/Ingot-XXII-27B-Q2
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- MTPLX (servidor MLX): https://github.com/youssofal/mtplx
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
