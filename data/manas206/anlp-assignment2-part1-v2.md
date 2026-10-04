# Manas206/anlp-assignment2-part1-v2

## Resumen

Manas206/anlp-assignment2-part1-v2 es un modelo de traduccion automatica de tipo decoder-only, desarrollado por el usuario Manas206 como parte de una practica academica (la propia nomenclatura del repositorio, "anlp-assignment2-part1", apunta a una segunda asignacion de un curso de procesamiento de lenguaje natural aplicado). No se trata de un modelo de proposito general ni de un lanzamiento de producto: es un artefacto de investigacion con un presupuesto de entrenamiento muy reducido (6.973 actualizaciones de parametros y 40.187.852 tokens de entrenamiento no pertenecientes a relleno) y una capacidad de contexto de solo 384 tokens.

El modelo no parte de un transformer preentrenado: es una implementacion propia en PyTorch con una arquitectura de decodificador, tokenizador BPE byte-level de 16.000 tokens compartidos y un esquema de prompts de traduccion del tipo `<bos> <vi-or-ja> SOURCE <en>`, es decir, traduccion desde vietnamita o japones hacia ingles. El repositorio incluye etiquetas de "mixture-of-experts" y "translation", y una variante posterior (V3) que, segun el autor, es una ejecucion parcial no equiparable en presupuesto de computo a las variantes completadas.

Su relevancia es limitada y muy acotada: sirve como referencia reproducible de un pipeline de entrenamiento propio (tokenizador, bucle de entrenamiento, checkpoint y evaluacion) y como punto de comparacion dentro de un ejercicio academico. No cuenta con descargas ni interacciones en HuggingFace en el momento de la consulta, no publica licencia y no aporta resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only personalizada en PyTorch; la model card incluye la etiqueta "mixture-of-experts", sin detalle de su implementacion |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se especifica si hay enrutamiento disperso ni cuantos expertos) |
| Longitud de contexto | 384 tokens ("context capacity: 384") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles en los metadatos; los prompts indican vietnamita y japones como origen e ingles como destino |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de PyTorch (libreria `pytorch`); el repo pesa 0,1 GB y se carga con `from load_model import load_model; model, tokenizer = load_model(directory)` |

## Arquitectura y entrenamiento

Segun la model card, se trata de un modelo decoder-only en PyTorch construido desde cero, sin partir de un transformer preentrenado. Usa un tokenizador BPE byte-level compartido de 16.000 tokens y expone una interfaz de inferencia de bajo nivel: `model.forward(input_ids, attention_mask)` con logits de forma `[batch, time, 16000]`. El entorno declarado es `torch==2.7.0` y `tokenizers==0.23.1`. Las etiquetas del repositorio incluyen `mixture-of-experts`, pero no se documenta ni el numero de expertos, ni la funcion de enrutamiento, ni la proporcion de parametros activos, por lo que no es posible confirmar el alcance real de ese componente.

Los datos de entrenamiento corresponden al split oficial de entrenamiento del dataset `belumind/en-vi-ja-curated-500k-triplets`, orientado a tripletas de traduccion entre ingles, vietnamita y japones. El autor reporta 6.973 actualizaciones de entrenamiento y 40.187.852 tokens de entrenamiento sin contar relleno, lo que constituye un presupuesto extremadamente bajo para una tarea de traduccion multilingue. No se menciona el uso de RLHF, DPO ni ninguna fase de alineacion posterior al preentrenamiento, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor indica ademas que los detalles de procedencia del checkpoint y de la configuracion de evaluacion en test se distribuyen como ficheros JSON dentro del repositorio, pero no se aportan sus cifras en la model card.

## Capacidades

- Traduccion de texto desde vietnamita hacia ingles mediante el prefijo de prompt `<bos> <vi-or-ja> SOURCE <en>`.
- Traduccion de texto desde japones hacia ingles con el mismo esquema de prompt.
- Generacion autoregresiva de texto con decodificador propio (no instruct, no chat).
- Exposicion de logits crudos sobre un vocabulario de 16.000 tokens, lo que permite integrar el modelo en pipelines de investigacion con control manual del muestreo.
- Tokenizacion byte-level BPE compartida entre lenguas, que evita dependencias de tokenizadores externos.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo "thinking": no disponibles.
- Capacidades multilingues adicionales a las tres lenguas del dataset: no disponibles.

## Casos de uso

