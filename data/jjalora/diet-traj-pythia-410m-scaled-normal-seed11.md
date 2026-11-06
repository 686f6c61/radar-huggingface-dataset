# jjalora/diet-traj-pythia-410m-scaled-normal-seed11

## Resumen

`jjalora/diet-traj-pythia-410m-scaled-normal-seed11` es un checkpoint de investigación publicado en Hugging Face por el usuario jjalora dentro de la campaña de espacio de pesos denominada DIET. No es un modelo pensado para uso productivo, sino una reproducción desde cero del receta de preentrenamiento de Pythia-410M de EleutherAI, en la que únicamente varían la semilla aleatoria (seed 11) y el esquema de inicialización de pesos (`scaled_normal`, en lugar del `small_init` + `wang_init` que usa Pythia). El objetivo es estudiar trayectorias de entrenamiento y la influencia de la inicialización en el espacio de pesos.

El modelo emplea la arquitectura GPT-NeoX (transformer decoder-only) con 405.334.016 parámetros reales según los safetensors, muy próximo a los 410M nominales de Pythia. Se entrena sobre el mismo flujo de tokens y en el mismo orden que Pythia (`EleutherAI/pile-standard-pythia-preshuffled`), con AdamW, learning rate 3e-4, cosine decay hasta 3e-5 durante 143.000 pasos y batch global de 1024 secuencias de 2048 tokens.

Su relevancia es metodológica: permite comparar cómo distintas inicializaciones y semillas afectan a la dinámica de entrenamiento manteniendo constante todo lo demás (datos, hiperparámetros, arquitectura). El repositorio incluye checkpoints intermedios en ramas `stepN` (0, 1, 2, 4, …, 512 y cada 100 pasos), lo que lo hace útil para investigación en interpretabilidad y análisis de trayectorias. El tamaño del repo (1167,4 GB) refleja la acumulación de todos esos checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 405.334.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Pythia-410M usa 2048 tokens en su receta original) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia GPT-NeoX, con la misma arquitectura que Pythia-410M: capas con atención multi-cabeza, activación GeLU y normalización LayerNorm, según la receta `EleutherAI/pythia models/410M/pythia-410m.yml`. La única diferencia respecto a Pythia es la semilla (11) y el esquema de inicialización `scaled_normal`, documentado en `src/init_schemes.py` del código de entrenamiento. El autor indica que no es posible reproducir bit a bit la RNG de inicialización de EleutherAI entre frameworks, pero que el esquema `pythia` coincide en distribución por tensor con `EleutherAI/pythia-410m` revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`.

El entrenamiento sigue fielmente la receta abierta de Pythia: flujo de tokens `EleutherAI/pile-standard-pythia-preshuffled` con orden fijo (batch *i* = filas [i·1024, (i+1)·1024)), AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni bias, grad clip 1.0, cosine hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch global de 1024 × 2048 tokens independientemente del número de GPUs. La ejecución se realizó en el clúster "wheat" con 8 nodos de 4× A100-PCIE-40GB, micro-batch 4, commit `38b911a` y job `383971` iniciado el 2026-10-23.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la arquitectura y datos de Pythia-410M.
- Checkpoints intermedios de trayectoria: ramas `stepN` para N en {0, 1, 2, 4, …, 512} y cada 100 pasos, útiles para análisis de evolución del modelo.
- Reproducibilidad controlada: misma secuencia de datos e hiperparámetros que Pythia, variando solo semilla e inicialización.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso más allá de las inherentes a un modelo base de 410M.
- No se documentan capacidades multimodales (visión, audio) ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en espacio de pesos: comparar la trayectoria de entrenamiento de este run con la de Pythia-410M original para estudiar cómo la inicialización y la semilla afectan a la convergencia y a las representaciones internas.
- Análisis de interpretabilidad: usar los checkpoints intermedios (`stepN`) para estudiar la formación de circuitos, atención y features a lo largo del entrenamiento, aprovechando la granularidad de los puntos de control.
- Estudios de reproducibilidad: replicar experimentos de Pythia con una inicialización alternativa manteniendo constante el flujo de datos, lo que permite aislar el efecto de la inicialización.
- Benchmarking de metodologías de análisis de trayectorias: servir como sujeto de prueba para técnicas de comparación de pesos (weight-space alignment, model merging, linear mode connectivity).
- Docencia y divulgación: ejemplo práctico de receta de preentrenamiento abierta con hiperparámetros y procedencia documentados (`campaign.json`), útil para formar a investigadores noveles.
- Base para experimentos de fine-tuning controlado: al ser un modelo base pequeño (405M parámetros) entrenado de forma reproducible, sirve como punto de partida para estudiar el efecto de la inicialización en tareas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,8 GB solo para pesos (405M × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp32: aproximadamente 1,6 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16; A100-PCIE-40GB fue el hardware de entrenamiento (8 nodos × 4 GPUs).
- Cabe en GPU de consumo: sí, en GTX 1660, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documentan GGUF ni llama.cpp en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| diet-traj-pythia-410m-scaled-normal-seed11 | 405.334.016 | no disponible (receta Pythia: 2048) | apache-2.0 | Hugging Face | Run de investigación con inicialización y semilla alternativas |
| EleutherAI/pythia-410m | ~410M | 2048 | apache-2.0 | Hugging Face | Modelo de referencia del que deriva la receta; incluye checkpoints intermedios |
| EleutherAI/pythia-160m | ~160M | 2048 | apache-2.0 | Hugging Face | Alternativa más pequeña de la misma familia |
| EleutherAI/pythia-1b | ~1B | 2048 | apache-2.0 | Hugging Face | Alternativa mayor de la misma familia |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado ni validado para uso en producción; su interés es metodológico.
- Entrenado exclusivamente en inglés (`EleutherAI/pile-standard-pythia-preshuffled`), con capacidad multilingüe muy limitada.
- Riesgo de alucinación y de generar contenido sesgado o tóxico, heredado de los datos de The Pile y de un modelo base sin alineamiento (no se documenta RLHF ni DPO).
- No se documentan evaluaciones de seguridad ni de sesgo en la información proporcionada.
- La longitud de contexto no se especifica en la model card; la receta Pythia-410M original emplea 2048 tokens, pero no se confirma explícitamente para este run.
- El repositorio ocupa 1167,4 GB por la acumulación de checkpoints intermedios, lo que puede dificultar su descarga y almacenamiento.
- Licencia apache-2.0 permite uso comercial, pero el modelo no ha sido validado para ello y su calidad como base de 410M es limitada.
- La reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks; solo se garantiza coincidencia en distribución por tensor.

## Enlaces

- Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-scaled-normal-seed11
- Repositorio de Pythia (receta de referencia): https://github.com/EleutherAI/pythia
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Modelo de referencia Pythia-410M: https://huggingface.co/EleutherAI/pythia-410m
