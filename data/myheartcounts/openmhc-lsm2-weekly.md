# MyHeartCounts/openmhc-lsm2-weekly

## Resumen

OpenMHC LSM2 (weekly) es un checkpoint de extracción de características para series temporales de wearables, desarrollado por el equipo OpenMHC (MyHeartCounts, vinculado al laboratorio de Ashley en GitHub). Se trata de un modelo basado en un autoencoder enmascarado (masked autoencoder) con arquitectura ViT, preentrenado de forma autosupervisada sobre secuencias semanales de datos de sensores. Es la extensión del checkpoint LSM2-daily a un contexto de 7 días (10.080 minutos) con un tamaño de parche de 60 minutos.

El modelo resuelve el problema de representar y reconstruir señales heterogéneas de wearables (19 canales de sensores) cuando la tarea posterior requiere contexto de varios días. Se distribuye empaquetado para la pista de evaluación de imputación del benchmark OpenMHC, con una API específica (`openmhc.imputers.LSM2Imputer`) que permite cargarlo y evaluarlo directamente.

Su relevancia es metodológica: sirve como referencia reproducible para comparar estrategias de imputación y representación en modelos fundacionales de wearables. La model card restringe explícitamente el uso a investigación, comparación metodológica y reproducción del benchmark, excluyendo cualquier aplicación clínica o diagnóstica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT con masked autoencoder (MAE) autosupervisado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10.080 minutos (7 días), parche de 60 minutos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no de texto) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | no disponible (repo de 0,3 GB; pesos gestionados vía `openmhc`) |

Canales de entrada: 19 canales de sensores. Ventana: weekly. Pipeline declarado: `feature-extraction`. Librería: `openmhc`.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de LSM2-daily: un transformer tipo ViT adaptado a series temporales mediante un esquema de masked autoencoder. Las secuencias se tokenizan en parches de 60 minutos, lo que para una ventana semanal de 10.080 minutos produce 168 parches por muestra. El preentrenamiento es autosupervisado (SSL) sobre datos de wearables, enmascarando partes de la señal y optimizando la reconstrucción.

La diferencia principal respecto al checkpoint diario es la ventana de contexto (7 días frente a 1 día) y el tamaño de parche (60 minutos), lo que lo hace adecuado cuando la tarea posterior necesita contexto multi-día. El origen del artefacto es el artefacto de W&B `MHC_Dataset/mhc-mae-ssl/model-o5quh2cd:v2`, y los hiperparámetros de arquitectura están fijados en `openmhc_manifest.json`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO (no aplicable en un modelo SSL de reconstrucción).

## Capacidades

- Extracción de características (embeddings) de series temporales de wearables con 19 canales de sensores.
- Imputación de valores faltantes en secuencias de hasta 7 días (10.080 minutos), evaluable mediante `openmhc.evaluate_imputation`.
- Modelado de dependencias de largo alcance gracias al contexto semanal y a parches de 60 minutos.
- Preentrenamiento autosupervisado que permite reutilización como backbone para tareas posteriores (downstream) sobre datos de wearables.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Reproducción del benchmark OpenMHC: cargar el checkpoint con `LSM2Imputer.from_release("hf://MyHeartCounts/openmhc-lsm2-weekly")` y ejecutar `openmhc.evaluate_imputation(imp, version="xs")` para obtener métricas comparables con otros imputadores de la pista.
- Comparación metodológica de imputadores: usar el modelo como referencia frente a métodos estadísticos (interpolación, KNN) o a LSM2-daily para medir la ganancia de contexto semanal en la reconstrucción de señales.
- Extracción de embeddings para modelos posteriores: congelar el encoder y entrenar clasificadores ligeros sobre las representaciones de ventanas semanales para tareas de investigación en datos de wearables.
- Estudio de señales con huecos prolongados: escenarios en los que el usuario retira el dispositivo durante horas o días y se necesita reconstruir la señal a partir del contexto multi-día.
- Análisis de periodicidad circadiana y semanal: el contexto de 7 días y parches de 60 minutos permiten modelar patrones que se repiten a lo largo de la semana en investigación sobre ritmos de actividad.
- Validación de pipelines de datos: usar el modelo como componente de prueba en pipelines de preprocesado de wearables para verificar la integridad de la tokenización en parches y la gestión de canales.
- Docencia y experimentación: ejemplo reproducible de masked autoencoder aplicado a series temporales biomédicas, con API y manifiesto de hiperparámetros públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la documentación de OpenMHC para la métrica de validación, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repo es de 0,3 GB, lo que sugiere que el checkpoint es ligero y probablemente quepa en GPU de consumo, pero no se confirma el número de parámetros ni el pico de memoria en inferencia.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, una GPU de consumo reciente (por ejemplo, RTX 3060 o superior) sería suficiente en principio, aunque no hay datos oficiales.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repo, sin confirmación oficial.
- Opciones de despliegue: la vía soportada es la librería `openmhc` con los extras `pip install 'openmhc[lsm2,hf]'`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Contexto | Parches | Canales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMHC LSM2 weekly | 10.080 min (7 días) | 60 min | 19 | OpenRAIL-M | HuggingFace (`MyHeartCounts/openmhc-lsm2-weekly`) |
| OpenMHC LSM2 daily | 1 día | no disponible | 19 | OpenRAIL-M | HuggingFace (`MyHeartCounts/openmhc-lsm2-daily`) |
| Otros modelos fundacionales de wearables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con LSM2-daily, del mismo autor y misma arquitectura, que difiere en la ventana de contexto y en el tamaño de parche. No se dispone de datos de rendimiento comparado entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la model card excluye explícitamente diagnóstico, cribado, pronóstico, predicción prospectiva de riesgo y apoyo a decisiones clínicas.
- Las etiquetas médicas de OpenMHC son autodeclaradas y sin fechas de diagnóstico; el rendimiento en el benchmark no establece utilidad clínica.
- Cualquier afirmación diagnóstica o pronóstica requeriría validación independiente con resultados adjudicados clínicamente y alineados temporalmente en la población objetivo.
- La licencia BigScience OpenRAIL-M impone restricciones de uso del Anexo A, que prohíben, entre otras cosas, proporcionar consejo médico e interpretación de resultados médicos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la imputación puede producir reconstrucciones plausibles pero incorrectas de señales faltantes; no deben interpretarse como mediciones reales.
- Sesgos: no documentados. Al entrenarse con datos de una cohorte concreta (MyHeartCounts), las representaciones pueden no generalizar a otras poblaciones, dispositivos o regímenes de uso.
- Idiomas: no aplica; el modelo no procesa texto.
- Sin datos públicos sobre parámetros, cuantizaciones ni rendimiento, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- HuggingFace: https://huggingface.co/MyHeartCounts/openmhc-lsm2-weekly
- Checkpoint diario relacionado: https://huggingface.co/MyHeartCounts/openmhc-lsm2-daily
- Repositorio OpenMHC: https://github.com/AshleyLab/OpenMHC
- Licencia: https://huggingface.co/MyHeartCounts/openmhc-lsm2-weekly/blob/main/LICENSE
