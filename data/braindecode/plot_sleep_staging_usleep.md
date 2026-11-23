# braindecode/plot_sleep_staging_usleep

## Resumen

`plot_sleep_staging_usleep` es un repositorio de artefactos preentrenados publicado por el proyecto Braindecode en Hugging Face. No es un modelo de lenguaje, sino un checkpoint de un clasificador de sueño basado en la arquitectura U-Sleep, entrenado para la estadificación automática de fases del sueño a partir de señales EEG. El repositorio contiene únicamente los pesos del clasificador (`params.safetensors`), el historial de entrenamiento de Skorch (`history.json`) y un resumen de métricas (`metadata.json`); su función es servir de soporte al tutorial `examples/applied_examples/plot_sleep_staging_usleep.py` de la documentación de Braindecode.

El modelo se entrenó con la base de datos Sleep-EDF Expanded (estudio Sleep Cassette, PhysioNet sleep-edfx 1.0.0), cargada mediante la clase `SleepPhysionet` de Braindecode usando solo los canales EEG Fpz-Cz y Pz-Oz. La tarea es de clasificación supervisada en cinco clases de sueño (vigilia, N1, N2, N3 y REM). El checkpoint corresponde a un entrenamiento muy reducido: una noche para entrenamiento (sujeto 0, noche 2) y otra para validación (sujeto 1, noche 2), con las primeras 400 ventanas de 30 segundos de cada registro.

Es relevante ahora por dos motivos. Primero, la model card advierte de que las métricas almacenadas en `history.json` y `metadata.json` (balanced accuracy de 0,304) son erróneas: se registraron antes del PR #1669, cuando la función `predict` aplicaba el softmax sobre el eje equivocado. Con la corrección, los pesos de `params.safetensors` alcanzan una balanced accuracy de 0,612 sobre la noche de validación (azar = 0,2), según la medición del PR #1789. Segundo, desde Braindecode 2.1 el tutorial entrena U-Sleep por sí mismo y ya no lee este repositorio; los ficheros se mantienen solo para que el tutorial de la versión 2.0 siga funcionando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Sleep (clasificador de estadificación del sueño sobre EEG, implementado en Braindecode) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada por ventanas de 30 s de EEG (canales Fpz-Cz y Pz-Oz) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no aplica (modelo sobre señales fisiológicas, no texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`params.safetensors`), más `history.json` y `metadata.json` |
| Libreria | braindecode |
| Dataset de entrenamiento | nm000185 (Sleep-EDF Expanded, Sleep Cassette, PhysioNet sleep-edfx 1.0.0) |
| Modalidad | EEG |
| Clases de salida | 5 (vigilia, N1, N2, N3, REM) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es U-Sleep, una red neuronal convolucional de tipo encoder-decoder con conexiones de salto (U-Net) adaptada a la estadificación del sueño sobre EEG, implementada dentro del ecosistema Braindecode sobre PyTorch. El modelo recibe ventanas de 30 segundos de las dos derivaciones EEG (Fpz-Cz y Pz-Oz) y produce una etiqueta de fase de sueño entre cinco clases. No se dispone de detalles publicados en la información proporcionada sobre el número de capas, canales por bloque, función de pérdida exacta ni hiperparámetros del entrenamiento más allá de los que documenta la model card.

El entrenamiento es deliberadamente mínimo, orientado a la reproducibilidad del tutorial y no al rendimiento de producción. Se usó `SleepPhysionet` con `subject_ids=[0, 1]`, `recording_ids=[2]` y `crop_wake_mins=30`, seguido de un recorte `crop=(0, 12000 s)` que retiene las primeras 400 ventanas de 30 s. La partición se hizo con `BaseConcatDataset.split(dict(train=..., valid=...))`, cuyos valores son índices de registro sobre el dataset concatenado (no identificadores de sujeto): el sujeto 0, noche 2, actúa como entrenamiento y el sujeto 1, noche 2, como validación para un `EarlyStopping(load_best=True)`. El entrenamiento supervisado se ejecutó con Skorch, cuyo historial se conserva en `history.json`. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de aumento de datos más allá de las transformaciones estándar de Braindecode.

## Capacidades

- Clasificación de fases del sueño en cinco clases (vigilia, N1, N2, N3, REM) a partir de EEG de dos canales.
- Procesamiento de señales EEG en ventanas de 30 segundos, alineadas con la convención estándar de estadificación del sueño (épocas de 30 s según AASM).
- Integración nativa con la librería Braindecode: carga mediante `from_pretrained`, acceso a `model.card_data.datasets` y compatibilidad con el pipeline de `SleepPhysionet`.
- Reproducción de las predicciones mostradas en la documentación de Braindecode 2.0 sin reentrenar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión, audio ni capacidades multilingües: es un clasificador de señales, no un modelo generativo.

## Casos de uso

