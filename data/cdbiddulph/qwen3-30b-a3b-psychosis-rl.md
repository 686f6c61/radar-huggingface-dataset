# CDBiddulph/qwen3-30b-a3b-psychosis-rl

## Resumen

`CDBiddulph/qwen3-30b-a3b-psychosis-rl` es un adaptador LoRA (PEFT) entrenado mediante aprendizaje por refuerzo sobre el modelo base Qwen3-30B-A3B. Lo publica el usuario CDBiddulph y no se trata de un modelo de propósito general, sino de un artefacto de investigación: el checkpoint final de una ejecución de RL denominada "psychosis task" (semilla 1), con una recompensa declarada de 0,90. La model card no define en qué consiste esa tarea, qué función de recompensa se utilizó ni qué datos se emplearon, por lo que su comportamiento específico no es verificable a partir de la documentación publicada.

El modelo base aporta la práctica totalidad de la capacidad: Qwen3-30B-A3B es un transformer decoder-only con mezcla de expertos de 30.500 millones de parámetros totales y 3.300 millones activos por token, contexto nativo de 262.144 tokens y licencia Apache-2.0. Sobre esa arquitectura, el adaptador introduce un ajuste fino de bajo rango que solo es cargable junto con el modelo base; no existe una versión mergeada publicada en el repositorio.

Su relevancia es metodológica más que de producto. El interés está en el pipeline: entrenamiento con Tinker y tinker-cookbook, registro del run en Weights & Biases y publicación del checkpoint final. Resulta útil como referencia para quien quiera replicar flujos de RL sobre modelos MoE, pero no es un modelo recomendable para despliegue en producción: cero descargas, cero valoraciones, ausencia de evaluación de capacidades y una descripción de tarea que roza el ámbito de la salud mental sin ninguna salvaguarda documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) en el modelo base; adaptador LoRA (PEFT) sobre dicha arquitectura |
| Parametros totales | 30.500 millones en el modelo base; parametros del adaptador no disponibles (tamano del repo: 6,8 GB) |
| Parametros activos | 3.300 millones por token en el modelo base (herencia de Qwen3-30B-A3B) |
| Longitud de contexto | 262.144 tokens nativos en el modelo base; no se especifica para el adaptador |
| Tipos de cuantizacion | No especificados para el adaptador. Al ser un LoRA en safetensors, la cuantizacion se aplica al modelo base (GGUF, AWQ, GPTQ mediante herramientas de la comunidad) |
| Idiomas soportados | No disponibles en la model card. El modelo base declara cobertura de 119 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-30B-A3B, un transformer decoder-only con mezcla de expertos: 30.500 millones de parámetros totales de los que se activan aproximadamente 3.300 millones por token, lo que sitúa su coste computacional de inferencia en el orden de un modelo denso de 3.000 millones. El contexto nativo del base es de 262.144 tokens. El adaptador en sí es un LoRA de rango bajo: la model card no indica dimensión de rango, módulos objetivo ni número de parámetros entrenables, y el tamaño del repositorio (6,8 GB) es muy superior al que cabría esperar de un adaptador LoRA convencional sobre este base, lo que sugiere que el checkpoint publicado puede contener pesos del sampler en mayor precisión o artefactos adicionales del run de Tinker. Es un punto que conviene verificar antes de asumir que basta con cargarlo mediante `PeftModel.from_pretrained`.

El entrenamiento se realizó con aprendizaje por refuerzo usando Tinker (Thinking Machines) y la librería tinker-cookbook en la versión 0.5.8.dev5. La model card únicamente aporta la recompensa final del checkpoint (0,90) y el enlace al run de Weights & Biases. No se documentan el algoritmo de RL empleado (PPO, GRPO u otro), el tamaño del dataset de prompts, la composición de los datos, la existencia de fases previas de SFT, ni si hubo filtrado de seguridad posterior. Tampoco se detalla la definición de la tarea "psychosis", lo que impide conocer qué comportamiento se está reforzando exactamente. El entorno declarado incluye transformers 5.5.4 y torch 2.13.0, versiones que condicionan la reproducibilidad.

