# chellen021/SmolLM2-135M-PHP

## Resumen

SmolLM2-135M-PHP es un ajuste fino del modelo base SmolLM2-135M de Hugging Face, especializado en la generación y compleción de código PHP. Lo publica el usuario chellen021 como proyecto personal de aprendizaje, con el objetivo explícito de documentar el proceso de ajuste, evaluación y publicación de un modelo de código. Con 134.515.008 parámetros, es un modelo muy pequeño que hereda la arquitectura transformer decoder-only de la familia SmolLM2.

El modelo se entrena sobre un subconjunto filtrado de The Stack v3, restringido a ficheros PHP con licencias permisivas detectadas automáticamente, y se ajusta durante 5.000 pasos en una única GPU Nvidia T4. La model card es inusualmente honesta: el autor concluye que el modelo ha aprendido a predecir texto PHP con mayor fidelidad (perplejidad de validación de 3,18 frente a 3,46 del base), pero no hay evidencia estadística de que escriba código más correcto que el modelo original.

Su relevancia es fundamentalmente educativa y metodológica. No está pensado para producción y el propio autor lo desaconseja. Sirve como ejemplo reproducible de un pipeline completo de ajuste fino de bajo coste, con evaluación estadística rigurosa y discusión transparente de limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base SmolLM2-135M soporta 8.192 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, sin GGUF) |
| Idiomas soportados | Código (PHP); el modelo base es multilingüe, pero el ajuste se orienta a código |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del SmolLM2-135M, un transformer decoder-only de 135 millones de parámetros. No se introduce ninguna modificación arquitectónica: se reutiliza la pila de atención y el tokenizador del modelo base y se continúa el preentrenamiento con datos de dominio específico.

Los datos provienen de The Stack v3 (snapshot de GitHub hasta el 7 de agosto de 2025, licencia ODC-By 1.0). Se aplicaron filtros para conservar únicamente ficheros PHP con licencia permisiva detectada, no vendidos, de entre 200 bytes y 200 KB, deduplicados por contenido y sin menciones de "All rights reserved" o "proprietary" en los primeros 4.000 caracteres. El conjunto resultante contiene 245.130 ficheros de entrenamiento y 10.742 de validación, procedentes de 10.914 repositorios, con 285.749.021 tokens de entrenamiento y 16.733.639 de validación. La partición train/validación se hizo por repositorio para evitar fuga de datos.

El entrenamiento se ejecutó en una única Nvidia T4 (Kaggle) durante 5.000 pasos, lo que supone aproximadamente el 14% de una pasada completa sobre los datos. Se usó batch de 8, acumulación de gradiente 2, 512 tokens por muestra, learning rate 5e-5 con schedule coseno. No se menciona RLHF, DPO ni ninguna técnica de alineación posterior.

## Capacidades

- Generación y compleción de código PHP a partir de un prefijo (modelo de completion, no de chat).
- Predicción de continuación de funciones, bloques y estructuras sintácticas PHP.
- Generación de texto condicionada por prompt de código con decodificación greedy o por muestreo.
- No soporta tool calling ni function calling de forma nativa.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No tiene capacidades de visión ni audio.
- No está diseñado como asistente conversacional ni soporta instrucciones en formato chat.
- Capacidad multilingüe limitada al dominio de código; el modelo base es multilingüe pero el ajuste se centra en PHP.

## Casos de uso

- Autocompletado de código PHP en editores: el modelo puede generar continuaciones de fragmentos PHP mediante prompts de prefijo, útil para prototipos de plugins de editor o experimentos de IDE ligero, dado su reducido tamaño.
- Docencia y demostración de ajuste fino: sirve como ejemplo reproducible de un pipeline completo (filtrado de datos, SFT, evaluación con intervalos de confianza) para cursos o talleres sobre modelos de código.
- Investigación sobre evaluación estadística: su model card incluye comparaciones con intervalos de confianza bootstrap, lo que lo convierte en un caso de estudio sobre cómo reportar resultados honestos en modelos pequeños.
- Experimentos de compleción de bajo coste: al caber en una GPU consumer, permite iterar rápidamente sobre prompts y parámetros de decodificación sin infraestructura dedicada.
- Generación de snippets para tests unitarios exploratorios: con revisión manual obligatoria, puede producir borradores de funciones PHP que el desarrollador valida y corrige.
- Comparación de técnicas de filtrado de datos: el pipeline descrito (filtros de licencia, tamaño, deduplicación, redacción) es reutilizable como referencia para construir datasets de código en otros lenguajes.

