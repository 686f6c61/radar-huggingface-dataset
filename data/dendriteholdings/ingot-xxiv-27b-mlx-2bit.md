# dendriteholdings/Ingot-XXIV-27B-MLX-2bit

## Resumen

Ingot-XXIV-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (aproximadamente 27,36 mil millones) publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que más se le aproxima. El modelo es un fine-tune del checkpoint ternario prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, derivado de Prism ML Ternary Bonsai 2 27B, reajustado por el minero para acercarse a Qwen3.8-27B.

Técnicamente se trata de un transformer con pesos ternarios (códigos de 2 bits con escala fp16 y bias por cada bloque de 128 pesos, 2,25 bits por peso efectivos) empaquetado en formato MLX affine 2-bit para Apple Silicon. El repositorio ocupa 8,60 GB en un único `model.safetensors` y emplea el layout `prism_hadamard_qwen35`, que no carga con mlx-lm estándar y requiere MTPLX. Incluye torre de visión, config, tokenizer y vectores de signo Hadamard heredados del modelo base de Prism ML.

Su relevancia es doble: por un lado demuestra que la cuantización ternaria agresiva de un modelo de 27B puede ejecutarse en hardware Apple con decodificación de aproximadamente 55-60 tokens por segundo; por otro, documenta un método de evaluación poco habitual (KL y distancia de estados ocultos frente al profesor BF16) que cuantifica explícitamente la fidelidad de la copia cuantizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35`, pesos ternarios con transformada Hadamard; base Qwen3.8-27B según la model card) |
| Parámetros totales | 27.359.638.768 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2-bit ternario (2,25 bits por peso: códigos de 2 bits con escala fp16 y bias por bloque de 128 pesos); empaquetado MLX affine 2-bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 8,60 GB en un único fichero |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27,36B parámetros cuyos pesos se almacenan en formato ternario: cada bloque de 128 pesos conserva códigos ternarios y una escala fp16, empaquetados como valores MLX affine 2-bit con escala *d* y bias *−d*, de modo que cada peso decodifica al mismo número que usa el kernel GGUF equivalente. La conversión desde la submission del minero es sin pérdida. La torre de visión, la configuración, el tokenizer y los vectores de signo Hadamard provienen del modelo base prism-ml/Ternary-Bonsai-2-27B-mlx-2bit y no fueron modificados por la competición.

El entrenamiento no es un preentrenamiento desde cero: parte de Ternary Bonsai 2 27B (a su vez derivado de Qwen3.8-27B) y el minero reajusta los pesos no ternarios para reducir la divergencia respecto al profesor. No se especifican en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable es el pipeline de cuantización ternaria con transformada Hadamard y la evaluación por fidelidad (KL y distancia de estados ocultos frente al profesor BF16) en lugar de benchmarks de tarea. La submission ganadora se identifica con el hotkey `5DfWFCazEuUr2WFiZMETv98xM96cS6nCWNKQYXnGQeLtVcfG` (uid 8) y el identificador `93597c6b-7120-49eb-b211-7ef8d3bd0c1c`.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tags `conversational`).
- Procesamiento de visión: el paquete incluye torre de visión heredada del modelo base de Prism ML.
- Razonamiento y generación de código: la model card reporta métricas específicas sobre prompts de código y un drafter especulativo orientado a respuestas de código.
- Decodificación especulativa opcional mediante el drafter DFlash 2 (dendriteholdings/Ingot-27B-DFlash2-MLX), que propone varios tokens y el modelo verifica.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado en MLX y se sirve con MTPLX como API compatible con OpenAI, lo que permite desplegar un 27B ternario en un Mac Studio M3 Ultra (80 núcleos GPU, 512 GB) a unos 55 tok/s en decodificación.
- Generación de código asistida en estación de trabajo: con el drafter DFlash 2 las respuestas de código alcanzan aproximadamente 90 tok/s en el mismo hardware, adecuado para autocompletado interactivo y revisión de parches sin salir del equipo.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar la degradación de un 27B a 2,25 bits por peso, con métricas de KL (0,08276) y distancia de estados ocultos (0,3115) frente al profesor BF16.
- Evaluación de fidelidad de destilación/cuantización: el par de métricas publicado permite comparar variantes de cuantización sobre el mismo profesor sin depender de benchmarks de tarea saturados.
- Experimentación con decodificación especulativa: el drafter DFlash 2 y el runner incluido permiten medir la ganancia de throughput (de 59 a ~73 tok/s en decodificación greedy single-stream) en un entorno controlado.
- Prototipado de asistentes conversacionales con entrada visual: la torre de visión heredada permite probar flujos multimodal texto-imagen en local, siempre que se valide la calidad real en el dominio objetivo.
- Réplica de pipelines de competición (Bittensor/Ingot): útil para reproducir el flujo minero-validador y entender cómo se puntúa la cercanía al profesor.

## Benchmarks y rendimiento

Métricas de fidelidad frente al profesor BF16 (por token de respuesta; menor es mejor):

| Métrica | Este modelo (eval ganadora) | El rey al que superó |
|---|---|---|
| KL(profesor ‖ modelo) | 0,08276 | 0,08409 |
| Distancia de estados ocultos (media cada 8 capas) | 0,3115 | 0,3121 |

Rendimiento de decodificación (batch 1, Mac Studio M3 Ultra, 80 núcleos GPU, 512 GB):

| Motor | Modo | tok/s |
|---|---|---|
| MTPLX 2.12 (mlx 0.32), servidor | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | plain | 59,9 |
| DFlash 2 (drafter especulativo), greedy single-stream | especulativo | ~73 (hasta ~90 en código) |
| GGUF gemelo en fork Dendrite de llama.cpp, mismo Mac | plain | 56,4 |
| GGUF gemelo en RTX PRO 6000 | plain | 137 |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: el fichero de pesos ocupa 8,60 GB; se necesita memoria adicional para KV cache, activaciones y torre de visión. En Apple Silicon se ejecuta con memoria unificada.
- GPU recomendadas: Apple Silicon (medido en Mac Studio M3 Ultra, 80 núcleos GPU, 512 GB). Para el gemelo GGUF se reportan 137 tok/s en RTX PRO 6000.
- GPU de consumo: no se proporcionan datos de ejecución en RTX 4090 u otras GPU consumer; el empaquetado MLX está orientado a Apple Silicon.
- Opciones de despliegue: MTPLX (`pip install mtplx`, `mtplx serve`), mlx-lm 0.31 con kernels ternarios de MTPLX (in-process) y el drafter DFlash 2 con su runner. El gemelo GGUF requiere el fork Dendrite de llama.cpp. vLLM, TGI y Ollama no se mencionan como soportados.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en M3 Ultra; ~73 tok/s con decodificación especulativa y ~90 en respuestas de código. El servidor se midió con 256 tokens generados sobre un prompt de código vía HTTP; la medición in-process, con 128 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXIV-27B-MLX-2bit | 27,36B | no disponible | 2-bit ternario (MLX) | no disponible | HuggingFace (MLX) |
| dendriteholdings/Ingot-XXIV-27B-Q2 (gemelo GGUF) | 27,36B (mismos pesos) | no disponible | 2-bit ternario (GGUF) | no disponible | HuggingFace (GGUF) + fork llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | ~27B | no disponible | 2-bit ternario (MLX) | no disponible | HuggingFace (MLX) |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | ~27B | no disponible | 2-bit ternario (GGUF) | no disponible | HuggingFace (GGUF) |

No se dispone de datos de benchmarks de tarea para establecer comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 2,25 bits por peso introduce degradación medible: KL de 0,08276 y distancia de estados ocultos de 0,3115 frente al profesor BF16; no es equivalente al modelo original en precisión.
- La licencia no está declarada en la información disponible, por lo que el uso comercial no puede darse por permitido sin verificar la licencia del modelo base (Prism ML Ternary Bonsai 2) y de Qwen3.8-27B.
- El layout `prism_hadamard_qwen35` no carga con mlx-lm estándar; requiere MTPLX o los kernels ternarios específicos, lo que limita la portabilidad del despliegue.
- Este repositorio no incluye cabeza MTP de borrador: MTPLX decodifica un token por paso salvo que se añada el drafter DFlash 2.
- No se documentan idiomas soportados, longitud de contexto ni comportamiento de tool calling, por lo que no deben asumirse en producción.
- Es un espejo de una submission de competición: el objetivo del minero fue minimizar la divergencia respecto al profesor, no optimizar seguridad, alineación o utilidad conversacional.
- Riesgo de alucinación inherente a modelos de 27B cuantizados de forma agresiva; la falta de benchmarks de tarea impide acotar su magnitud.
- Los sesgos conocidos no están documentados en la información disponible.
- Las cifras de rendimiento se midieron en un Mac Studio M3 Ultra de gama alta; en hardware inferior el throughput será sustancialmente menor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-XXIV-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XXIV-27B-Q2
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- MTPLX (servidor MLX compatible con OpenAI): https://github.com/youssofal/mtplx
- Fork Dendrite de llama.cpp: https://github.com/DendriteLabs/llama.cpp
