# jjalora/diet-traj-pythia-410m-pythia-seed13

## Resumen

`diet-traj-pythia-410m-pythia-seed13` es un checkpoint de investigación publicado por el usuario jjalora dentro de la campaña DIET (weight-space), cuyo objetivo es estudiar trayectorias de entrenamiento en el espacio de pesos. No es un modelo conversacional ni un asistente afinado: es una reproducción desde cero de un preentrenamiento Pythia-410M siguiendo la receta abierta de EleutherAI, con la misma arquitectura, el mismo flujo de tokens y el mismo orden de datos, variando únicamente la semilla aleatoria y el esquema de inicialización de pesos.

El modelo emplea la arquitectura GPT-NeoX (etiquetada `gpt_neox` en transformers), con 405.334.016 parámetros reales según los safetensors del repositorio, y se distribuye en float16 safetensors con checkpoints intermedios organizados en ramas `stepN`. Su interés no reside en capacidades de producto, sino en la reproducibilidad: permite comparar curvas de pérdida entre ejecuciones con distintas semillas o inicializaciones bajo un protocolo idéntico.

Es relevante ahora para investigadores que trabajan en interpretabilidad del entrenamiento, dinámica de pesos y análisis de trayectorias, porque ofrece puntos de control densos (cada 100 pasos más potencias de dos hasta 512) con métricas de evaluación recalculadas de forma homogénea en `losses.csv`, lo que facilita comparaciones punto a punto entre trayectorias de la misma colección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only, `gpt_neox`) |
| Parametros totales | 405.334.016 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la receta Pythia usa 2048 tokens, pero no se explicita en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16), solo pesos, por ramas `stepN` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia GPT-NeoX con 405 millones de parámetros, entrenado desde cero con la receta Pythia oficial (`models/410M/pythia-410m.yml` de `EleutherAI/pythia`). El flujo de tokens y su orden son idénticos al corpus `EleutherAI/pile-standard-pythia-preshuffled`, con lote *i* correspondiente a las filas [i·1024, (i+1)·1024). La optimización usa AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni bias, recorte de gradiente 1.0, scheduler coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y un lote global de 1024 × 2048 tokens independientemente del número de GPUs.

La única diferencia respecto a la ejecución de referencia es la semilla aleatoria y el esquema de inicialización: en esta ejecución `init_scheme = None`, es decir, se usa el esquema `pythia` de GPT-NeoX (small_init + wang_init). La model card advierte de que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero el esquema `pythia` coincide con la distribución por tensor de `EleutherAI/pythia-410m` en la revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. Se publican checkpoints en ramas `stepN` para N en {0, 1, 2, 4, …, 512} y cada 100 pasos, con `losses.csv` en `main` como fuente autoritativa de pérdida de entrenamiento y de evaluación recalculada sobre un conjunto fijo.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del preentrenamiento sobre The Pile.
- Modelo base sin ajuste por instrucciones: no está diseñado para seguir instrucciones, mantener diálogos ni role-play.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso orquestado.
- Capacidad multilingüe limitada al inglés; el corpus y la etiqueta de idioma son `en`.
- No incluye visión, audio ni modo de razonamiento explícito (thinking mode).
- Valor principal como artefacto de investigación: checkpoints intermedios y métricas de pérdida comparables entre trayectorias.

## Casos de uso

- Análisis de trayectorias de entrenamiento: comparar `losses.csv` de esta ejecución (semilla 13) con otras semillas y esquemas de inicialización de la campaña DIET para medir varianza en la curva de pérdida y en la perplejidad de evaluación.
- Estudios de inicialización de pesos: usar la rama `step0` y las primeras ramas `stepN` para analizar cómo el esquema `pythia` (small_init + wang_init) condiciona la dinámica temprana frente a otros esquemas documentados en `src/init_schemes.py`.
- Interpretabilidad del espacio de pesos: aplicar técnicas de interpolación lineal o mode connectivity entre checkpoints de esta y otras trayectorias, aprovechando que comparten arquitectura, datos y orden de tokens.
- Reproducibilidad de recetas: validar pipelines de entrenamiento propios replicando hiperparámetros (AdamW, coseno a 3e-5, 143.000 pasos, lote 1024 × 2048) y contrastando la pérdida con la publicada.
- Investigación en mecánica interna: extraer activaciones y atención en checkpoints intermedios para estudiar la formación de circuitos o la evolución de representaciones a lo largo del preentrenamiento.
- Evaluación de metodologías de scoring: emplear el conjunto fijo de evaluación y el scorer descrito en `LOSSES.md` como referencia para calibrar métricas propias de perplejidad y accuracy.
- Docencia y experimentación con recursos limitados: el tamaño de 405 M parámetros permite ejecutar inferencia y evaluación en una única GPU consumer, útil para prácticas sobre preentrenamiento y evaluación de modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento y evaluación interna (`train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen`, `lr`) en `losses.csv`, sin valores numéricos concretos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,8 GB solo para pesos (405 M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 1,5 y 3 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4 GB de pesos; en 4 bits, alrededor de 0,2 GB, aunque no se documentan artefactos GGUF ni cuantizaciones oficiales en el repositorio.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para inferencia (por ejemplo, RTX 3050, RTX 3060, RTX 4060); para entrenamiento o evaluación completa con lotes grandes se recomienda A100, H100 o RTX 4090.
- Cabe holgadamente en GPU consumer; el cuello de botella real es el almacenamiento, ya que el repositorio ocupa 999,6 GB por la acumulación de checkpoints.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este repositorio y requerirían conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| diet-traj-pythia-410m-pythia-seed13 | 405.334.016 | no disponible | apache-2.0 | Trayectoria de preentrenamiento desde cero, semilla 13 | Hugging Face, ramas `stepN` |
| EleutherAI/pythia-410m | 410 M (aprox.) | 2048 (receta Pythia) | apache-2.0 | Modelo base Pythia de referencia con suite de checkpoints | Hugging Face |
| Otras ejecuciones de la campaña DIET | 405.334.016 | no disponible | apache-2.0 | Misma receta con distinta semilla o esquema de inicialización | Hugging Face (colección del autor) |

La comparación con modelos de propósito general de tamaño similar no resulta pertinente: este checkpoint no compite en calidad de generación o instrucción, sino en comparabilidad experimental dentro de una campaña controlada.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones, no mantiene diálogos coherentes y puede producir continuaciones degeneradas o repetitivas.
- Riesgo alto de alucinación y de contenido factualmente incorrecto, propio de un modelo preentrenado solo con objetivo de modelado de lenguaje.
- Sesgos heredados de The Pile, sin filtrado ni mitigación documentados en la model card.
- Cobertura lingüística limitada al inglés; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Repositorio de 999,6 GB: la descarga completa es inviable en la mayoría de entornos; conviene descargar solo la rama `stepN` necesaria.
- La reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks; las comparaciones deben hacerse a nivel de distribución, no de pesos exactos.
- Las filas de evaluación del checkpoint final presentan una salvedad documentada en `LOSSES.md`; deben interpretarse con cautela.
- Uso comercial permitido por la licencia apache-2.0, pero sin garantías de calidad para aplicaciones de producto; no debe desplegarse como asistente sin un ajuste posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-pythia-seed13
- Repositorio Pythia de EleutherAI: https://github.com/EleutherAI/pythia
- Modelo de referencia EleutherAI/pythia-410m: https://huggingface.co/EleutherAI/pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Paper de Pythia: https://arxiv.org/abs/2304.01373
- No se han proporcionado en la información disponible enlaces adicionales a papers, blogs, demos o repositorios de la campaña DIET.
