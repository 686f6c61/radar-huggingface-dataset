# blackfan23/sabi-noema-sharp

## Resumen

Sabi-Noema Sharp es una distribucion cuantizada en 4 bits del modelo base `sabicap/sabi-noema`, publicada por el usuario blackfan23 (Julius) en HuggingFace. El repositorio contiene unicamente pesos en formato MLX (Apple Silicon) generados con `mlx.core.quantize` en modo affine con group size 64, junto con una plantilla de chat personalizada denominada Sharp, derivada del repositorio `peculiar-ragdoll/Qwen-Sharp-Chat-Templates` y rebasada sobre froggeric v22.5. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: pesos cuantizados mas configuracion de tokenizer y plantilla de conversacion.

El modelo base pertenece a la familia Qwen (el tag `qwen3_5` y las referencias a esquemas de tool calling de Qwen asi lo indican), con 27.356.728.560 parametros totales segun los safetensors del repositorio, lo que lo situa en el rango de 27B. La variante Sharp modifica exclusivamente el comportamiento conversacional: reduce el numero de tokens de razonamiento antes de emitir respuesta, mantiene soporte para `enable_thinking` y `reasoning_effort`, y conserva los esquemas de function calling de Qwen. El interes practico esta en que permite ejecutar un modelo de ~27B en Apple Silicon con un peso cuantizado de 16,22 GB, algo viable en equipos con memoria unificada de 24-32 GB.

