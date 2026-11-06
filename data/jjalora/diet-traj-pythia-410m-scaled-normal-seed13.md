# jjalora/diet-traj-pythia-410m-scaled-normal-seed13

## Resumen

`diet-traj-pythia-410m-scaled-normal-seed13` es un checkpoint de investigación publicado por el usuario `jjalora` dentro de la campaña DIET de estudio del espacio de pesos. No es un modelo nuevo en el sentido funcional: es una reproducción desde cero de Pythia-410M de EleutherAI, entrenada con la receta abierta oficial (`models/410M/pythia-410m.yml`) y sobre el mismo flujo de tokens (`EleutherAI/pile-standard-pythia-preshuffled`), variando únicamente la semilla aleatoria (13) y el esquema de inicialización de pesos (`scaled_normal`).

El interés del artefacto es metodológico: permite comparar trayectorias de entrenamiento en el espacio de pesos bajo condiciones controladas, algo útil para investigación sobre dinámica de entrenamiento, inicialización y reproducibilidad. La arquitectura es GPT-NeoX (transformer decoder-only) con 410 millones de parámetros y contexto de 2048 tokens, idéntica a Pythia-410M.

Su relevancia es limitada para uso en producción: no hay benchmarks publicados, no hay pipeline declarado y el modelo está pensado como material de estudio, no como un asistente listo para desplegar. La licencia Apache 2.0 facilita su reutilización, pero la calidad funcional debe validarse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX) |
| Parametros totales | 410 M (heredado de Pythia-410M; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (receta Pythia-410M; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16), ramas `stepN` con pesos y `main` con pesos finales |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M: un transformer decoder-only de la familia GPT-NeoX, con la misma configuración de capas, cabezas y dimensiones que el modelo original de EleutherAI. El entrenamiento sigue la receta abierta de Pythia: AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni bias, grad clip 1.0, schedule coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch global de 1024 × 2048 tokens.

Los datos son el flujo `EleutherAI/pile-standard-pythia-preshuffled`, con el mismo orden de batches que la receta original (batch *i* = filas [i·1024, (i+1)·1024)). La única variación respecto a Pythia-410M es la semilla (13) y el esquema de inicialización `scaled_normal`, distinto del `small_init + wang_init` de GPT-NeoX. El autor documenta que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, y que el esquema `pythia` iguala la distribución por tensor del checkpoint `step0` de `EleutherAI/pythia-410m`, verificado en `tests/test_pythia_step0_init_match.py`. El entrenamiento se ejecutó en 4 nodos con 4 GPU A100-PCIE-40GB por nodo (job 964645, commit `92f9aed`).

## Capacidades

- Generación de texto autoregresiva en inglés, con el mismo perfil que Pythia-410M.
- Razonamiento y conocimiento factual limitado por el tamaño (410 M) y por el corpus Pile.
- Generación de código y matemáticas básicas, sin garantías de calidad sin evaluación.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües: solo inglés declarado.
- Sin modo thinking, visión ni audio.
- Checkpoints intermedios en ramas `stepN` (N en {0, 1, 2, 4, …, 512} y cada 100 pasos) útiles para estudiar la evolución de representaciones.

## Casos de uso

- Investigación en dinámica de entrenamiento: comparar la trayectoria de pesos de esta semilla con otras semillas o esquemas de inicialización de la campaña DIET para estudiar estabilidad y convergencia.
- Reproducibilidad de recetas: validar que la receta Pythia se reproduce con variaciones controladas de semilla e inicialización sobre el mismo flujo de datos.
- Análisis de espacio de pesos: estudiar interpolaciones, simetrías y distancias entre checkpoints `stepN` para entender la geometría del entrenamiento.
- Extracción de representaciones internas: usar los checkpoints intermedios para analizar cómo emergen capacidades lingüísticas a lo largo del entrenamiento.
- Baseline controlado en experimentos de interpretabilidad: al compartir arquitectura y datos con Pythia-410M, sirve como control frente al modelo oficial.
- Fine-tuning académico de bajo coste: con 410 M y licencia Apache 2.0, es viable ajustarlo en una sola GPU consumer para tareas de clasificación o generación acotada.
- Evaluación de esquemas de inicialización: comparar `scaled_normal` frente a `small_init + wang_init` en métricas de convergencia y calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,8-1 GB de pesos, más overhead de activaciones y KV cache; con contexto completo de 2048 tokens y batch pequeño, el consumo típico ronda 2-4 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,5 GB de pesos; en 4 bits, en torno a 0,3 GB (estimaciones por tamaño, no verificadas en este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con contexto completo; A100, H100 o RTX 4090 sobran para este tamaño.
- Cabe en GPU consumer: sí, en GTX 1660 6 GB, RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `transformers` (librería declarada), y previsiblemente llama.cpp, Ollama o vLLM tras conversión a los formatos correspondientes, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-scaled-normal-seed13` | 410 M | 2048 (receta Pythia) | Apache 2.0 | Reproducción con semilla 13 e init `scaled_normal`; sin benchmarks publicados |
| `EleutherAI/pythia-410m` | 410 M | 2048 | Apache 2.0 | Modelo de referencia de la receta; checkpoints `stepN` oficiales; benchmarks publicados por EleutherAI |
| `EleutherAI/pythia-160m` | 160 M | 2048 | Apache 2.0 | Versión más pequeña de la misma familia, útil como baseline de coste |
| `TinyLlama/TinyLlama-1.1B` | 1,1 B | 2048 | Apache 2.0 | Alternativa de tamaño superior con entrenamiento en 3 T tokens; no directamente comparable en escala |

## Limitaciones y advertencias

- Modelo de investigación: no hay benchmarks ni evaluación de calidad publicados; el rendimiento funcional debe medirse antes de cualquier uso.
- Entrenado solo en inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Sesgos heredados del corpus Pile: sesgos de género, raza, religión y políticos presentes en los datos de entrenamiento.
- Riesgo de alucinación alto por tamaño reducido (410 M) y por ausencia de RLHF/DPO documentado.
- Contexto limitado a 2048 tokens según la receta; no se documenta extensión.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento explícito.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo no está validada para producción.
- El repositorio ocupa 4,9 GB por acumulación de checkpoints en ramas; conviene descargar solo la rama necesaria.
- La reproducibilidad bit a bit respecto a Pythia-410M no está garantizada; solo se valida la coincidencia distribucional en `step0`.

## Enlaces

- Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-scaled-normal-seed13
- Repositorio de referencia Pythia: https://github.com/EleutherAI/pythia
- Dataset: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Paper Pythia: https://arxiv.org/abs/2304.01373
