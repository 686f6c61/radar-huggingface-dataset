# davidmelash/wechsel_base_v7_2026-10-09_r5

## Resumen

wechsel_base_v7_2026-10-09_r5 es un modelo de clasificación de tokens (token classification, tipo NER) especializado en la detección de datos personales en decisiones judiciales en ucraniano, con el objetivo de facilitar su pseudonimización antes de la publicación. Lo desarrolla el usuario davidmelash y se distribuye en Hugging Face bajo licencia MIT. No es un modelo generativo: es un encoder tipo RoBERTa que etiqueta cada token de la entrada con una de cuatro categorías de entidad: `ОСОБА` (persona), `АДРЕСА` (dirección), `НОМЕР` (número) e `ІНФОРМАЦІЯ` (información).

El modelo parte de benjamin/roberta-base-wechsel-ukrainian, un RoBERTa base adaptado al ucraniano mediante el método WECHSEL (transferencia cross-lingual de embeddings de subpalabras desde un modelo monolingüe en inglés). Sobre esa base se ha realizado un fine-tuning supervisado con el conjunto sintético `v7`, construido a partir de decisiones del Registro Unificado Estatal de Decisiones Judiciales de Ucrania cuyos fragmentos anonimizados se han rellenado con valores generados.

Con 124.061.961 parámetros (aproximadamente 124 M, el tamaño estándar de roberta-base), el modelo es ligero y desplegable incluso en CPU. Su relevancia es práctica: la anonimización de resoluciones judiciales es un requisito legal en muchos ordenamientos, y un etiquetador de cuatro clases específico para el dominio jurídico ucraniano es más barato de operar que un LLM generativo para la misma tarea. El repositorio no publica métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (heredada de benjamin/roberta-base-wechsel-ukrainian) |
| Parametros totales | 124.061.961 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite estandar de la arquitectura RoBERTa base; no se explicita en la model card) |
| Tipos de cuantizacion | No disponibles. El repositorio solo publica pesos en safetensors; el tamano de 0,5 GB para 124 M de parametros es consistente con FP32. No se distribuyen variantes GGUF, ONNX ni INT8 |
| Idiomas soportados | Ucraniano (uk) unicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Etiquetas de entidad | ОСОБА (persona), АДРЕСА (direccion), НОМЕР (numero), ІНФОРМАЦІЯ (informacion) |
| Tarea (pipeline) | token-classification |
| Modelo base | benjamin/roberta-base-wechsel-ukrainian |
| Dataset de entrenamiento | `v7` (sintetico, derivado del Registro Unificado Estatal de Decisiones Judiciales de Ucrania) |
| Descargas / likes en Hugging Face | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-09 / 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer bidireccional de tipo RoBERTa base, con 124 M de parametros, 12 capas, atencion multi-cabeza y embeddings posicionales absolutos, por lo que la ventana efectiva se limita a 512 tokens. La particularidad de la cadena de la que procede es que el checkpoint base (benjamin/roberta-base-wechsel-ukrainian) no se entreno desde cero en ucraniano, sino que se obtuvo mediante WECHSEL, un metodo que inicializa los embeddings de subpalabras de un vocabulario objetivo a partir de un modelo monolingue en otro idioma, reduciendo drasticamente el coste computacional del transfer cross-lingual frente al entrenamiento desde cero.

