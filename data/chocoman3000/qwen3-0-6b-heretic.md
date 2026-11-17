# ChocoMan3000/qwen3-0.6b-heretic

## Resumen

Qwen3-0.6B-Heretic es una variante del modelo Qwen3-0.6B de Alibaba Qwen en la que se ha suprimido el comportamiento de rechazo (refusal) mediante una tecnica de abliteracion conocida como Arbitrary-Rank Ablation (ARA). Lo desarrolla el usuario ChocoMan3000 y se publica bajo licencia Apache-2.0, heredada del modelo base. El objetivo no es mejorar las capacidades del modelo, sino eliminar las respuestas de negativa ante peticiones que el modelo original rechazaria, manteniendo al mismo tiempo una divergencia minima respecto al comportamiento del modelo base.

El modelo conserva la arquitectura y el tamano del Qwen3-0.6B original: un transformer denso de aproximadamente 0,6 mil millones de parametros, orientado a generacion de texto y con soporte de plantilla de chat. La intervencion se aplica sobre las capas 14 a 20 y se optimiza con Optuna TPE a lo largo de 200 trials, seleccionando el trial de la frontera de Pareto que reduce los rechazos un 94 % (de 53 a 3 sobre 100 prompts) con una divergencia KL de solo 0,0016.

Su relevancia es fundamentalmente metodologica y de investigacion: sirve como caso reproducible de steering de modelos, red-teaming y evaluacion de seguridad, y se distribuye con pesos en safetensors, GGUF (F16 y Q8_0) y OpenVINO (int8 e int4), lo que facilita su despliegue en entornos de CPU y GPU de baja capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | Aproximadamente 0,6 mil millones (heredado del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0 (GGUF); int8, int4 (OpenVINO); bfloat16 (safetensors) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (1,19 GB), GGUF (F16 1,2 GB; Q8_0 639 MB), OpenVINO (int8 598 MB; int4 385 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de la familia Qwen3. Sobre ese modelo base no se realiza un reentrenamiento ni un ajuste fino supervisado, sino una modificacion de los pesos mediante abliteracion: se identifica una direccion en el espacio de activaciones asociada al comportamiento de rechazo y se proyecta fuera de las activaciones de un rango de capas. En este caso se emplea Arbitrary-Rank Ablation (ARA), una variante que permite ablacionar subespacios de rango arbitrario en lugar de una unica direccion.

La herramienta utilizada es Heretic v2.1.0, con un optimizador Optuna TPE de 200 trials (30 de arranque aleatorio). Los objetivos de optimizacion son la tasa de palabras clave de rechazo (`KeywordRate`, a minimizar) y la divergencia KL respecto al modelo base sobre prompts benignos (`KLDivergence`, a minimizar). Los datos de contraste son `mlabonne/harmful_behaviors` (400 prompts) y `mlabonne/harmless_alpaca` (400 prompts). El trial ganador (indice 1 de la frontera de Pareto) opera sobre las capas 14 a 20 con `preserve_good_behavior_weight` 0,9661, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 0,0768 y `neighbor_count` 14. El journal completo de los 200 trials se incluye en el repositorio (`Qwen3_0.6B_heretic_journal.jsonl`), lo que permite reproducir exactamente la exportacion con el comando documentado en la model card.

## Capacidades

- Generacion de texto autoregresiva con plantilla de chat compatible con el formato de Qwen3.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 0,6 B de parametros del modelo base.
- Supresion del comportamiento de rechazo: responde a peticiones que el Qwen3-0.6B original rechazaria, con una reduccion del 94 % en la tasa de rechazos medida sobre 100 prompts.
- Soporte multilingue limitado al ingles segun la model card, aunque el modelo base Qwen3 es multilingue.
- Compatibilidad con pipelines de `transformers`, `llama.cpp` (GGUF) y OpenVINO GenAI.
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido en la informacion proporcionada.

## Casos de uso

- Investigacion en steering de modelos: el modelo sirve como referencia reproducible para estudiar como la ablacion de direcciones afecta al comportamiento de rechazo, gracias al journal de Optuna incluido y al comando de reexportacion documentado.
- Red-teaming y evaluacion de seguridad: permite a equipos de seguridad probar la robustez de sus filtros y clasificadores frente a un modelo deliberadamente sin censura, en un entorno controlado y con pesos abiertos.
- Despliegue en entornos de CPU sin GPU: las variantes OpenVINO int8 (598 MB) e int4 (385 MB) permiten ejecutar inferencia en portatiles o servidores sin acelerador dedicado mediante `openvino_genai.LLMPipeline`.
- Prototipado rapido de aplicaciones de chat: con GGUF Q8_0 (639 MB) se puede levantar un servidor local con `llama.cpp` en minutos para validar flujos conversacionales antes de migrar a un modelo mayor.
- Experimentos de destilacion y comparacion de comportamiento: al mantener una divergencia KL de 0,0016 respecto al base, es util para medir cuanto del comportamiento original se conserva tras una intervencion de pesos.
- Educacion y divulgacion sobre alineamiento: sirve para demostrar de forma practica que el rechazo en modelos de lenguaje esta mediado por direcciones identificables en el espacio de activaciones, siguiendo el trabajo de Arditi et al. 2024.
- Evaluacion de pipelines de inferencia: sus cuatro formatos de pesos permiten comparar latencia y calidad entre `transformers`, `llama.cpp` y OpenVINO sobre el mismo modelo.

## Benchmarks y rendimiento

| Metrica | Qwen3-0.6B base | Qwen3-0.6B-Heretic |
|---|---|---|
| Rechazos (`mlabonne/harmful_behaviors`, 100 prompts) | 53 | 3 |
| Divergencia KL (`mlabonne/harmless_alpaca`, 100 prompts) | 0 | 0,0016 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas reportadas son las de supresion de rechazo y divergencia respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,2 GB de pesos mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en OpenVINO int8: aproximadamente 0,6 GB; en int4, aproximadamente 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien funciona en CPU mediante OpenVINO o `llama.cpp`.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, e incluso en iGPU con suficiente memoria compartida usando las variantes cuantizadas.
- Opciones de despliegue: `transformers` (safetensors), `llama.cpp` / `llama-cli` (GGUF F16 y Q8_0), OpenVINO GenAI (int8 e int4). No se documenta soporte especifico de vLLM o TGI en la informacion proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (100 prompts) | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3-0.6B-Heretic | ~0,6 B | No disponible | 3 | Apache-2.0 | safetensors, GGUF, OpenVINO |
| Qwen/Qwen3-0.6B (base) | ~0,6 B | No disponible | 53 | Apache-2.0 | safetensors |
| Otras variantes abliteradas de Qwen3-0.6B | ~0,6 B | No disponible | No disponible | Apache-2.0 (heredada) | Variable |

No se dispone de datos de benchmarks de capacidad ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria mas alla del modelo base. La comparacion principal es contra Qwen3-0.6B, del que se diferencia unicamente en la tasa de rechazo y en la divergencia KL reportada.

## Limitaciones y advertencias

- La abliteracion elimina el comportamiento de rechazo, no mejora la capacidad del modelo: la precision factual, el razonamiento y el resto de comportamientos heredados son los del Qwen3-0.6B base, que es un modelo pequeno con razonamiento debil en comparacion con modelos mayores de la familia Qwen.
- No se aplica ningun filtro de seguridad. El modelo respondera a peticiones que el original rechazaria, lo que implica riesgo de generar contenido danino, sesgado o inexacto.
- Riesgo elevado de alucinacion inherente a un modelo de 0,6 B de parametros; no debe usarse como fuente de verdad sin verificacion externa.
- Idiomas soportados declarados: solo ingles. El rendimiento en castellano no esta documentado y probablemente sea inferior al del modelo base multilingue.
- La longitud de contexto no se especifica en la model card; no debe asumirse la del Qwen3-0.6B original sin verificar la configuracion.
- Uso comercial: la licencia Apache-2.0 lo permite tecnicamente, pero la model card restringe explicitamente el proposito a investigacion sobre steering, red-teaming y evaluacion de seguridad, y desaconseja su despliegue en productos de cara al usuario sin una capa de seguridad propia.
- La herramienta Heretic esta bajo AGPL-3.0, lo que afecta al codigo fuente pero no a los pesos del modelo, segun la propia model card.
- El repositorio no tiene descargas ni likes y los pesos ocupan 0,0 GB en el momento de la consulta, lo que sugiere que puede tratarse de una publicacion reciente o incompleta; conviene verificar la integridad de los archivos antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChocoMan3000/qwen3-0.6b-heretic
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Paper de referencia sobre direccion de rechazo (Arditi et al. 2024): no disponible en la informacion proporcionada
