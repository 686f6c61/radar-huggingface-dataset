# leomaurodesenv/nli-MiniLM2-L6-H768-nvidia-aegis-v2

## Resumen

nli-MiniLM2-L6-H768-nvidia-aegis-v2 es un modelo de clasificación de texto publicado por el usuario leomaurodesenv en HuggingFace. Se trata de un ajuste fino del cross-encoder cross-encoder/nli-MiniLM2-L6-H768, un encoder tipo RoBERTa de 6 capas y 768 dimensiones ocultas orientado a inferencia de lenguaje natural (NLI). El modelo resultante cuenta con 82.119.938 parámetros (~82 M) y se distribuye bajo licencia Apache 2.0 en formato safetensors.

Su función es resolver tareas de clasificación de pares de secuencias (premisa-hipótesis), es decir, determinar relaciones de implicación, contradicción o neutralidad entre dos textos. Este tipo de modelos es relevante en pipelines de generación aumentada por recuperación (RAG), verificación factual, detección de alucinaciones y moderación de contenido, donde se necesita una señal de verificación barata y de baja latencia en lugar de un modelo generativo completo.

La model card es una plantilla autogenerada por el Trainer de HuggingFace y está prácticamente vacía: no documenta el conjunto de datos de entrenamiento, los usos previstos, los idiomas soportados ni la longitud de contexto. El nombre del modelo sugiere una posible relación con el conjunto de datos NVIDIA Aegis (seguridad de contenido), pero esto no se confirma en ninguna parte de la documentación disponible. No se han publicado resultados de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (MiniLM2, 6 capas, hidden 768) con cabeza de clasificación de secuencias |
| Parámetros totales | 82.119.938 (~82 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no se documenta conversión a int8, GGUF u ONNX) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |
| Pipeline | text-classification |
| Tarea | clasificación de pares de secuencias (NLI / cross-encoder) |
| Modelo base | cross-encoder/nli-MiniLM2-L6-H768 |
| Tamaño del repositorio | 1,6 GB |
| Librería | transformers (etiquetas adicionales: text-embeddings-inference, endpoints_compatible) |
| Fecha de creación | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia RoBERTa, concretamente la variante MiniLM2 con 6 capas y tamaño oculto de 768, según se deduce del identificador del modelo base y del recuento de parámetros publicado en safetensors. Al ser un cross-encoder, la premisa y la hipótesis se concatenan en una única secuencia de entrada y se procesan conjuntamente por el encoder; la representación resultante (habitualmente el token [CLS] o <s>) alimenta una cabeza de clasificación que produce la etiqueta de relación entre ambos textos. Este diseño es más preciso que un bi-encoder para tareas de NLI, a costa de no permitir precomputar embeddings.

El ajuste fino se realizó con el Trainer de HuggingFace sobre un conjunto de datos no especificado ("unknown dataset"). Los hiperparámetros documentados son: learning rate 2e-05, batch de entrenamiento 8, batch de evaluación 8, acumulación de gradiente 2 (batch total efectivo 16), optimizador adamw_torch_fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 50 pasos de warmup, semilla 42 y 10 épocas. El registro de entrenamiento solo muestra cuatro épocas (hasta el paso 4812), con la pérdida de validación repuntando en la cuarta (0,4711) mientras el accuracy seguía subiendo (0,8634), lo que apunta a un posible sobreajuste a partir de ese punto; el resultado final declarado en la evaluación es loss 0,3613 y accuracy 0,8438. Las versiones de framework son Transformers 5.2.0, PyTorch 2.10.0+cu128, Datasets 4.5.0 y Tokenizers 0.22.2.

## Capacidades

- Clasificación de pares de textos: relación de implicación, contradicción o neutralidad entre una premisa y una hipótesis.
- Puntuación de compatibilidad semántica entre frases, útil como reordenador (reranker) en pipelines de recuperación.
- Detección de contradicciones entre un texto de referencia y una afirmación generada.
- Clasificación de texto con `pipeline("text-classification")` de transformers sin código adicional.
- Compatibilidad declarada con Text Embeddings Inference (TEI) y con endpoints gestionados de HuggingFace mediante la etiqueta `endpoints_compatible`.
- No es un modelo generativo: no produce texto, código ni matemáticas.
- No soporta tool calling, function calling ni flujos de agente multi-paso.
- No tiene capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles (el idioma de entrenamiento no se documenta).

## Casos de uso

- Verificación factual en RAG: dado un fragmento recuperado y la respuesta generada por un LLM, el cross-encoder clasifica si la respuesta está implicada por el contexto y permite descartar respuestas no fundamentadas antes de mostrarlas al usuario.
- Detección de alucinaciones en producción: comparar cada afirmación de un texto generado contra la fuente original y marcar como contradictorias o neutras las que no se sostienen.
- Moderación de contenido: clasificar pares (política de seguridad, contenido) para decidir si una entrada infringe una regla; el nombre del modelo sugiere un ajuste orientado a este tipo de datos de seguridad.
- Evaluación automática de resúmenes: medir la fidelidad de un resumen respecto al documento original detectando frases que contradicen el original.
- Reordenación de resultados de búsqueda: puntuar pares (consulta, documento) para reordenar los candidatos devueltos por un bi-encoder de recuperación, mejorando la precisión final con un coste de cómputo bajo.
- Anotación asistida de corpus NLI: preetiquetar pares de frases en proyectos de curación de datos, dejando a los anotadores humanos solo la revisión de los casos dudosos.
- Control de calidad en pipelines de traducción o paráfrasis: comparar el texto original con la variante generada para detectar cambios de significado.
- Filtrado de deduplicación semántica: identificar pares de documentos que afirman lo contrario entre sí dentro de un mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (el campo `model-index` de la model card está vacío). Los únicos datos numéricos son los del entrenamiento y la evaluación interna del autor, recogidos en la tabla siguiente.

