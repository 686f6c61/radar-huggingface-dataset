# Jundot/clef-flash-oQ3.5e

## Resumen

Jundot/clef-flash-oQ3.5e es un checkpoint cuantizado en formato MLX del modelo Cloudflare/clef-flash, un modelo de decisión de 9B post-entrenado a partir de Qwen/Qwen3.5-9B. En lugar de generar texto libre, el modelo recibe un estado (texto, JSON, imágenes) junto con un esquema de preguntas tipadas y devuelve, en una única pasada hacia delante, una probabilidad para cada opción permitida de cada pregunta. La tarea es por tanto clasificación y decisión estructurada, no generación abierta.

El checkpoint lo publica el autor Jundot (usuario detrás de la herramienta oQ/oMLX) aplicando cuantización de precisión mixta oQ3.5e con oMLX v0.7.1. La asignación de bits se decide por sensibilidad medida de cada capa y se refina con una matriz de importancia (128 muestras x 512 tokens) y un reajuste ponderado de escala y sesgo por mínimos cuadrados. El resultado es una media efectiva de 4,616 bits por peso para el conjunto del checkpoint, con un tamaño de repositorio de 5,5 GB.

El interés práctico del modelo reside en que permite ejecutar localmente en Apple Silicon un modelo de decisión multimodal de 9B con el backbone de lenguaje, el codificador de visión y la cabeza de esquema conjunta intactos, algo relevante para flujos de clasificación y enrutado en agentes donde no se quiere enviar datos a un servicio externo. La cabeza conjunta (joint_head.safetensors) se copia sin modificar desde el modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: backbone de lenguaje Qwen3.5-9B, codificador de visión y cabeza de esquema conjunta (joint schema head). Detalle de capas y mecanismos de atención: no disponible |
| Parametros totales | 9.409.813.744 parámetros reales en safetensors; 9,532B pesos lógicos según la model card |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precisión mixta oQ3.5e (MLX, affine, grupo 64): 3 bits en el 77,204% de los pesos lógicos, 5 bits en el 14,479%, 6 bits en el 2,244% y BF16 en el 6,073%. Media efectiva de 4,616 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), más joint_head.safetensors y joint_head_config.json |
| Libreria | mlx |
| Modelo base | Cloudflare/clef-flash (relación: quantized) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 5,5 GB (5,122 GiB de pesos) |
| Autor | Jundot |
| Fecha de publicación | 2026-10-11 |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado, no un entrenamiento nuevo. La arquitectura subyacente de Cloudflare/clef-flash combina tres componentes: el backbone de lenguaje de Qwen3.5-9B (8,954B pesos lógicos, 4,344 GB de almacenamiento), un codificador de visión (0,456B pesos, 0,912 GB) y una cabeza de esquema conjunta (0,122B pesos, 0,244 GB). La cabeza de esquema es la que produce las probabilidades sobre las opciones permitidas de cada pregunta tipada; según la model card, se copia sin cambios desde el modelo fuente. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo original.

La innovación técnica de este checkpoint es exclusivamente la cuantización. oQ3.5e asigna bits por sensibilidad medida de capa y redondea cada grupo con una matriz de importancia de 128 muestras por 512 tokens, seguida de un reajuste ponderado de escala y sesgo por mínimos cuadrados. La distribución resultante concentra el grueso de los pesos en 3 bits (7,359B parámetros lógicos, 2,998 GiB) y reserva 5 bits (1,380B, 0,884 GiB), 6 bits (0,214B, 0,162 GiB) y BF16 (0,579B, 1,078 GiB) para las capas más sensibles. El autor publica también un checkpoint hermano con cuantización oQ4e. No se detalla qué capas concretas reciben cada precisión.

## Capacidades

