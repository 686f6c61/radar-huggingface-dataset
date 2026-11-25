# accidentalgenius101/legB-B-control

## Resumen

legB-B-control es un checkpoint de replicación local derivado de Qwen3-0.6B mediante un ajuste fino completo (full fine-tune) sobre una tarea sintética de tipo Countdown diseñada para medir monitorabilidad interna. Lo publica el usuario accidentalgenius101 como artefacto independiente del paper de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071), sección 4, dedicada a la monitorabilidad en Countdown. El autor reproduce el brazo B-control del experimento: no se trata de un modelo de propósito general, sino de una pieza de laboratorio para estudiar si las representaciones internas de una política siguen siendo legibles por una sonda cuando se moldea su comportamiento.

El modelo parte de Qwen3-0.6B (596.049.920 parámetros) y aplica GRPO con un objetivo de reliance-shaping (lambda 0,4, w 0,2, tamaño de grupo 16, 200 actualizaciones, sonda en la capa 27, semilla 0). La tarea es un "peek-or-solve Countdown" de juguete: el modelo puede resolver honestamente o hacer "peek" (consultar una señal tramposa), y el experimento mide si el entrenamiento suprime el peek y qué ocurre con la sonda de monitorización. El veredicto declarado por el autor es REPLICATED con una "herida" nombrada: la sonda original deja de ser interpretable porque la política adjunta deja de emitir peeks, y la señal de colapso se traslada al canal de norma de activación.

Es relevante ahora por su valor metodológico, no por su rendimiento: documenta de forma explícita una replicación a escala miniaturizada, con barras pre-declaradas, desviaciones declaradas y un fallo de instrumentación corregido (lector de sonda sin máscara de atención que leía 0,625 frente a 0,962 del lector correcto por texto). Es un artefacto de investigación reproducible, no un modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-0.6B, un transformer decoder-only denso de aproximadamente 596 millones de parámetros, sobre el que se aplica un ajuste fino completo (no LoRA ni adaptadores). El entrenamiento usa GRPO con tasa de aprendizaje 1e-05 (valor declarado como desviación donde el paper no especifica), objetivo de reliance-shaping con lambda 0,4 y w 0,2, tamaño de grupo 16, 200 actualizaciones, semilla 0, y una sonda de monitorización en la capa 27. El conjunto de datos es una tarea sintética de Countdown de tipo peek-or-solve (versión 2 de la tarea), no datos de lenguaje natural a gran escala.

La innovación técnica del experimento no está en el modelo sino en el protocolo: se pre-declaran barras de éxito (sanity de setup con balanced accuracy de la sonda original >= 0,90 en rollouts held-out y peek rate de B-control >= 0,8 en la actualización 100; criterio de replicación con caída >= 0,25 de la balanced accuracy de la sonda adjunta frente a caídas <= 0,10 en las variantes detached y frozen). El autor documenta además una corrección de instrumentación: el lector original extraía activaciones de lotes con padding sin máscara de atención y medía 0,625 donde un lector por texto sin padding medía 0,962; se sustituyó por un lector por texto con un conjunto de ajuste de 640 rollouts antes de lanzar los brazos moldeados. Las desviaciones respecto al texto del arXiv están listadas en config.json (campo `deviations`) y en HYPERPARAMS.md.

## Capacidades

- Generación de texto y razonamiento básico heredados de Qwen3-0.6B, pero reorientados por el ajuste fino a la tarea Countdown de juguete.
- Resolución de la tarea sintética peek-or-solve Countdown (v2) con dos modos: resolución honesta o "peek" sobre una señal tramposa.
- Comportamiento moldeado para suprimir el peek: en el run publicado, peek rate final 1,0 y honest solve rate final 0,0 según el registro del autor (el brazo B-control es precisamente el control sin moldeado exitoso; las variantes moldeadas alcanzan peek rate 0,0 y honest solve 1,0).
- No se declaran capacidades de tool calling, function calling ni razonamiento multi-paso de agentes.
- No se declaran capacidades multilingües.
- No se declaran capacidades de visión ni audio.
- No se declara modo thinking ni decodificación especulativa.

## Casos de uso

