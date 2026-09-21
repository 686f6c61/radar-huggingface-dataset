# r1char9/rubert-tiny2-clf

## Resumen

r1char9/rubert-tiny2-clf es un modelo de clasificación de texto en ruso obtenido por ajuste fino (fine-tuning) de `cointegrated/rubert-tiny2`, un encoder BERT compacto de 29.194.707 parámetros. El modelo resuelve una tarea muy concreta: dada una petición corta de un usuario en ruso, predecir una de tres intenciones posibles, `write` (el usuario pide redactar o generar texto), `draw` (el usuario pide dibujar o generar una imagen) o `neutral` (ninguna de las anteriores). Es, por tanto, un clasificador de intenciones orientado a enrutar peticiones dentro de asistentes generativos.

El interés del modelo no está en su capacidad generativa, que no existe, sino en su papel como componente de enrutado de bajo coste. Al tratarse de un encoder diminuto (el repositorio completo ocupa 0,1 GB), puede ejecutarse en CPU con latencias bajas y desplegarse como paso previo a un modelo generativo mayor, decidiendo si la petición debe enviarse a un modelo de texto o a un modelo de difusión de imágenes. La licencia MIT facilita su integración en productos comerciales.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo típico de ajuste fino de un modelo *tiny* para una tarea de clasificación muy acotada. Por otro, obliga a leer con cautela su tabla de métricas: el autor reporta precisión, recall, F1 y AUC-ROC de 1,0 en todas las clases, un resultado que el propio autor advierte que suele indicar solapamiento entre entrenamiento y test, un conjunto de evaluación demasiado pequeño o fuga de etiquetas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (variante «tiny» rusa, base `cointegrated/rubert-tiny2`) con cabeza de clasificación de 3 clases |
| Parámetros totales | 29.194.707 (dato real de los pesos en safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica; la familia BERT suele limitarse a 512 tokens, sin confirmar para este modelo) |
| Tipos de cuantización | No disponible (no se documentan versiones cuantizadas; el repo solo contiene safetensors) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline | `text-classification` |
| Etiquetas de salida | `write`, `draw`, `neutral` |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación | 10 de junio de 2024 |
| Última actualización | 20 de septiembre de 2026 |
| Descargas / likes | 10 descargas / 0 likes |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer tipo BERT en su variante «tiny» para ruso. El modelo base, `cointegrated/rubert-tiny2`, es un encoder compacto preentrenado sobre texto ruso; el ajuste fino añade una cabeza de clasificación que proyecta la representación del token `[CLS]` (o del pooling correspondiente) sobre tres logits, uno por etiqueta: `write`, `draw` y `neutral`. El grueso de los 29,19 millones de parámetros corresponde a la matriz de embeddings del vocabulario y a la propia pila del encoder, no a la cabeza de clasificación, que es de tamaño despreciable.

Los detalles del entrenamiento no están documentados en la model card: no se especifica el conjunto de datos de ajuste fino, su tamaño, la composición de clases, el número de épocas, la tasa de aprendizaje, el optimizador ni la técnica de pooling. Tampoco se describe ningún proceso de alineación tipo RLHF o DPO, algo que no aplica a un modelo discriminativo de este tipo. No se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, MoE, SSM) ni variante híbrida: es un ajuste fino convencional de un encoder BERT.

El único dato cuantitativo de evaluación es la tabla de métricas sobre un conjunto de test de 291 ejemplos (155 de `write`, 117 de `draw` y 19 de `neutral`), donde todas las métricas —precisión, recall, F1 y AUC-ROC— alcanzan 1,0 tanto por clase como en las medias micro, macro y ponderada. El propio autor señala que este patrón suele ser síntoma de solapamiento con los datos de entrenamiento, de un conjunto de test demasiado pequeño o fácil, o de fuga de etiquetas, y recomienda verificarlo con un conjunto de test genuinamente independiente y más diverso.

## Capacidades

