# alexkstern/baseline_1Bpt_hfinit_van_s0_2026-08-14_03-59-40_636866-pt

## Resumen

El modelo `baseline_1Bpt_hfinit_van_s0_2026-08-14_03-59-40_636866-pt` es un transformer decoder-only de tamaño reducido, entrenado por el usuario `alexkstern` como parte de un experimento de investigación sobre dosis de tokens y réplicas de semillas. Forma parte del proyecto `token_dose_1Bpt_seed_replicas_v1` y se ha entrenado con la librería [nanochat](https://github.com/karpathy/nanochat), una implementación ligera de GPT desarrollada por Andrej Karpathy. El nombre del modelo indica que se trata de un *baseline* (vanilla, sin técnicas adicionales) pre-entrenado con 1.000 millones de tokens (`1Bpt`), con una configuración de 16 capas y 1024 dimensiones de embedding.

El modelo está pensado como punto de referencia para estudiar el efecto de la cantidad de tokens de pre-entrenamiento, la semilla aleatoria y la forma de la curva de aprendizaje (en este caso, una tasa de aprendizaje trapezoidal). No incluye fine-tuning posterior ni técnicas como RLHF o DPO, por lo que es un modelo de lenguaje base puro. Su relevancia radica en servir como control experimental dentro de una serie de réplicas, más que como un modelo listo para producción. El checkpoint publicado corresponde al paso 3.814 de entrenamiento, con una pérdida de entrenamiento suavizada de 3.17 y una pérdida mínima en el objetivo de 0.947.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con atención multi-cabeza estándar |
| Parametros totales | no disponible (la configuración sugiere ~268M, sin confirmar) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no disponible (entrenado con FineWeb, predominantemente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (`.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar: un transformer decoder-only con 16 capas, 8 cabezas de atención (todas ellas cabezas clave/valor, es decir, atención multi-cabeza clásica sin GQA), dimensión de embedding de 1024 y un vocabulario de 65.536 tokens (tokenizer BPE de nanochat). La longitud de contexto es de 2048 tokens. No se emplea ninguna innovación arquitectónica destacable; es un *baseline* deliberadamente simple.

El entrenamiento se realizó sobre el dataset `fineweb-nanochatbpe-20B`, una versión tokenizada de FineWeb, con un total de 1.000 millones de tokens (`pt_tokens: 1000000000`). Se utilizó una tasa de aprendizaje trapezoidal con calentamiento nulo y un descenso final del 40% de los pasos, sin weight decay. El optimizador no se especifica en la configuración, pero por defecto en nanochat suele ser AdamW. No se aplicó RLHF, DPO ni ningún tipo de ajuste posterior; el modelo es exclusivamente de pre-entrenamiento. La evaluación se realizó sobre `c4-nanochatbpe-10B` como conjunto auxiliar.

## Capacidades

- Generación de texto autoregresiva: el modelo puede continuar secuencias de texto de hasta 2048 tokens, produciendo texto coherente a nivel local, aunque sin fine-tuning no sigue instrucciones ni mantiene diálogos estructurados.
- Modelado de lenguaje: al ser un modelo base, su capacidad principal es estimar la probabilidad de secuencias de tokens, útil para medir perplexidad o como inicialización para tareas posteriores.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: no se ha entrenado para ninguna de estas capacidades.
- Multilingüismo limitado: al entrenarse con FineWeb (mayoritariamente inglés), el modelo tiene capacidades básicas en inglés y muy limitadas en otros idiomas, aunque no se ha evaluado formalmente.

## Casos de uso

- Investigación sobre scaling laws: el modelo sirve como punto de control para estudiar cómo varía la pérdida en función del número de tokens de entrenamiento, la semilla y la forma de la tasa de aprendizaje. Se puede comparar con otras réplicas del mismo proyecto.
- Análisis de la relación entre dosis de tokens y rendimiento: al ser un *baseline* sin técnicas adicionales, permite aislar el efecto de la cantidad de datos frente a otras variables en experimentos controlados.
- Inicialización para fine-tuning: aunque no se ha fine-tuning, el checkpoint podría usarse como punto de partida para tareas específicas de NLP, como clasificación de texto o generación condicionada, si se dispone de los recursos para ajustarlo.
- Estudio de la dinámica de entrenamiento: los metadatos incluidos (pérdida, flops, tiempo) permiten analizar la eficiencia del entrenamiento y la convergencia del modelo en función de la configuración.
- Reproducibilidad de experimentos: al publicarse el checkpoint, otros investigadores pueden reproducir o extender los resultados del proyecto `token_dose_1Bpt_seed_replicas_v1`.
- Evaluación de tokenizadores: el vocabulario de 65.536 tokens y el dataset tokenizado con `nanochatbpe` permiten estudiar el impacto del tokenizador en el rendimiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye métricas de entrenamiento (pérdida suavizada de 3.17 y pérdida mínima en el objetivo de 0.947), pero no resultados en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 268 millones de parámetros (estimación basada en la configuración, sin confirmar), su huella de memoria es reducida: en FP32 ocuparía alrededor de 1.1 GB, y en FP16 unos 0.5 GB.
- Cabe en cualquier GPU consumer moderna, como una RTX 3060 (12 GB) o incluso GPUs con 4 GB de VRAM si se usa cuantización o precisión mixta.
- Para inferencia, se puede cargar con PyTorch estándar o mediante librerías como llama.cpp si se convierte a GGUF, aunque no se proporcionan pesos en ese formato.
- Dado que es un modelo de investigación, no se han medido latencias ni throughputs oficiales. En una GPU moderna, la generación de tokens debería ser muy rápida (del orden de miles de tokens por segundo en FP16).
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede usar directamente con la librería nanochat o cargarlo en un script personalizado. No hay soporte nativo para vLLM, TGI u Ollama sin conversión previa.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo no tiene benchmarks publicados y su configuración es específica de un experimento de investigación. Se podría comparar con modelos pequeños como GPT-2 (124M) o Pythia-410M, pero no hay datos de rendimiento en tareas comunes para este checkpoint, por lo que la comparación no sería significativa.

## Limitaciones y advertencias

- Es un modelo base sin fine-tuning: no sigue instrucciones, no mantiene conversaciones coherentes y su salida puede ser incoherente o repetitiva si se usa directamente en aplicaciones de usuario.
- Sesgos de los datos: entrenado con FineWeb, que es un subconjunto de Common Crawl, puede reflejar sesgos presentes en la web, como estereotipos o contenido ofensivo.
- Riesgo de alucinación: al ser un modelo de lenguaje puro, puede generar información factualmente incorrecta o inventada.
- Limitaciones de idioma: aunque no se especifican los idiomas, el entrenamiento con FineWeb implica un dominio predominante del inglés; el rendimiento en otros idiomas será pobre.
- Sin soporte para tareas especializadas: no dispone de tool calling, agentes, visión ni audio, por lo que no es adecuado para aplicaciones que requieran estas capacidades.
- Formato de pesos propietario: los pesos están en formato `.pt` de PyTorch, no en safetensors ni GGUF, lo que puede dificultar su uso con herramientas estándar de inferencia sin conversión.
- Restricciones de licencia: aunque la licencia es Apache-2.0 (permisiva para uso comercial), al ser un modelo de investigación sin documentación adicional, su uso en producción no está recomendado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alexkstern/baseline_1Bpt_hfinit_van_s0_2026-08-14_03-59-40_636866-pt)
- [Registro de entrenamiento en W&B](https://wandb.ai/alexksternteam/token_dose_1Bpt_seed_replicas_v1/runs/iqt96ttd)
- [Repositorio de nanochat](https://github.com/karpathy/nanochat)
