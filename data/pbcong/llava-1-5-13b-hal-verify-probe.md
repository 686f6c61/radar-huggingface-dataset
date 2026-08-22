# pbcong/llava-1.5-13b-hal-verify-probe

## Resumen

`pbcong/llava-1.5-13b-hal-verify-probe` es una sonda (probe) de verificación para detectar alucinaciones en el modelo multimodal LLaVA-1.5-13B. No es un modelo generativo, sino un pequeño clasificador por capas que se acopla al modelo anfitrión: lee los estados ocultos (hidden states) de LLaVA mientras este responde a una pregunta de visibilidad sobre un objeto, y predice si la mención de ese objeto en la respuesta es una alucinación o corresponde a algo realmente presente en la imagen. El autor, pbcong, lo publica como la versión de 13B de su probe verify de 7B, entrenado con los mismos pares de datos para permitir comparaciones a escala.

El probe utiliza una característica de contraste: la diferencia entre el estado oculto en la posición de respuesta cuando la imagen está presente y cuando no lo está, extraída en cinco capas intermedias del modelo anfitrión. Cada capa tiene su propio MLP (5120 → 256 → 256 → 1) y la puntuación final es la media de las sigmoides de las cinco cabezas, promediada sobre tres checkpoints entrenados con distintas semillas. El resultado reportado es un AP de 0.883 en el conjunto de evaluación COCO CHAIR-80 con anotaciones humanas, superando a un juez VLM de 122B (AP 0.826) y al probe de 7B (AP 0.876). Su relevancia radica en que ofrece un método ligero y basado en los internals del modelo para detectar alucinaciones sin necesidad de un modelo juez externo de gran tamaño, con una brecha de rendimiento de +0.14 frente al logit de salida del propio modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP por capa (probe) sobre LLaVA-1.5-13B (transformer multimodal) |
| Parametros totales | No disponible (el probe es ligero, ~7M estimados; el modelo base tiene 13B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, LLaVA-1.5-13B usa 4096 tokens) |
| Tipos de cuantizacion | No disponible (el probe se usa con el modelo base en precision completa) |
| Idiomas soportados | No disponible (el modelo base LLaVA esta entrenado principalmente en ingles) |
| Licencia | No disponible |
| Formato de pesos | PyTorch state dicts (.pt) |

## Arquitectura y entrenamiento

El probe es un conjunto de cinco MLP independientes, uno por cada capa del modelo anfitrión (capas 10, 15, 20, 25 y 30). Cada MLP tiene una arquitectura 5120 → 256 → 256 → 1 con activación GELU y normalización LayerNorm entre capas ocultas. La entrada a cada MLP es un vector de contraste de dimensión 5120, calculado como la diferencia entre el estado oculto en la posición de respuesta cuando la imagen se incluye en el prompt y cuando no se incluye. Esta característica se extrae durante una única pasada forward del modelo anfitrión con el prompt `USER: <image>\nIs at least one {noun} visible in this image? Answer yes or no.\nASSISTANT:`.

El entrenamiento se realizó sobre 202 000 pares (imagen, sustantivo) procedentes de 50 405 imágenes de COCO train2014. Las etiquetas se generaron a partir de las anotaciones humanas de COCO (ground truth) y los sustantivos se extrajeron mediante el conjunto CHAIR-80 sobre descripciones generadas por LLaVA-1.5-7B en modo greedy. La función de pérdida fue BCE con re-ponderación positiva y label smoothing (0.98/0.01), optimizada con AdamW (lr 3e-4, weight decay 0.05, batch 256) durante 12 épocas. La selección del modelo se hizo por AUROC within-word en un conjunto de validación separado por ID de imagen. Se entrenaron tres checkpoints con semillas 0, 1 y 2, y la predicción final es el promedio de las sigmoides de los tres modelos y las cinco capas.

## Capacidades

- Detección de alucinaciones en respuestas de LLaVA-1.5-13B para preguntas de visibilidad de objetos (¿es visible al menos un {sustantivo}?).
- Clasificación binaria por par (imagen, sustantivo): predice si la mención del sustantivo en la respuesta del modelo es una alucinación o está respaldada por la imagen.
- Funciona como un detector externo que se acopla al modelo anfitrión sin modificar sus pesos.
- No es un modelo generativo: no produce texto, solo puntuaciones de alucinación.
- Capacidad de ensamblaje: combina tres checkpoints para mejorar robustez y estabilidad.
- Compatible con el ecosistema PyTorch y con el modelo base `llava-hf/llava-1.5-13b-hf`.

## Casos de uso

- Evaluación automática de sistemas de visión-lenguaje: permite medir la tasa de alucinaciones de un VLM como LLaVA-1.5-13B en tareas de respuesta a preguntas visuales, sin necesidad de anotadores humanos ni de un modelo juez grande.
- Control de calidad en pipelines de generación de descripciones de imágenes: antes de publicar una descripción generada, se puede ejecutar el probe sobre cada sustantivo mencionado y filtrar o corregir las que tengan alta probabilidad de alucinación.
- Investigación en interpretabilidad: el análisis de las características de contraste por capas ofrece información sobre dónde y cómo el modelo codifica la presencia visual de objetos, lo que puede servir para estudiar los mecanismos internos de alucinación.
- Comparación de modelos: al estar entrenado sobre los mismos pares que el probe de 7B, permite comparar el comportamiento interno de distintas escalas de LLaVA (7B vs 13B) en términos de fidelidad visual.
- Detección de errores en datos de entrenamiento: aplicado a conjuntos de datos de imagen-texto, puede identificar pares donde el texto menciona objetos no visibles, ayudando a depurar datasets.
- Integración en sistemas de moderación de contenido generado por IA: como verificador de consistencia visual en aplicaciones que generan texto a partir de imágenes (por ejemplo, accesibilidad o descripciones automáticas).

