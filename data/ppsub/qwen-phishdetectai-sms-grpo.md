# ppsub/Qwen-PhishDetectAI-SMS-GRPO

## Resumen

Qwen-PhishDetectAI-SMS-GRPO es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario `ppsub` en HuggingFace. Por el nombre del repositorio y las etiquetas declaradas (`trl`, `unsloth`, `qwen2`, `text-generation-inference`), se trata de un modelo orientado a la deteccion de mensajes SMS de phishing (smishing), entrenado mediante GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo que optimiza la politica del modelo a partir de recompensas relativas dentro de un grupo de respuestas generadas.

El modelo parte de `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, una version del Qwen2.5-1.5B-Instruct ya preparada por Unsloth para entrenamiento eficiente en 4 bits. El resultado es un modelo de 1.543.714.304 parametros (aproximadamente 1,54 mil millones), con arquitectura transformer decoder-only de tipo Qwen2, licencia Apache-2.0 y un tamano de repositorio de 3,1 GB. Su tamano reducido permite desplegarlo en hardware de consumo o incluso en CPU, lo que lo hace atractivo para filtrado de mensajes en tiempo real y en el borde.

La relevancia de este modelo es acotada y hay que situarla en contexto: se publico el 13 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", sin resultados de benchmarks publicados ni documentacion de dataset en la model card. Es, por tanto, un artefacto experimental sin validacion independiente, no un modelo listo para produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con fine-tune sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (~1,54 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens de contexto nativo, pero este fine-tune no confirma dicho valor |
| Tipos de cuantizacion | No se publican cuantizaciones propias (ni GGUF, ni AWQ, ni GPTQ). El modelo base de partida estaba en `bnb-4bit`; el repositorio solo contiene pesos en precision completa |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (`transformers`) |

## Arquitectura y entrenamiento

Arquitectura Qwen2 estandar: transformer decoder-only con normalizacion RMSNorm, atencion con sesgo QKV (QKV bias), activacion SwiGLU y conexiones residuales pre-norm. El modelo hereda la inicializacion del Qwen2.5-1.5B-Instruct, por lo que la parte de instruccion general (dialogo, seguimiento de instrucciones basicas) proviene del modelo original; el ajuste posterior es el que especializa el comportamiento.

El entrenamiento declarado se basa en GRPO, segun el sufijo del nombre del repositorio y las etiquetas `trl` y `unsloth`, que apuntan al uso de la libreria TRL de HuggingFace y al framework Unsloth para ajuste eficiente en memoria. GRPO es una variante de aprendizaje por refuerzo sin modelo critico que compara las respuestas de un grupo de muestras para calcular la ventaja relativa de cada una, lo que resulta util en tareas de clasificacion con recompensa verificable (por ejemplo, etiquetar correctamente un SMS como phishing o legitimo). No se especifica en la model card el numero de tokens de entrenamiento, la composicion del dataset, la existencia de una fase previa de SFT o DPO, ni la funcion de recompensa empleada. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instruct base.
- Deteccion de phishing en mensajes SMS (smishing), presumiblemente mediante clasificacion generativa: el modelo responde con una etiqueta o juicio textual que el sistema anfitrion debe parsear.
- Razonamiento de un solo turno orientado a la decision (legitimo / sospechoso / fraudulento), segun el proposito declarado en el nombre del modelo.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada. El modelo base Qwen2.5-Instruct lo soporta, pero este fine-tune no lo documenta ni garantiza.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Capacidades multilingues: no. Solo se declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Integracion con `text-generation-inference` y compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue mediante la libreria `transformers` y TGI.

## Casos de uso

- Filtrado de smishing en pasarelas SMS corporativas: el modelo puede colocarse detras de un agregador de mensajeria y clasificar cada mensaje entrante como legitimo o fraudulento antes de entregarlo al usuario final; su tamano de 1,5B permite mantener latencias bajas en un servicio con muchos mensajes por segundo.
- Guardarraíl en aplicaciones de mensajeria: integrado como paso de verificacion previo a mostrar un enlace o un remitente desconocido, con el modelo generando una breve justificacion que se puede registrar para auditoria.
- Enriquecimiento de pipelines antispam existentes: usar el modelo como clasificador secundario (ensemble) sobre los mensajes que el filtro basado en reglas marca como dudosos, reduciendo falsos positivos sin necesidad de un modelo grande.
- Analisis de notificaciones push y correos cortos: aunque el modelo se presenta para SMS, su formato de entrada (texto corto con enlaces y remitentes) es trasladable a notificaciones push y mensajes de aplicaciones de mensajeria.
- Generacion de explicaciones para usuarios finales: en lugar de una etiqueta binaria, el modelo puede producir una respuesta en lenguaje natural indicando que indicios del mensaje son sospechosos (dominio acortado, urgencia artificial, remitente generico), util para interfaces de concienciacion.
- Apoyo a analistas de fraude: como asistente de triaje que resume y clasifica lotes de mensajes reportados por usuarios antes de la revision humana.
- Despliegue on-premise o en el borde: al ocupar aproximadamente 3,1 GB en precision completa y poder cuantizarse por debajo de 1 GB, es viable en entornos sin GPU dedicada o con requisitos de soberania de datos.
- Prototipado e investigacion en RL para clasificacion de texto: sirve como caso de estudio reproducible de un pipeline Unsloth + TRL con GRPO sobre una tarea de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1 ni comparaciones con otros detectores de phishing, y el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas cache KV y overhead del runtime):
  - FP16 / BF16: aproximadamente 3,1 GB de pesos, en torno a 4 GB en total.
  - INT8: aproximadamente 1,6 GB de pesos, en torno a 2,5 GB en total.
  - INT4: aproximadamente 0,9-1 GB de pesos, en torno a 1,5-2 GB en total.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM. Para servicio en produccion, una NVIDIA L4, A10G, RTX 4090 o RTX 3090 es mas que suficiente; una A100 o H100 solo se justifica si se agrupan muchas peticiones concurrentes en la misma instancia.
- Cabe en GPU de consumo: si. Funciona en RTX 3060 12 GB, RTX 4060, RTX 3070/4070 e incluso en GPUs de 4 GB con cuantizacion INT4. Tambien es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM mediante un servidor compatible con OpenAI, y HuggingFace Inference Endpoints. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que no se publica ninguna version GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de su documentacion publica general, no de la busqueda web ni de la model card analizada; el rendimiento de Qwen-PhishDetectAI-SMS-GRPO no esta medido, por lo que la columna de rendimiento queda como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| ppsub/Qwen-PhishDetectAI-SMS-GRPO | 1,54B | No confirmado | Apache-2.0 | HuggingFace, safetensors | No disponible |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,54B | 32.768 tokens | Apache-2.0 | HuggingFace, safetensors/GGUF | No disponible en esta ficha |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache-2.0 | HuggingFace, safetensors/GGUF | No disponible en esta ficha |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens | Licencia Gemma (uso comercial con condiciones) | HuggingFace, gated | No disponible en esta ficha |

Frente a estos alternativas, la diferencia principal de Qwen-PhishDetectAI-SMS-GRPO no es de arquitectura ni de tamano, sino de especializacion: esta ajustado para una tarea concreta (deteccion de smishing) y su licencia Apache-2.0 es mas permisiva que la de Gemma 2. A cambio, carece de la validacion, los benchmarks y el soporte de la comunidad que si acompanan a los modelos base genericos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo ni de equidad.
- Riesgo de alucinacion: alto en el sentido de que es un modelo generativo, no un clasificador con cabecera softmax. Puede producir justificaciones plausibles pero incorrectas, y requiere parseo robusto de la salida para extraer la etiqueta. En una tarea de seguridad, un falso negativo (mensaje de phishing clasificado como legitimo) tiene un coste directo para el usuario.
- Limitaciones de idioma: solo se declara ingles. Su uso con SMS en castellano no esta soportado ni evaluado; el rendimiento en otros idiomas es impredecible.
- Limitaciones de contexto: no se confirma la ventana de contexto efectiva del fine-tune. Los SMS son cortos, por lo que la limitacion practica es menor, pero conviene no asumir los 32.768 tokens del modelo base sin verificacion.
- Naturaleza generativa frente a clasificacion: al no ser un modelo de clasificacion con logits, la calibracion de la confianza y el umbral de decision dependen por completo del prompt y del parseo, lo que complica la integracion en sistemas que exigen probabilidades.
- Vulnerabilidad a evasión adversaria: los modelos generativos pequenos son sensibles a tecnicas de evasion tipicas del spam (homoglifos Unicode, sustitucion de caracteres, texto partido, imagenes en lugar de texto). No hay datos de robustez.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia. Al derivar de Qwen2.5 (tambien Apache-2.0) no hay restricciones adicionales conocidas, pero conviene verificar la licencia del repositorio Unsloth de partida.
- Ausencia de validacion: 0 descargas, 0 "likes", sin benchmarks, sin dataset documentado y sin autor de referencia. No debe desplegarse en produccion sin una evaluacion propia sobre un conjunto de test representativo.
- Riesgo de sobreajuste: al estar entrenado presumiblemente sobre un corpus concreto de SMS de phishing (no documentado), puede degradarse ante campanas nuevas o vocabularios distintos de los vistos durante el entrenamiento.
- Fechas de publicacion: el repositorio figura como creado y actualizado el 13 de septiembre de 2026, en una unica sesion, lo que sugiere que no ha habido mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ppsub/Qwen-PhishDetectAI-SMS-GRPO
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- TRL (libreria de entrenamiento con GRPO): https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Text Generation Inference: https://github.com/huggingface/text-generation-inference

Nota sobre la busqueda web: los unicos resultados devueltos por la busqueda han sido un hilo del foro de la comunidad de PayPal sobre la venta de una motocicleta con pago internacional (https://www.paypal-community.com/t5/Verkaufen/Motorrad-verkauf-Nach-Schweden-mit-Zahlung-%C3%BCber-Paypal/td-p/1815489). Se trata de contenido no relacionado con el modelo, sin valor documental para esta ficha. No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a Qwen-PhishDetectAI-SMS-GRPO.
