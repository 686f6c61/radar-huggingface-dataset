# adidukre/kumo-tabular-large-fp16-simulacrabench

## Resumen

Kumo-Tabular Large (re-guardado en float16) es una conversión no oficial del clasificador tabular `large/classifier.pt` del modelo Kumo-Tabular de NVIDIA, publicada por el usuario adidukre para la competición SimulacraBench de NeurIPS 2026. No se trata de un modelo nuevo ni de un reentrenamiento: el repositorio contiene un único fichero `kumo-tabular-v1.0.1-large-classifier-fp16.pt` en el que todos los tensores float32 del state dict original se han convertido a float16 con redondeo al par más cercano, reduciendo el tamaño de 854.850.034 bytes a 427.535.499 bytes. El objetivo declarado es cumplir el límite de 1 GB por envío de la competición y fijar un commit público concreto, tal como exigen las bases.

El modelo subyacente es un clasificador para datos tabulares, etiquetado con el pipeline `tabular-classification` y asociado al ecosistema `kumo-tabular` (la librería `sdm` de Kumo AI). La model card no documenta arquitectura interna, número de parámetros, longitud de contexto ni idiomas; solo se indica que se instancia mediante `sdm.models.KumoTabular(task="classification", size="large", pretrained=False)` y que los pesos se cargan con `load_state_dict`. El tamaño del fichero (unos 427 MB en fp16) sugiere del orden de 200 millones de parámetros si todos los tensores fueran de pesos, aunque esta cifra es una estimación a partir del tamaño y no un dato publicado.

