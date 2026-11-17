# EphAsad/SatellaRhythm-Edge

## Resumen

SatellaRhythm-Edge es un modelo experimental de clasificación de ritmo cardíaco y calidad de señal a partir de electrocardiogramas (ECG) de una sola derivación, desarrollado por Zain Asad (EphraimAsad). Se trata de una red neuronal convolucional 1D residual con doble cabeza (una para ritmo y otra para calidad de señal) de tan solo 2.867.109 parámetros, diseñada para inferencia en CPU mediante ONNX Runtime. El modelo acepta ventanas de 10 segundos muestreadas a 300 Hz (3.000 muestras float32) y devuelve dos salidas independientes: una clasificación de ritmo (`NORMAL`, `ATRIAL_FIBRILLATION`, `OTHER_RHYTHM`) y una clasificación de calidad (`INTERPRETABLE`, `UNINTERPRETABLE`).

El modelo se entrenó con datos de los retos PhysioNet/CinC 2017 (registros de una derivación con AliveCor) y PhysioNet/CinC 2011 Set A (derivación I extraída de registros de 12 derivaciones para supervisión auxiliar de calidad). Su relevancia radica en ser un checkpoint extremadamente ligero y desplegable sin GPU, orientado a investigación en detección de fibrilación auricular. No obstante, el propio autor declara explícitamente que **no es apto para uso clínico** y que la puerta de aceptación predefinida de investigación **no se superó**.

La ficha se basa únicamente en la model card y los metadatos disponibles; no se han publicado resultados numéricos de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN 1D residual temporal con doble cabeza y pooling medio y máximo |
| Parámetros totales | 2.867.109 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de inferencia de 10 segundos, una derivación (3.000 muestras a 300 Hz) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de señales, no de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`satellarhythm_edge_v03.onnx`) y safetensors |

## Arquitectura y entrenamiento

La arquitectura es una CNN 1D residual temporal con dos cabezas de clasificación independientes y pooling combinado (media y máximo). La entrada nativa son 3.000 muestras float32 correspondientes a 10 segundos de una única derivación de ECG a 300 Hz. El preprocesado consistente en restar la mediana, dividir por el percentil 90 del valor absoluto y recortar a [-6, 6] debe aplicarse antes de la inferencia; el wrapper de alto nivel `RhythmEdge` lo implementa. La inferencia agrega cinco ventanas por registro promediando probabilidades, y calcula un riesgo de calidad como 0,7 × probabilidad media de no interpretable + 0,3 × probabilidad máxima por ventana, con umbral de rechazo de 0,45.

El entrenamiento usó PhysioNet/CinC Challenge 2017 (registros de una derivación AliveCor con etiquetas `N`, `A`, `O`, `~`; los registros `~` no reciben etiqueta de ritmo artificial) y PhysioNet/CinC Challenge 2011 Set A (derivación I extraída y remuestreada para supervisión auxiliar de calidad; las etiquetas indican aceptabilidad del registro completo de 12 derivaciones, no necesariamente de su derivación I). No se usaron grabaciones sintéticas ruidosas ni la extensión de entrenamiento AFDB. Las formas de onda se deduplicaron por coincidencia exacta antes de una partición estratificada disjunta por registro; la separación disjunta por paciente no está verificada. El proceso tuvo dos etapas: calentamiento solo de ritmo y refinamiento conjunto ritmo/calidad con pesos menores para la pérdida auxiliar de calidad; se compararon dos recetas predefinidas en validación y se seleccionó `quality_moderate`. Los umbrales de rechazo se eligieron en validación y la puntuación final de test se realizó tras congelar el modelo.

## Capacidades

- Clasificación de ritmo en tres clases: `NORMAL`, `ATRIAL_FIBRILLATION`, `OTHER_RHYTHM`.
- Clasificación de calidad de señal en dos clases: `INTERPRETABLE`, `UNINTERPRETABLE`.
- Emisión de una etiqueta de posprocesado `REVIEW_UNINTERPRETABLE` cuando el riesgo de calidad supera 0,45.
- Agregación de cinco ventanas por registro con promediado de probabilidades.
- Remuestreo interno a 300 Hz desde otras frecuencias compatibles mediante el wrapper.
- Rechazo de entradas inválidas, planas, demasiado cortas o demasiado largas (comprobaciones no fiables para todos los artefactos reales).
- Inferencia en CPU sin GPU ni servicio API, mediante ONNX Runtime.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; es un clasificador de señales de ECG.

