# kiroaiseoul/NAJY_act_all11_c100_gist30_reef_sf_27D_60k_s2000

## Resumen

NAJY_act_all11_c100_gist30_reef_sf_27D_60k_s2000 es un checkpoint de política robótica basado en ACT (Action Chunking Transformer) publicado por el usuario kiroaiseoul en HuggingFace, dentro del ecosistema LeRobot. No es un modelo de lenguaje: es una política de imitación que mapea observaciones visuales y de estado a acciones motoras de un robot concreto. El checkpoint corresponde al paso 60.000 del run `t48_all11_c100_gist30_reef_sf_s2000`, entrenado según el autor en una unidad DGX_1, y se ha subido explícitamente para tareas de análisis y puntuación, no como candidato cerrado a despliegue en robot real.

El modelo tiene 51.677.328 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB, lo que es coherente con pesos en precisión de 32 bits. La interfaz de entrada está definida en la model card: tres cámaras RGB a 480x640 (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) más un vector de estado de entorno de 11 dimensiones; la salida es un vector de acción de 16 dimensiones. El sufijo `27D` del nombre coincide con la suma de ambas dimensiones (11 + 16), aunque el autor no lo documenta explícitamente.

Su relevancia es acotada y de tipo reproducibilidad: se trata de un artefacto de investigación con cero descargas y cero likes, con documentación únicamente en coreano y sin métricas publicadas. Resulta útil para quien trabaje con el stack Trossen Mobile AI y LeRobot y quiera comparar checkpoints, auditar el estado del entrenamiento o reproducir el pipeline de evaluación, pero no aporta evidencia de rendimiento que permita recomendarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con encoder-decoder y componente CVAE, implementado con la libreria LeRobot |
| Parametros totales | 51.677.328 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT consume una observacion por paso de control) |
| Tipos de cuantizacion | no disponible; el tamano del repo (0,2 GB) es consistente con pesos en fp32 |
| Idiomas soportados | no disponible / no aplica (politica visomotora, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `1e62bf5ded9239c134d7858d69f645f1be0a056ab55b657a7fb3eefd3bc43c5d`) |
| Entradas declaradas | `observation.images.cam_high` [3, 480, 640], `observation.images.cam_left_wrist` [3, 480, 640], `observation.images.cam_right_wrist` [3, 480, 640], `observation.environment_state` [11] |
| Salida | `action` [16] |
| Paso del checkpoint | 60.000 |
| Run de entrenamiento | `t48_all11_c100_gist30_reef_sf_s2000` |
| Libreria / pipeline | lerobot / robotics |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de aprendizaje por imitación que predice bloques de acciones futuras en lugar de una acción por paso, combinando un encoder visual, un transformer encoder-decoder y un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas. El diseño se describió originalmente en el trabajo de Zhao et al. (2023) sobre manipulación bimanual de bajo coste con ALOHA. Los detalles concretos de esta instancia (número de capas, dimensión oculta, número de cabezas, uso efectivo de CVAE en la inferencia) no están documentados en la model card y, por tanto, no están disponibles.

El autor indica que el checkpoint proviene del paso 60.000 del run `t48_all11_c100_gist30_reef_sf_s2000`, entrenado en una unidad DGX_1, pero no publica el número de tokens, la composición del dataset, el número de demostraciones, ni si hubo etapas de RLHF o ajuste posterior (no aplicables habitualmente en políticas de imitación). La primera línea del log de entrenamiento aparece como `?`, es decir, no se ha facilitado. La model card sí declara un flag de manifiesto `{"env_stage_token": true}`, lo que sugiere que el pipeline de evaluación del autor condiciona el modelo a un token de etapa del entorno; este extremo no se explica en detalle.

El único mecanismo de verificación incluido es el hash sha256 del fichero de pesos, y la herramienta de puntuación del autor (`stage_cond_diag.py`) lee los flags desde un `multi_manifest.json` colocado en la misma carpeta del checkpoint, asumiendo la estructura `pretrained_model` de LeRobot. Como referencia de contexto, la model card remite a `docs/mobile_base_investigation.md` §94 del proyecto `trossen-ai-simulation`.

## Capacidades

- Generación de acciones motoras de 16 dimensiones a partir de tres vistas RGB y un vector de estado de 11 dimensiones, en el formato de observación declarado por el autor.
- Aprendizaje por imitación de tipo behavioral cloning con predicción de bloques de acción (action chunking), lo que reduce la frecuencia efectiva de inferencia necesaria.
- Integración nativa con LeRobot: el checkpoint se carga como `pretrained_model` y es compatible con las herramientas de entrenamiento y evaluación de la librería.
- Evaluación condicionada por etapa del entorno, según el flag `env_stage_token: true` del manifiesto.
- Diagnóstico y puntuación offline mediante `stage_cond_diag.py` y `multi_manifest.json`.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, capacidades de agente, visión general, audio ni modo de razonamiento explícito.
- No dispone de capacidades multilingües: no procesa ni produce lenguaje natural.

## Casos de uso

