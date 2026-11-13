# dalatexcoder/xtools-at-DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-8bit

## Resumen

Este repositorio contiene una versión cuantizada a 8 bits del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic`, un fine-tune de razonamiento de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de la cuantización es dalatexcoder, que aplica cuantización uniforme de pesos a 8 bits (W8A16) excluyendo la capa `lm_head`, reduciendo el peso del repositorio a 5,8 GB frente a los aproximadamente 9,3 GB que ocuparían los pesos en bf16.

El modelo base es un fine-tune de Qwen3.5-4B entrenado con una mezcla de aproximadamente 250.000 muestras de matemáticas y STEM, siguiendo la misma receta que la versión de 9B del mismo autor. Sobre esa base, el modelo intermedio fue "descensurado" mediante la herramienta Heretic v2.0.0 con ablación de rango arbitrario (ARA), lo que reduce drásticamente las negativas a responder (de 99/100 a 5/100 en la evaluación del autor) a costa de una divergencia KL de 0,0378 respecto al original.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de razonamiento compacto de 4B parámetros con capacidades matemáticas y de STEM; por otro, ilustra el ecosistema de variantes "uncensored/abliterated" y su cuantización, un fenómeno habitual en Hugging Face que conviene evaluar con rigor antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, según tag `qwen3_5`) |
| Parámetros totales | 4.659.865.088 (4,66 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W8A16 (8 bits uniforme en pesos, activaciones a 16 bits), excluyendo `lm_head`; el modelo base ofrece también GGUF según tags |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con 4,66 B de parámetros. El pipeline de entrenamiento del modelo base parte de Qwen3.5-4B y aplica destilación desde DeepSeek-V4-Pro en modo Max Effect sobre una mezcla de aproximadamente 250.000 muestras centradas en razonamiento matemático y científico, con SFT (supervised fine-tuning) y soporte de MTP (multi-token prediction) según los tags del repositorio. No se detalla la composición exacta del dataset ni el número total de tokens de entrenamiento.

Sobre ese modelo base, la variante "heretic" aplica una ablación de rango arbitrario (ARA) entre las capas 16 y 32 con los parámetros indicados en la model card (`preserve_good_behavior_weight` 0,9854, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 0,6587, `neighbor_count` 10). Esta técnica modifica direcciones de activación para suprimir comportamientos de rechazo, no es un reentrenamiento y por tanto no añade conocimiento nuevo. La versión de este repositorio aplica además cuantización W8A16 sobre los pesos resultantes.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en descomposición explícita de problemas (herencia de la destilación desde DeepSeek-V4-Pro).
- Razonamiento matemático y resolución de problemas STEM, entrenado sobre unas 250.000 muestras de ese dominio.
- Generación de código y tareas de tipo `text-generation` según el pipeline declarado.
- Procesamiento image-text-to-text según los tags del repositorio (capacidad multimodal declarada, sin detalles de implementación en la información disponible).
- Soporte multilingüe para inglés, chino, coreano, japonés, español y ruso.
- Compatibilidad con endpoints (`endpoints_compatible`) y con text-generation-inference.
- Modo "uncensored": reducción de rechazos medida por el autor en 5/100 frente a 99/100 del original.
- No se documenta soporte explícito de tool calling, function calling ni uso agéntico en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado específicamente sobre unas 250.000 muestras STEM, por lo que es adecuado para tutoría automatizada, generación de ejercicios resueltos y verificación de cálculos paso a paso en entornos educativos.
- Asistente de razonamiento en local: con 4,66 B de parámetros y cuantización de 8 bits, puede desplegarse en una GPU de consumo para prototipos de razonamiento sin depender de APIs externas.
- Generación de explicaciones técnicas: útil para producir derivaciones y explicaciones detalladas en documentación científica o de ingeniería, aprovechando el estilo de descomposición aprendido por destilación.
- Investigación sobre alineación y censura: la variante heretic permite estudiar experimentalmente el efecto de la ablación ARA sobre las tasas de rechazo y la calidad de las respuestas, comparando con el modelo original.
- Evaluación de cuantización: sirve como caso de estudio para medir la degradación de un modelo de razonamiento al pasar de bf16 a W8A16, comparando con el repositorio base sin cuantizar.
- Procesamiento multilingüe ligero: para tareas de generación en inglés, chino, coreano, japonés, español o ruso en entornos con recursos limitados de GPU.
- Fine-tuning posterior: al estar bajo licencia Apache 2.0 y en formato safetensors estándar, puede servir de punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

La model card del autor solo publica métricas de comportamiento (rechazos y divergencia KL) para la variante heretic, no benchmarks estándar de razonamiento:

| Métrica | Este modelo (variante heretic) | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se aportan métricas específicas de la cuantización W8A16 frente al modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en W8A16 (pesos de 4,66 B a 8 bits ≈ 4,7 GB más overhead de activaciones y KV cache); en bf16 serían unos 9,3 GB.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; para despliegue en servidor, A100 o H100 con amplio margen.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM para la versión de 8 bits.
- Opciones de despliegue: transformers (formato nativo safetensors/compressed-tensors), text-generation-inference (TGI) según tags; el modelo base dispone de variantes GGUF, por lo que llama.cpp u Ollama serían viables partiendo de esa versión.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (8 bits) | 4,66 B | no disponible | Apache 2.0 | Cuantizado W8A16, variante heretic, ~5,8 GB |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4,66 B | no disponible | Apache 2.0 | Versión sin cuantizar del mismo modelo base |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4,66 B | no disponible | no disponible | Modelo original antes de la ablación heretic |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9 B (aprox.) | no disponible | no disponible | Versión de 9B de la misma receta de destilación |

No se dispone de datos de benchmarks ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La ablación heretic suprime rechazos mediante modificación de activaciones, no mediante alineación adicional: el modelo puede producir contenido dañino, sesgado o inapropiado sin las salvaguardas habituales. No es recomendable para aplicaciones de cara al público sin filtros externos.
- La divergencia KL de 0,0378 respecto al original implica una degradación medible de la distribución de salida; puede afectar a la coherencia en tareas fuera del dominio STEM.
- Riesgo de alucinación inherente a los modelos de 4B destilados: la destilación de un profesor grande no garantiza la misma fiabilidad factual.
- La cuantización W8A16 puede degradar ligeramente el rendimiento en razonamiento matemático respecto al modelo en bf16; no se aportan métricas que lo cuantifiquen.
- La longitud de contexto no está documentada en la información disponible; conviene verificarla antes de diseñar aplicaciones con prompts largos.
- El soporte multilingüe declarado (en, zh, ko, ja, es, ru) no implica calidad uniforme; no hay evaluación por idioma.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo descensurado conlleva riesgos reputacionales y legales según la jurisdicción y el contexto de despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del comportamiento real del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dalatexcoder/xtools-at-DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-8bit
- Modelo base (sin cuantizar): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo original antes de heretic: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Versión de 9B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune STEM del autor: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic (herramienta de ablación): https://heretic-project.org
