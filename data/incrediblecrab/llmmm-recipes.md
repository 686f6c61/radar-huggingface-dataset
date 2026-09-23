# incrediblecrab/llmmm-recipes

## Resumen

llmmm-recipes es un modelo de 1.515.006 parámetros desarrollado por el usuario incrediblecrab, entrenado desde cero (sin inicialización a partir de ningún checkpoint preentrenado) sobre 4.653.430 registros canónicos de recetas. Su tarea principal es la compleción de ingredientes: dado un conjunto de nombres de ingredientes, predice cuáles faltan. No genera instrucciones de cocina ni escribe recetas nuevas.

El modelo se complementa con un buscador de recetas con restricciones y unas políticas de ranking de 705 parámetros, que permiten recuperar recetas existentes filtrando por tiempo total máximo, ingredientes obligatorios o excluidos, límite de ingredientes faltantes, raciones y código de idioma de origen. La arquitectura se etiqueta como set-transformer, lo que encaja con una entrada tratada como conjunto y no como secuencia.

Es relevante ahora por su enfoque de dominio muy acotado, su tamaño mínimo (menos de 6 MiB en fp32) y su pipeline medido de forma explícita: recuperación del conjunto fuente en el top-5 del 83,5 % sobre 200 consultas de test, con una mediana de 0,43 s por solicitud. La model card es inusualmente detallada en la descripción de límites, métricas de cobertura y advertencias, aunque no declara licencia, idiomas soportados ni pipeline de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | set-transformer (modelo de predicción sobre conjuntos); políticas de ranking separadas de 705 parámetros |
| Parámetros totales | 1.515.006 (modelo de ingredientes); 705 en las políticas de ranking |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se documentan pesos en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (el buscador acepta un código de idioma de origen opcional, pero no se enumeran idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería PyTorch, `pytorch_model_hub_mixin`) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 77 / 1 |
| Fecha de creación / actualización | 2026-09-09 / 2026-09-23 |
| Revisión documentada para búsqueda | `v0.4.0-recipe-search` |

## Arquitectura y entrenamiento

El modelo de ingredientes es un set-transformer entrenado desde cero: sus pesos y sesgos se inicializaron aleatoriamente, sin usar ningún checkpoint preentrenado. El entrenamiento se realizó sobre la totalidad de los 4.653.430 registros canónicos de recetas, con 3 épocas completadas, 13.960.290 presentaciones de recetas acumuladas, 36.707.624 slots de ingredientes procesados por época y 27.267 pasos de optimizador. La model card referencia el paper `arxiv:1706.03762` (Attention is all you need) entre sus etiquetas, lo que apunta a un núcleo de atención tipo transformer, y `arxiv:2605.22391` como referencia adicional del trabajo.

Las políticas de ranking (705 parámetros) también se inicializaron desde cero y siguen un protocolo en dos etapas: primero aprendizaje supervisado listwise y después REINFORCE sobre acciones muestreadas, con regularización por entropía y una penalización KL respecto a la política supervisada. Cada etapa usó los 4.653.430 registros canónicos, generando 9.306.860 consultas de entrenamiento y 18.613.720 acciones de refuerzo muestreadas. La recompensa es la recuperación del conjunto canónico de ingredientes de la fuente, no retroalimentación humana. La política `supervised` es la predeterminada; REINFORCE no estableció una ganancia adicional emparejada en validación y una solicitud de validación de RL agotó el tiempo de espera sin que se aislara la causa.

## Capacidades

- Compleción de ingredientes: predice ingredientes ausentes a partir de un conjunto de nombres canónicos.
- Recuperación de recetas con restricciones: acepta ingredientes canónicos, tiempo total máximo reportado por la fuente, ingredientes obligatorios y excluidos, límite de ingredientes faltantes, raciones y un código de idioma de origen opcional.
- Ranking de candidatos: hasta 2.000 candidatos preseleccionados por una línea base reciben puntuaciones aprendidas.
- Recuperación acotada: informa explícitamente cuando se alcanza el presupuesto de lista corta o de escaneo, sin fallback silencioso entre ranking aprendido y heurístico.
- Metadatos de salida: los registros devueltos incluyen ingredientes de origen, valores de cantidad separados, instrucciones y advertencias.
- No genera instrucciones de cocina.
- No escribe recetas nuevas: solo recupera recetas existentes.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible.

