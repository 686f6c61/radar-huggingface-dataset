# Quicksort-fr/jev-recovery-router

## Resumen

Jev Recovery Router es un prototipo de investigacion desarrollado por Murad Mustafayev (publicado bajo la organizacion Quicksort-fr en Hugging Face) que decide, ante una consulta de usuario en ingles, si comprometerse con una intencion recuperada, ampliar el conjunto de candidatos o derivar la consulta a un humano. No es un modelo generativo autonomo: es un paquete de adaptador, cabeza de clasificacion y actor de politica que se monta sobre el backbone Qwen3-1.7B y un recuperador MiniLM congelado. El sistema se presenta explicitamente como inspirado de forma independiente en Jev, sin afiliacion con TypeSafe AI.

El problema que aborda es el de la prediccion selectiva en clasificacion de intenciones: en lugar de forzar siempre una etiqueta, el router estima probabilidades calibradas sobre un catalogo de intenciones, modela una clase NONE para lo que queda fuera de alcance y aplica una politica sensible al coste para decidir entre `commit` y `handoff`. Esto es relevante para equipos que construyen asistentes conversacionales y necesitan una capa de enrutamiento que evite respuestas incorrectas seguras y derive a atencion humana cuando la evidencia es insuficiente.

El sistema combina una cabeza de posicion de candidato (una columna por posicion, mas NONE), calibracion de temperatura separada para la fase inicial y la expandida, y un actor entrenado con REINFORCE de dos pasos con linea base de valor, condicionado por el estado observado y los costes simulados. El limite de entrada es de 512 tokens incluyendo los candidatos, con rechazo explicito del exceso. La transferencia a BANKING77 se documenta como un caso de fallo sustancial, y la propia model card acota sus afirmaciones: los resultados solo respaldan una mejora en las comparaciones especificadas de CLINC, no una ventaja general de recuperacion ni una ventaja del RL muestreado frente a optimizacion exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) adaptado con LoRA, mas recuperador denso congelado MiniLM, cabeza de posicion de candidato con clase NONE y actor de politica separado |
| Parametros totales | 1.700 millones en el backbone (Qwen3-1.7B), mas adaptador LoRA (rango 16, alpha 32) y cabezas/actor cuyo tamano no se especifica |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens en la entrada, incluyendo los candidatos; el exceso se rechaza, no se trunca silenciosamente. El contexto nativo del backbone no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; la CLI soporta CPU y CUDA, sin cuantizacion documentada) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bundle de adaptador, cabeza y actor); el backbone Qwen3-1.7B y MiniLM no se duplican y se descargan desde sus repositorios upstream con revision fija |

## Arquitectura y entrenamiento

El sistema es un pipeline de recuperacion y decision, no un generador de texto. El backbone es Qwen3-1.7B (revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) adaptado con LoRA de rango 16, alpha 32, dropout 0,05, aplicado unicamente a `q_proj` y `v_proj`. Sobre esa representacion se aprende una cabeza de posicion de candidato con veinte columnas de posicion mas una clase NONE. El recuperador es `sentence-transformers/all-MiniLM-L6-v2` (revision `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`), congelado. El horario de candidatos soportado es de un candidato inicial y hasta cinco tras, como maximo, una expansion; una segunda pasada de recuperacion y modelo solo ocurre si el actor elige expandir.

El modelo de creencia se entrena con entropia cruzada supervisada y una calibracion de probabilidad sobre datos retenidos, con temperaturas separadas de 2,312891 para la fase inicial y 1,874854 para la expandida. El actor liberado es un REINFORCE de dos pasos con linea base de valor, condicionado por el estado observado y los costes simulados, con semilla 42. El checkpoint seleccionado corresponde al paso 3.227, epoca 7, elegido entre 5.532 actualizaciones ejecutadas a lo largo de 12 epocas. Se publican artefactos de procedencia (metadatos, informe de entrenamiento, resumen de entrenamiento, registro de seleccion y manifiesto de publicacion) y una huella del modelo (`5e65eddaec468129ef4ae54049fdade38fac4229e1b0c89a8abcce58bf034ea7`) que el actor verifica junto al hash de calibracion al cargar por CLI.

## Capacidades

