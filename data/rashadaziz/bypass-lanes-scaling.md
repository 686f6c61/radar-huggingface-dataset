# rashadaziz/bypass-lanes-scaling

## Resumen

Bypass Lanes es un proyecto de investigación sobre arquitecturas de transformer que introduce una modificación estructural en el flujo residual: se reservan las últimas `k` dimensiones del residual stream como un "carril" (lane) al que las capas intermedias protegidas (de la 2 a la 9) pueden leer pero no escribir. El objetivo es que la información depositada por las capas tempranas llegue intacta a las capas tardías, y el presupuesto de pesos ahorrado por no escribir en el carril se reinvierte en una MLP más ancha. El repositorio publicado contiene los 12 runs de escalado (3 anchuras × 4 configuraciones de carril) entrenados desde cero con una única semilla.

Cada modelo es un GPT de 12 capas y contexto de 1024 tokens, entrenado sobre FineWeb-Edu `sample-10BT`, con tres escalones de anchura: S (384, 40,6M parámetros), M (576, 76,8M) y L (768, 123,6M). Los resultados reportados muestran mejoras de validación loss frente al baseline `k=0` en todos los escalones, con gaps que van de −0,0072 a −0,0286 nats.

Es relevante ahora como experimento reproducible de arquitectura a pequeña escala: permite estudiar si una restricción de escritura en el residual stream mejora la eficiencia de parámetros sin cambiar el coste computacional. No es un modelo listo para producción, sino un conjunto de checkpoints de investigación con un `model.py` externo necesario para cargarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT, 12 capas, con "bypass lanes" en el residual stream (capas 2 a 9 protegidas) |
| Parametros totales | 40,6M (S), 76,8M (M), 123,6M (L) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch pickle (`ckpt.pt` con `{"model": state_dict, "config": GPTConfig fields}`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La innovación central es la reserva de las últimas `k` dimensiones del residual stream como carril protegido. Las capas 2 a 9 pueden leer ese carril pero no escribir en él, de modo que lo que las capas tempranas depositan allí llega sin modificar a las capas tardías. El presupuesto de pesos que se ahorra al no escribir en el carril se reinvierte en una MLP más ancha, con dimensión oculta `h = (8d² + dk) / (2d − k)`. Dentro de cada escalón, todos los modelos tienen el mismo número de parámetros y los mismos FLOPs de entrenamiento que su baseline (`k = 0`), lo que permite comparaciones controladas.

El entrenamiento usa FineWeb-Edu `sample-10BT` con tokenizador GPT-2 BPE (vocabulario ampliado a 50.304), aproximadamente 20 tokens por parámetro, sin dropout. La optimización emplea AdamW (β₂ = 0,99, weight decay 0,1), batch de 32 × 1024 tokens, learning rate pico 6e-4 con 2.000 pasos de warmup y decaimiento coseno hasta 6e-5, grad clip 1,0, bf16 y `torch.compile`. Cada run se entrenó en una única A100 de 40 GB. La validación usa 50 batches de 32 × 1024 tokens extraídos de 5M tokens reservados. Las cabezas de atención son 6 (S), 9 (M) y 12 (L).

## Capacidades

- Modelado de lenguaje autoregresivo en inglés: predicción de siguiente token sobre texto de FineWeb-Edu.
- Generación de texto básica a partir de los checkpoints entrenados (12 capas, contexto 1024).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni razonamiento multi-paso.
- Multilingüe: no; solo inglés según la model card.
- No incluye modo thinking, visión ni audio.
- Su función principal es servir como artefacto de investigación para estudiar el efecto de los bypass lanes sobre la pérdida de validación.

## Casos de uso

- Investigación en arquitecturas de transformer: comparar el baseline `k=0` con las variantes `k=1/6`, `k=1/3` y `k=1/2` de anchura para reproducir los gaps de validación reportados (−0,0072 a −0,0286 nats).
- Estudio de eficiencia de parámetros: al mantener constantes parámetros y FLOPs por escalón, permite aislar el efecto de la restricción de escritura en el residual stream sin confundirlo con cambios de tamaño.
- Ablación de profundidad protegida: modificar qué capas quedan protegidas (por defecto 2 a 9) y medir el impacto sobre la pérdida, usando los scripts de entrenamiento del proyecto.
- Reproducción de experimentos a pequeña escala: los tres escalones (40,6M, 76,8M y 123,6M) caben en una sola A100 de 40 GB, lo que facilita replicar los runs.
- Análisis de dinámica del residual stream: instrumentar el carril para estudiar qué información transportan las capas tempranas a las tardías sin interferencia.
- Docencia y formación: ejemplo concreto y acotado de modificación arquitectónica con presupuesto de parámetros controlado.

## Benchmarks y rendimiento

Resultados de pérdida de validación (nats) al final del entrenamiento. El gap es lanes menos baseline en el mismo escalón; negativo indica mejora.

| Escalón | Anchura | Params | Pasos | FLOPs de entrenamiento | Baseline | k = 1/6 anchura | k = 1/3 anchura | k = 1/2 anchura |
|---|---|---|---|---|---|---|---|---|
| S | 384 | 40,6M | 25k | 2,46e17 | 3,5935 | 3,5805 (−0,0131), k=64 | 3,5863 (−0,0072), k=128 | 3,5817 (−0,0118), k=192 |
| M | 576 | 76,8M | 47k | 8,40e17 | 3,3575 | 3,3354 (−0,0220), k=96 | 3,3289 (−0,0286), k=192 | 3,3292 (−0,0283), k=288 |
| L | 768 | 123,6M | 75k | 2,10e18 | 3,1830 | 3,1703 (−0,0127), k=128 | 3,1692 (−0,0138), k=256 | 3,1692 (−0,0137), k=384 |

Todos los runs usan una única semilla (1); el autor advierte que los gaps de pocas milésimas de nat deben interpretarse con cautela. No se reportan resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamaño (40,6M a 123,6M parámetros en bf16), los checkpoints ocupan del orden de 80 MB a 250 MB, por lo que caben en cualquier GPU consumer.
- GPU recomendadas: cualquiera con suficiente memoria para el checkpoint y el contexto de 1024 tokens; los runs se entrenaron en una A100 de 40 GB.
- Cabe en GPU consumer: sí, con amplio margen (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI; la carga requiere el `model.py` del proyecto (define `GPTConfig` y `GPT`) y `torch.load`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bypass Lanes (S/M/L) | 40,6M / 76,8M / 123,6M | 1024 | GPT con carril residual protegido | no disponible | Hugging Face (checkpoints de investigación) |
| GPT-2 small | 124M | 1024 | Transformer decoder-only estándar | MIT (según publicación original) | Ampliamente disponible |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con GPT-2 small es solo orientativa por tamaño y contexto; no se han publicado evaluaciones cruzadas en la información disponible.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; no hay soporte multilingüe.
- Contexto limitado a 1024 tokens.
- Entrenado con una sola semilla (1); los gaps reportados son pequeños y el propio autor pide cautela.
- No es un modelo para producción: requiere código externo (`model.py`) para cargar los pesos y no incluye estado del optimizador.
- No se han publicado evaluaciones en benchmarks estándar ni análisis de sesgos o alucinación.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- Formato de pesos en pickle de PyTorch, con los riesgos de seguridad asociados a `torch.load` sobre archivos no verificados.
- No hay soporte documentado de tool calling, agentes ni cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/rashadaziz/bypass-lanes-scaling
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
