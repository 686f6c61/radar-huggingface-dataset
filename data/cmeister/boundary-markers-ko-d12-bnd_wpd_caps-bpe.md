# cmeister/boundary-markers-ko-d12-bnd_wpd_caps-bpe

## Resumen

Este repositorio no contiene un modelo de propósito general, sino un artefacto de investigación: tres modelos de lenguaje coreanos de tamaño pequeño (semillas 0, 1 y 2) entrenados por Clara Meister con el objetivo de comparar vocabularios de subpalabras que marcan explícitamente las fronteras de palabra. La variante publicada aquí es `bnd_wpd_caps`, que añade al esquema `bnd_wpd` códigos de capitalización (un código especial antepuesto a la forma en minúscula de una palabra). Forma parte del trabajo descrito en el artículo "Explicit Boundary Markers for Subword Vocabularies", que reporta resultados en inglés; esta es su réplica en coreano.

La arquitectura es la de nanochat: un transformer decoder-only de 12 capas, anchura 768, 6 cabezas de atención y una ventana de contexto de 2.048 tokens. El entrenamiento se hizo con 1,34 mil millones de tokens (2.553 pasos de 524.288 tokens) sobre tres shards de Korean FineWeb-2, con una GPU por modelo. Los tres modelos solo difieren en la inicialización de pesos y en el orden de los shards, de modo que las mismas semillas permiten comparaciones directas entre tokenizadores.

