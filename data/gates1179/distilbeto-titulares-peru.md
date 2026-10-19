# gates1179/distilbeto-titulares-peru

## Resumen

`gates1179/distilbeto-titulares-peru` es un clasificador de texto en castellano obtenido por fine-tuning del modelo `dccuchile/distilbert-base-spanish-uncased` (DistilBERT en espanol, destilado de BETO). Su tarea es asignar titulares de prensa peruana a una de cuatro categorias cerradas: `politica`, `economia`, `deportes` y `ciencia_tecnologia`. El modelo lo publica el usuario `gates1179` como proyecto academico del curso de Ciencia de Datos con Python (QLAB / UP 2026-II), y se ha entrenado sobre 268 titulares de El Comercio publicados entre el 6 y el 18 de octubre de 2026.

Tecnicamente es un modelo pequeno: 67.325.188 parametros en formato safetensors (unos 0,3 GB de repositorio), lo que lo situa en la franja de modelos encoder-only que se pueden ejecutar en CPU o en cualquier GPU de consumo. Su interes practico no esta en la capacidad generativa (no la tiene), sino en servir como ejemplo reproducible de un pipeline de clasificacion de medios con etiquetado asistido por LLM y validacion humana parcial: las etiquetas del conjunto de entrenamiento fueron asignadas por Claude Opus 5.5 y solo 20 casos fueron auditados manualmente, con acuerdo en los 20.

El resultado declarado por el autor es un F1 macro de 0,929 sobre un conjunto de test de 58 titulares. Es una cifra alta, pero hay que leerla con cautela: el test es muy pequeno, el corpus proviene de un unico medio y de una ventana de 13 dias, y el esquema de cuatro categorias no siempre es mutuamente excluyente. La licencia no esta declarada en el repositorio, lo que bloquea de facto su uso comercial sin aclaracion previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo DistilBERT (modelo destilado de BETO), con cabeza de clasificacion de 4 etiquetas |
| Parametros totales | 67.325.188 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base DistilBERT admite secuencias de hasta 512 tokens; el autor no documenta la longitud configurada) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | Castellano (`es`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | `text-classification` |
| Etiquetas de salida | `politica`, `economia`, `deportes`, `ciencia_tecnologia` |
| Modelo base | `dccuchile/distilbert-base-spanish-uncased` |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-19 |
| Ultima actualizacion | 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder-only de tipo DistilBERT, es decir, una version destilada de BETO (BERT entrenado sobre corpus en espanol) con vocabulario *uncased*. Sobre ese backbone se anade una cabeza de clasificacion lineal con cuatro salidas, y se hace fine-tuning supervisado de clasificacion de secuencias. El autor no documenta hiperparametros de entrenamiento (learning rate, numero de epocas, batch size, semilla, split train/validation) ni la longitud maxima de secuencia utilizada, por lo que estos datos deben considerarse no disponibles.

Los datos de entrenamiento son 268 titulares de El Comercio (Peru) publicados entre el 06/10/2026 y el 18/10/2026. Las etiquetas no son anotacion humana directa: fueron asignadas por un LLM (Claude Opus 5.5) a partir del texto del titular, y despues se hizo una auditoria humana de 20 casos con acuerdo en 20 de ellos. Este esquema de etiquetado debil (weak supervision) es rapido y barato, pero hereda los sesgos y errores sistematicos del modelo anotador, y la auditoria del 7,5 % de la muestra no permite estimar con rigor la tasa real de error de las etiquetas. No se menciona el uso de RLHF, DPO ni ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.), algo esperable en un encoder de clasificacion.

## Capacidades

- Clasificacion de texto corto en castellano: asigna un titular a una de las cuatro categorias definidas (`politica`, `economia`, `deportes`, `ciencia_tecnologia`).
- Especializacion en registro periodistico peruano: el vocabulario y las entidades del corpus de entrenamiento son de prensa de Peru.
- Inferencia muy rapida y de bajo coste: 67 millones de parametros permiten procesar lotes grandes en CPU o en GPU modesta.
- Salida de probabilidades por clase (comportamiento estandar de `text-classification` en Transformers), lo que permite umbralizar o aplicar abstenccion cuando la confianza es baja.
- No soporta generacion de texto, razonamiento multi-paso, tool calling ni function calling.
- No tiene capacidades multimodales (ni vision ni audio).
- No dispone de modo *thinking* ni de razonamiento explicito.
- Cobertura multilingue limitada al castellano; no se ha evaluado su comportamiento en otras lenguas ni en variantes no peruanas.

## Casos de uso

- **Enrutamiento de noticias en una redaccion digital**: al recibir un titular por el CMS o por un feed RSS, el modelo predice la seccion y permite asignarlo automaticamente a la cola del editor correspondiente. Es adecuado por su latencia baja y porque la tarea es exactamente la que se entreno.
- **Monitorizacion de agenda mediatica**: procesar por lotes los titulares diarios de un medio y construir series temporales de volumen por categoria (cuanto se habla de economia frente a deportes en una semana). Con 67 millones de parametros se pueden clasificar miles de titulares por minuto en una sola CPU.
- **Etiquetado previo de corpus academicos**: usar el modelo como primer pasada para pre-anotar un corpus de noticias peruanas y reducir el trabajo de anotacion humana, revisando despues solo los casos de baja confianza.
- **Filtrado y alertas tematicas**: descartar o priorizar titulares dentro de un pipeline de alertas (por ejemplo, enviar solo los de `economia` a un analista de mercados), usando el score de la clase como criterio de corte.
- **Enriquecimiento de datasets para analitica de medios**: anadir una columna de categoria a una base de datos de titulares historicos antes de hacer analisis de tendencias o estudios de encuadre.
- **Prototipado docente y pruebas de concepto**: servir de ejemplo completo y reproducible (modelo base abierto, fine-tuning, evaluacion con F1 macro) en cursos de ciencia de datos o de NLP en espanol, sin necesidad de infraestructura GPU.
- **Comparacion de clasificadores**: actuar como linea base ligera frente a modelos mayores (BETO completo, mDeBERTa) en experimentos de destilacion o de reduccion de coste de inferencia.

