# dendriteholdings/Ingot-IV-27B-FP8

## Resumen

Ingot-IV-27B-FP8 es un modelo de lenguaje de 27.781.427.952 parámetros (27,78 mil millones) publicado por el usuario de HuggingFace `dendriteholdings` como espejo público de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene más cerca del original. No es, por tanto, un modelo entrenado desde cero ni un fine-tuning: es el resultado de un proceso de cuantización competitivo, subido byte a byte tal como lo entregó el minero con hotkey `5ELtmc7ccyz8ACS8eYBzwStGMqwxcQCHd7eDpyH4BijPS6gd` (uid 180).

El repositorio declara el tag de arquitectura `qwen3_5`, lo que sitúa el modelo base en la familia Qwen3.5, y el pipeline no está definido. El peso del repositorio es de 30,9 GB, coherente con un checkpoint en FP8 de ~27,8 mil millones de parámetros (aproximadamente 1 byte por parámetro más tokenizer, configuración y metadatos).

Su relevancia es doble: por un lado, documenta un caso real de cuantización evaluada por proximidad al profesor (un criterio distinto de las métricas habituales de benchmarks); por otro, permite estudiar empíricamente cuánta degradación introduce una cuantización FP8 ganadora de concurso frente al modelo de referencia. La información publicada es mínima: no hay model card técnica, ni licencia declarada, ni idiomas, ni contexto, ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3.5 (tag `qwen3_5` en el repositorio); número de capas, dimensionalidad y tipo de atención no disponibles |
| Parametros totales | 27.781.427.952 (27,78 mil millones), dato real de los safetensors |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 en pesos; no se documenta el esquema exacto (E4M3/E5M2), la granularidad (per-tensor, per-channel, per-block) ni si hay escalas por grupo |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (FP8); tamano del repo 30,9 GB |
| Pipeline declarado | no disponible |
| Procedencia | espejo de la submission ganadora de la subred Ingot (Bittensor), minero uid 180 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un transformer denso de la familia Qwen3.5, según el tag `qwen3_5`. No se publican detalles sobre número de capas, cabezas de atención, uso de atención lineal o híbrida, ni sobre la posible incorporación de modos de razonamiento extendido propios de la familia. Tampoco se especifica si el modelo conserva la torre de visión o si es exclusivamente de texto.

En cuanto al proceso de producción, no hay entrenamiento involucrado por parte del publicador: el checkpoint es la salida de un pipeline de cuantización a FP8 ejecutado por un minero de la subred Ingot. El criterio de selección declarado es la cercanía al modelo profesor fijo (el validador corona "la copia que se mantiene más cerca" de él), pero no se detalla la métrica exacta empleada (divergencia KL sobre un corpus de calibración, perplejidad, similitud de logits, etc.), ni el conjunto de calibración, ni el algoritmo de cuantización (GPTQ, AWQ, RTN, SmoothQuant u otro). Tampoco se indica qué modelo profesor concreto se usó como referencia, aunque el tag de arquitectura sugiere que pertenece a la familia Qwen3.5.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5 (no verificadas en este checkpoint por falta de evaluación publicada).
- Razonamiento y matemáticas: capacidad esperable por el tamaño (27,78 mil millones de parámetros), sin datos que la cuantifiquen.
- Generación de código: no documentada explícitamente; el tag de arquitectura sugiere el mismo perfil que el modelo base.
- Tool calling / function calling: no disponible (no se publica plantilla de chat ni configuración de herramientas).
- Comportamiento agéntico y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Valor añadido real del artefacto: servir como checkpoint FP8 listo para servir en GPUs con soporte nativo de FP8, y como material de estudio de cuantización evaluada por fidelidad al profesor.

## Casos de uso

- Despliegue en producción con VRAM ajustada: al ocupar aproximadamente 27,8 GB en pesos FP8, el modelo se puede servir en una única GPU de 40 GB (A100, L40S) o 48 GB (RTX 6000 Ada) dejando margen para caché KV, algo inviable con el mismo modelo en BF16.
- Servicio de chat multi-turno en vLLM o SGLang: FP8 es un formato soportado de forma nativa por estos motores en GPUs Ada y Hopper, lo que permite activar kernels FP8 sin conversión previa.
- Investigación sobre cuantización: comparar las salidas de este checkpoint contra el profesor en BF16 (perplejidad, divergencia de logits, tasas de alucinación) para medir el coste real de una cuantización FP8 optimizada por proximidad.
- Réplica de experimentos de la subred Ingot: el repositorio permite reproducir la evaluación del validador sobre una submission ganadora concreta y estudiar qué se premia exactamente.
- Procesamiento por lotes offline de documentos largos: generación de resúmenes, extracción de entidades o clasificación sobre corpus, siempre que se valide empíricamente la ventana de contexto real del checkpoint.
- Base para cuantizaciones posteriores a 4 bits: partir de este FP8 para generar GGUF o AWQ y comparar la degradación acumulada frente a cuantizar directamente desde BF16.
- Evaluación interna de proveedores: incluirlo como candidato en una batería propia de tareas antes de adoptar un modelo de ~28B en una arquitectura de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único criterio de rendimiento documentado es cualitativo: el modelo fue coronado en la subred Ingot por mantenerse más cerca del profesor que el resto de submissions, pero no se publican ni la métrica, ni su valor, ni el margen frente a los competidores, ni comparaciones en MMLU, HumanEval, GSM8K o similares.

