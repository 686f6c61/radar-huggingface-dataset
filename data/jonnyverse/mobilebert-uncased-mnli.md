# JONNYVERSE/mobilebert-uncased-mnli

## Resumen

El modelo `JONNYVERSE/mobilebert-uncased-mnli` es una conversión a formato ONNX del modelo `typeform/mobilebert-uncased-mnli`, diseñada para ser compatible con la librería Transformers.js. Esto permite ejecutar clasificación zero-shot directamente en el navegador o en entornos JavaScript sin necesidad de un servidor dedicado. El modelo original es una versión fine-tuned de MobileBERT sobre el dataset Multi-Genre Natural Language Inference (MNLI), lo que le otorga capacidad para inferir relaciones de implicación entre premisa e hipótesis y, por extensión, realizar clasificación de texto sin entrenamiento previo.

MobileBERT es una arquitectura compacta derivada de BERT, desarrollada por Google Research, que reduce significativamente el número de parámetros (aproximadamente 25,3 millones) manteniendo un rendimiento cercano al de BERT base. Esta versión concreta está pensada para entornos con recursos limitados, como dispositivos móviles o aplicaciones web, donde el tamaño y la latencia son críticos. Su relevancia actual radica en la creciente demanda de modelos de IA que puedan ejecutarse localmente en el cliente, reduciendo costes de infraestructura y mejorando la privacidad.

El repositorio tiene un tamaño de 0,4 GB y fue creado en agosto de 2026. No se especifica licencia ni idiomas soportados en la ficha de HuggingFace, aunque el modelo base está entrenado principalmente en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileBERT (BERT con bottleneck y transferencia de conocimiento) |
| Parametros totales | 25,3 millones (aproximadamente, segun el modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos ONNX, sin informacion sobre cuantizacion) |
| Idiomas soportados | Ingles (uncased) |
| Licencia | No disponible |
| Formato de pesos | ONNX (compatible con Transformers.js) |

## Arquitectura y entrenamiento

MobileBERT es una versión compacta de BERT que emplea una arquitectura de "cuello de botella" (bottleneck) para reducir la dimensión oculta interna, combinada con una técnica de transferencia de conocimiento desde un BERT grande durante el pre-entrenamiento. El modelo resultante tiene 24 capas, una dimensión oculta de 128 en el cuello de botella y 512 en la salida, logrando una reducción de parámetros de aproximadamente 4,3 veces frente a BERT base, con una velocidad de inferencia superior.

El proceso de entrenamiento consta de dos fases: primero, un pre-entrenamiento en texto inglés genérico (similar a BERT), y después un fine-tuning específico sobre el dataset Multi-Genre Natural Language Inference (MNLI). Este dataset contiene pares de premisa-hipótesis etiquetados como implicación, contradicción o neutral, lo que permite al modelo aprender relaciones semánticas entre frases. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en la información disponible.

La conversión a ONNX se realizó para permitir su ejecución con Transformers.js, lo que implica que los pesos han sido exportados al formato ONNX (posiblemente con operadores optimizados para ejecución en navegador). No se indica si se aplicó cuantización adicional.

## Capacidades

- Clasificación zero-shot: puede clasificar textos en categorías arbitrarias sin necesidad de entrenamiento específico, utilizando el enfoque de entailment (implicación).
- Clasificación de texto: apto para tareas como análisis de sentimiento, detección de temas o moderación de contenido.
- Inferencia de lenguaje natural (NLI): determina si una hipótesis se deduce de una premisa, con tres posibles etiquetas (entailment, contradiction, neutral).
- Ejecución en cliente: gracias a su formato ONNX, puede ejecutarse en navegadores web y entornos Node.js mediante Transformers.js, sin servidor.
- Modelo compacto: su pequeño tamaño (25,3 M parámetros) lo hace adecuado para dispositivos con memoria limitada.
- No soporta tool calling, agentes, visión ni audio; es exclusivamente un modelo de texto.

## Casos de uso

