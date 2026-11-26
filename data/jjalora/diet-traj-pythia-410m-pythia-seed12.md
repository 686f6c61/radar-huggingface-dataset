# jjalora/diet-traj-pythia-410m-pythia-seed12

## Resumen

Diet-traj-pythia-410m-pythia-seed12 es un checkpoint de investigación publicado por el usuario jjalora dentro de la campaña DIET, un estudio de trayectorias de entrenamiento en el espacio de pesos. No es un modelo nuevo en sentido estricto: es una reproducción desde cero de Pythia-410M de EleutherAI, ejecutada con la receta abierta original (misma arquitectura, mismo flujo de tokens y mismo orden de batches) y diferenciada únicamente por la semilla aleatoria y el esquema de inicialización de pesos. El objetivo es permitir el estudio controlado de cómo evolucionan los pesos y las pérdidas a lo largo del preentrenamiento.

El modelo emplea la arquitectura GPT-NeoX (familia Pythia) con 405.334.016 parámetros reales según los safetensors, contexto de 2.048 tokens y entrenamiento sobre `EleutherAI/pile-standard-pythia-preshuffled`. El repositorio publica checkpoints intermedios en ramas `stepN` (de 0 a 512 y cada 100 pasos) en safetensors float16, junto con un `losses.csv` que registra pérdida de entrenamiento, pérdida de evaluación, perplejidad y precisión para cada checkpoint, recalculadas contra un conjunto de evaluación fijo para hacerlas comparables entre trayectorias.

Su relevancia es metodológica más que de producto: sirve para investigar dinámicas de entrenamiento, inicialización, semillas y dietas de datos, no como modelo de propósito general para producción. La licencia Apache 2.0 y el formato estándar de transformers facilitan su uso en experimentos reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only, familia Pythia) |
| Parametros totales | 405.334.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (receta Pythia-410M) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16), ramas `stepN` por checkpoint |

## Arquitectura y entrenamiento

Transformer decoder-only de tipo GPT-NeoX con 410M parámetros, idéntico en arquitectura a `EleutherAI/pythia-410m`. El entrenamiento sigue la receta abierta de Pythia: AdamW con lr 3e-4, betas (0,9, 0,95), weight decay 0,1 sin decaimiento en LayerNorm ni bias, grad clip 1,0, schedule coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros fp32 y batch global de 1024 × 2048 tokens. Los datos provienen de `EleutherAI/pile-standard-pythia-preshuffled`, con el batch *i* correspondiente a las filas [i·1024, (i+1)·1024), preservando el orden original.

