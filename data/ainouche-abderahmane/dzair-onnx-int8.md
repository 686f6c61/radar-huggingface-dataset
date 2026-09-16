# ainouche-abderahmane/DZAIR-ONNX-INT8

## Resumen

DZAIR-ONNX-INT8 es la variante cuantizada a int8 y exportada a ONNX del encoder DZAIR, publicado por el usuario ainouche-abderahmane. El modelo base DZAIR es un encoder de 105,3 millones de parámetros especializado en detección de tokens sustituidos (replaced-token detection) sobre dariya argelina (código de idioma arq), la variedad dialectal árabe de Argelia, incluyendo texto escrito en arabizi (transliteración con caracteres latinos). Esta versión concreta no introduce un modelo nuevo ni un reentrenamiento: es un artefacto de despliegue pensado para inferencia en CPU.

El repositorio ocupa aproximadamente 0,1 GB y el grafo ONNX pesa 107.754.861 bytes, en torno a una cuarta parte del tamaño de la versión fp32. La cuantización dinámica apenas degrada la salida: la similitud coseno frente a las salidas fp32 es de 0,99936 y la diferencia absoluta máxima es de 0,23, valores que según el autor superan la puerta de fidelidad exigida para la publicación del artefacto.

Su relevancia práctica es acotada pero clara: permite ejecutar un encoder dialectal específico para dariya argelina en máquinas sin GPU, con un consumo de memoria muy bajo y una interfaz prácticamente idéntica a la del modelo base (`input_ids` y `attention_mask` de entrada, `last_hidden_state` de salida). La documentación publicada es escasa: no incluye resultados numéricos de benchmarks, ni longitud de contexto, ni detalles completos de composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (variante ONNX del modelo DZAIR); número de capas, dimensiones y tipo de atención: no disponible |
| Parámetros totales | 105,3 millones (correspondientes al modelo base DZAIR) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámica (ONNX Runtime); no se documentan otros esquemas |
| Idiomas soportados | arq (dariya argelina), con soporte declarado para arabizi |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), tokenizador SentencePiece (`tokenizer.model`) |
| Tamaño del grafo | 107.754.861 bytes (unos 107,7 MB), aproximadamente una cuarta parte de fp32 |
| Tarea declarada | text-classification (pipeline tag), si bien la salida documentada es `last_hidden_state` |
| Modelo base | ainouche-abderahmane/DZAIR |
| Runtime de referencia | onnxruntime, proveedor CPU |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo base DZAIR es un encoder transformer de 105,3 millones de parámetros entrenado para la tarea de detección de tokens sustituidos: identificar posiciones de un fragmento de texto que han sido reemplazadas o manipuladas respecto de un original esperado. La model card de esta variante no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud máxima de secuencia, y remite a la tarjeta principal del modelo base para los detalles de arquitectura, datos de entrenamiento y composición de licencias. Tampoco se documenta el uso de RLHF, DPO u otras fases de alineación, algo esperable en un encoder discriminativo de este tipo.

En cuanto al preprocesado, el tokenizador es el SentencePiece original del modelo base. El texto debe dividirse en fragmentos envueltos explícitamente con los tokens `[CLS]` y `[SEP]`, y los tramos en alfabeto latino (arabizi) deben normalizarse a minúsculas antes de la tokenización. Las reglas de normalización están versionadas en el archivo `tokenizer_rules.yaml` (2.058 bytes), lo que facilita reproducir el preprocesado exacto. La innovación técnica de esta variante es exclusivamente la cuantización dinámica a int8 del grafo ONNX, validada mediante una puerta de fidelidad numérica contra las salidas fp32.

## Capacidades

- Extracción de representaciones contextuales por token: la salida del grafo es `last_hidden_state`, apta para clasificación a nivel de token o de fragmento.
- Detección de tokens sustituidos en dariya argelina, la tarea para la que fue entrenado el modelo base.
- Manejo de arabizi: el flujo documentado exige normalizar a minúsculas los tramos en alfabeto latino antes de tokenizar.
- Inferencia en CPU con onnxruntime, sin necesidad de acelerador hardware.
- Interfaz compatible con el build ONNX en fp32: mismas entradas (`input_ids`, `attention_mask`) y misma salida (`last_hidden_state`).
- Carga mediante `optimum.onnxruntime.ORTModelForFeatureExtraction` y tokenizador de Transformers.
- No es un modelo generativo: no se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso.
- Capacidades multilingües fuera del árabe argelino: no disponibles.

## Casos de uso

- Verificación de integridad textual en corpus de dariya: el modelo permite marcar posiciones sospechosas de haber sido sustituidas en un texto, útil para auditar transcripciones o datasets recolectados de fuentes poco fiables. Funciona en CPU, por lo que puede ejecutarse sobre lotes grandes sin coste de GPU.
- Limpieza de datos para entrenamiento de modelos de lenguaje en árabe dialectal: aplicar el detector como filtro previo permite descartar o marcar segmentos corruptos antes de incorporarlos a un corpus de preentrenamiento o ajuste fino.
- Preprocesado en pipelines de voz a texto en dariya: tras la transcripción automática, el encoder puede señalar fragmentos anómalos o sustituidos, ayudando a priorizar la revisión humana de las transcripciones.
- Anotación asistida en investigación dialectológica: dado que trabaja sobre arabizi y texto en árabe argelino, sirve para detectar automáticamente alteraciones en corpus paralelos y reducir el trabajo manual de anotadores.
- Despliegue en entornos de borde o sin GPU: con un grafo de 107,7 MB y cuantización int8, es viable ejecutarlo en instancias CPU pequeñas, contenedores ligeros o dispositivos con memoria limitada, donde un modelo fp32 de mayor huella no cabría con holgura.
- Detección de manipulación en contenido generado por usuarios: en plataformas con contenido en dariya o arabizi, el modelo puede emplearse como señal auxiliar para identificar ediciones o sustituciones deliberadas en publicaciones y comentarios.
- Extracción de embeddings para clasificación posterior: al devolver `last_hidden_state`, sus representaciones pueden alimentar clasificadores aguas abajo (por ejemplo, categorización temática o detección de spam) entrenados específicamente para dariya, reutilizando este encoder como extractor congelado.
- Evaluación comparativa de robustez de tokenizadores: el par tokenizador SentencePiece más reglas de normalización versionadas permite reproducir experimentos controlados sobre cómo afectan la normalización de arabizi y el troceado en fragmentos a la calidad de la detección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara en sus etiquetas las métricas `accuracy` y `f1`, pero no incluye valores numéricos ni comparaciones con otros modelos. Tampoco aparecen resultados en los resultados de búsqueda web consultados, que no guardan relación con el modelo.

