# Mnl20/agrobot-agrotolima

## Resumen

AgroBot v1 (AgroTolima) es un ajuste fino del modelo Qwen3-1.7B desarrollado como trabajo de grado de Ingeniería de Sistemas en la Universidad Cooperativa de Colombia (campus Ibagué Espinal) por Juan Manuel Castaño Espinosa y Yenny Faenza Pulido Méndez. Se trata de un modelo de 1.720.574.976 parámetros orientado a una tarea muy concreta: actuar como capa de decisión de un agente conversacional que asiste a productores agrícolas del departamento del Tolima (Colombia) dentro de la aplicación AgroTolima, seleccionando qué herramienta invocar y qué respuesta verbal emitir.

El modelo no está pensado para conversación abierta. Su función es recibir un mensaje estructurado con la plantilla de entrenamiento del agente y decidir entre llamar a una herramienta (abrir pantallas, rellenar el formulario de publicación, consultar el precio justo, gestionar pedidos, proponer un trueque) o generar una respuesta hablada. Se distribuye cuantizado a Q4_K_M en formato GGUF, con un tamaño de repositorio de 1,1 GB, y está diseñado para ejecutarse en CPU dentro del servicio del agente.

La relevancia del modelo es fundamentalmente académica y de nicho: demuestra un pipeline completo de destilación de conocimiento con 8.000 conversaciones sintéticas verificadas contra un simulador de la aplicación, entrenado con una GPU gratuita de Kaggle. El propio autor advierte que es una versión 1 no terminada, publicada para revisión del trabajo de grado y no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B), ajuste fino con LoRA |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | es (español) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,1 GB); adaptador LoRA derivado del base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros, y se ajusta mediante LoRA. La metodología de entrenamiento es destilación de conocimiento: un «profesor» programado generó 8.000 conversaciones sintéticas que fueron verificadas contra un simulador de la aplicación AgroTolima, y con ese corpus se ajustó el modelo en una GPU gratuita de Kaggle. No se emplearon datos de personas reales.

El entrenamiento está especializado en la decisión de siguiente acción del agente: elegir entre invocar una herramienta con argumentos concretos o emitir una respuesta hablada. El modelo espera recibir los mensajes con la plantilla de entrenamiento exacta del servicio del agente; fuera de ese formato puede entrar en bucles emitiendo texto de herramientas (`<tool_call>`). No se documentan detalles sobre número total de tokens de entrenamiento, composición del dataset más allá de las 8.000 conversaciones sintéticas, ni uso de RLHF o DPO.

## Capacidades

- Decisión de invocación de herramientas (tool calling) dentro de un conjunto cerrado de acciones de la aplicación AgroTolima: apertura de pantallas, relleno del formulario de publicación, consulta de precio justo, atención de pedidos y propuesta de trueque.
- Generación de respuestas habladas válidas para el productor, en español.
- Extracción y estructuración de argumentos para las herramientas (categoría de producto, unidades, datos de perfil).
- Operación en modo agente de un solo paso por turno: clasifica el tipo de paso (herramienta o respuesta) y emite la acción correspondiente.
- Ejecución en CPU sin GPU, con un tiempo medido de 1,47 s por paso.
- Capacidades multilingües: limitadas al español según la model card.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking) documentados.

## Casos de uso

- Asistente de publicación de productos para el productor: el modelo interpreta la frase del usuario y rellena el formulario de publicación invocando la herramienta correspondiente con los argumentos extraídos (producto, categoría, unidad), lo que reduce la fricción de uso de la aplicación para usuarios con baja alfabetización digital.
- Consulta de precio justo: ante una pregunta sobre el precio de un producto, el modelo decide invocar la herramienta de consulta de precios en lugar de responder de memoria, evitando cifras inventadas.
- Gestión de pedidos entrantes: el agente usa el modelo para clasificar la intención del mensaje (consultar pedido, aceptar, rechazar) y emitir la llamada de herramienta adecuada dentro del flujo de la aplicación.
- Propuesta de trueque entre productores: el modelo identifica la intención de intercambio y genera la llamada de herramienta para iniciar la propuesta, que después requiere confirmación explícita del usuario a través del código del agente.
- Atención conversacional guiada por voz sintética: integrado en el servicio del agente, permite conversaciones de un turno por paso con respuestas habladas, adecuado para entornos donde el productor interactúa por voz.
- Prototipo académico de agente de dominio restringido: sirve como referencia reproducible de un pipeline de destilación con profesor programado, simulador y verificación automática, reutilizable para otros dominios verticales con recursos limitados.
- Despliegue en entornos con hardware modesto: al ejecutarse en CPU a 1,47 s por paso, puede integrarse en servidores sin GPU o en dispositivos de borde dentro de la infraestructura de la aplicación.

## Benchmarks y rendimiento

Evaluación del autor sobre un paso de prueba de 60 pasos:

| Medida | Resultado |
|---|---|
| Tipo de paso correcto (herramienta o respuesta) | 98,3 % (59 de 60) |
| Herramienta y argumentos exactos | 91,9 % (34 de 37) |
| Respuesta hablada válida | 100 % (23 de 23) |
| Tiempo en CPU, sin GPU | 1,47 s por paso |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con cuantización Q4_K_M sobre 1,7 mil millones de parámetros, el archivo GGUF ocupa aproximadamente 1,1 GB, por lo que cabría en GPUs de consumo con 4 GB o más de VRAM.
- GPU recomendadas: no especificadas por el autor; el modelo se validó en CPU.
- Compatibilidad con GPU de consumo: sí, por tamaño (cualquier GPU con al menos 4 GB de VRAM sería suficiente en Q4_K_M), aunque no hay pruebas publicadas.
- Opciones de despliegue: Ollama (`ollama run hf.co/Mnl20/agrobot-agrotolima:Q4_K_M` o mediante `Modelfile`); llama.cpp por el formato GGUF. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: 1,47 s por paso en CPU sin GPU, según la evaluación del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| AgroBot v1 (AgroTolima) | 1,72 B | no disponible | Agente agrícola vertical (Tolima) | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible en la información | Modelo generalista | Apache 2.0 | safetensors |
| Alternativas comparables de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada; la comparación con el base Qwen3-1.7B se limita a la relación de derivación y a la especialización vertical del ajuste.

## Limitaciones y advertencias

- El autor declara explícitamente que es una versión 1 no terminada, con errores, publicada para revisión académica y no para producción.
- Evaluado únicamente con frases de voces sintéticas; no se ha probado con voz real de campesinos, lo que limita la validez ecológica de los resultados.
- Fallos documentados: asignación incorrecta de categoría en un producto nuevo (piña clasificada como «Fríjol y legumbres»), omisión de la unidad en un formulario y un caso en el que no se invocó `guardar_perfil`.
- Riesgo de bucles de `<tool_call>` si se usa sin la plantilla de entrenamiento del agente; no es apto para conversación directa.
- El modelo no decide sobre acciones que modifican datos reales: la confirmación la gestiona el código del agente, que exige un «sí» explícito; los precios y cifras provienen de herramientas, no de la memoria del modelo.
- Entrenado exclusivamente con datos sintéticos y en español; no hay evidencia de comportamiento con datos reales ni con otros idiomas o variantes dialectales.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial, aunque el autor desaconseja su uso en producción en esta versión.
- Longitud de contexto no documentada; no se recomienda para tareas que requieran ventanas largas sin verificación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mnl20/agrobot-agrotolima
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
