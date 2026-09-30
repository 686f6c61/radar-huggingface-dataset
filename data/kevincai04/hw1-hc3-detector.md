# kevincai04/hw1-hc3-detector

## Resumen

El modelo kevincai04/hw1-hc3-detector es un clasificador de texto basado en la familia BERT, publicado en HuggingFace por el usuario kevincai04 como entrega de la tarea 1 de un curso sobre Sentence Transformers aplicados a la detección de texto generado por IA. El repositorio contiene un único checkpoint en formato safetensors con 22.713.986 parámetros y un tamano total de 0,1 GB, lo que lo situa en la gama de los clasificadores ligeros que pueden ejecutarse en CPU o en cualquier GPU de consumo.

La tarea que resuelve es la clasificación binaria (o multiclase, no se especifica) de fragmentos de texto para determinar si han sido escritos por un humano o generados por un modelo de lenguaje. Según la model card, el autor reporta una exactitud de referencia (baseline) de 0,8449 y una exactitud de test tras el ajuste fino de 0,9899, aunque no se detalla la composición del conjunto de datos ni el procedimiento de evaluación.

Se trata de un artefacto académico con muy poca tracción: 3 descargas y 1 like desde su publicación. No incluye información sobre licencia, idiomas soportados ni datos de entrenamiento, por lo que su uso en producción requiere una validación propia previa. Es relevante únicamente como referencia metodológica de ajuste fino de sentence transformers para detección de contenido sintético.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (según etiqueta del repositorio); transformer encoder de tipo encoder-only |
| Parámetros totales | 22.713.986 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los modelos BERT suelen limitarse a 512 tokens; no confirmado por el autor) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors en precisión nativa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Librería | transformers |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |
| Tamano del repositorio | 0,1 GB |
| Descargas | 3 |
| Likes | 1 |

## Arquitectura y entrenamiento

La etiqueta `bert` del repositorio indica que el modelo parte de un encoder transformer de la familia BERT reconvertido en clasificador mediante una cabeza de clasificación sobre la representación del token `[CLS]`. Con 22,7 millones de parámetros, el checkpoint es sustancialmente más pequeno que un BERT-base estándar (unos 110 millones), lo que apunta a una configuración reducida en número de capas o en dimensión oculta, si bien el autor no publica la configuración exacta ni el checkpoint base del que parte. La model card menciona el uso de Sentence Transformers, lo que sugiere que el ajuste fino se hizo sobre embeddings de frase en lugar de sobre un encoder de clasificación convencional, pero no se detalla la estrategia concreta.

