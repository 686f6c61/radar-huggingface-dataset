# ApolloRaines/Pythia-1.4B-jBlaze-Reasoning

## Resumen

Pythia-1.4B-jBlaze-Reasoning es un checkpoint derivado de EleutherAI/pythia-1.4b al que se le han aplicado ediciones de pesos de comportamiento (behavioral weight editing) mediante la técnica denominada jBlaze en las 24 capas del modelo. Lo publica el usuario ApolloRaines en Hugging Face bajo licencia Apache 2.0. No es un modelo entrenado desde cero ni un fine-tuning convencional: parte de los pesos de Pythia-1.4B y los modifica quirúrgicamente para alterar el comportamiento de salida.

El modelo es relevante ahora, sobre todo, como caso de estudio metodológico. Su model card incluye una corrección explícita: la versión anterior se publicó como "Reasoning Enhanced" afirmando una mejora del 7% al 56% en un benchmark de razonamiento, y esa afirmación se ha retirado. Una auditoría espectral independiente mostró que la mejora medida era un artefacto del scorer: el benchmark presentaba opciones A-D y puntuaba el argmax sobre los logits de las letras, con una clave de respuestas sesgada al 58% hacia "B". El modelo base prefería "A" en el 66% de las preguntas y el editado prefiere "B" en el 95%, de modo que la edición desplazó la preferencia de letra hacia la más frecuente en la clave. Con puntuación cloze (log-probabilidad del texto de cada opción, normalizada por longitud), ambos modelos obtienen 45/100.

La arquitectura subyacente es GPT-NeoX (transformer decoder-only), con 1.414.647.808 parámetros reales según safetensors. El checkpoint es un compuesto: parte de la edición es una construcción de rango 5 sin gradientes en `mlp.dense_4h_to_h` de las capas 0-7 y 16-23, pero las capas 8-15 de esa misma matriz llevan un delta de rango ~1.500 sobre 2.048, lo que indica entrenamiento con gradientes, y `attention.dense` presenta un residuo inexplicado en las 24 capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 1.414.647.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Pythia-1.4b base: 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GPT-NeoX de Pythia-1.4B: transformer decoder-only con 24 capas, atención multi-cabeza estándar y MLP con proyecciones `dense_h_to_4h` y `dense_4h_to_h`. Sobre esa base se aplican ediciones de pesos en las 24 capas. Según la corrección de la model card, la edición no es homogénea: en `mlp.dense_4h_to_h` de las capas 0-7 y 16-23 hay una construcción limpia de rango 5, con un acantilado espectral (spectral cliff) de 2.306x a 4.125x, compatible con una edición sin gradientes. En cambio, en las capas 8-15 esa misma matriz lleva un delta de rango ~1.500 sobre 2.048, con un acantilado de solo 6-11x, lo que corresponde a entrenamiento con gradientes. Además, `attention.dense` presenta un residuo no explicado en las 24 capas, con rango a 0,99 entre 48 y 618 sobre 2.048, por encima del suelo de almacenamiento medido en todas ellas.

No se documenta el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card indica que la búsqueda de configuración que seleccionó las ediciones se puntuó con `eval_reasoning.py`, el scorer defectuoso, y que el objetivo de optimización premiaba la preferencia de letra en lugar del razonamiento. El autor afirma que cualquier afirmación futura de esta familia se reportará bajo puntuación cloze y en un benchmark que la búsqueda de configuración no haya visto.

## Capacidades

- Generación de texto autoregresiva, heredada de Pythia-1.4B.
- Edición de comportamiento de pesos verificada: desplaza la preferencia de letra de salida del 66% "A" al 95% "B" en el benchmark interno del autor, de forma reproducible.
- Conversación: la model card incluye la etiqueta `conversational`, aunque no se documenta ningún ajuste conversacional específico.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas soportados figuran como no disponibles.
- No se documenta modo thinking, visión ni audio.
- No se ha demostrado mejora en razonamiento: la puntuación cloze es idéntica a la del modelo base (45/100 en ambos).

## Casos de uso

