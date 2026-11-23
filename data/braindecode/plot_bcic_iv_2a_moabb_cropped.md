# braindecode/plot_bcic_iv_2a_moabb_cropped

## Resumen

`braindecode/plot_bcic_iv_2a_moabb_cropped` no es un modelo de lenguaje, sino un conjunto de artefactos preentrenados (checkpoint) asociados a un tutorial de la librería Braindecode. Contiene los pesos de un clasificador ShallowFBCSPNet entrenado para decodificación de imaginación motora (motor imagery) de cuatro clases sobre señales EEG del dataset BCI Competition IV 2a (BNCI2014_001 en MOABB). Su propósito es que la documentación de Braindecode pueda mostrar predicciones estables sin reentrenar el modelo desde cero cada vez que se generan los ejemplos de la galería.

El modelo se entrenó únicamente con el sujeto 3 del dataset, en modalidad de decodificación "cropped" (predicción densa sobre ventanas de 1000 muestras), lo que lo convierte en un artefacto de demostración reproducible más que en un modelo de propósito general. El repositorio incluye tres ficheros: `params.safetensors` con los parámetros del clasificador, `history.json` con el historial de entrenamiento de Skorch usado en las gráficas del tutorial y `metadata.json` con las métricas resumidas del checkpoint.

Es relevante en el contexto de la investigación en interfaces cerebro-computador (BCI) porque ejemplifica el flujo completo de Braindecode: carga de datos vía MOABB, preprocesado, definición de una arquitectura convolucional específica para EEG, entrenamiento supervisado con validación y publicación de los artefactos en el Hub para reproducibilidad. No debe confundirse con un modelo fundacional de EEG ni con un modelo multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ShallowFBCSPNet (CNN superficial con filtros temporales y espaciales, predicción densa sobre ventanas) |
| Parametros totales | no disponible (no se publica el recuento; los pesos están en `params.safetensors`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada de 1000 muestras EEG |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`params.safetensors`) + JSON (`history.json`, `metadata.json`) |
| Modalidad de entrada | EEG, 22 canales, 4 clases de imaginación motora |
| Dataset de entrenamiento | BCI Competition IV 2a (BNCI2014_001, MOABB), sujeto 3 |
| Sesiones | `0train` (entrenamiento), `1test` (validación Skorch / early stopping) |
| Epocas máximas | 100, paciencia 10 |
| Librería | braindecode (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es ShallowFBCSPNet, una CNN superficial pensada para decodificación de EEG que aplica una primera capa de convolución temporal seguida de una convolución espacial (equivalente a filtros tipo FBCSP aprendidos) y una capa de clasificación. En esta variante "cropped" el modelo produce predicciones densas sobre ventanas de 1000 muestras, en lugar de una única etiqueta por trial, lo que permite evaluar el modelo en modo de decodificación continua.

El entrenamiento se realizó exclusivamente sobre el sujeto 3 del dataset BCI Competition IV 2a, cargado a través de MOABB como `BNCI2014_001` (9 sujetos, 22 canales EEG, 4 clases de imaginación motora). Las actualizaciones de gradiente se aplicaron solo sobre la sesión `0train`; la sesión `1test` se usó como conjunto de validación de Skorch con `EarlyStopping(load_best=True)`, restaurando la época con menor pérdida de validación. El preprocesado es el mismo que el del tutorial trialwise equivalente. No se documentan técnicas de aumento de datos, regularización específica ni búsqueda de hiperparámetros más allá de las 100 épocas con paciencia 10.

## Capacidades

- Clasificación de imaginación motora en 4 clases (mano izquierda, mano derecha, pies, lengua) a partir de EEG de 22 canales.
- Decodificación densa ("cropped") sobre ventanas de 1000 muestras, útil para visualizar predicciones continuas.
- Carga directa mediante `from_pretrained` de Braindecode, con acceso a `model.card_data.datasets`.
- Reproducción de las gráficas del tutorial `plot_bcic_iv_2a_moabb_cropped.py` sin reentrenamiento.
- Inspección del historial de entrenamiento vía `history.json` (curvas de pérdida y métricas por época).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un clasificador de señales EEG.

## Casos de uso

- Reproducción de tutoriales de Braindecode: cargar el checkpoint con `from_pretrained` para ejecutar el ejemplo `plot_bcic_iv_2a_moabb_cropped.py` sin necesidad de GPU ni de reentrenar, garantizando que las figuras de la documentación sean estables entre versiones.
- Docencia en BCI: usar el artefacto como referencia de un pipeline completo (MOABB + preprocesado + ShallowFBCSPNet + Skorch) para que el alumnado compare sus propios resultados con un baseline publicado.
- Validación de pipelines de decodificación cropped: servir como punto de comparación al implementar decodificación densa sobre ventanas de 1000 muestras con otros modelos de Braindecode.
- Pruebas de integración de la librería: verificar que `from_pretrained` y la lectura de `metadata.json` funcionan correctamente tras cambios en Braindecode o en el Hub.
- Análisis de curvas de entrenamiento: estudiar `history.json` para entender el comportamiento de `EarlyStopping(load_best=True)` con paciencia 10 en un sujeto concreto del dataset 2a.
- Prototipado de interfaces cerebro-computador en laboratorio: emplear el clasificador como bloque de decodificación de referencia antes de entrenar modelos específicos por sujeto con más datos.
- Benchmarking interno de arquitecturas: comparar ShallowFBCSPNet cropped contra otras arquitecturas de Braindecode (EEGNet, Deep4Net, etc.) bajo el mismo preprocesado y partición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `metadata.json` con métricas resumidas del checkpoint, pero los valores concretos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: muy baja; ShallowFBCSPNet es una CNN superficial y el checkpoint cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la mayoría de configuraciones).
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1060, RTX 3060, RTX 4090; también funciona en CPU para inferencia.
- Cabe en GPU consumer: sí, sin restricciones prácticas.
- Opciones de despliegue: Braindecode (PyTorch) como vía principal; `from_pretrained` carga los pesos desde el Hub. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del tamaño de lote de ventanas EEG.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `braindecode/plot_bcic_iv_2a_moabb_cropped` | ShallowFBCSPNet cropped, sujeto 3 | no disponible | 1000 muestras EEG | BSD-3-Clause | Hugging Face Hub |
| ShallowFBCSPNet trialwise (tutorial Braindecode) | CNN superficial, predicción por trial | no disponible | trial completo | BSD-3-Clause | Braindecode / Hub |
| EEGNet (Braindecode) | CNN compacta para EEG | no disponible | variable | BSD-3-Clause | Braindecode |
| Deep4Net (Braindecode) | CNN profunda para EEG | no disponible | variable | BSD-3-Clause | Braindecode |

