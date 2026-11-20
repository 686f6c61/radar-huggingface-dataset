# jjalora/diet-traj-pythia-410m-he-normal-seed11

## Resumen

`jjalora/diet-traj-pythia-410m-he-normal-seed11` es un checkpoint de investigación publicado por el usuario jjalora dentro de la campaña DIET, un estudio de trayectorias de entrenamiento en el espacio de pesos. No es un modelo nuevo en el sentido de arquitectura o capacidades: es una reproducción desde cero de Pythia-410M de EleutherAI, entrenada con la receta abierta de Pythia sobre el mismo flujo de tokens (`EleutherAI/pile-standard-pythia-preshuffled`) y con idéntico orden de batches.

El modelo emplea la arquitectura GPT-NeoX (clase `gpt_neox` en Transformers) con 405.334.016 parámetros, contexto de 2048 tokens y licencia Apache 2.0. La variante concreta se distingue por el esquema de inicialización `he-normal` y la semilla 11; el resto de hiperparámetros (AdamW con lr 3e-4, betas 0.9/0.95, weight decay 0.1, cosine hasta 3e-5, 143.000 pasos, warmup de 1.430 pasos, batch global de 1024 × 2048 tokens) coinciden con la receta canónica.

Su relevancia es metodológica, no de producto: al mantener constante todo salvo la semilla y el esquema de inicialización, permite estudiar cómo varía la trayectoria de pérdida y el resultado final en función de esas elecciones. El repositorio incluye checkpoints intermedios por rama `stepN` y un `losses.csv` con pérdida de entrenamiento y de evaluación recalculada de forma homogénea para todos los checkpoints de la campaña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only, clase `gpt_neox` en Transformers) |
| Parametros totales | 405.334.016 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (derivada de la receta Pythia-410M; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16), organizados en ramas `stepN` y `main` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia GPT-NeoX, con la misma configuración que `EleutherAI/pythia-410m` (definida en `models/410M/pythia-410m.yml` del repositorio de EleutherAI). El entrenamiento sigue la receta Pythia: AdamW con learning rate 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni biases, gradient clipping de 1.0, scheduler cosine hasta 3e-5 a lo largo de 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch global de 1024 secuencias de 2048 tokens independientemente del número de GPUs. El flujo de datos es `EleutherAI/pile-standard-pythia-preshuffled`, con el batch *i* correspondiente a las filas [i·1024, (i+1)·1024), lo que garantiza el mismo orden de tokens que la ejecución original.

La única diferencia respecto a la receta canónica es la semilla aleatoria y el esquema de inicialización de pesos: aquí `init_scheme = he-normal` con semilla 11, frente al esquema `pythia` (small_init + wang_init de GPT-NeoX) de la ejecución de referencia. La model card advierte de que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, y que el esquema `pythia` solo iguala la distribución por tensor de `EleutherAI/pythia-410m` en la revisión `step0`. No se documenta RLHF, DPO ni ajuste fino posterior: es un modelo exclusivamente preentrenado. Los checkpoints se publican como ramas `stepN` para N en {0, 1, 2, 4, …, 512} más cada 100 pasos, con pesos en float16 safetensors, y `main` contiene los pesos finales.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base preentrenado sobre The Pile.
- Modelado de lenguaje y cálculo de perplejidad, con métricas de evaluación publicadas por checkpoint en `losses.csv`.
- Reproducción de trayectorias de entrenamiento: permite comparar puntos intermedios (ramas `stepN`) bajo un mismo eval set y scorer.
- Estudio del efecto de la inicialización y la semilla en el espacio de pesos, al ser el único eje de variación respecto a la receta Pythia.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No es un modelo instruido: no hay ajuste por instrucciones ni por preferencias, por lo que no cabe esperar formato conversacional nativo.

## Casos de uso