## Casos de uso

- Investigación en detección de fibrilación auricular: el modelo permite reproducir experimentos de clasificación de ritmo sobre registros de una derivación con un checkpoint ligero y desplegable en CPU, útil para comparar pipelines de preprocesado o estrategias de agregación de ventanas.
- Prototipado de sistemas de triaje de calidad de señal: la cabeza de calidad permite filtrar registros no interpretables antes de pasarlos a un modelo de ritmo más costoso, usando el umbral de riesgo de calidad de 0,45.
- Evaluación de despliegue en dispositivos de bajo consumo: con 2,87 M de parámetros y formato ONNX, el modelo puede ejecutarse en entornos sin GPU para estudiar latencia y viabilidad de inferencia en el borde.
- Docencia y formación en procesado de señales biomédicas: sirve como ejemplo completo de preprocesado (mediana, percentil 90, recorte), ventaneado y agregación sobre ECG de una derivación.
- Investigación sobre calibración de probabilidades: dado que el autor advierte que las probabilidades no están calibradas, el modelo es un caso de estudio para analizar calibración y umbrales en clasificación médica.
- Comparación de estrategias de entrenamiento multi-tarea: la combinación de una tarea principal de ritmo con supervisión auxiliar de calidad permite estudiar el efecto de pérdidas auxiliares y pesos en el rendimiento final.
- Análisis retrospectivo de conjuntos de datos PhysioNet: el modelo puede aplicarse a registros de los retos 2017 y 2011 para estudiar discrepancias entre etiquetas y predicciones en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas de tipo F1 en las etiquetas, pero el texto proporcionado se interrumpe antes de mostrar los valores medidos, y el autor indica que la puerta de aceptación predefinida de investigación no se superó.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario previsto; el modelo está pensado para CPU con ONNX Runtime.
- GPU recomendadas: no se especifican; no requiere GPU.
- ¿Cabe en GPU de consumo? Sí, con 2,87 M de parámetros el modelo es trivial para cualquier GPU de consumo, aunque el caso de uso declarado es CPU.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider`; el wrapper `RhythmEdge` de `infer_onnx.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.
- Dependencias: Python 3.10+, `huggingface_hub`, `numpy`, `scipy`, `onnxruntime`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificación de ECG de una derivación con doble cabeza de ritmo y calidad) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- **No apto para uso clínico**: el autor prohíbe explícitamente su uso para diagnóstico, cribado, triaje, tratamiento, decisiones médicas o para tranquilizar sobre la normalidad de un registro. Incluso una predicción `NORMAL` no descarta un problema cardíaco.
- La puerta de aceptación predefinida de investigación **no se superó**.
- No se ha demostrado validación clínica independiente por paciente, con dispositivos nuevos ni prospectiva.
- Las probabilidades predichas no están calibradas y no deben interpretarse como probabilidades clínicas.
- En este checkpoint los umbrales de confianza de ritmo y de normalidad se seleccionaron como 0,0, por lo que el rechazo basado en confianza no está activo; la política final depende solo del umbral de riesgo de calidad.
- La separación disjunta por paciente no está verificada; el mismo corpus se analizó en experimentos previos de SatellaRhythm, por lo que la partición de test no es una evaluación independiente completamente intacta.
- No se probaron fabricantes de wearables externos, poblaciones distintas, cohortes pediátricas ni conjuntos clínicos prospectivos.
- Las comprobaciones de validez del wrapper no detectan de forma fiable todos los artefactos del mundo real.
- La ventana de 10 segundos puede solapar ventanas en la configuración de validación; no es un monitor continuo en streaming.
- No se especifican sesgos conocidos ni licencia; la ausencia de licencia declarada impide determinar las restricciones de uso comercial.
- Solo acepta formas de onda de ECG de una derivación; no acepta PPG, imágenes de ECG, cifras de frecuencia cardíaca ni picos R.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EphAsad/SatellaRhythm-Edge
- Repositorio GitHub: https://github.com/EphraimAsad/SatellaRhythm
- PhysioNet/CinC Challenge 2017: https://physionet.org/content/challenge-2017/1.0.0/
- PhysioNet/CinC Challenge 2011 Set A: https://physionet.org/content/challenge-2011/1.0.0/
