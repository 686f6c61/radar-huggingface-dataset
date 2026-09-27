# jongrock17/DEBATE-kor-large

## Resumen

DEBATE-kor-large es un modelo de clasificación de texto en coreano desarrollado por el usuario jongrock17, orientado a inferencia de lenguaje natural (NLI) binaria sobre texto político. Se inicializa desde el checkpoint `mlburnham/Political_DEBATE_DeBERTa_large_v1.1` —la variante DeBERTa-large del framework Political DEBATE— y se ajusta posteriormente sobre `jongrock17/PolNLI-kor`, una traducción y adaptación al coreano del corpus PolNLI. La cadena de adaptación declarada por el autor es Political DEBATE DeBERTa-large → PolNLI-kor → DEBATE-kor-large.

El modelo emplea una arquitectura DeBERTa-v2 large con 435.063.810 parámetros (aproximadamente 435 millones) y una cabeza de clasificación de dos etiquetas: `not_entailment` (0) y `entailment` (1). La longitud máxima de secuencia utilizada en la evaluación es de 256 tokens. No es un modelo generativo: es un encoder de clasificación, por lo que su salida son logits de dos clases sobre el par premisa-hipótesis.

Su relevancia radica en que explora una estrategia de adaptación distinta a la de la familia PolNLI-kor-RoBERTa: en lugar de partir de encoders preentrenados en coreano (KLUE-RoBERTa) y ajustarlos, transfiere directamente un checkpoint entrenado en inglés sobre discurso político y lo adapta al dominio político coreano. Los resultados publicados muestran que esta ruta de transferencia de dominio no supera agregadamente a las alternativas basadas en RoBERTa coreano, lo que constituye en sí mismo un hallazgo metodológico relevante para quien investiga adaptación cross-lingüe de modelos de lenguaje político.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 large (encoder transformer, `DebertaV2ForSequenceClassification`) |
| Parametros totales | 435.063.810 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima usada en evaluacion; no se especifica el limite maximo del encoder) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | clasificacion de secuencias (NLI binaria) |
| Etiquetas | 0 = `not_entailment`, 1 = `entailment` |
| Modelo base | mlburnham/Political_DEBATE_DeBERTa_large_v1.1 |
| Dataset de ajuste | jongrock17/PolNLI-kor |
| Tamano del repositorio | 10,4 GB |
| Libreria | transformers |
| Metricas declaradas | accuracy, f1, matthews_correlation, roc_auc |

## Arquitectura y entrenamiento

El modelo es un encoder transformer DeBERTa-v2 en configuracion large, con 435 millones de parametros y una cabeza de clasificacion de dos salidas. La arquitectura DeBERTa-v2 introduce atencion desenredada (disentangled attention), en la que las representaciones de contenido y posicion se calculan por separado, y una mascara de decodificacion mejorada para el preentrenamiento. Sobre esta base, el procedimiento seguido por el autor es un ajuste supervisado adicional: se parte del checkpoint Political DEBATE de mlburnham —entrenado sobre discurso politico en ingles— y se ajusta sobre el conjunto PolNLI-kor, una traduccion y adaptacion al coreano de PolNLI.

La tarea de entrenamiento es NLI binaria: dado un par premisa-hipotesis, predecir si la hipotesis se deriva de la premisa (`entailment`) o no (`not_entailment`), agrupando todos los casos de no implicacion en una unica clase. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables, por otra parte, a un encoder de clasificacion). La evaluacion se realiza sobre el conjunto de test completo de PolNLI-kor, con 15.366 pares premisa-hipotesis y una longitud maxima de 256 tokens.

El aspecto metodologico mas destacable es la comparacion explicita entre dos estrategias de adaptacion al coreano: por un lado, la aproximacion con encoders preentrenados en coreano (KLUE-RoBERTa → NLI general coreano → PolNLI-kor) y, por otro, la transferencia directa del dominio politico (Political DEBATE → PolNLI-kor). El autor reporta que la segunda ruta rinde por debajo de la primera en agregado, pero con resultados heterogeneos por tarea.

## Capacidades

- Clasificacion de inferencia de lenguaje natural (NLI) binaria sobre pares premisa-hipotesis en coreano.
- Analisis de texto politico coreano: extraccion de eventos, deteccion de discurso de odio y toxicidad, deteccion de postura (stance detection) y clasificacion tematica.
- Produccion de probabilidades calibradas por clase (`P(entailment)`), con metricas de calibracion reportadas (Brier score 0,1015 y ECE 0,0727).
- Extraccion de representaciones de texto adecuadas para clasificacion descendente (ficha etiquetada para text-embeddings-inference).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio: es un encoder de clasificacion.
- Capacidad multilingue limitada al coreano segun la ficha; no se declaran otros idiomas.
- No dispone de modo de razonamiento explicito (thinking mode) ni de ventana de contexto extendida.

