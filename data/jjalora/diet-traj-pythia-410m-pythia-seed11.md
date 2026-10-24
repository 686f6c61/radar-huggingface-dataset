# jjalora/diet-traj-pythia-410m-pythia-seed11

## Resumen

`jjalora/diet-traj-pythia-410m-pythia-seed11` es un checkpoint de investigación, no un modelo conversacional. Se trata de una ejecución completa de preentrenamiento desde cero de la arquitectura Pythia-410M, realizada dentro de la campaña de espacio de pesos denominada DIET. El autor reproduce la receta oficial de EleutherAI (`models/410M/pythia-410m.yml`) cambiando únicamente dos variables: la semilla aleatoria (11) y el esquema de inicialización de pesos (`pythia`, es decir, `small_init` + `wang_init` propios de GPT-NeoX).

El interés del artefacto es que permite comparar trayectorias de entrenamiento: mismo flujo de tokens, mismo orden de batches y mismos hiperparámetros que Pythia-410M, de modo que las diferencias observadas en los pesos finales o intermedios son atribuibles a la semilla y a la inicialización. El repositorio publica checkpoints intermedios en ramas `stepN` (potencias de dos desde 0 hasta 512, más uno cada 100 pasos) en safetensors float16, y los pesos finales en `main` una vez completada la ejecución.

