# johnnybravodo/sn92-gen-k7

## Resumen

sn92-gen-k7 es un modelo de decisión (decision model) presentado por el usuario johnnybravodo en la pista generalista de la subred REAX (Bittensor SN92). No es un modelo generativo al uso: su función es leer un estado y una o varias preguntas y devolver una probabilidad para cada opción de respuesta, siguiendo el protocolo de lectura conjunta de REAX, que se materializa en los ficheros `joint_config.json`, `decision_config.json` y `readout.safetensors`.

El repositorio contiene 26.085.330.160 parámetros en formato safetensors (unos 26,1 mil millones), lo que arroja un tamaño de repositorio de 52,2 GB, coherente con pesos en bf16/fp16. La etiqueta `qwen3_5` sugiere que el backbone pertenece a la familia Qwen 3.5, aunque la model card no confirma ni la arquitectura exacta ni el proceso de entrenamiento.

Su relevancia es acotada pero específica: se trata de un artefacto orientado a la evaluación competitiva dentro de una subred de Bittensor, donde los minerosproducen modelos de decisión y los validadores los puntúan. Con 0 descargas y 0 likes en el momento de la consulta, es un modelo recién publicado y sin validación comunitaria, por lo que debe tratarse como material de investigación más que como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; la etiqueta `qwen3_5` apunta a un backbone transformer de la familia Qwen 3.5 con cabeza de lectura (`readout.safetensors`) para el protocolo REAX |
| Parametros totales | 26.085.330.160 (26,1 B), segun safetensors |
| Parametros activos | No aplica segun la informacion disponible (no se documenta arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican GGUF ni variantes cuantizadas; el repo solo contiene safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (52,2 GB de repositorio, compatible con bf16/fp16) |

## Arquitectura y entrenamiento

La informacion publicada no describe la arquitectura interna. Los metadatos indican un backbone etiquetado como `qwen3_5` (previsiblemente un transformer denso de la familia Qwen 3.5) sobre el que se anade un mecanismo de lectura conjunta especifico del protocolo REAX: el modelo consume un estado y un conjunto de preguntas, y emite una distribucion de probabilidad sobre las opciones de respuesta de cada pregunta. Los ficheros `joint_config.json` y `decision_config.json` definen ese contrato de entrada/salida, y `readout.safetensors` contiene los pesos de la cabeza de lectura.

No hay datos sobre volumen de entrenamiento, composicion del corpus, uso de RLHF/DPO ni innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.). Tampoco se documenta si hubo destilacion, fine-tuning supervisado sobre el backbone o entrenamiento desde cero de la cabeza de decision. Cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Puntuacion de opciones: dado un estado y una o varias preguntas, devuelve una probabilidad por cada opcion de respuesta, en lugar de texto libre.
- Decision de eleccion unica y potencialmente multietiqueta, segun el contrato definido en `decision_config.json`.
- Integracion con el protocolo REAX de la subred Bittensor SN92 (joint-readout), incluyendo los artefactos de configuracion y la cabeza de lectura.
- Aprovechamiento del conocimiento del backbone subyacente para tareas de clasificacion y eleccion entre alternativas.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling, agentes ni modo thinking.
- Soporte multilingue: no disponible (no se declara ningun idioma en la model card).
- Capacidad diferencial: salida calibrada como probabilidad, lo que permite umbralizar, comparar y agregar decisiones aguas abajo.

## Casos de uso