- Clasificación de intención en ruso sobre tres clases: `write`, `draw` y `neutral`.
- Clasificación de peticiones cortas y de intención única (es el caso de uso previsto por el autor).
- Uso como enrutador previo en pipelines generativos: decidir si una petición se deriva a un modelo de texto o a un modelo de generación de imágenes.
- Integración directa con la librería `transformers` mediante `pipeline(model="r1char9/rubert-tiny2-clf")`.
- Compatibilidad declarada con Text Embeddings Inference y con *endpoints* gestionados (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No genera texto: es un modelo exclusivamente discriminativo.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes, razonamiento multi-paso ni *thinking mode*.
- No dispone de capacidades multimodales (ni visión ni audio); trabaja únicamente con texto de entrada.
- No es multilingüe: está entrenado y evaluado únicamente en ruso.
- El comportamiento con textos largos o con múltiples intenciones simultáneas no ha sido probado según el propio autor.

## Casos de uso

- Enrutado de peticiones en asistentes generativos: el modelo recibe la petición del usuario y decide si debe dirigirse a un modelo de texto (`write`), a un modelo de difusión de imágenes (`draw`) o a un flujo genérico (`neutral`), evitando cargar el modelo generativo antes de saber qué tipo de tarea se solicita.
- Preclasificación en front-ends de chat en ruso: al ser un modelo de 29 millones de parámetros y 0,1 GB, puede desplegarse junto al *backend* web o incluso en el navegador vía ONNX, resolviendo la intención en el primer salto de red.
- Filtrado por lotes de registros de peticiones: clasificar grandes volúmenes de *logs* de prompts en ruso para analítica de producto (proporción de peticiones de texto frente a peticiones de imagen), un uso adecuado por el bajo coste computacional por inferencia.
- Control de flujos en asistentes de voz en ruso: tras la transcripción ASR, usar la etiqueta predicha para decidir si se invoca un generador de texto o un generador de imágenes, con la ventaja de que un encoder *tiny* añade muy poca latencia al *pipeline*.
- Enrutado de costes en plataformas multi-modelo: derivar las peticiones `draw` a modelos de imagen (más caros por llamada) y las `write` a modelos de texto, reduciendo el gasto al no invocar el modelo equivocado.
- Componente de pruebas en CI/CD de sistemas de NLP: al ser determinista, pequeño y de licencia MIT, sirve como modelo de referencia para validar que un *pipeline* de clasificación de intenciones sigue funcionando tras cambios de infraestructura.
- Prototipado rápido de clasificadores de intención en ruso: sirve como línea base que se puede reentrenar con etiquetas propias para dominios específicos antes de invertir en modelos mayores.
- Despliegue en entornos sin GPU: al tratarse de un encoder diminuto, la inferencia en CPU es viable para volúmenes moderados de tráfico, algo relevante en despliegues *on-premise* o de borde.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos sobre un conjunto de test de 291 ejemplos. No se aportan comparaciones con otros modelos.

| Métrica | write | draw | neutral | media micro | media macro | media ponderada |
|---|---|---|---|---|---|---|
| Precisión | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 |
| Recall | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 |
| F1-score | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 |
| Soporte | 155 | 117 | 19 | 291 | 291 | 291 |
| AUC-ROC | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 |

Advertencia: el autor indica expresamente que métricas perfectas en todas las clases y en todos los esquemas de media suelen señalar evaluación sobre datos solapados con el entrenamiento, un conjunto de test muy pequeño o fácil, o fuga de etiquetas, y recomienda comprobarlo con un conjunto de test independiente y más diverso. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K u otros) en la información disponible, algo esperable en un clasificador de tres clases y no en un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 117 MB solo para los pesos (29.194.707 parámetros × 4 bytes), más el *overhead* del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 58 MB para los pesos.
- VRAM estimada en INT8: aproximadamente 29 MB para los pesos.
- Inferencia en CPU plenamente viable: el modelo cabe en memoria principal sin dificultad y es apto para entornos sin GPU.
- GPU recomendadas: cualquiera con al menos 1-2 GB de VRAM libre sirve; no requiere A100, H100 ni tarjetas de gama alta. Cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 o incluso en GPUs integradas con soporte de cómputo.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en hardware de gama baja.
- Opciones de despliegue: `transformers` (pipeline de clasificación de texto), Text Embeddings Inference (etiqueta declarada en el repositorio), exportación a ONNX y servidores de inferencia compatibles con *endpoints*.
- No hay versiones GGUF ni cuantizaciones publicadas, por lo que no se puede desplegar directamente con llama.cpp u Ollama sin convertir y cuantizar los pesos previamente.
- Latencia y throughput estimados: no disponible (la información proporcionada no incluye mediciones de latencia ni de peticiones por segundo).

