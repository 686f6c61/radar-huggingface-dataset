# Elpapudex/Pos-full

## Resumen

Pos-full (identificado en su model card como u2t01-bert-pos) es un modelo de etiquetado gramatical (part-of-speech tagging) publicado por el usuario Elpapudex en HuggingFace. Se trata de un ajuste fino de `bert-base-uncased` sobre el corpus Universal Dependencies en su configuracion `en_ewt` (English Web Treebank), orientado a predecir las 17 etiquetas UPOS del esquema universal. El repositorio contiene 108.904.721 parametros en formato safetensors, con un tamano total de 0,4 GB, lo que corresponde a la arquitectura BERT-base mas una cabeza de clasificacion por token.

El modelo resuelve una tarea clasica y bien delimitada dentro de los pipelines de procesamiento de lenguaje natural: asignar a cada palabra de una frase inglesa su categoria gramatical (sustantivo, verbo, adjetivo, etc.). Frente a alternativas generativas, un encoder discriminativo de este tamano ofrece coste de inferencia muy bajo y resultados medibles: la model card reporta una precision por token de 0,9719 y un macro-F1 de 0,9195.

Su relevancia actual es practica mas que arquitectonica: sirve como componente de preprocesado rapido y barato en pipelines de PLN, como referencia de ajuste fino sobre UD y como ejemplo de entrenamiento con dos tasas de aprendizaje diferenciadas (cabeza a 1e-3, cuerpo a 2e-5). Cabe senalar que el repositorio no tiene descargas ni valoraciones, no declara licencia ni pipeline, y no incluye pesos en otros formatos distintos de safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT con cabeza de clasificacion por token |
| Parametros totales | 108.904.721 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (heredada de `bert-base-uncased`; no confirmada de forma explicita en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors en precision completa |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | `bert-base-uncased` |
| Tarea | Etiquetado POS con 17 etiquetas UPOS |
| Dataset de ajuste | `universal-dependencies/universal_dependencies`, configuracion `en_ewt` |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional estandar, heredado de `bert-base-uncased`: 12 capas, representaciones de 768 dimensiones y atencion multi-cabeza, con tokenizacion WordPiece. Sobre el encoder se anade una cabeza de clasificacion token a token que proyecta cada estado oculto a las 17 etiquetas UPOS. El ajuste fino se realizo con el metodo etiquetado como "full", es decir, actualizando todos los parametros del modelo (108.904.721 parametros entrenables), y no mediante adaptadores ni LoRA.

El entrenamiento uso el corpus Universal Dependencies `en_ewt` (English Web Treebank), con una estrategia de etiquetado de primer subword: solo la primera pieza de cada palabra recibe etiqueta, mientras que los subwords de continuacion y los tokens especiales se enmascaran con `-100`. Los hiperparametros declarados son `head_lr` = 1e-3, `body_lr` = 2e-5 y semilla 42, con 3 epocas completadas y un tiempo total de entrenamiento de 309,63 segundos. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con una tarea discriminativa de etiquetado.

## Capacidades

- Etiquetado gramatical (POS) en ingles a nivel de token, con 17 etiquetas del esquema UPOS.
- Clasificacion por token con alineacion primer-subword: la etiqueta se asigna a la primera pieza de cada palabra.
- Integracion sencilla como componente de preprocesado dentro de pipelines de PLN (parser, lematizador, NER, analisis de dependencias).
- Inferencia de baja latencia apta para procesamiento por lotes de grandes volumenes de texto.
- Capacidad de servir como generador de etiquetas para anotacion automatica de corpus.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo generativo.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; exclusivamente ingles.

## Casos de uso

- Preprocesado de pipelines de PLN: el modelo etiqueta cada token antes de alimentar un analizador sintactico o un lematizador; su coste por token es muy inferior al de un modelo generativo y la tarea de etiquetado no requiere decodificacion autoregresiva.
- Anotacion automatica de corpus: dado su throughput medido de 401,418 muestras por segundo en evaluacion, puede etiquetar grandes volumenes de texto ingles para crear conjuntos de entrenamiento de modelos downstream, con revision humana posterior.
- Analisis de opiniones y resenas: extraer sustantivos y adjetivos de resenas de producto o servicio para construir agregados de opinion y detectar que entidades se estan valorando.
- Analisis de contenido web a escala: al estar entrenado sobre English Web Treebank, el modelo se ajusta razonablemente a registro informal de blogs, foros y comentarios, util para clasificacion tematica o SEO basado en patrones gramaticales.
- Apoyo a herramientas de correccion gramatical y ensenanza de ingles: identificar categorias gramaticales erroneas o ambiguas en ejercicios y generar feedback a nivel de palabra.
- Enriquecimiento de metadatos de busqueda: anotar indices de documentos con categorias POS para habilitar busquedas por patrones gramaticales (por ejemplo, "verbo en imperativo seguido de sustantivo").
- Normalizacion previa en sistemas de voz: etiquetar transcripciones ASR para segmentar y detectar estructuras gramaticales antes de tareas de comprension.
- Verificacion de calidad en herramientas de traduccion asistida: comprobar la coherencia de categorias gramaticales entre origen y destino en segmentos ingleses.

## Benchmarks y rendimiento

Los unicos datos disponibles son las metricas de evaluacion incluidas en la model card del autor. No se especifica el conjunto de evaluacion exacto (se asume particion de validacion o test de `en_ewt`) ni el hardware utilizado.

| Metrica | Valor |
|---|---|
| Loss | 0,2088 |
| Token accuracy | 0,9719 |
| Macro-F1 | 0,9195 |
| Precision (seqeval) | 0,9665 |
| Recall (seqeval) | 0,9677 |
| F1 (seqeval) | 0,9671 |
| Epocas completadas | 3,0 |
| Runtime de evaluacion | 4,9848 s |
| Throughput de evaluacion | 401,418 muestras/s; 3,21 pasos/s |
| Tiempo total de entrenamiento | 309,63 s |
| Parametros entrenables | 108.904.721 |

Advertencia del propio autor: los valores de precision, recall y F1 calculados con `seqeval` son metricas de evaluacion de secuencias y no representan la metrica estandar a nivel de entidad para POS tagging. La referencia principal para comparaciones es, por tanto, la token accuracy (0,9719) y el macro-F1 (0,9195). No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales, ya que el modelo no esta disenado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo de 108,9 millones de parametros: aproximadamente 0,44 GB en fp32, 0,22 GB en fp16 y unos 0,11 GB en int8 (estimaciones derivadas del numero de parametros, no datos publicados por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100, sin que estas ultimas aporten ventaja significativa dado el tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada e incluso en iGPU con memoria compartida suficiente.
- Inferencia en CPU: viable para produccion de bajo volumen; el modelo es lo bastante pequeno para ejecutarse con ONNX Runtime o PyTorch en CPU con latencias de milisegundos por lote pequeno (no se publican mediciones concretas).
- Opciones de despliegue: `transformers` mediante `AutoModelForTokenClassification` y `AutoTokenizer`, exportacion a ONNX Runtime o TorchScript. El soporte de servidores orientados a modelos generativos (vLLM, TGI) para este tipo de modelo de clasificacion es limitado o no esta documentado; no disponible.
- Latencia y throughput: el unico dato publicado es el throughput de evaluacion de 401,418 muestras por segundo y 3,21 pasos por segundo, medido sobre hardware no especificado. No es un dato directamente extrapolable a produccion.
- Almacenamiento: 0,4 GB de repositorio, sin necesidad de espacio adicional para cuantizaciones inexistentes.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| Pos-full (este modelo) | BERT-base + cabeza POS | 108,9 M | 512 | en | no disponible | Macro-F1 0,9195 y token accuracy 0,9719 en UD `en_ewt` |
| `bert-base-uncased` sin ajustar | BERT encoder | no disponible en la informacion facilitada | 512 | en | no disponible en la informacion facilitada | Modelo base; no predice POS sin ajuste fino |
| Otros ajustes BERT para POS en HuggingFace (por ejemplo, variantes publicadas por terceros) | BERT-base + cabeza POS | no disponible | 512 | en | no disponible | Alternativa directa; sin metricas comparables verificadas en esta ficha |
| Toolkits de PLN con etiquetado POS (Stanza, spaCy, Flair) | Pipelines BiLSTM/transformer | no disponible | no disponible | Multiidioma | no disponible | Mayor cobertura de idiomas y etiquetas (UPOS y XPOS); sin metricas comparables verificadas en esta ficha |

No se dispone de resultados de benchmarks publicados por terceros que permitan una comparacion cuantitativa fiable entre Pos-full y estas alternativas. Cualquier comparacion deberia realizarse reentrenando o evaluando los modelos sobre la misma particion de `en_ewt`.

## Limitaciones y advertencias

- Idioma: el modelo es exclusivamente ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Dominio: entrenado sobre UD English EWT, un corpus de texto web; el autor advierte que puede no generalizar bien a otros dominios, generos o tokenizadores.
- Etiquetas: solo predice las 17 etiquetas UPOS, sin rasgos morfologicos (tiempo, numero, genero) ni etiquetas XPOS especificas de treebank.
- Metricas: los valores de precision, recall y F1 con `seqeval` no son metricas a nivel de entidad para POS tagging, tal como advierte el propio autor; conviene usar token accuracy y macro-F1.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en una situacion juridica indeterminada y requiere contactar con el autor antes de integrarlo en produccion.
- Ausencia de validacion externa: el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni resultados de terceros, por lo que no existe evidencia independiente de su robustez.
- Riesgo de error en etiquetado: al no ser un modelo generativo no alucina texto, pero si puede asignar categorias gramaticales incorrectas en construcciones ambiguas, especialmente en subwords de palabras compuestas o poco frecuentes.
- Sin soporte de generacion ni agentes: no puede emplearse para tareas de razonamiento, codigo, tool calling ni dialogo.
- Inconsistencia de nomenclatura: el repositorio se llama `Pos-full` mientras que la model card se titula `u2t01-bert-pos`, lo que puede complicar la trazabilidad de versiones.
- Metadatos de fecha: las fechas de creacion y actualizacion indican 2026-09-26, posteriores a la mayoria de referencias del ecosistema; conviene verificarlas antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Elpapudex/Pos-full
- Paper de BERT (Devlin et al.): https://arxiv.org/abs/1810.04805
- Documentacion de entrenamiento de HuggingFace Transformers: https://huggingface.co/docs/transformers/training
- Dataset Universal Dependencies en HuggingFace: https://huggingface.co/datasets/universal-dependencies/universal_dependencies
- Modelo base `bert-base-uncased`: https://huggingface.co/bert-base-uncased
- Repositorio Universal Dependencies (proyecto): https://universaldependencies.org/
