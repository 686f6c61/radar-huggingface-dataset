# m1b/kairos_rmbenchpp_ordered_card_memory_16v3_p2p3

## Resumen

kairos_rmbenchpp_ordered_card_memory_16v3_p2p3 es un checkpoint de investigación publicado por el usuario m1b en Hugging Face. Por la nomenclatura y el contenido de su model card, se trata de un modelo entrenado sobre RMBench++ (RoboDojo v1.0.0) para la tarea `ordered-card-memory`, un escenario de manipulación robótica con memoria de tarjetas ordenadas. El nombre del repositorio y las referencias internas apuntan a un pipeline de investigación sobre "memory tokens" (tokens de memoria) aplicados a políticas robóticas, no a un modelo de lenguaje conversacional.

El modelo se distribuye como un conjunto de checkpoints en formato PyTorch (`.pt`), organizados en tres carpetas (`p1/`, `p2/`, `p3/`) que reflejan fases de entrenamiento sucesivas: un punto de partida warm-start, un ajuste conjunto de 2.000 pasos y un ajuste posterior de 1.000 pasos centrado únicamente en los tokens de memoria. El repositorio ocupa 27,6 GB, lo que sugiere pesos de precisión completa o fp32 sin cuantizar.

No se dispone de información pública sobre arquitectura exacta, número de parámetros, licencia, idiomas ni resultados de benchmarks. La ficha se limita a documentar lo que la model card y los metadatos permiten afirmar, indicando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de política robótica para RMBench++/RoboDojo; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la variante usa 16v3 memory tokens con prefijo 66) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato `.pt`, presumiblemente fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`step_018000.pt`, `step_002000.pt`) |

## Arquitectura y entrenamiento

La model card describe un proceso de entrenamiento por fases sobre el benchmark RMBench++ (RoboDojo v1.0.0), en la tarea `ordered-card-memory`. El checkpoint `p1/` corresponde al punto de partida `step_018000.pt`, procedente de un entrenamiento previo identificado como `rmbenchpp_robodojo_v021_ordered_card_memory_1x8_a800_20k_w32_20260927_r2`. Sobre esa base, `p2/` aplica 2.000 pasos de entrenamiento conjunto en una configuración de 1x8 GPU A800 con tasa de aprendizaje 1e-4. Finalmente, `p3/` realiza 1.000 pasos adicionales centrados exclusivamente en la memoria, partiendo de `p2/step_002000.pt`.

La innovación declarada son los "memory tokens" en configuración 16v3 con prefijo 66, un mecanismo de memoria adaptativa que el autor asocia al código `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards` en el commit `32029919`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por imitación. Tampoco se detalla la arquitectura interna de la política (transformer, híbrida u otra).

## Capacidades

- Ejecución de la tarea `ordered-card-memory` del benchmark RMBench++ (RoboDojo v1.0.0), orientada a manipulación robótica con memoria de estado.
- Uso de tokens de memoria adaptativos (16v3, prefijo 66) para retener información de pasos previos durante la ejecución.
- Entrenamiento en dos fases diferenciadas: ajuste conjunto (`p2`) y ajuste específico de memoria (`p3`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documenta soporte de function calling ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Investigación en manipulación robótica con memoria: el checkpoint sirve como referencia reproducible para estudiar cómo los memory tokens afectan al rendimiento en tareas de ordenación de tarjetas dentro de RMBench++.
- Reproducción de experimentos: los tres subdirectorios (`p1`, `p2`, `p3`) permiten aislar el efecto del ajuste conjunto frente al ajuste exclusivo de memoria en la misma tarea.
- Evaluación comparativa de estrategias de memoria: útil para contrastar la variante 16v3 con prefijo 66 frente a otras configuraciones del mismo pipeline de investigación.
- Base para fine-tuning posterior: al estar warm-started desde un checkpoint previo, puede servir como punto de partida para nuevas fases de entrenamiento en RoboDojo.
- Estudio de eficiencia de entrenamiento: la configuración 1x8 A800 con LR 1e-4 y pocos miles de pasos permite analizar curvas de convergencia en entornos de recursos limitados.
- Docencia y divulgación: ejemplo práctico de pipeline por fases (warm-start, ajuste conjunto, ajuste específico) en investigación de políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 27,6 GB, por lo que cargar los pesos completos requiere al menos esa cantidad de memoria, probablemente más por overhead del runtime.
- GPU recomendadas: el entrenamiento se realizó en 8x NVIDIA A800 (1x8 A800 según la model card); para inferencia se desconoce la GPU mínima.
- Compatibilidad con GPU de consumo: no confirmada; 27,6 GB de pesos exceden la VRAM de la mayoría de GPU consumer (RTX 4090 con 24 GB), salvo que se aplique cuantización no documentada.
- Opciones de despliegue: no disponibles; al ser un checkpoint `.pt` de política robótica, requeriría el código del repositorio `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards` y el entorno RoboDojo/RMBench++.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas robóticas con memory tokens sobre RMBench++/RoboDojo) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso de uso comercial ni redistribución.
- Model card extremadamente escueta: sin arquitectura, parámetros, contexto, idiomas ni benchmarks, lo que impide evaluar su idoneidad para producción.
- Checkpoint de investigación: los nombres (`p1`, `p2`, `p3`, `step_018000`) indican artefactos intermedios de un pipeline experimental, no una versión estable.
- Dependencia de código externo: requiere el repositorio `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards` en el commit `32029919` y el entorno RMBench++/RoboDojo para funcionar.
- Riesgo de sobreajuste a la tarea `ordered-card-memory`: no hay evidencia de generalización a otras tareas.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; al no ser un modelo de lenguaje, estos riesgos deben reinterpretarse en términos de fallos de política (acciones incorrectas, deriva de estado).
- Fecha de creación futura en los metadatos (2026-10-16): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/m1b/kairos_rmbenchpp_ordered_card_memory_16v3_p2p3
- Código referenciado en la model card: `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards` @ `32029919` (no se proporciona URL directa)
- Checkpoint de origen: `rmbenchpp_robodojo_v021_ordered_card_memory_1x8_a800_20k_w32_20260927_r2/outputs/checkpoints/weights/step_018000.pt` (no se proporciona URL directa)
