# arghya2030/commercecore-qwen3-1.7b

## Resumen

CommerceCore es un modelo de 1.7B parámetros desarrollado por el usuario arghya2030 (código en arghya05/commercecore) que convierte consultas de compra en lenguaje natural, del tipo «black waterproof trainers under 80 pounds» o «almonds with no added sugar», en restricciones estructuradas en JSON con campo, operador y valor explícitos (`color eq black`, `waterproof eq true`, `price_gbp lte 80`). Está construido sobre Qwen3-1.7B de Alibaba, con licencia Apache-2.0, y se ha afinado con QLoRA sobre ese mismo modelo base, fusionando después el adaptador en los pesos finales.

La propuesta es doble: por un lado, un modelo pequeño y autoalojable que resuelve una tarea de extracción estrecha y repetitiva, donde los modelos frontera no especializados rinden de forma irregular; por otro, un argumento de coste, ya que el autor documenta un entrenamiento completo por menos de 10 dólares entre cómputo y coste de API. En el benchmark público QueryNER (993 ejemplos, test completo) reporta 0.498 de F1, por encima de los 0.427 de Claude Sonnet 5 y los 0.204 de GPT-5 en su tier insignia, según mediciones del propio autor.

El contexto de uso es igualmente relevante: un buscador con sugerencias mientras se escribe necesita latencias por debajo del segundo y potencialmente millones de peticiones diarias, y un modelo de 1.7B servido en infraestructura propia elimina coste por token, latencia de red y salida de datos de clientes. El proyecto se declara explícitamente como investigación y prueba de concepto, con cero descargas y cero likes en HuggingFace en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajustado con QLoRA y fusionado; no es MoE |
| Parametros totales | 1.720.574.976 (dato de los safetensors del repo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-1.7B soporta 32.768 tokens nativos |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados en el repo; al derivar de Qwen3-1.7B es convertible a GGUF, GPTQ y AWQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado, sin adaptador LoRA separado) |

Otros datos: pipeline `text-generation`; tamaño del repositorio 4,7 GB; creado el 2026-09-27.

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso con atención de consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y embeddings atados, al que se aplica un ajuste QLoRA: cuantización a 4 bits del modelo base más una adaptación de bajo rango entrenada sobre una única GPU de gama consumer o prosumer. Tras el entrenamiento, el adaptador se fusiona en los pesos del modelo base para producir un directorio autocontenido que no requiere cargar ningún adaptador, verificado por el autor en una GPU de RunPod, en un Mac con CPU únicamente y a través de una API REST con el mismo código.

La composición del dataset es el elemento técnico más interesante. Aproximadamente el 70 % de la mezcla de entrenamiento es datos públicos anotados por humanos (QueryNER, licencia CC BY 4.0). El resto es datos sintéticos generados con un método que el autor denomina «scenario-first»: las etiquetas de restricción se fijan de forma determinista en código antes de cualquier llamada a un LLM, y el LLM solo se encarga de parafrasear ese escenario fijo a lenguaje natural, evitando así el fallo típico de los datos sintéticos en el que el modelo generador inventa o elimina etiquetas. El pipeline incluye un validador que comprueba validez de esquema, anclaje de los spans de evidencia y corrección de la ejecución, más una puerta de naturalidad añadida tras detectar que el 70 % de un lote sintético temprano usaba una plantilla repetitiva del tipo «products with X». Durante el entrenamiento se evalúan cada ~150 pasos tanto el rendimiento en la tarea como la retención en capacidades generales, con el objetivo de mitigar el olvido catastrófico, y se selecciona el checkpoint con mejor equilibrio en lugar del último por defecto.

## Capacidades

- Extracción de restricciones: convierte consultas de compra en objetos estructurados con campo, operador (`eq`, `lte`, etc.) y valor.
- Reconocimiento de entidades y atributos de producto: color, material, propiedades funcionales (`waterproof`), rango de precio por divisa, restricciones de ingredientes (`contains_added_sugar`) y plazos de garantía (`warranty_months`).
- Comprensión de consultas de ecommerce en lenguaje natural, incluidas negaciones y modificadores («no added sugar»).
- Generación de texto y conversación como capacidades heredadas del modelo base (pipeline declarado `text-generation`, etiqueta `conversational`).
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen3 lo soporta, pero no hay verificación específica tras el ajuste.
- Uso en agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no; el modelo se declara únicamente en inglés.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio. La especialización es exclusivamente la extracción de restricciones de catálogo.

## Casos de uso

- Filtrado de catálogo en buscador de ecommerce: la consulta del usuario se traduce en un conjunto de filtros aplicables directamente al índice o a la base de datos, sin pasar por una API externa ni pagar por token.
- Autocompletado con sugerencias mientras se escribe: al ser un modelo de 1.7B autoalojado, permite responder en cada pulsación con latencia local, algo inviable con una llamada de red a un modelo frontera.
- Enrutamiento y ranking dentro de un sistema de recomendación: las restricciones extraídas alimentan una capa de ranking que puede explicar por qué un producto se ha mostrado («cumple color negro y precio ≤ 80 GBP»).
- Enriquecimiento de datos de catálogo: procesamiento por lotes de descripciones y consultas históricas para poblar campos estructurados de atributos de producto.
- Retail sensible a la privacidad: sectores como salud, alimentación o servicios financieros pueden mantener las consultas y el historial de compra dentro de su propia infraestructura, ya que el modelo se ejecuta en local.
- Construcción de filtros en asistentes conversacionales de compra: un chatbot puede convertir el turno del usuario en parámetros de búsqueda invocables mediante una herramienta.
- Investigación sobre ajuste eficiente: sirve como caso de estudio reproducible de QLoRA a bajo coste, con un pipeline de datos sintéticos con anclaje de etiquetas y evaluación conjunta de tarea y retención.
- Despliegue en entornos sin GPU: el autor verificó la ejecución en un Mac con CPU únicamente, lo que cubre prototipos y demos sin acelerador dedicado.

