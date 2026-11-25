# Aswath220/rope_gpt2_pfe_allops_seed512_bs1024

## Resumen

`rope_gpt2_pfe_allops_seed512_bs1024` es un modelo de investigación publicado por el usuario Aswath220 en Hugging Face. Se trata de un GPT-2 con embeddings rotatorios (RoPE) entrenado desde cero (6 capas, 6 cabezas, dimensión oculta de 768) con un objetivo muy concreto: el razonamiento aritmético exacto sobre operandos enteros de 0 a 999 en las operaciones de suma, resta, multiplicación y división. No es un modelo conversacional ni de propósito general, sino un experimento controlado sobre cómo representar numéricamente la entrada y la salida en una red neuronal.

La innovación principal es el uso de *Prime Fourier Embeddings* (PFE), una técnica propuesta por Hwang, Bae y Lee en ICML 2026 y reimplementada aquí: cada número se codifica mediante funciones coseno y seno de `2π·a / p^(d+1)` para los 16 primos entre 3 y 59 y exponentes `d = 0-5`, generando un vector de 192 dimensiones que se rellena con ceros y se suma al embedding del token `<|num|>`. Como salida numérica se emplea una cabeza de dígitos en base 10 (`base10_embedding.py`) implementada como una capa lineal de 768 a 21×10 con entropía cruzada por dígito.

El modelo es relevante para investigadores que estudian representaciones numéricas en transformers, extrapolación aritmética y alternativas a la tokenización de dígitos convencional. El repositorio ocupa 18,5 GB e incluye múltiples instantáneas de entrenamiento (por época y por paso), lo que lo convierte en un artefacto útil para análisis de dinámica de entrenamiento más que para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 con RoPE y Prime Fourier Embeddings para entrada numérica |
| Parametros totales | no disponible (6 capas, 6 cabezas, 768 dimensiones; recuento exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | no disponible (entrenado sobre aritmética, no sobre lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` con `transformer.*`, `lm_head.weight`, `num_embedding_module.num_head.*`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un GPT-2 decoder-only con 6 capas, 6 cabezas de atención y 768 dimensiones ocultas, sustituyendo los embeddings posicionales aprendidos por RoPE (Rotary Position Embeddings). La entrada numérica no se tokeniza como texto: cada operando se proyecta mediante Prime Fourier Embeddings, que codifican el valor `a` como `cos(2π·a / p^(d+1))` y `sin(2π·a / p^(d+1))` para los primos 3, 5, 7, …, 59 y los exponentes 0 a 5, produciendo 192 dimensiones que se rellenan con ceros hasta la dimensión del modelo y se suman al embedding del token especial `<|num|>`. La salida numérica se genera con una cabeza de dígitos en base 10: una capa lineal de 768 a 21×10 seguida de entropía cruzada por posición de dígito, lo que permite representar resultados exactos en lugar de aproximaciones en coma flotante.

El entrenamiento se realizó desde cero sobre las cuatro operaciones aritméticas (suma, resta, multiplicación y división) con operandos enteros entre 0 y 999, con un tamaño de lote de 1024, 10 épocas, optimizador Muon con tasa de aprendizaje 0,02 y semilla 512. No se documenta el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO, algo esperable dado que el objetivo es una tarea determinista de cálculo exacto. El repositorio incluye el código de referencia del proyecto BitTokens (`networks/rope_gpt2.py` en el commit `2a84bb1` y `base10_embedding.py`), junto con la configuración de entrenamiento, el registro `log.jsonl` y los resultados de test en `test_results.json`.

## Capacidades

- Aritmética exacta de enteros de 0 a 999 en suma, resta, multiplicación y división, con salida en dígitos base 10.
- Representación numérica continua mediante Prime Fourier Embeddings, diseñada para explorar la extrapolación fuera del rango de entrenamiento.
- Generación de resultados dígito a dígito mediante una cabeza lineal de 21 posiciones por 10 clases.
- No dispone de capacidades de lenguaje natural, diálogo, código, visión ni audio.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No se documentan capacidades multilingües.
- No incluye modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en representaciones numéricas: el modelo sirve como banco de pruebas para comparar Prime Fourier Embeddings frente a tokenización de dígitos o embeddings aprendidos en tareas de aritmética exacta.
- Estudio de extrapolación aritmética: al entrenarse con operandos de 0 a 999, permite analizar si la codificación PFE generaliza a valores fuera de ese rango, un problema clásico en transformers.
- Análisis de dinámica de entrenamiento: las instantáneas por época (`snapshots/epoch_XX/`) y por paso (`snapshots/step_XXXXXXX/`) permiten trazar la evolución de los pesos y de las métricas a lo largo del entrenamiento.
- Reproducción de experimentos: la inclusión de configuración, semilla, registro de entrenamiento y resultados de test facilita replicar el experimento con el código de BitTokens.
- Evaluación de cabezas de salida alternativas: la cabeza de dígitos base 10 puede compararse con cabezas de regresión o de clasificación directa en tareas de cálculo exacto.
- Docencia y divulgación: como ejemplo didáctico de cómo inyectar estructura matemática (primos, exponentes, funciones trigonométricas) en los embeddings de un transformer pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un archivo `run/test_results.json` con resultados de test del propio entrenamiento, pero sus cifras no se detallan en la información proporcionada y no se reproducen aquí para no inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 18,5 GB, pero ese tamaño incluye múltiples instantáneas de entrenamiento, no un único conjunto de pesos. Un modelo de 6 capas y 768 dimensiones en precisión completa ocuparía del orden de cientos de MB por instantánea, aunque el recuento exacto de parámetros no está publicado.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería bastar para cargar una instantánea individual en fp32; no se dispone de mediciones oficiales.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), dado el tamaño reducido de la arquitectura, aunque no hay confirmación del autor.
- Opciones de despliegue: los pesos están en safetensors y el código de referencia es Python con PyTorch (repositorio BitTokens); no se publican versiones GGUF, por lo que llama.cpp u Ollama requerirían conversión manual. vLLM y TGI no están documentados para esta arquitectura personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers pequeños entrenados desde cero para aritmética exacta con codificaciones numéricas especiales) con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El modelo no es de propósito general: solo maneja aritmética de enteros de 0 a 999 en las cuatro operaciones entrenadas; cualquier otra tarea queda fuera de su dominio.
- No hay información sobre sesgos, pero al entrenarse exclusivamente con datos sintéticos de aritmética no se esperan sesgos sociales; sí puede presentar sesgos hacia el rango y formato de entrenamiento.
- Riesgo de alucinación: en tareas fuera de distribución (operandos mayores de 999, decimales, negativos no vistos) el modelo puede producir dígitos plausibles pero incorrectos sin señal de incertidumbre.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- No se documentan la longitud de contexto ni el formato exacto de prompt, lo que dificulta la integración directa en pipelines existentes.
- El repositorio de 18,5 GB contiene múltiples instantáneas; es necesario seleccionar una concreta (`snapshots/epoch_XX/` o `snapshots/step_XXXXXXX/`) para la inferencia.
- Los resultados de test del autor no se han verificado de forma independiente y no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aswath220/rope_gpt2_pfe_allops_seed512_bs1024
- Paper de referencia de Prime Fourier Embeddings: Hwang, Bae & Lee, ICML 2026 (no se dispone de URL directa en la información proporcionada)
- Código de referencia BitTokens (`networks/rope_gpt2.py`, commit `2a84bb1`) y `base10_embedding.py`: referenciados en la model card, sin URL directa disponible en la información proporcionada