## Benchmarks y rendimiento

Unico dato publicado por el autor:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| F1 macro | 0,929 | Test de 58 titulares (El Comercio, 06/10/2026 - 18/10/2026) |
| Acuerdo en auditoria de etiquetas | 20/20 casos | Muestra de 20 titulares anotados manualmente |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no aplican a un modelo encoder de clasificacion. Tampoco se publican F1 por clase, matriz de confusion, precision/recall individuales ni resultados de validacion cruzada, datos necesarios para valorar si el 0,929 es estable o refleja una clase mayoritaria.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 0,27 GB en fp32 y unos 0,14 GB en fp16, calculados a partir de los 67,3 millones de parametros. Es una estimacion, no un dato publicado.
- **GPU recomendadas**: practicamente cualquier GPU sirve. Una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo; una GTX 1650, T4 o incluso una iGPU reciente es suficiente.
- **CPU**: cabe sin problema en CPU. El coste dominante no es el modelo sino el tokenizador y el preprocesado del texto.
- **Consumer GPU**: si, cabe en cualquier GPU de consumo con mas de 1 GB de memoria, y tambien en entornos sin GPU.
- **Opciones de despliegue**: `transformers` con `pipeline("text-classification")`, `onnxruntime` tras exportacion a ONNX, `text-embeddings-inference`/`TEI` o `vLLM` no son la via natural para un encoder de 67 M (vLLM esta orientado a generacion); para servicio HTTP ligero conviene FastAPI + `transformers` u ONNX Runtime, y para lotes masivos, Inferencia en CPU con `optimum`.
- **Latencia y throughput**: no disponibles como medicion publicada. Por tamano, es esperable un throughput de miles de titulares por segundo en GPU y de cientos por segundo en CPU moderna, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gates1179/distilbeto-titulares-peru` | 67,3 M | No disponible (base: 512 tokens) | Clasificacion en 4 categorias de titulares peruanos | No disponible | HuggingFace, 0 descargas |
| `dccuchile/distilbert-base-spanish-uncased` | ~67 M (modelo base) | 512 tokens | Modelo de representacion (requiere fine-tuning) | No verificada en esta ficha | HuggingFace |
| `dccuchile/bert-base-spanish-wwm-uncased` (BETO) | ~110 M (referencia publica) | 512 tokens | Modelo de representacion en espanol | No verificada en esta ficha | HuggingFace |
| Clasificador zero-shot generico (p. ej. un LLM de instrucciones) | Miles de millones | Mayor | Clasificacion por prompt | Variable | Variable |

No hay datos de benchmarks publicados para los modelos comparables en la informacion disponible, por lo que no se puede establecer una comparacion cuantitativa de rendimiento. Las cifras de parametros de los modelos base son valores de referencia publicos y no se han verificado en el repositorio de este modelo.

## Limitaciones y advertencias

- **Corpus minimo y homogeneo**: 268 titulares de entrenamiento, un unico medio (El Comercio) y una ventana de 13 dias. La generalizacion a otros medios peruanos, a otros paises o a otros periodos temporales no esta demostrada.
- **Etiquetas generadas por LLM**: el ruido de anotacion del modelo profesor (Claude Opus 5.5) se propaga al clasificador. La auditoria humana cubre solo 20 de 268 ejemplos (7,5 %), insuficiente para estimar la calidad real de las etiquetas.
- **Categorias no excluyentes**: el propio autor advierte que las cuatro clases no siempre son mutuamente exclusivas; un titular de economia politica o de politica cientifica puede quedar mal etiquetado, y el modelo forzara siempre una unica clase.
- **Test muy pequeno**: 58 ejemplos hacen que el F1 macro de 0,929 tenga un intervalo de confianza amplio; no se publican metricas por clase ni matriz de confusion.
- **Riesgo de deriva temporal**: al entrenarse en una ventana corta, vocabulario y entidades nuevas (nuevos cargos, partidos, empresas) pueden degradar el rendimiento rapidamente.
- **Sesgos editoriales heredados**: la seleccion y el encuadre de titulares de un unico medio pueden introducir sesgos de agenda que el clasificador aprende como senal.
- **Licencia no disponible**: sin licencia declarada no hay autorizacion explicita de uso comercial; es un bloqueo importante para cualquier despliegue en produccion.
- **Alcance limitado a titulares**: no se ha evaluado con cuerpos de texto largos, y la longitud maxima de secuencia configurada no esta documentada.
- **Sin senal de mantenimiento**: 0 descargas y 0 likes en el momento de la consulta, sin historial de actualizaciones mas alla de la creacion del repositorio.
- **Alucinacion**: no aplica en el sentido generativo (el modelo no produce texto libre), pero si puede producir clasificaciones con alta confianza y incorrectas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gates1179/distilbeto-titulares-peru
- Modelo base: https://huggingface.co/dccuchile/distilbert-base-spanish-uncased
- Repositorio BETO (referencia del backbone en espanol): https://github.com/dccuchile/beto
- Paper de BETO: https://arxiv.org/abs/2107.07253
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente resultados no relacionados sobre Zotero).
