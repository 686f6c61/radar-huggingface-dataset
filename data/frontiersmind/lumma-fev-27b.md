# FrontiersMind/Lumma-fev-27B

## Resumen

Lumma-Fev-27B es un modelo de decisión desarrollado por FrontiersMind. No es un modelo generativo: recibe un estado (texto, objeto JSON o array) junto con preguntas tipadas y devuelve, en una sola pasada forward, una distribución de probabilidad sobre las opciones de cada pregunta. Al no generar texto, no hay salida que parsear ni riesgo de formato inválido. Se distribuye con licencia Apache 2.0 y está pensado para enrutado, clasificación y toma de decisiones estructurada.

Técnicamente es un fine-tune de pesos completos (sin LoRA ni capas congeladas) sobre Qwen/Qwen3.8-27B, con un total de 26.085.330.160 parámetros reales (~26,1 mil millones). La innovación principal es que la cabeza del modelo de lenguaje se sustituye por una cabeza de lectura ("readout head") sobre las opciones de respuesta, de modo que cada pregunta produce directamente probabilidades normalizadas.

Fue entrenado sobre aproximadamente 100.000 muestras en una única pasada sobre los datos, con optimizador reiniciado desde cero. Soporta inglés, hindi, tamil y kannada. Cada pregunta junto con el estado debe caber en 8.192 tokens. Es relevante ahora porque ofrece una alternativa determinista y de baja latencia a los pipelines que hoy usan un LLM generativo seguido de un parser para tareas de clasificación y enrutado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.8-27B, con la cabeza del modelo de lenguaje sustituida por una cabeza de lectura sobre opciones; detalles completos no disponibles |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens por pregunta más estado |
| Tipos de cuantizacion | No disponible (la model card solo documenta pesos completos en bf16/float) |
| Idiomas soportados | Ingles, hindi, tamil, kannada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, libreria PyTorch |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y aplica un fine-tune de pesos completos: no se usan adaptadores LoRA ni se congelan capas. La cabeza del modelo de lenguaje se reemplaza por una cabeza de lectura que opera sobre el conjunto de opciones declaradas por cada pregunta. Esto implica que el modelo no genera tokens de respuesta: puntúa las alternativas y devuelve probabilidades. Cada pregunta lee únicamente el estado y sus propias opciones, de forma que la respuesta a una pregunta no condiciona la de las demás (independencia entre preguntas en una misma llamada).

El entrenamiento consistió en una receta corta de una sola pasada sobre unos 100.000 ejemplos de decisión, con optimizador nuevo, inspirada según el autor en AutoJev. Cubre inglés, hindi, tamil y kannada. La model card menciona que para acelerar la inferencia conviene instalar los kernels `flash-linear-attention` y `causal-conv1d`, lo que sugiere componentes de atención lineal o convolución causal en la base, aunque no se detalla la arquitectura interna en la información disponible. No se especifica el uso de RLHF o DPO.

## Capacidades

- Clasificación y decisión tipada: preguntas de tipo `noul` (sí/no, u opciones binarias) y `choice` (elección entre criterios definidos), devolviendo probabilidades por opción y un nivel de confianza.
- Salida determinista y estructurada: al no generar texto, no requiere parseo ni validación de formato.
- Independencia entre preguntas: cada pregunta se evalúa contra el estado y sus propias opciones, sin contaminación cruzada.
- Entrada multimodal opcional: admite imágenes mediante `images=[...]` (rutas, objetos PIL o URLs `data:`) tras instalar el extra `lumma-fev[images]`.
- Entrada flexible de estado: acepta texto plano, un objeto JSON o un array.
- Multilingüe en cuatro idiomas: inglés, hindi, tamil y kannada.
- Soporte de tipo `score`: la model card indica que se acepta pero no está probado.
- Servicio de inferencia: servidor compatible con la API `POST /v1/systemone` de TypeSafe mediante `lumma-fev-serve`.
- No soporta generación de texto, tool calling ni razonamiento multi-paso en varios turnos: es un modelo de decisión de una sola pasada.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia, el modelo devuelve en una sola pasada la probabilidad de que corresponda a facturación, soporte técnico o ventas, con la confianza asociada. El ejemplo de la propia model card usa exactamente este escenario.
- Triaje y priorización: combinando una pregunta `choice` de categoría con una `noul` de urgencia, se puede construir una cola priorizada sin cadenas de prompts ni coste de generación.
- Moderación de contenido: clasificar mensajes en categorías discretas predefinidas (permitido, revisar, bloquear) obteniendo una probabilidad calibrada por clase en lugar de una etiqueta generada.
- Enrutado de consultas en asistentes RAG: decidir si una consulta debe resolverse con búsqueda documental, con una herramienta externa o con respuesta directa, antes de invocar el modelo generativo.
- Clasificación documental en back office: asignar contratos, facturas o correos a departamentos y colas concretas a partir de su contenido, con salida probabilística auditable.
- Atención al cliente en mercados indios: el soporte de hindi, tamil y kannada permite clasificar y enrutar consultas en esos idiomas sin traducción previa a inglés.
- Análisis de formularios con imágenes: con el extra de imágenes, decidir categorías a partir de capturas o documentos escaneados junto con texto adicional.
- Decisión automática en pipelines de datos: usar las probabilidades como señal para reglas de negocio, aplicando umbrales de confianza y derivando a revisión humana los casos de baja confianza.

