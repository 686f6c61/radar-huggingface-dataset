# MyHeartCounts/openmhc-fedformer-imp

## Resumen

OpenMHC FEDformer es un checkpoint de referencia para la librería OpenMHC, un marco de trabajo orientado a modelos fundacionales sobre datos de dispositivos vestibles (wearables). Lo desarrolla el equipo OpenMHC (AshleyLab) y su función concreta es la imputación de ventanas de sensores enmascaradas: reconstruir series temporales multicanal con valores ausentes. El modelo se publica como parte del benchmark OpenMHC para permitir la reproducción y comparación metodológica de resultados de imputación.

Técnicamente es un envoltorio sobre un imputador respaldado por PyPOTS, con una arquitectura FEDformer (transformer con mecanismos de atención en el dominio de la frecuencia) configurada para ventanas diarias de 1440 minutos y 19 canales de sensores. El checkpoint fija hiperparámetros concretos: 2 capas, dimensión de modelo 512, 8 cabezas de atención, 128 unidades en la capa feed-forward, 32 modos de Fourier y selección aleatoria de modos.

Su relevancia es acotada pero clara: sirve como referencia reproducible dentro del ecosistema OpenMHC y como ejemplo de aplicación de FEDformer a imputación de series temporales de salud. No es un modelo de propósito general ni un modelo de lenguaje: no procesa texto, no genera lenguaje natural y no está pensado para uso clínico. La licencia BigScience OpenRAIL-M impone restricciones de uso, incluida la prohibición de ofrecer consejo médico o interpretación de resultados médicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FEDformer (transformer con atención en dominio de frecuencia), variante "Fourier" |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 1440 pasos (minutos) de serie temporal; no es contexto textual |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | checkpoint PyPOTS (`model.pypots`) más sidecars JSON (`fourier_modes.json`, `normalization_stats.json`, `openmhc_manifest.json`) |

Hiperparámetros fijados en `openmhc_manifest.json`: `n_steps=1440`, `n_features=19`, `n_layers=2`, `d_model=512`, `n_heads=8`, `d_ffn=128`, `moving_avg_window_size=25`, `dropout=0.1`, `modes=32`, `mode_select="random"`, `variant="Fourier"`.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FEDformer, un transformer que sustituye la atención convencional por mecanismos en el dominio de la frecuencia (transformada de Fourier) para reducir la complejidad y capturar patrones globales en series temporales largas. La variante utilizada es "Fourier" con 32 modos y selección aleatoria de índices de base (`mode_select="random"`), un componente estocástico en tiempo de entrenamiento que ahora se persiste en el sidecar `fourier_modes.json` y se recarga en inferencia para garantizar coherencia entre entrenamiento y despliegue.

El entrenamiento se realizó sobre el split de imputación de OpenMHC, con ventanas diarias de 1440 minutos y 19 canales de sensores de wearables. La reconstrucción se plantea como una tarea de imputación sobre ventanas enmascaradas. La versión v1.1 (retrenada el 2026-06-02) corrige un fallo de la v1.0, en la que la ausencia del sidecar de índices de Fourier producía reconstrucciones incorrectas; según la model card, v1.1 es la versión evaluada en el bootstrap del paper de OpenMHC. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables, por otra parte, a este tipo de modelo).

## Capacidades

- Imputación de series temporales multicanal: reconstruye ventanas enmascaradas de 19 canales de sensores sobre ventanas diarias de 1440 minutos.
- Modelado de dependencias de largo alcance mediante atención en el dominio de la frecuencia (FEDformer).
- Normalización por canal mediante estadísticas z-score persistidas (`normalization_stats.json`).
- Reproducibilidad de benchmark: integración con `openmhc.evaluate_imputation` para evaluación estandarizada.
- Versionado por revisión: permite fijar revisiones concretas (por ejemplo `@v1.1`) para reproducibilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo especializado en series temporales.

## Casos de uso

- Reproducción de benchmarks de imputación: usar `openmhc.evaluate_imputation(imp, version="xs")` para replicar los resultados del paper de OpenMHC y comparar metodologías de imputación sobre el mismo split.
- Comparación metodológica de imputadores: servir como referencia FEDformer frente a otros imputadores del ecosistema PyPOTS sobre ventanas de 1440 minutos y 19 canales.
- Preprocesamiento de datos de wearables para investigación: rellenar huecos en series de sensores antes de análisis estadísticos posteriores, aprovechando la reconstrucción de ventanas enmascaradas.
- Desarrollo de pipelines de datos de salud: integrar el checkpoint en flujos de limpieza de datos de dispositivos vestibles dentro de entornos de investigación, con la advertencia de que no es apto para decisiones clínicas.
- Docencia y formación en series temporales: ilustrar el funcionamiento de FEDformer y de la imputación con máscaras sobre datos reales de sensores.
- Validación de infraestructura de despliegue: probar la integración de checkpoints PyPOTS con la librería OpenMHC y sus extras (`openmhc[pypots,hf]`) en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 2 capas, `d_model=512` y ventanas de 1440×19, el modelo es de tamaño moderado, pero no se ofrecen cifras oficiales de memoria.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint (repo de 0.0 GB según Hugging Face) y la configuración de 2 capas, es plausible que quepa en GPU de consumo, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado oficialmente; el tamaño reducido del repo sugiere que sí, pero debe verificarse empíricamente.
- Opciones de despliegue: la vía documentada es la librería `openmhc` con los extras `openmhc[pypots,hf]`, cargando el checkpoint con `FEDformerImputer.from_release("hf://MyHeartCounts/openmhc-fedformer-imp")`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, este checkpoint se sitúa en la categoría de imputadores de series temporales del ecosistema PyPOTS (junto con otras arquitecturas como SAITS, BRITS o Transformer-based), pero no se aportan cifras comparativas verificables.

| Modelo | Arquitectura | Ventana | Canales | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| OpenMHC FEDformer (este) | FEDformer (Fourier) | 1440 min | 19 | OpenRAIL-M | no disponible |
| Otros imputadores PyPOTS | varias | no disponible | no disponible | según modelo | no disponible |

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación, comparación metodológica y reproducción del benchmark OpenMHC.
- Fuera de alcance explícito: diagnóstico, cribado, pronóstico, predicción prospectiva de riesgo, apoyo a decisiones clínicas o cualquier otra decisión médica.
- Las etiquetas de condiciones médicas de OpenMHC son autoinformadas y carecen de fechas de diagnóstico; el rendimiento en el benchmark no establece utilidad clínica.
- Cualquier afirmación diagnóstica, pronóstica o de cribado requiere validación independiente con resultados clínicamente adjudicados y alineados temporalmente en la población objetivo.
- La licencia BigScience OpenRAIL-M impone restricciones de uso en su Anexo A, incluyendo la prohibición de proporcionar consejo médico e interpretación de resultados médicos.
- La versión v1.0 producía reconstrucciones incorrectas por la ausencia del sidecar de índices de Fourier; debe usarse v1.1 o posterior.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de reconstrucciones plausibles pero incorrectas en ventanas con muchos valores ausentes.
- Sesgos conocidos: no documentados en la información disponible; pueden existir sesgos derivados de la población representada en el dataset OpenMHC.
- Limitaciones de idioma: no aplica (modelo no lingüístico).
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MyHeartCounts/openmhc-fedformer-imp
- Repositorio OpenMHC: https://github.com/AshleyLab/OpenMHC
- PyPOTS: https://github.com/WenjieDu/PyPOTS
- Licencia BigScience OpenRAIL-M: incluida en el repositorio del modelo (`LICENSE`)