## Casos de uso

- Compleción de listas de ingredientes: dado un conjunto parcial como `["chicken", "rice", "broccoli"]`, el modelo propone los ingredientes que faltan, útil para normalizar listas incompletas antes de indexarlas.
- Búsqueda de recetas por despensa disponible: el buscador devuelve recetas existentes que encajan con los ingredientes canónicos introducidos, limitando el número de ingredientes faltantes con `max_missing`.
- Filtrado por tiempo de preparación: usando `max_total_minutes`, se descartan las recetas cuyo tiempo total reportado supera el umbral indicado; conviene tener en cuenta que solo 681.275 de los 4.653.430 registros tienen tiempo total conocido.
- Restricciones dietéticas o de disponibilidad: los parámetros `must_use` y de exclusión permiten exigir ingredientes concretos o descartar recetas que los contengan, por ejemplo para evitar un producto no disponible en una despensa concreta.
- Construcción de índices de recetas enlazadas: el conjunto de datos asociado contiene nombres de ingredientes normalizados, tiempos y raciones reportados por la fuente, identificadores y enlaces originales, lo que permite montar catálogos enlazados sin copiar títulos, cantidades, instrucciones, descripciones ni imágenes.
- Demostración en navegador sin backend: el espacio público ejecuta los pesos supervisados publicados y frecuencias de ingredientes de todo el corpus; una descarga opcional de 36,0 MiB permite búsqueda local en el navegador sin inicio de sesión, clave de API ni servicio de inferencia de pago.
- Análisis de cobertura de catálogos: `recipe_catalog.json` registra la cobertura medida, lo que permite auditar cuántas recetas tienen tiempo conocido y planificar reconstrucciones del catálogo.
- Evaluación interna de ranking: las métricas de recuperación sintética y los protocolos documentados en `recipe_training.json` y `recipe_evaluation.json` permiten reproducir comparaciones emparejadas contra una línea base heurística.

## Benchmarks y rendimiento

Evaluación de búsqueda en vivo, sin insertar la receta fuente en la recuperación, sobre 200 consultas de test retenidas:

| Métrica | Valor |
|---|---|
| Recuperación del conjunto fuente de ingredientes en el top-5 | 83,5 % |
| Conjunto fuente presente en la lista corta | 99,0 % |
| Mediana de tiempo por solicitud | 0,43 s |
| Percentil 95 de tiempo por solicitud | 2,05 s |
| Timeouts observados | 0 |
| Violaciones de restricciones observadas | 0 |
| Consultas que alcanzaron presupuesto de recuperación | 162 de 200 |
| Mejora en recuperación top-5 frente a la heurística | +8,0 puntos porcentuales (IC95 % bootstrap emparejado por consulta: 4,5 a 12,0 puntos) |

Evidencia de entrenamiento del modelo de ingredientes:

| Medida | Recuento verificado |
|---|---|
| Registros de receta por época | 4.653.430 |
| Épocas completadas | 3 |
| Presentaciones de recetas en todas las épocas | 13.960.290 |
| Slots de ingredientes procesados por época | 36.707.624 |
| Pasos de optimizador | 27.267 |
| Consultas de entrenamiento de ranking (supervisado + RL) | 9.306.860 |
| Acciones de refuerzo muestreadas | 18.613.720 |

