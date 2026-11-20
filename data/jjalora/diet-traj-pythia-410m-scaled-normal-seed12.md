# jjalora/diet-traj-pythia-410m-scaled-normal-seed12

## Resumen

DIET trajectory: Pythia-410M es un modelo de lenguaje de tipo GPT-NeoX entrenado desde cero como parte de la campaña de investigación DIET, centrada en el estudio del espacio de pesos y las trayectorias de entrenamiento. Lo desarrolla el usuario de Hugging Face `jjalora` y no debe confundirse con un modelo listo para producción: es un artefacto de investigación que reproduce la receta de entrenamiento de `EleutherAI/pythia-410m` (misma arquitectura, mismo flujo de tokens y mismo orden, mismo optimizador y schedule) cambiando únicamente la semilla y, en este caso, el esquema de inicialización (`init_scheme = None`, es decir, sin inicialización específica de Pythia).

El modelo tiene 405.334.016 parámetros reales según los pesos en safetensors, una arquitectura transformer decoder-only GPT-NeoX con licencia Apache 2.0 y soporte exclusivo del idioma inglés. Su relevancia es metodológica: permite comparar trayectorias de pérdida entre ejecuciones con distintas semillas e inicializaciones sobre un dataset y un orden de tokens idénticos, algo útil para estudiar estabilidad del entrenamiento, reproducibilidad y dinámica de optimización.

No es un modelo orientado a uso conversacional ni a tareas de razonamiento avanzado. Su valor está en los checkpoints intermedios (ramas `stepN`), en el fichero `losses.csv` con pérdidas de entrenamiento y evaluación homogéneas, y en el tamaño del repositorio (974,5 GB), que refleja la acumulación de pesos en float16 a lo largo de la trayectoria. Cualquier evaluación de capacidades debe interpretarse en ese contexto de modelo pequeño, entrenado con la receta Pythia y sin ajuste fino posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-NeoX (`gpt_neox`) |
| Parametros totales | 405.334.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la receta Pythia usa 2048 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16), ramas `stepN` por checkpoint y `main` con los pesos finales |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-NeoX, idéntica a la de `EleutherAI/pythia-410m`, con 405 millones de parámetros. El entrenamiento sigue la receta abierta de Pythia definida en `models/410M/pythia-410m.yml`: mismo flujo de tokens y mismo orden (`EleutherAI/pile-standard-pythia-preshuffled`, con el lote *i* correspondiente a las filas [i·1024, (i+1)·1024)), AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni bias, grad clipping 1.0, schedule coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y un batch global de 1024 × 2048 tokens independientemente del número de GPUs.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: entre ejecuciones de la campaña solo cambian la semilla aleatoria y el esquema de inicialización de pesos. En esta ejecución `init_scheme = None`, mientras que el esquema `pythia` corresponde a `small_init + wang_init` de GPT-NeoX. La model card advierte que la reproducción bit a bit de la RNG de inicialización de EleutherAI no es posible entre frameworks, aunque el esquema `pythia` coincide con la distribución por tensor de `EleutherAI/pythia-410m` en la revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. Se publican checkpoints en ramas `stepN` para N en {0, 1, 2, 4, …, 512} y cada 100 pasos, además de `losses.csv` con `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr` por checkpoint, recalculados contra un conjunto de evaluación fijo para permitir comparaciones directas entre trayectorias.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la receta Pythia-410M.
- Modelado de lenguaje y cálculo de perplejidad sobre el Pile y conjuntos de evaluación compatibles.
- Checkpoints intermedios consultables (`stepN`) para estudiar la evolución de representaciones y pérdidas durante el preentrenamiento.
- Reproducción controlada de una receta de entrenamiento abierta, útil para experimentos de reproducibilidad y comparación de inicializaciones.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo de razonamiento extendido (`thinking`), visión, audio ni multimodalidad.
- Capacidades multilingües limitadas al inglés según el campo `language: [en]`.
- No se documenta ajuste por RLHF, DPO ni instrucción; es un modelo base.

