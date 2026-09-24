# Chanunsiri/qwen3-schedule-chatbot

## Resumen

Chanunsiri/qwen3-schedule-chatbot es un adaptador LoRA (PEFT) alojado en Hugging Face por el usuario Chanunsiri, ajustado sobre el modelo base Qwen/Qwen3-0.6B. Por el nombre y por la existencia de un repositorio hermano del mismo autor (Chanunsiri/schedule-chatbot-model, descrito como "Answer school timetable questions via a custom model"), su proposito declarado es funcionar como chatbot especializado en consultas sobre horarios o planificacion. No es un modelo autonomo: requiere descargar el modelo base Qwen3-0.6B y cargar el adaptador encima.

El modelo base pertenece a la familia Qwen3 de Alibaba, publicada en 2025 bajo licencia Apache 2.0, e incluye variantes densas de 0.6B a 32B y variantes MoE. La variante de 0.6B es un transformer decoder denso de 28 capas con atencion GQA, disenado para ejecucion en CPU y dispositivos de gama baja.

La relevancia de esta ficha es limitada pero conviene ser explicito: se trata de un repositorio practicamente vacio. La model card es la plantilla por defecto de Hugging Face sin rellenar, no declara licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion, acumula 0 descargas y 0 "likes", y el tamano del repositorio figura como 0.0 GB. Cualquier uso en produccion exige auditoria previa de los pesos y de los derechos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder denso (modelo base Qwen3-0.6B: 28 capas, hidden size 1024, GQA con 16 cabezas de consulta y 8 de clave/valor) |
| Parametros totales | No disponible en el adaptador (los pesos del adaptador no se detallan); el modelo base tiene 0,6 mil millones de parametros |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No especificada para el adaptador; el modelo base Qwen3-0.6B soporta 32.768 tokens de forma nativa |
| Tipos de cuantizacion | El adaptador no publica cuantizaciones propias; puede combinarse con el modelo base cuantizado (GGUF Q4_K_M/Q5_K_M/Q8_0, AWQ, GPTQ, bitsandbytes 4 y 8 bits) |
| Idiomas soportados | No disponible (la model card no lo declara; el modelo base Qwen3 declara soporte para 119 idiomas) |
| Licencia | No disponible para el adaptador; el modelo base Qwen3-0.6B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-0.6B |
| Metodo de ajuste | LoRA (libreria PEFT, version de framework declarada: PEFT 0.21.0) |
| Etiqueta de pipeline | text-generation (conversational) |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion / ultima actualizacion | 23 de septiembre de 2026 / 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de bajo rango (LoRA) sobre Qwen3-0.6B, no un modelo completo. La arquitectura efectiva en inferencia es la del modelo base: un transformer decoder denso con normalizacion RMSNorm, activacion SwiGLU, atencion con consultas agrupadas (GQA) y embeddings atados entre entrada y salida. Qwen3-0.6B incorpora ademas un modo de razonamiento explicito ("thinking") que puede activarse o desactivarse mediante la plantilla de chat, segun el informe tecnico de la serie.

No hay ningun dato publicado sobre el entrenamiento del adaptador: se desconocen el conjunto de datos, el numero de tokens, la composicion del corpus, la existencia de RLHF, DPO o SFT, la configuracion del LoRA (rango, alpha, capas objetivo, dropout), la precision de entrenamiento, el hardware utilizado y la duracion. La model card conserva los marcadores "[More Information Needed]" en todas las secciones. Tampoco se documenta ninguna innovacion tecnica propia; la unica referencia externa incluida en las etiquetas (arxiv:1910.09700) corresponde al articulo del calculador de impacto de carbono que forma parte de la plantilla por defecto de Hugging Face, no a un articulo metodologico del modelo.

## Capacidades

