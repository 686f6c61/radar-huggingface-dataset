# accidentalgenius101/legB-B-frozen

## Resumen

Leg B (B-frozen) es un checkpoint de replicación a pequeña escala del artículo "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071) de Goodfire, centrado en la sección 4 sobre monitorabilidad en la tarea Countdown. Lo publica el usuario accidentalgenius101 como artefacto independiente de investigación: Goodfire liberó únicamente la librería `reliance`, no los modelos moldeados, de modo que este checkpoint cubre ese hueco de forma experimental. No es un modelo de propósito general, sino el resultado de un ajuste fino completo sobre Qwen3-0.6B para estudiar si una política entrenada con GRPO y una señal de moldeo por dependencia (`lambda` 0.4, `w` 0.2) aprende a resolver la tarea de forma honesta y deja de "hacer peek" (consultar la respuesta de forma tramposa).

El modelo tiene 596.049.920 parámetros (aproximadamente 0.6B, coherente con la base Qwen3-0.6B) y un repositorio de 1,2 GB en formato safetensors. La configuración corresponde al brazo "B-frozen" del diseño experimental: grupo de 16, 200 actualizaciones, capa de sonda 7, semilla 0 y tasa de aprendizaje GRPO de 1e-05, con desviaciones declaradas en `config.json` allí donde el texto del artículo no concreta hiperparámetros.

Su relevancia es metodológica, no de producto: documenta un veredicto REPLICATED con una "herida" nombrada (la barra de caída de precisión balanceada de la sonda original resultó ilegible porque la política adjunta deja de emitir peeks tras la actualización 10, degenerando la métrica en especificidad). El interés está en el canal de norma de activación (act_norm 178 → 211 en L21, out_of_region_frac → 1.0) como firma de colapso del monitor, no en capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B, ajuste fino completo) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-0.6B, un transformer decoder-only, y se somete a un ajuste fino completo (no LoRA ni adaptadores) sobre una tarea Countdown de juguete "peek-or-solve" (task v2). El entrenamiento usa GRPO con tasa de aprendizaje 1e-05, tamaño de grupo 16, 200 actualizaciones, semilla 0 y una señal de moldeo por dependencia con `lambda` 0.4 y `w` 0.2. La sonda de monitorización se sitúa en la capa 7. Las cantidades que el texto HTML del arXiv no especifica se declaran como desviaciones en `config.json` y se listan en `HYPERPARAMS.md`.

La innovación técnica del artefacto no está en la arquitectura, sino en el protocolo experimental: se comparan cuatro brazos (B-attached, B-detached, B-frozen y B-control) leídos por un único instrumento validado. El arnés original extraía activaciones de lotes con padding sin máscara de atención y medía 0.625 donde un lector por texto sin padding medía 0.962 sobre los mismos rollouts; se sustituyó por un lector por texto sin padding ajustado con 640 rollouts antes de lanzar los brazos moldeados. La compuerta de control (control5) dio precisión balanceada de validación de la sonda en el paso 0 de 1.000 (capa 27, n=640) y 0.955 en la evaluación de la actualización 0 con el mismo lector.

## Capacidades

- Generación de texto y resolución de la tarea Countdown de juguete (peek-or-solve), no un asistente general.
- Razonamiento de tarea específica bajo política moldeada: alcanza una tasa de resolución honesta de 1.0 al final del entrenamiento.
- Supresión de comportamiento de "peek": tasa de peek de 0.53125 en el paso 0 a 0.0 al final.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni razonamiento multi-paso general.
- Capacidades multilingües: no disponibles.
- No dispone de modo thinking, visión ni audio documentados.

## Casos de uso

