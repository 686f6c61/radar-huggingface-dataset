# manyata-saxena/veilguard-injection-detector

## Resumen

Veilguard-injection-detector es un modelo de clasificación de texto publicado en Hugging Face por el usuario manyata-saxena. Por su nombre y su pipeline (`text-classification`), está orientado a la detección de inyecciones de prompt (prompt injection), un problema de seguridad relevante en aplicaciones que integran modelos de lenguaje con herramientas externas y datos no confiables. El modelo se distribuye en formato safetensors y es compatible con la librería transformers.

La arquitectura declarada en los tags del repositorio es DistilBERT, un transformer encoder destilado de BERT. El recuento real de parámetros en los pesos safetensors es de 66.955.010, un tamaño coherente con una cabeza de clasificación sobre un encoder de tipo DistilBERT. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

La model card es la plantilla automática de Hugging Face y no aporta información sobre datos de entrenamiento, licencia, idiomas ni evaluación. Por tanto, esta ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo lo que el autor no ha documentado. Es relevante ahora porque la detección de prompt injection es una necesidad creciente en despliegues de agentes, pero su falta de documentación limita seriamente su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado), según tags del repositorio |
| Parametros totales | 66.955.010 (pesos safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite típicamente 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder con atención bidireccional obtenido mediante destilación de conocimiento a partir de BERT. El recuento de 66,9 millones de parámetros es consistente con un DistilBERT base más una cabeza de clasificación para la tarea de detección de inyecciones. Al ser un encoder, no genera texto: produce una etiqueta de clasificación por secuencia de entrada.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el proceso de anotación ni si se aplicó algún ajuste fino adicional. La model card no documenta hiperparámetros, régimen de precisión ni infraestructura de cómputo. Tampoco se indica si el modelo parte de un checkpoint preentrenado público de DistilBERT o de un entrenamiento desde cero.

## Capacidades

- Clasificación de texto binaria o multiclase orientada a la detección de prompt injection, según el nombre del modelo y su pipeline.
- Procesamiento de entradas de texto cortas o medias, propio de un encoder con ventana limitada.
- Integración con la librería transformers mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatibilidad declarada con text-embeddings-inference y con endpoints de Hugging Face.
- No dispone de generación de texto, razonamiento multi-paso, tool calling ni capacidades de agente.
- No se documentan capacidades multilingües, de visión ni de audio.

## Casos de uso

- Filtro de seguridad en pipelines de LLM: colocar el clasificador antes de la llamada al modelo generativo para etiquetar entradas sospechosas de intentar manipular instrucciones del sistema. Su tamaño reducido permite evaluarlo en cada petición con coste bajo.
- Moderación de entradas en aplicaciones de chat: clasificar mensajes de usuario en busca de patrones de inyección antes de que lleguen al prompt del sistema, como capa adicional a las reglas heurísticas.
- Protección de agentes con acceso a herramientas: validar los argumentos y el texto libre que el usuario introduce en flujos donde el agente puede ejecutar funciones, evitando que instrucciones maliciosas alteren el comportamiento previsto.
- Enriquecimiento de logs de seguridad: etiquetar automáticamente conversaciones almacenadas para auditar intentos de manipulación y construir métricas de incidentes.
- Evaluación de datasets de red teaming: usar el clasificador para etiquetar corpus de prompts y medir la prevalencia de intentos de inyección en un conjunto de datos.
- Prototipado rápido en entornos con recursos limitados: al tratarse de un modelo de 67 millones de parámetros, puede ejecutarse en CPU para pruebas de concepto y validar si la aproximación es útil antes de invertir en un detector más grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (67 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16: aproximadamente 0,13 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090 y similares; también puede ejecutarse en CPU.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference (declarado compatible), endpoints de Hugging Face. No se confirma soporte de llama.cpp, Ollama ni vLLM, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles; para un encoder de este tamaño se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veilguard-injection-detector | 66,9 M | no disponible | Clasificación (detección de inyección) | no disponible | Hugging Face |
| DistilBERT base (Sanh et al., 2019) | 66 M | 512 tokens | Clasificación general / encoder | Apache 2.0 | Hugging Face |
| ProtectAI deberta-v3-base-prompt-injection | no disponible en esta consulta | no disponible | Detección de prompt injection | no disponible en esta consulta | Hugging Face |

La comparación con DistilBERT base es estructural: comparten orden de magnitud de parámetros, pero el modelo de veilguard está especializado en una tarea concreta y no documenta su procedencia ni su licencia. Frente a detectores de prompt injection más establecidos, la falta de benchmarks y de model card impide una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card es la plantilla automática: no hay información sobre sesgos, datos de entrenamiento ni evaluación.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- No hay benchmarks publicados, por lo que se desconoce la tasa de falsos positivos y falsos negativos en detección de inyección.
- Riesgo de alucinación no aplicable en sentido estricto al ser un clasificador, pero sí riesgo de clasificaciones erróneas no calibradas.
- Al ser un encoder con ventana limitada (probablemente 512 tokens), no puede analizar conversaciones largas sin truncado o segmentación.
- No se documentan los idiomas soportados; el comportamiento en castellano es desconocido.
- El repositorio no tiene descargas ni likes, lo que sugiere ausencia de validación por parte de la comunidad.
- Un detector basado en un modelo pequeño puede ser evadido con técnicas de ofuscación, codificación o reformulación; no debe ser la única capa de defensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manyata-saxena/veilguard-injection-detector
- Paper de DistilBERT (referencia arquitectónica): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://ml2co2.github.io/impact
