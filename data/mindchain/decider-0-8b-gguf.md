# mindchain/decider-0.8b-GGUF

## Resumen

decider-0.8b-GGUF es la cuantizacion Q4_K_M del modelo Mapika/decider-0.8b, un modelo de decision de ~752 millones de parametros derivado de Qwen3.5-0.8B-Base y publicado bajo licencia Apache-2.0. El repositorio lo mantiene el usuario mindchain y su proposito es ofrecer el eslabon mas pequeno de la familia decider: un cabezal de decision calibrada pensado para ejecutarse en telefonos, mini-PC y GPUs antiguas, con un fichero de apenas 529.297.440 bytes (~505 MB).

A diferencia de un modelo conversacional al uso, decider-0.8b no genera texto libre: recibe un estado de contexto y una pregunta con opciones etiquetadas (A, B, C...) y devuelve una distribucion de probabilidad sobre esas opciones en un unico forward pass. La familia se enmarca en lo que el autor denomina stack JEV ("system-one", decision rapida) y su objetivo es producir probabilidades calibradas, es decir, que la confianza declarada se corresponda con la frecuencia real de acierto.

Su relevancia actual es doble. Por un lado, ocupa el nivel Tier-0/1 de la familia decider para despliegue en edge y Android, donde el hermano mayor decider-4b v2 ya alcanza un error de calibracion (ECE) de 0.037 frente al 0.033 del modelo profesor. Por otro, la model card documenta un problema serio de toolchain: las builds recientes de llama.cpp master generan GGUF `qwen3_5_text` con metadatos y pesos incorrectos, por lo que es imprescindible fijar el commit de conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; derivada de Qwen3.5-0.8B-Base. La metadata del GGUF referencia `block_count` 33 y `recurrent_layers`, lo que apunta a una estructura hibrida, sin confirmacion explicita del autor |
| Parametros totales | 752.393.024 (segun safetensors del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico quant publicado en este repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

Datos adicionales de la publicacion:

| Parametro | Valor |
|---|---|
| Repo | mindchain/decider-0.8b-GGUF |
| Modelo base | Mapika/decider-0.8b |
| Revision del base | `a0a01d6f8135298f400a8c856b355793012ae971` (commit fijado, sin tags de release) |
| Tamano del fichero | 529.297.440 bytes (~505 MB) |
| sha256 | `aa40eca91f41e475b7c20a10af4247e8ae5b623f386b5c24501971909199496b` |
| Tamano del repo | 0.5 GB |
| Toolchain de conversion | llama.cpp commit `9575389` + `--no-mtp` + paso intermedio en bf16 |
| Temperatura de lectura | 1.03 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento: la model card no detalla numero de tokens, composicion del dataset ni si hubo fases de RLHF, DPO u optimizacion similar. Lo unico confirmado es que el modelo parte de Qwen3.5-0.8B-Base (licencia Apache-2.0) y que el autor lo presenta como un cabezal de decision ("head") dentro de la familia decider, no como un modelo generativo general.

El rasgo tecnico mas distintivo no es la arquitectura en si, sino el modo de inferencia. El prompt debe seguir el formato upstream `Context:\n{state}\n\nQuestion: {q}\nOptions:\n(A) ...\n(B) ...\nAnswer: (`; despues se leen los logits correspondientes a las letras de las opciones, se dividen por la temperatura de lectura 1.03 y se renormalizan para obtener probabilidades que sumen 1. Ese valor de temperatura es el estandar de la familia y difiere del usado en decider-4b v2 (1.935), lo que subraya que cada tamano requiere su propia calibracion.

La innovacion declarada es la calibracion: el modelo busca probabilidades fiables en un solo forward pass, sin muestreo ni cadenas de razonamiento. El autor indica que cada decision se verifica contra el readout original en bf16 antes de pasar a produccion y que el repositorio incluye un `provenance.json` con fuente, commit, sha256 y toolchain. Como referencia de la familia (no de este modelo concreto), decider-4b v2 reporta un ECE de 0.037 frente al 0.033 del profesor.

## Capacidades

- Clasificacion de decisiones con opciones multiples: dado un contexto y un conjunto de alternativas etiquetadas, devuelve una distribucion de probabilidad sobre ellas en un unico forward pass.
- Salida calibrada: las probabilidades estan pensadas para ser interpretables como confianza real, no solo como ranking.
- Inferencia de baja latencia: al no requerir generacion autoregresiva de texto, el coste por decision es el de un solo paso hacia delante.
- Ejecucion en edge: tamano de ~505 MB en Q4_K_M, compatible con llama.cpp en Android, mini-PC y GPUs antiguas.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, orientada a despliegue como servicio.
- Naturaleza "system-one": el modelo esta disenado para decisiones rapidas e intuitivas, en contraposicion a pipelines de razonamiento multi-paso.
- Generacion de texto libre: no documentada; el formato de prompt y la lectura de logits sugieren un uso restringido a seleccion entre opciones.
- Tool calling / function calling: no disponible.
- Capacidades de agente o multi-step reasoning: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Soporte multilingue: no disponible.

## Casos de uso

- Clasificacion de intenciones en asistentes de voz para movil: el modelo recibe el estado de la conversacion y una lista cerrada de intenciones y devuelve la probabilidad de cada una en un solo forward pass, con un coste de computo compatible con un telefono de gama media.
- Enrutado de peticiones en un backend de LLM: dado un prompt de usuario y un catalogo de modelos o herramientas disponibles, decider-0.8b puede actuar como router de Tier-0/1 y derivar solo los casos ambiguos al modelo grande.
- Moderacion o triaje de contenido en el dispositivo: clasificar texto entrante en categorias predefinidas antes de enviarlo a un servidor, reduciendo trafico y preservando privacidad, gracias a los ~505 MB del quant Q4_K_M.
- A/B testing y experimentacion con decisiones calibradas: al devolver probabilidades, permite umbralizar decisiones y medir de forma directa si la confianza del modelo se corresponde con la tasa real de acierto.
- Automatizacion de formularios y validacion de respuestas: comprobar si una respuesta de usuario encaja en una de las opciones validas de un campo, con probabilidad asociada para decidir si se acepta o se pide aclaracion.
- Sistemas embebidos y robotica ligera: tomar decisiones discretas (avanzar, girar, detenerse) a partir de un estado textual o estructurado, sin depender de conectividad a la nube.
- Juguetes educativos y dispositivos de bajo coste: al caber en un Nano-PC o una GPU antigua, permite anadir decision calibrada local a dispositivos sin acelerador dedicado.
- Filtrado previo en pipelines de anotacion: preetiquetar ejemplos con probabilidad de pertenencia a cada clase y reservar la revision humana para los casos de baja confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas equivalentes para decider-0.8b. El unico dato cuantitativo de rendimiento corresponde a un modelo distinto de la misma familia, decider-4b v2, y se reproduce a continuacion unicamente como contexto:

| Modelo | Metrica | Valor |
|---|---|---|
| decider-4b v2 | ECE (error de calibracion esperado) | 0.037 |
| Profesor de la familia decider | ECE | 0.033 |
| decider-0.8b | ECE | No disponible (pendiente en la pipeline de medicion del autor) |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 600-800 MB con Q4_K_M, incluyendo overhead de contexto y buffers de llama.cpp. El fichero de pesos ocupa 529.297.440 bytes.
- Ejecucion en CPU: viable en telefonos Android modernos, Raspberry Pi de gama alta y mini-PC con CPU x86 recientes, usando llama.cpp con backend CPU.
- GPU consumer: cabe holgadamente en cualquier GPU con 2 GB o mas de VRAM, incluidas GTX 1050/1650, MX150, RTX 3050 y superiores. Es un candidato claro para GPUs integradas y equipos antiguos.
- GPU de datacenter: A100, H100, L40S y similares son sobredimensionadas para un solo modelo; solo tendrian sentido con batching agresivo o multiples instancias por GPU.
- Opciones de despliegue: llama.cpp (toolchain de referencia), servidores compatibles con endpoints GGUF y, por el momento, cualquier runtime que respete la metadata correcta del GGUF. No hay confirmacion de soporte en vLLM, TGI u Ollama.
- Restriccion critica de toolchain: hay que usar llama.cpp en el commit `9575389` (o uno equivalente) con `--no-mtp`. Las builds de master posteriores (por ejemplo `e351231`, septiembre de 2026) producen GGUF `qwen3_5_text` con `block_count` 33, `recurrent_layers[33]` y un `nextn` fantasma, ademas de pesos desplazados: el modelo carga pero la salida es basura.
- Latencia y throughput: no disponibles. Al tratarse de un unico forward pass sobre ~752 M de parametros en Q4_K_M, la latencia esperada es de milisegundos en GPU consumer y de decenas a pocos cientos de milisegundos en CPU de movil, pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metrica de calibracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-0.8b (este) | 752.393.024 | No disponible | No disponible | Apache-2.0 | GGUF Q4_K_M en HuggingFace |
| decider-4b v2 | No disponible | No disponible | ECE 0.037 | No disponible en la informacion | Version mayor de la misma familia |
| Qwen3.5-0.8B-Base | 752.393.024 (heredados) | No disponible | No aplica (modelo base generativo) | Apache-2.0 | Modelo base del que deriva este |
| Profesor de la familia decider | No disponible | No disponible | ECE 0.033 | No disponible | Referencia interna del autor |

No se dispone de informacion sobre modelos de decision calibrada de terceros con los que establecer una comparacion directa. La comparativa se limita, por tanto, a los integrantes de la propia familia decider y al modelo base Qwen3.5-0.8B.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni de calibracion para este 0.8b; la unica cifra disponible pertenece a decider-4b v2.
- Metrica pendiente: el autor situa explicitamente este modelo como "el siguiente en la pipeline de medicion", lo que implica que su ECE aun no ha sido validado publicamente.
- Toolchain fragil: usar una version incorrecta de llama.cpp produce salidas corruptas sin aviso claro en la carga. Es imprescindible fijar el commit y verificar el sha256 del fichero.
- Formato de prompt rigido: el modelo espera el layout exacto con `Context:`, `Question:`, `Options:` y `Answer: (`. Desviarse de el o leer los logits sin renormar por la temperatura 1.03 invalida la calibracion.
- Temperatura de lectura especifica: 1.03 para este modelo frente a 1.935 en decider-4b v2; reutilizar la constante del modelo grande en el pequeno degrada las probabilidades.
- Ambito funcional limitado: no hay evidencia de generacion de texto libre, tool calling, agentes, vision, audio ni capacidades multilingues.
- Idiomas soportados no declarados: aunque el modelo base Qwen3.5 suele ser multilingue, no hay confirmacion para este cabezal de decision.
- Sesgos: no documentados. Al no publicarse la composicion del dataset de ajuste, no es posible evaluar sesgos de dominio, genero, idioma o cultura.
- Riesgo de alucinacion: relevante en el sentido de que el modelo siempre devolvera una distribucion sobre las opciones ofrecidas, aunque ninguna sea adecuada; es responsabilidad del integrador anadir opciones de rechazo o umbrales de confianza.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Uso comercial: la licencia Apache-2.0 del modelo base y de este quant es permisiva, pero conviene revisar la licencia del modelo base original por si el autor del decider anadio condiciones adicionales no reflejadas en la informacion disponible.
- Ausencia de `provenance.json` verificable desde la informacion proporcionada: la model card lo menciona, pero no se ha podido comprobar su contenido.
- Fecha de publicacion inusual (2026-09-25) y actualizacion el mismo dia: no hay historial de versiones ni tags de release.

## Enlaces

- Repositorio HuggingFace del quant: https://huggingface.co/mindchain/decider-0.8b-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-0.8b
- Revision fijada del base: `a0a01d6f8135298f400a8c856b355793012ae971`
- Paper, blog o repositorio adicionales: no disponibles. Las busquedas web realizadas no devolvieron resultados tecnicos relevantes sobre este modelo ni sobre la familia decider.
