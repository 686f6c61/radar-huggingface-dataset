# PARADOXAIlabs/atlas-v1.4n

## Resumen

Atlas v1.4n es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Su tarea concreta es la previsión de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire en la India, a partir de los datos de las estaciones CPCB (Central Pollution Control Board) distribuidas en 14 redes y 263 estaciones. Forma parte de una serie numerada de 56 modelos publicados (el número 44 de la serie, etiquetado como #47).

Se trata de un modelo de muy pequeño tamano (967.632 parámetros) entrenado específicamente para datos espaciotemporales de contaminación atmosférica. La model card indica explícitamente que esta versión no fue adoptada: el resultado de validación obtenido (9.106) no superó el de la referencia previa (9.104), y el cambio respecto a la versión anterior se describe como "architecture test (negative)". Es, por tanto, un artefacto de investigación que documenta un experimento fallido dentro de la serie, más que un modelo destinado a producción.

Su relevancia es acotada: sirve como registro reproducible de un intento arquitectónico dentro de la serie Atlas y como referencia para quienes investigan modelos ligeros de previsión espaciotemporal aplicados a calidad del aire. No es un modelo de lenguaje ni un modelo generativo de propósito general; es un predictor numérico especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de series temporales espaciotemporal; código en repositorio GitHub del autor) |
| Parametros totales | 967.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción de 24 horas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict dentro de un fichero `.pt` (`47_atlas_v1.4n.pt`, 3.905.333 bytes) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de describir el cambio de esta versión como un "architecture test (negative)". El código de arquitectura correspondiente a esta versión se encuentra en el repositorio de GitHub del proyecto (`paradoxailab/paradox-world-model`), y la configuración de entrenamiento está almacenada en el propio fichero de pesos bajo la clave `ck['cfg']`. El modelo se entrenó el 2026-11-15 (run de Kaggle `atlas-v14n-s400`) y se publicó el 2026-11-17.

Los datos de entrenamiento provienen del conjunto "Time Series Air Quality Data of India (2010-2023)" de Kaggle, con registros de estaciones CPCB de toda la India: 14 redes y 263 estaciones. La tarea es predecir las siguientes 24 horas de PM2.5 en estaciones, y la variante "n" (neighbours only) sugiere el uso exclusivo de estaciones vecinas como información espacial. No se especifica el número de tokens ni la composición exacta del dataset, ni si hubo ajuste por RLHF/DPO (no procede en este tipo de modelo). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y términos están en `DATA_SOURCES.md`.

## Capacidades

- Predicción de series temporales: genera las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización.
- Modelado espaciotemporal: incorpora información de estaciones vecinas (variante "neighbours only").
- Inferencia sobre datos de calidad del aire de la India (redes CPCB).
- Carga reproducible en PyTorch mediante `torch.load` con acceso a metadatos, pesos, configuración y registros de resultados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en previsión de calidad del aire: sirve como punto de comparación documentado (resultado de validación 9.106) para evaluar variantes arquitectónicas dentro de la serie Atlas.
- Reproducción de experimentos: al incluir configuración (`ck['cfg']`), resultados y logs en el fichero, permite reproducir el run `atlas-v14n-s400` y auditar el resultado negativo.
- Estudio de modelos espaciotemporales ligeros: con menos de un millón de parámetros, es útil para analizar el equilibrio entre capacidad y coste computacional en previsión de PM2.5.
- Referencia para pipelines de previsión a 24 horas: puede integrarse en prototipos de alerta temprana de contaminación, siempre que se valide su rendimiento en el contexto concreto.
- Docencia y experimentación: su tamano reducido y su formato `.pt` facilitan la inspección y la experimentación en entornos con recursos limitados.
- Baseline en competiciones o estudios comparativos: proporciona una referencia reproducible frente a la que medir mejoras de otros modelos de la misma familia.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Validación (versión actual) | 9.106 |
| Validación (referencia previa) | 9.104 |
| Decisión | No adoptado (9.106 vs 9.104) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 967.632 parámetros y un fichero de 3,9 MB, cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente (GTX 1060, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las gamas actuales; también en CPU.
- Opciones de despliegue: PyTorch nativo mediante `torch.load`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas v1.4n | 967.632 | 24 h de predicción | PM2.5 espaciotemporal (India) | Apache-2.0 | Hugging Face |
| Atlas-Delhi I1 (#46) | no disponible | no disponible | Comparación operativa (Delhi) | Apache-2.0 | Hugging Face |
| Atlas-P (#48) | no disponible | no disponible | Decodificador físico | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la pertenencia a la misma serie y licencia.

## Limitaciones y advertencias

- Modelo no adoptado: el resultado de validación (9.106) no supera la referencia previa (9.104); no se recomienda su uso en producción.
- Cambio arquitectónico negativo: la propia model card califica esta versión como "architecture test (negative)".
- Ámbito geográfico y de datos restringido: entrenado únicamente con estaciones CPCB de la India (14 redes, 263 estaciones); no se garantiza su generalización a otras regiones.
- Tarea única: solo predice PM2.5 a 24 horas; no cubre otros contaminantes ni otros horizontes temporales.
- Datos de entrenamiento no incluidos: dificulta la auditoría completa del modelo; solo se documentan las fuentes y términos en `DATA_SOURCES.md`.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de predicciones poco fiables fuera del dominio de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero al no ser un modelo adoptado ni validado, su uso comercial no está respaldado por resultados.
- Sin benchmarks públicos adicionales: no hay métricas más allá del resultado de validación registrado.

## Enlaces

- [Hugging Face: PARADOXAIlabs/atlas-v1.4n](https://huggingface.co/PARADOXAIlabs/atlas-v1.4n)
- [Repositorio GitHub: paradox-world-model](https://github.com/paradoxailab/paradox-world-model)
- [Registro Atlas (README)](https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md)
- [Índice de la serie (todos los modelos)](https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md)
- [Fuentes de datos (DATA_SOURCES.md)](https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md)
- [CITATION.cff](https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff)
- [Modelo anterior: Atlas-Delhi I1](https://huggingface.co/PARADOXAIlabs/atlas-delhi-i1)
- [Modelo siguiente: Atlas-P](https://huggingface.co/PARADOXAIlabs/atlas-p)
- [Serie completa en Hugging Face](https://huggingface.co/PARADOXAIlabs/paradox-world-model-series)
- [Sitio web: paradoxailab.com](https://paradoxailab.com)
