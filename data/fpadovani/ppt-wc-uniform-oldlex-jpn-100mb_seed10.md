# fpadovani/ppt-wc-uniform-oldlex-jpn-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-wc-uniform-oldlex-jpn-100mb_seed10` es un ajuste fino de tipo SFT sobre `goldfish-models/eng_latn_100mb`, un modelo monolingue de la familia Goldfish entrenado con solo 100 MB de texto en inglés. Lo publica el usuario fpadovani, vinculado a la Universidad de Groningen (la entidad de Weights & Biases del run de entrenamiento es `f-padovani-university-of-groningen/white_cotterell`), lo que apunta a un contexto de investigacion academica mas que a un modelo orientado a producto.

Tecnicamente es un transformer decoder-only de arquitectura GPT-2 con 86.416.128 parametros (86,4 M) derivados de los safetensors publicados, empaquetado en safetensors y compatible con la libreria `transformers`, con tags de `text-generation-inference` y `endpoints_compatible`. El nombre del repositorio sugiere un barrido experimental controlado: variantes de muestreo de corpus (`uniform` frente a `oldlex`), una metrica de composicion (`ppt`, `wc`), un idioma (`jpn`) y una semilla fija (`seed10`). Se trata, por tanto, de una pieza de un estudio comparativo de politicas de seleccion de datos de entrenamiento, no de un modelo generalista.

Su relevancia es metodologica: permite reproducir y auditar como distintas estrategias de construccion de corpus afectan al comportamiento de un modelo pequeno con un coste de entrenamiento minimo. El repositorio no incluye model card detallada, no declara licencia efectiva ni idiomas, y no publica resultados de evaluacion, por lo que debe tratarse como un artefacto de investigacion y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (tag `gpt2` en HuggingFace) |
| Parametros totales | 86.416.128 (86,4 M), contados a partir de los safetensors publicados |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (el modelo base `goldfish-models/eng_latn_100mb` es de arquitectura GPT-2; el valor exacto no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | No disponibles en el repositorio; los pesos se distribuyen en safetensors y requieren conversion externa a FP16, int8 o 4 bits |
| Idiomas soportados | No disponible. El modelo base esta entrenado en ingles (`eng_latn`) mientras que el nombre del repositorio indica `jpn`, discrepancia no aclarada en la model card |
| Licencia | No disponible (la model card incluye un campo placeholder, `licence: license`) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | text-generation |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Tamano del repositorio | 1,4 GB |
| Version de Transformers | 4.56.2 |
| Version de PyTorch | 2.11.0 |
| Version de Datasets | 4.8.4 |
| Version de Tokenizers | 0.22.1 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: una pila de bloques transformer decoder-only con atencion causal, normalizacion previa a la atencion y al MLP, y embeddings de tokens atados a la capa de salida. El recuento real de parametros (86.416.128) coincide con el rango habitual de los modelos Goldfish de 100 MB, que reutilizan la configuracion de GPT-2 small con embeddings atados. Esto implica un vocabulario de aproximadamente 50.000 tokens, 12 capas y un `hidden_size` en torno a 768, aunque estos ultimos valores son inferencias a partir de la arquitectura base y no datos confirmados en la informacion disponible. No se documenta el uso de atencion lineal, decodificacion especulativa, SSM ni mecanicas hibridas.

El entrenamiento es un ajuste fino supervisado (SFT) ejecutado con TRL sobre el modelo base `goldfish-models/eng_latn_100mb`. La model card no especifica el dataset de ajuste, el numero de tokens, la composicion del corpus, ni si hubo fases posteriores de RLHF o DPO; solo se indica que el metodo es SFT. Se enlaza un run de Weights & Biases con las curvas de entrenamiento, que es la unica fuente de trazabilidad disponible. El proposito experimental se deduce del nombre del repositorio: comparar una politica de muestreo uniforme del corpus con otra basada en un lexico previo (`oldlex`), controlando la semilla (seed 10) y el idioma (jpn).

## Capacidades

- Generacion de texto autoregresiva en modo continuacion de prompt, tal como se ejemplifica en la model card con un caso de pregunta abierta y `max_new_tokens=128`.
- Generacion condicionada por chat: el ejemplo oficial pasa una lista con un mensaje de rol `user`, por lo que el tokenizador o la plantilla de chat del ajuste acepta ese formato de entrada.
- Capacidad multilingue: no confirmada. El modelo base es monolingue en ingles y el nombre del repositorio apunta a japones, pero no hay documentacion que acredite competencia en ninguno de los dos idiomas ni en otros.
- Razonamiento complejo, matematicas y codigo: no documentados y poco plausibles en un modelo de 86,4 M de parametros entrenado sobre 100 MB de texto.
- Tool calling / function calling: no soportado de forma nativa ni documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Modos especiales (thinking mode, vision, audio): no disponibles.
- Ajuste adicional: al ser un checkpoint pequeno con pesos safetensors estandar, puede servir como punto de partida para nuevos ciclos de SFT o para experimentos de destilacion.

## Casos de uso

- Investigacion en seleccion de datos de entrenamiento: el modelo encaja como sujeto experimental en estudios que comparan politicas de muestreo de corpus (uniforme frente a basada en lexico). Su tamano permite entrenar decenas de variantes con presupuestos de computo muy reducidos y aislar el efecto de la composicion del dataset.
- Smoke test de pipelines de SFT: sirve para validar de extremo a extremo un flujo con TRL, `transformers` y registro en Weights & Biases antes de lanzar el mismo proceso sobre modelos de miles de millones de parametros, detectando errores de tokenizacion o de formato de datos en minutos.
- Pruebas de integracion de infraestructura de inferencia: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, es util para verificar despliegues de TGI o de endpoints compatibles, comprobando serializacion, plantillas de chat y limites de peticion sin consumir GPU cara.
- Docencia y laboratorios de PLN: permite que estudiantes ejecuten un ciclo completo de ajuste fino y generacion en un portatil, cubriendo tokenizacion, entrenamiento supervisado e inferencia con un modelo que cabe en memoria.
- Generacion de texto corto para prototipos y demos internas: continuaciones de frases, variaciones de estilo o texto de relleno para maquetar interfaces, siempre con revision humana y sin exposicion al usuario final.
- Filtrado y preanotacion de corpus a gran escala: como anotador debil y barato, puede puntuar o preclasificar grandes volumenes de texto antes de pasar el subconjunto relevante a un modelo mayor, reduciendo el coste total del etiquetado.
- Comparacion de arquitecturas y tokenizadores: al compartir arquitectura con la familia Goldfish, permite medir el impacto de cambios en el vocabulario o en la estrategia de ajuste manteniendo constante el resto de variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes) y las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del recuento de parametros, sin incluir la cache KV ni el overhead del runtime):
  - FP32: aproximadamente 346 MB.
  - FP16/BF16: aproximadamente 173 MB.
  - int8: aproximadamente 86 MB.
  - 4 bits: aproximadamente 43 MB.