- Generacion de texto conversacional: hereda del modelo base la capacidad de mantener dialogos multi-turno con una ventana de hasta 32.768 tokens.
- Respuesta a preguntas sobre horarios y planificacion: es el unico dominio que el nombre del repositorio y el modelo hermano del mismo autor sugieren como objetivo del ajuste.
- Modo de razonamiento del modelo base: Qwen3-0.6B permite alternar entre respuestas directas y cadenas de razonamiento ("thinking mode") mediante la plantilla de chat; no se ha verificado si el ajuste LoRA preserva o degrada este comportamiento.
- Soporte multilingue: no confirmado para el adaptador; el modelo base declara cobertura de 119 idiomas.
- Tool calling / function calling: soportado por el modelo base Qwen3; sin verificar en el adaptador tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: teoricamente heredables del modelo base, pero sin evidencia ni evaluacion publicada en este repositorio.
- Vision, audio o multimodalidad: no disponible, el modelo base es exclusivamente de texto.
- Capacidades especiales adicionales: ninguna documentada.

## Casos de uso

- Chatbot de consulta de horarios academicos: el escenario mas plausible dado el nombre del repositorio y la existencia de Chanunsiri/schedule-chatbot-model, descrito por su autor como respuesta a preguntas sobre horarios escolares. Se desplegaria como asistente conversacional que recibe el horario como contexto en el "prompt" y responde preguntas del tipo "que clase tengo el martes a tercera hora".
- Prototipo de bajo coste en CPU: al apoyarse en un modelo de 0,6B, el conjunto adaptador mas base cabe en menos de 1 GB en cuantizacion de 4 bits, por lo que sirve para validar una idea de producto conversacional sin GPU.
- Base para experimentos de PEFT: util como caso de estudio de ajuste LoRA sobre modelos diminutos (comparacion de rangos, capas objetivo, tasas de aprendizaje) en entornos academicos con recursos limitados.
- Asistente interno de planificacion de agenda: adaptando el dominio, puede reconvertirse en un asistente de calendario laboral o de reservas, siempre que se reentrene con datos propios y se validen las salidas.
- Filtro o enrutador previo en una arquitectura mayor: por su tamano, puede actuar como clasificador de intencion o preprocesador de consultas antes de invocar un modelo mayor, reduciendo coste por peticion.
- Demostraciones y material docente: adecuado para talleres que expliquen como funciona peft, el ciclo de fusion de pesos y la publicacion de adaptadores en Hugging Face.
- Atencion a preguntas frecuentes administrativas: si se reentrena con la normativa y el calendario de una institucion, puede dar respuestas de primer nivel y escalar a un humano cuando la confianza sea baja.

En todos los casos hay que advertir que el repositorio no aporta evidencia de calidad: cualquier despliegue real requiere reentrenamiento, evaluacion y una revision de licencia que hoy no puede resolverse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con los marcadores "[More Information Needed]" sin rellenar, y no hay ninguna tabla de resultados, conjunto de evaluacion ni metrica declarada por el autor. Las cifras oficiales del modelo base (Qwen3-0.6B) si existen y estan recogidas en el informe tecnico de la serie Qwen3, pero no son extrapolables al comportamiento del adaptador.

## Requisitos de hardware