El fine-tuning se realizo sobre el conjunto sintetico `v7`: decisiones judiciales del Registro Unificado Estatal de Decisiones Judiciales de Ucrania cuyos fragmentos anonimizados se sustituyeron por valores generados. Las direcciones sinteticas provienen del directorio de Ukrposhta y de OpenStreetMap (© colaboradores de OpenStreetMap, ODbL). La model card no especifica el numero de ejemplos, la composicion exacta del dataset, el numero de tokens de entrenamiento, la funcion de perdida, los hiperparametros ni si se aplicaron tecnicas de calibracion o post-procesado. Tampoco se documenta ninguna innovacion arquitectonica adicional sobre el encoder base: se trata de un fine-tuning de clasificacion de tokens con cuatro clases de entidad.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en ucraniano sobre texto juridico, con cuatro tipos: personas, direcciones, numeros e informacion.
- Etiquetado a nivel de token, adecuado para extraccion de spans y para sustitucion posterior por pseudonimos.
- Deteccion de datos personales orientada a flujos de anonimizacion y pseudonimizacion documental.
- Procesamiento de texto juridico administrativo y judicial en ucraniano (decisiones del registro estatal).
- Integracion nativa con la libreria transformers (pipeline `token-classification`) y con Hugging Face Inference Endpoints, segun la etiqueta `endpoints_compatible`.
- Ejecucion en CPU y en GPU de gama baja por su tamano reducido.
- No soporta generacion de texto, razonamiento multi-paso, tool calling, function calling, agentes, vision ni audio: es un encoder discriminativo.
- Capacidad multilingue: no disponible; el modelo declara unicamente ucraniano.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Pseudonimizacion de resoluciones judiciales: el modelo recorre la sentencia, marca cada mencion de persona, direccion, numero e informacion y permite sustituir esos spans por tokens genericos antes de publicar el documento en un registro publico. Es adecuado porque la tarea es de extraccion, no de generacion, y un encoder de 124 M es ordenes de magnitud mas barato que un LLM para procesar volumenes altos de documentos.
- Cumplimiento normativo en portales de jurisprudencia: integrado como paso previo al indexado, evita la difusion de datos personales en buscadores de sentencias. Su licencia MIT permite incorporarlo a un producto propietario sin obligaciones de copyleft.
- Curacion de corpus para entrenamiento de LLM: antes de utilizar resoluciones ucranianas como datos de entrenamiento o de ajuste, el etiquetador permite filtrar o enmascarar PII y reducir el riesgo de memorizacion de datos personales en el modelo final.
- E-discovery y revision documental en despachos juridicos: clasificacion previa de grandes lotes de documentos para localizar expedientes que contienen identificadores personales, con revision humana posterior sobre los spans marcados con mayor incertidumbre.
- Anonimizacion en tiempo real en sistemas de gestion documental: al ser un modelo pequeno, puede desplegarse en el propio servidor de la organizacion (on-premise) sin enviar documentos judiciales a APIs externas, lo que simplifica el cumplimiento de confidencialidad.
- Construccion de datasets abiertos de jurisprudencia: generar versiones publicables de colecciones de sentencias para investigacion en PLN juridico, manteniendo la estructura del texto pero eliminando identificadores.
- Etiquetado asistido (human-in-the-loop): preanotar spans para que un revisor humano los valide, reduciendo el coste de anotacion manual en proyectos de NER juridico en ucraniano.
- Filtrado y enrutado de documentos: usar la densidad de entidades detectadas como senal para clasificar documentos por sensibilidad y dirigirlos a distintos flujos de tratamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye F1, precision, recall, matriz de confusion ni evaluacion por tipo de entidad, y tampoco se proporciona ninguna comparacion con otros sistemas de anonimizacion en ucraniano. Los campos de descargas y likes del repositorio figuran a 0, lo que indica que no existe validacion por parte de la comunidad en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB en FP32 (124 M de parametros x 4 bytes), unos 0,25 GB en FP16 y unos 0,12 GB en INT8. Son estimaciones aritmeticas a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar inferencia con holgura.
- Inferencia en CPU: totalmente viable. El modelo cabe en memoria RAM principal y puede procesar documentos por lotes sin acelerador, lo que lo hace adecuado para despliegues on-premise.
- Opciones de despliegue: pipeline `token-classification` de transformers, Hugging Face Inference Endpoints (el modelo esta etiquetado como `endpoints_compatible`), exportacion a ONNX Runtime o TorchScript para servir con latencia baja, y servidores de inferencia genericos como Triton o FastAPI con batching dinamico. No aplican llama.cpp, Ollama ni vLLM, ya que son herramientas orientadas a modelos generativos causales.
- Latencia y throughput estimados: no disponibles. Dependeran del hardware, del batching y de la longitud de los documentos; el limite de 512 tokens obliga a trocear las resoluciones largas con ventana deslizante y a realinear las etiquetas entre fragmentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidmelash/wechsel_base_v7_2026-10-09_r5 | 124.061.961 | 512 tokens (arquitectura) | NER de 4 clases en ucraniano juridico | MIT | Hugging Face, pesos safetensors |
| benjamin/roberta-base-wechsel-ukrainian (modelo base) | Tamanio de roberta-base (no confirmado en la informacion disponible) | 512 tokens (arquitectura) | Modelo de lenguaje enmascarado en ucraniano; requiere fine-tuning para NER | No disponible en la informacion proporcionada | Hugging Face |
| FacebookAI/xlm-roberta-base | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo multilingue (100 idiomas), requiere fine-tuning para NER | No disponible en la informacion proporcionada | Hugging Face |

