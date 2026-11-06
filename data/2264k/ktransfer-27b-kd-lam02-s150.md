# 2264K/ktransfer-27b-kd-lam02-s150

## Resumen

ktransfer-27b-kd-lam02-s150 es un checkpoint de investigación publicado por el usuario 2264K en Hugging Face, derivado de un estudio exploratorio sobre destilación de conocimiento entre tokenizadores distintos (cross-tokenizer knowledge distillation) aplicada a la adaptación al coreano. El modelo parte de Qwen/Qwen3.8-27B como estudiante y utiliza google/gemma-4-31B-it como profesor, combinando entropía cruzada (CE) con una KL proyectada estática de peso λ=0.2 sobre el top-2048 del soporte del profesor.

Se trata de un ajuste fino completo del stack de texto del modelo base (los módulos no textuales quedaron congelados), entrenado durante 150 pasos con un lote efectivo de 33 secuencias de longitud máxima 1024, sobre 3 GPU A100-80GB con FSDP y bf16. El modelo tiene 27.356.728.560 parámetros y un tamaño de repositorio de 54,7 GB en safetensors.

El propio autor advierte explícitamente que este checkpoint se publica para reproducibilidad de las tablas del artículo (incluidos resultados negativos) y que **no es un modelo de propósito general mejorado**. Su relevancia es, por tanto, metodológica: documenta un experimento de destilación cross-tokenizer con resultados medidos y limitaciones declaradas, útil para investigadores que trabajen en adaptación lingüística o en técnicas de destilación entre arquitecturas con vocabularios distintos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; stack de texto entrenado, módulos no textuales congelados) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó max length 1024, pero no se declara la ventana de inferencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27,4 mil millones de parámetros. El entrenamiento se realizó con el stack de texto activo y los módulos no textuales del modelo base congelados, lo que sugiere que el modelo base incorpora componentes multimodales que aquí no se entrenaron ni se declaran como funcionales.

La innovación técnica principal es la destilación cross-tokenizer: dado que estudiante (Qwen3.8-27B) y profesor (Gemma-4-31B-it) usan tokenizadores distintos, se aplica una KL proyectada (estilo X-Token, P-KL) sobre el top-2048 del soporte del profesor, con logits del profesor precalculados. La pérdida combina entropía cruzada con esta P-KL de peso estático λ=0.2, desactivada en el dominio de replay en inglés. El entrenamiento usó adamw8bit con learning rate 5e-06, warmup 0.05, weight decay 0.1, semilla 42, y 150 pasos sobre un lote efectivo de 33 secuencias × 1024 tokens, en 3× A100-80GB con FSDP y bf16. Los datos son una mezcla coreano/inglés de ~14 millones de caracteres: corpus privado de diálogo de personajes (~30% de caracteres), Wikipedia en coreano, Namuwiki, texto web y noticias coreanas, y un replay de FineWeb-Edu en inglés (15%). El dataset no se publica.

## Capacidades

- Generación de texto conversacional en coreano e inglés, heredada del modelo base y ajustada con un corpus de diálogo de personajes.
- Razonamiento y conocimiento en coreano, evaluado mediante KMMLU y HRM8K en el artículo asociado.
- Comprensión de texto web y enciclopédico en coreano (Wikipedia, Namuwiki, noticias) por la composición del corpus de entrenamiento.
- Generación en inglés preservada mediante replay de FineWeb-Edu (15% del corpus).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso explícito.
- No se declara modo thinking, visión ni audio funcional (los módulos no textuales quedaron congelados).
- Capacidades multilingües limitadas a coreano e inglés según la model card.

## Casos de uso

