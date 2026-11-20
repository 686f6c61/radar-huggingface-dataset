# chengli-thu/laya-seqxgpt-zh-ai-detector

## Resumen

Laya-SeqXGPT-ZH es un detector de texto generado por IA para chino, presentado como un modelo de clasificación de tokens (token-classification) construido sobre el encoder multilingüe `convaiinnovations/laya-multilingual`. Lo desarrolla el usuario `chengli-thu` y su función no es generar texto, sino analizar un documento y devolver, por un lado, una probabilidad de que el texto completo haya sido escrito por una IA y, por otro, una máscara a nivel de token que señala qué fragmentos concretos son de origen sintético. Esto lo convierte en una herramienta de atribución y localización, no solo de detección binaria.

El modelo tiene 309.163.407 parámetros totales y se distribuye en formato safetensors con un repositorio de 1,3 GB. Su arquitectura es la de un transformer encoder con una cabeza compartida que alimenta cuatro cabezas de predicción: clasificación global del texto, clasificación de la fuente de IA, segmentación token a token y estimación de la proporción global de contenido IA. La longitud de contexto efectiva de inferencia se organiza en ventanas de hasta 2.048 tokens, con un máximo de 16 ventanas por documento.

Su relevancia actual reside en la trazabilidad: en entornos donde conviven texto humano y generado, no basta con saber si un documento es sospechoso, sino qué partes lo son. El modelo está especializado en respuestas de Zhihu (知乎) y en mezclas sintéticas construidas por frases, y su licencia Apache 2.0 facilita la integración en herramientas de moderación, auditoría editorial y análisis forense de contenido, siempre con las cautelas propias de un clasificador estadístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: `convaiinnovations/laya-multilingual`) con cuatro cabezas de predicción |
| Parametros totales | 309.163.407 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de hasta 2.048 tokens, máximo 16 ventanas por documento |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la revisión `e4e9ddf21a7b1903b7acffd8814ad4307bf63a67` de `convaiinnovations/laya-multilingual` y se afina como clasificador de tokens. El diseño comparte la salida del encoder entre cuatro cabezas: la primera clasifica el documento completo como humano o IA; la segunda clasifica la fuente de IA entre las 11 clases vistas en entrenamiento; la tercera produce una segmentación token a token; y la cuarta estima la proporción global de texto IA. La segmentación se materializa en una máscara `ai_mask` donde `1` indica que el token supera el umbral de 0,60, `0` que queda por debajo y `null` que no fue analizado por límite de ventana.

El entrenamiento se realizó sobre texto chino de Zhihu y sobre muestras mixtas sintéticas construidas por concatenación de frases humanas y generadas. La evaluación reportada se hizo sobre el split 0, con 9.800 muestras A/B y 7.053.912 tokens de cuerpo atribuibles de forma única. No se detalla en la información disponible el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; el autor remite a `model_config.json` para la trazabilidad pública de datos y archivos.

## Capacidades

- Detección global de texto generado por IA en chino, con una probabilidad calibrada (`probability_ai`) y una decisión binaria basada en el umbral 0,318697.
- Localización a nivel de token: devuelve `ai_mask`, `token_probabilities` (probabilidad sigmoid cruda de la cabeza 3) y `token_offsets` en intervalos de caracteres Unicode, además de `token_offsets_utf16` para posicionamiento en navegador.
- Clasificación de la fuente de IA entre 11 clases, limitada a las categorías presentes en el entrenamiento.
- Estimación de la proporción global de contenido IA (cabeza 4), evaluada con MAE.
- Procesamiento de documentos largos mediante segmentación en ventanas de 2.048 tokens, hasta 16 ventanas, con estadísticas de cobertura y marcado `null` para el texto no analizado.
- Predicción token a token incluso cuando la decisión global es `human`.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido; es un clasificador, no un modelo generativo.

## Casos de uso

