# goodmai/gemma-4-E2B-it-PV-MACaQ-4bit-MXFP4-MLX

## Resumen

`gemma-4-E2B-it-PV-MACaQ-4bit-MXFP4-MLX` es una cuantización de 4 bits en formato MXFP4 del checkpoint instructivo `google/gemma-4-E2B-it-qat-q4_0-unquantized`, publicada por el usuario goodmai y empaquetada para la librería MLX, lo que la hace ejecutable de forma nativa en hardware Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una conversión post-entrenamiento que aplica una técnica propietaria de cuantización consciente de activaciones denominada PV-MACaQ, con el objetivo de reducir el peso del modelo de 10,21 GB en BF16 a 3,09 GB manteniendo la mayor fidelidad numérica posible.

El modelo base pertenece a la familia Gemma 4 de Google en su variante E2B (orientada a eficiencia) y en versión instructiva, con cuantización QAT (quantization-aware training) de 4 bits. El checkpoint resultante conserva el backbone lingüístico cuantizado a 4 bits MXFP4, los embeddings en 8 y 4 bits afines, y deja la torre de visión, las normas y los routers en BF16 nativo, lo que sugiere que el modelo base incorpora capacidades multimodales.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización poco habitual (MXFP4 con rotación de Hadamard y ajuste PV-Tuning en dos rondas) que mejora la relación señal-ruido de cuantización (SQNR) frente a la cuantización round-to-nearest estándar; por otro, su licencia no está declarada y su adopción es prácticamente nula (0 descargas, 0 likes), por lo que debe evaluarse con cautela antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B instructiva), con backbone lingüístico cuantizado y torre de visión en BF16 |
| Parametros totales | 3.214.242.339 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MXFP4 (E2M1 + escalas E8M0, group_size=32, hadamard_block=32) en capas `Linear` y `SwitchLinear`; embeddings en 8 bits afín (group_size=64) y 4 bits afín (group_size=64); visión, normas y routers en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `google/gemma-4-E2B-it-qat-q4_0-unquantized`, que a su vez es una versión instructiva de la familia Gemma 4 con entrenamiento consciente de cuantización (QAT) a 4 bits. El autor no documenta la arquitectura interna del modelo base (número de capas, dimensiones ocultas, mecanismo de atención, posible mezcla de expertos), aunque la presencia de módulos `SwitchLinear` en la receta de cuantización indica que el modelo incorpora capas de mezcla de expertos (MoE), si bien el informe de métricas señala 0 módulos MoE efectivamente cuantizados en esta conversión. La torre de visión se preserva en BF16, lo que confirma que el modelo base es multimodal.

La innovación técnica principal reside en la receta PV-MACaQ: cuantización MXFP4 con `pre_scale` consciente de activaciones, rotación de Hadamard por bloques de 32 y ajuste PV-Tuning en dos rondas (paso P de mínimos cuadrados sobre `pre_scale` y paso V de refinamiento de coordenadas de escalas E8M0 y códigos). El autor reporta una mejora de SQNR medio de 18,82 dB (RTN MXFP4) a 19,15 dB (PV-MACaQ), es decir, +0,33 dB, con una reducción del error cuadrático medio del 6,9% frente a RTN. No se documentan datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) del modelo base en la información disponible.

## Capacidades

