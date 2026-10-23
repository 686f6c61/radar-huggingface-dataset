# fastino/GLiDE

## Resumen

GLiDE (Generalized Lightweight Decision Engine) es un modelo de decisión desarrollado por Fastino Labs. No es un modelo generativo: recibe un estado (texto, JSON o una lista de partes de texto e imagen) junto con una o varias preguntas tipadas y devuelve, para cada pregunta, una distribución de probabilidad sobre las opciones definidas por el usuario. La salida se lee de una cabeza de decisión de 255 vías, de modo que no se genera ni un solo token (`output_tokens: 0` en las respuestas de ejemplo).

El modelo tiene 26.085.330.160 parámetros (26,08 mil millones) en bf16 y un repositorio de 52,2 GB, de los cuales 51,2 GB corresponden al modelo de lenguaje, 0,92 GB a un codificador visual y 2,6 MB a la cabeza de lectura. Admite hasta 40.000 tokens por prompt de pregunta (estado, pregunta, opciones y tokens de imagen) y agrupa en micro-lotes todas las preguntas de una petición y de peticiones concurrentes.

Es relevante porque cubre un hueco distinto al de los LLM generativos: clasificación, enrutado y puntuación con probabilidades calibradas por opción, en una sola pasada hacia delante y con coste de salida nulo. Fastino lo ofrece tanto en pesos abiertos (con licencia comunitaria y acceso restringido al repositorio) como en su API alojada, a 0,15 dólares por millón de tokens de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (kernel `flash-linear-attention`) y cabeza de decisión de 255 vías; etiquetado como `qwen3_5` |
| Parametros totales | 26.085.330.160 (26,08 mil millones) |
| Parametros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | hasta 40.000 tokens por prompt de pregunta (valor por defecto; estado, pregunta, opciones e imagen) |
| Tipos de cuantizacion | bf16 únicamente (formato publicado y validado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | `fastino-community` (texto en el fichero LICENSE del repositorio); la model card indica "internal use only" |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La etiqueta de arquitectura del repositorio es `qwen3_5`, y la model card menciona explícitamente capas de atención lineal que se aceleran con `flash-linear-attention==0.5.2` (con vuelta a una implementación PyTorch mucho más lenta si el paquete no está instalado, ruta que no formó parte de la validación). Esto apunta a un transformer híbrido: capas de atención lineal combinadas con atención completa estándar, más un codificador visual de 0,92 GB para las entradas de imagen. La pieza diferencial es la cabeza de lectura de 255 vías (2,6 MB), que proyecta el estado final sobre las opciones de cada pregunta en lugar de decodificar texto.

El modelo no genera tokens: cada pregunta se resuelve con una pasada hacia delante y produce logits sobre las opciones, normalizados como probabilidades. Soporta tres tipos de pregunta: `choice` (una entre hasta 255 opciones con nombre), `noul` (sí/no, devuelve P(sí)) y `score` (niveles ordenados, con nivel esperado calculado). El preprocesado de imágenes se ejecuta en CPU y los pesos se copian a la GPU tensor a tensor, lo que mantiene bajo el uso de memoria anfitriona durante la carga.

No se ha publicado información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni el proceso de calibración de las probabilidades. Tampoco se documenta el entrenamiento del codificador visual ni si la cabeza de decisión se entrenó de forma conjunta o por etapas.

## Capacidades

- Clasificación de texto y JSON con hasta 255 opciones nombradas por pregunta, devolviendo probabilidad por opción y nivel de confianza.
- Preguntas binarias (`noul`) con probabilidad explícita de "sí".
- Puntuación ordinal (`score`) sobre niveles definidos por el usuario, con nivel esperado calculado a partir de la distribución.
- Entrada multimodal: el estado puede ser una cadena, cualquier valor JSON o una lista de partes de texto e imagen (PIL, rutas de fichero, bytes, base64 o data URLs).
- Evaluación conjunta de varias preguntas en una sola petición, agrupadas en micro-lotes, incluyendo peticiones concurrentes mediante `decide_batch`.
- Contexto largo: hasta 40.000 tokens por prompt de pregunta, útil para documentos o estados extensos.
- Respuestas estructuradas listas para consumo programático: tipo de pregunta, elección, confianza, distribución completa y recuento de tokens de entrada.
- No dispone de generación de texto, tool calling nativo ni modo "thinking"; su papel en un pipeline agéntico es el de enrutador o evaluador, no el de actor.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo de la model card clasifica un ticket en `refund`/`cancel`/`track`/`other` con 0,9751 de probabilidad para `refund`, decide si escalar hoy (P(sí) = 0,8267) y asigna prioridad ordinal con nivel esperado 1,9191, todo en una sola petición de 316 tokens de entrada.
- Guardarraíles y verificación de salidas: plantear "¿cumple esta respuesta la política X?" como pregunta `noul` sobre el texto del LLM permite descartar respuestas por debajo de un umbral de probabilidad antes de mostrarlas al usuario.
- Enrutado de herramientas y sub-agentes: dado el estado de la conversación, elegir entre un conjunto cerrado de acciones o herramientas con una pregunta `choice`; al devolver distribución completa se puede aplicar un umbral y delegar en un LLM generativo solo cuando la confianza sea baja.
- Etiquetado y control de calidad de datasets: clasificar pares texto-imagen de un catálogo (por ejemplo, color o forma del objeto, como en el ejemplo con imagen) y usar la confianza para separar automáticamente los casos que requieren revisión humana.
- Triage de documentos largos: con 40.000 tokens por prompt se puede clasificar un contrato o informe completo según tipo, riesgo o departamento responsable, sin trocear el documento ni perder el contexto global.
- Evaluación automática de respuestas de modelos (juez ordinal): puntuar en niveles ("mala / aceptable / buena / excelente") las salidas de un LLM durante una evaluación offline o un A/B test, con distribución por nivel en lugar de una etiqueta única.
- Puntuación de leads o riesgo en formularios JSON: `score` sobre niveles ordenados con nivel esperado permite ordenar la cola de trabajo de un equipo comercial o de fraude con un único número comparable.
- Moderación de contenido con severidad graduada: combinar una pregunta `choice` de categoría con una `score` de gravedad para priorizar la cola de revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye dos ejemplos ilustrativos de salida (confianza 0,9521 en la clasificación del ticket; 0,9997 en la pregunta sobre el color de la imagen), que no constituyen una evaluación sistemática. Tampoco hay datos públicos de calibración, exactitud frente a anotadores humanos ni comparaciones con clasificadores supervisados.

## Requisitos de hardware

- Pesos en bf16: 52,2 GB en disco (51,2 GB de modelo de lenguaje, 0,92 GB de codificador visual, 2,6 MB de cabeza de lectura) y 52,2 GB de memoria de GPU tras la carga.
- Pico de memoria documentado: 60,2 GB para un prompt de 39.000 tokens. El consumo crece con la longitud del contexto.
- GPU mínima según el autor: una GPU de 80 GB o más. GPUs probadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), NVIDIA B200 (180 GB) y NVIDIA H100 80 GB HBM3.
- No cabe en GPU de consumo: 52,2 GB de pesos exceden los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. No se documentan cuantizaciones de 8 o 4 bits que lo redujesen (a 8 bits los pesos rondarían los 26 GB, pero esa conversión no está soportada ni validada oficialmente).
- Despliegue: paquete Python `glide` incluido en la raíz del repositorio (`Glide.from_pretrained`, `model.decide`, `model.decide_batch`) y servidor HTTP con el formato System One (`POST /v1/systemone`). También disponible como API alojada de Fastino. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con un modelo que no decodifica texto.
- Entorno validado: Python 3.12, `torch==2.14.0`, `transformers==5.17.0` y, recomendado, `flash-linear-attention==0.5.2`. Sin ese paquete, transformers usa una implementación PyTorch mucho más lenta que no fue validada.
- Tiempo de carga: 30 a 60 segundos desde almacenamiento en red.
- Latencia y throughput: no disponibles. El autor solo indica que todas las preguntas de una petición se puntúan juntas en micro-lotes, sin cifras de peticiones por segundo.