- Decisión estructurada: dada una descripción de estado y un esquema de preguntas tipadas (tipos citados en la documentación relacionada: noul/null, choice y score), devuelve una probabilidad para cada opción permitida de cada pregunta en una sola pasada.
- Multimodalidad de entrada: el pipeline declarado es image-text-to-text, y la documentación de Cloudflare para la familia Clef indica que el estado puede leerse como texto, JSON, imágenes o vídeo.
- Clasificación de alta velocidad orientada a flujos agénticos, según la descripción del blog de Cloudflare sobre la familia Clef.
- Procesamiento conjunto de múltiples preguntas: al resolver todas las preguntas del esquema en la misma pasada, evita múltiples llamadas al modelo para un mismo estado.
- Integración vía servicio: oMLX expone este checkpoint mediante el endpoint POST /v1/systemone.
- Capacidades conversacionales y de generación abierta: no documentadas para este modelo; la etiqueta conversational aparece en los tags del repositorio, pero el comportamiento descrito es de decisión, no de generación de texto libre.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible como característica declarada del modelo, aunque su uso como enrutador dentro de agentes se deriva del caso de uso descrito por Cloudflare.
- Idiomas soportados: no disponible.

## Casos de uso

- Triaje de tickets de soporte: se define un esquema con preguntas tipo choice (categoría, urgencia, equipo responsable) y el modelo devuelve una distribución de probabilidad por ticket en una única pasada, lo que permite enrutar automáticamente sin generar texto y sin encadenar varias llamadas.
- Enrutado de consultas en un agente: el modelo actúa como clasificador de intención que decide qué herramienta o subagente debe atender la petición, aprovechando la salida probabilística para aplicar umbrales de confianza y derivar a revisión humana los casos dudosos.
- Moderación de contenido multimodal: al aceptar imágenes y texto en el estado, permite clasificar publicaciones de usuario con preguntas tipadas (¿contiene violencia?, ¿es spam?) y obtener una probabilidad por etiqueta en lugar de una respuesta libre difícil de parsear.
- Puntuación de riesgo o de priorización comercial: mediante preguntas de tipo score, el modelo puede asignar puntuaciones graduadas a leads, solicitudes de crédito o incidencias, manteniendo una salida estructurada y comparable entre casos.
- Inspección visual en producción: con el codificador de visión integrado y un esquema de defectos definido por el equipo, se puede clasificar cada imagen de línea de producción pregunta a pregunta y registrar la probabilidad asociada a cada posible defecto.
- Extracción estructurada de documentos escaneados: formularios o facturas se convierten en un esquema de preguntas choice sobre campos esperados, devolviendo la opción más probable por campo sin necesidad de un modelo generativo que produzca texto que luego haya que validar.
- Despliegue local con datos sensibles: al ejecutarse sobre MLX en Apple Silicon, permite realizar clasificación y decisión sobre datos que no pueden salir de la máquina del usuario, algo habitual en entornos legales, sanitarios o financieros.
- Ajuste fino con datos propios: la familia Clef de Cloudflare se presenta junto a una plataforma de RL para afinar modelos de decisión, por lo que este checkpoint puede servir como punto de partida cuantizado para experimentación local antes de un afinado específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los resultados de búsqueda consultados no incluyen métricas de MMLU, HumanEval, GSM8K ni de tareas de clasificación para este checkpoint, ni para el modelo base Cloudflare/clef-flash en las fuentes disponibles.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 5,122 GiB (5,5 GB en el repositorio). A esa cifra hay que sumar la caché KV, las activaciones y el coste del codificador de visión, de modo que en la práctica conviene reservar del orden de 6 a 8 GB, aunque el valor exacto no está publicado.
- Plataforma: la librería declarada es MLX, por lo que la inferencia está pensada para Apple Silicon (familias M1, M2, M3 y M4). No hay soporte CUDA declarado.
- GPU recomendadas: no aplica en el sentido habitual; el equivalente es un Mac con memoria unificada suficiente. No se han publicado pruebas sobre A100, H100 ni RTX 4090, y MLX no las soporta de forma nativa.
- Cabe en hardware de consumo: sí, previsiblemente en cualquier Mac Apple Silicon con 16 GB de memoria unificada o más. Con 8 GB el margen es muy estrecho y probablemente obligue a reducir el contexto, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: oMLX (endpoint POST /v1/systemone), que es la vía documentada por el autor del checkpoint. Como runtime subyacente, MLX. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la presencia de la cabeza de esquema conjunta implica que estos motores no podrían servir el modelo completo sin trabajo adicional.
- Latencia y throughput: no disponibles.
- Almacenamiento: 5,5 GB en disco para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/clef-flash-oQ3.5e | 9,409.813.744 (9,532B lógicos) | safetensors MLX, oQ3.5e mixta a 4,616 bits/peso | No disponible | Apache-2.0 | HuggingFace, requiere MLX en Apple Silicon |
| Cloudflare/clef-flash (modelo base) | 9B (misma estructura de componentes) | Peso completo sin cuantizar según el repositorio original | No disponible | Apache-2.0 | HuggingFace |
| Jundot/clef-flash-oQ4e | No disponible | safetensors MLX, cuantización oQ4e (mayor precisión que oQ3.5e) | No disponible | No disponible | HuggingFace |
| Cloudflare Clef | 27B | Modelo multimodal de decisión, servido gestionado | No disponible | No disponible | Cloudflare Workers AI |

