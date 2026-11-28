# ahmedselhady/XSDPO-Qwen3.5-4B-500x6-8gpu-groups2-n8-resp4096-lr3e-6-kl0.001-frozen-en_only-alpha1.0

## Resumen

XSDPO-Qwen3.5-4B es un ajuste fino del modelo multimodal Qwen/Qwen3.5-4B, publicado por el usuario ahmedselhady en Hugging Face. Se trata de un experimento de entrenamiento con SDPO (una variante de optimización de preferencias, presumiblemente una evolución de DPO) sobre un conjunto de datos de razonamiento matemático identificado en el nombre del repositorio como `macereason-math-500x6`. El resultado es un checkpoint del paso 250 de una tirada de entrenamiento distribuida en 8 GPU.

El modelo conserva la naturaleza multimodal del base: la pipeline declarada es `image-text-to-text`, por lo que acepta entradas conjuntas de imagen y texto. Los pesos suman 5.174.964.736 parámetros según los safetensors publicados, lo que sugiere que el "4B" del nombre corresponde a los parámetros activos o al tamaño nominal del base, mientras que el total real del checkpoint es algo superior a 5.100 millones.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de su publicación, sin model card sustantiva, sin licencia declarada y sin resultados de evaluación. Resulta útil como referencia para quienes sigan las técnicas de alineamiento por preferencias sobre modelos multimodales pequeños, pero no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5; detalles internos no disponibles |
| Parametros totales | 5.174.964.736 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponibles; el sufijo `en_only` del nombre sugiere entrenamiento solo en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer multimodal de la familia Qwen 3.5 que procesa entradas de imagen y texto. No se dispone de detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni codificador visual en la información proporcionada.

El entrenamiento consiste en una tirada de SDPO sobre el dataset `macereason-math`, con los hiperparámetros codificados en el nombre del repositorio: 500 ejemplos por 6 épocas, 8 GPU, `groups2`, 8 muestras por prompt (`n8`), longitud de respuesta máxima de 4096 tokens, tasa de aprendizaje 3e-6, coeficiente KL de 0.001, referencia congelada (`frozen`), solo inglés (`en_only`) y alpha 1.0. El checkpoint publicado corresponde al paso 250. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO más allá del propio SDPO.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`).
- Razonamiento matemático, presumiblemente reforzado por el entrenamiento sobre `macereason-math`, aunque no hay evaluación publicada que lo confirme.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: el sufijo `en_only` indica que el ajuste se realizó únicamente en inglés; el comportamiento en otros idiomas no está documentado.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en alineamiento por preferencias: el checkpoint permite reproducir y comparar la receta SDPO con los hiperparámetros documentados en el nombre del repositorio, útil para estudiar la estabilidad del entrenamiento con referencia congelada y KL bajo.
- Experimentos de razonamiento matemático multimodal: se puede evaluar si el ajuste sobre `macereason-math` mejora la resolución de problemas aritméticos y algebraicos a partir de enunciados en imagen.
- Análisis de checkpoints intermedios: al publicarse el paso 250, sirve para estudiar la evolución de las capacidades durante el entrenamiento frente a checkpoints posteriores del mismo run.
- Docencia y reproducción de pipelines DPO/SDPO: útil en cursos o talleres donde se analice cómo los hiperparámetros (n8, grupos, alpha) afectan al comportamiento del modelo.
- Evaluación de olvido catastrófico: comparar este ajuste en inglés con el base Qwen3.5-4B permite medir la degradación en tareas generales y en idiomas distintos del inglés.
- Base para futuros ajustes: al conservar el formato safetensors y la librería transformers, puede servir como punto de partida para ajustes posteriores con LoRA o fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 10-11 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo puede superar los 16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3 GB de pesos, aunque no se publican pesos GGUF oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento e inferencia a contexto completo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB en BF16, y en 8-12 GB con cuantización, siempre que se generen los pesos cuantizados a partir de los safetensors.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI si la arquitectura Qwen3.5 está soportada por esas herramientas; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XSDPO-Qwen3.5-4B (este) | 5.174.964.736 | no disponible | imagen-texto | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | no disponible en la información | no disponible | imagen-texto | no disponible en la información | Hugging Face (modelo base) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, ni métricas de pérdida, ni comparaciones con el base, lo que impide verificar que el ajuste mejore algo.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base Qwen3.5-4B.
- Entrenamiento solo en inglés (`en_only`): el rendimiento en castellano u otros idiomas puede degradarse respecto al base.
- Riesgo de alucinación y de sobreajuste al dataset de matemáticas: al entrenar sobre `macereason-math` durante 6 épocas con 500 ejemplos, es plausible el olvido catastrófico en tareas generales, aunque no está medido.
- Es un checkpoint intermedio (paso 250): no representa necesariamente el estado final del entrenamiento.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- El tamaño del repo (51.8 GB) incluye presumiblemente múltiples checkpoints u optimizador, lo que complica su descarga y despliegue.
- No se publican pesos cuantizados ni scripts de conversión, lo que limita el despliegue en entornos con poca VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Qwen3.5-4B-500x6-8gpu-groups2-n8-resp4096-lr3e-6-kl0.001-frozen-en_only-alpha1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
