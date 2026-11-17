# EphAsad/SatellaHeartRhythm

## Resumen

SatellaHeartRhythm (publicado también como SatellaRhythm-Edge v0.3) es un modelo experimental de clasificación de ritmo cardiaco y calidad de señal a partir de electrocardiogramas (ECG) de una sola derivación. Lo desarrolla Zain Asad (EphraimAsad) y se distribuye en Hugging Face con pesos en ONNX y safetensors. No es un modelo de lenguaje: es una red convolucional 1D de aproximadamente 2,87 millones de parámetros, diseñada para inferencia en CPU y entornos de borde (edge).

El modelo resuelve un problema acotado: dada una ventana de 10 segundos de señal ECG muestreada a 300 Hz (3.000 muestras float32), produce dos salidas independientes mediante dos cabezas. La cabeza de ritmo clasifica en `NORMAL`, `ATRIAL_FIBRILLATION` u `OTHER_RHYTHM`; la cabeza de calidad clasifica en `INTERPRETABLE` o `UNINTERPRETABLE`. Una política de posprocesado puede emitir `REVIEW_UNINTERPRETABLE` cuando el riesgo de calidad supera un umbral.

Es relevante ahora por su enfoque de despliegue ligero (ONNX Runtime en CPU, sin GPU ni servicio API) y por su transparencia sobre limitaciones: el autor declara explícitamente que es de uso exclusivamente investigador, que la puerta de aceptación predefinida no se superó y que no existe validación clínica prospectiva ni independiente de paciente. Es, por tanto, un artefacto de investigación reproducible más que un componente listo para producción sanitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual 1D temporal con doble cabeza (ritmo y calidad) y pooling medio y máximo |
| Parametros totales | 2.873.573 (safetensors); la model card indica 2.867.109 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de inferencia de 10 s, 1 derivación, 3.000 muestras a 300 Hz |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX float32 y safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`satellarhythm_edge_v03.onnx`) y safetensors |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional residual 1D temporal con dos cabezas de clasificación independientes. La entrada nativa es una ventana de 10 segundos de una sola derivación a 300 Hz, con tensor ONNX de forma `[batch, 1, 3000]`. Las salidas son `rhythm_logits` de forma `[batch, 3]` y `quality_logits` de forma `[batch, 2]`. El preprocesado consiste en restar la mediana, dividir por el valor absoluto del percentil 90 y recortar a `[-6, 6]`. En inferencia se procesan cinco ventanas por registro y se promedian las probabilidades; el riesgo de calidad se calcula como `0,7 × probabilidad media de no interpretable + 0,3 × probabilidad máxima por ventana`, con umbral de rechazo de `0,45`. Los umbrales de confianza de ritmo y de normalidad quedaron fijados en `0,00`, por lo que el rechazo por confianza no está activo en este checkpoint.

El entrenamiento usó dos corpus públicos de PhysioNet. Del PhysioNet/CinC Challenge 2017 se tomaron registros portátiles AliveCor de una derivación con etiquetas `N`, `A`, `O` y `~` (ritmo y calidad); los registros `~` no recibieron etiquetas de ritmo artificiales. Del PhysioNet/CinC Challenge 2011 Set A se extrajo la derivación I de registros de 12 derivaciones y se remuestreó como supervisión auxiliar de calidad, con la advertencia de que la etiqueta indica aceptabilidad del registro completo de 12 derivaciones, no necesariamente de su derivación I. No se usaron registros ruidosos sintéticos y la extensión de entrenamiento AFDB quedó desactivada. Los entrenamientos se hicieron en dos fases: un calentamiento solo de ritmo y un refinamiento conjunto de ritmo y calidad con pesos menores para la pérdida auxiliar de calidad; se compararon dos recetas en validación y se seleccionó `quality_moderate`.

## Capacidades

