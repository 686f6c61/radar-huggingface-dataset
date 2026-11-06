# jjalora/diet-traj-pythia-410m-pythia-seed14

## Resumen

`diet-traj-pythia-410m-pythia-seed14` es un checkpoint de investigación publicado por el usuario jjalora dentro de la campaña DIET (weight-space), cuyo objetivo es estudiar la reproducibilidad y la trayectoria de entrenamiento en el espacio de pesos de modelos transformer. Se trata de un reentrenamiento desde cero de la arquitectura Pythia-410M de EleutherAI, siguiendo estrictamente la receta abierta original (`models/410M/pythia-410m.yml`), con idéntico flujo de tokens y orden de datos, y variando únicamente la semilla aleatoria (seed 14) y, opcionalmente, el esquema de inicialización de pesos.

El modelo emplea la arquitectura GPT-NeoX (transformer decoder-only) con 410 millones de parámetros y un contexto de 2048 tokens, entrenado sobre el dataset Pile en su versión preshuffled de EleutherAI. Su relevancia es fundamentalmente metodológica: permite comparar trayectorias de entrenamiento entre ejecuciones con distintas semillas, analizar la estabilidad del entrenamiento y estudiar cómo la inicialización afecta al resultado final, todo ello con una receta totalmente documentada y reproducible a nivel de distribución de pesos.

No está pensado como un modelo de producción para aplicaciones de usuario final, sino como material de investigación para quienes trabajan en interpretabilidad, dinámica de entrenamiento o reproducibilidad de modelos. La licencia Apache 2.0 facilita su uso y modificación, y los checkpoints intermedios (ramas `stepN`) permiten analizar la evolución del modelo a lo largo del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 410 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16), ramas `stepN` con pesos únicamente |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia GPT-NeoX, con la misma configuración que `EleutherAI/pythia-410m`: 24 capas, dimensión oculta de 1024, 16 cabezas de atención y contexto de 2048 tokens. El entrenamiento sigue la receta Pythia al detalle: AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 (sin decaimiento en LayerNorm ni bias), grad clipping 1.0, scheduler coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch global de 1024 × 2048 tokens independientemente del número de GPUs.

Los datos provienen de `EleutherAI/pile-standard-pythia-preshuffled`, con el mismo orden de batches que la receta original (batch *i* = filas [i·1024, (i+1)·1024)). La única variación respecto a Pythia es la semilla (14) y el esquema de inicialización (`pythia`, que corresponde a small_init + wang_init de GPT-NeoX). El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero el esquema `pythia` iguala la distribución por tensor de `EleutherAI/pythia-410m` en la revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. El entrenamiento se ejecutó en 4 nodos con 4 GPUs A100-PCIE-40GB cada uno, con micro-batch 4, según el `campaign.json` de procedencia.

## Capacidades

- Generación de texto en inglés, con las capacidades propias de un modelo Pythia-410M de la misma receta.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por su tamaño de 410 M.
- Generación de código y matemáticas elementales, sin garantías de calidad en tareas complejas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso específicamente entrenadas.
- Capacidades multilingües limitadas al inglés, según la model card.
- No incluye modo thinking, visión ni audio.
- Aporta valor como objeto de estudio: checkpoints intermedios (`stepN`) para analizar la trayectoria de entrenamiento y la evolución de representaciones.

## Casos de uso

- Estudio de reproducibilidad en el espacio de pesos: comparar este checkpoint (seed 14) con otras ejecuciones de la campaña DIET para medir la variabilidad inducida por la semilla y la inicialización en el resultado final del entrenamiento.
- Investigación en interpretabilidad: usar los checkpoints intermedios de las ramas `stepN` para analizar cómo evolucionan las representaciones internas y las circuitos a lo largo del entrenamiento, con la ventaja de disponer de una receta idéntica y controlada.
- Análisis de dinámica de entrenamiento: estudiar curvas de pérdida, normas de gradiente o espectros de pesos entre ejecuciones con distintas semillas para caracterizar la estabilidad del entrenamiento Pythia.
- Baseline controlado en experimentos de inicialización: comparar el esquema `pythia` con otros esquemas documentados en `src/init_schemes.py` manteniendo constantes datos, hiperparámetros y orden de tokens.
- Docencia y formación: ilustrar un pipeline completo de preentrenamiento reproducible con receta abierta, datos públicos y checkpoints intermedios.
- Validación de infraestructura de entrenamiento: usar la receta y el flujo de datos como referencia para verificar que un clúster reproduce las condiciones de la campaña original (batch global, orden de tokens, precisión mixta).
- Experimentos de ajuste fino controlado: partir de un checkpoint con procedencia documentada para tareas downstream en inglés donde se quiera aislar el efecto de la semilla del preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1 GB para los pesos (410 M × 2 bytes), más overhead de activaciones y caché KV para contexto de 2048 tokens.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,5 GB de pesos; en 4 bits, en torno a 0,25 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para inferencia; para reentrenamiento se usaron A100-PCIE-40GB en la campaña original.
- Cabe holgadamente en GPU consumer, incluidas GPUs de gama media con 8 GB o menos.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de conversión a GGUF para llama.cpp u Ollama y de servir con vLLM o TGI, aunque no hay configuraciones publicadas por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-pythia-seed14` | 410 M | 2048 | Apache 2.0 | Hugging Face (0 descargas) | Reentrenamiento con seed 14, checkpoints intermedios |
| `EleutherAI/pythia-410m` | 410 M | 2048 | Apache 2.0 | Hugging Face (ampliamente usado) | Modelo original de referencia, misma receta |
| `EleutherAI/pythia-410m-deduped` | 410 M | 2048 | Apache 2.0 | Hugging Face | Variante con dataset Pile deduplicado |
| `TinyLlama/TinyLlama-1.1B` | 1,1 B | 2048 | Apache 2.0 | Hugging Face | Alternativa de mayor tamaño, no directamente comparable en escala |

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en Hugging Face; no hay evidencia de uso en producción ni validación externa.
- Entrenado exclusivamente en inglés; el rendimiento en otros idiomas será deficiente.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, propio de un modelo de 410 M sin ajuste por RLHF documentado.
- Sesgos heredados del dataset Pile, que no ha sido filtrado ni auditado en esta ejecución más allá de la receta original.
- No se han publicado evaluaciones de benchmarks para este checkpoint concreto; no debe asumirse que iguala el rendimiento de `EleutherAI/pythia-410m` más allá de la coincidencia de receta.
- La reproducción bit a bit de la inicialización original no es posible entre frameworks; el autor solo garantiza coincidencia de distribución por tensor.
- Los checkpoints intermedios se publican solo con pesos (float16 safetensors), sin estados de optimizador, lo que limita reanudar el entrenamiento exactamente donde se dejó.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está diseñado ni validado para aplicaciones comerciales; su uso en producción requeriría evaluación adicional.
- El tamaño del repositorio (8,9 GB) refleja la multiplicidad de checkpoints, lo que puede complicar su descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-pythia-seed14
- Receta original Pythia: https://github.com/EleutherAI/pythia (archivo `models/410M/pythia-410m.yml`)
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Código de esquemas de inicialización: `src/init_schemes.py` del repositorio de entrenamiento de la campaña DIET (no se proporciona URL directa en la información disponible)