Su relevancia es acotada: sirve como artefacto reproducible para participantes de SimulacraBench y como ejemplo de distribución de pesos bajo la licencia OpenMDW 1.1 de NVIDIA, pero no aporta mejoras de rendimiento ni información nueva sobre el modelo original. Cualquier evaluación de capacidades debe remitirse al repositorio oficial `nvidia/Kumo-Tabular`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular del ecosistema Kumo-Tabular; estructura interna no documentada) |
| Parametros totales | no disponible (fichero fp16 de 427.535.499 bytes; estimación orientativa de ~200 M si todos los tensores fueran pesos) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (re-guardado del state dict original en float32); no se documentan otras variantes |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje natural documentado) |
| Licencia | OpenMDW License Agreement v1.1 (openmdw-1.1), copyright de NVIDIA |
| Formato de pesos | `.pt` (PyTorch `torch.save`, cargable con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del clasificador `large` de Kumo-Tabular: la model card no describe capas, mecanismos de atención, tokenizador de columnas ni estrategia de embeddings para variables categóricas y numéricas. Tampoco se documentan los datos de entrenamiento, el número de tokens o filas procesadas, la composición del dataset ni si hubo ajuste por refuerzo o preferencias, algo esperable en un modelo tabular supervisado pero no confirmado por el autor.

La única intervención técnica documentada es la conversión de precisión: cada tensor float32 del state dict se convierte a float16 con redondeo al par más cercano y se guarda con `torch.save`, sin ninguna otra modificación. Al cargar, los valores float16 se copian en los parámetros float32 del modelo construido con `pretrained=False`, de modo que la inferencia se ejecuta en float32 con pesos que han pasado por una cuantización de ida y vuelta. No se han publicado métricas de degradación por este proceso, ni verificaciones de que la precisión se mantenga respecto al checkpoint original.

## Capacidades

- Clasificación de datos tabulares: tarea declarada en el pipeline (`tabular-classification`), orientada a predecir una etiqueta a partir de filas con columnas numéricas y categóricas.
- Carga compatible con la API de Kumo: se instancia con `sdm.models.KumoTabular(task="classification", size="large", pretrained=False)` y se cargan los pesos con `load_state_dict`.
- Reproducibilidad de envíos: al fijar un commit público y un hash sha256 verificable, permite declarar artefactos deterministas en competiciones.
- Generación de texto: no disponible.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Participación en SimulacraBench (NeurIPS 2026): el modelo encaja como artefacto de envío para el equipo GenMI, ya que el fichero fp16 cabe en el límite de 1 GB y declara un commit público fijo, requisito explícito de las bases.
- Clasificación tabular en pipelines de datos estructurados: se puede usar como clasificador en tareas con variables numéricas y categóricas, siempre que se construya el modelo con la librería `sdm` y se carguen los pesos convertidos; es adecuado cuando el tamaño del checkpoint es un factor limitante.
- Reproducción de experimentos con presupuesto de almacenamiento reducido: al ocupar aproximadamente la mitad que el original, facilita distribuir el checkpoint en entornos con cuotas de disco o artefactos de CI, a costa de una posible pérdida de precisión no cuantificada.
- Auditoría de licencias y procedencia: sirve como ejemplo práctico de redistribución bajo OpenMDW 1.1, conservando el acuerdo y las notas de origen en `NOTICE`, útil para equipos que necesitan validar el cumplimiento antes de publicar pesos derivados.
- Verificación de integridad en competiciones: los hashes sha256 del fichero original y del convertido permiten comprobar que el artefacto enviado corresponde exactamente al commit declarado.
- Integración en flujos de investigación sobre cuantización: permite medir empíricamente el impacto de un re-guardado fp16 en un clasificador tabular, comparando predicciones contra el checkpoint float32 de referencia.
- Prototipado de clasificación tabular en entornos con GPU de gama media: el tamaño reducido del fichero sugiere que la carga en memoria es manejable, aunque no se han publicado requisitos de VRAM ni latencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, AUC, F1 ni comparaciones con el checkpoint original en float32, y tampoco documenta latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia de orden de magnitud, el fichero fp16 ocupa 427.535.499 bytes (~0,4 GB); el modelo cargado en float32 ocuparía aproximadamente el doble solo en pesos, más el estado del optimizador y activaciones, que no se documentan.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos es plausible en GPUs con 8 GB o más, pero no hay datos publicados de memoria total necesaria.
- Opciones de despliegue: carga mediante PyTorch (`torch.load` con `weights_only=True`) y la librería `sdm` de Kumo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| adidukre/kumo-tabular-large-fp16-simulacrabench | no disponible (~200 M estimados por tamaño) | no disponible | OpenMDW 1.1 | `.pt` fp16 | Re-guardado no oficial, 0 descargas |
| nvidia/Kumo-Tabular (large/classifier.pt, v1.0.1) | no disponible | no disponible | OpenMDW 1.1 | `.pt` float32 | Original oficial; 854.850.034 bytes |
| Otros clasificadores tabulares (p. ej. XGBoost, LightGBM) | no disponible | no aplica | variable | múltiples | No comparables directamente sin datos de rendimiento |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; la comparación se limita a procedencia, licencia y formato.

## Limitaciones y advertencias

- No es una versión oficial de NVIDIA: la model card lo declara explícitamente y cualquier incidencia debe atribuirse a la conversión, no al modelo original.
- La conversión a float16 puede degradar la precisión de clasificación; no se han publicado mediciones de la diferencia respecto al checkpoint float32.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma; al ser un modelo tabular, los riesgos relevantes serían sesgos en los datos de entrenamiento, que no se describen.
- Licencia OpenMDW 1.1: es necesario revisar el acuerdo completo antes de uso comercial; el repositorio incluye `LICENSE` y `NOTICE`, pero las condiciones de explotación no se resumen en la model card.
- El repositorio no incluye código de inferencia ni ejemplos de uso más allá de las instrucciones de carga; depende de la librería `sdm` y de la API de Kumo.
- Sin descargas ni likes, sin benchmarks y con fecha de creación posterior a la información de referencia: la validación comunitaria es nula.
- El uso previsto está acotado a la competición SimulacraBench; no hay garantías de soporte ni mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/adidukre/kumo-tabular-large-fp16-simulacrabench
- Modelo original: https://huggingface.co/nvidia/Kumo-Tabular
- Commit de origen citado: `3c3e10bbdb590ace29e7026847f92db3c603096d` (tag v1.0.1) en nvidia/Kumo-Tabular
- Licencia OpenMDW 1.1: incluida en el repositorio como `LICENSE`
- Notas de modificación: incluidas en el repositorio como `NOTICE`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