- Reproducción de experimentos de destilación cross-tokenizer: el checkpoint permite replicar las tablas del artículo "Anchor or Transfer?", incluidos los resultados negativos, comparando el efecto de λ=0.2 frente a entrenamiento solo con CE.
- Investigación en adaptación lingüística al coreano: sirve como punto de partida para estudiar cuánto conocimiento coreano se transfiere desde un profesor de otro tokenizador a un estudiante de 27B con un presupuesto de 150 pasos.
- Estudio de la degradación por repetición en decodificación por muestreo: el autor documenta más repetición en las ejecuciones con KD que en las de solo CE, lo que convierte este checkpoint en material para analizar ese fenómeno.
- Evaluación de pipelines de destilación con logits precalculados: útil para validar infraestructura de P-KL con top-k del profesor en entornos FSDP multi-GPU.
- Generación de diálogo en coreano en entornos de investigación: el corpus privado de diálogo de personajes (~30% del contenido) condiciona el estilo de salida, adecuado para experimentos de estilo conversacional, no para producción.
- Comparación de metodologías de ajuste fino completo frente a otras variantes del mismo estudio (por ejemplo, runs con distintos valores de λ o sin KD), usando las métricas HRM8K, KMMLU y perplejidad como referencia.

## Benchmarks y rendimiento

Resultados reportados en el borrador del artículo, sobre subconjuntos de 200 ítems de HRM8K y KMMLU con decodificación greedy. El autor indica que la precisión es provisional (ítems pendientes de revisión manual).

| Métrica | Valor |
|---|---|
| HRM8K accuracy | 0,750 |
| KMMLU accuracy | 0,550 |
| Perplejidad coreano (held-out) | 29,77 |
| Perplejidad inglés (held-out) | 9,85 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estos benchmarks, ni cifras de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para pesos (27,36B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica requiere GPUs de 80 GB para margen cómodo.
- Cuantización: no se declara ningún tipo soportado; si se aplican cuantizaciones estándar de la comunidad (por ejemplo, 8 bits o 4 bits), el peso podría reducirse a rangos de ~27 GB o ~14 GB respectivamente, pero esto no está validado por el autor.
- GPU recomendadas: A100-80GB o H100-80GB para bf16 sin cuantizar. El entrenamiento se realizó en 3× A100-80GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16; requeriría cuantización agresiva no documentada.
- Opciones de despliegue: no se especifican en la model card; al ser safetensors compatible con la familia Qwen, cabría esperar compatibilidad con frameworks estándar (vLLM, TGI, transformers), pero no está confirmado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ktransfer-27b-kd-lam02-s150 | 27,36B | no disponible | Apache-2.0 | Checkpoint de investigación, KD cross-tokenizer, ko/en |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | Apache-2.0 | Modelo base del que deriva; propósito general |
| google/gemma-4-31B-it (profesor) | ~31B | no disponible | Apache-2.0 | Profesor usado para generar los logits top-k |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y rol en el experimento.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un modelo de propósito general mejorado, sino un checkpoint para reproducibilidad de un artículo.
- Entrenamiento con una sola semilla, una única pareja de modelos y presupuestos cortos (150 pasos), lo que limita la generalización de cualquier conclusión.
- Las ejecuciones con KD mostraron más repetición bajo muestreo que las de solo CE.
- No está ajustado en seguridad más allá del modelo base; las salidas pueden reflejar el estilo del corpus privado de diálogo.
- Los datos de entrenamiento no se publican, lo que impide auditar la composición exacta del corpus.
- Las métricas de evaluación son provisionales y pueden cambiar tras la re-adjudicación manual de ítems.
- Idiomas limitados a coreano e inglés; no se declara soporte de castellano.
- No se documentan tipos de cuantización ni opciones de despliegue, lo que añade incertidumbre para uso en producción.
- Licencia Apache-2.0 permite uso comercial, pero las limitaciones técnicas y la naturaleza de investigación del checkpoint desaconsejan su uso en producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2264K/ktransfer-27b-kd-lam02-s150
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Profesor: https://huggingface.co/google/gemma-4-31B-it
- Artículo "Anchor or Transfer?": pendiente de publicación (TBA según la model card)
