# robbypambudi/prompt-shield-deberta-v3-base

## Resumen

PromptShield DeBERTa-v3-base es un clasificador binario de *prompt injection* publicado por el usuario robbypambudi en HuggingFace. Se trata de un ajuste fino (*fine-tuning*) del modelo `microsoft/deberta-v3-base` mediante `DebertaV2ForSequenceClassification` con dos etiquetas: `0`/BENIGN (sin inyeccion) y `1`/INJECTION (intento de inyeccion de prompt). El modelo resuelve un problema concreto y muy actual: detectar, antes de que lleguen al modelo generativo, instrucciones maliciosas embebidas en texto de usuario o en documentos recuperados, un vector de ataque habitual en aplicaciones con LLM y en sistemas RAG.

El checkpoint publicado es la *epoch 0* de un trial fechado el 2026-09-12 (receta `origfilter`, semilla 12345, learning rate 5e-6). El autor indica que las epochs posteriores alcanzan una perdida de validacion menor, pero que la tasa de verdaderos positivos (TPR) a baja tasa de falsos positivos (FPR) sobre texto completo es maxima en la epoch 0, motivo por el que se publica ese checkpoint y no el de mejor *val-loss*. Por tanto, la seleccion del modelo esta optimizada para el regimen de operacion tipico de un guardrail de seguridad (FPR muy bajo), no para la perdida media.