En cuanto a los datos de entrenamiento, el README no describe el corpus, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifica si el ajuste se realizó solo sobre la cabeza de clasificación o sobre el modelo completo. Los únicos datos numéricos aportados son las métricas: exactitud de referencia 0,8449 (con precisión, recall y F1 micro idénticos, y F1 macro 0,8449) y exactitud de test de 0,9899 tras el ajuste fino evaluada sobre 146 lotes de un conjunto no descrito. La mejora de aproximadamente 14,5 puntos porcentuales respecto a la referencia es el principal indicio de que el ajuste fino funcionó, pero sin acceso al dataset ni al protocolo de evaluación no es posible verificar la ausencia de fuga de datos entre train y test.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a etiquetar fragmentos de texto, presumiblemente como generado por IA o escrito por humanos.
- Detección de texto sintético: es el propósito explícito de la tarea para la que se entrenó, según el título de la model card.
- Generación de embeddings de frase: la model card menciona Sentence Transformers, por lo que el encoder subyacente puede producir representaciones vectoriales reutilizables para similitud semántica o búsqueda.
- Integración con pipelines de transformers: puede cargarse con `AutoModelForSequenceClassification` o `AutoTokenizer` de la librería transformers.
- Compatibilidad con text-embeddings-inference: la etiqueta `text-embeddings-inference` indica soporte para servir el modelo con ese motor.
- Compatibilidad con endpoints gestionados: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en HuggingFace Inference Endpoints.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un clasificador, no un modelo generativo).
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Moderación de contenido en plataformas educativas: el modelo puede integrarse como filtro previo para marcar entregas sospechosas de haber sido generadas por un LLM, con la salvedad de que su licencia y su evaluación no están documentadas y requerirían una validación propia.
- Detección de reseñas falsas en comercio electrónico: clasificar reseñas de producto para identificar patrones de redacción automática antes de publicarlas, aprovechando la baja latencia esperable de un modelo de 22,7 millones de parámetros.
- Filtrado de spam y texto generado en formularios web: como clasificador ligero, puede ejecutarse en el mismo servidor que recibe el formulario y descartar envíos sintéticos sin coste adicional de API.
- Investigación académica sobre detección de IA: sirve como baseline reproducible para comparar estrategias de ajuste fino de sentence transformers en tareas de atribución de autoría.
- Auditoría de contenidos en medios de comunicación: triaje automatizado de artículos o notas de prensa para marcar aquellos con alta probabilidad de redacción automática antes de la revisión humana.
- Preprocesado en pipelines de curación de datos: filtrar texto sintético de un corpus de entrenamiento antes de usarlo para entrenar otros modelos, reduciendo el riesgo de colapso por recursión.
- Clasificación local en dispositivos sin GPU: al requerir menos de 100 MB en fp32, puede desplegarse en portátiles, contenedores pequeños o funciones serverless con memoria limitada.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| Exactitud baseline | 0,8449014567266495 |
| Precisión micro baseline | 0,8449014567266495 |
| Recall micro baseline | 0,8449014567266495 |
| F1 micro baseline | 0,8449014567266495 |
| Precisión macro baseline | 0,8450727402691569 |
| Recall macro baseline | 0,8449014567266495 |
| F1 macro baseline | 0,8448822077960227 |
| Exactitud de test tras ajuste fino | 0,9899 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, SuperGLUE) ni comparaciones con detectores de referencia en la información disponible. Tampoco se especifica el número de ejemplos del conjunto de test, la distribución de clases ni el umbral de decisión empleado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 91 MB solo para los pesos (22,7 M × 4 bytes), más activaciones y overhead del runtime; en la práctica menos de 500 MB en total.
- VRAM estimada en fp16/bf16: aproximadamente 45 MB para los pesos.
- VRAM estimada en int8: aproximadamente 23 MB para los pesos, si se aplica cuantización dinámica con PyTorch o bitsandbytes.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas GTX 1050, GTX 1650, RTX 3050, RTX 4060 y superiores. También es viable en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference, HuggingFace Inference Endpoints, ONNX Runtime, y conversión propia a GGUF/llama.cpp mediante herramientas externas (no verificada por el autor).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento reportado | Disponibilidad |
|---|---|---|---|---|---|
| kevincai04/hw1-hc3-detector | 22.713.986 | no disponible | no disponible | 0,9899 exactitud de test (dataset no descrito) | HuggingFace, 3 descargas |
| aisaro/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| hw1-hc3-detector (Yihangsun) | no disponible | no disponible | no disponible | no disponible | HuggingFace / savrn.com |
| hongjip/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace / free2aitools.com |
| AIGC_detector_zhv2 (abdullahwaheed2804) | no disponible | no disponible | no disponible | comparable a detectores chinos cerrados según el repositorio | GitHub y HuggingFace |

Los tres primeros modelos comparables parecen variantes del mismo ejercicio académico publicadas por distintos alumnos, con el mismo nombre de repositorio y sin documentación sustancial. No se dispone de datos suficientes para comparar arquitectura, contexto o licencia con alternativas comerciales como GPTZero, Originality.ai o el clasificador de OpenAI, cuyos pesos no son abiertos.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: no se puede determinar si el uso comercial está permitido. Tratarlo como no apto para producción hasta que el autor lo aclare.
- Idiomas no declarados: se desconoce si el modelo funciona en castellano, en inglés o en ambos. La evaluación se hizo sobre un dataset no descrito.
- Riesgo elevado de sobreajuste al dataset de la tarea: la diferencia entre baseline (0,8449) y test (0,9899) es muy grande y no se documenta la separación entre train y test, por lo que no puede descartarse fuga de datos.
- Sesgos desconocidos: al no publicarse la composición del corpus, no es posible evaluar sesgos por género, origen, registro o variedad dialectal.
- Alucinación no aplicable en sentido generativo, pero sí riesgo de falsos positivos: un clasificador de este tipo puede etiquetar como "IA" textos humanos con estilo formulaico o muy uniforme.
- Robustez limitada ante textos largos: los encoders BERT truncan habitualmente a 512 tokens, lo que impide clasificar documentos completos sin fragmentarlos.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: es un clasificador puro, no un modelo de propósito general.
- Tracción mínima: 3 descargas y 1 like, sin issues, discusiones ni mantenimiento conocido. No hay garantía de soporte.
- Fecha de creación declarada como 2026-09-30, posterior a la fecha habitual de publicación de modelos; conviene verificar la trazabilidad del repositorio.
- Se recomienda validar el modelo sobre un conjunto propio etiquetado antes de cualquier uso con consecuencias reales (sanciones académicas, moderación de contenido).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kevincai04/hw1-hc3-detector
- Variante con el mismo nombre de aisaro: https://huggingface.co/aisaro/hw1-hc3-detector
- Ficha de hw1-hc3-detector en savrn.com: https://savrn.com/models/hw1-hc3-detector
- Repositorio AI-detection de abdullahwaheed2804 en GitHub: https://github.com/abdullahwaheed2804/AI-detection
- Ficha de hongjip/hw1-hc3-detector en free2aitools: https://free2aitools.com/model/hongjip/hw1-hc3-detector
