# Anshler/vad-jepa

## Resumen

VAD-JEPA es un proyecto de detección de anomalías en vídeo (video anomaly detection, VAD) orientado a secuencias de dashcam de tráfico. El modelo, desarrollado por Anshler, combina la arquitectura de predicción conjunta por embeddings (JEPA) con módulos de state space models (SlotSSM y Mamba) para modelar la evolución temporal de las escenas. Se presenta como un conjunto de checkpoints preentrenados y ajustados que permiten clasificar segmentos de vídeo como normales o anómalos, con especial foco en escenarios de conducción.

La relevancia del modelo radica en su enfoque híbrido: aprovecha las ventajas de los modelos de espacio de estado para secuencias largas y la representación semántica aprendida de forma autosupervisada típica de JEPA. El repositorio en Hugging Face incluye múltiples variantes con diferentes longitudes de contexto latente (VCL) y número de frames (NF), tanto congeladas (frozen) como ajustadas (finetuned), lo que permite adaptar el modelo a distintos requisitos de latencia y precisión. El tamaño total del repositorio es de 16,2 GB, aunque no se especifica el tamaño individual de cada checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (Video Joint Embedding Predictive Architecture) con SlotSSM (Sparse Gated y Dense) y Mamba |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de vídeo, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vídeo, sin procesamiento de lenguaje) |
| Licencia | GPL-2.0 |
| Formato de pesos | PyTorch (checkpoints .pt) |

## Arquitectura y entrenamiento

La arquitectura se basa en los principios de V-JEPA, donde un encoder de vídeo aprende representaciones predictivas en un espacio latente mediante autosupervisión. Sobre esta base, el proyecto incorpora dos tipos de módulos temporales: SlotSSM, que utiliza state space models con slots (tanto en versión densa como sparse gated), y Mamba, un modelo de espacio de estado selectivo. Estos módulos procesan las representaciones latentes de los frames para modelar dependencias temporales y detectar desviaciones que indiquen anomalías.

El entrenamiento se realizó en dos fases: primero un preentrenamiento congelado (frozen) de los pesos del encoder y el módulo temporal, y posteriormente un ajuste fino (finetuned) sobre el dataset objetivo (posiblemente relacionado con tráfico y DOTA, aunque no se detalla). La model card lista 20 variantes con diferentes combinaciones de VCL (8, 16, 28, 64), NF (4, 8, 12) y tipo de módulo, indicando la mejor época para cada una. No se proporciona información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Detección de anomalías en vídeo de tráfico: identifica eventos inusuales en secuencias de dashcam (accidentes, peatones cruzando, vehículos en dirección contraria, etc.).
- Clasificación de vídeo a nivel de segmento: asigna una etiqueta binaria (normal/anómalo) a cada ventana temporal procesada.
- Procesamiento de secuencias temporales largas gracias a los módulos SSM y Mamba, que manejan dependencias de largo alcance de forma eficiente.
- Múltiples configuraciones de contexto latente y número de frames para equilibrar latencia y precisión según el caso de uso.
- Modelos preentrenados y ajustados: permite usar los checkpoints frozen como extractores de características o los finetuned para inferencia directa.
- Integración con el repositorio oficial VAD-JEPA mediante scripts de configuración y evaluación.

## Casos de uso

- Vigilancia de tráfico en tiempo real: el modelo puede analizar streams de cámaras de tráfico para alertar automáticamente sobre incidentes (colisiones, vehículos detenidos en carril, objetos en la calzada). Su baja latencia con configuraciones de VCL reducido (8 o 16) lo hace adecuado para procesamiento en borde.
- Asistencia al conductor (ADAS): integración en sistemas de dashcam inteligentes para detectar comportamientos peligrosos de otros vehículos o condiciones de carretera anómalas, generando avisos al conductor.
- Análisis forense de grabaciones: revisión automatizada de largas horas de vídeo de flotas para localizar eventos relevantes, reduciendo el tiempo de revisión manual.
- Investigación académica: sirve como baseline para estudios sobre detección de anomalías con arquitecturas JEPA y SSM, permitiendo comparar con métodos tradicionales de reconstrucción o predicción.
- Sistemas de gestión de flotas: monitorización de vídeo de vehículos comerciales para detectar incidentes o comportamientos de conducción arriesgados, con fines de seguros o formación.
- Desarrollo de modelos personalizados: los checkpoints frozen pueden usarse como extractores de características para entrenar clasificadores ligeros sobre dominios específicos de vídeo, gracias a su representación semántica aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como AUC, precisión o recall sobre datasets estándar (p. ej., UCSD Ped2, ShanghaiTech o DOTA). Tampoco se proporcionan comparaciones con otros métodos de VAD.

## Requisitos de hardware

- Tamaño del repositorio: 16,2 GB, lo que sugiere que cada checkpoint ocupa varios GB. No se especifica el tamaño individual, pero para un modelo de vídeo con encoder JEPA y módulos SSM, se estima que la inferencia requiere al menos 16 GB de VRAM en precisión fp32.
- GPU recomendadas: no se indica oficialmente. Por el tamaño, se necesitarían GPUs de gama alta (A100, H100, RTX 4090) para ejecutar los checkpoints más grandes (VCL 64). Las variantes con VCL 8 o 16 podrían caber en GPUs de 12-16 GB, pero no está confirmado.
- Opciones de despliegue: el proyecto proporciona scripts en PyTorch (`main.py` con configuraciones YAML). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Para producción, sería necesario implementar un servicio propio usando PyTorch o convertir a TensorRT/ONNX.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración elegida (VCL, NF, tipo de módulo).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de detección de anomalías en vídeo. Como referencia conceptual, V-JEPA 2 de Meta (https://ai.meta.com/research/vjepa/) es un modelo de mundo autosupervisado para vídeo, pero no está orientado específicamente a VAD y no se han publicado comparaciones directas con VAD-JEPA. Tampoco hay datos sobre modelos como VideoMAE o STGCN en este contexto.

## Limitaciones y advertencias

- Licencia GPL-2.0: cualquier uso o modificación del modelo y su código debe publicarse bajo la misma licencia, lo que puede ser restrictivo para aplicaciones comerciales cerradas.
- Especialización en tráfico: el modelo se entrenó con dashcam footage, por lo que su rendimiento en otros dominios (vigilancia general, vídeo industrial) puede degradarse significativamente.
- Sin información sobre sesgos: no se documentan posibles sesgos en los datos de entrenamiento (p. ej., condiciones meteorológicas, geografías, tipos de vehículos) que podrían afectar la generalización.
- Riesgo de falsos positivos/negativos: al ser un modelo de clasificación binaria, puede fallar en escenarios ambiguos o con oclusiones; no se han publicado métricas de error.
- Documentación limitada: no hay detalles sobre el dataset de entrenamiento, el proceso de anotación ni la evaluación, lo que dificulta la reproducibilidad.
- Tamaño y requisitos: el repositorio ocupa 16,2 GB, y los checkpoints grandes pueden no ser viables para despliegue en hardware de consumo sin cuantización (no se ofrecen versiones cuantizadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anshler/vad-jepa
- Repositorio GitHub del proyecto: https://github.com/Anshler/vad-jepa
- Artículo de V-JEPA 2 (referencia arquitectónica): https://arxiv.org/abs/2506.09985
- Página de V-JEPA 2 de Meta: https://ai.meta.com/research/vjepa/
