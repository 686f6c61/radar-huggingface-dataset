# KAYT-SAVAV/drive-jepa-vitl-video-model-and-path-predictor-cc0-261113

## Resumen

Drive-JEPA es un modelo de conducción autónoma de extremo a extremo desarrollado por Linhan Wang y colaboradores, que combina un modelo de vídeo basado en la arquitectura JEPA (Joint-Embedding Predictive Architecture) con un predictor de trayectorias multimodales. El repositorio aquí descrito, publicado por el usuario KAYT-SAVAV, no es el lanzamiento oficial del modelo, sino una copia sin modificar de dos archivos de pesos del lanzamiento público original alojado en `LinhanWang/Drive-JEPA`, realizada el 13 de noviembre de 2026 bajo licencia CC0 1.0.

El modelo resuelve el problema de la planificación de trayectorias en conducción autónoma: a partir de las imágenes de una cámara frontal, el sistema predice la ruta que debe seguir el vehículo. La arquitectura se apoya en un codificador de vídeo ViT-L (variante `vitl`) preentrenado sobre tres conjuntos de datos durante 50 épocas (`vitl_merge_3dataset_e50.pt`), y un segundo checkpoint (`drive_jepa_perception_free_agent_vitl.ckpt`) que integra ese modelo de vídeo con el módulo de predicción de trayectoria.

La relevancia de esta ficha es acotada: se trata de un espejo de pesos para un trabajo concreto (KAYT), con cero descargas y sin model card técnica propia. Toda la documentación sustantiva remite al paper arXiv 2601.22032 y al repositorio de código original, por lo que los detalles de entrenamiento, datos y benchmarks no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | JEPA (Joint-Embedding Predictive Architecture) sobre codificador de vídeo ViT-L, con módulo de predicción de trayectorias |
| Parámetros totales | no disponible (el nombre `vitl` sugiere un ViT-Large, pero no se confirma el recuento exacto) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo orientado a percepción visual, no a texto) |
| Licencia | CC0 1.0 |
| Formato de pesos | PyTorch: `.pt` (modelo de vídeo) y `.ckpt` (planificador con cámara frontal) |

## Arquitectura y entrenamiento

La arquitectura se basa en JEPA, un paradigma de aprendizaje autosupervisado que predice representaciones latentes en lugar de píxeles. En este caso, el modelo de vídeo emplea un codificador ViT-L (variante `vitl`) preentrenado sobre la fusión de tres conjuntos de datos durante 50 épocas, según el nombre del archivo `vitl_merge_3dataset_e50.pt`. El segundo checkpoint, `drive_jepa_perception_free_agent_vitl.ckpt`, corresponde al agente planificador "perception-free" que combina el modelo de vídeo con el componente que predice la trayectoria del coche a partir de la cámara frontal.

El paper de referencia (Wang et al., "Drive-JEPA: Video JEPA Meets Multimodal Trajectory Distillation for End-to-End Driving", arXiv 2601.22032) indica en su título la incorporación de destilación de trayectorias multimodales, pero no se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta de los tres datasets, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Percepción visual de vídeo: codificación de secuencias de imágenes de cámara frontal mediante un ViT-L.
- Predicción de trayectorias de conducción: el planificador genera la ruta del vehículo a partir de la percepción.
- Aprendizaje autosupervisado en espacio latente (JEPA), orientado a representaciones predictivas del entorno.
- Destilación de trayectorias multimodales, según el título del paper de referencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (modelo de percepción visual, no lingüístico).
- Capacidades especiales (thinking mode, visión, audio): visión (vídeo de cámara frontal) confirmada; audio y thinking mode no disponibles.

## Casos de uso

- Investigación en conducción autónoma de extremo a extremo: servir como punto de partida reproducible para experimentos que evalúen la planificación de trayectorias a partir de vídeo, ya que los pesos son copias sin modificar del lanzamiento oficial.
- Reproducción de resultados del paper Drive-JEPA: cargar `drive_jepa_perception_free_agent_vitl.ckpt` para replicar las evaluaciones descritas en arXiv 2601.22032 en entornos simulados de conducción.
- Evaluación de representaciones JEPA en vídeo: utilizar `vitl_merge_3dataset_e50.pt` como codificador preentrenado para tareas downstream de percepción (detección, segmentación o predicción) en pipelines de investigación.
- Benchmarking de planificadores "perception-free": comparar el agente de Drive-JEPA con otros planificadores que prescinden de mapas o HD maps, usando la cámara frontal como única entrada.
- Estudio de destilación multimodal de trayectorias: analizar cómo el módulo de destilación afecta a la diversidad y precisión de las rutas predichas en escenarios de simulación.
- Base para fine-tuning en dominios específicos: adaptar el codificador ViT-L a nuevos entornos de conducción (por ejemplo, condiciones meteorológicas o geográficas distintas) mediante ajuste fino supervisado.
- Docencia y formación: emplear los pesos como material didáctico en cursos de aprendizaje autosupervisado aplicado a robótica y vehículos autónomos, dado que la licencia CC0 elimina restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 8,8 GB, lo que da una cota inferior del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del codificador ViT-L, se requeriría una GPU con memoria suficiente para cargar el modelo completo, pero no se confirma.
- ¿Cabe en consumer GPU?: no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de visión y planificación, el despliegue habitual sería mediante PyTorch).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (JEPA aplicado a conducción autónoma) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio no es el lanzamiento oficial: es una copia de dos archivos de pesos realizada por un tercero (KAYT-SAVAV) el 13 de noviembre de 2026, sin model card técnica propia ni garantías de mantenimiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente de estos pesos.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con tres conjuntos de datos no identificados, pueden existir sesgos de dominio (geografía, climatología, tipo de vía) no caracterizados.
- Riesgo de alucinación: en el contexto de predicción de trayectorias, el equivalente sería generar rutas no seguras o no válidas; no se dispone de métricas de fiabilidad publicadas en esta información.
- Limitaciones de contexto o idioma: no aplica idioma; el contexto de entrada es vídeo de cámara frontal, pero no se especifica la longitud máxima de secuencia.
- Restricciones de licencia: la licencia CC0 1.0 elimina las restricciones de uso comercial sobre estos pesos; sin embargo, el código original se distribuye bajo Apache-2.0 y el paper puede tener sus propias condiciones de citación.
- Caveat importante para producción: no se recomienda su uso en sistemas de conducción reales sin una validación exhaustiva, ya que se trata de pesos de investigación sin documentación de seguridad ni certificaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KAYT-SAVAV/drive-jepa-vitl-video-model-and-path-predictor-cc0-261113
- Lanzamiento original de los pesos: https://huggingface.co/datasets/LinhanWang/Drive-JEPA
- Paper: Wang et al., "Drive-JEPA: Video JEPA Meets Multimodal Trajectory Distillation for End-to-End Driving", arXiv 2601.22032 (https://arxiv.org/abs/2601.22032)
- Código: https://github.com/linhanwang/Drive-JEPA (Apache-2.0)
