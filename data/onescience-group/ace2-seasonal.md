# OneScience-Group/ACE2-Seasonal

## Resumen

ACE2-Seasonal es un repositorio de HuggingFace publicado por OneScience-Group que reproduce, como ingeniería independiente, el experimento global de *hindcast* estacional descrito en el artículo «Skilful global seasonal predictions from a machine learning weather model trained on reanalysis data» (DOI 10.1038/s41612-025-01198-3). El modelo se construye sobre ACE2-ERA5, un modelo meteorológico de aprendizaje automático entrenado con la reanálisis atmosférica ERA5, y reproduce la configuración del experimento estacional: autoregresión cada seis horas con anomalías persistentes de temperatura superficial del mar (SST) y de hielo marino como condiciones de frontera, formando un ensemble rezagado de 64 miembros.

El estudio original fue desarrollado por equipos del Met Office, la Universidad de Exeter y Ai2, y está orientado a la predicción estacional global (principalmente invierno boreal, DJF), al análisis de la Oscilación del Atlántico Norte (NAO), a la teleconexión con ENSO y al estudio de la relación entre dispersión y habilidad del ensemble (*spread-skill*). No es un modelo de lenguaje: es un modelo de ciencia de la Tierra cuyo resultado son campos atmosféricos globales, no texto.

La relevancia actual del repositorio es de tipo ingenieril y metodológico: proporciona un pipeline reproducible (instalación vía `onescience[earth-gpu]` o `onescience[earth-dcu]`, scripts de datos sintéticos, entrenamiento con `torchrun`, inferencia y evaluación) que permite validar la mecánica de entrenamiento, inferencia y métricas estacionales sin disponer de todo el flujo operativo original. La información disponible no incluye número de parámetros, arquitectura detallada ni resultados numéricos de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de aprendizaje automatico para prediccion meteorologica/estacional; framework PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; usa estados iniciales de ERA5 y autoregresion cada 6 horas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentacion y model card en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de PyTorch (`result/checkpoints/ace2_seasonal.pt`); no se mencionan safetensors ni GGUF |
| Dominio de aplicacion | ciencia de la Tierra, prediccion estacional global |
| Paso temporal | 6 horas (autoregresion) |
| Tamano de ensemble | 64 miembros (ensemble rezagado) |
| Variables de frontera | SST y hielo marino persistidos desde la inicializacion |
| Framework / paquete | PyTorch; `onescience[earth-gpu]` o `onescience[earth-dcu]` |
| Repositorio | OneScience-Group/ACE2-Seasonal (0 descargas, 0 likes en el momento de la consulta) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (no se especifican capas, tipo de operador, número de parámetros ni estrategia de atención). Lo que sí se documenta es el protocolo del experimento: ACE2-Seasonal reproduce el *hindcast* estacional global usando ACE2-ERA5, con estados iniciales de ERA5 y anomalías oceánicas persistidas. El modelo opera con autoregresión cada seis horas, de modo que cada paso predice el siguiente estado atmosférico a partir del anterior, manteniendo fijas las condiciones de frontera oceánicas durante el horizonte de predicción.

El ensemble se construye mediante un esquema rezagado de 64 miembros, lo que permite estimar dispersión y habilidad (*spread-skill*). El artículo asociado describe ACE2 como un modelo meteorológico de aprendizaje automático entrenado con datos de reanálisis; sin embargo, la ficha no aporta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste por refuerzo o preferencias (RLHF/DPO), por lo que esos datos deben considerarse no disponibles.

En cuanto a la innovación técnica destacable, el repositorio se presenta explícitamente como una reproducción ingenieril de las especificaciones públicas de ACE2-Seasonal, no como el modelo original. La validación incluida en la model card se realiza con datos sintéticos que conservan el protocolo de rejilla global, las variables de frontera, el orden de seis horas y el ensemble de 64 miembros; la inferencia de validación restaura el checkpoint, ejecuta 12 pasos de pronóstico de ingeniería y produce un tensor finito de forma `[64,12,8,16,16]`, conservando un marcador de cobertura incompleta.

## Capacidades

- Generación de campos atmosféricos globales mediante autoregresión con paso temporal de seis horas.
- Predicción estacional para el invierno boreal (DJF).
- Construcción de ensembles rezagados de 64 miembros.
- Persistencia de condiciones de frontera: anomalías de SST y de hielo marino inicializadas.
- Evaluación de la correlación del ensemble medio de la NAO y de su dispersión.
- Análisis de teleconexiones con ENSO.
- Análisis de la relación dispersión-habilidad (*spread-skill*) del ensemble.
- Entrenamiento multi-GPU y multi-proceso mediante `torchrun` (DDP).
- Ejecución en GPU y en DCU (requiere DTK 25.04.2 o versión compatible recomendada por OneScience).
- Validación de conectividad en CPU con la configuración de muestra pequeña por defecto.
- No dispone de *tool calling*, soporte de agentes, capacidades multilingües, visión ni audio: no es un modelo de lenguaje.

## Casos de uso

