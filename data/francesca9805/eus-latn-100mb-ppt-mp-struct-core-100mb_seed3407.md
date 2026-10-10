# francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed3407

## Resumen

El modelo `francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed3407` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/eus_latn_100mb`, un transformer decoder-only de tipo GPT-2 de aproximadamente 124,8 millones de parametros entrenado sobre 100 MB de texto en euskera (codigo `eus_latn`). Lo publica el usuario de HuggingFace `francesca9805` y se ha entrenado con la libreria TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121.

El modelo resuelve una tarea muy concreta: servir como artefacto de investigacion dentro de una serie de experimentos controlados sobre tokenizadores y estructuras de datos, tal como indica el propio identificador (`seed3407`, `struct-core-100mb`) y el proyecto de Weights & Biases asociado, alojado en la organizacion `f-padovani-university-of-groningen`. No es un modelo de proposito general ni un asistente conversacional afinado con RLHF o DPO: es un checkpoint de investigacion derivado de un modelo pequeno y monolingue.

Su relevancia es por tanto limitada y acotada al ambito academico: resulta util para reproducir experimentos de ajuste fino con TRL sobre modelos GPT-2 pequenos, para estudiar el efecto de distintas estrategias de tokenizacion en lenguas de bajos recursos como el euskera, y como punto de partida para comparaciones controladas. El repositorio tiene 0 descargas y 0 likes, y no se ha publicado informacion sobre licencia, idiomas oficialmente soportados ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 124.770.816 (124,8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin versiones cuantizadas |
| Idiomas soportados | No disponible en los metadatos; el modelo base (`eus_latn`) corresponde a euskera en escritura latina |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | goldfish-models/eus_latn_100mb |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-10-09 |
| Fecha de actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia GPT-2: un transformer decoder-only con atencion causal completa, normalizacion previa a cada subcapa y embeddings de tokens y posiciones aprendidos. La etiqueta `gpt2` del repositorio y el recuento de 124.770.816 parametros son consistentes con la configuracion de GPT-2 small. El modelo base, `goldfish-models/eus_latn_100mb`, forma parte de la coleccion Goldfish, orientada a modelos de lenguaje pequenos y monolingues entrenados con presupuestos de datos reducidos (100 MB de texto por idioma), lo que lo situa en la categoria de modelos para lenguas de bajos recursos.

El ajuste fino se ha realizado mediante SFT con TRL, segun declara la propia model card, sin que se especifiquen el conjunto de datos de instrucciones empleado, el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO ni hiperparametros relevantes como la tasa de aprendizaje o el numero de epocas. La unica traza del proceso es el enlace publico al experimento de Weights & Biases, registrado bajo el proyecto `new-tokenizers`. El identificador del modelo sugiere que forma parte de una rejilla de experimentos factoriales que varian tokenizador (`new-tokenizers`), estructura del dataset (`struct-core-100mb`) y semilla aleatoria (`seed3407`). No se documenta ninguna innovacion tecnica adicional: no hay decodificacion especulativa, atencion lineal, atencion por ventanas ni capas recurrentes o hibridas.

## Capacidades

- Generacion de texto autoregresiva basica, en linea con lo que permite un modelo GPT-2 de 124,8 M de parametros.
- Capacidad de continuar o responder a una unica entrada de usuario formateada como mensaje, tal como muestra el ejemplo de `pipeline` de la model card.
- Generacion multilingue: no documentada; el modelo base esta especializado en euskera (`eus_latn`).
- Tool calling / function calling: no documentado ni esperable en esta arquitectura y tamano, sin soporte de plantillas de herramientas en la model card.
- Uso como agente o razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (thinking mode), vision o audio: no soportado.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Uso como artefacto de investigacion para reproducir experimentos de SFT con TRL.

## Casos de uso

- Reproduccion de experimentos academicos: el checkpoint permite replicar el ajuste SFT de un GPT-2 de 124,8 M sobre el corpus euskera de 100 MB, comparando resultados frente a otras semillas del mismo barrido experimental.
- Investigacion en tokenizacion para lenguas de bajos recursos: el proyecto de W&B asociado (`new-tokenizers`) sugiere que el modelo se emplea para medir como distintos vocabularios afectan a la calidad del texto generado en euskera.
- Generacion de texto en euskera con recursos minimos: al tener solo 0,3 GB de pesos, puede desplegarse en hardware muy modesto para tareas de continuacion de texto o generacion de borradores en esta lengua, siempre que se valide la calidad real.
- Docencia y practicas de ajuste fino: sirve como ejemplo completo de extremo a extremo de un flujo TRL con `SFTTrainer`, util en cursos de NLP.
- Pruebas de infraestructura de despliegue: por su tamano reducido es adecuado para validar que un pipeline de vLLM, TGI o transformers funciona antes de migrar a modelos mayores.
- Generacion de datos sinteticos a pequena escala: puede usarse como generador auxiliar en tareas de aumento de datos para experimentos de PLN en euskera, con revision humana obligatoria dado el riesgo de alucinacion.
- Benchmarking de latencia y throughput en hardware antiguo o embebido: el modelo cabe en cualquier GPU consumer e incluso en CPU, por lo que es util para calibrar pipelines antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun el recuento real de parametros (124.770.816): aproximadamente 0,25 GB en fp16/bf16 y 0,5 GB en fp32, sin contar el cache de claves y valores ni el overhead del runtime.
- Cuantizacion: al no publicarse pesos GGUF, GPTQ ni AWQ, habria que generarlos localmente; en int8 los pesos ocuparian del orden de 0,12 GB y en 4 bits del orden de 0,06 GB, cifras orientativas derivadas del numero de parametros.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100; no requiere aceleradores de gama alta.
- Cabe sobradamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090, entre otras) y tambien puede ejecutarse en CPU sin aceleracion dedicada.
- Opciones de despliegue: transformers (soporte nativo y oficial), text-generation-inference (etiqueta declarada en el repositorio), vLLM u Ollama y llama.cpp previa conversion de los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones. Por el tamano del modelo, en una GPU moderna la generacion seria muy rapida, pero se trata de una estimacion cualitativa, no de un dato medido.
- Almacenamiento: 0,3 GB de repositorio, con posibilidad de ejecutarse comodamente en disco local o incluso en memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed3407 | 124,8 M | No disponible | No disponible | HuggingFace, safetensors |
| goldfish-models/eus_latn_100mb (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | Licencia permisiva tipo MIT (segun OpenAI) | Pesos publicos en distintos repositorios |
| Otros ajustes de la misma serie (`seed3407` y variantes) | 124,8 M (previsiblemente) | No disponible | No disponible | HuggingFace, repositorios del mismo autor |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un corpus de entrenamiento de solo 100 MB en euskera tiene una cobertura limitada de dominios, registros y variantes dialectales, lo que probablemente introduce sesgos de representacion.
- Riesgo de alucinacion: alto. Con 124,8 M de parametros y un ajuste SFT sin fases de alineacion documentadas, el modelo puede generar afirmaciones incorrectas con fluidez.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada; la familia GPT-2 suele limitarse a 1024 tokens, lo que descarta casos de uso con documentos largos o conversaciones extensas.
- Limitaciones de idioma: el modelo base esta orientado al euskera (`eus_latn`) y no hay evidencia de capacidades multilingues. El uso en castellano o ingles no esta garantizado ni evaluado.
- Restricciones de licencia: la licencia es "no disponible" tanto en los metadatos de HuggingFace como en la model card, que solo incluye el campo `licence: license` sin contenido. No hay autorizacion explicita de uso comercial, por lo que no deberia emplearse en produccion sin aclarar la situacion legal con el autor y con el titular del modelo base.
- Ausencia de documentacion: no se especifican dataset de instrucciones, hiperparametros, numero de pasos ni criterios de evaluacion, lo que impide auditar el proceso de entrenamiento.
- Nulo historial de uso: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de terceros.
- Fechas de creacion y actualizacion anomalas (2026-10-09), lo que obliga a verificar la trazabilidad del artefacto antes de reutilizarlo.
- En produccion: el modelo no soporta tool calling, agentes ni razonamiento multi-paso, y no hay garantias de estabilidad en generaciones largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-mp-struct-core-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_100mb
- Organizacion Goldfish Models: https://huggingface.co/goldfish-models
- Repositorio de TRL: https://github.com/huggingface/trl
- Experimento de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/rhb3hgwd