La única variación respecto a la ejecución de referencia es la semilla y el esquema de inicialización (`init_scheme = None`, equivalente al `pythia` de GPT-NeoX: small_init + wang_init). El autor documenta que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero verifican que la distribución por tensor coincide con la revisión `step0` de `EleutherAI/pythia-410m` mediante un test (`tests/test_pythia_step0_init_match.py`). No se menciona RLHF, DPO ni ajuste fino posterior: es un preentrenamiento puro. Los checkpoints se publican en ramas `stepN` para N en {0, 1, 2, 4, …, 512} y cada 100 pasos, con `main` reservado a los pesos finales.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del preentrenamiento sobre The Pile.
- Modelado de lenguaje y cálculo de perplejidad sobre texto en inglés.
- Checkpoints intermedios utilizables para estudiar la evolución de representaciones y pérdidas.
- Evaluación comparativa de trayectorias de entrenamiento (misma eval set y scorer en `losses.csv`).
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en dinámicas de entrenamiento: cargar ramas `stepN` concretas para analizar cómo cambian los pesos, la pérdida y la perplejidad a lo largo del preentrenamiento y comparar con otras trayectorias de la campaña DIET.
- Estudios de inicialización y semillas: al diferir solo en semilla y esquema de init, permite aislar el efecto de la inicialización en el resultado final frente a `EleutherAI/pythia-410m`.
- Reproducibilidad de recetas: validar pipelines de entrenamiento propios contra una receta abierta conocida (AdamW, schedule coseno, batch 1024×2048) y comprobar desviaciones en `losses.csv`.
- Análisis de dietas de datos: usar el orden fijo de batches de `pile-standard-pythia-preshuffled` para experimentos controlados sobre qué datos ve el modelo en cada paso.
- Docencia y formación: modelo pequeño (405M) que cabe en hardware modesto y permite explicar preentrenamiento, checkpoints y evaluación de perplejidad con datos reales.
- Base para ajuste fino experimental: punto de partida ligero para tareas de clasificación o generación en inglés cuando no se requiere un modelo grande y se prioriza trazabilidad del origen de los pesos.
- Evaluación de infraestructura: probar despliegues con transformers y text-generation-inference sobre un modelo de 410M antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de entrenamiento y evaluación interna (`train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen`, `lr`) en `losses.csv`, sin valores numéricos concretos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 0,8-1 GB solo para pesos (405M × 2 bytes), más overhead de activaciones y KV cache; aproximadamente 1,5-2,5 GB en la práctica con contexto completo de 2.048 tokens.
- En cuantización de 8 bits o 4 bits (si se generan pesos GGUF/AWQ a partir de los safetensors) cabría en GPUs consumer de gama baja; el repositorio no publica cuantizaciones.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, con A100/H100 sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas e incluso en CPU para inferencia lenta.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| diet-traj-pythia-410m-pythia-seed12 | 405M | 2.048 | Apache 2.0 | Reproducción de trayectoria para investigación |
| EleutherAI/pythia-410m | 410M | 2.048 | Apache 2.0 | Modelo de referencia con checkpoints oficiales |
| EleutherAI/pythia-410m-deduped | 410M | 2.048 | Apache 2.0 | Variante entrenada sobre The Pile deduplicado |
| Modelos de ~400M de propósito general (p. ej. GPT-2 medium) | ~355M | 1.024 | MIT (GPT-2) | Generación de texto sin checkpoints intermedios |

La diferencia principal frente a `EleutherAI/pythia-410m` no es de rendimiento esperado, sino de propósito: este checkpoint forma parte de una campaña que publica trayectorias completas con evaluación homogénea para comparación entre ejecuciones. No se dispone de datos de benchmarks que permitan comparar rendimiento downstream con las alternativas.

## Limitaciones y advertencias

- Es un modelo de preentrenamiento puro, sin ajuste por instrucciones ni RLHF; no está alineado y puede generar contenido inapropiado o incoherente en uso conversacional.
- Riesgo de alucinación y de afirmaciones factualmente incorrectas, propio de un modelo de 410M entrenado sobre The Pile.
- Capacidad limitada por tamaño y contexto: 2.048 tokens y 405M de parámetros restringen razonamiento complejo, código extenso y conversaciones largas.
- Solo inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Sesgos presentes en The Pile (texto web, académico y de foros) pueden reflejarse en las salidas.
- El repositorio ocupa 1.167,4 GB por la acumulación de checkpoints; la descarga completa es inviable para la mayoría de usuarios y conviene descargar solo la rama `stepN` necesaria.
- La reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks; solo se garantiza coincidencia de distribución por tensor.
- Las filas de evaluación del checkpoint final tienen una salvedad documentada en `LOSSES.md`; conviene leerla antes de usar `losses.csv` como referencia.
- Uso comercial permitido por Apache 2.0, pero sin garantías de calidad para producción.

## Enlaces

- Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-pythia-seed12
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Repositorio Pythia: https://github.com/EleutherAI/pythia
- Dataset: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Configuración de la receta: `models/410M/pythia-410m.yml` en el repositorio Pythia
- Código de esquemas de inicialización: `src/init_schemes.py` (repositorio de entrenamiento del autor)
- Documentación de pérdidas: `LOSSES.md` en el repositorio del modelo
- Metadatos de campaña: `campaign.json` en el repositorio del modelo