## Casos de uso

- Analisis de implicacion en discurso parlamentario: dado un fragmento de un debate o una proposicion de ley como premisa y una afirmacion resumida como hipotesis, el modelo determina si la afirmacion se sigue del texto original, util para verificar resumenes de intervenciones politicas.
- Deteccion de postura en redes sociales coreanas: clasificar si un mensaje apoya o no una posicion politica expresada en una premisa, aprovechando el rendimiento reportado de 0,8477 de weighted F1 en la tarea de stance detection.
- Moderacion de contenido y deteccion de toxicidad: el modelo alcanza 0,8867 de weighted F1 en la tarea de hate speech & toxicity, por lo que puede integrarse en pipelines de filtrado de comentarios en plataformas coreanas.
- Clasificacion tematica de documentos politicos: con 0,8998 de weighted F1 en topic classification (su tarea mas fuerte), es adecuado para etiquetar automaticamente articulos de prensa, comunicados o programas electorales por area tematica.
- Extraccion de eventos en textos informativos: la tarea de event extraction obtiene 0,8707 de weighted F1, lo que permite usar el modelo para validar si un evento descrito en una hipotesis aparece realmente en la noticia o documento fuente.
- Investigacion en adaptacion cross-lingue: sirve como punto de comparacion controlado frente a adaptaciones basadas en KLUE-RoBERTa para estudiar el efecto de transferir un modelo de dominio politico en ingles a otro idioma.
- Construccion de datasets etiquetados a gran escala: al proporcionar probabilidades calibradas, puede emplearse para preetiquetar pares premisa-hipotesis que despues se revisen manualmente, reduciendo el coste de anotacion.
- Analisis de coherencia interna de programas electorales: comprobar si las propuestas concretas (hipotesis) se derivan de los principios generales declarados (premisa) en documentos de partido.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test completo de PolNLI-kor (15.366 pares premisa-hipotesis):

| Metrica | Valor |
|---|---:|
| Accuracy | 0,8765 |
| Balanced accuracy | 0,8626 |
| Macro F1 | 0,8694 |
| Weighted F1 | 0,8750 |
| Weighted F1 IC 95% | [0,8697; 0,8803] |
| MCC | 0,7440 |
| AUROC | 0,9344 |
| AUPRC | 0,9264 |
| Brier score (menor mejor) | 0,1015 |
| ECE (menor mejor) | 0,0727 |
| N de test | 15.366 |

Comparacion con modelos alternativos evaluados en el mismo conjunto:

| Modelo | Weighted F1 | IC 95% |
|---|---:|---:|
| PolNLI-kor-RoBERTa-base | 0,9109 | [0,9062; 0,9155] |
| DEBATE-kor-base | 0,9000 | [0,8954; 0,9047] |
| PolNLI-kor-RoBERTa-large | 0,8946 | [0,8897; 0,8996] |
| DEBATE-kor-large | 0,8750 | [0,8697; 0,8803] |

Rendimiento desglosado por tarea:

| Tarea | N | Weighted F1 | Macro F1 | MCC |
|---|---:|---:|---:|---:|
| Event extraction | 2.864 | 0,8707 | 0,8704 | 0,7614 |
| Hate speech & toxicity | 3.002 | 0,8867 | 0,8284 | 0,6729 |
| Stance detection | 4.993 | 0,8477 | 0,8426 | 0,6855 |
| Topic classification | 4.507 | 0,8998 | 0,8971 | 0,7996 |

Comparacion pareada con PolNLI-kor-RoBERTa-base mediante test de McNemar con correccion de continuidad sobre los mismos 15.366 ejemplos:

| Resultado pareado | Recuento |
|---|---:|
| RoBERTa-base acierta / DEBATE-kor-large falla | 1.276 |
| DEBATE-kor-large acierta / RoBERTa-base falla | 739 |

