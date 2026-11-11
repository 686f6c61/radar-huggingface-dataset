# qda-lab/QDA-Qwen3-Coder-30B-A3B-W4A16

## Resumen

QDA-Qwen3-Coder-30B-A3B-W4A16 es una cuantizacion de solo pesos (weight-only) del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct, publicada por el laboratorio qda-lab bajo licencia Apache 2.0. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) de la familia Qwen3, especializado en generacion de codigo y tareas de agente, con 30.532.122.624 parametros totales y una arquitectura qwen3_moe. Esta version reduce el peso de los pesos a 4 bits y 8 bits enteros manteniendo las activaciones en 16 bits, lo que disminuye de forma notable el espacio en disco (17,8 GB en el repositorio) y los requisitos de memoria para inferencia.

La relevancia de esta ficha radica en que permite ejecutar un modelo de codigo de 30B con arquitectura MoE en infraestructura mas modesta que la version en bf16, manteniendo el formato compressed-tensors, compatible con motores de inferencia como vLLM. No obstante, se trata de una publicacion preliminar (pre-release): el autor indica que la evaluacion esta pendiente y que la version completa con resultados de evaluacion esta prevista para el 20 de noviembre de 2026. Por tanto, no hay datos de benchmarks verificados en la informacion disponible.

Al derivar directamente del modelo base de Qwen, hereda sus capacidades de generacion de codigo, razonamiento multi-paso y tool calling, pero cualquier afirmacion sobre su rendimiento tras la cuantizacion debe tratarse con cautela hasta que se publiquen las evaluaciones anunciadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_moe) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos a 4 bits enteros asimetricos en grupos de 64; pesos a 8 bits enteros simetricos en grupos de 64; activaciones en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de solo pesos del checkpoint Qwen/Qwen3-Coder-30B-A3B-Instruct. La arquitectura subyacente es un transformer con capas Mixture-of-Experts (identificador qwen3_moe), con 30.532.122.624 parametros totales. La cuantizacion aplicada es W4A16: los pesos se almacenan en 4 bits enteros con esquema asimetrico en grupos de 64, y adicionalmente en 8 bits enteros con esquema simetrico en grupos de 64, mientras que las activaciones permanecen en 16 bits. El resultado se guarda en el formato compressed-tensors, que permite su carga en motores compatibles con esta libreria.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion, ya que la model card de esta cuantizacion no detalla esos aspectos. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio esquema de cuantizacion. El autor indica que la evaluacion esta pendiente y que la version completa con resultados se publicara el 20 de noviembre de 2026.

## Capacidades

- Generacion de texto y codigo: hereda del modelo base Qwen3-Coder-30B-A3B-Instruct la capacidad de generar codigo en multiples lenguajes y completar tareas de programacion.
- Razonamiento multi-paso: el modelo base esta orientado a tareas de agente y razonamiento encadenado.
- Tool calling / function calling: el modelo base Qwen3-Coder soporta integracion con herramientas; esta capacidad se hereda, aunque no se verifica de forma independiente en esta cuantizacion.
- Soporte de agentes: el modelo base esta disenado para flujos de agente y ejecucion de tareas multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada para esta cuantizacion.

## Casos de uso

- Asistencia de programacion en IDE: el modelo puede integrarse en extensiones de editor para autocompletado y generacion de funciones, aprovechando su especializacion en codigo y su tamano de 30B con arquitectura MoE.
- Generacion de codigo en pipelines de CI/CD: puede usarse para generar tests, parches o documentacion tecnica de forma automatizada, con la ventaja de que la cuantizacion W4A16 reduce los requisitos de memoria frente al checkpoint en bf16.
- Agentes autonomas de resolucion de tareas: el modelo base soporta tool calling y razonamiento multi-paso, lo que permite construir agentes que consulten APIs, ejecuten comandos y verifiquen resultados.
- Migracion y refactorizacion de codigo: puede emplearse para transformar fragmentos de codigo entre lenguajes o frameworks, tarea habitual en equipos de ingenieria.
- Despliegue en infraestructura con GPU de memoria limitada: al ocupar 17,8 GB en disco y usar pesos de 4 y 8 bits, es viable en GPUs consumer de gama alta o en nodos con menos VRAM que los necesarios para el modelo completo.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que quieran medir el impacto de W4A16 en un modelo de codigo MoE, una vez se publiquen las evaluaciones anunciadas.
- Generacion de documentacion tecnica y explicaciones de codigo: el modelo puede resumir repositorios y explicar funciones, aprovechando su entrenamiento orientado a codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta pendiente y que la version completa con resultados se publicara el 20 de noviembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 17,8 GB en disco; la VRAM necesaria para cargar los pesos cuantizados sera del orden de esa cifra mas el overhead de activaciones y cache KV, aunque no se proporciona una estimacion oficial.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU consumer: no confirmada oficialmente; por el tamano del checkpoint (17,8 GB) podria caber en GPUs consumer con 24 GB de VRAM, pero no hay datos que lo verifiquen.
- Opciones de despliegue: el formato compressed-tensors es compatible con motores como vLLM; no se documentan otras opciones (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Qwen3-Coder-30B-A3B-W4A16 | 30.532.122.624 | no disponible | W4A16 (4/8 bits, grupos de 64) | Apache 2.0 | Hugging Face (pre-release) |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | no disponible | no disponible | bf16 (original) | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado para esta cuantizacion, ya que las evaluaciones estan pendientes de publicacion.

## Limitaciones y advertencias

- Publicacion preliminar: el autor indica que la evaluacion esta pendiente; no hay resultados que confirmen la calidad del modelo tras la cuantizacion.
- Posible degradacion por cuantizacion: la reduccion a 4 y 8 bits puede afectar a la precision en tareas de codigo y razonamiento, aunque no se han publicado mediciones.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documenta una evaluacion especifica para esta cuantizacion.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el texto de la licencia incluido en el repositorio, copiado del modelo base.
- Compatibilidad: el formato compressed-tensors requiere motores de inferencia compatibles; no se garantiza su funcionamiento en todas las herramientas.
- Fecha de creacion y actualizacion del repositorio: 11 de noviembre de 2026, con version completa prevista para el 20 de noviembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3-Coder-30B-A3B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