No se dispone de resultados de rendimiento comparativos entre estas alternativas. La comparacion solo puede establecerse por tamano, licencia y disponibilidad, no por calidad de etiquetado, dado que no se han publicado metricas para el modelo analizado.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay F1, precision ni recall por clase, por lo que no es posible estimar la tasa de falsos negativos en produccion, que es precisamente el error critico en anonimizacion.
- Solo cuatro tipos de entidad: identificadores como numeros de expediente, IBAN, correo electronico, telefono o datos de menores pueden quedar sin cubrir segun como se hayan definido las clases `НОМЕР` e `ІНФОРМАЦІЯ`, sin que la model card detalle su alcance.
- Entrenamiento con datos sinteticos: los fragmentos anonimizados se sustituyeron por valores generados, de modo que la distribucion de nombres, direcciones y numeros puede diferir de la de documentos reales. Existe riesgo de sobreajuste a la distribucion sintetica y de degradacion ante textos reales no anonimizados.
- Sesgos potenciales: los generadores de valores sinteticos pueden reproducir desequilibrios de frecuencia en nombres y apellidos ucranianos, y las direcciones derivadas de Ukrposhta y OpenStreetMap pueden sobrerrepresentar determinadas regiones.
- Idioma unico: el modelo solo declara ucraniano. No hay evidencia de funcionamiento sobre textos en ruso, crimeo, polaco o mezclas de idiomas, frecuentes en documentacion de la region.
- Limite de 512 tokens: las decisiones judiciales superan habitualmente esa longitud, lo que obliga a trocear el documento. Sin solapamiento y realineacion cuidadosos se pierden entidades en los limites de fragmento.
- Sin capacidades generativas ni de agentes: no puede reescribir, resumir ni reemplazar los spans detectados por si mismo; la sustitucion debe implementarla el sistema que lo envuelve.
- Riesgo de fuga de PII por falsos negativos: al procesar datos personales reales para anonimizarlos, cualquier entidad no detectada se propaga al documento publicado. Se recomienda una capa de reglas (expresiones regulares para numeros, correos y telefonos) y revision humana sobre los tramos marcados.
- Atribucion de datos: aunque la licencia del modelo sea MIT, parte del material de entrenamiento procede de OpenStreetMap bajo ODbL, que exige atribucion. Conviene revisar las obligaciones derivadas del uso de datos de Ukrposhta y de OSM si se redistribuye el modelo o derivados.
- Trazabilidad limitada de la version: el identificador sugiere una ejecucion concreta (`r5`) sobre un dataset versionado (`v7`), sin changelog ni model cards de las ejecuciones previas que permitan reproducir el entrenamiento.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa, de informes de errores y de mantenimiento conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidmelash/wechsel_base_v7_2026-10-09_r5
- Modelo base: https://huggingface.co/benjamin/roberta-base-wechsel-ukrainian
- Paper de WECHSEL (transferencia cross-lingual de embeddings de subpalabras): https://huggingface.co/papers/2112.06598
- Repositorio de WECHSEL: https://github.com/CPJKU/wechsel
- Documentacion de WECHSEL en el repositorio: https://github.com/CPJKU/wechsel/blob/main/MODEL_README.md
- Paquete wechsel en PyPI: https://pypi.org/project/wechsel/
- OpenStreetMap, licencia ODbL y atribucion: https://www.openstreetmap.org/copyright
- Directorio de Ukrposhta (fuente de las direcciones generadas): https://ukrposhta.ua/
