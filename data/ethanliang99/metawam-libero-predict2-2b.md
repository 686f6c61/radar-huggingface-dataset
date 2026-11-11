# Ethanliang99/MetaWAM-LIBERO-Predict2-2B

## Resumen

MetaWAM-LIBERO-Predict2-2B es un World Action Model (WAM) para robótica desarrollado por Guoqiang Liang y colaboradores del grupo showlab, presentado en el artículo "From Video Frames to Robot Meta-Frames: A Unified Latent Interface for World Action Models" (CoRL 2026). El modelo parte del difusor de vídeo Cosmos-Predict2-2B-Video2World de NVIDIA y se afina sobre el conjunto de datos LIBERO para predecir acciones de robot, estados futuros de propriocepción y valores, todo dentro de un único modelo de denoising.

La innovación central es la representación de señales robóticas como "meta-frames": las acciones, la propriocepción, la propriocepción futura y los valores se empaquetan en bandas de canales disjuntas y se transforman con una DCT inversa 2D en marcos compactos. Máscaras específicas por slot permiten entrenar conjuntamente política, modelo del mundo y estimador de valor con un solo denoising. El checkpoint tiene 2B parámetros y se distribuye en bf16.

Es relevante para investigadores que trabajan en modelos fundacionales de robótica y en la unificación de política y modelo del mundo bajo una misma interfaz latente, ya que elimina la necesidad de cabezas o modelos separados para cada tarea. El repositorio ocupa 4,0 GB y actualmente no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo (base Cosmos-Predict2-2B-Video2World) con meta-frames DCT y máscaras por slot |
| Parametros totales | 2B (según el nombre del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | nvidia-base-model-license (licencia del modelo base) |
| Formato de pesos | `.pt` consolidado en bf16, más JSON de estadísticas, PKL de embeddings T5 y SHA256SUMS |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de difusión de vídeo de Cosmos-Predict2-2B-Video2World y la adapta a robótica mediante un interfaz latente unificado. Las señales de robot (tipo de tarea, propriocepción, chunks de acción, propriocepción futura y valores) se empaquetan en slots de coeficientes fijos de bandas de canales disjuntas y se elevan a meta-frames compactos mediante una DCT inversa 2D. Sobre esa representación, máscaras específicas por slot entrenan simultáneamente la política, el modelo del mundo y la predicción de valor en un único modelo de denoising.

El checkpoint se ha afinado sobre LIBERO, concretamente sobre las suites LIBERO-Spatial, LIBERO-Object, LIBERO-Goal y LIBERO-10, entrenadas de forma conjunta. Los embeddings T5 de las instrucciones de tarea se precalculan y se distribuyen junto a los pesos, junto con las estadísticas de normalización de acciones y propriocepción. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Predicción de acciones de robot (action chunks) a partir de instrucciones de tarea y observaciones.
- Modelado del mundo: predicción de marcos de vídeo futuros y de propriocepción futura.
- Estimación de valor dentro del mismo modelo de denoising.
- Ejecución de tareas de manipulación en los cuatro entornos LIBERO (Spatial, Object, Goal y 10).
- Interfaz latente unificada que combina política, modelo del mundo y valor en un solo modelo.
- Condicionamiento por instrucciones de lenguaje mediante embeddings T5 precalculados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión general o audio: no disponibles.

## Casos de uso

- Evaluación de políticas de manipulación en LIBERO: el checkpoint permite reproducir los experimentos de las cuatro suites con `scripts/test_libero.sh` y semillas 195-197, útil para comparar variantes de WAM bajo condiciones controladas.
- Investigación en modelos del mundo para robótica: al predecir marcos futuros y propriocepción futura, sirve para estudiar la planificación basada en modelo y la consistencia entre política y dinámica aprendida.
- Aprendizaje por refuerzo con estimador de valor integrado: la predicción de valor dentro del mismo denoising facilita pipelines de RL sin un crítico separado.
- Estudio de interfaces latentes unificadas: los meta-frames con DCT y máscaras por slot son un objeto de investigación reproducible para analizar cómo distintas señales robóticas conviven en un mismo espacio latente.
- Prototipado de políticas condicionadas por lenguaje: los embeddings T5 precalculados permiten evaluar el seguimiento de instrucciones en tareas de manipulación sin reentrenar el codificador de texto.
- Base para fine-tuning en nuevos dominios robóticos: al partir de Cosmos-Predict2-2B-Video2World, el checkpoint puede servir como inicialización para adaptar el WAM a otros conjuntos de datos de manipulación.
- Docencia y divulgación: ejemplo concreto de fusión entre difusión de vídeo y control robótico para cursos de aprendizaje profundo aplicado a robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB solo para los pesos en bf16, más memoria para activaciones y el pipeline de difusión; se recomienda al menos 16-24 GB para ejecución cómoda.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia y evaluación; GPUs con 16 GB o más para pruebas puntuales.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más (RTX 4080, 4090, 3090), aunque con margen limitado por las activaciones del difusor.
- Opciones de despliegue: el repositorio oficial proporciona el config `metawam_libero__inference` y scripts de test; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MetaWAM-LIBERO-Predict2-2B | 2B | no disponible | World Action Model sobre LIBERO | nvidia-base-model-license | Hugging Face, 0 descargas |
| Cosmos-Predict2-2B-Video2World | 2B | no disponible | Difusión de vídeo condicionada por mundo | nvidia-base-model-license | Hugging Face (NVIDIA) |
| Cosmos Policy (referencia de estadísticas y T5) | no disponible | no disponible | Política robótica sobre LIBERO | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre LIBERO; su generalización a otros entornos, robots o tareas no está validada.
- No se documentan sesgos conocidos, pero al derivar de un difusor de vídeo puede heredar sesgos de los datos de preentrenamiento de Cosmos-Predict2.
- Riesgo de alucinación: como modelo generativo de difusión, puede producir predicciones de vídeo o acciones plausibles pero incorrectas; no se han publicado métricas de calibración.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles; el condicionamiento lingüístico depende de embeddings T5 precalculados para las instrucciones de LIBERO.
- Restricciones de licencia: los pesos se rigen por la nvidia-base-model-license del modelo base; es necesario revisar sus términos antes de cualquier uso comercial.
- Para producción: el checkpoint se distribuye como `.pt` consolidado sin integraciones de serving documentadas, y el repositorio no registra descargas ni validación externa.
- El artículo asociado (arXiv:2611.14365) y el código están enlazados, pero no se detallan en la información disponible los resultados numéricos ni los detalles completos del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Ethanliang99/MetaWAM-LIBERO-Predict2-2B
- Paper: https://arxiv.org/abs/2611.14365
- Código: https://github.com/showlab/MetaWAM
- Instrucciones LIBERO: https://github.com/showlab/MetaWAM/blob/main/LIBERO.md
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2-2B-Video2World