- Generación de texto y razonamiento en modo instructivo, heredados del checkpoint `gemma-4-E2B-it`.
- Procesamiento multimodal de imágenes, ya que la torre de visión se conserva en BF16 nativo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Ejecución nativa en Apple Silicon mediante la librería MLX y el runtime Basalt.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el modelo, de 3,09 GB en MXFP4, cabe en la memoria unificada de equipos con 8 GB o más y permite ejecutar un modelo instructivo multimodal sin GPU dedicada, usando `basalt serve` o MLX directamente.
- Prototipado de asistentes conversacionales en local: al ser una variante instructiva, puede gestionar diálogos multi-turno en entornos de desarrollo sin depender de servicios en la nube, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Evaluación de recetas de cuantización: este checkpoint sirve como referencia para comparar MXFP4 con PV-Tuning frente a RTN en tareas concretas, midiendo la degradación real en calidad de generación más allá del SQNR reportado.
- Aplicaciones de visión ligeras en dispositivo: la torre de visión en BF16 permite tareas de descripción de imágenes o respuesta a preguntas visuales (VQA) en hardware de consumo Apple.
- Investigación sobre eficiencia de memoria: útil para estudiar el impacto de embeddings en 8/4 bits y del mantenimiento de routers en BF16 sobre la calidad final del modelo.
- Despliegue en pipelines de CI para pruebas de regresión de modelos cuantizados: el tamaño reducido y el formato safetensors MLX facilitan la carga rápida en runners con hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de cuantización:

| Metrica | Valor |
|---|---|
| Modulos `MACaQQuantizedLinear` 2D cuantizados | 276 |
| Modulos `MACaQSwitchLinear` MoE 3D cuantizados | 0 |
| Tamano de entrada (BF16) | 10,21 GB |
| Tamano de salida (PV-MACaQ MXFP4) | 3,09 GB (factor 3,31x) |
| SQNR medio RTN MXFP4 | 18,82 dB |
| SQNR medio PV-MACaQ MXFP4 | 19,15 dB (+0,33 dB) |
| Reduccion media de MSE frente a RTN | 6,9% |

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 3,1 GB para los pesos en MXFP4, más overhead de activaciones, caché KV y runtime MLX; en la práctica, se recomienda un mínimo de 8 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada suficiente; no es compatible de forma nativa con CUDA sin conversión previa.
- Cabe en GPU de consumo: sí, en equipos Apple con 8 GB o más de memoria unificada; no está pensado para GPUs NVIDIA de consumo en su formato actual.
- Opciones de despliegue: MLX y Basalt (`basalt serve --model goodmai/gemma-4-E2B-it-PV-MACaQ-4bit-MXFP4-MLX`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/gemma-4-E2B-it-PV-MACaQ-4bit-MXFP4-MLX | 3.214.242.339 | no disponible | MXFP4 4 bits + embeddings 8/4 bits | no disponible | Hugging Face, MLX |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (modelo base) | no disponible | no disponible | QAT 4 bits (BF16 sin cuantizar) | no disponible | Hugging Face |
| Otras cuantizaciones MLX de la familia Gemma 4 E2B | no disponible | no disponible | 4/8 bits afín | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide confirmar si se permite uso comercial; debe verificarse la licencia del modelo base de Google antes de cualquier despliegue en producción.
- El modelo tiene 0 descargas y 0 likes, y fue publicado y actualizado el mismo día (2026-11-19), por lo que no cuenta con validación comunitaria ni evidencia de robustez en uso real.
- Las métricas reportadas (SQNR, MSE) son de fidelidad de cuantización, no de calidad de tarea; una mejora de 0,33 dB en SQNR no garantiza mejoras equivalentes en generación, razonamiento o visión.
- La cuantización a 4 bits MXFP4 puede degradar tareas sensibles a precisión numérica, como matemáticas o código, en comparación con el checkpoint en BF16.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas del modelo base en la información disponible.
- La longitud de contexto no está documentada, lo que limita la planificación de aplicaciones con ventanas largas.
- El formato MLX restringe el despliegue a hardware Apple Silicon; no es directamente portable a CUDA sin reconversión.
- El informe indica 0 módulos MoE cuantizados pese a la presencia de capas `SwitchLinear` en la receta, lo que sugiere que la mezcla de expertos del modelo base no se ha cuantizado en esta conversión y podría afectar al equilibrio memoria/rendimiento esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/gemma-4-E2B-it-PV-MACaQ-4bit-MXFP4-MLX
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Runtime Basalt: https://github.com/goodmai/basalt