Su relevancia es metodológica: sirve para estudiar si marcar fronteras de palabra en el vocabulario mejora la calidad del modelo en idiomas con escritura aglutinante y sin espacios como el coreano, medido en bits por byte sobre un shard de validación. Con tres semillas, los resultados apuntan a una dirección, no a una estimación precisa: la diferencia media frente al tokenizador `plain` es de -0,00033 bits por byte con una desviación típica de 0,00096 entre semillas, es decir, indistinguible del ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion nanochat, commit `92d63d4`) |
| Parametros totales | no disponible (el autor no publica la cifra) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible; los pesos se publican en precision completa (PyTorch state dict) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`), cargable con `torch.load(..., weights_only=True)` |
| Capas | 12 |
| Anchura (d_model) | 768 |
| Cabezas de atencion | 6 |
| Vocabulario | 34.686 entradas (34.685 del tokenizador + token de inicio de secuencia) |
| Tokenizador | BPE entrenado sobre una muestra de 5 GB de Korean FineWeb, archivo `tokenizer/fineweb_ko_5gb_quick_bnd_wpd_caps_bpe_v34685.json.gz` (sha256 `fbe08f6fba82c8903dda10fc464e26cb722ba84fd8e5f10765b2d3b0205f4f4f`) |
| Tamano del repositorio | 2,5 GB (incluye los tres checkpoints y los registros de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 12 capas, anchura 768, 6 cabezas de atención y contexto de 2.048 tokens. A partir de esos hiperparámetros se puede estimar el orden de magnitud del cuerpo del transformer en unos 85 millones de parámetros y en torno a 112 millones si los embeddings no estuvieran atados, pero el autor no publica la cifra de parámetros y esta estimación es una derivación aritmética, no un dato confirmado. Los pesos son state dicts de PyTorch, acompañados de un `meta_002553.json` con la configuración de nanochat y de los registros completos de entrenamiento y evaluación.

El entrenamiento cubrió 2.553 pasos de 524.288 tokens, esto es, 1,34 mil millones de tokens en total, sobre 3 shards de Korean FineWeb-2 de la release `fineweb-2_0_1-quality_10-filterrobots` (1,22 mil millones de caracteres, leídos aproximadamente 3,1 veces). La semilla fija tanto la inicialización de pesos como el orden de los shards, y el orden es el mismo para todos los tokenizadores, lo que hace comparables los modelos con la misma semilla. Con solo 3 shards, las semillas 1 y 2 compartieron orden de datos, así que las tres semillas cubren dos órdenes y no tres. El tokenizador se entrenó con BPE sobre una muestra de 5 GB de Korean FineWeb; el esquema `bnd_wpd_caps` añade a `bnd_wpd` códigos de capitalización (un código para palabras en capitalización de título y otro para palabras en mayúsculas, con la forma en minúscula a continuación y el código fuera de las marcas de frontera). Dado que el hangul no distingue mayúsculas y minúsculas, la prueba de capitalización no se activa nunca en coreano, por lo que en la práctica este esquema coincide con `bnd_wpd` para este idioma. No se menciona ningún ajuste por instrucciones, RLHF ni DPO: son modelos base.

## Capacidades

- Modelado de lenguaje y continuación de texto en coreano: predicción del siguiente token sobre texto plano.
- Segmentación subword con fronteras de palabra explícitas: el tokenizador representa los límites de palabra mediante marcadores, lo que permite analizar cómo afecta esa representación al aprendizaje.
- Comparabilidad controlada entre tokenizadores: con la misma semilla, el modelo aísla el efecto del vocabulario, ya que la inicialización y el orden de los datos son idénticos.
- Evaluación en bits por byte: el modelo está pensado para calcular pérdida por byte UTF-8 sobre un shard coreano de validación, lo que permite comparar vocabularios de distinto tamaño de forma justa.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenado.
- No dispone de modo de pensamiento, visión, audio ni otras modalidades.
- Multilingüismo: únicamente coreano; no hay datos que indiquen competencia en otros idiomas.
- No es un modelo ajustado por instrucciones: no mantiene conversaciones ni sigue instrucciones de forma fiable.

## Casos de uso

- Replicación de experimentos de tokenización: partiendo del tokenizador y de los tres checkpoints, un grupo de investigación puede reproducir la comparación entre esquemas de marcadores de frontera en coreano y contrastarla con los resultados en inglés del artículo.
- Estudio del efecto de la tokenización en lenguas aglutinantes: el modelo permite medir bits por byte con vocabularios alternativos sobre el mismo corpus y el mismo orden de datos, aislando la variable del tokenizador.
- Análisis controlado de semillas: las semillas 0, 1 y 2 permiten estimar la varianza entre inicializaciones, útil para dimensionar cuántas semillas hacen falta en experimentos de tokenización antes de que una diferencia sea interpretable.
- Evaluación de métricas alternativas de calidad: al publicarse la pérdida por byte sobre un shard de validación, sirve como banco de pruebas para discutir si bits por byte es más adecuado que la perplejidad al comparar vocabularios.
- Punto de partida para fine-tuning en coreano: con 12 capas y contexto de 2.048 tokens, es un base model barato para adaptar a tareas concretas de clasificación o generación de texto coreano, siempre que se documente que no hubo ajuste por instrucciones.
- Pruebas de infraestructura de entrenamiento: el pipeline de nanochat (una GPU por modelo, 2.553 pasos) sirve para validar configuraciones de entrenamiento distribuidas o de registro de métricas a pequeña escala antes de escalar.
- Demostración docente: por su tamaño reducido se puede ejecutar en un portátil y usarse en clase para ilustrar cómo un cambio de vocabulario afecta a la pérdida por byte.
- Generación de texto coreano para inspección cualitativa: útil para comprobar de forma manual la fluidez y los errores típicos de un modelo entrenado con tan solo 1,34 mil millones de tokens.

## Benchmarks y rendimiento

El autor no publica MMLU, HumanEval, GSM8K ni ninguna otra batería estándar. La única métrica reportada es la pérdida de validación en bits por byte (suma de la pérdida sobre un shard coreano de FineWeb-2 dividida por la longitud UTF-8 real del texto evaluado; menor es mejor; los valores solo son comparables dentro del mismo idioma).

| Semilla | Este modelo (bits por byte) | Diferencia `plain` menos este modelo |
|---|---|---|
| 0 | 0,85506 | -0,00119 |
| 1 | 0,85430 | +0,00070 |
| 2 | 0,85446 | -0,00051 |
| Media | no disponible | -0,00033 (desviacion tipica entre semillas 0,00096) |

Una diferencia positiva indica que el esquema `plain` obtuvo peor puntuación (más bits por byte) que este esquema. La media de -0,00033 con desviación típica de 0,00096 implica que el efecto observado está dentro de la variabilidad entre semillas: tres semillas dan una dirección, no una estimación precisa. La comparación completa entre esquemas, entrenadores e idiomas está en el repositorio `script_tok`.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 12 capas y anchura 768, un checkpoint en precisión completa ocupa del orden de cientos de megabytes y la inferencia cabe holgadamente en 1-2 GB de memoria, incluso sin cuantizar.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria sirve; el entrenamiento original se hizo con una GPU por modelo, sin especificar el modelo de GPU en la información disponible.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna; también es viable la inferencia en CPU.
- Opciones de despliegue: al ser state dicts de PyTorch de nanochat, la vía natural es cargarlos con el código de nanochat o con PyTorch directamente. No se proporcionan pesos en GGUF ni integraciones con vLLM, TGI, llama.cpp u Ollama; para usar esos motores habría que convertir los pesos previamente.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 2,5 GB e incluye los tres checkpoints, el tokenizador y los registros.

## Comparativa con modelos similares

La comparación relevante no es con otros modelos públicos de coreano, sino con las otras variantes del mismo experimento, que comparten arquitectura, datos, semilla y presupuesto de entrenamiento y solo cambian el tokenizador. No se han proporcionado datos de otros modelos coreanos comparables.

| Modelo | Esquema de tokenizacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`bnd_wpd_caps`) | Marcadores de frontera mas codigos de capitalizacion | no disponible (12 capas, 768 de anchura) | 2.048 | Apache 2.0 | Pesos de 3 semillas en HuggingFace |
| `bnd_wpd` | Marcadores de frontera sin codigos de capitalizacion | no disponible (misma configuracion) | 2.048 | Apache 2.0 | Variante hermana del mismo autor |
| `plain` | BPE estandar, sin marcadores de frontera | no disponible (misma configuracion) | 2.048 | Apache 2.0 | Baseline del articulo, usado en las comparaciones |

En rendimiento, la diferencia media frente a `plain` es de -0,00033 bits por byte con desviación típica de 0,00096 entre semillas, por lo que no se puede afirmar superioridad de este esquema en coreano con los datos disponibles.

## Limitaciones y advertencias

- No es un modelo utilizable como asistente: es un modelo base sin ajuste por instrucciones, sin diálogo y sin modo de razonamiento.
- El entrenamiento es muy limitado: 1,34 mil millones de tokens, sobre 3 shards leídos unas 3,1 veces, lo que implica un riesgo alto de repetición del corpus y de degradación fuera de ese dominio.
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas, propio de un modelo de este tamaño y presupuesto.
- Contexto corto (2.048 tokens) y sin mecanismos de extensión de contexto.
- Solo coreano: no hay evidencia de capacidades en otros idiomas ni de transferencia multilingüe.
- El esquema `bnd_wpd_caps` incluye códigos de capitalización que no se activan en hangul, de modo que en coreano no aporta nada frente a `bnd_wpd`. No debe interpretarse como una ventaja específica para este idioma.
- Con solo 3 semillas y dos órdenes de datos distintos, cualquier conclusión sobre superioridad de un tokenizador está dentro del margen de error; el propio autor lo advierte.
- Los valores de bits por byte solo son comparables dentro del mismo idioma; no se pueden contrastar con los del artículo en inglés.
- Sesgos conocidos: no se documentan análisis de sesgo; el corpus es Korean FineWeb-2, con la composición y los filtros de esa release, y conviene revisar las condiciones de uso del dataset antes de un uso comercial.
- Licencia Apache 2.0 para los pesos, lo que permite uso comercial del modelo, pero la licencia del corpus de entrenamiento es una consideración independiente que debe verificarse.
- Producción: no hay pesos cuantizados, ni soporte declarado en motores de inferencia habituales, ni cifras de latencia o throughput, así que su uso en producción requeriría trabajo adicional de conversión y evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ko-d12-bnd_wpd_caps-bpe
- Articulo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister): https://arxiv.org/abs/2608.08847
- Repositorio `script_tok`, con el codigo del tokenizador y la comparativa completa: https://github.com/sanderland/script_tok
- nanochat, framework de entrenamiento (commit `92d63d4`): https://github.com/karpathy/nanochat
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; las unicas fuentes utiles son las enlazadas en la model card.
