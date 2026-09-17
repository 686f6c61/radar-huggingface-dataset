# Ahsanz/e2-virl39k-3b-a4

## Resumen

A4 (`Ahsanz/e2-virl39k-3b-a4`) es un ajuste mediante aprendizaje por refuerzo del modelo multimodal Qwen2.5-VL-3B-Instruct, publicado por el usuario Ahsanz. No es un modelo de propósito general, sino un artefacto de investigación: una de las ramas de un estudio controlado sobre cómo el RL modifica el uso que un modelo visión-lenguaje hace de la evidencia visual. Todas las ramas parten del mismo modelo base, ven los mismos datos durante el mismo número de pasos y solo difieren en el objetivo de RL y en si la torre de visión se entrena o se congela.

El entrenamiento aplica el objetivo PRPO con RVD (relative value decomposition) sobre el conjunto ViRL39K, con 31.629 prompts de entrenamiento tras deduplicación y 1.000 reservados para evaluación. Se ejecutaron 162 pasos con AdamW, learning rate constante de 1e-6, sin warmup, batch global de 128, batch de rollout de 384, 8 rollouts por prompt y una longitud máxima de respuesta de 2048 tokens, en precisión bf16. En esta rama concreta la torre de visión sí se entrena.

Su relevancia es metodológica más que de rendimiento: el propio autor indica que la exactitud en benchmarks generales no fue un objetivo de entrenamiento y no se reporta. El hallazgo del estudio es que el RL altera la forma en que el modelo emplea la imagen de maneras que la exactitud agregada no revela, incluida una caída en el vínculo entre un numeral y el elemento que etiqueta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de visión ViT + decoder LLM de la familia Qwen2.5), heredada del modelo base |
| Parámetros totales | 4.065.787.904 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base declara 32.768 tokens nativos, ampliables) |
| Tipos de cuantización | No disponible: solo se publican pesos en bf16; no hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles (no se declaran en la model card) |
| Licencia | Qwen Research License (`other` / `qwen-research`), solo investigación y no comercial |
| Formato de pesos | safetensors (bf16) |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 8,1 GB |
| Librería | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-VL-3B-Instruct: un transformer multimodal formado por un encoder de visión de tipo ViT y un decoder de lenguaje de la familia Qwen2.5, con el mecanismo de posición M-RoPE para integrar información espacial y temporal. El ajuste no modifica la topología de la red; únicamente actualiza los pesos mediante RL, incluida la torre de visión, que en esta rama permanece entrenable.

El procedimiento de entrenamiento es una implementación de PRPO (un objetivo de RL tipo policy-gradient con recorte asimétrico estilo DAPO, con límites `clip` de 0,2 y 0,28), complementado con RVD (relative value decomposition). No se aplica penalización KL en la pérdida; la divergencia KL respecto al modelo base se registra únicamente como lectura. Se usaron 8 rollouts por prompt con top-p de 0,99 y una longitud máxima de respuesta de 2048 tokens. El entrenamiento se llevó a cabo con un fork de EasyR1 (framework veRL) durante 162 pasos sobre ViRL39K, con semilla 1.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, con soporte de conversación multimodal multi-turno vía `transformers`.
- Visual grounding: es el eje del estudio; el modelo está entrenado para vincular descripciones y numerales con elementos concretos de la imagen, aunque el propio autor reporta un deterioro en el vínculo numeral-elemento tras el RL.
- Lectura de figuras, gráficos y diagramas: capacidad central del conjunto ViRL39K y de la evaluación del estudio.
- Razonamiento multimodal de un solo paso con respuestas de hasta 2048 tokens.
- Tool calling / function calling: no documentado en la model card.
- Comportamiento agéntico o razonamiento multi-paso: no documentado en la model card.
- Capacidades multilingües: no documentadas; no se declaran idiomas.
- Modo de razonamiento explícito («thinking»), audio o vídeo: no documentados.
- Decodificación: las evaluaciones del estudio se realizaron siempre con decodificación greedy.

## Casos de uso

