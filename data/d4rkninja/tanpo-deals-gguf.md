# d4rkninja/tanpo-deals-GGUF

## Resumen

Tanpo Deals (GGUF) es la version cuantizada en formato GGUF del modelo d4rkninja/tanpo-deals, un especialista de dominio entrenado por el usuario d4rkninja sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct de Liquid AI. Se trata de un ajuste fino por LoRA (via Unsloth / PEFT) orientado a un nicho muy concreto: cierre de ventas B2B, cualificacion de oportunidades, gestion de objeciones, elaboracion de propuestas y movimientos con canales y distribuidores. El resultado se publica en tres formatos complementarios: pesos fusionados (safetensors), adaptador LoRA y estas cuantizaciones GGUF para ejecucion local.

El modelo es deliberadamente pequeno: 1.170.340.608 parametros (aproximadamente 1,17 mil millones) y una ventana de contexto de 32.768 tokens, heredada del modelo base. Su proposito no es competir en capacidad generalista, sino ofrecer un asistente de dominio que quepa en hardware de consumo y pueda desplegarse sin coste de API, algo relevante para equipos comerciales que quieren procesar informacion sensible de clientes y precios en local.

La relevancia actual del lanzamiento esta en su enfoque de especializacion vertical sobre una arquitectura compacta: el autor mantiene una familia de especialistas de negocio (marketing, producto, hiring, deals, fundraising) construidos sobre la misma base LFM2.5, de modo que se puede cambiar de especialista sin cambiar de infraestructura. La model card reporta una mejora de 7,3 puntos porcentuales en una evaluacion por rubrica propia (87,9 % del base frente a 95,2 % del ajuste), aunque no se publican resultados en benchmarks estandarizados y el modelo solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada de LiquidAI/LFM2.5-1.2B-Instruct (familia LFM2.5 de Liquid AI); la model card no detalla la composicion interna de capas. No disponible |
| Parametros totales | 1.170.340.608 (aproximadamente 1,17 B, segun safetensors del modelo fusionado) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q8_0 (archivos GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (hereda las obligaciones de la licencia upstream de Liquid AI LFM2.5) |
| Formato de pesos | GGUF (llama.cpp); el modelo fusionado original esta en safetensors y el adaptador en LoRA |
| Tamano del repositorio | 4,9 GB |
| Modelo base | LiquidAI/LFM2.5-1.2B-Instruct |
| Pipeline | text-generation |
| Descargas / likes | 30 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base LiquidAI/LFM2.5-1.2B-Instruct, un modelo de la familia LFM2.5 de Liquid AI con aproximadamente 1,17 B de parametros y 32.768 tokens de contexto. La model card de esta cuantizacion no especifica detalles internos de la arquitectura (tipo de capas, atencion, composicion del bloque), por lo que ese dato no esta disponible en la informacion proporcionada. Si se conoce la cadena de construccion: el ajuste se realizo con Unsloth / PEFT mediante LoRA, cargando el modelo a traves del hub id unsloth/LFM2.5-1.2B-Instruct, y despues se fusionaron los pesos del adaptador con el modelo base para generar los pesos finales.

El entrenamiento consiste en un SFT de dominio (ventas, alianzas y negociacion) sobre el modelo instructivo. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO mas alla del ajuste supervisado. Tampoco se documentan innovaciones tecnicas propias del ajuste (por ejemplo, decodificacion especulativa o variantes de atencion): el valor anadido del modelo es la especializacion de dominio, no una innovacion arquitectonica. La evaluacion publicada es una rubrica propia del autor (artefactos en la carpeta evaluation del modelo fusionado), no un conjunto de benchmarks academicos.

## Capacidades

- Generacion de texto conversacional en ingles orientada a flujos comerciales B2B.
- Cualificacion de oportunidades (qualification): preguntas de descubrimiento, criterios de encaje y priorizacion de leads.
- Gestion de objeciones comerciales: respuestas a objeciones de precio, timing, competencia o riesgo.
- Elaboracion de propuestas y borradores de comunicaciones de venta (correos, resumenes de valor, siguientes pasos).
- Movimientos con partners, canales y distribuidores (channel/distributor motions), segun la descripcion del autor.
- Soporte de conversaciones multiturno con prompts largos gracias a los 32.768 tokens de contexto.
- Idiomas: unicamente ingles. No hay soporte multilingue declarado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el pipeline declarado es text-generation.

## Casos de uso

- Cualificacion automatizada de leads entrantes: el modelo puede mantener una conversacion multiturno con un prospecto, aplicar un marco de cualificacion y devolver un resumen estructurado con encaje, presupuesto y siguientes pasos. Es adecuado por su especializacion en ventas B2B y por caber en hardware local, lo que permite procesar datos de clientes sin enviarlos a una API externa.
- Asistente interno para comerciales durante llamadas: integrado en una extension o herramienta de escritorio, sugiere respuestas a objeciones en tiempo real a partir del historial de la conversacion, apoyandose en la ventana de 32.768 tokens para mantener el contexto de la cuenta.
- Generacion de propuestas comerciales personalizadas: a partir de notas de reunion y datos de la cuenta, produce un borrador de propuesta con alcance, valor y condiciones, que el equipo comercial revisa antes de enviar. El coste marginal de inferencia es muy bajo al ejecutarse en una unica GPU de consumo.
- Preparacion de materiales para reuniones con partners y distribuidores: redaccion de agendas, terminos de colaboracion y argumentarios adaptados a cada tipo de canal, un caso de uso que la model card cita explicitamente como objetivo del ajuste.
- Formacion y entrenamiento de equipos de ventas: simulacion de escenarios de negociacion y objeciones con retroalimentacion, desplegable en local para cada miembro del equipo sin coste por token.
- Clasificacion y enrutado de correos comerciales: al ser un modelo de ~1,2 B, permite procesar volumenes altos de mensajes en una sola GPU, clasificando intencion (interes, objecion, solicitud de precio) y generando respuestas sugeridas.
- Despliegue en edge o en portatiles: con cuantizaciones de 0,57 a 1,19 GB, puede ejecutarse en un portatil sin GPU dedicada mediante llama.cpp o LM Studio, util para demos comerciales sin conectividad.

## Benchmarks y rendimiento

La model card publica unicamente una evaluacion por rubrica propia del autor (denominada "Rubric overall"), sin detallar en esta pagina los benchmarks empleados. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Modelo | Rubrica overall |
|---|---:|
| Base (LiquidAI/LFM2.5-1.2B-Instruct) | 87,9 % |
| Fine-tune (tanpo-deals) | 95,2 % |
| Delta | +7,3 puntos porcentuales |

Advertencias sobre esta tabla: la metodologia completa esta en la model card del modelo fusionado (d4rkninja/tanpo-deals) y los artefactos en su carpeta evaluation; la cuantizacion puede alterar ligeramente el comportamiento respecto a los pesos fusionados en BF16. No se dispone de comparaciones con otros modelos en esta misma rubrica.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamano de archivo publicado; cifras orientativas, sin incluir el cache KV): Q3_K_M 573 MB, Q4_K_S 668 MB, Q4_K_M 697 MB, Q5_K_S 787 MB, Q5_K_M 804 MB, Q8_0 1189 MB.
- Con contexto completo de 32.768 tokens, hay que sumar el cache KV, cuyo tamano exacto no esta disponible. En la practica conviene reservar entre 1,5 y 2,5 GB de VRAM para las cuantizaciones Q4 y Q5 con contextos largos.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones Q4_K_M y superiores. Las cuantizaciones Q8_0 y los contextos muy largos se benefician de 6-8 GB.
- GPU de datacenter: A100, H100 o L40S no son necesarias para este tamano; se usarian solo para servir muchas replicas en paralelo.
- Ejecucion en CPU: viable con llama.cpp en las cuantizaciones Q3 y Q4; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp y LM Studio, con una build que soporte la arquitectura LFM2. Otros runtimes compatibles con GGUF (por ejemplo, Ollama si admite la arquitectura) podrian funcionar, aunque no se confirman en la informacion disponible. vLLM o TGI requeririan los pesos fusionados en safetensors (d4rkninja/tanpo-deals), no el GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, al tratarse de un modelo de ~1,2 B en cuantizacion Q4, la generacion en GPU de consumo suele situarse por encima de las decenas de tokens por segundo, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentacion publica y no de la informacion proporcionada en esta ficha; conviene verificarlos antes de tomar decisiones. No hay resultados de benchmarks comparables publicados para ninguno de ellos en este contexto.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Benchmarks comparables |
|---|---|---|---|---|---|
| tanpo-deals-GGUF | ~1,17 B | 32.768 | other (hereda LFM2.5) | GGUF, safetensors y LoRA en HuggingFace | No disponible |
| LiquidAI/LFM2.5-1.2B-Instruct | ~1,17 B | 32.768 | Licencia de Liquid AI | Safetensors en HuggingFace | No disponible |
| Otros especialistas Tanpo (marketing, product, hiring, fundraising) | ~1,17 B | 32.768 | other (hereda LFM2.5) | GGUF, safetensors y LoRA | No disponible |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 | Apache-2.0 | Safetensors y GGUF | No disponible |
| Llama-3.2-1B-Instruct | 1,23 B | 128.000 | Licencia comunitaria de Llama 3.2 | Safetensors y GGUF | No disponible |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Apache-2.0 | Safetensors y GGUF | No disponible |

