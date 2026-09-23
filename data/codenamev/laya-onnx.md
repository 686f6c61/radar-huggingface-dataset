# codenamev/laya-onnx

## Resumen

Laya ONNX es un paquete de exportaciones a formato ONNX de los tres checkpoints del modelo Laya, publicadas por el usuario codenamev para el ecosistema `ruby-laya`. Conviene subrayar que no es un modelo nuevo: se trata de una conversion de los pesos originales de Convai Innovations, y todo el merito de los pesos y del diseno corresponde a dicho autor. El repositorio ocupa 2,4 GB y contiene tres carpetas (`english/`, `multilingual/` y `typed-decisions/`) con el grafo ONNX, el tokenizer y varios ficheros de configuracion.

Laya se presenta como un motor de decision no autorregresivo, etiquetado como "System 1": en lugar de conversar, recibe un estado (texto, correo, ticket o documento JSON) junto con preguntas tipadas y devuelve respuestas tipadas acompanadas de probabilidades calibradas y puntuaciones de confianza, todo ello en un unico paso forward. Los encoders subyacentes son ModernBERT-large para los checkpoints en ingles y de decisiones tipadas, y mmBERT-base para el multilingue. Los tres checkpoints tienen una ventana de contexto de 512 y 1024 tokens segun la variante.

Es relevante ahora porque ofrece una alternativa abierta y ejecutable en local a los servicios propietarios del tipo TypeSafe Jev, y porque su formato ONNX permite integrarlo con cualquier runtime de ONNX, desde Ruby hasta Node.js o Python, sin depender de frameworks de inferencia de gran tamano. El autor declara una verificacion numerica frente a la implementacion original en PyTorch, con una desviacion de logits inferior a 2,5e-5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autorregresivo (ModernBERT-large o mmBERT-base) con cabeza de decision tipada y cabeza de accion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 (carpeta `english/`), 1024 (carpetas `multilingual/` y `typed-decisions/`) |
| Tipos de cuantizacion | Pesos almacenados en float16 en disco y convertidos a float32 dentro del grafo |
| Idiomas soportados | no disponible en los metadatos de HF; hay un checkpoint en ingles y otro multilingue basado en mmBERT-base |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (pesos float16), con tokenizer y ficheros JSON de configuracion (`rl_agent_config.json`, `onnx_config.json`) |
| Modelo base | convaiinnovations/laya (revision `1c5edc17a7acd8701df6fc341c0d179f1c62c982`) |
| Version de exportacion | `laya` 0.3.7 y PyTorch 2.14.0 |
| Entradas del grafo | `input_ids`, `attention_mask` (int64, `[batch, seq]`), `marker_pos`, `marker_mask` (int64 y bool, `[batch, markers]`) y `qtype` (int64, `[batch]`) |
| Salidas del grafo | `logits` `[batch, markers]`, `act_logits` `[batch, 2]` y `last_hidden_state` `[batch, seq, dim]` |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo ModernBERT-large (variantes en ingles y de decisiones tipadas) o mmBERT-base (variante multilingue), sobre el que se anaden dos cabezas: una cabeza de decision tipada que produce `logits` por marcador y una cabeza de accion que produce `act_logits`. El modelo es no autorregresivo y esta pensado para "System 1": dado un estado y un conjunto de preguntas tipadas, resuelve todas las decisiones en un solo paso forward, sin generacion token a token. El grafo ONNX tambien expone `last_hidden_state`, que se utiliza para construir listas cortas de embeddings.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; lo unico indicado sobre el proceso es que el autor original publica un fichero `rl_agent_config.json` con presupuestos de tokens y temperaturas. Como innovacion tecnica cabe destacar el propio enfoque de decision tipada con probabilidades calibradas y puntuaciones de confianza, frente al paradigma de los modelos conversacionales. La exportacion a ONNX respeta la construccion de secuencias, los buckets de temperatura y el redondeo del modelo original, y el autor afirma reproducir cada probabilidad, puntuacion, confianza y probabilidad de accion, con logits que coinciden dentro de 2,5e-5. El grafo admite que una pregunta con una sola opcion se rellene a dos marcadores (el segundo enmascarado) y que un lote de menos de ocho tokens se rellene hasta ese minimo, sin alterar la respuesta. ONNX Runtime poda el grafo para devolver solo las salidas solicitadas, por lo que pedir unicamente `logits` y `act_logits` no anade coste.

## Capacidades

