# Maincode/Matilda-Decision-v1-Flash

## Resumen

Matilda Decision v1 Flash es un modelo de decisión multimodal de 8,4B de parámetros desarrollado por Maincode, derivado de Qwen3.5-9B. A diferencia de los modelos generativos convencionales, no produce texto: recibe un estado (texto o JSON, opcionalmente con imágenes) y una o varias preguntas estructuradas (elección entre opciones, sí/no o puntuación), y devuelve probabilidades para cada respuesta en una sola llamada. Está diseñado como un modelo de "sistema uno": decisiones rápidas, deterministas y cuantificables para pipelines automatizados.

Su relevancia reside en que resuelve un problema habitual en producción: usar LLM generativos para tareas de clasificación y enrutado es costoso y frágil, ya que exige parsear texto libre. Matilda Decision devuelve directamente probabilidades por opción, admite hasta 255 opciones por pregunta y múltiples preguntas por petición, y procesa imágenes (hasta 0,26 MP cada una), lo que lo hace adecuado para enrutado de solicitudes, moderación, validación documental y scoring.

El modelo comparte formato de peticiones y respuestas con Matilda Decision v1 (27B), lo que permite escalar entre la versión compacta y la grande sin cambiar la integración. Usa una arquitectura con capas de atención lineal y atención bidireccional, y requiere un runtime propio cargado con `trust_remote_code=True`. La longitud máxima de entrada es de 131.072 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone vision-lenguaje Qwen3.5-9B con cabezal de decisión de hasta 255 opciones, atención bidireccional en capas full-attention y capas de atención lineal |
| Parametros totales | 8.392.695.024 (incluye el codificador de visión) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 131.072 tokens de entrada (las peticiones que la superan lanzan un error; no hay truncado) |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16, 16,8 GB de repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un backbone vision-lenguaje, al que se añade un cabezal de lectura de decisiones ("decision readout") de hasta 255 opciones. Cada pregunta se resuelve en un único pase hacia adelante, leyendo la respuesta desde la posición final del prompt, sin generación autorregresiva. Esto reduce la latencia y elimina la variabilidad propia de la generación de texto.

Un detalle técnico destacable es el entrenamiento con atención bidireccional: las capas de atención completa ven todo el prompt simultáneamente, no solo los tokens anteriores a cada posición. Esto implica que el modelo debe servirse con el runtime incluido (`matilda_decision_runtime.py`, cargado con `trust_remote_code=True`); servir los pesos como backbone causal, o en un motor de inferencia causal, produce respuestas diferentes y de peor calidad. La librería opcional `flash-linear-attention` proporciona kernels GPU rápidos para las capas de atención lineal.

El post-entrenamiento se realizó a partir de Qwen3.5-9B sobre tareas de decisión en texto e imágenes. No se ha publicado información sobre el número de tokens, la composición del dataset ni el uso de técnicas concretas como RLHF o DPO.

## Capacidades

- Clasificación de elección ("choice") entre 1 y 255 opciones, con probabilidades por opción y nivel de confianza.
- Respuestas binarias sí/no ("noul"), devolviendo la probabilidad de que la afirmación sea verdadera.
- Puntuación en escala ("score") con niveles descritos, devolviendo el nivel esperado, probabilidades y leyenda.
- Entrada multimodal: texto o JSON arbitrario como estado, más varias imágenes por petición (rutas locales, URLs http(s), imágenes PIL o data URLs en base64).
- Procesamiento de imágenes hasta 262.144 píxeles (0,26 MP, unos 512 × 512) por imagen, con un token por parche de 32 × 32 píxeles (unas 256 tokens por imagen de 512 × 512).
- Múltiples preguntas por llamada: todas las preguntas ven el mismo estado y las mismas imágenes.
- Lectura del estado estrictamente como datos, no como instrucciones, lo que mitiga inyecciones de prompt desde el contenido de entrada.
- Sin truncado de entrada: rechaza peticiones por encima de 131.072 tokens en lugar de cortarlas.
- No genera texto libre ni soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de decisión puro.

## Casos de uso

