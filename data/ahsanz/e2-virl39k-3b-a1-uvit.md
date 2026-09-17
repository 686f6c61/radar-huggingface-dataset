# Ahsanz/e2-virl39k-3b-a1-uvit

## Resumen

Ahsanz/e2-virl39k-3b-a1-uvit es un modelo multimodal de tipo image-text-to-text derivado de Qwen/Qwen2.5-VL-3B-Instruct mediante aprendizaje por refuerzo con GRPO. No es un modelo de propósito general, sino un artefacto experimental: uno de los brazos de un estudio controlado sobre cómo el RL altera el uso de la evidencia visual en un modelo de visión-lenguaje (VLM). El modelo parte del mismo base, ve los mismos datos y el mismo número de pasos que el resto de brazos, y solo se diferencia en el objetivo de RL y en si la torre de visión se entrena (en este brazo sí se entrena).

La arquitectura es la heredada del base: un transformer multimodal con torre de visión y decodificador de lenguaje, con 4.065.787.904 parámetros totales según los pesos safetensors (unos 4,07 B, por encima de los 3 B nominales del base al incluir componentes de visión). El entrenamiento empleó ViRL39K (31.629 prompts de entrenamiento tras deduplicación, 1.000 reservados) durante 162 pasos, con bf16, AdamW, lr constante de 1e-6 y un objetivo GRPO de precisión binaria (recompensa 1 si la respuesta extraída coincide con la verdad de referencia).

Su relevancia es metodológica, no de producto: permite estudiar cómo el RL modifica el grounding visual más allá de la exactitud agregada. El propio autor advierte que un checkpoint aislado no constituye el resultado del estudio, que la exactitud en benchmarks generales no era objetivo de entrenamiento y que no está pensado para despliegue. La licencia es la Qwen Research License, de solo investigación y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje); hereda la de Qwen2.5-VL-3B-Instruct: torre de visión más decodificador de lenguaje |
| Parametros totales | 4.065.787.904 (~4,07 B), según safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License (research-only, no comercial) |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen2.5-VL-3B-Instruct, un transformer multimodal con una torre de visión y un decodificador de lenguaje que procesa entradas de imagen y texto (pipeline image-text-to-text). Este checkpoint no introduce cambios estructurales respecto al base; la diferencia es el post-entrenamiento. El ajuste se realizó con GRPO (Group Relative Policy Optimization) con recompensa de precisión binaria: se otorga recompensa 1 si la respuesta extraída coincide con la verdad de referencia. La torre de visión se entrenó, a diferencia de otros brazos del estudio.

Los detalles de entrenamiento documentados son: ViRL39K con 31.629 prompts tras deduplicación y 1.000 reservados; 162 pasos; semilla 1; AdamW con lr 1e-6 constante y sin warmup; batch global de 128 y batch de rollout de 384; 8 rollouts por prompt; top-p de rollout 0,99; clipping asimétrico estilo DAPO de 0,2 / 0,28; sin penalización KL en la pérdida (la KL respecto al base se registra solo como lectura); longitud máxima de respuesta 2048; precisión bf16. El entrenamiento se hizo con un fork de EasyR1 (veRL). El autor señala que la evaluación de estos brazos encontró que el RL cambia cómo el modelo usa la imagen de formas que la exactitud por sí sola no revela, incluida una caída en el anclaje de un numeral al elemento que etiqueta.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): respuestas conversacionales a partir de una o varias imágenes junto con texto.
- Grounding visual: entrenado con RL específicamente sobre ViRL39K, un conjunto orientado a tareas de localización y referencia visual.
- Comportamiento conversacional, según el tag conversational del repositorio.
- Razonamiento sobre evidencia visual: es el objeto de estudio del checkpoint, aunque no se documentan métricas concretas de esta capacidad en la información disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no documentado.
- Otras modalidades (audio, vídeo): no disponible; el pipeline declarado es únicamente image-text-to-text.

## Casos de uso

