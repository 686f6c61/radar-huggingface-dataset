# AIgenius1/persian-mini-lm

## Resumen

Persian Mini LM es un ajuste fino del modelo SmolLM2-135M-Instruct de HuggingFaceTB, especializado en lengua persa (farsi) y publicado por el usuario AIgenius1 bajo licencia Apache 2.0. El modelo parte de una arquitectura transformer decoder-only de 134.515.008 parámetros (135M) y se ha adaptado mediante fine-tuning supervisado sobre dos corpus persas del propio autor: artículos periodísticos de Zoomit y textos de la Wikipedia en persa.

El interés del modelo no reside en su capacidad bruta, sino en su enfoque de optimización para entornos con recursos muy limitados. El repositorio incluye, además de los pesos completos en fp32, una versión podada estructuralmente al 20 % de las neuronas intermedias de las capas MLP y una versión cuantizada a INT8 dinámico, con un informe de benchmarks medido en CPU de dos núcleos. El autor reporta una mejora de velocidad de aproximadamente 1,75x en la variante podada y cuantizada frente al modelo base en fp32.

Se trata de un modelo experimental, con solo 250 pasos de entrenamiento y unos 2,3 millones de tokens de entrenamiento, pensado como demostración de técnicas de compresión y adaptación lingüística más que como modelo de producción. Su relevancia actual es la de un caso práctico de cómo llevar un modelo de 135M a CPU con pérdidas controladas de perplejidad en persa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 256 tokens) |
| Tipos de cuantizacion | fp32 (original), INT8 dinámico (Linear), poda estructural del 20 % de neuronas MLP |
| Idiomas soportados | fa (persa), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (raíz), pruned_fp32/ (safetensors), model_int8_dynamic.pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-135M-Instruct, un transformer decoder-only con atención causal estándar. No se documentan innovaciones arquitectónicas propias: el trabajo del autor se centra en la adaptación lingüística y la compresión. El fine-tuning se realizó durante 250 pasos con batch de 4, longitud de secuencia de 256, optimizador AdamW con lr=2e-4, scheduler cosine y 15 pasos de warmup. El corpus de entrenamiento son aproximadamente 9 MB de texto persa limpio extraído de los datasets `AIgenius1/zoomit-persian-pretraining-dataset` y `AIgenius1/persian-pretraining-dataset`, lo que equivale a unos 2,3 millones de tokens (muestreo reducido por limitaciones de CPU).

La compresión se aplica en dos ejes. Primero, una poda estructural del 20 % de las neuronas intermedias de las capas MLP, seleccionadas por importancia L1, que reduce los parámetros a 118,5M. Segundo, una cuantización dinámica INT8 sobre las capas `torch.nn.Linear`, que reduce el peso en RAM de 538,1 MB a 113,4 MB. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional en persa e inglés mediante plantilla de chat (`apply_chat_template`).
- Respuesta a instrucciones breves y preguntas de conocimiento general, con calidad limitada por el tamaño.
- Comprensión y generación de texto persa periodístico y enciclopédico, dominios presentes en el corpus de ajuste.
- Inferencia en CPU sin GPU, incluyendo despliegue en entornos de dos núcleos.
- Variantes optimizadas para latencia y huella de memoria (poda + INT8).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado de asistentes conversacionales en persa sobre hardware sin GPU: el modelo corre en CPU de dos núcleos a 21,7 tok/s en fp32 y 37,5 tok/s en INT8, suficiente para demos interactivas y pruebas de concepto.
- Clasificación y etiquetado ligero de texto persa: con 135M parámetros puede ajustarse de nuevo para tareas de clasificación de noticias o entradas de Wikipedia, dominios ya cubiertos por su corpus.
- Filtrado y generación de borradores en CMS persas: útil para resúmenes o titulares preliminares que un humano revisa después, dado el bajo coste de inferencia.
- Evaluación comparativa de técnicas de compresión: el repositorio incluye pesos fp32, podados e INT8 con métricas de perplejidad, lo que permite reproducir experimentos de poda y cuantización en modelos pequeños.
- Enseñanza y experimentación académica: modelo de referencia para estudiar el efecto de la cuantización INT8 en modelos por debajo de 1B, con datos de perplejidad y QA antes y después.
- Despliegue en dispositivos de borde o entornos embebidos con memoria limitada: la variante INT8 ocupa 113,4 MB en RAM, viable en sistemas con pocos cientos de MB disponibles.
- Base para fine-tuning posterior en dominios persas específicos: al ser Apache 2.0 y de tamaño reducido, sirve como punto de partida económico para adaptaciones verticales.

## Benchmarks y rendimiento

