# rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-karl-marx-r2-reasoning-low

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con GRPO sobre el modelo base Qwen2.5-3B-Instruct, publicado por el usuario rubenbalbastre. No se trata de un modelo completo, sino de pesos de adaptación en formato PEFT (0,5 GB de repositorio), pensados para cargarse encima del modelo base mediante `transformers` y `peft`. El identificador del repositorio sugiere que forma parte de una línea de experimentos de *machine unlearning* orientados a borrar o atenuar un concepto concreto ("karl-marx") y a condicionar el estilo de razonamiento ("r2-reasoning-low"), aunque esa interpretación procede del nombre y no de documentación explícita.

El interés técnico está en el procedimiento: aplicar aprendizaje por refuerzo (GRPO, vía TRL) sobre un adaptador LoRA para modificar el comportamiento de un modelo instruct de 3.000 millones de parámetros, en lugar de recurrir a un *fine-tuning* completo. Es un ejemplo de la familia de técnicas de olvido selectivo y alineación ligera que se están explorando para cumplimiento normativo, desintoxicación de modelos y control de conocimiento no deseado sin reentrenar el modelo desde cero.

Ahora bien, la model card publicada es la plantilla por defecto de HuggingFace sin rellenar: no documenta datos de entrenamiento, hiperparámetros, evaluación, licencia ni idiomas. El repositorio tiene cero descargas y cero *likes*, y fue creado en septiembre de 2026. Debe tratarse, por tanto, como un artefacto de investigación sin validación pública ni garantías de reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2ForCausalLM del modelo base Qwen2.5-3B-Instruct) |
| Parametros totales | 3,09 B en el modelo base (heredado); el adaptador ocupa aproximadamente 0,5 GB en disco |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-3B-Instruct; no confirmado para el adaptador |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones GGUF, AWQ y GPTQ, pero no se documentan aquí |
| Idiomas soportados | No disponible en la información del repositorio; el modelo base Qwen2.5 declara soporte multilingüe |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, codificación posicional rotatoria (RoPE) y atención con *grouped-query attention* (GQA). El adaptador LoRA añade matrices de bajo rango sobre capas seleccionadas, lo que reduce drásticamente el número de parámetros entrenables frente a un *fine-tuning* completo. La única versión de framework declarada es PEFT 0.19.1.

El entrenamiento se realizó con GRPO (*Group Relative Policy Optimization*) según las etiquetas del repositorio, un algoritmo de aprendizaje por refuerzo sin modelo de recompensa separado, implementado en la librería TRL. No se especifican el conjunto de datos, el número de tokens vistos, el *prompt* de recompensa, los hiperparámetros (rango LoRA, alpha, *learning rate*, pasos) ni si hubo una fase previa de SFT. Tampoco se detalla si el adaptador se aplicó solo a las proyecciones de atención o a todas las capas lineales. Se referencia el artículo arXiv:2608.17804, que presumiblemente describe el método, pero su contenido no está incluido en la información disponible.

## Capacidades

- Generación de texto conversacional: el adaptador se apoya en un modelo instruct, por lo que mantiene el formato de chat con roles de sistema, usuario y asistente.
- Razonamiento condicionado: el sufijo "reasoning-low" del identificador sugiere que el entrenamiento modula el nivel o estilo de razonamiento (posiblemente cadenas de pensamiento cortas), pero no hay documentación que lo confirme.
- Modificación selectiva de conocimiento: el propósito declarado por el nombre es el olvido de un concepto concreto, de modo que la "capacidad" buscada es precisamente la ausencia de ese contenido.
- Capacidades heredadas del base: Qwen2.5-3B-Instruct soporta *function calling* / uso de herramientas, generación de código y matemáticas básicas, y conversación multilingüe; no se ha verificado que estas capacidades sobrevivan intactas tras el entrenamiento con GRPO.
- No se documenta soporte de visión, audio, *thinking mode* explícito ni uso agéntico multi-paso.

## Casos de uso