## Casos de uso

- Estudio de trayectorias de entrenamiento: comparar `losses.csv` de esta ejecución con otras de la campaña DIET para analizar el efecto de la semilla y del esquema de inicialización sobre la curva de pérdida y la perplejidad de evaluación.
- Investigación en reproducibilidad: verificar hasta qué punto la receta Pythia es estable ante cambios de inicialización manteniendo fijo el flujo de tokens y el orden de los lotes.
- Análisis del espacio de pesos: usar los checkpoints `stepN` para estudiar la evolución de los pesos, la norma por capa o la geometría de la pérdida a lo largo del entrenamiento.
- Experimentos de destilación o inicialización: emplear los pesos finales o intermedios como punto de partida controlado en estudios que necesiten una referencia Pythia-410M con inicialización alternativa.
- Evaluación de modelos pequeños en inglés: servir como línea base de 405 M de parámetros en benchmarks de lenguaje para contrastar con modelos de tamaño similar.
- Docencia y formación: ilustrar el pipeline completo de preentrenamiento (dataset prebarajado, schedule coseno, warmup, autocast fp16) con artefactos verificables y pérdidas publicadas.
- Auditoría de infraestructura de entrenamiento: comprobar que una implementación propia reproduce las pérdidas registradas bajo la misma receta y el mismo orden de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento y evaluación (`train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`) por checkpoint en `losses.csv`, sin valores numéricos concretos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en float16 para los 405 M de parámetros, más overhead de activaciones y KV cache; en cuantización de 8 bits o 4 bits el peso se reduciría a unos 0,4 GB o 0,2 GB respectivamente, aunque no se publican versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en float16; una RTX 4090, A100 o H100 queda sobredimensionada para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores con 8 GB o más.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference y endpoints compatibles según los tags; no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota de almacenamiento: el repositorio ocupa 974,5 GB por la acumulación de checkpoints en float16; descargar solo la rama `main` o un `stepN` concreto reduce drásticamente el espacio necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jjalora/diet-traj-pythia-410m-scaled-normal-seed12 | 405.334.016 | no disponible | apache-2.0 | Hugging Face, ramas `stepN` | Modelo de investigación con trayectoria completa y `losses.csv` |
| EleutherAI/pythia-410m | 410 M (aprox.) | 2048 (receta Pythia) | apache-2.0 | Hugging Face | Referencia oficial con la misma receta; incluye checkpoints y evaluaciones publicadas |
| Otros modelos de ~400 M en inglés | variable | variable | variable | Hugging Face | No se dispone de comparación numérica en la información proporcionada |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias de rendimiento frente a alternativas del mismo tamaño.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni RLHF: no está optimizado para diálogo, seguimiento de instrucciones ni tareas de agente.
- Entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, propio de un modelo de 405 M de parámetros sin verificación externa.
- Sesgos potenciales heredados del Pile, el corpus de entrenamiento de Pythia; no se documenta ningún proceso de mitigación.
- La model card advierte de que la reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks; las comparaciones deben hacerse a nivel de distribución, no de bits.
- El fichero `losses.csv` es la fuente autoritativa de pérdidas; los `snapshot.json` de revisiones anteriores al 2026-11-18 solo registran `step`, `tokens_seen`, `lr` y `dtype`.
- Existe una advertencia documentada sobre las filas de evaluación del checkpoint final en `LOSSES.md`; conviene revisarla antes de usar esos valores.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin garantías de calidad, no se recomienda su despliegue en producción sin evaluación adicional.
- El tamaño del repositorio (974,5 GB) puede dificultar la descarga completa; conviene clonar ramas específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-scaled-normal-seed12
- Receta Pythia de referencia: https://github.com/EleutherAI/pythia
- Modelo base de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Documentación de pérdidas (`LOSSES.md`): incluida en el repositorio del modelo
- Código de esquemas de inicialización (`src/init_schemes.py`): incluido en el repositorio de entrenamiento del autor, no enlazado en la información proporcionada
