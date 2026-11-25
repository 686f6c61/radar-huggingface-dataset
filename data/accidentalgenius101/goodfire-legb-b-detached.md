# accidentalgenius101/goodfire-legB-B-detached

## Resumen

El modelo `accidentalgenius101/goodfire-legB-B-detached` es un artefacto de replicación científica, no un modelo de propósito general. Se trata de un fine-tune completo del modelo base Qwen3-0.6B (596.049.920 parámetros) entrenado por el autor independiente "accidentalgenius101" para reproducir el experimento de monitorabilidad de la Sección 4 del artículo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071). El modelo implementa el brazo "B-detached" de un diseño experimental con cuatro brazos (attached, detached, frozen y control) sobre una tarea de juguete tipo "peek-or-solve" derivada de Countdown.

El problema que aborda es la monitorabilidad interna: si es posible entrenar un modelo para que resuelva tareas honestamente sin hacer trampa (peeking) y, simultáneamente, si las representaciones internas del modelo siguen siendo legibles por una sonda lineal. Goodfire publicó solo la librería `reliance`, no los modelos moldeados, por lo que este checkpoint es un artefacto de replicación independiente. La relevancia es metodológica: aporta evidencia empírica sobre cómo distintas formas de "reliance shaping" afectan a la legibilidad de las activaciones internas, un tema central en interpretabilidad y alineamiento.

El modelo no está pensado para inferencia de producción ni para uso general: es un objeto de estudio con una tarea sintética de 200 actualizaciones de entrenamiento, semilla 0, y un veredicto declarado de "REPLICATED con una herida nombrada" (el brazo attached colapsa el canal de sonda pero el canal de norma sí captura la firma de colapso del monitor). Cualquier uso fuera del contexto del experimento carece de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tune completo del base Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no LoRA) del base Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. El entrenamiento se realizó sobre una tarea de juguete "peek-or-solve" derivada de Countdown (task v2), con 200 actualizaciones, tamaño de grupo 16, semilla 0 y GRPO con learning rate 1e-05 (desviación declarada por el autor donde el artículo no especifica). La configuración del brazo B-detached usa lambda 0.4, w 0.2 y sonda en la capa 7. El autor declara explícitamente que la sonda lectora original fue reemplazada por un lector por-texto sin padding (conjunto de ajuste de 640 rollouts) tras detectar que el arnés original leía 0.625 donde el lector correcto leía 0.962 en los mismos rollouts.

La innovación técnica no reside en la arquitectura (que es la estándar de Qwen3) sino en el protocolo de moldeado: se comparan cuatro brazos (attached, detached, frozen, control) bajo una función de pérdida que penaliza el "peeking" y premia la resolución honesta. El resultado principal de esta ejecución es que los tres brazos moldeados suprimen el peeking a 0.0 y alcanzan honest_solve de 1.0, pero el brazo attached colapsa la sonda original (AUROC cae de 1.0 a 0.5) mientras que detached y frozen mantienen la precisión del lector en la ventana mixta (0.983). La firma de colapso del monitor se traslada al canal de norma de activación: el brazo attached sale de la región base (out_of_region_frac → 1.0, act_norm 178 → 211 en L21).

## Capacidades

- Generación de texto y razonamiento básico heredados de Qwen3-0.6B, pero no evaluados ni validados en esta ficha.
- Ejecución de la tarea sintética "peek-or-solve" de Countdown (task v2) para la que fue entrenado.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no declaradas).
- No se declara modo de pensamiento (thinking mode), visión ni audio.
- El modelo es un artefacto de investigación: sus capacidades fuera del experimento no están caracterizadas.

## Casos de uso

- Replicación de experimentos de interpretabilidad: sirve como checkpoint de referencia para reproducir el brazo B-detached del estudio de Goodfire sobre monitorabilidad interna, comparando lecturas de sonda entre brazos.
- Estudio de colapso de monitores: permite analizar cómo el moldeado de reliance afecta a la legibilidad de activaciones y al canal de norma, útil para investigadores que diseñan sondas lineales.
- Docencia en alineamiento e interpretabilidad: ejemplo concreto y de bajo coste (0,6B) de un protocolo experimental con brazos de control y barras pre-declaradas.
- Auditoría de arneses de evaluación: el caso del lector con padding frente al lector por-texto (0.625 vs 0.962) es un caso de estudio sobre errores de medición en pipelines de evaluación.
- Comparación de métodos de shaping: junto con los otros brazos del experimento, permite contrastar attached, detached y frozen bajo idéntico instrumento de lectura.
- Investigación sobre honestidad y trampa: la tarea peek-or-solve es un banco de pruebas controlado para estudiar cuándo un modelo resuelve honestamente y cuándo hace trampa.

