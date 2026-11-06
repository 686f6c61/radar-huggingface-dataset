# ANLP-project/c3-mdlm-110m-v4

## Resumen

c3-mdlm-110m-v4 es un modelo de lenguaje de difusión enmascarada (masked diffusion language model, MDLM) de 110 millones de parámetros desarrollado por el proyecto ANLP-project en el marco del proyecto C3, centrado en la calibración de modelos de lenguaje de difusión. A diferencia de los transformers autorregresivos convencionales, el modelo se entrena con un objetivo de difusión sobre tokens enmascarados y genera texto mediante un proceso iterativo de denoising, lo que lo convierte en una pieza útil para estudiar propiedades de calibración y comportamiento probabilístico en arquitecturas no autorregresivas.

La arquitectura es un transformer bidireccional de 12 capas, con dimensión de modelo 768, 12 cabezas de atención, dimensión feed-forward 3072 y un vocabulario de 50.258 tokens (incluyendo el identificador de máscara 50257), con una longitud máxima de secuencia de 256 tokens. Se entrenó durante 169.055 pasos sobre aproximadamente 9.995 mil millones de tokens del subconjunto 10BT de FineWeb-Edu.

El modelo es relevante ahora porque la familia de modelos de difusión para texto está ganando tracción como alternativa a la generación autorregresiva, y disponer de un checkpoint pequeño, reproducible y con trazas públicas facilita la investigación sobre calibración, incertidumbre y calidad de muestreo sin requerir grandes recursos de cómputo. Su licencia MIT y su tamaño contenido lo hacen adecuado para experimentación académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con objetivo de difusión enmascarada (MDLM); 12 capas, d_model 768, 12 cabezas, d_ff 3072 |
| Parametros totales | 110M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max length de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en `final.pt`; no hay versiones GGUF ni cuantizadas) |
| Idiomas soportados | No disponible (entrenado sobre FineWeb-Edu, mayoritariamente inglés; no se declaran idiomas oficiales) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`final.pt`), cargado por el código del proyecto C3; no convertido a safetensors |

## Arquitectura y entrenamiento

El modelo sigue el objetivo MDLM (masked diffusion language model) sobre un transformer bidireccional: en cada paso de entrenamiento se enmascaran aleatoriamente tokens de la secuencia y el modelo aprende a reconstruirlos condicionado al resto, de modo que la generación se realiza por denoising iterativo en lugar de decodificación token a token de izquierda a derecha. La configuración es de 12 capas, d_model 768, 12 cabezas de atención, d_ff 3072 y vocabulario de 50.258 entradas con id de máscara 50257, con longitud máxima de 256.

El entrenamiento consta de 169.055 pasos, aproximadamente 9.995 mil millones de tokens, con seq_len 256, batch efectivo de 16 x 4 de acumulación de gradiente, learning rate 3e-4 con decaimiento coseno hasta el 10%, warmup de 2.000 pasos, EMA de 0.9999, semilla 20260917 y hash de configuración `0a0a0a4b02d99a8a`. Los datos provienen del subconjunto 10BT de FineWeb-Edu (licencia ODC-By 1.0), citado como Penedo et al., "The FineWeb Datasets", 2024; los datos no se redistribuyen. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto mediante denoising iterativo con objetivo de difusión enmascarada, no mediante decodificación autorregresiva.
- Relleno y reconstrucción de tokens enmascarados en secuencias de hasta 256 tokens, útil para tareas de infilling controlado.
- Modelo base de investigación orientado al estudio de calibración en modelos de difusión de lenguaje (proyecto C3).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no declaradas; el corpus de entrenamiento (FineWeb-Edu) es predominantemente en inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Existe un modelo sonda ajustado asociado (`ANLP-project/c3-ft110m-v4`) y un dataset de trazas (`ANLP-project/c3-traces`) para análisis de calibración.

## Casos de uso

