# jayzou3773/less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-e-50

## Resumen

Less-is-MoE Gemma 4 26B-A4B (IntDim-E 50%) es un checkpoint de generación de texto derivado de `google/gemma-4-26B-A4B` publicado por el usuario jayzou3773. No es un modelo entrenado desde cero ni un ajuste fino: es el resultado de una poda estructural del 50% de las neuronas FFN de los expertos enrutados del modelo base, aplicando el método *Less-is-MoE* basado en la media del valor absoluto del gradiente (mean-absolute-gradient). El objetivo declarado es reducir el coste de almacenamiento e inferencia de un transformer con mezcla de expertos (MoE) conservando la topología y el comportamiento del modelo original.

El checkpoint resultante declara 13.814.149.120 parámetros (13,8B) en safetensors, con un tamaño de repositorio de 27,7 GB, lo que corresponde a pesos en BF16. La variante IntDim-E se caracteriza por tener una única anchura de experto uniforme, a diferencia de las variantes IntDim-L/G del mismo proyecto, que conservan la topología MoE enrutada y almacenan anchuras compactas por experto en `config.json`. La torre de visión del modelo base se excluye de forma intencionada, por lo que este repositorio es exclusivamente de texto.

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar hasta qué punto la poda de expertos degrada (o no) el rendimiento de un MoE, con una configuración de calibración completamente congelada y hashes publicados. Se publica bajo licencia apache-2.0, aunque con matices importantes sobre la licencia heredada del modelo base (véase la sección de limitaciones). El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE), podado estructuralmente mediante Less-is-MoE (variante IntDim-E, anchura de experto uniforme) |
| Parametros totales | 13.814.149.120 (13,8B) |
| Parametros activos | no disponible (el modelo base se denomina A4B, lo que sugiere del orden de 4B activos, pero el dato no se confirma para este checkpoint podado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con arquitectura MoE, heredado de `google/gemma-4-26B-A4B` y transformado mediante poda estructural, no mediante entrenamiento adicional. El método Less-is-MoE (mean-absolute-gradient) elimina exactamente el 50% de las neuronas FFN de los expertos enrutados. La selección de qué neuronas eliminar se decide con 64 muestras de calibración extraídas de la configuración `gpqa_main` del dataset `Idavidrein/gpqa`, en la revisión `633f5ee89ab8ad4522a9f850766b73f62147ffdd`. La puntuación de gradientes se hizo en BF16 y **no hubo ningún paso de optimizador**: no es un fine-tune, es una cirugía de pesos guiada por gradientes congelados.

Los ajustes de calibración están explícitamente congelados: split `train`, semilla 1234, formato de pregunta más opciones barajadas, experto `Explanation`, letra de respuesta, sin plantilla de chat, sin límite de longitud del tokenizador, sin truncado, sin padding. Se cargó la torre completa del modelo de lenguaje causal de Gemma 4 para validar equivalencia en FP32 y se guardó en BF16; la torre de visión queda excluida. Los hashes de selección de filas de origen (`790c4c22…92e6`) y del fichero de tokens de Gemma (`1f160f6c…e2e0`) están publicados, y la selección de origen congelada se registra en `jayzou3773/less-is-moe-gpqa-main-calibration-64` (revisión `7134dfef…d96`). Los tensores de tokens de Gemma no se añadieron a ese repositorio por motivos de contenido derivado de GPQA. Los metadatos completos de exportación y de equivalencia con máscara cero están en `experiment-export.json`.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje causal base.
- Razonamiento y respuesta a preguntas de opción múltiple, dado que el modelo base está orientado a tareas de conocimiento y el proceso de calibración usó preguntas de tipo GPQA.
- Capacidad presumible de razonamiento científico y técnico heredada del modelo base, sin evaluación publicada que lo cuantifique.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Sin plantilla de chat: no es un modelo instruct ni está alineado para diálogo; requiere prompts en formato de completado.
- Capacidades multilingües: no disponibles (no declaradas en el repositorio; dependerían del modelo base).
- Sin visión: la torre de visión se excluye expresamente de este checkpoint.
- Sin modo *thinking* documentado.

## Casos de uso

- Investigación sobre poda de MoE: usar este checkpoint como artefacto de referencia para medir la degradación de un MoE al eliminar el 50% de las neuronas FFN de los expertos, comparando contra `google/gemma-4-26B-A4B` con los mismos prompts y métricas. La configuración de calibración congelada y los hashes publicados permiten reproducir el experimento.
- Estudio de eficiencia memoria-calidad: al pasar de un MoE de mayor tamaño a 13,8B parámetros en BF16 (27,7 GB de pesos), resulta útil para analizar la relación entre reducción de huella de memoria y pérdida de calidad en tareas de conocimiento.
- Evaluación comparativa de métodos de poda: emplearlo como baseline para contrastar Less-is-MoE frente a otras técnicas de pruning estructurado sobre arquitecturas MoE.
- Generación de texto sin instrucciones en pipelines de completado: integrable en flujos que consumen `text-generation` con prompts crudos, sin esperar formato conversacional.
- Reproducibilidad de experimentos: la publicación de hashes de selección de filas, hashes de tokens y metadatos de exportación lo hace adecuado para auditorías de pipelines de poda.
- Docencia y formación: ejemplo didáctico de cómo se registra una poda estructural reproducible (semilla, split, formato de prompt, precisión de la puntuación de gradientes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Nota metodológica relevante: la calibración se realizó con 64 muestras de `gpqa_main`. Cualquier evaluación de este checkpoint en GPQA o en benchmarks derivados quedaría comprometida por contaminación del conjunto de calibración, por lo que sus resultados en esa familia de tareas no serían interpretables sin un análisis específico de solapamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 27,6 GB (13,8B parámetros × 2 bytes), coherente con el repositorio de 27,7 GB. Hay que sumar caché KV y activaciones, cuyo tamaño depende de la longitud de contexto (no disponible).
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB, o GPUs profesionales con al menos 40 GB de memoria para BF16 en una sola tarjeta.
- GPU de consumo: una RTX 4090 (24 GB) no es suficiente para los pesos en BF16 sin *offloading*. Dos RTX 4090 (48 GB agregados) podrían servir con paralelismo de tensor, si el runtime lo soporta.
- No se documentan variantes cuantizadas (GGUF, AWQ, GPTQ), por lo que no puede confirmarse su ejecución en GPUs de consumo mediante cuantización de 4 bits.
- Opciones de despliegue: la model card indica que la inferencia requiere vLLM estándar desde la imagen GPU unificada de Less-is-MoE. No se documenta soporte para llama.cpp, Ollama, TGI ni otros runtimes, y la estructura podada podría no ser compatible con ellos sin conversión específica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-e-50 | 13,8B | no disponible | no disponible | apache-2.0 (con matices sobre el base) | HuggingFace, requiere vLLM especifico |
| google/gemma-4-26B-A4B (base) | no disponible | no disponible (denominacion A4B) | no disponible | no disponible en esta ficha | HuggingFace (modelo base) |
| Qwen3-30B-A3B | 30,5B | 3,3B | 128k (segun model card publica) | apache-2.0 | HuggingFace, amplio soporte de runtimes |
| Mixtral 8x7B | 46,7B | 12,9B | 32k | apache-2.0 | HuggingFace, amplio soporte de runtimes |

Las cifras de Qwen3-30B-A3B y Mixtral 8x7B proceden de sus model cards públicas y se incluyen únicamente como referencia de categoría (MoE abiertos de tamaño comparable); no se ha ejecutado ninguna comparación empírica contra este checkpoint. No hay datos de rendimiento publicados para el modelo objeto de esta ficha, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo instruct: se calibró y exportó sin plantilla de chat. Usarlo en diálogo o como asistente producirá resultados degradados y no representativos.
- Ausencia total de evaluación: no hay benchmarks publicados, ni comparación con el modelo base, ni verificación de la pérdida de calidad provocada por la poda del 50% de neuronas FFN.
- Contaminación potencial de GPQA: la calibración usó `gpqa_main`, por lo que evaluar en GPQA no es válido sin un análisis de solapamiento fila a fila.
- Licencia heredada: el repositorio declara apache-2.0, pero al derivar de `google/gemma-4-26B-A4B` es probable que sigan aplicándose los términos de uso de Gemma del modelo base. Conviene verificar la licencia del modelo original antes de cualquier uso comercial o redistribución.
- Reproducibilidad parcial: los tensores de tokens de Gemma no se publicaron en el repositorio de calibración, solo sus hashes. La reproducción exacta depende de reconstruir la selección original a partir de los hashes y de la revisión congelada de GPQA.
- Exclusión de visión: cualquier caso de uso multimodal queda descartado.
- Dependencia de runtime: la model card exige vLLM estándar desde una imagen GPU concreta. Esto limita el despliegue en entornos estandarizados y complica la portabilidad (Ollama, llama.cpp, TGI no documentados).
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre el comportamiento en castellano.
- Estado del repositorio: 0 descargas y 0 valoraciones, sin evidencia de uso o validación por terceros. No apto para producción sin una batería de evaluación propia.
- Riesgo de alucinación: no cuantificado; los modelos base de generación de texto sin alineación conversacional suelen presentar tasas de alucinación elevadas en tareas abiertas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-e-50
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Repositorio de calibración: https://huggingface.co/jayzou3773/less-is-moe-gpqa-main-calibration-64
- Dataset de calibración: https://huggingface.co/datasets/Idavidrein/gpqa (revisión 633f5ee89ab8ad4522a9f850766b73f62147ffdd)
- Metadatos de exportación y validación de equivalencia: `experiment-export.json` dentro del repositorio del modelo
- Paper de Less-is-MoE: no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
