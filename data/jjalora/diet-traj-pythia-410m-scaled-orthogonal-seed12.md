# jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed12

## Resumen

`jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed12` es un checkpoint de investigación que reproduce desde cero el entrenamiento de Pythia-410M de EleutherAI, variando únicamente la semilla aleatoria y el esquema de inicialización de pesos. Forma parte de la campaña DIET (weight-space), cuyo objetivo es estudiar la trayectoria de entrenamiento en el espacio de pesos: cómo evolucionan los parámetros de un transformer a lo largo del preentrenamiento bajo distintas condiciones iniciales. No es un modelo pensado para uso en producción, sino un artefacto experimental para investigación en dinámica de entrenamiento, interpretabilidad y reproducibilidad.

La arquitectura es idéntica a Pythia-410M: un transformer decoder-only de la familia GPT-NeoX con 410 millones de parámetros, contexto de 2048 tokens y tokenizador GPT-NeoX. El entrenamiento sigue la receta oficial de Pythia (`pythia-410m.yml`): mismo flujo de tokens (`EleutherAI/pile-standard-pythia-preshuffled`), AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1, grad clip 1.0, cosine hasta 3e-5 durante 143.000 pasos y batch global de 1024 × 2048 tokens. La diferencia respecto a la ejecución canónica reside en el esquema de inicialización `scaled_orthogonal` (frente al `small_init + wang_init` de Pythia) y en la semilla 12.

La relevancia actual es metodológica: el repositorio publica checkpoints intermedios (ramas `stepN` para N en {0, 1, 2, 4, …, 512} y cada 100 pasos) junto con un `losses.csv` que recoge pérdida de entrenamiento y de validación recalculada de forma homogénea para todos los checkpoints de la campaña, lo que permite comparar trayectorias de forma directa. El tamaño del repositorio (917,7 GB) refleja la acumulación de todas esas revisiones en float16 safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX) |
| Parametros totales | 410 M (aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (receta Pythia) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16) |
| Libreria | transformers |
| Dataset de entrenamiento | EleutherAI/pile-standard-pythia-preshuffled |
| Semilla | 12 |
| Esquema de inicializacion | scaled_orthogonal |
| Hardware de entrenamiento | A100-PCIE-40GB, 4 nodos × 4 GPUs |
| Pasos totales | 143.000 |
| Batch global | 1024 × 2048 tokens |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPT-NeoX tal como se define en la receta `EleutherAI/pythia models/410M/pythia-410m.yml`: transformer decoder-only con atención multi-cabeza estándar y capas feed-forward, sin modificaciones estructurales respecto al Pythia-410M original. El entrenamiento se ejecutó sobre el flujo de tokens `pile-standard-pythia-preshuffled` con orden determinista (el batch *i* corresponde a las filas [i·1024, (i+1)·1024)), de modo que la secuencia de datos es idéntica a la de la ejecución de referencia. Se usó AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 (sin decay en LayerNorm ni bias), grad clip 1.0, schedule cosine hasta 3e-5, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch global de 1024 × 2048 tokens independientemente del número de GPUs. La infraestructura fue de 4 nodos con 4 A100-PCIE-40GB cada uno, micro-batch 4.

