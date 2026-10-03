# dhresearch/quality-router-v2-conservative

## Resumen

`dhresearch/quality-router-v2-conservative` es un clasificador de enrutamiento (router) entrenado para decidir a qué interfaz o nivel de calidad derivar una petición dentro de un sistema con múltiples modelos LLM. No es un modelo generativo: es un artefacto de aprendizaje supervisado serializado con joblib, etiquetado por su autor con las etiquetas `sklearn`, `joblib` y `llm-routing`, y entrenado sobre el dataset `dhresearch/outcome-router-v2-main`. Su función es actuar como router conservador con umbrales por interfaz, es decir, aplicar criterios específicos para cada interfaz de destino en lugar de un umbral global.

El artefacto publicado es un refit con semilla 0 realizado el 2026-10-03. Según la model card, la ejecución original de entrenamiento escribió predicciones pero no guardó los pesos, por lo que este upload es un reajuste posterior y no el fichero de pesos original. El informe congelado registra `resolved_model` como `lgbm`, lo que apunta a LightGBM como implementación del clasificador subyacente, aunque el repositorio se etiqueta como `sklearn`.

Es relevante en el contexto de la optimización de costes y latencia en sistemas multi-modelo: un router aprendido permite enviar consultas sencillas a modelos baratos y reservar los modelos caros para casos que realmente lo requieren. En este caso concreto hay un matiz importante: la model card indica que el flujo servido no llama a este objeto y que `quality_router_v2` versión 8 desactiva `learned_downrouting`, por lo que este fichero es un artefacto de estudio más que un componente activo en producción. El repositorio declara 0 descargas y 0 likes, y un tamaño de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de enrutamiento entrenado con LightGBM (`resolved_model` = `lgbm` segun el informe congelado); serializado con joblib. No es un transformer ni un modelo generativo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (es un clasificador tabular, no procesa secuencias de texto de forma autoregresiva) |
| Tipos de cuantizacion | no aplica / no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin detalle de terminos en la informacion disponible) |
| Formato de pesos | joblib (pickle serializado con joblib); requiere `outcome_router_data` y `lightgbm` importables para deserializar |

Datos adicionales del repositorio: identificador `dhresearch/quality-router-v2-conservative`, autor `dhresearch`, libreria declarada `sklearn`, tamano del repositorio 0.0 GB, creado y actualizado el 2026-10-03, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

El objeto es un router conservador con umbrales por interfaz (`--router conservative --per-interface`), ajustado unicamente sobre la exportacion principal del dataset `dhresearch/outcome-router-v2-main`. La clase publicada se denomina `ConservativeRouter`. El informe congelado registra `resolved_model` como `lgbm`, lo que sugiere un modelo de gradient boosting de LightGBM como clasificador subyacente, pese a que la libreria declarada en HuggingFace sea `sklearn`.

El entrenamiento se realizo con semilla 0 y un entorno software declarado: python 3.14.2, sklearn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0 y scipy 1.18.1. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset, el numero de caracteristicas de entrada, el numero de clases de salida ni si hubo etapas de RLHF o DPO (no aplicables en un clasificador de este tipo). La model card indica explicitamente que los ajustes conservadores sobre v2-plus-synthetic y synthetic-only son ejecuciones distintas y no forman parte de este upload.

Como validacion, la model card reporta una comparacion contra el fichero congelado `data/real_v2/preds_v2_conservative.jsonl`: `predicted_route` coincide en 250 de 250 filas de test compartidas (tasa 1.000000), y la coincidencia de fila completa, incluidas probabilidades redondeadas y etiquetas, tambien es de 250 de 250, sin claves discrepantes. Se trata de una comprobacion de reproducibilidad del refit frente a las predicciones originales, no de una evaluacion de rendimiento frente a un ground truth independiente.

## Capacidades

- Clasificacion de enrutamiento: dado un caso de entrada, predice la ruta o interfaz de destino (`predicted_route`).
- Umbrales por interfaz: aplica criterios de decision diferenciados para cada interfaz en lugar de un unico umbral global.
- Comportamiento conservador: por diseno, reduce la probabilidad de derivar trafico hacia opciones de menor calidad o mas economicas cuando la senal no es suficientemente clara.
- Salida con probabilidades: el formato de prediccion incluye probabilidades y etiquetas (la validacion de fila completa compara ambos).
- Serializacion portable: el modelo se puede cargar con joblib desde Python siempre que `outcome_router_data` y `lightgbm` sean importables.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues: no es un modelo generativo ni un modelo de lenguaje.
- No hay informacion disponible sobre soporte de agentes o razonamiento multi-paso.

## Casos de uso