- Moderación de foros y comunidades chinas: el modelo puede analizar respuestas de Zhihu o plataformas similares y devolver no solo si el texto es sospechoso, sino qué párrafos concretos lo son, lo que permite aplicar acciones graduadas en lugar de borrar el mensaje completo.
- Auditoría editorial de contenido mixto: en artículos donde un redactor humano ha insertado fragmentos generados, la máscara token a token y la proporción global de IA permiten señalar las secciones afectadas y estimar el porcentaje de contenido sintético.
- Verificación académica y detección de plagio generativo: integrado en un pipeline que recibe trabajos en chino, el modelo aporta una señal de atribución por fragmento que complementa las herramientas clásicas de similitud textual.
- Análisis forense de corpus: investigadores que estudian la prevalencia de texto generado pueden procesar lotes de documentos y agregar las probabilidades por token y por documento para construir estadísticas de atribución.
- Filtrado de datos para entrenamiento: antes de usar un corpus chino para entrenar otros modelos, el detector puede marcar documentos y fragmentos sospechosos de ser sintéticos, reduciendo la contaminación del dataset.
- Herramientas de escritura asistida con control de autoría: un editor puede mostrar en tiempo real qué partes de un borrador se parecen a texto generado, usando los offsets UTF-16 que el modelo devuelve para resaltar directamente en el navegador.
- Clasificación de fuente en pipelines de contenido generado: cuando se combinan varios generadores, la cabeza de 11 clases permite etiquetar la procedencia probable del fragmento, siempre dentro de las categorías vistas en entrenamiento.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Segment macro-F1 (cabeza 3, umbral 0,60) | 0,9299 | Split 0, 9.800 muestras A/B, 7.053.912 tokens de cuerpo |
| MAE de proporcion AI (cabeza 4) | 0,0460 | Split 0, 19.797 muestras |

El split 0 tiene historial de desarrollo y no constituye un conjunto ciego, por lo que los resultados deben interpretarse como una evaluación interna y no como una medida independiente de generalización. No se han publicado en la información disponible resultados comparativos con otros detectores ni métricas sobre dominios distintos de Zhihu o sobre mezclas no sintéticas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,24 GB solo para pesos (309 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, entre 2 y 4 GB según longitud de ventana y batch.
- En fp16/bf16: alrededor de 0,62 GB de pesos, con un consumo total habitual por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar el modelo sin problema. Para lotes grandes, A100/H100 aportan mayor throughput.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 6-8 GB o más, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: la model card proporciona un script propio `predict.py` con la clase `SeqXGPTDetector` y requiere `huggingface-hub==1.33.0` y Python 3.10–3.12; al ser un modelo `transformers` estándar con `pipeline_tag: token-classification`, es compatible con la librería Transformers y con servidores de inferencia que soporten ese pipeline. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya-SeqXGPT-ZH (este modelo) | 309 M | 2.048 tokens por ventana, hasta 16 ventanas | Detección y localización de IA en chino | Apache 2.0 | Hugging Face |
| Detectores binarios genéricos de texto IA | No disponible | No disponible | Clasificación global humano/IA | Variable | Variable |
| Clasificadores multilingües de texto IA | No disponible | No disponible | Clasificación global, sin localización por token | Variable | Variable |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables concretos, por lo que la comparación cuantitativa con alternativas no está disponible. La diferencia funcional principal de este modelo frente a detectores binarios es la salida token a token y la estimación de proporción de contenido IA.

## Limitaciones y advertencias

- Los resultados de evaluación proceden del split 0, que tiene historial de desarrollo y no es un conjunto ciego; la generalización a datos no vistos está por verificar.
- El modelo está entrenado y evaluado principalmente sobre respuestas de Zhihu en chino y sobre mezclas sintéticas construidas por frases; no se garantiza su comportamiento en otros dominios, registros o estrategias de mezcla.
- La clasificación de fuente solo cubre las 11 clases presentes en el entrenamiento; cualquier generador no incluido quedará mal etiquetado o fuera de catálogo.
- Las salidas son predicciones estadísticas y no prueban la autoría ni la procedencia real del texto; no deben usarse como evidencia concluyente en contextos disciplinarios o legales sin revisión humana.
- Riesgo de falsos positivos en texto humano muy formulaico o en textos que imiten el estilo de los generadores, y de falsos negativos en texto IA editado o reescrito para evadir la detección.
- El límite de 16 ventanas de 2.048 tokens implica que documentos largos dejan la cola sin analizar, marcada como `null`; hay que tenerlo en cuenta al agregar resultados.
- El umbral de decisión global (0,318697) y el de la máscara (0,60) son valores fijados por el autor; para otros dominios puede ser necesario recalibrarlos usando `token_probabilities`.
- Sesgos específicos del corpus de entrenamiento (Zhihu, chino) no están documentados en detalle en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a `LICENSE` y `NOTICE` para la atribución del modelo base; conviene revisar esos archivos antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengli-thu/laya-seqxgpt-zh-ai-detector
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Revisión del modelo base usada en la inicialización: `e4e9ddf21a7b1903b7acffd8814ad4307bf63a67`
- Script de inferencia incluido en el repositorio: `predict.py` (clase `SeqXGPTDetector`)
- Configuración y trazabilidad de datos: `model_config.json` en el repositorio del modelo
- Licencia y atribución: `LICENSE` y `NOTICE` en el repositorio del modelo