El único dato cuantitativo publicado es la fidelidad de la cuantización frente a las salidas fp32:

| Métrica de fidelidad (int8 frente a fp32) | Valor |
|---|---|
| Similitud coseno | 0,99936 |
| Diferencia absoluta máxima | 0,23 |
| Criterio de aceptación | Supera la puerta de fidelidad de la publicación, según el autor |

## Requisitos de hardware

- Peso del grafo en disco: 107.754.861 bytes (unos 107,7 MB) en int8; el equivalente fp32 rondaría los 421 MB para 105,3 millones de parámetros.
- VRAM estimada para inferencia: inferior a 1 GB para el modelo y el runtime; no se publican medidas oficiales.
- GPU recomendadas: no se especifica ninguna; el artefacto está pensado para el proveedor CPU de onnxruntime. Cualquier GPU consumer con al menos 1-2 GB de memoria libre sería suficiente si se ejecuta en un proveedor con aceleración, aunque no es el caso de uso documentado.
- Cabe en GPU consumer: sí, y de forma holgada; también en CPU, en contenedores pequeños y en dispositivos de baja memoria.
- Opciones de despliegue documentadas: `onnxruntime` con proveedor CPU, cargado a través de `optimum.onnxruntime.ORTModelForFeatureExtraction`. No se documentan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos, no aplicables a este encoder).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otros encoders de árabe dialectal, por lo que los datos de alternativas como MARBERT, CAMeLBERT-DA u otros modelos específicos de dariya figuran como no disponibles. La comparación posible se limita a las variantes del propio DZAIR:

| Modelo | Parámetros | Formato | Tamaño de pesos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| DZAIR-ONNX-INT8 | 105,3 M | ONNX int8 | 107.754.861 bytes | no disponible | Apache-2.0 | Variante de despliegue en CPU |
| DZAIR (modelo base) | 105,3 M | no disponible | no disponible | no disponible | Apache-2.0 | Referencia de precisión y de datos de entrenamiento |
| Build ONNX fp32 de DZAIR | 105,3 M | ONNX fp32 | no disponible | no disponible | Apache-2.0 | Mencionado en la model card como referencia de fidelidad; interfaz idéntica |
| Encoders de árabe dialectal alternativos | no disponible | no disponible | no disponible | no disponible | no disponible | Sin datos publicados en la información consultada |

## Limitaciones y advertencias

- Alcance funcional estrecho: el modelo está entrenado para detección de tokens sustituidos, no para clasificación general ni generación. Usarlo fuera de ese ámbito requerirá ajuste fino o un cabezal adicional.
- Discrepancia entre la etiqueta de pipeline y la salida real: el repositorio declara `text-classification`, pero la interfaz documentada devuelve `last_hidden_state` sin cabezal de clasificación, por lo que no produce etiquetas directamente.
- Ausencia de benchmarks: no hay cifras publicadas de accuracy ni de F1, de modo que la calidad absoluta del modelo no puede evaluarse con la información disponible.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, y el dominio se restringe a una única variedad dialectal.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la detección de tokens sustituidos, sin tasas de error publicadas.
- Degradación por cuantización: aunque la similitud coseno es de 0,99936, la diferencia absoluta máxima de 0,23 implica desviaciones puntuales que pueden alterar decisiones en umbrales ajustados.
- Limitaciones de idioma: solo se declara arq (dariya argelina, incluido arabizi). No hay soporte documentado para árabe estándar, otras variedades dialectales ni otros idiomas.
- Longitud de contexto desconocida: el flujo de uso exige trocear el texto en fragmentos envueltos con `[CLS]` y `[SEP]`, pero no se publica la ventana máxima soportada, lo que complica dimensionar los pipelines.
- Dependencia de preprocesado manual: hay que normalizar a minúsculas los tramos en alfabeto latino y respetar las reglas de `tokenizer_rules.yaml`; omitirlo degrada los resultados.
- Licencia: Apache-2.0 para pesos y código, pero la propia model card remite a la composición de licencias de los textos de entrenamiento del modelo base antes de redistribuir derivados. Conviene revisarla para uso comercial.
- Código remoto: la carga del tokenizador se documenta con `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar ese código antes de desplegarlo en producción.
- Madurez y adopción: el repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización son atípicas, por lo que se recomienda verificar la reproducibilidad y la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ainouche-abderahmane/DZAIR-ONNX-INT8
- Modelo base DZAIR (tarjeta principal, con tabla completa de resultados, datos de entrenamiento y licencias): https://huggingface.co/ainouche-abderahmane/DZAIR
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales relacionados con este modelo.
