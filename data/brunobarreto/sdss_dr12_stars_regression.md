# BrunoBarreto/sdss_dr12_stars_regression

## Resumen

sdss_dr12_stars_regression es un modelo de regresión tabular publicado en HuggingFace por el usuario BrunoBarreto que estima parámetros estelares (temperatura efectiva, metalicidad y gravedad superficial) a partir de espectros ópticos del Sloan Digital Sky Survey (SDSS) Data Release 12. No es un modelo de lenguaje: es una red neuronal multitarea con conexiones residuales, implementada en Keras, que consume un vector de 4.000 valores de flujo procesado y devuelve tres salidas escalares simultáneas. El checkpoint principal tiene 530.275 parámetros, corresponde al trial 099 con semilla 42 y selecciona la época 74 de un presupuesto de entrenamiento de 80 épocas.

El release se presenta como un experimento de referencia congelado ("paper-v1") para el trabajo "Stellar Parameter Estimation Using Residual Multitask Neural Networks". Además del modelo principal, el bundle incluye checkpoints y predicciones de variantes CNN, DNN y Transformer, siete ablaciones, historiales de entrenamiento, informes de bootstrap, complejidad y bins de parámetros, y los 100 registros originales del sintonizador de hiperparámetros. El repositorio ocupa 0,3 GB.

Su relevancia es metodológica más que de producto: fija de forma reproducible un punto de comparación con métricas publicadas (MAE de 58,717678 K en Teff, 0,101314 dex en [Fe/H] y 0,131862 dex en log g sobre 14.443 espectros de test) y preserva arrays de predicción originales, lo que permite auditar resultados sin reentrenar. Está licenciado bajo MIT, mientras que el dataset asociado se distribuye por separado bajo CC-BY-4.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal multitarea con conexiones residuales (residual multitask neural network), implementada en Keras |
| Parametros totales | 530.275 (modelo principal, trial 099, semilla 42) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Entrada fija: vector float32 de 4.000 valores de processed_flux sobre la rejilla log10(lambda/Angstrom) = linspace(3.5754, 3.9670, 4000) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de regresión numérica, no procesa texto) |
| Licencia | MIT para el código fuente y los artefactos del modelo; el dataset alojado aparte es CC-BY-4.0 |
| Formato de pesos | Checkpoint de Keras (library_name: keras). El formato de fichero concreto no se detalla en la información disponible; el bundle incluye checkpoints y arrays de predicciones, con hashes en artifact_manifest.json |

## Arquitectura y entrenamiento

El modelo principal es una red multitarea con conexiones residuales que comparte representación entre las tres cabezas de salida (teff_output, feh_output, logg_output) en espacio de objetivo escalado. La entrada es un vector de 4.000 flujos procesados, remuestreados al reposo y estandarizados por espectro según la política publicada del dataset original, sobre una rejilla logarítmica de longitud de onda fija. La salida se entrega en unidades escaladas: para obtener unidades físicas hay que aplicar value * scale + center con target_scaler.json, en el orden Teff (K), [Fe/H] (dex) y log g (dex).

El bundle documenta además arquitecturas alternativas (CNN, DNN y Transformer) entrenadas como comparativas, junto con siete ablaciones, historiales de entrenamiento e informes de bootstrap, complejidad y bins de parámetros. El presupuesto de entrenamiento del modelo principal fue de 80 épocas, con selección de la época 74. La información disponible no especifica el número de tokens ni la composición exacta del dataset, ni indica si se emplearon técnicas de RLHF o DPO (no aplicables en un problema de regresión supervisada). Se documenta explícitamente una limitación de provenance: el commit original del código de entrenamiento no se registró y se declara desconocido; además, el Transformer archivado usó medias de batch de validación sin ponderar para la selección de checkpoint, limitación que se conserva en este release.

## Capacidades

- Regresión de tres parámetros estelares simultáneos a partir de un espectro procesado: temperatura efectiva (Teff, K), metalicidad ([Fe/H], dex) y gravedad superficial (log g, dex).
- Procesamiento de un vector de 4.000 valores float32 de flujo, con remuestreo al reposo y estandarización por espectro ya aplicados.
- Arquitectura multitarea con representación compartida y conexiones residuales; permite analizar el compromiso entre las tres tareas mediante las ablaciones incluidas.
- Predicción por lotes: el bundle conserva arrays de predicciones, lo que facilita la evaluación reproductible sin reentrenamiento.
- Auditoría y reproducción: el flujo stellar_workflow audit --run-dir PATH --verify-transformer permite inferir también desde el checkpoint Transformer archivado (requiere la dependencia opcional de Torch).
- No dispone de generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling, function calling, capacidades de agente ni multilingüismo. No es un modelo de lenguaje.

## Casos de uso

