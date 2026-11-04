# DakeraAI/gliner_multi-v2.1-int8

## Resumen

`DakeraAI/gliner_multi-v2.1-int8` es una versión cuantizada a int8 y exportada a ONNX del modelo GLiNER multilingüe original de urchade (`urchade/gliner_multi-v2.1`). GLiNER (Generalist Model for Named Entity Recognition using Bidirectional Transformer) es un modelo de reconocimiento de entidades nombradas zero-shot: en lugar de tener un conjunto fijo de etiquetas, recibe las etiquetas deseadas como parte del prompt y extrae las menciones correspondientes del texto. Esta build la publica Dakera, empresa detrás de un motor de memoria autoalojado para agentes de IA, para usarla como extractor de entidades en su pipeline en CPU.

El modelo es un uni-encoder basado en un transformer bidireccional (el paper de referencia es arXiv:2311.08526). Esta versión concreta no reentrena nada: parte del checkpoint PyTorch original, factoriza exactamente la cabeza de spans (separando las partes de inicio y fin para calcularlas una vez por palabra en lugar de por span) y cuantiza los pesos a 8 bits por bloques (`MatMulNBits`, bloque 32, simétrico), manteniendo las activaciones en FP32. El resultado son 366,1 MB de grafo ONNX que, según el autor, conservan las mismas entidades que el original (correlación de logits ≥ 0,986 y 99 % de entidades idénticas en frases de prueba multilingües).