## Benchmarks y rendimiento

QueryNER, benchmark público anotado por humanos, conjunto de test completo de 993 ejemplos:

| Sistema | F1 |
|---|---|
| GPT-5 (insignia) | 0.204 |
| Claude Haiku 4.5 (tier económico) | 0.263 |
| GPT (tier económico) | 0.294 |
| Claude Sonnet 5 (insignia) | 0.427 |
| CommerceCore (este modelo) | 0.498 — IC 95 % [0.475, 0.523], bootstrap de 10.000 remuestreos |

Extracción de restricciones, conjunto reservado y desglose por vertical, medido sobre el modelo fusionado y servido:

| Vertical | F1 |
|---|---|
| Moda | 0.690 |
| Alimentación | 0.667 |
| Mercancía general | 0.694 |
| Global | 0.683 |

Como referencia, el autor indica que Claude Sonnet 5 obtiene 0.59 en el mismo conjunto reservado con intervalos de confianza por bootstrap de 3 repeticiones. La model card advierte de forma explícita que en una prueba independiente con consultas nuevas y reales esta ventaja no se mantiene de forma universal.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 alrededor de 3,5 GB solo de pesos, con caché KV añadida; en int8 unos 1,8 GB; en int4 (GPTQ/AWQ/GGUF Q4) alrededor de 1,1 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4080, RTX 4090, A100 o H100 para servir en paralelo. Cualquier GPU consumer con 4 GB o más puede alojarlo en cuantización de 8 o 4 bits.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas modernas; en 4 bits entra incluso en iGPU con memoria unificada.
- CPU: el autor verificó la carga y ejecución en un Mac con CPU únicamente, sin acelerador.
- Opciones de despliegue: `transformers` en PyTorch, vLLM y TGI para servicio en GPU con alto throughput, llama.cpp y Ollama previa conversión a GGUF (no se distribuye GGUF en el repositorio, solo safetensors). También se ha probado su exposición como API REST.
- Latencia y throughput estimados: no disponibles; la model card no publica medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 en QueryNER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CommerceCore (este modelo) | 1,7B | No especificado (base: 32.768 tokens) | 0.498 | Apache-2.0 | Pesos abiertos en HuggingFace (0 descargas, 0 likes) |
| Qwen3-1.7B (modelo base) | 1,7B | 32.768 tokens | No disponible | Apache-2.0 | Pesos abiertos en HuggingFace |
| Claude Sonnet 5 | No disponible | No disponible | 0.427 | Propietaria | Solo API |
| GPT-5 | No disponible | No disponible | 0.204 | Propietaria | Solo API |

La comparación relevante es de coste y despliegue: frente a los modelos frontera, CommerceCore ofrece inferencia local, sin coste por token y con control total sobre los datos, a cambio de una especialización estrecha en una única tarea y de un rendimiento fuera de ese dominio no evaluado. No hay datos publicados que comparen este ajuste con otras alternativas abiertas del mismo tamaño entrenadas para extracción de restricciones.

## Limitaciones y advertencias

- Estado declarado por el autor: investigación y prueba de concepto. La model card remite a una sección «What this is NOT» antes de usar el modelo en producción.
- La ventaja sobre los modelos frontera no es universal: en una prueba independiente con consultas nuevas y reales, el modelo no mantiene la ventaja que muestra en los conjuntos de evaluación. Los números de cabecera deben leerse con esa cautela.
- Especialización estrecha: está entrenado para un vocabulario de campos concreto (`price_gbp`, `contains_added_sugar`, `warranty_months`). Otros catálogos requerirán reajuste o adaptación del esquema.
- Idioma: solo inglés. No hay soporte multilingüe ni evaluación en castellano.
- Sesgos: no se documenta ningún análisis de sesgos. Al proceder de datos públicos (QueryNER) y de datos sintéticos generados por LLM, puede heredar sesgos de distribución de productos, precios y categorías de esas fuentes.
- Riesgo de alucinación: propio de un modelo generativo de 1.7B; el pipeline de datos mitiga el problema en entrenamiento, pero no garantiza que en inferencia las restricciones extraídas estén ancladas al texto de entrada. Se recomienda validación de esquema y de spans en producción.
- Datos sintéticos: aunque las etiquetas se fijan en código antes de la generación, una parte de la mezcla de entrenamiento procede de paráfrasis de un LLM, con el riesgo residual de naturalidad limitada ya detectado en un lote temprano.
- Licencia Apache-2.0 sobre el modelo ajustado, heredada del modelo base, sin restricciones conocidas para uso comercial; conviene verificar igualmente la licencia CC BY 4.0 del dataset QueryNER y las condiciones de los datos sintéticos.
- Adopción nula: cero descargas y cero likes, sin comunidad que haya reproducido o validado los resultados de forma independiente.
- Requisitos de licencia adicionales: no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arghya2030/commercecore-qwen3-1.7b
- Código fuente y documentación: https://github.com/arghya05/commercecore
- Paper (PDF): `paper/CommerceCore_Paper.pdf` en el repositorio de GitHub
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Referencias arXiv incluidas en las etiquetas del repositorio: arXiv:2510.21970, arXiv:2308.06966, arXiv:2606.21631 (identificadores tal como aparecen en los metadatos; no se dispone de su título ni contenido en la información proporcionada)
- Dataset QueryNER: referencia citada como CC BY 4.0, sin enlace directo en la información disponible
