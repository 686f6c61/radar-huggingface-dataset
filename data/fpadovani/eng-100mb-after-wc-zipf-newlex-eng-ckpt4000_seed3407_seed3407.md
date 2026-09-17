# fpadovani/eng-100mb-after-wc-zipf-newlex-eng-ckpt4000_seed3407_seed3407

## Resumen

El modelo `fpadovani/eng-100mb-after-wc-zipf-newlex-eng-ckpt4000_seed3407_seed3407` es un ajuste fino (SFT) del checkpoint base `fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed3407`, publicado por el usuario fpadovani y vinculado a un proyecto de la Universidad de Groningen (el enlace de Weights & Biases apunta al espacio de trabajo `f-padovani-university-of-groningen/white_cotterell`). Se trata de un transformer decoder-only de escala GPT-2 small, con 124.770.816 parametros, entrenado con la libreria TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0.

Por su nomenclatura (`eng`, `100mb`, `wc`, `zipf`, `newlex`, `ckpt4000`, `seed3407`), el modelo parece formar parte de un experimento controlado sobre el efecto de la distribucion de frecuencias (Zipf) y la composicion lexica del corpus de entrenamiento en un corpus de aproximadamente 100 MB en ingles. Es un artefacto de investigacion, no un modelo orientado a producto: acumula 0 descargas y 0 likes, no declara licencia ni idiomas y no publica resultados de evaluacion.

Su relevancia es, por tanto, acotada y de tipo metodologico: sirve como punto de comparacion reproducible dentro de una familia de experimentos con la misma semilla y el mismo presupuesto de datos, no como alternativa a modelos generativos actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 124.770.816 |
| Longitud de contexto | No disponible oficialmente; el recuento de parametros es compatible con 1024 tokens (inferencia aritmetica, sin confirmar) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin versiones cuantizadas |
| Idiomas soportados | No disponible; el identificador incluye `eng` (ingles), pero la model card no lo confirma |
| Licencia | No disponible; la model card incluye el marcador de posicion `licence: license` sin texto de licencia |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Tamano del repositorio | 1,5 GB |
| Modelo base | fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed3407 |
| Tipo de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |

No se trata de un modelo MoE, por lo que no aplica la fila de parametros activos.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion causal, coherente con la etiqueta `gpt2` y con el recuento de parametros. A partir del dato exacto de 124.770.816 parametros se puede inferir, sin confirmacion por parte del autor, una configuracion equivalente a GPT-2 small (12 capas, 768 de dimension de modelo, 12 cabezas de atencion) con un vocabulario de aproximadamente 50.688 entradas y una longitud de contexto de 1024 tokens; el resto de combinaciones habituales no reproduce la cifra exacta. Esta deduccion debe tratarse como una hipotesis de trabajo, no como una especificacion verificada.

En cuanto al entrenamiento, la model card indica unicamente que se aplico SFT con TRL, e incluye el enlace a la ejecucion de Weights & Biases (`loq0sauh`). No se documentan el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si hubo fases posteriores de RLHF o DPO. El nombre del modelo (`after-wc-zipf-newlex`, `ckpt4000`) sugiere que el ajuste se realizo sobre el checkpoint 4000 de un entrenamiento previo con un corpus filtrado por criterios de frecuencia lexica, pero la model card no aporta detalle sobre ese procedimiento. El ejemplo de uso incluido emplea un formato de conversacion con roles (`{"role": "user", "content": ...}`), lo que indica que el ajuste SFT se hizo sobre datos con plantilla de chat.

## Capacidades

- Generacion de texto autoregresiva en formato de respuesta a una instruccion de usuario, segun el ejemplo oficial de la model card.
- Conversacion de un solo turno con plantilla de roles (`user`), sin evidencia de gestion de historiales largos.
- Generacion de texto libre condicionada por prompt, al ser la tarea declarada en el pipeline (`text-generation`).
- Compatibilidad con `text-generation-inference` y con endpoints alojados, segun las etiquetas del repositorio.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, uso de navegador o ejecucion de codigo.
- No hay evidencia de vision, audio ni otras modalidades.
- No hay evidencia de modo de razonamiento explicito (thinking mode) ni de decodificacion especulativa.
- El alcance multilingue no esta declarado; por el identificador, el entrenamiento parece limitado al ingles.

## Casos de uso