- Estimación de parámetros estelares en pipelines de catálogo: dado un espectro SDSS DR12 procesado según la rejilla publicada, el modelo devuelve Teff, [Fe/H] y log g de forma instantánea, útil para etiquetar lotes grandes de espectros antes de una validación más costosa.
- Control de calidad y detección de valores atípicos: comparar la predicción con las etiquetas del catálogo SSPP permite marcar espectros con problemas de reducción, flujo anómalo o clasificación estelar errónea, usando el MAE de test como umbral de referencia (58,7 K, 0,101 dex, 0,132 dex).
- Punto de referencia reproducible en publicaciones: al congelar checkpoint, semilla, trial y arrays de predicción, sirve como baseline inmutable contra el que comparar nuevos métodos de estimación de parámetros estelares sin depender de reentrenamientos.
- Estudio de poblaciones estelares: la predicción masiva de log g y [Fe/H] sobre muestras de espectros permite construir distribuciones y diagramas de dispersión para análisis estadístico de poblaciones, siempre dentro del dominio cubierto por el dataset.
- Transferencia a otros sondeos espectroscópicos: el modelo puede servir como punto de partida para fine-tuning sobre espectros de otros instrumentos, previa verificación de que el preprocesado se ajusta a la rejilla y estandarización exigidas.
- Docencia y experimentación en regresión multitarea: el bundle incluye ablaciones, historiales y 100 registros de sintonizador, lo que lo convierte en un caso de estudio completo para cursos sobre arquitecturas multitarea, conexiones residuales y análisis de bootstrap.
- Auditoría de resultados publicados: con artifact_manifest.json y las predicciones archivadas se puede verificar la reproducibilidad de las cifras reportadas sin acceso al entrenamiento original.

## Benchmarks y rendimiento

Los únicos resultados cuantitativos presentes en la información disponible son el MAE del modelo principal sobre el conjunto de test de 14.443 espectros.

| Objetivo | Unidad | MAE (test, 14.443 espectros) |
|---|---|---|
| Teff | K | 58,717678 |
| [Fe/H] | dex | 0,101314 |
| log g | dex | 0,131862 |

No se han publicado en la información disponible resultados comparativos de las variantes CNN, DNN y Transformer incluidas en el bundle, ni métricas adicionales como RMSE, R² o sesgo por rango de parámetros, más allá de la existencia de informes de bootstrap, complejidad y bins de parámetros cuyo contenido numérico no se detalla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32, dado que el modelo tiene 530.275 parámetros y la entrada es un vector de 4.000 valores. El tamaño total del repositorio es de 0,3 GB.
- GPU recomendadas: cualquier GPU con soporte para Keras/TensorFlow sirve; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna es más que suficiente. No se requiere A100 ni H100.
- Compatibilidad con hardware de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en CPU, dado el reducido tamaño del modelo y del lote de inferencia.
- Opciones de despliegue: Keras/TensorFlow como vía nativa (library_name: keras); el flujo stellar_workflow ofrece los comandos reproduce-paper y audit con verificación opcional del Transformer vía Torch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables externos de regresión de parámetros estelares con especificaciones publicadas (parámetros, contexto, licencia) que permitan una comparación rigurosa. La única comparación posible es interna al bundle, que incluye checkpoints CNN, DNN y Transformer junto al modelo residual multitarea, pero sus métricas no se detallan en la información disponible.

| Modelo | Parametros | Entrada | MAE Teff | MAE [Fe/H] | MAE log g | Licencia |
|---|---|---|---|---|---|---|
| Residual multitarea (modelo principal) | 530.275 | 4.000 flujos | 58,717678 K | 0,101314 dex | 0,131862 dex | MIT |
| CNN del bundle | No disponible | No disponible | No disponible | No disponible | No disponible | MIT |
| DNN del bundle | No disponible | No disponible | No disponible | No disponible | No disponible | MIT |
| Transformer del bundle | No disponible | No disponible | No disponible | No disponible | No disponible | MIT |

## Limitaciones y advertencias

- La evaluación se realizó con una única semilla archivada y contra etiquetas del catálogo SSPP, no contra verdad física independiente. Los errores reportados miden acuerdo con ese catálogo, no exactitud absoluta.
- El modelo no acepta flujo bruto arbitrario: exige la rejilla log10(lambda/Angstrom) = linspace(3.5754, 3.9670, 4000) con el remuestreo al reposo y la estandarización por espectro publicados. Aplicarlo a entradas con otro preprocesado produce resultados no válidos.
- La política de enmascarado de píxeles nativos del dataset original se preserva, lo que limita la aplicabilidad a espectros con cobertura o resolución distintas.
- El Transformer archivado usó medias de batch de validación sin ponderar para seleccionar checkpoint; esta limitación conocida se mantiene en el release y no debe confundirse con las ejecuciones nuevas del código fuente, que usan una pérdida de validación ponderada por objeto.
- El commit original del código de entrenamiento no se registró y se declara explícitamente desconocido, lo que limita la trazabilidad completa del experimento.
- La reproducción comienza desde el benchmark publicado, no desde la reconstrucción de la descarga original del sondeo; no se reproduce la obtención de los datos crudos.
- La licencia MIT cubre el código fuente y los artefactos del modelo, pero no el dataset, que se aloja por separado bajo CC-BY-4.0. Para uso comercial o redistribución hay que citar la dataset card y el paper, y conservar la atribución original de SDSS/SSPP.
- No se documentan sesgos específicos, riesgos de alucinación (no aplica a un regresor) ni comportamiento multilingüe, ya que el modelo no procesa lenguaje.
- Las marcas temporales del repositorio (creación y actualización en octubre de 2026) resultan anómalas respecto a la fecha habitual de consulta; conviene verificar la revisión inmutable antes de citar el artefacto en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrunoBarreto/sdss_dr12_stars_regression
- Dataset asociado: https://huggingface.co/datasets/BrunoBarreto/sdss_dr12_stars_regression
- Repositorio de código fuente (stellar_workflow): no disponible, la model card menciona un repositorio acompañante sin enlace
- Paper "Stellar Parameter Estimation Using Residual Multitask Neural Networks": no disponible en la información proporcionada
- SDSS Data Release 12: no disponible en la información proporcionada (referenciado indirectamente como origen de los datos)