- Decision tipada sobre estados arbitrarios (texto, correo, ticket o documento JSON) en un unico paso forward.
- Devolucion de respuestas tipadas: opciones seleccionadas, distribuciones de probabilidad, puntuaciones ordinales y probabilidades booleanas.
- Probabilidades calibradas y puntuaciones de confianza asociadas a cada decision.
- Cabeza de accion con dos salidas (`act_logits`), util para decidir entre actuar o no actuar.
- Exposicion de `last_hidden_state` para construir listas cortas de embeddings.
- Compatibilidad con el formato de cable de `POST /v1/systemone`, el mismo que usan `api.typesafe.ai` y los modelos `typesafe/jev-*` de OpenRouter.
- Variante multilingue (mmBERT-base) ademas de la variante en ingles.
- No es un modelo conversacional: no genera texto libre ni mantiene dialogos multi-turno como un chat.
- No se documentan en la informacion disponible capacidades de tool calling, uso de agentes, vision ni audio.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de un ticket, formular preguntas tipadas (categoria, urgencia, equipo destino) y obtener respuestas con probabilidad calibrada para automatizar la asignacion.
- Triaje de correo electronico: clasificar mensajes entrantes en una sola pasada y con puntuacion de confianza, aprovechando que no requiere generacion token a token.
- Validacion de documentos JSON: comprobar campos tipados y decidir si un registro cumple una politica, devolviendo probabilidades booleanas por condicion.
- Moderacion o filtrado de contenido: plantear preguntas booleanas sobre un texto y usar la probabilidad devuelta para fijar umbrales de decision en un pipeline.
- Automatizacion de decisiones en agentes: emplear la cabeza de accion (`act_logits`) para decidir si el sistema debe ejecutar una accion o abstenerse, integr andolo como paso previo a un agente mayor.
- Busqueda semantica ligera: usar `last_hidden_state` para generar listas cortas de candidatos por similitud antes de un reranking posterior.
- Despliegue en local o en el borde: al ejecutarse sobre ONNX Runtime, encaja en servicios con requisitos de privacidad donde los datos no pueden salir de la maquina.
- Sustitucion de APIs propietarias compatibles con Jev: al respetar el formato de cable `POST /v1/systemone`, permite migrar sin reescribir el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos aportados por el autor son de verificacion de la exportacion: coherencia con la implementacion original en PyTorch (misma construccion de secuencias, mismos buckets de temperatura y mismo redondeo) y concordancia de logits dentro de 2,5e-5, comprobada en CPU.

Las fuentes de busqueda mencionan cifras de latencia del orden de 21 ms para el modelo y de 33 ms para la variante multilingue, presentadas como caracteristica de Laya en general, no necesariamente como medicion de estas exportaciones ONNX concretas.

## Requisitos de hardware

- El repositorio completo ocupa 2,4 GB, correspondiente a los tres checkpoints con pesos float16.
- La verificacion de la exportacion se realizo en CPU, por lo que la inferencia es viable sin GPU.
- No se dispone de la cifra de parametros por checkpoint, de modo que no se puede dar una estimacion exacta de VRAM; al tratarse de pesos float16 convertidos a float32 en el grafo, la huella en memoria es reducida en comparacion con modelos generativos de gran tamano.
- No se especifican GPU recomendadas en la informacion disponible.
- Opciones de despliegue: cualquier runtime de ONNX, la gema `ruby-laya` (`gem install ruby-laya`), el servidor `navopw/laya-onnx` con endpoint `POST /v1/systemone` y la libreria `receptron/laya` para Node.js y TypeScript.
- Latencia estimada segun las fuentes de busqueda: en torno a 21-33 ms, sin especificar el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| codenamev/laya-onnx | Exportacion ONNX no autorregresiva | 512 / 1024 segun variante | apache-2.0 | HuggingFace (este repositorio) |
| convaiinnovations/laya | Modelo original en PyTorch | 512 / 1024 segun variante | apache-2.0 | HuggingFace |
| TypeSafe Jev | Servicio propietario de decisiones tipadas | no disponible | propietaria | API (`api.typesafe.ai`) y OpenRouter |
| Modelos conversacionales pequenos | Generacion autorregresiva | variable | variable | amplia |

La comparacion se limita a la categoria y licencia, ya que no se dispone de cifras de parametros ni de benchmarks en la informacion proporcionada. Frente a un modelo conversacional, la diferencia clave es que Laya no genera texto, sino que decide: no mantiene dialogos y no produce respuestas en lenguaje natural. Frente a TypeSafe Jev, la ventaja es su naturaleza abierta y su capacidad de ejecucion local.

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversion de los pesos de Convai Innovations, por lo que hereda cualquier limitacion del original.
- No es un modelo conversacional: no genera texto libre ni sostiene conversaciones multi-turno.
- Los idiomas soportados no estan declarados en los metadatos de HuggingFace; la cobertura real depende de los checkpoints originales.
- La ventana de contexto esta limitada a 512 tokens en la variante en ingles y a 1024 en las variantes multilingue y de decisiones tipadas.
- El grafo espera entradas con una forma concreta (preguntas de una sola opcion rellenadas a dos marcadores, lotes de menos de ocho tokens rellenados); un uso que ignore estas convenciones puede producir resultados incorrectos.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), por lo que no hay evidencia publica de rendimiento comparativo.
- El numero de descargas y de "likes" es cero en la fecha de consulta, lo que sugiere una adopcion temprana y poca validacion externa.
- Riesgo de sesgo y de alucinacion no cuantificado en la informacion disponible; las probabilidades calibradas deberian validarse en el dominio concreto antes de usarlas en produccion.
- La licencia apache-2.0 permite uso comercial, pero el credito de los pesos corresponde a Convai Innovations y conviene revisar los terminos del repositorio original.
- La fecha de creacion del repositorio indicada por HuggingFace es 2026-09-23, dato que conviene verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codenamev/laya-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio original de Laya: https://github.com/NandhaKishorM/laya
- Gema ruby-laya: https://github.com/codenamev/ruby-laya
- Script de exportacion: https://github.com/codenamev/ruby-laya/blob/main/tools/export_onnx.py
- Servidor ONNX (navopw/laya-onnx): https://github.com/navopw/laya-onnx/
- Cliente Node.js/TypeScript (receptron/laya): https://github.com/receptron/laya
- Otra exportacion ONNX (Mattepiu/laya-onnx): https://huggingface.co/Mattepiu/laya-onnx
- Analisis de Laya: https://brainfunctioncollapse.com/laya
- Sitio oficial de Laya: https://laya.convaiinnovations.com/