- Estudio del efecto del RL sobre el grounding: el checkpoint se usa como uno de los brazos de un estudio controlado para comparar cómo cambia el uso de la evidencia visual frente a otros objetivos de RL y frente a variantes con torre de visión congelada.
- Comparación entre brazos experimentales: al compartir base, datos, pasos y semilla, sirve para aislar la contribución del objetivo de RL y del entrenamiento de la torre de visión.
- Análisis de atribución de evidencia visual: permite examinar si el modelo atiende a la región correcta de la imagen, no solo si acierta la respuesta final.
- Prototipado académico de asistentes multimodales: investigación sobre diálogo imagen-texto con un modelo de ~4 B desplegable en una sola GPU.
- Reproducibilidad de experimentos de RL: la semilla, el dataset y los hiperparámetros documentados permiten replicar el entrenamiento y las comparaciones.
- Estudio de fallos de lectura de figuras: el autor advierte de una caída en el anclaje de numerales a elementos etiquetados, lo que lo hace útil para analizar ese tipo de error en diagramas y gráficos.
- Punto de partida para fine-tuning de investigación: al ser un derivado de Qwen2.5-VL-3B-Instruct, puede servir como inicialización en estudios posteriores, siempre bajo los términos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la exactitud en benchmarks generales no era un objetivo de entrenamiento y no se reporta. Tampoco se incluyen métricas de ViRL39K ni resultados comparativos entre brazos.

## Requisitos de hardware

- Pesos en bf16: el repositorio ocupa 8,1 GB, por lo que la carga en bf16 requiere del orden de 8-9 GB de VRAM solo para los pesos.
- Inferencia en bf16: estimación de 10-12 GB de VRAM contando activaciones y el procesamiento de visión (estimación propia, no confirmada en la ficha).
- Cuantización: no se documentan cuantizaciones oficiales; opciones como 8-bit (aprox. 5-6 GB) o 4-bit (aprox. 3 GB) mediante bitsandbytes serían estimaciones, no datos publicados.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) y probablemente en 16 GB (RTX 4060 Ti, RTX 4070 Ti) en bf16; en 4-bit podría situarse en el rango de 8 GB, sin confirmación.
- GPU de centro de datos: A100, H100 o L40S son suficientes de sobra para un modelo de ~4 B, aunque resultan sobredimensionadas para inferencia de una sola instancia.
- Despliegue: transformers (el autor incluye un ejemplo con AutoProcessor y Qwen2_5_VLForConditionalGeneration), y TGI, dado que el repositorio incluye los tags text-generation-inference y endpoints_compatible. Soporte en vLLM, llama.cpp, Ollama u otros no está confirmado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación más directa disponible en la información proporcionada es con el modelo base del que deriva.

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ahsanz/e2-virl39k-3b-a1-uvit | 4,07 B | No disponible | GRPO sobre ViRL39K, 162 pasos, torre de visión entrenada | Qwen Research License (research-only) | HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3 B (nominal; el derivado reporta 4,07 B totales) | No disponible en esta ficha | Instruct base de Qwen | Qwen Research License | HuggingFace |

No se dispone de datos comparativos de rendimiento frente a otros VLM de tamaño similar en la información proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Licencia Qwen Research License: uso exclusivamente de investigación y no comercial. El texto completo acompaña a los pesos como archivo LICENSE.
- Modelo no destinado a despliegue: el autor lo describe explícitamente como un artefacto experimental.
- Entrenamiento limitado: 3 B nominales, 162 pasos de RL, un único dataset (ViRL39K) y una única semilla (1), lo que restringe la generalización de cualquier conclusión.
- No hay resultados de benchmarks generales; la exactitud global no era objetivo y no se reporta.
- Degradación documentada en el anclaje de numerales a los elementos que etiquetan, lo que afecta a tareas de lectura de figuras y diagramas.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos: no evaluados; se heredan del modelo base y del dataset de RL.
- Idiomas soportados: no documentados.
- Longitud de contexto: no documentada.
- Advertencia metodológica: según el autor, un checkpoint aislado no constituye el resultado del estudio; la conclusión reside en las diferencias entre brazos.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de los datos proporcionados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ahsanz/e2-virl39k-3b-a1-uvit
- Modelo base Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia Qwen Research License: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- EasyR1 (framework de entrenamiento, fork utilizado): https://github.com/hiyouga/EasyR1