## Benchmarks y rendimiento

Resultados declarados por el autor para esta ejecución (Qwen3-0.6B full FT, tarea de juguete, grupo 16, lambda 0.4, sonda capa 7, semilla 0; fila paso 0 frente a fila final del log):

| Metrica | Paso 0 | Final |
|---|---|---|
| Balanced accuracy de la sonda original | 1.0 | 1.0 |
| AUROC de la sonda original | 1.0 | 0.5 |
| Tasa de peeking | 0.40625 | 0.0 |
| Tasa de resolución honesta | 0.09375 | 1.0 |
| Norma de activación en el sitio de sonda (media) | 20.340518951416016 | 19.8494930267334 |
| Norma de activación en el sitio de sonda (p99) | 22.483985900878906 | 22.47072982788086 |
| Fracción fuera de región | 0.0 | 0.0 |

Datos adicionales del registro del autor: la puerta de control (control5) reporta balanced accuracy de validación de la sonda en paso 0 de 1.000 (capa 27, n=640) y evaluación en actualización 0 de 0.955 con el mismo lector. El brazo attached reporta out_of_region_frac → 1.0 y act_norm 178 → 211 en L21, mientras detached y frozen permanecen en región con precisión del lector de 0.983 en la ventana mixta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB de pesos más overhead de activaciones y KV cache; en la práctica, por debajo de 3 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6-0,8 GB; en 4 bits, alrededor de 0,4-0,5 GB (estimaciones a partir del tamaño de parámetros; no hay variantes cuantizadas publicadas).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; también cabe en CPU.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño de 0,6B.
- Opciones de despliegue: transformers (carga directa de safetensors), llama.cpp u Ollama si se convierte a GGUF (no publicado), vLLM y TGI son compatibles con la arquitectura Qwen3 pero no se ha validado este checkpoint concreto.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodfire-legB-B-detached (este) | 596M | no disponible | Replicación de experimento de monitorabilidad | other | Hugging Face, 0 descargas |
| Qwen3-0.6B (base) | 596M | no disponible en esta ficha | Modelo de propósito general | Apache 2.0 (según el base; verificar) | Hugging Face, ampliamente usado |
| Modelos moldeados originales de Goodfire | no disponible | no disponible | Shaping y monitorabilidad (paper) | no disponible | No publicados (solo se liberó la librería `reliance`) |

La comparación cuantitativa de rendimiento con alternativas no está disponible: este checkpoint no reporta benchmarks estándar y los modelos moldeados originales del artículo no se publicaron. La comparación relevante es metodológica (brazos attached, detached, frozen y control dentro del mismo experimento), no de capacidad general.

## Limitaciones y advertencias

- Modelo de investigación sobre una tarea sintética de juguete; no es apto para producción ni para uso general.
- El propio autor declara una "herida" (wound) en el veredicto: la barra pre-declarada de caída de balanced accuracy de la sonda (≥ 0.25) resultó ilegible porque, tras la actualización 10, el brazo attached no emite peeks y la balanced accuracy degenera en especificidad (1.0); la firma de colapso se traslada al canal de norma.
- Advertencia de escala explícita: la replicación es miniaturizada (0,6B, 200 actualizaciones, semilla 0) frente al resultado del artículo medido en un modelo de 9B sobre Countdown real; los números no son transferibles cuantitativamente.
- El arnés original de la sonda leía 0.625 donde el lector correcto leía 0.962; se corrigió con un lector por-texto sin padding, pero este tipo de errores de medición es un riesgo latente en cualquier replicación.
- Desviaciones declaradas respecto al artículo: GRPO LR 1e-05 y otras cantidades no especificadas en el texto HTML del arXiv; el autor las documenta en `config.json` (`deviations`) y `HYPERPARAMS.md`.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse el repositorio antes de cualquier uso.
- Idiomas no declarados; no hay evaluación de sesgos, alucinación ni robustez.
- Riesgo de alucinación: no evaluado; el modelo no está caracterizado fuera de la tarea de Countdown.
- Estado de publicación: subido el 2026-11-24 por orden explícita del autor, lo que levanta una regla previa de no subida solo para el brazo Leg B; su continuidad y mantenimiento no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/accidentalgenius101/goodfire-legB-B-detached
- Artículo de referencia: arXiv:2611.07071, "Shaping & Monitoring Models through their Internal Representations" (Goodfire)
- Librería `reliance` de Goodfire: no disponible en la información proporcionada
- Repositorio de replicación (workspace con `legB/REPAIR.md`, `HYPERPARAMS.md`, `config.json`): no disponible como enlace público en la información proporcionada