- Puntuacion de candidatos en la subred SN92: el modelo evaluaria pares estado/pregunta provenientes de los validadores y devolveria la probabilidad de cada opcion, que se usaria directamente como senal de mineria o como referencia para comparar estrategias.
- Enrutado de consultas con umbral de confianza: dado un estado (por ejemplo, el contexto de una conversacion) y un conjunto de rutas posibles, el modelo devuelve la probabilidad de cada ruta; si la maxima cae por debajo de un umbral, la peticion se deriva a un humano o a un modelo generativo mayor.
- Reranking de respuestas candidatas: se generan N respuestas con un LLM generativo y se pide al modelo la probabilidad de cada una como respuesta correcta al estado dado, usando esa puntuacion para reordenar antes de la entrega final.
- Evaluacion automatica tipo LLM-as-judge discreto: convertir la evaluacion de calidad en una eleccion entre categorias (correcto, parcialmente correcto, incorrecto) y usar la probabilidad como puntuacion continua, lo que facilita el analisis estadistico y la deteccion de casos ambiguos.
- Deteccion de incertidumbre en pipelines de agentes: insertar el modelo como arbitro en los puntos de bifurcacion (continuar, pedir aclaracion, abortar) y utilizar la distribucion de probabilidad para decidir la accion con criterio de riesgo.
- Investigacion sobre calibracion en modelos de decision: al emitir probabilidades explicitas, sirve como banco de pruebas para medir calibracion (ECE, Brier) frente a alternativas en la misma subred.
- Clasificacion de contenido en moderacion: modelar las politicas como preguntas con opciones discretas y usar la probabilidad para priorizar la revision humana, asumiendo que no hay datos publicos sobre sesgos en esta tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 52 GB solo para pesos, mas cache KV y overhead; en la practica se recomienda un margen de 60-70 GB.
- VRAM estimada en int8: alrededor de 26 GB de pesos, con margen recomendado de 32-36 GB.
- VRAM estimada en int4: aproximadamente 13-16 GB de pesos, con margen recomendado de 20-24 GB (la cuantizacion no esta publicada y requeriria convertirla).
- GPU de datacenter recomendadas: A100 80 GB y H100 80 GB en bf16; A100 40 GB o L40S 48 GB viables solo en int8.
- GPU de consumo: no cabe en bf16 en ninguna consumer (la RTX 4090 tiene 24 GB). En int8 cabe en RTX 5090 (32 GB); en int4 cabe en RTX 4090 (24 GB) y, con margen ajustado, en RTX 4080/4060 Ti de 16 GB.
- Multi-GPU: 2 x RTX 4090 (48 GB) con tensor parallelism en bf16 es posible pero deja poco margen para cache KV; 4 x 24 GB es una configuracion mas holgada.
- Opciones de despliegue: vLLM, TGI o SGLang para el backbone en safetensors; llama.cpp u Ollama solo si se generan GGUF propios, ya que el repositorio no los publica.
- Advertencia de despliegue: el modelo no es un generador estandar; requiere cargar `joint_config.json`, `decision_config.json` y `readout.safetensors` y respetar el contrato de lectura conjunta. Los servidores de inferencia convencionales probablemente necesitaran codigo o un wrapper especifico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay informacion verificable sobre otros modelos de decision de la subred SN92 ni sobre las especificaciones exactas de las alternativas. La tabla recoge unicamente los datos confirmados del modelo y deja el resto como no disponible para no introducir cifras sin respaldo.

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sn92-gen-k7 | 26,1 B | No disponible | No publicados | Apache 2.0 | HuggingFace (0 descargas) |
| Alternativas de la subred SN92 | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Backbone Qwen 3.5 de referencia | No disponible | No disponible | No disponible | No disponible | No verificado en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo sin validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia independiente de su calidad.
- Model card minima: no se documentan datos de entrenamiento, tokenizador, idiomas, contexto ni proceso de alineacion, lo que impide auditar el modelo.
- No es un modelo generativo: no produce texto libre; si el caso de uso requiere generacion, hay que combinarlo con otro modelo.
- Protocolo propietario: el contrato de lectura conjunta exige los ficheros de configuracion y la cabeza de lectura; una carga ingenua con `AutoModelForCausalLM` fallara o dara resultados sin sentido.
- Calibracion desconocida: al emitir probabilidades, la utilidad depende de que esten bien calibradas; no hay metricas publicadas de ECE, Brier ni fiabilidad por clase.
- Sesgos: no disponibles. Al no declararse composicion del corpus ni idiomas, no se puede evaluar el sesgo linguistico, cultural o demografico.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza en opciones incorrectas cuando el estado de entrada queda fuera de la distribucion de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el repositorio incluye `NOTICE` y `MODIFICATIONS.md`; conviene revisarlos antes de redistribuir, ya que pueden contener obligaciones de atribucion adicionales.
- Fecha de publicacion reciente (24 de octubre de 2026) y actualizacion practicamente inmediata: es probable que el artefacto cambie; fijar el commit concreto si se usa en produccion.
- Idiomas no declarados: no se puede asumir soporte del castellano ni de ninguna otra lengua sin evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johnnybravodo/sn92-gen-k7
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
