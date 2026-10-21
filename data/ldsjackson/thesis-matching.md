# ldsjackson/thesis-matching

## Resumen

`ldsjackson/thesis-matching` es un prototipo de investigación publicado en HuggingFace por el usuario ldsjackson, que implementa una arquitectura DeiT (Data-efficient Image Transformer) orientada a tareas de *matching* (emparejamiento entre elementos). El repositorio se presenta explícitamente como un punto de partida experimental: incluye el código del modelo, la configuración de arquitectura, una receta de entrenamiento por defecto y un checkpoint de inicialización, pero no un modelo entrenado ni resultados de evaluación.

El dato más llamativo es la discrepancia entre la etiqueta de escala declarada en la model card ("giant") y el recuento real de parámetros del fichero `model.safetensors`: 49.600 parámetros. Un DeiT de escala "giant" en el sentido habitual de la familia ViT se sitúa en cientos de millones de parámetros, por lo que este checkpoint debe interpretarse como una inicialización mínima para pruebas de humo (smoke tests) y no como un transformer visual de gran tamaño. El autor lo reconoce: el checkpoint "no ha sido entrenado ni auditado".

Por tanto, su relevancia ahora no está en el rendimiento, sino en su utilidad como esqueleto reproducible para experimentos de emparejamiento con atención dispersa y fusión por co-atención, con licencia MIT. Cualquier uso en producción requiere entrenamiento y evaluación propios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (vision transformer con destilación, según la model card) |
| Parametros totales | 49.600 (según `model.safetensors`); la model card declara escala "giant", dato no coherente con el recuento real |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuye checkpoint en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`); código Python y configuración en JSON |

Detalles de arquitectura declarados por el autor: atención dispersa (*sparse attention*), fusión por co-atención (*co attention*), función de activación swish e normalización InstanceNorm. Optimizador Lion con schedule coseno en la receta por defecto. Tamaño del repo: 0,0 GB. Descargas: 0. Likes: 0.

## Arquitectura y entrenamiento

La arquitectura declarada es DeiT, un transformer visual derivado de ViT que introduce un token de destilación para aprender de un profesor (típicamente RegNet) y reducir la dependencia de grandes volúmenes de datos etiquetados. Sobre esa base, este repositorio aplica dos modificaciones orientadas a emparejamiento: atención dispersa, que reduce el coste cuadrático limitando las conexiones entre tokens, y fusión por co-atención, un esquema en el que dos ramas de entrada se atienden mutuamente para producir una representación conjunta de la pareja. La normalización es InstanceNorm en lugar de LayerNorm, y la activación es swish.

No se ha publicado información sobre volumen de tokens, composición del dataset, ni sobre si hubo etapas de RLHF o DPO. La model card es explícita al respecto: `training_args.json` recoge valores de partida (optimizador Lion, schedule coseno) que "no son evidencia de una ejecución completada", y `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado. Tampoco se documenta ningún mecanismo de decodificación especulativa ni atención lineal; la atención dispersa es la única optimización de eficiencia mencionada. El autor recomienda, para cualquier evaluación futura, usar un conjunto de validación emparejado, reportar la métrica de la tarea con al menos tres semillas e incluir una línea base de capacidad equivalente.

## Capacidades

- No hay capacidades verificadas: el checkpoint no ha sido entrenado, por lo que no produce salidas con significado en ninguna tarea.
- Vocación declarada: *matching*, es decir, puntuar la compatibilidad o correspondencia entre dos entradas (pares de elementos), mediante co-atención.
- Procesamiento visual genérico heredado de DeiT (parches de imagen y tokens), sujeto a entrenamiento previo.
- Generación de texto: no disponible; no es un modelo de lenguaje.
- Tool calling / function calling: no soportado.
- Soporte de agentes o razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponible/no aplica.
- Modo *thinking*, visión-a-texto, audio: no disponibles.
- Capacidad real utilizable hoy: servir como plantilla de código ejecutable (`eval.py`) y como inicialización para *smoke tests* de pipeline.

## Casos de uso

Los siguientes escenarios son aplicables **solo después de entrenar y validar** el modelo; describen para qué está diseñada la arquitectura, no lo que el checkpoint actual hace.

