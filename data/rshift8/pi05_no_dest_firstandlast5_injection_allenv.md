# rshift8/pi05_no_dest_firstandlast5_injection_allenv

## Resumen

Este repositorio contiene los checkpoints completos en formato JAX/orbax de un fine-tuning del modelo π₀.₅ (Pi0.5) orientado a la atención de obstáculos para el sistema RoboPRO. El autor, rshift8, publica los pesos para permitir reanudar el entrenamiento o ejecutar evaluación, siguiendo el mismo patrón que el repositorio de referencia `mzxuan/robopro_jax_30000`.

El modelo base, π₀.₅, es un vision-language-action model (VLA) desarrollado por Physical Intelligence que mejora a π₀ mediante co-entrenamiento con datos heterogéneos (demostraciones robóticas, datos web y subtareas semánticas), logrando generalización en entornos abiertos para manipulación robótica de largo horizonte. Este fine-tune concreto aplica una configuración de inyección de atención a obstáculos en todos los entornos, aunque la model card no detalla la arquitectura interna ni el número de parámetros del checkpoint resultante.

La relevancia de esta publicación radica en que proporciona un punto de partida para la comunidad: al incluir `train_state`, `norm_stats.json` y el fragmento `train_config.py`, cualquier investigador puede reanudar el entrenamiento o evaluar el modelo sin necesidad de reconstruir el estado de optimización desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π₀.₅, flow-based |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en precisión nativa JAX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JAX/orbax checkpoints (params, train_state, assets) |

## Arquitectura y entrenamiento

El modelo base π₀.₅ es un VLA de tipo flow-based que co-entrena sobre fuentes de datos heterogéneas: demostraciones robóticas, datos web y subtareas semánticas. Esta estrategia permite generalización en entornos abiertos para tareas de manipulación de largo horizonte. El fine-tune aquí publicado aplica una configuración denominada `no_dest_firstandlast5_injection_allenv`, que sugiere una inyección de atención sobre obstáculos en todos los entornos de RoboPRO, excluyendo el destino y limitando la inyección a los primeros y últimos cinco pasos de la secuencia.

El repositorio incluye los artefactos necesarios para reanudar el entrenamiento: `params/` con los pesos, `train_state/` con el estado del optimizador, `assets/norm_stats.json` con las estadísticas de normalización, `_CHECKPOINT_METADATA` para los item handlers de orbax y un `train_config.py` que debe integrarse en `src/openpi/training/config.py`. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico end-to-end: genera acciones directamente a partir de observaciones visuales y lenguaje, heredado del modelo base π₀.₅.
- Atención a obstáculos: el fine-tune está diseñado para que el modelo preste atención específica a obstáculos en el entorno, según la configuración `injection_allenv`.
- Generalización en entornos abiertos: el co-entrenamiento del modelo base con datos heterogéneos permite ejecutar tareas fuera del laboratorio.
- Manipulación de largo horizonte: capacidad de ejecutar secuencias de acciones complejas, según las capacidades del modelo base.
- Reanudación de entrenamiento: al incluir `train_state` y `_CHECKPOINT_METADATA`, el checkpoint permite continuar el entrenamiento desde el paso exacto en que se guardó.
- Evaluación reproducible: los `norm_stats.json` y la configuración de entrenamiento incluida permiten reproducir la evaluación con las mismas estadísticas de normalización.

## Casos de uso