- Predicción estacional operativa de apoyo: generar un ensemble rezagado de 64 miembros para el invierno boreal (DJF) y usar la media y la dispersión del conjunto como insumo para boletines climáticos estacionales.
- Predicción y diagnóstico de la NAO: evaluar la correlación del ensemble medio de la NAO y su dispersión para estudiar la predictibilidad de la circulación del Atlántico Norte en escala estacional.
- Análisis de teleconexiones ENSO: emplear las predicciones globales para estudiar cómo las anomalías de SST persistidas modulan patrones remotos de circulación y precipitación.
- Experimentos de forzamiento de frontera: ejecutar sensibilidades persistiendo anomalías de SST y hielo marino inicializadas, para aislar el peso de las condiciones de contorno frente a la memoria atmosférica interna.
- Investigación en calibración de ensembles: usar la salida de 64 miembros para estudiar la relación entre dispersión y habilidad y para calibrar la incertidumbre de predicciones estacionales.
- Validación de pipelines de IA para ciencias de la Tierra: ejecutar los scripts de datos sintéticos, entrenamiento, inferencia y métricas para verificar que el flujo completo (transición de estado cada seis horas, retropropagación, DDP) funciona antes de escalar a datos reales.
- Entrenamiento distribuido reproducible: lanzar `torchrun --nproc_per_node=N` sobre el script de entrenamiento para validar configuraciones multi-GPU o multi-DCU en clústeres heterogéneos.
- Integración en plataformas de ejecución tipo ModelScope/OneCode: validar datos estructurados, entrenamiento, inferencia, métricas estacionales y visualización dentro de un entorno gestionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo soporta análisis de correlación del ensemble medio de la NAO y de *spread-skill*, y que la inferencia de validación produce un tensor `[64,12,8,16,16]` sobre datos sintéticos con marcador de cobertura incompleta, pero no se proporcionan valores numéricos de habilidad, correlación ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se indica el tamaño de parámetros ni la resolución de rejilla real empleada).
- GPU recomendadas: no se especifican modelos concretos; la documentación indica que se recomienda una GPU o una DCU.
- DCU: requiere instalar DTK 25.04.2 o una versión compatible recomendada por OneScience antes de instalar el paquete.
- CPU: utilizable únicamente para validación de conectividad con la configuración de muestra pequeña por defecto.
- Entrenamiento multi-GPU: soportado mediante `torchrun` con DDP; se ha verificado con ejecuciones de uno y dos procesos según la model card.
- Almacenamiento y artefactos: los checkpoints se guardan en `result/checkpoints/ace2_seasonal.pt`; las predicciones del ensemble y las métricas estacionales, en `result/output/` y `result/evaluation/`.
- Opciones de despliegue: paquete `onescience[earth-gpu]` (GPU) o `onescience[earth-dcu]` (DCU) instalado desde el índice `mirrors.onescience.ai`; scripts `scripts/fake_data.py`, `scripts/train.py`, `scripts/inference.py` y `scripts/result.py`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE2-Seasonal (OneScience-Group) | Reproduccion ingenieril de prediccion estacional sobre ACE2-ERA5 | no disponible | Ensemble rezagado de 64 miembros; prediccion DJF; autoregresion de 6 h | apache-2.0 (repositorio) | HuggingFace, 0 descargas, 0 likes |
| ACE2-ERA5 (modelo base citado) | Modelo meteorologico de AA entrenado con reanalisis ERA5 | no disponible | no disponible | sujeta a sus propios terminos | no disponible en la informacion proporcionada |
| Alternativas de prediccion estacional (modelos dinamicos o hibridos) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento, tamaño o contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; cualquier uso climático requiere evaluación de sesgos frente a observaciones antes de sacar conclusiones.
- Riesgo de alucinación: no aplicable en el sentido de un modelo de lenguaje, pero sí existe riesgo de predicciones con habilidad limitada o derivas en horizontes largos, especialmente al persistir anomalías de frontera en lugar de acoplarlas.
- Es una reproducción ingenieril: el repositorio se declara explícitamente como reproducción independiente de las especificaciones públicas de ACE2-Seasonal, no como el modelo original de Ai2, Met Office y University of Exeter.
- Validación con datos sintéticos: los flujos descritos en la model card (datos sintéticos, 12 pasos de pronóstico de ingeniería, tensor `[64,12,8,16,16]`) verifican la mecánica del pipeline, no la habilidad científica del modelo; el propio resultado conserva un marcador de cobertura incompleta.
- Idiomas: la documentación y los recursos están únicamente en inglés.
- Licencias encadenadas: el repositorio se distribuye bajo apache-2.0, pero el artículo original está bajo CC BY 4.0 y el código, los pesos de ACE2 y los datos ERA5 quedan sujetos a sus respectivas licencias y términos. El uso comercial o la redistribución de pesos y datos requiere revisar esas condiciones por separado, incluida la licencia de Copernicus/ERA5.
- Dependencia de ERA5: tanto la inicialización como el entrenamiento del modelo base dependen de la reanálisis ERA5, lo que condiciona la reproducibilidad y el coste de acceso a los datos.
- Madurez del repositorio: 0 descargas y 0 likes en la fecha de consulta, sin evidencia pública de uso en producción ni de resultados validados con datos reales.
- Requisitos de plataforma: el entrenamiento en DCU exige DTK 25.04.2 o compatible, y la instalación se realiza desde un índice alternativo (`mirrors.onescience.ai`), lo que añade dependencia de infraestructura.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/ACE2-Seasonal
- Articulo de referencia: https://doi.org/10.1038/s41612-025-01198-3
- OneScience en GitHub: https://github.com/onescience-ai/OneScience
- OneSkills en GitHub: https://github.com/onescience-ai/oneskills
- OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- OneSkills en Gitee: https://gitee.com/onescience-ai/oneskills
