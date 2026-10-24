# sergolsub/mlx-mammoth-v1-27B

## Resumen

`sergolsub/mlx-mammoth-v1-27B` es una conversión a 8 bits en formato MLX de los pesos originales de `baselabs/mammoth-1`, publicada por el usuario sergolsub. No se trata de un modelo entrenado desde cero ni de un fine-tune: la propia model card indica que la conversión se limita a la cuantización a 8 bits para MLX, sin reentrenamiento y sin cambios de arquitectura, por lo que hereda las capacidades y limitaciones del modelo base (aproximadamente 27 000 millones de parámetros, segun el nombre del repositorio).

Su relevancia es practica: permite ejecutar un modelo de escala 27B en Apple Silicon mediante `mlx_lm`, algo que la version en precision completa no permite en equipos de memoria unificada moderada. La licencia MIT del repositorio original se mantiene, lo que facilita su uso comercial.

La informacion disponible es minima: no hay pipeline declarado, no se documentan idiomas, longitud de contexto, composicion del dataset ni resultados de benchmarks, y el repositorio no registra descargas ni likes en el momento de la consulta. Cualquier evaluacion de calidad debe hacerse contra el modelo base y con validacion propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card indica que la conversion no altera la arquitectura del modelo base; pesos en safetensors compatibles con transformers/MLX) |
| Parametros totales | ~27 000 millones (deducido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MLX (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de los pesos originales; prevalece la licencia del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors en layout MLX, 8 bits, acompanados de `config.json`, `tokenizer*`, `chat_template.jinja` |
| Modelo base | `baselabs/mammoth-1` |
| Biblioteca | `mlx` / `mlx_lm` |
| Tipo de conversion | Cuantizacion 8-bit, sin reentrenamiento ni cambios de arquitectura |
| Ficheros adicionales | `*_mlx.py`, `decision_config.json`, `joint_config.json` (glue de inferencia para cabeza de decision/joint, presente "cuando el modelo tiene un modo decision") |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `baselabs/mammoth-1` en la documentacion proporcionada: ni tipo de bloque (transformer denso, MoE, hibrido), ni numero de capas, ni dimension oculta, ni mecanismo de atencion. Lo unico verificable es que el repositorio distribuya pesos en `safetensors` con el conjunto estandar de `transformers`/MLX y que la conversion a 8 bits no modifica la topologia.

Tampoco hay datos de entrenamiento: se desconoce el volumen de tokens, la composicion del corpus, si hubo fases de RLHF/DPO o si existe un modo de razonamiento explicito. La presencia de ficheros `decision_config.json` y `joint_config.json` sugiere que el modelo base podria incorporar una cabeza o modo de decision adicional, pero su funcionamiento no esta documentado y deberia contrastarse con el repositorio original antes de asumir esa capacidad en produccion.

## Capacidades

- Generacion de texto autoregresiva mediante `mlx_lm.generate`; el resto de capacidades depende integramente del modelo base, cuyas especificaciones no estan publicadas en la informacion disponible.
- Plantilla de chat incluida (`chat_template.jinja`), lo que permite formatear conversaciones multi-turno con el tokenizador del repositorio.
- Posible modo de decision/joint: los ficheros de glue de inferencia estan presentes, pero la funcionalidad no esta descrita ni verificada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Vision, audio o modalidades adicionales: no disponible.
- Ejecucion local en Apple Silicon con pesos de 8 bits, que reduce el requisito de memoria a aproximadamente un byte por parametro.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con `mlx_lm.load` y usarlo como asistente de texto sin conexion en un Mac con memoria unificada suficiente, evitando costes de API durante las fases de diseno de producto.
- Evaluacion de la degradacion por cuantizacion: comparar las respuestas del modelo 8-bit MLX con las del `baselabs/mammoth-1` original para medir la perdida de calidad antes de adoptar la version cuantizada en un pipeline real.
- Procesamiento por lotes de documentos en local: resumir, clasificar o extraer campos de ficheros de texto en un Mac Studio, manteniendo los datos fuera de servicios de terceros por requisitos de confidencialidad.
- Base para RAG offline: integrar el modelo como generador de un sistema de recuperacion sobre documentacion interna, con el indice vectorial y el modelo ejecutandose en la misma maquina.
- Servidor de inferencia interno: exponer el modelo con `mlx_lm.server` y una API compatible con OpenAI para que herramientas de desarrollo y scripts existentes lo consuman sin cambios de codigo.
- Experimentacion con adaptadores: entrenar adaptadores LoRA sobre la version MLX para dominios concretos (soporte tecnico, documentacion legal) y comparar el coste frente a un fine-tune completo del modelo base.
- Pruebas de integracion de la cabeza de decision: si se confirma que el modelo base tiene modo decision, validar los ficheros `decision_config.json` / `joint_config.json` en un entorno controlado antes de integrarlos en un flujo de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No consta ninguna evaluacion de MMLU, HumanEval, GSM8K ni de tareas multilingues, ni para esta conversion a 8 bits ni para el modelo base en la documentacion consultada.

## Requisitos de hardware

- Memoria: los pesos en 8 bits ocupan aproximadamente 27 GB (un byte por parametro para ~27B). Sumando cache KV y overhead del runtime, conviene disponer de 32-36 GB de memoria unificada libres; por debajo de 32 GB el modelo puede no cargar o requerir contextos muy cortos.
- Apple Silicon recomendado: M2 Max o M3 Max con 36 GB o mas; M2 Ultra / M3 Ultra con 64-128 GB para contextos largos o ejecucion concurrente. Mac Studio es el formato mas habitual para este perfil.
- GPU consumer: no aplicable de forma directa, ya que MLX solo se ejecuta en Apple Silicon. En una RTX 4090 (24 GB) no cabria en 8 bits sin cuantizacion adicional o offload.
- Aceleradores CUDA (A100, H100): el repositorio no proporciona pesos en formato para vLLM, TGI ni transformers+cuda; habria que reconvertir desde el modelo base.
- Opciones de despliegue: `mlx_lm` (script Python), `mlx_lm.server` para exponer una API, y entornos de escritorio con soporte MLX. Para llama.cpp, Ollama o vLLM seria necesaria una conversion a GGUF u otro formato no incluida en este repositorio.
- Latencia y throughput: no disponible. Al estar limitado por ancho de banda de memoria, el rendimiento esperado depende del chip concreto (Max frente a Ultra) y de la longitud de contexto; no hay mediciones publicadas para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| `sergolsub/mlx-mammoth-v1-27B` | ~27B (segun nombre) | no disponible | 8 bits MLX | MIT | Apple Silicon (MLX) |
| `baselabs/mammoth-1` (original) | ~27B (segun nombre) | no disponible | bf16/fp16 presumiblemente | MIT | transformers / CUDA |
| Otras alternativas de escala ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables de terceros con los que contrastar parametros, contexto o rendimiento. La unica comparacion posible es contra el propio modelo base, donde la diferencia se limita a la cuantizacion (menor huella de memoria a cambio de una posible perdida de precision no medida) y a la plataforma de ejecucion.

## Limitaciones y advertencias

- No hay ninguna evaluacion publicada del impacto de la cuantizacion a 8 bits sobre la calidad; la degradacion puede afectar especialmente a matematicas, codigo y razonamiento de varios pasos.
- Se desconocen idiomas soportados y longitud de contexto; no se debe asumir un soporte solido del castellano ni una ventana concreta sin probarlo.
- Dependencia de plataforma: los pesos estan en layout MLX y solo se ejecutan en Apple Silicon; no son directamente utilizables en CUDA, ROCm ni en la mayoria de servicios cloud de GPU.
- Los ficheros `decision_config.json` y `joint_config.json` no estan documentados; su presencia no garantiza que el modo decision funcione sin codigo adicional.
- Repositorio sin descargas ni likes y creado y actualizado en la misma marca temporal: no hay evidencia de uso comunitario ni de validacion independiente.
- Riesgo de alucinacion y sesgos: no documentados para este modelo; deben evaluarse con el mismo rigor que en el modelo base, ya que la cuantizacion no corrige ninguno de estos problemas.
- Licencia MIT permite uso comercial y modificacion, pero la model card establece que prevalece la licencia del repositorio upstream en caso de conflicto; conviene revisar el LICENSE de `baselabs/mammoth-1` antes de desplegar.
- No se declara pipeline ni tarea en HuggingFace, por lo que algunas herramientas de la plataforma pueden no detectar la libreria o la tarea correctamente.
- Al no haber tokenizador ni modelo entrenados por el autor de la conversion, cualquier incidencia de calidad debe reportarse contra el modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sergolsub/mlx-mammoth-v1-27B
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