## Capacidades

- Generación de texto autoregresiva heredada íntegramente del modelo base Qwen3-30B-A3B, incluido su modo de razonamiento extendido (thinking mode) cuando se activa mediante plantilla de chat.
- Razonamiento multietapa y matemáticas: capacidades propias del base, no evaluadas tras el ajuste RL.
- Generación de código: capacidad heredada del base, sin datos de evaluación específicos para este adaptador.
- Soporte de tool calling y function calling: dependiente del modelo base y de la plantilla de chat utilizada; no documentado para el adaptador.
- Capacidades multilingües: presumiblemente heredadas del base (119 idiomas declarados), sin verificación en este checkpoint.
- Comportamiento específico de la tarea "psychosis": es la única capacidad entrenada explícitamente, pero no está descrita en la model card ni cuantificada más allá de la recompensa de 0,90 del run.
- No se documentan capacidades de visión, audio, decodificación especulativa ni modos de agente.

## Casos de uso

- Replicación de pipelines de RL sobre modelos MoE: el repositorio enlaza el run de Weights & Biases y la versión exacta de tinker-cookbook, lo que permite reconstruir la configuración de entrenamiento y comparar curvas de recompensa con otras semillas.
- Estudio de adaptadores LoRA de bajo rango: sirve como caso de análisis de cuánto puede alterar un adaptador pequeño el comportamiento de un MoE de 30B, comparando salidas del base y del adaptador sobre el mismo prompt set.
- Investigación sobre ajuste por refuerzo y colapso de capacidades: útil para medir la degradación de tareas generales (código, matemáticas, multilingüismo) después de un RL estrecho sobre una única tarea.
- Análisis de robustez y reward hacking: al conocerse solo la recompensa final, es un candidato razonable para inspeccionar si el modelo explota atajos de la función de recompensa en lugar de resolver la tarea.
- Control negativo en evaluaciones de seguridad: para probar si un clasificador o un juez automático detecta derivas de comportamiento en un modelo ajustado sobre una tarea sensible no descrita.
- Docencia y formación técnica: ejemplo práctico de publicación de un checkpoint de RL con PEFT, Tinker y W&B, útil en materiales sobre flujos de ajuste fino reproducibles.
- Generación de datos sintéticos para simulación clínica: solo en entornos de investigación con revisión ética y supervisión experta, dado que la semántica de la tarea no está documentada y no existe evaluación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato numérico del repositorio es la recompensa final del run de RL (0,90), que corresponde a una función de recompensa definida por el autor para la tarea "psychosis" y no es comparable con MMLU, HumanEval, GSM8K ni con ninguna métrica estándar. No hay tablas de evaluación del adaptador frente al modelo base.

## Requisitos de hardware

Estimaciones referidas al modelo base, ya que la model card no aporta mediciones del adaptador:

- VRAM para inferencia en bf16/fp16: en torno a 61 GB solo para pesos del base, más caché KV. Requiere una GPU de 80 GB o reparto en varias.
- VRAM en cuantización de 8 bits: aproximadamente 31-34 GB de pesos; cabe en una A100 40 GB o en dos RTX 4090.
- VRAM en cuantización de 4 bits: aproximadamente 17-20 GB de pesos; cabe en una RTX 4090 de 24 GB, con margen limitado para contextos largos.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 con contexto amplio; A100 40 GB o 2× RTX 4090 para 8 bits; RTX 4090, RTX 3090 o L40S para 4 bits.
- Coste computacional: al activar solo ~3,3B parámetros por token, el throughput se aproxima al de un modelo denso de 3B, aunque la memoria necesaria sea la de un modelo de 30B.
- Opciones de despliegue: vLLM y TGI para servicio con alto throughput (soporte de MoE en vLLM); llama.cpp y Ollama para cuantizaciones GGUF en local; transformers + peft para cargar el adaptador. Para produccion con el adaptador conviene fusionarlo previamente con el base (`merge_and_unload`) y servir el modelo resultante.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni para el base ni para el adaptador en este repositorio.

