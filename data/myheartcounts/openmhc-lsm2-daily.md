# MyHeartCounts/openmhc-lsm2-daily

## Resumen

OpenMHC LSM2 (daily) es un checkpoint de referencia del proyecto OpenMHC, una adaptación del modelo fundacional para wearables LSM2 desarrollado originalmente por Google. Se trata de un autoencoder enmascarado (masked autoencoder) basado en Vision Transformer (ViT) diseñado para señales wearables unidimensionales, preentrenado de forma autosupervisada sobre ventanas diarias de 1440 minutos con un parche de 10 y 19 canales de sensores. El modelo se distribuye como encoder de propósito general para extracción de características y evaluación de imputación dentro del benchmark OpenMHC.

El modelo resuelve el problema de obtener representaciones útiles a partir de series temporales multimodales procedentes de dispositivos vestibles (frecuencia cardíaca, acelerometría, sueño, etc.) sin necesidad de etiquetas, lo que permite reutilizar un único encoder en múltiples tareas posteriores. Es relevante ahora porque el ecosistema de modelos fundacionales para wearables está emergiendo y OpenMHC proporciona una infraestructura reproducible para comparar metodologías, con este checkpoint como referencia oficial para la pista de imputación.

El checkpoint tiene un tamaño de repositorio de 0,3 GB, se publica bajo licencia BigScience OpenRAIL-M y se integra con la librería `openmhc`. Su uso previsto está estrictamente limitado a investigación, comparación metodológica y reproducción del benchmark; queda explícitamente fuera de alcance cualquier uso clínico o de diagnóstico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked autoencoder basado en ViT para señales 1-D (LSM2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana diaria de 1440 minutos (parche de 10, 19 canales de sensores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | no disponible (repo de 0,3 GB, librería `openmhc`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LSM2 de Google, un autoencoder enmascarado basado en Vision Transformer adaptado a señales wearables unidimensionales. La entrada se organiza en ventanas diarias de 1440 minutos con parches de 10 unidades temporales y 19 canales de sensores, lo que produce una secuencia de tokens sobre la que el transformer aplica enmascaramiento y reconstrucción. El preentrenamiento es autosupervisado (SSL), sin etiquetas, lo que permite aprovechar grandes volúmenes de datos de wearables sin anotación manual.

La adaptación a OpenMHC se realizó sobre ventanas diarias y el checkpoint procede del artefacto de W&B `MHC_Dataset/mhc-mae-ssl-daily/mae-daily:v0`, con un valor de pérdida de validación de 0,2706. Los hiperparámetros de arquitectura están fijados en el archivo `openmhc_manifest.json` del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (poco probables en un modelo de representación autosupervisado).

## Capacidades

- Extracción de características (feature extraction) a partir de series temporales de wearables de 19 canales.
- Imputación de valores faltantes en ventanas diarias de 1440 minutos, evaluable mediante `openmhc.evaluate_imputation`.
- Aprendizaje de representaciones autosupervisado reutilizable como encoder para tareas posteriores (downstream).
- Procesamiento de ventanas temporales largas (un día completo) con parcheado de 10 unidades.
- Integración con la librería `openmhc` mediante `LSM2Imputer.from_release`.
- Soporte de versionado por revisión (`@v1.0`) para reproducibilidad.
- No dispone de capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Reproducción del benchmark OpenMHC: el checkpoint sirve como referencia oficial para la pista de imputación, permitiendo comparar nuevos métodos contra una línea base fija con pérdida de validación conocida (0,2706).
- Investigación en imputación de señales wearables: uso de `LSM2Imputer` para reconstruir minutos faltantes en registros diarios de 1440 minutos y evaluar el error de reconstrucción de forma estandarizada.
- Extracción de embeddings para modelos downstream: congelar el encoder y entrenar cabezas ligeras para tareas como clasificación de actividad o estimación de sueño a partir de las representaciones generadas.
- Comparación metodológica entre arquitecturas SSL: al ser una adaptación de LSM2, permite contrastar el rendimiento de autoencoders enmascarados frente a otras estrategias de preentrenamiento sobre el mismo dataset OpenMHC.
- Desarrollo de pipelines de preprocesado: usar el encoder para normalizar y completar series antes de alimentar modelos predictivos, reduciendo el impacto de huecos en los datos de sensores.
- Validación de infraestructura de investigación: probar flujos de integración con HuggingFace (`hf://`) y con la librería `openmhc` en entornos de laboratorio antes de escalar a otros checkpoints del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de validación del preentrenamiento: **val loss 0,2706**.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo relativamente pequeño, pero no se confirma el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio (0,3 GB) es plausible que quepa en GPUs de consumo, pero no hay dato oficial.
- Opciones de despliegue: la vía documentada es la librería `openmhc` con los extras `openmhc[lsm2,hf]`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMHC LSM2 (daily) | no disponible | 1440 min (parche 10, 19 canales) | Feature extraction / imputación de wearables | BigScience OpenRAIL-M | HuggingFace (`MyHeartCounts/openmhc-lsm2-daily`) |
| LSM2 (Google, original) | no disponible | no disponible | Modelo fundacional de wearables | no disponible | Referencia en arXiv:2506.05321 |
| Otros checkpoints OpenMHC | no disponible | no disponible | Benchmark OpenMHC | no disponible | Repositorio OpenMHC |

La comparación con alternativas de la misma categoría (modelos fundacionales para series temporales de wearables) no está disponible en la información proporcionada más allá de la referencia al LSM2 original de Google, del cual este checkpoint es una adaptación.

## Limitaciones y advertencias

- Uso estrictamente limitado a investigación, comparación metodológica y reproducción del benchmark; queda fuera de alcance el diagnóstico, cribado, pronóstico, predicción prospectiva de riesgo y apoyo a decisiones clínicas.
- Las etiquetas de condiciones médicas de OpenMHC son autoinformadas y carecen de fechas de diagnóstico; el rendimiento en el benchmark no establece utilidad clínica.
- La licencia BigScience OpenRAIL-M incluye restricciones en su Anexo A que prohíben, entre otras cosas, proporcionar consejo médico e interpretación de resultados médicos; estas restricciones se aplican al checkpoint y a sus derivados.
- No se dispone de información sobre sesgos demográficos o de sensores del dataset de entrenamiento.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de imputaciones erróneas en señales con patrones atípicos.
- Contexto limitado a ventanas diarias de 1440 minutos; no se documenta soporte para ventanas de mayor duración.
- No hay datos publicados sobre cuantización, latencia ni rendimiento en producción.
- El modelo tiene 0 descargas y 2 likes en el momento de la consulta, lo que indica adopción muy temprana y escasa validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/MyHeartCounts/openmhc-lsm2-daily
- Repositorio OpenMHC: https://github.com/AshleyLab/OpenMHC
- Paper LSM2 (arXiv): https://arxiv.org/abs/2506.05321
- Licencia BigScience OpenRAIL-M: incluida en el repositorio (`LICENSE`)