- Reproducción de experimentos: cargar el checkpoint en LeRobot como `pretrained_model` y reejecutar el pipeline de evaluación del autor para verificar que las métricas coinciden con las del run `t48_all11_c100_gist30_reef_sf_s2000`.
- Auditoría de integridad de artefactos: comprobar con `sha256sum model.safetensors` que el hash coincide con `1e62bf5d...` antes de usar el modelo en cualquier experimento, práctica recomendable dado que el repositorio no incluye otras garantías.
- Baseline para comparación de checkpoints: emplear este ACT de 51,7 M de parámetros y paso 60.000 como referencia frente a otros checkpoints de la misma familia (distintos pasos, distintas configuraciones de chunking) en tareas de manipulación del stack Trossen Mobile AI.
- Punto de partida para fine-tuning: reentrenar sobre un dataset propio con las mismas dimensiones de observación (3 cámaras 480x640 + estado de 11) y acción de 16, siempre que el robot destino comparta esa interfaz.
- Diagnóstico de condicionamiento por etapa: usar `stage_cond_diag.py` para analizar si el modelo realmente aprovecha el token de etapa del entorno o si lo ignora, cuestión relevante en políticas con variables de contexto discretas.
- Docencia e investigación en imitation learning: estudiar el comportamiento de una política ACT entrenada durante 60.000 pasos, analizar la degradación por cambio de distribución y documentar el efecto del chunking en la estabilidad de la ejecución.
- Evaluación en simulación: ejecutar la política en el simulador asociado al proyecto `trossen-ai-simulation` antes de plantear cualquier traslado a hardware real, dado que el autor no confirma el checkpoint como candidato de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, errores de posición, métricas de simulación ni comparaciones con otros checkpoints; únicamente identifica el paso de entrenamiento (60.000) y el hash del fichero de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 207 MB (51.677.328 parámetros x 4 bytes), coherente con el repositorio de 0,2 GB. Sumando activaciones de tres imágenes de 480x640 y el grafo del transformer, una estimación razonable es de 2 a 4 GB de VRAM con batch 1; esta cifra es una estimación a partir del recuento de parámetros y del tamaño de entrada, no un dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en la práctica. Una RTX 3060, RTX 4060 o RTX 4090 cubren el caso de uso con holgura; A100 y H100 solo tendrían sentido si se comparte nodo con otros procesos o si se entrena desde cero.
- Cabe en GPU de consumo: sí, con margen amplio, incluso en fp32 y sin cuantización.
- Opciones de despliegue: LeRobot (carga como `pretrained_model`, servidor de políticas y rollout), PyTorch nativo; exportación a ONNX o TensorRT como vía para reducir latencia. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia arquitectónica, el action chunking de ACT amortiza la inferencia al predecir varios pasos de acción por forward pass; el nombre del run incluye `c100`, lo que podría indicar un chunk de 100 pasos, pero el autor no lo confirma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_gist30_reef_sf_27D_60k_s2000 | 51,7 M | no disponible (chunking, valor no confirmado) | Apache 2.0 | HuggingFace, 0 descargas | Checkpoint de investigacion sin metricas publicadas |
| ACT original (implementacion de referencia LeRobot) | orden de magnitud similar (~50 M), valor exacto no disponible | action chunking configurable | MIT (segun el repositorio original, no verificado en esta ficha) | Repositorio publico | Arquitectura de referencia sobre la que se construye este checkpoint |
| Diffusion Policy | no disponible | prediccion de horizontes de accion | no disponible en esta ficha | Repositorio publico | Alternativa habitual en imitation learning visomotor; requiere comparacion empirica |
| SmolVLA (LeRobot) | cientos de millones, valor exacto no disponible | politicas VLA con entrada de lenguaje | no disponible en esta ficha | HuggingFace | Anade instrucciones en lenguaje natural, capacidad de la que carece este checkpoint |

No se dispone de datos de rendimiento comparables para este checkpoint, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay tasas de éxito ni evaluaciones publicadas, y el propio autor indica que el checkpoint se sube para análisis y puntuación, no como candidato confirmado de despliegue real.
- Acoplamiento estricto al embodiment: la política espera exactamente tres cámaras a 480x640, un vector de estado de 11 dimensiones y produce 16 dimensiones de acción. Cualquier robot con otra configuración requerirá reentrenamiento, no solo un cambio de configuración.
- Log de entrenamiento incompleto: la primera línea aparece como `?`, de modo que no se puede verificar la configuración de entrenamiento, el dataset ni la curva de pérdida.
- Riesgo de sobreajuste y de error compuesto: con 60.000 pasos sobre un dataset no documentado, es plausible un sobreajuste a las trayectorias de demostración; en políticas de imitación los errores se acumulan a lo largo de la ejecución y provocan fallos difíciles de recuperar.
- Cambio de distribución: variaciones de iluminación, posición de cámara, fondo o calibración de los brazos degradan el rendimiento sin aviso, al no existir mecanismo de detección de fuera de distribución.
- Documentación únicamente en coreano y muy escueta, lo que dificulta la replicación por parte de equipos fuera de ese contexto.
- Cero descargas y cero likes: el artefacto no ha sido validado por terceros; la única garantía objetiva es el hash sha256 del fichero de pesos.
- El flag `env_stage_token: true` implica dependencia de un token de etapa del entorno cuyo significado no se documenta; usar el modelo fuera del pipeline previsto puede producir comportamiento inconsistente.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución y sin garantías. Al no haber entrenado el autor con datos públicos verificables, la idoneidad legal de los datos de entrenamiento subyacentes no se puede confirmar.
- No aplica el riesgo de alucinación tal como se entiende en modelos de lenguaje, pero sí el equivalente en políticas visomotoras: ejecución de acciones plausibles pero incorrectas con alta confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_reef_sf_27D_60k_s2000
- Repositorio de la librería LeRobot: https://github.com/huggingface/lerobot (referencia general de la librería, no enlazada en la model card)
- Documentación de contexto citada por el autor: `trossen-ai-simulation`, `docs/mobile_base_investigation.md` §94 (el autor no proporciona URL)
- Paper original de la arquitectura ACT: Zhao et al., 2023, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (el autor no incluye enlace en la model card)