Datos reportados por el autor, medidos en CPU de dos núcleos con 2 hilos:

| Modelo | Params (M) | RAM (MB) | Decode (tok/s) | Prefill (tok/s) | PPL Zoomit | PPL Wiki | QA fa (%) | QA en (%) |
|---|---|---|---|---|---|---|---|---|
| Base SmolLM2-135M-Instruct fp32 | 134,5 | 538,1 | 21,34 | 503,39 | 7,64 | 8,02 | 12,5 | 75,0 |
| Base INT8 | 28,3 | 113,4 | 36,40 | 867,67 | 17,30 | 16,79 | 6,2 | 50,0 |
| Base podado 20 % fp32 | 118,5 | 474,2 | 23,02 | 559,15 | 9,67 | 9,78 | 12,5 | 25,0 |
| Persian Mini LM fp32 | 134,5 | 538,1 | 21,70 | 531,25 | 4,79 | 5,56 | 18,8 | 100,0 |
| Persian Mini LM INT8 | 28,3 | 113,4 | 37,49 | 940,74 | 9,19 | 9,98 | 6,2 | 50,0 |
| Persian Mini LM podado 20 % fp32 | 118,5 | 474,2 | 22,24 | 554,55 | 5,73 | 6,29 | 6,2 | 25,0 |
| Persian Mini LM podado + INT8 | 28,3 | 113,4 | 37,98 | 941,74 | 10,75 | 11,35 | 6,2 | 0,0 |

El fine-tuning reduce la perplejidad en persa de 7,64 a 4,79 (Zoomit) y de 8,02 a 5,56 (Wikipedia) en fp32. La poda y la cuantización degradan la perplejidad de forma notable en un modelo de este tamaño. La aceleración final reportada (podado + INT8 frente a base fp32) es de aproximadamente 1,75x.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en fp32 ocupa 538,1 MB de RAM, en INT8 113,4 MB, y la variante podada 474,2 MB.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. Puede ejecutarse en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) sin problemas de memoria, pero no se han publicado métricas de GPU.
- Cabe en cualquier GPU consumer y en CPU de dos núcleos; también en dispositivos con al menos ~150 MB de RAM libre para la variante INT8.
- Opciones de despliegue: `transformers` con PyTorch (fp32 o cuantización dinámica INT8 vía `torch.ao.quantization`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos GGUF.
- Latencia y throughput: 21,7 tok/s de decode y 531,25 tok/s de prefill en fp32 sobre CPU de dos núcleos; 37,98 tok/s de decode y 941,74 tok/s de prefill en la variante podada + INT8.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Persian Mini LM | 134,5M | no disponible | fa, en | Apache 2.0 | safetensors, .pt |
| SmolLM2-135M-Instruct (base) | 135M | no disponible | en (principalmente) | Apache 2.0 | safetensors |
| SmolLM2-360M-Instruct | 360M | no disponible | en | Apache 2.0 | safetensors |
| Qwen2.5-0.5B-Instruct | 500M | no disponible | multilingüe | Apache 2.0 | safetensors, GGUF |

La comparación cuantitativa de rendimiento frente a SmolLM2-360M o Qwen2.5-0.5B no está disponible en la información proporcionada. Frente a su modelo base, la ventaja documentada es la reducción de perplejidad en persa y la disponibilidad de variantes comprimidas.

## Limitaciones y advertencias

- Modelo muy pequeño (135M) con capacidad de razonamiento limitada; el propio autor desaconseja su uso para aplicaciones serias.
- Entrenamiento corto (250 pasos, ~2,3M tokens) y secuencias de 256 tokens; el modelo puede no generalizar bien fuera de los dominios de noticias y Wikipedia.
- La cuantización INT8 degrada significativamente la calidad en modelos de este tamaño: la perplejidad en persa sube de 4,79 a 9,19 y el QA en inglés cae del 100 % al 50 %.
- La variante podada + INT8 pierde por completo el QA en inglés (0 %) y eleva la perplejidad a 10,75–11,35.
- Riesgo elevado de alucinación y de respuestas incoherentes en temas fuera del corpus.
- Sesgos no evaluados: no se documenta análisis de sesgos de género, políticos o culturales en los corpus de Zoomit o Wikipedia.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en producción sin validación humana.
- No se publican pesos GGUF ni integración con runtimes de inferencia optimizados, lo que limita el despliegue fuera de PyTorch.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIgenius1/persian-mini-lm
- Perfil del autor en Hugging Face: https://huggingface.co/AIgenius1/models
- Dataset sintético de persa del autor: https://huggingface.co/datasets/AIgenius1/persian_language_synthetic_dataset
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
