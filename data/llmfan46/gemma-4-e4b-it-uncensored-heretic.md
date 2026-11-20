# llmfan46/gemma-4-E4B-it-uncensored-heretic

## Resumen

`llmfan46/gemma-4-E4B-it-uncensored-heretic` es una versión "decensored" (abliterated) del modelo multimodal `google/gemma-4-E4B-it` de Google DeepMind, publicada por el contribuidor independiente llmfan46. El objetivo es eliminar los mecanismos de rechazo del modelo original manteniendo al máximo sus capacidades, de modo que pueda usarse en escenarios de investigación o generación creativa donde el modelo base responde con negativas, sermones o evasivas. El autor reporta una reducción de rechazos del 99/100 al 7/100 con una divergencia KL de 0,0043 respecto al original.

El modelo conserva la arquitectura y el pipeline del base: un transformer multimodal con capacidad any-to-any (entrada de texto e imagen, salida de texto), con aproximadamente 8.000 millones de parámetros totales según los pesos en safetensors (7.996.156.490). El repositorio ocupa 16 GB y se distribuye en formato safetensors para `transformers`. La intervención se realizó con Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA) sobre las proyecciones de atención, sin reentrenamiento adicional.

Es relevante porque demuestra que las técnicas de abliteración por dirección pueden aplicarse a modelos multimodales modernos con un coste de degradación medido y bajo en benchmarks de razonamiento físico y conocimiento general, lo que interesa a quienes investigan alineación, robustez de salvaguardas y evaluación de sesgos en modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de google/gemma-4-E4B-it; detalles internos no disponibles) |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | safetensors |
| Pipeline | any-to-any (texto e imagen de entrada, texto de salida) |
| Tamano del repositorio | 16,0 GB |
| Modelo base | google/gemma-4-E4B-it |
| Metodo de ablacion | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) |
| Componentes intervenidos | attn.o_proj |
| Capas intervenidas | indices 8 a 36 |

## Arquitectura y entrenamiento

El modelo es una modificación post-entrenamiento del base `google/gemma-4-E4B-it`, no un reentrenamiento. La arquitectura subyacente es la de Gemma 4, familia multimodal de Google DeepMind que procesa texto e imagen (con audio en los modelos pequeños) y genera texto. No se dispone de detalles adicionales sobre número de capas, atención, tokenizador ni composición del dataset de preentrenamiento en la información proporcionada.

La intervención consiste en una abliteración por direcciones aplicada con Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA), que estima subespacios de comportamiento (rechazo frente a cumplimiento) y los resta de las matrices de pesos. Los parámetros declarados son: `start_layer_index` 8, `end_layer_index` 36, `preserve_good_behavior_weight` 0,9827, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 0,9110 y `neighbor_count` 15, actuando únicamente sobre `attn.o_proj`. No se reporta RLHF, DPO ni fine-tuning adicional tras la ablación.

## Capacidades

- Generación de texto y razonamiento general, heredados del base Gemma 4 E4B-it.
- Entrada multimodal de imagen y texto con salida de texto (pipeline any-to-any).
- Reducción drástica de rechazos: 7/100 frente a 99/100 del original en el conjunto de evaluación del autor.
- Respuestas sin sermones, evasivas ni derivaciones moralizantes en temas que el modelo original rechaza.
- Capacidad de seguir instrucciones y mantener coherencia conversacional con degradación medida baja (KL 0,0043).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y salvaguardas: comparar las respuestas del modelo abliterated con las del base para estudiar qué comportamientos se eliminan con la ablación y cómo afecta a la utilidad, usando la KL de 0,0043 como referencia de proximidad.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, conflicto, contenido adulto) donde el base responde con negativas; el modelo mantiene el 85,58 % de precisión en PIQA, lo que sugiere razonamiento físico intacto para narrativa realista.
- Evaluación de robustez de filtros: desplegar el modelo como adversario para probar clasificadores de contenido y sistemas de moderación, aprovechando su tasa de rechazo del 7 %.
- Análisis de imágenes con descripción sin filtros morales: al conservar la entrada multimodal del base, puede usarse para tareas de captioning o VQA donde se requiera descripción literal sin suavizado.
- Red teaming interno: generar respuestas que el modelo original bloquea para auditar políticas de contenido y calibrar umbrales de seguridad en pipelines propios.
- Prototipado de asistentes conversacionales de dominio acotado: con ~8B parámetros y pesos safetensors, es viable en una GPU de 24 GB en precisión reducida para iterar sobre prompts y flujos multi-turno sin depender de APIs externas.
- Docencia y divulgación: mostrar de forma práctica el efecto de la abliteración comparando MMLU (68,97 % frente a 69,46 %) y PIQA (85,58 % frente a 86,02 %) entre el modelo modificado y el original.

