# DAGroup-PKU/HumanWAM-Vanilla-RoboDojo

## Resumen

HumanWAM-Vanilla-RoboDojo es un repositorio de Hugging Face asociado a la familia HumanWAM (world-action model) del grupo DAGroup-PKU, orientada a robótica y control de políticas. Según su model card, se trata de la variante post-entrenada con 3.500 demostraciones de robot sobre el modelo base HumanWAM-Vanilla-Base, tras un preentrenamiento con datos humanos egocéntricos y una adaptación multivista EgoPro. El repositorio está etiquetado como `robotics`, `world-action-model`, `robodojo` y `post-training`, y su pipeline declarado es `robotics`.

El punto crítico es que se trata de un repositorio reservado: la model card indica explícitamente que no se han publicado pesos en el momento de su creación y que el checkpoint de post-entrenamiento está pendiente de confirmación. Por tanto, no es actualmente un modelo ejecutable ni reproducible, sino un contenedor de documentación y trazabilidad para una futura release.

La relevancia de esta ficha es acotada: sirve para identificar la existencia de la variante RoboDojo dentro del ecosistema HumanWAM y para documentar sus cifras declaradas (14,17 de éxito y 19,00 de progreso, en contexto de manuscrito), pero no permite evaluar el modelo ni desplegarlo. Cualquier uso en producción debe posponerse hasta que se publiquen pesos, estadísticas de normalización y configuraciones de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (descrita como world-action model; sin detalle de capas ni bloques en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se han publicado pesos en el repositorio) |

## Arquitectura y entrenamiento

La model card describe el modelo como un world-action model (WAM) para robótica, entrenado en dos fases: un preentrenamiento con datos humanos egocéntricos y una adaptación multivista EgoPro, seguido de un post-entrenamiento con 3.500 demostraciones de robot en el entorno RoboDojo. No se especifican en la información disponible el tipo de backbone (transformer, MoE, híbrido u otro), el número de parámetros, la composición exacta del dataset ni los detalles del objetivo de entrenamiento.

El dataset asociado es DAGroup-PKU/Open-HumanScale-50K, que por su nombre sugiere un corpus a escala humana de 50.000 elementos, aunque no se detalla su composición. Tampoco se documentan en la model card técnicas como RLHF, DPO, decodificación especulativa o atención lineal. La model card advierte que las estadísticas de normalización, las configuraciones de correspondencia y los recursos de inferencia se añadirán tras la selección del checkpoint, lo que confirma que el pipeline de entrenamiento aún no está cerrado públicamente.

## Capacidades

- Control de políticas robóticas: el modelo está orientado a generar acciones o políticas de control a partir de observaciones, según su etiqueta `world-action-model`.
- Post-entrenamiento específico para el entorno RoboDojo, con 3.500 demostraciones de robot.
- Adaptación multivista mediante EgoPro, según la descripción del autor.
- Preentrenamiento con datos humanos egocéntricos, lo que sugiere transferencia desde demostraciones humanas a políticas de robot.
- Idioma declarado: inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible; la model card no detalla modalidades de entrada ni salida.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo serviría como referencia para reproducir el post-entrenamiento con 3.500 demostraciones en RoboDojo, comparando la variante Vanilla con las variantes RoboTwin y RoboDojo de la misma familia.
- Evaluación de transferencia humano-robot: al partir de preentrenamiento egocéntrico humano y adaptarse a robot, es adecuado para estudiar cuánto conocimiento humano se transfiere a políticas de manipulación.
- Benchmarking interno de políticas robóticas: las cifras declaradas (14,17 de éxito, 19,00 de progreso) permiten, una vez liberado el checkpoint, comparar contra otras políticas en el mismo entorno.
- Base para fine-tuning en dominios específicos: al ser un modelo post-entrenado, podría servir como punto de partida para ajustes con datos propios de un robot concreto, siempre que se publiquen los pesos.
- Docencia y divulgación: el repositorio documenta el flujo preentrenamiento egocéntrico → adaptación EgoPro → post-entrenamiento robótico, útil como material de estudio de pipelines de WAM.
- Integración en simulación RoboDojo: una vez disponible el checkpoint, se usaría dentro del simulador para evaluar políticas antes de transferirlas a hardware real.

Ninguno de estos casos es ejecutable hoy: el repositorio no contiene pesos ni recursos de inferencia.

## Benchmarks y rendimiento

La model card reporta las siguientes cifras, presentadas como contexto de manuscrito y no vinculadas a un checkpoint liberado:

| Métrica | Valor declarado |
|---|---|
| Success | 14,17 |
| Progress | 19,00 |

No se especifica la escala de estas métricas (porcentaje, media por episodio u otra), ni el conjunto de evaluación, ni los modelos comparados. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se conocen parámetros ni formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; al no haber pesos publicados, no hay integración documentada.
- Latencia y throughput estimados: no disponible.

La model card indica que los recursos de inferencia se añadirán tras la selección del checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HumanWAM-Vanilla-RoboDojo | no disponible | no disponible | 14,17 success / 19,00 progress (contexto de manuscrito) | no disponible | Solo README, sin pesos |
| HumanWAM-Vanilla-Base | no disponible | no disponible | no disponible | no disponible | Modelo base referenciado |
| HumanWAM-Vanilla-RoboTwin | no disponible | no disponible | no disponible | no disponible | Variante de la misma familia |

No se dispone de datos suficientes para comparar con políticas robóticas externas (por ejemplo, modelos de acción tipo diffusion policy o VLA de otros grupos), ya que la información proporcionada no incluye especificaciones ni resultados de terceros.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un README reservado y no un modelo ejecutable.
- El checkpoint de post-entrenamiento está pendiente de confirmación; la tabla de checkpoints está vacía.
- Las cifras de 14,17 success y 19,00 progress son contexto de manuscrito y no están vinculadas a ningún artefacto liberado; no deben citarse como resultados reproducibles.
- No se han publicado estadísticas de normalización ni configuraciones de inferencia, lo que impide reproducir el pipeline.
- Licencia no disponible: no se puede asumir uso comercial permitido.
- Idioma declarado únicamente inglés; no hay evidencia de soporte multilingüe.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto; al ser un modelo de robótica, el riesgo principal es de seguridad física en despliegues reales, no evaluable sin pesos ni evaluaciones.
- Cualquier uso en producción debe posponerse hasta que el autor publique pesos, licencia y recursos de inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-RoboDojo
- Modelo base: https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-Base
- Variante RoboTwin: https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-RoboTwin
- Dataset Open-HumanScale-50K: https://huggingface.co/datasets/DAGroup-PKU/Open-HumanScale-50K
- Código y documentación del proyecto: https://github.com/ucasmjc/OpenHumanScale