## Comparativa con modelos similares

No se conocen en la información proporcionada otros modelos de decisión de pesos abiertos directamente comparables; la comparación siguiente es funcional, por categoría de enfoque.

| Modelo | Enfoque | Salida | Parametros | Contexto | Licencia | Datos publicos |
|---|---|---|---|---|---|---|
| GLiDE (Fastino) | Modelo de decisión multimodal | Probabilidades por opción (0 tokens generados) | 26,08 B | 40.000 tokens por pregunta | `fastino-community`, uso interno según model card | Ejemplos en model card; sin benchmarks |
| LLM generativo multimodal de ~30 B con prompt de clasificación | Generación condicionada por prompt | Texto que hay que parsear a etiqueta | del orden de 30 B (depende del modelo) | depende del modelo | según el modelo | no disponible en esta ficha |
| Clasificador encoder tipo DeBERTa/BERT con cabeza supervisada | Clasificación discriminativa por tarea | Logits de clase | ~0,1-0,4 B (depende del modelo) | ~512 tokens típicamente | según el modelo | no disponible en esta ficha |
| GLiNER (Fastino) | Extracción de entidades zero-shot | Entidades y spans | no disponible | no disponible | no disponible | no disponible |

Diferencias clave frente a las alternativas: GLiDE evita el parseo de texto y el coste de tokens de salida, permite definir las opciones en tiempo de inferencia (hasta 255) sin reentrenar y acepta imágenes, a cambio de exigir una GPU de 80 GB y de no poder generar explicaciones ni texto libre.