- Cache KV: con la configuracion tipica de GPT-2 small (12 capas, 12 cabezas de 64 dimensiones) la cache ocupa del orden de 36 KB por token en FP16, es decir unos 37 MB para 1.024 tokens. Es una estimacion basada en la arquitectura base, no un dato confirmado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problemas en GTX 1650, RTX 3060, RTX 4090, A100 y H100; en estas ultimas el cuello de botella sera la latencia de lanzamiento de kernels y no la memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas lanzadas en la ultima decada, e incluso en iGPU modernas y en CPU.
- Opciones de despliegue: `transformers` con pipeline de `text-generation` (metodo documentado en la model card), Text Generation Inference (el repositorio esta etiquetado como compatible), y endpoints compatibles con la API de HuggingFace. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no facilitada por el autor.
- Latencia y throughput: no disponibles. Con 86,4 M de parametros se espera una generacion de cientos a miles de tokens por segundo en GPU moderna con batching, pero no hay mediciones publicadas que respalden una cifra concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fpadovani/ppt-wc-uniform-oldlex-jpn-100mb_seed10 | 86,4 M | No disponible | No disponible | HuggingFace, 0 descargas | Ajuste SFT de investigacion, sin evaluacion publicada |
| goldfish-models/eng_latn_100mb (modelo base) | Orden de 86 M (familia Goldfish de 100 MB) | No disponible | No disponible en la informacion recopilada | HuggingFace | Monolingue en ingles, entrenado con 100 MB de texto; sirve de referencia directa |
| GPT-2 small | 124 M (con embeddings no atados) | 1.024 tokens | MIT | Ampliamente disponible | Referencia historica de la arquitectura; mas parametros y ecosistema mucho mayor |
| DistilGPT2 | 82 M | 1.024 tokens | MIT | Ampliamente disponible | Destilado de GPT-2, tamano comparable y muy usado como linea base |

Nota: los datos de GPT-2 small y DistilGPT2 proceden de sus fichas publicas conocidas, no de la informacion proporcionada sobre este modelo. La comparacion con el modelo base es la mas relevante, ya que el resto de variantes de la familia Goldfish (por ejemplo las de japones) no aparecen en la informacion recopilada.

## Limitaciones y advertencias

- Ausencia de licencia efectiva: la model card contiene un campo placeholder (`licence: license`). Sin una licencia explicita no hay autorizacion clara para uso comercial, y ademas habria que verificar la licencia del modelo base `goldfish-models/eng_latn_100mb`, que no se ha podido confirmar.
- Riesgo elevado de alucinacion: con 86,4 M de parametros y un corpus base de 100 MB, el modelo no tiene conocimiento factual fiable. Cualquier salida debe tratarse como texto plausible, no como informacion veraz.
- Ambiguedad de idioma: el nombre del repositorio indica `jpn` mientras que el modelo base es `eng_latn`. No esta documentado si el ajuste se hizo en japones, en ingles o en una mezcla, lo que impide predecir su comportamiento linguistico.
- Contexto limitado y no documentado: al derivar de GPT-2 carece de tecnicas modernas como RoPE, GQA o ventanas deslizantes, por lo que su manejo de conversaciones largas sera debil incluso si la ventana nominal es de 1.024 tokens.
- Sin datos de entrenamiento publicados: se desconoce la composicion del dataset de SFT, su tamano y su procedencia, lo que impide auditar sesgos o contaminacion. Los sesgos del corpus base (100 MB de texto en un unico idioma) se heredan integramente.
- Solo SFT: no hay evidencia de alineacion adicional (RLHF, DPO) ni de filtrado de seguridad. No dispone de salvaguardas frente a peticiones daninas.
- Sin evaluacion cuantitativa: al no existir benchmarks publicados, no se puede comparar objetivamente su calidad con alternativas del mismo tamano.
- Uso en produccion desaconsejado: sin licencia, sin evaluacion, sin soporte y con 0 descargas, no es un artefacto adecuado para sistemas en produccion; su valor es experimental y educativo.
- Trazabilidad parcial: la unica fuente de detalle del entrenamiento es un run externo de Weights & Biases enlazado desde la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-oldlex-jpn-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/vmxm3cui
- Repositorio de TRL: https://github.com/huggingface/trl
- Busquedas web realizadas: no devolvieron ningun enlace relacionado con el modelo. Los unicos resultados obtenidos fueron sitios de resultados deportivos en directo (diretta.it y similares), sin ninguna relacion con el contenido de esta ficha.