- Reproduccion de experimentos academicos sobre frecuencia lexica: el modelo permite comparar, con la misma semilla y el mismo presupuesto de datos, como cambia la generacion al variar la distribucion Zipf del corpus de entrenamiento.
- Linea base en estudios de ajuste fino: dado que es un SFT pequeno y barato de entrenar, sirve como referencia inferior frente a modelos mayores en experimentos de scaling laws con presupuesto controlado.
- Pruebas de infraestructura de inferencia: con 124,7 M de parametros es util para validar pipelines de `transformers`, `text-generation-inference`, vLLM o servidores de endpoints sin consumir GPU de gama alta.
- Docencia de transformers: permite ilustrar de extremo a extremo el flujo de tokenizacion, generacion y ajuste SFT en un modelo que cabe en una GPU de portatil.
- Generacion de datos sinteticos para filtrar o preprocesar corpus en investigacion linguistica, aceptando que la calidad del texto sera baja y requerira revision posterior.
- Pruebas de regresion en cadenas de CI de proyectos de NLP: al ser determinista con una semilla fija, sirve para detectar cambios en tokenizadores, plantillas de chat o versiones de librerias.
- Demostraciones educativas de riesgos de alucinacion: su tamano reducido lo hace apropiado para mostrar en clase como un modelo pequeno produce texto plausible pero factualmente incorrecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes en ingles), y la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del recuento de parametros (124,77 M), no datos publicados por el autor.

- VRAM estimada en fp32: en torno a 0,5 GB de pesos, mas activaciones y cache KV.
- VRAM estimada en fp16/bf16: en torno a 0,25 GB de pesos.
- VRAM estimada en int8: en torno a 0,12 GB de pesos.
- VRAM estimada en int4: en torno a 0,06 GB de pesos.
- Cabe holgadamente en cualquier GPU de consumo actual (RTX 3060, RTX 4090, GTX 1660, e incluso iGPU con memoria compartida) y puede ejecutarse en CPU a velocidad interactiva.
- GPU de datacenter (A100, H100) innecesarias; solo tendrian sentido para servir muchas replicas en paralelo.
- Opciones de despliegue: `transformers` con `pipeline`, `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), vLLM y TGI. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de documentacion publica ampliamente conocida y no de la busqueda web asociada a esta ficha; se incluyen como referencia de categoria, no como medicion directa contra este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eng-100mb-after-wc-zipf-newlex-eng-ckpt4000_seed3407_seed3407 | 124,77 M | No confirmado (probable 1024) | No disponible | HuggingFace, 0 descargas |
| GPT-2 small | 124 M | 1024 | MIT modificada | Ampliamente disponible |
| Pythia-160M | 162 M (85 M no de embedding) | 2048 | Apache 2.0 | Disponible con 154 checkpoints |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Disponible |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | Disponible |

En rendimiento no es posible comparar: este modelo no publica ninguna metrica, mientras que las alternativas de la tabla cuentan con evaluaciones publicadas en sus respectivas model cards. La diferencia relevante no es de calidad, sino de estado de publicacion: el modelo analizado carece de licencia, idiomas declarados y evaluacion, lo que lo situa en un estadio de artefacto experimental.

## Limitaciones y advertencias

- Sesgos: no documentados. Un modelo entrenado sobre un corpus filtrado por frecuencia lexica en ingles puede sobrerrepresentar vocabulario comun y registrar un sesgo sistematico derivado de ese filtrado, pero el autor no lo analiza.
- Alucinacion: el riesgo es alto. Con 124,77 M de parametros y entrenamiento SFT sobre un corpus de unos 100 MB, la capacidad de retener hechos es muy limitada; el texto generado debe tratarse como no fiable a nivel factual.
- Contexto: la longitud de contexto no esta declarada. Si la hipotesis de 1024 tokens es correcta, el modelo no es adecuado para documentos largos ni conversaciones multi-turno extensas.
- Idioma: solo hay indicios de entrenamiento en ingles a partir del identificador; el comportamiento en castellano no esta documentado y previsiblemente sera deficiente.
- Licencia: la model card contiene el literal `licence: license`, que no es una licencia valida. No hay autorizacion explicita de uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Procedencia de datos: no se especifica la composicion del corpus de ajuste SFT, por lo que no puede descartarse la presencia de contenido con derechos de autor o datos personales.
- Madurez: 0 descargas y 0 likes, sin version cuantizada ni evaluacion. No hay senal de mantenimiento ni de soporte.
- Uso en produccion: desaconsejado como modelo de asistencia al usuario final. Su valor esta en la experimentacion controlada y en la docencia, no en tareas con requisitos de calidad o seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/eng-100mb-after-wc-zipf-newlex-eng-ckpt4000_seed3407_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed3407
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/loq0sauh
- Repositorio de TRL: https://github.com/huggingface/trl

No se han encontrado papers, blogs ni demos adicionales asociados a este modelo en la busqueda web realizada.