Es relevante ahora porque permite ejecutar un NER multilingüe zero-shot en CPU con latencia baja (mediana de 0,051 s por petición en el conjunto de chat del autor) y sin GPU, algo útil para pipelines de memoria de agentes, enriquecimiento de documentos y extracción de entidades en despliegues autoalojados. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (uni-encoder GLiNER) con cabeza de spans factorizada; exportado a ONNX |
| Parametros totales | no disponible (el repo ocupa 0,4 GB; el grafo ONNX int8 pesa 366,1 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (spans de hasta 12 palabras; longitud máxima de secuencia no indicada en la información proporcionada) |
| Tipos de cuantizacion | int8 por bloques (`MatMulNBits`, bloque 32, simétrico) en pesos; activaciones en FP32; embedding de palabras int8 por fila |
| Idiomas soportados | multilingüe (evaluado en de, en, es, fr, hi, it, pt, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, 366,1 MB) + `tokenizer.json` (16,0 MB) + `gliner_config.json` (2,7 kB) |

## Arquitectura y entrenamiento

El modelo subyacente es GLiNER, un uni-encoder que concatena las etiquetas objetivo con el texto de entrada en el formato `<<ENT>> label … <<SEP>> text words` y predice, mediante una cabeza de spans, qué fragmentos del texto corresponden a cada etiqueta. Es un enfoque zero-shot: las etiquetas no están fijadas en el entrenamiento, sino que se proporcionan en inferencia. El modelo original se entrenó sobre corpus de NER y se describe en el paper arXiv:2311.08526; los detalles completos de datos, número de tokens y posible RLHF/DPO no están recogidos en la información proporcionada y deben consultarse en la model card original.

Esta build de Dakera introduce dos cambios técnicos: (1) la factorización exacta de la cabeza de spans, separando la primera capa densa en una parte de inicio y otra de fin calculadas una vez por palabra y plegando la última capa en el lado de las etiquetas, de modo que el coste pasa de ser por span a ser por palabra (diferencia máxima de logits de 1,1e-05); y (2) la cuantización de pesos a int8 por bloques, manteniendo las activaciones en FP32 porque, según el autor, cuantizar las activaciones es lo que hace que otras exportaciones uniformemente cuantizadas de GLiNER no encuentren entidades. La tokenización se realiza sobre palabras pre-segmentadas (secuencias de letras, marcas y dígitos unidas por `-` o `_`, cualquier otro carácter por separado y cada carácter chino o japonés por separado), con spans de hasta 12 palabras y umbral sigmoide de 0,5.

## Capacidades

- Extracción de entidades nombradas zero-shot: las etiquetas se definen en tiempo de inferencia, sin reentrenamiento.
- Reconocimiento multilingüe: evaluado en alemán, inglés, español, francés, hindi, italiano, portugués y chino.
- Token classification sobre texto pre-segmentado en palabras, con spans de hasta 12 palabras.
- Inferencia en CPU mediante ONNX Runtime, con prepacking de pesos activado por defecto.
- No es un modelo generativo: no produce texto libre, no hace razonamiento multi-step ni tool calling.
- No soporta visión, audio ni modo thinking.
- No se documentan capacidades de function calling ni de agentes más allá de su uso como componente de extracción dentro de un pipeline (Dakera lo integra en su motor de memoria).

## Casos de uso

- Memoria de agentes de IA: extraer personas, organizaciones y ubicaciones de las conversaciones para indexarlas y recuperarlas en un motor de memoria autoalojado; Dakera lo usa con `DAKERA_GLINER_MODEL=gliner-multi` junto a un modelo de embeddings multilingüe.
- Enriquecimiento de documentos multilingües: procesar lotes de textos en varios idiomas y poblar una base de datos con entidades etiquetadas, aprovechando que las etiquetas se definen por caso de uso sin reentrenar.
- Anonimización y redacción de PII: definir etiquetas como `person`, `email` o `phone` en tiempo de inferencia y sustituir las menciones detectadas antes de almacenar o compartir texto.
- Análisis de redes sociales y foros: el autor reporta F1 de 0,64 en WNUT-17, un conjunto de redes sociales en inglés, lo que lo hace utilizable para extracción de entidades en texto informal, con las cautelas de ese rendimiento.
- Extracción de entidades en noticias y documentos formales: F1 de 0,69 en CoNLL-2003 (inglés, noticias), adecuado para pipelines de indexación de prensa o informes.
- Despliegue en entornos sin GPU: al ser un grafo ONNX int8 de 366,1 MB con latencia mediana de 0,051 s por petición en CPU (Ryzen 9 7950X, un hilo), encaja en servidores modestos, contenedores y edge.
- Construcción de un servicio de NER como microservicio: al ser ONNX Runtime, se puede servir con un runtime ligero en cualquier lenguaje con bindings ONNX, sin dependencia de PyTorch.

## Benchmarks y rendimiento

Datos reportados por el autor, medidos a través de su propio pipeline de extracción (umbral 0,5; etiquetas `person`, `organization`, `location`; ONNX Runtime 1.31 con prepacking de pesos, un hilo de CPU por pasada en un AMD Ryzen 9 7950X):

| Conjunto | F1 |
|---|---|
| Dakera chat sentences, inglés (20 frases; 10 etiquetas) | 0,82 |
| Dakera chat sentences, 7 idiomas (44 frases; 10 etiquetas) | 0,77 |
| WNUT-17 (redes sociales, inglés) | 0,64 |
| CoNLL-2003 (noticias, inglés) | 0,69 |

MultiCoNER v2 (150 frases por idioma):

| de | en | es | fr | hi | it | pt | zh |
|---|---|---|---|---|---|---|---|
| 0,57 | 0,61 | 0,63 | 0,62 | 0,55 | 0,73 | 0,64 | 0,40 |

Latencia: mediana de 0,051 s por petición en el conjunto de chat. No se proporcionan comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el grafo ONNX int8 ocupa 366,1 MB en disco y se ejecuta en CPU con ONNX Runtime.
- GPU recomendadas: no aplica para esta build; está pensada para inferencia en CPU.
- CPU: el autor reporta mediciones en un AMD Ryzen 9 7950X con un hilo por pasada; no se especifican requisitos mínimos de CPU.
- Cabe en cualquier máquina con suficiente RAM para cargar el grafo y el tokenizador (16,0 MB); no se indica un mínimo oficial.
- Despliegue: ONNX Runtime (con prepacking de pesos activado por defecto; sin él, el autor indica que las MatMul de 8 bits reempaquetan pesos en cada ejecución y son 4-5× más lentas). También se puede usar dentro de Dakera vía `docker run -p 3000:3000 -e DAKERA_ROOT_API_KEY=dk-mykey ghcr.io/dakera-ai/dakera:latest`.
- Latencia: mediana de 0,051 s por petición en el conjunto de chat del autor. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DakeraAI/gliner_multi-v2.1-int8 | no disponible (366,1 MB int8) | no disponible | ONNX int8 | Apache-2.0 | Zero-shot NER multilingüe, inferencia en CPU |
| urchade/gliner_multi-v2.1 (original) | no disponible | no disponible | PyTorch (safetensors) | Apache-2.0 | Modelo base; requiere PyTorch y normalmente GPU |
| Otros NER multilingües tipo spaCy / XLM-R | no disponible | no disponible | varios | varios | No se dispone de comparación numérica en la información proporcionada |

No se han publicado en la información disponible comparaciones directas con alternativas concretas; la comparativa se limita al modelo original del que deriva.

## Limitaciones y advertencias

- Es un modelo de NER, no generativo: no responde preguntas, no razona ni genera texto.
- Rendimiento variable por idioma: el propio autor reporta F1 de 0,40 en chino en MultiCoNER v2 y 0,55 en hindi, frente a 0,73 en italiano; el rendimiento en chino es notablemente inferior.
- Rendimiento moderado en dominios ruidosos: F1 de 0,64 en WNUT-17 (redes sociales).
- Las métricas del autor se han medido en su propio pipeline y con sus propios conjuntos de chat, por lo que no son directamente comparables con evaluaciones externas.
- Dependencia de la segmentación en palabras: el tokenizador espera texto pre-segmentado con reglas concretas (incluido separar cada carácter chino o japonés); un preprocesado distinto puede degradar los resultados.
- Spans limitados a 12 palabras: entidades más largas pueden no detectarse correctamente.
- Riesgo de falsos positivos y negativos inherente al umbral fijo de 0,5; no se documenta calibración por dominio.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al derivar de un modelo entrenado con corpus multilingües, puede heredar los sesgos de esos datos.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo original; no se ofrece garantía.
- El autor indica que la cuantización uniforme de activaciones rompe el modelo; si se reexporta, hay que mantener las activaciones en FP32.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DakeraAI/gliner_multi-v2.1-int8
- Modelo original: https://huggingface.co/urchade/gliner_multi-v2.1
- Paper GLiNER (arXiv:2311.08526): https://arxiv.org/abs/2311.08526
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Licencia: https://huggingface.co/DakeraAI/gliner_multi-v2.1-int8/blob/main/LICENSE
