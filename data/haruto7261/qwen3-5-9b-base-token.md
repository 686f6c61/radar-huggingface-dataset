# Haruto7261/Qwen3.5-9B-base-token

## Resumen

Qwen3.5-9B-base-token es una variante del modelo base Qwen3.5-9B publicada por el usuario Haruto7261 en Hugging Face. Segun la model card del autor, se trata de un modelo al que se le ha anadido un tokenizer de dialecto ryukyuense (琉球弁, el conjunto de variedades linguisticas de las islas Ryukyu, en el actual Japon) sobre la base de Qwen3.5-9B. El modelo cuenta con 8.952.435.200 parametros segun los pesos en safetensors, lo que lo situa en la franja de los 9B, y el repositorio ocupa 17,9 GB.

La informacion publicada es muy escasa: no se detalla el proceso de entrenamiento, el volumen de datos del dialecto utilizado, la licencia, los idiomas soportados ni el pipeline de uso. La arquitectura declarada en los tags de Hugging Face es `qwen3_5_text`, lo que indica que se apoya en la familia Qwen3.5 de Alibaba, aunque no se especifican la longitud de contexto ni los detalles internos.

Su relevancia es acotada pero concreta: representa un ejemplo de adaptacion linguistica de bajo nivel (extension de vocabulario y tokenizer) orientada a una variedad linguistica minoritaria y en peligro, el ryukyuense, sobre un modelo base moderno. Para desarrolladores e investigadores interesados en tokenizers para lenguas de bajos recursos, es un caso de estudio, aunque la falta de documentacion limita seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5_text`), basada en Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 8.952.435.200 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible; la model card menciona anadido de tokenizer de ryukyuense (琉球弁) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como una modificacion de Qwen3.5-9B con un tokenizer ampliado para ryukyuense. El tag `qwen3_5_text` sugiere que se conserva la arquitectura de texto de la familia Qwen3.5, un transformer decoder-only, pero no se aportan datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni uso de variantes como attention linear o decodificacion especulativa.

No hay informacion sobre el corpus de entrenamiento, el numero de tokens utilizados, la composicion del dataset, ni si hubo fases de ajuste supervisado, RLHF o DPO. Tampoco se especifica si el tokenizer ampliado se acompana de un reentrenamiento de los embeddings o de un ajuste completo del modelo, ni cuantos tokens nuevos se han incorporado al vocabulario. Todos estos datos figuran como no disponibles.

## Capacidades

- Generacion de texto en el modelo base Qwen3.5-9B, segun la arquitectura declarada; no se documentan capacidades especificas en la model card.
- Procesamiento de texto en ryukyuense mediante el tokenizer ampliado, segun la unica frase descriptiva del autor.
- Razonamiento, codigo, matematicas, vision, tool calling, agentes y modo thinking: no disponible (no se confirman ni se descartan).
- Capacidades multilingues: no disponible; solo se menciona explicitamente el ryukyuense.
- Capacidades especiales (audio, vision, thinking mode): no disponible.

## Casos de uso

- Investigacion en tokenizers para lenguas de bajos recursos: el modelo sirve para estudiar como afecta la extension del vocabulario a la tokenizacion del ryukyuense y comparar la tasa de compresion de tokens frente al tokenizer original de Qwen3.5.
- Experimentos de adaptacion linguistica: util como punto de partida para evaluar si un tokenizer ampliado sobre un modelo base mejora la perplejidad en textos de variedades ryukyuenses antes de acometer un ajuste fino supervisado.
- Preservacion digital de lenguas minoritarias: puede emplearse en prototipos de transcripcion, normalizacion o generacion asistida de material en ryukyuense, siempre que se valide la calidad con hablantes nativos.
- Analisis linguistico computacional: permite tokenizar corpus de dialectos ryukyuenses con un vocabulario especifico y comparar segmentaciones frente a modelos genericos.
- Base para fine-tuning supervisado: al ser un modelo base, es adecuado como inicializacion para tareas posteriores (clasificacion, traduccion o generacion) una vez documentada su licencia.
- Docencia y demostraciones: ejemplo didactico de como se modifica el tokenizer de un modelo abierto y que implicaciones tiene sobre los embeddings y el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 18 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos, aunque no se publican pesos GGUF ni cuantizados.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 para cuantizaciones de 8 o 4 bits si se generan.
- Cabe en GPU de consumo: si, en RTX 4090 con fp16 y en GPUs de 12-16 GB si se cuantiza, siempre que se conviertan los pesos.
- Opciones de despliegue: vLLM o TGI para safetensors en fp16; llama.cpp u Ollama requeririan conversion previa a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-base-token (este modelo) | 8.952.435.200 | no disponible | no disponible | safetensors en Hugging Face, 57 descargas |
| Qwen3.5-9B (base original) | ~9B (segun denominacion) | no disponible en esta ficha | no disponible en esta ficha | modelo base de referencia de Alibaba |
| Otros modelos de ~9B con tokenizer adaptado | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Documentacion minima: la model card consta de una sola frase; no hay informacion sobre entrenamiento, evaluacion ni uso previsto.
- Licencia no declarada: no puede asumirse uso comercial sin verificar la licencia del modelo base Qwen3.5-9B y la del propio repositorio.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluaciones publicadas no puede acotarse su magnitud.
- Idiomas: solo se menciona el ryukyuense; se desconoce el comportamiento en castellano u otras lenguas.
- Tokenizer modificado: la ampliacion del vocabulario puede degradar el rendimiento en textos no ryukyuenses si los embeddings nuevos no se entrenaron adecuadamente, extremo no documentado.
- Contexto: se desconoce la longitud de contexto efectiva, lo que impide planificar despliegues con ventanas largas.
- Madurez: 57 descargas y 0 likes indican un modelo experimental sin validacion comunitaria.
- Sesgos: no disponibles; no se han publicado analisis de sesgo.

## Enlaces

- Hugging Face: https://huggingface.co/Haruto7261/Qwen3.5-9B-base-token
- Modelo base de referencia (familia Qwen3.5): no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