## Benchmarks y rendimiento

El autor reporta resultados en el conjunto COCO CHAIR-80 con ground truth humano, sobre un holdout de 7 548 pares. La tabla siguiente resume el rendimiento comparativo con otros detectores evaluados en el mismo universo:

| Detector | AP | F1 | AUROC within-word |
|---|---|---|---|
| LLaVA-13B self logit (misma pasada forward) | .740 | — | — |
| Juez VLM de 122B (logit readout) | .826 | .777 | .930 |
| Verify probe 7B (ensamble 3 semillas) | .876 [.862, .889] | .814 | .937 |
| **Verify probe 13B (este repo, ensamble 3 semillas)** | **.883 [.870, .895]** | **.817** | **.940** |

El incremento de AP frente al juez de 122B es de +.056 (p < 1e-4) y frente al probe de 7B es de +.007 (p = .015). La brecha entre los internals del modelo y su propia salida (logit) es de aproximadamente +.14 en ambas escalas.

## Requisitos de hardware

- El probe en sí es muy ligero (menos de 10 MB), pero requiere ejecutar LLaVA-1.5-13B para extraer las características de contraste, por lo que la VRAM necesaria es la del modelo base.
- Para LLaVA-1.5-13B en precisión fp16 se necesitan aproximadamente 26 GB de VRAM. Una GPU como A100 (40 GB), RTX A6000 (48 GB) o dos RTX 3090/4090 en paralelo pueden ser suficientes.
- Con cuantización (por ejemplo, 8 bits o 4 bits) se podría reducir el requisito a ~13 GB o ~7 GB respectivamente, aunque el autor no especifica compatibilidad con cuantización para la extracción de features.
- El proceso de extracción implica una pasada forward con imagen y otra sin imagen para cada par, lo que duplica el coste computacional frente a una inferencia estándar.
- Para el entrenamiento del probe (si se quisiera reproducir), se necesitaría un conjunto de datos grande (202k pares) y una GPU con al menos 24 GB para el modelo base, más el overhead del cálculo de contraste.
- Opciones de despliegue: el código de extracción está disponible en el repositorio de entrenamiento (`general_hallucination/scripts/cocogt/verify_extract.py`). No se menciona soporte para vLLM, Ollama u otros servidores de inferencia; el flujo es offline y por lotes.

## Comparativa con modelos similares

| Modelo | Tipo | AP (CHAIR-80) | Requisitos | Licencia |
|---|---|---|---|---|
| Verify probe 13B (este repo) | Probe sobre LLaVA-1.5-13B | .883 | GPU 26 GB (modelo base) | No disponible |
| Verify probe 7B | Probe sobre LLaVA-1.5-7B | .876 | GPU ~14 GB (modelo base) | No disponible |
| Juez VLM de 122B | Modelo generativo usado como juez | .826 | GPU de gran tamaño (múltiples A100/H100) | No disponible |
| Self logit de LLaVA-1.5-13B | Salida directa del modelo | .740 | GPU 26 GB | No disponible |

La comparativa muestra que el probe de 13B supera tanto al juez de 122B como al probe de 7B, con un coste computacional mucho menor que el juez de 122B. No se dispone de comparaciones con otros detectores de alucinación específicos (por ejemplo, CHAIR, Pope, etc.) en la información proporcionada.

## Limitaciones y advertencias

- El probe está diseñado exclusivamente para el modelo anfitrión LLaVA-1.5-13B (concretamente `llava-hf/llava-1.5-13b-hf`). No es transferible a otros VLM sin reentrenamiento.
- Solo aborda un tipo específico de alucinación: la mención de objetos que no son visibles en la imagen, en el contexto de preguntas de visibilidad binaria. No cubre otras formas de alucinación (relaciones, atributos, eventos).
- La extracción de características requiere dos pasadas forward por par (con y sin imagen), lo que duplica el coste de inferencia y puede ser lento en producción a gran escala.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial y redistribución.
- El probe depende de la calidad de las etiquetas de COCO; puede heredar sesgos del dataset (por ejemplo, distribución de objetos, dominios fotográficos).
- No se proporcionan datos sobre rendimiento en otros idiomas ni en dominios fuera de COCO (imágenes médicas, satelitales, etc.).
- El modelo base LLaVA-1.5-13B tiene sus propias limitaciones (sesgos, alucinaciones, contexto limitado a 4096 tokens) que el probe no corrige, solo detecta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/pbcong/llava-1.5-13b-hal-verify-probe
- Versión 7B del probe verify: https://huggingface.co/pbcong/llava-1.5-7b-hal-verify-probe
- Modelo base LLaVA-1.5-13B: https://huggingface.co/liuhaotian/llava-v1.5-13b
- Página del proyecto LLaVA: https://llava-vl.github.io/