- Clasificacion de intenciones en ingles sobre un catalogo suministrado, con probabilidades por candidato y probabilidad de NONE.
- Prediccion selectiva: el sistema puede abstenerse (`handoff`) en lugar de comprometerse con una etiqueta cuando el coste esperado no lo justifica.
- Deteccion de consultas fuera de alcance (out-of-scope) dentro del dominio de CLINC, el punto que la model card identifica como la mejora mas solida.
- Recuperacion ampliada on-demand: una segunda pasada de recuperacion y modelo solo cuando el actor decide expandir el conjunto de candidatos.
- Decision sensible al coste: el actor se condiciona por costes configurables y simulados, sin reentrenamiento.
- Trazas de decision: la salida JSON incluye `commit` o `handoff`, si hubo expansion, la intencion seleccionada opcional, probabilidades de candidatos incluyendo NONE, trazas de etapa y tiempos medidos.
- Inferencia en CPU o CUDA mediante CLI propia.
- Carga offline tras precargar las revisiones fijas de Qwen y MiniLM (`HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`).
- No soporta generacion de texto libre, tool calling, function calling, razonamiento multi-paso general, vision ni audio. No es un modelo `AutoModel.from_pretrained` autonomo.

## Casos de uso

- Enrutamiento de consultas en atencion al cliente: el sistema recibe una utterance en ingles y un catalogo de intenciones, y decide entre comprometerse con una intencion o derivar la conversacion. Encaja en dominios de soporte con catalogos acotados y vocabulario similar a CLINC.
- Filtrado de consultas fuera de alcance: antes de pasar una peticion a un flujo automatizado, el router puede marcarla como NONE y evitar que un intent clasificador convencional fuerce una etiqueta incorrecta. Es su caso de exito documentado.
- Derivacion a agentes humanos con criterio economico: al condicionar el actor por costes, se puede ajustar el umbral de `handoff` segun el coste relativo de una automatizacion erronea frente al de un agente humano.
- Segunda pasada de recuperacion en consultas ambiguas: cuando la confianza sobre el candidato inicial es baja, el sistema expande hasta cinco candidatos y vuelve a puntuar, lo que permite separar errores de recuperacion de errores de clasificacion.
- Capa de enrutamiento previa en asistentes conversacionales multi-turno: el limite de 512 tokens por consulta obliga a resumir o segmentar el historial, pero es viable para turnos cortos de intencion unica.
- Despliegue en CPU para entornos con hardware limitado: la CLI admite `--device cpu`, lo que permite ejecutar el router como servicio ligero en nodos sin GPU.
- Investigacion reproducible en prediccion selectiva y calibracion: los artefactos de procedencia, la huella del modelo y las temperaturas de calibracion publicadas facilitan reproducir y auditar el experimento.
- Estudio de RL con recompensa condicionada por coste: el actor REINFORCE de dos pasos con linea base de valor sirve como banco de pruebas para comparar RL muestreado frente a optimizacion exacta, aunque la model card no reclama ventaja alguna en esa comparacion.
- Uso en dominios bancarios: desaconsejado con los pesos actuales, dado que la transferencia a BANKING77 se documenta como un fallo sustancial.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card afirma cualitativamente que "los resultados respaldan una mejora en las comparaciones especificadas de CLINC, especialmente el rechazo fuera de alcance", pero no incluye cifras de accuracy, F1, MMLU, HumanEval, GSM8K ni de ningun otro conjunto. La misma card acota explicitamente esas afirmaciones: no establecen una ventaja general de recuperacion, ni una ventaja del RL muestreado sobre optimizacion exacta, ni preparacion para produccion, ni aceleracion de despliegue. Los conjuntos de datos citados como base son `clinc/clinc_oos` y `PolyAI/banking77`.

| Aspecto | Resultado |
|---|---|
| Metricas numericas en CLINC | no disponible |
| Metricas numericas en BANKING77 | no disponible; la model card lo describe como un caso de fallo sustancial |
| Comparacion cuantitativa con alternativas | no disponible |
| Tiempos de inferencia publicados | no disponible (la salida JSON incluye timing medido, pero no se publican cifras) |

## Requisitos de hardware

- VRAM estimada para el backbone Qwen3-1.7B: aproximadamente 3,4 GB en fp16, 1,7-2 GB en int8 y 1-1,3 GB en int4 (estimaciones derivadas del numero de parametros; no publicadas por el autor).
- El recuperador MiniLM anade un coste minimo (modelo de 22 millones de parametros, del orden de decenas de MB en fp32).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para el backbone en fp16; A100, H100 o RTX 4090 son sobredimensionadas para este sistema y solo tendrian sentido por agregacion de peticiones o por reutilizacion de infraestructura existente.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060 Ti o una RTX 4090 pueden ejecutar el backbone completo sin cuantizacion.
- Ejecucion en CPU: soportada de forma explicita por la CLI (`--device cpu`), que es el modo por defecto documentado en los ejemplos.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza con el codigo propio del repositorio (`python -m recovery_router.inference`) instalado desde un commit fijado (`6e6ea40c3156a0b971c22bdb3ea3ef9f26924c80`). No es un modelo servible con `AutoModel.from_pretrained`.
- Latencia y throughput estimados: no disponible. La model card no publica cifras, y el segundo pase de recuperacion y modelo solo se ejecuta cuando el actor decide expandir, por lo que la latencia depende de la tasa de expansion observada.

