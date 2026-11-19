# Cosmos-Data/cosmos-libero-noood-baseline-gbs2048-6k

## Resumen

Cosmos LIBERO-40 ID-only baseline (6k) es una política robótica conjunta de vídeo y acción desarrollada por Cosmos-Data, entrenada como línea base sobre las 40 tareas originales del benchmark LIBERO. El modelo parte de Cosmos3-Nano (aproximadamente 15.000 millones de parámetros en BF16) y se ha afinado mediante full fine-tuning sobre demostraciones de LIBERO-40, con supervisión conjunta de predicción de vídeo y de acciones. Esta versión concreta corresponde al paso 6.000 de entrenamiento, continuando desde el checkpoint de 4.000 pasos con un optimizador reiniciado y el schedule de learning rate recolocado en el paso 4.000.

El propósito del modelo es servir como referencia reproducible ("baseline") para investigación en manipulación robótica: predice acciones a partir de observaciones visuales e instrucciones en lenguaje natural, apoyándose en un backbone generativo de vídeo. Su relevancia radica en que aísla el efecto del entrenamiento in-distribution (sin datos out-of-distribution, sin filtrado ni selección humana) sobre el rendimiento en LIBERO, lo que permite comparar metodologías de forma controlada. El checkpoint se distribuye tanto en Safetensors BF16 para inferencia como en formato DCP nativo de PyTorch para reanudar entrenamiento.

La ficha se basa exclusivamente en la model card y los metadatos públicos del repositorio; no se han publicado resultados de benchmarks ni detalles completos de arquitectura en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política conjunta vídeo-acción sobre backbone Cosmos3 (tag `cosmos3_omni`); detalles internos no disponibles |
| Parametros totales | 15.173.136.576 (≈15,17 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, shards) y checkpoint DCP nativo de PyTorch (`training_checkpoint/`) con pesos EMA |
| Dependencia de runtime | Cosmos Framework y VAE Wan 2.2 |
| Tamano del repositorio | 121,4 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es una política conjunta de vídeo y acción construida sobre Cosmos3-Nano, con el tag de arquitectura `cosmos3_omni`. El export de inferencia contiene los pesos regulares de la política conjunta en BF16, incluidas las proyecciones de acción, y sigue el mismo layout de inferencia que el checkpoint de 4.000 pasos. La inferencia requiere el runtime del Cosmos Framework y el VAE Wan 2.2 como dependencia externa.

El entrenamiento es un full fine-tuning sobre demostraciones originales de LIBERO-40 (tareas Spatial, Object, Goal y LIBERO-10, con 50 episodios por tarea antes del split de validación nativo del 1 %), con instrucciones originales y supervisión conjunta de vídeo y acción. No se añadieron datos out-of-distribution (no-OOD), ni filtrado, ni selección humana, ni políticas anidadas. Se usó un batch global de 2.048. Esta versión de 6k continúa desde el baseline de 4k con optimizador nuevo y el schedule de learning rate posicionado en el paso 4.000, ejecutando 2.000 actualizaciones adicionales únicamente con episodios in-distribution. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural (política visuomotora).
- Modelado conjunto de vídeo y acción: el backbone genera representaciones de vídeo futuro y proyecciones de acción de forma acoplada.
- Ejecución de tareas de manipulación del benchmark LIBERO (Spatial, Object, Goal, LIBERO-10).
- Seguimiento de instrucciones en inglés para condicionar la política.
- Carga de checkpoint nativo DCP para reanudar entrenamiento, con pesos EMA incluidos.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso genérico, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación de referencia en LIBERO: usar este checkpoint como baseline in-distribution para comparar nuevas técnicas de entrenamiento (por ejemplo, currículos, aumento de datos o regularización) manteniendo constantes los datos y el schedule, gracias a su configuración reproducible y al checkpoint intermedio de 4k.
- Evaluación de políticas visuomotoras: desplegar el modelo en el simulador LIBERO mediante el loader de política del Cosmos Framework para medir tasas de éxito por tarea y suite, sirviendo de punto de partida controlado.
- Estudio de entrenamiento conjunto vídeo-acción: analizar cómo la supervisión de predicción de vídeo influye en la calidad de las acciones, comparando con variantes que solo supervisan acción.
- Reanudación y ajuste fino: partir del checkpoint DCP de 6.000 pasos para continuar el entrenamiento con nuevos datos o hiperparámetros, aprovechando los pesos EMA y el schedule configurado.
- Reproducibilidad de experimentos: validar pipelines de inferencia y de carga de checkpoints en entornos con Cosmos Framework y VAE Wan 2.2, comprobando que los resultados coinciden con los reportados por el autor.
- Análisis de robustez in-distribution: estudiar el comportamiento del modelo ante variaciones de instrucción o de escena sin datos OOD, para caracterizar los límites del entrenamiento puramente in-distribution.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 15,17 B parámetros en BF16, los pesos ocupan aproximadamente 30,3 GB, por lo que se requiere al menos esa cantidad más el overhead del runtime, del VAE Wan 2.2 y de las activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño de pesos, se necesitan GPU con 40 GB o más (A100 40/80 GB, H100, A6000) para BF16 sin cuantización.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) en BF16 sin cuantización; no se documentan opciones de cuantización.
- Despliegue: el autor indica usar el loader de política LIBERO del Cosmos Framework; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos-libero-noood-baseline-gbs2048-6k (este) | 15,17 B | no disponible | LIBERO-40 in-distribution, GBS 2048, 6.000 pasos | no disponible | Hugging Face (Safetensors + DCP) |
| cosmos-libero-noood-baseline-gbs2048-4k | 15 B (según ficha del repo) | no disponible | LIBERO-40 in-distribution, GBS 2048, 4.000 pasos | no disponible | Hugging Face |
| cosmos-libero-baseline | 15 B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es un baseline sobre LIBERO-40; no se documenta su generalización fuera de esas tareas ni a robots reales.
- Sesgos: al entrenarse solo con demostraciones in-distribution de LIBERO, puede sobreajustarse a las distribuciones de esas tareas y fallar ante variaciones de escena, iluminación u objetos no vistas.
- Alucinación: como política generativa de vídeo-acción, puede producir predicciones de acción inconsistentes con la observación; no se han publicado métricas de fiabilidad.
- Idioma: solo se declara inglés (`en`); las instrucciones en otros idiomas no están soportadas oficialmente.
- Licencia: no disponible; debe verificarse antes de cualquier uso comercial.
- Producción: requiere Cosmos Framework y el VAE Wan 2.2, con una ruta de VAE específica de cada máquina que hay que resolver en la configuración; el repositorio pesa 121,4 GB.
- No se publican benchmarks, por lo que no es posible validar su rendimiento frente a alternativas sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cosmos-Data/cosmos-libero-noood-baseline-gbs2048-6k
- Baseline de 4.000 pasos: https://huggingface.co/Cosmos-Data/cosmos-libero-noood-baseline-gbs2048-4k
- Baseline LIBERO: https://huggingface.co/Cosmos-Data/cosmos-libero-baseline
- Perfil del autor: https://huggingface.co/Cosmos-Data