- Deduplicación de registros (record linkage): la co-atención entre dos registros permite aprender una representación conjunta de la pareja y clasificarla como duplicado o no, lo que encaja con bases de datos de clientes o catálogos con entradas repetidas.
- Entity matching en integración de datos: emparejar entidades de dos fuentes heterogéneas (por ejemplo, proveedores de dos ERP) explotando la atención cruzada, que modela interacciones entre campos en lugar de compararlos por separado.
- Coincidencia de productos en comercio electrónico: comparar imagen y ficha de un mismo producto entre marketplaces; la rama visual de DeiT permite usar la fotografía como señal principal.
- Emparejamiento currículum–oferta (coherente con el nombre "thesis-matching"): puntuar la adecuación entre dos documentos, útil en bolsas de empleo o asignación de tutores a trabajos de fin de máster.
- Verificación de similitud de imágenes o parches: al ser un transformer visual, puede adaptarse a tareas de correspondencia entre regiones de imagen (detección de copias, control de calidad visual).
- Reordenación (*reranking*) en un pipeline de búsqueda: usar la puntuación de emparejamiento como segunda fase sobre los candidatos devueltos por un retriever léxico o vectorial.
- Línea base reproducible en investigación: servir de referencia mínima y de coste casi nulo (49.600 parámetros) para comparar implementaciones de atención dispersa y co-atención antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica literalmente que "no se reclama ninguna puntuación de benchmark en este repositorio" y que el checkpoint es una inicialización para pruebas de humo. Cualquier cifra de MMLU, HumanEval, GSM8K o métricas de emparejamiento (precisión, recall, F1, MRR) sería inventada y no debe citarse.

| Benchmark | Resultado |
|---|---|
| Métricas de matching (F1, precision, recall, MRR) | No disponible |
| Benchmarks de visión (ImageNet top-1, etc.) | No disponible |
| Benchmarks de lenguaje (MMLU, GSM8K, HumanEval) | No aplica / no disponible |

## Requisitos de hardware

- VRAM para inferencia: despreciable. Con 49.600 parámetros en fp32 el peso ocupa del orden de 0,2 MB, por lo que el cuello de botella es el framework (PyTorch), no el modelo.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte CUDA sirve. Para el checkpoint actual, CPU es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU y en dispositivos de baja memoria. Los requisitos reales dependerán del escalado que se haga al tamaño "giant" declarado.
- Opciones de despliegue: el autor advierte que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. vLLM, TGI, llama.cpp u Ollama no son aplicables (no es un modelo de lenguaje ni publica GGUF). El punto de entrada previsto es el script propio: `python eval.py --help`.
- Latencia y throughput: no disponibles. No tiene sentido medirlos sobre un checkpoint sin entrenar.

## Comparativa con modelos similares

No hay resultados de rendimiento que permitan una comparación cuantitativa. Se ofrece una comparación estructural, con cifras de referencia pública que pueden variar según la implementación:

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ldsjackson/thesis-matching | 49.600 (declarado "giant") | No disponible | Matching con co-atención | MIT | HuggingFace, checkpoint sin entrenar |
| DeiT-Base (facebook/deit-base) | Del orden de 86 M (referencia pública) | Imagen, resolución según config | Clasificación de imágenes | Apache 2.0 (referencia) | Pesos entrenados en ImageNet |
| DeiT-Small (facebook/deit-small) | Del orden de 22 M (referencia pública) | Imagen | Clasificación de imágenes | Apache 2.0 (referencia) | Pesos entrenados en ImageNet |
| Sentence-transformers / cross-encoders para matching textual | No disponible | Texto | Similitud y reranking | Apache 2.0 en muchos casos | Ecosistema maduro |

La diferencia práctica es que las alternativas publican pesos entrenados y métricas, mientras que este repositorio publica solo la arquitectura y la receta por defecto.

## Limitaciones y advertencias

- El checkpoint no está entrenado: no produce resultados útiles ni puede evaluarse frente a líneas base.
- Discrepancia documental: la etiqueta "giant" no concuerda con los 49.600 parámetros reales del safetensors; conviene verificar `config.json` antes de asumir cualquier tamaño.
- No hay datos de sesgo, robustez, equidad ni transferencia de dominio; el autor declara explícitamente que el checkpoint no ha sido auditado en ninguno de esos ejes.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de interpretar como válidas las salidas de un modelo sin entrenar.
- Idiomas y contexto: sin información; no debe asumirse soporte multilingüe ni una ventana de contexto concreta.
- Implementación personalizada: la carga mediante APIs automáticas requiere un adaptador explícito; no hay integración directa con pipelines estándar.
- Licencia MIT para el código y los pesos, lo que permite uso comercial, pero el autor advierte de que deben revisarse por separado los términos de los datasets externos que se utilicen para entrenar.
- Cualquier resultado publicado debe documentarse con registro de entrenamiento y versiones de entorno, y separarse de los valores por defecto del repositorio.
- La búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo (solo resultados de foros sin relación); no existe literatura externa que respalde afirmaciones de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ldsjackson/thesis-matching
- Paper de DeiT (referencia de la arquitectura): https://arxiv.org/abs/2012.12877
- Repositorio oficial de DeiT (referencia): https://github.com/facebookresearch/deit
- Paper de ViT (base de DeiT): https://arxiv.org/abs/2010.11929
- Documentación de safetensors: https://huggingface.co/docs/safetensors
- Paper del optimizador Lion (receta por defecto): https://arxiv.org/abs/2302.06675
- Demo, blog del autor y repositorio adicional: no disponibles en la información proporcionada.