El modelo base Qwen/Qwen3.5-9B, del que procede el backbone de lenguaje, no es comparable de forma directa porque es un modelo generativo de propósito general, mientras que clef-flash está post-entrenado para producir decisiones sobre un esquema tipado.

## Limitaciones y advertencias

- No es un modelo generativo de propósito general: está diseñado para devolver probabilidades sobre opciones permitidas de un esquema de preguntas. No debe esperarse texto libre, resúmenes ni razonamiento en cadena.
- El riesgo de alucinación se manifiesta de otra forma: no puede inventar respuestas fuera del esquema, pero sí puede producir distribuciones de probabilidad mal calibradas. Conviene validar la calibración con datos propios antes de usarlo en decisiones automatizadas.
- La cuantización a 3 bits en el 77,2% de los pesos lógicos introduce una pérdida de precisión no cuantificada. No hay evaluación publicada que compare este checkpoint con el modelo base en ninguna tarea, por lo que el impacto real de la cuantización es desconocido.
- Dependencia de plataforma: requiere MLX y por tanto Apple Silicon. No hay ruta declarada a CUDA ni compatibilidad con los motores de inferencia habituales en servidores.
- Idiomas soportados: no disponible. No hay confirmación de que el modelo rinda correctamente fuera del inglés en las tareas de decisión.
- Longitud de contexto: no disponible. Esto impide dimensionar a priori casos con estados largos o muchas imágenes.
- Licencia Apache-2.0, heredada del modelo base, permite uso comercial, pero se debe conservar el fichero LICENSE y verificar las condiciones del modelo original de Cloudflare y, en última instancia, de la familia Qwen.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de terceros sobre su comportamiento en producción.
- El endpoint de servicio es específico (POST /v1/systemone en oMLX); integrarlo en una arquitectura existente exige adaptar el cliente y el formato de esquema de preguntas.
- La cabeza de esquema conjunta se copia sin modificar desde el modelo fuente: cualquier limitación del modelo de decisión original se traslada íntegramente a este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/clef-flash-oQ3.5e
- Árbol de ficheros del modelo: https://huggingface.co/Jundot/clef-flash-oQ3.5e/tree/main
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Checkpoint hermano con cuantización oQ4e: https://huggingface.co/Jundot/clef-flash-oQ4e
- Árbol de ficheros del checkpoint oQ4e: https://huggingface.co/Jundot/clef-flash-oQ4e/tree/main
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Blog de Cloudflare sobre la familia Clef: https://blog.cloudflare.com/clef-decision-models/
- Documentación de Clef en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/clef/
- Ficha de especificaciones de Clef-Flash: https://www.gradually.ai/en/ai-models/clef-flash/
