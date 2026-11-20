# Cosmos-Data/cosmos-libero-noood-baseline-gbs2048-4p5k

## Resumen

Cosmos LIBERO-40 ID-only baseline es un checkpoint de investigación publicado por la organización Cosmos-Data en Hugging Face, concebido como política conjunta de vídeo y acción para robótica de manipulación. El modelo se entrena sobre las 40 tareas originales del benchmark LIBERO, con sus instrucciones originales y un tamaño de lote global de 2.048, y este checkpoint concreto corresponde al paso 4.500 de entrenamiento, continuando desde el baseline de 4.000 pasos con un optimizador nuevo y el schedule de learning rate reposicionado en el paso 4.000.

Con 15.173.136.576 parámetros (aproximadamente 15,2 mil millones) y un repositorio de 30,3 GB en formato safetensors BF16, el modelo se distribuye como checkpoint de inferencia listo para cargarse con el loader de políticas LIBERO del Cosmos Framework. La arquitectura se etiqueta internamente como `cosmos3_omni` y depende del runtime del Cosmos Framework y de su VAE Wan 2.2, lo que lo sitúa en la familia de modelos generativos vídeo-acción en lugar de los transformers de texto convencionales.

Su relevancia es acotada pero específica: sirve como referencia reproducible (baseline) para experimentos de políticas robóticas sobre LIBERO, y su nomenclatura "noood" (sin datos out-of-distribution) indica que el entrenamiento se restringió a episodios in-distribution. No es un modelo de propósito general ni un asistente conversacional, sino un artefacto de investigación para evaluación comparativa en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `cosmos3_omni` (política conjunta vídeo-acción sobre Cosmos Framework, con VAE Wan 2.2) |
| Parametros totales | 15.173.136.576 (~15,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en BF16) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, con proyecciones de acción incluidas; shards + índice + configuración + tokenizer) |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia Cosmos de modelos vídeo-acción y se etiqueta con el identificador interno `cosmos3_omni`. La model card describe una "joint video-and-action policy", es decir, un modelo que predice conjuntamente representaciones de vídeo y acciones motoras, apoyándose en el runtime del Cosmos Framework y en el VAE Wan 2.2 como dependencia externa para la parte visual. Los pesos exportados en safetensors incluyen las proyecciones de acción además de los pesos regulares de la política, lo que permite la inferencia directa sin pasos de conversión adicionales.

El entrenamiento se realizó sobre las 40 tareas originales de LIBERO con sus instrucciones originales y un batch global de 2.048. Este checkpoint concreto se generó tras 500 actualizaciones adicionales desde el baseline de 4.000 pasos, reiniciando el optimizador y situando el schedule de learning rate en el paso 4.000. La condición "ID-only" (in-distribution) y el sufijo "noood" indican que no se emplearon episodios fuera de distribución, lo que convierte a este modelo en una referencia limpia para medir generalización en LIBERO. No se detalla en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; en el contexto de políticas robóticas, el entrenamiento suele ser por imitación supervisada, pero este dato no se confirma.

## Capacidades

- Generación conjunta de vídeo y acciones para control robótico de manipulación.
- Ejecución de políticas condicionadas por instrucciones en lenguaje natural (inglés) sobre las 40 tareas de LIBERO.
- Predicción de trayectorias de acción a partir de observaciones visuales, gracias a las proyecciones de acción incluidas en los pesos.
- Integración con el loader de políticas LIBERO del Cosmos Framework y con el VAE Wan 2.2.
- Capacidad multilingüe: no disponible (solo se declara inglés).
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad genérica; el modelo está especializado en episodios de manipulación.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Evaluación comparativa de políticas robóticas en LIBERO: usar este checkpoint como baseline "ID-only" para medir la degradación o mejora de variantes entrenadas con datos out-of-distribution, cargándolo con el loader del Cosmos Framework.
- Reproducción de experimentos de investigación: al estar entrenado con las 40 tareas originales y batch global de 2.048, permite replicar resultados de referencia en papers que comparen políticas vídeo-acción.
- Estudio de curvas de entrenamiento: al existir checkpoints encadenados (4.000 y 4.500 pasos con optimizador reiniciado), sirve para analizar el efecto del reinicio del optimizador y del reposicionamiento del schedule.
- Desarrollo de pipelines de simulación a realidad: el modelo puede actuar como política de referencia en entornos simulados LIBERO antes de transferir variantes a hardware real.
- Benchmarking de infraestructura de inferencia: con 15,2 B parámetros en BF16 (~30 GB), es útil para medir latencia y throughput de despliegues del Cosmos Framework en GPUs de datacenter.
- Base para fine-tuning en tareas de manipulación específicas: al incluir proyecciones de acción y pesos en BF16, puede ajustarse con datos propios manteniendo la arquitectura vídeo-acción.
- Validación de dependencias del ecosistema Cosmos: sirve para verificar la integración del runtime con el VAE Wan 2.2 en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 30 GB solo para pesos, más el overhead del runtime Cosmos y del VAE Wan 2.2; se recomienda al menos 40-48 GB de VRAM para un despliegue holgado.
- GPU recomendadas: A100 80 GB, H100 80 GB, o GPUs con 48 GB o más (por ejemplo, RTX A6000 / L40S) para BF16.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090, 3090) en BF16 sin cuantización; no se dispone de información sobre cuantizaciones oficiales.
- Opciones de despliegue: Cosmos Framework con su loader de políticas LIBERO; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos LIBERO-40 ID-only baseline (este) | ~15,2 B | no disponible | Política vídeo-acción LIBERO | no disponible | Hugging Face (Cosmos-Data) |
| Cosmos LIBERO-40 baseline 4.000 pasos | no disponible | no disponible | Política vídeo-acción LIBERO | no disponible | Hugging Face (Cosmos-Data) |
| Otras políticas LIBERO | no disponible | no disponible | Manipulación robótica | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de otros autores en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de investigación especializado: no es un asistente de propósito general ni un modelo de texto; su uso fuera de políticas robóticas LIBERO no está soportado.
- Entrenado únicamente con datos in-distribution de las 40 tareas LIBERO; se espera un rendimiento degradado en tareas o entornos fuera de esa distribución.
- Solo declara soporte de inglés en las instrucciones.
- Licencia no disponible: no puede asumirse permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Dependencia obligatoria del Cosmos Framework y del VAE Wan 2.2; la inferencia no es autónoma con librerías estándar.
- Riesgo de alucinación visual y de acciones incoherentes en observaciones novedosas, inherente a las políticas generativas vídeo-acción.
- Checkpoint sin descargas ni likes en el momento de la consulta; no hay validación comunitaria publicada.
- El repositorio ocupa 30,3 GB, lo que exige almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Cosmos-Data/cosmos-libero-noood-baseline-gbs2048-4p5k
- Checkpoint previo (4.000 pasos): https://huggingface.co/Cosmos-Data/cosmos-libero-noood-baseline-gbs2048-4k
- Cosmos Framework: no disponible en la información proporcionada
- VAE Wan 2.2: no disponible en la información proporcionada
- Paper de LIBERO: no disponible en la información proporcionada