| Época | Paso | Pérdida de validación | Accuracy |
|---|---|---|---|
| 1.0 | 1203 | 0.3610 | 0.8436 |
| 2.0 | 2406 | 0.3672 | 0.8461 |
| 3.0 | 3609 | 0.3677 | 0.8567 |
| 4.0 | 4812 | 0.4711 | 0.8634 |
| Evaluación final declarada | — | 0.3613 | 0.8438 |

No hay resultados de MMLU, HumanEval, GSM8K, GLUE, SuperGLUE ni de ningún otro conjunto público, y no se detalla qué conjunto de evaluación se utilizó, por lo que estas cifras no son comparables con las de otros modelos NLI.

## Requisitos de hardware

- VRAM estimada para los pesos (solo parámetros, sin activaciones): ~328 MB en fp32, ~164 MB en fp16/bf16, ~82 MB en int8.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3060 (12 GB), RTX 4090 (24 GB) y modelos inferiores, e incluso en CPU para lotes pequeños.
- GPU para servidores: no requiere A100 ni H100; una T4 o L4 es más que suficiente para servir el modelo a alta concurrencia.
- Opciones de despliegue: pipeline de transformers, Text Embeddings Inference (etiqueta oficial del repositorio), servidores tipo FastAPI o TorchServe, y exportación a ONNX Runtime (no documentada, pero viable por tratarse de un encoder estándar).
- vLLM no es la vía natural para un cross-encoder de clasificación; llama.cpp/Ollama requerirían una conversión a GGUF que el repositorio no proporciona.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| nli-MiniLM2-L6-H768-nvidia-aegis-v2 | ~82 M | no disponible | apache-2.0 | Ajuste fino de autor individual, sin documentación de datos; accuracy interna 0,8438 |
| cross-encoder/nli-MiniLM2-L6-H768 | ~82 M (misma arquitectura base) | no disponible | no disponible en esta ficha | Modelo base del anterior; cross-encoder NLI con cobertura multilingüe en su versión original |
| roberta-large-mnli | ~355 M | no disponible | no disponible en esta ficha | Referencia clásica de NLI en inglés entrenada sobre MNLI; mayor coste de inferencia |
| facebook/bart-large-mnli | ~407 M | no disponible | no disponible en esta ficha | Encoder-decoder reutilizado habitualmente para clasificación zero-shot; mucho más pesado |

## Limitaciones y advertencias

- La model card no documenta el conjunto de datos de entrenamiento, lo que impide conocer la distribución, el idioma y el dominio cubiertos.
- No se especifica la composición de la etiqueta de salida ni el número exacto de clases, aunque por el modelo base se asume el esquema estándar de NLI (implicación, neutralidad, contradicción).
- La accuracy declarada (0,8438) implica una tasa de error aproximada del 16 % en el conjunto de evaluación interno, cuya naturaleza se desconoce.
- Los registros de entrenamiento muestran la pérdida de validación subiendo en la cuarta época mientras el accuracy mejora, señal habitual de sobreajuste; el modelo podría no generalizar fuera del dominio de entrenamiento.
- No hay información sobre sesgos demográficos, culturales o lingüísticos, ni sobre sesgos específicos del conjunto de datos de seguridad que sugiere el nombre del modelo.
- No hay información sobre idiomas soportados: no se debe asumir que funcione correctamente en castellano sin una evaluación propia.
- La longitud de contexto no está documentada; si se hereda la configuración habitual de RoBERTa, las secuencias largas podrían truncarse, pero este dato no se confirma.
- Riesgo de alucinación no aplica en sentido generativo (el modelo no genera texto), pero sí existe riesgo de clasificaciones erróneas en pares ambiguos, especialmente entre las categorías de neutralidad e implicación.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución siempre que se conserve el aviso de licencia y se indique los cambios; no impone restricciones de uso adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes, y el modelo se publicó sin validación externa: no hay evidencia de terceros sobre su calidad en producción.
- La búsqueda web no devolvió ningún resultado relacionado con el modelo; los enlaces recuperados correspondían a páginas turísticas sin relación, por lo que no existen fuentes externas que verifiquen sus prestaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leomaurodesenv/nli-MiniLM2-L6-H768-nvidia-aegis-v2
- Modelo base: https://huggingface.co/cross-encoder/nli-MiniLM2-L6-H768
- Organización del modelo base: https://huggingface.co/cross-encoder
- Paper, blog, repositorio o demo adicionales: no disponibles (la búsqueda web no devolvió resultados relevantes sobre este modelo).