- Investigación sobre calibración de modelos de difusión: el modelo sirve como sujeto de experimentos para medir la fiabilidad de las probabilidades emitidas por un MDLM, comparándolas con las de modelos autorregresivos de tamaño similar; su tamaño de 110M permite ejecutar barridos completos en una sola GPU.
- Estudio de dinámicas de denoising: al ser un modelo entrenado con objetivo MDLM y con curvas de pérdida publicadas (`history.jsonl`), permite analizar cómo evoluciona la calidad del muestreo según el número de pasos de difusión y el calendario de enmascaramiento.
- Reproducción de experimentos académicos: la configuración completa (`train_summary.json`), la semilla y el hash permiten reproducir el entrenamiento o auditarlo, algo poco habitual en checkpoints pequeños.
- Relleno de texto controlado (infilling): el objetivo de reconstrucción de tokens enmascarados lo hace adecuado para tareas de completar fragmentos con restricciones posicionales en secuencias cortas de hasta 256 tokens.
- Análisis de trazas y comportamiento probabilístico: combinado con el dataset `ANLP-project/c3-traces`, permite estudiar correlaciones entre confianza del modelo y corrección de la predicción en cada paso de denoising.
- Base para ajuste fino supervisado: el modelo sonda `c3-ft110m-v4` demuestra que el checkpoint admite fine-tuning para tareas posteriores; puede usarse como inicialización para experimentos de clasificación o generación corta.
- Docencia y divulgación: su huella de memoria reducida y su código de carga sencillo lo convierten en un ejemplo práctico para explicar modelos de difusión de lenguaje en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,1 GB en el repositorio; en FP32 los 110M parámetros requieren aproximadamente 0,44 GB de pesos, más activaciones y estados del proceso de denoising. En la práctica cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; para entrenamiento o barridos de experimentos se recomiendan A100 o H100 por throughput, aunque no son necesarias para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM, e incluso en CPU para pruebas puntuales.
- Opciones de despliegue: no hay integración documentada con vLLM, llama.cpp, Ollama o TGI; el modelo se carga mediante el código del proyecto C3 a partir de `final.pt` (PyTorch pickle). No se publican pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de difusión, la latencia depende del número de pasos de denoising configurados, que no se especifica en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| c3-mdlm-110m-v4 | 110M | 256 | Difusión enmascarada (MDLM) | MIT | Pesos en `final.pt` en Hugging Face |
| Modelos autorregresivos de ~110M (p. ej. GPT-2 small, 124M) | ~124M | 1.024 | Autorregresivo causal | MIT (GPT-2) | Pesos en safetensors, amplia integración en ecosistema |
| Modelos MDLM pequeños publicados | No disponible | No disponible | Difusión enmascarada | No disponible | No disponible |

No se dispone de datos de benchmarks ni de comparaciones directas publicadas para este checkpoint frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base de investigación: no ha pasado por fases de alineación (RLHF/DPO) documentadas, por lo que puede generar contenido incoherente, ofensivo o factualmente incorrecto.
- Riesgo de alucinación elevado: con 110M parámetros y solo ~10B tokens de entrenamiento, la cobertura factual es limitada y las afirmaciones pueden ser inventadas.
- Ventana de contexto muy corta (256 tokens), lo que restringe su uso a secuencias breves y descarta tareas de contexto largo.
- Idiomas no declarados; el corpus FineWeb-Edu es mayoritariamente inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Formato de pesos en PyTorch pickle (`final.pt`), sin safetensors ni GGUF: requiere `torch.load` y el código del proyecto C3, y no es directamente compatible con runtimes de inferencia estándar.
- No hay pipeline declarado en Hugging Face ni integraciones de despliegue documentadas, lo que complica el uso en producción.
- La licencia MIT permite uso comercial, pero el modelo no está validado para producción y carece de garantías de calidad.
- El dataset de entrenamiento (FineWeb-Edu) puede arrastrar sesgos presentes en la web filtrada por criterios educativos.
- El checkpoint completo con estado del optimizador no se ha publicado, lo que limita la reproducción exacta del entrenamiento a partir del estado final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ANLP-project/c3-mdlm-110m-v4
- Modelo sonda ajustado: https://huggingface.co/ANLP-project/c3-ft110m-v4
- Dataset de trazas: https://huggingface.co/datasets/ANLP-project/c3-traces
- Dataset de entrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Referencia del dataset: Penedo et al., "The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale", 2024 (no se proporciona URL directa en la información disponible)
