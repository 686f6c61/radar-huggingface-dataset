# rahulrachuri/ternary-bonsai-2-27b-coreai

## Resumen

Ternary Bonsai 2 27B — Core AI es una exportación al formato Core AI de Apple del modelo Bonsai 2 27B, la compilación ternaria que PrismML publicó a partir de Qwen3.8-27B. El repositorio lo mantiene el usuario rahulrachuri y contiene un grafo portable `.aimodel` (con funciones de prefill de 64 y 16 tokens y decodificación de un solo token), una compilación anticipada (AOT) `h16s` específica para el M4 Pro, el tokenizador y la plantilla de chat de Qwen, metadatos del bundle y un fichero `SHA256SUMS`. El objetivo es ejecutar el modelo en un Mac con Apple silicon mediante el host nativo `bonsai-swift`, sin Python en el bucle de generación.

El modelo resuelve un problema muy concreto: llevar un modelo de ~27 000 millones de parámetros en pesos ternarios a un portátil Apple silicon con un consumo de memoria modesto (unos 7,5 GB residentes medidos en un M4 Pro) y sin depender de frameworks de inferencia en Python. La cuantización declarada es ternaria group-128 PQ2_0 con transformadas de Walsh-Hadamard por bloques con signo, y el contexto exportado está limitado a 4 096 tokens. El repositorio ocupa 14,5 GB.

