# ForeverBlue/Qwen3-VL-2B-GRACE-W4G128-AWQ

## Resumen

Qwen3-VL-2B-GRACE-W4G128-AWQ es un checkpoint de despliegue del modelo vision-lenguaje Qwen3-VL-2B-Instruct, cuantizado a INT4 con AWQ (grupo de 128) y entrenado con el framework GRACE (Gated Relational Alignment via Confidence-based Distillation for Efficient VLMs). Lo desarrolla ForeverBlue, con el respaldo de investigadores de ETH Zürich y Università di Bologna, y está pensado para inferencia eficiente en GPUs NVIDIA manteniendo un 98% del rendimiento del checkpoint BF16 original.

El modelo resuelve el problema de comprimir VLMs multimodales sin perder capacidad de razonamiento visual. GRACE combina destilación de conocimiento con puerta de confianza, alineación relacional CKA y un controlador de cuello de botella informativo adaptativo. Con 906,8 millones de parámetros, este checkpoint AWQ ocupa 2,2 GB en disco y está diseñado para cargarse con el loader específico de GRACE, no con `from_pretrained` estándar de Transformers.

Su relevancia actual radica en que ofrece una alternativa ligera y desplegable de un VLM de 2B, con licencia Apache-2.0, apta para entornos con recursos limitados y para aplicaciones de imagen-texto en inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal con vision encoder y LLM) |
| Parametros totales | 906.792.960 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-VL-2B-Instruct soporta 32k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | INT4 AWQ (W4G128); también existen checkpoints BF16 y QAT en la colección GRACE |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (AWQ-packed) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3-VL-2B-Instruct, un transformer multimodal que combina un vision encoder con un modelo de lenguaje de 2B parámetros. El checkpoint AWQ mantiene la misma topología pero con pesos cuantizados a INT4 en grupos de 128, lo que reduce el footprint de memoria a aproximadamente un cuarto del BF16.

El entrenamiento se realizó con el framework GRACE sobre el dataset ShareGPT4V. GRACE introduce tres componentes: destilación de conocimiento con puerta de confianza (el profesor modula la intensidad de la destilación según su certeza), alineación relacional CKA (centered kernel alignment) entre representaciones de tokens visuales del profesor y el estudiante, y un controlador de cuello de botella informativo adaptativo que regula la compresión de representaciones. El resultado es un modelo que conserva el 98% del rendimiento medio del checkpoint BF16 (75,0 frente a 76,7 en siete benchmarks VLM).

## Capacidades

- Generación de texto a partir de imágenes: describe, responde preguntas y sigue instrucciones multimodales sobre contenido visual.
- Razonamiento visual: capaz de interpretar escenas, objetos, texto en imágenes y relaciones espaciales.
- Seguimiento de instrucciones conversacionales: soporta diálogos multi-turno con contexto de imagen.
- Multilingüe limitado: inglés y chino, según la configuración del modelo base.
- Cuantización INT4 eficiente: pensado para inferencia con bajo consumo de memoria, compatible con runtimes AWQ (autoawq-kernels opcional para ruta CUDA fusionada).
- No incluye tool calling ni capacidades de agente explícitas en la información proporcionada.

## Casos de uso

- Asistencia visual en atención al cliente: el modelo puede analizar capturas de pantalla o fotos enviadas por usuarios y generar respuestas descriptivas o de resolución de problemas, gracias a su capacidad de seguir instrucciones multimodales en inglés y chino.
- Accesibilidad para personas con discapacidad visual: descripción automática de imágenes en tiempo real en dispositivos con recursos limitados, aprovechando el bajo footprint de memoria del INT4.
- Moderación de contenido visual: clasificación o descripción de imágenes en pipelines de revisión, donde el coste de inferencia es crítico y se requiere despliegue en GPUs consumer.
- Anotación de datos para datasets: generación de subtítulos o metadatos para imágenes en entornos de investigación, con la ventaja de poder ejecutarse en hardware modesto.
- Educación y tutoría visual: responder preguntas sobre diagramas, gráficos o fotografías en aplicaciones educativas, con soporte para inglés y chino.
- Prototipado rápido de aplicaciones VLM: al ser un checkpoint AWQ listo para desplegar, permite integrar visión-lenguaje en demos o MVPs sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento

La model card indica que el checkpoint AWQ retiene una media de 75,0 en siete benchmarks VLM, frente a 76,7 del checkpoint GRACE BF16 (98% de rendimiento). No se proporcionan los resultados desglosados por benchmark (MMLU, HumanEval, etc.) en la información disponible, por lo que no es posible presentar una tabla comparativa detallada. Se recomienda consultar el paper para métricas específicas.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 906,8M parámetros en INT4, los pesos ocupan aproximadamente 0,45 GB; sumando activaciones, KV cache y overhead del runtime, se estima que cabe en GPUs con 4-6 GB de VRAM, aunque no hay datos confirmados.
- GPU recomendadas: cualquier NVIDIA con soporte CUDA (la model card menciona explícitamente NVIDIA). Se recomienda instalar `autoawq-kernels` para la ruta CUDA fusionada; sin él, la inferencia funciona pero es más lenta.
- Compatibilidad con GPUs consumer: sí, por tamaño y cuantización, es viable en RTX 3060, RTX 4060, RTX 4090, etc., siempre que se cumplan los requisitos de VRAM.
- Opciones de despliegue: el loader oficial de GRACE (`deploy_awq_qwen.py`) es el método recomendado; también es posible usar runtimes AWQ compatibles (vLLM, TGI) si soportan el layout AWQ, aunque la model card advierte que se requiere el loader GRACE para reconstruir las capas cuantizadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-2B-GRACE-W4G128-AWQ | 906,8M | INT4 AWQ | No disponible | Apache-2.0 | Checkpoint de despliegue con GRACE |
| Qwen/Qwen3-VL-2B-Instruct | 2B (aprox.) | BF16 | 32k (según documentación de Qwen) | Apache-2.0 | Modelo base sin cuantizar |
| Qwen3-VL-2B-GRACE-BF16 | 906,8M | BF16 | No disponible | Apache-2.0 | Checkpoint GRACE sin cuantizar, para investigación |

No se dispone de datos de benchmarks comparativos con otros VLM de tamaño similar (p. ej., Phi-3.5-vision, LLaVA-1.6) en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint AWQ requiere el loader GRACE para activar los pesos INT4; una llamada estándar a `from_pretrained` de Transformers no funcionará correctamente.
- Idiomas limitados a inglés y chino; no se garantiza rendimiento en otros idiomas.
- Riesgo de alucinación visual: como todo VLM, puede generar descripciones inexactas de imágenes, especialmente en escenas complejas o ambiguas.
- Sesgos potenciales derivados del dataset ShareGPT4V y del modelo base Qwen3-VL-2B-Instruct, no documentados en la model card.
- La longitud de contexto no está especificada en esta ficha; se recomienda verificar la configuración del modelo base para casos de uso con contexto largo.
- Para uso en producción, es necesario validar el rendimiento en el dominio específico, ya que los benchmarks publicados son promedios de siete tareas VLM y no cubren todos los escenarios.

## Enlaces

- HuggingFace: https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-W4G128-AWQ
- Paper: https://arxiv.org/abs/2601.22709
- Código: https://github.com/ForeverBlue816/GRACE
- Colección GRACE: https://huggingface.co/collections/ForeverBlue/grace
- Space de demostración: https://huggingface.co/spaces/ForeverBlue/GRACE-VLM
- Dataset ShareGPT4V: https://huggingface.co/datasets/Lin-Chen/ShareGPT4V
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