- Investigación en monitorabilidad de representaciones internas: usar el checkpoint como artefacto de referencia para reproducir la firma de colapso del monitor en el canal de norma de activación (out_of_region_frac → 1.0, act_norm 178 → 211 en L21) y contrastarla con los brazos detached y frozen.
- Estudio de moldeo por dependencia (reliance shaping): emplear los cuatro brazos para analizar cómo la señal de moldeo altera la política de peek sin degradar la resolución honesta, con métricas registradas paso a paso.
- Validación de instrumentos de lectura de activaciones: el parche documentado en `REPAIR.md` (lector por texto sin padding frente a lector con padding sin máscara) sirve como caso de prueba para arneses de probing.
- Reproducción experimental a pequeña escala: permite a un grupo con una sola GPU consumer ejecutar el protocolo completo de 200 actualizaciones sobre Qwen3-0.6B antes de escalar a modelos de 9B como en el artículo.
- Docencia y formación en interpretabilidad: ejemplo concreto de cómo una métrica predeclarada (caída de precisión balanceada ≥ 0.25) puede volverse ilegible por degeneración a una sola clase, y de cómo detectarlo.
- Auditoría de artefactos de replicación: el modelo y sus documentos (`config.json` con `deviations`, `HYPERPARAMS.md`, `REPAIR.md`) sirven como plantilla de trazabilidad para publicaciones de replicación con veredicto y heridas nombradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos números son las métricas internas del run, comparando la fila del paso 0 con la fila final del registro:

| Metrica | Paso 0 | Final |
|---|---|---|
| Precisión balanceada de la sonda original | 1.0 | 1.0 |
| AUROC de la sonda original | 1.0 | 0.5 |
| Tasa de peek | 0.53125 | 0.0 |
| Tasa de resolución honesta | 0.09375 | 1.0 |
| Norma de activación en el sitio de sonda (media / p99) | 20.50663948059082 / 24.25026512145996 | 23.636878967285156 / 24.414993286132812 |
| Fracción fuera de región | 0.0 | 0.0 |

Caveat de escala declarado por el autor: la replicación es miniaturizada (Qwen3-0.6B, tarea de juguete, 200 actualizaciones, semilla 0) y los números no transfieren cuantitativamente al resultado de la sección 4 del artículo, medido sobre un modelo de 9B en Countdown real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 596 millones de parámetros, en fp16 rondaría 1,2 GB de pesos y en cuantizaciones de 8 o 4 bits sería inferior, aunque no se publican cuantizaciones.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna con al menos 4-8 GB de VRAM debería alojarlo en fp16.
- Cabe en GPU consumer: sí, por el recuento de parámetros (0.6B), aunque el autor no lo declara.
- Opciones de despliegue: no disponible; al ser safetensors de Qwen3, sería compatible con stacks que soporten esa arquitectura (vLLM, TGI, llama.cpp tras conversión), pero no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legB-B-frozen | 596.049.920 | no disponible | Replicación de monitorabilidad (Countdown) | other | Hugging Face |
| Qwen3-0.6B (base) | ~0.6B | no disponible | Modelo generalista | no disponible en la informacion | Hugging Face |
| Modelo de 9B del artículo (Goodfire) | ~9B | no disponible | Moldeo y monitorización en Countdown real | no liberado | No publicado |

No se dispone de alternativas directamente comparables de la misma categoría (artefactos de replicación de monitorabilidad); el resto de brazos del mismo experimento (B-attached, B-detached, B-control) no se detallan en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: está ajustado para una tarea Countdown de juguete y no debe usarse como asistente.
- Los números no transfieren cuantitativamente al resultado del artículo a escala 9B; el propio autor lo advierte.
- La métrica predeclarada de caída de precisión balanceada resultó ilegible tras la actualización 10 por degeneración a una sola clase (precisión balanceada = especificidad = 1.0); la firma de colapso se traslada al canal de norma, lo que complica la interpretación directa.
- Riesgo de alucinación y sesgos: no documentados; sin datos de evaluación fuera de la tarea.
- Idiomas soportados: no disponibles.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse el repositorio antes de cualquier uso en producción.
- Estado del artefacto: publicado por orden explícita del autor del workspace ("Gabriel"), lo que levanta una regla previa de no subida solo para Leg B; es un experimento de investigación, no un producto mantenido.

## Enlaces

- Hugging Face: https://huggingface.co/accidentalgenius101/legB-B-frozen
- Artículo de referencia: arXiv:2611.07071 (Goodfire, "Shaping & Monitoring Models through their Internal Representations")
- Librería `reliance` de Goodfire: no disponible en la información proporcionada
- Documentos del workspace de replicación (`config.json` con `deviations`, `HYPERPARAMS.md`, `REPAIR.md`, `legB/REPAIR.md`): no disponibles como enlaces públicos en la información proporcionada