Es relevante ahora porque documenta un flujo de exportación y validación reproducible hacia Core AI, con verificación "teacher-forced" contra decodificaciones greedy de referencia del runtime MLX de PrismML: 80/80 tokens de continuación idénticos en una batería de diez prompts que cubre 4 405 posiciones. Se publicó el 20 de septiembre de 2026 y, en el momento de redactar esta ficha, no tiene descargas ni likes registrados, por lo que se trata de un artefacto reciente y sin validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; derivada de Qwen3.8-27B. El contrato del bundle expone `keyCache`, `valueCache`, `convState` y `recState`, lo que indica estado adicional (convolucional/recurrente) mas alla de la cache KV estandar |
| Parametros totales | 27 000 millones (segun la denominacion del modelo; no se desglosa en la informacion disponible) |
| Parametros activos | No aplica / no disponible |
| Longitud de contexto | 4 096 tokens (limite exportado). El host asigna una capacidad KV entre el minimo trazado de 2 048 y ese limite |
| Tipos de cuantizacion | Ternaria group-128 PQ2_0 con transformadas de Walsh-Hadamard por bloques con signo |
| Idiomas soportados | No disponible (la model card no lo declara; el tokenizador y la plantilla de chat provienen de Qwen/Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | Bundle Core AI (`.aimodel` portable) con compilacion AOT `h16s` para M4 Pro, tokenizador y plantilla de chat, metadatos y `SHA256SUMS`. No incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de la descripcion arquitectonica interna del modelo: la model card no detalla si se trata de un transformer denso, de una variante MoE o de una arquitectura hibrida. Si se sabe que el artefacto de pesos de origen es la construccion ternaria de PrismML sobre Qwen3.8-27B, referenciada como `Ternary-Bonsai-2-27B-PQ2_0.gguf` en la revision `6ed5e12bf84b7a63069882c91dd9e9218647d17b`. La compresion aplicada es ternaria con agrupacion de 128 elementos (group-128 PQ2_0) y transformadas de Walsh-Hadamard por bloques con signo. La plantilla de chat y el tokenizador proceden de Qwen/Qwen3.8-27B, revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset original ni sobre si hubo etapas de RLHF o DPO; esos datos corresponderian a Qwen3.8-27B y a la construccion ternaria de PrismML, no a esta exportacion. En cuanto a la innovacion tecnica de este repositorio, es fundamentalmente de despliegue: el grafo se exporto con `coreai-core 1.0.0b2` y la compilacion AOT para M4 Pro con `coreai-build-3600.82.1`. En lugar de decodificacion especulativa, el host usa un planificador de tres granularidades (64 tokens, 16 tokens y un token) tanto para validacion como para generacion, y la validacion se hizo forzando al modelo (`teacher forcing`) contra decodificaciones greedy de referencia del runtime MLX de PrismML. La generacion en `bonsai-swift` es greedy, sin muestreo.

## Capacidades

- Generacion de texto autoregresiva en un Mac con Apple silicon, con decodificacion greedy.
- Prefill por bloques de 64 y 16 tokens mas decodificacion de un solo token, lo que permite gestionar prompts largos de forma incremental.
- Continuacion de texto coherente con la plantilla de chat de Qwen, incluida la generacion de prosa, codigo, numeros y secuencias con saltos de linea.
- Cobertura de escrituras no latinas en las pruebas de validacion: CJK, escrituras mixtas, emoji y casos de estres con tokens repetidos (bateria de diez prompts sobre 4 405 posiciones).
- Razonamiento aritmetico basico: la validacion incluye un prompt de aritmetica del entrenamiento con 48 tokens nuevos generados de forma identica.
- Soporte de tool calling / function calling: no disponible; no se documenta en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se declara el conjunto de idiomas soportados.
- Capacidad especial de thinking mode, vision o audio: no disponible en esta exportacion. La model card indica explicitamente que la proyeccion de vision opcional de PrismML no esta incluida, por lo que el artefacto es solo texto.

## Casos de uso

- Asistente de texto totalmente local en macOS: al ejecutarse a traves de `bonsai-swift` sobre Core AI, sin Python en el bucle de generacion, el modelo permite construir funciones de autocompletado o redaccion asistida dentro de una aplicacion de escritorio sin enviar datos a servicios externos.
- Generacion de codigo en el propio portatil: con 4 096 tokens de contexto y 23,6 tokens/s de decodificacion en un M4 Pro, es viable para completar funciones cortas, explicar fragmentos o generar pruebas unitarias en un IDE local, siempre que el fichero quepa en la ventana de contexto.
- Procesamiento por lotes de documentos cortos: el prefill por bloques de 64 tokens alcanza 59 tokens/s, de modo que resumir, clasificar o extraer campos de correos, incidencias o notas breves es viable en lote en una sola maquina.
- Demo de investigacion sobre cuantizacion ternaria: el repositorio incluye la metodologia de validacion (`teacher forcing` contra referencia MLX, con tablas de coincidencia de posiciones `argmax`), lo que lo convierte en una base para estudiar el impacto de PQ2_0 group-128 en la calidad de las continuaciones.
- Pipeline de exportacion a Core AI: sirve como referencia practica para producir bundles `.aimodel` con funciones de prefill de 16 y 64 tokens, cache KV y estados adicionales, y para compilar AOT en arquitecturas Apple silicon distintas del M4 Pro.
- Chat de baja latencia con prompts moderados: con 48 tokens/s de extremo a extremo para un prompt de 114 tokens y memoria residente estable en torno a 7,5 GB, encaja en asistentes conversacionales de turnos cortos donde no se necesita contexto largo.
- Inferencia con restricciones de privacidad o de conectividad: entornos de laboratorio, sanidad o defensa en los que el modelo no puede salir del equipo y donde un footprint de disco de 14,5 GB es asumible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Lo que si publica la model card son datos de validacion numerica y de rendimiento medidos en un M4 Pro con macOS 27.0 build `26A428`, Xcode 27.0 build `27A5237l` y Apple Swift 6.4:

| Prompt de referencia | Prefill | Posiciones argmax coincidentes | Continuacion |
|---|---|---:|---|
| "The capital of France is", 24 nuevos | 16+16+16, 9 walked | 77/80 | 24/24 identicas |
| Aritmetica de entrenamiento, 48 nuevos | 64+16, 3 walked | 127/130 | 48/48 identicas |
| Pasaje del faro, 40 nuevos | 64+16+16+16, 13 walked | 161/164 | 40/40 identicas |
| Pasaje del faro, walk con prompt S=1 | walk | 161/164 | 40/40 identicas |

Las tres discrepancias de posicion se localizan dentro del system prompt de la plantilla de chat, donde la referencia MLX presenta margenes fp16 entre el primer y el segundo candidato de 0,002 a 0,024. El `argmax` proporcionado por el grafo y el calculado por el host coincidieron en los 134 pasos de fixture recorridos. Una bateria independiente de diez prompts cubrio 4 405 posiciones (prosa, codigo, numeros, saltos de linea, CJK, escrituras mixtas, emoji y casos de estres con tokens repetidos): el prefill por bloques y el walk con S=1 coincidieron en 4 347 posiciones y produjeron 80/80 tokens de continuacion identicos. Cada caso se ejecuto en un proceso nuevo y la memoria residente se mantuvo cerca de 7,5 GB sin crecimiento adicional de swap.

| Carga de trabajo (M4 Pro, build release, sin Python) | Resultado |
|---|---:|
| Decodificacion | 23,6 tokens/s |
| Prompt de 114 tokens, extremo a extremo | 48 tokens/s |
| Chunk de prefill S=64 | 59 tokens/s |
| Walk de prompt S=1 | 23,6 tokens/s |

## Requisitos de hardware

- Plataforma: Mac con Apple silicon, macOS 27, toolchain de Xcode 27 y Swift 6.4 o superior. No hay soporte declarado para CUDA, ROCm ni otras plataformas.
- Disco: aproximadamente 14 GB de espacio libre (el repositorio ocupa 14,5 GB).
- Memoria: alrededor de 7,5 GB residentes medidos en un M4 Pro durante la validacion, sin crecimiento adicional de swap.
- Acelerador: el asset AOT incluido (`h16s`) es especifico del M4 Pro; otras arquitecturas Apple silicon requieren generar una compilacion AOT propia a partir del `.aimodel` portable incluido.
- VRAM estimada: no aplica en el sentido convencional; el modelo no se ejecuta en GPU discreta y la restriccion practica es la memoria unificada del Mac.
- GPU recomendadas: M4 Pro (medido). Para otros SoC de Apple silicon no hay cifras publicadas.
- Cabe en GPU de consumo: si, en el sentido de que cabe en un Mac con Apple silicon y memoria unificada suficiente; no hay datos publicados para GPUs NVIDIA o AMD.
- Opciones de despliegue: host nativo `bonsai-swift` (build release) con `--bundle` o la variable `BONSAI_BUNDLE`. Los servidores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama) no son aplicables a este bundle Core AI; para el modelo base en GGUF habria que acudir al repositorio de PrismML.
- Latencia y throughput: 23,6 tokens/s en decodificacion, 48 tokens/s de extremo a extremo con un prompt de 114 tokens y 59 tokens/s en chunks de prefill de 64 tokens, todo medido en un M4 Pro. La latencia en milisegundos por peticion no esta publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Runtime / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 27B — Core AI (este repositorio) | 27 000 millones (denominacion) | 4 096 tokens exportados | Core AI `.aimodel` + AOT `h16s`, host `bonsai-swift` | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| prism-ml/Ternary-Bonsai-2-27B-gguf (origen) | 27 000 millones (denominacion) | No disponible | GGUF ternario PQ2_0, runtime MLX de PrismML | Apache 2.0 (heredada) | HuggingFace, repositorio de origen del que se exporto este bundle |
| Qwen/Qwen3.8-27B (modelo base de pesos y tokenizador) | 27 000 millones (denominacion) | No disponible | Pesos en safetensors y frameworks estandar | Apache 2.0 | HuggingFace, revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |

No hay datos de benchmarks comparativos entre estos tres artefactos en la informacion disponible, mas alla de la equivalencia de continuaciones greedy reportada frente a la referencia MLX de PrismML.

## Limitaciones y advertencias

- Solo texto: la proyeccion de vision opcional de PrismML no esta incluida en esta exportacion.
- Contexto reducido: el limite exportado es de 4 096 tokens, con una capacidad KV del host entre 2 048 y ese limite. No es adecuado para tareas de contexto largo.
- Generacion greedy: `bonsai-swift` no aplica muestreo ni temperatura, lo que limita el uso creativo o la diversidad de respuestas.
- Portabilidad restringida: el asset AOT `h16s` solo funciona en M4 Pro; en otros chips Apple silicon hay que recompilar AOT desde el grafo portable, con el riesgo de reproducibilidad que ello implica.
- Dependencia de un toolchain muy reciente (macOS 27, Xcode 27, Swift 6.4) y de un host de terceros (`bonsai-swift`), que puede cambiar y romper el flujo documentado.
- Sin benchmarks estandar publicados, no es posible situar la calidad del modelo frente a alternativas en tareas como MMLU, HumanEval o GSM8K; los datos publicados son de equivalencia numerica con la referencia MLX y de rendimiento, no de capacidad.
- Riesgo de alucinacion: no se documenta. Se trata de un modelo derivado de Qwen3.8-27B comprimido a ternario, y la cuantizacion agresiva puede degradar la fidelidad en tareas de conocimiento factual, aunque no hay mediciones publicadas al respecto.
- Sesgos: no disponibles; la model card no incluye evaluacion de sesgos ni de seguridad.
- Idiomas: no declarados. Aunque el tokenizador procede de Qwen, no hay confirmacion de cobertura multilingue real en esta cuantizacion.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y publicacion reciente (20 de septiembre de 2026). Conviene tratarlo como artefacto experimental.
- Licencia: Apache 2.0 permite uso comercial, pero el artefacto hereda las condiciones de las fuentes de PrismML y Qwen; el repositorio incluye un fichero `NOTICE` con la atribucion que debe conservarse.
- Requisitos de integracion: el host no descarga artefactos de forma implicita; la aplicacion debe proporcionar la ruta del bundle mediante `--bundle` o `BONSAI_BUNDLE`.
- Consumo de disco elevado (14,5 GB) para un modelo pensado para ejecucion local en portatil.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rahulrachuri/ternary-bonsai-2-27b-coreai
- Modelo de origen (ternario GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base de pesos y tokenizador: https://huggingface.co/Qwen/Qwen3.8-27B
- Host de inferencia `bonsai-swift`: https://github.com/RahulRachuri/bonsai-swift
- Core AI model zoo (fuente de conversion y validacion, commit `c9e9e6b`): https://github.com/john-rocky/coreai-model-zoo
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las referencias devueltas corresponden a un restaurante de cocina italiana en Singapur y no guardan relacion con el artefacto.