- Investigación en *machine unlearning*: usar el adaptador como caso de estudio reproducible para medir cuánto conocimiento desaparece y a qué coste en capacidades generales, comparando las respuestas antes y después de aplicar el LoRA.
- Auditoría de borrado de conceptos: ejecutar baterías de *prompts* que indaguen en el concepto objetivo y comprobar si el modelo lo elude, lo reconstruye parcialmente o lo sustituye por contenido erróneo.
- Evaluación de robustez del olvido: someter al modelo a *prompts* indirectos, multilingües o con *jailbreaks* para determinar si el olvido es superficial (a nivel de superficie) o profundo (a nivel de representación interna).
- Base para experimentos de alineación ligera: servir como punto de partida para probar otras combinaciones de GRPO con LoRA sobre modelos de 3 B, midiendo la eficiencia del método frente a un *fine-tuning* completo.
- Análisis de regresiones: cuantificar la degradación en tareas estándar (comprensión lectora, matemáticas, código) atribuible al entrenamiento de olvido, un dato clave para decidir si la técnica es viable en producción.
- Docencia y divulgación: ilustrar en un aula o tutorial cómo se carga un adaptador PEFT con `transformers` y cómo se fusiona con el modelo base para inspeccionar los cambios de comportamiento.
- Comparación de técnicas de desaprendizaje: contrastar este adaptador (GRPO + LoRA) con alternativas como *fine-tuning* sobre datos corregidos, edición de conocimiento o enrutado condicional, usando el mismo modelo base como control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye ninguna sección de evaluación cumplimentada, y no hay métricas de olvido (por ejemplo, exactitud sobre el concepto objetivo) ni de retención de capacidades generales (MMLU, GSM8K, HumanEval u otras). Tampoco se aportan datos de *throughput* o latencia.

## Requisitos de hardware

- Adaptador: alrededor de 0,5 GB en disco; su huella en VRAM es marginal frente a la del modelo base.
- Modelo base en bf16/fp16: aproximadamente 6,2 GB solo de pesos; con caché KV para contexto largo, la estimación práctica se sitúa en torno a 8-10 GB de VRAM.
- Cuantización de 8 bits: alrededor de 3,5 GB de pesos, viable en GPU de 6-8 GB con contexto moderado.
- Cuantización de 4 bits (por ejemplo, GGUF Q4_K_M): alrededor de 2 GB de pesos, ejecutable en GPU de 6 GB e incluso en CPU con llama.cpp.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB o superiores para fp16 sin compromisos; A100 y H100 son sobredimensionadas para un modelo de 3 B salvo por concurrencia alta.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en cuantización de 4-8 bits, y en 6 GB con contexto reducido.
- Opciones de despliegue: `transformers` + `peft` (con `merge_and_unload` para fusionar el adaptador), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp u Ollama tras fusionar y convertir a GGUF, y LM Studio.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-3B-Instruct) | 3,09 B en el base + LoRA de ~0,5 GB | 32.768 tokens en el base | Adaptador LoRA entrenado con GRPO | No disponible | 0 descargas, 0 likes |
| Qwen2.5-3B-Instruct (modelo base) | 3,09 B | 32.768 tokens | Modelo instruct completo | Licencia Qwen Research (verificar antes de uso comercial) | Ampliamente disponible |
| Otros adaptadores de *machine unlearning* comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la información proporcionada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con otras técnicas de desaprendizaje (edición de conocimiento, *unlearning* por gradiente negativo, *fine-tuning* sobre datos corregidos), por lo que la comparativa se limita a la naturaleza del artefacto y a su disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto. No hay información sobre datos, hiperparámetros, evaluación ni uso previsto.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso de uso comercial. Además, el modelo base Qwen2.5-3B-Instruct se distribuye bajo la licencia Qwen Research, que restringe el uso comercial; conviene verificar ambas condiciones antes de cualquier despliegue.
- Riesgo de olvido superficial: el desaprendizaje mediante RL sobre adaptadores LoRA suele ser frágil y puede revertirse con *prompts* reformulados, contextos multilingües o ejemplos *few-shot*. Sin evaluación publicada, no puede afirmarse que el concepto esté realmente eliminado.
- Degradación de capacidades colateral: el entrenamiento con GRPO para modificar el comportamiento puede afectar a la coherencia, al razonamiento o al formato de salida del modelo base. No se ha medido ese coste.
- Riesgo de alucinación: el modelo base es un modelo pequeño (3 B), con tendencia a inventar datos en preguntas factuales; el adaptador no corrige ese comportamiento y podría agravarlo al alterar el conocimiento almacenado.
- Sesgos: no se documenta ningún análisis de sesgos. El olvido selectivo de un concepto con carga ideológica (según el identificador) plantea riesgos evidentes de sesgo direccional y de manipulación de la información que el modelo devuelve.
- Idiomas: no se declara el conjunto de idiomas soportados; el comportamiento del adaptador fuera del inglés o del chino es desconocido.
- Falta de reproducibilidad: no se publican datos, código de entrenamiento ni *seeds*, por lo que no puede reproducirse el adaptador.
- Advertencia de uso en producción: cero descargas, cero validación externa y ausencia de evaluación lo convierten en un artefacto exclusivamente de investigación. No debe desplegarse en aplicaciones orientadas a usuarios sin una evaluación independiente previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-karl-marx-r2-reasoning-low
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Artículo referenciado (arXiv:2608.17804): https://arxiv.org/abs/2608.17804
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL (GRPO): https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers
