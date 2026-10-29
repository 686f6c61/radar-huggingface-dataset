# Gabbio/driptips-concierge-qwen3-4b

## Resumen

driptips-concierge (v5) es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 desarrollado por el usuario Gabbio para el equipo driptips, un proyecto presentado al hackathon Ostrovok O! 2026 en la categoría «О!дин запрос». No es un modelo generalista: resuelve dos tareas muy acotadas dentro de una aplicación de planificación de viajes. La primera es convertir una frase libre de un huésped en ruso en un plan de viaje estructurado en JSON (`plan_trip`) con destino, fechas, número de huéspedes y edades de los niños, presupuesto por noche o por viaje, servicios de hotel imprescindibles y deseables, tipo de viaje, preferencias de clima y mar, visado, comida y preguntas de aclaración. La segunda es responder preguntas sobre un destino ciñéndose estrictamente a una referencia proporcionada (clima, visado, precios, duración de vuelo), sin inventar cifras.

El modelo tiene 4.022.468.096 parámetros y se obtiene aplicando LoRA (r=16 sobre todas las capas lineales) al modelo base y fusionando los pesos después. La relevancia práctica está en su diseño de contención: la aplicación nunca presenta el texto libre del modelo como un hecho, sino que las fechas, el presupuesto y la respuesta al huésped se calculan por código a partir de una base de conocimiento, y cada respuesta se contrasta contra ella. Es, por tanto, un ejemplo de integración de un LLM pequeño como extractor de estructura y redactor anclado a fuentes, no como fuente de verdad.

El repositorio se publica con licencia Apache 2.0, en safetensors y con una versión GGUF derivada, y está pensado para ejecutarse en CPU con el servidor compatible con OpenAI de llama.cpp (`llama-server`). En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 likes, y su model card está mayoritariamente en inglés pese a que el idioma de trabajo es el ruso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507), ajuste LoRA fusionado |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (la model card no la especifica; se heredaría del modelo base) |
| Tipos de cuantización | El repositorio declara safetensors y GGUF; los niveles concretos de cuantización GGUF no se detallan en la información disponible |
| Idiomas soportados | Ruso (`ru`) según la model card y los tags |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados) y GGUF |

Otros datos del repositorio: pipeline `text-generation`, tamaño del repositorio 12,3 GB, tags `travel`, `lora`, `qwen3`, `ostrovok-hackathon-2026`, `endpoints_compatible`, región `us`, creado el 28 de octubre de 2026 y actualizado el mismo día.

## Arquitectura y entrenamiento

La base es un transformer denso de la familia Qwen3 en su variante Instruct-2507, con 4.022 millones de parámetros. El ajuste se realizó con LoRA de rango 16 aplicado a todas las capas lineales y posteriormente se fusionó en los pesos finales, de modo que la inferencia no requiere cargar adaptadores separados. La model card no describe cambios en la arquitectura, en el tokenizador ni en el esquema de atención: se trata de un fine-tune de comportamiento sobre el modelo base.

Los detalles de entrenamiento son escasos. La model card remite al repositorio de GitHub del proyecto (`training/`, `docs/own-model.md`) para datos, prompts y evaluación, pero no indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas adicionales de RLHF o DPO tras el ajuste supervisado. Al partir de una versión Instruct, el modelo hereda el post-entrenamiento del modelo base de Qwen, que tampoco se documenta aquí. La innovación destacable no está en el entrenamiento sino en el contrato de uso: dos tareas cerradas, salida JSON validable y respuestas sobre destino condicionadas a una referencia externa, con verificación posterior por código.

## Capacidades