Frente a estos modelos generalistas, tanpo-deals no compite en amplitud de capacidades sino en especializacion: su ventaja es el ajuste de dominio en ventas B2B y su desventaja es el soporte exclusivo de ingles y una licencia "other" que no es Apache-2.0.

## Limitaciones y advertencias

- Idioma: el modelo solo esta declarado para ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas, y el ajuste de dominio se ha hecho presumiblemente sobre datos en ingles.
- Dominio muy estrecho: esta especializado en ventas, alianzas y negociacion. Fuera de ese ambito es previsible que rinda peor que el modelo base o que modelos generalistas del mismo tamano.
- Riesgo de alucinacion: al ser un modelo de ~1,2 B, la generacion de cifras, condiciones contractuales, nombres de clientes o terminos de partnership puede ser incorrecta. La propia model card exige revision humana de contratos, compromisos de precios y condiciones con partners.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos en la informacion disponible. Al ser un ajuste sobre un modelo base pequeno y con datos de dominio no publicados, no se puede descartar la reproduccion de sesgos presentes en el corpus de entrenamiento.
- Restricciones de licencia: la licencia es "other" y hereda las obligaciones de la licencia upstream de Liquid AI (LFM2.5). No se debe asumir que Apache-2.0 cubre los pesos fusionados. Es obligatorio revisar la licencia de Liquid AI antes de redistribuir el modelo o derivados, y antes de cualquier uso comercial.
- No es asesoramiento legal, fiscal ni financiero, segun indica el propio autor.
- Efecto de la cuantizacion: las cuantizaciones GGUF pueden variar ligeramente el comportamiento respecto a los pesos fusionados en BF16. Para tareas sensibles conviene validar con la version fusionada.
- Compatibilidad de runtime: requiere una build de llama.cpp (o herramienta equivalente) que soporte la arquitectura LFM2. No todas las versiones lo hacen.
- Validacion comunitaria muy limitada: 30 descargas y 0 likes en el momento de la consulta. No hay retroalimentacion independiente ni resultados reproducidos por terceros.
- Metodologia de evaluacion opaca: la mejora de +7,3 puntos se mide con una rubrica propia cuyos detalles no se recogen en esta ficha, lo que impide comparar con modelos de terceros.
- Uso responsable: prohibido explicitamente para fraude, engano o acceso no autorizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d4rkninja/tanpo-deals-GGUF
- Modelo fusionado (Transformers): https://huggingface.co/d4rkninja/tanpo-deals
- Adaptador LoRA: https://huggingface.co/d4rkninja/tanpo-deals-LoRA
- Artefactos de evaluacion del modelo fusionado: https://huggingface.co/d4rkninja/tanpo-deals/tree/main/evaluation
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Hub id de Unsloth usado para la carga: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Coleccion de especialistas de dominio Tanpo: https://huggingface.co/collections/d4rkninja/tanpo-domain-specialists-6aaccdb3985768f6dad8449b
- Otros especialistas de la familia: https://huggingface.co/d4rkninja/tanpo-marketing, https://huggingface.co/d4rkninja/tanpo-product, https://huggingface.co/d4rkninja/tanpo-hiring, https://huggingface.co/d4rkninja/tanpo-fundraising
- Los resultados de la busqueda web realizada no contienen enlaces relevantes sobre este modelo (los resultados recibidos tratan sobre WhatsApp y no guardan relacion con la ficha).
- Paper o blog tecnico del autor: no disponible en la informacion proporcionada.