- Estudio de ablación de objetivos de RL: comparar esta rama (PRPO+RVD con torre de visión entrenada) con las demás ramas del mismo estudio para aislar el efecto del objetivo y del entrenamiento del encoder visual, manteniendo constantes base, datos, pasos y semilla.
- Investigación sobre grounding visual: analizar cómo el RL redistribuye la atención entre regiones de la imagen, aprovechando que el estudio mide el uso de evidencia visual más allá de la exactitud final.
- Análisis del fallo de binding numeral-elemento: usar el checkpoint para reproducir y caracterizar la caída documentada al asociar un número con el objeto que etiqueta en gráficos y figuras.
- Reproducibilidad de experimentos de RL multimodal: el detalle de hiperparámetros publicado (162 pasos, lr 1e-6 constante, batch 128/384, clip 0,2/0,28, sin warmup, bf16) permite replicar el entrenamiento con EasyR1/veRL.
- Docencia e investigación académica: material de partida para cursos o trabajos sobre ajuste por refuerzo en modelos visión-lenguaje, siempre en el marco de la licencia de investigación.
- Evaluación de robustez y calibración: medir la divergencia KL respecto al modelo base y correlacionarla con cambios en el comportamiento sobre tareas de lectura de figuras.
- Generación de hipótesis sobre sesgos de atención: inspeccionar qué regiones reciben peso tras el RL para formular hipótesis que se contrasten en otras ramas del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la exactitud en benchmarks generales no fue un objetivo de entrenamiento y que no se reporta en ella.

## Requisitos de hardware

- Peso de los pesos en bf16: aproximadamente 8,1 GB (4,07 mil millones de parámetros a 2 bytes).
- VRAM estimada para inferencia en bf16: del orden de 12 a 16 GB considerando activaciones, caché KV y los tokens adicionales que introduce el encoder de visión. Es una estimación, no un dato publicado.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S y A6000 sobran para bf16. Una RTX 4090 o RTX 3090 de 24 GB debería ser suficiente en bf16; una RTX 4070 Ti Super de 16 GB queda en el límite.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 16 GB o más en bf16, y en 8 GB o menos si se convierte a cuantizaciones de 8 o 4 bits, conversión que no está publicada.
- Opciones de despliegue: `transformers` de forma nativa (es la librería declarada), Text Generation Inference (el modelo lleva las etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM y SGLang, que soportan la familia Qwen2.5-VL. Ollama y llama.cpp requerirían convertir los pesos a GGUF, formato que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A4 (este modelo) | 4,07B | No disponible (base: 32.768 tokens) | Imagen-texto | Qwen Research (solo investigación) | HuggingFace, 0 descargas |
| Qwen2.5-VL-3B-Instruct (base) | 4,07B (misma arquitectura) | No disponible en esta información | Imagen-texto | Qwen Research (solo investigación) | HuggingFace, ampliamente distribuido |
| Qwen2.5-VL-7B-Instruct | No disponible en esta información | No disponible | Imagen-texto | No disponible en esta información | HuggingFace |
| Alternativas abiertas de tamaño similar (InternVL, SmolVLM, etc.) | No disponible | No disponible | Imagen-texto | No disponible | No disponible |

La comparación cuantitativa de rendimiento no es posible porque el autor no publica métricas de benchmarks para este checkpoint. La diferencia funcional frente al modelo base no es de exactitud, sino de comportamiento: el ajuste modifica el uso de la evidencia visual y no persigue mejorar métricas agregadas.

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente de investigación y no comercial. El texto completo acompaña a los pesos como `LICENSE` y se hereda del modelo base.
- Artefacto experimental: 3B de parámetros, 162 pasos de RL, un único conjunto de datos y una sola semilla. No está pensado para despliegue en producción.
- Degradación documentada: el estudio observa una caída en la capacidad de vincular un numeral con el elemento que etiqueta, por lo que las salidas en tareas de lectura de figuras deben tratarse con cautela.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad o de tasas de alucinación; al ser un modelo ajustado con RL sobre un dominio estrecho, el riesgo de respuestas plausibles pero incorrectas fuera de ese dominio es relevante.
- Sin datos de benchmarks generales: el autor declara explícitamente que la precisión general no se midió ni se reporta.
- Idiomas no declarados: se desconoce el soporte multilingüe efectivo tras el ajuste.
- Un checkpoint aislado no constituye el resultado del estudio: las conclusiones viven en la comparación entre ramas, no en este modelo por separado.
- Adopción nula: 0 descargas y 0 likes, sin validación externa ni informes de terceros.
- Metadatos cuando menos inusuales: las fechas de creación y actualización registradas (septiembre de 2026) son posteriores a la fecha habitual de publicación de la familia base, lo que conviene verificar antes de citar el modelo.
- Contexto y cuantizaciones no documentados: no hay versiones GGUF, AWQ o GPTQ publicadas, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ahsanz/e2-virl39k-3b-a4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Framework de entrenamiento (fork de EasyR1 / veRL): https://github.com/hiyouga/EasyR1
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relación con la ficha.