## Comparativa con modelos similares

La comparacion cuantitativa no es posible porque no hay benchmarks publicados. La tabla recoge solo diferencias estructurales verificables.

| Modelo | Parametros | Contexto de entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev Recovery Router | 1,7B (backbone) + LoRA/cabezas | 512 tokens incluyendo candidatos | Clasificacion de intenciones con prediccion selectiva y handoff | Apache 2.0 | Hugging Face + GitHub, requiere codigo propio |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en la informacion proporcionada | Generacion de texto y razonamiento general | Apache 2.0 | Hugging Face, servible con transformers/vLLM |
| Clasificador denso tipo BERT-base ajustado a intenciones | 110M | 512 tokens | Clasificacion de intenciones cerrada, sin abstencion nativa | Apache 2.0 (BERT) | Amplia disponibilidad en transformers |
| Sentence-transformers/all-MiniLM-L6-v2 | 22M | 512 tokens | Embeddings de frase para recuperacion | Apache 2.0 | Hugging Face, sentence-transformers |

Frente a un clasificador denso convencional, la diferencia funcional es la calibracion explicita, la clase NONE y el actor sensible al coste que decide expandir o derivar. Frente al backbone Qwen3-1.7B sin adaptar, la diferencia es que este sistema no genera texto: solo puntua candidatos y decide una accion. No hay datos publicados que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- No es un modelo autonomo: es un bundle de adaptador, cabeza y actor. No funciona con `AutoModel.from_pretrained` ni como modelo de generacion de texto, y exige el codigo del repositorio en un commit concreto.
- Handoff no implica resolucion: que el modelo derive una consulta no significa que un humano pueda resolverla. Es una etiqueta de "no resuelto por este modelo".
- La clase NONE es ambigua por diseno: agrupa tanto consultas realmente fuera de alcance como intenciones soportadas que no aparecen en la lista corta mostrada. Su probabilidad no identifica cual de las dos causas aplica.
- Transferencia fallida a BANKING77, documentada por el propio autor como caso de fallo sustancial. No debe asumirse que el sistema generaliza a catalogos bancarios o a dominios alejados de CLINC.
- Limite de 512 tokens incluyendo candidatos, con rechazo del exceso en lugar de truncado. Las utterances largas fallan en vez de degradarse parcialmente.
- Solo ingles. No hay soporte multilingue declarado.
- Sesgos conocidos: no disponible. Los datos de entrenamiento y evaluacion son conjuntos de atencion al cliente en ingles (CLINC OOS y BANKING77), por lo que cabe esperar sesgo de dominio hacia ese tipo de lenguaje, sin cuantificacion publicada.
- Riesgo de alucinacion: bajo en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es comprometerse con una intencion incorrecta con alta confianza si la calibracion no se ajusta al dominio de destino.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card restringe explicitamente el alcance de las afirmaciones y no reclama preparacion para produccion.
- Dependencia de integridad: el actor comprueba su vinculacion con la huella del modelo y el hash de calibracion al cargar por CLI. Modificar `model/adapter/`, `model/tokenizer/` o sus ficheros invalida el bundle.
- Madurez: prototipo de investigacion con 0 descargas y 1 like en el momento de la consulta, y un repositorio de 0,0 GB porque los pesos del backbone no se duplican.
- Advertencia de alcance: el autor declara que no se establece una ventaja general de recuperacion, ni superioridad del RL muestreado sobre optimizacion exacta, ni aceleracion de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quicksort-fr/jev-recovery-router
- Repositorio de codigo y documentacion tecnica: https://github.com/Muradmustafayev-03/jev-recovery-router
- Commit de inferencia y publicacion: https://github.com/Muradmustafayev-03/jev-recovery-router/tree/6e6ea40c3156a0b971c22bdb3ea3ef9f26924c80
- Commit del entrenamiento de seguimiento: https://github.com/Muradmustafayev-03/jev-recovery-router/tree/ed2c8ad877d3286dfa4b9fdc56e6093b00b2ec81
- Protocolo experimental extendido: https://github.com/Muradmustafayev-03/jev-recovery-router/blob/6e6ea40c3156a0b971c22bdb3ea3ef9f26924c80/docs/EXTENDED_PROTOCOL.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B (revision 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e)
- Recuperador congelado: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 (revision 1110a243fdf4706b3f48f1d95db1a4f5529b4d41)
- Conjuntos de datos citados: `clinc/clinc_oos` y `PolyAI/banking77` en Hugging Face
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos corresponden al algoritmo de ordenacion quicksort y no guardan relacion con el sistema descrito.