La comparación se limita a arquitecturas del ecosistema Braindecode, ya que no existen modelos fundacionales de EEG directamente equivalentes en la información disponible. Los datos de rendimiento comparativo no están publicados.

## Limitaciones y advertencias

- Entrenado solo con el sujeto 3 del dataset BCI Competition IV 2a; no generaliza a otros sujetos sin reentrenamiento.
- Artefacto de tutorial: su objetivo es la reproducibilidad de la documentación, no el uso en producción clínica o comercial.
- No es un modelo de lenguaje ni multimodal; no admite prompts, tool calling ni razonamiento.
- La sesión `1test` se usó para early stopping, por lo que las métricas del checkpoint están influidas por esa selección y no constituyen una estimación limpia de generalización.
- No se documentan análisis de sesgos, robustez ante artefactos (parpadeos, EMG) ni comportamiento fuera del dominio del dataset 2a.
- Licencia BSD-3-Clause: permite uso comercial con atribución, pero el modelo hereda las condiciones del dataset subyacente (BCI Competition IV 2a), que conviene revisar antes de cualquier uso más allá de la investigación.
- Riesgo de sobreajuste al sujeto y a la partición concreta; no debe extrapolarse su rendimiento a otras poblaciones o configuraciones de electrodos.
- Sin soporte documentado de cuantización ni de despliegue en entornos de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/plot_bcic_iv_2a_moabb_cropped
- Metadata del checkpoint: https://huggingface.co/braindecode/plot_bcic_iv_2a_moabb_cropped/resolve/main/metadata.json
- Documentación de Braindecode: https://braindecode.org/stable/index.html
- Referencia de API de Braindecode: https://braindecode.org/stable/api.html
- Organización Braindecode en GitHub: https://github.com/braindecode
- Organización Braindecode en Hugging Face: https://huggingface.co/braindecode
- Paquete en PyPI: https://pypi.org/project/braindecode/
- Dataset BCI Competition IV 2a en NEMAR: https://nemar.org/dataset/nm000139
- Documentación de MOABB BNCI2014_001: https://moabb.neurotechx.com/docs/generated/moabb.datasets.BNCI2014_001.html
- Cita de Braindecode (Zenodo): https://doi.org/10.5281/zenodo.17699192
- Script de entrenamiento original (gist, movido desde el repositorio): https://gist.github.com/bru... (enlace truncado en la model card)
