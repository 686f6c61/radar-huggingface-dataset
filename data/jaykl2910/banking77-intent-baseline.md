# Jaykl2910/banking77-intent-baseline

## Resumen

Jaykl2910/banking77-intent-baseline es un modelo de clasificación de texto publicado en HuggingFace por el usuario Jaykl2910. Por su identificador y por la etiqueta de arquitectura incluida en el repositorio (roberta), se trata de un encoder transformer de tipo RoBERTa afinado para clasificación de intenciones sobre el corpus Banking77, un conjunto de consultas bancarias en inglés con 77 categorías de intención. El recuento real de parámetros del archivo safetensors es de 124.704.845, cifra que coincide con el tamaño de roberta-base, lo que confirma que no hay una cabecera de clasificación de gran tamaño ni parámetros adicionales relevantes.

El modelo resuelve un problema muy concreto: asignar una etiqueta de intención a una frase corta de un cliente bancario, tarea típica en enrutamiento de tickets, atención al cliente automatizada y analítica de motivos de contacto. Su relevancia práctica es limitada por el momento: el repositorio no tiene descargas ni likes, la model card es la plantilla automática de HuggingFace sin ningún campo completado, y no se ha publicado información sobre datos de entrenamiento, hiperparámetros, métricas ni licencia.

Se trata, por tanto, de un artefacto reproducible a nivel de pesos (safetensors, 0,5 GB de repositorio, pipeline text-classification) pero opaco a nivel de documentación. Cualquier uso en producción exigiría verificar de forma externa el conjunto de etiquetas, el tokenizador asociado y los términos de licencia, ninguno de los cuales está declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (segun la etiqueta del repositorio); capa de clasificacion sobre el token de contexto |
| Parametros totales | 124.704.845 (dato real del archivo safetensors) |
| Parametros activos | No procede: el modelo es denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible (la model card no declara idiomas; por el nombre del dataset cabria esperar ingles, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta principal del repositorio es roberta, lo que sitúa el modelo en la familia de encoders transformer con atención bidireccional y tokenización por byte-level BPE. El recuento de parámetros (124,7 millones) es consistente con una configuración de tipo base: 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, más una capa de clasificación lineal sobre las 77 clases de intención. No hay evidencia en la informacion disponible de que se trate de un modelo MoE, híbrido ni de una arquitectura con atención lineal.

No se dispone de ningún dato sobre el procedimiento de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo ajuste fino supervisado, RLHF o DPO, ni hiperparámetros, ni precisión utilizada, ni hardware. La model card reproduce la plantilla automática de HuggingFace con todos los campos en «More Information Needed». La única referencia bibliográfica asociada al repositorio es el identificador arxiv:1910.09700, que corresponde al artículo de Lacoste et al. sobre el cálculo del impacto ambiental del aprendizaje automático, citado en la propia plantilla; no es el paper del modelo ni describe su arquitectura o su entrenamiento. Tampoco consta la publicación de resultados de evaluación.

## Capacidades

- Clasificación de texto en una sola etiqueta por secuencia: el pipeline declarado es text-classification, por lo que devuelve una distribución de probabilidad sobre el conjunto de clases y la etiqueta más probable.
- Clasificación de intenciones bancarias: el nombre del modelo apunta a un ajuste fino sobre las 77 intenciones del corpus Banking77, orientado a consultas cortas de clientes.
- Inferencia por lotes: al ser un encoder de 124,7 millones de parámetros, admite procesamiento por lotes con throughput alto en GPU y también en CPU.
- Extracción de logits por clase: los pesos pueden reutilizarse como extractor de características o como base para un clasificador propio sustituyendo la cabeza.
- Integración con ecosistema transformers: compatible con la librería transformers y con text-embeddings-inference según las etiquetas del repositorio.
- No disponible: soporte de tool calling o function calling.
- No disponible: capacidades de agente, razonamiento multi-paso o cadena de pensamiento.
- No disponible: generación de texto libre.
- No disponible: visión, audio u otras modalidades.
- No disponible: multilingüismo declarado; el modelo no especifica qué idiomas cubre.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el modelo clasifica la consulta entrante en una de las 77 intenciones y permite dirigirla al equipo o al flujo automatizado correspondiente, reduciendo el tiempo de primera asignación.
- Atención al cliente automatizada de primer nivel: para consultas cortas y frecuentes (bloqueo de tarjeta, estado de una transferencia), la etiqueta de intención predicha puede activar una respuesta predefinida sin necesidad de un modelo generativo.
- Reducción de coste en pipelines con LLM: colocado como clasificador previo, permite resolver con un encoder de 124 millones de parámetros los casos triviales y reservar el modelo generativo para las consultas ambiguas o de mayor complejidad.
- Analítica de motivos de contacto: etiquetar retroactivamente miles de conversaciones históricas para construir informes de volumen por tipo de incidencia, tendencias temporales y detección de picos.
- Detección de consultas fuera de alcance: si la confianza de la predicción es baja o la distribución se reparte entre varias clases, el sistema puede escalar a un agente humano en lugar de forzar una respuesta incorrecta.
- Ajuste fino posterior sobre taxonomías propias: al ser un encoder base de tamaño moderado, puede reentrenarse con un conjunto de etiquetas específico de una entidad sin requerir hardware de gran escala.
- Etiquetado asistido de datos: preanotar grandes volúmenes de consultas para que un equipo humano revise y corrija, acelerando la creación de datasets propios de intenciones.
- Clasificador previo en asistentes de voz o IVR: dado su bajo coste de inferencia, puede ejecutarse en el mismo nodo que el motor de voz para decidir la ruta de la llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación con datos, la ficha de HuggingFace no reporta métricas y el repositorio no tiene descargas ni discusiones con resultados de terceros. El identificador arxiv:1910.09700 asociado como etiqueta no es un benchmark del modelo, sino la referencia del calculador de impacto ambiental citado en la plantilla.

## Requisitos de hardware

- Peso de los pesos en precisión completa: 124.704.845 parámetros × 4 bytes ≈ 499 MB, coherente con el tamaño de repositorio declarado de 0,5 GB.
- VRAM estimada en fp16: aproximadamente 250 MB para los pesos, más overhead de activaciones y tokenizador; en la práctica cabe en menos de 1 GB.
- VRAM estimada en int8: alrededor de 125 MB para los pesos, con pérdida de precisión no cuantificada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 quedan muy por encima del requisito y solo se justifican por volumen de peticiones, no por tamaño del modelo.
- Cabe holgadamente en GPU de consumo: sí, en cualquier RTX o GTX con memoria suficiente, e incluso en aceleradores integrados.
- Ejecución en CPU: viable para inferencia de baja concurrencia, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference (etiqueta del repositorio) y HF Inference Endpoints (etiqueta endpoints_compatible). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables sin una conversión previa. El soporte en vLLM u otros servidores de encoders no está confirmado por el autor.
- Latencia y throughput: no disponible. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

No se dispone de métricas de este modelo, por lo que la comparación se limita a características estructurales. Las cifras de los modelos alternativos corresponden a datos públicos generales de esas arquitecturas, no a información aportada por el autor de este repositorio.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jaykl2910/banking77-intent-baseline | 124,7 M | No disponible | Encoder RoBERTa afinado para clasificacion | No disponible | Publicado en HuggingFace, 0 descargas |
| roberta-base | ~125 M | 512 tokens | Encoder RoBERTa generico | MIT (segun su publicacion original) | Ampliamente disponible |
| bert-base-uncased | ~110 M | 512 tokens | Encoder BERT generico | Apache 2.0 (segun su publicacion original) | Ampliamente disponible |
| distilbert-base-uncased | ~66 M | 512 tokens | Encoder destilado | Apache 2.0 (segun su publicacion original) | Ampliamente disponible |

En rendimiento sobre Banking77 no hay comparativa posible: este modelo no publica exactitud, F1 ni ninguna otra métrica, y no se han localizado evaluaciones de terceros. Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla automática sin ningún campo completado; no hay información sobre desarrollador, financiación, uso previsto, datos de entrenamiento ni evaluación.
- Licencia no declarada: al no especificarse licencia, no hay base jurídica clara para uso comercial. Debe tratarse como no apto para producción hasta que el autor aclare los términos.
- Idiomas no declarados: no se confirma que el modelo funcione en castellano. Por el nombre del dataset cabría esperar un ajuste sobre consultas en inglés, pero esto no está verificado.
- Conjunto de etiquetas no documentado: no se publica el mapeo entre índices de salida y nombres de intención, ni si realmente se entrenó con las 77 clases de Banking77 o con un subconjunto. Sin ese mapeo, las predicciones son inutilizables.
- Sin métricas: no hay exactitud, F1 macro ni matriz de confusión, por lo que no puede estimarse el riesgo real de error por clase.
- Sesgo de dominio: un clasificador entrenado con consultas bancarias en inglés trasladará ese sesgo léxico y cultural; el vocabulario de productos financieros de otras regiones puede quedar fuera de la distribución.
- Riesgo de alucinación: no aplica en el sentido generativo, porque el modelo no produce texto libre, pero sí existe riesgo de clasificación errónea con alta confianza en entradas fuera de dominio (por ejemplo, consultas legales o médicas), lo que puede derivar en enrutamientos incorrectos.
- Desequilibrio de clases probable: si el ajuste se hizo sobre Banking77, algunas de las 77 intenciones tienen muy pocos ejemplos, lo que suele traducirse en un rendimiento bajo en las clases minoritarias. No hay datos que lo confirmen ni lo desmientan.
- Ambigüedad entre intenciones: consultas como las relativas a tarjetas pueden solaparse entre varias clases; sin umbral de confianza calibrado, el sistema puede forzar etiquetas incorrectas.
- Repositorio sin tracción: cero descargas y cero likes reducen la probabilidad de que existan revisiones, incidencias resueltas o verificaciones independientes.
- Fecha de creación futura respecto a la fecha de consulta habitual de este tipo de fichas (2026-09-10), dato a tener en cuenta al evaluar la vigencia del repositorio.
- Sin soporte de generación ni de agentes: no puede emplearse como modelo conversacional ni para tool calling; es exclusivamente un clasificador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jaykl2910/banking77-intent-baseline
- Referencia bibliográfica citada en las etiquetas del repositorio (calculador de impacto ambiental, no es el paper del modelo): https://arxiv.org/abs/1910.09700
- Búsqueda web realizada: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos corresponden a páginas jurídicas en alemán sobre compraventa en eBay, sin relación con el modelo ni con el corpus Banking77, por lo que se descartan.
- Paper, repositorio de código, demo y dataset de entrenamiento: no disponibles en la información proporcionada.
