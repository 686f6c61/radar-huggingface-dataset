# hfunknown/qwen3-8b-knapsack-lora-stateless-seed3407

## Resumen

Este repositorio contiene un adaptador LoRA denominado `qwen3-8b-knapsack-lora-stateless-seed3407`, publicado de forma anónima por el usuario `hfunknown` como material complementario para una revisión de reproducibilidad de un workshop de doble ciego (presumiblemente NeurIPS). El adaptador se construye sobre el modelo base Qwen/Qwen3-8B y está especializado en la tarea agéntica "Opaque Knapsack", un entorno de agente que requiere razonamiento multi-paso con un intérprete de Python sin estado (el estado del intérprete se reinicia en cada turno del agente). El entrenamiento se realizó con el framework Axolotl 0.13.2, aplicando cuantización 4-bit NF4 sobre el modelo base y usando una configuración LoRA con rango 64 y alpha 128.

La relevancia de este adaptador reside en su naturaleza experimental: es uno de seis adaptadores (combinación de régimen de entrenamiento persistente/stateless × 3 semillas) generados para estudiar el efecto del estado del intérprete en tareas agénticas. El repositorio no incluye código de evaluación ni métricas publicadas, y la licencia no está especificada. El tamaño del repositorio es de 0.7 GB, lo que corresponde al adaptador LoRA (los pesos del modelo base no están incluidos). Dado que el autor declara que la publicación no anónima (con paper, código y trazas completas) llegará tras la revisión, esta ficha se limita a describir lo disponible públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adaptador sobre Qwen3-8B (Transformer denso) |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 8.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16384 (sequence_len de entrenamiento) |
| Tipos de cuantizacion | 4-bit NF4 (para el modelo base durante el entrenamiento) |
| Idiomas soportados | no disponible (depende del base Qwen3-8B, que es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-8B, un modelo Transformer denso de 8.000 millones de parametros con soporte para modo pensamiento (thinking) y modo no-pensamiento, segun el informe tecnico de Qwen3. El entrenamiento del adaptador utiliza LoRA (Low-Rank Adaptation) con rango 64, alpha 128 y dropout 0.05, aplicado a todas las proyecciones lineales del transformer (q, k, v, o, gate, up, down). El modelo base se cuantiza a 4-bit NF4 para reducir el uso de memoria. El entrenamiento se ejecuta con Axolotl 0.13.2, con una tasa de aprendizaje de 1e-4, scheduler coseno, optimizador AdamW, 3 épocas, micro-batch de 1 y acumulación de gradientes de 16, lo que da un batch efectivo de 16. La longitud de secuencia es de 16384 tokens y no se usa sample packing.

Los datos de entrenamiento consisten en trazas emparejadas (paired traces) para el régimen "stateless", donde el intérprete de Python se reinicia en cada turno del agente. El procedimiento de emparejamiento y filtrado se describe en el apéndice del paper (aún no publicado). La semilla utilizada es 3407. No se mencionan técnicas adicionales como RLHF o DPO; el entrenamiento es de fine-tuning supervisado (SFT) sobre las trazas.

## Capacidades

- Generacion de texto: el adaptador hereda las capacidades generativas del base Qwen3-8B, aunque su especializacion es la tarea agéntica Opaque Knapsack.
- Razonamiento multi-paso: el entrenamiento con trazas de agente sugiere capacidad para planificar y ejecutar acciones secuenciales, aunque no se han publicado evaluaciones independientes.
- Ejecucion de codigo: la tarea implica un intérprete de Python stateless, por lo que el adaptador deberia manejar generacion de codigo Python y su ejecucion simulada.
- Tool calling / function calling: no documentado explicitamente, pero la naturaleza agéntica de la tarea implica interaccion con herramientas (el intérprete).
- Multilingue: depende del modelo base Qwen3-8B, que soporta multiples idiomas; el adaptador no especifica restricciones.
- Modo pensamiento: el base Qwen3-8B soporta thinking mode; no se indica si el adaptador lo activa o desactiva.

## Casos de uso

- Investigacion en agentes con estado: este adaptador es util para reproducir los experimentos del paper sobre el efecto del estado del intérprete en tareas agénticas. Se cargaria con PEFT sobre Qwen3-8B y se evaluaria en el entorno Opaque Knapsack.
- Comparacion de regimenes de entrenamiento: al ser uno de seis adaptadores (stateless vs persistent × 3 seeds), permite estudiar la variabilidad entre semillas y el impacto del reinicio del estado.
- Desarrollo de agentes con memoria limitada: el regimen stateless obliga al modelo a razonar sin depender de estado externo persistente, lo que puede ser relevante para entornos con restricciones de memoria.
- Fine-tuning de referencia: sirve como ejemplo de configuracion LoRA con Axolotl para tareas agénticas sobre Qwen3-8B (rango, alpha, cuantizacion 4-bit).
- Evaluacion de reproducibilidad: al ser una publicacion anonima para revision, permite verificar la reproducibilidad de los resultados del workshop.
- Educacion: como caso de estudio de adaptacion de un LLM a una tarea agéntica especifica con LoRA y cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de evaluacion, ni comparaciones con otros modelos, ni datos de rendimiento en la tarea Opaque Knapsack. Se espera que el paper complementario (tras la revision) aporte estos datos.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA pesa 0.7 GB, pero el modelo base Qwen3-8B en 4-bit NF4 ocupa aproximadamente 5-6 GB. Para inferencia con el adaptador cargado, se necesitan al menos 8 GB de VRAM si se mantiene el base en 4-bit. Si se usa el base en precision completa (16-bit), se requieren ~16 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o superior para inferencia comoda con contexto de 16384 tokens. Para entrenamiento (como se hizo), se necesito una GPU con al menos 24 GB (por el micro-batch de 1 y la longitud de secuencia).
- En consumer GPU: si, una RTX 4090 puede ejecutar el modelo con el adaptador en 4-bit sin problemas. Una RTX 3060 de 12 GB podria funcionar con cuantizacion adicional.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft`. Para servidores, vLLM soporta LoRA (aunque requiere compilar con soporte). Tambien se puede usar TGI con adaptadores. Para inferencia local, llama.cpp no soporta LoRA directamente, pero se puede fusionar el adaptador en el base y exportar a GGUF.
- Latencia y throughput: no disponible. Depende del hardware y de la longitud de las secuencias generadas.

## Comparativa con modelos similares

No hay modelos directamente comparables publicados, ya que este adaptador es especifico para la tarea Opaque Knapsack y no se han publicado otros adaptadores de la misma tarea (los otros cinco del estudio no estan publicados en este repositorio). Como referencia, se puede comparar con el modelo base Qwen3-8B (sin adaptador) y con otros adaptadores LoRA para tareas agénticas, pero no hay datos publicos de rendimiento para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-8b-knapsack-lora-stateless-seed3407 | 8B (base) + LoRA | 16384 | no disponible | Repositorio publico |
| Qwen/Qwen3-8B (base) | 8B | 32768 (segun informe) | Apache 2.0 (segun repo oficial) | HuggingFace |
| Otros adaptadores LoRA de Qwen3-8B | 8B (base) | variable | variable | no comparable |

Nota: la licencia del adaptador no esta especificada, aunque el modelo base Qwen3-8B se distribuye bajo Apache 2.0 segun su repositorio oficial.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion especifica. El modelo base Qwen3-8B puede presentar sesgos tipicos de los LLM entrenados con datos web, pero no se ha evaluado este adaptador.
- Riesgo de alucinacion: no evaluado. El adaptador se entreno en trazas de agente, por lo que podria generar acciones o codigo incorrecto en entornos no vistos.
- Limitaciones de contexto: la longitud de entrenamiento es de 16384 tokens; aunque el base soporta hasta 32768, el adaptador puede degradarse mas alla de 16384.
- Restricciones de licencia: la licencia del adaptador es "no disponible". Esto implica que no se puede asumir permiso de uso comercial. El modelo base Qwen3-8B es Apache 2.0, pero el adaptador no declara licencia, por lo que se debe contactar al autor o esperar la publicacion no anonima.
- Uso en produccion: no recomendado. Es un artefacto de investigacion para un workshop, sin evaluacion de robustez ni seguridad.
- Estado del intérprete: el regimen stateless significa que el modelo no puede depender de estado persistente entre turnos; en aplicaciones reales, si se usa con un intérprete con estado, el comportamiento puede diferir.
- Reproducibilidad: la publicacion es anonima; no hay garantia de que el codigo o las trazas de entrenamiento se liberen tras la revision.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/hfunknown/qwen3-8b-knapsack-lora-stateless-seed3407
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/pdf/2505.09388
- Página de Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
- Repositorio de Axolotl: https://github.com/axolotl-ai-cloud/axolotl