La licencia es Apache 2.0 y el repositorio tiene 32 descargas y 0 likes en el momento de redactar esta ficha. La model card no documenta datos de entrenamiento, composicion del dataset, idiomas soportados ni resultados de benchmarks del modelo base, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen (tag `qwen3_5`); detalles de atencion y capas no disponibles |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine MLX, group size 64 (581 capas lineales cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx.core.quantize`), 16,22 GB de pesos cuantizados |
| Modelo base | sabicap/sabi-noema |
| Plantilla de chat | Sharp (derivada de Qwen-Sharp-Chat-Templates, rebase froggeric v22.5) |
| Capas preservadas sin cuantizar | Embeddings de tokens, pesos de normalizacion 1D y kernels conv1d |
| Tamano del repositorio | 17,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `sabicap/sabi-noema`, etiquetado como `qwen3_5`, es decir, un transformer de la familia Qwen con 27,36B parametros. La model card de esta distribucion no aporta informacion sobre el numero de capas, dimension oculta, tipo de atencion (completa, GQA, sliding window) ni sobre el proceso de entrenamiento del modelo base: no se documentan tokens de entrenamiento, composicion del dataset, fases de RLHF o DPO, ni innovaciones como decodificacion especulativa. Esos datos, si existen, estarian en la model card de `sabicap/sabi-noema`, que no forma parte de la informacion proporcionada.

La contribucion tecnica de este repositorio es doble. Por un lado, la cuantizacion: se aplica cuantizacion affine de 4 bits con group size 64 a 581 capas lineales mediante MLX, preservando embeddings, normalizaciones y kernels conv1d en precision original, lo que reduce el peso a 16,22 GB. Por otro, la plantilla Sharp: una plantilla de chat disenada para modelos Qwen que recorta los tokens de razonamiento intermedios sin sacrificar rigor, con soporte explicito de `enable_thinking`, `reasoning_effort` y los esquemas de tool calling de Qwen. La plantilla se inyecta tanto en `chat_template.jinja` como en `tokenizer_config.json` para garantizar compatibilidad entre transformers, MLX, vLLM y llama.cpp.

## Capacidades

- Generacion de texto y razonamiento en el rango propio de un modelo de ~27B, condicionado por las capacidades del modelo base (no documentadas en esta card).
- Modo de pensamiento configurable: soporte de `enable_thinking` (activar o desactivar razonamiento explicito) y `reasoning_effort` para modular la profundidad del mismo.
- Tool calling / function calling conforme a los esquemas de Qwen, segun indica la model card.
- Razonamiento multi-paso y uso en flujos de agente, derivado del soporte de tooling y thinking.
- Eficiencia de tokens en razonamiento: la plantilla Sharp reduce el relleno y los tokens de pensamiento antes de llegar a la respuesta.
- Orientacion declarada a codigo y trabajo de conocimiento (coding y knowledge work).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso

- Edicion y generacion de codigo en local sobre Apple Silicon: el modelo cabe en equipos con memoria unificada de 24-32 GB gracias a los 16,22 GB de pesos 4-bit, y la plantilla Sharp esta optimizada para tareas de codigo, por lo que se puede usar como asistente de programacion sin depender de API externa.
- Agentes de codigo con tool calling: el soporte de esquemas de function calling de Qwen y de razonamiento multi-paso permite construir agentes que invocan herramientas (ejecutar tests, consultar repositorios, lanzar comandos) con la plantilla ya configurada en el tokenizer.
- Pipelines de resolucion de problemas tecnicos: la reduccion de tokens de pensamiento de la plantilla Sharp esta pensada para llegar antes a la solucion en tareas tipo SWE-bench, lo que reduce latencia y coste por consulta en entornos de integracion continua.
- Prototipado y evaluacion de modelos en estaciones de trabajo Mac: al estar en formato MLX nativo, se puede cargar con `mlx_lm` en pocas lineas y comparar variantes de plantilla (Sharp frente a otras) sin reentrenar nada.
- Asistencia tecnica interna con contexto de documentacion: un modelo de 27B con plantilla de chat compatible con transformers, vLLM y llama.cpp puede desplegarse en un servidor interno para responder consultas sobre documentacion propia, siempre que se verifique la ventana de contexto del modelo base.
- Investigacion sobre eficiencia de tokens: la variante Sharp es un objeto de estudio util para medir el impacto de la plantilla de chat en el numero de tokens de razonamiento y en la tasa de acierto, comparandola con la plantilla original del modelo base.
- Despliegue mixto Mac/servidor: como la plantilla esta embebida tanto en `chat_template.jinja` como en `tokenizer_config.json`, el mismo tokenizer puede reutilizarse en un backend vLLM o llama.cpp con pesos convertidos, manteniendo comportamiento conversacional consistente entre entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la plantilla Sharp se ha demostrado en SWE-bench y ClawEval, pero no incluye cifras concretas ni comparaciones numericas, por lo que no se reproducen datos.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos cuantizados ocupan 16,22 GB; con overhead de KV cache y activaciones, un equipo con 24 GB de memoria unificada es el minimo razonable y 32 GB o mas es lo recomendable para contextos largos.
- GPU recomendadas: no aplica de forma nativa, ya que el formato es MLX y esta pensado para Apple Silicon (series M1 a M4 con memoria unificada suficiente). Para GPU NVIDIA seria necesario convertir los pesos a otro formato.
- Compatibilidad con consumer GPU: no en formato MLX; en Apple Silicon, si, en equipos con 24-32 GB de memoria unificada (por ejemplo MacBook Pro M-series con esa configuracion).
- Opciones de despliegue: `mlx_lm` es la via nativa documentada en la model card. La plantilla se declara compatible con transformers, MLX, vLLM y llama.cpp, pero los pesos de este repositorio solo sirven para MLX; para vLLM o llama.cpp habria que usar los pesos del modelo base o generar conversiones propias.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| blackfan23/sabi-noema-sharp | ~27,36B | no disponible | 4-bit affine MLX (group 64) | Apache 2.0 | HuggingFace, formato MLX |
| sabicap/sabi-noema (base) | no disponible en la informacion | no disponible | pesos originales (presumiblemente sin cuantizar) | no disponible en la informacion | HuggingFace |
| Modelos Qwen de ~27B (familia referenciada por el tag `qwen3_5`) | no disponible en la informacion | no disponible | multiples | no disponible en la informacion | HuggingFace |

La comparacion cuantitativa con alternativas de la misma categoria no es posible con los datos disponibles: no se conocen benchmarks del modelo base ni especificaciones de contexto, y la unica diferencia documentada frente al base es la cuantizacion MLX 4-bit y la plantilla Sharp.

## Limitaciones y advertencias

- La model card no documenta sesgos, composicion del dataset ni procesos de alineacion del modelo base, por lo que no se puede evaluar el riesgo de sesgo con la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos de esta escala; no hay evaluaciones publicadas en esta card que lo cuantifiquen.
- La plantilla Sharp reduce tokens de razonamiento: en tareas que requieren cadenas de pensamiento largas, conviene subir `reasoning_effort` o reactivar `enable_thinking` y validar que no se degrada la precision.
- Solo hay pesos en formato MLX; no se incluyen GGUF ni safetensors en formato transformers estandar, lo que limita el despliegue a Apple Silicon salvo conversion manual.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingue sin verificar el modelo base.
- Longitud de contexto no declarada: no se debe asumir una ventana concreta en produccion sin comprobarla en el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base `sabicap/sabi-noema` deben verificarse por separado, ya que esta ficha no las documenta.
- Repositorio con muy poca traccion (32 descargas, 0 likes) y sin pipeline declarado: no hay senales de validacion por parte de la comunidad.
- La fecha de creacion del repositorio (2026-10-25) figura en los metadatos; conviene contrastarla con la del modelo base antes de fijar una version en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/blackfan23/sabi-noema-sharp
- Modelo base: https://huggingface.co/sabicap/sabi-noema
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Referencia de rebase froggeric v22.5: no disponible como enlace directo en la informacion proporcionada
- Papers, blogs, repos de codigo o demos adicionales: no disponibles en la informacion proporcionada