- Enrutamiento coste-calidad en produccion: el router recibe las caracteristicas de una consulta y decide si se atiende con un modelo barato o con uno de mayor capacidad, reduciendo el gasto medio por peticion. El enfoque conservador minimiza el riesgo de enviar casos dificiles a un modelo inferior.
- Umbrales diferenciados por interfaz: cuando el sistema expone varias interfaces con perfiles de trafico distintos (por ejemplo, chat abierto frente a una API interna), los umbrales por interfaz permiten calibrar cada una por separado en lugar de comprometer un unico punto de corte.
- Cascada de modelos: uso como primera etapa de una cascada, derivando solo los casos dudosos al modelo grande y resolviendo el resto en el nivel inferior.
- Analisis offline de politicas de enrutamiento: cargar el artefacto con joblib y evaluar sobre lotes historicos que proporcion de trafico se habria desviado y con que probabilidad, antes de activar cualquier cambio en produccion.
- Reproduccion de estudios internos: el fichero sirve como referencia de refit reproducible (semilla 0) para comparar contra `preds_v2_conservative.jsonl` y verificar que un reentrenamiento produce las mismas rutas.
- Control de gasto en picos de trafico: ante un aumento de carga, el router conservador permite mantener un porcentaje acotado de peticiones en el modelo de mayor coste en lugar de degradar todas las respuestas.
- Investigacion sobre enrutamiento aprendido: como artefacto de un estudio de routers, es util para analizar la diferencia entre enrutamiento aprendido y el enrutamiento desactivado (`learned_downrouting = false`) de la version 8 de `quality_router_v2`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un clasificador de enrutamiento. El unico dato de rendimiento reportado es la comprobacion de acuerdo con el fichero de predicciones congelado:

| Comprobacion | Resultado |
|---|---|
| Coincidencia de `predicted_route` (filas de test compartidas) | 250 de 250 (tasa 1.000000) |
| Coincidencia de fila completa (probabilidades redondeadas y etiquetas) | 250 de 250 |
| Claves discrepantes | ninguna (`{}`) |
| Semilla del refit | 0 |

Este resultado mide reproducibilidad respecto a las predicciones de la ejecucion original, no calidad de enrutamiento frente a una referencia externa. No hay datos de precision, recall, F1, AUC ni matriz de confusion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula. Es un modelo de gradient boosting tabular serializado con joblib, con un repositorio declarado de 0.0 GB.
- GPU recomendadas: no se requiere GPU. Inferencia en CPU.
- Compatibilidad con GPU de consumo: no aplica; no necesita GPU dedicada. Cualquier CPU moderna es suficiente.
- Opciones de despliegue: carga directa en Python con `joblib` (deserializacion tipo pickle), siempre que los modulos `outcome_router_data` y `lightgbm` esten importables en el entorno. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles. Para modelos LightGBM tabulares la inferencia suele ser de microsegundos a pocos milisegundos por muestra en CPU, pero no hay cifras publicadas para este artefacto concreto y no deben asumirse.
- Dependencias de entorno declaradas en el refit: python 3.14.2, sklearn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0, scipy 1.18.1. Desplegar con versiones muy distintas puede afectar a la deserializacion.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada, por lo que no se puede elaborar una comparativa con cifras. Cualitativamente, este artefacto pertenece a la categoria de routers de LLM aprendidos, en la que existen alternativas conocidas como RouteLLM, Semantic Router o enfoques de cascada tipo FrugalGPT, pero no se han proporcionado especificaciones, metricas ni condiciones de licencia de esas alternativas en esta busqueda.

| Aspecto | quality-router-v2-conservative | Alternativas de la categoria |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | no aplica (clasificador tabular) | no disponible |
| Rendimiento | solo acuerdo 250/250 con predicciones congeladas | no disponible |
| Licencia | other (terminos no detallados) | no disponible |
| Disponibilidad | HuggingFace, 0 descargas | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde consultas. Solo produce una decision de enrutamiento a partir de caracteristicas de entrada.
- El artefacto no esta activo en el flujo servido: la model card indica que el flujo servido no llama a este objeto y que `quality_router_v2` version 8 deja `learned_downrouting` en falso. No debe asumirse que su inclusion en el repositorio implica uso en produccion.
- No es el fichero de pesos original: la ejecucion original no guardo pesos y este upload es un refit con semilla 0. Puede haber diferencias no capturadas por la comprobacion de acuerdo.
- La validacion de 250/250 mide coincidencia con las predicciones de la ejecucion original, no calidad de las decisiones de enrutamiento. No hay evaluacion contra un ground truth independiente ni metricas de clasificacion publicadas.
- Acoplamiento de entorno: la carga requiere que `outcome_router_data` y `lightgbm` sean importables, lo que implica dependencia de codigo y datos externos al repositorio del modelo.
- Licencia `other` sin terminos detallados: no hay informacion disponible sobre si se permite uso comercial, redistribucion o modificacion. Debe consultarse con el autor antes de cualquier uso en produccion.
- Sesgos conocidos: no disponibles. Al entrenarse sobre la exportacion principal de un unico dataset, las decisiones heredaran los sesgos de distribucion de ese dataset, pero no se documentan.
- Riesgo de deriva: un router aprendido puede degradarse si la distribucion de trafico en produccion se aleja de la del dataset de entrenamiento. No hay datos publicados sobre monitorizacion ni recalibracion.
- Idiomas soportados: no disponibles.
- Sin garantias de soporte: 0 descargas, 0 likes y actualizacion unica el mismo dia de creacion sugieren un artefacto de investigacion sin mantenimiento declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-conservative
- Dataset de entrenamiento: https://huggingface.co/datasets/dhresearch/outcome-router-v2-main

No se han encontrado en la busqueda web enlaces relevantes al modelo, al autor ni al estudio asociado; los resultados devueltos corresponden a entidades no relacionadas con este artefacto.
