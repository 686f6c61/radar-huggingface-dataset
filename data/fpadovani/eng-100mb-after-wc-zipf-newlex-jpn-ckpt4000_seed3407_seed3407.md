# fpadovani/eng-100mb-after-wc-zipf-newlex-jpn-ckpt4000_seed3407_seed3407

## Resumen

El modelo `eng-100mb-after-wc-zipf-newlex-jpn-ckpt4000_seed3407_seed3407` es un ajuste fino (SFT) del modelo base `fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407`, publicado por el usuario fpadovani en HuggingFace. Se trata de un transformer decoder-only de tipo GPT-2 con 124.770.816 parametros (aproximadamente 125 millones), entrenado con la libreria TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0. El identificador del modelo apunta a un experimento academico: la traza de entrenamiento se registro en un proyecto de Weights & Biases bajo la organizacion "f-padovani-university-of-groningen", con el nombre de proyecto "white_cotterell", lo que sugiere un contexto de investigacion en procesamiento de lenguaje natural.

Por la nomenclatura del identificador ("eng", "100mb", "wc", "zipf", "newlex", "jpn", "ckpt4000", "seed3407") cabe inferir que forma parte de una bateria de experimentos controlados sobre composicion de corpus y distribuciones tipo Zipf, con variaciones de idioma e inicializacion aleatoria. No obstante, la model card no documenta el dataset, el numero de tokens, la longitud de contexto ni los hiperparametros de entrenamiento, por lo que cualquier interpretacion de este tipo es provisional.

Su relevancia practica es limitada como modelo de produccion: no tiene descargas ni interacciones, la licencia no esta especificada y no se han publicado resultados de benchmarks. Su interes es fundamentalmente metodologico, como artefacto reproducible de un pipeline de SFT con TRL y como punto de comparacion en estudios sobre curricula de datos y leyes de escala en corpus pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | no disponible (el identificador incluye "eng" y "jpn", pero la model card no declara idiomas) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, segun la etiqueta declarada en el repositorio. Con 124.770.816 parametros, el modelo encaja en el rango de GPT-2 base (124M), lo que implica un coste de inferencia muy bajo y la posibilidad de ejecutarlo en CPU o en practicamente cualquier GPU moderna. No se documenta el numero de capas, la dimensionalidad del modelo, el numero de cabezas de atencion ni el tamano del vocabulario, por lo que no es posible confirmar si la configuracion replica exactamente la de GPT-2 base o introduce variaciones.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0. El modelo parte de `fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407`, del que hereda los pesos iniciales, y se ajusta sobre un dataset de instrucciones no especificado. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni los hiperparametros (learning rate, batch size, numero de pasos, warmup). El identificador sugiere un checkpoint 4000 y una semilla 3407, y la traza publica de Weights & Biases esta disponible para inspeccion, pero los valores concretos no aparecen en la model card. No se describen innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanicas de "thinking mode".

## Capacidades

- Generacion de texto autorregresiva en formato conversacional: el ejemplo oficial usa `pipeline("text-generation")` con una lista de mensajes `{"role": "user", "content": ...}`, lo que indica que el tokenizador o la plantilla de chat aceptan turnos de usuario.
- Ajuste a instrucciones basicas derivado del entrenamiento SFT, con respuestas de hasta 128 tokens nuevos en el ejemplo publicado.
- Generacion de texto libre condicionada por prompt.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente, razonamiento multi-paso o uso de herramientas externas.
- No hay evidencia documentada de capacidades multilingues, pese a que el identificador contiene las cadenas "eng" y "jpn".
- No hay evidencia documentada de vision, audio, modo de razonamiento explicito ni otras capacidades multimodales.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.

## Casos de uso

