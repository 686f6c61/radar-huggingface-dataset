# ArinRoths/2026-24679-pokemoncard-rarity-classifier-hw2Pt1

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un clasificador tabular binario entrenado con AutoGluon Tabular. Su tarea es predecir si una carta de Pokémon es común (etiqueta 0) o rara (etiqueta 1) a partir de características tabulares de la carta, no de su imagen. El autor es ArinRoths y el modelo se publicó el 22 de septiembre de 2026 como entrega del trabajo de la asignatura 24-679 (AutoML) de la Universidad Carnegie Mellon.

El entrenamiento se realizó sobre el dataset Pokémon 151 en formato tabular (pakiino/2026-24679-pokemon-151-tabular-hw1), con un límite de 300 segundos de cómputo y el preset medium_quality de AutoGluon. El mejor modelo seleccionado por el framework fue un WeightedEnsemble_L2, es decir, un ensemble apilado con validación de stacker y bagging de pliegues, optimizado para balanced accuracy. Los splits originales de entrenamiento y validación se combinaron y reestratificaron, y se incorporaron ejemplos aumentados al conjunto de entrenamiento solo cuando su etiqueta binaria de rareza coincidía con la de la carta original.

La relevancia de esta ficha es limitada pero ilustrativa: sirve como ejemplo reproducible de un pipeline AutoML completo (selección automática de modelos, apilamiento, métrica balanceada en un problema desbalanceado) aplicado a un dominio muy concreto como el coleccionismo de cartas TCG. Conviene subrayar que la evaluación se hizo sobre únicamente 5 cartas originales retenidas, por lo que las métricas publicadas no deben extrapolarse a otros sets de cartas ni a producción real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble tabular generado por AutoGluon Tabular; mejor modelo: WeightedEnsemble_L2 (apilamiento con validación de stacker y bagging de pliegues) |
| Parámetros totales | no disponible (no aplicable en el sentido de redes neuronales; se trata de un ensemble de modelos tabulares) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin entrada secuencial) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no aplica (clasificación sobre variables tabulares, sin texto libre) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la información proporcionada; al ser un artefacto de AutoGluon se espera un predictor serializado propio del framework, no safetensors ni GGUF |
| Tarea | Clasificación binaria (Common = 0, Rare = 1) |
| Métrica de evaluación | Balanced accuracy |
| Dataset de entrenamiento | pakiino/2026-24679-pokemon-151-tabular-hw1 |
| Preset de AutoGluon | medium_quality |
| Límite de tiempo de entrenamiento | 300 segundos |
| Tamaño del repositorio | 0,0 GB (según la información de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no es una red neuronal ni un transformer: es un ensemble tabular construido automáticamente por AutoGluon Tabular. El framework explora combinaciones de modelos base (habitualmente árboles potenciados y otros aprendices tabulares), y el resultado seleccionado fue un WeightedEnsemble_L2, la segunda capa de apilamiento del framework. La configuración registrada incluye `use_orig_features: false`, `valid_stacker: true`, `max_base_models: 0`, `save_bag_folds: true`, `stratify: auto`, `bin: auto` y `model_random_seed: 0`. El parámetro `max_base_models: 0` desactiva el límite explícito al número de modelos base, dejando que el proceso de selección dependa del presupuesto temporal de 300 segundos.

En cuanto a los datos, se partió del dataset tabular Pokémon 151. Los conjuntos originales de entrenamiento y validación se combinaron y se reestratificaron para generar nuevos splits de entrenamiento y validación. Se añadieron ejemplos aumentados únicamente cuando su etiqueta binaria de rareza coincidía con la de su carta padre, lo que evita introducir ruido de etiqueta en la clase minoritaria. El conjunto de test original se mantuvo intacto, y la evaluación final se realizó sobre 5 cartas retenidas. No se documenta ningún proceso de ajuste por refuerzo, RLHF ni DPO, ya que no aplica a este tipo de modelo.

## Capacidades

- Clasificación binaria de rareza: distingue entre carta común (0) y carta rara (1) a partir de variables tabulares.
- Selección automática de modelo: el artefacto incorpora la decisión de AutoGluon sobre qué ensemble es mejor según balanced accuracy.
- Manejo de desbalanceo de clases: la optimización se realizó con balanced accuracy, adecuada cuando una clase es minoritaria.
- Aumento de datos supervisado por consistencia de etiqueta: solo se incorporan ejemplos aumentados cuya etiqueta coincide con la carta padre.
- Inferencia por lotes: al ser un modelo tabular serializado, admite predicción sobre tablas completas de una vez.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, de audio ni modo de razonamiento extendido.
- No genera texto: su salida es una etiqueta de clase y, opcionalmente, una probabilidad.

## Casos de uso

- Gestión de inventario en tiendas de cartas TCG: dado un catálogo tabular con las características ya extraídas de cada carta, el modelo puede etiquetar automáticamente la rareza y reducir el trabajo manual de catalogación. Es adecuado porque la inferencia tabular es muy barata en CPU y no requiere infraestructura de GPU.
- Triaje en marketplaces de segunda mano: un vendedor introduce las características de una carta y el sistema propone una categoría de rareza antes de la revisión humana. Funciona como primera pasada, nunca como decisión final, dado el tamaño reducido del conjunto de evaluación.
- Filtrado previo en pipelines de subasta: el clasificador puede separar lotes en dos colas (revisión estándar y revisión prioritaria) para que los tasadores dediquen más tiempo a las piezas potencialmente raras.
- Etiquetado asistido en aplicaciones de coleccionistas: la app sugiere la rareza al registrar una carta y el usuario confirma o corrige, generando datos de mejora continua.
- Componente de un sistema de precios o recomendación: la rareza predicha puede usarse como variable de entrada en un modelo posterior de valoración o de recomendación de compra, siempre con revisión humana.
- Módulo de práctica en docencia de AutoML: el repositorio documenta el pipeline completo (splits, preset, métrica, hiperparámetros del ensemble), lo que lo hace útil como ejemplo reproducible en cursos de aprendizaje automático.
- Prueba de concepto de integración de AutoGluon en producción: permite medir el coste de serializar, cargar y servir un predictor de AutoGluon antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Los únicos resultados publicados son los de la model card, medidos sobre 5 cartas originales retenidas. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no son comparables con benchmarks de modelos de lenguaje.

| Modelo | Accuracy | Balanced accuracy | Precisión (rarity) | Recall (rarity) | F1 (rarity) |
|---|---|---|---|---|---|
| Modelo seleccionado (WeightedEnsemble_L2) | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 |
| Baseline de mayoría en entrenamiento | 0,4 | 0,5 | 0,0 | 0,0 | 0,0 |

El autor advierte explícitamente que el conjunto de test es muy pequeño y que estos resultados pueden no generalizar a otros sets de cartas. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo tabular con ensemble, no requiere GPU para inferencia; el consumo relevante es memoria RAM del proceso.
- GPU recomendadas: no aplica. No hay evidencia de que el modelo se haya entrenado o se sirva en GPU; AutoGluon Tabular puede usar CPU y, opcionalmente, GPU para algunos aprendices base.
- Compatibilidad con GPU de consumo: no aplica; no necesita GPU dedicada.
- Opciones de despliegue: carga del predictor de AutoGluon en un proceso Python, servicio REST o gRPC propio alrededor del predictor, o inferencia por lotes sobre ficheros tabulares. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no aplican aquí.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de filas por segundo.
- Tamaño del artefacto: el repositorio figura con 0,0 GB, dato que no permite estimar el tamaño real de los pesos serializados.

## Comparativa con modelos similares

No se conocen modelos públicos comparables con resultados publicados para esta tarea concreta (clasificación binaria de rareza de cartas Pokémon 151 a partir de variables tabulares). La comparación se plantea, por tanto, a nivel de enfoque alternativo, sin cifras de rendimiento verificables.

| Alternativa | Tipo | Contexto de entrada | Licencia | Disponibilidad | Rendimiento comparable |
|---|---|---|---|---|---|
| Este modelo (WeightedEnsemble_L2 de AutoGluon) | Ensemble tabular apilado | Tabla de características | no disponible | HuggingFace, 0 descargas | 1,0 de balanced accuracy en 5 cartas |
| AutoGluon Tabular con preset best_quality | Ensemble tabular apilado | Tabla de características | Apache 2.0 (licencia del framework) | Público | No disponible |
| Gradient boosting (XGBoost / LightGBM) ajustado a mano | Árboles potenciados | Tabla de características | Apache 2.0 / MIT | Público | No disponible |
| Regresión logística con ingeniería de variables | Modelo lineal | Tabla de características | BSD | Público | No disponible |

El framework AutoGluon sí es directamente comparable en cuanto a enfoque, pero no se han publicado resultados de este modelo frente a esas alternativas sobre el mismo conjunto de test.

## Limitaciones y advertencias

- Evaluación estadísticamente no concluyente: el test consta de 5 cartas originales. Un acierto o un fallo mueve la accuracy en 0,2, por lo que las métricas perfectas publicadas no permiten inferir rendimiento real.
- Riesgo de sobreajuste al dataset Pokémon 151: no hay evidencia de que el modelo generalice a otros sets, expansiones o reediciones de cartas.
- Sesgo de selección del dataset: la composición real de clases y la distribución de características no se detallan en la información disponible, más allá de que se aplicó estratificación y balanced accuracy como métrica.
- Dependencia del preprocesado: el modelo consume variables tabulares ya extraídas; no procesa imágenes de cartas. Un cambio en el esquema de variables invalida el artefacto.
- Licencia no disponible: no se especifica licencia en la model card ni en los metadatos de HuggingFace, por lo que no puede asumirse permiso para uso comercial. Es un riesgo legal relevante para cualquier despliegue en producción.
- Propósito declarado académico: el propio autor indica que se desarrolló para el trabajo de la asignatura 24-679 de CMU, para demostrar clasificación binaria y selección automática de modelos, no para uso operativo.
- Uso de IA generativa en la documentación: la model card indica que se usó ChatGPT para redactar el metacard y para depuración, lo que no invalida el modelo pero sí aconseja verificar la documentación frente al código.
- Trazabilidad limitada: con 0 descargas y 0 likes, no hay evidencia de uso externo ni de validación independiente.
- Ausencia de versionado de datos: no se documenta una versión fija del dataset ni un hash de los splits, lo que dificulta reproducir exactamente los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArinRoths/2026-24679-pokemoncard-rarity-classifier-hw2Pt1
- Dataset de entrenamiento: https://huggingface.co/datasets/pakiino/2026-24679-pokemon-151-tabular-hw1
- Referencia general del framework AutoGluon (no procedente de la búsqueda web): https://auto.gluon.ai
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo: los resultados obtenidos correspondían a páginas de ayuda del Traductor de Google y no guardan relación con el modelo. No se dispone de paper, blog, repositorio de código ni demo asociados.
