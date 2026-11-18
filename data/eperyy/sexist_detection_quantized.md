# ePeryy/sexist_detection_quantized

## Resumen

`ePeryy/sexist_detection_quantized` es un adaptador LoRA (entrenado con qLoRA) sobre el modelo base `google-bert/bert-base-uncased`, especializado en la clasificación binaria de textos en inglés como "sexistas" o "no sexistas". Lo desarrolla el usuario ePeryy y se publica como un repositorio PEFT de 0,2 GB, lo que refleja que solo se distribuyen los pesos del adaptador y no el modelo completo. El modelo resuelve una tarea acotada de moderación de contenido: detectar lenguaje sexista en textos cortos en inglés.

La relevancia de esta ficha es limitada pero concreta: se trata de un clasificador BERT afinado con técnicas de cuantización de bajo rango (qLoRA), lo que permite ajustar un modelo de 110 millones de parámetros con un coste de memoria reducido. El autor declara una precisión de 0,8583 sobre el conjunto de evaluación, aunque no se especifica la composición de dicho conjunto ni el corpus de entrenamiento más allá de describirlo como "corpora agregada" de textos en inglés.

No hay información sobre el pipeline declarado, idiomas soportados más allá del inglés, ni resultados de benchmarks estándar (el `model-index` está vacío). La ficha se completa con los datos disponibles y se marcan explícitamente como "no disponible" los campos que el autor no ha documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) con adaptador LoRA; entrenamiento qLoRA |
| Parámetros totales | 110 M (modelo base BERT-base); tamaño del adaptador no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de bert-base-uncased; no confirmado en la model card) |
| Tipos de cuantización | qLoRA (cuantización del modelo base durante el entrenamiento); cuantizaciones de inferencia no documentadas |
| Idiomas soportados | inglés (el autor indica explícitamente "English texts") |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de tipo PEFT sobre `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 110 millones de parámetros. El entrenamiento se realizó con qLoRA, es decir, cuantizando el modelo base y entrenando únicamente los pesos de bajo rango del adaptador. El autor no detalla la configuración del adaptador (rango, alpha, capas objetivo) ni el número total de tokens de entrenamiento; solo indica que se usó una "corpora agregada" de textos en inglés para diferenciar entre sexista y no sexista.

Los hiperparámetros documentados son: learning rate 2e-05, batch size de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 15 épocas y precisión mixta nativa (AMP). El entrenamiento alcanzó 50.535 pasos. No se menciona RLHF, DPO ni ninguna innovación técnica adicional más allá del propio qLoRA. La pérdida de validación final fue 0,3212 y la precisión 0,8583.

## Capacidades

- Clasificación binaria de texto en inglés: etiqueta un texto como "sexista" o "no sexista".
- Especialización en frases y textos cortos; el autor limita explícitamente el uso a "text classification of sexist phrases in English".
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; el autor solo menciona inglés.
- No dispone de modo "thinking" ni capacidades multimodales.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el clasificador puede filtrar o marcar mensajes con lenguaje sexista en inglés antes de su publicación, integrándose como un paso de pre-moderación con umbral de confianza ajustable.
- Revisión de reseñas y feedback de usuarios: permite etiquetar automáticamente reseñas de productos o servicios que contengan contenido sexista para su revisión humana posterior.
- Análisis de toxicidad en datasets de investigación: sirve para anotar corpus en inglés con una etiqueta binaria de sexismo, útil como línea base en estudios de NLP social.
- Filtrado previo en pipelines de entrenamiento de LLM: puede usarse para descartar ejemplos sexistas de datasets de texto en inglés antes de entrenar modelos generativos.
- Monitorización de comunidades online: integrado en un sistema de alertas, permite detectar picos de lenguaje sexista en canales o hilos concretos.
- Investigación en sesgos de género: como clasificador entrenado específicamente, puede emplearse para medir la prevalencia de lenguaje sexista en distintos corpus y comparar distribuciones.
- En todos los casos, el uso debe limitarse a inglés y a textos cortos, y requiere validación humana por la naturaleza sensible de la tarea.

## Benchmarks y rendimiento

El autor declara los siguientes resultados sobre el conjunto de evaluación (no se especifica su composición ni tamaño):

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 0,3212 |
| Accuracy | 0,8583 |

Evolución durante el entrenamiento (extracto de la model card):

| Época | Validation loss | Accuracy |
|---|---|---|
| 1 | 0,3691 | 0,8260 |
| 5 | 0,3339 | 0,8488 |
| 10 | 0,3227 | 0,8564 |
| 15 | 0,3212 | 0,8583 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. El `model-index` del repositorio está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de 0,2 GB; el modelo base BERT-base en fp32 ocupa aproximadamente 440 MB y en fp16 unos 220 MB. En conjunto, cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU para inferencia por lotes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` con `peft` (carga del adaptador sobre el modelo base), exportación a ONNX, o `llama.cpp`/`Ollama` no aplican de forma estándar para clasificadores BERT con adaptadores; la vía natural es `transformers` + `peft` o fusionar el adaptador en el modelo base y servir con `optimum`/ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo (110 M parámetros) se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ePeryy/sexist_detection_quantized | 110 M (base) + adaptador LoRA | 512 tokens (BERT) | Clasificación de sexismo en inglés | CC-BY-4.0 | Hugging Face (44 descargas) |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base genérico (MLM) | Apache-2.0 | Hugging Face |
| Alternativas específicas de detección de sexismo | no disponible | no disponible | Clasificación | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma tarea con métricas publicadas en la documentación proporcionada. La comparación más directa es con el modelo base sin afinar, que no realiza la tarea de clasificación de sexismo de forma nativa.

## Limitaciones y advertencias

- Ámbito restringido: el autor limita el modelo a la clasificación de frases sexistas en inglés; no debe usarse para otros idiomas ni para generación.
- Conjunto de evaluación no documentado: no se especifica su tamaño, composición ni procedencia, por lo que la accuracy de 0,8583 no es directamente extrapolable a otros dominios.
- Riesgo de sesgo: al ser un clasificador de contenido sensible entrenado sobre una "corpora agregada" no descrita, puede presentar sesgos de anotación y falsos positivos/negativos en contextos culturales o lingüísticos distintos.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del modelo base (Apache-2.0) al fusionar el adaptador.
- Requiere cargar el modelo base `google-bert/bert-base-uncased` además del adaptador; el repositorio solo contiene los pesos LoRA.
- No hay información sobre el pipeline declarado, lo que complica la integración automática en algunos frameworks.
- Para producción en moderación de contenido se recomienda validación humana y calibración de umbrales, dado el carácter sensible de la tarea.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ePeryy/sexist_detection_quantized
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de qLoRA: https://arxiv.org/abs/2305.14314