Advertencias sobre estas cifras: los tiempos excluyen la inicialización y corresponden a una ejecución local medida, no a una garantía de nivel de servicio. Los scores de ranking por muestreo insertan deliberadamente la receta fuente en los conjuntos de candidatos, por lo que no equivalen a precisión de búsqueda sobre el catálogo completo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada (cálculo derivado del recuento de parámetros, no dato publicado): aproximadamente 5,8 MiB en fp32, 2,9 MiB en fp16 y 1,4 MiB en int8 para el modelo de ingredientes.
- La búsqueda local requiere además una descarga opcional de índice de 36,0 MiB para el navegador.
- GPU recomendadas: no aplica ninguna GPU dedicada; el modelo cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual y en la mayoría de iGPU, dado el tamaño inferior a 10 MiB de pesos.
- Despliegue: PyTorch con `pytorch_model_hub_mixin` desde HuggingFace Hub; demostración en navegador mediante el espacio `incrediblecrab/llmmm-recipes-demo`. El buscador de texto en Python (`RecipeFinder`) exige un catálogo local autorizado, su índice de metadatos verificado y el corpus canónico `recipe_ids.npz`, que no se incluyen en el modelo público.
- Latencia medida en la búsqueda en vivo: mediana de 0,43 s y p95 de 2,05 s por solicitud, sin inicialización. Throughput no disponible.
- vLLM, llama.cpp, Ollama y TGI: no disponibles para este modelo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, ni resultados de benchmarks estándar que permitan una comparación con alternativas. La única comparación documentada es interna: la política aprendida frente a la línea base heurística, con una mejora de +8,0 puntos porcentuales en recuperación del conjunto fuente en el top-5 sobre 200 consultas de test.

## Limitaciones y advertencias

- No genera instrucciones de cocina ni redacta recetas nuevas; solo predice ingredientes y recupera recetas existentes.
- Los emparejamientos de ingredientes normalizados no constituyen una lista de la compra completa ni una verificación de seguridad alimentaria o de alérgenos.
- No inventa unidades ausentes, no empareja arrays de cantidades inconsistentes y no escala cantidades ni tiempos de cocción según el número de raciones.
- Solo 681.275 de los 4.653.430 registros tienen tiempo total conocido; los tiempos desconocidos no superan un filtro de tiempo máximo.
- Los ficheros de catálogo (sqlite, `recipe_ids.npz`) no están incluidos en el modelo público; el buscador en Python requiere un catálogo autorizado local.
- Riesgo de alucinación: la compleción de ingredientes es una predicción estadística; las métricas publicadas son de recuperación sintética del conjunto fuente y no validan adecuación culinaria.
- Las mediciones de recuperación sintética no demuestran sabor, calidad de cocción, generalización a recetas no vistas ni garantías de nivel de servicio.
- En el entrenamiento de ranking, las recetas y las familias duplicadas no se dejaron fuera; los hashes de despensas de validación y test sí se excluyeron del entrenamiento de las políticas.
- Los scores de ranking por muestreo insertan la receta fuente en los candidatos y no equivalen a precisión de búsqueda global.
- La recuperación está acotada y notifica cuando se alcanza el presupuesto de lista corta o de escaneo; no hay fallback silencioso entre ranking aprendido y heurístico.
- Una solicitud de validación de RL agotó el tiempo de espera y la causa no se aisló.
- Licencia no disponible: no puede confirmarse la legalidad del uso comercial ni las condiciones de redistribución.
- Adopción muy baja (77 descargas, 1 like), con poca validación independiente por parte de la comunidad.
- Idiomas soportados no declarados, lo que impide garantizar un comportamiento correcto fuera del inglés en los nombres de ingredientes.
- Longitud de contexto no especificada; la entrada se trata como conjunto de ingredientes, no como secuencia de texto libre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/incrediblecrab/llmmm-recipes
- Demostración pública en navegador: https://huggingface.co/spaces/incrediblecrab/llmmm-recipes-demo
- Conjunto de datos de ingredientes (4.653.430 registros): https://huggingface.co/datasets/incrediblecrab/llmmm-recipe-ingredients
- Muestra de doce recetas con instrucciones de Wikibooks y atribución: https://huggingface.co/datasets/incrediblecrab/llmmm-recipe-sample
- Repositorio GitHub del proyecto llmmm: https://github.com/incrediblecrab/llmmm
- Paper referenciado (Attention is all you need): https://arxiv.org/abs/1706.03762
- Paper referenciado en las etiquetas del modelo: https://arxiv.org/abs/2605.22391