- Reanudación de entrenamiento de RoboPRO: el checkpoint incluye `train_state/` con el estado del optimizador, por lo que un investigador puede continuar el fine-tuning desde el paso guardado sin reiniciar el proceso, pegando el fragmento `train_config.py` en la configuración de openpi.
- Evaluación de atención a obstáculos: permite medir si la inyección de atención en los primeros y últimos cinco pasos mejora la tasa de éxito en entornos con obstáculos frente al modelo base π₀.₅.
- Investigación sobre VLA fine-tuned: sirve como punto de partida para estudiar cómo el fine-tuning específico de dominio afecta a la generalización en entornos abiertos.
- Comparativa de estrategias de inyección de atención: al existir otras variantes con configuraciones distintas, permite comparar el impacto de `no_dest_firstandlast5` frente a otras políticas de inyección.
- Desarrollo de pipelines de robótica con openpi: el formato JAX/orbax es compatible con el ecosistema openpi de Physical Intelligence, facilitando la integración en pipelines existentes.
- Benchmarking de RoboPRO: los checkpoints permiten reproducir experimentos y comparar métricas de éxito en tareas de manipulación con obstáculos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, tasas de éxito ni comparativas con el modelo base π₀.₅ o con otros fine-tunes de RoboPRO. Para datos de rendimiento del modelo base, se puede consultar el paper de π₀.₅ (arXiv:2504.16054), pero no se dispone de cifras específicas para este checkpoint.

## Requisitos de hardware

- Formato JAX/orbax: requiere un entorno con JAX instalado, típicamente TPU o GPU NVIDIA con soporte CUDA.
- VRAM estimada: no disponible, ya que se desconocen los parámetros totales del modelo. El modelo base π₀.₅ tiene un tamaño considerable (del orden de miles de millones de parámetros), por lo que se recomienda al menos 40-80 GB de VRAM para inferencia en precisión completa.
- GPU recomendadas: A100 80GB, H100 o TPU v4/v5 para entrenamiento; para inferencia podría usarse una RTX 4090 con cuantización, aunque no se proporcionan checkpoints cuantizados.
- Opciones de despliegue: el ecosistema openpi (GitHub Physical-Intelligence/openpi) es la vía principal; también existe soporte en Qualcomm AI Hub para compilación y evaluación en dispositivos Qualcomm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rshift8/pi05_no_dest_firstandlast5_injection_allenv | Fine-tune VLA | π₀.₅ | JAX/orbax | no disponible | HuggingFace |
| mzxuan/robopro_jax_30000 | Fine-tune VLA | π₀.₅ | JAX/orbax | no disponible | HuggingFace |
| Physical-Intelligence π₀.₅ (base) | VLA flow-based | — | JAX | no disponible | GitHub openpi |
| π₀-FAST | VLA autoregressive | π₀ | JAX | no disponible | GitHub openpi |

La comparativa se limita a la familia π₀. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia, lo que genera incertidumbre legal sobre el uso comercial y la redistribución. Se recomienda contactar al autor antes de cualquier uso en producción.
- Sin datos de rendimiento: no hay benchmarks publicados para este checkpoint, por lo que no se puede verificar que el fine-tuning mejore realmente la atención a obstáculos.
- Configuración específica de RoboPRO: el fine-tuning está orientado a un entorno concreto; la generalización a otros robots o entornos no está garantizada.
- Formato propietario de checkpoints: al ser JAX/orbax, no es directamente compatible con frameworks de inferencia estándar como vLLM u Ollama sin conversión previa.
- Dependencia del ecosistema openpi: requiere la integración del `train_config.py` en el repositorio openpi, lo que añade complejidad de despliegue.
- Riesgo de alucinación y sesgos: no se documentan sesgos específicos, pero como modelo VLA entrenado con datos heterogéneos, puede presentar comportamientos inesperados en entornos no vistos durante el entrenamiento.
- Fecha de creación futura: el checkpoint está fechado en agosto de 2026, lo que sugiere que puede ser un artefacto de investigación reciente con poca validación comunitaria (0 descargas, 0 likes).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rshift8/pi05_no_dest_firstandlast5_injection_allenv
- Repositorio de referencia RoboPRO: https://huggingface.co/mzxuan/robopro_jax_30000
- GitHub openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Paper de π₀.₅ (arXiv): https://arxiv.org/abs/2504.16054
- PDF del paper de π₀.₅: https://www.pi.website/download/pi05.pdf
- Qualcomm AI Hub (modelo π₀.₅): https://aihub.qualcomm.com/models/pi05
- Código de Qualcomm AI Hub para π₀.₅: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