La única variación respecto a Pythia es la inicialización `scaled_orthogonal` y la semilla 12. El autor documenta que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero que el esquema `pythia` coincide con la distribución por tensor de `EleutherAI/pythia-410m` revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. Se publican checkpoints en ramas `stepN` para N en {0, 1, 2, 4, …, 512} y cada 100 pasos, con pesos en float16 safetensors; la rama `main` contiene los pesos finales. No se menciona RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la arquitectura y el corpus Pythia.
- Modelado de lenguaje y cálculo de perplejidad sobre texto en inglés.
- Extracción de representaciones internas y estados ocultos para análisis de espacio de pesos.
- Checkpoints intermedios para estudiar la evolución de pesos, activaciones y pérdida a lo largo del entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (idioma declarado: `en`).
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Investigación en dinámica de entrenamiento: comparar la trayectoria de pérdida y la evolución de pesos de esta ejecución con las demás trayectorias de la campaña DIET usando `losses.csv` como fuente homogénea de métricas.
- Estudios de inicialización: analizar el efecto del esquema `scaled_orthogonal` frente al `small_init + wang_init` de Pythia sobre la convergencia y las propiedades del espacio de pesos final.
- Reproducibilidad y auditoría: verificar que el flujo de datos y la receta coinciden con Pythia-410M, aislando el efecto de la semilla y la inicialización.
- Análisis de checkpoints intermedios: usar las ramas `stepN` para estudiar cómo emergen capacidades o representaciones en puntos concretos del preentrenamiento.
- Experimentos de interpretabilidad: extraer activaciones y estados ocultos de un modelo con receta conocida y controlada para comparaciones controladas.
- Baseline de investigación en NLP en inglés: emplear el checkpoint final como referencia de un modelo de 410 M entrenado sobre The Pile con receta estándar, sin esperar rendimiento de producción.
- Docencia y experimentación académica: disponer de una ejecución completa y documentada de un transformer pequeño para prácticas de entrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `losses.csv` con `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr` por checkpoint, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni otras tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1 GB en float16 para los 410 M de parámetros, más overhead de activaciones y contexto; en cuantización de 8 bits o 4 bits bajaría a rangos de 0,4-0,6 GB (las cuantizaciones no están publicadas en el repo, habría que generarlas).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para inferencia; para entrenamiento o evaluación completa se usaron A100-PCIE-40GB en la campaña.
- Cabe holgadamente en GPU consumer; el cuello de botella es el almacenamiento, no la VRAM, dado que el repositorio ocupa 917,7 GB por la acumulación de checkpoints.
- Opciones de despliegue: `transformers` (librería declarada), y previsiblemente llama.cpp, Ollama o vLLM previa conversión de los pesos a los formatos correspondientes (no se documenta en la model card).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| diet-traj-pythia-410m-scaled-orthogonal-seed12 | 410 M | 2048 | apache-2.0 | Hugging Face (jjalora) | Ejecución experimental con inicialización alternativa |
| EleutherAI/pythia-410m | 410 M | 2048 | apache-2.0 | Hugging Face (EleutherAI) | Modelo de referencia con receta canónica y checkpoints públicos |
| EleutherAI/pythia-160m | 160 M | 2048 | apache-2.0 | Hugging Face (EleutherAI) | Variante más pequeña de la misma familia |
| EleutherAI/pythia-1b | 1 B | 2048 | apache-2.0 | Hugging Face (EleutherAI) | Variante más grande de la misma familia |

Los datos de rendimiento comparado no están disponibles en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Solo inglés: el idioma declarado es `en`; no hay soporte multilingüe documentado.
- Riesgo de alucinación y sesgos heredados del corpus The Pile, sin fases de alineación (RLHF/DPO) documentadas.
- Sin benchmarks publicados: no se puede afirmar su rendimiento en tareas downstream sin evaluarlo.
- Repositorio de 917,7 GB: la descarga completa es costosa; conviene descargar solo la revisión o rama `stepN` necesaria.
- Reproducción bit a bit de la inicialización de EleutherAI no garantizada entre frameworks; el autor solo verifica coincidencia de distribución por tensor.
- La licencia apache-2.0 permite uso comercial, pero el carácter experimental y la falta de evaluación desaconsejan su uso en producción sin validación propia.
- `losses.csv` es la fuente autoritativa de pérdida; los `snapshot.json` de revisiones anteriores al 2026-11-18 solo registran `step`/`tokens_seen`/`lr`/`dtype`.
- Existe una advertencia del autor sobre las filas de evaluación del checkpoint final en `LOSSES.md` que conviene revisar antes de usar esos datos.

## Enlaces

- Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-scaled-orthogonal-seed12
- Repositorio Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Dataset: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Paper Pythia: https://arxiv.org/abs/2304.01373
