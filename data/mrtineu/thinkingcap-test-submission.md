# mrtineu/thinkingcap-test-submission

## Resumen

ThinkingCap-Test submission es un checkpoint de investigación publicado por Martin Senkyr (usuario `mrtineu` en HuggingFace) sobre el modelo base Qwen/Qwen3-0.6B. Se trata de un experimento de ajuste fino orientado a reducir la longitud de las trazas de razonamiento del modelo sin degradar significativamente su precisión en tareas de evaluación. La propuesta consiste en insertar una capa decodificadora adicional tras la capa 13 del transformer original y entrenar únicamente 64 canales de su MLP, lo que supone aproximadamente 198.000 parámetros entrenables frente a los 611,78 millones totales del checkpoint.

El modelo resultante es un Qwen3 estándar de 29 capas, por lo que carga sin modificaciones en Transformers y vLLM, sin necesidad de código personalizado. El entrenamiento se realizó sobre trazas de razonamiento más breves generadas por Qwen3-8B con indicaciones de concisión, lo que sitúa al modelo en la línea de trabajo de compresión de cadenas de pensamiento (chain-of-thought) para reducir coste de inferencia.

Su relevancia es fundamentalmente metodológica: demuestra que es posible ahorrar un 28,7 % de tokens de salida con una pérdida de precisión de solo 1,71 puntos porcentuales mediante un ajuste extremadamente ligero. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y su propósito declarado es servir como envío a un benchmark interno (ThinkingCap-Test), no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con una capa decodificadora adicional insertada tras la capa 13; 29 capas en total |
| Parámetros totales | 611.780.864 |
| Parámetros activos | No aplica (no es MoE); ~198.000 parámetros entrenables en el ajuste |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; compatible con cuantización estándar de Transformers/vLLM, pero no se documentan variantes publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y ficheros de tokenizer |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso. La modificación arquitectónica consiste en una única capa decodificadora extra insertada después de la capa 13, dando un total de 29 capas. De esa capa adicional solo se entrenan 64 canales de su MLP, lo que equivale a unos 198.000 parámetros actualizados. El resto de los pesos permanece congelado. Al mantener la estructura estándar de Qwen3, el checkpoint es compatible con Transformers y vLLM sin parches.

El entrenamiento se realizó sobre trazas de razonamiento más cortas, redactadas por el propio estudiante a partir de indicaciones de brevedad proporcionadas por Qwen3-8B. El checkpoint principal corresponde al paso 170 (media época). El repositorio incluye además otros checkpoints del mismo run, una variante con la capa insertada tras la capa 20 y una ejecución con LoRA, lo que permite reproducir y comparar el método. No se documentan en la información disponible el volumen total de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en formato de traza de pensamiento (thinking), heredado de Qwen3.
- Producción de cadenas de razonamiento más breves que el modelo base, objetivo central del ajuste.
- Generación conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- Carga directa en Transformers y vLLM sin código personalizado.
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling, function calling, agentes y multi-step reasoning: no documentados específicamente para este checkpoint.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Investigación sobre compresión de cadenas de pensamiento: el modelo sirve como referencia reproducible para estudiar la relación entre longitud de traza y precisión, gracias a los checkpoints intermedios y los ficheros `results.json` incluidos.
- Evaluación de técnicas de ajuste ultra-ligero: permite comparar la inserción de una capa extra con entrenamiento selectivo de canales MLP frente a alternativas como LoRA, ya que el repositorio incluye una ejecución LoRA del mismo run.
- Prototipado de pipelines de razonamiento de bajo coste: al reducir un 28,7 % los tokens de salida, resulta adecuado para experimentos donde el coste por token generado es el cuello de botella.
- Reproducción de benchmarks internos: el checkpoint está pensado para ejecutarse con `evaluate.py` y `compare.py` de ThinkingCap-Test en el commit `bd52d8d`, con 8 muestras por pregunta.
- Docencia y formación en ajuste fino: el bundle de código (`martin-senkyr.bundle`) y los ficheros de resultados permiten reproducir el experimento de principio a fin en hardware modesto.
- Pruebas de integración con vLLM y TGI: al ser un Qwen3 estándar de 29 capas, sirve para validar despliegues de inferencia sin necesidad de adaptar el runtime.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la evaluación interna ThinkingCap-Test (commit `bd52d8d`, 8 muestras por pregunta, `evaluate.py` sin modificar):

| Checkpoint | Tokens ahorrados | Cambio de precisión |
|---|---|---|
| root: extra-mlp-64, paso 170 (media época) | 28,7 % [27,5; 30,0] | −1,71 pp [−2,40; −1,02] |

La comparación se realiza contra el baseline Qwen3-0.6B (`base/results.json`). El autor indica que, al cargar el baseline por ruta local (`base-local/results.json`), cada comparación se mueve como máximo un 0,1 % en tokens y 0,02 pp en precisión. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,3 GB para los pesos (611,78 M de parámetros), más overhead de activaciones y caché KV.
- En cuantización de 8 bits: aproximadamente 0,7 GB; en 4 bits: aproximadamente 0,4 GB (estimaciones teóricas a partir del número de parámetros; no verificadas con este checkpoint).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) con enorme margen.
- Despliegue: Transformers, vLLM y Text Generation Inference (TGI), según los tags del repositorio. No se documenta soporte explícito de llama.cpp u Ollama, aunque la conversión a GGUF sería factible al ser una arquitectura Qwen3 estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThinkingCap-Test submission (este) | 611,78 M | No disponible | Apache 2.0 | HuggingFace, 0 descargas | Qwen3-0.6B + capa extra; −28,7 % tokens, −1,71 pp precisión |
| Qwen/Qwen3-0.6B | ~600 M | No disponible en la información | Apache 2.0 | HuggingFace, ampliamente descargado | Modelo base; referencia de precisión y longitud de traza |
| Qwen3-8B (generador de trazas) | ~8 000 M | No disponible en la información | Apache 2.0 | HuggingFace | Usado para producir las trazas breves de entrenamiento; mucho mayor coste de inferencia |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La pérdida de precisión de 1,71 pp es estadísticamente significativa según el intervalo publicado ([−2,40; −1,02]), por lo que el ahorro de tokens no es gratuito.
- El checkpoint principal corresponde a media época de entrenamiento (paso 170); no se documenta el comportamiento en convergencia completa.
- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-0.6B hereda los sesgos del modelo base y de los datos de entrenamiento originales.
- Riesgo de alucinación inherente a un modelo de 0,6 B de parámetros; la brevedad forzada de las trazas puede agravar errores en tareas de razonamiento complejo.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equivalente al del modelo base.
- Longitud de contexto no disponible; conviene verificarla en `config.json` antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación estándar desaconseja su uso en producción sin una validación propia.
- El método depende de la arquitectura Qwen3 concreta; los resultados no son directamente trasladables a otros modelos sin reentrenar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrtineu/thinkingcap-test-submission
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Ficheros de metodología y resultados citados en la model card: `IDEA.md`, `data.md`, `results.json`, `base/results.json`, `base-local/results.json`, `other-checkpoints/` y `martin-senkyr.bundle` (todos dentro del repositorio del modelo)
- Benchmark ThinkingCap-Test (commit `bd52d8d`): referencia citada en la model card, sin URL directa disponible en la información proporcionada
