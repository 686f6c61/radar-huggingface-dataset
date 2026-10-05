# KexuanShi/sft_gemma2_2b_vocabdrop_a075

## Resumen

El modelo `KexuanShi/sft_gemma2_2b_vocabdrop_a075` es un ajuste fino (SFT) sobre una base de la familia Gemma 2 de 2B parámetros, publicado por el usuario KexuanShi en HuggingFace. El identificador y la etiqueta `gemma2` del repositorio, junto con el recuento real de parámetros del safetensors (2.614.341.888), apuntan a que se trata de un derivado directo de Gemma 2 2B de Google. El entrenamiento se ha realizado con la librería TRL de HuggingFace mediante supervisión de instrucciones (SFT), según los tags `trl` y `sft` del repositorio.

El sufijo `vocabdrop_a075` del nombre sugiere una técnica de *vocabulary dropout* con un parámetro alpha de 0.75, probablemente empleada para mejorar la robustez del modelo frente a vocabulario poco frecuente o multilingüe. No obstante, la model card publicada no documenta ni el procedimiento de entrenamiento ni el dataset utilizado, por lo que esta interpretación es una inferencia del nombre y no un dato confirmado.

Se trata de un modelo de generación de texto con licencia no especificada, sin descargas ni interacciones en el momento de redactar esta ficha, y con escasa documentación asociada. Su relevancia actual es limitada como modelo de producción, pero puede resultar de interés como ejercicio de investigación sobre técnicas de ajuste fino selectivo o *vocabulary dropout* aplicadas a modelos compactos de la familia Gemma 2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Gemma 2 (etiqueta `gemma2` en el repositorio) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin concretar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada corresponde a la familia Gemma 2, un transformer decoder-only con atención por ventanas deslizantes y atención global alternadas en el modelo original. El repositorio incluye la etiqueta `gemma2` y la librería `transformers`, y el recuento de parámetros (2.614 millones) coincide con el de Gemma 2 2B, aunque la model card no confirma explícitamente la base. El pipeline declarado es `text-generation` y el modelo está etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`.

El entrenamiento se ha realizado mediante SFT (*supervised fine-tuning*) con TRL, según los metadatos del propio repositorio. Las versiones de framework declaradas son TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se especifican el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas. El sufijo `vocabdrop_a075` sugiere la aplicación de *vocabulary dropout* con un factor alpha de 0.75 durante el ajuste, pero este extremo no está documentado en la model card y debe tratarse como una conjetura.

## Capacidades

- Generación de texto conversacional en formato chat, a partir del ejemplo `pipeline` de la model card que emplea una lista de mensajes con `role: user`.
- Ajuste fino por instrucciones (SFT), por lo que se espera que siga indicaciones de usuario de forma básica.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (modo *thinking*, visión, audio, decodificación especulativa): no disponibles.
- Hereda la arquitectura Gemma 2, por lo que sus capacidades reales dependen en gran medida del modelo base subyacente, no documentado aquí.

## Casos de uso

- Prototipado de asistentes conversacionales ligeros: al tratarse de un modelo de ~2.6B parámetros, puede ejecutarse en GPU de consumo y servir como banco de pruebas para diálogos multi-turno antes de escalar a modelos mayores.
- Investigación sobre *vocabulary dropout*: si el nombre reflecta realmente esa técnica, el modelo sirve como caso de estudio para analizar cómo afecta el *dropout* de vocabulario a la calidad de generación en modelos compactos.
- Experimentación académica con TRL: al estar entrenado con TRL y documentar versiones de framework, es reproducible como referencia para pipelines de SFT.
- Generación de texto de baja latencia en entornos locales: el tamaño reducido permite desplegarlo en una sola GPU consumer mediante transformers o llama.cpp.
- Fine-tuning adicional por parte de terceros: sirve como punto de partida para ajustes específicos de dominio sobre una base pequeña.
- Evaluación comparativa de *checkpoints* SFT: útil como baseline para medir el impacto de recetas de entrenamiento alternativas en la familia Gemma 2 2B.
- Despliegue en endpoints compatibles con la API de HuggingFace: la etiqueta `endpoints_compatible` indica que puede servirse mediante la infraestructura gestionada de HuggingFace.

Nota: la falta de benchmarks y de licencia clara desaconseja su uso directo en producción sin una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado evaluaciones externas asociadas al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP32): en torno a 10-11 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en bfloat16/float16: aproximadamente 5-6 GB para pesos.
- VRAM estimada en cuantización de 8 bits: del orden de 3 GB (según disponibilidad de cuantizaciones, no confirmadas en el repositorio).
- VRAM estimada en cuantización de 4 bits: del orden de 1,5-2 GB (igualmente no confirmada).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bfloat16 (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Para entrenamiento o fine-tuning adicional, se recomienda al menos una RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, así como en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: `transformers` (declarado), `text-generation-inference` (etiquetado como compatible), `endpoints_compatible` (infraestructura gestionada de HuggingFace). No se confirma compatibilidad con vLLM, llama.cpp u Ollama, aunque serían viables si se generan los pesos en GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sft_gemma2_2b_vocabdrop_a075 | 2,61B | no disponible | no disponible | HuggingFace, safetensors | SFT con TRL sobre base Gemma 2; sin benchmarks ni documentacion |
| Gemma 2 2B (Google) | 2,61B | 8.192 tokens | Gemma Terms of Use | HuggingFace, Kaggle, Vertex AI | Modelo base oficial, con benchmarks publicados |
| Qwen2.5 1.5B / 3B | 1,5B / 3,1B | 32.768 tokens | Apache 2.0 (segun variante) | HuggingFace | Alternativa compacta con licencia permisiva y contexto amplio |
| Llama 3.2 3B | 3,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, Meta | Modelo instruct de tamano comparable con contexto muy superior |
| Phi-3.5-mini | 3,8B | 128.000 tokens | MIT | HuggingFace | Alternativa orientada a razonamiento y contexto largo |

La comparativa con Gemma 2 2B es directa al compartir arquitectura y tamaño; el resto se incluyen como alternativas de la misma franja. Los datos de contexto y licencia de los modelos comparados provienen de sus respectivas fichas públicas y no de la información proporcionada sobre el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia cuantitativa de calidad, por lo que no se puede garantizar su comportamiento en tareas concretas.
- Licencia no especificada: la model card indica únicamente "licence: license", lo que impide determinar si se permite uso comercial. Se debe contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no se puede confirmar el soporte multilingüe ni el rendimiento en castellano.
- Riesgo de alucinación: inherente a cualquier modelo generativo de este tamaño; la falta de evaluación agrava la incertidumbre.
- Sesgos conocidos: no documentados. Al derivar de una base Gemma 2, podría heredar sesgos del corpus original, pero no hay análisis disponible.
- Contexto limitado: si mantiene la ventana de Gemma 2 2B, sería inadecuado para tareas que requieran entradas muy largas; este dato no está confirmado.
- Modelo sin tracción: cero descargas y cero interacciones, lo que reduce la probabilidad de que existan revisiones independientes o correcciones de errores.
- Model card incompleta: no se especifica la base exacta, el dataset, la receta de entrenamiento, ni detalles del *vocabulary dropout* sugerido por el nombre.
- Fechas de creación y actualización (2026) en los metadatos del repositorio resultan anómalas y podrían indicar inconsistencias en la información del autor.

## Enlaces

- HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_vocabdrop_a075
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de Gemma 2 (Google): no disponible en la información proporcionada.
- Paper de Gemma 2: no disponible en la información proporcionada.
- Repositorios, demos o blogs adicionales del autor: no disponibles.