## Limitaciones y advertencias

- Licencia: `fastino-community`, con la model card indicando "internal use only". Antes de cualquier uso comercial o en producción hay que leer el fichero LICENSE del repositorio; el acceso a los pesos requiere además un token con permiso de lectura sobre la organización `fastino`.
- No genera texto: no sirve para resumen, redacción, diálogo abierto ni explicaciones. Sus respuestas son distribuciones de probabilidad sobre opciones predefinidas.
- Límite estructural de 255 opciones por pregunta y obligación de definir criterios e instrucciones a priori; la calidad depende fuertemente de cómo se redacten las opciones y las descripciones de cada nivel.
- Riesgo de calibración: no hay benchmarks públicos ni estudios de calibración, por lo que las confianzas devueltas no deben tratarse como probabilidades verificadas sin una validación propia sobre el dominio de uso.
- Idiomas no documentados: no se puede asumir un rendimiento multilingüe equivalente al del inglés sin evaluarlo. Lo mismo aplica a dominio (legal, médico, financiero) y a jerga específica.
- Sesgos desconocidos: al no publicarse la composición del corpus de entrenamiento, no es posible auditar sesgos demográficos, geográficos o de dominio.
- Memoria: el pico de 60,2 GB con contextos de 39.000 tokens deja poco margen en una GPU de 80 GB; contextos largos y concurrencia alta pueden provocar OOM.
- Dependencias frágiles: versiones fijadas de `torch` y `transformers`, y rendimiento muy degradado sin `flash-linear-attention`; el aviso de `causal_conv1d` no instalado es esperado según el autor.
- Madurez: 25 descargas y 22 "likes" en el momento de la consulta, con un repositorio creado y actualizado en octubre de 2026; la validación comunitaria es muy limitada.
- Coste de propiedad alto: requiere GPU de 80 GB dedicada, sin alternativas de cuantización documentadas para abaratarlo.
- El servicio alojado se factura por tokens de entrada (0,15 USD por millón) con salida gratuita; conviene verificar las tarifas vigentes antes de dimensionar costes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fastino/GLiDE
- Licencia: https://huggingface.co/fastino/GLiDE/blob/main/LICENSE
- Fastino Labs: https://fastino.ai/
- Documentación del concepto GLiDE: https://docs.fastino.ai/concepts/glide
- Documentación de la API de inferencia (System One): https://docs.fastino.ai/inference/systemone
- Guía rápida de la API: https://docs.fastino.ai/quickstart
- Alta y clave de API: https://agent.fastino.ai
- Catálogo de modelos de Fastino: https://fastino.ai/models
- Ficha de terceros con especificaciones: https://www.gradually.ai/en/ai-models/glide/