## Benchmarks y rendimiento

La model card incluye gráficos de accuracy (tres imágenes: dos de benchmarks en inglés y una de benchmarks en índico, evaluadas sobre las mismas filas para ambos modelos comparados), pero los valores numéricos no están disponibles en la información proporcionada.

No se han publicado resultados de benchmarks en formato numérico en la información disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 55 GB libres según la model card, coherente con pesos completos de ~26,1 B parámetros y un repositorio de 52,2 GB. En la práctica requiere una GPU de 80 GB (A100 80 GB, H100 80 GB) para una sola tarjeta.
- Multi-GPU: con `device_map="auto"` puede repartirse entre varias GPU más pequeñas, instalando el extra `lumma-fev[large]`.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 24-48 GB en precisión completa. No se documentan versiones cuantizadas que permitan bajarlo a ese rango.
- Opciones de despliegue: paquete `lumma-fev` (>= 0.2) para inferencia local; servidor `lumma-fev-serve` con API compatible `POST /v1/systemone`. La model card no menciona soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Aceleración: se recomienda instalar los kernels `flash-linear-attention` y `causal-conv1d`; sin ellos, transformers usa código PyTorch más lento. No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de la misma categoría (modelos de decisión con cabeza de lectura sobre opciones) en la información proporcionada. La comparación más directa disponible es con el modelo base del que deriva.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia |
|---|---|---|---|---|
| Lumma-fev-27B | 26,1 B | 8.192 tokens por pregunta y estado | Probabilidades sobre opciones tipadas | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | No disponible en la informacion | No disponible | Texto generado | No disponible en la informacion |
| Otros modelos de decision comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ámbito restringido: solo responde a preguntas tipadas sobre un estado. No genera texto, no mantiene conversaciones y no soporta tool calling ni razonamiento multi-paso.
- Límite de contexto estricto: cada pregunta junto con el estado debe caber en 8.192 tokens; estados largos obligan a truncar o resumir.
- Cobertura lingüística limitada a inglés, hindi, tamil y kannada. No hay soporte declarado de castellano ni de otras lenguas.
- El tipo de pregunta `score` se acepta pero no está probado, por lo que su comportamiento no está validado y no debería usarse en producción sin evaluación propia.
- No se publican cifras numéricas de benchmarks en la información disponible, solo gráficos; no es posible verificar el rendimiento con datos concretos.
- No se documentan sesgos conocidos, tasas de alucinación ni calibración de las probabilidades. Al emitir probabilidades, un uso incorrecto de umbrales de confianza puede derivar en decisiones erróneas automatizadas.
- Riesgo de sobreconfianza: el ejemplo de la model card muestra una confianza de 0,99; conviene validar la calibración con datos propios antes de automatizar decisiones sensibles.
- Idiomas con menos recursos: el rendimiento en tamil y kannada puede diferir del inglés; no hay datos desglosados por idioma en formato numérico.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen/Qwen3.8-27B conviene revisar las condiciones del modelo base.
- Requisito de hardware elevado: sin cuantizaciones oficiales, no es desplegable en GPU de consumo, lo que limita pruebas locales.
- Modelo con fecha de creación y actualización en octubre de 2026, 0 descargas en el momento de la consulta y 22 likes: ecosistema todavía muy reciente, con poca validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FrontiersMind/Lumma-fev-27B
- Blog detallado del autor: https://huggingface.co/blog/FrontiersMind/lumma-fev-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paquete lumma-fev en PyPI: https://pypi.org/project/lumma-fev/
- Página de la empresa (System One Models): https://systemonemodels.ai/frontiersmind
- Cobertura externa (AGI Hunt): https://agihunt.info/en/p/1a13ac0b042d93e40f21249723f
