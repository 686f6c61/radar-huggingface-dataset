# OneScience-Group/Aardvark-Weather

## Resumen

Aardvark Weather es un modelo de predicción meteorológica de extremo a extremo desarrollado por OneScience-Group, basado en el trabajo publicado en *Nature* bajo el título *End-to-end data-driven weather prediction*. A diferencia de los modelos meteorológicos tradicionales que dependen de asimilación de datos y solvers numéricos, este modelo aprende directamente de observaciones multimodales (satélite, estaciones terrestres, barcos y radiosondas) y genera tanto campos globales en rejilla como predicciones puntuales en estaciones.

La arquitectura se compone de tres módulos: un codificador de observaciones, un procesador global de pronóstico y un decodificador de estaciones. El paquete publicado incluye pesos oficiales para predicción a día 1, con salida de 24 variables atmosféricas en una rejilla global de 1.5° (121×240) y temperatura a 2 metros en 8,719 estaciones. El repositorio tiene un tamaño de 1.3 GB e incluye código de entrenamiento, inferencia y verificación de resultados.

La relevancia de este modelo radica en que elimina la necesidad de pipelines de asimilación de datos complejos, ofreciendo un enfoque unificado y entrenable de principio a fin. Es especialmente interesante para la comunidad de ciencia de la Tierra que busca alternativas basadas en datos a los modelos numéricos operativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de observaciones + procesador global + decodificador de estaciones (multimodal, basado en PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de prediccion meteorologica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (referido a documentacion y metadatos; el modelo procesa datos numericos de observaciones) |
| Licencia | other (no especificada en detalle; requiere verificacion para uso comercial) |
| Formato de pesos | Checkpoints PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de tres etapas: un codificador de observaciones que procesa datos multimodales (satélite, estaciones, barcos y radiosondas), un procesador global que genera el estado atmosférico en rejilla, y un decodificador de estaciones que produce predicciones puntuales. El paquete publicado incluye el codificador, el procesador de día 1 y el decodificador de temperatura a 2 metros (TAS).

Según el paper, el entrenamiento se realiza en dos fases: un preentrenamiento por etapas seguido de aproximadamente 25,000 pasos de fine-tuning de extremo a extremo. El paquete de código proporciona un pipeline de entrenamiento completo con épocas, validación, early stopping, programación de tasa de aprendizaje y guardado de checkpoints. Por defecto, el codificador y el procesador de día 1 se congelan y solo se entrena el decodificador TAS, aunque se admite fine-tuning conjunto de todos los módulos. El dataset de entrenamiento es OneScience/Aardvark-Weather, aunque el paquete incluye una única muestra oficial para verificación de conectividad.

## Capacidades

- Predicción meteorológica global: genera un estado en rejilla de 1.5° (121×240) con 24 variables atmosféricas para el día 1.
- Predicción en estaciones: produce temperatura a 2 metros en 8,719 estaciones.
- Procesamiento de observaciones multimodales: integra datos de satélite, estaciones terrestres, barcos y radiosondas como entrada.
- Entrenamiento configurable: soporta fine-tuning solo del decodificador o de todos los módulos de forma conjunta.
- Reanudación de entrenamiento: permite continuar desde checkpoints guardados (best.pth, last.pth).
- Verificación de resultados: incluye scripts para calcular métricas normalizadas (MAE y RMSE) y generar comparaciones visuales.
- Compatibilidad con entornos DCU y GPU NVIDIA.

## Casos de uso

- Verificación de modelos oficiales: el paquete permite inspeccionar las muestras oficiales, la configuración y los checkpoints, lo que resulta útil para auditar la implementación de referencia antes de integrarla en producción.
- Predicción meteorológica global operativa: con los pesos oficiales se puede generar un pronóstico global de 24 variables a resolución de 1.5° para el día 1, adecuado para servicios que necesitan campos atmosféricos de gran escala sin depender de solvers numéricos.
- Predicción de temperatura en estaciones: el decodificador TAS produce temperatura a 2 metros en 8,719 estaciones, útil para aplicaciones agrícolas, energéticas o de gestión de riesgos que requieren valores puntuales.
- Investigación en ciencia de la Tierra: el código de entrenamiento permite experimentar con fine-tuning del decodificador o de todo el modelo sobre datos propios, explorando la transferencia a regiones o variables específicas.
- Desarrollo de pipelines de asimilación de datos basados en aprendizaje: al ser un modelo de extremo a extremo, puede servir como base para investigar alternativas a los sistemas de asimilación tradicionales.
- Formación y docencia: el paquete incluye scripts de inferencia y verificación con salidas verificadas, lo que lo hace adecuado para cursos de aprendizaje automático aplicado a ciencias atmosféricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de referencia (*End-to-end data-driven weather prediction*, Nature 2025) reporta métricas RMSE y MAE, pero el paquete actual no las reproduce. Los scripts de verificación incluidos calculan métricas normalizadas en el espacio normalizado de la muestra oficial, que no son directamente comparables con las métricas en unidades físicas del paper.

## Requisitos de hardware

- Inferencia con los pesos oficiales: requiere una GPU NVIDIA. No se especifica VRAM mínima ni modelo concreto de GPU.
- CPU: puede usarse para inspección de recursos y checkpoints, pero no se recomienda para inferencia completa.
- Entorno DCU: se proporciona soporte mediante el paquete `onescience[earth-dcu]`.
- Despliegue: el paquete incluye scripts Python (`train.py`, `inference.py`, `result.py`) y un entorno conda con dependencias específicas. No se mencionan integraciones con vLLM, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Variables | Horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Aardvark Weather | End-to-end multimodal | 1.5° (121×240) | 24 | Dia 1 (paper: hasta dia 10) | other | HuggingFace, codigo en GitHub |
| GraphCast (Google DeepMind) | Red neuronal en grafo | 0.25° | 69 | Hasta 10 dias | Apache 2.0 | Codigo abierto |
| Pangu-Weather (Huawei) | Transformer 3D | 0.25° | 69 | Hasta 7 dias | no disponible | Pesos publicados |
| FourCastNet | Transformer | 0.25° | 69 | Hasta 7 dias | no disponible | Codigo abierto |

Los datos de rendimiento comparativo (RMSE, MAE) entre estos modelos no estan disponibles en la informacion proporcionada. La comparativa se limita a caracteristicas arquitectonicas y de disponibilidad.

## Limitaciones y advertencias

- El paquete actual solo soporta predicción a día 1, mientras que el paper describe horizontes de hasta 10 días. Las salidas en estaciones se limitan a temperatura a 2 metros; el paper incluye también viento a 10 metros.
- Los resultados de inferencia constituyen una verificación de conectividad del pipeline y no reproducen las métricas RMSE/MAE del paper en unidades físicas.
- El dataset incluido contiene una única muestra oficial, por lo que el entrenamiento con ella no proporciona diversidad de datos ni permite alcanzar la precisión reportada en el paper.
- La licencia se indica como "other" sin especificar términos concretos; es necesario verificar las restricciones de uso comercial antes de desplegar el modelo en producción.
- Se requiere GPU NVIDIA para inferencia; no se documentan requisitos de VRAM, lo que dificulta planificar el despliegue en hardware específico.
- Riesgo de alucinación no aplica directamente al ser un modelo de regresión meteorológica, pero las predicciones fuera del rango de datos de entrenamiento pueden ser poco fiables, como en cualquier modelo basado en datos.
- La documentación está disponible en inglés y chino; no hay documentación oficial en español.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/Aardvark-Weather
- Paper: https://www.nature.com/articles/s41586-025-08897-0
- Codigo oficial: https://github.com/anna-allen/aardvark-weather-public
- Pesos oficiales: https://huggingface.co/datasets/av555/aardvark-weather
- Dataset de entrenamiento: https://huggingface.co/datasets/OneScience/Aardvark-Weather