## Requisitos de hardware

- VRAM para inferencia: ~27,8 GB solo en pesos. Con caché KV para contextos moderados, presupuestar 32-40 GB en total.
- GPU recomendadas: H100 80 GB (holgada, permite lotes grandes), A100 40 GB o L40S 48 GB (ajustadas), RTX 6000 Ada 48 GB (consumer/prosumer de gama alta).
- GPUs consumer: no cabe en una RTX 4090 o 5090 de 24 GB por sí sola; requiere sharding en 2 GPUs (tensor parallel) o cuantización adicional a 4 bits. En GPUs Ampere (A100, RTX 30xx) los kernels FP8 no están disponibles de forma nativa y el motor suele dequantizar a BF16, elevando el requisito a ~55 GB.
- Opciones de despliegue: vLLM y SGLang (soporte FP8 nativo en sm89/sm90); TGI según versión; llama.cpp y Ollama solo tras convertir a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-IV-27B-FP8 | 27,78 mil millones (density no confirmada) | no disponible | safetensors FP8 | no disponible | repo publico, 0 descargas |
| Modelo profesor de la familia Qwen3.5 (referencia) | no disponible | no disponible | BF16 (habitual) | no disponible en esta ficha | a traves del repo original del autor del modelo base |
| Qwen3-32B en FP8 | 32,8 mil millones (dato del modelo base publico) | 32 768 tokens nativos, ampliable con YaRN (segun documentacion del modelo base) | safetensors FP8 | Apache-2.0 (segun documentacion del modelo base) | ampliamente disponible |
| Qwen3-30B-A3B en FP8 | 30,5 mil millones totales, 3,3 mil millones activos (MoE) | 32 768 tokens nativos, ampliable con YaRN (segun documentacion del modelo base) | safetensors FP8 | Apache-2.0 (segun documentacion del modelo base) | ampliamente disponible |

La comparación es estructural, no de rendimiento: no existen evaluaciones publicadas de Ingot-IV-27B-FP8 que permitan situarlo frente a estas alternativas. Los datos de las filas de Qwen3 provienen de la documentación pública de esos modelos base y se incluyen solo como referencia de categoría; conviene verificarlos en sus repositorios antes de citarlos.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial; además, la licencia efectiva depende de la del modelo profesor, que tampoco se identifica. Bloqueante para producción hasta aclararlo.
- Procedencia indirecta: es un espejo de una submission de concurso subida "byte a byte"; no hay garantía del publicador sobre el contenido, ni proceso de revisión, ni model card técnica.
- Ausencia total de evaluación: 0 descargas y 0 likes, sin benchmarks, sin pruebas de regresión y sin verificación independiente de que las capacidades del profesor se preserven.
- Riesgo de degradación por cuantización: FP8 suele ser benigno, pero el efecto depende de la granularidad y del corpus de calibración, ambos desconocidos. Es esperable cierto deterioro en tareas sensibles a la precisión numérica (aritmética de varios pasos, código con dependencias sutiles).
- Riesgo de alucinación: no cuantificado; sin datos de evaluación no se puede acotar.
- Contexto e idiomas desconocidos: no se declara ventana de contexto ni cobertura lingüística, lo que impide dimensionar caché KV o garantizar calidad en castellano.
- Plantilla de chat y tokenizer no documentados: aunque el repositorio incluya los ficheros habituales, no se especifica la plantilla correcta; usar una incorrecta degrada gravemente las respuestas.
- Herramientas y modo agéntico sin confirmar: no hay evidencia de soporte de function calling en este checkpoint concreto.
- Metadatos anómalos: las fechas de creación y actualización registradas (2026-10-17) y la ausencia de pipeline dificultan la trazabilidad; conviene contrastar con el repositorio del modelo base antes de cualquier adopción.
- Sesgos: no documentados; heredables del profesor y de su mezcla de datos, sin que este repositorio aporte información al respecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-IV-27B-FP8
- Subred Ingot (Bittensor): no disponible en la informacion proporcionada
- Modelo profesor: no identificado en la informacion proporcionada
- Paper o blog tecnico del proceso de cuantizacion: no disponible
- Resultados de la evaluacion del validador: no disponibles