- Enrutado de solicitudes de soporte: clasificar tickets entrantes por equipo (devoluciones, facturación, soporte técnico) con probabilidades por equipo, usando el ejemplo propio de la model card con texto y urgencia en una sola llamada.
- Validación de documentos con visión: comprobar si un recibo adjunto lista un producto concreto o cómo se pagó un pedido, combinando el texto del caso con imágenes del recibo.
- Moderación y filtrado de contenido: decidir sí/no sobre si un mensaje incumple una política, obteniendo una probabilidad calibrada en lugar de texto que haya que parsear.
- Scoring y priorización: asignar niveles de urgencia o prioridad a incidencias con escalas definidas por el equipo ("Rutina", "Pronto", "Hoy"), aprovechando el tipo "score" con leyenda.
- Clasificación zero-shot de texto: categorizar entradas en taxonomías grandes (hasta 255 clases) sin entrenamiento adicional, definiendo las opciones y sus descripciones en tiempo de ejecución.
- Procesamiento estructurado de JSON: analizar payloads de API (pedidos, registros, formularios) como estado y tomar decisiones sobre ellos sin convertirlos a texto plano.
- A/B de decisiones de baja latencia: al responder cada pregunta en un solo pase forward y sin generación, es adecuado para puntos de decisión en pipelines de alto volumen donde un LLM generativo sería demasiado lento o caro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 16,8 GB en safetensors, lo que sugiere precisión de 16 bits; se recomienda una GPU con al menos 24 GB de VRAM para cargar el modelo completo con margen. No hay cuantizaciones publicadas.
- GPU recomendadas: no disponible explícitamente; por VRAM, una RTX 4090 (24 GB), A100 o H100 serían adecuadas. No cabe en GPUs de 16 GB sin cuantización (no disponible).
- Consumer GPU: cabe en una RTX 4090 de 24 GB; no cabe cómodamente en tarjetas de 12-16 GB con pesos en 16 bits.
- Despliegue: mediante la librería `transformers` (versión 5.17.0 indicada en la model card) con `AutoModel.from_pretrained(..., trust_remote_code=True)`. No hay soporte indicado para vLLM, llama.cpp, Ollama o TGI; de hecho, servirlo en un motor causal daría resultados incorrectos por la atención bidireccional. Se recomienda instalar `flash-linear-attention` para kernels rápidos de atención lineal en GPU.
- Latencia y throughput: no disponible. La model card indica que cada pregunta requiere un único pase forward y que las imágenes reducen detalle (y por tanto coste) con límites inferiores de `max_image_pixels`.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Salida | Longitud de contexto | Licencia |
|---|---|---|---|---|---|
| Matilda Decision v1 Flash | 8,4B | Texto + imágenes | Probabilidades por decisión (choice/sí-no/score) | 131.072 tokens de entrada | Apache-2.0 |
| Matilda Decision v1 | 27B | Texto + imágenes (no disponible detalle) | Mismo formato de respuestas | no disponible | Apache-2.0 (presumida, misma familia) |
| Qwen3.5-9B (modelo base) | 9B | Texto + imágenes | Generación de texto | no disponible | Apache-2.0 |

La alternativa directa dentro de la misma familia es Matilda Decision v1 (27B), que acepta las mismas peticiones y devuelve respuestas en el mismo formato, permitiendo usar Flash como opción rápida y barata y la versión de 27B cuando se necesite mayor capacidad. Frente al modelo base Qwen3.5-9B, Matilda Decision sacrifica la generación de texto libre a cambio de decisiones probabilísticas estructuradas en un solo pase. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- No genera texto: si la tarea requiere redacción, razonamiento en varios pasos o tool calling, este modelo no es adecuado; es un clasificador/decisor puro.
- Requisito crítico de serving: el modelo fue entrenado con atención bidireccional y debe cargarse con `trust_remote_code=True` usando el runtime incluido. Servirlo en un motor causal (vLLM, llama.cpp, etc.) produce respuestas diferentes y peores.
- Dependencia de código remoto: cargar `matilda_decision_runtime.py` implica ejecutar código del autor del modelo, lo que exige confianza en el repositorio y revisión en entornos sensibles.
- Resolución de imagen limitada: cada imagen se redimensiona a un máximo de 0,26 MP (unos 512 × 512); se pierde detalle fino en gráficos, documentos y texto pequeño. Límites superiores a 0,26 MP no están validados.
- Sin truncado de entrada: las peticiones por encima de 131.072 tokens lanzan un error en lugar de recortarse, lo que obliga a gestionar la longitud en el cliente.
- Adopción temprana: con 23 descargas y 2 likes en el momento de la ficha, hay poca evidencia de uso en producción ni benchmarks independientes; conviene evaluarlo con datos propios antes de desplegarlo.
- Sesgos y riesgo de alucinación: no disponible información específica; al no generar texto, el modo de fallo típico son probabilidades mal calibradas más que alucinaciones literales, pero no hay datos publicados al respecto.
- Idiomas soportados: no disponible; verificar el comportamiento en castellano antes de uso en producción.
- Licencia: Apache-2.0, sin restricciones conocidas para uso comercial. El modelo base Qwen3.5-9B también es Apache-2.0.

## Enlaces

- Modelo: https://huggingface.co/Maincode/Maincode/Matilda-Decision-v1-Flash (nota: ID canónico https://huggingface.co/Maincode/Matilda-Decision-v1-Flash)
- Modelo hermano mayor: https://huggingface.co/Maincode/matilda-decision-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia Apache-2.0: enlace `LICENSE` en el repositorio del modelo (https://huggingface.co/Maincode/Matilda-Decision-v1-Flash/blob/main/LICENSE)
- Paper, blog o demo: no disponible