- VRAM para el adaptador: despreciable (el repositorio figura con 0.0 GB, propio de un LoRA de rango bajo y pocas capas objetivo).
- VRAM para el modelo base en bf16/fp16: aproximadamente 1,2 GB de pesos, mas overhead de activaciones y cache KV.
- VRAM en cuantizacion de 8 bits: del orden de 0,7 GB; en 4 bits (GGUF Q4_K_M o bitsandbytes NF4): del orden de 0,4-0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4060, T4, L4). Modelos como A100, H100 o RTX 4090 estan sobredimensionados para este tamano y solo se justifican por agregacion de muchas peticiones concurrentes.
- Ejecucion en GPU de consumo: si, en practicamente cualquier GPU dedicada e incluso en graficas integradas recientes; tambien es viable en CPU pura con llama.cpp, aunque con latencia mayor.
- Opciones de despliegue: transformers mas peft (carga directa del adaptador), vLLM con soporte de LoRA, TGI, llama.cpp y Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y LM Studio para pruebas de escritorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este adaptador y el autor no documenta hardware, batch ni longitud de secuencia empleados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chanunsiri/qwen3-schedule-chatbot | Adaptador LoRA (base 0,6B) | No especificado (base: 32.768 tokens) | No disponible | Publico en Hugging Face, 0 descargas | Model card vacia, sin evaluacion |
| Qwen/Qwen3-0.6B | 0,6B densos | 32.768 tokens | Apache 2.0 | Publico, ampliamente utilizado | Modelo base del adaptador, con benchmarks en el informe tecnico |
| Qwen/Qwen3-1.7B | 1,7B densos | 32.768 tokens | Apache 2.0 | Publico | Alternativa de la misma familia con mayor capacidad y coste todavia bajo |
| Chanunsiri/schedule-chatbot-model | No disponible | No disponible | No disponible | Publico en Hugging Face | Modelo hermano del mismo autor, orientado al mismo dominio de horarios |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada; la eleccion entre el adaptador y el modelo base sin ajustar solo puede decidirse mediante una evaluacion propia sobre el dominio objetivo.

## Limitaciones y advertencias

- Model card sin contenido: todas las secciones relevantes (uso previsto, sesgos, datos de entrenamiento, hiperparametros, evaluacion) siguen en plantilla. No hay informacion verificable sobre que se entreno ni como.
- Licencia no declarada: al no indicarse licencia del adaptador, no puede asumirse permiso de uso comercial. La licencia Apache 2.0 del modelo base no cubre automaticamente los pesos derivados publicados por un tercero. Es imprescindible contactar con el autor antes de cualquier uso productivo.
- Pesos posiblemente ausentes o incompletos: el tamano de repositorio de 0.0 GB y la ausencia de descargas hacen necesario comprobar que los ficheros safetensors existen y son legibles antes de planificar nada.
- Riesgo elevado de alucinacion: un modelo de 0,6B tiene capacidad factual y de razonamiento limitada; en un dominio de datos concretos como los horarios, una respuesta incorrecta es un fallo critico. Cualquier despliegue debe incorporar verificacion contra la fuente de verdad (base de datos de horarios) y no fiarse de la generacion.
- Sesgos no evaluados: al desconocerse los datos de ajuste, no hay forma de auditar sesgos de genero, origen o idioma. El autor tampoco los aborda.
- Cobertura idiomatica incierta: la model card no declara idiomas. El ajuste podria haber degradado el multilingueismo del modelo base hacia un solo idioma.
- Degradacion por ajuste: el LoRA puede haber reducido capacidades generales (codigo, matematicas, tool calling) del modelo base a cambio de especializacion; no hay evaluacion que lo cuantifique.
- Sin soporte ni mantenimiento: 0 descargas, 0 "likes" y una unica actualizacion el mismo dia de creacion indican un experimento puntual, sin comunidad ni garantia de correccion de errores.
- Longitud de contexto efectiva: incluso si el modelo base admite 32.768 tokens, no hay evidencia de que el adaptador mantenga un rendimiento util con contextos largos.
- Advertencia de procedencia: parte de los metadatos del repositorio (etiqueta arxiv, plantilla de la model card) son residuos del andamiaje por defecto de Hugging Face y no deben interpretarse como documentacion tecnica del modelo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Chanunsiri/qwen3-schedule-chatbot
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo hermano del mismo autor: https://huggingface.co/Chanunsiri/schedule-chatbot-model
- Perfil del autor: https://huggingface.co/Chanunsiri
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Calculador de impacto de carbono citado en la plantilla: https://mlco2.github.io/impact
- Articulo de Lacoste et al. (2019) referenciado en la plantilla: https://arxiv.org/abs/1910.09700
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Qwen Chat (demo oficial de la familia Qwen): https://qwen.ai/qwenchat
- Investigacion de Qwen: https://qwen.ai/research/
