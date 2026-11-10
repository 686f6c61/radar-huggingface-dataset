# ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-slerpinit

## Resumen

`ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-slerpinit` es un checkpoint de investigación derivado de Wan2.1, el modelo de generación de vídeo texto-a-vídeo de Alibaba (Wan-AI). Concretamente, parte de la variante ligera `Wan2.1-T2V-1.3B-Diffusers` y aplica una modificación arquitectónica de tipo *recurrent transformer*: el bloque original se sustituye por una estructura A5 → B5×4 → C5, con 15 bloques únicos ejecutados 30 veces mediante bucles recurrentes. El resultado se publica en formato diffusers con pesos safetensors y ocupa 23,1 GB.

El modelo está pensado exclusivamente para experimentación en generación de vídeo condicionada por texto, no como producto final. La model card es extremadamente escueta y críptica, con abreviaturas propias del autor (TM, OV, QT, VB, FW-HD, WN) que no se definen en ningún momento, y sin resultados de benchmarks, ejemplos visuales ni instrucciones de uso. No hay información sobre licencia, idiomas soportados ni métricas de calidad.

Su relevancia actual es limitada y acotada al nicho de investigación en transformers recurrentes aplicados a difusión de vídeo. No obstante, para quien explore arquitecturas con bucles de profundidad variable sobre modelos T2V pequeños, este checkpoint constituye un punto de partida reproducible (incluye estados intermedios y una inicialización documentada mediante SLERP por tensor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (recurrent-transformer) sobre base Wan2.1 T2V; estructura A5 → B5×4 → C5 (15 bloques únicos, 30 ejecutados) |
| Parametros totales | no disponible (el modelo base Wan2.1-T2V-1.3B tiene 1.300 millones; la modificación recurrente altera el recuento y no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato diffusers); incluye `step0001000/state.pt` como último estado de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura parte del transformer de difusión de Wan2.1 en su variante de 1.300 millones de parámetros y lo transforma en un transformer recurrente: cinco bloques de entrada (A5), un bloque B repetido cuatro veces (B5×4) y cinco bloques de salida (C5), sumando 15 bloques únicos que se ejecutan 30 veces en total. La inicialización se realizó mediante SLERP (interpolación esférica) por tensor en FP32 sobre los pesos secuenciales del bloque B, con fracciones 1/2, 1/3 y 1/4. El entrenamiento emplea un objetivo de pérdida denominado "TM" aplicado a todas las salidas de bucle, con muestreo de sigma uniforme U(0,1), shift=5 y t=1000σ.

Los datos de entrenamiento se describen con abreviaturas no definidas: "OV", "QT captions 50/50 VB/full", "OV/FW-HD 50/50 per item" y "dropout=WN". No se especifica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO (poco habituales en modelos de difusión). El snapshot contiene seis pesos EMA y no EMA, más el estado del paso 1000. No se documenta ninguna innovación adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), heredada del pipeline de Wan2.1.
- Ejecución recurrente de bloques, lo que permite explorar profundidad efectiva variable sin aumentar el número de parámetros únicos.
- Entrenamiento con mezcla de datasets (OV y FW-HD) y dos tipos de captioning (VB y full), según la model card.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta soporte multilingüe explícito.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.
- No se documentan capacidades de razonamiento, código o matemáticas (no aplica a un modelo T2V).

## Casos de uso

- Investigación en transformers recurrentes para difusión: el checkpoint permite reproducir y analizar el efecto de sustituir bloques secuenciales por bucles A5/B5×4/C5 en un modelo T2V pequeño, comparando con el Wan2.1-T2V-1.3B original.
- Estudio de inicialización por SLERP: las fracciones 1/2, 1/3 y 1/4 documentadas permiten evaluar cómo afecta la interpolación esférica por tensor a la convergencia de un modelo recurrente.
- Experimentos de pérdida en salidas de bucle: el objetivo "TM" aplicado a todas las salidas de bucle puede compararse con variantes que solo supervisan la salida final.
- Generación de clips de vídeo de baja resolución para prototipado: al derivar de un modelo de 1.300 millones de parámetros, es viable en hardware de gama alta consumer, a diferencia de variantes T2V de mayor tamaño.
- Ablación de mezcla de datos: la combinación OV/FW-HD 50/50 por ítem y de captions VB/full 50/50 permite aislar el impacto de cada fuente en la calidad final.
- Base para fine-tuning posterior: al estar en formato diffusers con safetensors, puede cargarse con la librería `diffusers` y adaptarse a dominios concretos con LoRA o ajuste completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 23,1 GB e incluye seis pesos EMA/no EMA más el estado del paso 1000; un único conjunto de pesos en FP16 rondaría los 2,6 GB (1.300 millones de parámetros), pero el tamaño del repo sugiere múltiples checkpoints. Para inferencia con un solo conjunto se estiman entre 6 y 10 GB de VRAM en FP16, dependiendo de la resolución y longitud del vídeo.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del modelo base, cabría esperar viabilidad en RTX 4090, A100 y H100, pero no se confirma.
- Cabe en GPU consumer: probablemente sí en GPUs con 12-24 GB de VRAM, aunque no se documenta.
- Opciones de despliegue: `diffusers` (librería declarada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (estas herramientas no aplican a modelos de difusión de vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-slerpinit | no disponible (base 1.3B) | no disponible | sin benchmarks publicados | no disponible | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 millones | no disponible | benchmarks del modelo original no incluidos en esta ficha | no disponible en esta información | Hugging Face, modelo base público |
| Otros T2V de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no define las abreviaturas empleadas (TM, OV, QT, VB, FW-HD, WN), lo que dificulta la reproducibilidad del entrenamiento.
- Ausencia total de benchmarks, ejemplos visuales y métricas de calidad: no es posible evaluar el rendimiento real frente al modelo base.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no especificados: se desconoce si los captions de entrenamiento cubren varios idiomas o solo inglés.
- Riesgo de alucinación visual y artefactos inherente a los modelos de difusión de vídeo, agravado por la falta de evaluación publicada.
- El estado del entrenamiento es temprano (paso 1000), por lo que la calidad esperada es baja en comparación con modelos convergidos.
- El repositorio incluye seis pesos EMA/no EMA, lo que incrementa el espacio en disco y puede confundir sobre qué checkpoint usar.
- No hay garantía de compatibilidad con versiones recientes de `diffusers` dada la modificación arquitectónica recurrente.
- Fecha de creación futura (2026-11-09) en los metadatos, lo que sugiere posibles inconsistencias en el registro.

## Enlaces

- Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-slerpinit
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