## Comparativa con modelos similares

Datos de los modelos comparados tomados de su documentación pública; el adaptador no aporta métricas propias.

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3-30b-a3b-psychosis-rl (este) | 30,5B / 3,3B (base) + LoRA | 262.144 tokens (base) | Apache-2.0 | Adaptador RL de investigación, sin evaluación publicada ni adopción |
| Qwen3-30B-A3B (base) | 30,5B / 3,3B | 262.144 tokens nativos | Apache-2.0 | Referencia directa; capacidades generales, modo thinking, tool calling |
| Qwen3-32B (denso) | 32,8B / 32,8B | 32.768 tokens nativos (extensible con YaRN) | Apache-2.0 | Denso, mayor coste de inferencia por token, sin ruta MoE |
| Mixtral 8x7B | 46,7B / 12,9B | 32.768 tokens | Apache-2.0 | MoE con más parámetros activos y contexto mucho menor |

Frente al base, este checkpoint solo se diferencia por el ajuste RL sobre una tarea no descrita; no hay evidencia publicada de que mejore ninguna capacidad general y sí riesgo de regresión. Frente a Qwen3-32B y Mixtral 8x7B, la ventaja del linaje Qwen3-30B-A3B es el coste de inferencia (3,3B activos) y la ventana de contexto.

## Limitaciones y advertencias

- La tarea "psychosis" no está definida en la model card: se desconoce qué comportamiento se refuerza, con qué datos y con qué criterio de recompensa. Es un riesgo directo si se usa sin inspección previa.
- El dominio aparente (salud mental) es sensible. No hay evaluación de seguridad, ni filtrado, ni declaración de uso responsable, ni aviso sobre uso clínico. No debe emplearse en contextos de atención a pacientes, triaje psicológico o generación de contenido dirigido a personas vulnerables.
- Riesgo de alucinación inherente al modelo base, sin cuantificar tras el ajuste. El RL sobre una tarea estrecha puede incrementar la confianza en dominios donde el modelo no tiene cobertura real.
- Posible degradación de capacidades generales (código, matemáticas, multilingüismo) por sobreajuste a la función de recompensa; no hay evaluación que lo descarte ni lo confirme.
- Sesgos: no documentados. Se heredan los del corpus de entrenamiento de Qwen3, sin auditoría publicada para este adaptador.
- Idiomas: la model card no los declara. El comportamiento multilingüe tras el RL es desconocido y podría haberse deteriorado.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero se ofrece sin garantías. El autor no asume responsabilidad por el uso del artefacto.
- Es un adaptador, no un modelo autónomo: requiere descargar el base Qwen3-30B-A3B (unos 60 GB en bf16) y cargarlo con `peft`. El tamaño del repo (6,8 GB) no cuadra con un LoRA típico, por lo que conviene inspeccionar el contenido antes de asumir el flujo estándar de carga.
- Dependencias frágiles: transformers 5.5.4 y torch 2.13.0 son las versiones declaradas; pueden aparecer incompatibilidades con entornos estándar actuales.
- Adopción nula: 0 descargas y 0 valoraciones en el momento de la consulta. No hay comunidad que haya validado el checkpoint.
- Ausencia total de benchmarks: cualquier afirmación sobre su calidad relativa es especulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CDBiddulph/qwen3-30b-a3b-psychosis-rl
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker
- tinker-cookbook (repositorio): https://github.com/thinkingmachines-lab/tinker-cookbook
- Run de entrenamiento en Weights & Biases: https://wandb.ai/automated-scaffolding/gepa/runs/o6boectu
- Checkpoint de origen en Tinker: `tinker://e4678438-7b0c-5f89-ad86-97d32fd5cbea:train:0/sampler_weights/final`