- Practica docente y replicacion academica: el repositorio permite reproducir un ciclo completo de entrenamiento (tokenizador, bucle de entrenamiento, checkpoint y carga del modelo) en una asignacion de NLP aplicado, con instrucciones explicitas de instalacion y carga.
- Estudio de tokenizacion BPE byte-level multilingue: el vocabulario compartido de 16.000 tokens para vietnamita, japones e ingles sirve como caso de analisis de compromiso entre tamano de vocabulario y cobertura de lenguas con alfabetos distintos.
- Investigacion sobre presupuesto de datos: con solo 40,2 millones de tokens de entrenamiento, resulta util como linea base de "modelo infraentrenado" frente a la cual medir el efecto de aumentar el computo.
- Traduccion vi->en y ja->en en entornos docentes o de demostracion, siempre con textos de menos de 384 tokens y asumiendo calidad limitada.
- Evaluacion comparativa de checkpoints: el propio autor compara esta variante V2 (una epoca) con una V3 parcial, lo que permite estudiar el efecto del presupuesto de entrenamiento sobre la calidad de traduccion.
- Analisis de prompt engineering con tokens especiales: el esquema `<bos> <vi-or-ja> SOURCE <en>` es un ejemplo minimo para estudiar como un modelo pequeno aprende a condicionar la direccion de traduccion mediante tokens de control.
- Docencia sobre despliegue local: al ser un modelo pequeno (repo de 0,1 GB), sirve para practicar carga de checkpoints en PyTorch, gestion de `attention_mask` y calculo de logits sobre un vocabulario reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la procedencia del checkpoint y los ajustes de evaluacion en test se proporcionan como JSON, pero no incluye cifras de BLEU, chrF, MMLU, HumanEval, GSM8K ni de ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia, el repositorio completo ocupa 0,1 GB, por lo que el checkpoint de pesos debe ser de orden muy inferior a esa cifra y cabe holgadamente en cualquier GPU consumer moderna; no obstante, no se especifica el numero de parametros.
- GPU recomendadas: no disponibles de forma explicita. Por el tamano del artefacto, cualquier GPU con unos pocos GB de VRAM (incluidas integradas o GPUs de gama de entrada) seria suficiente para ejecutar la inferencia.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer actual e incluso en CPU, dado el tamano del repositorio y la ventana de contexto de 384 tokens.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia estandar. El unico metodo indicado por el autor es cargar el modelo en Python con `torch==2.7.0` y `tokenizers==0.23.1`, anadiendo el directorio del repositorio a `sys.path`.
- Latencia y throughput estimados: no disponibles. La ventana de contexto de 384 tokens limita el coste por peticion, pero no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion cuantitativa no es posible. A continuacion se contrastan caracteristicas estructurales conocidas de alternativas de traduccion multilingue de uso comun; las cifras de los modelos alternativos proceden de su documentacion publica y no de la informacion proporcionada para este modelo.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| Manas206/anlp-assignment2-part1-v2 | no disponible | 384 tokens | vi/ja -> en (segun prompts) | no disponible | no disponibles |
| mBART-50 | 610 M (aproximado) | 512 tokens | 50 idiomas | MIT | si, en su documentacion |
| NLLB-200-distilled-600M | 600 M (aproximado) | 512 tokens | 200 idiomas | CC-BY-NC-4.0 (no comercial) | si, en su documentacion |
| M2M-100-418M | 418 M (aproximado) | 1024 tokens | 100 idiomas | MIT | si, en su documentacion |

La diferencia fundamental no es de parametros, sino de naturaleza: los tres modelos alternativos son encoder-decoder preentrenados con corpus de gran escala y publican evaluaciones, mientras que este repositorio es un checkpoint academico entrenado con 40,2 millones de tokens, sin licencia declarada y sin metricas publicadas.

## Limitaciones y advertencias

- Presupuesto de entrenamiento muy reducido (40.187.852 tokens y 6.973 pasos), insuficiente para esperar una calidad de traduccion utilizable en produccion.
- Ventana de contexto de 384 tokens: los documentos o frases largas deben fragmentarse, con la consiguiente perdida de coherencia entre segmentos.
- No se especifica la direccion de traduccion en sentido inverso (en -> vi, en -> ja); el esquema de prompts documentado solo cubre la generacion hacia ingles.
- No hay informacion sobre sesgos del modelo. Cabe esperar sesgos derivados del dataset `belumind/en-vi-ja-curated-500k-triplets`, cuya composicion no se detalla en la model card.
- Riesgo de alucinacion elevado en modelos pequenos y poco entrenados, especialmente fuera del dominio del corpus de entrenamiento.
- Licencia no disponible: sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, por lo que no debe desplegarse en entornos productivos.
- Cero descargas y cero interacciones en HuggingFace, sin evidencia externa de validacion por parte de la comunidad.
- La etiqueta `mixture-of-experts` no va acompanada de documentacion tecnica que permita verificar la arquitectura real; conviene tratar ese dato con cautela.
- La model card advierte de que existe una variante V3 que es una ejecucion parcial y no esta equiparada en presupuesto de entrenamiento, por lo que no es comparable directamente.
- No hay soporte de tool calling, agentes, vision ni audio; cualquier uso en esos escenarios requeriria trabajo adicional no documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Manas206/anlp-assignment2-part1-v2
- Dataset de entrenamiento citado: belumind/en-vi-ja-curated-500k-triplets (referenciado en la model card; no se ha verificado su URL directa en la busqueda realizada)
- Paper, blog, repositorio o demo adicionales: no disponibles. La busqueda web efectuada no devolvio resultados relevantes relacionados con este modelo.
