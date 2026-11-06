# MyHeartCounts/openmhc-dlinear-7day-imp

## Resumen

OpenMHC DLinear (7-day) es un checkpoint de referencia publicado por el equipo OpenMHC (organización MyHeartCounts, vinculada al laboratorio AshleyLab) dentro del proyecto OpenMHC, cuyo objetivo es acelerar la investigación en modelos fundacionales para datos de wearables. No es un modelo de lenguaje: es un imputador de series temporales que reconstruye ventanas semanales de datos de sensores procedentes de dispositivos vestibles.

El modelo envuelve un imputador basado en PyPOTS con arquitectura DLinear, entrenado sobre el split de entrenamiento de imputación de OpenMHC. Trabaja con ventanas de 10 080 minutos (siete días completos) y 19 canales de sensores, y su función es rellenar valores ausentes en esas ventanas, un problema endémico en datos de wearables por desconexiones, carga de batería o retirada del dispositivo.

Su relevancia es metodológica: sirve como línea base reproducible para comparar técnicas de imputación dentro del benchmark OpenMHC. El autor declara explícitamente que su uso previsto se limita a investigación y comparación metodológica, y excluye cualquier aplicación clínica. La licencia BigScience OpenRAIL-M impone restricciones de uso adicionales, incluida la prohibición de ofrecer consejo médico o interpretación de resultados médicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DLinear (imputador de series temporales sobre PyPOTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 10 080 minutos (7 dias) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo sobre series temporales, no texto) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | no disponible (checkpoint cargado via `openmhc.imputers.DLinearImputer`; tamano de repo 0,8 GB) |
| Canales de entrada | 19 canales de sensores |
| Tarea | imputacion / reconstruccion de ventanas enmascaradas |
| Libreria | `openmhc` (extras `pypots`, `hf`) |

## Arquitectura y entrenamiento

DLinear es una arquitectura lineal para series temporales que descompone la senal en componentes de tendencia y estacionalidad y aplica proyecciones lineales sobre cada una; se caracteriza por su simplicidad frente a transformers y por su bajo coste computacional. En este checkpoint, DLinear se integra como imputador dentro del ecosistema PyPOTS, que aporta las utilidades de enmascaramiento y reconstruccion de series temporales incompletas.

El entrenamiento se realizo sobre el split de imputacion de OpenMHC, con ventanas de 10 080 minutos y 19 canales. El autor reporta un MAE de validacion de 0,1456 en la epoca 16, y los hiperparametros de arquitectura estan fijados en el fichero `openmhc_manifest.json` del repositorio. El checkpoint proviene del artefacto de W&B `MHC_Dataset/mhc-pypots-dlinear/dlinear:v48`. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste fino adicionales.

## Capacidades

- Imputacion de valores ausentes en ventanas semanales de datos de wearables con 19 canales de sensores.
- Reconstruccion de ventanas enmascaradas, lo que permite evaluacion controlada mediante masking artificial.
- Procesamiento de series temporales de alta frecuencia con resolucion de un minuto a lo largo de siete dias.
- Integracion con el framework OpenMHC para evaluacion estandarizada (`openmhc.evaluate_imputation`).
- Versionado de releases mediante sufijos `@v1.0` para fijar revisiones reproducibles.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente.

## Casos de uso

- Investigacion en imputacion de series temporales: el modelo sirve como linea base DLinear contra la que comparar tecnicas mas complejas (transformers, modelos fundacionales de wearables) dentro del benchmark OpenMHC, con metrica MAE reproducible.
- Preprocesamiento de pipelines de datos de wearables: rellenar huecos en registros de sensores antes de alimentar modelos posteriores de analisis de actividad o sueno, reduciendo el sesgo por datos faltantes.
- Reproduccion de resultados academicos: al estar el checkpoint fijado a un artefacto de W&B concreto y permitir pin de revision, facilita la replicacion exacta de experimentos publicados sobre OpenMHC.
- Desarrollo y validacion de metodologia de enmascaramiento: permite probar estrategias de masking y metricas de evaluacion sobre un modelo de referencia estable.
- Docencia y formacion en series temporales: ejemplo funcional y ligero (repo de 0,8 GB) de un imputador DLinear sobre datos reales de sensores.
- Auditoria de calidad de datos: cuantificar la dificultad de reconstruccion por canal para detectar sensores con alta tasa de fallo o calibracion deficiente.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| MAE de validacion | 0,1456 | Epoca 16, split de validacion de imputacion OpenMHC |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval o equivalentes no aplican; no hay tablas de comparacion frente a otros imputadores).

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano del repositorio es de 0,8 GB, lo que sugiere un modelo pequeno que probablemente cabe en GPU consumer, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: probablemente si dado el tamano del checkpoint, pero no confirmado por el autor.
- Opciones de despliegue: libreria `openmhc` con extras `pypots` y `hf`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros checkpoints de imputacion de OpenMHC ni comparaciones con alternativas de la misma categoria.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion y comparacion metodologica; el autor excluye explicitamente diagnostico, cribado, pronostico, prediccion prospectiva de riesgo y apoyo a decisiones clinicas.
- Las etiquetas de condicion medica de OpenMHC son autoinformadas y carecen de fechas de diagnostico; el rendimiento en el benchmark no establece utilidad clinica.
- La licencia BigScience OpenRAIL-M impone restricciones de uso de su Anexo A, incluida la prohibicion de proporcionar consejo medico o interpretacion de resultados medicos.
- Riesgo de sesgo derivado de la poblacion de entrenamiento de OpenMHC (no documentada en la informacion disponible), lo que limita la generalizacion a otras cohortes o dispositivos.
- Ventana fija de siete dias y 19 canales: no admite longitudes de contexto arbitrarias ni canales distintos sin reentrenamiento.
- No se documentan tasas de alucinacion ni comportamiento fuera de distribucion; al ser un modelo de regresion, el riesgo principal es la reconstruccion erronea de senales, no la generacion de texto.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MyHeartCounts/openmhc-dlinear-7day-imp
- Repositorio OpenMHC: https://github.com/AshleyLab/OpenMHC
- PyPOTS: https://github.com/WenjieDu/PyPOTS
- Licencia BigScience OpenRAIL-M: https://huggingface.co/MyHeartCounts/openmhc-dlinear-7day-imp/blob/main/LICENSE