Es relevante ahora porque la comunidad de interpretabilidad y de estudio de dinámica de entrenamiento necesita réplicas controladas de modelos abiertos con checkpoints densos. Pythia es la suite de referencia para ese fin, y este repositorio añade una réplica independiente con trazabilidad completa de procedencia (`campaign.json`). Con 410 millones de parámetros y contexto de 2.048 tokens, está pensado para análisis, no para despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-NeoX (`gpt_neox` en transformers), receta Pythia-410M |
| Parametros totales | 410M (según nomenclatura de la receta Pythia-410M; recuento exacto no disponible en la información proporcionada) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2.048 tokens (longitud de secuencia del entrenamiento: `world_batch` 1024 × 2048 tokens) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales. Pesos en float16; convertibles a GGUF/8-bit/4-bit con herramientas externas (llama.cpp, bitsandbytes, GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors float16 (solo pesos, sin optimizador), un checkpoint por rama |
| Dataset de entrenamiento | `EleutherAI/pile-standard-pythia-preshuffled` |
| Semilla | 11 |
| Esquema de inicialización | `pythia` (small_init + wang_init de GPT-NeoX) |
| Pasos de entrenamiento | 143.000 |
| Tamaño del repo | 102,1 GB (incluye múltiples ramas de checkpoints) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M: un transformer decoder-only con atención causal, implementado como `GPTNeoXForCausalLM`. No hay innovaciones de arquitectura respecto al modelo original; el valor está en la fidelidad de la receta. El entrenamiento usa AdamW con lr 3e-4, betas (0,9; 0,95), weight decay 0,1 sin decaimiento en LayerNorm ni bias, gradient clipping 1,0 y scheduler coseno de 3e-4 a 3e-5 durante 143.000 pasos, con 1.430 pasos de warmup. Se empleó autocast fp16 con pesos maestros en fp32.

El flujo de datos es idéntico al de Pythia: `pile-standard-pythia-preshuffled`, donde el batch *i* corresponde a las filas [i·1024, (i+1)·1024). Con `world_batch` de 1024 secuencias de 2.048 tokens, cada paso consume 2.097.152 tokens, lo que arroja aproximadamente 300.000 millones de tokens vistos a lo largo de los 143.000 pasos (cálculo derivado de los datos de la model card). El entrenamiento se ejecutó en el clúster `wheat` sobre 8 nodos con 4 × A100-PCIE-40GB cada uno (32 GPU en total), con micro-batch 4 y commit `06ae800`; el job `383968` arrancó el 2026-10-23.

La innovación metodológica es la reproducibilidad controlada: el autor documenta que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, y en su lugar verifica que el esquema `pythia` iguala la *distribución* por tensor de `EleutherAI/pythia-410m` revisión `step0` mediante el test `tests/test_pythia_step0_init_match.py`. No se documenta RLHF, DPO ni ajuste por instrucciones: es un modelo base.

## Capacidades

- Modelo de lenguaje autorregresivo para continuación de texto y modelado de probabilidad del siguiente token.
- Capacidad de *scoring* y evaluación de perplejidad sobre corpus en inglés, al estar entrenado sobre The Pile.
- Checkpoints intermedios densos que permiten estudiar la evolución de representaciones, circuitos y pesos a lo largo del entrenamiento.
- Reproducción controlada de la receta Pythia, útil para comparar efectos de semilla e inicialización.
- No dispone de ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Sin soporte documentado de tool calling ni function calling.
- Sin modo de razonamiento explícito (*thinking*), sin capacidades de visión ni audio.
- Multilingüismo limitado al inglés; no se documenta entrenamiento en otras lenguas.
- Compatible con `endpoints_compatible` y con la librería `transformers`.

## Casos de uso

- **Investigación en interpretabilidad:** cargar la rama `stepN` deseada y aplicar técnicas de probing, análisis de atención o *circuit discovery* sobre un modelo de 410M con linaje de entrenamiento conocido y controlado.
- **Estudio de dinámica de entrenamiento en el espacio de pesos:** comparar los checkpoints de esta ejecución (semilla 11) con los de otras semillas de la campaña DIET para aislar cuánta varianza introduce la inicialización frente a la semilla en etapas tempranas (step 0, 1, 2, 4…).
- **Validación de esquemas de inicialización:** usar el test de coincidencia distribucional con `pythia-410m` revisión `step0` como banco de pruebas para verificar que una implementación propia de `small_init`/`wang_init` es correcta.
- **Reproducción de resultados de scaling laws:** al compartir flujo de tokens y orden de batches con Pythia, sirve como réplica independiente para contrastar conclusiones publicadas sobre el modelo original.
- **Punto de partida para *fine-tuning* ligero:** con 410M parámetros y licencia Apache 2.0, es viable ajustarlo en una sola GPU consumer para tareas de clasificación o extracción sobre texto en inglés, partiendo de un modelo base bien documentado.
- **Docencia y prácticas de entrenamiento distribuido:** la model card documenta la configuración completa (DDP sobre 32 GPU, micro-batch 4, grad accumulation implícita hasta 1024 secuencias) y el `campaign.json` de procedencia, lo que lo convierte en material didáctico realista.
- **Línea base en experimentos de destilación o poda:** al ser un modelo pequeño con receta pública, sirve como referencia cuantitativa (perplejidad, pérdida) frente a variantes comprimidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, LAMBADA ni perplejidad final. Tampoco se proporcionan curvas de pérdida ni métricas de convergencia para esta ejecución concreta.

| Benchmark | Este modelo | Referencia Pythia-410M | Notas |
|---|---|---|---|
| MMLU | No disponible | No disponible en la información proporcionada | — |
| HumanEval | No disponible | No disponible en la información proporcionada | — |
| GSM8K | No disponible | No disponible en la información proporcionada | — |
| Perplejidad en The Pile | No disponible | No disponible en la información proporcionada | — |

## Requisitos de hardware

- **VRAM para inferencia (pesos):** ~0,8 GB en fp16, ~1,6 GB en fp32, ~0,4 GB en int8 y ~0,25 GB en 4-bit. El repositorio publica únicamente float16.
- **VRAM con caché KV:** para 2.048 tokens de contexto el coste adicional es reducido; una estimación conservadora sitúa el total por debajo de 2 GB en fp16 para una sola secuencia.
- **GPU recomendadas:** cualquier GPU consumer moderna sirve. RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o superiores trabajan con margen amplio, incluso con batches grandes. A100/H100 solo tienen sentido para servir muchas peticiones concurrentes.
- **CPU:** la inferencia en CPU es viable con cuantización (GGUF q4/q8) a velocidades del orden de decenas de tokens por segundo en hardware de escritorio; no se dispone de cifras medidas para este checkpoint.
- **Entrenamiento (referencia del autor):** 8 nodos × 4 A100-PCIE-40GB = 32 GPU, micro-batch 4, `world_batch` 1024 × 2048 tokens.
- **Opciones de despliegue:** `transformers` (soporte nativo, es la librería declarada), vLLM y TGI para serving con throughput alto, llama.cpp/Ollama tras conversión a GGUF, y `text-generation-inference` para endpoints HTTP.
- **Latencia y throughput:** no disponibles; no se han publicado mediciones para este artefacto.
- **Advertencia de descarga:** el repo ocupa 102,1 GB y contiene numerosas ramas de checkpoint. Conviene descargar una única revisión (`main` o un `stepN` concreto) con `huggingface-cli download --revision stepN` en lugar de clonar el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-pythia-seed11` | 410M | 2.048 | Apache 2.0 | HuggingFace, checkpoints por rama | Réplica de la receta Pythia con semilla 11; sin benchmarks publicados |
| `EleutherAI/pythia-410m` | 410M | 2.048 | Apache 2.0 | HuggingFace, checkpoints step0–step143000 | Modelo de referencia de la suite Pythia, ampliamente evaluado en la literatura |
| `EleutherAI/pythia-410m-deduped` | 410M | 2.048 | Apache 2.0 | HuggingFace, checkpoints por paso | Idéntico pero entrenado sobre The Pile deduplicado globalmente; receta distinta en datos |
| `EleutherAI/pythia-160m` | 160M | 2.048 | Apache 2.0 | HuggingFace | Alternativa más ligera de la misma suite, útil si el presupuesto de cómputo es mínimo |

La comparación de rendimiento entre estas variantes no puede establecerse con la información disponible: no se han publicado métricas de benchmarks para el modelo de este repositorio. La diferencia verificable frente a `EleutherAI/pythia-410m` es metodológica (semilla e implementación del inicializador), no de escala ni de datos.

## Limitaciones y advertencias

- **No es un modelo de instrucciones:** al no haber pasado por RLHF, DPO ni SFT, no debe usarse como asistente conversacional sin un ajuste previo. Ignorará o malinterpretará instrucciones complejas.
- **Riesgo de alucinación:** como cualquier modelo base de 410M entrenado sobre The Pile, genera texto plausible sin garantía de veracidad y puede reproducir afirmaciones falsas con fluidez.
- **Sesgos heredados del corpus:** The Pile contiene texto web, código y foros con sesgos sociales, de género, raza y religión. No se documenta ningún proceso de mitigación en esta ejecución.
- **Idioma:** solo inglés. El rendimiento en castellano será claramente deficiente y no está evaluado.
- **Contexto limitado:** 2.048 tokens. No admite documentos largos ni conversaciones multi-turno extensas sin truncado.
- **Escala reducida:** 410M parámetros implican capacidad factual y de razonamiento muy inferior a modelos de varios miles de millones; no es adecuado para tareas que exijan conocimiento enciclopédico preciso.
- **Reproducibilidad no bit a bit:** el propio autor advierte de que la coincidencia exacta del RNG de inicialización con EleutherAI no es posible entre frameworks; solo se garantiza la coincidencia distribucional por tensor.
- **Estado del repositorio:** las descargas y likes son 0 y las fechas de creación son posteriores a la mayoría de referencias públicas de Pythia; conviene verificar que `main` contiene los pesos finales antes de asumir que la ejecución está completa.
- **Coste de descarga:** 102,1 GB de repositorio. Descargar todo el árbol es innecesario y puede agotar el almacenamiento local.
- **Licencia:** Apache 2.0 permite uso comercial y modificaciones, pero no exime de cumplir las condiciones del corpus subyacente ni de atribuir correctamente. No se ofrece garantía alguna por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jjalora/diet-traj-pythia-410m-pythia-seed11
- Repositorio de Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Receta de entrenamiento Pythia-410M: https://github.com/EleutherAI/pythia/blob/main/models/410M/pythia-410m.yml
- Variante deduplicada de la receta: https://github.com/EleutherAI/pythia/blob/main/models/410M/pythia-410m-deduped.yml
- Modelo de referencia `EleutherAI/pythia-410m`: https://huggingface.co/EleutherAI/pythia-410m
- Modelo de referencia `EleutherAI/pythia-410m-v0`: https://huggingface.co/EleutherAI/pythia-410m-v0
- Dataset `EleutherAI/pile-standard-pythia-preshuffled`: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
