# dendriteholdings/Ingot-XXXIX-27B-MLX-2bit

## Resumen

Ingot-XXXIX-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) publicado por dendriteholdings como espejo público del ganador del subred Bittensor denominado Ingot. En ese subred, los mineros cuantizan un modelo maestro fijo y el validador premia la copia que se mantiene más próxima al original; este modelo es la empaquetadura MLX del envío ganador, es decir, los mismos pesos ternarios reescritos para Apple Silicon. Deriva de prism-ml/Ternary-Bonsai-2-27B, un modelo de Prism ML, cuyos códigos ternarios se conservan y cuyos pesos restantes fueron reajustados por el minero para acercarse a Qwen3.8-27B.

La relevancia del modelo es doble: por un lado, demuestra que la cuantización ternaria de 2 bits (2,25 bits por peso efectivos) puede mantener una fidelidad medible frente a un profesor en BF16 (KL de 0,07193 frente a 0,07348 del rey anterior); por otro, ofrece una ruta de despliegue real sobre hardware de Apple con un motor específico (MTPLX) que soporta el layout `prism_hadamard_qwen35`, no cargable por mlx-lm estándar.

El repositorio ocupa 8,6 GB, contiene un único `model.safetensors` y se distribuye bajo la librería MLX. No se dispone de información sobre licencia ni sobre idiomas soportados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35`), pesos ternarios con escala y sesgo fp16 por bloque de 128 pesos; torre de visión heredada de Prism |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternarios (2,25 bits por peso: códigos de 2 bits, escala fp16 y sesgo fp16 por cada 128 pesos); formato afín MLX (scale d, bias −d) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX); existe un gemelo GGUF en dendriteholdings/Ingot-XXXIX-27B-Q2 |

## Arquitectura y entrenamiento

El modelo es un transformer de 27,36 mil millones de parámetros cuyos pesos se almacenan en formato ternario: cada bloque de 128 pesos conserva sus códigos ternarios y una escala fp16, de modo que cada peso decodifica al mismo valor que usa el kernel GGUF. La empaquetadura MLX convierte los pesos del minero sin pérdida a valores afín de 2 bits de MLX (escala d, sesgo −d). La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard provienen de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit y no fueron alterados por la competición.

El entrenamiento no es un preentrenamiento desde cero: se parte de Ternary Bonsai 2 27B de Prism ML y el minero reajusta los pesos no ternarios para acercar el modelo a Qwen3.8-27B. La selección se realizó mediante evaluación de divergencia KL por token de respuesta frente al profesor en BF16, ponderada por dominio. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. Como innovación destacable, el modelo se acompaña de un drafter de decodificación especulativa DFlash 2 (dendriteholdings/Ingot-27B-DFlash2-MLX) que propone varios tokens por paso y el modelo verifica cada uno.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento y generación de código: el modelo se evalúa con prompts de código y el drafter DFlash 2 reporta velocidades específicas para respuestas de código.
- Capacidades de visión: hereda la torre de visión de Prism, aunque no se detallan las tareas concretas soportadas.
- Decodificación especulativa opcional mediante el drafter DFlash 2, que acelera la generación greedy en un solo flujo.
- Servicio como API compatible con OpenAI a través de MTPLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en Mac con Apple Silicon: el modelo está empaquetado en MLX y se sirve con MTPLX como API compatible con OpenAI, lo que permite ejecutar un modelo de 27B en un Mac Studio M3 Ultra (80 núcleos de GPU, 512 GB) a 55,3 tok/s en decodificación plana.
- Asistente de código en estación de trabajo: con el drafter DFlash 2 las respuestas de código alcanzan unos 90 tok/s en el mismo hardware, adecuado para autocompletado y generación de fragmentos en un IDE local.
- Evaluación de técnicas de cuantización extrema: sirve como referencia práctica de cuantización ternaria de 2 bits con métrica KL frente a un profesor BF16, útil para investigadores que estudien la fidelidad de formatos de 2 bits.
- Servicio de chat con API compatible con OpenAI: MTPLX expone el modelo en el puerto 8080 con `--no-auth`, lo que facilita prototipos internos y pruebas de integración sin infraestructura adicional.
- Investigación en subredes Bittensor e Ingot: el modelo documenta el flujo de competición (hotkey del minero, submission coronada, evaluación KL), lo que lo convierte en material de referencia para estudiar incentivos de cuantización.
- Comparación de motores de inferencia: al existir un gemelo GGUF que decodifica a 56,4 tok/s en el fork de llama.cpp de Dendrite y a 137 tok/s en una RTX PRO 6000, el par MLX/GGUF permite comparar rendimiento entre ecosistemas Apple y NVIDIA con los mismos pesos.
- Reproducción de resultados de cuantización: los pesos decodifican al mismo número que el kernel GGUF, lo que permite validar implementaciones de kernels ternarios contra una referencia publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La única métrica de calidad publicada es la divergencia KL frente al profesor BF16:

| Metrica | Valor |
|---|---|
| KL de este modelo (evaluación ganadora) | 0,07193 |
| KL del rey al que superó (misma evaluación) | 0,07348 |

Rendimiento de decodificación (batch 1, Mac Studio M3 Ultra, 80 núcleos de GPU, 512 GB):

| Motor | Modo | tok/s |
|---|---|---|
| Servidor MTPLX 2.12 (mlx 0.32) | plano | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | plano | 59,9 |
| Con drafter DFlash 2 (greedy, un flujo) | especulativo | ~73 (hasta ~90 en código) |
| Gemelo GGUF en fork de llama.cpp de Dendrite | plano | 56,4 |
| Gemelo GGUF en RTX PRO 6000 | plano | 137 |

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio ocupa 8,6 GB en safetensors; el modelo completo en memoria requiere espacio para 27,36 mil millones de parámetros en formato de 2,25 bits por peso más las estructuras auxiliares (escala, sesgo, torre de visión, tokenizador).
- GPU recomendadas: Apple Silicon; las medidas publicadas se tomaron en un Mac Studio M3 Ultra con 80 núcleos de GPU y 512 GB de memoria unificada. Para el gemelo GGUF se reporta una RTX PRO 6000.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; el tamaño de 8,6 GB sugiere que podría caber en GPUs de consumo con suficiente memoria, pero no se confirma en la información proporcionada.
- Opciones de despliegue: MTPLX (`pip install mtplx`, `mtplx serve --model dendriteholdings/Ingot-XXXIX-27B-MLX-2bit --generation-mode ar --port 8080 --no-auth --yes`); mlx-lm no carga el layout `prism_hadamard_qwen35`; el gemelo GGUF requiere el fork de llama.cpp de Dendrite.
- Latencia y throughput: 55,3 tok/s con servidor MTPLX plano; 59,9 tok/s en proceso con kernels ternarios; ~73 tok/s con drafter DFlash 2 y ~90 tok/s en código; 56,4 tok/s en GGUF sobre el mismo Mac y 137 tok/s en RTX PRO 6000.
- El repositorio no incluye cabeza MTP de borrador, por lo que MTPLX decodifica un token por paso salvo que se use el drafter externo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXIX-27B-MLX-2bit | 27,36 B | MLX safetensors, 2,25 bits/peso | no disponible | no disponible | Hugging Face (dendriteholdings) |
| Ingot-XXXIX-27B-Q2 | 27,36 B (mismos pesos) | GGUF, 2 bits | no disponible | no disponible | Hugging Face (dendriteholdings) |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27 B (familia) | MLX, ternario 2 bits | no disponible | no disponible | Hugging Face (prism-ml) |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27 B (familia) | GGUF, ternario 2 bits | no disponible | no disponible | Hugging Face (prism-ml) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la única comparación cuantitativa disponible es la KL frente al profesor (0,07193 frente a 0,07348 del rey anterior).

## Limitaciones y advertencias

- El layout `prism_hadamard_qwen35` no es cargable por mlx-lm estándar; requiere MTPLX o herramientas compatibles, lo que limita la portabilidad.
- El repositorio no incluye cabeza MTP de borrador, por lo que sin el drafter DFlash 2 la decodificación es de un token por paso.
- No se dispone de información sobre licencia, lo que impide confirmar si el uso comercial está permitido.
- No se dispone de información sobre idiomas soportados ni sobre sesgos conocidos del modelo.
- No se dispone de longitud de contexto documentada, lo que dificulta planificar aplicaciones con ventanas largas.
- Riesgo de alucinación: no cuantificado en la información disponible; la métrica KL mide fidelidad al profesor, no corrección factual.
- El modelo es un fine-tune de competición sobre Ternary Bonsai 2; su calidad está acotada por la del profesor y por el proceso de cuantización ternaria de 2 bits.
- El servicio MTPLX documentado se lanza con `--no-auth`, inadecuado para exposición pública sin un proxy de autenticación.
- El modelo se publicó el 16 de noviembre de 2026 y no registra descargas ni likes, por lo que no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXIX-27B-MLX-2bit
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Gemelo GGUF del mismo envío: https://huggingface.co/dendriteholdings/Ingot-XXXIX-27B-Q2
- Drafter de decodificación especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Motor MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
