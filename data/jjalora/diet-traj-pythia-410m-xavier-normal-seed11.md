# jjalora/diet-traj-pythia-410m-xavier-normal-seed11

## Resumen

DIET trajectory: Pythia-410M es un checkpoint de investigación publicado por el usuario jjalora dentro de la campaña "DIET weight-space", orientada al estudio de trayectorias de entrenamiento en el espacio de pesos. No es un modelo nuevo en sentido estricto: es una reproducción desde cero de Pythia-410M de EleutherAI, entrenada con la receta abierta original (misma arquitectura GPT-NeoX, mismo flujo de tokens y mismo orden del dataset Pile estándar prebarajado), variando únicamente la semilla aleatoria y el esquema de inicialización de pesos.

El modelo tiene 405.334.016 parámetros reales según los safetensors y emplea una arquitectura transformer decoder-only de tipo GPT-NeoX. Su interés no reside en capacidades de generación de altísima calidad, sino en la disponibilidad de checkpoints intermedios densos (ramas `stepN` desde 0 hasta 512 y cada 100 pasos) con métricas de pérdida homogéneas y comparables entre trayectorias, lo que lo convierte en material para investigación sobre dinámica de entrenamiento, inicialización y reproducibilidad.

La relevancia actual es metodológica: permite analizar cómo evoluciona la pérdida de entrenamiento y validación a lo largo del preentrenamiento con una receta controlada, y comparar el efecto de distintas semillas o esquemas de inicialización sobre el mismo flujo de datos. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-NeoX (gpt_neox) |
| Parametros totales | 405.334.016 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Pythia-410M usa 2048 tokens en su receta original) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16), solo pesos, por rama `stepN` |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M: un transformer decoder-only de tipo GPT-NeoX con atención causal estándar y sin mecanismos híbridos ni SSM. El entrenamiento sigue la receta abierta de EleutherAI (`models/410M/pythia-410m.yml`): mismo flujo de tokens y mismo orden (`EleutherAI/pile-standard-pythia-preshuffled`, lote *i* = filas [i·1024, (i+1)·1024)), AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni bias, grad clipping 1.0, scheduler coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y lote global de 1024 × 2048 tokens independientemente del número de GPUs.

La variable experimental es la inicialización: `init_scheme = None` corresponde al esquema `pythia` (small_init + wang_init de GPT-NeoX), y otras variantes se documentan en `src/init_schemes.py` del código de entrenamiento. La reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks; el autor verifica que el esquema `pythia` coincide con la *distribución* por tensor de `EleutherAI/pythia-410m` revisión `step0` mediante un test específico. No se documentan fases de RLHF, DPO ni ajuste instructivo: es un modelo base de preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base de preentrenamiento.
- Razonamiento y conocimiento factual limitados por su escala (410M) y por el estado intermedio de muchos checkpoints.
- Generación de código y matemáticas básicas, sin garantías de calidad propias de modelos instruct.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés declarado.
- No dispone de modo thinking, visión ni audio.
- Valor especial como objeto de estudio: checkpoints intermedios con `losses.csv` que incluye `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr` por revisión.

## Casos de uso