- Investigación sobre edición de pesos: el checkpoint sirve como ejemplo reproducible de cómo una edición de pesos puede alterar un comportamiento medible (preferencia de letra) sin cambiar la capacidad subyacente. Los scripts `eval_reasoning.py` y `eval_sound.py` permiten replicar el análisis.
- Auditoría de metodologías de evaluación: útil para estudiar cómo un scorer con argmax sobre logits de letras puede fabricar una mejora aparente cuando la clave de respuestas está desbalanceada. El caso concreto (58% "B", base prefiere "A", editado prefiere "B") es un ejemplo didáctico de sesgo de evaluación.
- Estudio de espectros de matrices de pesos: la diferencia entre la construcción de rango 5 (capas 0-7 y 16-23) y el delta de rango ~1.500 (capas 8-15) en `mlp.dense_4h_to_h` permite analizar la firma espectral de ediciones sin gradientes frente a entrenamiento con gradientes.
- Reproducibilidad de resultados negativos: el modelo y sus scripts permiten verificar que la puntuación cloze no detecta efecto (45/100 en ambos modelos), con un error estándar de ~7 puntos sobre la diferencia a n=100, lo que excluye efectos mayores de ~14 puntos.
- Generación de texto de propósito general: al ser un derivado de Pythia-1.4B con licencia Apache 2.0, puede usarse como modelo base pequeño para tareas de generación, aunque sin ventajas documentadas frente al original.
- Docencia sobre sesgos en benchmarks: el caso ilustra por qué la puntuación por argmax de letras es inadecuada cuando las opciones no están balanceadas y por qué conviene usar puntuación cloze o rotaciones cíclicas.

## Benchmarks y rendimiento

Los únicos datos disponibles son los del benchmark interno del autor, con 100 preguntas y cuatro opciones A-D (clave: A=6, B=58, C=35, D=1). El azar es 25/100.

| Metodo de puntuacion | Pythia-1.4B base | Este modelo |
|---|---|---|
| Original (argmax de letra) | 11 / 100 | 55 / 100 |
| Clave balanceada A-D | 20 / 100 | 23 / 100 |
| Ciclica (misma respuesta bajo 4 rotaciones) | 0 / 100 | 0 / 100 |
| Cloze (log-prob del texto de cada opcion) | 45 / 100 | 45 / 100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB según longitud de contexto y batch.
- En cuantización de 8 bits: alrededor de 1,5-2 GB de pesos. En 4 bits: alrededor de 0,8-1 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090. Para despliegue en servidor, A100 o H100 son sobredimensionadas para este tamaño, pero válidas para servir múltiples réplicas.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en los tags). No se documenta compatibilidad con llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pythia-1.4B-jBlaze-Reasoning | 1.414.647.808 | no disponible | Cloze 45/100 en benchmark interno del autor; sin mejora frente a la base | Apache 2.0 | Hugging Face |
| EleutherAI/pythia-1.4b | 1.414.647.808 | 2.048 tokens | Cloze 45/100 en el mismo benchmark interno | Apache 2.0 | Hugging Face |
| Pythia-1.4B (otros derivados de edición de pesos) | ~1.400 M | variable | no disponible | variable | Hugging Face |

La comparación relevante es con el modelo base: en la única métrica sólida publicada (cloze), ambos empatan a 45/100, con un error estándar de ~7 puntos sobre la diferencia. No se dispone de datos para comparar con alternativas de la misma categoría (edición de pesos sobre modelos pequeños) en la información proporcionada.

## Limitaciones y advertencias

- La afirmación original de mejora en razonamiento (7% a 56%) está retirada y era falsa; el modelo no debe presentarse como "Reasoning Enhanced".
- El checkpoint es un compuesto, no una edición puramente libre de gradientes: las capas 8-15 de `mlp.dense_4h_to_h` llevan un delta de rango ~1.500, indicativo de entrenamiento con gradientes, y `attention.dense` tiene un residuo inexplicado en las 24 capas.
- El resultado negativo tiene potencia limitada: a n=100 y p≈0,45, el error estándar de la diferencia es ~7 puntos, lo que excluye efectos mayores de ~14 puntos pero no descarta mejoras pequeñas.
- La puntuación cíclica da 0/100 en ambos modelos: ninguno selecciona el mismo contenido cuando se rotan las opciones, lo que sugiere selección de posición y no de respuesta.
- Riesgo de sesgo de letra: el modelo prefiere "B" en el 95% de las preguntas del benchmark interno, lo que puede contaminar evaluaciones con opciones etiquetadas.
- No se documentan sesgos conocidos más allá del de letra, ni tasas de alucinación medidas.
- Idiomas soportados no disponibles; no hay evidencia de capacidades multilingües.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado.
- Para producción, no hay datos de latencia, throughput ni estabilidad; el modelo es principalmente una herramienta de investigación sobre edición de pesos.

## Enlaces

- Hugging Face: https://huggingface.co/ApolloRaines/Pythia-1.4B-jBlaze-Reasoning
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Script de evaluación original (incluido en el repo): `eval_reasoning.py`
- Script de evaluación sólida (incluido en el repo): `eval_sound.py`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