## Benchmarks y rendimiento

| Benchmark | Este modelo | google/gemma-4-E4B-it |
|---|---|---|
| MMLU (14.042 preguntas, 57 materias) | 68,97 % (9.685 correctas) | 69,46 % (9.753 correctas) |
| PIQA (1.838 preguntas) | 85,58 % (1.573 correctas) | 86,02 % (1.581 correctas) |
| Rechazos (100 prompts) | 7/100 | 99/100 |
| Divergencia KL respecto al base | 0,0043 | 0 (por definición) |

Desglose MMLU por materia (este modelo frente al original): professional_law 53,26 % vs 52,87 %; moral_scenarios 41,12 % vs 43,91 %; miscellaneous 81,35 % vs 81,61 %; professional_psychology 74,02 % vs 75,16 %; high_school_psychology 89,54 % vs 89,17 %; high_school_macroeconomics 72,31 % vs 72,82 %; elementary_mathematics 63,49 % vs 65,87 %; moral_disputes 68,21 % vs 68,21 %; prehistory 75,62 % vs 75,31 %; philosophy 70,10 % vs 70,74 %.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en bf16/fp16 para los ~8B parámetros; ~8-9 GB en cuantización de 8 bits; ~4-5 GB en 4 bits (estimación a partir del número de parámetros, no verificada por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para bf16 sin compromisos; RTX 4090 (24 GB) para bf16 con margen ajustado o fp8/int8.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) en bf16 y en RTX 4080/4070 Ti Super (16 GB) solo con cuantización.
- Opciones de despliegue: `transformers` (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para este modelo en la información disponible, y la conversión a GGUF no se distribuye en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-uncensored-heretic | ~8B | no disponible | 68,97 % | apache-2.0 | Abliterado con Heretic/ARA; multimodal |
| google/gemma-4-E4B-it | ~8B | no disponible | 69,46 % | apache-2.0 | Base original; rechaza el 99 % de los prompts del test |
| Otras variantes abliterated de la familia Gemma | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información sobre alternativas comparables de otros autores (por ejemplo, versiones uncensored de Llama o Qwen del mismo tamaño) en la documentación consultada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- La abliteración elimina salvaguardas: el modelo puede generar contenido dañino, ilegal o sexualmente explícito; no debe desplegarse en aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo de alucinación: inherente a los modelos de ~8B; la ablación no lo corrige y puede aumentar la confianza en respuestas incorrectas al reducir la cautela.
- Degradación medible aunque pequeña: MMLU baja 0,49 puntos y PIQA 0,44 puntos; la caída es mayor en materias sensibles a la censura como moral_scenarios (-2,79 puntos) y elementary_mathematics (-2,38 puntos).
- Idiomas soportados no documentados: no se puede garantizar el rendimiento multilingüe del base sin evaluación propia.
- Longitud de contexto no especificada en la ficha; conviene verificar la del base antes de usarlo en tareas de contexto largo.
- La licencia declarada es apache-2.0, pero el `license_link` apunta a la licencia de Gemma 4 de Google; conviene revisar los términos de uso del modelo base para uso comercial, ya que pueden imponer restricciones adicionales a las de Apache 2.0.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y que el modelo podría no recibir actualizaciones; el repo se actualizó por última vez el 20 de noviembre de 2026.
- Solo se distribuyen pesos safetensors (16 GB); no hay GGUF ni cuantizaciones oficiales, lo que complica el despliegue en hardware de consumo sin conversión manual.
- No hay datos de tool calling, agentes ni evaluación de seguridad independiente; el benchmark de rechazos (7/100) es una métrica del propio autor sin protocolo público detallado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/gemma-4-E4B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
