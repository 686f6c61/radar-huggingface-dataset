# FrontiersMind/Lumma-fev-0.6b

## Resumen

Lumma-fev-0.6B es un modelo de decisión desarrollado por FrontiersMind. No es un modelo generativo: recibe un documento (el *estado*) junto con un conjunto de preguntas tipadas y devuelve, en una sola pasada forward, una distribución de probabilidad para cada pregunta. Al no generar texto, no hay salida que parsear ni margen para alucinaciones en el sentido habitual.

El modelo se construye por fine-tuning sobre Lumma-0.6B-Base (649 M de parámetros, congelado), un transformer causal preentrenado desde cero por el mismo equipo. Incorpora una máscara de ramas block-causal y un mecanismo de lectura por puntero (*pointer readout*), lo que permite resolver varias preguntas tipadas sobre el mismo estado compartiendo el prefijo. Los parámetros totales del checkpoint publicado son 650.020.268.

Es relevante porque cubre la categoría de modelos de decisión orientados a tipado fuerte (*typesafe*), pensados para actuar como capa de enrutado, etiquetado o gating dentro de pipelines con LLM, con licencia MIT y solo en inglés. El autor anuncia para la misma semana los lanzamientos Lumma-Fev-3B y Lumma-Fev-9B, orientados a mejorar el rendimiento en preguntas que exigen conocimiento factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, prefill-only, mascara de ramas block-causal, lectura por puntero (pointer readout) |
| Parametros totales | 650.020.268 (~650 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; entrenamiento y servicio en bf16, no se publican variantes cuantizadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code=True`) |
| Modelo base | FrontiersMind/Lumma-0.6B-Base (649 M, congelado) |
| Tipos de pregunta | `noul` (si/no), `choice` (2-255 opciones), `score` (2-255 niveles ordenados) |
| Pipeline declarado | text-classification |
| Desarrollador | FrontiersMind |
| Fecha indicada en HuggingFace | 2026-09-22 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal en modo *prefill-only*: no hay decodificacion autorregresiva ni generacion de tokens. El estado (documento) se procesa una sola vez y, sobre esa representacion, se resuelven simultaneamente todas las preguntas tipadas mediante una mascara de ramas block-causal que aisla cada rama de pregunta del resto, mas un mecanismo de lectura por puntero que extrae las probabilidades de cada clase u opcion. Las preguntas pueden ser binarias (`noul`), de eleccion entre 2 y 255 opciones (`choice`) o de puntuacion ordinal en 2-255 niveles (`score`), con criterios e instrucciones definidos por el usuario en tiempo de inferencia.

El modelo parte de Lumma-0.6B-Base, preentrenado desde cero por FrontiersMind, que se mantiene congelado durante el ajuste. El entrenamiento y el servicio se realizan en bf16 sobre GPU H200, segun la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se emplearon tecnicas de alineacion como RLHF o DPO. El autor indica que los benchmarks completos se publicaran junto con las versiones de 3B y 9B.

## Capacidades

- Clasificacion binaria tipo si/no sobre un documento, con salida probabilistica (`noul`).
- Clasificacion multietiqueta con entre 2 y 255 opciones mutuamente excluyentes en una sola pasada (`choice`).
- Puntuacion ordinal con entre 2 y 255 niveles ordenados (`score`).
- Resolucion de multiples preguntas heterogeneas sobre el mismo estado en un unico forward pass.
- Salida estructurada con distribuciones de probabilidad por pregunta, apta para umbralizar y automatizar decisiones.
- Definicion de criterios e instrucciones por pregunta en tiempo de inferencia, sin reentrenamiento.
- No genera texto: no hay tool calling, ni function calling, ni razonamiento multi-paso, ni capacidades de agente.
- No dispone de modo de razonamiento explicito (*thinking mode*), vision ni audio.
- Soporte multilingue limitado al ingles.

## Casos de uso

- Enrutado de tickets de soporte: con `choice` se asigna cada incidencia a un equipo (facturacion, envios, etc.) usando criterios declarados en la propia llamada, tal como muestra el ejemplo de la model card, con la probabilidad como senal de confianza.
- Gating de automatizacion en atencion al cliente: con `noul` se decide si una consulta cumple una politica concreta antes de ejecutar una accion automatica (por ejemplo, aprobar una devolucion), ajustando previamente la temperatura sobre datos propios.
- Pre-filtrado en pipelines RAG: usar el modelo como clasificador barato que decide si un documento recuperado es relevante para la consulta antes de invocar un LLM grande, reduciendo coste y latencia del pipeline.
- Moderacion de contenido: etiquetado binario o por categorias de comentarios y publicaciones, con la probabilidad como umbral configurable segun la tasa de falsos positivos tolerada.
- Triaje y scoring comercial: asignacion de prioridad o valor a leads y correos entrantes mediante preguntas de tipo `score`, alimentando un CRM con una puntuacion ordinal consistente.
- Encuestas y voz del cliente: clasificacion de respuestas abiertas en escalas ordinales (satisfaccion, intencion de recompra) sin necesidad de parsear texto generado.
- Clasificacion documental por lotes: etiquetado de facturas, contratos o incidencias en una taxonomia de hasta 255 categorias en una sola pasada por documento.
- Control de calidad sobre datos sinteticos: verificacion automatica de atributos concretos (idioma, tono, presencia de datos personales) en corpus generados, como paso previo a su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los benchmarks completos se publicaran junto con los lanzamientos de Lumma-Fev-3B y Lumma-Fev-9B, y senala que las preguntas con alta carga de conocimiento son el punto debil de la version de 0.6B.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 1,3 GB solo para los pesos, con overhead de activaciones que situa el consumo practico aproximado en 2-3 GB; calculo derivado del numero de parametros, no publicado por el autor.
- VRAM estimada si se cuantiza a int8: aproximadamente 0,65 GB; a int4: aproximadamente 0,33 GB (no se publican checkpoints cuantizados y el `custom_code` con lectura por puntero complica la conversion).
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090). Al ser prefill-only y de ~650 M de parametros, la carga es baja.
- GPU de referencia del autor: entrenamiento y servicio en bf16 sobre NVIDIA H200.
- Opciones de despliegue: `transformers` con `AutoModel`/`AutoTokenizer` y `trust_remote_code=True`. No hay soporte confirmado para vLLM, TGI, llama.cpp u Ollama, y al no ser un modelo generativo no aplican la decodificacion autorregresiva ni los formatos GGUF estandar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lumma-fev-0.6b | 650 M | Modelo de decision (clasificacion tipada) | no disponible | Ingles | MIT | safetensors en HuggingFace, requiere `custom_code` |
| Lumma-0.6B-Base | 649 M | Transformer causal generativo (base) | no disponible | no disponible | no disponible | HuggingFace (modelo base referenciado) |
| Familia Jev-like | no disponible | Modelo de decision | no disponible | no disponible | no disponible | La model card menciona la categoria, sin nombrar alternativas concretas |
| Lumma-Fev-3B / Lumma-Fev-9B | 3 B / 9 B (anunciados) | Modelo de decision | no disponible | no disponible | no disponible | Anunciados para la misma semana, con blog de benchmarks |

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilingue declarado.
- Con 0.6B de parametros, las preguntas que dependen de conocimiento factual son el punto debil reconocido por el autor.
- Las probabilidades no estan calibradas de fabrica: la model card recomienda ajustar una temperatura sobre datos propios antes de usar el modelo como puerta de automatizacion.
- No genera texto, por lo que no sirve para tareas de redaccion, resumen, extraccion libre ni dialogo.
- No dispone de tool calling, agentes ni razonamiento multi-paso; cualquier flujo de ese tipo debe implementarse en una capa externa.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor; conviene auditar ese codigo antes de desplegarlo en produccion.
- No se publican detalles del dataset de entrenamiento ni evaluaciones de sesgo, por lo que el riesgo de sesgos sistematicos en las decisiones no esta caracterizado.
- No se documentan la longitud de contexto soportada ni el comportamiento con documentos largos, lo que limita el diseno de pipelines que dependan de ventanas amplias.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, y la fecha indicada en HuggingFace es 2026-09-22; se trata de un modelo muy reciente y sin validacion externa conocida.
- La licencia MIT permite uso comercial, pero no cubre posibles reclamaciones derivadas de las decisiones automatizadas tomadas con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FrontiersMind/Lumma-fev-0.6b
- Modelo base: https://huggingface.co/FrontiersMind/Lumma-0.6B-Base
- Sitio web oficial: https://www.frontiersmind.ai/
- Discord: https://discord.gg/ZGdjCdRt
- LinkedIn: https://www.linkedin.com/company/frontiersmind/
- X (Twitter): https://x.com/FrontiersMind
- Contacto por correo: support@frontiersmind.ai