- Reproducción de tutoriales y documentación: cargar el checkpoint con `from_pretrained` en Braindecode 2.0 para generar las gráficas de predicción del tutorial `plot_sleep_staging_usleep.py` sin reentrenar, garantizando que la documentación muestra salidas estables.
- Docencia en neuroingeniería: usar el par de ficheros `params.safetensors` + `history.json` para ilustrar el ciclo completo de entrenamiento, validación con `EarlyStopping` y evaluación de un clasificador EEG en un caso real y de tamaño manejable.
- Verificación de pipelines de Braindecode: servir como referencia para comprobar que una instalación de Braindecode carga correctamente pesos safetensors y reproduce las métricas esperadas (balanced accuracy de 0,612 en la noche de validación con la función `predict` corregida).
- Pruebas de regresión en código de decodificación EEG: al ser un checkpoint pequeño y con métricas conocidas, permite detectar regresiones en transformaciones de datos, recortes de ventana o ejes de softmax en versiones futuras de la librería.
- Punto de partida para ajuste fino: los pesos pueden servir como inicialización para un entrenamiento supervisado de U-Sleep sobre un conjunto mayor de noches o sobre otros canales EEG, aunque el autor no documenta este flujo.
- Comparación metodológica: confrontar el rendimiento de un U-Sleep entrenado con dos noches frente a entrenamientos completos sobre Sleep-EDF, para dimensionar el efecto del tamaño del conjunto de entrenamiento en la estadificación del sueño.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Balanced accuracy (validación) | 0,612 | Noche del sujeto 1, con `predict` corregido (PR #1789) |
| Balanced accuracy (azar) | 0,2 | Clasificación de 5 clases equilibrada |
| Balanced accuracy registrada en `history.json` / `metadata.json` | 0,304 | Métrica errónea, calculada antes del PR #1669 (softmax sobre eje incorrecto) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un checkpoint de un clasificador convolucional sobre ventanas de 30 s y dos canales, la huella es muy inferior a la de un modelo de lenguaje, pero no se publica una cifra concreta.
- GPU recomendadas: no disponible. Cualquier GPU compatible con PyTorch y Braindecode debería poder ejecutar la inferencia; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No hay dato explícito, pero por la naturaleza del modelo (clasificador EEG, repositorio de 0.0 GB) es esperable que quepa en GPUs de consumo; el autor no lo confirma.
- Opciones de despliegue: carga mediante la librería Braindecode (`from_pretrained`) sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `braindecode/plot_sleep_staging_usleep` | no disponible | Ventanas EEG de 30 s, 2 canales | Balanced accuracy 0,612 en 1 noche de validación | BSD-3-Clause | Hugging Face (braindecode) |
| U-Sleep (modelo original, Perslev et al.) | no disponible en la información proporcionada | Ventanas EEG de 30 s | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |
| U-Sleep entrenado en el tutorial de Braindecode 2.1 (PR #1789) | no disponible | Ventanas EEG de 30 s | no disponible en la información proporcionada | BSD-3-Clause (código Braindecode) | Repositorio de Braindecode |

No se dispone de datos suficientes en la información proporcionada para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Métricas erróneas en los ficheros publicados: `history.json` y `metadata.json` registran una balanced accuracy de 0,304 que es incorrecta; la cifra válida con la función `predict` corregida es 0,612. Cualquier evaluación que lea esas métricas sin corregirlas obtendrá conclusiones falsas.
- Entrenamiento mínimo: solo una noche de entrenamiento (sujeto 0, noche 2) y una de validación (sujeto 1, noche 2), con 400 ventanas de 30 s por registro. El modelo no está pensado para uso clínico ni para generalizar a otras poblaciones, dispositivos o montajes de canales.
- Dependencia de versión: solo la versión 2.0 de Braindecode carga estos ficheros; a partir de 2.1 el tutorial entrena U-Sleep por sí mismo y no lee el repositorio. El checkpoint quedó congelado como compatibilidad hacia atrás.
- Entrada restringida: únicamente canales EEG Fpz-Cz y Pz-Oz de Sleep-EDF; no se documenta soporte para otras derivaciones, EOG, EMG ni datos de otros dispositivos.
- Riesgo de sobreajuste y sesgo de muestra: con dos sujetos y dos noches, el modelo puede reflejar particularidades del registro y no ser representativo de la variabilidad interindividual del sueño.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución y sin endorsement; no obstante, la licencia del modelo no sustituye a las condiciones de uso de los datos de Sleep-EDF (PhysioNet), que deben respetarse por separado.
- No es un modelo generativo: no admite prompts, tool calling ni razonamiento; cualquier uso fuera de la clasificación de fases del sueño sobre EEG no está soportado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/braindecode/plot_sleep_staging_usleep)
- [Organización Braindecode en Hugging Face](https://huggingface.co/braindecode)
- [Documentación de Braindecode](https://braindecode.org/stable/index.html)
- [Referencia de la API de Braindecode](https://braindecode.org/stable/api.html)
- [Repositorio de Braindecode en GitHub](https://github.com/braindecode/braindecode)
- [Braindecode en PyPI](https://pypi.org/project/braindecode/)
- [PR #1669 (corrección de `predict`)](https://github.com/braindecode/braindecode/pull/1669)
- [PR #1789 (entrenamiento de U-Sleep en el tutorial)](https://github.com/braindecode/braindecode/pull/1789)
- [Dataset nm000185 en NEMAR](https://nemar.org/dataset/nm000185)
- [Sleep-EDF Database Expanded en PhysioNet](https://physionet.org/content/sleep-edfx/1.0.0/)
- [Cita de Braindecode en Zenodo (doi:10.5281/zenodo.17699192)](https://doi.org/10.5281/zenodo.17699192)