## Comparativa con modelos similares

No se dispone de evaluaciones comparativas publicadas. La comparación se limita a características objetivas de modelos de la misma familia.

| Modelo | Parámetros | Tarea | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| r1char9/rubert-tiny2-clf | 29.194.707 | Clasificación de intención en 3 clases (`write`, `draw`, `neutral`) | Ruso | MIT | No disponible | HuggingFace, safetensors |
| cointegrated/rubert-tiny2 (modelo base) | No disponible en la información proporcionada (el ajuste fino parte de él) | Representaciones de texto (encoder sin cabeza de clasificación específica) | Ruso | No disponible en la información proporcionada | No disponible | HuggingFace |
| Otros clasificadores de intención en ruso basados en BERT | No disponible | Clasificación de intenciones | Ruso | No disponible | No disponible | No disponible |

Cualquier comparación de rendimiento con alternativas exigiría evaluar todos los modelos sobre el mismo conjunto de test independiente, algo que no se ha publicado en la información disponible.

## Limitaciones y advertencias

- Métricas sospechosamente perfectas: precisión, recall, F1 y AUC-ROC de 1,0 en todas las clases. El propio autor advierte de posible solapamiento entre entrenamiento y test, conjunto de test demasiado pequeño o fácil, o fuga de etiquetas. No debe tomarse ese 1,0 como rendimiento esperado en producción.
- Desbalanceo de clases: la clase `neutral` cuenta con solo 19 ejemplos de test frente a 155 de `write` y 117 de `draw`. El rendimiento real sobre la clase minoritaria es probablemente peor de lo que sugieren las métricas reportadas.
- Alcance de entrada limitado: el modelo está pensado para peticiones cortas y de intención única; su comportamiento con textos largos o con múltiples intenciones mezcladas no ha sido probado.
- Monolingüe: solo ruso. No hay evidencia de funcionamiento en castellano ni en otros idiomas, y no se declara cobertura multilingüe.
- Modelo puramente discriminativo: no genera texto, por lo que no presenta riesgo de alucinación en el sentido generativo, pero sí puede asignar una etiqueta incorrecta, y no ofrece ninguna explicación ni puntuación de confianza calibrada más allá del `score` del pipeline.
- Sin documentación de sesgos: no se ha publicado ningún análisis de sesgo ni de equidad sobre el modelo ni sobre sus datos de ajuste fino.
- Sin datos de entrenamiento publicados: no se conoce la procedencia ni la composición del conjunto de ajuste fino, lo que impide auditar posibles sesgos o contaminaciones.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantías. Es una de las licencias más permisivas, pero el modelo se distribuye «tal cual», sin garantía de idoneidad para un fin concreto.
- Cifras de adopción muy bajas: 10 descargas y 0 «likes» en el momento de redactar esta ficha, lo que implica poca validación externa y ausencia de retroalimentación de la comunidad.
- No hay pesos cuantizados ni formatos alternativos publicados, lo que limita las opciones de despliegue en *runtimes* que requieren GGUF u otros formatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/r1char9/rubert-tiny2-clf
- Modelo base `cointegrated/rubert-tiny2`: https://huggingface.co/cointegrated/rubert-tiny2
- Las búsquedas web realizadas no devolvieron enlaces relevantes sobre este modelo (los resultados obtenidos correspondían a páginas corporativas de Microsoft, sin relación con el modelo). No se dispone de *papers*, blogs, repositorios ni demos adicionales.