| Estadistico | Valor |
|---|---:|
| McNemar chi-cuadrado | 142,58 |
| p-valor | 7,27 x 10^-33 |

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos calculados a partir de los 435 millones de parametros; el autor no publica cifras): aproximadamente 1,8 GB en FP32, 0,9 GB en FP16/BF16 y 0,5 GB en INT8.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 (12 GB), RTX 4070, RTX 4090, e incluso en GPUs con 4 GB o menos si se usa FP16.
- GPU de centro de datos (A100, H100, L40S, A10) sobredimensionadas para un modelo de este tamano; se usarian solo por agregacion de peticiones en lote.
- Es viable la inferencia en CPU para cargas de baja concurrencia, dado el reducido numero de parametros.
- Opciones de despliegue: transformers (`AutoModelForSequenceClassification`) de forma nativa; la ficha incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`, lo que indica compatibilidad con Hugging Face Inference Endpoints y TEI. Tambien es posible exportarlo a ONNX para servir con ONNX Runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota sobre el repositorio: el tamano de 10,4 GB es muy superior al peso del modelo en FP32 (unos 1,8 GB), lo que sugiere que el repositorio incluye artefactos adicionales de entrenamiento (por ejemplo, estados de optimizador o checkpoints intermedios).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Weighted F1 (PolNLI-kor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DEBATE-kor-large | 435 M | 256 tokens (evaluacion) | 0,8750 | no disponible | Hugging Face |
| PolNLI-kor-RoBERTa-base | no disponible (RoBERTa-base, ~125 M) | no disponible | 0,9109 | no disponible | Hugging Face |
| DEBATE-kor-base | no disponible (DeBERTa-base, ~140 M) | no disponible | 0,9000 | no disponible | Hugging Face |
| PolNLI-kor-RoBERTa-large | no disponible (RoBERTa-large, ~355 M) | no disponible | 0,8946 | no disponible | Hugging Face |

Los tres modelos alternativos son adaptaciones coreanas del mismo corpus PolNLI-kor evaluadas por el propio autor. La diferencia clave es la estrategia de inicializacion: los dos modelos RoBERTa parten de encoders preentrenados en coreano (KLUE-RoBERTa), mientras que DEBATE-kor-base y DEBATE-kor-large parten del checkpoint Political DEBATE en ingles. En agregado, las alternativas basadas en RoBERTa coreano superan al modelo descrito, aunque este destaca en clasificacion tematica.

## Limitaciones y advertencias

- Rendimiento agregado inferior al de las alternativas comparadas: weighted F1 de 0,8750 frente a 0,9109 de PolNLI-kor-RoBERTa-base, con una diferencia estadisticamente significativa segun el test de McNemar (p = 7,27 x 10^-33).
- La licencia no esta declarada en la ficha de Hugging Face ni en la model card. Antes de cualquier uso comercial es imprescindible contactar con el autor y verificar tambien la licencia del modelo base `mlburnham/Political_DEBATE_DeBERTa_large_v1.1` y del dataset PolNLI-kor.
- Modelo restringido al coreano: no se declaran capacidades en otros idiomas, por lo que su uso fuera del coreano no esta respaldado.
- Longitud de contexto de 256 tokens en evaluacion: los pares premisa-hipotesis que excedan esa longitud se truncan, con la consiguiente perdida de informacion.
- Riesgo de alucinacion no aplicable en el sentido generativo (no produce texto libre), pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, especialmente en deteccion de postura, la tarea con peor rendimiento (0,8477 de weighted F1).
- La calibracion no es perfecta: ECE de 0,0727 y Brier score de 0,1015 implican que las probabilidades no deben interpretarse como certezas absolutas sin recalibracion en el dominio de destino.
- Sesgos potenciales heredados del entrenamiento: al derivar de un corpus de discurso politico en ingles y de una traduccion automatica o adaptacion al coreano, pueden propagarse sesgos politicos y de traduccion del material original.
- Rendimiento heterogeneo por tarea: el autor advierte que el modelo puede ser util como componente en analisis de texto politico, pero su rendimiento debe validarse en nuevos dominios, generos o periodos temporales.
- El modelo es un encoder de clasificacion, no un generador: no puede emplearse para tareas de generacion, dialogo, agentes ni razonamiento multi-paso.
- La fecha de creacion registrada (2026-09-27) y el bajo numero de descargas (0) sugieren un modelo muy reciente y con escasa validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jongrock17/DEBATE-kor-large
- Modelo base: https://huggingface.co/mlburnham/Political_DEBATE_DeBERTa_large_v1.1
- Dataset de adaptacion: https://huggingface.co/datasets/jongrock17/PolNLI-kor
- Coleccion DEBATE-kor: https://huggingface.co/collections/jongrock17/debate-kor
- Paper de referencia DEBATE (benchmark de agentes LLM en debate multi-agente, contexto relacionado): https://arxiv.org/html/2510.25110v1