Se distribuye como safetensors bajo licencia MIT, con unos 184,4 millones de parametros (0,7 GB de repositorio) y una longitud maxima de 512 tokens. No se han publicado datos sobre idiomas soportados mas alla del benchmark de evaluacion, que es en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (clase `DebertaV2ForSequenceClassification`), encoder transformer con atencion desenredada (*disentangled attention*) |
| Parametros totales | 184.423.682 (segun safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (`max_position_embeddings` = 512, `max_length` del tokenizer = 512) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible oficialmente; entrenamiento y evaluacion documentados en ingles (PromptShield English evaluation benchmark) |
| Licencia | MIT |
| Formato de pesos | safetensors; compatible con transformers, text-embeddings-inference y endpoints |
| Tarea (*pipeline*) | text-classification (2 etiquetas) |
| Modelo base | microsoft/deberta-v3-base |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion (metadatos HF) | 2026-09-12 |
| Fecha de actualizacion (metadatos HF) | 2026-09-12 |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-base`, cuyo backbone es la arquitectura DeBERTa-v2 (transformer encoder con atencion desenredada de contenido y posicion, y sin cabezas de embedding de posicion absoluta), preentrenada con el objetivo estilo ELECTRA de deteccion de tokens reemplazados. Sobre ese backbone se anade una cabeza de clasificacion de secuencia con `num_labels=2`, lo que anade 1.538 parametros (768 x 2 + 2) al total de 184.423.682. El uso es puramente discriminativo: produce logits sobre dos clases y, aplicando softmax, una probabilidad de inyeccion.

La receta de entrenamiento documentada es la de PromptShield: aumento de datos con saltos de linea (*newline augmentation*) sobre el split de entrenamiento, dataset filtrado por el criterio `origfilter`, semilla 12345 y learning rate 5e-6 especifico para DeBERTa. La perdida reportada es de 0,0348 en entrenamiento y 0,000476 en validacion para la epoch 0; el mejor *val-loss* (epoch 2) baja a 0,000335 y 0,0000264 respectivamente, pero el autor publica la epoch 0 por su mejor TPR a FPR bajo en texto completo. No se especifica el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables de forma estandar a un clasificador de este tipo).

Una innovacion practica relevante es la estrategia de ventanas deslizantes documentada para prompts largos: se tokeniza el texto en ventanas (128, 256 o 512 tokens) con solapamientos de 0, 64 o 128, se puntua cada ventana y se agrega con `max`. Esta configuracion permite superar el limite de 512 tokens del encoder sin perder deteccion en las zonas relevantes del prompt.

## Capacidades

- Clasificacion binaria de *prompt injection*: devuelve una probabilidad de la clase INJECTION a partir de logits de dos clases.
- Deteccion sobre prompts completos de hasta 512 tokens sin fragmentacion.
- Deteccion sobre textos largos mediante ventanas de tokens con solapamiento y agregacion `max` (configuraciones evaluadas: ventanas de 128/256/512 con solapamiento 0/64/128).
- Uso como guardrail de entrada en pipelines con LLM: filtrado previo de instrucciones maliciosas del usuario.
- Uso como guardrail de contenido recuperado en sistemas RAG, donde la inyeccion puede llegar dentro de documentos.
- Inferencia rapida y de bajo coste por su tamano (184 M de parametros) y su naturaleza encoder-only.
- Compatibilidad con `transformers`, con la libreria de inferencia `text-embeddings-inference` (segun los tags del repositorio) y con *endpoints* compatibles.
- Generacion de texto: no. Razonamiento: no. Codigo: no. Matematicas: no. Vision: no. Audio: no.
- Tool calling / function calling: no disponible (no es una capacidad del modelo, seria el sistema consumidor quien la usaria).
- Soporte de agentes y razonamiento multi-paso: no aplica; el modelo solo etiqueta texto.
- Capacidades multilingues: no documentadas; la unica evaluacion publicada es en ingles.
- Modo *thinking*: no disponible.

## Casos de uso

- Guardrail de entrada en aplicaciones con LLM: antes de enviar el prompt del usuario al modelo generativo, se puntua con este clasificador y, si `p_injection` supera un umbral calibrado para un FPR objetivo (por ejemplo 0,1 % o 0,5 %), se bloquea o se reescribe la peticion. Es adecuado porque esta optimizado precisamente para operar a FPR muy bajo, que es la condicion que exige un filtro de produccion.
- Proteccion de pipelines RAG: los documentos recuperados se puntuan por ventanas de 128 tokens con solapamiento 64 y agregacion `max`, de modo que una instruccion maliciosa incrustada en un PDF o una pagina web no llegue al contexto del generador. Esta configuracion es la mejor documentada para 1 % de FPR (61,47 % de TPR).
- Moderacion de entradas de usuario en chatbots multi-turno: cada mensaje entrante se clasifica antes de la generacion; el coste computacional de un encoder de 184 M permite hacerlo en linea sin anadir latencia perceptible.
- Escaneo de documentos largos en la ingestion: durante la indexacion, cada fragmento se evalua y se marca; el agregado `max` por ventana evita que un atacante diluya la carga maliciosa repartiendola en un texto extenso.
- Ataque/adversario en red teaming: uso como linea base automatica para medir la eficacia de conjuntos de prompts de inyeccion conocidos y comparar con otros detectores sobre el mismo benchmark.
- Capa adicional en pasarelas de API de LLM (*AI gateways*): integrarlo como middleware previo al enrutado de peticiones, registrando puntuaciones para su analisis posterior en un SIEM y permitiendo ajustar el umbral segun el apetito de riesgo.
- Filtrado de datos de entrenamiento o de evaluacion: detectar ejemplos con inyeccion en corpus recolectados de la web antes de usarlos para ajuste fino.
- Punto de partida para *fine-tuning* domain-specific: al ser un checkpoint MIT de 184 M de parametros sobre DeBERTa-v3-base, es barato reentrenarlo con datos propios de un dominio concreto (por ejemplo, inyecciones en un idioma o en un vertical especifico).

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card del autor, sobre el benchmark PromptShield English (evaluacion a nivel de prompt padre).

Evaluacion en texto completo (sin fragmentacion):

| FPR objetivo | TPR |
|---|---|
| 0,05 % | 33,12 % |
| 0,1 % | 36,89 % |
| 0,5 % | 50,42 % |
| 1 % | 55,32 % |

Evaluacion por ventanas de tokens con agregacion `max`:

| Ventana | Solapamiento | TPR@0,05 % | TPR@0,1 % | TPR@0,5 % | TPR@1 % |
|---|---|---|---|---|---|
| 128 | 0 | 28,14 % | 35,65 % | 47,67 % | 53,31 % |
| 128 | 64 | 32,25 % | 39,67 % | 55,20 % | 61,47 % |
| 256 | 0 | 31,17 % | 35,38 % | 51,62 % | 56,65 % |
| 256 | 64 | 33,12 % | 36,09 % | 52,54 % | 57,65 % |
| 256 | 128 | 33,38 % | 35,97 % | 52,73 % | 58,00 % |
| 512 | 0 | 30,65 % | 36,93 % | 50,49 % | 55,23 % |
| 512 | 64 | 33,15 % | 37,13 % | 50,48 % | 55,29 % |
| 512 | 128 | 33,18 % | 37,16 % | 50,51 % | 55,44 % |

Perdidas de entrenamiento y validacion reportadas por el autor:

| Split | Epoch 0 | Mejor val-loss (epoch 2) |
|---|---|---|
| train | 0,0348 | 0,000335 |
| val | 0,000476 | 0,0000264 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros detectores sobre el mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 184,4 M de parametros; no publicada por el autor): aproximadamente 738 MB en FP32, 369 MB en FP16/BF16, 184 MB en INT8 y 92 MB en INT4, mas el *overhead* de activaciones y del runtime (habitualmente unas decenas o cientos de MB adicionales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede ejecutar comodamente en RTX 3060, RTX 4060, RTX 4090, L4, T4, A10, A100 o H100. En la practica, la GPU no es un cuello de botella para este modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas, e incluso en modo CPU con latencias aceptables por ser un encoder de 184 M de parametros.
- Opciones de despliegue: `transformers` en PyTorch (uso documentado en la model card con `AutoTokenizer` y `AutoModelForSequenceClassification`), text-embeddings-inference (tag del repositorio), endpoints compatibles con HuggingFace. El soporte de vLLM, llama.cpp, Ollama o TGI para clasificacion de secuencia BERT-like no esta documentado en la informacion disponible.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.
- Nota practica: dado el bajo coste, es viable ejecutarlo en CPU para volúmenes moderados o batching en GPU para volúmenes altos, aplicando ventanas de 128 tokens con solapamiento 64 si los textos superan 512 tokens.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada sobre modelos alternativos (parametros, contexto o rendimiento). La comparativa que sigue solo incluye lo que puede afirmarse con la informacion disponible; el resto se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| robbypambudi/prompt-shield-deberta-v3-base | 184.423.682 | 512 tokens | MIT | safetensors | TPR 55,32 % @1 % FPR (texto completo); 61,47 % @1 % FPR con ventanas de 128/solape 64 |
| microsoft/deberta-v3-base (modelo base) | ~184 M | 512 tokens | MIT | safetensors | no disponible (no es un detector de inyeccion) |
| Otros detectores de prompt injection (ProtectAI, Meta Prompt Guard, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de una comparacion head-to-head publicada en la informacion proporcionada, por lo que no puede afirmarse la superioridad o inferioridad de este checkpoint frente a alternativas.

## Limitaciones y advertencias

- Rendimiento modesto en terminos absolutos: la mejor TPR documentada es del 61,47 % a un 1 % de FPR (ventanas de 128 con solape 64). Esto implica que una proporcion elevada de inyecciones no se detecta en el regimen de FPR bajo que exige un guardrail en produccion. No debe usarse como unico mecanismo de defensa.
- El checkpoint publicado no es el de menor perdida de validacion: el autor eligio la epoch 0 por su mejor TPR a FPR bajo. Cualquier comparacion contra la epoch 2 u otros checkpoints debe hacerse sobre la metrica de seguridad, no sobre *val-loss*.
- La perdida de entrenamiento en la epoch 0 (0,0348) es ordenes de magnitud superior a la del mejor checkpoint (0,000335), lo que sugiere que el modelo esta menos ajustado a la distribucion de entrenamiento; puede haber mayor sensibilidad al umbral elegido.
- Riesgo de sobreajuste a la distribucion del dataset de entrenamiento (`origfilter` con aumento por saltos de linea) y al benchmark de evaluacion PromptShield. No hay evaluacion sobre dominios, idiomas o plantillas de inyeccion fuera de ese benchmark, por lo que el rendimiento real en produccion puede degradarse por cambio de distribucion.
- El modelo se limita a 512 tokens por pasada; los textos mas largos requieren fragmentacion y agregacion, lo que anade complejidad y puede alterar la calibracion (el mejor resultado se obtuvo con un esquema concreto de ventanas).
- Idioma: la unica evaluacion documentada es en ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas; usarlo en entornos multilingues sin evaluacion propia es arriesgado.
- Sesgos: no se ha publicado ningun analisis de sesgos. Un detector entrenado sobre un corpus de inyecciones puede sobrerreaccionar ante ciertos estilos de escritura, jerga tecnica o textos que mencionen instrucciones de forma legitima (por ejemplo, documentacion sobre seguridad o articulos que citan ejemplos de inyeccion).
- Alucinacion: no aplica de forma directa porque el modelo no genera texto; el riesgo equivalente es la clasificacion erronea (falsos positivos y falsos negativos) y una calibracion no verificada fuera del benchmark original.
- Licencia MIT: permite uso comercial y modificacion, pero se mantiene la obligacion habitual de conservar el aviso de copyright y de licencia. La licencia del modelo base (`microsoft/deberta-v3-base`) tambien es MIT.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, no se ha publicado un articulo asociado y la fecha de los metadatos (2026-09-12) no permite verificar un historial de mantenimiento.
- Para produccion: es imprescindible calibrar el umbral con datos propios, medir la tasa de falsos positivos real sobre trafico legitimo y combinarlo con otras capas de defensa (sanitizacion, delimitadores, permisos de herramientas y validacion de salidas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robbypambudi/prompt-shield-deberta-v3-base
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Paper o blog del metodo PromptShield: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
- Otros enlaces relevantes: no disponible. Los resultados de la busqueda web realizada no contienen informacion relacionada con el modelo (corresponden a paginas sobre cine y series, sin conexion con el objeto de esta ficha).