- Investigación sobre trayectorias de entrenamiento: cargar ramas `stepN` concretas y analizar la evolución de la pérdida de validación recalculada con un scorer fijo, lo que permite comparar puntos de forma directa entre trayectorias de la misma campaña.
- Estudios de inicialización de pesos: comparar el esquema `pythia` (small_init + wang_init) con otros esquemas documentados en `src/init_schemes.py` manteniendo constante el flujo de tokens y el orden del dataset.
- Análisis de sensibilidad a la semilla: al diferir únicamente la semilla entre ejecuciones, sirve para medir varianza en curvas de pérdida y en métricas finales bajo una receta idéntica.
- Reproducibilidad y auditoría de recetas: verificar que una implementación propia reproduce el orden de tokens y la configuración de optimizador de Pythia, usando `losses.csv` como referencia autoritativa.
- Experimentos de weight-space: estudiar interpolación, poda o merging de pesos entre checkpoints de la misma trayectoria o entre trayectorias distintas, aprovechando la densidad de checkpoints (pasos 0, 1, 2, 4, …, 512 y cada 100 pasos).
- Docencia y prototipado de bajo coste: un modelo de 405M parámetros en fp16 permite ejecutar experimentos de generación de texto en hardware modesto sin renunciar a una arquitectura y un dataset bien documentados.
- Generación de texto en inglés para pruebas de pipelines: integrarlo vía `transformers` o text-generation-inference para validar infraestructura antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de pérdida y perplejidad por checkpoint en `losses.csv` (`train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`), sin valores numéricos concretos en la información proporcionada y sin comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en fp16 para los 405M parámetros, más overhead de activaciones y caché KV; en cuantización de 8 bits rondaría 0,4 GB y en 4 bits unos 0,2 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090 o RTX 3060 funcionan sin problema.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1660, RTX 2060 y superiores.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversión a llama.cpp/Ollama no documentada pero viable al ser arquitectura GPT-NeoX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota de almacenamiento: el repositorio ocupa 1167,4 GB debido a la multitud de ramas `stepN` con pesos completos; descargar solo la rama necesaria es imprescindible en la práctica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jjalora/diet-traj-pythia-410m-xavier-normal-seed11 | 405.334.016 | no disponible | apache-2.0 | Hugging Face, múltiples ramas `stepN` | Reproducción de Pythia-410M con semilla y esquema de init variables; foco en trayectorias |
| EleutherAI/pythia-410m | ~410M | 2048 tokens (receta original) | apache-2.0 | Hugging Face, checkpoints oficiales | Modelo de referencia con suite completa de checkpoints y benchmarks publicados |
| EleutherAI/pythia-160m | ~160M | 2048 tokens (receta original) | apache-2.0 | Hugging Face | Alternativa de menor coste para estudios de trayectoria a escala reducida |
| Modelos base de ~400M de otras familias (p. ej. GPT-2 small, 124M) | 124M-400M | variable | variable | Hugging Face | Comparables en coste de inferencia, no en receta reproducible ni en densidad de checkpoints |

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable ni está alineado con preferencias humanas.
- Riesgo elevado de alucinación y de contenido factualmente incorrecto, acentuado en checkpoints intermedios de la trayectoria.
- Idiomas: únicamente inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Sesgos heredados del dataset Pile, con la composición y los sesgos conocidos de dicho corpus.
- Longitud de contexto no documentada en la información disponible; la receta original de Pythia emplea 2048 tokens.
- Muchas ramas `stepN` corresponden a estados parciales del entrenamiento y no deben tratarse como modelos finales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para producción; se recomienda no desplegarlo en aplicaciones de cara al usuario sin ajuste y evaluación adicionales.
- El tamaño del repositorio (1167,4 GB) implica riesgos operativos de descarga y almacenamiento; conviene clonar ramas concretas.
- La reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks; solo se garantiza coincidencia distribucional por tensor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-xavier-normal-seed11
- Dataset: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Repositorio de la receta original Pythia: https://github.com/EleutherAI/pythia
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Configuración de entrenamiento citada (`models/410M/pythia-410m.yml`): https://github.com/EleutherAI/pythia/blob/main/models/410M/pythia-410m.yml
- Código de esquemas de inicialización (`src/init_schemes.py`): no disponible como enlace público en la información proporcionada
- Documento de pérdidas (`LOSSES.md`): disponible en el repositorio del modelo, https://huggingface.co/jjalora/diet-traj-pythia-410m-xavier-normal-seed11/blob/main/LOSSES.md
- Fichero de pérdidas (`losses.csv`): https://huggingface.co/jjalora/diet-traj-pythia-410m-xavier-normal-seed11/blob/main/losses.csv