- Clasificación de ritmo cardiaco en tres clases (`NORMAL`, `ATRIAL_FIBRILLATION`, `OTHER_RHYTHM`) sobre ECG de una derivación.
- Clasificación de calidad de señal en dos clases (`INTERPRETABLE`, `UNINTERPRETABLE`).
- Emisión de una etiqueta de revisión (`REVIEW_UNINTERPRETABLE`) mediante política de posprocesado basada en riesgo de calidad.
- Procesamiento de ventanas de 10 segundos a 300 Hz con remuestreo interno desde otras frecuencias soportadas por el wrapper.
- Agregación de cinco ventanas por registro con promedio de probabilidades.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU, API ni Hub Space.
- Validación básica de entradas (rechazo de señales planas, demasiado cortas o demasiado largas), aunque el autor advierte que no detecta de forma fiable todos los artefactos reales.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- Investigación en detección de fibrilación auricular: el modelo permite reproducir experimentos de clasificación binaria AF frente a ritmo normal sobre registros de una derivación, con la ventaja de que la cabeza de calidad ayuda a separar señales no interpretables antes de analizar el ritmo.
- Filtrado previo de calidad en pipelines de investigación con wearables: puede usarse para descartar ventanas de ECG con baja calidad (`UNINTERPRETABLE`) antes de pasarlas a modelos de análisis más costosos, reduciendo cómputo y falsos positivos.
- Evaluación comparativa de arquitecturas ligeras: con 2,87 millones de parámetros y formato ONNX, sirve como línea base de bajo coste frente a modelos más grandes en estudios de eficiencia en clasificación de series temporales biomédicas.
- Docencia y formación técnica: su tamaño reducido y su API de inferencia simple (`RhythmEdge`) lo hacen útil para explicar preprocesado de ECG, ventaneo, agregación de probabilidades y calibración en cursos de aprendizaje automático aplicado a señales.
- Pruebas de integración en dispositivos de borde: al ejecutarse en CPU con ONNX Runtime, permite prototipar el flujo completo (captura, preprocesado, inferencia, decisión de revisión) en hardware sin GPU antes de sustituir el modelo por uno validado.
- Estudio de umbrales y políticas de rechazo: los parámetros de riesgo de calidad y los umbrales de confianza son configurables, lo que permite investigar el compromiso entre cobertura y fiabilidad en conjuntos de datos propios.
- Reproducibilidad de resultados: al publicar pesos, script de inferencia y configuración, facilita la replicación de experimentos y la auditoría de metodología por parte de otros grupos.

## Benchmarks y rendimiento

La información disponible no incluye la tabla de resultados de benchmarks completa: la model card se interrumpe en la sección de rendimiento medido. El autor indica que las métricas declaradas son de validación e investigación, que la puerta de aceptación predefinida no se superó y que las probabilidades no están calibradas. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo previsto; la inferencia se ejecuta en CPU con ONNX Runtime. En GPU el modelo ocupa del orden de decenas de MB en float32 (2,87 millones de parámetros), aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponibles; el autor no requiere GPU para inferencia.
- Cabe en GPU de consumo: sí, por tamaño, aunque el diseño apunta a CPU y entornos de borde.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider`; el wrapper `RhythmEdge` gestiona preprocesado, remuestreo y agregación de ventanas. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que, por categoría (clasificación de ECG de una derivación en formato ONNX), los competidores habituales serían modelos de la familia de clasificadores de PhysioNet/CinC 2017, pero no se aportan datos de parámetros, contexto ni rendimiento que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto/ventana | Licencia | Formato |
|---|---|---|---|---|
| SatellaHeartRhythm | 2.873.573 | 10 s, 1 derivacion, 300 Hz | no disponible | ONNX, safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso exclusivamente investigador: el autor declara explícitamente "NOT FOR CLINICAL USE"; no debe emplearse para diagnóstico, cribado, triaje, tratamiento, decisiones médicas ni para tranquilizar al usuario sobre un registro normal.
- La puerta de aceptación predefinida de investigación no se superó y no se ha demostrado validación clínica prospectiva, independiente de paciente ni con dispositivos nuevos.
- Incluso una predicción `NORMAL` no descarta un problema cardiaco.
- Las probabilidades de salida no están calibradas y no deben interpretarse como probabilidades clínicas.
- La separación por paciente no está verificada; el mismo corpus se usó en experimentos previos de SatellaRhythm, por lo que la partición de test no es una evaluación independiente completamente intacta.
- La supervisión auxiliar de calidad procede de etiquetas de aceptabilidad del registro completo de 12 derivaciones, no necesariamente de su derivación I.
- No se probaron cohortes pediátricas, poblaciones externas ni fabricantes de wearables distintos de los del corpus.
- El rechazo por confianza de ritmo y de normalidad está desactivado (umbrales a 0,00); la política final depende solo del umbral de riesgo de calidad (0,45), que no constituye un mecanismo de seguridad clínica adecuado.
- Las comprobaciones de validez de entrada no detectan de forma fiable todos los artefactos del mundo real.
- La configuración de validación no es un monitor continuo en streaming; para entradas de 10 segundos las ventanas pueden solaparse.
- La licencia no está disponible, por lo que se desconoce si se permite uso comercial.
- Riesgo de sesgo por la composición de los corpus de entrenamiento (dispositivos AliveCor y registros clínicos de 12 derivaciones), no caracterizado en la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/EphAsad/SatellaHeartRhythm
- Hugging Face (checkpoint referenciado en la model card): https://huggingface.co/EphAsad/SatellaRhythm-Edge
- Repositorio GitHub: https://github.com/EphraimAsad/SatellaRhythm
- PhysioNet/CinC Challenge 2017: https://physionet.org/content/challenge-2017/1.0.0/
- PhysioNet/CinC Challenge 2011 Set A: https://physionet.org/content/challenge-2011/1.0.0/