- Análisis de sentimiento en aplicaciones web: el modelo puede clasificar reseñas o comentarios de usuarios en categorías como positivo, negativo o neutral directamente en el navegador, reduciendo la latencia y los costes de API.
- Moderación de contenido en foros o redes sociales: se puede emplear para detectar mensajes que contradicen las normas de la comunidad, clasificando cada texto en categorías como "aceptable" o "inaceptable" mediante zero-shot.
- Clasificación de tickets de soporte: integrado en un sistema de atención al cliente, puede asignar automáticamente cada ticket a un departamento (facturación, técnico, ventas) sin necesidad de etiquetado manual previo.
- Búsqueda semántica de documentos: dado un texto de consulta, el modelo puede clasificar fragmentos de documentos según su relevancia para la consulta, facilitando la recuperación de información en motores de búsqueda internos.
- Filtrado de correo electrónico: puede clasificar correos en categorías como "spam", "importante" o "promocional" utilizando el enfoque zero-shot, adaptándose a las necesidades del usuario sin reentrenamiento.
- Etiquetado automático de artículos o noticias: el modelo puede asignar categorías temáticas (política, deportes, tecnología) a textos periodísticos, ayudando en la organización de contenidos en portales de noticias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `typeform/mobilebert-uncased-mnli` no incluye métricas en su model card, y el repositorio de `JONNYVERSE` tampoco las proporciona. Se recomienda consultar el paper original de MobileBERT (arXiv:1910.09700) para conocer el rendimiento general de la arquitectura, aunque los resultados específicos para la tarea MNLI no están disponibles en esta ficha.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 25,3 millones de parámetros, puede ejecutarse en CPU sin necesidad de GPU. En formato ONNX, el uso de memoria es reducido (aproximadamente 100-200 MB en memoria RAM, dependiendo de la cuantización).
- GPU recomendadas: no es necesario usar GPU; cualquier CPU moderna puede ejecutar inferencias en menos de 100 ms por ejemplo. Si se usa GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo, incluso integradas.
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime (Python, C++, etc.), o servidores de inferencia como Hugging Face Inference Endpoints.
- Latencia y throughput: en CPU, la inferencia tarda entre 10 y 50 ms por ejemplo (dependiendo de la longitud del texto). En GPU, la latencia puede ser inferior a 5 ms. No se dispone de cifras exactas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Formato |
|---|---|---|---|---|---|
| JONNYVERSE/mobilebert-uncased-mnli (ONNX) | 25,3 M | 512 | Zero-shot classification | No disponible | ONNX |
| typeform/mobilebert-uncased-mnli | 25,3 M | 512 | Zero-shot classification | No disponible | PyTorch / Safetensors |
| BART-large-mnli (facebook) | 406 M | 1024 | Zero-shot classification | Apache 2.0 | PyTorch |
| DeBERTa-v3-base-mnli (MoritzLaurer) | 184 M | 512 | Zero-shot classification | MIT | PyTorch |

La comparativa muestra que MobileBERT es significativamente más pequeño que las alternativas, lo que lo hace más rápido y ligero, aunque probablemente con menor precisión en tareas complejas. BART-large-mnli ofrece mejor rendimiento en muchos benchmarks, pero requiere más recursos. DeBERTa-v3-base-mnli es un equilibrio entre tamaño y rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al estar pre-entrenado en inglés, puede reflejar sesgos de género, raza o cultura presentes en los datos de entrenamiento. No se han documentado medidas específicas de mitigación.
- Riesgo de alucinación: como modelo de lenguaje, puede generar clasificaciones incorrectas o inconsistentes, especialmente en dominios especializados o con textos ambiguos.
- Limitaciones de contexto: la ventana de 512 tokens limita la clasificación de textos largos; para documentos extensos es necesario truncar o dividir el contenido.
- Limitaciones de idioma: el modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas es muy limitado o nulo.
- Restricciones de licencia: la licencia no está especificada en el repositorio, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor o verificar la licencia del modelo base original.
- Consideraciones para producción: al ser un modelo pequeño, su precisión puede ser inferior a la de modelos más grandes en tareas complejas. Se recomienda evaluar su rendimiento en el dominio específico antes de desplegarlo en entornos críticos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/JONNYVERSE/mobilebert-uncased-mnli
- Modelo base (typeform): https://huggingface.co/typeform/mobilebert-uncased-mnli
- Paper de MobileBERT: https://arxiv.org/abs/1910.09700
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Biblioteca Optimum para conversión a ONNX: https://huggingface.co/docs/optimum/index