## Benchmarks y rendimiento

Los datos de evaluación provienen de la model card del autor y no constituyen un benchmark estándar.

| Métrica | Modelo base | SmolLM2-135M-PHP | IC 95% de la diferencia |
|---|---|---|---|
| Validation loss | 1,242 | 1,158 | No disponible |
| Perplexity | 3,46 | 3,18 | No disponible |
| Brackets cerrados (greedy, 50 prompts) | 44 | 46 | -6% a +16% |
| `php -l` pasa (greedy, 50 prompts) | 35 | 39 | -4% a +20% |
| Tests de función pasan (greedy, 20 prompts) | 4 | 3 | -15% a 0% |
| Brackets cerrados (T=0,7, 3 salidas) | 82,7% | 82,0% | -8,7% a +6,7% |
| `php -l` pasa (T=0,7, 3 salidas) | 61,3% | 63,3% | -8,7% a +12,7% |
| Tests de función pasan (T=0,7, 3 salidas) | 8,3% | 11,7% | -3,3% a +10,0% |

Todos los intervalos de confianza incluyen cero, por lo que ninguna diferencia es estadísticamente significativa. La generación se limitó a 400 tokens nuevos con repetition penalty de 1,1 y truncado al cerrar todos los corchetes.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 540 MB solo para pesos (135M × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 270 MB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Entrenamiento realizado en una única Nvidia T4 (16 GB), lo que confirma que el ajuste fino es viable en GPUs de gama media o en entornos gratuitos como Kaggle.
- Opciones de despliegue: transformers (referencia en la model card), llama.cpp y Ollama requerirían conversión a GGUF (no se publican pesos GGUF en el repositorio); vLLM y TGI son viables con los safetensors publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-135M-PHP | 134,5M | No disponible | PHP (completion) | Apache 2.0 | Hugging Face |
| SmolLM2-135M (base) | 135M | 8.192 tokens (según documentación del base) | Texto general multilingüe | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 360M | 8.192 tokens (según documentación del base) | Texto general multilingüe | Apache 2.0 | Hugging Face |
| Modelos PHP especializados de mayor tamaño | No disponible | No disponible | PHP | Variable | No disponible |

La comparación directa con otros modelos especializados en PHP no está disponible en la información proporcionada. Frente a su modelo base, la única diferencia medible es la perplejidad de validación en PHP, sin mejora estadísticamente significativa en corrección funcional.

## Limitaciones y advertencias

- El propio autor desaconseja su uso en producción: puede generar código incorrecto, inseguro o que no se ejecuta.
- No hay evidencia estadística de que escriba código más correcto que el modelo base; los intervalos de confianza de todas las métricas incluyen cero.
- El conjunto de entrenamiento es pequeño y sesgado hacia repositorios con licencias permisivas detectadas automáticamente, lo que puede introducir sesgos de estilo y de licencia.
- La detección automática de licencias puede ser errónea; el código fuente conserva sus licencias originales y podría aparecer en las salidas.
- El modelo no conoce nada posterior a agosto de 2025.
- Los datos fuente pueden contener código malicioso o datos personales no redactados.
- Puede reproducir código de entrenamiento; es necesario verificar licencias antes de reutilizar salidas.
- Es un modelo de completion, no un asistente conversacional: no sigue instrucciones en formato chat.
- La mayoría de los tests funcionales fallan, tanto en este modelo como en el base.
- No se publican pesos en GGUF ni cuantizaciones listas para usar.
- No se dispone de información sobre sesgos específicos más allá de los derivados del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chellen021/SmolLM2-135M-PHP
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset The Stack v3: https://huggingface.co/datasets/HuggingFaceCode/stack-v3-train