- Reproducibilidad de experimentos academicos: el modelo forma parte de una familia de variantes identificadas por semilla, corpus y checkpoint, por lo que sirve para replicar comparaciones controladas sobre composicion de datos y distribuciones tipo Zipf en corpus de 100 MB.
- Estudio de leyes de escala en corpus pequenos: al tener un tamano fijo de 124,7M de parametros y variantes por idioma y semilla, permite aislar el efecto del corpus frente al efecto del numero de parametros.
- Linea base en pipelines de SFT con TRL: es un ejemplo funcional de ajuste supervisado con TRL 0.23.0 que puede usarse como referencia para validar configuraciones de entrenamiento antes de escalar a modelos mayores.
- Docencia y demostraciones de generacion de texto: con 125M de parametros se ejecuta en CPU con latencia tolerable, lo que lo hace util para clases y talleres donde no hay GPU disponible.
- Pruebas de integracion de infraestructura: las etiquetas `text-generation-inference` y `endpoints_compatible` permiten usarlo como modelo de humo para validar despliegues de TGI o endpoints antes de mover modelos grandes.
- Experimentos de analisis linguistico sobre salidas generadas: su tamano reducido y su entrenamiento sobre corpus controlado lo hacen manejable para estudiar sesgos de vocabulario, repeticion y estructura sintactica en texto generado.
- Evaluacion de tecnicas de evaluacion: sirve como sujeto de pruebas para metodologias de benchmark y deteccion de alucinaciones en modelos pequenos, donde los fallos son frecuentes y faciles de caracterizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 0,50 GB; en FP16/BF16, unos 0,25 GB; en INT8, unos 0,12 GB; en INT4, unos 0,07 GB. A estas cifras hay que anadir el coste de las activaciones, la cache KV y el overhead del runtime, que en la practica anaden unos cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo no aprovecha aceleradores de gama alta por su reducido tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en CPU sin GPU dedicada.
- Opciones de despliegue: `transformers` con `pipeline`, text-generation-inference (declarado en las etiquetas), endpoints compatibles con la API de inferencia. vLLM, llama.cpp u Ollama son tecnicamente viables, pero no se publican pesos GGUF ni configuraciones especificas en el repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/eng-100mb-...` (este modelo) | 124,8M | no disponible | no disponible | HuggingFace, safetensors | Ajuste SFT de un modelo base de investigacion; sin benchmarks publicados |
| GPT-2 (124M) | 124M | 1.024 tokens segun la documentacion de OpenAI | MIT | Ampliamente disponible | Referencia de la arquitectura; ampliamente evaluado y con ecosistema maduro |
| DistilGPT-2 | 82M | 1.024 tokens segun su model card | Apache 2.0 | HuggingFace | Destilado de GPT-2, menor coste y calidad inferior a GPT-2 base |
| GPT-2 medium | 355M | 1.024 tokens segun la documentacion de OpenAI | MIT | HuggingFace | Mayor capacidad con un coste de inferencia aun bajo |

La comparacion con GPT-2 base es la mas directa por tamano, pero este modelo no publica contexto, licencia ni evaluaciones, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. No se dispone de datos de benchmarks de alternativas en la informacion proporcionada que permitan una comparacion homogenea.

## Limitaciones y advertencias

- Licencia no especificada: la model card contiene un campo `licence: license` sin texto, por lo que no hay base legal clara para uso comercial. Conviene contactar con el autor antes de cualquier uso en produccion.
- Ausencia total de benchmarks: no hay metricas de calidad, lo que impide estimar su rendimiento frente a alternativas.
- Dataset de entrenamiento no documentado: se desconoce la procedencia, el idioma y la posible presencia de contenido sesgado, toxico o con derechos de autor.
- Riesgo elevado de alucinacion: con 124,7M de parametros y sin datos de evaluacion, es esperable que genere afirmaciones incorrectas con fluidez, especialmente fuera de la distribucion de entrenamiento.
- Contexto no documentado: se desconoce la ventana maxima, lo que dificulta disenar aplicaciones multi-turno o de contexto largo.
- Idiomas soportados no declarados: el identificador mezcla "eng" y "jpn" y esto no debe interpretarse como soporte multilingue confirmado.
- Modelo de investigacion sin validacion externa: cero descargas y cero interacciones en el momento de redactar esta ficha, sin evidencia de uso en produccion.
- Nomenclatura propensa a error: el nombre incluye "seed3407" duplicado y cadenas codificadas de experimento, lo que complica el inventario y la trazabilidad en repositorios de modelos.
- No hay pesos cuantizados publicados: cualquier despliegue en GGUF o con cuantizacion agresiva requiere conversion y validacion propias.
- No se debe asumir soporte de tool calling ni de agentes: no hay ninguna evidencia en la documentacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/eng-100mb-after-wc-zipf-newlex-jpn-ckpt4000_seed3407_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407
- Traza de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/cbfupq6j
- Repositorio de TRL: https://github.com/huggingface/trl
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo; consisten en listados de hoteles en Munich sin relacion con el objeto de la ficha.