- Extracción estructurada de parámetros de viaje a partir de lenguaje natural en ruso: destino, fechas, huéspedes, edades de los niños, presupuesto por noche o por viaje, servicios de hotel, tipo de viaje, preferencias de clima y mar, visado y comida.
- Emisión de JSON válido para la función `plan_trip`, con una tasa de JSON válido del 99,8 % en frases de plantilla y del 99,5 % en frases parafraseadas según la evaluación del autor.
- Generación de preguntas de aclaración cuando la petición es incompleta (el esquema de salida incluye un campo de preguntas).
- Respuesta a preguntas sobre destino anclada a una referencia suministrada (clima, visado, precios, tiempo de vuelo), con una tasa del 100 % de ausencia de números inventados en el test del autor.
- Comprensión de paráfrasis: el test con frases parafraseadas mantiene el 99,5 % de JSON válido, aunque la búsqueda final correcta baja al 72,4 %.
- No se documenta soporte de tool calling ni de function calling genérico, ni capacidades de agente multi-paso, visión, audio o modo de razonamiento extendido.
- Capacidad multilingüe limitada al ruso en la práctica; el modelo base es multilingüe, pero el ajuste está orientado a ruso y no se han publicado evaluaciones en otros idiomas.

## Casos de uso

- Extracción de parámetros de búsqueda hotelera: el modelo recibe la frase libre de un cliente en ruso y devuelve el JSON que alimenta el motor de búsqueda. Es adecuado porque el esquema de salida es fijo y verificable, y el 95,0 % de las 60 frases del test independiente produjeron la búsqueda final correcta.
- Asistente de viaje con respuestas verificadas: para preguntas sobre visado, clima, precios o duración de vuelo, el modelo redacta a partir de una referencia inyectada en el prompt y el backend valida la respuesta contra la base de conocimiento antes de mostrarla. El diseño encaja en dominios donde una cifra inventada tiene coste reputativo o legal.
- Normalización de lenguaje natural a formularios: conversión de peticiones como «una semana en Estambul en agosto con dos niños» en campos estructurados (fechas, huéspedes, edades), evitando que el usuario rellene formularios largos.
- Enrutado y desambiguación en un front-end conversacional: el campo de preguntas del JSON permite detectar peticiones incompletas y devolver una aclaración al usuario en lugar de una búsqueda con valores por defecto.
- Despliegue en infraestructura modesta: al caber en CPU con `llama-server` y disponer de GGUF, sirve para prototipos y demos de hackathon sin GPU, con el coste de latencia asociado.
- Base para un pipeline de evaluación con grounding: útil como banco de pruebas para medir tasas de JSON válido, fidelidad a la referencia y calidad de extracción en un dominio concreto antes de escalar a un modelo mayor.
- Atención al cliente en ruso con contención de alucinaciones: en un chat de reservas, el modelo solo redacta la respuesta final a partir de datos ya calculados por código, reduciendo el riesgo de afirmaciones no respaldadas.
- Filtrado previo en un sistema de recomendación: clasificación del tipo de viaje y de los servicios imprescindibles para prefiltrar el catálogo hotelero antes de aplicar reglas de negocio.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible. El autor publica una evaluación propia sobre tareas del dominio, que se reproduce a continuación tal cual:

| Prueba | Métrica | Resultado |
|---|---|---|
| Test independiente, 60 frases escritas a mano | Búsqueda final correcta | 95,0 % |
| Test independiente, 60 frases escritas a mano | Plan totalmente correcto | 76,7 % |
| Frases de plantilla | JSON válido | 99,8 % |
| Frases de plantilla | Búsqueda correcta | 95,0 % |
| Frases parafraseadas | JSON válido | 99,5 % |
| Frases parafraseadas | Búsqueda correcta | 72,4 % |
| Preguntas sobre destino | Sin números inventados | 100 % |

Estos datos provienen de la model card del autor y no son comparables con benchmarks académicos: el conjunto de test es pequeño (60 frases en el test independiente) y ha sido escrito por el propio equipo, por lo que no hay garantía de independencia ni de representatividad frente a tráfico real. La caída del 95,0 % al 72,4 % en búsqueda correcta al pasar de frases de plantilla a parafraseadas es la señal más relevante de fragilidad del ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: unos 8,0 GB solo de pesos, con un total práctico de 10-12 GB contando caché KV y overhead del runtime.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,3 GB de pesos.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 2,5-2,7 GB de pesos, lo que deja margen para contexto largo en tarjetas de 6-8 GB.
- GPU recomendadas: H100, A100 o L40S para servicio concurrente en precisión completa; RTX 4090 o RTX 3090 para desarrollo y pruebas; RTX 4060 Ti 16 GB o RTX 3060 12 GB como opción consumer solvente en bf16.
- Cabe en GPU consumer: sí. En Q4 entra en tarjetas de 6 GB (GTX 1660, RTX 2060) con contexto moderado; en bf16 requiere 12 GB o más.
- El caso de uso declarado por el autor es CPU con `llama-server` (servidor compatible con OpenAI de llama.cpp) y la versión GGUF derivada, por lo que no necesita GPU para funcionar.
- Opciones de despliegue: llama.cpp / `llama-server` (diseño previsto por el autor), Ollama a partir del GGUF, vLLM o TGI con los safetensors si se dispone de GPU. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición, ni en CPU ni en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| driptips-concierge-qwen3-4b | 4,02 B | No disponible | Extracción JSON de viaje y Q&A con grounding en ruso | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | No disponible en esta ficha | Propósito general, instrucciones y multilingüe | Apache 2.0 | HuggingFace, ampliamente distribuido |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens | Propósito general, instrucciones | Apache 2.0 | HuggingFace |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Propósito general, instrucciones | Llama 3.2 Community License | HuggingFace |

Frente al modelo base, driptips-concierge intercambia generalidad por precisión en un esquema de salida concreto y por el anclaje a referencias; no hay datos que permitan afirmar que conserva las capacidades generales de Qwen3-4B-Instruct-2507 tras el ajuste, ya que no se han publicado evaluaciones fuera del dominio. Los dos modelos de ~3 B de la tabla son alternativas genéricas de tamaño comparable con las que se podría replicar el enfoque mediante prompting y validación de esquema, sin necesidad de fine-tune; no se dispone de comparación de rendimiento directa entre ellos y driptips-concierge en las tareas del hackathon.

## Limitaciones y advertencias

- Modelo de nicho: solo cubre dos tareas de planificación de viajes en ruso. Fuera de ese dominio no hay evidencia de calidad y la model card no documenta comportamiento general.
- Idiomas: declarado únicamente para ruso. No se han publicado evaluaciones en castellano ni en inglés, pese a que el modelo base es multilingüe.
- Fragilidad ante paráfrasis: la búsqueda correcta cae al 72,4 % con frases parafraseadas frente al 95,0 % con plantillas, y el plan completo solo es correcto en el 76,7 % del test independiente. Un 23,3 % de planes incompletos o incorrectos es un riesgo alto para producción sin validación adicional.
- Evaluación no independiente: los resultados provienen de un test de 60 frases escritas por el propio equipo, sin conjunto público ni protocolo replicable más allá del repositorio de GitHub.
- Riesgo de alucinación mitigado por diseño, no eliminado: el 100 % de ausencia de números inventados se ha medido solo en la tarea de preguntas sobre destino y con una referencia inyectada. Si se usa el modelo sin ese contexto, no hay garantía alguna.
- Dependencia de la aplicación: el propio autor advierte que la aplicación nunca muestra el texto libre como hechos y que fechas, presupuesto y respuesta se calculan por código. Usar el modelo como generador de respuestas directas rompe esa garantía.
- Licencia Apache 2.0, permisiva para uso comercial, igual que el modelo base. No se declaran restricciones adicionales, aunque conviene revisar los términos del modelo base por si hubiera condiciones heredadas.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública documentada. No hay evidencia de uso en producción ni de mantenimiento posterior a la fecha del hackathon.
- Documentación incompleta: no se especifican contexto máximo, composición del dataset de entrenamiento, número de tokens vistos, niveles de cuantización GGUF publicados ni métricas de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gabbio/driptips-concierge-qwen3-4b
- Repositorio del proyecto (código, datos de entrenamiento, prompts y evaluación): https://github.com/ostrovok-hackathon-2026/driptips
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