- Investigación sobre inicialización de pesos: comparar esta ejecución (`he-normal`, semilla 11) con otras variantes de la campaña DIET para aislar el efecto del esquema de init en la curva de pérdida y en el checkpoint final.
- Análisis de trayectorias de entrenamiento: usar las ramas `stepN` (0, 1, 2, 4, …, 512 y cada 100 pasos) junto con `losses.csv` para estudiar la dinámica de convergencia con métricas homogéneas entre checkpoints.
- Reproducibilidad de recetas: validar pipelines de preentrenamiento que replican la receta Pythia (mismo token stream, mismo orden de batches, mismo optimizer) y comprobar que las pérdidas son comparables.
- Experimentos controlados de semilla: entrenar o evaluar variantes con distintas semillas para cuantificar la varianza atribuible al azar en un modelo de 405 M de parámetros.
- Evaluación de modelos base pequeños en inglés: usar el checkpoint final como referencia de lenguaje en tareas de perplejidad o como línea base en experimentos de scaling a pequeña escala.
- Docencia y formación: al ser un modelo de 405 M de parámetros con licencia Apache 2.0 y pesos en safetensors, sirve para ilustrar el ciclo completo de preentrenamiento y evaluación con recursos modestos.
- Fine-tuning posterior como punto de partida: al ser un modelo base con licencia permisiva, puede ajustarse para tareas concretas en inglés, aunque sin garantías de rendimiento frente al Pythia original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta métricas de entrenamiento y evaluación de lenguaje (`train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen`, `lr`) en `losses.csv`, sin cifras concretas en el texto proporcionado ni comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 0,8-1 GB solo para pesos (405 M de parámetros × 2 bytes), más overhead de activaciones y caché KV para contexto de 2048 tokens.
- VRAM estimada en fp32: aproximadamente 1,6 GB solo para pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las dos últimas están sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota sobre almacenamiento: el tamaño del repositorio es de 1167,4 GB, dominado por las múltiples ramas de checkpoints intermedios; la descarga completa es inviable en la mayoría de entornos, por lo que conviene descargar solo la rama necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-he-normal-seed11` | 405.334.016 | 2048 (receta Pythia) | Apache 2.0 | Hugging Face, ramas `stepN` y `main` | Reproducción con init `he-normal` y semilla 11; incluye `losses.csv` por checkpoint |
| `EleutherAI/pythia-410m` | ~410 M | 2048 | Apache 2.0 | Hugging Face, revisiones `step0` a `step143000` | Modelo de referencia de la receta; incluye checkpoints intermedios oficiales |
| `EleutherAI/pythia-160m` | ~160 M | 2048 | Apache 2.0 | Hugging Face | Misma familia y receta, menor tamaño; útil como línea base de scaling |
| `EleutherAI/pythia-1b` | ~1 B | 2048 | Apache 2.0 | Hugging Face | Misma familia, mayor tamaño; permite comparar tendencias de pérdida |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no ha pasado por RLHF, DPO ni ajuste por instrucciones, por lo que no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Entrenado solo en inglés; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, inherente a un modelo base de 405 M de parámetros entrenado sobre The Pile.
- Sesgos heredados del corpus The Pile, sin filtrado ni mitigación documentada posterior al preentrenamiento.
- Contexto limitado a 2048 tokens, adecuado para tareas cortas pero insuficiente para documentos largos o conversaciones extensas.
- Es un artefacto de investigación sobre trayectorias de entrenamiento, no un modelo orientado a producción; su valor está en la comparabilidad metodológica, no en el rendimiento absoluto.
- El repositorio ocupa 1167,4 GB por la acumulación de checkpoints intermedios; la descarga completa es costosa y conviene limitarse a la rama necesaria.
- La model card advierte de que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks; el esquema `pythia` solo iguala la distribución por tensor de `step0`.
- Las filas de evaluación del checkpoint final tienen una advertencia documentada en `LOSSES.md` que conviene revisar antes de usar `losses.csv` en análisis comparativos.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin garantías de calidad, su uso en producción requeriría ajuste fino y evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-he-normal-seed11
- Repositorio de la receta Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Modelo de referencia Pythia-410M: https://huggingface.co/EleutherAI/pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Documentación de pérdidas del repositorio (`LOSSES.md`): https://huggingface.co/jjalora/diet-traj-pythia-410m-he-normal-seed11/blob/main/LOSSES.md
- Fichero de pérdidas (`losses.csv`): https://huggingface.co/jjalora/diet-traj-pythia-410m-he-normal-seed11/blob/main/losses.csv
- Código de esquemas de inicialización (`src/init_schemes.py`, referenciado en la model card): no disponible como enlace público en la información proporcionada
