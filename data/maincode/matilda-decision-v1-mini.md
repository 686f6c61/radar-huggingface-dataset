# Maincode/Matilda-Decision-v1-Mini

## Resumen

Matilda Decision v1 Mini es un modelo de decisión multimodal de 4,5 mil millones de parámetros desarrollado por Maincode. A diferencia de un LLM generativo convencional, no produce texto: recibe un estado de entrada (texto o JSON, opcionalmente acompañado de imágenes) y un conjunto de preguntas estructuradas (elección entre opciones, sí/no o puntuación en escala), y devuelve en una sola llamada una probabilidad para cada respuesta posible. Está orientado a tareas de "sistema uno": clasificación, enrutado y evaluación rápida y determinista.

El modelo es un fine-tuning de Qwen/Qwen3.5-4B, con un encoder de visión integrado y una cabecera de decisión (readout) que soporta hasta 255 opciones por pregunta. Su rasgo técnico más distintivo es el entrenamiento con atención bidireccional en sus capas de atención completa, lo que permite leer todo el prompt de una vez y extraer la respuesta de la posición final sin generación autorregresiva.

Es relevante ahora porque cubre un nicho creciente: pipelines de producción que necesitan decisiones estructuradas y calibradas (enrutado de tickets, moderación, validación documental) con latencia baja y coste predecible, sin los costes y la variabilidad de la generación de texto. Comparte formato de peticiones y respuestas con su hermano mayor, Matilda Decision v1 (27B), lo que facilita escalar o reducir según el presupuesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone vision-lenguaje Qwen3.5-4B con cabecera de decisión de hasta 255 opciones, atención bidireccional en capas de atención completa |
| Parametros totales | 4.539.265.536 (incluye el encoder de visión) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 131.072 tokens (las entradas no se truncan; una petición mayor lanza error) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (9,1 GB en el repositorio), con runtime remoto (`matilda_decision_runtime.py`) cargado vía `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un backbone vision-lenguaje, al que se añade una cabecera de decisión (decision readout) con soporte para hasta 255 opciones. Cada pregunta se resuelve en un único forward pass, leyendo la respuesta desde la posición final del prompt. No hay decodificación autorregresiva: el modelo devuelve probabilidades directamente, lo que elimina la varianza y el coste de la generación de tokens.

Un detalle técnico crítico es el entrenamiento con atención bidireccional: las capas de atención completa del modelo ven el prompt entero simultáneamente, no solo los tokens anteriores a cada posición. El runtime incluido (`matilda_decision_runtime.py`) configura este comportamiento, y la model card advierte explícitamente de que servir los pesos como backbone causal, o en un motor de inferencia causal estándar, produce respuestas diferentes y peores. Sobre el entrenamiento, la model card solo indica que se realizó post-entrenamiento desde Qwen3.5-4B con decisiones sobre texto e imágenes; no se publican datos sobre número de tokens, composición del dataset ni técnicas como RLHF o DPO.

## Capacidades

- Clasificación de elección entre 1 y 255 opciones, con probabilidades por opción y nivel de confianza.
- Respuestas binarias sí/no (tipo `noul`), devolviendo la probabilidad de la respuesta afirmativa.
- Puntuación en escalas ordinales (tipo `score`), con el nivel esperado, probabilidades y leyenda.
- Entrada multimodal: texto o JSON arbitrario como `state`, más varias imágenes por petición (hasta 0,26 MP cada una, unos 512 × 512 píxeles).
- JSON como estado de entrada: el `state` se lee como datos, no como instrucciones, lo que reduce riesgos de inyección de prompt.
- Resolución de múltiples preguntas en una sola llamada, todas sobre el mismo estado e imágenes.
- Salida estructurada y determinista: probabilidades por cada respuesta, sin generación de texto libre.
- Ventana de contexto de 131.072 tokens sin truncado de entradas.

## Casos de uso

- Enrutado de tickets de soporte: clasificar cada incidencia entrante entre equipos (devoluciones, facturación, soporte técnico) con probabilidades por equipo, como muestra el propio ejemplo de la model card, y derivar automáticamente al equipo correcto.
- Verificación de documentos con visión: comprobar si un recibo adjunto corresponde al producto reclamado, o extraer el método de pago de una imagen, combinando texto del caso e imágenes en la misma llamada.
- Triaje de urgencia: asignar peticiones a niveles de prioridad (rutinario, pronto, hoy) mediante el tipo `score`, con probabilidades que permiten definir umbrales de escalado a revisión humana.
- Moderación y cumplimiento: decidir sí/no sobre si un contenido o transacción cumple una política, obteniendo la probabilidad de "sí" como señal de riesgo calibrada.
- Agentes con decisiones estructuradas: usar el modelo como componente de decisión rápido ("sistema uno") dentro de un agente que necesita elegir entre acciones sin generar razonamiento en lenguaje natural, reduciendo latencia y coste.
- Clasificación zero-shot de textos largos: gracias a los 131.072 tokens de contexto, clasificar documentos extensos (contratos, conversaciones completas) sin fragmentación.
- Sustitución escalable de decisiones: al compartir formato de peticiones y respuestas con Matilda Decision v1 (27B), se puede prototipar con la versión Mini y migrar a la de 27B (o viceversa) sin cambiar el código de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 4,54 mil millones de parámetros en safetensors sin cuantizar (9,1 GB de pesos), se estima en torno a 10-12 GB de VRAM para inferencia en precisión completa; no hay cifras oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 12 GB de VRAM (RTX 3060/4060 Ti 16 GB, RTX 4090, A100, L4, T4 con ajustes). No hay recomendaciones oficiales.
- Consumer GPU: dado el tamaño (9,1 GB de pesos), debería caber en GPUs de consumo de 12-16 GB o más; no está verificado oficialmente.
- Despliegue: vía `transformers` (versión 5.17.0 según la model card) con `AutoModel.from_pretrained` y `trust_remote_code=True`. La librería `flash-linear-attention` es opcional y proporciona kernels rápidos para GPU en las capas de atención lineal.
- Advertencia crítica de despliegue: no es compatible con motores de inferencia causales estándar (vLLM, TGI, llama.cpp en su configuración por defecto) sin soporte de atención bidireccional; servirlo de forma causal degrada las respuestas.
- Latencia y throughput: no disponibles; al no generar texto, cada pregunta requiere un único forward pass, lo que sugiere latencias bajas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| | Matilda Decision v1 Mini | Matilda Decision v1 | Qwen3.5-4B (base) |
|---|---|---|---|
| Parametros | 4,5B | 27B | ~4B |
| Salida | Probabilidades estructuradas, sin generación | Probabilidades estructuradas, sin generación | Texto generado |
| Entradas | Texto/JSON + imágenes | Texto/JSON + imágenes | Texto + imágenes |
| Contexto | 131.072 tokens | no disponible | no disponible |
| Atencion | Bidireccional (capas full-attention) | no disponible | Causal |
| Licencia | Apache-2.0 | no disponible | Apache-2.0 |
| Uso tipico | Decisiones rapidas en produccion | Decisiones de mayor precision | Uso general |

No hay otros modelos de decisión especializados comparables con datos publicados en la informacion disponible.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True`: se ejecuta código remoto del autor (`matilda_decision_runtime.py`), lo que debe evaluarse antes de usar en producción.
- No debe servirse como modelo causal: usar vLLM, TGI u otros motores sin soporte de atención bidireccional produce respuestas diferentes y peores, según advierte la model card.
- Imágenes limitadas a 0,26 MP (unos 512 × 512) por defecto: se pierde detalle fino en gráficos, documentos y texto pequeño; subir el límite por encima de 0,26 MP no está validado.
- No genera texto: no sirve como chatbot ni para tareas generativas; su salida es exclusivamente probabilidades sobre preguntas estructuradas.
- Idiomas soportados no documentados; el entrenamiento se describe de forma genérica y no se especifica rendimiento en castellano.
- No se publican benchmarks, tasas de alucinación ni calibración de probabilidades; las probabilidades de salida deben validarse empíricamente en cada dominio antes de usarlas como señales de confianza.
- El `state` se lee como datos y no como instrucciones, lo que mitiga pero no elimina necesariamente riesgos de manipulación de entrada; conviene probar con entradas adversariales.
- Licencia Apache-2.0: sin restricciones de uso comercial relevantes más allá de las obligaciones estándar de la licencia.
- Proyecto de adopción muy temprana (23 descargas, 2 likes en el momento de la ficha), con escasa trazabilidad comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Modelo hermano mayor (Matilda Decision v1, 27B): https://huggingface.co/Maincode/matilda-decision-v1
- Modelo base (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache-2.0: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini/blob/main/LICENSE
- Paper, blog o repositorio de código: no disponible
