# Jeongeun/cosmos-policy-watch-mid

## Resumen

cosmos-policy-watch-mid es un checkpoint de entrenamiento intermedio (mid-training) del modelo Cosmos-Predict2.5-2B, publicado por el usuario Jeongeun en Hugging Face. Se trata de un world-action model orientado a robótica, entrenado sobre 8.000 iteraciones con vídeos humanos del dataset EgoVerse v10 a resolución de 448 píxeles y con representación de estado de 57 dimensiones (state57). El checkpoint sirve como punto de partida (warm start) para posteriores fases de post-entrenamiento sobre simulador de mesa (Tabletop-Sim pv0), el robot humanoide GR1 y el robot real Sprout.

El modelo se distribuye a través de la librería `cosmos-policy`, un framework específico para políticas robóticas construido sobre la familia Cosmos-Predict2.5 de NVIDIA. El repositorio ocupa 3,9 GB y contiene un único artefacto de pesos en formato PyTorch (`.pt`), no en safetensors ni GGUF. La licencia es "other": el modelo base Cosmos-Predict2.5 está sujeto a la NVIDIA Open Model License, mientras que el checkpoint derivado hereda condiciones adicionales no detalladas en la model card.

La relevancia de esta publicación es acotada: no es un modelo listo para uso general, sino un artefacto de investigación que documenta una etapa concreta de un pipeline de entrenamiento en robótica. Resulta útil para quienes replican el flujo de trabajo del autor o quieren partir de un estado ya entrenado con vídeos humanos antes de adaptar la política a un robot físico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos-Predict2.5 (world-action model, base 2B); detalles internos no disponibles |
| Parametros totales | 2B (según nombre del experimento `cosmos_predict2p5_2b`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.pt`, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | other (base bajo NVIDIA Open Model License; condiciones del checkpoint derivado no detalladas) |
| Formato de pesos | PyTorch `.pt` (`model_000008000.pt`) |

## Arquitectura y entrenamiento

El checkpoint deriva de Cosmos-Predict2.5-2B, un modelo de la familia Cosmos orientada a predicción y acción en entornos físicos. El nombre del experimento, `cosmos_predict2p5_2b_egoverse_ret_v3_448_state`, indica que se entrenó con retornos (ret) sobre EgoVerse v10, a 448 píxeles y con un vector de estado de 57 dimensiones. El entrenamiento consistió en 8.000 iteraciones sobre vídeos humanos en primera persona (egocéntricos), lo que constituye una fase de mid-training previa al ajuste específico por robot.

No se detalla en la información disponible la composición exacta del dataset, el número de tokens o frames procesados, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores. La model card indica explícitamente que este checkpoint es el warm start de tres post-entrenamientos: Tabletop-Sim pv0, GR1 y Sprout real robot. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones visuales y vectores de estado de 57 dimensiones, en el marco del paradigma world-action model.
- Entrenamiento sobre vídeos humanos egocéntricos (EgoVerse v10), lo que le permite aprender correlaciones entre percepción visual en primera persona y dinámica de manipulación.
- Punto de partida para post-entrenamiento en simulador (Tabletop-Sim pv0) y en robots reales (GR1 humanoide, Sprout).
- Integración con la librería `cosmos-policy` y su documentación de despliegue en robot real (`docs/real-robot-context-free.md`).
- No se documentan capacidades de generación de texto, tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito.
- No se documentan capacidades de visión general, audio u otras modalidades fuera del contexto robótico.

## Casos de uso

- Replicación de pipelines de investigación en robótica: investigadores que quieran reproducir el flujo de entrenamiento del autor pueden descargar este checkpoint como warm start y continuar con el post-entrenamiento en Tabletop-Sim pv0, evitando repetir las 8.000 iteraciones iniciales sobre EgoVerse.
- Adaptación a robots humanoides: el checkpoint sirve como base para el ajuste sobre GR1, aprovechando el aprendizaje previo de dinámicas de manipulación a partir de vídeos humanos egocéntricos.
- Transferencia sim-to-real: al ser el punto de partida del post-entrenamiento en el robot real Sprout, permite estudiar cómo se transfieren las representaciones aprendidas de vídeo humano a control físico real.
- Estudio de representaciones de estado: el uso de un vector state57 facilita experimentos sobre cómo codificar el estado proprioceptivo del robot y su impacto en la política aprendida.
- Benchmarking de world-action models: sirve como referencia intermedia para comparar curvas de aprendizaje entre distintas fases de entrenamiento (mid-training frente a post-training).
- Docencia y divulgación técnica: útil para explicar las distintas etapas de un pipeline de entrenamiento en robótica (pre-entrenamiento con vídeo humano, mid-training, post-entrenamiento por robot) con un artefacto concreto y descargable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia orientativa, un modelo de 2B parámetros en precisión FP16 requiere del orden de 4-5 GB solo para pesos, más memoria para activaciones y buffers de vídeo, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de 2B sugiere que podría caber en GPUs de consumo con VRAM suficiente, pero no hay datos oficiales.
- Opciones de despliegue: la librería `cosmos-policy` y el repositorio GitHub del autor (https://github.com/jeongeun980906/cosmos_policy) son la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos-policy-watch-mid | 2B | no disponible | World-action model para robótica (mid-training) | other (base NVIDIA Open Model License) | Hugging Face, 3,9 GB |
| Cosmos-Predict2.5-2B (base) | 2B | no disponible | Modelo base de predicción | NVIDIA Open Model License | No detallada en la información |
| Alternativas robóticas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros world-action models (por ejemplo, variantes de RT-2, OpenVLA u otros) dentro de los datos proporcionados.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: no está pensado para uso directo en producción sin completar las fases de post-entrenamiento correspondientes.
- La licencia "other" no especifica condiciones claras para uso comercial del checkpoint derivado; la base está bajo NVIDIA Open Model License, pero las obligaciones concretas deben verificarse antes de cualquier despliegue.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento fuera de distribución; al tratarse de un modelo de política robótica, los fallos se manifiestan como acciones incorrectas, potencialmente peligrosas en un robot real.
- El entrenamiento se hizo exclusivamente con vídeos humanos egocéntricos y a 448 píxeles; la generalización a otras cámaras, resoluciones o morfologías no está documentada.
- El formato `.pt` requiere cargar código PyTorch arbitrario; conviene auditar el repositorio antes de ejecutarlo en entornos sensibles.
- No se documentan idiomas soportados ni capacidades lingüísticas; no debe tratarse como un modelo de lenguaje.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni evidencia de reproducibilidad independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Jeongeun/cosmos-policy-watch-mid
- Repositorio GitHub del autor: https://github.com/jeongeun980906/cosmos_policy
- Documentación de despliegue en robot real: `docs/real-robot-context-free.md` (dentro del repositorio anterior)
- Descarga directa del checkpoint: `hf download Jeongeun/cosmos-policy-watch-mid egoverse_ret_v3_448_state_4node/model_000008000.pt --local-dir watch-mid`
- Licencia NVIDIA Open Model License (modelo base Cosmos-Predict2.5): no se proporciona URL específica en la información disponible.