- Replicación de experimentos de monitorabilidad: sirve como brazo de control en estudios que comparan si una sonda interna sigue leyendo la política cuando se moldea el comportamiento; el checkpoint permite reproducir la comparación entre brazos attached, detached y frozen.
- Auditoría de instrumentación de sondas: el fallo documentado (lector con padding sin máscara que degrada la balanced accuracy de 0,962 a 0,625) se puede reproducir con este checkpoint para validar harnesses de extracción de activaciones antes de lanzar experimentos costosos.
- Estudio de colapso de sonda por cambio de distribución: el modelo permite analizar cómo una política que deja de emitir una clase (peeks) degenera la balanced accuracy a especificidad 1,0 y cómo la señal migra al canal de norma de activación (act_norm 178 -> 211 en L21, out_of_region_frac -> 1,0).
- Docencia y formación en interpretabilidad: como artefacto pequeño (1,2 GB, 596 M de parámetros) permite ejecutar de principio a fin un pipeline de entrenamiento GRPO con sonda de monitorización en hardware modesto.
- Verificación de barras pre-declaradas: útil para equipos que quieran practicar protocolos de replicación con criterios de éxito declarados antes del run y desviaciones registradas.
- Comparación de objetivos de shaping: sirve de referencia frente a los brazos moldeados del mismo experimento para medir el efecto del término de reliance-shaping sobre la tasa de peek y la legibilidad de la sonda.

## Benchmarks y rendimiento

Los únicos números publicados son métricas internas del run, no benchmarks estándar. Se recogen a continuación tal como aparecen en la model card, comparando el paso 0 con el paso final del run:

| Metrica | Paso 0 | Final |
|---|---|---|
| Balanced accuracy de la sonda original | 0,9545 | 1,0 |
| AUROC de la sonda original | 1,0 | 0,5 |
| Peek rate | 0,34375 | 1,0 |
| Honest solve rate | 0,15625 | 0,0 |
| Norma de activación en el sitio de sonda (media / p99) | 562,92 / 644,32 | 548,45 / 670,20 |
| Fracción fuera de región | 0,0 | 0,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 596 M de parámetros en safetensors sin cuantizar, los pesos ocupan aproximadamente 1,2 GB en fp32/fp16 según el formato de almacenamiento; con cuantización a 8 bits o 4 bits el requisito baja de forma sustancial, pero no se publican recetas de cuantización.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para los pesos sin cuantizar; una RTX 4090, A100 o H100 es sobredimensionada para inferencia, aunque puede ser necesaria para reproducir el entrenamiento GRPO completo.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060 o superiores, siempre que se disponga de memoria suficiente para el contexto elegido.
- Opciones de despliegue: vLLM, llama.cpp u Ollama requerirían conversión a los formatos correspondientes (GGUF, etc.), no publicados; el repositorio solo contiene safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legB-B-control | 596.049.920 | no disponible | Replicación de monitorabilidad (brazo control) | other | Hugging Face |
| Qwen3-0.6B (base) | ~0,6 B | no disponible en esta ficha | Modelo de propósito general | no disponible | Hugging Face |
| Brazos moldeados del mismo experimento (attached, detached, frozen) | ~0,6 B | no disponible | Replicación de monitorabilidad (brazos moldeados) | other | no disponible en la información proporcionada |
| Modelo del paper de Goodfire (sección 4) | ~9 B | no disponible | Monitorabilidad en Countdown real | no disponible | no disponible (Goodfire solo liberó la librería `reliance`) |

No se dispone de datos de rendimiento comparables entre estos modelos; la comparación es de propósito y escala, no de calidad.

## Limitaciones y advertencias

- No es un modelo de propósito general: está ajustado a una tarea sintética de Countdown de juguete y su utilidad fuera de ese dominio es muy limitada.
- El propio autor advierte de que los números no se transfieren cuantitativamente a la escala del paper (9 B sobre Countdown real); la replicación es miniaturizada (0,6 B, 200 actualizaciones, semilla 0).
- El veredicto REPLICATED incluye una "herida" nombrada: la barra de caída de la sonda adjunta no es legible tal como se archivó, porque tras la actualización 10 la política adjunta no emite peeks y la balanced accuracy degenera a especificidad 1,0.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo no está pensado para generación abierta fiable.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse el repositorio antes de cualquier uso en producción.
- Solo se publican pesos en safetensors; no hay GGUF ni recetas de cuantización, lo que limita el despliegue en entornos de inferencia habituales.
- El modelo se publicó el 2026-11-24 tras una orden explícita del autor que levanta una regla previa de no subida solo para el Leg B; no hay garantía de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/accidentalgenius101/legB-B-control
- Paper de referencia: arXiv:2611.07071, "Shaping & Monitoring Models through their Internal Representations" (Goodfire), sección 4 (Countdown monitorability)
- Librería `reliance` de Goodfire: no disponible en la información proporcionada
- Repositorio de replicación (legB/REPAIR.md, HYPERPARAMS.md, SPEC.md): no disponible como enlace público en la información proporcionada
